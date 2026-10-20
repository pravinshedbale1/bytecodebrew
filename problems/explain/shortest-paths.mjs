export default {
  'network-delay-time': {
    explain: 'The signal leaves node 2 at time 0. Nodes 1 and 3 hear it at time 1, and node 4 hears it through node 3 at time 2. The last node to hear it does so at time 2, so the answer is 2.',
  },
  'path-with-minimum-effort': {
    explain: 'The route 1 → 3 → 5 → 3 → 5 (down the left column, then along the bottom row) never climbs or drops more than 2 between neighbouring cells. Every other route has a step of at least 2 as well, so the answer is 2.',
  },
  'cheapest-flights-within-k-stops': {
    explain: 'The cheapest route overall is 0 → 1 → 2 → 3 for 400, but it makes 2 stops and only `k = 1` is allowed. With at most one stop the best is 0 → 1 → 3, costing 100 + 600 = 700.',
  },
  'path-with-maximum-probability': {
    explain: 'The direct edge 0 → 2 succeeds with probability 0.2. Going 0 → 1 → 2 succeeds with 0.5 × 0.5 = 0.25, which is higher, so the answer is 0.25.',
  },
  'minimum-obstacle-removal-to-reach-corner': {
    explain: 'Both neighbours of the start are obstacles, and so are the cells right after them, so one removal is never enough. Removing the two obstacles along the top row opens the path down the empty right column, so the answer is 2.',
  },
  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': {
    explain: 'Following the arrows from the top-left you walk right along row 0, then get stuck. Turning the last cell of row 0 to point down, the first cell of row 1 to point down, and the last cell of row 2 to point down gives a path to the bottom-right corner. That is 3 changes, and no path needs fewer.',
  },
  'swim-in-rising-water': {
    explain: 'You can only stand on the bottom-right cell once the water reaches its height, 3. By time 3 every cell is under water, so you can swim straight there; the answer is 3.',
  },
  'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance': {
    explain: 'Within distance 4: city 0 reaches cities 1 and 2, city 1 reaches 0, 2 and 3, city 2 reaches 0, 1 and 3, and city 3 reaches 1 and 2. Cities 0 and 3 both reach only 2 others; on a tie the larger number wins, so the answer is 3.',
  },
};
