/**
 * Compares a learner's output with the expected output. Values are parsed JSON.
 *
 * Modes (spec.check):
 *   default          deep equality; numbers within 1e-5 (relative for large values)
 *   'any-order'      top-level list in any order
 *   'any-order-deep' lists at every level in any order (subsets, permutations, groups)
 *   'custom:<id>'    a validator below, for problems with several correct answers
 */
const close = (a, b) => Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(a), Math.abs(b));

export function deepEqual(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return close(a, b);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  return a === b;
}

const key = (v) => JSON.stringify(v);
const sortDeep = (v) => (Array.isArray(v) ? v.map(sortDeep).sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0)) : v);
const sortTop = (v) => (Array.isArray(v) ? [...v].sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0)) : v);

const isPermutation = (a, b) => Array.isArray(a) && Array.isArray(b) && deepEqual(sortTop(a), sortTop(b));

/** A level-order array ([1,null,2]) back into { val, left, right } nodes. */
function treeFrom(level) {
  if (!Array.isArray(level) || !level.length || level[0] === null) return null;
  const root = { val: level[0], left: null, right: null };
  const q = [root];
  let i = 1;
  while (q.length && i < level.length) {
    const n = q.shift();
    if (i < level.length && level[i] !== null) { n.left = { val: level[i], left: null, right: null }; q.push(n.left); }
    i++;
    if (i < level.length && level[i] !== null) { n.right = { val: level[i], left: null, right: null }; q.push(n.right); }
    i++;
  }
  return root;
}
const inorder = (n, out = []) => { if (n) { inorder(n.left, out); out.push(n.val); inorder(n.right, out); } return out; };
const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
const balanced = (n) => !n || (Math.abs(height(n.left) - height(n.right)) <= 1 && balanced(n.left) && balanced(n.right));
const sortedNums = (a) => [...a].sort((x, y) => x - y);

/**
 * Validators get (inputs: parsed test inputs, got, expected) and return true when `got` is acceptable.
 */
