import { NextRequest } from 'next/server'
import { forwardToEnacom } from '../../_utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const take = req.nextUrl.searchParams.get('take')
  const path = take ? `/agents/${params.id}/traces?take=${take}` : `/agents/${params.id}/traces`
  return forwardToEnacom(path)
}
