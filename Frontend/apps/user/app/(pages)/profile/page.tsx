import type { Metadata } from 'next';
import { ProfilePage } from '@repo/auth';
import { USER_API } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function UserProfilePage() {
  return (
    <ProfilePage
      profileGetUrl={USER_API.PROFILE_GET}
      profilePutUrl={USER_API.PROFILE_PUT}
      setPasswordUrl={USER_API.SET_PASSWORD}
    />
  );
}
