import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { AgentsService } from './agents.service'
import { AgentTraceService, AgentTraceSummary } from './tracing/agent-trace.service'
import { AgentEvalService } from './agent-eval.service'

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

type RunAgentDto = {
  input?: string
  messages?: ChatMessage[]
  metadata?: Record<string, unknown>
}

type ToolCall = {
  id: string
  name: string
  input: Record<string, unknown>
}

type RunAgentOptions = {
  existingTraceId?: string
  runId?: string
}

@Injectable()
export class AgentRunnerService {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly traceService: AgentTraceService,
    private readonly evalService: AgentEvalService
  ) {}

  private client: { agents?: { create?: (input: unknown) => Promise<{ id: string }> } } | null = null
  private readonly defaultModel = 'gpt-4o-mini'

  async run(agentId: string, payload: RunAgentDto, options?: RunAgentOptions) {
    const agent = await this.agentsService.getAgent(agentId)
    const inputMessages = this.normalizeMessages(payload, agent.instructions)
    const runId = options?.runId ?? `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const trace = options?.existingTraceId
      ? await this.traceService.updateTraceInput(options.existingTraceId, runId, inputMessages)
      : await this.traceService.createTrace(agentId, runId, inputMessages)

    const assistantMessage = this.createAssistantMessage(agent.name, agent.area)
    const transcript = [...inputMessages, assistantMessage]

    const finalTrace = await this.traceService.completeTrace(trace.id, {
      status: 'completed',
      output: transcript
    })

    const evaluation = await this.evalService.evaluateTrace(finalTrace.id)

    const traceWithEvaluation: AgentTraceSummary = evaluation
      ? {
          ...finalTrace,
          grade: evaluation.grade,
          feedback: evaluation.feedback,
          evaluator: evaluation.evaluator
        }
      : finalTrace

    return {
      runId,
      status: 'completed' as const,
      agentId,
      message: assistantMessage.content,
      transcript,
      trace: traceWithEvaluation
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

  getOpenAIConfiguration() {
    const client = this.ensureClient()

    return {
      client,
      defaultModel: this.defaultModel
    }
  }

  private ensureClient() {
    if (!this.client) {
      throw new ServiceUnavailableException('OpenAI AgentKit is not configured. Set OPENAI_API_KEY to enable it.')
    }

    return this.client
  }

  private buildToolDefinitions(agentId: string): Record<string, unknown>[] {
    void agentId
    return []
  }

  private async ensureAgentRegistration(
    agentId: string,
    existingAgent?: Awaited<ReturnType<AgentsService['getAgent']>>
  ) {
    const client = this.ensureClient()
    const agent = existingAgent ?? (await this.agentsService.getAgent(agentId))

    if (agent.openaiAgentId) {
      return agent.openaiAgentId
    }

    const agentsApi = (client as any).agents
    if (!agentsApi?.create) {
      throw new ServiceUnavailableException('The installed OpenAI SDK does not expose Agent Builder APIs yet.')
    }

    const instructions =
      agent.instructions ??
      `Eres ${agent.name}, un agente del ENACOM especializado en ${agent.area ?? 'gestión y análisis de datos.'}
Responde siempre en español y utiliza las herramientas disponibles cuando corresponda.`

    const created = await agentsApi.create({
      name: agent.name,
      model: agent.model ?? this.defaultModel,
      instructions,
      metadata: {
        agentId,
        area: agent.area ?? undefined
      }
    })

    await this.agentsService.updateAgentAgentKitMetadata(agentId, {
      openaiAgentId: created.id,
      instructions,
      model: agent.model ?? this.defaultModel
    })

    return created.id as string
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
