/**
 * Union–Find problems (model for <UfWalkViz>, drawn by the GraphWalkViz stage). Besides grid / graphs / rows,
 * frames carry `forest`: { ids, label, parent, size, hot, bad, good, tag } — the union-find trees.
 * Pure, so scripts/viz-check.mjs can test every mode against an independent brute force.
 */
import { list, plural, rng } from './util.js';

export const UF_WALK = {
  path: { label: 'Path exists?', input: { mode: 'path', n: 6, edges: [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], source: 0, dest: 5 } },
  pathYes: { label: 'A path', input: { mode: 'path', n: 3, edges: [[0, 1], [1, 2], [2, 0]], source: 0, dest: 2 } },
  components: { label: 'Count components', input: { mode: 'components', n: 6, edges: [[0, 1], [1, 2], [3, 4], [2, 0]] } },
  tree: { label: 'Valid tree?', input: { mode: 'tree', n: 5, edges: [[0, 1], [0, 2], [0, 3], [1, 4]] } },
  treeCycle: { label: 'Not a tree: a cycle', input: { mode: 'tree', n: 5, edges: [[0, 1], [1, 2], [2, 0], [3, 4]] } },
  equations: { label: 'Equations', input: { mode: 'equations', eqs: ['a==b', 'b!=c', 'c==d', 'd==a'] } },
  equationsOk: { label: 'Satisfiable', input: { mode: 'equations', eqs: ['a==b', 'b==c', 'c!=d', 'e==d'] } },
  swaps: { label: 'Smallest string', input: { mode: 'swaps', s: 'dcabef', pairs: [[0, 3], [1, 2], [0, 2], [4, 5]] } },
  accounts: { label: 'Accounts merge', input: { mode: 'accounts', accounts: [['John', 'js@m', 'jny@m'], ['John', 'js@m', 'j00@m'], ['Mary', 'mary@m'], ['John', 'jb@m'], ['John', 'j00@m', 'jw@m']] } },
  mincost: { label: 'Min cost to connect', input: { mode: 'mincost', points: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]] } },
  slashes: { label: 'Regions by slashes', input: { mode: 'slashes', grid: [' /', '/ '] } },
  slashesBig: { label: 'A 3 × 3 grid', input: { mode: 'slashes', grid: ['/\\ ', '\\/ ', '  /'] } },
  factor: { label: 'Common factors', input: { mode: 'factor', nums: [4, 6, 15, 35, 11] } },
  gcd: { label: 'GCD traversal', input: { mode: 'gcd', nums: [2, 3, 6] } },
  gcdNo: { label: 'Not connected', input: { mode: 'gcd', nums: [3, 9, 5] } },
  critical: { label: 'Critical edges', input: { mode: 'critical', n: 5, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 2], [0, 3, 2], [0, 4, 3], [3, 4, 3], [1, 4, 6]] } },
};

const UNION = ['union', 'union(a, b): ra = find(a), rb = find(b); if (ra == rb) return false; smaller under bigger'];

export const ufWalkCode = (mode) => ({
  path: [['same', 'if (source == destination) return true;'], UNION, ['ask', 'return find(source) == find(destination);']],
  components: [['init', 'count = n                                   // every node alone'], UNION, ['dec', '  a real union merges two components: count−−']],
  tree: [['count', 'if (edges.length != n − 1) return false;     // a tree has exactly n − 1 edges'], UNION, ['cycle', '  union returns false → this edge closes a cycle → return false'], ['ok', 'return true;                                // n − 1 edges, no cycle → connected']],
  equations: [['eq', 'pass 1: for "a==b": union(a, b)'], UNION, ['ne', 'pass 2: for "a!=b": if (find(a) == find(b)) return false'], ['ok', 'return true;']],
  swaps: [UNION, ['group', 'group indices by find(i)'], ['sort', 'in each group: sorted letters go into the sorted indices']],
  accounts: [['owner', 'owner[email] = first account that lists it'], UNION, ['collect', 'group emails by find(owner[email]); sort each group']],
  mincost: [['edges', 'all pairs (i, j) with cost |dx| + |dy|, cheapest first'], UNION, ['take', '  union succeeds → take the edge: total += cost'], ['stop', 'stop after n − 1 edges']],
  slashes: [['draw', 'scale each cell to 3 × 3 pixels; a slash blocks 3 diagonal pixels'], ['fill', 'each flood fill from an unvisited free pixel = one region']],
  factor: [['factor', 'for each number x: for each prime p dividing x:'], UNION, ['size', 'answer = the largest number of values sharing one root']],
  gcd: [['factor', 'for each index i: for each prime p dividing nums[i]:'], UNION, ['size', 'return every index has the same root']],
  critical: [['base', 'best = Kruskal weight of the whole graph'], ['skip', 'for edge e: Kruskal without e → heavier or disconnected → critical'], ['force', '  else Kruskal starting with e → weight == best → pseudo-critical'], UNION],
})[mode];

// ---------------------------------------------------------------- a union-find that remembers its trees

class UF {
  constructor(ids) { this.parent = {}; this.size = {}; ids.forEach((x) => this.add(x)); this.groups = ids.length; }
  add(x) { if (this.parent[x] === undefined) { this.parent[x] = x; this.size[x] = 1; } }
  find(x) { while (this.parent[x] !== x) { this.parent[x] = this.parent[this.parent[x]]; x = this.parent[x]; } return x; }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return { merged: false, ra, rb };
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.groups--;
    return { merged: true, ra, rb };
  }
}

const forestOf = (uf, ids, label, x = {}) => ({ ids, label, parent: { ...uf.parent }, size: { ...uf.size }, ...x });

// ---------------------------------------------------------------- brute forces

