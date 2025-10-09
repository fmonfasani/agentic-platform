import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { MetricsService } from './metrics.service'

@Controller('agents/:id')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  getMetrics(@Param('id') id: string) {
    return this.metricsService.getMetrics(id)
  }

  @Post('use')
  incrementUses(@Param('id') id: string) {
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
