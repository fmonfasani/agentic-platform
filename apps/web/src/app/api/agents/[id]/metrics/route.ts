import { forwardToEnacom } from '../../_utils'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToEnacom(`/agents/${params.id}/metrics`)
}
