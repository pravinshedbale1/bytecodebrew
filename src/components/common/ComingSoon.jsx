import { Link } from 'react-router';
import { Clock } from 'lucide-react';
import styles from './ComingSoon.module.css';

/** Placeholder used for tracks, courses and lessons that are not written yet. */
export function ComingSoon({ title = 'Coming soon', children, backTo, backLabel }) {
  return (
    <div className={styles.box}>
      <Clock size={22} strokeWidth={1.75} className={styles.icon} aria-hidden="true" />
      <h2 className={styles.title}>{title}</h2>
      {children && <div className={styles.body}>{children}</div>}
      {backTo && (
        <Link to={backTo} className={styles.link}>
          {backLabel ?? 'Go back'}
        </Link>
      )}
    </div>
  );
}
