import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Briefing from '@/lib/models/Briefing'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    // Add user to gelesenVon array if not already there
    await Briefing.findByIdAndUpdate(
      params.id,
      { $addToSet: { gelesenVon: session.name } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking briefing as read:', error)
    return NextResponse.json(
      { error: 'Fehler beim Markieren als gelesen' },
      { status: 500 }
    )
  }
}