import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, Trash2, UserPlus, BarChart3 } from 'lucide-react';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { useAccess } from '../hooks/useAccess';
import { loadFirebase } from '../lib/firebase';
import { CONTACT_EMAIL } from '../config/access';
import { NotFoundPage } from './NotFoundPage';
import { AdminPlans, AdminOrders } from './admin/AdminPayments';
import { AdminSales, AdminUsers } from './admin/AdminAccounts';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './AdminPage.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * /admin — registered users, premium access by Google account email, the new-subscriptions switch,
 * plans and payments. Only the admin can see it.
 */
export function AdminPage() {
  const { status, isAdmin, email: me } = useAccess();
  const [rows, setRows] = useState(null);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let stop = () => {};
    loadFirebase().then((fb) => {
      stop = fb.fsMod.onSnapshot(
        fb.fsMod.collection(fb.db, 'entitlements'),
        (snap) => setRows(snap.docs.map((d) => ({ email: d.id, ...d.data() })).sort((a, b) => a.email.localeCompare(b.email))),
        (e) => setError(`Could not load the list: ${e.code ?? e.message}. Are the Firestore rules published?`),
      );
    });
    return () => stop();
  }, [isAdmin]);

  if (status === 'loading') return <PageLayout><p className={styles.muted}>Checking access…</p></PageLayout>;
  if (!isAdmin) return <NotFoundPage />;

  const add = async (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL.test(clean)) return setError('That does not look like an email address.');
    setBusy(true);
    setError(null);
    try {
      const fb = await loadFirebase();
      await fb.fsMod.setDoc(fb.fsMod.doc(fb.db, 'entitlements', clean), {
        premium: true,
        note: note.trim().slice(0, 200),
        addedAt: fb.fsMod.serverTimestamp(),
        addedBy: me,
      });
      setEmail('');
      setNote('');
    } catch (err) {
      setError(`Could not add ${clean}: ${err.code ?? err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove premium access for ${row.email}?`)) return;
    try {
      const fb = await loadFirebase();
      await fb.fsMod.deleteDoc(fb.fsMod.doc(fb.db, 'entitlements', row.email));
    } catch (err) {
      setError(`Could not remove ${row.email}: ${err.code ?? err.message}`);
    }
  };

  const shown = (rows ?? []).filter((r) => !filter || r.email.includes(filter.toLowerCase()) || (r.note ?? '').toLowerCase().includes(filter.toLowerCase()));

  const rail = (
    <RailCard title="How access works" icon={<ShieldCheck size={14} aria-hidden="true" />}>
      <ul className={styles.notes}>
        <li>Add the exact Google account email the person signs in with.</li>
        <li>Access switches on immediately, on every device they use, the next time the page loads or within seconds if it's open.</li>
        <li>Removing access stops premium features and syncing of premium data; their saved data is kept.</li>
        <li>Free for everyone: lessons, highlights, progress, lesson quizzes and practice, search, cheat sheets.</li>
        <li>People buy premium at /premium; payments grant access automatically for the plan's period. You can still approve accounts by hand here (no expiry).</li>
        <li>The eye button on a registered user opens the site as they see it, read-only, in a new tab. Your own data and theirs never mix, and nothing you do there changes their data.</li>
        <li>Questions come to {CONTACT_EMAIL}.</li>
      </ul>
    </RailCard>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Admin</p>
        <h1 className={page.title}>Users, access and payments</h1>
        <p><Link to="/admin/analytics" className={`${ui.btn} ${ui.small}`}><BarChart3 size={14} /> Usage analytics</Link></p>
        <p className={page.lead}>{rows ? `${rows.length} approved account${rows.length === 1 ? '' : 's'}.` : 'Loading…'} You ({me}) always have access.</p>
      </header>

      <AdminSales me={me} />

      <form ref={formRef} className={`${ui.panel} ${styles.form}`} onSubmit={add}>
        <h2 className={ui.panelTitle}>Approve an account</h2>
        <div className={styles.fields}>
          <label>
            <span className={ui.label}>Google account email</span>
            <input className={ui.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" autoComplete="off" required />
          </label>
          <label>
            <span className={ui.label}>Note (optional)</span>
            <input className={ui.input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. friend from work, paid until March" maxLength={200} />
          </label>
          <button type="submit" className={`${ui.btn} ${ui.primary}`} disabled={busy}><UserPlus size={15} /> {busy ? 'Adding…' : 'Approve'}</button>
        </div>
        {error && <p className={ui.error} role="alert">{error}</p>}
      </form>

      <section className={ui.panel}>
        <div className={styles.listHead}>
          <h2 className={ui.panelTitle}>Approved accounts</h2>
          <input className={`${ui.input} ${styles.filter}`} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…" aria-label="Filter approved accounts" />
        </div>
        {rows && shown.length === 0 && <p className={styles.muted}>{rows.length ? 'No matches.' : 'Nobody yet.'}</p>}
        <ul className={styles.list}>
          {shown.map((r) => (
            <li key={r.email}>
              <span className={styles.who}>
                <strong>{r.email}</strong>
                <span className={styles.muted}>
                  {['razorpay', 'cashfree'].includes(r.source) ? 'paid' : 'approved by admin'}
                  {r.addedAt?.toDate ? ` · since ${r.addedAt.toDate().toLocaleDateString()}` : ''}
                  {r.expiresAt?.toDate ? ` · until ${r.expiresAt.toDate().toLocaleDateString()}${r.expiresAt.toDate() < new Date() ? ' (expired)' : ''}` : ' · no expiry'}
                  {r.note ? ` · ${r.note}` : ''}
                </span>
              </span>
              <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small} ${ui.danger}`} onClick={() => remove(r)}><Trash2 size={13} /> Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <AdminUsers
        entitlements={rows}
        adminEmail={me}
        onApprove={(e) => { setEmail(e); formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); formRef.current?.querySelector('input[type=email]')?.focus({ preventScroll: true }); }}
      />

      <div className={styles.adminGrid}>
        <AdminPlans />
        <AdminOrders />
      </div>
    </PageLayout>
  );
}
