import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get("user_refresh_token")?.value;

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Unauthenticated user trying to access a protected page → send to /signin
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Authenticated user visiting an auth page → send to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
