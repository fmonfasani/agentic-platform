'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type AgentModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function AgentModal({ open, onClose, title, description, children }: AgentModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl rounded-2xl bg-[#0c1622] p-6 text-white shadow-2xl border border-white/10"
          >
            {(title || description) && (
              <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-4">
                <div>
                  {title && <h2 className="text-lg font-semibold text-white/90">{title}</h2>}
                  {description && <p className="text-xs text-white/60 mt-1">{description}</p>}
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md" aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Contenido dinámico */}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
