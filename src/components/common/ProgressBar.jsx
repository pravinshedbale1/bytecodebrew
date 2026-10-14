import styles from './ProgressBar.module.css';

export function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.text}>
        {value}/{max} completed
      </span>
    </div>
  );
}
