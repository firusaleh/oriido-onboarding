import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Prospect } from '@/lib/models/Prospect';
import CrmRestaurant from '@/lib/models/CrmRestaurant';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const lat = parseFloat(searchParams.get('lat') || '49.5897');
    const lng = parseFloat(searchParams.get('lng') || '11.0078');
    const radius = parseInt(searchParams.get('radius') || '2000');

    if (!query) {
      return NextResponse.json({ error: 'Suchbegriff erforderlich' }, { status: 400 });
    }

    await connectToDatabase();

    const cacheKey = `${query}_${lat}_${lng}_${radius}`;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let prospects = await Prospect.find({
      gecachtFuer: cacheKey,
      gecachtAm: { $gte: sevenDaysAgo }
    });

    if (prospects.length === 0) {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API Key missing. Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
        return NextResponse.json({ 
          error: 'Google Maps API Key fehlt. Bitte fügen Sie GOOGLE_MAPS_API_KEY in Vercel hinzu.',
          details: 'Die Umgebungsvariable GOOGLE_MAPS_API_KEY muss in den Vercel-Projekteinstellungen konfiguriert werden.'
        }, { status: 500 });
      }

      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query + ' restaurant'
      )}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`;

      const response = await fetch(textSearchUrl);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', data);
        return NextResponse.json({ error: 'Suche fehlgeschlagen' }, { status: 500 });
      }

      const results = data.results || [];
      
      for (const place of results) {
        const existingProspect = await Prospect.findOne({ placeId: place.place_id });
        
        if (!existingProspect) {
          await Prospect.create({
            placeId: place.place_id,
            name: place.name,
            adresse: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            bewertung: place.rating,
            anzahlBewertungen: place.user_ratings_total,
            priceLevel: place.price_level,
            types: place.types,
            fotos: place.photos?.slice(0, 3).map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
            ) || [],
            gecachtFuer: cacheKey,
            gecachtAm: new Date()
          });
        } else {
          await Prospect.updateOne(
            { placeId: place.place_id },
            { 
              gecachtFuer: cacheKey,
              gecachtAm: new Date()
            }
          );
        }
      }

      prospects = await Prospect.find({
        gecachtFuer: cacheKey
      });
    }

    const placeIds = prospects.map(p => p.placeId);
    const crmRestaurants = await CrmRestaurant.find({ placeId: { $in: placeIds } });
    const crmMap = new Map(crmRestaurants.map(r => [r.placeId, r]));

    const restaurantsWithStatus = prospects.map(prospect => {
      const crmEntry = crmMap.get(prospect.placeId);
      
      const distance = calculateDistance(
        lat,
        lng,
        prospect.lat,
        prospect.lng
      );

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
        entfernung: Math.round(distance),
        art: prospect.types?.includes('cafe') ? 'Café' : 
             prospect.types?.includes('bar') ? 'Bar' : 
             prospect.types?.includes('fast_food') ? 'Imbiss' : 'Restaurant'
      };
    });

    restaurantsWithStatus.sort((a, b) => a.entfernung - b.entfernung);

    return NextResponse.json({ 
      restaurants: restaurantsWithStatus,
      total: restaurantsWithStatus.length
    });
  } catch (error) {
    console.error('Search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json({ 
      error: 'Suche fehlgeschlagen',
      details: errorMessage,
      hint: 'Stellen Sie sicher, dass GOOGLE_MAPS_API_KEY in Vercel konfiguriert ist'
    }, { status: 500 });
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}