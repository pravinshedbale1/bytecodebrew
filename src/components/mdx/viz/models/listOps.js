/**
 * Linked-list rewiring, one link change at a time (the model behind <ListOpsViz>). Each step carries
 * the real pointer state (nodes, every node's next, extra pointers such as random) and where to draw
 * each node: place[id] = [col, row]. Pure, so scripts/viz-check.mjs can test it against brute force.
 *
 * Modes:
 *   add        add two numbers stored ones-digit first, with a carry                (Add Two Numbers)
 *   swap       swap every two adjacent nodes behind a dummy                          (Swap Nodes in Pairs)
 *   partition  two dummy-headed lists (< x and ≥ x), then join                       (Partition List)
 *   rotate     close the list into a ring, cut it at the new tail                    (Rotate List)
 *   gcd        insert gcd(a, b) between neighbours, then skip the new node           (Insert GCDs)
 *   copy       interleave copies, set random = random.next, split                    (Copy List with Random Pointer)
 *   kgroup     reverse k nodes at a time by moving nodes to the front of the group   (Reverse Nodes in k-Group)
 * A step: { kind, title, text, calc, lines, nodes, next, place, extra?, ptrs, fresh?, cls?, rows?, marks?,
 *           snipped?, answer? }
 */
import { parseInt1, parseInts, rng } from './util.js';

export const LIST_OPS = {
  add: { label: '342 + 465', input: { mode: 'add', a: [2, 4, 3], b: [5, 6, 4] } },
  add2: { label: '99 + 1', input: { mode: 'add', a: [9, 9], b: [1] } },
  swap: { label: 'Swap pairs', input: { mode: 'swap', vals: [1, 2, 3, 4] } },
  partition: { label: 'Partition, x = 3', input: { mode: 'partition', vals: [1, 4, 3, 2, 5, 2], x: 3 } },
  rotate: { label: 'Rotate by 2', input: { mode: 'rotate', vals: [1, 2, 3, 4, 5], k: 2 } },
  gcd: { label: 'Insert GCDs', input: { mode: 'gcd', vals: [18, 6, 10, 3] } },
  copy: { label: 'Copy with random', input: { mode: 'copy', list: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] } },
  kgroup: { label: 'Reverse in groups of 2', input: { mode: 'kgroup', vals: [1, 2, 3, 4, 5], k: 2 } },
};

export const listOpsCode = {
  add: [
    ['init', 'ListNode dummy = new ListNode(0), tail = dummy; int carry = 0;'],
    ['loop', 'while (l1 != null || l2 != null || carry != 0) {'],
    ['sum', '    int s = (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0) + carry;'],
    ['link', '    tail.next = new ListNode(s % 10); tail = tail.next; carry = s / 10;'],
    ['adv', '    if (l1 != null) l1 = l1.next; if (l2 != null) l2 = l2.next;'],
    ['end', '}'],
    ['ret', 'return dummy.next;'],
  ],
  swap: [
    ['init', 'ListNode dummy = new ListNode(0, head), prev = dummy;'],
    ['loop', 'while (prev.next != null && prev.next.next != null) {'],
    ['pair', '    ListNode a = prev.next, b = a.next;'],
    ['swap', '    prev.next = b; a.next = b.next; b.next = a;'],
    ['adv', '    prev = a;                       // a is now second in the pair'],
    ['end', '}'],
    ['ret', 'return dummy.next;'],
  ],
  partition: [
    ['init', 'ListNode lessD = new ListNode(0), geD = new ListNode(0), less = lessD, ge = geD;'],
    ['loop', 'while (head != null) {'],
    ['detach', '    ListNode nxt = head.next; head.next = null;'],
    ['pick', '    if (head.val < x) { less.next = head; less = head; } else { ge.next = head; ge = head; }'],
    ['adv', '    head = nxt;'],
    ['end', '}'],
    ['join', 'less.next = geD.next;'],
    ['ret', 'return lessD.next;'],
  ],
  rotate: [
    ['len', 'int n = 1; ListNode tail = head; while (tail.next != null) { tail = tail.next; n++; }'],
    ['mod', 'k %= n; if (k == 0) return head;'],
    ['ring', 'tail.next = head;                  // close the ring'],
    ['walk', 'ListNode newTail = head; for (int i = 0; i < n - k - 1; i++) newTail = newTail.next;'],
    ['cut', 'ListNode newHead = newTail.next; newTail.next = null;'],
    ['ret', 'return newHead;'],
  ],
  gcd: [
    ['init', 'ListNode cur = head;'],
    ['loop', 'while (cur.next != null) {'],
    ['make', '    ListNode g = new ListNode(gcd(cur.val, cur.next.val), cur.next);'],
    ['link', '    cur.next = g;'],
    ['skip', '    cur = g.next;                    // jump over the node just inserted'],
    ['end', '}'],
    ['ret', 'return head;'],
  ],
  copy: [
    ['clone', 'for (Node o = head; o != null; o = o.next.next) {      // 1. a copy right after each node'],
    ['clone', '    Node c = new Node(o.val); c.next = o.next; o.next = c; }'],
    ['random', 'for (Node o = head; o != null; o = o.next.next)        // 2. random: the copy of o.random'],
    ['random', '    o.next.random = o.random == null ? null : o.random.next;'],
    ['split', 'Node copyHead = head.next;'],
    ['split', 'for (Node o = head; o != null; o = o.next) {           // 3. unzip the two lists'],
    ['split', '    Node c = o.next; o.next = c.next; c.next = c.next == null ? null : c.next.next; }'],
    ['ret', 'return copyHead;'],
  ],
  kgroup: [
    ['init', 'ListNode dummy = new ListNode(0, head), gp = dummy;   // gp: the node before the group'],
    ['loop', 'while (true) {'],
    ['check', '    ListNode kth = gp; for (int i = 0; i < k && kth != null; i++) kth = kth.next;'],
    ['stop', '    if (kth == null) break;              // fewer than k left: keep their order'],
    ['cur', '    ListNode cur = gp.next;              // ends up last in the group'],
    ['move', '    for (int i = 1; i < k; i++) { ListNode m = cur.next; cur.next = m.next; m.next = gp.next; gp.next = m; }'],
    ['next', '    gp = cur;'],
    ['end', '}'],
    ['ret', 'return dummy.next;'],
  ],
};

