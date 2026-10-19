import { PATTERNS, PLACEMENT, CX_IDS } from './patterns.js';

/**
 * Daily Coach: the skill model and the session builder. Pure functions (no React, no browser), so
 * scripts/coach-check.mjs can test them in Node.
 *
 * The coach stores only what happened, as events, never a computed score:
 *   { id, t, k: 'accept', s, first, hints }   a judged problem accepted (first = no failed submission before)
 *   { id, t, k: 'fail', s }                   a failed submission (at most one per problem per day)
 *   { id, t, k: 'drill', s, pat, cx }         a recognition drill: pattern right? complexity right? (cx null = not asked)
 *   { id, t, k: 'resolve', s, pass }          a re-solve from memory
 * Everything else is derived by replaying them, in time order, together with the solved list and
 * the lesson quizzes the learner already has. Two devices merge by uniting their events.
 *
 * Mastery per pattern (0–1) moves towards each piece of evidence by its weight and fades between
 * evidence towards a floor: half of what is above the floor is gone after `s` days. Success after a
 * gap of a day or more doubles `s`; a clear failure shrinks it.
 */
export const DAY = 86_400_000;
const FLOOR = 0.3;
const START_STABILITY = 7;
const MAX_STABILITY = 180;
const MIN_STABILITY = 3;

export const STRONG = 0.7;
export const SHAKY = 0.45;

/** Days to the next re-solve after each successive pass; a fail brings it back in FAIL_GAP days. */
export const RESOLVE_GAPS = [3, 7, 18, 45, 110];
export const FAIL_GAP = 2;
export const DRILLS_PER_DAY = 3;
export const RESOLVE_MINUTES = 15;
export const DRILL_SECONDS = 60;
const REDRILL_DAYS = 30;

/** [value, weight] of each kind of evidence. */
export const EVIDENCE = {
  acceptClean: [1, 0.45],      // accepted, first try, no hints
  accept: [0.75, 0.3],         // accepted after failures or with hints
  fail: [0.2, 0.12],
  drillBoth: [1, 0.25],        // pattern and complexity right
  drillPattern: [0.7, 0.2],    // pattern right, complexity wrong
  drillWrong: [0, 0.25],       // pattern wrong
  resolvePass: [1, 0.55],
  resolveFail: [0.1, 0.45],
  solvedElsewhere: [0.6, 0.2], // on the solved list without an accept the coach saw (LeetCode, ticked, before the coach)
  quizRight: [1, 0.08],
  quizWrong: [0, 0.08],
};

const LEVEL = { Easy: 0, Medium: 1, Hard: 2 };

/** A small deterministic hash for picks that must stay the same all day, on every device. */
export function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

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

