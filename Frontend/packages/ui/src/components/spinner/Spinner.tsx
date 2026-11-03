import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  thickness?: number;
  /** Announced to screen readers. */
  label?: string;
}

export default function Spinner({ size = 20, thickness = 2, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className={styles.wrap}>
      <span
        className={styles.spinner}
        style={{ width: size, height: size, borderWidth: thickness }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
