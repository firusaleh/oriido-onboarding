import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // User must be logged in with PIN first
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert. Bitte zuerst mit PIN anmelden.' },
        { status: 401 }
      );
    }
    
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== session.userId) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse wird bereits verwendet' },
        { status: 400 }
      );
    }
    
    // Update the user created during PIN login
    const user = await User.findById(session.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Update user details
    user.name = name;
    user.email = email.toLowerCase();
    user.password = password;
    user.isFirstLogin = false;
    user.updatedAt = new Date();
    
    await user.save();
    
    return NextResponse.json({ 
      success: true,
      message: 'Registrierung erfolgreich! Du kannst dich jetzt mit deiner E-Mail anmelden.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Registrierung' },
      { status: 500 }
    );
  }
}