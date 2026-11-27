/** Practice thinking walkthroughs: dp-made-easy (format: src/data/think/index.js). */

export default {
  'fibonacci-number': {
    free: true,
    aha: 'The recursive definition is correct but asks for the same values over and over: F(5) needs F(3) twice, F(2) three times. Store each value the first time it is computed (memoisation), or fill a table from F(0) upward so every value is ready when needed. Each value only needs the two before it, so two variables are enough.',
    asks: {
      read: 'What does the statement warn about the plain recursion?',
      budget: 'n ≤ 30. How many calls does the plain recursion make for n = 30?',
      observe: 'Draw the calls for F(5). Which values are computed more than once?',
      brute: 'Plain recursion works for small n. What exactly does it repeat?',
      pattern: 'If each F(k) were computed once and remembered, how much work is left?',
      watch: 'Watch the call tree, then the same tree with a memo.',
    },
    read: [
      {
        phrase: 'The plain recursive definition recomputes the same values exponentially many times',
        says: 'Overlapping subproblems: store each answer once.',
      },
      { phrase: 'This problem is about avoiding that', says: 'The point is the move from recursion to DP.' },
    ],
    budget: {
      from: 'n ≤ 30',
      rows: [
        ['plain recursion', '≈ 2.7 × 10⁶ calls for n = 30', 'ok', 'fits, but grows 1.6× per n'],
        ['memo / table / two variables', 'n = 30 steps', 'ok', 'tiny'],
      ],
      aim: 'O(n)',
      note: 'The limits allow the slow version; the lesson is why it is slow.',
    },
    observe: [
      {
        title: 'The same calls again and again',
        text: 'F(5) calls F(4) and F(3). F(4) calls F(3) again. F(3) appears twice, F(2) three times, F(1) five times.',
        sketch: { kind: 'array', rows: [{ label: 'times computed', items: ['F(4): 1', 'F(3): 2', 'F(2): 3', 'F(1): 5'], marks: { '3': 'bad' } }] },
      },
      {
        title: 'Remember each answer',
        text: 'With a memo, the second request for F(3) is a lookup. Each F(k) is computed once: 6 values for n = 5 instead of 15 calls.',
        sketch: { kind: 'array', rows: [{ label: 'memo', items: [0, 1, 1, 2, 3, 5], marks: { '5': 'hit' } }] },
      },
      {
        title: 'Only two values matter',
        text: 'Bottom up, F(i) reads F(i − 1) and F(i − 2) and nothing older. Keep two variables and slide them forward: O(1) memory.',
        sketch: { kind: 'array', rows: [{ items: ['a = F(i−2)', 'b = F(i−1)', 'a, b = b, a + b'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Implement the definition directly: F(n) = F(n − 1) + F(n − 2), with F(0) = 0 and F(1) = 1.',
      cost: 'O(2ⁿ)',
      waste: 'Every smaller value is recomputed from scratch in every branch that needs it.',
    },
    pattern: {
      pick: 'dp-made-easy',
      why: 'Overlapping subproblems: memoise the recursion, or tabulate from F(0) up, then keep only the last two values. O(n) time, O(1) space.',
      not: [
        {
          id: 'divide-and-conquer',
          why: 'The subproblems overlap (F(3) is needed by both F(4) and F(5)), so splitting alone repeats work; DP stores each answer once.',
        },
        { id: 'math-for-interviews', why: 'Matrix power or the closed form give O(log n), beyond what is asked.' },
      ],
    },
    watch: {
      viz: 'FibTreeViz',
      inputs: [{ label: 'plain recursion, n = 5', input: { mode: 'plain', n: 5 } }, { label: 'with a memo, n = 5', input: { mode: 'memo', n: 5 } }],
    },
    edges: ['n = 0 → 0.', 'n = 1 → 1.', 'n = 30 → 832040.'],
  },

  'climbing-stairs': {
    aha: 'Look at the last move. To stand on step n you came from step n − 1 (a 1-step) or step n − 2 (a 2-step), and those two groups of ways don\'t overlap. So ways(n) = ways(n − 1) + ways(n − 2): Fibonacci in disguise. Fill it from the bottom, keeping two numbers.',
    asks: {
      read: 'Which moves are allowed, and when are two ways different?',
      budget: 'n ≤ 45. How many ways are there for n = 45, and how many recursive calls?',
      observe: 'List the ways for 3 and 4 steps. How does 4 relate to 3 and 2?',
      brute: 'Enumerating every sequence of 1s and 2s: how many are there?',
      pattern: 'Split the ways to reach step n by their last move. What are the two groups?',
      watch: 'Watch each step add up the two before it.',
    },
    read: [
      { phrase: 'Each time you can climb either 1 or 2 steps', says: 'The last move into step n is one of two kinds.' },
      {
        phrase: 'Two ways are different if the sequence of step sizes differs',
        says: 'Order matters: 1 + 2 and 2 + 1 are different, which is what the sum counts.',
      },
      {
        phrase: 'the number of ways to reach step `n` is the sum of the ways to reach steps `n − 1` and `n − 2`',
        says: 'The statement spells out the recurrence: ways(n) = ways(n − 1) + ways(n − 2). The work is seeing why, and computing it without repeats.',
      },
    ],
    budget: {
      from: 'n ≤ 45',
      rows: [['plain recursion', '≈ 3.6 × 10⁹ calls', 'bad', 'too slow'], ['table or two variables', '45 steps', 'ok', 'tiny']],
      aim: 'O(n)',
      note: 'ways(45) = 1 836 311 903 fits in an int.',
    },
    observe: [
      {
        title: 'Small cases',
        text: '1 step: 1 way. 2 steps: 1+1, 2. 3 steps: 1+1+1, 1+2, 2+1. 4 steps: 5 ways.',
        sketch: { kind: 'array', rows: [{ label: 'ways', items: ['1: 1', '2: 2', '3: 3', '4: 5'] }] },
      },
      {
        title: 'Split by the last move',
        text: 'Ways to reach 4 that end with a 1-step: the 3 ways to reach 3. That end with a 2-step: the 2 ways to reach 2. 3 + 2 = 5.',
        sketch: { kind: 'array', rows: [{ items: ['…then +1: 3 ways', '…then +2: 2 ways', '= 5'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Keep two numbers',
        text: 'Each value reads only the previous two, so slide two variables up the stairs.',
        sketch: { kind: 'array', rows: [{ label: 'ways', items: [1, 1, 2, 3, 5, 8, 13] }] },
      },
    ],
    brute: {
      idea: 'Recurse: ways(n) = ways(n − 1) + ways(n − 2), with no memory.',
      cost: 'O(2ⁿ)',
      waste: 'ways(k) for small k is recomputed in every branch: billions of calls for n = 45.',
    },
    pattern: {
      pick: 'dp-made-easy',
      why: '1-D DP on the last move: ways[i] = ways[i − 1] + ways[i − 2], ways[0] = ways[1] = 1; two variables. O(n), O(1) space.',
      not: [
        {
          id: 'divide-and-conquer',
          why: 'The subproblems overlap (F(3) is needed by both F(4) and F(5)), so splitting alone repeats work; DP stores each answer once.',
        },
        { id: 'backtracking', why: 'Listing every way would be backtracking; only the count is asked.' },
      ],
    },
    watch: { viz: 'Dp1dViz', inputs: [{ label: 'n = 6', input: { mode: 'climb', n: 6 } }, { label: 'n = 3', input: { mode: 'climb', n: 3 } }] },
    edges: ['n = 1 → 1.', 'n = 2 → 2.', 'n = 45 → 1836311903.'],
  },

  'min-cost-climbing-stairs': {
    aha: 'Let dp[i] be the cheapest cost to stand on position i (before paying for it). You arrive from i − 1, paying cost[i − 1], or from i − 2, paying cost[i − 2]; take the cheaper. Positions 0 and 1 are free. The answer is dp at the top, one past the last stair.',
    asks: {
      read: 'Where can you start, and where is the top?',
      budget: 'Up to 1000 stairs. How many ways to climb them?',
      observe: 'For [10, 15, 20], what is the cheapest way to the top?',
      brute: 'Trying every sequence of 1- and 2-steps: how many are there?',
      pattern: 'To stand on a position, where did you come from, and what did it cost?',
      watch: 'Watch each position compare its two ways in.',
    },
    read: [
      {
        phrase: 'You can start on stair `0` or stair `1` for free',
        says: 'You may start on step 0 or step 1 for free, so the cost to stand on either is 0: dp[0] = dp[1] = 0.',
      },
      { phrase: 'which is the position just past the last stair', says: 'The answer is dp[n], not dp[n − 1].' },
      { phrase: 'After paying for a stair you may climb one or two stairs', says: 'You pay the cost of the stair you leave from.' },
    ],
    budget: {
      from: 'stairs ≤ 1000',
      rows: [['every route', '≈ 2¹⁰⁰⁰', 'bad', 'impossible'], ['dp over positions', '1000 steps', 'ok', 'tiny']],
      aim: 'O(n)',
      note: 'Two variables suffice.',
    },
    observe: [
      {
        title: 'Two ways into each position',
        text: 'Position 2 (stair 20): from 1 paying 15, or from 0 paying 10. dp[2] = min(0 + 15, 0 + 10) = 10.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [0, 0, 10, '?'] }] },
      },
      {
        title: 'The top is past the end',
        text: 'Top (position 3): from 2 paying 20 → 30, or from 1 paying 15 → 15. Answer 15: start on stair 1, pay 15, jump two.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [0, 0, 10, 15], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Cheap stairs pull the route',
        text: '[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]: the best route steps only on the 1s, total 6.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1], marks: { '0': 'hit', '2': 'hit', '4': 'hit', '6': 'hit', '7': 'hit', '9': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Recursively try both moves from every position and keep the cheapest total.',
      cost: 'O(2ⁿ)',
      waste: 'The cheapest cost to reach each position is recomputed in every route through it.',
    },
    pattern: {
      pick: 'dp-made-easy',
      why: 'dp[i] = min(dp[i − 1] + cost[i − 1], dp[i − 2] + cost[i − 2]), dp[0] = dp[1] = 0, answer dp[n]. O(n), two variables.',
      not: [
        { id: 'greedy', why: 'Always taking the cheaper next stair can walk into an expensive one later.' },
        { id: 'shortest-paths', why: 'It is a shortest path on a line, but the order is fixed, so a simple DP suffices.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[10, 15, 20]', input: { mode: 'stairs', a: [10, 15, 20] } },
        { label: '[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]', input: { mode: 'stairs', a: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1] } },
      ],
    },
    edges: ['Two stairs: [5, 3] → 3 (start on stair 1).', 'All zero: → 0.', '[10, 15, 20] → 15.'],
  },

  'n-th-tribonacci-number': {
    aha: 'Fibonacci with one more term: each value is the sum of the three before it. Fill from T(0) upward so the three ingredients are always ready, and since nothing older is ever read, keep just three variables.',
    asks: {
      read: 'What are the three base cases?',
      budget: 'n ≤ 37. How many calls would the plain recursion make?',
      observe: 'Write T(0) to T(6). Which three values make T(6)?',
      brute: 'The recursion branches three ways. What does that cost?',
      pattern: 'How far back does each value look?',
      watch: 'Watch each cell add the three before it.',
    },
    read: [
      { phrase: 'Each term is the sum of the three before it', says: 'T[i] = T[i − 1] + T[i − 2] + T[i − 3].' },
      { phrase: 'Keeping only the last three values is enough', says: 'O(1) memory with three rolling variables.' },
      { phrase: 'The answer fits in a 32-bit integer', says: 'No overflow worries for n ≤ 37.' },
    ],
    budget: {
      from: 'n ≤ 37',
      rows: [['plain recursion', '≈ 1.84ⁿ ≈ 10¹⁰ calls', 'bad', 'too slow'], ['three variables', '37 steps', 'ok', 'tiny']],
      aim: 'O(n)',
      note: 'Same idea as Fibonacci.',
    },
    observe: [
      {
        title: 'The sequence',
        text: '0, 1, 1, 2, 4, 7, 13, … Each term adds the previous three: 2 + 4 + 7 = 13.',
        sketch: { kind: 'array', rows: [{ label: 'T', items: [0, 1, 1, 2, 4, 7, 13], marks: { '6': 'hit' } }] },
      },
      {
        title: 'Three bases',
        text: 'T(0) = 0, T(1) = 1, T(2) = 1 are given; the rule starts at T(3) = 0 + 1 + 1 = 2.',
        sketch: { kind: 'array', rows: [{ items: ['T0 0', 'T1 1', 'T2 1', 'T3 2'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'A window of three',
        text: 'Each term needs only the previous three, so keep three variables and slide them forward: (a, b, c) → (b, c, a + b + c). O(1) memory.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', '→ b, c, a+b+c'], marks: { '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recurse directly on the definition with three calls per level.',
      cost: 'O(3ⁿ)',
      waste: 'Plain recursion recomputes every smaller term again and again: T(n − 3) alone is reached from three different branches, and it compounds.',
    },
    pattern: {
      pick: 'dp-made-easy',
      why: 'Bottom-up 1-D DP reading the last three values; keep three rolling variables. O(n), O(1) space.',
      not: [
        {
          id: 'divide-and-conquer',
          why: 'The subproblems overlap (F(3) is needed by both F(4) and F(5)), so splitting alone repeats work; DP stores each answer once.',
        },
        { id: 'math-for-interviews', why: 'A 3 × 3 matrix power gives O(log n), unnecessary for n ≤ 37.' },
      ],
    },
    watch: { viz: 'Dp1dViz', inputs: [{ label: 'n = 7', input: { mode: 'trib', n: 7 } }, { label: 'n = 4', input: { mode: 'trib', n: 4 } }] },
    edges: ['n = 0 → 0.', 'n = 2 → 1.', 'n = 25 → 1389537.'],
  },
};
