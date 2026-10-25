const distinct = (a) => [...new Set(a)];

/** a board-reachable word: a random path of adjacent, unused cells */
function pathWord(g, board, len) {
  const m = board.length, n = board[0].length;
  let r = g.int(0, m - 1), c = g.int(0, n - 1);
  const used = new Set([`${r},${c}`]);
  let w = board[r][c];
  while (w.length < len) {
    const next = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < m && b < n && !used.has(`${a},${b}`));
    if (!next.length) break;
    [r, c] = g.pick(next);
    used.add(`${r},${c}`);
    w += board[r][c];
  }
  return w;
}

export default {
  'longest-common-prefix': (g) => {
    const base = g.str(g.len(0, 200, 8), g.pick(['ab', 'abc']));
    return [Array.from({ length: g.len(1, 200, 8) }, () => (g.bool(0.15) ? '' : base.slice(0, g.int(0, base.length)) + (g.bool(0.6) ? g.str(g.int(0, 4), 'abc') : '')).slice(0, 200))];
  },
  'implement-trie-prefix-tree': (g) => {
    const alpha = g.pick(['ab', 'abc', 'app']);
    const pool = Array.from({ length: g.int(1, 8) }, () => g.str(g.len(1, 2000, 6), alpha));
    const word = () => (g.bool(0.6) ? g.pick(pool) : g.str(g.len(1, 2000, 6), alpha));
    const ops = ['Trie'], args = [[]];
    for (let i = 0, k = g.len(1, 60, 30); i < k; i++) {
      const op = g.pick(['insert', 'search', 'startsWith']);
      let w = word();
      if (op === 'startsWith' && g.bool(0.5)) w = w.slice(0, g.int(1, w.length));
      ops.push(op); args.push([w]);
    }
    return [ops, args];
  },
  'design-add-and-search-words-data-structure': (g) => {
    const alpha = g.pick(['ab', 'abc', 'bad']);
    const pool = Array.from({ length: g.int(1, 8) }, () => g.str(g.len(1, 25, 5), alpha));
    const ops = ['WordDictionary'], args = [[]];
    for (let i = 0, k = g.len(1, 60, 30); i < k; i++) {
      if (g.bool(0.45)) { ops.push('addWord'); args.push([g.bool(0.7) ? g.pick(pool) : g.str(g.len(1, 25, 5), alpha)]); continue; }
      const w = [...(g.bool(0.6) ? g.pick(pool) : g.str(g.len(1, 25, 5), alpha))];
      for (let d = g.int(0, 2); d > 0; d--) w[g.int(0, w.length - 1)] = '.';
      ops.push('search'); args.push([w.join('')]);
    }
    return [ops, args];
  },
  'replace-words': (g) => {
    const alpha = g.pick(['ab', 'abc', 'cat']);
    const dict = distinct(Array.from({ length: g.len(1, 1000, 6) }, () => g.str(g.len(1, 100, 3), alpha)));
    const words = Array.from({ length: g.len(1, 50, 12) }, () => (g.bool(0.5) ? g.pick(dict) + g.str(g.int(0, 3), alpha) : g.str(g.len(1, 8, 6), alpha)));
    return [dict, words.join(' ')];
  },
  'search-suggestions-system': (g) => {
    const alpha = g.pick(['ab', 'abc', 'mou']);
    const products = distinct(Array.from({ length: g.len(1, 1000, 10) }, () => g.str(g.len(1, 3000, 6), alpha)));
    const sw = g.bool(0.6) ? g.pick(products).slice(0, g.int(1, 8)) + (g.bool(0.3) ? g.str(g.int(1, 3), alpha) : '') : g.str(g.len(1, 1000, 6), alpha);
    return [products, sw];
  },
  'maximum-xor-of-two-numbers-in-an-array': (g) => [g.ints(g.len(1, 2e5, 25), 0, g.pick([2 ** 31 - 1, 15, 1, 0]))],
  'word-search-ii': (g) => {
    const m = g.len(1, 12, 5), n = g.len(1, 12, 5);
    const alpha = g.pick(['ab', 'abc', 'oathe', 'a']);
    const board = g.grid(m, n, () => g.str(1, alpha));
    const words = distinct(Array.from({ length: g.len(1, 3e4, 12) }, () => (g.bool(0.5) ? pathWord(g, board, g.int(1, 10)) : g.str(g.len(1, 10, 6), alpha))));
    return [board, words];
  },
  'extra-characters-in-a-string': (g) => {
    const alpha = g.pick(['ab', 'abc', 'leet']);
    const s = g.str(g.len(1, 50, 30), alpha);
    const dict = distinct(Array.from({ length: g.len(1, 50, 10) }, () => (g.bool(0.6) ? (() => { const i = g.int(0, s.length - 1); return s.slice(i, i + g.int(1, 6)); })() : g.str(g.len(1, 50, 4), alpha))));
    return [s, dict];
  },
};
