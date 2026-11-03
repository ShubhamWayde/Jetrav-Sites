import type { CSSProperties, ReactNode } from 'react';
import Spinner from '../spinner';
import styles from './Table.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T = unknown> {
  key: string;
  header: string;
  width?: number | string;
  /** Right-align numeric columns. */
  align?: 'left' | 'right' | 'center';
  /** Custom cell renderer. Falls back to `String(row[key])` when omitted. */
  render?: (row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string;
  empty?: ReactNode;
  onRetry?: () => void;
  className?: string;
  /** Accessible name for the table (visually hidden). */
  caption?: string;
  /** Below this width the table scrolls horizontally instead of squashing. */
  minWidth?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Table<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  empty,
  onRetry,
  className,
  caption,
  minWidth = 720,
}: TableProps<T>) {
  const colSpan = columns.length;

  return (
    <div className={styles.wrap}>
      <table
        className={`${styles.table}${className ? ` ${className}` : ''}`}
        style={{ minWidth }}
        aria-busy={loading || undefined}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={styles.th}
                style={
                  { width: col.width, textAlign: col.align } as CSSProperties
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className={styles.stateCell} colSpan={colSpan}>
                <Spinner size={24} />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td className={styles.stateCell} colSpan={colSpan}>
                <span className={styles.errorText} role="alert">{error}</span>
                {onRetry && (
                  <button className={styles.retryBtn} type="button" onClick={onRetry}>
                    Try again
                  </button>
                )}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className={styles.stateCell} colSpan={colSpan}>
                {empty ?? 'No data yet.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td} style={{ textAlign: col.align }}>
                    {col.render
                      ? col.render(row, i)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
