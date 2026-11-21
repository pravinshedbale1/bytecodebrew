/**
 * Models for QueueViz.jsx (pure, Node-safe; checked by scripts/viz-check.mjs against brute force):
 *   maxQueue     a queue that answers max (or min) in O(1): the queue plus a monotonic deque beside it
 *   limitWindow  1438: the longest window whose max − min ≤ limit, with a max-deque and a min-deque
 *   lazyHeap     2034 Stock Price Fluctuation: heaps with lazy deletion (stale entries skipped on read)
 *   partitionK   2294: sort, then open a new group when a value is more than k above the group's first
 *   visiblePeople 1944: a decreasing stack from the right; each pop is a person you can see
 *   fixedBounds  2444: last bad index, last minK, last maxK give the valid starts
 *   flipWindow   995: forced greedy with a running count of the flips covering i
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- max (or min) queue

export const MAX_QUEUE = {
  max: { label: 'Max queue', input: { mode: 'max', ops: [['push', 3], ['push', 1], ['push', 4], ['max'], ['push', 2], ['pop'], ['max'], ['pop'], ['max'], ['push', 5], ['max']] } },
  min: { label: 'Min queue', input: { mode: 'min', ops: [['push', 4], ['push', 2], ['push', 5], ['min'], ['pop'], ['min'], ['pop'], ['push', 1], ['min']] } },
};

export const maxQueueCode = (mode) => {
  const cmp = mode === 'max' ? '<' : '>';
  return [
    ['fields', 'Deque<Integer> q, best;          // best: ' + (mode === 'max' ? 'decreasing' : 'increasing')],
    ['push', 'void push(int x) {'],
    ['push', '    q.offerLast(x);'],
    ['push', `    while (!best.isEmpty() && best.peekLast() ${cmp} x) best.pollLast();`],
    ['push', '    best.offerLast(x);'],
    ['push', '}'],
    ['pop', 'int pop() {'],
    ['pop', '    int x = q.pollFirst();'],
    ['pop', '    if (best.peekFirst() == x) best.pollFirst();'],
    ['pop', '    return x;'],
    ['pop', '}'],
    ['read', `int ${mode}() { return best.peekFirst(); }`],
  ];
};

const beatsQ = (mode, a, b) => (mode === 'max' ? a > b : a < b);

export function maxQueueAnswer({ mode, ops }) {
  const q = [], out = [];
  for (const [op, v] of ops) {
    if (op === 'push') q.push(v);
    else if (op === 'pop') q.shift();
    else out.push((mode === 'max' ? Math.max : Math.min)(...q));
  }
  return out;
}

export function maxQueue(input) {
  const { mode, ops } = input;
  const q = [], best = [];   // items: { v, id }
  const out = [];
  const steps = [];
  let id = 0;
  const word = mode === 'max' ? 'maximum' : 'minimum';
  const smaller = mode === 'max' ? 'smaller' : 'larger';
  const snap = (x) => steps.push({ mode, q: q.map((it) => ({ ...it })), best: best.map((it) => ({ ...it })), out: [...out], ...x });
  snap({
    kind: 'start', op: null, lines: ['fields'],
    title: `A queue that knows its ${word} in O(1)`,
    text: `Scanning the queue for the ${word} is O(n). Keep a second deque, best, next to it: the values that could still become the ${word} later, in ${mode === 'max' ? 'decreasing' : 'increasing'} order. Its front is always the answer. A value can be thrown out of best as soon as a ${mode === 'max' ? 'bigger' : 'smaller'} value arrives behind it: the newcomer will stay in the queue at least as long, so the older value can never be the ${word} again.`,
    calc: ['q = [], best = []'],
  });
  for (const [op, v] of ops) {
    if (op === 'push') {
      const item = { v, id: id++ };
      q.push(item);
      const dropped = [];
      while (best.length && beatsQ(mode, v, best.at(-1).v)) dropped.push(best.pop().v);
      best.push(item);
      snap({
        kind: 'push', op: `push(${v})`, focus: item.id, dropped, lines: ['push'],
        title: dropped.length ? `push(${v}): ${list(dropped)} leave best` : `push(${v})`,
        text: dropped.length
          ? `${v} joins the back of the queue. In best, ${dropped.join(', ')} ${dropped.length === 1 ? 'is' : 'are'} ${smaller} than ${v} and arrived earlier, so ${dropped.length === 1 ? 'it' : 'they'} will leave the queue before ${v} does: ${dropped.length === 1 ? 'it' : 'they'} can never be the ${word} again. Drop ${dropped.length === 1 ? 'it' : 'them'} from the back of best, then add ${v}.`
          : `${v} joins the back of the queue and the back of best. Nothing in best is ${smaller} than ${v}, so everything there is still a candidate.`,
        calc: [`q = ${list(q.map((x) => x.v))}`, `best = ${list(best.map((x) => x.v))}`],
      });
    } else if (op === 'pop') {
      const gone = q.shift();
      const wasBest = best.length && best[0].id === gone.id;
      if (wasBest) best.shift();
      snap({
        kind: 'pop', op: 'pop()', gone: gone.v, lines: ['pop'],
        title: `pop() → ${gone.v}${wasBest ? `, and best loses it too` : ''}`,
        text: wasBest
          ? `${gone.v} leaves the front of the queue. It is also at the front of best (it was the current ${word}), so remove it there too; the next value in best takes over.`
          : `${gone.v} leaves the front of the queue. It isn't in best any more (a ${mode === 'max' ? 'bigger' : 'smaller'} value pushed later already removed it), so best doesn't change.`,
        calc: [`q = ${list(q.map((x) => x.v))}`, `best = ${list(best.map((x) => x.v))}`],
      });
    } else {
      out.push(best[0].v);
      snap({
        kind: 'read', op: `${mode}()`, lines: ['read'],
        title: `${mode}() → ${best[0].v}`,
        text: `The front of best is the ${word} of everything in the queue: O(1), no scan.`,
        calc: [`${mode} of ${list(q.map((x) => x.v))} = ${best[0].v}`],
      });
    }
  }
  snap({
    kind: 'done', op: null, lines: [], answer: list(out),
    title: `Answers: ${list(out)}`,
    text: 'Every value is added to best once and removed at most once, so each operation is O(1) amortised. The same structure is the monotonic deque inside Sliding Window Maximum: the window is just a queue.',
    calc: [`answers = ${list(out)}`],
  });
  return steps;
}

export const maxQueueText = (ops) => ops.map(([op, v]) => (op === 'push' ? `push ${v}` : op)).join(', ');

export function parseMaxQueue(values, input) {
  const parts = String(values.ops ?? '').toLowerCase().split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
  const ops = [];
  let size = 0;
  for (const t of parts) {
    let m;
    if ((m = /^push\s*\(?\s*(-?\d+)\s*\)?$/.exec(t))) { const v = Number(m[1]); if (Math.abs(v) > 99) return { error: 'Keep pushed values between −99 and 99.' }; ops.push(['push', v]); size++; }
    else if (/^pop\s*(\(\))?$/.test(t)) { if (!size) return { error: 'pop on an empty queue: push something first.' }; ops.push(['pop']); size--; }
    else if (/^(max|min)\s*(\(\))?$/.test(t)) { if (!size) return { error: `${input.mode} on an empty queue: push something first.` }; ops.push([input.mode]); }
    else return { error: `Couldn't read "${t}". Use push 3, pop, ${input.mode}.` };
  }
  if (!ops.length || ops.length > 14) return { error: 'Give 1 to 14 operations.' };
  return { input: { mode: input.mode, ops } };
}

export function randomMaxQueue(input, rand = Math.random) {
  const g = rng(rand);
  const ops = [];
  let size = 0;
  while (ops.length < g.int(8, 12)) {
    const r = g.int(0, 9);
    if (r < 5 || size === 0) { ops.push(['push', g.int(1, 9)]); size++; }
    else if (r < 7) { ops.push(['pop']); size--; }
    else ops.push([input.mode]);
  }
  if (size) ops.push([input.mode]); else ops.push(['push', g.int(1, 9)], [input.mode]);
  return { mode: input.mode, ops };
}

// ---------------------------------------------------------------- 1438: window with max − min ≤ limit

export const LIMIT_WINDOW = {
  lesson: { label: 'nums = [10,1,2,4,7,2], limit 5', input: { nums: [10, 1, 2, 4, 7, 2], limit: 5 } },
  tight: { label: 'limit 0: equal runs', input: { nums: [4, 2, 2, 2, 4, 4, 2, 2], limit: 0 } },
  count: { label: 'Count: [5,4,2,4], limit 2', input: { nums: [5, 4, 2, 4], limit: 2, goal: 'count' } },
  cost: { label: 'Cost ≤ 4: [1,3,2]', input: { nums: [1, 3, 2], limit: 4, goal: 'cost' } },
  prime: { label: 'Primes: [1,2,3], k = 1', input: { nums: [1, 2, 3], limit: 1, goal: 'prime' } },
};

/**
 * Goals: longest (1438: the longest window with max − min ≤ limit), count (2762: how many windows have
 * max − min ≤ limit), cost (3420: how many have (max − min) × length ≤ k), prime (3589: how many have at
 * least two primes whose largest − smallest ≤ k; the deques only hold primes).
 */
