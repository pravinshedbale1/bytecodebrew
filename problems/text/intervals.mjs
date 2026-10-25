export default {
  'merge-intervals': {
    statement: `Each \`intervals[i] = [start, end]\` is a closed interval. Merge every group of overlapping intervals into one and return the resulting non-overlapping intervals sorted by start.

Intervals that only touch, like \`[1,4]\` and \`[4,5]\`, overlap and are merged.`,
    constraints: ['1 <= intervals.length <= 1e4', '0 <= intervals[i][j] <= 2e6', '`start ≤ end` for every interval'],
    hints: [
      'After sorting by start, every interval that overlaps the current group comes right after it.',
      'Keep the last merged interval. If the next interval starts at or before its end, extend the end to the larger of the two ends.',
      'Otherwise close the group and start a new one. Sorting dominates: O(n log n).',
    ],
  },
  'insert-interval': {
    statement: `\`intervals\` is sorted by start and its intervals do not overlap. Insert \`newInterval\`, merging it with any intervals it overlaps (touching counts as overlapping), and return the result, still sorted and non-overlapping.

The list may be empty.`,
    constraints: ['0 <= intervals.length <= 1e4', '0 <= intervals[i][j] <= 1e5', '0 <= newInterval[i] <= 1e5', 'intervals is sorted by start and non-overlapping'],
    hints: [
      'The intervals fall into three runs: those entirely before newInterval, those overlapping it, and those entirely after it.',
      'Copy the "before" run (end < new start) as it is.',
      'Merge every overlapping interval into newInterval by taking the minimum start and maximum end, add the merged interval, then copy the rest. O(n).',
    ],
  },
  'non-overlapping-intervals': {
    statement: `Return the minimum number of intervals you need to remove from \`intervals\` so that the remaining intervals do not overlap.

Intervals that only touch at a point, like \`[1,2]\` and \`[2,3]\`, do not overlap.`,
    constraints: ['1 <= intervals.length <= 1e5', '-1e5 <= intervals[i][j] <= 1e5', '`start < end` for every interval'],
    hints: [
      'Flip it: keep as many intervals as possible; the rest must be removed.',
      'Greedy, like activity selection: among intervals that fit, keep the one that ends earliest, because it leaves the most room for the rest.',
      'Sort by end. Keep an interval if its start ≥ the end of the last kept one; otherwise count it as removed.',
    ],
  },
  'minimum-number-of-arrows-to-burst-balloons': {
    statement: `Each balloon is a horizontal segment \`[start, end]\` on the x-axis. An arrow shot straight up at position \`x\` bursts every balloon with \`start ≤ x ≤ end\`.

Return the minimum number of arrows needed to burst every balloon.`,
    constraints: ['1 <= points.length <= 1e5', '-2^31 <= points[i][j] <= 2^31 - 1', '`start ≤ end` for every balloon'],
    hints: [
      'Shooting at the end of the balloon that ends first bursts as many others as possible.',
      'Sort by end. Shoot at the first end, skip every balloon that starts at or before that position, and shoot again at the next one\'s end.',
      'Values reach ±2³¹, so compare with Integer.compare in the comparator: a − b overflows.',
    ],
  },
  'interval-list-intersections': {
    statement: `\`firstList\` and \`secondList\` are lists of closed intervals. Each list is sorted and its intervals are pairwise disjoint.

Return the intersections of the two lists: every interval where some interval of the first list overlaps some interval of the second, in sorted order. Intersections can be single points such as \`[5,5]\`.`,
    constraints: ['0 <= firstList.length, secondList.length <= 1000', '0 <= firstList[i][j], secondList[i][j] <= 1e9', 'Each list is sorted and pairwise disjoint'],
    hints: [
      'Walk both lists with two pointers, like merging.',
      'Two intervals overlap on [max(starts), min(ends)] when that start ≤ that end.',
      'Then advance the pointer whose interval ends first: it cannot overlap anything further in the other list.',
    ],
  },
  'remove-covered-intervals': {
    statement: `Interval \`[a, b)\` is covered by interval \`[c, d)\` if \`c ≤ a\` and \`b ≤ d\`. Remove every interval covered by another interval in the list and return how many remain.

All intervals are distinct.`,
    constraints: ['1 <= intervals.length <= 1000', '0 <= intervals[i][j] <= 1e5', '`start < end` for every interval', 'All intervals are distinct'],
    hints: [
      'Sort so that any interval that could cover another comes before it.',
      'Sort by start ascending and, for equal starts, by end descending. Then an interval is covered exactly when its end ≤ the largest end seen so far.',
      'Count the intervals that extend past the running maximum end.',
    ],
  },
  'minimum-interval-to-include-each-query': {
    statement: `Each \`intervals[i] = [left, right]\` has size \`right − left + 1\`. For each \`queries[j]\`, return the size of the smallest interval that contains it (\`left ≤ q ≤ right\`), or \`-1\` if no interval contains it.

Return the answers in the order of the queries.`,
    constraints: ['1 <= intervals.length <= 1e5', '1 <= queries.length <= 1e5', '1 <= intervals[i][j] <= 2e7', '1 <= queries[i] <= 1e7'],
    hints: [
      'Checking every interval for every query is O(n·q). Answer the queries in sorted order instead.',
      'Sort the intervals by left and the queries by value (remembering their original positions). Sweep: push every interval with left ≤ q into a min-heap ordered by size.',
      'Pop intervals from the top of the heap whose right < q; they can never help a later query. The top, if any, is the answer for q.',
    ],
  },
  'meeting-rooms': {
    statement: `\`intervals[i] = [start_i, end_i]\` is the time of meeting \`i\`. Return \`true\` if a single person could attend **all** of the meetings, that is, if no two meetings overlap.

A meeting that ends at time \`t\` does not overlap one that starts at time \`t\`.`,
    constraints: ['0 <= intervals.length <= 1e4', 'intervals[i].length == 2', '0 <= intervals[i][j] <= 1e6', '`start_i < end_i`'],
    hints: [
      'Comparing every pair of meetings works in O(n²).',
      'After sorting by start time, any overlap must show up between two meetings that are next to each other.',
      'Sort by start and check that each meeting starts no earlier than the previous one ends.',
    ],
  },
  'meeting-rooms-ii': {
    statement: `\`intervals[i] = [start_i, end_i]\` is the time of meeting \`i\`. Return the minimum number of conference rooms needed to hold all the meetings.

A room becomes free at a meeting's end time and can be reused by a meeting starting at that same moment.`,
    constraints: ['1 <= intervals.length <= 1e4', 'intervals[i].length == 2', '0 <= intervals[i][j] <= 1e6', '`start_i < end_i`'],
    hints: [
      'The answer is the largest number of meetings happening at the same moment.',
      'Process meetings by start time and keep a min-heap of end times of rooms in use. Before placing a meeting, free every room whose end time is at most its start.',
      'Or sweep: sort all starts and all ends separately and walk through them in order, adding a room at each start and releasing one at each end (ends first on ties).',
    ],
  },
  'meeting-rooms-iii': {
    statement: `There are \`n\` rooms numbered \`0\` to \`n − 1\`. \`meetings[i] = [start_i, end_i]\` is a meeting during the half-open time \`[start_i, end_i)\`; all start times are **unique**. Meetings are allocated as follows:

1. each meeting takes the **unused room with the lowest number**;
2. if no room is free, the meeting is **delayed** until a room frees up, and keeps its original duration;
3. when a room frees up, meetings with an **earlier original start** get it first.

Return the number of the room that held the most meetings. If several rooms tie, return the lowest number.`,
    constraints: ['1 <= n <= 100', '1 <= meetings.length <= 1e5', 'meetings[i].length == 2', '0 <= meetings[i][j] <= 5e5', '`start_i < end_i`', 'All start times are unique'],
    hints: [
      'Process meetings in order of start time. Delays never reorder them, because a waiting meeting always started earlier than later ones.',
      'Keep two min-heaps: free room numbers, and busy rooms keyed by (end time, room number). Before each meeting, move every room that has finished into the free heap.',
      'If nothing is free, take the busy room that frees first (lowest number on ties) and start the meeting at that time. Use 64-bit times: repeated delays can push end times past 2³¹.',
    ],
  },
};
