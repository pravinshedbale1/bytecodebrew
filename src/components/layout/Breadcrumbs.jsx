import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import styles from './Breadcrumbs.module.css';

/** items: [{ label, to? }] — the last item is the current page. */
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={styles.item}>
              {item.to && !last ? (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={styles.current}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight size={14} className={styles.sep} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
