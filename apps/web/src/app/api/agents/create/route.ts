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
    const targetUrl = new URL(path, apiUrl).toString()
    const response = await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
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
