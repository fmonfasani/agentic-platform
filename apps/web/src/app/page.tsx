'use client'

import { useEffect, useMemo, useState } from 'react'
import { AgentCard } from '@agents-hub/ui'
import { agentGroups, orderedAgentTypes, AgentType } from '../lib/agents-data'
import { SectionTitle } from '../lib/ui'
import AgentModal from '../components/AgentModal'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

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
}

type AgentMetrics = AgentSummary & { type: AgentType }

type GroupedAgents = Record<string, AgentMetrics[]>

type AgentDetail = {
  id: string
  name: string
  area: string
  description: string | null
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

export default function Page() {
  const [agents, setAgents] = useState<AgentMetrics[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAgents() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/agents`, { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('No se pudieron obtener los agentes del ENACOM')
        }
        const data = (await res.json()) as AgentSummary[]
        const enriched = data.map((agent) => ({
          ...agent,
          type: inferAgentType(agent.name)
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
      if (!acc[agent.type]) {
        acc[agent.type] = []
      }
      acc[agent.type].push(agent)
      return acc
    }, {})
  }, [agents])

  const selectedAgent = useMemo(() => agents.find((agent) => agent.id === openId) ?? null, [agents, openId])

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

              if (agentsForType.length === 0) {
                return null
              }

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

      <AgentWorkflowModal agent={selectedAgent} onClose={() => setOpenId(null)} />
    </div>
  )
}

type WorkflowModalProps = {
  agent: AgentMetrics | null
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

        {metrics && (
          <div className="grid grid-cols-2 gap-3 text-xs text-white/80">
            <MetricPill label="⭐ Promedio" value={metrics.stars.toFixed(1)} />
            <MetricPill label="🗳️ Votos" value={metrics.votes.toString()} />
            <MetricPill label="⚡ Usos" value={metrics.uses.toString()} />
            <MetricPill label="⬇ Descargas" value={metrics.downloads.toString()} />
            <MetricPill label="🏆 Recompensas" value={metrics.rewards.toString()} />
          </div>
        )}

        {workflows.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/80">Workflows disponibles</h3>
            <ul className="space-y-2 text-xs text-white/70">
              {workflows.map((workflow) => (
                <li
                  key={workflow.id}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <p className="font-medium text-white/90">{workflow.name}</p>
                  <p className="text-[11px] text-white/50">
                    Estado: {workflow.status} · Modelo: {workflow.model} · Plataforma: {workflow.platform}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl bg-[#101b29] border border-white/10 p-4 space-y-3 text-sm text-white/80">
          {log.map((message, index) => (
            <div
              key={index}
              className={`rounded-md px-3 py-2 ${
                index === 0 ? 'bg-green-500/10 text-white/90' : 'bg-white/15 text-white/80'
              }`}
            >
              {message}
            </div>
          ))}
          <textarea
            className="w-full h-24 rounded-xl bg-[#0b131f] border border-white/10 p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
            placeholder="Ingrese su consulta o instrucciones..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => run('workflow-estrategico')}
              disabled={busy}
              className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              Ejecutar análisis
            </button>
            <button
              onClick={() => run('descargar-reporte')}
              disabled={busy}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-blue-950 hover:bg-blue-400 disabled:opacity-50"
            >
              Descargar reporte
            </button>
          </div>
        </div>
      </div>
    </AgentModal>
  )
}

function inferAgentType(name: string): AgentType {
  if (name.toLowerCase().includes('reporte') || name.toLowerCase().includes('informe') || name.toLowerCase().includes('generador')) {
    return 'Report'
  }
  return 'Analyst'
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-white/50">{label}</p>
      <p className="text-sm font-semibold text-white/90">{value}</p>
    </div>
  )
}
