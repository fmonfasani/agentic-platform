'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AgentCard } from '@agents-hub/ui'
import { agentGroups, orderedAgentTypes, AgentType } from '../lib/agents-data'
import { SectionTitle } from '../lib/ui'
import AgentModal from '../components/AgentModal'
import AgentChatKitEmbed from '../components/AgentChatKitEmbed'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// === Tipos base ===
type AgentSummary = {
  id: string
  name: string
  area: string
  description?: string | null
  uses: number
  downloads: number
  rewards: number
  stars: number
  votes: number
  openaiAgentId?: string | null
  model?: string | null
  instructions?: string | null
  type?: AgentType
}

type AgentMetrics = AgentSummary & { type: AgentType }
type GroupedAgents = Record<string, AgentMetrics[]>
type AgentTrace = {
  id: string
  runId: string
  status: string
  grade: number | null
  evaluator: string | null
  traceUrl: string | null
  createdAt: string
  output?: { role: string; content: string }[] | null
}

type AgentDetail = {
  id: string
  name: string
  area: string
  description: string | null
  updatedAt: string
  metrics: {
    uses: number
    downloads: number
    rewards: number
    stars: number
    votes: number
  }
  workflows: {
    id: string
    name: string
    status: string
    model: string
    platform: string
  }[]
}

