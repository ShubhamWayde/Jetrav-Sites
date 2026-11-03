const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const numberFormatter = new Intl.NumberFormat('en-IN');

/** "05 Mar 2026", or an em dash when the date is missing/invalid. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

/** Indian digit grouping, e.g. 1,25,000. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Rupee amount without decimals, e.g. ₹1,999. */
export function formatRupees(value: number): string {
  return `₹${numberFormatter.format(Math.round(value))}`;
}

/** "monthly" → "Monthly". */
export function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/** Whole days from now until `iso` (negative when past), or null. */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / 86_400_000);
}
