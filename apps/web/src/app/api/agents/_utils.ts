import { NextResponse } from 'next/server'

const DEFAULT_API_URL = 'http://localhost:3001'

const API_BASE_URL =
  process.env.ENACOM_API_URL ?? process.env.NEXT_PUBLIC_ENACOM_API_URL ?? DEFAULT_API_URL

type ForwardInit = RequestInit & { json?: unknown }

export async function forwardToEnacom(path: string, init: ForwardInit = {}) {
  const headers = new Headers(init.headers)
  if ((init.body || init.json) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    cache: 'no-store'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestInit)
  return nextResponseFromFetch(response)
}

export async function nextResponseFromFetch(response: Response) {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const text = await response.text()
  const data = text ? (isJson ? safeJsonParse(text) : text) : null

  if (!response.ok) {
    const message = typeof data === 'string' ? data : (data as Record<string, unknown>)?.message ?? response.statusText
    return NextResponse.json({ message }, { status: response.status })
  }

  return NextResponse.json(data, { status: response.status })
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('Error al parsear JSON del API ENACOM:', error)
    return text
  }
}