const components = (ids, edges) => {
  const adj = Object.fromEntries(ids.map((x) => [x, []]));
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const comp = {};
  let k = 0;
  for (const s of ids) {
    if (comp[s] !== undefined) continue;
    const st = [s];
    comp[s] = k;
    while (st.length) for (const v of adj[st.pop()]) if (comp[v] === undefined) { comp[v] = k; st.push(v); }
    k++;
  }
  return { comp, count: k };
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const primesOf = (x) => { const ps = []; for (let p = 2; p * p <= x; p++) if (x % p === 0) { ps.push(p); while (x % p === 0) x /= p; } if (x > 1) ps.push(x); return ps; };
const range = (n) => Array.from({ length: n }, (_, i) => i);

function kruskal(n, edges, { skip = -1, force = -1 } = {}) {
  const uf = new UF(range(n));
  let w = 0;
  const used = [];
  if (force >= 0) { uf.union(edges[force][0], edges[force][1]); w += edges[force][2]; used.push(force); }
  const order = range(edges.length).sort((a, b) => edges[a][2] - edges[b][2] || a - b);
  for (const i of order) if (i !== skip && i !== force && uf.union(edges[i][0], edges[i][1]).merged) { w += edges[i][2]; used.push(i); }
  return { w: uf.groups === 1 ? w : Infinity, used };
}

export function ufWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'path') return components(range(input.n), input.edges).comp[input.source] === components(range(input.n), input.edges).comp[input.dest];
  if (mode === 'components') return components(range(input.n), input.edges).count;
  if (mode === 'tree') return input.edges.length === input.n - 1 && components(range(input.n), input.edges).count === 1;
  if (mode === 'equations') {
    const letters = [...new Set(input.eqs.flatMap((e) => [e[0], e[3]]))];
    const { comp } = components(letters, input.eqs.filter((e) => e[1] === '=').map((e) => [e[0], e[3]]));
    return input.eqs.every((e) => e[1] === '=' || comp[e[0]] !== comp[e[3]]);
  }
  if (mode === 'swaps') {
    const { comp, count } = components(range(input.s.length), input.pairs);
    const out = [...input.s];
    for (let k = 0; k < count; k++) {
      const idx = range(input.s.length).filter((i) => comp[i] === k);
      const ch = idx.map((i) => input.s[i]).sort();
      idx.forEach((i, j) => { out[i] = ch[j]; });
    }
    return out.join('');
  }
  if (mode === 'accounts') {
    const emails = [...new Set(input.accounts.flatMap((a) => a.slice(1)))];
    const edges = input.accounts.flatMap((a) => a.slice(2).map((e) => [a[1], e]));
    const { comp, count } = components(emails, edges);
    const name = Object.fromEntries(input.accounts.flatMap((a) => a.slice(1).map((e) => [e, a[0]])));
    return range(count).map((k) => { const es = emails.filter((e) => comp[e] === k).sort(); return [name[es[0]], ...es]; }).sort((a, b) => (a.join() < b.join() ? -1 : 1));
  }
  if (mode === 'mincost') {
    const p = input.points;
    const n = p.length;
    const d = (i, j) => Math.abs(p[i][0] - p[j][0]) + Math.abs(p[i][1] - p[j][1]);
    const inT = Array(n).fill(false);
    const best = Array(n).fill(Infinity);
    best[0] = 0;
    let total = 0;
    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!inT[i] && (u < 0 || best[i] < best[u])) u = i;
      inT[u] = true; total += best[u];
      for (let i = 0; i < n; i++) if (!inT[i]) best[i] = Math.min(best[i], d(u, i));
    }
    return total;
  }
  if (mode === 'slashes') {
    const g = input.grid;
    const n = g.length;
    const uf = new UF(range(4 * n * n));
    const id = (r, c, t) => 4 * (r * n + c) + t;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const ch = g[r][c];
      if (ch === ' ') { uf.union(id(r, c, 0), id(r, c, 1)); uf.union(id(r, c, 1), id(r, c, 2)); uf.union(id(r, c, 2), id(r, c, 3)); }
      if (ch === '/') { uf.union(id(r, c, 0), id(r, c, 3)); uf.union(id(r, c, 1), id(r, c, 2)); }
      if (ch === '\\') { uf.union(id(r, c, 0), id(r, c, 1)); uf.union(id(r, c, 2), id(r, c, 3)); }
      if (r + 1 < n) uf.union(id(r, c, 2), id(r + 1, c, 0));
      if (c + 1 < n) uf.union(id(r, c, 1), id(r, c + 1, 3));
    }
    return uf.groups;
  }
  if (mode === 'factor' || mode === 'gcd') {
    const ns = input.nums;
    const edges = [];
    ns.forEach((a, i) => ns.forEach((b, j) => { if (i < j && gcd(a, b) > 1) edges.push([i, j]); }));
    const { comp, count } = components(range(ns.length), edges);
    if (mode === 'gcd') return count === 1;
    return Math.max(...range(count).map((k) => ns.filter((_, i) => comp[i] === k).length));
  }
  // critical: enumerate spanning trees (the inputs are small)
  const { n, edges } = input;
  const E = edges.length;
  let best = Infinity;
  const msts = [];
  const pick = (start, chosen) => {
    if (chosen.length === n - 1) {
      const uf = new UF(range(n));
      if (!chosen.every((i) => uf.union(edges[i][0], edges[i][1]).merged)) return;
      const w = chosen.reduce((s, i) => s + edges[i][2], 0);
      if (w < best) { best = w; msts.length = 0; }
      if (w === best) msts.push(new Set(chosen));
      return;
    }
    for (let i = start; i < E; i++) pick(i + 1, [...chosen, i]);
  };
  pick(0, []);
  const crit = range(E).filter((i) => msts.every((m) => m.has(i)));
  const pseudo = range(E).filter((i) => !crit.includes(i) && msts.some((m) => m.has(i)));
  return [crit, pseudo];
}

// ---------------------------------------------------------------- graph edges unioned one by one: path, components, tree

