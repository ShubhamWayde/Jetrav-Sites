'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Edit, Icon, Login, Notifications } from '../../icon';
import styles from './AppHeader.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AppHeaderProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
}

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
}

export interface AppHeaderProps {
  logoText: string;
  showNotifications?: boolean;
  profile?: AppHeaderProfile | null;
  profileSettingsPath: string;
  notifications?: AppNotification[];

  onLogout(): void;

  onMarkAllRead?(): void;
  onDismiss?(id: string): void;
  onDismissAll?(): void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(firstName = '', lastName = ''): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AppHeader({
  logoText,
  showNotifications = true,
  profile,
  profileSettingsPath,
  onLogout,
  notifications = [],
  onMarkAllRead,
  onDismiss,
  onDismissAll,
}: AppHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(profile?.firstName, profile?.lastName);
  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!profileOpen && !notifOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [profileOpen, notifOpen]);

  // Close on Escape
  useEffect(() => {
    if (!profileOpen && !notifOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profileOpen, notifOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>{logoText}</h1>
      </div>

      <div className={styles.actions}>
        {/* ── Bell ─────────────────────────────────────────────────────── */}
        {showNotifications && (
          <div className={styles.notifWrap} ref={notifRef}>
            <button
              title="Notifications"
              className={styles.iconBtn}
              type="button"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => {
                setNotifOpen((p) => !p);
                setProfileOpen(false);
              }}
            >
              <Icon icon={Notifications} size="md" />
              {unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
            </button>

            {notifOpen && (
              <div className={styles.notifDropdown} role="dialog" aria-label="Notifications">
                {/* Header */}
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      className={styles.markAllBtn}
                      onClick={() => {
                        onMarkAllRead?.();
                      }}
                    >
                      ✔✔ Mark all as read
                    </button>
                  )}
                </div>

                <div className={styles.divider} />

                {/* List */}
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <p className={styles.notifEmpty}>No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`${styles.notifItem} ${n.read ? '' : styles.notifUnread}`}
                      >
                        <span className={styles.notifIcon}>{n.icon}</span>
                        <div className={styles.notifContent}>
                          <div className={styles.notifItemHeader}>
                            <span className={styles.notifItemTitle}>{n.title}</span>
                            <span className={styles.notifTime}>{timeAgo(n.timestamp)}</span>
                          </div>
                          <p className={styles.notifBody}>{n.body}</p>
                        </div>
                        <button
                          className={styles.notifDismiss}
                          onClick={() => onDismiss?.(n.id)}
                          aria-label="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <>
                    <div className={styles.divider} />
                    <button
                      className={styles.clearAllBtn}
                      onClick={() => {
                        onDismissAll?.();
                      }}
                    >
                      Clear all notifications
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Avatar / Profile ─────────────────────────────────────────── */}
        <div className={styles.avatarWrap} ref={profileRef}>
          <button
            title="Open user menu"
            className={styles.avatarBtn}
            type="button"
            aria-label="Open user menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
          >
            <span className={styles.avatarText}>{initials}</span>
          </button>

          {profileOpen && (
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
                onClick={() => setProfileOpen(false)}
              >
                <span className={styles.dropdownItemIcon}>
                  <Icon icon={Edit} size="sm" />
                </span>
                Profile Configuration
              </Link>

              <div className={styles.divider} />

              <button
                title="Log out"
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
              >
                <span className={styles.dropdownItemIcon}>
                  <Icon icon={Login} size="sm" />
                </span>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
