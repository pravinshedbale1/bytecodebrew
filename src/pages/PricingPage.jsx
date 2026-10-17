import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Check, Sparkles, Lock, ShieldCheck, Loader2, LogIn, CircleCheck, CircleAlert, X, CreditCard, RefreshCcw, Zap } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
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

/** Price per 30 days, for comparing plans (lifetime plans are not compared). */
const perMonth = (p) => (p.durationDays > 0 ? (p.price / p.durationDays) * 30 : null);

function PlanCard({ plan, best, saving, onChoose, access }) {
  const monthly = perMonth(plan);
  const signedOut = access.status === 'signed-out';
  return (
    <div className={`${styles.plan} ${best ? styles.best : ''}`}>
      {best && <span className={styles.ribbon}>Best value</span>}
      <p className={styles.planName}>{planLength(plan.durationDays).replace('access', '')}</p>
      <p className={styles.priceRow}>
        <span className={styles.price}>{inr(plan.price)}</span>
        {plan.durationDays > 0 && <span className={styles.per}>/ {planLength(plan.durationDays)}</span>}
      </p>
      <p className={styles.monthly}>
        {monthly && plan.durationDays > 31 ? <>{inr(Math.round(monthly))} per month</> : plan.durationDays > 0 ? 'Billed once' : 'Pay once, keep forever'}
        {saving > 0 && <span className={styles.save}>Save {saving}%</span>}
      </p>
      {plan.description && <p className={styles.planDesc}>{plan.description}</p>}
      <button type="button" className={`${ui.btn} ${best ? ui.primary : styles.secondaryBtn} ${styles.cta}`} onClick={() => (signedOut ? signIn() : onChoose(plan))}>
        {signedOut ? <><LogIn size={15} /> Sign in to buy</> : access.status === 'premium' ? 'Extend my premium' : `Choose ${planLength(plan.durationDays).toLowerCase()}`}
      </button>
    </div>
  );
}

/** The checkout step: a dialog with the order summary and the mobile number Cashfree needs. */
function CheckoutDialog({ plan, access, onClose }) {
  const ref = useRef(null);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const d = ref.current;
    if (plan && d && !d.open) d.showModal();
    if (!plan && d?.open) d.close();
  }, [plan]);

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
    <dialog ref={ref} className={styles.dialog} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="checkout-title">
      {plan && (
        <form onSubmit={pay} className={styles.dialogBody}>
          <div className={styles.dialogHead}>
            <h2 id="checkout-title">Checkout</h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
          <div className={styles.summary}>
            <div>
              <p className={styles.summaryName}>{plan.name}</p>
              <p className={styles.summarySub}>{planLength(plan.durationDays)} of ByteCodeBrew Premium · one-time payment</p>
            </div>
            <p className={styles.summaryPrice}>{inr(plan.price)}</p>
          </div>
          <p className={styles.account}>Premium will be added to <strong>{access.email}</strong>{access.status === 'premium' && access.expiresAt ? `, extending your access from ${fmtDate(access.expiresAt)}` : ''}.</p>
          <label className={styles.field}>
            <span className={ui.label}>Mobile number</span>
            <input className={ui.input} type="tel" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required autoFocus />
            <span className={styles.hintText}>Cashfree needs it to process the payment and send your receipt.</span>
          </label>
          {error && <p className={ui.error} role="alert">{error}</p>}
          <button type="submit" className={`${ui.btn} ${ui.primary} ${styles.payBtn}`} disabled={busy}>
            {busy ? <Loader2 size={16} className={styles.spin} /> : <Lock size={15} />} {busy ? 'Opening secure checkout…' : `Pay ${inr(plan.price)}`}
          </button>
          <p className={styles.secure}><ShieldCheck size={14} aria-hidden="true" /> You'll complete the payment on Cashfree's secure page: UPI, cards, net banking or wallets.</p>
          <p className={styles.hintText}>By paying you agree to the <Link to="/terms" target="_blank">Terms</Link> and the <Link to="/refund-policy" target="_blank">Refund Policy</Link>. Access is delivered instantly online.</p>
        </form>
      )}
    </dialog>
  );
}

