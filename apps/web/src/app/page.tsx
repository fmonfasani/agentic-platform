'use client'

import { useEffect, useMemo, useState } from 'react'
import { AgentCard, type AgentCardData } from '../components/AgentCard'
import { AgentDetailsModal } from '../components/AgentDetailsModal'
import { agentGroups, orderedAgentTypes } from '../lib/agents-data'
import { API_BASE_URL } from '../lib/config'

type AgentCategory = keyof typeof agentGroups

<<<<<<< Updated upstream
const orderedColumns: AgentCategory[] = orderedAgentTypes

type AgentSummary = AgentCardData & {
  description: string | null
  type?: AgentCategory
}

type ApiAgent = {
=======
// === Tipos base ===
type AgentSummary = {
>>>>>>> Stashed changes
  id: string
  name: string
  area: string
  description?: string | null
  type?: string | null
  uses: number
  downloads: number
  rewards: number
  stars: number
  votes: number
  openaiAgentId?: string | null
  model?: string | null
  instructions?: string | null
}

<<<<<<< Updated upstream
=======
type AgentMetrics = AgentSummary & { type: AgentType }
type GroupedAgents = Record<string, AgentMetrics[]>

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
export default function Page() {
  const [agents, setAgents] = useState<AgentSummary[]>([])
=======
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
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<AgentCategory | 'all'>('all')
  const [sortKey, setSortKey] = useState<'stars' | 'uses'>('stars')
  const [selectedAgent, setSelectedAgent] = useState<AgentSummary | null>(null)

  useEffect(() => {
    async function loadAgents() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/agents`, { cache: 'no-store' })
<<<<<<< Updated upstream
        if (!res.ok) throw new Error('No se pudieron obtener los agentes')

        const data = (await res.json()) as ApiAgent[]
        const enriched: AgentSummary[] = data.map((agent) => ({
=======
        if (!res.ok) throw new Error('No se pudieron obtener los agentes del ENACOM')

        const data = (await res.json()) as AgentSummary[]
        const enriched = data.map((agent) => ({
>>>>>>> Stashed changes
          ...agent,
          description: agent.description ?? null,
          type: normalizeCategory(agent.type)
        }))
        setAgents(enriched)
        setError(null)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al cargar los agentes')
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

<<<<<<< Updated upstream
  const filteredAgents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const list = agents.filter((agent) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        agent.name.toLowerCase().includes(normalizedSearch) ||
        agent.area.toLowerCase().includes(normalizedSearch)
      const matchesFilter = filter === 'all' || agent.type === filter
      return matchesSearch && matchesFilter
    })

    return [...list].sort((a, b) => {
      if (sortKey === 'stars') return b.stars - a.stars
      return b.uses - a.uses
    })
  }, [agents, filter, search, sortKey])

  const groupedByCategory = useMemo(() => {
    const emptyGroups = orderedColumns.reduce<Record<AgentCategory, AgentSummary[]>>((acc, category) => {
      acc[category] = []
=======
  const grouped = useMemo<GroupedAgents>(() => {
    return agents.reduce<GroupedAgents>((acc, agent) => {
      if (!acc[agent.type]) acc[agent.type] = []
      acc[agent.type].push(agent)
>>>>>>> Stashed changes
      return acc
    }, {} as Record<AgentCategory, AgentSummary[]>)

<<<<<<< Updated upstream
    return filteredAgents.reduce<Record<AgentCategory, AgentSummary[]>>((acc, agent) => {
      const category = normalizeCategory(agent.type)
      if (!acc[category]) acc[category] = []
      acc[category].push(agent)
      return acc
    }, emptyGroups)
  }, [filteredAgents])
=======
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
>>>>>>> Stashed changes

  return (
    <main className="min-h-screen bg-[#050b15] px-6 pb-16 pt-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/40 p-8 shadow-2xl">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Sistema de Agentes Autónomos</p>
            <h1 className="text-3xl font-semibold text-white/90">Dashboard de Agentes</h1>
            <p className="text-sm text-white/60">
              Monitor de agentes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
            <input
              type="search"
              placeholder="Buscar agente…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/30 focus:border-emerald-400/60 focus:outline-none"
            />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as AgentCategory | 'all')}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white/80 focus:border-emerald-400/60 focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              {orderedColumns.map((key) => (
                <option key={key} value={key}>
                  {agentGroups[key].title}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as 'stars' | 'uses')}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white/80 focus:border-emerald-400/60 focus:outline-none"
            >
              <option value="stars">Ordenar por puntuación</option>
              <option value="uses">Ordenar por usos</option>
            </select>
          </div>
        </header>

<<<<<<< Updated upstream
        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}
=======
      {loading ? (
        <div className="mt-10 text-white/70">Cargando información de los agentes...</div>
      ) : (
        <section className="container-card mt-8">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orderedAgentTypes.map((type) => {
              const metadata = agentGroups[type]
              const agentsForType = grouped[type] ?? []
              if (agentsForType.length === 0) return null
>>>>>>> Stashed changes

        {loading ? (
          <div className="mt-16 flex items-center justify-center text-white/60">Cargando información de agentes…</div>
        ) : (
          <section className="mt-10 grid gap-6 xl:grid-cols-4">
            {orderedColumns.map((category) => {
              const meta = agentGroups[category]
              const agentsForCategory = groupedByCategory[category] ?? []
              return (
                <div key={category} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/60">{meta.title}</p>
                    <p className="text-sm text-white/50">{meta.description}</p>
                  </div>
                  <div className="space-y-3">
                    {agentsForCategory.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/50">
                        No hay agentes registrados en esta categoría.
                      </p>
                    ) : (
                      agentsForCategory.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} onDoubleClick={() => setSelectedAgent(agent)} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
<<<<<<< HEAD
          </section>
=======
          </div>
        </section>
      )}

      <AgentWorkflowModal agent={selectedAgent} onClose={() => setOpenId(null)} />
    </div>
  )
}

// === Subcomponentes ===
type WorkflowModalProps = {
  agent: AgentMetrics | null
<<<<<<< Updated upstream
=======
  details: AgentDetail | null
  traces: AgentTrace[]
  loading: boolean
  error: string | null
>>>>>>> Stashed changes
  onClose: () => void
}

function AgentWorkflowModal({ agent, onClose }: WorkflowModalProps) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([
    'Necesito generar un análisis detallado del último trimestre',
    'Entendido. Iniciando proceso de análisis. Por favor, especifique los parámetros requeridos o adjunte los archivos necesarios.'
  ])
  const [detail, setDetail] = useState<AgentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    if (!agent) {
      setDetail(null)
      setDetailError(null)
      setDetailLoading(false)
      return
    }

    let cancelled = false
    async function loadDetail() {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/agents/${agent.id}`, { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('No se pudo obtener el detalle del agente')
        }
        const data = (await res.json()) as AgentDetail
        if (!cancelled) {
          setDetail(data)
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setDetailError(err instanceof Error ? err.message : 'Error inesperado al cargar el detalle del agente')
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      cancelled = true
    }
  }, [agent?.id])

  useEffect(() => {
<<<<<<< Updated upstream
    if (agent) {
      setLog([
        `Se abrió el agente ${agent.name} (${agent.area ?? 'sin área asignada'})`,
        'Indique las instrucciones para ejecutar un nuevo flujo de trabajo.'
      ])
      setInput('')
    }
  }, [agent?.id])

  async function run(action: string) {
    if (!agent) return
    setBusy(true)
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, action })
      })

      if (!res.ok) {
        throw new Error('No se pudo ejecutar el flujo del agente')
      }

      const data = await res.json()
      setLog((history) => [...history, `▶ ${action}`, `✔ ${data.status} · ${data.runId}`])
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Error inesperado al ejecutar el flujo'
      setLog((history) => [...history, `⚠️ ${message}`])
    } finally {
      setBusy(false)
    }
  }

  const metrics = detail?.metrics ??
    (agent
      ? {
          uses: agent.uses,
          downloads: agent.downloads,
          rewards: agent.rewards,
          stars: agent.stars,
          votes: agent.votes
        }
      : null)

  const workflows = detail?.workflows ?? []
  const description = detail?.description ?? agent?.description ?? null
