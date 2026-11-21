/** Practice thinking walkthroughs: two-pointers (format: src/data/think/index.js). */
export default {
  'valid-palindrome': {
    free: true,
    aha: 'A palindrome mirrors around its middle, so compare the first and last characters, then step both inwards. Skip anything that isn\'t a letter or digit on the way; no cleaned copy is needed.',
    asks: {
      observe: 'In "a, b a", which characters actually get compared, and which are skipped?',
      pattern: 'Which positions must match in a palindrome, and how can two indexes visit those pairs?',
    },
    read: [
      { phrase: 'reads the same forwards and backwards', says: 'Compare mirrored positions: first with last, second with second-to-last…. Two pointers from both ends.' },
      { phrase: 'throw away everything that is not a letter or a digit', says: 'Those characters don\'t take part: a pointer simply skips them.' },
      { phrase: 'turn every uppercase letter into lowercase', says: 'Compare ignoring case.' },
    ],
    budget: { from: 's.length ≤ 2 × 10⁵', n: 2e5, aim: 'O(n), O(1) space', note: 'Cleaning a copy and reversing it is also O(n), but builds two extra strings.' },
    observe: [
      {
        title: 'A palindrome is checked from the outside in',
        text: 'Pair the outermost characters, then step both ends inwards. One mismatch means it is not a palindrome.',
        sketch: { kind: 'array', rows: [{ items: ['r', 'a', 'c', 'e', 'c', 'a', 'r'], bands: [{ from: 0, to: 6, tone: 'ghost' }, { from: 1, to: 5, tone: 'accent' }], tags: { 0: [['l', 'interview']], 6: [['r', 'accent']] } }] },
      },
      {
        title: 'Skip what doesn\'t count instead of cleaning first',
        text: 'Each pointer jumps over spaces and punctuation before comparing.',
        sketch: { kind: 'array', rows: [{ items: ['a', ',', 'b', ' ', 'a'], marks: { 1: 'dim', 3: 'dim', 0: 'hit', 4: 'hit', 2: 'target' } }], caption: '"a, b a": a = a, then b meets itself in the middle' },
      },
    ],
    brute: { idea: 'Build the cleaned, lower-cased string, then compare it with its reverse.', cost: 'O(n)', waste: 'Already linear, but it builds two extra strings that two pointers make unnecessary.' },
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
        { title: '"A" vs "a": equal', text: 'Ignoring case they match; both ends move inwards.', sketch: { kind: 'array', rows: [{ items: ['A', ' ', 'm', 'a', 'n', '…', 'a', 'm', 'a'], marks: { 0: 'hit', 8: 'hit' } }] } },
        { title: 'Skip the space, compare "m" with "m"', text: 'The left pointer jumps over " "; the next pair matches too.', sketch: { kind: 'array', rows: [{ items: ['A', ' ', 'm', 'a', 'n', '…', 'a', 'm', 'a'], marks: { 1: 'dim', 2: 'hit', 7: 'hit' } }] } },
        { title: 'The pointers meet → true', text: 'Every pair matched, so "A man, a plan, a canal: Panama" is a palindrome.', sketch: { kind: 'array', rows: [{ label: 'cleaned', items: ['a', 'm', 'a', 'n', 'a', 'p', 'l', 'a', 'n', '…'], marks: { 0: 'hit' } }] } },
      ],
    },
    edges: ['Only punctuation: " " → true (empty after cleaning).', 'Digits count: "0P" → false.', 'Mixed case: "Aa" → true.'],
  },

  'remove-duplicates-from-sorted-array': {
    aha: 'In a sorted array, a value is new exactly when it differs from the last value you kept. Read with one index, write the new values with a second index that trails behind.',
    asks: {
      observe: 'In [1, 1, 2, 2, 2, 3], how can you tell, looking at just one neighbour, that a value is new?',
      pattern: 'If the answer goes at the front of the same array, how many indexes do you need?',
    },
    read: [
      { phrase: '`nums` is sorted in non-decreasing order', says: 'Equal values sit next to each other: a value is new exactly when it differs from the last one kept.' },
      { phrase: 'Rearrange it in place', says: 'No second array: write the answer over the front of nums.' },
      { phrase: 'Only the first `k` positions matter', says: 'Anything after the answer can be left as it is.' },
    ],
    budget: { from: 'nums.length ≤ 3 × 10⁴', n: 3e4, aim: 'O(n), O(1) space', note: 'Shifting elements left on every duplicate would be O(n²).' },
    observe: [
      {
        title: 'Sorted means copies are neighbours',
        text: 'Compare each value with the last value kept; equal means it is a copy.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 2, 2, 2, 3], marks: { 1: 'dim', 3: 'dim', 4: 'dim' } }], caption: 'the dimmed values repeat the one before them' },
      },
      {
        title: 'A write index trails the read index',
        text: 'w marks where the next new value goes. The read index runs ahead; w moves only when something new is found, so it never overtakes it.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit' }, tags: { 3: [['w', 'accent']], 5: [['read', 'interview']] } }], caption: 'the front [1, 2, 3] is the answer so far' },
      },
    ],
    brute: { idea: 'Collect each new value into a separate list, then copy the list over the front of nums.', cost: 'O(n)', waste: 'A second array, when the front of nums itself can hold the answer.' },
    pattern: {
      pick: 'two-pointers',
      why: 'A read index and a write index compact the array in place: one pass, O(1) space.',
      not: [
        { id: 'hashing', why: 'A set of seen values works for unsorted input, but the sorted order already tells us what is new.' },
        { id: 'sorting-and-selection', why: 'The array is already sorted; nothing to sort.' },
      ],
    },
    watch: { viz: 'ReadWriteViz', inputs: [{ label: '[1, 1, 2, 2, 2, 3, 5, 5]', input: { mode: 'dedupe', nums: [1, 1, 2, 2, 2, 3, 5, 5] } }] },
    edges: ['All values equal: [2, 2, 2] → k = 1.', 'All distinct: [1, 2, 3] → k = 3, nothing moves.', 'A single element: [7] → k = 1.'],
  },

  'move-zeroes': {
    aha: 'Instead of pushing zeros to the back, pull the non-zeros to the front in their order. Whatever is left behind them is zeros.',
    asks: {
      observe: 'In [0, 1, 0, 3, 12], where should 1, 3 and 12 end up, and in what order?',
      pattern: 'The non-zeros keep their order and fill the front. What does that need: one index, or two?',
    },
    read: [
      { phrase: 'keeping all non-zero values in their original relative order', says: 'Non-zeros keep their order, so we can\'t just swap from both ends.' },
      { phrase: 'Change the array in place; do not make a copy', says: 'A read index and a write index inside the same array.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n), O(1) space', note: 'Bubbling each zero to the end is O(n²).' },
    observe: [
      {
        title: 'Move the non-zeros forward, not the zeros back',
        text: 'If every non-zero is written to the next free slot at the front, in order, the zeros end up behind them automatically.',
        sketch: { kind: 'array', rows: [{ label: 'before', items: [0, 1, 0, 3, 12], marks: { 1: 'cur', 3: 'cur', 4: 'cur' } }, { label: 'after', items: [1, 3, 12, 0, 0], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] },
      },
      {
        title: 'Swapping keeps the zeros in the gap',
        text: 'With w at the first zero and i scanning ahead, swapping a non-zero at i with nums[w] keeps everything before w non-zero and everything between w and i zero.',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 0, 3, 12], marks: { 0: 'hit' }, tags: { 1: [['w', 'accent']], 3: [['i', 'interview']] } }], caption: 'swap 3 into the zero at w' },
      },
    ],
    brute: { idea: 'Copy the non-zeros into a new array, pad with zeros, and copy back.', cost: 'O(n)', waste: 'An extra array; the front of nums can collect the non-zeros itself.' },
    pattern: {
      pick: 'two-pointers',
      why: 'A write index collects non-zeros at the front, in order, while a read index scans: one pass, in place.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting would reorder the non-zeros, which must keep their order.' },
        { id: 'stack-patterns', why: 'Nothing is nested or undone; values just move forward.' },
      ],
    },
    watch: { viz: 'ReadWriteViz', inputs: [{ label: '[0, 1, 0, 3, 12]', input: { mode: 'zeroes', nums: [0, 1, 0, 3, 12] } }] },
    edges: ['No zeros: [1, 2] → [1, 2].', 'All zeros: [0, 0] → [0, 0].', 'Zeros already at the end: [1, 0, 0] → [1, 0, 0].'],
  },

  'squares-of-a-sorted-array': {
    aha: 'The biggest square always comes from one of the two ends (the most negative or the most positive number). So fill the answer from the back, each time taking the bigger end.',
    asks: {
      observe: 'In [−4, −1, 0, 3, 10], where is the largest square? And the second largest?',
      pattern: 'If the next-largest square is always at one of two ends, how do you collect them in order?',
    },
    read: [
      { phrase: 'may contain negative numbers', says: 'Squares of big negatives are big: squaring breaks the sorted order.' },
      { phrase: 'also sorted in non-decreasing order', says: 'We must produce the squares in order, not just compute them.' },
      { phrase: 'The interesting solution runs in O(n)', says: 'Sorting the squares (O(n log n)) is not the goal; use the order we were given.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'Square and sort is O(n log n): fine for time, but there is a linear method.' },
    observe: [
      {
        title: 'The biggest square is at one of the two ends',
        text: 'The largest size (ignoring sign) is either the most negative value (left end) or the most positive (right end).',
        sketch: { kind: 'array', rows: [{ items: [-4, -1, 0, 3, 10], marks: { 0: 'target', 4: 'hit' }, tags: { 0: [['16', 'warn']], 4: [['100', 'success']] } }] },
      },
      {
        title: 'Fill the answer from the back',
        text: 'Take the bigger end\'s square, write it in the last free slot, and move that end inwards. Repeat.',
        sketch: { kind: 'array', rows: [{ label: 'answer', items: ['·', '·', '·', 16, 100], marks: { 3: 'hit', 4: 'hit' } }], caption: 'the two biggest squares placed' },
      },
    ],
    brute: { idea: 'Square every value, then sort the result.', cost: 'O(n log n)', waste: 'Sorting ignores that the input is already sorted by value; only the negatives come out reversed.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Two pointers at the ends always hold the next-largest square; filling from the back gives O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting the squares is correct but O(n log n).' },
        { id: 'binary-search', why: 'Finding the first non-negative and merging outwards also works in O(n), with more edge cases.' },
      ],
    },
    watch: {
      frames: [
        { title: '|−4| vs |10|: write 100 last', text: 'The right end wins; move it left.', sketch: { kind: 'array', rows: [{ items: ['·', '·', '·', '·', 100], marks: { 4: 'hit' } }] } },
        { title: '|−4| vs |3|: write 16', text: 'The left end wins this time; move it right.', sketch: { kind: 'array', rows: [{ items: ['·', '·', '·', 16, 100], marks: { 3: 'hit' } }] } },
        { title: '|−1| vs |3|: write 9', text: 'Then 1 and 0 follow.', sketch: { kind: 'array', rows: [{ items: ['·', '·', 9, 16, 100], marks: { 2: 'hit' } }] } },
        { title: 'Done: [0, 1, 9, 16, 100]', text: 'The pointers have crossed; every square is placed.', sketch: { kind: 'array', rows: [{ items: [0, 1, 9, 16, 100], marks: { 0: 'hit', 1: 'hit' } }] } },
      ],
    },
    edges: ['All negative: [−3, −2] → [4, 9].', 'All non-negative: [1, 2] → [1, 4].', 'Equal sizes: [−3, 3] → [9, 9].'],
  },

  'remove-element': {
    aha: 'Don\'t delete (that shifts everything). Instead, copy every value you want to keep to the next free slot at the front; the write index ends up being the answer k.',
    asks: {
      observe: 'In [3, 2, 2, 3] with val = 3, which values end up at the front?',
      pattern: 'If you only keep some values and order is free, can one pass with a write index do it?',
    },
    read: [
      { phrase: 'Remove every occurrence of `val` from `nums`', says: 'Real deletion from an array means shifting. Overwriting is cheaper.' },
      { phrase: 'the first `k` positions of `nums` must hold exactly those kept values, in any order', says: 'Only the front matters, and order is free.' },
      { phrase: 'What is left beyond position `k` does not matter', says: 'We may overwrite freely.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n)', note: 'Tiny limits; the point is doing it in one pass without shifting.' },
    observe: [
      {
        title: 'Overwrite instead of delete',
        text: 'Copy each value that isn\'t val to the next free slot at the front. Values equal to val are simply never copied.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 2, 3], marks: { 0: 'bad', 3: 'bad' } }, { label: 'front after one pass', items: [2, 2, '·', '·'], marks: { 0: 'hit', 1: 'hit' } }], caption: 'val = 3, k = 2' },
      },
      {
        title: 'The write index is the answer',
        text: 'When the scan ends, the write index counts the kept values: it is k.',
        sketch: { kind: 'array', rows: [{ items: [2, 2, 2, 3], marks: { 0: 'hit', 1: 'hit' }, tags: { 2: [['w = 2', 'accent']] } }] },
      },
    ],
    brute: { idea: 'Each time val is found, shift everything after it one place left.', cost: 'O(n²)', waste: 'Every deletion moves the whole tail of the array.' },
    pattern: {
      pick: 'two-pointers',
      why: 'A read index scans and a write index collects the kept values: one pass, in place.',
      not: [
        { id: 'hashing', why: 'Nothing needs remembering; each value is kept or dropped on its own.' },
        { id: 'sorting-and-selection', why: 'Sorting is unnecessary: order is free and values just need filtering.' },
      ],
    },
    watch: {
      frames: [
        { title: '3: skip', text: 'Equal to val, so it is not copied. w stays 0.', sketch: { kind: 'array', rows: [{ items: [3, 2, 2, 3], marks: { 0: 'bad' }, tags: { 0: [['w', 'accent']] } }] } },
        { title: '2, 2: copy to slots 0 and 1', text: 'w becomes 2.', sketch: { kind: 'array', rows: [{ items: [2, 2, 2, 3], marks: { 0: 'hit', 1: 'hit' }, tags: { 2: [['w', 'accent']] } }] } },
        { title: '3: skip → k = 2', text: 'The first two slots hold [2, 2].', sketch: { kind: 'array', rows: [{ items: [2, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 3: 'bad' } }] } },
      ],
    },
    edges: ['An empty array: [] → 0.', 'Every value equals val: [3, 3] with val 3 → 0.', 'No value equals val: [1, 2] with val 3 → 2.'],
  },

  'reverse-string': {
    aha: 'Reversing swaps each character with its mirror. Swap the first and last, then step both inwards until they meet: n / 2 swaps, no extra array.',
    asks: {
      observe: 'In ["h","e","l","l","o"], which pairs get swapped, and which character never moves?',
      pattern: 'Which two positions does each swap involve, and how do they move?',
    },
    read: [
      { phrase: 'so the first character becomes the last', says: 'Position i swaps with its mirror, n − 1 − i.' },
      { phrase: 'Use O(1) extra memory: no second array', says: 'Swap in place from both ends.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 1e5, aim: 'O(n), O(1) space', note: 'Every character must move, so O(n) is the best possible.' },
    observe: [
      {
        title: 'Swap mirror pairs',
        text: 'Swap the outermost pair, then the next pair in, until the pointers meet in the middle.',
        sketch: { kind: 'array', rows: [{ items: ['h', 'e', 'l', 'l', 'o'], marks: { 0: 'cur', 4: 'cur' }, tags: { 0: [['l', 'interview']], 4: [['r', 'accent']] } }] },
      },
      {
        title: 'Stop when they meet',
        text: 'With an odd length the middle character stays put; with an even length the pointers simply cross.',
        sketch: { kind: 'array', rows: [{ items: ['o', 'l', 'l', 'e', 'h'], marks: { 2: 'target' }, tags: { 2: [['stays', 'warn']] } }] },
      },
    ],
    brute: { idea: 'Write the characters into a new array back to front, then copy them back.', cost: 'O(n)', waste: 'O(n) extra memory, which the problem forbids.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Pointers at both ends swap and move inwards: n / 2 swaps, no extra memory.',
      not: [
        { id: 'stack-patterns', why: 'Pushing everything and popping reverses too, but needs O(n) memory.' },
        { id: 'sliding-window', why: 'No window; the two ends meet in the middle.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Swap h and o', text: 'The ends trade places.', sketch: { kind: 'array', rows: [{ items: ['o', 'e', 'l', 'l', 'h'], marks: { 0: 'hit', 4: 'hit' } }] } },
        { title: 'Swap e and l', text: 'The next pair inwards.', sketch: { kind: 'array', rows: [{ items: ['o', 'l', 'l', 'e', 'h'], marks: { 1: 'hit', 3: 'hit' } }] } },
        { title: 'The pointers meet at the middle "l"', text: 'Done after two swaps: ["o","l","l","e","h"].', sketch: { kind: 'array', rows: [{ items: ['o', 'l', 'l', 'e', 'h'], marks: { 2: 'target' } }] } },
      ],
    },
    edges: ['A single character: ["a"] → ["a"].', 'Even length: ["a","b"] → ["b","a"] (the pointers cross).'],
  },

  'valid-palindrome-ii': {
    aha: 'Match characters from both ends. At the first mismatch, one of those two characters must be the one you delete, so try skipping the left one, then the right one, and check whether the rest is a palindrome.',
    asks: {
      observe: 'In "abca", where is the first mismatch, and which two deletions could fix it?',
      pattern: 'At the first mismatch, how many choices are there for the one deletion?',
    },
    read: [
      { phrase: 'can become a palindrome', says: 'Check palindromes from both ends, with a little leeway.' },
      { phrase: 'Deleting nothing is allowed', says: 'An existing palindrome is already a yes.' },
      { phrase: 'delete the "c" (or the "b")', says: 'At a mismatch there are exactly two candidates to delete: the left character or the right one.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Deleting each position and re-checking is O(n²), 10¹⁰ steps.' },
    observe: [
      {
        title: 'Match from both ends until the first mismatch',
        text: 'Matching outer pairs are fine whatever we delete later, so walk inwards while they agree.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a'], marks: { 0: 'hit', 3: 'hit', 1: 'bad', 2: 'bad' } }], caption: 'b ≠ c: one of them must go' },
      },
      {
        title: 'Try both, once',
        text: 'Skip b and check "c"; or skip c and check "b". Each check is a plain palindrome test on what is left.',
        sketch: { kind: 'array', rows: [{ label: 'skip b', items: ['a', 'b', 'c', 'a'], marks: { 1: 'dim', 2: 'hit' } }, { label: 'skip c', items: ['a', 'b', 'c', 'a'], marks: { 2: 'dim', 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Delete each position in turn and test whether the rest is a palindrome.', cost: 'O(n²)', waste: 'Most deletions are pointless: only the two characters at the first mismatch can be the one to remove.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Pointers from both ends, with a single branch at the first mismatch: at most two extra palindrome checks, O(n).',
      not: [
        { id: 'dp-strings', why: 'A table over (i, j) handles "k deletions", but is O(n²) for a single allowed deletion.' },
        { id: 'sliding-window', why: 'No window; we compare mirrored positions.' },
      ],
    },
    watch: {
      frames: [
        { title: '"abca": a = a', text: 'The ends match; move inwards.', sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a'], marks: { 0: 'hit', 3: 'hit' } }] } },
        { title: 'b ≠ c: the one mismatch', text: 'One of b or c must be deleted.', sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a'], marks: { 1: 'bad', 2: 'bad' } }] } },
        { title: 'Skip b: "c" is a palindrome → true', text: '(Skipping c would also work.)', sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a'], marks: { 1: 'dim', 2: 'hit' } }] } },
      ],
    },
    edges: ['Already a palindrome: "aba" → true.', 'Two mismatches needed: "abc" → false.', 'The extra letter at an end: "xaba" → true.'],
  },

  'merge-strings-alternately': {
    aha: 'Walk both words with one index each, taking a letter from word1, then from word2, until the shorter runs out; then add the rest of the longer word.',
    asks: {
      observe: 'Merging "ab" and "pqrs", what happens after "apbq"?',
      pattern: 'How many indexes do you need to walk two strings in step?',
    },
    read: [
      { phrase: 'taking letters from them in turn', says: 'One pointer per word, advancing together.' },
      { phrase: 'If one word is longer, add its remaining letters to the end', says: 'After the shorter word runs out, append the rest.' },
    ],
    budget: { from: 'both words ≤ 100 letters', n: 200, aim: 'O(m + n)', note: 'Tiny; just avoid rebuilding the string on every step.' },
    observe: [
      {
        title: 'Two pointers walking in step',
        text: 'Take word1[i], then word2[i], for each i while both still have letters.',
        sketch: { kind: 'array', rows: [{ label: 'word1', items: ['a', 'b', 'c'] }, { label: 'word2', items: ['p', 'q', 'r'] }, { label: 'merged', items: ['a', 'p', 'b', 'q', 'c', 'r'], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Then the leftover',
        text: 'Whatever remains of the longer word goes on the end unchanged.',
        sketch: { kind: 'array', rows: [{ label: '"ab" + "pqrs"', items: ['a', 'p', 'b', 'q', 'r', 's'], marks: { 4: 'target', 5: 'target' } }], caption: '"rs" is appended as it is' },
      },
    ],
    brute: { idea: 'Build the answer with string + one letter at a time.', cost: 'O((m + n)²)', waste: 'Each + copies the whole string so far; a StringBuilder appends without copying.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Two pointers walk two sequences in step, the same loop shape as merging two sorted lists.',
      not: [
        { id: 'sliding-window', why: 'No window over one sequence; we interleave two.' },
        { id: 'stack-patterns', why: 'No nesting or undoing involved.' },
      ],
    },
    watch: {
      frames: [
        { title: 'i = 0: a, p', text: 'Take one letter from each word.', sketch: { kind: 'array', rows: [{ items: ['a', 'p'], marks: { 0: 'hit', 1: 'hit' } }] } },
        { title: 'i = 1, 2: b, q, c, r', text: 'Keep alternating while both have letters.', sketch: { kind: 'array', rows: [{ items: ['a', 'p', 'b', 'q', 'c', 'r'], marks: { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit' } }] } },
        { title: 'Both done → "apbqcr"', text: 'Equal lengths: nothing left to append.', sketch: { kind: 'array', rows: [{ items: ['a', 'p', 'b', 'q', 'c', 'r'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit' } }] } },
      ],
    },
    edges: ['word2 longer: "ab", "pqrs" → "apbqrs".', 'word1 longer: "abcd", "pq" → "apbqcd".', 'Single letters: "a", "b" → "ab".'],
  },

  'merge-sorted-array': {
    aha: 'The free space is at the end of nums1, so merge from the back: compare the two largest remaining values and write the bigger one into the last free slot. Nothing unread ever gets overwritten.',
    asks: {
      observe: 'If you merged from the front, what would happen to nums1\'s values 2 and 3 when you write into slot 1?',
      pattern: 'Where is the empty space, and in which direction should you fill it?',
    },
    read: [
      { phrase: 'its last `n` slots are zeros you can overwrite', says: 'The free space is at the end of nums1: fill from the back.' },
      { phrase: 'Merge `nums2` into `nums1`', says: 'A merge of two sorted lists, done in place.' },
      { phrase: 'also sorted', says: 'Both inputs are sorted: compare their largest remaining values.' },
    ],
    budget: { from: 'm + n ≤ 200', n: 200, aim: 'O(m + n)', note: 'Small limits; copying in and sorting works, but the intended solution is a linear merge.' },
    observe: [
      {
        title: 'Merging from the front overwrites values you still need',
        text: 'Writing nums2\'s 2 into nums1[1] would destroy nums1\'s 2, which hasn\'t been compared yet.',
        sketch: { kind: 'array', rows: [{ label: 'nums1', items: [1, 2, 3, 0, 0, 0], marks: { 1: 'bad' }, tags: { 1: [['would be lost', 'danger']] } }] },
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
      why: 'Three indexes (end of nums1\'s values, end of nums2, write position) merge from the back in O(m + n), in place.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting works but throws away the order we already have.' },
        { id: 'heap-patterns', why: 'A heap merges many lists; for two lists, direct comparison is simpler.' },
      ],
    },
    watch: {
      frames: [
        { title: '3 vs 6: write 6', text: 'The larger last value goes into the last slot.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 0, 0, 6], marks: { 5: 'hit' } }] } },
        { title: '3 vs 5: write 5', text: 'nums2 still has the larger value.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 0, 5, 6], marks: { 4: 'hit' } }] } },
        { title: '3 vs 2: write 3', text: 'Now nums1\'s 3 is larger.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 3, 5, 6], marks: { 3: 'hit' } }] } },
        { title: '2 vs 2: write 2 → done', text: 'nums2 is used up; the rest of nums1 is already in place: [1, 2, 2, 3, 5, 6].', sketch: { kind: 'array', rows: [{ items: [1, 2, 2, 3, 5, 6], marks: { 2: 'hit' } }] } },
      ],
    },
    edges: ['m = 0: [0], m 0, [1] → [1].', 'n = 0: [1], m 1, [], n 0 → [1].', 'Every nums2 value smaller: [4, 5, 0, 0], [1, 2] → [1, 2, 4, 5].'],
  },

  'two-sum-ii-input-array-is-sorted': {
    aha: 'Start with the smallest and the largest value. If their sum is too small, only a bigger left value can help; if too big, only a smaller right value can. Each step throws away one value for good.',
    asks: {
      observe: 'For [2, 7, 11, 15] and target 9, 2 + 15 is too big. Can 15 be part of any answer?',
      pattern: 'In a sorted array, what does "the sum is too big" tell you about the right end?',
    },
    read: [
      { phrase: 'sorted in non-decreasing order', says: 'Sorted input: the sum of the two ends tells us which end to move.' },
      { phrase: 'Use only constant extra space, so no hash map', says: 'Rules out the Two Sum map; the order must do the work.' },
      { phrase: 'Exactly one pair works', says: 'Stop at the first match.' },
    ],
    budget: { from: 'numbers.length ≤ 3 × 10⁴', n: 3e4, aim: 'O(n), O(1) space', note: 'Every pair is 4.5 × 10⁸: too slow. Binary search per value is O(n log n).' },
    observe: [
      {
        title: 'Too small? Move left. Too big? Move right.',
        text: 'A sum below target can only grow by moving the left pointer up; above target, only by moving the right pointer down.',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 11, 15], marks: { 0: 'cur', 3: 'cur' }, tags: { 0: [['l', 'interview']], 3: [['r', 'accent']] } }], caption: '2 + 15 = 17 > 9: move r' },
      },
      {
        title: 'Each move rules out a whole value',
        text: 'If 2 + 15 is too big, 15 is too big with every remaining value too, since 2 is the smallest. Dropping 15 is safe.',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 11, 15], marks: { 3: 'muted' }, tags: { 3: [['out', 'muted']] } }] },
      },
    ],
    brute: { idea: 'Try every pair (i, j).', cost: 'O(n²)', waste: 'It ignores the order: one comparison can eliminate a value entirely.' },
    pattern: {
      pick: 'two-pointers',
      why: 'On sorted data, pointers at both ends close in on the pair; each step safely discards one value. O(n), O(1) space.',
      not: [
        { id: 'hashing', why: 'The Two Sum map works but uses O(n) space, which is ruled out.' },
        { id: 'binary-search', why: 'Binary-searching each partner is O(n log n): correct, but slower.' },
      ],
    },
    watch: { viz: 'PairSumViz', inputs: [{ label: '[2, 7, 11, 15], target 9', input: { nums: [2, 7, 11, 15], target: 9 } }, { label: '[1, 3, 4, 6, 8, 11, 15], target 14', input: { nums: [1, 3, 4, 6, 8, 11, 15], target: 14 } }] },
    edges: ['Positions are 1-based: [2, 7, 11, 15], 9 → [1, 2].', 'Negative numbers: [−1, 0], −1 → [1, 2].', 'Equal values: [3, 3], 6 → [1, 2].'],
  },

  'container-with-most-water': {
    aha: 'Start with the widest container. Its shorter wall limits the water, and moving the taller wall inwards can only lose width without raising that limit, so always move the shorter wall.',
    asks: {
      observe: 'For the widest pair (heights 1 and 7), which wall limits the water? Could keeping it ever do better?',
      pattern: 'Moving which wall could possibly make the container hold more water?',
    },
    read: [
      { phrase: 'Choose two lines', says: 'A pair of positions: about n² / 2 pairs if tried one by one.' },
      { phrase: 'the distance between the lines times the height of the shorter line', says: 'Area = width × the shorter height: the shorter wall caps the water.' },
      { phrase: 'Return the largest amount of water', says: 'Maximise over pairs: we need a reason to skip most of them.' },
    ],
    budget: { from: 'n ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'All pairs is 5 × 10⁹.' },
    observe: [
      {
        title: 'Start with the widest container',
        text: 'Lines 0 and n − 1 give the biggest width. Any other pair is narrower, so it needs a taller short wall to win.',
        sketch: { kind: 'array', rows: [{ items: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 0: 'bad', 8: 'cur' }, bands: [{ from: 0, to: 8, tone: 'ghost' }] }], caption: 'width 8 × min(1, 7) = 8' },
      },
      {
        title: 'Moving the taller wall can never help',
        text: 'The width shrinks and the level is still capped by the short wall. Only moving the short wall might find a higher level.',
        sketch: { kind: 'array', rows: [{ items: [1, 8, 6, 2, 5, 4, 8, 3, 7], marks: { 1: 'cur', 8: 'cur', 0: 'muted' }, bands: [{ from: 1, to: 8, tone: 'accent' }] }], caption: 'drop the 1: width 7 × min(8, 7) = 49' },
      },
    ],
    brute: { idea: 'Compute min(h[i], h[j]) × (j − i) for every pair and keep the largest.', cost: 'O(n²)', waste: 'Most pairs are provably worse than one already measured: keeping a short wall and narrowing never helps.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Pointers at both ends; always move the shorter wall, because it is the only move that can improve the area. O(n).',
      not: [
        { id: 'monotonic-stack', why: 'The largest rectangle in a histogram uses a stack; here the water depends only on the two chosen walls.' },
        { id: 'sliding-window', why: 'The window shrinks from both sides by a rule about the walls, not by a valid/invalid condition.' },
      ],
    },
    watch: { viz: 'ContainerViz', inputs: [{ label: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', input: { heights: [1, 8, 6, 2, 5, 4, 8, 3, 7] } }] },
    edges: ['Two lines only: [1, 1] → 1.', 'Equal heights at both ends: [4, 1, 4] → 8 (move either).', 'A zero-height line: [0, 2] → 0.'],
  },

  '3sum': {
    aha: 'Sort the array, then fix the first number a. What remains is "find two numbers after it that sum to −a", which two pointers solve in one sweep. Skipping equal neighbours keeps triplets unique.',
    asks: {
      observe: 'After sorting [−1, 0, 1, 2, −1, −4], fix a = −1. Which pairs after it sum to 1?',
      pattern: 'Once one number is fixed, what problem is left for the other two?',
    },
    read: [
      { phrase: '`a + b + c == 0`', says: 'Fix a, and the other two must sum to −a: Two Sum, repeated for each a.' },
      { phrase: 'three different positions', says: 'Each index used once.' },
      { phrase: 'Each triplet of values may appear only once', says: 'Duplicates must be skipped; sorting puts equal values side by side, which makes that easy.' },
    ],
    budget: { from: 'nums.length ≤ 3000', n: 3000, aim: 'O(n²)', note: 'Three nested loops are 2.7 × 10¹⁰; O(n²) is 9 × 10⁶.' },
    observe: [
      {
        title: 'Fix one value; the rest is Two Sum',
        text: 'For each a, find pairs b + c = −a among the values after it.',
        sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 1: 'cur', 2: 'hit', 5: 'hit' }, tags: { 1: [['a', 'accent']] } }], caption: 'a = −1: −1 + 2 = 1 = −a' },
      },
      {
        title: 'Sorting makes the pointers work and removes repeats',
        text: 'On the sorted array, two pointers find all pairs for each a in one sweep; skipping a value equal to the previous one stops repeated triplets.',
        sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 2: 'muted' }, tags: { 2: [['skip as a', 'muted']] } }] },
      },
    ],
    brute: { idea: 'Try every triple of positions and keep matches in a set of sorted triplets.', cost: 'O(n³)', waste: 'For each pair it searches again for the third value, which two pointers find in one sweep.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Sort, fix the first value, then two pointers find the remaining pairs: O(n²), with repeats skipped by comparing neighbours.',
      not: [
        { id: 'hashing', why: 'A hash set per fixed value also gives O(n²), but removing duplicate triplets becomes awkward.' },
        { id: 'binary-search', why: 'Binary-searching the third value is O(n² log n).' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sort: [−4, −1, −1, 0, 1, 2]', text: 'Equal values are now neighbours and the pointers can steer.', sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2] }] } },
        { title: 'a = −4: need 4 from the rest', text: 'The largest pair is 1 + 2 = 3 < 4: no triplet.', sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 0: 'cur', 4: 'muted', 5: 'muted' } }] } },
        { title: 'a = −1: [−1, −1, 2] and [−1, 0, 1]', text: 'Both pairs sum to 1.', sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 1: 'cur', 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit' } }] } },
        { title: 'The second −1: skip → done', text: 'Same value as before, so it would only repeat triplets. Answer: [[−1, −1, 2], [−1, 0, 1]].', sketch: { kind: 'array', rows: [{ items: [-4, -1, -1, 0, 1, 2], marks: { 2: 'muted' } }] } },
      ],
    },
    edges: ['All zeros: [0, 0, 0] → [[0, 0, 0]].', 'No triplet: [1, 2, 3] → [].', 'Many repeats: [0, 0, 0, 0] → [[0, 0, 0]] (once).'],
  },

  'sort-colors': {
    aha: 'Keep three regions: 0s at the front, 2s at the back, 1s in between, and an unknown middle. Look at the first unknown value and send it to its region with one swap.',
    asks: {
      observe: 'If you swap a 2 to the back, why can\'t you move past the position you just swapped into?',
      pattern: 'With only three values, how many boundaries do you need to keep track of?',
    },
    read: [
      { phrase: 'holds only the values `0`, `1` and `2`', says: 'Three groups: a three-way split (or counting).' },
      { phrase: 'Do not use a library sort', says: 'Use the fact that there are only three values.' },
      { phrase: 'the classic solution needs only one pass and constant extra space', says: 'The Dutch national flag: three pointers.' },
    ],
    budget: { from: 'n ≤ 300', n: 300, aim: 'O(n), one pass', note: 'Speed is not the issue; one pass in place is the goal.' },
    observe: [
      {
        title: 'Three regions plus an unknown middle',
        text: '[0, lo) holds 0s, [lo, mid) holds 1s, (hi, n − 1] holds 2s, and [mid, hi] has not been looked at yet.',
        sketch: { kind: 'array', rows: [{ items: [0, 0, 1, 2, 1, 2, 2], bands: [{ from: 0, to: 1, tone: 'success', label: '0s' }, { from: 2, to: 2, tone: 'accent', label: '1s' }, { from: 3, to: 4, tone: 'ghost', label: '?' }, { from: 5, to: 6, tone: 'danger', label: '2s' }] }] },
      },
      {
        title: 'One look, one move',
        text: 'nums[mid] is 0: swap it to lo and move both on. 1: just move mid. 2: swap it to hi and move hi back, but don\'t move mid, because the value that came back is still unknown.',
        sketch: { kind: 'array', rows: [{ items: [2, 0, 1], marks: { 0: 'cur', 2: 'target' }, tags: { 0: [['mid', 'accent']], 2: [['hi', 'warn']] } }], caption: 'the 2 goes to hi; the 1 that comes back is checked next' },
      },
    ],
    brute: { idea: 'Count the 0s, 1s and 2s, then overwrite the array.', cost: 'O(n)', waste: 'Two passes; the three-way split does it in one.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Three pointers grow three regions from both ends: one pass, in place.',
      not: [
        { id: 'sorting-and-selection', why: 'A general sort is O(n log n) and ruled out by the statement.' },
        { id: 'hashing', why: 'Counting values works, but needs two passes.' },
      ],
    },
    watch: { viz: 'DutchFlagViz', inputs: [{ label: '[2, 0, 2, 1, 1, 0]', input: { nums: [2, 0, 2, 1, 1, 0] } }] },
    edges: ['All one colour: [1, 1] → [1, 1].', 'Already sorted: [0, 1, 2] → [0, 1, 2].', 'Reverse sorted: [2, 1, 0] → [0, 1, 2].'],
  },

  '4sum': {
    aha: 'It is 3Sum with one more fixed number: sort, fix the first two values with two loops, and find the last two with pointers moving inwards, skipping repeated values at every level.',
    asks: {
      observe: 'After sorting [1, 0, −1, 0, −2, 2], fix −2 and −1. What must the last two add up to?',
      pattern: 'How did 3Sum reduce to Two Sum? Can the same trick reduce 4Sum to 3Sum?',
    },
    read: [
      { phrase: 'four different indices', says: 'Four nested choices: reduce it like 3Sum, one level further.' },
      { phrase: 'add up to `target`', says: 'Fix two values; the last two must sum to what is left: two pointers.' },
      { phrase: 'Two quadruplets are the same if they contain the same values', says: 'Skip repeats at every level, so sort first.' },
    ],
    budget: { from: 'nums.length ≤ 200', n: 200, aim: 'O(n³)', note: 'Four loops: 1.6 × 10⁹. Three loops: 8 × 10⁶.' },
    observe: [
      {
        title: 'Fix two values, then two pointers',
        text: 'With −2 and −1 fixed, the last two must sum to 0 − (−2) − (−1) = 3: two pointers on the rest find 1 + 2.',
        sketch: { kind: 'array', rows: [{ items: [-2, -1, 0, 0, 1, 2], marks: { 0: 'cur', 1: 'cur', 4: 'hit', 5: 'hit' } }], caption: '[−2, −1, 1, 2]' },
      },
      {
        title: 'Sums can overflow',
        text: 'Four values near 10⁹ add up to 4 × 10⁹, beyond a 32-bit int: add them as long.',
        sketch: { kind: 'array', rows: [{ items: ['10⁹', '10⁹', '10⁹', '10⁹'], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'bad' } }], caption: 'sum 4 × 10⁹ > 2³¹ − 1' },
      },
    ],
    brute: { idea: 'Try every combination of four positions and keep matches in a set.', cost: 'O(n⁴)', waste: 'The last two values are searched pair by pair, when two pointers find them in one sweep.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Sort, fix two values with nested loops, two pointers for the last pair, skipping repeats at each level: O(n³).',
      not: [
        { id: 'hashing', why: 'A set for the last value also gives O(n³), with harder duplicate removal.' },
        { id: 'backtracking', why: 'Choosing 4 of n by trying everything is far slower without the sorted two-pointer finish.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sort: [−2, −1, 0, 0, 1, 2]', text: 'Target 0.', sketch: { kind: 'array', rows: [{ items: [-2, -1, 0, 0, 1, 2] }] } },
        { title: 'Fix −2, −1: need 3', text: '1 + 2 = 3 → [−2, −1, 1, 2].', sketch: { kind: 'array', rows: [{ items: [-2, -1, 0, 0, 1, 2], marks: { 0: 'cur', 1: 'cur', 4: 'hit', 5: 'hit' } }] } },
        { title: 'Fix −2, 0: need 2', text: '0 + 2 = 2 → [−2, 0, 0, 2].', sketch: { kind: 'array', rows: [{ items: [-2, -1, 0, 0, 1, 2], marks: { 0: 'cur', 2: 'cur', 3: 'hit', 5: 'hit' } }] } },
        { title: 'Fix −1, 0: need 1 → done', text: '0 + 1 = 1 → [−1, 0, 0, 1]. Three quadruplets in total.', sketch: { kind: 'array', rows: [{ items: [-2, -1, 0, 0, 1, 2], marks: { 1: 'cur', 2: 'cur', 3: 'hit', 4: 'hit' } }] } },
      ],
    },
    edges: ['Large values: [10⁹, 10⁹, 10⁹, 10⁹], target −294967296 → [] (only overflow would "find" it).', 'Fewer than four values: [1, 2, 3], 6 → [].', 'Many repeats: [2, 2, 2, 2, 2], 8 → [[2, 2, 2, 2]].'],
  },

  'rotate-array': {
    aha: 'Reversing the whole array brings the last k values to the front, but backwards. Reverse those k back, then reverse the rest back, and the rotation is done in place.',
    asks: {
      observe: 'Reverse [1, 2, 3, 4, 5, 6, 7]. Where did 5, 6 and 7 end up, and in what order?',
      pattern: 'Can two more reversals fix the order inside each block?',
    },
    read: [
      { phrase: 'Rotate `nums` to the right by `k` steps', says: 'The last k values move to the front, in the same order.' },
      { phrase: 'values pushed off the end wrap around to the front', says: 'Index i goes to (i + k) % n.' },
      { phrase: '`k` can be larger than the array\'s length', says: 'Rotating by n changes nothing: use k % n.' },
    ],
    budget: { from: 'nums.length, k ≤ 10⁵', rows: [['rotate one step, k times', '10⁵ × 10⁵ = 10¹⁰', 'bad'], ['three reversals', '2 × 10⁵ swaps', 'ok']], aim: 'O(n), O(1) space', note: 'An extra array is O(n) time but O(n) space.' },
    observe: [
      {
        title: 'Reversing everything gets the blocks in place',
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
      why: 'A reversal is a two-pointer swap from both ends; three reversals rotate in place in O(n).',
      not: [
        { id: 'math-for-interviews', why: 'Moving each value straight to (i + k) % n in cycles also works in O(1) space, but is easier to get wrong.' },
        { id: 'sliding-window', why: 'Nothing slides; whole blocks are reversed.' },
      ],
    },
    watch: {
      frames: [
        { title: 'k = 3 % 7 = 3. Reverse all', text: '[7, 6, 5, 4, 3, 2, 1].', sketch: { kind: 'array', rows: [{ items: [7, 6, 5, 4, 3, 2, 1] }] } },
        { title: 'Reverse the first 3', text: '[5, 6, 7, 4, 3, 2, 1].', sketch: { kind: 'array', rows: [{ items: [5, 6, 7, 4, 3, 2, 1], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] } },
        { title: 'Reverse the last 4 → done', text: '[5, 6, 7, 1, 2, 3, 4].', sketch: { kind: 'array', rows: [{ items: [5, 6, 7, 1, 2, 3, 4], marks: { 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit' } }] } },
      ],
    },
    edges: ['k = 0: [1, 2] → [1, 2].', 'k larger than n: [1, 2], k 3 → [2, 1] (3 % 2 = 1).', 'A single element: [5], k 4 → [5].'],
  },

  'trapping-rain-water': {
    aha: 'The water above a bar rises to the lower of the tallest walls on its left and right. With pointers at both ends, whichever side has the lower wall so far already knows its answer, because the other side is guaranteed to be at least that tall.',
    asks: {
      read: 'Which sentence gives you the exact formula for the water above one bar?',
      observe: 'Above bar 5 (height 0), what are the tallest walls on its left and on its right? How much water sits there?',
      brute: 'For each bar, how far do you scan to find its two walls?',
      pattern: 'If the left wall so far is shorter than the right wall so far, does anything between them change the water above the next left bar?',
      watch: 'Watch which side settles each bar, and why.',
    },
    read: [
      { phrase: 'water collects in the dips between taller bars', says: 'Each bar holds water up to a level set by walls on both sides.' },
      { phrase: 'the smaller of the tallest bar to its left and the tallest bar to its right', says: 'The per-bar formula: min(leftMax, rightMax) − height. Everything is about getting those two walls cheaply.' },
    ],
    budget: { from: 'n ≤ 2 × 10⁴', n: 2e4, aim: 'O(n), O(1) space', note: 'Scanning both sides for every bar is 4 × 10⁸: risky. Storing the walls in two arrays makes it O(n) with O(n) space.' },
    observe: [
      {
        title: 'Water above a bar is set by both sides',
        text: 'Above bar 5 (height 0), the tallest wall on the left is 2 and on the right is 3. Water rises to the lower one: 2 units.',
        sketch: { kind: 'array', rows: [{ items: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], marks: { 3: 'target', 7: 'target', 5: 'cur' } }], caption: 'bar 5: min(2, 3) − 0 = 2' },
      },
      {
        title: 'Only the lower wall matters',
        text: 'If the left wall so far (say 1) is lower than the right wall so far (say 3), the next left bar\'s water is decided by the 1: the right side will never be lower than 3. So settle that bar and move on.',
        sketch: { kind: 'array', rows: [{ label: 'water per bar', items: [0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0, 0], marks: { 2: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 9: 'hit' } }], caption: 'the answer: 1 + 1 + 2 + 1 + 1 = 6' },
      },
    ],
    brute: { idea: 'For each bar, scan left and right for the tallest walls and add min − height.', cost: 'O(n²)', waste: 'The same walls are re-found for every bar.' },
    pattern: {
      pick: 'two-pointers',
      why: 'Two pointers with running walls settle one bar per step, from the side with the lower wall: O(n) time, O(1) space.',
      not: [
        { id: 'monotonic-stack', why: 'A decreasing stack fills the water layer by layer: also O(n), but harder to get right.' },
        { id: 'prefix-sums', why: 'Arrays of the tallest wall so far from each side work (O(n) space); the two pointers remove those arrays.' },
      ],
    },
    watch: { viz: 'TrapWaterViz', inputs: [{ label: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', input: { heights: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] } }, { label: '[4, 2, 0, 3, 2, 5] (the right side decides)', input: { heights: [4, 2, 0, 3, 2, 5] } }] },
    edges: ['Fewer than 3 bars: [2, 1] → 0.', 'Always rising: [1, 2, 3] → 0.', 'A flat floor between walls: [3, 0, 0, 3] → 6.'],
  },
};
