import { Link } from 'react-router';
import { ArrowRight, PartyPopper } from 'lucide-react';
import styles from './NextUpCard.module.css';

/**
 * Tells the learner exactly what to read next.
 * `mode`: 'start' (nothing done yet) | 'continue' | 'done'
 */
export function NextUpCard({ lesson, mode, courseTitle }) {
  if (mode === 'done' || !lesson) {
    return (
      <div className={styles.card}>
        <PartyPopper size={20} className={styles.doneIcon} aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>All available lessons complete</p>
          <p className={styles.title}>Revisit the interview questions at the end of each lesson to stay sharp.</p>
        </div>
      </div>
    );
  }

  return (
    <Link to={lesson.path} className={`${styles.card} ${styles.link}`}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>
          {mode === 'start' ? `Start ${courseTitle} here` : 'Up next for you'}
        </p>
        <p className={styles.title}>{lesson.title}</p>
        <p className={styles.module}>
          {lesson.moduleTitle} · {lesson.minutes} min read
        </p>
      </div>
      <span className={styles.cta}>
        {mode === 'start' ? 'Start' : 'Continue'}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
