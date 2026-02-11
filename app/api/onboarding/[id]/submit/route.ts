import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const db = await getDatabase();
    
    const onboarding = await db.collection('onboardings').findOne({
      _id: new ObjectId(id),
      verkaeuferId: session.name,
    });
    
    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding nicht gefunden' },
        { status: 404 }
      );
    }
    
    if (onboarding.status !== 'entwurf') {
      return NextResponse.json(
        { error: 'Onboarding wurde bereits eingereicht' },
        { status: 400 }
      );
    }
    
    const updateResult = await db.collection('onboardings').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'eingereicht',
          eingereichtAm: new Date(),
        },
      }
    );
    
    if (updateResult.modifiedCount === 0) {
      throw new Error('Fehler beim Aktualisieren des Status');
    }
    
    try {
      await sendNotificationEmail(onboarding);
    } catch (emailError) {
      console.error('Email could not be sent:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding erfolgreich eingereicht',
    });
  } catch (error) {
    console.error('Error submitting onboarding:', error);
    return NextResponse.json(
      { error: 'Fehler beim Einreichen des Onboardings' },
      { status: 500 }
    );
  }
}