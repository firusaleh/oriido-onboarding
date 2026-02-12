import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import CrmRestaurant from '@/lib/models/CrmRestaurant';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const restaurant = await CrmRestaurant.findById(params.id).lean();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden' }, { status: 404 });
    }

    // Nur Admin oder der Besitzer kann es sehen
    if (session.role !== 'admin' && (restaurant as any).verkaeuferId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error fetching CRM restaurant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Restaurants' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    await connectToDatabase();

    const restaurant = await CrmRestaurant.findById(params.id);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden' }, { status: 404 });
    }

    // Nur Admin oder der Besitzer kann es bearbeiten
    if (session.role !== 'admin' && restaurant.verkaeuferId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    Object.assign(restaurant, data, {
      aktualisiertAm: new Date()
    });

    await restaurant.save();

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error updating CRM restaurant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Restaurants' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const restaurant = await CrmRestaurant.findById(params.id);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden' }, { status: 404 });
    }

    // Nur Admin oder der Besitzer kann es löschen
    if (session.role !== 'admin' && restaurant.verkaeuferId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await restaurant.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CRM restaurant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Restaurants' },
      { status: 500 }
    );
  }
}