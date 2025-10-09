import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AgentRunnerService } from './agent-runner.service'
import { AgentRunController } from './agent-run.controller'
import { AgentUploadService } from './agent-upload.service'
import { AgentsController } from './agents.controller'
import { AgentsService } from './agents.service'
import { AgentEvalService } from './agent-eval.service'
import { AgentTraceService } from './tracing/agent-trace.service'
import { MetricsController } from './metrics/metrics.controller'
import { MetricsService } from './metrics/metrics.service'

@Module({
  controllers: [AgentsController, AgentRunController, MetricsController],
  providers: [
    AgentsService,
    MetricsService,
    AgentRunnerService,
    AgentUploadService,
    AgentTraceService,
    AgentEvalService,
    PrismaService
  ]
})
export class AgentsModule {}
