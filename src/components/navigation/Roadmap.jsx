import { Link } from 'react-router';
import { Check, Clock } from 'lucide-react';
import { LevelBadge, Badge } from '../common/Badge';
import { Lock } from 'lucide-react';
import { useLessonLocked } from '../../hooks/useAccess';
import styles from './Roadmap.module.css';

/**
 * Ordered course outline. Modules are numbered so the reading sequence is obvious.
 * `lessons` comes from getCourseLessons() and is grouped back into modules here.
 */
export function Roadmap({ course, lessons, isComplete, nextKey }) {
  const locked = useLessonLocked();
  return (
    <ol className={styles.modules}>
      {course.modules.map((module, mi) => {
        const items = lessons.filter((l) => l.moduleId === module.id);
        const ready = items.filter((l) => l.available);
        const done = ready.filter((l) => isComplete(l.key)).length;
        const planned = ready.length === 0;

        return (
          <li key={module.id} className={`${styles.module} ${planned ? styles.plannedModule : ''}`}>
            <div className={styles.moduleHead}>
              <span className={styles.moduleNo}>{String(mi + 1).padStart(2, '0')}</span>
              <div className={styles.moduleText}>
                <div className={styles.moduleTitleRow}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  {planned ? (
                    <Badge>Planned</Badge>
                  ) : (
                    <span className={styles.moduleCount}>
                      {done}/{ready.length}
                    </span>
                  )}
                </div>
                <p className={styles.moduleDesc}>{module.description}</p>
              </div>
            </div>

            <ol className={styles.lessons}>
              {items.map((lesson) => {
                const complete = isComplete(lesson.key);
                const isNext = lesson.key === nextKey;
                const content = (
                  <>
                    <span
                      className={`${styles.status} ${complete ? styles.statusDone : ''} ${
                        !lesson.available ? styles.statusPlanned : ''
                      }`}
                      aria-hidden="true"
                    >
                      {complete && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className={styles.lessonText}>
                      <span className={styles.lessonTitle}>
                        {lesson.title}
                        {isNext && <span className={styles.nextTag}>Up next</span>}
                      </span>
                      <span className={styles.lessonSummary}>{lesson.summary}</span>
                    </span>
                    <span className={styles.lessonMeta}>
                      {lesson.available ? (
                        <>
                          <LevelBadge level={lesson.level} />
                          {locked(lesson) && <span className={styles.premiumTag}><Lock size={11} aria-hidden="true" /> Premium</span>}
                          <span className={styles.minutes}>
                            <Clock size={13} aria-hidden="true" /> {lesson.minutes}m
                          </span>
                        </>
                      ) : (
                        <span className={styles.plannedText}>Planned</span>
                      )}
                    </span>
                  </>
                );

                return (
                  <li key={lesson.id}>
                    {lesson.available ? (
                      <Link
                        to={lesson.path}
                        className={`${styles.lesson} ${isNext ? styles.lessonNext : ''}`}
                      >
                        {content}
                        <span className="visually-hidden">{complete ? '(completed)' : ''}</span>
                      </Link>
                    ) : (
                      <div className={`${styles.lesson} ${styles.lessonPlanned}`}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}
