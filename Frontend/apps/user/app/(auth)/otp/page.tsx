import { OTPView } from '@repo/auth';
import type { AuthConfig } from '@repo/auth';

const config: AuthConfig = {
  role:              'user',
  afterAuthRedirect: '/',
  appLabel:          'Jetrav app',
};

export default function OTPPage() {
  return <OTPView config={config} />;
}
