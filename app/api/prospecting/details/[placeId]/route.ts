import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Prospect } from '@/lib/models/Prospect';

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const placeId = params.placeId;
    
    await connectToDatabase();

    let prospect = await Prospect.findOne({ placeId });

    if (prospect && prospect.telefon && prospect.website) {
      return NextResponse.json({
        telefon: prospect.telefon,
        website: prospect.website,
        oeffnungszeiten: prospect.oeffnungszeiten,
        fotos: prospect.fotos,
        googleMapsUrl: prospect.googleMapsUrl
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API Key missing in environment variables');
      return NextResponse.json({ error: 'Google Maps API Key fehlt' }, { status: 500 });
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,photos,url&language=de&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places Details API error:', data);
      return NextResponse.json({ error: 'Details konnten nicht geladen werden' }, { status: 500 });
    }

    const result = data.result;
    
    const details = {
      telefon: result.formatted_phone_number || '',
      website: result.website || '',
      googleMapsUrl: result.url || '',
      oeffnungszeiten: result.opening_hours?.weekday_text || [],
      fotos: result.photos?.slice(0, 3).map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
      ) || []
    };

    if (prospect) {
      await Prospect.updateOne(
        { placeId },
        { 
          telefon: details.telefon,
          website: details.website,
          googleMapsUrl: details.googleMapsUrl,
          oeffnungszeiten: details.oeffnungszeiten,
          fotos: details.fotos
        }
      );
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error('Details error:', error);
    return NextResponse.json({ error: 'Details konnten nicht geladen werden' }, { status: 500 });
  }
}