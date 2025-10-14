import { NextResponse } from 'next/server'

import { getApiBaseUrl } from './config'

type ForwardInit = RequestInit & { json?: unknown }

export async function forwardToEnacom(path: string, init: ForwardInit = {}) {
  const headers = new Headers(init.headers)
  const shouldSendJson = init.json !== undefined || (init.body && !(init.body instanceof FormData))
  if (shouldSendJson && !headers.has('Content-Type')) {
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

function createTargetUrl(path: string) {
  const baseUrl = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
