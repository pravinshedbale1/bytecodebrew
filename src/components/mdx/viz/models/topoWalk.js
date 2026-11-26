/**
 * Topological sort problems (model for <TopoWalkViz>, drawn by the GraphWalkViz stage).
 * Frames: grid [[{ l, c }]], graphs [{ label, nodes, edges }], rows [{ label, chips }]. Pure, so
 * scripts/viz-check.mjs can test every mode.
 */
import { list, plural, rng } from './util.js';

export const TOPO_WALK = {
  reach: { label: 'Course Schedule IV', input: { mode: 'reach', n: 4, pre: [[0, 1], [1, 2], [3, 2]], queries: [[0, 2], [2, 0], [3, 1], [0, 3]] } },
  mht: { label: 'One centre', input: { mode: 'mht', n: 6, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]] } },
  mhtTwo: { label: 'Two centres', input: { mode: 'mht', n: 6, edges: [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]] } },
  safe: { label: 'Eventual safe states', input: { mode: 'safe', graph: [[1, 2], [2, 3], [5], [0], [5], [], []] } },
  recipes: { label: 'Recipes', input: { mode: 'recipes', recipes: ['bread', 'sandwich', 'burger'], ingredients: [['yeast', 'flour'], ['bread', 'meat'], ['sandwich', 'meat', 'bread']], supplies: ['yeast', 'flour', 'meat'] } },
  recipesStuck: { label: 'A recipe that needs itself', input: { mode: 'recipes', recipes: ['tea', 'cake', 'icing'], ingredients: [['water', 'leaf'], ['icing', 'egg'], ['cake', 'sugar']], supplies: ['water', 'leaf', 'egg', 'sugar'] } },
  alien: { label: 'Alien dictionary', input: { mode: 'alien', words: ['wrt', 'wrf', 'er', 'ett', 'rftt'] } },
  alienBad: { label: 'Prefix after its word', input: { mode: 'alien', words: ['abc', 'ab'] } },
  groups: { label: 'Items by groups', input: { mode: 'groups', n: 8, m: 2, group: [-1, -1, 1, 0, 0, 1, 0, -1], before: [[], [6], [5], [6], [3, 6], [], [], []] } },
  matrix: { label: 'Matrix with conditions', input: { mode: 'matrix', k: 3, rows: [[1, 2], [3, 2]], cols: [[2, 1], [3, 2]] } },
};

export const topoWalkCode = (mode) => ({
  reach: [
    ['init', 'reach[a][b] = true for every prerequisite a → b'],
    ['mid', 'for k: for i, j: reach[i][j] |= reach[i][k] && reach[k][j];   // k as a stepping stone'],
    ['ask', 'answer each query [u, v] with reach[u][v]'],
  ],
  mht: [
    ['leaves', 'leaves = every node of degree 1'],
    ['trim', 'while (more than 2 nodes left) { remove all leaves; neighbours lose 1 degree;'],
    ['next', '  neighbours that drop to degree 1 are the next leaves }'],
    ['end', 'the 1 or 2 nodes left are the centres'],
  ],
  safe: [
    ['rev', 'count[i] = out-edges of i;  reverse every edge'],
    ['init', 'queue = nodes with count 0 (terminal)'],
    ['peel', 'take u: safe; for each p with p → u: count[p]−−; 0 → p is safe too'],
    ['end', 'the rest can reach a cycle'],
  ],
  recipes: [
    ['need', 'need[r] = number of ingredients of recipe r'],
    ['init', 'queue = all supplies'],
    ['use', 'take x: for each recipe r that uses x: need[r]−−;'],
    ['make', '  need[r] == 0 → r is made: add it to the answer and to the queue'],
  ],
  alien: [
    ['pair', 'for each neighbouring pair: first differing letter a ≠ b → rule a before b'],
    ['prefix', 'no difference and the first word is longer → return ""'],
    ['kahn', 'Kahn: output letters with no incoming rule; each one frees the letters after it'],
    ['cycle', 'letters never freed → a cycle → return ""'],
  ],
  groups: [
    ['solo', 'every item with group −1 gets its own new group'],
    ['edges', 'before → item: same group → item edge; different groups → group edge'],
    ['gsort', 'topologically sort the groups'],
    ['isort', 'topologically sort the items'],
    ['place', 'walk the groups in order; inside each, its items in item order'],
  ],
  matrix: [
    ['rsort', 'rowOrder = topological sort of rowConditions (cycle → empty matrix)'],
    ['csort', 'colOrder = topological sort of colConditions'],
    ['place', 'number x goes to row = position in rowOrder, col = position in colOrder'],
  ],
})[mode];

// ---------------------------------------------------------------- helpers

/** Kahn's algorithm over nodes `ids` and edges [a, b] (a before b): the order, or null on a cycle. */
export function kahn(ids, edges) {
  const indeg = new Map(ids.map((x) => [x, 0]));
  const out = new Map(ids.map((x) => [x, []]));
  for (const [a, b] of edges) { out.get(a).push(b); indeg.set(b, indeg.get(b) + 1); }
  const q = ids.filter((x) => indeg.get(x) === 0);
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    for (const v of out.get(u)) { indeg.set(v, indeg.get(v) - 1); if (indeg.get(v) === 0) q.push(v); }
  }
  return order.length === ids.length ? order : null;
}

/** Rules from a sorted alien word list: { edges, letters, bad }. */
function alienRules(words) {
  const letters = [...new Set(words.join(''))];
  const edges = [];
  const pairs = [];
  for (let i = 0; i + 1 < words.length; i++) {
    const [a, b] = [words[i], words[i + 1]];
    let k = 0;
    while (k < a.length && k < b.length && a[k] === b[k]) k++;
    if (k === a.length || k === b.length) {
      if (a.length > b.length) return { letters, edges, pairs: [...pairs, { a, b, k, bad: true }], bad: true };
      pairs.push({ a, b, k, none: true });
      continue;
    }
    pairs.push({ a, b, k, rule: [a[k], b[k]] });
    if (!edges.some(([x, y]) => x === a[k] && y === b[k])) edges.push([a[k], b[k]]);
  }
  return { letters, edges, pairs, bad: false };
}

