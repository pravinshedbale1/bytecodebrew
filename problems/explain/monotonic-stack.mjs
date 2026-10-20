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
};
