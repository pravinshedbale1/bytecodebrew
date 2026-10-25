const INF = 2147483647;

/** one island of 1s with no lakes, in an m × n grid */
function oneIsland(g, m, n) {
  const grid = Array.from({ length: m }, () => Array(n).fill(0));
  let r = g.int(0, m - 1), c = g.int(0, n - 1);
  grid[r][c] = 1;
  for (let k = 0, steps = g.int(0, m * n * 2); k < steps; k++) {
    const [dr, dc] = g.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    if (r + dr >= 0 && r + dr < m && c + dc >= 0 && c + dc < n) { r += dr; c += dc; grid[r][c] = 1; }
  }
  // fill lakes: water not connected to the outside becomes land
  const out = Array.from({ length: m }, () => Array(n).fill(false));
  const st = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if ((i === 0 || j === 0 || i === m - 1 || j === n - 1) && grid[i][j] === 0) { out[i][j] = true; st.push([i, j]); }
  while (st.length) {
    const [i, j] = st.pop();
    for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (a >= 0 && b >= 0 && a < m && b < n && !out[a][b] && grid[a][b] === 0) { out[a][b] = true; st.push([a, b]); }
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (grid[i][j] === 0 && !out[i][j]) grid[i][j] = 1;
  return grid;
}

const binGrid = (g, m, n, p, one = 1, zero = 0) => g.grid(m, n, () => (g.rand() < p ? one : zero));

export default {
  'flood-fill': (g) => {
    const m = g.len(1, 50, 8), n = g.len(1, 50, 8);
    const img = g.grid(m, n, g.palette(0, g.pick([2 ** 16 - 1, 2, 1])));
    const sr = g.int(0, m - 1), sc = g.int(0, n - 1);
    return [img, sr, sc, g.bool(0.25) ? img[sr][sc] : g.val(0, 2 ** 16 - 1)];
  },
  'number-of-islands': (g) => [binGrid(g, g.len(1, 300, 10), g.len(1, 300, 10), g.pick([0.3, 0.5, 0.7, 0, 1]), '1', '0')],
  'max-area-of-island': (g) => [binGrid(g, g.len(1, 50, 10), g.len(1, 50, 10), g.pick([0.3, 0.5, 0.7, 0, 1]))],
  'number-of-provinces': (g) => {
    const n = g.len(1, 200, 12);
    const p = g.pick([0, 0.1, 0.3, 1]);
    const a = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) { a[i][i] = 1; for (let j = i + 1; j < n; j++) if (g.rand() < p) a[i][j] = a[j][i] = 1; }
    return [a];
  },
  'clone-graph': (g) => {
    const n = g.len(0, 100, 10);
    if (n === 0) return [[]];
    const adj = Array.from({ length: n }, () => new Set());
    const add = (a, b) => { if (a !== b) { adj[a].add(b + 1); adj[b].add(a + 1); } };
    for (const [a, b] of g.treeEdges(n)) add(a, b);
    for (const [a, b] of g.edges(n, g.int(0, n))) add(a, b);
    return [adj.map((s) => g.shuffle([...s]))];
  },
  'rotting-oranges': (g) => { const m = g.len(1, 10, 10), n = g.len(1, 10, 10); const w = g.pick([[0.2, 0.6], [0.05, 0.9], [0.3, 0.3], [0, 1], [0.5, 0.5]]); return [g.grid(m, n, () => { const r = g.rand(); return r < w[0] ? 2 : r < w[1] ? 1 : 0; })]; },
  '01-matrix': (g) => {
    const m = g.len(1, 100, 10), n = g.len(1, Math.floor(1e4 / m), 10);
    const mat = binGrid(g, m, n, g.pick([0.5, 0.9, 0.98, 0.2]));
    mat[g.int(0, m - 1)][g.int(0, n - 1)] = 0;
    return [mat];
  },
  'shortest-path-in-binary-matrix': (g) => { const n = g.len(1, 100, 10); const grid = binGrid(g, n, n, g.pick([0.2, 0.4, 0, 0.6])); if (g.bool(0.6)) { grid[0][0] = 0; grid[n - 1][n - 1] = 0; } return [grid]; },
  'surrounded-regions': (g) => [binGrid(g, g.len(1, 200, 10), g.len(1, 200, 10), g.pick([0.3, 0.5, 0.7, 1, 0]), 'O', 'X')],
  'pacific-atlantic-water-flow': (g) => { const m = g.len(1, 200, 8), n = g.len(1, 200, 8); return [g.grid(m, n, g.palette(0, g.pick([1e5, 3, 1])))]; },
  'word-ladder': (g) => {
    const L = g.int(1, 3), alpha = g.pick(['ab', 'abc', 'hotdgc']);
    const word = () => g.str(L, alpha);
    const list = [...new Set(Array.from({ length: g.len(1, 5000, 15) }, word))];
    const begin = word();
    const end = g.bool(0.75) ? g.pick(list) : word();
    return begin === end ? null : [begin, end, list];
  },
  'island-perimeter': (g) => [oneIsland(g, g.len(1, 100, 10), g.len(1, 100, 10))],
  'find-the-town-judge': (g) => {
    const n = g.len(1, 1000, 10);
    const seen = new Set(), trust = [];
    const judge = g.bool(0.5) ? g.int(1, n) : 0;
    if (judge) for (let a = 1; a <= n; a++) if (a !== judge && g.bool(0.9)) { trust.push([a, judge]); seen.add(`${a},${judge}`); }
    for (let k = g.int(0, Math.min(1e4, n * 2)); k > 0; k--) {
      const a = g.int(1, n), b = g.int(1, n);
      if (a === b || seen.has(`${a},${b}`) || (judge && a === judge && g.bool(0.7))) continue;
      seen.add(`${a},${b}`); trust.push([a, b]);
    }
    return [n, g.shuffle(trust)];
  },
  'walls-and-gates': (g) => { const m = g.len(1, 250, 8), n = g.len(1, 250, 8); const w = g.pick([[0.2, 0.3], [0.05, 0.1], [0.4, 0.45], [0, 0.02], [0.3, 0.3]]); return [g.grid(m, n, () => { const r = g.rand(); return r < w[0] ? -1 : r < w[1] ? 0 : INF; })]; },
  'open-the-lock': (g) => {
    const code = () => g.str(4, '0123456789');
    const near = (s) => { const i = g.int(0, 3); const d = (Number(s[i]) + g.pick([1, 9])) % 10; return s.slice(0, i) + d + s.slice(i + 1); };
    const target = g.bool(0.2) ? '0000' : g.bool(0.5) ? near(near('0000')) : code();
    const dead = new Set();
    for (let k = g.len(1, 500, 15); dead.size < k;) { const d = g.bool(0.5) ? near(g.bool() ? target : '0000') : code(); if (d !== target) dead.add(d); else k--; }
    return [[...dead], target];
  },
  'evaluate-division': (g) => {
    const names = g.shuffle(['a', 'b', 'c', 'x', 'y', 'ab', 'bc', 'x1', 'z', 'cd']).slice(0, g.int(2, 8));
    const val = Object.fromEntries(names.map((v) => [v, g.int(1, 5)]));
    const eqs = [], vals = [], seen = new Set();
    for (let k = g.len(1, 20, 8), tries = 0; eqs.length < k && tries < 100; tries++) {
      const [a, b] = g.shuffle([...names]).slice(0, 2);
      if (seen.has(`${a}/${b}`) || seen.has(`${b}/${a}`)) continue;
      seen.add(`${a}/${b}`);
      eqs.push([a, b]);
      vals.push(val[a] / val[b]);
    }
    const pool = [...names, 'q', 'w'];
    const queries = Array.from({ length: g.len(1, 20, 8) }, () => [g.pick(pool), g.pick(pool)]);
    return [eqs, vals, queries];
  },
  'reconstruct-itinerary': (g) => {
    const airports = ['JFK', ...g.shuffle(['ATL', 'SFO', 'LAX', 'AAA', 'AAB', 'MUC', 'LHR', 'KUL']).slice(0, g.int(1, 5))];
    const tickets = [];
    let at = 'JFK';
    for (let k = g.len(1, 300, 15); tickets.length < k;) {
      const to = g.pick(airports.filter((x) => x !== at));
      tickets.push([at, to]);
      at = to;
    }
    return [g.shuffle(tickets)];
  },
};
