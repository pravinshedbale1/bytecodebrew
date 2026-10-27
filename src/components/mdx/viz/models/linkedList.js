/**
 * Linked-list step-throughs (models for <FastSlowViz>, <ReverseListViz>, <DummyNodeViz>). A step holds
 * the real pointer state: nodes, every node's next, and the named pointers. Pure, so
 * scripts/viz-check.mjs can test the results against brute force.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

/** Walk next pointers from a node; stops at null or after `limit` nodes (cycles). */
export function walk(next, from, limit = 40) {
  const out = [];
  for (let id = from; id !== null && id !== undefined && out.length < limit; id = next[id]) out.push(id);
  return out;
}

// ---------------------------------------------------------------- fast and slow pointers

export const FAST_SLOW = {
  cycle: { label: 'Cycle and its entrance', input: { mode: 'cycle', vals: [1, 2, 3, 4, 5, 6, 7], pos: 2 } },
  nocycle: { label: 'No cycle', input: { mode: 'cycle', vals: [1, 2, 3, 4, 5], pos: -1 } },
  middle: { label: 'Middle of the list', input: { mode: 'middle', vals: [1, 2, 3, 4, 5, 6] } },
  nth: { label: 'Remove n-th from end', input: { mode: 'nth', vals: [1, 2, 3, 4, 5], n: 2 } },
};

export const fastSlowCode = {
  cycle: [
    ['init', 'ListNode slow = head, fast = head;'],
    ['loop', 'while (fast != null && fast.next != null) {'],
    ['move', '    slow = slow.next; fast = fast.next.next;'],
    ['meet', '    if (slow == fast) {                 // phase 2'],
    ['p', '        ListNode p = head;'],
    ['walk', '        while (p != slow) { p = p.next; slow = slow.next; }'],
    ['ret', '        return p;                       // the entrance'],
    ['close', '    }'],
    ['end', '}'],
    ['none', 'return null;                            // fast fell off: no cycle'],
  ],
  middle: [
    ['init', 'ListNode slow = head, fast = head;'],
    ['loop', 'while (fast != null && fast.next != null) {'],
    ['move', '    slow = slow.next; fast = fast.next.next;'],
    ['end', '}'],
    ['ret', 'return slow;                             // the (second) middle'],
  ],
  nth: [
    ['init', 'ListNode dummy = new ListNode(0, head), lead = dummy, lag = dummy;'],
    ['gap', 'for (int i = 0; i <= n; i++) lead = lead.next;   // gap of n + 1'],
    ['both', 'while (lead != null) { lead = lead.next; lag = lag.next; }'],
    ['unlink', 'lag.next = lag.next.next;                        // skip the n-th from the end'],
    ['ret', 'return dummy.next;'],
  ],
};

function nodesFrom(vals) {
  return vals.map((val, k) => ({ id: `n${k}`, val }));
}

function chain(nodes, tail = null) {
  const next = {};
  nodes.forEach((n, k) => { next[n.id] = k + 1 < nodes.length ? nodes[k + 1].id : tail; });
  return next;
}

