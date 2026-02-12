import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import CrmRestaurant from '@/lib/models/CrmRestaurant';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, absageGrund } = await request.json();
    
    if (!status) {
      return NextResponse.json({ error: 'Status ist erforderlich' }, { status: 400 });
    }

    await connectToDatabase();

    const restaurant = await CrmRestaurant.findById(params.id);

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden' }, { status: 404 });
    }

    // Nur Admin oder der Besitzer kann den Status ändern
    if (session.role !== 'admin' && restaurant.verkaeuferId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    restaurant.status = status;
    if (status === 'verloren' && absageGrund) {
      restaurant.absageGrund = absageGrund;
    }
    
    restaurant.aktualisiertAm = new Date();
    await restaurant.save();

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Status' },
      { status: 500 }
    );
  }
}