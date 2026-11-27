/**
 * <RangeWalkViz>: Range Queries problems beyond the Fenwick / segment tree basics.
 *   carpool       difference array of seat changes, then a running load against the capacity
 *   smaller       count of smaller numbers after self: counts by value, scanned from the right (a Fenwick tree in practice)
 *   instructions  create sorted array: cost = min(smaller so far, larger so far), the same counts
 *   reverse       reverse pairs: merge sort, counting pairs across each merge with a second pointer
 *   rangesum      count of range sum: merge sort over prefix sums, counting pairs in [lower, upper]
 *   squares       falling squares: a skyline of unit cells
 * Steps use the DesignWalkViz "parts" shape. Pure, with O(n²) brute forces for viz-check.
 */
import { list, rng } from './util.js';

const P = {
  chips: (label, chips, empty = 'none') => ({ type: 'chips', label, chips, empty }),
  strip: (label, items, o = {}) => ({ type: 'strip', label, items: [...items], cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o }),
};

export const RANGE_WALK = {
  carpool: { label: 'Car pooling: fits', input: { mode: 'carpool', trips: [[2, 1, 5], [3, 5, 7]], capacity: 3 } },
  carpoolNo: { label: 'Car pooling: too full', input: { mode: 'carpool', trips: [[2, 1, 5], [3, 3, 7]], capacity: 4 } },
  smaller: { label: 'Count smaller after self', input: { mode: 'smaller', nums: [5, 2, 6, 1] } },
  smallerDup: { label: 'Count smaller: repeats', input: { mode: 'smaller', nums: [3, 1, 3, 2, 1] } },
  instructions: { label: 'Create sorted array', input: { mode: 'instructions', nums: [1, 3, 3, 3, 2, 4, 2, 1, 2] } },
  reverse: { label: 'Reverse pairs', input: { mode: 'reverse', nums: [2, 4, 3, 5, 1] } },
  rangesum: { label: 'Count of range sum', input: { mode: 'rangesum', nums: [-2, 5, -1], lower: -2, upper: 2 } },
  squares: { label: 'Falling squares', input: { mode: 'squares', positions: [[1, 2], [2, 3], [6, 1]] } },
};

export const rangeWalkCode = (mode) => ({
  carpool: [['diff', 'for each trip: diff[from] += p;  diff[to] −= p;     // seats taken from "from", freed at "to"'], ['sweep', 'load = running sum of diff, km by km'], ['check', 'if (load > capacity) return false;'], ['ans', 'return true;']],
  smaller: [['scan', 'for i from the right:'], ['query', '    ans[i] = count of values < nums[i] seen so far      // Fenwick prefix sum'], ['add', '    count[nums[i]]++                                  // Fenwick update'], ['ans', 'return ans;']],
  instructions: [['scan', 'for each value x, left to right:'], ['query', '    less = count(< x);  more = inserted − count(≤ x)        // two Fenwick prefix sums'], ['cost', '    cost += min(less, more);  count[x]++'], ['ans', 'return cost % (10⁹ + 7);']],
  reverse: [['split', 'sort(lo, hi): sort each half (counting inside them)'], ['count', 'for each i in the left half: move j while left[i] > 2 · right[j]; count += j      // both halves sorted'], ['merge', 'merge the halves'], ['ans', 'return the total count']],
  rangesum: [['prefix', 'P[0] = 0, P[k + 1] = P[k] + nums[k]        // a subarray sum is P[j] − P[i]'], ['split', 'merge sort P; for each left value P[i]:'], ['count', '    count right values P[j] in [P[i] + lower, P[i] + upper]       // two moving pointers'], ['merge', 'merge the halves'], ['ans', 'return the total count']],
  squares: [['base', 'base = the tallest height under the square\'s span [left, left + side)'], ['land', 'set that span to base + side'], ['max', 'best = max(best, base + side); record best']],
})[mode];

// ---------------------------------------------------------------- brute forces

