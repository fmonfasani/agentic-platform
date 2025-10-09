import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Controller('agents/:id')
export class AgentRunController {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private readonly prisma: PrismaService) {}

  @Post('run')
  async runAgent(
    @Param('id') id: string,
    @Body() body: { input?: string }
  ) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent || !agent.openaiAgentId) {
      return { error: 'Agente no encontrado o sin ID de OpenAI' };
    }

    try {
      const agentsApi = (this.openai as any).agents;
      const run = await agentsApi.runs.create({
        agent_id: agent.openaiAgentId,
        input: body?.input ?? 'Ejecutar análisis predeterminado',
      });

      const trace = await this.prisma.agentTrace.create({
        data: {
          agentId: id,
          runId: run.id,
          status: run.status,
          grade: null,
          evaluator: 'auto',
          traceUrl: `https://platform.openai.com/agents/${agent.openaiAgentId}/runs/${run.id}`,
          input: body?.input ?? null,
          output: JSON.stringify(run.output ?? []),
        },
      });

      return { ok: true, run, trace };
    } catch (err) {
      const error = err as Error;
      // eslint-disable-next-line no-console
      console.error('❌ Error ejecutando agente:', error.message);
      return { error: error.message };
    }
  }

  @Get('traces')
  async listTraces(@Param('id') id: string, @Query('take') take?: string) {
    const parsed = take ? Number.parseInt(take, 10) : NaN;
    const amount = Number.isNaN(parsed) ? 20 : parsed;

    const traces = await this.prisma.agentTrace.findMany({
      where: { agentId: id },
      orderBy: { createdAt: 'desc' },
      take: amount,
    });

    return traces;
  }
}
