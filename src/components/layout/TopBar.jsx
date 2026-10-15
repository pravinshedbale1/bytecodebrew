import { useLocation } from 'react-router';
import { Menu, Moon, Sun } from 'lucide-react';
import { getTrack, getCourse, getLessonContext } from '../../curriculum';
import { parsePath } from '../../lib/route';
import { useTheme } from '../../hooks/useTheme';
import { Breadcrumbs } from './Breadcrumbs';
import { AccountButton } from './AccountButton';
import styles from './TopBar.module.css';

function crumbsFor(pathname) {
  const { trackId, courseId, lessonId } = parsePath(pathname);
  const items = [{ label: 'Home', to: '/' }];
  if (pathname === '/highlights') return [...items, { label: 'My highlights' }];
  const track = trackId && getTrack(trackId);
  if (!track) return items;
  items.push({ label: track.title, to: `/${track.id}` });
  const course = courseId && getCourse(trackId, courseId);
  if (!course) return items;
  items.push({ label: course.shortTitle ?? course.title, to: `/${trackId}/${courseId}` });
  const ctx = lessonId && getLessonContext(trackId, courseId, lessonId);
  if (ctx) {
    items.push({ label: ctx.lesson.moduleTitle });
    items.push({ label: ctx.lesson.title });
  }
  return items;
}

export function TopBar({ onOpenNav }) {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className={styles.bar}>
      <button type="button" className={styles.menu} onClick={onOpenNav} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className={styles.crumbs}>
        <Breadcrumbs items={crumbsFor(pathname)} />
      </div>

      <button
        type="button"
        className={styles.iconButton}
        onClick={toggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <AccountButton />
    </header>
  );
}
