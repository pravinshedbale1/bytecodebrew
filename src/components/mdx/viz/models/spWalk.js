/**
 * Shortest-path problems (model for <SpWalkViz>, drawn by the GraphWalkViz stage). Frames: grid [[{ l, c, b }]]
 * (b = corner badge), graphs, rows. Pure, so scripts/viz-check.mjs can test every mode against a brute force.
 */
import { list, plural, rng } from './util.js';

export const SP_WALK = {
  delay: { label: 'Network delay', input: { mode: 'delay', n: 5, times: [[1, 2, 2], [1, 3, 6], [2, 3, 3], [2, 4, 7], [3, 4, 1], [4, 5, 2]], k: 1 } },
  delayMiss: { label: 'A node never reached', input: { mode: 'delay', n: 4, times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], k: 1 } },
  flights: { label: 'Cheapest flights, k = 1', input: { mode: 'flights', n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1 } },
  flightsMore: { label: 'k = 2 is cheaper', input: { mode: 'flights', n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 2 } },
  prob: { label: 'Maximum probability', input: { mode: 'prob', n: 4, edges: [[0, 1, 0.5], [1, 2, 0.5], [0, 2, 0.2], [2, 3, 0.9], [1, 3, 0.3]], start: 0, end: 3 } },
  effort: { label: 'Minimum effort', input: { mode: 'effort', grid: [[1, 2, 2], [3, 8, 2], [5, 3, 5]] } },
  swim: { label: 'Swim in rising water', input: { mode: 'swim', grid: [[0, 1, 2, 3], [11, 12, 13, 4], [10, 15, 14, 5], [9, 8, 7, 6]] } },
  obstacles: { label: 'Obstacle removal', input: { mode: 'obstacles', grid: [[0, 1, 1], [1, 1, 0], [1, 1, 0]] } },
  obstaclesBig: { label: 'Around or through', input: { mode: 'obstacles', grid: [[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0], [1, 1, 1, 1, 0]] } },
  signs: { label: 'Fix the signs', input: { mode: 'signs', grid: [[1, 1, 1, 1], [2, 2, 2, 2], [1, 1, 1, 1], [2, 2, 2, 2]] } },
  city: { label: 'City with fewest neighbours', input: { mode: 'city', n: 4, edges: [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], threshold: 4 } },
};

export const spWalkCode = (mode) => ({
  delay: [
    ['init', 'dist[k] = 0; heap = [(0, k)]'],
    ['pop', 'pop the smallest (d, u); if (d > dist[u]) skip   // stale entry'],
    ['relax', '  for (u → v, w): if (d + w < dist[v]) { dist[v] = d + w; push (dist[v], v) }'],
    ['end', 'answer = max(dist), or −1 if some node is unreached'],
  ],
  flights: [
    ['init', 'price[src] = 0, everything else ∞'],
    ['round', 'repeat k + 1 times: prev = copy(price)'],
    ['relax', '  for flight (a, b, p): price[b] = min(price[b], prev[a] + p)   // read the COPY'],
    ['end', 'return price[dst] (or −1)'],
  ],
  prob: [
    ['init', 'best[start] = 1; max-heap = [(1, start)]'],
    ['pop', 'pop the highest (p, u); if (p < best[u]) skip'],
    ['relax', '  for (u – v, q): if (p · q > best[v]) { best[v] = p · q; push }'],
    ['end', 'return best[end] (0 if never reached)'],
  ],
  effort: [
    ['init', 'effort[start] = 0; heap = [(0, start)]'],
    ['pop', 'pop the cell with the smallest effort; the corner → done'],
    ['relax', '  each neighbour: e = max(effort, |height difference|); smaller → update, push'],
  ],
  swim: [
    ['init', 'time[start] = grid[0][0]; heap = [(that, start)]'],
    ['pop', 'pop the cell with the lowest time; the corner → done'],
    ['relax', '  each neighbour: t = max(time, its height); smaller → update, push'],
  ],
  obstacles: [
    ['init', 'cost[start] = 0; deque = [start]'],
    ['pop', 'pop from the FRONT: the cheapest cell left'],
    ['relax', '  neighbour costs +0 (empty) → push FRONT, +1 (obstacle) → push BACK'],
  ],
  signs: [
    ['init', 'cost[start] = 0; deque = [start]'],
    ['pop', 'pop from the FRONT: the cheapest cell left'],
    ['relax', '  the way the sign points costs 0 → push FRONT; any other way costs 1 → push BACK'],
  ],
  city: [
    ['init', 'dist[i][j] = road length, ∞ if no road, 0 on the diagonal'],
    ['mid', 'for k: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])'],
    ['count', 'count cities within the threshold; fewest wins, ties → larger number'],
  ],
})[mode];

