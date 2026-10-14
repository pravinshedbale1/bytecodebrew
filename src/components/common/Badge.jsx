import styles from './Badge.module.css';

/** Small label. `tone`: neutral | accent | success | beginner | intermediate | advanced */
export function Badge({ tone = 'neutral', children }) {
  return <span className={`${styles.badge} ${styles[tone] ?? ''}`}>{children}</span>;
}

export function LevelBadge({ level }) {
  if (!level) return null;
  return <Badge tone={level.toLowerCase()}>{level}</Badge>;
}
