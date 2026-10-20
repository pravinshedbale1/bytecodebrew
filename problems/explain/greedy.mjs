export default {
  'assign-cookies': {
    explain: 'Both cookies have size 1, so only the child whose greed is 1 can be satisfied. The answer is 1.',
  },
  'best-time-to-buy-and-sell-stock': {
    explain: 'Buy on day 1 at price 1 and sell on day 4 at price 6, a profit of 5. Selling at 7 is impossible because day 0 comes before the buy, so the answer is 5.',
    more: 'You must buy before you sell, and you make at most one trade. Track the lowest price seen so far and the best profit from selling today.',
  },
  'jump-game': {
    explain: 'Jump 1 step from index 0 to index 1, then 3 steps from index 1 to the last index. The end is reachable, so the answer is `true`.',
    more: 'For example in `[3,2,1,0,4]` every route gets stuck at the 0 at index 3, so the answer there is `false`.',
  },
  'jump-game-ii': {
    explain: 'Jump from index 0 to index 1, then from index 1 (which can jump 3) straight to the last index. That is 2 jumps, the fewest possible.',
    more: 'Think of the jumps in waves: everything reachable with one jump, then everything reachable from those, and so on. Count the waves until the last index is covered.',
  },
  'gas-station': {
    explain: 'Starting at station 3 with an empty tank: +4 −1, +5 −2, +1 −3, +2 −4, +3 −5 leaves 3, 6, 4, 2 and finally 0 gas, never below zero. So the trip works from station 3.',
  },
  'partition-labels': {
    explain: 'The parts "ababcbaca", "defegde" and "hijhklij" each contain every copy of their letters, and no part can be split further. Their sizes are `[9,7,8]`.',
    more: 'For example in "eccbbbbdec", "e" appears at both ends, so the whole string must be a single part of size 10.',
  },
  'boats-to-save-people': {
    explain: 'The two people weigh 1 + 2 = 3, exactly the limit, so they share one boat. The answer is 1.',
  },
  'two-city-scheduling': {
    explain: 'Send the first two people to city A (10 + 30) and the last two to city B (50 + 20). The total is 110, the cheapest split with 2 people per city.',
    more: 'Sort people by how much cheaper city A is than city B (`aCost − bCost`), send the first `n` to A and the rest to B.',
  },
  candy: {
    explain: 'The children can get 2, 1 and 2 candies: each child rated higher than a neighbour gets more than that neighbour. That is 5 candies, the fewest possible.',
  },
};
