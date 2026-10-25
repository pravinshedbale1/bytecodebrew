/** digits of a number, least significant first, without leading zeros */
function number(g, n) {
  const d = Array.from({ length: n }, () => g.int(0, 9));
  if (n > 1 && d[n - 1] === 0) d[n - 1] = g.int(1, 9);
  return g.bool(0.2) ? d.map((x, i) => (i === n - 1 ? (n > 1 ? 9 : x) : 9)) : d;
}

export default {
  'reverse-linked-list': (g) => [g.ints(g.len(0, 5000, 20), -5000, 5000)],
  'merge-two-sorted-lists': (g) => [g.ints(g.len(0, 50, 12), -100, 100, { sorted: 'asc' }), g.ints(g.len(0, 50, 12), -100, 100, { sorted: 'asc' })],
  'remove-linked-list-elements': (g) => { const a = g.ints(g.len(0, 1e4, 20), 1, g.pick([50, 3, 1])); return [a, a.length && g.bool(0.7) ? g.pick(a) : g.val(0, 50)]; },
  'add-two-numbers': (g) => [number(g, g.len(1, 100, 12)), number(g, g.len(1, 100, 12))],
  'reverse-linked-list-ii': (g) => { const a = g.ints(g.len(1, 500, 20), -500, 500); const n = a.length; const l = g.pick([1, n, g.int(1, n)]); return [a, l, g.pick([l, n, g.int(l, n)])]; },
  'swap-nodes-in-pairs': (g) => [g.ints(g.len(0, 100, 15), 0, 100)],
  'partition-list': (g) => { const a = g.ints(g.len(0, 200, 20), -100, 100); return [a, a.length && g.bool(0.6) ? g.pick(a) : g.val(-200, 200)]; },
  'rotate-list': (g) => { const n = g.len(0, 500, 15); return [g.ints(n, -100, 100), g.pick([0, 1, n, n + 1, 2 * n, 2e9, g.int(0, 2e9), g.int(0, 3 * n)])]; },
  'reverse-nodes-in-k-group': (g) => { const a = g.ints(g.len(1, 5000, 20), 0, 1000); const n = a.length; return [a, g.pick([1, n, g.int(1, n), g.int(1, Math.min(n, 4))])]; },
  'insert-greatest-common-divisors-in-linked-list': (g) => [g.ints(g.len(1, 5000, 20), 1, g.pick([1000, 12]))],
  'copy-list-with-random-pointer': (g) => {
    const n = g.len(0, 1000, 15);
    const vals = g.ints(n, -1e4, 1e4);
    return [vals.map((v, i) => [v, g.bool(0.25) ? null : g.pick([i, 0, n - 1, g.int(0, n - 1)])])];
  },
};