function cycleRun({ vals, pos }) {
  const nodes = nodesFrom(vals);
  const n = nodes.length;
  const next = chain(nodes, pos >= 0 ? nodes[pos].id : null);
  const steps = [];
  const idx = (id) => nodes.findIndex((x) => x.id === id);
  const C = pos >= 0 ? n - pos : 0;
  let slow = nodes[0].id, fast = nodes[0].id, moves = 0;
  const snap = (s) => steps.push({ nodes, next, pos, ...s });
  const val = (id) => (id === null ? 'null' : nodes[idx(id)].val);
  /** steps for fast to reach slow going forward, when both are on the cycle */
  const behind = () => (idx(slow) >= pos && idx(fast) >= pos && pos >= 0 ? ((idx(slow) - idx(fast)) % C + C) % C : null);
  snap({
    kind: 'start', ptrs: { slow, fast }, phase: 1, lines: ['init'],
    title: 'slow and fast start at the head',
    text: `slow will move one node per step and fast two. ${pos >= 0 ? `Node ${val(nodes[n - 1].id)} points back to node ${vals[pos]}, so the list ends in a loop: the ρ shape below.` : 'If there is no cycle, fast reaches the end first.'} With a HashSet of visited nodes this would be easy in O(n) space; two pointers need O(1).`,
    calc: ['slow = head, fast = head'],
  });
  for (;;) {
    if (fast === null || next[fast] === null) {
      snap({
        kind: 'none', ptrs: fast === null ? { slow } : { slow, fast }, phase: 1, lines: ['loop', 'none'], answer: 'no cycle',
        title: 'fast reached the end: no cycle',
        text: `${fast === null ? 'fast stepped off the last node and is null' : `fast is on the last node, ${val(fast)}, and fast.next is null`}: the list ends, so it cannot loop. Without a cycle fast always gets there first, after about n/2 steps. Return null.`,
        calc: [fast === null ? 'fast == null' : 'fast.next == null', 'return null'],
      });
      return steps;
    }
    const sFrom = slow, f0 = fast, f1 = next[fast], f2 = next[f1];
    slow = next[slow];
    fast = f2;
    moves++;
    const met = fast !== null && slow === fast;
    const g = fast === null ? null : behind();
    snap({
      kind: met ? 'meet' : 'move', ptrs: fast === null ? { slow } : { slow, fast }, pulse: met ? slow : undefined, phase: 1,
      trails: [[sFrom, slow, 'accent'], [f0, f1, 'warn'], ...(f2 !== null ? [[f1, f2, 'warn']] : [])],
      lines: met ? ['move', 'meet'] : ['loop', 'move'],
      title: met ? `They meet at node ${val(slow)}: there is a cycle` : `slow → ${val(slow)}, fast → ${fast === null ? 'null' : val(fast)}`,
      text: met
        ? `After ${plural(moves, 'step')} slow and fast are on the same node, ${val(slow)}. fast can only catch slow by going round a loop, so the list has a cycle. In numbers: a = ${pos} (head to the entrance), b = ${idx(slow) - pos} (entrance to here), C = ${C} (cycle length). slow walked a + b = ${moves} nodes and fast walked ${2 * moves}; fast's extra ${moves} is a whole number of laps of ${C}.`
        : fast === null
          ? 'slow takes one step and fast two; fast went past the last node.'
          : g === null
            ? `slow takes one step and fast takes two (the orange arrows). ${pos >= 0 && idx(fast) >= pos ? 'fast is already going round the loop; slow has not reached it yet.' : 'Neither has reached a loop yet.'}`
            : `Both are on the loop now. fast is ${plural(g, 'node')} behind slow (counting forward). Each step slow moves 1 and fast moves 2, so the gap shrinks by exactly 1: it can't jump over 0, so they must meet within ${plural(g, 'more step')}.`,
      calc: [`slow = slow.next → ${val(slow)}`, `fast = fast.next.next → ${fast === null ? 'null' : val(fast)}`, ...(g !== null && !met ? [`gap (fast to slow) = ${g}`] : []), ...(met ? ['slow == fast → cycle'] : [])],
    });
    if (met) break;
  }
  let p = nodes[0].id;
  const a = pos, b = idx(slow) - pos;
  snap({
    kind: 'phase2', ptrs: { p, slow }, phase: 2, lines: ['p'],
    title: 'Phase 2: p from the head, slow from the meeting point',
    text: `Now find where the loop starts. Put p at the head and move p and slow one node at a time. The head is a = ${a} nodes from the entrance, and the meeting point is also ${a} nodes short of the entrance (plus whole laps), because a + b = ${a + b} is a multiple of C = ${C}. Same speed, same distance: they meet at the entrance.`,
    calc: [`a = ${a}, b = ${b}, C = ${C}`, `a + b = ${a + b} = ${(a + b) / C} × C`, `meeting point + a steps = entrance`],
  });
  while (p !== slow) {
    const pf = p, sf = slow;
    p = next[p];
    slow = next[slow];
    const met = p === slow;
    snap({
      kind: met ? 'found' : 'walk', ptrs: { p, slow }, flag: met ? p : undefined, phase: 2,
      trails: [[pf, p, 'interview'], [sf, slow, 'accent']],
      lines: met ? ['walk', 'ret'] : ['walk'],
      answer: met ? `cycle starts at node ${val(p)} (index ${idx(p)})` : undefined,
      title: met ? `p and slow meet at node ${val(p)}: the cycle's entrance` : `p → ${val(p)}, slow → ${val(slow)}`,
      text: met
        ? `Both took ${a} step${a === 1 ? '' : 's'} and landed on node ${val(p)}, where the tail joins the loop. O(n) time, O(1) space.`
        : 'One step each, at the same speed.',
      calc: [`p = p.next → ${val(p)}`, `slow = slow.next → ${val(slow)}`, ...(met ? ['p == slow → return p'] : [])],
    });
  }
  if (a === 0) {
    steps.at(-1).answer = `cycle starts at node ${val(p)} (index 0)`;
    steps.at(-1).kind = 'found';
    steps.at(-1).ptrs = { p, slow };
    steps.at(-1).flag = p;
    steps.at(-1).title = `p is already on slow: the cycle starts at the head`;
    steps.at(-1).text = `The meeting point is the head itself (a = 0), so the whole list is the loop and its entrance is node ${val(p)}.`;
    steps.at(-1).lines = ['walk', 'ret'];
  }
  return steps;
}

