import { User, UserRoundCheck } from 'lucide-react';
import styles from './Dialogue.module.css';

const speakers = {
  you: { icon: User, label: 'You' },
  them: { icon: UserRoundCheck, label: 'Interviewer' },
};

/**
 * A short interview conversation, used for clarifying requirements.
 *   <Dialogue>
 *   <Turn who="you">Are there several floors?</Turn>
 *   <Turn who="them">Yes, three to start with.</Turn>
 *   </Dialogue>
 */
export function Dialogue({ title = 'How the conversation might go', children }) {
  return (
    <section className={styles.box} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <div className={styles.turns}>{children}</div>
    </section>
  );
}

export function Turn({ who = 'you', children }) {
  const s = speakers[who] ?? speakers.you;
  const Icon = s.icon;
  return (
    <div className={`${styles.turn} ${styles[who] ?? ''}`}>
      <span className={styles.who}>
        <Icon size={14} aria-hidden="true" />
        {s.label}
      </span>
      <div className={styles.text}>{children}</div>
    </div>
  );
}
