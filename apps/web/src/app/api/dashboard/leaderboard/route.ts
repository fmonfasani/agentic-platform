import { forwardToEnacom } from '@/lib/api/forwardToEnacom'

export const dynamic = 'force-dynamic'

export async function GET() {
  return forwardToEnacom('/dashboard/leaderboard')
}