function middleRun({ vals }) {
  const nodes = nodesFrom(vals);
  const next = chain(nodes);
  const steps = [];
  let slow = nodes[0].id, fast = nodes[0].id;
  const val = (id) => nodes.find((x) => x.id === id).val;
  const snap = (s) => steps.push({ nodes, next, pos: -1, ...s });
  snap({ kind: 'start', ptrs: { slow, fast }, lines: ['init'], title: 'slow and fast start at the head', text: `fast moves two nodes for every one slow moves. When fast can't move any further, slow has gone half as far: the middle. One pass, no need to count the ${vals.length} nodes first.`, calc: ['slow = head, fast = head'] });
  while (fast !== null && next[fast] !== null) {
    const sf = slow, f0 = fast, f1 = next[fast];
    slow = next[slow];
    fast = next[f1];
    snap({
      kind: 'move', ptrs: fast === null ? { slow } : { slow, fast }, trails: [[sf, slow, 'accent'], [f0, f1, 'warn'], ...(fast !== null ? [[f1, fast, 'warn']] : [])], lines: ['loop', 'move'],
      title: `slow → ${val(slow)}, fast → ${fast === null ? 'null' : val(fast)}`,
      text: fast === null ? 'fast stepped past the last node: it is null now.' : `fast has covered twice the distance slow has.`,
      calc: [`slow = ${val(slow)}`, `fast = ${fast === null ? 'null' : val(fast)}`],
    });
  }
  const k = nodes.findIndex((x) => x.id === slow);
  snap({
    kind: 'done', ptrs: fast === null ? { slow } : { slow, fast }, target: slow, lines: ['loop', 'ret'], answer: `middle = ${val(slow)}`,
    title: `fast can't go on: slow is at the middle, ${val(slow)}`,
    text: `${fast === null ? 'fast is null' : 'fast.next is null'}, so the loop stops. slow is at index ${k} of ${vals.length}${vals.length % 2 === 0 ? `: for an even length this is the second of the two middles. Use while (fast.next != null && fast.next.next != null) for the first one.` : ', the exact middle.'}`,
    calc: [fast === null ? 'fast == null' : 'fast.next == null', `return slow (${val(slow)})`],
  });
  return steps;
}

