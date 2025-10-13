'use client'

import { PropsWithChildren, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

type AccordionProps = PropsWithChildren<{
  title: string
  defaultOpen?: boolean
  className?: string
}>

export function Accordion({ title, defaultOpen = true, className, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('rounded-lg border border-slate-800/60 bg-slate-900/40', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-900/70"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', open ? 'rotate-180' : 'rotate-0')}
        />
      </button>
      {open && <div className="border-t border-slate-800/60 px-4 py-3 text-sm text-slate-200/80">{children}</div>}
    </div>
  )
}
