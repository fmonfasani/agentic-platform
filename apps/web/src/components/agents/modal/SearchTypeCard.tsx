'use client'

import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type SearchTypeCardProps = {
  type: string
  label: string
  description: string
  icon: LucideIcon
  active: boolean
  onClick: () => void
}

export function SearchTypeCard({ type, label, description, icon: Icon, active, onClick }: SearchTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-search-type={type}
      className={cn(
        'rounded-lg border-2 p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
        active
          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
      )}
    >
      <Icon className={cn('mb-2 h-5 w-5', active ? 'text-emerald-400' : 'text-slate-400')} />
      <p className={cn('mb-1 text-sm font-semibold', active ? 'text-emerald-300' : 'text-slate-200')}>{label}</p>
      <p className="text-xs leading-tight text-slate-400">{description}</p>
    </button>
  )
}
