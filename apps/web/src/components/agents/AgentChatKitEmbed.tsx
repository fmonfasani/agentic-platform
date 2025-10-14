'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type FallbackMessage = { role: 'user' | 'assistant' | 'system'; content: string }

type AgentChatKitEmbedProps = {
  agentId: string
  agentName: string
  onConversationComplete?: () => void
}

export default function AgentChatKitEmbed({ agentId, agentName, onConversationComplete }: AgentChatKitEmbedProps) {
  const [messages, setMessages] = useState<FallbackMessage[]>(() => initialMessages(agentName))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMessages(initialMessages(agentName))
    setError(null)
  }, [agentId, agentName])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) {
      return
    }

    let nextMessages: FallbackMessage[] = []
    setMessages((prev) => {
      nextMessages = [...prev, { role: 'user', content: trimmed }]
      return nextMessages
    })
    setInput('')
    setBusy(true)
    setError(null)

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = typeof payload?.message === 'string' ? payload.message : 'El backend no pudo ejecutar el agente'
        throw new Error(message)
      }

      const data = await response.json()
      if (Array.isArray(data?.transcript)) {
        setMessages(data.transcript as FallbackMessage[])
      } else if (typeof data?.message === 'string') {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message as string }])
      }

      onConversationComplete?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al ejecutar el agente'
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${message}` }])
      setError(message)
    } finally {
      setBusy(false)
    }
  }, [agentId, input, onConversationComplete])

  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => (
      <div
        key={`${message.role}-${index}`}
        className={`rounded-lg px-3 py-2 text-sm ${
          message.role === 'assistant' ? 'bg-[#132235] text-white/90' : 'bg-[#1f2d3f] text-white/80'
        }`}
      >
        {message.content}
      </div>
    ))
  }, [messages])

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-[#0b1626] p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-white/80">Sesión de chat simulada</p>
          <p className="text-xs text-white/50">{agentName}</p>
        </div>
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-[#0e1b2d] p-3 text-white/90 shadow-inner">
        {renderedMessages}
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-[#101c30] p-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribe tu mensaje para el agente"
          className="h-24 resize-none rounded-md border border-white/10 bg-[#0b1626] p-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-500/60"
        >
          {busy ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </div>
    </div>
  )
}

function initialMessages(agentName: string): FallbackMessage[] {
  return [
    {
      role: 'assistant',
      content: `Hola, soy ${agentName}. Estoy listo para ayudarte con la información del ENACOM.`
    }
  ]
}
