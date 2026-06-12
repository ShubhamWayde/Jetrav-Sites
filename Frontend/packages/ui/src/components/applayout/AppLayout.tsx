import type { ReactNode } from 'react';
import styles from './AppLayout.module.css';

export interface AppLayoutProps {
  header:   ReactNode;
  sidebar:  ReactNode;
  children: ReactNode;
}

export function AppLayout({ header, sidebar, children }: AppLayoutProps) {
  return (
    <div className={styles.shell}>
      {header}
      <div className={styles.mainWrapper}>
        {sidebar}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
