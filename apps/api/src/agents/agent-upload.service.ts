import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import type { Response } from 'openai/resources/responses/responses'
import pdfParse from 'pdf-parse'
import { AgentEvalService } from './agent-eval.service'
import { AgentRunnerService } from './agent-runner.service'
import { AgentsService } from './agents.service'
import { AgentTraceService, AgentTraceSummary } from './tracing/agent-trace.service'

const MAX_TEXT_LENGTH = 15_000
const TRACE_TEXT_PREVIEW = 2_000

const buildDefaultFinancialInstructions = (agentName: string, agentArea?: string | null) =>
  `Sos ${agentName}, un analista financiero del ENACOM especializado en ${agentArea ?? 'gestión presupuestaria y riesgos económicos'}.
Tu tarea es generar resúmenes ejecutivos claros, cuantitativos y accionables.
Responde siempre en español con enfoque institucional.`

const analysisPromptHeader = `Analiza el siguiente reporte financiero y elabora un resumen ejecutivo para autoridades del ENACOM.
Resalta indicadores clave (KPI), hallazgos relevantes, riesgos presupuestarios y recomendaciones accionables.
Incluye cifras concretas cuando estén disponibles y concluye con próximos pasos sugeridos.`

@Injectable()
export class AgentUploadService {
  private readonly logger = new Logger(AgentUploadService.name)

  constructor(
    private readonly agentsService: AgentsService,
    private readonly runnerService: AgentRunnerService,
    private readonly traceService: AgentTraceService,
    private readonly evalService: AgentEvalService
  ) {}

  async processFinancialReport(agentId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo PDF para continuar.')
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('El archivo PDF proporcionado no contiene información legible.')
    }

    const { client, defaultModel } = this.runnerService.getOpenAIConfiguration()
    const agent = await this.agentsService.getAgent(agentId)

    let parsedText: string
    try {
      const parsePdf = pdfParse as unknown as (data: Buffer) => Promise<{ text?: string }>
      const parsed = await parsePdf(file.buffer)
      parsedText = (parsed.text ?? '').replace(/\s+/g, ' ').trim()
    } catch (error) {
      this.logger.error(`No se pudo procesar el PDF ${file.originalname}: ${(error as Error).message}`)
      throw new BadRequestException('No se pudo leer el contenido del PDF. Verifique el archivo e intente nuevamente.')
    }

    if (!parsedText) {
      throw new BadRequestException('No se pudo extraer texto utilizable del PDF proporcionado.')
    }

    const truncatedText = parsedText.slice(0, MAX_TEXT_LENGTH)
    const preview = truncatedText.slice(0, TRACE_TEXT_PREVIEW)

    const systemMessage = `${agent.instructions ?? buildDefaultFinancialInstructions(agent.name, agent.area)}
Debes priorizar información numérica, tendencias y alertas críticas.`

    const userMessage = `${analysisPromptHeader}

Documento: ${file.originalname}
Tamaño aproximado: ${(file.size / 1024).toFixed(1)} KB

Contenido:
"""
${truncatedText}
"""`

    const runId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    let trace: AgentTraceSummary | null = null
    try {
      trace = await this.traceService.createTrace(agentId, runId, {
        source: {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        },
        prompt: analysisPromptHeader,
        preview
      })

      const response = await client.responses.create({
        model: agent.model ?? defaultModel,
        input: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3
      })

      const summary = this.extractResponseText(response)

      const completedTrace = await this.traceService.completeTrace(trace.id, {
        status: 'completed',
        output: { summary }
      })

      const evaluation = await this.evalService.evaluateTrace(completedTrace.id)
      const traceWithEvaluation = evaluation
        ? { ...completedTrace, grade: evaluation.grade, feedback: evaluation.feedback, evaluator: 'auto-eval' as const }
        : completedTrace

      return {
        runId,
        summary,
        trace: traceWithEvaluation,
        evaluation
      }
    } catch (error) {
      if (trace) {
        await this.traceService.completeTrace(trace.id, {
          status: 'failed',
          output: { error: (error as Error).message }
        })
      }
      throw error
    }
  }

  private extractResponseText(response: Response) {
    if (!response) {
      return ''
    }

    const direct = (response as any).output_text
    if (typeof direct === 'string' && direct.trim().length > 0) {
      return direct.trim()
    }

    const outputSegments = Array.isArray((response as any).output) ? (response as any).output : []
    for (const segment of outputSegments) {
      const content = Array.isArray(segment?.content) ? segment.content : []
      for (const item of content) {
        const value = item?.text?.value ?? item?.text ?? item?.content
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim()
        }
      }
    }

    const choiceText = (response as any).choices?.[0]?.message?.content
    if (typeof choiceText === 'string') {
      return choiceText.trim()
    }

    if (Array.isArray(choiceText)) {
      const joined = choiceText
        .map((item: any) => (typeof item === 'string' ? item : item?.text ?? ''))
        .join('')
        .trim()
      if (joined.length > 0) {
        return joined
      }
    }

    return ''
  }
}
