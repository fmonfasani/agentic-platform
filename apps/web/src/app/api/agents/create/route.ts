import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const apiUrl = process.env.API_URL

async function forwardToEnacom(path: string, options?: RequestInit) {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { message: 'API_URL environment variable is not defined.' },
      { status: 500 }
    )
  }
  let targetUrl: string
  try {
    const url = new URL(apiUrl)
    url.pathname = url.pathname.endsWith('/')
      ? `${url.pathname}agents/create`
      : `${url.pathname}/agents/create`
    targetUrl = url.toString()
  } catch (error) {
    console.error('Invalid API_URL value:', apiUrl, error)
    return NextResponse.json(
      { message: 'API_URL environment variable has an invalid value.' },
      { status: 500 }
    )
  }

  const body = await req.json()

  try {
    const targetUrl = new URL(path, apiUrl).toString()
    const response = await fetch(targetUrl, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
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

export async function POST(req: Request) {
  const body = await req.json()
  return forwardToEnacom('/agents/create', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
