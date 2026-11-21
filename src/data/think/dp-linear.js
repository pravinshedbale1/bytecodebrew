/** Practice thinking walkthroughs: dp-linear (format: src/data/think/index.js). */
export default {
  'house-robber': {
    aha: "At each house there are only two options: skip it (keep the best so far) or rob it (its money plus the best up to two houses back). best(i) = max(best(i − 1), nums[i] + best(i − 2)), and only the last two answers need remembering.",
    asks: { observe: "In [2, 1, 1, 2], does robbing every other house give the best total? What does?", pattern: "The best total up to house i depends only on which two earlier answers?" },
    read: [
      { phrase: 'You cannot rob two adjacent houses', says: 'Each choice limits the next one: decisions interact, so a simple greedy is suspicious.' },
      { phrase: 'Return the maximum amount of money', says: 'An optimisation over many possible plans: a dynamic programming candidate.' },
      { phrase: 'You can skip as many houses as you like', says: 'At every house the choice is binary: rob it or skip it.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n)', note: 'Trying every plan is up to 2¹⁰⁰: impossible. Any polynomial solution passes; the clean one is O(n).' },
    observe: [
      {
        title: 'Greedy fails',
        text: 'Taking every other house, or the biggest house first, can lose. In [2, 1, 1, 2] the best plan robs the two ends (4); alternating gives only 3.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 1, 2], marks: { 0: 'hit', 3: 'hit' }, tags: { 0: [['rob', 'success']], 3: [['rob', 'success']] } }], caption: 'best = 2 + 2 = 4, skipping two houses in a row' },
      },
      {
        title: 'At house i there are only two options',
        text: 'Skip it: the best is whatever was best up to house i − 1. Rob it: nums[i] plus the best up to house i − 2 (house i − 1 must be skipped).',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 9, 3, 1], marks: { 2: 'cur', 1: 'target', 0: 'kept' }, tags: { 2: [['i', 'accent']], 1: [['skip i', 'warn']], 0: [['rob i', 'success']] } }], caption: 'best(2) = max(best(1), 9 + best(0))' },
      },
      {
        title: 'Only the last two answers matter',
        text: 'best(i) uses only best(i − 1) and best(i − 2), so two variables replace the whole table: O(1) space.',
        sketch: { kind: 'array', rows: [{ label: 'best so far', items: [2, 7, 11, 11, 12], marks: { 3: 'kept', 4: 'hit' } }] },
      },
    ],
    brute: { idea: 'Recursively try both choices at every house (rob it and jump two ahead, or skip it), and take the better total.', cost: 'O(2ⁿ)', waste: '"The best from house i onwards" is solved again and again by different call paths.' },
    pattern: {
      pick: 'dp-linear',
      why: 'Overlapping subproblems ("best up to house i") with a choice that looks only one or two steps back: 1D DP, best(i) = max(best(i − 1), nums[i] + best(i − 2)).',
      not: [
        { id: 'greedy', why: 'No local rule is safe: [2, 1, 1, 2] breaks both "alternate" and "biggest first".' },
        { id: 'backtracking', why: 'Exploring every plan is correct but exponential; memoising it turns it into this DP.' },
      ],
    },
    watch: {
      frames: [
        { title: 'best(0) = 2', text: 'With one house, rob it.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 0: 'cur' } }, { label: 'best', items: [2, '·', '·', '·', '·'], marks: { 0: 'hit' } }] } },
        { title: 'best(1) = max(2, 7) = 7', text: 'Two houses: rob the richer one.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 1: 'cur' } }, { label: 'best', items: [2, 7, '·', '·', '·'], marks: { 1: 'hit' } }] } },
        { title: 'best(2) = max(7, 9 + 2) = 11', text: 'Skip house 2 → 7. Rob it → 9 + best(0) = 11. Robbing wins.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 2: 'cur' } }, { label: 'best', items: [2, 7, 11, '·', '·'], marks: { 0: 'kept', 1: 'target', 2: 'hit' } }] } },
        { title: 'best(3) = max(11, 3 + 7) = 11', text: 'Skip house 3 → 11. Rob it → 3 + best(1) = 10. Skipping wins.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 3: 'cur' } }, { label: 'best', items: [2, 7, 11, 11, '·'], marks: { 1: 'kept', 2: 'target', 3: 'hit' } }] } },
        { title: 'best(4) = max(11, 1 + 11) = 12', text: 'Rob house 4 → 1 + best(2) = 12. The answer is 12 (houses 0, 2 and 4).', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }, { label: 'best', items: [2, 7, 11, 11, 12], marks: { 4: 'hit' } }] } },
      ],
    },
    edges: ["One house: [5] → 5.", "Two houses: [2, 7] → 7.", "All zeros: [0, 0, 0] → 0."],
  },
};
