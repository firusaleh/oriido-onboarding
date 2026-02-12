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
    
    const role = await verifyPin(pin, name);
    
    if (!role) {
      return NextResponse.json(
        { error: 'Ungültiger PIN' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Check if user already exists
    let user = await User.findOne({ name, role });
    let isFirstLogin = false;
    
    if (!user) {
      try {
        // Create new user on first PIN login - use unique email to avoid conflicts
        const timestamp = Date.now();
        const uniqueEmail = `${name.toLowerCase().replace(/\s+/g, '.')}.${role}.${timestamp}@oriido.temp`;
        
        user = await User.create({
          name,
          email: uniqueEmail,
          role,
          isFirstLogin: true
        });
        isFirstLogin = true;
      } catch (createError) {
        console.error('Error creating user:', createError);
        // If user creation fails, try to find by name only (maybe role was different)
        user = await User.findOne({ name });
        if (user) {
          // Update the role if needed
          user.role = role;
          await user.save();
        } else {
          throw createError;
        }
      }
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
    console.error('Login error:', error);
    
    // Detailliertere Fehlermeldung für Debugging
    let errorMessage = 'Fehler beim Anmelden';
    if (error instanceof Error) {
      // In Production sollten wir keine Details zeigen, aber für Debugging ist es hilfreich
      if (error.message.includes('E11000')) {
        errorMessage = 'E-Mail-Konflikt - bitte anderen Namen verwenden';
      } else if (error.message.includes('connect')) {
        errorMessage = 'Datenbankverbindung fehlgeschlagen';
      }
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}