'use client'

import { useEffect, useMemo, useState } from 'react'

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

const DASHBOARD_BASE_URL =
  process.env.NEXT_PUBLIC_ENACOM_API_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/?api\/?$/, '') ??
  ''

const DASHBOARD_LEADERBOARD_ENDPOINT = DASHBOARD_BASE_URL
  ? `${DASHBOARD_BASE_URL.replace(/\/$/, '')}/dashboard/leaderboard`
  : '/dashboard/leaderboard'

export default function DashboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/dashboard/leaderboard')
        if (!res.ok) throw new Error('Error al obtener el ranking de agentes')
        const json = (await res.json()) as LeaderboardResponse
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const totals = useMemo(() => {
    if (!data) return null
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

  const globalAvgGrade = totals && totals.totalAgents > 0 ? totals.totalAvgGrade / totals.totalAgents : 0

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Panel de Rendimiento de Agentes ENACOM</h1>
        <p className="text-white/60 mt-2">
          Seguimiento integral del desempeño de agentes técnicos, financieros, regulatorios y de reportes.
        </p>
      </header>

      {loading && <p className="text-white/60">Cargando datos...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && data && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <h2 className="text-sm uppercase tracking-wide text-white/60">Agentes monitoreados</h2>
              <p className="mt-2 text-3xl font-semibold text-white/90">{totals?.totalAgents ?? 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <h2 className="text-sm uppercase tracking-wide text-white/60">Recompensas totales</h2>
              <p className="mt-2 text-3xl font-semibold text-white/90">{totals?.totalRewards ?? 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <h2 className="text-sm uppercase tracking-wide text-white/60">Usos totales</h2>
              <p className="mt-2 text-3xl font-semibold text-white/90">{totals?.totalUses ?? 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <h2 className="text-sm uppercase tracking-wide text-white/60">Calidad promedio</h2>
              <p className="mt-2 text-3xl font-semibold text-white/90">{globalAvgGrade.toFixed(2)}</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white/80">Desempeño por área funcional</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.areas.map((area) => (
                <div key={area.area} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-white/90">{area.area}</h3>
                  <p className="mt-1 text-sm text-white/60">{area.agentCount} agente(s)</p>
                  <dl className="mt-4 space-y-2 text-sm text-white/70">
                    <div className="flex items-center justify-between">
                      <dt>Calidad promedio</dt>
                      <dd className="font-medium text-white/90">{area.avgGrade.toFixed(2)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Recompensas</dt>
                      <dd className="font-medium text-white/90">{area.totalRewards}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Usos</dt>
                      <dd className="font-medium text-white/90">{area.totalUses}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Descargas</dt>
                      <dd className="font-medium text-white/90">{area.totalDownloads}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white/80">Ranking de agentes</h2>
              <p className="text-xs uppercase tracking-wide text-white/50">Ordenado por calidad promedio</p>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/60">
                    <th className="p-3">Agente</th>
                    <th className="p-3">Área</th>
                    <th className="p-3">Recompensas</th>
                    <th className="p-3">Usos</th>
                    <th className="p-3">Descargas</th>
                    <th className="p-3">Calidad Promedio</th>
                    <th className="p-3">Trazas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((agent, idx) => (
                    <tr key={agent.id} className={`text-sm text-white/80 ${idx % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="p-3 font-semibold text-white/90">{agent.name}</td>
                      <td className="p-3 text-white/60">{agent.area ?? 'Sin área'}</td>
                      <td className="p-3">{agent.rewards}</td>
                      <td className="p-3">{agent.uses}</td>
                      <td className="p-3">{agent.downloads}</td>
                      <td className="p-3">{agent.avgGrade.toFixed(2)}</td>
                      <td className="p-3">{agent.totalTraces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
