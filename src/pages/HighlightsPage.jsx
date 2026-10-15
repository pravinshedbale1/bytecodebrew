import { useMemo } from 'react';
import { Link } from 'react-router';
import { Download, Trash2, StickyNote } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useHighlights, removeHighlight } from '../hooks/useHighlights';
import { useAuth, signIn } from '../hooks/useAuth';
import { getTrack, getLessonContext } from '../curriculum';
import { highlightsSupported } from '../lib/highlights/anchor';
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
        title: ctx?.lesson.title ?? key,
        where: [getTrack(trackId)?.title, ctx?.lesson.moduleTitle].filter(Boolean).join(' · '),
        latest: items.reduce((m, h) => (h.updatedAt > m ? h.updatedAt : m), ''),
        items,
      };
    }).sort((a, b) => b.latest.localeCompare(a.latest));
  }, [all]);

  const total = Object.keys(all).length;
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

      {!highlightsSupported && (
        <p className={styles.warn}>Your browser doesn't support text highlighting yet. Update to a recent Chrome, Edge, Safari or Firefox.</p>
      )}

      {groups.length === 0 && (
        <p className={styles.empty}>No highlights yet. Open any lesson, select a sentence, and pick a colour.</p>
      )}

      {groups.map((g) => (
        <section key={g.key} className={styles.lesson}>
          <h2 className={styles.lessonTitle}><Link to={`/${g.key}`}>{g.title}</Link></h2>
          {g.where && <p className={styles.where}>{g.where}</p>}
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
