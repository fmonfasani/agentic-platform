'use client'

import { X } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import FileSearchSection from './FileSearchSection'
import MCPToolsSection from './MCPToolsSection'
import WebSearchSection from './WebSearchSection'
import {
  AgentCapabilitiesAgent,
  AgentToolsState,
  useAgentCapabilities
} from './useAgentCapabilities'

type AgentCapabilitiesModalProps = {
  agent: AgentCapabilitiesAgent | null
  open: boolean
  onClose: () => void
  onToolsChange?: (agentId: string, tools: AgentToolsState) => void
}

const AgentCapabilitiesModal: React.FC<AgentCapabilitiesModalProps> = ({
  agent,
  open,
  onClose,
  onToolsChange
}) => {
  const {
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
  } = useAgentCapabilities({ agent, onToolsChange })

  if (!agent || !tools) {
    return null
  }

  const statusVariant: 'success' | 'warning' | 'default' =
    agent.status === 'active' ? 'success' : agent.status === 'paused' ? 'warning' : 'default'

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
          <FileSearchSection
            tools={tools}
            metadataFilter={metadataFilter}
            onMetadataChange={handleMetadataChange}
            onToggle={handleToggleFileSearch}
            onMaxResultsChange={handleMaxResultsChange}
            onFileUpload={handleFileUpload}
            onDeleteFile={handleDeleteFile}
            uploading={uploading}
            fileInputRef={fileInputRef}
          />

          <WebSearchSection
            tools={tools}
            newDomain={newDomain}
            onNewDomainChange={setNewDomain}
            onToggle={handleToggleWebSearch}
            onSearchTypeChange={handleSearchTypeChange}
            onDomainFilteringToggle={handleDomainFilteringToggle}
            onAddDomain={handleAddDomain}
            onRemoveDomain={handleRemoveDomain}
            onUserLocationChange={handleUserLocationChange}
            onShowCitationsToggle={handleShowCitationsToggle}
          />

          <MCPToolsSection
            tools={tools}
            showAddMCP={showAddMCP}
            onOpenAddMCP={openAddMCP}
            onCloseAddMCP={closeAddMCP}
            onAddMCP={handleAddMCP}
            onRemoveConnector={handleRemoveConnector}
            onRemoveServer={handleRemoveServer}
            onConfigureConnector={handleConfigureConnector}
            onConfigureServer={handleConfigureServer}
          />
        </div>
      </Modal>
    </>
  )
}

export default AgentCapabilitiesModal
