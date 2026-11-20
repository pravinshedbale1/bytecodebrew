#!/usr/bin/env node
/**
 * Practice thinking (src/data/think/<lesson>.js) stays honest, and its progress is tracked:
 *   - every walkthrough is a judged problem, filed under its own pattern lesson
 *   - at most one free walkthrough per pattern, and it is an Easy problem
 *   - every clue phrase appears verbatim in the problem's statement
 *   - the picked pattern is the problem's lesson; every "why not" pattern exists and differs from it
 *   - every engine named in `watch` exists in the lesson components; every sketch points at real cells
 *   - patterns listed in src/data/think/status.js (COMPLETE) have a walkthrough for every problem
 *   - src/data/thinkIndex.js is current (regenerate with --write)
 * Prints coverage per pattern, in curriculum order.
 *
 *   node scripts/think-check.mjs          check (CI)
 *   node scripts/think-check.mjs --write  also regenerate src/data/thinkIndex.js
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PATTERNS } from '../src/lib/coach/patterns.js';
import { COMPLETE } from '../src/data/think/status.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const errors = [];
const fail = (m) => errors.push(m);
const index = JSON.parse(readFileSync(join(root, 'src/data/problems/index.json'), 'utf8'));
const componentsSrc = readFileSync(join(root, 'src/components/mdx/components.jsx'), 'utf8');
const exported = new Set([...componentsSrc.slice(componentsSrc.indexOf('export const mdxComponents')).matchAll(/^\s+([A-Z]\w+),?$/gm)].map((m) => m[1]));
const lessonData = {};
const problemsOf = (lesson) => (lessonData[lesson] ??= JSON.parse(readFileSync(join(root, `src/data/problems/${lesson}.json`), 'utf8')));
const problemOf = (slug) => problemsOf(index[slug]).find((p) => p.slug === slug);

// curriculum order of the pattern lessons
const curriculum = readFileSync(join(root, 'src/curriculum/tracks/dsa.js'), 'utf8');
const lessons = new Set(Object.values(index));
const ORDER = [...curriculum.matchAll(/L\('([a-z0-9-]+)'/g)].map((m) => m[1]).filter((id) => lessons.has(id));

// load every pattern file
const dir = join(root, 'src/data/think');
const THINK = {};
for (const f of readdirSync(dir).filter((f) => f.endsWith('.js') && !['index.js', 'status.js'].includes(f))) {
  const lesson = f.slice(0, -3);
  if (!lessons.has(lesson)) { fail(`src/data/think/${f}: not a pattern lesson`); continue; }
  const data = (await import(pathToFileURL(join(dir, f)).href)).default;
  for (const [slug, t] of Object.entries(data)) {
    if (index[slug] !== lesson) fail(`think/${slug}: filed under ${lesson}, but the problem is in ${index[slug] ?? 'no lesson'}`);
    THINK[slug] = t;
  }
}

function checkSketch(where, s) {
  if (!s) return;
  if (s.kind === 'grid') {
    const R = s.grid.length, C = s.grid[0].length;
    for (const k of [...Object.keys(s.marks ?? {}), ...Object.keys(s.labels ?? {})]) {
      const [r, c] = k.split(',').map(Number);
      if (!(r >= 0 && r < R && c >= 0 && c < C)) fail(`${where}: grid cell ${k} is outside the grid`);
    }
    return;
  }
  if (s.kind !== 'array' || !Array.isArray(s.rows) || !s.rows.length) return fail(`${where}: a sketch is { kind: 'array', rows } or { kind: 'grid', grid }`);
  for (const row of s.rows) {
    const n = row.items?.length ?? 0;
    if (!n) fail(`${where}: an empty sketch row`);
    for (const i of [...Object.keys(row.marks ?? {}), ...Object.keys(row.tags ?? {})]) if (!(Number(i) >= 0 && Number(i) < n)) fail(`${where}: index ${i} is outside a row of ${n}`);
    for (const b of row.bands ?? []) if (!(b.from >= 0 && b.to < n && b.from <= b.to)) fail(`${where}: band ${b.from}–${b.to} is outside a row of ${n}`);
  }
}

const freeBy = {};
for (const [slug, t] of Object.entries(THINK)) {
  const at = `think/${slug}`;
  const p = problemOf(slug);
  if (!p) { fail(`${at}: not a judged problem`); continue; }
  if (t.free) {
    (freeBy[index[slug]] ??= []).push(slug);
    if (p.level !== 'Easy') fail(`${at}: only an Easy walkthrough can be the free one`);
  }
  if (!(t.read?.length >= 2)) fail(`${at}: needs at least two clues`);
  for (const c of t.read ?? []) {
    if (!p.statement.includes(c.phrase)) fail(`${at}: clue "${c.phrase}" is not in the statement`);
    if (!c.says?.trim()) fail(`${at}: clue "${c.phrase}" says nothing`);
  }
  const b = t.budget;
  if (!b?.from || !b.aim || !b.note || !(b.n > 0 || b.rows?.length)) fail(`${at}: budget needs from, aim, note and n (or rows)`);
  if (!(t.observe?.length >= 2 && t.observe.length <= 4)) fail(`${at}: 2 to 4 observations`);
  (t.observe ?? []).forEach((o, k) => { if (!o.title || !o.text) fail(`${at}: observation ${k + 1} needs a title and text`); checkSketch(`${at} observation ${k + 1}`, o.sketch); });
  if (!t.brute?.idea || !/^O\(/.test(t.brute?.cost ?? '') || !t.brute?.waste) fail(`${at}: brute needs idea, cost (big-O) and waste`);
  if (t.pattern?.pick !== index[slug]) fail(`${at}: pattern.pick is ${t.pattern?.pick}, but the problem is in ${index[slug]}`);
  if (!PATTERNS[t.pattern?.pick]) fail(`${at}: unknown pattern ${t.pattern?.pick}`);
  if (!t.pattern?.why) fail(`${at}: pattern.why is empty`);
  if (!(t.pattern?.not?.length >= 2)) fail(`${at}: at least two "why not" patterns`);
  for (const n of t.pattern?.not ?? []) {
    if (!PATTERNS[n.id]) fail(`${at}: unknown pattern ${n.id} in "why not"`);
    if (n.id === t.pattern.pick) fail(`${at}: "why not" lists the picked pattern`);
    if (!n.why) fail(`${at}: "why not ${n.id}" has no reason`);
  }
  const w = t.watch ?? {};
  if (!w.viz && !(w.frames?.length >= 2)) fail(`${at}: watch needs a viz or at least two frames`);
  if (w.viz && !exported.has(w.viz)) fail(`${at}: ${w.viz} is not a lesson component`);
  if (w.viz && !w.inputs?.length) fail(`${at}: ${w.viz} needs inputs`);
  (w.frames ?? []).forEach((f, k) => { if (!f.title || !f.text) fail(`${at}: frame ${k + 1} needs a title and text`); checkSketch(`${at} frame ${k + 1}`, f.sketch); });
  if (!(t.edges?.length >= 2)) fail(`${at}: at least two edge cases`);
}
for (const [lesson, list] of Object.entries(freeBy)) if (list.length > 1) fail(`${lesson}: one free walkthrough per pattern, not ${list.length} (${list.join(', ')})`);

// coverage, and complete patterns
const rows = ORDER.map((lesson) => {
  const all = problemsOf(lesson).map((p) => p.slug);
  const done = all.filter((s) => THINK[s]);
  if (COMPLETE.includes(lesson) && done.length < all.length) fail(`${lesson} is marked complete but has no walkthrough for: ${all.filter((s) => !THINK[s]).join(', ')}`);
  return [lesson, done.length, all.length];
});
for (const l of COMPLETE) if (!ORDER.includes(l)) fail(`status.js: ${l} is not a pattern lesson`);

// the generated index the site uses
const gen = `/**
 * Generated by \`node scripts/think-check.mjs --write\`; do not edit. Every Practice thinking walkthrough
 * (src/data/think/<lesson>.js): title, level, lesson, free. PATTERN_ORDER: [lesson, name, done, total].
 */
