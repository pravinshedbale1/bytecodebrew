import styles from './Practice.module.css';

/**
 * A design exercise: the task is visible, the suggested approach stays
 * hidden until the reader has tried it.
 *   <Practice task="Add EV charging spots.">approach in markdown</Practice>
 */
export function Practice({ task, children }) {
  return (
    <div className={styles.practice}>
      <p className={styles.label}>Try it</p>
      <p className={styles.task}>{task}</p>
      <details className={styles.details}>
        <summary className={styles.toggle}>Show an approach</summary>
        <div className={styles.answer}>{children}</div>
      </details>
    </div>
  );
}