function edgeRuns({ mode, n, edges, source, dest }) {
  const ids = range(n);
  const label = Object.fromEntries(ids.map((i) => [i, String(i)]));
  const uf = new UF(ids);
  const steps = [];
  const snap = (x) => steps.push({
    forest: forestOf(uf, ids, label, { hot: x.hot ?? [], bad: x.bad ?? [], good: x.good ?? [], tag: mode === 'path' ? { [source]: 'source', [dest]: dest === source ? 'source' : 'dest' } : {} }),
    rows: [{ label: 'edges', chips: edges.map(([a, b], k) => ({ text: `${a}–${b}`, tone: k === x.k ? 'accent' : k < (x.k ?? -1) || x.all ? 'muted' : undefined })) }],
    groups: uf.groups, ...x,
  });
  const intro = {
    path: `Union the two ends of every edge. Afterwards nodes in one connected piece share a root, so the question becomes: is find(${source}) == find(${dest})?`,
    components: 'Start with every node as its own component: n of them. Each edge that joins two different trees merges them, one component fewer. An edge inside one tree changes nothing.',
    tree: 'A tree on n nodes has exactly n − 1 edges and no cycle. With n − 1 edges and no cycle, it is automatically connected. Union-find detects the cycle: an edge whose ends already share a root closes one.',
  }[mode];
  snap({ kind: 'start', lines: mode === 'components' ? ['init'] : [], title: { path: `Is there a path from ${source} to ${dest}?`, components: `${n} nodes: how many pieces?`, tree: `${n} nodes, ${plural(edges.length, 'edge')}: a tree?` }[mode], text: intro, calc: [`groups = ${n}`] });
  if (mode === 'path' && source === dest) {
    snap({ kind: 'done', lines: ['same'], answer: 'true', good: [source], title: 'Source is the destination: true', text: 'A node always has a path to itself: no edges needed.', calc: ['return true'] });
    return steps;
  }
  if (mode === 'tree' && edges.length !== n - 1) {
    snap({ kind: 'fail', lines: ['count'], answer: 'false', title: `${edges.length} edges, a tree needs ${n - 1}: false`, text: edges.length < n - 1 ? `With fewer than n − 1 edges some node is cut off: not connected.` : `With more than n − 1 edges there must be a cycle.`, calc: [`${edges.length} ≠ ${n - 1}`] });
    return steps;
  }
  for (let k = 0; k < edges.length; k++) {
    const [a, b] = edges[k];
    const r = uf.union(a, b);
    if (!r.merged) {
      if (mode === 'tree') {
        snap({ kind: 'fail', k, bad: [a, b], lines: ['union', 'cycle'], answer: 'false', title: `${a}–${b} closes a cycle: false`, text: `${a} and ${b} already share root ${r.ra}: they are connected through earlier edges, so this edge makes a second path between them, a cycle. (With n − 1 edges and a cycle, some node must also be cut off.)`, calc: [`find(${a}) = find(${b}) = ${r.ra}`] });
        return steps;
      }
      snap({ kind: 'same', k, bad: [a, b], lines: ['union'], title: `${a}–${b}: already together`, text: `${a} and ${b} both have root ${r.ra}. This edge adds no new connection${mode === 'components' ? ', so the count stays' : ''}.`, calc: [`find(${a}) = find(${b}) = ${r.ra}`, `groups = ${uf.groups}`] });
    } else {
      snap({ kind: 'union', k, hot: [a, b, r.rb], lines: mode === 'components' ? ['union', 'dec'] : ['union'], title: `${a}–${b}: ${r.rb} goes under ${r.ra}`, text: `Different roots, so this edge joins two pieces. The smaller tree's root ${r.rb} now points at ${r.ra}.${mode === 'components' ? ` Components: ${uf.groups}.` : ''}`, calc: [`parent[${r.rb}] = ${r.ra}`, `groups = ${uf.groups}`] });
    }
  }
  if (mode === 'path') {
    const rs = uf.find(source), rd = uf.find(dest);
    snap({ kind: 'done', all: true, good: rs === rd ? [source, dest] : [], bad: rs === rd ? [] : [source, dest], lines: ['ask'], answer: String(rs === rd), title: rs === rd ? `Same root ${rs}: true` : `Roots ${rs} and ${rd}: false`, text: rs === rd ? `${source} and ${dest} ended up in one tree, so some chain of edges links them.` : `${source} and ${dest} are in different trees: no edge ever joined their pieces.`, calc: [`find(${source}) = ${rs}`, `find(${dest}) = ${rd}`] });
  } else if (mode === 'components') {
    snap({ kind: 'done', all: true, lines: [], answer: String(uf.groups), title: `${plural(uf.groups, 'component')}`, text: `Every edge was processed once with nearly O(1) union-find work: O(n + e·α(n)). The count is the number of roots left.`, calc: [`return ${uf.groups}`] });
  } else {
    snap({ kind: 'done', all: true, good: ids, lines: ['ok'], answer: 'true', title: 'n − 1 edges, no cycle: a valid tree', text: `Every edge joined two separate pieces, so n − 1 edges took ${n} pieces down to 1: connected, and no cycle.`, calc: ['return true'] });
  }
  return steps;
}

// ---------------------------------------------------------------- equations

