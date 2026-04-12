'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AppSidebar.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export interface AppSidebarProps {
  navItems: SidebarNavItem[];
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AppSidebar({ navItems }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
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
