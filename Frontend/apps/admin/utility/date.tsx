export function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}


export function formatNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
}