=======
    if (agent) onRefreshTraces()
  }, [agent?.id, onRefreshTraces])
>>>>>>> Stashed changes

  return (
    <AgentModal
      open={!!agent}
      onClose={onClose}
      title={detail?.name ?? agent?.name ?? 'Agente ENACOM'}
      subtitle={detail?.area ?? agent?.area ?? undefined}
    >
      <div className="space-y-6">
        {detailLoading && <p className="text-sm text-white/70">Cargando información del agente...</p>}
        {detailError && <p className="text-sm text-red-400">{detailError}</p>}

        {description && <p className="text-sm text-white/70">{description}</p>}

<<<<<<< Updated upstream
        {metrics && (
          <div className="grid grid-cols-2 gap-3 text-xs text-white/80">
            <MetricPill label="⭐ Promedio" value={metrics.stars.toFixed(1)} />
            <MetricPill label="🗳️ Votos" value={metrics.votes.toString()} />
            <MetricPill label="⚡ Usos" value={metrics.uses.toString()} />
            <MetricPill label="⬇ Descargas" value={metrics.downloads.toString()} />
            <MetricPill label="🏆 Recompensas" value={metrics.rewards.toString()} />
=======
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
>>>>>>> Stashed changes
          </div>
>>>>>>> ddfe909135abb4e4c6a2a73c1e3a60090bc7873a
        )}
      </div>

      <AgentDetailsModal agent={selectedAgent} open={!!selectedAgent} onClose={() => setSelectedAgent(null)} />
    </main>
  )
}

function normalizeCategory(type: string | null | undefined): AgentCategory {
  if (!type) return 'technical'
  if (type in agentGroups) return type as AgentCategory
  return inferAgentType(type)
}

function inferAgentType(name: string): AgentCategory {
  const normalized = name.toLowerCase()

<<<<<<< Updated upstream
  const KEYWORD_TYPE_MAP: { keywords: string[]; type: AgentCategory }[] = [
    { keywords: ['financ', 'contab'], type: 'financial' },
    { keywords: ['tecnic', 'infra'], type: 'technical' },
    { keywords: ['reglament', 'licenc'], type: 'regulatory' },
    { keywords: ['report', 'informe'], type: 'reporting' }
  ]

  for (const { keywords, type } of KEYWORD_TYPE_MAP) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return type
  }

  return 'technical'
=======
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
>>>>>>> Stashed changes
}
// === Helper para clasificar agentes por tipo ===
function inferAgentType(name: string): AgentType {
  const normalized = name.toLowerCase()

  if (normalized.includes('técnico') || normalized.includes('tecnico')) return 'technical'
  if (normalized.includes('financiero') || normalized.includes('contable')) return 'financial'
  if (normalized.includes('licencia') || normalized.includes('permiso')) return 'regulatory'
  if (normalized.includes('informe') || normalized.includes('reporte')) return 'reporting'
  if (normalized.includes('riesgo') || normalized.includes('riesgos')) return 'risk'
  if (normalized.includes('planificación') || normalized.includes('proyecto')) return 'planning'

  return 'general'
}
