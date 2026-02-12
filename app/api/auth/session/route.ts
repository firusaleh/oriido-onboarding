import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      name: session.name,
      role: session.role,
      userId: session.userId
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Session error' },
      { status: 500 }
    )
  }
}