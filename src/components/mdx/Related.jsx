import { Link, useParams } from 'react-router';
import { Layers } from 'lucide-react';
import { getCourseLessons } from '../../curriculum';
import styles from './Related.module.css';

/**
 * Links to other lessons in the same course by id.
 *   <Related ids={['caching', 'sharding']} />
 */
export function Related({ ids, title = 'Concepts used in this design' }) {
  const { trackId, courseId } = useParams();
  const lessons = getCourseLessons(trackId, courseId);
  const items = ids.map((id) => lessons.find((l) => l.id === id)).filter(Boolean);
  if (!items.length) return null;

  return (
    <aside className={styles.box}>
      <p className={styles.title}>
        <Layers size={15} aria-hidden="true" />
        {title}
      </p>
      <ul className={styles.list}>
        {items.map((l) => (
          <li key={l.id}>
            <Link to={l.path} className={styles.link}>
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
