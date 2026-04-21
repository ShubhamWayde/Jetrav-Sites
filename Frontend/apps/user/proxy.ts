import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/otp'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get('user_refresh_token')?.value;

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  // Unauthenticated user on a protected page → send to /signin
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Authenticated user on an auth page → send to root for smart redirect
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
