import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

const TRACE_SELECT = {
  id: true,
  agentId: true,
  runId: true,
  status: true,
  grade: true,
  evaluator: true,
  traceUrl: true,
  input: true,
  output: true,
  createdAt: true
} as const

@Injectable()
export class AgentTraceService {
  constructor(private readonly prisma: PrismaService) {}

  createTrace(agentId: string, runId: string, input: unknown) {
    return this.prisma.agentTrace
      .create({
        data: {
          agentId,
          runId,
          status: 'pending',
          input: this.stringify(input)
        },
        select: TRACE_SELECT
      })
      .then((trace) => this.deserialize(trace))
  }

  completeTrace(
    id: string,
    data: Partial<{
      status: string
      grade: number | null
      evaluator: string | null
      traceUrl: string | null
      output: unknown
    }>
  ) {
    const updateData = {
      status: data.status,
      grade: data.grade,
      evaluator: data.evaluator,
      traceUrl: data.traceUrl,
      output: data.output !== undefined ? this.stringify(data.output) : undefined
    }

    return this.prisma.agentTrace
      .update({
        where: { id },
        data: updateData,
        select: TRACE_SELECT
      })
      .then((trace) => this.deserialize(trace))
  }

  listTracesForAgent(agentId: string, take = 20) {
    return this.prisma.agentTrace
      .findMany({
        where: { agentId },
        select: TRACE_SELECT,
        orderBy: { createdAt: 'desc' },
        take
      })
      .then((traces) => traces.map((trace) => this.deserialize(trace)))
  }

  private stringify(value: unknown) {
    if (value === undefined || value === null) {
      return null
    }

    try {
      return JSON.stringify(value)
    } catch {
      return null
    }
  }

  private deserialize(trace: TraceRecord): AgentTraceSummary {
    return {
      ...trace,
      input: this.parse(trace.input),
      output: this.parse(trace.output)
    }
  }

  private parse(value: string | null) {
    if (!value) {
      return null
    }

    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
}

type TraceRecord = {
  id: string
  agentId: string
  runId: string
  status: string
  grade: number | null
  evaluator: string | null
  traceUrl: string | null
  input: string | null
  output: string | null
  createdAt: Date
}

export type AgentTraceSummary = Omit<TraceRecord, 'input' | 'output'> & {
  input: unknown
  output: unknown
}
