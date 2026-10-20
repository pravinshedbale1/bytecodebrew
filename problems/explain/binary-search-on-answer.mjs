export default {
  'koko-eating-bananas': {
    explain: 'At speed 4 the piles take 1, 2, 2 and 3 hours (each pile rounds up), 8 hours in total, which fits `h = 8`. At speed 3 they take 1 + 2 + 3 + 4 = 10 hours, too many. So the slowest speed that works is 4.',
  },
  'find-the-smallest-divisor-given-a-threshold': {
    explain: 'Dividing by 5 and rounding up gives 1, 1, 1 and 2, which sum to 5 ≤ 6. Dividing by 4 gives 1, 1, 2 and 3, summing to 7, which is over the threshold. So the smallest divisor that works is 5.',
  },
  'capacity-to-ship-packages-within-d-days': {
    explain: 'With capacity 15 the days are `[1,2,3,4,5]`, `[6,7]`, `[8]`, `[9]` and `[10]`: 5 days, in order, none over 15. With capacity 14 the same greedy loading needs 6 days. So 15 is the smallest capacity that ships everything within 5 days.',
  },
  'minimum-number-of-days-to-make-m-bouquets': {
    explain: 'Each bouquet needs `k = 1` flower. By day 3 the flowers blooming on days 1, 3 and 2 are open, enough for 3 bouquets. On day 2 only two flowers are open. So the answer is day 3.',
  },
  'minimum-time-to-complete-trips': {
    explain: 'In 3 units of time the buses finish 3 ÷ 1 = 3, 3 ÷ 2 = 1 and 3 ÷ 3 = 1 trips (rounded down), 5 in total. In 2 units they finish only 2 + 1 + 0 = 3 trips. So the minimum time is 3.',
  },
  'magnetic-force-between-two-balls': {
    explain: 'Placing the 3 balls at positions 1, 4 and 7 makes the closest pair 3 apart. A minimum gap of 4 is impossible: after 1 the next free position at least 4 away is 7, and nothing fits after it. So the largest possible minimum force is 3.',
  },
  'split-array-largest-sum': {
    explain: 'Splitting into `[7,2,5]` and `[10,8]` gives sums 14 and 18, so the largest part is 18. Every other split into 2 parts has a larger maximum (for example `[7,2,5,10] | [8]` has 24), so the answer is 18.',
    more: 'The parts keep the original order and together cover every element exactly once. Among all ways of making exactly `k` parts, look at each split\'s largest part sum and return the smallest such value.',
  },
};
