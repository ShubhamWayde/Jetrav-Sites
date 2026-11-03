import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://jetrav.com/sitemap.xml',
    host: 'https://jetrav.com',
  };
}
