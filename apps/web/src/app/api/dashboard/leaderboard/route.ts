import { forwardToEnacom } from '../../agents/_utils';

export async function GET() {
  return forwardToEnacom('/dashboard/leaderboard');
}
