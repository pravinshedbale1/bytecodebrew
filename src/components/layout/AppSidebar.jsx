import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Home, ChevronDown, ArrowLeft, X, LayoutDashboard, PlaneTakeoff, Building2, Layers, Timer, Code2, ListChecks, Lock, Sparkles } from 'lucide-react';
import { usePremium } from '../../hooks/useAccess';
import { tracks, trackIsActive, getCourse, getCourseLessons, courseStats } from '../../curriculum';
import { parsePath } from '../../lib/route';
import { useProgress } from '../../hooks/useProgress';
import { Icon } from '../common/Icon';
import { ProgressBar } from '../common/ProgressBar';
import { CourseOutline } from '../navigation/CourseOutline';
import styles from './AppSidebar.module.css';

/**
 * Full-height left navigation.
 * Outside a course it shows the global track tree; inside a course it
 * switches to that course's outline so the learner always sees what's next.
 */
export function AppSidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const { trackId, courseId } = parsePath(pathname);
  const course = trackId && courseId ? getCourse(trackId, courseId) : null;
  const inCourse = Boolean(course && courseStats(trackId, courseId).available > 0);

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Main navigation" data-print="hide">
      <div className={styles.brandRow}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            {'</>'}
          </span>
          <span>
            ByteCode<span className={styles.brandAccent}>Brew</span>
          </span>
        </Link>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <div className={styles.scroll}>
        {inCourse ? (
          <CourseNav trackId={trackId} courseId={courseId} course={course} />
        ) : (
          <GlobalNav activeTrackId={trackId} />
        )}
      </div>
    </aside>
  );
}

function GlobalNav({ activeTrackId }) {
  const premium = usePremium();
  const lock = premium ? null : <Lock size={13} className={styles.lock} aria-label="Premium" />;
  const [expanded, setExpanded] = useState(() => new Set([activeTrackId ?? 'system-design']));
  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.top} ${isActive ? styles.active : ''}`}>
        <Home size={18} strokeWidth={1.75} aria-hidden="true" />
        Home
      </NavLink>

      <NavLink to="/dashboard" className={({ isActive }) => `${styles.top} ${isActive ? styles.active : ''}`}>
        <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
        Dashboard
        {lock}
      </NavLink>

      <NavLink to="/runway" className={({ isActive }) => `${styles.top} ${isActive ? styles.active : ''}`}>
        <PlaneTakeoff size={18} strokeWidth={1.75} aria-hidden="true" />
        Runway
        {premium ? <span className={styles.newBadge}>New</span> : lock}
      </NavLink>

      <NavLink to="/companies" className={({ isActive }) => `${styles.top} ${isActive ? styles.active : ''}`}>
        <Building2 size={18} strokeWidth={1.75} aria-hidden="true" />
        Companies
        <span className={styles.newBadge}>New</span>
      </NavLink>

      <p className={styles.section}>Learn</p>

      {tracks.map((track) => {
        const active = trackIsActive(track);
        const isOpen = expanded.has(track.id);
        return (
          <div key={track.id} className={styles.trackGroup}>
            <div className={styles.trackRow}>
              <NavLink
                to={`/${track.id}`}
                end
                className={({ isActive }) =>
                  `${styles.top} ${isActive ? styles.active : ''} ${!active ? styles.dim : ''}`
                }
              >
                <Icon name={track.icon} size={18} />
                <span className={styles.label}>{track.title}</span>
                {!active && <span className={styles.soon}>Soon</span>}
              </NavLink>
              {track.courses.length > 0 && (
                <button
                  type="button"
                  className={styles.chevron}
                  onClick={() => toggle(track.id)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${track.title}`}
                >
                  <ChevronDown size={16} className={isOpen ? styles.rotated : ''} />
                </button>
              )}
            </div>

            {isOpen && track.courses.length > 0 && (
              <ul className={styles.children}>
                {track.courses.map((c) => {
                  const ready = courseStats(track.id, c.id).available > 0;
                  return (
                    <li key={c.id}>
                      <NavLink
                        to={`/${track.id}/${c.id}`}
                        className={({ isActive }) =>
                          `${styles.child} ${isActive ? styles.active : ''} ${!ready ? styles.dim : ''}`
                        }
                      >
                        <span className={styles.label}>{c.title}</span>
                        {!ready && <span className={styles.soon}>Soon</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      <p className={styles.section}>Practise</p>
      {PRACTICE_LINKS.map(({ to, label, icon: I }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `${styles.top} ${isActive ? styles.active : ''}`}>
          <I size={18} strokeWidth={1.75} aria-hidden="true" />
          {label}
          {lock}
        </NavLink>
      ))}
      {!premium && (
        <NavLink to="/premium" className={({ isActive }) => `${styles.top} ${styles.getPremium} ${isActive ? styles.active : ''}`}>
          <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
          Get Premium
        </NavLink>
      )}
    </nav>
  );
}

const PRACTICE_LINKS = [
  { to: '/problems', label: 'Problems', icon: ListChecks },
  { to: '/review', label: 'Review', icon: Layers },
  { to: '/mock', label: 'Mock interview', icon: Timer },
  { to: '/playground', label: 'Code playground', icon: Code2 },
];

function CourseNav({ trackId, courseId, course }) {
  const { isComplete } = useProgress();
  const lessons = getCourseLessons(trackId, courseId);
  const ready = lessons.filter((l) => l.available);
  const done = ready.filter((l) => isComplete(l.key)).length;

  return (
    <div className={styles.courseNav}>
      <Link to={`/${trackId}`} className={styles.back}>
        <ArrowLeft size={15} aria-hidden="true" />
        All {tracks.find((t) => t.id === trackId)?.title} courses
      </Link>

      <NavLink
        to={`/${trackId}/${courseId}`}
        end
        className={({ isActive }) => `${styles.courseHead} ${isActive ? styles.courseHeadActive : ''}`}
      >
        <span className={styles.courseShort}>{course.shortTitle}</span>
        <span className={styles.courseTitle}>{course.title}</span>
      </NavLink>
      <div className={styles.courseProgress}>
        <ProgressBar value={done} max={ready.length} label={`${course.title} progress`} />
      </div>

      <CourseOutline course={course} lessons={lessons} isComplete={isComplete} />
    </div>
  );
}
