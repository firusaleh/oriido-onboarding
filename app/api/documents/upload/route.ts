import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Document from '@/lib/models/Document'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const titel = formData.get('titel') as string
    const beschreibung = formData.get('beschreibung') as string
    const kategorie = formData.get('kategorie') as string

    if (!file || !titel) {
      return NextResponse.json(
        { error: 'Datei und Titel sind erforderlich' },
        { status: 400 }
      )
    }

    // In production, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll store file metadata only
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    await connectToDatabase()
    
    const document = await Document.create({
      titel,
      beschreibung,
      kategorie,
      dateiName: file.name,
      dateiGroesse: file.size,
      dateiTyp: file.type,
      url: dataUrl, // In production, this would be a cloud storage URL
      hochgeladenVon: session.name,
      hochgeladenAm: new Date()
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen' },
      { status: 500 }
    )
  }
}