import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/otp'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get('admin_refresh_token')?.value;

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
