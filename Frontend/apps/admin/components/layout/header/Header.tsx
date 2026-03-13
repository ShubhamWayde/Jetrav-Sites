'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import { BellIcon, GearIcon, LogoutIcon } from '@/components/ui/icons-library/Icons';
import styles from './Header.module.css';
import { AdminProfile } from '@/app/types/profile';


// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(firstName = '', lastName = ''): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Header() {
  const { logout, isLoading } = useAuth();

  const [profile, setProfile]         = useState<AdminProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                    = useRef<HTMLDivElement>(null);
  const initials  = getInitials(profile?.firstName, profile?.lastName);

  // ── Fetch profile ────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;
    api.get<AdminProfile>(ADMIN_API.PROFILE_GET)
      .then((res) => { if (res.data) setProfile(res.data); })
      .catch(() => {}); // silent — header should never crash on profile failure
  }, [isLoading]);

  // ── Close dropdown on outside click ──────────────────────────────────────

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

  // ── Close on Escape ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dropdownOpen]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Admin site</h1>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} type="button" aria-label="Notifications">
          <BellIcon size={17} />
        </button>

        <div className={styles.avatarWrap} ref={dropdownRef}>
          <button
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
                  {profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : '—'}
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

              {/* Profile Configuration */}
              <Link
                href="/profile"
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <span className={styles.dropdownItemIcon}><GearIcon size={15} /></span>
                Profile Configuration
              </Link>

              <div className={styles.divider} />

              {/* Logout */}
              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                type="button"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); logout(); }}
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
