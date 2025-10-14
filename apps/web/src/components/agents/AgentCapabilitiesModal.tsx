'use client'

import { ChangeEvent, ComponentType, useEffect, useMemo, useRef, useState } from 'react'
import {
  Brain,
  Calendar,
  Cloud,
  FolderOpen,
  FileText,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Plug,
  Plus,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap
} from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Input } from '@/components/ui/Input'
import { Accordion } from '@/components/ui/Accordion'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

type FileSearchFile = {
  id: string
  filename: string
  bytes: number
  created_at: number
}

type FileSearchConfig = {
  enabled: boolean
  vector_store_id: string | null
  file_count: number
  max_num_results: number
  files: FileSearchFile[]
}

type WebSearchConfig = {
  enabled: boolean
  type: 'non_reasoning' | 'agentic' | 'deep_research'
  domain_filtering_enabled: boolean
  allowed_domains: string[]
  user_location: {
    country: string
    timezone: string
    city?: string
    region?: string
  }
  show_citations: boolean
}

type MCPConnector = {
  id: string
  connector_id: string
  name: string
  status: 'active' | 'pending' | 'error'
  tools_count: number
  require_approval: 'always' | 'never'
}

type MCPRemoteServer = {
  id: string
  server_label: string
  server_url: string
  server_description?: string | null
  status: 'connected' | 'disconnected' | 'error'
  require_approval: 'always' | 'never'
  allowed_tools?: string[]
}

type MCPConfig = {
  connectors: MCPConnector[]
  remote_servers: MCPRemoteServer[]
}

export type AgentToolsState = {
  file_search: FileSearchConfig
  web_search: WebSearchConfig
  mcp: MCPConfig
}

export type AgentCapabilitiesAgent = {
  id: string
  name: string
  area: string | null
  status: 'active' | 'paused' | 'draft'
  tools: AgentToolsState
}

type AgentCapabilitiesModalProps = {
  agent: AgentCapabilitiesAgent | null
  open: boolean
  onClose: () => void
  onToolsChange?: (agentId: string, tools: AgentToolsState) => void
}

type ConnectorCatalogItem = {
  id: string
  name: string
  icon: string
}

const connectorCatalog: ConnectorCatalogItem[] = [
  { id: 'connector_dropbox', name: 'Dropbox', icon: '📦' },
  { id: 'connector_gmail', name: 'Gmail', icon: '✉️' },
  { id: 'connector_googlecalendar', name: 'Google Calendar', icon: '📅' },
  { id: 'connector_googledrive', name: 'Google Drive', icon: '📁' },
  { id: 'connector_microsoftteams', name: 'Microsoft Teams', icon: '💬' },
  { id: 'connector_outlookcalendar', name: 'Outlook Calendar', icon: '📆' },
  { id: 'connector_outlookemail', name: 'Outlook Email', icon: '📧' },
  { id: 'connector_sharepoint', name: 'SharePoint', icon: '🗂️' }
]

type AddConnectorPayload = {
  type: 'connector'
  connector_id: string
  authorization: string
  require_approval: 'always' | 'never'
}

type AddRemoteServerPayload = {
  type: 'remote_server'
  server_label: string
  server_url: string
  server_description?: string
  authorization?: string
  require_approval: 'always' | 'never'
  allowed_tools?: string[]
}

type AddMCPPayload = AddConnectorPayload | AddRemoteServerPayload

type MetadataFilterState = {
  type: 'in' | 'eq' | 'ne'
  key: string
  value: string
}

