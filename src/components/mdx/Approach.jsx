import { CircleX, CircleCheck, Sparkles } from 'lucide-react';
import styles from './Approach.module.css';

const verdicts = {
  bad: { icon: CircleX, label: 'Weak' },
  good: { icon: CircleCheck, label: 'Works' },
  great: { icon: Sparkles, label: 'Strong' },
};

/**
 * One option for a design decision, rated, so learners see why the final choice wins.
 *   <Approach verdict="bad" title="Check, then take the spot">…markdown…</Approach>
 * Verdicts: bad | good | great
 */
export function Approach({ verdict = 'good', title, children }) {
  const v = verdicts[verdict] ?? verdicts.good;
  const Icon = v.icon;
  return (
    <section className={`${styles.box} ${styles[verdict] ?? ''}`}>
      <p className={styles.head}>
        <span className={styles.tag}>
          <Icon size={14} aria-hidden="true" />
          {v.label}
        </span>
        {title && <span className={styles.title}>{title}</span>}
      </p>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
