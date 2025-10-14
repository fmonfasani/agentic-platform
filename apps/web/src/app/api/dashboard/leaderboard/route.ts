import { forwardToEnacom } from '@/lib/api';

export async function GET() {
  return forwardToEnacom('/dashboard/leaderboard');
}
