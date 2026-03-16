import { SignupView } from '@repo/auth';
import type { AuthConfig } from '@repo/auth';

const config: AuthConfig = {
  role:              'admin',
  afterAuthRedirect: '/dashboard',
  appLabel:          'admin panel',
};

export default function SignupPage() {
  return <SignupView config={config} />;
}
