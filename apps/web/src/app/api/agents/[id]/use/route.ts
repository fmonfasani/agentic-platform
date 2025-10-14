import { forwardToEnacom } from '@/lib/api'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToEnacom(`/agents/${params.id}/use`, { method: 'POST' })
}
