import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail oder Passwort' },
        { status: 401 }
      );
    }
    
    // Check password
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail oder Passwort' },
        { status: 401 }
      );
    }
    
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    
    // Create session
    await createSession(user.role, user.name, user._id.toString());
    
    return NextResponse.json({ 
      success: true, 
      role: user.role,
      isFirstLogin: false,
      redirect: '/dashboard'
    });
  } catch (error) {
    console.error('Email login error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Anmelden' },
      { status: 500 }
    );
  }
}