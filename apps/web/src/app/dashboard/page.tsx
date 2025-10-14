'use client'

import { Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

import AgentCapabilitiesModal from '@/components/agents/modal/AgentCapabilitiesModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { AgentCapabilitiesAgent, AgentToolsState } from '@/components/agents/modal/useAgentCapabilities'
import DashboardHeader from './components/DashboardHeader'
import DashboardMetrics from './components/DashboardMetrics'
import DashboardTable from './components/DashboardTable'
import type { AgentRanking } from '@/lib/api/dashboard'
import { useDashboardData } from './hooks/useDashboardData'

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
  const { metrics, leaderboard, isLoading, error, reload } = useDashboardData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentCapabilitiesAgent | null>(null)
  const [agentToolsById, setAgentToolsById] = useState<Record<string, AgentToolsState>>({})
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false)

  const filteredLeaderboard = useMemo(() => {
    if (!leaderboard.length) return []
    const term = searchTerm.trim().toLowerCase()
    if (!term) return leaderboard
    return leaderboard.filter((agent) => {
      const nameMatches = agent.name.toLowerCase().includes(term)
      const areaMatches = agent.area?.toLowerCase().includes(term) ?? false
      return nameMatches || areaMatches
    })
  }, [leaderboard, searchTerm])

  const showEmptyState = !isLoading && !filteredLeaderboard.length
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : null

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
        <DashboardHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          error={errorMessage}
          onRetry={() => reload()}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
              <p className="mt-4 text-sm text-slate-400">Cargando datos del sistema...</p>
            </div>
          </div>
        )}

        {showEmptyState && !isLoading && (
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

        {!isLoading && !showEmptyState && (
          <div className="space-y-8">
            <DashboardMetrics metrics={metrics} />
            <DashboardTable
              agents={filteredLeaderboard}
              searchTerm={searchTerm}
              onRowClick={handleAgentRowClick}
            />
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