export function AgentCapabilitiesModal({ agent, open, onClose, onToolsChange }: AgentCapabilitiesModalProps) {
  const [toolsState, setToolsState] = useState<AgentToolsState | null>(agent?.tools ?? null)
  const [uploading, setUploading] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [showAddMCP, setShowAddMCP] = useState(false)
  const [metadataFilter, setMetadataFilter] = useState<MetadataFilterState>({ type: 'in', key: '', value: '' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setToolsState(agent?.tools ?? null)
  }, [agent?.id, agent?.tools])

  useEffect(() => {
    setNewDomain('')
    setMetadataFilter({ type: 'in', key: '', value: '' })
  }, [agent?.id])

  const tools = toolsState ?? agent?.tools ?? null

  const updateTools = (updater: (prev: AgentToolsState) => AgentToolsState) => {
    setToolsState((prev) => {
      const base = prev ?? agent?.tools
      if (!base || !agent) return prev ?? null
      const next = updater(base)
      onToolsChange?.(agent.id, next)
      return next
    })
  }

  const handleToggleFileSearch = () => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      file_search: { ...prev.file_search, enabled: !prev.file_search.enabled }
    }))
  }

  const handleMaxResultsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    if (!Number.isFinite(value) || !tools) return
    updateTools((prev) => ({
      ...prev,
      file_search: {
        ...prev.file_search,
        max_num_results: Math.max(1, Math.min(50, Math.round(value)))
      }
    }))
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!tools) return
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    setUploading(true)

    const uploaded: FileSearchFile[] = files.map((file) => ({
      id: `file_${Math.random().toString(36).slice(2, 10)}`,
      filename: file.name,
      bytes: file.size,
      created_at: Math.floor(Date.now() / 1000)
    }))

    updateTools((prev) => {
      const mergedFiles = [...prev.file_search.files, ...uploaded]
      return {
        ...prev,
        file_search: {
          ...prev.file_search,
          files: mergedFiles,
          file_count: mergedFiles.length
        }
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setUploading(false)
  }

  const handleDeleteFile = (fileId: string) => {
    if (!tools) return
    updateTools((prev) => {
      const remaining = prev.file_search.files.filter((file) => file.id !== fileId)
      return {
        ...prev,
        file_search: {
          ...prev.file_search,
          files: remaining,
          file_count: remaining.length
        }
      }
    })
  }

  const handleSearchTypeChange = (type: WebSearchConfig['type']) => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      web_search: { ...prev.web_search, type }
    }))
  }

  const handleDomainFilteringToggle = () => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      web_search: {
        ...prev.web_search,
        domain_filtering_enabled: !prev.web_search.domain_filtering_enabled,
        allowed_domains: !prev.web_search.domain_filtering_enabled ? prev.web_search.allowed_domains : []
      }
    }))
  }

  const handleToggleWebSearch = () => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      web_search: {
        ...prev.web_search,
        enabled: !prev.web_search.enabled
      }
    }))
  }

  const handleAddDomain = () => {
    if (!tools) return
    const domain = newDomain.trim().toLowerCase()
    if (!domain || tools.web_search.allowed_domains.includes(domain) || tools.web_search.allowed_domains.length >= 20) {
      return
    }
    updateTools((prev) => ({
      ...prev,
      web_search: {
        ...prev.web_search,
        allowed_domains: [...prev.web_search.allowed_domains, domain]
      }
    }))
    setNewDomain('')
  }

  const handleRemoveDomain = (domain: string) => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      web_search: {
        ...prev.web_search,
        allowed_domains: prev.web_search.allowed_domains.filter((item) => item !== domain)
      }
    }))
  }

  const handleUserLocationChange = (field: 'country' | 'timezone' | 'city' | 'region', value: string) => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      web_search: {
        ...prev.web_search,
        user_location: {
          ...prev.web_search.user_location,
          [field]: value
        }
      }
    }))
  }

  const handleShowCitationsToggle = () => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      web_search: {
        ...prev.web_search,
        show_citations: !prev.web_search.show_citations
      }
    }))
  }

  const handleRemoveConnector = (connectorId: string) => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      mcp: {
        ...prev.mcp,
        connectors: prev.mcp.connectors.filter((connector) => connector.id !== connectorId)
      }
    }))
  }

  const handleRemoveServer = (serverId: string) => {
    if (!tools) return
    updateTools((prev) => ({
      ...prev,
      mcp: {
        ...prev.mcp,
        remote_servers: prev.mcp.remote_servers.filter((server) => server.id !== serverId)
      }
    }))
  }

  const handleConfigureConnector = (connector: MCPConnector) => {
    console.info('Configure connector', connector)
  }

  const handleConfigureServer = (server: MCPRemoteServer) => {
    console.info('Configure MCP server', server)
  }

  const handleAddMCP = async (payload: AddMCPPayload) => {
    if (!tools) return

    if (payload.type === 'connector') {
      const catalogEntry = connectorCatalog.find((item) => item.id === payload.connector_id)
      if (!catalogEntry) return

      const newConnector: MCPConnector = {
        id: `connector_${Math.random().toString(36).slice(2, 9)}`,
        connector_id: payload.connector_id,
        name: catalogEntry.name,
        status: 'pending',
        tools_count: 0,
        require_approval: payload.require_approval
      }

      updateTools((prev) => ({
        ...prev,
        mcp: {
          ...prev.mcp,
          connectors: [...prev.mcp.connectors, newConnector]
        }
      }))
    } else {
      const newServer: MCPRemoteServer = {
        id: `server_${Math.random().toString(36).slice(2, 9)}`,
        server_label: payload.server_label,
        server_url: payload.server_url,
        server_description: payload.server_description,
        status: 'connected',
        require_approval: payload.require_approval,
        allowed_tools: payload.allowed_tools?.length ? payload.allowed_tools : undefined
      }

      updateTools((prev) => ({
        ...prev,
        mcp: {
          ...prev.mcp,
          remote_servers: [...prev.mcp.remote_servers, newServer]
        }
      }))
    }

    setShowAddMCP(false)
  }

  if (!agent || !tools) {
    return null
  }

  const connectorIconMap: Record<string, JSX.Element> = {
    connector_dropbox: <Cloud className="h-5 w-5 text-sky-300" />,
    connector_gmail: <Mail className="h-5 w-5 text-red-400" />,
    connector_googlecalendar: <Calendar className="h-5 w-5 text-blue-300" />,
    connector_googledrive: <FolderOpen className="h-5 w-5 text-emerald-300" />,
    connector_microsoftteams: <MessageSquare className="h-5 w-5 text-violet-300" />,
    connector_outlookcalendar: <Calendar className="h-5 w-5 text-sky-400" />,
    connector_outlookemail: <Mail className="h-5 w-5 text-blue-300" />,
    connector_sharepoint: <FolderOpen className="h-5 w-5 text-blue-300" />
  }

  const statusVariant: 'success' | 'warning' | 'default' =
    agent.status === 'active' ? 'success' : agent.status === 'paused' ? 'warning' : 'default'

  const handleMetadataChange = (field: keyof MetadataFilterState, value: string) => {
    setMetadataFilter((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Modal open={open} onClose={onClose} size="xl" className="max-w-5xl" hideCloseButton>
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{agent.name}</h2>
            <p className="text-sm text-slate-400">{agent.area ?? 'Sin área definida'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant}>{agent.status}</Badge>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-slate-100">File Search</h3>
                  <p className="text-xs text-slate-400">Búsqueda semántica en archivos subidos</p>
                </div>
              </div>
              <Switch checked={tools.file_search.enabled} onChange={handleToggleFileSearch} />
            </div>

            {tools.file_search.enabled && (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">Vector Store</span>
                    <Badge variant={tools.file_search.vector_store_id ? 'info' : 'default'}>
                      {tools.file_search.vector_store_id ? 'Configurado' : 'Sin configurar'}
                    </Badge>
                  </div>

                  {tools.file_search.vector_store_id && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ID:</span>
                        <code className="text-emerald-400">{tools.file_search.vector_store_id}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Archivos:</span>
                        <span className="font-medium text-slate-100">{tools.file_search.file_count}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Max Results:</span>
                        <Input
                          type="number"
                          value={tools.file_search.max_num_results}
                          onChange={handleMaxResultsChange}
                          className="h-8 w-20 rounded-md px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border-2 border-dashed border-slate-700 p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.json,.docx,.pptx,.py,.js,.ts"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <Upload className="mx-auto mb-2 h-8 w-8 text-slate-500" />
                  <p className="text-sm text-slate-300">Subir archivos al Vector Store</p>
                  <p className="mb-3 text-xs text-slate-500">PDF, TXT, MD, JSON, DOCX, código (hasta 512MB cada uno)</p>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Seleccionar Archivos
                      </>
                    )}
                  </Button>
                </div>

                {tools.file_search.files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-200">Archivos en Vector Store</h4>
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                      {tools.file_search.files.map((file) => (
                        <FileRow key={file.id} file={file} onDelete={handleDeleteFile} />
                      ))}
                    </div>
                  </div>
                )}

                <Accordion title="🔍 Filtrado por Metadata" defaultOpen={false}>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Filtra resultados de búsqueda según metadata de archivos
                    </p>

                    <Select
                      value={metadataFilter.type}
                      onChange={(event) => handleMetadataChange('type', event.target.value as MetadataFilterState['type'])}
                      className="text-sm"
                    >
                      <option value="in">En (in)</option>
                      <option value="eq">Igual a (eq)</option>
                      <option value="ne">Diferente de (ne)</option>
                    </Select>

                    <Input
                      label="Key"
                      placeholder="category"
                      value={metadataFilter.key}
                      onChange={(event) => handleMetadataChange('key', event.target.value)}
                      className="text-sm"
                    />
                    <Input
                      label="Value"
                      placeholder="blog,announcement"
                      value={metadataFilter.value}
                      onChange={(event) => handleMetadataChange('value', event.target.value)}
                      className="text-sm"
                    />

                    <Button variant="ghost" size="sm" className="w-full justify-center">
                      Agregar Filtro
                    </Button>
                  </div>
                </Accordion>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-sky-400" />
                <div>
                  <h3 className="font-semibold text-slate-100">Web Search</h3>
                  <p className="text-xs text-slate-400">Búsqueda en tiempo real con citas</p>
                </div>
              </div>
              <Switch checked={tools.web_search.enabled} onChange={handleToggleWebSearch} />
            </div>

            {tools.web_search.enabled && (
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-3">
                  <SearchTypeCard
                    type="non_reasoning"
                    label="Quick Search"
                    description="Búsquedas rápidas sin planificación"
                    icon={Zap}
                    active={tools.web_search.type === 'non_reasoning'}
                    onClick={() => handleSearchTypeChange('non_reasoning')}
                  />
                  <SearchTypeCard
                    type="agentic"
                    label="Agentic Search"
                    description="Búsqueda con razonamiento"
                    icon={Brain}
                    active={tools.web_search.type === 'agentic'}
                    onClick={() => handleSearchTypeChange('agentic')}
                  />
                  <SearchTypeCard
                    type="deep_research"
                    label="Deep Research"
                    description="Investigación profunda (minutos)"
                    icon={Sparkles}
                    active={tools.web_search.type === 'deep_research'}
                    onClick={() => handleSearchTypeChange('deep_research')}
                  />
                </div>

                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">Filtrado por Dominio</span>
                    <Switch
                      size="sm"
                      checked={tools.web_search.domain_filtering_enabled}
                      onChange={handleDomainFilteringToggle}
                    />
                  </div>

                  {tools.web_search.domain_filtering_enabled && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">Limita resultados a dominios específicos (máx. 20)</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="openai.com"
                          value={newDomain}
                          onChange={(event) => setNewDomain(event.target.value)}
                          className="text-sm"
                        />
                        <Button variant="secondary" size="sm" onClick={handleAddDomain}>
                          Agregar
                        </Button>
                      </div>

                      {tools.web_search.allowed_domains.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tools.web_search.allowed_domains.map((domain) => (
                            <Badge
                              key={domain}
                              variant="info"
                              className="cursor-pointer"
                              onClick={() => handleRemoveDomain(domain)}
                            >
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
                      onChange={(event) => handleUserLocationChange('country', event.target.value)}
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
                      onChange={(event) => handleUserLocationChange('timezone', event.target.value)}
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
                      onChange={(event) => handleUserLocationChange('city', event.target.value)}
                      className="text-sm"
                    />
                    <Input
                      label="Región"
                      placeholder="CABA"
                      value={tools.web_search.user_location.region ?? ''}
                      onChange={(event) => handleUserLocationChange('region', event.target.value)}
                      className="text-sm"
                    />
                  </div>
                </Accordion>

                <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Mostrar citas inline</p>
                    <p className="text-xs text-slate-400">Incluir URLs citadas en respuestas</p>
                  </div>
                  <Switch size="sm" checked={tools.web_search.show_citations} onChange={handleShowCitationsToggle} />
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plug className="h-6 w-6 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-slate-100">MCP Connectors &amp; Servers</h3>
                  <p className="text-xs text-slate-400">Conecta con servicios externos</p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowAddMCP(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>

            {tools.mcp.connectors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-200">Connectors Activos</h4>
                {tools.mcp.connectors.map((connector) => (
                  <ConnectorCard
                    key={connector.id}
                    connector={connector}
                    icon={connectorIconMap[connector.connector_id]}
                    onRemove={handleRemoveConnector}
                    onConfigure={handleConfigureConnector}
                  />
                ))}
              </div>
            )}

            {tools.mcp.remote_servers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-200">Remote MCP Servers</h4>
                {tools.mcp.remote_servers.map((server) => (
                  <MCPServerCard
                    key={server.id}
                    server={server}
                    onRemove={handleRemoveServer}
                    onConfigure={handleConfigureServer}
                  />
                ))}
              </div>
            )}

            {tools.mcp.connectors.length === 0 && tools.mcp.remote_servers.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <Plug className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No hay connectors configurados</p>
                <p className="mt-1 text-xs">Agrega connectors o servidores MCP para extender capacidades</p>
              </div>
            )}
          </Card>
        </div>
      </Modal>

      <AddMCPModal
        open={showAddMCP}
        onClose={() => setShowAddMCP(false)}
        onAdd={handleAddMCP}
      />
    </>
  )
}

type FileRowProps = {
  file: FileSearchFile
  onDelete: (id: string) => void
}

function FileRow({ file, onDelete }: FileRowProps) {
  return (
    <div className="group flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileText className="h-4 w-4 flex-shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-100">{file.filename}</p>
          <p className="text-xs text-slate-400">
            {(file.bytes / 1024).toFixed(2)} KB • {new Date(file.created_at * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(file.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
    </div>
  )
}

type SearchTypeCardProps = {
  type: WebSearchConfig['type']
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  active: boolean
  onClick: () => void
}

function SearchTypeCard({ type: _type, label, description, icon: Icon, active, onClick }: SearchTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 p-3 text-left transition-all',
        active
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
      )}
    >
      <Icon className={cn('mb-2 h-5 w-5', active ? 'text-emerald-400' : 'text-slate-400')} />
      <p className="text-sm font-semibold text-slate-100">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </button>
  )
}

type ConnectorCardProps = {
  connector: MCPConnector
  icon?: JSX.Element
  onRemove: (id: string) => void
  onConfigure: (connector: MCPConnector) => void
}

function ConnectorCard({ connector, icon, onRemove, onConfigure }: ConnectorCardProps) {
  return (
    <div className="group flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/60">
          {icon ?? <Plug className="h-5 w-5 text-purple-300" />}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-100">{connector.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={connector.status === 'active' ? 'success' : connector.status === 'pending' ? 'warning' : 'danger'}>
              {connector.status}
            </Badge>
            <span className="text-xs text-slate-400">{connector.tools_count} herramientas</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="sm" onClick={() => onConfigure(connector)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onRemove(connector.id)}>
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </div>
  )
}

type MCPServerCardProps = {
  server: MCPRemoteServer
  onRemove: (id: string) => void
  onConfigure: (server: MCPRemoteServer) => void
}

function MCPServerCard({ server, onRemove, onConfigure }: MCPServerCardProps) {
  return (
    <div className="group flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
          <Server className="h-5 w-5 text-purple-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">{server.server_label}</p>
          <p className="truncate text-xs text-slate-400">{server.server_url}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={server.status === 'connected' ? 'success' : 'danger'}>{server.status}</Badge>
            <Badge variant="info">
              {server.require_approval === 'never' ? 'Auto' : 'Manual'} approval
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="sm" onClick={() => onConfigure(server)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onRemove(server.id)}>
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </div>
  )
}

type AddMCPModalProps = {
  open: boolean
  onClose: () => void
  onAdd: (payload: AddMCPPayload) => Promise<void> | void
}

function AddMCPModal({ open, onClose, onAdd }: AddMCPModalProps) {
  const [mode, setMode] = useState<'connector' | 'remote' | null>(null)

  useEffect(() => {
    if (!open) {
      setMode(null)
    }
  }, [open])

  if (!open) return null

  if (!mode) {
    return (
      <Modal open={open} onClose={onClose} title="Agregar MCP" size="md">
        <div className="grid gap-4 md:grid-cols-2">
          <Card hover onClick={() => setMode('connector')} className="cursor-pointer p-6 text-center">
            <Plug className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
            <h3 className="mb-2 font-semibold text-slate-100">Connector</h3>
            <p className="text-xs text-slate-400">
              Servicios oficiales: Dropbox, Gmail, Google Drive, etc.
            </p>
          </Card>

          <Card hover onClick={() => setMode('remote')} className="cursor-pointer p-6 text-center">
            <Server className="mx-auto mb-3 h-10 w-10 text-purple-400" />
            <h3 className="mb-2 font-semibold text-slate-100">Remote MCP Server</h3>
            <p className="text-xs text-slate-400">Servidor personalizado con protocolo MCP</p>
          </Card>
        </div>
      </Modal>
    )
  }

  if (mode === 'connector') {
    return <AddConnectorForm onClose={onClose} onAdd={onAdd} />
  }

  return <AddRemoteServerForm onClose={onClose} onAdd={onAdd} />
}

type AddConnectorFormProps = {
  onClose: () => void
  onAdd: (payload: AddMCPPayload) => Promise<void> | void
}

function AddConnectorForm({ onClose, onAdd }: AddConnectorFormProps) {
  const [selectedConnector, setSelectedConnector] = useState('')
  const [oauthToken, setOauthToken] = useState('')
  const [requireApproval, setRequireApproval] = useState<'always' | 'never'>('always')

  const handleSubmit = async () => {
    if (!selectedConnector || !oauthToken) return
    await onAdd({
      type: 'connector',
      connector_id: selectedConnector,
      authorization: oauthToken,
      require_approval: requireApproval
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Agregar Connector" size="md">
      <div className="space-y-4">
        <Select
          label="Seleccionar Connector"
          value={selectedConnector}
          onChange={(event) => setSelectedConnector(event.target.value)}
        >
          <option value="">-- Seleccionar --</option>
          {connectorCatalog.map((connector) => (
            <option key={connector.id} value={connector.id}>
              {connector.icon} {connector.name}
            </option>
          ))}
        </Select>

        <Input
          label="OAuth Access Token"
          type="password"
          placeholder="ya29.A0AS3H6..."
          value={oauthToken}
          onChange={(event) => setOauthToken(event.target.value)}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Aprobación de Herramientas</label>
          <div className="grid gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRequireApproval('always')}
              className={cn(
                'rounded-lg border-2 p-3 text-sm transition-all',
                requireApproval === 'always'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/30'
              )}
            >
              <ShieldCheck className="mx-auto mb-1 h-5 w-5" />
              Siempre requerir
            </button>
            <button
              type="button"
              onClick={() => setRequireApproval('never')}
              className={cn(
                'rounded-lg border-2 p-3 text-sm transition-all',
                requireApproval === 'never'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/30'
              )}
            >
              <Zap className="mx-auto mb-1 h-5 w-5" />
              Automático
            </button>
          </div>
        </div>

        <Alert variant="warning">
          <p className="text-xs">
            ⚠️ El token OAuth debe tener los scopes necesarios.
            <a href="#" className="ml-1 underline">
              Ver documentación
            </a>
          </p>
        </Alert>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedConnector || !oauthToken}>
            Agregar Connector
          </Button>
        </div>
      </div>
    </Modal>
  )
}

type AddRemoteServerFormProps = {
  onClose: () => void
  onAdd: (payload: AddMCPPayload) => Promise<void> | void
}

function AddRemoteServerForm({ onClose, onAdd }: AddRemoteServerFormProps) {
  const [serverLabel, setServerLabel] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [serverDescription, setServerDescription] = useState('')
  const [authorization, setAuthorization] = useState('')
  const [requireApproval, setRequireApproval] = useState<'always' | 'never'>('always')
  const [allowedTools, setAllowedTools] = useState<string>('')

  const parsedTools = useMemo(
    () =>
      allowedTools
        .split(',')
        .map((tool) => tool.trim())
        .filter(Boolean),
    [allowedTools]
  )

  const handleSubmit = async () => {
    if (!serverLabel || !serverUrl) return
    await onAdd({
      type: 'remote_server',
      server_label: serverLabel,
      server_url: serverUrl,
      server_description: serverDescription || undefined,
      authorization: authorization || undefined,
      require_approval: requireApproval,
      allowed_tools: parsedTools.length ? parsedTools : undefined
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Agregar Remote MCP Server" size="md">
      <div className="space-y-4">
        <Input
          label="Label del Servidor"
          placeholder="my_mcp_server"
          value={serverLabel}
          onChange={(event) => setServerLabel(event.target.value)}
        />

        <Input
          label="URL del Servidor"
          placeholder="https://mcp-server.example.com/sse"
          value={serverUrl}
          onChange={(event) => setServerUrl(event.target.value)}
        />

        <Textarea
          label="Descripción (opcional)"
          placeholder="Servidor MCP para..."
          value={serverDescription}
          onChange={(event) => setServerDescription(event.target.value)}
          rows={3}
        />

        <Input
          label="Authorization Token (opcional)"
          type="password"
          placeholder="Bearer token o API key"
          value={authorization}
          onChange={(event) => setAuthorization(event.target.value)}
        />

        <Accordion title="Herramientas Permitidas (opcional)" defaultOpen={false}>
          <p className="mb-3 text-xs text-slate-400">
            Limita a herramientas específicas del servidor (dejar vacío para todas)
          </p>
          <Input
            placeholder="roll, calculate, search"
            value={allowedTools}
            onChange={(event) => setAllowedTools(event.target.value)}
            className="text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">Nombres separados por comas</p>
        </Accordion>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Aprobación de Tool Calls</label>
          <div className="grid gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRequireApproval('always')}
              className={cn(
                'rounded-lg border-2 p-3 text-sm transition-all',
                requireApproval === 'always'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/30'
              )}
            >
              <ShieldCheck className="mx-auto mb-1 h-5 w-5" />
              Siempre requerir
            </button>
            <button
              type="button"
              onClick={() => setRequireApproval('never')}
              className={cn(
                'rounded-lg border-2 p-3 text-sm transition-all',
                requireApproval === 'never'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/30'
              )}
            >
              <Zap className="mx-auto mb-1 h-5 w-5" />
              Automático
            </button>
          </div>
        </div>

        <Alert variant="info">
          <p className="text-xs">
            ℹ️ Los servidores MCP deben soportar HTTP/SSE o Streamable HTTP.
            <a href="https://modelcontextprotocol.io" className="ml-1 underline" target="_blank" rel="noreferrer">
              Ver especificación MCP
            </a>
          </p>
        </Alert>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!serverLabel || !serverUrl}>
            Agregar Servidor
          </Button>
        </div>
      </div>
    </Modal>
  )
}
