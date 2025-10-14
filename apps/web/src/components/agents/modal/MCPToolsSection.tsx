'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Cloud,
  FolderOpen,
  Mail,
  MessageSquare,
  Plug,
  Plus,
  Server,
  Settings,
  ShieldCheck,
  Trash2,
  Zap
} from 'lucide-react'

import { Accordion } from '@/components/ui/Accordion'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

import ConnectorSelector from './ConnectorSelector'
import {
  AddMCPPayload,
  AgentToolsState,
  MCPConnector,
  MCPRemoteServer
} from './useAgentCapabilities'

type MCPToolsSectionProps = {
  tools: AgentToolsState
  showAddMCP: boolean
  onOpenAddMCP: () => void
  onCloseAddMCP: () => void
  onAddMCP: (payload: AddMCPPayload) => Promise<void> | void
  onRemoveConnector: (connectorId: string) => void
  onRemoveServer: (serverId: string) => void
  onConfigureConnector: (connector: MCPConnector) => void
  onConfigureServer: (server: MCPRemoteServer) => void
}

const connectorIconMap: Record<string, ReactNode> = {
  connector_dropbox: <Cloud className="h-5 w-5 text-sky-300" />,
  connector_gmail: <Mail className="h-5 w-5 text-red-400" />,
  connector_googlecalendar: <Calendar className="h-5 w-5 text-blue-300" />,
  connector_googledrive: <FolderOpen className="h-5 w-5 text-emerald-300" />,
  connector_microsoftteams: <MessageSquare className="h-5 w-5 text-violet-300" />,
  connector_outlookcalendar: <Calendar className="h-5 w-5 text-sky-400" />,
  connector_outlookemail: <Mail className="h-5 w-5 text-blue-300" />,
  connector_sharepoint: <FolderOpen className="h-5 w-5 text-blue-300" />
}

const MCPToolsSection: React.FC<MCPToolsSectionProps> = ({
  tools,
  showAddMCP,
  onOpenAddMCP,
  onCloseAddMCP,
  onAddMCP,
  onRemoveConnector,
  onRemoveServer,
  onConfigureConnector,
  onConfigureServer
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plug className="h-6 w-6 text-purple-400" />
          <div>
            <h3 className="font-semibold text-slate-100">MCP Connectors &amp; Servers</h3>
            <p className="text-xs text-slate-400">Conecta con servicios externos</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenAddMCP}>
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
              onRemove={onRemoveConnector}
              onConfigure={onConfigureConnector}
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
              onRemove={onRemoveServer}
              onConfigure={onConfigureServer}
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

      <AddMCPModal open={showAddMCP} onClose={onCloseAddMCP} onAdd={onAddMCP} />
    </Card>
  )
}

type ConnectorCardProps = {
  connector: MCPConnector
  icon?: ReactNode
  onRemove: (id: string) => void
  onConfigure: (connector: MCPConnector) => void
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ connector, icon, onRemove, onConfigure }) => {
  return (
    <div className="group flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/60">
          {icon ?? <Plug className="h-5 w-5 text-purple-300" />}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-100">{connector.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={connector.status === 'active' ? 'success' : connector.status === 'pending' ? 'warning' : 'error'}>
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

const MCPServerCard: React.FC<MCPServerCardProps> = ({ server, onRemove, onConfigure }) => {
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
            <Badge variant={server.status === 'connected' ? 'success' : 'error'}>{server.status}</Badge>
            <Badge variant="info">{server.require_approval === 'never' ? 'Auto' : 'Manual'} approval</Badge>
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

const AddMCPModal: React.FC<AddMCPModalProps> = ({ open, onClose, onAdd }) => {
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
            <p className="text-xs text-slate-400">Servicios oficiales: Dropbox, Gmail, Google Drive, etc.</p>
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

const AddConnectorForm: React.FC<AddConnectorFormProps> = ({ onClose, onAdd }) => {
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
        <ConnectorSelector value={selectedConnector} onChange={setSelectedConnector} />

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

const AddRemoteServerForm: React.FC<AddRemoteServerFormProps> = ({ onClose, onAdd }) => {
  const [serverLabel, setServerLabel] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [serverDescription, setServerDescription] = useState('')
  const [authorization, setAuthorization] = useState('')
  const [requireApproval, setRequireApproval] = useState<'always' | 'never'>('always')
  const [allowedTools, setAllowedTools] = useState('')

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
          <p className="mb-3 text-xs text-slate-400">Limita a herramientas específicas del servidor (dejar vacío para todas)</p>
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

export default MCPToolsSection
