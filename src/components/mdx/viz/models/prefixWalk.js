/**
 * <PrefixWalkViz>: Prefix Sums walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   running     running sum: each total is the previous plus one value
 *   pivot       find pivot index: right = total − left − nums[i]
 *   divisible   subarray sums divisible by k: equal prefix remainders
 *   contiguous  contiguous array: 0 → −1, first index of each balance
 *   product     product of array except self: left products, then right products
 *   range2d     range sum query 2D: a padded prefix table, four corners per query
 *   submatrix   number of submatrices that sum to target: fix two rows, 1D count
 */
import { list, plural } from './util.js';
import { P, strip, mapChips, makeWalk } from './walkKit.js';

const mod = (a, k) => ((a % k) + k) % k;

const MODES = {
  running: {
    code: [['first', 'run[0] = nums[0];'], ['loop', 'for (int i = 1; i < n; i++) run[i] = run[i - 1] + nums[i];'], ['ret', 'return run;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 3, 4', maxLen: 8 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 7) }, () => g.int(-5, 9)) }),
    brute: ({ nums }) => nums.map((_, i) => nums.slice(0, i + 1).reduce((s, x) => s + x, 0)),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'each total = previous total + one value',
    run({ nums }, snap) {
      const run = Array(nums.length).fill('');
      const view = (i) => [strip('nums', nums, { cls: { [i]: 'cur' } }), strip('running', run, { cls: { [i]: 'hit', [i - 1]: i > 0 ? 'note' : '' } })];
      run[0] = nums[0];
      snap({ kind: 'start', lines: ['first'], parts: view(0), title: `running[0] = ${nums[0]}`, text: 'The first total is just the first value. Every later total is the one before it plus one new value, so nothing is ever added up twice.', calc: [`running[0] = ${nums[0]}`] });
      for (let i = 1; i < nums.length; i++) {
        run[i] = run[i - 1] + nums[i];
        snap({ kind: 'add', lines: ['loop'], parts: view(i), title: `running[${i}] = ${run[i - 1]} + ${nums[i]} = ${run[i]}`, text: `running[${i - 1}] already holds the sum of everything before index ${i}; adding nums[${i}] gives the next total.`, calc: [`running[${i}] = ${run[i]}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: [...run], answer: list(run), title: `Done: ${list(run)}`, text: 'One addition per value: O(n), instead of re-adding each prefix in O(n²).', calc: [list(run)] });
    },
  },

  pivot: {
    code: [['total', 'int total = sum(nums), left = 0;'], ['check', 'for (int i = 0; i < n; i++) {  if (left == total - left - nums[i]) return i;'], ['add', '    left += nums[i]; }'], ['none', 'return -1;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 7, 3, 6, 5, 6', maxLen: 8 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 7) }, () => g.int(-3, 7)) }),
    brute: ({ nums }) => nums.findIndex((_, i) => nums.slice(0, i).reduce((s, x) => s + x, 0) === nums.slice(i + 1).reduce((s, x) => s + x, 0)),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'right = total − left − nums[i]',
    run({ nums }, snap) {
      const total = nums.reduce((s, x) => s + x, 0);
      let left = 0;
      const view = (i, hit) => [strip('nums', nums, { bands: i >= 0 ? [...(i > 0 ? [{ from: 0, to: i - 1, tone: 'note', label: `left ${left}` }] : []), ...(i < nums.length - 1 ? [{ from: i + 1, to: nums.length - 1, tone: 'ghost', label: `right ${total - left - nums[i]}` }] : [])] : [], cls: i >= 0 ? { [i]: hit ? 'hit' : 'cur' } : {} })];
      snap({ kind: 'start', lines: ['total'], parts: view(-1), title: `total = ${total}`, text: 'One pass for the total. Then walk left to right with a running left sum: the right sum is whatever remains, total − left − nums[i]. No second running sum is needed.', calc: [`total = ${total}`] });
      for (let i = 0; i < nums.length; i++) {
        const right = total - left - nums[i];
        if (left === right) { snap({ kind: 'found', lines: ['check'], parts: view(i, true), out: i, answer: String(i), title: `Index ${i}: left ${left} = right ${right} → ${i}`, text: `Everything before index ${i} sums to ${left}, and ${total} − ${left} − ${nums[i]} = ${right} is everything after it. Balanced, and it is the leftmost such index.`, calc: [`${left} = ${right}`] }); return; }
        snap({ kind: 'look', lines: ['check', 'add'], parts: view(i, false), title: `Index ${i}: left ${left}, right ${right}`, text: `${left} ≠ ${right}, not balanced. Add ${nums[i]} to the left sum before moving on.`, calc: [`left → ${left + nums[i]}`] });
        left += nums[i];
      }
      snap({ kind: 'done', lines: ['none'], parts: view(-1), out: -1, answer: '-1', title: 'No balanced index → −1', text: 'Every index was checked in O(1) using the total: O(n) time, O(1) memory.', calc: ['none'] });
    },
  },

  divisible: {
    code: [['seed', 'count[0] = 1;  int pre = 0;              // the empty prefix'], ['loop', 'for (int x : nums) { pre += x;  int r = ((pre % k) + k) % k;'], ['pair', '    ans += count[r];  count[r]++; }       // pairs with earlier equal remainders'], ['ret', 'return ans;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '4, 5, 0, -2, -3, 1', maxLen: 8 }, { name: 'k', label: 'k', type: 'int', placeholder: '5', short: true, min: 2, max: 9 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 7) }, () => g.int(-5, 9)), k: g.int(2, 6) }),
    brute: ({ nums, k }) => { let c = 0; for (let i = 0; i < nums.length; i++) { let s = 0; for (let j = i; j < nums.length; j++) { s += nums[j]; if (mod(s, k) === 0) c++; } } return c; },
    describe: ({ nums, k }) => `nums = ${list(nums)}, k = ${k}`,
    rule: 'equal prefix remainders bound a divisible subarray',
    run({ nums, k }, snap) {
      const count = new Map([[0, 1]]);
      let pre = 0, ans = 0;
      const pres = [0], rems = [0];
      const view = (i) => [strip('nums', nums, { cls: { [i]: 'cur' } }), strip('prefix', pres, { index: false }), strip(`prefix mod ${k}`, rems, { index: false, cls: { [rems.length - 1]: i >= 0 ? 'hit' : '' } }), mapChips('remainder counts', new Map([...count.entries()].sort((a, b) => a[0] - b[0])))];
      snap({ kind: 'start', lines: ['seed'], parts: view(-1), title: 'Count prefixes by remainder', text: `A subarray sum is prefix[j] − prefix[i], and it is divisible by ${k} exactly when the two prefixes leave the same remainder. Count prefixes per remainder; the empty prefix (0) is already there, so subarrays starting at index 0 are counted too.`, calc: ['count {0: 1}'] });
      nums.forEach((x, i) => {
        pre += x;
        const r = mod(pre, k), before = count.get(r) ?? 0;
        ans += before;
        count.set(r, before + 1);
        pres.push(pre); rems.push(r);
        snap({ kind: before ? 'found' : 'add', lines: ['loop', 'pair'], parts: view(i), title: `prefix ${pre}, remainder ${r}: +${before}`, text: before ? `${plural(before, 'earlier prefix', 'earlier prefixes')} also left remainder ${r}; each one starts a subarray ending at index ${i} whose sum is divisible by ${k}.` : `No earlier prefix left remainder ${r}, so no divisible subarray ends here.${pre < 0 ? ` (Java's % gives ${pre % k}; adding k makes it ${r}.)` : ''}`, calc: [`ans = ${ans}`] });
      });
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: ans, answer: String(ans), title: `Answer: ${ans}`, text: `One pass and a table of ${k} counts: O(n + k).`, calc: [`ans = ${ans}`] });
    },
  },

  contiguous: {
    code: [['seed', 'first.put(0, -1);  int bal = 0;            // balance 0 before index 0'], ['loop', 'for (int i = 0; i < n; i++) { bal += nums[i] == 1 ? 1 : -1;'], ['seen', '    if (first has bal) best = max(best, i - first.get(bal));'], ['new', '    else first.put(bal, i); }'], ['ret', 'return best;']],
    fields: [{ name: 'nums', label: 'nums (0s and 1s)', type: 'ints', placeholder: '0, 0, 1, 0, 1, 1', maxLen: 10, min: 0, max: 1 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 9) }, () => g.int(0, 1)) }),
    brute: ({ nums }) => { let best = 0; for (let i = 0; i < nums.length; i++) { let b = 0; for (let j = i; j < nums.length; j++) { b += nums[j] ? 1 : -1; if (!b) best = Math.max(best, j - i + 1); } } return best; },
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'equal balances bound a balanced stretch',
    run({ nums }, snap) {
      const first = new Map([[0, -1]]);
      let bal = 0, best = 0, bestAt = null;
      const bals = [];
      const view = (i) => [strip('nums', nums, { bands: bestAt ? [{ from: bestAt[0], to: bestAt[1], tone: 'success', label: `best ${best}` }] : [], cls: { [i]: 'cur' } }), strip('balance', bals, { cls: { [i]: 'hit' } }), mapChips('first index of each balance', new Map([...first.entries()].sort((a, b) => a[0] - b[0])))];
      snap({ kind: 'start', lines: ['seed'], parts: view(-1), title: 'Count 0 as −1, 1 as +1', text: 'A stretch with as many 0s as 1s now sums to 0. The running balance is the same before and after such a stretch, so remember where each balance first appeared. Balance 0 "appears" at index −1, before anything is read.', calc: ['first {0: −1}'] });
      nums.forEach((x, i) => {
        bal += x ? 1 : -1;
        bals.push(bal);
        if (first.has(bal)) {
          const len = i - first.get(bal);
          const better = len > best;
          if (better) { best = len; bestAt = [first.get(bal) + 1, i]; }
          snap({ kind: better ? 'found' : 'look', lines: ['loop', 'seen'], parts: view(i), title: `Balance ${bal} again: length ${i} − ${first.get(bal)} = ${len}`, text: `Balance ${bal} was first seen at index ${first.get(bal)}, so the stretch after it, [${first.get(bal) + 1}, ${i}], has equal 0s and 1s.${better ? ` New best: ${best}.` : ` Not longer than ${best}.`} Keep the first index: it gives the longest stretches later.`, calc: [`best = ${best}`] });
        } else {
          first.set(bal, i);
          snap({ kind: 'add', lines: ['loop', 'new'], parts: view(i), title: `Balance ${bal}: first seen at ${i}`, text: `A ${x} moves the balance to ${bal}, a value not seen before. Record index ${i} as its first appearance.`, calc: [`first[${bal}] = ${i}`] });
        }
      });
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: best, answer: String(best), title: `Answer: ${best}`, text: 'One pass and a map of first positions: O(n) time and memory.', calc: [`best = ${best}`] });
    },
  },

  product: {
    code: [['left', 'ans[0] = 1;  for (i = 1 … n−1) ans[i] = ans[i − 1] * nums[i − 1];   // product of everything left'], ['right', 'int right = 1;  for (i = n−1 … 0) { ans[i] *= right;  right *= nums[i]; }'], ['ret', 'return ans;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 3, 4', minLen: 2, maxLen: 7, min: -5, max: 9 }],
    random: (g) => ({ nums: Array.from({ length: g.int(2, 6) }, () => g.int(-3, 5)) }),
    brute: ({ nums }) => nums.map((_, i) => nums.reduce((p, x, j) => (j === i ? p : p * x), 1)),
    check: (input, out) => JSON.stringify(out.map((v) => v + 0)) === JSON.stringify(MODES.product.brute(input).map((v) => v + 0)),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'everything except me = (everything left) × (everything right)',
    run({ nums }, snap) {
      const n = nums.length, ans = Array(n).fill('');
      const view = (i, label, extra) => [strip('nums', nums, { cls: { [i]: 'cur' } }), strip('answer', ans.map((v) => (v === '' ? '' : String(v + 0))), { cls: { [i]: 'hit' } }), ...(extra ? [P.chips('', [{ key: 'r', text: extra, tone: 'accent' }])] : [])];
      ans[0] = 1;
      snap({ kind: 'start', lines: ['left'], parts: view(0), title: 'Left pass: ans[0] = 1', text: 'The product of everything except nums[i] is (everything to its left) × (everything to its right). Nothing is left of index 0, so its left product is 1 (the empty product). No division is used, so zeros cause no trouble.', calc: ['ans[0] = 1'] });
      for (let i = 1; i < n; i++) { ans[i] = ans[i - 1] * nums[i - 1]; snap({ kind: 'add', lines: ['left'], parts: view(i), title: `ans[${i}] = ${ans[i - 1] + 0} × ${nums[i - 1]} = ${ans[i] + 0}`, text: `The left product grows by one factor, nums[${i - 1}], at each step.`, calc: [`left[${i}] = ${ans[i] + 0}`] }); }
      let right = 1;
      for (let i = n - 1; i >= 0; i--) {
        const before = ans[i];
        ans[i] *= right;
        snap({ kind: 'merge', lines: ['right'], parts: view(i, 'right', `right product = ${right + 0}`), title: `ans[${i}] = ${before + 0} × ${right + 0} = ${ans[i] + 0}`, text: `right holds the product of everything after index ${i}. Multiplying it in completes ans[${i}]. Then nums[${i}] joins right for the next index to the left.`, calc: [`right → ${right * nums[i] + 0}`] });
        right *= nums[i];
      }
      const out = ans.map((v) => v + 0);
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out, answer: list(out), title: `Done: ${list(out)}`, text: 'Two passes, O(n) time, and O(1) memory besides the answer itself.', calc: [list(out)] });
    },
  },

  range2d: {
    hint: 'A small matrix (rows separated by ";") and one query r1, c1, r2, c2.',
    code: [['build', 'P[r+1][c+1] = m[r][c] + P[r][c+1] + P[r+1][c] − P[r][c];   // extra row and column of 0s'], ['query', 'sum(r1, c1, r2, c2) = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1];'], ['ret', 'four lookups, whatever the size']],
    fields: [{ name: 'm', label: 'matrix', type: 'matrix', placeholder: '3, 0, 1; 5, 6, 3; 1, 2, 0', rows: [1, 5], cols: [1, 5], min: -9, max: 9 }, { name: 'q', label: 'query r1, c1, r2, c2', type: 'ints', placeholder: '1, 1, 2, 2', minLen: 4, maxLen: 4, min: 0, max: 4 }],
    valid: ({ m, q }) => { const [r1, c1, r2, c2] = q; return r1 > r2 || c1 > c2 || r2 >= m.length || c2 >= m[0].length ? 'query: 0 ≤ r1 ≤ r2 < rows and 0 ≤ c1 ≤ c2 < columns.' : ''; },
    random: (g) => { const R = g.int(1, 4), C = g.int(1, 4); const r1 = g.int(0, R - 1), c1 = g.int(0, C - 1); return { m: Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(-3, 9))), q: [r1, c1, g.int(r1, R - 1), g.int(c1, C - 1)] }; },
    brute: ({ m, q: [r1, c1, r2, c2] }) => { let s = 0; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) s += m[r][c]; return s; },
    describe: ({ m, q }) => `${m.length} × ${m[0].length} matrix, query ${list(q)}`,
    rule: 'big corner − top strip − left strip + overlap',
    run({ m, q: [r1, c1, r2, c2] }, snap) {
      const R = m.length, C = m[0].length;
      const Pt = Array.from({ length: R + 1 }, () => Array(C + 1).fill(0));
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) Pt[r + 1][c + 1] = m[r][c] + Pt[r][c + 1] + Pt[r + 1][c] - Pt[r][c];
      const mat = (mark) => P.grid('matrix', m.map((row, r) => row.map((v, c) => ({ l: String(v), c: [mark(r, c)] }))));
      const tab = (hl) => P.grid('P (padded with a row and column of 0s)', Pt.map((row, r) => row.map((v, c) => ({ l: String(v), c: [hl[`${r},${c}`] ?? (r === 0 || c === 0 ? 'gone' : '')] }))));
      snap({ kind: 'start', lines: ['build'], parts: [mat(() => ''), tab({})], title: 'Build P once', text: 'P[r][c] holds the sum of the whole rectangle above and to the left of (r, c). Each entry is its cell plus the rectangle above plus the one on the left, minus their overlap (counted twice). The extra row and column of 0s remove every edge case.', calc: [`P is ${R + 1} × ${C + 1}`] });
      const inQ = (r, c) => r >= r1 && r <= r2 && c >= c1 && c <= c2;
      const A = Pt[r2 + 1][c2 + 1], B = Pt[r1][c2 + 1], Cc = Pt[r2 + 1][c1], D = Pt[r1][c1];
      snap({ kind: 'look', lines: ['query'], parts: [mat((r, c) => (inQ(r, c) ? 'land' : '')), tab({ [`${r2 + 1},${c2 + 1}`]: 'safe', [`${r1},${c2 + 1}`]: 'flipped', [`${r2 + 1},${c1}`]: 'flipped', [`${r1},${c1}`]: 'safe' })], title: `Query (${r1}, ${c1}) to (${r2}, ${c2}): four corners`, text: `Green corners are added, red ones subtracted. P[${r2 + 1}][${c2 + 1}] = ${A} covers everything up to the bottom-right corner. Subtract the strip above, P[${r1}][${c2 + 1}] = ${B}, and the strip to the left, P[${r2 + 1}][${c1}] = ${Cc}. Their overlap P[${r1}][${c1}] = ${D} was subtracted twice, so add it back.`, calc: [`${A} − ${B} − ${Cc} + ${D}`] });
      const out = A - B - Cc + D;
      snap({ kind: 'done', lines: ['ret'], parts: [mat((r, c) => (inQ(r, c) ? 'land' : ''))], out, answer: String(out), title: `Sum = ${out}`, text: 'O(rows × cols) to build P once; every query after that is four lookups, O(1).', calc: [`${A} − ${B} − ${Cc} + ${D} = ${out}`] });
    },
  },

  submatrix: {
    hint: 'A small matrix (rows separated by ";") and a target.',
    code: [['rows', 'for top: col[] = 0;  for bottom ≥ top: add row bottom into col[]'], ['count', '    count subarrays of col[] summing to target: map of prefix counts'], ['ret', 'return the total']],
    fields: [{ name: 'm', label: 'matrix', type: 'matrix', placeholder: '0, 1, 0; 1, 1, 1; 0, 1, 0', rows: [1, 3], cols: [1, 4], min: -3, max: 3 }, { name: 'target', label: 'target', type: 'int', placeholder: '0', short: true, min: -9, max: 9 }],
    random: (g) => { const R = g.int(1, 3), C = g.int(1, 4); return { m: Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(-1, 2))), target: g.int(-1, 2) }; },
    brute: ({ m, target }) => { const R = m.length, C = m[0].length; let c = 0; for (let a = 0; a < R; a++) for (let b = a; b < R; b++) for (let x = 0; x < C; x++) for (let y = x; y < C; y++) { let s = 0; for (let r = a; r <= b; r++) for (let q = x; q <= y; q++) s += m[r][q]; if (s === target) c++; } return c; },
    describe: ({ m, target }) => `${m.length} × ${m[0].length} matrix, target ${target}`,
    rule: 'two rows collapse the grid to one array',
    run({ m, target }, snap) {
      const R = m.length, C = m[0].length;
      let total = 0;
      snap({ kind: 'start', lines: ['rows'], parts: [P.grid('matrix', m.map((row) => row.map((v) => ({ l: String(v), c: [] }))))], title: 'Fix a top and a bottom row', text: `Between two fixed rows, each column contributes one number: its sum over those rows. A rectangle in that band is then a stretch of that row of numbers, so "count rectangles summing to ${target}" becomes the 1D "count subarrays summing to ${target}".`, calc: [`${R * (R + 1) / 2} bands`] });
      for (let top = 0; top < R; top++) {
        const col = Array(C).fill(0);
        for (let bot = top; bot < R; bot++) {
          for (let c = 0; c < C; c++) col[c] += m[bot][c];
          const seen = new Map([[0, 1]]);
          let pre = 0, here = 0;
          for (const v of col) { pre += v; here += seen.get(pre - target) ?? 0; seen.set(pre, (seen.get(pre) ?? 0) + 1); }
          total += here;
          snap({ kind: here ? 'found' : 'look', lines: ['rows', 'count'], parts: [P.grid(`rows ${top} … ${bot}`, m.map((row, r) => row.map((v) => ({ l: String(v), c: [r >= top && r <= bot ? 'land' : 'gone'] })))), strip('column sums', col)], title: `Rows ${top}–${bot}: column sums ${list(col)} → ${here}`, text: `Counting stretches of ${list(col)} that sum to ${target} with a running prefix sum and a map of earlier prefixes: ${plural(here, 'rectangle')} in this band.`, calc: [`total = ${total}`] });
        }
      }
      snap({ kind: 'done', lines: ['ret'], parts: [P.grid('matrix', m.map((row) => row.map((v) => ({ l: String(v), c: [] }))))], out: total, answer: String(total), title: `Answer: ${total}`, text: 'O(rows² × columns): every pair of rows, then one linear 1D count. Put the smaller dimension on the outside.', calc: [`total = ${total}`] });
    },
  },
};

const EXAMPLES = {
  running: { label: '[1, 2, 3, 4]', input: { mode: 'running', nums: [1, 2, 3, 4] } },
  pivot: { label: '[1, 7, 3, 6, 5, 6]', input: { mode: 'pivot', nums: [1, 7, 3, 6, 5, 6] } },
  pivotNone: { label: '[1, 2, 3]', input: { mode: 'pivot', nums: [1, 2, 3] } },
  divisible: { label: '[4, 5, 0, −2, −3, 1], k = 5', input: { mode: 'divisible', nums: [4, 5, 0, -2, -3, 1], k: 5 } },
  contiguous: { label: '[0, 0, 1, 0, 1, 1]', input: { mode: 'contiguous', nums: [0, 0, 1, 0, 1, 1] } },
  product: { label: '[1, 2, 3, 4]', input: { mode: 'product', nums: [1, 2, 3, 4] } },
  productZero: { label: '[−1, 1, 0, −3, 3]', input: { mode: 'product', nums: [-1, 1, 0, -3, 3] } },
  range2d: { label: 'the example, (2, 1) to (4, 3)', input: { mode: 'range2d', m: [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]], q: [2, 1, 4, 3] } },
  range2dCorner: { label: 'from the corner, (0, 0) to (1, 1)', input: { mode: 'range2d', m: [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]], q: [0, 0, 1, 1] } },
  submatrix: { label: '[[0,1,0],[1,1,1],[0,1,0]], target 0', input: { mode: 'submatrix', m: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], target: 0 } },
};

export const prefixWalk = makeWalk(MODES, EXAMPLES);
