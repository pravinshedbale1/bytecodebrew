import { NavLink } from 'react-router';
import { Check } from 'lucide-react';
import styles from './CourseOutline.module.css';

/** Numbered module → lesson list for one course. Modules with nothing published are collapsed to a single line. */
export function CourseOutline({ course, lessons, isComplete }) {
  return (
    <nav aria-label={`${course.title} lessons`}>
      {course.modules.map((module, i) => {
        const items = lessons.filter((l) => l.moduleId === module.id);
        const ready = items.filter((l) => l.available);
        const no = String(i + 1).padStart(2, '0');

        if (ready.length === 0) {
          return (
            <p key={module.id} className={`${styles.groupTitle} ${styles.plannedGroup}`}>
              <span className={styles.groupNo}>{no}</span>
              <span className={styles.groupLabel}>{module.title}</span>
              <span className={styles.soon}>Soon</span>
            </p>
          );
        }

        const done = ready.filter((l) => isComplete(l.key)).length;
        return (
          <div key={module.id} className={styles.group}>
            <p className={styles.groupTitle}>
              <span className={styles.groupNo}>{no}</span>
              <span className={styles.groupLabel}>{module.title}</span>
              <span className={styles.count}>
                {done}/{ready.length}
              </span>
            </p>
            <ul className={styles.list}>
              {items.map((lesson) =>
                lesson.available ? (
                  <li key={lesson.id}>
                    <NavLink
                      to={lesson.path}
                      className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
                    >
                      <span
                        className={`${styles.dot} ${isComplete(lesson.key) ? styles.dotDone : ''}`}
                        aria-hidden="true"
                      >
                        {isComplete(lesson.key) && <Check size={10} strokeWidth={3.5} />}
                      </span>
                      {lesson.title}
                    </NavLink>
                  </li>
                ) : (
                  <li key={lesson.id} className={`${styles.item} ${styles.planned}`}>
                    <span className={`${styles.dot} ${styles.dotPlanned}`} aria-hidden="true" />
                    {lesson.title}
                  </li>
                ),
              )}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