export const limitWindowCode = [
  ['grow', 'for (int r = 0; r < n; r++) {   // add a[r] to both deques'],
  ['maxdq', '    while (!maxQ.isEmpty() && maxQ.peekLast() < a[r]) maxQ.pollLast();'],
  ['maxdq', '    maxQ.offerLast(a[r]);'],
  ['mindq', '    while (!minQ.isEmpty() && minQ.peekLast() > a[r]) minQ.pollLast();'],
  ['mindq', '    minQ.offerLast(a[r]);'],
  ['shrink', '    while (maxQ.peekFirst() - minQ.peekFirst() > limit) {'],
  ['shrink', '        if (maxQ.peekFirst() == a[l]) maxQ.pollFirst();'],
  ['shrink', '        if (minQ.peekFirst() == a[l]) minQ.pollFirst();'],
  ['shrink', '        l++;'],
  ['shrink', '    }'],
  ['best', '    best = Math.max(best, r - l + 1);'],
  ['end', '}'],
];

export function limitWindowCodeFor(goal = 'longest') {
  if (goal === 'longest') return limitWindowCode;
  const prime = goal === 'prime';
  const cond = goal === 'cost' ? '(long) (max - min) * (r - l + 1) > k' : prime ? 'max - min > k' : 'max - min > limit';
  return [
    ['grow', `for (int r = 0; r < n; r++) {${prime ? '   // only primes join the deques' : ''}`],
    ...(prime ? [['grow', '    if (isPrime[a[r]]) { secondLast = last; last = r;']] : []),
    ['maxdq', `${prime ? '    ' : ''}    while (!maxQ.isEmpty() && a[maxQ.peekLast()] < a[r]) maxQ.pollLast(); maxQ.offerLast(r);`],
    ['mindq', `${prime ? '    ' : ''}    while (!minQ.isEmpty() && a[minQ.peekLast()] > a[r]) minQ.pollLast(); minQ.offerLast(r);${prime ? ' }' : ''}`],
    ['shrink', `    while (${cond}) {          // max, min: the deque fronts`],
    ['shrink', '        if (maxQ.peekFirst() == l) maxQ.pollFirst();'],
    ['shrink', '        if (minQ.peekFirst() == l) minQ.pollFirst();'],
    ['shrink', '        l++;'],
    ['shrink', '    }'],
    prime
      ? ['count', '    if (secondLast >= l) total += secondLast - l + 1;   // starts that keep two primes']
      : ['count', '    total += r - l + 1;                   // every start in [l, r] works'],
    ['end', '}'],
  ];
}