// === Página principal ===
export default function Page() {
  const [agents, setAgents] = useState<AgentMetrics[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [selectedDetails, setSelectedDetails] = useState<AgentDetail | null>(null)
  const [traces, setTraces] = useState<AgentTrace[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAgents() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/agents`, { cache: 'no-store' })
        if (!res.ok) throw new Error('No se pudieron obtener los agentes del ENACOM')

        const data = (await res.json()) as AgentSummary[]
        const enriched = data.map((agent) => ({
          ...agent,
          type: agent.type ?? inferAgentType(agent.name)
        }))
        setAgents(enriched)
        setError(null)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar los agentes')
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  const grouped = useMemo<GroupedAgents>(() => {
    return agents.reduce<GroupedAgents>((acc, agent) => {
      if (!acc[agent.type]) acc[agent.type] = []
      acc[agent.type].push(agent)
      return acc
    }, {})
  }, [agents])

  const selectedAgent = useMemo(() => agents.find((a) => a.id === openId) ?? null, [agents, openId])
  const selectedAgentId = selectedAgent?.id ?? null

  useEffect(() => {
    if (!selectedAgentId) {
      setSelectedDetails(null)
      setTraces([])
      return
    }

    let active = true
    setDetailsLoading(true)
    setDetailsError(null)

    async function loadDetails() {
      try {
        const [detailsRes, tracesRes] = await Promise.all([
          fetch(`/api/agents/${selectedAgentId}`, { cache: 'no-store' }),
          fetch(`/api/agents/${selectedAgentId}/traces?take=10`, { cache: 'no-store' })
        ])

        if (!detailsRes.ok) throw new Error('No se pudieron obtener los detalles del agente seleccionado')

        const details = (await detailsRes.json()) as AgentDetail
        const traceData = tracesRes.ok ? ((await tracesRes.json()) as AgentTrace[]) : []

        if (!active) return
        setSelectedDetails(details)
        setTraces(traceData)
      } catch (err) {
        console.error(err)
        if (!active) return
        setDetailsError(err instanceof Error ? err.message : 'Error al obtener detalles del agente')
      } finally {
        if (active) setDetailsLoading(false)
      }
    }

    loadDetails()
    return () => {
      active = false
    }
  }, [selectedAgentId])

  const refreshTraces = useCallback(async () => {
    if (!selectedAgentId) return
    try {
      const response = await fetch(`/api/agents/${selectedAgentId}/traces?take=10`, { cache: 'no-store' })
      if (!response.ok) return
      const traceData = (await response.json()) as AgentTrace[]
      setTraces(traceData)
    } catch (error) {
      console.error('No se pudieron actualizar las trazas del agente', error)
    }
  }, [selectedAgentId])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white/90">Panel de Control ENACOM</h1>
      <p className="text-white/60 mt-1">
        Monitoree el uso de los agentes analíticos, informes y reportes estratégicos del Ente Nacional de Comunicaciones.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      {loading ? (
        <div className="mt-10 text-white/70">Cargando información de los agentes...</div>
      ) : (
        <section className="container-card mt-8">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orderedAgentTypes.map((type) => {
              const metadata = agentGroups[type]
              const agentsForType = grouped[type] ?? []
              if (agentsForType.length === 0) return null

              return (
                <div key={type} className="space-y-3">
                  <SectionTitle>{metadata.title}</SectionTitle>
                  <p className="text-xs text-white/50">{metadata.description}</p>
                  <div className="space-y-3">
                    {agentsForType.map((agent) => (
                      <AgentCard key={agent.id} agent={agent} onOpen={() => setOpenId(agent.id)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <AgentWorkflowModal
        agent={selectedAgent}
        details={selectedDetails}
        traces={traces}
        loading={detailsLoading}
        error={detailsError}
        onClose={() => setOpenId(null)}
        onRefreshTraces={refreshTraces}
      />
    </div>
  )
}

// === Subcomponentes ===
type WorkflowModalProps = {
  agent: AgentMetrics | null
  details: AgentDetail | null
  traces: AgentTrace[]
  loading: boolean
  error: string | null
  onClose: () => void
  onRefreshTraces: () => void
}

function AgentWorkflowModal({ agent, details, traces, loading, error, onClose, onRefreshTraces }: WorkflowModalProps) {
  useEffect(() => {
    if (agent) onRefreshTraces()
  }, [agent?.id, onRefreshTraces])

  return (
    <AgentModal
      open={!!agent}
      onClose={onClose}
      title={agent ? `${agent.name}` : 'Agente ENACOM'}
      description={agent?.area ?? undefined}
    >
      <div className="space-y-6">
        {loading && (
          <div className="rounded-lg border border-white/10 bg-[#0f1a2a] px-4 py-3 text-white/70 text-sm">
            Cargando información del agente...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        {details && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#101a29] p-4">
              <h3 className="text-sm font-semibold text-white/80">Descripción</h3>
              <p className="text-sm text-white/60 mt-2">
                {details.description ?? 'Este agente no tiene descripción documentada en la base.'}
              </p>
              <p className="text-[11px] text-white/40 mt-3">
                Última actualización · {new Date(details.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#101a29] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white/80">Integración AgentKit</h3>
              <InfoRow label="ID OpenAI" value={details.metrics?.uses?.toString() ?? 'No registrado aún'} />
              <InfoRow label="Modelo" value={details.workflows[0]?.model ?? 'gpt-4.1-mini'} />
              <InfoRow
                label="Instrucciones"
                value={details.description ?? 'Se aplican las instrucciones generadas automáticamente en el backend.'}
              />
            </div>
          </div>
        )}

        {agent && (
          <div className="grid md:grid-cols-4 gap-3">
            <MetricPill label="Usos" value={agent.uses} />
            <MetricPill label="Descargas" value={agent.downloads} />
            <MetricPill label="Recompensas" value={agent.rewards} />
            <MetricPill label="Estrellas" value={`${agent.stars.toFixed(2)} (${agent.votes})`} />
          </div>
        )}

        {agent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Chat del agente</h3>
              <button onClick={onRefreshTraces} className="text-xs text-[#16a34a] hover:text-[#22c55e]">
                Actualizar trazas
              </button>
            </div>
            <AgentChatKitEmbed
              agentId={agent.id}
              agentName={agent.name}
              onConversationComplete={onRefreshTraces}
            />
          </div>
        )}

        {traces.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/80">Últimas ejecuciones</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {traces.map((trace) => (
                <TraceCard key={trace.id} trace={trace} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AgentModal>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="text-sm text-white/70 break-words">{value}</p>
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#101a29] px-4 py-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-lg font-semibold text-white/90">{value}</p>
    </div>
  )
}

function TraceCard({ trace }: { trace: AgentTrace }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1928] p-4 text-sm text-white/80 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70">{trace.status}</span>
          <span>{new Date(trace.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-xs text-white/50">{trace.runId}</div>
      </div>
      <div className="text-xs text-white/60">
        {trace.grade !== null ? `Evaluación automática: ${(trace.grade * 100).toFixed(0)}%` : 'Sin evaluación automática'}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-white/50">
        {trace.evaluator && <span>{trace.evaluator}</span>}
        {trace.traceUrl && (
          <a href={trace.traceUrl} target="_blank" rel="noreferrer" className="text-[#22c55e] hover:underline">
            Ver traza
          </a>
        )}
      </div>
      {Array.isArray(trace.output) && trace.output.length > 0 && (
        <div className="rounded-lg border border-white/5 bg-black/10 p-3 space-y-2">
          {trace.output.slice(-2).map((message, index) => (
            <p key={index} className="text-xs text-white/60">
              <span className="font-semibold text-white/70">{message.role}: </span>
              {message.content}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

const KEYWORD_TYPE_MAP: { keywords: string[]; type: AgentType }[] = [
  {
    type: 'technical',
    keywords: ['técnico', 'tecnico', 'infraestructura', 'radiocomunicaciones', 'tecnología', 'tecnologias']
  },
  {
    type: 'financial',
    keywords: ['financiero', 'financiera', 'contable', 'presupuesto', 'presupuestaria', 'tesorería', 'tesoreria']
  },
  {
    type: 'regulatory',
    keywords: ['licencia', 'licencias', 'permiso', 'permisos', 'regulatorio', 'regulatoria', 'normativa', 'expediente']
  },
  {
    type: 'reporting',
    keywords: ['informe', 'informes', 'reporte', 'reportes', 'tablero', 'dashboard', 'resumen', 'ejecutivo']
  },
  {
    type: 'risk',
    keywords: ['riesgo', 'riesgos', 'auditoría', 'auditoria', 'alerta']
  },
  {
    type: 'planning',
    keywords: ['planificación', 'planificacion', 'planificador', 'proyecto', 'proyectos', 'estratégico', 'estrategico', 'planeamiento']
  }
]

function inferAgentType(name: string): AgentType {
  const normalized = name.toLowerCase()

  for (const { keywords, type } of KEYWORD_TYPE_MAP) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return type
    }
  }

  return 'general'
}
