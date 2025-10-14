'use client'

import { ChangeEvent } from 'react'

import { Select } from '@/components/ui/Select'

import { ConnectorCatalogItem, connectorCatalog } from './useAgentCapabilities'

type ConnectorSelectorProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  includePlaceholder?: boolean
  connectors?: ConnectorCatalogItem[]
}

const ConnectorSelector: React.FC<ConnectorSelectorProps> = ({
  value,
  onChange,
  label = 'Seleccionar Connector',
  includePlaceholder = true,
  connectors = connectorCatalog
}) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value)
  }

  return (
    <Select label={label} value={value} onChange={handleChange}>
      {includePlaceholder && <option value="">-- Seleccionar --</option>}
      {connectors.map((connector) => (
        <option key={connector.id} value={connector.id}>
          {connector.icon} {connector.name}
        </option>
      ))}
    </Select>
  )
}

export default ConnectorSelector
