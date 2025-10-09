import { Injectable } from '@nestjs/common'
import { AgentsService } from './agents.service'
import { AgentTraceService, AgentTraceSummary } from './tracing/agent-trace.service'
import { PrismaService } from '../prisma/prisma.service'

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

type RunAgentDto = {
  input?: string
  messages?: ChatMessage[]
  metadata?: Record<string, unknown>
}

@Injectable()
export class AgentRunnerService {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly prisma: PrismaService,
    private readonly traceService: AgentTraceService
  ) {}

  async run(agentId: string, payload: RunAgentDto) {
    const agent = await this.agentsService.getAgent(agentId)
    const inputMessages = this.normalizeMessages(payload, agent.instructions)
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const assistantMessage = this.createAssistantMessage(agent.name, agent.area)
    const transcript = [...inputMessages, assistantMessage]

    const serialize = (value: unknown) => {
      try {
        return JSON.stringify(value)
      } catch {
        return null
      }
    }

    const traceRecord = await this.prisma.agentTrace.create({
      data: {
        agentId,
        runId,
        status: 'completed',
        input: serialize(inputMessages),
        output: serialize(transcript)
      }
    })

    const trace: AgentTraceSummary = {
      ...traceRecord,
      input: inputMessages,
      output: transcript
    }

    return {
      runId,
      status: 'completed' as const,
      agentId,
      message: assistantMessage.content,
      transcript,
      trace
    }
  }

  async createChatSession(agentId: string) {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      agentId,
      status: 'simulated'
    }
  }

  async listTraces(agentId: string, take = 20): Promise<AgentTraceSummary[]> {
    return this.traceService.listTracesForAgent(agentId, take)
  }

  private normalizeMessages(payload: RunAgentDto, instructions?: string | null): ChatMessage[] {
    const baseMessages = payload.messages ? [...payload.messages] : []
    if (payload.input) {
      baseMessages.push({ role: 'user', content: payload.input })
    }

    if (!instructions) {
      return baseMessages
    }

    const hasSystemMessage = baseMessages.some((message) => message.role === 'system')
    if (hasSystemMessage) {
      return baseMessages
    }

    return [{ role: 'system', content: instructions }, ...baseMessages]
  }

  private createAssistantMessage(agentName: string, agentArea?: string | null): ChatMessage {
    const areaText = agentArea ? ` especializado en ${agentArea}` : ''
    const content = `Hola, soy ${agentName}${areaText}. Esta es una respuesta simulada generada por el entorno de desarrollo.`
    return { role: 'assistant', content }
  }
}

export type AgentRunPayload = RunAgentDto
export type AgentRunMessage = ChatMessage