const FAQ = [
  ['Does it renew automatically?', 'No. Every plan is a one-time payment for its period. Buying again later extends your access from the current end date.'],
  ['When does premium start?', 'Immediately after the payment succeeds, on every device where you sign in with the same Google account.'],
  ['What happens when it ends?', 'Premium content locks again. Your progress, highlights, notes and solved problems are kept.'],
  ['How do I pay?', 'Through Cashfree Payments: UPI, debit and credit cards, net banking and wallets.'],
  ['Can I get a refund?', <>Yes: a full refund within 7 days of purchase, and always if you were charged but Premium didn't activate. Email {CONTACT_EMAIL} with your order number. Details in the <Link to="/refund-policy">Refund & Cancellation Policy</Link>.</>],
];

/** /premium — the plans, what's free and what's premium, and the questions people ask. */
export function PricingPage() {
  const access = useAccess();
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [plans, setPlans] = useState(null);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    listPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  // Best value = the lowest price per month; savings are measured against the dearest per-month plan
  const timed = (plans ?? []).filter((p) => p.durationDays > 0);
  const best = timed.length > 1 ? timed.reduce((a, b) => (perMonth(b) < perMonth(a) ? b : a)) : null;
  const dearest = timed.length > 1 ? Math.max(...timed.map(perMonth)) : null;
  const savingOf = (p) => (dearest && p.durationDays > 0 ? Math.round((1 - perMonth(p) / dearest) * 100) : 0);

  return (
    <PageLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={page.eyebrow}>ByteCodeBrew Premium</p>
          <h1 className={styles.heroTitle}>Prepare like it's the real interview</h1>
          <p className={styles.heroLead}>
            The free lessons teach the ideas. Premium adds the advanced topics, interactive simulations, step-through diagrams,
            314 problems you solve here with tests, mock interviews and a review deck that keeps it all fresh.
          </p>
        </header>

        {orderId && access.status !== 'loading' && access.status !== 'signed-out' && <ReturnBanner orderId={orderId} />}
        {access.status === 'premium' && !orderId && (
          <div className={`${styles.banner} ${styles.ok}`}>
            <Sparkles size={18} />
            <span><strong>You have premium.</strong> {access.isAdmin ? 'Admin account.' : access.expiresAt ? `Active until ${fmtDate(access.expiresAt)}. Buying again extends it.` : 'Lifetime access.'}</span>
          </div>
        )}

        <section id="plans" aria-label="Plans">
          {plans === null && <p className={styles.muted}>Loading plans…</p>}
          {plans?.length === 0 && (
            <p className={styles.muted}>Plans are being set up. Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to get premium in the meantime.</p>
          )}
          {plans?.length > 0 && (
            <div className={styles.plans} style={{ '--cols': Math.min(plans.length, 3) }}>
              {plans.map((p) => <PlanCard key={p.id} plan={p} best={best?.id === p.id} saving={savingOf(p)} onChoose={setChosen} access={access} />)}
            </div>
          )}
          <ul className={styles.trust} aria-label="About payment">
            <li><ShieldCheck size={15} aria-hidden="true" /> Secure payment by Cashfree</li>
            <li><CreditCard size={15} aria-hidden="true" /> UPI, cards, net banking, wallets</li>
            <li><RefreshCcw size={15} aria-hidden="true" /> One-time payment, no auto-renewal</li>
            <li><Zap size={15} aria-hidden="true" /> Instant access on all your devices</li>
          </ul>
        </section>

        <h2 className={styles.h2}>What you get</h2>
        <section className={styles.compare} aria-label="Free and premium compared">
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Free</h3>
            <p className={styles.colSub}>For everyone, no card needed</p>
            <ul className={styles.list}>
              {FREE_FEATURES.map((f) => <li key={f}><Check size={15} aria-hidden="true" /> {f}</li>)}
            </ul>
          </div>
          <div className={`${styles.col} ${styles.colPremium}`}>
            <h3 className={styles.colTitle}><Sparkles size={16} aria-hidden="true" /> Premium</h3>
            <p className={styles.colSub}>Everything in Free, plus:</p>
            <ul className={styles.list}>
              {PREMIUM_FEATURES.map(([f, d]) => <li key={f}><Check size={15} aria-hidden="true" /> <span><strong>{f}</strong>{d ? ` — ${d}` : ''}</span></li>)}
            </ul>
          </div>
        </section>

        <h2 className={styles.h2}>Questions</h2>
        <div className={styles.faq}>
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className={styles.fine}>Payments are processed by Cashfree Payments. Prices are in Indian rupees and include applicable taxes. Sold by ByteCodeBrew Solutions. <Link to="/terms">Terms</Link> · <Link to="/refund-policy">Refunds</Link> · <Link to="/contact">Contact</Link></p>
      </div>
      <CheckoutDialog plan={chosen} access={access} onClose={() => setChosen(null)} />
    </PageLayout>
  );
}
