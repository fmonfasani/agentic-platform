'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { PropsWithChildren } from 'react'

export function AgentModal({ open, onClose, title, children }: PropsWithChildren<{
  open: boolean
  onClose: () => void
  title: string
}>) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-3xl rounded-2xl bg-blue800 border border-white/10 shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green500" />
                <span className="px-2 py-1 rounded-md bg-slate700 text-white text-sm font-semibold">{title}</span>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
