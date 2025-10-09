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

      const evalPayload: Record<string, any> = {
        model: 'gpt-4o-mini',
        task_type: 'graded_generation',
        input: {
          trace_id: traceId,
          agent_name: trace.agent?.name ?? 'Desconocido',
          prompt: trace.input ?? 'Sin información',
          completion: trace.output
        },
        criteria,
        rubric:
          'Evalúa la calidad de la respuesta del agente del ENACOM considerando claridad técnica, coherencia institucional, nivel de detalle y precisión de los datos.'
      }

      const response = await (openai.evals.create as any)(evalPayload)

      const result = response?.results?.[0] ?? response?.scores?.[0] ?? null
      const rawGrade =
        (typeof result?.score === 'number'
          ? result.score
          : typeof result?.grade === 'number'
            ? result.grade
            : typeof response?.score === 'number'
              ? response.score
              : typeof response?.grade === 'number'
                ? response.grade
                : 0)
      const grade = Math.min(1, Math.max(0, Number.isFinite(rawGrade) ? rawGrade : 0))
      const feedback =
        result?.feedback ??
        result?.reason ??
        result?.explanation ??
        response?.feedback ??
        response?.reason ??
        'Sin comentarios'

      await this.prisma.agentTrace.update({
        where: { id: traceId },
        data: { grade, feedback, evaluator: 'auto-eval' }
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
