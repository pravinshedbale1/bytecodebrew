/**
 * Graph step-throughs (models for <IslandsViz>, <GridBfsViz>, <TopoViz>, <UnionFindViz> and
 * <DijkstraViz>). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, plural, rng } from './util.js';

const key = (r, c) => `${r},${c}`;
const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** "110; 011" (rows by ; or new lines, one digit per cell) → number[][] with digits from `allowed`. */
export function parseGrid(text, { allowed = '01', maxR = 6, maxC = 8, name = 'grid' } = {}) {
  const rows = String(text ?? '').split(/[;\n|]/).map((r) => r.replace(/[\s,]/g, '')).filter(Boolean);
  if (!rows.length) return { error: `Type the ${name} row by row, separated by ; for example 110; 011.` };
  if (rows.length > maxR) return { error: `Use at most ${maxR} rows so the grid fits.` };
  const w = rows[0].length;
  if (rows.some((r) => r.length !== w)) return { error: 'Every row needs the same number of cells.' };
  if (w > maxC) return { error: `Use at most ${maxC} columns so the grid fits.` };
  if (rows.some((r) => [...r].some((ch) => !allowed.includes(ch)))) return { error: `Cells can only be ${[...allowed].join(', ')}.` };
  return { grid: rows.map((r) => [...r].map(Number)) };
}

export const gridText = (g) => g.map((r) => r.join('')).join('; ');

// ---------------------------------------------------------------- islands (DFS)

export const ISLANDS = {
  count: { label: 'Count islands', input: { mode: 'count', grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]] } },
  area: { label: 'Biggest island', input: { mode: 'area', grid: [[1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1], [1, 1, 0, 0, 1, 1]] } },
};

export const islandsCode = (mode) => [
  ['scan', 'for every cell: if (land and not visited) { ' + (mode === 'count' ? 'count++;' : 'best = max(best, area(r, c));') + ' explore it }'],
  ['stop', '  if (off the grid || water || visited) return' + (mode === 'count' ? ';' : ' 0;')],
  ['mark', '  mark (r, c) visited;'],
  ['dirs', mode === 'count' ? '  sink(down); sink(up); sink(right); sink(left);' : '  return 1 + area(down) + area(up) + area(right) + area(left);'],
];

export function islandsAnswer({ mode, grid }) {
  const R = grid.length, C = grid[0].length;
  const seen = new Set();
  const sizes = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (grid[r][c] !== 1 || seen.has(key(r, c))) continue;
    let size = 0;
    const st = [[r, c]];
    seen.add(key(r, c));
    while (st.length) {
      const [a, b] = st.pop();
      size++;
      for (const [dr, dc] of DIRS4) {
        const x = a + dr, y = b + dc;
        if (x >= 0 && y >= 0 && x < R && y < C && grid[x][y] === 1 && !seen.has(key(x, y))) { seen.add(key(x, y)); st.push([x, y]); }
      }
    }
    sizes.push(size);
  }
  return mode === 'count' ? sizes.length : Math.max(0, ...sizes);
}

