export default {
  'koko-eating-bananas': {
    statement: `There are \`piles.length\` piles of bananas; pile \`i\` has \`piles[i]\` bananas. Koko picks an eating speed \`k\` (bananas per hour). Each hour she picks one pile and eats \`k\` bananas from it; if the pile has fewer than \`k\`, she finishes it and does not start another pile that hour.

Return the smallest integer \`k\` that lets her eat every banana within \`h\` hours.`,
    constraints: ['1 <= piles.length <= 1e4', 'piles.length <= h <= 1e9', '1 <= piles[i] <= 1e9'],
    hints: [
      'If speed k works, any faster speed also works. That monotonic "works / doesn\'t work" shape is a cue for binary search on the answer.',
      'For a given k, the hours needed are the sum of ceil(piles[i] / k). Binary-search k between 1 and max(piles).',
      'Compute ceil as (p + k − 1) / k and keep the hour total in a long. Find the smallest k with hours ≤ h.',
    ],
  },
  'find-the-smallest-divisor-given-a-threshold': {
    statement: `Choose a positive integer divisor \`d\`. Divide every value of \`nums\` by \`d\`, rounding each result up, and add them together.

Return the smallest \`d\` for which that sum is at most \`threshold\`. An answer always exists.`,
    constraints: ['1 <= nums.length <= 5e4', '1 <= nums[i] <= 1e6', 'nums.length <= threshold <= 1e6'],
    hints: [
      'A larger divisor never increases the sum. So the condition "sum ≤ threshold" flips from false to true exactly once as d grows.',
      'Binary-search d between 1 and max(nums), computing the rounded-up sum for each candidate.',
      'Look for the smallest d that satisfies the condition: when it holds, set hi = mid; otherwise lo = mid + 1.',
    ],
  },
  'capacity-to-ship-packages-within-d-days': {
    statement: `Packages with weights \`weights[i]\` must be shipped in the given order. Each day the ship is loaded with packages in order until adding the next one would exceed its capacity; then it sails, and the remaining packages wait for the next day.

Return the smallest ship capacity that ships every package within \`days\` days.`,
    constraints: ['1 <= weights.length <= 5e4', '1 <= days <= weights.length', '1 <= weights[i] <= 500'],
    hints: [
      'The capacity must be at least the heaviest package and is never more than the total weight.',
      'For a candidate capacity, simulate greedily: fill each day until the next package does not fit, and count the days.',
      'Binary-search the smallest capacity whose day count is ≤ days.',
    ],
  },
  'minimum-number-of-days-to-make-m-bouquets': {
    statement: `Flower \`i\` blooms on day \`bloomDay[i]\` and stays bloomed. To make a bouquet you need \`k\` adjacent flowers that have all bloomed, and each flower can be used in only one bouquet.

Return the minimum number of days you must wait to be able to make \`m\` bouquets, or \`-1\` if it can never be done.`,
    constraints: ['n == bloomDay.length', '1 <= n <= 1e5', '1 <= bloomDay[i] <= 1e9', '1 <= m <= 1e6', '1 <= k <= n'],
    hints: [
      'If m × k is more than the number of flowers, the answer is −1 immediately (compute it as a long).',
      'Waiting longer never hurts, so binary-search the day between min(bloomDay) and max(bloomDay).',
      'To test a day, scan left to right counting bloomed flowers in a row; every time the run reaches k, make a bouquet and reset the run.',
    ],
  },
  'minimum-time-to-complete-trips': {
    statement: `Bus \`i\` needs \`time[i]\` units of time for one trip and can start its next trip as soon as it finishes. All buses run at the same time, independently.

Return the minimum time needed for the buses together to complete at least \`totalTrips\` trips.`,
    constraints: ['1 <= time.length <= 1e5', '1 <= time[i] <= 1e7', '1 <= totalTrips <= 1e7'],
    hints: [
      'By time T, bus i has completed T / time[i] trips (integer division).',
      'The total trips grow as T grows, so binary-search the smallest T with sum(T / time[i]) ≥ totalTrips.',
      'The upper bound is min(time) × totalTrips, which needs a long. Stop summing early once you reach totalTrips to avoid overflow.',
    ],
  },
  'magnetic-force-between-two-balls': {
    statement: `There are baskets at the distinct positions in \`position\`. Place \`m\` balls into baskets, at most one ball per basket, so that the smallest distance between any two balls is as large as possible.

Return that largest possible minimum distance.`,
    constraints: ['n == position.length', '2 <= n <= 1e5', '1 <= position[i] <= 1e9', 'The positions are distinct', '2 <= m <= n'],
    hints: [
      'Sort the positions. Then ask: can I place m balls so every two are at least d apart?',
      'Check d greedily: put a ball in the first basket, then in the next basket at least d further, and so on. Count how many fit.',
      'If m balls fit for d, they also fit for any smaller d. Binary-search the largest d that works.',
    ],
  },
  'split-array-largest-sum': {
    statement: `Split \`nums\` into \`k\` non-empty contiguous parts. Of all ways to do it, choose the one in which the largest part sum is as small as possible, and return that largest sum.`,
    constraints: ['1 <= nums.length <= 1000', '0 <= nums[i] <= 1e6', '1 <= k <= nums.length', 'k <= 50'],
    hints: [
      'Flip the question: given a limit L, can you split nums into at most k parts with each part sum ≤ L?',
      'Check L greedily: keep adding to the current part until the next value would exceed L, then start a new part. Count the parts.',
      'Binary-search L between max(nums) and sum(nums), using long sums. The smallest L that needs ≤ k parts is the answer.',
    ],
  },
};
