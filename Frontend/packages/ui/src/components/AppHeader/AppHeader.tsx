'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellIcon, GearIcon, LogoutIcon } from '../Icons/Icons';
import styles from './AppHeader.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AppHeaderProfile {
  firstName?:    string;
  lastName?:     string;
  email?:        string;
  mobileNumber?: string;
  role?:         string;
}

export interface AppHeaderProps {
  logoText:              string;
  showNotifications?:    boolean;
  profile?:              AppHeaderProfile | null;
  profileSettingsPath:   string;
  onLogout():            void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(firstName = '', lastName = ''): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AppHeader({
  logoText,
  showNotifications = true,
  profile,
  profileSettingsPath,
  onLogout,
}: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials    = getInitials(profile?.firstName, profile?.lastName);

  // Close on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dropdownOpen]);

  // Close on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dropdownOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>{logoText}</h1>
      </div>

      <div className={styles.actions}>
        {showNotifications && (
          <button
            title="Notifications"
            className={styles.iconBtn}
            type="button"
            aria-label="Notifications"
          >
            <BellIcon size={17} />
          </button>
        )}

        <div className={styles.avatarWrap} ref={dropdownRef}>
          <button
            title="Open user menu"
            className={styles.avatarBtn}
            type="button"
            aria-label="Open user menu"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span className={styles.avatarText}>{initials}</span>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown} role="menu" aria-label="User menu">
              <div className={styles.userCard}>
                <div className={styles.userAvatar}>{initials}</div>
                <p className={styles.userName}>
                  {profile ? `${profile.firstName} ${profile.lastName}` : '—'}
                </p>
                <p className={styles.userEmail}>{profile?.email || '—'}</p>
                {profile?.mobileNumber && (
                  <p className={styles.userMobile}>{profile.mobileNumber}</p>
                )}
                {profile?.role && (
                  <span className={styles.roleBadge}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                )}
              </div>

              <div className={styles.divider} />

              <Link
                href={profileSettingsPath}
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <span className={styles.dropdownItemIcon}><GearIcon size={15} /></span>
                Profile Configuration
              </Link>

              <div className={styles.divider} />

              <button
                title="Log out"
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                type="button"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); onLogout(); }}
              >
                <span className={styles.dropdownItemIcon}><LogoutIcon size={15} /></span>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
