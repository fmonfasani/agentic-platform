import { forwardToEnacom } from '../_utils';

export async function POST(req: Request) {
  const body = await req.json();
  return forwardToEnacom('/agents/create', { method: 'POST', json: body });
}
