import { NextResponse } from 'next/server'

import { getApiBaseUrl } from './config'

type ForwardInit = RequestInit & { json?: unknown }

function buildTargetUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

export async function nextResponseFromFetch(response: Response) {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const rawBody = await response.text()
  const data = rawBody ? (isJson ? safeJsonParse(rawBody) : rawBody) : null

  if (!response.ok) {
    const message =
      typeof data === 'string' ? data : (data as Record<string, unknown>)?.message ?? response.statusText
    return NextResponse.json({ message }, { status: response.status })
  }

  return NextResponse.json(data, { status: response.status })
}

function safeJsonParse(payload: string) {
  try {
    return JSON.parse(payload)
  } catch (error) {
    return payload
  }
}

export async function forwardToEnacom(path: string, init: ForwardInit = {}) {
  const apiUrl = getApiBaseUrl()
  const headers = new Headers(init.headers)

  if (init.json !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    cache: init.cache ?? 'no-store'
  }

  try {
    const targetUrl = buildTargetUrl(apiUrl, path)
    const response = await fetch(targetUrl, requestInit)
    return await nextResponseFromFetch(response)
  } catch (error) {
    console.error('Error al contactar el API de ENACOM:', error)
    return NextResponse.json(
      { message: 'Error interno al contactar el API de ENACOM' },
      { status: 500 }
    )
  }
}
