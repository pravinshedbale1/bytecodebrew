import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Layers, CalendarDays, Info } from 'lucide-react';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { ProgressBar } from '../components/common/ProgressBar';
import { MultipleChoice } from '../components/mdx/Quiz';
import { PRACTICE_RATING_LABEL } from '../components/mdx/Practice';
import { useDeck, NEW_PER_DAY } from '../lib/reviewDeck';
import { setReviewCard } from '../hooks/useLearning';
import { logActivity } from '../hooks/useActivity';
import { schedule, previewIntervals, RATINGS } from '../lib/srs';
import { getLessonContext } from '../curriculum';
import { today, addDays, parseDay } from '../lib/dates';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './ReviewPage.module.css';

const KIND_LABEL = { qa: 'Interview question', quiz: 'Quick check', practice: 'Practice task' };

function lessonOf(key) {
  const [t, c, l] = key.split('/');
  return getLessonContext(t, c, l)?.lesson ?? null;
}

export function ReviewPage() {
  const deck = useDeck();
  const [queue, setQueue] = useState(null);       // snapshot for this session
  const [done, setDone] = useState(0);
  const [again, setAgain] = useState(0);

  useEffect(() => {
    if (deck && queue == null) setQueue(deck.due);
  }, [deck, queue]);

  const forecast = useMemo(() => {
    if (!deck) return [];
    const day = today();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(day, i + 1);
      return { day: d, n: deck.cards.filter((c) => c.state && c.due === d).length };
    });
  }, [deck]);

  const rate = (card, rating) => {
    const next = schedule(card.state, rating);
    setReviewCard(card.id, next);
    logActivity('review');
    setDone((n) => n + 1);
    // A forgotten card comes back once more at the end of this session.
    const requeue = rating === 'again' && !card.requeued;
    if (requeue) setAgain((n) => n + 1);
    setQueue((q) => (requeue ? [...q.slice(1), { ...card, state: next, requeued: true }] : q.slice(1)));
  };

  const rail = (
    <>
      <RailCard title="Coming up" icon={<CalendarDays size={14} aria-hidden="true" />}>
        <ul className={styles.forecast}>
          {forecast.map((f) => (
            <li key={f.day}>
              <span>{parseDay(f.day).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</span>
              <span className={styles.forecastN}>{f.n || '–'}</span>
            </li>
          ))}
        </ul>
        {deck?.newWaiting > 0 && <p className={ui.help}>{deck.newWaiting} new cards are waiting; up to {NEW_PER_DAY} new cards join each day.</p>}
      </RailCard>
      <RailCard title="How cards get here" icon={<Info size={14} aria-hidden="true" />}>
        <ul className={styles.how}>
          <li>Every interview question of a lesson you mark complete.</li>
          <li>Quick-check questions you get wrong (and, for lessons without interview questions, their quick checks).</li>
          <li>Practice tasks you rate “Partly” or “Missed”.</li>
        </ul>
        <p className={ui.help}>Answer out loud before revealing. Cards you recall well come back less often: 1, 3, 7, 16, 35 then 90 days.</p>
      </RailCard>
    </>
  );

  const card = queue?.[0];
  const total = queue ? done + queue.length : 0;

  return (
    <PageLayout rail={rail} contentWidth="820px">
      <header className={page.header}>
        <p className={page.eyebrow}>Spaced repetition</p>
        <h1 className={page.title}>Review</h1>
        <p className={page.lead}>
          A few minutes a day keeps what you’ve read ready for the interview. {deck && `${deck.cards.length} cards in your deck · ${deck.mastered} mastered.`}
        </p>
      </header>

      {!deck || !queue ? (
        <p className={styles.loading}>Loading your deck…</p>
      ) : card ? (
        <>
          <div className={styles.progress}>
            <ProgressBar value={done} max={total} label="Review progress" />
            {again > 0 && <span>{again} to repeat</span>}
          </div>
          <ReviewCard key={`${card.id}:${done}`} card={card} onRate={(r) => rate(card, r)} />
        </>
      ) : (
        <section className={`${ui.panel} ${styles.doneBox}`}>
          <Layers size={22} aria-hidden="true" />
          <h2 className={ui.panelTitle}>{done ? `Done — ${done} card${done === 1 ? '' : 's'} reviewed.` : 'Nothing due right now.'}</h2>
          <p className={ui.panelLead}>
            {deck.cards.length === 0
              ? 'Your deck fills up as you complete lessons, answer quick checks and rate practice tasks.'
              : 'Come back tomorrow; the forecast on the right shows what’s next.'}
          </p>
          <div className={ui.row}>
            <Link to="/dashboard" className={`${ui.btn} ${ui.primary}`}>Back to dashboard</Link>
            <Link to="/mock" className={ui.btn}>Try a mock interview</Link>
          </div>
        </section>
      )}
    </PageLayout>
  );
}

function ReviewCard({ card, onRate }) {
  const [shown, setShown] = useState(false);
  const [quizOk, setQuizOk] = useState(null);
  const lesson = lessonOf(card.lessonKey);
  const intervals = previewIntervals(card.state);
  const ready = card.kind === 'quiz' ? quizOk != null : shown;

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (!ready && card.kind !== 'quiz' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setShown(true);
      } else if (ready && ['1', '2', '3', '4'].includes(e.key)) {
        onRate(RATINGS[Number(e.key) - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, card.kind, onRate]);

  return (
    <article className={styles.card}>
      <p className={styles.kind}>
        {card.missed ? 'Quick check you missed' : KIND_LABEL[card.kind]}
        {lesson && <> · <Link to={lesson.path}>{lesson.title}</Link></>}
      </p>

      {card.kind === 'quiz' ? (
        <MultipleChoice question={card.quiz} onAnswer={setQuizOk} />
      ) : (
        <>
          <p className={styles.prompt}>{card.prompt}</p>
          {!shown ? (
            <button type="button" className={`${ui.btn} ${styles.reveal}`} onClick={() => setShown(true)}>
              Show answer <kbd>Space</kbd>
            </button>
          ) : (
            <div className={styles.answer}>
              {card.attempt?.text && (
                <div className={styles.attempt}>
                  <p className={styles.attemptHead}>Your last attempt · {PRACTICE_RATING_LABEL[card.attempt.rating]}</p>
                  <p>{card.attempt.text}</p>
                </div>
              )}
              <div className={ui.answerHtml} dangerouslySetInnerHTML={{ __html: card.answerHtml }} />
            </div>
          )}
        </>
      )}

      {ready && (
        <div className={styles.rate}>
          <span className={styles.rateLabel}>How well did you recall it?</span>
          <div className={styles.rateButtons}>
            {RATINGS.map((r, i) => (
              <button
                key={r.id}
                type="button"
                className={`${ui.btn} ${styles.rateBtn} ${card.kind === 'quiz' && (quizOk ? r.id === 'good' : r.id === 'again') ? styles.suggested : ''}`}
                onClick={() => onRate(r.id)}
              >
                <span>{r.label}</span>
                <span className={styles.interval}>{intervals[r.id]} · {i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
