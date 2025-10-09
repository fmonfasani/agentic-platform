'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Search, Sparkles } from 'lucide-react'

type AgentRanking = {
  id: string
  name: string
  area: string | null
  rewards: number
  uses: number
  downloads: number
  avgGrade: number
  totalTraces: number
}

type AreaSummary = {
  area: string
  agentCount: number
  avgGrade: number
  totalRewards: number
  totalUses: number
  totalDownloads: number
}

type LeaderboardResponse = {
  leaderboard: AgentRanking[]
  areas: AreaSummary[]
}

export default function DashboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/leaderboard', { cache: 'no-store' })
      if (!res.ok) throw new Error('Error al obtener los agentes del sistema')
      const json = (await res.json()) as LeaderboardResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const totals = useMemo(() => {
    if (!data?.leaderboard?.length) {
      return { totalRewards: 0, totalUses: 0, totalDownloads: 0, totalAgents: 0, totalAvgGrade: 0 }
    }

    return data.leaderboard.reduce(
      (acc, agent) => {
        acc.totalRewards += agent.rewards
        acc.totalUses += agent.uses
        acc.totalDownloads += agent.downloads
        acc.totalAgents += 1
        acc.totalAvgGrade += agent.avgGrade
        return acc
      },
      { totalRewards: 0, totalUses: 0, totalDownloads: 0, totalAgents: 0, totalAvgGrade: 0 }
    )
  }, [data])

  const globalAvgGrade = totals.totalAgents > 0 ? totals.totalAvgGrade / totals.totalAgents : 0

  const filteredLeaderboard = useMemo(() => {
    if (!data?.leaderboard?.length) return []
    const term = searchTerm.trim().toLowerCase()
    if (!term) return data.leaderboard
    return data.leaderboard.filter((agent) => {
      const nameMatches = agent.name.toLowerCase().includes(term)
      const areaMatches = agent.area?.toLowerCase().includes(term) ?? false
      return nameMatches || areaMatches
    })
  }, [data, searchTerm])

  const showEmptyState = !loading && !filteredLeaderboard.length

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-[#060b18] via-[#081226] to-[#02060d] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
        <header className="space-y-3">
          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-sky-300/70">
            <Sparkles className="h-4 w-4" />
            <span>Sistema de Agentes Autónomos Inteligentes</span>
          </div>
          <p className="text-base text-white/60">Plataforma Unificada de Procesamiento</p>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Dashboard de agentes</h1>
            <p className="text-white/60">Monitoreo y gestión de agentes del sistema</p>
          </div>
        </header>

        {error && (
          <div className="flex flex-col gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-100 shadow-lg shadow-red-900/10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-500/30 p-2">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-red-100">Error al cargar los agentes</p>
                <p className="text-sm text-red-100/80">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="inline-flex items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 px-6 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-white/40" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar agente por nombre o categoría..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-base text-white placeholder:text-white/40 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/5 bg-white/5 p-10 text-center text-white/60">
              Cargando información del sistema...
            </div>
          )}

          {showEmptyState && !loading && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-16 text-center">
              <div className="rounded-full bg-sky-500/10 p-4 text-sky-300">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">No hay agentes configurados</h2>
                <p className="max-w-md text-white/60">
                  Comienza creando tu primer agente autónomo para automatizar procesos del sistema.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Crear primer agente
              </button>
            </div>
          )}

          {!loading && !showEmptyState && data && (
            <div className="space-y-8">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard label="Agentes monitoreados" value={totals.totalAgents.toString()} />
                <DashboardStatCard label="Recompensas totales" value={totals.totalRewards.toString()} />
                <DashboardStatCard label="Usos totales" value={totals.totalUses.toString()} />
                <DashboardStatCard label="Calidad promedio" value={globalAvgGrade.toFixed(2)} />
              </section>

              {!!data.areas.length && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Desempeño por área funcional</h2>
                    <p className="text-sm text-white/60">
                      Analiza los indicadores clave por cada área operativa del sistema.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {data.areas.map((area) => (
                      <div
                        key={area.area}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/20"
                      >
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold text-white">{area.area}</h3>
                          <p className="text-sm text-white/60">{area.agentCount} agente(s)</p>
                        </div>
                        <dl className="mt-4 space-y-3 text-sm text-white/70">
                          <DashboardAreaMetric label="Calidad promedio" value={area.avgGrade.toFixed(2)} />
                          <DashboardAreaMetric label="Recompensas" value={area.totalRewards.toString()} />
                          <DashboardAreaMetric label="Usos" value={area.totalUses.toString()} />
                          <DashboardAreaMetric label="Descargas" value={area.totalDownloads.toString()} />
                        </dl>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Ranking de agentes</h2>
                    <p className="text-sm text-white/60">Ordenado por calidad promedio</p>
                  </div>
                  {searchTerm && (
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {filteredLeaderboard.length} resultado(s)
                    </p>
                  )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-white/60">
                        <th className="px-4 py-3">Agente</th>
                        <th className="px-4 py-3">Área</th>
                        <th className="px-4 py-3">Recompensas</th>
                        <th className="px-4 py-3">Usos</th>
                        <th className="px-4 py-3">Descargas</th>
                        <th className="px-4 py-3">Calidad promedio</th>
                        <th className="px-4 py-3">Trazas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaderboard.map((agent, index) => (
                        <tr
                          key={agent.id}
                          className={`border-b border-white/5 text-white/80 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                        >
                          <td className="px-4 py-3 font-semibold text-white">{agent.name}</td>
                          <td className="px-4 py-3 text-white/60">{agent.area ?? 'Sin área'}</td>
                          <td className="px-4 py-3">{agent.rewards}</td>
                          <td className="px-4 py-3">{agent.uses}</td>
                          <td className="px-4 py-3">{agent.downloads}</td>
                          <td className="px-4 py-3">{agent.avgGrade.toFixed(2)}</td>
                          <td className="px-4 py-3">{agent.totalTraces}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type DashboardStatCardProps = {
  label: string
  value: string
}

function DashboardStatCard({ label, value }: DashboardStatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}

type DashboardAreaMetricProps = {
  label: string
  value: string
}

function DashboardAreaMetric({ label, value }: DashboardAreaMetricProps) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-white/60">{label}</dt>
      <dd className="font-medium text-white">{value}</dd>
    </div>
  )
}
