import { CheckCircle2 } from 'lucide-react';
import styles from './Takeaways.module.css';

/** Summary box. Write a normal markdown list inside it. */
export function Takeaways({ title = 'Key takeaways', children }) {
  return (
    <section className={styles.box}>
      <p className={styles.title}>
        <CheckCircle2 size={16} aria-hidden="true" />
        {title}
      </p>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
