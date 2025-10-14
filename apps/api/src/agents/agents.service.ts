import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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
};

type AgentSummaryWithType = AgentSummaryRow & { type: AgentType };

type SDKAgentMetadata = {
  name?: string
  area?: string
  description?: string | null
  instructions?: string | null
  model?: string
}

type CreateAgentPayload = {
  mode: 'sdk' | 'visual'
  code: string
  metadata?: SDKAgentMetadata
}

type AgentCreationResponse = {
  message: string
  agent: Awaited<ReturnType<PrismaService['agent']['create']>>
  assistant_id: string | null
  assistant_name: string | null
}

@Injectable()
export class AgentsService {
  private client: OpenAI | null
  private readonly logger = new Logger(AgentsService.name)

  constructor(private readonly prisma: PrismaService) {
    this.client = apiConfig.openai.apiKey ? new OpenAI({ apiKey: apiConfig.openai.apiKey }) : null;
  }

  async createAgent({ mode, code, metadata }: CreateAgentPayload): Promise<AgentCreationResponse> {
    const normalizedMode = mode === 'visual' ? 'sdk' : mode

    if (normalizedMode !== 'sdk') {
      throw new BadRequestException('Modo no soportado');
    }

    const parsed = parseAgentSource(code);
    const combined: Required<SDKAgentMetadata> = {
      name: metadata?.name ?? parsed.name ?? 'Agente SDK',
      area: metadata?.area ?? parsed.area ?? 'SDK Agents',
      description:
        metadata?.description ?? parsed.description ?? parsed.instructions ?? 'Agente creado desde el SDK',
      instructions: metadata?.instructions ?? parsed.instructions ?? null,
      model: metadata?.model ?? parsed.model ?? 'gpt-4o',
    };

    if (!this.client) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured. Unable to create OpenAI assistant for the agent.',
      );
    }

    let assistantId: string | null = null;
    let assistantName: string | null = null;

    try {
      const assistant = await this.client.beta.assistants.create({
        name: combined.name,
        instructions: combined.instructions ?? undefined,
        model: combined.model,
        tools: [{ type: 'code_interpreter' }],
      });
      assistantId = assistant.id;
      assistantName = assistant.name;
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Failed to create assistant via OpenAI: ${details}`, error instanceof Error ? error.stack : undefined)
      throw new BadRequestException('Failed to create assistant via OpenAI. Please try again later.');
    }

    const agent = await this.prisma.agent.create({
      data: {
        name: combined.name,
        area: combined.area,
        description: combined.description,
        instructions: combined.instructions,
        model: combined.model,
        openaiAgentId: assistantId,
      },
      include: { traces: true, workflows: true },
    });

    return {
      message: 'Agente creado y almacenado correctamente',
      agent,
      assistant_id: assistantId,
      assistant_name: assistantName,
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

  async listAgents(): Promise<AgentSummaryWithType[]> {
    const agents = await this.prisma.agent.findMany({
      select: AGENT_SUMMARY_SELECT,
      orderBy: { name: 'asc' },
    });

    return agents.map((agent:any) => ({ ...agent, type: inferAgentType(agent) }));
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
    metadata: Partial<Pick<AgentSummaryRow, 'openaiAgentId' | 'instructions' | 'model'>>,
  ) {
    const agent = await this.prisma.agent.update({
      where: { id },
      data: metadata,
      select: AGENT_SUMMARY_SELECT,
    });

    return agent;
  }
}

type ParsedAgentSource = {
  name?: string;
  area?: string;
  description?: string | null;
  instructions?: string | null;
  model?: string;
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

  const name = sanitize(getMatch(/name\s*:\s*["'`]([\s\S]*?)["'`]/i));
  const instructions = sanitize(getMatch(/instructions\s*:\s*["'`]([\s\S]*?)["'`]/i));
  const model = sanitize(getMatch(/model\s*:\s*["'`]([\s\S]*?)["'`]/i));
  const area =
    sanitize(getMatch(/area\s*:\s*["'`]([\s\S]*?)["'`]/i)) ?? sanitize(getMatch(/\/\/\s*area\s*:\s*([^\n]+)/i));
  const description =
    sanitize(getMatch(/description\s*:\s*["'`]([\s\S]*?)["'`]/i)) ??
    sanitize(getMatch(/\/\/\s*description\s*:\s*([^\n]+)/i)) ??
    instructions ?? null;

  return { name, area, description, instructions, model };
}
