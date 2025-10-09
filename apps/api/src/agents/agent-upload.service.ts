import {
  BadRequestException,
  Injectable,
  UnsupportedMediaTypeException
} from '@nestjs/common'
import { pdf as parsePdf } from 'pdf-parse'
import { AgentRunnerService } from './agent-runner.service'
import { AgentTraceService } from './tracing/agent-trace.service'

export type AgentUploadFile = {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

@Injectable()
export class AgentUploadService {
  constructor(
    private readonly runnerService: AgentRunnerService,
    private readonly traceService: AgentTraceService
  ) {}

  async handleUpload(agentId: string, file?: AgentUploadFile) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.')
    }

    if (!file.mimetype?.includes('pdf')) {
      throw new UnsupportedMediaTypeException('Only PDF files are currently supported.')
    }

    let parsed
    try {
      parsed = await parsePdf(file.buffer)
    } catch (error) {
      throw new BadRequestException('Failed to process the uploaded PDF file.')
    }
    const extractedText = parsed.text?.trim()

    if (!extractedText) {
      throw new BadRequestException('The uploaded PDF did not contain extractable text.')
    }

    const runId = this.generateRunId()

    const trace = await this.traceService.createTrace(agentId, runId, {
      source: 'file-upload',
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString()
    })

    return this.runnerService.run(
      agentId,
      {
        input: extractedText,
        metadata: {
          source: 'file-upload',
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          traceId: trace.id
        }
      },
      { existingTraceId: trace.id, runId }
    )
  }

  private generateRunId() {
    return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  }
}
