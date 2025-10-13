'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { AlertCircle, Check, FileText, Loader2, UploadCloud } from 'lucide-react'
import { API_BASE_URL } from '../../lib/config'

type PdfUploadSummaryProps = {
  agentId: string | null
  onCompleted?: () => void
}

export function PdfUploadSummary({ agentId, onCompleted }: PdfUploadSummaryProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setFileName(file.name)
    setError(null)
    setSummary(null)

    if (!agentId) {
      setError('Seleccione un agente para poder enviar el documento.')
      resetInput()
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'No se pudo procesar el PDF enviado.')
      }

      const data = (await response.json()) as { summary?: string }
      const receivedSummary = data.summary ?? 'El agente confirmó la recepción del documento.'
      setSummary(receivedSummary)
      onCompleted?.()
    } catch (err) {
      console.error('Error subiendo PDF', err)
      const message = err instanceof Error ? err.message : 'No se pudo procesar el PDF.'
      setError(message)
    } finally {
      setIsUploading(false)
      resetInput()
    }
  }

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Resumen financiero automático</p>
          <p className="text-[11px] text-white/40">
            Cargue un PDF y el agente generará un resumen ejecutivo con KPIs destacados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-400/70 hover:text-emerald-50"
          disabled={isUploading || !agentId}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {isUploading ? 'Procesando…' : 'Subir PDF'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </header>

      {fileName && (
        <p className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/50">
          <FileText className="h-4 w-4 text-emerald-200" />
          {fileName}
        </p>
      )}

      {summary && (
        <div className="space-y-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-50">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-100">
            <Check className="h-4 w-4" /> Resumen generado
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-emerald-50/90">{summary}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
