import type { Metadata } from 'next';

// Placeholder page: kept out of search results until it has real content
export const metadata: Metadata = {
  title: 'Services',
  robots: { index: false, follow: true },
};

export default function ServicesPage() {
  return (
    <h1>Services</h1>
  )
}
