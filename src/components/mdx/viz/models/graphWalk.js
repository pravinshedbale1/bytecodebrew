/**
 * Graph traversal step-throughs (model for <GraphWalkViz>). Each frame describes what to draw:
 *   grid    [[{ l, c }]]   a grid of cells: label and class names
 *   graphs  [{ label, nodes: [{ id, l, c, badge }], edges: [{ a, b, dir, l, tone }] }]   drawn on a circle
 *   rows    [{ label, chips: [{ text, tone, note, isNew }] }]
 * Pure, so scripts/viz-check.mjs can test every mode against a brute force.
 */
import { list, plural, rng } from './util.js';

const DIRS4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const inside = (g, r, c) => r >= 0 && c >= 0 && r < g.length && c < g[0].length;
const copyGrid = (g) => g.map((row) => [...row]);
const cellsOf = (g, fn) => g.map((row, r) => row.map((v, c) => fn(r, c, v)));
const at = (r, c) => `(${r}, ${c})`;
const num = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 1e5) / 1e5));
const ord = (k) => `${k}${['th', 'st', 'nd', 'rd'][k % 100 > 10 && k % 100 < 14 ? 0 : k % 10] ?? 'th'}`;

export const GRAPH_WALK = {
  flood: { label: 'Flood fill', input: { mode: 'flood', image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 } },
  floodBig: { label: 'Flood fill, 4 × 5', input: { mode: 'flood', image: [[3, 3, 1, 1, 1], [1, 3, 3, 1, 2], [1, 1, 3, 3, 2], [2, 1, 1, 3, 3]], sr: 0, sc: 0, color: 4 } },
  perimeter: { label: 'Island perimeter', input: { mode: 'perimeter', grid: [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]] } },
  judge: { label: 'Town judge', input: { mode: 'judge', n: 4, trust: [[1, 3], [2, 3], [4, 3], [4, 1]] } },
  judgeNone: { label: 'No judge', input: { mode: 'judge', n: 3, trust: [[1, 3], [2, 3], [3, 1]] } },
  provinces: { label: 'Provinces', input: { mode: 'provinces', m: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 1]] } },
  clone: { label: 'Clone a 4-cycle', input: { mode: 'clone', adj: [[2, 4], [1, 3], [2, 4], [1, 3]] } },
  zeros: { label: '01 matrix', input: { mode: 'zeros', mat: [[0, 1, 1, 1], [1, 1, 1, 1], [1, 1, 0, 1], [1, 1, 1, 1]] } },
  gates: { label: 'Walls and gates', input: { mode: 'gates', rooms: [[1, 2, 0, 1], [1, 1, 1, 2], [1, 2, 1, 2], [0, 2, 1, 1]] } },
  surrounded: { label: 'Surrounded regions', input: { mode: 'surrounded', board: [[0, 0, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 0, 1], [0, 1, 0, 0, 1], [0, 1, 0, 0, 0]] } },
  pacific: { label: 'Pacific Atlantic', input: { mode: 'pacific', h: [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]] } },
  lock: { label: 'A 2-wheel lock', input: { mode: 'lock', dead: ['01', '10', '12', '21'], target: '22' } },
  division: { label: 'Evaluate division', input: { mode: 'division', eq: [['a', 'b', 2], ['b', 'c', 3]], queries: [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']] } },
  ladder: { label: 'Word ladder', input: { mode: 'ladder', begin: 'hit', end: 'cog', words: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] } },
  itinerary: { label: 'Itinerary', input: { mode: 'itinerary', tickets: [['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']] } },
  itineraryDead: { label: 'A dead end first', input: { mode: 'itinerary', tickets: [['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']] } },
};

export const graphWalkCode = (mode) => ({
  flood: [
    ['same', 'if (image[sr][sc] == color) return image;     // nothing would change (and the fill would never stop)'],
    ['stop', 'fill(r, c): if (off the grid || image[r][c] != old) return;'],
    ['paint', '  image[r][c] = color;                       // painting also marks it as visited'],
    ['dirs', '  fill(r − 1, c); fill(r + 1, c); fill(r, c − 1); fill(r, c + 1);'],
  ],
  perimeter: [
    ['scan', 'for every land cell:'],
    ['count', '  perimeter += 4 − (land neighbours);           // sides that face water or the edge'],
  ],
  judge: [
    ['pair', 'for (a, b) in trust: score[a]−−; score[b]++;   // trusting costs, being trusted pays'],
    ['find', 'for p in 1..n: if (score[p] == n − 1) return p;   // trusted by all n − 1, trusts nobody'],
    ['none', 'return −1;'],
  ],
  provinces: [
    ['scan', 'for city i: if (!seen[i]) { provinces++; dfs(i); }'],
    ['visit', 'dfs(i): seen[i] = true; for j: if (isConnected[i][j] == 1 && !seen[j]) dfs(j);'],
  ],
  clone: [
    ['seen', 'clone(n): if (map has n) return map.get(n);   // already copied: reuse it'],
    ['make', '  copy = new Node(n.val);  map.put(n, copy);   // record BEFORE visiting neighbours'],
    ['wire', '  for (nb : n.neighbors) copy.neighbors.add(clone(nb));'],
    ['ret', '  return copy;'],
  ],
  zeros: [
    ['init', 'queue = every 0 (distance 0);  every 1 starts unknown'],
    ['ring', 'take the whole queue: every cell at distance d'],
    ['nbr', '  each unknown neighbour gets distance d + 1 and joins the queue'],
  ],
  gates: [
    ['init', 'queue = every gate (distance 0)'],
    ['ring', 'take the whole queue: every cell at distance d'],
    ['nbr', '  each neighbour still INF (not a wall) gets d + 1 and joins the queue'],
  ],
  surrounded: [
    ['edge', 'for every O on the border: mark(r, c);        // these can\'t be captured'],
    ['mark', 'mark(r, c): if (O and unmarked) { safe; mark the 4 neighbours; }'],
    ['flip', 'every O not marked safe → X'],
  ],
  pacific: [
    ['pac', 'BFS from all top and left edge cells (Pacific)'],
    ['climb', '  step to a neighbour that is not lower: water could flow back down that step'],
    ['atl', 'BFS from all bottom and right edge cells (Atlantic)'],
    ['both', 'answer = cells reached by both searches'],
  ],
  lock: [
    ['init', 'if ("00" is dead) return −1;  queue = ["00"]'],
    ['ring', 'take the whole queue: every combination d moves away'],
    ['nbr', '  turn each wheel up or down (9 ↔ 0 wraps): unseen and not dead → d + 1'],
    ['end', 'the first time target is reached, d is the answer'],
  ],
  division: [
    ['build', 'a / b = v  →  edge a → b weight v, edge b → a weight 1 / v'],
    ['ask', 'query c / d: if (c or d unknown) return −1;'],
    ['dfs', '  DFS from c multiplying weights along the path'],
    ['hit', '  reach d → the product is c / d;  never reach it → −1'],
  ],
  ladder: [
    ['init', 'queue = [beginWord];  dict = set(wordList)'],
    ['level', 'take the whole queue: every word d steps from the start'],
    ['gen', '  change each letter to a…z; in dict → next level, remove it from dict'],
    ['end', '  endWord generated → return d + 1 (words, counting both ends)'],
  ],
  itinerary: [
    ['sort', 'each airport: its destinations, smallest first'],
    ['go', 'while (stack) { top = stack.peek(); if (top has a ticket left) push(smallest destination);'],
    ['stuck', '  else route.addFirst(stack.pop()); }      // stuck: this airport ends what is left'],
  ],
})[mode];

// ---------------------------------------------------------------- answers (brute force, for the checks)

export function graphWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'flood') {
    const img = copyGrid(input.image);
    const old = img[input.sr][input.sc];
    if (old === input.color) return img;
    const st = [[input.sr, input.sc]];
    while (st.length) {
      const [r, c] = st.pop();
      if (!inside(img, r, c) || img[r][c] !== old) continue;
      img[r][c] = input.color;
      DIRS4.forEach(([dr, dc]) => st.push([r + dr, c + dc]));
    }
    return img;
  }
  if (mode === 'perimeter') {
    let p = 0;
    input.grid.forEach((row, r) => row.forEach((v, c) => { if (v) DIRS4.forEach(([dr, dc]) => { if (!inside(input.grid, r + dr, c + dc) || !input.grid[r + dr][c + dc]) p++; }); }));
    return p;
  }
  if (mode === 'judge') {
    for (let p = 1; p <= input.n; p++) {
      const trustsNobody = !input.trust.some(([a]) => a === p);
      const all = Array.from({ length: input.n }, (_, k) => k + 1).filter((q) => q !== p).every((q) => input.trust.some(([a, b]) => a === q && b === p));
      if (trustsNobody && all) return p;
    }
    return -1;
  }
  if (mode === 'provinces') {
    const n = input.m.length;
    const par = Array.from({ length: n }, (_, k) => k);
    const find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (input.m[i][j]) par[find(i)] = find(j);
    return new Set(par.map((_, k) => find(k))).size;
  }
  if (mode === 'clone') return input.adj.map((l) => [...l]);
  if (mode === 'zeros' || mode === 'gates') {
    const g = mode === 'zeros' ? input.mat : input.rooms;
      return g.map((row, r) => row.map((v, c) => {
      if (mode === 'gates' && v === 2) return -1;
      let best = Infinity;
      g.forEach((row2, r2) => row2.forEach((v2, c2) => {
        if (v2 !== 0) return;
        // BFS distance avoiding walls (gates); plain Manhattan for zeros
        if (mode === 'zeros') best = Math.min(best, Math.abs(r - r2) + Math.abs(c - c2));
      }));
      if (mode === 'zeros') return best;
      const dist = g.map((x) => x.map(() => -1));
      dist[r][c] = 0;
      const q = [[r, c]];
      for (let h = 0; h < q.length; h++) {
        const [a, b] = q[h];
        if (g[a][b] === 0) return dist[a][b];
        for (const [dr, dc] of DIRS4) { const x = a + dr, y = b + dc; if (inside(g, x, y) && g[x][y] !== 2 && dist[x][y] < 0) { dist[x][y] = dist[a][b] + 1; q.push([x, y]); } }
      }
      return 2147483647;
    }));
  }
  if (mode === 'surrounded') {
    const b = input.board;
    return b.map((row, r) => row.map((v, c) => {
      if (!v) return 0;
      const seen = new Set([`${r},${c}`]);
      const q = [[r, c]];
      for (let h = 0; h < q.length; h++) {
        const [a, d] = q[h];
        if (a === 0 || d === 0 || a === b.length - 1 || d === b[0].length - 1) return 1;
        for (const [dr, dc] of DIRS4) { const x = a + dr, y = d + dc; if (inside(b, x, y) && b[x][y] && !seen.has(`${x},${y}`)) { seen.add(`${x},${y}`); q.push([x, y]); } }
      }
      return 0;
    }));
  }
  if (mode === 'pacific') {
    const h = input.h;
    const R = h.length, C = h[0].length;
    const out = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      let pac = false, atl = false;
      const seen = new Set([`${r},${c}`]);
      const q = [[r, c]];
      for (let k = 0; k < q.length; k++) {
        const [a, b] = q[k];
        if (a === 0 || b === 0) pac = true;
        if (a === R - 1 || b === C - 1) atl = true;
        for (const [dr, dc] of DIRS4) { const x = a + dr, y = b + dc; if (inside(h, x, y) && h[x][y] <= h[a][b] && !seen.has(`${x},${y}`)) { seen.add(`${x},${y}`); q.push([x, y]); } }
      }
      if (pac && atl) out.push([r, c]);
    }
    return out;
  }
  if (mode === 'lock') {
    const dead = new Set(input.dead);
    if (dead.has('00')) return -1;
    const dist = { '00': 0 };
    const q = ['00'];
    for (let h = 0; h < q.length; h++) {
      const s = q[h];
      if (s === input.target) return dist[s];
      for (const nb of lockNbrs(s)) if (!dead.has(nb) && dist[nb] === undefined) { dist[nb] = dist[s] + 1; q.push(nb); }
    }
    return -1;
  }
  if (mode === 'division') {
    const adj = divisionGraph(input.eq);
    return input.queries.map(([c, d]) => {
      if (!adj[c] || !adj[d]) return -1;
      const best = { [c]: 1 };
      const q = [c];
      for (let h = 0; h < q.length; h++) for (const [nb, w] of adj[q[h]]) if (best[nb] === undefined) { best[nb] = best[q[h]] * w; q.push(nb); }
      return best[d] ?? -1;
    });
  }
  if (mode === 'ladder') {
    const dict = new Set(input.words);
    if (!dict.has(input.end)) return 0;
    const dist = { [input.begin]: 1 };
    const q = [input.begin];
    for (let h = 0; h < q.length; h++) {
      const w = q[h];
      if (w === input.end) return dist[w];
      for (const x of input.words) if (dist[x] === undefined && diff1(w, x)) { dist[x] = dist[w] + 1; q.push(x); }
    }
    return 0;
  }
  // itinerary: backtracking in sorted order
  const n = input.tickets.length;
  const order = input.tickets.map((t, k) => k).sort((a, b) => (input.tickets[a][1] < input.tickets[b][1] ? -1 : input.tickets[a][1] > input.tickets[b][1] ? 1 : 0));
  const used = new Array(n).fill(false);
  const route = ['JFK'];
  const go = () => {
    if (route.length === n + 1) return true;
    const here = route.at(-1);
    for (const k of order) {
      if (used[k] || input.tickets[k][0] !== here) continue;
      used[k] = true; route.push(input.tickets[k][1]);
      if (go()) return true;
      used[k] = false; route.pop();
    }
    return false;
  };
  go();
  return route;
}

