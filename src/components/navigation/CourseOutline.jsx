import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Check, Lock } from 'lucide-react';
import { useLessonLocked } from '../../hooks/useAccess';
import styles from './CourseOutline.module.css';

/** Numbered module → lesson list for one course. Modules with nothing published are collapsed to a single line. */
export function CourseOutline({ course, lessons, isComplete }) {
  const locked = useLessonLocked();
  const ref = useRef(null);
  const { pathname } = useLocation();

  // Keep the current lesson in view in the scrolling sidebar (lesson 19 of 56 shouldn't be off-screen).
  useEffect(() => {
    const current = ref.current?.querySelector('[aria-current="page"]');
    if (!current) return;
    let box = current.parentElement;
    while (box && !(box.scrollHeight > box.clientHeight && /(auto|scroll)/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
    if (!box) return;
    const top = current.getBoundingClientRect().top - box.getBoundingClientRect().top;
    if (top < 80 || top > box.clientHeight - 80) box.scrollTop += top - box.clientHeight / 3;
  }, [pathname]);

  return (
    <nav aria-label={`${course.title} lessons`} ref={ref}>
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
                      {locked(lesson) && <Lock size={11} className={styles.lock} aria-label="Premium" />}
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