const groupOf = (input) => {
  let m = input.m;
  return input.group.map((g) => (g === -1 ? m++ : g));
};

// ---------------------------------------------------------------- answers and validity (for the checks)

export function topoWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'reach') {
    return input.queries.map(([u, v]) => {
      const seen = new Set([u]);
      const st = [u];
      while (st.length) { const x = st.pop(); for (const [a, b] of input.pre) if (a === x && !seen.has(b)) { seen.add(b); st.push(b); } }
      return u !== v && seen.has(v);
    });
  }
  if (mode === 'mht') {
    const adj = Array.from({ length: input.n }, () => []);
    input.edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    const height = (r) => { const d = { [r]: 0 }; const q = [r]; let h = 0; for (let i = 0; i < q.length; i++) for (const v of adj[q[i]]) if (d[v] === undefined) { d[v] = d[q[i]] + 1; h = Math.max(h, d[v]); q.push(v); } return h; };
    const hs = adj.map((_, r) => height(r));
    const best = Math.min(...hs);
    return hs.map((h, r) => (h === best ? r : -1)).filter((r) => r >= 0);
  }
  if (mode === 'safe') {
    const g = input.graph;
    const color = g.map(() => 0);
    const dfs = (u) => { if (color[u]) return color[u] === 2; color[u] = 1; for (const v of g[u]) if (!dfs(v)) return false; color[u] = 2; return true; };
    return g.map((_, u) => u).filter((u) => dfs(u));
  }
  if (mode === 'recipes') {
    const have = new Set(input.supplies);
    const made = [];
    for (let changed = true; changed;) {
      changed = false;
      input.recipes.forEach((r, i) => { if (!have.has(r) && input.ingredients[i].every((x) => have.has(x))) { have.add(r); made.push(r); changed = true; } });
    }
    return made.sort();
  }
  return null;   // alien, groups, matrix: any valid answer counts — see topoWalkValid
}

/** Is `got` a valid answer? For modes with many correct answers. */
export function topoWalkValid(input, got) {
  if (input.mode === 'alien') {
    const { letters, edges, bad } = alienRules(input.words);
    const possible = !bad && kahn(letters, edges) !== null;
    if (!possible) return got === '';
    if (got.length !== letters.length || new Set(got).size !== got.length || letters.some((c) => !got.includes(c))) return false;
    return edges.every(([a, b]) => got.indexOf(a) < got.indexOf(b));
  }
  if (input.mode === 'groups') {
    const g = groupOf(input);
    const ids = Array.from({ length: input.n }, (_, k) => k);
    const iEdges = input.before.flatMap((bs, i) => bs.map((b) => [b, i]));
    const gEdges = iEdges.filter(([a, b]) => g[a] !== g[b]).map(([a, b]) => [g[a], g[b]]);
    const possible = kahn(ids, iEdges) !== null && kahn([...new Set(g)], gEdges) !== null;
    if (!possible) return got.length === 0;
    if (got.length !== input.n || new Set(got).size !== input.n) return false;
    const pos = Object.fromEntries(got.map((x, k) => [x, k]));
    if (!iEdges.every(([a, b]) => pos[a] < pos[b])) return false;
    const seenGroups = [];
    got.forEach((x, k) => { if (k === 0 || g[got[k - 1]] !== g[x]) seenGroups.push(g[x]); });
    return new Set(seenGroups).size === seenGroups.length;
  }
  if (input.mode === 'matrix') {
    const ids = Array.from({ length: input.k }, (_, i) => i + 1);
    const possible = kahn(ids, input.rows) !== null && kahn(ids, input.cols) !== null;
    if (!possible) return got.length === 0;
    const at = {};
    got.forEach((row, r) => row.forEach((v, c) => { if (v) at[v] = [r, c]; }));
    if (Object.keys(at).length !== input.k || got.flat().filter(Boolean).length !== input.k) return false;
    return input.rows.every(([a, b]) => at[a][0] < at[b][0]) && input.cols.every(([a, b]) => at[a][1] < at[b][1]);
  }
  return true;
}

// ---------------------------------------------------------------- Course Schedule IV: reachability with stepping stones

