'use client'

import { useMemo, useRef, useState } from 'react'
import { FileText, Loader2, Plus, Upload, X } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Accordion } from '@/components/ui/Accordion'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import type { Agent } from '@/types/agent'
import { SUPPORTED_FILE_TYPES, validateFile } from '@/lib/file-search'

import { FileRow } from './FileRow'

type FileSearchSectionProps = {
  agent: Agent
  onUpdate: (updates: Partial<Agent>) => Promise<void>
}

type MetadataFilterType = 'in' | 'eq' | 'ne'

const ACCEPTED_FILE_TYPES = Object.keys(SUPPORTED_FILE_TYPES).join(',')

export function FileSearchSection({ agent, onUpdate }: FileSearchSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<MetadataFilterType>('in')
  const [filterKey, setFilterKey] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [metadataError, setMetadataError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const metadataFilters = useMemo(
    () => agent.tools.file_search.metadata_filters ?? [],
    [agent.tools.file_search.metadata_filters]
  )

  const handleToggleFileSearch = async (enabled: boolean) => {
    await onUpdate({
      tools: {
        ...agent.tools,
        file_search: {
          ...agent.tools.file_search,
          enabled
        }
      }
    })
  }

  const refreshAgent = async () => {
    const response = await fetch(`/api/agents/${agent.id}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('No se pudo actualizar la información del agente')
    }
    const updatedAgent = (await response.json()) as Agent
    await onUpdate(updatedAgent)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const validation = validateFile(file)
        if (!validation.valid) {
          throw new Error(validation.error ?? 'Archivo inválido')
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('vector_store_id', agent.tools.file_search.vector_store_id ?? '')

        const response = await fetch(`/api/agents/${agent.id}/files/upload`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'No se pudo subir el archivo')
        }

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      await refreshAgent()
    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'No se pudo subir el archivo'
      setUploadError(message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/agents/${agent.id}/files/${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'No se pudo eliminar el archivo')
      }

      await refreshAgent()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleMaxResultsChange = async (value: number) => {
    if (Number.isNaN(value)) return
    const sanitized = Math.min(50, Math.max(1, value))

    await onUpdate({
      tools: {
        ...agent.tools,
        file_search: {
          ...agent.tools.file_search,
          max_num_results: sanitized
        }
      }
    })
  }

  const handleAddMetadataFilter = async () => {
    const cleanKey = filterKey.trim()
    const values = filterValue
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)

    if (!cleanKey) {
      setMetadataError('La clave es obligatoria')
      return
    }

    if (values.length === 0) {
      setMetadataError('Ingrese al menos un valor')
      return
    }

    const updatedFilters = [...metadataFilters, { type: filterType, key: cleanKey, value: values }]

    await onUpdate({
      tools: {
        ...agent.tools,
        file_search: {
          ...agent.tools.file_search,
          metadata_filters: updatedFilters
        }
      }
    })

    setFilterKey('')
    setFilterValue('')
    setMetadataError(null)
  }

  const handleRemoveMetadataFilter = async (index: number) => {
    const updatedFilters = metadataFilters.filter((_, currentIndex) => currentIndex !== index)

    await onUpdate({
      tools: {
        ...agent.tools,
        file_search: {
          ...agent.tools.file_search,
          metadata_filters: updatedFilters
        }
      }
    })
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-emerald-400" />
          <div>
            <h3 className="font-semibold">File Search</h3>
            <p className="text-xs text-slate-400">Búsqueda semántica en archivos subidos</p>
          </div>
        </div>
        <Switch checked={agent.tools.file_search.enabled} onChange={handleToggleFileSearch} />
      </div>

      {agent.tools.file_search.enabled && (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Vector Store</span>
              <Badge variant={agent.tools.file_search.vector_store_id ? 'success' : 'warning'}>
                {agent.tools.file_search.vector_store_id ? 'Configurado' : 'Sin configurar'}
              </Badge>
            </div>

            {agent.tools.file_search.vector_store_id ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <code className="font-mono text-emerald-400">{agent.tools.file_search.vector_store_id}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Archivos:</span>
                  <span className="font-medium">{agent.tools.file_search.file_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Max Results:</span>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={agent.tools.file_search.max_num_results ?? 20}
                    className="h-7 w-16 text-xs"
                    onChange={(event) => handleMaxResultsChange(Number.parseInt(event.target.value, 10))}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Configura un vector store para habilitar la búsqueda semántica.</p>
            )}
          </div>

          <div className="rounded-lg border-2 border-dashed border-slate-700 p-6 text-center transition-colors hover:border-slate-600">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={handleFileUpload}
            />

            <Upload className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <p className="mb-1 text-sm text-slate-300">Subir archivos al Vector Store</p>
            <p className="mb-3 text-xs text-slate-500">PDF, TXT, MD, JSON, DOCX, código (hasta 512MB cada uno)</p>

            {uploading ? (
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin align-middle" />
                  Subiendo… {uploadProgress.toFixed(0)}%
                </p>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Plus className="mr-2 h-4 w-4" />
                Seleccionar Archivos
              </Button>
            )}

            {uploadError && <p className="mt-3 text-xs text-red-400">{uploadError}</p>}
          </div>

          {agent.tools.file_search.files && agent.tools.file_search.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Archivos en Vector Store ({agent.tools.file_search.files.length})
              </h4>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {agent.tools.file_search.files.map((file) => (
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

              <div className="grid gap-2 md:grid-cols-[160px_1fr_1fr]">
                <Select
                  label="Tipo de filtro"
                  size="sm"
                  value={filterType}
                  onChange={(event) => {
                    setFilterType(event.target.value as MetadataFilterType)
                    setMetadataError(null)
                  }}
                >
                  <option value="in">En (in)</option>
                  <option value="eq">Igual a (eq)</option>
                  <option value="ne">Diferente de (ne)</option>
                </Select>

                <Input
                  label="Key"
                  placeholder="category"
                  size="sm"
                  value={filterKey}
                  onChange={(event) => {
                    setFilterKey(event.target.value)
                    setMetadataError(null)
                  }}
                />
                <Input
                  label="Value"
                  placeholder="blog,announcement"
                  size="sm"
                  value={filterValue}
                  onChange={(event) => {
                    setFilterValue(event.target.value)
                    setMetadataError(null)
                  }}
                />
              </div>

              {metadataError && <p className="text-xs text-red-400">{metadataError}</p>}

              <Button variant="ghost" size="sm" className="w-full" onClick={handleAddMetadataFilter}>
                Agregar Filtro
              </Button>

              {metadataFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadataFilters.map((filter, index) => (
                    <Badge key={`${filter.key}-${index}`} variant="info" className="flex items-center gap-1">
                      <span className="text-[11px] font-medium">
                        {filter.key} {filter.type} [{filter.value.join(', ')}]
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMetadataFilter(index)}
                        className="rounded-full p-0.5 hover:bg-slate-800"
                        aria-label={`Eliminar filtro ${filter.key}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Accordion>
        </div>
      )}
    </Card>
  )
}