export function islands({ mode, grid }) {
  const R = grid.length, C = grid[0].length;
  const owner = grid.map((row) => row.map(() => 0));   // island number, 0 = not visited
  const stack = [];
  let count = 0;
  let best = 0;
  let area = 0;
  const steps = [];
  const snap = (x) => steps.push({ grid, owner: owner.map((r) => [...r]), stack: stack.map((p) => [...p]), count, best, area, ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: mode === 'count' ? 'How many islands?' : 'How big is the biggest island?',
    text: `1 is land, 0 is water; land cells touching up, down, left or right belong to the same island. Scan every cell. Each time you hit land you haven't visited, that's a new island: explore all of it with DFS, marking every cell you touch so it's never counted twice.`,
    calc: [`${R} × ${C} grid`],
  });
  const dfs = (r, c) => {
    owner[r][c] = count;
    stack.push([r, c]);
    area++;
    const next = DIRS4.map(([dr, dc]) => [r + dr, c + dc]).filter(([x, y]) => x >= 0 && y >= 0 && x < R && y < C && grid[x][y] === 1 && !owner[x][y]);
    snap({
      kind: 'visit', cur: [r, c], lines: ['stop', 'mark', 'dirs'],
      title: `Visit (${r}, ${c}): mark it, try its neighbours`,
      text: `(${r}, ${c}) is land and not visited yet, so it joins island ${count}${mode === 'area' ? ` (area so far ${area})` : ''}. Mark it, then call DFS on its four neighbours. ${next.length ? `${next.map(([x, y]) => `(${x}, ${y})`).join(', ')} ${next.length === 1 ? 'is' : 'are'} unvisited land.` : 'None of them is unvisited land: water, the edge, or already visited all return at once.'}`,
      calc: [`depth ${stack.length}`, mode === 'area' ? `area = ${area}` : `island ${count}`],
    });
    for (const [dr, dc] of DIRS4) {
      const x = r + dr, y = c + dc;
      if (x >= 0 && y >= 0 && x < R && y < C && grid[x][y] === 1 && !owner[x][y]) dfs(x, y);
    }
    stack.pop();
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (grid[r][c] !== 1 || owner[r][c]) continue;
    count++;
    area = 0;
    snap({
      kind: 'found', cur: [r, c], lines: ['scan'],
      title: `New island ${count} at (${r}, ${c})`,
      text: `The scan reached land at (${r}, ${c}) that no DFS has marked, so it starts a new island${mode === 'count' ? `: count = ${count}` : ''}. Now explore all of it before the scan moves on.`,
      calc: [mode === 'count' ? `count = ${count}` : `best so far = ${best}`],
    });
    dfs(r, c);
    const better = area > best;
    best = Math.max(best, area);
    snap({
      kind: 'island', cur: null, finished: count, lines: ['scan'],
      title: `Island ${count} done: ${plural(area, 'cell')}`,
      text: `The DFS returned: every cell of island ${count} is marked${mode === 'area' ? `, and its area is ${area}. ${better ? `That's the biggest so far.` : `Not bigger than ${best}.`}` : '.'} The scan carries on; marked cells will be skipped.`,
      calc: mode === 'count' ? [`count = ${count}`] : [`area ${area}`, `best = ${best}`],
    });
  }
  const answer = mode === 'count' ? `${count} islands` : `biggest area = ${best}`;
  snap({
    kind: 'done', cur: null, lines: [], answer,
    title: answer,
    text: `Every cell was visited at most once by a DFS and once by the scan: O(rows × cols). Counting the DFS starts is the connected-components template; it works the same way on any graph.`,
    calc: [answer],
  });
  return steps;
}

export function parseIslands(values, input) {
  const g = parseGrid(values.grid, { allowed: '01', maxR: 6, maxC: 8 });
  return g.error ? g : { input: { mode: input.mode, grid: g.grid } };
}

export function randomIslands(input, rand = Math.random) {
  const g = rng(rand);
  const R = g.int(3, 5), C = g.int(4, 7);
  return { mode: input.mode, grid: Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.45) ? 1 : 0))) };
}

// ---------------------------------------------------------------- BFS in rings (shortest path, rotting oranges)

export const GRID_BFS = {
  path: { label: 'Shortest path (8 ways)', input: { mode: 'path', grid: [[0, 0, 0, 1, 0], [1, 1, 0, 1, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 1, 0]] } },
  oranges: { label: 'Rotting oranges', input: { mode: 'oranges', grid: [[2, 1, 1, 0], [1, 1, 0, 1], [0, 1, 1, 1], [0, 0, 1, 2]] } },
  stuck: { label: 'An orange out of reach', input: { mode: 'oranges', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] } },
};

export const gridBfsCode = (mode) => (mode === 'path'
  ? [
    ['start', 'dist[0][0] = 1;  queue = [(0, 0)];'],
    ['level', 'take the whole queue: every cell at distance d'],
    ['nbr', '  for each of 8 neighbours: open and unseen → dist = d + 1, enqueue   // mark when ENQUEUING'],
    ['end', 'the first time (n-1, n-1) is reached, its dist is the shortest'],
  ]
  : [
    ['start', 'queue = every rotten orange;  fresh = count of fresh   // many sources at once'],
    ['level', 'int size = queue.size();   // one level = one minute'],
    ['nbr', '  for each of 4 neighbours: fresh → rotten, fresh--, enqueue'],
    ['end', 'return fresh == 0 ? minutes : -1;'],
  ]);

export function gridBfsAnswer({ mode, grid }) {
  const R = grid.length, C = grid[0].length;
  if (mode === 'path') {
    if (grid[0][0] || grid[R - 1][C - 1]) return -1;
    const dist = grid.map((r) => r.map(() => 0));
    dist[0][0] = 1;
    const q = [[0, 0]];
    while (q.length) {
      const [r, c] = q.shift();
      if (r === R - 1 && c === C - 1) return dist[r][c];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const x = r + dr, y = c + dc;
        if (x >= 0 && y >= 0 && x < R && y < C && !grid[x][y] && !dist[x][y]) { dist[x][y] = dist[r][c] + 1; q.push([x, y]); }
      }
    }
    return -1;
  }
  const g = grid.map((r) => [...r]);
  let q = [];
  let fresh = 0;
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) q.push([r, c]); if (v === 1) fresh++; }));
  let minutes = 0;
  while (q.length && fresh) {
    const nq = [];
    for (const [r, c] of q) for (const [dr, dc] of DIRS4) {
      const x = r + dr, y = c + dc;
      if (x >= 0 && y >= 0 && x < R && y < C && g[x][y] === 1) { g[x][y] = 2; fresh--; nq.push([x, y]); }
    }
    q = nq;
    minutes++;
  }
  return fresh ? -1 : minutes;
}

