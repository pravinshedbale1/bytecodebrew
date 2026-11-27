/**
 * <CycleWalkViz>: Cyclic Sort walkthroughs built on loops of "where does this go" (Practice thinking).
 *   nesting   array nesting: follow i → nums[i]; each loop walked once
 *   levels    minimum swaps to sort each tree level: length − loops, level by level
 *   couples   couples holding hands: bring each partner (x ^ 1) next to the left person
 */
import { list, plural } from './util.js';
import { P, strip, makeWalk } from './walkKit.js';

const parseLevels = (s) => s.split('|').map((g) => g.split(/[\s,]+/).filter(Boolean).map(Number));
const minSwaps = (a) => { const target = [...a].sort((x, y) => x - y); const pos = new Map(target.map((v, k) => [v, k])); const seen = Array(a.length).fill(false); let loops = 0; for (let i = 0; i < a.length; i++) { if (seen[i]) continue; loops++; let j = i; while (!seen[j]) { seen[j] = true; j = pos.get(a[j]); } } return a.length - loops; };

const MODES = {
  nesting: {
    code: [['loop', 'for (int i = 0; i < n; i++) {  if (seen[i]) continue;'], ['walk', '    int len = 0, j = i;  while (!seen[j]) { seen[j] = true; j = nums[j]; len++; }'], ['best', '    best = max(best, len); }'], ['ret', 'return best;']],
    fields: [{ name: 'nums', label: 'nums (a permutation of 0 … n − 1)', type: 'ints', placeholder: '5, 4, 0, 3, 1, 6, 2', maxLen: 9, min: 0, max: 8 }],
    valid: ({ nums }) => ([...nums].sort((a, b) => a - b).some((v, k) => v !== k) ? 'nums must hold each of 0 … n − 1 exactly once.' : ''),
    random: (g) => ({ nums: g.shuffle(Array.from({ length: g.int(1, 8) }, (_, k) => k)) }),
    brute: ({ nums }) => Math.max(...nums.map((_, s) => { const seen = new Set(); let j = s; while (!seen.has(j)) { seen.add(j); j = nums[j]; } return seen.size; })),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'a permutation is separate loops: walk each once',
    run({ nums }, snap) {
      const seen = Array(nums.length).fill(false);
      let best = 0;
      const loopOf = {};
      const view = (cur = []) => [strip('nums', nums, { cls: Object.fromEntries(nums.map((_, k) => [k, cur.includes(k) ? 'hit' : seen[k] ? 'dim' : ''])), sub: loopOf })];
      snap({ kind: 'start', lines: ['loop'], parts: view(), title: 'Every index has one arrow out and one in', text: 'Index k points to nums[k]. In a permutation each index is pointed to exactly once, so the arrows form separate loops, and the set built from any start is its whole loop. Measure each loop once and mark its indexes so they are never walked again.', calc: [`n = ${nums.length}`] });
      let id = 0;
      for (let i = 0; i < nums.length; i++) {
        if (seen[i]) continue;
        const path = [];
        let j = i;
        while (!seen[j]) { seen[j] = true; path.push(j); j = nums[j]; }
        id++;
        path.forEach((k) => { loopOf[k] = `loop ${id}`; });
        const better = path.length > best;
        best = Math.max(best, path.length);
        snap({ kind: better ? 'found' : 'look', lines: ['walk', 'best'], parts: view(path), title: `From ${i}: ${[...path, i].join(' → ')} (${path.length})`, text: `Following nums[k] from ${i} comes back to ${i} after ${plural(path.length, 'step')}. ${better ? `New longest: ${best}.` : `Not longer than ${best}.`} These indexes are marked and skipped from now on.`, calc: [`best = ${best}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(), out: best, answer: String(best), title: `Longest loop: ${best}`, text: `${plural(id, 'loop')} in all. Every index was visited exactly once: O(n) time (marking can reuse the array for O(1) memory).`, calc: [`best = ${best}`] });
    },
  },

  levels: {
    hint: 'The tree\'s levels, separated by "|", like: 1 | 4, 3 | 7, 6, 8, 5 | 9, 10 (distinct values).',
    code: [['bfs', 'collect the tree level by level (BFS);'], ['target', 'for each level: target index of each value = its index in the sorted level'], ['loops', '    swaps += length − (number of loops in "value → target index")'], ['ret', 'return swaps;']],
    fields: [{ name: 's', label: 'levels', type: 'str', placeholder: '1 | 4, 3 | 7, 6, 8, 5 | 9, 10', re: /^[0-9][0-9 ,|]{0,60}$/, msg: 'levels: numbers separated by commas, levels separated by "|".' }],
    valid: ({ s }) => { const lv = parseLevels(s); if (lv.some((l) => !l.length) || lv.length > 4) return 'levels: 1 to 4 non-empty levels.'; if (lv.some((l, k) => l.length > 2 ** k)) return 'level k can hold at most 2^k values.'; const all = lv.flat(); if (new Set(all).size !== all.length) return 'all values must be distinct.'; if (s !== lv.map((l) => l.join(', ')).join(' | ')) return 'write levels like: 1 | 4, 3 | 7, 6'; return ''; },
    random: (g) => { const vals = g.shuffle(Array.from({ length: 30 }, (_, k) => k + 1)); let p = 0; const lv = []; for (let k = 0; k < g.int(1, 4); k++) { const len = g.int(1, 2 ** k); lv.push(vals.slice(p, p + len)); p += len; } return { s: lv.map((l) => l.join(', ')).join(' | ') }; },
    brute: ({ s }) => parseLevels(s).reduce((t, l) => t + minSwaps(l), 0),
    describe: ({ s }) => `levels ${s}`,
    rule: 'fewest swaps to sort = length − loops',
    run({ s }, snap) {
      const lv = parseLevels(s);
      snap({ kind: 'start', lines: ['bfs'], parts: lv.map((l, k) => strip(`level ${k}`, l, { index: false })), title: `${plural(lv.length, 'level')} to sort separately`, text: 'Swaps only happen within a level, so each level is its own problem and the answers add up. For a list of distinct values, each value has exactly one target position (its index once sorted).', calc: [`${plural(lv.length, 'level')}`] });
      let total = 0;
      lv.forEach((a, k) => {
        const sorted = [...a].sort((x, y) => x - y), pos = new Map(sorted.map((v, i) => [v, i]));
        const seen = Array(a.length).fill(false), loops = [];
        for (let i = 0; i < a.length; i++) { if (seen[i]) continue; const loop = []; let j = i; while (!seen[j]) { seen[j] = true; loop.push(a[j]); j = pos.get(a[j]); } loops.push(loop); }
        const sw = a.length - loops.length;
        total += sw;
        snap({ kind: sw ? 'swap' : 'keep', lines: ['target', 'loops'], parts: [strip(`level ${k}`, a, { index: false, sub: Object.fromEntries(a.map((v, i) => [i, `→ ${pos.get(v)}`])), cls: Object.fromEntries(a.map((v, i) => [i, pos.get(v) === i ? 'kept' : 'cur'])) }), P.chips('loops', loops.map((l, i) => ({ key: String(i), text: l.length === 1 ? `${l[0]} (home)` : l.join(' → '), tone: l.length > 1 ? 'warn' : 'success' })))], title: `Level ${k}: ${a.length} − ${loops.length} = ${plural(sw, 'swap')}`, text: sw ? `Following "this value belongs where?" splits the level into loops. A loop of m values needs m − 1 swaps (each swap sends one value home and the last one lands for free), and no plan can do with fewer.` : 'Every value is already in its sorted position: no swaps.', calc: [`total = ${total}`] });
      });
      snap({ kind: 'done', lines: ['ret'], parts: [P.chips('', [{ key: 't', text: `total swaps: ${total}`, tone: 'success' }])], out: total, answer: String(total), title: `Answer: ${total}`, text: 'O(n log n): each level is sorted once to find targets, and the loops are walked in linear time.', calc: [`${total}`] });
    },
  },

  couples: {
    code: [['pos', 'pos[person] = seat;'], ['pair', 'for (int i = 0; i < n; i += 2) {  int want = row[i] ^ 1;           // the partner'], ['swap', '    if (row[i + 1] != want) { swap row[i + 1] with the seat of want;  swaps++; } }'], ['ret', 'return swaps;']],
    fields: [{ name: 'row', label: 'row', type: 'ints', placeholder: '0, 2, 1, 3', minLen: 2, maxLen: 10, min: 0, max: 9 }],
    valid: ({ row }) => (row.length % 2 ? 'an even number of people.' : [...row].sort((a, b) => a - b).some((v, k) => v !== k) ? 'row must hold each of 0 … 2n − 1 once.' : ''),
    random: (g) => ({ row: g.shuffle(Array.from({ length: 2 * g.int(1, 5) }, (_, k) => k)) }),
    brute: ({ row }) => { const n = row.length / 2, par = Array.from({ length: n }, (_, k) => k), find = (x) => (par[x] === x ? x : (par[x] = find(par[x]))); let groups = n; for (let i = 0; i < row.length; i += 2) { const a = find(row[i] >> 1), b = find(row[i + 1] >> 1); if (a !== b) { par[a] = b; groups--; } } return n - groups; },
    describe: ({ row }) => `row = ${list(row)}`,
    rule: 'keep the left person, bring their partner (x ^ 1)',
    run({ row }, snap) {
      const r = [...row], pos = [];
      r.forEach((p, k) => { pos[p] = k; });
      let swaps = 0;
      const view = (i, cls = {}) => [strip('seats', r, { bands: Array.from({ length: r.length / 2 }, (_, k) => ({ from: 2 * k, to: 2 * k + 1, tone: (r[2 * k] ^ 1) === r[2 * k + 1] ? 'success' : 'ghost', label: `pair ${k}` })), cls: { ...(i >= 0 ? { [i]: 'cur' } : {}), ...cls } })];
      snap({ kind: 'start', lines: ['pos'], parts: view(-1), title: 'Partners differ only in the last bit', text: 'The couples are (0, 1), (2, 3), …, so the partner of x is x ^ 1. Fix the seat pairs from the left: keep whoever sits on the left and swap their partner into the right seat. Each swap seats at least one couple, and no plan can use fewer.', calc: [`${r.length / 2} couples`] });
      for (let i = 0; i < r.length; i += 2) {
        const want = r[i] ^ 1;
        if (r[i + 1] === want) { snap({ kind: 'keep', lines: ['pair'], parts: view(i, { [i + 1]: 'hit' }), title: `Pair ${i / 2}: ${r[i]} and ${want} already together`, text: `${r[i]}'s partner is ${r[i]} ^ 1 = ${want}, already in seat ${i + 1}.`, calc: [`swaps = ${swaps}`] }); continue; }
        const j = pos[want], other = r[i + 1];
        [r[i + 1], r[j]] = [r[j], r[i + 1]];
        pos[other] = j; pos[want] = i + 1;
        swaps++;
        snap({ kind: 'swap', lines: ['pair', 'swap'], parts: view(i, { [i + 1]: 'hit', [j]: 'note' }), title: `Pair ${i / 2}: swap ${other} (seat ${i + 1}) with ${want} (seat ${j})`, text: `${r[i]}'s partner is ${want}, sitting in seat ${j}. Swap ${want} into seat ${i + 1}; ${other} moves to seat ${j}. Pair ${i / 2} is done for good.`, calc: [`swaps = ${swaps}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: swaps, answer: String(swaps), title: `${plural(swaps, 'swap')}`, text: 'O(n) with the seat index. The count equals couples − loops of tangled seat pairs, which is the minimum.', calc: [`swaps = ${swaps}`] });
    },
  },
};

const EXAMPLES = {
  nesting: { label: '[5, 4, 0, 3, 1, 6, 2]', input: { mode: 'nesting', nums: [5, 4, 0, 3, 1, 6, 2] } },
  levels: { label: 'the example tree', input: { mode: 'levels', s: '1 | 4, 3 | 7, 6, 8, 5 | 9, 10' } },
  couples: { label: '[0, 2, 1, 3]', input: { mode: 'couples', row: [0, 2, 1, 3] } },
  couples3: { label: '[0, 2, 4, 1, 3, 5]', input: { mode: 'couples', row: [0, 2, 4, 1, 3, 5] } },
};

export const cycleWalk = makeWalk(MODES, EXAMPLES);
