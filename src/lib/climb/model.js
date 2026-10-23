import { dayKey } from '../dates.js';
import { CORE } from '../../data/companies.js';

/**
 * Climb: rated problem solving. Pure functions (no React, no browser), so scripts/climb-check.mjs can
 * test them in Node.
 *
 * Every judged problem has a rating; so does the learner in each DSA pattern. A pattern's rating is the
 * one that best explains all of the learner's attempts in it (problem ratings and how each went), pulled
 * towards START_RATING while there are few attempts and never far above the hardest problem solved there.
 * The overall rating is the average over a readiness set: the core interview patterns plus the target
 * company's focus patterns, a pattern not yet rated counting as START_RATING. So a high overall rating
 * needs breadth: one strong pattern moves it by a tenth or less. The next problem is picked a little
 * above the learner's rating in its pattern, where they solve it most of the time but not always.
 * A rated attempt is the learner's first go at a problem from the Climb page, against a time limit:
 *
 *   attempt event { id, t, s, p, pr, lim, ms, ok, fails, hints, peek?, gave?, seen? }
 *     t        when it ended            s, p   problem slug and its pattern
 *     pr       the problem's rating     lim    time limit in minutes     ms   time taken
 *     ok       accepted                 fails  failed submissions first  hints  hints shown
 *     peek     ended by opening the Solution tab     gave  given up (or left open for ABANDON_HOURS)
 *     seen     solved before Climb (long ago): rated a little easier
 *
 * Only these events are stored; ratings are worked out by replaying them, so two devices merge by
 * uniting their events. Problem ratings start from the ladders (level and position) and can be
 * recalibrated from every learner's results (calibrate, run from the admin page).
 */
export const TIME_LIMIT = { Easy: 20, Medium: 35, Hard: 50 };
export const LEVEL_BAND = { Easy: [1000, 1300], Medium: [1400, 1700], Hard: [1800, 2200] };
export const START_RATING = 1000;   // a pattern with no rated attempts, and the prior every pattern starts from
const PRIOR_SD = 350;                  // how firmly few attempts are held near START_RATING
const CEILING = 100;                   // a pattern's rating stays within this of the hardest problem solved in it
export const FLOOR_RATING = 400;
export const ABANDON_HOURS = 72;
export const DEFAULT_GOAL = 3;
export const SEEN_DAYS = 30;          // a problem solved this long ago may come back, rated SEEN_DISCOUNT easier
export const SEEN_DISCOUNT = 150;
export const AIM = 30;                 // pick problems this far above the learner's rating

/** What a rating means, in our own words (a guide, not a promise). */
export const TIERS = [
  { min: 0, label: 'Warming up' },
  { min: 1300, label: 'Easy problems are routine' },
  { min: 1500, label: 'Comfortable with mediums' },
  { min: 1700, label: 'Strong on mediums' },
  { min: 1900, label: 'Takes on hards' },
  { min: 2100, label: 'Top of the ladder' },
];
export const tierOf = (r) => [...TIERS].reverse().find((t) => r >= t.min);

/**
 * Our guide to the overall rating that is comfortable for each interview style (data/companies.js STYLES).
 * Ratings are conservative (each pattern has a short ladder and few attempts are held near the start), so
 * in simulation a learner's overall rating ends 100–200 below their true level: the targets allow for that.
 */
export const STYLE_TARGET = { bank: 1400, practical: 1400, machine: 1450, systems: 1500, bigtech: 1600, quant: 1800 };
export const GENERAL_TARGET = 1500;

/** Starting problem ratings: the level's band, spread by ladder position, nudged by where the pattern sits in the course. */
export function seedRatings(catalog) {
  const out = {};
  const n = catalog.order.length;
  catalog.order.forEach((pattern, i) => {
    const offset = n > 1 ? Math.round(-60 + (150 * i) / (n - 1)) : 0;
    const slugs = catalog.byPattern[pattern] ?? [];
    for (const level of Object.keys(LEVEL_BAND)) {
      const [lo, hi] = LEVEL_BAND[level];
      const of = slugs.filter((s) => catalog.problems[s].level === level);
      of.forEach((slug, k) => { out[slug] = Math.round(lo + ((hi - lo) * (k + 0.5)) / of.length + offset); });
    }
  });
  return out;
}

export const expected = (r, pr) => 1 / (1 + 10 ** ((pr - r) / 400));

/** How well an attempt went, 0–1: accepted first try, without hints and in time is 1. */
export function scoreOf(a) {
  if (!a.ok) return 0;
  let s = 1 - 0.1 * Math.min(a.fails ?? 0, 3) - 0.15 * Math.min(a.hints ?? 0, 2);
  const over = a.lim ? a.ms / (a.lim * 60000) : 0;
  if (over > 1.5) s -= 0.25;
  else if (over > 1) s -= 0.15;
  return Math.max(0.4, Math.round(s * 100) / 100);
}

const effective = (a) => a.pr - (a.seen ? SEEN_DISCOUNT : 0);

