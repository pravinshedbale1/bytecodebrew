/** Practice thinking walkthroughs: binary-search-on-answer (format: src/data/think/index.js). */
export default {
  'koko-eating-bananas': {
    read: [
      { phrase: 'Return the smallest integer `k`', says: 'The answer is a number we choose, and we want the smallest one that works.' },
      { phrase: 'within `h` hours', says: 'For any given k we can just check whether it works: a yes/no test.' },
      { phrase: 'she finishes it and does not start another pile that hour', says: 'Each pile takes ceil(pile / k) hours on its own. The total is a simple sum.' },
    ],
    budget: { from: 'piles ≤ 10⁴, values ≤ 10⁹', rows: [['try every k', '10⁹ × 10⁴', 'bad'], ['binary search on k', '30 × 10⁴', 'ok']], aim: 'O(n log max)', note: 'The answer lies between 1 and max(piles), up to 10⁹: we cannot try them all.' },
    observe: [
      {
        title: 'Checking one speed is easy',
        text: 'For k = 4, the piles [3, 6, 7, 11] take 1, 2, 2 and 3 hours: 8 in total, which fits h = 8.',
        sketch: { kind: 'array', rows: [{ label: 'piles', items: [3, 6, 7, 11] }, { label: 'hours at k = 4', items: [1, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }], caption: '1 + 2 + 2 + 3 = 8 ≤ 8' },
      },
      {
        title: 'Faster never hurts',
        text: 'If speed k works, every faster speed works too. So the answers to "does k work?" look like no, no, no, yes, yes, yes: they switch once.',
        sketch: { kind: 'array', rows: [{ label: 'k', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit' }, tags: { 3: [['first yes', 'success']] } }] },
      },
      {
        title: 'Search the answer, not the array',
        text: 'A yes/no that switches once can be binary searched: about 30 checks over 1 … 10⁹, each O(n).',
        sketch: { kind: 'array', rows: [{ label: 'range of k', items: ['1', '…', 'mid', '…', 'max'], marks: { 2: 'cur' } }], caption: 'mid works → look left; it doesn\'t → look right' },
      },
    ],
    brute: { idea: 'Try k = 1, 2, 3, … and return the first speed that finishes in time.', cost: 'O(max(piles) · n)', waste: 'It tests speeds one by one, ignoring that the answers are sorted (no … no, yes … yes).' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Minimise a number whose feasibility test is easy and monotone (faster always still works): binary search over the answer range.',
      not: [
        { id: 'binary-search', why: 'There is no sorted array to search; we search a range of candidate answers instead.' },
        { id: 'greedy', why: 'No local choice builds the answer; we need the smallest speed that passes a global test.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'piles [3, 6, 7, 11], h = 8', input: { mode: 'koko', piles: [3, 6, 7, 11], h: 8 } }] },
    edges: ['h equals the number of piles: the answer is the largest pile.', 'Huge piles: sum the hours in a 64-bit number.', 'A single pile.'],
  },

  'find-the-smallest-divisor-given-a-threshold': {
    read: [
      { phrase: 'Return the smallest `d`', says: 'Minimise a number we choose: a candidate for binary search on the answer.' },
      { phrase: 'that sum is at most `threshold`', says: 'For a given d the check is easy: compute the sum and compare.' },
      { phrase: 'rounding each result up', says: 'ceil(v / d) = (v + d − 1) / d in integers.' },
    ],
    budget: { from: 'nums ≤ 5 × 10⁴, values ≤ 10⁶', rows: [['try d = 1, 2, 3, …', '10⁶ × 5 × 10⁴ = 5 × 10¹⁰', 'bad'], ['binary search on d', '20 × 5 × 10⁴ = 10⁶', 'ok']], aim: 'O(n log max)', note: 'The answer lies between 1 and max(nums).' },
    observe: [
      {
        title: 'A bigger divisor never raises the sum',
        text: 'So "sum ≤ threshold" is false for small d and true from some point on.',
        sketch: { kind: 'array', rows: [{ label: 'd', items: [1, 2, 3, 4, 5, 6], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'bad', 4: 'hit', 5: 'hit' } }, { label: 'sum', items: [17, 10, 7, 7, 5, 5] }], caption: 'threshold 6: d = 5 is the first that fits' },
      },
      {
        title: 'Search d, not the array',
        text: 'Binary search d in [1, max(nums)]; each check is O(n).',
      },
    ],
    brute: { idea: 'Try d = 1, 2, 3, … and return the first whose rounded-up sum fits.', cost: 'O(n · max)', waste: 'The answers are sorted (no … no, yes … yes), so halving finds the switch.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Minimise d subject to a monotone, cheap check: binary search over d with an O(n) test. O(n log max).',
      not: [
        { id: 'binary-search', why: 'No sorted array to search; we search a range of possible divisors.' },
        { id: 'math-for-interviews', why: 'No formula gives d directly because of the rounding.' },
      ],
    },
    watch: {
      frames: [
        { title: 'lo 1, hi 9: d = 5', text: 'Sum 1 + 1 + 1 + 2 = 5 ≤ 6: works, try smaller (hi = 5).' },
        { title: 'd = 3', text: 'Sum 1 + 1 + 2 + 3 = 7 > 6: too small (lo = 4).' },
        { title: 'd = 4', text: 'Sum 1 + 1 + 2 + 3 = 7 > 6: lo = 5. lo = hi = 5: the answer is 5.' },
      ],
    },
    edges: ['threshold = n → d = max(nums).', 'All values 1 → d = 1.', 'Large values: rounding up with integers, no floating point.'],
  },

  'capacity-to-ship-packages-within-d-days': {
    read: [
      { phrase: 'Return the smallest ship capacity', says: 'Minimise a number: binary search on the answer.' },
      { phrase: 'must be shipped in the given order', says: 'Contiguous groups: loading greedily until the next package doesn\'t fit is optimal.' },
      { phrase: 'within `days` days', says: 'For a capacity, simulate and count days: the check.' },
    ],
    budget: { from: '5 × 10⁴ packages of ≤ 500', rows: [['try every capacity', '2.5 × 10⁷ × 5 × 10⁴', 'bad'], ['binary search on capacity', '25 × 5 × 10⁴', 'ok']], aim: 'O(n log total)', note: 'The capacity lies between the heaviest package and the total weight.' },
    observe: [
      {
        title: 'More capacity never needs more days',
        text: 'So "ships in ≤ days" flips once from false to true as capacity grows.',
      },
      {
        title: 'The check is a greedy load',
        text: 'Fill each day until the next package would exceed capacity, then start a new day. Count the days.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], bands: [{ from: 0, to: 4, tone: 'accent', label: '15' }, { from: 5, to: 6, tone: 'ghost', label: '13' }, { from: 7, to: 7, tone: 'accent' }, { from: 8, to: 8, tone: 'ghost' }, { from: 9, to: 9, tone: 'accent' }] }], caption: 'capacity 15: 5 days' },
      },
      {
        title: 'Bounds',
        text: 'Low: the heaviest package (anything less can\'t carry it). High: the total (everything in one day).',
      },
    ],
    brute: { idea: 'Try each capacity from the heaviest package upwards, simulating each.', cost: 'O(n · total)', waste: 'Capacities are tested one by one, though the yes/no answers are sorted.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the capacity in [max, sum], with a greedy day count as the check. O(n log sum).',
      not: [
        { id: 'greedy', why: 'Greedy loading is only the check; it can\'t pick the capacity on its own.' },
        { id: 'dp-linear', why: 'A DP over split points works (it is Split Array Largest Sum), but is O(n² · days).' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'weights 1 … 10, 5 days', input: { mode: 'ship', weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days: 5 } }] },
    edges: ['days = n → the heaviest package.', 'days = 1 → the total.', 'One heavy package among light ones.'],
  },

  'minimum-number-of-days-to-make-m-bouquets': {
    read: [
      { phrase: 'Return the minimum number of days you must wait', says: 'Minimise a day: binary search on the answer.' },
      { phrase: '`k` adjacent flowers that have all bloomed', says: 'For a given day, count runs of bloomed flowers: each k consecutive make one bouquet.' },
      { phrase: 'or `-1` if it can never be done', says: 'If m · k > n, even waiting forever isn\'t enough.' },
    ],
    budget: { from: 'n ≤ 10⁵, days up to 10⁹', rows: [['try every day', '10⁹ × 10⁵', 'bad'], ['binary search on the day', '30 × 10⁵', 'ok']], aim: 'O(n log max)', note: 'Check m · k > n first, as an early −1 (and to avoid overflow).' },
    observe: [
      {
        title: 'Waiting longer never gives fewer bouquets',
        text: '"At least m bouquets by day d" is false, then true.',
      },
      {
        title: 'Count bouquets with one pass',
        text: 'Walk left to right counting consecutive bloomed flowers; every k of them make a bouquet and reset the count; an unbloomed flower resets it too.',
        sketch: { kind: 'array', rows: [{ label: 'bloomDay', items: [1, 10, 3, 10, 2], marks: { 0: 'hit', 2: 'hit', 4: 'hit', 1: 'dim', 3: 'dim' } }], caption: 'day 3, k = 1: three bloomed flowers → 3 bouquets' },
      },
    ],
    brute: { idea: 'Test each distinct bloom day in increasing order by counting bouquets.', cost: 'O(n²)', waste: 'Days are tested in order, though the answers are sorted and can be halved.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the day with a linear bouquet count as the check. O(n log max).',
      not: [
        { id: 'sliding-window', why: 'Runs of bloomed flowers look like windows, but the day changes which flowers count; the window is inside the check.' },
        { id: 'greedy', why: 'Counting bouquets greedily is the check, not the answer.' },
      ],
    },
    watch: {
      frames: [
        { title: 'm · k = 3 ≤ 5', text: 'Possible. Search days 1 … 10.' },
        { title: 'Day 5: 3 bouquets', text: 'Flowers 0, 2, 4 bloomed: enough. Try earlier.' },
        { title: 'Day 2: only 2', text: 'Flowers 0 and 4: not enough. Day 3 has 3: the answer is 3.' },
      ],
    },
    edges: ['m · k > n → −1.', 'k = n: wait for the latest bloom.', 'm · k overflow: compare as long.'],
  },

  'minimum-time-to-complete-trips': {
    read: [
      { phrase: 'Return the minimum time needed', says: 'Minimise a time: binary search on the answer.' },
      { phrase: 'can start its next trip as soon as it finishes', says: 'By time t, bus i has done ⌊t / time[i]⌋ trips: an easy check.' },
      { phrase: 'All buses run at the same time, independently', says: 'Total trips by t is just the sum over buses.' },
    ],
    budget: { from: '10⁵ buses, up to 10⁷ trips', rows: [['advance t by 1', 'up to 10¹⁴ × 10⁵', 'bad'], ['binary search on t', '47 × 10⁵', 'ok']], aim: 'O(n log T)', note: 'The upper bound min(time) × totalTrips can reach 10¹⁴: use long.' },
    observe: [
      {
        title: 'Trips only grow with time',
        text: 'Σ ⌊t / time[i]⌋ never decreases, so "enough trips by t" flips once.',
        sketch: { kind: 'array', rows: [{ label: 't', items: [1, 2, 3, 4], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' } }, { label: 'trips', items: [1, 3, 5, 7] }], caption: 'buses [1, 2, 3], need 5: t = 3' },
      },
      {
        title: 'Bound the search',
        text: 'The fastest bus alone finishes totalTrips by min(time) × totalTrips; that is a safe upper bound.',
      },
    ],
    brute: { idea: 'Increase t by 1 until the trip count reaches totalTrips.', cost: 'O(n · T)', waste: 'Each unit of time is tested on its own, though the counts are sorted.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the time with a sum of ⌊t / time[i]⌋ as the check. O(n log T).',
      not: [
        { id: 'heap-patterns', why: 'Simulating trip completions with a heap is O(totalTrips log n): too slow for 10⁷ trips.' },
        { id: 'math-for-interviews', why: 'There is no closed form because of the floors.' },
      ],
    },
    watch: {
      frames: [
        { title: 't = 2: 2 + 1 + 0 = 3 trips', text: 'Not enough.' },
        { title: 't = 3: 3 + 1 + 1 = 5 trips', text: 'Enough: the first such t is 3.' },
      ],
    },
    edges: ['One bus.', 'Huge totalTrips: 64-bit bounds and sums.', 'Stop summing early once the total passes the target (avoids overflow).'],
  },

  'magnetic-force-between-two-balls': {
    read: [
      { phrase: 'the smallest distance between any two balls is as large as possible', says: 'Maximise a minimum: the classic shape for binary search on the answer.' },
      { phrase: 'Place `m` balls into baskets', says: 'For a gap d, check whether m balls fit with every gap ≥ d.' },
      { phrase: 'at the distinct positions in `position`', says: 'Positions come unsorted: sort them first.' },
    ],
    budget: { from: 'n ≤ 10⁵, positions ≤ 10⁹', rows: [['try every gap', '10⁹ × 10⁵', 'bad'], ['sort + binary search on the gap', '10⁵ log 10⁵ + 30 × 10⁵', 'ok']], aim: 'O(n log n + n log R)', note: 'R is the spread of the positions.' },
    observe: [
      {
        title: 'Greedy placement checks a gap',
        text: 'Put a ball in the first basket, then in the next basket at least d further, and so on. If that fits m balls, gap d is achievable.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 7], marks: { 0: 'hit', 3: 'hit', 4: 'hit' } }], caption: 'gap 3: balls at 1, 4, 7' },
      },
      {
        title: 'Smaller gaps are easier',
        text: 'If gap d works, every smaller gap works too: true … true, false … false. Find the last true.',
      },
    ],
    brute: { idea: 'Try every gap from the largest possible downwards, checking each greedily.', cost: 'O(n · R)', waste: 'Gaps are tested one by one, though feasibility flips only once.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Maximise the minimum gap: binary search d, with greedy placement on the sorted positions as the check.',
      not: [
        { id: 'greedy', why: 'Greedy placement only answers "does d work?"; the search picks d.' },
        { id: 'sorting-and-selection', why: 'Sorting is the setup; it doesn\'t choose the gap.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'positions [1, 2, 3, 4, 7], m = 3', input: { mode: 'cows', positions: [1, 2, 3, 4, 7], m: 3 } }, { label: '[1, 2, 4, 8, 9], m = 3', input: { mode: 'cows', positions: [1, 2, 4, 8, 9], m: 3 } }] },
    edges: ['m = 2: the two ends.', 'm = n: the smallest neighbouring gap.', 'Unsorted input.'],
  },

  'split-array-largest-sum': {
    read: [
      { phrase: 'choose the one in which the largest part sum is as small as possible', says: 'Minimise a maximum: binary search on that maximum.' },
      { phrase: 'Split `nums` into `k` non-empty contiguous parts', says: 'For a limit L, cut greedily whenever the next value would push a part over L, and count the parts.' },
      { phrase: 'The parts keep the original order', says: 'Contiguous parts: it is the same as shipping packages in k days.' },
    ],
    budget: { from: 'n ≤ 1000, k ≤ 50', rows: [['DP over (parts, prefix)', '50 × 10⁶ = 5 × 10⁷', 'ok'], ['binary search on the limit', '30 × 1000', 'ok']], aim: 'O(n log sum)', note: 'The DP passes at these limits, but the search is simpler and faster.' },
    observe: [
      {
        title: 'A bigger limit never needs more parts',
        text: 'So "fits in ≤ k parts" flips from false to true as the limit grows.',
      },
      {
        title: 'It is Ship Within D Days',
        text: 'Parts are days, the limit is the capacity. For [7, 2, 5, 10, 8] and k = 2, limit 18 gives [7, 2, 5] and [10, 8].',
        sketch: { kind: 'array', rows: [{ items: [7, 2, 5, 10, 8], bands: [{ from: 0, to: 2, tone: 'accent', label: '14' }, { from: 3, to: 4, tone: 'success', label: '18' }] }] },
      },
    ],
    brute: { idea: 'Try every way to place the k − 1 cuts and keep the smallest largest part.', cost: 'O(C(n − 1, k − 1) · n)', waste: 'The same suffixes are split again and again; searching the limit avoids enumerating splits at all.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the largest part sum in [max, total], with a greedy part count as the check. O(n log total).',
      not: [
        { id: 'dp-linear', why: 'A DP over (parts, prefix) is correct, at O(k · n²).' },
        { id: 'greedy', why: 'Cutting greedily needs a limit to cut against; the search provides it.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: '[7, 2, 5, 10, 8], k = 2 (as days)', input: { mode: 'ship', weights: [7, 2, 5, 10, 8], days: 2 } }] },
    edges: ['k = 1: the total.', 'k = n: the largest value.', 'Zeros in nums.'],
  },
};
