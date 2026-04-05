'use client';

import { useCallback, useRef, useState } from 'react';
import { useSocket } from './useSocket';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AppNotification {
  id:        string;
  icon:      string;
  title:     string;
  body:      string;
  read:      boolean;
  timestamp: Date;
}

// ── Event → Notification map ──────────────────────────────────────────────────

interface UserSignupPayload  { name: string; mobile: string }
interface LeadPayload        { type: string; status: string }
interface QuotationPayload   { type: string }

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function fromEvent(event: string, data: unknown): AppNotification | null {
  switch (event) {
    case 'user_signup': {
      const p = data as UserSignupPayload;
      return { id: makeId(), icon: '👤', title: 'New User Signup',
        body: `${p.name} (${p.mobile}) just created an account.`,
        read: false, timestamp: new Date() };
    }
    case 'lead_created': {
      const p = data as LeadPayload;
      return { id: makeId(), icon: '🎯', title: 'New Lead Added',
        body: `A new ${p.type} lead has been assigned to your account.`,
        read: false, timestamp: new Date() };
    }
    case 'lead_updated': {
      const p = data as LeadPayload;
      return { id: makeId(), icon: '🔄', title: 'Lead Updated',
        body: `Your ${p.type} lead status changed to "${p.status}".`,
        read: false, timestamp: new Date() };
    }
    case 'quotation_created': {
      const p = data as QuotationPayload;
      return { id: makeId(), icon: '📋', title: 'New Quotation',
        body: `A ${p.type} quotation has been added to your account.`,
        read: false, timestamp: new Date() };
    }
    default:
      return null;
  }
}

// Events each role subscribes to
const ROLE_EVENTS: Record<string, string[]> = {
  admin: ['user_signup'],
  user:  ['lead_created', 'lead_updated', 'quotation_created'],
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(role: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { on, off } = useSocket();
  const registeredRef = useRef(false);

  // Register once per role
  const registerHandlers = useCallback(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    const events = ROLE_EVENTS[role] ?? [];
    events.forEach(event => {
      const handler = (data: unknown) => {
        const n = fromEvent(event, data);
        if (n) setNotifications(prev => [n, ...prev]);
      };
      on(event, handler);
    });
  }, [role, on, off]);

  // Call once on mount (safe to call multiple times — guarded by ref)
  registerHandlers();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAllRead, dismiss, dismissAll };
}
