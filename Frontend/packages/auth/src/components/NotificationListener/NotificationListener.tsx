'use client';

import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { showInfo } from '../../utils/toast';

interface Props {
  /** Pass the current user's role so the right events are subscribed. */
  role: 'admin' | 'user' | string;
}

// ── Event payloads ────────────────────────────────────────────────────────────

interface UserSignupPayload {
  name:   string;
  mobile: string;
}

interface LeadPayload {
  type:   string;
  status: string;
}

interface QuotationPayload {
  type: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * NotificationListener — invisible component that wires socket events to toast
 * notifications.  Mount once inside your app's Providers:
 *
 *   <NotificationListener role="admin" />
 *   <NotificationListener role="user"  />
 */
export default function NotificationListener({ role }: Props) {
  const { on, off } = useSocket();

  useEffect(() => {
    if (role === 'admin') {
      // ── Admin receives: new user signed up ──────────────────────────────
      const onSignup = (data: unknown) => {
        const p = data as UserSignupPayload;
        showInfo(`🆕 New user signed up: ${p.name} (${p.mobile})`);
      };
      on('user_signup', onSignup);
      return () => off('user_signup', onSignup);
    }

    if (role === 'user') {
      // ── User receives: lead created ────────────────────────────────────
      const onLeadCreated = (data: unknown) => {
        const p = data as LeadPayload;
        showInfo(`✈️ New ${p.type} lead has been added to your account`);
      };

      // ── User receives: lead updated ────────────────────────────────────
      const onLeadUpdated = (data: unknown) => {
        const p = data as LeadPayload;
        showInfo(`🔄 Your ${p.type} lead status updated to: ${p.status}`);
      };

      // ── User receives: quotation created ──────────────────────────────
      const onQuotationCreated = (data: unknown) => {
        const p = data as QuotationPayload;
        showInfo(`📋 A new ${p.type} quotation has been added to your account`);
      };

      on('lead_created',      onLeadCreated);
      on('lead_updated',      onLeadUpdated);
      on('quotation_created', onQuotationCreated);

      return () => {
        off('lead_created',      onLeadCreated);
        off('lead_updated',      onLeadUpdated);
        off('quotation_created', onQuotationCreated);
      };
    }
  }, [role, on, off]);

  return null;
}
