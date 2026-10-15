import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Shuffle, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { QUESTIONS, THEME_INFO } from '../../data/behavioralQuestions';
import { createSyncedStore, mergeArrays } from '../../lib/syncedStore';
import styles from './BehavioralDrill.module.css';

/**
 * Practise behavioral answers: a random question, a two-minute timer, a self-check
 * against the STAR checklist, and a history of attempts saved in this browser.
 */
const CHECKS = [
  'Opened with a one-line headline (nugget)',
  'Situation and task in under 30 seconds',
  'Actions numbered, each with a "because"',
  'Said "I" for my own actions',
  'Result included a number',
  'Ended with what I learned',
  'Finished in about two minutes',
];
const TARGET = 120;            // seconds
// Attempts, newest first, capped at 200; synced to the user's account when signed in.
const store = createSyncedStore({
  name: 'drills',
  storageKey: 'bcb:drills',
  initial: [],
  merge: mergeArrays('at', { sort: (a, b) => b.at.localeCompare(a.at), limit: 200 }),
});
const saveHistory = (next) => store.set(next);

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function pick(theme, current) {
  const pool = QUESTIONS.filter((q) => (theme === 'all' || q.theme === theme) && q.text !== current?.text);
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function BehavioralDrill() {
  const attempts = useSyncExternalStore(store.subscribe, store.get);
  const [theme, setTheme] = useState('all');
  const [question, setQuestion] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState([]);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  const next = () => {
    setQuestion(pick(theme, question));
    setSeconds(0); setRunning(false); setChecked([]); setSaved(false);
  };
  const toggle = (i) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
  const save = () => {
    saveHistory([{ q: question.text, theme: question.theme, score: checked.length, seconds, at: new Date().toISOString() }, ...attempts].slice(0, 200));
    setSaved(true);
  };

  const pct = Math.min(100, (seconds / TARGET) * 100);
  const over = seconds > TARGET + 30;
  const avg = attempts.length ? (attempts.reduce((a, x) => a + x.score, 0) / attempts.length).toFixed(1) : null;

  return (
    <div className={styles.drill}>
      <div className={styles.toolbar}>
        <label className={styles.select}>
          <span>Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="all">All themes ({QUESTIONS.length} questions)</option>
            {Object.entries(THEME_INFO).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.primary} onClick={next}>
          <Shuffle size={15} /> {question ? 'Next question' : 'Give me a question'}
        </button>
      </div>

      {question && (
        <>
          <p className={styles.theme}>{THEME_INFO[question.theme].label}</p>
          <p className={styles.question}>{question.text}</p>

          <div className={styles.timerRow}>
            <span className={`${styles.time} ${over ? styles.over : ''}`} aria-live="polite">{fmt(seconds)}</span>
            <span className={styles.bar}><span className={`${styles.fill} ${over ? styles.fillOver : ''}`} style={{ width: `${pct}%` }} /></span>
            <button type="button" className={styles.icon} onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause timer' : 'Start timer'}>
              {running ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button type="button" className={styles.icon} onClick={() => { setRunning(false); setSeconds(0); }} aria-label="Reset timer">
              <RotateCcw size={15} />
            </button>
          </div>
          <p className={styles.hint}>Start the timer and answer out loud. Aim for about 2:00.</p>

          <fieldset className={styles.checks}>
            <legend>Then score yourself honestly</legend>
            {CHECKS.map((c, i) => (
              <label key={c} className={styles.check}>
                <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} /> {c}
              </label>
            ))}
          </fieldset>
          <div className={styles.saveRow}>
            <span className={styles.score}>Score {checked.length} / {CHECKS.length}</span>
            <button type="button" className={styles.secondary} onClick={save} disabled={saved}>
              <Save size={14} /> {saved ? 'Saved' : 'Save attempt'}
            </button>
          </div>
        </>
      )}

      {attempts.length > 0 && (
        <div className={styles.history}>
          <p className={styles.historyHead}>
            {attempts.length} attempt{attempts.length > 1 ? 's' : ''} · average score {avg} / {CHECKS.length}
          </p>
          <ul>
            {attempts.slice(0, 5).map((a) => (
              <li key={a.at}>
                <span className={styles.histScore}>{a.score}/{CHECKS.length}</span> {a.q} <span className={styles.histTime}>{fmt(a.seconds)}</span>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.link} onClick={() => { if (window.confirm('Clear your drill history?')) saveHistory([]); }}>
            Clear history
          </button>
        </div>
      )}
    </div>
  );
}
