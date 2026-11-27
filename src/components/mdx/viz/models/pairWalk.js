/**
 * <PairWalkViz>: Two Pointers walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   palin      valid palindrome: ends inwards, skipping non-alphanumerics
 *   squares    squares of a sorted array: the bigger end goes last
 *   three      3Sum: sort, fix a, pointers for the other two
 *   remove     remove element: a write index for kept values
 *   reverse    reverse string: swap the ends, step inwards
 *   palin2     valid palindrome II: one deletion at the first mismatch
 *   mergeStr   merge strings alternately
 *   mergeArr   merge sorted array: from the back
 *   four       4Sum: two fixed values, pointers for the last two
 *   rotate     rotate array: three reversals
 */
import { list, plural } from './util.js';
import { P, strip, makeWalk, show } from './walkKit.js';

const isAlnum = (c) => /[a-z0-9]/i.test(c);
const vis = (c) => (c === ' ' ? '␣' : c);
const ptr = (l, r, ln = 'L', rn = 'R') => (l === r ? { [l]: [[`${ln}=${rn}`, 'accent']] } : { ...(l >= 0 ? { [l]: [[ln, 'accent']] } : {}), ...(r >= 0 ? { [r]: [[rn, 'warn']] } : {}) });
const sortNum = (a) => [...a].sort((x, y) => x - y);

function kSumBrute(nums, k, target) {
  const a = sortNum(nums), out = new Set();
  const rec = (start, picked) => {
    if (picked.length === k) { if (picked.reduce((s, x) => s + x, 0) === target) out.add(JSON.stringify(picked)); return; }
    for (let i = start; i < a.length; i++) rec(i + 1, [...picked, a[i]]);
  };
  rec(0, []);
  return [...out].map((x) => JSON.parse(x)).sort((x, y) => (JSON.stringify(x) < JSON.stringify(y) ? -1 : 1));
}
const sameSets = (out, want) => JSON.stringify(out.map((x) => sortNum(x)).sort((x, y) => (JSON.stringify(x) < JSON.stringify(y) ? -1 : 1))) === JSON.stringify(want);

