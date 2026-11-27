/** Practice thinking walkthroughs: backtracking (format: src/data/think/index.js). */

export default {
  'sum-of-all-subset-xor-totals': {
    free: true,
    aha: 'Visit every subset once and add up its XOR. Backtracking does that with one shared path: at each node, try adding each later element, and every node of the decision tree is one subset. (There is also a shortcut: the answer is the OR of all numbers times 2^(n − 1).)',
    asks: {
      read: 'Do equal values at different positions count as different subsets?',
      budget: 'At most 12 numbers. How many subsets is that?',
      observe: 'List the subsets of [5, 1, 6] and their XOR totals.',
      brute: 'A bitmask loop over all 2ⁿ subsets works. How does backtracking build the same set?',
      pattern: 'How do you visit every subset exactly once without generating any twice?',
      watch: 'Watch every node of the tree add its XOR.',
    },
    read: [
      { phrase: 'Return the sum of the XOR totals', says: 'Visit each subset, XOR its elements, add to a running total.' },
      {
        phrase: 'Subsets with the same values but from different positions count separately',
        says: 'Positions matter: all 2ⁿ subsets count, even if values repeat.',
      },
      {
        phrase: 'or `0` if it is empty',
        says: 'The empty subset counts as a subset with total 0, so it adds nothing; the search can record every node without a special case.',
      },
    ],
    budget: {
      from: 'n ≤ 12',
      rows: [['visit every subset', '2¹² = 4096', 'ok', 'tiny'], ['OR shortcut', 'n', 'ok', 'tiny']],
      aim: 'O(2ⁿ)',
      note: 'Small enough to enumerate; the shortcut is a bonus.',
    },
    observe: [
      {
        title: 'Every subset and its XOR',
        text: '[5, 1, 6]: [] 0, [5] 5, [1] 1, [6] 6, [5,1] 4, [5,6] 3, [1,6] 7, [5,1,6] 2. Sum: 28.',
        sketch: { kind: 'array', rows: [{ items: [0, 5, 1, 6, 4, 3, 7, 2, '= 28'], marks: { '8': 'hit' } }] },
      },
      {
        title: 'Each node is a subset',
        text: 'From [], add 5, 1 or 6. From [5], add 1 or 6 (only later elements, so [1, 5] is never built twice). Every node of this tree is a different subset.',
        sketch: { kind: 'array', rows: [{ label: 'level 1', items: ['[5]', '[1]', '[6]'] }, { label: 'level 2', items: ['[5,1]', '[5,6]', '[1,6]'] }] },
      },
      {
        title: 'The shortcut',
        text: 'A bit that is set in any number appears in exactly half of the subset XORs. So the sum is (5 | 1 | 6) × 2² = 7 × 4 = 28.',
        sketch: { kind: 'array', rows: [{ items: ['OR = 7', '× 2^(n−1) = 4', '= 28'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Loop a bitmask from 0 to 2ⁿ − 1; for each, XOR the selected elements and add.',
      cost: 'O(2ⁿ · n)',
      waste: 'Each subset XOR is recomputed from scratch; the backtracking path keeps a running XOR (and the shortcut needs no enumeration at all).',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Subset backtracking: each node adds a later element and contributes its XOR. O(2ⁿ). Or the bit shortcut: OR of all × 2^(n − 1).',
      not: [
        { id: 'bit-manipulation', why: 'The shortcut is a bit argument; the enumeration is the backtracking template.' },
        { id: 'dp-made-easy', why: 'Subset sums can be DP, but XOR over all subsets is just enumeration (or the shortcut).' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [{ label: '[5, 1, 6]', input: { mode: 'xor', nums: [5, 1, 6] } }, { label: '[1, 3]', input: { mode: 'xor', nums: [1, 3] } }],
    },
    edges: ['One number: [7] → 7.', 'Two numbers: [1, 3] → 0 + 1 + 3 + 2 = 6.', 'Repeated values count separately: [2, 2] → 0 + 2 + 2 + 0 = 4.'],
  },

  'subsets': {
    aha: 'Walk a decision tree depth-first with one shared path. At each node, try adding each element after the last one used, never an earlier one, so every subset is built exactly once. Every node of the tree is a subset: record it on arrival.',
    asks: {
      read: 'Are the values distinct? Is the empty set included?',
      budget: 'Up to 10 numbers: how many subsets?',
      observe: 'Why is [2, 1] never built when [1, 2] is?',
      brute: 'Bitmasks from 0 to 2ⁿ − 1 also list every subset. How does the tree do it?',
      pattern: 'What three steps happen at every branch of a backtracking search?',
      watch: 'Watch the tree grow: choose, explore, un-choose.',
    },
    read: [
      {
        phrase: 'Return every possible subset of `nums` (the power set), including the empty subset',
        says: '2ⁿ answers, [] included: record every node.',
      },
      { phrase: 'No subset may appear twice', says: 'Only add later elements, so each set is built in one order.' },
    ],
    budget: { from: 'n ≤ 10', rows: [['every subset', '2¹⁰ · 10 ≈ 10⁴', 'ok', 'tiny']], aim: 'O(2ⁿ · n)', note: 'The output itself is that big.' },
    observe: [
      {
        title: 'Only look forward',
        text: 'After choosing 1, the next element may be 2 or 3. After choosing 2, only 3. So [1, 2] is built and [2, 1] never is.',
        sketch: { kind: 'array', rows: [{ label: 'from [1]', items: ['+2', '+3'] }, { label: 'from [2]', items: ['+3'] }] },
      },
      {
        title: 'Every node is an answer',
        text: 'The tree for [1, 2, 3] has 8 nodes: [], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]. Record each on arrival.',
        sketch: { kind: 'array', rows: [{ items: ['[]', '[1]', '[1,2]', '[1,2,3]', '[1,3]', '[2]', '[2,3]', '[3]'] }] },
      },
      {
        title: 'Un-choose',
        text: 'The path is one shared list. After exploring everything that starts with [1, 2], remove 2 before trying [1, 3]. Record a copy, because the list keeps changing.',
        sketch: { kind: 'array', rows: [{ items: ['[1,2] done', 'remove 2', 'add 3 → [1,3]'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Loop a mask from 0 to 2ⁿ − 1 and collect the elements whose bit is set.',
      cost: 'O(2ⁿ · n)',
      waste: 'Equally fast; backtracking is the template that extends to the pruned and constrained versions.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Choose / explore / un-choose: record the path at every node, loop i from start, recurse with i + 1. O(2ⁿ · n).',
      not: [
        { id: 'bit-manipulation', why: 'Bitmask enumeration is the alternative for small n.' },
        { id: 'dp-made-easy', why: 'Nothing overlaps: every subset is distinct work.' },
      ],
    },
    watch: {
      viz: 'BacktrackViz',
      inputs: [{ label: '[1, 2, 3]', input: { mode: 'subsets', nums: [1, 2, 3] } }, { label: '[0]', input: { mode: 'subsets', nums: [0] } }],
    },
    edges: ['One element: [0] → [[], [0]].', 'Two: [1, 2] → [], [1], [1,2], [2].', 'Any order: [1, 2] → [[], [1], [2], [1, 2]] in any order is accepted.'],
  },

  'combinations': {
    aha: 'A combination is a set, so only ever add a number bigger than the last one: [1, 2] is built, [2, 1] never is. A path is complete at k numbers. Prune early: if fewer numbers are left than slots to fill, the branch can never finish.',
    asks: {
      read: 'Does order matter? Can a number repeat?',
      budget: 'n ≤ 20, k ≤ n. How many answers can there be?',
      observe: 'For n = 4, k = 2, why is starting with 4 pointless?',
      brute: 'Generating all subsets and keeping those of size k: what is wasted?',
      pattern: 'How do you make sure each set is built in only one order?',
      watch: 'Watch branches with too few numbers left get cut.',
    },
    read: [
      { phrase: 'A combination is a set, not a sequence', says: 'Build in increasing order to avoid duplicates.' },
      { phrase: 'Every number is used at most once within a combination', says: 'The next level starts after the number just chosen.' },
    ],
    budget: {
      from: 'n ≤ 20',
      rows: [
        ['all 2²⁰ subsets, then filter by size', '10⁶ × 20', 'ok', 'wasteful'],
        ['only k-element branches', 'C(20, 10) ≈ 1.8 × 10⁵', 'ok', 'output-sized'],
      ],
      aim: 'O(C(n, k) · k)',
      note: 'Output-sized.',
    },
    observe: [
      {
        title: 'Increasing order only',
        text: 'n = 4, k = 2: from 1 add 2, 3 or 4; from 2 add 3 or 4; from 3 add 4. Six pairs, each built once.',
        sketch: { kind: 'array', rows: [{ items: ['[1,2]', '[1,3]', '[1,4]', '[2,3]', '[2,4]', '[3,4]'] }] },
      },
      {
        title: 'Too few left: stop',
        text: 'Starting with 4 leaves no larger number for the second slot. The loop can stop at n − (k − size) + 1.',
        sketch: { kind: 'array', rows: [{ items: ['start 4', '0 numbers left', 'need 1', 'cut'], marks: { '3': 'bad' } }] },
      },
      {
        title: 'Record at length k',
        text: 'As soon as the path holds k numbers, record a copy and return: going deeper can only make it too long.',
        sketch: { kind: 'array', rows: [{ items: ['size 2 = k', 'record', 'return'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Generate all 2ⁿ subsets of 1..n and keep those with exactly k elements.',
      cost: 'O(2ⁿ · n)',
      waste: 'Most subsets have the wrong size; the tree never grows past k and cuts branches that can\'t reach it.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Choose increasing numbers; record at size k; prune when fewer than k − size numbers remain. O(C(n, k) · k).',
      not: [
        { id: 'bit-manipulation', why: 'Bitmasks of popcount k work for small n, but enumerate everything.' },
        { id: 'dp-made-easy', why: 'No overlapping subproblems: each combination is output once.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [{ label: 'n = 4, k = 2', input: { mode: 'combos', n: 4, k: 2 } }, { label: 'n = 5, k = 3', input: { mode: 'combos', n: 5, k: 3 } }],
    },
    edges: ['k = n: n = 3, k = 3 → [[1, 2, 3]].', 'k = 1: n = 3 → [[1], [2], [3]].', 'n = 1, k = 1 → [[1]].'],
    not: { '1': [] },
  },

  'permutations': {
    aha: 'Order matters, so at every level any unused element can come next. Track which elements are used; a path is complete when it holds every element. The tree has n! leaves, one per ordering.',
    asks: {
      read: 'Are the values distinct? How many orderings are there?',
      budget: 'n ≤ 6: how many permutations?',
      observe: 'Starting with 2 in [1, 2, 3], what can come second?',
      brute: 'Generating all n-length sequences and keeping those without repeats: what is wasted?',
      pattern: 'Compared with subsets, what changes in the loop?',
      watch: 'Watch each level offer the elements not used yet.',
    },
    read: [
      {
        phrase: 'Return every possible ordering (permutation) of them',
        says: 'Every ordering must be returned: n! answers, so the search can\'t be faster than the output itself.',
      },
      { phrase: 'Each permutation uses every value of `nums` exactly once', says: 'Track used elements; complete at length n.' },
    ],
    budget: {
      from: 'n ≤ 6',
      rows: [['all nⁿ sequences, then filter', '6⁶ = 46 656', 'ok', 'wasteful'], ['only unused elements', '6! = 720', 'ok', 'output-sized']],
      aim: 'O(n! · n)',
      note: 'Output-sized.',
    },
    observe: [
      {
        title: 'Any unused element can be next',
        text: 'Starting with 2, the next element can be 1 or 3: two branches. After [2, 3], only 1 is unused, so that branch has one way to finish. The choices shrink by one per level.',
        sketch: { kind: 'array', rows: [{ label: 'after [2]', items: ['+1', '+3'] }, { label: 'after [2,3]', items: ['+1'] }] },
      },
      {
        title: 'n! leaves',
        text: '3 choices for the first slot, then 2, then 1: 3 × 2 × 1 = 6 leaves for [1, 2, 3], one per ordering. Every leaf is an answer, so nothing is wasted.',
        sketch: { kind: 'array', rows: [{ items: ['3', '× 2', '× 1', '= 6'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Un-mark when backing up',
        text: 'used[i] = true before going deeper, false after. Forgetting to reset it hides that element from every later branch.',
        sketch: { kind: 'array', rows: [{ items: ['used[2] = true', 'explore', 'used[2] = false'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Generate all nⁿ sequences of n elements and keep those that use each element once.',
      cost: 'O(nⁿ · n)',
      waste: 'Most sequences repeat an element; tracking used elements never builds them.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Loop over all elements, skip used ones, mark / recurse / unmark; record at length n. O(n! · n).',
      not: [
        { id: 'sorting-and-selection', why: 'Next-permutation can iterate orders in sequence, a different technique.' },
        { id: 'dp-made-easy', why: 'Every ordering is distinct output.' },
      ],
    },
    watch: {
      viz: 'BacktrackViz',
      inputs: [{ label: '[1, 2, 3]', input: { mode: 'perms', nums: [1, 2, 3] } }, { label: '[0, 1]', input: { mode: 'perms', nums: [0, 1] } }],
    },
    edges: ['One element: [1] → [[1]].', 'Two: [0, 1] → [[0,1],[1,0]].', 'Three distinct values → 6 permutations.'],
    not: { '1': [] },
  },

  'combination-sum': {
    aha: 'Numbers may be reused, so each level picks the same number or a later one, never an earlier one, which avoids listing [2, 3, 2] after [2, 2, 3]. Track how much is still needed. Sort first: as soon as a number is too big, every later one is too, so stop the loop.',
    asks: {
      read: 'Can a candidate be used more than once? When are two combinations the same?',
      budget: 'Up to 30 candidates, target ≤ 40. What keeps the tree small?',
      observe: 'For [2, 3, 6, 7] and target 7, why is [2, 2, 3] found only once?',
      brute: 'Trying every multiset of candidates: how big is that?',
      pattern: 'What decides where the next level\'s loop starts?',
      watch: 'Watch reuse (stay on the same index) and pruning (too big → stop).',
    },
    read: [
      { phrase: 'The same candidate may be used any number of times', says: 'Recurse with the same index i, not i + 1.' },
      {
        phrase: 'Two combinations are the same if they use the same numbers the same number of times',
        says: 'Never go back to an earlier index: one order per multiset.',
      },
    ],
    budget: {
      from: 'candidates ≤ 30, target ≤ 40',
      rows: [
        ['every count of every candidate', '∏ (target / c + 1), huge', 'bad', 'mostly overshoots'],
        ['sorted, pruned tree', 'close to the < 150 answers', 'ok', 'fits'],
      ],
      aim: 'O(answers · target)',
      note: 'Pruning keeps the tree close to the answers.',
    },
    observe: [
      {
        title: 'Same or later index',
        text: '[2, 2, 3]: choose 2, then 2 again (same index), then 3. Going back to 2 after 3 is never allowed, so [2, 3, 2] is never built.',
        sketch: { kind: 'array', rows: [{ items: ['2', '2 (reuse)', '3 (later)', '= 7'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Sorted means stop early',
        text: 'With 1 still needed, 2 is too big, so 3, 6 and 7 are too: break the loop.',
        sketch: { kind: 'array', rows: [{ items: ['need 1', '2 > 1', 'break'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Two answers',
        text: 'The search finds [2, 2, 3] and [7], each built exactly once, in increasing order. [2, 3, 2] and [3, 2, 2] are never built, because the index never goes back.',
        sketch: { kind: 'array', rows: [{ items: ['[2,2,3]', '[7]'], marks: { '0': 'hit', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each candidate, try every count from 0 to target / c, over all candidates, and keep the totals equal to target.',
      cost: 'O(∏ (target / cᵢ + 1))',
      waste: 'Most count combinations overshoot; the sorted, pruned tree stops each branch at the first number that is too big.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Sorted candidates; loop from start; recurse with the same i (reuse); break when c[i] > remaining; record at 0.',
      not: [
        { id: 'dp-knapsack', why: 'Unbounded knapsack counts the combinations; listing them needs backtracking.' },
        { id: 'dp-made-easy', why: 'Listing every combination is output-sized work.' },
      ],
    },
    watch: {
      viz: 'BacktrackViz',
      inputs: [
        { label: '[2, 3, 6, 7], 7', input: { mode: 'combsum', nums: [2, 3, 6, 7], target: 7 } },
        { label: '[2, 3, 5], 8', input: { mode: 'combsum', nums: [2, 3, 5], target: 8 } },
      ],
    },
    edges: ['No answer: [2], target 1 → [].', 'One candidate: [1], target 2 → [[1, 1]].', '[2, 3, 5], 8 → [[2,2,2,2],[2,3,3],[3,5]].'],
    not: { '1': [] },
  },

  'letter-combinations-of-a-phone-number': {
    aha: 'Each digit is one level of the tree and its letters are the branches. Walk depth-first building one string; when every digit has a letter, record it. The number of answers is the product of the letter counts.',
    asks: {
      read: 'What does an empty input return?',
      budget: 'At most 4 digits: how many strings at most?',
      observe: 'For "23", how many strings, and what is the first one?',
      brute: 'Nested loops work for a fixed number of digits. Why not in general?',
      pattern: 'What replaces an unknown number of nested loops?',
      watch: 'Watch one level per digit, one branch per letter.',
    },
    read: [
      { phrase: 'return every letter string they could spell', says: 'One letter per digit, every combination.' },
      { phrase: 'An empty `digits` string gives an empty list', says: 'Special case: [] rather than [""].' },
    ],
    budget: { from: 'digits ≤ 4', rows: [['all strings', '4⁴ = 256', 'ok', 'tiny']], aim: 'O(4ⁿ · n)', note: '7 and 9 have 4 letters.' },
    observe: [
      {
        title: 'One level per digit',
        text: '"23": level 1 picks from a, b, c; level 2 from d, e, f. 3 × 3 = 9 strings.',
        sketch: { kind: 'array', rows: [{ label: '2', items: ['a', 'b', 'c'] }, { label: '3', items: ['d', 'e', 'f'] }] },
      },
      {
        title: 'Recursion replaces nested loops',
        text: 'With k digits you would need k nested loops. The recursion is one loop per level, however many levels there are.',
        sketch: { kind: 'array', rows: [{ items: ['dfs(i)', 'loop letters of digits[i]', 'dfs(i + 1)'] }] },
      },
      {
        title: 'Complete at the last digit',
        text: 'When i reaches the number of digits, the string has one letter per digit: record it.',
        sketch: { kind: 'array', rows: [{ items: ['ad', 'ae', 'af', 'bd', '…', 'cf'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Build the list iteratively: start with [""], and for each digit append each of its letters to every string so far.',
      cost: 'O(4ⁿ · n)',
      waste: 'Equally fast; it keeps every partial string in memory, where the DFS holds only one path.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'DFS over digit positions: for each letter of digits[i], append, recurse, remove; record at the end. O(4ⁿ · n).',
      not: [
        { id: 'hashing', why: 'The digit → letters map is a lookup table; the work is the enumeration.' },
        { id: 'dp-made-easy', why: 'Every combination is output.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [{ label: '"23"', input: { mode: 'letters', digits: '23' } }, { label: '"7"', input: { mode: 'letters', digits: '7' } }],
    },
    edges: ['Empty: "" → [].', 'One digit: "2" → ["a","b","c"].', '"79" → 16 strings.'],
    not: { '1': [] },
  },

  'generate-parentheses': {
    aha: 'Build the string one bracket at a time and never make a move that can\'t be fixed later. "(" is fine while some are left; ")" only while something is open. Then every string that reaches length 2n is balanced: nothing needs checking at the end.',
    asks: {
      read: 'What makes a string well-formed?',
      budget: 'n ≤ 8: how many candidate strings, how many answers?',
      observe: 'After "((", what can come next? After "()"?',
      brute: 'Generating all 2^(2n) strings and checking each: how many are valid?',
      pattern: 'Which choices can be ruled out before they are made?',
      watch: 'Watch illegal brackets get cut before they are placed.',
    },
    read: [
      { phrase: 'no prefix has more `)` than `(`', says: 'Only add ")" while close < open.' },
      { phrase: 'made of `n` pairs of parentheses', says: 'n pairs means exactly n "(" in total: only add "(" while open < n.' },
    ],
    budget: {
      from: 'n ≤ 8',
      rows: [['all 2^(2n) strings', '65 536 × 16', 'ok', 'fits, wasteful'], ['only legal moves', 'Catalan(8) = 1430', 'ok', 'fits']],
      aim: 'O(Catalan(n) · n)',
      note: 'The number of answers is the nth Catalan number.',
    },
    observe: [
      {
        title: 'Two rules for each move',
        text: 'After "((": another "(" (one left) or ")" (two open). After "()": only "(" — nothing is open to close.',
        sketch: { kind: 'array', rows: [{ label: '"(("', items: ['(', ')'] }, { label: '"()"', items: ['(', ')✗'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Every finished string is valid',
        text: 'With those rules no prefix ever has more ")" than "(", and at length 2n all n "(" are used and closed.',
        sketch: { kind: 'array', rows: [{ items: ['((()))', '(()())', '(())()', '()(())', '()()()'] }] },
      },
      {
        title: 'Far fewer than all strings',
        text: 'n = 3: 64 strings of 6 brackets, only 5 balanced. The rules never build the other 59.',
        sketch: { kind: 'array', rows: [{ items: ['64 strings', '5 valid'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Generate every string of 2n brackets and keep the balanced ones.',
      cost: 'O(2^(2n) · n)',
      waste: 'Almost all of them are invalid; the move rules only ever build valid prefixes.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'DFS with counts: add "(" if open < n, add ")" if close < open; record at length 2n. O(Catalan(n) · n).',
      not: [
        { id: 'stack-patterns', why: 'A stack validates a given string; here strings are generated valid by construction.' },
        { id: 'dp-made-easy', why: 'A DP over pairs can build them too, but the DFS is simpler.' },
      ],
    },
    watch: { viz: 'BtWalkViz', inputs: [{ label: 'n = 3', input: { mode: 'parens', n: 3 } }, { label: 'n = 2', input: { mode: 'parens', n: 2 } }] },
    edges: ['n = 1 → ["()"].', 'n = 2 → ["(())", "()()"].', 'n = 3 → 5 strings.'],
  },

  'subsets-ii': {
    aha: 'Sort, then build subsets as usual by adding later elements. Duplicates appear only when two equal values are tried at the same level, because they start identical subtrees. So skip any value equal to the one before it at the same level; going deeper with the second copy is still fine (that builds [2, 2]).',
    asks: {
      read: 'What counts as a duplicate subset?',
      budget: 'n ≤ 10. Could you generate all and de-duplicate?',
      observe: 'For [1, 2, 2], which two choices both build [1, 2]?',
      brute: 'Generating all 2ⁿ subsets and putting them in a set: what is wasted?',
      pattern: 'Where exactly do the duplicates come from in the tree?',
      watch: 'Watch the repeated 2 skipped at the same level, but used one level deeper.',
    },
    read: [
      { phrase: '`nums` may contain duplicate values', says: 'Sort so equal values sit together.' },
      { phrase: 'Such duplicates must appear only once in the answer', says: 'Skip equal values at the same level.' },
    ],
    budget: {
      from: 'n ≤ 10',
      rows: [['generate + de-duplicate', '2¹⁰ subsets + hashing', 'ok', 'fits, wasteful'], ['skip at the same level', '≤ 2¹⁰', 'ok', 'fits']],
      aim: 'O(2ⁿ · n)',
      note: 'The skip rule never builds a duplicate.',
    },
    observe: [
      {
        title: 'Same value, same level, same subtree',
        text: 'From [1], adding the first 2 or the second 2 both give [1, 2] and identical subtrees. Keep the first, skip the second.',
        sketch: { kind: 'array', rows: [{ label: 'from [1]', items: ['+2', '+2 (twin)'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Deeper is fine',
        text: 'From [1, 2], adding the second 2 gives [1, 2, 2]: a different subset. The skip only applies to siblings, i > start.',
        sketch: { kind: 'array', rows: [{ items: ['[1,2]', '+2', '[1,2,2]'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Six distinct subsets',
        text: 'With [1, 2, 2], the search builds [], [1], [1, 2], [1, 2, 2], [2], [2, 2]: six subsets, each once. Without the skip, [1, 2] and [2] would each appear twice.',
        sketch: { kind: 'array', rows: [{ items: ['[]', '[1]', '[1,2]', '[1,2,2]', '[2]', '[2,2]'] }] },
      },
    ],
    brute: {
      idea: 'Generate all 2ⁿ subsets, sort each, and keep the distinct ones in a set.',
      cost: 'O(2ⁿ · n log n)',
      waste: 'It builds every duplicate subset (and its whole subtree) just to throw it away; skipping equal siblings never builds them.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Sorted subsets template with `if (i > start && nums[i] == nums[i − 1]) continue`; record every node. O(2ⁿ · n).',
      not: [
        { id: 'hashing', why: 'A set of seen subsets works but builds every duplicate first.' },
        { id: 'sorting-and-selection', why: 'Sorting enables the rule; the enumeration is backtracking.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [{ label: '[1, 2, 2]', input: { mode: 'subsets2', nums: [1, 2, 2] } }, { label: '[2, 2, 2]', input: { mode: 'subsets2', nums: [2, 2, 2] } }],
    },
    edges: ['All equal: [2, 2, 2] → [], [2], [2,2], [2,2,2].', 'No repeats: [1, 2] → [[], [1], [1,2], [2]], same as Subsets.', '[0] → [[], [0]].'],
  },

  'combination-sum-ii': {
    aha: 'Sort. Each position may be used once, so the next level starts after it. Because values repeat, two equal values at the same level would grow identical subtrees: try the first, skip the rest. Sorting also lets a too-big value stop the whole loop.',
    asks: {
      read: 'Can a candidate be reused? Can the list contain repeats?',
      budget: 'Up to 100 candidates, target ≤ 30. What keeps it small?',
      observe: 'For [1, 2, 2, 5] and target 5, which two choices would both make [1, 2, 2]?',
      brute: 'All subsets plus a set to de-duplicate: why wasteful?',
      pattern: 'Combine two rules you know: start after i, and skip a repeated value at the same level.',
      watch: 'Watch twins skipped and too-big numbers stop the loop.',
    },
    read: [
      {
        phrase: 'each candidate (each position) may be used at most once',
        says: 'Each position can be used once, so after choosing index i, the next level starts at i + 1.',
      },
      { phrase: 'The answer must not contain the same combination twice', says: 'Skip a value equal to the previous one at the same level.' },
    ],
    budget: {
      from: 'candidates ≤ 100, target ≤ 30',
      n: 100,
      aim: 'O(2ⁿ) worst, far less in practice',
      note: 'Pruning by remaining and by duplicates keeps the tree small.',
    },
    observe: [
      {
        title: 'Twins at one level',
        text: 'From [1], the first 2 leads to [1, 2, 2]. The second 2 at the same level would lead there again: skip.',
        sketch: { kind: 'array', rows: [{ label: 'from [1]', items: ['+2', '+2 twin', '+5'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Too big: stop',
        text: 'From [1, 2] with 2 needed: the next 2 fits (→ [1, 2, 2]); 5 is too big, and so is everything after it.',
        sketch: { kind: 'array', rows: [{ items: ['need 2', '+2 ✓', '+5 ✗ break'], marks: { '1': 'hit', '2': 'bad' } }] },
      },
      {
        title: 'Answers',
        text: 'For [10, 1, 2, 7, 6, 1, 5] and target 8, the search returns [1, 1, 6], [1, 2, 5], [1, 7], [2, 6], each once, though the two 1s could make [1, 7] twice.',
        sketch: { kind: 'array', rows: [{ items: ['[1,2,2]', '[5]'], marks: { '0': 'hit', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Enumerate all 2ⁿ subsets of positions, keep those summing to target, and de-duplicate by sorted value lists.',
      cost: 'O(2ⁿ · n)',
      waste: '2¹⁰⁰ subsets; pruning and twin-skipping never build the useless ones.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Sorted; loop from start; skip i > start with c[i] == c[i − 1]; break when c[i] > remaining; recurse with i + 1.',
      not: [
        { id: 'dp-knapsack', why: '0/1 knapsack can count; listing unique combinations needs the search.' },
        { id: 'hashing', why: 'De-duplicating with a set builds every duplicate first.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [
        { label: '[1, 2, 2, 5], 5', input: { mode: 'combsum2', nums: [1, 2, 2, 5], target: 5 } },
        { label: '[1, 1, 2, 5, 6], 8', input: { mode: 'combsum2', nums: [1, 1, 2, 5, 6], target: 8 } },
      ],
    },
    edges: [
      'No answer: [3], target 2 → [].',
      'All equal: [2, 2, 2], target 4 → [[2, 2]].',
      'Target equals one candidate → that candidate alone (plus any others).',
    ],
  },

  'permutations-ii': {
    aha: 'Sort, and treat equal values as if they must be placed in their original order: a copy may only be used after the copy before it is already in the path. That keeps exactly one of each group of identical orderings, without any set.',
    asks: {
      read: 'When do two permutations count as the same?',
      budget: 'n ≤ 8: 8! = 40 320 before de-duplication.',
      observe: 'For [1, 1, 2], why do the two 1s produce the same orderings twice?',
      brute: 'All n! permutations into a set: what is wasted?',
      pattern: 'What rule makes equal values interchangeable only one way?',
      watch: 'Watch a twin skipped while its earlier copy is still unused.',
    },
    read: [
      { phrase: '`nums` may contain duplicate values', says: 'Sort so equal values sit together.' },
      {
        phrase: 'Two permutations that list the same values in the same order count once',
        says: 'Equal values are interchangeable: fix their relative order.',
      },
    ],
    budget: {
      from: 'n ≤ 8',
      rows: [['all n! + set', '40 320 · 8', 'ok', 'fits, wasteful'], ['twin rule', 'distinct only', 'ok', 'fits']],
      aim: 'O(n! · n)',
      note: 'The rule avoids building duplicates.',
    },
    observe: [
      {
        title: 'Equal values swap invisibly',
        text: 'Call the two 1s 1a and 1b. [1a, 1b, 2] and [1b, 1a, 2] print identically, and so do their whole subtrees. Only one of each such pair should be built.',
        sketch: { kind: 'array', rows: [{ items: ['1a 1b 2', '1b 1a 2', 'same'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Use twins left to right',
        text: 'Skip nums[i] if it equals nums[i − 1] and nums[i − 1] is not used yet. So 1b can only be placed after 1a.',
        sketch: { kind: 'array', rows: [{ items: ['1a unused', '→ skip 1b'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Three distinct orderings',
        text: 'With the rule, [1, 1, 2] gives exactly [1, 1, 2], [1, 2, 1], [2, 1, 1]: 3 = 3! / 2! orderings, none repeated.',
        sketch: { kind: 'array', rows: [{ items: ['[1,1,2]', '[1,2,1]', '[2,1,1]'] }] },
      },
    ],
    brute: {
      idea: 'Generate all n! permutations and keep the distinct ones in a set.',
      cost: 'O(n! · n)',
      waste: 'With many repeats most permutations are duplicates built only to be discarded.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Sorted permutations with used[]; skip i when nums[i] == nums[i − 1] && !used[i − 1]. Record at length n.',
      not: [
        { id: 'hashing', why: 'A set de-duplicates after the fact.' },
        { id: 'sorting-and-selection', why: 'Next-permutation on sorted input also lists distinct orders in sequence.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [{ label: '[1, 1, 2]', input: { mode: 'perms2', nums: [1, 1, 2] } }, { label: '[1, 2, 2, 3]', input: { mode: 'perms2', nums: [1, 2, 2, 3] } }],
    },
    edges: ['All equal: [1, 1, 1] → [[1,1,1]].', 'Distinct values: [1, 2] → [[1,2],[2,1]], same as Permutations.', '[1, 1, 2] → 3 orderings.'],
    not: { '1': [] },
  },

  'palindrome-partitioning': {
    aha: 'Each level cuts the next piece off the front of what is left. Try every length, keep only pieces that are palindromes, and recurse on the rest. When nothing is left, the pieces on the path are a partition. Precomputing which substrings are palindromes makes each check O(1).',
    asks: {
      read: 'What must every piece be? Must the pieces cover all of s?',
      budget: 'Length ≤ 16. How many ways to cut a string?',
      observe: 'For "aab", which first pieces are allowed?',
      brute: 'Trying all 2^(n−1) cut patterns: what is checked again and again?',
      pattern: 'What does each level of the tree decide?',
      watch: 'Watch non-palindrome prefixes get cut.',
    },
    read: [
      { phrase: 'such that every piece is a palindrome', says: 'Only palindromic prefixes open a branch.' },
      { phrase: 'joined back together, give `s` exactly', says: 'Pieces are consecutive: each level cuts from where the last ended.' },
    ],
    budget: {
      from: 'length ≤ 16',
      rows: [['all cut patterns', '2¹⁵ · 16', 'ok', 'fits'], ['DFS + palindrome table', 'answers · n', 'ok', 'fits']],
      aim: 'O(n · 2ⁿ)',
      note: 'The output can be exponential ("aaaa…").',
    },
    observe: [
      {
        title: 'Cut a palindrome off the front',
        text: '"aabb": "a" and "aa" are palindromes; "aab" and "aabb" are not, so they are cut.',
        sketch: { kind: 'array', rows: [{ items: ['a ✓', 'aa ✓', 'aab ✗', 'aabb ✗'], marks: { '2': 'bad', '3': 'bad' } }] },
      },
      {
        title: 'Recurse on the rest',
        text: 'After cutting "aa", the rest "bb" is the same problem again: cut "b" (then "b") or cut "bb" (done). Each cut that is a palindrome opens a branch.',
        sketch: { kind: 'array', rows: [{ items: ['aa | b | b', 'aa | bb'] }] },
      },
      {
        title: 'Four partitions of "aabb"',
        text: 'All branches together give four partitions of "aabb": a|a|b|b, a|a|bb, aa|b|b, aa|bb. Cuts like "aab" were never explored.',
        sketch: { kind: 'array', rows: [{ items: ['a|a|b|b', 'a|a|bb', 'aa|b|b', 'aa|bb'] }] },
      },
    ],
    brute: {
      idea: 'Try every one of the 2^(n−1) ways to place cuts and keep those whose pieces are all palindromes.',
      cost: 'O(2ⁿ · n)',
      waste: 'A non-palindrome first piece is rechecked in every pattern that starts with it; the DFS rejects it once.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'DFS over start positions; for each end, recurse if s[start..end] is a palindrome (table lookup); record at the end of s.',
      not: [
        { id: 'dp-made-easy', why: 'A DP table speeds up the palindrome checks; the listing is backtracking.' },
        { id: 'two-pointers', why: 'Two pointers check one palindrome; the search decides the cuts.' },
      ],
    },
    watch: { viz: 'BtWalkViz', inputs: [{ label: '"aabb"', input: { mode: 'palin', s: 'aabb' } }, { label: '"aab"', input: { mode: 'palin', s: 'aab' } }] },
    edges: ['One letter: "a" → [["a"]].', 'All distinct: "abc" → [["a","b","c"]].', '"aab" → [["a","a","b"],["aa","b"]].'],
  },

  'word-search': {
    aha: 'Try each cell as the start. From a cell holding word[i], step to a neighbour holding word[i + 1] that isn\'t already on the path. Mark a cell when you step onto it and unmark it when you back out, so another path can use it later.',
    asks: {
      read: 'Can cells be reused? Do diagonals count?',
      budget: '6 × 6 board, word ≤ 15. How many paths could there be?',
      observe: 'In the example, after A-B-C, which C comes next for "ABCCED"?',
      brute: 'Listing every path of the word\'s length: why is that wasteful?',
      pattern: 'What do you undo when a direction fails?',
      watch: 'Watch the path grow, hit a dead end, and back up.',
    },
    read: [
      { phrase: 'using each cell at most once', says: 'Mark cells on the current path; unmark on the way back.' },
      {
        phrase: 'never diagonally',
        says: 'Moves are up, down, left and right only: each step has four neighbours (three new ones, since you can\'t step back onto the path).',
      },
    ],
    budget: {
      from: '6 × 6 board, word ≤ 15',
      rows: [
        ['every path of length L', '36 × 4¹⁵ ≈ 3.9 × 10¹⁰', 'bad', 'impossible'],
        ['DFS stopping at the first wrong letter', 'far fewer', 'ok', 'fits'],
      ],
      aim: 'O(m·n · 3^L)',
      note: 'After the first step each cell has at most 3 new neighbours.',
    },
    observe: [
      {
        title: 'Grow while letters match',
        text: 'A(0,0) → B(0,1) → C(0,2) → C(1,2) → E(2,2) → D(2,1): every step matches the next letter.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'B', 'C', 'C', 'E', 'D'], marks: { '5': 'hit' } }] },
      },
      {
        title: 'Back out of dead ends',
        text: 'When no unused neighbour holds the next letter, remove the current cell from the path and return false: the caller tries its next direction.',
        sketch: { kind: 'array', rows: [{ items: ['…E', 'no S nearby', 'unmark, back'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Unmark so others can use it',
        text: 'A cell that failed on one path may be exactly what another path needs. Marking is temporary.',
        sketch: { kind: 'array', rows: [{ items: ['mark', 'explore', 'unmark'] }] },
      },
    ],
    brute: {
      idea: 'Enumerate every path of length L on the board and compare its letters with the word.',
      cost: 'O(m·n · 4^L)',
      waste: 'Most paths fail at the first letter that differs; DFS stops right there.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'DFS from each cell matching word[0]; mark, try 4 neighbours for word[i + 1], unmark on failure. O(m·n · 3^L).',
      not: [
        { id: 'graph-traversal', why: 'Plain flood fill marks cells permanently; here marks are undone on the way back.' },
        { id: 'tries', why: 'A trie helps when searching many words (Word Search II).' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [
        { label: '"ABCCED"', input: { mode: 'wordsearch', board: ['ABCE', 'SFCS', 'ADEE'], word: 'ABCCED' } },
        { label: 'a wrong turn first', input: { mode: 'wordsearch', board: ['ABCE', 'SFES', 'ADEE'], word: 'ABCESEE' } },
        { label: '"ABCB" (reuse needed)', input: { mode: 'wordsearch', board: ['ABCE', 'SFCS', 'ADEE'], word: 'ABCB' } },
      ],
    },
    edges: ['Cell reuse needed: "ABCB" → false.', 'One letter present: "A" → true.', 'Word longer than the board → false.'],
  },

  'matchsticks-to-square': {
    aha: 'The total must be divisible by 4; each side is total / 4. Place the sticks one at a time on one of four sides, longest first because they fail fastest. Cut a side that would overshoot, and skip a side whose length equals one already tried: it would grow the same subtree.',
    asks: {
      read: 'Must all sticks be used? Can a stick be broken?',
      budget: 'Up to 15 sticks: 4¹⁵ assignments without pruning.',
      observe: 'For [3, 3, 3, 3, 4], why is it impossible even though 16 is divisible by 4?',
      brute: 'Trying every side for every stick: how many is that?',
      pattern: 'Which choices are pointless to try twice?',
      watch: 'Watch overshooting sides cut and equal sides skipped.',
    },
    read: [
      { phrase: 'using **all** of them, each exactly once', says: 'Every stick goes on exactly one side.' },
      { phrase: 'You may not break a matchstick', says: 'A stick longer than total / 4 makes it impossible at once.' },
      { phrase: 'the four 3s cannot make three sides of 4', says: 'Divisibility is necessary, not sufficient: you have to search.' },
    ],
    budget: {
      from: 'sticks ≤ 15',
      rows: [['no pruning', '4¹⁵ ≈ 10⁹', 'bad', 'too slow'], ['sorted + overshoot + equal-side skip', 'small in practice', 'ok', 'fits']],
      aim: 'O(4ⁿ) worst',
      note: 'Bitmask DP over subsets is the guaranteed O(2ⁿ · n) alternative.',
    },
    observe: [
      {
        title: 'Quick checks first',
        text: 'Total 16 → side 4. A stick of 5 would be impossible straight away; a total of 15 too.',
        sketch: { kind: 'array', rows: [{ items: ['16 / 4 = 4', 'longest 4 ≤ 4', 'search'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Overshoot: cut',
        text: '[3, 3, 3, 3, 4]: the 4 fills side A; each 3 takes a fresh side (B, C, D). The last 3 fits nowhere: every side would pass 4.',
        sketch: { kind: 'array', rows: [{ items: ['A 4', 'B 3', 'C 3', 'D 3', '3 → ✗'], marks: { '4': 'bad' } }] },
      },
      {
        title: 'Equal sides are interchangeable',
        text: 'If sides B and C are both 0, putting a stick on C grows exactly the same tree as putting it on B. Skip C.',
        sketch: { kind: 'array', rows: [{ items: ['B = 0', 'C = 0', 'skip C'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try all 4ⁿ ways to assign each stick to a side and check whether every side equals total / 4.',
      cost: 'O(4ⁿ · n)',
      waste: 'Billions of assignments; sorting, overshoot cuts and the equal-side skip remove almost all of them.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Sort descending; place stick i on each side with room, skipping sides equal to an earlier side; true when all are placed. Exponential worst case, tiny in practice.',
      not: [
        { id: 'dp-knapsack', why: 'Bitmask DP over subsets also works (O(2ⁿ · n)).' },
        { id: 'greedy', why: 'Filling sides greedily can paint itself into a corner.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [
        { label: '[1, 1, 2, 2, 2]', input: { mode: 'matchsticks', sticks: [1, 1, 2, 2, 2] } },
        { label: '[3, 3, 3, 3, 4]', input: { mode: 'matchsticks', sticks: [3, 3, 3, 3, 4] } },
      ],
    },
    edges: ['Total not divisible by 4: [1, 1, 1] → false.', 'A stick longer than a side: [1, 1, 1, 5] → false.', 'Four equal sticks: [2, 2, 2, 2] → true.'],
  },

  'n-queens': {
    aha: 'Place one queen per row, top to bottom. In each row try every column that no earlier queen attacks: same column, or either diagonal. If no column is safe, back up and move the queen in the row above. Track used columns and diagonals in sets so each check is O(1).',
    asks: {
      read: 'Which squares does a queen attack?',
      budget: 'n ≤ 9. How many ways to place n queens without any rule?',
      observe: 'On a 4 × 4 board, why can\'t the first queen go in a corner and lead to a solution?',
      brute: 'Trying every set of n squares: how many?',
      pattern: 'What does "one queen per row" remove from the search?',
      watch: 'Watch queens placed row by row, and lifted at dead ends.',
    },
    read: [
      {
        phrase: 'no two share a row, a column or a diagonal',
        says: 'One per row by construction; check columns and the two diagonals (r − c and r + c).',
      },
      { phrase: 'Return every distinct solution', says: 'Don\'t stop at the first: record and keep searching.' },
    ],
    budget: {
      from: 'n ≤ 9',
      rows: [['any n squares', 'C(81, 9) ≈ 2.6 × 10¹¹', 'bad', 'no'], ['one per row + checks', '< 9! with heavy pruning', 'ok', 'fits']],
      aim: 'O(n!)',
      note: 'Pruning keeps it far below n!.',
    },
    observe: [
      {
        title: 'One queen per row',
        text: 'Two queens in one row attack each other, so each row holds exactly one. The search only chooses a column per row.',
        sketch: { kind: 'array', rows: [{ items: ['row 0: col ?', 'row 1: col ?', 'row 2: col ?', 'row 3: col ?'] }] },
      },
      {
        title: 'Diagonals by r − c and r + c',
        text: 'Squares on one "\\" diagonal share r − c; on one "/" diagonal they share r + c. Three sets answer "attacked?" instantly.',
        sketch: { kind: 'array', rows: [{ items: ['cols', 'r − c', 'r + c'] }] },
      },
      {
        title: 'Back up when stuck',
        text: '4 × 4: queens at (0,0) and (1,2) leave no safe square in row 2. Lift the row-1 queen and try (1,3).',
        sketch: { kind: 'array', rows: [{ items: ['(0,0)', '(1,2)', 'row 2: none', 'back'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Try every set of n squares and check that no two queens attack each other.',
      cost: 'O(C(n², n) · n²)',
      waste: 'Almost every set has two queens in one row; placing row by row with attack checks never builds them.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Row-by-row placement with column and diagonal sets; record each full board, undo, continue. O(n!) worst.',
      not: [
        { id: 'bit-manipulation', why: 'Bitmasks speed up the attack checks; the search is the same.' },
        { id: 'dp-made-easy', why: 'No overlapping subproblems to reuse.' },
      ],
    },
    watch: { viz: 'QueensViz', inputs: [{ label: '4 queens', input: { n: 4 } }, { label: '5 queens (first answer)', input: { n: 5, first: true } }] },
    edges: ['n = 1 → [["Q"]].', 'n = 2 or 3 → no solutions.', 'n = 4 → 2 solutions.'],
    not: { '1': [] },
  },

  'sudoku-solver': {
    aha: 'Take the next empty cell and try each digit that isn\'t already in its row, column or box. Place it and continue with the next cell. If some later cell has no digit that fits, an earlier choice was wrong: undo and try the next digit. Choosing the cell with the fewest options first makes it far faster.',
    asks: {
      read: 'Which three groups must each hold every digit once?',
      budget: 'Up to 81 cells × 9 digits. Is plain trial and error OK?',
      observe: 'What should happen when a cell has no digit left that fits?',
      brute: 'Trying all digits in all empty cells: how many boards?',
      pattern: 'Choose a digit, explore, undo: which template is this?',
      watch: 'Watch a 4 × 4 version (2 × 2 boxes): placements, a dead end, and undo.',
    },
    read: [
      {
        phrase: 'each row, each column and each of the nine 3 × 3 boxes contains every digit 1–9 exactly once',
        says: 'A digit fits a cell when it is in none of its row, column or box.',
      },
      { phrase: 'The puzzle has exactly one solution', says: 'Stop at the first complete board.' },
      { phrase: 'Change the board in place', says: 'Place digits on the board; undo by writing "." back.' },
    ],
    budget: {
      from: '81 cells, digits 1–9',
      rows: [['all fillings', '9^empty', 'bad', 'astronomical'], ['backtracking with checks', 'fast on real puzzles', 'ok', 'fits']],
      aim: 'Exponential worst, fast in practice',
      note: 'Row/column/box sets (or bitmasks) make each check O(1).',
    },
    observe: [
      {
        title: 'Candidates for a cell',
        text: 'In the 4 × 4 example, (0, 1) sees 1 in its row and 4 in its column: candidates 2 and 3.',
        sketch: { kind: 'array', rows: [{ items: ['row has 1', 'column has 4', '→ 2 or 3'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'A dead end means undo',
        text: 'If a later cell has every digit blocked, the board so far can\'t be completed. Remove the last placement and try its next candidate.',
        sketch: { kind: 'array', rows: [{ items: ['place', '…', 'no digit fits', 'undo'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Fewest options first',
        text: 'Picking the empty cell with the fewest candidates makes wrong guesses rarer: a cell with one candidate is no guess at all.',
        sketch: { kind: 'array', rows: [{ items: ['1 candidate: forced', '4 candidates: guess'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Fill every empty cell with every possible digit and check each complete board.',
      cost: 'O(9^empty)',
      waste: 'Checks only at the very end; backtracking rejects a digit as soon as it clashes.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'Find an empty cell; for each digit that fits (row, column, box sets), place, recurse, undo; return on the first full board.',
      not: [
        { id: 'bit-manipulation', why: 'Bitmasks per row/column/box make the checks O(1); the search is backtracking.' },
        { id: 'matrix-simulation', why: 'The board is a matrix, but filling it is a search with undo.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [
        { label: 'a 4 × 4 version', input: { mode: 'sudoku', board: [[1, 0, 0, 0], [0, 0, 3, 0], [0, 4, 0, 0], [0, 0, 0, 2]] } },
        { label: 'another 4 × 4', input: { mode: 'sudoku', board: [[0, 0, 0, 4], [0, 0, 0, 0], [2, 0, 0, 3], [4, 0, 1, 2]] } },
      ],
    },
    edges: [
      'Already full → returned unchanged at once.',
      'One empty cell: its only candidate → done.',
      'A wrong early guess → undone when a later cell has no candidate.',
    ],
  },

  'n-queens-ii': {
    aha: 'Exactly N-Queens, but count instead of building boards. Place one queen per row in a safe column (checking column and both diagonals), recurse, and add 1 each time row n is reached.',
    asks: {
      read: 'What is returned: boards or a number?',
      budget: 'n ≤ 9. Same search as N-Queens?',
      observe: 'How many ways for n = 4?',
      brute: 'All placements of n queens: how many?',
      pattern: 'What changes from N-Queens when you only count?',
      watch: 'Watch the 4 × 4 search find both arrangements.',
    },
    read: [
      { phrase: 'Return the number of distinct ways to do it', says: 'Increment a counter at row n; no strings to build.' },
      { phrase: 'no two share a row, a column or a diagonal', says: 'Same attack checks: columns, r − c, r + c.' },
    ],
    budget: {
      from: 'n ≤ 9',
      rows: [
        ['choose any 9 of 81 squares', 'C(81, 9) ≈ 2.6 × 10¹¹', 'bad', 'impossible'],
        ['one queen per row, safe squares only', '< 9! = 362 880', 'ok', 'fits'],
      ],
      aim: 'O(n!)',
      note: 'Bitmasks for the three attack sets make it very fast.',
    },
    observe: [
      {
        title: 'Same search, a counter',
        text: 'Reaching row n means every row has a safe queen: count += 1, then undo and keep searching.',
        sketch: { kind: 'array', rows: [{ items: ['row n reached', 'count++', 'undo'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'n = 4 has two',
        text: 'For n = 4 the search reaches row 4 twice: columns per row [1, 3, 0, 2] and [2, 0, 3, 1]. They are mirror images, and every other branch dies before the last row.',
        sketch: { kind: 'array', rows: [{ items: ['[1,3,0,2]', '[2,0,3,1]'], marks: { '0': 'hit', '1': 'hit' } }] },
      },
      {
        title: 'Known counts',
        text: 'Counts for n = 1 … 9: 1, 0, 0, 2, 10, 4, 40, 92, 352. They are small and irregular: no formula, so the search is the method.',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 0, 2, 10, 4, 40, 92, 352] }] },
      },
    ],
    brute: {
      idea: 'Try every way to choose n squares and count the ones with no attacks.',
      cost: 'O(C(n², n) · n²)',
      waste: 'Almost all choices put two queens in one row or column; row-by-row placement skips them.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'N-Queens search counting complete placements; three sets (or bitmasks) for attacks. O(n!).',
      not: [
        { id: 'bit-manipulation', why: 'The fastest versions use bitmasks for the attack sets.' },
        { id: 'dp-made-easy', why: 'Placements don\'t share reusable subproblems.' },
      ],
    },
    watch: { viz: 'QueensViz', inputs: [{ label: '4 queens', input: { n: 4 } }, { label: '5 queens: count all', input: { n: 5 } }] },
    edges: ['n = 1 → 1.', 'n = 2, 3 → 0.', 'n = 4 → 2.'],
    not: { '1': [] },
  },

  'word-break-ii': {
    aha: 'Each level takes a dictionary word off the front of what is left. Every word that matches opens a branch; when the string is used up, the words on the path are one sentence. Memoise by start position, so a suffix that was already split isn\'t split again from another branch.',
    asks: {
      read: 'Can a dictionary word be reused? What if nothing fits?',
      budget: 'Length ≤ 20, dictionary ≤ 1000. Why does memoisation matter?',
      observe: 'For "catsanddog", what are the two ways to start?',
      brute: 'Trying every way to cut the string: how many cut patterns?',
      pattern: 'What does each level of the tree decide?',
      watch: 'Watch words come off the front, and dead ends where none fits.',
    },
    read: [
      { phrase: 'every word is in `wordDict`', says: 'Only dictionary prefixes open a branch.' },
      { phrase: 'A dictionary word may be used more than once', says: 'No used-set; the dictionary is a lookup.' },
      { phrase: 'Return **all** such sentences', says: 'Enumerate; the output itself can be large.' },
    ],
    budget: {
      from: 'length ≤ 20, dictionary ≤ 1000',
      rows: [['all cut patterns', '2¹⁹ ≈ 5 × 10⁵', 'ok', 'fits'], ['DFS + memo by start', 'n² + output', 'ok', 'fits']],
      aim: 'O(n² + output)',
      note: 'Memoising suffix sentences avoids redoing shared suffixes.',
    },
    observe: [
      {
        title: 'Two ways to start',
        text: '"catsanddog": "cat" and "cats" are both words. Each opens its own branch.',
        sketch: { kind: 'array', rows: [{ items: ['cat | sanddog', 'cats | anddog'] }] },
      },
      {
        title: 'Each branch finishes',
        text: 'Both branches finish: "cat" → "sand" → "dog" and "cats" → "and" → "dog". Each complete path is one sentence: "cat sand dog" and "cats and dog".',
        sketch: { kind: 'array', rows: [{ items: ['cat sand dog', 'cats and dog'], marks: { '0': 'hit', '1': 'hit' } }] },
      },
      {
        title: 'Dead ends',
        text: '"catsandog": after "cat sand" or "cats and" the rest is "og", and no word starts it. No sentence at all.',
        sketch: { kind: 'array', rows: [{ items: ['… og', 'no word', 'dead end'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Try every one of the 2^(n−1) ways to place spaces and keep those whose pieces are all words.',
      cost: 'O(2ⁿ · n)',
      waste: 'A non-word first piece is retried in every pattern that starts with it; the DFS only follows words.',
    },
    pattern: {
      pick: 'backtracking',
      why: 'DFS over start positions taking dictionary prefixes; record at the end; memoise sentences per start position. O(n² + output).',
      not: [
        { id: 'dp-made-easy', why: 'Word Break I (yes/no) is DP; listing every sentence needs the search, with memo.' },
        { id: 'tries', why: 'A trie speeds up prefix matching for big dictionaries.' },
      ],
    },
    watch: {
      viz: 'BtWalkViz',
      inputs: [
        { label: '"catsanddog"', input: { mode: 'wordbreak', s: 'catsanddog', words: ['cat', 'cats', 'and', 'sand', 'dog'] } },
        { label: '"catsandog"', input: { mode: 'wordbreak', s: 'catsandog', words: ['cats', 'dog', 'sand', 'and', 'cat'] } },
        { label: '"pineapplepen"', input: { mode: 'wordbreak', s: 'pineapplepen', words: ['apple', 'pen', 'applepen', 'pine', 'pineapple'] } },
      ],
    },
    edges: ['No sentence: "catsandog" → [].', 'One word is the whole string: "dog", ["dog"] → ["dog"].', 'Reused word: "aaaa", ["a","aa"] → 5 sentences.'],
  },
};
