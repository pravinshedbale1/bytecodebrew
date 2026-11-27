/** Practice thinking walkthroughs: sorting-and-selection (format: src/data/think/index.js). */

export default {
  'sort-array-by-increasing-frequency': {
    free: true,
    aha: 'First count how often each value appears. Then sort the numbers themselves with a two-part rule: rarer values first, and among equally common values, the larger one first.',
    asks: {
      observe: 'In [1, 1, 2, 2, 2, 3], how often does each value appear? Which value goes first?',
      pattern: 'The order depends on a count that isn\'t in the array yet. What do you compute first, and what do you sort by?',
      read: 'The order has a main rule and a tie-break. What are they, and what must be computed before you can sort?',
      budget: 'n is at most 100. Does speed matter here, or is the question about something else?',
      brute: 'What is the simplest way to get each element\'s count, and how often does it recount the same value?',
      watch: 'For [1, 1, 2, 2, 2, 3], which value will be written first and which last?',
    },
    read: [
      { phrase: 'values that occur less often come first', says: 'The sort key is each value\'s count, which we must compute first.' },
      { phrase: 'If two values occur equally often, put the larger value first', says: 'A tie-break: a two-part comparison.' },
      {
        phrase: 'each value keeps all of its copies',
        says: 'Sort the numbers themselves by their value\'s count; copies stay together because they share a key.',
      },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n log n)', note: 'Tiny; the point is the two-part comparison.' },
    observe: [
      {
        title: 'Count, then sort by (count up, value down)',
        text: 'In [1, 1, 2, 2, 2, 3]: 3 appears once, 1 twice, 2 three times. Sort the numbers themselves using their value\'s count as the key: 3 first, then both 1s, then the three 2s. Copies share a key, so they stay together.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'counts', items: ['3: 1', '1: 2', '2: 3'] }, { label: 'sorted', items: [3, 1, 1, 2, 2, 2], marks: { '0': 'hit' } }],
        },
      },
      {
        title: 'The tie-break matters',
        text: 'In [2, 3, 1, 3, 2], 2 and 3 both appear twice: the larger, 3, goes first.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 3, 3, 2, 2], bands: [{ from: 1, to: 2, tone: 'accent', label: '3 first' }, { from: 3, to: 4, tone: 'ghost' }] }],
        },
      },
    ],
    brute: {
      idea: 'For every element, count its value by scanning the whole array, then sort.',
      cost: 'O(n²)',
      waste: 'Counts are recomputed for every copy; one counting pass gives them all.',
    },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Count with a map, then one sort with a two-part rule: count ascending, value descending. O(n log n).',
      not: [
        { id: 'hashing', why: 'The map gives the counts, but the order comes from the sort.' },
        { id: 'heap-patterns', why: 'A heap would pop in this order too, but we need everything sorted, not just the top few.' },
      ],
    },
    watch: {
      viz: 'SortWalkViz',
      inputs: [
        { label: '[1, 1, 2, 2, 2, 3]', input: { mode: 'freq', nums: [1, 1, 2, 2, 2, 3] } },
        { label: '[2, 3, 1, 3, 2]', input: { mode: 'freq', nums: [2, 3, 1, 3, 2] } },
      ],
    },
    edges: [
      'Equal counts: [2, 3, 1, 3, 2] → [1, 3, 3, 2, 2].',
      'Negative values: [−1, 1, −6, 4, 5, −6, 1, 4, 1] → [5, −1, 4, 4, −6, −6, 1, 1, 1].',
      'All distinct: [1, 2, 3] → [3, 2, 1].',
    ],
    not: { '0': [], '1': [] },
  },

  'sort-an-array': {
    aha: 'The O(n log n) rule rules out the simple sorts. Merge sort always meets it: sort each half, then merge the two sorted halves by repeatedly taking the smaller front value. With values in a small range, counting each value is even faster.',
    asks: {
      observe: 'Halves [2, 5] and [1, 3] are each sorted. How do you combine them into one sorted list, looking only at their fronts?',
      pattern: 'Which sorts are guaranteed O(n log n) even on bad input? Is there a shortcut when values are small?',
      read: 'One phrase bans the easy way out, another sets the speed, and a third warns about a trap. What does each rule out?',
      budget: 'An O(n²) sort on 5 × 10⁴ values is how many steps? And how wide is the value range?',
      brute: 'What is the simplest sort to write by hand, and when does it become slow?',
      watch: 'Counting sort on [5, 2, 3, 1]: how many comparisons between values will it make?',
    },
    read: [
      { phrase: 'without using any built-in sort function', says: 'Implement a sort yourself.' },
      {
        phrase: 'Your algorithm must run in O(n log n) time',
        says: 'Rules out insertion or bubble sort (O(n²)): merge sort, heap sort, or quicksort with a random pivot.',
      },
      { phrase: 'the large test punishes quadratic sorts', says: 'Plain quicksort on sorted input is O(n²) too: pick the pivot at random.' },
    ],
    budget: {
      from: 'nums.length ≤ 5 × 10⁴',
      n: 50000,
      aim: 'O(n log n)',
      note: 'Insertion sort is 1.25 × 10⁹ on bad input. Values are small, so counting sort (O(n + range)) also works.',
    },
    observe: [
      {
        title: 'Split, sort the halves, merge',
        text: 'Split the array in half, sort each half the same way, then merge: compare the two front values, take the smaller, repeat. [2, 5] and [1, 3] merge into 1, 2, 3, 5. Each level of splitting does O(n) merging and there are log n levels, so it is always O(n log n), even on sorted input.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'halves', items: [2, 5, 1, 3], bands: [{ from: 0, to: 1, tone: 'accent' }, { from: 2, to: 3, tone: 'ghost' }] },
            { label: 'merged', items: [1, 2, 3, 5], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'A small range allows counting',
        text: 'Values lie in [−5 × 10⁴, 5 × 10⁴]: count each value, then write them back in order, with no comparisons at all.',
        sketch: { kind: 'array', rows: [{ label: 'counts for values 1 … 5', items: ['1: 1', '2: 1', '3: 1', '4: 0', '5: 1'], marks: { '3': 'dim' } }] },
      },
    ],
    brute: {
      idea: 'Insertion sort: grow a sorted prefix, shifting larger elements right.',
      cost: 'O(n²)',
      waste: 'Each element may shift past everything before it.',
    },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'A sort that is always O(n log n) (merge or heap sort), or counting sort for the small value range.',
      not: [
        { id: 'heap-patterns', why: 'Heap sort is one valid answer; heaps are also used for "top k", which is a different question.' },
        { id: 'divide-and-conquer', why: 'Merge sort is divide and conquer; that lesson covers what else the merge step can count.' },
      ],
    },
    watch: { viz: 'BucketViz', inputs: [{ label: 'counting sort on [5, 2, 3, 1]', input: { mode: 'counting', nums: [5, 2, 3, 1] } }] },
    edges: [
      'Already sorted: [1, 2, 3] → [1, 2, 3] (bad for a fixed-pivot quicksort).',
      'Many duplicates: [2, 2, 1, 2] → [1, 2, 2, 2].',
      'Negative values: [0, −5, 3] → [−5, 0, 3] (shift them for counting sort).',
    ],
  },

  'largest-number': {
    aha: 'Sorting by numeric size is wrong (10 is bigger than 2, but "210" beats "102"). Instead compare two numbers by gluing them both ways: a goes before b when a + b is bigger than b + a as strings.',
    asks: {
      observe: 'Glue 10 and 2 both ways: "102" or "210". Which is larger? What about 3 and 30?',
      pattern: 'What rule decides, for any two numbers, which should come first?',
      read: 'Which phrase tells you to compare as strings, and which one hides a special case?',
      budget: 'Trying every order of 100 numbers is 100!. What does a comparison rule cost instead?',
      brute: 'What is the simplest correct method, and how many orders would it try?',
      watch: 'For [3, 30, 34, 5, 9], which number will come first, and which last?',
    },
    read: [
      { phrase: 'form the largest possible number', says: 'An ordering problem: sort with the right comparison.' },
      { phrase: 'Return it as a string, because it may be very large', says: 'Compare as strings, never as numbers.' },
      { phrase: 'an answer of zero is `"0"`', says: 'All zeros would give "000": a special case.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n log n · L)', note: 'Trying every order is 100!: impossible.' },
    observe: [
      {
        title: 'Numeric order is wrong',
        text: '10 > 2, but "210" beats "102": the first digit matters more than the size.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '"10" + "2"', items: ['1', '0', '2'], marks: { '0': 'bad' } },
            { label: '"2" + "10"', items: ['2', '1', '0'], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'Compare the two gluings',
        text: 'Put a before b when a + b > b + a as strings: "9" + "34" = "934" beats "349", so 9 comes first. This rule is consistent (if a beats b and b beats c, then a beats c), so a normal sort with it gives the best order.',
        sketch: { kind: 'array', rows: [{ items: ['9', '5', '34', '3', '30'], marks: { '0': 'hit' } }], caption: 'the result: "9534330"' },
      },
    ],
    brute: {
      idea: 'Try every ordering, glue each one, and keep the largest.',
      cost: 'O(n! · L)',
      waste: 'A rule between any two numbers decides the order without trying permutations.',
    },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Sort with the rule "a before b if a + b > b + a"; the rule is consistent, so the sorted order is the best. O(n log n · L).',
      not: [
        { id: 'greedy', why: 'It is a greedy swap argument, written as a sort comparison.' },
        { id: 'backtracking', why: 'Trying every order is exponential.' },
      ],
    },
    watch: {
      viz: 'SortWalkViz',
      inputs: [
        { label: '[3, 30, 34, 5, 9]', input: { mode: 'largest', nums: [3, 30, 34, 5, 9] } },
        { label: '[0, 0]', input: { mode: 'largest', nums: [0, 0] } },
      ],
    },
    edges: ['All zeros: [0, 0] → "0".', 'A shared first digit: [3, 30] → "330".', 'One number: [10] → "10".'],
    not: { '0': [], '1': [] },
  },

  'h-index': {
    aha: 'Sort the papers from most to least cited. The paper in position i (counting from 1) has at least i citations exactly while i ≤ h, so h is the number of positions where citations ≥ position.',
    asks: {
      observe: 'Sorted from most cited, [6, 5, 3, 1, 0]. For each position 1 … 5, is the citation count at least the position?',
      pattern: 'Does the order of the papers in the input matter, or only how many papers reach each level?',
      read: 'Which phrase tells you the input order of the papers doesn\'t matter?',
      budget: 'h can\'t exceed n. How does that let you avoid sorting altogether?',
      brute: 'What is the most direct way to test each h, and what does it recount?',
      watch: 'For [3, 0, 6, 1, 5], walking down from level 5, at which level does the paper total first catch up?',
    },
    read: [
      {
        phrase: 'the largest `h` such that the researcher has at least `h` papers that each have at least `h` citations',
        says: 'A level that depends on counts above it: sorting (or counting) makes it easy to read off.',
      },
      {
        phrase: '`citations[i]` is the number of citations',
        says: 'Only how many papers reach each level matters, not which paper is which: the input order is irrelevant.',
      },
    ],
    budget: {
      from: 'citations.length ≤ 5000',
      n: 5000,
      aim: 'O(n)',
      note: 'Trying every h with a count each is O(n²) = 2.5 × 10⁷ (fine); sorting is O(n log n); bucket counts are O(n).',
    },
    observe: [
      {
        title: 'Sorted from most cited, read the positions',
        text: '6 ≥ 1, 5 ≥ 2, 3 ≥ 3, but 1 < 4: the answer is 3.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'sorted', items: [6, 5, 3, 1, 0], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'bad', '4': 'bad' } },
            { label: 'position', items: [1, 2, 3, 4, 5] },
          ],
          caption: 'h = 3',
        },
      },
      {
        title: 'h is at most n, so cap the counts at n',
        text: 'h can\'t be bigger than n (there are only n papers), so treat any count above n as n. Count papers per level 0 … n, then walk down from n keeping a running total of papers at or above the level: the first level where total ≥ level is h.',
        sketch: { kind: 'array', rows: [{ label: 'papers per level (capped at 5)', items: ['0: 1', '1: 1', '2: 0', '3: 1', '4: 0', '5: 2'] }] },
      },
    ],
    brute: {
      idea: 'For h from n down to 0, count the papers with at least h citations; return the first h that works.',
      cost: 'O(n²)',
      waste: 'Each h recounts all papers.',
    },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Sort from most cited and count the positions with citations ≥ position, or use level counts capped at n for O(n).',
      not: [
        { id: 'binary-search-on-answer', why: 'Binary search on h with a count per check is O(n log n): it works, but sorting is simpler.' },
        { id: 'hashing', why: 'Counting by citation level is the bucket idea; plain hashing doesn\'t give the order.' },
      ],
    },
    watch: { viz: 'SortWalkViz', inputs: [{ label: '[3, 0, 6, 1, 5]', input: { mode: 'hindex', c: [3, 0, 6, 1, 5] } }] },
    edges: ['All zeros: [0, 0] → 0.', 'Every paper cited more than n times: [10, 10] → 2.', 'One paper: [100] → 1.'],
    not: { '1': [] },
  },

  'sort-characters-by-frequency': {
    aha: 'Count every character, then write the characters out from most to least common, each one as many times as it appears. With counts between 1 and n, buckets by count avoid sorting altogether.',
    asks: {
      observe: 'In "tree", how often does each letter appear? Which letter must come first?',
      pattern: 'Once you know the counts, what order do you write the letters in?',
      read: 'Which phrase decides the order, and which one says how copies are written?',
      budget: 'The string can be 5 × 10⁵ long, but how many different characters can it have?',
      brute: 'What happens if you sort all n characters with a "by count" comparator?',
      watch: 'For "tree", what is written first, and does the order of t and r matter?',
    },
    read: [
      { phrase: 'in decreasing order of frequency', says: 'Count each character, then order by count.' },
      { phrase: 'with all copies of a character next to each other', says: 'Write each character as many times as it appears, in a row.' },
      { phrase: 'Uppercase and lowercase letters are different characters', says: 'Count by exact character.' },
    ],
    budget: {
      from: 's.length ≤ 5 × 10⁵',
      n: 500000,
      aim: 'O(n)',
      note: 'Counting is O(n); there are only 62 possible characters, so even sorting them is cheap.',
    },
    observe: [
      {
        title: 'Count, then order the characters',
        text: '"tree": e appears twice, t and r once each.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'counts', items: ['e: 2', 't: 1', 'r: 1'], marks: { '0': 'hit' } }, { label: 'output', items: ['e', 'e', 'r', 't'] }],
        },
      },
      {
        title: 'Buckets by count avoid sorting',
        text: 'A count is between 1 and n: put each character in the bucket for its count and read the buckets from n down.',
        sketch: { kind: 'array', rows: [{ label: 'bucket 2', items: ['e'], marks: { '0': 'hit' } }, { label: 'bucket 1', items: ['t', 'r'] }] },
      },
    ],
    brute: {
      idea: 'Count, then sort all n characters with a comparator: higher count first, ties by character so copies stay together.',
      cost: 'O(n log n)',
      waste: 'It sorts all n characters, though there are at most 62 different ones: ordering the distinct characters (or bucketing by count) is enough.',
    },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Count, then order by count (sort the few different characters, or bucket by count for O(n)).',
      not: [
        { id: 'heap-patterns', why: 'A max-heap by count works, at the same cost as sorting the characters.' },
        { id: 'hashing', why: 'The counting is hashing; the ordering is the sort.' },
      ],
    },
    watch: {
      viz: 'SortWalkViz',
      inputs: [{ label: '"tree"', input: { mode: 'chars', s: 'tree' } }, { label: '"Aabb"', input: { mode: 'chars', s: 'Aabb' } }],
    },
    edges: [
      'Ties in any order: "cccaaa" → "cccaaa" or "aaaccc".',
      'Upper and lower case separate: "Aabb" → "bbAa" or "bbaA".',
      'One repeated character: "zzz" → "zzz".',
    ],
    not: { '0': [], '1': [] },
  },

  'maximum-gap': {
    aha: 'The largest gap between neighbours is at least the average gap, (max − min) / (n − 1). So with buckets narrower than that average, the largest gap can never sit inside a bucket: it always jumps from one bucket\'s maximum to the next non-empty bucket\'s minimum.',
    asks: {
      observe: 'For [3, 6, 9, 1], the values span 1 … 9 with 4 numbers. What is the average gap? Can the largest gap be smaller than that?',
      pattern: 'A full sort is not allowed. If the answer must cross between buckets, what is the only thing each bucket needs to remember?',
      read: 'The answer is defined by sorting, but which phrase rules out a normal sort?',
      budget: 'Sorting 10⁵ values is fast enough in practice. What does the statement insist on instead?',
      brute: 'What is the obvious correct answer, and what does it compute that you don\'t need?',
      watch: 'For [3, 6, 9, 1], with buckets of width 2, which bucket stays empty?',
    },
    read: [
      {
        phrase: 'the largest difference between two neighbouring elements of `nums` after sorting it',
        says: 'The answer is defined by the sorted order, so you might reach for a sort. The next clue rules that out.',
      },
      {
        phrase: 'must run in linear time and use linear extra space',
        says: '…a comparison sort isn\'t allowed. Buckets (pigeonhole) or radix sort.',
      },
      { phrase: 'fewer than two elements, return `0`', says: 'Handle that first.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵, values ≤ 10⁹', n: 100000, aim: 'O(n)', note: 'Sorting is O(n log n): fast enough, but not what is asked.' },
    observe: [
      {
        title: 'The largest gap is at least the average gap',
        text: 'Four numbers span 1 … 9, so the three gaps add up to 8 and at least one of them is ≥ 8 / 3.',
        sketch: { kind: 'array', rows: [{ label: 'sorted', items: [1, 3, 6, 9] }, { label: 'gaps', items: [2, 3, 3], marks: { '1': 'hit', '2': 'hit' } }] },
      },
      {
        title: 'So it never lies inside a bucket',
        text: 'Use buckets of width 2 (no wider than the average). Two values in one bucket are closer than the answer, so each bucket only keeps its min and max; compare each bucket\'s min with the previous bucket\'s max.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'buckets of width 2 over [1, 10]', items: ['1', '3', '6', '·', '9'], marks: { '2': 'target', '4': 'target' } }],
          caption: 'the gap 6 → 9 crosses an empty bucket',
        },
      },
    ],
    brute: {
      idea: 'Sort and compare neighbours.',
      cost: 'O(n log n)',
      waste: 'A full order is more than needed: only gaps between buckets can be the largest.',
    },
    pattern: {
      pick: 'sorting-and-selection',
      why: 'Pigeonhole buckets (or radix sort) give the answer in O(n) without a comparison sort.',
      not: [
        { id: 'hashing', why: 'Buckets are chosen by value range, not by a hash; their order matters.' },
        { id: 'heap-patterns', why: 'A heap still sorts in O(n log n).' },
      ],
    },
    watch: {
      viz: 'SortWalkViz',
      inputs: [
        { label: '[3, 6, 9, 1]', input: { mode: 'gap', nums: [3, 6, 9, 1] } },
        { label: '[1, 10, 5, 22, 3]', input: { mode: 'gap', nums: [1, 10, 5, 22, 3] } },
      ],
    },
    edges: ['Fewer than two numbers: [10] → 0.', 'All equal: [5, 5, 5] → 0.', 'Two numbers: [1, 100] → 99.'],
    not: { '0': [], '1': [] },
  },
};
