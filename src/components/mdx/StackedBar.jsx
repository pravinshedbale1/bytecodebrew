import styles from './StackedBar.module.css';

/**
 * A labelled horizontal bar split into proportional segments.
 *   <StackedBar title="…" segments={[{ label: 'Situation', value: 10, note: '1–2 sentences' }, …]} />
 * Values are relative weights; tone cycles through the theme's palette unless `tone` is given
 * ('accent' | 'note' | 'warn' | 'interview' | 'success' | 'muted').
 */
const TONES = ['note', 'warn', 'accent', 'success', 'interview', 'muted'];

export function StackedBar({ title, segments, unit = '%' }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <figure className={styles.figure}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}
      <div className={styles.bar} role="img" aria-label={segments.map((s) => `${s.label} ${s.value}${unit}`).join(', ')}>
        {segments.map((s, i) => (
          <span key={s.label} className={`${styles.seg} ${styles[s.tone ?? TONES[i % TONES.length]]}`} style={{ flexGrow: s.value }}>
            <span className={styles.segLabel}>{s.label}</span>
            <span className={styles.segValue}>{s.value}{unit}</span>
          </span>
        ))}
      </div>
      <ul className={styles.legend}>
        {segments.filter((s) => s.note).map((s) => (
          <li key={s.label}>
            <span className={`${styles.dot} ${styles[s.tone ?? TONES[segments.indexOf(s) % TONES.length]]}`} aria-hidden="true" />
            <strong>{s.label}</strong> ({Math.round((100 * s.value) / total)}%): {s.note}
          </li>
        ))}
      </ul>
    </figure>
  );
}
