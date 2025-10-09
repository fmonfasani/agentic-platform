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
      const evalPrompt = `
Evalúa la calidad del resultado generado por el agente del ENACOM.

### Entrada:
${trace.input ?? 'Sin información'}

### Salida:
${trace.output}

### Criterios:
- Claridad técnica
- Coherencia institucional
- Nivel de detalle
- Precisión en los datos

Responde en JSON con los campos:
{
  "grade": 0-1,
  "feedback": "comentario"
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sos un evaluador técnico del ENACOM.' },
          { role: 'user', content: evalPrompt }
        ],
        temperature: 0
      })

      const text = response.choices[0]?.message?.content ?? '{}'
      const parsed = JSON.parse(text)
      const grade = Math.min(1, Math.max(0, parsed.grade ?? 0))
      const feedback = parsed.feedback ?? 'Sin comentarios'

      await this.prisma.agentTrace.update({
        where: { id: traceId },
        data: { grade, feedback, evaluator: 'auto-eval' }
      })

      this.logger.log(`✅ Evaluación completada para traza ${traceId}`)
      return { grade, feedback }
    } catch (err: any) {
      this.logger.error(`❌ Error evaluando traza ${traceId}: ${err.message}`)
    }
  }
}
