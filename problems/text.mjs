#!/usr/bin/env node
/**
 * Problem text: a fuller statement in our own words, constraints and progressive hints, kept in
 * problems/text/<lesson>.mjs (one entry per slug) and merged into src/data/problems/<lesson>.json.
 * problems/explain/<lesson>.mjs adds, per slug, `explain`: a walk-through of the first example (shown
 * under it, LeetCode style; it must state that example's output), and optionally `more`: a paragraph
 * appended to the statement where the statement alone is terse.
 *
 *   node problems/text.mjs           merge the text into the shipped JSON and check it
 *   node problems/text.mjs --check   only check (CI): text complete, constraints hold, JSON in sync
 *
 * Constraints are written in a small checkable form and shown prettified (≤, 10⁵):
 *   '1 <= nums.length <= 1e5'        lengths of arrays, strings, lists
 *   '-1e4 <= nums[i] <= 1e4'         every element; nums[i].length, grid[i][j] work too
 *   '1 <= k <= nums.length'          a bound can be another quantity
 *   '0 <= root.nodes <= 1e4'         nodes in a tree or list; root.val (or Node.val) is every value
 *   'n == nums.length'               names a quantity for later lines (shown as written)
 *   '1 <= m, n <= 200'               several quantities at once
 * Anything else ("s has only lowercase letters") is shown as written and not checked.
 * Every example and edge-case test, and the generated performance input where its generator call
 * can be read, must satisfy every checkable constraint, so the numbers describe what our judge runs.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const textDir = join(here, 'text');
const explainDir = join(here, 'explain');
const dataDir = join(here, '..', 'src', 'data', 'problems');
const perf = (await import(pathToFileURL(join(here, 'perf.mjs')).href)).default;

// ---- numbers and quantities

const NUM = /^[\d\s.e^*+\-()]+$/;
function num(s) {
  const t = s.trim();
  if (!NUM.test(t)) return null;
  // eslint-disable-next-line no-new-func
  // (2**31) in parentheses: JavaScript rejects a unary minus directly before **
  const js = t.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+)/g, '($1**$2)');
  try { return Function(`"use strict"; return (${js});`)(); } catch { return null; }
}

const isNodeType = (t) => t === 'TreeNode' || t === 'ListNode' || t === 'Node';
const flat = (v) => (Array.isArray(v) ? v.flat(Infinity) : [v]);

/** Values a quantity takes in one test, or undefined when it can't be read. */
function quantity(expr, ctx) {
  const e = expr.trim();
  if (ctx.alias[e]) return quantity(ctx.alias[e], ctx);
  const n = num(e);
  if (n !== null) return [n];
  let m;
  if ((m = /^(\w+)$/.exec(e)) && m[1] in ctx.vals) {
    const v = ctx.vals[m[1]];
    return typeof v === 'number' ? [v] : undefined;
  }
  if ((m = /^(\w+)\.(length|nodes)$/.exec(e)) && m[1] in ctx.vals) {
    const v = ctx.vals[m[1]];
    if (isNodeType(ctx.types[m[1]])) return [flat(v).filter((x) => x !== null).length];
    return v == null ? undefined : [v.length];
  }
  if ((m = /^(\w+)\.val$/.exec(e))) {
    const name = m[1] in ctx.vals ? m[1] : Object.keys(ctx.types).find((k) => isNodeType(ctx.types[k]));
    if (!name || !isNodeType(ctx.types[name])) return undefined;
    return flat(ctx.vals[name]).filter((x) => x !== null);
  }
  if ((m = /^(\w+)\[0\]\.length$/.exec(e)) && m[1] in ctx.vals) {
    const v = ctx.vals[m[1]];
    return Array.isArray(v) && v.length ? [v[0].length] : [];
  }
  if ((m = /^(\w+)\[i\]$/.exec(e)) && m[1] in ctx.vals) {
    const v = ctx.vals[m[1]];
    return Array.isArray(v) && v.every((x) => typeof x === 'number') ? v : undefined;
  }
  if ((m = /^(\w+)\[i\]\.length$/.exec(e)) && m[1] in ctx.vals) {
    const v = ctx.vals[m[1]];
    return Array.isArray(v) ? v.map((x) => x.length) : undefined;
  }
  if ((m = /^(\w+)\[i\]\[j\]$/.exec(e)) && m[1] in ctx.vals) {
    const v = ctx.vals[m[1]];
    return Array.isArray(v) ? v.flat().filter((x) => typeof x === 'number') : undefined;
  }
  return undefined;
}

