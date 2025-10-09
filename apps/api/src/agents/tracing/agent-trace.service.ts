import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

const TRACE_SELECT = {
  id: true,
  agentId: true,
  runId: true,
  status: true,
  grade: true,
  feedback: true,
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

  updateTraceInput(id: string, runId: string, input: unknown) {
    return this.prisma.agentTrace
      .update({
        where: { id },
        data: {
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
      feedback: string | null
      evaluator: string | null
      traceUrl: string | null
      output: unknown
    }>
  ) {
    const updateData = {
      status: data.status,
      grade: data.grade,
      feedback: data.feedback,
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

  async getTraceById(id: string) {
    const trace = await this.prisma.agentTrace.findUnique({
      where: { id },
      select: TRACE_SELECT
    })

    return trace ? this.deserialize(trace) : null
  }

  async findTraceForAgent(agentId: string, identifier: { traceId?: string; runId?: string }) {
    const where: Prisma.AgentTraceWhereInput = { agentId }

    if (identifier.traceId) {
      where.id = identifier.traceId
    }

    if (identifier.runId) {
      where.runId = identifier.runId
    }

    const trace = await this.prisma.agentTrace.findFirst({
      where,
      select: TRACE_SELECT
    })

    return trace ? this.deserialize(trace) : null
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
  feedback: string | null
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
