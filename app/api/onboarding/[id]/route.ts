import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const db = await getDatabase();
    
    const onboarding = await db.collection('onboardings').findOne({
      _id: new ObjectId(id),
      ...(session.role !== 'admin' && { verkaeuferId: session.name }),
    });
    
    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding nicht gefunden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...onboarding,
      _id: onboarding._id.toString(),
    });
  } catch (error) {
    console.error('Error fetching onboarding:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Onboardings' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const updates = await request.json();
    const db = await getDatabase();
    
    delete updates._id;
    
    const result = await db.collection('onboardings').updateOne(
      {
        _id: new ObjectId(id),
        ...(session.role !== 'admin' && { verkaeuferId: session.name }),
      },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Onboarding nicht gefunden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Onboardings' },
      { status: 500 }
    );
  }
}