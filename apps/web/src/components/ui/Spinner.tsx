import { cn } from '@/lib/utils'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-slate-700 border-t-emerald-500',
        sizes[size],
        className
      )}
    />
  )
}
