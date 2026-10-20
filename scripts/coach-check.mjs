#!/usr/bin/env node
/**
 * Checks the Daily Coach (src/lib/coach, src/data/coachProblems.js): the drill content covers every
 * judged problem with known classes and patterns, and the skill model and session builder behave as
 * the spec says, on simulated learners. Part of `npm run check`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import cxData from '../src/data/coachProblems.js';
import { PATTERNS, PLACEMENT, CX_IDS } from '../src/lib/coach/patterns.js';
import { buildModel, buildSession, retention, labelOf, cxOptions, changesSince, DAY, RESOLVE_GAPS, STRONG, SHAKY } from '../src/lib/coach/model.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(readFileSync(join(root, 'src/data/problems/index.json'), 'utf8'));
let failures = 0;
const check = (ok, msg) => { if (!ok) { failures += 1; console.log(`✗ ${msg}`); } };

// ---- content
for (const slug of Object.keys(index)) check(slug in cxData, `coachProblems.js has no entry for ${slug}`);
for (const [slug, [cls, exact]] of Object.entries(cxData)) {
  check(slug in index, `coachProblems.js: ${slug} is not a judged problem`);
  check(cls === null || CX_IDS.includes(cls), `coachProblems.js: ${slug} has unknown class ${cls}`);
  check(typeof exact === 'string' && exact.length > 0, `coachProblems.js: ${slug} has no exact complexity`);
}
const lessons = new Set(Object.values(index));
for (const l of lessons) check(PATTERNS[l], `patterns.js has no entry for pattern ${l}`);
for (const [p, v] of Object.entries(PATTERNS)) {
  check(lessons.has(p), `patterns.js: ${p} has no judged problems`);
  check(v.confused.length >= 3 && v.confused.every((c) => PATTERNS[c] && c !== p), `patterns.js: ${p} needs 3+ valid confusable patterns`);
}
for (const p of PLACEMENT) check(PATTERNS[p], `placement pattern ${p} is unknown`);

// ---- a catalogue like the browser's (ladder order and levels from the lesson tables)
const ROW = /^\|\s*(\d+)\s*\|\s*\[([^\]]+)\]\(https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?\)\s*\|\s*(Easy|Medium|Hard)\s*\|/gm;
const dir = join(root, 'src/content/dsa/patterns');
const catalog = { order: [], byPattern: {}, problems: {}, cx: cxData };
const order = JSON.parse(JSON.stringify([...lessons]));
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
  const id = file.slice(0, -4);
  for (const [, , title, slug, level] of readFileSync(join(dir, file), 'utf8').matchAll(ROW)) {
    if (index[slug] !== id || catalog.problems[slug]) continue;
    catalog.problems[slug] = { title, level, pattern: id };
    (catalog.byPattern[id] ??= []).push(slug);
  }
}
catalog.order = order;
for (const slug of Object.keys(index)) check(catalog.problems[slug], `${slug} is judged but not on its lesson's ladder`);

const patternOf = (s) => index[s];
const T0 = Date.parse('2026-10-01T09:00:00Z');
let n = 0;
const ev = (t, k, s, extra = {}) => ({ id: `e${n++}`, t, k, s, ...extra });

// ---- new learner: placement of 10 drills, all different patterns, no re-solve
{
  const m = buildModel({ events: [], patternOf, now: T0 });
  check(m.evidence === 0, 'a new learner has no evidence');
  const s = buildSession({ model: m, catalog, date: '2026-10-01', now: T0, placement: true });
  check(s.drills.length === 10, `placement has 10 drills (got ${s.drills.length})`);
  check(new Set(s.drills.map((d) => index[d.slug])).size === 10, 'placement drills come from 10 different patterns');
  check(!s.resolve, 'a new learner has nothing to re-solve');
  check(s.drills.every((d) => d.options.length === 4 && d.options.includes(index[d.slug]) && new Set(d.options).size === 4), 'every drill offers 4 distinct patterns including the right one');
  const again = buildSession({ model: m, catalog, date: '2026-10-01', now: T0 + 3600e3, placement: true });
  check(JSON.stringify(again.drills) === JSON.stringify(s.drills), 'the same day builds the same drills');
}

// ---- evidence moves mastery the right way, and it fades
{
  const solveClean = buildModel({ events: [ev(T0, 'accept', 'two-sum', { first: true, hints: 0 })], patternOf, now: T0 });
  const solveMessy = buildModel({ events: [ev(T0, 'fail', 'two-sum'), ev(T0 + 1, 'accept', 'two-sum', { first: false, hints: 2 })], patternOf, now: T0 });
  const h1 = retention(solveClean.patterns.hashing, T0);
  const h2 = retention(solveMessy.patterns.hashing, T0);
  check(h1 > h2 && h2 > 0, `a clean first-try solve counts more than a messy one (${h1.toFixed(2)} vs ${h2.toFixed(2)})`);
  check(labelOf(solveClean.patterns.hashing, T0) === 'Weak' || labelOf(solveClean.patterns.hashing, T0) === 'Shaky', 'one solve alone is not Strong');
  const later = retention(solveClean.patterns.hashing, T0 + 30 * DAY);
  check(later < h1 && later > 0.3 * h1 - 1e-9, 'mastery fades over a month but not below its floor');
  check(labelOf(solveClean.patterns['two-pointers'], T0) === 'Not started', 'untouched patterns are Not started');

  // spaced success builds a Strong pattern that fades more slowly
  const spaced = [ev(T0, 'accept', 'two-sum', { first: true }), ev(T0 + 3 * DAY, 'resolve', 'two-sum', { pass: true }),
    ev(T0 + 10 * DAY, 'resolve', 'two-sum', { pass: true }), ev(T0 + 11 * DAY, 'drill', 'valid-anagram', { pat: true, cx: true })];
  const sm = buildModel({ events: spaced, patternOf, now: T0 + 11 * DAY });
  check(labelOf(sm.patterns.hashing, T0 + 11 * DAY) === 'Strong', `spaced successes make a pattern Strong (${retention(sm.patterns.hashing, T0 + 11 * DAY).toFixed(2)})`);
  check(sm.patterns.hashing.s > solveClean.patterns.hashing.s, 'spaced success raises stability');
  const crammed = buildModel({ events: [ev(T0, 'accept', 'two-sum', { first: true }), ev(T0 + 60e3, 'accept', 'valid-anagram', { first: true }), ev(T0 + 120e3, 'accept', 'contains-duplicate', { first: true })], patternOf, now: T0 });
  check(crammed.patterns.hashing.s === solveClean.patterns.hashing.s, 'cramming in one sitting does not raise stability');
  const failed = buildModel({ events: [...spaced, ev(T0 + 12 * DAY, 'resolve', 'two-sum', { pass: false })], patternOf, now: T0 + 12 * DAY });
  check(retention(failed.patterns.hashing, T0 + 12 * DAY) < retention(sm.patterns.hashing, T0 + 12 * DAY), 'a failed re-solve lowers mastery');
  const wrongDrill = buildModel({ events: [ev(T0, 'drill', 'two-sum', { pat: false, cx: null })], patternOf, now: T0 });
  check(retention(wrongDrill.patterns.hashing, T0) === 0 && wrongDrill.patterns.hashing.n === 1, 'a wrong drill counts as evidence without adding mastery');
}

// ---- re-solve schedule: 3 → 7 → 18 days on passes, back to 2 on a fail
{
  const evs = [ev(T0, 'accept', 'two-sum', { first: true })];
  let m = buildModel({ events: evs, patternOf, now: T0 });
  check(m.schedule['two-sum'].due === T0 + 3 * DAY, 'first re-solve is due 3 days after solving');
  evs.push(ev(T0 + 3 * DAY, 'resolve', 'two-sum', { pass: true }));
  m = buildModel({ events: evs, patternOf, now: T0 });
  check(m.schedule['two-sum'].due === T0 + 3 * DAY + RESOLVE_GAPS[1] * DAY, 'after a pass the next gap is 7 days');
  evs.push(ev(T0 + 10 * DAY, 'resolve', 'two-sum', { pass: false }));
  m = buildModel({ events: evs, patternOf, now: T0 });
  check(m.schedule['two-sum'].due === T0 + 12 * DAY && m.schedule['two-sum'].idx === 0, 'after a fail it comes back in 2 days');
}

// ---- a learner with history: drills target the weakest started patterns, re-solve the most overdue
{
  const solved = { 'two-sum': { at: '2026-09-01T10:00:00Z', by: 'leetcode' }, 'valid-palindrome': '2026-09-02T10:00:00Z' };
  const events = [
    ev(T0, 'accept', 'binary-search', { first: true }), ev(T0 + 4 * DAY, 'resolve', 'binary-search', { pass: true }),
    ev(T0 + 1 * DAY, 'fail', 'reverse-linked-list'), ev(T0 + 1 * DAY + 5, 'accept', 'reverse-linked-list', { first: false, hints: 1 }),
    ev(T0 + 2 * DAY, 'drill', 'daily-temperatures', { pat: false, cx: null }),
  ];
  const now = T0 + 9 * DAY;
  const m = buildModel({ events, solved, patternOf, startedAt: T0, now });
  const s = buildSession({ model: m, catalog, date: '2026-10-10', now });
  check(s.drills.length === 3, `3 drills a day (got ${s.drills.length})`);
  check(new Set(s.drills.map((d) => index[d.slug])).size === 3, 'never two drills from the same pattern');
  const started = Object.keys(m.patterns).filter((p) => m.patterns[p].n > 0);
  const eff = (p) => retention(m.patterns[p], now);
  const weakest = [...started].sort((a, b) => eff(a) - eff(b)).slice(0, 3);
  check(JSON.stringify(s.drills.map((d) => index[d.slug])) === JSON.stringify(weakest), `drills follow the weakest started patterns (${weakest.join(', ')})`);
  check(s.drills.every((d) => !m.solved.has(d.slug)), 'drills use unsolved problems while there are any');
  check(s.resolve && m.schedule[s.resolve.slug].due <= now, 'the re-solve is due');
  const overdue = Object.entries(m.schedule).filter(([sl, x]) => x.due <= now && !(m.lastAccept[sl] && now - m.lastAccept[sl] < 2 * DAY)).sort((a, b) => a[1].due - b[1].due)[0]?.[0];
  check(s.resolve?.slug === overdue, `the re-solve is the most overdue problem (${overdue})`);
  check(s.stretch && !m.solved.has(s.stretch.slug) && !s.drills.some((d) => d.slug === s.stretch.slug), 'the stretch problem is unsolved and not one of the drills');
  const sm = buildModel({ events: [...events, ev(now, 'drill', s.drills[0].slug, { pat: true, cx: true })], solved, patternOf, startedAt: T0, now });
  const ch = changesSince(s, sm, now);
  check(ch.some((c) => c.pattern === index[s.drills[0].slug] && c.to > c.from), 'the summary shows the drilled pattern going up');
}

// ---- a target company: its focus patterns come first; the last days have no stretch problem
{
  const events = [ev(T0, 'accept', 'two-sum', { first: true }), ev(T0, 'accept', 'binary-search', { first: true }), ev(T0, 'accept', 'reverse-linked-list', { first: true }), ev(T0, 'accept', 'daily-temperatures', { first: true })];
  const now = T0 + DAY;
  const m = buildModel({ events, patternOf, startedAt: T0, now });
  const plain = buildSession({ model: m, catalog, date: '2026-10-02', now });
  const focus = ['monotonic-stack'];
  const focused = buildSession({ model: m, catalog, date: '2026-10-02', now, focus, daysLeft: 20 });
  check(index[focused.drills[0].slug] === 'monotonic-stack', `a focus pattern is drilled first (${index[focused.drills[0].slug]}; without focus: ${index[plain.drills[0].slug]})`);
  check(focused.stretch && focused.context.daysLeft === 20, 'a stretch problem while there is time');
  const last = buildSession({ model: m, catalog, date: '2026-10-02', now, focus, daysLeft: 2 });
  check(!last.stretch && last.context.final, 'no stretch problem in the final days');
  check(last.drills.length === 3, 'drills continue in the final days');
}

// ---- complexity options: 4 distinct classes including the right one, in scale order
for (const id of CX_IDS) {
  const seen = new Set();
  for (let seed = 0; seed < 40; seed++) {
    const o = cxOptions(id, seed);
    o.forEach((c) => seen.add(c));
    check(o.length === 4 && o.includes(id) && new Set(o).size === 4 && o.every((c, i) => i === 0 || CX_IDS.indexOf(c) > CX_IDS.indexOf(o[i - 1])), `complexity options for ${id}: ${o}`);
    const i = CX_IDS.indexOf(id);
    for (const j of [i - 1, i + 1]) if (CX_IDS[j]) check(o.includes(CX_IDS[j]), `complexity options for ${id} include the neighbour ${CX_IDS[j]}`);
  }
  if (id === 'n') check(seen.has('n2'), 'an O(n) answer sometimes shows O(n²) beside it');
}
check(STRONG > SHAKY, 'labels are ordered');

console.log(failures ? `\n${failures} problem${failures === 1 ? '' : 's'} in the Daily Coach` : `✓ Daily Coach: drill content for ${Object.keys(cxData).length} problems, model and sessions check out`);
process.exit(failures ? 1 : 0);
