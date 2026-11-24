/**
 * Tree step-throughs (models for <TreeDfsViz>, <TreeBfsViz> and <BstViz>). Trees are given in
 * LeetCode's level order ("3, 9, 20, null, null, 15, 7"). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

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
  avg: { label: 'Average of levels', input: { mode: 'avg', tree: [3, 9, 20, null, null, 15, 7] } },
  max: { label: 'Largest per row', input: { mode: 'max', tree: [1, 3, 2, 5, 3, null, 9] } },
  right: { label: 'Right side view', input: { mode: 'right', tree: [1, 2, 3, null, 5, null, 4] } },
  min: { label: 'Minimum depth', input: { mode: 'min', tree: [3, 9, 20, null, null, 15, 7] } },
  zigzag: { label: 'Zigzag', input: { mode: 'zigzag', tree: [1, 2, 3, 4, 5, 6, 7] } },
  width: { label: 'Maximum width', input: { mode: 'width', tree: [1, 3, 2, 5, 3, null, 9] } },
  next: { label: 'Next pointers', input: { mode: 'next', tree: [1, 2, 3, 4, 5, 6, 7] } },
};

export const treeBfsCode = (mode) => {
  if (mode === 'next') {
    return [
      ['level', 'while (leftmost.left != null) {        // the level below still needs links'],
      ['walk', '  for (head = leftmost; head != null; head = head.next) {   // walk this level like a list'],
      ['inside', '    head.left.next = head.right;          // siblings: one parent knows both'],
      ['across', '    if (head.next != null) head.right.next = head.next.left; }   // cousins, via the parent\'s next'],
      ['down', '  leftmost = leftmost.left; }             // that level is linked: move down'],
    ];
  }
  return [
    ['size', {
      width: 'int size = queue.size(); first = queue.peek().pos;   // re-base: this level starts at 0',
    }[mode] ?? 'int size = queue.size();                 // everything in the queue now = one level'],
    ['poll', 'for (i < size) { n = queue.poll();'],
    ['use', {
      level: '  level.add(n.val);',
      avg: '  sum += n.val;                          // a long (or double): values reach 2³¹',
      max: '  best = (i == 0) ? n.val : max(best, n.val);   // start from the first node, not 0',
      right: '  if (i == size - 1) out.add(n.val);      // last of the level is visible from the right',
      min: '  if (n is a leaf) return depth;           // the first leaf is the shallowest',
      zigzag: '  leftToRight ? level.addLast(n.val) : level.addFirst(n.val);',
      width: '  p = n.pos - first; last = p;',
    }[mode]],
    ['kids', mode === 'width'
      ? '  offer(n.left, 2p); offer(n.right, 2p + 1); }   // heap positions'
      : '  offer(n.left); offer(n.right); }      // children belong to the next level'],
    ...(mode === 'avg' ? [['end', 'out.add(sum / size);']] : []),
    ...(mode === 'max' ? [['end', 'out.add(best);']] : []),
    ...(mode === 'width' ? [['end', 'best = max(best, last + 1);              // width = last − first + 1, first is 0']] : []),
  ];
};

const fmt = (x) => (Number.isInteger(x) ? `${x}.0` : String(Math.round(x * 1e5) / 1e5));

export function treeBfsAnswer({ mode, tree }) {
  const t = buildTree(tree);
  const levels = [];
  let q = t.root === null ? [] : [t.root];
  while (q.length) { levels.push(q.map((id) => t.nodes[id].v)); q = q.flatMap((id) => [t.nodes[id].left, t.nodes[id].right].filter((x) => x !== null)); }
  if (mode === 'level') return levels;
  if (mode === 'avg') return levels.map((l) => l.reduce((a, b) => a + b, 0) / l.length);
  if (mode === 'max') return levels.map((l) => Math.max(...l));
  if (mode === 'right') return levels.map((l) => l.at(-1));
  if (mode === 'zigzag') return levels.map((l, k) => (k % 2 ? [...l].reverse() : l));
  if (mode === 'next') return levels.flatMap((l) => [...l.map(String), '#']);
  if (mode === 'width') {
    let best = 0;
    let lv = [[t.root, 0]];
    while (lv.length) {
      best = Math.max(best, lv.at(-1)[1] - lv[0][1] + 1);
      lv = lv.flatMap(([id, p]) => [[t.nodes[id].left, 2 * p], [t.nodes[id].right, 2 * p + 1]].filter(([c]) => c !== null));
    }
    return best;
  }
  let qq = [t.root];
  for (let d = 1; ; d++) {
    const nx = [];
    for (const id of qq) { const n = t.nodes[id]; if (n.left === null && n.right === null) return d; if (n.left !== null) nx.push(n.left); if (n.right !== null) nx.push(n.right); }
    qq = nx;
  }
}

/** Populating next pointers in a perfect tree: each linked level is walked like a list to wire the one below. */
function treeNext(tree) {
  const t = buildTree(tree);
  const N = t.nodes;
  const next = {};             // id → id | null, once set
  const out = [[N[t.root].v]]; // levels read through next pointers
  const fresh = [];
  const steps = [];
  next[t.root] = null;
  const snap = (x) => steps.push({ tree, queue: [], status: {}, levelOf: {}, posOf: {}, next: { ...next }, out: out.map((l) => [...l]), fresh: [...fresh], ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'Link every node to its right neighbour',
    text: 'The tree is perfect: every parent has two children and the leaves share one level. The root is a level on its own, so its next is already null. From then on, a level whose next pointers are set can be walked like a linked list, and that walk is all you need to wire the level below. No queue.',
    calc: [`tree: ${showTree(tree)}`, 'root.next = null'],
  });
  let leftmost = t.root;
  let depth = 1;
  while (N[leftmost].left !== null) {
    const row = [];
    for (let h = leftmost; h !== null; h = next[h]) row.push(h);
    fresh.length = 0;
    snap({
      kind: 'level', cur: leftmost, depth, lines: ['level'], walk: row,
      title: `Level ${depth} is linked: walk it`,
      text: `Level ${depth} reads ${row.map((id) => N[id].v).join(' → ')} → null through its next pointers. Walk it from the leftmost node, ${N[leftmost].v}. Every node on it is a parent, and while you stand on a parent you can reach both its children and its neighbour's children.`,
      calc: [`leftmost = ${N[leftmost].v}`],
    });
    for (const h of row) {
      const n = N[h];
      fresh.length = 0;
      next[n.left] = n.right;
      fresh.push(n.left);
      const last = next[h] === null;
      if (last) next[n.right] = null;
      snap({
        kind: 'wire', cur: h, depth, lines: ['walk', 'inside'], walk: row, kids: [n.left, n.right],
        title: `${n.v}.left.next = ${n.v}.right: ${N[n.left].v} → ${N[n.right].v}`,
        text: `Standing on ${n.v}. Its two children are side by side on the next level, and ${n.v} knows both, so ${N[n.left].v}.next = ${N[n.right].v}.${last ? ` ${n.v}.next is null: ${n.v} is the last node of its level, so ${N[n.right].v} is the last of the level below and its next stays null.` : ''}`,
        calc: [`${N[n.left].v}.next = ${N[n.right].v}`, ...(last ? [`${N[n.right].v}.next = null`] : [])],
      });
      if (!last) {
        const nb = N[next[h]];
        fresh.length = 0;
        next[n.right] = nb.left;
        fresh.push(n.right);
        snap({
          kind: 'link', cur: h, depth, lines: ['across'], walk: row, kids: [n.right, nb.left], via: next[h],
          title: `${n.v}.right.next = ${n.v}.next.left: ${N[n.right].v} → ${N[nb.left].v}`,
          text: `${N[n.right].v} and ${N[nb.left].v} are neighbours with different parents, so neither parent alone knows both. But ${n.v}.next is ${nb.v} (set on the level before), and ${nb.v}'s left child is ${N[nb.left].v}. That one hop across the level above bridges the gap.`,
          calc: [`${N[n.right].v}.next = ${N[nb.left].v}`],
        });
      }
    }
    const below = [];
    for (let h = N[leftmost].left; h !== null; h = next[h]) below.push(N[h].v);
    out.push(below);
    fresh.length = 0;
    snap({
      kind: 'found', cur: N[leftmost].left, depth: depth + 1, lines: ['down'], walk: [],
      title: `Level ${depth + 1} is linked: ${below.join(' → ')} → null`,
      text: `Every node on level ${depth + 1} now points at its right neighbour. Move down: leftmost = ${N[leftmost].v}.left = ${N[N[leftmost].left].v}.${N[N[leftmost].left].left === null ? ' It has no children, so this was the last level.' : ' This level is now the linked list that wires the next one.'}`,
      calc: [`leftmost = ${N[N[leftmost].left].v}`],
    });
    leftmost = N[leftmost].left;
    depth++;
  }
  const ans = out.map((l) => `${l.join(' ')} #`).join(' ');
  snap({
    kind: 'done', cur: null, lines: [], answer: ans,
    title: `Done: ${ans}`,
    text: 'Each node was stood on once and each pointer set once: O(n) time. The only extra memory was two pointers (leftmost and head), O(1), because the next pointers built on one level did the queue\'s job for the level below.',
    calc: [ans],
  });
  return steps;
}

