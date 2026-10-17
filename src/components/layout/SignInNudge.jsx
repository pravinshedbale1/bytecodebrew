import { useState } from 'react';
import { LogIn, X } from 'lucide-react';
import { useAuth, signIn } from '../../hooks/useAuth';
import { useActivity, dayTotal } from '../../hooks/useActivity';
import { readJSON, writeJSON } from '../../lib/storage';
import styles from './SignInNudge.module.css';

const KEY = 'bcb:signin-nudge-until';
const SNOOZE_DAYS = 14;

/**
 * Once a signed-out learner has made some progress, suggest signing in so it isn't tied to one
 * browser. Dismissing snoozes it for two weeks.
 */
export function SignInNudge() {
  const { status } = useAuth();
  const activity = useActivity();
  const [until, setUntil] = useState(() => readJSON(KEY, 0));
  const progress = Object.values(activity).reduce((n, day) => n + dayTotal(day), 0);

  if (status !== 'signed-out' || progress < 1 || Date.now() < until) return null;

  const snooze = () => {
    const t = Date.now() + SNOOZE_DAYS * 86400000;
    writeJSON(KEY, t);
    setUntil(t);
  };

  return (
    <aside className={styles.nudge} role="complementary" aria-label="Save your progress">
      <button type="button" className={styles.close} onClick={snooze} aria-label="Not now">
        <X size={15} />
      </button>
      <p className={styles.title}>Keep your progress safe</p>
      <p className={styles.text}>
        It's saved in this browser only. Sign in to keep it if you clear your browser, and to use it on your phone and laptop.
      </p>
      <button type="button" className={styles.button} onClick={signIn}>
        <LogIn size={15} /> Sign in with Google
      </button>
    </aside>
  );
}