function nthRun({ vals, n }) {
  const nodes = [{ id: 'D', val: 'dummy', kind: 'dummy' }, ...nodesFrom(vals)];
  const next = chain(nodes);
  const steps = [];
  let lead = 'D', lag = 'D';
  const val = (id) => (id === null ? 'null' : nodes.find((x) => x.id === id).val);
  const snap = (s) => steps.push({ nodes, next: { ...next }, pos: -1, ...s });
  snap({
    kind: 'start', ptrs: { lag, lead }, lines: ['init'],
    title: `Remove the ${n}${['st', 'nd', 'rd'][n - 1] ?? 'th'} node from the end`,
    text: `lead goes n + 1 = ${n + 1} nodes ahead; then both walk together until lead falls off the end. lag stops on the node just before the one to remove. The dummy in front of the head means removing the head itself needs no special case.`,
    calc: [`n = ${n}`, 'lead = lag = dummy'],
  });
  for (let i = 0; i <= n; i++) {
    const from = lead;
    lead = next[lead];
    snap({ kind: 'gap', ptrs: lead === null ? { lag } : { lag, lead }, trails: [[from, lead, 'warn']], lines: ['gap'], title: `lead moves ahead: gap ${i + 1} of ${n + 1}`, text: `lead → ${val(lead)}. Building a gap of exactly n + 1 nodes between lead and lag.`, calc: [`lead = ${val(lead)}`, `gap = ${i + 1}`] });
  }
  while (lead !== null) {
    const lf = lead, gf = lag;
    lead = next[lead];
    lag = next[lag];
    snap({ kind: 'both', ptrs: lead === null ? { lag } : { lag, lead }, trails: [[lf, lead, 'warn'], [gf, lag, 'accent']], lines: ['both'], title: `Both move: lag → ${val(lag)}, lead → ${val(lead)}`, text: lead === null ? `lead fell off the end. The gap of ${n + 1} means lag is now right before the ${n}${['st', 'nd', 'rd'][n - 1] ?? 'th'} node from the end.` : 'The gap stays the same as they walk.', calc: [`lag = ${val(lag)}`, `lead = ${val(lead)}`] });
  }
  const target = next[lag];
  next[lag] = next[target];
  const rest = walk(next, next.D).map((id) => val(id));
  snap({
    kind: 'unlink', ptrs: { lag }, removed: [target], snipped: [lag, target], fresh: next[lag] === null ? [] : [[lag, next[lag]]], lines: ['unlink', 'ret'], answer: `[${rest.join(', ')}]`,
    title: `Unlink ${val(target)}: lag.next = lag.next.next`,
    text: `lag (${val(lag)}) now points past ${val(target)} straight to ${next[lag] === null ? 'null' : val(next[lag])}, which removes it in O(1). Return dummy.next: [${rest.join(', ')}]. One pass, O(1) space.`,
    calc: [`lag.next = ${next[lag] === null ? 'null' : val(next[lag])}`, `return [${rest.join(', ')}]`],
  });
  return steps;
}

export function fastSlow(input) {
  if (input.mode === 'cycle') return cycleRun(input);
  if (input.mode === 'middle') return middleRun(input);
  return nthRun(input);
}

export function parseFastSlow(values, input) {
  const a = parseInts(values.vals, { min: -99, max: 99, minLen: 1, maxLen: 9, name: 'list' });
  if (a.error) return a;
  if (input.mode === 'cycle') {
    const p = parseInt1(values.pos, { min: -1, max: a.arr.length - 1, name: 'pos' });
    return p.error ? { error: `pos must be −1 (no cycle) or an index from 0 to ${a.arr.length - 1}.` } : { input: { mode: 'cycle', vals: a.arr, pos: p.v } };
  }
  if (input.mode === 'middle') return { input: { mode: 'middle', vals: a.arr } };
  const n = parseInt1(values.n, { min: 1, max: a.arr.length, name: 'n' });
  return n.error ? { error: `n must be between 1 and ${a.arr.length}.` } : { input: { mode: 'nth', vals: a.arr, n: n.v } };
}

export function randomFastSlow(input, rand = Math.random) {
  const g = rng(rand);
  const vals = Array.from({ length: g.int(input.mode === 'cycle' ? 3 : 2, 9) }, (_, k) => k + 1);
  if (input.mode === 'cycle') return { mode: 'cycle', vals, pos: g.bool(0.8) ? g.int(0, vals.length - 1) : -1 };
  if (input.mode === 'middle') return { mode: 'middle', vals };
  return { mode: 'nth', vals, n: g.int(1, vals.length) };
}

// ---------------------------------------------------------------- reversal

export const REVERSE = {
  whole: { label: 'Reverse the whole list', input: { mode: 'whole', vals: [1, 2, 3, 4, 5] } },
  between: { label: 'Reverse [left, right]', input: { mode: 'between', vals: [1, 2, 3, 4, 5, 6], left: 2, right: 5 } },
};

