import { NextResponse } from 'next/server'

const DEFAULT_API_URL = 'http://localhost:3001/api'

const API_BASE_URL =
  resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.API_URL) ?? DEFAULT_API_URL

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

  try {
    const url = createTargetUrl(path)
    const response = await fetch(url, requestInit)
    return nextResponseFromFetch(response)
  } catch (error) {
    console.error('Error reenviando solicitud al API de ENACOM:', error)
    return NextResponse.json({ message: 'Error interno al contactar el API de ENACOM' }, { status: 500 })
  }
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

function resolveApiBaseUrl(...values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = normalizeEnvValue(value)
    if (normalized) {
      return normalized
    }
  }
  return undefined
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined
  }
  return trimmed.replace(/\/$/, '')
}

function createTargetUrl(path: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
