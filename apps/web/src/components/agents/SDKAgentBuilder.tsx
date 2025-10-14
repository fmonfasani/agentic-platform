'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

type SDKAgentBuilderProps = {
  onCancel: () => void
  onSuccess: () => void
}

export function SDKAgentBuilder({ onCancel, onSuccess }: SDKAgentBuilderProps) {
  const [code, setCode] = useState(`import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const assistant = await client.beta.assistants.create({
  name: "Mi Primer Agente",
  instructions: "Sos un agente que analiza reportes y genera resúmenes claros.",
  model: "gpt-4o",
  tools: [{ type: "code_interpreter" }],
});`)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleCreate = async () => {
    if (!code.trim()) {
      setErrorMessage('El código no puede estar vacío.')
      return
    }

    try {
      setLoading(true)
      setErrorMessage(null)
      setResult(null)
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'sdk', code }),
      })
      const data = await res.json()

      if (!res.ok) {
        const message = typeof data?.message === 'string' ? data.message : 'No se pudo crear el agente'
        throw new Error(message)
      }

      setResult(data)

      setTimeout(() => {
        onSuccess()
        router.push('/agents')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-emerald-400">🧠 Crear Agente con SDK</h2>
        <p className="mt-1 text-sm text-slate-400">
          Escribí tu configuración utilizando el SDK de OpenAI para generar un nuevo agente.
        </p>
      </div>

      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="min-h-[320px] bg-slate-950 font-mono text-sm"
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleCreate} loading={loading}>
          Crear Agente
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
          ❌ Error: <span className="font-medium text-red-100">{errorMessage}</span>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-100">
          <div className="font-semibold text-emerald-400">✅ {result.message ?? 'Agente creado'}</div>
          {result.agent?.name && (
            <div>
              Nombre: <span className="text-emerald-300">{result.agent.name}</span>
            </div>
          )}
          {result.agent?.area && (
            <div>
              Área: <span className="text-emerald-300">{result.agent.area}</span>
            </div>
          )}
          <div className="mt-2 space-y-1">
            <div>
              🆔 Assistant ID: <code className="text-emerald-200">{result.assistant_id ?? '—'}</code>
            </div>
            <div>
              🆔 Agent ID: <code className="text-emerald-200">{result.agent?.id ?? '—'}</code>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-200/80">🔄 Redirigiendo a la vista de agentes...</p>
        </div>
      )}
    </div>
  )
}