export function gridBfs({ mode, grid }) {
  const R = grid.length, C = grid[0].length;
  const dist = grid.map((r) => r.map(() => null));   // ring number for every reached cell
  const state = grid.map((r) => [...r]);
  const steps = [];
  let queue = [];
  const snap = (x) => steps.push({ grid, state: state.map((r) => [...r]), dist: dist.map((r) => [...r]), queue: queue.map((p) => [...p]), ...x });
  if (mode === 'path') {
    snap({
      kind: 'start', ring: null, lines: [],
      title: 'Fewest steps from the top-left to the bottom-right',
      text: '0 is open, 1 is blocked, and a step can go to any of the 8 neighbours (diagonals too). BFS explores in rings: everything 1 step away, then 2 steps, and so on. So the first time it reaches the corner, it has found a shortest path.',
      calc: [`${R} × ${C} grid`],
    });
    if (grid[0][0] || grid[R - 1][C - 1]) {
      snap({ kind: 'done', ring: null, lines: ['start'], answer: '-1', title: 'A corner is blocked: −1', text: 'The start or the end is blocked, so there is no path at all.', calc: ['return -1'] });
      return steps;
    }
    dist[0][0] = 1;
    queue = [[0, 0]];
    snap({ kind: 'ring', ring: 1, fresh: [[0, 0]], lines: ['start'], title: 'Ring 1: the start cell', text: 'The path length counts cells, so the start is distance 1. It is marked and queued.', calc: ['dist[0][0] = 1', 'queue: (0, 0)'] });
    let d = 1;
    while (queue.length) {
      if (queue.some(([r, c]) => r === R - 1 && c === C - 1)) break;
      const next = [];
      for (const [r, c] of queue) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const x = r + dr, y = c + dc;
        if (x >= 0 && y >= 0 && x < R && y < C && !grid[x][y] && dist[x][y] === null) { dist[x][y] = d + 1; next.push([x, y]); }
      }
      queue = next;
      d++;
      if (!next.length) break;
      const reached = next.some(([r, c]) => r === R - 1 && c === C - 1);
      snap({
        kind: reached ? 'found' : 'ring', ring: d, fresh: next, lines: ['level', 'nbr'],
        title: reached ? `Ring ${d} reaches the corner: ${d} cells` : `Ring ${d}: ${plural(next.length, 'new cell')}`,
        text: reached
          ? `The bottom-right corner is in ring ${d}. BFS reaches every cell of ring ${d - 1} before any of ring ${d}, so no shorter path can exist. Answer: ${d}.`
          : `Every open, unseen neighbour of ring ${d - 1} is ${d} steps from the start. They are marked as soon as they are queued, so no cell is ever queued twice.`,
        calc: [`ring ${d}: ${next.map(([r, c]) => `(${r},${c})`).join(' ')}`],
      });
      if (reached) break;
    }
    const ans = dist[R - 1][C - 1] ?? -1;
    snap({ kind: 'done', ring: null, lines: ['end'], answer: `${ans}`, title: ans === -1 ? 'The corner was never reached: −1' : `Shortest path: ${ans} cells`, text: ans === -1 ? 'BFS ran out of cells to explore without touching the corner, so it is walled off.' : 'Each cell went into the queue at most once: O(n²) for an n × n grid. A DFS could also find a path, but not, without exploring everything, the shortest one.', calc: [`return ${ans}`] });
    return steps;
  }
  let fresh = 0;
  grid.forEach((row, r) => row.forEach((v, c) => { if (v === 2) { queue.push([r, c]); dist[r][c] = 0; } if (v === 1) fresh++; }));
  snap({
    kind: 'start', ring: 0, fresh: queue.map((p) => [...p]), lines: ['start'],
    title: `Minute 0: ${plural(queue.length, 'rotten orange')}, ${fresh} fresh`,
    text: 'Rot spreads to the 4 neighbours of a rotten orange every minute. All the rotten oranges start in the queue together, so they spread at the same time, and each fresh orange is reached by its nearest source: multi-source BFS.',
    calc: [`queue: ${queue.map(([r, c]) => `(${r},${c})`).join(' ')}`, `fresh = ${fresh}`],
  });
  let minutes = 0;
  while (queue.length && fresh) {
    const next = [];
    for (const [r, c] of queue) for (const [dr, dc] of DIRS4) {
      const x = r + dr, y = c + dc;
      if (x >= 0 && y >= 0 && x < R && y < C && state[x][y] === 1) { state[x][y] = 2; dist[x][y] = minutes + 1; fresh--; next.push([x, y]); }
    }
    queue = next;
    if (!next.length) break;
    minutes++;
    snap({
      kind: 'ring', ring: minutes, fresh: next, lines: ['level', 'nbr'],
      title: `Minute ${minutes}: ${plural(next.length, 'orange')} rot${next.length === 1 ? 's' : ''}`,
      text: `Every orange that went rotten last minute infects its fresh neighbours. ${fresh ? `${fresh} fresh left.` : 'No fresh oranges left.'}`,
      calc: [`newly rotten: ${next.map(([r, c]) => `(${r},${c})`).join(' ')}`, `fresh = ${fresh}`],
    });
  }
  const ans = fresh ? -1 : minutes;
  snap({
    kind: 'done', ring: null, fresh: [], lines: ['end'], answer: `${ans}`,
    title: fresh ? `${plural(fresh, 'orange')} can never rot: −1` : `All rotten after ${minutes} minute${minutes === 1 ? '' : 's'}`,
    text: fresh ? 'The queue is empty but fresh oranges remain: nothing rotten can ever reach them (they are walled off by empty cells). Return −1.' : `One BFS from all sources at once: O(rows × cols), instead of a separate BFS from every rotten orange.`,
    calc: [`return ${ans}`],
  });
  return steps;
}

