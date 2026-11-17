/**
 * Greedy, trie and bit-manipulation step-throughs (models for <GreedyViz>, <TrieViz> and <BitsViz>).
 * Pure, so scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- greedy

export const GREEDY = {
  jump: { label: 'Jump game', input: { mode: 'jump', a: [2, 3, 1, 1, 4] } },
  stuck: { label: 'Jump game: stuck', input: { mode: 'jump', a: [3, 2, 1, 0, 4] } },
  jump2: { label: 'Fewest jumps', input: { mode: 'jump2', a: [2, 3, 1, 1, 4] } },
  gas: { label: 'Gas station', input: { mode: 'gas', gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] } },
  labels: { label: 'Partition labels', input: { mode: 'labels', s: 'ababcbacadefegde' } },
};

export const greedyCode = (mode) => ({
  jump: [['check', 'if (i > furthest) return false;            // i can\'t even be reached'], ['reach', 'furthest = max(furthest, i + a[i]);'], ['end', 'return true;']],
  jump2: [['reach', 'furthest = max(furthest, i + a[i]);'], ['jump', 'if (i == curEnd) { jumps++; curEnd = furthest; }   // the range for this many jumps is used up']],
  gas: [['add', 'total += gas[i] - cost[i];  tank += gas[i] - cost[i];'], ['reset', 'if (tank < 0) { start = i + 1; tank = 0; }   // nothing in [start, i] can be the start'], ['end', 'return total >= 0 ? start : -1;']],
  labels: [['last', 'last[c] = the last index of every letter'], ['extend', 'end = max(end, last[s[i]]);                 // this part must reach that far'], ['cut', 'if (i == end) { cut here; start = i + 1; }']],
})[mode];

export function greedyAnswer(input) {
  const { mode } = input;
  if (mode === 'jump') {
    const a = input.a, ok = Array(a.length).fill(false);
    ok[0] = true;
    for (let i = 0; i < a.length; i++) if (ok[i]) for (let j = 1; j <= a[i] && i + j < a.length; j++) ok[i + j] = true;
    return ok[a.length - 1];
  }
  if (mode === 'jump2') {
    const a = input.a, d = Array(a.length).fill(Infinity);
    d[0] = 0;
    for (let i = 0; i < a.length; i++) for (let j = 1; j <= a[i] && i + j < a.length; j++) d[i + j] = Math.min(d[i + j], d[i] + 1);
    return d[a.length - 1];
  }
  if (mode === 'gas') {
    const { gas, cost } = input, n = gas.length;
    for (let s = 0; s < n; s++) { let t = 0, ok = true; for (let k = 0; k < n; k++) { const i = (s + k) % n; t += gas[i] - cost[i]; if (t < 0) { ok = false; break; } } if (ok) return s; }
    return -1;
  }
  const s = input.s, out = [];
  let start = 0;
  while (start < s.length) {
    let end = start;
    for (let i = start; i <= end; i++) end = Math.max(end, s.lastIndexOf(s[i]));
    out.push(end - start + 1);
    start = end + 1;
  }
  return out;
}

export function greedy(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, ...x });
  if (mode === 'jump' || mode === 'jump2') {
    const a = input.a, n = a.length;
    let furthest = 0, jumps = 0, curEnd = 0;
    const bands = [];                          // jump2: index ranges reachable with k jumps
    snap({ kind: 'start', a, i: null, furthest: 0, curEnd: 0, jumps: 0, bands: [], lines: [], title: mode === 'jump' ? 'Can you reach the last index?' : 'The fewest jumps to the last index', text: mode === 'jump' ? 'a[i] is the longest jump you can make from index i. Instead of trying jump sequences, keep one number: the furthest index you can reach so far. Walk left to right; if you ever stand past it, you\'re stuck.' : 'Think in rings, like BFS: all indexes reachable with 0 jumps, then with 1, and so on. Walking left to right, track the furthest you could reach from the current ring; when you reach the ring\'s end, you must jump, and the next ring ends at that furthest point.', calc: [`a = ${list(a)}`] });
    for (let i = 0; i < (mode === 'jump' ? n : n - 1); i++) {
      if (mode === 'jump' && i > furthest) {
        snap({ kind: 'stuck', a, i, furthest, curEnd, jumps, bands: [...bands], lines: ['check'], answer: 'false', title: `Stuck: index ${i} is past the furthest reach, ${furthest}`, text: `Nothing before index ${i} can jump this far: the best reach is ${furthest}. Index ${i}, and the end, can never be reached.`, calc: [`${i} > ${furthest}`, 'return false'] });
        return steps;
      }
      const before = furthest;
      furthest = Math.max(furthest, i + a[i]);
      if (mode === 'jump') {
        snap({ kind: 'reach', a, i, furthest, jump: [i, Math.min(n - 1, i + a[i])], lines: ['check', 'reach'], title: `From ${i}, reach ${i + a[i]}${furthest > before ? `: furthest is now ${furthest}` : ''}`, text: `Index ${i} is within reach (≤ ${before}). From here you can jump up to ${a[i]}, to index ${i + a[i]}. ${furthest > before ? `That extends the reach to ${furthest}.` : `The reach stays ${furthest}.`}${furthest >= n - 1 ? ' That already covers the last index.' : ''}`, calc: [`max(${before}, ${i} + ${a[i]}) = ${furthest}`] });
        continue;
      }
      const ringEnd = i === curEnd;
      if (ringEnd) { jumps++; bands.push([curEnd + 1, Math.min(n - 1, furthest), jumps]); curEnd = furthest; }
      snap({ kind: ringEnd ? 'jump' : 'reach', a, i, furthest, curEnd, jumps, bands: [...bands], jump: [i, Math.min(n - 1, i + a[i])], lines: ringEnd ? ['reach', 'jump'] : ['reach'], title: ringEnd ? `End of ring ${jumps - 1}: jump (${jumps}), next ring ends at ${curEnd}` : `From ${i}, reach ${i + a[i]}`, text: ringEnd ? `Index ${i} is the last index reachable with ${jumps - 1} jump${jumps - 1 === 1 ? '' : 's'}. To go further you need jump ${jumps}, and with it you can get as far as ${curEnd}, the best reach seen in this ring.` : `Still inside the ring that ends at ${curEnd}. From ${i} you could reach ${i + a[i]}; the best reach for the next ring is ${furthest}.`, calc: [`furthest = ${furthest}`, `jumps = ${jumps}, curEnd = ${curEnd}`] });
    }
    const ans = mode === 'jump' ? 'true' : String(jumps);
    snap({ kind: 'done', a, i: null, furthest, curEnd, jumps, bands: [...bands], lines: mode === 'jump' ? ['end'] : [], answer: ans, title: mode === 'jump' ? 'The last index is reachable: true' : `${jumps} jumps`, text: mode === 'jump' ? 'One pass and one number replaced a search over jump sequences: O(n) time, O(1) space.' : 'Each ring is one jump; a greedy choice of the furthest reach per ring is exactly BFS by levels without a queue. O(n).', calc: [`answer: ${ans}`] });
    return steps;
  }
  if (mode === 'gas') {
    const { gas, cost } = input, n = gas.length;
    const diff = gas.map((g, k) => g - cost[k]);
    let total = 0, tank = 0, start = 0;
    snap({ kind: 'start', gas, cost, diff, i: null, tank: 0, total: 0, start: 0, lines: [], title: 'From which station can you go all the way round?', text: 'At each station you gain gas[i] and spend cost[i] to reach the next one: the net is gas − cost. Keep a running tank from a candidate start. If it ever goes negative, no station from the start up to here can work, so the next station becomes the start.', calc: [`net = ${list(diff)}`] });
    for (let i = 0; i < n; i++) {
      total += diff[i];
      tank += diff[i];
      const reset = tank < 0;
      const was = start;
      const low = tank;
      if (reset) { start = i + 1; tank = 0; }
      snap({ kind: reset ? 'reset' : 'add', gas, cost, diff, i, tank: reset ? tank : tank, total, start, failedFrom: reset ? was : null, lines: reset ? ['add', 'reset'] : ['add'], title: reset ? `Tank below 0 at ${i}: start again from ${i + 1}` : `Station ${i}: tank ${tank}`, text: reset ? `Starting at ${was}, the tank is ${low} after station ${i}: below zero. ${was === i ? `So station ${i} can't be the start.` : `Every station from ${was} to ${i} would arrive here with even less gas, so none of them can be the start.`} Try ${i + 1} with an empty tank.` : `Net ${diff[i] >= 0 ? '+' : ''}${diff[i]} at station ${i}: the tank from start ${start} is ${tank}, still fine.`, calc: [`total = ${total}`, `tank = ${tank}`, `start = ${start}`] });
    }
    const ans = total >= 0 ? start : -1;
    snap({ kind: 'done', gas, cost, diff, i: null, tank, total, start, lines: ['end'], answer: String(ans), title: ans === -1 ? 'Total gas < total cost: −1' : `Start at station ${ans}`, text: ans === -1 ? 'There isn\'t enough gas overall, so no start can work.' : `The total is ${total} ≥ 0, so some start works, and the only candidate never ruled out is ${ans}. One pass instead of trying every start (O(n²)).`, calc: [`total = ${total}`, `answer = ${ans}`] });
    return steps;
  }
  const s = input.s;
  const chars = [...s];
  const last = {};
  chars.forEach((c, k) => { last[c] = k; });
  const parts = [];
  let start = 0, end = 0;
  snap({ kind: 'start', chars, last, i: null, start: 0, end: 0, parts: [], lines: ['last'], title: 'Cut the string so each letter stays in one part', text: 'First note where each letter appears for the last time. Then walk the string: the current part has to stretch at least to the last occurrence of every letter it contains. When the walk reaches that point, nothing inside needs to go further: cut.', calc: [`last: ${Object.entries(last).map(([c, k]) => `${c}:${k}`).join(' ')}`] });
  for (let i = 0; i < chars.length; i++) {
    const before = end;
    end = Math.max(end, last[chars[i]]);
    const cut = i === end;
    if (cut) parts.push([start, end]);
    snap({ kind: cut ? 'cut' : 'extend', chars, last, i, start, end, parts: parts.map((p) => [...p]), lines: cut ? ['extend', 'cut'] : ['extend'], title: cut ? `Cut after ${i}: part of ${end - start + 1}` : `'${chars[i]}' appears up to ${last[chars[i]]}${end > before ? `: stretch to ${end}` : ''}`, text: cut ? `The walk reached ${end}, the furthest last-occurrence of any letter in this part. No letter in ${start}–${end} appears later, so this is a safe place to cut.` : `'${chars[i]}' appears again as late as index ${last[chars[i]]}, so the part must reach at least there.${end > before ? ` The part now ends no earlier than ${end}.` : ` It already reaches ${end}.`}`, calc: [`end = max(${before}, ${last[chars[i]]}) = ${end}`] });
    if (cut) start = i + 1;
  }
  const ans = parts.map(([a, b]) => b - a + 1);
  snap({ kind: 'done', chars, last, i: null, start, end, parts: parts.map((p) => [...p]), lines: [], answer: list(ans), title: `Part sizes: ${list(ans)}`, text: 'Cutting as early as possible gives the most parts, and each cut is forced by the letters inside. O(n) time, one array of 26 last positions.', calc: [`sizes ${list(ans)}`] });
  return steps;
}

export function parseGreedy(values, input) {
  if (input.mode === 'gas') {
    const g = parseInts(values.gas, { min: 0, max: 9, minLen: 2, maxLen: 8, name: 'gas' }); if (g.error) return g;
    const c = parseInts(values.cost, { min: 0, max: 9, minLen: g.arr.length, maxLen: g.arr.length, name: 'cost' }); if (c.error) return { error: 'cost needs one number per station.' };
    return { input: { mode: 'gas', gas: g.arr, cost: c.arr } };
  }
  if (input.mode === 'labels') {
    const s = String(values.s ?? '').trim();
    return /^[a-z]{2,16}$/.test(s) ? { input: { mode: 'labels', s } } : { error: 'Lower-case letters only, 2 to 16 of them.' };
  }
  const r = parseInts(values.a, { min: 0, max: 9, minLen: 2, maxLen: 10, name: 'a' });
  return r.error ? r : { input: { mode: input.mode, a: r.arr } };
}

export function randomGreedy(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'gas') { const n = g.int(4, 6); return { mode: 'gas', gas: Array.from({ length: n }, () => g.int(0, 6)), cost: Array.from({ length: n }, () => g.int(0, 6)) }; }
  if (input.mode === 'labels') return { mode: 'labels', s: Array.from({ length: g.int(8, 14) }, () => g.pick('abcdefg'.split(''))).join('') };
  const n = g.int(5, 9);
  const a = Array.from({ length: n }, () => g.int(0, 3));
  if (input.mode === 'jump2') for (let k = 0; k < n - 1; k++) if (!a[k]) a[k] = 1;
  return { mode: input.mode, a };
}

// ---------------------------------------------------------------- tries

export const TRIE = {
  build: { label: 'Insert and search', input: { words: ['car', 'cat', 'cart', 'dog'], queries: [['search', 'car'], ['search', 'ca'], ['prefix', 'ca'], ['search', 'do'], ['count', 'ca']] } },
  wild: { label: 'Wildcard search', input: { words: ['bad', 'dad', 'mad', 'bat'], queries: [['wild', '.ad'], ['wild', 'b..'], ['wild', '..x']] } },
};

export const trieCode = [
  ['insert', 'insert(w): for each letter, follow its child (create it if missing);  pass++;  mark the last node end'],
  ['walk', 'walk(s): follow each letter; a missing child → the path breaks (null)'],
  ['search', 'search(w) = walk(w) != null && end   ·   startsWith(p) = walk(p) != null   ·   count(p) = walk(p).pass'],
  ['wild', 'match(n, w, i): a letter follows one child; "." tries every child'],
];

/** The trie as a map from prefix to node: { id (the prefix), letter, parent, end, pass }. */
export function buildTrie(words) {
  const nodes = { '': { id: '', letter: '', parent: null, end: false, pass: 0 } };
  for (const w of words) {
    if (nodes[w]?.end) continue;
    for (let k = 1; k <= w.length; k++) {
      const id = w.slice(0, k);
      if (!nodes[id]) nodes[id] = { id, letter: w[k - 1], parent: w.slice(0, k - 1), end: false, pass: 0 };
      nodes[id].pass++;
    }
    nodes[w].end = true;
  }
  return nodes;
}

