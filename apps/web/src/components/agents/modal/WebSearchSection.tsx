'use client'

import { useState } from 'react'
import { Brain, Globe, Sparkles, Zap, X } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Accordion } from '@/components/ui/Accordion'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import type { Agent } from '@/types/agent'

import { SearchTypeCard } from './SearchTypeCard'

type WebSearchSectionProps = {
  agent: Agent
  onUpdate: (updates: Partial<Agent>) => Promise<void>
}

type SearchMode = 'non_reasoning' | 'agentic' | 'deep_research'

type DomainCleaner = (domain: string) => string

const cleanDomain: DomainCleaner = (domain) =>
  domain.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase()

export function WebSearchSection({ agent, onUpdate }: WebSearchSectionProps) {
  const [newDomain, setNewDomain] = useState('')

  const updateWebSearch = async (updates: Partial<Agent['tools']['web_search']>) => {
    await onUpdate({
      tools: {
        ...agent.tools,
        web_search: {
          ...agent.tools.web_search,
          ...updates
        }
      }
    })
  }

  const handleToggleWebSearch = async (enabled: boolean) => {
    await updateWebSearch({ enabled })
  }

  const handleSearchTypeChange = async (type: SearchMode) => {
    await updateWebSearch({ type })
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return

    const clean = cleanDomain(newDomain)
    const currentDomains = [...(agent.tools.web_search.allowed_domains ?? [])]

    if (currentDomains.includes(clean)) {
      window.alert('Dominio ya agregado')
      return
    }

    if (currentDomains.length >= 20) {
      window.alert('Máximo 20 dominios permitidos')
      return
    }

    currentDomains.push(clean)
    await updateWebSearch({ allowed_domains: currentDomains })
    setNewDomain('')
  }

  const handleRemoveDomain = async (domain: string) => {
    const filtered = (agent.tools.web_search.allowed_domains ?? []).filter((item) => item !== domain)
    await updateWebSearch({ allowed_domains: filtered })
  }

  const handleToggleDomainFiltering = async (enabled: boolean) => {
    await updateWebSearch({ domain_filtering_enabled: enabled })
  }

  const handleLocationChange = async (field: 'country' | 'timezone' | 'city' | 'region', value: string) => {
    await updateWebSearch({
      user_location: {
        ...agent.tools.web_search.user_location,
        [field]: value
      }
    })
  }

  const handleToggleShowCitations = async (enabled: boolean) => {
    await updateWebSearch({ show_citations: enabled })
  }

  const handleToggleIncludeSources = async (enabled: boolean) => {
    await updateWebSearch({ include_sources: enabled })
  }

  const allowedDomains = agent.tools.web_search.allowed_domains ?? []
  const userLocation = agent.tools.web_search.user_location ?? {}

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-sky-400" />
          <div>
            <h3 className="font-semibold">Web Search</h3>
            <p className="text-xs text-slate-400">Búsqueda en tiempo real con citas</p>
          </div>
        </div>
        <Switch checked={agent.tools.web_search.enabled} onChange={handleToggleWebSearch} />
      </div>

      {agent.tools.web_search.enabled && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Tipo de Búsqueda</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <SearchTypeCard
                type="non_reasoning"
                label="Quick Search"
                description="Rápida sin planificación"
                icon={Zap}
                active={agent.tools.web_search.type === 'non_reasoning'}
                onClick={() => handleSearchTypeChange('non_reasoning')}
              />
              <SearchTypeCard
                type="agentic"
                label="Agentic Search"
                description="Con razonamiento"
                icon={Brain}
                active={agent.tools.web_search.type === 'agentic'}
                onClick={() => handleSearchTypeChange('agentic')}
              />
              <SearchTypeCard
                type="deep_research"
                label="Deep Research"
                description="Investigación profunda"
                icon={Sparkles}
                active={agent.tools.web_search.type === 'deep_research'}
                onClick={() => handleSearchTypeChange('deep_research')}
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Filtrado por Dominio</span>
              <Switch
                size="sm"
                checked={agent.tools.web_search.domain_filtering_enabled}
                onChange={handleToggleDomainFiltering}
              />
            </div>

            {agent.tools.web_search.domain_filtering_enabled && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Limita resultados a dominios específicos (máx. 20)</p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="openai.com"
                    size="sm"
                    value={newDomain}
                    onChange={(event) => setNewDomain(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleAddDomain()
                      }
                    }}
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddDomain}>
                    Agregar
                  </Button>
                </div>

                {allowedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {allowedDomains.map((domain) => (
                      <Badge
                        key={domain}
                        variant="info"
                        className="flex items-center gap-1.5 hover:bg-sky-500/20"
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="rounded-full p-0.5 transition-colors hover:bg-slate-800"
                          aria-label={`Eliminar dominio ${domain}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Accordion title="📍 Ubicación del Usuario" defaultOpen={false}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Select
                label="País"
                size="sm"
                value={userLocation.country ?? ''}
                onChange={(event) => handleLocationChange('country', event.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                <option value="US">Estados Unidos</option>
                <option value="AR">Argentina</option>
                <option value="GB">Reino Unido</option>
                <option value="ES">España</option>
                <option value="MX">México</option>
                <option value="CL">Chile</option>
              </Select>

              <Select
                label="Timezone"
                size="sm"
                value={userLocation.timezone ?? ''}
                onChange={(event) => handleLocationChange('timezone', event.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
                <option value="America/Mexico_City">America/Mexico_City</option>
              </Select>

              <Input
                label="Ciudad"
                placeholder="Buenos Aires"
                size="sm"
                value={userLocation.city ?? ''}
                onChange={(event) => handleLocationChange('city', event.target.value)}
              />

              <Input
                label="Región"
                placeholder="CABA"
                size="sm"
                value={userLocation.region ?? ''}
                onChange={(event) => handleLocationChange('region', event.target.value)}
              />
            </div>
          </Accordion>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div>
              <p className="text-sm font-medium">Mostrar citas inline</p>
              <p className="text-xs text-slate-400">Incluir URLs citadas en respuestas</p>
            </div>
            <Switch
              size="sm"
              checked={agent.tools.web_search.show_citations ?? true}
              onChange={handleToggleShowCitations}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div>
              <p className="text-sm font-medium">Incluir fuentes completas</p>
              <p className="text-xs text-slate-400">Lista completa de URLs consultadas</p>
            </div>
            <Switch
              size="sm"
              checked={agent.tools.web_search.include_sources ?? false}
              onChange={handleToggleIncludeSources}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