const INF = Infinity;
const fmt = (x) => (x === INF ? '∞' : Number.isInteger(x) ? String(x) : String(Math.round(x * 1e4) / 1e4));
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];       // index + 1 = the sign value (1 right, 2 left, 3 down, 4 up)
const ARROW = ['→', '←', '↓', '↑'];
const inside = (g, r, c) => r >= 0 && c >= 0 && r < g.length && c < g[0].length;

// ---------------------------------------------------------------- brute forces

export function spWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'delay') {
    const d = Array(input.n + 1).fill(INF); d[input.k] = 0;
    for (let t = 0; t < input.n; t++) for (const [u, v, w] of input.times) if (d[u] + w < d[v]) d[v] = d[u] + w;
    const m = Math.max(...d.slice(1));
    return m === INF ? -1 : m;
  }
  if (mode === 'flights') {
    let best = INF;
    const go = (u, cost, used) => { if (u === input.dst) { best = Math.min(best, cost); return; } if (used === input.k + 1) return; for (const [a, b, p] of input.flights) if (a === u) go(b, cost + p, used + 1); };
    go(input.src, 0, 0);
    return best === INF ? -1 : best;
  }
  if (mode === 'prob') {
    const b = Array(input.n).fill(0); b[input.start] = 1;
    for (let changed = true; changed;) { changed = false; for (const [x, y, q] of input.edges) { if (b[x] * q > b[y] + 1e-12) { b[y] = b[x] * q; changed = true; } if (b[y] * q > b[x] + 1e-12) { b[x] = b[y] * q; changed = true; } } }
    return b[input.end];
  }
  if (mode === 'effort' || mode === 'swim') {
    const g = input.grid, R = g.length, C = g[0].length;
    const ok = (lim) => {
      if (mode === 'swim' && g[0][0] > lim) return false;
      const seen = new Set(['0,0']); const q = [[0, 0]];
      for (let h = 0; h < q.length; h++) {
        const [r, c] = q[h];
        if (r === R - 1 && c === C - 1) return true;
        for (const [dr, dc] of DIRS) { const x = r + dr, y = c + dc; if (inside(g, x, y) && !seen.has(`${x},${y}`) && (mode === 'effort' ? Math.abs(g[x][y] - g[r][c]) <= lim : g[x][y] <= lim)) { seen.add(`${x},${y}`); q.push([x, y]); } }
      }
      return false;
    };
    let lim = 0; while (!ok(lim)) lim++;
    return lim;
  }
  if (mode === 'obstacles' || mode === 'signs') {
    const g = input.grid, R = g.length, C = g[0].length;
    const d = g.map((row) => row.map(() => INF)); d[0][0] = 0;
    for (let changed = true; changed;) {
      changed = false;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) DIRS.forEach(([dr, dc], k) => {
        const x = r + dr, y = c + dc;
        if (!inside(g, x, y) || d[r][c] === INF) return;
        const w = mode === 'obstacles' ? g[x][y] : (g[r][c] === k + 1 ? 0 : 1);
        if (d[r][c] + w < d[x][y]) { d[x][y] = d[r][c] + w; changed = true; }
      });
    }
    return d[R - 1][C - 1];
  }
  // city
  const { n, edges, threshold } = input;
  const counts = Array.from({ length: n }, (_, s) => {
    const d = Array(n).fill(INF); d[s] = 0;
    for (let t = 0; t < n; t++) for (const [a, b, w] of edges) { if (d[a] + w < d[b]) d[b] = d[a] + w; if (d[b] + w < d[a]) d[a] = d[b] + w; }
    return d.filter((x, j) => j !== s && x <= threshold).length;
  });
  let best = 0;
  counts.forEach((c, i) => { if (c <= counts[best]) best = i; });
  return best;
}

