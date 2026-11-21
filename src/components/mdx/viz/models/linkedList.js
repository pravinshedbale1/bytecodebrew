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
  detect: { label: 'Is there a cycle?', input: { mode: 'detect', vals: [3, 2, 0, -4], pos: 1 } },
  happy: { label: 'Happy number: 19', input: { mode: 'happy', n: 19 } },
  unhappy: { label: 'Not happy: 2', input: { mode: 'happy', n: 2 } },
  dup: { label: 'Find the duplicate', input: { mode: 'dup', nums: [1, 3, 4, 2, 2] } },
  palin: { label: 'Palindrome list', input: { mode: 'palin', vals: [1, 2, 2, 1] } },
  reorder: { label: 'Reorder list', input: { mode: 'reorder', vals: [1, 2, 3, 4, 5] } },
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
  detect: [
    ['init', 'ListNode slow = head, fast = head;'],
    ['loop', 'while (fast != null && fast.next != null) {'],
    ['move', '    slow = slow.next; fast = fast.next.next;'],
    ['meet', '    if (slow == fast) return true;         // fast lapped slow'],
    ['end', '}'],
    ['none', 'return false;                           // fast fell off: no cycle'],
  ],
  happy: [
    ['sig', 'int next(int n)   // the sum of the squares of n\'s digits'],
    ['init', 'int slow = n, fast = n;'],
    ['loop', 'while (true) {'],
    ['move', '    slow = next(slow); fast = next(next(fast));'],
    ['meet', '    if (slow == fast) return slow == 1;   // which loop did they meet in?'],
    ['end', '}'],
  ],
  dup: [
    ['init', 'int slow = 0, fast = 0;   // index i links to index nums[i]'],
    ['loop', 'do {'],
    ['move', '    slow = nums[slow]; fast = nums[nums[fast]];'],
    ['meet', '} while (slow != fast);'],
    ['p', 'int p = 0;'],
    ['walk', 'while (p != slow) { p = nums[p]; slow = nums[slow]; }'],
    ['ret', 'return p;                 // the loop\'s entrance = the duplicate'],
  ],
  palin: [
    ['init', 'ListNode slow = head, fast = head;'],
    ['loop', 'while (fast.next != null && fast.next.next != null) {'],
    ['move', '    slow = slow.next; fast = fast.next.next;   // slow ends the first half'],
    ['end', '}'],
    ['cut', 'ListNode cur = slow.next, prev = null; slow.next = null;   // cut'],
    ['flip', 'while (cur != null) { ListNode nx = cur.next; cur.next = prev; prev = cur; cur = nx; }'],
    ['cmp', 'for (ListNode a = head, b = prev; b != null; a = a.next, b = b.next)'],
    ['diff', '    if (a.val != b.val) return false;'],
    ['ret', 'return true;   // then reverse the second half back to restore the list'],
  ],
  reorder: [
    ['init', 'ListNode slow = head, fast = head;'],
    ['loop', 'while (fast.next != null && fast.next.next != null) {'],
    ['move', '    slow = slow.next; fast = fast.next.next;   // slow ends the first half'],
    ['end', '}'],
    ['cut', 'ListNode cur = slow.next, prev = null; slow.next = null;   // cut'],
    ['flip', 'while (cur != null) { ListNode nx = cur.next; cur.next = prev; prev = cur; cur = nx; }'],
    ['weave', 'for (ListNode a = head, b = prev; b != null; ) {'],
    ['link', '    ListNode an = a.next, bn = b.next; a.next = b; b.next = an; a = an; b = bn;'],
    ['close', '}'],
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

function cycleRun({ vals, pos, detect = false }) {
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
        kind: 'none', ptrs: fast === null ? { slow } : { slow, fast }, phase: 1, lines: ['loop', 'none'], answer: detect ? 'false' : 'no cycle',
        title: 'fast reached the end: no cycle',
        text: `${fast === null ? 'fast stepped off the last node and is null' : `fast is on the last node, ${val(fast)}, and fast.next is null`}: the list ends, so it cannot loop. Without a cycle fast always gets there first, after about n/2 steps. Return null.`,
        calc: [fast === null ? 'fast == null' : 'fast.next == null', 'return null'],
      });
      if (detect) { steps.at(-1).text = steps.at(-1).text.replace('Return null.', 'Return false.'); steps.at(-1).calc[1] = 'return false'; }
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
    if (met && detect) {
      Object.assign(steps.at(-1), { answer: 'true', lines: ['move', 'meet'] });
      steps.at(-1).calc.push('return true');
      return steps;
    }
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

