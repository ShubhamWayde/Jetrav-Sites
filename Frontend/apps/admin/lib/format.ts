// ── Dates ─────────────────────────────────────────────────────────────────────

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses ISO timestamps and plain `YYYY-MM-DD` dates (as local, not UTC, midnight). */
function parseDate(value: string): Date | null {
  const match = DATE_ONLY_RE.exec(value);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `03 Nov 2026`; falls back to the raw value, or an em dash when empty. */
export function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—';
  const date = parseDate(value);
  if (!date) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * `YYYY-MM-DD` in the browser's timezone. `toISOString()` would use UTC, which
 * is the previous day for the first 5½ hours of every IST day.
 */
export function toLocalISODate(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

/** Local `YYYY-MM-DD` for today + `days`. */
export function localDateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

// ── Numbers ───────────────────────────────────────────────────────────────────

export function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
}

// ── Lead / quotation details ─────────────────────────────────────────────────

/** First non-empty value among `keys` in a details object, or an em dash. */
export function detailValue(details: Record<string, unknown> | null | undefined, ...keys: string[]): string {
  for (const key of keys) {
    const v = details?.[key];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '—';
}

/** `departureDate` → `Departure date` for generic detail keys. */
export function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
