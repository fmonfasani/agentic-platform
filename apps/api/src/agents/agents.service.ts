import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { inferAgentType, AgentType } from './agent-type';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { apiConfig } from '../config/api.config';

const AGENT_SUMMARY_SELECT = {
  id: true,
  name: true,
  area: true,
  uses: true,
  downloads: true,
  rewards: true,
  stars: true,
  votes: true,
  openaiAgentId: true,
  model: true,
  instructions: true,
  mode: true,
  rules: true,
} as const;

type AgentSummaryRow = {
  id: string;
  name: string;
  area: string;
  uses: number;
  downloads: number;
  rewards: number;
  stars: number;
  votes: number;
  openaiAgentId: string | null;
  model: string | null;
  instructions: string | null;
  mode: string;
  rules: string | null;
};

type AgentSummaryWithType = AgentSummaryRow & { type: AgentType };

type SDKAgentMetadata = {
  name?: string;
  area?: string;
  description?: string | null;
  instructions?: string | null;
  model?: string;
  mode?: AgentMode;
  rules?: DeterministicRule[] | null;
};

type CreateAgentPayload = {
  mode: 'sdk' | 'visual';
  code: string;
  metadata?: SDKAgentMetadata;
};

type AgentCreationResponse = {
  message: string;
  agent: Awaited<ReturnType<PrismaService['agent']['create']>>;
  assistant_id: string | null;
  assistant_name: string | null;
};

type AgentMode = 'llm' | 'deterministic';

type DeterministicRule = {
  trigger: string;
  response: string;
};

@Injectable()
export class AgentsService {
  private client: OpenAI | null;
  private readonly logger = new Logger(AgentsService.name);

  constructor(private readonly prisma: PrismaService) {
    this.client = apiConfig.openai.apiKey
      ? new OpenAI({ apiKey: apiConfig.openai.apiKey })
      : null;
  }

  async createAgent({
    mode,
    code,
    metadata,
  }: CreateAgentPayload): Promise<AgentCreationResponse> {
    const normalizedMode = mode === 'visual' ? 'sdk' : mode;

    if (normalizedMode !== 'sdk') {
      throw new BadRequestException('Modo no soportado');
    }

    const parsed = parseAgentSource(code);
    const combined: Required<SDKAgentMetadata> = {
      name: metadata?.name ?? parsed.name ?? 'Agente SDK',
      area: metadata?.area ?? parsed.area ?? 'SDK Agents',
      description:
        metadata?.description ??
        parsed.description ??
        parsed.instructions ??
        'Agente creado desde el SDK',
      instructions: metadata?.instructions ?? parsed.instructions ?? null,
      model: metadata?.model ?? parsed.model ?? 'gpt-4o',
      mode: metadata?.mode ?? parsed.mode ?? 'llm',
      rules: metadata?.rules ?? parsed.rules ?? null,
    };

    if (!this.client) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configurada. No se puede crear el assistant.',
      );
    }

    let assistant: Awaited<
      ReturnType<typeof this.client.beta.assistants.create>
    > | null = null;

    try {
      assistant = await this.client.beta.assistants.create({
        name: combined.name,
        instructions: combined.instructions ?? undefined,
        model: combined.model,
        tools: [{ type: 'code_interpreter' }],
      });
    } catch (error) {
      const details =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create assistant via OpenAI: ${details}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        'Failed to create assistant via OpenAI. Please try again later.',
      );
    }

    const agent = await this.prisma.agent.create({
      data: {
        name: combined.name,
        area: combined.area,
        description: combined.description,
        instructions: combined.instructions,
        model: combined.model,
        mode: combined.mode,
        rules: combined.rules ? JSON.stringify(combined.rules) : null,
        openaiAgentId: assistant.id,
      },
      include: { traces: true, workflows: true },
    });

    return {
      message: 'Agente creado y almacenado correctamente',
      agent,
      assistant_id: assistant.id,
      assistant_name: assistant.name ?? null,
    };
  }

  async findAll() {
    return this.prisma.agent.findMany({
      include: { workflows: true, traces: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.agent.findUnique({
      where: { id },
      include: { workflows: true, traces: true },
    });
  }

  async runAgent(
    id: string,
    body: { prompt?: string } | undefined,
  ): Promise<{ output: string }> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        instructions: true,
        model: true,
        mode: true,
        rules: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.mode === 'deterministic') {
      const input = body?.prompt ?? '';
      const rulesFromDb = this.normalizeDeterministicRules(agent.rules);
      const defaultRules: DeterministicRule[] = [
        { trigger: 'informe', response: '📄 Generando informe estructurado...' },
        { trigger: 'reporte', response: '📊 Preparando reporte detallado...' },
        { trigger: 'analisis', response: '🧠 Analizando datos...' },
      ];

      const rules = rulesFromDb.length > 0 ? rulesFromDb : defaultRules;
      const normalizedInput = input.toLowerCase();
      const matchedRule = rules.find((rule) =>
        normalizedInput.includes(rule.trigger.toLowerCase()),
      );

      return {
        output: matchedRule
          ? matchedRule.response
          : '⚙️ No se encontró ninguna coincidencia en las reglas.',
      };
    }

    if (!this.client) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configurada. No se puede ejecutar el agente.',
      );
    }

    const prompt = body?.prompt ?? '';

    try {
      const response = await this.client.responses.create({
        model: agent.model ?? 'gpt-4o-mini',
        input: prompt,
        instructions: agent.instructions ?? undefined,
      });

      const output = this.extractOutputText(response);

      return {
        output,
      };
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to execute agent via OpenAI: ${details}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        'Failed to execute agent via OpenAI. Please try again later.',
      );
    }
  }

  async listAgents(): Promise<AgentSummaryWithType[]> {
    const agents = await this.prisma.agent.findMany({
      select: AGENT_SUMMARY_SELECT,
      orderBy: { name: 'asc' },
    });

    return agents.map((agent: any) => ({
      ...agent,
      type: inferAgentType(agent),
    }));
  }

  async getAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      select: {
        ...AGENT_SUMMARY_SELECT,
        description: true,
        updatedAt: true,
        traces: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return { ...agent, type: inferAgentType(agent) };
  }

  async updateAgentAgentKitMetadata(
    id: string,
    metadata: Partial<
      Pick<AgentSummaryRow, 'openaiAgentId' | 'instructions' | 'model'>
    >,
  ) {
    const agent = await this.prisma.agent.update({
      where: { id },
      data: metadata,
      select: AGENT_SUMMARY_SELECT,
    });

    return agent;
  }

  private normalizeDeterministicRules(rules: string | null): DeterministicRule[] {
    if (!rules) {
      return [];
    }

    try {
      const parsed = JSON.parse(rules) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((rule): rule is DeterministicRule => {
        if (!rule || typeof rule !== 'object') {
          return false;
        }

        const candidate = rule as DeterministicRule;
        return (
          typeof candidate.trigger === 'string' &&
          typeof candidate.response === 'string'
        );
      });
    } catch (error) {
      this.logger.warn(
        'Failed to parse deterministic rules from database payload.',
        error instanceof Error ? error.message : undefined,
      );
      return [];
    }
  }

  private extractOutputText(response: any): string {
    if (typeof response?.output_text === 'string') {
      return response.output_text;
    }

    if (Array.isArray(response?.output)) {
      const text = response.output
        .flatMap((item: any) => {
          if (item?.type === 'output_text' && Array.isArray(item?.text)) {
            return item.text
              .filter((entry: any) => typeof entry?.value === 'string')
              .map((entry: any) => entry.value as string);
          }

          if (item?.type === 'message' && Array.isArray(item?.content)) {
            return item.content
              .filter((entry: any) => entry?.type === 'output_text')
              .flatMap((entry: any) =>
                Array.isArray(entry?.text)
                  ? entry.text
                      .filter((textEntry: any) =>
                        typeof textEntry?.value === 'string',
                      )
                      .map((textEntry: any) => textEntry.value as string)
                  : [],
              );
          }

          return [];
        })
        .join('');

      if (text) {
        return text;
      }
    }

    return '';
  }
}

