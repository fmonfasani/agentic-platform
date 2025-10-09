import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import OpenAI from 'openai'
import { AgentsService } from './agents.service'
import { MetricsService } from './metrics/metrics.service'
import { AgentEvalService } from './agent-eval.service'
import { AgentTraceService, AgentTraceSummary } from './tracing/agent-trace.service'

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

@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name)
  private readonly client: OpenAI | null
  private readonly defaultModel = process.env.OPENAI_AGENT_MODEL ?? 'gpt-4.1-mini'

  constructor(
    private readonly agentsService: AgentsService,
    private readonly metricsService: MetricsService,
    private readonly traceService: AgentTraceService,
    private readonly evalService: AgentEvalService
  ) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not configured. AgentKit features are disabled.')
      this.client = null
      return
    }

    this.client = new OpenAI({
      apiKey,
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID
    })
  }

  async run(agentId: string, payload: RunAgentDto) {
    const client = this.ensureClient()

    const agent = await this.agentsService.getAgent(agentId)

    const openaiAgentId = await this.ensureAgentRegistration(agentId, agent)

    const inputMessages = this.normalizeMessages(payload, agent.instructions)
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    const trace = await this.traceService.createTrace(agentId, runId, inputMessages)

    const tools = this.buildToolDefinitions(agentId)

    const response = await this.invokeAgent(client, {
      agent,
      messages: inputMessages,
      tools,
      runId,
      metadata: { ...payload.metadata, traceId: trace.id }
    })

    const transcript = this.collectMessages(inputMessages, response)

    const finalTrace = await this.traceService.completeTrace(trace.id, {
      status: 'completed',
      output: transcript
    })

    const evaluation = await this.evalService.evaluateTrace(finalTrace.id)

    const traceWithEvaluation = evaluation
      ? {
          ...finalTrace,
          grade: evaluation.grade,
          feedback: evaluation.feedback,
          evaluator: 'auto-eval'
        }
      : finalTrace

    return {
      runId,
      status: 'completed',
      agentId,
      openaiAgentId,
      message: transcript[transcript.length - 1]?.content ?? '',
      transcript,
      evaluation,
      trace: traceWithEvaluation
    }
  }

  async createChatSession(agentId: string) {
    const client = this.ensureClient()
    const openaiAgentId = await this.ensureAgentRegistration(agentId)

    const agentsApi = (client as any).agents
    if (!agentsApi?.sessions?.create) {
      throw new ServiceUnavailableException('The installed OpenAI SDK does not support AgentKit sessions yet.')
    }

    const session = await agentsApi.sessions.create({
      agent_id: openaiAgentId,
      metadata: { agentId }
    })

    return session
  }

  async listTraces(agentId: string, take = 20): Promise<AgentTraceSummary[]> {
    return this.traceService.listTracesForAgent(agentId, take)
  }

  private ensureClient() {
    if (!this.client) {
      throw new ServiceUnavailableException('OpenAI AgentKit is not configured. Set OPENAI_API_KEY to enable it.')
    }

    return this.client
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
        type: agent.type,
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

  private buildToolDefinitions(agentId: string) {
    const requiredAgent = { type: 'string', description: 'Identificador del agente dentro del backend ENACOM', enum: [agentId] }

    return [
      {
        type: 'function',
        function: {
          name: 'registrar_uso',
          description:
            'Utiliza esta herramienta cuando debas registrar que el agente ejecutó un flujo o acción para un usuario.',
          parameters: {
            type: 'object',
            properties: {
              agentId: requiredAgent,
              motivo: { type: 'string', description: 'Motivo del uso registrado' }
            },
            required: ['agentId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'registrar_descarga',
          description: 'Indica que el usuario descargó un informe o entregable generado por el agente.',
          parameters: {
            type: 'object',
            properties: {
              agentId: requiredAgent,
              recurso: { type: 'string', description: 'Descripción del recurso descargado' }
            },
            required: ['agentId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'registrar_recompensa',
          description: 'Utiliza esta herramienta cuando el usuario bonifica o recompensa al agente.',
          parameters: {
            type: 'object',
            properties: {
              agentId: requiredAgent,
              puntos: { type: 'number', description: 'Puntaje o cantidad de recompensas otorgadas', minimum: 0 }
            },
            required: ['agentId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'calificar_agente',
          description: 'Registra una calificación de 0 a 5 estrellas para este agente.',
          parameters: {
            type: 'object',
            properties: {
              agentId: requiredAgent,
              estrellas: {
                type: 'number',
                description: 'Calificación otorgada por el usuario (0-5).',
                minimum: 0,
                maximum: 5
              }
            },
            required: ['agentId', 'estrellas']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'consultar_metricas',
          description: 'Devuelve las métricas actuales del agente en el panel ENACOM.',
          parameters: {
            type: 'object',
            properties: {
              agentId: requiredAgent
            },
            required: ['agentId']
          }
        }
      }
    ]
  }

  private async invokeAgent(
    client: OpenAI,
    options: {
      agent: Awaited<ReturnType<AgentsService['getAgent']>>
      messages: ChatMessage[]
      tools: unknown[]
      runId: string
      metadata?: Record<string, unknown>
    }
  ) {
    const responsesApi = (client as any).responses
    if (!responsesApi?.create) {
      throw new ServiceUnavailableException('The installed OpenAI SDK does not expose the Responses API.')
    }

    let response = await responsesApi.create({
      model: options.agent.model ?? this.defaultModel,
      instructions:
        options.agent.instructions ??
        `Eres ${options.agent.name}, un analista del ENACOM. Usa herramientas disponibles y responde en español.`,
      input: options.messages,
      tools: options.tools,
      tool_choice: 'auto',
      metadata: {
        ...options.metadata,
        agentId: options.agent.id,
        runId: options.runId
      }
    })

    while (true) {
      const toolCalls = this.extractToolCalls(response)
      if (toolCalls.length === 0) {
        break
      }

      const toolOutputs = []
      for (const call of toolCalls) {
        const output = await this.handleToolCall(options.agent.id, call)
        toolOutputs.push({ tool_call_id: call.id, output })
      }

      if (!responsesApi.submitToolOutputs) {
        this.logger.warn('The OpenAI SDK does not support submitting tool outputs; stopping early.')
        break
      }

      response = await responsesApi.submitToolOutputs(response.id, {
        tool_outputs: toolOutputs
      })
    }

    return response
  }

  private collectMessages(inputMessages: ChatMessage[], response: any): ChatMessage[] {
    const transcript: ChatMessage[] = [...inputMessages]
    const assistantText = this.extractAssistantText(response)
    if (assistantText) {
      transcript.push({ role: 'assistant', content: assistantText })
    }
    return transcript
  }

  private extractToolCalls(response: any): ToolCall[] {
    const calls: ToolCall[] = []
    const outputItems = this.asArray(response?.output ?? response?.outputs ?? response?.messages)

    for (const item of outputItems) {
      if (item?.content && Array.isArray(item.content)) {
        for (const block of item.content) {
          if (block?.type === 'tool_use') {
            calls.push({
              id: block.id,
              name: block.name,
              input: block.input ?? {}
            })
          }
        }
      } else if (item?.type === 'tool_call') {
        calls.push({
          id: item.id,
          name: item.name,
          input: item.arguments ?? item.input ?? {}
        })
      }
    }

    return calls
  }

  private extractAssistantText(response: any) {
    if (typeof response?.output_text === 'string') {
      return response.output_text
    }

    const outputItems = this.asArray(response?.output ?? response?.outputs ?? response?.messages)
    const texts: string[] = []

    for (const item of outputItems) {
      if (typeof item?.text === 'string') {
        texts.push(item.text)
      }

      if (item?.content && Array.isArray(item.content)) {
        for (const block of item.content) {
          if (block?.type === 'output_text' && typeof block?.text === 'string') {
            texts.push(block.text)
          }
        }
      }
    }

    return texts.join('\n').trim()
  }

  private asArray<T>(value: T | T[] | undefined): T[] {
    if (!value) {
      return []
    }
    return Array.isArray(value) ? value : [value]
  }

  private async handleToolCall(agentId: string, call: ToolCall) {
    switch (call.name) {
      case 'registrar_uso':
        await this.metricsService.increment(agentId, 'uses')
        return JSON.stringify({ status: 'ok', action: 'use-registered' })
      case 'registrar_descarga':
        await this.metricsService.increment(agentId, 'downloads')
        return JSON.stringify({ status: 'ok', action: 'download-registered' })
      case 'registrar_recompensa':
        await this.metricsService.increment(agentId, 'rewards')
        return JSON.stringify({ status: 'ok', action: 'reward-registered' })
      case 'calificar_agente': {
        const estrellas = Number(call.input?.estrellas ?? call.input?.stars ?? 0)
        const rating = await this.metricsService.rate(agentId, estrellas)
        return JSON.stringify({ status: 'ok', action: 'rating-registered', rating })
      }
      case 'consultar_metricas': {
        const metrics = await this.metricsService.getMetrics(agentId)
        return JSON.stringify({ status: 'ok', metrics })
      }
      default:
        this.logger.warn(`Unknown tool call received: ${call.name}`)
        return JSON.stringify({ status: 'error', error: `Unknown tool ${call.name}` })
    }
  }

}

export type AgentRunPayload = RunAgentDto
export type AgentRunMessage = ChatMessage
