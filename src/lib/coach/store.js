import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createSyncedStore } from '../syncedStore';
import { useSolved } from '../../hooks/useSolved';
import { useQuizResults } from '../../hooks/useLearning';
import { useRunway } from '../../hooks/useRunway';
import { companyPlan } from '../../data/companies';
import { daysBetween } from '../dates';
import { logActivity } from '../../hooks/useActivity';
import { today, dayKey } from '../dates';
import { buildModel, buildSession } from './model.js';
import { catalog, patternOf } from './catalog.js';

/**
 * The Daily Coach's synced store (Premium): { startedAt, placedAt, events: [...], sessions: { day: session } }.
 * Events are what happened (see model.js); a session is a day's plan plus the learner's progress
 * through it: answers { [drill index]: { pat, cx, ms, at } }, resolveResult { pass, at }, reviewDone.
 * Two devices merge by uniting events and, per day, keeping the session built first plus every
 * answer either device recorded.
 */
const MAX_EVENTS = 3000;
const KEEP_DAYS = 45;

const minOf = (a, b) => (a == null ? b : b == null ? a : Math.min(a, b));

function mergeSession(a, b) {
  if (!a) return b;
  if (!b) return a;
  const [base, other] = a.createdAt <= b.createdAt ? [a, b] : [b, a];
  const same = JSON.stringify(base.drills?.map((d) => d.slug)) === JSON.stringify(other.drills?.map((d) => d.slug));
  return {
    ...base,
    answers: same ? { ...(other.answers ?? {}), ...(base.answers ?? {}) } : base.answers ?? {},
    resolveResult: base.resolveResult ?? (other.resolve?.slug === base.resolve?.slug ? other.resolveResult : undefined),
    reviewDone: Boolean(base.reviewDone || other.reviewDone),
  };
}

function trim(state) {
  const days = Object.keys(state.sessions).sort().slice(-KEEP_DAYS);
  return {
    ...state,
    events: state.events.length > MAX_EVENTS ? state.events.slice(-MAX_EVENTS) : state.events,
    sessions: Object.fromEntries(days.map((d) => [d, state.sessions[d]])),
  };
}

const store = createSyncedStore({
  name: 'coach',
  storageKey: 'bcb:coach',
  initial: { startedAt: null, placedAt: null, events: [], sessions: {} },
  merge: (local, remote) => {
    const byId = new Map();
    for (const e of [...(remote.events ?? []), ...(local.events ?? [])]) byId.set(e.id, e);
    const sessions = { ...(remote.sessions ?? {}) };
    for (const [d, s] of Object.entries(local.sessions ?? {})) sessions[d] = mergeSession(s, sessions[d]);
    return trim({
      startedAt: minOf(local.startedAt, remote.startedAt),
      placedAt: minOf(local.placedAt, remote.placedAt),
      events: [...byId.values()].sort((x, y) => x.t - y.t),
      sessions,
    });
  },
});

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function addEvent(e) {
  store.set((prev) => trim({ ...prev, startedAt: prev.startedAt ?? Date.now(), events: [...prev.events, { id: newId(), t: Date.now(), ...e }] }));
}

const sameDay = (t) => today() === dayKey(new Date(t));

// ---- hints shown in the solver count against a clean solve (kept for this browser tab)
const HINT_KEY = 'bcb:coach-hints';
const readHints = () => { try { return JSON.parse(sessionStorage.getItem(HINT_KEY) ?? '{}'); } catch { return {}; } };
export function noteHint(slug) {
  const h = readHints();
  h[slug] = (h[slug] ?? 0) + 1;
  try { sessionStorage.setItem(HINT_KEY, JSON.stringify(h)); } catch { /* ignore */ }
}
const takeHints = (slug) => {
  const h = readHints();
  const n = h[slug] ?? 0;
  delete h[slug];
  try { sessionStorage.setItem(HINT_KEY, JSON.stringify(h)); } catch { /* ignore */ }
  return n;
};

/** A judged submission outside a re-solve: an accept, or a fail (at most one fail per problem per day). */
export function recordSubmission(slug, { accepted, firstTry }) {
  if (!patternOf(slug)) return;
  if (accepted) {
    addEvent({ k: 'accept', s: slug, first: Boolean(firstTry), hints: takeHints(slug) });
    return;
  }
  if (store.get().events.some((e) => e.k === 'fail' && e.s === slug && sameDay(e.t))) return;
  addEvent({ k: 'fail', s: slug });
}

