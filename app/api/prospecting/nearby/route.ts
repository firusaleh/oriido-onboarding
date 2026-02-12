import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Prospect } from '@/lib/models/Prospect';
import CrmRestaurant from '@/lib/models/CrmRestaurant';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const neLat = parseFloat(searchParams.get('neLat') || '0');
    const neLng = parseFloat(searchParams.get('neLng') || '0');
    const swLat = parseFloat(searchParams.get('swLat') || '0');
    const swLng = parseFloat(searchParams.get('swLng') || '0');

    await connectToDatabase();

    const prospects = await Prospect.find({
      lat: { $gte: swLat, $lte: neLat },
      lng: { $gte: swLng, $lte: neLng }
    }).limit(100);

    const placeIds = prospects.map(p => p.placeId);
    const crmRestaurants = await CrmRestaurant.find({ placeId: { $in: placeIds } });
    const crmMap = new Map(crmRestaurants.map(r => [r.placeId, r]));

    const restaurantsWithStatus = prospects.map(prospect => {
      const crmEntry = crmMap.get(prospect.placeId);

      return {
        placeId: prospect.placeId,
        name: prospect.name,
        adresse: prospect.adresse,
        lat: prospect.lat,
        lng: prospect.lng,
        bewertung: prospect.bewertung,
        anzahlBewertungen: prospect.anzahlBewertungen,
        telefon: prospect.telefon,
        fotos: prospect.fotos,
        status: crmEntry?.status,
        crmId: crmEntry?._id,
        art: prospect.types?.includes('cafe') ? 'Café' : 
             prospect.types?.includes('bar') ? 'Bar' : 
             prospect.types?.includes('fast_food') ? 'Imbiss' : 'Restaurant'
      };
    });

    return NextResponse.json({ 
      restaurants: restaurantsWithStatus,
      total: restaurantsWithStatus.length
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    return NextResponse.json({ error: 'Bereichssuche fehlgeschlagen' }, { status: 500 });
  }
}