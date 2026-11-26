/**
 * More tree DFS step-throughs (the model behind <TreeWalkViz>): comparing, changing, rebuilding and
 * writing out trees, one decision per step. Pure, so scripts/viz-check.mjs can test it.
 *
 * Modes:
 *   same       walk two trees together, comparing values and shapes              (Same Tree)
 *   symmetric  compare the two halves as mirror images                           (Symmetric Tree)
 *   invert     swap the children of every node, bottom-up                        (Invert Binary Tree)
 *   balanced   heights bottom-up; −1 means "already unbalanced"                  (Balanced Binary Tree)
 *   order      record nodes in inorder, preorder or postorder (which)            (the three traversals)
 *   subtree    try every node of root as the start of subRoot                     (Subtree of Another Tree)
 *   build      preorder gives the root, inorder splits the rest                  (Construct from Preorder and Inorder)
 *   delete     postorder: clean the children, then decide about the node          (Delete Leaves With a Given Value)
 *   serialize  preorder with # for nulls, then read it back                       (Serialize and Deserialize)
 * A step: { kind, title, text, calc, lines, trees: [{ t, label, cls, badge }], strips?: [{ label, items, cur?, band?, marks? }],
 *           card?, stats, answer? }  (cls: id → [class], badge: id → { text, tone })
 */
import { buildTree, cloneTree, toLevelOrder, randomTreeArr } from './trees.js';
import { parseInt1, rng } from './util.js';

export const TREE_WALK = {
  same: { label: 'Same tree?', input: { mode: 'same', p: [1, 2, 3], q: [1, 2, 3] } },
  differ: { label: '[1,2] vs [1,null,2]', input: { mode: 'same', p: [1, 2], q: [1, null, 2] } },
  symmetric: { label: 'Symmetric?', input: { mode: 'symmetric', tree: [1, 2, 2, 3, 4, 4, 3] } },
  invert: { label: 'Invert', input: { mode: 'invert', tree: [4, 2, 7, 1, 3, 6, 9] } },
  balanced: { label: 'Balanced?', input: { mode: 'balanced', tree: [1, 2, 2, 3, 3, null, null, 4, 4] } },
  inorder: { label: 'Inorder', input: { mode: 'order', which: 'in', tree: [1, 2, 3, 4, 5, null, 6] } },
  preorder: { label: 'Preorder', input: { mode: 'order', which: 'pre', tree: [1, 2, 3, 4, 5, null, 6] } },
  postorder: { label: 'Postorder', input: { mode: 'order', which: 'post', tree: [1, 2, 3, 4, 5, null, 6] } },
  subtree: { label: 'Subtree?', input: { mode: 'subtree', tree: [3, 4, 5, 1, 2], sub: [4, 1, 2] } },
  build: { label: 'Build from pre + in', input: { mode: 'build', pre: [3, 9, 20, 15, 7], ino: [9, 3, 15, 20, 7] } },
  delete: { label: 'Delete leaves = 2', input: { mode: 'delete', tree: [1, 2, 3, 2, null, 2, 4], target: 2 } },
  serialize: { label: 'Serialize', input: { mode: 'serialize', tree: [1, 2, 3, null, null, 4, 5] } },
  zigzag: { label: 'Longest zigzag', input: { mode: 'zigzag', tree: [1, null, 2, 3, 4, null, null, 5, 6, null, 7] } },
  maxpath: { label: 'Maximum path sum', input: { mode: 'maxpath', tree: [-10, 9, 20, null, null, 15, 7] } },
  cameras: { label: 'Cameras', input: { mode: 'cameras', tree: [0, 0, null, 0, null, 0, null, null, 0] } },
};

const ORDER = { in: 'inorder', pre: 'preorder', post: 'postorder' };

export const treeWalkCode = (input) => ({
  same: [
    ['both', 'if (p == null && q == null) return true;'],
    ['one', 'if (p == null || q == null) return false;          // one side has a node, the other doesn\'t'],
    ['val', 'if (p.val != q.val) return false;'],
    ['rec', 'return same(p.left, q.left) && same(p.right, q.right);'],
  ],
  symmetric: [
    ['start', 'return root == null || mirror(root.left, root.right);'],
    ['both', 'boolean mirror(TreeNode a, TreeNode b) { if (a == null && b == null) return true;'],
    ['one', '    if (a == null || b == null || a.val != b.val) return false;'],
    ['rec', '    return mirror(a.left, b.right) && mirror(a.right, b.left); }   // outside with outside'],
  ],
  invert: [
    ['base', 'if (n == null) return null;'],
    ['rec', 'invert(n.left); invert(n.right);'],
    ['swap', 'TreeNode t = n.left; n.left = n.right; n.right = t;'],
    ['ret', 'return n;'],
  ],
  balanced: [
    ['base', 'if (n == null) return 0;'],
    ['rec', 'int l = height(n.left); if (l == -1) return -1;    // already unbalanced: pass it up'],
    ['rec', 'int r = height(n.right); if (r == -1) return -1;'],
    ['check', 'if (Math.abs(l - r) > 1) return -1;'],
    ['ret', 'return 1 + Math.max(l, r);'],
  ],
  order: [
    ['base', 'if (n == null) return;'],
    ...(input.which === 'pre' ? [['visit', 'out.add(n.val);                 // the node first']] : []),
    ['left', 'walk(n.left);'],
    ...(input.which === 'in' ? [['visit', 'out.add(n.val);                 // between its two subtrees']] : []),
    ['right', 'walk(n.right);'],
    ...(input.which === 'post' ? [['visit', 'out.add(n.val);                 // after both subtrees']] : []),
  ],
  subtree: [
    ['null', 'if (root == null) return false;'],
    ['try', 'if (same(root, subRoot)) return true;               // does subRoot start here?'],
    ['rec', 'return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);'],
  ],
  build: [
    ['map', 'Map<Integer, Integer> at = value → inorder index;'],
    ['base', 'TreeNode build(int lo, int hi) { if (lo > hi) return null;   // inorder range [lo, hi]'],
    ['root', '    TreeNode n = new TreeNode(pre[next++]); int m = at.get(n.val);'],
    ['rec', '    n.left = build(lo, m - 1); n.right = build(m + 1, hi); return n; }'],
  ],
  delete: [
    ['base', 'if (n == null) return null;'],
    ['rec', 'n.left = del(n.left, target); n.right = del(n.right, target);   // children first'],
    ['check', 'if (n.left == null && n.right == null && n.val == target) return null;'],
    ['ret', 'return n;'],
  ],
  serialize: [
    ['ser', 'void ser(TreeNode n) { if (n == null) { out.add("#"); return; }'],
    ['ser', '    out.add(n.val); ser(n.left); ser(n.right); }'],
    ['des', 'TreeNode des() { String s = tokens[next++]; if (s.equals("#")) return null;'],
    ['des', '    TreeNode n = new TreeNode(s); n.left = des(); n.right = des(); return n; }'],
  ],
  zigzag: [
    ['start', 'go(root.left, LEFT, 1); go(root.right, RIGHT, 1);'],
    ['visit', 'go(n, dir, len): best = max(best, len);'],
    ['turn', '  go(n.left, LEFT, dir == RIGHT ? len + 1 : 1);   // turning extends, going straight restarts'],
    ['turn', '  go(n.right, RIGHT, dir == LEFT ? len + 1 : 1);'],
  ],
  maxpath: [
    ['base', 'gain(null) = 0;'],
    ['gain', 'l = max(0, gain(n.left)); r = max(0, gain(n.right));     // a negative branch is dropped'],
    ['bend', 'best = max(best, n.val + l + r);                          // the path that bends here'],
    ['ret', 'return n.val + max(l, r);                                  // a path through the parent can use one side'],
  ],
  cameras: [
    ['base', 'state(null) = COVERED;'],
    ['need', 'a child NEEDS cover → put a camera here: cameras++, return CAMERA;'],
    ['cov', 'a child has a CAMERA → return COVERED;'],
    ['ask', 'otherwise → return NEEDS (let the parent cover me)'],
    ['root', 'if (state(root) == NEEDS) cameras++;'],
  ],
})[input.mode];