/** The end of a re-solve from memory; also marks today's session if it was today's re-solve. */
export function recordResolve(slug, pass) {
  const day = today();
  store.set((prev) => {
    const s = prev.sessions[day];
    const sessions = s?.resolve?.slug === slug && !s.resolveResult ? { ...prev.sessions, [day]: { ...s, resolveResult: { pass, at: Date.now() } } } : prev.sessions;
    return trim({ ...prev, sessions, events: [...prev.events, { id: newId(), t: Date.now(), k: 'resolve', s: slug, pass }] });
  });
  logActivity('coach');
}

export function answerDrill(day, i, { pat, cx, ms }) {
  store.set((prev) => {
    const s = prev.sessions[day];
    if (!s || s.answers?.[i]) return prev;
    const drill = s.drills[i];
    const answers = { ...(s.answers ?? {}), [i]: { pat, cx, ms, at: Date.now() } };
    const placedAt = s.placement && Object.keys(answers).length >= s.drills.length ? prev.placedAt ?? Date.now() : prev.placedAt;
    const event = { id: newId(), t: Date.now(), k: 'drill', s: drill.slug, pat: pat === patternOf(drill.slug), cx: drill.cxOptions ? cx === catalog.cx[drill.slug][0] : null };
    return trim({ ...prev, placedAt, sessions: { ...prev.sessions, [day]: { ...s, answers } }, events: [...prev.events, event] });
  });
  logActivity('coach');
}

export function markReviewDone(day) {
  store.set((prev) => (prev.sessions[day] ? { ...prev, sessions: { ...prev.sessions, [day]: { ...prev.sessions[day], reviewDone: true } } } : prev));
}

/** For the solver: is this problem today's re-solve, and has it been finished? */
export function resolveStatus(slug) {
  const s = store.get().sessions[today()];
  return s?.resolve?.slug === slug ? { today: true, result: s.resolveResult ?? null } : { today: false, result: null };
}

/**
 * A session nobody has touched yet is rebuilt when the Runway plan changes its company or date, so a
 * plan made mid-morning steers that same day. Once anything is answered it stays as it is.
 */
function stale(s, context) {
  if (s.placement || Object.keys(s.answers ?? {}).length || s.resolveResult || s.reviewDone) return false;
  const was = s.context ?? { focus: [], daysLeft: null };
  return was.daysLeft !== context.daysLeft || was.focus.join() !== context.focus.join();
}

/**
 * The coach for the Today page: the state, the skill model and today's session (built on first
 * visit of the day and saved, so it stays the same all day and on every device).
 */
export function useCoach() {
  const state = useSyncExternalStore(store.subscribe, store.get);
  const { solved } = useSolved();
  const quiz = useQuizResults();
  const day = today();

  const model = useMemo(
    () => buildModel({ events: state.events, solved, quiz, patternOf, startedAt: state.startedAt, now: Date.now() }),
    [state.events, state.startedAt, solved, quiz],
  );
  const session = state.sessions[day] ?? null;
  // Runway feeds the coach: the target company's focus patterns and the days left to the interview
  const plan = useRunway();
  const context = useMemo(() => {
    if (!plan?.settings) return { focus: [], daysLeft: null, company: null, end: null };
    const company = plan.settings.company ? companyPlan(plan.settings.company) : null;
    const daysLeft = daysBetween(day, plan.settings.end);
    return { focus: company?.focus ?? [], daysLeft: daysLeft >= 0 ? daysLeft : null, company, end: plan.settings.end };
  }, [plan, day]);

  useEffect(() => {
    if (session && !stale(session, context)) return;
    store.set((prev) => {
      if (prev.sessions[day] && !stale(prev.sessions[day], context)) return prev;
      const now = Date.now();
      const placement = !prev.placedAt && model.evidence === 0;
      const built = buildSession({ model, catalog, date: day, now, placement, focus: context.focus, daysLeft: context.daysLeft });
      return trim({ ...prev, startedAt: prev.startedAt ?? now, sessions: { ...prev.sessions, [day]: { ...built, answers: {} } } });
    });
  }, [session, day, model, context]);

  return { state, model, session, day, plan, context };
}
