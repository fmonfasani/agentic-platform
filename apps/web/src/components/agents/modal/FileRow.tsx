'use client'

import { useState } from 'react'
import { FileText, Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export type FileRowProps = {
  file: {
    id: string
    filename: string
    bytes: number
    created_at: number
  }
  onDelete: (fileId: string) => Promise<void>
}

const KB_IN_BYTES = 1024

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 KB'
  const sizeInKb = bytes / KB_IN_BYTES
  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(2)} KB`
  }
  const sizeInMb = sizeInKb / 1024
  return `${sizeInMb.toFixed(2)} MB`
}

function formatCreatedAt(timestamp: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleDateString()
}

export function FileRow({ file, onDelete }: FileRowProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (deleting) return
    const confirmed = typeof window !== 'undefined' ? window.confirm(`¿Eliminar ${file.filename}?`) : true
    if (!confirmed) return

    setDeleting(true)
    try {
      await onDelete(file.id)
    } catch (error) {
      console.error('Error deleting file', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group flex items-center justify-between rounded-lg bg-slate-800/50 p-3 transition-colors hover:bg-slate-800">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileText className="h-4 w-4 flex-shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.filename}</p>
          <p className="text-xs text-slate-400">
            {formatFileSize(file.bytes)} • {formatCreatedAt(file.created_at)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={`Eliminar ${file.filename}`}
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <Trash2 className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-300" />
        )}
      </Button>
    </div>
  )
}