export function isPrimeSmall(x) {
  if (x < 2) return false;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
  return true;
}

export const isPrime = isPrimeSmall;

/** The brute-force answer, for the checks and the last step. */
export function limitWindowAnswer({ nums: a, limit, goal = 'longest' }) {
  let best = 0, total = 0;
  for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) {
    const part = a.slice(l, r + 1);
    if (goal === 'prime') {
      const ps = part.filter(isPrimeSmall);
      if (ps.length >= 2 && Math.max(...ps) - Math.min(...ps) <= limit) total++;
      continue;
    }
    const spread = Math.max(...part) - Math.min(...part);
    const ok = goal === 'cost' ? spread * part.length <= limit : spread <= limit;
    if (ok) { best = Math.max(best, r - l + 1); total++; }
  }
  return goal === 'longest' ? best : total;
}

export function limitWindow(input) {
  const { nums: a, limit, goal = 'longest' } = input;
  const n = a.length;
  const prime = goal === 'prime';
  const name = goal === 'longest' || goal === 'count' ? 'limit' : 'k';
  const maxQ = [], minQ = [];   // indexes
  const steps = [];
  let l = 0, best = 0, bestAt = null, total = 0, last = -1, secondLast = -1;
  const spread = () => (maxQ.length ? a[maxQ[0]] - a[minQ[0]] : 0);
  const bad = (r) => (goal === 'cost' ? spread() * (r - l + 1) > limit : spread() > limit);
  const what = (r) => (goal === 'cost' ? `(${a[maxQ[0]]} − ${a[minQ[0]]}) × ${r - l + 1} = ${spread() * (r - l + 1)}` : maxQ.length ? `${a[maxQ[0]]} − ${a[minQ[0]]} = ${spread()}` : 'no primes yet');
  const snap = (x) => steps.push({ l, maxQ: [...maxQ], minQ: [...minQ], best: goal === 'longest' ? best : total, bestAt, total, goal, countTo: null, ...x });
  const intro = {
    longest: ['Longest window of', 'A window is fine when its largest and smallest values are close enough, and shrinking a fine window keeps it fine: a sliding window. The hard part is knowing the window\'s max and min as values arrive on the right and leave on the left. That\'s exactly a max queue plus a min queue: two monotonic deques.'],
    count: ['Count the windows of', 'A window is fine when max − min ≤ limit, and every smaller window inside a fine one is fine too. So for each right end r, the fine windows are exactly those starting anywhere in [l, r]: r − l + 1 of them. The max queue and min queue keep the window\'s max and min.'],
    cost: ['Count the windows of', 'Cost = (max − min) × length. Shrinking a window can only lower both, so the cheap windows ending at r are exactly those starting in [l, r]: r − l + 1 of them. The max queue and min queue give max and min.'],
    prime: ['Count the windows of', 'Only primes matter here, so only primes join the max and min queues. Shrinking a window can only lower its prime spread, so for each r the starts that keep the spread ≤ k form a range [l, r]. Of those, the ones that still contain two primes start at or before the second-last prime.'],
  }[goal];
  snap({
    kind: 'start', r: null, lines: [],
    title: `${intro[0]} ${list(a)} ${goal === 'longest' || goal === 'count' ? `with max − min ≤ ${limit}` : goal === 'cost' ? `with cost ≤ ${limit}` : `with two primes at most ${limit} apart`}`,
    text: intro[1],
    calc: ['maxQ = [], minQ = []'],
  });
  for (let r = 0; r < n; r++) {
    const joins = !prime || isPrimeSmall(a[r]);
    if (joins) {
      while (maxQ.length && a[maxQ.at(-1)] < a[r]) maxQ.pop();
      maxQ.push(r);
      while (minQ.length && a[minQ.at(-1)] > a[r]) minQ.pop();
      minQ.push(r);
      if (prime) { secondLast = last; last = r; }
    }
    const over = bad(r);
    snap({
      kind: 'grow', r, over, tooMuch: over, lines: ['grow', ...(joins ? ['maxdq', 'mindq'] : [])],
      title: joins ? `Add a[${r}] = ${a[r]}${maxQ.length ? `: max ${a[maxQ[0]]}, min ${a[minQ[0]]}` : ''}` : `a[${r}] = ${a[r]} is not prime: the deques don't change`,
      text: joins
        ? `${a[r]} joins both deques; values it beats are dropped from their backs (they can't be the max or min while ${a[r]} is in the window). ${goal === 'cost' ? `Cost = ${what(r)}` : `The fronts give ${what(r)}`} ${over ? `> ${limit}: too much.` : `≤ ${limit}: fine.`}`
        : `Non-primes never affect the prime spread, but they still extend the window${over ? '' : ', so it stays fine'}.`,
      calc: [`window [${l}, ${r}]`, goal === 'cost' ? `cost = ${what(r)}` : `spread = ${what(r)}`],
    });
    if (over) {
      const from = l;
      while (bad(r)) {
        if (maxQ[0] === l) maxQ.shift();
        if (minQ[0] === l) minQ.shift();
        l++;
      }
      snap({
        kind: 'shrink', r, from, lines: ['shrink'],
        title: `Too ${goal === 'cost' ? 'costly' : 'wide'}: move l from ${from} to ${l}`,
        text: `Drop values from the left. When a dropped index is at the front of a deque, it leaves that deque too, and the next value becomes the max or min. Stop when ${goal === 'cost' ? `the cost, ${what(r)},` : `${what(r)}`} is ≤ ${limit}.`,
        calc: [`window [${l}, ${r}]`, goal === 'cost' ? `cost = ${what(r)}` : `spread = ${what(r)}`],
      });
    }
    if (goal === 'longest') {
      if (r - l + 1 > best) {
        best = r - l + 1;
        bestAt = [l, r];
        snap({
          kind: 'best', r, lines: ['best'],
          title: `New best: [${l}, ${r}], length ${best}`,
          text: `Window ${list(a.slice(l, r + 1))} has max − min ≤ ${limit} and is the longest so far.`,
          calc: [`best = ${r} − ${l} + 1 = ${best}`],
        });
      }
    } else {
      const c = prime ? (secondLast >= l ? secondLast - l + 1 : 0) : r - l + 1;
      total += c;
      snap({
        kind: 'count', r, add: c, countTo: c ? (prime ? secondLast : r) : null, lines: ['count'],
        title: c ? `${c} window${c === 1 ? '' : 's'} end at ${r}` : `No window ending at ${r} counts yet`,
        text: prime
          ? (c ? `A start must be ≥ l = ${l} (to keep the spread ≤ ${limit}) and ≤ ${secondLast}, the second-last prime, so that two primes are inside: ${secondLast} − ${l} + 1 = ${c}.` : secondLast < 0 ? 'Fewer than two primes so far.' : `The second-last prime, at ${secondLast}, is before l = ${l}: no start keeps two primes close enough.`)
          : `Every start from l = ${l} to r = ${r} gives a window that is ${goal === 'cost' ? 'cheap enough' : 'fine'}: [${l}..${r}], [${l + 1}..${r}], …, [${r}..${r}].`,
        calc: [prime ? `count = ${c}` : `r − l + 1 = ${r} − ${l} + 1 = ${c}`, `total = ${total}`],
      });
    }
  }
  const ans = goal === 'longest' ? best : total;
  snap({
    kind: 'done', r: null, lines: ['end'], answer: `${ans}`,
    title: goal === 'longest' ? `Longest: ${best}` : `Total: ${total}`,
    text: `Each index enters and leaves each deque at most once: O(n). The check: trying every subarray also gives ${limitWindowAnswer(input)}.`,
    calc: [goal === 'longest' ? `best = ${best}` : `total = ${total}`],
  });
  return steps;
}

