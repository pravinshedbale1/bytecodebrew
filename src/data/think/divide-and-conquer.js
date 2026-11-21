/** Practice thinking walkthroughs: divide-and-conquer (format: src/data/think/index.js). */
const EXPR = ['2', '×', '3', '−', '4', '×', '5'];

export default {
  'sort-list': {
    aha: 'A linked list can\'t jump to an index, but merge sort never needs to: cut the list at its middle (slow and fast pointers), sort each half, then merge the two sorted halves by relinking the smaller front node each time.',
    asks: {
      read: 'Which words say what you can and can\'t do with the data?',
      budget: 'Up to 5 × 10⁴ nodes. Is an O(n²) insertion sort fast enough?',
      observe: 'Split [4, 2, 1, 3] into [4, 2] and [1, 3] and sort each. How do you join [2, 4] and [1, 3] by looking only at their first nodes?',
      brute: 'How would you build a sorted list one node at a time? How far does each insert walk?',
      pattern: 'Which O(n log n) sort only ever walks forwards?',
      watch: 'Watch the list split down to single nodes, then merge back up.',
    },
    read: [
      { phrase: 'singly linked list', says: 'Forward steps only: no index, no jumping to the middle, no walking back. Sorts that swap by index (quicksort, heapsort) lose their footing.' },
      { phrase: 'sort the list in ascending order', says: 'A full sort by comparisons, so O(n log n) is the best possible.' },
      { phrase: 'O(n log n) time using only O(1) extra memory', says: 'Copying the values into an array and sorting that is ruled out. Merging two lists needs no extra memory: it only relinks next pointers.' },
    ],
    budget: { from: 'number of nodes ≤ 5 × 10⁴', n: 5e4, aim: 'O(n log n)', note: 'Insertion sort is O(n²): about 1.25 × 10⁹ steps when the list is already in order, since every node walks past all the nodes before it.' },
    observe: [
      {
        title: 'Halves are easy to get by walking',
        text: 'Slow moves one node while fast moves two. When fast runs out, slow is at the end of the first half: cut the link after it, and [4, 2, 1, 3] becomes [4, 2] and [1, 3]. One pass, no index needed.',
        sketch: { kind: 'array', rows: [{ items: [4, 2, 1, 3], bands: [{ from: 0, to: 1, tone: 'accent', label: 'first half' }, { from: 2, to: 3, tone: 'ghost', label: 'second half' }], tags: { 1: [['slow', 'accent']], 3: [['fast', 'warn']] } }], caption: 'fast starts one node ahead, so slow stops at node 2: cut after it' },
      },
      {
        title: 'Two sorted lists merge by their fronts',
        text: 'Once the halves are sorted, [2, 4] and [1, 3], the smallest node overall is one of the two fronts: 2 vs 1 → take 1. Then 2 vs 3 → 2, 4 vs 3 → 3, and 4 is left over. Each step looks at two nodes, so a merge is one pass.',
        sketch: { kind: 'array', rows: [{ label: 'left half, sorted', items: [2, 4], marks: { 0: 'cur' } }, { label: 'right half, sorted', items: [1, 3], marks: { 0: 'hit' } }, { label: 'merged', items: [1, 2, 3, 4], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Halving stops at single nodes',
        text: 'A single node is already sorted. [4, 2, 1, 3] splits into two lists of 2, then four lists of 1: two levels of splitting, and the merges on each level touch all 4 nodes once. n nodes give log₂ n levels: O(n log n).',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'level 0', items: [4, 2, 1, 3], bands: [{ from: 0, to: 3, tone: 'accent' }] },
            { label: 'level 1', items: [4, 2, 1, 3], bands: [{ from: 0, to: 1, tone: 'accent' }, { from: 2, to: 3, tone: 'ghost' }] },
            { label: 'level 2', items: [4, 2, 1, 3], bands: [{ from: 0, to: 0, tone: 'accent' }, { from: 1, to: 1, tone: 'ghost' }, { from: 2, to: 2, tone: 'accent' }, { from: 3, to: 3, tone: 'ghost' }] },
          ],
        },
      },
    ],
    brute: { idea: 'Insertion sort by relinking: take the nodes one at a time and walk the sorted list from its head to find where each one belongs.', cost: 'O(n²)', waste: 'Every insert walks the sorted part from the start again. When the list is already in order, the k-th node walks past all k − 1 nodes before it.' },
    pattern: {
      pick: 'divide-and-conquer',
      why: 'Divide at the middle with slow and fast pointers, sort each half, combine with a one-pass merge: T(n) = 2T(n/2) + O(n) = O(n log n), and it only ever walks forwards. For strictly O(1) memory, do it bottom-up: merge runs of 1, then 2, 4, 8, … with no recursion.',
      not: [
        { id: 'sorting-and-selection', why: 'Quicksort and heapsort need to jump by index. Copying the values into an array and sorting it works, but uses O(n) memory, which the follow-up forbids.' },
        { id: 'fast-slow-pointers', why: 'They find the middle here, but that is only the "divide" step; they don\'t sort anything.' },
        { id: 'linked-list-manipulation', why: 'Merging two sorted lists behind a dummy head is the "combine" step. On its own it can\'t order an unsorted list.' },
      ],
    },
    watch: {
      viz: 'DivideViz',
      inputs: [
        { label: '[4, 2, 1, 3]', input: { mode: 'merge', vals: [4, 2, 1, 3] } },
        { label: '[−1, 5, 3, 4, 0]', input: { mode: 'merge', vals: [-1, 5, 3, 4, 0] } },
      ],
    },
    edges: [
      'Empty list: [] → [].',
      'One node: [7] → [7].',
      'Duplicates: [3, 1, 3, 1] → [1, 1, 3, 3].',
      'Two nodes: [2, 1] → [1, 2]. The middle must be the first node; if slow stopped at the second, the split would never shrink.',
    ],
  },

  'longest-substring-with-at-least-k-repeating-characters': {
    aha: 'A letter that appears fewer than k times in a range can\'t be part of any valid substring of that range. Cut the range at those letters and solve each piece on its own; a range with no such letter is valid as a whole.',
    asks: {
      read: 'Which words describe a condition on the letters, rather than on the length?',
      budget: 'Up to 10⁴ letters and only 26 kinds of letter. Is checking every substring fast enough?',
      observe: 'In "aaabb" with k = 3, b appears only twice in the whole string. Can any valid substring contain a b?',
      brute: 'How would you check every substring, and which substrings are checked although they could never be valid?',
      pattern: 'The rare letters cut the string into pieces. What can you do with each piece?',
      watch: 'Watch rare letters cut the string, and the pieces get cut again.',
    },
    read: [
      { phrase: 'longest substring', says: 'Contiguous and longest: the reflex is a sliding window. Test that reflex before trusting it.' },
      { phrase: 'character that appears, appears at least `k` times', says: 'A condition on every letter inside the substring. One rare letter spoils every substring that contains it.' },
      { phrase: 'If no such substring exists, return `0`', says: 'Some ranges have no answer at all: a piece made only of rare letters, or shorter than k, gives 0.' },
    ],
    budget: {
      from: 's.length ≤ 10⁴, lowercase letters',
      rows: [['every substring, 26 counts each', '≈ 1.3 × 10⁹', 'bad', 'too slow'], ['O(26 · n)', '≈ 2.6 × 10⁵', 'ok', 'easily fits']],
      aim: 'O(26 · n)',
      note: 'There are n²/2 = 5 × 10⁷ substrings, and checking 26 counts for each is too much. The alphabet size, 26, is a small constant worth building on.',
    },
    observe: [
      {
        title: 'A sliding window has no rule to follow',
        text: 'Take "aabb" with k = 2. The window "aa" is valid; grow it to "aab" and it breaks (one b); grow it to "aabb" and it is valid again. Growing can both break and fix a window, so "shrink while invalid" can\'t decide when to shrink.',
        sketch: { kind: 'array', rows: [{ label: '"aab": b once', items: ['a', 'a', 'b', 'b'], bands: [{ from: 0, to: 2, tone: 'danger', label: 'invalid' }], marks: { 3: 'dim' } }, { label: '"aabb": grown, valid again', items: ['a', 'a', 'b', 'b'], bands: [{ from: 0, to: 3, tone: 'success', label: 'valid' }] }] },
      },
      {
        title: 'A rare letter can never be inside an answer',
        text: 'In "aaabb" with k = 3, b appears only twice in the whole string. Any substring holds at most those 2 b\'s, so a substring with a b is never valid. Cut at every b: only "aaa" is left, and it is valid: 3.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'a', 'a', 'b', 'b'], marks: { 3: 'bad', 4: 'bad' }, bands: [{ from: 0, to: 2, tone: 'success', label: 'piece: valid' }], tags: { 3: [['b: 2 < 3', 'danger']] } }] },
      },
      {
        title: 'Inside a piece the counts change: cut again',
        text: 'In "bbaaacbd" with k = 3, c and d appear once, leaving the pieces "bbaaa" and "b". Inside "bbaaa", b now appears only twice, so it is rare there: cut again, leaving "aaa" → 3. A letter that is rare in a range is gone from every piece below it, so there are at most 26 levels of cutting.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'whole string: b 3, a 3, c 1, d 1', items: ['b', 'b', 'a', 'a', 'a', 'c', 'b', 'd'], marks: { 5: 'bad', 7: 'bad' }, bands: [{ from: 0, to: 4, tone: 'accent', label: 'piece' }, { from: 6, to: 6, tone: 'ghost' }] },
            { label: 'inside "bbaaa": b 2, a 3', items: ['b', 'b', 'a', 'a', 'a'], marks: { 0: 'bad', 1: 'bad' }, bands: [{ from: 2, to: 4, tone: 'success', label: 'valid: 3' }] },
          ],
        },
      },
    ],
    brute: { idea: 'Fix each start, extend the end one letter at a time keeping 26 counts, and after each step check whether every letter present appears at least k times.', cost: 'O(26 · n²)', waste: 'Every substring that contains a letter rare in the whole string is still built and checked, although none of them can ever be valid.' },
    pattern: {
      pick: 'divide-and-conquer',
      why: 'Split at what can\'t belong: count the letters in the range, cut at every letter seen fewer than k times, solve each piece on its own and keep the best. A range with no rare letter is valid as a whole. Each level removes at least one letter, so at most 26 levels of O(n) work: O(26 · n).',
      not: [
        { id: 'sliding-window', why: 'A plain window fails, since growing can make it valid again. It does work with an outer loop: fix the number of distinct letters u = 1 … 26 and run one window per u, also O(26 · n).' },
        { id: 'hashing', why: 'Counting letters is a tool used inside every call, but the counts alone don\'t say where the answer is.' },
        { id: 'prefix-sums', why: 'Prefix counts give any substring\'s letter counts in O(26), but there are still n² substrings to try.' },
      ],
    },
    watch: {
      viz: 'DivideViz',
      inputs: [
        { label: '"aaabb", k = 3', input: { mode: 'bad', s: 'aaabb', k: 3 } },
        { label: '"bbaaacbd", k = 3', input: { mode: 'bad', s: 'bbaaacbd', k: 3 } },
      ],
    },
    edges: [
      'k = 1: "abc", 1 → 3. Every substring is valid, so the whole string wins.',
      'Every letter rare: "abc", 2 → 0.',
      'The answer in the middle: "ababbc", 2 → 5 ("ababb").',
      'k longer than the string: "aa", 3 → 0.',
    ],
  },

  'different-ways-to-add-parentheses': {
    aha: 'However the expression is grouped, one operator is applied last. Try each operator as the last one: the left side\'s results and the right side\'s results are found on their own, and every left value combines with every right value. Remember each sub-expression\'s results, because they come up again.',
    asks: {
      read: 'Which words say you must list every answer, and how duplicates are treated?',
      budget: 'At most 10 numbers. How many groupings can there be?',
      observe: 'In (2 − 1) − 1 and 2 − (1 − 1), which operator is applied last?',
      brute: 'If you try each operator as the last one and recurse, which work gets repeated?',
      pattern: 'Once the last operator is chosen, do the left and right sides affect each other?',
      watch: 'Watch each operator take a turn as the last one, and the memo save repeated work.',
    },
    read: [
      { phrase: 'every possible way of grouping its operations with parentheses', says: '"Every possible" means listing them all, not counting or optimising. The question is how to go through the groupings without missing or repeating one.' },
      { phrase: 'if two groupings give the same value, include it twice', says: 'One result per grouping: lists of values, no sets and no de-duplication.' },
      { phrase: 'at most 10⁴ results', says: 'The output itself can be large, so the answer size, not the length, sets the cost.' },
    ],
    budget: {
      from: 'expression.length ≤ 20, so at most 10 numbers',
      rows: [['groupings of 10 numbers', 'C₉ = 4 862', 'ok', 'small'], ['work per grouping', '≤ 9 operations', 'ok', 'fits']],
      aim: 'O(results × n)',
      note: 'The number of groupings of 10 numbers is the Catalan number C₉ = 4 862, so listing them all is cheap. What matters is not working out the same sub-expression again under every split.',
    },
    observe: [
      {
        title: 'Every grouping applies one operator last',
        text: '(2 − 1) − 1 applies the second − last; 2 − (1 − 1) applies the first − last. Choosing the last operator cuts the expression in two, and each side can be grouped any way it likes.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '2 − (1 − 1): the first − last', items: ['2', '−', '1', '−', '1'], marks: { 1: 'target' }, bands: [{ from: 0, to: 0, tone: 'accent' }, { from: 2, to: 4, tone: 'ghost' }] },
            { label: '(2 − 1) − 1: the second − last', items: ['2', '−', '1', '−', '1'], marks: { 3: 'target' }, bands: [{ from: 0, to: 2, tone: 'accent' }, { from: 4, to: 4, tone: 'ghost' }] },
          ],
          caption: '2 − 0 = 2 and 1 − 1 = 0: the answer [2, 0]',
        },
      },
      {
        title: 'Combine every left result with every right result',
        text: 'In 2 × 3 − 4 × 5 with the first × last, the left side 2 has one result, [2], and the right side 3 − 4 × 5 has two: 3 − 20 = −17 and (3 − 4) × 5 = −5. Every pair counts: 2 × −17 = −34 and 2 × −5 = −10.',
        sketch: { kind: 'array', rows: [{ items: EXPR, marks: { 1: 'target' }, bands: [{ from: 0, to: 0, tone: 'accent', label: '[2]' }, { from: 2, to: 6, tone: 'ghost', label: '[−17, −5]' }] }, { label: 'this split gives', items: ['−34', '−10'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'The same sub-expression comes back',
        text: 'With the first × last, the right side 3 − 4 × 5 needs every result of 4 × 5. With the − last, the right side is 4 × 5 again. Its results never change, so work them out once and keep them in a memo.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'inside 3 − 4 × 5 (first × last)', items: EXPR, marks: { 0: 'dim', 1: 'dim' }, bands: [{ from: 4, to: 6, tone: 'accent', label: '4 × 5' }] },
            { label: 'with the − last', items: EXPR, marks: { 3: 'target' }, bands: [{ from: 4, to: 6, tone: 'accent', label: '4 × 5 again' }] },
          ],
          caption: 'memo["4*5"] = [20], reused',
        },
      },
    ],
    brute: { idea: 'Try every operator as the last one and recurse on both sides, working each side out from scratch whenever it is asked for.', cost: 'O(Cₙ · n), plus repeated sub-expressions', waste: 'The same sub-expressions, like 4 × 5, are worked out again under every split that contains them, although their lists of results never change.' },
    pattern: {
      pick: 'divide-and-conquer',
      why: 'Choose the last operation: each operator splits the expression into two independent parts. Solve each part recursively, then combine every left result with every right result. Memo by sub-expression, since the same parts reappear under different splits. (Memoised, this is interval DP over ranges of numbers.)',
      not: [
        { id: 'backtracking', why: 'It also lists every option, but builds one grouping at a time and undoes choices. Here the two sides are independent, so their result lists simply multiply: nothing to undo.' },
        { id: 'stack-patterns', why: 'A stack evaluates one fixed expression, like a calculator. Here there is no fixed order: every grouping must be produced.' },
        { id: 'dp-trees-intervals', why: 'The memoised recursion is interval DP over [i, j]. Writing it as a bottom-up table adds index bookkeeping and gains nothing here.' },
      ],
    },
    watch: {
      viz: 'DivideViz',
      inputs: [
        { label: '"2-1-1"', input: { mode: 'ops', expr: '2-1-1' } },
        { label: '"2*3-4*5"', input: { mode: 'ops', expr: '2*3-4*5' } },
      ],
    },
    edges: [
      'Just a number: "11" → [11].',
      'One operator: "2*3" → [6].',
      'Equal values are kept twice: "2*3-4*5" → [−34, −14, −10, −10, 10].',
      'Two-digit numbers: "10+5" → [15]. Read whole numbers, not single digits.',
    ],
  },
};
