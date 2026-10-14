import styles from './QA.module.css';

/**
 * Collapsible interview question. The answer stays hidden so the reader
 * can attempt it first.
 *   <QA q="Why not just use a bigger machine?">answer in markdown</QA>
 */
export function QA({ q, children }) {
  return (
    <details className={styles.qa}>
      <summary className={styles.q}>{q}</summary>
      <div className={styles.a}>{children}</div>
    </details>
  );
}
