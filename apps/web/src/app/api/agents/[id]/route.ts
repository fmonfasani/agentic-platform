import { NextRequest } from 'next/server'

import { forwardToEnacom } from '@/lib/api/forwardToEnacom'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return forwardToEnacom(`/agents/${params.id}`)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  return forwardToEnacom(`/agents/${params.id}/run`, {
    method: 'POST',
    json: body
  })
}
