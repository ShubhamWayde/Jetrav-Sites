import { ProfilePage } from '@repo/auth';
import { USER_API } from '@/lib/constants';

export default function AccountPage() {
  return (
    <ProfilePage
      profileGetUrl={USER_API.PROFILE_GET}
      profilePutUrl={USER_API.PROFILE_PUT}
      setPasswordUrl={USER_API.SET_PASSWORD}
    />
  );
}