/** The patterns the overall rating averages over: the core ones and the target company's focus. */
export const readinessSet = (focus = []) => [...new Set([...CORE, ...focus])];

/**
 * A pattern's rating from its attempts [{ pr, score, ok }]: the most likely rating given every result
 * (a logistic model, as in expected()), with a normal prior around START_RATING, capped at CEILING above
 * the hardest problem solved. Doesn't depend on the order of the attempts.
 */
export function patternRating(attempts) {
  if (!attempts.length) return START_RATING;
  const c = Math.LN10 / 400;
  // the slope of the log-likelihood plus prior falls as r rises: find where it crosses zero
  const slope = (r) => c * attempts.reduce((n, a) => n + a.score - expected(r, a.pr), 0) - (r - START_RATING) / PRIOR_SD ** 2;
  let lo = FLOOR_RATING;
  let hi = 3000;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (slope(mid) > 0) lo = mid; else hi = mid;
  }
  const solved = attempts.filter((a) => a.ok).map((a) => a.pr);
  const cap = Math.max(START_RATING, ...solved) + CEILING;
  return Math.round(Math.min((lo + hi) / 2, cap));
}

const average = (patterns, set) => Math.round(set.reduce((n, p) => n + (patterns[p]?.r ?? START_RATING), 0) / set.length);

/**
 * Replay attempts into ratings. `set` is the readiness set (readinessSet).
 * Returns { rating, peak, n, set, rated, history: [{ t, s, p, r, d, pr, pd, score, ok }],
 *           patterns: { p: { r, n, peak } }, run, bestRun, byDay: { day: n }, attempted: Set }
 * where r/d are the overall rating and its change, pr/pd the pattern's.
 */
export function replay(events = [], set = readinessSet()) {
  const sorted = [...events].sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1));
  let rating = START_RATING;
  let peak = START_RATING;
  let run = 0;
  let bestRun = 0;
  const patterns = {};
  const results = {};
  const history = [];
  const byDay = {};
  const attempted = new Set();
  for (const a of sorted) {
    if (attempted.has(a.s)) continue;           // one rated attempt per problem
    attempted.add(a.s);
    const score = scoreOf(a);
    const before = rating;
    let pr = null;
    let pd = 0;
    if (a.p) {
      const was = patterns[a.p]?.r ?? START_RATING;
      (results[a.p] ??= []).push({ pr: effective(a), score, ok: a.ok });
      pr = patternRating(results[a.p]);
      pd = pr - was;
      patterns[a.p] = { r: pr, n: results[a.p].length, peak: Math.max(patterns[a.p]?.peak ?? 0, pr) };
      rating = average(patterns, set);
    }
    peak = Math.max(peak, rating);
    run = score >= 0.9 ? run + 1 : 0;
    bestRun = Math.max(bestRun, run);
    const day = dayKey(new Date(a.t));
    byDay[day] = (byDay[day] ?? 0) + 1;
    history.push({ t: a.t, s: a.s, p: a.p, r: rating, d: rating - before, pr, pd, score, ok: a.ok });
  }
  const rated = set.filter((p) => patterns[p]).length;
  return { rating, peak, n: history.length, set, rated, history, patterns, run, bestRun, byDay, attempted };
}

/** Change to the rating from the attempt at `slug` (null if it wasn't rated). */
export const deltaOf = (model, slug) => model.history.find((h) => h.s === slug) ?? null;

/** A small deterministic generator, so a pick is the same on every device until it is started. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Candidates in a pattern: unsolved problems never rated, then (only if there are none) problems
 * solved at least SEEN_DAYS ago that were never rated.
 */
function candidates(pattern, { catalog, model, solvedAt, now }) {
  const slugs = (catalog.byPattern[pattern] ?? []).filter((s) => !model.attempted.has(s));
  const fresh = slugs.filter((s) => solvedAt(s) == null);
  if (fresh.length) return fresh.map((s) => ({ slug: s, seen: false }));
  return slugs.filter((s) => now - solvedAt(s) >= SEEN_DAYS * 86400000).map((s) => ({ slug: s, seen: true }));
}

/**
 * The next problem.
 *   pattern   a pattern to focus on, or null to mix
 *   studied   Set of patterns the learner has met (a mix only draws from these)
 *   focus     the target company's focus patterns (weighted up in a mix)
 *   solvedAt  slug → ms when solved, or null
 *   ratings   problem ratings
 * Returns { slug, pattern, pr, lim, title, level, seen } or { empty: 'study' | 'pattern' }.
 */
