/** Practice thinking walkthroughs: two-pointers (format: src/data/think/index.js). */
export default {
  'valid-palindrome': {
    free: true,
    read: [
      { phrase: 'reads the same forwards and backwards', says: 'Compare mirrored positions: the first with the last, the second with the second-to-last… Two pointers from both ends.' },
      { phrase: 'throw away everything that is not a letter or a digit', says: 'Those characters don\'t take part: a pointer simply skips them.' },
      { phrase: 'turn every uppercase letter into lowercase', says: 'Compare case-insensitively.' },
    ],
    budget: { from: 's.length ≤ 2 × 10⁵', n: 2e5, aim: 'O(n), O(1) space', note: 'Cleaning a copy and reversing it is also O(n), but uses two extra strings.' },
    observe: [
      {
        title: 'A palindrome is checked from the outside in',
        text: 'Pair the outermost characters, then step both ends inwards. Any mismatch means it isn\'t a palindrome.',
        sketch: { kind: 'array', rows: [{ items: ['r', 'a', 'c', 'e', 'c', 'a', 'r'], bands: [{ from: 0, to: 6, tone: 'ghost' }, { from: 1, to: 5, tone: 'accent' }], tags: { 0: [['l', 'interview']], 6: [['r', 'accent']] } }] },
      },
      {
        title: 'Skip what doesn\'t count, instead of cleaning first',
        text: 'Each pointer jumps over spaces and punctuation before comparing. No cleaned copy is needed.',
        sketch: { kind: 'array', rows: [{ items: ['a', ',', 'b', ' ', 'a'], marks: { 1: 'dim', 3: 'dim', 0: 'hit', 4: 'hit' } }], caption: '"a, b a" is a palindrome: a … b … a' },
      },
    ],
    brute: { idea: 'Build the cleaned, lower-cased string, then compare it with its reverse.', cost: 'O(n)', waste: 'Already linear, but it builds two extra strings that pointers make unnecessary.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Mirror positions are compared pairwise from both ends, skipping characters that don\'t count: O(n) time, O(1) space.',
      not: [
        { id: 'stack-patterns', why: 'Pushing half the characters and popping to compare works, but needs O(n) memory.' },
        { id: 'sliding-window', why: 'There is no window; the two ends move towards each other.' },
      ],
    },
    watch: {
      frames: [
        { title: '"A" vs "a": equal (ignoring case)', text: 'Both ends move inwards.' },
        { title: 'Skip spaces and commas', text: 'The left pointer skips " " after "A"; the right skips nothing. Compare "m" with "m".' },
        { title: 'The pointers meet: true', text: 'Every pair matched, so "A man, a plan, a canal: Panama" is a palindrome.' },
      ],
    },
    edges: ['Only punctuation, like " " → true (empty after cleaning).', '"0P" → false: digits count, and 0 ≠ p.', 'Mixed case: "Aa" → true.'],
  },

  'remove-duplicates-from-sorted-array': {
    read: [
      { phrase: '`nums` is sorted in non-decreasing order', says: 'Equal values sit next to each other: a value is new exactly when it differs from the last one kept.' },
      { phrase: 'Rearrange it in place', says: 'No second array: write the answer over the front of nums.' },
      { phrase: 'Only the first `k` positions matter', says: 'Anything after the answer can be left as garbage.' },
    ],
    budget: { from: 'nums.length ≤ 3 × 10⁴', n: 3e4, aim: 'O(n), O(1) space', note: 'Shifting elements left on every duplicate would be O(n²).' },
    observe: [
      {
        title: 'Sorted means duplicates are neighbours',
        text: 'Compare each value with the last value kept; equal means duplicate.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 2, 2, 2, 3], marks: { 1: 'dim', 3: 'dim', 4: 'dim' } }] },
      },
      {
        title: 'A write pointer trails the read pointer',
        text: 'w marks where the next distinct value goes. The read pointer runs ahead; w only moves when something new is found, so it never overtakes it.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit' }, tags: { 3: [['w', 'accent']], 5: [['read', 'interview']] } }] },
      },
    ],
    brute: { idea: 'Collect each distinct value into a separate list, then copy the list over the front of nums.', cost: 'O(n)', waste: 'A second array that the front of nums itself can play the role of.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Read and write pointers compact the array in place: one pass, O(1) space.',
      not: [
        { id: 'hashing', why: 'A set of seen values works for unsorted input, but the sorted order already tells us what is new.' },
        { id: 'sorting-and-selection', why: 'The array is already sorted; nothing to sort.' },
      ],
    },
    watch: { viz: 'ReadWriteViz', inputs: [{ label: '[1, 1, 2, 2, 2, 3, 5, 5]', input: { mode: 'dedupe', nums: [1, 1, 2, 2, 2, 3, 5, 5] } }] },
    edges: ['All values equal → k = 1.', 'All distinct → k = n, nothing moves.', 'A single element.'],
  },

  'move-zeroes': {
    read: [
      { phrase: 'keeping all non-zero values in their original relative order', says: 'A stable partition: non-zeros keep their order, so we can\'t just swap from both ends.' },
      { phrase: 'Change the array in place; do not make a copy', says: 'Read and write pointers inside the same array.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n), O(1) space', note: 'Bubbling each zero to the end is O(n²).' },
    observe: [
      {
        title: 'Move the non-zeros forward instead of the zeros back',
        text: 'If every non-zero is written to the next free slot at the front, in order, the zeros end up behind them automatically.',
        sketch: { kind: 'array', rows: [{ items: [0, 1, 0, 3, 12], marks: { 1: 'cur', 3: 'cur', 4: 'cur' } }, { items: [1, 3, 12, 0, 0], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] },
      },
      {
        title: 'Swapping keeps zeros in the gap',
        text: 'With w at the first zero and i scanning, swapping a non-zero at i with nums[w] keeps [0, w) non-zeros and [w, i) zeros.',
      },
    ],
    brute: { idea: 'Copy the non-zeros into a new array, pad with zeros, and copy back.', cost: 'O(n)', waste: 'An extra array; the front of nums can collect the non-zeros itself.' },
    pattern: {
      pick: 'two-pointers',
      why: 'A write pointer collects non-zeros at the front in order while a read pointer scans: a stable partition in one pass.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting would reorder the non-zeros, which must keep their order.' },
        { id: 'stack-patterns', why: 'Nothing is nested or undone; values just move forward.' },
      ],
    },
    watch: { viz: 'ReadWriteViz', inputs: [{ label: '[0, 1, 0, 3, 12]', input: { mode: 'zeroes', nums: [0, 1, 0, 3, 12] } }] },
    edges: ['No zeros: nothing changes.', 'All zeros.', 'Zeros only at the end.'],
  },

  'squares-of-a-sorted-array': {
    read: [
      { phrase: 'may contain negative numbers', says: 'Squares of large negatives are large: squaring breaks the sorted order.' },
      { phrase: 'also sorted in non-decreasing order', says: 'We must produce the squares in order, not just compute them.' },
      { phrase: 'The interesting solution runs in O(n)', says: 'Sorting the squares (O(n log n)) is not the goal; use the input\'s order.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'Square and sort is O(n log n): fine for time, but there is a linear method.' },
    observe: [
      {
        title: 'The biggest square is at one of the two ends',
        text: 'The largest absolute value is either the most negative (left end) or the most positive (right end).',
        sketch: { kind: 'array', rows: [{ items: [-4, -1, 0, 3, 10], marks: { 0: 'target', 4: 'hit' }, tags: { 0: [['16', 'warn']], 4: [['100', 'success']] } }] },
      },
      {
        title: 'Fill the answer from the back',
        text: 'Take the bigger end\'s square, write it at the last free slot, and move that end inwards. Repeat.',
      },
    ],
    brute: { idea: 'Square every value, then sort the result.', cost: 'O(n log n)', waste: 'Sorting ignores that the input is already sorted by value; only the negatives are reversed.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Two pointers at the ends always hold the next-largest square; merging from the back gives O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting the squares is correct but O(n log n).' },
        { id: 'binary-search', why: 'Finding the first non-negative and merging outwards also works in O(n), with more edge cases.' },
      ],
    },
    watch: {
      frames: [
        { title: '|−4| vs |10|: write 100 last', text: 'The right end wins; move it left.', sketch: { kind: 'array', rows: [{ items: ['·', '·', '·', '·', 100], marks: { 4: 'hit' } }] } },
        { title: '|−4| vs |3|: write 16', text: 'The left end wins this time.', sketch: { kind: 'array', rows: [{ items: ['·', '·', '·', 16, 100], marks: { 3: 'hit' } }] } },
        { title: '…until the pointers cross', text: 'Result: [0, 1, 9, 16, 100].', sketch: { kind: 'array', rows: [{ items: [0, 1, 9, 16, 100], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] } },
      ],
    },
    edges: ['All negative: the answer is the reverse of the squares.', 'All non-negative: squares are already sorted.', 'Equal absolute values like −3 and 3.'],
  },

  'remove-element': {
    read: [
      { phrase: 'Remove every occurrence of `val` from `nums`', says: 'Real deletion from an array means shifting. Overwriting is cheaper.' },
      { phrase: 'the first `k` positions of `nums` must hold exactly those kept values, in any order', says: 'Only the front matters, and order is free.' },
      { phrase: 'What is left beyond position `k` does not matter', says: 'We may overwrite freely.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n)', note: 'Tiny limits; the point is doing it in one pass without shifting.' },
    observe: [
      {
        title: 'Overwrite instead of delete',
        text: 'Copy each value that is not val to the next free slot at the front. Values equal to val are simply never copied.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 2, 3], marks: { 0: 'bad', 3: 'bad' } }, { label: 'front after one pass', items: [2, 2, '·', '·'], marks: { 0: 'hit', 1: 'hit' } }], caption: 'val = 3, k = 2' },
      },
      {
        title: 'The write index is the answer',
        text: 'When the scan ends, the write index counts the kept values: it is k.',
      },
    ],
    brute: { idea: 'Each time val is found, shift everything after it one place left.', cost: 'O(n²)', waste: 'Every deletion moves the whole tail of the array.' },
    pattern: {
      pick: 'two-pointers',
      why: 'A read pointer scans and a write pointer collects the kept values: one pass, in place.',
      not: [
        { id: 'hashing', why: 'Nothing needs remembering; each value is kept or dropped on its own.' },
        { id: 'sorting-and-selection', why: 'Sorting is unnecessary: order is free and values just need filtering.' },
      ],
    },
    watch: {
      frames: [
        { title: '3: skip', text: 'Equal to val, so it is not copied. w stays 0.' },
        { title: '2, 2: copy to slots 0 and 1', text: 'w becomes 2.', sketch: { kind: 'array', rows: [{ items: [2, 2, 2, 3], marks: { 0: 'hit', 1: 'hit' } }] } },
        { title: '3: skip. k = 2', text: 'The first two slots hold [2, 2].' },
      ],
    },
    edges: ['An empty array → 0.', 'Every value equals val → 0.', 'No value equals val → n.'],
  },

  'reverse-string': {
    read: [
      { phrase: 'so the first character becomes the last', says: 'Position i swaps with its mirror, n − 1 − i.' },
      { phrase: 'Use O(1) extra memory: no second array', says: 'Swap in place from both ends.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 1e5, aim: 'O(n), O(1) space', note: 'Every character must move, so O(n) is optimal.' },
    observe: [
      {
        title: 'Swap mirror pairs',
        text: 'Swap the outermost pair, then the next pair in, until the pointers meet in the middle.',
        sketch: { kind: 'array', rows: [{ items: ['h', 'e', 'l', 'l', 'o'], marks: { 0: 'cur', 4: 'cur' }, tags: { 0: [['l', 'interview']], 4: [['r', 'accent']] } }] },
      },
      {
        title: 'Stop when they meet',
        text: 'With an odd length the middle character stays put; with an even length the pointers cross.',
      },
    ],
    brute: { idea: 'Write the characters into a new array back to front, then copy them back.', cost: 'O(n)', waste: 'O(n) extra memory, which the problem forbids.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Opposite-end pointers swap and move inwards: n / 2 swaps, no extra memory.',
      not: [
        { id: 'stack-patterns', why: 'Pushing everything and popping reverses too, but needs O(n) memory.' },
        { id: 'sliding-window', why: 'No window; the two ends meet in the middle.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Swap h and o', text: '["o","e","l","l","h"]', sketch: { kind: 'array', rows: [{ items: ['o', 'e', 'l', 'l', 'h'], marks: { 0: 'hit', 4: 'hit' } }] } },
        { title: 'Swap e and l', text: '["o","l","l","e","h"]', sketch: { kind: 'array', rows: [{ items: ['o', 'l', 'l', 'e', 'h'], marks: { 1: 'hit', 3: 'hit' } }] } },
        { title: 'The pointers meet at the middle "l"', text: 'Done after two swaps.' },
      ],
    },
    edges: ['A single character.', 'Even length (pointers cross without meeting).'],
  },

  'valid-palindrome-ii': {
    read: [
      { phrase: 'can become a palindrome', says: 'Check palindromes from both ends, with some leeway.' },
      { phrase: 'Deleting nothing is allowed', says: 'An existing palindrome is already a yes.' },
      { phrase: 'delete the "c" (or the "b")', says: 'At a mismatch there are exactly two candidates to delete: the left character or the right one.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Deleting each position and re-checking is O(n²), 10¹⁰.' },
    observe: [
      {
        title: 'Match from both ends until the first mismatch',
        text: 'Matching outer pairs are fine whatever we delete later, so walk inwards while they agree.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a'], marks: { 0: 'hit', 3: 'hit', 1: 'bad', 2: 'bad' } }], caption: 'b ≠ c: one of them must go' },
      },
      {
        title: 'One branch, then a plain check',
        text: 'Skip the left character or the right one, and check whether the inside is a palindrome. Two O(n) checks at most.',
      },
    ],
    brute: { idea: 'Delete each position in turn and test whether the rest is a palindrome.', cost: 'O(n²)', waste: 'Most deletions are pointless: only the two characters at the first mismatch can be the one to delete.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Opposite-end pointers, with a single branch at the first mismatch: O(n).',
      not: [
        { id: 'dp-strings', why: 'An edit-distance DP solves "k deletions", but is O(n²) for one allowed deletion.' },
        { id: 'sliding-window', why: 'No window; we compare mirrored positions.' },
      ],
    },
    watch: {
      frames: [
        { title: '"abca": a = a', text: 'Move inwards.' },
        { title: 'b ≠ c: try both', text: 'Skip b → "c" is a palindrome. (Skip c → "b" also works.) True.', sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a'], marks: { 1: 'dim', 2: 'hit' } }] } },
      ],
    },
    edges: ['Already a palindrome → true.', '"abc" → false.', 'The extra character is at an end: "abaX".'],
  },

  'merge-strings-alternately': {
    read: [
      { phrase: 'taking letters from them in turn', says: 'One pointer per word, advancing together.' },
      { phrase: 'If one word is longer, add its remaining letters to the end', says: 'After the shorter word runs out, append the rest.' },
    ],
    budget: { from: 'both words ≤ 100 letters', n: 200, aim: 'O(m + n)', note: 'Tiny; just avoid quadratic string concatenation.' },
    observe: [
      {
        title: 'Two pointers walking in step',
        text: 'Take word1[i], then word2[i], for each i while both have letters.',
        sketch: { kind: 'array', rows: [{ label: 'word1', items: ['a', 'b', 'c'] }, { label: 'word2', items: ['p', 'q', 'r'] }, { label: 'merged', items: ['a', 'p', 'b', 'q', 'c', 'r'], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Then the leftover',
        text: 'Whatever remains of the longer word goes on the end unchanged.',
      },
    ],
    brute: { idea: 'Build the answer with string + one letter at a time.', cost: 'O((m + n)²)', waste: 'Each + copies the whole string so far; a StringBuilder appends in O(1).' },
    pattern: {
      pick: 'two-pointers',
      why: 'Two pointers walk two sequences in step, the same loop as merging two sorted lists.',
      not: [
        { id: 'sliding-window', why: 'No window over one sequence; we interleave two.' },
        { id: 'stack-patterns', why: 'No nesting or undoing involved.' },
      ],
    },
    watch: {
      frames: [
        { title: 'a, p, b, q, c, r', text: 'Equal lengths: alternate to the end → "apbqcr".' },
        { title: '"ab" and "pqrs"', text: 'a, p, b, q, then append "rs" → "apbqrs".' },
      ],
    },
    edges: ['One word much longer.', 'Words of length 1.'],
  },

  'merge-sorted-array': {
    read: [
      { phrase: 'its last `n` slots are zeros you can overwrite', says: 'The free space is at the end of nums1: fill from the back.' },
      { phrase: 'Merge `nums2` into `nums1`', says: 'A merge of two sorted lists, done in place.' },
      { phrase: 'also sorted', says: 'Both inputs are sorted: compare their largest remaining values.' },
    ],
    budget: { from: 'm + n ≤ 200', n: 200, aim: 'O(m + n)', note: 'Small limits; copying in and sorting works, but the intended solution is a linear merge.' },
    observe: [
      {
        title: 'Merging from the front overwrites unread values',
        text: 'Writing 2 into nums1[1] would destroy the 2 that is still waiting to be compared.',
      },
      {
        title: 'From the back, the free space is always ahead',
        text: 'Place the larger of the two last values at the end. The write position never catches up with nums1\'s unread values.',
        sketch: { kind: 'array', rows: [{ label: 'nums1', items: [1, 2, 3, 0, 0, 6], marks: { 2: 'target', 5: 'hit' } }, { label: 'nums2', items: [2, 5, 6], marks: { 2: 'hit' } }], caption: '6 > 3: write 6 at the end' },
      },
    ],
    brute: { idea: 'Copy nums2 into the spare slots and sort the whole array.', cost: 'O((m + n) log(m + n))', waste: 'Sorting ignores that both halves are already sorted.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Three pointers (end of nums1\'s values, end of nums2, write position) merge from the back in O(m + n), in place.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting works but throws away the sorted order we already have.' },
        { id: 'heap-patterns', why: 'A heap merges k lists; for two lists, direct comparison is simpler.' },
      ],
    },
    watch: {
      frames: [
        { title: '3 vs 6: write 6', text: 'nums1 = [1, 2, 3, 0, 0, 6].' },
        { title: '3 vs 5: write 5', text: 'nums1 = [1, 2, 3, 0, 5, 6].' },
        { title: '3 vs 2: write 3, then 2 vs 2: write 2', text: 'nums1 = [1, 2, 2, 3, 5, 6]. nums2 is used up; the rest of nums1 is already in place.', sketch: { kind: 'array', rows: [{ items: [1, 2, 2, 3, 5, 6], marks: { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit' } }] } },
      ],
    },
    edges: ['m = 0: copy nums2 in.', 'n = 0: nothing to do.', 'Every nums2 value is smaller than nums1\'s.'],
  },

  'two-sum-ii-input-array-is-sorted': {
    read: [
      { phrase: 'sorted in non-decreasing order', says: 'Sorted input: the sum of the two ends tells us which end to move.' },
      { phrase: 'Use only constant extra space, so no hash map', says: 'Rules out the Two Sum map; the sort order must do the work.' },
      { phrase: 'Exactly one pair works', says: 'Stop at the first match.' },
    ],
    budget: { from: 'numbers.length ≤ 3 × 10⁴', n: 3e4, aim: 'O(n), O(1) space', note: 'Every pair is 4.5 × 10⁸: too slow. Binary search per value is O(n log n).' },
    observe: [
      {
        title: 'Too small? Move left. Too big? Move right.',
        text: 'With the smallest and largest values, a sum below target can only grow by moving the left pointer up; above target, only by moving the right pointer down.',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 11, 15], marks: { 0: 'cur', 3: 'cur' }, tags: { 0: [['l', 'interview']], 3: [['r', 'accent']] } }], caption: '2 + 15 = 17 > 9: move r' },
      },
      {
        title: 'Each move rules out a whole row of pairs',
        text: 'If 2 + 15 is too big, 15 is too big with every remaining value too, since 2 is the smallest. Dropping it is safe.',
      },
    ],
    brute: { idea: 'Try every pair (i, j).', cost: 'O(n²)', waste: 'It ignores the sort: one comparison can eliminate a value entirely.' },
    pattern: {
      pick: 'two-pointers',
      why: 'On sorted data, pointers at both ends converge on the pair: each step safely discards one value. O(n), O(1) space.',
      not: [
        { id: 'hashing', why: 'The Two Sum hash map works but uses O(n) space, which is ruled out.' },
        { id: 'binary-search', why: 'Binary-searching each partner is O(n log n): correct, but slower.' },
      ],
    },
    watch: { viz: 'PairSumViz', inputs: [{ label: '[2, 7, 11, 15], target 9', input: { nums: [2, 7, 11, 15], target: 9 } }, { label: '[1, 3, 4, 6, 8, 11, 15], target 14', input: { nums: [1, 3, 4, 6, 8, 11, 15], target: 14 } }] },
    edges: ['Return 1-based positions.', 'Negative numbers.', 'Duplicates that form the answer: [3, 3], target 6.'],
  },

  'container-with-most-water': {
    read: [
      { phrase: 'Choose two lines', says: 'A pair of positions: n² pairs if tried naively.' },
      { phrase: 'the distance between the lines times the height of the shorter line', says: 'Area = width × min(height): the shorter wall caps the water.' },
      { phrase: 'Return the largest amount of water', says: 'Maximise over pairs: we need a reason to skip most of them.' },
    ],
    budget: { from: 'n ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'All pairs is 5 × 10⁹.' },
    observe: [
      {
        title: 'Start with the widest container',
        text: 'Lines 0 and n − 1 give the maximum width. Any other pair is narrower, so it needs a taller shorter wall to win.',
        sketch: { kind: 'array', rows: [{ items: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 0: 'bad', 8: 'cur' }, bands: [{ from: 0, to: 8, tone: 'ghost' }] }], caption: 'width 8 × min(1, 7) = 8' },
      },
      {
        title: 'Moving the taller wall can never help',
        text: 'The width shrinks and the level is still capped by the shorter wall. Only moving the shorter wall might find a higher level.',
        sketch: { kind: 'array', rows: [{ items: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 1: 'cur', 8: 'cur' }, bands: [{ from: 1, to: 8, tone: 'accent' }] }], caption: 'drop the 1: width 7 × min(8, 7) = 49' },
      },
    ],
    brute: { idea: 'Compute min(h[i], h[j]) × (j − i) for every pair and keep the largest.', cost: 'O(n²)', waste: 'Most pairs are provably worse than one already seen: keeping a short wall and narrowing never helps.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Pointers at both ends; always move the shorter wall, because it is the only move that can improve the area. O(n).',
      not: [
        { id: 'monotonic-stack', why: 'The largest-rectangle-in-histogram problem uses a stack; here water only depends on the two chosen walls.' },
        { id: 'sliding-window', why: 'The window shrinks from both sides by a rule about the walls, not by a validity condition.' },
      ],
    },
    watch: { viz: 'ContainerViz', inputs: [{ label: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', input: { heights: [1, 8, 6, 2, 5, 4, 8, 3, 7] } }] },
    edges: ['Two lines only.', 'Equal heights at both ends (move either).', 'Zero-height lines.'],
  },

  '3sum': {
    read: [
      { phrase: '`a + b + c == 0`', says: 'Fix a, and the other two must sum to −a: Two Sum, repeated for each a.' },
      { phrase: 'three different positions', says: 'Each index used once.' },
      { phrase: 'Each triplet of values may appear only once', says: 'Duplicates must be skipped: sorting puts equal values together, which makes that easy.' },
    ],
    budget: { from: 'nums.length ≤ 3000', n: 3000, aim: 'O(n²)', note: 'Three nested loops are 2.7 × 10¹⁰; O(n²) is 9 × 10⁶.' },
    observe: [
      {
        title: 'Fix one value; the rest is Two Sum',
        text: 'For each a, find pairs b + c = −a among the values after it.',
        sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 1: 'cur', 2: 'hit', 5: 'hit' }, tags: { 1: [['a', 'accent']] } }], caption: 'a = −1: −1 + 2 = 1 = −a' },
      },
      {
        title: 'Sorting enables pointers and de-duplication',
        text: 'On the sorted array, two pointers find all pairs for each a in O(n), and skipping equal neighbours avoids repeated triplets.',
      },
    ],
    brute: { idea: 'Try every triple of positions and keep matches in a set of sorted triplets.', cost: 'O(n³)', waste: 'For each pair it re-searches for the third value, which two pointers find in one sweep.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Sort, fix the first value, then two pointers find the remaining pairs: O(n²), with duplicates skipped by comparing neighbours.',
      not: [
        { id: 'hashing', why: 'A hash set per fixed value also gives O(n²), but de-duplicating triplets becomes awkward.' },
        { id: 'binary-search', why: 'Binary-searching the third value is O(n² log n).' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sort: [−4, −1, −1, 0, 1, 2]', text: 'Now equal values are neighbours and pointers can steer.' },
        { title: 'a = −4: no pair sums to 4', text: 'The pointers meet without a match.' },
        { title: 'a = −1: find [−1, −1, 2] and [−1, 0, 1]', text: 'Both pairs sum to 1.', sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 1: 'cur', 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit' } }] } },
        { title: 'a = −1 again: skip', text: 'Same value as before; skipping it avoids duplicate triplets.' },
      ],
    },
    edges: ['[0, 0, 0] → [[0, 0, 0]].', 'No triplets at all.', 'Many repeated values.'],
  },

  'sort-colors': {
    read: [
      { phrase: 'holds only the values `0`, `1` and `2`', says: 'Three groups: a three-way partition (or counting).' },
      { phrase: 'Do not use a library sort', says: 'Use the fact that there are only three values.' },
      { phrase: 'the classic solution needs only one pass and constant extra space', says: 'The Dutch national flag: three pointers.' },
    ],
    budget: { from: 'n ≤ 300', n: 300, aim: 'O(n), one pass', note: 'Speed is not the issue; one pass in place is the goal.' },
    observe: [
      {
        title: 'Three regions plus an unknown middle',
        text: '[0, lo) are 0s, [lo, mid) are 1s, (hi, n − 1] are 2s, and [mid, hi] is not looked at yet.',
        sketch: { kind: 'array', rows: [{ items: [0, 0, 1, 2, 1, 2, 2], bands: [{ from: 0, to: 1, tone: 'success', label: '0s' }, { from: 2, to: 2, tone: 'accent', label: '1s' }, { from: 3, to: 4, tone: 'ghost', label: '?' }, { from: 5, to: 6, tone: 'danger', label: '2s' }] }] },
      },
      {
        title: 'Look at nums[mid]',
        text: '0: swap to lo, advance both. 1: advance mid. 2: swap to hi, move hi back, but don\'t advance mid (the swapped-in value is unknown).',
      },
    ],
    brute: { idea: 'Count the 0s, 1s and 2s, then overwrite the array.', cost: 'O(n)', waste: 'Two passes; the flag partition does it in one.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Three pointers grow three regions from both ends: one pass, in place.',
      not: [
        { id: 'sorting-and-selection', why: 'A general sort is O(n log n) and ruled out by the statement.' },
        { id: 'hashing', why: 'Counting values works, but needs two passes.' },
      ],
    },
    watch: { viz: 'DutchFlagViz', inputs: [{ label: '[2, 0, 2, 1, 1, 0]', input: { nums: [2, 0, 2, 1, 1, 0] } }] },
    edges: ['All one colour.', 'Already sorted.', 'Reverse sorted: [2, 1, 0].'],
  },

  '4sum': {
    read: [
      { phrase: 'four different indices', says: 'Four nested choices: reduce it like 3Sum, one level further.' },
      { phrase: 'add up to `target`', says: 'Fix two values; the last two must sum to the rest: two pointers.' },
      { phrase: 'Two quadruplets are the same if they contain the same values', says: 'Skip duplicates at every level, so sort first.' },
    ],
    budget: { from: 'nums.length ≤ 200', n: 200, aim: 'O(n³)', note: 'Four loops: 1.6 × 10⁹. Three loops: 8 × 10⁶.' },
    observe: [
      {
        title: 'k-Sum reduces to (k − 1)-Sum',
        text: 'Fix the first value: what is left is 3Sum. Fix the second: Two Sum on a sorted range, solved with two pointers.',
      },
      {
        title: 'Sums can overflow',
        text: 'Four values near 10⁹ sum to 4 × 10⁹: use 64-bit arithmetic.',
      },
    ],
    brute: { idea: 'Try every combination of four positions and keep matches in a set.', cost: 'O(n⁴)', waste: 'The last two values are searched pair by pair, when two pointers find them in one sweep.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Sort, fix two values with nested loops, two pointers for the last pair, skipping repeats at each level: O(n³).',
      not: [
        { id: 'hashing', why: 'A set for the last value also gives O(n³), with harder de-duplication.' },
        { id: 'backtracking', why: 'Choosing 4 of n by backtracking is exponential without the sorted two-pointer finish.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sort: [−2, −1, 0, 0, 1, 2]', text: 'Target 0.' },
        { title: 'Fix −2, −1: need 3 from [0, 0, 1, 2]', text: '1 + 2 = 3 → [−2, −1, 1, 2].' },
        { title: 'Fix −2, 0 and −1, 0', text: 'Find [−2, 0, 0, 2] and [−1, 0, 0, 1]. Three quadruplets in total.' },
      ],
    },
    edges: ['Overflow: large values summed in 64 bits.', 'Fewer than four values → [].', 'Many repeated values.'],
  },

  'rotate-array': {
    read: [
      { phrase: 'Rotate `nums` to the right by `k` steps', says: 'The last k values move to the front, in the same order.' },
      { phrase: 'values pushed off the end wrap around to the front', says: 'Index i goes to (i + k) % n.' },
      { phrase: '`k` can be larger than the array\'s length', says: 'Rotating by n changes nothing: use k % n.' },
    ],
    budget: { from: 'nums.length, k ≤ 10⁵', rows: [['rotate one step, k times', '10⁵ × 10⁵ = 10¹⁰', 'bad'], ['three reversals', '2 × 10⁵ swaps', 'ok']], aim: 'O(n), O(1) space', note: 'An extra array is O(n) time but O(n) space.' },
    observe: [
      {
        title: 'Reversing the whole array gets the blocks in place',
        text: 'Reversing [1 … 7] puts 7, 6, 5 at the front: the right values, but backwards.',
        sketch: { kind: 'array', rows: [{ items: [7, 6, 5, 4, 3, 2, 1], bands: [{ from: 0, to: 2, tone: 'accent', label: 'last k' }] }] },
      },
      {
        title: 'Reverse each block back',
        text: 'Reverse the first k, then the rest: [5, 6, 7, 1, 2, 3, 4].',
        sketch: { kind: 'array', rows: [{ items: [5, 6, 7, 1, 2, 3, 4], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Move the last value to the front, shifting everything right, and repeat k % n times.', cost: 'O(n · k)', waste: 'Each value moves one step at a time instead of straight to its place.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Reversal is a two-pointer swap from both ends; three reversals rotate in place in O(n).',
      not: [
        { id: 'math-for-interviews', why: 'Cyclic replacement (following i → (i + k) % n, using the gcd) also works in O(1) space, but is easier to get wrong.' },
        { id: 'sliding-window', why: 'Nothing slides; whole blocks are reversed.' },
      ],
    },
    watch: {
      frames: [
        { title: 'k = 3 % 7 = 3. Reverse all', text: '[7, 6, 5, 4, 3, 2, 1].' },
        { title: 'Reverse the first 3', text: '[5, 6, 7, 4, 3, 2, 1].' },
        { title: 'Reverse the last 4', text: '[5, 6, 7, 1, 2, 3, 4].', sketch: { kind: 'array', rows: [{ items: [5, 6, 7, 1, 2, 3, 4], marks: { 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit' } }] } },
      ],
    },
    edges: ['k = 0 or a multiple of n: unchanged.', 'k > n: reduce with k % n first.', 'n = 1.'],
  },

  'trapping-rain-water': {
    read: [
      { phrase: 'water collects in the dips between taller bars', says: 'Each bar holds water up to a level set by walls on both sides.' },
      { phrase: 'the smaller of the tallest bar to its left and the tallest bar to its right', says: 'The per-bar formula: min(leftMax, rightMax) − height. Everything is about computing those maxima cheaply.' },
    ],
    budget: { from: 'n ≤ 2 × 10⁴', n: 2e4, aim: 'O(n), O(1) space', note: 'Scanning both sides for every bar is 4 × 10⁸: risky. Prefix maxima make it O(n) with O(n) space.' },
    observe: [
      {
        title: 'Water above a bar is set by both sides',
        text: 'Above bar i, water rises to the lower of the two tallest walls around it.',
        sketch: { kind: 'array', rows: [{ items: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], marks: { 3: 'target', 7: 'target', 5: 'cur' } }], caption: 'bar 5: min(2, 3) − 0 = 2 units' },
      },
      {
        title: 'The maxima are prefix and suffix maxima',
        text: 'leftMax[i] and rightMax[i] can be precomputed in two passes: O(n) time, O(n) space.',
      },
      {
        title: 'Only the smaller side matters',
        text: 'With pointers at both ends, if leftMax < rightMax, the left bar\'s water is fixed by leftMax (the right side is at least that tall). Settle it and move left; otherwise do the same on the right.',
      },
    ],
    brute: { idea: 'For each bar, scan left and right for the tallest walls and add min − height.', cost: 'O(n²)', waste: 'The same maxima are recomputed for every bar.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Two pointers with running maxima settle one bar per step from the side with the smaller max: O(n) time, O(1) space.',
      not: [
        { id: 'monotonic-stack', why: 'A decreasing stack fills water layer by layer: also O(n), but harder to get right.' },
        { id: 'prefix-sums', why: 'Prefix and suffix maxima arrays work (O(n) space); the two pointers remove those arrays.' },
      ],
    },
    watch: {
      frames: [
        { title: 'l = 0, r = 11', text: 'leftMax 0 < rightMax 1: settle the left side and move l.' },
        { title: 'Bars 2, 4, 5, 6 fill', text: 'Each is below the smaller running max on its side.', sketch: { kind: 'array', rows: [{ label: 'water', items: [0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0, 0], marks: { 2: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 9: 'hit' } }] } },
        { title: 'Total: 6', text: '1 + 1 + 2 + 1 + 1 = 6 units.' },
      ],
    },
    edges: ['Fewer than 3 bars → 0.', 'Strictly increasing or decreasing → 0.', 'Flat plateaus.'],
  },
};
