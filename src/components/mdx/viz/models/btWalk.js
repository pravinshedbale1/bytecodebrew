/**
 * Backtracking problems (model for <BtWalkViz>). Tree modes grow a decision tree (the same shape the
 * <BacktrackViz> stage draws: nodes, shown, recorded, cur, backFrom, pruned); grid modes (word search,
 * sudoku) return grid frames. Pure, so scripts/viz-check.mjs can test every mode against a brute force.
 */
import { list, plural, rng } from './util.js';

export const BT_WALK = {
  xor: { label: 'Subset XOR totals', input: { mode: 'xor', nums: [5, 1, 6] } },
  combos: { label: 'Combinations n = 4, k = 2', input: { mode: 'combos', n: 4, k: 2 } },
  combsum2: { label: 'Combination Sum II', input: { mode: 'combsum2', nums: [1, 2, 2, 5], target: 5 } },
  subsets2: { label: 'Subsets II', input: { mode: 'subsets2', nums: [1, 2, 2] } },
  perms2: { label: 'Permutations II', input: { mode: 'perms2', nums: [1, 1, 2] } },
  letters: { label: 'Phone letters', input: { mode: 'letters', digits: '23' } },
  parens: { label: 'Parentheses n = 3', input: { mode: 'parens', n: 3 } },
  palin: { label: 'Palindrome partitions', input: { mode: 'palin', s: 'aabb' } },
  wordbreak: { label: 'Word Break II', input: { mode: 'wordbreak', s: 'catsanddog', words: ['cat', 'cats', 'and', 'sand', 'dog'] } },
  wordbreakNo: { label: 'No sentence', input: { mode: 'wordbreak', s: 'catsandog', words: ['cats', 'dog', 'sand', 'and', 'cat'] } },
  matchsticks: { label: 'Matchsticks', input: { mode: 'matchsticks', sticks: [1, 1, 2, 2, 2] } },
  matchsticksNo: { label: 'Matchsticks: no square', input: { mode: 'matchsticks', sticks: [3, 3, 3, 3, 4] } },
  wordsearch: { label: 'Word search', input: { mode: 'wordsearch', board: ['ABCE', 'SFCS', 'ADEE'], word: 'ABCCED' } },
  wordsearchBack: { label: 'A wrong turn', input: { mode: 'wordsearch', board: ['ABCE', 'SFES', 'ADEE'], word: 'ABCESEE' } },
  sudoku: { label: 'A 4 × 4 sudoku', input: { mode: 'sudoku', board: [[1, 0, 0, 0], [0, 0, 3, 0], [0, 4, 0, 0], [0, 0, 0, 2]] } },
};

export const btWalkCode = (mode) => ({
  xor: [['record', 'total += xor(path)                       // every node is a subset'], ['loop', 'for (i = start; i < n; i++) {'], ['choose', '  path.add(nums[i]); dfs(i + 1); path.remove(last); }']],
  combos: [['record', 'if (path.size() == k) { record; return; }'], ['loop', 'for (i = start; i ≤ n − (k − path.size()) + 1; i++) {   // enough left?'], ['choose', '  path.add(i); dfs(i + 1); path.remove(last); }']],
  combsum2: [['record', 'if (remaining == 0) { record; return; }'], ['loop', 'for (i = start; i < n; i++) {'], ['dup', '  if (i > start && c[i] == c[i − 1]) continue;   // same value, same level'], ['prune', '  if (c[i] > remaining) break;'], ['choose', '  path.add(c[i]); dfs(i + 1, remaining − c[i]); path.remove(last); }']],
  subsets2: [['record', 'record a copy of path                    // every node'], ['loop', 'for (i = start; i < n; i++) {'], ['dup', '  if (i > start && nums[i] == nums[i − 1]) continue;'], ['choose', '  path.add(nums[i]); dfs(i + 1); path.remove(last); }']],
  perms2: [['record', 'if (path.size() == n) { record; return; }'], ['loop', 'for (i = 0; i < n; i++) { if (used[i]) continue;'], ['dup', '  if (i > 0 && nums[i] == nums[i − 1] && !used[i − 1]) continue;'], ['choose', '  used[i] = true; path.add(nums[i]); dfs(); undo; }']],
  letters: [['record', 'if (i == digits.length) { record; return; }'], ['loop', 'for (letter : keys[digits[i]]) {'], ['choose', '  path.add(letter); dfs(i + 1); path.remove(last); }']],
  parens: [['record', 'if (s.length == 2n) { record; return; }'], ['open', 'if (open < n) dfs(s + "(")                // an opening is always safe while some are left'], ['close', 'if (close < open) dfs(s + ")")            // only close what is open']],
  palin: [['record', 'if (start == s.length) { record; return; }'], ['loop', 'for (end = start; end < n; end++) {'], ['prune', '  if (!isPalindrome(start, end)) continue;'], ['choose', '  parts.add(s[start..end]); dfs(end + 1); parts.remove(last); }']],
  wordbreak: [['record', 'if (start == s.length) { record sentence; return; }'], ['loop', 'for (end = start + 1; end ≤ n; end++)'], ['choose', '  if (dict has s[start, end)) { words.add(it); dfs(end); words.remove(last); }'], ['dead', '  (no word fits → this branch adds nothing)']],
  matchsticks: [['record', 'if (all sticks placed) return true;'], ['loop', 'for (side = 0; side < 4; side++) {'], ['prune', '  if (sides[side] + stick > target) continue;'], ['dup', '  if (an earlier side has the same length) continue;   // same tree again'], ['choose', '  sides[side] += stick; if (dfs(i + 1)) return true; sides[side] −= stick; }']],
  wordsearch: [['start', 'for every cell: if (dfs(r, c, 0)) return true;'], ['match', 'dfs: in bounds, not on the path, board[r][c] == word[i]'], ['mark', '  mark visited; try 4 neighbours for word[i + 1]'], ['back', '  unmark (un-choose) and return false'], ['done', 'i == word.length → true']],
  sudoku: [['pick', 'find the next empty cell'], ['try', 'for d in 1..4: if (d not in its row, column or box) {'], ['place', '  place d; if (solve()) return true;'], ['undo', '  remove d; }  return false;          // no digit fits → back up']],
})[mode];