export function rangeWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'carpool') { const end = Math.max(...input.trips.map((t) => t[2])); for (let km = 0; km < end; km++) { const load = input.trips.reduce((s, [p, f, t]) => s + (f <= km && km < t ? p : 0), 0); if (load > input.capacity) return false; } return true; }
  if (mode === 'smaller') { const a = input.nums; return a.map((v, i) => a.slice(i + 1).filter((w) => w < v).length); }
  if (mode === 'instructions') { const a = input.nums; let c = 0; a.forEach((v, i) => { const prev = a.slice(0, i); c += Math.min(prev.filter((w) => w < v).length, prev.filter((w) => w > v).length); }); return c; }
  if (mode === 'reverse') { const a = input.nums; let c = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > 2 * a[j]) c++; return c; }
  if (mode === 'rangesum') { const a = input.nums; let c = 0; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (s >= input.lower && s <= input.upper) c++; } } return c; }
  // squares, by comparing every pair of intervals
  const h = [], out = []; let best = 0;
  input.positions.forEach(([l, s], i) => { let base = 0; for (let j = 0; j < i; j++) { const [l2, s2] = input.positions[j]; if (l < l2 + s2 && l2 < l + s) base = Math.max(base, h[j]); } h[i] = base + s; best = Math.max(best, h[i]); out.push(best); });
  return out;
}

// ---------------------------------------------------------------- step-throughs

