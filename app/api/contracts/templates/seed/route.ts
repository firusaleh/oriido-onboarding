import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ContractTemplate from '@/lib/models/ContractTemplate';
import { getServerSession } from '@/app/api/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const templates = await request.json();
    
    // Clear existing templates
    await ContractTemplate.deleteMany({});
    
    // Insert new templates
    const result = await ContractTemplate.insertMany(templates);
    
    return NextResponse.json({ 
      success: true, 
      count: result.length,
      message: `${result.length} templates created successfully` 
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}