function reach({ n, pre, queries }) {
  const R = Array.from({ length: n }, () => Array(n).fill(false));
  pre.forEach(([a, b]) => { R[a][b] = true; });
  const steps = [];
  const answers = [];
  const snap = (x) => {
    const fresh = new Set(x.fresh ?? []);
    steps.push({
      grid: R.map((row, i) => row.map((v, j) => ({ l: i === j ? '·' : v ? '✓' : '', c: [i === j ? 'xCell' : v ? 'ring_a' : 'open', fresh.has(`${i},${j}`) && 'cellNew', x.k !== undefined && (i === x.k || j === x.k) && i !== j && 'kLine'] }))),
      graphs: [{ label: 'a → b: a is a prerequisite of b', nodes: Array.from({ length: n }, (_, i) => ({ id: i, l: String(i), c: [x.k === i && 'nodeCur'] })), edges: pre.map(([a, b]) => ({ a, b, dir: true })) }],
      rows: [{ label: 'answers', chips: answers.map((a, q) => ({ text: `${queries[q][0]}→${queries[q][1]}: ${a}`, tone: a ? 'success' : 'danger' })) }],
      out: [...answers],
      caption: 'row i, column j: ✓ means i must come before j',
      ...x,
    });
  };
  snap({
    kind: 'start', lines: ['init'],
    title: `${plural(pre.length, 'direct prerequisite')}, ${plural(queries.length, 'query', 'queries')}`,
    text: `reach[i][j] (row i, column j) says whether i must come before j. Start with the direct rules only. Prerequisites chain: if 0 comes before 1 and 1 before 2, then 0 comes before 2, even though no rule says so directly. With ${plural(queries.length, 'query', 'queries')} to answer and only ${n} courses, fill the whole table once.`,
    calc: pre.length ? pre.map(([a, b]) => `${a} → ${b}`) : ['no prerequisites'],
  });
  for (let k = 0; k < n; k++) {
    const fresh = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && !R[i][j] && R[i][k] && R[k][j]) { R[i][j] = true; fresh.push(`${i},${j}`); }
    snap({
      kind: 'mid', k, fresh, lines: ['mid'],
      title: fresh.length ? `Through ${k}: ${plural(fresh.length, 'new pair')}` : `Through ${k}: nothing new`,
      text: fresh.length
        ? `Allow course ${k} as a stepping stone: whoever comes before ${k} also comes before everything ${k} comes before. New: ${fresh.map((p) => p.replace(',', ' → ')).join(', ')}.`
        : `Allow course ${k} as a stepping stone: ${R.some((r, i) => r[k] && i !== k) && R[k].some((v, j) => v && j !== k) ? 'every pair it links is already known.' : `nothing comes ${R.some((r, i) => r[k] && i !== k) ? 'after' : 'before'} ${k}, so it links no new pair.`}`,
      calc: [`reach[i][j] |= reach[i][${k}] && reach[${k}][j]`],
    });
  }
  queries.forEach(([u, v]) => answers.push(u !== v && R[u][v]));
  snap({
    kind: 'done', lines: ['ask'], answer: list(answers),
    title: `Answers: ${list(answers)}`,
    text: `After every course has had its turn as the middle, reach[i][j] covers chains of any length. Each query is now one lookup. Filling the table is O(n³) = ${n ** 3} for ${n} courses (10⁶ for 100), and then 10⁴ queries cost O(1) each.`,
    calc: queries.map(([u, v], q) => `${u}→${v}: ${answers[q]}`),
  });
  return steps;
}

// ---------------------------------------------------------------- minimum height trees: peel the leaves

function mht({ n, edges }) {
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const deg = adj.map((l) => l.length);
  const gone = new Set();
  const steps = [];
  const layers = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'the tree (badge = degree)', nodes: adj.map((_, i) => ({ id: i, l: String(i), badge: gone.has(i) ? undefined : String(deg[i]), c: [gone.has(i) && 'ghost', x.leaves?.includes(i) && 'nodeBad', x.centre?.includes(i) && 'nodeDone'] })), edges: edges.map(([a, b]) => ({ a, b, tone: gone.has(a) || gone.has(b) ? 'faded' : 'plain' })) }],
    rows: layers.map((l, k) => ({ label: `layer ${k + 1} removed`, chips: l.map((v) => ({ text: String(v) })) })),
    ...x,
  });
  snap({
    kind: 'start', lines: [],
    title: `${n} nodes: which roots give the lowest tree?`,
    text: 'A root\'s height is its distance to the farthest leaf. The best root sits in the middle of the tree\'s longest path. Find that middle from the outside in: remove every leaf at once, then the new leaves, and so on, like peeling an onion, until one or two nodes are left.',
    calc: [`${n} nodes, ${n - 1} edges`],
  });
  if (n <= 2) {
    snap({ kind: 'done', centre: adj.map((_, i) => i), lines: ['end'], answer: list(adj.map((_, i) => i)), title: `Answer: ${list(adj.map((_, i) => i))}`, text: n === 1 ? 'A single node is its own centre.' : 'Two nodes: either can be the root, height 1.', calc: [list(adj.map((_, i) => i))] });
    return steps;
  }
  let leaves = adj.map((_, i) => i).filter((i) => deg[i] === 1);
  let left = n;
  snap({ kind: 'leaves', leaves, lines: ['leaves'], title: `Leaves: ${leaves.join(', ')}`, text: `Nodes with one neighbour are leaves: ${leaves.join(', ')}. A leaf is never the best root when there are more than 2 nodes: its only neighbour is one step closer to everything else.`, calc: [`leaves = ${list(leaves)}`] });
  while (left > 2) {
    const next = [];
    for (const l of leaves) { gone.add(l); left--; for (const v of adj[l]) if (!gone.has(v)) { deg[v]--; if (deg[v] === 1) next.push(v); } }
    layers.push(leaves);
    const removed = leaves;
    leaves = next;
    snap({
      kind: 'trim', leaves: left > 2 ? next : [], lines: ['trim', 'next'],
      title: `Remove ${removed.join(', ')}: ${plural(left, 'node')} left`,
      text: `All current leaves go at once, so every longest path loses one node at each end and its middle stays the middle. ${left > 2 ? `New leaves: ${next.join(', ')}.` : `${plural(left, 'node')} left: stop.`}`,
      calc: [`left = ${left}`],
    });
  }
  const centre = adj.map((_, i) => i).filter((i) => !gone.has(i));
  snap({
    kind: 'done', centre, lines: ['end'], answer: list(centre),
    title: `Centre${centre.length > 1 ? 's' : ''}: ${list(centre)}`,
    text: `${centre.length === 1 ? 'One node is left: the longest path had an odd number of nodes, and this is its middle.' : 'Two neighbours are left: the longest path had an even number of nodes, so both middle nodes give the same height.'} Each node was removed once: O(n), versus O(n²) for a BFS from every root.`,
    calc: [list(centre)],
  });
  return steps;
}

// ---------------------------------------------------------------- eventual safe states: peel from the terminals

