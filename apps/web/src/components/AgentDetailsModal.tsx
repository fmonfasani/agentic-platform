'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Clock, Gauge, Link2, Loader2, Mic, Paperclip, Presentation, RotateCcw, Video, Workflow } from 'lucide-react'
import AgentModal from './AgentModal'
import { API_BASE_URL, OPENAI_CAPABILITIES } from '../lib/config'
import type { AgentCardData } from './AgentCard'

const capabilityPalette = ['bg-sky-500/20 text-sky-200', 'bg-emerald-500/20 text-emerald-200', 'bg-teal-500/20 text-teal-200', 'bg-violet-500/20 text-violet-200']

type AgentDetailResponse = {
  id: string
  name: string
  area: string
  description: string | null
  model: string | null
  openaiAgentId: string | null
  instructions: string | null
  updatedAt: string
  uses?: number
  downloads?: number
  rewards?: number
  votes?: number
  stars?: number
}

type AgentMetricsResponse = {
  accuracy: number | null
  averageResponseTime: number | null
  successRate: number | null
}

type AgentTrace = {
  id: string
  status: string
  createdAt: string
  evaluator?: string | null
  grade?: number | null
  summary?: string | null
}

type ConversationMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type AgentDetailsModalProps = {
  agent: AgentCardData | null
  open: boolean
  onClose: () => void
}

