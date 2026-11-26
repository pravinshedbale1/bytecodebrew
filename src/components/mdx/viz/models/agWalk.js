/**
 * Advanced graph problems (model for <AgWalkViz>, drawn by the GraphWalkViz stage): two-colouring,
 * bridges with low-link, and Euler paths. Pure, so scripts/viz-check.mjs can test every mode.
 */
import { list, plural, rng } from './util.js';

export const AG_WALK = {
  bipartite: { label: 'Is it bipartite?', input: { mode: 'color', n: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]], base: 0 } },
  bipartiteYes: { label: 'An even cycle', input: { mode: 'color', n: 4, edges: [[0, 1], [0, 3], [1, 2], [2, 3]], base: 0 } },
  dislikes: { label: 'Possible bipartition', input: { mode: 'color', n: 4, edges: [[1, 2], [1, 3], [2, 4]], base: 1 } },
  dislikesNo: { label: 'Three who all dislike each other', input: { mode: 'color', n: 3, edges: [[1, 2], [1, 3], [2, 3]], base: 1 } },
  bridges: { label: 'Critical connections', input: { mode: 'bridges', n: 4, edges: [[0, 1], [1, 2], [2, 0], [1, 3]] } },
  bridgesMore: { label: 'Two cycles and a chain', input: { mode: 'bridges', n: 7, edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [5, 6]] } },
  euler: { label: 'Valid arrangement', input: { mode: 'euler', pairs: [[5, 1], [4, 5], [11, 9], [9, 4]] } },
  eulerLoop: { label: 'A dead end first', input: { mode: 'euler', pairs: [[1, 5], [1, 2], [2, 1], [1, 3], [3, 1]] } },
};

export const agWalkCode = (mode) => ({
  color: [
    ['start', 'for each uncoloured node s: colour[s] = 0; queue = [s]'],
    ['pop', '  u = queue.poll();  for each neighbour v:'],
    ['paint', '    uncoloured → colour[v] = 1 − colour[u], enqueue'],
    ['clash', '    same colour as u → return false   // an odd cycle'],
    ['ok', 'return true'],
  ],
  bridges: [
    ['visit', 'dfs(u, parent): disc[u] = low[u] = ++time'],
    ['back', '  neighbour v already visited (not parent): low[u] = min(low[u], disc[v])   // back edge'],
    ['child', '  unvisited v: dfs(v, u); low[u] = min(low[u], low[v])'],
    ['bridge', '    if (low[v] > disc[u]) → u–v is a bridge'],
  ],
  euler: [
    ['start', 'start = node with out − in = 1 (else any node with an edge)'],
    ['go', 'while (stack) { u = stack.top; if (u has an unused edge) push its end;'],
    ['stuck', '  else path.addFirst(stack.pop()); }'],
    ['pairs', 'consecutive nodes of the path are the pairs, in order'],
  ],
})[mode];

// ---------------------------------------------------------------- brute forces and validity

export function agWalkAnswer(input) {
  if (input.mode === 'color') {
    const { n, edges, base } = input;
    for (let mask = 0; mask < 1 << n; mask++) if (edges.every(([a, b]) => ((mask >> (a - base)) & 1) !== ((mask >> (b - base)) & 1))) return true;
    return false;
  }
  if (input.mode === 'bridges') {
    const { n, edges } = input;
    return edges.filter((_, k) => {
      const rest = edges.filter((__, j) => j !== k);
      const seen = new Set([0]); const st = [0];
      while (st.length) { const u = st.pop(); for (const [a, b] of rest) { const v = a === u ? b : b === u ? a : -1; if (v >= 0 && !seen.has(v)) { seen.add(v); st.push(v); } } }
      return seen.size < n;
    }).map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  }
  return null;
}

export function agWalkValid(input, got) {
  if (got.length !== input.pairs.length) return false;
  for (let i = 1; i < got.length; i++) if (got[i - 1][1] !== got[i][0]) return false;
  const want = input.pairs.map((p) => p.join()).sort();
  return got.map((p) => p.join()).sort().every((p, i) => p === want[i]);
}

// ---------------------------------------------------------------- two-colouring

