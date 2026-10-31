/** An expression of `count` numbers (0..99) joined by +, - and *, at most 20 characters long. */
function expression(g, count) {
  let s = String(g.int(0, g.bool(0.5) ? 9 : 99));
  for (let i = 1; i < count; i++) {
    const next = g.pick(['+', '-', '*']) + String(g.int(0, g.bool(0.5) ? 9 : 99));
    if (s.length + next.length > 20) break;
    s += next;
  }
  return s;
}

export default {
  'sort-list': (g) => {
    const n = g.len(0, 5e4, 40);
    const p = g.palette(-1e5, 1e5);
    const a = Array.from({ length: n }, p);
    if (g.bool(0.15)) a.sort((x, y) => x - y);
    else if (g.bool(0.15)) a.sort((x, y) => y - x);
    return [a];
  },
  'different-ways-to-add-parentheses': (g) => [expression(g, g.int(1, 10))],
  'longest-substring-with-at-least-k-repeating-characters': (g) => {
    const n = g.len(1, 1e4, 40);
    const alpha = 'abcdefghijklmnopqrstuvwxyz'.slice(0, g.pick([1, 2, 3, 4, 6, 26]));
    let s;
    if (g.bool(0.4)) {                                              // runs, so long valid stretches exist
      s = '';
      while (s.length < n) s += g.pick([...alpha]).repeat(g.int(1, 6));
      s = s.slice(0, n);
    } else s = g.str(n, alpha);
    return [s, g.pick([1, 2, 2, 3, 3, 4, 5, g.int(1, 1e5)])];
  },
};