export function parseLimitWindow(values, input = {}) {
  const goal = input.goal ?? 'longest';
  const r = parseInts(values.nums, { min: 1, max: goal === 'prime' ? 50 : 30, minLen: 1, maxLen: 10, name: 'nums' });
  if (r.error) return r;
  const k = parseInt1(values.limit, { min: 0, max: goal === 'cost' ? 300 : 30, name: goal === 'longest' || goal === 'count' ? 'limit' : 'k' });
  if (k.error) return k;
  return { input: { nums: r.arr, limit: k.v, ...(goal !== 'longest' ? { goal } : {}) } };
}

export function randomLimitWindow(input = {}, rand = Math.random) {
  const g = rng(rand);
  const goal = input.goal ?? 'longest';
  const nums = Array.from({ length: g.int(goal === 'longest' ? 5 : 3, 9) }, () => g.int(1, goal === 'prime' ? 20 : 12));
  const limit = goal === 'cost' ? g.int(0, 40) : g.int(0, 6);
  return { nums, limit, ...(goal !== 'longest' ? { goal } : {}) };
}

// ---------------------------------------------------------------- lazy deletion: Stock Price Fluctuation

export const LAZY_HEAP = {
  lesson: { label: 'Stock price: corrections', input: { ops: [['update', 1, 10], ['update', 2, 5], ['current'], ['maximum'], ['update', 1, 3], ['maximum'], ['update', 4, 2], ['minimum']] } },
  stale: { label: 'Several stale tops', input: { ops: [['update', 1, 9], ['update', 2, 8], ['update', 3, 7], ['update', 1, 1], ['update', 2, 2], ['maximum'], ['minimum']] } },
};

export const lazyHeapCode = [
  ['fields', 'Map<Integer, Integer> price;              // the truth'],
  ['fields', 'PriorityQueue<int[]> maxH, minH;          // {price, timestamp}, never deleted from'],
  ['update', 'void update(int t, int p) {'],
  ['update', '    price.put(t, p);  latest = Math.max(latest, t);'],
  ['update', '    maxH.add(new int[] {p, t});  minH.add(new int[] {p, t});'],
  ['update', '}'],
  ['clean', 'int maximum() {                           // (minimum: the same with minH)'],
  ['clean', '    while (price.get(maxH.peek()[1]) != maxH.peek()[0]) maxH.poll();   // stale'],
  ['read', '    return maxH.peek()[0];'],
  ['read', '}'],
  ['current', 'int current() { return price.get(latest); }'],
];

export function lazyHeapAnswer({ ops }) {
  const price = new Map();
  let latest = 0;
  const out = [];
  for (const [op, t, p] of ops) {
    if (op === 'update') { price.set(t, p); latest = Math.max(latest, t); }
    else if (op === 'current') out.push(price.get(latest));
    else out.push((op === 'maximum' ? Math.max : Math.min)(...price.values()));
  }
  return out;
}

const heapOrder = (h, max) => [...h].sort((x, y) => (max ? y.p - x.p : x.p - y.p) || x.id - y.id);