function equations({ eqs }) {
  const letters = [...new Set(eqs.flatMap((e) => [e[0], e[3]]))].sort();
  const label = Object.fromEntries(letters.map((c) => [c, c]));
  const uf = new UF(letters);
  const steps = [];
  const snap = (x) => steps.push({
    forest: forestOf(uf, letters, label, { hot: x.hot ?? [], bad: x.bad ?? [], good: x.good ?? [] }),
    rows: [{ label: 'equations', chips: eqs.map((e, k) => ({ text: e, tone: k === x.k ? (x.kind === 'fail' ? 'danger' : 'accent') : undefined })) }],
    ...x,
  });
  snap({ kind: 'start', lines: [], title: 'Can every equation hold?', text: 'Letters joined by == must get the same value, so they form groups. A != is only a problem if its two letters end up in the same group. Order matters: do all the == first (a later one can merge groups), then check every !=.', calc: [`${letters.length} letters`] });
  eqs.forEach((e, k) => {
    if (e[1] !== '=') return;
    const r = uf.union(e[0], e[3]);
    snap({ kind: r.merged ? 'union' : 'same', k, hot: [e[0], e[3]], lines: ['eq', 'union'], title: r.merged ? `${e}: join ${e[0]} and ${e[3]}` : `${e}: already together`, text: r.merged ? `${e[0]} and ${e[3]} must be equal, so their groups merge: ${r.rb} goes under ${r.ra}.` : `${e[0]} and ${e[3]} are already in one group through other equalities.`, calc: [`find(${e[0]}) = find(${e[3]}) = ${uf.find(e[0])}`] });
  });
  for (let k = 0; k < eqs.length; k++) {
    const e = eqs[k];
    if (e[1] === '=') continue;
    const ra = uf.find(e[0]), rb = uf.find(e[3]);
    if (ra === rb) {
      snap({ kind: 'fail', k, bad: [e[0], e[3]], lines: ['ne'], answer: 'false', title: `${e}: but they share root ${ra}`, text: `The equalities forced ${e[0]} and ${e[3]} into one group, so they must be equal; ${e} contradicts that. No assignment works.`, calc: [`find(${e[0]}) = find(${e[3]}) = ${ra}`, 'return false'] });
      return steps;
    }
    snap({ kind: 'check', k, good: [e[0], e[3]], lines: ['ne'], title: `${e}: different groups, fine`, text: `${e[0]} (root ${ra}) and ${e[3]} (root ${rb}) are in different groups, so they can get different values.`, calc: [`${ra} ≠ ${rb}`] });
  }
  snap({ kind: 'done', lines: ['ok'], answer: 'true', title: 'Every equation can hold', text: 'Give each group its own number: every == holds inside groups and every != spans two groups. Two passes over 26 letters: O(n).', calc: ['return true'] });
  return steps;
}

// ---------------------------------------------------------------- smallest string with swaps

function swaps({ s, pairs }) {
  const ids = range(s.length);
  const label = Object.fromEntries(ids.map((i) => [i, String(i)]));
  const uf = new UF(ids);
  const out = [...s];
  const steps = [];
  const done = new Set();
  const snap = (x) => steps.push({
    forest: forestOf(uf, ids, label, { hot: x.hot ?? [], good: x.good ?? [], tag: Object.fromEntries(ids.map((i) => [i, out[i]])) }),
    rows: [
      { label: 'string', chips: out.map((ch, i) => ({ text: ch, note: String(i), tone: x.good?.includes(i) ? 'success' : done.has(i) ? 'muted' : undefined })) },
      { label: 'pairs', chips: pairs.map(([a, b], k) => ({ text: `${a}↔${b}`, tone: k === x.k ? 'accent' : undefined })) },
    ],
    ...x,
  });
  snap({ kind: 'start', lines: [], title: `Rearrange "${s}"`, text: 'Swaps chain: if 0 can swap with 3 and 3 with 2, the letters at 0, 2 and 3 can end up in any order. So indices form groups, and inside a group you may arrange the letters freely. Smallest string: in each group, put the letters in sorted order into the indices in sorted order. (Tags under each index show its letter.)', calc: [`"${s}"`] });
  pairs.forEach(([a, b], k) => {
    const r = uf.union(a, b);
    snap({ kind: r.merged ? 'union' : 'same', k, hot: [a, b], lines: ['union'], title: r.merged ? `${a}↔${b}: join` : `${a}↔${b}: already one group`, text: r.merged ? `Indices ${a} and ${b} can trade letters, so their groups merge.` : `${a} and ${b} could already reach each other through other swaps.`, calc: [`groups = ${uf.groups}`] });
  });
  const groups = {};
  ids.forEach((i) => (groups[uf.find(i)] ??= []).push(i));
  for (const idx of Object.values(groups)) {
    if (idx.length === 1) { done.add(idx[0]); continue; }
    const before = idx.map((i) => out[i]);
    const ch = [...before].sort();
    idx.forEach((i, j) => { out[i] = ch[j]; done.add(i); });
    snap({ kind: 'sort', good: idx, lines: ['group', 'sort'], title: `Group {${idx.join(', ')}}: ${before.join('')} → ${ch.join('')}`, text: `Its letters ${before.join(', ')} sorted are ${ch.join(', ')}; write them into indices ${idx.join(', ')} from left to right, so the smallest letter takes the leftmost index.`, calc: [`"${out.join('')}"`] });
  }
  snap({ kind: 'done', lines: [], answer: out.join(''), title: `Smallest: "${out.join('')}"`, text: 'Groups that never touch each other keep their own letters. O((n + p)·α(n)) for the unions plus sorting each group.', calc: [`return "${out.join('')}"`] });
  return steps;
}

// ---------------------------------------------------------------- accounts merge

