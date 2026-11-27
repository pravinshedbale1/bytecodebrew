/**
 * <HashWalkViz>: Hashing walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   dup       contains duplicate: a set of values seen so far
 *   anagram   valid anagram: count up for s, down for t
 *   unique    first unique character: count, then a second pass in string order
 *   group     group anagrams: sorted letters as the map key
 *   sudoku    valid sudoku (on a 4 × 4 board): a set per row, column and box
 *   concat    concatenation of array: write each value twice
 *   majority  majority element: Boyer–Moore voting
 *   codec     encode and decode strings: length + "#" + text
 *   majority2 majority element II: two candidates, then a verifying count
 *   alien     verifying an alien dictionary: rank table, neighbours compared
 */
import { list, plural } from './util.js';
import { P, strip, mapChips, makeWalk, show } from './walkKit.js';

const counts = (s) => { const m = new Map(); for (const c of s) m.set(c, (m.get(c) ?? 0) + 1); return m; };

const MODES = {
  dup: {
    code: [['loop', 'for (int x : nums) {'], ['has', '    if (seen.contains(x)) return true;   // met before'], ['add', '    seen.add(x);'], ['end', '}  return false;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 3, 1', maxLen: 10 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 8) }, () => g.int(1, 9)) }),
    brute: ({ nums }) => nums.some((x, i) => nums.indexOf(x) !== i),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'a value already in the set is a duplicate',
    run({ nums }, snap) {
      const seen = new Set();
      const view = (i, hit) => [strip('nums', nums, { cls: Object.fromEntries(nums.map((_, k) => [k, k === i ? (hit ? 'bad' : 'cur') : k < i ? 'dim' : ''])) }), P.chips('seen', [...seen].map((v) => ({ key: String(v), text: String(v), tone: hit && v === nums[i] ? 'danger' : undefined })), 'empty')];
      snap({ kind: 'start', lines: ['loop'], parts: view(-1), title: 'Walk once, remembering every value', text: 'A set answers "have I seen x?" in one step. The first value that is already in the set has a twin earlier on, so we can stop there.', calc: [`${nums.length} values`] });
      for (let i = 0; i < nums.length; i++) {
        const x = nums[i];
        if (seen.has(x)) { snap({ kind: 'found', lines: ['has'], parts: view(i, true), out: true, answer: 'true', title: `Index ${i}: ${x} is already in the set → true`, text: `${x} was added at index ${nums.indexOf(x)}, so it appears at least twice. No need to look at the rest.`, calc: [`seen has ${x}`] }); return; }
        seen.add(x);
        snap({ kind: 'add', lines: ['has', 'add'], parts: view(i, false), title: `Index ${i}: ${x} is new`, text: `${x} isn't in the set yet: add it. Checking and adding are both O(1) on average.`, calc: [`seen = {${[...seen].join(', ')}}`] });
      }
      snap({ kind: 'done', lines: ['end'], parts: view(nums.length), out: false, answer: 'false', title: 'Every value was new → false', text: `All ${nums.length} values went into the set without a repeat. One pass, O(n) time and O(n) memory.`, calc: ['no duplicate'] });
    },
  },

  anagram: {
    code: [['len', 'if (s.length() != t.length()) return false;'], ['up', 'for (char c : s) count[c - \'a\']++;'], ['down', 'for (char c : t) if (--count[c - \'a\'] < 0) return false;'], ['ok', 'return true;   // every count is back to 0']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'anagram', short: true }, { name: 't', label: 't', type: 'str', placeholder: 'nagaram', short: true }],
    random: (g) => { const s = Array.from({ length: g.int(1, 7) }, () => g.pick(['a', 'b', 'c', 'n'])).join(''); const t = g.bool(0.6) ? g.shuffle([...s]).join('') : Array.from({ length: g.int(1, 7) }, () => g.pick(['a', 'b', 'c', 'n'])).join(''); return { s, t }; },
    brute: ({ s, t }) => [...s].sort().join('') === [...t].sort().join(''),
    describe: ({ s, t }) => `s = "${s}", t = "${t}"`,
    rule: 'same letters, same counts',
    run({ s, t }, snap) {
      const view = (m, hi) => [strip('s', [...s], { index: false }), strip('t', [...t], { index: false, cls: hi !== undefined ? { [hi]: 'cur' } : {} }), mapChips('count', new Map([...m.entries()].sort()), { empty: 'all zero', tone: Object.fromEntries([...m.entries()].map(([k, v]) => [k, v < 0 ? 'danger' : v === 0 ? 'success' : undefined])) })];
      if (s.length !== t.length) { snap({ kind: 'start', lines: ['len'], parts: view(new Map()), title: 'Compare the lengths first', text: 'An anagram rearranges every letter of s exactly once, so before counting anything, check that both strings have the same length.', calc: [`|s| = ${s.length}, |t| = ${t.length}`] }); snap({ kind: 'fail', lines: ['len'], parts: view(new Map()), out: false, answer: 'false', title: `Lengths differ (${s.length} vs ${t.length}) → false`, text: 'An anagram uses every letter exactly once, so both strings must be the same length. Nothing else needs checking.', calc: [`${s.length} ≠ ${t.length}`] }); return; }
      snap({ kind: 'start', lines: ['len'], parts: view(new Map()), title: `Lengths match (${s.length})`, text: 'Same length, so it comes down to the letters: count each letter of s up, then each letter of t down. Anagrams leave every count at 0.', calc: [`${s.length} = ${t.length}`] });
      const m = counts(s);
      snap({ kind: 'add', lines: ['up'], parts: view(m), title: `Count up for "${s}"`, text: `Each letter of s adds 1 to its count: ${[...m.entries()].sort().map(([k, v]) => `${k} ${v}`).join(', ')}. A 26-slot array or a map both work.`, calc: [`${m.size} different letters`] });
      for (let i = 0; i < t.length; i++) {
        const c = t[i];
        m.set(c, (m.get(c) ?? 0) - 1);
        if (m.get(c) < 0) { snap({ kind: 'fail', lines: ['down'], parts: view(m, i), out: false, answer: 'false', title: `'${c}' goes below 0 → false`, text: `t uses more '${c}'s than s has. Since the lengths are equal, some other letter must be short too: not an anagram.`, calc: [`count[${c}] = ${m.get(c)}`] }); return; }
        if (i === t.length - 1 || i % 2 === 1) snap({ kind: 'look', lines: ['down'], parts: view(m, i), title: `Count down '${c}' (index ${i})`, text: `Each letter of t removes 1. '${c}' still has ${m.get(c)} left over from s, so nothing has gone wrong yet.`, calc: [`count[${c}] = ${m.get(c)}`] });
      }
      snap({ kind: 'done', lines: ['ok'], parts: view(m), out: true, answer: 'true', title: 'Every count is back to 0 → true', text: 'No count ever went negative and the lengths are equal, so every count ends at exactly 0: same letters, same numbers of each. O(n) time, O(1) space for a 26-letter alphabet.', calc: ['all zero'] });
    },
  },

  unique: {
    code: [['count', 'for (char c : s) count[c]++;              // pass 1'], ['scan', 'for (int i = 0; i < n; i++)               // pass 2, in string order'], ['hit', '    if (count[s.charAt(i)] == 1) return i;'], ['none', 'return -1;']],
    fields: [{ name: 's', label: 's', type: 'str', placeholder: 'loveleetcode', re: /^[a-z]{1,12}$/, msg: 's: up to 12 lower-case letters.' }],
    random: (g) => ({ s: Array.from({ length: g.int(1, 10) }, () => g.pick(['a', 'b', 'c', 'd', 'e'])).join('') }),
    brute: ({ s }) => [...s].findIndex((c) => s.indexOf(c) === s.lastIndexOf(c)),
    describe: ({ s }) => `s = "${s}"`,
    rule: 'count first, then the first letter with count 1',
    run({ s }, snap) {
      const m = counts(s);
      const chips = (hi) => mapChips('count', m, { tone: Object.fromEntries([...m.keys()].map((k) => [k, k === hi ? (m.get(k) === 1 ? 'success' : 'danger') : m.get(k) === 1 ? 'note' : undefined])) });
      snap({ kind: 'start', lines: ['count'], parts: [strip('s', [...s]), chips()], title: 'Pass 1: count every letter', text: `Whether a letter is unique depends on the whole string, so count first: ${[...m.entries()].map(([k, v]) => `${k} ${v}`).join(', ')}. Only now do we know which letters appear once.`, calc: [`${m.size} different letters`] });
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (m.get(c) === 1) { snap({ kind: 'found', lines: ['scan', 'hit'], parts: [strip('s', [...s], { cls: Object.fromEntries([...s].map((_, k) => [k, k === i ? 'hit' : k < i ? 'dim' : ''])) }), chips(c)], out: i, answer: String(i), title: `Index ${i} is '${c}', count 1 → ${i}`, text: `'${c}' appears only once, and every earlier letter repeats, so this is the first unique letter. Later unique letters don't matter: we want the first in string order.`, calc: [`count[${c}] = 1`] }); return; }
        snap({ kind: 'skip', lines: ['scan', 'hit'], parts: [strip('s', [...s], { cls: Object.fromEntries([...s].map((_, k) => [k, k === i ? 'bad' : k < i ? 'dim' : ''])) }), chips(c)], title: `Index ${i}: '${c}' repeats`, text: `'${c}' appears ${m.get(c)} times in total, so it can't be the answer even though this may be its first appearance.`, calc: [`count[${c}] = ${m.get(c)}`] });
      }
      snap({ kind: 'done', lines: ['none'], parts: [strip('s', [...s], { cls: Object.fromEntries([...s].map((_, k) => [k, 'dim'])) }), chips()], out: -1, answer: '-1', title: 'Every letter repeats → −1', text: 'The second pass found no letter with count 1. Two passes, O(n) time, and 26 counters.', calc: ['none'] });
    },
  },

  group: {
    code: [['key', 'for (String w : strs) {  key = sort(w)            // anagrams share it'], ['put', '    map.computeIfAbsent(key, k -> new ArrayList<>()).add(w);'], ['ret', '}  return new ArrayList<>(map.values());']],
    fields: [{ name: 'strs', label: 'words', type: 'words', placeholder: 'eat, tea, tan, ate, nat, bat', maxLen: 7, re: /^[a-z]{1,5}$/, msg: 'words: 1 to 7 words of 1 to 5 letters.' }],
    random: (g) => { const base = Array.from({ length: g.int(1, 3) }, () => Array.from({ length: g.int(1, 3) }, () => g.pick(['a', 'b', 'c', 't'])).join('')); return { strs: Array.from({ length: g.int(1, 6) }, () => g.shuffle([...g.pick(base)]).join('')) }; },
    brute: ({ strs }) => { const m = new Map(); for (const w of strs) { const k = [...w].sort().join(''); m.set(k, [...(m.get(k) ?? []), w]); } return [...m.values()]; },
    check: (input, out) => { const norm = (g) => g.map((x) => [...x].sort()).map((x) => x.join('|')).sort(); return JSON.stringify(norm(out)) === JSON.stringify(norm(MODES.group.brute(input))); },
    describe: ({ strs }) => `strs = ${show(strs)}`,
    rule: 'sorted letters are the key',
    run({ strs }, snap) {
      const m = new Map();
      const view = (i, key) => [strip('words', strs, { index: false, cls: Object.fromEntries(strs.map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), mapChips('groups', m, { fmt: (k, v) => `${k}: ${v.join(', ')}`, tone: { [key]: 'accent' } })];
      snap({ kind: 'start', lines: ['key'], parts: view(-1), title: 'Give every word a key its anagrams share', text: 'Anagrams have the same letters, so sorting the letters gives them the same key ("eat", "tea" and "ate" all become "aet"). A map from key to words then collects each group.', calc: [`${strs.length} words`] });
      strs.forEach((w, i) => {
        const key = [...w].sort().join('');
        const isNew = !m.has(key);
        m.set(key, [...(m.get(key) ?? []), w]);
        snap({ kind: isNew ? 'add' : 'keep', lines: ['key', 'put'], parts: view(i, key), title: `"${w}" → key "${key}"${isNew ? ': a new group' : ''}`, text: isNew ? `No earlier word had the letters ${[...key].join(', ')}: start a new group for "${key}".` : `"${key}" is already a key, so "${w}" joins ${m.get(key).slice(0, -1).map((x) => `"${x}"`).join(', ')}.`, calc: [`${plural(m.size, 'group')}`] });
      });
      const out = [...m.values()];
      snap({ kind: 'done', lines: ['ret'], parts: view(strs.length), out, answer: show(out), title: `${plural(out.length, 'group')}`, text: 'Each word was sorted once (k log k for k letters) and dropped into its group: O(n · k log k). Counting letters instead of sorting makes the key in O(k).', calc: [show(out)] });
    },
  },

  sudoku: {
    hint: 'A 4 × 4 board (2 × 2 boxes), digits 1 to 4 and 0 for an empty cell; rows separated by ";".',
    code: [['loop', 'for each filled cell (r, c) with digit d:'], ['box', '    b = (r / 2) * 2 + c / 2;            // which box (2 × 2 boxes here, 3 × 3 on the real board)'], ['clash', '    if (d in row[r] || d in col[c] || d in box[b]) return false;'], ['add', '    add d to row[r], col[c], box[b];'], ['ok', 'return true;']],
    fields: [{ name: 'board', label: 'board', type: 'matrix', placeholder: '1, 2, 0, 0; 3, 0, 0, 0; 0, 0, 0, 1; 0, 1, 0, 0', rows: [4, 4], cols: [4, 4], min: 0, max: 4 }],
    random: (g) => { const sol = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]]; const b = sol.map((r) => r.map((v) => (g.bool(0.45) ? v : 0))); if (g.bool(0.4)) { const r = g.int(0, 3), c = g.int(0, 3); b[r][c] = g.int(1, 4); } return { board: b }; },
    brute: ({ board }) => { const groups = []; for (let i = 0; i < 4; i++) { groups.push(board[i]); groups.push(board.map((r) => r[i])); const br = Math.floor(i / 2) * 2, bc = (i % 2) * 2; groups.push([board[br][bc], board[br][bc + 1], board[br + 1][bc], board[br + 1][bc + 1]]); } return groups.every((g) => { const d = g.filter(Boolean); return new Set(d).size === d.length; }); },
    describe: () => '4 × 4 board',
    rule: 'a digit may appear once per row, column and box',
    run({ board }, snap) {
      const row = Array.from({ length: 4 }, () => new Set()), col = Array.from({ length: 4 }, () => new Set()), box = Array.from({ length: 4 }, () => new Set());
      const cells = (cur, bad) => board.map((rw, r) => rw.map((v, c) => ({ l: v ? String(v) : '', c: [(Math.floor(r / 2) + Math.floor(c / 2)) % 2 ? 'land' : '', r === cur?.[0] && c === cur?.[1] ? (bad ? 'flipped' : 'cellCur') : '', bad && r === bad[0] && c === bad[1] ? 'flipped' : ''] })));
      const sets = (r, c, b) => [P.chips(`row ${r}`, [...row[r]].map((d) => ({ key: `r${d}`, text: String(d) })), '—'), P.chips(`col ${c}`, [...col[c]].map((d) => ({ key: `c${d}`, text: String(d) })), '—'), P.chips(`box ${b}`, [...box[b]].map((d) => ({ key: `b${d}`, text: String(d) })), '—')];
      snap({ kind: 'start', lines: ['loop'], parts: [P.grid('board (tinted = alternate 2 × 2 boxes)', cells())], title: 'One set per row, per column, per box', text: 'Only the filled cells matter, and none may repeat a digit in its row, its column or its box. Keep a set for each of those and check all three as each digit is visited. (The real board is 9 × 9 with 3 × 3 boxes; the rule is identical.)', calc: ['12 sets, all empty'] });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const d = board[r][c];
        if (!d) continue;
        const b = Math.floor(r / 2) * 2 + Math.floor(c / 2);
        const where = row[r].has(d) ? `row ${r}` : col[c].has(d) ? `column ${c}` : box[b].has(d) ? `box ${b}` : '';
        if (where) {
          let other = null;
          for (let rr = 0; rr < 4 && !other; rr++) for (let cc = 0; cc < 4 && !other; cc++) if ((rr < r || (rr === r && cc < c)) && board[rr][cc] === d && (rr === r || cc === c || Math.floor(rr / 2) * 2 + Math.floor(cc / 2) === b)) other = [rr, cc];
          snap({ kind: 'fail', lines: ['box', 'clash'], parts: [P.grid('board', cells([r, c], other)), ...sets(r, c, b)], out: false, answer: 'false', title: `(${r}, ${c}) = ${d}: already in ${where} → false`, text: `${d} was recorded earlier in ${where} (at (${other[0]}, ${other[1]})). A digit twice in one ${where.split(' ')[0]} breaks the rule: the board is invalid.`, calc: [`${d} ∈ ${where}`] });
          return;
        }
        row[r].add(d); col[c].add(d); box[b].add(d);
        snap({ kind: 'add', lines: ['box', 'clash', 'add'], parts: [P.grid('board', cells([r, c])), ...sets(r, c, b)], title: `(${r}, ${c}) = ${d}: new in row, column and box`, text: `Cell (${r}, ${c}) is in box (${r} / 2) · 2 + ${c} / 2 = ${b}. ${d} isn't in row ${r}, column ${c} or box ${b} yet, so record it in all three.`, calc: [`box ${b}`] });
      }
      snap({ kind: 'done', lines: ['ok'], parts: [P.grid('board', cells())], out: true, answer: 'true', title: 'No clash → true', text: 'Every filled cell was checked against its three sets and none repeated. Empty cells are never counted. Each cell costs O(1), so a fixed 9 × 9 board is O(81).', calc: ['valid'] });
    },
  },

  concat: {
    code: [['make', 'int[] ans = new int[2 * n];'], ['copy', 'for (int i = 0; i < n; i++) { ans[i] = nums[i]; ans[i + n] = nums[i]; }'], ['ret', 'return ans;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 2, 1', maxLen: 6 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 5) }, () => g.int(1, 9)) }),
    brute: ({ nums }) => [...nums, ...nums],
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'ans[i] = ans[i + n] = nums[i]',
    run({ nums }, snap) {
      const n = nums.length;
      const ans = Array(2 * n).fill('');
      const view = (i) => [strip('nums', nums, { cls: { [i]: 'cur' } }), strip('ans', ans, { cls: i >= 0 ? { [i]: 'hit', [i + n]: 'hit' } : {}, bands: [{ from: 0, to: n - 1, tone: 'ghost', label: 'first copy' }, { from: n, to: 2 * n - 1, tone: 'note', label: 'second copy' }] })];
      snap({ kind: 'start', lines: ['make'], parts: view(-1), title: `An answer of length ${2 * n}`, text: `The answer is nums followed by nums again. Position i of the first copy and position i + ${n} of the second both hold nums[i], so one loop fills both.`, calc: [`2n = ${2 * n}`] });
      for (let i = 0; i < n; i++) {
        ans[i] = ans[i + n] = nums[i];
        snap({ kind: 'add', lines: ['copy'], parts: view(i), title: `i = ${i}: write ${nums[i]} at ${i} and ${i + n}`, text: `ans[${i}] = ans[${i + n}] = nums[${i}] = ${nums[i]}. No search, no hashing: every position is known in advance.`, calc: [`ans[${i}] = ans[${i + n}] = ${nums[i]}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out: [...ans], answer: list(ans), title: `Done: ${list(ans)}`, text: 'One pass of n steps, two writes each: O(n) time, and the answer itself is the only extra memory.', calc: [list(ans)] });
    },
  },

  majority: {
    code: [['loop', 'for (int x : nums) {'], ['zero', '    if (count == 0) cand = x;            // nobody is ahead: x takes over'], ['vote', '    count += (x == cand) ? 1 : -1;        // a vote for, or one cancelled'], ['ret', '}  return cand;']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '2, 2, 1, 1, 1, 2, 2', maxLen: 10 }],
    valid: ({ nums }) => { const m = counts(nums); return [...m.values()].some((v) => v > nums.length / 2) ? '' : 'Some value must appear more than n / 2 times (the problem guarantees a majority).'; },
    random: (g) => { const n = g.int(1, 9), maj = g.int(1, 5); const a = Array.from({ length: n }, (_, k) => (k < Math.floor(n / 2) + 1 ? maj : g.int(1, 5))); return { nums: g.shuffle(a) }; },
    brute: ({ nums }) => [...counts(nums).entries()].find(([, v]) => v > nums.length / 2)[0],
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'pair off different values; the majority survives',
    run({ nums }, snap) {
      let cand = null, count = 0;
      const view = (i) => [strip('nums', nums, { cls: Object.fromEntries(nums.map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), P.chips('vote', [{ key: 'c', text: `candidate ${cand ?? '—'}`, tone: 'accent' }, { key: 'n', text: `count ${count}`, tone: count ? 'success' : 'muted' }])];
      snap({ kind: 'start', lines: ['loop'], parts: view(-1), title: 'Cancel different values in pairs', text: 'Pair each value with a different one and cross both out. The majority has more copies than everything else together, so some of its copies are left over. A candidate and a count do this pairing in one pass.', calc: [`n = ${nums.length}`] });
      nums.forEach((x, i) => {
        const took = count === 0;
        if (took) cand = x;
        count += x === cand ? 1 : -1;
        snap({ kind: took ? 'add' : x === cand ? 'keep' : 'shrink', lines: took ? ['zero', 'vote'] : ['vote'], parts: view(i), title: took ? `${x}: count was 0, ${x} takes over` : x === cand ? `${x}: a vote for ${cand}` : `${x}: cancels one vote for ${cand}`, text: took ? `Nobody was ahead, so ${x} becomes the candidate with count 1.` : x === cand ? `Another ${x}: count rises to ${count}.` : `${x} differs from ${cand}: the two cancel, count falls to ${count}.${count === 0 ? ' Everything so far has paired off.' : ''}`, calc: [`cand ${cand}, count ${count}`] });
      });
      snap({ kind: 'done', lines: ['ret'], parts: view(nums.length), out: cand, answer: String(cand), title: `The survivor: ${cand}`, text: `Every cancelled pair removed at most one copy of the majority and at least one other value, so the majority can't be cancelled out completely. O(n) time, O(1) memory, no map needed.`, calc: [`answer ${cand}`] });
    },
  },

  codec: {
    hint: 'Words of letters, digits or "#", separated by commas or spaces.',
    code: [['enc', 'encode: for each s: out += s.length() + "#" + s;'], ['len', 'decode: read digits up to "#": that is the length L'], ['take', '        take the next L characters as they are (they may contain "#")'], ['ret', 'until the end of the encoded string']],
    fields: [{ name: 'strs', label: 'strings', type: 'words', placeholder: 'neet, code, love, you', maxLen: 4, re: /^[a-z0-9#]{1,6}$/, msg: 'strings: 1 to 4 strings of 1 to 6 letters, digits or "#".' }],
    random: (g) => ({ strs: Array.from({ length: g.int(1, 4) }, () => Array.from({ length: g.int(1, 5) }, () => g.pick(['a', 'b', '#', '1', '2'])).join('')) }),
    brute: ({ strs }) => strs,
    describe: ({ strs }) => `strs = ${show(strs)}`,
    rule: 'a length prefix says exactly how much to read',
    run({ strs }, snap) {
      const enc = strs.map((s) => `${s.length}#${s}`).join('');
      snap({ kind: 'start', lines: ['enc'], parts: [P.chips('strings', strs.map((s, k) => ({ key: String(k), text: `"${s}"` })))], title: 'Write each string\'s length in front', text: 'Any separator character could also appear inside a string, so a separator alone is ambiguous. A length in front says exactly how many characters to take, whatever they are.', calc: [`${strs.length} strings`] });
      snap({ kind: 'add', lines: ['enc'], parts: [strip('encoded', [...enc], { index: false })], title: `Encoded: "${enc}"`, text: `Each string becomes length + "#" + text: ${strs.map((s) => `"${s.length}#${s}"`).join(', ')}, all joined.`, calc: [`${enc.length} characters`] });
      let i = 0;
      const out = [];
      while (i < enc.length) {
        let j = i;
        while (enc[j] !== '#') j++;
        const L = Number(enc.slice(i, j));
        const s = enc.slice(j + 1, j + 1 + L);
        out.push(s);
        snap({ kind: 'look', lines: ['len', 'take'], parts: [strip('encoded', [...enc], { index: false, bands: [{ from: i, to: j, tone: 'note', label: `length ${L}` }, { from: j + 1, to: j + L, tone: 'success', label: `"${s}"` }], cls: Object.fromEntries([...enc].map((_, k) => [k, k < i ? 'dim' : ''])) }), P.chips('decoded', out.map((x, k) => ({ key: String(k), text: `"${x}"`, tone: k === out.length - 1 ? 'success' : undefined })))], title: `Read ${L}, take "${s}"`, text: `Digits up to the first "#" give ${L}. The next ${L} characters are taken as they are${s.includes('#') ? ': the "#" inside is just data, because we never look for separators there' : ''}.`, calc: [`L = ${L}`] });
        i = j + 1 + L;
      }
      snap({ kind: 'done', lines: ['ret'], parts: [P.chips('decoded', out.map((x, k) => ({ key: String(k), text: `"${x}"`, tone: 'success' })))], out, answer: show(out), title: 'Every string comes back unchanged', text: 'Decoding always knows how far to read, so any characters, including "#" and digits, survive the round trip. O(total length) both ways.', calc: [show(out)] });
    },
  },

  majority2: {
    code: [['vote', 'two candidates with counts: a match adds a vote; an empty slot takes x; otherwise both counts drop'], ['verify', 'count the two survivors in a second pass'], ['ret', 'return those appearing more than n / 3 times']],
    fields: [{ name: 'nums', label: 'nums', type: 'ints', placeholder: '1, 1, 1, 3, 3, 2, 2, 2', maxLen: 10 }],
    random: (g) => ({ nums: Array.from({ length: g.int(1, 9) }, () => g.int(1, 4)) }),
    brute: ({ nums }) => [...counts(nums).entries()].filter(([, v]) => v > Math.floor(nums.length / 3)).map(([k]) => k).sort((a, b) => a - b),
    check: (input, out) => JSON.stringify([...out].sort((a, b) => a - b)) === JSON.stringify(MODES.majority2.brute(input)),
    describe: ({ nums }) => `nums = ${list(nums)}`,
    rule: 'at most two values can pass n / 3: vote for two, then verify',
    run({ nums }, snap) {
      let a = null, ca = 0, b = null, cb = 0;
      const view = (i) => [strip('nums', nums, { cls: Object.fromEntries(nums.map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), P.chips('candidates', [{ key: 'a', text: `${a ?? '—'} × ${ca}`, tone: ca ? 'accent' : 'muted' }, { key: 'b', text: `${b ?? '—'} × ${cb}`, tone: cb ? 'accent' : 'muted' }])];
      snap({ kind: 'start', lines: ['vote'], parts: view(-1), title: 'At most two values can appear more than n / 3 times', text: 'Three such values would need more than n copies in total. So keep two candidates, and cancel three different values at a time: any value above n / 3 survives the cancelling.', calc: [`n / 3 = ${Math.floor(nums.length / 3)}`] });
      nums.forEach((x, i) => {
        let what;
        if (x === a) { ca++; what = `a vote for ${a}`; } else if (x === b) { cb++; what = `a vote for ${b}`; } else if (ca === 0) { a = x; ca = 1; what = `${x} takes the empty first slot`; } else if (cb === 0) { b = x; cb = 1; what = `${x} takes the empty second slot`; } else { ca--; cb--; what = `${x} differs from both: one vote cancelled from each`; }
        snap({ kind: what.startsWith('a vote') ? 'keep' : what.includes('cancelled') ? 'shrink' : 'add', lines: ['vote'], parts: view(i), title: `${x}: ${what}`, text: what.includes('cancelled') ? `Three different values (${x}, ${a} and ${b}) are crossed out together. No value above n / 3 can lose all its copies this way.` : `Counts are now ${a ?? '—'} × ${ca} and ${b ?? '—'} × ${cb}.`, calc: [`${a ?? '—'}:${ca}  ${b ?? '—'}:${cb}`] });
      });
      const cand = [...new Set([a, b].filter((v) => v !== null))];
      const real = cand.map((v) => [v, nums.filter((x) => x === v).length]);
      const out = real.filter(([, c]) => c > Math.floor(nums.length / 3)).map(([v]) => v).sort((p, q) => p - q);
      snap({ kind: 'look', lines: ['verify'], parts: [strip('nums', nums), P.chips('real counts', real.map(([v, c]) => ({ key: String(v), text: `${v}: ${c}`, tone: c > Math.floor(nums.length / 3) ? 'success' : 'danger' })), 'no candidates')], title: 'Survivors are only possible answers: count them', text: `Voting can leave a candidate that doesn't really pass n / 3 (it was just never cancelled). A second pass counts each survivor: ${real.map(([v, c]) => `${v} appears ${c} times`).join(', ') || 'none'}; the bar is more than ${Math.floor(nums.length / 3)}.`, calc: real.length ? real.map(([v, c]) => `${v}: ${c}`) : ['none'] });
      snap({ kind: 'done', lines: ['ret'], parts: [P.chips('answer', out.map((v) => ({ key: String(v), text: String(v), tone: 'success' })), 'none')], out, answer: list(out), title: `Answer: ${list(out)}`, text: 'Two passes, O(n) time and O(1) memory: two candidates and two counts.', calc: [list(out)] });
    },
  },

  alien: {
    hint: 'Words, and an order string that contains every letter used, each once.',
    code: [['rank', 'rank[order.charAt(i)] = i;              // letter → position'], ['pair', 'for each neighbouring pair (a, b):'], ['diff', '    at the first different letter: rank(a[j]) < rank(b[j]) ✓, else ✗'], ['pre', '    no difference: a must not be longer than b ("app" before "apple")'], ['ok', 'return true;']],
    fields: [{ name: 'words', label: 'words', type: 'words', placeholder: 'hello, leetcode', maxLen: 4, re: /^[a-z]{1,8}$/, msg: 'words: 1 to 4 words of up to 8 letters.' }, { name: 'order', label: 'order', type: 'str', placeholder: 'hlabcdefgijkmnopqrstuvwxyz', re: /^[a-z]{1,26}$/, msg: 'order: each letter at most once.' }],
    valid: ({ words, order }) => (new Set(order).size !== order.length ? 'order: each letter at most once.' : words.join('').split('').some((c) => !order.includes(c)) ? 'order must contain every letter used in the words.' : ''),
    random: (g) => { const order = g.shuffle(['a', 'b', 'c', 'd']).join(''); return { order, words: Array.from({ length: g.int(1, 4) }, () => Array.from({ length: g.int(1, 3) }, () => g.pick([...order])).join('')) }; },
    brute: ({ words, order }) => { const key = (w) => [...w].map((c) => String.fromCharCode(97 + order.indexOf(c))).join(''); for (let i = 1; i < words.length; i++) if (key(words[i - 1]) > key(words[i])) return false; return true; },
    describe: ({ words, order }) => `${show(words)}, order "${order}"`,
    rule: 'compare neighbours at their first different letter',
    run({ words, order }, snap) {
      const rank = Object.fromEntries([...order].map((c, i) => [c, i]));
      snap({ kind: 'start', lines: ['rank'], parts: [strip('order', [...order], { index: [...order].map((_, i) => String(i)) }), P.chips('words', words.map((w, k) => ({ key: String(k), text: w })))], title: 'Turn the alphabet into ranks', text: `rank[c] = position of c in the order (${[...order].slice(0, 4).map((c) => `${c} → ${rank[c]}`).join(', ')}…). Comparing letters becomes comparing small numbers. A list is sorted when every neighbouring pair is, so only neighbours need checking.`, calc: [`${order.length} letters ranked`] });
      for (let i = 1; i < words.length; i++) {
        const a = words[i - 1], b = words[i];
        let j = 0;
        while (j < a.length && j < b.length && a[j] === b[j]) j++;
        const pairParts = (bad) => [strip(`"${a}"`, [...a], { index: false, cls: j < a.length ? { [j]: bad ? 'bad' : 'hit' } : {}, sub: j < a.length ? { [j]: `rank ${rank[a[j]]}` } : {} }), strip(`"${b}"`, [...b], { index: false, cls: j < b.length ? { [j]: bad ? 'bad' : 'hit' } : {}, sub: j < b.length ? { [j]: `rank ${rank[b[j]]}` } : {} })];
        if (j < a.length && j < b.length) {
          const okPair = rank[a[j]] < rank[b[j]];
          if (!okPair) { snap({ kind: 'fail', lines: ['pair', 'diff'], parts: pairParts(true), out: false, answer: 'false', title: `"${a}" vs "${b}": ${a[j]} (${rank[a[j]]}) > ${b[j]} (${rank[b[j]]}) → false`, text: `They first differ at index ${j}. ${a[j]} comes later in the alien order than ${b[j]}, so "${a}" should come after "${b}": the list isn't sorted.`, calc: [`${rank[a[j]]} > ${rank[b[j]]}`] }); return; }
          snap({ kind: 'keep', lines: ['pair', 'diff'], parts: pairParts(false), title: `"${a}" vs "${b}": ${a[j]} (${rank[a[j]]}) < ${b[j]} (${rank[b[j]]}) ✓`, text: `They first differ at index ${j}, and ${a[j]} comes first in the alien order. That settles this pair; the letters after index ${j} don't matter.`, calc: [`${rank[a[j]]} < ${rank[b[j]]}`] });
        } else if (a.length > b.length) {
          snap({ kind: 'fail', lines: ['pair', 'pre'], parts: pairParts(true), out: false, answer: 'false', title: `"${b}" is a prefix of "${a}" → false`, text: `No letter differs, but "${a}" is longer. A shorter prefix must come first (like "app" before "apple"), so this pair is out of order.`, calc: [`${a.length} > ${b.length}`] });
          return;
        } else snap({ kind: 'keep', lines: ['pair', 'pre'], parts: pairParts(false), title: `"${a}" vs "${b}": a prefix comes first ✓`, text: `No letter differs within the shorter length, and "${a}" is not longer, so the pair is in order.`, calc: ['prefix ok'] });
      }
      snap({ kind: 'done', lines: ['ok'], parts: [P.chips('words', words.map((w, k) => ({ key: String(k), text: w, tone: 'success' })))], out: true, answer: 'true', title: 'Every neighbouring pair is in order → true', text: 'Each pair was decided at its first different letter. O(total letters) time; the rank table is 26 entries.', calc: ['sorted'] });
    },
  },
};

const EXAMPLES = {
  dup: { label: '[1, 2, 3, 1]', input: { mode: 'dup', nums: [1, 2, 3, 1] } },
  dupNo: { label: '[1, 2, 3, 4]', input: { mode: 'dup', nums: [1, 2, 3, 4] } },
  anagram: { label: '"anagram", "nagaram"', input: { mode: 'anagram', s: 'anagram', t: 'nagaram' } },
  anagramNo: { label: '"rat", "car"', input: { mode: 'anagram', s: 'rat', t: 'car' } },
  unique: { label: '"loveleetcode"', input: { mode: 'unique', s: 'loveleetcode' } },
  uniqueNone: { label: '"aabb"', input: { mode: 'unique', s: 'aabb' } },
  group: { label: 'eat, tea, tan, ate, nat, bat', input: { mode: 'group', strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] } },
  sudoku: { label: 'a valid 4 × 4 board', input: { mode: 'sudoku', board: [[1, 0, 0, 4], [0, 4, 1, 0], [2, 0, 4, 0], [0, 3, 0, 1]] } },
  sudokuBad: { label: 'two 1s in one box', input: { mode: 'sudoku', board: [[1, 2, 0, 0], [0, 1, 0, 0], [0, 0, 3, 0], [0, 0, 0, 4]] } },
  concat: { label: '[1, 2, 1]', input: { mode: 'concat', nums: [1, 2, 1] } },
  majority: { label: '[2, 2, 1, 1, 1, 2, 2]', input: { mode: 'majority', nums: [2, 2, 1, 1, 1, 2, 2] } },
  codec: { label: 'neet, code, love, you', input: { mode: 'codec', strs: ['neet', 'code', 'love', 'you'] } },
  codecHash: { label: 'strings containing "#"', input: { mode: 'codec', strs: ['a#b', '12', '#'] } },
  majority2: { label: '[1, 1, 1, 3, 3, 2, 2, 2]', input: { mode: 'majority2', nums: [1, 1, 1, 3, 3, 2, 2, 2] } },
  majority2b: { label: '[3, 2, 3]', input: { mode: 'majority2', nums: [3, 2, 3] } },
  alien: { label: '"hello", "leetcode"', input: { mode: 'alien', words: ['hello', 'leetcode'], order: 'hlabcdefgijkmnopqrstuvwxyz' } },
  alienNo: { label: '"word", "world"', input: { mode: 'alien', words: ['word', 'world', 'row'], order: 'worldabcefghijkmnpqstuvxyz' } },
};

export const hashWalk = makeWalk(MODES, EXAMPLES);