const diff1 = (a, b) => a.length === b.length && [...a].filter((ch, k) => ch !== b[k]).length === 1;
const lockNbrs = (s) => [0, 1].flatMap((k) => [1, 9].map((d) => { const a = [...s]; a[k] = String((Number(a[k]) + d) % 10); return a.join(''); }));

function divisionGraph(eq) {
  const adj = {};
  for (const [a, b, v] of eq) {
    (adj[a] ??= []).push([b, v]);
    (adj[b] ??= []).push([a, 1 / v]);
  }
  return adj;
}

// ---------------------------------------------------------------- flood fill

const COLS = 6;

function flood({ image, sr, sc, color }) {
  const img = copyGrid(image);
  const old = image[sr][sc];
  const steps = [];
  const painted = new Set();
  const stack = [];
  const snap = (x) => steps.push({
    grid: cellsOf(img, (r, c, v) => ({ l: String(v), c: [`col_${v % COLS}`, x.cur && x.cur[0] === r && x.cur[1] === c && 'cellCur', painted.has(`${r},${c}`) && 'painted', r === sr && c === sc && 'start'] })),
    rows: [{ label: 'call stack (deepest →)', chips: stack.map(([r, c]) => ({ text: at(r, c) })) }],
    out: copyGrid(img),
    ...x,
  });
  snap({
    kind: 'start', cur: [sr, sc], lines: [],
    title: `Fill from ${at(sr, sc)} with colour ${color}`,
    text: `The start pixel has colour ${old}. Everything connected to it through pixels of colour ${old} (up, down, left, right) changes to ${color}. Pixels of colour ${old} that aren't connected keep their colour, and so does everything else.`,
    calc: [`old = ${old}`, `color = ${color}`],
  });
  if (old === color) {
    snap({ kind: 'done', cur: null, lines: ['same'], answer: 'unchanged', title: `Already colour ${color}: return as is`, text: `The start pixel already has colour ${color}, so painting changes nothing. Worse, a painted pixel would still match the old colour, and the fill would bounce between neighbours forever. Return the image unchanged.`, calc: ['return image'] });
    return steps;
  }
  const fill = (r, c) => {
    img[r][c] = color;
    painted.add(`${r},${c}`);
    stack.push([r, c]);
    const next = DIRS4.map(([dr, dc]) => [r + dr, c + dc]).filter(([x, y]) => inside(img, x, y) && img[x][y] === old);
    snap({
      kind: 'paint', cur: [r, c], lines: ['stop', 'paint', 'dirs'],
      title: `Paint ${at(r, c)}`,
      text: `${at(r, c)} has the old colour ${old}, so it becomes ${color}. Its new colour also marks it as done: a later call that lands here sees ${color}, not ${old}, and returns at once. ${next.length ? `Neighbours still ${old}: ${next.map(([x, y]) => at(x, y)).join(', ')}.` : `No neighbour still has colour ${old}: this call returns.`}`,
      calc: [`painted ${painted.size}`, `depth ${stack.length}`],
    });
    for (const [dr, dc] of DIRS4) {
      const x = r + dr, y = c + dc;
      if (inside(img, x, y) && img[x][y] === old) fill(x, y);
    }
    stack.pop();
  };
  fill(sr, sc);
  snap({
    kind: 'done', cur: null, lines: [], answer: `${painted.size} pixels painted`,
    title: `Done: ${plural(painted.size, 'pixel')} painted`,
    text: `Each pixel was painted at most once and checked from at most 4 neighbours: O(rows × cols). ${img.flat().filter((v) => v === old).length ? `The pixels still coloured ${old} were never connected to the start.` : ''}`,
    calc: [`${painted.size} painted`],
  });
  return steps;
}

