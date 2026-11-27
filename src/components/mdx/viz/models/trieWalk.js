/**
 * <TrieWalkViz>: the Tries lesson's problems, one engine. A step can show the trie (the same drawing as
 * <TrieViz>), a letter grid, rows of cells (the greedy strip shape) and chips.
 *   trie = { all, nodes, path, fresh, hit, hits, broke, kind, query, caption }   (nodes keyed by prefix)
 * Pure, so scripts/viz-check.mjs can compare each mode with an independent brute force.
 */
import { list, rng } from './util.js';
import { buildTrie } from './special.js';

export const TRIE_WALK = {
  lcp: { label: 'Longest common prefix', input: { mode: 'lcp', words: ['flower', 'flow', 'flight'] } },
  lcpWord: { label: 'LCP: a whole word', input: { mode: 'lcp', words: ['inter', 'in', 'into'] } },
  replace: { label: 'Replace words', input: { mode: 'replace', roots: ['cat', 'bat', 'rat'], sentence: 'the cattle was rattled by the battery' } },
  replaceShort: { label: 'The shortest root wins', input: { mode: 'replace', roots: ['cat', 'ca', 'b'], sentence: 'the cattle ate cabbage' } },
  suggest: { label: 'Search suggestions', input: { mode: 'suggest', products: ['mob', 'mouse', 'money', 'moon', 'mop', 'mount'], word: 'mou' } },
  maxxor: { label: 'Maximum XOR', input: { mode: 'maxxor', nums: [3, 10, 5, 8, 2] } },
  boggle: { label: 'Word search II', input: { mode: 'boggle', board: ['oaan', 'etae', 'ihkr', 'iflv'], words: ['oath', 'pea', 'eat', 'rain'] } },
  extra: { label: 'Extra characters', input: { mode: 'extra', s: 'leetscode', dict: ['leet', 'code', 'leetcode'] } },
};

export const trieWalkCode = (mode) => ({
  lcp: [['build', 'insert every word into a trie'], ['walk', 'from the root: while the node has exactly one child and no word ends here, follow it'], ['ans', 'return the letters walked']],
  replace: [['build', 'insert every root into a trie'], ['walk', 'for each word: follow its letters from the root'], ['hit', '  the first node that ends a root → replace the word by that root'], ['miss', '  the path breaks (or the word ends first) → keep the word']],
  suggest: [['build', 'insert every product into a trie'], ['walk', 'after each typed letter: move one node down'], ['list', '  collect the first 3 words below it, children in a..z order'], ['none', '  no node → no suggestions for this or any later letter']],
  maxxor: [['build', 'insert every number as bits, highest bit first'], ['walk', 'for each x: at every bit, take the child with the opposite bit if it exists'], ['ans', 'best = max over x of (x XOR the leaf reached)']],
  boggle: [['build', 'insert every word into a trie'], ['start', 'for each cell whose letter starts a word: dfs(cell, root child)'], ['dfs', 'dfs: step to a neighbour only if its letter is a child of the current node'], ['found', 'a node that ends a word → record it (and unmark it, so it is found once)']],
  extra: [['build', 'insert every dictionary word into a trie'], ['skip', 'best[i] = 1 + best[i + 1]                // s[i] is extra'], ['word', 'walk the trie from s[i]: each word end at j → best[i] = min(best[i], best[j + 1])'], ['ans', 'return best[0];']],
})[mode];

// ---------------------------------------------------------------- brute forces (no trie)

