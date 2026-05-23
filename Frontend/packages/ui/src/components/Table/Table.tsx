import type { CSSProperties, ReactNode } from 'react';
import Spinner from '../Spinner';
import styles from './Table.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T = unknown> {
  key: string;
  header: string;
  width?: number | string;
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
}: TableProps<T>) {
  const colSpan = columns.length;

  return (
    <div className={styles.wrap}>
      <table className={`${styles.table}${className ? ` ${className}` : ''}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                style={col.width ? ({ width: col.width } as CSSProperties) : undefined}
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
                <Spinner />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td className={styles.stateCell} colSpan={colSpan}>
                <span className={styles.errorText}>{error}</span>
                {onRetry && (
                  <button className={styles.retryBtn} type="button" onClick={onRetry}>
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className={styles.stateCell} colSpan={colSpan}>
                {empty ?? 'No data.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
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
