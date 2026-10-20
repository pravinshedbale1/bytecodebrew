import { useEffect, useState } from 'react';
import { Eye, LogOut } from 'lucide-react';
import { viewAs, exitViewAs } from '../../lib/viewAs';
import styles from './ViewAsBanner.module.css';

/** On every page of an admin "view as" tab: whose view this is, that it is read-only, and the way out. */
export function ViewAsBanner() {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    let t;
    let lastInput = 0;
    const input = () => { lastInput = Date.now(); };
    // pages also save quietly on their own (today's coach session, last lesson visited); only a change
    // the admin just tried to make is worth a flash
    const on = () => {
      if (Date.now() - lastInput > 2000) return;
      setBlocked(true);
      clearTimeout(t);
      t = setTimeout(() => setBlocked(false), 2600);
    };
    window.addEventListener('pointerdown', input, true);
    window.addEventListener('keydown', input, true);
    window.addEventListener('bcb:readonly', on);
    return () => {
      window.removeEventListener('pointerdown', input, true);
      window.removeEventListener('keydown', input, true);
      window.removeEventListener('bcb:readonly', on);
      clearTimeout(t);
    };
  }, []);
  if (!viewAs) return null;
  return (
    <div className={styles.banner} role="status">
      <Eye size={16} aria-hidden="true" />
      <span className={styles.text}>
        Viewing as <strong>{viewAs.name || viewAs.email || 'a learner'}</strong>{viewAs.name && viewAs.email ? <span className={styles.email}> · {viewAs.email}</span> : null}
        <span className={styles.ro}>Read-only</span>
        {blocked && <span className={styles.flash}>Nothing was saved: this view can’t change their data</span>}
      </span>
      <button type="button" className={styles.exit} onClick={() => exitViewAs('/admin')}><LogOut size={14} aria-hidden="true" /> Exit view</button>
    </div>
  );
}