/** The sum of the squares of the digits (Happy Number's next). */
export const digitSquares = (x) => String(x).split('').reduce((t, d) => t + Number(d) * Number(d), 0);

/** A sequence x → step(x) as list values up to its first repeat, and where the repeat joins (the cycle's pos). */
function rho(start, step) {
  const seq = [];
  const at = new Map();
  let x = start;
  while (!at.has(x)) { at.set(x, seq.length); seq.push(x); x = step(x); }
  return { seq, pos: at.get(x) };
}

export const happyChain = (n) => rho(n, digitSquares);
export const dupChain = (nums) => rho(0, (i) => nums[i]);

function happyRun({ n }) {
  const { seq, pos } = happyChain(n);
  const steps = cycleRun({ vals: seq, pos, detect: true });
  const sq = (x) => String(x).split('').map((d) => `${d}²`).join(' + ');
  Object.assign(steps[0], {
    title: `Follow ${n} → ${digitSquares(n)} → …`,
    text: `Each number points to the sum of the squares of its digits (${n} → ${sq(n)} = ${digitSquares(n)}), so the numbers form a linked list. The sums stay small, so a number must repeat sooner or later: the list always ends in a loop. n is happy when that loop is 1 → 1. Run slow and fast; where they meet says which loop it is.`,
    calc: [`next(${n}) = ${sq(n)} = ${digitSquares(n)}`, 'slow = fast = n'],
  });
  const meet = steps.at(-1);
  const v = seq[seq.findIndex((_, k) => `n${k}` === meet.ptrs.slow)];
  Object.assign(meet, {
    answer: v === 1 ? 'true' : 'false',
    title: v === 1 ? 'They meet at 1: happy' : `They meet at ${v}, not 1: not happy`,
    text: v === 1
      ? 'slow and fast meet at 1, and 1 only ever leads back to 1 (1² = 1). The sequence reaches 1, so n is happy. No set of seen numbers was needed.'
      : `slow and fast meet at ${v}, inside a loop that never visits 1 (${seq.slice(pos).join(' → ')} → ${seq[pos]}). The sequence goes round it forever, so n is not happy.`,
    calc: [`slow == fast == ${v}`, `return ${v} == 1 → ${v === 1}`],
  });
  return steps;
}

function dupRun({ nums }) {
  const { seq, pos } = dupChain(nums);
  const steps = cycleRun({ vals: seq, pos });
  Object.assign(steps[0], {
    title: `Read [${nums.join(', ')}] as a linked list`,
    text: `Each box is an index i, and its arrow goes to index nums[i]. No value is 0, so nothing points back to index 0: start there. The duplicate value sits in two places, so two arrows enter the same box: that box is where the loop starts, and its index is the duplicate.`,
    calc: nums.map((v, i) => `${i} → ${v}`).slice(0, 6).concat(nums.length > 6 ? ['…'] : []),
  });
  const last = steps.at(-1);
  last.answer = `duplicate = ${seq[pos]}`;
  last.title = `The loop starts at index ${seq[pos]}: the duplicate is ${seq[pos]}`;
  last.text = `Two different indexes hold the value ${seq[pos]}, so two arrows point into box ${seq[pos]}: one from the path, one from inside the loop. That is exactly the entrance Floyd's phase 2 finds. O(n) time, O(1) space, and the array was never changed.`;
  return steps;
}

