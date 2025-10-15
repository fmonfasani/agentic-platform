import { NextResponse } from 'next/server'
import { forwardToEnacom } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const response = await forwardToEnacom('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return NextResponse.json(await response.json(), { status: response.status })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json({ message: 'Agent creation failed' }, { status: 500 })
  }
}
