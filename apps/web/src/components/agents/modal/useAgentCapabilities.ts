import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

export type FileSearchFile = {
  id: string
  filename: string
  bytes: number
  created_at: number
}

export type FileSearchConfig = {
  enabled: boolean
  vector_store_id: string | null
  file_count: number
  max_num_results: number
  files: FileSearchFile[]
}

export type WebSearchConfig = {
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

export type MCPConnector = {
  id: string
  connector_id: string
  name: string
  status: 'active' | 'pending' | 'error'
  tools_count: number
  require_approval: 'always' | 'never'
}

export type MCPRemoteServer = {
  id: string
  server_label: string
  server_url: string
  server_description?: string | null
  status: 'connected' | 'disconnected' | 'error'
  require_approval: 'always' | 'never'
  allowed_tools?: string[]
}

export type MCPConfig = {
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

export type MetadataFilterState = {
  type: 'in' | 'eq' | 'ne'
  key: string
  value: string
}

export type ConnectorCatalogItem = {
  id: string
  name: string
  icon: string
}

export const connectorCatalog: ConnectorCatalogItem[] = [
  { id: 'connector_dropbox', name: 'Dropbox', icon: '📦' },
  { id: 'connector_gmail', name: 'Gmail', icon: '✉️' },
  { id: 'connector_googlecalendar', name: 'Google Calendar', icon: '📅' },
  { id: 'connector_googledrive', name: 'Google Drive', icon: '📁' },
  { id: 'connector_microsoftteams', name: 'Microsoft Teams', icon: '💬' },
  { id: 'connector_outlookcalendar', name: 'Outlook Calendar', icon: '📆' },
  { id: 'connector_outlookemail', name: 'Outlook Email', icon: '📧' },
  { id: 'connector_sharepoint', name: 'SharePoint', icon: '🗂️' }
]

export type AddConnectorPayload = {
  type: 'connector'
  connector_id: string
  authorization: string
  require_approval: 'always' | 'never'
}

export type AddRemoteServerPayload = {
  type: 'remote_server'
  server_label: string
  server_url: string
  server_description?: string
  authorization?: string
  require_approval: 'always' | 'never'
  allowed_tools?: string[]
}

export type AddMCPPayload = AddConnectorPayload | AddRemoteServerPayload

export type UseAgentCapabilitiesParams = {
  agent: AgentCapabilitiesAgent | null
  onToolsChange?: (agentId: string, tools: AgentToolsState) => void
}

export type UseAgentCapabilitiesReturn = {
  tools: AgentToolsState | null
  uploading: boolean
  newDomain: string
  setNewDomain: Dispatch<SetStateAction<string>>
  showAddMCP: boolean
  openAddMCP: () => void
  closeAddMCP: () => void
  metadataFilter: MetadataFilterState
  handleMetadataChange: (field: keyof MetadataFilterState, value: string) => void
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>
  handleToggleFileSearch: () => void
  handleMaxResultsChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleDeleteFile: (fileId: string) => void
  handleToggleWebSearch: () => void
  handleSearchTypeChange: (type: WebSearchConfig['type']) => void
  handleDomainFilteringToggle: () => void
  handleAddDomain: () => void
  handleRemoveDomain: (domain: string) => void
  handleUserLocationChange: (field: 'country' | 'timezone' | 'city' | 'region', value: string) => void
  handleShowCitationsToggle: () => void
  handleRemoveConnector: (connectorId: string) => void
  handleRemoveServer: (serverId: string) => void
  handleConfigureConnector: (connector: MCPConnector) => void
  handleConfigureServer: (server: MCPRemoteServer) => void
  handleAddMCP: (payload: AddMCPPayload) => Promise<void> | void
}

export function useAgentCapabilities({ agent, onToolsChange }: UseAgentCapabilitiesParams): UseAgentCapabilitiesReturn {
  const [toolsState, setToolsState] = useState<AgentToolsState | null>(agent?.tools ?? null)
  const [uploading, setUploading] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [showAddMCP, setShowAddMCP] = useState(false)
  const [metadataFilter, setMetadataFilter] = useState<MetadataFilterState>({ type: 'in', key: '', value: '' })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setToolsState(agent?.tools ?? null)
    setNewDomain('')
    setShowAddMCP(false)
    setMetadataFilter({ type: 'in', key: '', value: '' })
  }, [agent])

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

  const openAddMCP = () => setShowAddMCP(true)
  const closeAddMCP = () => setShowAddMCP(false)

  const handleMetadataChange = (field: keyof MetadataFilterState, value: string) => {
    setMetadataFilter((prev) => ({ ...prev, [field]: value }))
  }

  return {
    tools,
    uploading,
    newDomain,
    setNewDomain,
    showAddMCP,
    openAddMCP,
    closeAddMCP,
    metadataFilter,
    handleMetadataChange,
    fileInputRef,
    handleToggleFileSearch,
    handleMaxResultsChange,
    handleFileUpload,
    handleDeleteFile,
    handleToggleWebSearch,
    handleSearchTypeChange,
    handleDomainFilteringToggle,
    handleAddDomain,
    handleRemoveDomain,
    handleUserLocationChange,
    handleShowCitationsToggle,
    handleRemoveConnector,
    handleRemoveServer,
    handleConfigureConnector,
    handleConfigureServer,
    handleAddMCP
  }
}
