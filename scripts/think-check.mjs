#!/usr/bin/env node
/**
 * Practice thinking (src/data/think.js) stays honest:
 *   - think.js, thinkIndex.js and THINK_ORDER list the same problems; titles and levels match the problem data
 *   - only Easy problems are free
 *   - every clue phrase appears verbatim in the problem's statement
 *   - the picked pattern is the problem's own lesson; every "why not" pattern exists and differs from it
 *   - every engine named in `watch` exists in the lesson components; every sketch points at real cells
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THINK, THINK_ORDER } from '../src/data/think.js';
import { THINK_INDEX } from '../src/data/thinkIndex.js';
import { PATTERNS } from '../src/lib/coach/patterns.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (m) => errors.push(m);
const index = JSON.parse(readFileSync(join(root, 'src/data/problems/index.json'), 'utf8'));
const componentsSrc = readFileSync(join(root, 'src/components/mdx/components.jsx'), 'utf8');
const exported = new Set([...componentsSrc.slice(componentsSrc.indexOf('export const mdxComponents')).matchAll(/^\s+([A-Z]\w+),?$/gm)].map((m) => m[1]));
const problemOf = (slug) => JSON.parse(readFileSync(join(root, `src/data/problems/${index[slug]}.json`), 'utf8')).find((p) => p.slug === slug);

const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
if (!same(Object.keys(THINK), Object.keys(THINK_INDEX)) || !same(Object.keys(THINK), THINK_ORDER)) fail('think.js, thinkIndex.js and THINK_ORDER list different problems');

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

for (const [slug, t] of Object.entries(THINK)) {
  const at = `think/${slug}`;
  if (!index[slug]) { fail(`${at}: not a judged problem`); continue; }
  const p = problemOf(slug);
  const meta = THINK_INDEX[slug];
  if (meta && (meta.title !== p.title || meta.level !== p.level)) fail(`${at}: title/level in thinkIndex.js don't match the problem (${p.title}, ${p.level})`);
  if (meta?.free && p.level !== 'Easy') fail(`${at}: only Easy walkthroughs are free`);
  if (Boolean(t.free) !== Boolean(meta?.free)) fail(`${at}: free differs between think.js and thinkIndex.js`);
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
  if (!w.viz && !w.frames?.length) fail(`${at}: watch needs a viz or frames`);
  if (w.viz && !exported.has(w.viz)) fail(`${at}: ${w.viz} is not a lesson component`);
  if (w.viz && !w.inputs?.length) fail(`${at}: ${w.viz} needs inputs`);
  (w.frames ?? []).forEach((f, k) => { if (!f.title || !f.text) fail(`${at}: frame ${k + 1} needs a title and text`); checkSketch(`${at} frame ${k + 1}`, f.sketch); });
  if (!(t.edges?.length >= 2)) fail(`${at}: at least two edge cases`);
}

if (errors.length) { for (const e of errors) console.error(`✗ ${e}`); process.exit(1); }
console.log(`✓ Practice thinking: ${Object.keys(THINK).length} walkthroughs; clues, patterns, engines and sketches check out`);
