import type { MetadataRoute } from 'next';
import { ROUTES } from '@repo/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://jetrav.com${ROUTES.marketing.home.href}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
