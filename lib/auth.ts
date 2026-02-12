import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface AuthToken {
  role: 'verkaeufer' | 'admin';
  name: string;
  userId?: string;
  iat?: number;
  exp?: number;
}

export async function verifyPin(pin: string, name: string): Promise<'verkaeufer' | 'admin' | null> {
  // Konvertiere beide zu Strings für sicheren Vergleich
  const pinStr = String(pin).trim();
  const verkaueferPin = process.env.VERKAEUFER_PIN ? String(process.env.VERKAEUFER_PIN).trim() : '';
  const adminPin = process.env.ADMIN_PIN ? String(process.env.ADMIN_PIN).trim() : '';
  
  console.log('PIN verification:', {
    providedPin: pinStr,
    hasVerkaueferPin: !!verkaueferPin,
    hasAdminPin: !!adminPin,
    matchesVerkaufer: pinStr === verkaueferPin,
    matchesAdmin: pinStr === adminPin
  });
  
  if (pinStr === verkaueferPin && verkaueferPin !== '') {
    return 'verkaeufer';
  }
  if (pinStr === adminPin && adminPin !== '') {
    return 'admin';
  }
  return null;
}

export async function createSession(role: 'verkaeufer' | 'admin', name: string, userId?: string) {
  const token = jwt.sign(
    { role, name, userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<AuthToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = jwt.verify(token.value, JWT_SECRET) as AuthToken;
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(requiredRole?: 'verkaeufer' | 'admin'): Promise<AuthToken> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Nicht authentifiziert');
  }
  
  if (requiredRole && session.role !== requiredRole && session.role !== 'admin') {
    throw new Error('Keine Berechtigung');
  }
  
  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}