function color({ n, edges, base }) {
  const ids = Array.from({ length: n }, (_, i) => i + base);
  const adj = Object.fromEntries(ids.map((i) => [i, []]));
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const col = {};
  let queue = [];
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: base ? 'people (an edge = a dislike)' : 'the graph', nodes: ids.map((i) => ({ id: i, l: String(i), badge: col[i] === undefined ? undefined : col[i] ? 'B' : 'A', c: [col[i] !== undefined && `prov_${col[i]}`, x.cur === i && 'nodeCur', x.bad?.includes(i) && 'nodeBad'] })), edges: edges.map(([a, b]) => ({ a, b, tone: x.bad?.includes(a) && x.bad?.includes(b) ? 'bad' : col[a] !== undefined && col[b] !== undefined ? 'on' : 'plain' })) }],
    rows: [{ label: 'queue', chips: queue.map((u) => ({ text: String(u) })) }, { label: 'group A', chips: ids.filter((i) => col[i] === 0).map((i) => ({ text: String(i) })) }, { label: 'group B', chips: ids.filter((i) => col[i] === 1).map((i) => ({ text: String(i) })) }],
    ...x,
  });
  snap({ kind: 'start', lines: [], title: base ? 'Split everyone into two groups' : 'Can the nodes split into two sides?', text: `${base ? 'Each dislike is an edge: its two people must be on different sides.' : 'Every edge must join side A to side B.'} Pick a node and put it in A. Then there is no choice left: its neighbours must be in B, their neighbours in A, and so on. Spread the colours with BFS; the only way to fail is an edge whose two ends got the same colour.`, calc: [`${n} nodes, ${edges.length} edges`] });
  for (const s of ids) {
    if (col[s] !== undefined) continue;
    col[s] = 0;
    queue = [s];
    snap({ kind: 'seed', cur: s, lines: ['start'], title: `${s} starts a new part: group A`, text: `${s} isn't connected to anything coloured so far${s === ids[0] ? '' : ' (a separate part of the graph)'}, so either side is fine. Put it in A.`, calc: [`colour[${s}] = A`] });
    while (queue.length) {
      const u = queue.shift();
      const painted = [];
      for (const v of adj[u]) {
        if (col[v] === undefined) { col[v] = 1 - col[u]; queue.push(v); painted.push(v); continue; }
        if (col[v] === col[u]) {
          snap({ kind: 'clash', cur: u, bad: [u, v], lines: ['pop', 'clash'], answer: 'false', title: `${u}–${v}: both in ${col[u] ? 'B' : 'A'}: false`, text: `${u} and ${v} were each forced into ${col[u] ? 'B' : 'A'} by their own neighbours, but they share an edge. Following the colours around gives a cycle of odd length, and an odd cycle can never alternate A, B, A, B and close up.`, calc: [`colour[${u}] = colour[${v}]`, 'return false'] });
          return steps;
        }
      }
      snap({ kind: 'paint', cur: u, lines: ['pop', 'paint'], title: painted.length ? `${u} (${col[u] ? 'B' : 'A'}): ${painted.join(', ')} → ${col[u] ? 'A' : 'B'}` : `${u}: neighbours already fine`, text: painted.length ? `Every neighbour of ${u} must be on the other side: ${painted.join(', ')} go to ${col[u] ? 'A' : 'B'}.${adj[u].length > painted.length ? ' Its already-coloured neighbours are on the other side, as they should be.' : ''}` : `All of ${u}'s neighbours already have the opposite colour.`, calc: [`queue: ${list(queue)}`] });
    }
  }
  snap({ kind: 'done', lines: ['ok'], answer: 'true', title: 'Every edge crosses: true', text: `Groups: A = {${ids.filter((i) => col[i] === 0).join(', ')}}, B = {${ids.filter((i) => col[i] === 1).join(', ')}}. Each node and edge was looked at once: O(V + E).`, calc: ['return true'] });
  return steps;
}

// ---------------------------------------------------------------- bridges (Tarjan low-link)

