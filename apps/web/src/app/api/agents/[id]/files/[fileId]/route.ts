import { forwardToEnacom } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: { id: string; fileId: string } }) {
  return forwardToEnacom(`/agents/${params.id}/files/${params.fileId}`, { method: 'DELETE' })
}
