import { permanentRedirect } from 'next/navigation'

// Permanent (308) so search engines pass ranking from "/" to "/home"
export default function Home() {
  permanentRedirect('/home')
}
