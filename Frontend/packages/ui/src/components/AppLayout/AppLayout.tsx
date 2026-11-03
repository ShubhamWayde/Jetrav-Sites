'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styles from './AppLayout.module.css';

// ── Drawer state shared by the header (menu button) and sidebar ───────────────

interface AppLayoutContextValue {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const AppLayoutContext = createContext<AppLayoutContextValue | null>(null);

export function useAppLayout(): AppLayoutContextValue {
  const ctx = useContext(AppLayoutContext);
  // Components still render outside AppLayout; the drawer just isn't available
  return (
    ctx ?? { sidebarOpen: false, openSidebar: () => {}, closeSidebar: () => {}, toggleSidebar: () => {} }
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export interface AppLayoutProps {
  header:   ReactNode;
  sidebar:  ReactNode;
  children: ReactNode;
}

export function AppLayout({ header, sidebar, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  // Close the mobile drawer after navigating (adjusting state during render,
  // React's recommended alternative to a setState-in-effect)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setSidebarOpen(false);
  }

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const value = useMemo(
    () => ({ sidebarOpen, openSidebar, closeSidebar, toggleSidebar }),
    [sidebarOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  return (
    <AppLayoutContext.Provider value={value}>
      <div className={styles.shell} data-sidebar-open={sidebarOpen || undefined}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {sidebar}

        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={closeSidebar}
        />

        <div className={styles.content}>
          {header}
          <main id="main-content" tabIndex={-1} className={styles.main}>
            <div className={styles.inner}>{children}</div>
          </main>
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
}
