import { Injectable, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import { PrismaService } from '../prisma/prisma.service'

type EvalTemplateConfig = Record<string, any>

type EvalRunLike = {
  id?: string
  status?: string
  grade?: number | string | null
  score?: number | string | null
  feedback?: string | null
  evaluator?: string | null
  result?: Record<string, any> | null
  results?: Array<Record<string, any>> | null
  metrics?: Record<string, any> | null
}

type EvalCreateLike = {
  id?: string
  eval_id?: string
  evaluation?: { id?: string }
  run_id?: string
  latest_run_id?: string
  run?: EvalRunLike | null
  latest_run?: EvalRunLike | null
  runs?: EvalRunLike[] | null
}

type EvalResult = {
  grade: number | null
  feedback: string
  evaluator: string
}

@Injectable()
export class AgentEvalService {
  private readonly openai: OpenAI | null
  private readonly logger = new Logger(AgentEvalService.name)
  private readonly template: EvalTemplateConfig | null
  private readonly pollInterval: number
  private readonly pollTimeout: number

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        organization: process.env.OPENAI_ORG_ID,
        project: process.env.OPENAI_PROJECT_ID
      })
    } else {
      this.openai = null
    }

    this.template = this.resolveTemplate(process.env.OPENAI_EVAL_TEMPLATE)
    this.pollInterval = this.parseNumber(process.env.OPENAI_EVAL_POLL_INTERVAL, 2000)
    this.pollTimeout = this.parseNumber(process.env.OPENAI_EVAL_TIMEOUT, 120000)
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

    if (!this.template) {
      this.logger.warn('⚠️ OPENAI_EVAL_TEMPLATE no está configurada. Se omite la autoevaluación.')
      return
    }

    if (!trace.output) {
      this.logger.warn(`⚠️ La traza ${traceId} no tiene salida para evaluar.`)
      return
    }

    try {
      const payload = this.buildEvalPayload(trace)
      const created = (await (openai.evals as any).create(payload)) as EvalCreateLike
      const context = this.extractRunContext(created)

      if (!context) {
        this.logger.warn(`⚠️ La API de evaluaciones no devolvió un run válido para la traza ${traceId}.`)
        return
      }

      let finalRun = context.run
      if (!finalRun || !this.isTerminalStatus(finalRun.status)) {
        finalRun = await this.waitForRunCompletion(context.evalId, context.runId)
      }

      if (!finalRun) {
        this.logger.warn(`⚠️ No se pudo obtener el resultado de la evaluación para la traza ${traceId}.`)
        return
      }

      if (!this.isSuccessfulStatus(finalRun.status)) {
        this.logger.warn(`⚠️ La evaluación para la traza ${traceId} finalizó con estado ${finalRun.status}.`)
        return
      }

      const result = this.mapRunResult(finalRun)

      await this.prisma.agentTrace.update({
        where: { id: traceId },
        data: {
          grade: result.grade,
          feedback: result.feedback,
          evaluator: result.evaluator
        }
      })

      this.logger.log(`✅ Evaluación completada para traza ${traceId}`)
      return result
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

  private resolveTemplate(raw?: string | null): EvalTemplateConfig | null {
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    } catch (error) {
      // If the template is not JSON we treat it as a simple identifier.
      if (raw.trim()) {
        return { evaluation_template_id: raw.trim() }
      }
      return null
    }

    if (raw.trim()) {
      return { evaluation_template_id: raw.trim() }
    }

    return null
  }

  private parseNumber(raw: string | undefined, fallback: number) {
    if (!raw) return fallback
    const value = Number(raw)
    return Number.isFinite(value) && value > 0 ? value : fallback
  }

  private buildEvalPayload(trace: any) {
    const clonedTemplate = this.cloneTemplate()
    const metadata = {
      ...(clonedTemplate.metadata ?? {}),
      traceId: trace.id,
      agentId: trace.agentId,
      agentName: trace.agent?.name ?? undefined
    }

    const inputs = [
      {
        input: trace.input ?? '',
        output: trace.output ?? '',
        metadata
      }
    ]

    return {
      ...clonedTemplate,
      metadata,
      inputs
    }
  }

  private cloneTemplate() {
    if (!this.template) return {}
    try {
      return JSON.parse(JSON.stringify(this.template))
    } catch (error) {
      return { ...(this.template as EvalTemplateConfig) }
    }
  }

  private extractRunContext(created: EvalCreateLike) {
    if (!created) return null

    const evalId = created.id ?? created.eval_id ?? created.evaluation?.id
    const run = created.run ?? created.latest_run ?? created.runs?.[0] ?? null
    const runId = run?.id ?? created.run_id ?? created.latest_run_id

    if (!evalId || !runId) {
      return null
    }

    return { evalId, runId, run }
  }

  private async waitForRunCompletion(evalId: string, runId: string) {
    const openai = this.openai
    if (!openai) return null

    const deadline = Date.now() + this.pollTimeout
    let firstAttempt = true

    while (Date.now() <= deadline) {
      if (!firstAttempt) {
        await this.delay(this.pollInterval)
      }

      firstAttempt = false
      const run = (await (openai.evals as any).runs.retrieve(runId, {
        eval_id: evalId
      })) as EvalRunLike

      if (!run) {
        continue
      }

      if (this.isTerminalStatus(run.status)) {
        return run
      }
    }

    throw new Error(`Tiempo de espera agotado esperando la evaluación ${runId}`)
  }

  private isTerminalStatus(status?: string | null) {
    if (!status) return false
    const normalized = status.toLowerCase()
    return ['completed', 'failed', 'cancelled', 'canceled'].includes(normalized)
  }

  private isSuccessfulStatus(status?: string | null) {
    return status?.toLowerCase() === 'completed'
  }

  private mapRunResult(run: EvalRunLike): EvalResult {
    const firstResult = this.pickResult(run)
    const grade = this.normalizeGrade([
      run?.grade,
      run?.score,
      run?.metrics?.grade,
      run?.metrics?.score,
      run?.result?.grade,
      run?.result?.score,
      firstResult?.grade,
      firstResult?.score
    ])

    const feedback = this.pickFeedback(run, firstResult)
    const evaluator = this.pickEvaluator(run, firstResult)

    return {
      grade,
      feedback,
      evaluator
    }
  }

  private pickResult(run: EvalRunLike) {
    if (!run) return null
    if (Array.isArray(run.results) && run.results.length > 0) {
      return run.results[0]
    }

    if (run.result && typeof run.result === 'object') {
      return run.result
    }

    const output = (run as any)?.output
    if (Array.isArray(output) && output.length > 0) {
      return output[0]
    }

    return null
  }

  private normalizeGrade(candidates: Array<number | string | null | undefined>) {
    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return Math.min(1, Math.max(0, candidate))
      }

      if (typeof candidate === 'string') {
        const parsed = Number(candidate)
        if (Number.isFinite(parsed)) {
          return Math.min(1, Math.max(0, parsed))
        }
      }
    }

    return null
  }

  private pickFeedback(run: EvalRunLike, result: Record<string, any> | null | undefined) {
    const candidates: Array<string | null | undefined> = [
      run?.feedback,
      run?.result && (run.result as any).feedback,
      result?.feedback,
      this.extractFeedbackFromSample(result?.sample),
      this.extractFeedbackFromSample((run?.result as any)?.sample)
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim()
      }
    }

    return 'Sin comentarios'
  }

  private extractFeedbackFromSample(sample: any) {
    if (!sample) return null

    if (typeof sample.feedback === 'string' && sample.feedback.trim()) {
      return sample.feedback.trim()
    }

    if (Array.isArray(sample.output)) {
      const contents = sample.output
        .map((item: any) => {
          if (typeof item === 'string') return item
          if (item && typeof item.content === 'string') return item.content
          if (Array.isArray(item.content)) {
            return item.content
              .map((chunk: any) => (typeof chunk?.text === 'string' ? chunk.text : undefined))
              .filter(Boolean)
              .join(' ')
          }
          return undefined
        })
        .filter((value: any) => typeof value === 'string' && value.trim().length > 0)

      if (contents.length > 0) {
        return contents.join('\n').trim()
      }
    }

    if (typeof sample.output_text === 'string' && sample.output_text.trim()) {
      return sample.output_text.trim()
    }

    if (typeof sample.reason === 'string' && sample.reason.trim()) {
      return sample.reason.trim()
    }

    return null
  }

  private pickEvaluator(run: EvalRunLike, result: Record<string, any> | null | undefined) {
    const candidates: Array<string | null | undefined> = [
      run?.evaluator,
      (run?.result as any)?.evaluator,
      (run?.result as any)?.grader,
      result?.evaluator,
      result?.grader,
      result?.name
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim()
      }
    }

    return 'openai-evals'
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
