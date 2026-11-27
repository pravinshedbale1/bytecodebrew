/**
 * walkKit: the shared machinery behind the "walk" step-throughs used by Practice thinking
 * (<HashWalkViz>, <PairWalkViz>, <WindowWalkViz>, <PrefixWalkViz>, <IntervalWalkViz>, <SearchWalkViz>,
 * <SortWalkViz>, <CycleWalkViz>, <QuadWalkViz>).
 *
 * A model is a table of modes. Each mode declares
 *   code       [[key, text]] the pseudo-code lines a step can highlight
 *   fields     [{ name, label, placeholder, type, short?, ...limits }] the "try your own input" form;
 *              type is ints | int | str | words | pairs | matrix, and parse / values are derived from it
 *   valid?     (input) => error text or ''   extra rules (sorted, distinct, …)
 *   random     (g) => input fields           a small random input (g = rng())
 *   brute      (input) => answer             an independent, obviously-correct answer for viz-check
 *   check?     (input, out) => boolean       when several answers are accepted
 *   describe   (input) => one-line summary
 *   rule       one line: the idea in a nutshell
 *   run        (input, snap) => void         pushes the steps; the last one has kind 'done' (or 'fail'),
 *                                            `out` (compared with brute) and `answer` (shown)
 * Steps use the DesignWalkViz "parts" shape, so <Parts> draws them. Everything here is pure.
 */
import { list, rng } from './util.js';

export const KINDS = {
  start: ['Start', 'neutral'],
  look: ['Look', 'accent'],
  add: ['Add', 'accent'],
  keep: ['Keep', 'success'],
  skip: ['Skip', 'neutral'],
  move: ['Move', 'note'],
  swap: ['Swap', 'note'],
  grow: ['Grow', 'accent'],
  shrink: ['Shrink', 'warn'],
  merge: ['Merge', 'accent'],
  split: ['Split', 'note'],
  found: ['Found', 'success'],
  fail: ['Stop', 'danger'],
  done: ['Answer', 'success'],
};

const FILLED = new Set(['land', 'safe', 'flipped', 'gone', 'wall', 'src', 'counted', 'water', 'fresh', 'rotten']);   // classes that bring their own background

export const P = {
  pile: (label, items, empty = 'empty') => ({ type: 'pile', label, items, empty }),
  lane: (label, items, front = 'front', back = 'back', empty = 'empty') => ({ type: 'lane', label, items, front, back, empty }),
  chips: (label, chips, empty = 'none') => ({ type: 'chips', label, chips, empty }),
  strip: (label, items, o = {}) => ({ type: 'strip', label, items: [...items].map(String), cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o }),
  // every cell gets the base 'open' look; models add cellCur (current), safe (match), flipped (clash),
  // land (inside the range being worked on) and gone (out of range)
  grid: (label, cells) => ({ type: 'grid', label, cells: cells.map((row) => row.map((x) => { const c = (x.c ?? []).filter(Boolean); return { ...x, c: c.some((k) => FILLED.has(k)) ? c : ['open', ...c] }; })) }),
};

/** A strip with a few cells classed at once: cls = { k: 'hit' }, tags = { k: [[label, tone]] }. */
const CHIP_TONE = { cur: 'accent', hit: 'success', kept: 'success', target: 'success', bad: 'danger', dim: 'muted', muted: 'muted', note: 'note' };

export function strip(label, items, { cls = {}, tags = {}, sub = {}, bands = [], index = true } = {}) {
  // items too long for a cell (like "[12, 16]") read better as chips, which size to their text
  if (!bands.length && !Object.keys(sub).length && items.some((x) => String(x).length > 5)) {
    return P.chips(label, items.map((x, k) => ({ key: `${k}`, text: String(x), tone: CHIP_TONE[String(cls[k] ?? '').split(' ')[0]] })), 'none');
  }
  const s = P.strip(label, items, { index, bands });
  for (const [k, v] of Object.entries(cls)) if (v) s.cls[k] = v;
  for (const [k, v] of Object.entries(tags)) s.tags[k] = v.map(([l, tone]) => ({ label: l, tone: tone ?? 'accent' }));
  for (const [k, v] of Object.entries(sub)) if (v !== undefined && v !== null) s.sub[k] = typeof v === 'object' ? v : { text: String(v) };
  return s;
}

/** Chips from a Map or object: key → value, shown as "key: value". */
export function mapChips(label, m, { tone = {}, empty = 'empty', fmt } = {}) {
  const entries = m instanceof Map ? [...m.entries()] : Object.entries(m);
  return P.chips(label, entries.map(([k, v]) => ({ key: String(k), text: fmt ? fmt(k, v) : `${k}: ${Array.isArray(v) ? list(v) : v}`, tone: tone[k] })), empty);
}

export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const show = (v) => (Array.isArray(v) ? (v.length && Array.isArray(v[0]) ? `[${v.map(list).join(', ')}]` : list(v.map((x) => (typeof x === 'string' ? `"${x}"` : x)))) : typeof v === 'string' ? `"${v}"` : String(v));

// ---------------------------------------------------------------- input fields

const MINUS = (t) => String(t ?? '').replace(/[−–]/g, '-');