function accounts({ accounts: acc }) {
  const ids = range(acc.length);
  const label = Object.fromEntries(ids.map((i) => [i, `A${i}`]));
  const uf = new UF(ids);
  const owner = {};
  const steps = [];
  let merged = [];
  const snap = (x) => steps.push({
    forest: forestOf(uf, ids, label, { hot: x.hot ?? [], tag: Object.fromEntries(ids.map((i) => [i, acc[i][0]])) }),
    rows: [
      ...acc.map((a, i) => ({ label: `A${i} ${a[0]}`, chips: a.slice(1).map((e) => ({ text: e, tone: x.cur === i ? (owner[e] !== undefined && owner[e] !== i ? 'warn' : 'accent') : undefined, note: owner[e] !== undefined && owner[e] !== i ? `A${owner[e]}` : undefined })) })),
      ...merged.map((m) => ({ label: 'merged', chips: m.map((t, k) => ({ text: t, tone: k ? 'success' : undefined })) })),
    ],
    ...x,
  });
  snap({ kind: 'start', lines: ['owner'], title: 'Same email, same person', text: 'Names can repeat across different people, so only shared emails prove two accounts belong together. Remember which account first listed each email; when another account lists it too, union the two accounts. Each final tree is one person.', calc: [`${acc.length} accounts`] });
  acc.forEach((a, i) => {
    const joins = [];
    for (const e of a.slice(1)) {
      if (owner[e] === undefined) { owner[e] = i; continue; }
      const r = uf.union(owner[e], i);
      if (r.merged) joins.push(`${e} (A${owner[e]})`);
    }
    snap({ kind: joins.length ? 'union' : 'own', cur: i, hot: joins.length ? [i] : [], lines: joins.length ? ['owner', 'union'] : ['owner'], title: joins.length ? `A${i} shares ${joins.join(', ')}: merge` : `A${i}: no shared email yet`, text: joins.length ? `A${i} lists an email an earlier account already listed, so they are the same person: union them.` : `None of A${i}'s emails has been seen before: A${i} becomes their first owner.`, calc: [`groups = ${uf.groups}`] });
  });
  const groups = {};
  ids.forEach((i) => (groups[uf.find(i)] ??= []).push(i));
  merged = Object.values(groups).map((g) => [acc[g[0]][0], ...[...new Set(g.flatMap((i) => acc[i].slice(1)))].sort()]);
  snap({ kind: 'done', lines: ['collect'], answer: `${plural(merged.length, 'person', 'people')}`, out: [...merged].sort((a, b) => (a.join() < b.join() ? -1 : 1)), title: `${plural(merged.length, 'person', 'people')}`, text: 'Collect every email under its account\'s root, de-duplicate and sort. The two Johns with no shared email stay apart. O(E log E) for the sorting.', calc: merged.map((m) => `${m[0]}: ${m.length - 1} emails`) });
  return steps;
}

// ---------------------------------------------------------------- min cost to connect all points (Kruskal)

function mincost({ points }) {
  const n = points.length;
  const ids = range(n);
  const d = (i, j) => Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
  const all = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push([i, j, d(i, j)]);
  all.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const uf = new UF(ids);
  const taken = [];
  let total = 0;
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{
      label: 'points on the plane (badge = root)',
      nodes: ids.map((i) => ({ id: i, l: String(i), px: x1 > x0 ? (points[i][0] - x0) / (x1 - x0) : 0.5, py: y1 > y0 ? 1 - (points[i][1] - y0) / (y1 - y0) : 0.5, badge: String(uf.find(i)), c: [x.e && (x.e[0] === i || x.e[1] === i) && 'nodeCur'] })),
      edges: [...taken.map(([a, b, w]) => ({ a, b, l: String(w), tone: 'good' })), ...(x.e && !x.took ? [{ a: x.e[0], b: x.e[1], l: String(x.e[2]), tone: 'bad' }] : [])],
    }],
    rows: [{ label: 'cheapest pairs', chips: all.slice(x.at ?? 0, (x.at ?? 0) + 6).map(([a, b, w], k) => ({ text: `${a}–${b}: ${w}`, tone: k === 0 && x.e ? (x.took ? 'success' : 'danger') : undefined })) }],
    total, ...x,
  });
  snap({ kind: 'start', lines: ['edges'], title: `Connect ${n} points as cheaply as possible`, text: `Every pair of points could be joined, at its Manhattan distance: ${all.length} candidate edges. Kruskal's rule: try them cheapest first, and keep an edge only if it joins two separate pieces. An edge inside one piece would only make a cycle. Union-find answers "separate pieces?" instantly.`, calc: [`${all.length} pairs`] });
  for (let k = 0; k < all.length && taken.length < n - 1; k++) {
    const [a, b, w] = all[k];
    const r = uf.union(a, b);
    if (r.merged) { taken.push(all[k]); total += w; }
    snap({ kind: r.merged ? 'take' : 'skip', e: all[k], took: r.merged, at: k, lines: r.merged ? ['union', 'take'] : ['union'], title: r.merged ? `${a}–${b} (${w}): take it, total ${total}` : `${a}–${b} (${w}): skip, already connected`, text: r.merged ? `${a} and ${b} were in different pieces, and no cheaper edge is left that could join them. ${taken.length === n - 1 ? 'That is n − 1 edges: everything is connected.' : `${plural(n - 1 - taken.length, 'edge')} still needed.`}` : `${a} and ${b} already share a root through cheaper edges, so this edge would close a cycle and add nothing.`, calc: [`total = ${total}`] });
  }
  snap({ kind: 'done', lines: ['stop'], answer: String(total), title: `Minimum cost: ${total}`, text: `n − 1 = ${n - 1} edges connect all points. Sorting all n² pairs costs O(n² log n); Prim's algorithm on this dense graph does it in O(n²) without building the pair list.`, calc: [`return ${total}`] });
  return steps;
}

// ---------------------------------------------------------------- regions cut by slashes (3× pixels)

const TONES = ['isle_accent', 'isle_note', 'isle_interview', 'isle_warn', 'isle_success'];

