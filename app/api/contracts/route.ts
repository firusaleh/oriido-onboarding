import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Contract from '@/lib/models/Contract';
import { getServerSession } from '@/app/api/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const onboardingId = searchParams.get('onboardingId');
    
    const query = onboardingId ? { onboardingId } : {};
    const contracts = await Contract.find(query)
      .populate('templateId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const contract = new Contract({
      ...body,
      createdBy: session.userId,
      status: 'entwurf',
    });
    
    await contract.save();
    
    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}