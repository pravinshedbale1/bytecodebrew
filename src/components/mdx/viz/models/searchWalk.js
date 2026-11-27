/**
 * <SearchWalkViz>: Binary Search walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   bad       first bad version: the first "yes" of good … good, bad … bad
 *   guess     guess number higher or lower: the API points left or right
 *   matrix    search a 2D matrix: one sorted list of m · n values
 *   rot2      search in rotated sorted array II: shrink both ends on a three-way tie
 *   median    median of two sorted arrays: binary search the cut in the shorter array
 *   mountain  find in mountain array: the peak, then the rising side, then the falling side
 */
import { list, plural } from './util.js';
import { P, strip, makeWalk } from './walkKit.js';

const sortNum = (a) => [...a].sort((x, y) => x - y);
const rangeBand = (lo, hi, label = `lo ${lo} … hi ${hi}`) => (lo <= hi ? [{ from: lo, to: hi, tone: 'ghost', label }] : []);

const MODES = {
  bad: {
    code: [['range', 'int lo = 1, hi = n;'], ['mid', 'while (lo < hi) { int mid = lo + (hi - lo) / 2;'], ['bad', '    if (isBadVersion(mid)) hi = mid;      // mid or earlier'], ['good', '    else lo = mid + 1; }                 // after mid'], ['ret', 'return lo;']],
    fields: [{ name: 'n', label: 'versions n', type: 'int', placeholder: '5', short: true, min: 1, max: 16 }, { name: 'first', label: 'first bad', type: 'int', placeholder: '4', short: true, min: 1, max: 16 }],
    valid: ({ n, first }) => (first > n ? 'the first bad version must be between 1 and n.' : ''),
    random: (g) => { const n = g.int(1, 16); return { n, first: g.int(1, n) }; },
    brute: ({ first }) => first,
    describe: ({ n, first }) => `n = ${n}, first bad = ${first}`,
    rule: 'bad → answer is mid or earlier; good → after mid',
    run({ n, first }, snap) {
      let lo = 1, hi = n, calls = 0;
      const items = Array.from({ length: n }, (_, k) => String(k + 1));
      const known = {};
      const view = (mid) => [strip('versions', items, { index: false, bands: [{ from: lo - 1, to: hi - 1, tone: 'ghost', label: `lo ${lo} … hi ${hi}` }], cls: { ...known, ...(mid ? { [mid - 1]: known[mid - 1] === 'bad' ? 'bad' : 'hit' } : {}) }, sub: Object.fromEntries(Object.entries(known).map(([k, v]) => [k, v === 'bad' ? 'bad' : 'good'])) })];
      snap({ kind: 'start', lines: ['range'], parts: view(0), title: `Versions 1 … ${n}: good, …, good, bad, …, bad`, text: 'Once a version is bad, every later one is too, so the answers flip exactly once. Check the middle: bad means the first bad version is there or earlier; good means it is later. Each call halves the range.', calc: [`lo = 1, hi = ${n}`] });
      while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        calls++;
        const isBad = mid >= first;
        known[mid - 1] = isBad ? 'bad' : 'dim';
        snap({ kind: isBad ? 'shrink' : 'move', lines: ['mid', isBad ? 'bad' : 'good'], parts: view(mid), title: `isBadVersion(${mid}) = ${isBad}`, text: isBad ? `Version ${mid} is bad, so the first bad one is ${mid} or earlier: hi = ${mid}. Keep ${mid}: it might be the first.` : `Version ${mid} is good, so every version up to ${mid} is good: lo = ${mid + 1}.`, calc: [`call ${calls}: lo ${isBad ? lo : mid + 1}, hi ${isBad ? mid : hi}`] });
        if (isBad) hi = mid; else lo = mid + 1;
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(lo), out: lo, answer: String(lo), title: `lo = hi = ${lo}: the first bad version`, text: `${plural(calls, 'call')} to isBadVersion, about log₂ n; trying every version could take ${n}. With n = 2³¹ − 1 it is 31 calls (compute mid as lo + (hi − lo) / 2 to avoid overflow).`, calc: [`${plural(calls, 'call')}`] });
    },
  },

  guess: {
    code: [['range', 'int lo = 1, hi = n;'], ['mid', 'while (true) { int g = lo + (hi - lo) / 2;  int r = guess(g);'], ['hit', '    if (r == 0) return g;'], ['move', '    if (r < 0) hi = g - 1;  else lo = g + 1; }   // -1: the pick is lower']],
    fields: [{ name: 'n', label: 'n', type: 'int', placeholder: '10', short: true, min: 1, max: 20 }, { name: 'pick', label: 'pick', type: 'int', placeholder: '6', short: true, min: 1, max: 20 }],
    valid: ({ n, pick }) => (pick > n ? 'pick must be between 1 and n.' : ''),
    random: (g) => { const n = g.int(1, 20); return { n, pick: g.int(1, n) }; },
    brute: ({ pick }) => pick,
    describe: ({ n, pick }) => `n = ${n}, pick = ${pick}`,
    rule: 'each answer throws away half',
    run({ n, pick }, snap) {
      let lo = 1, hi = n, k = 0;
      const items = Array.from({ length: n }, (_, i) => String(i + 1));
      const out = {};
      const view = (g, tone) => [strip('numbers', items, { index: false, bands: rangeBand(lo - 1, hi - 1, `lo ${lo} … hi ${hi}`), cls: { ...out, ...(g ? { [g - 1]: tone } : {}) } })];
      snap({ kind: 'start', lines: ['range'], parts: view(0), title: `The pick is somewhere in 1 … ${n}`, text: 'guess(g) says whether the pick is lower (−1), higher (1), or g itself (0). Guessing the middle of what is left throws half the candidates away whatever the answer.', calc: [`lo = 1, hi = ${n}`] });
      for (;;) {
        const g = lo + Math.floor((hi - lo) / 2);
        k++;
        if (g === pick) { snap({ kind: 'found', lines: ['mid', 'hit'], parts: view(g, 'hit'), out: g, answer: String(g), title: `guess(${g}) = 0 → ${g}`, text: `Found in ${plural(k, 'guess', 'guesses')}. Halving needs at most about log₂ n guesses: 31 even for n = 2³¹ − 1.`, calc: [`${plural(k, 'guess', 'guesses')}`] }); return; }
        const higher = g < pick;
        for (let x = higher ? lo : g; x <= (higher ? g : hi); x++) out[x - 1] = 'dim';
        snap({ kind: 'move', lines: ['mid', 'move'], parts: view(g, 'bad'), title: `guess(${g}) = ${higher ? 1 : -1}: ${higher ? 'higher' : 'lower'}`, text: higher ? `The pick is above ${g}, so ${lo} … ${g} are out: lo = ${g + 1}.` : `The pick is below ${g}, so ${g} … ${hi} are out: hi = ${g - 1}.`, calc: [`lo ${higher ? g + 1 : lo}, hi ${higher ? hi : g - 1}`] });
        if (higher) lo = g + 1; else hi = g - 1;
      }
    },
  },

  matrix: {
    hint: 'A matrix whose rows continue each other (rows separated by ";"), and a target.',
    code: [['range', 'int lo = 0, hi = m * n - 1;                // positions in the flattened list'], ['mid', 'while (lo <= hi) { int mid = (lo + hi) / 2;  int v = matrix[mid / n][mid % n];'], ['cmp', '    if (v == target) return true;  if (v < target) lo = mid + 1;  else hi = mid - 1; }'], ['ret', 'return false;']],
    fields: [{ name: 'm', label: 'matrix', type: 'matrix', placeholder: '1, 3, 5, 7; 10, 11, 16, 20; 23, 30, 34, 60', rows: [1, 4], cols: [1, 4], min: -99, max: 99 }, { name: 'target', label: 'target', type: 'int', placeholder: '3', short: true }],
    valid: ({ m }) => { const f = m.flat(); return f.some((v, k) => k && f[k - 1] > v) ? 'read row by row, the matrix must be sorted.' : ''; },
    random: (g) => { const R = g.int(1, 4), C = g.int(1, 4); let x = g.int(0, 5); const m = Array.from({ length: R }, () => Array.from({ length: C }, () => (x += g.int(1, 4)))); return { m, target: g.bool(0.6) ? g.pick(m.flat()) : g.int(0, x + 2) }; },
    brute: ({ m, target }) => m.flat().includes(target),
    describe: ({ m, target }) => `${m.length} × ${m[0].length} matrix, target ${target}`,
    rule: 'read row by row it is one sorted list',
    run({ m, target }, snap) {
      const R = m.length, C = m[0].length, flat = m.flat();
      let lo = 0, hi = R * C - 1;
      const view = (mid, tone) => [P.grid('matrix', m.map((row, r) => row.map((v, c) => { const k = r * C + c; return { l: String(v), c: [k === mid ? (tone === 'hit' ? 'safe' : 'cellCur') : k < lo || k > hi ? 'gone' : ''] }; }))), strip('the same values, row by row', flat, { bands: rangeBand(lo, hi), cls: mid >= 0 ? { [mid]: tone } : {} })];
      snap({ kind: 'start', lines: ['range'], parts: view(-1), title: `${R * C} values in one sorted list`, text: `Each row starts after the previous one ends, so reading row by row gives one sorted list. Binary search positions 0 … ${R * C - 1}; position k is cell (k / ${C}, k % ${C}).`, calc: [`lo = 0, hi = ${R * C - 1}`] });
      while (lo <= hi) {
        const mid = (lo + hi) >> 1, v = flat[mid];
        if (v === target) { snap({ kind: 'found', lines: ['mid', 'cmp'], parts: view(mid, 'hit'), out: true, answer: 'true', title: `Position ${mid} = cell (${Math.floor(mid / C)}, ${mid % C}) = ${v} → true`, text: `Found ${target}. The only new idea compared with a plain binary search is turning a position into (row, column).`, calc: [`${mid} → (${Math.floor(mid / C)}, ${mid % C})`] }); return; }
        const up = v < target;
        snap({ kind: 'move', lines: ['mid', 'cmp'], parts: view(mid, 'cur'), title: `Position ${mid} = cell (${Math.floor(mid / C)}, ${mid % C}) = ${v}: ${up ? 'too small' : 'too big'}`, text: up ? `${v} < ${target}: the target can only be later in the list: lo = ${mid + 1}.` : `${v} > ${target}: the target can only be earlier: hi = ${mid - 1}.`, calc: [`lo ${up ? mid + 1 : lo}, hi ${up ? hi : mid - 1}`] });
        if (up) lo = mid + 1; else hi = mid - 1;
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: false, answer: 'false', title: `${target} isn't there → false`, text: `The range became empty. O(log(m · n)) cells looked at.`, calc: ['not found'] });
    },
  },

  rot2: {
    code: [['range', 'int lo = 0, hi = n - 1;'], ['mid', 'while (lo <= hi) { mid = (lo + hi) / 2;  if (a[mid] == t) return true;'], ['tie', '    if (a[lo] == a[mid] && a[mid] == a[hi]) { lo++; hi--; continue; }   // can\'t tell: shrink'], ['left', '    if (a[lo] <= a[mid]) left half sorted: t in [a[lo], a[mid]) ? hi = mid − 1 : lo = mid + 1'], ['right', '    else right half sorted: t in (a[mid], a[hi]] ? lo = mid + 1 : hi = mid − 1'], ['ret', '}  return false;']],
    fields: [{ name: 'nums', label: 'rotated nums', type: 'ints', placeholder: '2, 5, 6, 0, 0, 1, 2', maxLen: 9, min: 0, max: 9 }, { name: 'target', label: 'target', type: 'int', placeholder: '0', short: true, min: 0, max: 9 }],
    valid: ({ nums }) => { const n = nums.length; let drops = 0; for (let k = 0; k < n; k++) if (nums[k] > nums[(k + 1) % n]) drops++; return drops > 1 ? 'nums must be a sorted array rotated once.' : ''; },
    random: (g) => { const a = sortNum(Array.from({ length: g.int(1, 8) }, () => g.int(0, 4))); const k = g.int(0, a.length - 1); return { nums: [...a.slice(k), ...a.slice(0, k)], target: g.int(0, 5) }; },
    brute: ({ nums, target }) => nums.includes(target),
    describe: ({ nums, target }) => `nums = ${list(nums)}, target = ${target}`,
    rule: 'one half is in order, unless all three ends tie',
    run({ nums: a, target: t }, snap) {
      let lo = 0, hi = a.length - 1;
      const view = (mid, cls = {}) => [strip('nums', a, { bands: rangeBand(lo, hi), tags: mid >= 0 ? { [mid]: [['mid', 'accent']] } : {}, cls })];
      snap({ kind: 'start', lines: ['range'], parts: view(-1), title: `Search ${t} in a rotated array with repeats`, text: 'Around any middle, at least one half is in plain sorted order; check whether the target lies in that half\'s range. Repeats add one problem: when the left end, the middle and the right end are equal, you can\'t tell which half is sorted.', calc: [`lo 0, hi ${hi}`] });
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (a[mid] === t) { snap({ kind: 'found', lines: ['mid'], parts: view(mid, { [mid]: 'hit' }), out: true, answer: 'true', title: `nums[${mid}] = ${t} → true`, text: 'The middle is the target.', calc: [`found at ${mid}`] }); return; }
        if (a[lo] === a[mid] && a[mid] === a[hi]) { snap({ kind: 'shrink', lines: ['mid', 'tie'], parts: view(mid, { [lo]: 'note', [hi]: 'note', [mid]: 'cur' }), title: `Ends and middle all ${a[mid]}: shrink both ends`, text: `Either half could be the sorted one. The ends equal the middle, which isn't ${t}, so they aren't ${t} either: drop both. This tie case is what makes the worst case O(n).`, calc: [`lo ${lo + 1}, hi ${hi - 1}`] }); lo++; hi--; continue; }
        if (a[lo] <= a[mid]) {
          const inside = a[lo] <= t && t < a[mid];
          snap({ kind: 'move', lines: ['mid', 'left'], parts: view(mid, { [mid]: 'cur', ...Object.fromEntries(Array.from({ length: mid - lo }, (_, k) => [lo + k, inside ? 'kept' : 'dim'])) }), title: `Left half [${a[lo]} … ${a[mid]}] is sorted; ${t} ${inside ? 'is' : 'is not'} in it`, text: inside ? `${a[lo]} ≤ ${t} < ${a[mid]}: search the left half, hi = ${mid - 1}.` : `${t} is outside [${a[lo]}, ${a[mid]}), so it can only be on the right: lo = ${mid + 1}.`, calc: [inside ? `hi = ${mid - 1}` : `lo = ${mid + 1}`] });
          if (inside) hi = mid - 1; else lo = mid + 1;
        } else {
          const inside = a[mid] < t && t <= a[hi];
          snap({ kind: 'move', lines: ['mid', 'right'], parts: view(mid, { [mid]: 'cur', ...Object.fromEntries(Array.from({ length: hi - mid }, (_, k) => [mid + 1 + k, inside ? 'kept' : 'dim'])) }), title: `Right half [${a[mid]} … ${a[hi]}] is sorted; ${t} ${inside ? 'is' : 'is not'} in it`, text: inside ? `${a[mid]} < ${t} ≤ ${a[hi]}: search the right half, lo = ${mid + 1}.` : `${t} is outside (${a[mid]}, ${a[hi]}], so it can only be on the left: hi = ${mid - 1}.`, calc: [inside ? `lo = ${mid + 1}` : `hi = ${mid - 1}`] });
          if (inside) lo = mid + 1; else hi = mid - 1;
        }
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: false, answer: 'false', title: `${t} isn't there → false`, text: 'The range is empty. O(log n) when the ends differ, O(n) in the worst case of many ties.', calc: ['not found'] });
    },
  },

  median: {
    code: [['short', 'make A the shorter array;  half = (m + n + 1) / 2;   lo = 0, hi = m'], ['cut', 'while: i = (lo + hi) / 2 values from A, j = half − i from B'], ['big', '    A[i − 1] > B[j]  → too many from A: hi = i − 1'], ['small', '    B[j − 1] > A[i]  → too few from A: lo = i + 1'], ['ok', '    else: every left value ≤ every right value: the median comes from the four edge values']],
    fields: [{ name: 'a', label: 'nums1 (sorted)', type: 'ints', placeholder: '1, 3, 8, 9, 15', maxLen: 6, minLen: 0, min: -20, max: 40 }, { name: 'b', label: 'nums2 (sorted)', type: 'ints', placeholder: '7, 11, 18, 19, 21, 25', maxLen: 6, minLen: 0, min: -20, max: 40 }],
    valid: ({ a, b }) => (a.some((x, k) => k && a[k - 1] > x) || b.some((x, k) => k && b[k - 1] > x) ? 'both arrays must be sorted.' : !a.length && !b.length ? 'at least one value in total.' : ''),
    random: (g) => ({ a: sortNum(Array.from({ length: g.int(0, 5) }, () => g.int(0, 20))), b: sortNum(Array.from({ length: g.int(0, 5) }, () => g.int(0, 20))) }),
    brute: ({ a, b }) => { const s = sortNum([...a, ...b]), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; },
    describe: ({ a, b }) => `${list(a)} and ${list(b)}`,
    rule: 'binary search how many values the shorter array puts on the left',
    run({ a: a0, b: b0 }, snap) {
      const [A, B] = a0.length <= b0.length ? [a0, b0] : [b0, a0];
      const m = A.length, n = B.length, half = (m + n + 1) >> 1;
      let lo = 0, hi = m;
      const v = (arr, k) => (k < 0 ? -Infinity : k >= arr.length ? Infinity : arr[k]);
      const fmt = (x) => (x === Infinity ? '+∞' : x === -Infinity ? '−∞' : String(x));
      const view = (i, j, badA, badB) => [strip('shorter', A.length ? A : ['—'], { index: A.length > 0, cls: Object.fromEntries(A.map((_, k) => [k, k < i ? (badA && k === i - 1 ? 'bad' : 'kept') : 'dim'])), bands: i > 0 ? [{ from: 0, to: i - 1, tone: 'success', label: `${i} on the left` }] : [] }), strip('longer', B, { cls: Object.fromEntries(B.map((_, k) => [k, k < j ? (badB && k === j - 1 ? 'bad' : 'kept') : 'dim'])), bands: j > 0 ? [{ from: 0, to: j - 1, tone: 'success', label: `${j} on the left` }] : [] })];
      snap({ kind: 'start', lines: ['short'], parts: view(0, 0), title: `${m + n} values: the left side holds ${half}`, text: `The median splits all values into a left half and a right half. If the shorter array gives i values to the left, the longer must give j = ${half} − i. Binary search i in 0 … ${m} until every left value is ≤ every right value.`, calc: [`half = ${half}`] });
      for (;;) {
        const i = (lo + hi) >> 1, j = half - i;
        const aL = v(A, i - 1), aR = v(A, i), bL = v(B, j - 1), bR = v(B, j);
        if (aL > bR) { snap({ kind: 'move', lines: ['cut', 'big'], parts: view(i, j, true, false), title: `i = ${i}, j = ${j}: ${fmt(aL)} > ${fmt(bR)}`, text: `The shorter array's last left value ${fmt(aL)} is bigger than the longer array's first right value ${fmt(bR)}: too many values came from the shorter array. hi = ${i - 1}.`, calc: [`hi = ${i - 1}`] }); hi = i - 1; continue; }
        if (bL > aR) { snap({ kind: 'move', lines: ['cut', 'small'], parts: view(i, j, false, true), title: `i = ${i}, j = ${j}: ${fmt(bL)} > ${fmt(aR)}`, text: `The longer array's last left value ${fmt(bL)} is bigger than ${fmt(aR)}, the shorter array's first right value: too few came from the shorter array. lo = ${i + 1}.`, calc: [`lo = ${i + 1}`] }); lo = i + 1; continue; }
        const leftMax = Math.max(aL, bL), rightMin = Math.min(aR, bR);
        const out = (m + n) % 2 ? leftMax : (leftMax + rightMin) / 2;
        snap({ kind: 'found', lines: ['cut', 'ok'], parts: view(i, j, false, false), title: `i = ${i}, j = ${j}: the cut fits`, text: `${fmt(aL)} ≤ ${fmt(bR)} and ${fmt(bL)} ≤ ${fmt(aR)}: every left value is ≤ every right value. The largest left value is ${fmt(leftMax)}${(m + n) % 2 ? '' : ` and the smallest right value is ${fmt(rightMin)}`}.`, calc: [`left max ${fmt(leftMax)}`] });
        snap({ kind: 'done', lines: ['ok'], parts: view(i, j, false, false), out, answer: String(out), title: `Median ${out}`, text: `${(m + n) % 2 ? `An odd total: the median is the largest left value, ${leftMax}.` : `An even total: the average of ${leftMax} and ${rightMin}.`} Only the shorter array was searched: O(log min(m, n)).`, calc: [`median = ${out}`] });
        return;
      }
    },
  },

  mountain: {
    code: [['peak', 'peak: lo = 0, hi = n − 1;  while (lo < hi) { mid;  if (a[mid] < a[mid + 1]) lo = mid + 1; else hi = mid; }'], ['up', 'search 0 … peak (rising) for target'], ['down', 'not found: search peak … n − 1 (falling: flip the comparison)'], ['ret', 'return the index, or −1']],
    fields: [{ name: 'arr', label: 'mountain', type: 'ints', placeholder: '1, 2, 3, 4, 5, 3, 1', minLen: 3, maxLen: 10, min: 0, max: 30 }, { name: 'target', label: 'target', type: 'int', placeholder: '3', short: true, min: 0, max: 30 }],
    valid: ({ arr }) => { let p = 0; while (p + 1 < arr.length && arr[p] < arr[p + 1]) p++; if (p === 0 || p === arr.length - 1) return 'arr must rise strictly, then fall strictly.'; for (let k = p; k + 1 < arr.length; k++) if (arr[k] <= arr[k + 1]) return 'arr must rise strictly, then fall strictly.'; return ''; },
    random: (g) => { const up = sortNum([...new Set(Array.from({ length: g.int(2, 5) }, () => g.int(0, 15)))]); if (up.length < 2) up.push(up[0] + 1); const top = up.at(-1) + g.int(1, 4); const down = sortNum([...new Set(Array.from({ length: g.int(1, 4) }, () => g.int(0, top - 1)))]).reverse(); return { arr: [...up, top, ...down], target: g.bool(0.7) ? g.pick([...up, top, ...down]) : g.int(0, 20) }; },
    brute: ({ arr, target }) => arr.indexOf(target),
    describe: ({ arr, target }) => `arr = ${list(arr)}, target = ${target}`,
    rule: 'find the peak, then search the rising side first',
    run({ arr, target: t }, snap) {
      let calls = 0;
      const get = (k) => { calls++; return arr[k]; };
      const view = (lo, hi, cls = {}, label) => [strip('mountain', arr, { bands: rangeBand(lo, hi, label), cls })];
      snap({ kind: 'start', lines: ['peak'], parts: view(0, arr.length - 1), title: 'Three binary searches', text: 'Every get() costs a call and only 100 are allowed, so no scanning. First find the peak by comparing neighbours. The left side then rises and the right side falls: search the rising side first (it holds the smaller index), and only then the falling side.', calc: [`n = ${arr.length}`] });
      let lo = 0, hi = arr.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const rising = get(mid) < get(mid + 1);
        snap({ kind: 'move', lines: ['peak'], parts: view(lo, hi, { [mid]: 'cur', [mid + 1]: 'note' }, 'peak search'), title: `${arr[mid]} ${rising ? '<' : '>'} ${arr[mid + 1]}: ${rising ? 'still climbing' : 'going down'}`, text: rising ? `The values rise to the right of ${mid}, so the peak is after it: lo = ${mid + 1}.` : `The values fall after ${mid}, so the peak is ${mid} or earlier: hi = ${mid}.`, calc: [`${calls} get calls`] });
        if (rising) lo = mid + 1; else hi = mid;
      }
      const peak = lo;
      snap({ kind: 'found', lines: ['peak'], parts: view(peak, peak, { [peak]: 'target' }, 'peak'), title: `Peak at index ${peak} (${arr[peak]})`, text: `Indexes 0 … ${peak} rise and ${peak} … ${arr.length - 1} fall: two sorted runs.`, calc: [`${calls} get calls`] });
      const search = (from, to, asc, label) => {
        let l = from, h = to;
        while (l <= h) {
          const mid = (l + h) >> 1, v = get(mid);
          if (v === t) { snap({ kind: 'found', lines: [asc ? 'up' : 'down'], parts: view(l, h, { [mid]: 'hit' }, label), title: `${label}: index ${mid} holds ${t}`, text: `Found on the ${label}.${asc ? ' The rising side holds the smaller index, so this is the answer even if the falling side also has a copy.' : ''}`, calc: [`${calls} get calls`] }); return mid; }
          const goRight = asc ? v < t : v > t;
          snap({ kind: 'move', lines: [asc ? 'up' : 'down'], parts: view(l, h, { [mid]: 'cur' }, label), title: `${label}: index ${mid} is ${v}`, text: `${v} ${v < t ? '<' : '>'} ${t}. On a ${asc ? 'rising' : 'falling'} run that means the target is ${goRight ? 'to the right' : 'to the left'}.`, calc: [`${calls} get calls`] });
          if (goRight) l = mid + 1; else h = mid - 1;
        }
        snap({ kind: 'skip', lines: [asc ? 'up' : 'down'], parts: view(from, to, {}, label), title: `${t} is not on the ${label}`, text: `The ${label} search emptied its range.${asc ? ' Try the falling side next.' : ''}`, calc: [`${calls} get calls`] });
        return -1;
      };
      let out = search(0, peak, true, 'rising side');
      if (out < 0) out = search(peak + 1, arr.length - 1, false, 'falling side');
      snap({ kind: 'done', lines: ['ret'], parts: view(0, -1, out >= 0 ? { [out]: 'hit' } : {}), out, answer: String(out), title: out >= 0 ? `Answer: ${out}` : 'Not in the mountain → −1', text: `${calls} get calls in total. For 10⁴ values that is about 2 × 14 for the peak plus 14 per side: well under 100.`, calc: [`${calls} calls`] });
    },
  },
};

