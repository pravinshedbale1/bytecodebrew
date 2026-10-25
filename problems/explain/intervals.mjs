export default {
  'merge-intervals': {
    explain: '`[1,3]` and `[2,6]` overlap, so they merge into `[1,6]`. `[8,10]` and `[15,18]` don\'t touch anything else and stay as they are: `[[1,6],[8,10],[15,18]]`.',
  },
  'insert-interval': {
    explain: '`[2,5]` overlaps `[1,3]`, so the two merge into `[1,5]`. It doesn\'t reach `[6,9]`, which stays separate: `[[1,5],[6,9]]`.',
  },
  'non-overlapping-intervals': {
    explain: '`[1,3]` overlaps both `[1,2]` and `[2,3]`. Removing just that one leaves `[1,2]`, `[2,3]`, `[3,4]`, which only touch at their ends. So the answer is 1.',
  },
  'minimum-number-of-arrows-to-burst-balloons': {
    explain: 'An arrow at x = 6 bursts `[2,8]` and `[1,6]`, and an arrow at x = 11 bursts `[10,16]` and `[7,12]`. No single arrow hits all four, so the answer is 2.',
  },
  'interval-list-intersections': {
    explain: 'Walk both sorted lists together and keep each overlap: `[0,2]` and `[1,5]` give `[1,2]`, `[5,10]` and `[1,5]` give `[5,5]`, and so on: `[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]`.',
  },
  'remove-covered-intervals': {
    explain: '`[3,6]` lies entirely inside `[2,8]`, so it is removed. `[1,4]` sticks out to the left of `[2,8]`, so it stays, leaving 2 intervals.',
    more: 'Sorting by start ascending, and by end descending for equal starts, puts every covering interval before the ones it covers. Then one pass tracking the largest end seen so far is enough.',
  },
  'minimum-interval-to-include-each-query': {
    explain: 'Query 2 is inside `[2,4]` (size 3), query 3 too, query 4 is inside `[4,4]` (size 1) and query 5 is inside `[3,6]` (size 4). The answer lists the smallest size for each: `[3,3,1,4]`.',
  },
  'meeting-rooms': {
    explain: '[0,30] overlaps both [5,10] and [15,20], so one person cannot attend everything and the answer is `false`.',
  },
  'meeting-rooms-ii': {
    explain: '[0,30] runs the whole time, and [5,10] and [15,20] each overlap it but not each other. Two rooms are enough, and needed, so the answer is 2.',
  },
  'meeting-rooms-iii': {
    explain: 'Meetings at 0 and 1 take rooms 0 and 1. The one starting at 2 waits until room 1 frees at 5 and runs to 10. The one at 3 waits until room 0 frees at 10. Rooms 0 and 1 both hold two meetings, so the answer is the lower number, 0.',
  },
};