// ---------------------------------------------------------------- island perimeter

function perimeter({ grid }) {
  const steps = [];
  const exposed = {};
  let total = 0, land = 0, shared = 0;
  const snap = (x) => steps.push({
    grid: cellsOf(grid, (r, c, v) => ({ l: exposed[`${r},${c}`] !== undefined ? String(exposed[`${r},${c}`]) : '', c: [v ? 'land' : 'water', exposed[`${r},${c}`] !== undefined && 'counted', x.cur && x.cur[0] === r && x.cur[1] === c && 'cellCur'] })),
    total, ...x,
  });
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'Count the sides that face water',
    text: 'The perimeter is made of cell sides. A side of a land cell is on the perimeter exactly when the other side is water or the edge of the map. A side shared with another land cell is inside the island. So count, for every land cell, its sides that don\'t touch land.',
    calc: ['perimeter = 0'],
  });
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    const nbrs = DIRS4.filter(([dr, dc]) => inside(grid, r + dr, c + dc) && grid[r + dr][c + dc]);
    const e = 4 - nbrs.length;
    exposed[`${r},${c}`] = e;
    total += e;
    land++;
    shared += [[0, 1], [1, 0]].filter(([dr, dc]) => inside(grid, r + dr, c + dc) && grid[r + dr][c + dc]).length;
    snap({
      kind: 'count', cur: [r, c], lines: ['scan', 'count'],
      title: `${at(r, c)}: ${plural(e, 'side')} on the perimeter`,
      text: `${at(r, c)} has ${plural(nbrs.length, 'land neighbour')}, so ${nbrs.length} of its 4 sides are inside the island and ${e} face${e === 1 ? 's' : ''} water or the edge. Perimeter so far: ${total}.`,
      calc: [`+${e}`, `perimeter = ${total}`],
    });
  }));
  snap({
    kind: 'done', cur: null, lines: [], answer: `perimeter = ${total}`,
    title: `Perimeter = ${total}`,
    text: `The same number another way: ${land} land cells bring 4 sides each (${4 * land}), and each of the ${plural(shared, 'pair')} of touching land cells hides 2 of them: ${4 * land} − 2 × ${shared} = ${total}. One scan, O(rows × cols); no search needed, because there is only one island.`,
    calc: [`4 × ${land} − 2 × ${shared} = ${total}`],
  });
  return steps;
}

// ---------------------------------------------------------------- town judge

function judge({ n, trust }) {
  const score = Array(n + 1).fill(0);
  const steps = [];
  let done = -1;
  const people = Array.from({ length: n }, (_, k) => k + 1);
  const snap = (x) => steps.push({
    graphs: [{
      label: 'who trusts whom',
      nodes: people.map((p) => ({ id: p, l: String(p), badge: String(score[p]), c: [x.pick === p && 'nodeDone', x.pair && x.pair.includes(p) && 'nodeCur', x.bad?.includes(p) && 'nodeBad'] })),
      edges: trust.map(([a, b], k) => ({ a, b, dir: true, tone: k === x.k ? 'on' : k < done + 1 ? 'plain' : 'faded' })),
    }],
    rows: [{ label: `score (judge needs ${n - 1})`, chips: people.map((p) => ({ text: `${p}: ${score[p]}`, tone: score[p] === n - 1 ? 'success' : undefined })) }],
    ...x,
  });
  snap({
    kind: 'start', lines: [],
    title: `${n} people, ${plural(trust.length, 'trust arrow')}`,
    text: `The judge has an arrow from each of the other ${n - 1} people and no arrow going out. Give everyone one score: +1 for each arrow coming in, −1 for each arrow going out. Only someone with n − 1 = ${n - 1} arrows in and none out can reach ${n - 1}.`,
    calc: ['all scores 0'],
  });
  trust.forEach(([a, b], k) => {
    score[a]--; score[b]++;
    done = k;
    snap({ kind: 'pair', k, pair: [a, b], lines: ['pair'], title: `${a} trusts ${b}`, text: `${a} trusts someone, so ${a} can't be the judge: ${a}'s score drops to ${score[a]}. ${b} gains a supporter: ${score[b]}.`, calc: [`score[${a}] = ${score[a]}`, `score[${b}] = ${score[b]}`] });
  });
  const j = people.find((p) => score[p] === n - 1) ?? -1;
  snap({
    kind: 'done', k: -1, pick: j, bad: j === -1 ? people : [], lines: j === -1 ? ['find', 'none'] : ['find'], answer: String(j),
    title: j === -1 ? 'Nobody scores n − 1: −1' : `${j} scores ${n - 1}: the judge`,
    text: j === -1
      ? `No score reached ${n - 1}. Either nobody is trusted by everyone, or the one who is also trusts someone, which costs a point. Return −1.`
      : `A score of ${n - 1} needs all ${n - 1} other people trusting ${j} and ${j} trusting nobody: any outgoing arrow would pull it below. O(n + trust) time, one array.`,
    calc: [`return ${j}`],
  });
  return steps;
}

// ---------------------------------------------------------------- provinces

function provinces({ m }) {
  const n = m.length;
  const prov = Array(n).fill(0);
  let count = 0;
  const stack = [];
  const steps = [];
  const edges = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (m[i][j]) edges.push([i, j]);
  const snap = (x) => steps.push({
    graphs: [{
      label: 'cities (an edge = isConnected 1)',
      nodes: m.map((_, i) => ({ id: i, l: String(i), badge: prov[i] ? `P${prov[i]}` : undefined, c: [prov[i] && `prov_${(prov[i] - 1) % 5}`, x.cur === i && 'nodeCur'] })),
      edges: edges.map(([a, b]) => ({ a, b, tone: prov[a] && prov[b] ? 'on' : 'plain' })),
    }],
    rows: [{ label: 'DFS stack', chips: stack.map((i) => ({ text: String(i) })) }],
    count, ...x,
  });
  snap({
    kind: 'start', cur: null, lines: [],
    title: `${n} cities: how many groups?`,
    text: 'The matrix is the graph: isConnected[i][j] = 1 is an edge between i and j. A province is everything you can reach from a city. So start a DFS from each city not yet reached: every start is a new province, and the DFS marks all of it.',
    calc: ['provinces = 0'],
  });
  const dfs = (i) => {
    prov[i] = count;
    stack.push(i);
    const nb = m[i].map((v, j) => (v && j !== i ? j : -1)).filter((j) => j >= 0);
    const fresh = nb.filter((j) => !prov[j]);
    snap({ kind: 'visit', cur: i, lines: ['visit'], title: `Visit city ${i}`, text: `Row ${i} of the matrix lists ${i}'s direct connections: ${nb.length ? nb.join(', ') : 'none'}. ${fresh.length ? `Not reached yet: ${fresh.join(', ')}; they join province ${count}.` : 'All of them are already in a province.'}`, calc: [`row ${i}: [${m[i].join(', ')}]`] });
    for (const j of nb) if (!prov[j]) dfs(j);
    stack.pop();
  };
  for (let i = 0; i < n; i++) {
    if (prov[i]) continue;
    count++;
    snap({ kind: 'found', cur: i, lines: ['scan'], title: `City ${i} is unreached: province ${count}`, text: `No earlier DFS reached city ${i}, so it isn't connected to any province found so far. Count a new one and explore it.`, calc: [`provinces = ${count}`] });
    dfs(i);
  }
  snap({
    kind: 'done', cur: null, lines: [], answer: `${count} provinces`,
    title: `${count} provinces`,
    text: `Each DFS start found one whole province. Reading every row costs n each: O(n²) for the matrix. Union–Find gives the same count by merging cities edge by edge.`,
    calc: [`return ${count}`],
  });
  return steps;
}

// ---------------------------------------------------------------- clone graph