export const reverseCode = {
  whole: [
    ['init', 'ListNode prev = null, cur = head;'],
    ['loop', 'while (cur != null) {'],
    ['save', '    ListNode next = cur.next;      // 1. save the rest of the list'],
    ['flip', '    cur.next = prev;               // 2. flip this arrow'],
    ['adv', '    prev = cur; cur = next;        // 3. advance both'],
    ['end', '}'],
    ['ret', 'return prev;                       // the old tail is the new head'],
  ],
  between: [
    ['init', 'ListNode dummy = new ListNode(0, head), before = dummy;'],
    ['walk', 'for (int i = 1; i < left; i++) before = before.next;   // node before the segment'],
    ['cur', 'ListNode cur = before.next;                  // ends as the segment\'s tail'],
    ['loop', 'for (int i = 0; i < right - left; i++) {'],
    ['take', '    ListNode move = cur.next;                // the node after cur…'],
    ['skip', '    cur.next = move.next;'],
    ['front', '    move.next = before.next;                 // …goes to the front of the segment'],
    ['link', '    before.next = move;'],
    ['end', '}'],
    ['ret', 'return dummy.next;'],
  ],
};

export function reverse(input) {
  const steps = [];
  if (input.mode === 'whole') {
    const nodes = [{ id: 'NL', val: 'null', kind: 'null' }, ...nodesFrom(input.vals), { id: 'NR', val: 'null', kind: 'null' }];
    const real = nodes.slice(1, -1);
    const next = {};
    real.forEach((nd, k) => { next[nd.id] = k + 1 < real.length ? real[k + 1].id : 'NR'; });
    const val = (id) => (id === 'NL' || id === 'NR' || id === null ? 'null' : nodes.find((x) => x.id === id).val);
    let prev = 'NL', cur = real[0].id, nxt = null;
    const snap = (s) => steps.push({ nodes, next: { ...next }, ...s });
    snap({
      kind: 'start', ptrs: { prev, cur }, lines: ['init'],
      title: 'prev = null, cur = head',
      text: 'To reverse the list, every arrow has to turn around. prev is the part already reversed (nothing yet: null), cur is the node being flipped. Each node takes three moves: save, flip, advance.',
      calc: ['prev = null', `cur = ${val(cur)}`],
    });
    while (cur !== 'NR') {
      nxt = next[cur];
      snap({
        kind: 'save', ptrs: { prev, cur, next: nxt }, hot: [[cur, nxt]], lines: ['loop', 'save'],
        title: `Save next = ${val(nxt)}`,
        text: `Before touching cur.next, remember where it goes (${val(nxt)}). The moment ${val(cur)}.next is changed, that arrow is the only route to the rest of the list; without the saved copy, it would be lost.`,
        calc: [`next = cur.next = ${val(nxt)}`],
      });
      next[cur] = prev;
      snap({
        kind: 'flip', ptrs: { prev, cur, next: nxt }, fresh: [[cur, prev]], lines: ['flip'],
        title: `Flip: ${val(cur)}.next = ${val(prev)}`,
        text: `${val(cur)} now points back to ${val(prev)}. The old arrow to ${val(nxt)} is gone, but next still holds it.`,
        calc: [`cur.next = prev = ${val(prev)}`],
      });
      prev = cur;
      cur = nxt;
      snap({
        kind: 'adv', ptrs: { prev, cur }, lines: ['adv'],
        title: cur === 'NR' ? 'Advance: cur ran off the end' : `Advance: prev = ${val(prev)}, cur = ${val(cur)}`,
        text: cur === 'NR' ? `Every arrow has been flipped. cur is null, so the loop stops.` : `The reversed part now ends at ${val(prev)}. Move on to ${val(cur)}.`,
        calc: [`prev = ${val(prev)}`, `cur = ${val(cur)}`],
      });
    }
    const out = walk(next, prev).filter((id) => id !== 'NL').map((id) => val(id));
    snap({
      kind: 'done', ptrs: { prev }, crown: prev, lines: ['ret'], answer: list(out),
      title: `Return prev: ${out.join(' → ')}`,
      text: `prev is the old tail and the new head. Returning head instead would return ${val(real[0].id)}, which is now the tail. O(n) time, O(1) space.`,
      calc: [`return prev (${val(prev)})`],
    });
    return steps;
  }
  const { left, right } = input;
  const nodes = [{ id: 'D', val: 'dummy', kind: 'dummy' }, ...nodesFrom(input.vals)];
  const next = chain(nodes);
  const val = (id) => (id === null ? 'null' : nodes.find((x) => x.id === id).val);
  const snap = (s) => steps.push({ nodes, next: { ...next }, order: walk(next, 'D'), ...s });
  let before = 'D';
  snap({
    kind: 'start', ptrs: { before }, lines: ['init'],
    title: `Reverse positions ${left} to ${right}`,
    text: `Walk to the node just before the segment, then repeatedly take the node after cur and move it to the front of the segment. The dummy covers left = 1, where the node before the segment would otherwise not exist.`,
    calc: [`left = ${left}, right = ${right}`, 'before = dummy'],
  });
  for (let i = 1; i < left; i++) {
    before = next[before];
    snap({ kind: 'walk', ptrs: { before }, lines: ['walk'], title: `before → ${val(before)}`, text: left - 1 - i > 0 ? `before walks towards position ${left - 1}, the node in front of the segment: ${plural(left - 1 - i, 'more step')} to go.` : `before is now on position ${left - 1}, right in front of the segment that starts at position ${left}.`, calc: [`before = ${val(before)}`] });
  }
  const cur = next[before];
  snap({ kind: 'cur', ptrs: { before, cur }, lines: ['cur'], title: `cur = ${val(cur)}, the segment's first node`, text: `cur stays on node ${val(cur)} the whole time. As nodes are moved in front of it, it drifts to the end of the segment and finishes as its tail.`, calc: [`cur = before.next = ${val(cur)}`] });
  for (let i = 0; i < right - left; i++) {
    const move = next[cur];
    snap({ kind: 'take', ptrs: { before, cur, move }, hot: [[cur, move]], lines: ['loop', 'take'], title: `move = ${val(move)}: the node after cur`, text: `${val(move)} will be cut out from behind cur and put at the front of the segment, right after before.`, calc: [`move = cur.next = ${val(move)}`] });
    next[cur] = next[move];
    next[move] = next[before];
    next[before] = move;
    snap({
      kind: 'relink', ptrs: { before, cur, move }, fresh: [[cur, next[cur]], [move, next[move]], [before, move]], moved: move, lines: ['skip', 'front', 'link'],
      title: `${val(move)} moves to the front of the segment`,
      text: `Three arrows change: cur skips over ${val(move)} (to ${val(next[cur])}), ${val(move)} points at the old front (${val(next[move])}), and before points at ${val(move)}. Now: ${walk(next, next.D).map((id) => val(id)).join(' → ')}.`,
      calc: [`cur.next = ${val(next[cur])}`, `move.next = ${val(next[move])}`, `before.next = ${val(move)}`],
    });
  }
  const out = walk(next, next.D).map((id) => val(id));
  snap({ kind: 'done', ptrs: { before, cur }, lines: ['ret'], answer: list(out), title: `Done: ${out.join(' → ')}`, text: `${plural(right - left, 'move')} reversed positions ${left}…${right} in one pass and O(1) space. cur (${val(cur)}) is now the segment's tail and still links to the rest of the list.`, calc: [`return dummy.next`] });
  return steps;
}

