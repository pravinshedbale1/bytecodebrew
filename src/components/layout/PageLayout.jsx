import styles from './PageLayout.module.css';

/**
 * Main column + optional right rail that together fill the space beside the
 * sidebar. `contentWidth` caps line length for long-form reading only.
 */
export function PageLayout({ children, rail, contentWidth }) {
  return (
    <div className={`${styles.layout} ${rail ? styles.withRail : ''}`}>
      <div className={styles.main}>
        <div className={styles.inner} style={contentWidth ? { maxWidth: contentWidth } : undefined}>
          {children}
        </div>
      </div>
      {rail && (
        <aside className={styles.rail}>
          <div className={styles.railInner}>{rail}</div>
        </aside>
      )}
    </div>
  );
}

/** A titled card for the right rail. */
export function RailCard({ title, icon, children, action }) {
  return (
    <section className={styles.card}>
      {title && (
        <header className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
