import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import styles from './Cards.module.css';

export function CourseCard({ to, course, stats, completed }) {
  const active = stats.available > 0;
  const body = (
    <>
      <div className={styles.head}>
        <span className={styles.short}>{course.shortTitle}</span>
        {!active && <Badge>Coming soon</Badge>}
      </div>
      <h3 className={styles.title}>{course.title}</h3>
      <p className={styles.desc}>{course.description}</p>
      {active && (
        <>
          <div className={styles.progress}>
            <ProgressBar value={completed} max={stats.available} label={`${course.title} progress`} />
          </div>
          <div className={styles.footer}>
            <span className={styles.meta}>
              {stats.available} lessons · ~{Math.round(stats.minutes / 60)} hrs
            </span>
            <ArrowRight size={16} className={styles.arrow} aria-hidden="true" />
          </div>
        </>
      )}
    </>
  );

  if (!active) return <div className={`${styles.card} ${styles.disabled}`}>{body}</div>;
  return (
    <Link to={to} className={styles.card}>
      {body}
    </Link>
  );
}
