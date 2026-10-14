import { useMemo } from 'react';
import { useActiveHeading } from '../../hooks/useActiveHeading';
import styles from './TableOfContents.module.css';

/** "On this page" outline with scroll-spy. headings: [{ id, text, level }] */
export function TableOfContents({ headings }) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page">
      <ul className={styles.list}>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`${styles.link} ${h.level === 3 ? styles.nested : ''} ${
                active === h.id ? styles.active : ''
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
