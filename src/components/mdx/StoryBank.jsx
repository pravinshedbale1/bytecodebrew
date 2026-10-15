import { useState, useSyncExternalStore } from 'react';
import { Check, Pencil, Trash2, Plus, Copy } from 'lucide-react';
import { readJSON, writeJSON } from '../../lib/storage';
import styles from './StoryBank.module.css';

/**
 * The reader's own story bank: STAR stories tagged with the themes they can answer,
 * plus a coverage grid that shows which themes still have no story. Saved in this browser only.
 */
export const THEMES = [
  'Conflict',
  'Leadership & influence',
  'Collaboration & mentoring',
  'Feedback & growth',
  'Ownership & ambiguity',
  'Failure & mistakes',
  'Deadlines & trade-offs',
  'Impact & customers',
  'Technical depth',
  'Integrity',
];

const KEY = 'bcb:stories';
let state = readJSON(KEY, []);
const listeners = new Set();
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const save = (next) => { state = next; writeJSON(KEY, state); listeners.forEach((l) => l()); };

const EMPTY = { title: '', situation: '', action: '', result: '', learned: '', themes: [] };

export function StoryBank() {
  const stories = useSyncExternalStore(subscribe, () => state);
  const [draft, setDraft] = useState(null);          // story being added or edited
  const [copied, setCopied] = useState(false);

  const startNew = () => setDraft({ ...EMPTY, id: Date.now() });
  const startEdit = (s) => setDraft({ ...s });
  const remove = (id) => {
    if (window.confirm('Delete this story?')) save(stories.filter((s) => s.id !== id));
  };
  const commit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    const exists = stories.some((s) => s.id === draft.id);
    save(exists ? stories.map((s) => (s.id === draft.id ? draft : s)) : [...stories, draft]);
    setDraft(null);
  };
  const toggleTheme = (t) =>
    setDraft((d) => ({ ...d, themes: d.themes.includes(t) ? d.themes.filter((x) => x !== t) : [...d.themes, t] }));

  const copyAll = async () => {
    const text = stories.map((s) => [
      `# ${s.title}`, `Themes: ${s.themes.join(', ') || '—'}`,
      `Situation/Task: ${s.situation}`, `Action: ${s.action}`, `Result: ${s.result}`, `Learned: ${s.learned}`,
    ].join('\n')).join('\n\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };

  const uncovered = THEMES.filter((t) => !stories.some((s) => s.themes.includes(t)));

  return (
    <div className={styles.bank}>
      <div className={styles.header}>
        <div>
          <strong>{stories.length}</strong> {stories.length === 1 ? 'story' : 'stories'} ·{' '}
          {uncovered.length === 0
            ? <span className={styles.ok}>every theme covered</span>
            : <span className={styles.gap}>{uncovered.length} theme{uncovered.length > 1 ? 's' : ''} without a story</span>}
        </div>
        <div className={styles.actions}>
          {stories.length > 0 && (
            <button type="button" className={styles.secondary} onClick={copyAll}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy all'}
            </button>
          )}
          {!draft && (
            <button type="button" className={styles.primary} onClick={startNew}>
              <Plus size={14} /> Add a story
            </button>
          )}
        </div>
      </div>

      {draft && (
        <form className={styles.form} onSubmit={commit}>
          <label>
            <span>Title (a few keywords you will remember)</span>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Payment retries outage" required />
          </label>
          {[
            ['situation', 'Situation & task: context in two sentences, and what you had to do'],
            ['action', 'Action: what YOU did, step by step (the longest part)'],
            ['result', 'Result: the outcome, with a number if possible'],
            ['learned', 'What you learned or would do differently'],
          ].map(([k, label]) => (
            <label key={k}>
              <span>{label}</span>
              <textarea rows={k === 'action' ? 4 : 2} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
            </label>
          ))}
          <fieldset>
            <legend>Themes this story can answer</legend>
            <div className={styles.chips}>
              {THEMES.map((t) => (
                <button type="button" key={t} className={`${styles.chip} ${draft.themes.includes(t) ? styles.chipOn : ''}`} onClick={() => toggleTheme(t)} aria-pressed={draft.themes.includes(t)}>
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primary}>Save story</button>
            <button type="button" className={styles.secondary} onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}

      {stories.length > 0 && (
        <div className={styles.gridWrap}>
          <table className={styles.grid}>
            <thead>
              <tr>
                <th scope="col">Theme</th>
                {stories.map((s) => (
                  <th key={s.id} scope="col" className={styles.storyHead}>
                    <span>{s.title}</span>
                    <span className={styles.rowActions}>
                      <button type="button" onClick={() => startEdit(s)} aria-label={`Edit ${s.title}`}><Pencil size={13} /></button>
                      <button type="button" onClick={() => remove(s.id)} aria-label={`Delete ${s.title}`}><Trash2 size={13} /></button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {THEMES.map((t) => (
                <tr key={t} className={uncovered.includes(t) ? styles.missing : ''}>
                  <th scope="row">{t}</th>
                  {stories.map((s) => (
                    <td key={s.id}>{s.themes.includes(t) ? <Check size={15} aria-label="covered" /> : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stories.length === 0 && !draft && (
        <p className={styles.empty}>No stories yet. Add your first one: start with the project you are proudest of.</p>
      )}
      <p className={styles.note}>Saved in this browser only. Use "Copy all" to keep a backup.</p>
    </div>
  );
}
