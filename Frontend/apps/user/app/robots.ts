import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

/** Only the public sign-in / sign-up pages are worth indexing; the rest is behind auth. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Crawlers need the static assets to render the public pages
      allow: ['/signin', '/signup', '/_next/static/', '/favicon.ico'],
      disallow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