function safe({ graph }) {
  const n = graph.length;
  const count = graph.map((l) => l.length);
  const rev = Array.from({ length: n }, () => []);
  graph.forEach((l, u) => l.forEach((v) => rev[v].push(u)));
  const isSafe = new Set();
  let queue = graph.map((_, u) => u).filter((u) => count[u] === 0);
  const steps = [];
  const edges = graph.flatMap((l, u) => l.map((v) => [u, v]));
  const snap = (x) => steps.push({
    graphs: [{ label: 'badge = out-edges not yet known to be safe', nodes: graph.map((_, u) => ({ id: u, l: String(u), badge: isSafe.has(u) ? undefined : String(count[u]), c: [isSafe.has(u) && 'nodeDone', x.cur === u && 'nodeCur', x.bad?.includes(u) && 'nodeBad'] })), edges: edges.map(([a, b]) => ({ a, b, dir: true, tone: isSafe.has(b) ? (x.cur === b ? 'good' : 'on') : x.bad?.includes(a) && x.bad.includes(b) ? 'bad' : 'plain' })) }],
    rows: [{ label: 'queue (safe, to process)', chips: queue.map((u) => ({ text: String(u) })) }, { label: 'safe', chips: [...isSafe].sort((a, b) => a - b).map((u) => ({ text: String(u), tone: 'success' })) }],
    ...x,
  });
  snap({
    kind: 'start', lines: ['rev'],
    title: 'Which nodes can never get stuck in a cycle?',
    text: 'A terminal node (no out-edges) is safe. Any other node is safe once all of its out-edges lead to safe nodes. So count each node\'s out-edges and peel from the terminals backwards: each newly safe node takes one off the count of every node pointing at it.',
    calc: graph.map((l, u) => `${u}: ${l.length} out`),
  });
  queue.forEach((u) => isSafe.add(u));
  snap({ kind: 'init', lines: ['init'], title: `Terminal: ${queue.join(', ') || 'none'}`, text: queue.length ? `${queue.join(', ')} ${queue.length === 1 ? 'has' : 'have'} no out-edges: every path from ${queue.length === 1 ? 'it' : 'them'} ends at once. Safe.` : 'No terminal nodes: every path can go on forever, so nothing is safe.', calc: [`queue = ${list(queue)}`] });
  while (queue.length) {
    const u = queue.shift();
    const freed = [];
    for (const p of rev[u]) { count[p]--; if (count[p] === 0 && !isSafe.has(p)) { isSafe.add(p); freed.push(p); queue.push(p); } }
    snap({
      kind: 'peel', cur: u, lines: ['peel'],
      title: freed.length ? `${u} is safe → ${freed.join(', ')} safe too` : `${u} is safe: ${rev[u].length ? 'its parents still have other edges' : 'nothing points at it'}`,
      text: rev[u].length ? `Nodes pointing at ${u}: ${rev[u].join(', ')}. Each loses one unknown out-edge. ${freed.length ? `${freed.join(', ')} now ${freed.length === 1 ? 'has' : 'have'} none left: every way out leads to safe nodes.` : 'None of them is down to 0 yet.'}` : `No node points at ${u}, so it frees nothing.`,
      calc: rev[u].map((p) => `count[${p}] = ${count[p]}`).concat(rev[u].length ? [] : ['—']),
    });
  }
  const unsafe = graph.map((_, u) => u).filter((u) => !isSafe.has(u));
  const ans = [...isSafe].sort((a, b) => a - b);
  snap({
    kind: 'done', bad: unsafe, lines: ['end'], answer: list(ans), out: ans,
    title: `Safe: ${list(ans)}`,
    text: unsafe.length ? `${unsafe.join(', ')} never reached 0: each keeps an out-edge into a cycle (or towards one), so some path from it goes round forever.` : 'Every node reached 0: no path can get stuck.',
    calc: [list(ans)],
  });
  return steps;
}

// ---------------------------------------------------------------- recipes: supplies unlock recipes

function recipes({ recipes: rs, ingredients, supplies }) {
  const need = Object.fromEntries(rs.map((r, i) => [r, ingredients[i].length]));
  const users = {};
  rs.forEach((r, i) => ingredients[i].forEach((x) => (users[x] ??= []).push(r)));
  const items = [...new Set([...supplies, ...rs, ...ingredients.flat()])];
  const have = new Set();
  const made = [];
  let queue = [...supplies];
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'ingredient → recipe (badge = missing)', nodes: items.map((it) => ({ id: it, l: it, badge: rs.includes(it) && !made.includes(it) ? String(need[it]) : undefined, c: [made.includes(it) && 'nodeDone', supplies.includes(it) && 'nodeReady', x.cur === it && 'nodeCur', x.bad?.includes(it) && 'nodeBad'] })), edges: rs.flatMap((r, i) => ingredients[i].map((x2) => ({ a: x2, b: r, dir: true, tone: have.has(x2) ? 'on' : 'plain' }))) }],
    rows: [{ label: 'queue (available)', chips: queue.map((q) => ({ text: q })) }, { label: 'made', chips: made.map((m) => ({ text: m, tone: 'success' })) }],
    out: [...made].sort(),
    ...x,
  });
  snap({
    kind: 'start', lines: ['need'],
    title: 'What can you cook?',
    text: 'Each recipe waits for a number of ingredients: its count of what is still missing. Supplies are available from the start. Every time something becomes available, every recipe that uses it is missing one fewer thing; a recipe at 0 is cooked, and becomes available itself.',
    calc: rs.map((r) => `${r}: needs ${need[r]}`),
  });
  snap({ kind: 'init', lines: ['init'], title: `Supplies: ${supplies.join(', ')}`, text: 'All supplies go in the queue: they are available right away, in unlimited amounts.', calc: [`queue = ${list(queue)}`] });
  while (queue.length) {
    const x = queue.shift();
    have.add(x);
    const cooked = [];
    for (const r of users[x] ?? []) { need[r]--; if (need[r] === 0) { made.push(r); cooked.push(r); queue.push(r); } }
    snap({
      kind: cooked.length ? 'make' : 'use', cur: x, lines: cooked.length ? ['use', 'make'] : ['use'],
      title: cooked.length ? `${x} → cook ${cooked.join(', ')}` : `${x} is available`,
      text: (users[x] ?? []).length ? `${x} is used by ${users[x].join(', ')}: each is missing one fewer ingredient. ${cooked.length ? `${cooked.join(', ')} ${cooked.length === 1 ? 'is' : 'are'} now complete: cooked, and added to the queue as an ingredient for others.` : 'Nothing is complete yet.'}` : `No recipe uses ${x}, so nothing changes.`,
      calc: (users[x] ?? []).map((r) => `${r}: missing ${need[r]}`).concat((users[x] ?? []).length ? [] : ['—']),
    });
  }
  const stuck = rs.filter((r) => !made.includes(r));
  snap({
    kind: 'done', bad: stuck, lines: [], answer: list(made),
    title: `Cooked: ${list(made)}`,
    text: stuck.length ? `${stuck.join(', ')} never reached 0: ${stuck.map((r) => `${r} still misses ${ingredients[rs.indexOf(r)].filter((x2) => !have.has(x2)).join(', ')}`).join('; ')}. Recipes that need each other in a circle can never start.` : 'Every recipe was cooked.',
    calc: [`${made.length} of ${rs.length}`],
  });
  return steps;
}