/** Parse one constraint line into checks, or null when it's free text. */
function parse(line) {
  const alias = /^(\w+)\s*==\s*([\w.[\]0]+)$/.exec(line.trim());
  if (alias) return { alias: [alias[1], alias[2]] };
  const parts = line.split(/\s*(<=|<)\s*/);
  if (parts.length !== 3 && parts.length !== 5) return null;
  const terms = parts.filter((_, i) => i % 2 === 0);
  const ops = parts.filter((_, i) => i % 2 === 1);
  if (terms.length === 2) return { lo: terms[0], loOp: ops[0], mids: [terms[1]] };   // "a <= b"
  return { lo: terms[0], loOp: ops[0], mids: terms[1].split(/\s*,\s*/), hi: terms[2], hiOp: ops[1] };
}

const holds = (a, op, b) => (op === '<' ? a < b : a <= b);

/** Problems found when checking `lines` against one test's inputs (vals: name → value). */
function checkTest(lines, vals, types, label) {
  const ctx = { vals, types, alias: {} };
  const errors = [];
  let checked = 0;
  for (const line of lines) {
    const c = parse(line);
    if (!c) continue;
    if (c.alias) { ctx.alias[c.alias[0]] = c.alias[1]; continue; }
    const lo = quantity(c.lo, ctx);
    const hi = c.hi === undefined ? null : quantity(c.hi, ctx);
    for (const mid of c.mids) {
      const vs = quantity(mid, ctx);
      if (vs === undefined || lo === undefined || hi === undefined) continue;
      checked += 1;
      if (c.mids.length === 1 && c.hi === undefined) {
        // two-sided "a <= b": both sides are quantities
        for (const a of lo) for (const b of vs) if (!holds(a, c.loOp, b)) errors.push(`${label}: ${line} fails (${a} vs ${b})`);
        continue;
      }
      const bad = vs.find((v) => !(holds(lo[0], c.loOp, v) && (hi === null || holds(v, c.hiOp, hi[0]))));
      if (bad !== undefined) errors.push(`${label}: ${line} fails (${mid} = ${bad})`);
    }
  }
  return { errors, checked };
}

/** Inputs a performance test generates, as far as simple BCB generator calls can be read. */
function perfInputs(gen, names) {
  const vals = {};
  const lit = (s) => num(s.replace(/_/g, ''));
  for (const m of gen.matchAll(/(?:int\[\]|int\[\]\[\]|String|char\[\]\[\]|int)\s+a(\d+)\s*=\s*([^;]+);/g)) {
    const name = names[Number(m[1])];
    const rhs = m[2].trim();
    let g;
    if ((g = /^BCB\.(ints|sorted|distinct)\(([^,]+),([^,]+),([^,)]+)\)$/.exec(rhs))) {
      const [n, lo, hi] = [lit(g[2]), lit(g[3]), lit(g[4])];
      if ([n, lo, hi].every((x) => x !== null)) vals[name] = { length: n, min: lo, max: hi };
    } else if ((g = /^BCB\.perm\(([^,]+),([^,)]+)\)$/.exec(rhs))) {
      const [n, from] = [lit(g[1]), lit(g[2])];
      if (n !== null && from !== null) vals[name] = { length: n, min: from, max: from + n - 1 };
    } else if ((g = /^BCB\.str\(([^,]+),/.exec(rhs))) {
      const n = lit(g[1]);
      if (n !== null) vals[name] = { length: n };
    } else if ((g = /^BCB\.(grid|charGrid)\(([^,]+),([^,]+),/.exec(rhs))) {
      const [r, c] = [lit(g[2]), lit(g[3])];
      const v = /^BCB\.grid\([^,]+,[^,]+,([^,]+),([^,)]+)\)$/.exec(rhs);
      if (r !== null && c !== null) vals[name] = { length: r, rows: c, ...(v ? { min: lit(v[1]), max: lit(v[2]) } : {}) };
    } else if (lit(rhs) !== null) {
      vals[name] = lit(rhs);
    }
  }
  return vals;
}

