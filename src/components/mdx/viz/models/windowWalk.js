/**
 * <WindowWalkViz>: Sliding Window walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   ones      max consecutive ones III: at most k zeros inside
 *   replace   longest repeating character replacement: length − most common ≤ k
 *   minwin    minimum window substring: grow until covered, shrink while still covered
 *   kdiff     subarrays with exactly k different integers: atMost(k) − atMost(k − 1)
 *   dup2      contains duplicate II: a set of the last k values
 *   closest   find k closest elements: binary search the start of a k-window
 */
import { list, plural } from './util.js';
import { P, strip, mapChips, makeWalk } from './walkKit.js';

const winTags = (l, r) => (l === r ? { [l]: [['l=r', 'accent']] } : { [l]: [['l', 'accent']], [r]: [['r', 'warn']] });

const MODES = {
  ones: {
    code: [['grow', 'for (int r = 0; r < n; r++) {  if (nums[r] == 0) zeros++;'], ['shrink', '    while (zeros > k) { if (nums[l] == 0) zeros--; l++; }'], ['best', '    best = max(best, r - l + 1);'], ['ret', '}  return best;']],
    fields: [{ name: 'nums', label: 'nums (0s and 1s)', type: 'ints', placeholder: '1,1,1,0,0,0,1,1,1,1,0', maxLen: 12, min: 0, max: 1 }, { name: 'k', label: 'k', type: 'int', placeholder: '2', short: true, min: 0, max: 5 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 11) }, () => (g.bool(0.6) ? 1 : 0)), k: g.int(0, 3) }),
    brute: ({ nums, k }) => { let best = 0; for (let i = 0; i < nums.length; i++) { let z = 0; for (let j = i; j < nums.length; j++) { z += nums[j] === 0; if (z <= k) best = Math.max(best, j - i + 1); } } return best; },
    describe: ({ nums, k }) => `nums = ${list(nums)}, k = ${k}`,
    rule: 'the longest window with at most k zeros',
    run({ nums, k }, snap) {
      let l = 0, zeros = 0, best = 0, bestAt = null;
      const view = (r, cls = {}) => [strip('nums', nums, { tags: r >= 0 ? winTags(l, r) : {}, bands: r >= 0 ? [{ from: l, to: r, tone: 'accent', label: `${r - l + 1} long, ${plural(zeros, 'zero')}` }, ...(bestAt && (bestAt[0] !== l || bestAt[1] !== r) ? [{ from: bestAt[0], to: bestAt[1], tone: 'ghost', label: `best ${best}` }] : [])] : [], cls: { ...Object.fromEntries(nums.map((x, i) => [i, x === 0 ? 'note' : ''])), ...cls } })];
      snap({ kind: 'start', lines: ['grow'], parts: view(-1), title: `Flip at most ${k} zeros = a window with at most ${k} zeros`, text: 'Any stretch with at most k zeros can be made all ones by flipping its zeros. So find the longest such window: grow it on the right, and when it holds too many zeros, move the left end past the oldest zero.', calc: [`k = ${k}`] });
      for (let r = 0; r < nums.length; r++) {
        if (nums[r] === 0) zeros++;
        if (zeros > k) {
          const from = l;
          while (zeros > k) { if (nums[l] === 0) zeros--; l++; }
          snap({ kind: 'shrink', lines: ['grow', 'shrink'], parts: view(r, { [r]: 'cur' }), title: `Index ${r} is zero number ${k + 1}: shrink`, text: `Too many zeros. Move l from ${from} past the oldest zero to ${l}; the window [${l}, ${r}] is back to ${plural(zeros, 'zero')}. Shrinking never loses the answer: any window starting before ${l} and ending here has too many zeros.`, calc: [`l = ${l}`] });
        }
        const len = r - l + 1;
        if (len > best) {
          best = len; bestAt = [l, r];
          snap({ kind: 'grow', lines: ['grow', 'best'], parts: view(r, { [r]: 'hit' }), title: `[${l}, ${r}]: length ${len}, new best`, text: `${nums[r] === 0 ? 'A zero, but still' : 'A one:'} ${plural(zeros, 'zero')} inside, within the ${k} allowed. Best so far ${best}.`, calc: [`best = ${best}`] });
        }
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: best, answer: String(best), title: `Answer: ${best}`, text: `Each index entered the window once and left at most once: O(n) time, O(1) memory.${bestAt ? ` The best window is [${bestAt[0]}, ${bestAt[1]}].` : ''}`, calc: [`best = ${best}`] });
    },
  },

  replace: {
    code: [['grow', 'for (int r = 0; r < n; r++) {  count[s[r]]++;  top = max(top, count[s[r]]);'], ['shrink', '    while (r - l + 1 - top > k) { count[s[l]]--; l++; }'], ['best', '    best = max(best, r - l + 1);'], ['ret', '}  return best;']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'AABABBA', re: /^[A-D]{1,12}$/, msg: 's: up to 12 capital letters A to D.' }, { name: 'k', label: 'k', type: 'int', placeholder: '1', short: true, min: 0, max: 5 }],
    random: (g) => ({ s: Array.from({ length: g.int(1, 10) }, () => g.pick(['A', 'B', 'C'])).join(''), k: g.int(0, 3) }),
    brute: ({ s, k }) => { let best = 0; for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) { const c = {}; let top = 0; for (const ch of s.slice(i, j + 1)) top = Math.max(top, (c[ch] = (c[ch] ?? 0) + 1)); if (j - i + 1 - top <= k) best = Math.max(best, j - i + 1); } return best; },
    describe: ({ s, k }) => `s = "${s}", k = ${k}`,
    rule: 'length − (most common letter) ≤ k',
    run({ s, k }, snap) {
      const count = {};
      let l = 0, best = 0;
      const top = () => Math.max(0, ...Object.values(count));
      const view = (r, cls = {}) => [strip('s', [...s], { tags: r >= 0 ? winTags(l, r) : {}, bands: r >= 0 ? [{ from: l, to: r, tone: 'accent', label: `${r - l + 1} − ${top()} = ${r - l + 1 - top()} to change` }] : [], cls }), mapChips('counts in the window', Object.fromEntries(Object.entries(count).filter(([, v]) => v).sort()), { empty: 'empty' })];
      snap({ kind: 'start', lines: ['grow'], parts: view(-1), title: 'Keep the most common letter, change the rest', text: `A window can become one repeated letter by changing everything except its most common letter. That costs (length − most common count) changes, which must be at most k = ${k}.`, calc: [`k = ${k}`] });
      for (let r = 0; r < s.length; r++) {
        count[s[r]] = (count[s[r]] ?? 0) + 1;
        if (r - l + 1 - top() > k) {
          const from = l;
          while (r - l + 1 - top() > k) { count[s[l]]--; l++; }
          snap({ kind: 'shrink', lines: ['grow', 'shrink'], parts: view(r, { [r]: 'cur' }), title: `Adding '${s[r]}' needs too many changes: shrink`, text: `Drop letters from the left (l ${from} → ${l}) until the window needs at most ${k} change${k === 1 ? '' : 's'} again.`, calc: [`l = ${l}`] });
        } else if (r - l + 1 > best) {
          best = r - l + 1;
          snap({ kind: 'grow', lines: ['grow', 'best'], parts: view(r, { [r]: 'hit' }), title: `"${s.slice(l, r + 1)}": ${r - l + 1} − ${top()} = ${r - l + 1 - top()} change${r - l + 1 - top() === 1 ? '' : 's'}, best ${best}`, text: `Within the budget of ${k}. Changing the letters that aren't the most common one gives a run of length ${best}.`, calc: [`best = ${best}`] });
        }
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: best, answer: String(best), title: `Answer: ${best}`, text: 'One pass with letter counts: O(n · 26) at worst for the max, O(n) with the "max only grows" trick.', calc: [`best = ${best}`] });
    },
  },

  minwin: {
    code: [['need', 'need[c]++ for c in t;  missing = t.length();'], ['grow', 'for r: if (need[s[r]]-- > 0) missing--;'], ['shrink', '    while (missing == 0) { record [l, r] if shorter;  if (++need[s[l]] > 0) missing++;  l++; }'], ['ret', 'return the shortest window recorded (or "")']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'ADOBECODEBANC', re: /^[A-Z]{1,14}$/, msg: 's: up to 14 capital letters.' }, { name: 't', label: 't', type: 'str', placeholder: 'ABC', short: true, re: /^[A-Z]{1,4}$/, msg: 't: 1 to 4 capital letters.' }],
    random: (g) => ({ s: Array.from({ length: g.int(1, 12) }, () => g.pick(['A', 'B', 'C', 'D'])).join(''), t: Array.from({ length: g.int(1, 3) }, () => g.pick(['A', 'B', 'C'])).join('') }),
    brute: ({ s, t }) => { const covers = (w) => { const c = {}; for (const ch of w) c[ch] = (c[ch] ?? 0) + 1; for (const ch of t) { if (!c[ch]) return false; c[ch]--; } return true; }; let best = ''; for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) if (covers(s.slice(i, j + 1)) && (!best || j - i + 1 < best.length)) best = s.slice(i, j + 1); return best; },
    check: (input, out) => { const want = MODES.minwin.brute(input); if (out.length !== want.length) return false; if (!out) return true; const c = {}; for (const ch of out) c[ch] = (c[ch] ?? 0) + 1; return input.s.includes(out) && [...input.t].every((ch) => (c[ch] = (c[ch] ?? 0) - 1) >= 0); },
    describe: ({ s, t }) => `s = "${s}", t = "${t}"`,
    rule: 'grow until it covers t, shrink while it still does',
    run({ s, t }, snap) {
      const need = {};
      for (const c of t) need[c] = (need[c] ?? 0) + 1;
      let missing = t.length, l = 0, best = null;
      const view = (r, cls = {}) => [strip('s', [...s], { tags: r >= 0 ? winTags(l, r) : {}, bands: [...(r >= 0 ? [{ from: l, to: r, tone: missing ? 'accent' : 'success', label: missing ? `missing ${missing}` : 'covers t' }] : []), ...(best ? [{ from: best[0], to: best[1], tone: 'ghost', label: `best ${best[1] - best[0] + 1}` }] : [])], cls }), mapChips('still needed', Object.fromEntries(Object.entries(need).filter(([c]) => t.includes(c)).map(([c, v]) => [c, Math.max(0, v)])), { tone: Object.fromEntries(Object.entries(need).map(([c, v]) => [c, v <= 0 ? 'success' : 'warn'])) })];
      snap({ kind: 'start', lines: ['need'], parts: view(-1), title: `Cover every letter of "${t}"`, text: `need[c] counts copies of c still missing from the window, and missing is their total (${t.length}). Grow the window until missing is 0, then shrink from the left while it stays 0, recording the shortest window seen.`, calc: [`missing = ${missing}`] });
      for (let r = 0; r < s.length; r++) {
        const c = s[r];
        const useful = (need[c] ?? 0) > 0;
        need[c] = (need[c] ?? 0) - 1;
        if (useful) missing--;
        if (missing > 0) { if (useful) snap({ kind: 'grow', lines: ['grow'], parts: view(r, { [r]: 'hit' }), title: `'${c}' at ${r} was needed: ${missing} still missing`, text: `The window [${l}, ${r}] now holds ${t.length - missing} of the ${t.length} letters t needs.`, calc: [`missing = ${missing}`] }); continue; }
        const from = l;
        while (missing === 0) {
          if (!best || r - l < best[1] - best[0]) best = [l, r];
          need[s[l]]++;
          if (need[s[l]] > 0) missing++;
          l++;
        }
        snap({ kind: 'shrink', lines: ['grow', 'shrink'], parts: view(r, { [r]: 'hit', [l - 1]: 'bad' }), title: `Covered at ${r}; shrink to "${s.slice(best[0], best[1] + 1)}"`, text: `With '${c}' every letter of t is inside. Drop letters from the left while that stays true (l ${from} → ${l - 1}); dropping '${s[l - 1]}' at ${l - 1} would lose a needed letter, so the shortest window ending here starts at ${l - 1}. Best so far: "${s.slice(best[0], best[1] + 1)}" (${best[1] - best[0] + 1}).`, calc: [`best ${best[1] - best[0] + 1}`] });
      }
      const out = best ? s.slice(best[0], best[1] + 1) : '';
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out, answer: `"${out}"`, title: out ? `Answer: "${out}"` : 'No window covers t: ""', text: `Both ends only move right, so each index enters and leaves once: O(|s| + |t|).${out ? '' : ' Some letter of t is missing from s (or not enough copies).'}`, calc: [`"${out}"`] });
    },
  },

  kdiff: {
    code: [['split', 'exactly(k) = atMost(k) − atMost(k − 1);'], ['grow', 'atMost(K): for r: add nums[r] to the counts'], ['shrink', '    while (more than K different) remove nums[l++];'], ['count', '    total += r − l + 1;               // every start from l to r works'], ['ret', 'return the difference']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 1, 2, 3', maxLen: 8, min: 1, max: 5 }, { name: 'k', label: 'k', type: 'int', placeholder: '2', short: true, min: 1, max: 4 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 7) }, () => g.int(1, 3)), k: g.int(1, 3) }),
    brute: ({ nums, k }) => { let c = 0; for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) if (new Set(nums.slice(i, j + 1)).size === k) c++; return c; },
    describe: ({ nums, k }) => `nums = ${list(nums)}, k = ${k}`,
    rule: 'exactly k = at most k − at most (k − 1)',
    run({ nums, k }, snap) {
      snap({ kind: 'start', lines: ['split'], parts: [strip('nums', nums)], title: `Exactly ${k} = at most ${k} − at most ${k - 1}`, text: '"At most K different values" is easy to slide: shrinking a window never adds values, and for each right end every start from l to r is valid. Subarrays with exactly k are those counted by at most k but not by at most k − 1.', calc: [`k = ${k}`] });
      const atMost = (K) => {
        const c = new Map();
        let l = 0, total = 0;
        for (let r = 0; r < nums.length; r++) {
          c.set(nums[r], (c.get(nums[r]) ?? 0) + 1);
          let shrank = false;
          while (c.size > K) { const v = nums[l]; c.set(v, c.get(v) - 1); if (!c.get(v)) c.delete(v); l++; shrank = true; }
          total += r - l + 1;
          snap({ kind: shrank ? 'shrink' : 'grow', lines: shrank ? ['grow', 'shrink', 'count'] : ['grow', 'count'], parts: [strip(`at most ${K}`, nums, { tags: winTags(l, r), bands: [{ from: l, to: r, tone: 'accent', label: `${plural(c.size, 'value')}` }] })], title: `At most ${K}, r = ${r}: +${r - l + 1} (total ${total})`, text: `${shrank ? `Adding ${nums[r]} made more than ${K} different values, so l moved to ${l}. ` : ''}The window [${l}, ${r}] has ${plural(c.size, 'different value')}; so does every shorter window ending at ${r}: ${r - l + 1} subarr${r - l + 1 === 1 ? 'ay' : 'ays'}.`, calc: [`total = ${total}`] });
        }
        return total;
      };
      const a = atMost(k);
      const b = k > 1 ? atMost(k - 1) : 0;
      if (k === 1) snap({ kind: 'skip', lines: ['split'], parts: [strip('nums', nums)], title: 'At most 0 is 0', text: 'Every non-empty subarray has at least one value, so "at most 0 different values" counts nothing.', calc: ['atMost(0) = 0'] });
      snap({ kind: 'done', lines: ['ret'], parts: [P.chips('counts', [{ key: 'a', text: `at most ${k}: ${a}` }, { key: 'b', text: `at most ${k - 1}: ${b}` }, { key: 'c', text: `exactly ${k}: ${a - b}`, tone: 'success' }])], out: a - b, answer: String(a - b), title: `Exactly ${k}: ${a} − ${b} = ${a - b}`, text: 'Two linear sweeps with value counts: O(n) time, O(k) memory.', calc: [`${a} − ${b} = ${a - b}`] });
    },
  },

  dup2: {
    code: [['loop', 'for (int i = 0; i < n; i++) {'], ['has', '    if (window.contains(nums[i])) return true;'], ['add', '    window.add(nums[i]);  if (window.size() > k) window.remove(nums[i - k]);'], ['ret', '}  return false;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 3, 1', maxLen: 10, min: 0, max: 9 }, { name: 'k', label: 'k', type: 'int', placeholder: '3', short: true, min: 0, max: 9 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 9) }, () => g.int(0, 5)), k: g.int(0, 4) }),
    brute: ({ nums, k }) => { for (let i = 0; i < nums.length; i++) for (let j = i + 1; j <= i + k && j < nums.length; j++) if (nums[i] === nums[j]) return true; return false; },
    describe: ({ nums, k }) => `nums = ${list(nums)}, k = ${k}`,
    rule: 'only the last k values can be close enough',
    run({ nums, k }, snap) {
      const win = new Set();
      const view = (i, bad) => [strip('nums', nums, { bands: win.size ? [{ from: Math.max(0, i - win.size), to: i - 1, tone: 'note', label: `last ${win.size}` }] : [], cls: i >= 0 && i < nums.length ? { [i]: bad ? 'bad' : 'cur' } : {} }), P.chips('window set', [...win].map((v) => ({ key: String(v), text: String(v), tone: bad && v === nums[i] ? 'danger' : undefined })), 'empty')];
      snap({ kind: 'start', lines: ['loop'], parts: view(-1), title: `A twin must be at most ${k} back`, text: `Only the previous ${k} values are close enough to count. Keep exactly those in a set: when a new value is already in the set, its twin is within ${k} positions.`, calc: [`k = ${k}`] });
      for (let i = 0; i < nums.length; i++) {
        const x = nums[i];
        if (win.has(x)) { let j = i - 1; while (nums[j] !== x) j--; snap({ kind: 'found', lines: ['has'], parts: view(i, true), out: true, answer: 'true', title: `${x} is in the window → true`, text: `The earlier ${x} is at index ${j}, ${i - j} position${i - j === 1 ? '' : 's'} back, which is ≤ k = ${k}.`, calc: [`${i} − ${j} = ${i - j} ≤ ${k}`] }); return; }
        win.add(x);
        let dropped = null;
        if (win.size > k) { dropped = nums[i - k]; win.delete(dropped); }
        snap({ kind: 'add', lines: ['has', 'add'], parts: view(i + 1), title: `Add ${x}${dropped !== null ? `, drop ${dropped}` : ''}`, text: `${x} has no twin among the last ${k}.${dropped !== null ? ` ${dropped} (index ${i - k}) is now more than ${k} back, so it leaves the set.` : ''}`, calc: [`window {${[...win].join(', ')}}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(nums.length), out: false, answer: 'false', title: 'No close twin → false', text: 'Every value was checked against the previous k in O(1). O(n) time, O(k) memory.', calc: ['none'] });
    },
  },

  closest: {
    code: [['range', 'int lo = 0, hi = n - k;                    // possible window starts'], ['mid', 'while (lo < hi) { mid = (lo + hi) / 2;'], ['cmp', '    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1;   // the right side is closer'], ['keep', '    else hi = mid; }'], ['ret', 'return arr[lo … lo + k − 1];']],
    fields: [{ name: 'arr', label: 'sorted arr', type: 'ints', placeholder: '1, 2, 3, 4, 5', maxLen: 10, min: -20, max: 20 }, { name: 'k', label: 'k', type: 'int', placeholder: '4', short: true, min: 1, max: 10 }, { name: 'x', label: 'x', type: 'int', placeholder: '3', short: true, min: -30, max: 30 }],
    valid: ({ arr, k }) => (arr.some((v, i) => i && arr[i - 1] > v) ? 'arr must be sorted.' : k > arr.length ? 'k can be at most the length of arr.' : ''),
    random: (g) => { const arr = Array.from({ length: g.int(1, 9) }, () => g.int(0, 12)).sort((a, b) => a - b); return { arr, k: g.int(1, arr.length), x: g.int(-2, 14) }; },
    brute: ({ arr, k, x }) => [...arr].map((v, i) => [v, i]).sort((p, q) => Math.abs(p[0] - x) - Math.abs(q[0] - x) || p[0] - q[0] || p[1] - q[1]).slice(0, k).map(([v]) => v).sort((a, b) => a - b),
    describe: ({ arr, k, x }) => `arr = ${list(arr)}, k = ${k}, x = ${x}`,
    rule: 'the answer is one window of k: binary search its start',
    run({ arr, k, x }, snap) {
      const n = arr.length;
      let lo = 0, hi = n - k;
      const view = (mid, cls = {}) => [strip('arr', arr, { bands: [{ from: lo, to: hi + k - 1, tone: 'ghost', label: `starts ${lo} … ${hi}` }, ...(mid >= 0 ? [{ from: mid, to: mid + k - 1, tone: 'accent', label: `start ${mid}` }] : [])], cls })];
      snap({ kind: 'start', lines: ['range'], parts: view(-1), title: `The ${k} closest values are side by side`, text: `The array is sorted, so the k values closest to ${x} form one window. Its start is between 0 and n − k = ${n - k}. Binary search it: a window starting at mid is beaten by the one starting at mid + 1 when arr[mid + k] is closer to ${x} than arr[mid].`, calc: [`starts ${lo} … ${hi}`] });
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const left = x - arr[mid], right = arr[mid + k] - x;
        const goRight = left > right;
        snap({ kind: 'look', lines: ['mid', 'cmp', goRight ? 'cmp' : 'keep'], parts: view(mid, { [mid]: goRight ? 'bad' : 'hit', [mid + k]: goRight ? 'hit' : 'bad' }), title: `Start ${mid}: ${arr[mid]} (inside) vs ${arr[mid + k]} (just outside)`, text: goRight ? `x − ${arr[mid]} = ${left} is more than ${arr[mid + k]} − x = ${right}: dropping ${arr[mid]} for ${arr[mid + k]} brings the window closer, so the best start is after ${mid}: lo = ${mid + 1}.` : `x − ${arr[mid]} = ${left} is at most ${arr[mid + k]} − x = ${right} (ties go to the smaller value), so the window shouldn't move right of ${mid}: hi = ${mid}.`, calc: [`lo ${goRight ? mid + 1 : lo}, hi ${goRight ? hi : mid}`] });
        if (goRight) lo = mid + 1; else hi = mid;
      }
      const out = arr.slice(lo, lo + k);
      snap({ kind: 'done', lines: ['ret'], parts: [strip('arr', arr, { bands: [{ from: lo, to: lo + k - 1, tone: 'success', label: 'answer' }] })], out, answer: list(out), title: `Answer: ${list(out)}`, text: `The window starting at ${lo}. O(log(n − k) + k): the search, then copying the window.`, calc: [list(out)] });
    },
  },
};

const EXAMPLES = {
  ones: { label: '[1,1,1,0,0,0,1,1,1,1,0], k = 2', input: { mode: 'ones', nums: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 } },
  replace: { label: '"AABABBA", k = 1', input: { mode: 'replace', s: 'AABABBA', k: 1 } },
  minwin: { label: '"ADOBECODEBANC", "ABC"', input: { mode: 'minwin', s: 'ADOBECODEBANC', t: 'ABC' } },
  minwinNo: { label: '"A", "AA"', input: { mode: 'minwin', s: 'A', t: 'AA' } },
  kdiff: { label: '[1, 2, 1, 2, 3], k = 2', input: { mode: 'kdiff', nums: [1, 2, 1, 2, 3], k: 2 } },
  dup2: { label: '[1, 2, 3, 1], k = 3', input: { mode: 'dup2', nums: [1, 2, 3, 1], k: 3 } },
  dup2No: { label: '[1, 2, 3, 1, 2, 3], k = 2', input: { mode: 'dup2', nums: [1, 2, 3, 1, 2, 3], k: 2 } },
  closest: { label: '[1 … 5], k = 4, x = 3', input: { mode: 'closest', arr: [1, 2, 3, 4, 5], k: 4, x: 3 } },
  closest2: { label: '[1, 1, 2, 3, 4, 5], k = 4, x = −1', input: { mode: 'closest', arr: [1, 1, 2, 3, 4, 5], k: 4, x: -1 } },
};

export const windowWalk = makeWalk(MODES, EXAMPLES);