// ---------------------------------------------------------------- a decision tree grower

function grow({ root, rootLabel = '·', expand, answer, firstOnly = false }) {
  const nodes = [];
  const events = [];
  let stopped = false;
  const add = (parent, label, state, kind = 'node', why) => {
    const id = nodes.length;
    nodes.push({ id, parent, label, state, depth: parent === null ? 0 : nodes[parent].depth + 1, kind, why });
    return id;
  };
  const r = add(null, rootLabel, root);
  const go = (id, state) => {
    const a = answer(state);
    if (a) { nodes[id].record = true; events.push({ t: 'record', id }); if (firstOnly) { stopped = true; return; } if (a === 'stop') return; }
    for (const c of expand(state)) {
      if (stopped) return;
      if (c.kind && c.kind !== 'node') {
        const pid = add(id, c.label, c.state ?? state, c.kind, c.why);
        events.push({ t: c.kind, id: pid, from: id });
        if (c.stop) break;
        continue;
      }
      const ch = add(id, c.label, c.state);
      events.push({ t: 'choose', id: ch, from: id });
      go(ch, c.state);
      if (stopped) return;
      events.push({ t: 'back', id: ch, to: id });
    }
  };
  go(r, root);
  return { nodes, events };
}

/** Turn grow() events into steps: consecutive un-chooses become one step. */
function treeSteps(mode, { nodes, events }, T) {
  const steps = [];
  const shown = new Set([0]);
  const recorded = new Set();
  const found = [];
  let cur = 0;
  const light = nodes.map(({ state, ...n }) => ({ ...n, path: T.path(state) }));
  const snap = (x) => steps.push({ mode, nodes: light, shown: [...shown], recorded: [...recorded], found: [...found], cur, rows: T.rows ? T.rows(nodes[cur].state, found) : [], ...x });
  snap({ kind: 'start', lines: [], title: T.title, text: T.intro, calc: T.startCalc ?? ['path: []'] });
  let pending = [];
  const flush = () => {
    if (!pending.length) return;
    cur = pending.at(-1).to;
    snap({ kind: 'back', lines: T.backLines ?? ['choose'], backFrom: pending.map((e) => e.id), title: `Back up to ${T.where(nodes[cur].state)}`, text: `${pending.length > 1 ? 'Those branches are finished, so the calls return one after another, each undoing its own choice' : 'That branch is finished, so undo its choice'}: the path is ${T.where(nodes[cur].state)} again, ready for the next option.`, calc: [`path: ${T.where(nodes[cur].state)}`] });
    pending = [];
  };
  for (let k = 0; k < events.length; k++) {
    const e = events[k];
    if (e.t === 'back') { pending.push(e); continue; }
    flush();
    if (e.t === 'record' && e.id === 0) {
      recorded.add(0); found.push(T.fmt(nodes[0].state));
      snap({ kind: 'record', lines: ['record'], title: `Record ${T.fmt(nodes[0].state)}`, text: T.recordText(nodes[0].state), calc: [`found: ${found.length}`] });
      continue;
    }
    if (e.t !== 'choose') {
      shown.add(e.id);
      const n = nodes[e.id];
      snap({ kind: e.t === 'dup' ? 'dup' : e.t === 'dead' ? 'dead' : 'prune', lines: T.cutLines ? T.cutLines(n) : e.t === 'dup' ? ['dup'] : e.t === 'dead' ? ['dead'] : ['prune'], pruned: e.id, title: T.cutTitle(n, nodes[e.from].state), text: n.why, calc: [T.where(nodes[e.from].state)] });
      continue;
    }
    shown.add(e.id);
    cur = e.id;
    const rec = events[k + 1]?.t === 'record' && events[k + 1].id === e.id;
    if (rec) { recorded.add(e.id); found.push(T.fmt(nodes[e.id].state)); k++; }
    const st = nodes[e.id].state;
    snap({
      kind: rec ? 'record' : 'choose', lines: rec ? [...(T.chooseLines ?? ['choose']), 'record'] : (T.chooseLines ?? ['loop', 'choose']),
      title: `${T.chooseTitle(nodes[e.id], nodes[e.from].state)}${rec ? ': record' : ''}`,
      text: `${T.chooseText(nodes[e.id], nodes[e.from].state)} ${rec ? T.recordText(st) : 'Go one level deeper.'}`,
      calc: [`path: ${T.where(st)}`, `found: ${found.length}`],
    });
  }
  flush();
  cur = 0;
  snap({ kind: 'done', lines: [], answer: T.answer(found), title: T.doneTitle(found), text: T.doneText(found), calc: T.doneCalc ? T.doneCalc(found) : (found.length ? found.slice(0, 8) : ['none']) });
  return steps;
}

// ---------------------------------------------------------------- the tree modes

const sortNum = (a) => [...a].sort((x, y) => x - y);
const isPal = (s) => s === [...s].reverse().join('');
const KEYS = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
const xorOf = (a) => a.reduce((x, y) => x ^ y, 0);

