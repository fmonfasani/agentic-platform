import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'danger'

type BadgeProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  variant?: BadgeVariant
}

const VARIANT_STYLES: Record<Exclude<BadgeVariant, 'danger'>, string> = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600',
  secondary: 'bg-slate-500/10 text-slate-200 border-slate-500/40',
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  error: 'bg-red-500/10 text-red-300 border-red-500/30'
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const resolvedVariant = variant === 'danger' ? 'error' : variant

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        VARIANT_STYLES[resolvedVariant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
