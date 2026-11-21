/** Practice thinking walkthroughs: binary-search-on-answer (format: src/data/think/index.js). */
export default {
  'koko-eating-bananas': {
    aha: 'Instead of searching the piles, search the answer: the eating speed k. For any k you can quickly add up the hours it takes, and a faster speed never takes longer, so binary search k between 1 and the biggest pile.',
    asks: {
      read: 'Which words tell you the answer is a number you choose, and that you can check any choice?',
      observe: 'At speed 4, how many hours do the piles [3, 6, 7, 11] take? At speed 3?',
      pattern: 'If speed 4 is fast enough, is speed 5 fast enough too? What shape do the yes/no answers make?',
    },
    read: [
      { phrase: 'Return the smallest integer `k`', says: 'The answer is a number we choose, and we want the smallest one that works.' },
      { phrase: 'within `h` hours', says: 'For any k we can check whether it works: a yes/no test.' },
      { phrase: 'she finishes it and does not start another pile that hour', says: 'Each pile takes ⌈pile / k⌉ hours on its own; the total is a simple sum.' },
    ],
    budget: { from: 'piles ≤ 10⁴, values ≤ 10⁹', rows: [['try every k', '10⁹ × 10⁴', 'bad'], ['binary search on k', '30 × 10⁴', 'ok']], aim: 'O(n log max)', note: 'The answer lies between 1 and max(piles), up to 10⁹: we can\'t try them all.' },
    observe: [
      {
        title: 'Checking one speed is easy',
        text: 'At k = 4, the piles take 1, 2, 2 and 3 hours: 8 in total, which fits h = 8.',
        sketch: { kind: 'array', rows: [{ label: 'piles', items: [3, 6, 7, 11] }, { label: 'hours at k = 4', items: [1, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }], caption: '1 + 2 + 2 + 3 = 8 ≤ 8' },
      },
      {
        title: 'Faster never hurts',
        text: 'If speed k works, every faster speed works too. So "does k work?" reads no, no, no, yes, yes, …: it flips once.',
        sketch: { kind: 'array', rows: [{ label: 'k', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit' }, tags: { 3: [['first yes', 'success']] } }] },
      },
      {
        title: 'Search the answer, not the array',
        text: 'A yes/no that flips once can be binary searched: about 30 checks over 1 … 10⁹, each one a pass over the piles.',
        sketch: { kind: 'array', rows: [{ label: 'range of k', items: ['1', '…', 'mid', '…', 'max'], marks: { 2: 'cur' } }], caption: 'mid works → look left; it doesn\'t → look right' },
      },
    ],
    brute: { idea: 'Try k = 1, 2, 3, … and return the first speed that finishes in time.', cost: 'O(max(piles) · n)', waste: 'It tests speeds one by one, ignoring that the answers are already in order (no … no, yes … yes).' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Minimise a number whose check is cheap and only flips once (faster always still works): binary search over the range of possible answers.',
      not: [
        { id: 'binary-search', why: 'There is no sorted array to search; we search a range of candidate answers instead.' },
        { id: 'greedy', why: 'No local choice builds the answer; we need the smallest speed that passes a whole-schedule test.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'piles [3, 6, 7, 11], h = 8', input: { mode: 'koko', piles: [3, 6, 7, 11], h: 8 } }] },
    edges: ['h equals the number of piles: [3, 6, 7, 11], h 4 → 11 (the largest pile).', 'Huge piles: add the hours up in a 64-bit number → no overflow.', 'A single pile: [10], h 5 → 2.'],
  },

  'find-the-smallest-divisor-given-a-threshold': {
    aha: 'Search the answer d itself. For any d the rounded-up sum takes one pass to compute, and a bigger d never makes the sum bigger, so binary search d between 1 and the largest number.',
    asks: {
      observe: 'For [1, 2, 5, 9], what is the rounded-up sum with d = 4? With d = 5? Which fits a threshold of 6?',
      pattern: 'As d grows, can the sum ever go up? What does that let you do?',
    },
    read: [
      { phrase: 'Return the smallest `d`', says: 'Minimise a number we choose: a candidate for binary search on the answer.' },
      { phrase: 'that sum is at most `threshold`', says: 'For a given d the check is easy: compute the sum and compare.' },
      { phrase: 'rounding each result up', says: '⌈v / d⌉ = (v + d − 1) / d with whole numbers.' },
    ],
    budget: { from: 'nums ≤ 5 × 10⁴, values ≤ 10⁶', rows: [['try d = 1, 2, 3, …', '10⁶ × 5 × 10⁴ = 5 × 10¹⁰', 'bad'], ['binary search on d', '20 × 5 × 10⁴ = 10⁶', 'ok']], aim: 'O(n log max)', note: 'The answer lies between 1 and max(nums).' },
    observe: [
      {
        title: 'A bigger divisor never raises the sum',
        text: 'So "sum ≤ threshold" is no for small d and yes from some point on.',
        sketch: { kind: 'array', rows: [{ label: 'd', items: [1, 2, 3, 4, 5, 6], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'bad', 4: 'hit', 5: 'hit' } }, { label: 'sum', items: [17, 10, 7, 7, 5, 5] }], caption: 'threshold 6: d = 5 is the first that fits' },
      },
      {
        title: 'One check is one pass',
        text: 'At d = 5: ⌈1/5⌉ + ⌈2/5⌉ + ⌈5/5⌉ + ⌈9/5⌉ = 1 + 1 + 1 + 2 = 5.',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [1, 2, 5, 9] }, { label: 'rounded up at d = 5', items: [1, 1, 1, 2], marks: { 3: 'target' } }] },
      },
    ],
    brute: { idea: 'Try d = 1, 2, 3, … and return the first whose rounded-up sum fits.', cost: 'O(n · max)', waste: 'The answers are in order (no … no, yes … yes), so halving finds the switch.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Minimise d with a cheap check that flips once: binary search d with an O(n) test. O(n log max).',
      not: [
        { id: 'binary-search', why: 'No sorted array to search; we search a range of possible divisors.' },
        { id: 'math-for-interviews', why: 'No formula gives d directly, because of the rounding.' },
      ],
    },
    watch: {
      frames: [
        { title: 'lo 1, hi 9: try d = 5', text: 'Sum 1 + 1 + 1 + 2 = 5 ≤ 6: it works, so try smaller (hi = 5).', sketch: { kind: 'array', rows: [{ label: 'd', items: [1, 2, 3, 4, 5, 6, 7, 8, 9], marks: { 4: 'hit' } }] } },
        { title: 'Try d = 3', text: 'Sum 1 + 1 + 2 + 3 = 7 > 6: too small (lo = 4).', sketch: { kind: 'array', rows: [{ label: 'd', items: [1, 2, 3, 4, 5], marks: { 2: 'bad' } }] } },
        { title: 'Try d = 4', text: 'Sum 1 + 1 + 2 + 3 = 7 > 6: lo = 5.', sketch: { kind: 'array', rows: [{ label: 'd', items: [4, 5], marks: { 0: 'bad' } }] } },
        { title: 'lo = hi = 5 → 5', text: 'The smallest divisor that fits is 5.', sketch: { kind: 'array', rows: [{ label: 'd', items: [5], marks: { 0: 'hit' } }] } },
      ],
    },
    edges: ['threshold = n: [2, 7], 2 → 7 (d = the largest value).', 'All values 1: [1, 1], 5 → 1.', 'Round up with whole numbers: (v + d − 1) / d → no floating point.'],
  },

  'capacity-to-ship-packages-within-d-days': {
    aha: 'Search the answer: the capacity. For any capacity, load packages in order until the next one won\'t fit and count the days; more capacity never needs more days, so binary search between the heaviest package and the total weight.',
    asks: {
      observe: 'With capacity 15, how do the packages 1 … 10 split into days, loading in order? How many days?',
      pattern: 'What is the smallest capacity that could possibly work, and the largest you would ever need?',
    },
    read: [
      { phrase: 'Return the smallest ship capacity', says: 'Minimise a number: binary search on the answer.' },
      { phrase: 'must be shipped in the given order', says: 'Days are unbroken groups: loading greedily until the next package doesn\'t fit is the best way to count days for a given capacity.' },
      { phrase: 'within `days` days', says: 'For a capacity, simulate and count days: that is the check.' },
    ],
    budget: { from: '5 × 10⁴ packages of ≤ 500', rows: [['try every capacity', '2.5 × 10⁷ × 5 × 10⁴', 'bad'], ['binary search on capacity', '25 × 5 × 10⁴', 'ok']], aim: 'O(n log total)', note: 'The capacity lies between the heaviest package and the total weight.' },
    observe: [
      {
        title: 'More capacity never needs more days',
        text: 'So "ships in ≤ days" is no for small capacities and yes from some point on.',
        sketch: { kind: 'array', rows: [{ label: 'capacity', items: [13, 14, 15, 16], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' } }, { label: 'days', items: [6, 6, 5, 5] }], caption: '5 days allowed: 15 is the first that works' },
      },
      {
        title: 'The check is a greedy load',
        text: 'Fill each day until the next package would go over the capacity, then start a new day.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], bands: [{ from: 0, to: 4, tone: 'accent', label: '15' }, { from: 5, to: 6, tone: 'ghost', label: '13' }, { from: 7, to: 7, tone: 'accent' }, { from: 8, to: 8, tone: 'ghost' }, { from: 9, to: 9, tone: 'accent' }] }], caption: 'capacity 15: 5 days' },
      },
    ],
    brute: { idea: 'Try each capacity from the heaviest package upwards, simulating each.', cost: 'O(n · total)', waste: 'Capacities are tested one by one, though the yes/no answers are already in order.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the capacity between the heaviest package and the total, with a greedy day count as the check. O(n log total).',
      not: [
        { id: 'greedy', why: 'Greedy loading is only the check; it can\'t pick the capacity on its own.' },
        { id: 'dp-linear', why: 'A DP over where each day ends works (it is Split Array Largest Sum), but is much slower.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'weights 1 … 10, 5 days', input: { mode: 'ship', weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days: 5 } }] },
    edges: ['days = n: [3, 2, 2], 3 → 3 (the heaviest package).', 'days = 1: [3, 2, 2], 1 → 7 (the total).', 'One heavy package: [1, 1, 10], 2 → 10.'],
  },

  'minimum-number-of-days-to-make-m-bouquets': {
    aha: 'Search the answer: the day. By a given day, count bouquets in one pass (runs of k bloomed flowers in a row); waiting longer never gives fewer bouquets, so binary search the day.',
    asks: {
      observe: 'By day 3, which flowers of [1, 10, 3, 10, 2] have bloomed? With k = 1, how many bouquets is that?',
      pattern: 'If you can make m bouquets by day d, can you also make them by day d + 1?',
    },
    read: [
      { phrase: 'Return the minimum number of days you must wait', says: 'Minimise a day: binary search on the answer.' },
      { phrase: '`k` adjacent flowers that have all bloomed', says: 'For a given day, count runs of bloomed flowers: every k in a row make one bouquet.' },
      { phrase: 'or `-1` if it can never be done', says: 'If m · k > n, even waiting forever isn\'t enough.' },
    ],
    budget: { from: 'n ≤ 10⁵, days up to 10⁹', rows: [['try every day', '10⁹ × 10⁵', 'bad'], ['binary search on the day', '30 × 10⁵', 'ok']], aim: 'O(n log max)', note: 'Check m · k > n first, as an early −1 (comparing in 64 bits).' },
    observe: [
      {
        title: 'Waiting longer never gives fewer bouquets',
        text: '"At least m bouquets by day d" is no, then yes.',
        sketch: { kind: 'array', rows: [{ label: 'day', items: [1, 2, 3, 10], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' } }, { label: 'bouquets', items: [1, 2, 3, 5] }], caption: 'm = 3, k = 1: day 3 is the first that works' },
      },
      {
        title: 'Count bouquets in one pass',
        text: 'Walk left to right counting bloomed flowers in a row; every k of them make a bouquet and restart the count; an unbloomed flower restarts it too.',
        sketch: { kind: 'array', rows: [{ label: 'bloom day', items: [1, 10, 3, 10, 2], marks: { 0: 'hit', 2: 'hit', 4: 'hit', 1: 'dim', 3: 'dim' } }], caption: 'by day 3, with k = 1: 3 bouquets' },
      },
    ],
    brute: { idea: 'Test each distinct bloom day in increasing order by counting bouquets.', cost: 'O(n²)', waste: 'Days are tested one by one, though the answers are in order and can be halved.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the day with a one-pass bouquet count as the check. O(n log max).',
      not: [
        { id: 'sliding-window', why: 'Runs of bloomed flowers look like windows, but which flowers count depends on the day; the run counting is just the check.' },
        { id: 'greedy', why: 'Counting bouquets greedily is the check, not the answer.' },
      ],
    },
    watch: {
      frames: [
        { title: 'm · k = 3 ≤ 5', text: 'Possible. Search days 1 … 10.', sketch: { kind: 'array', rows: [{ label: 'bloom day', items: [1, 10, 3, 10, 2] }] } },
        { title: 'Day 5: 3 bouquets', text: 'Flowers 0, 2 and 4 have bloomed: enough. Try earlier.', sketch: { kind: 'array', rows: [{ items: [1, 10, 3, 10, 2], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }] } },
        { title: 'Day 2: only 2', text: 'Flowers 0 and 4: not enough. Try later.', sketch: { kind: 'array', rows: [{ items: [1, 10, 3, 10, 2], marks: { 0: 'hit', 4: 'hit', 2: 'bad' } }] } },
        { title: 'Day 3: 3 → the answer is 3', text: 'Day 3 is the first day with enough bouquets.', sketch: { kind: 'array', rows: [{ items: [1, 10, 3, 10, 2], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }] } },
      ],
    },
    edges: ['Not enough flowers: [1, 2], m 2, k 2 → −1.', 'k = n: [3, 1, 2], m 1, k 3 → 3 (wait for the last bloom).', 'm · k near 10¹¹: compare in long → no overflow.'],
  },

  'minimum-time-to-complete-trips': {
    aha: 'Search the answer: the time t. By time t, bus i has finished ⌊t / time[i]⌋ trips, so one pass adds up all trips; more time never means fewer trips, so binary search t.',
    asks: {
      observe: 'With buses taking [1, 2, 3], how many trips are done by time 2? By time 3?',
      pattern: 'Simulating trip by trip is slow. What single number could you search for, and how would you check it?',
    },
    read: [
      { phrase: 'Return the minimum time needed', says: 'Minimise a time: binary search on the answer.' },
      { phrase: 'can start its next trip as soon as it finishes', says: 'By time t, bus i has done ⌊t / time[i]⌋ trips: an easy check.' },
      { phrase: 'All buses run at the same time, independently', says: 'Total trips by t is just the sum over buses.' },
    ],
    budget: { from: '10⁵ buses, up to 10⁷ trips', rows: [['advance t by 1', 'up to 10¹⁴ × 10⁵', 'bad'], ['binary search on t', '47 × 10⁵', 'ok']], aim: 'O(n log T)', note: 'The upper bound min(time) × totalTrips can reach 10¹⁴: use long.' },
    observe: [
      {
        title: 'Trips only grow with time',
        text: 'So "enough trips by t" flips once from no to yes.',
        sketch: { kind: 'array', rows: [{ label: 't', items: [1, 2, 3, 4], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' } }, { label: 'trips', items: [1, 3, 5, 7] }], caption: 'buses [1, 2, 3], need 5: t = 3' },
      },
      {
        title: 'A safe upper bound',
        text: 'The fastest bus alone finishes all the trips by min(time) × totalTrips, so the answer is never above that.',
        sketch: { kind: 'array', rows: [{ label: 'search range', items: ['1', '…', '1 × 5 = 5'], marks: { 2: 'target' } }] },
      },
    ],
    brute: { idea: 'Increase t by 1 until the trip count reaches totalTrips.', cost: 'O(n · T)', waste: 'Each moment is tested on its own, though the counts only ever grow.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the time with a sum of ⌊t / time[i]⌋ as the check. O(n log T).',
      not: [
        { id: 'heap-patterns', why: 'Simulating finished trips with a heap is O(totalTrips log n): too slow for 10⁷ trips.' },
        { id: 'math-for-interviews', why: 'There is no formula because of the rounding down.' },
      ],
    },
    watch: {
      frames: [
        { title: 't = 2: 2 + 1 + 0 = 3 trips', text: 'Not enough for 5.', sketch: { kind: 'array', rows: [{ label: 'trips per bus', items: [2, 1, 0], marks: { 0: 'kept', 1: 'kept' } }] } },
        { title: 't = 3: 3 + 1 + 1 = 5 trips', text: 'Enough.', sketch: { kind: 'array', rows: [{ label: 'trips per bus', items: [3, 1, 1], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] } },
        { title: 'The first such t → 3', text: 't = 2 fails and t = 3 works: the answer is 3.', sketch: { kind: 'array', rows: [{ label: 't', items: [2, 3], marks: { 0: 'bad', 1: 'hit' } }] } },
      ],
    },
    edges: ['One bus: [2], 1 → 2.', 'Huge totals: [10⁷], 10⁷ → 10¹⁴ (needs long).', 'Stop adding once the total passes the target → avoids overflow.'],
  },

  'magnetic-force-between-two-balls': {
    aha: 'Search the answer: the smallest gap d. To check a d, sort the positions and place balls greedily (first basket, then the next basket at least d further…); if m balls fit, d works. Smaller gaps are always easier, so binary search the largest d that works.',
    asks: {
      observe: 'With baskets at [1, 2, 3, 4, 7] and 3 balls, can every gap be at least 3? At least 4?',
      pattern: '"Make the smallest gap as large as possible": what number would you search for, and how do you check one value?',
    },
    read: [
      { phrase: 'the smallest distance between any two balls is as large as possible', says: 'Maximise a minimum: the classic shape for binary search on the answer.' },
      { phrase: 'Place `m` balls into baskets', says: 'For a gap d, check whether m balls fit with every gap ≥ d.' },
      { phrase: 'at the distinct positions in `position`', says: 'Positions come unsorted: sort them first.' },
    ],
    budget: { from: 'n ≤ 10⁵, positions ≤ 10⁹', rows: [['try every gap', '10⁹ × 10⁵', 'bad'], ['sort + binary search on the gap', '10⁵ log 10⁵ + 30 × 10⁵', 'ok']], aim: 'O(n log n + n log R)', note: 'R is the spread of the positions.' },
    observe: [
      {
        title: 'Greedy placement checks one gap',
        text: 'Put a ball in the first basket, then in the next basket at least d further, and so on. If that fits m balls, gap d is possible.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 7], marks: { 0: 'hit', 3: 'hit', 4: 'hit' } }], caption: 'gap 3: balls at 1, 4, 7' },
      },
      {
        title: 'Smaller gaps are easier',
        text: 'If gap d works, every smaller gap works too: yes … yes, no … no. Find the last yes.',
        sketch: { kind: 'array', rows: [{ label: 'gap', items: [1, 2, 3, 4, 5], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'bad', 4: 'bad' }, tags: { 2: [['last yes', 'success']] } }] },
      },
    ],
    brute: { idea: 'Try every gap from the largest possible downwards, checking each greedily.', cost: 'O(n · R)', waste: 'Gaps are tested one by one, though the yes/no flips only once.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Maximise the minimum gap: binary search d, with greedy placement on the sorted positions as the check.',
      not: [
        { id: 'greedy', why: 'Greedy placement only answers "does d work?"; the search chooses d.' },
        { id: 'sorting-and-selection', why: 'Sorting is the setup; it doesn\'t choose the gap.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'positions [1, 2, 3, 4, 7], m = 3', input: { mode: 'cows', positions: [1, 2, 3, 4, 7], m: 3 } }, { label: '[1, 2, 4, 8, 9], m = 3', input: { mode: 'cows', positions: [1, 2, 4, 8, 9], m: 3 } }] },
    edges: ['Two balls: [1, 5, 9], m 2 → 8 (the two ends).', 'As many balls as baskets: [1, 3, 4], m 3 → 1.', 'Unsorted input: [7, 1, 4], m 2 → 6.'],
  },

  'split-array-largest-sum': {
    aha: 'Search the answer: the largest part sum L. For any L, cut greedily whenever the next number would push a part over L and count the parts; a bigger L never needs more parts, so binary search L. It is the shipping problem with "days" renamed "parts".',
    asks: {
      observe: 'If no part may exceed 18, how does [7, 2, 5, 10, 8] split, cutting as late as possible? How many parts?',
      pattern: 'Have you seen "the smallest capacity that fits in k days" before? How is this the same problem?',
    },
    read: [
      { phrase: 'choose the one in which the largest part sum is as small as possible', says: 'Minimise a maximum: binary search on that maximum.' },
      { phrase: 'Split `nums` into `k` non-empty contiguous parts', says: 'For a limit L, cut greedily whenever the next number would push a part over L, and count the parts.' },
      { phrase: 'The parts keep the original order', says: 'Unbroken parts in order: the same as shipping packages in k days.' },
    ],
    budget: { from: 'n ≤ 1000, k ≤ 50', rows: [['DP over (parts, prefix)', '50 × 10⁶ = 5 × 10⁷', 'ok'], ['binary search on the limit', '30 × 1000', 'ok']], aim: 'O(n log sum)', note: 'The DP passes at these limits, but the search is simpler and faster.' },
    observe: [
      {
        title: 'A bigger limit never needs more parts',
        text: 'So "fits in ≤ k parts" is no for small limits and yes from some point on.',
        sketch: { kind: 'array', rows: [{ label: 'limit', items: [15, 17, 18, 20], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' } }, { label: 'parts', items: [3, 3, 2, 2] }], caption: 'k = 2: 18 is the first limit that fits' },
      },
      {
        title: 'It is Ship Within D Days',
        text: 'Parts are days and the limit is the capacity. With limit 18, [7, 2, 5] and [10, 8].',
        sketch: { kind: 'array', rows: [{ items: [7, 2, 5, 10, 8], bands: [{ from: 0, to: 2, tone: 'accent', label: '14' }, { from: 3, to: 4, tone: 'success', label: '18' }] }] },
      },
    ],
    brute: { idea: 'Try every way to place the k − 1 cuts and keep the smallest largest part.', cost: 'O(C(n − 1, k − 1) · n)', waste: 'The same tails are split again and again; searching the limit avoids listing splits at all.' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Binary search the largest part sum between the largest number and the total, with a greedy part count as the check. O(n log total).',
      not: [
        { id: 'dp-linear', why: 'A DP over (parts, prefix) is correct, at O(k · n²).' },
        { id: 'greedy', why: 'Cutting greedily needs a limit to cut against; the search provides it.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: '[7, 2, 5, 10, 8], k = 2 (as days)', input: { mode: 'ship', weights: [7, 2, 5, 10, 8], days: 2 } }] },
    edges: ['k = 1: [1, 2, 3], 1 → 6 (the total).', 'k = n: [1, 2, 3], 3 → 3 (the largest number).', 'Zeros: [0, 0, 5], 2 → 5.'],
  },
};
