import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) {
    return null;
  }
  
  try {
    // Parse the JWT token (simple base64 decode for the payload)
    const parts = token.value.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    );
    
    return {
      role: payload.role,
      name: payload.name,
      userId: payload.userId
    };
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}