export function treeBfs({ mode, tree }) {
  if (mode === 'next') return treeNext(tree);
  const t = buildTree(tree);
  const N = t.nodes;
  const queue = [t.root];
  const status = {};          // id → queued | done
  const levelOf = {};
  const posOf = {};           // width: heap position, re-based on its level
  const raw = { [t.root]: 0 };
  const out = [];             // levels so far (arrays of values), visible values, or one number per level
  const steps = [];
  const snap = (x) => steps.push({ tree, queue: [...queue], status: { ...status }, levelOf: { ...levelOf }, posOf: { ...posOf }, out: JSON.parse(JSON.stringify(out)), ...x });
  status[t.root] = 'queued';
  snap({
    kind: 'start', cur: null, lines: [],
    title: { level: 'Level-order traversal', avg: 'Average of each level', max: 'Largest value in each row', right: 'What do you see from the right?', min: 'The shallowest leaf', zigzag: 'Zigzag level order', width: 'The widest level, gaps included' }[mode],
    text: mode === 'width'
      ? 'Give every node the position it would have in a complete tree, like an array heap: the root is 0, and a node at p has children 2p and 2p + 1. A level\'s width is then its last position − its first + 1, gaps included. Positions double every level, so re-base them: subtract the level\'s first position before using them.'
      : 'A queue hands out nodes in the order they arrived, so children (added at the back) come out after everything on the current level. The trick is to freeze the queue\'s size at the start of each round: exactly that many nodes are the current level.',
    calc: [`tree: ${showTree(tree)}`, mode === 'width' ? 'queue: [(root, 0)]' : 'queue: [root]'],
  });
  let depth = 0;
  while (queue.length) {
    depth++;
    const size = queue.length;
    const level = [];
    const ltr = depth % 2 === 1;
    const first = raw[queue[0]];
    let sum = 0;
    let best = null;
    let last = 0;
    snap({
      kind: 'level', cur: null, depth, lines: ['size'], size,
      title: `Level ${depth}: size = ${size}`,
      text: `The queue holds ${plural(size, 'node')} (${queue.map((id) => N[id].v).join(', ')}): that is the whole of level ${depth}. Process exactly ${size}; anything added meanwhile waits for the next round.${mode === 'zigzag' ? ` This level is written ${ltr ? 'left to right' : 'right to left'}.` : ''}${mode === 'width' && depth > 1 ? ` The first node on it, ${N[queue[0]].v}, was given position ${first}; subtracting ${first} from every position on this level makes it start at 0.` : ''}${mode === 'avg' ? ' Start this level\'s sum at 0.' : ''}`,
      calc: [`size = ${size}`, ...(mode === 'width' ? [`first = ${first}`] : [])],
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
      const p = raw[id] - first;
      if (mode === 'width') { posOf[id] = p; last = p; }
      const kids = [n.left, n.right].filter((x) => x !== null);
      kids.forEach((k) => { queue.push(k); status[k] = 'queued'; raw[k] = k === n.left ? 2 * p : 2 * p + 1; });
      let use = '';
      if (mode === 'level') { level.push(n.v); use = `Add ${n.v} to level ${depth}.`; }
      if (mode === 'avg') { sum += n.v; use = `Add ${n.v} to the sum: ${sum}.`; }
      if (mode === 'max') {
        const was = best;
        best = i === 0 ? n.v : Math.max(best, n.v);
        use = i === 0 ? `${n.v} is the first node on the level, so it starts the maximum (not 0: values can be negative).` : n.v > was ? `${n.v} beats ${was}: the maximum is now ${n.v}.` : `${n.v} does not beat ${was}.`;
      }
      if (mode === 'zigzag') { if (ltr) level.push(n.v); else level.unshift(n.v); use = `Write ${n.v} at the ${ltr ? 'end' : 'front'} of this level's list.`; }
      if (mode === 'width') {
        use = `${n.v} sits at position ${p}${i === 0 ? ', the first on its level' : ''}.${kids.length ? ` ${kids.map((k) => `${N[k].v} gets ${raw[k]}`).join(' and ')} (2p = ${2 * p}${kids.length === 1 && kids[0] === n.right ? ', so a right-only child is 2p + 1' : ''}).` : ''}`;
      }
      const visible = mode === 'right' && i === size - 1;
      if (visible) { out.push(n.v); use = `${n.v} is the last node of level ${depth}, so it is the one you see from the right.`; }
      if (mode === 'right' && !visible) use = `${n.v} is not the last of its level: something to its right hides it.`;
      if (mode === 'level' || mode === 'zigzag') out[depth - 1] = [...level];
      const kidsText = mode === 'width' ? (kids.length ? '' : ` ${n.v} has no children to queue.`)
        : kids.length === 2 ? ` Its children ${kids.map((k) => N[k].v).join(' and ')} join the back of the queue: they belong to level ${depth + 1}.` : kids.length === 1 ? ` Its child ${N[kids[0]].v} joins the back of the queue: it belongs to level ${depth + 1}.` : ` ${n.v} has no children to queue.`;
      snap({
        kind: visible ? 'found' : 'visit', cur: id, depth, lines: ['poll', 'use', 'kids'], i, size,
        title: `poll ${n.v}${kids.length ? `, queue ${kids.length === 1 ? 'its child' : 'its children'} ${kids.map((k) => N[k].v).join(', ')}` : ''}`,
        text: `${use}${kidsText} (${i + 1} of ${size} on this level.)`,
        calc: [
          `queue: ${list(queue.map((x) => (mode === 'width' ? `${N[x].v}@${raw[x]}` : N[x].v)))}`,
          {
            right: `visible: ${list(out)}`, avg: `sum = ${sum}`, max: `best = ${best}`, width: `last = ${last}`,
          }[mode] ?? `level ${depth}: ${list(level)}`,
        ],
      });
    }
    if (mode === 'avg' || mode === 'max' || mode === 'width') {
      const val = mode === 'avg' ? sum / size : mode === 'max' ? best : last + 1;
      out.push(val);
      const shown = mode === 'avg' ? fmt(val) : String(val);
      snap({
        kind: 'found', cur: null, depth, lines: ['end'], answer: shown,
        title: { avg: `Level ${depth}: ${sum} / ${size} = ${shown}`, max: `Level ${depth}: largest is ${val}`, width: `Level ${depth}: width ${last} − 0 + 1 = ${val}` }[mode],
        text: {
          avg: `All ${plural(size, 'node')} of level ${depth} are counted, so the average is the sum divided by size, the number frozen at the start of the round. The children queued meanwhile don't affect it.`,
          max: `The level is finished, so ${val} is its largest value. The next level starts its own maximum from scratch.`,
          width: `The level spans positions 0 to ${last}, counting ${last + 1 - size === 0 ? 'no gaps' : `${plural(last + 1 - size, 'empty position')} between its nodes`}: width ${val}.${Math.max(...out) === val && out.length > 1 && out.slice(0, -1).every((w) => w < val) ? ' The widest so far.' : ''}`,
        }[mode],
        calc: [mode === 'width' ? `widths: ${list(out)}, best = ${Math.max(...out)}` : `out: ${list(mode === 'avg' ? out.map(fmt) : out)}`],
      });
    }
  }
  const ans = mode === 'right' ? list(out) : mode === 'avg' ? list(out.map(fmt)) : mode === 'max' ? list(out) : mode === 'width' ? `max width = ${Math.max(...out)}` : out.map((l) => list(l)).join(' ');
  snap({
    kind: 'done', cur: null, lines: [], answer: ans,
    title: `Done: ${ans}`,
    text: `${mode === 'zigzag' ? 'The traversal order never changed; only where each value was written in its level\'s list. ' : ''}${mode === 'width' ? 'Re-basing kept every position below the level\'s width instead of doubling every level, so nothing overflows even on a deep, thin tree. ' : ''}Every node went into the queue once and came out once: O(n) time, and the queue never holds more than one level and a bit, O(width).`,
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
  sorted: { label: 'From sorted array', input: { mode: 'sorted', nums: [-10, -3, 0, 5, 9] } },
  sorted7: { label: 'Seven values', input: { mode: 'sorted', nums: [1, 2, 3, 4, 5, 6, 7] } },
  delete: { label: 'Delete 3', input: { mode: 'delete', tree: BST_TREE, x: 3 } },
  deleteOne: { label: 'Delete 10', input: { mode: 'delete', tree: BST_TREE, x: 10 } },
  iter: { label: 'Iterator', input: { mode: 'iter', tree: [7, 3, 15, null, null, 9, 20] } },
  recover: { label: 'Recover (2 drops)', input: { mode: 'recover', tree: [8, 3, 6, 1, 10, null, 14, null, null, 4, 7] } },
  recoverAdj: { label: 'Recover (1 drop)', input: { mode: 'recover', tree: [3, 1, 4, null, null, 2] } },
};

export const bstCode = (mode) => BST_MORE_CODE[mode] ?? ({
  search: [['cmp', 'while (n != null && n.val != x)'], ['go', '  n = x < n.val ? n.left : n.right;      // only one side can hold x'], ['end', 'return n;']],
  insert: [['cmp', 'if (n == null) return new TreeNode(x);     // the empty spot'], ['go', 'if (x < n.val) n.left = insert(n.left, x); else n.right = insert(n.right, x);']],
  validate: [['range', 'if (n.val <= lo || n.val >= hi) return false;   // must fit the range from above'], ['go', 'return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);']],
  kth: [['left', 'while (cur != null) { stack.push(cur); cur = cur.left; }   // as far left as possible'], ['pop', 'cur = stack.pop();  if (--k == 0) return cur.val;           // the next smallest'], ['right', 'cur = cur.right;']],
  lca: [['go', 'while (both < n) go left; while (both > n) go right;'], ['split', 'else return n;                       // they split here (or one is here)']],
})[mode];

const inf = (v) => (v === Infinity ? '∞' : v === -Infinity ? '−∞' : v);

export function bstAnswer(input) {
  if (MORE.includes(input.mode)) return bstMoreAnswer(input);
  const { mode, tree, x, p, q } = input;
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

const MORE = ['sorted', 'delete', 'iter', 'recover'];

export function bst(input) {
  if (MORE.includes(input.mode)) return bstMore(input);
  const { mode, tree, x, p, q } = input;
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

// ---------------------------------------------------------------- binary search trees: build, delete, iterate, recover

export const BST_MORE_CODE = {
  sorted: [
    ['base', 'if (lo > hi) return null;                  // an empty range is an empty subtree'],
    ['mid', 'int mid = (lo + hi) / 2;  node = new TreeNode(nums[mid]);   // the middle splits the rest evenly'],
    ['kids', 'node.left = build(lo, mid − 1);  node.right = build(mid + 1, hi);  return node;'],
  ],
  delete: [
    ['go', 'while (n.val != key) n = key < n.val ? n.left : n.right;   // find it like a search'],
    ['one', 'if (n.left == null || n.right == null) replace n with its child (or null);'],
    ['succ', 's = n.right;  while (s.left != null) s = s.left;   // the next value up: smallest on the right'],
    ['copy', 'n.val = s.val;  replace s with s.right;          // s has no left child: the easy case'],
  ],
  iter: [
    ['init', 'BSTIterator(root) { pushLeft(root); }       // the stack ends at the smallest value'],
    ['left', 'pushLeft(n) { while (n != null) { stack.push(n); n = n.left; } }'],
    ['next', 'next() { n = stack.pop(); pushLeft(n.right); return n.val; }'],
    ['has', 'hasNext() { return !stack.isEmpty(); }'],
  ],
  recover: [
    ['walk', 'inorder: if (prev != null && prev.val > n.val) {   // a drop: the order breaks here'],
    ['first', '  if (first == null) first = prev;               // first drop: the too-big value'],
    ['second', '  second = n; }                                   // last drop: the too-small value'],
    ['prev', 'prev = n;'],
    ['swap', 'swap(first.val, second.val);'],
  ],
};

const isBalanced = (t) => {
  let ok = true;
  const h = (id) => { if (id === null) return 0; const a = h(t.nodes[id].left); const b = h(t.nodes[id].right); if (Math.abs(a - b) > 1) ok = false; return 1 + Math.max(a, b); };
  h(t.root);
  return ok;
};
export { isBalanced };

export function bstMoreAnswer({ mode, tree, nums, x }) {
  if (mode === 'sorted') return nums;
  const t = buildTree(tree);
  const vals = inorder(t).map((id) => t.nodes[id].v);
  if (mode === 'delete') return vals.filter((v) => v !== x);
  return [...vals].sort((a, b) => a - b);
}

function bstSorted(nums) {
  const t = { root: null, nodes: {} };
  const N = t.nodes;
  const status = {};
  const placed = {};          // index → node id
  const steps = [];
  let next = 0;
  const snap = ({ strip, ...s }) => steps.push({ t: cloneTree(t), status: { ...status }, tags: {}, visit: [], stack: [], ...s, strip: { label: 'nums', items: nums, marks: Object.fromEntries(Object.keys(placed).map((k) => [k, 'kept'])), ...strip } });
  snap({
    kind: 'start', cur: null, lines: [], strip: {},
    title: 'Build a balanced BST from a sorted array',
    text: 'Any value can be the root of a BST: smaller values go left, bigger go right. To keep it balanced, pick the value with as many values below it as above it: the middle one. Then do the same for each half.',
    calc: [`nums = ${list(nums)}`],
  });
  const build = (lo, hi, parent, side) => {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    const id = `b${next++}`;
    N[id] = { id, v: nums[mid], left: null, right: null };
    if (parent === null) t.root = id; else N[parent][side] = id;
    placed[mid] = id;
    status[id] = 'hit';
    const nl = mid - lo, nr = hi - mid;
    snap({
      kind: 'mid', cur: id, fresh: id, lines: ['mid'], strip: { band: [lo, hi], cur: mid },
      title: `Range ${lo}..${hi}: the middle is ${nums[mid]}`,
      text: `${parent === null ? 'The root' : `${N[parent].v}'s ${side} child`} is the middle of nums[${lo}..${hi}], index ${mid}: ${nums[mid]}. ${nl === 0 && nr === 0 ? 'Nothing is left on either side, so it is a leaf.' : `${plural(nl, 'value')} smaller go to its left, ${plural(nr, 'value')} bigger to its right${Math.abs(nl - nr) <= 1 ? ': the two sides differ by at most one' : ''}.`}`,
      calc: [`mid = (${lo} + ${hi}) / 2 = ${mid}`, `${parent === null ? 'root' : `${N[parent].v}.${side}`} = ${nums[mid]}`],
    });
    status[id] = 'done';
    build(lo, mid - 1, id, 'left');
    build(mid + 1, hi, id, 'right');
    return id;
  };
  build(0, nums.length - 1, null, null);
  snap({
    kind: 'done', cur: null, lines: [], strip: {}, answer: `[${showTree(toLevelOrder(t))}]`,
    title: `Done: [${showTree(toLevelOrder(t))}]`,
    text: 'Inorder reads the array back in order, so it is a BST; every node split its range in half, so the two sides of every node differ by at most one value and the height is about log₂ n. Each value was placed once: O(n) time, O(log n) recursion.',
    calc: [`height = ${depthOf(t)}`],
  });
  return steps;
}

function bstDelete(tree, key) {
  const t = buildTree(tree);
  const N = t.nodes;
  const status = {};
  const steps = [];
  const snap = (s) => steps.push({ t: cloneTree(t), status: { ...status }, tags: {}, visit: [], stack: [], ...s });
  const parentOf = (id) => Object.keys(N).find((p) => N[p].left === id || N[p].right === id) ?? null;
  const replace = (id, child) => {
    const p = parentOf(id);
    if (p === null) t.root = child; else if (N[p].left === id) N[p].left = child; else N[p].right = child;
    delete N[id];
    delete status[id];
    return p;
  };
  snap({
    kind: 'start', cur: null, lines: [],
    title: `Delete ${key}`,
    text: `First find ${key} exactly like a search. How to remove it depends on its children: with at most one, its child simply takes its place. With two, borrow the next value up (the smallest in its right subtree): it fits between the two sides, and removing it from there is the easy case.`,
    calc: [`tree: ${showTree(tree)}`],
  });
  let cur = t.root;
  while (cur !== null && N[cur].v !== key) {
    const n = N[cur];
    status[cur] = 'path';
    const side = key < n.v ? 'left' : 'right';
    snap({ kind: 'go', cur, lines: ['go'], title: `${key} ${key < n.v ? '<' : '>'} ${n.v}: go ${side}`, text: `${key} can only be in ${n.v}'s ${side} subtree. ${n[side] === null ? `There is no ${side} child.` : `Move to ${N[n[side]].v}.`}`, calc: [`${key} ${key < n.v ? '<' : '>'} ${n.v} → ${side}`] });
    cur = n[side];
  }
  if (cur === null) {
    snap({ kind: 'missing', cur: null, lines: ['go'], answer: `${key} is not in the tree`, title: `${key} is not in the tree`, text: `The search fell off the tree, so there is nothing to delete: return the root unchanged.`, calc: ['return root'] });
    return steps;
  }
  const n = N[cur];
  status[cur] = 'bad';
  const kids = [n.left, n.right].filter((c) => c !== null);
  if (kids.length < 2) {
    snap({ kind: 'found', cur, lines: ['go', 'one'], title: `Found ${key}: ${kids.length ? 'one child' : 'a leaf'}`, text: kids.length ? `${key} has only one child, ${N[kids[0]].v}. Everything under ${N[kids[0]].v} is on the same side of ${key}'s parent as ${key} was, so ${N[kids[0]].v} can take ${key}'s place directly.` : `${key} has no children: just cut it off.`, calc: [`${key}: ${kids.length} child${kids.length === 1 ? '' : 'ren'}`] });
    const child = kids[0] ?? null;
    const p = replace(cur, child);
    if (child !== null) status[child] = 'hit';
    snap({ kind: 'splice', cur: child, lines: ['one'], answer: `[${showTree(toLevelOrder(t))}]`, title: child !== null ? `${N[child].v} takes ${key}'s place` : `${key} removed`, text: `${p === null ? 'The root is replaced.' : `${N[p].v} now points ${child === null ? 'at nothing there' : `at ${N[child].v}`}.`} Inorder reads ${list(inorder(t).map((k) => N[k].v))}: still sorted. Cost: the length of the path, O(h).`, calc: [`[${showTree(toLevelOrder(t))}]`] });
    return steps;
  }
  snap({ kind: 'found', cur, lines: ['go', 'one'], title: `Found ${key}: two children`, text: `${key} has two subtrees, and only one node can sit in its place. It must be bigger than everything on the left and smaller than everything on the right: the smallest value in the right subtree fits exactly.`, calc: [`${key}: 2 children`] });
  let s = n.right;
  const walk = [];
  for (;;) {
    status[s] = 'path';
    walk.push(N[s].v);
    if (N[s].left === null) break;
    snap({ kind: 'go', cur: s, lines: ['succ'], title: `${N[s].v} has a left child: keep going left`, text: `Something smaller than ${N[s].v} is still in ${key}'s right subtree. The smallest is at the end of the left turns.`, calc: [`s = ${N[s].v} → ${N[N[s].left].v}`] });
    s = N[s].left;
  }
  status[s] = 'hit';
  snap({ kind: 'go', cur: s, lines: ['succ'], title: `Successor: ${N[s].v}`, text: `${N[s].v} has no left child, so it is the smallest value right of ${key}: the next value up in sorted order. It is bigger than all of ${key}'s left side and smaller than the rest of its right side.`, calc: [`successor = ${N[s].v}`] });
  const sv = N[s].v;
  n.v = sv;
  status[cur] = 'hit';
  const sr = N[s].right;
  replace(s, sr);
  if (sr !== null) status[sr] = 'path';
  snap({ kind: 'splice', cur, lines: ['copy'], answer: `[${showTree(toLevelOrder(t))}]`, title: `Copy ${sv} up, then remove the old ${sv}`, text: `${key}'s node now holds ${sv}. The old ${sv} had no left child, so removing it is the easy case: ${sr === null ? 'it was a leaf, just cut it' : `its right child ${N[sr].v} takes its place`}. Inorder reads ${list(inorder(t).map((k) => N[k].v))}: still sorted. Cost: one path down, O(h).`, calc: [`[${showTree(toLevelOrder(t))}]`] });
  return steps;
}

function bstIter(tree) {
  const t = buildTree(tree);
  const N = t.nodes;
  const status = {};
  const stack = [];
  const visit = [];
  const steps = [];
  let pushes = 0;
  const snap = (s) => steps.push({ t: cloneTree(t), status: { ...status }, tags: {}, visit: [...visit], stack: [...stack], pushes, ...s });
  const pushLeft = (id) => { const got = []; while (id !== null) { stack.push(id); status[id] = 'path'; got.push(N[id].v); pushes++; id = N[id].left; } return got; };
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'An inorder walk you can pause',
    text: 'Recursion can\'t stop halfway and resume on the next call. An explicit stack can: it holds the nodes whose left side is done but which haven\'t been returned yet. The top is always the next smallest value.',
    calc: [`tree: ${showTree(tree)}`],
  });
  const got = pushLeft(t.root);
  snap({ kind: 'left', cur: stack.at(-1), lines: ['init', 'left'], title: `Constructor: push ${got.join(', ')}`, text: `Walk left from the root, pushing every node. The last one, ${got.at(-1)}, has no left child: it is the smallest value. Nothing else is touched yet: the stack holds one path, at most h nodes.`, calc: [`stack: ${list(stack.map((id) => N[id].v))}`] });
  while (stack.length) {
    const id = stack.pop();
    visit.push(id);
    status[id] = 'done';
    const r = N[id].right;
    snap({ kind: 'call', cur: id, lines: ['next'], title: `next() → ${N[id].v}`, text: `Pop ${N[id].v}: everything smaller was returned already. ${r === null ? `It has no right subtree, so the new top${stack.length ? `, ${N[stack.at(-1)].v},` : ''} is the next value.` : `Its right subtree holds the values just above it, so before returning, push the left path starting at ${N[r].v}.`}`, calc: [`return ${N[id].v}`, `hasNext() = ${stack.length > 0 || r !== null}`] });
    if (r !== null) {
      const g = pushLeft(r);
      snap({ kind: 'left', cur: stack.at(-1), lines: ['next', 'left'], title: `Push ${g.join(', ')} from ${N[id].v}'s right`, text: `${g.at(-1)} is now on top: the smallest value bigger than ${N[id].v}. The next call pops it.`, calc: [`stack: ${list(stack.map((x) => N[x].v))}`] });
    }
  }
  const n = Object.keys(N).length;
  snap({
    kind: 'done', cur: null, lines: ['has'], answer: list(visit.map((id) => N[id].v)),
    title: `hasNext() = false: ${list(visit.map((id) => N[id].v))}`,
    text: `${n} calls to next() pushed ${n} nodes in total and popped each once. One call may push a whole path, but over all calls that is 2n stack operations for n calls: O(1) per call on average. The stack never held more than one root-to-leaf path: O(h) memory.`,
    calc: [`${n} next() calls, ${pushes} pushes`],
  });
  return steps;
}

function bstRecover(tree) {
  const t = buildTree(tree);
  const N = t.nodes;
  const status = {};
  const order = inorder(t);
  const steps = [];
  const marks = {};
  const snap = ({ strip, ...s }) => steps.push({ t: cloneTree(t), status: { ...status }, tags: {}, visit: [], stack: [], ...s, strip: { label: 'inorder', items: order.map((id) => N[id].v), marks: { ...marks }, ...strip } });
  snap({
    kind: 'start', cur: null, lines: [], strip: {},
    title: 'Two values were swapped',
    text: 'Inorder lists a BST in increasing order. Swapping two values breaks that order in one or two places: a drop, where a value is smaller than the one before it. Walk inorder keeping the previous node and note the drops.',
    calc: [`inorder: ${list(order.map((id) => N[id].v))}`],
  });
  let first = null, second = null, prev = null;
  order.forEach((id, k) => {
    const drop = prev !== null && N[prev].v > N[id].v;
    status[id] = 'done';
    if (drop) {
      const isFirst = first === null;
      if (isFirst) first = prev;
      second = id;
      Object.keys(marks).forEach((m) => { if (marks[m] === 'bad' && order[m] !== first) delete marks[m]; });
      marks[order.indexOf(first)] = 'bad';
      marks[k] = 'bad';
      status[first] = 'bad';
      Object.keys(status).forEach((x) => { if (status[x] === 'bad' && x !== first) status[x] = 'done'; });
      status[id] = 'bad';
      snap({
        kind: 'drop', cur: id, lines: isFirst ? ['walk', 'first', 'second'] : ['walk', 'second'], strip: { cur: k },
        title: `Drop: ${N[prev].v} > ${N[id].v}`,
        text: isFirst
          ? `${N[prev].v} comes before ${N[id].v} but is bigger. At the first drop, the earlier value is the one out of place (a too-big value moved left): first = ${N[prev].v}. Keep second = ${N[id].v} for now, in case there is no other drop.`
          : `A second drop. Here the later value is the one out of place (a too-small value moved right): second = ${N[id].v}, replacing the candidate from the first drop. first stays ${N[first].v}.`,
        calc: [`first = ${N[first].v}`, `second = ${N[id].v}`],
      });
    } else if (prev !== null) {
      snap({ kind: 'check', cur: id, lines: ['walk', 'prev'], strip: { cur: k }, title: `${N[prev].v} < ${N[id].v}: in order`, text: `${N[id].v} is bigger than the value before it, as inorder should be. Move on.`, calc: [`prev = ${N[id].v}`] });
    } else {
      snap({ kind: 'check', cur: id, lines: ['prev'], strip: { cur: k }, title: `Start at ${N[id].v}`, text: `${N[id].v} is the leftmost node, first in inorder. Nothing to compare with yet.`, calc: [`prev = ${N[id].v}`] });
    }
    prev = id;
  });
  const a = N[first].v, b = N[second].v;
  N[first].v = b;
  N[second].v = a;
  status[first] = 'hit';
  status[second] = 'hit';
  Object.keys(marks).forEach((m) => delete marks[m]);
  marks[order.indexOf(first)] = 'hit';
  marks[order.indexOf(second)] = 'hit';
  const adjacent = order.indexOf(second) === order.indexOf(first) + 1;
  snap({
    kind: 'swap', cur: null, lines: ['swap'], strip: {}, answer: `[${showTree(toLevelOrder(t))}]`,
    title: `Swap ${a} and ${b} back`,
    text: `${adjacent ? 'There was only one drop: the two swapped values were neighbours in sorted order, so first and second came from the same drop.' : 'Two drops: the too-big value was at the first, the too-small one at the second.'} Swapping their values back makes inorder sorted again, without moving any node. O(n) time; O(h) for the walk, or O(1) with Morris traversal.`,
    calc: [`inorder: ${list(order.map((id) => N[id].v))}`],
  });
  return steps;
}

export function bstMore(input) {
  if (input.mode === 'sorted') return bstSorted(input.nums);
  if (input.mode === 'delete') return bstDelete(input.tree, input.x);
  if (input.mode === 'iter') return bstIter(input.tree);
  return bstRecover(input.tree);
}

export function parseBst(values, input) {
  if (input.mode === 'sorted') {
    const r = parseInts(values.nums, { min: -99, max: 99, minLen: 1, maxLen: 13, name: 'nums' });
    if (r.error) return r;
    if (r.arr.some((v, k) => k > 0 && v <= r.arr[k - 1])) return { error: 'nums must be strictly increasing.' };
    return { input: { mode: 'sorted', nums: r.arr } };
  }
  const tr = parseTreeText(values.tree, { maxNodes: 13, maxDepth: 5 });
  if (tr.error) return tr;
  const t = buildTree(tr.arr);
  const vals = inorder(t).map((id) => t.nodes[id].v);
  if (input.mode === 'recover') {
    if (new Set(vals).size !== vals.length) return { error: 'Use distinct values.' };
    const sorted = [...vals].sort((a, b) => a - b);
    const off = vals.filter((v, k) => v !== sorted[k]).length;
    if (off !== 2) return { error: 'Give a BST with exactly two values swapped (inorder sorted except for two values).' };
    return { input: { mode: 'recover', tree: tr.arr } };
  }
  if (input.mode !== 'validate') {
    if (!isBst(t)) return { error: 'That tree is not a BST (in-order must be strictly increasing). Try the Validate example for broken trees.' };
  }
  if (input.mode === 'validate' || input.mode === 'iter') return { input: { mode: input.mode, tree: tr.arr } };
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
  if (input.mode === 'sorted') {
    const vals = g.shuffle(Array.from({ length: 50 }, (_, k) => k - 20)).slice(0, g.int(3, 12)).sort((a, b) => a - b);
    return { mode: 'sorted', nums: vals };
  }
  if (input.mode === 'iter') return { mode: 'iter', tree: randomTreeArr(rand, { n: g.int(4, 10), lo: 1, hi: 30, bst: true, maxDepth: 4 }) };
  if (input.mode === 'recover') {
    const tr = buildTree(randomTreeArr(rand, { n: g.int(3, 10), lo: 1, hi: 30, bst: true, maxDepth: 4 }));
    const ids = inorder(tr);
    const a = g.int(0, ids.length - 2);
    const b = g.bool(0.35) ? a + 1 : g.int(a + 1, ids.length - 1);
    const va = tr.nodes[ids[a]].v;
    tr.nodes[ids[a]].v = tr.nodes[ids[b]].v;
    tr.nodes[ids[b]].v = va;
    return { mode: 'recover', tree: toLevelOrder(tr) };
  }
  if (input.mode === 'delete') {
    const tree = randomTreeArr(rand, { n: g.int(4, 10), lo: 1, hi: 30, bst: true, maxDepth: 4 });
    const vals = inorder(buildTree(tree)).map((id) => buildTree(tree).nodes[id].v);
    return { mode: 'delete', tree, x: g.bool(0.85) ? g.pick(vals) : g.int(1, 30) };
  }
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

const PERFECT = [1, 3, 7, 15];

export function parseTreeBfs(values, input) {
  const tr = parseTreeText(values.tree);
  if (tr.error) return tr;
  if (input.mode === 'next' && (!PERFECT.includes(tr.arr.length) || tr.arr.includes(null) || tr.arr.length < 3)) {
    return { error: 'This problem\'s tree is perfect: give 3, 7 or 15 values with no nulls, e.g. 1, 2, 3, 4, 5, 6, 7.' };
  }
  return { input: { mode: input.mode, tree: tr.arr } };
}

export function randomTreeBfs(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'next') return { mode: 'next', tree: Array.from({ length: g.pick([3, 7, 7, 15]) }, () => g.int(1, 20)) };
  const neg = input.mode === 'max' || input.mode === 'avg';
  return { mode: input.mode, tree: randomTreeArr(rand, { n: g.int(5, 11), lo: neg ? -9 : 1, hi: 9 }) };
}

export { showTree };