/** Check a perf test's readable sizes against length / element constraints. */
function checkPerf(lines, gen, names, label) {
  const sizes = perfInputs(gen, names);
  const errors = [];
  const alias = {};
  for (const line of lines) {
    const c = parse(line);
    if (!c) continue;
    if (c.alias) { alias[c.alias[0]] = c.alias[1]; continue; }
    if (c.hi === undefined) continue;
    const lo = num(c.lo);
    const hi = num(c.hi);
    if (lo === null || hi === null) continue;
    for (const raw of c.mids) {
      const mid = alias[raw] ?? raw;
      let m;
      let range = null;
      if ((m = /^(\w+)\.length$/.exec(mid)) && sizes[m[1]]?.length !== undefined) range = [sizes[m[1]].length, sizes[m[1]].length];
      else if ((m = /^(\w+)\[0\]\.length$/.exec(mid)) && sizes[m[1]]?.rows !== undefined) range = [sizes[m[1]].rows, sizes[m[1]].rows];
      else if ((m = /^(\w+)\[i\](\[j\])?$/.exec(mid)) && sizes[m[1]]?.min !== undefined) range = [sizes[m[1]].min, sizes[m[1]].max];
      else if ((m = /^(\w+)$/.exec(mid)) && typeof sizes[m[1]] === 'number') range = [sizes[m[1]], sizes[m[1]]];
      if (!range) continue;
      if (!(holds(lo, c.loOp, range[0]) && holds(range[1], c.hiOp, hi))) errors.push(`${label}: ${line} fails for the generated input (${mid} in [${range}])`);
    }
  }
  return errors;
}

// ---- merge

function validateEntry(p, t) {
  const errors = [];
  if (!t) return [`${p.slug}: no text entry`];
  if (typeof t.statement !== 'string' || t.statement.trim().split(/\s+/).length < 15) errors.push(`${p.slug}: statement missing or too short`);
  if (!Array.isArray(t.constraints) || !t.constraints.length) errors.push(`${p.slug}: no constraints`);
  if (!Array.isArray(t.hints) || t.hints.length < 2) errors.push(`${p.slug}: needs at least 2 hints`);
  if (errors.length) return errors;
  const names = p.params ? p.params.map(([, n]) => n) : ['operations', 'arguments'];
  const types = Object.fromEntries((p.params ?? []).map(([ty, n]) => [n, ty]));
  let checked = 0;
  p.tests.forEach((test, k) => {
    if (test.perf) return;
    const vals = Object.fromEntries(test.in.map((x, i) => [names[i], JSON.parse(x)]));
    const r = checkTest(t.constraints, vals, types, `${p.slug} test ${k + 1}`);
    errors.push(...r.errors);
    checked = Math.max(checked, r.checked);
  });
  const gen = perf[p.slug]?.gen;
  if (gen) errors.push(...checkPerf(t.constraints, gen, names, `${p.slug} performance test`));
  return { errors, checked };
}

export function loadExplain(lesson) {
  const f = join(explainDir, `${lesson}.mjs`);
  return existsSync(f) ? import(pathToFileURL(f).href).then((m) => m.default) : Promise.resolve({});
}

/** The first example's output, as an explanation must state it (strings without their quotes). */
function outputWords(out) {
  try {
    const v = JSON.parse(out);
    return typeof v === 'string' ? v : out.replace(/\s+/g, '');
  } catch {
    return out;
  }
}