// ---------------------------------------------------------------- alien dictionary

function alien({ words }) {
  const { letters, edges, pairs, bad } = alienRules(words);
  const steps = [];
  const shownEdges = [];
  const indeg = Object.fromEntries(letters.map((c) => [c, 0]));
  const order = [];
  let queue = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'a → b: a comes before b', nodes: letters.map((c) => ({ id: c, l: c, badge: order.includes(c) ? `#${order.indexOf(c) + 1}` : x.kahn ? String(indeg[c]) : undefined, c: [order.includes(c) && 'nodeDone', queue.includes(c) && 'nodeReady', x.cur === c && 'nodeCur', x.bad?.includes(c) && 'nodeBad'] })), edges: shownEdges.map(([a, b]) => ({ a, b, dir: true, tone: x.rule && x.rule[0] === a && x.rule[1] === b ? 'good' : order.includes(a) ? 'faded' : 'plain' })) }],
    rows: [{ label: 'words', chips: words.map((w, i) => ({ text: w, tone: x.pair === i || x.pair === i - 1 ? 'accent' : undefined })) }, { label: 'alphabet so far', chips: order.map((c) => ({ text: c, tone: 'success' })) }],
    ...x,
  });
  snap({
    kind: 'start', lines: [],
    title: 'Recover the alphabet from a sorted list',
    text: 'The list is sorted, so each word compares ≤ the next. Two neighbouring words agree up to their first differing letter; there, the first word\'s letter must come earlier in the alphabet. Everything after that letter tells you nothing. Collect those rules, then put the letters in an order that obeys them: a topological sort.',
    calc: [`${letters.length} letters: ${letters.join(' ')}`],
  });
  pairs.forEach((p, i) => {
    if (p.rule) {
      if (!shownEdges.some(([a, b]) => a === p.rule[0] && b === p.rule[1])) shownEdges.push(p.rule);
      snap({ kind: 'pair', pair: i, rule: p.rule, lines: ['pair'], title: `${p.a} vs ${p.b}: ${p.rule[0]} before ${p.rule[1]}`, text: `${p.k ? `They share "${p.a.slice(0, p.k)}". ` : ''}The first difference is ${p.rule[0]} vs ${p.rule[1]} at position ${p.k + 1}, and ${p.a} comes first in the list, so ${p.rule[0]} comes before ${p.rule[1]} in the alphabet.${p.a.length > p.k + 1 || p.b.length > p.k + 1 ? ' The letters after it say nothing.' : ''}`, calc: [`rule ${p.rule[0]} → ${p.rule[1]}`] });
    } else if (p.bad) {
      snap({ kind: 'fail', pair: i, lines: ['prefix'], answer: '""', title: `${p.a} before ${p.b}: impossible`, text: `${p.b} is a prefix of ${p.a}, and a word always comes before longer words that start with it. No alphabet can put ${p.a} first. Return "".`, calc: ['return ""'] });
    } else {
      snap({ kind: 'pair', pair: i, lines: ['pair'], title: `${p.a} vs ${p.b}: no rule`, text: `${p.a} is a prefix of ${p.b}, which is fine in any alphabet: no letters differ, so no rule.`, calc: ['no rule'] });
    }
  });
  if (bad) return steps;
  edges.forEach(([, b]) => { indeg[b]++; });
  queue = letters.filter((c) => indeg[c] === 0);
  snap({ kind: 'kahn', kahn: true, lines: ['kahn'], title: `Start with ${queue.join(', ')}`, text: `Badges count the rules pointing into each letter. ${queue.join(', ')} ${queue.length === 1 ? 'has' : 'have'} none: nothing has to come before ${queue.length === 1 ? 'it' : 'them'}. Letters with no rules at all can go anywhere.`, calc: [`queue = ${list(queue)}`] });
  while (queue.length) {
    const c = queue.shift();
    order.push(c);
    const freed = [];
    for (const [a, b] of edges) if (a === c) { indeg[b]--; if (indeg[b] === 0) { freed.push(b); queue.push(b); } }
    snap({ kind: 'take', kahn: true, cur: c, lines: ['kahn'], title: `Write ${c}${freed.length ? `: frees ${freed.join(', ')}` : ''}`, text: `${c} goes next in the alphabet. ${edges.some(([a]) => a === c) ? `Its rules to ${edges.filter(([a]) => a === c).map(([, b]) => b).join(', ')} are satisfied. ${freed.length ? `${freed.join(', ')} ${freed.length === 1 ? 'has' : 'have'} nothing left before ${freed.length === 1 ? 'it' : 'them'}.` : ''}` : 'No rule starts at it.'}`, calc: [`alphabet: ${order.join('')}`] });
  }
  const stuck = letters.filter((c) => !order.includes(c));
  if (stuck.length) {
    snap({ kind: 'fail', kahn: true, bad: stuck, lines: ['cycle'], answer: '""', title: 'A cycle: return ""', text: `${stuck.join(', ')} still have rules pointing at them from each other: the rules go round in a circle, so no alphabet obeys them all.`, calc: ['return ""'] });
    return steps;
  }
  snap({ kind: 'done', kahn: true, lines: [], answer: order.join(''), title: `Alphabet: "${order.join('')}"`, text: `Every rule points forward in this order. Building the rules costs one comparison per neighbouring pair (the total length of the words), and the sort is O(letters + rules).`, calc: [`"${order.join('')}"`] });
  return steps;
}