function clone({ adj }) {
  const n = adj.length;
  const made = [];          // nodes copied, in order
  const copyEdges = [];     // [a, b] wired in the copy (a's list got b)
  const steps = [];
  const stack = [];
  const ids = Array.from({ length: n }, (_, k) => k + 1);
  const origEdges = [];
  ids.forEach((a) => adj[a - 1].forEach((b) => { if (a < b) origEdges.push([a, b]); }));
  const snap = (x) => {
    const has = new Set(made);
    const keys = new Set();
    const shown = copyEdges.filter(([a, b]) => { const k = a < b ? `${a}-${b}` : `${b}-${a}`; if (keys.has(k)) return false; keys.add(k); return true; });
    steps.push({
      graphs: [
        { label: 'original', nodes: ids.map((v) => ({ id: v, l: String(v), c: [has.has(v) && 'nodeDone', x.cur === v && 'nodeCur'] })), edges: origEdges.map(([a, b]) => ({ a, b, tone: x.edge && ((x.edge[0] === a && x.edge[1] === b) || (x.edge[0] === b && x.edge[1] === a)) ? 'on' : 'plain' })) },
        { label: 'copy', nodes: ids.map((v) => ({ id: v, l: `${v}'`, c: [has.has(v) ? 'nodeReady' : 'ghost', x.fresh === v && 'pop', x.reuse === v && 'nodeCur'] })), edges: shown.map(([a, b]) => ({ a, b, tone: x.edge && x.edge[0] === a && x.edge[1] === b ? 'good' : 'plain' })) },
      ],
      rows: [
        { label: 'map: original → copy', chips: made.map((v) => ({ text: `${v} → ${v}'`, tone: x.fresh === v ? 'success' : x.reuse === v ? 'accent' : undefined })) },
        { label: 'call stack', chips: stack.map((v) => ({ text: `clone(${v})` })) },
      ],
      out: ids.map((v) => copyEdges.filter(([a]) => a === v).map(([, b]) => b)),
      ...x,
    });
  };
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'Copy every node and every edge',
    text: 'Walk the graph and make a new node for each original one. The graph has cycles (1 – 2 – 3 – 4 – 1), so a walk keeps coming back to nodes it has seen. A map from each original node to its copy answers "copied already?" and hands back the copy to connect to.',
    calc: ['map = {}'],
  });
  const go = (v, from) => {
    if (made.includes(v)) {
      snap({ kind: 'reuse', cur: v, reuse: v, lines: ['seen'], title: `${v} is in the map: reuse ${v}'`, text: `${v} was copied already, so return the existing ${v}'. Without this check the walk would go round the cycle forever and make duplicates.`, calc: [`map.get(${v}) = ${v}'`] });
      return;
    }
    made.push(v);
    stack.push(v);
    snap({ kind: 'make', cur: v, fresh: v, lines: ['seen', 'make'], title: `Make ${v}' and record ${v} → ${v}'`, text: `${v} isn't in the map: create ${v}' and put it in the map now, before visiting the neighbours. A neighbour that leads back to ${v} will then find ${v}' instead of copying ${v} again.`, calc: [`map: ${made.map((u) => `${u}→${u}'`).join(', ')}`] });
    for (const nb of adj[v - 1]) {
      go(nb, v);
      copyEdges.push([v, nb]);
      snap({ kind: 'wire', cur: v, edge: [v, nb], lines: ['wire'], title: `${v}'.neighbors add ${nb}'`, text: `clone(${nb}) returned ${nb}'. Add it to ${v}'s neighbour list: the copy now has the edge ${v}' – ${nb}', pointing at copies only, never at an original node.`, calc: [`${v}'.neighbors = [${copyEdges.filter(([a]) => a === v).map(([, b]) => `${b}'`).join(', ')}]`] });
    }
    stack.pop();
  };
  go(1, null);
  snap({
    kind: 'done', cur: null, lines: ['ret'], answer: `${n} nodes copied`,
    title: `Done: ${plural(n, 'node')}, ${plural(origEdges.length, 'edge')} copied`,
    text: `Every node was copied once (the map saw to that) and every adjacency entry was wired once: O(V + E). The copy shares no node with the original.`,
    calc: ['return map.get(1)'],
  });
  return steps;
}

// ---------------------------------------------------------------- multi-source rings: 01 matrix, walls and gates

function rings({ mode, mat, rooms }) {
  const g = mode === 'zeros' ? mat : rooms;
  const INF = 2147483647;
  const dist = g.map((row) => row.map((v) => (mode === 'zeros' ? (v === 0 ? 0 : null) : v === 0 ? 0 : v === 2 ? -1 : null)));
  let queue = [];
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 0) queue.push([r, c]); }));
  const steps = [];
  const snap = (x) => {
    const fresh = new Set((x.fresh ?? []).map(([r, c]) => `${r},${c}`));
    steps.push({
      grid: cellsOf(g, (r, c, v) => {
        const d = dist[r][c];
        if (mode === 'gates' && v === 2) return { l: '#', c: ['wall'] };
        if (mode === 'gates' && v === 0) return { l: 'G', c: ['gate'] };
        return { l: d === null ? (mode === 'zeros' ? '?' : '∞') : String(d), c: [d === null ? 'open' : d === 0 ? 'src' : `ring_${d % 2 ? 'a' : 'b'}`, fresh.has(`${r},${c}`) && 'cellNew'] };
      }),
      out: dist.map((row) => row.map((d) => (d === null ? (mode === 'zeros' ? -1 : INF) : d))),
      ...x,
    });
  };
  const what = mode === 'zeros' ? '0' : 'gate';
  snap({
    kind: 'start', ring: 0, fresh: queue, lines: ['init'],
    title: `Ring 0: every ${what} at once`,
    text: mode === 'zeros'
      ? `Asking "how far is the nearest 0?" from each 1 separately repeats work. Turn it around: start one BFS from all ${plural(queue.length, 'zero')} together. The waves spread one step per round, so a 1 is first reached by the wave from its nearest 0, at exactly that distance.`
      : `A separate BFS from each gate would rewrite rooms again and again. Start one BFS from all ${plural(queue.length, 'gate')} together instead: the waves grow one step per round, so each room is first reached by its nearest gate and is written once. Walls (#) are never entered.`,
    calc: [`queue: ${queue.map(([r, c]) => `(${r},${c})`).join(' ')}`],
  });
  let d = 0;
  while (queue.length) {
    const next = [];
    for (const [r, c] of queue) for (const [dr, dc] of DIRS4) {
      const x = r + dr, y = c + dc;
      if (inside(g, x, y) && dist[x][y] === null) { dist[x][y] = d + 1; next.push([x, y]); }
    }
    if (!next.length) break;
    d++;
    queue = next;
    snap({
      kind: 'ring', ring: d, fresh: next, lines: ['ring', 'nbr'],
      title: `Ring ${d}: ${plural(next.length, 'cell')} at distance ${d}`,
      text: `Every unreached neighbour of ring ${d - 1} is ${d} step${d === 1 ? '' : 's'} from its nearest ${what}. Written now, and never again: a later wave would only be longer.`,
      calc: [`ring ${d}: ${next.map(([r, c]) => `(${r},${c})`).join(' ')}`],
    });
  }
  const left = dist.flat().filter((v) => v === null).length;
  snap({
    kind: 'done', ring: null, fresh: [], lines: [], answer: `${d} rings`,
    title: `Done after ${plural(d, 'ring')}`,
    text: `${left ? `${plural(left, 'room')} stay${left === 1 ? 's' : ''} INF: walls cut ${left === 1 ? 'it' : 'them'} off from every gate. ` : ''}Each cell joined the queue at most once: O(rows × cols) in total, however many ${what}s there are.`,
    calc: [`max distance ${d}`],
  });
  return steps;
}

// ---------------------------------------------------------------- surrounded regions

function surrounded({ board }) {
  const R = board.length, C = board[0].length;
  const b = copyGrid(board);              // 1 = O, 0 = X
  const safe = board.map((row) => row.map(() => false));
  const steps = [];
  const snap = (x) => {
    const fresh = new Set((x.fresh ?? []).map(([r, c]) => `${r},${c}`));
    const flip = new Set((x.flip ?? []).map(([r, c]) => `${r},${c}`));
    steps.push({
      grid: cellsOf(b, (r, c, v) => ({ l: v ? 'O' : 'X', c: [v ? (safe[r][c] ? 'safe' : 'oCell') : 'xCell', fresh.has(`${r},${c}`) && 'cellNew', flip.has(`${r},${c}`) && 'flipped', (r === 0 || c === 0 || r === R - 1 || c === C - 1) && 'border'] })),
      out: copyGrid(b),
      ...x,
    });
  };
  snap({
    kind: 'start', lines: [],
    title: 'Which O regions are trapped?',
    text: 'A region survives exactly when one of its O cells is on the border. Checking each region separately works, but it is simpler to flip the question: start from every O on the border, mark everything connected to it as safe, and then every O left unmarked is captured.',
    calc: [`${R} × ${C} board`],
  });
  const border = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if ((r === 0 || c === 0 || r === R - 1 || c === C - 1) && b[r][c]) border.push([r, c]);
  for (const [r, c] of border) {
    if (safe[r][c]) continue;
    const got = [];
    const st = [[r, c]];
    safe[r][c] = true;
    while (st.length) {
      const [a, d] = st.pop();
      got.push([a, d]);
      for (const [dr, dc] of DIRS4) { const x = a + dr, y = d + dc; if (inside(b, x, y) && b[x][y] && !safe[x][y]) { safe[x][y] = true; st.push([x, y]); } }
    }
    snap({
      kind: 'safe', fresh: got, lines: ['edge', 'mark'],
      title: `Border O at ${at(r, c)}: ${plural(got.length, 'cell')} safe`,
      text: `${at(r, c)} is on the border, so it can't be surrounded, and neither can any O connected to it: ${got.map(([x, y]) => at(x, y)).join(', ')}. Mark them all safe.`,
      calc: [`safe += ${got.length}`],
    });
  }
  if (!border.length) snap({ kind: 'safe', fresh: [], lines: ['edge'], title: 'No O on the border', text: 'Nothing touches the border, so no region is safe.', calc: ['safe = 0'] });
  const flip = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (b[r][c] && !safe[r][c]) { b[r][c] = 0; flip.push([r, c]); }
  snap({
    kind: 'flip', flip, lines: ['flip'], answer: `${plural(flip.length, 'cell')} captured`,
    title: flip.length ? `Flip ${plural(flip.length, 'trapped O')} to X` : 'Nothing is trapped',
    text: flip.length
      ? `Every O not marked safe has no path to the border: ${flip.map(([x, y]) => at(x, y)).join(', ')}. They become X. In place, the usual trick is to write a temporary '#' for safe cells, flip the remaining O's, then turn '#' back into O.`
      : 'Every O connects to the border, so the board stays as it is.',
    calc: [`flipped ${flip.length}`],
  });
  snap({ kind: 'done', lines: [], answer: `${plural(flip.length, 'cell')} captured`, title: 'Done', text: 'One search from the border plus one scan: every cell is handled a constant number of times, O(rows × cols).', calc: [`captured ${flip.length}`] });
  return steps;
}

// ---------------------------------------------------------------- pacific atlantic

function pacific({ h }) {
  const R = h.length, C = h[0].length;
  const pac = h.map((row) => row.map(() => false));
  const atl = h.map((row) => row.map(() => false));
  const steps = [];
  const snap = (x) => {
    const fresh = new Set((x.fresh ?? []).map(([r, c]) => `${r},${c}`));
    steps.push({
      grid: cellsOf(h, (r, c, v) => ({ l: String(v), c: [pac[r][c] && atl[r][c] ? (x.both ? 'both' : 'pacAtl') : pac[r][c] ? 'pac' : atl[r][c] ? 'atl' : 'open', fresh.has(`${r},${c}`) && 'cellNew'] })),
      out: [], ...x,
    });
  };
  snap({
    kind: 'start', lines: [],
    title: 'Where can rain reach both oceans?',
    text: 'Following the water downhill from every cell repeats the same paths again and again. Turn it around: start at each ocean\'s edge and walk uphill, to neighbours that are not lower. Every cell that walk reaches can drain back down into that ocean. Do it for both oceans and keep the cells reached twice.',
    calc: [`${R} × ${C} heights`],
  });
  const wave = (mark, starts, name, line) => {
    let q = starts.filter(([r, c]) => !mark[r][c]);
    q.forEach(([r, c]) => { mark[r][c] = true; });
    snap({ kind: name === 'Pacific' ? 'pac' : 'atl', fresh: q, lines: [line], title: `${name}: its edge cells drain into it`, text: `Every cell on the ${name === 'Pacific' ? 'top and left' : 'bottom and right'} edge flows straight into the ${name}. They are the starting wave.`, calc: [`${plural(q.length, 'cell')}`] });
    let round = 0;
    while (q.length) {
      const nx = [];
      for (const [r, c] of q) for (const [dr, dc] of DIRS4) {
        const x = r + dr, y = c + dc;
        if (inside(h, x, y) && !mark[x][y] && h[x][y] >= h[r][c]) { mark[x][y] = true; nx.push([x, y]); }
      }
      if (!nx.length) break;
      round++;
      q = nx;
      snap({
        kind: name === 'Pacific' ? 'pac' : 'atl', fresh: nx, lines: [line, 'climb'],
        title: `${name}, step ${round}: climb to ${plural(nx.length, 'cell')}`,
        text: `Each of these is at least as high as a neighbour already known to reach the ${name}, so rain on it can flow down that step and on to the ocean: ${nx.map(([a, b]) => `${at(a, b)}=${h[a][b]}`).join(', ')}.`,
        calc: [`${name} reach: ${mark.flat().filter(Boolean).length}`],
      });
    }
  };
  const top = [], bot = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (r === 0 || c === 0) top.push([r, c]);
    if (r === R - 1 || c === C - 1) bot.push([r, c]);
  }
  wave(pac, top, 'Pacific', 'pac');
  wave(atl, bot, 'Atlantic', 'atl');
  const out = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (pac[r][c] && atl[r][c]) out.push([r, c]);
  snap({
    kind: 'done', both: true, lines: ['both'], answer: `${plural(out.length, 'cell')}`, out,
    title: `${plural(out.length, 'cell')} reach both oceans`,
    text: `Reached by both searches: ${out.map(([r, c]) => `[${r}, ${c}]`).join(', ')}. Two searches, each visiting a cell at most once: O(rows × cols), instead of one search per cell.`,
    calc: [`${out.length} cells`],
  });
  return steps;
}

