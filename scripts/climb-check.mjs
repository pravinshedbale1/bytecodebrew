#!/usr/bin/env node
/**
 * Checks Climb (src/lib/climb/model.js): every judged problem has a sensible starting rating, attempts
 * are scored and replayed as the model says, picks stay near the learner's level and never repeat a
 * rated problem, a simulated learner's rating settles near their true skill, and recalibration moves a
 * mis-rated problem towards its real difficulty. Also checks src/data/climbRatings.json. Part of
 * `npm run check`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  seedRatings, scoreOf, replay, pickNext, bestFit, speedFactor, expired, calibrate, expected, deltaOf, tierOf,
  patternRating, readinessSet, START_RATING, TIME_LIMIT, ABANDON_HOURS, SEEN_DAYS, STYLE_TARGET,
} from '../src/lib/climb/model.js';
import { STYLES, CORE } from '../src/data/companies.js';
import { dsa } from '../src/curriculum/tracks/dsa.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(readFileSync(join(root, 'src/data/problems/index.json'), 'utf8'));
const calibrated = JSON.parse(readFileSync(join(root, 'src/data/climbRatings.json'), 'utf8'));
let failures = 0;
const check = (ok, msg) => { if (!ok) { failures += 1; console.log(`✗ ${msg}`); } };

// ---- the browser's catalogue (src/lib/coach/catalog.js), from the lesson ladders
const ROW = /^\|\s*(\d+)\s*\|\s*\[([^\]]+)\]\(https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?\)\s*\|\s*(Easy|Medium|Hard)\s*\|/gm;
const lessons = new Set(Object.values(index));
const order = dsa.courses.find((c) => c.id === 'patterns').modules.flatMap((m) => m.lessons.map((l) => l.id)).filter((id) => lessons.has(id));
const catalog = { order, byPattern: {}, problems: {} };
for (const id of order) {
  const text = readFileSync(join(root, `src/content/dsa/patterns/${id}.mdx`), 'utf8');
  for (const [, , title, slug, level] of text.matchAll(ROW)) {
    if (index[slug] !== id || catalog.problems[slug]) continue;
    catalog.problems[slug] = { title, level, pattern: id };
    (catalog.byPattern[id] ??= []).push(slug);
  }
}
check(order.length === lessons.size, `every pattern with judged problems is in course order (${order.length} of ${lessons.size})`);

// ---- starting ratings
const seeds = seedRatings(catalog);
for (const slug of Object.keys(index)) check(seeds[slug] >= 900 && seeds[slug] <= 2350, `${slug} has a starting rating in range (${seeds[slug]})`);
const avg = (level) => { const r = Object.entries(seeds).filter(([s]) => catalog.problems[s].level === level).map(([, r]) => r); return r.reduce((a, b) => a + b, 0) / r.length; };
check(avg('Easy') < avg('Medium') && avg('Medium') < avg('Hard'), 'easy < medium < hard on average');
for (const [slug, r] of Object.entries(calibrated)) {
  check(slug in index, `climbRatings.json: ${slug} is not a judged problem`);
  check(Number.isInteger(r) && r >= 400 && r <= 3000, `climbRatings.json: ${slug} has an odd rating ${r}`);
}
for (const style of Object.keys(STYLES)) check(STYLE_TARGET[style], `interview style ${style} has a Climb target`);
check(tierOf(1250).label && tierOf(2500).label, 'every rating has a tier');

// ---- scoring
check(scoreOf({ ok: true, fails: 0, hints: 0, ms: 60000, lim: 20 }) === 1, 'clean, first try, in time = 1');
check(scoreOf({ ok: true, fails: 1, hints: 1, ms: 60000, lim: 20 }) === 0.75, 'a fail and a hint cost 0.25');
check(scoreOf({ ok: true, fails: 0, hints: 0, ms: 25 * 60000, lim: 20 }) === 0.85, 'over time costs 0.15');
check(scoreOf({ ok: true, fails: 9, hints: 9, ms: 99 * 60000, lim: 20 }) === 0.4, 'an accepted solve never scores below 0.4');
check(scoreOf({ ok: false, peek: true }) === 0 && scoreOf({ ok: false, gave: true }) === 0, 'peeking at the solution or giving up scores 0');

// ---- replay
const T0 = Date.parse('2026-11-02T09:00:00');
let n = 0;
const ev = (s, pr, ok, extra = {}) => ({ id: `e${n}`, t: T0 + (n++) * 3600000, s, p: index[s], pr, lim: 35, ms: 20 * 60000, ok, fails: 0, hints: 0, ...extra });
const [a, b, c] = catalog.byPattern['two-pointers'];
const win = replay([ev(a, 1300, true)]);
check(win.rating > START_RATING && win.patterns['two-pointers'].r > START_RATING, 'a clean solve above your rating raises it, overall and in the pattern');
const loss = replay([ev(b, 1100, false, { gave: true })]);
check(loss.rating < START_RATING, 'giving up below your rating lowers it');
const events = [ev(a, 1300, true), ev(b, 1400, false, { peek: true }), ev(c, 1350, true, { hints: 1 })];
const m1 = replay(events);
check(m1.n === 3 && m1.attempted.has(a) && m1.history.length === 3, 'every attempt is in the history');
check(JSON.stringify(replay([...events].reverse())) === JSON.stringify(m1), 'replay does not depend on the order events arrive in');
check(replay([...events, { ...events[0], id: 'dup', t: events[0].t + 1 }]).n === 3, 'only the first attempt at a problem is rated');
check(m1.run === 0 && m1.bestRun === 1, 'a run counts clean solves in a row');
check(deltaOf(m1, a).d > 0 && deltaOf(m1, b).d < 0, 'deltaOf finds an attempt');
check(Object.values(m1.byDay).reduce((x, y) => x + y, 0) === 3, 'attempts are counted per day');

// ---- picking
const fresh = replay([]);
const ratings = seeds;
check(pickNext({ catalog, model: fresh, ratings, studied: new Set() }).empty === 'study', 'a mix needs at least one studied pattern');
const pick = pickNext({ catalog, model: fresh, ratings, studied: new Set(['hashing']) });
check(pick.pattern === 'hashing' && catalog.problems[pick.slug] && pick.lim === TIME_LIMIT[pick.level], 'a mix draws from studied patterns');
const target = START_RATING + 30;
const closest = Math.min(...catalog.byPattern.hashing.map((s) => Math.abs(ratings[s] - target)));
check(Math.abs(ratings[pick.slug] - target) === closest, 'the pick is the problem nearest just above your rating');
const focused = pickNext({ catalog, model: fresh, ratings, pattern: 'graph-traversal' });
check(focused.pattern === 'graph-traversal', 'focus mode stays in the chosen pattern');
const solvedNow = new Set(catalog.byPattern.hashing);
const allSolved = pickNext({ catalog, model: fresh, ratings, pattern: 'hashing', solvedAt: (s) => (solvedNow.has(s) ? Date.now() : null) });
check(allSolved.empty === 'pattern', 'recently solved problems are never rated');
const longAgo = pickNext({ catalog, model: fresh, ratings, pattern: 'hashing', solvedAt: (s) => (solvedNow.has(s) ? Date.now() - (SEEN_DAYS + 1) * 86400000 : null) });
check(longAgo.seen === true, 'problems solved long ago come back when a pattern has nothing new');
const ratedAll = replay(catalog.byPattern.hashing.map((s) => ev(s, ratings[s], true)));
check(pickNext({ catalog, model: ratedAll, ratings, pattern: 'hashing' }).empty === 'pattern', 'a rated problem is never picked again');
const mixSeeds = new Set(Array.from({ length: 40 }, (_, i) => pickNext({ catalog, model: fresh, ratings, studied: new Set(['hashing', 'two-pointers', 'tree-dfs']), seed: i }).pattern));
check(mixSeeds.size === 3, 'a mix spreads over the studied patterns');
check(bestFit({ catalog, model: fresh, ratings, pattern: 'hashing', exclude: new Set([pick.slug]) }) !== pick.slug, 'bestFit honours exclusions');

// ---- the overall rating needs breadth
const clean = (s, p, i) => ({ id: `c${i}-${s}`, t: T0 + i * 60000, s, p, pr: ratings[s], lim: 35, ms: 600000, ok: true, fails: 0, hints: 0 });
{
  let model = replay([]);
  const evs = [];
  for (let i = 0; i < 4; i += 1) {
    const p = pickNext({ catalog, model, ratings, pattern: 'hashing', seed: i });
    evs.push(clean(p.slug, 'hashing', i));
    model = replay(evs);
  }
  check(model.rating < 1100 && model.patterns.hashing.r > 1300, `four clean solves in one pattern raise that pattern, barely the overall (hashing ${model.patterns.hashing.r}, overall ${model.rating})`);
  const two = replay(['hashing', 'two-pointers'].flatMap((p) => catalog.byPattern[p].map((s, i) => clean(s, p, i))));
  check(two.rating < 1250, `two patterns solved perfectly can't carry the rating (${two.rating})`);
  check(two.rated === 2 && two.set.length === CORE.length, 'the readiness set is the core patterns, two of them rated');
  const google = replay([], readinessSet(['shortest-paths', 'hashing']));
  check(google.set.length === CORE.length + 1, "a company's focus patterns join the set once");
}
for (const p of ['hashing', 'dp-linear']) {
  const evs = catalog.byPattern[p].map((s, i) => clean(s, p, i));
  const easiest = evs.filter((e) => catalog.problems[e.s].level === 'Easy');
  const r = replay(easiest).patterns[p]?.r ?? START_RATING;
  const hardest = Math.max(...easiest.map((e) => e.pr), START_RATING);
  check(r <= hardest + 100, `${p}: solving only easy problems caps the pattern near the hardest of them (${r} vs ${hardest})`);
}
const attempts = [{ pr: 1200, score: 1, ok: true }, { pr: 1500, score: 0, ok: false }, { pr: 1350, score: 0.75, ok: true }];
check(patternRating(attempts) === patternRating([...attempts].reverse()), 'a pattern rating does not depend on the order of attempts');
check(patternRating([]) === START_RATING && patternRating([{ pr: 1300, score: 0, ok: false }]) < START_RATING, 'no attempts = the start; a miss pulls below it');

// ---- simulated learners: the overall rating orders them by skill, conservatively
function rng(seed) { let s = seed; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }
const settled = {};
for (const skill of [1100, 1500, 1900]) {
  const r = rng(skill);
  const evs = [];
  let model = replay([]);
  for (let i = 0; i < 200; i += 1) {
    const p = pickNext({ catalog, model, ratings, studied: new Set(CORE), seed: i });
    if (p.empty) break;
    const ok = r() < expected(skill, p.pr);
    evs.push({ id: `s${skill}-${i}`, t: T0 + i * 3600000, s: p.slug, p: p.pattern, pr: p.pr, lim: p.lim, ms: 10 * 60000, ok, fails: 0, hints: 0 });
    model = replay(evs);
  }
  settled[skill] = model.rating;
  check(model.rating <= skill + 100 && model.rating >= skill - 250, `a learner at ${skill} who works through the core patterns is rated a little under it (${model.rating} after ${model.n})`);
}
check(settled[1100] < settled[1500] && settled[1500] < settled[1900], 'stronger learners rate higher');

// ---- speed, abandoned attempts
check(speedFactor([]) === 1, 'no speed until there are enough attempts');
const timed = (x) => ({ ok: true, lim: 20, ms: x * 20 * 60000 });
check(speedFactor([0.5, 0.8, 1.2, 1.4, 1.5].map(timed)) === 1.2, 'speed is the median of time taken over the limit');
check(speedFactor([3, 3, 3, 3, 3].map(timed)) === 1.6, 'speed is capped');
check(expired({ s: a, t: Date.now() }, Date.now()) === null, 'a fresh attempt stays open');
const ex = expired({ s: a, p: 'two-pointers', pr: 1300, lim: 35, t: T0 }, T0 + (ABANDON_HOURS + 1) * 3600000);
check(ex && ex.gave && !ex.ok && ex.t === T0 + ABANDON_HOURS * 3600000, `an attempt open over ${ABANDON_HOURS} hours ends as given up`);

// ---- recalibration: a problem seeded at 1500 that learners find as hard as a 1900 one
const slug = catalog.byPattern['dp-linear'][0];
const seedsHard = { ...seeds, [slug]: 1500 };
const r2 = rng(7);
// each learner first earns a rating in the pattern from its other problems, then meets this one
const others = catalog.byPattern['dp-linear'].filter((s) => s !== slug);
const users = Array.from({ length: 60 }, (_, u) => {
  const skill = 1300 + (u % 7) * 100;
  const history = others.map((s, i) => ({ id: `u${u}-${i}`, t: T0 + i * 60000, s, p: 'dp-linear', pr: seeds[s], lim: 35, ms: 600000, ok: r2() < expected(skill, seeds[s]), fails: 0, hints: 0 }));
  return [...history, { id: `u${u}`, t: T0 + 3600000, s: slug, p: 'dp-linear', pr: 1500, lim: 35, ms: 600000, ok: r2() < expected(skill, 1900), fails: 0, hints: 0 }];
});
const cal = calibrate({ users, seeds: seedsHard });
check(cal[slug] > 1650, `recalibration moves a too-low rating up (${cal[slug]})`);
check(!(slug in calibrate({ users: users.slice(0, 3), seeds: seedsHard })), 'too few attempts leave a rating alone');

console.log(failures ? `\n${failures} Climb check${failures === 1 ? '' : 's'} failed` : `✓ Climb: ${Object.keys(seeds).length} problem ratings, scoring, replay, picks, a simulated learner and recalibration`);
process.exit(failures ? 1 : 0);
