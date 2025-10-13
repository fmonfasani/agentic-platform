'use client'

import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideCloseButton?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
  hideCloseButton = false,
  className
}: ModalProps) {
  const sizes: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'relative w-full rounded-2xl border border-slate-800/70 bg-slate-950/95 p-6 text-slate-100 shadow-2xl',
              sizes[size],
              className
            )}
          >
            {(title || description) && (
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  {title && <h2 className="text-lg font-semibold text-slate-100">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
                </div>
                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {!title && !description && !hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
