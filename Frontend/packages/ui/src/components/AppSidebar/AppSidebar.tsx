'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppLayout } from '../AppLayout/AppLayout';
import styles from './AppSidebar.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export interface AppSidebarProps {
  navItems: SidebarNavItem[];
  /** Brand shown at the top, usually a logo linking home. */
  brand?: ReactNode;
  /** Small label under the brand, e.g. "Admin" or "My travel". */
  caption?: string;
  /** Pinned to the bottom of the sidebar (help link, plan badge…). */
  footer?: ReactNode;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AppSidebar({ navItems, brand, caption, footer }: AppSidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useAppLayout();

  return (
    <aside
      id="app-sidebar"
      className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}
      aria-label="Sidebar"
    >
      {(brand || caption) && (
        <div className={styles.brand}>
          {brand}
          {caption && <span className={styles.caption}>{caption}</span>}
        </div>
      )}

      <nav className={styles.nav} aria-label="Main">
        <ul className={styles.list}>
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={closeSidebar}
                >
                  <span className={styles.navIcon} aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {footer && <div className={styles.footer}>{footer}</div>}
    </aside>
  );
}