export function AgentDetailsModal({ agent, open, onClose }: AgentDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<AgentDetailResponse | null>(null)
  const [metrics, setMetrics] = useState<AgentMetricsResponse | null>(null)
  const [traces, setTraces] = useState<AgentTrace[]>([])
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const formattedCapabilities = useMemo(() => OPENAI_CAPABILITIES.map((cap, index) => ({
    label: cap,
    className: capabilityPalette[index % capabilityPalette.length]
  })), [])

  const resetState = useCallback(() => {
    setDetail(null)
    setMetrics(null)
    setTraces([])
    setConversation([])
    setInput('')
    setError(null)
    setUploadSuccess(null)
    setUploadError(null)
  }, [])

  const fetchTraces = useCallback(async (agentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/traces?take=5`, { cache: 'no-store' })
      if (!response.ok) return
      const data = (await response.json()) as AgentTrace[]
      setTraces(data)
    } catch (err) {
      console.error('No se pudieron obtener las trazas del agente', err)
    }
  }, [])

  useEffect(() => {
    if (!open || !agent) {
      resetState()
      setLoading(false)
      return
    }

    let cancelled = false
    const agentId = agent.id
    async function loadAgent() {
      setLoading(true)
      setError(null)

      try {
        const [detailRes, metricsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/agents/${agentId}`, { cache: 'no-store' }),
          fetch(`${API_BASE_URL}/agents/${agentId}/metrics`, { cache: 'no-store' })
        ])

        if (!detailRes.ok) {
          throw new Error('No se pudieron obtener los datos del agente seleccionado')
        }

        const detailData = (await detailRes.json()) as AgentDetailResponse
        const metricsData = metricsRes.ok ? ((await metricsRes.json()) as AgentMetricsResponse) : null

        if (cancelled) return
        setDetail(detailData)
        setMetrics(metricsData)
        fetchTraces(agentId)
      } catch (err) {
        console.error(err)
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Ocurrió un error al obtener la información del agente')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAgent()
    return () => {
      cancelled = true
    }
  }, [agent, open, fetchTraces, resetState])

  const handleRun = useCallback(async () => {
    if (!agent || !input.trim()) return

    const message = input.trim()
    setConversation((prev) => [...prev, { role: 'user', content: message }])
    setInput('')
    setIsRunning(true)

    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agent.id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: message })
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(errorMessage || 'El agente no pudo completar la solicitud')
      }

      const raw = await response.text()
      let content = raw || 'Ejecución completada.'
      try {
        const payload = raw ? JSON.parse(raw) : null
        if (payload) {
          content =
            payload.message ||
            payload.output ||
            payload.response ||
            payload.result ||
            JSON.stringify(payload, null, 2) ||
            content
        }
      } catch {
        // Mantener contenido sin cambios si no es JSON válido.
      }

      setConversation((prev) => [...prev, { role: 'assistant', content }])
      fetchTraces(agent.id)
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Ocurrió un error al ejecutar el proceso'
      setConversation((prev) => [...prev, { role: 'assistant', content: `⚠️ ${message}` }])
    } finally {
      setIsRunning(false)
    }
  }, [agent, input, fetchTraces])

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!agent) return
      const file = event.target.files?.[0]
      if (!file) return

      setUploadSuccess(null)
      setUploadError(null)
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch(`${API_BASE_URL}/agents/${agent.id}/upload`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'No se pudo generar el informe a partir del archivo cargado')
        }

        setUploadSuccess('Informe generado correctamente')
        fetchTraces(agent.id)
      } catch (err) {
        console.error('Error al subir el informe', err)
        setUploadError(
          err instanceof Error ? err.message : 'Ocurrió un error inesperado al subir el informe'
        )
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [agent, fetchTraces]
  )

  const metricsCards = useMemo(() => {
    if (!metrics) return []

    return [
      {
        label: 'Precisión Operativa',
        value: metrics.accuracy !== null && metrics.accuracy !== undefined ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'N/D',
        icon: <Gauge className="h-5 w-5" />
      },
      {
        label: 'Tiempo Medio de Respuesta',
        value:
          metrics.averageResponseTime !== null && metrics.averageResponseTime !== undefined
            ? `${metrics.averageResponseTime.toFixed(1)}s`
            : 'N/D',
        icon: <Clock className="h-5 w-5" />
      },
      {
        label: 'Tasa de Éxito',
        value:
          metrics.successRate !== null && metrics.successRate !== undefined
            ? `${(metrics.successRate * 100).toFixed(1)}%`
            : 'N/D',
        icon: <Presentation className="h-5 w-5" />
      }
    ]
  }, [metrics])

  return (
    <AgentModal open={open} onClose={onClose} title={agent?.name} description={agent?.area}>
      <div className="space-y-6 text-white/80">
        {loading && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Obteniendo capacidades desde OpenAI Platform…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {detail && (
          <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <article className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">Descripción General</h3>
              <p className="text-sm leading-relaxed text-white/70">
                {detail.description || 'Este agente aún no cuenta con una descripción registrada.'}
              </p>
              {agent && (
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-3 text-xs text-white/60 md:grid-cols-4">
                  <MetricPill label="Usos" value={agent.uses} />
                  <MetricPill label="Descargas" value={agent.downloads} />
                  <MetricPill label="Recompensas" value={agent.rewards} />
                  <MetricPill label="Puntuación" value={`${agent.stars.toFixed(1)} (${agent.votes} votos)`} />
                </div>
              )}
              <div className="grid grid-cols-1 gap-2 text-xs text-white/50 md:grid-cols-2">
                <InfoRow label="Modelo" value={detail.model ?? 'gpt-4.1-mini'} />
                <InfoRow label="Agent ID" value={detail.openaiAgentId ?? 'No registrado'} />
                <InfoRow
                  label="Actualizado"
                  value={new Date(detail.updatedAt).toLocaleString('es-AR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                />
                <InfoRow label="Tipo" value={agent?.type ?? 'N/D'} />
              </div>
              {detail.instructions && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Instrucciones Base</p>
                  <p className="mt-1 text-sm text-white/[0.65] whitespace-pre-line">{detail.instructions}</p>
                </div>
              )}
            </article>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50">Capacidades</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {formattedCapabilities.map((capability) => (
                    <span
                      key={capability.label}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${capability.className}`}
                    >
                      {capability.label}
                    </span>
                  ))}
                </div>
              </div>

              {metricsCards.length > 0 && (
                <div className="space-y-2">
                  {metricsCards.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-300/80">{metric.icon}</span>
                        <p className="text-xs uppercase tracking-wide text-white/50">{metric.label}</p>
                      </div>
                      <p className="text-sm font-semibold text-white/80">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </section>
        )}

        <section className="space-y-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Interfaz de Comunicación</h3>
              <p className="text-xs text-white/50">Interactúe con el agente en tiempo real utilizando ChatKit.</p>
            </div>
            <button
              onClick={() => agent && fetchTraces(agent.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isUploading}
            >
              <RotateCcw className="h-4 w-4" />
              Actualizar registros
            </button>
          </header>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            {conversation.length === 0 && (
              <p className="text-sm text-white/50">
                Envíe una instrucción para iniciar la conversación con el agente autónomo.
              </p>
            )}
            {conversation.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl border px-3 py-2 text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/5 text-white/70'
                }`}
              >
                <p className="text-[11px] uppercase tracking-wider text-white/40">
                  {message.role === 'user' ? 'Operador' : 'Agente ENACOM'}
                </p>
                <p className="mt-1 whitespace-pre-line">{message.content}</p>
              </div>
            ))}
          </div>

          {uploadSuccess && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
              {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {uploadError}
            </div>
          )}

          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ingrese su consulta o instrucciones…"
              rows={3}
              disabled={isUploading}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white/80 placeholder:text-white/30 focus:border-emerald-400/70 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-900/40 disabled:text-white/40"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60 transition hover:border-white/20 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-300/80" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-emerald-300/80" />
                  )}
                  Subir informe PDF
                </button>
                <ActionChip icon={<Mic className="h-4 w-4" />} label="Entrada de Voz" />
                <ActionChip icon={<Video className="h-4 w-4" />} label="Adjuntar Video" />
                <ActionChip icon={<Link2 className="h-4 w-4" />} label="Adjuntar Enlace" />
              </div>
              <button
                type="button"
                disabled={isRunning || isUploading || !input.trim()}
                onClick={handleRun}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Workflow className="h-4 w-4" />}
                Ejecutar Proceso
              </button>
            </div>
          </div>
        </section>

        {traces.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Últimas ejecuciones</h3>
            <div className="grid gap-3">
              {traces.map((trace) => (
                <div key={trace.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {trace.status}
                    </span>
                    <span>{new Date(trace.createdAt).toLocaleString()}</span>
                  </div>
                  {trace.summary && <p className="mt-2 text-white/70">{trace.summary}</p>}
                  <div className="mt-2 text-[11px] text-white/40">
                    {trace.grade !== null && trace.grade !== undefined
                      ? `Evaluación • ${(trace.grade * 100).toFixed(0)}%`
                      : 'Sin evaluación automática registrada'}
                  </div>
                  {trace.evaluator && (
                    <p className="text-[11px] text-white/40">Evaluador: {trace.evaluator}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AgentModal>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="text-sm text-white/70">{value}</p>
    </div>
  )
}

function ActionChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60">
      <span className="text-emerald-300/80">{icon}</span>
      {label}
    </span>
  )
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white/70">{value}</p>
    </div>
  )
}
