import ladderData from 'virtual:dsa-ladders';
import { tracks, getCourseLessons, getCourse } from '../curriculum';
import { dsa } from '../curriculum/tracks/dsa';
import { QUESTIONS } from '../data/behavioralQuestions';
import { getNextUp } from './nextLesson';
import { today, addDays, daysBetween, daySeed, dayKey } from './dates';

/** Every readable lesson in roadmap order, optionally limited to some tracks. */
export function readableLessons(focusTracks = []) {
  const chosen = focusTracks.length ? tracks.filter((t) => focusTracks.includes(t.id)) : tracks;
  return chosen.flatMap((t) =>
    t.courses.flatMap((c) =>
      getCourseLessons(t.id, c.id)
        .filter((l) => l.available)
        .map((l) => ({ ...l, trackId: t.id, trackTitle: t.title, courseTitle: c.shortTitle ?? c.title })),
    ),
  );
}

/**
 * Interview countdown: how many lessons are left in the chosen tracks, how many days remain,
 * the pace needed (keeping the last 3 days free for revision and mocks) and a week-by-week plan.
 */
export function countdownPlan({ interviewDate, focusTracks = [] }, isComplete, completedAt) {
  if (!interviewDate) return null;
  const now = today();
  const daysLeft = daysBetween(now, interviewDate);
  const lessons = readableLessons(focusTracks);
  // Interleave tracks so each week mixes DSA, design and behavioral rather than finishing one first.
  const remainingByTrack = new Map();
  for (const l of lessons) {
    if (isComplete(l.key)) continue;
    if (!remainingByTrack.has(l.trackId)) remainingByTrack.set(l.trackId, []);
    remainingByTrack.get(l.trackId).push(l);
  }
  const queues = [...remainingByTrack.values()];
  const remaining = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) remaining.push(q.shift());

  const studyDays = Math.max(1, daysLeft - 3);
  const perDay = remaining.length / studyDays;
  const weeks = [];
  const perWeek = Math.max(1, Math.ceil(perDay * 7));
  for (let i = 0; i < remaining.length && weeks.length < 52; i += perWeek) {
    weeks.push({ start: addDays(now, weeks.length * 7), lessons: remaining.slice(i, i + perWeek) });
  }

  // Pace: lessons completed in the last 7 days vs. what a week needs.
  const weekAgo = addDays(now, -7);
  const doneThisWeek = lessons.filter((l) => {
    const at = completedAt(l.key);
    return at && dayKey(new Date(at)) > weekAgo;
  }).length;

  return {
    daysLeft,
    total: lessons.length,
    remaining: remaining.length,
    perDay,
    perWeek,
    weeks,
    doneThisWeek,
    onTrack: daysLeft <= 0 || remaining.length === 0 || doneThisWeek >= Math.min(perWeek, remaining.length),
  };
}

/** The next unsolved ladder problems, following the DSA pattern order. */
export function nextProblems(isSolved, n = 2) {
  const course = dsa.courses.find((c) => c.id === 'patterns');
  const out = [];
  for (const m of course.modules) {
    for (const l of m.lessons) {
      for (const p of ladderData[l.id] ?? []) {
        if (!isSolved(p.slug)) out.push({ ...p, lessonTitle: l.title, lessonPath: `/dsa/patterns/${l.id}` });
        if (out.length >= n) return out;
      }
    }
  }
  return out;
}

export const allLadderProblems = () => Object.values(ladderData).flat();

/** Today's behavioral question and its index in the bank (the drill can open on it). */
export function questionOfTheDay() {
  const index = daySeed() % QUESTIONS.length;
  return { ...QUESTIONS[index], index };
}

/** Where to continue reading: the course last visited (or the interview plan's next lesson). */
export function nextLessonToRead({ lastVisited, isComplete, plan }) {
  if (plan?.weeks[0]?.lessons[0]) return plan.weeks[0].lessons[0];
  const [trackId, courseId] = (lastVisited ?? 'system-design/hld').split('/');
  if (!getCourse(trackId, courseId)) return null;
  return getNextUp(getCourseLessons(trackId, courseId), isComplete).next;
}

/**
 * Lessons that need attention, from first-try quiz scores, review lapses, practice self-ratings and
 * mock rubrics. Returns [{ lessonKey, reasons: [string], weight }] sorted by weight.
 */
export function weakAreas({ quizResults, reviews, practiceLog, quizzes }) {
  const byLesson = new Map();
  const add = (key, weight, reason) => {
    if (!byLesson.has(key)) byLesson.set(key, { lessonKey: key, reasons: [], weight: 0 });
    const e = byLesson.get(key);
    e.weight += weight;
    if (reason && !e.reasons.includes(reason)) e.reasons.push(reason);
  };

  for (const [key, answers] of Object.entries(quizResults)) {
    const list = Object.values(answers);
    const total = quizzes?.[key]?.length ?? list.length;
    const right = list.filter((r) => r.first).length;
    if (list.length >= Math.min(2, total) && right / list.length < 0.7) add(key, 3 * (1 - right / list.length) + 1, `Quick check ${right}/${list.length} first try`);
  }
  const lapses = new Map();
  for (const [id, s] of Object.entries(reviews)) {
    if (!s.lapses) continue;
    const key = id.replace(/^(qa|quiz):/, '').replace(/^practice:/, '').replace(/[:#][^:#]*$/, '');
    lapses.set(key, (lapses.get(key) ?? 0) + s.lapses);
  }
  for (const [key, n] of lapses) if (n >= 2) add(key, n * 0.6, `${n} review cards forgotten`);
  for (const [id, a] of Object.entries(practiceLog)) {
    if (a.rating === 'nailed') continue;
    add(id.split('#')[0], a.rating === 'missed' ? 1.5 : 0.8, a.rating === 'missed' ? 'Missed a practice task' : 'Practice task only partly right');
  }
  return [...byLesson.values()].sort((a, b) => b.weight - a.weight);
}
