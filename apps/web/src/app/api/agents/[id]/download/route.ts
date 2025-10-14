import { forwardToEnacom } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToEnacom(`/agents/${params.id}/download`, { method: 'POST' })
}
