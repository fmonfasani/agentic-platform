'use client'

import { useCallback } from 'react'

import { cn } from '@/lib/utils'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void | Promise<void>
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Switch({ checked, onChange, disabled = false, size = 'md', className }: SwitchProps) {
  const handleClick = useCallback(() => {
    if (disabled) return

    try {
      const result = onChange(!checked)
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error('Switch toggle error:', error)
        })
      }
    } catch (error) {
      console.error('Switch toggle error:', error)
    }
  }, [checked, disabled, onChange])

  const dimensions = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9'
  const circleSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const translate = checked ? (size === 'sm' ? 'translate-x-3' : 'translate-x-4') : 'translate-x-0.5'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-emerald-500' : 'bg-slate-700',
        dimensions,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200',
          circleSize,
          translate
        )}
      />
    </button>
  )
}