export function trieAnswer({ words, queries }) {
  const set = new Set(words);
  return queries.map(([op, s]) => {
    if (op === 'search') return set.has(s);
    if (op === 'prefix') return words.some((w) => w.startsWith(s));
    if (op === 'count') return [...set].filter((w) => w.startsWith(s)).length;
    const re = new RegExp(`^${s}$`);
    return words.some((w) => re.test(w));
  });
}

export function trie({ words, queries }) {
  const nodes = {};
  const all = buildTrie(words);
  const steps = [];
  const snap = (x) => steps.push({ all, nodes: Object.fromEntries(Object.entries(nodes).map(([k, n]) => [k, { ...n }])), path: [], ...x });
  nodes[''] = { ...all[''], end: false, pass: 0 };
  snap({ kind: 'start', lines: [], title: `A trie for ${list(words)}`, text: 'Each edge is a letter, and words that start the same share the same path from the root. A node marked as an end (a ring) means a whole word stops there; "pass" counts how many words go through a node.', calc: [`${words.length} words`] });
  for (const w of words) {
    const fresh = [];
    let had = true;
    for (let k = 1; k <= w.length; k++) {
      const id = w.slice(0, k);
      if (!nodes[id]) { nodes[id] = { ...all[id], end: false, pass: 0 }; fresh.push(id); had = false; }
    }
    const dup = nodes[w].end;
    if (!dup) { for (let k = 1; k <= w.length; k++) nodes[w.slice(0, k)].pass++; nodes[w].end = true; }
    const path = ['', ...Array.from({ length: w.length }, (_, k) => w.slice(0, k + 1))];
    snap({ kind: 'insert', path, fresh, lines: ['insert'], title: `insert("${w}")${fresh.length ? `: ${plural(fresh.length, 'new node')}` : ''}`, text: dup ? `"${w}" is already stored, so nothing changes (and the pass counts aren't inflated).` : fresh.length === w.length ? `No word shares a prefix with "${w}" yet, so every letter gets a new node. The last one is marked as the end of a word.` : had ? `Every letter of "${w}" already has a node (it is a prefix of an earlier word). Just mark the last node as an end.` : `The first ${w.length - fresh.length} letter${w.length - fresh.length === 1 ? '' : 's'} ("${w.slice(0, w.length - fresh.length)}") already exist and are shared; only ${fresh.map((id) => `"${id.at(-1)}"`).join(', ')} ${fresh.length === 1 ? 'is' : 'are'} new.`, calc: [`path: ${path.slice(1).map((id) => id.at(-1)).join(' → ')}`] });
  }
  const results = [];
  for (const [op, s] of queries) {
    if (op === 'wild') {
      const tried = [], hits = [];
      const match = (id, i) => {
        if (!nodes[id]) return false;
        tried.push(id);
        if (i === s.length) { if (nodes[id].end) { hits.push(id); return true; } return false; }
        const c = s[i];
        if (c !== '.') return match(id + c, i + 1);
        const kids = Object.values(nodes).filter((n) => n.parent === id).map((n) => n.id).sort();
        for (const k of kids) if (match(k, i + 1)) return true;
        return false;
      };
      const ok = match('', 0);
      results.push(ok);
      snap({ kind: ok ? 'found' : 'missing', path: tried, hit: hits[0] ?? null, lines: ['wild'], query: `search("${s}")`, title: `search("${s}") → ${ok}`, text: `A letter follows its one child; a "." tries every child, one branch after another, until one matches. ${ok ? `It matched "${hits[0]}" after visiting ${plural(tried.length - 1, 'node')}.` : `Every branch broke or ended on a node that isn't a word: false.`}`, calc: [`nodes visited: ${tried.length - 1}`, `result: ${ok}`] });
      continue;
    }
    const path = [''];
    let broke = null;
    for (let k = 1; k <= s.length; k++) { const id = s.slice(0, k); if (!nodes[id]) { broke = k - 1; break; } path.push(id); }
    const node = broke === null ? nodes[s] : null;
    const res = op === 'search' ? Boolean(node?.end) : op === 'prefix' ? Boolean(node) : node ? node.pass : 0;
    results.push(res);
    const label = op === 'search' ? `search("${s}")` : op === 'prefix' ? `startsWith("${s}")` : `countWithPrefix("${s}")`;
    snap({
      kind: res ? 'found' : 'missing', path, hit: node && res ? s : null, broke, lines: ['walk', 'search'], query: label,
      title: `${label} → ${res}`,
      text: broke !== null
        ? `The walk follows ${broke ? `"${s.slice(0, broke)}" and then` : ''} looks for '${s[broke]}', but there is no such child: no stored word starts with "${s.slice(0, broke + 1)}".`
        : op === 'search'
          ? (node.end ? `The walk reaches the node for "${s}", and it is marked as an end: "${s}" is a stored word.` : `The walk reaches the node for "${s}", but it isn't marked as an end: "${s}" is only a prefix of longer words. search is false, startsWith would be true.`)
          : op === 'prefix' ? `The path for "${s}" exists, so at least one word starts with it.` : `The node for "${s}" has pass = ${node.pass}: that many words go through it.`,
      calc: [`walked: ${path.slice(1).map((id) => id.at(-1)).join(' → ') || '(root)'}`, `result: ${res}`],
    });
  }
  snap({ kind: 'done', lines: [], answer: list(results), title: `Answers: ${list(results)}`, text: 'Every insert and lookup costs O(length of the word), however many words are stored. A hash set can answer "is this word stored", but not "which words start with this prefix" without scanning them all.', calc: queries.map(([op, s2], k) => `${op} ${s2}: ${results[k]}`) });
  return steps;
}

export function parseTrie(values, input) {
  const words = String(values.words ?? '').split(/[\s,]+/).filter(Boolean);
  if (words.length < 1 || words.length > 6 || words.some((w) => !/^[a-z]{1,5}$/.test(w))) return { error: 'Up to 6 words of lower-case letters, 5 letters at most.' };
  const qs = String(values.queries ?? '').split(/[\s,]+/).filter(Boolean);
  if (qs.length > 5) return { error: 'Up to 5 queries.' };
  const wild = input.queries[0][0] === 'wild';
  const queries = [];
  for (const q of qs) {
    if (wild) { if (!/^[a-z.]{1,5}$/.test(q)) return { error: 'Queries use letters and . only.' }; queries.push(['wild', q]); continue; }
    if (!/^[a-z]{1,5}[*#]?$/.test(q)) return { error: 'Write a word to search it; end it with * for a prefix (ca*) or # to count words with that prefix (ca#).' };
    queries.push(q.endsWith('*') ? ['prefix', q.slice(0, -1)] : q.endsWith('#') ? ['count', q.slice(0, -1)] : ['search', q]);
  }
  return { input: { words: [...new Set(words)], queries } };
}

export const trieQueriesText = (qs) => qs.map(([op, s]) => (op === 'prefix' ? `${s}*` : op === 'count' ? `${s}#` : s)).join(', ');

export function randomTrie(input, rand = Math.random) {
  const g = rng(rand);
  const words = [...new Set(Array.from({ length: g.int(3, 5) }, () => Array.from({ length: g.int(2, 4) }, () => g.pick('abct'.split(''))).join('')))];
  if (input.queries[0][0] === 'wild') return { words, queries: [['wild', g.pick(words).replace(/^./, '.')], ['wild', '.' + g.pick('abct'.split(''))]] };
  return { words, queries: [['search', g.pick(words)], ['prefix', g.pick(words).slice(0, 1)], ['search', 'ab']] };
}

// ---------------------------------------------------------------- bit manipulation

export const BITS = {
  popcount: { label: 'n & (n − 1)', input: { mode: 'popcount', n: 52 } },
  single: { label: 'XOR: the single number', input: { mode: 'single', a: [4, 1, 2, 1, 2] } },
  missing: { label: 'XOR: the missing number', input: { mode: 'missing', a: [3, 0, 1] } },
};

export const bitsCode = (mode) => ({
  popcount: [['loop', 'while (n != 0) {'], ['clear', '  n &= n - 1;   count++;      // clears the lowest set bit'], ['end', '}']],
  single: [['loop', 'x = 0;  for (v : a) x ^= v;     // pairs cancel: v ^ v = 0'], ['end', 'return x;']],
  missing: [['init', 'x = n;                           // include n itself'], ['loop', 'for (i < n) x ^= i ^ a[i];       // every present number cancels its index'], ['end', 'return x;']],
})[mode];

/** Bits drawn for an input: just enough for its largest value (4 to 8), so small examples aren't a wall of 0s. */
export const bitWidth = (input) => {
  const max = input.mode === 'popcount' ? input.n : Math.max(input.a.length, ...input.a);
  return Math.min(8, Math.max(4, max.toString(2).length));
};
export const toBits = (v, w) => Array.from({ length: w }, (_, k) => (v >> (w - 1 - k)) & 1);
const bin = (v, w) => v.toString(2).padStart(w, '0');

/**
 * Each step is a small sum written in binary: rows of bits lined up by place value, an operator in
 * front of the second operand, a line, then the result. row.tags maps a place value (1, 2, 4…) to how
 * that cell is highlighted: 'low' (the lowest 1-bit), 'flip' (changed by − 1), 'gone' (cleared), 'cancel'
 * (1 ^ 1 → 0). step.holds lists what x is "made of" (values XOR-ed in an odd number of times).
 */
export function bits(input) {
  const { mode } = input;
  const w = bitWidth(input);
  const steps = [];
  const snap = (x) => steps.push({ mode, w, ...x });
  if (mode === 'popcount') {
    let n = input.n, count = 0;
    const removed = [];
    snap({ kind: 'start', rows: [{ label: 'n', v: n }], removed: [], count, lines: [], title: `Count the 1-bits of ${n}`, text: `Read the row as switches: ${n} = ${bin(n, w)}, so the switches for ${[...bin(n, w)].map((c, k) => (c === '1' ? 2 ** (w - 1 - k) : null)).filter(Boolean).join(' + ')} are on. The trick turns off one switch per round, the lowest one, and counts the rounds.`, calc: [`${n} = ${bin(n, w)}₂`] });
    while (n) {
      const m = n - 1, next = n & m;
      const low = n & -n;
      const flip = {};
      for (let p = 1; p <= low; p *= 2) flip[p] = p === low ? 'low' : 'flip';
      snap({ kind: 'sub', rows: [{ label: 'n', v: n, tags: flip }, { label: 'n − 1', v: m, tags: flip }], removed: [...removed], count, lines: ['loop', 'clear'], title: `Step 1: n − 1 flips the lowest 1 and everything right of it`, text: low === 1 ? `The lowest 1 of ${n} is in the 1s place, so subtracting 1 just turns it off. Nothing else changes.` : `Subtracting 1 has to borrow: the lowest 1 (the ${low}s place) turns off, and the 0s to its right all turn on. Only the highlighted columns changed; everything to the left is the same in both rows.`, calc: [`${n} − 1 = ${m}`, `${bin(n, w)} → ${bin(m, w)}`] });
      count++;
      removed.push(low);
      const gone = { [low]: 'gone' };
      snap({ kind: 'clear', rows: [{ label: 'n', v: n, tags: flip }, { label: 'n − 1', v: m, op: '&', tags: flip }, { label: 'result', v: next, result: true, tags: gone }], removed: [...removed], count, lines: ['loop', 'clear'], title: `Step 2: AND them → ${next}. One 1 gone (count = ${count})`, text: `& gives 1 only where both rows have a 1. In the highlighted columns the two rows disagree (one has 0, the other 1), so they all become 0. The columns to the left agree, so they're copied. Net effect: exactly the lowest 1 (worth ${low}) is turned off.`, calc: [`${bin(n, w)} & ${bin(m, w)} = ${bin(next, w)}`, `count = ${count}`] });
      n = next;
    }
    snap({ kind: 'done', rows: [{ label: 'n', v: 0 }], removed: [...removed], count, lines: ['end'], answer: `${count} set bits`, title: `${input.n} has ${count} set bits`, text: `n is all 0s, so the loop stops. It ran once per 1-bit (${removed.join(' + ')} = ${input.n}), not once per bit position. Bonus: a power of two has exactly one 1, so n & (n − 1) == 0 tests for it in one step.`, calc: [`count = ${count}`] });
    return steps;
  }
  // XOR modes. holds: the values currently "inside" x, in order of arrival.
  const cancelTags = (a, b) => {
    const t = {};
    for (let p = 1; p < 2 ** w; p *= 2) if ((a & p) && (b & p)) t[p] = 'cancel';
    return t;
  };
  const toggle = (holds, v, note) => {
    const k = holds.findIndex((h) => h.v === v);
    if (k >= 0) { const [h] = holds.splice(k, 1); return { gone: { ...h, with: note } }; }
    holds.push({ v, note });
    return { gone: null };
  };
  if (mode === 'single') {
    const a = input.a;
    let x = 0;
    const holds = [], cancelled = [];
    snap({ kind: 'start', rows: [{ label: 'x', v: 0 }], holds: [], cancelled: [], i: null, lines: ['loop'], title: `Every value appears twice except one: ${list(a)}`, text: '^ (XOR) gives 1 where the two rows differ and 0 where they match. So a number XOR-ed with itself is all 0s, and XOR-ing in 0 changes nothing. Think of x as a bag: XOR-ing a value in puts it in the bag, and XOR-ing the same value again takes it back out.', calc: ['x = 0  (empty bag)'] });
    a.forEach((v, i) => {
      const before = x;
      x ^= v;
      const { gone } = toggle(holds, v, `a[${i}]`);
      if (gone) cancelled.push(v);
      snap({ kind: gone ? 'cancel' : 'xor', rows: [{ label: 'x', v: before }, { label: `a[${i}]`, v, op: '^' }, { label: 'new x', v: x, result: true, tags: cancelTags(before, v) }], holds: holds.map((h) => h.v), cancelled: [...cancelled], i, lines: ['loop'], title: gone ? `x ^= ${v}: the second ${v} takes the first one out` : `x ^= ${v}: ${v} goes into x`, text: gone ? `${v} is already in the bag, so XOR-ing it again takes it back out. The pair of ${v}s vanishes as if neither had been seen, even though the copies weren't next to each other.` : `${v} goes into the bag. Column by column: matching bits give 0, different bits give 1 (a crossed cell is 1 ^ 1 = 0). If another ${v} comes later, it will undo exactly this change.`, calc: [`${bin(before, w)} ^ ${bin(v, w)} = ${bin(x, w)}`, `x holds ${holds.length ? holds.map((h) => h.v).join(' ^ ') : 'nothing'} = ${x}`] });
    });
    snap({ kind: 'done', rows: [{ label: 'x', v: x, result: true }], holds: holds.map((h) => h.v), cancelled: [...cancelled], i: null, lines: ['end'], answer: `${x}`, title: `The single number is ${x}`, text: `Every pair took itself back out, so only ${x} is left in the bag. O(n) time and O(1) memory: one int instead of a hash set.`, calc: [`x = ${x}`] });
    return steps;
  }
  const a = input.a, n = a.length;
  let x = n;
  const holds = [{ v: n, note: 'n' }], cancelled = [];
  snap({ kind: 'start', rows: [{ label: 'x', v: x }], holds: [n], cancelled: [], i: null, lines: ['init'], title: `One number from 0…${n} is missing: ${list(a)}`, text: `XOR in every index 0…${n - 1}, every value, and n itself. A number that is present goes into x twice (once as an index or n, once as a value), so it cancels. The missing number only ever goes in once, so it's what's left. Start with x = n.`, calc: [`x = ${n}`] });
  a.forEach((v, i) => {
    const before = x;
    x ^= i ^ v;
    const g1 = toggle(holds, i, `index ${i}`).gone;
    const g2 = toggle(holds, v, `a[${i}]`).gone;
    [g1, g2].forEach((g) => g && cancelled.push(g.v));
    const said = [g1 && `index ${i} cancels the ${i} already in x`, g2 && `value ${v} cancels the ${v} already in x`].filter(Boolean);
    snap({ kind: g1 || g2 ? 'cancel' : 'xor', rows: [{ label: 'x', v: before }, { label: `index ${i}`, v: i, op: '^' }, { label: `a[${i}]`, v, op: '^' }, { label: 'new x', v: x, result: true }], holds: holds.map((h) => h.v), cancelled: [...cancelled], i, lines: ['loop'], title: `x ^= ${i} ^ ${v} → ${x}`, text: `Put index ${i} and value ${v} into x. ${said.length ? `${said.join('; ').replace(/^./, (c) => c.toUpperCase())}: a matched pair is gone.` : 'Neither has a partner in x yet, so both stay for now.'} A column of the result is 1 when an odd number of rows have a 1 there.`, calc: [`${bin(before, w)} ^ ${bin(i, w)} ^ ${bin(v, w)} = ${bin(x, w)}`, `x holds ${holds.length ? holds.map((h) => h.v).join(' ^ ') : 'nothing'} = ${x}`] });
  });
  snap({ kind: 'done', rows: [{ label: 'x', v: x, result: true }], holds: holds.map((h) => h.v), cancelled: [...cancelled], i: null, lines: ['end'], answer: `${x}`, title: `Missing: ${x}`, text: `Every present number met its partner and cancelled; only ${x} went in once. The sum formula n(n + 1)/2 − sum works too, but XOR can never overflow.`, calc: [`x = ${x}`] });
  return steps;
}

export function parseBits(values, input) {
  if (input.mode === 'popcount') {
    const r = parseInt1(values.n, { min: 1, max: 255, name: 'n' });
    return r.error ? r : { input: { mode: 'popcount', n: r.v } };
  }
  const r = parseInts(values.a, { min: 0, max: 255, minLen: 1, maxLen: 9, name: 'a' });
  if (r.error) return r;
  if (input.mode === 'missing') {
    const n = r.arr.length;
    if (new Set(r.arr).size !== n || r.arr.some((v) => v > n)) return { error: `Use ${n} different numbers from 0 to ${n}, with one missing.` };
    return { input: { mode: 'missing', a: r.arr } };
  }
  const counts = {};
  r.arr.forEach((v) => { counts[v] = (counts[v] ?? 0) + 1; });
  if (Object.values(counts).filter((c) => c === 1).length !== 1 || Object.values(counts).some((c) => c > 2)) return { error: 'Every value should appear exactly twice, except one.' };
  return { input: { mode: 'single', a: r.arr } };
}

export function randomBits(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'popcount') return { mode: 'popcount', n: g.int(1, 255) };
  if (input.mode === 'missing') { const n = g.int(3, 7); const miss = g.int(0, n); return { mode: 'missing', a: g.shuffle(Array.from({ length: n + 1 }, (_, k) => k).filter((k) => k !== miss)) }; }
  const vals = g.shuffle(Array.from({ length: 15 }, (_, k) => k + 1)).slice(0, g.int(2, 4));
  return { mode: 'single', a: g.shuffle([...vals, ...vals.slice(1)]) };
}
