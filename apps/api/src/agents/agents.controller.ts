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
}
