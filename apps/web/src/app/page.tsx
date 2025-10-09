'use client'

import { useEffect, useMemo, useState } from 'react'
import { AgentCard, type AgentCardData } from '../components/AgentCard'
import { AgentDetailsModal } from '../components/AgentDetailsModal'
import { agentGroups } from '../lib/agents-data'
import { API_BASE_URL } from '../lib/config'

type AgentCategory = keyof typeof agentGroups

const orderedColumns: AgentCategory[] = ['technical', 'financial', 'regulatory', 'reporting']

type AgentSummary = AgentCardData & {
  description: string | null
}

type ApiAgent = {
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

export default function Page() {
  const [agents, setAgents] = useState<AgentSummary[]>([])
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
        if (!res.ok) throw new Error('No se pudieron obtener los agentes del ENACOM')

        const data = (await res.json()) as AgentSummary[]
        const enriched = data.map((agent) => ({
          ...agent,
          type: agent.type ?? inferAgentType(agent.name)
        }))
        setAgents(mapped)
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
      if (sortKey === 'stars') {
        return b.stars - a.stars
      }
      return b.uses - a.uses
    })
  }, [agents, filter, search, sortKey])

  const groupedByCategory = useMemo(() => {
    return filteredAgents.reduce<Record<AgentCategory, AgentSummary[]>>((acc, agent) => {
      const category = normalizeCategory(agent.type)
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(agent)
      return acc
    }, { technical: [], financial: [], regulatory: [], reporting: [], risk: [], planning: [], general: [] } as Record<AgentCategory, AgentSummary[]>)
  }, [filteredAgents])

  return (
    <main className="min-h-screen bg-[#050b15] px-6 pb-16 pt-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/40 p-8 shadow-2xl">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Sistema de Agentes Autónomos</p>
            <h1 className="text-3xl font-semibold text-white/90">Panel de Control ENACOM</h1>
            <p className="text-sm text-white/60">
              Monitoree el uso de los agentes analíticos, informes y reportes estratégicos del Ente Nacional de Comunicaciones.
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

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

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
          </section>
        )}
      </div>

      <AgentDetailsModal agent={selectedAgent} open={!!selectedAgent} onClose={() => setSelectedAgent(null)} />
    </main>
  )
}

function normalizeCategory(type: string | null | undefined): AgentCategory {
  if (!type) return 'general'
  if (type in agentGroups) {
    return type as AgentCategory
  }
  return inferAgentType(type)
}

function inferAgentType(name: string): AgentCategory {
  const normalized = name.toLowerCase()

  for (const { keywords, type } of KEYWORD_TYPE_MAP) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return type
    }
  }

  return 'general'
}