export const THINK_INDEX = {
${ORDER.flatMap((lesson) => problemsOf(lesson).filter((p) => THINK[p.slug]).map((p) => `  ${JSON.stringify(p.slug)}: { title: ${JSON.stringify(p.title)}, level: '${p.level}', lesson: '${lesson}', free: ${Boolean(THINK[p.slug].free)} },`)).join('\n')}
};

export const PATTERN_ORDER = [
${rows.map(([l, d, n]) => `  ['${l}', ${JSON.stringify(PATTERNS[l]?.name ?? l)}, ${d}, ${n}],`).join('\n')}
];
`;
const genPath = join(root, 'src/data/thinkIndex.js');
if (WRITE) writeFileSync(genPath, gen);
else if (readFileSync(genPath, 'utf8') !== gen) fail('src/data/thinkIndex.js is out of date: run node scripts/think-check.mjs --write');

if (errors.length) { for (const e of errors) console.error(`✗ ${e}`); process.exit(1); }
const total = rows.reduce((s, r) => s + r[2], 0), done = rows.reduce((s, r) => s + r[1], 0);
if (process.argv.includes('--progress')) for (const [l, d, n] of rows) console.log(`  ${d === n ? '✓' : d ? '…' : ' '} ${l.padEnd(26)} ${String(d).padStart(2)}/${n}`);
console.log(`✓ Practice thinking: ${done}/${total} walkthroughs (${COMPLETE.length}/${ORDER.length} patterns complete); clues, patterns, engines and sketches check out`);
