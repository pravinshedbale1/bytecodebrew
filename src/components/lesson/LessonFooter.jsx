import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Check, Circle } from 'lucide-react';
import styles from './LessonFooter.module.css';

export function LessonFooter({ complete, onToggleComplete, prev, next, coursePath }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.completeRow}>
        <button
          type="button"
          onClick={onToggleComplete}
          className={`${styles.completeBtn} ${complete ? styles.completed : ''}`}
          aria-pressed={complete}
        >
          {complete ? <Check size={16} strokeWidth={2.5} /> : <Circle size={16} />}
          {complete ? 'Completed' : 'Mark as complete'}
        </button>
        <p className={styles.hint}>
          {complete
            ? 'Nice. This lesson is ticked off in your roadmap.'
            : 'Mark it once you can answer the interview questions above without peeking.'}
        </p>
      </div>

      <nav className={styles.pager} aria-label="Lesson navigation">
        {prev ? (
          <Link to={prev.path} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>
              <ArrowLeft size={14} aria-hidden="true" /> Previous
            </span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.path} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerLabel}>
              Next <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : (
          <Link to={coursePath} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerLabel}>
              Done <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className={styles.pagerTitle}>Back to roadmap</span>
          </Link>
        )}
      </nav>
    </footer>
  );
}
