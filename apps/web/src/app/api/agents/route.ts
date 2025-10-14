import { NextRequest } from 'next/server'

import { forwardToEnacom } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  return forwardToEnacom('/agents/create', {
    method: 'POST',
    json: body
  })
}
