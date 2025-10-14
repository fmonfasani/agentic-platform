'use client'

import { ChangeEvent } from 'react'
import { Brain, Globe, Sparkles, X, Zap } from 'lucide-react'

import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/utils'

import { AgentToolsState, WebSearchConfig } from './useAgentCapabilities'

type WebSearchSectionProps = {
  tools: AgentToolsState
  newDomain: string
  onNewDomainChange: (value: string) => void
  onToggle: () => void
  onSearchTypeChange: (type: WebSearchConfig['type']) => void
  onDomainFilteringToggle: () => void
  onAddDomain: () => void
  onRemoveDomain: (domain: string) => void
  onUserLocationChange: (field: 'country' | 'timezone' | 'city' | 'region', value: string) => void
  onShowCitationsToggle: () => void
}

const WebSearchSection: React.FC<WebSearchSectionProps> = ({
  tools,
  newDomain,
  onNewDomainChange,
  onToggle,
  onSearchTypeChange,
  onDomainFilteringToggle,
  onAddDomain,
  onRemoveDomain,
  onUserLocationChange,
  onShowCitationsToggle
}) => {
  const handleLocationChange = (field: 'country' | 'timezone' | 'city' | 'region') => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onUserLocationChange(field, event.target.value)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-sky-400" />
          <div>
            <h3 className="font-semibold text-slate-100">Web Search</h3>
            <p className="text-xs text-slate-400">Búsqueda en tiempo real con citas</p>
          </div>
        </div>
        <Switch checked={tools.web_search.enabled} onChange={onToggle} />
      </div>

      {tools.web_search.enabled && (
        <div className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <SearchTypeCard
              type="non_reasoning"
              label="Quick Search"
              description="Búsquedas rápidas sin planificación"
              icon="zap"
              active={tools.web_search.type === 'non_reasoning'}
              onClick={() => onSearchTypeChange('non_reasoning')}
            />
            <SearchTypeCard
              type="agentic"
              label="Agentic Search"
              description="Búsqueda con razonamiento"
              icon="brain"
              active={tools.web_search.type === 'agentic'}
              onClick={() => onSearchTypeChange('agentic')}
            />
            <SearchTypeCard
              type="deep_research"
              label="Deep Research"
              description="Investigación profunda (minutos)"
              icon="sparkles"
              active={tools.web_search.type === 'deep_research'}
              onClick={() => onSearchTypeChange('deep_research')}
            />
          </div>

          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Filtrado por Dominio</span>
              <Switch size="sm" checked={tools.web_search.domain_filtering_enabled} onChange={onDomainFilteringToggle} />
            </div>

            {tools.web_search.domain_filtering_enabled && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Limita resultados a dominios específicos (máx. 20)</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="openai.com"
                    value={newDomain}
                    onChange={(event) => onNewDomainChange(event.target.value)}
                    className="text-sm"
                  />
                  <Button variant="secondary" size="sm" onClick={onAddDomain}>
                    Agregar
                  </Button>
                </div>

                {tools.web_search.allowed_domains.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tools.web_search.allowed_domains.map((domain) => (
                      <Badge key={domain} variant="info" className="cursor-pointer" onClick={() => onRemoveDomain(domain)}>
                        {domain}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Accordion title="📍 Ubicación del Usuario" defaultOpen={false}>
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                label="País"
                value={tools.web_search.user_location.country}
                onChange={handleLocationChange('country')}
                className="text-sm"
              >
                <option value="US">Estados Unidos</option>
                <option value="AR">Argentina</option>
                <option value="GB">Reino Unido</option>
                <option value="ES">España</option>
              </Select>

              <Select
                label="Timezone"
                value={tools.web_search.user_location.timezone}
                onChange={handleLocationChange('timezone')}
                className="text-sm"
              >
                <option value="America/New_York">America/New_York</option>
                <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                <option value="Europe/London">Europe/London</option>
              </Select>

              <Input
                label="Ciudad"
                placeholder="Buenos Aires"
                value={tools.web_search.user_location.city ?? ''}
                onChange={handleLocationChange('city')}
                className="text-sm"
              />
              <Input
                label="Región"
                placeholder="CABA"
                value={tools.web_search.user_location.region ?? ''}
                onChange={handleLocationChange('region')}
                className="text-sm"
              />
            </div>
          </Accordion>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Mostrar citas inline</p>
              <p className="text-xs text-slate-400">Incluir URLs citadas en respuestas</p>
            </div>
            <Switch size="sm" checked={tools.web_search.show_citations} onChange={onShowCitationsToggle} />
          </div>
        </div>
      )}
    </Card>
  )
}

type SearchTypeCardProps = {
  type: WebSearchConfig['type']
  label: string
  description: string
  icon: 'brain' | 'sparkles' | 'zap'
  active: boolean
  onClick: () => void
}

const iconComponents = {
  brain: Brain,
  sparkles: Sparkles,
  zap: Zap
}

const SearchTypeCard: React.FC<SearchTypeCardProps> = ({ label, description, icon, active, onClick }) => {
  const Icon = iconComponents[icon]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 p-3 text-left transition-all',
        active ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
      )}
    >
      <Icon className={cn('mb-2 h-5 w-5', active ? 'text-emerald-400' : 'text-slate-400')} />
      <p className="text-sm font-semibold text-slate-100">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </button>
  )
}

export default WebSearchSection
