export default {
  'next-greater-element-i': {
    explain: 'In `nums2`, nothing to the right of 4 is larger (-1), the next larger number after 1 is 3, and nothing after 2 is larger (-1). The answer is `[-1,3,-1]`.',
  },
  'daily-temperatures': {
    explain: 'After 73 comes 74 one day later (1). After 75 the next warmer day is 76, four days later (4). The last two days never see a warmer one (0). Altogether: `[1,1,4,2,1,1,0,0]`.',
  },
  'next-greater-element-ii': {
    explain: 'The array wraps around. The first 1 is followed by 2; nothing in the array is larger than 2 (-1); the last 1 wraps around to the 2 at the start. The answer is `[2,-1,2]`.',
  },
  'online-stock-span': {
    explain: 'Each span counts consecutive days, ending today, with a price at or below today\'s. 70 covers itself and 60 (2); 75 covers 75, 60, 70, 60 (4); 85 covers everything back to 80 (6). Output: `[null,1,1,1,2,1,4,6]`.',
  },
  'remove-k-digits': {
    explain: 'Removing 4, 3 and the first 2 (each a digit larger than the one after it) leaves "1219", the smallest possible number. So the answer is "1219".',
  },
  'sum-of-subarray-minimums': {
    explain: 'The 10 subarrays of `[3,1,2,4]` have minimums 3, 1, 2, 4, 1, 1, 2, 1, 1 and 1, which add up to 17.',
    more: 'Each value is the minimum of every subarray that reaches no further than the nearest smaller value on its left and on its right. Count those subarrays instead of listing them.',
  },
  'sliding-window-maximum': {
    explain: 'The windows of size 3 are `[1,3,-1]`, `[3,-1,-3]`, `[-1,-3,5]`, `[-3,5,3]`, `[5,3,6]` and `[3,6,7]`. Their maximums are `[3,3,5,5,6,7]`.',
  },
  'largest-rectangle-in-histogram': {
    explain: 'The bars of height 5 and 6 side by side form a rectangle of height 5 and width 2, area 10. No other rectangle is larger.',
  },
  'maximal-rectangle': {
    explain: 'Rows 1 and 2, columns 2 to 4, are all `1`s: a 2 × 3 rectangle of area 6. Nothing larger fits, so the answer is 6.',
    more: 'Treat each row as the floor of a histogram whose bar heights count the consecutive `1`s above, and apply the largest-rectangle-in-histogram method row by row.',
  },
  'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit': {
    explain: 'The subarrays of [8,2,4,7] with max − min ≤ 4 are the four single elements, [2,4] and [4,7]. Every longer one contains values more than 4 apart (for example [2,4,7] has 7 − 2 = 5), so the answer is `2`.',
  },
  'jump-game-vi': {
    explain: 'With k = 2, jump 0 → 1 → 3 → 5, landing on 1, −1, 4 and 3: the score is `7`. Landing on −2 or −7 instead would only lower it.',
  },
  'constrained-subsequence-sum': {
    explain: 'Pick 10, 2, 5 and 20 (indices 0, 1, 3, 4): consecutive picks are at most 2 apart, and skipping −10 is allowed because 1 → 3 is a gap of 2. The sum is `37`.',
  },
  'shortest-subarray-with-sum-at-least-k': {
    explain: 'The only subarray of [1] is [1], and its sum 1 is at least k = 1, so the shortest length is `1`.',
  },
  // ---- visible people, counting windows with a min and max queue
  'number-of-visible-people-in-a-queue': {
    explain: 'Person 0 (height 10) sees 6, then 8 (taller than 6), then 11, the first person taller than 10, after which nobody is visible; 5 is hidden by 8. Person 1 (6) sees only 8. Person 2 (8) sees 5 and 11. Person 3 sees 11, person 4 sees 9, and person 5 sees nobody: `[3,1,2,1,1,0]`.',
  },
  'continuous-subarrays': {
    explain: 'All 4 single elements count. Of length 2: [5,4], [4,2] and [2,4] (each pair differs by at most 2). Of length 3, [4,2,4] counts but [5,4,2] does not (5 − 2 = 3), and the whole array does not either. Total 4 + 3 + 1 = `8`.',
  },
  'count-subarrays-with-fixed-bounds': {
    explain: 'The 7 can\'t be in any valid subarray, so look inside [1,3,5,2]. A subarray needs both a 1 (min) and a 5 (max): [1,3,5] and [1,3,5,2] are the only ones, so the answer is `2`.',
  },
  'count-subarrays-with-cost-less-than-or-equal-to-k': {
    explain: 'The three single elements cost 0. [1,3] costs (3 − 1) × 2 = 4 and [3,2] costs 1 × 2 = 2, both at most 4. [1,3,2] costs 2 × 3 = 6, too much. So `5` subarrays.',
  },
  'count-prime-gap-balanced-subarrays': {
    explain: 'The primes are 2 and 3, and 3 − 2 = 1 ≤ k. A balanced subarray must contain both: [2,3] and [1,2,3]. Subarrays with a single prime don\'t count, so the answer is `2`.',
  },
};