const TREE = {
  xor({ nums }) {
    const t = grow({
      root: { path: [], start: 0 }, rootLabel: '[]',
      expand: ({ path, start }) => nums.slice(start).map((v, j) => ({ label: String(v), state: { path: [...path, v], start: start + j + 1 } })),
      answer: () => 'go',
    });
    const total = (found) => found.reduce((s, f) => s + Number(f.split('= ')[1]), 0);
    return treeSteps('xor', t, {
      path: (s) => s.path, where: (s) => list(s.path), fmt: (s) => `${list(s.path)} = ${xorOf(s.path)}`,
      title: `XOR of every subset of ${list(nums)}`, intro: 'Every subset has a XOR total; add them all up. Backtracking visits every subset exactly once: each node of the tree is one, built by adding a later element. (There is also a one-line shortcut, shown at the end.)',
      chooseTitle: (n) => `Add ${n.label} → ${list(n.state.path)}`, chooseText: (n) => `XOR so far: ${n.state.path.join(' ^ ')} = ${xorOf(n.state.path)}.`,
      recordText: (s) => `Every node is a subset: add ${xorOf(s.path)} to the total.`,
      chooseLines: ['loop', 'choose'], cutTitle: () => '', answer: (f) => String(total(f)),
      doneTitle: (f) => `Sum of XOR totals: ${total(f)}`,
      doneText: (f) => `${f.length} subsets. The shortcut: a bit set in any number is set in exactly half of all subset XORs, so the answer is (OR of all numbers) × 2^(n − 1) = ${nums.reduce((a, b) => a | b, 0)} × ${2 ** (nums.length - 1)} = ${nums.reduce((a, b) => a | b, 0) * 2 ** (nums.length - 1)}.`,
    });
  },
  combos({ n, k }) {
    const t = grow({
      root: { path: [], start: 1 }, rootLabel: '[]',
      expand: ({ path, start }) => {
        const out = [];
        for (let i = start; i <= n; i++) {
          if (n - i + 1 < k - path.length) { out.push({ kind: 'pruned', label: String(i), stop: true, why: `Only ${n - i + 1} number${n - i + 1 === 1 ? '' : 's'} left from ${i} up, but ${k - path.length} more are needed. This branch can never reach k = ${k}: stop the loop.` }); break; }
          out.push({ label: String(i), state: { path: [...path, i], start: i + 1 } });
        }
        return out;
      },
      answer: (s) => (s.path.length === k ? 'stop' : null),
    });
    return treeSteps('combos', t, {
      path: (s) => s.path, where: (s) => list(s.path), fmt: (s) => list(s.path),
      title: `Choose ${k} of 1..${n}`, intro: `Order doesn't matter, so only ever add a number bigger than the last one: [1, 2] is built, [2, 1] never is. A path is complete at ${k} numbers.`,
      chooseTitle: (nd) => `Add ${nd.label} → ${list(nd.state.path)}`, chooseText: (nd) => `Numbers after ${nd.label} are still available for the next slot.`,
      recordText: (s) => `${list(s.path)} has ${k} numbers: record it and return.`,
      cutTitle: (nd) => `${nd.label}: not enough numbers left`, cutLines: () => ['loop'], answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'combination')}`, doneText: () => `C(${n}, ${k}) answers. The "enough left" check cut the branches that could never fill ${k} slots.`,
    });
  },
  combsum2({ nums, target }) {
    const c = sortNum(nums);
    const t = grow({
      root: { path: [], start: 0, rem: target }, rootLabel: '[]',
      expand: ({ path, start, rem }) => {
        const out = [];
        for (let i = start; i < c.length; i++) {
          if (i > start && c[i] === c[i - 1]) { out.push({ kind: 'dup', label: String(c[i]), why: `Another ${c[i]} at the same level would start exactly the same branches as the ${c[i]} just tried: skip it to avoid duplicate answers.` }); continue; }
          if (c[i] > rem) { out.push({ kind: 'pruned', label: String(c[i]), stop: true, why: `${c[i]} is more than the ${rem} still needed, and the numbers are sorted, so every later one is too: stop.` }); break; }
          out.push({ label: String(c[i]), state: { path: [...path, c[i]], start: i + 1, rem: rem - c[i] } });
        }
        return out;
      },
      answer: (s) => (s.rem === 0 ? 'stop' : null),
    });
    return treeSteps('combsum2', t, {
      path: (s) => s.path, where: (s) => list(s.path), fmt: (s) => list(s.path),
      title: `Use ${list(c)} (each once) to make ${target}`, intro: 'Sort first. Each number can be used once, so the next level starts after it. The list has repeats, and two equal numbers at the same level would grow identical subtrees: try the first, skip the rest. Sorting also lets a too-big number stop the whole loop.',
      chooseTitle: (nd) => `Add ${nd.label} → ${list(nd.state.path)}`, chooseText: (nd) => `${nd.state.rem} still needed.`,
      recordText: (s) => `Exactly ${target}: record ${list(s.path)}.`,
      cutTitle: (nd) => (nd.kind === 'dup' ? `Skip the repeated ${nd.label}` : `${nd.label} is too big: stop`), answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'combination')}`, doneText: () => 'No duplicates were ever built, so nothing needs removing afterwards: the skip rule did it.',
    });
  },
  subsets2({ nums }) {
    const c = sortNum(nums);
    const t = grow({
      root: { path: [], start: 0 }, rootLabel: '[]',
      expand: ({ path, start }) => {
        const out = [];
        for (let i = start; i < c.length; i++) {
          if (i > start && c[i] === c[i - 1]) { out.push({ kind: 'dup', label: String(c[i]), why: `This ${c[i]} would build the same subsets as the ${c[i]} before it at this level: skip.` }); continue; }
          out.push({ label: String(c[i]), state: { path: [...path, c[i]], start: i + 1 } });
        }
        return out;
      },
      answer: () => 'go',
    });
    return treeSteps('subsets2', t, {
      path: (s) => s.path, where: (s) => list(s.path), fmt: (s) => list(s.path),
      title: `Distinct subsets of ${list(c)}`, intro: 'Sort, then build subsets as for plain Subsets, adding only later elements. Repeats cause duplicates only when two equal values are tried at the same level, so skip every equal value after the first at each level. Going deeper with the second copy is fine: that is how [2, 2] is made.',
      chooseTitle: (nd) => `Add ${nd.label} → ${list(nd.state.path)}`, chooseText: () => '',
      recordText: (s) => `${list(s.path)} is a subset: record it.`,
      cutTitle: (nd) => `Skip the repeated ${nd.label}`, answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'subset')}`, doneText: () => 'Each distinct subset appears exactly once, with no set of seen answers needed.',
    });
  },
  perms2({ nums }) {
    const c = sortNum(nums);
    const t = grow({
      root: { path: [], used: c.map(() => false) }, rootLabel: '[]',
      expand: ({ path, used }) => {
        const out = [];
        for (let i = 0; i < c.length; i++) {
          if (used[i]) continue;
          if (i > 0 && c[i] === c[i - 1] && !used[i - 1]) { out.push({ kind: 'dup', label: String(c[i]), why: `The earlier ${c[i]} isn't used yet, so this copy would start the same branch over again. Always use equal values in their original order: skip.` }); continue; }
          const u = [...used]; u[i] = true;
          out.push({ label: String(c[i]), state: { path: [...path, c[i]], used: u } });
        }
        return out;
      },
      answer: (s) => (s.path.length === c.length ? 'stop' : null),
    });
    return treeSteps('perms2', t, {
      path: (s) => s.path, where: (s) => list(s.path), fmt: (s) => list(s.path),
      title: `Distinct orderings of ${list(c)}`, intro: 'Sort, and treat equal values as if they had to be used left to right. A copy may only be placed once the copy before it is already in the path; that keeps exactly one of each set of identical orderings.',
      chooseTitle: (nd) => `Place ${nd.label} → ${list(nd.state.path)}`, chooseText: () => '',
      recordText: (s) => `All ${c.length} placed: record ${list(s.path)}.`, chooseLines: ['loop', 'choose'],
      cutTitle: (nd) => `Skip ${nd.label}: its twin comes first`, answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'permutation')}`, doneText: (f) => `${c.length}! = ${[1, 1, 2, 6, 24, 120][c.length]} orderings without the rule; ${f.length} distinct ones with it.`,
    });
  },
  letters({ digits }) {
    const t = grow({
      root: { path: '', i: 0 }, rootLabel: '·',
      expand: ({ path, i }) => [...(KEYS[digits[i]] ?? '')].map((ch) => ({ label: ch, state: { path: path + ch, i: i + 1 } })),
      answer: (s) => (digits.length && s.i === digits.length ? 'stop' : null),
    });
    return treeSteps('letters', t, {
      path: (s) => [...s.path], where: (s) => `"${s.path}"`, fmt: (s) => s.path,
      title: `Letters for "${digits}"`, intro: 'Each digit is one level of the tree, and its letters are the branches. A path is complete when every digit has a letter.',
      chooseTitle: (nd) => `${digits[nd.state.i - 1]} → ${nd.label}: "${nd.state.path}"`, chooseText: (nd) => `Digit ${digits[nd.state.i - 1]} offers ${KEYS[digits[nd.state.i - 1]]}.`,
      recordText: (s) => `Every digit has a letter: record "${s.path}".`,
      cutTitle: () => '', answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'combination')}`, doneText: (f) => `${f.length} = the product of each digit's letter count. Empty input gives no combinations at all.`,
    });
  },
  parens({ n }) {
    const t = grow({
      root: { s: '', open: 0, close: 0 }, rootLabel: '·',
      expand: ({ s, open, close }) => {
        const out = [];
        if (open < n) out.push({ label: '(', state: { s: `${s}(`, open: open + 1, close } });
        else out.push({ kind: 'pruned', label: '(', why: `All ${n} opening brackets are used: no more "(".` });
        if (close < open) out.push({ label: ')', state: { s: `${s})`, open, close: close + 1 } });
        else if (s.length < 2 * n) out.push({ kind: 'pruned', label: ')', why: `${open} opened and ${close} closed: nothing to close, a ")" here could never be matched.` });
        return out;
      },
      answer: (s) => (s.s.length === 2 * n ? 'stop' : null),
    });
    return treeSteps('parens', t, {
      path: (s) => [...s.s], where: (s) => `"${s.s}"`, fmt: (s) => s.s,
      title: `Every balanced string with ${n} pairs`, intro: 'Build the string one bracket at a time and never make a move that can\'t be fixed later. "(" is fine while some are left; ")" only while something is open. Every string that reaches length 2n is then valid, so nothing has to be checked at the end.',
      chooseTitle: (nd) => `Add ${nd.label}: "${nd.state.s}"`, chooseText: (nd) => `${nd.state.open} open, ${nd.state.close} closed.`,
      recordText: (s) => `Length ${2 * n}: "${s.s}" is balanced. Record it.`, chooseLines: ['open', 'close'], backLines: ['open', 'close'],
      cutTitle: (nd) => `No "${nd.label}" here`, cutLines: (nd) => [nd.label === '(' ? 'open' : 'close'], answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'string')}`, doneText: (f) => `${f.length} is the ${n}th Catalan number. Generating all 2^${2 * n} strings and checking them would build mostly invalid ones.`,
    });
  },
  palin({ s }) {
    const t = grow({
      root: { parts: [], start: 0 }, rootLabel: '·',
      expand: ({ parts, start }) => {
        const out = [];
        for (let end = start + 1; end <= s.length; end++) {
          const piece = s.slice(start, end);
          if (!isPal(piece)) { out.push({ kind: 'pruned', label: piece, why: `"${piece}" isn't a palindrome, so no partition can start its next piece like this.` }); continue; }
          out.push({ label: piece, state: { parts: [...parts, piece], start: end } });
        }
        return out;
      },
      answer: (st) => (st.start === s.length ? 'stop' : null),
    });
    return treeSteps('palin', t, {
      path: (st) => st.parts, where: (st) => list(st.parts.map((p) => `"${p}"`)), fmt: (st) => st.parts.join('|'),
      title: `Split "${s}" into palindromes`, intro: 'Each level cuts the next piece off the front of what is left. Try every length, keep only pieces that read the same both ways, and recurse on the rest. Reaching the end of the string means a complete partition.',
      chooseTitle: (nd) => `Cut "${nd.label}"`, chooseText: (nd) => `"${nd.label}" is a palindrome. Left to split: "${s.slice(nd.state.start)}".`,
      recordText: (st) => `Nothing left: record ${st.parts.join(' | ')}.`, chooseLines: ['loop', 'choose'],
      cutTitle: (nd) => `"${nd.label}": not a palindrome`, answer: (f) => String(f.length),
      doneTitle: (f) => `${plural(f.length, 'partition')}`, doneText: () => 'Precomputing which substrings are palindromes (a DP table) makes each check O(1).',
    });
  },
  wordbreak({ s, words }) {
    const dict = new Set(words);
    const t = grow({
      root: { parts: [], start: 0 }, rootLabel: '·',
      expand: ({ parts, start }) => {
        const out = [];
        for (let end = start + 1; end <= s.length; end++) if (dict.has(s.slice(start, end))) out.push({ label: s.slice(start, end), state: { parts: [...parts, s.slice(start, end)], start: end } });
        if (!out.length && start < s.length) out.push({ kind: 'dead', label: '✗', why: `No dictionary word starts "${s.slice(start)}": this branch can't finish a sentence.` });
        return out;
      },
      answer: (st) => (st.start === s.length ? 'stop' : null),
    });
    return treeSteps('wordbreak', t, {
      path: (st) => st.parts, where: (st) => `"${st.parts.join(' ')}"`, fmt: (st) => st.parts.join(' '),
      title: `Sentences from "${s}"`, intro: 'Each level takes a dictionary word off the front of what is left. Every word that matches opens a branch; when the string is used up, the words on the path form a sentence.',
      chooseTitle: (nd) => `Take "${nd.label}"`, chooseText: (nd) => `"${nd.label}" is in the dictionary. Left: "${s.slice(nd.state.start)}".`,
      recordText: (st) => `Nothing left: "${st.parts.join(' ')}" is a sentence.`, chooseLines: ['loop', 'choose'],
      cutTitle: () => 'Dead end', answer: (f) => String(f.length),
      doneTitle: (f) => (f.length ? `${plural(f.length, 'sentence')}` : 'No sentence'), doneText: () => 'Remembering, for each start position, the sentences of the rest (memoisation) stops the same suffix being split again from different branches.',
    });
  },
  matchsticks({ sticks }) {
    const st = [...sticks].sort((a, b) => b - a);
    const sum = st.reduce((a, b) => a + b, 0);
    const side = sum / 4;
    if (sum % 4 || st[0] > side) {
      const t = { nodes: [{ id: 0, parent: null, label: '·', state: { sides: [0, 0, 0, 0], i: 0 }, depth: 0, kind: 'node' }], events: [] };
      return treeSteps('matchsticks', t, {
        path: () => [], where: () => '[0, 0, 0, 0]', fmt: () => '', title: 'Can the sticks form a square?', intro: `Total length ${sum}. ${sum % 4 ? `${sum} isn't divisible by 4, so four equal sides are impossible.` : `Each side would be ${side}, but one stick is ${st[0]}.`} No search needed.`,
        chooseTitle: () => '', chooseText: () => '', recordText: () => '', cutTitle: () => '', answer: () => 'false', doneTitle: () => 'No square: false', doneText: () => 'A quick check before any backtracking.', doneCalc: () => ['return false'],
      });
    }
    const t = grow({
      root: { sides: [0, 0, 0, 0], i: 0 }, rootLabel: '·', firstOnly: true,
      expand: ({ sides, i }) => {
        const out = [];
        for (let j = 0; j < 4; j++) {
          const lab = `${st[i]}→${'ABCD'[j]}`;
          if (sides[j] + st[i] > side) { out.push({ kind: 'pruned', label: lab, why: `Side ${'ABCD'[j]} has ${sides[j]}; adding ${st[i]} would overshoot ${side}.` }); continue; }
          if (sides.slice(0, j).includes(sides[j])) { out.push({ kind: 'dup', label: lab, why: `Side ${'ABCD'[j]} has the same length (${sides[j]}) as an earlier side already tried: the same subtree again. Skip.` }); continue; }
          const nx = [...sides]; nx[j] += st[i];
          out.push({ label: lab, state: { sides: nx, i: i + 1 } });
        }
        return out;
      },
      answer: (s) => (s.i === st.length ? 'stop' : null),
    });
    return treeSteps('matchsticks', t, {
      path: (s) => s.sides, where: (s) => list(s.sides), fmt: (s) => list(s.sides),
      title: `Sticks ${list(st)}: four sides of ${side}?`, intro: `The total is ${sum}, so each side must be ${side}. Place the sticks one by one, longest first (they fail fastest), trying each side. A side that would overshoot is cut; a side with the same length as one already tried would repeat its subtree, so it is skipped. The first complete placement answers yes.`,
      chooseTitle: (nd) => `${nd.label}: sides ${list(nd.state.sides)}`, chooseText: (nd) => `Stick ${nd.label.split('→')[0]} goes on side ${nd.label.split('→')[1]}.`,
      recordText: () => 'Every stick is placed and no side overshot: all four are exactly the target. Return true.',
      cutTitle: (nd) => (nd.kind === 'dup' ? `${nd.label}: same as an earlier side` : `${nd.label}: too long`), answer: (f) => String(f.length > 0),
      doneTitle: (f) => (f.length ? 'A square: true' : 'No square: false'), doneText: (f) => (f.length ? 'The search stops at the first complete placement.' : 'Every branch overshot a side somewhere: no square exists.'),
      doneCalc: (f) => [`return ${f.length > 0}`],
    });
  },
};