export function rangeWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, parts: [], call: null, ...x });

  if (mode === 'carpool') {
    const { trips, capacity } = input;
    const end = Math.max(...trips.map((t) => t[2]));
    const diff = Array(end + 1).fill(0), load = Array(end + 1).fill(null);
    const view = (hl = null, bad = null) => { const d = P.strip('change at km', diff.map((v) => (v > 0 ? `+${v}` : v ? String(v) : '·'))); const L = P.strip(`passengers (capacity ${capacity})`, load.map((v) => (v === null ? '' : v)), { index: false }); if (hl) { d.cls[hl[0]] = 'hit'; d.cls[hl[1]] = 'bad'; } load.forEach((v, k) => { if (v === null) L.cls[k] = 'muted'; else if (v > capacity) L.cls[k] = 'bad'; }); if (bad !== null) L.cls[bad] = 'bad cur'; return [d, L]; };
    snap({ kind: 'start', lines: [], parts: view(), title: `${trips.length} trips, ${capacity} seats`, text: 'Adding every trip to every kilometre it covers is slow for long trips. Record only where the load changes: +p where a trip starts, −p where it ends (seats are freed at "to", in time for anyone getting in there). A running sum then gives the load at every kilometre.', calc: [`kilometres 0..${end}`] });
    trips.forEach(([p, f, t]) => { diff[f] += p; diff[t] -= p; snap({ kind: 'add', lines: ['diff'], parts: view([f, t]), title: `Trip: ${p} from km ${f} to ${t}`, text: `+${p} at km ${f} (they get in), −${p} at km ${t} (they get out).`, calc: [`diff[${f}] += ${p}, diff[${t}] −= ${p}`] }); });
    let run = 0;
    for (let k = 0; k <= end; k++) {
      run += diff[k]; load[k] = run;
      if (run > capacity) { snap({ kind: 'fail', lines: ['sweep', 'check'], parts: view(null, k), out: false, answer: 'false', title: `km ${k}: ${run} passengers > ${capacity}`, text: `The running sum reaches ${run} at km ${k}: more people than seats.`, calc: ['false'] }); return steps; }
      if (diff[k]) snap({ kind: 'move', lines: ['sweep', 'check'], parts: view(), title: `km ${k}: load ${run}`, text: `The load changes by ${diff[k] > 0 ? '+' : ''}${diff[k]} here: ${run} on board, within ${capacity}.`, calc: [`load = ${run}`] });
    }
    snap({ kind: 'done', lines: ['ans'], parts: view(), out: true, answer: 'true', title: 'Every kilometre fits: true', text: 'O(trips + distance). With far-apart kilometres, sort the 2 × trips events instead of using an array.', calc: ['true'] });
    return steps;
  }

  if (mode === 'smaller' || mode === 'instructions') {
    const a = input.nums, vals = [...new Set(a)].sort((x, y) => x - y), cnt = vals.map(() => 0);
    const isS = mode === 'smaller';
    const res = Array(a.length).fill(null);
    let total = 0, inserted = 0;
    const view = (i = null, bandLess = null, bandMore = null) => {
      const s = P.strip('nums', a); if (isS) a.forEach((_, k) => { if (res[k] !== null) s.sub[k] = { text: String(res[k]), tone: 'success' }; }); if (i !== null) s.cls[i] = 'cur'; if (i !== null) a.forEach((_, k) => { if (isS ? k > i : k < i) s.cls[k] = s.cls[k] ?? 'kept'; });
      const c = P.strip('count of each value seen', cnt, { index: vals.map(String) }); const bands = []; if (bandLess) bands.push({ ...bandLess, tone: 'accent', label: '<' }); if (bandMore) bands.push({ ...bandMore, tone: 'note', label: '>' }); c.bands = bands;
      return [s, c, ...(isS ? [] : [P.chips('total cost', [{ key: 't', text: String(total), tone: 'success' }])])];
    };
    snap({ kind: 'start', lines: ['scan'], parts: view(), title: isS ? `Smaller numbers to the right in ${list(a)}` : `Insert ${list(a)} keeping it sorted`, text: isS ? 'Scan from the right, keeping a count of each value seen so far (values compressed to ranks). The answer for nums[i] is the number of seen values strictly below it: a prefix sum over the counts. A Fenwick tree does both the prefix sum and the update in O(log n).' : 'Keep a count of each value inserted so far. Inserting x costs min(values below x, values above x): two prefix sums over the counts. A Fenwick tree makes each O(log n).', calc: [`${vals.length} distinct values`] });
    const order = isS ? [...a.keys()].reverse() : [...a.keys()];
    for (const i of order) {
      const v = a[i], r = vals.indexOf(v);
      const less = cnt.slice(0, r).reduce((x, y) => x + y, 0), more = cnt.slice(r + 1).reduce((x, y) => x + y, 0);
      if (isS) {
        res[i] = less;
        snap({ kind: less ? 'add' : 'skip', lines: ['query'], parts: view(i, r > 0 ? { from: 0, to: r - 1 } : null), title: `${v} at ${i}: ${less} smaller to its right`, text: `Values already seen (everything right of index ${i}) that are below ${v}: the counts in the shaded part add up to ${less}.`, calc: [`ans[${i}] = ${less}`] });
        cnt[r]++;
      } else {
        const c = Math.min(less, more); total += c; inserted++;
        snap({ kind: 'add', lines: ['query', 'cost'], parts: view(i, r > 0 ? { from: 0, to: r - 1 } : null, r < vals.length - 1 ? { from: r + 1, to: vals.length - 1 } : null), title: `Insert ${v}: min(${less}, ${more}) = ${c}`, text: `${less} value${less === 1 ? '' : 's'} already inserted ${less === 1 ? 'is' : 'are'} smaller and ${more} larger; equal values cost nothing. Pay the cheaper side, ${c}.`, calc: [`total = ${total}`] });
        cnt[r]++;
      }
    }
    const out = isS ? res : total;
    snap({ kind: 'done', lines: ['ans'], parts: view(), out, answer: isS ? list(res) : String(total), title: isS ? `counts = ${list(res)}` : `Total cost: ${total}`, text: 'Each element costs one prefix query and one update: O(n log n) with a Fenwick tree over the value ranks.', calc: [isS ? list(res) : String(total)] });
    return steps;
  }

  if (mode === 'reverse' || mode === 'rangesum') {
    const isR = mode === 'reverse';
    const { lower, upper } = input;
    const base = isR ? [...input.nums] : input.nums.reduce((acc, v) => { acc.push(acc.at(-1) + v); return acc; }, [0]);
    const a = [...base];
    let total = 0;
    const head = isR ? [] : [P.strip('prefix sums P', base)];
    snap({ kind: 'start', lines: [isR ? 'split' : 'prefix'], parts: [...head, P.strip(isR ? 'nums' : 'P (to be merge-sorted)', a)], title: isR ? `Reverse pairs in ${list(input.nums)}` : `Subarray sums of ${list(input.nums)} in [${lower}, ${upper}]`, text: isR ? 'Merge sort, but before each merge count the pairs that cross it: i in the left half, j in the right half, left[i] > 2 · right[j]. Both halves are sorted, so as i moves up, the number of qualifying j only grows: one pointer sweeps the right half once per merge. Pairs inside a half were counted when that half was sorted.' : 'A subarray sum is P[j] − P[i] for i < j. So count pairs of prefix sums whose difference lies in [lower, upper], with merge sort: for each P[i] in the left half, the qualifying P[j] in the right half form one window [P[i] + lower, P[i] + upper], and both window edges only move right.', calc: [isR ? `${a.length} numbers` : `P = ${list(base)}`] });
    const sort = (lo, hi) => {
      if (hi - lo <= 1) return;
      const mid = (lo + hi) >> 1;
      sort(lo, mid); sort(mid, hi);
      const L = a.slice(lo, mid), R = a.slice(mid, hi);
      let c = 0; const parts = [];
      if (isR) { let j = 0; for (const x of L) { while (j < R.length && x > 2 * R[j]) j++; c += j; parts.push(`${x}: ${j}`); } }
      else { let s = 0, e = 0; for (const x of L) { while (s < R.length && R[s] < x + lower) s++; while (e < R.length && R[e] <= x + upper) e++; c += e - s; parts.push(`${x}: ${e - s}`); } }
      total += c;
      const merged = [...L, ...R].sort((x, y) => x - y);
      for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];
      snap({ kind: c ? 'add' : 'skip', lines: ['count', 'merge'], parts: [...head, P.strip('left half (sorted)', L, { index: false }), P.strip('right half (sorted)', R, { index: false }), P.strip('merged', merged, { index: false }), P.chips('count', [{ key: 't', text: String(total), tone: 'success' }])], title: `Merge ${list(L)} + ${list(R)}: +${c}`, text: isR ? `For each left value, count right values with left > 2 · right (${parts.join('; ')}). The pointer never moves back because both halves are sorted.` : `For each left P[i], count right P[j] with ${lower} ≤ P[j] − P[i] ≤ ${upper} (${parts.join('; ')}).`, calc: [`+${c}, total ${total}`] });
    };
    sort(0, a.length);
    snap({ kind: 'done', lines: ['ans'], parts: [...head, P.strip('sorted', a), P.chips('count', [{ key: 't', text: String(total), tone: 'success' }])], out: total, answer: String(total), title: `${total} ${isR ? 'reverse pair' : 'subarray'}${total === 1 ? '' : 's'}`, text: `Every pair was counted exactly once, at the merge where its two ends were first split apart. O(n log n). ${isR ? 'Use a long for 2 · nums[j].' : 'Prefix sums need longs.'}`, calc: [String(total)] });
    return steps;
  }

  // squares
  const pos = input.positions;
  const W = Math.max(...pos.map(([l, s]) => l + s));
  const h = Array(W).fill(0);
  let best = 0; const out = [];
  const view = (span = null) => { const s = P.strip('height of each unit of the floor', h); if (span) s.bands = [{ from: span[0], to: span[1], tone: 'accent', label: 'square' }]; return [s, P.chips('tallest so far', out.map((v, k) => ({ key: k, text: String(v), tone: k === out.length - 1 ? 'success' : undefined })), 'none yet')]; };
  snap({ kind: 'start', lines: [], parts: view(), title: `Drop ${pos.length} squares`, text: 'Track the height over each unit of the floor (here small; in the real problem compress the coordinates, or keep a list of landed intervals). A square covering [left, left + side) lands on the tallest height under its span, and its top becomes the new height of that whole span. Touching only at an edge doesn\'t support it: the span is half-open.', calc: [`floor 0..${W - 1}`] });
  pos.forEach(([l, s]) => {
    const base = Math.max(...h.slice(l, l + s)), top = base + s;
    for (let x = l; x < l + s; x++) h[x] = top;
    best = Math.max(best, top); out.push(best);
    snap({ kind: base ? 'add' : 'move', lines: ['base', 'land', 'max'], parts: view([l, l + s - 1]), title: `Square [${l}, ${s}]: lands at ${base}, top ${top}`, text: `The tallest height under ${l}..${l + s - 1} is ${base}${base ? '' : ' (the floor)'}, so the square rests there and its top is ${base} + ${s} = ${top}. The tallest stack so far is ${best}.`, calc: [`record ${best}`] });
  });
  snap({ kind: 'done', lines: ['max'], parts: view(), out, answer: list(out), title: `Heights: ${list(out)}`, text: 'Comparing each square with every earlier one is O(n²), fine for 1000 squares. A segment tree with lazy "assign" over compressed coordinates makes it O(n log n).', calc: [list(out)] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').replace(/[[\]]/g, ' ').replace(/[−–]/g, '-').split(/[\s,]+/).filter(Boolean).map(Number);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const groups = (t) => String(t ?? '').split(/[;|]/).map(ints).filter((g) => g.length);

export function parseRangeWalk(values, input) {
  const { mode } = input;
  if (mode === 'carpool') { const trips = groups(values.trips), c = Number(values.capacity); return trips.length && trips.length <= 4 && trips.every((t) => t.length === 3 && isInt(t[0], 1, 9) && isInt(t[1], 0, 11) && isInt(t[2], t[1] + 1, 12)) && isInt(c, 1, 20) ? { input: { mode, trips, capacity: c } } : { error: 'Up to 4 trips "p from to" (0 ≤ from < to ≤ 12) separated by ;, and a capacity.' }; }
  if (mode === 'squares') { const p = groups(values.positions); return p.length && p.length <= 5 && p.every((q) => q.length === 2 && isInt(q[0], 0, 9) && isInt(q[1], 1, 4)) ? { input: { mode, positions: p } } : { error: 'Up to 5 squares "left side" (left 0..9, side 1..4) separated by ;' }; }
  const nums = ints(values.nums);
  if (!nums.length || nums.length > 9 || !nums.every((v) => isInt(v, -9, 20))) return { error: '1 to 9 numbers from −9 to 20.' };
  if (mode === 'instructions' && !nums.every((v) => v >= 1)) return { error: 'Positive values only.' };
  if (mode === 'rangesum') { const lo = Number(values.lower), hi = Number(values.upper); if (!isInt(lo, -20, 20) || !isInt(hi, lo, 20)) return { error: 'lower ≤ upper, both from −20 to 20.' }; return { input: { mode, nums, lower: lo, upper: hi } }; }
  return { input: { mode, nums } };
}

export function rangeWalkValues(input) {
  const { mode } = input;
  if (mode === 'carpool') return { trips: input.trips.map((t) => t.join(' ')).join('; '), capacity: String(input.capacity) };
  if (mode === 'squares') return { positions: input.positions.map((t) => t.join(' ')).join('; ') };
  if (mode === 'rangesum') return { nums: input.nums.join(', '), lower: String(input.lower), upper: String(input.upper) };
  return { nums: input.nums.join(', ') };
}

export function randomRangeWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const arr = (n, lo, hi) => Array.from({ length: n }, () => g.int(lo, hi));
  if (mode === 'carpool') return { mode, trips: Array.from({ length: g.int(1, 4) }, () => { const f = g.int(0, 9); return [g.int(1, 5), f, g.int(f + 1, 12)]; }), capacity: g.int(2, 10) };
  if (mode === 'squares') return { mode, positions: Array.from({ length: g.int(1, 5) }, () => [g.int(0, 8), g.int(1, 4)]) };
  if (mode === 'rangesum') { const lo = g.int(-4, 3); return { mode, nums: arr(g.int(1, 7), -5, 5), lower: lo, upper: lo + g.int(0, 5) }; }
  if (mode === 'instructions') return { mode, nums: arr(g.int(1, 8), 1, 5) };
  return { mode, nums: arr(g.int(1, 8), -3, 9) };
}

export const rangeWalkFields = (input) => ({
  carpool: [{ name: 'trips', label: 'trips "p from to; …"', placeholder: '2 1 5; 3 3 7' }, { name: 'capacity', label: 'capacity', placeholder: '4', short: true }],
  smaller: [{ name: 'nums', label: 'nums', placeholder: '5, 2, 6, 1' }],
  instructions: [{ name: 'nums', label: 'instructions', placeholder: '1, 3, 3, 3, 2, 4, 2, 1, 2' }],
  reverse: [{ name: 'nums', label: 'nums', placeholder: '2, 4, 3, 5, 1' }],
  rangesum: [{ name: 'nums', label: 'nums', placeholder: '-2, 5, -1' }, { name: 'lower', label: 'lower', placeholder: '-2', short: true }, { name: 'upper', label: 'upper', placeholder: '2', short: true }],
  squares: [{ name: 'positions', label: 'squares "left side; …"', placeholder: '1 2; 2 3; 6 1' }],
})[input.mode];

export function rangeWalkDescribe(input) {
  const { mode } = input;
  if (mode === 'carpool') return `${input.trips.length} trips, capacity ${input.capacity}`;
  if (mode === 'squares') return `${input.positions.length} squares`;
  if (mode === 'rangesum') return `${list(input.nums)}, [${input.lower}, ${input.upper}]`;
  return list(input.nums);
}

export const rangeWalkRule = {
  carpool: '+p at pickup, −p at drop-off, then a running sum',
  smaller: 'from the right: prefix count of smaller values seen',
  instructions: 'cost = min(count below, count above)',
  reverse: 'count left > 2 · right across each merge',
  rangesum: 'pairs of prefix sums with difference in [lower, upper]',
  squares: 'land on the tallest height under the span',
};
