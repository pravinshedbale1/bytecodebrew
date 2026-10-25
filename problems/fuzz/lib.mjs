/**
 * Helpers for the generated tests in problems/fuzz/<lesson>.mjs.
 *
 * Each lesson file exports { [slug]: gen } where gen is either
 *   (g, i) => input            called until COUNT inputs are kept (i counts attempts from 0) (input = the test's argument list, as plain JS values), or
 *   { n, gen: (g, i) => input } to choose how many, or
 *   { all: [input, …] }         an explicit list (for tiny input domains, where every input can be tested).
 * A gen may return null to skip a slot. Inputs repeating an earlier test are dropped.
 *
 * `g` is a seeded generator (the seed comes from the slug, so builds are reproducible). Values lean towards
 * the cases that break solutions: the smallest and largest sizes, boundary values, duplicates, sorted runs.
 */
export const COUNT = 40;

/** mulberry32: small, fast, good enough for test data. */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedOf(text) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export const LOWER = 'abcdefghijklmnopqrstuvwxyz';
export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const DIGITS = '0123456789';
export const I32 = [-(2 ** 31), 2 ** 31 - 1];

export function makeGen(seed) {
  const rand = mulberry(seed);
  const g = {
    rand,
    /** uniform integer in [lo, hi] */
    int(lo, hi) { return lo + Math.floor(rand() * (hi - lo + 1)); },
    bool(p = 0.5) { return rand() < p; },
    pick(a) { return a[Math.floor(rand() * a.length)]; },
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    /** a value in [lo, hi] that is often a boundary (lo, hi, 0, ±1) */
    val(lo, hi) {
      const r = rand();
      if (r < 0.12) return lo;
      if (r < 0.24) return hi;
      if (r < 0.32 && lo <= 0 && hi >= 0) return g.pick([0, 1, -1].filter((v) => v >= lo && v <= hi));
      return g.int(lo, hi);
    },
    /** a length in [lo, hi]: often the minimum or tiny, usually small, sometimes up to `cap` */
    len(lo, hi, cap = 24) {
      const top = Math.min(hi, Math.max(lo, cap));
      const r = rand();
      if (r < 0.15) return lo;
      if (r < 0.35) return Math.min(top, lo + g.int(0, 2));
      if (r < 0.8) return g.int(lo, Math.min(top, lo + 10));
      return g.int(lo, top);
    },
    /**
     * A value picker for one test: sometimes the whole range (with boundary bias), sometimes a narrow
     * range so values repeat, sometimes only a couple of distinct values.
     */
    palette(lo, hi) {
      const r = rand();
      if (r < 0.45 || hi - lo < 4) return () => g.val(lo, hi);
      if (r < 0.75) {
        const w = Math.min(hi - lo, g.int(2, 9));
        const base = g.int(lo, hi - w);
        return () => g.int(base, base + w);
      }
      const a = g.val(lo, hi), b = g.val(lo, hi);
      return () => (g.bool() ? a : b);
    },
    /** n integers in [lo, hi] (fewer when distinct and the range is smaller); opts: { distinct, sorted: 'asc' | 'desc' | 'any' } */
    ints(n, lo, hi, opts = {}) {
      let a;
      if (opts.distinct) {
        n = Math.min(n, hi - lo + 1); // a narrow range caps how many distinct values exist
        const seen = new Set();
        a = [];
        const draw = hi - lo < 4 * n ? () => g.int(lo, hi) : () => g.val(lo, hi);
        while (a.length < n) { const v = draw(); if (!seen.has(v)) { seen.add(v); a.push(v); } }
      } else {
        const p = g.palette(lo, hi);
        a = Array.from({ length: n }, p);
      }
      const order = opts.sorted ?? (g.bool(0.2) ? g.pick(['asc', 'desc']) : null);
      if (order === 'asc') a.sort((x, y) => x - y);
      if (order === 'desc') a.sort((x, y) => y - x);
      return a;
    },
    /** a permutation of from..from + n − 1 */
    perm(n, from = 0) { return g.shuffle(Array.from({ length: n }, (_, i) => from + i)); },
    /** a string of length n over `alpha`, sometimes using only a few of its letters */
    str(n, alpha = LOWER) {
      const use = alpha.length > 3 && g.bool(0.5) ? g.shuffle([...alpha]).slice(0, g.int(1, Math.min(4, alpha.length))).join('') : alpha;
      let s = '';
      for (let i = 0; i < n; i++) s += use[Math.floor(rand() * use.length)];
      return s;
    },
    /** n strings with lengths in [lo, hi] */
    words(n, lo, hi, alpha = LOWER) {
      const use = alpha.length > 3 && g.bool(0.5) ? alpha.slice(0, g.int(2, 4)) : alpha;
      return Array.from({ length: n }, () => g.str(g.len(lo, hi, 8), use));
    },
    /** an m × n grid filled by f(r, c) */
    grid(m, n, f) { return Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => f(r, c))); },
    /**
     * A random binary tree with n nodes, as a LeetCode level-order array. Shapes vary: balanced-ish,
     * left or right chains, zig-zags. vals(i) gives the value of the i-th created node.
     */
    tree(n, vals) {
      if (n === 0) return [];
      const shape = g.pick(['random', 'random', 'left', 'right', 'zigzag', 'full']);
      const nodes = [{ v: vals(0), l: null, r: null }];
      const open = [[nodes[0], 'l'], [nodes[0], 'r']];
      for (let i = 1; i < n; i++) {
        let k;
        if (shape === 'left') k = open.findIndex(([, s]) => s === 'l');
        else if (shape === 'right') k = open.findIndex(([, s]) => s === 'r');
        else if (shape === 'zigzag') k = open.length - (i % 2 ? 2 : 1);
        else if (shape === 'full') k = 0;
        else k = Math.floor(rand() * open.length);
        if (k < 0) k = 0;
        const [parent, side] = open.splice(k, 1)[0];
        const node = { v: vals(i), l: null, r: null };
        parent[side] = node;
        nodes.push(node);
        open.push([node, 'l'], [node, 'r']);
      }
      return levelOrder(nodes[0]);
    },
    /** a valid BST holding the given distinct values, in a random shape */
    bst(values) {
      const sorted = [...values].sort((a, b) => a - b);
      const shape = g.pick(['random', 'random', 'balanced', 'chain']);
      const build = (lo, hi) => {
        if (lo > hi) return null;
        const m = shape === 'balanced' ? (lo + hi) >> 1 : shape === 'chain' ? (g.bool() ? lo : hi) : g.int(lo, hi);
        return { v: sorted[m], l: build(lo, m - 1), r: build(m + 1, hi) };
      };
      return levelOrder(build(0, sorted.length - 1));
    },
    /** edges of a random tree on nodes base..base + n − 1 (as [parent, child] in random order and direction) */
    treeEdges(n, base = 0) {
      const label = g.perm(n, base);
      const e = [];
      for (let i = 1; i < n; i++) {
        const p = g.bool(0.3) ? i - 1 : g.int(0, i - 1);
        e.push(g.bool() ? [label[p], label[i]] : [label[i], label[p]]);
      }
      return g.shuffle(e);
    },
    /** up to m distinct undirected edges on 0..n − 1 without self-loops */
    edges(n, m) {
      const seen = new Set(), e = [];
      const max = (n * (n - 1)) / 2;
      m = Math.min(m, max);
      let guard = 0;
      while (e.length < m && guard++ < 50 * m + 100) {
        const a = g.int(0, n - 1), b = g.int(0, n - 1);
        if (a === b) continue;
        const k = a < b ? `${a},${b}` : `${b},${a}`;
        if (seen.has(k)) continue;
        seen.add(k);
        e.push([a, b]);
      }
      return e;
    },
    /** n intervals [s, e] with lo ≤ s, e ≤ hi and s < e (or s ≤ e when allowEqual) */
    intervals(n, lo, hi, allowEqual = false) {
      const p = g.palette(lo, hi);
      return Array.from({ length: n }, () => {
        let a = p(), b = p();
        if (a > b) [a, b] = [b, a];
        if (!allowEqual && a === b) { if (b < hi) b++; else a--; }
        return [a, b];
      });
    },
  };
  return g;
}

