import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/otp'];

/**
 * Coarse routing guard only. The refresh cookie is httpOnly and set by the API
 * (Domain=.jetrav.com in production), so its presence means "probably signed
 * in". Real authorisation happens on the API with the in-memory access token.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get('admin_refresh_token')?.value);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));

  if (!hasSession && !isAuthRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals, metadata files and static assets so
  // crawlers and browsers can always fetch robots.txt, icons, etc.
  matcher: [
    '/((?!api|_next/static|_next/image|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|favicon\\.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|woff2?)$).*)',
  ],
};
