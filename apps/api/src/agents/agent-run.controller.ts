import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AgentRunnerService } from './agent-runner.service'
import { AgentUploadService, AgentUploadFile } from './agent-upload.service'
import { AgentTraceService } from './tracing/agent-trace.service'
import { AgentEvalService } from './agent-eval.service'

@Controller('agents/:id')
export class AgentRunController {
  constructor(
    private readonly runnerService: AgentRunnerService,
    private readonly uploadService: AgentUploadService,
    private readonly traceService: AgentTraceService,
    private readonly evalService: AgentEvalService
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.CREATED)
  async runAgent(
    @Param('id') id: string,
    @Body() body: Parameters<AgentRunnerService['run']>[1]
  ) {
    const payload = { ...(body ?? {}) } as Parameters<AgentRunnerService['run']>[1];

    if (!payload.input && (!payload.messages || payload.messages.length === 0)) {
      payload.input = 'Ejecutar análisis predeterminado';
    }

    return this.runnerService.run(id, payload);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndRun(@Param('id') id: string, @UploadedFile() file: AgentUploadFile) {
    return this.uploadService.handleUpload(id, file);
  }

  @Get('traces')
  async listTraces(@Param('id') id: string, @Query('take') take?: string) {
    const parsed = take ? Number.parseInt(take, 10) : NaN;
    const amount = Number.isNaN(parsed) ? 20 : parsed;

    return this.runnerService.listTraces(id, amount);
  }

  @Post('eval')
  async evaluateTrace(
    @Param('id') agentId: string,
    @Body()
    body: {
      traceId?: string
      runId?: string
    }
  ) {
    const traceIdentifier = body ?? {}

    if (!traceIdentifier.traceId && !traceIdentifier.runId) {
      throw new BadRequestException('traceId or runId is required to evaluate a trace.')
    }

    const existingTrace = traceIdentifier.traceId
      ? await this.traceService.getTraceById(traceIdentifier.traceId)
      : await this.traceService.findTraceForAgent(agentId, {
          traceId: traceIdentifier.traceId,
          runId: traceIdentifier.runId
        })

    if (!existingTrace || existingTrace.agentId !== agentId) {
      throw new NotFoundException('Trace not found for the requested agent.')
    }

    const evaluation = await this.evalService.evaluateTrace(existingTrace.id)

    const updatedTrace = evaluation
      ? await this.traceService.getTraceById(existingTrace.id)
      : existingTrace

    return {
      traceId: existingTrace.id,
      evaluation: evaluation ?? null,
      trace: updatedTrace
    }
  }
}