export function parseGridBfs(values, input) {
  const g = parseGrid(values.grid, { allowed: input.mode === 'path' ? '01' : '012', maxR: 6, maxC: 7 });
  if (g.error) return g;
  if (input.mode === 'oranges' && !g.grid.flat().includes(2)) return { error: 'Put at least one rotten orange (2) in the grid.' };
  return { input: { mode: input.mode, grid: g.grid } };
}

export function randomGridBfs(input, rand = Math.random) {
  const g = rng(rand);
  const R = g.int(4, 5), C = g.int(4, 6);
  if (input.mode === 'path') {
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.25) ? 1 : 0)));
    grid[0][0] = 0; grid[R - 1][C - 1] = 0;
    return { mode: 'path', grid };
  }
  const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.2) ? 0 : 1)));
  grid[g.int(0, R - 1)][g.int(0, C - 1)] = 2;
  return { mode: 'oranges', grid };
}

// ---------------------------------------------------------------- topological sort (Kahn)

export const TOPO = {
  courses: { label: 'Courses', input: { n: 6, edges: [[0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]] } },
  cycle: { label: 'With a cycle', input: { n: 5, edges: [[0, 1], [1, 2], [2, 3], [3, 1], [0, 4]] } },
};

export const topoCode = [
  ['init', 'for each course: if (indegree == 0) queue.offer(it);    // nothing blocks these'],
  ['take', 'u = queue.poll();  order.add(u);'],
  ['dec', 'for v after u: if (--indegree[v] == 0) queue.offer(v);  // u was its last blocker'],
  ['end', 'return order.size() == n ? order : [];   // fewer than n → a cycle'],
];

export function topoAnswer({ n, edges }) {
  const indeg = Array(n).fill(0), adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); indeg[b]++; }
  const q = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
  const order = [];
  while (q.length) { const u = q.shift(); order.push(u); for (const v of adj[u]) if (--indeg[v] === 0) q.push(v); }
  return order.length === n ? order : null;
}

