import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/20 p-12 text-center">
      <div className="rounded-full bg-slate-800 p-4">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