// ---------------------------------------------------------------- grid modes

function wordsearch({ board, word }) {
  const R = board.length, C = board[0].length;
  const path = [];
  const steps = [];
  const snap = (x) => steps.push({
    grid: board.map((row, r) => [...row].map((ch, c) => { const k = path.findIndex(([a, b]) => a === r && b === c); return { l: ch, b: k >= 0 ? String(k + 1) : undefined, c: [k >= 0 ? 'ring_a' : 'open', x.cur && x.cur[0] === r && x.cur[1] === c && 'cellCur', x.bad && x.bad[0] === r && x.bad[1] === c && 'flipped'] }; })),
    rows: [{ label: 'word', chips: [...word].map((ch, i) => ({ text: ch, tone: i < path.length ? 'success' : i === path.length ? 'accent' : undefined })) }],
    ...x,
  });
  snap({ kind: 'start', lines: ['start'], title: `Find "${word}"`, text: 'Try each cell as the start. From a cell holding word[i], step to a neighbour holding word[i + 1]: up, down, left or right, never reusing a cell already on the path. When every neighbour fails, take the cell off the path (un-choose) and let the caller try another direction.', calc: [`${R} × ${C} board`] });
  let found = false;
  const dfs = (r, c, i) => {
    path.push([r, c]);
    if (i === word.length - 1) { snap({ kind: 'found', cur: [r, c], lines: ['match', 'done'], answer: 'true', title: `"${word}" found`, text: `The last letter ${word[i]} is at (${r}, ${c}). Every letter matched along a path of neighbours with no cell reused.`, calc: ['return true'] }); found = true; return true; }
    snap({ kind: 'match', cur: [r, c], lines: ['match', 'mark'], title: `${word[i]} at (${r}, ${c})`, text: `(${r}, ${c}) holds ${word[i]}, letter ${i + 1}. Mark it as used and look around for ${word[i + 1]}.`, calc: [`i = ${i}`] });
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const x = r + dr, y = c + dc;
      if (x < 0 || y < 0 || x >= R || y >= C || path.some(([a, b]) => a === x && b === y) || board[x][y] !== word[i + 1]) continue;
      if (dfs(x, y, i + 1)) return true;
    }
    path.pop();
    snap({ kind: 'back', bad: [r, c], lines: ['back'], title: `Dead end at (${r}, ${c}): un-choose`, text: `No unused neighbour of (${r}, ${c}) holds ${word[i + 1]}. Take ${word[i]} off the path so the cell is free again, and go back to try another direction.`, calc: [`path length ${path.length}`] });
    return false;
  };
  outer: for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (board[r][c] === word[0] && dfs(r, c, 0)) break outer;
  if (!found) snap({ kind: 'done', lines: ['start'], answer: 'false', title: `"${word}" isn't there`, text: 'Every start cell was tried and every path ran into a dead end.', calc: ['return false'] });
  return steps;
}

