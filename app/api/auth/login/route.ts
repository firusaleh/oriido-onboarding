import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyPin, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { pin, name } = await request.json();
    
    if (!pin || !name) {
      return NextResponse.json(
        { error: 'PIN und Name sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Debug: Log the environment variables (ohne die tatsächlichen Werte zu zeigen)
    console.log('Checking PIN for role determination...');
    console.log('ADMIN_PIN exists:', !!process.env.ADMIN_PIN);
    console.log('VERKAEUFER_PIN exists:', !!process.env.VERKAEUFER_PIN);
    console.log('Provided PIN:', pin);
    
    const role = await verifyPin(pin, name);
    
    if (!role) {
      return NextResponse.json(
        { error: 'Ungültiger PIN' },
        { status: 401 }
      );
    }
    
    console.log('Role determined:', role);
    
    await connectToDatabase();
    
    // Check if user already exists
    let user = await User.findOne({ name, role });
    let isFirstLogin = false;
    
    if (!user) {
      // Create new user on first PIN login
      user = await User.create({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@oriido.temp`, // Temporary email
        role,
        isFirstLogin: true
      });
      isFirstLogin = true;
    } else if (user.isFirstLogin) {
      isFirstLogin = true;
    }
    
    // Create session with user ID
    await createSession(role, name, user._id.toString());
    
    return NextResponse.json({ 
      success: true, 
      role,
      isFirstLogin,
      redirect: isFirstLogin ? '/registrieren' : '/dashboard'
    });
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error type:', typeof error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Fehler beim Anmelden', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}