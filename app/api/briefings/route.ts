import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Briefing from '@/lib/models/Briefing'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    await connectToDatabase()
    const session = await getSession()
    
    // Get all briefings, mark as read for current user
    const briefings = await Briefing.find()
      .sort({ prioritaet: 1, erstelltAm: -1 })
      .lean()
    
    // Add read status for current user
    const briefingsWithReadStatus = briefings.map(b => ({
      ...b,
      _id: b._id.toString(),
      gelesen: session ? b.gelesenVon?.includes(session.name) : false
    }))
    
    return NextResponse.json(briefingsWithReadStatus)
  } catch (error) {
    console.error('Error fetching briefings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Briefings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    await connectToDatabase()
    const data = await request.json()
    
    const briefing = await Briefing.create({
      ...data,
      erstelltVon: session.name,
      erstelltAm: new Date(),
      gelesenVon: []
    })

    return NextResponse.json(briefing)
  } catch (error) {
    console.error('Error creating briefing:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Briefings' },
      { status: 500 }
    )
  }
}