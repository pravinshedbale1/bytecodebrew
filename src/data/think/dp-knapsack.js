/** Practice thinking walkthroughs: dp-knapsack (format: src/data/think/index.js). */

export default {
  'partition-equal-subset-sum': {
    aha: 'Two equal groups each hold half the total, so the question is whether some subset sums to exactly total / 2 (and an odd total is an instant no). Track which sums are reachable, adding one number at a time: every reachable s also gives s + x. Filling the array from high sums to low uses each number at most once.',
    asks: {
      read: 'What does an equal split require of the total?',
      budget: '200 numbers up to 100: total up to 20 000. How many subsets?',
      observe: 'For [1, 5, 11, 5], which subset makes 11?',
      brute: 'Trying all 2ⁿ subsets: why hopeless here?',
      pattern: 'Many subsets share the same sum. What should you track instead of subsets?',
      watch: 'Watch the reachable sums grow, one number per row.',
    },
    read: [
      { phrase: 'whether some subset of `nums` sums to exactly half of the total', says: 'Subset sum to total / 2: a 0/1 knapsack.' },
      {
        phrase: 'An odd total can never be split evenly',
        says: 'Check the total first: if it is odd, no two equal groups of whole numbers exist, so answer false without any table.',
      },
      { phrase: 'Every value must go into exactly one of the groups', says: 'Each number used at most once: fill right to left.' },
    ],
    budget: {
      from: 'n ≤ 200, values ≤ 100',
      rows: [['all subsets', '2²⁰⁰', 'bad', 'impossible'], ['reachable sums', '200 × 10⁴ = 2 × 10⁶', 'ok', 'fits']],
      aim: 'O(n · total)',
      note: 'A bitset makes it faster still.',
    },
    observe: [
      {
        title: 'Half the total',
        text: '[1, 5, 11, 5] totals 22, so each group must sum to 11. If one group reaches 11, the rest automatically sums to 11 too: {11} and {1, 5, 5}. So the question is just "can some subset make 11?"',
        sketch: { kind: 'array', rows: [{ items: [1, 5, 11, 5], marks: { '2': 'hit' } }], caption: '11 = 1 + 5 + 5' },
      },
      {
        title: 'Track sums, not subsets',
        text: 'After 1 and 5, reachable sums are 0, 1, 5, 6. Whichever subset made 6 doesn\'t matter, only that 6 is possible.',
        sketch: { kind: 'array', rows: [{ label: 'reachable', items: [0, 1, 5, 6] }] },
      },
      {
        title: 'Right to left',
        text: 'Updating can[s] from can[s − x] going downwards means can[s − x] still holds the value from before x was added, so x is used once.',
        sketch: { kind: 'array', rows: [{ items: ['s = half', '…', 's = x'], marks: { '0': 'hit' } }], caption: 'high to low' },
      },
    ],
    brute: {
      idea: 'Try every subset and check whether it sums to total / 2.',
      cost: 'O(2ⁿ · n)',
      waste: 'Different subsets with the same sum are explored separately; there are only total / 2 + 1 sums to track.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: '0/1 knapsack on sums: can[0] = true; for each x, for s from half down to x, can[s] |= can[s − x]; answer can[half]. O(n · total).',
      not: [
        { id: 'backtracking', why: 'Trying every subset is exponential; the reachable-sums table collapses subsets with the same sum.' },
        { id: 'greedy', why: 'Putting each number in the lighter group fails: [3, 3, 2, 2, 2] needs a careful split.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[1, 5, 11, 5]', input: { mode: 'subset', a: [1, 5, 11, 5] } },
        { label: '[1, 2, 3, 5]', input: { mode: 'subset', a: [1, 2, 3, 5] } },
      ],
    },
    edges: ['Odd total: [1, 2] → false.', 'Two equal numbers: [4, 4] → true.', '[1, 2, 3, 5] → false (total 11).'],
  },

  'target-sum': {
    aha: 'Call the numbers with a + sign P and the rest N. Then P − N = target and P + N = total, so P = (total + target) / 2. Counting sign choices is counting subsets that sum to that P: a 0/1 knapsack that counts. If (total + target) is odd or negative, the answer is 0.',
    asks: {
      read: 'Do equal numbers at different positions count separately?',
      budget: '20 numbers: 2²⁰ ≈ 10⁶ sign choices. Fine, but can you do better?',
      observe: 'For [1, 1, 1, 1, 1] and target 3, how many numbers get +?',
      brute: 'Trying every sign assignment works here. What does the algebra buy?',
      pattern: 'Rewrite "signs that give target" as "a subset with some sum".',
      watch: 'Watch the counts per sum grow one number at a time.',
    },
    read: [
      { phrase: 'Put either `+` or `-` in front of every number', says: 'Split into P (plus) and N (minus): P − N = target.' },
      { phrase: 'Two assignments are different if any position\'s sign differs', says: 'Count by positions: equal numbers make separate subsets.' },
    ],
    budget: {
      from: 'n ≤ 20, total ≤ 1000',
      rows: [['all sign choices', '2²⁰ ≈ 10⁶', 'ok', 'fits'], ['count subsets with sum P', '20 × 1000', 'ok', 'faster']],
      aim: 'O(n · P)',
      note: 'The reduction makes the DP small.',
    },
    observe: [
      {
        title: 'The algebra',
        text: 'total 5, target 3: P − N = 3 and P + N = 5 give P = 4. So choose which four 1s get +.',
        sketch: { kind: 'array', rows: [{ items: ['P − N = 3', 'P + N = 5', 'P = 4'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Count subsets summing to 4',
        text: 'With nums [1, 1, 1, 1, 1] the question is now "how many subsets sum to 4?". Choosing which four of the five 1s get a +: 5 ways, which matches the 5 sign assignments.',
        sketch: { kind: 'array', rows: [{ label: 'ways', items: [1, 5, 10, 10, 5], marks: { '4': 'hit' } }] },
      },
      {
        title: 'Impossible targets',
        text: 'If total + target is odd or negative, no whole-number P exists: 0 ways.',
        sketch: { kind: 'array', rows: [{ items: ['(5 + 2) odd', '→ 0'], marks: { '1': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try + and − for every number and count the assignments that hit target.',
      cost: 'O(2ⁿ)',
      waste: 'Different sign prefixes with the same running sum are explored separately.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: 'P = (total + target) / 2; count subsets with sum P: ways[0] = 1, for each x, s from P down to x: ways[s] += ways[s − x]. O(n · P).',
      not: [
        { id: 'backtracking', why: 'Trying every subset is exponential; the reachable-sums table collapses subsets with the same sum.' },
        { id: 'hashing', why: 'A map from running sum to count also works (top-down with memo); the reduction is cleaner.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[1, 1, 1, 1, 1], 3', input: { mode: 'targetsum', a: [1, 1, 1, 1, 1], target: 3 } },
        { label: '[2, 3, 5], 0', input: { mode: 'targetsum', a: [2, 3, 5], target: 0 } },
      ],
    },
    edges: ['One number: [1], target 1 → 1.', 'Unreachable: [1], target 2 → 0.', 'Zeros double the count: [0, 1], target 1 → 2.'],
  },

  'last-stone-weight-ii': {
    aha: 'However you smash, the last stone equals |pile A − pile B| for some split of the stones into two piles. So make the piles as even as possible: find the largest reachable sum not above total / 2, and the answer is total − 2 × that sum.',
    asks: {
      read: 'What happens to two stones of different weights?',
      budget: '30 stones of weight ≤ 100. Can you simulate every smashing order?',
      observe: 'For [2, 7, 4, 1, 8, 1], can you split into piles of 11 and 12?',
      brute: 'Trying every order of smashes: why does it explode?',
      pattern: 'Every smash subtracts one stone from another. What does the final weight look like as a sum with signs?',
      watch: 'Watch reachable pile sums, then the one closest to half.',
    },
    read: [
      { phrase: 'otherwise only a stone of weight `y − x` remains', says: 'Each stone ends up added or subtracted: two piles.' },
      { phrase: 'Return the smallest possible weight of that stone', says: 'Make the two piles as close as possible.' },
    ],
    budget: {
      from: 'n ≤ 30, weights ≤ 100',
      rows: [['every smash order', 'n!', 'bad', 'impossible'], ['reachable sums ≤ 1500', '30 × 1500', 'ok', 'tiny']],
      aim: 'O(n · total)',
      note: 'Same table as Partition Equal Subset Sum.',
    },
    observe: [
      {
        title: 'Smashing is subtracting',
        text: 'Smash 8 and 7 → 1; smash that 1 with 2 → 1: the result is 2 − (8 − 7). Every stone ends up with a + or a −.',
        sketch: { kind: 'array', rows: [{ items: ['+2', '−8', '+7'] }] },
      },
      {
        title: 'Two piles',
        text: 'Total 23: the best pile not above 11 is 11 (e.g. 2 + 1 + 8), the other is 12. Final stone: 1.',
        sketch: { kind: 'array', rows: [{ items: ['pile 11', 'pile 12', '→ 1'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Closest to half',
        text: 'So aim for one pile as close to half (11) as possible without going over. The largest reachable sum ≤ 11 is 11 itself, and the final stone weighs 23 − 2 × 11 = 1.',
        sketch: { kind: 'array', rows: [{ items: ['23 − 2·11', '= 1'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try every way to split the stones into two piles and take the smallest difference.',
      cost: 'O(2ⁿ · n)',
      waste: 'Splits with the same pile sum are identical for the answer; only the reachable sums matter.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: 'Subset sum up to total / 2; best = largest reachable; answer total − 2·best. O(n · total).',
      not: [
        { id: 'heap-patterns', why: 'Last Stone Weight I smashes the two heaviest with a heap; here any pair may be chosen, so greedy fails.' },
        { id: 'backtracking', why: 'Trying every subset is exponential; the reachable-sums table collapses subsets with the same sum.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[2, 7, 4, 1, 8, 1]', input: { mode: 'stone2', a: [2, 7, 4, 1, 8, 1] } },
        { label: '[1, 3, 9]', input: { mode: 'stone2', a: [1, 3, 9] } },
      ],
    },
    edges: ['One stone: [5] → 5.', 'Two equal: [4, 4] → 0.', '[1, 3, 9] → 5.'],
  },

  'coin-change': {
    aha: 'The fewest coins for an amount a is 1 plus the fewest for a − c, for whichever coin c was used last. Fill best[0..amount] from 0 upwards; each coin can be reused because best[a − c] may itself already use c. Amounts that can\'t be made stay ∞.',
    asks: {
      read: 'Can coins be reused? What is returned when the amount is impossible?',
      budget: 'amount ≤ 10⁴, up to 12 coins. Table size?',
      observe: 'With coins [1, 3, 4] and amount 6, does taking the biggest coin first work?',
      brute: 'Trying every combination of coins: how many?',
      pattern: 'What is the last coin of an optimal answer, and what is left before it?',
      watch: 'Watch each amount try every coin as its last one.',
    },
    read: [
      { phrase: 'you have an unlimited number of coins of each', says: 'Unbounded: a coin can appear many times.' },
      {
        phrase: 'Return the fewest coins needed to make exactly `amount`, or `-1` if it cannot be made',
        says: 'Minimise; keep ∞ for impossible amounts.',
      },
      { phrase: 'Making an amount of 0 needs 0 coins', says: 'Amount 0 needs no coins: best[0] = 0 is the base every other amount builds on.' },
    ],
    budget: {
      from: 'amount ≤ 10⁴, coins ≤ 12',
      rows: [['try every coin sequence', 'exponential', 'bad', 'impossible'], ['best over amounts × coins', '10⁴ × 12 = 1.2 × 10⁵', 'ok', 'tiny']],
      aim: 'O(amount · coins)',
      note: 'BFS over amounts also works.',
    },
    observe: [
      {
        title: 'Greedy fails',
        text: 'With coins [1, 3, 4] and amount 6, taking the biggest coin first gives 4 + 1 + 1: 3 coins. But 3 + 3 uses only 2. One big coin early can force many small ones later.',
        sketch: { kind: 'array', rows: [{ items: ['greedy 4+1+1', 'best 3+3'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
      {
        title: 'The last coin',
        text: 'best[6] = 1 + min(best[5], best[3], best[2]) for coins 1, 3, 4: 1 + min(2, 1, 2) = 2.',
        sketch: { kind: 'array', rows: [{ label: 'best', items: [0, 1, 2, 1, 1, 2, 2], marks: { '6': 'hit' } }] },
      },
      {
        title: 'Impossible stays ∞',
        text: 'Coins [2], amount 3: best[1] = ∞, best[3] = 1 + best[1] = ∞ → return −1.',
        sketch: { kind: 'array', rows: [{ items: [0, '∞', 1, '∞'], marks: { '3': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try every coin as the next one and take the minimum count.',
      cost: 'O(coins^amount)',
      waste: 'The fewest coins for each smaller amount is recomputed in every branch.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: 'Unbounded knapsack (min count): best[a] = 1 + min over coins c ≤ a of best[a − c]; ∞ → −1. O(amount · coins).',
      not: [
        { id: 'greedy', why: 'Works for real currencies, fails for [1, 3, 4].' },
        { id: 'graph-traversal', why: 'BFS from 0 over amounts gives the same answer in levels.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[1, 3, 4], 6', input: { mode: 'coins', a: [1, 3, 4], amount: 6 } },
        { label: '[2], 3', input: { mode: 'coins', a: [2], amount: 3 } },
      ],
    },
    edges: ['Amount 0 → 0.', 'Impossible: [2], 3 → −1.', '[1, 2, 5], 11 → 3.'],
  },

  'coin-change-ii': {
    aha: 'Count combinations, not orders: process the coins one at a time in the outer loop. ways[a] = ways using only the coins seen so far; adding coin c means ways[a] += ways[a − c]. Because coin c is only ever added after the coins before it, each combination is counted once.',
    asks: {
      read: 'Are 1 + 2 and 2 + 1 the same?',
      budget: 'amount ≤ 5000, up to 300 coins. Table size?',
      observe: 'With coins [1, 2, 5] and amount 5, list the combinations.',
      brute: 'Counting every ordered sequence and dividing: why doesn\'t that work?',
      pattern: 'Which loop order counts each combination once?',
      watch: 'Watch one row per coin, each building on the row above.',
    },
    read: [
      {
        phrase: 'Order does not matter: `1 + 2` and `2 + 1` are the same combination',
        says: '1 + 2 and 2 + 1 count once. Putting the coins in the outer loop fixes an order (all 1s, then all 2s, …), so each combination can only be built one way.',
      },
      { phrase: 'with an unlimited supply of each', says: 'Within a coin\'s row, fill left to right so it can repeat.' },
      { phrase: 'If no combination works, return `0`', says: 'ways[0] = 1, everything else starts at 0.' },
    ],
    budget: {
      from: 'amount ≤ 5000, coins ≤ 300',
      rows: [['list every combination', 'exponential', 'bad', 'too many'], ['coins × amounts', '300 × 5000 = 1.5 × 10⁶', 'ok', 'fits']],
      aim: 'O(amount · coins)',
      note: 'One row of memory suffices.',
    },
    observe: [
      {
        title: 'Four combinations',
        text: 'Coins [1, 2, 5], amount 5: 5, 2 + 2 + 1, 2 + 1 + 1 + 1, 1 + 1 + 1 + 1 + 1. Four combinations; orders like 1 + 2 + 2 don\'t count again.',
        sketch: { kind: 'array', rows: [{ items: ['5', '2+2+1', '2+1+1+1', '1×5'] }] },
      },
      {
        title: 'Coins outside',
        text: 'With 1s only: 1 way for every amount. Adding 2s: ways[a] += ways[a − 2]. Adding 5: ways[5] += ways[0]. Total 4.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '1', items: [1, 1, 1, 1, 1, 1] },
            { label: '+2', items: [1, 1, 2, 2, 3, 3] },
            { label: '+5', items: [1, 1, 2, 2, 3, 4], marks: { '5': 'hit' } },
          ],
        },
      },
      {
        title: 'Swap the loops and you count orders',
        text: 'With amounts outside, 1 + 2 and 2 + 1 both get counted: that is Combination Sum IV.',
        sketch: { kind: 'array', rows: [{ items: ['coins outer: combinations', 'amounts outer: orders'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively choose how many of each coin to use, coin by coin, and count totals equal to amount.',
      cost: 'O(∏ (amount / c + 1))',
      waste: 'The ways to make each remaining amount with the remaining coins are recomputed many times.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: 'Unbounded knapsack count with coins outer, amounts inner (left to right): ways[a] += ways[a − c]. O(amount · coins).',
      not: [
        { id: 'backtracking', why: 'Listing combinations is exponential; counting is DP.' },
        { id: 'dp-linear', why: 'A single loop over amounts counts orders, not combinations.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[1, 2, 5], 5', input: { mode: 'ways', coins: [1, 2, 5], amount: 5 } },
        { label: '[2, 3], 7', input: { mode: 'ways', coins: [2, 3], amount: 7 } },
      ],
    },
    edges: ['Amount 0 → 1 (choose nothing).', 'Impossible: [2], 3 → 0.', '[10], 10 → 1.'],
  },

  'combination-sum-iv': {
    aha: 'Here order matters, so think about the last number of a sequence: any x in nums, preceded by any sequence that makes t − x. dp[t] = Σ dp[t − x], with the target in the outer loop. (Coins in the outer loop would count combinations instead: Coin Change II.)',
    asks: {
      read: 'Are (1, 2) and (2, 1) different here?',
      budget: 'target ≤ 1000, up to 200 numbers. Table size?',
      observe: 'With [1, 2, 3] and target 4, list the sequences ending in 1.',
      brute: 'Enumerating sequences: how many for target 4?',
      pattern: 'What does each sequence end with, and what comes before it?',
      watch: 'Watch each target add up the counts behind each last number.',
    },
    read: [
      {
        phrase: 'Different orders count as different sequences',
        says: '(1, 2) and (2, 1) count separately. Putting the target in the outer loop lets every number be the last one at every amount, so every order gets counted.',
      },
      { phrase: 'each value may be used any number of times', says: 'Unbounded: dp[t − x] can itself use x.' },
    ],
    budget: {
      from: 'target ≤ 1000, nums ≤ 200',
      rows: [['list every sequence', 'exponential', 'bad', 'too many'], ['target × nums', '1000 × 200 = 2 × 10⁵', 'ok', 'tiny']],
      aim: 'O(target · n)',
      note: 'Counts can overflow 32 bits in intermediate steps on some inputs; the answer fits.',
    },
    observe: [
      {
        title: 'Seven sequences',
        text: 'nums [1, 2, 3], target 4: (1,1,1,1), (1,1,2), (1,2,1), (2,1,1), (2,2), (1,3), (3,1). Seven sequences: orders count.',
        sketch: { kind: 'array', rows: [{ items: ['1111', '112', '121', '211', '22', '13', '31'] }] },
      },
      {
        title: 'Split by the last number',
        text: 'Ending in 1: dp[3] = 4. Ending in 2: dp[2] = 2. Ending in 3: dp[1] = 1. 4 + 2 + 1 = 7.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [1, 1, 2, 4, 7], marks: { '4': 'hit' } }] },
      },
      {
        title: 'Loop order decides',
        text: 'Target outside counts orders; numbers outside would count each multiset once.',
        sketch: { kind: 'array', rows: [{ items: ['target outer → orders', 'nums outer → combinations'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively choose the next number until the sum reaches target, counting successes.',
      cost: 'O(n^target)',
      waste: 'The number of ways to make each remaining sum is recomputed every time it is reached.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: 'dp[0] = 1; for t = 1..target: dp[t] = Σ dp[t − x] over x ≤ t. O(target · n).',
      not: [
        { id: 'backtracking', why: 'Listing sequences is exponential; counting is DP.' },
        { id: 'dp-made-easy', why: 'Climbing stairs is this with nums = [1, 2].' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[1, 2, 3], 4', input: { mode: 'combsum4', a: [1, 2, 3], target: 4 } },
        { label: '[2, 3], 7', input: { mode: 'combsum4', a: [2, 3], target: 7 } },
      ],
    },
    edges: ['Nothing fits: [9], 3 → 0.', 'Single number: [1], 3 → 1.', '[1, 2], 3 → 3 (stairs).'],
    why: 'Split by the last number: dp[t] = Σ dp[t − x] over every x ≤ t, with dp[0] = 1. Filling t = 1 … target in the outer loop lets each sequence end in any number. O(target · n).',
    not: { '1': [] },
  },

  'perfect-squares': {
    aha: 'The last square in a sum is some k² ≤ n; before it, the best for n − k². So dp[i] = 1 + min over squares of dp[i − k²]: Coin Change with the squares as coins. Every number is a sum of at most four squares.',
    asks: {
      read: 'Can a square repeat? Is an answer guaranteed?',
      budget: 'n ≤ 10⁴: how many squares up to n?',
      observe: 'Why is 12 = 4 + 4 + 4 better than 9 + 1 + 1 + 1?',
      brute: 'Trying every way to write n as a sum of squares: how many?',
      pattern: 'Which problem is this with the coins replaced by squares?',
      watch: 'Watch each number try every square as its last.',
    },
    read: [
      { phrase: 'The same square may be used more than once', says: 'Unbounded: squares are reusable coins.' },
      {
        phrase: 'Every number can be written as a sum of 1s, so an answer always exists',
        says: 'Every number is a sum of 1s, so every amount can be made: dp never stays at infinity, and no −1 case is needed.',
      },
    ],
    budget: {
      from: 'n ≤ 10⁴',
      rows: [['try every sum of squares', 'exponential', 'bad', 'impossible'], ['dp × squares', '10⁴ × 100 = 10⁶', 'ok', 'fits']],
      aim: 'O(n · √n)',
      note: 'Lagrange: the answer is always 1 to 4.',
    },
    observe: [
      {
        title: 'Greedy fails',
        text: 'For 12, taking the biggest square first gives 9 + 1 + 1 + 1: 4 squares. But 4 + 4 + 4 uses 3. Exactly the Coin Change trap, with squares as the coins.',
        sketch: { kind: 'array', rows: [{ items: ['9+1+1+1', '4+4+4'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
      {
        title: 'Coin Change with squares',
        text: 'Squares up to 12 are 1, 4, 9. The last square used is one of them: dp[12] = 1 + min(dp[11], dp[8], dp[3]) = 1 + min(3, 2, 3) = 3.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [0, 1, 2, 3, 1, 2, 3, 4, 2, 1, 2, 3, 3], marks: { '12': 'hit' } }] },
      },
      {
        title: 'At most four',
        text: 'Every positive integer is a sum of four squares (Lagrange), so the answer is 1, 2, 3 or 4.',
        sketch: { kind: 'array', rows: [{ items: ['1', '2', '3', '4'] }] },
      },
    ],
    brute: {
      idea: 'Recursively subtract every square ≤ n and take the fewest.',
      cost: 'O(√n^n)',
      waste: 'The best count for each smaller number is recomputed in every branch.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: 'Unbounded knapsack over squares: dp[i] = 1 + min dp[i − k²]. O(n · √n). Or BFS over remainders, or number theory.',
      not: [
        { id: 'math-for-interviews', why: 'Legendre\'s three-square theorem gives O(√n), beyond what is asked.' },
        { id: 'graph-traversal', why: 'BFS from n subtracting squares finds the fewest steps too.' },
      ],
    },
    watch: { viz: 'Dp1dViz', inputs: [{ label: 'n = 12', input: { mode: 'squares', n: 12 } }, { label: 'n = 13', input: { mode: 'squares', n: 13 } }] },
    edges: ['A perfect square: n = 16 → 1.', 'n = 13 → 2 (4 + 9).', 'n = 7 → 4 (4 + 1 + 1 + 1).'],
  },

  'ones-and-zeroes': {
    aha: 'A knapsack with two capacities. dp[z][o] = the most strings you can pick using at most z zeros and o ones. For each string, either skip it or take it: 1 + dp[z − its zeros][o − its ones]. Update the table from big budgets to small so each string is taken at most once.',
    asks: {
      read: 'Do the limits apply per string or to the chosen strings together?',
      budget: '600 strings, m, n ≤ 100. How big is the table?',
      observe: 'For ["10", "0001", "111001", "1", "0"] with m = 5, n = 3, which 4 strings fit?',
      brute: 'Trying every subset of strings: how many?',
      pattern: 'Knapsack has one capacity. What changes with two?',
      watch: 'Watch the budget table update once per string.',
    },
    read: [
      { phrase: 'at most `m` zeros and at most `n` ones', says: 'Two capacities: a 2-D knapsack table.' },
      { phrase: 'Each string can be chosen at most once', says: '0/1: update from high budgets to low.' },
    ],
    budget: {
      from: 'strings ≤ 600, m, n ≤ 100',
      rows: [['all subsets', '2⁶⁰⁰', 'bad', 'impossible'], ['strings × m × n', '6 × 10⁶', 'ok', 'fits']],
      aim: 'O(L · m · n)',
      note: 'Count zeros and ones of each string once.',
    },
    observe: [
      {
        title: 'Each string is an item with two weights',
        text: '"10": 1 zero, 1 one. "0001": 3 zeros, 1 one. "111001": 2 zeros, 4 ones (too many ones for n = 3).',
        sketch: { kind: 'array', rows: [{ items: ['10: 1/1', '0001: 3/1', '111001: 2/4', '1: 0/1', '0: 1/0'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'The best set',
        text: 'Choose "10", "0001", "1" and "0": 1 + 3 + 0 + 1 = 5 zeros and 1 + 1 + 1 + 0 = 3 ones, exactly the limits m = 5, n = 3. Four strings; adding "111001" would break the ones limit.',
        sketch: { kind: 'array', rows: [{ items: ['10', '0001', '1', '0'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
      },
      {
        title: 'High to low',
        text: 'Updating dp[z][o] from dp[z − z0][o − o1] in decreasing z and o reads values from before this string, so it is counted once.',
        sketch: { kind: 'array', rows: [{ items: ['z = m → z0', 'o = n → o1'] }] },
      },
    ],
    brute: {
      idea: 'Try every subset of strings and keep the largest one within both limits.',
      cost: 'O(2^L · L)',
      waste: 'Subsets with the same zero and one totals are interchangeable for the future; the table keeps only the best for each budget.',
    },
    pattern: {
      pick: 'dp-knapsack',
      why: '0/1 knapsack with two capacities: for each string, for z from m down, o from n down: dp[z][o] = max(dp[z][o], 1 + dp[z − z0][o − o1]). O(L · m · n).',
      not: [
        { id: 'greedy', why: 'Taking the shortest strings first can waste the scarcer character.' },
        { id: 'backtracking', why: 'Trying every subset is exponential; the reachable-sums table collapses subsets with the same sum.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: 'the example, m = 5, n = 3', input: { mode: 'ones', strs: ['10', '0001', '111001', '1', '0'], m: 5, n: 3 } },
        { label: '["10", "0", "1"], m = 1, n = 1', input: { mode: 'ones', strs: ['10', '0', '1'], m: 1, n: 1 } },
      ],
    },
    edges: ['["10", "0", "1"], m = 1, n = 1 → 2.', 'Nothing fits: ["00"], m = 1, n = 0 → 0.', 'Everything fits → the number of strings.'],
    not: { '1': [] },
  },
};