/** Middle, cut, reverse the second half, then compare (palin) or weave (reorder). */
function halvesRun({ vals, mode }) {
  const nodes = nodesFrom(vals);
  const next = chain(nodes);
  const steps = [];
  const val = (id) => (id === null ? 'null' : nodes.find((x) => x.id === id).val);
  const snap = (s) => steps.push({ nodes, next: { ...next }, pos: -1, ...s });
  const head = nodes[0].id;
  let slow = head, fast = head;
  snap({
    kind: 'start', ptrs: { slow, fast }, lines: ['init'],
    title: mode === 'palin' ? 'A singly linked list can\'t be read backwards' : 'The new order takes from the front and the back',
    text: mode === 'palin'
      ? 'To compare the first value with the last, the second with the second-last, and so on, make the second half readable backwards: find the middle, reverse the second half, then walk both halves together.'
      : 'L0, Ln, L1, Ln−1, …: the first half interleaved with the second half read backwards. So find the middle, reverse the second half, then weave the two halves together.',
    calc: ['slow = head, fast = head'],
  });
  while (next[fast] !== null && next[next[fast]] !== null) {
    const sf = slow, f0 = fast, f1 = next[fast];
    slow = next[slow];
    fast = next[f1];
    snap({ kind: 'move', ptrs: { slow, fast }, trails: [[sf, slow, 'accent'], [f0, f1, 'warn'], [f1, fast, 'warn']], lines: ['loop', 'move'], title: `slow → ${val(slow)}, fast → ${val(fast)}`, text: 'slow takes one step and fast two. When fast can\'t take two more, slow is at the end of the first half.', calc: [`slow = ${val(slow)}`, `fast = ${val(fast)}`] });
  }
  const second = next[slow];
  next[slow] = null;
  const half = nodes.findIndex((x) => x.id === slow) + 1;
  snap({
    kind: 'cut', ptrs: { slow, ...(second ? { cur: second } : {}) }, snipped: second ? [slow, second] : undefined, lines: ['loop', 'end', 'cut'],
    title: second ? `Cut after ${val(slow)}: two halves` : 'One node: nothing to cut',
    text: second
      ? `The first half is the first ${half} node${half === 1 ? '' : 's'} (with an odd length it keeps the middle). Cut the link after slow; the second half starts at ${val(second)}.`
      : 'A single node has no second half.',
    calc: [`first half: ${vals.slice(0, half).join(' → ')}`, `second half: ${second ? vals.slice(half).join(' → ') : 'empty'}`],
  });
  let prev = null, cur = second;
  while (cur !== null) {
    const nx = next[cur];
    next[cur] = prev;
    const flipped = cur;
    prev = cur;
    cur = nx;
    snap({
      kind: 'flip', ptrs: { prev, ...(cur ? { cur } : {}) }, fresh: next[flipped] ? [[flipped, next[flipped]]] : [], lines: ['flip'],
      title: `Flip ${val(flipped)}: it now points to ${next[flipped] === null ? 'null' : val(next[flipped])}`,
      text: cur ? 'Save the next node, point this one backwards, and move on.' : `The second half is reversed: it now reads ${walk(next, prev).map(val).join(' → ')}, from the old tail.`,
      calc: [`${val(flipped)}.next = ${next[flipped] === null ? 'null' : val(next[flipped])}`, `prev = ${val(prev)}`, `cur = ${val(cur)}`],
    });
  }
  let a = head, b = prev;
  if (mode === 'palin') {
    const matched = [];
    while (b !== null) {
      if (val(a) !== val(b)) {
        snap({ kind: 'differ', ptrs: { a, b }, matched: [...matched], bad: [a, b], lines: ['cmp', 'diff'], answer: 'false', title: `${val(a)} ≠ ${val(b)}: not a palindrome`, text: 'A value and its mirror differ, so the list doesn\'t read the same backwards. Return false (after reversing the second half back, if the list must be left as it was).', calc: [`${val(a)} != ${val(b)} → return false`] });
        return steps;
      }
      matched.push(a, b);
      snap({ kind: 'compare', ptrs: { a, b }, matched: [...matched], lines: ['cmp'], title: `${val(a)} = ${val(b)}`, text: 'a walks the first half from the front, b walks the reversed second half from the old tail: each value meets its mirror.', calc: [`a = ${val(a)}, b = ${val(b)} → equal`] });
      a = next[a];
      b = next[b];
    }
    snap({ kind: 'done', ptrs: {}, matched: [...matched], lines: ['ret'], answer: 'true', title: 'Every value matched its mirror: a palindrome', text: `b ran out${vals.length % 2 ? ' (the middle node has no partner and needs none)' : ''}. Return true. O(n) time and O(1) extra space; reversing the second half back restores the list.`, calc: ['b == null → return true'] });
    return steps;
  }
  while (b !== null) {
    const an = next[a], bn = next[b];
    next[a] = b;
    next[b] = an;
    snap({ kind: 'weave', ptrs: { a, b }, fresh: [[a, b], ...(an ? [[b, an]] : [])], lines: ['weave', 'link'], title: `${val(a)} → ${val(b)}${an ? ` → ${val(an)}` : ''}`, text: 'Slot the next node of the reversed half in after a, then move a and b on.', calc: [`${val(a)}.next = ${val(b)}`, `${val(b)}.next = ${val(an)}`] });
    a = an;
    b = bn;
  }
  const order = walk(next, head);
  snap({ kind: 'done', ptrs: {}, order, lines: ['close'], answer: `[${order.map(val).join(', ')}]`, title: `Reordered: ${order.map(val).join(' → ')}`, text: 'The second half has been woven in. Only next pointers changed: no values moved, no new nodes. O(n) time, O(1) extra space.', calc: [`list = ${order.map(val).join(' → ')}`] });
  return steps;
}

