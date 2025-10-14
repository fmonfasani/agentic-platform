import { forwardToEnacom } from '@/lib/api'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToEnacom(`/agents/${params.id}/metrics`)
}