export const VALIDATORS = {
  // any height-balanced BST holding exactly the sorted input
  balancedBst: ([nums], got) => { const t = treeFrom(got); return deepEqual(inorder(t), nums) && balanced(t); },
  // any BST holding the old values plus val
  bstInsert: ([tree, val], got) => deepEqual(inorder(treeFrom(got)), sortedNums([...tree.filter((v) => v !== null), val])),
  // any BST holding the old values minus key
  bstDelete: ([tree, key], got) => deepEqual(inorder(treeFrom(got)), sortedNums(tree.filter((v) => v !== null && v !== key))),
  // any index i with nums[i] greater than its neighbours
  peak: ([nums], got) => {
    if (!Number.isInteger(got) || got < 0 || got >= nums.length) return false;
    const left = got === 0 ? -Infinity : nums[got - 1];
    const right = got === nums.length - 1 ? -Infinity : nums[got + 1];
    return nums[got] > left && nums[got] > right;
  },
  // a valid topological order of numCourses with prerequisites [a, b] (b before a), or [] exactly when impossible
  topoOrder: ([n, prereq], got, expected) => {
    if (!Array.isArray(got)) return false;
    if (expected.length === 0) return got.length === 0;
    if (got.length !== n || new Set(got).size !== n) return false;
    const at = new Map(got.map((c, i) => [c, i]));
    return prereq.every(([a, b]) => at.has(a) && at.has(b) && at.get(b) < at.get(a));
  },
  // any order of all items such that each item comes after its dependencies and groups stay contiguous
  sortItems: ([n, m, group, before], got, expected) => {
    if (!Array.isArray(got)) return false;
    if (expected.length === 0) return got.length === 0;
    if (got.length !== n || new Set(got).size !== n) return false;
    const at = new Map(got.map((c, i) => [c, i]));
    for (let i = 0; i < n; i++) for (const b of before[i]) if (at.get(b) > at.get(i)) return false;
    const seen = new Set();
    let prev = null;
    for (const item of got) {
      const g = group[item] === -1 ? `solo${item}` : `g${group[item]}`;
      if (g !== prev) {
        if (seen.has(g)) return false;
        seen.add(g);
        prev = g;
      }
    }
    return true;
  },
  // shuffle: each shuffle must be a permutation; reset must return the original
  shuffle: ([ops, args], got, expected) => {
    if (!Array.isArray(got) || got.length !== expected.length) return false;
    const original = args[0][0];
    return ops.every((op, i) => {
      if (op === 'shuffle') return isPermutation(got[i], original);
      if (op === 'reset') return deepEqual(got[i], original);
      return got[i] === null;
    });
  },
  // getRandom must return a value currently in the set; other results must match exactly
  randomizedSet: ([ops, args], got, expected) => {
    if (!Array.isArray(got) || got.length !== expected.length) return false;
    const live = new Map();
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      const v = args[i][0];
      if (op === 'getRandom') {
        if (!live.get(got[i])) return false;
        continue;
      }
      if (!deepEqual(got[i], expected[i])) return false;
      if (op === 'insert') live.set(v, (live.get(v) ?? 0) + 1);
      if (op === 'remove' && live.get(v)) live.set(v, live.get(v) - 1);
    }
    return true;
  },
  // getRandom on a linked list: every value must be one of the list's values
  randomNode: ([ops, args], got) => {
    if (!Array.isArray(got)) return false;
    const values = new Set(args[0][0]);
    return ops.every((op, i) => (op === 'getRandom' ? values.has(got[i]) : got[i] === null));
  },
  // rand10: n values, each 1..10, and not all the same when n is large
  rand10: ([n], got) =>
    Array.isArray(got) && got.length === n && got.every((x) => Number.isInteger(x) && x >= 1 && x <= 10) && (n < 20 || new Set(got).size > 3),
  // shortest superstring: same length as the reference and contains every word
  superstring: ([words], got, expected) =>
    typeof got === 'string' && got.length === expected.length && words.every((w) => got.includes(w)),
  // characters grouped together, groups in non-increasing frequency, same characters as the input
  frequencySort: ([s], got) => {
    if (typeof got !== 'string' || got.length !== s.length || [...got].sort().join('') !== [...s].sort().join('')) return false;
    const runs = [];
    for (let i = 0; i < got.length; ) {
      let j = i;
      while (j < got.length && got[j] === got[i]) j++;
      runs.push([got[i], j - i]);
      i = j;
    }
    return new Set(runs.map(([c]) => c)).size === runs.length && runs.every(([, n], i) => i === 0 || runs[i - 1][1] >= n);
  },
  // longest duplicate substring: any duplicated substring of the maximum length
  duplicateSubstring: ([s], got, expected) => {
    if (typeof got !== 'string' || got.length !== expected.length) return false;
    if (!got) return true;
    const first = s.indexOf(got);
    return first >= 0 && s.indexOf(got, first + 1) >= 0;
  },
  // longest palindromic substring: any palindrome of the maximum length
  palindrome: ([s], got, expected) =>
    typeof got === 'string' && got.length === expected.length && s.includes(got) && got === [...got].reverse().join(''),
  // alien dictionary: every letter used once, each ordering the sorted words imply respected; "" exactly when impossible
  alienOrder: ([words], got, expected) => {
    if (typeof got !== 'string') return false;
    if (expected === '') return got === '';
    const letters = new Set(words.join(''));
    if (got.length !== letters.size || new Set(got).size !== got.length || [...got].some((c) => !letters.has(c))) return false;
    for (let i = 0; i + 1 < words.length; i++) {
      const [a, b] = [words[i], words[i + 1]];
      const k = [...a].findIndex((c, j) => c !== b[j]);
      if (k >= 0 && k < b.length && got.indexOf(a[k]) > got.indexOf(b[k])) return false;
    }
    return true;
  },
  // build a matrix with conditions: k × k, each of 1..k once, rows above/below and columns left/right as asked; [] exactly when impossible
  matrixConditions: ([k, rows, cols], got, expected) => {
    if (!Array.isArray(got)) return false;
    if (expected.length === 0) return got.length === 0;
    if (got.length !== k || got.some((r) => !Array.isArray(r) || r.length !== k)) return false;
    const at = new Map();
    got.forEach((r, i) => r.forEach((v, j) => { if (v !== 0) at.set(v, at.has(v) ? null : [i, j]); }));
    for (let v = 1; v <= k; v++) if (!at.get(v)) return false;
    if (at.size !== k) return false;
    return rows.every(([a, b]) => at.get(a)[0] < at.get(b)[0]) && cols.every(([a, b]) => at.get(a)[1] < at.get(b)[1]);
  },
  // reorganize string: a rearrangement of s with no two equal neighbours; "" exactly when impossible
  reorganize: ([s], got, expected) => {
    if (typeof got !== 'string') return false;
    if (expected === '') return got === '';
    return got.length === s.length && [...got].sort().join('') === [...s].sort().join('') && [...got].every((c, i) => i === 0 || got[i - 1] !== c);
  },
  // longest happy string: the maximum length, at most a/b/c of each letter, never three equal letters in a row
  happyString: ([a, b, c], got, expected) => {
    if (typeof got !== 'string' || got.length !== expected.length || /[^abc]/.test(got) || /aaa|bbb|ccc/.test(got)) return false;
    const n = (ch) => got.split(ch).length - 1;
    return n('a') <= a && n('b') <= b && n('c') <= c;
  },
  // two lists (critical, pseudo-critical), each in any order
  twoSets: (_, got, expected) =>
    Array.isArray(got) && got.length === 2 && got.every(Array.isArray) && deepEqual(sortTop(got[0]), sortTop(expected[0])) && deepEqual(sortTop(got[1]), sortTop(expected[1])),
};

/** True when `got` (parsed) is an acceptable answer for this test. */
export function accept(spec, inputs, got, expected) {
  const mode = spec.check ?? 'exact';
  if (mode === 'any-order') return deepEqual(sortTop(got), sortTop(expected));
  if (mode === 'any-order-deep') return deepEqual(sortDeep(got), sortDeep(expected));
  if (mode.startsWith('custom:')) {
    const v = VALIDATORS[mode.slice(7)];
    if (!v) throw new Error(`Unknown validator ${mode}`);
    return v(inputs, got, expected);
  }
  return deepEqual(got, expected);
}

export function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}
