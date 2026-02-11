import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;
  
  // Public routes - no auth needed
  const publicPaths = ['/', '/api/auth/login', '/api/auth/logout'];
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Allow all API routes for now (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Check if user has auth token
  if (!token) {
    console.log('No auth token, redirecting to login');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // For now, just check if token exists
  // Proper validation happens in API routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};