function sudoku({ board }) {
  const g = board.map((r) => [...r]);
  const given = board.map((r) => r.map((v) => v !== 0));
  const steps = [];
  let budget = 400;
  const snap = (x) => steps.push({ grid: g.map((row, r) => row.map((v, c) => ({ l: v ? String(v) : '', c: [given[r][c] ? 'src' : v ? 'ring_a' : 'open', x.cur && x.cur[0] === r && x.cur[1] === c && (x.kind === 'undo' ? 'flipped' : 'cellCur'), !v && ((r >> 1) + (c >> 1)) % 2 === 1 && 'boxTint'] }))), out: g.map((r) => [...r]), ...x });
  const ok = (r, c, d) => g[r].every((v) => v !== d) && g.every((row) => row[c] !== d) && [0, 1].every((a) => [0, 1].every((b) => g[(r & 2) + a][(c & 2) + b] !== d));
  snap({ kind: 'start', lines: [], title: 'Fill the 4 × 4 sudoku', text: 'Same rules as the 9 × 9 puzzle at a size you can watch: every row, column and 2 × 2 box holds 1 to 4 once. Take the next empty cell, try each digit that doesn\'t clash, and go on. If a later cell has no digit that fits, the earlier choice was wrong: undo it and try the next digit.', calc: [`${g.flat().filter((v) => !v).length} empty cells`] });
  const solve = () => {
    let at = null;
    for (let r = 0; r < 4 && !at; r++) for (let c = 0; c < 4; c++) if (!g[r][c]) { at = [r, c]; break; }
    if (!at) return true;
    const [r, c] = at;
    const fits = [1, 2, 3, 4].filter((d) => ok(r, c, d));
    if (!fits.length) { snap({ kind: 'dead', cur: at, lines: ['pick', 'try'], title: `(${r}, ${c}): no digit fits`, text: `Every digit 1–4 already appears in row ${r}, column ${c} or their box. Some earlier choice must be wrong: back up.`, calc: ['return false'] }); return false; }
    for (const d of fits) {
      if (--budget < 0) return false;
      g[r][c] = d;
      snap({ kind: 'place', cur: at, lines: ['try', 'place'], title: `(${r}, ${c}) = ${d}`, text: `${d} isn't in row ${r}, column ${c} or their box${fits.length > 1 ? ` (candidates here: ${fits.join(', ')})` : ' (the only candidate)'}. Place it and move on.`, calc: [`candidates: ${fits.join(', ')}`] });
      if (solve()) return true;
      g[r][c] = 0;
      snap({ kind: 'undo', cur: at, lines: ['undo'], title: `Undo (${r}, ${c}) = ${d}`, text: `Placing ${d} here led to a dead end later on. Clear the cell${fits.indexOf(d) < fits.length - 1 ? ` and try ${fits[fits.indexOf(d) + 1]}` : ' and back up further: no candidate is left here'}.`, calc: [`(${r}, ${c}) = empty`] });
    }
    return false;
  };
  const solved = solve();
  snap({ kind: 'done', lines: [], answer: solved ? 'solved' : 'no solution', title: solved ? 'Solved' : 'No solution', text: solved ? 'Every cell is filled and every row, column and box holds 1 to 4 once. Choosing the cell with the fewest candidates first (instead of the next one) cuts the search a lot on real 9 × 9 puzzles.' : 'Every option was tried.', calc: [solved ? 'board filled' : 'return false'] });
  return steps;
}