function parseField(f, raw) {
  const text = MINUS(raw).trim();
  const name = f.label ?? f.name;
  if (f.type === 'int') {
    const v = Number(text);
    if (!/^-?\d+$/.test(text)) return { error: `${name}: a whole number.` };
    if (v < (f.min ?? -99) || v > (f.max ?? 99)) return { error: `${name}: between ${f.min ?? -99} and ${f.max ?? 99}.` };
    return { v };
  }
  if (f.type === 'ints') {
    const parts = text.replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean);
    const lo = f.minLen ?? 1, hi = f.maxLen ?? 10;
    if (parts.length < lo || parts.length > hi) return { error: `${name}: ${lo === hi ? lo : `${lo} to ${hi}`} whole numbers, separated by commas.` };
    const arr = parts.map(Number);
    if (arr.some((x) => !Number.isInteger(x))) return { error: `${name}: whole numbers only.` };
    if (arr.some((x) => x < (f.min ?? -99) || x > (f.max ?? 99))) return { error: `${name}: values between ${f.min ?? -99} and ${f.max ?? 99}.` };
    return { v: arr };
  }
  if (f.type === 'str') {
    const re = f.re ?? /^[a-z]{1,10}$/;
    return re.test(text) ? { v: text } : { error: f.msg ?? `${name}: up to 10 lower-case letters.` };
  }
  if (f.type === 'words') {
    const words = text.replace(/[[\]"]/g, ' ').split(/[\s,]+/).filter(Boolean);
    const re = f.re ?? /^[a-z]{1,6}$/;
    if (words.length < (f.minLen ?? 1) || words.length > (f.maxLen ?? 6) || words.some((w) => !re.test(w))) return { error: f.msg ?? `${name}: ${f.minLen ?? 1} to ${f.maxLen ?? 6} words, separated by commas.` };
    return { v: words };
  }
  if (f.type === 'pairs') {
    const nums = text.replace(/[[\]()]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
    if (nums.some((x) => !Number.isInteger(x)) || nums.length % 2) return { error: `${name}: pairs like [1, 3], [2, 6].` };
    const pairs = [];
    for (let k = 0; k < nums.length; k += 2) pairs.push([nums[k], nums[k + 1]]);
    if (pairs.length < (f.minLen ?? 1) || pairs.length > (f.maxLen ?? 6)) return { error: `${name}: ${f.minLen ?? 1} to ${f.maxLen ?? 6} pairs.` };
    if (pairs.some(([a, b]) => a > b || a < (f.min ?? 0) || b > (f.max ?? 30))) return { error: `${name}: each pair [start, end] with ${f.min ?? 0} ≤ start ≤ end ≤ ${f.max ?? 30}.` };
    return { v: pairs };
  }
  if (f.type === 'matrix') {
    const rows = text.split(/[;/\n]+|\]\s*,?\s*\[/).map((r) => r.replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number)).filter((r) => r.length);
    const R = f.rows ?? [1, 4], C = f.cols ?? [1, 4];
    if (rows.length < R[0] || rows.length > R[1] || rows.some((r) => r.length !== rows[0].length) || rows[0].length < C[0] || rows[0].length > C[1]) return { error: `${name}: ${R[0]}–${R[1]} rows of ${C[0]}–${C[1]} numbers, rows separated by ";".` };
    if (rows.flat().some((x) => !Number.isInteger(x) || x < (f.min ?? -9) || x > (f.max ?? 99))) return { error: `${name}: whole numbers between ${f.min ?? -9} and ${f.max ?? 99}.` };
    return { v: rows };
  }
  throw new Error(`unknown field type ${f.type}`);
}

function fieldValue(f, v) {
  if (f.type === 'ints') return v.join(', ');
  if (f.type === 'words') return v.join(', ');
  if (f.type === 'pairs') return v.map((p) => `[${p.join(', ')}]`).join(', ');
  if (f.type === 'matrix') return v.map((r) => r.join(', ')).join('; ');
  return String(v);
}

// ---------------------------------------------------------------- the model

export function makeWalk(MODES, EXAMPLES) {
  const M = (mode) => { const m = MODES[mode]; if (!m) throw new Error(`unknown mode ${mode}`); return m; };
  return {
    EXAMPLES,
    MODES,
    walk(input) {
      const steps = [];
      const snap = (x) => steps.push({ mode: input.mode, parts: [], call: null, ...x });
      M(input.mode).run(input, snap);
      return steps;
    },
    code: (mode) => M(mode).code,
    answer: (input) => M(input.mode).brute(input),
    check(input, out) { const m = M(input.mode); return m.check ? m.check(input, out) : same(out, m.brute(input)); },
    parse(values, input) {
      const m = M(input.mode);
      const out = { mode: input.mode };
      for (const f of m.fields) { const r = parseField(f, values[f.name]); if (r.error) return { error: r.error }; out[f.name] = r.v; }
      const err = m.valid?.(out);
      return err ? { error: err } : { input: out };
    },
    values: (input) => Object.fromEntries(M(input.mode).fields.map((f) => [f.name, fieldValue(f, input[f.name])])),
    random(input, rand = Math.random) {
      const m = M(input.mode);
      for (let t = 0; t < 50; t++) { const r = m.random(rng(rand)); const x = { mode: input.mode, ...Object.fromEntries(m.fields.map((f) => [f.name, r[f.name]])) }; if (!m.valid?.(x)) return x; }
      throw new Error(`random ${input.mode}: could not make a valid input`);
    },
    fields: (input) => M(input.mode).fields.map(({ name, label, placeholder, short }) => ({ name, label, placeholder, short })),
    describe: (input) => M(input.mode).describe(input),
    rule: (input) => M(input.mode).rule,
    hint: (input) => M(input.mode).hint ?? 'Small inputs keep every step readable.',
  };
}
