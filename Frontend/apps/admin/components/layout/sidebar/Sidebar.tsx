'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon, LeadsIcon, ReportsIcon, UsersIcon } from '@/components/ui/icons-library/Icons';
import styles from './Sidebar.module.css';

// ── Nav items — extend this list as you add pages ─────────────────────────

const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon size={18} /> },
  { href: '/customers', label: 'Customers',  icon: <UsersIcon size={18} /> },
  { href: '/leads',     label: 'Leads',      icon: <LeadsIcon size={18} /> },
  { href: '/reports',   label: 'Reports',    icon: <ReportsIcon size={18} /> },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
