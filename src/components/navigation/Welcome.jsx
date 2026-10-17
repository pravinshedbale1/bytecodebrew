import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Code2, Layers, LayoutDashboard, X } from 'lucide-react';
import { readJSON, writeJSON } from '../../lib/storage';
import styles from './Welcome.module.css';

const KEY = 'bcb:welcome-dismissed';

const STEPS = [
  { icon: BookOpen, title: 'Learn', text: 'Follow a track in order. Each lesson ends with a quick check, then mark it complete.', to: '/system-design', link: 'Start learning' },
  { icon: Code2, title: 'Practise', text: 'Solve the DSA problems here with tests, and run timed mock interviews.', to: '/problems', link: 'Open Problems' },
  { icon: Layers, title: 'Remember', text: 'Completed lessons feed your review deck. A few cards a day keep it fresh for the interview.', to: '/review', link: 'How review works' },
  { icon: LayoutDashboard, title: 'Track', text: 'Your dashboard has today\'s plan, your streak and an interview countdown.', to: '/dashboard', link: 'Open dashboard' },
];

/** A one-time "how this site works" card for first visits; dismissing it is remembered in this browser. */
export function Welcome() {
  const [hidden, setHidden] = useState(() => Boolean(readJSON(KEY, false)));
  if (hidden) return null;
  const dismiss = () => {
    writeJSON(KEY, true);
    setHidden(true);
  };
  return (
    <section className={styles.welcome} aria-labelledby="welcome-title">
      <div className={styles.head}>
        <h2 id="welcome-title" className={styles.title}>New here? How ByteCodeBrew works</h2>
        <button type="button" className={styles.close} onClick={dismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
      <ol className={styles.steps}>
        {STEPS.map(({ icon: Icon, title, text, to, link }) => (
          <li key={title}>
            <span className={styles.icon} aria-hidden="true"><Icon size={16} /></span>
            <span>
              <strong>{title}</strong>
              <span className={styles.text}>{text}</span>
              <Link to={to} className={styles.link} onClick={dismiss}>{link}{'\u00a0'}→</Link>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
