'use client';

import Sidebar from '../sidebar/Sidebar';
import Header from '../header/Header';
import styles from './AppShell.module.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.mainWrapper}>
        <Sidebar />
        <div className={styles.main}>
          {children}
        </div>
      </div>
    </div>
  );
}
