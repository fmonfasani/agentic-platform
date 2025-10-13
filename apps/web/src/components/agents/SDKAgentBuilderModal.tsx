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
  const router = useRouter()

  useEffect(() => {
    if (open) console.log('✅ Modal montado en DOM')
  }, [open])

  if (!open) return null

  const handleCreate = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'sdk', code }),
      })
      const data = await res.json()
      console.log('✅ Agente creado:', data)
      setResult(data)

      // 🔗 Redirigir a la vista /agents después de 1.5 segundos
      setTimeout(() => {
        onClose()
        router.push('/agents')
      }, 1500)
    } catch (err) {
      console.error('❌ Error creando agente:', err)
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

        {result && (
          <div className="mt-6 text-sm text-slate-300 border-t border-slate-700 pt-4">
            ✅ Agente creado: <span className="text-emerald-400">{result.name}</span>
            <br />
            🆔 ID: <code className="text-emerald-300">{result.assistant_id}</code>
            <br />
            🔄 Redirigiendo a la vista de agentes...
          </div>
        )}
      </div>
    </div>
  )
}
