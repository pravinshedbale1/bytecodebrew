import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createSyncedStore } from '../syncedStore';
import { logActivity } from '../../hooks/useActivity';
import { useSolved } from '../../hooks/useSolved';
import { useProgress } from '../../hooks/useProgress';
import { useRunway } from '../../hooks/useRunway';
import { companyPlan } from '../../data/companies';
import calibrated from '../../data/climbRatings.json';
import { catalog } from '../coach/catalog';
import { today, daySeed } from '../dates';
import { isViewingAs } from '../viewAs';
import { replay, seedRatings, pickNext, bestFit, expired, speedFactor, DEFAULT_GOAL, AIM, START_RATING } from './model.js';

/**
 * Climb's synced store (Premium): { goal, active, events }.
 *   goal    rated problems a day the learner aims for
 *   active  the attempt in progress { s, p, pr, lim, t (start), fails, hints, seen } or null
 *   events  finished attempts (see model.js)
 * Two devices merge by uniting events; the newer open attempt wins unless it has already ended.
 */
export const seeds = seedRatings(catalog);
/** Problem ratings: the starting ones, replaced by recalibrated ones (src/data/climbRatings.json) where there are any. */
export const ratings = { ...seeds, ...calibrated };

const store = createSyncedStore({
  name: 'climb',
  storageKey: 'bcb:climb',
  initial: { goal: DEFAULT_GOAL, active: null, events: [] },
  merge: (local, remote) => {
    const byId = new Map();
    for (const e of [...(remote.events ?? []), ...(local.events ?? [])]) byId.set(e.id, e);
    const events = [...byId.values()].sort((a, b) => a.t - b.t);
    const open = [local.active, remote.active].filter(Boolean).sort((a, b) => b.t - a.t);
    let active = open[0] ?? null;
    if (active && events.some((e) => e.s === active.s && e.t >= active.t)) active = null;
    const twin = active && open.find((a) => a !== active && a.s === active.s && a.t === active.t);
    if (twin) active = { ...active, fails: Math.max(active.fails ?? 0, twin.fails ?? 0), hints: Math.max(active.hints ?? 0, twin.hints ?? 0) };
    return { goal: local.goal ?? remote.goal ?? DEFAULT_GOAL, active, events };
  },
});

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const getClimb = () => store.get();

/** Start a rated attempt on a pick from pickNext. Does nothing while another attempt is open. */
export function startAttempt(pick) {
  store.set((prev) => (prev.active ? prev : {
    ...prev,
    active: { s: pick.slug, p: pick.pattern, pr: pick.pr, lim: pick.lim, t: Date.now(), fails: 0, hints: 0, ...(pick.seen ? { seen: true } : {}) },
  }));
}

/** A failed submission or a hint shown during the open attempt on `slug`. */
export function noteAttempt(slug, kind) {
  const field = kind === 'hint' ? 'hints' : 'fails';
  store.set((prev) => (prev.active?.s === slug ? { ...prev, active: { ...prev.active, [field]: (prev.active[field] ?? 0) + 1 } } : prev));
}

/** End the open attempt on `slug`: { ok } when accepted, { peek } or { gave } otherwise. Returns the event, or null. */
export function finishAttempt(slug, outcome) {
  const a = store.get().active;
  if (a?.s !== slug) return null;
  const t = Date.now();
  const event = {
    id: newId(), t, s: a.s, p: a.p, pr: a.pr, lim: a.lim, ms: t - a.t, ok: Boolean(outcome.ok), fails: a.fails ?? 0, hints: a.hints ?? 0,
    ...(outcome.peek ? { peek: true } : {}), ...(outcome.gave ? { gave: true } : {}), ...(a.seen ? { seen: true } : {}),
  };
  store.set((prev) => (prev.active?.s === slug ? { ...prev, active: null, events: [...prev.events, event] } : prev));
  logActivity('climb');
  return event;
}

export function setGoal(goal) {
  store.set((prev) => ({ ...prev, goal: Math.max(1, Math.min(10, Math.round(goal))) }));
}

const solvedTime = (v) => (v == null ? null : Date.parse(typeof v === 'string' ? v : v.at) || 0);

/**
 * Climb for a page: the store, the replayed model, today's count, and what to pick from. An attempt
 * left open longer than ABANDON_HOURS ends here as given up.
 */
export function useClimb() {
  const state = useSyncExternalStore(store.subscribe, store.get);
  const model = useMemo(() => replay(state.events), [state.events]);
  const { solved } = useSolved();
  const { isComplete } = useProgress();
  const plan = useRunway();
  const company = plan?.settings?.company ? companyPlan(plan.settings.company) : null;

  useEffect(() => {
    const e = expired(state.active, Date.now());
    if (!e || isViewingAs()) return;
    store.set((prev) => (prev.active?.t === state.active.t ? { ...prev, active: null, events: [...prev.events, e] } : prev));
  }, [state.active]);

  // patterns the learner has met: the lesson is done, or a problem in it is solved or rated
  const studied = useMemo(() => {
    const out = new Set();
    for (const p of catalog.order) {
      if (isComplete(`dsa/patterns/${p}`) || (catalog.byPattern[p] ?? []).some((s) => solved[s] || model.attempted.has(s))) out.add(p);
    }
    return out;
  }, [isComplete, solved, model]);

  const solvedAt = useMemo(() => (slug) => solvedTime(solved[slug]), [solved]);
  const next = (pattern = null) => pickNext({
    catalog, model, ratings, pattern, studied, focus: company?.focus ?? [], solvedAt,
    seed: daySeed(today()) + model.n * 7919 + (pattern ? pattern.length : 0),
  });

  return {
    state, model, active: state.active, goal: state.goal ?? DEFAULT_GOAL, todayCount: model.byDay[today()] ?? 0,
    studied, company, next, solvedAt,
  };
}

/** What Runway needs from Climb: the learner's measured speed and a best-fitting problem for a slot. */
export function climbForRunway(state, solved) {
  const model = replay(state.events);
  const solvedAt = (slug) => solvedTime(solved[slug]);
  return {
    speed: speedFactor(state.events),
    // only once the learner has rated attempts in the pattern: before that the ladder order is the better guide
    pick: (task, planned) => {
      const p = catalog.problems[task.ref]?.pattern;
      if (!p || !model.patterns[p]) return null;
      const exclude = new Set(planned);
      exclude.delete(task.ref);
      const slug = bestFit({ catalog, model, ratings, pattern: p, exclude, solvedAt });
      if (!slug || slug === task.ref) return null;
      // swap only for a clearly better fit (50 rating points closer to where the learner is)
      const target = model.patterns[p].r + AIM;
      const off = (s) => Math.abs((ratings[s] ?? START_RATING) - target);
      if (off(slug) + 50 > off(task.ref)) return null;
      const info = catalog.problems[slug];
      const lessonTitle = catalog.titles[p] ?? p;
      return { id: `problem:${slug}`, ref: slug, title: info.title, sub: `${info.level} · ${lessonTitle}`, path: `/solve/${slug}`, minutes: { Easy: 20, Medium: 35, Hard: 50 }[info.level] ?? 35, why: `Picked at your ${lessonTitle} rating (${model.patterns[p].r})` };
    },
  };
}

export const useClimbState = () => useSyncExternalStore(store.subscribe, store.get);
