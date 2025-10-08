import { Controller, Get } from '@nestjs/common'
import { MetricsService } from './metrics/metrics.service'

@Controller('agents')
export class AgentsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  findAll() {
    return this.metricsService.listAgents()
  }
}
