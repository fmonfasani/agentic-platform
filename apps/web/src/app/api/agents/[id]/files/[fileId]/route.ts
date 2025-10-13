import { forwardToEnacom } from '../../../_utils'

export async function DELETE(_req: Request, { params }: { params: { id: string; fileId: string } }) {
  return forwardToEnacom(`/agents/${params.id}/files/${params.fileId}`, { method: 'DELETE' })
}
