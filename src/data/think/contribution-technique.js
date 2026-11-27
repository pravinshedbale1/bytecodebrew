/** Practice thinking walkthroughs: contribution-technique (format: src/data/think/index.js). */

const notBrute = (id, why) => ({ id, why });
const notPrefix = (why) => ({ id: 'prefix-sums', why });

export default {
  'sum-of-all-odd-length-subarrays': {
    free: true,
    aha: 'Flip the question: instead of summing every subarray, ask how many odd-length subarrays contain arr[i]. A subarray containing i has (i + 1) choices of start and (n − i) of end; it has odd length when the start and end are the same distance-parity from i. That count is ((i + 1)(n − i) + 1) / 2, and the answer is Σ arr[i] × count.',
    asks: {
      read: 'Which subarrays count, and what is added up?',
      budget: 'n ≤ 100. The brute force is fine here; what does the follow-up ask for?',
      observe: 'For [1, 4, 2, 5, 3], how many odd-length subarrays contain the middle 2?',
      brute: 'Listing every odd-length subarray and summing it: what does that cost?',
      pattern: 'Each element is added once per subarray that contains it. How many is that?',
      watch: 'Watch each element\'s count of odd-length subarrays, then its share of the total.',
    },
    read: [
      { phrase: 'Consider every contiguous subarray of `arr` whose length is odd', says: 'Subarrays by start and end: count how many contain each index.' },
      { phrase: 'Return the sum of all the elements of all those subarrays', says: 'Each element is added once per subarray containing it: Σ value × count.' },
      { phrase: 'can you do it in O(n) time and O(1) space', says: 'One formula per element.' },
    ],
    budget: { from: 'n ≤ 100 (follow-up: O(n))', rows: [['every subarray, summed', 'n³ = 10⁶', 'ok', 'fine here'], ['count per element', 'n', 'ok', 'the follow-up']], aim: 'O(n)', note: 'Prefix sums give O(n²) in between.' },
    observe: [
      {
        title: 'Count the subarrays containing index 2',
        text: 'Starts 0..2 (3 choices), ends 2..4 (3 choices): 9 subarrays contain the 2. Of those, 5 have odd length.',
        sketch: { kind: 'array', rows: [{ items: [1, 4, 2, 5, 3], marks: { 2: 'cur' }, bands: [{ from: 0, to: 4, tone: 'accent', label: '3 × 3 = 9' }] }], caption: 'odd: (9 + 1) / 2 = 5' },
      },
      {
        title: 'Weight every element',
        text: 'Counts of odd-length subarrays containing each index: 3, 4, 5, 4, 3. Sum: 1·3 + 4·4 + 2·5 + 5·4 + 3·3 = 58.',
        sketch: { kind: 'array', rows: [{ label: 'arr', items: [1, 4, 2, 5, 3] }, { label: 'count', items: [3, 4, 5, 4, 3], marks: { 2: 'hit' } }], caption: '58' },
      },
    ],
    brute: { idea: 'For every start and every odd length, add up the subarray.', cost: 'O(n³)', waste: 'The same elements are re-added in every overlapping subarray; each one\'s total number of appearances can be counted directly.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'For each i: total = (i + 1)(n − i); odd = (total + 1) / 2; answer += arr[i] × odd. O(n), O(1).',
      not: [notPrefix('Prefix sums make each subarray sum O(1), but there are still O(n²) subarrays.'), notBrute('sliding-window', 'A window per length works but is O(n²) overall.')],
    },
    watch: { viz: 'SpanViz', inputs: [{ label: '[1, 4, 2, 5, 3]', input: { mode: 'odd', nums: [1, 4, 2, 5, 3] } }, { label: '[10, 11, 12]', input: { mode: 'odd', nums: [10, 11, 12] } }] },
    edges: ['One element: [7] → 7.', 'Two elements: [1, 2] → 3 (only the single-element subarrays are odd).', '[10, 11, 12] → 66.'],
  },

  'number-of-zero-filled-subarrays': {
    aha: 'Count each subarray at its right end. An all-zero subarray ending at i can start anywhere inside the run of zeros that ends at i, so it adds (that run\'s length). Keep the current run length and add it at every index.',
    asks: {
      read: 'Which subarrays count?',
      budget: '10⁵ numbers. Can you list every subarray?',
      observe: 'In [1, 3, 0, 0, 2, 0, 0, 4], how many all-zero subarrays end at the second 0?',
      brute: 'Checking every subarray for all zeros: what does it cost?',
      pattern: 'Where can an all-zero subarray ending at i start?',
      watch: 'Watch the run of zeros grow and each index add its run length.',
    },
    read: [
      { phrase: 'how many contiguous, non-empty subarrays', says: 'A count of subarrays: count each one at its right end.' },
      { phrase: 'consist only of zeros', says: 'Only runs of zeros matter: an all-zero subarray lives inside one run.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['check every subarray', 'n² = 10¹⁰', 'bad', 'too slow'], ['run length per index', '10⁵', 'ok', 'instant']], aim: 'O(n)', note: 'The total can exceed 2³¹: use a long.' },
    observe: [
      {
        title: 'A run of two zeros gives three subarrays',
        text: 'The run 0, 0 holds [0], [0] and [0, 0]: 1 ending at the first zero, 2 ending at the second.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 0, 0, 2], marks: { 2: 'cur', 3: 'cur' }, tags: { 2: [['+1', 'success']], 3: [['+2', 'success']] } }] },
      },
      {
        title: 'A non-zero resets the run',
        text: 'After the 2, the next zero starts a new run of length 1.',
        sketch: { kind: 'array', rows: [{ items: [0, 0, 2, 0], marks: { 2: 'bad' }, tags: { 3: [['+1', 'success']] } }] },
      },
    ],
    brute: { idea: 'Check every subarray and count those made only of zeros.', cost: 'O(n²)', waste: 'Every subarray of a long run is checked separately, though a run of length L simply holds L(L + 1)/2 of them.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'run = x == 0 ? run + 1 : 0; total += run. O(n), O(1).',
      not: [notBrute('sliding-window', 'A window over zeros works, but "add the run length" is already the whole count.'), notBrute('math-for-interviews', 'Summing L(L + 1)/2 per run is the same thing done per run instead of per index.')],
    },
    watch: { viz: 'ContribWalkViz', inputs: [{ label: '[1, 3, 0, 0, 2, 0, 0, 4]', input: { mode: 'zeros', nums: [1, 3, 0, 0, 2, 0, 0, 4] } }, { label: '[0, 0, 0, 2, 0, 0]', input: { mode: 'zeros', nums: [0, 0, 0, 2, 0, 0] } }] },
    edges: ['No zeros: [2, 10, 2019] → 0.', '[1, 3, 0, 0, 2, 0, 0, 4] → 6.', '[0, 0, 0, 2, 0, 0] → 9 (6 + 3).'],
  },

  'vowels-of-all-substrings': {
    aha: 'Flip the question: how many substrings contain the vowel at position i? Any start from 0 to i (i + 1 choices) with any end from i to n − 1 (n − i choices). Each such substring counts that vowel once, so the answer is Σ over vowels of (i + 1)(n − i).',
    asks: {
      read: 'What is being added up, and how big can it get?',
      budget: '10⁵ letters. How many substrings is that?',
      observe: 'In "aba", how many substrings contain the middle letter? The first?',
      brute: 'Counting the vowels in every substring: what does it cost?',
      pattern: 'How many substrings contain a given position?',
      watch: 'Watch each vowel add (starts) × (ends).',
    },
    read: [
      { phrase: 'return the total number of vowels', says: 'Each vowel occurrence is counted once per substring it is in.' },
      { phrase: 'in every substring of `word`, added up', says: 'Swap the order: per vowel, count the substrings containing it.' },
      { phrase: 'The answer can be larger than a 32-bit integer', says: 'Use a long.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every substring', 'n² / 2 = 5 × 10⁹', 'bad', 'too slow'], ['one formula per letter', '10⁵', 'ok', 'instant']], aim: 'O(n)', note: 'Watch for overflow in (i + 1) * (n − i): cast to long first.' },
    observe: [
      {
        title: 'Starts × ends',
        text: '"aba": the first a is in 1 × 3 = 3 substrings, the last a in 3 × 1 = 3. Total 6.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'a'], marks: { 1: 'dim' }, tags: { 0: [['×3', 'success']], 2: [['×3', 'success']] } }], caption: '3 + 3 = 6' },
      },
      {
        title: 'The middle is in the most substrings',
        text: 'In "abcde", the "a" (position 0) is in 1 × 5 = 5 substrings, the "e" (position 4) in 5 × 1 = 5: total 10.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'd', 'e'], marks: { 1: 'dim', 2: 'dim', 3: 'dim' } }], caption: '5 + 5 = 10' },
      },
    ],
    brute: { idea: 'Enumerate every substring and count its vowels (with a prefix count to make each O(1)).', cost: 'O(n²)', waste: 'Each vowel is counted again in every substring that contains it; that number is a product you can compute directly.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'For each vowel at i: total += (long) (i + 1) * (n − i). O(n), O(1).',
      not: [notPrefix('A prefix count of vowels makes each substring O(1), but there are still O(n²) substrings.'), notBrute('dp-linear', 'A DP "vowels in substrings ending at i" also works in O(n); the contribution formula is more direct.')],
    },
    watch: { viz: 'ContribWalkViz', inputs: [{ label: '"aba"', input: { mode: 'vowels', s: 'aba' } }, { label: '"abcde"', input: { mode: 'vowels', s: 'abcde' } }] },
    edges: ['No vowels: "ltcd" → 0.', '"aba" → 6.', '"abc" → 3.'],
  },

  'total-hamming-distance': {
    aha: 'Count bit by bit. In one bit column, a pair differs exactly when one number has a 1 and the other a 0. If k of the n numbers have a 1 there, that column adds k × (n − k) to the total. Sum over the 30-odd columns.',
    asks: {
      read: 'Is each pair counted once or twice?',
      budget: '10⁴ numbers: how many pairs? How many bit columns?',
      observe: 'For [4, 14, 2], how many numbers have the 2s bit set?',
      brute: 'Hamming distance of every pair: what does it cost?',
      pattern: 'In one bit column, which pairs differ?',
      watch: 'Watch each column count its 1s and add ones × zeros.',
    },
    read: [
      { phrase: 'the number of bit positions where their bits differ', says: 'Each bit position is independent: count per column.' },
      { phrase: 'between all pairs of numbers in `nums` (each unordered pair once)', says: 'Pairs with one 1 and one 0 in a column: ones × zeros.' },
    ],
    budget: { from: 'n ≤ 10⁴, values < 2³⁰', rows: [['every pair', '5 × 10⁷ × 30', 'bad', 'slow'], ['per bit column', '30 × 10⁴', 'ok', 'instant']], aim: 'O(30 · n)', note: 'The answer fits in an int, per the statement.' },
    observe: [
      {
        title: 'One column at a time',
        text: '4 = 0100, 14 = 1110, 2 = 0010. In the 2s column the 1s are 14 and 2 (k = 2), the 0 is 4: 2 × 1 = 2 pairs differ there.',
        sketch: { kind: 'array', rows: [{ label: '4', items: [0, 1, 0, 0] }, { label: '14', items: [1, 1, 1, 0] }, { label: '2', items: [0, 0, 1, 0] }], caption: 'columns: 8s 1·2, 4s 2·1, 2s 2·1, 1s 0 → 6' },
      },
      {
        title: 'Pairs that differ = ones × zeros',
        text: 'Every pair with one number from the 1s side and one from the 0s side differs in that column; pairs within one side don\'t.',
        sketch: { kind: 'array', rows: [{ items: ['k ones', '×', 'n − k zeros'], marks: { 0: 'hit', 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'For every pair, XOR the two and count the 1-bits.', cost: 'O(n² · 30)', waste: 'Each column is re-examined for every pair, though its contribution only depends on how many numbers have a 1 there.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'For each bit b: k = count of numbers with bit b set; total += k × (n − k). O(30 · n).',
      not: [notBrute('bit-manipulation', 'Bit tricks speed up one pair (Integer.bitCount), but there are still n² pairs; counting per column is the key.'), notBrute('hashing', 'Grouping equal numbers doesn\'t help; the bits are what differ.')],
    },
    watch: { viz: 'BitContribViz', inputs: [{ label: '[4, 14, 2]', input: { mode: 'hamming', nums: [4, 14, 2] } }, { label: '[4, 14, 4]', input: { mode: 'hamming', nums: [4, 14, 4] } }] },
    edges: ['One number: [5] → 0.', '[4, 14, 2] → 6.', '[4, 14, 4] → 4.'],
  },

  'bitwise-xor-of-all-pairings': {
    aha: 'XOR doesn\'t care about order, and x ^ x = 0. Each nums1 value is paired with every nums2 value, so it appears nums2.length times in nums3; each nums2 value appears nums1.length times. A value XOR-ed an even number of times cancels, an odd number of times it stays once. So the answer is (XOR of nums1 if nums2.length is odd) ^ (XOR of nums2 if nums1.length is odd).',
    asks: {
      read: 'How many times does each value appear in nums3?',
      budget: '10⁵ × 10⁵ pairs. Can you build nums3?',
      observe: 'For [2, 1, 3] and [10, 2, 5, 0], which side survives?',
      brute: 'XOR every pair: how many operations?',
      pattern: 'What does XOR-ing the same value an even number of times give?',
      watch: 'Watch each array kept or cancelled by the other\'s length.',
    },
    read: [
      { phrase: 'for every pair of indices `(i, j)`, each pair exactly once', says: 'Each nums1[i] appears nums2.length times, each nums2[j] nums1.length times.' },
      { phrase: 'Return the bitwise XOR of all the integers in `nums3`', says: 'Only how many times each value is XOR-ed matters: its parity.' },
    ],
    budget: { from: 'lengths ≤ 10⁵', rows: [['every pair', '10¹⁰', 'bad', 'too slow'], ['parity of counts', '2 × 10⁵', 'ok', 'instant']], aim: 'O(n + m)', note: 'O(1) memory.' },
    observe: [
      {
        title: 'Count the appearances',
        text: 'nums2 has 4 values, so each nums1 value appears 4 times (even: cancels). nums1 has 3, so each nums2 value appears 3 times (odd: stays).',
        sketch: { kind: 'array', rows: [{ label: 'nums1 ×4', items: [2, 1, 3], marks: { 0: 'dim', 1: 'dim', 2: 'dim' } }, { label: 'nums2 ×3', items: [10, 2, 5, 0], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }], caption: '10 ^ 2 ^ 5 ^ 0 = 13' },
      },
      {
        title: 'Both even: everything cancels',
        text: '[1, 2] and [3, 4]: each value appears twice. The answer is 0.',
        sketch: { kind: 'array', rows: [{ items: ['1 ^ 3', '1 ^ 4', '2 ^ 3', '2 ^ 4'] }], caption: '= 0' },
      },
    ],
    brute: { idea: 'XOR every nums1[i] ^ nums2[j] into one value.', cost: 'O(n · m)', waste: 'Each value goes in many times, and all that matters is whether the count is odd.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'x = 0; if (m odd) x ^= XOR(nums1); if (n odd) x ^= XOR(nums2). O(n + m).',
      not: [notBrute('bit-manipulation', 'Counting per bit column also works, but the parity of whole values is simpler.'), notBrute('hashing', 'No lookup is needed; every value is treated the same way.')],
    },
    watch: { viz: 'ContribWalkViz', inputs: [{ label: '[2, 1, 3], [10, 2, 5, 0]', input: { mode: 'pairings', a: [2, 1, 3], b: [10, 2, 5, 0] } }, { label: '[1, 2], [3, 4]', input: { mode: 'pairings', a: [1, 2], b: [3, 4] } }] },
    edges: ['Both even lengths: [1, 2], [3, 4] → 0.', '[2, 1, 3], [10, 2, 5, 0] → 13.', 'One each: [5], [9] → 12.'],
  },

  'sum-of-absolute-differences-in-a-sorted-array': {
    aha: 'Because the array is sorted, every number left of i is ≤ nums[i] and every number right of it is ≥. So the distances to the left add up to i · nums[i] − (sum of the left part), and to the right (sum of the right part) − (n − 1 − i) · nums[i]. Prefix sums give both in O(1).',
    asks: {
      read: 'What does "sorted" let you say about |nums[i] − nums[j]|?',
      budget: '10⁵ numbers. Can you compute each result[i] by summing over all j?',
      observe: 'For [2, 3, 5], what is result[1]?',
      brute: 'For each i, sum over every j: what does it cost?',
      pattern: 'Split j into the left side and the right side of i. What does each side add?',
      watch: 'Watch each element\'s left and right totals from prefix sums.',
    },
    read: [
      { phrase: 'sorted in non-decreasing order', says: 'Left of i: smaller or equal; right of i: larger or equal. The absolute values open up.' },
      { phrase: 'the sum of `|nums[i] − nums[j]|` over all indices `j`', says: 'Split into left and right sums: prefix sums.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every pair', 'n² = 10¹⁰', 'bad', 'too slow'], ['prefix sums', '2 × 10⁵', 'ok', 'instant']], aim: 'O(n)', note: 'One total and one running left sum are enough.' },
    observe: [
      {
        title: 'Left side and right side',
        text: '[2, 3, 5] at i = 1: left distance 3 − 2 = 1, right distance 5 − 3 = 2. result[1] = 3.',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 5], marks: { 1: 'cur' }, tags: { 0: [['3 − 2', 'muted']], 2: [['5 − 3', 'muted']] } }], caption: '1 + 2 = 3' },
      },
      {
        title: 'The formula',
        text: 'Left: i · nums[i] − leftSum. Right: rightSum − (n − 1 − i) · nums[i]. For [1, 4, 6, 8, 10] at i = 2: (2·6 − 5) + (18 − 2·6) = 7 + 6 = 13.',
        sketch: { kind: 'array', rows: [{ items: [1, 4, 6, 8, 10], marks: { 2: 'cur' }, bands: [{ from: 0, to: 1, tone: 'accent', label: 'sum 5' }, { from: 3, to: 4, tone: 'note', label: 'sum 18' }] }], caption: '13' },
      },
    ],
    brute: { idea: 'For each i, add |nums[i] − nums[j]| over every j.', cost: 'O(n²)', waste: 'The left and right sums are recomputed for every i, though they only change by one element at a time.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'total = Σ nums; left = 0; for i: result[i] = (i·x − left) + (total − left − x − (n − 1 − i)·x); left += x. O(n).',
      not: [notPrefix('Prefix sums are the tool, but the insight is splitting each distance by side so the absolute value disappears.'), notBrute('two-pointers', 'No pair search is needed; every pair contributes.')],
    },
    watch: { viz: 'SortedContribViz', inputs: [{ label: '[1, 4, 6, 8, 10]', input: { mode: 'each', nums: [1, 4, 6, 8, 10] } }, { label: '[2, 3, 5]', input: { mode: 'each', nums: [2, 3, 5] } }] },
    edges: ['[2, 3, 5] → [4, 3, 5].', '[1, 4, 6, 8, 10] → [24, 15, 13, 15, 21].', 'All equal: [3, 3] → [0, 0].'],
  },

  'sum-of-distances': {
    aha: 'Only equal values talk to each other, so group the indexes by value. Within a group the positions are sorted, so it is the previous problem on positions: for the k-th position p of a group of m, the distance to earlier ones is k · p − (their sum) and to later ones (their sum) − (m − k − 1) · p. One running sum per group.',
    asks: {
      read: 'Which j count for arr[i]?',
      budget: '10⁵ numbers, possibly all equal. Is comparing equal pairs fine?',
      observe: 'For [1, 3, 1, 1, 2], which indexes hold 1, and what is arr[0]?',
      brute: 'For each i, scan every j with the same value: worst case?',
      pattern: 'Inside a group of equal values, what does the list of indexes look like?',
      watch: 'Watch each group\'s positions use a running sum.',
    },
    read: [
      { phrase: 'the sum of `|i − j|` over every index `j ≠ i` with `nums[j] == nums[i]`', says: 'Group by value; inside a group it is a sum of distances between sorted positions.' },
      { phrase: 'If no such `j` exists, `arr[i]` is 0', says: 'A group of one gives 0.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['all pairs in a group', 'n² when all equal', 'bad', 'too slow'], ['prefix sums per group', '2n', 'ok', 'instant']], aim: 'O(n)', note: 'A hash map from value to its index list.' },
    observe: [
      {
        title: 'Group by value',
        text: 'The 1s sit at 0, 2, 3. For index 0: |0 − 2| + |0 − 3| = 5. For index 2: 2 + 1 = 3. For 3: 3 + 1 = 4.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 1, 1, 2], marks: { 0: 'cur', 2: 'kept', 3: 'kept' } }], caption: 'arr = [5, 0, 3, 4, 0]' },
      },
      {
        title: 'Sorted positions, prefix sums',
        text: 'Positions 0, 2, 3 (sum 5). At position 2 (k = 1): left 1·2 − 0 = 2, right (3) − 1·2 = 1. Total 3.',
        sketch: { kind: 'array', rows: [{ label: 'positions', items: [0, 2, 3], marks: { 1: 'cur' } }], caption: '2 + 1 = 3' },
      },
    ],
    brute: { idea: 'For each i, scan the array and add |i − j| for every j with an equal value.', cost: 'O(n²)', waste: 'An array of equal values compares every pair; a running sum of positions gives each answer at once.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'Map value → list of indexes. For each list (sorted), sweep with a running left sum: arr[p] = (k·p − left) + (total − left − p − (m − k − 1)·p). O(n).',
      not: [notBrute('hashing', 'Grouping uses a hash map, but the counting inside each group is the contribution step.'), notPrefix('Prefix sums over the whole array don\'t help: they must be over each group\'s positions.')],
    },
    watch: { viz: 'ContribWalkViz', inputs: [{ label: '[1, 3, 1, 1, 2]', input: { mode: 'groups', nums: [1, 3, 1, 1, 2] } }, { label: '[0, 5, 3]', input: { mode: 'groups', nums: [0, 5, 3] } }] },
    edges: ['All different: [0, 5, 3] → [0, 0, 0].', '[1, 3, 1, 1, 2] → [5, 0, 3, 4, 0].', 'All equal: [2, 2] → [1, 1].'],
  },

  'subarray-product-less-than-k': {
    aha: 'All numbers are positive, so a window\'s product only grows as it widens. Slide a window: extend right, and while the product is ≥ k shrink from the left. Every subarray ending at right and starting inside the window is valid, so add (right − left + 1).',
    asks: {
      read: 'Why does "positive" matter?',
      budget: '3 × 10⁴ numbers. Can you check every subarray?',
      observe: 'For [10, 5, 2, 6] and k = 100, which subarrays end at the 6?',
      brute: 'Every start, multiplying until ≥ k: worst case?',
      pattern: 'If [l..r] has product < k, what about the subarrays inside it that end at r?',
      watch: 'Watch the window shrink when the product reaches k, and each right end add the window size.',
    },
    read: [
      { phrase: 'Given an array of positive integers `nums`', says: 'Products grow with width: a sliding window works.' },
      { phrase: 'product of all elements is strictly less than `k`', says: 'Shrink while product ≥ k.' },
      { phrase: 'return the number of contiguous subarrays', says: 'Count by right end: window size each time.' },
    ],
    budget: { from: 'n ≤ 3 × 10⁴', rows: [['every subarray', 'n² = 9 × 10⁸', 'bad', 'too slow'], ['sliding window', '2n', 'ok', 'instant']], aim: 'O(n)', note: 'k ≤ 1 gives 0 at once (every product is ≥ 1).' },
    observe: [
      {
        title: 'Subarrays ending at 6',
        text: 'The window [5, 2, 6] has product 60 < 100. Every subarray ending at 6 inside it counts: [6], [2, 6], [5, 2, 6]: 3.',
        sketch: { kind: 'array', rows: [{ items: [10, 5, 2, 6], marks: { 0: 'dim' }, bands: [{ from: 1, to: 3, tone: 'success', label: '+3' }] }] },
      },
      {
        title: 'Shrink when it gets too big',
        text: 'Adding 2 to [10, 5] makes 100, not < 100: drop the 10. The window never needs to move left again.',
        sketch: { kind: 'array', rows: [{ items: [10, 5, 2], marks: { 0: 'bad' } }], caption: '100 ≥ k → shrink' },
      },
    ],
    brute: { idea: 'For every start, multiply rightwards until the product reaches k, counting along the way.', cost: 'O(n²)', waste: 'Each start re-multiplies a stretch the previous start already covered.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'if (k ≤ 1) return 0; for right: prod *= x; while (prod ≥ k) prod /= nums[left++]; count += right − left + 1. O(n).',
      not: [notBrute('sliding-window', 'The mechanics are a sliding window; the counting step (window size per right end) is the contribution idea.'), notPrefix('Prefix products overflow; prefix sums of logs plus binary search work but are fragile.')],
    },
    watch: { viz: 'WindowCountViz', inputs: [{ label: '[10, 5, 2, 6], k = 100', input: { mode: 'product', nums: [10, 5, 2, 6], k: 100 } }, { label: '[1, 2, 3], k = 7', input: { mode: 'product', nums: [1, 2, 3], k: 7 } }] },
    edges: ['k = 0 → 0.', '[10, 5, 2, 6], k = 100 → 8.', '[1, 2, 3], k = 7 → 6 (every subarray).'],
  },

  'count-subarrays-where-max-element-appears-at-least-k-times': {
    aha: 'Count by right end r. Keep the positions of the maximum m seen so far. A subarray ending at r has at least k copies of m exactly when it starts at or before the k-th last of those positions, so it adds pos[c − k] + 1 (with c copies so far).',
    asks: {
      read: 'Is m the maximum of the subarray or of the whole array?',
      budget: '10⁵ numbers. Can you check every subarray?',
      observe: 'For [1, 3, 2, 3, 3] and k = 2, which starts work for the subarrays ending at index 3?',
      brute: 'Count m in every subarray: what does it cost?',
      pattern: 'For a fixed right end, which starts are valid?',
      watch: 'Watch the valid starts reach back to the k-th last maximum.',
    },
    read: [
      { phrase: 'Let `m` be the maximum element of the whole array', says: 'One fixed value to track: its positions.' },
      { phrase: 'in which `m` appears at least `k` times', says: 'Valid starts: at or before the k-th last m.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every subarray', 'n² = 10¹⁰', 'bad', 'too slow'], ['positions of m, one pass', '10⁵', 'ok', 'instant']], aim: 'O(n)', note: 'A sliding window that counts m works the same way.' },
    observe: [
      {
        title: 'Ending at index 3',
        text: 'The 3s so far are at 1 and 3. The 2nd-last is at 1, so starts 0 or 1 work: 2 subarrays.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 2, 3, 3], marks: { 1: 'kept', 3: 'cur', 4: 'dim' }, bands: [{ from: 0, to: 1, tone: 'success', label: 'starts' }] }], caption: '+2' },
      },
      {
        title: 'Ending at index 4',
        text: 'The 3s are at 1, 3, 4; the 2nd-last is at 3: starts 0..3 work, 4 subarrays. Total 0 + 0 + 0 + 2 + 4 = 6.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 2, 3, 3], marks: { 4: 'cur' }, bands: [{ from: 0, to: 3, tone: 'success', label: '+4' }] }] },
      },
    ],
    brute: { idea: 'For every subarray, count the copies of m.', cost: 'O(n²)', waste: 'Subarrays sharing a right end are recounted from scratch; their valid starts form one prefix.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'm = max; pos = []; for r: if nums[r] == m, pos.add(r); if pos.size ≥ k, total += pos[size − k] + 1. O(n).',
      not: [notBrute('sliding-window', 'Equivalent window: shrink while it holds k copies; the count added per right end is the contribution.'), notBrute('monotonic-stack', 'The maximum is fixed for the whole array, so no stack is needed.')],
    },
    watch: { viz: 'ContribWalkViz', inputs: [{ label: '[1, 3, 2, 3, 3], k = 2', input: { mode: 'maxk', nums: [1, 3, 2, 3, 3], k: 2 } }, { label: '[1, 4, 2, 1], k = 3', input: { mode: 'maxk', nums: [1, 4, 2, 1], k: 3 } }] },
    edges: ['Not enough copies: [1, 4, 2, 1], k = 3 → 0.', '[1, 3, 2, 3, 3], k = 2 → 6.', 'k = 1 with one max: [2, 5, 2] → 4.'],
  },

  'sum-of-subarray-ranges': {
    aha: 'Sum of ranges = Σ (max − min) = (sum of subarray maximums) − (sum of subarray minimums). Each of those is a contribution count: element i is the maximum of (left reach) × (right reach) subarrays, found with a monotonic stack. Handle ties by being strict on one side.',
    asks: {
      read: 'What is the range of a subarray?',
      budget: 'n ≤ 1000: O(n²) passes. What does the follow-up want?',
      observe: 'For [1, 3, 3], what are the ranges of all six subarrays?',
      brute: 'Track max and min while extending each start: what does it cost?',
      pattern: 'Split max − min into two sums. How many subarrays is each element the max of?',
      watch: 'Watch each element\'s span as the maximum, then as the minimum.',
    },
    read: [
      { phrase: 'the difference between its largest and smallest elements', says: 'Σ ranges = Σ maxima − Σ minima.' },
      { phrase: 'return the sum of the ranges of all its contiguous, non-empty subarrays', says: 'Count, for each element, how many subarrays it is the max (or min) of.' },
      { phrase: 'can you do it in O(n) time', says: 'Monotonic stacks for the spans.' },
    ],
    budget: { from: 'n ≤ 1000', rows: [['extend each start', 'n² = 10⁶', 'ok', 'fine here'], ['two contribution passes', 'O(n)', 'ok', 'the follow-up']], aim: 'O(n)', note: 'Use longs: values up to 10⁹.' },
    observe: [
      {
        title: 'Ranges of [1, 3, 3]',
        text: 'Single elements: 0. [1, 3]: 2. [3, 3]: 0. [1, 3, 3]: 2. Total 4.',
        sketch: { kind: 'array', rows: [{ items: ['[1,3] 2', '[3,3] 0', '[1,3,3] 2'], marks: { 0: 'hit', 2: 'hit' } }], caption: '4' },
      },
      {
        title: 'Max minus min, summed separately',
        text: 'Σ maxima over all subarrays minus Σ minima gives the same 4. Each sum is "value × number of subarrays where it is the extreme".',
        sketch: { kind: 'array', rows: [{ items: ['Σ max', '−', 'Σ min'], marks: { 0: 'hit', 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'For every start, extend right while tracking the running max and min, adding max − min.', cost: 'O(n²)', waste: 'Fine for 1000, but the same element is rediscovered as the max of many subarrays; its span can be counted once.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'For maxima: previous greater (strict) and next greater-or-equal with a stack; i contributes nums[i] × (i − L) × (R − i). Same for minima. Answer = Σmax − Σmin. O(n).',
      not: [notBrute('monotonic-stack', 'The spans come from monotonic stacks; the counting is contribution.'), notBrute('dp-linear', 'The O(n²) extend-each-start loop is enough for n = 1000, but not the follow-up.')],
    },
    watch: { viz: 'MinSpanViz', inputs: [{ label: 'maxima of [1, 3, 3]', input: { mode: 'max', nums: [1, 3, 3] } }, { label: 'minima of [1, 3, 3]', input: { mode: 'min', nums: [1, 3, 3] } }] },
    edges: ['One element: [5] → 0.', '[1, 2, 3] → 4.', '[1, 3, 3] → 4.'],
  },

  'minimum-fuel-cost-to-report-to-the-capital': {
    aha: 'Look at one road at a time. Everyone in the subtree below a road must cross it toward the capital, and they can all meet before it and share cars, so that road costs ⌈subtree size / seats⌉ litres. One DFS for subtree sizes; add the cost of each road.',
    asks: {
      read: 'Who travels, and when can people share a car?',
      budget: '10⁵ cities. Can you plan every representative\'s route?',
      observe: 'In the LeetCode example with 2 seats, how many people cross the road from city 1 to city 0?',
      brute: 'Simulating cars moving level by level: is it simpler?',
      pattern: 'What decides how many cars cross a single road?',
      watch: 'Watch each road\'s cost come from its subtree size.',
    },
    read: [
      { phrase: 'connected by `n − 1` bidirectional roads that form a tree', says: 'Each road splits the tree: the subtree below must cross it.' },
      { phrase: 'may ride in their own car or get into another one at any city they pass through', says: 'People can merge before a road: cars = ⌈people / seats⌉.' },
      { phrase: 'Driving a car along one road costs one litre of fuel', says: 'Cost per road = cars crossing it.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['simulate routes', 'n² at worst', 'bad', 'slow'], ['one DFS', 'n', 'ok', 'instant']], aim: 'O(n)', note: 'Use a long for the total.' },
    observe: [
      {
        title: 'A road carries its whole subtree',
        text: 'Below the road 3 → 1 are cities 3 and 2: two people, one car with 2 seats.',
        sketch: { kind: 'array', rows: [{ items: ['road 3→1', '2 people', '⌈2/2⌉ = 1'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Cars merge on the way up',
        text: 'The road 1 → 0 carries cities 1, 3 and 2: three people need ⌈3/2⌉ = 2 cars, however they got to 1.',
        sketch: { kind: 'array', rows: [{ items: ['road 1→0', '3 people', '⌈3/2⌉ = 2'], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Move representatives toward the capital step by step, filling cars as people meet.', cost: 'O(n · depth)', waste: 'Every road\'s cost only depends on how many people are below it; the detailed movement never matters.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'dfs(v, parent) returns the subtree size s; for v ≠ 0 add ⌈s / seats⌉. O(n).',
      not: [notBrute('tree-dfs', 'The DFS computes sizes; the answer is the per-road contribution, not a path search.'), notBrute('greedy', 'Filling cars greedily is exactly what ⌈s / seats⌉ assumes; no choice remains.')],
    },
    watch: { viz: 'EdgeContribViz', inputs: [{ label: 'LeetCode example, 2 seats', input: { mode: 'fuel', n: 7, edges: [[0, 1], [0, 4], [0, 5], [1, 3], [3, 2], [5, 6]], seats: 2 } }, { label: 'a star, 5 seats', input: { mode: 'fuel', n: 4, edges: [[0, 1], [0, 2], [0, 3]], seats: 5 } }] },
    edges: ['Only the capital: n = 1 → 0.', 'Star with 5 seats: roads 0–1, 0–2, 0–3 → 3.', 'LeetCode example with 2 seats → 7.'],
  },

  'sum-of-subsequence-widths': {
    aha: 'Order inside a subsequence doesn\'t matter for max − min, so sort. After sorting, nums[i] is the maximum of every subsequence made of it plus any subset of the i smaller elements (2ⁱ of them) and the minimum of 2ⁿ⁻¹⁻ⁱ. So it contributes nums[i] × (2ⁱ − 2ⁿ⁻¹⁻ⁱ). Sum modulo 10⁹ + 7.',
    asks: {
      read: 'Does the order of elements matter for a width?',
      budget: '10⁵ numbers: 2¹⁰⁰⁰⁰⁰ subsequences. What can you count instead?',
      observe: 'For [2, 1, 3] sorted to [1, 2, 3], in how many subsequences is 3 the max?',
      brute: 'Enumerating subsequences: hopeless. What is each element\'s role?',
      pattern: 'After sorting, how many subsequences have nums[i] as their maximum?',
      watch: 'Watch each sorted element counted as a max and as a min.',
    },
    read: [
      { phrase: 'the difference between its maximum and minimum elements', says: 'Σ width = Σ max − Σ min over subsequences.' },
      { phrase: 'different index choices count as different subsequences', says: 'Count subsets of indexes: powers of two.' },
      { phrase: 'Return the answer modulo `10⁹ + 7`', says: 'Precompute powers of two mod p.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every subsequence', '2ⁿ', 'bad', 'impossible'], ['sort + one pass', 'n log n', 'ok', 'fast']], aim: 'O(n log n)', note: 'Handle the subtraction mod p by adding p.' },
    observe: [
      {
        title: '3 is the max of 4 subsequences',
        text: 'Sorted [1, 2, 3]: 3 plus any subset of {1, 2}: 2² = 4 subsequences have max 3. It is the min of only one: [3].',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3], marks: { 2: 'cur' }, bands: [{ from: 0, to: 1, tone: 'accent', label: 'any subset' }] }], caption: '3 × (4 − 1) = 9' },
      },
      {
        title: 'Every element\'s share',
        text: '1: 1 × (1 − 4) = −3. 2: 2 × (2 − 2) = 0. 3: 3 × (4 − 1) = 9. Total 6.',
        sketch: { kind: 'array', rows: [{ label: 'share', items: [-3, 0, 9], marks: { 2: 'hit' } }], caption: '6' },
      },
    ],
    brute: { idea: 'Enumerate every non-empty subsequence and add max − min.', cost: 'O(2ⁿ · n)', waste: 'Only the count of subsequences where each element is the extreme matters, and after sorting that is a power of two.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'Sort; precompute pow2; answer = Σ nums[i] × (pow2[i] − pow2[n − 1 − i]) mod p. O(n log n).',
      not: [notBrute('sorting-and-selection', 'Sorting is the first step; the counting of maxima and minima is the contribution.'), notBrute('backtracking', 'Enumerating subsequences is exponential.')],
    },
    watch: { viz: 'SortedContribViz', inputs: [{ label: '[2, 1, 3]', input: { mode: 'widths', nums: [2, 1, 3] } }, { label: '[5, 1]', input: { mode: 'widths', nums: [5, 1] } }] },
    edges: ['One element: [2] → 0.', '[2, 1, 3] → 6.', '[5, 1] → 4 (only [1, 5] has width).'],
  },

  'total-appeal-of-a-string': {
    aha: 'Charge each distinct letter of a substring to its first occurrence in that substring. The letter s[i] is the first copy of itself in the substrings that start after its previous occurrence (i − prev choices) and end anywhere from i on (n − i choices). Sum (i − prev[s[i]]) × (n − i).',
    asks: {
      read: 'What is the appeal of a substring?',
      budget: '10⁵ letters: about 5 × 10⁹ substrings. What can you count per letter?',
      observe: 'In "abbca", which substrings have their first "b" at index 2?',
      brute: 'Count distinct letters in every substring: what does it cost?',
      pattern: 'If each distinct letter is charged to its first occurrence, which substrings does s[i] get charged for?',
      watch: 'Watch each letter look back to its previous copy.',
    },
    read: [
      { phrase: 'the number of distinct characters it contains', says: 'Charge each distinct letter once: to its first occurrence in the substring.' },
      { phrase: 'return the sum of the appeals of all its substrings', says: 'Count, per position, the substrings where it is the first copy of its letter.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every substring', '5 × 10⁹', 'bad', 'too slow'], ['last-seen per letter', '10⁵', 'ok', 'instant']], aim: 'O(n)', note: '26 last positions; use a long.' },
    observe: [
      {
        title: 'The second "b" counts rarely',
        text: '"abbca": the b at 2 is the first b only in substrings starting at 2 (the b at 1 is right before it): 1 start × 3 ends = 3.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'b', 'c', 'a'], marks: { 1: 'dim', 2: 'cur' } }], caption: '(2 − 1) × (5 − 2) = 3' },
      },
      {
        title: 'Every letter\'s share',
        text: 'a: 1 × 5, b: 2 × 4, b: 1 × 3, c: 4 × 2, a: 4 × 1. Total 5 + 8 + 3 + 8 + 4 = 28.',
        sketch: { kind: 'array', rows: [{ label: 'share', items: [5, 8, 3, 8, 4] }], caption: '28' },
      },
    ],
    brute: { idea: 'For each start, extend right with a set of seen letters, adding the set size.', cost: 'O(n²)', waste: 'Each letter\'s share depends only on where its previous copy was.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'last[26] = −1; for i: total += (i − last[c]) × (n − i); last[c] = i. O(n).',
      not: [notBrute('hashing', 'A set per start is O(n²); the last-seen array is all the memory needed.'), notBrute('dp-linear', 'A DP "total appeal of substrings ending at i" works too, and is the same counting.')],
    },
    watch: { viz: 'LastSeenViz', inputs: [{ label: '"abbca"', input: { mode: 'appeal', s: 'abbca' } }, { label: '"code"', input: { mode: 'appeal', s: 'code' } }] },
    edges: ['One letter: "a" → 1.', '"abbca" → 28.', 'All different: "code" → 20.'],
  },

  'count-unique-characters-of-all-substrings-of-a-given-string': {
    aha: 'Ask, for each position i, in how many substrings is s[i] the only copy of its letter. The substring must start after the previous copy and end before the next copy: (i − prev) × (next − i) substrings. Sum that over every position.',
    asks: {
      read: 'What does countUniqueChars count?',
      budget: '10⁵ letters. How many substrings?',
      observe: 'In "ABA", in how many substrings is the B unique? The first A?',
      brute: 'Counting unique letters in every substring: what does it cost?',
      pattern: 'Which substrings keep s[i] as the only copy of its letter?',
      watch: 'Watch each letter\'s window between its neighbouring copies.',
    },
    read: [
      { phrase: 'the number of characters that appear exactly once in `t`', says: 'Count, per position, the substrings where it is the only copy.' },
      { phrase: 'Substrings at different positions are counted separately', says: 'Count by start and end positions.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every substring', '5 × 10⁹', 'bad', 'too slow'], ['prev / next copy per position', '3n', 'ok', 'instant']], aim: 'O(n)', note: 'Keep the last two positions of each letter to do it in one pass.' },
    observe: [
      {
        title: 'Between the neighbouring copies',
        text: '"ABA": the first A is unique in substrings starting at 0 and ending before index 2: 1 × 2 = 2. The B: 2 × 2 = 4. The last A: 2 × 1 = 2.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'B', 'A'], marks: { 1: 'cur' }, bands: [{ from: 0, to: 2, tone: 'accent', label: '2 × 2' }] }], caption: '2 + 4 + 2 = 8' },
      },
      {
        title: 'All different',
        text: '"ABC": every letter is unique in every substring containing it: 3 + 4 + 3 = 10.',
        sketch: { kind: 'array', rows: [{ label: 'share', items: [3, 4, 3] }], caption: '10' },
      },
    ],
    brute: { idea: 'For each substring, count the letters that appear exactly once.', cost: 'O(n²) or worse', waste: 'A letter\'s share depends only on where its neighbouring copies are.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'For each i: prev = previous index of s[i] (or −1), next = next index (or n); total += (i − prev) × (next − i). O(n).',
      not: [notBrute('hashing', 'Counting letters per substring is O(n²) at best.'), notBrute('sliding-window', 'No single window describes all substrings; each letter gets its own window.')],
    },
    watch: { viz: 'LastSeenViz', inputs: [{ label: '"abca"', input: { mode: 'unique', s: 'abca' } }, { label: '"aba"', input: { mode: 'unique', s: 'aba' } }] },
    edges: ['"ABC" → 10.', '"ABA" → 8.', '"LEETCODE" → 92.'],
  },

  'count-subarrays-with-score-less-than-k': {
    aha: 'Numbers are positive, so widening a window raises both its sum and its length: the score only grows. Slide a window: add the right element, and while sum × length ≥ k, drop from the left. Every subarray ending at right inside the window is valid: add (right − left + 1).',
    asks: {
      read: 'How is the score defined, and why does positivity matter?',
      budget: '10⁵ numbers. Can you score every subarray?',
      observe: 'For [2, 1, 4, 3, 5] and k = 10, which subarrays ending at the 4 are valid?',
      brute: 'Every subarray\'s score with prefix sums: what does it cost?',
      pattern: 'If [l..r] scores under k, what about the subarrays inside it ending at r?',
      watch: 'Watch the window shrink when the score reaches k, and each right end add the window size.',
    },
    read: [
      { phrase: 'the sum of its elements multiplied by its length', says: 'Both factors grow as the window widens.' },
      { phrase: 'Given an array of positive integers `nums`', says: 'Scores only grow with width: sliding window.' },
      { phrase: 'whose score is strictly less than `k`', says: 'Shrink while score ≥ k; count the rest.' },
    ],
    budget: { from: 'n ≤ 10⁵, k ≤ 10¹⁵', rows: [['every subarray', 'n² = 10¹⁰', 'bad', 'too slow'], ['sliding window', '2n', 'ok', 'instant']], aim: 'O(n)', note: 'sum × length reaches 10¹⁵: use longs.' },
    observe: [
      {
        title: 'Ending at the 4',
        text: '[1, 4] scores 5 × 2 = 10, not < 10. Only [4] (4 × 1 = 4) counts.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 4], marks: { 0: 'dim', 1: 'bad', 2: 'cur' } }], caption: '+1' },
      },
      {
        title: 'The window only moves right',
        text: 'If [l..r] scores ≥ k, so does [l..r + 1], so a start dropped once never comes back.',
        sketch: { kind: 'array', rows: [{ items: ['score ≥ k', '→ shrink left'], marks: { 0: 'bad' } }] },
      },
    ],
    brute: { idea: 'Compute every subarray\'s score using prefix sums.', cost: 'O(n²)', waste: 'For a fixed right end the valid starts form one suffix; the window finds its edge once.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'for right: sum += x; while (sum × (right − left + 1) ≥ k) sum −= nums[left++]; count += right − left + 1. O(n).',
      not: [notBrute('sliding-window', 'The window is the mechanism; adding the window size per right end is the counting step.'), notBrute('binary-search', 'Binary search on prefix sums per right end works in O(n log n).')],
    },
    watch: { viz: 'WindowCountViz', inputs: [{ label: '[2, 1, 4, 3, 5], k = 10', input: { mode: 'score', nums: [2, 1, 4, 3, 5], k: 10 } }, { label: '[1, 1, 1], k = 5', input: { mode: 'score', nums: [1, 1, 1], k: 5 } }] },
    edges: ['[2, 1, 4, 3, 5], k = 10 → 6.', '[1, 1, 1], k = 5 → 5 (all but the whole array).', 'k = 1 → 0 (every score is at least 1).'],
  },

  'sum-of-total-strength-of-wizards': {
    aha: 'Charge each group to its weakest wizard (the rightmost on ties). Wizard i is the weakest of exactly the groups inside its span: after the previous strictly weaker wizard, before the next weaker-or-equal one. Inside the span, wizard j is in (left-end choices) × (right-end choices) of those groups, so i adds s[i] × Σ s[j] × count[j]. Monotonic stacks give the spans; prefix sums of prefix sums make Σ s[j] × count[j] O(1).',
    asks: {
      read: 'What is the total strength of one group?',
      budget: '10⁵ wizards: about 5 × 10⁹ groups. What can you charge each group to?',
      observe: 'For [1, 3, 1, 2], which groups have the first 1 as their (leftmost) weakest?',
      brute: 'For every group, find its minimum and sum: what does it cost?',
      pattern: 'If each group is charged to its weakest wizard, which groups does wizard i get?',
      watch: 'Watch each wizard\'s span and how many of its groups contain each wizard.',
    },
    read: [
      { phrase: '(the strength of its weakest wizard) × (the sum of all strengths in the group)', says: 'Charge each group to its weakest: that wizard\'s span decides which groups.' },
      { phrase: 'Return the sum of the total strengths of all contiguous groups, modulo `10⁹ + 7`', says: 'Huge sums: modular arithmetic with prefix sums.' },
    ],
    budget: { from: 'n ≤ 10⁵', rows: [['every group', '5 × 10⁹', 'bad', 'too slow'], ['span per wizard + prefix of prefix sums', 'O(n)', 'ok', 'fast']], aim: 'O(n)', note: 'Ties: strict on one side, ≤ on the other, so each group is charged once.' },
    observe: [
      {
        title: 'The second 1 owns most groups',
        text: '[1, 3, 1, 2]: on ties the rightmost weakest takes the group, so the 1 at index 2 is charged for every group containing it: starts 0..2 × ends 2..3 = 6 groups. The first 1 only gets [1] and [1, 3].',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 1, 2], marks: { 2: 'cur' }, bands: [{ from: 0, to: 3, tone: 'accent', label: 'span of the second 1' }] }] },
      },
      {
        title: 'How often each wizard appears',
        text: 'Of those 6 groups, wizard 0 is in 2, wizard 1 in 4, wizard 2 in all 6, wizard 3 in 3: Σ s × count = 1·2 + 3·4 + 1·6 + 2·3 = 26, times the weakest 1.',
        sketch: { kind: 'array', rows: [{ label: 'count', items: ['×2', '×4', '×6', '×3'] }], caption: '1 × 26 = 26' },
      },
    ],
    brute: { idea: 'For every group, find its minimum and its sum, and add the product.', cost: 'O(n²)', waste: 'Groups sharing the same weakest wizard repeat the same work; their total is a weighted sum over that wizard\'s span.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'Stacks give L[i] (previous < s[i]) and R[i] (next ≤ s[i]). With prefix sums P and prefix-of-prefix sums PP, Σ over the span = (i − L)·(PP[R] − PP[i]) − (R − i)·(PP[i] − PP[L]); add s[i] × that, mod p. O(n).',
      not: [notBrute('monotonic-stack', 'The stacks find the spans; the weighting of each wizard inside a span is the contribution part.'), notPrefix('Plain prefix sums give each group\'s sum, but there are still n² groups.')],
    },
    watch: { viz: 'ContribWalkViz', inputs: [{ label: '[1, 3, 1, 2]', input: { mode: 'wizards', nums: [1, 3, 1, 2] } }, { label: '[5, 4, 6]', input: { mode: 'wizards', nums: [5, 4, 6] } }] },
    edges: ['One wizard: [3] → 9.', '[1, 3, 1, 2] → 44.', '[5, 4, 6] → 213.'],
  },

  'sum-of-distances-in-tree': {
    aha: 'Two passes. First, node 0\'s answer: through the edge above v, every node in v\'s subtree is one step further from 0, so ans[0] = the sum of all subtree sizes. Then move the root one edge at a time: from p to its child c, the size(c) nodes in c\'s subtree get one step closer and the other n − size(c) one step further: ans[c] = ans[p] − size(c) + (n − size(c)).',
    asks: {
      read: 'What is answer[i]?',
      budget: '3 × 10⁴ nodes. Can you run a BFS from every node?',
      observe: 'For the LeetCode tree, what changes when the root moves from 0 to 2?',
      brute: 'A BFS from each node: what does it cost?',
      pattern: 'Knowing ans[p], what changes for its child c?',
      watch: 'Watch ans[0] built from subtree sizes, then each child rerooted in O(1).',
    },
    read: [
      { phrase: 'the sum of the distances between node `i` and every other node', says: 'One number per node; neighbours\' answers are closely related.' },
      { phrase: 'There is an undirected tree with `n` nodes', says: 'Root it anywhere; subtree sizes describe every edge.' },
    ],
    budget: { from: 'n ≤ 3 × 10⁴', rows: [['BFS from every node', 'n² = 9 × 10⁸', 'bad', 'too slow'], ['two DFS passes', '2n', 'ok', 'instant']], aim: 'O(n)', note: 'Rerooting: derive each child\'s answer from its parent\'s.' },
    observe: [
      {
        title: 'ans[0] from subtree sizes',
        text: 'Edges 0–1, 0–2, 2–3, 2–4, 2–5. Subtree sizes below each edge: 1, 4, 1, 1, 1. ans[0] = 8.',
        sketch: { kind: 'array', rows: [{ label: 'size', items: [1, 4, 1, 1, 1] }], caption: 'sum = 8' },
      },
      {
        title: 'Moving the root to 2',
        text: 'Node 2\'s subtree (4 nodes) gets one step closer, the other 2 nodes one step further: ans[2] = 8 − 4 + 2 = 6.',
        sketch: { kind: 'array', rows: [{ items: ['8', '− 4', '+ 2', '= 6'], marks: { 3: 'hit' } }] },
      },
    ],
    brute: { idea: 'Run a BFS from every node and add up the distances.', cost: 'O(n²)', waste: 'Neighbouring nodes\' answers differ by a simple amount; each BFS recomputes almost everything.' },
    pattern: {
      pick: 'contribution-technique',
      why: 'DFS 1 (post-order): size[v], and ans[0] += size[v] for v ≠ 0. DFS 2 (pre-order): ans[c] = ans[p] − size[c] + (n − size[c]). O(n).',
      not: [notBrute('tree-dfs', 'The passes are DFS; the per-edge counting and the rerooting formula are the contribution idea.'), notBrute('graph-traversal', 'A BFS from every node is the O(n²) brute force.')],
    },
    watch: { viz: 'EdgeContribViz', inputs: [{ label: 'LeetCode tree', input: { mode: 'reroot', n: 6, edges: [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]] } }, { label: 'a path of 4', input: { mode: 'reroot', n: 4, edges: [[0, 1], [1, 2], [2, 3]] } }] },
    edges: ['One node: n = 1 → [0].', 'Two nodes → [1, 1].', 'LeetCode tree → [8, 12, 6, 10, 10, 10].'],
  },
};
