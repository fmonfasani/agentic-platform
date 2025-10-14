import { forwardToEnacom } from '@/lib/api'

export async function GET() {
  return forwardToEnacom('/agents')
}

export async function POST(req: Request) {
  const body = await req.json()
  return forwardToEnacom('/agents/create', { method: 'POST', json: body })
}
