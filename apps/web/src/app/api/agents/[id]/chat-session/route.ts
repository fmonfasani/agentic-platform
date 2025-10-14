import { NextRequest } from 'next/server'

import { forwardToEnacom } from '@/lib/api/forwardToEnacom'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return forwardToEnacom(`/agents/${params.id}/chat-session`, { method: 'POST' })
}