export function lazyHeap(input) {
  const { ops } = input;
  const price = new Map();
  let maxH = [], minH = [];   // { p, t, id }
  let latest = 0, id = 0;
  const out = [];
  const steps = [];
  const snap = (x) => steps.push({
    price: [...price.entries()].sort((a, b) => a[0] - b[0]),
    maxH: heapOrder(maxH, true).map((e) => ({ ...e, stale: price.get(e.t) !== e.p })),
    minH: heapOrder(minH, false).map((e) => ({ ...e, stale: price.get(e.t) !== e.p })),
    out: [...out], latest, ...x,
  });
  snap({
    kind: 'start', op: null, lines: ['fields'],
    title: 'Prices arrive out of order, and old ones get corrected',
    text: 'A heap answers "largest price" in O(1), but a correction would mean deleting an old entry from the middle of the heap, which Java\'s PriorityQueue does in O(n). Lazy deletion: never delete. Push the new entry, leave the old one in the heap, and when a stale entry reaches the top, throw it away then. An entry is stale when the map says that timestamp now has a different price.',
    calc: ['price = {}, maxH = [], minH = []'],
  });
  for (const [op, t, p] of ops) {
    if (op === 'update') {
      const old = price.get(t);
      price.set(t, p);
      latest = Math.max(latest, t);
      const e = { p, t, id: id++ };
      maxH.push(e); minH.push({ ...e });
      snap({
        kind: 'update', op: `update(${t}, ${p})`, lines: ['update'],
        title: old === undefined ? `update(${t}, ${p})` : `update(${t}, ${p}): corrects ${old}`,
        text: old === undefined
          ? `Record price ${p} at time ${t}, and push (${p}, t${t}) onto both heaps.`
          : `Time ${t} already had price ${old}. Overwrite it in the map and push (${p}, t${t}). The old (${old}, t${t}) entries stay in the heaps but are now stale (crossed out): the map no longer agrees with them.`,
        calc: [`price[${t}] = ${p}`, `latest = ${latest}`],
      });
    } else if (op === 'current') {
      out.push(price.get(latest));
      snap({ kind: 'read', op: 'current()', which: null, lines: ['current'], title: `current() → ${price.get(latest)}`, text: `The latest timestamp seen is ${latest}; the map gives its price.`, calc: [`price[${latest}] = ${price.get(latest)}`] });
    } else {
      const max = op === 'maximum';
      const h = max ? maxH : minH;
      const sorted = heapOrder(h, max);
      const dropped = [];
      while (price.get(sorted[0].t) !== sorted[0].p) dropped.push(sorted.shift());
      if (max) maxH = sorted; else minH = sorted;
      if (dropped.length) {
        snap({
          kind: 'clean', op: `${op}()`, which: max ? 'max' : 'min', dropped: dropped.map((d) => `(${d.p}, t${d.t})`), lines: ['clean'],
          title: `${op}(): pop ${plural(dropped.length, 'stale entry', 'stale entries')} off the top`,
          text: `The top ${dropped.map((d) => `(${d.p}, t${d.t})`).join(', ')} ${dropped.length === 1 ? 'is' : 'are'} out of date: the map says ${dropped.map((d) => `t${d.t} is now ${price.get(d.t)}`).join(', ')}. Pop until the top agrees with the map. Each stale entry is popped once in its life, so this is O(log n) amortised.`,
          calc: dropped.map((d) => `price[${d.t}] = ${price.get(d.t)} ≠ ${d.p}`),
        });
      }
      out.push(sorted[0].p);
      snap({
        kind: 'read', op: `${op}()`, which: max ? 'max' : 'min', lines: ['read'],
        title: `${op}() → ${sorted[0].p}`,
        text: `The top (${sorted[0].p}, t${sorted[0].t}) matches the map, so it is the real ${op}.`,
        calc: [`${op} = ${sorted[0].p}`],
      });
    }
  }
  snap({
    kind: 'done', op: null, lines: [], answer: list(out),
    title: `Answers: ${list(out)}`,
    text: `Every entry is pushed once and popped at most once: O(log n) amortised per call. The check: computing each answer straight from the map gives ${list(lazyHeapAnswer(input))}. The same trick runs Number Container System, Food Rating System and Design Twitter-style feeds.`,
    calc: [`answers = ${list(out)}`],
  });
  return steps;
}

export const lazyHeapText = (ops) => ops.map(([op, t, p]) => (op === 'update' ? `update ${t} ${p}` : op)).join(', ');

export function parseLazyHeap(values) {
  const parts = String(values.ops ?? '').toLowerCase().split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
  const ops = [];
  let any = false;
  for (const t of parts) {
    let m;
    if ((m = /^update\s*\(?\s*(\d+)\s*[ ,]\s*(\d+)\s*\)?$/.exec(t))) {
      const ts = Number(m[1]), p = Number(m[2]);
      if (ts < 1 || ts > 20 || p < 1 || p > 99) return { error: 'Use timestamps 1 to 20 and prices 1 to 99.' };
      ops.push(['update', ts, p]); any = true;
    } else if (/^(current|maximum|minimum|max|min)\s*(\(\))?$/.test(t)) {
      if (!any) return { error: 'Call update before current, maximum or minimum.' };
      const w = t.replace(/[()\s]/g, '');
      ops.push([w === 'max' ? 'maximum' : w === 'min' ? 'minimum' : w]);
    } else return { error: `Couldn't read "${t}". Use update 1 10, current, maximum, minimum.` };
  }
  if (!ops.length || ops.length > 12) return { error: 'Give 1 to 12 operations.' };
  return { input: { ops } };
}

export function randomLazyHeap(input, rand = Math.random) {
  const g = rng(rand);
  const ops = [];
  const used = [];
  while (ops.length < g.int(7, 10)) {
    if (!used.length || g.bool(0.6)) { const t = used.length && g.bool(0.5) ? g.pick(used) : g.int(1, 6); used.push(t); ops.push(['update', t, g.int(1, 20)]); }
    else ops.push([g.pick(['current', 'maximum', 'minimum'])]);
  }
  ops.push([g.pick(['maximum', 'minimum'])]);
  return { ops };
}

