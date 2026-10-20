import { useEffect, useState } from 'react';
import { RefreshCw, Save, UserPlus, Eye } from 'lucide-react';
import { viewAsHref } from '../../lib/viewAs';
import { useSales, setSales, DEFAULT_PAUSE_MESSAGE } from '../../lib/sales';
import { listRegisteredUsers } from '../../lib/payments';
import ui from '../../components/common/ui.module.css';
import styles from '../AdminPage.module.css';

const day = (ms) => (ms ? new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const HOUR = 3_600_000;

/** "within the hour", "5 h ago", "yesterday", or a date. Firebase refreshes a session about hourly, so nothing finer. */
function lastActive(ms, now) {
  if (!ms) return '—';
  const ago = now - ms;
  if (ago < HOUR) return 'Within the hour';
  if (ago < 24 * HOUR) return `${Math.floor(ago / HOUR)} h ago`;
  if (ago < 48 * HOUR) return 'Yesterday';
  return day(ms);
}

/** Open or pause new purchases, with the message people see on /premium while paused. */
export function AdminSales({ me }) {
  const sales = useSales();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (!sales.loading) setMessage(sales.message || DEFAULT_PAUSE_MESSAGE); }, [sales.loading, sales.message]);

  const save = async (open) => {
    if (!open && !window.confirm('Pause new subscriptions? Nobody will be able to buy until you open them again. Existing Premium is not affected.')) return;
    setBusy(true);
    setError(null);
    try {
      await setSales({ open, message }, me);
    } catch (err) {
      setError(`Could not save: ${err.code ?? err.message}. Are the Firestore rules published?`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${ui.panel} ${styles.form}`}>
      <div className={styles.listHead}>
        <h2 className={ui.panelTitle}>New subscriptions</h2>
        {!sales.loading && (
          <span className={`${styles.chip} ${sales.open ? styles.chipOn : styles.chipOff}`}>{sales.open ? 'Open' : 'Paused'}</span>
        )}
      </div>
      <p className={styles.muted}>
        {sales.open
          ? 'People can buy Premium on /premium.'
          : 'Nobody can buy Premium right now: /premium shows the message below and the payment service refuses new orders. Existing Premium keeps working, and payments already in progress still complete.'}
        {sales.updatedAt ? ` Last changed ${sales.updatedAt.toLocaleString()}${sales.updatedBy ? ` by ${sales.updatedBy}` : ''}.` : ''}
      </p>
      <label className={styles.salesMessage}>
        <span className={ui.label}>Message shown while paused</span>
        <textarea className={ui.input} rows={2} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <div className={styles.salesActions}>
        {sales.open ? (
          <button type="button" className={`${ui.btn} ${ui.danger}`} disabled={busy || sales.loading} onClick={() => save(false)}>Pause new subscriptions</button>
        ) : (
          <>
            <button type="button" className={`${ui.btn} ${ui.primary}`} disabled={busy} onClick={() => save(true)}>Open subscriptions</button>
            <button type="button" className={`${ui.btn} ${ui.ghost}`} disabled={busy || message.trim() === sales.message} onClick={() => save(false)}><Save size={14} /> Update message</button>
          </>
        )}
      </div>
      {error && <p className={ui.error} role="alert">{error}</p>}
    </section>
  );
}

/** Premium status of an account, from the entitlements list. */
function statusOf(email, entitlements, adminEmail) {
  if (!email) return { label: 'No email', cls: 'chipNeutral' };
  const lower = email.toLowerCase();
  if (lower === adminEmail) return { label: 'Admin', cls: 'chipOn' };
  const e = entitlements?.find((r) => r.email === lower);
  if (!e) return { label: 'Free', cls: 'chipNeutral' };
  const until = e.expiresAt?.toDate?.();
  if (until && until < new Date()) return { label: `Expired ${until.toLocaleDateString()}`, cls: 'chipOff' };
  const paid = ['razorpay', 'cashfree'].includes(e.source);
  return { label: `${paid ? 'Paid' : 'Premium'}${until ? ` until ${until.toLocaleDateString()}` : ''}`, cls: 'chipOn' };
}

/** Everyone who has signed in with Google, whether or not they have Premium. */
export function AdminUsers({ entitlements, adminEmail, onApprove }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [show, setShow] = useState('all');

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      setData({ ...(await listRegisteredUsers()), at: Date.now() });
    } catch (err) {
      setError(`Could not load registered users: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { load(); }, []);

  const now = data?.at ?? Date.now();
  const users = (data?.users ?? []).map((u) => ({ ...u, status: statusOf(u.email, entitlements, adminEmail), recent: Boolean(u.lastActiveAt) && now - u.lastActiveAt < HOUR }));
  const premiumCount = users.filter((u) => u.status.cls === 'chipOn').length;
  const activeCount = users.filter((u) => u.recent).length;
  const q = filter.trim().toLowerCase();
  const matchesShow = (u) => (show === 'all' ? true : show === 'active' ? u.recent : show === 'free' ? u.status.cls !== 'chipOn' : u.status.cls === 'chipOn');
  const shown = users.filter((u) => matchesShow(u)
    && (!q || (u.email ?? '').toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q)));

  return (
    <section className={ui.panel}>
      <div className={styles.listHead}>
        <div>
          <h2 className={ui.panelTitle}>Registered users</h2>
          <p className={styles.muted}>
            {data ? `${users.length} signed up · ${activeCount} active in the last hour · ${premiumCount} with Premium · ${users.length - premiumCount} free${data.truncated ? ' (first 20,000 shown)' : ''}` : busy ? 'Loading…' : ''}
          </p>
        </div>
        <div className={styles.userTools}>
          <select className={ui.input} value={show} onChange={(e) => setShow(e.target.value)} aria-label="Show">
            <option value="all">Everyone</option>
            <option value="active">Active in the last hour</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
          <input className={`${ui.input} ${styles.filter}`} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Name or email…" aria-label="Filter registered users" />
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={load} disabled={busy} title="Reload"><RefreshCw size={13} /> Reload</button>
        </div>
      </div>
      {error && <p className={ui.error} role="alert">{error}</p>}
      {data && shown.length === 0 && <p className={styles.muted}>{users.length ? 'No matches.' : 'Nobody has signed up yet.'}</p>}
      {shown.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Joined</th><th title="When their session was last refreshed: about hourly while they have the site open">Last active</th><th>Access</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <span className={styles.person}>
                      {u.photo ? <img src={u.photo} alt="" width="24" height="24" referrerPolicy="no-referrer" loading="lazy" /> : <span className={styles.initial} aria-hidden="true">{(u.name ?? u.email ?? '?')[0].toUpperCase()}</span>}
                      {u.name ?? <span className={styles.muted}>—</span>}
                    </span>
                  </td>
                  <td>{u.email ?? <span className={styles.muted}>—</span>}{u.disabled ? <span className={styles.muted}> (disabled)</span> : ''}</td>
                  <td>{day(u.createdAt)}</td>
                  <td title={u.lastActiveAt ? `Last active ${new Date(u.lastActiveAt).toLocaleString()} · last sign-in ${new Date(u.lastLoginAt).toLocaleString()}` : undefined}>
                    {u.recent && <span className={styles.dot} aria-hidden="true" />}{lastActive(u.lastActiveAt, now)}
                  </td>
                  <td><span className={`${styles.chip} ${styles[u.status.cls]}`}>{u.status.label}</span></td>
                  <td className={styles.rowActions}>
                    <a href={viewAsHref(u)} target="_blank" rel="noopener noreferrer" className={`${ui.btn} ${ui.ghost} ${ui.small}`} title={`See the site as ${u.name || u.email} sees it, read-only (opens a new tab)`} aria-label={`View as ${u.name || u.email}`}><Eye size={14} /></a>
                    {u.email && u.status.cls !== 'chipOn' && (
                      <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => onApprove(u.email)} title={`Approve ${u.email} (fills the form above)`} aria-label={`Approve ${u.email}`}><UserPlus size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
