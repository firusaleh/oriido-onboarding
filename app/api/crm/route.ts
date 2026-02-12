import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import CrmRestaurant from '@/lib/models/CrmRestaurant';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Admin sieht alle, Verkäufer nur eigene
    const query = session.role === 'admin' 
      ? {} 
      : { verkaeuferId: session.userId };

    const restaurants = await CrmRestaurant.find(query)
      .sort({ aktualisiertAm: -1 })
      .lean();

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching CRM restaurants:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Restaurants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    await connectToDatabase();

    const restaurant = await CrmRestaurant.create({
      ...data,
      verkaeuferId: session.userId,
      notizen: data.notiz ? [{
        text: data.notiz,
        typ: 'notiz',
        datum: new Date()
      }] : []
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error creating CRM restaurant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Restaurants' },
      { status: 500 }
    );
  }
}