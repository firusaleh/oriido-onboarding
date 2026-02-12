import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    
    // Test PIN verification directly
    const pinStr = String(pin).trim();
    const verkaueferPin = process.env.VERKAEUFER_PIN || '1234';
    const adminPin = process.env.ADMIN_PIN || '9876';
    
    let role = null;
    if (pinStr === verkaueferPin) {
      role = 'verkaeufer';
    } else if (pinStr === adminPin) {
      role = 'admin';
    }
    
    return NextResponse.json({ 
      success: true,
      providedPin: pin,
      role: role,
      debug: {
        hasVerkaueferEnv: !!process.env.VERKAEUFER_PIN,
        hasAdminEnv: !!process.env.ADMIN_PIN,
        verkaueferPinLength: verkaueferPin.length,
        adminPinLength: adminPin.length,
        providedPinLength: pinStr.length,
        matchesVerkaufer: pinStr === verkaueferPin,
        matchesAdmin: pinStr === adminPin
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}