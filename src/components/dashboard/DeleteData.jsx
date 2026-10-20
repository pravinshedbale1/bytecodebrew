import { useEffect, useRef, useState } from 'react';
import { Trash2, Download, X, Loader2, Check, Shield } from 'lucide-react';
import { deleteAllData, exportData, ERASED, KEPT } from '../../lib/accountData';
import { useApiKey } from '../../lib/claude';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

/**
 * "Delete my data": says exactly what is erased (and where) and what is kept, asks for DELETE, and
 * reports a failure without touching anything. On success the page reloads at the home page.
 */
export function DeleteDataButton({ signedIn }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [removeKey, setRemoveKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const hasKey = Boolean(useApiKey());

  useEffect(() => {
    const d = ref.current;
    if (open && d && !d.open) d.showModal();
    if (!open && d?.open) d.close();
  }, [open]);

  const close = () => { if (busy) return; setOpen(false); setTyped(''); setError(null); setRemoveKey(false); };

  const confirm = async (e) => {
    e.preventDefault();
    if (typed.trim() !== 'DELETE' || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAllData({ removeApiKey: removeKey });
      window.location.assign('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Nothing in this browser was removed.');
      setBusy(false);
    }
  };

  const kept = signedIn ? KEPT : KEPT.slice(2);
  return (
    <>
      <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small} ${ui.danger}`} onClick={() => setOpen(true)}>
        <Trash2 size={13} /> Delete
      </button>
      <dialog ref={ref} className={styles.deleteDialog} onClose={close} onCancel={(e) => { if (busy) e.preventDefault(); }} aria-labelledby="delete-title">
        {open && (
          <form onSubmit={confirm}>
            <div className={styles.deleteHead}>
              <h2 id="delete-title">Delete my data</h2>
              <button type="button" className={styles.deleteClose} onClick={close} aria-label="Close" disabled={busy}><X size={18} /></button>
            </div>

            <p className={styles.deleteWhere}>
              <Trash2 size={15} aria-hidden="true" />
              <span>
                <strong>Erased</strong> {signedIn
                  ? 'from this browser, your account, and every other device or tab where you’re signed in:'
                  : 'from this browser (you’re not signed in, so no account is touched):'}
              </span>
            </p>
            <ul className={styles.deleteList}>
              {ERASED.map((t) => <li key={t}>{t}</li>)}
            </ul>

            <p className={styles.deleteWhere}>
              <Shield size={15} aria-hidden="true" />
              <span><strong>Kept</strong>{signedIn ? '' : ' in this browser'}:</span>
            </p>
            <ul className={`${styles.deleteList} ${styles.keptList}`}>
              {kept.map((t) => <li key={t}><Check size={13} aria-hidden="true" /> {t}</li>)}
              {hasKey && !removeKey && <li><Check size={13} aria-hidden="true" /> Your Claude API key{signedIn ? ' (a setting in your account)' : ' in this browser'}</li>}
            </ul>
            {hasKey && (
              <label className={styles.deleteCheck}>
                <input type="checkbox" checked={removeKey} onChange={(e) => setRemoveKey(e.target.checked)} disabled={busy} />
                Also remove my Claude API key{signedIn ? ' from my account' : ' from this browser'}
              </label>
            )}

            <p className={styles.deleteNote}>
              This can’t be undone. Want a copy first?{' '}
              <button type="button" className={styles.linkBtn} onClick={exportData} disabled={busy}><Download size={13} /> Download my data</button>
            </p>

            <label className={styles.deleteType}>
              <span>Type <code>DELETE</code> to confirm</span>
              <input className={ui.input} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} disabled={busy} autoFocus />
            </label>
            {error && <p className={ui.error} role="alert">{error}</p>}

            <div className={styles.deleteActions}>
              <button type="button" className={ui.btn} onClick={close} disabled={busy}>Cancel</button>
              <button type="submit" className={`${ui.btn} ${ui.danger} ${styles.deleteGo}`} disabled={typed.trim() !== 'DELETE' || busy}>
                {busy ? <><Loader2 size={14} className={styles.spin} /> Deleting…</> : <><Trash2 size={14} /> Delete everything</>}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