export function parseReverse(values, input) {
  const a = parseInts(values.vals, { min: -99, max: 99, minLen: 1, maxLen: input.mode === 'whole' ? 7 : 8, name: 'list' });
  if (a.error) return a;
  if (input.mode === 'whole') return { input: { mode: 'whole', vals: a.arr } };
  const l = parseInt1(values.left, { min: 1, max: a.arr.length, name: 'left' });
  if (l.error) return { error: `left must be between 1 and ${a.arr.length}.` };
  const r = parseInt1(values.right, { min: l.v, max: a.arr.length, name: 'right' });
  return r.error ? { error: `right must be between left (${l.v}) and ${a.arr.length}.` } : { input: { mode: 'between', vals: a.arr, left: l.v, right: r.v } };
}

export function randomReverse(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'whole') return { mode: 'whole', vals: Array.from({ length: g.int(2, 6) }, (_, k) => k + 1) };
  const n = g.int(3, 8);
  const left = g.int(1, n - 1);
  return { mode: 'between', vals: Array.from({ length: n }, (_, k) => k + 1), left, right: g.int(left + 1, n) };
}

// ---------------------------------------------------------------- dummy nodes: remove and merge

export const DUMMY = {
  remove: { label: 'Remove a value', input: { mode: 'remove', vals: [6, 1, 6, 6, 3, 6], val: 6 } },
  merge: { label: 'Merge two sorted lists', input: { mode: 'merge', a: [1, 2, 4], b: [1, 3, 4, 5] } },
};

