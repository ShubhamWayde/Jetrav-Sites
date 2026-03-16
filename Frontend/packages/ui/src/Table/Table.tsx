import type { CSSProperties, ReactNode } from 'react';
import styles from './Table.module.css';

export interface Column {
  header: string;
  width?: number | string;
}

interface TableProps {
  columns: Column[];
  children: ReactNode;
  className?: string;
}

export default function Table({ columns, children, className }: TableProps) {
  return (
    <div className={styles.wrap}>
      <table className={`${styles.table}${className ? ` ${className}` : ''}`}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={styles.th}
                style={col.width ? ({ width: col.width } as CSSProperties) : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface TrProps {
  children: ReactNode;
  className?: string;
}

export function Tr({ children, className }: TrProps) {
  return (
    <tr className={`${styles.row}${className ? ` ${className}` : ''}`}>
      {children}
    </tr>
  );
}

interface TdProps {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
  style?: CSSProperties;
}

export function Td({ children, className, colSpan, style }: TdProps) {
  return (
    <td
      className={`${styles.td}${className ? ` ${className}` : ''}`}
      colSpan={colSpan}
      style={style}
    >
      {children}
    </td>
  );
}