// ---------------------------------------------------------------- 2294: partition with max − min ≤ k

export const PARTITION_K = {
  lesson: { label: 'nums = [3,6,1,2,5], k = 2', input: { nums: [3, 6, 1, 2, 5], k: 2 } },
  zero: { label: 'k = 0', input: { nums: [2, 2, 4, 5], k: 0 } },
};

export const partitionKCode = [
  ['sort', 'Arrays.sort(nums);'],
  ['open', 'int groups = 1, start = nums[0];          // the smallest value of the open group'],
  ['loop', 'for (int x : nums)'],
  ['cut', '    if (x - start > k) { groups++; start = x; }   // x can\'t join: open a new group'],
  ['end', 'return groups;'],
];

/** Minimum groups by brute force: DP over the sorted array (an optimal grouping is contiguous after sorting). */
export function partitionKAnswer({ nums, k }) {
  const a = [...nums].sort((x, y) => x - y);
  const n = a.length;
  const dp = Array(n + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= n; i++) for (let j = 0; j < i; j++) if (a[i - 1] - a[j] <= k) dp[i] = Math.min(dp[i], dp[j] + 1);
  return dp[n];
}

export function partitionK(input) {
  const { k } = input;
  const a = [...input.nums].sort((x, y) => x - y);
  const steps = [];
  const groups = [];
  let start = 0;
  steps.push({
    kind: 'start', a, i: null, groups: [], lines: ['sort'],
    title: `Fewest groups with max − min ≤ ${k}`,
    text: `Groups are subsequences, so order doesn't matter: sort. Now look at the smallest value. It has to be in some group, and that group can hold everything up to smallest + ${k}. Taking all of those is never worse than taking fewer (anything left out would need its own group anyway). Then repeat from the next value.`,
    calc: [`sorted: ${list(a)}`],
  });
  groups.push([0, 0]);
  for (let i = 0; i < a.length; i++) {
    if (a[i] - a[start] > k) {
      start = i;
      groups.push([i, i]);
      steps.push({ kind: 'cut', a, i, groups: groups.map((g) => [...g]), lines: ['loop', 'cut'], title: `${a[i]} − ${a[groups.at(-2)[0]]} > ${k}: new group`, text: `${a[i]} is more than ${k} above the group's smallest value ${a[groups.at(-2)[0]]}, so it can't join. It starts group ${groups.length}, with ${a[i]} as its smallest value.`, calc: [`${a[i]} − ${a[groups.at(-2)[0]]} = ${a[i] - a[groups.at(-2)[0]]} > ${k}`, `groups = ${groups.length}`] });
    } else {
      groups.at(-1)[1] = i;
      steps.push({ kind: 'join', a, i, groups: groups.map((g) => [...g]), lines: ['loop'], title: `${a[i]} joins group ${groups.length}`, text: i === start ? `${a[i]} opens group ${groups.length}: everything up to ${a[i]} + ${k} = ${a[i] + k} can join it.` : `${a[i]} − ${a[start]} = ${a[i] - a[start]} ≤ ${k}, so ${a[i]} fits in the open group.`, calc: [`${a[i]} − ${a[start]} = ${a[i] - a[start]} ≤ ${k}`] });
    }
  }
  steps.push({ kind: 'done', a, i: null, groups: groups.map((g) => [...g]), lines: ['end'], answer: `${groups.length}`, title: `${plural(groups.length, 'group')}`, text: `O(n log n) for the sort, then one pass. The check: trying every way to split the sorted array also needs ${partitionKAnswer(input)}.`, calc: [`groups = ${groups.length}`] });
  return steps;
}

export function parsePartitionK(values) {
  const r = parseInts(values.nums, { min: 0, max: 50, minLen: 1, maxLen: 10, name: 'nums' });
  if (r.error) return r;
  const k = parseInt1(values.k, { min: 0, max: 50, name: 'k' });
  if (k.error) return k;
  return { input: { nums: r.arr, k: k.v } };
}

export function randomPartitionK(input, rand = Math.random) {
  const g = rng(rand);
  return { nums: Array.from({ length: g.int(4, 9) }, () => g.int(0, 15)), k: g.int(0, 4) };
}

// ---------------------------------------------------------------- 1944: visible people (count the pops)

export const VISIBLE_PEOPLE = {
  lesson: { label: '[10,6,8,5,11,9]', input: { heights: [10, 6, 8, 5, 11, 9] } },
  rising: { label: '[5,1,2,3,10]: a staircase', input: { heights: [5, 1, 2, 3, 10] } },
};

export const visiblePeopleCode = [
  ['loop', 'for (int i = n - 1; i >= 0; i--) {'],
  ['pop', '    while (!st.isEmpty() && st.peek() < h[i]) { st.pop(); ans[i]++; }'],
  ['taller', '    if (!st.isEmpty()) ans[i]++;            // the first taller person'],
  ['push', '    st.push(h[i]);'],
  ['end', '}'],
];

export function visiblePeopleAnswer({ heights: h }) {
  return h.map((x, i) => {
    let c = 0;
    for (let j = i + 1; j < h.length; j++) {
      const between = h.slice(i + 1, j);
      if (between.every((b) => b < Math.min(x, h[j]))) c++;
    }
    return c;
  });
}

