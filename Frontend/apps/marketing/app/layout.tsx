import type {Metadata} from "next";
import "@repo/ui/styles/css/base.css";
import "./globals.css";
import {fontOutfit} from "@repo/ui/fonts/fonts";

export const metadata: Metadata = {
  title: {
    default: "Jetrav | Travel Seamlessly, Earn Instantly",
    template: "%s | Jetrav",
  },
  description: "The only travel agency that gives you 15% back in Jet Points on every flight and manages your entire trip starting at ₹199.",

  keywords: [
    'smart travel agency',
    'flight booking India',
    'Jet Points travel rewards',
    'flat fee travel agent',
    'seamless travel management',
    'visa processing assistance',
    'holiday packages',
    'zero change fee flights'
  ],

  authors: [{name: 'Jetrav LLP'}],
  creator: 'Jetrav',
  publisher: 'Jetrav LLP',

  metadataBase: new URL('https://jetrav.com'),

  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/en-IN',
    },
  },

  openGraph: {
    title: 'Jetrav | Travel Seamlessly, Earn Instantly',
    description: "Earn 15% back in Jet Points and let our Human + AI concierges manage your travel starting at ₹199. Dial. Done. Depart.",
    url: 'https://jetrav.com',
    siteName: 'Jetrav',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jetrav - A Tokenized Travel Economy',
      },
    ],
    locale: 'en-IN',
    type: 'website',
  },

  twitter: {
    card: "summary_large_image",
    title: "Jetrav | Smart Travel Management",
    description: "Get 15% back in Jet Points on flights and trip management starting at ₹199. Stop searching. Start traveling.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jetrav - A Tokenized Travel Economy',
      },
    ],
    creator: '@jetrav',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontOutfit.className}>
        {children}
      </body>
    </html>
  );
}
