'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CreateAgentModal } from './CreateAgentModal'

export function CreateAgentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="lg"
        variant="primary"
        onClick={() => {
          console.log('🪄 Click detectado: abrir modal')
          setOpen(true)
        }}
        className="shadow-lg shadow-emerald-500/20"
      >
        🪄 Crear mi Primer Agente
      </Button>

      {/* Modal con log de montaje */}
      <CreateAgentModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
