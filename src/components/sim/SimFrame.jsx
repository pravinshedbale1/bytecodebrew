import { SIM_HINT, STEP_HINT, StepDock, stepKeys, VizHead } from '../mdx/VizFrame';
import styles from './Sim.module.css';

/**
 * The frame every simulator shares: the shared title bar (VizFrame), a short "what to try" line, the
 * body and optional stats. A simulator that steps through a sequence passes its stepper (`s`, `count`):
 * it then gets the same docked controls and arrow keys as every other step-through.
 */
export function SimFrame({ title, hint, children, footer, s, count }) {
  return (
    <section
      className={styles.frame}
      aria-label={s ? `${title}. Use the left and right arrow keys to step.` : title}
      tabIndex={s ? 0 : undefined}
      onKeyDown={s ? stepKeys(s) : undefined}
    >
      <VizHead as="header" title={title} hint={s ? STEP_HINT : SIM_HINT} />
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
      {s && <StepDock s={s} count={count} />}
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
