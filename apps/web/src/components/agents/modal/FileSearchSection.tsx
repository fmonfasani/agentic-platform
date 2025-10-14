'use client'

import { ChangeEvent } from 'react'
import { FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react'

import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'

import {
  AgentToolsState,
  FileSearchFile,
  MetadataFilterState
} from './useAgentCapabilities'

type FileSearchSectionProps = {
  tools: AgentToolsState
  metadataFilter: MetadataFilterState
  onMetadataChange: (field: keyof MetadataFilterState, value: string) => void
  onToggle: () => void
  onMaxResultsChange: (event: ChangeEvent<HTMLInputElement>) => void
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onDeleteFile: (fileId: string) => void
  uploading: boolean
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>
}

const FileSearchSection: React.FC<FileSearchSectionProps> = ({
  tools,
  metadataFilter,
  onMetadataChange,
  onToggle,
  onMaxResultsChange,
  onFileUpload,
  onDeleteFile,
  uploading,
  fileInputRef
}) => {
  const handleMetadataChange = (field: keyof MetadataFilterState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onMetadataChange(field, event.target.value)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-slate-100">File Search</h3>
            <p className="text-xs text-slate-400">Búsqueda semántica en archivos subidos</p>
          </div>
        </div>
        <Switch checked={tools.file_search.enabled} onChange={onToggle} />
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
                    onChange={onMaxResultsChange}
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
              onChange={onFileUpload}
            />

            <Upload className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-300">Subir archivos al Vector Store</p>
            <p className="mb-3 text-xs text-slate-500">PDF, TXT, MD, JSON, DOCX, código (hasta 512MB cada uno)</p>

            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
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
                  <FileRow key={file.id} file={file} onDelete={onDeleteFile} />
                ))}
              </div>
            </div>
          )}

          <Accordion title="🔍 Filtrado por Metadata" defaultOpen={false}>
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Filtra resultados de búsqueda según metadata de archivos</p>

              <Select value={metadataFilter.type} onChange={handleMetadataChange('type')} className="text-sm">
                <option value="in">En (in)</option>
                <option value="eq">Igual a (eq)</option>
                <option value="ne">Diferente de (ne)</option>
              </Select>

              <Input
                label="Key"
                placeholder="category"
                value={metadataFilter.key}
                onChange={handleMetadataChange('key')}
                className="text-sm"
              />
              <Input
                label="Value"
                placeholder="blog,announcement"
                value={metadataFilter.value}
                onChange={handleMetadataChange('value')}
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
  )
}

type FileRowProps = {
  file: FileSearchFile
  onDelete: (fileId: string) => void
}

const FileRow: React.FC<FileRowProps> = ({ file, onDelete }) => {
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

export default FileSearchSection
