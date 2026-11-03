'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { showError, useAuth, useNotifications } from '@repo/auth';
import { AppLayout } from '@repo/ui/AppLayout';
import { AppHeader } from '@repo/ui/AppHeader';
import { AppSidebar } from '@repo/ui/AppSidebar';
import { Logo } from '@repo/ui/Logo';
import { Analytics, Icon, JetPoints, Registration } from '@repo/ui/icon';
import { AccountProvider, useAccount } from './AccountContext';
import PlanSummary from './PlanSummary';

// ── User nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',  icon: <Icon icon={Analytics} size="sm" /> },
  { href: '/accounts',  label: 'My account', icon: <Icon icon={JetPoints} size="sm" /> },
  { href: '/profile',   label: 'Profile',    icon: <Icon icon={Registration} size="sm" /> },
];

const BRAND = (
  <Link href="/dashboard" aria-label="Jetrav — go to dashboard">
    <Logo />
  </Link>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <Shell>{children}</Shell>
    </AccountProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { notifications, markAllRead, dismiss, dismissAll } = useNotifications('user');
  const { profile, subscription } = useAccount();

  // The header still works without a profile (initials fall back to "?"), so a
  // failed load is reported once instead of blocking the page. 401s are
  // already handled by the API client (it redirects to /signin).
  const reportedProfileError = useRef(false);
  useEffect(() => {
    if (!profile.error || profile.errorStatus === 401 || reportedProfileError.current) return;
    reportedProfileError.current = true;
    showError(profile.error);
  }, [profile.error, profile.errorStatus]);

  return (
    <AppLayout
      header={
        <AppHeader
          logoText="Jetrav"
          showNotifications
          profile={profile.data}
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
          caption="My travel"
          footer={<PlanSummary subscription={subscription.loading ? null : subscription.data} />}
        />
      }
    >
      {children}
    </AppLayout>
  );
}
