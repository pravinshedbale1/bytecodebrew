import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { loadFirebase } from '../../lib/firebase';
import { planLength } from '../PricingPage';
import ui from '../../components/common/ui.module.css';
import styles from '../AdminPage.module.css';

const DURATIONS = [[30, '1 month'], [90, '3 months'], [180, '6 months'], [365, '1 year'], [0, 'Lifetime']];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function useCollection(name, build) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let stop = () => {};
    loadFirebase().then((fb) => {
      const q = build ? build(fb) : fb.fsMod.collection(fb.db, name);
      stop = fb.fsMod.onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => setError(e.code ?? e.message));
    });
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return [rows, error];
}

function PlanEditor({ plan, onDone }) {
  const [form, setForm] = useState(() => ({
    name: plan?.name ?? '',
    price: plan?.price ?? 499,
    durationDays: plan?.durationDays ?? 365,
    description: plan?.description ?? '',
    active: plan?.active ?? true,
    order: plan?.order ?? 0,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const id = plan?.id ?? slug(form.name);
    const price = Math.round(Number(form.price) * 100) / 100;
    if (!id) return setError('Give the plan a name.');
    if (!(price >= 1)) return setError('The price must be at least ₹1.');
    setBusy(true);
    setError(null);
    try {
      const fb = await loadFirebase();
      await fb.fsMod.setDoc(fb.fsMod.doc(fb.db, 'plans', id), {
        name: form.name.trim().slice(0, 60),
        price,
        durationDays: Number(form.durationDays),
        description: form.description.trim().slice(0, 300),
        active: Boolean(form.active),
        order: Number(form.order) || 0,
        updatedAt: fb.fsMod.serverTimestamp(),
      });
      onDone?.();
    } catch (err) {
      setError(`Could not save: ${err.code ?? err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className={styles.planForm}>
      <label><span className={ui.label}>Name</span>
        <input className={ui.input} value={form.name} onChange={set('name')} placeholder="Premium · 1 year" required maxLength={60} disabled={Boolean(plan)} />
      </label>
      <label><span className={ui.label}>Price (₹, incl. taxes)</span>
        <input className={ui.input} type="number" min="1" step="1" value={form.price} onChange={set('price')} required />
      </label>
      <label><span className={ui.label}>Access for</span>
        <select className={ui.select} value={form.durationDays} onChange={set('durationDays')}>
          {DURATIONS.map(([d, t]) => <option key={d} value={d}>{t}</option>)}
        </select>
      </label>
      <label className={styles.wide}><span className={ui.label}>Description (shown on the plan card)</span>
        <input className={ui.input} value={form.description} onChange={set('description')} placeholder="Best value — a full year of interview prep" maxLength={300} />
      </label>
      <label><span className={ui.label}>Sort order</span>
        <input className={ui.input} type="number" value={form.order} onChange={set('order')} />
      </label>
      <label className={styles.check}><input type="checkbox" checked={form.active} onChange={set('active')} /> On sale</label>
      <button type="submit" className={`${ui.btn} ${ui.primary}`} disabled={busy}><Save size={14} /> {busy ? 'Saving…' : plan ? 'Save changes' : 'Create plan'}</button>
      {error && <p className={ui.error} role="alert">{error}</p>}
    </form>
  );
}

/** Plans and prices (read by the /premium page and, for the price, by the payments Worker). */
export function AdminPlans() {
  const [plans, error] = useCollection('plans');
  const [editing, setEditing] = useState(null);   // plan id, 'new' or null
  const sorted = (plans ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.price - b.price);
  return (
    <section className={ui.panel}>
      <div className={styles.listHead}>
        <h2 className={ui.panelTitle}>Plans and prices</h2>
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => setEditing('new')}><Plus size={13} /> New plan</button>
      </div>
      <p className={styles.muted}>Prices are read by the server when an order is created, so a change applies to the next purchase. Turn a plan off to stop selling it; existing buyers keep their access.</p>
      {error && <p className={ui.error}>Could not load plans: {error}</p>}
      {editing === 'new' && <PlanEditor onDone={() => setEditing(null)} />}
      {plans && sorted.length === 0 && editing !== 'new' && <p className={styles.muted}>No plans yet — the /premium page shows "plans are being set up". Create one to start selling.</p>}
      <ul className={styles.list}>
        {sorted.map((p) => (
          <li key={p.id} style={{ display: 'block' }}>
            <div className={styles.planRow}>
              <span className={styles.who}>
                <strong>{p.name} · {inr(p.price)}</strong>
                <span className={styles.muted}>{planLength(p.durationDays)} · {p.active ? 'on sale' : 'off'} · id {p.id}</span>
              </span>
              <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setEditing(editing === p.id ? null : p.id)}>{editing === p.id ? 'Close' : 'Edit'}</button>
            </div>
            {editing === p.id && <PlanEditor plan={p} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The latest payments, newest first. */
export function AdminOrders() {
  const [orders, error] = useCollection('orders', (fb) => fb.fsMod.query(fb.fsMod.collection(fb.db, 'orders'), fb.fsMod.orderBy('createdAt', 'desc'), fb.fsMod.limit(50)));
  const paid = (orders ?? []).filter((o) => o.status === 'paid');
  const revenue = paid.reduce((s, o) => s + Number(o.amount || 0), 0);
  return (
    <section className={ui.panel}>
      <div className={styles.listHead}>
        <h2 className={ui.panelTitle}>Payments</h2>
        {orders && <span className={styles.muted}>{paid.length} paid of the last {orders.length} · {inr(revenue)}</span>}
      </div>
      {error && <p className={ui.error}>Could not load payments: {error}</p>}
      {orders?.length === 0 && <p className={styles.muted}>No payments yet.</p>}
      {orders?.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead><tr><th>When</th><th>Account</th><th>Plan</th><th>Amount</th><th>Status</th><th>Order</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}</td>
                  <td>{o.email}</td>
                  <td>{o.planName}</td>
                  <td>{inr(o.amount)}</td>
                  <td><span className={`${styles.status} ${styles[`st_${o.status}`] ?? ''}`}>{o.status}</span></td>
                  <td className={styles.mono}>{o.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
