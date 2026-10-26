/** n values from 1..n where each value appears at most `most` times; `p` is the chance of an extra copy. */
function repeats(g, n, most) {
  const p = g.pick([0, 0.15, 0.5, 0.9, 1]);
  const out = [];
  for (const v of g.perm(n, 1)) {
    for (let c = 0; c < most && out.length < n; c++) if (c === 0 || g.bool(p)) out.push(v);
  }
  return g.shuffle(out);
}

/** 1..n with one value overwritten by a copy of another: [array, repeated, missing]. */
function mismatch(g, n) {
  const a = g.perm(n, 1);
  const lost = g.int(0, n - 1);
  let from;
  do from = g.int(0, n - 1); while (from === lost);
  a[lost] = a[from];
  return a;
}

/** A permutation of 0..n−1 with a chosen cycle structure. */
function permutation(g, n) {
  const kind = g.int(0, 4);
  if (kind === 0) return Array.from({ length: n }, (_, i) => i);                   // all fixed points
  if (kind === 1) {                                                                 // one big cycle
    const order = g.perm(n, 0), p = Array(n);
    for (let i = 0; i < n; i++) p[order[i]] = order[(i + 1) % n];
    return p;
  }
  if (kind === 2) {                                                                 // pairs swapped
    const p = Array.from({ length: n }, (_, i) => i), order = g.perm(n, 0);
    for (let i = 0; i + 1 < n; i += 2) if (g.bool(0.7)) [p[order[i]], p[order[i + 1]]] = [order[i + 1], order[i]];
    return p;
  }
  return g.perm(n, 0);
}

export default {
  'find-all-numbers-disappeared-in-an-array': (g) => {
    const n = g.len(1, 1e5, 40);
    return [g.bool(0.15) ? g.perm(n, 1) : g.bool(0.5) ? repeats(g, n, n) : g.ints(n, 1, n)];
  },
  'set-mismatch': (g) => [mismatch(g, g.len(2, 1e4, 40))],
  'find-missing-and-repeated-values': (g) => {
    const n = g.len(2, 50, 7);
    const flat = mismatch(g, n * n);
    return [Array.from({ length: n }, (_, r) => flat.slice(r * n, r * n + n))];
  },
  'find-all-duplicates-in-an-array': (g) => [repeats(g, g.len(1, 1e5, 40), 2)],
  'array-nesting': (g) => [permutation(g, g.len(1, 1e5, 40))],
  'minimum-number-of-operations-to-sort-a-binary-tree-by-level': (g) => {
    const n = g.len(1, 1e5, 40);
    const vals = g.bool(0.4) ? g.perm(n, 1) : g.ints(n, 1, 1e5, { distinct: true });
    return [g.tree(n, (i) => vals[i])];
  },
  'couples-holding-hands': (g) => {
    const couples = g.len(2, 30, 30);
    if (g.bool(0.6)) return [g.perm(2 * couples, 0)];
    const row = Array.from({ length: 2 * couples }, (_, i) => i);                   // seated, then a few swaps
    for (let s = g.int(0, couples); s > 0; s--) {
      const i = g.int(0, 2 * couples - 1), j = g.int(0, 2 * couples - 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    return [row];
  },
};
