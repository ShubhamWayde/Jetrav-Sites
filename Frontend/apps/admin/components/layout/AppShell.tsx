'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { showError, useAuth, useNotifications } from '@repo/auth';
import { AppHeader } from '@repo/ui/AppHeader';
import { AppLayout } from '@repo/ui/AppLayout';
import { AppSidebar } from '@repo/ui/AppSidebar';
import { Logo } from '@repo/ui/Logo';
import { Analytics, Icon, SmartSearch, Workspaces } from '@repo/ui/icon';
import { ADMIN_API } from '@/lib/constants';
import { useApiQuery } from '@/lib/useApiQuery';
import type { AdminProfile } from '@/app/types/profile';
import styles from './AppShell.module.css';

// ── Admin nav items ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: <Icon icon={Analytics} size="sm" /> },
  { href: '/customers', label: 'Customers', icon: <Icon icon={Workspaces} size="sm" /> },
  { href: '/leads', label: 'Leads', icon: <Icon icon={SmartSearch} size="sm" /> },
];

const BRAND = (
  <Link href="/dashboard" aria-label="Jetrav Admin dashboard">
    <Logo />
  </Link>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { notifications, markAllRead, dismiss, dismissAll } = useNotifications('admin');
  const profile = useApiQuery<AdminProfile>(ADMIN_API.PROFILE_GET, "Couldn't load your profile.");

  // Tell the admin once, then retry whenever they come back to the tab
  const { error: profileError, reload: reloadProfile } = profile;
  const errorShown = useRef(false);
  useEffect(() => {
    if (!profileError) return;
    if (!errorShown.current) showError(profileError);
    errorShown.current = true;
    window.addEventListener('focus', reloadProfile);
    return () => window.removeEventListener('focus', reloadProfile);
  }, [profileError, reloadProfile]);

  const name = profile.data ? `${profile.data.firstName} ${profile.data.lastName}`.trim() : '';

  return (
    <AppLayout
      header={
        <AppHeader
          logoText="Jetrav Admin"
          showNotifications
          profile={profile.data ?? null}
          profileSettingsPath="/profile"
          onLogout={logout}
          notifications={notifications}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          onDismissAll={dismissAll}
        />
      }
      sidebar={
        <AppSidebar
          navItems={NAV_ITEMS}
          brand={BRAND}
          caption="Admin"
          footer={
            name ? (
              <p className={styles.signedIn}>
                Signed in as <span className={styles.name}>{name}</span>
              </p>
            ) : undefined
          }
        />
      }
    >
      {children}
    </AppLayout>
  );
}