export function fastSlow(input) {
  if (input.mode === 'cycle') return cycleRun(input);
  if (input.mode === 'detect') return cycleRun({ ...input, detect: true });
  if (input.mode === 'happy') return happyRun(input);
  if (input.mode === 'dup') return dupRun(input);
  if (input.mode === 'palin' || input.mode === 'reorder') return halvesRun(input);
  if (input.mode === 'middle') return middleRun(input);
  return nthRun(input);
}

export function parseFastSlow(values, input) {
  if (input.mode === 'happy') {
    const n = parseInt1(values.n, { min: 1, max: 999, name: 'n' });
    if (n.error) return { error: 'n must be a whole number from 1 to 999.' };
    const len = happyChain(n.v).seq.length;
    return len > 10 ? { error: `${n.v} takes ${len} numbers before it repeats; pick one that repeats within 10 (try 2, 7, 19, 20 or 100).` } : { input: { mode: 'happy', n: n.v } };
  }
  if (input.mode === 'dup') {
    const d = parseInts(values.nums, { min: 1, max: 8, minLen: 2, maxLen: 9, name: 'nums' });
    if (d.error) return d;
    const m = d.arr.length;
    if (d.arr.some((v) => v > m - 1)) return { error: `With ${m} numbers, every value must be between 1 and ${m - 1}.` };
    const reps = new Set(d.arr.filter((v, i) => d.arr.indexOf(v) !== i));
    return reps.size !== 1 ? { error: 'Exactly one value should repeat.' } : { input: { mode: 'dup', nums: d.arr } };
  }
  const a = parseInts(values.vals, { min: -99, max: 99, minLen: 1, maxLen: 9, name: 'list' });
  if (a.error) return a;
  if (input.mode === 'cycle' || input.mode === 'detect') {
    const p = parseInt1(values.pos, { min: -1, max: a.arr.length - 1, name: 'pos' });
    return p.error ? { error: `pos must be −1 (no cycle) or an index from 0 to ${a.arr.length - 1}.` } : { input: { mode: input.mode, vals: a.arr, pos: p.v } };
  }
  if (input.mode === 'palin' || input.mode === 'reorder') return { input: { mode: input.mode, vals: a.arr } };
  if (input.mode === 'middle') return { input: { mode: 'middle', vals: a.arr } };
  const n = parseInt1(values.n, { min: 1, max: a.arr.length, name: 'n' });
  return n.error ? { error: `n must be between 1 and ${a.arr.length}.` } : { input: { mode: 'nth', vals: a.arr, n: n.v } };
}

export function randomFastSlow(input, rand = Math.random) {
  const g = rng(rand);
  const vals = Array.from({ length: g.int(input.mode === 'cycle' ? 3 : 2, 9) }, (_, k) => k + 1);
  if (input.mode === 'cycle' || input.mode === 'detect') return { mode: input.mode, vals, pos: g.bool(0.8) ? g.int(0, vals.length - 1) : -1 };
  if (input.mode === 'happy') { let n; do n = g.int(1, 999); while (happyChain(n).seq.length > 10); return { mode: 'happy', n }; }
  if (input.mode === 'dup') {
    const m = g.int(2, 9);
    const d = g.int(1, m - 1);
    const pool = Array.from({ length: m - 1 }, (_, k) => k + 1).filter((v) => v !== d);
    const others = pool.sort(() => rand() - 0.5).slice(0, m - 1 - g.int(1, Math.min(3, m - 1)));
    const nums = [...others];
    while (nums.length < m) nums.push(d);
    return { mode: 'dup', nums: nums.sort(() => rand() - 0.5) };
  }
  if (input.mode === 'palin') {
    const h = Array.from({ length: g.int(0, 4) }, () => g.int(1, 3));
    const mid = g.bool(0.5) ? [g.int(1, 3)] : [];
    const v = [...h, ...mid, ...[...h].reverse()];
    if (g.bool(0.4) && v.length > 1) v[g.int(0, v.length - 1)] = 9;
    return { mode: 'palin', vals: v.length ? v : [1] };
  }
  if (input.mode === 'reorder') return { mode: 'reorder', vals };
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