// ---------------------------------------------------------------- sort items by groups

function groups(input) {
  const { n, m, before } = input;
  const g = groupOf(input);
  const gids = [...new Set(g)].sort((a, b) => a - b);
  const iEdges = before.flatMap((bs, i) => bs.map((b) => [b, i]));
  const gEdges = [];
  iEdges.forEach(([a, b]) => { if (g[a] !== g[b] && !gEdges.some(([x, y]) => x === g[a] && y === g[b])) gEdges.push([g[a], g[b]]); });
  const items = Array.from({ length: n }, (_, i) => i);
  const steps = [];
  const gName = (x) => (x < m ? `G${x}` : `S${x}`);
  let gOrder = null, iOrder = null, out = [];
  const snap = (x) => steps.push({
    graphs: [x.groupGraph
      ? { label: 'groups (an arrow = some item must come first)', nodes: gids.map((x2) => ({ id: x2, l: gName(x2), badge: gOrder ? `#${gOrder.indexOf(x2) + 1}` : undefined, c: [`prov_${x2 % 5}`] })), edges: gEdges.map(([a, b]) => ({ a, b, dir: true, tone: 'on' })) }
      : { label: 'items (colour = group, arrow = must come first)', nodes: items.map((i) => ({ id: i, l: String(i), badge: gName(g[i]), c: [`prov_${g[i] % 5}`, x.cur === i && 'nodeCur'] })), edges: iEdges.map(([a, b]) => ({ a, b, dir: true, tone: g[a] === g[b] ? 'plain' : 'on' })) }],
    rows: [
      { label: 'group order', chips: (gOrder ?? []).map((x2) => ({ text: gName(x2) })) },
      { label: 'item order', chips: (iOrder ?? []).map((i) => ({ text: `${i}`, note: gName(g[i]) })) },
      { label: 'answer', chips: out.map((i) => ({ text: String(i), note: gName(g[i]), tone: 'success' })) },
    ],
    out: [...out],
    ...x,
  });
  snap({
    kind: 'start', lines: ['solo'],
    title: 'Two kinds of order at once',
    text: `Items of one group must sit together, and every item must follow its beforeItems. First give each ungrouped item a group of its own (S…), so every item has exactly one group: ${input.group.filter((x2) => x2 === -1).length} solo group${input.group.filter((x2) => x2 === -1).length === 1 ? '' : 's'} added.`,
    calc: items.map((i) => `${i}: ${gName(g[i])}`).slice(0, 8),
  });
  snap({ kind: 'edges', lines: ['edges'], title: `${plural(iEdges.length, 'rule')}, ${plural(gEdges.length, 'between groups', 'between groups')}`, text: `A rule inside one group only orders items within it (grey arrows). A rule between two groups also orders the groups (dark arrows): the whole of the first group must come before the whole of the second.`, calc: gEdges.map(([a, b]) => `${gName(a)} → ${gName(b)}`).concat(gEdges.length ? [] : ['no group rules']) });
  gOrder = kahn(gids, gEdges);
  if (!gOrder) {
    gOrder = [];
    snap({ kind: 'fail', groupGraph: true, lines: ['gsort'], answer: '[]', title: 'The groups form a cycle: []', text: 'Two groups each need something from the other first. Since each group must stay together, no order works.', calc: ['return []'] });
    return steps;
  }
  snap({ kind: 'gsort', groupGraph: true, lines: ['gsort'], title: `Group order: ${gOrder.map(gName).join(' ')}`, text: 'Topologically sort the groups using only the dark arrows. Any order that respects them works.', calc: [gOrder.map(gName).join(' → ')] });
  iOrder = kahn(items, iEdges);
  if (!iOrder) {
    iOrder = [];
    snap({ kind: 'fail', lines: ['isort'], answer: '[]', title: 'The items form a cycle: []', text: 'Some items need each other first. No order of any kind works.', calc: ['return []'] });
    return steps;
  }
  snap({ kind: 'isort', lines: ['isort'], title: `Item order: ${iOrder.join(' ')}`, text: 'Topologically sort all the items with every arrow. This order respects every rule, but groups may be split up; the next step regroups them without breaking it.', calc: [iOrder.join(' → ')] });
  for (const gid of gOrder) {
    const mine = iOrder.filter((i) => g[i] === gid);
    out = [...out, ...mine];
    snap({ kind: 'place', lines: ['place'], title: `${gName(gid)}: ${mine.join(', ')}`, text: `Take group ${gName(gid)}'s items in item order: ${mine.join(', ')}. Rules inside the group hold because item order respects them; rules from other groups hold because those groups came earlier.`, calc: [`answer: ${list(out)}`] });
  }
  snap({ kind: 'done', lines: [], answer: list(out), title: `Answer: ${list(out)}`, text: 'Two topological sorts and one bucketing pass: O(n + rules).', calc: [list(out)] });
  return steps;
}

