// app/dashboard/page.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Search, Sparkles, TrendingUp, Users, Zap, Download } from 'lucide-react'

import { Input } from '../../components/ui/Input'
import { Stat } from '../../components/ui/Stat'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'

import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  AgentCapabilitiesModal,
  type AgentCapabilitiesAgent,
  type AgentToolsState
} from '../../components/agents/AgentCapabilitiesModal'

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

function resolveAgentStatus(agent: AgentRanking): AgentCapabilitiesAgent['status'] {
  if (agent.uses === 0 && agent.totalTraces === 0) {
    return 'draft'
  }
  if (agent.uses === 0) {
    return 'paused'
  }
  return 'active'
}

function sanitizeAgentName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'agent'
}

function computeSeed(value: string) {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function createDefaultToolsForAgent(agent: AgentRanking): AgentToolsState {
  const now = Math.floor(Date.now() / 1000)
  const slug = sanitizeAgentName(agent.name)
  const fileEntries = [
    {
      id: `file_${agent.id.slice(0, 6)}_brief`,
      filename: `${slug}-brief.pdf`,
      bytes: 186 * 1024,
      created_at: now - 60 * 60 * 24 * 2
    },
    {
      id: `file_${agent.id.slice(0, 6)}_metrics`,
      filename: `${slug}-metrics.xlsx`,
      bytes: 92 * 1024,
      created_at: now - 60 * 60 * 24 * 5
    },
    {
      id: `file_${agent.id.slice(0, 6)}_procedure`,
      filename: `${slug}-procedure.md`,
      bytes: 42 * 1024,
      created_at: now - 60 * 60 * 24 * 9
    }
  ]

  const fileSearchEnabled = agent.downloads > 1
  const files = fileSearchEnabled ? fileEntries.slice(0, fileEntries.length - 1 + Math.min(agent.rewards, 1)) : []

  const connectorOptions = [
    { connector_id: 'connector_googledrive', name: 'Google Drive' },
    { connector_id: 'connector_dropbox', name: 'Dropbox' },
    { connector_id: 'connector_sharepoint', name: 'SharePoint' },
    { connector_id: 'connector_gmail', name: 'Gmail' }
  ]
  const connectorSeed = computeSeed(agent.id) % connectorOptions.length
  const baseConnector = connectorOptions[connectorSeed]

  const connectors: AgentToolsState['mcp']['connectors'] = fileSearchEnabled
    ? [
        {
          id: `${baseConnector.connector_id}_${agent.id.slice(0, 6)}`,
          connector_id: baseConnector.connector_id,
          name: baseConnector.name,
          status: 'active',
          tools_count: 2 + (agent.rewards % 4),
          require_approval: agent.rewards > 6 ? 'never' : 'always'
        }
      ]
    : []

  const remoteServers: AgentToolsState['mcp']['remote_servers'] = agent.totalTraces > 3
    ? [
        {
          id: `server_${agent.id.slice(0, 6)}`,
          server_label: `${slug}_ops`,
          server_url: 'https://mcp.enacom.gob.ar/stream',
          server_description: 'Servidor MCP interno para automatizaciones del ENACOM',
          status: 'connected',
          require_approval: agent.uses > 40 ? 'never' : 'always',
          allowed_tools: agent.uses > 60 ? ['sync', 'export', 'notify'] : ['sync', 'export']
        }
      ]
    : []

  return {
    file_search: {
      enabled: fileSearchEnabled,
      vector_store_id: fileSearchEnabled ? `vs_${agent.id.slice(0, 8)}` : null,
      file_count: files.length,
      max_num_results: 10,
      files
    },
    web_search: {
      enabled: agent.uses > 10,
      type: agent.avgGrade >= 0.8 ? 'deep_research' : agent.avgGrade >= 0.6 ? 'agentic' : 'non_reasoning',
      domain_filtering_enabled: agent.avgGrade > 0.85,
      allowed_domains: agent.avgGrade > 0.85 ? ['enacom.gob.ar', 'argentina.gob.ar'] : [],
      user_location: {
        country: 'AR',
        timezone: 'America/Argentina/Buenos_Aires',
        city: 'Buenos Aires',
        region: 'CABA'
      },
      show_citations: agent.avgGrade >= 0.5
    },
    mcp: {
      connectors,
      remote_servers: remoteServers
    }
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentCapabilitiesAgent | null>(null)
  const [agentToolsById, setAgentToolsById] = useState<Record<string, AgentToolsState>>({})
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false)

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

  const handleAgentRowClick = (agent: AgentRanking) => {
    const existingTools = agentToolsById[agent.id]
    const tools = existingTools ?? createDefaultToolsForAgent(agent)

    if (!existingTools) {
      setAgentToolsById((prev) => ({ ...prev, [agent.id]: tools }))
    }

    setSelectedAgent({
      id: agent.id,
      name: agent.name,
      area: agent.area,
      status: resolveAgentStatus(agent),
      tools
    })
    setCapabilitiesOpen(true)
  }

  const handleToolsChange = (agentId: string, tools: AgentToolsState) => {
    setAgentToolsById((prev) => ({ ...prev, [agentId]: tools }))
    setSelectedAgent((prev) => (prev && prev.id === agentId ? { ...prev, tools } : prev))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Sistema de Agentes Autónomos
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard de Agentes</h1>
          <p className="text-slate-400">Monitoreo y gestión en tiempo real</p>
        </header>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-200">Error al cargar los datos</p>
                  <p className="mt-1 text-sm text-red-300/80">{error}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchLeaderboard}>
                Reintentar
              </Button>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar agente por nombre o área..."
            className="pl-12"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
              <p className="mt-4 text-sm text-slate-400">Cargando datos del sistema...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {showEmptyState && !loading && (
          <EmptyState
            icon={Sparkles}
            title="No hay agentes configurados"
            description="Comienza creando tu primer agente autónomo para automatizar procesos del sistema"
            action={{
              label: 'Crear primer agente',
              onClick: () => console.log('Create agent')
            }}
          />
        )}

        {/* Content */}
        {!loading && !showEmptyState && data && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Stat label="Agentes Activos" value={totals.totalAgents} icon={Users} trend="neutral" />
              <Stat label="Ejecuciones Totales" value={totals.totalUses} icon={Zap} trend="up" />
              <Stat label="Descargas" value={totals.totalDownloads} icon={Download} trend="up" />
              <Stat label="Calidad Promedio" value={`${(globalAvgGrade * 100).toFixed(0)}%`} icon={TrendingUp} trend="up" />
            </div>

            {/* Areas Performance */}
            {!!data.areas.length && (
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-100">Desempeño por Área</h2>
                  <p className="text-sm text-slate-400">Métricas clave por área funcional</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {data.areas.map((area) => (
                    <Card key={area.area} hover>
                      <div className="mb-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-slate-100">{area.area}</h3>
                          <Badge variant="default">{area.agentCount} agentes</Badge>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <MetricRow label="Calidad" value={`${(area.avgGrade * 100).toFixed(0)}%`} />
                        <MetricRow label="Recompensas" value={area.totalRewards.toString()} />
                        <MetricRow label="Usos" value={area.totalUses.toString()} />
                        <MetricRow label="Descargas" value={area.totalDownloads.toString()} />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Leaderboard Table */}
            <section>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Ranking de Agentes</h2>
                  <p className="text-sm text-slate-400">Ordenado por calidad promedio</p>
                </div>
                {searchTerm && (
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {filteredLeaderboard.length} resultado(s)
                  </p>
                )}
              </div>
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-700 bg-slate-900/50">
                      <tr>
                        <Th>Agente</Th>
                        <Th>Área</Th>
                        <Th>Recompensas</Th>
                        <Th>Usos</Th>
                        <Th>Descargas</Th>
                        <Th>Calidad</Th>
                        <Th>Trazas</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredLeaderboard.map((agent, idx) => (
                        <tr
                          key={agent.id}
                          onClick={() => handleAgentRowClick(agent)}
                          className="cursor-pointer transition-colors hover:bg-slate-800/30"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-400">
                                {idx + 1}
                              </div>
                              <span className="font-medium text-slate-100">{agent.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{agent.area ?? 'Sin área'}</td>
                          <td className="px-6 py-4 text-slate-300">{agent.rewards}</td>
                          <td className="px-6 py-4 text-slate-300">{agent.uses}</td>
                          <td className="px-6 py-4 text-slate-300">{agent.downloads}</td>
                          <td className="px-6 py-4">
                            <Badge variant={agent.avgGrade >= 0.8 ? 'success' : agent.avgGrade >= 0.6 ? 'warning' : 'danger'}>
                              {(agent.avgGrade * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{agent.totalTraces}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </div>
        )}
      </div>
      <AgentCapabilitiesModal
        agent={selectedAgent}
        open={capabilitiesOpen && !!selectedAgent}
        onClose={() => setCapabilitiesOpen(false)}
        onToolsChange={handleToolsChange}
      />
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  )
}