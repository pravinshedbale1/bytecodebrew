import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Download, Trash2, StickyNote, Sparkles, Highlighter } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useHighlights, removeHighlight } from '../hooks/useHighlights';
import { useAuth, signIn } from '../hooks/useAuth';
import { getTrack, getLessonContext } from '../curriculum';
import { highlightsSupported } from '../lib/highlights/anchor';
import { buildSummaryPrompt } from '../lib/highlightSummary';
import { SendToAi } from '../components/ai/SendToAi';
import page from './Page.module.css';
import styles from './HighlightsPage.module.css';

/** Every highlight and note, grouped by lesson, newest lesson activity first. */
export function HighlightsPage() {
  const all = useHighlights();
  const { status } = useAuth();

  const groups = useMemo(() => {
    const byLesson = new Map();
    for (const h of Object.values(all)) {
      if (!byLesson.has(h.lessonKey)) byLesson.set(h.lessonKey, []);
      byLesson.get(h.lessonKey).push(h);
    }
    return [...byLesson.entries()].map(([key, items]) => {
      const [trackId, courseId, lessonId] = key.split('/');
      const ctx = getLessonContext(trackId, courseId, lessonId);
      items.sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
      return {
        key,
        trackId,
        title: ctx?.lesson.title ?? key,
        where: [getTrack(trackId)?.title, ctx?.lesson.moduleTitle].filter(Boolean).join(' · '),
        latest: items.reduce((m, h) => (h.updatedAt > m ? h.updatedAt : m), ''),
        items,
      };
    }).sort((a, b) => b.latest.localeCompare(a.latest));
  }, [all]);

  const total = Object.keys(all).length;
  const tracks = [...new Set(groups.map((g) => g.trackId))].map((id) => ({ id, title: getTrack(id)?.title ?? id }));
  const [track, setTrack] = useState('all');
  const [openLesson, setOpenLesson] = useState(null);
  const chosen = groups.filter((g) => track === 'all' || g.trackId === track);
  const sheetPrompt = useMemo(() => buildSummaryPrompt(chosen), [chosen]);
  const chosenCount = chosen.reduce((n, g) => n + g.items.length, 0);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(Object.values(all), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bytecodebrew-highlights.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <PageLayout contentWidth="820px">
      <header className={page.header}>
        <p className={page.eyebrow}>Your notes</p>
        <h1 className={page.title}>My highlights</h1>
        <p className={page.lead}>
          Select any text in a lesson to highlight it or add a note. {total} highlight{total === 1 ? '' : 's'} in {groups.length} lesson{groups.length === 1 ? '' : 's'}.
        </p>
      </header>

      {(total > 0 || status === 'signed-out') && (
        <div className={styles.bar}>
          <span className={styles.status}>
            {status === 'signed-in' && 'Synced to your account across devices.'}
            {status === 'signed-out' && (<>Saved on this device only. <button type="button" className={styles.link} onClick={signIn}>Sign in with Google</button> to sync across devices.</>)}
            {(status === 'disabled' || status === 'loading') && 'Saved on this device.'}
          </span>
          {total > 0 && (
            <button type="button" className={styles.export} onClick={exportJson}>
              <Download size={14} /> Export
            </button>
          )}
        </div>
      )}

      {!highlightsSupported && (
        <p className={styles.warn}>Your browser doesn't support text highlighting yet. Update to a recent Chrome, Edge, Safari or Firefox.</p>
      )}

      {groups.length === 0 && (
        <section className={styles.emptyCard}>
          <span className={styles.emptyIcon} aria-hidden="true"><Highlighter size={22} /></span>
          <h2 className={styles.emptyTitle}>Your highlights will collect here</h2>
          <ol className={styles.emptySteps}>
            <li><span>1</span>Open any lesson and select a sentence worth remembering.</li>
            <li><span>2</span>Pick a colour, and add a note in your own words if you like.</li>
            <li><span>3</span>Before the interview, turn them into a revision sheet with ChatGPT, Claude or Gemini.</li>
          </ol>
          <Link to="/system-design/hld" className={styles.emptyCta}>Open a lesson</Link>
        </section>
      )}

      {groups.length > 0 && (
        <section className={styles.sheet}>
          <p className={styles.sheetHead}><Sparkles size={16} aria-hidden="true" /> Last-minute revision sheet</p>
          <p className={styles.sheetText}>
            Turn your highlights and notes into the crisp version of each topic: the core idea in one line, the must-know points,
            what to say in the interview and the traps. It opens in your own ChatGPT, Claude or Gemini, ready to send.
          </p>
          {tracks.length > 1 && (
            <div className={styles.scope} role="group" aria-label="Which highlights">
              <button type="button" className={styles.scopeChip} aria-pressed={track === 'all'} onClick={() => setTrack('all')}>Everything</button>
              {tracks.map((t) => (
                <button key={t.id} type="button" className={styles.scopeChip} aria-pressed={track === t.id} onClick={() => setTrack(t.id)}>{t.title}</button>
              ))}
            </div>
          )}
          <p className={styles.sheetCount}>{chosenCount} highlight{chosenCount === 1 ? '' : 's'} from {chosen.length} lesson{chosen.length === 1 ? '' : 's'}</p>
          <SendToAi prompt={sheetPrompt} verb="Summarise with" />
        </section>
      )}

      {groups.map((g) => (
        <section key={g.key} className={styles.lesson}>
          <div className={styles.lessonHead}>
            <h2 className={styles.lessonTitle}><Link to={`/${g.key}`}>{g.title}</Link></h2>
            <button type="button" className={styles.summarise} onClick={() => setOpenLesson(openLesson === g.key ? null : g.key)} aria-expanded={openLesson === g.key}>
              <Sparkles size={13} aria-hidden="true" /> Summarise
            </button>
          </div>
          {g.where && <p className={styles.where}>{g.where}</p>}
          {openLesson === g.key && (
            <div className={styles.lessonAi}>
              <SendToAi prompt={buildSummaryPrompt([g])} compact preview={false} />
            </div>
          )}
          <ul className={styles.items}>
            {g.items.map((h) => (
              <li key={h.id} className={`${styles.item} ${styles[h.color]}`}>
                <Link to={`/${g.key}?hl=${h.id}`} className={styles.quote}>{h.exact}</Link>
                {h.note && <p className={styles.note}><StickyNote size={13} aria-hidden="true" /> {h.note}</p>}
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => { if (window.confirm('Delete this highlight?')) removeHighlight(h.id); }}
                  aria-label="Delete highlight"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageLayout>
  );
}