/** { v, l, r } nodes → LeetCode level-order array with nulls, trailing nulls trimmed */
export function levelOrder(root) {
  if (!root) return [];
  const out = [], q = [root];
  for (let i = 0; i < q.length; i++) {
    const n = q[i];
    if (!n) { out.push(null); continue; }
    out.push(n.v);
    q.push(n.l, n.r);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

/** LeetCode level-order array → { v, l, r } nodes (or null) */
export function fromLevel(a) {
  if (!a.length || a[0] === null) return null;
  const root = { v: a[0], l: null, r: null }, q = [root];
  let i = 1;
  for (let h = 0; h < q.length && i < a.length; h++) {
    const n = q[h];
    if (i < a.length && a[i] !== null) { n.l = { v: a[i], l: null, r: null }; q.push(n.l); }
    i++;
    if (i < a.length && a[i] !== null) { n.r = { v: a[i], l: null, r: null }; q.push(n.r); }
    i++;
  }
  return root;
}
export const mirror = (n) => (n ? { v: n.v, l: mirror(n.r), r: mirror(n.l) } : null);
export const nodesOf = (n, out = []) => { if (n) { out.push(n); nodesOf(n.l, out); nodesOf(n.r, out); } return out; };
export const preorder = (n, out = []) => { if (n) { out.push(n.v); preorder(n.l, out); preorder(n.r, out); } return out; };
export const inorder = (n, out = []) => { if (n) { inorder(n.l, out); out.push(n.v); inorder(n.r, out); } return out; };
/** every root-to-leaf path sum */
export const leafSums = (n, acc = 0, out = []) => {
  if (!n) return out;
  const s = acc + n.v;
  if (!n.l && !n.r) out.push(s);
  leafSums(n.l, s, out);
  leafSums(n.r, s, out);
  return out;
};

/** Runs one generator: returns a list of inputs (argument lists), without duplicates of `existing`. */
export function generate(slug, gen, existing = []) {
  const g = makeGen(seedOf(slug));
  const seen = new Set(existing.map((t) => JSON.stringify(t)));
  const out = [];
  const keep = (input) => {
    if (input == null) return;
    const k = JSON.stringify(input);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(input);
  };
  if (gen.all) gen.all.forEach(keep);
  else {
    const n = gen.n ?? COUNT;
    const f = gen.gen ?? gen;
    for (let i = 0; i < n * 3 && out.length < n; i++) keep(f(g, i));
  }
  return out;
}
