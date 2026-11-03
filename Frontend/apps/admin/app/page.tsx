import { redirect } from 'next/navigation';

// The proxy sends visitors without a session on to /signin
export default function Home() {
  redirect('/dashboard');
}