// ---------------------------------------------------------------- Dijkstra on graphs: network delay, maximum probability

function delay({ n, times, k }) {
  const ids = Array.from({ length: n }, (_, i) => i + 1);
  const dist = Object.fromEntries(ids.map((i) => [i, INF]));
  dist[k] = 0;
  let heap = [[0, k]];
  const done = new Set();
  const prev = {};
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'signal travel times (badge = best known time)', nodes: ids.map((i) => ({ id: i, l: String(i), badge: fmt(dist[i]), c: [done.has(i) && 'nodeDone', x.cur === i && 'nodeCur', x.bad?.includes(i) && 'nodeBad'] })), edges: times.map(([u, v, w]) => ({ a: u, b: v, dir: true, l: String(w), tone: x.cur === u && x.relaxed?.includes(v) ? 'good' : prev[v] === u ? 'on' : 'plain' })) }],
    rows: [{ label: 'min-heap (time, node)', chips: [...heap].sort((a, b) => a[0] - b[0]).map(([d, u], j) => ({ text: `(${d}, ${u})`, tone: j === 0 ? 'accent' : d > dist[u] ? 'danger' : undefined, note: d > dist[u] ? 'stale' : undefined })) }],
    ...x,
  });
  snap({ kind: 'start', lines: ['init'], title: `Send a signal from node ${k}`, text: 'Each node hears the signal at the time of its fastest path from k. Dijkstra settles nodes in order of that time: the closest unsettled node can\'t be reached faster later, because every other route is already at least as long and weights are never negative. The answer is the time of the last node to hear it.', calc: [`dist[${k}] = 0`] });
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [d, u] = heap.shift();
    if (d > dist[u] || done.has(u)) { snap({ kind: 'stale', cur: u, lines: ['pop'], title: `(${d}, ${u}) is stale: skip`, text: `Node ${u} was already settled at time ${dist[u]}, smaller than ${d}. This older heap entry is left over from before a better route was found.`, calc: [`${d} > dist[${u}] = ${dist[u]}`] }); continue; }
    done.add(u);
    const relaxed = [];
    for (const [a, v, w] of times) if (a === u && d + w < dist[v]) { dist[v] = d + w; prev[v] = u; heap.push([dist[v], v]); relaxed.push(v); }
    snap({ kind: 'settle', cur: u, relaxed, lines: ['pop', 'relax'], title: `Settle ${u} at time ${d}`, text: `${u} has the smallest time in the heap, so ${d} is final. ${relaxed.length ? `Through ${u}: ${relaxed.map((v) => `${v} now hears it at ${dist[v]}`).join(', ')}.` : `No edge out of ${u} improves anything.`}`, calc: relaxed.length ? relaxed.map((v) => `dist[${v}] = ${dist[v]}`) : [`dist[${u}] = ${d} (final)`] });
  }
  const unreached = ids.filter((i) => dist[i] === INF);
  const ans = unreached.length ? -1 : Math.max(...ids.map((i) => dist[i]));
  snap({ kind: 'done', bad: unreached, lines: ['end'], answer: String(ans), title: unreached.length ? `${unreached.join(', ')} never hear it: −1` : `Everyone has it after ${ans}`, text: unreached.length ? `No path leads from ${k} to ${unreached.join(', ')}.` : `The answer is the largest settled time: the last node to hear the signal. O(E log V) with a heap.`, calc: [`return ${ans}`] });
  return steps;
}

