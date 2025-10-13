import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  className?: string
}

export function Stat({ label, value, icon: Icon, trend, description, className }: StatProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  }

  return (
    <div className={cn(
      'rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-600',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <Icon className={cn('h-5 w-5', trend ? trendColors[trend] : 'text-emerald-400')} />
          </div>
        )}
      </div>
    </div>
  )
}