export function trieWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'lcp') { let p = input.words[0]; for (const w of input.words) while (!w.startsWith(p)) p = p.slice(0, -1); return p; }
  if (mode === 'replace') return input.sentence.split(' ').map((w) => input.roots.filter((r) => w.startsWith(r)).sort((a, b) => a.length - b.length)[0] ?? w).join(' ');
  if (mode === 'suggest') { const sorted = [...input.products].sort(); return Array.from({ length: input.word.length }, (_, k) => sorted.filter((p) => p.startsWith(input.word.slice(0, k + 1))).slice(0, 3)); }
  if (mode === 'maxxor') { let b = 0; for (const x of input.nums) for (const y of input.nums) b = Math.max(b, x ^ y); return b; }
  if (mode === 'boggle') {
    const B = input.board, R = B.length, C = B[0].length;
    const can = (w) => { const go = (r, c, i, seen) => { if (r < 0 || c < 0 || r >= R || c >= C || seen.has(r * C + c) || B[r][c] !== w[i]) return false; if (i === w.length - 1) return true; seen.add(r * C + c); const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => go(r + a, c + b, i + 1, seen)); seen.delete(r * C + c); return ok; }; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (go(r, c, 0, new Set())) return true; return false; };
    return input.words.filter(can).sort();
  }
  const { s, dict } = input;
  const go = (i) => (i === s.length ? 0 : Math.min(1 + go(i + 1), ...dict.filter((w) => s.startsWith(w, i)).map((w) => go(i + w.length))));
  return go(0);
}

// ---------------------------------------------------------------- step-throughs

const bitsOf = (x, B) => x.toString(2).padStart(B, '0');

