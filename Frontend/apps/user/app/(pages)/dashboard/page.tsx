'use client';

import React, {useEffect, useState} from 'react';
import {api} from '@repo/auth';
import Spinner from '@repo/ui/spinner';
import {Icon, SmartSearch, TrackBooking} from '@repo/ui/icon';
import {USER_API} from '@/lib/constants';
import type {LeadResponse, QuotationResponse, UserDashboard} from '@/app/types/profile';
import styles from './dashboard.module.css';

// ── Status colours (runtime data → inline style) ───────────────────────────────

const STATUS_BG: Record<string, string> = {
  quotation: '#e8f4fd',
  contacted: '#fff3cd',
  quoted: '#d1ecf1',
  confirmed: '#d4edda',
  negotiation: '#f8d7da',
  cancelled: '#f0f0f0',
  lost: '#f0f0f0',
};

const STATUS_FG: Record<string, string> = {
  quotation: '#0c6093',
  contacted: '#856404',
  quoted: '#0c5460',
  confirmed: '#155724',
  negotiation: '#721c24',
  cancelled: '#6c757d',
  lost: '#6c757d',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function LeadCard({lead}: { lead: LeadResponse }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardType}>{lead.type}</span>
        <span
          className={styles.statusBadge}
          style={{background: STATUS_BG[lead.status] ?? '#f0f0f0', color: STATUS_FG[lead.status] ?? '#333'}}
        >
          {lead.status}
        </span>
      </div>
      {lead.assignTo && <p className={styles.cardAssign}>Assigned to: {lead.assignTo}</p>}
      {lead.remark && <p className={styles.cardRemark}>{lead.remark}</p>}
      <p className={styles.cardMeta}>
        Added by {lead.createdByName} &bull; {new Date(lead.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function QuotationCard({quotation}: { quotation: QuotationResponse }) {
  return (
    <div className={styles.card}>
      <span className={styles.cardType}>{quotation.type}</span>
      {quotation.assignTo && <p className={styles.cardAssign}>Assigned to: {quotation.assignTo}</p>}
      {quotation.remark && <p className={styles.cardRemark}>{quotation.remark}</p>}
      <p className={styles.cardMeta}>{new Date(quotation.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<UserDashboard>(USER_API.DASHBOARD)
      .then(json => {
        if (json.success && json.data) setData(json.data);
        else setError(json.message ?? 'Failed to load dashboard');
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner size={36} />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const leads = data?.leads ?? [];
  const quotations = data?.quotations ?? [];

  const stats = [
    {label: 'Total Leads', value: leads.length},
    {label: 'Total Quotations', value: quotations.length},
    {label: 'Active Leads', value: leads.filter(l => !['cancelled', 'lost'].includes(l.status)).length},
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* Stats */}
      <div className={styles.statsRow}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.statCard}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Leads */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon={SmartSearch} size="sm" />
          My Leads
        </h2>
        {leads.length === 0 ? (
          <p className={styles.emptyText}>No leads yet.</p>
        ) : (
          <div className={styles.cardList}>
            {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        )}
      </section>

      {/* Quotations */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon={TrackBooking} size="sm" />
          My Quotations
        </h2>
        {quotations.length === 0 ? (
          <p className={styles.emptyText}>No quotations yet.</p>
        ) : (
          <div className={styles.cardList}>
            {quotations.map(q => <QuotationCard key={q.id} quotation={q} />)}
          </div>
        )}
      </section>
    </div>
  );
}
