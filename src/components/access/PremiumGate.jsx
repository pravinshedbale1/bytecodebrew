import { Link } from 'react-router';
import { Lock, LogIn, Check } from 'lucide-react';
import { useAccess } from '../../hooks/useAccess';
import { signIn } from '../../hooks/useAuth';
import { CONTACT_EMAIL, FREE_FEATURES, PREMIUM_FEATURES } from '../../config/access';
import ui from '../common/ui.module.css';
import styles from './PremiumGate.module.css';

/**
 * The message shown in place of premium content: what it is, what Premium includes, what stays free,
 * and the way to get it. `compact` is the slim version used inside lessons; `blurb` says what the
 * locked item does.
 */
export function PremiumNotice({ feature, blurb, compact = false }) {
  const { status } = useAccess();
  if (status === 'loading') return <p className={styles.loading}>Checking your access…</p>;
  const signedOut = status === 'signed-out';

  const actions = (
    <div className={ui.row}>
      <Link to="/premium" className={`${ui.btn} ${ui.primary} ${compact ? ui.small : ''}`}>See Premium</Link>
      {signedOut && (
        <button type="button" className={`${ui.btn} ${compact ? ui.small : ''}`} onClick={signIn}><LogIn size={14} /> Sign in</button>
      )}
      <span className={styles.ask}>Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
    </div>
  );

  if (compact) {
    return (
      <section className={`${styles.notice} ${styles.compact}`} aria-label="Premium content">
        <p className={styles.head}><Lock size={14} aria-hidden="true" /> {feature ? `${feature} is part of Premium` : 'Part of Premium'}</p>
        {blurb && <p className={styles.text}>{blurb}</p>}
        <p className={styles.text}>The lesson itself, its diagrams, quiz and notes stay free.</p>
        {actions}
      </section>
    );
  }

  // A short, calm note: what this is and what stays free. The full list is one click away rather
  // than a sales sheet in the middle of a study page.
  return (
    <section className={styles.notice} aria-label="Premium feature">
      <p className={styles.head}><Lock size={14} aria-hidden="true" /> {feature ? `${feature} is part of Premium` : 'This is part of Premium'}</p>
      {blurb && <p className={styles.text}>{blurb}</p>}
      <p className={styles.text}>Every Beginner and Intermediate lesson, with its diagrams, quizzes and notes, stays free.</p>
      <details className={styles.more}>
        <summary>What Premium includes</summary>
        <ul className={styles.list}>
          {PREMIUM_FEATURES.map(([name, d]) => <li key={name}><Check size={13} aria-hidden="true" /><span><strong>{name}</strong>{d ? ` — ${d}` : ''}</span></li>)}
        </ul>
        <p className={styles.colHead}>Free for everyone</p>
        <ul className={styles.list}>
          {FREE_FEATURES.map((x) => <li key={x}><Check size={13} aria-hidden="true" /><span>{x}</span></li>)}
        </ul>
      </details>
      {actions}
    </section>
  );
}

/** Renders children for premium accounts, the notice otherwise. */
export function PremiumGate({ feature, blurb, compact = false, children }) {
  const { status } = useAccess();
  if (status === 'premium') return children;
  return <PremiumNotice feature={feature} blurb={blurb} compact={compact} />;
}