export function visiblePeople(input) {
  const h = input.heights;
  const n = h.length;
  const st = [];   // indexes, heights decreasing from bottom to top
  const ans = new Array(n).fill(null);
  const steps = [];
  const snap = (x) => steps.push({ st: [...st], ans: [...ans], ...x });
  snap({
    kind: 'start', i: null, seen: [], taller: null, lines: [],
    title: `Who can each person in ${list(h)} see?`,
    text: 'Scan from the right. The stack holds the people who could still be seen from further left; their heights decrease from the bottom to the top. Everyone a person pops is someone they see, and someone nobody further left can see past them.',
    calc: ['stack = []'],
  });
  for (let i = n - 1; i >= 0; i--) {
    const seen = [];
    while (st.length && h[st.at(-1)] < h[i]) seen.push(st.pop());
    const taller = st.length ? st.at(-1) : null;
    ans[i] = seen.length + (taller !== null ? 1 : 0);
    st.push(i);
    const who = [...seen.map((j) => `${h[j]}`), ...(taller !== null ? [`${h[taller]}`] : [])];
    snap({
      kind: 'person', i, seen, taller, lines: ['loop', 'pop', 'taller', 'push'],
      title: `Person ${i} (height ${h[i]}) sees ${plural(ans[i], 'person', 'people')}`,
      text: seen.length
        ? `Pop ${seen.map((j) => h[j]).join(', ')}: each is shorter than ${h[i]}, so ${h[i]} sees them, and they are hidden from everyone further left. ${taller !== null ? `Then ${h[taller]} is the first person taller than ${h[i]}: visible too, and it blocks the rest.` : `Nobody taller is left on the stack, so that is everyone.`}`
        : taller !== null ? `The top of the stack, ${h[taller]}, is already taller than ${h[i]}: that is the only person ${h[i]} sees.` : `Nobody stands to the right of ${h[i]} on the stack: they see nobody.`,
      calc: [`sees ${who.length ? who.join(', ') : 'nobody'}`, `answer[${i}] = ${seen.length} pops${taller !== null ? ' + 1' : ''} = ${ans[i]}`],
    });
  }
  snap({
    kind: 'done', i: null, seen: [], taller: null, lines: ['end'], answer: list(ans),
    title: `Answer: ${list(ans)}`,
    text: `Each person is pushed once and popped at most once: O(n). The check: comparing every pair directly also gives ${list(visiblePeopleAnswer(input))}.`,
    calc: [`answer = ${list(ans)}`],
  });
  return steps;
}

export function parseVisiblePeople(values) {
  const r = parseInts(values.heights, { min: 1, max: 30, minLen: 1, maxLen: 9, name: 'heights' });
  if (r.error) return r;
  if (new Set(r.arr).size !== r.arr.length) return { error: 'heights must be distinct.' };
  return { input: { heights: r.arr } };
}

export function randomVisiblePeople(input, rand = Math.random) {
  const g = rng(rand);
  return { heights: g.shuffle(Array.from({ length: 20 }, (_, k) => k + 1)).slice(0, g.int(5, 9)) };
}

// ---------------------------------------------------------------- 2444: fixed bounds (three positions)

export const FIXED_BOUNDS = {
  lesson: { label: '[1,3,5,2,7,5], min 1, max 5', input: { nums: [1, 3, 5, 2, 7, 5], minK: 1, maxK: 5 } },
  ones: { label: 'minK = maxK = 1', input: { nums: [1, 1, 1, 1], minK: 1, maxK: 1 } },
};

export const fixedBoundsCode = [
  ['loop', 'for (int i = 0; i < n; i++) {'],
  ['bad', '    if (a[i] < minK || a[i] > maxK) bad = i;'],
  ['mins', '    if (a[i] == minK) lastMin = i;'],
  ['mins', '    if (a[i] == maxK) lastMax = i;'],
  ['count', '    count += Math.max(0, Math.min(lastMin, lastMax) - bad);'],
  ['end', '}'],
];

export function fixedBoundsAnswer({ nums: a, minK, maxK }) {
  let c = 0;
  for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) {
    const part = a.slice(l, r + 1);
    if (Math.min(...part) === minK && Math.max(...part) === maxK) c++;
  }
  return c;
}

export function fixedBounds(input) {
  const { nums: a, minK, maxK } = input;
  let bad = -1, lastMin = -1, lastMax = -1, count = 0;
  const steps = [];
  const snap = (x) => steps.push({ bad, lastMin, lastMax, count, ...x });
  snap({
    kind: 'start', i: null, add: 0, lines: [],
    title: `Subarrays of ${list(a)} with min ${minK} and max ${maxK}`,
    text: `Fix the end i. A start works if nothing between it and i is outside [${minK}, ${maxK}], and the subarray contains a ${minK} and a ${maxK}. Three positions say exactly which starts those are: the last bad index, the last ${minK} and the last ${maxK}.`,
    calc: ['bad = −1, lastMin = −1, lastMax = −1'],
  });
  for (let i = 0; i < a.length; i++) {
    const notes = [];
    if (a[i] < minK || a[i] > maxK) { bad = i; notes.push(`${a[i]} is outside [${minK}, ${maxK}]: bad = ${i}`); }
    if (a[i] === minK) { lastMin = i; notes.push(`lastMin = ${i}`); }
    if (a[i] === maxK) { lastMax = i; notes.push(`lastMax = ${i}`); }
    const hi = Math.min(lastMin, lastMax);
    const add = Math.max(0, hi - bad);
    count += add;
    snap({
      kind: add ? 'count' : 'none', i, add, lines: ['loop', 'bad', 'mins', 'count'],
      title: add ? `End ${i}: ${plural(add, 'valid start')}` : `End ${i}: no valid start`,
      text: `${notes.length ? `${notes.join('; ')}. ` : ''}${add
        ? `Starts ${bad + 1} … ${hi} keep every value in range and include both a ${minK} and a ${maxK}.`
        : hi < 0 ? `No ${lastMin < 0 ? minK : maxK} has appeared yet, so no subarray ending here can work.` : `The last bad value at ${bad} comes after the last ${lastMin < lastMax ? minK : maxK} at ${hi}: any start that includes both also includes the bad value.`}`,
      calc: [`min(lastMin, lastMax) − bad = min(${lastMin}, ${lastMax}) − (${bad}) = ${hi - bad}`, `count += ${add} → ${count}`],
    });
  }
  snap({
    kind: 'done', i: null, add: 0, lines: ['end'], answer: `${count}`,
    title: `Answer: ${count}`,
    text: `One pass, O(1) space. The check: testing every subarray also gives ${fixedBoundsAnswer(input)}.`,
    calc: [`count = ${count}`],
  });
  return steps;
}

