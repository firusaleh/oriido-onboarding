import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import CrmRestaurant from '@/lib/models/CrmRestaurant';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, typ } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text ist erforderlich' }, { status: 400 });
    }

    await connectToDatabase();

    const restaurant = await CrmRestaurant.findById(params.id);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden' }, { status: 404 });
    }

    // Nur Admin oder der Besitzer kann Notizen hinzufügen
    if (session.role !== 'admin' && restaurant.verkaeuferId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    restaurant.notizen.push({
      text,
      typ: typ || 'notiz',
      datum: new Date()
    });

    restaurant.aktualisiertAm = new Date();
    await restaurant.save();

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hinzufügen der Notiz' },
      { status: 500 }
    );
  }
}