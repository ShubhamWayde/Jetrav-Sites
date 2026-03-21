import { ProfilePage } from '@repo/auth';
import { ADMIN_API } from '@/lib/constants';

export default function AdminProfilePage() {
  return (
    <ProfilePage
      profileGetUrl={ADMIN_API.PROFILE_GET}
      profilePutUrl={ADMIN_API.PROFILE_PUT}
      setPasswordUrl={ADMIN_API.SET_PASSWORD}
    />
  );
}
