import { forwardToEnacom } from '../_utils';

export async function POST(req: Request) {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL

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
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get('content-type') ?? ''
    if (!response.ok) {
      const errorPayload = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

      return NextResponse.json(
        { message: 'Upstream API request failed', details: errorPayload },
        { status: response.status }
      )
    }

    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (typeof data === 'string') {
      return NextResponse.json({ data })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying agent creation request:', error)
    return NextResponse.json(
      {
        message: 'Failed to reach upstream API',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