type ParsedAgentSource = {
  name?: string;
  area?: string;
  description?: string | null;
  instructions?: string | null;
  model?: string;
  mode?: AgentMode;
  rules?: DeterministicRule[] | null;
};

function parseAgentSource(code: string | undefined): ParsedAgentSource {
  if (!code) {
    return {};
  }

  const getMatch = (pattern: RegExp) => {
    const match = code.match(pattern);
    return match?.[1]?.trim();
  };

  const sanitize = (value?: string | null) => {
    if (!value) return value ?? undefined;
    return value.replace(/[,;]+$/, '').trim();
  };

  const name = sanitize(
    getMatch(/name\s*:\s*["'`]([\s\S]*?)["'`]/i),
  );
  const instructions = sanitize(
    getMatch(/instructions\s*:\s*["'`]([\s\S]*?)["'`]/i),
  );
  const model = sanitize(
    getMatch(/model\s*:\s*["'`]([\s\S]*?)["'`]/i),
  );
  const rawMode = sanitize(
    getMatch(/mode\s*:\s*["'`]([\s\S]*?)["'`]/i),
  );
  const normalizedMode = rawMode
    ? (rawMode.toLowerCase() as AgentMode)
    : undefined;
  const mode =
    normalizedMode && ['llm', 'deterministic'].includes(normalizedMode)
      ? normalizedMode
      : undefined;
  const rulesMatch = getMatch(/rules\s*:\s*(\[[\s\S]*?\])/i);
  let rules: DeterministicRule[] | null = null;

  if (rulesMatch) {
    try {
      const parsedRules = JSON.parse(rulesMatch) as unknown;
      if (Array.isArray(parsedRules)) {
        const validRules = parsedRules.filter(
          (rule): rule is DeterministicRule =>
            !!rule &&
            typeof rule === 'object' &&
            typeof (rule as DeterministicRule).trigger === 'string' &&
            typeof (rule as DeterministicRule).response === 'string',
        );

        if (validRules.length > 0) {
          rules = validRules;
        }
      }
    } catch (error) {
      console.warn('Failed to parse deterministic rules from agent source:', error);
    }
  }
  const area =
    sanitize(
      getMatch(/area\s*:\s*["'`]([\s\S]*?)["'`]/i),
    ) ?? sanitize(getMatch(/\/\/\s*area\s*:\s*([^\n]+)/i));
  const description =
    sanitize(
      getMatch(/description\s*:\s*["'`]([\s\S]*?)["'`]/i),
    ) ??
    sanitize(getMatch(/\/\/\s*description\s*:\s*([^\n]+)/i)) ??
    instructions ??
    null;

  return { name, area, description, instructions, model, mode, rules };
}
