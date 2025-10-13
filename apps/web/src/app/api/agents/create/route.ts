import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  // Proxy hacia tu backend NestJS
  const response = await fetch(`${process.env.API_URL}/agents/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  return NextResponse.json(data)
}
