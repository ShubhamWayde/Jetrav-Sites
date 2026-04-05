import {Outfit, Roboto_Serif} from 'next/font/google';

export const fontOutfit = Outfit({
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
});

export const fontRoboto = Roboto_Serif({
  subsets: ['latin'],
  variable: '--font-secondary',
  display: 'swap',
});