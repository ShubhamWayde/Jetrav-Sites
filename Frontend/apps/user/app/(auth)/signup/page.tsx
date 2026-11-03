import { SignupView } from '@repo/auth';
import type { AuthConfig } from '@repo/auth';

const config: AuthConfig = {
  role:              'user',
  afterAuthRedirect: '/',
  appLabel:          'Jetrav app',
};

export default function SignupPage() {
  return <SignupView config={config} />;
}
