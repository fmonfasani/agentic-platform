import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { MetricsService } from './metrics.service'
import { AgentsService } from '../agents.service'

@Controller('agents/:id')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly agentsService: AgentsService,
  ) {}

  @Get('metrics')
  getMetrics(@Param('id') id: string) {
    return this.metricsService.getMetrics(id)
  }

  @Post('use')
  async incrementUses(
    @Param('id') id: string,
    @Body() body: { prompt?: string } | undefined,
  ) {
    if (body?.prompt !== undefined) {
      const [response] = await Promise.all([
        this.agentsService.runAgent(id, body),
        this.metricsService.increment(id, 'uses'),
      ])

      return response
    }

    return this.metricsService.increment(id, 'uses')
  }

  @Post('download')
  incrementDownloads(@Param('id') id: string) {
    return this.metricsService.increment(id, 'downloads')
  }

  @Post('reward')
  incrementRewards(@Param('id') id: string) {
    return this.metricsService.increment(id, 'rewards')
  }

  @Post('rate')
  rateAgent(@Param('id') id: string, @Body() body: { stars?: number }) {
    return this.metricsService.rate(id, body?.stars ?? 0)
  }
}