export const dummyCode = {
  remove: [
    ['init', 'ListNode dummy = new ListNode(0, head), cur = dummy;'],
    ['loop', 'while (cur.next != null) {'],
    ['unlink', '    if (cur.next.val == val) cur.next = cur.next.next;   // don\'t advance'],
    ['adv', '    else cur = cur.next;'],
    ['end', '}'],
    ['ret', 'return dummy.next;'],
  ],
  merge: [
    ['init', 'ListNode dummy = new ListNode(0), tail = dummy;'],
    ['loop', 'while (a != null && b != null) {'],
    ['takeA', '    if (a.val <= b.val) { tail.next = a; a = a.next; }'],
    ['takeB', '    else                { tail.next = b; b = b.next; }'],
    ['tail', '    tail = tail.next;'],
    ['end', '}'],
    ['rest', 'tail.next = a != null ? a : b;     // attach whatever is left'],
    ['ret', 'return dummy.next;'],
  ],
};

export function dummy(input) {
  const steps = [];
  if (input.mode === 'remove') {
    const nodes = [{ id: 'D', val: 'dummy', kind: 'dummy' }, ...nodesFrom(input.vals)];
    const next = chain(nodes);
    const removed = [];
    const val = (id) => (id === null ? 'null' : nodes.find((x) => x.id === id).val);
    const snap = (s) => steps.push({ nodes, next: { ...next }, removed: [...removed], order: walk(next, 'D'), ...s });
    let cur = 'D';
    snap({
      kind: 'start', ptrs: { cur }, lines: ['init'],
      title: `Remove every ${input.val}, starting from a dummy`,
      text: `cur always looks one node ahead, at cur.next, because unlinking a node needs the node before it. The dummy is the "node before" the head, so a matching head is removed exactly like any other node.`,
      calc: [`val = ${input.val}`, 'cur = dummy'],
    });
    while (next[cur] !== null) {
      const t = next[cur];
      if (val(t) === input.val) {
        next[cur] = next[t];
        removed.push(t);
        snap({
          kind: 'unlink', ptrs: { cur }, fresh: next[cur] === null ? [] : [[cur, next[cur]]], dropped: t, snipped: [cur, t], lines: ['loop', 'unlink'],
          title: `cur.next is ${input.val}: unlink it, and don't move cur`,
          text: `${val(cur) === 'dummy' ? 'The dummy' : `Node ${val(cur)}`} now points past it, to ${val(next[cur])}. cur stays put: the node that just slid into cur.next has not been checked yet${next[cur] !== null && val(next[cur]) === input.val ? ', and it is another ' + input.val : ''}.`,
          calc: [`cur.next.val == ${input.val}`, `cur.next = cur.next.next = ${val(next[cur])}`],
        });
      } else {
        cur = t;
        snap({ kind: 'adv', ptrs: { cur }, lines: ['loop', 'adv'], title: `cur.next is ${val(t)}: keep it, advance`, text: `${val(t)} stays in the list; cur moves onto it.`, calc: [`${val(t)} != ${input.val}`, `cur = ${val(t)}`] });
      }
    }
    const out = walk(next, next.D).map((id) => val(id));
    snap({ kind: 'done', ptrs: { cur }, lines: ['ret'], answer: list(out), title: `Done: ${out.length ? out.join(' → ') : 'empty list'}`, text: `${plural(removed.length, 'node')} removed in one pass. Return dummy.next, which ${removed.some((id) => id === 'n0') ? 'is no longer the original head: the dummy absorbed that change' : 'is still the original head'}.`, calc: ['return dummy.next'] });
    return steps;
  }
  const A = input.a.map((val, k) => ({ id: `a${k}`, val, row: 'a' }));
  const B = input.b.map((val, k) => ({ id: `b${k}`, val, row: 'b' }));
  const nodes = [{ id: 'D', val: 'dummy', kind: 'dummy', row: 'r' }, ...A, ...B];
  const next = { D: null, ...chain(A), ...chain(B) };
  let a = A.length ? A[0].id : null, b = B.length ? B[0].id : null, tail = 'D';
  const val = (id) => (id === null ? 'null' : nodes.find((x) => x.id === id).val);
  /** The answer so far: from the dummy up to tail. Past tail, next may still point into a or b (a stale link the next step overwrites). */
  const built = () => { const ids = walk(next, 'D'); return ids.slice(0, ids.indexOf(tail) + 1); };
  const snap = (s) => steps.push({ nodes, next: { ...next }, result: s.kind === 'rest' ? walk(next, 'D') : built(), ptrs: { tail, ...(a ? { a } : {}), ...(b ? { b } : {}) }, ...s });
  snap({
    kind: 'start', lines: ['init'],
    title: 'An empty answer: just the dummy',
    text: 'The dummy is the start of the answer and tail is where the next node goes. Each step compares the two fronts and links the smaller one after tail. No special case for the first node of the answer.',
    calc: ['tail = dummy'],
  });
  while (a !== null && b !== null) {
    const takeA = val(a) <= val(b);
    const pick = takeA ? a : b;
    next[tail] = pick;
    const prevTail = tail;
    if (takeA) a = next[a]; else b = next[b];
    tail = pick;
    snap({
      kind: takeA ? 'takeA' : 'takeB', moved: pick, fresh: [[prevTail, pick]], lines: ['loop', takeA ? 'takeA' : 'takeB', 'tail'],
      title: `${val(pick)} from ${takeA ? 'a' : 'b'} (${takeA ? `${val(pick)} ≤ ${val(b)}` : `${val(a)} > ${val(pick)}`})`,
      text: `Compare the fronts: ${takeA ? `a's ${val(pick)} ≤ b's ${val(b)}` : `a's ${val(a)} > b's ${val(pick)}`}. Link it after tail and move tail onto it. ${takeA ? 'Ties go to a, which keeps the merge stable.' : ''} No new nodes are created: the existing ones are re-linked.`.trim(),
      calc: [`${val(takeA ? pick : a)} ${takeA ? '<=' : '>'} ${val(takeA ? b : pick)}`, `tail.next = ${val(pick)}`, `tail = ${val(pick)}`],
    });
  }
  const restHead = a ?? b;
  next[tail] = restHead;
  const out = walk(next, next.D).map((id) => val(id));
  snap({
    kind: 'rest', fresh: restHead ? [[tail, restHead]] : [], lines: ['rest', 'ret'], answer: list(out),
    title: restHead ? `One list is empty: attach the rest of ${a ? 'a' : 'b'}` : 'Both lists are used up',
    text: `${restHead ? `The remaining nodes are already sorted and all at least ${val(tail)}, so one link attaches them all.` : 'Nothing left to attach.'} Return dummy.next: ${out.join(' → ')}. O(n + m) time, O(1) extra space.`,
    calc: [`tail.next = ${restHead ? val(restHead) : 'null'}`, 'return dummy.next'],
  });
  return steps;
}

