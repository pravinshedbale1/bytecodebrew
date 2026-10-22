import { useLocation } from 'react-router';
import { Menu, Moon, Sun, Search } from 'lucide-react';
import { getTrack, getCourse, getLessonContext } from '../../curriculum';
import { parsePath } from '../../lib/route';
import { useTheme } from '../../hooks/useTheme';
import { Breadcrumbs } from './Breadcrumbs';
import { AccountButton } from './AccountButton';
import { openSearch } from '../search/SearchDialog';
import styles from './TopBar.module.css';

const PAGE_CRUMBS = {
  highlights: 'My highlights',
  dashboard: 'Dashboard',
  review: 'Review',
  mock: 'Mock interview',
  playground: 'Code playground',
  cheatsheet: 'Cheat sheet',
  solve: 'Solve',
  problems: 'Problems',
  admin: 'Admin',
  runway: 'Runway',
  climb: 'Climb',
  companies: 'Companies',
  premium: 'Premium',
  contact: 'Contact us',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  'refund-policy': 'Refund & Cancellation',
  'delivery-policy': 'Delivery Policy',
};

export function crumbsFor(pathname) {
  const { trackId, courseId, lessonId } = parsePath(pathname);
  const items = [{ label: 'Home', to: '/' }];
  const page = PAGE_CRUMBS[pathname.split('/')[1]];
  if (page) return [...items, { label: page }];
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

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function TopBar({ onOpenNav }) {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className={styles.bar} data-print="hide">
      <button type="button" className={styles.menu} onClick={onOpenNav} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className={styles.crumbs}>
        <Breadcrumbs items={crumbsFor(pathname)} />
      </div>

      <button type="button" className={styles.search} onClick={openSearch} aria-label="Search (Ctrl K)">
        <Search size={16} aria-hidden="true" />
        <span className={styles.searchLabel}>Search</span>
        <kbd className={styles.searchKbd}>{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
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