function prob({ n, edges, start, end }) {
  const ids = Array.from({ length: n }, (_, i) => i);
  const best = Array(n).fill(0);
  best[start] = 1;
  let heap = [[1, start]];
  const done = new Set();
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'edges labelled with success probability (badge = best so far)', nodes: ids.map((i) => ({ id: i, l: String(i), badge: fmt(best[i]), c: [done.has(i) && 'nodeDone', x.cur === i && 'nodeCur', i === end && 'nodeRoot'] })), edges: edges.map(([a, b, q]) => ({ a, b, l: String(q), tone: x.cur !== undefined && (a === x.cur || b === x.cur) && x.relaxed?.includes(a === x.cur ? b : a) ? 'good' : 'plain' })) }],
    rows: [{ label: 'max-heap (probability, node)', chips: [...heap].sort((a, b) => b[0] - a[0]).map(([p, u], j) => ({ text: `(${fmt(p)}, ${u})`, tone: j === 0 ? 'accent' : undefined })) }],
    ...x,
  });
  snap({ kind: 'start', lines: ['init'], title: `Safest path from ${start} to ${end}`, text: 'A path\'s probability is the product of its edges. Multiplying by a number ≤ 1 can only keep a value or shrink it: the mirror image of adding a non-negative weight. So Dijkstra works with a max-heap: the node with the highest probability so far can\'t be improved later.', calc: [`best[${start}] = 1`] });
  while (heap.length) {
    heap.sort((a, b) => b[0] - a[0]);
    const [p, u] = heap.shift();
    if (done.has(u) || p < best[u]) continue;
    done.add(u);
    if (u === end) { snap({ kind: 'settle', cur: u, lines: ['pop', 'end'], answer: fmt(p), title: `Reach ${end} with ${fmt(p)}`, text: `${end} is the highest-probability node in the heap: nothing left can beat ${fmt(p)}. Stop.`, calc: [`return ${fmt(p)}`] }); return steps; }
    const relaxed = [];
    for (const [a, b, q] of edges) {
      const v = a === u ? b : b === u ? a : -1;
      if (v >= 0 && p * q > best[v]) { best[v] = p * q; heap.push([best[v], v]); relaxed.push(v); }
    }
    snap({ kind: 'settle', cur: u, relaxed, lines: ['pop', 'relax'], title: `Settle ${u} at ${fmt(p)}`, text: `${u} is the most likely node left, so ${fmt(p)} is final. ${relaxed.length ? relaxed.map((v) => `${v}: ${fmt(p)} × ${fmt(edges.find(([a, b]) => (a === u && b === v) || (a === v && b === u))[2])} = ${fmt(best[v])}`).join('; ') : 'No neighbour improves.'}`, calc: relaxed.length ? relaxed.map((v) => `best[${v}] = ${fmt(best[v])}`) : ['no change'] });
  }
  snap({ kind: 'done', lines: ['end'], answer: '0', title: `${end} is unreachable: 0`, text: `The heap emptied without reaching ${end}: no path exists.`, calc: ['return 0'] });
  return steps;
}

// ---------------------------------------------------------------- Bellman–Ford with k + 1 rounds

