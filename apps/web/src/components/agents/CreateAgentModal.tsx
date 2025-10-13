'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SDKAgentBuilder } from './SDKAgentBuilder'
import { VisualAgentBuilder } from './VisualAgentBuilder'

type Mode = 'visual' | 'sdk' | null

type CreateAgentModalProps = {
  open: boolean
  onClose: () => void
}

const MODES: Array<{
  id: Exclude<Mode, null>
  icon: string
  title: string
  description: string
}> = [
  {
    id: 'visual',
    icon: '✨',
    title: 'Crear Agente Visual',
    description: 'Usá formularios guiados para configurar tu agente sin escribir código.',
  },
  {
    id: 'sdk',
    icon: '🧠',
    title: 'Crear Agente con SDK',
    description: 'Define tu agente directamente con TypeScript o JavaScript utilizando el SDK oficial.',
  },
]

export function CreateAgentModal({ open, onClose }: CreateAgentModalProps) {
  const [mode, setMode] = useState<Mode>(null)

  useEffect(() => {
    if (!open) {
      setMode(null)
    }
  }, [open])

  if (!open) return null

  const handleSuccess = () => {
    onClose()
    setMode(null)
  }

  const handleCancel = () => {
    onClose()
    setMode(null)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-6 py-10">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-950/90 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Crear nuevo agente</h1>
            <p className="mt-1 text-sm text-slate-400">
              Elegí cómo querés configurar tu agente para comenzar en segundos.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            aria-label="Cerrar modal"
          >
            Cerrar
          </Button>
        </div>

        {mode === null ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {MODES.map((option) => (
              <Card
                key={option.id}
                hover
                onClick={() => setMode(option.id)}
                className="flex h-full flex-col gap-4 border border-slate-800/60 bg-slate-900/80 transition-colors duration-200 hover:border-emerald-500"
              >
                <div className="flex flex-1 flex-col gap-3">
                  <span className="text-4xl">{option.icon}</span>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-100">{option.title}</h2>
                    <p className="text-sm text-slate-400">{option.description}</p>
                  </div>
                </div>
                <div className="mt-auto pt-2 text-sm font-medium text-emerald-400">Elegir esta opción →</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
              <span>
                Estás en modo <span className="font-semibold text-emerald-400">{mode === 'sdk' ? 'SDK' : 'Visual'}</span>.
                Podés cambiar en cualquier momento.
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={() => setMode(null)}>
                Cambiar modo
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-6">
              {mode === 'sdk' ? (
                <SDKAgentBuilder onCancel={handleCancel} onSuccess={handleSuccess} />
              ) : (
                <VisualAgentBuilder onCancel={handleCancel} onSuccess={handleSuccess} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
