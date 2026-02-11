import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('admin');
    const { id } = await params;
    const updates = await request.json();
    const db = await getDatabase();
    
    delete updates._id;
    
    const result = await db.collection('onboardings').updateOne(
      { _id: new ObjectId(id) },
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
    console.error('Error updating onboarding as admin:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Onboardings' },
      { status: 500 }
    );
  }
}