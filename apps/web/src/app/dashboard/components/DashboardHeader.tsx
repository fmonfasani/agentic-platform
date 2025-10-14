'use client'

import { ChangeEvent } from 'react'
import { AlertCircle, Search, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type DashboardHeaderProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  error?: string | null
  onRetry?: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ searchTerm, onSearchChange, error, onRetry }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  return (
    <header className="mb-8 space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Sistema de Agentes Autónomos
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-slate-100">Dashboard de Agentes</h1>
        <p className="text-slate-400">Monitoreo y gestión en tiempo real</p>
      </div>

      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-200">Error al cargar los datos</p>
                <p className="mt-1 text-sm text-red-300/80">{error}</p>
              </div>
            </div>
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Reintentar
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Buscar agente por nombre o área..."
          className="pl-12"
        />
      </div>
    </header>
  )
}

export default DashboardHeader
