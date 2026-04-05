import { OTPView } from '@repo/auth';
import type { AuthConfig } from '@repo/auth';

const config: AuthConfig = {
  role:              'user',
 afterAuthRedirect: '/',
  appLabel: 'your account',
};

export default function OTPPage() {
  return <OTPView config={config} />;
}
