import Spinner from '@repo/ui/Spinner';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loading}>
      <Spinner size={32} label="Loading page" />
    </div>
  );
}
