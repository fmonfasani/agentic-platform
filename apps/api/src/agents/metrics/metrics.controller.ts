import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { MetricsService } from './metrics.service'

@Controller('agents/:id')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('use')
  use(@Param('id') id: string) {
    return this.metricsService.increment(id, 'uses')
  }

  @Post('download')
  download(@Param('id') id: string) {
    return this.metricsService.increment(id, 'downloads')
  }

  @Post('reward')
  reward(@Param('id') id: string) {
    return this.metricsService.increment(id, 'rewards')
  }

  @Post('rate')
  rate(@Param('id') id: string, @Body() body: { stars: number }) {
    return this.metricsService.rate(id, body.stars)
  }

  @Get('metrics')
  metrics(@Param('id') id: string) {
    return this.metricsService.getMetrics(id)
  }
}
