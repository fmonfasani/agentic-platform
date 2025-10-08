import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AgentsController } from './agents.controller'
import { MetricsController } from './metrics/metrics.controller'
import { MetricsService } from './metrics/metrics.service'

@Module({
  controllers: [AgentsController, MetricsController],
  providers: [MetricsService, PrismaService]
})
export class AgentsModule {}
