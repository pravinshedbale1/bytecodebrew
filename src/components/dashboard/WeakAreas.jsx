import { Link } from 'react-router';
import { getLessonContext } from '../../curriculum';
import { useQuizResults, usePracticeLog, useReviewState } from '../../hooks/useLearning';
import { weakAreas } from '../../lib/studyPlan';
import styles from './Dashboard.module.css';

/** Lessons to revisit, ranked from quiz misses, forgotten cards and practice self-ratings. */
export function WeakAreas({ quizzes, limit = 6 }) {
  const quizResults = useQuizResults();
  const reviews = useReviewState();
  const practiceLog = usePracticeLog();
  const list = weakAreas({ quizResults, reviews, practiceLog, quizzes })
    .map((w) => {
      const [t, c, l] = w.lessonKey.split('/');
      const ctx = getLessonContext(t, c, l);
      return ctx ? { ...w, lesson: ctx.lesson } : null;
    })
    .filter(Boolean)
    .slice(0, limit);

  if (!list.length) {
    return (
      <p className={styles.empty}>
        Nothing flagged yet. Answer the quick checks at the end of lessons and rate your practice attempts, and the
        topics that need another pass will show up here.
      </p>
    );
  }

  return (
    <ul className={styles.weak}>
      {list.map((w) => (
        <li key={w.lessonKey}>
          <Link to={w.lesson.path} className={styles.weakTitle}>{w.lesson.title}</Link>
          <span className={styles.weakWhy}>{w.reasons.join(' · ')}</span>
        </li>
      ))}
    </ul>
  );
}
