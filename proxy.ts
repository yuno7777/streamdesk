import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve secure session cookie
  const sessionCookie = request.cookies.get('streamdesk_session');
  const isAuthenticated = sessionCookie?.value === 'streamdesk_active_session';

  const isAuthRoute = pathname === '/login' || pathname.startsWith('/api/auth');

  // If not authenticated and attempting to view restricted screens, redirect to /login
  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and attempting to view login page, redirect to home/dashboard
  if (isAuthenticated && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