function flights({ n, flights: fl, src, dst, k }) {
  const ids = Array.from({ length: n }, (_, i) => i);
  let price = ids.map((i) => (i === src ? 0 : INF));
  const history = [[...price]];
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'one-way flights (badge = cheapest with ≤ round flights)', nodes: ids.map((i) => ({ id: i, l: String(i), badge: fmt(price[i]), c: [i === src && 'nodeRoot', i === dst && 'nodeDone', x.changed?.includes(i) && 'nodeCur'] })), edges: fl.map(([a, b, p]) => ({ a, b, dir: true, l: String(p), tone: x.used?.some(([u, v]) => u === a && v === b) ? 'good' : 'plain' })) }],
    rows: history.map((h, r) => ({ label: `≤ ${r} flight${r === 1 ? '' : 's'}`, chips: h.map((v, i) => ({ text: `${i}: ${fmt(v)}`, tone: i === dst ? 'success' : undefined })) })),
    ...x,
  });
  snap({ kind: 'start', lines: ['init'], title: `From ${src} to ${dst} with at most ${k} stop${k === 1 ? '' : 's'}`, text: `At most ${k} stops means at most ${k + 1} flights. Dijkstra would happily find a cheaper route with more flights, so limit the number of edges instead: Bellman–Ford rounds. After round r, price[x] is the cheapest way to reach x with at most r flights.`, calc: [`${k + 1} rounds`] });
  for (let r = 1; r <= k + 1; r++) {
    const prevP = [...price];
    const changed = [], used = [];
    for (const [a, b, p] of fl) if (prevP[a] + p < price[b]) { price[b] = prevP[a] + p; if (!changed.includes(b)) changed.push(b); used.push([a, b]); }
    history.push([...price]);
    snap({ kind: 'round', changed, used, lines: ['round', 'relax'], title: `Round ${r}: ${changed.length ? `${plural(changed.length, 'price')} improve` : 'nothing improves'}`, text: `Every flight a → b offers prev[a] + price, where prev is the table from round ${r - 1}. Reading the copy matters: otherwise one round could chain two flights and break the limit. ${changed.length ? changed.map((b) => `${b}: ${fmt(price[b])}`).join(', ') + '.' : ''}`, calc: [`price[${dst}] = ${fmt(price[dst])}`] });
  }
  const ans = price[dst] === INF ? -1 : price[dst];
  snap({ kind: 'done', lines: ['end'], answer: String(ans), title: ans === -1 ? `No route within ${k + 1} flights: −1` : `Cheapest: ${ans}`, text: ans === -1 ? `${dst} can't be reached in ${k + 1} flights.` : `${k + 1} rounds over every flight: O(k · E). ${k === 1 ? 'With one more stop allowed, a cheaper route through more cities could appear.' : ''}`, calc: [`return ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- grids: Dijkstra (effort, swim) and 0-1 BFS (obstacles, signs)

function gridPaths({ mode, grid }) {
  const R = grid.length, C = grid[0].length;
  const cost = grid.map((row) => row.map(() => INF));
  const done = grid.map((row) => row.map(() => false));
  const zeroOne = mode === 'obstacles' || mode === 'signs';
  cost[0][0] = mode === 'swim' ? grid[0][0] : 0;
  let queue = [[cost[0][0], 0, 0]];
  const steps = [];
  const label = (r, c) => (mode === 'obstacles' ? (grid[r][c] ? '■' : '') : mode === 'signs' ? ARROW[grid[r][c] - 1] : String(grid[r][c]));
  const snap = (x) => steps.push({
    grid: grid.map((row, r) => row.map((_, c) => ({ l: label(r, c), b: cost[r][c] === INF ? undefined : fmt(cost[r][c]), c: [done[r][c] ? 'ring_a' : mode === 'obstacles' && grid[r][c] ? 'wall' : 'open', x.cur && x.cur[0] === r && x.cur[1] === c && 'cellCur', x.fresh?.some(([a, b]) => a === r && b === c) && 'cellNew', r === R - 1 && c === C - 1 && 'target'] }))),
    rows: [{ label: zeroOne ? 'deque (front →)' : 'min-heap', chips: (zeroOne ? queue : [...queue].sort((a, b) => a[0] - b[0])).slice(0, 10).map(([d, r, c], j) => ({ text: `(${r},${c}): ${fmt(d)}`, tone: j === 0 ? 'accent' : undefined })) }],
    ...x,
  });
  const intro = {
    effort: 'A route\'s effort is its single biggest climb or drop, not a sum. Extending a route can only keep that maximum or raise it, never lower it, so Dijkstra still works: always expand the cell with the smallest effort so far. (Corner badges = best effort known.)',
    swim: 'At time t you can use any cell with height ≤ t, so a route needs as much time as its highest cell. That value never drops as the route grows: Dijkstra on "highest cell so far". (Corner badges = earliest time known.)',
    obstacles: 'Walking into an empty cell costs 0; into an obstacle costs 1 (you remove it). With only 0 and 1 costs, a deque replaces Dijkstra\'s heap: 0-cost neighbours go to the front, 1-cost ones to the back, and cells still leave in order of cost. (Corner badges = fewest removals known.)',
    signs: 'Following a cell\'s sign is free; going any other way means changing the sign, cost 1. That is a graph with 0 and 1 edge costs: 0-1 BFS with a deque. (Corner badges = fewest changes known.)',
  }[mode];
  snap({ kind: 'start', lines: ['init'], title: { effort: 'Least effort to the corner', swim: 'Earliest time to swim across', obstacles: 'Fewest obstacles to remove', signs: 'Fewest signs to change' }[mode], text: intro, calc: [`start: ${fmt(cost[0][0])}`] });
  while (queue.length) {
    if (!zeroOne) queue.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = queue.shift();
    if (done[r][c] || d > cost[r][c]) continue;
    done[r][c] = true;
    if (r === R - 1 && c === C - 1) {
      snap({ kind: 'found', cur: [r, c], lines: ['pop'], answer: fmt(d), title: `Corner reached: ${fmt(d)}`, text: `The bottom-right cell leaves the ${zeroOne ? 'deque' : 'heap'} with ${fmt(d)}. Every cell with a smaller value was expanded first, so nothing can beat it.`, calc: [`return ${fmt(d)}`] });
      return steps;
    }
    const fresh = [];
    const notes = [];
    DIRS.forEach(([dr, dc], k) => {
      const x = r + dr, y = c + dc;
      if (!inside(grid, x, y) || done[x][y]) return;
      let nd, front = false;
      if (mode === 'effort') nd = Math.max(d, Math.abs(grid[x][y] - grid[r][c]));
      if (mode === 'swim') nd = Math.max(d, grid[x][y]);
      if (mode === 'obstacles') { nd = d + grid[x][y]; front = grid[x][y] === 0; }
      if (mode === 'signs') { const w = grid[r][c] === k + 1 ? 0 : 1; nd = d + w; front = w === 0; }
      if (nd < cost[x][y]) {
        cost[x][y] = nd;
        fresh.push([x, y]);
        if (zeroOne) { if (front) queue.unshift([nd, x, y]); else queue.push([nd, x, y]); } else queue.push([nd, x, y]);
        notes.push(`(${x},${y}) ${fmt(nd)}${zeroOne ? (front ? ' front' : ' back') : ''}`);
      }
    });
    snap({ kind: 'settle', cur: [r, c], fresh, lines: ['pop', 'relax'], title: `Expand (${r}, ${c}) at ${fmt(d)}`, text: `${zeroOne ? 'The front of the deque' : 'The smallest in the heap'} is (${r}, ${c}) with ${fmt(d)}: final. ${notes.length ? `Neighbours improve: ${notes.join(', ')}.` : 'No neighbour improves.'}${mode === 'signs' ? ` Its sign points ${ARROW[grid[r][c] - 1]}.` : ''}`, calc: notes.length ? notes : ['no change'] });
  }
  return steps;
}

// ---------------------------------------------------------------- the city with the fewest neighbours (Floyd–Warshall)

function city({ n, edges, threshold }) {
  const ids = Array.from({ length: n }, (_, i) => i);
  const D = ids.map((i) => ids.map((j) => (i === j ? 0 : INF)));
  edges.forEach(([a, b, w]) => { D[a][b] = Math.min(D[a][b], w); D[b][a] = Math.min(D[b][a], w); });
  const steps = [];
  const snap = (x) => steps.push({
    grid: D.map((row, i) => row.map((v, j) => ({ l: i === j ? '·' : fmt(v), c: [i === j ? 'xCell' : v <= threshold ? 'ring_a' : 'open', x.fresh?.has(`${i},${j}`) && 'cellNew', x.k !== undefined && (i === x.k || j === x.k) && i !== j && 'kLine', x.pick === i && 'cellCur'] }))),
    graphs: [{ label: 'two-way roads', nodes: ids.map((i) => ({ id: i, l: String(i), badge: x.counts ? String(x.counts[i]) : undefined, c: [x.k === i && 'nodeCur', x.pick === i && 'nodeDone'] })), edges: edges.map(([a, b, w]) => ({ a, b, l: String(w) })) }],
    caption: `row i, column j: shortest distance; shaded = within ${threshold}`,
    ...x,
  });
  snap({ kind: 'start', lines: ['init'], title: `Distances between all ${n} cities`, text: `Each city needs the distances to every other city, so compute all pairs at once. Start from the direct roads. Then let each city k in turn be a stop in the middle: i → k → j may beat the best known i → j.`, calc: [`threshold = ${threshold}`] });
  for (let k = 0; k < n; k++) {
    const fresh = new Set();
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) { D[i][j] = D[i][k] + D[k][j]; fresh.add(`${i},${j}`); }
    snap({ kind: 'mid', k, fresh, lines: ['mid'], title: `Through city ${k}: ${fresh.size ? `${plural(fresh.size, 'shorter route')}` : 'nothing shorter'}`, text: fresh.size ? `Going via ${k} beats the known distance for ${[...fresh].filter((p) => Number(p.split(',')[0]) < Number(p.split(',')[1])).map((p) => p.replace(',', '–')).join(', ')}.` : `No pair gets a shorter route by passing through ${k}.`, calc: [`dist[i][j] = min(dist[i][j], dist[i][${k}] + dist[${k}][j])`] });
  }
  const counts = ids.map((i) => ids.filter((j) => j !== i && D[i][j] <= threshold).length);
  let pick = 0;
  counts.forEach((c, i) => { if (c <= counts[pick]) pick = i; });
  snap({ kind: 'done', counts, pick, lines: ['count'], answer: String(pick), title: `City ${pick}: ${plural(counts[pick], 'neighbour')} within ${threshold}`, text: `Count each row's shaded cells: ${counts.map((c, i) => `${i}: ${c}`).join(', ')}. The fewest is ${counts[pick]}${counts.filter((c) => c === counts[pick]).length > 1 ? `, shared by ${ids.filter((i) => counts[i] === counts[pick]).join(' and ')}; ties go to the larger number, ${pick}` : ''}. O(n³) = ${n ** 3} for ${n} cities.`, calc: [`return ${pick}`] });
  return steps;
}

// ---------------------------------------------------------------- dispatch, parsing, random

export function spWalk(input) {
  const m = input.mode;
  if (m === 'effort' || m === 'swim' || m === 'obstacles' || m === 'signs') return gridPaths(input);
  return { delay, flights, prob, city }[m](input);
}

const triples = (text, lo, hi, { real = false } = {}) => {
  const out = [];
  for (const p of String(text ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const m = p.match(real ? /^(\d+)\s*[-–>]\s*(\d+)\s*[:=]\s*(0?\.\d+|1(?:\.0+)?|0)$/ : /^(\d+)\s*[-–>]\s*(\d+)\s*[:=]\s*(\d+)$/);
    if (!m) return { error: `"${p}" should look like ${real ? '0-1:0.5' : '1>2:3'}.` };
    const a = Number(m[1]), b = Number(m[2]);
    if (a < lo || b < lo || a > hi || b > hi || a === b) return { error: `Nodes are ${lo} to ${hi}, and an edge joins two different nodes.` };
    out.push([a, b, Number(m[3])]);
  }
  if (!out.length || out.length > 10) return { error: 'Use 1 to 10 edges.' };
  return { list: out };
};
const gridIn = (text, { allowed, maxR = 5, maxC = 6 }) => {
  const rows = String(text ?? '').split(';').map((r) => r.trim().split(/[\s,]+/).filter(Boolean).map(Number));
  if (!rows.length || rows.length > maxR || rows.some((r) => r.length !== rows[0].length || r.length > maxC || r.some((v) => !allowed(v)))) return { error: `Rows of numbers separated by ;, at most ${maxR} × ${maxC}.` };
  return { grid: rows };
};

export function parseSpWalk(values, input) {
  const { mode } = input;
  if (mode === 'delay') {
    const n = Number(values.n), k = Number(values.k);
    if (!Number.isInteger(n) || n < 1 || n > 7 || !Number.isInteger(k) || k < 1 || k > n) return { error: 'n from 1 to 7, k a node.' };
    const t = triples(values.edges, 1, n); if (t.error) return t;
    return { input: { mode, n, times: t.list, k } };
  }
  if (mode === 'flights') {
    const n = Number(values.n), src = Number(values.src), dst = Number(values.dst), k = Number(values.k);
    if (!Number.isInteger(n) || n < 2 || n > 7 || ![src, dst].every((v) => Number.isInteger(v) && v >= 0 && v < n) || src === dst || !Number.isInteger(k) || k < 0 || k > 5) return { error: 'n 2 to 7, src ≠ dst, k 0 to 5.' };
    const t = triples(values.edges, 0, n - 1); if (t.error) return t;
    return { input: { mode, n, flights: t.list, src, dst, k } };
  }
  if (mode === 'prob') {
    const n = Number(values.n), start = Number(values.start), end = Number(values.end);
    if (!Number.isInteger(n) || n < 2 || n > 7 || ![start, end].every((v) => Number.isInteger(v) && v >= 0 && v < n) || start === end) return { error: 'n 2 to 7, start ≠ end.' };
    const t = triples(values.edges, 0, n - 1, { real: true }); if (t.error) return t;
    return { input: { mode, n, edges: t.list, start, end } };
  }
  if (mode === 'city') {
    const n = Number(values.n), threshold = Number(values.threshold);
    if (!Number.isInteger(n) || n < 2 || n > 6 || !Number.isInteger(threshold) || threshold < 1) return { error: 'n 2 to 6, threshold ≥ 1.' };
    const t = triples(values.edges, 0, n - 1); if (t.error) return t;
    return { input: { mode, n, edges: t.list, threshold } };
  }
  const allowed = { effort: (v) => Number.isInteger(v) && v >= 1 && v <= 99, swim: (v) => Number.isInteger(v) && v >= 0, obstacles: (v) => v === 0 || v === 1, signs: (v) => [1, 2, 3, 4].includes(v) }[mode];
  const g = gridIn(values.grid, { allowed }); if (g.error) return g;
  if (mode === 'swim') {
    const flat = g.grid.flat();
    if (g.grid.length !== g.grid[0].length || new Set(flat).size !== flat.length || flat.some((v) => v >= flat.length)) return { error: 'An n × n grid holding 0 to n² − 1, each once.' };
  }
  if (mode === 'obstacles' && (g.grid[0][0] || g.grid.at(-1).at(-1))) return { error: 'Both corners must be 0.' };
  return { input: { mode, grid: g.grid } };
}

export function randomSpWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const graph = (n, base, kmax, directed) => {
    const out = [];
    for (let t = 0; t < g.int(n - 1, n + 3); t++) {
      const a = g.int(base, base + n - 1), b = g.int(base, base + n - 1);
      if (a === b || out.some(([x, y]) => (x === a && y === b) || (!directed && x === b && y === a))) continue;
      out.push([a, b, g.int(1, kmax)]);
    }
    return out.length ? out : [[base, base + 1, 1]];
  };
  if (mode === 'delay') { const n = g.int(2, 6); return { mode, n, times: graph(n, 1, 9, true), k: g.int(1, n) }; }
  if (mode === 'flights') { const n = g.int(3, 6); const src = g.int(0, n - 1); let dst = g.int(0, n - 1); if (dst === src) dst = (src + 1) % n; return { mode, n, flights: graph(n, 0, 9, true).map(([a, b, p]) => [a, b, p * 10]), src, dst, k: g.int(0, 3) }; }
  if (mode === 'prob') { const n = g.int(2, 6); return { mode, n, edges: graph(n, 0, 9, false).map(([a, b, p]) => [a, b, p / 10]), start: 0, end: n - 1 }; }
  if (mode === 'city') { const n = g.int(2, 6); return { mode, n, edges: graph(n, 0, 6, false), threshold: g.int(1, 8) }; }
  const R = g.int(1, 4), C = g.int(1, 5);
  if (mode === 'effort') return { mode, grid: Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(1, 9))) };
  if (mode === 'swim') { const n = g.int(1, 4); const v = g.shuffle(Array.from({ length: n * n }, (_, i) => i)); return { mode, grid: Array.from({ length: n }, (_, r) => v.slice(r * n, r * n + n)) }; }
  if (mode === 'obstacles') { const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.45) ? 1 : 0))); grid[0][0] = 0; grid[R - 1][C - 1] = 0; return { mode, grid }; }
  return { mode, grid: Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(1, 4))) };
}
