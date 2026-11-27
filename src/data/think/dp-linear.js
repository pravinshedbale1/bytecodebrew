/** Practice thinking walkthroughs: dp-linear (format: src/data/think/index.js). */

export default {
  'house-robber': {
    aha: 'At each house there are only two options: skip it (keep the best so far) or rob it (its money plus the best up to two houses back). best(i) = max(best(i − 1), nums[i] + best(i − 2)), and only the last two answers need remembering.',
    asks: {
      observe: 'In [2, 1, 1, 2], does robbing every other house give the best total? What does?',
      pattern: 'The best total up to house i depends only on which two earlier answers?',
      read: 'Which sentence makes each choice affect the next one, and what does that say about a simple greedy?',
      budget: 'With 100 houses, how many rob/skip plans are there? What is the most you should spend per house?',
      brute: 'What is the simplest correct search, and which question does it answer over and over?',
      watch: 'For [2, 7, 9, 3, 1], at which houses will "rob" beat "skip"?',
    },
    read: [
      {
        phrase: 'You cannot rob two adjacent houses',
        says: 'Each choice limits the next one: decisions interact, so a simple greedy is suspicious.',
      },
      { phrase: 'Return the maximum amount of money', says: 'An optimisation over many possible plans: a dynamic programming candidate.' },
      { phrase: 'You can skip as many houses as you like', says: 'At every house the choice is binary: rob it or skip it.' },
    ],
    budget: {
      from: 'nums.length ≤ 100',
      n: 100,
      aim: 'O(n)',
      note: 'Trying every plan is up to 2¹⁰⁰: impossible. Any polynomial solution passes; the clean one is O(n).',
    },
    observe: [
      {
        title: 'Greedy fails',
        text: 'Taking every other house, or the biggest house first, can lose. In [2, 1, 1, 2] the best plan robs the two ends (4); alternating gives only 3.',
        sketch: {
          kind: 'array',
          rows: [{ items: [2, 1, 1, 2], marks: { '0': 'hit', '3': 'hit' }, tags: { '0': [['rob', 'success']], '3': [['rob', 'success']] } }],
          caption: 'best = 2 + 2 = 4, skipping two houses in a row',
        },
      },
      {
        title: 'At house i there are only two options',
        text: 'Skip it: the best is whatever was best up to house i − 1. Rob it: nums[i] plus the best up to house i − 2 (house i − 1 must be skipped).',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [2, 7, 9, 3, 1],
              marks: { '0': 'kept', '1': 'target', '2': 'cur' },
              tags: { '0': [['rob i', 'success']], '1': [['skip i', 'warn']], '2': [['i', 'accent']] },
            },
          ],
          caption: 'best(2) = max(best(1), 9 + best(0))',
        },
      },
      {
        title: 'Only the last two answers matter',
        text: 'best(i) uses only best(i − 1) and best(i − 2), so two variables replace the whole table: O(1) space.',
        sketch: { kind: 'array', rows: [{ label: 'best so far', items: [2, 7, 11, 11, 12], marks: { '3': 'kept', '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try both choices at every house (rob it and jump two ahead, or skip it), and take the better total.',
      cost: 'O(2ⁿ)',
      waste: '"The best from house i onwards" is solved again and again by different call paths.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'Overlapping subproblems ("best up to house i") with a choice that looks only one or two steps back: 1D DP, best(i) = max(best(i − 1), nums[i] + best(i − 2)).',
      not: [
        { id: 'greedy', why: 'No local rule is safe: [2, 1, 1, 2] breaks both "alternate" and "biggest first".' },
        { id: 'backtracking', why: 'Exploring every plan is correct but exponential; memoising it turns it into this DP.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[2, 7, 9, 3, 1]', input: { mode: 'robber', a: [2, 7, 9, 3, 1] } },
        { label: '[2, 1, 1, 2] (greedy fails)', input: { mode: 'robber', a: [2, 1, 1, 2] } },
      ],
    },
    edges: ['One house: [5] → 5.', 'Two houses: [2, 7] → 7.', 'All zeros: [0, 0, 0] → 0.'],
  },

  'house-robber-ii': {
    aha: 'In a circle the first and last houses are neighbours, so no plan robs both. Every valid plan therefore lives inside houses 0..n−2 or inside houses 1..n−1, both of which are ordinary lines. Run House Robber on each and take the better.',
    asks: {
      read: 'What changes from House Robber, exactly?',
      budget: 'Up to 100 houses. Is a second O(n) pass fine?',
      observe: 'In [2, 3, 2], why can\'t you take 2 + 2 = 4?',
      brute: 'Trying every set of non-adjacent houses around the circle: how many sets?',
      pattern: 'If you knew house 0 was skipped, which problem would be left?',
      watch: 'Watch two House Robber rows, one without each end.',
    },
    read: [
      {
        phrase: 'the first house and the last house are neighbours',
        says: 'They can\'t both be robbed: drop one end and the circle becomes a line.',
      },
      { phrase: 'You still cannot rob two adjacent houses', says: 'Inside each line, the usual skip-or-rob choice.' },
    ],
    budget: { from: 'houses ≤ 100', n: 100, aim: 'O(n)', note: 'Two linear passes, O(1) memory each.' },
    observe: [
      {
        title: 'The ends clash',
        text: '[2, 3, 2]: houses 0 and 2 are neighbours in the circle. The best is 3.',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 2], marks: { '0': 'bad', '1': 'hit', '2': 'bad' } }] },
      },
      {
        title: 'Cut the circle twice',
        text: 'Without the last house: a line [2, 3]. Without the first: [3, 2]. Any valid circle plan is a valid plan in one of them.',
        sketch: { kind: 'array', rows: [{ label: 'no last', items: [2, 3, '·'] }, { label: 'no first', items: ['·', 3, 2] }] },
      },
      {
        title: 'Take the better line',
        text: 'For [2, 3, 2, 5, 1]: without the last, 3 + 5 = 8; without the first, 3 + 5 = 8 too. Answer 8.',
        sketch: { kind: 'array', rows: [{ items: ['no last: 8', 'no first: 8', '→ 8'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try every subset of houses, keep those with no two neighbours around the circle, and take the largest sum.',
      cost: 'O(2ⁿ · n)',
      waste: 'Exponential; cutting the circle reduces it to two O(n) lines.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'max(rob(0..n−2), rob(1..n−1)) with the House Robber recurrence best[i] = max(best[i−1], best[i−2] + a[i]). O(n).',
      not: [
        { id: 'greedy', why: 'Alternating houses fails just as in the line version.' },
        { id: 'dp-state-machine', why: 'A "took the first house" flag works too; two passes are simpler.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[2, 3, 2, 5, 1]', input: { mode: 'robber2', a: [2, 3, 2, 5, 1] } },
        { label: '[1, 2, 3, 1]', input: { mode: 'robber2', a: [1, 2, 3, 1] } },
      ],
    },
    edges: ['One house: [5] → 5.', 'Two houses: [2, 7] → 7.', '[2, 3, 2] → 3.'],
  },

  'maximum-subarray': {
    aha: 'At each position, the best subarray ending here either extends the best one ending at the previous position, or starts fresh here, whichever is larger. A running sum that has gone negative only drags the next element down, so drop it (Kadane). The answer is the best value seen anywhere.',
    asks: {
      read: 'Must the subarray be non-empty? What if all numbers are negative?',
      budget: 'Up to 10⁵ numbers. Can you check every subarray?',
      observe: 'In [-2, 1, -3, 4, -1, 2, 1, -5, 4], when should the running sum restart?',
      brute: 'Summing every subarray: how many are there?',
      pattern: 'What is the best subarray that ends exactly at index i?',
      watch: 'Watch the running sum extend or restart.',
    },
    read: [
      { phrase: 'Return the largest sum of any non-empty contiguous subarray', says: 'Contiguous: one decision per position, extend or restart.' },
      { phrase: 'If every value is negative, the answer is the largest single value', says: 'Start the best from the first element, not from 0.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every subarray', 'n² / 2 = 5 × 10⁹', 'bad', 'too slow'], ['Kadane', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'One pass, two numbers.',
    },
    observe: [
      {
        title: 'A negative running sum is dead weight',
        text: 'Ending at index 2 the best is -2 (1 + -3). Adding 4 to it gives 2; starting fresh at 4 gives 4. Restart.',
        sketch: { kind: 'array', rows: [{ items: [-2, 1, -3, 4], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Extend while it helps',
        text: 'From 4: -1, 2, 1 keep the running sum at 3, 5, 6. The best so far reaches 6 at index 6.',
        sketch: { kind: 'array', rows: [{ label: 'ending here', items: [-2, 1, -2, 4, 3, 5, 6, 1, 5], marks: { '6': 'hit' } }] },
      },
      {
        title: 'Track the best anywhere',
        text: 'The running value drops after -5, but the best seen (6) is remembered.',
        sketch: { kind: 'array', rows: [{ items: ['best = 6', '[4, −1, 2, 1]'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every start, extend to every end, keeping a running sum, and track the largest.',
      cost: 'O(n²)',
      waste: 'Each start rebuilds sums that the previous start already explored.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'Kadane: endingHere = max(a[i], endingHere + a[i]); best = max(best, endingHere). O(n), O(1).',
      not: [
        { id: 'prefix-sums', why: 'Best = max over j of prefix[j] − min earlier prefix: the same idea seen through prefix sums.' },
        { id: 'sliding-window', why: 'Negative numbers make "shrink when bad" windows unreliable.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', input: { mode: 'kadane', a: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } },
        { label: 'all negative', input: { mode: 'kadane', a: [-3, -1, -2] } },
      ],
    },
    edges: ['One element: [1] → 1.', 'All negative: [-3, -1, -2] → −1.', 'Whole array best: [5, 4, -1, 7, 8] → 23.'],
  },

  'maximum-product-subarray': {
    aha: 'For sums, keep the best value ending here. For products a negative number flips signs: the most negative product so far becomes the most positive after another negative. So keep both the largest and the smallest product ending at each position, and update both from three candidates.',
    asks: {
      read: 'What does a negative number do to a product?',
      budget: 'Up to 2 × 10⁴ numbers. Every subarray?',
      observe: 'In [2, 3, -2, 4, -1], what is the best product, and which -1 makes it possible?',
      brute: 'Multiplying every subarray: how many products?',
      pattern: 'Why isn\'t "largest product ending here" enough on its own?',
      watch: 'Watch max and min swap roles at a negative number.',
    },
    read: [
      { phrase: 'Return the largest product of any non-empty contiguous subarray', says: 'Contiguous: one running decision per position.' },
      { phrase: 'the smallest product so far can become the largest after another negative', says: 'Track the min as well as the max.' },
    ],
    budget: { from: 'n ≤ 2 × 10⁴', n: 20000, aim: 'O(n)', note: 'Three running values.' },
    observe: [
      {
        title: 'Negatives flip the order',
        text: 'At index 2 (-2): max ending here is -2, min is 6 × -2 = -12. Then 4: max 4, min -48. Then -1: -48 × -1 = 48 becomes the max.',
        sketch: { kind: 'array', rows: [{ label: 'max', items: [2, 6, -2, 4, 48], marks: { '4': 'hit' } }, { label: 'min', items: [2, 3, -12, -48, -4] }] },
      },
      {
        title: 'Three candidates',
        text: 'The best product ending at i either starts fresh at a[i], or extends a product ending at i − 1. Extending the largest helps when a[i] > 0; extending the smallest (most negative) helps when a[i] < 0. So the new max and min are the max and min of: a[i], max × a[i], min × a[i].',
        sketch: { kind: 'array', rows: [{ items: ['a[i]', 'max·a[i]', 'min·a[i]'] }] },
      },
      {
        title: 'Zero resets',
        text: 'A 0 makes both max and min 0; the next element starts fresh as a candidate on its own.',
        sketch: { kind: 'array', rows: [{ items: [-2, 0, -1], marks: { '1': 'hit' } }], caption: 'answer 0' },
      },
    ],
    brute: {
      idea: 'For every start, multiply forward to every end and track the largest product.',
      cost: 'O(n²)',
      waste: 'Each start redoes products the previous start already computed.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'Kadane with two states: hi and lo ending here from {a[i], hi·a[i], lo·a[i]}; best = max(best, hi). O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix products break on zeros and need extra care; the two-state DP handles them.' },
        { id: 'sliding-window', why: 'Sign changes make window rules unreliable.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[2, 3, -2, 4, -1]', input: { mode: 'product', a: [2, 3, -2, 4, -1] } },
        { label: '[-2, 0, -1]', input: { mode: 'product', a: [-2, 0, -1] } },
      ],
    },
    edges: ['One element: [-3] → −3.', 'Zeros: [-2, 0, -1] → 0.', 'Two negatives: [-2, -3] → 6.'],
    not: { '1': [] },
  },

  'decode-ways': {
    aha: 'The last piece of any decoding is one digit (1–9) or two digits (10–26). So the ways to decode the first i characters are the ways for i − 1 (if the last digit is valid alone) plus the ways for i − 2 (if the last two form 10–26). Zeros are the trap: "0" alone is never a letter.',
    asks: {
      read: 'Which pieces are valid codes, and what about leading zeros?',
      budget: 'Up to 100 digits. How many decodings could there be?',
      observe: 'Why does "226" have 3 decodings but "06" has 0?',
      brute: 'Trying every way to cut the string: how many cut patterns?',
      pattern: 'Look at the last piece of a decoding. How many kinds are there?',
      watch: 'Watch each prefix add up the one-digit and two-digit cases.',
    },
    read: [
      {
        phrase: 'A piece with a leading zero, such as `"06"`, is not a valid code',
        says: 'Two-digit pieces must be 10–26; a single "0" is never valid.',
      },
      {
        phrase: 'If the string cannot be decoded at all, return `0`',
        says: 'Return 0 when no decoding exists. In the DP, a 0 at some prefix spreads: a later prefix can only build on earlier counts, so a dead prefix stays dead.',
      },
    ],
    budget: {
      from: 'length ≤ 100',
      rows: [['every cut pattern', '2⁹⁹', 'bad', 'impossible'], ['dp over prefixes', '100 steps', 'ok', 'tiny']],
      aim: 'O(n)',
      note: 'Two variables suffice.',
    },
    observe: [
      {
        title: 'Two kinds of last piece',
        text: '"226": last piece "6" → decodings of "22" (2); last piece "26" → decodings of "2" (1). Total 3.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [1, 1, 2, 3], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Zero needs a partner',
        text: 'In "22603", the "0" can only be part of "20". The 6 before it can\'t pair with 0 ("60" is too big), so those branches die.',
        sketch: { kind: 'array', rows: [{ items: ['2', '2', '6', '0', '3'], marks: { '3': 'bad' } }] },
      },
      {
        title: 'Zero ways is final',
        text: '"06": "0" alone isn\'t a letter and "06" has a leading zero. dp = 0, and nothing after can rescue it.',
        sketch: { kind: 'array', rows: [{ items: ['"0" ✗', '"06" ✗', '→ 0'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try a one-digit and a two-digit first piece and count completions.',
      cost: 'O(2ⁿ)',
      waste: 'The count for each suffix is recomputed in every branch that reaches it.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'dp[i] = (s[i−1] ≠ "0" ? dp[i−1]) + (10 ≤ s[i−2..i−1] ≤ 26 ? dp[i−2]), dp[0] = 1. O(n), two variables.',
      not: [
        { id: 'backtracking', why: 'Listing decodings is backtracking; counting them is DP.' },
        { id: 'dp-made-easy', why: 'The same two-back recurrence as climbing stairs, with validity conditions on each step.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '"22603"', input: { mode: 'decode', s: '22603' } },
        { label: '"226"', input: { mode: 'decode', s: '226' } },
        { label: '"06"', input: { mode: 'decode', s: '06' } },
      ],
    },
    edges: ['Leading zero: "06" → 0.', 'One digit: "7" → 1.', '"10" → 1 (only "J").'],
  },

  'word-break': {
    aha: 'Let ok[i] mean "the first i letters can be split into words". The last word of such a split ends at i and starts at some j; so ok[i] is true when some ok[j] is true and s[j..i) is in the dictionary. Fill from ok[0] = true.',
    asks: {
      read: 'Can a word be reused? Must the words cover all of s?',
      budget: 's ≤ 300, dictionary ≤ 1000 words of ≤ 20 letters. Which loops?',
      observe: 'For "applepenapple", which prefixes can be split?',
      brute: 'Trying every way to cut s: why does it blow up?',
      pattern: 'What do you need to know about the prefix before the last word?',
      watch: 'Watch each position look back for a word that ends there.',
    },
    read: [
      { phrase: 'The same dictionary word may be used many times', says: 'No used-set; the dictionary is a lookup.' },
      {
        phrase: 'The words must cover `s` exactly',
        says: 'Every letter must belong to some word, so the answer is ok[n]: "the whole string splits", not just some prefix.',
      },
    ],
    budget: {
      from: 's ≤ 300, words ≤ 20 letters',
      rows: [['every cut pattern', '2²⁹⁹', 'bad', 'impossible'], ['ok[i] over n · 20 starts', '6000 substring lookups', 'ok', 'fits']],
      aim: 'O(n · L · L)',
      note: 'Only look back as far as the longest word.',
    },
    observe: [
      {
        title: 'Prefixes that split',
        text: '"applepenapple": ok[5] ("apple"), ok[8] ("apple" + "pen"), ok[13] (+ "apple"). Everything else is false.',
        sketch: { kind: 'array', rows: [{ items: ['ok[0]', 'ok[5]', 'ok[8]', 'ok[13]'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Look back for the last word',
        text: 'ok[13]: the last word could be "apple" (from 8). ok[8] is true, so ok[13] is true.',
        sketch: { kind: 'array', rows: [{ items: ['ok[8] = T', '"apple" = s[8..13)', 'ok[13] = T'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Overlapping cuts repeat',
        text: 'Plain recursion re-asks "can the suffix from 8 split?" from every branch that reaches 8. The table answers it once.',
        sketch: { kind: 'array', rows: [{ items: ['asked many times', '→ stored once'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try every dictionary word as the first word and recurse on the rest.',
      cost: 'O(2ⁿ)',
      waste: 'The same suffix is re-solved from every branch that reaches it ("aaaa…b" is the classic blow-up).',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'ok[i] = any j < i with ok[j] and s[j..i) a word; ok[0] = true; answer ok[n]. O(n² · L) or O(n · maxLen · L).',
      not: [
        { id: 'backtracking', why: 'Word Break II lists sentences with backtracking; yes/no needs only DP.' },
        { id: 'tries', why: 'A trie speeds up the lookups; the DP is the same.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '"applepenapple"', input: { mode: 'wordbreak', s: 'applepenapple', words: ['apple', 'pen'] } },
        { label: '"catsandog"', input: { mode: 'wordbreak', s: 'catsandog', words: ['cats', 'dog', 'sand', 'and', 'cat'] } },
      ],
    },
    edges: ['Reused word: "aaaa", ["a"] → true.', 'Leftover letters: "catsandog" → false.', 'The whole string is a word: "pen", ["pen"] → true.'],
  },

  'longest-increasing-subsequence': {
    aha: 'Let dp[i] be the length of the longest increasing subsequence that ends with a[i]. It is 1 plus the largest dp[j] over earlier j with a[j] < a[i] (or 1 if none). The answer is the largest dp. Patience sorting with binary search brings it to O(n log n).',
    asks: {
      read: 'Strictly increasing? Must the elements be adjacent?',
      budget: 'n ≤ 2500. Is O(n²) fine?',
      observe: 'In [10, 9, 2, 5, 3, 7, 101, 18], what is the longest run ending at 7?',
      brute: 'Checking every subsequence: how many?',
      pattern: 'If you know the best run ending at each earlier element, how do you extend to a[i]?',
      watch: 'Watch each element look back for smaller values.',
    },
    read: [
      { phrase: 'the longest strictly increasing subsequence', says: 'Equal values don\'t extend a run: a[j] < a[i].' },
      { phrase: 'A subsequence keeps the original order but may skip elements', says: 'Look back at every earlier element, not just the neighbour.' },
      {
        phrase: 'an O(n log n) solution exists',
        says: 'Patience sorting: keep the smallest tail of each length, binary search to place each value.',
      },
    ],
    budget: {
      from: 'n ≤ 2500',
      rows: [['O(n²) DP', '6 × 10⁶', 'ok', 'fits'], ['patience sorting', 'n log n', 'ok', 'fits']],
      aim: 'O(n²) or O(n log n)',
      note: 'Either passes here.',
    },
    observe: [
      {
        title: 'End with a[i]',
        text: 'Ending at 7: earlier smaller values are 2 (len 1), 5 (len 2), 3 (len 2). Best: 2 + 1 = 3 ([2, 5, 7] or [2, 3, 7]).',
        sketch: { kind: 'array', rows: [{ label: 'a', items: [10, 9, 2, 5, 3, 7] }, { label: 'dp', items: [1, 1, 1, 2, 2, 3], marks: { '5': 'hit' } }] },
      },
      {
        title: 'The answer can end anywhere',
        text: '101 and 18 both reach length 4 ([2, 5, 7, 101] and [2, 5, 7, 18]). dp[i] is the best run ending at i, and the overall best can end anywhere, so the answer is max(dp), not dp[n − 1].',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [1, 1, 1, 2, 2, 3, 4, 4], marks: { '6': 'hit', '7': 'hit' } }] },
      },
      {
        title: 'Faster with tails',
        text: 'Keep tails[k] = the smallest possible last value of a run of length k + 1. Each new value replaces the first tail ≥ it (binary search) or extends the list.',
        sketch: { kind: 'array', rows: [{ label: 'tails', items: [2, 3, 7, 18] }] },
      },
    ],
    brute: {
      idea: 'Enumerate all 2ⁿ subsequences and keep the longest strictly increasing one.',
      cost: 'O(2ⁿ · n)',
      waste: 'The best run ending at each element is recomputed in every subsequence that contains it.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'dp[i] = 1 + max dp[j] (j < i, a[j] < a[i]); answer max(dp). O(n²). Patience sorting: O(n log n).',
      not: [
        { id: 'binary-search', why: 'The O(n log n) version binary-searches tails, on top of the same idea.' },
        { id: 'monotonic-stack', why: 'Stacks pop elements; LIS must keep options for later.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[10, 9, 2, 5, 3, 7, 101, 18]', input: { mode: 'lis', a: [10, 9, 2, 5, 3, 7, 101, 18] } },
        { label: '[0, 1, 0, 3, 2, 3]', input: { mode: 'lis', a: [0, 1, 0, 3, 2, 3] } },
      ],
    },
    edges: ['All equal: [7, 7, 7] → 1.', 'Already sorted: [1, 2, 3] → 3.', '[0, 1, 0, 3, 2, 3] → 4.'],
  },

  'number-of-longest-increasing-subsequence': {
    aha: 'Run the LIS DP but keep two numbers per element: len[i], the longest run ending at a[i], and count[i], how many runs reach that length. An earlier smaller a[j] that gives a longer run replaces count[i] with count[j]; one that ties adds count[j]. Sum the counts of every position whose len is the maximum.',
    asks: {
      read: 'Are runs counted by values or by positions?',
      budget: 'n ≤ 2000. O(n²)?',
      observe: 'In [1, 3, 5, 4, 7], which two runs have length 4?',
      brute: 'Enumerating every increasing subsequence: how many?',
      pattern: 'What extra number per element lets the LIS DP count?',
      watch: 'Watch counts take over on a longer run and add up on a tie.',
    },
    read: [
      {
        phrase: 'Return how many strictly increasing subsequences of `nums` have the maximum possible length',
        says: 'Count only runs of the maximum length.',
      },
      { phrase: 'Subsequences are counted by the positions they use', says: '[2, 2, 2] has 3 runs of length 1: count positions.' },
    ],
    budget: { from: 'n ≤ 2000', n: 2000, aim: 'O(n²)', note: '4 × 10⁶ pairs.' },
    observe: [
      {
        title: 'Two runs to the end',
        text: '[1, 3, 5, 7] and [1, 3, 4, 7] both have length 4, and no run is longer. They differ only in the third element, so counting them needs counts that merge where runs meet (at 7).',
        sketch: { kind: 'array', rows: [{ items: ['1 3 5 7', '1 3 4 7'], marks: { '0': 'hit', '1': 'hit' } }] },
      },
      {
        title: 'Ties add counts',
        text: 'At 7: from 5 (len 3, count 1) and from 4 (len 3, count 1) both give length 4, so count[7] = 1 + 1 = 2.',
        sketch: { kind: 'array', rows: [{ label: 'len', items: [1, 2, 3, 3, 4] }, { label: 'count', items: [1, 1, 1, 1, 2], marks: { '4': 'hit' } }] },
      },
      {
        title: 'Longer replaces',
        text: 'If some j gives a longer run than the current best, the count resets to count[j]: the shorter runs no longer matter.',
        sketch: { kind: 'array', rows: [{ items: ['longer → count = count[j]', 'equal → count += count[j]'] }] },
      },
    ],
    brute: {
      idea: 'Enumerate all 2ⁿ subsequences, keep the strictly increasing ones, and count those of the maximum length.',
      cost: 'O(2ⁿ · n)',
      waste: 'Exponentially many subsequences; the counts build up from shared prefixes.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'LIS DP with (len, count) per element: longer → take count[j], equal → add count[j]; answer = sum of counts at max len. O(n²).',
      not: [
        { id: 'binary-search', why: 'The patience version can count too, but it is much harder to get right.' },
        { id: 'backtracking', why: 'Listing runs is exponential; counting is DP.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[1, 3, 5, 4, 7]', input: { mode: 'nlis', a: [1, 3, 5, 4, 7] } },
        { label: '[2, 2, 2, 2, 2]', input: { mode: 'nlis', a: [2, 2, 2, 2, 2] } },
      ],
    },
    edges: ['All equal: [2, 2, 2, 2, 2] → 5.', 'Strictly increasing: [1, 2, 3] → 1.', '[1, 3, 5, 4, 7] → 2.'],
    not: { '1': [] },
  },

  'best-time-to-buy-and-sell-stock-with-cooldown': {
    aha: 'Each day you are in one of three states: holding a share, just sold (cooldown tomorrow), or resting with no share. Track the best profit for each state day by day. You may buy only from rest, never the day after selling.',
    asks: {
      read: 'What does the cooldown forbid exactly?',
      budget: 'Up to 5000 days. How many states per day?',
      observe: 'For [1, 2, 3, 0, 2], why does buying again at 0 require skipping a day after selling?',
      brute: 'Trying every buy/sell/wait sequence: how many?',
      pattern: 'What do you need to know about yesterday to decide today?',
      watch: 'Watch the three states update each day.',
    },
    read: [
      {
        phrase: 'after you sell you must wait one day (a cooldown) before you can buy again',
        says: 'A "sold" state that can only move to "rest" tomorrow.',
      },
      {
        phrase: 'holding at most one share at a time',
        says: 'At most one share means each day you either hold one or you don\'t; the cooldown splits "don\'t" into "just sold" and "resting".',
      },
    ],
    budget: { from: 'days ≤ 5000', n: 5000, aim: 'O(n)', note: 'Three numbers per day, O(1) memory.' },
    observe: [
      {
        title: 'Three states',
        text: 'hold: own a share. sold: sold today. rest: no share, free to buy tomorrow.',
        sketch: { kind: 'array', rows: [{ items: ['hold', 'sold', 'rest'] }] },
      },
      {
        title: 'Transitions',
        text: 'hold = max(hold, rest − price) (keep, or buy). sold = hold + price. rest = max(rest, yesterday\'s sold).',
        sketch: { kind: 'array', rows: [{ items: ['rest → hold (buy)', 'hold → sold', 'sold → rest'] }] },
      },
      {
        title: 'Best plan: 3',
        text: 'Buy at 1, sell at 2 (+1), cool down on day 2 (price 3), buy at 0, sell at 2 (+2): total 3. Holding from 1 to 3 gives only 2, and selling at 3 then buying at 0 is blocked by the cooldown.',
        sketch: { kind: 'array', rows: [{ items: ['buy 1', 'sell 2', 'cool', 'buy 0', 'sell 2'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try buy, sell or wait on every day, respecting the cooldown, and keep the best profit.',
      cost: 'O(3ⁿ)',
      waste: 'The best profit from day i in a given state is recomputed by every path that reaches it.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'A day-by-day DP over three states (hold, sold, rest); answer max(sold, rest). O(n), O(1).',
      not: [
        { id: 'dp-state-machine', why: 'This is exactly a state-machine DP; the lesson there generalises it.' },
        { id: 'greedy', why: 'Taking every rise fails: the cooldown makes some trades block better ones.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [{ label: '[1, 2, 3, 0, 2]', input: { mode: 'stock', prices: [1, 2, 3, 0, 2] } }, { label: '[1]', input: { mode: 'stock', prices: [1] } }],
    },
    edges: ['One day: [1] → 0.', 'Falling prices: [5, 4, 3] → 0.', '[1, 2, 3, 0, 2] → 3.'],
  },

  'integer-break': {
    aha: 'Let dp[i] be the best product from splitting i into at least two parts. Choose the first part j; the rest i − j can stay whole or be split further, whichever is bigger, so dp[i] = max over j of max(j, dp[j]) · max(i − j, dp[i − j]). (The math answer: use as many 3s as possible.)',
    asks: {
      read: 'How many parts at least? Does 1 help?',
      budget: 'n ≤ 58. Is O(n²) fine?',
      observe: 'Why is 10 = 3 + 3 + 4 better than 5 + 5?',
      brute: 'Trying every way to write n as a sum: how many?',
      pattern: 'After cutting off a first part, what is left to decide?',
      watch: 'Watch each number pick its best cut.',
    },
    read: [
      { phrase: 'into the sum of **at least two** positive integers', says: 'dp[i] must split i; but a part inside may stay whole: max(j, dp[j]).' },
      {
        phrase: '10 = 3 + 3 + 4 gives 3 × 3 × 4 = 36',
        says: 'The example splits 10 into 3s and a 4: a strong hint that small parts (and especially 3s) maximise the product.',
      },
    ],
    budget: {
      from: 'n ≤ 58',
      rows: [['every partition', 'p(58) ≈ 7 × 10⁵', 'ok', 'fits, wasteful'], ['dp over i', '58² / 2', 'ok', 'tiny']],
      aim: 'O(n²)',
      note: 'O(1) with the 3s rule.',
    },
    observe: [
      {
        title: 'Keep or split each part',
        text: 'For 6, cut 3 + 3: keep both whole (3 > dp[3] = 2): 9. Splitting a 3 into 1 + 2 only shrinks it.',
        sketch: { kind: 'array', rows: [{ items: ['3 whole: 3', '3 split: 2', 'keep'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Small parts win, but not 1s',
        text: '10 = 5 + 5 → 25. 3 + 3 + 4 → 36. 1s are useless: multiplying by 1 wastes a unit.',
        sketch: { kind: 'array', rows: [{ items: ['5+5: 25', '3+3+4: 36'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'The table',
        text: 'dp for n = 2 … 10: 1, 2, 4, 6, 9, 12, 18, 27, 36. From 5 on, each value is 3 × an earlier one (dp[8] = 18 = 3 × 6): taking out a 3 is always best.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [1, 2, 4, 6, 9, 12, 18, 27, 36], marks: { '8': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try every first part and every split of the rest, taking the largest product.',
      cost: 'O(2ⁿ)',
      waste: 'The best split of each smaller number is recomputed many times.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'dp[i] = max over j of max(j, dp[j]) · max(i − j, dp[i − j]). O(n²). Math: 3s, with a 4 instead of 3 + 1.',
      not: [
        { id: 'math-for-interviews', why: 'The 3s rule gives O(1); the DP shows why without the proof.' },
        { id: 'dp-knapsack', why: 'An unbounded knapsack over part sizes works too, with a product instead of a sum.' },
      ],
    },
    watch: { viz: 'Dp1dViz', inputs: [{ label: 'n = 10', input: { mode: 'intbreak', n: 10 } }, { label: 'n = 4', input: { mode: 'intbreak', n: 4 } }] },
    edges: ['n = 2 → 1 (1 + 1).', 'n = 3 → 2 (1 + 2).', 'n = 4 → 4 (2 + 2).'],
  },

  'maximum-sum-circular-subarray': {
    aha: 'The best subarray either sits inside the array or wraps around the end. A wrapping one is everything except some middle part, so its sum is total − (the smallest middle sum). Run Kadane for the largest and the smallest sum at once. Careful: if every number is negative, total − minSum would be an empty array.',
    asks: {
      read: 'What does wrapping around mean, and can an element be used twice?',
      budget: '3 × 10⁴ numbers. Doubling the array and searching windows?',
      observe: 'In [5, -3, 5], why is the answer 10?',
      brute: 'Trying every start and every length around the circle: how many?',
      pattern: 'What is left of the array when you remove a wrapping subarray?',
      watch: 'Watch the max and min Kadane rows fill together.',
    },
    read: [
      { phrase: 'A subarray may wrap around the end', says: 'Either the plain best, or total − the worst middle part.' },
      {
        phrase: 'Return the largest possible sum of a **non-empty** subarray',
        says: 'All negative → the wrap formula would give 0 (empty): return the plain maximum.',
      },
    ],
    budget: {
      from: 'n ≤ 3 × 10⁴',
      rows: [['every start and length', 'n² = 9 × 10⁸', 'bad', 'too slow'], ['two Kadanes', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'One pass computing four numbers.',
    },
    observe: [
      {
        title: 'The wrap is total minus a middle',
        text: '[5, -3, 5]: taking both 5s means leaving out the middle -3. total 7 − (−3) = 10.',
        sketch: { kind: 'array', rows: [{ items: [5, -3, 5], marks: { '0': 'hit', '1': 'bad', '2': 'hit' } }] },
      },
      {
        title: 'Run both Kadanes',
        text: 'maxEnd keeps the best sum ending here, minEnd the worst. Track maxSum and minSum over all positions.',
        sketch: { kind: 'array', rows: [{ items: ['maxSum', 'minSum', 'total'] }] },
      },
      {
        title: 'All negative',
        text: '[-3, -2, -3]: minSum = total, so total − minSum = 0, an empty array. Return maxSum = −2 instead.',
        sketch: { kind: 'array', rows: [{ items: ['total − min = 0 ✗', 'maxSum = −2 ✓'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every start position, extend around the circle up to n elements and track the largest sum.',
      cost: 'O(n²)',
      waste: 'Sums are rebuilt from every start; the complement trick needs one pass.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'Kadane for max and min; answer = maxSum < 0 ? maxSum : max(maxSum, total − minSum). O(n).',
      not: [
        { id: 'sliding-window', why: 'A window over the doubled array needs a monotonic deque of prefix sums: heavier.' },
        { id: 'prefix-sums', why: 'Prefix sums work with a deque, but the complement trick is simpler.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[5, -3, -2, 6, -1, 4]', input: { mode: 'circular', a: [5, -3, -2, 6, -1, 4] } },
        { label: '[5, -3, 5]', input: { mode: 'circular', a: [5, -3, 5] } },
        { label: 'all negative', input: { mode: 'circular', a: [-3, -2, -3] } },
      ],
    },
    edges: ['[5, -3, 5] → 10.', 'All negative: [-3, -2, -3] → −2.', 'No wrap needed: [1, -2, 3, -2] → 3.'],
  },

  'longest-turbulent-subarray': {
    aha: 'A turbulent run alternates up and down. Track two lengths ending at each position: "up" (the last step went up) and "down". A rise extends a run whose last step was a fall, and a fall extends one whose last step was a rise. Equal neighbours reset both to 1.',
    asks: {
      read: 'What breaks turbulence?',
      budget: '4 × 10⁴ numbers. One pass?',
      observe: 'In [9, 4, 2, 10, 7, 8, 8, 1, 9], where is the longest zig-zag?',
      brute: 'Checking every subarray: how many?',
      pattern: 'What does a rise need to know about the previous step?',
      watch: 'Watch up and down hand the length back and forth.',
    },
    read: [
      { phrase: 'the comparison sign flips between each adjacent pair', says: 'Each step must go the opposite way from the one before.' },
      {
        phrase: 'Equal neighbours break turbulence',
        says: 'Equal neighbours are neither up nor down, so no run can pass through them: both lengths reset to 1.',
      },
      {
        phrase: 'A single element counts, with length 1',
        says: 'One element is already turbulent, so both running lengths start at 1, and a reset goes back to 1, not 0.',
      },
    ],
    budget: { from: 'n ≤ 4 × 10⁴', n: 40000, aim: 'O(n)', note: 'Two numbers.' },
    observe: [
      {
        title: 'Alternate',
        text: 'From index 1: 4 > 2 < 10 > 7 < 8. The steps go down, up, down, up, so the run 4, 2, 10, 7, 8 has length 5. The next step (8, 8) breaks it.',
        sketch: { kind: 'array', rows: [{ items: [9, 4, 2, 10, 7, 8, 8, 1, 9], marks: { '1': 'hit', '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit' } }] },
      },
      {
        title: 'Swap the lengths',
        text: 'After a rise: up = down + 1, down = 1. After a fall: down = up + 1, up = 1.',
        sketch: { kind: 'array', rows: [{ label: 'up', items: [1, 1, 1, 3, 1, 5, 1, 1, 3] }, { label: 'down', items: [1, 2, 2, 1, 4, 1, 1, 2, 1] }] },
      },
      {
        title: 'Equality resets',
        text: '8, 8 is neither a rise nor a fall, so no run can continue through it: both lengths go back to 1, and a new run starts at the second 8.',
        sketch: { kind: 'array', rows: [{ items: [8, 8, '→ 1'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'For every subarray, check that the comparison signs alternate, and keep the longest.',
      cost: 'O(n³)',
      waste: 'Each subarray rechecks steps that its prefix already checked.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'Two running lengths (up, down) updated per step; best = max. O(n), O(1).',
      not: [
        { id: 'sliding-window', why: 'A window that restarts on a bad step also works; the two-state DP is cleaner.' },
        { id: 'dp-state-machine', why: 'Up/down is a two-state machine.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[9, 4, 2, 10, 7, 8, 8, 1, 9]', input: { mode: 'turbulent', a: [9, 4, 2, 10, 7, 8, 8, 1, 9] } },
        { label: '[4, 8, 12, 16]', input: { mode: 'turbulent', a: [4, 8, 12, 16] } },
      ],
    },
    edges: ['One element: [100] → 1.', 'Always rising: [4, 8, 12, 16] → 2.', 'All equal: [5, 5, 5] → 1.'],
    why: 'Keep two running lengths: up (last step rose) and down (last step fell). A rise sets up = down + 1, a fall sets down = up + 1, equal resets both; the answer is the largest seen. O(n) time, O(1) space.',
    not: { '1': [] },
  },

  'russian-doll-envelopes': {
    aha: 'Sort by width. Then a chain of nested envelopes is an increasing run of heights: LIS. The trick is the tie-break: when widths are equal, sort heights descending, so two envelopes of the same width can never both appear in an increasing run.',
    asks: {
      read: 'Does an envelope fit when one side is equal?',
      budget: '10⁵ envelopes. Which LIS version?',
      observe: 'After sorting [[5,4],[6,4],[6,7],[2,3]] by width, which heights form the chain?',
      brute: 'Trying every subset in every order: how many?',
      pattern: 'Once widths are sorted, what is left to check?',
      watch: 'Watch the LIS on heights after the special sort.',
    },
    read: [
      { phrase: 'both its width and its height are strictly smaller', says: 'Equal widths can\'t nest: handle ties in the sort.' },
      { phrase: 'Envelopes cannot be rotated', says: 'Width stays width, height stays height.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['O(n²) LIS', '10¹⁰', 'bad', 'too slow'], ['sort + patience LIS', 'n log n', 'ok', 'fits']],
      aim: 'O(n log n)',
      note: 'The O(n²) table shows the idea on small inputs.',
    },
    observe: [
      {
        title: 'Sort by width',
        text: '[2,3], [5,4], [6,7], [6,4] after sorting with heights descending on ties.',
        sketch: { kind: 'array', rows: [{ items: ['2×3', '5×4', '6×7', '6×4'] }] },
      },
      {
        title: 'Why descending on ties',
        text: 'If [6,4] came before [6,7], heights 4 → 7 would look increasing and nest two envelopes of the same width. Descending heights prevent that.',
        sketch: { kind: 'array', rows: [{ items: ['6×4 then 6×7 ✗', '6×7 then 6×4 ✓'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
      {
        title: 'LIS on heights',
        text: 'Heights 3, 4, 7, 4: the longest increasing run is 3, 4, 7: three envelopes.',
        sketch: { kind: 'array', rows: [{ label: 'h', items: [3, 4, 7, 4], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Sort by width, then for every envelope take 1 + the best chain of an earlier envelope that is smaller in both dimensions (O(n²)).',
      cost: 'O(n²)',
      waste: 'Correct but 10¹⁰ comparisons at the limit; patience sorting on heights is O(n log n).',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'Sort (width ↑, height ↓ on ties), then LIS on heights with patience sorting. O(n log n).',
      not: [
        { id: 'sorting-and-selection', why: 'The sort with its tie-break is half the trick; the rest is LIS.' },
        { id: 'binary-search', why: 'Binary search powers the fast LIS.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: 'six envelopes', input: { mode: 'envelopes', env: [[5, 4], [6, 4], [6, 7], [2, 3], [7, 8], [3, 5]] } },
        { label: 'the example', input: { mode: 'envelopes', env: [[5, 4], [6, 4], [6, 7], [2, 3]] } },
      ],
    },
    edges: ['All equal: [[1,1],[1,1]] → 1.', 'Same width: [[2,3],[2,5]] → 1.', 'The example → 3.'],
    not: { '1': [] },
  },

  'stone-game-iii': {
    aha: 'Let dp[i] be how far ahead the player to move can finish when stones i onward remain. Taking k stones (1, 2 or 3) gains their sum, and then the opponent moves with dp[i + k] in their favour. So dp[i] = max over k of (sum of those k) − dp[i + k]. Fill from the end; dp[0] > 0 means Alice wins.',
    asks: {
      read: 'Can values be negative? What decides the winner?',
      budget: '5 × 10⁴ stones. Can you explore the game tree?',
      observe: 'With [1, 2, 3, 7], why can\'t Alice win?',
      brute: 'Minimax over every sequence of moves: how many?',
      pattern: 'How do you score a position for the player who must move?',
      watch: 'Watch the table fill from the last stone backwards.',
    },
    read: [
      { phrase: 'the player takes **1, 2 or 3** stones from the front', says: 'Three choices; the rest is the same game for the other player.' },
      { phrase: 'values can be negative', says: 'Sometimes taking more is worse.' },
      { phrase: 'Both players play optimally', says: 'Each maximises their own lead: dp = max(my gain − your best lead).' },
    ],
    budget: {
      from: 'n ≤ 5 × 10⁴',
      rows: [['game tree', '3ⁿ', 'bad', 'impossible'], ['dp from the end', '3n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Only dp[i+1..i+3] are needed: O(1) memory.',
    },
    observe: [
      {
        title: 'Score as "my lead"',
        text: 'dp[i] is the lead of whoever moves at i. The opponent then has lead dp[i + k], so mine is my gain minus that.',
        sketch: { kind: 'array', rows: [{ items: ['take k', '+ sum', '− dp[i + k]'] }] },
      },
      {
        title: 'Fill from the end',
        text: '[1, 2, 3, 7]: dp[4] = 0, dp[3] = 7, dp[2] = max(3 − 7, 10 − 0) = 10, dp[1] = max(2 − 10, 5 − 7, 12 − 0) = 12, dp[0] = max(1 − 12, 3 − 10, 6 − 7) = −1.',
        sketch: { kind: 'array', rows: [{ label: 'dp', items: [-1, 12, 10, 7, 0], marks: { '0': 'bad' } }] },
      },
      {
        title: 'Read the winner',
        text: 'dp[0] is Alice\'s final lead, since she moves first. −1 < 0, so Bob ends ahead: "Bob". A positive dp[0] means Alice, and exactly 0 means "Tie".',
        sketch: { kind: 'array', rows: [{ items: ['> 0 Alice', '< 0 Bob', '= 0 Tie'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Explore the whole game tree with minimax: at each turn try taking 1, 2 or 3 stones.',
      cost: 'O(3ⁿ)',
      waste: 'The game from stone i is the same however you got there; it is solved once in the table.',
    },
    pattern: {
      pick: 'dp-linear',
      why: 'dp[i] = max over k ∈ {1,2,3} of (a[i] + … + a[i+k−1]) − dp[i+k], filled from the end; compare dp[0] with 0. O(n).',
      not: [
        { id: 'greedy', why: 'Taking the most valuable stones now can hand the opponent a better position.' },
        { id: 'dp-trees-intervals', why: 'Stone Game I/II use intervals or extra state; here it is one row.' },
      ],
    },
    watch: {
      viz: 'Dp1dViz',
      inputs: [
        { label: '[1, 2, 3, -9, 4]', input: { mode: 'stones', a: [1, 2, 3, -9, 4] } },
        { label: '[1, 2, 3, 7]', input: { mode: 'stones', a: [1, 2, 3, 7] } },
      ],
    },
    edges: ['[1, 2, 3, 7] → "Bob".', '[1, 2, 3, -9] → "Alice".', '[1, 2, 3, 6] → "Tie".'],
  },
};