export function topo({ n, edges }) {
  const indeg = Array(n).fill(0);
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); indeg[b]++; }
  const queue = [];
  const order = [];
  const steps = [];
  const snap = (x) => steps.push({ n, edges, indeg: [...indeg], queue: [...queue], order: [...order], ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'In what order can the courses be taken?',
    text: 'An arrow a → b means a must come before b. The number on each course is its in-degree: how many of its prerequisites are still unfinished. A course with 0 is ready.',
    calc: [`in-degree: ${indeg.map((d, k) => `${k}:${d}`).join(' ')}`],
  });
  for (let i = 0; i < n; i++) if (!indeg[i]) queue.push(i);
  snap({
    kind: 'ready', cur: null, fresh: [...queue], lines: ['init'],
    title: `Ready at the start: ${queue.length ? queue.join(', ') : 'nothing'}`,
    text: queue.length ? `${queue.join(' and ')} ${queue.length === 1 ? 'has' : 'have'} no prerequisites, so ${queue.length === 1 ? 'it goes' : 'they go'} into the queue of ready courses.` : 'Every course is waiting for another one: nothing can ever start.',
    calc: [`queue: ${list(queue)}`],
  });
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    const freed = [];
    for (const v of adj[u]) { indeg[v]--; if (indeg[v] === 0) { queue.push(v); freed.push(v); } }
    snap({
      kind: 'take', cur: u, touched: adj[u], fresh: freed, lines: ['take', 'dec'],
      title: `Take ${u}${freed.length ? `: ${freed.join(', ')} ${freed.length === 1 ? 'becomes' : 'become'} ready` : ''}`,
      text: `${u} is done, position ${order.length} in the order. ${adj[u].length ? `Every course after it (${adj[u].join(', ')}) has one prerequisite fewer.${freed.length ? ` ${freed.join(' and ')} just reached 0, so ${freed.length === 1 ? 'it joins' : 'they join'} the queue.` : ' None of them reached 0 yet.'}` : 'Nothing depends on it.'}`,
      calc: [`order: ${list(order)}`, `queue: ${list(queue)}`],
    });
  }
  const ok = order.length === n;
  const stuck = indeg.map((d, k) => [k, d]).filter(([, d]) => d > 0).map(([k]) => k);
  snap({
    kind: ok ? 'done' : 'cycle', cur: null, stuck, lines: ['end'], answer: ok ? `order ${list(order)}` : `cycle: ${list(stuck)} never become ready`,
    title: ok ? `A valid order: ${list(order)}` : `Only ${order.length} of ${n} taken: a cycle`,
    text: ok
      ? 'Every course was taken after all of its prerequisites. Each course and each arrow was handled once: O(V + E).'
      : `The queue is empty, but ${stuck.join(', ')} still wait for each other: they form a cycle, so none of them ever reaches 0. Fewer than n courses in the order is exactly how Kahn's algorithm detects a cycle.`,
    calc: [`taken ${order.length} of ${n}`],
  });
  return steps;
}

export function parseEdges(text, { maxN = 8, letters = false } = {}) {
  const parts = String(text ?? '').split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return { error: 'Type edges like 0>2, 1>2.' };
  const edges = [];
  for (const p of parts) {
    const m = letters ? p.match(/^([A-Ga-g])\s*(?:>|->|→)\s*([A-Ga-g])\s+(\d{1,2})$/) : p.match(/^(\d)\s*(?:>|->|→)\s*(\d)$/);
    if (!m) return { error: letters ? `"${p}" should look like A>B 4.` : `"${p}" should look like 0>2.` };
    edges.push(letters ? [m[1].toUpperCase(), m[2].toUpperCase(), Number(m[3])] : [Number(m[1]), Number(m[2])]);
  }
  if (edges.length > 12) return { error: 'Use at most 12 edges so the drawing stays readable.' };
  if (!letters) {
    const n = Math.max(...edges.flat()) + 1;
    if (n > maxN) return { error: `Number the nodes 0 to ${maxN - 1}.` };
    if (edges.some(([a, b]) => a === b)) return { error: 'An edge from a node to itself is a cycle on its own; leave it out.' };
    return { n, edges };
  }
  return { edges };
}

export function parseTopo(values) {
  const r = parseEdges(values.edges);
  return r.error ? r : { input: { n: r.n, edges: r.edges } };
}

export function randomTopo(rand = Math.random) {
  const g = rng(rand);
  const n = g.int(5, 7);
  const edges = [];
  const perm = g.shuffle(Array.from({ length: n }, (_, k) => k));
  for (let k = 0; k < n + 2 && edges.length < 9; k++) {
    const a = g.int(0, n - 2), b = g.int(a + 1, n - 1);
    const e = [perm[a], perm[b]];
    if (!edges.some(([x, y]) => x === e[0] && y === e[1])) edges.push(e);
  }
  if (g.bool(0.25)) edges.push([perm[n - 1], perm[0]]);
  return { n: Math.max(...edges.flat()) + 1, edges };
}

/** Columns for drawing a directed graph: the longest chain of prerequisites before each node; cycle members last. */
export function topoLayers({ n, edges }) {
  const layer = Array(n).fill(0);
  const order = topoAnswer({ n, edges }) ?? [];
  const inOrder = new Set(order);
  for (const u of order) for (const [a, b] of edges) if (a === u) layer[b] = Math.max(layer[b], layer[u] + 1);
  const last = Math.max(0, ...order.map((u) => layer[u])) + 1;
  for (let k = 0; k < n; k++) if (!inOrder.has(k)) layer[k] = last;
  return layer;
}

// ---------------------------------------------------------------- union-find

export const UNION_FIND = {
  groups: { label: 'Merging groups', input: { n: 7, ops: [['u', 0, 1], ['u', 2, 3], ['u', 4, 5], ['u', 1, 3], ['u', 3, 5], ['u', 0, 6], ['f', 3]] } },
  redundant: { label: 'Redundant connection', input: { n: 6, ops: [['u', 1, 2], ['u', 2, 3], ['u', 3, 4], ['u', 1, 4], ['u', 1, 5]], redundant: true } },
};

