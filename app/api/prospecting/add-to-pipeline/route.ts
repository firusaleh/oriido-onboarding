import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Prospect } from '@/lib/models/Prospect';
import CrmRestaurant from '@/lib/models/CrmRestaurant';
import { getServerSession } from '@/app/api/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { placeId, notiz } = await request.json();

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID erforderlich' }, { status: 400 });
    }

    await connectToDatabase();

    const existingCrmEntry = await CrmRestaurant.findOne({ placeId });
    if (existingCrmEntry) {
      return NextResponse.json({ 
        error: 'Restaurant ist bereits in der Pipeline',
        crmId: existingCrmEntry._id 
      }, { status: 400 });
    }

    const prospect = await Prospect.findOne({ placeId });
    if (!prospect) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden' }, { status: 404 });
    }

    const crmData: any = {
      verkaeuferId: session.userId,
      name: prospect.name,
      adresse: prospect.adresse,
      googleMapsLink: prospect.googleMapsUrl || `https://www.google.com/maps/place/${encodeURIComponent(prospect.adresse)}`,
      telefon: prospect.telefon || '',
      status: 'lead',
      placeId: prospect.placeId,
      googleBewertung: prospect.bewertung,
      googleFotos: prospect.fotos,
      quelle: 'google_maps',
      notizen: notiz ? [{
        text: notiz,
        datum: new Date(),
        typ: 'notiz'
      }] : []
    };

    const newCrmRestaurant = await CrmRestaurant.create(crmData);

    await Prospect.updateOne(
      { placeId },
      { 
        inPipeline: true,
        crmId: newCrmRestaurant._id
      }
    );

    return NextResponse.json({ 
      success: true,
      crmId: newCrmRestaurant._id,
      message: `${prospect.name} wurde zur Pipeline hinzugefügt`
    });
  } catch (error) {
    console.error('Add to pipeline error:', error);
    return NextResponse.json({ error: 'Fehler beim Hinzufügen zur Pipeline' }, { status: 500 });
  }
}