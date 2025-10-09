import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AgentRunnerService } from './agent-runner.service';

@Controller('agents/:id')
export class AgentRunController {
  constructor(private readonly runnerService: AgentRunnerService) {}

  @Post('run')
  async runAgent(
    @Param('id') id: string,
    @Body() body: Parameters<AgentRunnerService['run']>[1]
  ) {
    const payload = { ...(body ?? {}) } as Parameters<AgentRunnerService['run']>[1];

    if (!payload.input && (!payload.messages || payload.messages.length === 0)) {
      payload.input = 'Ejecutar análisis predeterminado';
    }

    return this.runnerService.run(id, payload);
  }

  @Get('traces')
  async listTraces(@Param('id') id: string, @Query('take') take?: string) {
    const parsed = take ? Number.parseInt(take, 10) : NaN;
    const amount = Number.isNaN(parsed) ? 20 : parsed;

    return this.runnerService.listTraces(id, amount);
  }
}
