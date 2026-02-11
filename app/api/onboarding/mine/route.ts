import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const db = await getDatabase();
    
    const onboardings = await db
      .collection('onboardings')
      .find({ verkaeuferId: session.name })
      .sort({ erstelltAm: -1 })
      .toArray();
    
    const formattedOnboardings = onboardings.map(o => ({
      ...o,
      _id: o._id.toString(),
    }));
    
    return NextResponse.json(formattedOnboardings);
  } catch (error) {
    console.error('Error fetching onboardings:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Onboardings' },
      { status: 500 }
    );
  }
}