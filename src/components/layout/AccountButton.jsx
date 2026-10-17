import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { LogIn, LogOut, Highlighter, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';
import { useAccess } from '../../hooks/useAccess';
import { useAuth, signIn, signOutUser } from '../../hooks/useAuth';
import { useSyncIssues } from '../../lib/syncedStore';
import styles from './AccountButton.module.css';

/** Top-bar account control: "Sign in with Google", or the user's avatar with a small menu. */
export function AccountButton() {
  const { status, user, error } = useAuth();
  const syncIssues = useSyncIssues();
  const access = useAccess();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  if (status === 'disabled') return null;
  if (status === 'loading') return <span className={styles.placeholder} aria-hidden="true" />;

  if (status === 'signed-out') {
    return (
      <div className={styles.wrap}>
        <button type="button" className={styles.signIn} onClick={signIn}>
          <LogIn size={16} /> <span className={styles.label}>Sign in</span>
        </button>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    );
  }

  const initials = (user.name || user.email || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={styles.wrap} ref={box}>
      <button type="button" className={styles.avatar} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={syncIssues.length ? 'Account menu (some data is not syncing)' : 'Account menu'}>
        {user.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" /> : initials}
        {syncIssues.length > 0 && <span className={styles.warnDot} aria-hidden="true" />}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.who}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            {access.status === 'premium' && (
              <span className={styles.premium}>
                <Sparkles size={12} /> Premium{access.expiresAt ? ` until ${new Date(access.expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
              </span>
            )}
          </div>
          {syncIssues.length > 0 ? (
            <p className={`${styles.sync} ${styles.syncWarn}`} role="status">
              Some data isn't syncing right now ({syncIssues.join(', ')}). It's saved on this device and will sync when the problem clears.
            </p>
          ) : (
            <p className={styles.sync}>Progress, solved problems, reviews, stories and highlights sync to this account.</p>
          )}
          <Link to="/premium" className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            <Sparkles size={15} /> {access.status === 'premium' ? (access.isAdmin ? 'Premium page' : 'Extend premium') : 'Get Premium'}
          </Link>
          {access.isAdmin && (
            <Link to="/admin" className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
              <ShieldCheck size={15} /> Admin: premium access
            </Link>
          )}
          <Link to="/dashboard" className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            <LayoutDashboard size={15} /> Dashboard &amp; profile
          </Link>
          <Link to="/highlights" className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            <Highlighter size={15} /> My highlights
          </Link>
          <button type="button" className={styles.item} role="menuitem" onClick={() => { setOpen(false); signOutUser(); }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
