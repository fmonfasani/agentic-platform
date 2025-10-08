'use client'

import { useEffect, useMemo, useState } from 'react'
import { AgentCard } from '@agents-hub/ui'
import { agentGroups, orderedAgentTypes } from '../lib/agents-data'
import { SectionTitle } from '../lib/ui'
import AgentModal from '../components/AgentModal'

type AgentMetrics = {
  id: string
  name: string
  type: keyof typeof agentGroups
  area?: string | null
  uses: number
  downloads: number
  rewards: number
  stars: number
  votes: number
}

type GroupedAgents = Record<string, AgentMetrics[]>

export default function Page() {
  const [agents, setAgents] = useState<AgentMetrics[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAgents() {
      setLoading(true)
      try {
        const res = await fetch('/api/agents', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('No se pudieron obtener los agentes del ENACOM')
        }
        const data = (await res.json()) as AgentMetrics[]
        setAgents(data)
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
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
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
      const res = await fetch(`/api/agents/${agent.id}/run`, {
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

  return (
    <AgentModal open={!!agent} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white/90">{agent?.name ?? 'Agente ENACOM'}</h2>
            {agent?.area && <p className="text-xs text-white/60">{agent.area}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'Análisis Avanzado',
            'Procesamiento de Datos',
            'Visualización',
            'Automatización',
            'Generación de Reportes',
            'Integración API'
          ].map((c) => (
            <span key={c} className="px-3 py-1 text-sm bg-[#1c2736] rounded-lg border border-white/10">
              {c}
            </span>
          ))}
        </div>

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
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {['Archivo', 'Entrada de Voz', 'Video', 'Enlace'].map((label) => (
              <button
                key={label}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#16202f] hover:bg-[#1f2d3f] transition"
              >
                Adjuntar {label}
              </button>
            ))}
          </div>
          <button
            disabled={busy}
            onClick={() => run('Ejecutar Proceso')}
            className="bg-[#16a34a] hover:bg-[#15803d] px-5 py-2 rounded-lg font-semibold text-sm text-white transition"
          >
            ▶ Ejecutar Proceso
          </button>
        </div>
      </div>
    </AgentModal>
  )
}
