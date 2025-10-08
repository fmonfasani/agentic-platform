import { Controller, Get } from '@nestjs/common'
import { MetricsService } from './metrics/metrics.service'

@Controller('agents')
export class AgentsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  findAll() {
    return this.metricsService.listAgents()
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
}