const EXAMPLES = {
  bad: { label: 'n = 5, first bad 4', input: { mode: 'bad', n: 5, first: 4 } },
  guess: { label: 'n = 10, pick 6', input: { mode: 'guess', n: 10, pick: 6 } },
  matrix: { label: 'target 3', input: { mode: 'matrix', m: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 3 } },
  matrixNo: { label: 'target 13', input: { mode: 'matrix', m: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 13 } },
  rot2: { label: '[1, 0, 1, 1, 1], target 0', input: { mode: 'rot2', nums: [1, 0, 1, 1, 1], target: 0 } },
  rot2b: { label: '[2, 5, 6, 0, 0, 1, 2], target 3', input: { mode: 'rot2', nums: [2, 5, 6, 0, 0, 1, 2], target: 3 } },
  median: { label: '[1, 3, 8, 9, 15] and [7, 11, 18, 19, 21, 25]', input: { mode: 'median', a: [1, 3, 8, 9, 15], b: [7, 11, 18, 19, 21, 25] } },
  median2: { label: '[1, 2] and [3, 4]', input: { mode: 'median', a: [1, 2], b: [3, 4] } },
  mountain: { label: '[1, 2, 3, 4, 5, 3, 1], target 3', input: { mode: 'mountain', arr: [1, 2, 3, 4, 5, 3, 1], target: 3 } },
  mountain2: { label: 'only on the falling side', input: { mode: 'mountain', arr: [0, 5, 3, 1], target: 1 } },
};

export const searchWalk = makeWalk(MODES, EXAMPLES);
