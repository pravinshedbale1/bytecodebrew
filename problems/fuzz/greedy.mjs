import { I32 } from './lib.mjs';

const reachable = (a) => { let far = 0; for (let i = 0; i < a.length && i <= far; i++) far = Math.max(far, i + a[i]); return far >= a.length - 1; };

export default {
  'assign-cookies': (g) => { const hi = g.pick([I32[1], 5, 100]); return [g.ints(g.len(1, 3e4, 15), 1, hi), g.ints(g.len(0, 3e4, 15), 1, hi)]; },
  'best-time-to-buy-and-sell-stock': (g) => [g.ints(g.len(1, 1e5, 30), 0, g.pick([1e4, 5, 0]))],
  'jump-game': (g) => [g.ints(g.len(1, 1e4, 25), 0, g.pick([1e5, 3, 2, 1]))],
  'jump-game-ii': (g) => { const a = g.ints(g.len(1, 1e4, 25), 0, g.pick([1000, 3, 2, 1])); return reachable(a) ? [a] : null; },
  'gas-station': (g) => {
    const n = g.len(1, 1e5, 15);
    const hi = g.pick([1e4, 5, 2]);
    const gas = g.ints(n, 0, hi), cost = g.ints(n, 0, hi);
    let starts = 0;
    for (let s = 0; s < n; s++) { let t = 0, ok = true; for (let k = 0; k < n && ok; k++) { t += gas[(s + k) % n] - cost[(s + k) % n]; if (t < 0) ok = false; } if (ok) starts++; }
    return starts <= 1 ? [gas, cost] : null;
  },
  'partition-labels': (g) => [g.str(g.len(1, 500, 30), g.pick(['ab', 'abc', 'abcdefghij', 'abcdefghijklmnopqrstuvwxyz']))],
  'boats-to-save-people': (g) => { const limit = g.pick([1, 3, 10, 3e4, g.int(1, 3e4)]); return [g.ints(g.len(1, 5e4, 25), 1, limit), limit]; },
  'two-city-scheduling': (g) => { const n = 2 * g.int(1, 50); const p = g.palette(1, 1000); return [Array.from({ length: n }, () => [p(), p()])]; },
  candy: (g) => [g.ints(g.len(1, 2e4, 30), 0, g.pick([2e4, 3, 1]))],
  'lemonade-change': (g) => { const w = g.pick([[0.5, 0.8], [0.7, 0.9], [0.34, 0.67], [1, 1]]); return [Array.from({ length: g.len(1, 1e5, 25) }, () => { const r = g.rand(); return r < w[0] ? 5 : r < w[1] ? 10 : 20; })]; },
  'merge-triplets-to-form-target-triplet': (g) => {
    const p = g.palette(1, g.pick([1000, 5]));
    const tr = Array.from({ length: g.len(1, 1e5, 15) }, () => [p(), p(), p()]);
    const target = g.bool(0.6) ? [0, 1, 2].map((k) => g.pick(tr)[k]) : [p(), p(), p()];
    return [tr, target];
  },
  'valid-parenthesis-string': (g) => [g.str(g.len(1, 100, 30), g.pick(['()*', '(*', '*)', '()', '((*))', '(**)']))],
  'hand-of-straights': (g) => {
    const size = g.pick([1, 2, 3, 4, g.int(1, 6)]);
    const groups = g.int(1, 6);
    const base = g.pick([0, 1e9 - 20, g.int(0, 30)]);
    let hand = [];
    for (let k = 0; k < groups; k++) { const s = base + g.int(0, 8); for (let v = s; v < s + size; v++) hand.push(Math.min(1e9, v)); }
    if (g.bool(0.4)) hand[g.int(0, hand.length - 1)] += g.pick([1, -1]);
    if (g.bool(0.15)) hand.pop();
    hand = hand.filter((v) => v >= 0);
    return hand.length ? [g.shuffle(hand), Math.min(size, hand.length)] : null;
  },
  'dota2-senate': (g) => [g.str(g.len(1, 1e4, 30), g.pick(['RD', 'RRD', 'RDD', 'R', 'D']))],
  'jump-game-vii': (g) => {
    const n = g.len(2, 1e5, 25);
    const s = '0' + g.str(n - 1, g.pick(['01', '001', '011', '0']));
    const lo = g.int(1, n - 1), hi = g.int(lo, n - 1);
    return [s, lo, hi];
  },
};
