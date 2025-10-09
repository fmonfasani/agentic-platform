import { Injectable, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AgentEvalService {
  private readonly openai: OpenAI | null
  private readonly logger = new Logger(AgentEvalService.name)

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY
    this.openai = apiKey ? new OpenAI({ apiKey }) : null
  }

  private async waitForEvalRunCompletion(openai: OpenAI, evalId: string, runId: string) {
    const timeoutMs = 60_000
    const pollIntervalMs = 2_000
    const start = Date.now()

    while (Date.now() - start < timeoutMs) {
      const currentRun = await openai.evals.runs.retrieve(runId, { eval_id: evalId })

      if (currentRun.status !== 'queued' && currentRun.status !== 'in_progress') {
        return currentRun
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
    }

    throw new Error('La evaluación excedió el tiempo de espera configurado')
  }

  async evaluateTrace(traceId: string) {
    const trace = await this.prisma.agentTrace.findUnique({
      where: { id: traceId },
      include: { agent: true }
    })
    if (!trace) return

    const openai = this.openai

    if (!openai) {
      this.logger.warn('❕ OPENAI_API_KEY no está configurada. Se omite la autoevaluación.')
      return
    }

    if (!trace.output) {
      this.logger.warn(`⚠️ La traza ${traceId} no tiene salida para evaluar.`)
      return
    }

    try {
      const criteria = [
        {
          id: 'claridad_tecnica',
          name: 'Claridad técnica',
          description: 'Evalúa si la respuesta explica conceptos técnicos de forma clara y correcta.'
        },
        {
          id: 'coherencia_institucional',
          name: 'Coherencia institucional',
          description: 'Verifica que el mensaje respete el tono y lineamientos institucionales del ENACOM.'
        },
        {
          id: 'nivel_detalle',
          name: 'Nivel de detalle',
          description: 'Analiza si la respuesta ofrece el nivel de profundidad adecuado para el pedido.'
        },
        {
          id: 'precision_datos',
          name: 'Precisión en los datos',
          description: 'Confirma que los datos aportados sean correctos y estén bien fundamentados.'
        }
      ]
      const evaluation = await openai.evals.create({
        name: `trace-${traceId}-${Date.now()}`,
        data_source_config: {
          type: 'custom',
          item_schema: {
            type: 'object',
            required: ['prompt', 'completion'],
            properties: {
              trace_id: { type: 'string' },
              agent_name: { type: 'string' },
              prompt: { type: 'string' },
              completion: { type: 'string' }
            }
          },
          include_sample_schema: true
        },
        testing_criteria: criteria
      } as any)

      const run = await openai.evals.runs.create(evaluation.id, {
        name: `trace-${traceId}`,
        data_source: {
          type: 'jsonl',
          source: {
            type: 'file_content',
            content: [
              {
                item: {
                  trace_id: traceId,
                  agent_name: trace.agent?.name ?? 'Desconocido',
                  prompt: trace.input ?? 'Sin información',
                  completion: trace.output
                },
                sample: {
                  output: [
                    {
                      role: 'assistant',
                      content: trace.output
                    }
                  ]
                }
              }
            ]
          }
        }
      } as any)

      const finalRun = await this.waitForEvalRunCompletion(openai, evaluation.id, run.id)

      if (finalRun.status !== 'completed') {
        throw new Error(`La ejecución de la evaluación terminó con estado ${finalRun.status ?? 'desconocido'}`)
      }

      const outputItems = await openai.evals.runs.outputItems.list(run.id, {
        eval_id: evaluation.id,
        limit: 1
      })

      const firstItem = outputItems?.data?.[0]
      const scores = firstItem?.results
        ?.map(result => (typeof result.score === 'number' && Number.isFinite(result.score) ? result.score : null))
        .filter((value): value is number => value !== null) ?? []

      const grade = scores.length ? Math.min(1, Math.max(0, scores.reduce((sum, value) => sum + value, 0) / scores.length)) : 0

      const feedbackSegments = firstItem?.results?.map(result => {
        const badge = result.passed ? '✅' : '❌'
        const score = typeof result.score === 'number' && Number.isFinite(result.score) ? result.score.toFixed(2) : 'N/A'
        return `${result.name ?? 'Criterio'}: ${badge} (${score})`
      }) ?? []
      const feedback = feedbackSegments.length ? feedbackSegments.join(' | ') : 'Sin comentarios'

      await this.prisma.agentTrace.update({
        where: { id: traceId },
        data: { grade, evaluator: 'auto-eval', feedback }
      })

      this.logger.log(`✅ Evaluación completada para traza ${traceId}`)
      return { grade, feedback }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message ?? err?.message ?? 'Error desconocido'
      this.logger.error(`❌ Error evaluando traza ${traceId}: ${errorMessage}`)
      await this.prisma.agentTrace.update({
        where: { id: traceId },
        data: {
          evaluator: 'auto-eval',
          feedback: `Error al ejecutar la evaluación automática: ${errorMessage}`
        }
      })
    }
  }
}