// ---------------------------------------------------------------- open the lock (two wheels: a 10 × 10 grid that wraps)

function lock({ dead, target }) {
  const deadSet = new Set(dead);
  const dist = {};
  const steps = [];
  const tr = Number(target[0]), tc = Number(target[1]);
  const snap = (x) => {
    const fresh = new Set(x.fresh ?? []);
    steps.push({
      grid: Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => {
        const s = `${r}${c}`;
        if (deadSet.has(s)) return { l: '✕', c: ['wall'] };
        const d = dist[s];
        return { l: d === undefined ? '' : String(d), c: [d === undefined ? 'open' : d === 0 ? 'src' : `ring_${d % 2 ? 'a' : 'b'}`, fresh.has(s) && 'cellNew', r === tr && c === tc && 'target'] };
      })),
      ...x,
    });
  };
  snap({
    kind: 'start', lines: [],
    title: `From 00 to ${target}`,
    text: 'With two wheels every combination is a cell of this 10 × 10 grid: row = first wheel, column = second wheel. One move turns one wheel by one, which is one step up, down, left or right, wrapping around the edges (9 ↔ 0). Dead ends (✕) are walls. Fewest moves = BFS. The real lock has four wheels: the same search on 10⁴ combinations, 8 neighbours each.',
    calc: [`dead: ${dead.join(', ') || 'none'}`],
  });
  if (deadSet.has('00')) {
    snap({ kind: 'done', lines: ['init'], answer: '-1', title: '00 itself is dead: −1', text: 'The lock is jammed before the first move.', calc: ['return -1'] });
    return steps;
  }
  dist['00'] = 0;
  let q = ['00'];
  let d = 0;
  snap({ kind: 'ring', fresh: q, lines: ['init'], title: 'Ring 0: 00', text: 'The start combination is 0 moves away.', calc: ['queue: 00'] });
  let found = target === '00';
  while (q.length && !found) {
    const nx = [];
    for (const s of q) for (const nb of lockNbrs(s)) if (!deadSet.has(nb) && dist[nb] === undefined) { dist[nb] = d + 1; nx.push(nb); }
    if (!nx.length) break;
    d++;
    q = nx;
    found = nx.includes(target);
    snap({
      kind: found ? 'found' : 'ring', fresh: nx, lines: found ? ['ring', 'nbr', 'end'] : ['ring', 'nbr'],
      title: found ? `Ring ${d} reaches ${target}: ${plural(d, 'move')}` : `Ring ${d}: ${plural(nx.length, 'combination')}`,
      text: found
        ? `${target} first appears in ring ${d}. Every combination of ring ${d - 1} was expanded before it, so no shorter sequence of turns exists.`
        : `Turning one wheel of a ring-${d - 1} combination gives these, each ${plural(d, 'move')} from 00. Dead ends are skipped; ${d === 1 ? 'note the wrap: 0 turned down is 9.' : 'combinations already reached are never queued again.'}`,
      calc: [`ring ${d}: ${nx.join(' ')}`],
    });
  }
  const ans = dist[target] ?? -1;
  snap({ kind: 'done', lines: ['end'], answer: String(ans), title: ans === -1 ? `${target} can't be reached: −1` : `Answer: ${ans}`, text: ans === -1 ? `BFS ran out of combinations: dead ends wall ${target} off on every side.` : `Each combination entered the queue at most once. With four wheels that is at most 10⁴ combinations × 8 turns: small enough for plain BFS.`, calc: [`return ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- evaluate division

function division({ eq, queries }) {
  const adj = divisionGraph(eq);
  const vars = Object.keys(adj);
  const steps = [];
  const answers = [];
  const snap = (x) => steps.push({
    graphs: [{
      label: 'a → b labelled a / b',
      nodes: vars.map((v) => ({ id: v, l: v, badge: x.prod?.[v] !== undefined ? num(x.prod[v]) : undefined, c: [x.path?.includes(v) && 'nodeDone', x.cur === v && 'nodeCur', x.q && (v === x.q[0] || v === x.q[1]) && 'nodeRoot'] })),
      edges: eq.map(([a, b, v]) => ({ a, b, dir: true, l: num(v), tone: x.path && x.path.includes(a) && x.path.includes(b) && Math.abs(x.path.indexOf(a) - x.path.indexOf(b)) === 1 ? 'on' : 'plain' })),
    }],
    rows: [{ label: 'answers', chips: answers.map((a, k) => ({ text: `${queries[k][0]}/${queries[k][1]} = ${num(a)}`, tone: a === -1 ? 'danger' : 'success' })) }],
    out: [...answers],
    ...x,
  });
  snap({
    kind: 'start', lines: ['build'],
    title: 'Equations are weighted edges',
    text: `a / b = 2 is an edge a → b with weight 2; walking it backwards, b → a, divides: weight 1/2. Then a / c is a path: a / c = (a / b) × (b / c). Each query is a search for a path, multiplying the weights along it.`,
    calc: eq.map(([a, b, v]) => `${a}/${b} = ${num(v)}`),
  });
  queries.forEach(([c, d], qi) => {
    if (!adj[c] || !adj[d]) {
      answers.push(-1);
      snap({ kind: 'miss', q: [c, d], lines: ['ask'], title: `${c} / ${d}: ${!adj[c] ? c : d} is unknown`, text: `${!adj[c] ? c : d} never appears in any equation, so nothing is known about it, not even ${c === d ? `that ${c} / ${c} = 1` : 'its size'}. Answer −1.`, calc: [`${c}/${d} = -1`] });
      return;
    }
    const prod = { [c]: 1 };
    const par = {};
    const st = [c];
    let found = c === d;
    snap({ kind: 'ask', q: [c, d], cur: c, prod: { ...prod }, path: [c], lines: ['ask', 'dfs'], title: `Query ${qi + 1}: ${c} / ${d}`, text: c === d ? `${c} appears in the equations, so ${c} / ${c} = 1.` : `Search from ${c} for ${d}, carrying ${c} / (current node). At ${c} itself that is 1.`, calc: [`${c}/${c} = 1`] });
    while (st.length && !found) {
      const u = st.pop();
      for (const [nb, w] of adj[u]) {
        if (prod[nb] !== undefined) continue;
        prod[nb] = prod[u] * w;
        par[nb] = u;
        st.push(nb);
        const path = [nb];
        while (path[0] !== c) path.unshift(par[path[0]]);
        snap({ kind: 'step', q: [c, d], cur: nb, prod: { ...prod }, path, lines: ['dfs'], title: `${u} → ${nb}: ${c}/${nb} = ${num(prod[nb])}`, text: `${c}/${u} = ${num(prod[u])} and ${u}/${nb} = ${num(w)}${eq.some(([a, b]) => a === nb && b === u) ? ` (the equation ${nb}/${u} walked backwards)` : ''}. Multiply: ${c}/${nb} = ${num(prod[nb])}.`, calc: [`${c}/${nb} = ${num(prod[u])} × ${num(w)} = ${num(prod[nb])}`] });
        if (nb === d) { found = true; break; }
      }
    }
    const val = prod[d] ?? -1;
    answers.push(val);
    const path = [d];
    if (val !== -1) while (path[0] !== c) path.unshift(par[path[0]]);
    snap({ kind: val === -1 ? 'miss' : 'hit', q: [c, d], prod: { ...prod }, path: val === -1 ? [] : path, lines: ['hit'], title: `${c} / ${d} = ${num(val)}`, text: val === -1 ? `${d} is in a different group of variables than ${c}: no chain of equations links them. Answer −1.` : `Path ${path.join(' → ')}: the product of its weights is ${num(val)}.`, calc: [`${c}/${d} = ${num(val)}`] });
  });
  snap({ kind: 'done', lines: [], answer: list(answers.map(num)), title: `Answers: ${list(answers.map(num))}`, text: 'Each query is one search: O(V + E) per query. With many queries, a weighted union-find answers each in nearly O(1).', calc: [list(answers.map(num))] });
  return steps;
}

// ---------------------------------------------------------------- word ladder

function ladder({ begin, end, words }) {
  const dict = new Set(words);
  const levels = [[begin]];
  const steps = [];
  let found = false;
  const snap = (x) => steps.push({
    rows: [
      ...levels.map((lv, k) => ({ label: `${ord(k + 1)} word`, chips: lv.map((w) => ({ text: w, tone: w === end ? 'success' : w === x.cur ? 'accent' : x.fresh?.includes(w) ? 'warn' : undefined, note: w === x.cur ? 'now' : undefined })) })),
      { label: 'still in the dictionary', chips: words.filter((w) => dict.has(w)).map((w) => ({ text: w })) },
    ],
    ...x,
  });
  snap({
    kind: 'start', lines: ['init'],
    title: `${begin} → ${end}, one letter at a time`,
    text: 'Every word is a node; two words are connected when they differ in one letter. The shortest transformation is a shortest path, so BFS level by level from the begin word. A word is removed from the dictionary as soon as it is reached, so it is never queued twice.',
    calc: [`dict: ${words.length} words`],
  });
  if (!dict.has(end)) {
    snap({ kind: 'done', lines: [], answer: '0', title: `${end} isn't in the list: 0`, text: 'Every word after the first must be in the list, including the last one. No sequence can exist.', calc: ['return 0'] });
    return steps;
  }
  let d = 1;                      // words in the chain up to the level being expanded
  while (!found && levels.at(-1).length) {
    const cur = levels.at(-1);
    const next = [];
    levels.push(next);
    for (const w of cur) {
      const got = [];
      for (let i = 0; i < w.length; i++) for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
        const x = w.slice(0, i) + ch + w.slice(i + 1);
        if (dict.has(x)) { dict.delete(x); got.push(x); next.push(x); }
      }
      const hit = got.includes(end);
      snap({
        kind: hit ? 'found' : 'expand', cur: w, fresh: got, lines: hit ? ['gen', 'end'] : ['level', 'gen'],
        title: hit ? `${w} → ${end}: ${d + 1} words` : `Expand ${w}: ${got.length ? got.join(', ') : 'nothing new'}`,
        text: hit
          ? `Changing one letter of ${w} gives ${end}. ${w} was word ${d} of the chain, so the shortest chain has ${d + 1} words.`
          : got.length
            ? `Try each position of ${w} with every letter a to z: ${got.join(', ')} ${got.length === 1 ? 'is' : 'are'} in the dictionary, word ${d + 1} of a chain. Remove ${got.length === 1 ? 'it' : 'them'} from the dictionary now, so no longer route can reach ${got.length === 1 ? 'it' : 'them'} later.`
            : `None of the ${w.length * 25} one-letter changes of ${w} is still in the dictionary: a dead end.`,
        calc: [`${w.length} × 26 = ${w.length * 26} candidates`, `found: ${got.join(', ') || 'none'}`],
      });
      if (hit) { found = true; break; }
    }
    if (!next.length) { levels.pop(); break; }
    if (!found) d++;
  }
  const ans = found ? d + 1 : 0;
  snap({
    kind: 'done', lines: [], answer: String(ans),
    title: found ? `Shortest chain: ${ans} words` : `No chain reaches ${end}: 0`,
    text: found
      ? `BFS finished every shorter chain before this one, so ${ans} is the minimum. Generating neighbours letter by letter costs L × 26 lookups per word, instead of comparing against all N words.`
      : `The queue ran dry: ${end} isn't connected to ${begin} by one-letter steps through the list.`,
    calc: [`return ${ans}`],
  });
  return steps;
}