const lv = (t) => `[${toLevelOrder(t).map((v) => (v === null ? 'null' : v)).join(',')}]`;
const ids = (t, id, out = []) => { if (id === null) return out; out.push(id); ids(t, t.nodes[id].left, out); ids(t, t.nodes[id].right, out); return out; };
const isLeaf = (t, id) => t.nodes[id].left === null && t.nodes[id].right === null;

function recorder() {
  const steps = [];
  const snap = (x) => steps.push({ stats: [], ...x, trees: x.trees.map((tr) => ({ ...tr, t: cloneTree(tr.t), cls: { ...(tr.cls ?? {}) }, badge: { ...(tr.badge ?? {}) } })) });
  return { steps, snap };
}

// ---------------------------------------------------------------- same tree

function sameRun({ p, q }) {
  const R = recorder();
  const A = buildTree(p), B = buildTree(q);
  const ca = {}, cb = {};
  const T = () => [{ t: A, label: 'p', cls: ca }, { t: B, label: 'q', cls: cb }];
  R.snap({ kind: 'start', trees: T(), lines: [], title: 'Walk both trees together', text: 'Two trees are the same when both roots are missing, or both exist with equal values and their left subtrees match and their right subtrees match. Compare node by node, in step.', calc: [`p = [${p.join(', ')}]`, `q = [${q.join(', ')}]`] });
  let ok = true;
  const rec = (a, b, where) => {
    if (!ok) return;
    if (a === null && b === null) return;
    if (a === null || b === null) {
      ok = false;
      if (a) ca[a] = ['bad']; if (b) cb[b] = ['bad'];
      R.snap({ kind: 'differ', trees: T(), card: { q: where, a: `${a ? 'p' : 'q'} has a node, ${a ? 'q' : 'p'} has none`, tone: 'bad' }, lines: ['one'], title: `Different shapes at ${where}`, text: `${a ? `p has ${A.nodes[a].v}` : 'p has nothing'} here and ${b ? `q has ${B.nodes[b].v}` : 'q has nothing'}. Same values elsewhere don't help: the shapes differ.`, calc: ['one side is null → false'] });
      return;
    }
    if (A.nodes[a].v !== B.nodes[b].v) {
      ok = false; ca[a] = ['bad']; cb[b] = ['bad'];
      R.snap({ kind: 'differ', trees: T(), card: { q: `${A.nodes[a].v} vs ${B.nodes[b].v}`, a: 'different values', tone: 'bad' }, lines: ['val'], title: `${where}: ${A.nodes[a].v} ≠ ${B.nodes[b].v}`, text: 'Corresponding nodes hold different values: stop and return false.', calc: [`${A.nodes[a].v} != ${B.nodes[b].v} → false`] });
      return;
    }
    ca[a] = ['done']; cb[b] = ['done'];
    R.snap({ kind: 'match', trees: T(), card: { q: `${A.nodes[a].v} = ${B.nodes[b].v}`, a: 'compare the children next', tone: 'yes' }, lines: ['both', 'one', 'val', 'rec'], title: `${where}: both ${A.nodes[a].v}`, text: 'Equal here. Now both left subtrees must match, and both right subtrees.', calc: [`${A.nodes[a].v} == ${B.nodes[b].v}`] });
    rec(A.nodes[a].left, B.nodes[b].left, `left of ${A.nodes[a].v}`);
    rec(A.nodes[a].right, B.nodes[b].right, `right of ${A.nodes[a].v}`);
  };
  rec(A.root, B.root, 'the root');
  R.snap({ kind: 'done', trees: T(), lines: ['rec'], answer: String(ok), title: ok ? 'Every node matched: the same tree' : 'Not the same tree', text: ok ? 'Every pair of corresponding nodes exists on both sides with the same value. O(min(n, m)): the walk stops at the first difference.' : 'One difference is enough; the walk stopped there.', calc: [`return ${ok}`] });
  return R.steps;
}

// ---------------------------------------------------------------- symmetric

function symmetricRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const cls = {};
  const T = () => [{ t, label: 'tree', cls }];
  R.snap({ kind: 'start', trees: T(), lines: ['start'], title: 'Is the left half a mirror of the right half?', text: 'Mirror images match outside with outside and inside with inside: a.left with b.right, and a.right with b.left. Walk the two halves together that way.', calc: [`tree = [${tree.join(', ')}]`] });
  let ok = true;
  const N = t.nodes;
  const rec = (a, b) => {
    if (!ok) return;
    if (a === null && b === null) return;
    if (a === null || b === null || N[a].v !== N[b].v) {
      ok = false;
      if (a) cls[a] = ['bad']; if (b) cls[b] = ['bad'];
      R.snap({ kind: 'differ', trees: T(), card: { q: `${a ? N[a].v : 'null'} vs ${b ? N[b].v : 'null'}`, a: 'not mirror images', tone: 'bad' }, lines: ['one'], title: `${a ? N[a].v : 'nothing'} faces ${b ? N[b].v : 'nothing'}: not symmetric`, text: 'Mirror positions must hold equal values (or both be empty).', calc: ['→ false'] });
      return;
    }
    cls[a] = ['done']; cls[b] = ['done'];
    R.snap({ kind: 'match', trees: T(), card: { q: `${N[a].v} = ${N[b].v}`, a: 'outside pair, then inside pair', tone: 'yes' }, lines: ['both', 'one', 'rec'], title: a === b ? `The middle: ${N[a].v}` : `${N[a].v} mirrors ${N[b].v}`, text: 'Equal. Next compare the outer children (left of the left one with right of the right one), then the inner children.', calc: [`${N[a].v} == ${N[b].v}`] });
    rec(N[a].left, N[b].right);
    rec(N[a].right, N[b].left);
  };
  if (t.root !== null) { cls[t.root] = ['done']; rec(N[t.root].left, N[t.root].right); }
  R.snap({ kind: 'done', trees: T(), lines: ['start'], answer: String(ok), title: ok ? 'Symmetric' : 'Not symmetric', text: ok ? 'Every node has an equal partner in the mirror position. O(n).' : 'One mismatched pair is enough.', calc: [`return ${ok}`] });
  return R.steps;
}

// ---------------------------------------------------------------- invert

function invertRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const cls = {};
  const T = () => [{ t, label: 'tree', cls }];
  R.snap({ kind: 'start', trees: T(), lines: [], title: 'Mirror the tree: swap the children of every node', text: 'Mirroring a tree means mirroring both subtrees and swapping them. Every node needs its two children swapped exactly once; here the children are done first, then the node.', calc: [`tree = [${tree.join(', ')}]`] });
  const N = t.nodes;
  const rec = (id) => {
    if (id === null) return;
    rec(N[id].left); rec(N[id].right);
    if (isLeaf(t, id)) { cls[id] = ['done']; return; }
    const [l, r] = [N[id].left, N[id].right];
    N[id].left = r; N[id].right = l;
    cls[id] = ['cur'];
    R.snap({ kind: 'swap', trees: T(), card: { q: `node ${N[id].v}`, a: `${l ? N[l].v : 'null'} ↔ ${r ? N[r].v : 'null'}`, tone: 'info' }, lines: ['rec', 'swap'], title: `Swap the children of ${N[id].v}`, text: `Both subtrees below ${N[id].v} are already mirrored; now swap them: ${r ? N[r].v : 'nothing'} goes left and ${l ? N[l].v : 'nothing'} goes right.`, calc: [`left = ${r ? N[r].v : 'null'}, right = ${l ? N[l].v : 'null'}`] });
    cls[id] = ['done'];
  };
  rec(t.root);
  R.snap({ kind: 'done', trees: T(), lines: ['ret'], answer: lv(t), title: `Inverted: ${lv(t)}`, text: 'Each node was visited once and its children swapped once: O(n). The order of visits doesn\'t matter; a BFS with a queue works too.', calc: [`return ${lv(t)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- balanced

function balancedRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const cls = {}, badge = {};
  const T = () => [{ t, label: 'tree', cls, badge }];
  const N = t.nodes;
  R.snap({ kind: 'start', trees: T(), lines: [], title: 'Is every node balanced?', text: 'A node is balanced when its two subtree heights differ by at most 1. Compute each height once, bottom-up, from the children\'s heights; the moment a node is unbalanced, return −1 and pass it straight up.', calc: [`tree = [${tree.join(', ')}]`] });
  let failed = false;
  const h = (id) => {
    if (id === null) return 0;
    const l = h(N[id].left);
    if (l === -1) { cls[id] = ['skip']; badge[id] = { text: '−1', tone: 'danger' }; R.snap({ kind: 'pass', trees: T(), card: { q: `node ${N[id].v}`, a: 'left said −1 → pass it up', tone: 'bad' }, lines: ['rec'], title: `${N[id].v}: the left side is already unbalanced`, text: 'No need to look at the right side or compare heights: the answer is already false. Pass −1 up.', calc: ['return −1'] }); return -1; }
    const r = h(N[id].right);
    if (r === -1) { cls[id] = ['skip']; badge[id] = { text: '−1', tone: 'danger' }; R.snap({ kind: 'pass', trees: T(), card: { q: `node ${N[id].v}`, a: 'right said −1 → pass it up', tone: 'bad' }, lines: ['rec'], title: `${N[id].v}: the right side is already unbalanced`, text: 'Pass −1 straight up.', calc: ['return −1'] }); return -1; }
    if (Math.abs(l - r) > 1) {
      failed = true; cls[id] = ['bad']; badge[id] = { text: '−1', tone: 'danger' };
      R.snap({ kind: 'unbalanced', trees: T(), card: { q: `heights ${l} and ${r}`, a: `differ by ${Math.abs(l - r)} > 1`, tone: 'bad' }, lines: ['check'], title: `${N[id].v} is unbalanced: ${l} vs ${r}`, text: `Its subtrees are ${l} and ${r} tall, more than 1 apart. Return −1, meaning "unbalanced", instead of a height.`, calc: [`|${l} − ${r}| = ${Math.abs(l - r)} > 1 → −1`] });
      return -1;
    }
    const v = 1 + Math.max(l, r);
    cls[id] = ['done']; badge[id] = { text: `h${v}` };
    R.snap({ kind: 'height', trees: T(), card: { q: `heights ${l} and ${r}`, a: `fine → height ${v}`, tone: 'yes' }, lines: ['rec', 'check', 'ret'], title: `${N[id].v}: heights ${l} and ${r}, so its height is ${v}`, text: isLeaf(t, id) ? 'A leaf: both sides are empty (height 0).' : `They differ by ${Math.abs(l - r)} ≤ 1: balanced here. Its own height is 1 + max(${l}, ${r}).`, calc: [`return 1 + max(${l}, ${r}) = ${v}`] });
    return v;
  };
  const top = h(t.root);
  const ok = top !== -1;
  R.snap({ kind: 'done', trees: T(), lines: ['ret'], answer: String(ok), title: ok ? 'Balanced' : 'Not balanced', text: ok ? 'Every node passed, each height computed once: O(n). Recomputing heights from every node separately would be O(n²).' : `${failed ? 'One unbalanced node' : 'An unbalanced node'} is enough; the −1 travelled straight up to the root.`, calc: [`return ${ok}`] });
  return R.steps;
}

// ---------------------------------------------------------------- traversals

function orderRun({ tree, which }) {
  const R = recorder();
  const t = buildTree(tree);
  const cls = {}, badge = {};
  const out = [];
  const N = t.nodes;
  const T = () => [{ t, label: 'tree', cls, badge }];
  const S = () => [{ label: ORDER[which], items: out.length ? [...out] : ['·'] }];
  const rule = { in: 'left subtree, the node, right subtree', pre: 'the node, left subtree, right subtree', post: 'left subtree, right subtree, the node' }[which];
  R.snap({ kind: 'start', trees: T(), strips: S(), lines: [], title: `${ORDER[which][0].toUpperCase()}${ORDER[which].slice(1)}: ${rule}`, text: `Every node follows the same rule: ${rule}. The only difference between the three orders is when the node itself is written down.`, calc: [`tree = [${tree.join(', ')}]`] });
  const why = (id) => {
    const n = N[id];
    if (which === 'pre') return `First visit to ${n.v}: preorder writes the node before looking at its children.`;
    if (which === 'in') return n.left === null ? `${n.v} has no left subtree, so it is written straight away, before its right side.` : `The left subtree of ${n.v} is finished, so ${n.v} is written now, before its right side.`;
    return isLeaf(t, id) ? `${n.v} is a leaf: nothing below it, so it is written right away.` : `Both subtrees of ${n.v} are finished, so ${n.v} is written last.`;
  };
  const visit = (id) => {
    cls[id] = ['cur'];
    out.push(N[id].v);
    badge[id] = { text: String(out.length) };
    R.snap({ kind: 'record', trees: T(), strips: S(), lines: ['visit'], title: `Write ${N[id].v}`, text: why(id), calc: [`out = [${out.join(', ')}]`] });
    cls[id] = ['done'];
  };
  const walk = (id) => {
    if (id === null) return;
    cls[id] = ['active'];
    if (which === 'pre') visit(id);
    walk(N[id].left);
    if (which === 'in') visit(id);
    walk(N[id].right);
    if (which === 'post') visit(id);
  };
  walk(t.root);
  R.snap({ kind: 'done', trees: T(), strips: S(), lines: ['base'], answer: `[${out.join(', ')}]`, title: `${ORDER[which]}: [${out.join(', ')}]`, text: `Each node is written once: O(n). Iteratively, an explicit stack replaces the call stack${which === 'post' ? ' (or produce node, right, left with a stack and reverse it)' : ''}.`, calc: [`return [${out.join(', ')}]`] });
  return R.steps;
}

// ---------------------------------------------------------------- subtree

function subtreeRun({ tree, sub }) {
  const R = recorder();
  const t = buildTree(tree), s = buildTree(sub);
  const N = t.nodes, M = s.nodes;
  const cls = {};
  const T = () => [{ t, label: 'root', cls }, { t: s, label: 'subRoot', cls: {} }];
  R.snap({ kind: 'start', trees: T(), lines: [], title: 'Does subRoot appear somewhere in root, with everything below it?', text: 'A subtree is a node with all of its descendants. So try each node of root as the starting point and check whether the tree from there is exactly subRoot (Same Tree).', calc: [`root = [${tree.join(', ')}]`, `subRoot = [${sub.join(', ')}]`] });
  const firstDiff = (a, b) => {
    if (a === null && b === null) return null;
    if (a === null || b === null) return a === null ? `root has nothing where subRoot has ${M[b].v}` : `root has an extra ${N[a].v}`;
    if (N[a].v !== M[b].v) return `${N[a].v} ≠ ${M[b].v}`;
    return firstDiff(N[a].left, M[b].left) ?? firstDiff(N[a].right, M[b].right);
  };
  let found = false;
  for (const id of ids(t, t.root)) {
    const under = ids(t, id);
    Object.keys(cls).forEach((k) => { if (cls[k][0] === 'target') delete cls[k]; });
    under.forEach((u) => { cls[u] = ['target']; });
    cls[id] = ['cur'];
    const d = firstDiff(id, s.root);
    if (d === null) {
      under.forEach((u) => { cls[u] = ['hit']; });
      found = true;
      R.snap({ kind: 'match', trees: T(), card: { q: `start at ${N[id].v}`, a: 'exactly subRoot', tone: 'yes' }, lines: ['try'], title: `From ${N[id].v}: an exact match`, text: `The tree starting at ${N[id].v}, with all its descendants, is the same as subRoot.`, calc: [`same(${N[id].v}, subRoot) = true`] });
      break;
    }
    R.snap({ kind: 'try', trees: T(), card: { q: `start at ${N[id].v}`, a: d, tone: 'bad' }, lines: ['try', 'rec'], title: `From ${N[id].v}: no (${d})`, text: 'Not the same tree from here; try the next node.', calc: [`same(${N[id].v}, subRoot) = false`] });
    cls[id] = ['done'];
    under.slice(1).forEach((u) => { if (cls[u]?.[0] === 'target') delete cls[u]; });
  }
  R.snap({ kind: 'done', trees: T(), lines: ['rec'], answer: String(found), title: found ? 'subRoot is a subtree' : 'subRoot is not a subtree', text: 'Checking every start costs O(m · n). Writing both trees out with null markers and searching one string in the other (KMP) brings it to O(m + n).', calc: [`return ${found}`] });
  return R.steps;
}

// ---------------------------------------------------------------- build from preorder + inorder

function buildRun({ pre, ino }) {
  const R = recorder();
  const t = { root: null, nodes: {} };
  const cls = {};
  const at = new Map(ino.map((v, i) => [v, i]));
  let next = 0, made = 0;
  const T = () => [{ t, label: 'built so far', cls }];
  const S = (lo, hi, m) => [
    { label: 'preorder (next value = next root)', items: pre.map(String), cur: next < pre.length ? next : null, marks: Object.fromEntries(pre.map((_, i) => [i, i < next ? 'dim' : ''])) },
    { label: 'inorder (left | root | right)', items: ino.map(String), band: lo !== undefined && lo <= hi ? [lo, hi] : null, cur: m ?? null },
  ];
  R.snap({ kind: 'start', trees: T(), strips: S(), lines: ['map'], title: 'Preorder gives the root; inorder splits the rest', text: 'The first preorder value is the root. In inorder, everything before the root is its left subtree and everything after it its right subtree. Recurse on each side, taking the next preorder values as their roots. A map from value to inorder index finds each split in O(1).', calc: [`pre = [${pre.join(', ')}]`, `in = [${ino.join(', ')}]`] });
  const build = (lo, hi, parent, side) => {
    if (lo > hi) return null;
    const v = pre[next];
    const m = at.get(v);
    const id = `b${made++}`;
    t.nodes[id] = { id, v, left: null, right: null };
    if (parent === null) t.root = id; else t.nodes[parent][side] = id;
    cls[id] = ['cur'];
    const left = ino.slice(lo, m), right = ino.slice(m + 1, hi + 1);
    R.snap({ kind: 'root', trees: T(), strips: S(lo, hi, m), card: { q: `root ${v}`, a: `left [${left.join(', ')}] · right [${right.join(', ')}]`, tone: 'info' }, lines: ['root'], title: `${v} is the root of this part`, text: `The next preorder value, ${v}, is the root of inorder [${ino.slice(lo, hi + 1).join(', ')}]. It sits at inorder index ${m}: ${left.length ? `[${left.join(', ')}] is its left subtree` : 'nothing on its left'}, ${right.length ? `[${right.join(', ')}] its right subtree` : 'nothing on its right'}.`, calc: [`in[${m}] = ${v}`, `left size ${left.length}, right size ${right.length}`] });
    next++;
    cls[id] = ['done'];
    build(lo, m - 1, id, 'left');
    build(m + 1, hi, id, 'right');
    return id;
  };
  build(0, ino.length - 1, null, null);
  R.snap({ kind: 'done', trees: T(), strips: S(), lines: ['rec'], answer: lv(t), title: `Built: ${lv(t)}`, text: 'Each value became a node once, and each split was found in O(1): O(n).', calc: [`return ${lv(t)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- delete leaves with a value

function deleteRun({ tree, target }) {
  const R = recorder();
  const t = buildTree(tree);
  const cls = {};
  const N = t.nodes;
  const T = () => [{ t, label: 'tree', cls }];
  R.snap({ kind: 'start', trees: T(), lines: [], title: `Delete leaves with value ${target}, again and again`, text: 'Deleting a leaf can turn its parent into a target leaf. Postorder handles that in one pass: clean both children first, then the node can see whether it has become a leaf.', calc: [`tree = [${tree.join(', ')}]`, `target = ${target}`] });
  const del = (id, parent, side) => {
    if (id === null) return;
    del(N[id].left, id, 'left');
    del(N[id].right, id, 'right');
    const leaf = N[id].left === null && N[id].right === null;
    if (leaf && N[id].v === target) {
      cls[id] = ['bad'];
      R.snap({ kind: 'remove', trees: T(), card: { q: `${N[id].v}: a leaf`, a: `= ${target} → delete`, tone: 'bad' }, lines: ['rec', 'check'], title: `Delete ${N[id].v}`, text: `After its children were cleaned, ${N[id].v} has none left and holds ${target}: delete it${parent ? `, so ${N[parent].v} may become a leaf in turn` : ''}.`, calc: [`return null`] });
      if (parent === null) t.root = null; else N[parent][side] = null;
      delete N[id]; delete cls[id];
      return;
    }
    if (N[id].v === target) {
      cls[id] = ['target'];
      R.snap({ kind: 'keep', trees: T(), card: { q: `${N[id].v}: has children`, a: 'not a leaf → keep', tone: 'no' }, lines: ['check', 'ret'], title: `Keep ${N[id].v}: it still has a child`, text: `It holds ${target}, but something below it survived, so it isn't a leaf.`, calc: ['return n'] });
    }
    cls[id] = [...(cls[id] ?? []).filter((c) => c === 'target'), 'done'];
  };
  del(t.root, null, null);
  R.snap({ kind: 'done', trees: T(), lines: ['ret'], answer: lv(t), title: `Left: ${lv(t)}`, text: 'One postorder pass, O(n): a parent is decided only after both children, so chains of deletions happen on the way up.', calc: [`return ${lv(t)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- serialize + deserialize

function serializeRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const N = t.nodes;
  const cls = {};
  const out = [];
  const back = { root: null, nodes: {} };
  const bcls = {};
  const T = (two) => [{ t, label: 'original', cls }, ...(two ? [{ t: back, label: 'rebuilt', cls: bcls }] : [])];
  const S = (cur) => [{ label: 'the string', items: out.length ? [...out] : ['·'], cur: cur ?? null }];
  R.snap({ kind: 'start', trees: T(false), strips: S(), lines: [], title: 'Write the tree in preorder, with # for every missing child', text: 'Preorder alone is ambiguous (1, 2 could be either shape), but with a marker for every null it isn\'t: the reader always knows when a subtree has ended.', calc: [`tree = [${tree.join(', ')}]`] });
  const ser = (id, where) => {
    if (id === null) {
      out.push('#');
      R.snap({ kind: 'null', trees: T(false), strips: S(out.length - 1), lines: ['ser'], title: `# (${where} is empty)`, text: 'Write a marker for the missing child, so the reader knows this branch ends here.', calc: [`out: ${out.join(' ')}`] });
      return;
    }
    cls[id] = ['cur'];
    out.push(String(N[id].v));
    R.snap({ kind: 'write', trees: T(false), strips: S(out.length - 1), lines: ['ser'], title: `Write ${N[id].v}`, text: 'Preorder: the node first, then its left subtree, then its right subtree.', calc: [`out: ${out.join(' ')}`] });
    cls[id] = ['done'];
    ser(N[id].left, `left of ${N[id].v}`);
    ser(N[id].right, `right of ${N[id].v}`);
  };
  ser(t.root, 'the root');
  let next = 0, made = 0;
  const des = (parent, side) => {
    const s = out[next++];
    if (s === '#') {
      R.snap({ kind: 'readnull', trees: T(true), strips: S(next - 1), lines: ['des'], title: `Read #: ${parent ? `${back.nodes[parent].v} has no ${side} child` : 'empty tree'}`, text: 'A marker: this branch is empty, so go back up to the next open slot.', calc: [`token ${next - 1}: #`] });
      return;
    }
    const id = `r${made++}`;
    back.nodes[id] = { id, v: Number(s), left: null, right: null };
    if (parent === null) back.root = id; else back.nodes[parent][side] = id;
    bcls[id] = ['cur'];
    R.snap({ kind: 'read', trees: T(true), strips: S(next - 1), lines: ['des'], title: `Read ${s}: a new node${parent ? `, the ${side} child of ${back.nodes[parent].v}` : ', the root'}`, text: 'Values come in the same order they were written: the node, then everything of its left subtree, then its right subtree.', calc: [`token ${next - 1}: ${s}`] });
    bcls[id] = ['done'];
    des(id, 'left');
    des(id, 'right');
  };
  des(null, null);
  const same = lv(back) === lv(t);
  R.snap({ kind: 'done', trees: T(true), strips: S(), lines: ['des'], answer: lv(back), title: same ? 'Rebuilt exactly' : 'Rebuilt tree differs', text: `"${out.join(',')}" carries the whole shape: ${Object.keys(N).length} values and ${Object.keys(N).length + 1} # markers (a tree of n nodes has n + 1 empty child slots). O(n) both ways.`, calc: [`string = ${out.join(',')}`] });
  return R.steps;
}


// ---------------------------------------------------------------- tree DP: zigzag, maximum path sum, cameras

function zigzagRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const N = t.nodes;
  const cls = {}, badge = {};
  const T = () => [{ t, label: 'tree', cls, badge }];
  let best = 0;
  R.snap({ kind: 'start', trees: T(), lines: ['start'], title: 'The longest zigzag', text: 'Walk down from every node, passing along two things: the direction of the step that arrived here (← came as a left child, → as a right child) and the zigzag length so far. Turning the other way extends the zigzag by 1; going the same way starts a new zigzag of length 1 from the parent. Badges show the length arriving at each node.', calc: [`tree = [${tree.join(', ')}]`] });
  if (t.root !== null) { cls[t.root] = ['done']; badge[t.root] = { text: 'start' }; }
  const go = (id, dir, len) => {
    if (id === null) return;
    const better = len > best;
    best = Math.max(best, len);
    cls[id] = [better ? 'hit' : 'cur']; badge[id] = { text: `${dir === 'L' ? '←' : '→'}${len}`, tone: better ? 'success' : undefined };
    R.snap({ kind: 'turn', trees: T(), card: { q: `arrived ${dir === 'L' ? 'as a left child' : 'as a right child'}`, a: `zigzag length ${len}`, tone: better ? 'yes' : 'info' }, lines: ['visit', 'turn'], title: `${N[id].v}: zigzag of ${len}`, text: `${better ? `A new longest: ${len}.` : `Not longer than ${best}.`} Going ${dir === 'L' ? 'right' : 'left'} next turns (length ${len + 1}); going ${dir === 'L' ? 'left' : 'right'} again starts over at 1.`, calc: [`best = ${best}`] });
    cls[id] = ['done'];
    go(N[id].left, 'L', dir === 'R' ? len + 1 : 1);
    go(N[id].right, 'R', dir === 'L' ? len + 1 : 1);
  };
  if (t.root !== null) { go(N[t.root].left, 'L', 1); go(N[t.root].right, 'R', 1); }
  R.snap({ kind: 'done', trees: T(), lines: [], answer: String(best), title: `Longest zigzag: ${best}`, text: 'Every node was visited once, carrying its arriving direction and length: O(n). Starting a separate walk from every node would be O(n · h).', calc: [`return ${best}`] });
  return R.steps;
}

function maxpathRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const N = t.nodes;
  const cls = {}, badge = {};
  const T = () => [{ t, label: 'tree', cls, badge }];
  let best = -Infinity, bestAt = null;
  R.snap({ kind: 'start', trees: T(), lines: [], title: 'The largest path sum', text: 'Every path has one highest node where it bends: it comes up from the left, through that node, and down to the right. So each node computes two things. Its gain: the best path going straight down from it (only one side, so the parent can extend it). And the best path bending at it: itself plus both gains. Negative gains are dropped (counted as 0).', calc: [`tree = [${tree.join(', ')}]`] });
  const gain = (id) => {
    if (id === null) return 0;
    const lg = gain(N[id].left), rg = gain(N[id].right);
    const l = Math.max(0, lg), r = Math.max(0, rg);
    const bend = N[id].v + l + r;
    const better = bend > best;
    if (better) { if (bestAt !== null) { cls[bestAt] = ['done']; badge[bestAt] = { ...badge[bestAt], tone: undefined }; } best = bend; bestAt = id; }
    const g = N[id].v + Math.max(l, r);
    cls[id] = [better ? 'hit' : 'done']; badge[id] = { text: `g${g}`, tone: better ? 'success' : undefined };
    R.snap({ kind: 'gain', trees: T(), card: { q: `bend at ${N[id].v}`, a: `${N[id].v} + ${l} + ${r} = ${bend}`, tone: better ? 'yes' : 'info' }, lines: ['gain', 'bend', 'ret'], title: `${N[id].v}: bend ${bend}, gain ${g}`, text: `${isLeaf(t, id) ? 'A leaf: no branches below.' : `Branch gains below: left ${lg}${lg < 0 ? ' (negative, dropped)' : ''}, right ${rg}${rg < 0 ? ' (negative, dropped)' : ''}.`} A path bending here sums to ${bend}${better ? ', the best so far' : ''}. Upwards it can only continue one side: gain ${g}.`, calc: [`best = ${best}`] });
    if (!better) cls[id] = ['done'];
    else { cls[id] = ['hit']; }
    return g;
  };
  gain(t.root);
  if (bestAt !== null) cls[bestAt] = ['hit'];
  R.snap({ kind: 'done', trees: T(), lines: ['bend'], answer: String(best), title: `Maximum path sum: ${best}`, text: `The best path bends at ${N[bestAt].v}. Each node returned one number and updated the best once: O(n).`, calc: [`return ${best}`] });
  return R.steps;
}

function camerasRun({ tree }) {
  const R = recorder();
  const t = buildTree(tree);
  const N = t.nodes;
  const cls = {}, badge = {};
  const T = () => [{ t, label: 'tree', cls, badge }];
  let cams = 0;
  const depth = {};
  const dw = (id, d) => { if (id === null) return; depth[id] = d; dw(N[id].left, d + 1); dw(N[id].right, d + 1); };
  dw(t.root, 0);
  const where = (id) => (id === t.root ? 'the root' : isLeaf(t, id) ? `a leaf at depth ${depth[id]}` : `a node at depth ${depth[id]}`);
  R.snap({ kind: 'start', trees: T(), lines: [], title: 'Fewest cameras to watch every node', text: 'A camera on a leaf watches only the leaf and its parent; on the parent it also watches the parent\'s other children and its own parent. So work from the leaves up and leave leaves uncovered for their parents. Each node reports one of three states: NEEDS (not watched yet), CAMERA (has one), COVERED (watched by a child\'s camera).', calc: [`tree = [${tree.join(', ')}]`] });
  const st = (id) => {
    if (id === null) return 'COV';
    const a = st(N[id].left), b = st(N[id].right);
    let res, text, line;
    if (a === 'NEED' || b === 'NEED') { res = 'CAM'; cams++; line = 'need'; text = 'A child is not watched, and only this node can still cover it: put a camera here. It also watches this node\'s parent.'; }
    else if (a === 'CAM' || b === 'CAM') { res = 'COV'; line = 'cov'; text = 'A child has a camera, which watches this node too. No camera needed.'; }
    else { res = 'NEED'; line = 'ask'; text = isLeaf(t, id) ? 'A leaf: don\'t put a camera here. Its parent can cover it and more.' : 'Its children are covered but have no camera, so nothing watches this node yet. Leave it for its parent.'; }
    cls[id] = [res === 'CAM' ? 'hit' : res === 'COV' ? 'done' : 'cur']; badge[id] = { text: { CAM: 'cam', COV: 'ok', NEED: 'need' }[res], tone: res === 'CAM' ? 'success' : res === 'NEED' ? 'danger' : undefined };
    R.snap({ kind: res === 'CAM' ? 'record' : 'state', trees: T(), card: { q: `children: ${[N[id].left, N[id].right].filter((x) => x !== null).length ? [a, b].join(', ') : 'none'}`, a: { CAM: 'camera here', COV: 'covered', NEED: 'needs cover' }[res], tone: res === 'CAM' ? 'yes' : 'info' }, lines: [line], title: `${{ CAM: 'Camera on', COV: 'Covered:', NEED: 'Needs cover:' }[res]} ${where(id)}`, text, calc: [`cameras = ${cams}`] });
    return res;
  };
  const top = st(t.root);
  if (top === 'NEED') { cams++; cls[t.root] = ['hit']; badge[t.root] = { text: 'cam', tone: 'success' }; R.snap({ kind: 'record', trees: T(), lines: ['root'], title: 'The root still needs cover: camera', text: 'Nobody above the root can watch it, so it gets its own camera.', calc: [`cameras = ${cams}`] }); }
  R.snap({ kind: 'done', trees: T(), lines: [], answer: String(cams), title: `${cams} camera${cams === 1 ? '' : 's'}`, text: 'Delaying each camera to the parent of an uncovered node always covers at least as much as putting it lower. O(n), one pass from the leaves up.', calc: [`return ${cams}`] });
  return R.steps;
}

export function treeWalk(input) {
  return { same: sameRun, symmetric: symmetricRun, invert: invertRun, balanced: balancedRun, order: orderRun, subtree: subtreeRun, build: buildRun, delete: deleteRun, serialize: serializeRun, zigzag: zigzagRun, maxpath: maxpathRun, cameras: camerasRun }[input.mode](input);
}

// ---------------------------------------------------------------- reference answers

export function treeWalkAnswer(input) {
  const t = input.tree ? buildTree(input.tree) : null;
  const eq = (A, a, B, b) => (a === null || b === null ? a === b : A.nodes[a].v === B.nodes[b].v && eq(A, A.nodes[a].left, B, B.nodes[b].left) && eq(A, A.nodes[a].right, B, B.nodes[b].right));
  switch (input.mode) {
    case 'same': { const A = buildTree(input.p), B = buildTree(input.q); return String(eq(A, A.root, B, B.root)); }
    case 'symmetric': {
      const mirror = (a, b) => (a === null || b === null ? a === b : t.nodes[a].v === t.nodes[b].v && mirror(t.nodes[a].left, t.nodes[b].right) && mirror(t.nodes[a].right, t.nodes[b].left));
      return String(t.root === null || mirror(t.nodes[t.root].left, t.nodes[t.root].right));
    }
    case 'invert': { const c = cloneTree(t); Object.values(c.nodes).forEach((n) => { [n.left, n.right] = [n.right, n.left]; }); return lv(c); }
    case 'balanced': {
      const h = (id) => (id === null ? 0 : 1 + Math.max(h(t.nodes[id].left), h(t.nodes[id].right)));
      const ok = (id) => id === null || (Math.abs(h(t.nodes[id].left) - h(t.nodes[id].right)) <= 1 && ok(t.nodes[id].left) && ok(t.nodes[id].right));
      return String(ok(t.root));
    }
    case 'order': {
      const out = [];
      const w = (id) => { if (id === null) return; const n = t.nodes[id]; if (input.which === 'pre') out.push(n.v); w(n.left); if (input.which === 'in') out.push(n.v); w(n.right); if (input.which === 'post') out.push(n.v); };
      w(t.root);
      return `[${out.join(', ')}]`;
    }
    case 'subtree': { const S = buildTree(input.sub); return String(ids(t, t.root).some((id) => eq(t, id, S, S.root))); }
    case 'build': return 'check-traversals';
    case 'zigzag': {
      let best = 0;
      ids(t, t.root).forEach((id) => ['left', 'right'].forEach((side) => { let len = 0, cur = t.nodes[id][side], d = side; while (cur !== null) { len++; d = d === 'left' ? 'right' : 'left'; cur = t.nodes[cur][d]; } best = Math.max(best, len); }));
      return String(best);
    }
    case 'maxpath': {
      const all = ids(t, t.root);
      const par = {};
      all.forEach((id) => { const n = t.nodes[id]; if (n.left !== null) par[n.left] = id; if (n.right !== null) par[n.right] = id; });
      const up = (id) => { const p = [id]; while (par[p.at(-1)] !== undefined) p.push(par[p.at(-1)]); return p; };
      let best = -Infinity;
      for (const a of all) for (const b of all) {
        const pa = up(a), pb = up(b), sb = new Set(pb);
        const meet = pa.find((x) => sb.has(x));
        const nodes = [...pa.slice(0, pa.indexOf(meet) + 1), ...pb.slice(0, pb.indexOf(meet))];
        best = Math.max(best, nodes.reduce((acc, x) => acc + t.nodes[x].v, 0));
      }
      return String(best);
    }
    case 'cameras': {
      const all = ids(t, t.root);
      let best = Infinity;
      for (let m = 0; m < 1 << all.length; m++) {
        const cam = new Set(all.filter((_, k) => (m >> k) & 1));
        if (cam.size >= best) continue;
        const ok = all.every((id) => { const n = t.nodes[id]; return cam.has(id) || cam.has(n.left) || cam.has(n.right) || all.some((p) => cam.has(p) && (t.nodes[p].left === id || t.nodes[p].right === id)); });
        if (ok) best = cam.size;
      }
      return String(best);
    }
    case 'delete': {
      const c = cloneTree(t);
      for (let changed = true; changed;) {
        changed = false;
        for (const n of Object.values(c.nodes)) {
          if (n.left === null && n.right === null && n.v === input.target) {
            const parent = Object.values(c.nodes).find((p) => p.left === n.id || p.right === n.id);
            if (parent) { if (parent.left === n.id) parent.left = null; else parent.right = null; } else c.root = null;
            delete c.nodes[n.id]; changed = true; break;
          }
        }
      }
      return lv(c);
    }
    default: return lv(t);
  }
}

// ---------------------------------------------------------------- inputs

const parseArr = (text, max = 11) => {
  const parts = (text ?? '').replace(/[[\]]/g, '').split(/[\s,]+/).filter(Boolean);
  if (!parts.length || parts.length > max || parts.some((x) => x !== 'null' && !/^-?\d{1,2}$/.test(x)) || parts[0] === 'null') return null;
  return parts.map((x) => (x === 'null' ? null : Number(x)));
};

export function parseTreeWalk(values, input) {
  const { mode } = input;
  const err = { error: 'A tree in level order, like 1, 2, 3, null, 4 (up to 11 entries, values −99 to 99).' };
  if (mode === 'same') { const p = parseArr(values.p), q = parseArr(values.q); return p && q ? { input: { mode, p, q } } : err; }
  if (mode === 'subtree') { const tree = parseArr(values.tree), sub = parseArr(values.sub, 7); return tree && sub ? { input: { mode, tree, sub } } : err; }
  if (mode === 'build') {
    const pre = parseArr(values.pre, 8), ino = parseArr(values.ino, 8);
    if (!pre || !ino || pre.includes(null) || ino.includes(null) || pre.length !== ino.length || new Set(pre).size !== pre.length || [...pre].sort().join() !== [...ino].sort().join()) return { error: 'Two lists of the same distinct values (up to 8).' };
    const at = new Map(ino.map((v, i) => [v, i]));
    let k = 0;
    const ok = (lo, hi) => { if (lo > hi) return true; const m = at.get(pre[k++]); if (m < lo || m > hi) return false; return ok(lo, m - 1) && ok(m + 1, hi); };
    return ok(0, ino.length - 1) ? { input: { mode, pre, ino } } : { error: 'These two lists are not the preorder and inorder of the same tree.' };
  }
  const tree = parseArr(values.tree);
  if (!tree) return err;
  if (mode === 'delete') { const k = parseInt1(values.target, { min: -99, max: 99, name: 'target' }); return k.error ? k : { input: { mode, tree, target: k.v } }; }
  if (mode === 'order') return { input: { mode, tree, which: input.which } };
  return { input: { mode, tree } };
}

export function randomTreeWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const arr = (opts = {}) => randomTreeArr(rand, { n: g.int(1, 7), lo: 1, hi: 5, maxDepth: 4, ...opts });
  if (mode === 'maxpath') return { mode, tree: arr({ lo: -6, hi: 9, n: g.int(1, 9) }) };
  if (mode === 'zigzag' || mode === 'cameras') return { mode, tree: arr({ n: g.int(1, 10) }) };
  if (mode === 'same') { const p = arr(); return { mode, p, q: g.bool(0.5) ? [...p] : arr() }; }
  if (mode === 'symmetric') {
    if (g.bool(0.5)) { const a = g.int(1, 4), b = g.int(1, 4), c = g.int(1, 4); return { mode, tree: [g.int(1, 9), a, a, b, c, c, b] }; }
    return { mode, tree: arr() };
  }
  if (mode === 'subtree') {
    const tree = arr({ n: g.int(2, 8) });
    const t = buildTree(tree);
    const all = ids(t, t.root);
    const pick = all[g.int(0, all.length - 1)];
    const sub = g.bool(0.6) ? toLevelOrder({ root: pick, nodes: t.nodes }) : arr({ n: g.int(1, 3) });
    return { mode, tree, sub };
  }
  if (mode === 'build') {
    const n = g.int(1, 7);
    const vals = g.shuffle(Array.from({ length: 9 }, (_, i) => i + 1)).slice(0, n);
    const tree = randomTreeArr(rand, { n, lo: 1, hi: 9, maxDepth: 4 });
    const t = buildTree(tree);
    let k = 0;
    Object.values(t.nodes).forEach((nd) => { nd.v = vals[k++ % vals.length]; });
    const pre = [], ino = [];
    const w = (id) => { if (id === null) return; pre.push(t.nodes[id].v); w(t.nodes[id].left); ino.push(t.nodes[id].v); w(t.nodes[id].right); };
    w(t.root);
    if (new Set(pre).size !== pre.length) return { mode, pre: [3, 9, 20, 15, 7], ino: [9, 3, 15, 20, 7] };
    return { mode, pre, ino };
  }
  if (mode === 'delete') return { mode, tree: arr({ hi: 3 }), target: g.int(1, 3) };
  if (mode === 'order') return { mode, tree: arr(), which: ['in', 'pre', 'post'][g.int(0, 2)] };
  return { mode, tree: arr() };
}
