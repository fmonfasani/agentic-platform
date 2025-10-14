import { forwardToEnacom } from '@/lib/api/forwardToEnacom'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToEnacom(`/agents/${params.id}/use`, { method: 'POST' })
}
