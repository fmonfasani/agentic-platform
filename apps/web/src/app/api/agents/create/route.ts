import { NextResponse } from 'next/server'

/**
 * Helper para reenviar la solicitud al backend (API_URL)
 */
async function forwardToEnacom(path: string, options?: RequestInit) {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { message: 'API_URL environment variable is not defined.' },
      { status: 500 }
    )
  }

  try {
    const url = new URL(apiUrl)
    const normalizedBasePath = url.pathname.replace(/\/+$/, '')
    const joinedPath = [normalizedBasePath, 'agents', 'create']
      .filter(Boolean)
      .join('/')
    url.pathname = joinedPath.startsWith('/') ? joinedPath : `/${joinedPath}`
    targetUrl = url.toString()
  } catch (error) {
    console.error('Error forwarding request to Enacom:', error)
    return NextResponse.json(
      { message: 'Error forwarding request to Enacom.' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint POST /api/agents/create
 */
export async function POST(req: Request) {
  const body = await req.json()

  return forwardToEnacom('/agents/create', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
