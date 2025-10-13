'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function SDKAgentBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [code, setCode] = useState(`import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const assistant = await client.beta.assistants.create({
  name: "Mi Primer Agente",
  instructions: "Sos un agente que analiza reportes y genera resúmenes claros.",
  model: "gpt-4o",
  tools: [{ type: "code_interpreter" }],
});`);

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) console.log('✅ Modal montado en DOM')
  }, [open])

  if (!open) return null

  const handleCreate = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'sdk', code }),
      })
      const data = await res.json()

      if (!res.ok) {
        const message = typeof data?.message === 'string' ? data.message : 'No se pudo crear el agente'
        throw new Error(message)
      }

      console.log('✅ Agente creado:', data)
      setResult(data)

      // 🔗 Redirigir a la vista /agents después de 1.5 segundos
      setTimeout(() => {
        onClose()
        router.push('/agents')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error creando agente:', err)
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[700px] p-6 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-emerald-400">🧠 Crear Agente con SDK</h2>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-80 font-mono text-sm bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-100 mb-4"
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} loading={loading}>
            Crear Agente
          </Button>
        </div>

        {errorMessage && (
          <div className="mt-6 text-sm text-red-300 border-t border-slate-700 pt-4">
            ❌ Error: <span className="text-red-200">{errorMessage}</span>
          </div>
        )}

        {result && (
          <div className="mt-6 text-sm text-slate-300 border-t border-slate-700 pt-4">
            <div className="font-semibold text-emerald-400">✅ {result.message ?? 'Agente creado'}</div>
            {result.agent?.name && (
              <>
                Nombre: <span className="text-emerald-400">{result.agent.name}</span>
                <br />
              </>
            )}
            {result.agent?.area && (
              <>
                Área: <span className="text-emerald-300">{result.agent.area}</span>
                <br />
              </>
            )}
            <br />
            🆔 Assistant ID:{' '}
            <code className="text-emerald-300">{result.assistant_id ?? '—'}</code>
            <br />
            🆔 Agent ID:{' '}
            <code className="text-emerald-300">{result.agent?.id ?? '—'}</code>
            <br />
            🔄 Redirigiendo a la vista de agentes...
          </div>
        )}
      </div>
    </div>
  )
}
