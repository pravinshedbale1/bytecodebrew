import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { LogIn, LogOut, Highlighter } from 'lucide-react';
import { useAuth, signIn, signOutUser } from '../../hooks/useAuth';
import styles from './AccountButton.module.css';

/** Top-bar account control: "Sign in with Google", or the user's avatar with a small menu. */
export function AccountButton() {
  const { status, user, error } = useAuth();
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
      <button type="button" className={styles.avatar} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
        {user.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" /> : initials}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.who}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <p className={styles.sync}>Progress, solved problems, stories and highlights sync to this account.</p>
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