// ---------------------------------------------------------------- brute forces

const sortStr = (a) => [...a].sort();
export function btWalkAnswer(input) {
  const { mode } = input;
  const subsetsOf = (a) => Array.from({ length: 1 << a.length }, (_, m) => a.filter((__, k) => (m >> k) & 1));
  const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((v, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [v, ...p])));
  if (mode === 'xor') return String(subsetsOf(input.nums).reduce((s, a) => s + xorOf(a), 0));
  if (mode === 'combos') return sortStr(subsetsOf(Array.from({ length: input.n }, (_, i) => i + 1)).filter((a) => a.length === input.k).map(list));
  if (mode === 'combsum2') return sortStr([...new Set(subsetsOf(input.nums).filter((a) => a.reduce((x, y) => x + y, 0) === input.target).map((a) => list(sortNum(a))))]);
  if (mode === 'subsets2') return sortStr([...new Set(subsetsOf(input.nums).map((a) => list(sortNum(a))))]);
  if (mode === 'perms2') return sortStr([...new Set(perms(input.nums).map(list))]);
  if (mode === 'letters') return input.digits ? sortStr([...input.digits].reduce((acc, d) => acc.flatMap((p) => [...KEYS[d]].map((ch) => p + ch)), [''])) : [];
  if (mode === 'parens') {
    const out = [];
    for (let m = 0; m < 1 << (2 * input.n); m++) {
      const s = Array.from({ length: 2 * input.n }, (_, k) => ((m >> k) & 1 ? '(' : ')')).join('');
      let bal = 0, okk = true;
      for (const ch of s) { bal += ch === '(' ? 1 : -1; if (bal < 0) okk = false; }
      if (okk && bal === 0) out.push(s);
    }
    return sortStr(out);
  }
  if (mode === 'palin' || mode === 'wordbreak') {
    const s = input.s, n = s.length, dict = new Set(input.words ?? []);
    const out = [];
    for (let m = 0; m < 1 << (n - 1); m++) {
      const parts = []; let last = 0;
      for (let k = 1; k < n; k++) if ((m >> (k - 1)) & 1) { parts.push(s.slice(last, k)); last = k; }
      parts.push(s.slice(last));
      if (parts.every((p) => (mode === 'palin' ? isPal(p) : dict.has(p)))) out.push(parts.join(mode === 'palin' ? '|' : ' '));
    }
    return sortStr(out);
  }
  if (mode === 'matchsticks') {
    const st = input.sticks, sum = st.reduce((a, b) => a + b, 0);
    if (sum % 4) return 'false';
    for (let m = 0; m < 4 ** st.length; m++) {
      const sides = [0, 0, 0, 0]; let x = m;
      st.forEach((v) => { sides[x % 4] += v; x = Math.floor(x / 4); });
      if (sides.every((v) => v === sum / 4)) return 'true';
    }
    return 'false';
  }
  if (mode === 'wordsearch') {
    const { board, word } = input;
    const R = board.length, C = board[0].length;
    const q = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (board[r][c] === word[0]) q.push([r, c, 0, new Set([`${r},${c}`])]);
    while (q.length) {
      const [r, c, i, seen] = q.pop();
      if (i === word.length - 1) return 'true';
      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const x = r + dr, y = c + dc; if (x >= 0 && y >= 0 && x < R && y < C && !seen.has(`${x},${y}`) && board[x][y] === word[i + 1]) q.push([x, y, i + 1, new Set([...seen, `${x},${y}`])]); }
    }
    return 'false';
  }
  return null;   // sudoku: checked by validity
}