const arr = (a) => `[${a.join(', ')}]`;

/** Shared state for one run. */
function recorder() {
  const nodes = [];
  const next = {};
  const place = {};
  const steps = [];
  const node = (id, val, kind) => { nodes.push({ id, val, ...(kind ? { kind } : {}) }); next[id] = null; return id; };
  const val = (id) => (id === null || id === undefined ? 'null' : nodes.find((n) => n.id === id).val);
  const walk = (from, limit = 60) => { const out = []; for (let id = from; id !== null && out.length < limit; id = next[id]) out.push(id); return out; };
  const row = (ids, r, c0 = 0, step = 1) => ids.forEach((id, k) => { place[id] = [c0 + k * step, r]; });
  const snap = (x) => steps.push({ nodes: nodes.map((n) => ({ ...n })), next: { ...next }, place: Object.fromEntries(Object.entries(place).map(([k, v]) => [k, [...v]])), ptrs: {}, ...x });
  return { nodes, next, place, steps, node, val, walk, row, snap };
}

// ---------------------------------------------------------------- add two numbers

function addRun({ a, b }) {
  const R = recorder();
  const A = a.map((v, k) => R.node(`a${k}`, v));
  const B = b.map((v, k) => R.node(`b${k}`, v));
  A.forEach((id, k) => { R.next[id] = A[k + 1] ?? null; });
  B.forEach((id, k) => { R.next[id] = B[k + 1] ?? null; });
  const D = R.node('D', 'dummy', 'dummy');
  R.row(A, 0, 1); R.row(B, 1, 1); R.place.D = [0, 2];
  const num = (d) => [...d].reverse().join('');
  const rows = { 0: 'l1', 1: 'l2', 2: 'sum' };
  R.snap({
    kind: 'start', rows, ptrs: { l1: A[0], l2: B[0], tail: D }, lines: ['init'],
    title: `${num(a)} + ${num(b)}, ones digit first`,
    text: 'Each list starts with the ones digit, which is exactly the order schoolbook addition works in: add the two digits and the carry, write the last digit of the sum, carry the rest into the next column.',
    calc: [`l1 = ${num(a)}`, `l2 = ${num(b)}`, 'carry = 0'],
  });
  let p = A[0], q = B[0], tail = D, carry = 0, col = 0;
  const out = [];
  while (p || q || carry) {
    const x = p ? R.val(p) : 0, y = q ? R.val(q) : 0;
    const s = x + y + carry;
    const id = R.node(`r${col}`, s % 10);
    R.next[tail] = id;
    R.place[id] = [col + 1, 2];
    out.push(s % 10);
    const before = carry;
    carry = Math.floor(s / 10);
    const cls = {};
    if (p) cls[p] = ['hit'];
    if (q) cls[q] = ['hit'];
    R.snap({
      kind: 'digit', rows, ptrs: { ...(p ? { l1: p } : {}), ...(q ? { l2: q } : {}), tail: id }, fresh: [[tail, id]], cls, lines: ['loop', 'sum', 'link'],
      title: `${x} + ${y} + carry ${before} = ${s}: write ${s % 10}${carry ? ', carry 1' : ''}`,
      text: !p && !q
        ? 'Both lists have run out, but a carry is left: it becomes one more digit at the end.'
        : !p || !q
          ? `${!p ? 'l1' : 'l2'} has run out: its digit counts as 0, and the other list goes on with the carry.`
          : `Digits in the same column: ${x} and ${y}, plus the carry of ${before}. ${s >= 10 ? `${s} is 10 or more, so write ${s % 10} and carry 1 to the next column.` : `${s} is a single digit: no carry.`}`,
      calc: [`s = ${x} + ${y} + ${before} = ${s}`, `new node ${s % 10}`, `carry = ${carry}`],
    });
    tail = id;
    p = p ? R.next[p] : null;
    q = q ? R.next[q] : null;
    col++;
  }
  const want = num(out);
  R.snap({ kind: 'done', rows, ptrs: {}, cls: Object.fromEntries(R.walk(R.next.D).map((id) => [id, ['hit']])), lines: ['end', 'ret'], answer: arr(out), title: `${num(a)} + ${num(b)} = ${want}`, text: `Return dummy.next: ${arr(out)}, which is ${want} written ones digit first. O(max(n, m)) time; the numbers can have 100 digits, far too many for a long, so they are never turned into integers.`, calc: [`return ${arr(out)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- swap pairs

function swapRun({ vals }) {
  const R = recorder();
  const D = R.node('D', 'dummy', 'dummy');
  const ids = vals.map((v, k) => R.node(`n${k}`, v));
  [D, ...ids].forEach((id, k, all) => { R.next[id] = all[k + 1] ?? null; });
  const lay = () => R.row(R.walk(D), 0);
  lay();
  let prev = D;
  R.snap({ kind: 'start', ptrs: { prev }, lines: ['init'], title: 'prev waits just before the first pair', text: 'Swapping a pair changes the node before it too: it must point to the pair\'s second node. A dummy in front of the head gives the first pair a "node before" like every other pair.', calc: ['prev = dummy'] });
  while (R.next[prev] && R.next[R.next[prev]]) {
    const a = R.next[prev], b = R.next[a];
    R.snap({ kind: 'pair', ptrs: { prev, a, b }, lines: ['loop', 'pair'], title: `Next pair: ${R.val(a)} and ${R.val(b)}`, text: `Three links will change: prev → ${R.val(b)}, ${R.val(a)} → whatever came after ${R.val(b)} (${R.val(R.next[b])}), and ${R.val(b)} → ${R.val(a)}.`, calc: [`a = ${R.val(a)}, b = ${R.val(b)}`, `after b: ${R.val(R.next[b])}`] });
    const after = R.next[b];
    R.next[prev] = b; R.next[a] = after; R.next[b] = a;
    lay();
    R.snap({ kind: 'swap', ptrs: { prev, a, b }, fresh: [[prev, b], [b, a], ...(after ? [[a, after]] : [])], lines: ['swap'], title: `Swapped: ${R.val(b)} now comes before ${R.val(a)}`, text: `prev.next = b, a.next = ${R.val(after)}, b.next = a. The order matters: a.next is set from b.next before b.next is overwritten.`, calc: [`${R.val(prev)}.next = ${R.val(b)}`, `${R.val(a)}.next = ${R.val(after)}`, `${R.val(b)}.next = ${R.val(a)}`] });
    prev = a;
  }
  const out = R.walk(R.next.D).map(R.val);
  R.snap({ kind: 'done', ptrs: { prev }, lines: ['loop', 'ret'], answer: arr(out), title: `Done: ${out.join(' → ')}`, text: R.next[prev] ? `Only one node, ${R.val(R.next[prev])}, is left after prev: with no partner it stays where it is. Return dummy.next.` : 'No pair is left after prev. Return dummy.next.', calc: [`return ${arr(out)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- partition

function partitionRun({ vals, x }) {
  const R = recorder();
  const ids = vals.map((v, k) => R.node(`n${k}`, v));
  ids.forEach((id, k) => { R.next[id] = ids[k + 1] ?? null; });
  const L = R.node('L', '< x', 'dummy');
  const G = R.node('G', '≥ x', 'dummy');
  R.row(ids, 0, 1); R.place.L = [0, 1]; R.place.G = [0, 2];
  const rows = { 0: 'to place', 1: `< ${x}`, 2: `≥ ${x}` };
  let less = L, ge = G, cur = ids[0];
  const nl = [], ng = [];
  R.snap({ kind: 'start', rows, ptrs: { head: cur, less, ge }, lines: ['init'], title: `Split around x = ${x}, keeping the order`, text: `Grow two lists as you walk: one for values below ${x}, one for the rest. Each node is appended at the tail of its list, so both lists keep the original order. Dummy heads mean neither list needs an "is it empty?" check.`, calc: [`x = ${x}`] });
  while (cur) {
    const nxt = R.next[cur];
    R.next[cur] = null;
    const small = R.val(cur) < x;
    if (small) { R.next[less] = cur; nl.push(cur); R.place[cur] = [nl.length, 1]; } else { R.next[ge] = cur; ng.push(cur); R.place[cur] = [ng.length, 2]; }
    R.row(R.walk(nxt), 0, 1);                                  // the nodes still to place close up
    const tailBefore = small ? less : ge;
    if (small) less = cur; else ge = cur;
    R.snap({
      kind: small ? 'less' : 'ge', rows, ptrs: { ...(nxt ? { head: nxt } : {}), less, ge }, fresh: [[tailBefore, cur]], lines: ['loop', 'detach', 'pick', 'adv'],
      title: `${R.val(cur)} ${small ? '<' : '≥'} ${x}: append to the ${small ? '"less"' : '"greater or equal"'} list`,
      text: `Unhook ${R.val(cur)} from the rest and hang it after the tail of its list. ${small ? 'less' : 'ge'} moves to it.`,
      calc: [`${R.val(cur)} ${small ? '<' : '>='} ${x}`, `less: ${nl.map(R.val).join(' → ') || 'empty'}`, `ge: ${ng.map(R.val).join(' → ') || 'empty'}`],
    });
    cur = nxt;
  }
  R.next[less] = R.next[G];
  const order = R.walk(R.next.L);
  delete R.place.G;
  R.row([L, ...order], 1);
  const out = order.map(R.val);
  R.snap({ kind: 'join', rows: { 1: 'answer' }, ptrs: { less }, fresh: R.next[less] ? [[less, R.next[less]]] : [], lines: ['join', 'ret'], answer: arr(out), title: `Join: ${out.join(' → ')}`, text: `Link the tail of the "less" list to the first node after the ≥ dummy, and return the node after the less dummy. Every node moved once: O(n) time, O(1) extra space.`, calc: [`${R.val(less)}.next = ${R.val(R.next[less])}`, `return ${arr(out)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- rotate

function rotateRun({ vals, k }) {
  const R = recorder();
  const ids = vals.map((v, i) => R.node(`n${i}`, v));
  ids.forEach((id, i) => { R.next[id] = ids[i + 1] ?? null; });
  R.row(ids, 0);
  const n = ids.length;
  const head = ids[0], tail = ids[n - 1];
  R.snap({ kind: 'start', ptrs: { head }, lines: [], title: `Rotate right by ${k}`, text: 'Each rotation moves the last node to the front. Doing that k times would be slow and k can be 2 × 10⁹, so work out where the list ends up and change two links.', calc: [`k = ${k}`] });
  R.snap({ kind: 'len', ptrs: { head, tail }, lines: ['len'], title: `Walk to the tail: length ${n}`, text: `The tail is ${R.val(tail)}. The length tells which rotations matter: rotating by ${n} gives back the same list.`, calc: [`n = ${n}`, `tail = ${R.val(tail)}`] });
  const r = k % n;
  if (r === 0) {
    R.snap({ kind: 'done', ptrs: { head }, lines: ['mod', 'ret'], answer: arr(vals), title: `${k} mod ${n} = 0: nothing changes`, text: `Rotating by a multiple of the length returns the same list. Return the head as it is.`, calc: [`k % n = ${k} % ${n} = 0`] });
    return R.steps;
  }
  R.snap({ kind: 'mod', ptrs: { head, tail }, lines: ['mod'], title: `Only ${k} mod ${n} = ${r} rotation${r === 1 ? '' : 's'} matter`, text: `The last ${r} node${r === 1 ? '' : 's'} (${vals.slice(n - r).join(', ')}) move to the front, so the new head is at index ${n - r} and the new tail just before it.`, calc: [`k % n = ${k} % ${n} = ${r}`, `new head: index ${n} − ${r} = ${n - r}`] });
  R.next[tail] = head;
  R.snap({ kind: 'ring', ptrs: { head, tail }, fresh: [[tail, head]], lines: ['ring'], title: `Close the ring: ${R.val(tail)} → ${R.val(head)}`, text: 'Now the list has no end, and any node can become the head: cutting the ring anywhere gives a rotation.', calc: [`${R.val(tail)}.next = ${R.val(head)}`] });
  const nt = ids[n - r - 1];
  R.snap({ kind: 'walk', ptrs: { head, newTail: nt }, lines: ['walk'], title: `Walk ${n - r - 1} step${n - r - 1 === 1 ? '' : 's'} to the new tail, ${R.val(nt)}`, text: `The new tail is the node just before the new head: index ${n - r - 1}.`, calc: [`steps = n − k − 1 = ${n - r - 1}`, `newTail = ${R.val(nt)}`] });
  const nh = R.next[nt];
  R.next[nt] = null;
  const order = R.walk(nh);
  R.row(order, 0);
  const out = order.map(R.val);
  R.snap({ kind: 'cut', ptrs: { newTail: nt }, snipped: [nt, nh], marks: [{ at: nh, icon: 'crown', label: 'new head', tone: 'warn' }], lines: ['cut', 'ret'], answer: arr(out), title: `Cut after ${R.val(nt)}: ${out.join(' → ')}`, text: `newHead = ${R.val(nh)}, and ${R.val(nt)}.next = null opens the ring there. Two passes over the list at most: O(n) time, O(1) space, however large k is.`, calc: [`newHead = ${R.val(nh)}`, `${R.val(nt)}.next = null`, `return ${arr(out)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- insert GCDs

export const gcdOf = (a, b) => (b === 0 ? a : gcdOf(b, a % b));
function euclid(a, b) {
  const lines = [];
  while (b !== 0) { lines.push(`gcd(${a}, ${b}) → ${a} mod ${b} = ${a % b}`); [a, b] = [b, a % b]; }
  lines.push(`gcd = ${a}`);
  return lines;
}

function gcdRun({ vals }) {
  const R = recorder();
  const ids = vals.map((v, k) => R.node(`n${k}`, v));
  ids.forEach((id, k) => { R.next[id] = ids[k + 1] ?? null; });
  const lay = () => R.row(R.walk(ids[0]), 0);
  lay();
  let cur = ids[0];
  R.snap({ kind: 'start', ptrs: { cur }, lines: ['init'], title: 'Between every pair of neighbours, insert their GCD', text: 'Walk the list. For each node and its next one, make a node holding their GCD and link it in between. Then jump over the new node, so it is never treated as one of the originals.', calc: ['cur = head'] });
  let made = 0;
  while (R.next[cur]) {
    const nb = R.next[cur];
    const g = gcdOf(R.val(cur), R.val(nb));
    const gid = R.node(`g${made++}`, g);
    R.next[gid] = nb;
    R.next[cur] = gid;
    lay();
    R.snap({ kind: 'insert', ptrs: { cur }, fresh: [[cur, gid], [gid, nb]], cls: { [gid]: ['moved'] }, lines: ['loop', 'make', 'link'], title: `gcd(${R.val(cur)}, ${R.val(nb)}) = ${g}: link it in`, text: `The new node ${g} points to ${R.val(nb)}, then ${R.val(cur)} points to it. Setting the new node's next first means ${R.val(nb)} is never lost.`, calc: euclid(R.val(cur), R.val(nb)) });
    cur = nb;
    if (R.next[cur]) R.snap({ kind: 'skip', ptrs: { cur }, cls: { [gid]: ['moved'] }, lines: ['skip'], title: `Skip over ${g}: cur → ${R.val(cur)}`, text: `cur = g.next jumps to the next original node. Moving one step instead would put cur on ${g}, and the next GCD would be computed between ${g} and ${R.val(cur)}.`, calc: [`cur = ${R.val(cur)}`] });
  }
  const out = R.walk(ids[0]).map(R.val);
  R.snap({ kind: 'done', ptrs: {}, lines: ['end', 'ret'], answer: arr(out), title: `Done: ${out.join(' → ')}`, text: `cur is on the last node, which has no neighbour after it. ${vals.length - 1} node${vals.length === 2 ? '' : 's'} inserted, each GCD in O(log V) steps with Euclid's algorithm.`, calc: [`return ${arr(out)}`] });
  return R.steps;
}

// ---------------------------------------------------------------- copy with random pointer

function copyRun({ list }) {
  const R = recorder();
  const n = list.length;
  const O = list.map(([v], k) => R.node(`o${k}`, v));
  O.forEach((id, k) => { R.next[id] = O[k + 1] ?? null; });
  const rnd = {};
  list.forEach(([, r], k) => { rnd[O[k]] = r === null ? null : O[r]; });
  R.row(O, 0);
  const extra = () => Object.entries(rnd).filter(([, to]) => to).map(([from, to]) => ({ from, to, tone: from.startsWith('o') ? 'interview' : 'warn', dashed: true, bend: from.startsWith('o') ? -26 : 26 }));
  const rows = { 0: 'original', 1: 'copies' };
  const desc = (id) => `${R.val(id)}`;
  R.snap({ kind: 'start', rows, extra: extra(), ptrs: { o: O[0] }, lines: [], title: 'A deep copy: new nodes, and their pointers point to new nodes', text: 'Copying next pointers is easy: walk and build. random is the hard part: it can point anywhere, including to nodes not copied yet. A map from old to new nodes solves it with O(n) space; putting each copy right after its original solves it with none.', calc: list.map(([v, r], k) => `${v}: random → ${r === null ? 'null' : `${list[r][0]} (index ${r})`}`).slice(0, 5) });
  const C = [];
  for (let k = 0; k < n; k++) {
    const o = O[k];
    const c = R.node(`c${k}`, `${R.val(o)}′`);
    C.push(c);
    R.next[c] = R.next[o];
    R.next[o] = c;
    R.place[c] = [k + 0.5, 1];
    rnd[c] = null;
    R.snap({ kind: 'clone', rows, extra: extra(), ptrs: { o }, fresh: [[o, c], ...(R.next[c] ? [[c, R.next[c]]] : [])], cls: { [c]: ['moved'] }, lines: ['clone'], title: `Copy ${desc(o)}: ${R.val(c)} goes right after it`, text: `${R.val(c)}.next = ${R.val(R.next[c])}, then ${desc(o)}.next = ${R.val(c)}. Every original is now followed by its own copy: the list itself acts as the old → new map.`, calc: [`${R.val(c)}.next = ${R.val(R.next[c])}`, `${desc(o)}.next = ${R.val(c)}`] });
  }
  for (let k = 0; k < n; k++) {
    const o = O[k], c = C[k];
    const to = rnd[o];
    rnd[c] = to ? R.next[to] : null;
    R.snap({
      kind: 'random', rows, extra: extra(), ptrs: { o, c }, fresh: [], lines: ['random'],
      title: to ? `${R.val(c)}.random = ${desc(o)}.random.next = ${R.val(R.next[to])}` : `${desc(o)}.random is null, so ${R.val(c)}.random stays null`,
      text: to ? `${desc(o)}.random is ${desc(to)}, and the copy of ${desc(to)} sits right after it. So the copy's random is one next away: no lookup needed.` : 'The original points nowhere, so its copy points nowhere too.',
      calc: to ? [`${desc(o)}.random = ${desc(to)}`, `${desc(to)}.next = ${R.val(R.next[to])}`] : ['random = null'],
    });
  }
  for (let k = 0; k < n; k++) {
    const o = O[k], c = C[k];
    R.next[o] = R.next[c];
    R.next[c] = R.next[c] ? R.next[R.next[c]] : null;
    R.snap({ kind: 'split', rows, extra: extra(), ptrs: { o, c }, fresh: [...(R.next[o] ? [[o, R.next[o]]] : []), ...(R.next[c] ? [[c, R.next[c]]] : [])], lines: ['split'], title: `Unzip: ${desc(o)} → ${R.val(R.next[o])}, ${R.val(c)} → ${R.val(R.next[c])}`, text: 'Each original skips its copy, and each copy skips the next original. The original list is restored as it was.', calc: [`${desc(o)}.next = ${R.val(R.next[o])}`, `${R.val(c)}.next = ${R.val(R.next[c])}`] });
  }
  const out = C.map((c, k) => `[${list[k][0]},${rnd[c] === null ? 'null' : C.indexOf(rnd[c])}]`);
  R.snap({ kind: 'done', rows, extra: extra(), ptrs: {}, cls: Object.fromEntries(C.map((c) => [c, ['hit']])), lines: ['ret'], answer: `[${out.join(',')}]`, title: 'Return the copies\' head', text: 'Every copy\'s next and random point to copies, and the original list is unchanged. Three passes: O(n) time, O(1) extra space besides the copies themselves.', calc: [`return ${R.val(C[0])}`] });
  return R.steps;
}

// ---------------------------------------------------------------- reverse in k-groups

function kgroupRun({ vals, k }) {
  const R = recorder();
  const D = R.node('D', 'dummy', 'dummy');
  const ids = vals.map((v, i) => R.node(`n${i}`, v));
  [D, ...ids].forEach((id, i, all) => { R.next[id] = all[i + 1] ?? null; });
  const lay = () => R.row(R.walk(D), 0);
  lay();
  let gp = D;
  R.snap({ kind: 'start', ptrs: { gp }, lines: ['init'], title: `Reverse ${k} nodes at a time`, text: 'gp is the node just before the next group. For each group: check that k nodes follow gp, reverse them in place, and reconnect them between gp and the rest. A dummy gives the first group a gp too.', calc: [`k = ${k}`, 'gp = dummy'] });
  let group = 0;
  for (;;) {
    let kth = gp;
    for (let i = 0; i < k && kth !== null; i++) kth = R.next[kth];
    if (kth === null) {
      const left = R.walk(R.next[gp]).map(R.val);
      R.snap({ kind: 'stop', ptrs: { gp }, lines: ['check', 'stop'], title: left.length ? `Only ${left.length} node${left.length === 1 ? '' : 's'} left: keep ${left.length === 1 ? 'it' : 'them'} as ${left.length === 1 ? 'it is' : 'they are'}` : 'No nodes left', text: left.length ? `Fewer than ${k} nodes follow gp (${left.join(', ')}), and the statement keeps such a tail in order.` : 'Every node was in a full group.', calc: [`nodes after gp: ${left.length} < ${k}`] });
      break;
    }
    group++;
    const cur = R.next[gp];
    R.snap({ kind: 'check', ptrs: { gp, cur, kth }, lines: ['check', 'cur'], title: `Group ${group}: ${R.walk(cur).slice(0, k).map(R.val).join(', ')}`, text: `${k} nodes follow gp, so this group is reversed. cur = ${R.val(cur)}, the group's first node, will end up last: move each node after it to the front of the group.`, calc: [`kth = ${R.val(kth)}`, `cur = ${R.val(cur)}`] });
    for (let i = 1; i < k; i++) {
      const m = R.next[cur];
      R.next[cur] = R.next[m];
      R.next[m] = R.next[gp];
      R.next[gp] = m;
      lay();
      R.snap({ kind: 'move', ptrs: { gp, cur }, fresh: [[gp, m], [m, R.next[m]], ...(R.next[cur] ? [[cur, R.next[cur]]] : [])], cls: { [m]: ['moved'] }, lines: ['move'], title: `Move ${R.val(m)} to the front of the group`, text: `${R.val(cur)} skips ${R.val(m)}, ${R.val(m)} points to the group's current first node, and gp points to ${R.val(m)}. Three links per move, k − 1 moves per group.`, calc: [`${R.val(cur)}.next = ${R.val(R.next[cur])}`, `${R.val(m)}.next = ${R.val(R.next[m])}`, `${R.val(gp)}.next = ${R.val(m)}`] });
    }
    gp = cur;
    R.snap({ kind: 'next', ptrs: { gp }, lines: ['next'], title: `Group ${group} reversed; gp → ${R.val(gp)}`, text: `${R.val(gp)} is now the last node of the reversed group, which makes it the node before the next group.`, calc: [`gp = ${R.val(gp)}`] });
  }
  const out = R.walk(R.next.D).map(R.val);
  R.snap({ kind: 'done', ptrs: {}, lines: ['ret'], answer: arr(out), title: `Done: ${out.join(' → ')}`, text: 'Return dummy.next. Each node is moved at most once and every group is checked once: O(n) time, O(1) extra space.', calc: [`return ${arr(out)}`] });
  return R.steps;
}

export function listOps(input) {
  return { add: addRun, swap: swapRun, partition: partitionRun, rotate: rotateRun, gcd: gcdRun, copy: copyRun, kgroup: kgroupRun }[input.mode](input);
}

/** Reference answers, for the checks. */
export function listOpsAnswer(input) {
  const a = (x) => `[${x.join(', ')}]`;
  if (input.mode === 'add') {
    const out = []; let c = 0;
    for (let i = 0; i < Math.max(input.a.length, input.b.length) || c; i++) { const s = (input.a[i] ?? 0) + (input.b[i] ?? 0) + c; out.push(s % 10); c = Math.floor(s / 10); }
    return a(out);
  }
  if (input.mode === 'swap') { const v = [...input.vals]; for (let i = 0; i + 1 < v.length; i += 2) [v[i], v[i + 1]] = [v[i + 1], v[i]]; return a(v); }
  if (input.mode === 'partition') return a([...input.vals.filter((v) => v < input.x), ...input.vals.filter((v) => v >= input.x)]);
  if (input.mode === 'rotate') { const n = input.vals.length, r = input.k % n; return a([...input.vals.slice(n - r), ...input.vals.slice(0, n - r)]); }
  if (input.mode === 'gcd') return a(input.vals.flatMap((v, i) => (i + 1 < input.vals.length ? [v, gcdOf(v, input.vals[i + 1])] : [v])));
  if (input.mode === 'copy') return `[${input.list.map(([v, r]) => `[${v},${r === null ? 'null' : r}]`).join(',')}]`;
  const v = input.vals, out = [];
  let i = 0;
  for (; i + input.k <= v.length; i += input.k) out.push(...v.slice(i, i + input.k).reverse());
  return a([...out, ...v.slice(i)]);
}

export function parseListOps(values, input) {
  const { mode } = input;
  if (mode === 'add') {
    const x = parseInts(values.a, { min: 0, max: 9, minLen: 1, maxLen: 6, name: 'l1' });
    if (x.error) return { error: 'l1: up to 6 digits 0–9, ones digit first.' };
    const y = parseInts(values.b, { min: 0, max: 9, minLen: 1, maxLen: 6, name: 'l2' });
    if (y.error) return { error: 'l2: up to 6 digits 0–9, ones digit first.' };
    return { input: { mode, a: x.arr, b: y.arr } };
  }
  if (mode === 'copy') {
    const v = parseInts(values.vals, { min: -99, max: 99, minLen: 1, maxLen: 5, name: 'values' });
    if (v.error) return v;
    const parts = (values.random ?? '').split(/[\s,]+/).filter(Boolean);
    if (parts.length !== v.arr.length) return { error: `Give one random index (or null) per node: ${v.arr.length} of them.` };
    const r = parts.map((t) => (t === 'null' || t === '-' ? null : Number(t)));
    if (r.some((t) => t !== null && !(Number.isInteger(t) && t >= 0 && t < v.arr.length))) return { error: `Each random is null or an index from 0 to ${v.arr.length - 1}.` };
    return { input: { mode, list: v.arr.map((x, k) => [x, r[k]]) } };
  }
  const max = mode === 'gcd' ? 99 : 99;
  const v = parseInts(values.vals, { min: mode === 'gcd' ? 1 : -99, max, minLen: mode === 'gcd' ? 2 : 1, maxLen: mode === 'gcd' ? 5 : 8, name: 'list' });
  if (v.error) return v;
  if (mode === 'partition') {
    const x = parseInt1(values.x, { min: -200, max: 200, name: 'x' });
    return x.error ? x : { input: { mode, vals: v.arr, x: x.v } };
  }
  if (mode === 'rotate') {
    const k = parseInt1(values.k, { min: 0, max: 2e9, name: 'k' });
    return k.error ? { error: 'k must be a whole number from 0 to 2 × 10⁹.' } : { input: { mode, vals: v.arr, k: k.v } };
  }
  if (mode === 'kgroup') {
    const k = parseInt1(values.k, { min: 1, max: v.arr.length, name: 'k' });
    return k.error ? { error: `k must be between 1 and ${v.arr.length}.` } : { input: { mode, vals: v.arr, k: k.v } };
  }
  return { input: { mode, vals: v.arr } };
}

export function randomListOps(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const vals = (lo, hi, a, b) => Array.from({ length: g.int(lo, hi) }, () => g.int(a, b));
  if (mode === 'add') return { mode, a: vals(1, 5, 0, 9), b: vals(1, 5, 0, 9) };
  if (mode === 'partition') return { mode, vals: vals(1, 7, 1, 9), x: g.int(1, 9) };
  if (mode === 'rotate') return { mode, vals: vals(1, 7, 1, 9), k: g.bool(0.2) ? g.int(0, 2e9) : g.int(0, 12) };
  if (mode === 'gcd') return { mode, vals: vals(2, 5, 1, 60) };
  if (mode === 'copy') { const n = g.int(1, 5); return { mode, list: Array.from({ length: n }, () => [g.int(1, 20), g.bool(0.25) ? null : g.int(0, n - 1)]) }; }
  if (mode === 'kgroup') { const v = vals(1, 8, 1, 9); return { mode, vals: v, k: g.int(1, v.length) }; }
  return { mode, vals: vals(1, 8, 1, 9) };
}
