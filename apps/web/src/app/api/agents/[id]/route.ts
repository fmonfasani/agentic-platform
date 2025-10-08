import { NextRequest } from 'next/server'
import { runWorkflow } from '../../../../lib/openai-workflow'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { input, action } = await req.json()
  const result = await runWorkflow({ id: params.id, input: `[${action}] ${input || ''}` })
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
}
