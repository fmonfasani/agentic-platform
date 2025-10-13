'use client'
import { CreateAgentButton } from '@/components/agents/CreateAgentButton'

export default function AgentsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold text-white mb-6">
        🌐 Plataforma de Agentes
      </h1>

      <CreateAgentButton />
    </div>
  )
}
