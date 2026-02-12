import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Document from '@/lib/models/Document'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const document = await Document.findById(params.id)
    
    if (!document) {
      return NextResponse.json(
        { error: 'Dokument nicht gefunden' },
        { status: 404 }
      )
    }

    // Parse the base64 data URL
    const base64Data = document.url.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': document.dateiTyp,
        'Content-Disposition': `attachment; filename="${document.dateiName}"`
      }
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Fehler beim Download' },
      { status: 500 }
    )
  }
}