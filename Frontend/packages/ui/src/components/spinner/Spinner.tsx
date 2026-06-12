import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  thickness?: number;
}

export default function Spinner({ size = 20, thickness = 2 }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size, borderWidth: thickness }}
      aria-label="Loading…"
      role="status"
    />
  );
}
