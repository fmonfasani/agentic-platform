import { useEffect, useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

type AgentMetrics = {
  id: string
  name: string
  area?: string | null
  description?: string | null
  uses: number
  downloads: number
  rewards: number
  stars: number
  votes: number
}

type MetricAction = 'use' | 'download' | 'reward'

type AgentCardProps = {
  agent: AgentMetrics
  onOpen?: () => void
}

const ACTION_LABEL: Record<MetricAction, string> = {
  use: 'Usar',
  download: 'Descargar',
  reward: 'Recompensar'
}

const ratingOptions = [5, 4, 3, 2, 1]

export default function AgentCard({ agent, onOpen }: AgentCardProps) {
  const [metrics, setMetrics] = useState(agent)
  const [pendingStars, setPendingStars] = useState(5)
  const [busyAction, setBusyAction] = useState<MetricAction | 'rate' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMetrics(agent)
    setError(null)
    setPendingStars(5)
  }, [agent])

  async function updateMetric(type: MetricAction) {
    setBusyAction(type)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/agents/${agent.id}/${type}`, { method: 'POST' })
      if (!res.ok) {
        throw new Error('No se pudo actualizar la métrica')
      }
      const data = (await res.json()) as AgentMetrics
      setMetrics(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setBusyAction(null)
    }
  }

  async function submitRating() {
    setBusyAction('rate')
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/agents/${agent.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: pendingStars })
      })
      if (!res.ok) {
        throw new Error('No se pudo registrar la valoración')
      }
      const data = (await res.json()) as AgentMetrics
      setMetrics(data)
      setPendingStars(5)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setBusyAction(null)
    }
  }

  const votesLabel = metrics.votes === 1 ? 'voto' : 'votos'

  return (
    <div className="p-4 rounded-2xl bg-slate-800 shadow-md hover:shadow-lg transition-all border border-slate-700/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">{metrics.name}</h3>
          {metrics.area && <p className="text-xs text-slate-400">{metrics.area}</p>}
        </div>
        <span className="text-xs text-slate-400">{metrics.votes} {votesLabel}</span>
      </div>

      <div className="flex gap-3 text-sm text-slate-200 mt-3">
        <span>⭐ {metrics.stars.toFixed(1)}</span>
        <span>⚡ {metrics.uses}</span>
        <span>⬇ {metrics.downloads}</span>
        <span>🏆 {metrics.rewards}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(ACTION_LABEL) as MetricAction[]).map((action) => (
          <button
            key={action}
            onClick={() => updateMetric(action)}
            disabled={busyAction === action}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-white text-xs transition"
          >
            {ACTION_LABEL[action]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
        <span>Valorar:</span>
        <select
          value={pendingStars}
          onChange={(event) => setPendingStars(Number(event.target.value))}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-1"
        >
          {ratingOptions.map((value) => (
            <option key={value} value={value}>
              {value} ⭐
            </option>
          ))}
        </select>
        <button
          onClick={submitRating}
          disabled={busyAction === 'rate'}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-xs text-slate-900 font-semibold transition"
        >
          Enviar
        </button>
      </div>

      {onOpen && (
        <button
          onClick={onOpen}
          className="mt-4 text-xs text-blue-300 hover:text-blue-200 underline"
          type="button"
        >
          Abrir flujo de trabajo
        </button>
      )}

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  )
}