function slashes({ grid }) {
  const n = grid.length;
  const P = 3 * n;
  const wall = Array.from({ length: P }, () => Array(P).fill(false));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) for (let k = 0; k < 3; k++) {
    if (grid[r][c] === '/') wall[3 * r + k][3 * c + 2 - k] = true;
    if (grid[r][c] === '\\') wall[3 * r + k][3 * c + k] = true;
  }
  const region = wall.map((row) => row.map(() => 0));
  let count = 0;
  const steps = [];
  const snap = (x) => steps.push({ grid: wall.map((row, r) => row.map((w, c) => ({ l: w ? '' : region[r][c] ? String(region[r][c]) : '', c: [w ? 'wall' : region[r][c] ? TONES[(region[r][c] - 1) % TONES.length] : 'open', x.fresh?.has(`${r},${c}`) && 'cellNew'] }))), rows: [{ label: 'grid', chips: grid.map((row) => ({ text: `"${row.replace(/ /g, '·')}"` })) }], ...x });
  snap({ kind: 'start', lines: ['draw'], title: 'Draw the slashes big', text: `Counting regions cut by diagonal lines is awkward on the ${n} × ${n} grid itself. Blow each cell up to 3 × 3 pixels and draw each slash as 3 blocked pixels along its diagonal. Now the regions are ordinary connected areas of free pixels: count them.`, calc: [`${P} × ${P} pixels`] });
  for (let r = 0; r < P; r++) for (let c = 0; c < P; c++) {
    if (wall[r][c] || region[r][c]) continue;
    count++;
    const fresh = new Set();
    const st = [[r, c]];
    region[r][c] = count;
    while (st.length) {
      const [a, b] = st.pop();
      fresh.add(`${a},${b}`);
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dr, y = b + dc; if (x >= 0 && y >= 0 && x < P && y < P && !wall[x][y] && !region[x][y]) { region[x][y] = count; st.push([x, y]); } }
    }
    snap({ kind: 'region', fresh, lines: ['fill'], title: `Region ${count}: ${plural(fresh.size, 'pixel')}`, text: `An unvisited free pixel at (${r}, ${c}) starts region ${count}. The flood fill spreads up, down, left and right, stopping at slash pixels.`, calc: [`regions = ${count}`] });
  }
  snap({ kind: 'done', lines: [], answer: String(count), title: `${plural(count, 'region')}`, text: 'Why 3×? At 2× two touching slashes can leave a diagonal gap that a 4-direction fill can\'t cross, merging regions wrongly. The union-find version splits each cell into 4 triangles instead (top, right, bottom, left), joins them according to the character, joins neighbouring cells\' facing triangles, and counts roots.', calc: [`return ${count}`] });
  return steps;
}

// ---------------------------------------------------------------- numbers joined through primes: largest component, gcd traversal

function primeJoin({ mode, nums }) {
  const idsN = nums.map((_, i) => `n${i}`);
  const primes = [...new Set(nums.flatMap(primesOf))].sort((a, b) => a - b);
  const idsP = primes.map((p) => `p${p}`);
  const ids = [...idsN, ...idsP];
  const label = Object.fromEntries([...idsN.map((id, i) => [id, String(nums[i])]), ...idsP.map((id, k) => [id, `p${primes[k]}`])]);
  const uf = new UF(ids);
  const steps = [];
  const snap = (x) => steps.push({ forest: forestOf(uf, ids, label, { hot: x.hot ?? [], good: x.good ?? [], bad: x.bad ?? [], prime: idsP }), rows: [{ label: mode === 'factor' ? 'nums' : 'nums (index: value)', chips: nums.map((v, i) => ({ text: mode === 'gcd' ? `${i}: ${v}` : String(v), tone: i === x.i ? 'accent' : undefined })) }], ...x });
  snap({
    kind: 'start', lines: [], title: mode === 'factor' ? 'Group numbers that share a factor' : 'Can every index reach every other?',
    text: 'Comparing every pair with gcd costs n² checks. Instead: two numbers share a factor greater than 1 exactly when they share a prime factor. So add a node for every prime, and union each number with each of its prime factors. Numbers sharing a prime meet at that prime\'s tree.',
    calc: [`primes: ${primes.join(', ') || 'none'}`],
  });
  nums.forEach((v, i) => {
    const ps = primesOf(v);
    ps.forEach((p) => uf.union(`n${i}`, `p${p}`));
    snap({ kind: ps.length ? 'union' : 'same', i, hot: [`n${i}`, ...ps.map((p) => `p${p}`)], lines: ps.length ? ['factor', 'union'] : ['factor'], title: ps.length ? `${v} = ${ps.join(' · ')}…: join with ${ps.map((p) => `p${p}`).join(', ')}` : `${v} has no prime factor`, text: ps.length ? `${v} is divisible by ${ps.join(' and ')}. Union it with ${ps.length === 1 ? 'that prime' : 'each of those primes'}: anything else divisible by ${ps.length === 1 ? 'it' : 'one of them'} will join the same tree.` : '1 shares a factor with nothing: it stays alone.', calc: [`groups = ${uf.groups}`] });
  });
  if (mode === 'factor') {
    const cnt = {};
    idsN.forEach((id) => { const r = uf.find(id); cnt[r] = (cnt[r] ?? 0) + 1; });
    const bestRoot = Object.keys(cnt).reduce((a, b) => (cnt[b] > cnt[a] ? b : a));
    const good = idsN.filter((id) => uf.find(id) === bestRoot);
    snap({ kind: 'done', good, lines: ['size'], answer: String(cnt[bestRoot]), title: `Largest component: ${cnt[bestRoot]}`, text: `Count only the numbers (not the prime nodes) under each root. ${good.map((id) => label[id]).join(', ')} share root ${label[bestRoot]}. Factoring each number by trial division costs O(√M): O(n·√M) overall.`, calc: Object.entries(cnt).map(([r, c]) => `root ${label[r]}: ${c}`) });
  } else {
    const roots = new Set(idsN.map((id) => uf.find(id)));
    const ok = roots.size === 1;
    snap({ kind: 'done', good: ok ? idsN : [], bad: ok ? [] : idsN.filter((id) => uf.find(id) !== uf.find(idsN[0])), lines: ['size'], answer: String(ok), title: ok ? 'One root for every index: true' : `${roots.size} separate groups: false`, text: ok ? 'Every index is linked to every other through shared primes, step by step.' : `Indices in different trees share no chain of primes: you can never move between them.${nums.includes(1) && nums.length > 1 ? ' A 1 is always stuck: gcd(1, x) = 1.' : ''}`, calc: [`return ${ok}`] });
  }
  return steps;
}

// ---------------------------------------------------------------- critical and pseudo-critical edges

