import { PencilLine, MessageCircle, CircleSlash, Clock } from 'lucide-react';
import styles from './InterviewScope.module.css';

/** Items are plain strings; `backticks` mark code. */
function withCode(text) {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

const columns = [
  { key: 'write', icon: PencilLine, label: 'Write this in code' },
  { key: 'say', icon: MessageCircle, label: 'Explain it, don’t code it' },
  { key: 'skip', icon: CircleSlash, label: 'Skip unless asked' },
];

/**
 * What a case-study round really expects, so learners don't think they must type the whole reference.
 * <InterviewScope minutes="45–60" lines="80–150" write={[…]} say={[…]} skip={[…]} />
 */
export function InterviewScope({ minutes, lines, write = [], say = [], skip = [] }) {
  const lists = { write, say, skip };
  return (
    <section className={styles.box} aria-label="What the interviewer expects">
      <p className={styles.head}>
        <Clock size={15} aria-hidden="true" />
        <span>
          A typical round: <strong>{minutes} minutes</strong>
          {lines && (
            <>
              , about <strong>{lines} lines</strong> of your own code
            </>
          )}
        </span>
      </p>
      <div className={styles.grid}>
        {columns.map(({ key, icon: Icon, label }) => (
          <div key={key} className={`${styles.col} ${styles[key]}`}>
            <p className={styles.label}>
              <Icon size={14} aria-hidden="true" />
              {label}
            </p>
            <ul>
              {lists[key].map((item) => (
                <li key={item}>{withCode(item)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
