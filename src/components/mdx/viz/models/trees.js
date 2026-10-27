/**
 * Tree step-throughs (models for <TreeDfsViz>, <TreeBfsViz> and <BstViz>). Trees are given in
 * LeetCode's level order ("3, 9, 20, null, null, 15, 7"). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, plural, rng } from './util.js';

// ---------------------------------------------------------------- building trees

/** Level order with nulls → { root, nodes: { id: { id, v, left, right } } } (children are ids or null). */
export function buildTree(arr) {
  const nodes = {};
  if (!arr.length || arr[0] === null) return { root: null, nodes };
  let next = 0;
  const make = (v) => { const id = `n${next++}`; nodes[id] = { id, v, left: null, right: null }; return id; };
  const root = make(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const n = nodes[queue.shift()];
    if (i < arr.length && arr[i] !== null) { n.left = make(arr[i]); queue.push(n.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { n.right = make(arr[i]); queue.push(n.right); }
    i++;
  }
  return { root, nodes };
}

export const cloneTree = (t) => ({ root: t.root, nodes: Object.fromEntries(Object.entries(t.nodes).map(([k, n]) => [k, { ...n }])) });

export function depthOf(t) {
  const d = (id) => (id === null ? 0 : 1 + Math.max(d(t.nodes[id].left), d(t.nodes[id].right)));
  return d(t.root);
}

export function inorder(t) {
  const out = [];
  const go = (id) => { if (id === null) return; go(t.nodes[id].left); out.push(id); go(t.nodes[id].right); };
  go(t.root);
  return out;
}

export function isBst(t) {
  const vals = inorder(t).map((id) => t.nodes[id].v);
  return vals.every((v, k) => k === 0 || v > vals[k - 1]);
}

/** Parse "3, 9, 20, null, null, 15, 7" (also n, #, -, x for null). */
export function parseTreeText(text, { maxNodes = 15, maxDepth = 5 } = {}) {
  const parts = String(text ?? '').replace(/[[\]]/g, ' ').replace(/[−–]/g, '-').split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return { error: 'Type the tree in level order, for example 3, 9, 20, null, null, 15, 7.' };
  const arr = [];
  for (const p of parts) {
    if (/^(null|n|#|x|-)$/i.test(p)) { arr.push(null); continue; }
    if (!/^-?\d+$/.test(p)) return { error: `"${p}" is not a number or null.` };
    const v = Number(p);
    if (v < -99 || v > 99) return { error: 'Keep values between −99 and 99.' };
    arr.push(v);
  }
  while (arr.length && arr.at(-1) === null) arr.pop();
  if (!arr.length) return { error: 'The tree needs a root value.' };
  const t = buildTree(arr);
  const n = Object.keys(t.nodes).length;
  if (n > maxNodes) return { error: `Use at most ${maxNodes} nodes so the tree fits.` };
  if (depthOf(t) > maxDepth) return { error: `Keep the tree at most ${maxDepth} levels deep so it fits.` };
  return { arr };
}

/** A random tree in level order, n nodes, values from the given range. */
export function randomTreeArr(rand = Math.random, { n = 7, lo = 1, hi = 9, bst = false, maxDepth = 4 } = {}) {
  const g = rng(rand);
  for (;;) {
    if (bst) {
      const vals = g.shuffle(Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)).slice(0, n);
      const nodes = {};
      let root = null;
      let id = 0;
      for (const v of vals) {
        const nid = `n${id++}`;
        nodes[nid] = { id: nid, v, left: null, right: null };
        if (root === null) { root = nid; continue; }
        let cur = root;
        for (;;) {
          const side = v < nodes[cur].v ? 'left' : 'right';
          if (nodes[cur][side] === null) { nodes[cur][side] = nid; break; }
          cur = nodes[cur][side];
        }
      }
      const t = { root, nodes };
      if (depthOf(t) <= maxDepth) return toLevelOrder(t);
      continue;
    }
    const arr = [g.int(lo, hi)];
    let slots = 2;
    let placed = 1;
    while (placed < n && slots > 0) {
      if (g.bool(0.75)) { arr.push(g.int(lo, hi)); placed++; slots++; } else arr.push(null);
      slots--;
    }
    while (arr.length && arr.at(-1) === null) arr.pop();
    if (depthOf(buildTree(arr)) <= maxDepth) return arr;
  }
}

export function toLevelOrder(t) {
  const out = [];
  const queue = [t.root];
  while (queue.length) {
    const id = queue.shift();
    if (id === null) { out.push(null); continue; }
    out.push(t.nodes[id].v);
    queue.push(t.nodes[id].left, t.nodes[id].right);
  }
  while (out.length && out.at(-1) === null) out.pop();
  return out;
}

const showTree = (arr) => arr.map((v) => (v === null ? 'null' : v)).join(', ');

// ---------------------------------------------------------------- tree DFS: recursion

export const TREE_DFS = {
  depth: { label: 'Max depth', input: { mode: 'depth', tree: [3, 9, 20, null, null, 15, 7] } },
  pathsum: { label: 'Path sum 22', input: { mode: 'pathsum', tree: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], target: 22 } },
  good: { label: 'Good nodes', input: { mode: 'good', tree: [3, 1, 4, 3, null, 1, 5] } },
  diameter: { label: 'Diameter', input: { mode: 'diameter', tree: [1, 2, 3, 4, 5] } },
  lca: { label: 'LCA of 7 and 4', input: { mode: 'lca', tree: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 7, q: 4 } },
};

export const treeDfsCode = (mode) => ({
  depth: [
    ['base', 'if (n == null) return 0;                         // 1. empty tree'],
    ['call', 'int l = maxDepth(n.left), r = maxDepth(n.right);  // 2. trust the children'],
    ['ret', 'return 1 + max(l, r);                             // 3. combine'],
  ],
  pathsum: [
    ['base', 'if (n == null) return false;'],
    ['leaf', 'if (leaf) return n.val == target;                 // a path must end at a leaf'],
    ['call', 'return has(n.left, target - n.val) || has(n.right, target - n.val);   // pass the rest down'],
  ],
  good: [
    ['base', 'if (n == null) return 0;'],
    ['self', 'int self = n.val >= maxAbove ? 1 : 0;            // nothing above is bigger?'],
    ['call', 'int m = max(maxAbove, n.val);                    // new context for the children'],
    ['ret', 'return self + good(n.left, m) + good(n.right, m);'],
  ],
  diameter: [
    ['base', 'if (n == null) return 0;'],
    ['call', 'int l = depth(n.left), r = depth(n.right);'],
    ['record', 'diameter = max(diameter, l + r);                  // record: the path bending here'],
    ['ret', 'return 1 + max(l, r);                             // return: the deeper side only'],
  ],
  lca: [
    ['found', 'if (n == null || n == p || n == q) return n;      // found one: no need to look below'],
    ['call', 'TreeNode l = lca(n.left), r = lca(n.right);'],
    ['both', 'if (l != null && r != null) return n;            // one on each side: n is the LCA'],
    ['one', 'return l != null ? l : r;                         // pass up whatever was found'],
  ],
})[mode];

export function treeDfsAnswer({ mode, tree, target, p, q }) {
  const t = buildTree(tree);
  const N = t.nodes;
  if (mode === 'depth') return depthOf(t);
  if (mode === 'pathsum') {
    const has = (id, rest) => { if (id === null) return false; const n = N[id]; if (n.left === null && n.right === null) return n.v === rest; return has(n.left, rest - n.v) || has(n.right, rest - n.v); };
    return has(t.root, target);
  }
  if (mode === 'good') {
    const g = (id, m) => (id === null ? 0 : (N[id].v >= m ? 1 : 0) + g(N[id].left, Math.max(m, N[id].v)) + g(N[id].right, Math.max(m, N[id].v)));
    return g(t.root, -Infinity);
  }
  if (mode === 'diameter') {
    let best = 0;
    const d = (id) => { if (id === null) return 0; const l = d(N[id].left), r = d(N[id].right); best = Math.max(best, l + r); return 1 + Math.max(l, r); };
    d(t.root);
    return best;
  }
  const path = (id, v, acc) => { if (id === null) return null; const a = [...acc, id]; if (N[id].v === v) return a; return path(N[id].left, v, a) ?? path(N[id].right, v, a); };
  const a = path(t.root, p, []), b = path(t.root, q, []);
  let k = 0;
  while (k < a.length && k < b.length && a[k] === b[k]) k++;
  return N[a[k - 1]].v;
}

export function treeDfs({ mode, tree, target, p, q }) {
  const t = buildTree(tree);
  const N = t.nodes;
  const status = {};        // id → active | done | skip
  const ret = {};           // id → what the call returned (text)
  const ctx = {};           // id → what was passed down (text)
  const stack = [];         // ids of calls in progress
  let record = null;        // diameter so far
  const steps = [];
  const leaf = (n) => n.left === null && n.right === null;
  const snap = (x) => steps.push({ tree, status: { ...status }, ret: { ...ret }, ctx: { ...ctx }, stack: [...stack], record, ...x });
  const skip = (id) => { if (id === null) return; status[id] = 'skip'; skip(N[id].left); skip(N[id].right); };
  const name = { depth: 'maxDepth', pathsum: 'has', good: 'good', diameter: 'depth', lca: 'lca' }[mode];
  const kids = (n) => [n.left, n.right].filter((x) => x !== null).map((x) => N[x].v);
  snap({
    kind: 'start', cur: null, lines: [],
    title: {
      depth: 'How deep is the tree?',
      pathsum: `Is there a root-to-leaf path that adds up to ${target}?`,
      good: 'How many "good" nodes? (nothing above them is bigger)',
      diameter: 'The longest path between any two nodes',
      lca: `The lowest common ancestor of ${p} and ${q}`,
    }[mode],
    text: {
      depth: 'Each call answers one question: "how deep is the tree below me?" It asks its children the same question, trusts their answers, and adds 1 for itself. Watch calls go down and answers come back up.',
      pathsum: `Information flows down here: each call passes its children the amount still needed (${target} minus the values so far). A leaf checks whether it is exactly what's left.`,
      good: 'Context flows down (the biggest value above each node) and counts flow back up. A node is good if it is at least as big as everything above it.',
      diameter: 'Each call returns its height (so the parent can extend it) and records the longest path that bends at itself (left height + right height), which the parent can\'t extend.',
      lca: `Each call returns ${p} or ${q} if it finds one, or null. The first node that hears back from both sides is where their paths meet.`,
    }[mode],
    calc: [`tree: ${showTree(tree)}`],
  });
  const enter = (id, argText) => { stack.push(id); status[id] = 'active'; if (argText !== undefined) ctx[id] = argText; };
  const leave = (id, value) => { stack.pop(); status[id] = 'done'; ret[id] = value; };

  const depth = (id) => {
    if (id === null) return 0;
    const n = N[id];
    enter(id);
    if (leaf(n)) {
      leave(id, '1');
      snap({ kind: 'return', cur: id, lines: ['base', 'call', 'ret'], title: `${name}(${n.v}) returns 1`, text: `${n.v} is a leaf: both children are null, which return 0. So its depth is 1 + max(0, 0) = 1.`, calc: ['l = 0, r = 0', 'return 1'] });
      return 1;
    }
    snap({ kind: 'call', cur: id, lines: ['call'], title: `${name}(${n.v}): ask the children`, text: `${n.v} isn't null, so it asks ${kids(n).join(' and ')} how deep their subtrees are, and waits.`, calc: [`calls waiting: ${stack.length}`] });
    const l = depth(n.left), r = depth(n.right);
    const v = 1 + Math.max(l, r);
    leave(id, String(v));
    snap({ kind: 'return', cur: id, lines: ['ret'], title: `${name}(${n.v}) returns ${v}`, text: `Left said ${l}, right said ${r}${n.left === null || n.right === null ? ' (null counts as 0)' : ''}. Trusting both, ${n.v}'s subtree is 1 + max(${l}, ${r}) = ${v} deep.`, calc: [`l = ${l}, r = ${r}`, `return 1 + ${Math.max(l, r)} = ${v}`] });
    return v;
  };

  const has = (id, rest) => {
    if (id === null) return false;
    const n = N[id];
    enter(id, `need ${rest}`);
    if (leaf(n)) {
      const ok = n.v === rest;
      leave(id, ok ? 'true' : 'false');
      snap({ kind: ok ? 'found' : 'return', cur: id, lines: ['leaf'], title: `Leaf ${n.v}: needed ${rest} → ${ok}`, text: ok ? `This leaf is exactly the ${rest} still needed: the path from the root to here adds up to ${target}.` : `This leaf is ${n.v}, but ${rest} was still needed, so this path doesn't work. Return false; the caller will try its other side.`, calc: [`${n.v} == ${rest}? ${ok}`] });
      return ok;
    }
    snap({ kind: 'call', cur: id, lines: ['call'], title: `${n.v}: still need ${rest}, pass ${rest - n.v} down`, text: `${n.v} uses ${n.v} of the ${rest} still needed, so its children must find ${rest} − ${n.v} = ${rest - n.v}. It tries the left side first.`, calc: [`${rest} − ${n.v} = ${rest - n.v}`] });
    const l = has(n.left, rest - n.v);
    let r = false;
    if (l) skip(n.right);
    else r = has(n.right, rest - n.v);
    const v = l || r;
    leave(id, String(v));
    snap({ kind: 'return', cur: id, lines: ['call'], title: `${n.v} returns ${v}`, text: l ? `The left side found a path, so ${n.v} returns true straight away: || doesn't even try the right side${n.right !== null ? ' (greyed out)' : ''}.` : v ? `The left side failed but the right side found a path: return true.` : `Neither side found a path that adds up: return false.`, calc: [`${l} || ${l ? '(skipped)' : r} = ${v}`] });
    return v;
  };

  const good = (id, maxAbove) => {
    if (id === null) return 0;
    const n = N[id];
    const show = maxAbove === -Infinity ? '−∞' : maxAbove;
    enter(id, `max ${show}`);
    const self = n.v >= maxAbove ? 1 : 0;
    const m = Math.max(maxAbove, n.v);
    if (leaf(n)) {
      leave(id, String(self));
      snap({ kind: self ? 'found' : 'return', cur: id, lines: ['self', 'ret'], title: `${n.v} ${self ? 'is good' : 'is not good'}: returns ${self}`, text: `The biggest value above ${n.v} is ${show}. ${self ? `${n.v} ≥ ${show}, so nothing above it is bigger: it's good.` : `${show} is bigger, so ${n.v} is not good.`} It's a leaf, so its count is just ${self}.`, calc: [`${n.v} ≥ ${show}? ${self ? 'yes' : 'no'}`, `return ${self}`] });
      return self;
    }
    snap({ kind: self ? 'found' : 'call', cur: id, lines: ['self', 'call'], title: `${n.v} ${self ? 'is good' : 'is not good'}; pass max ${m} down`, text: `The biggest value above ${n.v} is ${show}. ${self ? `${n.v} ≥ ${show}: good.` : `${show} > ${n.v}: not good.`} Its children need the biggest value above *them*, which is now max(${show}, ${n.v}) = ${m}.`, calc: [`self = ${self}`, `pass down max ${m}`] });
    const l = good(n.left, m), r = good(n.right, m);
    const v = self + l + r;
    leave(id, String(v));
    snap({ kind: 'return', cur: id, lines: ['ret'], title: `${n.v} returns ${v}`, text: `${self} for itself, ${l} from the left, ${r} from the right: ${v} good nodes in this subtree.`, calc: [`${self} + ${l} + ${r} = ${v}`] });
    return v;
  };

  const diam = (id) => {
    if (id === null) return 0;
    const n = N[id];
    enter(id);
    if (leaf(n)) {
      leave(id, 'h 1');
      record = Math.max(record ?? 0, 0);
      snap({ kind: 'return', cur: id, lines: ['call', 'record', 'ret'], title: `${n.v} returns height 1`, text: `A leaf: no path bends here (0 + 0 = 0 edges), and its height is 1.`, calc: ['bend here: 0', 'return 1'] });
      return 1;
    }
    snap({ kind: 'call', cur: id, lines: ['call'], title: `depth(${n.v}): ask the children`, text: `${n.v} asks ${kids(n).join(' and ')} for their heights.`, calc: [`calls waiting: ${stack.length}`] });
    const l = diam(n.left), r = diam(n.right);
    const bend = l + r;
    const prev = record ?? 0;
    const better = bend > prev;
    record = Math.max(prev, bend);
    leave(id, `h ${1 + Math.max(l, r)}`);
    snap({ kind: better ? 'found' : 'return', cur: id, lines: ['record', 'ret'], bend: id, title: `${n.v}: a path bends here with ${bend} edges; return height ${1 + Math.max(l, r)}`, text: `Heights: left ${l}, right ${r}. The longest path that goes down both sides through ${n.v} has ${l} + ${r} = ${bend} edges${better ? ', the best so far: record it' : `, not better than ${record}`}. But a path can't fork, so the parent can only use one side: return 1 + max(${l}, ${r}) = ${1 + Math.max(l, r)}.`, calc: [`record = max(${prev}, ${bend}) = ${record}`, `return ${1 + Math.max(l, r)}`] });
    return 1 + Math.max(l, r);
  };

  const lca = (id) => {
    if (id === null) return null;
    const n = N[id];
    enter(id);
    if (n.v === p || n.v === q) {
      leave(id, `${n.v}`);
      skip(n.left); skip(n.right);
      snap({ kind: 'found', cur: id, lines: ['found'], title: `Found ${n.v}: return it`, text: `${n.v} is one of the two we're looking for, so return it without searching below. If the other one is underneath, ${n.v} itself is the answer; the caller will find out.`, calc: [`return ${n.v}`] });
      return id;
    }
    if (leaf(n)) {
      leave(id, 'null');
      snap({ kind: 'return', cur: id, lines: ['found', 'one'], title: `${n.v}: neither here nor below → null`, text: `${n.v} is neither ${p} nor ${q}, and it has no children: return null.`, calc: ['return null'] });
      return null;
    }
    snap({ kind: 'call', cur: id, lines: ['call'], title: `lca(${n.v}): search both sides`, text: `${n.v} is neither ${p} nor ${q}. Ask the left and right subtrees what they find.`, calc: [`calls waiting: ${stack.length}`] });
    const l = lca(n.left), r = lca(n.right);
    const lv = l === null ? 'null' : N[l].v, rv = r === null ? 'null' : N[r].v;
    if (l !== null && r !== null) {
      leave(id, `LCA ${n.v}`);
      snap({ kind: 'found', cur: id, lines: ['both'], title: `${n.v} hears back from both sides: it's the LCA`, text: `The left side found ${lv} and the right side found ${rv}. Their paths from the root meet here, so ${n.v} is the lowest common ancestor. Return it upwards.`, calc: [`l = ${lv}, r = ${rv}`, `return ${n.v}`] });
      return id;
    }
    const up = l ?? r;
    leave(id, up === null ? 'null' : `${N[up].v}`);
    snap({ kind: 'return', cur: id, lines: ['one'], title: `${n.v} passes up ${up === null ? 'null' : N[up].v}`, text: up === null ? 'Neither side found anything: return null.' : `Only one side found something (${N[up].v}), so pass it up unchanged: it's either one of the targets or an LCA found lower down.`, calc: [`l = ${lv}, r = ${rv}`, `return ${up === null ? 'null' : N[up].v}`] });
    return up;
  };

  let answer;
  let lcaSelf = false;
  if (mode === 'depth') answer = `depth = ${depth(t.root)}`;
  else if (mode === 'pathsum') answer = `${has(t.root, target)}`;
  else if (mode === 'good') answer = `${good(t.root, -Infinity)} good nodes`;
  else if (mode === 'diameter') { diam(t.root); answer = `diameter = ${record} edges`; }
  else { const id = lca(t.root); answer = `LCA = ${N[id].v}`; lcaSelf = N[id].v === p || N[id].v === q; }
  snap({
    kind: 'done', cur: null, lines: [], answer,
    title: `Answer: ${answer}`,
    text: {
      depth: 'Every node was visited once and did O(1) work on top of its children\'s answers: O(n) time, and O(h) stack for the calls waiting.',
      pathsum: 'Context went down as a parameter, the answer came back up as a return value. With ||, the search stopped as soon as one path worked.',
      good: 'Context (the biggest value so far) flowed down, counts flowed up. O(n) time, one visit per node.',
      diameter: 'Every node reported a height upwards and recorded its own bend on the side. The best bend may be far from the root, which is why it lives outside the recursion.',
      lca: lcaSelf
        ? 'One target was found above the other. The search never looked underneath it: since both values are guaranteed to be in the tree, the other one must be below, which makes the first one found the answer.'
        : 'Each call reported what it found. The first node to hear from both sides was the meeting point; nothing above it changed the answer, it was just passed up.',
    }[mode],
    calc: [answer],
  });
  return steps;
}

// ---------------------------------------------------------------- tree BFS: level by level

export const TREE_BFS = {
  level: { label: 'Level order', input: { mode: 'level', tree: [3, 9, 20, null, null, 15, 7] } },
  right: { label: 'Right side view', input: { mode: 'right', tree: [1, 2, 3, null, 5, null, 4] } },
  min: { label: 'Minimum depth', input: { mode: 'min', tree: [3, 9, 20, null, null, 15, 7] } },
  zigzag: { label: 'Zigzag', input: { mode: 'zigzag', tree: [1, 2, 3, 4, 5, 6, 7] } },
};

export const treeBfsCode = (mode) => [
  ['size', 'int size = queue.size();                 // everything in the queue now = one level'],
  ['poll', 'for (i < size) { n = queue.poll();'],
  ['use', {
    level: '  level.add(n.val);',
    right: '  if (i == size - 1) out.add(n.val);      // last of the level is visible from the right',
    min: '  if (n is a leaf) return depth;           // the first leaf is the shallowest',
    zigzag: '  leftToRight ? level.addLast(n.val) : level.addFirst(n.val);',
  }[mode]],
  ['kids', '  offer(n.left); offer(n.right); }      // children belong to the next level'],
];

export function treeBfsAnswer({ mode, tree }) {
  const t = buildTree(tree);
  const levels = [];
  let q = t.root === null ? [] : [t.root];
  while (q.length) { levels.push(q.map((id) => t.nodes[id].v)); q = q.flatMap((id) => [t.nodes[id].left, t.nodes[id].right].filter((x) => x !== null)); }
  if (mode === 'level') return levels;
  if (mode === 'right') return levels.map((l) => l.at(-1));
  if (mode === 'zigzag') return levels.map((l, k) => (k % 2 ? [...l].reverse() : l));
  let qq = [t.root];
  for (let d = 1; ; d++) {
    const nx = [];
    for (const id of qq) { const n = t.nodes[id]; if (n.left === null && n.right === null) return d; if (n.left !== null) nx.push(n.left); if (n.right !== null) nx.push(n.right); }
    qq = nx;
  }
}

export function treeBfs({ mode, tree }) {
  const t = buildTree(tree);
  const N = t.nodes;
  const queue = [t.root];
  const status = {};          // id → queued | done
  const levelOf = {};
  const out = [];             // levels so far (arrays of values) or the visible values
  const steps = [];
  const snap = (x) => steps.push({ tree, queue: [...queue], status: { ...status }, levelOf: { ...levelOf }, out: JSON.parse(JSON.stringify(out)), ...x });
  status[t.root] = 'queued';
  snap({
    kind: 'start', cur: null, lines: [],
    title: { level: 'Level-order traversal', right: 'What do you see from the right?', min: 'The shallowest leaf', zigzag: 'Zigzag level order' }[mode],
    text: 'A queue hands out nodes in the order they arrived, so children (added at the back) come out after everything on the current level. The trick is to freeze the queue\'s size at the start of each round: exactly that many nodes are the current level.',
    calc: [`tree: ${showTree(tree)}`, 'queue: [root]'],
  });
  let depth = 0;
  while (queue.length) {
    depth++;
    const size = queue.length;
    const level = [];
    const ltr = depth % 2 === 1;
    snap({
      kind: 'level', cur: null, depth, lines: ['size'], size,
      title: `Level ${depth}: size = ${size}`,
      text: `The queue holds ${plural(size, 'node')} (${queue.map((id) => N[id].v).join(', ')}): that is the whole of level ${depth}. Process exactly ${size}; anything added meanwhile waits for the next round.${mode === 'zigzag' ? ` This level is written ${ltr ? 'left to right' : 'right to left'}.` : ''}`,
      calc: [`size = ${size}`],
    });
    for (let i = 0; i < size; i++) {
      const id = queue.shift();
      const n = N[id];
      status[id] = 'done';
      levelOf[id] = depth;
      const isLeaf = n.left === null && n.right === null;
      if (mode === 'min' && isLeaf) {
        snap({
          kind: 'found', cur: id, depth, lines: ['poll', 'use'], answer: `min depth = ${depth}`,
          title: `${n.v} is a leaf: minimum depth ${depth}`,
          text: `BFS finishes each level before the next, so the first leaf it meets is the shallowest one. Return ${depth} now, without looking at the deeper nodes still in the queue${queue.length ? ` (${queue.map((x) => N[x].v).join(', ')})` : ''}.`,
          calc: [`return ${depth}`],
        });
        return steps;
      }
      const kids = [n.left, n.right].filter((x) => x !== null);
      kids.forEach((k) => { queue.push(k); status[k] = 'queued'; });
      let use = '';
      if (mode === 'level') { level.push(n.v); use = `Add ${n.v} to level ${depth}.`; }
      if (mode === 'zigzag') { if (ltr) level.push(n.v); else level.unshift(n.v); use = `Write ${n.v} at the ${ltr ? 'end' : 'front'} of this level's list.`; }
      const visible = mode === 'right' && i === size - 1;
      if (visible) { out.push(n.v); use = `${n.v} is the last node of level ${depth}, so it is the one you see from the right.`; }
      if (mode === 'right' && !visible) use = `${n.v} is not the last of its level: something to its right hides it.`;
      if (mode === 'level' || mode === 'zigzag') out[depth - 1] = [...level];
      snap({
        kind: visible ? 'found' : 'visit', cur: id, depth, lines: ['poll', 'use', 'kids'], i, size,
        title: `poll ${n.v}${kids.length ? `, queue ${kids.length === 1 ? 'its child' : 'its children'} ${kids.map((k) => N[k].v).join(', ')}` : ''}`,
        text: `${use} ${kids.length === 2 ? `Its children ${kids.map((k) => N[k].v).join(' and ')} join the back of the queue: they belong to level ${depth + 1}.` : kids.length === 1 ? `Its child ${N[kids[0]].v} joins the back of the queue: it belongs to level ${depth + 1}.` : `${n.v} has no children to queue.`} (${i + 1} of ${size} on this level.)`,
        calc: [`queue: ${list(queue.map((x) => N[x].v))}`, mode === 'right' ? `visible: ${list(out)}` : `level ${depth}: ${list(level)}`],
      });
    }
    if (mode === 'min') continue;
  }
  const ans = mode === 'right' ? list(out) : out.map((l) => list(l)).join(' ');
  snap({
    kind: 'done', cur: null, lines: [], answer: ans,
    title: `Done: ${ans}`,
    text: `${mode === 'zigzag' ? 'The traversal order never changed; only where each value was written in its level\'s list. ' : ''}Every node went into the queue once and came out once: O(n) time, and the queue never holds more than one level and a bit, O(width).`,
    calc: [ans],
  });
  return steps;
}

// ---------------------------------------------------------------- binary search trees

const BST_TREE = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7];

export const BST = {
  search: { label: 'Search 7', input: { mode: 'search', tree: BST_TREE, x: 7 } },
  insert: { label: 'Insert 5', input: { mode: 'insert', tree: BST_TREE, x: 5 } },
  validate: { label: 'Validate', input: { mode: 'validate', tree: [5, 3, 8, null, null, 4, 9] } },
  kth: { label: '3rd smallest', input: { mode: 'kth', tree: BST_TREE, x: 3 } },
  lca: { label: 'LCA of 4 and 7', input: { mode: 'lca', tree: BST_TREE, p: 4, q: 7 } },
};

export const bstCode = (mode) => ({
  search: [['cmp', 'while (n != null && n.val != x)'], ['go', '  n = x < n.val ? n.left : n.right;      // only one side can hold x'], ['end', 'return n;']],
  insert: [['cmp', 'if (n == null) return new TreeNode(x);     // the empty spot'], ['go', 'if (x < n.val) n.left = insert(n.left, x); else n.right = insert(n.right, x);']],
  validate: [['range', 'if (n.val <= lo || n.val >= hi) return false;   // must fit the range from above'], ['go', 'return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);']],
  kth: [['left', 'while (cur != null) { stack.push(cur); cur = cur.left; }   // as far left as possible'], ['pop', 'cur = stack.pop();  if (--k == 0) return cur.val;           // the next smallest'], ['right', 'cur = cur.right;']],
  lca: [['go', 'while (both < n) go left; while (both > n) go right;'], ['split', 'else return n;                       // they split here (or one is here)']],
})[mode];

const inf = (v) => (v === Infinity ? '∞' : v === -Infinity ? '−∞' : v);

export function bstAnswer({ mode, tree, x, p, q }) {
  const t = buildTree(tree);
  const vals = inorder(t).map((id) => t.nodes[id].v);
  if (mode === 'search') return vals.includes(x);
  if (mode === 'insert') return [...vals, x].sort((a, b) => a - b);
  if (mode === 'validate') return isBst(t);
  if (mode === 'kth') return vals[x - 1];
  const lo = Math.min(p, q), hi = Math.max(p, q);
  let cur = t.root;
  for (;;) { const v = t.nodes[cur].v; if (hi < v) cur = t.nodes[cur].left; else if (lo > v) cur = t.nodes[cur].right; else return v; }
}

export function bst({ mode, tree, x, p, q }) {
  const t = buildTree(tree);
  const N = t.nodes;
  const status = {};        // id → path | bad | done | skip
  const tags = {};          // id → range text (validate)
  const visit = [];         // in-order visits (kth)
  const stack = [];         // kth's explicit stack
  const steps = [];
  const snap = (s) => steps.push({ t: cloneTree(t), status: { ...status }, tags: { ...tags }, visit: [...visit], stack: [...stack], ...s });
  snap({
    kind: 'start', cur: null, lines: [],
    title: {
      search: `Search for ${x}`,
      insert: `Insert ${x}`,
      validate: 'Is this a valid BST?',
      kth: `The ${x}${['th', 'st', 'nd', 'rd'][x] ?? 'th'} smallest value`,
      lca: `Lowest common ancestor of ${p} and ${q}`,
    }[mode],
    text: {
      search: 'In a BST everything left of a node is smaller and everything right is bigger. So one comparison per node tells you which side x must be on, and the other side can be ignored completely.',
      insert: `Walk down exactly as if searching for ${x}. When the walk falls off the tree, that empty spot is where ${x} belongs.`,
      validate: 'Checking each node against its parent isn\'t enough: a node deep down must also respect every ancestor. So pass the allowed range (lo, hi) down; going left lowers hi, going right raises lo.',
      kth: 'In-order (left, node, right) visits a BST in sorted order. Do it with an explicit stack, counting visits, and stop at the k-th: no need to visit the rest.',
      lca: 'Both values smaller than a node: their ancestor is on the left. Both bigger: on the right. The first node where they split up (or that is one of them) is the LCA.',
    }[mode],
    calc: [`tree: ${showTree(tree)}`],
  });
  if (mode === 'search' || mode === 'insert') {
    let cur = t.root;
    let parent = null, side = null;
    while (cur !== null && N[cur].v !== x) {
      const n = N[cur];
      status[cur] = 'path';
      side = x < n.v ? 'left' : 'right';
      parent = cur;
      const next = n[side];
      snap({ kind: 'go', cur, lines: mode === 'search' ? ['cmp', 'go'] : ['go'], title: `${x} ${x < n.v ? '<' : '>'} ${n.v}: go ${side}`, text: `${x} is ${x < n.v ? 'smaller' : 'bigger'} than ${n.v}, so it can only be in the ${side} subtree. ${next === null ? `There is no ${side} child.` : `Move to ${N[next].v}.`} The whole ${side === 'left' ? 'right' : 'left'} side is ruled out with one comparison.`, calc: [`${x} ${x < n.v ? '<' : '>'} ${n.v} → ${side}`] });
      cur = next;
    }
    if (mode === 'search') {
      if (cur !== null) status[cur] = 'hit';
      const comps = Object.values(status).length;
      snap({ kind: cur !== null ? 'found' : 'missing', cur, lines: ['end'], answer: cur !== null ? `found ${x}` : `${x} not in the tree`, title: cur !== null ? `Found ${x}` : `${x} is not in the tree`, text: `${cur !== null ? `Found after ${plural(comps, 'node')}.` : `The walk fell off the tree, so ${x} isn't there.`} The cost is the height of the tree: O(log n) when it's balanced, O(n) when it degenerates into a line.`, calc: [`nodes visited: ${comps}`] });
      return steps;
    }
    if (cur !== null) {
      status[cur] = 'bad';
      snap({ kind: 'missing', cur, lines: ['cmp'], answer: `${x} is already there`, title: `${x} is already in the tree`, text: 'BSTs usually hold each value once, so there is nothing to insert.', calc: [`${x} found`] });
      return steps;
    }
    const id = `n${Object.keys(N).length}`;
    N[id] = { id, v: x, left: null, right: null };
    N[parent][side] = id;
    status[id] = 'hit';
    snap({ kind: 'insert', cur: id, fresh: id, lines: ['cmp', 'go'], answer: `inserted ${x}`, title: `Attach ${x} as ${N[parent].v}'s ${side} child`, text: `The walk fell off the tree at ${N[parent].v}'s empty ${side} spot: that's the only place ${x} can go and keep the order. No other node moves. In-order now reads ${list(inorder(t).map((k) => N[k].v))}: still sorted.`, calc: [`${N[parent].v}.${side} = ${x}`] });
    return steps;
  }
  if (mode === 'validate') {
    let bad = null;
    const valid = (id, lo, hi) => {
      if (id === null || bad) return true;
      const n = N[id];
      tags[id] = `(${inf(lo)}, ${inf(hi)})`;
      const ok = n.v > lo && n.v < hi;
      status[id] = ok ? 'path' : 'bad';
      if (!ok) {
        bad = id;
        snap({ kind: 'fail', cur: id, lines: ['range'], answer: `not a BST: ${n.v} breaks (${inf(lo)}, ${inf(hi)})`, title: `${n.v} is outside (${inf(lo)}, ${inf(hi)}): not a BST`, text: `${n.v} has to be ${n.v <= lo ? `bigger than ${lo}` : `smaller than ${hi}`}, because it sits in the ${n.v <= lo ? 'right' : 'left'} subtree of the node with that value. Checking it only against its own parent would have missed this.`, calc: [`${inf(lo)} < ${n.v} < ${inf(hi)}? no`, 'return false'] });
        return false;
      }
      const leafNode = n.left === null && n.right === null;
      snap({ kind: 'check', cur: id, lines: ['range', 'go'], title: `${n.v} fits (${inf(lo)}, ${inf(hi)})`, text: `${n.v} is inside its allowed range.${leafNode ? ' It has no children, so this branch is fine.' : ` Its left subtree must stay in (${inf(lo)}, ${n.v}) and its right subtree in (${n.v}, ${inf(hi)}).`}`, calc: [`${inf(lo)} < ${n.v} < ${inf(hi)} ✓`] });
      return valid(n.left, lo, n.v) && valid(n.right, n.v, hi);
    };
    const ok = valid(t.root, -Infinity, Infinity);
    if (ok) snap({ kind: 'done', cur: null, lines: [], answer: 'valid BST', title: 'Every node fits its range: a valid BST', text: 'Each node was checked once against the range inherited from all its ancestors: O(n).', calc: ['return true'] });
    return steps;
  }
  if (mode === 'kth') {
    let cur = t.root;
    let k = x;
    for (;;) {
      const pushed = [];
      while (cur !== null) { stack.push(cur); pushed.push(N[cur].v); status[cur] = 'path'; cur = N[cur].left; }
      if (pushed.length) snap({ kind: 'left', cur: stack.at(-1), lines: ['left'], title: `Go left as far as possible: push ${pushed.join(', ')}`, text: 'The smallest value not visited yet is at the bottom of this leftward walk. Push every node on the way, so you can come back to them in order.', calc: [`stack: ${list(stack.map((id) => N[id].v))}`] });
      if (!stack.length) break;
      const id = stack.pop();
      visit.push(id);
      status[id] = 'done';
      k--;
      if (k === 0) {
        status[id] = 'hit';
        snap({ kind: 'found', cur: id, lines: ['pop'], answer: `${x}${['th', 'st', 'nd', 'rd'][x] ?? 'th'} smallest = ${N[id].v}`, title: `Visit ${N[id].v}: number ${x}, done`, text: `This is the ${x}${['th', 'st', 'nd', 'rd'][x] ?? 'th'} value in sorted order: ${N[id].v}. Stop: the rest of the tree is never touched, so this is O(h + k), not O(n).`, calc: [`visited in order: ${list(visit.map((v) => N[v].v))}`] });
        return steps;
      }
      cur = N[id].right;
      snap({ kind: 'visit', cur: id, lines: ['pop', 'right'], title: `Visit ${N[id].v} (number ${visit.length}), then its right subtree`, text: `Pop ${N[id].v}: everything smaller has been visited, so it's next in sorted order (${visit.length} so far, ${k} to go). ${cur === null ? 'It has no right subtree, so the next pop gives the next value.' : `Its right subtree (from ${N[cur].v}) holds the values just above it: go there next.`}`, calc: [`visited: ${list(visit.map((v) => N[v].v))}`, `k left: ${k}`] });
    }
    snap({ kind: 'done', cur: null, lines: [], answer: 'k is larger than the tree', title: 'Fewer than k values', text: 'The traversal ran out of nodes.', calc: [`visited: ${visit.length}`] });
    return steps;
  }
  const lo = Math.min(p, q), hi = Math.max(p, q);
  let cur = t.root;
  for (;;) {
    const n = N[cur];
    if (hi < n.v || lo > n.v) {
      status[cur] = 'path';
      const side = hi < n.v ? 'left' : 'right';
      snap({ kind: 'go', cur, lines: ['go'], title: `${p} and ${q} are both ${side === 'left' ? 'smaller' : 'bigger'} than ${n.v}: go ${side}`, text: `Both values live in ${n.v}'s ${side} subtree, so their lowest common ancestor is down there too.`, calc: [`${lo}, ${hi} ${side === 'left' ? '<' : '>'} ${n.v}`] });
      cur = n[side];
      continue;
    }
    status[cur] = 'hit';
    snap({ kind: 'found', cur, lines: ['split'], answer: `LCA = ${n.v}`, title: `They split at ${n.v}: the LCA`, text: n.v === p || n.v === q ? `${n.v} is one of the two values itself, and the other is below it: ${n.v} is the LCA.` : `${lo} < ${n.v} < ${hi}: one value is on the left, the other on the right, so this is where their paths part. O(h) time and O(1) space; a plain binary tree would need the two-sided search from Tree DFS.`, calc: [`${lo} ≤ ${n.v} ≤ ${hi}`] });
    return steps;
  }
}

export function parseBst(values, input) {
  const tr = parseTreeText(values.tree, { maxNodes: 13, maxDepth: 5 });
  if (tr.error) return tr;
  const t = buildTree(tr.arr);
  const vals = inorder(t).map((id) => t.nodes[id].v);
  if (input.mode !== 'validate') {
    if (!isBst(t)) return { error: 'That tree is not a BST (in-order must be strictly increasing). Try the Validate example for broken trees.' };
  }
  if (input.mode === 'validate') return { input: { mode: 'validate', tree: tr.arr } };
  if (input.mode === 'lca') {
    const p = parseInt1(values.p, { min: -99, max: 99, name: 'p' }); if (p.error) return p;
    const q = parseInt1(values.q, { min: -99, max: 99, name: 'q' }); if (q.error) return q;
    if (!vals.includes(p.v) || !vals.includes(q.v)) return { error: 'p and q must both be values in the tree.' };
    return { input: { mode: 'lca', tree: tr.arr, p: p.v, q: q.v } };
  }
  const xr = parseInt1(values.x, input.mode === 'kth' ? { min: 1, max: vals.length, name: 'k' } : { min: -99, max: 99, name: 'x' });
  return xr.error ? xr : { input: { mode: input.mode, tree: tr.arr, x: xr.v } };
}

export function randomBst(input, rand = Math.random) {
  const g = rng(rand);
  const tree = randomTreeArr(rand, { n: g.int(6, 9), lo: 1, hi: 30, bst: input.mode !== 'validate', maxDepth: 4 });
  if (input.mode === 'validate') return { mode: 'validate', tree: g.bool(0.5) ? randomTreeArr(rand, { n: 7, lo: 1, hi: 30, bst: true }) : tree };
  const vals = inorder(buildTree(tree)).map((id) => buildTree(tree).nodes[id].v);
  if (input.mode === 'lca') { const [p, q] = g.shuffle([...vals]).slice(0, 2); return { mode: 'lca', tree, p, q }; }
  if (input.mode === 'kth') return { mode: 'kth', tree, x: g.int(1, vals.length) };
  return { mode: input.mode, tree, x: g.bool(0.6) && input.mode === 'search' ? g.pick(vals) : g.int(1, 30) };
}

export function parseTreeDfs(values, input) {
  const tr = parseTreeText(values.tree);
  if (tr.error) return tr;
  const t = buildTree(tr.arr);
  const vals = Object.values(t.nodes).map((n) => n.v);
  if (input.mode === 'pathsum') {
    const tg = parseInt1(values.target, { min: -999, max: 999, name: 'target' });
    return tg.error ? tg : { input: { mode: 'pathsum', tree: tr.arr, target: tg.v } };
  }
  if (input.mode === 'lca') {
    if (new Set(vals).size !== vals.length) return { error: 'For LCA every value must be different, so p and q are unambiguous.' };
    const p = parseInt1(values.p, { min: -99, max: 99, name: 'p' }); if (p.error) return p;
    const q = parseInt1(values.q, { min: -99, max: 99, name: 'q' }); if (q.error) return q;
    if (!vals.includes(p.v) || !vals.includes(q.v) || p.v === q.v) return { error: 'p and q must be two different values in the tree.' };
    return { input: { mode: 'lca', tree: tr.arr, p: p.v, q: q.v } };
  }
  return { input: { mode: input.mode, tree: tr.arr } };
}

export function randomTreeDfs(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'lca') {
    const tree = randomTreeArr(rand, { n: g.int(6, 10), lo: 1, hi: 30, bst: true, maxDepth: 4 });
    const t = buildTree(tree);
    const vals = Object.values(t.nodes).map((n) => n.v);
    const [p, q] = g.shuffle([...vals]).slice(0, 2);
    return { mode: 'lca', tree, p, q };
  }
  const tree = randomTreeArr(rand, { n: g.int(5, 10), lo: 1, hi: 9 });
  if (input.mode === 'pathsum') {
    const t = buildTree(tree);
    const sums = [];
    const walk = (id, s) => { const n = t.nodes[id]; const v = s + n.v; if (n.left === null && n.right === null) sums.push(v); if (n.left !== null) walk(n.left, v); if (n.right !== null) walk(n.right, v); };
    walk(t.root, 0);
    return { mode: 'pathsum', tree, target: g.bool(0.6) ? g.pick(sums) : g.int(5, 30) };
  }
  return { mode: input.mode, tree };
}

export function parseTreeBfs(values, input) {
  const tr = parseTreeText(values.tree);
  return tr.error ? tr : { input: { mode: input.mode, tree: tr.arr } };
}

export function randomTreeBfs(input, rand = Math.random) {
  return { mode: input.mode, tree: randomTreeArr(rand, { n: rng(rand).int(5, 11), lo: 1, hi: 9 }) };
}

export { showTree };
