import type { LeadResponse } from './lead';

// ── Stats ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  contacted:   number;
  quotation:   number;
  quoted:      number;
  negotiation: number;
  confirmed:   number;
  lost:        number;
}

// ── Dashboard API response ────────────────────────────────────────────────────

export interface DashboardResponse {
  stats:              DashboardStats;
  upcomingAirTrips:   LeadResponse[];
  upcomingHotelTrips: LeadResponse[];
}

// ── Filter option types ───────────────────────────────────────────────────────

export type DateRange     = 'today' | 'last_3_days' | 'last_7_days' | 'last_month' | 'all_time';
export type CustomerType  = 'all' | 'new' | 'existing';
export type TripDateFilter = 'today' | 'in_1_day' | 'in_2_days' | 'upcoming';
export type TripFilter    = 'all' | 'domestic' | 'international';
