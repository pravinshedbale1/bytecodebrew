import { useState } from 'react';
import { useLessonKey } from '../lesson/LessonContext';
import { usePracticeLog, savePracticeAttempt } from '../../hooks/useLearning';
import { hashText } from '../../lib/hash';
import ui from '../common/ui.module.css';
import styles from './Practice.module.css';

const RATINGS = [
  { id: 'nailed', label: 'Nailed it' },
  { id: 'partial', label: 'Partly' },
  { id: 'missed', label: 'Missed it' },
];
export const PRACTICE_RATING_LABEL = Object.fromEntries(RATINGS.map((r) => [r.id, r.label]));

/**
 * A design exercise. The reader writes an attempt first, then compares it with the suggested
 * approach and rates how close they got; "partly" and "missed" come back in the review deck.
 *   <Practice task="Add EV charging spots.">approach in markdown</Practice>
 */
export function Practice({ task, children }) {
  const lessonKey = useLessonKey();
  const log = usePracticeLog();
  const id = lessonKey ? `${lessonKey}#${hashText(task)}` : null;
  const saved = id ? log[id] : null;

  const [draft, setDraft] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState(null);
  const [retry, setRetry] = useState(false);

  const showSaved = saved && !retry && !revealed;
  const open = revealed || showSaved;

  const rate = (rating) => {
    setRated(rating);
    if (id) savePracticeAttempt(id, draft.trim(), rating);
  };

  return (
    <div className={styles.practice}>
      <p className={styles.label}>Try it</p>
      <p className={styles.task}>{task}</p>

      {showSaved ? (
        <div className={styles.attempt} data-no-highlight>
          <p className={styles.attemptHead}>
            Your attempt · <span className={styles[saved.rating]}>{PRACTICE_RATING_LABEL[saved.rating]}</span>
            <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => { setRetry(true); setDraft(''); setRevealed(false); setRated(null); }}>
              Try again
            </button>
          </p>
          {saved.text && <p className={styles.attemptText}>{saved.text}</p>}
        </div>
      ) : (
        !revealed && (
          <div className={styles.compose}>
            <textarea
              className={`${ui.textarea} ${styles.textarea}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Sketch your answer first: the classes, the steps, the trade-off you'd pick… a few lines is enough."
              aria-label="Your attempt"
              rows={3}
            />
            <div className={ui.row}>
              <button type="button" className={`${ui.btn} ${ui.small}`} disabled={draft.trim().length < 15} onClick={() => setRevealed(true)}>
                Compare with an approach
              </button>
              <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setRevealed(true)}>
                Just show me
              </button>
            </div>
          </div>
        )
      )}

      {open && (
        <>
          {revealed && draft.trim() && (
            <div className={styles.attempt} data-no-highlight>
              <p className={styles.attemptHead}>Your attempt</p>
              <p className={styles.attemptText}>{draft.trim()}</p>
            </div>
          )}
          <details className={styles.details} open={revealed || undefined}>
            <summary className={styles.toggle}>{revealed ? 'Suggested approach' : 'Show the approach'}</summary>
            <div className={styles.answer}>{children}</div>
          </details>
          {revealed && draft.trim() && (
            <div className={styles.rate} data-no-highlight>
              {rated ? (
                <p className={styles.rated}>
                  Saved as <strong>{PRACTICE_RATING_LABEL[rated]}</strong>
                  {rated !== 'nailed' && id && ' — it will come back in your review deck.'}
                </p>
              ) : (
                <>
                  <span className={styles.rateLabel}>How close were you?</span>
                  <div className={ui.row}>
                    {RATINGS.map((r) => (
                      <button key={r.id} type="button" className={`${ui.btn} ${ui.small}`} onClick={() => rate(r.id)}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