export function trieWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, trie: null, grid: null, strips: null, chips: null, ...x });
  const T = (all, x = {}) => ({ all, nodes: all, path: [], fresh: [], hit: null, hits: [], broke: null, kind: 'found', query: null, ...x });
  const pathOf = (w) => ['', ...Array.from({ length: w.length }, (_, k) => w.slice(0, k + 1))];
  const kidsOf = (all, id) => Object.values(all).filter((n) => n.parent === id).map((n) => n.id).sort();

  if (mode === 'lcp') {
    const { words } = input;
    const all = buildTrie(words);
    snap({ kind: 'build', lines: ['build'], trie: T(all, { fresh: Object.keys(all) }), title: `A trie of ${list(words.map((w) => `"${w}"`))}`, text: 'A prefix shared by every word is a single path from the root that nobody leaves. Put the words in a trie: the common prefix is the stretch where each node has exactly one child and no word has ended yet.', calc: [`${words.length} words`] });
    let id = '';
    for (;;) {
      const kids = kidsOf(all, id);
      const n = all[id];
      if (id !== '' && n.end) { snap({ kind: 'stop', lines: ['walk'], trie: T(all, { path: pathOf(id), hit: id, kind: 'found' }), title: `"${id}" is a whole word: stop`, text: `A word ends at "${id}", so no longer prefix can be shared by that word.`, calc: [`prefix "${id}"`] }); break; }
      if (kids.length !== 1) { snap({ kind: 'stop', lines: ['walk'], trie: T(all, { path: pathOf(id), hit: id || null, kind: kids.length ? 'found' : 'missing' }), title: kids.length ? `The words split after "${id}"` : 'No letters at all', text: kids.length ? `Below "${id}" the path branches into ${kids.map((k) => `"${k.at(-1)}"`).join(' and ')}: the words disagree on the next letter.` : 'An empty word means an empty prefix.', calc: [`prefix "${id}"`] }); break; }
      id = kids[0];
      snap({ kind: 'walk', lines: ['walk'], trie: T(all, { path: pathOf(id) }), title: `Every word continues with "${id.at(-1)}"`, text: `The node has one child, "${id.at(-1)}", passed by all ${all[id].pass} words. The shared prefix grows to "${id}".`, calc: [`prefix "${id}"`] });
    }
    snap({ kind: 'done', lines: ['ans'], trie: T(all, { path: pathOf(id), hit: id || null }), out: id, answer: `"${id}"`, title: id ? `Longest common prefix: "${id}"` : 'No common prefix: ""', text: 'Building the trie touches every letter once; the walk is at most the shortest word. Comparing the words letter by letter (vertical scanning) is just as fast for one question; the trie pays off when many questions come.', calc: [`"${id}"`] });
    return steps;
  }

  if (mode === 'replace') {
    const { roots, sentence } = input;
    const all = buildTrie(roots);
    const out = [];
    const words = sentence.split(' ');
    const chips = () => [{ label: 'sentence', chips: words.map((w, k) => ({ key: k, text: out[k] ?? w, tone: out[k] === undefined ? undefined : out[k] !== w ? 'success' : 'muted' })) }];
    snap({ kind: 'build', lines: ['build'], trie: T(all, { fresh: Object.keys(all) }), chips: chips(), title: `Roots ${list(roots)}`, text: 'Put the roots in a trie. For each word, walk its letters from the root and stop at the FIRST node that ends a root: that is the shortest root it starts with. If the path breaks first, no root fits.', calc: [`${roots.length} roots`] });
    words.forEach((w, k) => {
      let id = '', hit = null, broke = null;
      for (let i = 0; i < w.length; i++) { const nx = id + w[i]; if (!all[nx]) { broke = i; break; } id = nx; if (all[id].end) { hit = id; break; } }
      out[k] = hit ?? w;
      snap({ kind: hit ? 'found' : 'missing', lines: ['walk', hit ? 'hit' : 'miss'], trie: T(all, { path: pathOf(id), hit, broke, kind: hit ? 'found' : 'missing', query: `"${w}"` }), chips: chips(), title: hit ? `"${w}" → "${hit}"` : `"${w}" stays`, text: hit ? `Walking "${w}" reaches the end of the root "${hit}" after ${hit.length} letters. It is the first root on the path, so the shortest: stop and replace.` : broke !== null ? `${broke ? `"${w.slice(0, broke)}" is on a root's path, but ` : ''}no root continues with '${w[broke]}', so no root is a prefix of "${w}".` : `The whole word is on a root's path but no root ends inside it.`, calc: [hit ? `→ ${hit}` : `keep ${w}`] });
    });
    const ans = out.join(' ');
    snap({ kind: 'done', lines: [], chips: chips(), trie: T(all), out: ans, answer: `"${ans}"`, title: 'The new sentence', text: `"${ans}". Each word costs at most its own length, or the longest root, whichever is shorter. Checking every root against every word would be O(roots × length) per word.`, calc: [`"${ans}"`] });
    return steps;
  }

  if (mode === 'suggest') {
    const { products, word } = input;
    const all = buildTrie(products);
    const res = [];
    const chips = () => [{ label: 'after each letter', chips: res.map((r, k) => ({ key: k, text: `${word.slice(0, k + 1)}: ${r.length ? r.join(', ') : '—'}`, tone: k === res.length - 1 ? 'accent' : undefined })), empty: 'nothing typed yet' }];
    snap({ kind: 'build', lines: ['build'], trie: T(all, { fresh: Object.keys(all) }), chips: chips(), title: `${products.length} products, typing "${word}"`, text: 'Every product that starts with what you have typed lives under one node of the trie. Visiting children in a..z order meets those products in alphabetical order, so the first three found are the answer. Each letter typed moves one node down.', calc: [`${products.length} products`] });
    let id = '', dead = false;
    for (let k = 0; k < word.length; k++) {
      const nx = id + word[k];
      if (dead || !all[nx]) {
        const brokeHere = !dead;
        dead = true; res.push([]);
        snap({ kind: 'missing', lines: ['walk', 'none'], trie: T(all, { path: pathOf(id), broke: brokeHere ? k : null, kind: 'missing', query: `"${word.slice(0, k + 1)}"` }), chips: chips(), title: `"${word.slice(0, k + 1)}": no suggestions`, text: brokeHere ? `No product continues "${id}" with '${word[k]}'. From now on nothing can match.` : 'The path broke earlier, so a longer prefix matches nothing either.', calc: ['[]'] });
        continue;
      }
      id = nx;
      const found = [];
      const dfs = (x) => { if (found.length === 3) return; if (all[x].end) found.push(x); for (const c of kidsOf(all, x)) dfs(c); };
      dfs(id);
      res.push(found);
      snap({ kind: 'found', lines: ['walk', 'list'], trie: T(all, { path: pathOf(id), hits: found, query: `"${id}"` }), chips: chips(), title: `"${id}": ${found.join(', ')}`, text: `Move down to the node for "${id}" (${all[id].pass} product${all[id].pass === 1 ? '' : 's'} below it). Walking its children in alphabetical order, the first ${found.length === 3 ? 'three' : found.length} word end${found.length === 1 ? ' is' : 's are'} ${found.map((f) => `"${f}"`).join(', ')}${all[id].pass > 3 ? '; the rest are skipped' : ''}.`, calc: [list(found)] });
    }
    snap({ kind: 'done', lines: [], trie: T(all, { path: pathOf(id) }), chips: chips(), out: res, answer: `${res.length} lists`, title: 'Suggestions after each letter', text: 'With sorted products, a binary search for each prefix works too. The trie version moves one node per letter, and storing the top three at each node during the build makes every answer O(1).', calc: res.map((r, k) => `${word.slice(0, k + 1)}: ${list(r)}`) });
    return steps;
  }

  if (mode === 'maxxor') {
    const { nums } = input;
    const B = Math.max(1, Math.max(...nums).toString(2).length);
    const words = nums.map((x) => bitsOf(x, B));
    const all = buildTrie(words);
    Object.values(all).forEach((n) => { n.end = false; });
    words.forEach((w) => { all[w].end = true; });
    let best = 0, bestPair = [nums[0], nums[0]];
    const chips = () => [{ label: 'numbers', chips: nums.map((x, k) => ({ key: k, text: `${x} = ${words[k]}` })) }, { label: 'best', chips: [{ key: 'b', text: `${best} (${bestPair[0]} ^ ${bestPair[1]})`, tone: 'success' }] }];
    const cap = 'each level is one bit, highest first · ringed = a stored number';
    snap({ kind: 'build', lines: ['build'], trie: T(all, { fresh: Object.keys(all), caption: cap }), chips: chips(), title: `${nums.length} numbers as ${B}-bit strings`, text: 'A higher bit is worth more than all the lower bits together, so XOR is maximised greedily from the top: at each bit, try to differ from x. Store the numbers in a trie of bits, highest first; for each x, walk down taking the opposite bit whenever that child exists.', calc: words.map((w, k) => `${nums[k]} → ${w}`) });
    nums.forEach((x, k) => {
      const w = words[k];
      let id = '';
      const why = [];
      for (let i = 0; i < B; i++) {
        const want = w[i] === '0' ? '1' : '0';
        if (all[id + want]) { id += want; why.push(`bit ${B - 1 - i}: want ${want}, take it`); } else { id += w[i]; why.push(`bit ${B - 1 - i}: no ${want}, take ${w[i]}`); }
      }
      const y = parseInt(id, 2), v = x ^ y;
      const better = v > best;
      if (better) { best = v; bestPair = [x, y]; }
      snap({ kind: better ? 'found' : 'walk', lines: ['walk', 'ans'], trie: T(all, { path: pathOf(id), hit: id, caption: cap, query: `x = ${x} (${w})` }), chips: chips(), title: `${x} ^ ${y} = ${v}${better ? ': new best' : ''}`, text: `x = ${w}. ${why.join('; ')}. The walk lands on ${id} = ${y}, the stored number that differs from x in the highest bits possible. ${w} XOR ${id} = ${bitsOf(v, B)} = ${v}.`, calc: [`${x} ^ ${y} = ${v}`, `best = ${best}`] });
    });
    snap({ kind: 'done', lines: ['ans'], trie: T(all, { caption: cap }), chips: chips(), out: best, answer: `max = ${best}`, title: `Maximum XOR: ${best}`, text: `Each walk is ${B} steps, so the whole thing is O(n · bits), 31 bits in the real problem, instead of O(n²) pairs.`, calc: [`${bestPair[0]} ^ ${bestPair[1]} = ${best}`] });
    return steps;
  }

  if (mode === 'boggle') {
    const { board, words } = input;
    const R = board.length, C = board[0].length;
    const all = buildTrie(words);
    const live = Object.fromEntries(Object.values(all).map((n) => [n.id, n.end]));
    const found = [];
    const grid = (paths = [], start = null) => board.map((row, r) => [...row].map((ch, c) => {
      let b, cls = 'open';
      paths.forEach((p, pk) => { const k = p.findIndex(([a, bb]) => a === r && bb === c); if (k >= 0) { b = String(k + 1); cls = pk === 0 ? 'ring_a' : 'ring_b'; } });
      return { l: ch, b, c: [cls, start && start[0] === r && start[1] === c && 'cellCur'] };
    }));
    const chips = () => [{ label: 'found', chips: found.map((w) => ({ key: w, text: w, tone: 'success' })), empty: 'none yet' }];
    snap({ kind: 'build', lines: ['build'], trie: T(all, { fresh: Object.keys(all) }), grid: grid(), chips: chips(), title: `${words.length} words on a ${R} × ${C} board`, text: 'Searching each word separately repeats the same board walks. Instead put all the words in a trie and walk the board once per starting cell: a step to a neighbour is only allowed if its letter is a child of the current trie node, so hopeless paths stop after one letter, and every word sharing a prefix is searched together. Cells whose letter starts no word are skipped at once.', calc: [`root letters: ${kidsOf(all, '').map((k) => k).join(', ')}`] });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!all[board[r][c]]) continue;
      const visited = new Set(['']), paths = [], got = [];
      const dfs = (rr, cc, id, path, seen) => {
        if (rr < 0 || cc < 0 || rr >= R || cc >= C || seen.has(rr * C + cc)) return;
        const nx = id + board[rr][cc];
        if (!all[nx]) return;
        visited.add(nx);
        const p = [...path, [rr, cc]];
        if (live[nx]) { live[nx] = false; got.push(nx); paths.push(p); }
        seen.add(rr * C + cc);
        for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) dfs(rr + a, cc + b, nx, p, seen);
        seen.delete(rr * C + cc);
      };
      dfs(r, c, '', [], new Set());
      found.push(...got);
      const deepest = [...visited].sort((a, b) => b.length - a.length)[0];
      snap({ kind: got.length ? 'found' : 'walk', lines: got.length ? ['start', 'dfs', 'found'] : ['start', 'dfs'], trie: T(all, { path: [...visited], hits: got }), grid: grid(paths, [r, c]), chips: chips(), title: got.length ? `From (${r}, ${c}) "${board[r][c]}": found ${got.map((w) => `"${w}"`).join(', ')}` : `From (${r}, ${c}) "${board[r][c]}": nothing`, text: `"${board[r][c]}" starts a word, so search from here, moving only along trie edges. The trie nodes the search reached are highlighted (deepest: "${deepest}"). ${got.length ? `${got.map((w) => `"${w}"`).join(' and ')} ${got.length === 1 ? 'ends' : 'end'} on a path of cells (numbered). Each found word is unmarked so it is reported once.` : 'No path of neighbours spells a whole word from here.'}`, calc: [`found: ${found.length}`] });
    }
    const ans = [...found].sort();
    snap({ kind: 'done', lines: [], trie: T(all, { hits: found }), grid: grid(), chips: chips(), out: ans, answer: list(ans), title: `Found ${list(ans.map((w) => `"${w}"`))}`, text: 'One board search for all the words together, pruned by the trie. In the worst case it is O(cells · 4 · 3^(L − 1)) for words of length L, independent of how many words there are.', calc: [list(ans)] });
    return steps;
  }

  // extra characters: best[i] = fewest extra letters in s[i..]
  const { s, dict } = input, n = s.length;
  const all = buildTrie(dict);
  const best = Array(n + 1).fill(null);
  best[n] = 0;
  const strips = (i = null, bands = [], from = null) => {
    const L = { label: 's', items: [...s, '∅'], cls: {}, tags: {}, sub: {}, bands, index: true };
    const D = { label: 'best (fewest extra from here)', items: best.map((v) => (v === null ? '' : v)), cls: {}, tags: {}, sub: {}, bands: [], index: false };
    best.forEach((v, k) => { if (v === null) D.cls[k] = 'muted'; });
    if (i !== null) { L.cls[i] = 'cur'; D.cls[i] = 'cur'; }
    if (from !== null) D.cls[from] = 'hit';
    return [L, D];
  };
  snap({ kind: 'build', lines: ['build'], trie: T(all, { fresh: Object.keys(all) }), strips: strips(), title: `"${s}" with ${list(dict)}`, text: 'best[i] = the fewest extra letters in s from i to the end. Either s[i] is extra (1 + best[i + 1]), or a dictionary word starts at i and we jump past it. Walking the trie from s[i] finds every word starting at i in one pass, stopping as soon as no word continues. Fill from the right.', calc: ['best[n] = 0'] });
  for (let i = n - 1; i >= 0; i--) {
    let cand = 1 + best[i + 1], from = i + 1;
    const opts = [`skip '${s[i]}': 1 + ${best[i + 1]} = ${1 + best[i + 1]}`];
    const bands = [];
    const path = [''];
    let id = '';
    const ends = [];
    for (let j = i; j < n; j++) {
      const nx = id + s[j];
      if (!all[nx]) break;
      id = nx; path.push(id);
      if (all[id].end) { ends.push(id); bands.push({ from: i, to: j, tone: 'success', label: id }); opts.push(`"${id}": best[${j + 1}] = ${best[j + 1]}`); if (best[j + 1] < cand) { cand = best[j + 1]; from = j + 1; } }
    }
    best[i] = cand;
    snap({ kind: ends.length ? 'found' : 'walk', lines: ends.length ? ['skip', 'word'] : ['skip'], trie: T(all, { path, hits: ends, query: `from ${i}` }), strips: strips(i, bands.slice(-1), from), title: `best[${i}] = ${cand}`, text: `${ends.length ? `Walking the trie from '${s[i]}' finds ${ends.map((e) => `"${e}"`).join(' and ')} starting here.` : `The trie walk from '${s[i]}' finds no word starting here${path.length > 1 ? ` (it follows "${id}" and then stops)` : ''}.`} Options: ${opts.join('; ')}. Take the smallest.`, calc: [`best[${i}] = ${cand}`] });
  }
  snap({ kind: 'done', lines: ['ans'], trie: T(all), strips: strips(), out: best[0], answer: `extra = ${best[0]}`, title: `${best[0]} extra character${best[0] === 1 ? '' : 's'}`, text: 'Each start walks the trie at most to the longest word: O(n · L) with a trie, instead of trying every substring against a hash set (O(n²) substrings, each hashed).', calc: [`best[0] = ${best[0]}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const wordsIn = (t) => String(t ?? '').split(/[\s,]+/).filter(Boolean);
const isWord = (w, max) => new RegExp(`^[a-z]{1,${max}}$`).test(w);

export function parseTrieWalk(values, input) {
  const { mode } = input;
  if (mode === 'lcp') { const w = wordsIn(values.words); return w.length >= 1 && w.length <= 5 && w.every((x) => isWord(x, 6)) ? { input: { mode, words: w } } : { error: '1 to 5 words of up to 6 lower-case letters.' }; }
  if (mode === 'replace') {
    const roots = [...new Set(wordsIn(values.roots))], sentence = String(values.sentence ?? '').trim().replace(/\s+/g, ' ');
    if (!roots.length || roots.length > 5 || !roots.every((x) => isWord(x, 4))) return { error: '1 to 5 roots of up to 4 letters.' };
    const ws = sentence.split(' ');
    if (!sentence || ws.length > 7 || !ws.every((x) => isWord(x, 10))) return { error: 'A sentence of up to 7 lower-case words.' };
    return { input: { mode, roots, sentence } };
  }
  if (mode === 'suggest') {
    const p = [...new Set(wordsIn(values.products))], w = String(values.word ?? '').trim();
    if (!p.length || p.length > 7 || !p.every((x) => isWord(x, 6))) return { error: '1 to 7 products of up to 6 letters.' };
    if (!isWord(w, 6)) return { error: 'The typed word: up to 6 lower-case letters.' };
    return { input: { mode, products: p, word: w } };
  }
  if (mode === 'maxxor') { const a = wordsIn(values.nums).map(Number); return a.length >= 1 && a.length <= 6 && a.every((x) => Number.isInteger(x) && x >= 0 && x <= 31) ? { input: { mode, nums: a } } : { error: '1 to 6 numbers from 0 to 31.' }; }
  if (mode === 'boggle') {
    const b = String(values.board ?? '').split(/[;|\s,]+/).filter(Boolean), w = [...new Set(wordsIn(values.words))];
    if (!b.length || b.length > 4 || !b.every((r) => /^[a-z]{1,4}$/.test(r) && r.length === b[0].length)) return { error: 'Up to 4 rows of up to 4 letters, separated by ;' };
    if (!w.length || w.length > 5 || !w.every((x) => isWord(x, 5))) return { error: '1 to 5 words of up to 5 letters.' };
    return { input: { mode, board: b, words: w } };
  }
  const s = String(values.s ?? '').trim(), d = [...new Set(wordsIn(values.dict))];
  if (!isWord(s, 10)) return { error: 's: up to 10 lower-case letters.' };
  if (!d.length || d.length > 5 || !d.every((x) => isWord(x, 8))) return { error: '1 to 5 dictionary words of up to 8 letters.' };
  return { input: { mode, s, dict: d } };
}

export function trieWalkValues(input) {
  const { mode } = input;
  if (mode === 'lcp') return { words: input.words.join(', ') };
  if (mode === 'replace') return { roots: input.roots.join(', '), sentence: input.sentence };
  if (mode === 'suggest') return { products: input.products.join(', '), word: input.word };
  if (mode === 'maxxor') return { nums: input.nums.join(', ') };
  if (mode === 'boggle') return { board: input.board.join('; '), words: input.words.join(', ') };
  return { s: input.s, dict: input.dict.join(', ') };
}

export function randomTrieWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const word = (a, b, letters = 'abc') => Array.from({ length: g.int(a, b) }, () => g.pick(letters.split(''))).join('');
  if (mode === 'lcp') { const base = word(0, 3); return { mode, words: Array.from({ length: g.int(1, 4) }, () => (base + word(0, 3)).slice(0, 6) || 'a') }; }
  if (mode === 'replace') return { mode, roots: [...new Set(Array.from({ length: g.int(1, 4) }, () => word(1, 3)))], sentence: Array.from({ length: g.int(1, 6) }, () => word(1, 6)).join(' ') };
  if (mode === 'suggest') { const p = [...new Set(Array.from({ length: g.int(1, 7) }, () => word(1, 5)))]; return { mode, products: p, word: word(1, 4) }; }
  if (mode === 'maxxor') return { mode, nums: Array.from({ length: g.int(1, 6) }, () => g.int(0, 31)) };
  if (mode === 'boggle') { const R = g.int(1, 3), C = g.int(1, 4); return { mode, board: Array.from({ length: R }, () => word(C, C, 'abct')), words: [...new Set(Array.from({ length: g.int(1, 4) }, () => word(1, 4, 'abct')))] }; }
  return { mode, s: word(1, 10), dict: [...new Set(Array.from({ length: g.int(1, 4) }, () => word(1, 4)))] };
}

export const trieWalkFields = (input) => ({
  lcp: [{ name: 'words', label: 'words', placeholder: 'flower, flow, flight' }],
  replace: [{ name: 'roots', label: 'roots', placeholder: 'cat, bat, rat' }, { name: 'sentence', label: 'sentence', placeholder: 'the cattle was rattled by the battery' }],
  suggest: [{ name: 'products', label: 'products', placeholder: 'mob, mouse, money, moon, mop, mount' }, { name: 'word', label: 'typed', placeholder: 'mou', short: true }],
  maxxor: [{ name: 'nums', label: 'nums (0 to 31)', placeholder: '3, 10, 5, 8, 2' }],
  boggle: [{ name: 'board', label: 'board rows', placeholder: 'oaan; etae; ihkr; iflv' }, { name: 'words', label: 'words', placeholder: 'oath, pea, eat, rain' }],
  extra: [{ name: 's', label: 's', placeholder: 'leetscode', short: true }, { name: 'dict', label: 'dictionary', placeholder: 'leet, code, leetcode' }],
})[input.mode];

export function trieWalkDescribe(input) {
  const { mode } = input;
  if (mode === 'lcp') return list(input.words);
  if (mode === 'replace') return `roots ${list(input.roots)}`;
  if (mode === 'suggest') return `typing "${input.word}"`;
  if (mode === 'maxxor') return `nums ${list(input.nums)}`;
  if (mode === 'boggle') return `${input.board.length} × ${input.board[0].length} board, ${list(input.words)}`;
  return `"${input.s}", ${list(input.dict)}`;
}

export const trieWalkRule = {
  lcp: 'follow the single-child chain from the root until a branch or a word end',
  replace: 'stop at the first root that ends on the word\'s path',
  suggest: 'one node per letter; the first 3 word ends below it, in a..z order',
  maxxor: 'at each bit, take the opposite bit if that child exists',
  boggle: 'walk the board and the trie together; no trie child, no step',
  extra: 'best[i] = min(1 + best[i+1], best[end + 1] for each word found from i)',
};
