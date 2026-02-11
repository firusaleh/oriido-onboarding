import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const db = await getDatabase();
    
    const newOnboarding = {
      status: 'entwurf' as const,
      erstelltAm: new Date(),
      eingereichtAm: null,
      verkaeuferId: session.name,
      restaurant: {},
      kontakt: {},
      geschaeftsdaten: {},
      technik: {},
      tische: {},
      speisekarte: {},
      vereinbarung: {},
      fotos: {},
    };
    
    const result = await db.collection('onboardings').insertOne(newOnboarding);
    
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating onboarding:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Onboardings' },
      { status: 500 }
    );
  }
}