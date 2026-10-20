export default {
  'running-sum-of-1d-array': {
    explain: 'The running sums are 1, 1 + 2 = 3, 3 + 3 = 6 and 6 + 4 = 10, so the answer is `[1,3,6,10]`.',
    more: 'Each element is the previous running sum plus the current value, so one pass is enough.',
  },
  'range-sum-query-immutable': {
    explain: '`sumRange(0, 2)` is -2 + 0 + 3 = 1, `sumRange(2, 5)` is 3 − 5 + 2 − 1 = -1, and `sumRange(0, 5)` is -3. Output: `[null,1,-1,-3]`.',
  },
  'find-pivot-index': {
    explain: 'At index 3 the numbers to the left sum to 1 + 7 + 3 = 11 and those to the right to 5 + 6 = 11. That is the leftmost such index, so the answer is 3.',
  },
  'subarray-sum-equals-k': {
    explain: 'The subarrays `[1,1]` at positions 0–1 and 1–2 both sum to 2, so the answer is 2.',
    more: 'Keep a running sum and a hash map counting how often each prefix sum has appeared. A subarray ending here sums to `k` once for every earlier prefix equal to `sum − k`.',
  },
  'subarray-sums-divisible-by-k': {
    explain: 'Seven subarrays have a sum divisible by 5: `[4,5,0,-2,-3,1]`, `[5]`, `[5,0]`, `[5,0,-2,-3]`, `[0]`, `[0,-2,-3]` and `[-2,-3]`. So the answer is 7.',
    more: 'Two prefix sums with the same remainder modulo `k` bound a subarray whose sum is divisible by `k`. Normalise negative remainders, for example with `((s % k) + k) % k`.',
  },
  'contiguous-array': {
    explain: '`[0,1]` has one 0 and one 1, so the whole array qualifies and the answer is its length, 2.',
    more: 'Count a 0 as -1 and a 1 as +1. A balanced subarray then has sum 0, so look for two equal prefix sums as far apart as possible.',
  },
  'product-of-array-except-self': {
    explain: 'Leaving out each element in turn: 2 × 3 × 4 = 24, 1 × 3 × 4 = 12, 1 × 2 × 4 = 8 and 1 × 2 × 3 = 6, so the answer is `[24,12,8,6]`.',
  },
  'range-sum-query-2d-immutable': {
    explain: 'The rectangle from (2, 1) to (4, 3) sums to 8, (1, 1)–(2, 2) holds 6 + 3 + 2 + 0 = 11, and (1, 2)–(2, 4) holds 3 + 2 + 1 + 0 + 1 + 5 = 12. Output: `[null,8,11,12]`.',
  },
  'corporate-flight-bookings': {
    explain: 'Flight 1 has 10 seats booked, flight 2 has 10 + 20 + 25 = 55, flight 3 has 20 + 25 = 45, and flights 4 and 5 have 25 each: `[10,55,45,25,25]`.',
  },
  'number-of-submatrices-that-sum-to-target': {
    explain: 'The four corner cells are each 0, so each is a 1 × 1 submatrix with sum 0. No larger submatrix sums to 0, so the answer is 4.',
    more: 'Fix a pair of rows, collapse the columns between them into one array of sums, and count subarrays of that array with the target sum using prefix sums and a hash map.',
  },
};
