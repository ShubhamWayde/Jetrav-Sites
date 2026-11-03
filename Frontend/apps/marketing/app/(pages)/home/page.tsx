import type { Metadata } from 'next';
import { ROUTES } from '@repo/constants';
import Hero from '../../components/sections/hero/hero';
import Token from '../../components/sections/token/token';
import Peace from '../../components/sections/peace/peace';
import Solutions from '../../components/sections/solutions/solutions';
import ChangePlans from '../../components/sections/change-plans/change-plans';
import Cta from '../../components/sections/cta/cta';
import AboutJetrav from '../../components/sections/about-jetrav/about-jetrav';
import Packages from '../../components/sections/packages/packages';

export const metadata: Metadata = {
  alternates: {
    canonical: '/home',
  },
};

// Structured data so search engines can show rich results (name, logo, contact, socials)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Jetrav',
  legalName: 'Jetrav LLP',
  url: 'https://jetrav.com/home',
  logo: 'https://jetrav.com/icon.svg',
  image: 'https://jetrav.com/og-image.png',
  description:
    'The only travel agency that gives you 15% back in Jet Points on every flight and manages your entire trip starting at ₹199.',
  slogan: 'Jet. Set. Travel.',
  priceRange: '₹199+',
  areaServed: 'IN',
  telephone: ROUTES.marketing.phoneNumber.href.replace('tel:', ''),
  email: ROUTES.marketing.email.label,
  sameAs: ['https://www.instagram.com/jetravco', 'https://x.com/jetravco'],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }}
      />
      <Hero />
      <Packages />
      <Token />
      <Peace />
      <AboutJetrav />
      <Solutions />
      <ChangePlans />
      <Cta />
    </>
  );
}