export const unionFindCode = [
  ['find', 'find(x): while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }   // halve the path'],
  ['same', 'union(a, b): ra = find(a), rb = find(b);  if (ra == rb) return false;            // already together'],
  ['link', '  put the smaller tree under the bigger root;  size[ra] += size[rb];  groups--;'],
];

export function unionFind({ n, ops, redundant }) {
  const parent = Array.from({ length: n }, (_, k) => k);
  const size = Array(n).fill(1);
  let groups = redundant ? n - 1 : n;     // node 0 is unused when nodes are numbered 1..n−1
  const steps = [];
  const snap = (x) => steps.push({ n, redundant: Boolean(redundant), parent: [...parent], size: [...size], groups, ...x });
  const find = (x) => {
    const walk = [x];
    for (let y = x; parent[y] !== y;) { y = parent[y]; walk.push(y); }   // the chain as it was, before halving
    const rewired = [];
    while (parent[x] !== x) {
      if (parent[parent[x]] !== parent[x]) rewired.push([x, parent[parent[x]]]);
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return { root: x, walk, rewired };
  };
  snap({
    kind: 'start', lines: [],
    title: redundant ? 'Add the edges one by one: which one closes a cycle?' : `${n} people, each in their own group`,
    text: redundant
      ? 'The edges form a tree plus one extra edge. Add them one at a time with union. The first edge whose two ends already have the same root connects two nodes that were already connected: it closes the cycle.'
      : 'Every person points to a parent. Following parents leads to the root, the group\'s representative. At the start everyone is their own root. Two people are in the same group exactly when they have the same root.',
    calc: [`groups = ${groups}`],
  });
  for (const op of ops) {
    if (op[0] === 'f') {
      const x = op[1];
      const before = [...parent];
      const { root, walk, rewired } = find(x);
      snap({
        kind: 'find', a: x, walk, rewired, before, lines: ['find'],
        title: `find(${x}): the root is ${root}`,
        text: `Follow parents from ${x}: ${walk.join(' → ')}, ${plural(walk.length - 1, 'link')} up to the root. ${rewired.length ? `Path halving rewires on the way: ${rewired.map(([a, b]) => `${a} now points straight to its grandparent ${b}`).join(', ')}, so the next find from here is shorter.` : 'The path is already as short as it gets; nothing to rewire.'} With union by size and path compression, operations are effectively O(1).`,
        calc: [`path: ${walk.join(' → ')}`],
      });
      continue;
    }
    const [, a, b] = op;
    const fa = find(a), fb = find(b);
    if (fa.root === fb.root) {
      snap({
        kind: 'same', a, b, ra: fa.root, rb: fb.root, lines: ['same'], ...(redundant ? { answer: `redundant edge [${a}, ${b}]` } : {}),
        title: redundant ? `[${a}, ${b}] closes a cycle: it's the redundant edge` : `union(${a}, ${b}): already in one group`,
        text: `find(${a}) and find(${b}) both give ${fa.root}: they are already connected through other edges. union returns false${redundant ? ', which is exactly the cycle: this edge is the answer.' : ', and nothing changes.'}`,
        calc: [`find(${a}) = ${fa.root}`, `find(${b}) = ${fb.root}`, 'return false'],
      });
      if (redundant) return steps;
      continue;
    }
    let ra = fa.root, rb = fb.root;
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    size[ra] += size[rb];
    groups--;
    snap({
      kind: 'union', a, b, ra, rb, lines: ['same', 'link'],
      title: `union(${a}, ${b}): put ${rb} under ${ra}`,
      text: `The roots are ${fa.root} and ${fb.root}. ${size[ra] - size[rb] === size[rb] ? `Both groups have ${plural(size[rb], 'member')}, so either root could go under the other: ${rb} goes under ${ra}.` : `${rb}'s group is smaller (${size[rb]} against ${size[ra] - size[rb]}), so ${rb} goes under ${ra}: hanging the smaller tree under the bigger one keeps the trees shallow.`}${[...fa.rewired, ...fb.rewired].length ? ` (The finds also shortened a path: ${[...fa.rewired, ...fb.rewired].map(([p2, q2]) => `${p2} now points to ${q2}`).join(', ')}.)` : ''} Groups: ${groups}.`,
      calc: [`find(${a}) = ${fa.root}, find(${b}) = ${fb.root}`, `parent[${rb}] = ${ra}, size ${size[ra]}`],
    });
  }
  snap({
    kind: 'done', lines: [], answer: redundant ? 'no redundant edge' : `${groups} group${groups === 1 ? '' : 's'}`,
    title: redundant ? 'No edge closed a cycle' : `${plural(groups, 'group')} left`,
    text: redundant ? 'Every edge joined two separate groups.' : 'union returns false when the two are already together: a free cycle detector, which is how Kruskal and "redundant connection" use it.',
    calc: [`groups = ${groups}`],
  });
  return steps;
}

export function parseUnionFind(values, input) {
  if (input.redundant) {
    const parts = String(values.ops ?? '').split(/[;,\n]+/).map((p) => p.trim()).filter(Boolean);
    const ops = [];
    for (const p of parts) {
      const m = p.match(/^(\d)\s*[-–]\s*(\d)$/);
      if (!m) return { error: `"${p}" should look like 1-2.` };
      ops.push(['u', Number(m[1]), Number(m[2])]);
    }
    if (ops.length < 2 || ops.length > 9) return { error: 'Use 2 to 9 edges.' };
    const n = Math.max(...ops.flatMap(([, a, b]) => [a, b])) + 1;
    return { input: { n, ops, redundant: true } };
  }
  const parts = String(values.ops ?? '').split(/[;,\n]+/).map((p) => p.trim()).filter(Boolean);
  const ops = [];
  for (const p of parts) {
    let m = p.match(/^u\s*\(?\s*(\d)\s*[ ,-]\s*(\d)\s*\)?$/i) || p.match(/^(\d)\s*[-–]\s*(\d)$/);
    if (m) { ops.push(['u', Number(m[1]), Number(m[2])]); continue; }
    m = p.match(/^f\s*\(?\s*(\d)\s*\)?$/i);
    if (m) { ops.push(['f', Number(m[1])]); continue; }
    return { error: `"${p}" should look like 0-1 (union) or f3 (find).` };
  }
  if (!ops.length || ops.length > 10) return { error: 'Use 1 to 10 operations.' };
  const n = Math.max(6, ...ops.flatMap((o) => o.slice(1))) + 1;
  if (n > 8) return { error: 'Number the people 0 to 7.' };
  return { input: { n, ops } };
}

export const unionOpsText = (ops, redundant) => ops.map((o) => (o[0] === 'f' ? `f${o[1]}` : `${o[1]}-${o[2]}`)).join(', ');

export function randomUnionFind(input, rand = Math.random) {
  const g = rng(rand);
  if (input.redundant) {
    const n = g.int(4, 6);
    const ops = [];
    for (let v = 2; v <= n; v++) ops.push(['u', g.int(1, v - 1), v]);
    const a = g.int(1, n), b = g.int(1, n);
    ops.splice(g.int(1, ops.length), 0, ['u', Math.min(a, b) === Math.max(a, b) ? 1 : Math.min(a, b), Math.max(a, b) === Math.min(a, b) ? n : Math.max(a, b)]);
    return { n: n + 1, ops, redundant: true };
  }
  const ops = Array.from({ length: g.int(5, 7) }, () => ['u', g.int(0, 6), g.int(0, 6)]).filter(([, a, b]) => a !== b);
  ops.push(['f', g.int(0, 6)]);
  return { n: 7, ops };
}

// ---------------------------------------------------------------- Dijkstra

export const DIJKSTRA = {
  lesson: { label: 'From A', input: { src: 'A', edges: [['A', 'B', 4], ['A', 'C', 1], ['C', 'B', 2], ['B', 'D', 1], ['C', 'D', 5], ['D', 'E', 3]] } },
  detour: { label: 'The long way is cheaper', input: { src: 'A', edges: [['A', 'B', 10], ['A', 'C', 2], ['C', 'D', 2], ['D', 'B', 3], ['B', 'E', 1], ['D', 'E', 9]] } },
};

export const dijkstraCode = [
  ['pop', 'top = pq.poll();  if (top.d > dist[top.u]) continue;   // stale: already finalised cheaper'],
  ['final', 'dist[u] is final: nothing found later can be cheaper (weights ≥ 0)'],
  ['relax', 'for each edge u → v (w): if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.offer(v); }'],
];

export const nodesOf = (edges, src) => [...new Set([src, ...edges.flatMap(([a, b]) => [a, b])])].sort();

export function dijkstraAnswer({ src, edges }) {
  const nodes = nodesOf(edges, src);
  const dist = Object.fromEntries(nodes.map((v) => [v, Infinity]));
  dist[src] = 0;
  for (let k = 0; k < nodes.length; k++) for (const [a, b, w] of edges) if (dist[a] + w < dist[b]) dist[b] = dist[a] + w;
  return dist;
}

const fmt = (d) => (d === Infinity ? '∞' : d);

export function dijkstra({ src, edges }) {
  const nodes = nodesOf(edges, src);
  const dist = Object.fromEntries(nodes.map((v) => [v, Infinity]));
  const prev = {};
  const done = new Set();
  let pq = [];
  const steps = [];
  const push = (u, d) => { pq.push({ u, d }); pq.sort((x, y) => x.d - y.d || (x.u < y.u ? -1 : 1)); };
  const snap = (x) => steps.push({ src, edges, nodes, dist: { ...dist }, prev: { ...prev }, done: [...done], pq: pq.map((e) => ({ ...e })), ...x });
  dist[src] = 0;
  push(src, 0);
  snap({
    kind: 'start', cur: null, lines: [],
    title: `Cheapest distance from ${src} to everything`,
    text: `Every node keeps a best-known distance (∞ at first, 0 for ${src}). The priority queue always hands out the closest node not yet finished. Because no edge is negative, nothing found later can make that node cheaper, so its distance is final.`,
    calc: [`dist ${src} = 0, others ∞`, `queue: ${src}(0)`],
  });
  while (pq.length) {
    const { u, d } = pq.shift();
    if (d > dist[u] || done.has(u)) {
      snap({ kind: 'stale', cur: u, lines: ['pop'], title: `${u}(${d}) is stale: skip`, text: `${u} came out of the queue with ${d}, but it was already finalised at ${dist[u]}. When a distance improves, Dijkstra simply pushes a new entry instead of updating the old one, so old entries are skipped when they come out.`, calc: [`${d} > dist[${u}] = ${dist[u]}`] });
      continue;
    }
    done.add(u);
    const relaxed = [];
    for (const [a, b, w] of edges) {
      if (a !== u || done.has(b)) continue;
      const nd = d + w;
      const better = nd < dist[b];
      relaxed.push({ v: b, w, nd, old: dist[b], better });
      if (better) { dist[b] = nd; prev[b] = u; push(b, nd); }
    }
    snap({
      kind: 'settle', cur: u, relaxed, lines: ['pop', 'final', 'relax'],
      title: `${u} is final at ${d}${relaxed.some((r) => r.better) ? `; update ${relaxed.filter((r) => r.better).map((r) => `${r.v} → ${r.nd}`).join(', ')}` : ''}`,
      text: `${u} is the closest unfinished node, so ${d} is its final distance. ${relaxed.length ? relaxed.map((r) => `${u} → ${r.v} costs ${d} + ${r.w} = ${r.nd}${r.better ? `, better than ${fmt(r.old)}: update` : `, not better than ${fmt(r.old)}`}`).join('. ') + '.' : 'It has no edges to unfinished nodes.'}`,
      calc: [`dist[${u}] = ${d} (final)`, ...relaxed.map((r) => `${r.v}: ${r.nd} ${r.better ? '<' : '≥'} ${fmt(r.old)}`)],
    });
  }
  const answer = nodes.map((v) => `${v}:${fmt(dist[v])}`).join(' ');
  snap({
    kind: 'done', cur: null, lines: [], answer,
    title: `Distances from ${src}: ${answer}`,
    text: 'Each node was finalised once and each edge relaxed once; the heap makes it O((V + E) log V). The highlighted edges are the shortest-path tree: the edge that last improved each node.',
    calc: nodes.map((v) => `${v}: ${fmt(dist[v])}${prev[v] ? ` via ${prev[v]}` : ''}`),
  });
  return steps;
}

export function parseDijkstra(values) {
  const r = parseEdges(values.edges, { letters: true });
  if (r.error) return r;
  if (r.edges.some(([, , w]) => w > 20)) return { error: 'Keep weights between 0 and 20.' };
  if (r.edges.some(([a, b]) => a === b)) return { error: 'Leave out edges from a node to itself.' };
  const src = String(values.src ?? 'A').trim().toUpperCase() || 'A';
  if (!nodesOf(r.edges, src).includes(src) || !/^[A-G]$/.test(src)) return { error: 'The source must be one of the nodes (A to G).' };
  return { input: { src, edges: r.edges } };
}

export function randomDijkstra(rand = Math.random) {
  const g = rng(rand);
  const names = 'ABCDEF'.slice(0, g.int(4, 6)).split('');
  const edges = [];
  for (let k = 1; k < names.length; k++) edges.push([names[g.int(0, k - 1)], names[k], g.int(1, 9)]);
  for (let k = 0; k < 3; k++) {
    const a = g.pick(names), b = g.pick(names);
    if (a !== b && !edges.some(([x, y]) => x === a && y === b)) edges.push([a, b, g.int(1, 9)]);
  }
  return { src: 'A', edges };
}

export const edgesText = (edges, letters) => edges.map((e) => (letters ? `${e[0]}>${e[1]} ${e[2]}` : `${e[0]}>${e[1]}`)).join(', ');
