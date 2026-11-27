/**
 * <SortWalkViz>: Sorting and Selection walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   freq      sort array by increasing frequency: count, then (count ↑, value ↓)
 *   largest   largest number: a before b when a + b > b + a
 *   hindex    h-index: level counts capped at n, walk down from n
 *   chars     sort characters by frequency: buckets by count
 *   gap       maximum gap: pigeonhole buckets keep only min and max
 */
import { list, plural } from './util.js';
import { P, strip, mapChips, makeWalk } from './walkKit.js';

const countMap = (a) => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) ?? 0) + 1); return m; };

const MODES = {
  freq: {
    code: [['count', 'count each value;'], ['sort', 'sort nums by (count ascending, then value descending);'], ['ret', 'return nums;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 1, 2, 2, 2, 3', maxLen: 10 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 9) }, () => g.int(-3, 4)) }),
    brute: ({ nums }) => { const c = countMap(nums); return [...nums].sort((a, b) => c.get(a) - c.get(b) || b - a); },
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'rarer first; on a tie, the larger value first',
    run({ nums }, snap) {
      const c = countMap(nums);
      snap({ kind: 'start', lines: ['count'], parts: [strip('nums', nums), mapChips('counts', new Map([...c.entries()].sort((a, b) => a[0] - b[0])))], title: 'Count every value first', text: 'The order depends on how often each value appears, which isn\'t written in the array. One counting pass gives every value its key.', calc: [`${plural(c.size, 'distinct value')}`] });
      const groups = [...c.entries()].sort((a, b) => a[1] - b[1] || b[0] - a[0]);
      const out = [];
      groups.forEach(([v, k], gi) => {
        const tie = groups.some(([w, kk]) => kk === k && w !== v);
        out.push(...Array(k).fill(v));
        snap({ kind: 'add', lines: ['sort'], parts: [strip('result so far', out, { cls: Object.fromEntries(out.map((_, i) => [i, i >= out.length - k ? 'hit' : 'kept'])) })], title: `${v} × ${k}`, text: `${gi === 0 ? `${v} is the rarest value (count ${k})` : `Next comes ${v} (count ${k})`}${tie ? `; it ties with another value on count, and the larger value goes first` : ''}. All its copies stay together because they share the same key.`, calc: [`key (${k}, −${v})`.replace('−-', '')] });
      });
      snap({ kind: 'done', lines: ['ret'], parts: [strip('result', out, { cls: Object.fromEntries(out.map((_, i) => [i, 'kept'])) })], out, answer: list(out), title: `Done: ${list(out)}`, text: 'One counting pass and one sort with a two-part rule: O(n log n).', calc: [list(out)] });
    },
  },

  largest: {
    code: [['rule', 'a goes before b  ⇔  a + b > b + a   (as strings)'], ['sort', 'sort the numbers with that rule;'], ['zero', 'if the first is "0", return "0";'], ['ret', 'return the concatenation;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '3, 30, 34, 5, 9', maxLen: 6, min: 0, max: 999 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 5) }, () => g.pick([0, 1, 3, 9, 10, 30, 34, 5, 50, 99, 12, 121])) }),
    brute: ({ nums }) => { let best = ''; const perm = (rest, acc) => { if (!rest.length) { const s = acc.join(''); if (s.length > best.length || (s.length === best.length && s > best)) best = s; return; } rest.forEach((x, k) => perm(rest.filter((_, j) => j !== k), [...acc, x])); }; perm(nums.map(String), []); return best.replace(/^0+(?=.)/, ''); },
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'compare the two gluings',
    run({ nums }, snap) {
      const s = nums.map(String);
      snap({ kind: 'start', lines: ['rule'], parts: [P.chips('numbers', s.map((x, k) => ({ key: String(k), text: x })))], title: 'Numeric order is the wrong order', text: '10 is bigger than 2, yet "210" beats "102": the first digits matter most. So decide every pair by gluing them both ways and keeping the bigger result. That rule is consistent, so an ordinary sort with it gives the best order.', calc: [`${s.length} numbers`] });
      const order = [...s];
      for (let i = 1; i < order.length; i++) {
        let j = i;
        while (j > 0 && order[j] + order[j - 1] > order[j - 1] + order[j]) {
          const a = order[j - 1], b = order[j];
          [order[j - 1], order[j]] = [order[j], order[j - 1]];
          snap({ kind: 'swap', lines: ['sort'], parts: [strip('order so far', order, { index: false, cls: { [j - 1]: 'hit', [j]: 'note' } })], title: `"${b}" + "${a}" = "${b + a}" > "${a + b}"`, text: `Glued with ${b} first the result is larger, so ${b} goes before ${a}.`, calc: [`${b} before ${a}`] });
          j--;
        }
        if (j === i && i > 0) snap({ kind: 'keep', lines: ['sort'], parts: [strip('order so far', order, { index: false, cls: { [i]: 'kept' } })], title: `"${order[i - 1]}" + "${order[i]}" ≥ "${order[i] + order[i - 1]}": keep`, text: `${order[i - 1]} first is at least as good, so ${order[i]} stays after it.`, calc: [`${order[i - 1]} before ${order[i]}`] });
      }
      const out = order[0] === '0' ? '0' : order.join('');
      snap({ kind: 'done', lines: order[0] === '0' ? ['zero'] : ['ret'], parts: [strip('final order', order, { index: false, cls: Object.fromEntries(order.map((_, k) => [k, 'kept'])) })], out, answer: `"${out}"`, title: `Answer: "${out}"`, text: order[0] === '0' ? 'Every number is 0, so the result is "0", not "000…".' : 'Glue them in this order. O(n log n) comparisons, each comparing strings of length up to 2L.', calc: [`"${out}"`] });
    },
  },

  hindex: {
    code: [['cap', 'bucket[min(c, n)]++ for each paper;        // a count above n counts as n'], ['walk', 'for h = n down to 0: papers += bucket[h];'], ['ret', '    if (papers >= h) return h;']],
    fields: [{ name: 'c', label: 'citations', type: 'ints', placeholder: '3, 0, 6, 1, 5', maxLen: 8, min: 0, max: 20 }],
    random: (g) => ({ c: Array.from({ length: g.int(1, 7) }, () => g.int(0, 9)) }),
    brute: ({ c }) => { for (let h = c.length; h >= 0; h--) if (c.filter((x) => x >= h).length >= h) return h; return 0; },
    describe: ({ c }) => `citations = ${list(c)}`,
    rule: 'the largest h with at least h papers cited at least h times',
    run({ c }, snap) {
      const n = c.length, bucket = Array(n + 1).fill(0);
      c.forEach((x) => bucket[Math.min(x, n)]++);
      const view = (h, papers) => [strip('papers per level', bucket, { index: bucket.map((_, k) => (k === n ? `${n}+` : String(k))), cls: h >= 0 ? Object.fromEntries(bucket.map((_, k) => [k, k >= h ? 'kept' : ''])) : {}, tags: h >= 0 ? { [h]: [[`h=${h}`, 'accent']] } : {} }), ...(papers !== undefined ? [P.chips('', [{ key: 'p', text: `papers with ≥ ${h}: ${papers}`, tone: papers >= h ? 'success' : 'warn' }])] : [])];
      snap({ kind: 'start', lines: ['cap'], parts: view(-1), title: 'Count papers per citation level', text: `h can't exceed n = ${n} (there are only ${n} papers), so any count above ${n} is filed under ${n}. Only how many papers reach each level matters, not which paper is which.`, calc: [`levels 0 … ${n}`] });
      let papers = 0;
      for (let h = n; h >= 0; h--) {
        papers += bucket[h];
        if (papers >= h) { snap({ kind: 'found', lines: ['walk', 'ret'], parts: view(h, papers), out: h, answer: String(h), title: `h = ${h}: ${papers} papers have ≥ ${h} citations ✓`, text: `Walking down from ${n}, this is the first level where enough papers reach it. Every higher h failed, so ${h} is the largest that works. O(n) with no sort.`, calc: [`${papers} ≥ ${h}`] }); return; }
        snap({ kind: 'look', lines: ['walk'], parts: view(h, papers), title: `h = ${h}: only ${papers} paper${papers === 1 ? '' : 's'} with ≥ ${h}`, text: `${papers} < ${h}: not enough papers reach ${h} citations. Try one level lower, which also counts everything above it.`, calc: [`${papers} < ${h}`] });
      }
    },
  },

  chars: {
    code: [['count', 'count each character;'], ['bucket', 'bucket[count] gets the characters with that count;'], ['write', 'for count = n down to 1: write each character in bucket[count], count times'], ['ret', 'return the result;']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'tree', re: /^[A-Za-z0-9]{1,12}$/, msg: 's: up to 12 letters or digits.' }],
    random: (g) => ({ s: Array.from({ length: g.int(1, 10) }, () => g.pick(['a', 'b', 'c', 'A', 'e'])).join('') }),
    brute: ({ s }) => s,
    check: ({ s }, out) => { if (out.length !== s.length || [...out].sort().join('') !== [...s].sort().join('')) return false; const c = countMap([...s]); for (let i = 1; i < out.length; i++) if (out[i] !== out[i - 1] && (c.get(out[i]) > c.get(out[i - 1]) || out.slice(0, i).includes(out[i]))) return false; return true; },
    describe: ({ s }) => `s = "${s}"`,
    rule: 'most frequent first, copies together',
    run({ s }, snap) {
      const c = countMap([...s]), n = s.length;
      const buckets = Array.from({ length: n + 1 }, () => []);
      for (const [ch, k] of c) buckets[k].push(ch);
      snap({ kind: 'start', lines: ['count'], parts: [strip('s', [...s], { index: false }), mapChips('counts', c)], title: 'Count every character', text: 'Upper and lower case count separately. The output writes the most frequent character first, all its copies together.', calc: [`${plural(c.size, 'character')}`] });
      snap({ kind: 'add', lines: ['bucket'], parts: [P.chips('buckets by count', buckets.map((b, k) => [b, k]).filter(([b]) => b.length).reverse().map(([b, k]) => ({ key: String(k), text: `${k}: ${b.join(' ')}` })))], title: 'Drop each character into the bucket for its count', text: `A count is between 1 and n = ${n}, so an array of buckets indexed by count orders them without any sort.`, calc: [`${n + 1} buckets`] });
      let out = '';
      for (let k = n; k >= 1; k--) for (const ch of buckets[k]) { out += ch.repeat(k); snap({ kind: 'add', lines: ['write'], parts: [strip('result so far', [...out], { index: false, cls: Object.fromEntries([...out].map((_, i) => [i, i >= out.length - k ? 'hit' : 'kept'])) })], title: `Write '${ch}' × ${k}`, text: `${buckets[k].length > 1 ? `'${ch}' shares count ${k} with ${buckets[k].filter((x) => x !== ch).map((x) => `'${x}'`).join(', ')}; either order is accepted.` : `Bucket ${k} holds only '${ch}'.`}`, calc: [`"${out}"`] }); }
      snap({ kind: 'done', lines: ['ret'], parts: [strip('result', [...out], { index: false })], out, answer: `"${out}"`, title: `Answer: "${out}"`, text: 'Counting and bucketing are both O(n): no comparison sort needed.', calc: [`"${out}"`] });
    },
  },

  gap: {
    code: [['width', 'lo = min, hi = max;  width = max(1, (hi − lo) / (n − 1));     // ≤ the average gap'], ['drop', 'bucket b = (x − lo) / width keeps only its min and max;'], ['scan', 'answer = max over neighbouring non-empty buckets of (next.min − prev.max);'], ['ret', 'return answer;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '3, 6, 9, 1', maxLen: 9, min: 0, max: 60 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 8) }, () => g.int(0, 40)) }),
    brute: ({ nums }) => { const s = [...nums].sort((a, b) => a - b); let best = 0; for (let i = 1; i < s.length; i++) best = Math.max(best, s[i] - s[i - 1]); return best; },
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'the largest gap never sits inside a bucket',
    run({ nums }, snap) {
      const n = nums.length;
      if (n < 2) { snap({ kind: 'start', lines: ['width'], parts: [strip('nums', nums)], title: 'Fewer than two numbers', text: 'There is no pair of neighbours at all, so there is no gap to measure.', calc: [`n = ${n}`] }); snap({ kind: 'done', lines: ['ret'], parts: [strip('nums', nums)], out: 0, answer: '0', title: 'Answer: 0', text: 'The problem defines the answer as 0 when there are fewer than two elements.', calc: ['0'] }); return; }
      const lo = Math.min(...nums), hi = Math.max(...nums);
      if (lo === hi) { snap({ kind: 'start', lines: ['width'], parts: [strip('nums', nums)], title: 'All values are equal', text: `Every value is ${lo}, so sorted neighbours are all equal and every gap is 0.`, calc: [`min = max = ${lo}`] }); snap({ kind: 'done', lines: ['ret'], parts: [strip('nums', nums)], out: 0, answer: '0', title: 'Answer: 0', text: 'Every gap is 0, so no bucketing is needed.', calc: ['0'] }); return; }
      const width = Math.max(1, Math.floor((hi - lo) / (n - 1)));
      const B = Math.floor((hi - lo) / width) + 1;
      const mn = Array(B).fill(null), mx = Array(B).fill(null);
      snap({ kind: 'start', lines: ['width'], parts: [strip('nums', nums)], title: `min ${lo}, max ${hi}: bucket width ${width}`, text: `${n} numbers span ${hi - lo}, so their ${n - 1} gaps add up to ${hi - lo} and the largest is at least ${hi - lo} / ${n - 1}. Buckets no wider than that can't hold the largest gap inside them, so each bucket only needs its min and max.`, calc: [`width = ${width}`, `${B} buckets`] });
      for (const x of nums) { const b = Math.floor((x - lo) / width); mn[b] = mn[b] === null ? x : Math.min(mn[b], x); mx[b] = mx[b] === null ? x : Math.max(mx[b], x); }
      const label = (b) => (mn[b] === null ? '—' : mn[b] === mx[b] ? String(mn[b]) : `${mn[b]}–${mx[b]}`);
      const row = (cls) => strip('buckets (min–max)', Array.from({ length: B }, (_, b) => label(b)), { index: Array.from({ length: B }, (_, b) => `${lo + b * width}+`), cls });
      snap({ kind: 'add', lines: ['drop'], parts: [row(Object.fromEntries(Array.from({ length: B }, (_, b) => [b, mn[b] === null ? 'muted' : ''])))], title: 'Drop every value into its bucket', text: `Bucket (x − ${lo}) / ${width}. Values inside one bucket are closer than the answer, so only each bucket's smallest and largest value are kept.`, calc: [`${mn.filter((v) => v !== null).length} non-empty`] });
      let best = 0, prev = null;
      for (let b = 0; b < B; b++) {
        if (mn[b] === null) continue;
        if (prev !== null) { const g = mn[b] - mx[prev]; const better = g > best; if (better) best = g; snap({ kind: better ? 'found' : 'look', lines: ['scan'], parts: [row({ [prev]: 'note', [b]: 'cur' })], title: `${mn[b]} − ${mx[prev]} = ${g}${better ? ': new best' : ''}`, text: `The gap between neighbouring non-empty buckets: this bucket's min minus the previous bucket's max${better ? '' : `, not more than ${best}`}.`, calc: [`best = ${best}`] }); }
        prev = b;
      }
      snap({ kind: 'done', lines: ['ret'], parts: [row({})], out: best, answer: String(best), title: `Answer: ${best}`, text: 'O(n) time and O(n) buckets, with no comparison sort.', calc: [`best = ${best}`] });
    },
  },
};

const EXAMPLES = {
  freq: { label: '[1, 1, 2, 2, 2, 3]', input: { mode: 'freq', nums: [1, 1, 2, 2, 2, 3] } },
  freqTie: { label: '[2, 3, 1, 3, 2]', input: { mode: 'freq', nums: [2, 3, 1, 3, 2] } },
  largest: { label: '[3, 30, 34, 5, 9]', input: { mode: 'largest', nums: [3, 30, 34, 5, 9] } },
  largestZero: { label: '[0, 0]', input: { mode: 'largest', nums: [0, 0] } },
  hindex: { label: '[3, 0, 6, 1, 5]', input: { mode: 'hindex', c: [3, 0, 6, 1, 5] } },
  chars: { label: '"tree"', input: { mode: 'chars', s: 'tree' } },
  chars2: { label: '"Aabb"', input: { mode: 'chars', s: 'Aabb' } },
  gap: { label: '[3, 6, 9, 1]', input: { mode: 'gap', nums: [3, 6, 9, 1] } },
  gap2: { label: '[1, 10, 5, 22, 3]', input: { mode: 'gap', nums: [1, 10, 5, 22, 3] } },
};

export const sortWalk = makeWalk(MODES, EXAMPLES);
