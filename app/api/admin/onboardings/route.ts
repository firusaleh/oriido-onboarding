import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth('admin');
    const db = await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const filter = status && status !== 'alle' ? { status } : {};
    
    const onboardings = await db
      .collection('onboardings')
      .find(filter)
      .sort({ erstelltAm: -1 })
      .toArray();
    
    const formattedOnboardings = onboardings.map(o => ({
      ...o,
      _id: o._id.toString(),
    }));
    
    return NextResponse.json(formattedOnboardings);
  } catch (error) {
    console.error('Error fetching admin onboardings:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Onboardings' },
      { status: 500 }
    );
  }
}