import { ChevronRight } from 'lucide-react';
import styles from './FullCode.module.css';

/**
 * Long code a learner can open when they want it, so the lesson reads short by default.
 * <FullCode title="The whole class" note="What to look for">```java … ```</FullCode>
 */
export function FullCode({ title = 'Show the full code', note, children }) {
  return (
    <details className={styles.box}>
      <summary className={styles.summary}>
        <ChevronRight size={15} className={styles.chevron} aria-hidden="true" />
        <span>{title}</span>
        {note && <span className={styles.note}>{note}</span>}
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
