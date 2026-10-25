const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

/** solutions of a 9×9 grid (0 = empty), counting up to `limit` */
function countSudoku(grid, limit = 2) {
  const rows = Array(9).fill(0), cols = Array(9).fill(0), boxes = Array(9).fill(0), empty = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    const d = grid[r][c];
    if (!d) { empty.push([r, c]); continue; }
    const bit = 1 << d, b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    if ((rows[r] | cols[c] | boxes[b]) & bit) return 0;
    rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
  }
  let found = 0;
  const go = (k) => {
    if (found >= limit) return;
    if (k === empty.length) { found++; return; }
    const [r, c] = empty[k], b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if ((rows[r] | cols[c] | boxes[b]) & bit) continue;
      rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
      go(k + 1);
      rows[r] ^= bit; cols[c] ^= bit; boxes[b] ^= bit;
    }
  };
  go(0);
  return found;
}

function solvedSudoku(g) {
  const digits = g.perm(9, 1);
  const band = () => g.shuffle([0, 1, 2]).flatMap((b) => g.shuffle([0, 1, 2]).map((r) => b * 3 + r));
  const rows = band(), cols = band();
  return rows.map((r) => cols.map((c) => digits[(r * 3 + Math.floor(r / 3) + c) % 9]));
}

export default {
  subsets: (g) => [g.ints(g.len(1, 8, 8), -10, 10, { distinct: true })],
  combinations: (g) => { const n = g.int(1, 20); const ks = Array.from({ length: n }, (_, i) => i + 1).filter((k) => choose(n, k) <= 250); return [n, g.pick(ks)]; },
  permutations: (g) => [g.ints(g.bool(0.05) ? 6 : g.pick([1, 2, 3, 4, 4, 5]), -10, 10, { distinct: true })],
  'combination-sum': (g) => [g.ints(g.len(1, 30, 8), 2, 40, { distinct: true }), g.pick([1, 2, 40, g.int(1, 40), g.int(1, 20)])],
  'letter-combinations-of-a-phone-number': (g) => [g.str(g.len(0, 4, 4), '23456789')],
  'generate-parentheses': { all: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => [n]) },
  'subsets-ii': (g) => [g.ints(g.len(1, 8, 8), -10, g.pick([10, -8]))],
  'combination-sum-ii': (g) => [g.ints(g.len(1, 100, 15), 1, g.pick([50, 5, 2])), g.pick([1, 30, g.int(1, 30), g.int(1, 10)])],
  'permutations-ii': (g) => [g.ints(g.pick([1, 2, 3, 4, 5, 6]), -10, g.pick([10, -9, -8]))],
  'palindrome-partitioning': (g) => { const alpha = g.pick(['a', 'ab', 'aab', 'abc']); return [g.str(g.len(1, alpha === 'a' ? 8 : 11, 11), alpha)]; },
  'word-search': (g) => {
    const m = g.len(1, 6, 6), n = g.len(1, 6, 6);
    const alpha = g.pick(['AB', 'ABC', 'aA', 'AaBb', 'A']);
    const board = g.grid(m, n, () => g.str(1, alpha));
    let word;
    if (g.bool(0.5)) {
      let r = g.int(0, m - 1), c = g.int(0, n - 1);
      const used = new Set([`${r},${c}`]);
      word = board[r][c];
      for (let len = g.int(1, 15); word.length < len;) {
        const next = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < m && b < n && !used.has(`${a},${b}`));
        if (!next.length) break;
        [r, c] = g.pick(next); used.add(`${r},${c}`); word += board[r][c];
      }
    } else word = g.str(g.len(1, 15, 8), alpha);
    return [board, word];
  },
  'n-queens': { all: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [n]) },
  'sudoku-solver': {
    n: 8,
    gen: (g) => {
      const grid = solvedSudoku(g);
      const cells = g.shuffle(Array.from({ length: 81 }, (_, i) => i));
      const target = g.int(25, 45);
      let clues = 81;
      for (const i of cells) {
        if (clues <= target) break;
        const r = Math.floor(i / 9), c = i % 9, keep = grid[r][c];
        grid[r][c] = 0;
        if (countSudoku(grid) !== 1) grid[r][c] = keep; else clues--;
      }
      return [grid.map((row) => row.map((d) => (d ? String(d) : '.')))];
    },
  },
  'sum-of-all-subset-xor-totals': (g) => [g.ints(g.len(1, 12, 12), 1, g.pick([20, 3, 1]))],
  'matchsticks-to-square': (g) => {
    const n = g.len(1, 15, 15);
    if (g.bool(0.5) && n >= 4) {
      // build a square: split a side length into pieces four times
      const side = g.pick([g.int(1, 12), g.int(1, 1e8)]);
      const out = [];
      for (let s = 0; s < 4; s++) { let left = side; const parts = g.int(1, Math.max(1, Math.floor(n / 4))); for (let k = 1; k < parts && left > 1; k++) { const p = g.int(1, left - 1); out.push(p); left -= p; } out.push(left); }
      if (out.length > 15) return null;
      if (g.bool(0.2)) out[0] += 1;
      return [g.shuffle(out)];
    }
    return [g.ints(n, 1, g.pick([1e8, 5, 10]))];
  },
  'n-queens-ii': { all: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [n]) },
  'word-break-ii': (g) => {
    const alpha = g.pick(['ab', 'abc', 'cat', 'a']);
    const s = g.str(g.len(1, alpha === 'a' ? 12 : 20, 16), alpha);
    const dict = [...new Set(Array.from({ length: g.len(1, 1000, 8) }, () => { if (g.bool(0.6)) { const i = g.int(0, s.length - 1); return s.slice(i, i + g.int(1, 4)); } return g.str(g.len(1, 10, 3), alpha); }))];
    return [s, dict];
  },
};
