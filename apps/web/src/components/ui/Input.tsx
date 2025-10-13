import { forwardRef, InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  error?: string
  label?: string
  size?: 'sm' | 'md'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, size = 'md', ...props }, ref) => {
    const sizeClasses = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-slate-900/50 text-slate-100 placeholder:text-slate-500 transition-all duration-200',
            'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700',
            sizeClasses,
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
