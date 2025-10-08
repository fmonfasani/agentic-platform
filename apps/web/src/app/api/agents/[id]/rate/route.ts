import { forwardToEnacom } from '../../_utils'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const payload = await request.json()
  return forwardToEnacom(`/agents/${params.id}/rate`, { method: 'POST', json: payload })
}
