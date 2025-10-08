'use client'
import { useState } from 'react'
import { columns } from '../lib/agents-data'
import { AgentCard } from '@agents-hub/ui'
import { SectionTitle } from '../lib/ui'
import AgentModal from '../components/AgentModal'

export default function Page() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-white/90">Panel de Control</h1>
      <p className="text-white/60 mt-1">
        Seleccione un agente para iniciar una sesión de trabajo
      </p>

      <section className="container-card mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <SectionTitle>{col.title}</SectionTitle>
              <div className="space-y-3">
                {col.agents.map((a) => (
                  <AgentCard
                    key={a.id}
                    title={a.title}
                    subtitle={`Disponible · ID: ${a.id}`}
                    tone={col.tone}
                    onOpen={() => setOpenId(a.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal del agente */}
      <AgentWorkflowModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

function AgentWorkflowModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([
    'Necesito generar un análisis detallado del último trimestre',
    'Entendido. Iniciando proceso de análisis. Por favor, especifique los parámetros requeridos o adjunte los archivos necesarios.'
  ])

  async function run(action: string) {
    if (!id) return
    setBusy(true)
    try {
      const res = await fetch(`/api/agents/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, action })
      })
      const data = await res.json()
      setLog((l) => [...l, `▶ ${action}`, `✔ ${data.status} · ${data.runId}`])
    } finally {
      setBusy(false)
    }
  }

  return (
    <AgentModal open={!!id} onClose={onClose}>
      <div className="space-y-6">
        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          {[
            'Análisis Avanzado',
            'Procesamiento de Datos',
            'Visualización',
            'Automatización',
            'Generación de Reportes',
            'Integración API'
          ].map((c) => (
            <span key={c} className="px-3 py-1 text-sm bg-[#1c2736] rounded-lg border border-white/10">
              {c}
            </span>
          ))}
        </div>

        {/* Chat / Logs */}
        <div className="rounded-xl bg-[#101b29] border border-white/10 p-4 space-y-3 text-sm text-white/80">
          {log.map((m, i) => (
            <div
              key={i}
              className={`rounded-md px-3 py-2 ${
                i === 0 ? 'bg-green-500/10 text-white/90' : 'bg-white/15 text-white/80'
              }`}
            >
              {m}
            </div>
          ))}
          <textarea
            className="w-full h-24 rounded-xl bg-[#0b131f] border border-white/10 p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
            placeholder="Ingrese su consulta o instrucciones..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {['Archivo', 'Entrada de Voz', 'Video', 'Enlace'].map((b) => (
              <button
                key={b}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#16202f] hover:bg-[#1f2d3f] transition"
              >
                Adjuntar {b}
              </button>
            ))}
          </div>
          <button
            disabled={busy}
            onClick={() => run('Ejecutar Proceso')}
            className="bg-[#16a34a] hover:bg-[#15803d] px-5 py-2 rounded-lg font-semibold text-sm text-white transition"
          >
            ▶ Ejecutar Proceso
          </button>
        </div>
      </div>
    </AgentModal>
  )
}
