import { Lock, LogIn, Mail } from 'lucide-react';
import { useAccess } from '../../hooks/useAccess';
import { signIn } from '../../hooks/useAuth';
import { CONTACT_EMAIL } from '../../config/access';
import ui from '../common/ui.module.css';
import styles from './PremiumGate.module.css';

const INCLUDED = [
  'Solve every practice problem here with tests (and performance checks)',
  'Timed mock interviews, with an optional AI interviewer',
  'LeetCode sync and full solved-history import',
  'Review deck, study plan, interview countdown and dashboard',
  'Code playground, behavioral drill and story bank',
];

function mailto(email, feature) {
  const subject = encodeURIComponent('ByteCodeBrew premium access');
  const body = encodeURIComponent(
    `Hi,\n\nI'd like premium access to ByteCodeBrew${feature ? ` (I was trying to use: ${feature})` : ''}.\n\nMy Google sign-in email: ${email ?? '(please fill in)'}\n\nThanks!`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/** The message shown in place of a premium feature. compact = inline inside a lesson. */
export function PremiumNotice({ feature, compact = false }) {
  const { status, email } = useAccess();
  if (status === 'loading') return <p className={styles.loading}>Checking your access…</p>;
  const signedOut = status === 'signed-out';
  return (
    <section className={`${styles.notice} ${compact ? styles.compact : ''}`} aria-label="Premium feature">
      <p className={styles.head}><Lock size={15} aria-hidden="true" /> {feature} {feature ? 'is' : 'This is'} a premium feature</p>
      <p className={styles.text}>
        {signedOut
          ? 'Sign in with Google, then ask for access. Reading lessons, highlighting, quizzes and progress stay free for everyone.'
          : <>Premium access is given by request. Email <a href={mailto(email, feature)}>{CONTACT_EMAIL}</a> from <strong>{email}</strong> and it will be switched on for this account.</>}
      </p>
      {!compact && (
        <ul className={styles.list}>
          {INCLUDED.map((x) => <li key={x}>{x}</li>)}
        </ul>
      )}
      <div className={ui.row}>
        {signedOut ? (
          <button type="button" className={`${ui.btn} ${ui.primary} ${compact ? ui.small : ''}`} onClick={signIn}><LogIn size={14} /> Sign in with Google</button>
        ) : (
          <a className={`${ui.btn} ${ui.primary} ${compact ? ui.small : ''}`} href={mailto(email, feature)}><Mail size={14} /> Email {CONTACT_EMAIL}</a>
        )}
      </div>
    </section>
  );
}

/** Renders children for premium accounts, the notice otherwise. */
export function PremiumGate({ feature, compact = false, children }) {
  const { status } = useAccess();
  if (status === 'premium') return children;
  return <PremiumNotice feature={feature} compact={compact} />;
}