function validateExplain(p, e) {
  const errors = [];
  if (!e || typeof e.explain !== 'string' || e.explain.trim().split(/\s+/).length < 10) return [`${p.slug}: no explanation of example 1 (problems/explain)`];
  const out = p.tests[0]?.out;
  if (out !== undefined && out.length <= 60) {
    const want = outputWords(out);
    const text = e.explain.replace(/\s+/g, '');
    const ok = /^-?\d+(\.\d+)?$/.test(want) ? new RegExp(`(^|[^\\d.])${want.replace('.', '\\.')}([^\\d]|$)`).test(e.explain) : text.includes(want.replace(/\s+/g, ''));
    if (!ok) errors.push(`${p.slug}: the explanation never states example 1's output ${out}`);
  }
  if (e.more !== undefined && (typeof e.more !== 'string' || e.more.trim().split(/\s+/).length < 8)) errors.push(`${p.slug}: "more" is too short`);
  return errors;
}

export function loadText(lesson) {
  const f = join(textDir, `${lesson}.mjs`);
  return existsSync(f) ? import(pathToFileURL(f).href).then((m) => m.default) : Promise.resolve({});
}

/** Merge text into one lesson's shipped problems; returns { problems, errors, unchecked, missing }. */
export async function mergeLesson(lesson, problems) {
  const text = await loadText(lesson);
  const explain = await loadExplain(lesson);
  const errors = [];
  const unchecked = [];
  const missing = [];
  const out = problems.map((p) => {
    const t = text[p.slug];
    if (!t) { missing.push(p.slug); return p; }
    const r = validateEntry(p, t);
    if (Array.isArray(r)) { errors.push(...r); return p; }
    errors.push(...r.errors);
    if (!r.checked && p.params) unchecked.push(p.slug);
    const { statement, constraints, hints } = t;
    const e = explain[p.slug];
    errors.push(...validateExplain(p, e));
    const full = e?.more ? `${statement.trim()}\n\n${e.more.trim()}` : statement.trim();
    return { ...p, statement: full, constraints, hints, ...(e?.explain ? { explain: e.explain.trim() } : {}) };
  });
  for (const slug of Object.keys(text)) if (!problems.some((p) => p.slug === slug)) errors.push(`${lesson}: text for unknown problem ${slug}`);
  for (const slug of Object.keys(explain)) if (!problems.some((p) => p.slug === slug)) errors.push(`${lesson}: explanation for unknown problem ${slug}`);
  return { problems: out, errors, unchecked, missing };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const CHECK = process.argv.includes('--check');
  const lessons = readdirSync(dataDir).filter((f) => f.endsWith('.json') && !['index.json', 'meta.json'].includes(f)).map((f) => f.slice(0, -5));
  let errors = [];
  const missing = [];
  const unchecked = [];
  let total = 0;
  for (const lesson of lessons) {
    const path = join(dataDir, `${lesson}.json`);
    const shipped = JSON.parse(readFileSync(path, 'utf8'));
    const base = shipped.map(({ statement, constraints, hints, explain, ...p }) => p);
    const r = await mergeLesson(lesson, base);
    total += shipped.length;
    errors = errors.concat(r.errors);
    missing.push(...r.missing);
    unchecked.push(...r.unchecked);
    const next = `[\n${r.problems.map((p) => JSON.stringify(p)).join(',\n')}\n]\n`;
    if (CHECK) {
      if (next !== readFileSync(path, 'utf8')) errors.push(`${lesson}: shipped JSON is out of date (run node problems/text.mjs)`);
    } else if (!r.errors.length) writeFileSync(path, next);
  }
  if (!CHECK && missing.length) console.log(`${missing.length} problems have no text yet`);
  if (CHECK && missing.length) errors.push(`${missing.length} problems have no text: ${missing.slice(0, 8).join(', ')}…`);
  if (unchecked.length) console.log(`note: no checkable constraint for ${unchecked.length}: ${unchecked.join(', ')}`);
  if (errors.length) {
    console.log(errors.map((e) => `✗ ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`✓ text for ${total - missing.length}/${total} problems; every test satisfies its constraints`);
}
