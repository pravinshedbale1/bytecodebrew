import { useEffect, useMemo, useState } from 'react';
import { loadAllQuizzes, quizId } from '../data/quizzes';
import { useProgress } from '../hooks/useProgress';
import { useQuizResults, usePracticeLog, useReviewState, migrateLearningIds } from '../hooks/useLearning';
import { today, addDays, dayKey } from './dates';
import { hashText } from './hash';

/**
 * The review deck is derived, never stored: cards come from what the learner has done, and only
 * their schedule lives in the `reviews` store.
 *
 *  qa:<lessonKey>:<hash>      every interview question of a completed lesson (due the day after completion)
 *  quiz:<lessonKey>:<hash>    quick-check questions answered wrongly, and, for completed lessons that have
 *                             no interview questions (company guides…), their quick-check questions
 *  practice:<lessonKey>#<id>  practice tasks rated "partly" or "missed"
 * Ids hash the question text, so adding or reordering questions never shifts anyone's schedule.
 */
export const NEW_PER_DAY = 20;

let sourcesPromise = null;
export function loadDeckSources() {
  sourcesPromise ??= Promise.all([
    import('virtual:lesson-extracts').then((m) => m.default),
    loadAllQuizzes(),
  ]).then(([extracts, quizzes]) => ({ extracts, quizzes }));
  return sourcesPromise;
}

export function buildDeck(sources, { progress, quizResults, practiceLog, reviews }, day = today()) {
  const { extracts, quizzes } = sources;
  const cards = [];

  const quizCard = (key, q, newDue) => ({ id: `quiz:${key}:${quizId(q)}`, kind: 'quiz', lessonKey: key, prompt: q.q, quiz: q, newDue });
  const added = new Set();
  const push = (card) => { if (!added.has(card.id)) { added.add(card.id); cards.push(card); } };

  // missed quick checks first, so a question that is both missed and from a completed lesson keeps the label
  for (const [key, answers] of Object.entries(quizResults)) {
    const byId = new Map((quizzes[key] ?? []).map((q) => [quizId(q), q]));
    for (const [id, r] of Object.entries(answers)) {
      if (r.first && r.last) continue;
      const q = byId.get(id);
      if (q) push({ ...quizCard(key, q, day), missed: true });
    }
  }

  for (const [key, rec] of Object.entries(progress)) {
    if (!rec?.completedAt || !extracts[key]) continue;
    const newDue = addDays(dayKey(new Date(rec.completedAt)), 1);
    for (const qa of extracts[key].qa) push({ id: `qa:${key}:${hashText(qa.q)}`, kind: 'qa', lessonKey: key, prompt: qa.q, answerHtml: qa.a, newDue });
    if (!extracts[key].qa.length) for (const q of quizzes[key] ?? []) push(quizCard(key, q, newDue));
  }

  for (const [id, attempt] of Object.entries(practiceLog)) {
    if (attempt.rating === 'nailed') continue;
    const [key, taskId] = id.split('#');
    const task = extracts[key]?.practice.find((p) => p.id === taskId);
    if (task) {
      cards.push({ id: `practice:${id}`, kind: 'practice', lessonKey: key, prompt: task.task, answerHtml: task.a, attempt, newDue: day });
    }
  }

  for (const c of cards) {
    c.state = reviews[c.id] ?? null;
    c.due = c.state?.due ?? c.newDue;
  }

  const introducedToday = Object.values(reviews).filter((s) => s.introduced === day).length;
  const reviewDue = cards.filter((c) => c.state && c.due <= day);
  const fresh = cards.filter((c) => !c.state && c.due <= day);
  const newAllowance = Math.max(0, NEW_PER_DAY - introducedToday);
  // Missed quiz and practice items first, then the oldest-due cards.
  const order = (a, b) => (a.kind === 'qa') - (b.kind === 'qa') || a.due.localeCompare(b.due);
  const due = [...reviewDue.sort(order), ...fresh.sort(order).slice(0, newAllowance)];

  return {
    cards,
    due,
    newWaiting: Math.max(0, fresh.length - newAllowance),
    mastered: cards.filter((c) => (c.state?.box ?? 0) >= 4).length,
  };
}

/** Early builds keyed quiz answers and review cards by position; move them to text-hash ids. */
function migrateOldIds({ extracts, quizzes }) {
  migrateLearningIds(
    (lesson, i) => (quizzes[lesson]?.[i] ? quizId(quizzes[lesson][i]) : null),
    (id) => {
      const [, kind, lesson, i] = /^(qa|quiz):(.+):(\d+)$/.exec(id);
      if (kind === 'qa') { const qa = extracts[lesson]?.qa[Number(i)]; return qa ? `qa:${lesson}:${hashText(qa.q)}` : null; }
      const q = quizzes[lesson]?.[Number(i)];
      return q ? `quiz:${lesson}:${quizId(q)}` : null;
    },
  );
}

/** The deck for the signed-in (or local) learner; null until the card text has loaded. */
export function useDeck() {
  const [sources, setSources] = useState(null);
  const { progress } = useProgress();
  const quizResults = useQuizResults();
  const practiceLog = usePracticeLog();
  const reviews = useReviewState();

  useEffect(() => {
    let alive = true;
    loadDeckSources().then((s) => {
      if (!alive) return;
      migrateOldIds(s);
      setSources(s);
    });
    return () => { alive = false; };
  }, []);

  return useMemo(
    () => (sources ? { ...buildDeck(sources, { progress, quizResults, practiceLog, reviews }), sources } : null),
    [sources, progress, quizResults, practiceLog, reviews],
  );
}
