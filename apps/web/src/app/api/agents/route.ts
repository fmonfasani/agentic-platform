import { forwardToEnacom } from './_utils'

export async function GET() {
  return forwardToEnacom('/agents')
}