// ---------------------------------------------------------------- reconstruct itinerary (Hierholzer)

function itinerary({ tickets }) {
  const airports = [...new Set(['JFK', ...tickets.flatMap((t) => t)])];
  const rest = Object.fromEntries(airports.map((a) => [a, tickets.map((t, k) => [t[1], k]).filter(([, k]) => tickets[k][0] === a).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] - y[1]))]));
  const used = new Set();
  const stack = ['JFK'];
  const route = [];
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{
      label: 'tickets (grey = not used yet)',
      nodes: airports.map((a) => ({ id: a, l: a, badge: rest[a].length ? String(rest[a].length) : undefined, c: [x.cur === a && 'nodeCur', route.includes(a) && 'nodeDone'] })),
      edges: tickets.map(([a, b], k) => ({ a, b, dir: true, tone: k === x.k ? 'good' : used.has(k) ? 'on' : 'faded' })),
    }],
    rows: [
      { label: 'stack (top →)', chips: stack.map((a, k) => ({ text: a, tone: k === stack.length - 1 ? 'accent' : undefined })) },
      { label: 'route (built from the back)', chips: route.map((a, k) => ({ text: a, tone: k === 0 && x.kind === 'stuck' ? 'success' : undefined })) },
    ],
    ...x,
  });
  snap({
    kind: 'start', cur: 'JFK', lines: ['sort'],
    title: 'Use every ticket exactly once, from JFK',
    text: 'Always taking the alphabetically smallest ticket can walk into a dead end while tickets are still left. Hierholzer\'s trick: keep walking greedily, and when an airport has no tickets left, it must be the end of what remains of the trip, so put it at the front of the route and back up. The route comes out in reverse, and the detours get spliced in.',
    calc: airports.map((a) => `${a}: ${rest[a].map(([b]) => b).join(', ') || '—'}`),
  });
  while (stack.length) {
    const top = stack.at(-1);
    if (rest[top].length) {
      const [b, k] = rest[top].shift();
      used.add(k);
      stack.push(b);
      snap({ kind: 'go', cur: b, k, lines: ['go'], title: `${top} → ${b}`, text: `${top} still has tickets; the smallest destination is ${b}. Use that ticket and push ${b}.`, calc: [`stack: ${stack.join(' ')}`] });
    } else {
      stack.pop();
      route.unshift(top);
      snap({ kind: 'stuck', cur: top, lines: ['stuck'], title: `${top} has no tickets left: route = ${route.join(' ')}`, text: `Nothing leaves ${top}, so every remaining ticket is used before arriving here for the last time: ${top} is the end of what is left. Put it at the front of the route and back up to ${stack.length ? stack.at(-1) : 'nothing'}${stack.length && rest[stack.at(-1)].length ? `, which still has a ticket: that loop will be spliced in before ${top}` : ''}.`, calc: [`route: ${route.join(' ')}`] });
    }
  }
  snap({ kind: 'done', cur: null, lines: [], answer: route.join(' '), title: `Itinerary: ${route.join(' → ')}`, text: `All ${plural(tickets.length, 'ticket')} used once. Each ticket is pushed and popped once; sorting the destinations is the main cost: O(E log E).`, calc: [route.join(' ')] });
  return steps;
}

