import { UPPER } from './lib.mjs';

export default {
  'last-stone-weight': (g) => [g.ints(g.len(1, 30, 30), 1, g.pick([1000, 5]))],
  'kth-largest-element-in-a-stream': (g) => {
    const nums = g.ints(g.len(0, 1e4, 15), -1e4, 1e4);
    const k = g.pick([1, nums.length + 1, g.int(1, nums.length + 1)]);
    const adds = g.len(1, 1e4, 20);
    const p = g.palette(-1e4, 1e4);
    return [['KthLargest', ...Array(adds).fill('add')], [[k, nums], ...Array.from({ length: adds }, () => [p()])]];
  },
  'kth-largest-element-in-an-array': (g) => { const a = g.ints(g.len(1, 1e5, 30), -1e4, 1e4); return [a, g.pick([1, a.length, g.int(1, a.length)])]; },
  'top-k-frequent-elements': (g) => {
    const a = g.ints(g.len(1, 1e5, 30), -1e4, g.pick([1e4, -9995]));
    const freq = [...a.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map()).values()].sort((x, y) => y - x);
    const ks = freq.map((_, i) => i + 1).filter((k) => k === freq.length || freq[k - 1] > freq[k]);
    return [a, g.pick(ks)];
  },
  'k-closest-points-to-origin': (g) => {
    const p = g.palette(-1e4, 1e4);
    const pts = Array.from({ length: g.len(1, 1e4, 20) }, () => [p(), p()]);
    const d = pts.map(([x, y]) => x * x + y * y).sort((a, b) => a - b);
    const ks = d.map((_, i) => i + 1).filter((k) => k === d.length || d[k - 1] < d[k]);
    return [pts, g.pick(ks)];
  },
  'task-scheduler': (g) => [[...g.str(g.len(1, 1e4, 30), g.pick(['A', 'AB', 'ABC', UPPER]))], g.pick([0, 1, 2, 100, g.int(0, 100)])],
  'kth-smallest-element-in-a-sorted-matrix': (g) => {
    const n = g.len(1, 300, 6);
    const step = g.pick([0, 1, 3, 1e7]);
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const base = Math.max(i ? m[i - 1][j] : -1e9 + g.int(0, 5), j ? m[i][j - 1] : -1e9);
      m[i][j] = Math.min(1e9, base + g.int(0, step));
    }
    return [m, g.pick([1, n * n, g.int(1, n * n)])];
  },
  'merge-k-sorted-lists': (g) => [Array.from({ length: g.len(0, 1e4, 6) }, () => g.ints(g.len(0, 500, 8), -1e6, g.pick([1e6, -999995]), { sorted: 'asc' }))],
  'find-median-from-data-stream': (g) => {
    const ops = ['MedianFinder'], args = [[]];
    const p = g.palette(-1e5, 1e5);
    let added = 0;
    for (let i = 0, k = g.len(1, 80, 40); i < k; i++) {
      if (added && g.bool(0.4)) { ops.push('findMedian'); args.push([]); } else { ops.push('addNum'); args.push([p()]); added++; }
    }
    ops.push('findMedian'); args.push([]);
    return [ops, args];
  },
  ipo: (g) => {
    const n = g.len(1, 1e5, 15);
    return [g.pick([1, n, 1e5, g.int(1, n)]), g.pick([0, 1, 1e9, g.int(0, 20)]), g.ints(n, 0, g.pick([1e4, 5])), g.ints(n, 0, g.pick([1e9, 20, 0]))];
  },
  'single-threaded-cpu': (g) => { const p = g.palette(1, 1e9); const q = g.palette(1, g.pick([1e9, 5])); return [Array.from({ length: g.len(1, 1e5, 20) }, () => [p(), q()])]; },
  'reorganize-string': (g) => [g.str(g.len(1, 500, 20), g.pick(['ab', 'aab', 'abc', 'aaab', 'abcdefgh']))],
  'longest-happy-string': (g) => { const v = () => g.pick([0, 1, 2, 7, 100, g.int(0, 10), g.int(0, 100)]); const t = [v(), v(), v()]; return t[0] + t[1] + t[2] > 0 ? t : null; },
};
