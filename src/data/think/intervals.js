/** Practice thinking walkthroughs: intervals (format: src/data/think/index.js). */

export default {
  'meeting-rooms': {
    free: true,
    aha: 'Sort the meetings by start time. If any two meetings clash, then some pair of neighbours in that order clashes too, so one pass comparing each meeting with the one before it answers the question.',
    asks: {
      observe: 'Sorted by start, [0, 30] comes before [5, 10]. Does [5, 10] start before [0, 30] ends?',
      pattern: 'After sorting by start, which earlier meeting is the only one you need to compare with?',
      read: 'Which sentence tells you exactly what counts as a clash, and does touching count?',
      budget: 'Checking every pair of 10⁴ meetings is 5 × 10⁷. What does sorting reduce the checking to?',
      brute: 'What is the most direct check, and which pairs does it waste time on?',
      watch: 'Sorted by start, which neighbouring pair will be the first clash?',
    },
    read: [
      {
        phrase: 'if no two meetings overlap',
        says: 'Sounds like a check on every pair, but after sorting by start, a clash anywhere means a clash between some two neighbours.',
      },
      {
        phrase: 'A meeting that ends at time `t` does not overlap one that starts at time `t`',
        says: 'Touching is fine: a clash means next.start < previous.end (strictly).',
      },
    ],
    budget: {
      from: 'intervals.length ≤ 10⁴',
      n: 10000,
      aim: 'O(n log n)',
      note: 'Every pair is 5 × 10⁷: it passes, but sorting makes it one comparison per meeting.',
    },
    observe: [
      {
        title: 'After sorting by start, only neighbours can clash',
        text: '[5, 10] starts at 5, before [0, 30] ends at 30: a clash. Why neighbours are enough: if meeting C clashes with an earlier A, the meeting right after A starts no later than C, so it also starts before A ends. That neighbouring pair is caught.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['[0,30]', '[5,10]', '[15,20]'], marks: { '0': 'target', '1': 'bad' }, tags: { '1': [['5 < 30', 'danger']] } }],
        },
      },
      {
        title: 'Touching doesn\'t count',
        text: '[1, 5] and [5, 8] are fine: one ends exactly when the next starts.',
        sketch: { kind: 'array', rows: [{ items: ['[1,5]', '[5,8]'], marks: { '0': 'hit', '1': 'hit' }, tags: { '1': [['5 = 5: ok', 'success']] } }] },
      },
    ],
    brute: {
      idea: 'Check every pair of meetings for overlap.',
      cost: 'O(n²)',
      waste: 'Most pairs are far apart in time; sorting brings the only candidates next to each other.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Sort by start and sweep: a clash is any meeting that starts before the previous one ends. O(n log n).',
      not: [
        { id: 'heap-patterns', why: 'A heap of end times counts rooms (Meeting Rooms II); one person only needs a yes or no.' },
        { id: 'greedy', why: 'There is no choice to make; we just check the schedule.' },
      ],
    },
    watch: {
      viz: 'IntervalWalkViz',
      inputs: [
        { label: '[0, 30], [5, 10], [15, 20]', input: { mode: 'rooms', list: [[0, 30], [5, 10], [15, 20]] } },
        { label: '[7, 10], [2, 4]', input: { mode: 'rooms', list: [[7, 10], [2, 4]] } },
      ],
    },
    edges: ['No meetings: [] → true.', 'Back-to-back meetings: [[1, 5], [5, 8]] → true.', 'Unsorted but fine: [[7, 10], [2, 4]] → true.'],
    not: { '1': [] },
  },

  'merge-intervals': {
    aha: 'Sort by start. Then overlapping intervals sit next to each other, and each interval either stretches the last merged interval (if it starts before that one ends) or starts a new one.',
    asks: {
      observe: 'Sorted, [1, 3] is followed by [2, 6]. Does 2 come before 3 ends? What do they merge into?',
      pattern: 'After sorting by start, which merged interval can the next one possibly overlap?',
      read: 'Which sentence settles whether [1, 4] and [4, 5] merge?',
      budget: 'If each new interval were merged against all results so far, how much work is that for 10⁴ intervals?',
      brute: 'How would you merge without sorting, and what does each insertion have to scan?',
      watch: 'In [[1, 3], [2, 6], [8, 10], [15, 18]], where does the first new group start?',
    },
    read: [
      { phrase: 'Merge every group of overlapping intervals into one', says: 'Overlaps chain: [1, 3], [2, 6] and [5, 8] all become one.' },
      { phrase: 'sorted by start', says: 'The output order hints at the method: sort by start first.' },
      {
        phrase: 'Intervals that only touch, like `[1,4]` and `[4,5]`, overlap and are merged',
        says: 'Merge when next.start ≤ current end (≤, not <).',
      },
    ],
    budget: { from: 'intervals.length ≤ 10⁴', n: 10000, aim: 'O(n log n)', note: 'Merging each interval against all results is O(n²).' },
    observe: [
      {
        title: 'Sorting puts overlapping intervals together',
        text: 'After sorting by start, the intervals that overlap form unbroken runs. A later interval can\'t reach back past a gap: everything after the gap starts even later. So each interval either extends the group being built or starts a new one.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'],
              marks: { '0': 'kept', '1': 'kept' },
              bands: [{ from: 0, to: 1, tone: 'success', label: '[1,6]' }],
            },
          ],
        },
      },
      {
        title: 'Only the last merged interval can grow',
        text: 'Compare the next start with the last merged end: if it overlaps, extend the end to the larger one; otherwise add a new interval.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'merged so far', items: ['[1,6]'], marks: { '0': 'target' } }, { label: 'next', items: ['[8,10]'], marks: { '0': 'cur' } }],
          caption: '8 > 6: start a new interval',
        },
      },
    ],
    brute: {
      idea: 'Add intervals one by one; each new one absorbs every merged interval it overlaps.',
      cost: 'O(n²)',
      waste: 'Each insertion scans all results, though after sorting only the last one can overlap.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Sort by start, then sweep, extending the last merged interval or starting a new one. O(n log n).',
      not: [
        { id: 'union-find', why: 'Joining overlapping pairs works, but finding the pairs is the hard part; sorting does it directly.' },
        { id: 'prefix-sums', why: 'A sweep over +1/−1 events also finds covered ranges, with more bookkeeping.' },
      ],
    },
    watch: {
      viz: 'IntervalsViz',
      inputs: [
        { label: '[[1,3],[2,6],[8,10],[15,18]]', input: { mode: 'merge', list: [[1, 3], [2, 6], [8, 10], [15, 18]] } },
        { label: 'unsorted, with a chain', input: { mode: 'merge', list: [[8, 10], [1, 3], [2, 6], [15, 18], [9, 12], [17, 20]] } },
      ],
    },
    edges: [
      'Touching intervals merge: [[1, 4], [4, 5]] → [[1, 5]].',
      'One inside another: [[1, 10], [2, 3]] → [[1, 10]].',
      'A single interval: [[1, 2]] → [[1, 2]].',
    ],
    not: { '0': [], '1': [] },
  },

  'insert-interval': {
    aha: 'The list is already sorted and has no overlaps, so it splits into three runs: intervals that end before the new one, intervals that overlap it (merge them into it), and intervals that start after it.',
    asks: {
      observe: 'Inserting [4, 8] into [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]]: which intervals does it touch?',
      pattern: 'The list is already sorted. Do you need to sort again, or can one pass do it?',
      read: 'What does the statement promise about the existing list, and what does that let you skip?',
      budget: 'The list is already sorted. Can you beat O(n log n), and can you beat O(n)?',
      brute: 'What is the lazy way to reuse Merge Intervals, and what does it throw away?',
      watch: 'Inserting [4, 8]: which intervals will be copied, merged, and copied again?',
    },
    read: [
      { phrase: '`intervals` is sorted by start and its intervals do not overlap', says: 'Already sorted and separate: no sort needed, one pass.' },
      {
        phrase: 'merging it with any intervals it overlaps (touching counts as overlapping)',
        says: 'The new interval may swallow a run of neighbouring intervals.',
      },
      { phrase: 'The list may be empty.', says: 'Then the answer is just [newInterval].' },
    ],
    budget: {
      from: 'intervals.length ≤ 10⁴',
      n: 10000,
      aim: 'O(n)',
      note: 'Appending and re-merging with a sort is O(n log n); the order is already there.',
    },
    observe: [
      {
        title: 'Three runs: before, overlapping, after',
        text: 'Copy the intervals that end before 4; merge the ones that overlap [4, 8]; copy the rest.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['[1,2]', '[3,5]', '[6,7]', '[8,10]', '[12,16]'],
              bands: [{ from: 1, to: 3, tone: 'accent', label: 'overlap [4,8]' }],
              marks: { '0': 'kept', '4': 'kept' },
            },
          ],
        },
      },
      {
        title: 'Merging: smallest start, largest end',
        text: 'While intervals overlap, grow the new interval: start = the smaller start, end = the larger end. [3, 5], [6, 7], [8, 10] and [4, 8] become [3, 10].',
        sketch: { kind: 'array', rows: [{ items: ['[1,2]', '[3,10]', '[12,16]'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Append the new interval, sort everything, and run Merge Intervals.',
      cost: 'O(n log n)',
      waste: 'The list was already sorted and separate; sorting again throws that away.',
    },
    pattern: {
      pick: 'intervals',
      why: 'One sweep in three runs over an already sorted, separate list. O(n).',
      not: [
        { id: 'binary-search', why: 'Binary search finds where the overlap starts, but copying the result is O(n) anyway.' },
        { id: 'sorting-and-selection', why: 'Nothing needs sorting.' },
      ],
    },
    watch: {
      viz: 'IntervalWalkViz',
      inputs: [{ label: 'insert [4, 8]', input: { mode: 'insert', list: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], nw: [[4, 8]] } }],
    },
    edges: [
      'An empty list: [], [5, 7] → [[5, 7]].',
      'Goes last without overlap: [[1, 2]], [3, 4] → [[1, 2], [3, 4]].',
      'Swallows everything: [[1, 2], [3, 4]], [0, 9] → [[0, 9]].',
    ],
    not: { '1': [] },
  },

  'non-overlapping-intervals': {
    aha: 'Removing the fewest is keeping the most. Sort by END time and keep each interval that starts after the last kept one ends: the interval that ends first always leaves the most room for the rest.',
    asks: {
      observe: 'Between [1, 2] and [1, 3], which one leaves more room for later intervals?',
      pattern: 'If you want to keep as many intervals as possible, which one should you keep first?',
      read: 'The question asks how many to remove. What is the same question asked the other way round?',
      budget: 'A longest-chain DP is O(n²). Is that fast enough for 10⁵ intervals?',
      brute: 'What correct method compares chains of intervals, and what does it cost?',
      watch: 'Sorted by end, which interval will be the first one removed?',
    },
    read: [
      { phrase: 'the minimum number of intervals you need to remove', says: 'Removing the fewest = keeping the most non-overlapping intervals.' },
      {
        phrase: 'Intervals that only touch at a point, like `[1,2]` and `[2,3]`, do not overlap',
        says: 'Keep an interval if its start ≥ the last kept end.',
      },
    ],
    budget: { from: 'intervals.length ≤ 10⁵', n: 100000, aim: 'O(n log n)', note: 'A DP over the longest chain is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Keep the interval that ends first',
        text: 'Among the intervals that could come next, the one ending earliest leaves the most room. If a best answer used some other interval there, swapping in the earlier-ending one keeps everything after it valid, so the swap never makes things worse.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'sorted by end', items: ['[1,2]', '[1,3]', '[2,3]', '[3,4]'], marks: { '0': 'hit', '1': 'bad', '2': 'hit', '3': 'hit' } }],
          caption: 'keep three, remove [1, 3]',
        },
      },
      {
        title: 'Sorting by start gives wrong answers',
        text: 'Sorted by start, a long interval like [1, 10] can come first and block many short ones.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['[1,10]', '[2,3]', '[4,5]', '[6,7]'], marks: { '0': 'bad' } }],
          caption: 'keeping [1, 10] would cost three intervals',
        },
      },
    ],
    brute: {
      idea: 'For each interval, find the longest chain of non-overlapping intervals ending with it.',
      cost: 'O(n²)',
      waste: 'The earliest-end choice is always safe, so no alternatives need comparing.',
    },
    pattern: {
      pick: 'intervals',
      why: 'The classic scheduling greedy: sort by end, keep what fits, count the rest as removed. O(n log n).',
      not: [
        { id: 'greedy', why: 'It is a greedy, specifically the interval-scheduling one; sorting by the right key is the whole trick.' },
        { id: 'dp-linear', why: 'The chain DP is correct but O(n²).' },
      ],
    },
    watch: {
      viz: 'IntervalsViz',
      inputs: [
        { label: '[[1,2],[2,3],[3,4],[1,3]]', input: { mode: 'erase', list: [[1, 2], [2, 3], [3, 4], [1, 3]] } },
        { label: 'a longer example', input: { mode: 'erase', list: [[1, 4], [2, 3], [3, 6], [5, 8], [1, 10], [7, 9]] } },
      ],
    },
    edges: [
      'Touching intervals are kept: [[1, 2], [2, 3]] → 0.',
      'All identical: [[1, 2], [1, 2], [1, 2]] → 2.',
      'One long interval over short ones: [[1, 10], [2, 3], [4, 5]] → 1.',
    ],
    not: { '0': [] },
  },

  'minimum-number-of-arrows-to-burst-balloons': {
    aha: 'The balloon that ends first must be hit somewhere before its end; shooting exactly at its end hits every other balloon that has started by then. Sort by end and repeat.',
    asks: {
      observe: 'Sorted by end, the first balloon is [1, 6]. If you shoot at x = 6, which other balloons burst?',
      pattern: 'Where should the first arrow go so that it bursts as many balloons as possible?',
      read: 'Which phrase tells you balloons that only touch can share an arrow?',
      budget: 'Values reach ±2³¹. What goes wrong if your sort comparator subtracts two values?',
      brute: 'What is the simplest correct strategy, and how often does it rescan the balloons?',
      watch: 'Sorted by end, where will the second arrow go?',
    },
    read: [
      {
        phrase: 'bursts every balloon with `start ≤ x ≤ end`',
        says: 'One arrow bursts every balloon containing its position. Ends are included: touching balloons share a point.',
      },
      { phrase: 'the minimum number of arrows', says: 'Cover all intervals with the fewest points: a greedy on end times.' },
    ],
    budget: { from: 'points.length ≤ 10⁵', n: 100000, aim: 'O(n log n)', note: 'Values reach ±2³¹: compare, never subtract, when sorting.' },
    observe: [
      {
        title: 'The balloon that ends first decides the first arrow',
        text: 'Some arrow must hit [1, 6] at or before 6. Shooting exactly at 6 also bursts [2, 8], which has started by then.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['[1,6]', '[2,8]', '[7,12]', '[10,16]'], marks: { '0': 'hit', '1': 'hit', '2': 'target', '3': 'target' } }],
          caption: 'arrow at 6 bursts the first two',
        },
      },
      {
        title: 'A balloon that starts later needs a new arrow',
        text: '[7, 12] starts after 6, so shoot again at its end, 12, which also bursts [10, 16].',
        sketch: {
          kind: 'array',
          rows: [{ items: ['[1,6]', '[2,8]', '[7,12]', '[10,16]'], marks: { '0': 'muted', '1': 'muted', '2': 'hit', '3': 'hit' } }],
          caption: '2 arrows in total',
        },
      },
    ],
    brute: {
      idea: 'Repeatedly find the remaining balloon with the smallest end, shoot there, and remove everything it bursts.',
      cost: 'O(n²)',
      waste: 'Each round rescans all balloons; sorting by end once makes it one sweep.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Sort by end; an arrow at the current end bursts every following balloon that starts at or before it. O(n log n).',
      not: [
        { id: 'greedy', why: 'It is the interval-scheduling greedy in disguise.' },
        { id: 'sorting-and-selection', why: 'Sorting is the setup; the sweep makes the decisions.' },
      ],
    },
    watch: {
      viz: 'IntervalWalkViz',
      inputs: [{ label: '[10, 16], [2, 8], [1, 6], [7, 12]', input: { mode: 'arrows', list: [[10, 16], [2, 8], [1, 6], [7, 12]] } }],
    },
    edges: ['Touching balloons share one arrow: [[1, 2], [2, 3]] → 1.', 'No overlaps: [[1, 2], [3, 4]] → 2.', 'One balloon: [[5, 9]] → 1.'],
    not: { '0': [], '1': [] },
  },

  'interval-list-intersections': {
    aha: 'Walk both sorted lists with one pointer each. The overlap of two intervals is [larger start, smaller end] if that is not empty; then advance whichever interval ends first, because it can\'t meet anything later.',
    asks: {
      observe: '[0, 2] from the first list and [1, 5] from the second: what is their overlap, and which one should you move past?',
      pattern: 'Both lists are sorted. How many pointers do you need, and which one moves each step?',
      read: 'Both lists are sorted and separate, and single points count. What does each fact tell you?',
      budget: 'Both lists have up to 1000 intervals. Every pair passes; what is the linear way?',
      brute: 'What is the simplest correct method, and how many pairs never overlap at all?',
      watch: 'With [[0, 2], [5, 10], [13, 23], [24, 25]] and [[1, 5], [8, 12], [15, 24], [25, 26]], which pointer moves first?',
    },
    read: [
      { phrase: 'Each list is sorted and its intervals are pairwise disjoint', says: 'Two sorted lists: walk them together, like merging.' },
      { phrase: 'Intersections can be single points such as `[5,5]`', says: 'Closed intervals: keep an overlap when larger start ≤ smaller end.' },
    ],
    budget: { from: 'both lists ≤ 1000', n: 2000, aim: 'O(m + n)', note: 'Every pair is 10⁶: fine, but two pointers are linear.' },
    observe: [
      {
        title: 'The overlap is [larger start, smaller end]',
        text: '[0, 2] and [1, 5] overlap in [1, 2]. If the larger start is after the smaller end, they don\'t meet.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'first', items: ['[0,2]'], marks: { '0': 'cur' } },
            { label: 'second', items: ['[1,5]'], marks: { '0': 'cur' } },
            { label: 'overlap', items: ['[1,2]'], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'Advance the one that ends first',
        text: '[0, 2] ends first, so it can\'t meet anything later in the second list (those start even later). Move its pointer.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'first', items: ['[0,2]', '[5,10]', '[13,23]', '[24,25]'], marks: { '0': 'muted', '1': 'cur' } },
            { label: 'second', items: ['[1,5]', '[8,12]', '[15,24]', '[25,26]'], marks: { '0': 'cur' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Intersect every pair and sort the results.',
      cost: 'O(m · n)',
      waste: 'Most pairs are far apart; both lists are sorted, so only neighbouring candidates matter.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Two pointers over two sorted interval lists: record the overlap, advance whichever interval ends first. O(m + n).',
      not: [
        { id: 'two-pointers', why: 'It is two pointers, with an interval rule for which one moves.' },
        { id: 'sorting-and-selection', why: 'Both lists are already sorted.' },
      ],
    },
    watch: {
      viz: 'IntervalWalkViz',
      inputs: [{ label: 'the LeetCode lists', input: { mode: 'inter', A: [[0, 2], [5, 10], [13, 23], [24, 25]], B: [[1, 5], [8, 12], [15, 24], [25, 26]] } }],
    },
    edges: [
      'One list empty: [[1, 3]], [] → [].',
      'Single-point overlap: [[1, 2]], [[2, 3]] → [[2, 2]].',
      'One interval spanning several: [[0, 10]], [[1, 2], [5, 6]] → [[1, 2], [5, 6]].',
    ],
    not: { '0': [], '1': [] },
  },

  'remove-covered-intervals': {
    aha: 'Sort by start (and, for equal starts, longest first). Then any interval that could cover the current one has already been seen, and it covers it exactly when the furthest end seen so far reaches past the current end.',
    asks: {
      observe: 'Sorted: [1, 4], [2, 8], [3, 6]. Is [3, 6] inside any earlier interval?',
      pattern: 'After sorting, what single number tells you whether the current interval is covered?',
      read: 'Which phrase tells you how to break ties when two intervals start at the same point?',
      budget: 'Every pair is 10⁶ and passes. What does sorting let you do instead?',
      brute: 'What is the simplest correct test, and what does it recompute for every interval?',
      watch: 'Sorted, which interval will be the first one found covered?',
    },
    read: [
      { phrase: 'covered by interval `[c, d)` if `c ≤ a` and `b ≤ d`', says: 'Covering needs both ends: start no later and end no earlier.' },
      {
        phrase: 'Sorting by start ascending, and by end descending for equal starts',
        says: 'Then any interval that can cover another comes before it.',
      },
    ],
    budget: { from: 'intervals.length ≤ 1000', n: 1000, aim: 'O(n log n)', note: 'Checking every pair is 10⁶ and passes, but sorting makes it one sweep.' },
    observe: [
      {
        title: 'Sort so the covering intervals come first',
        text: 'With starts in order, an earlier interval already starts no later. For equal starts, put the longer one first so it covers the shorter.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['[1,4]', '[2,8]', '[3,6]'], marks: { '2': 'bad' }, tags: { '2': [['6 ≤ 8', 'danger']] } }],
          caption: '[3, 6] is covered by [2, 8]',
        },
      },
      {
        title: 'Track the furthest end so far',
        text: 'After sorting, every earlier interval starts no later than the current one. So it is covered exactly when one of them also ends no earlier: when the furthest end seen so far is ≥ the current end. One number replaces the whole comparison.',
        sketch: { kind: 'array', rows: [{ label: 'furthest end so far', items: [4, 8, 8], marks: { '2': 'target' } }] },
      },
    ],
    brute: {
      idea: 'For each interval, check whether any other interval covers it.',
      cost: 'O(n²)',
      waste: 'After sorting, only the furthest end seen so far matters.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Sort by start (longest first on ties) and sweep with the furthest end seen: O(n log n).',
      not: [
        { id: 'sorting-and-selection', why: 'The tie-break (longest first) is what makes the sweep correct.' },
        { id: 'greedy', why: 'Nothing is chosen; each interval is just tested against the furthest end.' },
      ],
    },
    watch: {
      viz: 'IntervalWalkViz',
      inputs: [
        { label: '[1, 4], [3, 6], [2, 8]', input: { mode: 'covered', list: [[1, 4], [3, 6], [2, 8]] } },
        { label: 'equal starts: [1, 4], [1, 2]', input: { mode: 'covered', list: [[1, 4], [1, 2]] } },
      ],
    },
    edges: [
      'Equal starts need the tie-break: [[1, 4], [1, 2]] → 1.',
      'A chain of nested intervals: [[1, 10], [2, 9], [3, 8]] → 1.',
      'Nothing covered: [[1, 2], [3, 4]] → 2.',
    ],
    not: { '0': [], '1': [] },
  },

  'meeting-rooms-ii': {
    aha: 'The number of rooms needed is the largest number of meetings happening at the same moment. Sort the start times and the end times separately and walk them together: each start takes a room, each end that comes first frees one.',
    asks: {
      observe: 'In [[0, 30], [5, 10], [15, 20]], how many meetings are running at time 5? At time 16?',
      pattern: 'Does it matter which meeting ends, or only how many meetings are running?',
      read: 'Which sentence tells you what to do when one meeting ends exactly as another starts?',
      budget: 'Counting the running meetings at every start is O(n²). How big is that for 10⁴ meetings?',
      brute: 'What is the simplest correct count, and what does it recount each time?',
      watch: 'For [[0, 30], [5, 10], [15, 20]], at which moment will the room count peak?',
    },
    read: [
      { phrase: 'the minimum number of conference rooms', says: 'The answer is the largest number of meetings running at the same moment.' },
      {
        phrase: 'A room becomes free at a meeting\'s end time and can be reused by a meeting starting at that same moment',
        says: 'At equal times, count the end before the start.',
      },
    ],
    budget: { from: 'intervals.length ≤ 10⁴', n: 10000, aim: 'O(n log n)', note: 'Counting overlaps at every start is O(n²) = 10⁸.' },
    observe: [
      {
        title: 'Rooms needed = the busiest moment',
        text: 'At time 5, [0, 30] and [5, 10] are both running: two rooms.',
        sketch: { kind: 'array', rows: [{ items: ['[0,30]', '[5,10]', '[15,20]'], marks: { '0': 'hit', '1': 'hit' } }], caption: 'two at once' },
      },
      {
        title: 'Only the order of starts and ends matters',
        text: 'Sort starts and ends separately and walk them like a merge: a start takes a room, an end that comes first frees one.',
        sketch: { kind: 'array', rows: [{ label: 'starts', items: [0, 5, 15] }, { label: 'ends', items: [10, 20, 30] }] },
      },
    ],
    brute: {
      idea: 'For each meeting\'s start time, count the meetings in progress.',
      cost: 'O(n²)',
      waste: 'Each count rescans all meetings; a sorted sweep keeps the count as it goes.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Sweep over sorted start and end times (or keep a min-heap of end times) and track rooms in use; the maximum is the answer. O(n log n).',
      not: [
        { id: 'heap-patterns', why: 'A min-heap of end times is the other standard answer; the two-array sweep needs no heap.' },
        { id: 'greedy', why: 'No choices are made; we measure the peak overlap.' },
      ],
    },
    watch: {
      viz: 'MeetingRoomsViz',
      inputs: [
        { label: '[[0,30],[5,10],[15,20]]', input: { list: [[0, 30], [5, 10], [15, 20]] } },
        { label: 'a busier day', input: { list: [[1, 5], [2, 6], [4, 8], [6, 9], [8, 10]] } },
      ],
    },
    edges: ['Back-to-back meetings share a room: [[1, 5], [5, 8]] → 1.', 'All at once: [[1, 4], [2, 5], [3, 6]] → 3.', 'One meeting → 1.'],
    not: { '1': [] },
  },

  'minimum-interval-to-include-each-query': {
    aha: 'Answer the queries in increasing order. Then each interval only needs adding once, when its left end is reached, and a min-heap by size always offers the smallest interval that has started; intervals that already ended are thrown away from the top.',
    asks: {
      observe: 'For query 4, which intervals have started? Which of them still contain 4, and which is smallest?',
      pattern: 'If the queries were in order, could intervals be added once and never re-examined?',
      read: 'Which sentence lets you answer the queries in an order of your choosing?',
      budget: '10⁵ queries times 10⁵ intervals is 10¹⁰. What must each interval be limited to?',
      brute: 'What is the simplest correct answer per query, and what does it repeat?',
      watch: 'Intervals [[1, 4], [2, 4], [3, 6], [4, 4]], queries [2, 3, 4, 5]: when does [4, 4] enter the heap, and when does it leave?',
    },
    read: [
      {
        phrase: 'the size of the smallest interval that contains it',
        says: 'For each query: among intervals with left ≤ q ≤ right, the smallest size. A min-heap by size fits.',
      },
      {
        phrase: 'Return the answers in the order of the queries',
        says: 'We may answer them in any order we like (sorted), as long as we put the answers back.',
      },
    ],
    budget: {
      from: '10⁵ intervals, 10⁵ queries',
      rows: [['scan all intervals per query', '10⁵ × 10⁵ = 10¹⁰', 'bad'], ['sort both + heap', '≈ 4 × 10⁶', 'ok']],
      aim: 'O((n + q) log n)',
      note: 'Answering queries one by one against all intervals is far too slow.',
    },
    observe: [
      {
        title: 'Answer the queries in increasing order',
        text: 'Then intervals can be added once, as their left end is reached, and never added again.',
        sketch: { kind: 'array', rows: [{ label: 'queries in order', items: [2, 3, 4, 5], marks: { '2': 'cur' } }] },
      },
      {
        title: 'A heap by size, dropping finished intervals',
        text: 'Before answering q, push every interval with left ≤ q. Pop tops whose right end is before q: they can\'t contain this or any later query.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'heap at q = 4 (size)', items: ['[4,4] 1', '[2,4] 3', '[1,4] 4', '[3,6] 4'], marks: { '0': 'hit' } }],
          caption: 'the smallest interval containing 4 is [4, 4]',
        },
      },
    ],
    brute: {
      idea: 'For each query, look at every interval containing it and keep the smallest.',
      cost: 'O(q · n)',
      waste: 'Intervals are re-examined for every query; processing queries in order lets each interval enter and leave the heap once.',
    },
    pattern: {
      pick: 'intervals',
      why: 'Sort intervals by left end and queries by value; a min-heap by size holds the intervals that have started, with finished ones dropped. O((n + q) log n).',
      not: [
        { id: 'heap-patterns', why: 'The heap is the tool, but the sorted sweep over both lists is what makes it work.' },
        { id: 'binary-search', why: 'Binary search can find intervals starting before q, but not the smallest one still covering it.' },
      ],
    },
    watch: {
      viz: 'IntervalWalkViz',
      inputs: [{ label: '[1, 4], [2, 4], [3, 6], [4, 4]; 2, 3, 4, 5', input: { mode: 'queries', list: [[1, 4], [2, 4], [3, 6], [4, 4]], qs: [2, 3, 4, 5] } }],
    },
    edges: [
      'A query no interval contains: [[1, 2]], [5] → [−1].',
      'Duplicate queries: [[1, 3]], [2, 2] → [3, 3].',
      'The answers go back in the original query order: [[1, 4], [3, 3]], [3, 1] → [1, 4].',
    ],
    not: { '0': [], '1': [] },
  },

  'meeting-rooms-iii': {
    aha: 'Process the meetings in start order. Keep the free rooms in a heap by number (so "the lowest free room" is on top) and the busy rooms in a heap by end time. If no room is free, the meeting takes the room that frees first and is pushed back in time.',
    asks: {
      observe: 'With 2 rooms busy until 10 and 5, the meeting [2, 7] arrives. When and where can it run?',
      pattern: 'You repeatedly need "the lowest free room" and "the room that frees first". What gives each in one step?',
      read: 'Three phrases set the rules: room numbers, delayed meetings, and the answer. What does each one require?',
      budget: 'Scanning 100 rooms per meeting passes here. What would scale to many rooms?',
      brute: 'What is the simplest correct simulation, and what does it rescan per meeting?',
      watch: 'With 2 rooms and meetings [[0, 10], [1, 5], [2, 7], [3, 4]], which room gets the last meeting?',
    },
    read: [
      {
        phrase: 'There are `n` rooms numbered `0` to `n − 1`',
        says: 'Rooms are chosen by number: we need "the lowest free room" quickly, a min-heap.',
      },
      { phrase: 'and keeps its original duration', says: 'A delayed meeting ends at (the room\'s free time + its duration).' },
      {
        phrase: 'Return the number of the room that held the most meetings',
        says: 'Count meetings per room while simulating; ties go to the lowest number.',
      },
    ],
    budget: {
      from: 'n ≤ 100 rooms, 10⁵ meetings',
      rows: [['scan all rooms per meeting', '10⁵ × 100 = 10⁷', 'ok'], ['two heaps', '10⁵ × log 100', 'ok']],
      aim: 'O(m log m + m log n)',
      note: 'Both pass here; the heaps scale to many rooms.',
    },
    observe: [
      {
        title: 'Free the rooms that have finished first',
        text: 'Before placing a meeting, move every busy room whose meeting has ended by now back to the free heap.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'busy (end, room)', items: ['(5, 1)', '(10, 0)'], marks: { '0': 'cur' } }],
          caption: 'at time 2, nobody has finished yet',
        },
      },
      {
        title: 'No free room? Wait for the first one',
        text: 'The meeting [2, 7] takes room 1, which frees at 5, and runs from 5 to 10 (same 5-unit duration).',
        sketch: { kind: 'array', rows: [{ label: 'busy (end, room)', items: ['(10, 0)', '(10, 1)'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each meeting, scan all rooms for the lowest free one, or the one that frees earliest.',
      cost: 'O(m · n)',
      waste: 'Each meeting rescans every room; heaps keep both answers on top.',
    },
    pattern: {
      pick: 'intervals',
      why: 'A simulation over meetings in start order with two heaps (free rooms by number, busy rooms by end time). O(m log m + m log n).',
      not: [
        { id: 'heap-patterns', why: 'The heaps are the data structure; the sweep in start order drives them.' },
        { id: 'greedy', why: 'The rules are fixed by the statement; we simulate them efficiently rather than choose.' },
      ],
    },
    watch: { viz: 'IntervalWalkViz', inputs: [{ label: '2 rooms, 4 meetings', input: { mode: 'rooms3', n: 2, list: [[0, 10], [1, 5], [2, 7], [3, 4]] } }] },
    edges: [
      'More rooms than meetings: n 3, [[0, 1], [1, 2]] → 0.',
      'One room takes everything: n 1, [[0, 5], [1, 2]] → 0.',
      'Delays pile up: 1 room, 10⁵ meetings each 5 × 10⁵ long → end times reach 5 × 10¹⁰, so keep times in long.',
    ],
    not: { '0': [], '1': [] },
  },
};
