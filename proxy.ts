import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/'];
const SESSION_COOKIE_NAME = 'session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 1. If the user is on a public route (like /login) and has a session,
  // redirect them to the dashboard.
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If the user is on a protected route and has NO session,
  // redirect them to login.
  const isProtectedRoute = !PUBLIC_ROUTES.includes(pathname) && 
                         !pathname.startsWith('/api') && 
                         !pathname.startsWith('/_next') && 
                         !pathname.includes('.');

  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    // Optional: add a redirect parameter to return after login
    // loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
