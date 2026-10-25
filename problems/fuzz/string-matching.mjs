/** a string built from repeating a short block (so matches, borders and periods appear) */
const periodic = (g, n, alpha) => { const block = g.str(g.int(1, 4), alpha); let s = block.repeat(Math.ceil(n / block.length)).slice(0, n); if (g.bool(0.3) && s.length) { const i = g.int(0, s.length - 1); s = s.slice(0, i) + g.str(1, alpha) + s.slice(i + 1); } return s; };

export default {
  'find-the-index-of-the-first-occurrence-in-a-string': (g) => {
    const alpha = g.pick(['a', 'ab', 'abc']);
    const h = g.bool(0.6) ? periodic(g, g.len(1, 1e4, 30), alpha) : g.str(g.len(1, 1e4, 30), alpha);
    if (g.bool(0.5)) { const i = g.int(0, h.length - 1); return [h, h.slice(i, i + g.int(1, 8))]; }
    return [h, g.str(g.len(1, 1e4, 6), alpha)];
  },
  'rotate-string': (g) => {
    const s = g.bool(0.5) ? periodic(g, g.len(1, 100, 15), 'ab') : g.str(g.len(1, 100, 15), g.pick(['ab', 'abc']));
    const k = g.int(0, s.length);
    const rot = s.slice(k) + s.slice(0, k);
    const goal = g.pick([rot, rot, s, g.str(s.length, 'ab'), s + 'a', rot.slice(1) || 'b']);
    return [s, goal];
  },
  'repeated-substring-pattern': (g) => [g.bool(0.6) ? periodic(g, g.len(1, 1e4, 30), g.pick(['a', 'ab', 'abc'])) : g.str(g.len(1, 1e4, 30), g.pick(['ab', 'abc']))],
  'repeated-string-match': (g) => {
    const alpha = g.pick(['a', 'ab', 'abc']);
    const a = g.str(g.len(1, 1e4, 6), alpha);
    if (g.bool(0.6)) { const big = a.repeat(g.int(1, 5)) + a; const i = g.int(0, Math.max(0, big.length - 1)); return [a, big.slice(i, i + g.int(1, 3 * a.length + 2)) || a]; }
    return [a, g.str(g.len(1, 1e4, 10), alpha)];
  },
  'repeated-dna-sequences': (g) => [g.bool(0.5) ? periodic(g, g.len(1, 1e5, 60), 'ACGT') : g.str(g.len(1, 1e5, 60), g.pick(['ACGT', 'AC', 'A']))],
  'longest-happy-prefix': (g) => [g.bool(0.6) ? periodic(g, g.len(1, 1e5, 30), g.pick(['a', 'ab', 'abc'])) : g.str(g.len(1, 1e5, 30), g.pick(['ab', 'abc']))],
  'shortest-palindrome': (g) => { const alpha = g.pick(['a', 'ab', 'abc']); const n = g.len(0, 5e4, 30); if (g.bool(0.4) && n) { const half = g.str(Math.ceil(n / 2), alpha); return [(half + [...half].reverse().join('')).slice(0, n) + g.str(g.int(0, 3), alpha)]; } return [g.str(n, alpha)]; },
  'longest-duplicate-substring': (g) => [g.bool(0.5) ? periodic(g, g.len(2, 3e4, 30), g.pick(['ab', 'abc', 'banana'])) : g.str(g.len(2, 3e4, 30), g.pick(['ab', 'abc', 'abcdefghijklmnopqrstuvwxyz']))],
};