// ---------------------------------------------------------------- dispatch, parsing, random inputs

export function graphWalk(input) {
  return {
    flood, perimeter, judge, provinces, clone, zeros: rings, gates: rings, surrounded, pacific, lock, division, ladder, itinerary,
  }[input.mode](input);
}

export const MODES_OF = (key) => GRAPH_WALK[key]?.input.mode ?? key;

const gridOf = (text, { allowed, maxR = 6, maxC = 7 }) => {
  const rows = String(text ?? '').split(/[;\n|]/).map((r) => r.replace(/[\s,]/g, '')).filter(Boolean);
  if (!rows.length) return { error: 'Type the grid row by row, separated by ;' };
  if (rows.length > maxR) return { error: `Use at most ${maxR} rows.` };
  const w = rows[0].length;
  if (rows.some((r) => r.length !== w)) return { error: 'Every row needs the same number of cells.' };
  if (w > maxC) return { error: `Use at most ${maxC} columns.` };
  if (rows.some((r) => [...r].some((ch) => !allowed.includes(ch)))) return { error: `Cells can only be ${[...allowed].join(', ')}.` };
  return { grid: rows.map((r) => [...r].map((ch) => allowed.indexOf(ch))) };
};
export const gridToText = (g, allowed) => g.map((r) => r.map((v) => allowed[v]).join('')).join('; ');

const countIslands = (g) => {
  const seen = new Set();
  let k = 0;
  g.forEach((row, r) => row.forEach((v, c) => {
    if (!v || seen.has(`${r},${c}`)) return;
    k++;
    const st = [[r, c]];
    seen.add(`${r},${c}`);
    while (st.length) { const [a, b] = st.pop(); for (const [dr, dc] of DIRS4) { const x = a + dr, y = b + dc; if (inside(g, x, y) && g[x][y] && !seen.has(`${x},${y}`)) { seen.add(`${x},${y}`); st.push([x, y]); } } }
  }));
  return k;
};

