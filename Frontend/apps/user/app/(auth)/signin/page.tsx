import { SigninView } from '@repo/auth';
import type { AuthConfig } from '@repo/auth';

const config: AuthConfig = {
  role:              'user',
  afterAuthRedirect: '/',
  appLabel: 'User App',
};

export default function SigninPage() {
  return <SigninView config={config} />;
}
