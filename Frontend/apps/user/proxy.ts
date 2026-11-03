import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup', '/otp'];

/**
 * Cheap routing guard based on the presence of the httpOnly refresh cookie.
 * The backend still validates every request; this only avoids flashing
 * signed-in pages to signed-out visitors (and vice versa).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get('user_refresh_token')?.value;

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals, metadata routes (robots, sitemap, icons,
  // OG images) and any static file with an extension, so crawlers and link
  // previews are never redirected to /signin.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|icon|apple-icon|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|webmanifest)$).*)',
  ],
};
