'use client';

import {useEffect, useState} from 'react';
import {api, useAuth, useNotifications} from '@repo/auth';
import {AppLayout} from '@repo/ui/applayout';
import {AppHeader} from '@repo/ui/appheader';
import {AppSidebar} from '@repo/ui/appsidebar';
import {Analytics, Icon, SmartSearch, Workspaces, YourTrips} from '@repo/ui/icon';
import {ADMIN_API} from '@/lib/constants';
import type {AdminProfile} from '@/app/types/profile';

// ── Admin nav items ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {href: '/dashboard', label: 'Dashboard', icon: <Icon icon={Analytics} size="sm" />},
  {href: '/customers', label: 'Customers', icon: <Icon icon={Workspaces} size="sm" />},
  {href: '/leads', label: 'Leads', icon: <Icon icon={SmartSearch} size="sm" />},
  {href: '/reports', label: 'Reports', icon: <Icon icon={YourTrips} size="sm" />},
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppShell({children}: { children: React.ReactNode }) {
  const {logout, isLoading} = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const {notifications, markAllRead, dismiss, dismissAll} = useNotifications('admin');

  useEffect(() => {
    if (isLoading) return;
    api.get<AdminProfile>(ADMIN_API.PROFILE_GET)
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
          logoText="Admin site"
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
