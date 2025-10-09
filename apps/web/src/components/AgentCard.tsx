'use client'

import { memo } from 'react'
import { Download, Star, Trophy, Zap } from 'lucide-react'
import clsx from 'clsx'
import type { AgentType } from '../lib/agents-data'

export type AgentCardData = {
  id: string
  name: string
  area: string
  description?: string | null
  type: AgentType
  uses: number
  downloads: number
  rewards: number
  stars: number
  votes: number
}

type AgentCardProps = {
  agent: AgentCardData
  onDoubleClick?: (agent: AgentCardData) => void
}

function AgentCardComponent({ agent, onDoubleClick }: AgentCardProps) {
  return (
    <button
      type="button"
      onDoubleClick={() => onDoubleClick?.(agent)}
      className={clsx(
        'group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 text-left shadow-lg transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white/90 group-hover:text-emerald-300/90">
            {agent.name}
          </h3>
          <p className="text-xs uppercase tracking-wide text-emerald-300/80">{agent.area}</p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
          Abrir
        </span>
      </div>

      {agent.description && (
        <p className="mt-3 text-sm text-white/60 line-clamp-3">{agent.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/70">
        <Metric icon={<Zap className="h-4 w-4" />} label="Usos" value={agent.uses} />
        <Metric icon={<Download className="h-4 w-4" />} label="Descargas" value={agent.downloads} />
        <Metric icon={<Trophy className="h-4 w-4" />} label="Recompensas" value={agent.rewards} />
        <Metric
          icon={<Star className="h-4 w-4" />}
          label={`Puntaje • ${agent.votes} votos`}
          value={agent.stars.toFixed(1)}
        />
      </div>

      <p className="mt-4 text-[11px] text-white/40">Haga doble click para ver capacidades y ejecutar acciones.</p>
    </button>
  )
}

function Metric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
      <span className="text-emerald-300/90">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="text-sm font-semibold text-white/80">{value}</p>
      </div>
    </div>
  )
}

export const AgentCard = memo(AgentCardComponent)
