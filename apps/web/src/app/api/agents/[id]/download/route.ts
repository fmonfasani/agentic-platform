import { forwardToEnacom } from '../../_utils'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToEnacom(`/agents/${params.id}/download`, { method: 'POST' })
}
