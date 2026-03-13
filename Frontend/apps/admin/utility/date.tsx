export function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}


export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}
