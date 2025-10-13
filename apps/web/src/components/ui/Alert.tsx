import { ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertProps = {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  className?: string
}

export function Alert({ children, variant = 'info', title, className }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-sky-500/10 border-sky-500/30 text-sky-100',
      icon: Info,
      iconColor: 'text-sky-400'
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100',
      icon: CheckCircle,
      iconColor: 'text-emerald-400'
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
      icon: AlertCircle,
      iconColor: 'text-amber-400'
    },
    error: {
      container: 'bg-red-500/10 border-red-500/30 text-red-100',
      icon: XCircle,
      iconColor: 'text-red-400'
    }
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <div className={cn('rounded-xl border p-4', config.container, className)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          <div className={title ? 'mt-1 text-sm' : 'text-sm'}>{children}</div>
        </div>
      </div>
    </div>
  )
}