export function sudokuValid(board, got) {
  const okLine = (a) => [...a].sort().join() === '1,2,3,4';
  return got.every((row, r) => row.every((v, c) => !board[r][c] || board[r][c] === v))
    && got.every(okLine) && [0, 1, 2, 3].every((c) => okLine(got.map((row) => row[c])))
    && [0, 2].every((r) => [0, 2].every((c) => okLine([got[r][c], got[r][c + 1], got[r + 1][c], got[r + 1][c + 1]])));
}

// ---------------------------------------------------------------- dispatch, parsing, random

export function btWalk(input) {
  if (input.mode === 'wordsearch') return wordsearch(input);
  if (input.mode === 'sudoku') return sudoku(input);
  return TREE[input.mode](input);
}

const intsOf = (text) => String(text ?? '').split(/[\s,]+/).filter(Boolean).map(Number);

export function parseBtWalk(values, input) {
  const { mode } = input;
  if (['xor', 'subsets2', 'perms2', 'combsum2', 'matchsticks'].includes(mode)) {
    const nums = intsOf(values.nums);
    const max = { xor: 4, subsets2: 4, perms2: 4, combsum2: 5, matchsticks: 6 }[mode];
    if (!nums.length || nums.length > max || nums.some((v) => !Number.isInteger(v) || v < 1 || v > 20)) return { error: `1 to ${max} numbers from 1 to 20, so the tree fits.` };
    if (mode === 'combsum2') { const t = Number(values.target); if (!Number.isInteger(t) || t < 1 || t > 20) return { error: 'target from 1 to 20.' }; return { input: { mode, nums, target: t } }; }
    return { input: { mode, [mode === 'matchsticks' ? 'sticks' : 'nums']: nums } };
  }
  if (mode === 'combos') { const n = Number(values.n), k = Number(values.k); if (!Number.isInteger(n) || n < 1 || n > 5 || !Number.isInteger(k) || k < 1 || k > n) return { error: 'n from 1 to 5, k from 1 to n.' }; return { input: { mode, n, k } }; }
  if (mode === 'letters') { const d = String(values.digits ?? '').trim(); if (!/^[2-9]{0,2}$/.test(d)) return { error: 'Up to 2 digits from 2 to 9.' }; return { input: { mode, digits: d } }; }
  if (mode === 'parens') { const n = Number(values.n); if (!Number.isInteger(n) || n < 1 || n > 3) return { error: 'n from 1 to 3.' }; return { input: { mode, n } }; }
  if (mode === 'palin') { const s = String(values.s ?? '').trim(); if (!/^[a-z]{1,5}$/.test(s)) return { error: '1 to 5 lowercase letters.' }; return { input: { mode, s } }; }
  if (mode === 'wordbreak') {
    const s = String(values.s ?? '').trim(); const words = [...new Set(String(values.words ?? '').toLowerCase().split(/[\s,]+/).filter(Boolean))];
    if (!/^[a-z]{1,12}$/.test(s) || !words.length || words.length > 8 || words.some((w) => !/^[a-z]{1,8}$/.test(w))) return { error: 's up to 12 letters; up to 8 dictionary words.' };
    return { input: { mode, s, words } };
  }
  if (mode === 'wordsearch') {
    const board = String(values.board ?? '').split(/[;\s,]+/).filter(Boolean).map((r) => r.toUpperCase());
    const word = String(values.word ?? '').trim().toUpperCase();
    if (!board.length || board.length > 4 || board.some((r) => r.length !== board[0].length || r.length > 5 || !/^[A-Z]+$/.test(r)) || !/^[A-Z]{1,8}$/.test(word)) return { error: 'Up to 4 rows of up to 5 letters; a word of up to 8 letters.' };
    return { input: { mode, board, word } };
  }
  const rows = String(values.board ?? '').split(';').map((r) => r.trim().split(/[\s,]*/).filter(Boolean).map((ch) => (ch === '.' ? 0 : Number(ch))));
  if (rows.length !== 4 || rows.some((r) => r.length !== 4 || r.some((v) => !Number.isInteger(v) || v < 0 || v > 4))) return { error: '4 rows of 4 cells: digits 1–4, . for empty.' };
  return { input: { mode: 'sudoku', board: rows } };
}