function critical({ n, edges }) {
  const ids = range(n);
  const E = edges.length;
  const base = kruskal(n, edges);
  const crit = [], pseudo = [];
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'edges labelled with weights (indices in the list below)', nodes: ids.map((i) => ({ id: i, l: String(i) })), edges: edges.map(([a, b, w], k) => ({ a, b, l: `${w}`, tone: k === x.e ? (x.tone ?? 'on') : x.used?.includes(k) ? 'good' : 'faded' })) }],
    rows: [
      { label: 'edges', chips: edges.map(([a, b, w], k) => ({ text: `#${k} ${a}–${b} (${w})`, tone: k === x.e ? 'accent' : crit.includes(k) ? 'danger' : pseudo.includes(k) ? 'warn' : undefined })) },
      { label: 'critical', chips: crit.map((k) => ({ text: `#${k}`, tone: 'danger' })) },
      { label: 'pseudo-critical', chips: pseudo.map((k) => ({ text: `#${k}`, tone: 'warn' })) },
    ],
    ...x,
  });
  snap({ kind: 'start', used: base.used, lines: ['base'], title: `Best spanning tree weight: ${base.w}`, text: `Kruskal (cheapest edges first, skipping any that would close a cycle) builds a minimum spanning tree of weight ${base.w} (green). Now test each edge twice: is the best weight worse without it? If not, can a best tree include it?`, calc: [`best = ${base.w}`] });
  for (let e = 0; e < E; e++) {
    const without = kruskal(n, edges, { skip: e });
    if (without.w > base.w) {
      crit.push(e);
      snap({ kind: 'crit', e, tone: 'bad', used: without.used, lines: ['skip', 'union'], title: `#${e} is critical`, text: `Without edge #${e}, the best tree ${without.w === Infinity ? 'can\'t connect every node' : `weighs ${without.w}, more than ${base.w}`}. Every minimum tree needs it.`, calc: [`without #${e}: ${without.w === Infinity ? 'disconnected' : without.w}`] });
      continue;
    }
    const forced = kruskal(n, edges, { force: e });
    if (forced.w === base.w) {
      pseudo.push(e);
      snap({ kind: 'pseudo', e, tone: 'on', used: forced.used, lines: ['skip', 'force', 'union'], title: `#${e} is pseudo-critical`, text: `Without #${e} the weight stays ${base.w}, so it isn't needed. But a tree that starts with #${e} also weighs ${base.w}: some minimum trees use it.`, calc: [`without: ${without.w}`, `forced: ${forced.w}`] });
    } else {
      snap({ kind: 'neither', e, tone: 'bad', used: forced.used, lines: ['skip', 'force', 'union'], title: `#${e} is in no minimum tree`, text: `Forcing #${e} in raises the weight to ${forced.w}: no minimum tree can use it.`, calc: [`without: ${without.w}`, `forced: ${forced.w}`] });
    }
  }
  snap({ kind: 'done', lines: [], answer: `[${list(crit)}, ${list(pseudo)}]`, out: [crit, pseudo], title: `[${list(crit)}, ${list(pseudo)}]`, text: `Sort the edges once; each test is one Kruskal pass with a fresh union-find: O(E²·α(n)) for all ${E} edges, tiny for E ≤ 200.`, calc: [`critical ${list(crit)}`, `pseudo ${list(pseudo)}`] });
  return steps;
}

// ---------------------------------------------------------------- dispatch, parsing, random

export function ufWalk(input) {
  const m = input.mode;
  if (m === 'path' || m === 'components' || m === 'tree') return edgeRuns(input);
  if (m === 'factor' || m === 'gcd') return primeJoin(input);
  return { equations, swaps, accounts, mincost, slashes, critical }[m](input);
}

