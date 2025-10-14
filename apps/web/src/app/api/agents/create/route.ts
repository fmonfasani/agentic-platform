import { NextResponse } from 'next/server'

export async function POST(req: Request) {
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
    const normalizedBasePath = url.pathname.replace(/\/+$/, '')
    const joinedPath = [normalizedBasePath, 'agents', 'create']
      .filter(Boolean)
      .join('/')
    url.pathname = joinedPath.startsWith('/') ? joinedPath : `/${joinedPath}`
    targetUrl = url.toString()
  } catch (error) {
    console.error('Invalid API_URL value:', apiUrl, error)
    return NextResponse.json(
      { message: 'API_URL environment variable has an invalid value.' },
      { status: 500 }
    )
  }

  const body = await req.json()

  return forwardToEnacom('/agents/create', {
    method: 'POST',
    json: body,
  })
}