// ---------------------------------------------------------------- build a matrix with conditions

function matrix({ k, rows, cols }) {
  const ids = Array.from({ length: k }, (_, i) => i + 1);
  const M = Array.from({ length: k }, () => Array(k).fill(0));
  let rOrder = null, cOrder = null;
  const steps = [];
  const snap = (x) => steps.push({
    grid: M.map((row) => row.map((v) => ({ l: v ? String(v) : '', c: [v ? 'ring_a' : 'open', x.fresh === v && v && 'cellNew'] }))),
    rows: [
      { label: 'row order (top → bottom)', chips: (rOrder ?? []).map((v) => ({ text: String(v) })) },
      { label: 'column order (left → right)', chips: (cOrder ?? []).map((v) => ({ text: String(v) })) },
    ],
    out: M.map((r) => [...r]),
    ...x,
  });
  snap({
    kind: 'start', lines: [],
    title: `Place 1..${k} in a ${k} × ${k} grid`,
    text: 'Row conditions only say which number is higher; column conditions only say which is further left. The two never interact: sort the numbers once for rows and once for columns, separately, then each number\'s row is its position in the first order and its column its position in the second.',
    calc: [`rows: ${rows.map(([a, b]) => `${a} above ${b}`).join(', ')}`, `cols: ${cols.map(([a, b]) => `${a} left of ${b}`).join(', ')}`],
  });
  rOrder = kahn(ids, rows);
  if (!rOrder) { rOrder = []; snap({ kind: 'fail', lines: ['rsort'], answer: '[]', title: 'Row conditions form a cycle: []', text: 'Some numbers each need to be above the other. No matrix can satisfy that.', calc: ['return []'] }); return steps; }
  snap({ kind: 'rsort', lines: ['rsort'], title: `Rows: ${rOrder.join(', ')}`, text: `A topological sort of the row conditions: ${rOrder.join(' above ')}. Number ${rOrder[0]} goes in row 0, ${rOrder[1]} in row 1, and so on.`, calc: [`rowOrder = ${list(rOrder)}`] });
  cOrder = kahn(ids, cols);
  if (!cOrder) { cOrder = []; snap({ kind: 'fail', lines: ['csort'], answer: '[]', title: 'Column conditions form a cycle: []', text: 'Some numbers each need to be left of the other. Impossible.', calc: ['return []'] }); return steps; }
  snap({ kind: 'csort', lines: ['csort'], title: `Columns: ${cOrder.join(', ')}`, text: `Separately, the column conditions sort to ${cOrder.join(' left of ')}.`, calc: [`colOrder = ${list(cOrder)}`] });
  for (const v of ids) {
    const r = rOrder.indexOf(v), c = cOrder.indexOf(v);
    M[r][c] = v;
    snap({ kind: 'place', fresh: v, lines: ['place'], title: `${v} → row ${r}, column ${c}`, text: `${v} is number ${r + 1} in the row order and number ${c + 1} in the column order. Every number gets its own row and its own column, so no two collide.`, calc: [`M[${r}][${c}] = ${v}`] });
  }
  snap({ kind: 'done', lines: [], answer: 'built', title: 'Every condition holds', text: `Each row condition holds because row order respects it; each column condition likewise. Two topological sorts plus k² to build the matrix.`, calc: M.map((r) => `[${r.join(', ')}]`) });
  return steps;
}

// ---------------------------------------------------------------- dispatch, parsing, random

export function topoWalk(input) {
  return { reach, mht, safe, recipes, alien, groups, matrix }[input.mode](input);
}