const edgeList = (text, n) => {
  const out = [];
  for (const p of String(text ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (!m) return { error: `"${p}" should look like 0-1.` };
    const a = Number(m[1]), b = Number(m[2]);
    if (a >= n || b >= n || a === b) return { error: `Nodes are 0 to ${n - 1}, no self-loops.` };
    out.push([a, b]);
  }
  return { edges: out };
};

export function parseUfWalk(values, input) {
  const { mode } = input;
  if (mode === 'path' || mode === 'components' || mode === 'tree') {
    const n = Number(values.n);
    if (!Number.isInteger(n) || n < 1 || n > 8) return { error: 'n must be 1 to 8.' };
    const e = edgeList(values.edges, n); if (e.error) return e;
    if (e.edges.length > 10) return { error: 'Use at most 10 edges.' };
    if (mode !== 'path') return { input: { mode, n, edges: e.edges } };
    const source = Number(values.source), dest = Number(values.dest);
    if (![source, dest].every((v) => Number.isInteger(v) && v >= 0 && v < n)) return { error: 'source and destination must be nodes.' };
    return { input: { mode, n, edges: e.edges, source, dest } };
  }
  if (mode === 'equations') {
    const eqs = String(values.eqs ?? '').split(/[\s,;]+/).filter(Boolean);
    if (!eqs.length || eqs.length > 8 || eqs.some((e) => !/^[a-z](==|!=)[a-z]$/.test(e))) return { error: 'Equations like a==b or b!=c, up to 8.' };
    if (new Set(eqs.flatMap((e) => [e[0], e[3]])).size > 7) return { error: 'Use at most 7 letters.' };
    return { input: { mode, eqs } };
  }
  if (mode === 'swaps') {
    const s = String(values.s ?? '').trim();
    if (!/^[a-z]{1,8}$/.test(s)) return { error: 's: 1 to 8 lowercase letters.' };
    const e = edgeList(values.pairs, s.length); if (e.error) return e;
    return { input: { mode, s, pairs: e.edges.slice(0, 8) } };
  }
  if (mode === 'accounts') {
    const acc = String(values.accounts ?? '').split(';').map((r) => r.split(/[\s,]+/).filter(Boolean)).filter((r) => r.length);
    if (!acc.length || acc.length > 6 || acc.some((a) => a.length < 2 || a.length > 4)) return { error: 'Up to 6 accounts: name then 1 to 3 emails, separated by ;' };
    return { input: { mode, accounts: acc } };
  }
  if (mode === 'mincost') {
    const pts = String(values.points ?? '').split(/;/).map((p) => p.split(/[\s,]+/).filter(Boolean).map(Number)).filter((p) => p.length);
    if (pts.length < 1 || pts.length > 7 || pts.some((p) => p.length !== 2 || p.some((v) => !Number.isInteger(v) || Math.abs(v) > 99))) return { error: 'Up to 7 points like 0,0; 2,2 (values −99 to 99).' };
    if (new Set(pts.map((p) => p.join())).size !== pts.length) return { error: 'Points must be distinct.' };
    return { input: { mode, points: pts } };
  }
  if (mode === 'slashes') {
    const rows = String(values.grid ?? '').split(/;/).map((r) => r.trim().replace(/\./g, ' ').replace(/b/g, '\\'));
    const n = rows.length;
    if (n < 1 || n > 4 || rows.some((r) => r.length !== n || /[^ /\\]/.test(r))) return { error: 'n rows of n characters (n ≤ 4): / or \\ (or b), . for a space.' };
    return { input: { mode, grid: rows } };
  }
  if (mode === 'factor' || mode === 'gcd') {
    const nums = String(values.nums ?? '').split(/[\s,]+/).filter(Boolean).map(Number);
    if (!nums.length || nums.length > 7 || nums.some((v) => !Number.isInteger(v) || v < 1 || v > 999)) return { error: 'Up to 7 numbers from 1 to 999.' };
    if (mode === 'factor' && new Set(nums).size !== nums.length) return { error: 'The values must be distinct.' };
    if (new Set(nums.flatMap(primesOf)).size > 6) return { error: 'Use numbers with at most 6 different primes in total.' };
    return { input: { mode, nums } };
  }
  const n = Number(values.n);
  if (!Number.isInteger(n) || n < 2 || n > 6) return { error: 'n must be 2 to 6.' };
  const edges = [];
  for (const p of String(values.edges ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const m = p.match(/^(\d+)\s*[-–]\s*(\d+)\s*[:=]\s*(\d+)$/);
    if (!m || Number(m[1]) >= n || Number(m[2]) >= n || m[1] === m[2]) return { error: `"${p}" should look like 0-1:3 (nodes 0 to ${n - 1}).` };
    edges.push([Number(m[1]), Number(m[2]), Number(m[3])]);
  }
  if (edges.length < n - 1 || edges.length > 9 || kruskal(n, edges).w === Infinity) return { error: 'The graph must be connected, with at most 9 edges.' };
  return { input: { mode: 'critical', n, edges } };
}

export function randomUfWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const randEdges = (n, k) => { const e = []; for (let t = 0; t < k; t++) { const a = g.int(0, n - 1), b = g.int(0, n - 1); if (a !== b && !e.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) e.push([a, b]); } return e; };
  if (mode === 'path') { const n = g.int(2, 8); return { mode, n, edges: randEdges(n, g.int(0, n)), source: g.int(0, n - 1), dest: g.int(0, n - 1) }; }
  if (mode === 'components') { const n = g.int(1, 8); return { mode, n, edges: randEdges(n, g.int(0, n)) }; }
  if (mode === 'tree') {
    const n = g.int(1, 7);
    const e = range(n).slice(1).map((v) => [g.int(0, v - 1), v]);
    if (g.bool(0.4) && n > 2) { e.pop(); const extra = randEdges(n, 3).find(([a, b]) => !e.some(([x, y]) => (x === a && y === b) || (x === b && y === a))); if (extra) e.push(extra); }
    return { mode, n, edges: g.shuffle(e) };
  }
  if (mode === 'equations') {
    const L = ['a', 'b', 'c', 'd', 'e'].slice(0, g.int(2, 5));
    return { mode, eqs: Array.from({ length: g.int(1, 6) }, () => `${g.pick(L)}${g.bool(0.65) ? '==' : '!='}${g.pick(L)}`) };
  }
  if (mode === 'swaps') { const len = g.int(1, 8); return { mode, s: Array.from({ length: len }, () => g.pick(['a', 'b', 'c', 'd', 'e'])).join(''), pairs: randEdges(len, g.int(0, len)) }; }
  if (mode === 'accounts') {
    const pool = { Ann: ['a@x', 'b@x', 'c@x'], Bob: ['d@x', 'e@x', 'f@x'] };   // an email belongs to one person
    return { mode, accounts: Array.from({ length: g.int(1, 5) }, () => { const nm = g.pick(['Ann', 'Bob']); return [nm, ...new Set(Array.from({ length: g.int(1, 3) }, () => g.pick(pool[nm])))]; }) };
  }
  if (mode === 'mincost') {
    const pts = [];
    while (pts.length < g.int(1, 6)) { const p = [g.int(-5, 10), g.int(-5, 10)]; if (!pts.some((q) => q[0] === p[0] && q[1] === p[1])) pts.push(p); else break; }
    return { mode, points: pts.length ? pts : [[0, 0]] };
  }
  if (mode === 'slashes') { const n = g.int(1, 4); return { mode, grid: Array.from({ length: n }, () => Array.from({ length: n }, () => g.pick([' ', '/', '\\'])).join('')) }; }
  if (mode === 'factor' || mode === 'gcd') {
    const pool = [2, 3, 4, 5, 6, 7, 9, 10, 12, 14, 15, 21, 35, 1];
    const nums = g.shuffle(pool).slice(0, g.int(1, 6));
    return { mode, nums: mode === 'factor' ? nums : nums };
  }
  const n = g.int(2, 5);
  const edges = range(n).slice(1).map((v) => [g.int(0, v - 1), v, g.int(1, 4)]);
  for (let t = 0; t < g.int(0, 4); t++) { const a = g.int(0, n - 1), b = g.int(0, n - 1); if (a !== b && !edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) edges.push([a, b, g.int(1, 4)]); }
  return { mode, n, edges };
}
