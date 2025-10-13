'use client'

import { KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
  id?: string
  'aria-label'?: string
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
  ...props
}: SwitchProps) {
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      knob: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-11 h-6',
      knob: 'h-5 w-5',
      translate: 'translate-x-5'
    }
  } as const

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex items-center rounded-full border border-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-emerald-500' : 'bg-slate-600/70',
        sizes[size].track,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block transform rounded-full bg-white shadow transition-transform duration-200',
          sizes[size].knob,
          checked ? sizes[size].translate : 'translate-x-1'
        )}
      />
    </button>
  )
}
