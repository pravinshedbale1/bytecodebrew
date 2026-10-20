export default {
  'car-pooling': {
    explain: 'Between locations 3 and 5 both trips are in the car: 2 + 3 = 5 passengers, more than the capacity of 4. So the answer is `false`.',
  },
  'range-sum-query-mutable': {
    explain: 'The sum of `[1,3,5]` is 9. After `update(1, 2)` the array is `[1,2,5]`, so the sum becomes 8. Output: `[null,9,null,8]`.',
  },
  'count-of-smaller-numbers-after-self': {
    explain: 'To the right of 5 are 2 and 1 (2 smaller), right of 2 is 1 (1), right of 6 is 1 (1), and nothing is right of 1 (0). The answer is `[2,1,1,0]`.',
    more: 'Counting by brute force is O(n²). Merge sort, counting how many elements from the right half jump ahead of each left element, gives O(n log n); a Fenwick tree works too.',
  },
  'reverse-pairs': {
    explain: 'A reverse pair needs `nums[i] > 2 × nums[j]` with `i < j`. Both 3s are greater than 2 × 1 for the 1 at the end, and no other pair qualifies, so the answer is 2.',
  },
  'count-of-range-sum': {
    explain: 'The subarrays `[-2]` (sum -2), `[-1]` (sum -1) and `[-2,5,-1]` (sum 2) fall inside [-2, 2]. Every other subarray contains the 5 and sums higher, so the answer is 3.',
    more: 'A subarray sum is the difference of two prefix sums. So count pairs of prefix sums whose difference lies in the range, using merge sort or an ordered structure.',
  },
  'create-sorted-array-through-instructions': {
    explain: 'Inserting 1, 5 and 6 costs 0 each: nothing already present is both smaller and larger. Inserting 2 finds one smaller value (1) and two larger (5, 6), costing min(1, 2) = 1. The total is 1.',
  },
  'falling-squares': {
    explain: 'The first square lands at height 2. The second overlaps it and lands on top, reaching 2 + 3 = 5. The third falls on empty ground at height 1, so the tallest stack stays 5: `[2,5,5]`.',
  },
};
