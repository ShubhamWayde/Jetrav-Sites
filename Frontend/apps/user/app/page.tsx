import type { Metadata } from 'next';
import RootRedirect from './RootRedirect';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Home() {
  return <RootRedirect />;
}
