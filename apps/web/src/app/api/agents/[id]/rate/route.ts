import { forwardToEnacom } from '@/lib/api/forwardToEnacom'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const payload = await request.json()
  return forwardToEnacom(`/agents/${params.id}/rate`, { method: 'POST', json: payload })
}