export function parseGraphWalk(values, input) {
  const { mode } = input;
  if (mode === 'flood') {
    const g = gridOf(values.image, { allowed: '012345' });
    if (g.error) return g;
    const sr = Number(values.sr), sc = Number(values.sc), color = Number(values.color);
    if (!Number.isInteger(sr) || !Number.isInteger(sc) || !inside(g.grid, sr, sc)) return { error: 'sr and sc must be a cell of the image.' };
    if (!Number.isInteger(color) || color < 0 || color > 5) return { error: 'color must be 0 to 5.' };
    return { input: { mode, image: g.grid, sr, sc, color } };
  }
  if (mode === 'perimeter') {
    const g = gridOf(values.grid, { allowed: '01' });
    if (g.error) return g;
    if (countIslands(g.grid) !== 1) return { error: 'The grid must hold exactly one island.' };
    return { input: { mode, grid: g.grid } };
  }
  if (mode === 'zeros') {
    const g = gridOf(values.grid, { allowed: '01' });
    if (g.error) return g;
    if (!g.grid.flat().includes(0)) return { error: 'Put at least one 0 in the matrix.' };
    return { input: { mode, mat: g.grid } };
  }
  if (mode === 'gates') {
    const g = gridOf(values.grid, { allowed: 'G.#' });
    return g.error ? g : { input: { mode, rooms: g.grid.map((r) => r.map((v) => [0, 1, 2][v])) } };
  }
  if (mode === 'surrounded') {
    const g = gridOf(values.grid, { allowed: 'XO' });
    return g.error ? g : { input: { mode, board: g.grid } };
  }
  if (mode === 'pacific') {
    const g = gridOf(values.grid, { allowed: '0123456789' });
    return g.error ? g : { input: { mode, h: g.grid } };
  }
  if (mode === 'provinces') {
    const g = gridOf(values.grid, { allowed: '01', maxR: 7, maxC: 7 });
    if (g.error) return g;
    const m = g.grid;
    if (m.length !== m[0].length) return { error: 'The matrix must be square.' };
    if (m.some((row, i) => row[i] !== 1 || row.some((v, j) => v !== m[j][i]))) return { error: 'Use 1 on the diagonal and keep the matrix symmetric.' };
    return { input: { mode, m } };
  }
  if (mode === 'judge') {
    const n = Number(values.n);
    if (!Number.isInteger(n) || n < 1 || n > 7) return { error: 'n must be 1 to 7.' };
    const pairs = String(values.trust ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const trust = [];
    for (const p of pairs) {
      const m = p.match(/^(\d+)\s*(?:>|->|→)\s*(\d+)$/);
      if (!m) return { error: `"${p}" should look like 1>3 (1 trusts 3).` };
      const a = Number(m[1]), b = Number(m[2]);
      if (a < 1 || b < 1 || a > n || b > n || a === b) return { error: 'People are 1 to n, and nobody trusts themselves.' };
      if (trust.some(([x, y]) => x === a && y === b)) return { error: 'Each pair once.' };
      trust.push([a, b]);
    }
    if (trust.length > 12) return { error: 'Use at most 12 pairs.' };
    return { input: { mode, n, trust } };
  }
  if (mode === 'clone') {
    const rows = String(values.adj ?? '').split(';').map((r) => r.split(/[\s,]+/).filter(Boolean).map(Number));
    const n = rows.length;
    if (n < 1 || n > 6) return { error: 'Use 1 to 6 nodes (one list per node, separated by ;).' };
    if (rows.some((r) => r.some((v) => !Number.isInteger(v) || v < 1 || v > n))) return { error: 'Neighbours are node numbers 1 to n.' };
    if (rows.some((r, i) => r.includes(i + 1) || new Set(r).size !== r.length || r.some((v) => !rows[v - 1].includes(i + 1)))) return { error: 'No self-loops or repeats, and every edge listed from both ends.' };
    const seen = new Set([1]);
    const st = [1];
    while (st.length) for (const v of rows[st.pop() - 1]) if (!seen.has(v)) { seen.add(v); st.push(v); }
    if (seen.size !== n) return { error: 'The graph must be connected.' };
    return { input: { mode, adj: rows } };
  }
  if (mode === 'lock') {
    const dead = String(values.dead ?? '').split(/[\s,;]+/).filter(Boolean);
    if (dead.some((d) => !/^\d\d$/.test(d))) return { error: 'Dead ends are two digits each, like 01, 10.' };
    const target = String(values.target ?? '').trim();
    if (!/^\d\d$/.test(target)) return { error: 'target is two digits, like 22.' };
    if (dead.includes(target)) return { error: 'target can\'t be a dead end.' };
    return { input: { mode, dead: [...new Set(dead)], target } };
  }
  if (mode === 'division') {
    const eq = [];
    for (const part of String(values.eq ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^([a-z0-9]{1,3})\s*\/\s*([a-z0-9]{1,3})\s*=\s*(\d+(?:\.\d+)?)$/);
      if (!m || Number(m[3]) <= 0) return { error: `"${part}" should look like a/b=2.` };
      eq.push([m[1], m[2], Number(m[3])]);
    }
    const queries = [];
    for (const part of String(values.queries ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^([a-z0-9]{1,3})\s*\/\s*([a-z0-9]{1,3})$/);
      if (!m) return { error: `"${part}" should look like a/c.` };
      queries.push([m[1], m[2]]);
    }
    if (!eq.length || eq.length > 6 || !queries.length || queries.length > 5) return { error: 'Use 1 to 6 equations and 1 to 5 queries.' };
    if (new Set(eq.flatMap(([a, b]) => [a, b])).size > 7) return { error: 'Use at most 7 variables.' };
    return { input: { mode, eq, queries } };
  }
  if (mode === 'ladder') {
    const begin = String(values.begin ?? '').trim().toLowerCase();
    const end = String(values.end ?? '').trim().toLowerCase();
    const words = [...new Set(String(values.words ?? '').toLowerCase().split(/[\s,;]+/).filter(Boolean))];
    if (!/^[a-z]{2,5}$/.test(begin) || end.length !== begin.length || words.some((w) => w.length !== begin.length || !/^[a-z]+$/.test(w))) return { error: 'All words: the same length, 2 to 5 lowercase letters.' };
    if (begin === end) return { error: 'beginWord and endWord must differ.' };
    if (words.length > 12) return { error: 'Use at most 12 words.' };
    return { input: { mode, begin, end, words } };
  }
  // itinerary
  const tickets = [];
  for (const part of String(values.tickets ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.toUpperCase().match(/^([A-Z]{3})\s*(?:>|->|→)\s*([A-Z]{3})$/);
    if (!m || m[1] === m[2]) return { error: `"${part}" should look like JFK>SFO.` };
    tickets.push([m[1], m[2]]);
  }
  if (!tickets.length || tickets.length > 8) return { error: 'Use 1 to 8 tickets.' };
  if (new Set(tickets.flat()).size > 6) return { error: 'Use at most 6 airports.' };
  const want = graphWalkAnswer({ mode: 'itinerary', tickets });
  if (want.length !== tickets.length + 1) return { error: 'No trip from JFK uses every ticket exactly once.' };
  return { input: { mode, tickets } };
}

export function randomGraphWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const R = g.int(3, 5), C = g.int(3, 6);
  const grid = (fn) => Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => fn(r, c)));
  if (mode === 'flood') {
    const image = grid(() => g.int(0, 2));
    return { mode, image, sr: g.int(0, R - 1), sc: g.int(0, C - 1), color: g.int(0, 3) };
  }
  if (mode === 'perimeter') {
    const gr = grid(() => 0);
    let cells = [[g.int(0, R - 1), g.int(0, C - 1)]];
    gr[cells[0][0]][cells[0][1]] = 1;
    const want = g.int(1, Math.min(9, R * C - 1));
    for (let k = 0; k < 40 && cells.length < want; k++) {
      const [r, c] = g.pick(cells);
      const [dr, dc] = g.pick(DIRS4);
      if (inside(gr, r + dr, c + dc) && !gr[r + dr][c + dc]) { gr[r + dr][c + dc] = 1; cells = [...cells, [r + dr, c + dc]]; }
    }
    return { mode, grid: gr };
  }
  if (mode === 'zeros') { const mat = grid(() => (g.bool(0.25) ? 0 : 1)); mat[g.int(0, R - 1)][g.int(0, C - 1)] = 0; return { mode, mat }; }
  if (mode === 'gates') { const rooms = grid(() => (g.bool(0.15) ? 0 : g.bool(0.25) ? 2 : 1)); return { mode, rooms }; }
  if (mode === 'surrounded') return { mode, board: grid(() => (g.bool(0.45) ? 1 : 0)) };
  if (mode === 'pacific') return { mode, h: grid(() => g.int(1, 7)) };
  if (mode === 'provinces') {
    const n = g.int(3, 7);
    const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (g.bool(0.25)) { m[i][j] = 1; m[j][i] = 1; }
    return { mode, m };
  }
  if (mode === 'judge') {
    const n = g.int(2, 5);
    const trust = [];
    const j = g.int(1, n);
    for (let a = 1; a <= n; a++) for (let b = 1; b <= n; b++) if (a !== b && (b === j ? g.bool(0.85) : g.bool(0.15))) trust.push([a, b]);
    return { mode, n, trust: g.shuffle(trust).slice(0, 12) };
  }
  if (mode === 'clone') {
    const n = g.int(2, 5);
    const adj = Array.from({ length: n }, () => []);
    const link = (a, b) => { if (a !== b && !adj[a - 1].includes(b)) { adj[a - 1].push(b); adj[b - 1].push(a); } };
    for (let v = 2; v <= n; v++) link(v, g.int(1, v - 1));
    for (let k = 0; k < n; k++) link(g.int(1, n), g.int(1, n));
    return { mode, adj };
  }
  if (mode === 'lock') {
    const target = `${g.int(0, 9)}${g.int(0, 9)}`;
    const dead = [...new Set(Array.from({ length: g.int(0, 10) }, () => `${g.int(0, 9)}${g.int(0, 9)}`))].filter((d) => d !== target && d !== '00');
    return { mode, dead, target: target === '00' ? '33' : target };
  }
  if (mode === 'division') {
    const names = g.shuffle(['a', 'b', 'c', 'd', 'e', 'x', 'y']).slice(0, g.int(3, 6));
    const eq = [];
    for (let k = 1; k < names.length; k++) if (g.bool(0.8)) eq.push([names[g.int(0, k - 1)], names[k], g.int(1, 6)]);
    if (!eq.length) eq.push([names[0], names[1], 2]);
    const queries = Array.from({ length: g.int(2, 4) }, () => [g.pick([...names, 'q']), g.pick(names)]);
    return { mode, eq, queries };
  }
  if (mode === 'ladder') {
    const pool = ['hot', 'dot', 'dog', 'lot', 'log', 'cog', 'cot', 'hog', 'hat', 'cat', 'cut', 'hut', 'dig', 'big'];
    const words = g.shuffle(pool).slice(0, g.int(4, 9));
    const begin = g.pick(['hit', 'hat', 'cot']);
    return { mode, begin, end: g.pick(words.filter((w) => w !== begin)), words };
  }
  // itinerary: a random walk from JFK becomes the ticket list
  const ap = ['JFK', 'ATL', 'SFO', 'LAX', 'MUC'].slice(0, g.int(2, 5));
  const tickets = [];
  let here = 'JFK';
  for (let k = 0; k < g.int(2, 7); k++) { const to = g.pick(ap.filter((a) => a !== here)); tickets.push([here, to]); here = to; }
  return { mode, tickets: g.shuffle(tickets) };
}