function shuffle(list, seed) {
  const r = rng(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const fresh = () => ({ m: 0, s: START_STABILITY, t: null, n: 0 });

/** Mastery now, after fading since the last evidence. */
export function retention(st, now) {
  if (!st?.n || st.t == null) return 0;
  const half = 2 ** (-Math.max(0, now - st.t) / (st.s * DAY));
  return st.m * (FLOOR + (1 - FLOOR) * half);
}

function apply(st, t, [v, w]) {
  const e = retention(st, t);
  const gapDays = st.t == null ? 0 : (t - st.t) / DAY;
  let s = st.s;
  if (v >= 0.7 && st.n > 0 && gapDays >= 1) s = Math.min(MAX_STABILITY, s * 2);
  if (v < 0.4) s = Math.max(MIN_STABILITY, s * 0.6);
  return { m: e + w * (v - e), s, t, n: st.n + 1 };
}

export function labelOf(st, now) {
  if (!st?.n) return 'Not started';
  const e = retention(st, now);
  return e >= STRONG ? 'Strong' : e >= SHAKY ? 'Shaky' : 'Weak';
}

const timeOf = (v) => (typeof v === 'number' ? v : Date.parse(v) || 0);
const solvedAt = (v) => timeOf(typeof v === 'string' ? v : v?.at);

/**
 * The learner's skill model.
 *   events     the coach's own events
 *   solved     { slug: { at, by } | ISO }  (useSolved)
 *   quiz       { lessonKey: { id: { first, at } } }  (lesson quizzes)
 *   patternOf  slug → pattern id, or undefined for problems the coach doesn't know
 *   startedAt  when the coach was first opened (spreads out re-solves of earlier solves)
 * Returns { patterns: { id: { m, s, t, n } }, schedule: { slug: { idx, due } }, solved: Set,
 *           lastAccept: { slug: t }, lastDrill: { slug: t }, evidence: count }.
 */
export function buildModel({ events = [], solved = {}, quiz = {}, patternOf, startedAt, now = Date.now() }) {
  const patterns = Object.fromEntries(Object.keys(PATTERNS).map((p) => [p, fresh()]));
  const items = [];
  const accepted = new Set();
  for (const e of events) if (e.k === 'accept' || (e.k === 'resolve' && e.pass)) accepted.add(e.s);

  for (const e of events) {
    const p = patternOf(e.s);
    if (!p || !patterns[p]) continue;
    const ev = e.k === 'accept' ? (e.first && !e.hints ? EVIDENCE.acceptClean : EVIDENCE.accept)
      : e.k === 'fail' ? EVIDENCE.fail
        : e.k === 'drill' ? (!e.pat ? EVIDENCE.drillWrong : e.cx === false ? EVIDENCE.drillPattern : EVIDENCE.drillBoth)
          : e.k === 'resolve' ? (e.pass ? EVIDENCE.resolvePass : EVIDENCE.resolveFail)
            : null;
    if (ev) items.push({ t: e.t, p, ev });
  }
  for (const [slug, v] of Object.entries(solved)) {
    const p = patternOf(slug);
    if (!p || accepted.has(slug)) continue;
    items.push({ t: solvedAt(v), p, ev: EVIDENCE.solvedElsewhere });
  }
  for (const [lessonKey, answers] of Object.entries(quiz)) {
    const id = /(?:^|\/)patterns\/([a-z0-9-]+)$/.exec(lessonKey)?.[1];
    if (!id || !patterns[id]) continue;
    for (const a of Object.values(answers ?? {})) items.push({ t: timeOf(a.at), p: id, ev: a.first ? EVIDENCE.quizRight : EVIDENCE.quizWrong });
  }
  items.sort((a, b) => a.t - b.t);
  for (const it of items) patterns[it.p] = apply(patterns[it.p], it.t, it.ev);

  // ---- re-solve schedule
  const schedule = {};
  const lastAccept = {};
  const lastDrill = {};
  const ordered = [...events].sort((a, b) => a.t - b.t);
  for (const e of ordered) {
    if (!patternOf(e.s)) continue;
    if (e.k === 'drill') lastDrill[e.s] = e.t;
    if (e.k === 'accept') {
      lastAccept[e.s] = e.t;
      if (!schedule[e.s]) schedule[e.s] = { idx: 0, due: e.t + RESOLVE_GAPS[0] * DAY };
    }
    if (e.k === 'resolve') {
      const cur = schedule[e.s] ?? { idx: 0, due: e.t };
      if (e.pass) {
        lastAccept[e.s] = e.t;
        const idx = Math.min(cur.idx + 1, RESOLVE_GAPS.length - 1);
        schedule[e.s] = { idx, due: e.t + RESOLVE_GAPS[idx] * DAY };
      } else {
        schedule[e.s] = { idx: 0, due: e.t + FAIL_GAP * DAY };
      }
    }
  }
  // problems solved before the coach (or elsewhere) come due spread over the next two weeks
  const base = startedAt ?? now;
  for (const [slug, v] of Object.entries(solved)) {
    if (!patternOf(slug) || schedule[slug]) continue;
    schedule[slug] = { idx: 0, due: Math.max(base, solvedAt(v)) + ((hash(slug) % 14) + 1) * DAY };
  }

  const solvedSet = new Set([...Object.keys(solved), ...accepted]);
  return { patterns, schedule, solved: solvedSet, lastAccept, lastDrill, evidence: items.length };
}

/** Effective mastery of every pattern now: { id: 0..1 }. */
export const snapshot = (model, now) => Object.fromEntries(Object.entries(model.patterns).map(([p, st]) => [p, Math.round(retention(st, now) * 1000) / 1000]));

/**
 * Four complexity answers in scale order: the right class, the one just below and just above it,
 * and one more within three steps, varied by the day (so the brute-force O(n²) can show up next to
 * an O(n) answer). At the ends of the scale the nearest classes fill in.
 */
export function cxOptions(id, seed = 0) {
  const i = CX_IDS.indexOf(id);
  if (i < 0) return null;
  const pick = new Set([id]);
  for (const j of [i - 1, i + 1]) if (CX_IDS[j]) pick.add(CX_IDS[j]);
  const extra = shuffle(CX_IDS.filter((c, j) => !pick.has(c) && Math.abs(j - i) <= 3), seed);
  for (const c of extra) { if (pick.size >= 4) break; pick.add(c); }
  for (const c of [...CX_IDS].sort((a, b) => Math.abs(CX_IDS.indexOf(a) - i) - Math.abs(CX_IDS.indexOf(b) - i))) { if (pick.size >= 4) break; pick.add(c); }
  return CX_IDS.filter((c) => pick.has(c));
}

/** Four pattern answers: the right one and three it is often confused with, shuffled for the day. */
export function patternOptions(pattern, seed) {
  const wrong = shuffle(PATTERNS[pattern].confused, seed).slice(0, 3);
  return shuffle([pattern, ...wrong], seed + 1);
}

/**
 * Today's session.
 *   catalog   { order: [pattern ids, curriculum order], byPattern: { p: [slug, …] (ladder order) },
 *               problems: { slug: { title, level, pattern } }, cx: { slug: [class|null, exact] } }
 *   placement true on a learner's first session with no evidence yet: 10 drills across core patterns
 * Returns { date, createdAt, placement, start, drills: [{ slug, options, cxOptions }], resolve, stretch }.
 */
export function buildSession({ model, catalog, date, now = Date.now(), placement = false }) {
  const seedOf = (s) => hash(`${date}:${s}`);
  const isSolved = (s) => model.solved.has(s);
  const recentlyDrilled = (s) => model.lastDrill[s] != null && now - model.lastDrill[s] < REDRILL_DAYS * DAY;
  const eff = (p) => retention(model.patterns[p], now);
  const byLevel = (a, b) => LEVEL[catalog.problems[a].level] - LEVEL[catalog.problems[b].level];
  const taken = new Set();

  const pickDrill = (p) => {
    const list = catalog.byPattern[p] ?? [];
    const pick = (ok) => [...list].filter((s) => !taken.has(s) && ok(s)).sort(byLevel)[0];
    return pick((s) => !isSolved(s) && !recentlyDrilled(s)) ?? pick((s) => !recentlyDrilled(s)) ?? null;
  };

  const started = catalog.order.filter((p) => model.patterns[p]?.n > 0);
  const weakestFirst = [...started].sort((a, b) => eff(a) - eff(b));
  const fresh = catalog.order.filter((p) => !model.patterns[p]?.n);

  let drillPatterns;
  if (placement) drillPatterns = PLACEMENT;
  else drillPatterns = [...weakestFirst, ...fresh];
  const want = placement ? PLACEMENT.length : DRILLS_PER_DAY;
  const drills = [];
  for (const p of drillPatterns) {
    if (drills.length >= want) break;
    const slug = pickDrill(p);
    if (!slug) continue;
    taken.add(slug);
    const cls = catalog.cx[slug]?.[0] ?? null;
    drills.push({ slug, options: patternOptions(p, seedOf(slug)), cxOptions: cls ? cxOptions(cls, seedOf(slug) + 2) : null });
  }

  // re-solve: the most overdue solved problem, not accepted in the last two days
  let resolve = null;
  for (const [slug, sch] of Object.entries(model.schedule)) {
    if (sch.due > now || taken.has(slug) || !catalog.problems[slug]) continue;
    if (model.lastAccept[slug] != null && now - model.lastAccept[slug] < 2 * DAY) continue;
    if (!resolve || sch.due < resolve.due) resolve = { slug, due: sch.due };
  }
  if (resolve) taken.add(resolve.slug);

  // stretch: one level above the learner's best in their weakest pattern below Shaky (else their weakest)
  let stretch = null;
  const below = weakestFirst.filter((p) => eff(p) < SHAKY);
  for (const p of [...below, ...weakestFirst, ...fresh]) {
    const list = catalog.byPattern[p] ?? [];
    const best = Math.max(-1, ...list.filter(isSolved).map((s) => LEVEL[catalog.problems[s].level]));
    const target = Math.min(best + 1, 2);
    const lvl = (s) => LEVEL[catalog.problems[s].level];
    // closest to the target level; between two equally close, the harder one; then ladder order
    const slug = list.filter((s) => !isSolved(s) && !taken.has(s))
      .sort((a, b) => Math.abs(lvl(a) - target) - Math.abs(lvl(b) - target) || lvl(b) - lvl(a))[0];
    if (slug) {
      stretch = { slug, pattern: p, reason: below.includes(p) ? 'weak' : started.includes(p) ? 'weakest' : 'new' };
      break;
    }
  }

  return { date, createdAt: now, placement, start: snapshot(model, now), drills, resolve, stretch };
}

/** Patterns whose mastery changed since the session started: [{ pattern, from, to }], biggest change first. */
export function changesSince(session, model, now) {
  const nowSnap = snapshot(model, now);
  return Object.keys(nowSnap)
    .map((p) => ({ pattern: p, from: session.start?.[p] ?? 0, to: nowSnap[p] }))
    .filter((c) => Math.abs(c.to - c.from) >= 0.01)
    .sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from));
}
