import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Document from '@/lib/models/Document'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    await connectToDatabase()
    const documents = await Document.find().sort({ hochgeladenAm: -1 })
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Dokumente' },
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
    
    const document = await Document.create({
      ...data,
      hochgeladenVon: session.name,
      hochgeladenAm: new Date()
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Dokuments' },
      { status: 500 }
    )
  }
}