const pairsOf = (text, max) => {
  const out = [];
  for (const p of String(text ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const mm = p.match(/^(\d+)\s*(?:>|->|→)\s*(\d+)$/);
    if (!mm) return { error: `"${p}" should look like 0>1.` };
    const a = Number(mm[1]), b = Number(mm[2]);
    if (a === b || a > max || b > max) return { error: `Use different numbers up to ${max}.` };
    out.push([a, b]);
  }
  return { pairs: out };
};

export function parseTopoWalk(values, input) {
  const { mode } = input;
  if (mode === 'reach') {
    const n = Number(values.n);
    if (!Number.isInteger(n) || n < 2 || n > 6) return { error: 'n must be 2 to 6.' };
    const p = pairsOf(values.pre, n - 1); if (p.error) return p;
    const q = pairsOf(values.queries, n - 1); if (q.error) return q;
    if (!q.pairs.length) return { error: 'Add at least one query.' };
    if (kahn(Array.from({ length: n }, (_, i) => i), p.pairs) === null) return { error: 'The prerequisites must not form a cycle.' };
    return { input: { mode, n, pre: p.pairs, queries: q.pairs.slice(0, 6) } };
  }
  if (mode === 'mht') {
    const n = Number(values.n);
    if (!Number.isInteger(n) || n < 1 || n > 8) return { error: 'n must be 1 to 8.' };
    const p = String(values.edges ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean).map((s) => s.split(/[-\s]+/).map(Number));
    if (p.length !== n - 1 || p.some((e) => e.length !== 2 || e.some((v) => !Number.isInteger(v) || v < 0 || v >= n))) return { error: `Give n − 1 = ${n - 1} edges like 0-1.` };
    const par = Array.from({ length: n }, (_, i) => i);
    const f = (x) => (par[x] === x ? x : (par[x] = f(par[x])));
    for (const [a, b] of p) { if (f(a) === f(b)) return { error: 'The edges must form a tree (no cycle).' }; par[f(a)] = f(b); }
    return { input: { mode, n, edges: p } };
  }
  if (mode === 'safe') {
    const rows = String(values.graph ?? '').split(';').map((r) => r.split(/[\s,]+/).filter(Boolean).map(Number));
    const n = rows.length;
    if (n < 1 || n > 8 || rows.some((r) => r.some((v) => !Number.isInteger(v) || v < 0 || v >= n))) return { error: 'One list per node (0 to 7 nodes), separated by ;' };
    return { input: { mode, graph: rows.map((r) => [...new Set(r)].sort((a, b) => a - b)) } };
  }
  if (mode === 'recipes') {
    const rs = []; const ing = [];
    for (const part of String(values.recipes ?? '').split(';').map((s) => s.trim()).filter(Boolean)) {
      const mm = part.match(/^([a-z]+)\s*:\s*([a-z ,]+)$/);
      if (!mm) return { error: `"${part}" should look like bread: yeast, flour` };
      rs.push(mm[1]); ing.push(mm[2].split(/[\s,]+/).filter(Boolean));
    }
    const supplies = String(values.supplies ?? '').split(/[\s,]+/).filter(Boolean);
    if (!rs.length || rs.length > 4 || new Set([...supplies, ...rs, ...ing.flat()]).size > 8) return { error: 'Up to 4 recipes and 8 different items.' };
    return { input: { mode, recipes: rs, ingredients: ing, supplies } };
  }
  if (mode === 'alien') {
    const words = String(values.words ?? '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
    if (words.length < 1 || words.length > 7 || words.some((w) => !/^[a-z]{1,6}$/.test(w))) return { error: '1 to 7 words of up to 6 letters.' };
    if (new Set(words.join('')).size > 7) return { error: 'Use at most 7 different letters.' };
    return { input: { mode, words } };
  }
  if (mode === 'groups') {
    const group = String(values.group ?? '').split(/[\s,]+/).filter(Boolean).map(Number);
    const n = group.length;
    const m = Number(values.m);
    if (n < 1 || n > 8 || !Number.isInteger(m) || m < 1 || group.some((x) => !Number.isInteger(x) || x < -1 || x >= m)) return { error: 'group: up to 8 values, each −1 or 0..m−1.' };
    const before = String(values.before ?? '').split(';').map((r) => r.split(/[\s,]+/).filter(Boolean).map(Number));
    while (before.length < n) before.push([]);
    if (before.length !== n || before.some((r, i) => r.some((v) => !Number.isInteger(v) || v < 0 || v >= n || v === i))) return { error: 'beforeItems: one list per item, separated by ;' };
    return { input: { mode, n, m, group, before } };
  }
  const k = Number(values.k);
  if (!Number.isInteger(k) || k < 2 || k > 6) return { error: 'k must be 2 to 6.' };
  const r = pairsOf(values.rows, k); if (r.error) return r;
  const c = pairsOf(values.cols, k); if (c.error) return c;
  if ([...r.pairs, ...c.pairs].some((p) => p.some((v) => v < 1))) return { error: 'Numbers are 1 to k.' };
  return { input: { mode: 'matrix', k, rows: r.pairs, cols: c.pairs } };
}

export function randomTopoWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const dag = (n, p) => { const e = []; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (g.bool(p)) e.push([a, b]); const perm = g.shuffle(Array.from({ length: n }, (_, i) => i)); return e.map(([a, b]) => [perm[a], perm[b]]); };
  if (mode === 'reach') {
    const n = g.int(3, 6);
    return { mode, n, pre: dag(n, 0.35), queries: Array.from({ length: g.int(2, 5) }, () => { const u = g.int(0, n - 1); let v = g.int(0, n - 1); if (v === u) v = (u + 1) % n; return [u, v]; }) };
  }
  if (mode === 'mht') {
    const n = g.int(1, 8);
    return { mode, n, edges: Array.from({ length: n - 1 }, (_, i) => [i + 1, g.int(0, i)]) };
  }
  if (mode === 'safe') {
    const n = g.int(3, 7);
    return { mode, graph: Array.from({ length: n }, () => [...new Set(Array.from({ length: g.int(0, 2) }, () => g.int(0, n - 1)))].sort((a, b) => a - b)) };
  }
  if (mode === 'recipes') {
    const names = g.shuffle(['tea', 'cake', 'soup', 'pie']).slice(0, g.int(1, 4));
    const sup = g.shuffle(['egg', 'milk', 'salt', 'oil']).slice(0, g.int(1, 3));
    const pool = [...names, ...sup, 'rice'];
    return { mode, recipes: names, ingredients: names.map((r) => [...new Set(Array.from({ length: g.int(1, 3) }, () => g.pick(pool.filter((x) => x !== r))))]), supplies: sup };
  }
  if (mode === 'alien') {
    const al = g.shuffle(['a', 'b', 'c', 'd', 'e']).slice(0, g.int(2, 5));
    const words = Array.from({ length: g.int(2, 6) }, () => Array.from({ length: g.int(1, 4) }, () => g.pick(al)).join(''));
    const rank = (w) => [...w].map((ch) => al.indexOf(ch));
    const cmp = (x, y) => { const a = rank(x), b = rank(y); for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i]; return a.length - b.length; };
    if (g.bool(0.75)) words.sort(cmp);
    return { mode, words };
  }
  if (mode === 'groups') {
    const n = g.int(3, 8), m = g.int(1, 3);
    const group = Array.from({ length: n }, () => g.int(-1, m - 1));
    const before = Array.from({ length: n }, () => []);
    dag(n, 0.2).forEach(([a, b]) => before[b].push(a));
    if (g.bool(0.15)) { const a = g.int(0, n - 1), b = (a + 1) % n; before[a].push(b); before[b].push(a); }
    return { mode, n, m, group, before: before.map((r) => [...new Set(r)]) };
  }
  const k = g.int(2, 5);
  const shift = (e) => e.map(([a, b]) => [a + 1, b + 1]);
  const cols = shift(dag(k, 0.3));
  if (g.bool(0.15) && k > 2) cols.push([cols[0]?.[1] ?? 2, cols[0]?.[0] ?? 1]);
  return { mode, k, rows: shift(dag(k, 0.3)), cols };
}
