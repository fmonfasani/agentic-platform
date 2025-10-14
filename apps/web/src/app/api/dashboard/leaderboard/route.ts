import { forwardToEnacom } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  return forwardToEnacom('/dashboard/leaderboard')
}
