import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AgentsService } from './agents.service'

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll() {
    return this.agentsService.findAll()
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