export function parseDummy(values, input) {
  if (input.mode === 'remove') {
    const a = parseInts(values.vals, { min: -9, max: 9, minLen: 1, maxLen: 8, name: 'list' });
    if (a.error) return a;
    const v = parseInt1(values.val, { min: -9, max: 9, name: 'val' });
    return v.error ? v : { input: { mode: 'remove', vals: a.arr, val: v.v } };
  }
  const a = parseInts(values.a, { min: -99, max: 99, minLen: 0, maxLen: 5, name: 'a' });
  const b = parseInts(values.b, { min: -99, max: 99, minLen: 0, maxLen: 5, name: 'b' });
  if (a.error && String(values.a ?? '').trim()) return a;
  if (b.error && String(values.b ?? '').trim()) return b;
  const A = a.arr ?? [], B = b.arr ?? [];
  if (!A.length && !B.length) return { error: 'Give at least one of the two lists a value.' };
  return { input: { mode: 'merge', a: [...A].sort((x, y) => x - y), b: [...B].sort((x, y) => x - y) } };
}

export function randomDummy(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'remove') {
    const val = g.int(1, 4);
    return { mode: 'remove', vals: Array.from({ length: g.int(3, 8) }, () => (g.bool(0.4) ? val : g.int(1, 6))), val };
  }
  const mk = () => Array.from({ length: g.int(1, 5) }, () => g.int(0, 9)).sort((x, y) => x - y);
  return { mode: 'merge', a: mk(), b: mk() };
}

