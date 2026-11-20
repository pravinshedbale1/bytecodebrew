/** Practice thinking walkthroughs: intervals (format: src/data/think/index.js). */
export default {
  'meeting-rooms': {
    free: true,
    read: [
      { phrase: 'if no two meetings overlap', says: 'A pairwise condition, but after sorting by start only neighbours can clash.' },
      { phrase: 'A meeting that ends at time `t` does not overlap one that starts at time `t`', says: 'Touching is fine: clash only when next.start < previous.end (strictly).' },
    ],
    budget: { from: 'intervals.length ≤ 10⁴', n: 1e4, aim: 'O(n log n)', note: 'Every pair is 5 × 10⁷: it passes, but sorting makes it one comparison per meeting.' },
    observe: [
      {
        title: 'After sorting by start, only neighbours can clash',
        text: 'If a meeting overlaps any earlier one, it overlaps the one just before it in start order (or that one already clashed).',
        sketch: { kind: 'array', rows: [{ items: ['[0,30]', '[5,10]', '[15,20]'], marks: { 0: 'target', 1: 'bad' }, tags: { 1: [['5 < 30', 'danger']] } }] },
      },
      {
        title: 'Touching doesn\'t count',
        text: '[1, 5] and [5, 8] are fine: one ends exactly when the next starts.',
      },
    ],
    brute: { idea: 'Check every pair of meetings for overlap.', cost: 'O(n²)', waste: 'Most pairs are far apart in time; sorting brings the only candidates next to each other.' },
    pattern: {
      pick: 'intervals',
      why: 'Sort by start and sweep: a clash is any meeting that starts before the previous one ends. O(n log n).',
      not: [
        { id: 'heap-patterns', why: 'A heap of end times counts rooms (Meeting Rooms II); one person only needs a yes/no.' },
        { id: 'greedy', why: 'There is no choice to make; we just check the schedule.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sort by start', text: '[0, 30], [5, 10], [15, 20].' },
        { title: '[5, 10] starts at 5, before 30', text: 'It overlaps [0, 30]: false.', sketch: { kind: 'array', rows: [{ items: ['[0,30]', '[5,10]', '[15,20]'], marks: { 1: 'bad' } }] } },
      ],
    },
    edges: ['No meetings → true.', 'Back-to-back meetings ([1,5], [5,8]) → true.', 'Unsorted input.'],
  },

  'merge-intervals': {
    read: [
      { phrase: 'Merge every group of overlapping intervals into one', says: 'Overlaps chain: [1,3], [2,6] and [5,8] all become one.' },
      { phrase: 'sorted by start', says: 'The output order hints at the method: sort by start first.' },
      { phrase: 'Intervals that only touch, like `[1,4]` and `[4,5]`, overlap and are merged', says: 'Merge when next.start ≤ current end (not <).' },
    ],
    budget: { from: 'intervals.length ≤ 10⁴', n: 1e4, aim: 'O(n log n)', note: 'Absorbing intervals one by one against all results is O(n²).' },
    observe: [
      {
        title: 'Sorting puts overlapping intervals next to each other',
        text: 'After sorting by start, each interval either extends the group being built or starts a new one.',
        sketch: { kind: 'array', rows: [{ items: ['[1,3]', '[2,6]', '[8,10]', '[15,18]'], marks: { 0: 'kept', 1: 'kept' }, bands: [{ from: 0, to: 1, tone: 'success', label: '[1,6]' }] }] },
      },
      {
        title: 'Only the last merged interval can grow',
        text: 'Compare the next start with the last merged end: overlap → extend the end to the max; otherwise append.',
      },
    ],
    brute: { idea: 'Add intervals one by one; each new one absorbs every result interval it overlaps.', cost: 'O(n²)', waste: 'Each insertion scans all results, though after sorting only the last one can overlap.' },
    pattern: {
      pick: 'intervals',
      why: 'Sort by start, then sweep, extending the last merged interval or starting a new one. O(n log n).',
      not: [
        { id: 'union-find', why: 'Unioning overlapping pairs works, but finding the pairs is the hard part; sorting does it directly.' },
        { id: 'prefix-sums', why: 'A sweep over +1/−1 events also finds covered ranges, with more bookkeeping.' },
      ],
    },
    watch: { viz: 'IntervalsViz', inputs: [{ label: '[[1,3],[2,6],[8,10],[15,18]]', input: { mode: 'merge', list: [[1, 3], [2, 6], [8, 10], [15, 18]] } }, { label: 'unsorted, with a chain', input: { mode: 'merge', list: [[8, 10], [1, 3], [2, 6], [15, 18], [9, 12], [17, 20]] } }] },
    edges: ['Touching intervals merge.', 'One interval inside another: [1, 10], [2, 3].', 'A single interval.'],
  },

  'insert-interval': {
    read: [
      { phrase: '`intervals` is sorted by start and its intervals do not overlap', says: 'Already sorted and disjoint: no sort needed, one linear pass.' },
      { phrase: 'merging it with any intervals it overlaps (touching counts as overlapping)', says: 'The new interval may swallow a run of consecutive intervals.' },
      { phrase: 'The list may be empty.', says: 'Then the answer is just [newInterval].' },
    ],
    budget: { from: 'intervals.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'Appending and re-merging with a sort is O(n log n); the order is already there.' },
    observe: [
      {
        title: 'Three phases: before, overlapping, after',
        text: 'Intervals ending before the new one starts are copied; the ones overlapping it are merged into it; the rest are copied after.',
        sketch: { kind: 'array', rows: [{ items: ['[1,2]', '[3,5]', '[6,7]', '[8,10]', '[12,16]'], bands: [{ from: 1, to: 3, tone: 'accent', label: 'overlap [4,8]' }], marks: { 0: 'kept', 4: 'kept' } }], caption: 'new [4, 8] merges into [3, 10]' },
      },
      {
        title: 'Merging is min of starts, max of ends',
        text: 'While intervals overlap, grow the new interval: start = min, end = max.',
      },
    ],
    brute: { idea: 'Append the new interval, sort everything, and run Merge Intervals.', cost: 'O(n log n)', waste: 'The list was already sorted and disjoint; sorting again throws that away.' },
    pattern: {
      pick: 'intervals',
      why: 'A single sweep in three phases over an already-sorted, disjoint list. O(n).',
      not: [
        { id: 'binary-search', why: 'Binary search finds where the overlap starts, but copying the result is O(n) anyway.' },
        { id: 'sorting-and-selection', why: 'Nothing needs sorting.' },
      ],
    },
    watch: {
      frames: [
        { title: '[1, 3] overlaps [2, 5]', text: 'Merge: the new interval becomes [1, 5].' },
        { title: '[6, 9] starts after 5', text: 'Emit [1, 5], then copy [6, 9]. Result: [[1, 5], [6, 9]].', sketch: { kind: 'array', rows: [{ items: ['[1,5]', '[6,9]'], marks: { 0: 'hit' } }] } },
      ],
    },
    edges: ['An empty list.', 'The new interval goes first or last without overlaps.', 'It swallows every interval.'],
  },

  'non-overlapping-intervals': {
    read: [
      { phrase: 'the minimum number of intervals you need to remove', says: 'Removing the fewest = keeping the most non-overlapping intervals.' },
      { phrase: 'Intervals that only touch at a point, like `[1,2]` and `[2,3]`, do not overlap', says: 'Keep an interval if its start ≥ the last kept end.' },
    ],
    budget: { from: 'intervals.length ≤ 10⁵', n: 1e5, aim: 'O(n log n)', note: 'A DP over the longest chain is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Keep the interval that ends first',
        text: 'Among the intervals that could come next, the one ending earliest leaves the most room for the rest. Swapping any other choice for it never makes things worse.',
        sketch: { kind: 'array', rows: [{ items: ['[1,2]', '[1,3]', '[2,3]', '[3,4]'], marks: { 0: 'hit', 2: 'hit', 3: 'hit', 1: 'bad' } }], caption: 'sorted by end: keep 3, remove [1, 3]' },
      },
      {
        title: 'Sort by end, then sweep',
        text: 'Keep an interval if it starts at or after the last kept end; otherwise remove it.',
      },
    ],
    brute: { idea: 'DP: for each interval, the longest chain of non-overlapping intervals ending with it.', cost: 'O(n²)', waste: 'The greedy choice (earliest end) is always safe, so no alternatives need comparing.' },
    pattern: {
      pick: 'intervals',
      why: 'Classic activity selection: sort by end, keep greedily, count the rest as removed. O(n log n).',
      not: [
        { id: 'greedy', why: 'It is a greedy, specifically the interval-scheduling one; sorting by the right key is the whole trick.' },
        { id: 'dp-linear', why: 'The chain DP is correct but O(n²).' },
      ],
    },
    watch: { viz: 'IntervalsViz', inputs: [{ label: '[[1,2],[2,3],[3,4],[1,3]]', input: { mode: 'erase', list: [[1, 2], [2, 3], [3, 4], [1, 3]] } }, { label: 'a longer example', input: { mode: 'erase', list: [[1, 4], [2, 3], [3, 6], [5, 8], [1, 10], [7, 9]] } }] },
    edges: ['Touching intervals are not removed.', 'All intervals identical → remove n − 1.', 'Sorting by start instead of end gives wrong answers.'],
  },

  'minimum-number-of-arrows-to-burst-balloons': {
    read: [
      { phrase: 'bursts every balloon with `start ≤ x ≤ end`', says: 'One arrow covers every balloon containing its point. Closed ends: touching balloons share a point.' },
      { phrase: 'the minimum number of arrows', says: 'Cover all intervals with the fewest points: a greedy on ends.' },
    ],
    budget: { from: 'points.length ≤ 10⁵', n: 1e5, aim: 'O(n log n)', note: 'Values reach ±2³¹: compare, never subtract, when sorting.' },
    observe: [
      {
        title: 'The balloon that ends first decides the first arrow',
        text: 'Some arrow must hit it at or before its end. Shooting exactly at its end hits as many other balloons as possible.',
        sketch: { kind: 'array', rows: [{ items: ['[1,6]', '[2,8]', '[7,12]', '[10,16]'], marks: { 0: 'hit', 1: 'hit', 2: 'target', 3: 'target' } }], caption: 'arrow at 6 bursts [1,6] and [2,8]; arrow at 12 the rest' },
      },
      {
        title: 'Sort by end and sweep',
        text: 'A balloon starting after the current arrow needs a new arrow, placed at its end.',
      },
    ],
    brute: { idea: 'Repeatedly find the remaining balloon with the smallest end, shoot there, and remove everything it bursts.', cost: 'O(n²)', waste: 'Each round rescans all balloons; sorting by end once makes it one sweep.' },
    pattern: {
      pick: 'intervals',
      why: 'Sort by end; an arrow at the current end bursts every following balloon that starts at or before it. O(n log n).',
      not: [
        { id: 'greedy', why: 'It is the interval-scheduling greedy in disguise.' },
        { id: 'sorting-and-selection', why: 'Sorting is the setup; the sweep makes the decisions.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sorted by end: [1,6], [2,8], [7,12], [10,16]', text: 'First arrow at 6.' },
        { title: '[2, 8] starts at 2 ≤ 6', text: 'Already burst.' },
        { title: '[7, 12] starts after 6', text: 'New arrow at 12, which also bursts [10, 16]. Total: 2.' },
      ],
    },
    edges: ['Touching balloons share one arrow.', 'Values near ±2³¹ (avoid a − b comparators).', 'One balloon.'],
  },

  'interval-list-intersections': {
    read: [
      { phrase: 'Each list is sorted and its intervals are pairwise disjoint', says: 'Two sorted lists: walk them together, like merging.' },
      { phrase: 'Intersections can be single points such as `[5,5]`', says: 'Closed intervals: keep an intersection when max(starts) ≤ min(ends).' },
    ],
    budget: { from: 'both lists ≤ 1000', n: 2000, aim: 'O(m + n)', note: 'Every pair is 10⁶: fine, but two pointers are linear.' },
    observe: [
      {
        title: 'Two intervals intersect in [max start, min end]',
        text: '[0, 2] and [1, 5] intersect in [1, 2]. If max start > min end, they don\'t meet.',
      },
      {
        title: 'Advance the one that ends first',
        text: 'The interval ending first can\'t meet anything later in the other list (those start even later). Move its pointer.',
        sketch: { kind: 'array', rows: [{ label: 'first', items: ['[0,2]', '[5,10]', '[13,23]', '[24,25]'], marks: { 0: 'cur' } }, { label: 'second', items: ['[1,5]', '[8,12]', '[15,24]', '[25,26]'], marks: { 0: 'cur' } }], caption: '[0, 2] ends first: record [1, 2], move it' },
      },
    ],
    brute: { idea: 'Intersect every pair and sort the results.', cost: 'O(m · n)', waste: 'Most pairs are far apart; both lists are sorted, so only neighbouring candidates matter.' },
    pattern: {
      pick: 'intervals',
      why: 'Two pointers over two sorted interval lists: record the overlap, advance whichever ends first. O(m + n).',
      not: [
        { id: 'two-pointers', why: 'It is two pointers, with an interval rule for which one moves.' },
        { id: 'sorting-and-selection', why: 'Both lists are already sorted.' },
      ],
    },
    watch: {
      frames: [
        { title: '[0,2] & [1,5] → [1,2]', text: '[0, 2] ends first: advance the first list.' },
        { title: '[5,10] & [1,5] → [5,5]', text: 'A single point. [1, 5] ends first: advance the second list.' },
        { title: '… [8,10], [15,23], [24,24], [25,25]', text: 'Six intersections in total.' },
      ],
    },
    edges: ['One list empty → [].', 'Single-point intersections.', 'One interval spanning several in the other list.'],
  },

  'remove-covered-intervals': {
    read: [
      { phrase: 'covered by interval `[c, d)` if `c ≤ a` and `b ≤ d`', says: 'Covering needs both ends: start no later and end no earlier.' },
      { phrase: 'Sorting by start ascending, and by end descending for equal starts', says: 'Then any interval that can cover another comes before it.' },
    ],
    budget: { from: 'intervals.length ≤ 1000', n: 1000, aim: 'O(n log n)', note: 'Checking every pair is 10⁶ and passes, but sorting makes it one sweep.' },
    observe: [
      {
        title: 'Sort so coverers come first',
        text: 'With starts ascending, an earlier interval already starts no later. For equal starts, longer first, so it covers the shorter.',
        sketch: { kind: 'array', rows: [{ items: ['[1,4]', '[2,8]', '[3,6]'], marks: { 2: 'bad' }, tags: { 2: [['6 ≤ 8', 'danger']] } }], caption: '[3, 6] is covered by [2, 8]' },
      },
      {
        title: 'Track the furthest end so far',
        text: 'An interval is covered exactly when its end ≤ the largest end seen before it.',
      },
    ],
    brute: { idea: 'For each interval, check whether any other interval covers it.', cost: 'O(n²)', waste: 'After sorting, only the furthest end seen so far matters.' },
    pattern: {
      pick: 'intervals',
      why: 'Sort by (start ↑, end ↓) and sweep with the maximum end: O(n log n).',
      not: [
        { id: 'sorting-and-selection', why: 'The tie-break (end descending) is what makes the sweep correct.' },
        { id: 'greedy', why: 'Nothing is chosen; each interval is just tested against the furthest end.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Sorted: [1,4], [2,8], [3,6]', text: 'maxEnd starts at 4.' },
        { title: '[2, 8]: end 8 > 4', text: 'Not covered. maxEnd = 8.' },
        { title: '[3, 6]: end 6 ≤ 8', text: 'Covered by [2, 8]. Remaining: 2.' },
      ],
    },
    edges: ['Equal starts: [1, 4] and [1, 2] (the tie-break matters).', 'Nested chains.', 'No interval covers another.'],
  },

  'meeting-rooms-ii': {
    read: [
      { phrase: 'the minimum number of conference rooms', says: 'The answer is the largest number of meetings happening at the same moment.' },
      { phrase: 'A room becomes free at a meeting\'s end time and can be reused by a meeting starting at that same moment', says: 'At equal times, process the end before the start.' },
    ],
    budget: { from: 'intervals.length ≤ 10⁴', n: 1e4, aim: 'O(n log n)', note: 'Counting overlaps at every start is O(n²) = 10⁸.' },
    observe: [
      {
        title: 'Rooms needed = the busiest moment',
        text: 'At time 5, meetings [0, 30] and [5, 10] are both running: two rooms.',
        sketch: { kind: 'array', rows: [{ items: ['[0,30]', '[5,10]', '[15,20]'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'Only the order of starts and ends matters',
        text: 'Sort starts and ends separately. Walk them like a merge: a start takes a room, an end that comes first frees one.',
      },
    ],
    brute: { idea: 'For each meeting\'s start time, count the meetings in progress.', cost: 'O(n²)', waste: 'Each count rescans all meetings; a sorted sweep keeps the count as it goes.' },
    pattern: {
      pick: 'intervals',
      why: 'A sweep over sorted start and end events (or a min-heap of end times) tracks the rooms in use; the maximum is the answer. O(n log n).',
      not: [
        { id: 'heap-patterns', why: 'A min-heap of end times is the other standard answer; the two-array sweep needs no heap.' },
        { id: 'greedy', why: 'No choices are made; we measure the peak overlap.' },
      ],
    },
    watch: { viz: 'MeetingRoomsViz', inputs: [{ label: '[[0,30],[5,10],[15,20]]', input: { list: [[0, 30], [5, 10], [15, 20]] } }, { label: 'busier day', input: { list: [[1, 5], [2, 6], [4, 8], [6, 9], [8, 10]] } }] },
    edges: ['Back-to-back meetings share a room.', 'All meetings at once → n rooms.', 'One meeting.'],
  },

  'minimum-interval-to-include-each-query': {
    read: [
      { phrase: 'the size of the smallest interval that contains it', says: 'For each query: among intervals with left ≤ q ≤ right, the minimum size. A min-heap by size fits.' },
      { phrase: 'Return the answers in the order of the queries', says: 'We may answer them in any order we like (sorted), as long as we put the answers back.' },
    ],
    budget: { from: '10⁵ intervals, 10⁵ queries', rows: [['scan all intervals per query', '10⁵ × 10⁵ = 10¹⁰', 'bad'], ['sort both + heap', '≈ 4 × 10⁶', 'ok']], aim: 'O((n + q) log n)', note: 'Answering queries one by one against all intervals is far too slow.' },
    observe: [
      {
        title: 'Answer queries in increasing order',
        text: 'Then intervals can be added once, as their left end is reached, and never re-added.',
      },
      {
        title: 'Heap by size, drop the ones that ended',
        text: 'Before answering q, push every interval with left ≤ q (keyed by size). Pop tops whose right < q: they can\'t contain this or any later query.',
        sketch: { kind: 'array', rows: [{ label: 'heap at q = 4', items: ['4,4 (1)', '2,4 (3)', '1,4 (4)', '3,6 (4)'], marks: { 0: 'hit' } }], caption: 'the smallest containing interval for 4 is [4, 4], size 1' },
      },
    ],
    brute: { idea: 'For each query, look at every interval containing it and keep the smallest.', cost: 'O(q · n)', waste: 'Intervals are re-examined for every query; processing queries in order lets each interval enter and leave the heap once.' },
    pattern: {
      pick: 'intervals',
      why: 'Offline sweep: sort intervals by left and queries by value; a min-heap by size holds the intervals that have started, with expired ones dropped. O((n + q) log n).',
      not: [
        { id: 'heap-patterns', why: 'The heap is the tool, but the sorted sweep over both lists is what makes it work.' },
        { id: 'binary-search', why: 'Binary search can find intervals starting before q, but not the smallest one still covering it.' },
      ],
    },
    watch: {
      frames: [
        { title: 'q = 2: push [1,4], [2,4]', text: 'Smallest containing: [2, 4], size 3.' },
        { title: 'q = 3: push [3,6]', text: 'Smallest is still size 3.' },
        { title: 'q = 4: push [4,4]', text: 'Size 1. q = 5: pop [4,4], [2,4], [1,4] (they ended); [3, 6] gives 4. Answers [3, 3, 1, 4].' },
      ],
    },
    edges: ['A query no interval contains → −1.', 'Duplicate queries.', 'Restore the original query order.'],
  },

  'meeting-rooms-iii': {
    read: [
      { phrase: 'There are `n` rooms numbered `0` to `n − 1`', says: 'Rooms are chosen by number: we need "the lowest free room" quickly, a min-heap.' },
      { phrase: 'and keeps its original duration', says: 'A delayed meeting ends at (room\'s free time + duration).' },
      { phrase: 'Return the number of the room that held the most meetings', says: 'Count meetings per room while simulating; ties go to the lowest number.' },
    ],
    budget: { from: 'n ≤ 100 rooms, 10⁵ meetings', rows: [['scan all rooms per meeting', '10⁵ × 100 = 10⁷', 'ok'], ['two heaps', '10⁵ × log 100', 'ok']], aim: 'O(m log m + m log n)', note: 'Both pass here; the heaps scale to many rooms.' },
    observe: [
      {
        title: 'Process meetings by start time',
        text: 'Before placing a meeting, release every busy room that has finished by its start.',
      },
      {
        title: 'Two heaps',
        text: 'Free rooms by number (lowest first). Busy rooms by (end time, number): if no room is free, the meeting takes the busy room that frees first and is delayed.',
        sketch: { kind: 'array', rows: [{ label: 'busy (end, room)', items: ['(5, 1)', '(10, 0)'], marks: { 0: 'cur' } }], caption: 'the meeting at 2 waits for room 1 at time 5' },
      },
    ],
    brute: { idea: 'For each meeting, scan all rooms for the lowest free one, or the one that frees earliest.', cost: 'O(m · n)', waste: 'Each meeting rescans every room; heaps keep both choices on top.' },
    pattern: {
      pick: 'intervals',
      why: 'An event simulation over sorted meetings with two heaps (free rooms, busy rooms by end time). O(m log m + m log n).',
      not: [
        { id: 'heap-patterns', why: 'The heaps are the data structure; the interval sweep in start order drives them.' },
        { id: 'greedy', why: 'The rules are fixed by the statement; we simulate them efficiently rather than choose.' },
      ],
    },
    watch: {
      frames: [
        { title: '[0,10] → room 0, [1,5] → room 1', text: 'Both rooms busy.' },
        { title: '[2,7]: no room free', text: 'Room 1 frees first (at 5): the meeting runs 5 to 10 in room 1.' },
        { title: '[3,4]: no room free', text: 'Rooms 0 and 1 both free at 10; the lower number wins: room 0, 10 to 11. Room 0 held 2 meetings, room 1 held 2: answer 0.' },
      ],
    },
    edges: ['More rooms than meetings.', 'Ties in end time go to the lower room number.', 'Long delays: end times can exceed the input range (use long).'],
  },
};
