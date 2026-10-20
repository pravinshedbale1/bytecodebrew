export default {
  'last-stone-weight': {
    explain: 'Smash 8 and 7 (leaves 1), then 4 and 2 (leaves 2), then 2 and 1 (leaves 1), then 1 and 1 (nothing). One stone of weight 1 remains, so the answer is 1.',
  },
  'kth-largest-element-in-a-stream': {
    explain: 'With `k = 3`, each `add` returns the 3rd largest value so far. After adding 3 the top three are 8, 5, 4 (answer 4); after 5 it is 5; after 10 it is 5; after 9 and 4 it is 8. Output: `[null,4,5,5,8,8]`.',
  },
  'kth-largest-element-in-an-array': {
    explain: 'Sorted from largest, the values are 6, 5, 4, 3, 2, 1. The 2nd largest is 5.',
    more: 'For example in `[3,2,3,1,2,4,5,5,6]` with `k = 4` the answer is 4: the two 5s count separately. A min-heap holding the `k` largest values seen so far gives O(n log k).',
  },
  'top-k-frequent-elements': {
    explain: '1 appears 3 times, 2 appears twice and 3 once. The 2 most frequent values are 1 and 2, so the answer is `[1,2]` (in any order).',
    more: 'Count the values first, then pick the `k` with the highest counts, with a heap of size `k` or by bucketing values by their count.',
  },
  'k-closest-points-to-origin': {
    explain: 'The squared distances are 1² + 3² = 10 for `[1,3]` and 2² + 2² = 8 for `[-2,2]`. The closest point is `[-2,2]`, so the answer is `[[-2,2]]`.',
    more: 'Comparing squared distances is enough, since the square root doesn\'t change the order.',
  },
  'task-scheduler': {
    explain: 'With a cooldown of 2, the same task can\'t run in back-to-back slots or with one slot between. The best order is A, B, idle, A, B, idle, A, B: 8 intervals.',
  },
  'kth-smallest-element-in-a-sorted-matrix': {
    explain: 'The values in sorted order are 1, 5, 9, 10, 11, 12, 13, 13, 15. The 8th of them is 13.',
    more: 'Duplicates count: the two 13s are the 7th and 8th smallest. The matrix can be treated as `n` sorted lists merged with a heap, or searched by value.',
  },
  'merge-k-sorted-lists': {
    explain: 'Repeatedly taking the smallest front node of the three lists gives 1, 1, 2, 3, 4, 4, 5, 6, so the merged list is `[1,1,2,3,4,4,5,6]`.',
    more: 'Reuse the existing nodes by relinking them; there\'s no need to create new ones. A min-heap of the current front nodes always gives the next smallest.',
  },
  'find-median-from-data-stream': {
    explain: 'After adding 1 and 2 the median is the average of the two middle values, 1.5. After adding 3 the values are 1, 2, 3 and the median is 2.0. Output: `[null,null,null,1.5,null,2.0]`.',
  },
  ipo: {
    explain: 'With capital 0 only project 0 is affordable: finishing it raises capital to 1. Then the best affordable project is project 2 (profit 3), bringing capital to 4 after the 2 allowed projects.',
  },
};
