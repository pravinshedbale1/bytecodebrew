/** Practice thinking walkthroughs: sorting-and-selection (format: src/data/think/index.js). */
export default {
  'sort-array-by-increasing-frequency': {
    free: true,
    read: [
      { phrase: 'values that occur less often come first', says: 'The sort key is each value\'s frequency, which we must count first.' },
      { phrase: 'If two values occur equally often, put the larger value first', says: 'A tie-break: a two-part comparator.' },
      { phrase: 'each value keeps all of its copies', says: 'Sort the elements themselves by their value\'s count; copies stay together because they share a key.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n log n)', note: 'Tiny; the point is the two-part key.' },
    observe: [
      {
        title: 'Count, then sort by (count ↑, value ↓)',
        text: 'For [1, 1, 2, 2, 2, 3]: 3 appears once, 1 twice, 2 three times.',
        sketch: { kind: 'array', rows: [{ label: 'counts', items: ['3: 1', '1: 2', '2: 3'] }, { label: 'sorted', items: [3, 1, 1, 2, 2, 2], marks: { 0: 'hit' } }] },
      },
      {
        title: 'The tie-break matters',
        text: 'In [2, 3, 1, 3, 2], 2 and 3 both appear twice: the larger, 3, goes first → [1, 3, 3, 2, 2].',
      },
    ],
    brute: { idea: 'For every element, count its value by scanning the whole array, then sort.', cost: 'O(n²)', waste: 'Counts are recomputed for every copy; one counting pass gives them all.' },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Count with a map, then one sort with a custom comparator: frequency ascending, value descending. O(n log n).',
      not: [
        { id: 'hashing', why: 'The map gives the counts, but the order comes from the sort.' },
        { id: 'heap-patterns', why: 'A heap would pop in this order too, but we need everything sorted, not the top k.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Count', text: '{1: 2, 2: 3, 3: 1}.' },
        { title: 'Sort by (count, −value)', text: '3 (once), then 1 1 (twice), then 2 2 2 (three times): [3, 1, 1, 2, 2, 2].', sketch: { kind: 'array', rows: [{ items: [3, 1, 1, 2, 2, 2], bands: [{ from: 0, to: 0, tone: 'accent' }, { from: 1, to: 2, tone: 'ghost' }, { from: 3, to: 5, tone: 'accent' }] }] } },
      ],
    },
    edges: ['Equal frequencies (the larger value first).', 'Negative values.', 'All values distinct: plain descending order.'],
  },

  'sort-an-array': {
    read: [
      { phrase: 'without using any built-in sort function', says: 'Implement a sort yourself.' },
      { phrase: 'Your algorithm must run in O(n log n) time', says: 'Rules out insertion or bubble sort (O(n²)): merge sort, heap sort, or randomised quicksort.' },
      { phrase: 'the large test punishes quadratic sorts', says: 'Plain quicksort on sorted input is O(n²) too: randomise the pivot.' },
    ],
    budget: { from: 'nums.length ≤ 5 × 10⁴', n: 5e4, aim: 'O(n log n)', note: 'Insertion sort is 1.25 × 10⁹ on bad input. Values are small, so counting sort (O(n + R)) also works.' },
    observe: [
      {
        title: 'Divide and merge',
        text: 'Merge sort: sort each half, then merge two sorted halves by repeatedly taking the smaller front. Always O(n log n).',
        sketch: { kind: 'array', rows: [{ label: 'halves', items: [2, 5, 1, 3], bands: [{ from: 0, to: 1, tone: 'accent' }, { from: 2, to: 3, tone: 'ghost' }] }, { label: 'merged', items: [1, 2, 3, 5], marks: { 0: 'hit' } }] },
      },
      {
        title: 'A small value range allows counting',
        text: 'Values lie in [−5 × 10⁴, 5 × 10⁴]: count each value and write them back in order, with no comparisons at all.',
      },
    ],
    brute: { idea: 'Insertion sort: grow a sorted prefix, shifting larger elements right.', cost: 'O(n²)', waste: 'Each element may shift past everything before it.' },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'An O(n log n) comparison sort (merge or heap sort), or counting sort for the small range.',
      not: [
        { id: 'heap-patterns', why: 'Heap sort is one valid answer; a heap is also used for top-k, which is a different question.' },
        { id: 'divide-and-conquer', why: 'Merge sort is divide and conquer; that lesson covers what else the merge step can count.' },
      ],
    },
    watch: { viz: 'BucketViz', inputs: [{ label: 'counting sort on [5, 2, 3, 1]', input: { mode: 'counting', nums: [5, 2, 3, 1] } }] },
    edges: ['Already sorted (bad for a fixed-pivot quicksort).', 'Many duplicates.', 'Negative values (offset them for counting sort).'],
  },

  'largest-number': {
    read: [
      { phrase: 'form the largest possible number', says: 'An ordering problem: sort with the right comparator.' },
      { phrase: 'Return it as a string, because it may be very large', says: 'Compare as strings, never as numbers.' },
      { phrase: 'an answer of zero is `"0"`', says: 'All zeros would give "000": special case.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n log n · L)', note: 'Trying every order is 100!: impossible.' },
    observe: [
      {
        title: 'Numeric order is wrong',
        text: '10 > 2, but "210" beats "102". The first digit matters more than the size.',
      },
      {
        title: 'Compare the two concatenations',
        text: 'Put a before b when a + b > b + a as strings: "9" + "34" = "934" > "349".',
        sketch: { kind: 'array', rows: [{ items: ['9', '5', '34', '3', '30'], marks: { 0: 'hit' } }], caption: 'the result: "9534330"' },
      },
    ],
    brute: { idea: 'Try every ordering, join each, and keep the largest.', cost: 'O(n! · L)', waste: 'A pairwise rule decides the order without trying permutations.' },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Sort with the comparator "a before b if a + b > b + a"; the rule is consistent, so the sorted order is optimal. O(n log n · L).',
      not: [
        { id: 'greedy', why: 'It is a greedy exchange argument, expressed as a comparator.' },
        { id: 'backtracking', why: 'Trying permutations is exponential.' },
      ],
    },
    watch: {
      frames: [
        { title: '[10, 2]', text: '"2" + "10" = "210" > "102": 2 goes first → "210".' },
        { title: '[3, 30, 34, 5, 9]', text: 'The comparator sorts them as 9, 5, 34, 3, 30 → "9534330".' },
        { title: 'All zeros', text: '[0, 0] would give "00": return "0".' },
      ],
    },
    edges: ['All zeros → "0".', 'Numbers sharing a prefix: 3 vs 30 vs 34.', 'Large values (up to 10⁹, as strings).'],
  },

  'h-index': {
    read: [
      { phrase: 'the largest `h` such that the researcher has at least `h` papers that each have at least `h` citations', says: 'A threshold that depends on counts above it: sorting (or counting) makes it easy to read off.' },
      { phrase: '`citations[i]` is the number of citations', says: 'Only how many papers reach each level matters, not which paper is which: the order of the input is irrelevant.' },
    ],
    budget: { from: 'citations.length ≤ 5000', n: 5000, aim: 'O(n)', note: 'Trying every h with a count each is O(n²) = 2.5 × 10⁷ (fine); sorting is O(n log n); buckets are O(n).' },
    observe: [
      {
        title: 'Sorted descending, read the position',
        text: 'The i-th most cited paper (1-based) has c citations. h is the number of positions where c ≥ i.',
        sketch: { kind: 'array', rows: [{ label: 'sorted ↓', items: [6, 5, 3, 1, 0], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }, { label: 'position', items: [1, 2, 3, 4, 5] }], caption: '6 ≥ 1, 5 ≥ 2, 3 ≥ 3, but 1 < 4: h = 3' },
      },
      {
        title: 'h is at most n, so cap at n',
        text: 'Any count above n can be treated as n. Bucket papers by count 0 … n and walk down, adding up papers until the total reaches the bucket\'s count.',
      },
    ],
    brute: { idea: 'For h from n down to 0, count papers with at least h citations; return the first h that works.', cost: 'O(n²)', waste: 'Each h recounts all papers.' },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Sort descending and count positions with c ≥ i, or bucket-count capped at n for O(n).',
      not: [
        { id: 'binary-search-on-answer', why: 'Binary search on h with a count per check is O(n log n): it works, but sorting is simpler.' },
        { id: 'hashing', why: 'Counting by citation value is the bucket approach; plain hashing doesn\'t give the order.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Buckets (capped at 5)', text: 'counts: 0 → 1, 1 → 1, 3 → 1, 5 → 2 (6 is capped to 5).' },
        { title: 'Walk down from 5', text: 'At 5: 2 papers. At 4: still 2. At 3: 3 papers ≥ 3. So h = 3.' },
      ],
    },
    edges: ['All zeros → 0.', 'Every paper cited more than n times → n.', 'One paper.'],
  },

  'sort-characters-by-frequency': {
    read: [
      { phrase: 'in decreasing order of frequency', says: 'Count each character, then order by count.' },
      { phrase: 'with all copies of a character next to each other', says: 'Write each character count times in a row.' },
      { phrase: 'Uppercase and lowercase letters are different characters', says: 'Count by exact character.' },
    ],
    budget: { from: 's.length ≤ 5 × 10⁵', n: 5e5, aim: 'O(n)', note: 'Counting is O(n); the distinct characters are few (62), so even sorting them is cheap.' },
    observe: [
      {
        title: 'Count, then order the distinct characters',
        text: '"tree": e appears twice, t and r once.',
        sketch: { kind: 'array', rows: [{ label: 'counts', items: ['e: 2', 't: 1', 'r: 1'], marks: { 0: 'hit' } }, { label: 'output', items: ['e', 'e', 'r', 't'] }] },
      },
      {
        title: 'Buckets by count avoid sorting',
        text: 'A count is between 1 and n: put each character in the bucket for its count and read buckets from n down.',
      },
    ],
    brute: { idea: 'Count, sort the distinct characters by count, and write them out.', cost: 'O(n + k log k)', waste: 'Already fast; buckets just remove the sort.' },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Count, then order by count (sort the few distinct characters, or bucket by count for O(n)).',
      not: [
        { id: 'heap-patterns', why: 'A max-heap by count works, at O(k log k), like sorting.' },
        { id: 'hashing', why: 'The counting is hashing; the ordering is the sort.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Count "tree"', text: 'e: 2, t: 1, r: 1.' },
        { title: 'Highest count first', text: '"ee", then t and r in any order: "eert" (or "eetr").' },
      ],
    },
    edges: ['Ties may come out in any order.', 'Upper and lower case counted separately.', 'A single repeated character.'],
  },

  'maximum-gap': {
    read: [
      { phrase: 'the largest difference between two neighbouring elements of `nums` after sorting it', says: 'Defined by the sorted order, but…' },
      { phrase: 'must run in linear time and use linear extra space', says: '…we may not comparison-sort. Buckets (pigeonhole) or radix sort.' },
      { phrase: 'fewer than two elements, return `0`', says: 'Edge case first.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵, values ≤ 10⁹', n: 1e5, aim: 'O(n)', note: 'Sorting is O(n log n): fast enough, but not what is asked.' },
    observe: [
      {
        title: 'The largest gap is at least the average gap',
        text: 'n values span [min, max], so some neighbouring gap is at least (max − min) / (n − 1).',
      },
      {
        title: 'So it never lies inside a bucket',
        text: 'With buckets narrower than that average, two values in the same bucket are closer than the answer. Keep only each bucket\'s min and max, and compare each bucket\'s min with the previous non-empty bucket\'s max.',
        sketch: { kind: 'array', rows: [{ label: 'buckets of width 2 over [1, 10]', items: ['1', '3', '6', '·', '9'], marks: { 2: 'target', 4: 'target' } }], caption: 'the gap 6 → 9 crosses an empty bucket' },
      },
    ],
    brute: { idea: 'Sort and compare neighbours.', cost: 'O(n log n)', waste: 'Full order is more than needed: only gaps between buckets can be the maximum.' },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Pigeonhole buckets (or radix sort) give the answer in O(n) without a comparison sort.',
      not: [
        { id: 'hashing', why: 'Buckets are indexed by value range, not hashed; their order matters.' },
        { id: 'heap-patterns', why: 'A heap still sorts in O(n log n).' },
      ],
    },
    watch: {
      frames: [
        { title: '[3, 6, 9, 1]', text: 'min 1, max 9, n = 4: bucket width ⌊8 / 3⌋ = 2, no wider than the average gap.' },
        { title: 'Compare across buckets', text: 'Neighbouring bucket boundaries give gaps 2, 3 and 3: the answer is 3.' },
      ],
    },
    edges: ['Fewer than two elements → 0.', 'All values equal → 0.', 'Two values: their difference.'],
  },
};