const MODES = {
  palin: {
    code: [['ends', 'int l = 0, r = s.length() - 1;'], ['skip', 'while (l < r) {  skip non-letters/digits on each side'], ['cmp', '    if (lower(s[l]) != lower(s[r])) return false;'], ['move', '    l++; r--;'], ['ok', '}  return true;']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'race a car', re: /^[A-Za-z0-9][A-Za-z0-9 ,.:!?']{0,14}[A-Za-z0-9.!?]?$/, msg: 's: up to 16 letters, digits, spaces and punctuation, starting with a letter or digit.' }],
    random: (g) => { const half = Array.from({ length: g.int(1, 3) }, () => g.pick(['a', 'b', 'c'])); const mid = g.bool() ? [g.pick(['x', ' ', ','])] : []; let arr = [...half, ...mid, ...[...half].reverse()]; if (g.bool(0.4)) arr[g.int(0, arr.length - 1)] = g.pick(['a', 'b', 'C']); arr = arr.flatMap((c, k) => (k && g.bool(0.2) ? [' ', c] : [c])); if (!isAlnum(arr[0])) arr[0] = 'a'; if (!/[A-Za-z0-9.!?]/.test(arr.at(-1))) arr.push('a'); return { s: arr.join('') }; },
    brute: ({ s }) => { const t = [...s.toLowerCase()].filter(isAlnum).join(''); return t === [...t].reverse().join(''); },
    describe: ({ s }) => `s = "${s}"`,
    rule: 'compare the ends, skip what doesn\'t count',
    run({ s }, snap) {
      const view = (l, r, cls = {}) => [strip('s', [...s].map(vis), { cls: { ...Object.fromEntries([...s].map((c, k) => [k, !isAlnum(c) ? 'muted' : (k < l || k > r) ? 'dim' : ''])), ...cls }, tags: ptr(l, r) })];
      let l = 0, r = s.length - 1;
      snap({ kind: 'start', lines: ['ends'], parts: view(l, r), title: 'Pointers at both ends', text: 'A palindrome reads the same from both ends, so compare the outermost characters and work inwards. Spaces and punctuation don\'t count and case doesn\'t matter, so they are skipped on the fly: no cleaned copy needed.', calc: [`l = 0, r = ${r}`] });
      while (l < r) {
        const skipped = [];
        while (l < r && !isAlnum(s[l])) skipped.push(l++);
        while (l < r && !isAlnum(s[r])) skipped.push(r--);
        if (l >= r) break;
        if (skipped.length) snap({ kind: 'skip', lines: ['skip'], parts: view(l, r), title: `Skip ${plural(skipped.length, 'character')} that ${skipped.length === 1 ? "doesn't" : "don't"} count`, text: `${skipped.map((k) => `'${vis(s[k])}' at ${k}`).join(', ')} ${skipped.length === 1 ? 'is' : 'are'} not a letter or digit, so the pointer moves past without comparing.`, calc: [`l = ${l}, r = ${r}`] });
        const a = s[l].toLowerCase(), b = s[r].toLowerCase();
        if (a !== b) { snap({ kind: 'fail', lines: ['cmp'], parts: view(l, r, { [l]: 'bad', [r]: 'bad' }), out: false, answer: 'false', title: `${s[l]} ≠ ${s[r]} → false`, text: `Index ${l} holds '${s[l]}' and index ${r} holds '${s[r]}'. The mirror images differ, so the cleaned string is not a palindrome. Nothing else needs checking.`, calc: [`'${a}' ≠ '${b}'`] }); return; }
        snap({ kind: 'keep', lines: ['cmp', 'move'], parts: view(l, r, { [l]: 'hit', [r]: 'hit' }), title: `${s[l]} = ${s[r]}${s[l] !== s[r] ? ' (ignoring case)' : ''}`, text: `Indexes ${l} and ${r} mirror each other and match. Move both inwards.`, calc: [`'${a}' = '${b}'`] });
        l++; r--;
      }
      snap({ kind: 'done', lines: ['ok'], parts: view(l, r), out: true, answer: 'true', title: 'The pointers met → true', text: 'Every mirrored pair matched. Each character was looked at once: O(n) time, O(1) memory.', calc: ['palindrome'] });
    },
  },

  squares: {
    code: [['ends', 'int l = 0, r = n - 1;  write = n - 1;'], ['cmp', 'while (l <= r)  the bigger of |a[l]|, |a[r]| has the biggest square left'], ['put', '    ans[write--] = that square;  move that pointer inwards'], ['ret', 'return ans;']],
    fields: [{ name: 'nums', label: 'sorted nums', type: 'ints', placeholder: '-4, -1, 0, 3, 10', maxLen: 8, min: -20, max: 20 }],
    valid: ({ nums }) => (nums.some((x, k) => k && nums[k - 1] > x) ? 'nums must be sorted (ascending).' : ''),
    random: (g) => ({ nums: sortNum(Array.from({ length: g.int(1, 7) }, () => g.int(-9, 9))) }),
    brute: ({ nums }) => sortNum(nums.map((x) => x * x)),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'the largest square is at one of the ends',
    run({ nums }, snap) {
      const n = nums.length, ans = Array(n).fill('');
      let l = 0, r = n - 1, w = n - 1;
      const view = (cls = {}) => [strip('nums', nums, { tags: ptr(l, r), cls: { ...Object.fromEntries(nums.map((_, k) => [k, k < l || k > r ? 'dim' : ''])), ...cls } }), strip('ans', ans, { cls: Object.fromEntries(ans.map((v, k) => [k, v !== '' ? 'kept' : ''])) })];
      snap({ kind: 'start', lines: ['ends'], parts: view(), title: 'The biggest square sits at an end', text: 'Squaring makes big negatives big, so the order breaks in the middle. But the largest absolute value is always the leftmost or the rightmost value. Fill the answer from the back, each time taking the bigger end.', calc: [`l = 0, r = ${n - 1}`] });
      while (l <= r) {
        const left = Math.abs(nums[l]) > Math.abs(nums[r]);
        const k = left ? l : r, sq = nums[k] * nums[k];
        ans[w] = sq;
        snap({ kind: 'add', lines: ['cmp', 'put'], parts: view({ [k]: 'hit' }), title: l === r ? `Last one: ${nums[k]}² = ${sq}` : `|${nums[l]}| vs |${nums[r]}|: write ${sq} at ${w}`, text: l === r ? `Only one value is left; its square ${sq} goes in slot ${w}.` : `${left ? `The left end (${nums[l]})` : `The right end (${nums[r]})`} is bigger in size, so ${sq} is the largest square still unplaced. Write it in slot ${w} and move that pointer inwards.`, calc: [`ans[${w}] = ${sq}`] });
        w--;
        if (left) l++; else r--;
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(), out: [...ans], answer: list(ans), title: `Done: ${list(ans)}`, text: 'Each step placed one square, so n steps in all: O(n), instead of squaring and sorting in O(n log n).', calc: [list(ans)] });
    },
  },

  three: {
    code: [['sort', 'sort(nums);'], ['fix', 'for (int i = 0; i < n - 2; i++) {  if (i > 0 && nums[i] == nums[i - 1]) continue;'], ['ptr', '    int l = i + 1, r = n - 1;  need = -nums[i];'], ['move', '    while (l < r): sum < need → l++;  sum > need → r--;'], ['hit', '        equal → record, then move both past copies'], ['ret', '}  return found;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '-1, 0, 1, 2, -1, -4', minLen: 3, maxLen: 8, min: -9, max: 9 }],
    random: (g) => ({ nums: Array.from({ length: g.int(3, 7) }, () => g.int(-4, 4)) }),
    brute: ({ nums }) => kSumBrute(nums, 3, 0),
    check: (input, out) => sameSets(out, kSumBrute(input.nums, 3, 0)),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'fix one value, two pointers find the other two',
    run({ nums }, snap) {
      const a = sortNum(nums), n = a.length, found = [];
      const view = (i, l, r, cls = {}) => [strip('sorted', a, { tags: { ...ptr(l, r), ...(i >= 0 ? { [i]: [['a', 'success']] } : {}) }, cls: { ...Object.fromEntries(a.map((_, k) => [k, i >= 0 && k < i ? 'dim' : ''])), ...(i >= 0 ? { [i]: 'note' } : {}), ...cls } }), P.chips('found', found.map((t, k) => ({ key: String(k), text: list(t), tone: 'success' })), 'none yet')];
      snap({ kind: 'start', lines: ['sort'], parts: view(-1, -1, -1), title: `Sort: ${list(a)}`, text: 'Sorting puts equal values side by side (easy to skip) and lets two pointers search for a pair by moving inwards. Then fix the first number a; the other two must sum to −a.', calc: [`n = ${n}`] });
      for (let i = 0; i < n - 2; i++) {
        if (i > 0 && a[i] === a[i - 1]) { snap({ kind: 'skip', lines: ['fix'], parts: view(i, -1, -1), title: `a = ${a[i]} again: skip`, text: `It equals the previous a, so it could only rebuild the same triplets.`, calc: [`skip index ${i}`] }); continue; }
        const need = -a[i];
        let l = i + 1, r = n - 1;
        snap({ kind: 'look', lines: ['fix', 'ptr'], parts: view(i, l, r), title: `a = ${a[i]}: need two values summing to ${need}`, text: `Search the part after a with l at ${l} and r at ${r}. A sum too small moves l right (to bigger values); too big moves r left.`, calc: [`need ${need}`] });
        while (l < r) {
          const sum = a[l] + a[r];
          if (sum === need) {
            found.push([a[i], a[l], a[r]]);
            snap({ kind: 'found', lines: ['move', 'hit'], parts: view(i, l, r, { [l]: 'hit', [r]: 'hit' }), title: `${a[l]} + ${a[r]} = ${need} ✓: record ${list([a[i], a[l], a[r]])}`, text: 'A triplet. Move both pointers inwards, past any copies of the values just used, so the same triplet isn\'t recorded twice.', calc: [`${plural(found.length, 'triplet')}`] });
            l++; r--;
            while (l < r && a[l] === a[l - 1]) l++;
            while (l < r && a[r] === a[r + 1]) r--;
          } else if (sum < need) {
            snap({ kind: 'move', lines: ['move'], parts: view(i, l, r), title: `${a[l]} + ${a[r]} = ${sum} < ${need}: l moves right`, text: `Too small. Pairing ${a[l]} with any smaller value (everything left of r) is smaller still, so ${a[l]} can't be part of an answer: l++.`, calc: [`sum ${sum}`] });
            l++;
          } else {
            snap({ kind: 'move', lines: ['move'], parts: view(i, l, r), title: `${a[l]} + ${a[r]} = ${sum} > ${need}: r moves left`, text: `Too big. Pairing ${a[r]} with any larger value (everything right of l) is bigger still, so ${a[r]} can't be part of an answer: r−−.`, calc: [`sum ${sum}`] });
            r--;
          }
        }
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1, -1, -1), out: found, answer: found.length ? `[${found.map(list).join(', ')}]` : '[]', title: `${plural(found.length, 'triplet')}`, text: 'Each a costs one inward sweep: O(n²) in total, plus O(n log n) for the sort. Skipping equal values at both levels keeps every triplet unique without a set.', calc: [found.length ? found.map(list).join(' ') : 'none'] });
    },
  },

  remove: {
    code: [['w', 'int w = 0;                       // next free slot for a kept value'], ['loop', 'for (int x : nums)'], ['keep', '    if (x != val) nums[w++] = x;'], ['ret', 'return w;                        // k = how many were kept']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '3, 2, 2, 3', maxLen: 8, min: 0, max: 9 }, { name: 'val', label: 'val', type: 'int', placeholder: '3', short: true, min: 0, max: 9 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 7) }, () => g.int(0, 4)), val: g.int(0, 4) }),
    brute: ({ nums, val }) => nums.filter((x) => x !== val),
    check: ({ nums, val }, out) => JSON.stringify(out) === JSON.stringify(nums.filter((x) => x !== val)),
    describe: ({ nums, val }) => `nums = ${list(nums)}, val = ${val}`,
    rule: 'copy what you keep to the front',
    run({ nums, val }, snap) {
      const a = [...nums];
      let w = 0;
      const view = (i, cls = {}) => [strip('nums', a, { tags: { ...(i >= 0 && i < a.length ? { [i]: [['read', 'accent']] } : {}), ...(w < a.length ? { [w]: [...(i === w ? [] : []), ['w', 'success']] } : {}) }, cls: { ...Object.fromEntries(a.map((_, k) => [k, k < w ? 'kept' : ''])), ...cls } })];
      snap({ kind: 'start', lines: ['w'], parts: view(-1), title: `Keep everything except ${val}`, text: 'Deleting from the middle shifts the whole tail every time. Instead, one index reads every value and a second index w marks the next free slot at the front: kept values are copied there.', calc: ['w = 0'] });
      for (let i = 0; i < a.length; i++) {
        const x = a[i];
        if (x === val) { snap({ kind: 'skip', lines: ['loop', 'keep'], parts: view(i, { [i]: 'bad' }), title: `${x} = val: skip`, text: `Index ${i} holds ${x}, the value being removed. It is simply not copied; w stays at ${w}.`, calc: [`w = ${w}`] }); continue; }
        a[w] = x; w++;
        snap({ kind: 'keep', lines: ['loop', 'keep'], parts: view(i, { [w - 1]: 'hit' }), title: `${x}: copy to slot ${w - 1}`, text: `${x} is kept, so it goes to slot ${w - 1}${w - 1 === i ? ' (where it already is)' : `, overwriting a value already read`}. w moves to ${w}.`, calc: [`w = ${w}`] });
      }
      const out = a.slice(0, w);
      snap({ kind: 'done', lines: ['ret'], parts: [strip('nums', a, { cls: Object.fromEntries(a.map((_, k) => [k, k < w ? 'kept' : 'muted'])), bands: w ? [{ from: 0, to: w - 1, tone: 'success', label: `k = ${w}` }] : [] })], out, answer: `k = ${w}`, title: `k = ${w}`, text: `The first ${w} slots hold the kept values${w ? ` (${list(out)})` : ''}; whatever is after them doesn't matter. One pass, no shifting: O(n), O(1).`, calc: [`k = ${w}`] });
    },
  },

  reverse: {
    code: [['ends', 'int l = 0, r = s.length - 1;'], ['swap', 'while (l < r) { swap(s[l], s[r]); l++; r--; }'], ['done', '// the middle character (odd length) stays put']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'hello', re: /^[a-z]{1,10}$/ }],
    random: (g) => ({ s: Array.from({ length: g.int(1, 8) }, () => g.pick(['a', 'b', 'c', 'd', 'e'])).join('') }),
    brute: ({ s }) => [...s].reverse(),
    describe: ({ s }) => `s = "${s}"`,
    rule: 'swap mirror positions, ends first',
    run({ s }, snap) {
      const a = [...s];
      let l = 0, r = a.length - 1;
      const view = (cls = {}) => [strip('s', a, { tags: ptr(l, r), cls: { ...Object.fromEntries(a.map((_, k) => [k, k < l || k > r ? 'kept' : ''])), ...cls } })];
      snap({ kind: 'start', lines: ['ends'], parts: view(), title: 'Swap each character with its mirror', text: `Reversed, position i holds what was at position n − 1 − i. Swapping the two ends and stepping inwards does every pair once: ${Math.floor(a.length / 2)} swaps, no second array.`, calc: [`l = 0, r = ${r}`] });
      while (l < r) {
        [a[l], a[r]] = [a[r], a[l]];
        snap({ kind: 'swap', lines: ['swap'], parts: view({ [l]: 'hit', [r]: 'hit' }), title: `Swap ${a[r]} (index ${l}) and ${a[l]} (index ${r})`, text: `Indexes ${l} and ${r} are mirror positions; after the swap both hold their final letters. Move both inwards.`, calc: [`l = ${l}, r = ${r}`] });
        l++; r--;
      }
      snap({ kind: 'done', lines: ['done'], parts: view(), out: [...a], answer: `"${a.join('')}"`, title: `Done: "${a.join('')}"`, text: `${l === r ? `The pointers meet at the middle '${a[l]}', which stays where it is. ` : 'The pointers crossed. '}O(n) time, O(1) extra memory.`, calc: [`"${a.join('')}"`] });
    },
  },

  palin2: {
    code: [['ends', 'int l = 0, r = n - 1;'], ['match', 'while (l < r && s[l] == s[r]) { l++; r--; }'], ['try', 'mismatch: return isPal(l + 1, r) || isPal(l, r - 1);   // delete one of the two'], ['ok', 'no mismatch: return true;']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'abca', re: /^[a-z]{1,12}$/, msg: 's: up to 12 lower-case letters.' }],
    random: (g) => { const half = Array.from({ length: g.int(1, 4) }, () => g.pick(['a', 'b', 'c'])); const arr = [...half, ...(g.bool() ? [g.pick(['a', 'b'])] : []), ...[...half].reverse()]; if (g.bool(0.6)) arr.splice(g.int(0, arr.length), 0, g.pick(['x', 'y'])); if (g.bool(0.2)) arr.splice(g.int(0, arr.length), 0, 'z'); return { s: arr.join('') }; },
    brute: ({ s }) => { const pal = (t) => t === [...t].reverse().join(''); if (pal(s)) return true; for (let k = 0; k < s.length; k++) if (pal(s.slice(0, k) + s.slice(k + 1))) return true; return false; },
    describe: ({ s }) => `s = "${s}"`,
    rule: 'at the first mismatch, delete one of the two',
    run({ s }, snap) {
      const view = (l, r, cls = {}) => [strip('s', [...s], { tags: ptr(l, r), cls: { ...Object.fromEntries([...s].map((_, k) => [k, k < l || k > r ? 'dim' : ''])), ...cls } })];
      let l = 0, r = s.length - 1;
      snap({ kind: 'start', lines: ['ends'], parts: view(l, r), title: 'Match from both ends', text: 'Compare mirrored characters as in a normal palindrome check. While they match, no deletion is needed. Only the first mismatch forces a choice.', calc: [`l = 0, r = ${r}`] });
      while (l < r && s[l] === s[r]) { snap({ kind: 'keep', lines: ['match'], parts: view(l, r, { [l]: 'hit', [r]: 'hit' }), title: `${s[l]} = ${s[r]}`, text: `Indexes ${l} and ${r} match. Move inwards.`, calc: [`l = ${l}, r = ${r}`] }); l++; r--; }
      if (l >= r) { snap({ kind: 'done', lines: ['ok'], parts: view(l, r), out: true, answer: 'true', title: 'Already a palindrome → true', text: 'Every mirrored pair matched, so no deletion is even needed. O(n).', calc: ['0 deletions'] }); return; }
      snap({ kind: 'look', lines: ['try'], parts: view(l, r, { [l]: 'bad', [r]: 'bad' }), title: `${s[l]} ≠ ${s[r]}: one of them must go`, text: `Everything outside [${l}, ${r}] already matches. To fix this pair with one deletion, either '${s[l]}' (index ${l}) or '${s[r]}' (index ${r}) has to be the deleted character. Try both.`, calc: [`mismatch at ${l}, ${r}`] });
      const isPal = (i, j) => { while (i < j) { if (s[i] !== s[j]) return false; i++; j--; } return true; };
      const a = isPal(l + 1, r), b = isPal(l, r - 1);
      const mid = (i, j) => s.slice(i, j + 1) || '(empty)';
      snap({ kind: a ? 'found' : 'skip', lines: ['try'], parts: [strip(`delete '${s[l]}' at ${l}`, [...s], { cls: Object.fromEntries([...s].map((_, k) => [k, k === l ? 'muted' : k > l && k <= r ? (a ? 'hit' : 'bad') : 'dim'])) })], title: `Skip index ${l}: "${mid(l + 1, r)}" ${a ? 'is' : 'is not'} a palindrome`, text: a ? `Deleting '${s[l]}' leaves a palindrome in the middle, so one deletion is enough.` : `Deleting '${s[l]}' still leaves a mismatch inside. Try the other side.`, calc: [`isPal(${l + 1}, ${r}) = ${a}`] });
      if (!a) snap({ kind: b ? 'found' : 'fail', lines: ['try'], parts: [strip(`delete '${s[r]}' at ${r}`, [...s], { cls: Object.fromEntries([...s].map((_, k) => [k, k === r ? 'muted' : k >= l && k < r ? (b ? 'hit' : 'bad') : 'dim'])) })], title: `Skip index ${r}: "${mid(l, r - 1)}" ${b ? 'is' : 'is not'} a palindrome`, text: b ? `Deleting '${s[r]}' leaves a palindrome in the middle, so one deletion is enough.` : 'Neither deletion fixes it, so one deletion is not enough.', calc: [`isPal(${l}, ${r - 1}) = ${b}`] });
      const out = a || b;
      snap({ kind: 'done', lines: ['try'], parts: view(l, r), out, answer: String(out), title: out ? 'One deletion is enough → true' : 'Not with one deletion → false', text: 'Only the first mismatch matters: the outer part already matched, and each option is checked once. O(n) in total.', calc: [String(out)] });
    },
  },

  mergeStr: {
    code: [['loop', 'for (int i = 0; i < max(a, b); i++) {'], ['take', '    if (i < a) out += w1[i];  if (i < b) out += w2[i];'], ['ret', '}  return out;']],
    fields: [{ name: 'w1', label: 'word1', type: 'str', placeholder: 'abc', short: true, re: /^[a-z]{1,6}$/, msg: 'word1: 1 to 6 letters.' }, { name: 'w2', label: 'word2', type: 'str', placeholder: 'pqr', short: true, re: /^[a-z]{1,6}$/, msg: 'word2: 1 to 6 letters.' }],
    random: (g) => ({ w1: Array.from({ length: g.int(1, 5) }, () => g.pick(['a', 'b', 'c'])).join(''), w2: Array.from({ length: g.int(1, 5) }, () => g.pick(['p', 'q', 'r'])).join('') }),
    brute: ({ w1, w2 }) => { let o = ''; for (let i = 0; i < Math.max(w1.length, w2.length); i++) o += (w1[i] ?? '') + (w2[i] ?? ''); return o; },
    describe: ({ w1, w2 }) => `"${w1}", "${w2}"`,
    rule: 'one letter from each, then the rest',
    run({ w1, w2 }, snap) {
      let out = '';
      const view = (i) => [strip('word1', [...w1], { cls: Object.fromEntries([...w1].map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), strip('word2', [...w2], { cls: Object.fromEntries([...w2].map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), strip('merged', [...out], { index: false, cls: { [out.length - 1]: 'hit' } })];
      snap({ kind: 'start', lines: ['loop'], parts: view(-1), title: 'One index walks both words', text: 'Position i of the merge takes word1[i], then word2[i]. When the shorter word runs out, the rest of the longer word is appended unchanged.', calc: [`${w1.length} and ${w2.length} letters`] });
      for (let i = 0; i < Math.max(w1.length, w2.length); i++) {
        const got = (w1[i] ?? '') + (w2[i] ?? '');
        out += got;
        snap({ kind: 'add', lines: ['take'], parts: view(i), title: `i = ${i}: add "${got}"`, text: i < w1.length && i < w2.length ? `Both words still have a letter at ${i}: '${w1[i]}' then '${w2[i]}'.` : `Only ${i < w1.length ? 'word1' : 'word2'} has a letter at ${i}, so it goes on alone.`, calc: [`"${out}"`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(99), out, answer: `"${out}"`, title: `Done: "${out}"`, text: 'Every letter is copied once: O(a + b). A StringBuilder keeps the appends cheap.', calc: [`"${out}"`] });
    },
  },

  mergeArr: {
    code: [['ptrs', 'int i = m - 1, j = n - 1, w = m + n - 1;     // fill from the back'], ['cmp', 'while (j >= 0)  the larger of nums1[i], nums2[j] goes to slot w--'], ['rest', '// nums2 used up: nums1\'s remaining values are already in place'], ['ret', 'done']],
    fields: [{ name: 'a', label: 'nums1 (its m values)', type: 'ints', placeholder: '1, 2, 3', maxLen: 5, minLen: 0, min: -9, max: 9 }, { name: 'b', label: 'nums2', type: 'ints', placeholder: '2, 5, 6', maxLen: 5, minLen: 0, min: -9, max: 9 }],
    valid: ({ a, b }) => (a.some((x, k) => k && a[k - 1] > x) || b.some((x, k) => k && b[k - 1] > x) ? 'Both arrays must be sorted.' : !a.length && !b.length ? 'At least one value in total.' : ''),
    random: (g) => ({ a: sortNum(Array.from({ length: g.int(0, 4) }, () => g.int(0, 9))), b: sortNum(Array.from({ length: g.int(0, 4) }, () => g.int(0, 9))) }),
    brute: ({ a, b }) => sortNum([...a, ...b]),
    describe: ({ a, b }) => `nums1 = ${list(a)} + ${b.length} free slots, nums2 = ${list(b)}`,
    rule: 'merge from the back, into the free space',
    run({ a, b }, snap) {
      const m = a.length, n = b.length, arr = [...a, ...Array(n).fill('·')];
      let i = m - 1, j = n - 1, w = m + n - 1;
      const view = (cls = {}) => [strip('nums1', arr, { tags: { ...(i >= 0 ? { [i]: [['i', 'accent']] } : {}), ...(w >= 0 && w !== i ? { [w]: [['w', 'success']] } : {}) }, cls: { ...Object.fromEntries(arr.map((_, k) => [k, k > w ? 'kept' : ''])), ...cls } }), strip('nums2', b.length ? b : ['—'], { index: b.length > 0, tags: j >= 0 ? { [j]: [['j', 'warn']] } : {}, cls: Object.fromEntries(b.map((_, k) => [k, k > j ? 'dim' : ''])) })];
      snap({ kind: 'start', lines: ['ptrs'], parts: view(), title: 'Fill the free space from the back', text: 'Merging from the front would overwrite nums1 values not yet read. The free slots are at the end, so place the largest values first: compare the last unplaced value of each array and write the larger into the last free slot.', calc: [`i = ${i}, j = ${j}, w = ${w}`] });
      while (j >= 0) {
        const fromA = i >= 0 && a[i] > b[j];
        const v = fromA ? a[i] : b[j];
        arr[w] = v;
        snap({ kind: 'add', lines: ['cmp'], parts: view({ [w]: 'hit' }), title: i >= 0 ? `${a[i]} vs ${b[j]}: write ${v} at ${w}` : `nums1 is used up: write ${v} at ${w}`, text: i >= 0 ? `${fromA ? `nums1's ${a[i]}` : `nums2's ${b[j]}`} is the larger of the two, so it is the largest value not yet placed. Slot ${w} is free (or already read).` : `Only nums2 values remain; copy them in order.`, calc: [`nums1[${w}] = ${v}`] });
        if (fromA) i--; else j--;
        w--;
      }
      const out = arr.map(Number);
      snap({ kind: 'done', lines: ['rest', 'ret'], parts: view(), out, answer: list(out), title: `Done: ${list(out)}`, text: `nums2 is used up. ${i >= 0 ? `nums1's first ${i + 1} value${i ? 's are' : ' is'} already in the right place, untouched.` : 'Everything has been placed.'} O(m + n), no extra array.`, calc: [list(out)] });
    },
  },

  four: {
    code: [['sort', 'sort(nums);'], ['i', 'for i: skip a repeated nums[i]'], ['j', '    for j > i: skip a repeated nums[j]'], ['ptr', '        l = j + 1, r = n − 1: sum too small → l++, too big → r−−'], ['hit', '        equal → record, move both past copies'], ['ret', 'return found;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 0, -1, 0, -2, 2', minLen: 4, maxLen: 7, min: -9, max: 9 }, { name: 'target', label: 'target', type: 'int', placeholder: '0', short: true, min: -20, max: 20 }],
    random: (g) => ({ nums: Array.from({ length: g.int(4, 7) }, () => g.int(-3, 3)), target: g.int(-2, 2) }),
    brute: ({ nums, target }) => kSumBrute(nums, 4, target),
    check: (input, out) => sameSets(out, kSumBrute(input.nums, 4, input.target)),
    describe: ({ nums, target }) => `nums = ${list(nums)}, target = ${target}`,
    rule: 'fix two values, two pointers find the last two',
    run({ nums, target }, snap) {
      const a = sortNum(nums), n = a.length, found = [];
      const view = (i, j, l, r, cls = {}) => [strip('sorted', a, { tags: { ...ptr(l, r), ...(i >= 0 ? { [i]: [['i', 'success']] } : {}), ...(j >= 0 ? { [j]: [['j', 'success']] } : {}) }, cls: { ...(i >= 0 ? { [i]: 'note' } : {}), ...(j >= 0 ? { [j]: 'note' } : {}), ...cls } }), P.chips('found', found.map((t, k) => ({ key: String(k), text: list(t), tone: 'success' })), 'none yet')];
      snap({ kind: 'start', lines: ['sort'], parts: view(-1, -1, -1, -1), title: `Sort: ${list(a)}`, text: `4Sum is 3Sum with one more fixed value: two loops fix the first two values, and two pointers find the last two in one sweep. Skipping repeated values at every level keeps the quadruplets unique. Target ${target}.`, calc: [`n = ${n}`] });
      for (let i = 0; i < n - 3; i++) {
        if (i > 0 && a[i] === a[i - 1]) continue;
        for (let j = i + 1; j < n - 2; j++) {
          if (j > i + 1 && a[j] === a[j - 1]) continue;
          const need = target - a[i] - a[j];
          let l = j + 1, r = n - 1, hits = 0;
          while (l < r) {
            const sum = a[l] + a[r];
            if (sum === need) { found.push([a[i], a[j], a[l], a[r]]); hits++; snap({ kind: 'found', lines: ['ptr', 'hit'], parts: view(i, j, l, r, { [l]: 'hit', [r]: 'hit' }), title: `${a[i]}, ${a[j]} + ${a[l]} + ${a[r]} = ${target} ✓`, text: `With ${a[i]} and ${a[j]} fixed, the last two must sum to ${need}: ${a[l]} + ${a[r]} does. Record it and move both pointers past copies.`, calc: [`${plural(found.length, 'quadruplet')}`] }); l++; r--; while (l < r && a[l] === a[l - 1]) l++; while (l < r && a[r] === a[r + 1]) r--; } else if (sum < need) l++; else r--;
          }
          if (!hits) snap({ kind: 'skip', lines: ['i', 'j', 'ptr'], parts: view(i, j, -1, -1), title: `Fix ${a[i]}, ${a[j]}: need ${need}, none found`, text: `The pointers swept the values after index ${j} inwards (too small → l++, too big → r−−) and met without a pair summing to ${need}.`, calc: [`need ${need}`] });
        }
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1, -1, -1, -1), out: found, answer: found.length ? `[${found.map(list).join(', ')}]` : '[]', title: `${plural(found.length, 'quadruplet')}`, text: 'O(n³): n² fixed pairs, each with one linear sweep. Sums can exceed 32 bits on the real limits, so add them as longs.', calc: [found.length ? found.map(list).join(' ') : 'none'] });
    },
  },

  rotate: {
    code: [['k', 'k %= n;'], ['all', 'reverse(nums, 0, n - 1);        // the last k come to the front, backwards'], ['front', 'reverse(nums, 0, k - 1);        // fix the first k'], ['back', 'reverse(nums, k, n - 1);        // fix the rest']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 3, 4, 5, 6, 7', maxLen: 8 }, { name: 'k', label: 'k', type: 'int', placeholder: '3', short: true, min: 0, max: 20 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 8) }, (_, i) => i + 1), k: g.int(0, 10) }),
    brute: ({ nums, k }) => nums.map((_, i) => nums[(i - (k % nums.length) + nums.length) % nums.length]),
    describe: ({ nums, k }) => `nums = ${list(nums)}, k = ${k}`,
    rule: 'reverse all, then each part',
    run({ nums, k: k0 }, snap) {
      const n = nums.length, k = k0 % n, a = [...nums];
      const rev = (i, j) => { while (i < j) { [a[i], a[j]] = [a[j], a[i]]; i++; j--; } };
      const view = (from, to, label) => [strip('nums', a, { bands: from <= to ? [{ from, to, tone: 'accent', label }] : [] })];
      snap({ kind: 'start', lines: ['k'], parts: view(0, -1), title: `k = ${k0} % ${n} = ${k}`, text: `Rotating by n brings everything back, so only k % n matters. Rotating right by ${k} moves the last ${k} values to the front, in order. Three reversals do that in place.`, calc: [`k = ${k}`] });
      rev(0, n - 1);
      snap({ kind: 'swap', lines: ['all'], parts: view(0, n - 1, 'reversed'), title: `Reverse everything: ${list(a)}`, text: `The last ${k} values are now at the front, but backwards; the rest are behind them, also backwards.`, calc: [list(a)] });
      rev(0, k - 1);
      snap({ kind: 'swap', lines: ['front'], parts: view(0, k - 1, `first ${k}`), title: `Reverse the first ${k}: ${list(a)}`, text: k ? `The front block reads forwards again.` : 'k = 0: there is no front block to fix.', calc: [list(a)] });
      rev(k, n - 1);
      snap({ kind: 'swap', lines: ['back'], parts: view(k, n - 1, 'the rest'), title: `Reverse the rest: ${list(a)}`, text: 'The back block reads forwards again too. Every value moved exactly k places to the right, wrapping around.', calc: [list(a)] });
      snap({ kind: 'done', lines: ['back'], parts: view(0, -1), out: [...a], answer: list(a), title: `Done: ${list(a)}`, text: 'Each value is swapped at most twice: O(n) time and O(1) extra memory, with no copy of the array.', calc: [list(a)] });
    },
  },
};

const EXAMPLES = {
  palin: { label: '"race a car"', input: { mode: 'palin', s: 'race a car' } },
  palinYes: { label: '"Taco cat!"', input: { mode: 'palin', s: 'Taco cat!' } },
  squares: { label: '[−4, −1, 0, 3, 10]', input: { mode: 'squares', nums: [-4, -1, 0, 3, 10] } },
  three: { label: '[−1, 0, 1, 2, −1, −4]', input: { mode: 'three', nums: [-1, 0, 1, 2, -1, -4] } },
  remove: { label: '[3, 2, 2, 3], val 3', input: { mode: 'remove', nums: [3, 2, 2, 3], val: 3 } },
  remove2: { label: '[0, 1, 2, 2, 3, 0, 4, 2], val 2', input: { mode: 'remove', nums: [0, 1, 2, 2, 3, 0, 4, 2], val: 2 } },
  reverse: { label: '"hello"', input: { mode: 'reverse', s: 'hello' } },
  palin2: { label: '"abca"', input: { mode: 'palin2', s: 'abca' } },
  palin2No: { label: '"abc"', input: { mode: 'palin2', s: 'abc' } },
  mergeStr: { label: '"abc", "pqr"', input: { mode: 'mergeStr', w1: 'abc', w2: 'pqr' } },
  mergeStr2: { label: '"ab", "pqrs"', input: { mode: 'mergeStr', w1: 'ab', w2: 'pqrs' } },
  mergeArr: { label: '[1, 2, 3] + [2, 5, 6]', input: { mode: 'mergeArr', a: [1, 2, 3], b: [2, 5, 6] } },
  four: { label: '[1, 0, −1, 0, −2, 2], target 0', input: { mode: 'four', nums: [1, 0, -1, 0, -2, 2], target: 0 } },
  rotate: { label: '[1 … 7], k = 3', input: { mode: 'rotate', nums: [1, 2, 3, 4, 5, 6, 7], k: 3 } },
};

export const pairWalk = makeWalk(MODES, EXAMPLES);
