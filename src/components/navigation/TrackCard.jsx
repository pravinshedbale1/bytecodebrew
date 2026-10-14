import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';
import styles from './Cards.module.css';

export function TrackCard({ track, active, meta }) {
  const body = (
    <>
      <div className={styles.head}>
        <span className={styles.iconWrap}>
          <Icon name={track.icon} />
        </span>
        {!active && <Badge>Coming soon</Badge>}
      </div>
      <h3 className={styles.title}>{track.title}</h3>
      <p className={styles.desc}>{track.description}</p>
      {active && (
        <div className={styles.footer}>
          <span className={styles.meta}>{meta}</span>
          <ArrowRight size={16} className={styles.arrow} aria-hidden="true" />
        </div>
      )}
    </>
  );

  if (!active) return <div className={`${styles.card} ${styles.disabled}`}>{body}</div>;
  return (
    <Link to={`/${track.id}`} className={styles.card}>
      {body}
    </Link>
  );
}
