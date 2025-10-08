'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    ChatKit?: {
      mount?: (options: {
        element: HTMLElement
        agentId: string
        sessionId?: string
        token?: string
        options?: Record<string, unknown>
        events?: Record<string, (...args: unknown[]) => void>
      }) => { destroy?: () => void }
    }
  }
}

const CHATKIT_CDN =
  process.env.NEXT_PUBLIC_CHATKIT_CDN ?? 'https://cdn.jsdelivr.net/npm/@openai/chatkit@0.0.0/dist/chatkit.umd.js'

type FallbackMessage = { role: 'user' | 'assistant' | 'system'; content: string }

type AgentChatKitEmbedProps = {
  agentId: string
  agentName: string
  onConversationComplete?: () => void
}

export default function AgentChatKitEmbed({ agentId, agentName, onConversationComplete }: AgentChatKitEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [fallbackMessages, setFallbackMessages] = useState<FallbackMessage[]>([
    {
      role: 'assistant',
      content: `Hola, soy ${agentName}. Estoy listo para ayudarte con la información del ENACOM.`
    }
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFallbackMessages([
      {
        role: 'assistant',
        content: `Hola, soy ${agentName}. Estoy listo para ayudarte con la información del ENACOM.`
      }
    ])
    setUseFallback(false)
    setError(null)
  }, [agentId, agentName])

  useEffect(() => {
    let disposed = false
    let mountedInstance: { destroy?: () => void } | null = null

    async function initializeChatKit() {
      try {
        const scriptLoaded = await ensureChatKitScript()

        const sessionResponse = await fetch(`/api/agents/${agentId}/chat-session`, {
          method: 'POST'
        })

        if (!sessionResponse.ok) {
          throw new Error('No se pudo inicializar la sesión con ChatKit')
        }

        const session = await sessionResponse.json()

        if (disposed) {
          return
        }

        if (scriptLoaded && typeof window !== 'undefined' && window.ChatKit?.mount && containerRef.current) {
          mountedInstance = window.ChatKit.mount({
            element: containerRef.current,
            agentId: session.agent_id ?? agentId,
            sessionId: session.id,
            token: session.client_secret ?? session.token,
            options: { theme: 'dark' },
            events: {
              onConversationFinished: () => onConversationComplete?.()
            }
          })
        } else {
          setUseFallback(true)
        }
      } catch (err) {
        if (disposed) {
          return
        }

        console.error('ChatKit embed error', err)
        setUseFallback(true)
        setError(err instanceof Error ? err.message : 'No se pudo cargar ChatKit')
      }
    }

    initializeChatKit()

    return () => {
      disposed = true
      mountedInstance?.destroy?.()
    }
  }, [agentId, onConversationComplete])

  const sendFallback = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) {
      return
    }

    let pendingMessages: FallbackMessage[] = []
    setFallbackMessages((prev) => {
      pendingMessages = [...prev, { role: 'user', content: trimmed }]
      return pendingMessages
    })

    setInput('')
    setBusy(true)

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: pendingMessages })
      })

      if (!response.ok) {
        throw new Error('El backend no pudo ejecutar el agente')
      }

      const data = await response.json()
      if (Array.isArray(data?.transcript)) {
        setFallbackMessages(data.transcript as FallbackMessage[])
      } else if (typeof data?.message === 'string') {
        setFallbackMessages((prev) => [...prev, { role: 'assistant', content: data.message as string }])
      }

      onConversationComplete?.()
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Error inesperado al ejecutar el agente'
      setFallbackMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${message}` }])
    } finally {
      setBusy(false)
    }
  }, [agentId, input, onConversationComplete])

  const fallbackLog = useMemo(() => {
    return fallbackMessages.map((message, index) => (
      <div
        key={`${message.role}-${index}`}
        className={`rounded-lg px-3 py-2 text-sm ${
          message.role === 'assistant' ? 'bg-[#132235] text-white/90' : 'bg-[#1f2d3f] text-white/80'
        }`}
      >
        <span className="block text-[11px] uppercase tracking-wide text-white/50">{message.role}</span>
        <span>{message.content}</span>
      </div>
    ))
  }, [fallbackMessages])

  if (!agentId) {
    return null
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="w-full rounded-xl border border-white/10 bg-[#0b131f]"
        style={{ minHeight: '360px' }}
      />

      {useFallback && (
        <div className="space-y-3">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error
              ? `No fue posible cargar ChatKit automáticamente (${error}). Utilice el panel alternativo para conversar con el agente.`
              : 'ChatKit no está disponible en este entorno. Usá el panel alternativo para interactuar con el agente.'}
          </div>

          <div className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2">{fallbackLog}</div>
            <div className="flex gap-2">
              <textarea
                className="flex-1 h-20 rounded-xl bg-[#101a29] border border-white/10 p-3 text-sm text-white focus:outline-none focus:ring focus:ring-[#16a34a]/40"
                placeholder="Escribe tu mensaje para el agente..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <button
                onClick={sendFallback}
                disabled={busy || !input.trim()}
                className="h-20 w-32 rounded-xl bg-[#16a34a] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

async function ensureChatKitScript() {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.ChatKit?.mount) {
    return true
  }

  if (document.querySelector(`script[src="${CHATKIT_CDN}"]`)) {
    return new Promise<boolean>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${CHATKIT_CDN}"]`)
      if (!existingScript) {
        resolve(false)
        return
      }
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar ChatKit')))
    })
  }

  return new Promise<boolean>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHATKIT_CDN
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('No se pudo cargar el script de ChatKit'))
    document.body.appendChild(script)
  })
}