export function pickNext({ catalog, model, ratings, pattern = null, studied = new Set(), focus = [], solvedAt = () => null, seed = 0, now = Date.now() }) {
  const ctx = { catalog, model, solvedAt, now };
  let p = pattern;
  if (!p) {
    const pool = catalog.order.filter((x) => studied.has(x) && candidates(x, ctx).length);
    if (!pool.length) return { empty: 'study' };
    // weaker patterns, patterns not rated yet, the readiness set and the company's focus come up more often
    const rated = Object.values(model.patterns);
    const mean = rated.length ? rated.reduce((n, st) => n + st.r, 0) / rated.length : START_RATING;
    const weights = pool.map((x) => {
      const st = model.patterns[x];
      const gap = st ? Math.max(0, (mean - st.r) / 100) : 0.75;
      return 1 + gap + (model.set?.includes(x) ? 1 : 0) + (focus.includes(x) ? 1 : 0);
    });
    let roll = rng(seed)() * weights.reduce((a, b) => a + b, 0);
    p = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i += 1) {
      roll -= weights[i];
      if (roll < 0) { p = pool[i]; break; }
    }
  }
  const list = candidates(p, ctx);
  if (!list.length) return { empty: 'pattern', pattern: p };
  const target = (model.patterns[p]?.r ?? START_RATING) + AIM;
  const order = catalog.byPattern[p];
  const prOf = (c) => (ratings[c.slug] ?? START_RATING) - (c.seen ? SEEN_DISCOUNT : 0);
  const best = [...list].sort((a, b) => Math.abs(prOf(a) - target) - Math.abs(prOf(b) - target) || order.indexOf(a.slug) - order.indexOf(b.slug))[0];
  const info = catalog.problems[best.slug];
  return { slug: best.slug, pattern: p, pr: ratings[best.slug] ?? START_RATING, lim: TIME_LIMIT[info.level] ?? 35, title: info.title, level: info.level, seen: best.seen };
}

/**
 * The problem in `pattern` (not in `exclude`) that best fits the learner now: used by Runway to fill a
 * day's problem slot. Unsolved problems only; null when the pattern has none left.
 */
export function bestFit({ catalog, model, ratings, pattern, exclude = new Set(), solvedAt = () => null }) {
  const list = (catalog.byPattern[pattern] ?? []).filter((s) => !exclude.has(s) && solvedAt(s) == null && !model.attempted.has(s));
  if (!list.length) return null;
  const target = (model.patterns[pattern]?.r ?? START_RATING) + AIM;
  const order = catalog.byPattern[pattern];
  return [...list].sort((a, b) => Math.abs((ratings[a] ?? START_RATING) - target) - Math.abs((ratings[b] ?? START_RATING) - target) || order.indexOf(a) - order.indexOf(b))[0];
}

/** Minutes the learner really takes per planned minute on problems (median of accepted attempts), or 1. */
export function speedFactor(events = [], min = 5) {
  const r = events.filter((e) => e.ok && e.lim && e.ms > 0).map((e) => e.ms / (e.lim * 60000)).sort((a, b) => a - b);
  if (r.length < min) return 1;
  const mid = r.length % 2 ? r[(r.length - 1) / 2] : (r[r.length / 2 - 1] + r[r.length / 2]) / 2;
  return Math.round(Math.max(0.6, Math.min(1.6, mid)) * 20) / 20;
}

/** An attempt left open too long ends as given up (at its deadline). Returns the event, or null. */
export function expired(active, now) {
  if (!active || now - active.t < ABANDON_HOURS * 3600000) return null;
  const t = active.t + ABANDON_HOURS * 3600000;
  return { id: `x-${active.s}-${active.t}`, t, s: active.s, p: active.p, pr: active.pr, lim: active.lim, ms: t - active.t, ok: false, fails: active.fails ?? 0, hints: active.hints ?? 0, gave: true, ...(active.seen ? { seen: true } : {}) };
}

/**
 * Recalibrated problem ratings from every learner's attempts: for each problem with at least
 * `minAttempts` rated attempts, the rating at which the learners' expected scores match what they
 * really scored, pulled towards the starting rating while there is little evidence.
 *   users  [[attempt event]] one list per learner
 *   seeds  starting ratings (seedRatings)
 * Returns { slug: rating } for the problems with enough evidence.
 */
export function calibrate({ users = [], seeds = {}, minAttempts = 8 }) {
  const by = {};
  for (const events of users) {
    const model = replay(events);
    for (const h of model.history) {
      const e = events.find((x) => x.s === h.s && x.t === h.t);
      if (!e || e.seen || h.pr == null) continue;
      // the learner's rating in that pattern just before the attempt
      (by[h.s] ??= []).push({ rb: h.pr - h.pd, score: h.score });
    }
  }
  const out = {};
  for (const [slug, list] of Object.entries(by)) {
    if (list.length < minAttempts || seeds[slug] == null) continue;
    const mean = list.reduce((n, x) => n + x.score, 0) / list.length;
    // learners' expected score falls as the problem rating rises: find where it meets the real mean
    let lo = 400;
    let hi = 3000;
    for (let i = 0; i < 40; i += 1) {
      const mid = (lo + hi) / 2;
      const exp = list.reduce((n, x) => n + expected(x.rb, mid), 0) / list.length;
      if (exp > mean) lo = mid; else hi = mid;
    }
    const fit = (lo + hi) / 2;
    const w = list.length / (list.length + 20);
    out[slug] = Math.round(seeds[slug] + (fit - seeds[slug]) * w);
  }
  return out;
}