export function randomBtWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const nums = (len, lo, hi) => Array.from({ length: len }, () => g.int(lo, hi));
  if (mode === 'xor') return { mode, nums: nums(g.int(1, 3), 1, 9) };
  if (mode === 'combos') { const n = g.int(1, 5); return { mode, n, k: g.int(1, n) }; }
  if (mode === 'combsum2') return { mode, nums: nums(g.int(1, 5), 1, 6), target: g.int(1, 9) };
  if (mode === 'subsets2') return { mode, nums: nums(g.int(1, 4), 1, 3) };
  if (mode === 'perms2') return { mode, nums: nums(g.int(1, 4), 1, 3) };
  if (mode === 'letters') return { mode, digits: Array.from({ length: g.int(0, 2) }, () => String(g.int(2, 9))).join('') };
  if (mode === 'parens') return { mode, n: g.int(1, 3) };
  if (mode === 'palin') return { mode, s: Array.from({ length: g.int(1, 5) }, () => g.pick(['a', 'b'])).join('') };
  if (mode === 'wordbreak') { const words = g.shuffle(['a', 'ab', 'b', 'ba', 'aa', 'bab']).slice(0, g.int(1, 4)); return { mode, s: Array.from({ length: g.int(1, 7) }, () => g.pick(['a', 'b'])).join(''), words }; }
  if (mode === 'matchsticks') return { mode, sticks: nums(g.int(1, 6), 1, 4) };
  if (mode === 'wordsearch') { const L = ['A', 'B', 'C']; const board = Array.from({ length: g.int(1, 3) }, () => Array.from({ length: 3 }, () => g.pick(L)).join('')); return { mode, board, word: Array.from({ length: g.int(1, 4) }, () => g.pick(L)).join('') }; }
  // sudoku: blank out cells of a random solved grid
  const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
  const perm = g.shuffle([1, 2, 3, 4]);
  return { mode, board: base.map((r) => r.map((v) => (g.bool(0.55) ? 0 : perm[v - 1]))) };
}
