import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AgentRunnerService, AgentRunPayload } from './agent-runner.service'
import { AgentsService } from './agents.service'

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService, private readonly runnerService: AgentRunnerService) {}

  @Get()
  findAll() {
    return this.agentsService.listAgents()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentsService.getAgent(id)
  }

  @Get(':id/traces')
  listTraces(@Param('id') id: string, @Query('take') take?: string) {
    const parsed = take ? Number.parseInt(take, 10) : NaN
    const amount = Number.isNaN(parsed) ? undefined : parsed
    return this.runnerService.listTraces(id, amount)
  }

  @Post(':id/run')
  runAgent(@Param('id') id: string, @Body() payload: AgentRunPayload) {
    return this.runnerService.run(id, payload)
  }

  @Post(':id/chat-session')
  createChatSession(@Param('id') id: string) {
    return this.runnerService.createChatSession(id)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.agentsService.findById(id)
  }

  @Post(':id/use')
  incrementUses(@Param('id') id: string) {
    return this.agentsService.incrementMetric(id, 'uses')
  }

  @Post(':id/download')
  incrementDownloads(@Param('id') id: string) {
    return this.agentsService.incrementMetric(id, 'downloads')
  }

  @Post(':id/reward')
  incrementRewards(@Param('id') id: string) {
    return this.agentsService.incrementMetric(id, 'rewards')
  }

  @Post(':id/rate')
  rateAgent(@Param('id') id: string, @Body() body: { stars?: number }) {
    return this.agentsService.rateAgent(id, body?.stars ?? 0)
  }
  @Post(':id/use')
  async incrementUses(@Param('id') id: string) {
  return this.agentsService.incrementMetric(id, 'uses');
  }

  @Post(':id/download')
  async incrementDownloads(@Param('id') id: string) {
    return this.agentsService.incrementMetric(id, 'downloads');
  }

  @Post(':id/reward')
  async incrementRewards(@Param('id') id: string) {
    return this.agentsService.incrementMetric(id, 'rewards');
  }

  @Post(':id/rate')
  async rateAgent(@Param('id') id: string, @Body() body: { stars: number }) {
    return this.agentsService.rateAgent(id, body.stars);
  }
  @Post(':id/run')
  async runAgent(
    @Param('id') id: string,
    @Body() body: { input?: string; action?: string }
  ) {
    // por ahora podés dejarlo mockeado o conectar con tu service real
    return this.agentsService.runWorkflow(id, body.action, body.input);
  }

}
