import type { MetadataRoute } from 'next';

// Internal admin console — nothing here should be crawled
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  };
}