export function parseFixedBounds(values) {
  const r = parseInts(values.nums, { min: 1, max: 9, minLen: 2, maxLen: 10, name: 'nums' });
  if (r.error) return r;
  const lo = parseInt1(values.minK, { min: 1, max: 9, name: 'minK' });
  if (lo.error) return lo;
  const hi = parseInt1(values.maxK, { min: 1, max: 9, name: 'maxK' });
  if (hi.error) return hi;
  return { input: { nums: r.arr, minK: lo.v, maxK: hi.v } };
}

export function randomFixedBounds(input, rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(6, 10) }, () => g.int(1, 6));
  const minK = g.int(1, 3);
  return { nums, minK, maxK: g.int(minK, 5) };
}

// ---------------------------------------------------------------- 995: k consecutive bit flips

export const FLIP_WINDOW = {
  lesson: { label: '[0,0,0,1,0,1,1,0], k = 3', input: { nums: [0, 0, 0, 1, 0, 1, 1, 0], k: 3 } },
  fail: { label: '[1,1,0], k = 2: impossible', input: { nums: [1, 1, 0], k: 2 } },
};

export const flipWindowCode = [
  ['loop', 'for (int i = 0; i < n; i++) {'],
  ['expire', '    active -= endsAt[i];                 // flips that stopped covering i'],
  ['test', '    if ((a[i] + active) % 2 == 0) {      // the bit is 0 right now'],
  ['fail', '        if (i + k > n) return -1;'],
  ['flip', '        flips++; active++; endsAt[i + k]++;'],
  ['test', '    }'],
  ['end', '}'],
];

export function flipWindowAnswer({ nums, k }) {
  const a = [...nums];
  let flips = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === 1) continue;
    if (i + k > a.length) return -1;
    for (let j = i; j < i + k; j++) a[j] ^= 1;
    flips++;
  }
  return flips;
}

export function flipWindow(input) {
  const { nums: a, k } = input;
  const n = a.length;
  const endsAt = new Array(n + 1).fill(0);
  const starts = [];
  let flips = 0, active = 0;
  const steps = [];
  const now = () => a.map((v, j) => (v + starts.filter((s) => s <= j && j < s + k).length) % 2);
  const snap = (x) => steps.push({ starts: [...starts], now: now(), active, flips, ...x });
  snap({
    kind: 'start', i: null, lines: [],
    title: `Flip ${list(a)} to all ones, k = ${k}`,
    text: `The leftmost 0 can only be fixed by a flip that starts exactly there, so every choice is forced. Instead of flipping ${k} cells each time, count how many flips cover the current index (active): the bit is the original if that count is even, flipped if it is odd.`,
    calc: ['active = 0, flips = 0'],
  });
  for (let i = 0; i < n; i++) {
    const expired = endsAt[i];
    active -= expired;
    const bit = (a[i] + active) % 2;
    const pre = `${expired ? `${plural(expired, 'flip')} stopped covering index ${i}. ` : ''}`;
    if (bit === 1) {
      snap({ kind: 'ok', i, lines: ['loop', 'expire', 'test'], title: `Index ${i} is already 1`, text: `${pre}a[${i}] = ${a[i]} and ${active} active ${active === 1 ? 'flip covers' : 'flips cover'} it: (${a[i]} + ${active}) is odd, so the bit is 1. Move on.`, calc: [`(${a[i]} + ${active}) % 2 = 1`] });
      continue;
    }
    if (i + k > n) {
      snap({ kind: 'fail', i, lines: ['loop', 'expire', 'test', 'fail'], answer: '-1', title: `Index ${i} is 0, but a flip would run past the end`, text: `${pre}The bit at ${i} is 0 and only a flip starting at ${i} could fix it, but [${i}, ${i + k - 1}] doesn't fit in ${n} cells. Impossible: −1.`, calc: [`${i} + ${k} = ${i + k} > ${n}`] });
      return steps;
    }
    flips++; active++; endsAt[i + k]++;
    starts.push(i);
    snap({ kind: 'flip', i, lines: ['loop', 'expire', 'test', 'flip'], title: `Index ${i} is 0: flip [${i}, ${i + k - 1}]`, text: `${pre}(${a[i]} + ${active - 1}) is even, so the bit is 0. Start a flip here; it covers ${i} … ${i + k - 1}, so it stops counting at index ${i + k}.`, calc: [`flips = ${flips}, active = ${active}`, `endsAt[${i + k}]++`] });
  }
  snap({
    kind: 'done', i: null, lines: ['end'], answer: `${flips}`,
    title: `Answer: ${flips}`,
    text: `Every index was 1 by the time the scan passed it. O(n) instead of O(nk). The check: flipping the cells for real gives ${flipWindowAnswer(input)}.`,
    calc: [`flips = ${flips}`],
  });
  return steps;
}

export function parseFlipWindow(values) {
  const r = parseInts(values.nums, { min: 0, max: 1, minLen: 1, maxLen: 12, name: 'nums' });
  if (r.error) return r;
  const k = parseInt1(values.k, { min: 1, max: r.arr.length, name: 'k' });
  if (k.error) return k;
  return { input: { nums: r.arr, k: k.v } };
}

export function randomFlipWindow(input, rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(5, 10) }, () => (g.bool(0.55) ? 1 : 0));
  return { nums, k: g.int(1, 4) };
}