function bridges({ n, edges }) {
  const ids = Array.from({ length: n }, (_, i) => i);
  const adj = ids.map(() => []);
  edges.forEach(([a, b], k) => { adj[a].push([b, k]); adj[b].push([a, k]); });
  const disc = {}, low = {};
  const tree = new Set(), back = new Set(), found = [];
  let time = 0;
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'badge = disc / low', nodes: ids.map((i) => ({ id: i, l: String(i), badge: disc[i] === undefined ? undefined : `${disc[i]}/${low[i]}`, c: [disc[i] !== undefined && 'nodeDone', x.cur === i && 'nodeCur'] })), edges: edges.map(([a, b], k) => ({ a, b, tone: found.some((f) => f.k === k) ? 'bad' : k === x.k ? 'good' : tree.has(k) ? 'on' : back.has(k) ? 'faded' : 'plain' })) }],
    rows: [{ label: 'bridges', chips: found.map((f) => ({ text: `${f.a}–${f.b}`, tone: 'danger' })) }],
    ...x,
  });
  snap({ kind: 'start', lines: [], title: 'Which connections are on no cycle?', text: 'An edge is critical exactly when no cycle passes through it: a cycle would give a second way around. One DFS finds them all. disc[u] = when u was first reached; low[u] = the earliest disc reachable from u\'s subtree using one back edge. If nothing below v can climb back above u, the edge u–v is the only way in: a bridge.', calc: ['time = 0'] });
  const dfs = (u, pe) => {
    disc[u] = low[u] = ++time;
    snap({ kind: 'visit', cur: u, lines: ['visit'], title: `Reach ${u}: disc = low = ${time}`, text: `${u} is reached at time ${time}. For now the earliest node it knows how to get back to is itself.`, calc: [`disc[${u}] = ${time}`] });
    for (const [v, k] of adj[u]) {
      if (k === pe) continue;
      if (disc[v] !== undefined) {
        if (disc[v] < disc[u] && !back.has(k)) {
          back.add(k);
          const before = low[u];
          low[u] = Math.min(low[u], disc[v]);
          snap({ kind: 'back', cur: u, k, lines: ['back'], title: `Back edge ${u}–${v}: low[${u}] = ${low[u]}`, text: `${v} was reached earlier (disc ${disc[v]}), so ${u}–${v} closes a cycle back up the DFS path. ${low[u] < before ? `${u} can now climb back to time ${low[u]}.` : 'It doesn\'t climb any higher than ' + u + ' already could.'}`, calc: [`low[${u}] = min(${before}, ${disc[v]}) = ${low[u]}`] });
        }
        continue;
      }
      tree.add(k);
      dfs(v, k);
      const before = low[u];
      low[u] = Math.min(low[u], low[v]);
      const isBridge = low[v] > disc[u];
      if (isBridge) found.push({ a: u, b: v, k });
      snap({ kind: isBridge ? 'bridge' : 'child', cur: u, k, lines: isBridge ? ['child', 'bridge'] : ['child'], title: isBridge ? `${u}–${v} is a bridge (low[${v}] = ${low[v]} > disc[${u}] = ${disc[u]})` : `Back from ${v}: low[${u}] = ${low[u]}`, text: isBridge ? `Nothing in ${v}'s subtree can reach ${u} or anything above it without this edge. Remove it and that subtree is cut off.` : `${v}'s subtree can climb back to time ${low[v]} ≤ disc[${u}] = ${disc[u]}, so a cycle covers ${u}–${v}: not a bridge.${low[u] < before ? ` ${u} inherits low ${low[u]}.` : ''}`, calc: [`low[${v}] = ${low[v]}`, `disc[${u}] = ${disc[u]}`] });
    }
  };
  dfs(0, -1);
  const ans = found.map((f) => [Math.min(f.a, f.b), Math.max(f.a, f.b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  snap({ kind: 'done', lines: [], answer: ans.map((e) => `[${e.join(',')}]`).join(' ') || 'none', out: ans, title: ans.length ? `Critical: ${ans.map((e) => `${e[0]}–${e[1]}`).join(', ')}` : 'No critical connections', text: `One DFS, each edge looked at from both ends: O(V + E). Removing edges one at a time and re-checking connectivity would be O(E · (V + E)).`, calc: [`${ans.length} bridge${ans.length === 1 ? '' : 's'}`] });
  return steps;
}

// ---------------------------------------------------------------- Euler path (valid arrangement)

function euler({ pairs }) {
  const nodes = [...new Set(pairs.flat())];
  const out = Object.fromEntries(nodes.map((v) => [v, []]));
  const bal = Object.fromEntries(nodes.map((v) => [v, 0]));
  pairs.forEach(([a, b], k) => { out[a].push([b, k]); bal[a]++; bal[b]--; });
  const start = nodes.find((v) => bal[v] === 1) ?? pairs[0][0];
  const used = new Set();
  const stack = [start];
  const path = [];
  const steps = [];
  const snap = (x) => steps.push({
    graphs: [{ label: 'pairs as arrows (badge = out − in)', nodes: nodes.map((v) => ({ id: v, l: String(v), badge: bal[v] ? (bal[v] > 0 ? `+${bal[v]}` : String(bal[v])) : undefined, c: [v === start && 'nodeRoot', x.cur === v && 'nodeCur', path.includes(v) && 'nodeDone'] })), edges: pairs.map(([a, b], k) => ({ a, b, dir: true, tone: k === x.k ? 'good' : used.has(k) ? 'on' : 'faded' })) }],
    rows: [{ label: 'stack', chips: stack.map((v, i) => ({ text: String(v), tone: i === stack.length - 1 ? 'accent' : undefined })) }, { label: 'path (built from the back)', chips: path.map((v) => ({ text: String(v) })) }],
    ...x,
  });
  snap({ kind: 'start', cur: start, lines: ['start'], title: `Chain every pair: start at ${start}`, text: `Each pair [a, b] is an arrow a → b; a valid arrangement walks every arrow once: an Euler path. It must start where more arrows leave than arrive (out − in = +1)${nodes.some((v) => bal[v] === 1) ? `: that is ${start}` : '; here everything balances, so any node with an arrow works'}. Walk unused arrows until stuck; a stuck node goes to the front of the path, and leftover loops get spliced in on the way back.`, calc: nodes.filter((v) => bal[v]).map((v) => `${v}: ${bal[v] > 0 ? '+' : ''}${bal[v]}`).concat(nodes.some((v) => bal[v]) ? [] : ['all balanced']) });
  while (stack.length) {
    const u = stack.at(-1);
    const next = out[u].find(([, k]) => !used.has(k));
    if (next) {
      used.add(next[1]);
      stack.push(next[0]);
      snap({ kind: 'go', cur: next[0], k: next[1], lines: ['go'], title: `${u} → ${next[0]}`, text: `${u} still has an unused arrow: take it to ${next[0]}.`, calc: [`stack: ${stack.join(' ')}`] });
    } else {
      stack.pop();
      path.unshift(u);
      snap({ kind: 'stuck', cur: u, lines: ['stuck'], title: `${u} is stuck: path = ${path.join(' ')}`, text: `No unused arrow leaves ${u}, so it ends what is left of the walk: put it at the front of the path and back up${stack.length ? ` to ${stack.at(-1)}${out[stack.at(-1)].some(([, k]) => !used.has(k)) ? ', which still has arrows: a loop will be spliced in here' : ''}` : ''}.`, calc: [`path: ${path.join(' ')}`] });
    }
  }
  const arr = path.slice(1).map((v, i) => [path[i], v]);
  snap({ kind: 'done', lines: ['pairs'], answer: arr.map((p) => `[${p.join(',')}]`).join(' '), out: arr, title: `Arrangement: ${arr.map((p) => `[${p.join(',')}]`).join(' ')}`, text: `Read the path in order; each two neighbouring numbers are one pair. Every arrow was used once, each pushed and popped once: O(E).`, calc: [`${arr.length} pairs`] });
  return steps;
}

// ---------------------------------------------------------------- dispatch, parsing, random

export function agWalk(input) {
  return { color, bridges, euler }[input.mode](input);
}

export function parseAgWalk(values, input) {
  if (input.mode === 'euler') {
    const pairs = [];
    for (const p of String(values.pairs ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      const m = p.match(/^(\d+)\s*(?:>|->|→|-)\s*(\d+)$/);
      if (!m || m[1] === m[2]) return { error: `"${p}" should look like 5>1.` };
      pairs.push([Number(m[1]), Number(m[2])]);
    }
    if (!pairs.length || pairs.length > 8 || new Set(pairs.flat()).size > 7) return { error: 'Use 1 to 8 pairs over at most 7 numbers.' };
    const steps = euler({ pairs });
    if (!agWalkValid({ pairs }, steps.at(-1).out)) return { error: 'These pairs can\'t all be chained into one arrangement.' };
    return { input: { mode: 'euler', pairs } };
  }
  const n = Number(values.n);
  const base = input.base ?? 0;
  if (!Number.isInteger(n) || n < 1 || n > 8) return { error: 'n must be 1 to 8.' };
  const edges = [];
  for (const p of String(values.edges ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    const a = m && Number(m[1]), b = m && Number(m[2]);
    if (!m || a === b || a < base || b < base || a >= n + base || b >= n + base) return { error: `"${p}" should look like ${base}-${base + 1}, nodes ${base} to ${n - 1 + base}.` };
    if (edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return { error: 'Each edge once.' };
    edges.push([a, b]);
  }
  if (edges.length > 12) return { error: 'Use at most 12 edges.' };
  if (input.mode === 'bridges') {
    const seen = new Set([0]); const st = [0];
    while (st.length) { const u = st.pop(); for (const [a, b] of edges) { const v = a === u ? b : b === u ? a : -1; if (v >= 0 && !seen.has(v)) { seen.add(v); st.push(v); } } }
    if (seen.size !== n) return { error: 'The network must be connected.' };
  }
  return { input: { mode: input.mode, n, edges, base } };
}

export function randomAgWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'euler') {
    const k = g.int(1, 7);
    const pairs = [];
    let u = g.int(0, 6);
    for (let t = 0; t < k * 3 && pairs.length < k; t++) { const v = g.int(0, 6); if (v !== u && !pairs.some(([a, b]) => a === u && b === v)) { pairs.push([u, v]); u = v; } }
    return { mode, pairs: g.shuffle(pairs.length ? pairs : [[1, 2]]) };
  }
  const n = g.int(2, 7);
  const edges = [];
  if (mode === 'bridges') for (let v = 1; v < n; v++) edges.push([g.int(0, v - 1), v]);
  for (let t = 0; t < g.int(0, n); t++) { const a = g.int(0, n - 1), b = g.int(0, n - 1); if (a !== b && !edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) edges.push([a, b]); }
  const base = input.base ?? 0;
  return { mode, n, edges: edges.map(([a, b]) => [a + base, b + base]), base };
}
