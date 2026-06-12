'use client';

import {useEffect, useState} from 'react';
import {api, useAuth, useNotifications} from '@repo/auth';
import {AppLayout} from '@repo/ui/applayout';
import {AppHeader} from '@repo/ui/appheader';
import {AppSidebar} from '@repo/ui/appsidebar';
import {Analytics, Icon, JetPoints} from '@repo/ui/icon';
import {USER_API} from '@/lib/constants';
import type {UserProfile} from '@/app/types/profile';

// ── User nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {href: '/dashboard', label: 'Dashboard', icon: <Icon icon={Analytics} size="sm" />},
  {href: '/accounts', label: 'Accounts', icon: <Icon icon={JetPoints} size="sm" />},
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppShell({children}: { children: React.ReactNode }) {
  const {logout, isLoading} = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const {notifications, markAllRead, dismiss, dismissAll} = useNotifications('user');

  useEffect(() => {
    if (isLoading) return;
    api.get<UserProfile>(USER_API.PROFILE_GET)
      .then(res => {
        if (res.data) setProfile(res.data);
      })
      .catch(() => {
      });
  }, [isLoading]);

  return (
    <AppLayout
      header={
        <AppHeader
          logoText="User App"
          showNotifications
          profile={profile}
          profileSettingsPath="/profile"
          onLogout={logout}
          notifications={notifications}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          onDismissAll={dismissAll}
        />
      }
      sidebar={<AppSidebar navItems={NAV_ITEMS} />}
    >
      {children}
    </AppLayout>
  );
}
