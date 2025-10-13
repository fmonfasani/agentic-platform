export type AgentFileSearchFile = {
  id: string
  filename: string
  bytes: number
  created_at: number
}

export type AgentFileSearchMetadataFilter = {
  type: 'in' | 'eq' | 'ne'
  key: string
  value: string[]
}

export type AgentFileSearchConfig = {
  enabled: boolean
  vector_store_id?: string | null
  file_count?: number
  max_num_results?: number
  files?: AgentFileSearchFile[]
  metadata_filters?: AgentFileSearchMetadataFilter[]
}

export type AgentWebSearchLocation = {
  country?: string
  timezone?: string
  city?: string
  region?: string
}

export type AgentWebSearchConfig = {
  enabled: boolean
  type: 'non_reasoning' | 'agentic' | 'deep_research'
  domain_filtering_enabled: boolean
  allowed_domains?: string[]
  user_location?: AgentWebSearchLocation
  show_citations?: boolean
  include_sources?: boolean
}

export type AgentTools = {
  file_search: AgentFileSearchConfig
  web_search: AgentWebSearchConfig
  [key: string]: unknown
}

export type Agent = {
  id: string
  name: string
  area?: string
  type?: string
  tools: AgentTools
  [key: string]: unknown
}
