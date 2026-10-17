import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Check, Sparkles, Lock, ShieldCheck, Loader2, LogIn, CircleCheck, CircleAlert } from 'lucide-react';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { useAccess } from '../hooks/useAccess';
import { signIn } from '../hooks/useAuth';
import { listPlans, startCheckout, verifyOrder } from '../lib/payments';
import { FREE_FEATURES, PREMIUM_FEATURES, CONTACT_EMAIL } from '../config/access';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './PricingPage.module.css';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const planLength = (days) => (!days ? 'Lifetime access' : days % 365 === 0 ? `${days / 365} year${days === 365 ? '' : 's'}` : days % 30 === 0 ? `${days / 30} month${days === 30 ? '' : 's'}` : `${days} days`);
const fmtDate = (ms) => new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

/** After Cashfree sends the buyer back: confirm the order and show the result. */
function ReturnBanner({ orderId }) {
  const [state, setState] = useState({ status: 'checking' });
  useEffect(() => {
    let alive = true;
    let tries = 0;
    const check = () => verifyOrder(orderId)
      .then((r) => {
        if (!alive) return;
        // Cashfree can take a few seconds to mark a payment as paid
        if (['active', 'processing'].includes(r.status) && tries++ < 6) { setTimeout(check, 2500); setState({ status: 'checking' }); return; }
        setState(r);
      })
      .catch((e) => alive && setState({ status: 'error', message: e.message }));
    check();
    return () => { alive = false; };
  }, [orderId]);

  if (state.status === 'checking') return <div className={`${styles.banner} ${styles.info}`}><Loader2 size={18} className={styles.spin} /> Confirming your payment…</div>;
  if (state.status === 'paid') {
    return (
      <div className={`${styles.banner} ${styles.ok}`}>
        <CircleCheck size={20} />
        <span><strong>Payment received — premium is on.</strong> {state.expiresAt ? `Your access runs until ${fmtDate(new Date(state.expiresAt).getTime())}.` : 'You have lifetime access.'} Everything below is now unlocked on every device you sign in to.</span>
      </div>
    );
  }
  const text = state.status === 'error' ? state.message
    : state.status === 'active' ? 'The payment was not completed. You have not been charged; you can try again below.'
      : state.status === 'expired' || state.status === 'terminated' ? 'This payment session expired without a payment. You can start again below.'
        : `We could not confirm this payment yet (${state.status}). If money left your account, premium will be applied automatically within a few minutes — or email ${CONTACT_EMAIL} with order ${orderId}.`;
  return <div className={`${styles.banner} ${styles.warn}`}><CircleAlert size={20} /><span>{text}</span></div>;
}

function PlanCard({ plan, access }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const signedOut = access.status === 'signed-out';

  const pay = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await startCheckout(plan.id, phone);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={styles.plan}>
      <p className={styles.planName}>{plan.name}</p>
      <p className={styles.price}>{inr(plan.price)}</p>
      <p className={styles.length}>{planLength(plan.durationDays)} · one-time payment, no auto-renewal</p>
      {plan.description && <p className={styles.planDesc}>{plan.description}</p>}
      {signedOut ? (
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={signIn}><LogIn size={15} /> Sign in to buy</button>
      ) : !open ? (
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={() => setOpen(true)}>
          {access.status === 'premium' ? 'Extend my premium' : `Get ${plan.name}`}
        </button>
      ) : (
        <form onSubmit={pay} className={styles.payForm}>
          <label>
            <span className={ui.label}>Mobile number (required by Cashfree)</span>
            <input className={ui.input} type="tel" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <button type="submit" className={`${ui.btn} ${ui.primary}`} disabled={busy}>
            {busy ? <Loader2 size={15} className={styles.spin} /> : <Lock size={14} />} Pay {inr(plan.price)} securely
          </button>
          <p className={styles.fine}>You'll pay on Cashfree's secure page (UPI, cards, net banking, wallets). Premium is added to <strong>{access.email}</strong> as soon as the payment succeeds.</p>
          {error && <p className={ui.error} role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}

/** /premium — what's free, what's premium, and the plans. */
export function PricingPage() {
  const access = useAccess();
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    listPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  const rail = (
    <RailCard title="Questions?" icon={<ShieldCheck size={14} aria-hidden="true" />}>
      <ul className={styles.faq}>
        <li><strong>Does it renew automatically?</strong> No. It's a one-time payment for the plan's period. Buying again extends your access.</li>
        <li><strong>What happens when it ends?</strong> Premium features lock again; your progress, notes and highlights stay.</li>
        <li><strong>Which account gets it?</strong> The Google account you're signed in with, on every device.</li>
        <li><strong>Refunds or problems?</strong> Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
      </ul>
    </RailCard>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Premium</p>
        <h1 className={page.title}>Prepare like it's the real interview</h1>
        <p className={page.lead}>
          The free lessons teach you the ideas. Premium adds the advanced topics, interactive simulations you can experiment with,
          step-through diagrams, 314 problems you solve here with tests, mock interviews and a review deck that keeps it all fresh.
        </p>
      </header>

      {orderId && access.status !== 'loading' && access.status !== 'signed-out' && <ReturnBanner orderId={orderId} />}

      {access.status === 'premium' && !orderId && (
        <div className={`${styles.banner} ${styles.ok}`}>
          <Sparkles size={18} />
          <span><strong>You have premium.</strong> {access.isAdmin ? 'Admin account.' : access.expiresAt ? `Active until ${fmtDate(access.expiresAt)}.` : 'Lifetime access.'}</span>
        </div>
      )}

      <h2 className={styles.h2} id="plans">Choose a plan</h2>
      {plans === null && <p className={styles.muted}>Loading plans…</p>}
      {plans?.length === 0 && (
        <p className={styles.muted}>Plans are being set up. Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to get premium in the meantime.</p>
      )}
      {plans?.length > 0 && (
        <div className={styles.plans}>
          {plans.map((p) => <PlanCard key={p.id} plan={p} access={access} />)}
        </div>
      )}

      <section className={styles.compare} aria-label="Free and premium compared">
        <div className={styles.col}>
          <h2 className={styles.colTitle}>Free</h2>
          <p className={styles.colSub}>For everyone, no card needed</p>
          <ul className={styles.list}>
            {FREE_FEATURES.map((f) => <li key={f}><Check size={15} aria-hidden="true" /> {f}</li>)}
          </ul>
        </div>
        <div className={`${styles.col} ${styles.colPremium}`}>
          <h2 className={styles.colTitle}><Sparkles size={16} aria-hidden="true" /> Premium</h2>
          <p className={styles.colSub}>Everything in Free, plus:</p>
          <ul className={styles.list}>
            {PREMIUM_FEATURES.map(([f, d]) => <li key={f}><Check size={15} aria-hidden="true" /> <span><strong>{f}</strong>{d ? ` — ${d}` : ''}</span></li>)}
          </ul>
        </div>
      </section>

      <p className={styles.fine}>Payments are processed by Cashfree Payments. Prices include applicable taxes. <Link to="/">Back to learning</Link></p>
    </PageLayout>
  );
}
