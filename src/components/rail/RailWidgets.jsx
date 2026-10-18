import { Link } from 'react-router';
import { ArrowRight, BarChart3, ListOrdered, Compass } from 'lucide-react';
import { RailCard } from '../layout/PageLayout';
import { ProgressBar } from '../common/ProgressBar';
import styles from './RailWidgets.module.css';

export function ProgressCard({ title = 'Your progress', completed, total, caption }) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return (
    <RailCard title={title} icon={<BarChart3 size={14} aria-hidden="true" />}>
      <p className={styles.big}>
        {pct}
        <span className={styles.unit}>%</span>
      </p>
      <ProgressBar value={completed} max={total} label={title} />
      {caption && <p className={styles.caption}>{caption}</p>}
    </RailCard>
  );
}

/** A whole track's progress: the overall percentage, then one row per course. */
export function TrackProgressCard({ courses }) {
  const done = courses.reduce((s, c) => s + c.completed, 0);
  const total = courses.reduce((s, c) => s + c.total, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <RailCard title="Track progress" icon={<BarChart3 size={14} aria-hidden="true" />}>
      <p className={styles.big}>
        {pct}
        <span className={styles.unit}>%</span>
      </p>
      <ProgressBar value={done} max={total} label="Track progress" />
      <ul className={styles.courses}>
        {courses.map((c) => (
          <li key={c.id}>
            <Link to={c.path} className={styles.courseRow}>
              <span className={styles.courseName}>{c.title}</span>
              <span className={styles.moduleCount}>{c.completed}/{c.total}</span>
            </Link>
            <span className={styles.miniTrack}>
              <span className={styles.miniFill} style={{ width: `${c.total ? (c.completed / c.total) * 100 : 0}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

/** Compact "what to read next" link for the rail. */
export function UpNextCard({ lesson, label = 'Up next' }) {
  if (!lesson) return null;
  return (
    <RailCard title={label} icon={<Compass size={14} aria-hidden="true" />}>
      <Link to={lesson.path} className={styles.next}>
        <span className={styles.nextModule}>{lesson.moduleTitle}</span>
        <span className={styles.nextTitle}>{lesson.title}</span>
        <span className={styles.nextMeta}>
          {lesson.minutes} min read <ArrowRight size={14} aria-hidden="true" />
        </span>
      </Link>
    </RailCard>
  );
}

/** Per-module completion bars. */
export function ModuleProgressCard({ course, lessons, isComplete }) {
  return (
    <RailCard title="Modules" icon={<ListOrdered size={14} aria-hidden="true" />}>
      <ol className={styles.modules}>
        {course.modules.map((m, i) => {
          const ready = lessons.filter((l) => l.moduleId === m.id && l.available);
          const done = ready.filter((l) => isComplete(l.key)).length;
          const pct = ready.length ? (done / ready.length) * 100 : 0;
          return (
            <li key={m.id} className={`${styles.module} ${!ready.length ? styles.planned : ''}`}>
              <span className={styles.moduleNo}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.moduleBody}>
                <span className={styles.moduleRow}>
                  <span className={styles.moduleTitle}>{m.title}</span>
                  <span className={styles.moduleCount}>{ready.length ? `${done}/${ready.length}` : 'Soon'}</span>
                </span>
                {ready.length > 0 && (
                  <span className={styles.miniTrack}>
                    <span className={styles.miniFill} style={{ width: `${pct}%` }} />
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </RailCard>
  );
}

/** Plain list of short tips/notes. */
export function NoteCard({ title, icon, items }) {
  return (
    <RailCard title={title} icon={icon}>
      <ul className={styles.notes}>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </RailCard>
  );
}
