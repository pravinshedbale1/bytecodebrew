import { SlidersHorizontal } from 'lucide-react';
import styles from './Sim.module.css';

/** The frame every simulator shares: a title bar, a short "what to try" line, the body and optional stats. */
export function SimFrame({ title, hint, children, footer }) {
  return (
    <section className={styles.frame} aria-label={title}>
      <header className={styles.head}>
        <span className={styles.title}><SlidersHorizontal size={14} aria-hidden="true" /> {title}</span>
        <span className={styles.badge}>Interactive</span>
      </header>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}

/** A labelled group of option buttons (radio behaviour). */
export function Choice({ label, value, options, onChange }) {
  return (
    <div className={styles.choice} role="radiogroup" aria-label={label}>
      <span className={styles.choiceLabel}>{label}</span>
      {options.map((o) => {
        const [v, text] = Array.isArray(o) ? o : [o, String(o)];
        return (
          <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={styles.opt} onClick={() => onChange(v)}>
            {text}
          </button>
        );
      })}
    </div>
  );
}

export function Stat({ label, value, tone }) {
  return (
    <div className={`${styles.stat} ${tone ? styles[tone] : ''}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
