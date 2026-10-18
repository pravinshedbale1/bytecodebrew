import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Highlighter, StickyNote, Sparkles } from 'lucide-react';
import { RailCard } from '../layout/PageLayout';
import { useHighlights } from '../../hooks/useHighlights';
import { textIndex, anchorToRange } from '../../lib/highlights/anchor';
import { buildSummaryPrompt } from '../../lib/highlightSummary';
import { getLessonContext } from '../../curriculum';
import { SendToAi } from '../ai/SendToAi';
import styles from './LessonHighlightsCard.module.css';

/** Right-rail list of this lesson's highlights; clicking one scrolls to it. */
export function LessonHighlightsCard({ rootRef, lessonKey }) {
  const all = useHighlights();
  const mine = useMemo(
    () => Object.values(all).filter((h) => h.lessonKey === lessonKey).sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0)),
    [all, lessonKey],
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  if (!mine.length) return null;
  const lessonTitle = () => {
    const [trackId, courseId, lessonId] = lessonKey.split('/');
    const ctx = getLessonContext(trackId, courseId, lessonId);
    return { title: ctx?.lesson.title ?? lessonKey, where: ctx?.lesson.moduleTitle };
  };

  const jump = (h) => {
    const root = rootRef.current;
    const range = root && anchorToRange(h, textIndex(root));
    if (!range) return;
    const rect = range.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 3, behavior: 'smooth' });
  };

  return (
    <RailCard title={`Your highlights (${mine.length})`} icon={<Highlighter size={14} aria-hidden="true" />}>
      <ul className={styles.list}>
        {mine.map((h) => (
          <li key={h.id}>
            <button type="button" className={styles.item} onClick={() => jump(h)}>
              <span className={`${styles.dot} ${styles[h.color]}`} aria-hidden="true" />
              <span className={styles.text}>{h.exact.length > 90 ? `${h.exact.slice(0, 90)}…` : h.exact}</span>
              {h.note && <StickyNote size={13} className={styles.noteIcon} aria-label="has a note" />}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.summary} onClick={() => setSummaryOpen((v) => !v)} aria-expanded={summaryOpen}>
        <Sparkles size={13} aria-hidden="true" /> Revision summary with AI
      </button>
      {summaryOpen && (
        <div className={styles.summaryBox}>
          <p className={styles.summaryText}>The crisp, before-the-interview version of this lesson, built from your highlights.</p>
          <SendToAi prompt={buildSummaryPrompt([{ ...lessonTitle(), items: mine }])} compact preview={false} />
        </div>
      )}
      <Link to="/highlights" className={styles.all}>All highlights →</Link>
    </RailCard>
  );
}
