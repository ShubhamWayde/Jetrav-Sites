import {Outfit, Roboto_Serif} from 'next/font/google';

export const fontOutfit = Outfit({
  subsets: ['latin'],
  variable: '--font-primary',
});

export const fontRoboto = Roboto_Serif({
  subsets: ['latin'],
  variable: '--font-secondary',
});