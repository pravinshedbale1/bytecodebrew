/** Practice thinking walkthroughs: dp-state-machine (format: src/data/think/index.js). */

export default {
  'best-time-to-buy-and-sell-stock-ii': {
    aha: 'Every day ends in one of two situations: you hold a share, or you don\'t. Keep the best profit for each (hold and cash) and update both from yesterday: cash = max(stay out, sell today), hold = max(keep it, buy today). With unlimited trades the answer also equals the sum of every day-to-day rise.',
    asks: {
      read: 'How many trades may you make, and how many shares can you hold at once?',
      budget: '3 × 10⁴ days. How many wait / buy / sell plans are there?',
      observe: 'On [7, 1, 5, 3, 6, 4], which trades make 7?',
      brute: 'Trying every action on every day: why does it blow up?',
      pattern: 'What do you need to know at the end of a day to decide what to do tomorrow?',
      watch: 'Watch hold and cash move one day at a time.',
    },
    read: [
      { phrase: 'You may buy and sell as many times as you like', says: 'No limit on trades, so no trade counter in the state.' },
      { phrase: 'you can hold at most one share at a time', says: 'Two situations per day: holding one share, or holding none.' },
    ],
    budget: {
      from: 'n ≤ 3 × 10⁴',
      rows: [['every wait / buy / sell plan', '2³⁰⁰⁰⁰', 'bad', 'impossible'], ['two states per day', '2 × 3 × 10⁴', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Only yesterday\'s two numbers are needed: O(1) memory.',
    },
    observe: [
      {
        title: 'Two trades make 7',
        text: 'In [7, 1, 5, 3, 6, 4]: buy at 1, sell at 5 (+4); buy at 3, sell at 6 (+3). Total 7, exactly the sum of every rise between neighbouring days.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [7, 1, 5, 3, 6, 4],
              marks: { '1': 'cur', '2': 'hit', '3': 'cur', '4': 'hit' },
              tags: { '1': [['buy', 'accent']], '2': [['sell', 'success']], '3': [['buy', 'accent']], '4': [['sell', 'success']] },
            },
          ],
          caption: '4 + 3 = 7',
        },
      },
      {
        title: 'Only two situations matter',
        text: 'At the end of day 2 (price 5) you either own a share, at best having paid 1 (profit −1), or you don\'t, at best having sold at 5 (profit 4). How you got there doesn\'t matter for tomorrow.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'hold', items: [-7, -1, -1] }, { label: 'cash', items: [0, 0, 4], marks: { '2': 'hit' } }],
          caption: 'the best profit in each state, days 0 to 2',
        },
      },
      {
        title: 'Same as adding every rise',
        text: 'Any long climb can be cut into daily steps, so with unlimited trades the answer is the sum of the positive daily changes.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'daily change', items: ['−6', '+4', '−2', '+3', '−2'], marks: { '0': 'dim', '1': 'hit', '2': 'dim', '3': 'hit', '4': 'dim' } }],
          caption: '4 + 3 = 7',
        },
      },
    ],
    brute: {
      idea: 'Recursively try waiting or acting (buy if empty, sell if holding) on every day, and keep the best final profit.',
      cost: 'O(2ⁿ)',
      waste: 'Plans that reach the same day in the same situation (holding or not) are explored again and again; only the best profit for each matters.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'Two states per day: cash = max(cash, hold + p) and hold = max(hold, cash − p), both from yesterday\'s values. Answer: cash. O(n) time, O(1) memory. Every later stock problem adds a fee, a cooldown or a trade counter to this machine.',
      not: [
        {
          id: 'greedy',
          why: 'Summing the rises works here, but it breaks as soon as a rule is added (a fee, a cooldown, at most k trades); the state machine handles all of them.',
        },
        { id: 'dp-linear', why: 'One best value per day can\'t tell whether you are holding a share; the extra state carries exactly that.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[7, 1, 5, 3, 6, 4]', input: { mode: 'stock2', prices: [7, 1, 5, 3, 6, 4] } },
        { label: '[1, 2, 3, 4, 5]', input: { mode: 'stock2', prices: [1, 2, 3, 4, 5] } },
      ],
    },
    edges: [
      'One day: [5] → 0.',
      'Always falling: [7, 6, 4, 3, 1] → 0.',
      'Always rising: [1, 2, 3, 4, 5] → 4 (one long trade or four daily ones, same profit).',
    ],
  },

  'best-time-to-buy-and-sell-stock-with-transaction-fee': {
    aha: 'The same two states as Stock II, hold and cash, with the fee charged on one arrow: selling earns price − fee. That one change makes small ups and downs not worth a trade, and the max() decides that for you every day.',
    asks: {
      read: 'When is the fee paid, and how often can you trade?',
      budget: '5 × 10⁴ days: how many states per day do you need?',
      observe: 'On [1, 3, 2, 8, 4, 9] with fee 2, why does trading every rise lose money?',
      brute: 'Trying every plan of buys and sells: what is repeated?',
      pattern: 'Stock II had hold and cash. Where does the fee go?',
      watch: 'Watch the fee decide when selling pays.',
    },
    read: [
      { phrase: 'You may make as many transactions as you like', says: 'Unlimited trades: two states, hold and cash.' },
      { phrase: 'every transaction (a buy followed by a sell) costs `fee`', says: 'Charge it once per round trip: on the sell arrow.' },
    ],
    budget: {
      from: 'n ≤ 5 × 10⁴',
      rows: [['every plan', '2⁵⁰⁰⁰⁰', 'bad', 'impossible'], ['two states per day', '10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Same cost as Stock II: the fee changes one line.',
    },
    observe: [
      {
        title: 'Trading every rise over-pays',
        text: 'In [1, 3, 2, 8, 4, 9] with fee 2, trading every rise separately gives 1→3 (+2), 2→8 (+6) and 4→9 (+5), each paying the fee: 0 + 4 + 3 = 7. The fee punishes many small trades.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 3, 2, 8, 4, 9],
              tags: {
                '0': [['buy', 'accent']],
                '1': [['sell', 'warn']],
                '2': [['buy', 'accent']],
                '3': [['sell', 'warn']],
                '4': [['buy', 'accent']],
                '5': [['sell', 'warn']],
              },
            },
          ],
          caption: '(2 − 2) + (6 − 2) + (5 − 2) = 7',
        },
      },
      {
        title: 'Hold through the small dip',
        text: 'Buy at 1 and keep the share through the 3 → 2 dip, sell at 8 (7 − 2 = 5); then buy at 4, sell at 9 (5 − 2 = 3). Total 8.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 3, 2, 8, 4, 9],
              marks: { '0': 'cur', '3': 'hit', '4': 'cur', '5': 'hit' },
              tags: { '0': [['buy', 'accent']], '3': [['sell', 'success']], '4': [['buy', 'accent']], '5': [['sell', 'success']] },
            },
          ],
          caption: '5 + 3 = 8',
        },
      },
      {
        title: 'But not always one long trade',
        text: '1 → 9 in one trade earns 8 − 2 = 6: the 8 → 4 drop is big enough to be worth a second fee.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'one trade', items: ['1 → 9', '6'] }, { label: 'two trades', items: ['1 → 8, 4 → 9', '8'], marks: { '1': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Recursively wait, buy or sell on each day, paying the fee on each sale, and keep the best result.',
      cost: 'O(2ⁿ)',
      waste: 'Every plan that reaches day d holding (or not) continues the same way; only the best profit per state is needed.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'cash = max(cash, hold + p − fee) and hold = max(hold, cash − p), from yesterday\'s values. Answer: cash. O(n), O(1) memory.',
      not: [
        { id: 'greedy', why: 'Summing rises pays a fee per tiny rise, and deciding whether a dip is worth selling through needs the states.' },
        { id: 'dp-linear', why: 'One best value per day can\'t tell whether you are holding a share; the extra state carries exactly that.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[1, 3, 2, 8, 4, 9], fee 2', input: { mode: 'fee', prices: [1, 3, 2, 8, 4, 9], fee: 2 } },
        { label: '[1, 3, 7, 5, 10, 3], fee 3', input: { mode: 'fee', prices: [1, 3, 7, 5, 10, 3], fee: 3 } },
      ],
    },
    edges: [
      'Fee bigger than any gain: [1, 3, 2], fee 5 → 0.',
      'Fee 0 is Stock II: [1, 3, 2, 8, 4, 9] → 13.',
      '[1, 4, 2, 5], fee 3 → 1 (one trade 1 → 5; two trades earn 0 each).',
    ],
  },

  'best-time-to-buy-and-sell-stock-iii': {
    aha: 'Four states in order: holding the first share, after the first sale, holding the second share, after the second sale. Each can only come from the one before it (or stay as it was), so one pass with four numbers covers every way to place two trades.',
    asks: {
      read: 'How many trades, and can they overlap?',
      budget: '10⁵ days. Can you try every pair of trades?',
      observe: 'On [3, 3, 5, 0, 0, 3, 1, 4], why is one long trade worse than two?',
      brute: 'Two trades are four days (buy, sell, buy, sell). How many choices?',
      pattern: 'What needs to be remembered besides "holding or not"?',
      watch: 'Watch four states fill, each from the one above it.',
    },
    read: [
      { phrase: 'You may complete at most two transactions', says: 'Count trades in the state: buy 1, sell 1, buy 2, sell 2.' },
      { phrase: 'you must sell before you buy again', says: 'The second buy only follows the first sale: a chain of states.' },
      { phrase: 'you don\'t have to use both transactions', says: 'An unused trade costs nothing, so sell 2 is the answer.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every pair of trades', 'n⁴ = 10²⁰', 'bad', 'impossible'], ['4 states per day', '4 × 10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'A split into "best trade before day i" + "best after" also works in O(n), but only for two trades.',
    },
    observe: [
      {
        title: 'Two trades make 6',
        text: 'In [3, 3, 5, 0, 0, 3, 1, 4]: buy at 0, sell at 3 (+3); buy at 1, sell at 4 (+3). Total 6 with two trades, more than any single trade (0 → 4 = 4).',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [3, 3, 5, 0, 0, 3, 1, 4],
              marks: { '3': 'cur', '5': 'hit', '6': 'cur', '7': 'hit' },
              tags: { '3': [['buy', 'accent']], '5': [['sell', 'success']], '6': [['buy', 'accent']], '7': [['sell', 'success']] },
            },
          ],
          caption: '3 + 3 = 6',
        },
      },
      {
        title: 'One trade is not enough',
        text: 'The best single trade is 0 → 4 = 4. The dip from 3 to 1 is worth splitting on.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'one trade', items: ['0 → 4', '4'] }, { label: 'two trades', items: ['0 → 3', '1 → 4', '6'], marks: { '2': 'hit' } }],
        },
      },
      {
        title: 'A chain of four states',
        text: 'Each state comes only from the one on its left (or stays as it was): buy 1 from nothing, sell 1 from buy 1, buy 2 from sell 1, sell 2 from buy 2.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['buy 1', 'sell 1', 'buy 2', 'sell 2'],
              marks: { '3': 'hit' },
              tags: { '0': [['− p', 'accent']], '1': [['+ p', 'success']], '2': [['− p', 'accent']], '3': [['+ p', 'success']] },
            },
          ],
          caption: 'answer: sell 2',
        },
      },
    ],
    brute: {
      idea: 'Try every buy and sell day for the first trade and every later pair for the second.',
      cost: 'O(n⁴)',
      waste: 'Every second trade is re-paired with every first trade, though only the best profit up to each day matters.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'buy1 = max(buy1, −p), sell1 = max(sell1, buy1 + p), buy2 = max(buy2, sell1 − p), sell2 = max(sell2, buy2 + p), from yesterday\'s values. Answer sell2. O(n), O(1) memory.',
      not: [
        {
          id: 'greedy',
          why: 'Taking the two biggest rises fails: rises may belong to one longer trade, and merging two rises changes which pair is best.',
        },
        { id: 'prefix-sums', why: 'Best trade before each day plus best after also works for two trades, but it doesn\'t extend to k.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[3, 3, 5, 0, 0, 3, 1, 4]', input: { mode: 'stock3', prices: [3, 3, 5, 0, 0, 3, 1, 4] } },
        { label: '[1, 2, 4, 2, 5, 7, 2, 4]', input: { mode: 'stock3', prices: [1, 2, 4, 2, 5, 7, 2, 4] } },
      ],
    },
    edges: [
      'Rising only: [1, 2, 3, 4, 5] → 4 (one trade is enough).',
      'Falling only: [7, 6, 4, 3, 1] → 0.',
      '[1, 2, 4, 2, 5, 7, 2, 4] → 8 (1 → 7, then 2 → 4).',
    ],
  },

  'best-time-to-buy-and-sell-stock-iv': {
    aha: 'Stock III with k instead of 2: one buy and one sell state per trade, where buy j comes from sell j − 1. That is 2k numbers per day, O(n · k). If k ≥ n / 2 the limit can never bite, so Stock II\'s two states answer it directly.',
    asks: {
      read: 'Must all k trades be used?',
      budget: 'k ≤ 100, n ≤ 1000. How many states per day?',
      observe: 'On [3, 2, 6, 5, 0, 3], what changes between k = 1 and k = 2?',
      brute: 'Placing up to k trades among n days: how many ways?',
      pattern: 'In Stock III the states were buy 1, sell 1, buy 2, sell 2. What is the general rule?',
      watch: 'Watch buy j feed sell j, and sell j feed buy j + 1.',
    },
    read: [
      { phrase: 'You may complete at most `k` transactions', says: '2k states: buy[j] and sell[j] for j = 1..k.' },
      { phrase: 'Using fewer than `k` transactions is allowed', says: 'Return sell[k]; spare trades just stay unused.' },
      { phrase: 'you must sell before you buy again', says: 'The j-th buy comes from the (j − 1)-th sale.' },
    ],
    budget: {
      from: 'k ≤ 100, n ≤ 1000',
      rows: [['every plan', '2¹⁰⁰⁰', 'bad', 'impossible'], ['2k states per day', '2 × 100 × 1000 = 2 × 10⁵', 'ok', 'instant']],
      aim: 'O(n · k)',
      note: 'With k ≥ n / 2, use the unlimited version (Stock II).',
    },
    observe: [
      {
        title: 'k = 2 makes 7',
        text: 'In [3, 2, 6, 5, 0, 3] with k = 2: buy at 2, sell at 6 (+4); buy at 0, sell at 3 (+3). Total 7.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [3, 2, 6, 5, 0, 3],
              marks: { '1': 'cur', '2': 'hit', '4': 'cur', '5': 'hit' },
              tags: { '1': [['buy 1', 'accent']], '2': [['sell 1', 'success']], '4': [['buy 2', 'accent']], '5': [['sell 2', 'success']] },
            },
          ],
          caption: '4 + 3 = 7',
        },
      },
      {
        title: 'k = 1 keeps the best single trade',
        text: 'With k = 1 the best single trade is 2 → 6 = 4: the second rise (0 → 3) can\'t be added, so k really limits the answer.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 6, 5, 0, 3], marks: { '1': 'cur', '2': 'hit' } }], caption: '4' },
      },
      {
        title: 'Extra trades don\'t help',
        text: 'There are only two rising runs here, so k = 3 still gives 7. The answer stops growing once k covers every useful trade.',
        sketch: { kind: 'array', rows: [{ label: 'k', items: [1, 2, 3] }, { label: 'profit', items: [4, 7, 7], marks: { '1': 'hit', '2': 'dim' } }] },
      },
    ],
    brute: {
      idea: 'Recursively wait, buy or sell each day, counting trades, and stop buying once k trades are used.',
      cost: 'O(2ⁿ)',
      waste: 'Plans with the same day, the same number of trades used and the same holding state are interchangeable; there are only n · 2k of them.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'For each day, for j = 1..k: buy[j] = max(buy[j], sell[j−1] − p), sell[j] = max(sell[j], buy[j] + p), with sell[0] = 0. Answer sell[k]. O(n · k) time, O(k) memory.',
      not: [
        { id: 'greedy', why: 'Picking the k biggest rises fails when merging two rises into one trade frees a trade for something else.' },
        {
          id: 'heap-patterns',
          why: 'A heap-based "merge valleys and peaks" trick exists, but it is hard to get right in an interview; the table is direct.',
        },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: 'k = 2, [3, 2, 6, 5, 0, 3]', input: { mode: 'stockk', k: 2, prices: [3, 2, 6, 5, 0, 3] } },
        { label: 'k = 1, [3, 2, 6, 5, 0, 3]', input: { mode: 'stockk', k: 1, prices: [3, 2, 6, 5, 0, 3] } },
      ],
    },
    edges: ['k = 2, [2, 4, 1] → 2.', 'k = 1 is the best single trade: [3, 2, 6, 5, 0, 3] → 4.', 'One day: k = 3, [5] → 0.'],
  },

  'student-attendance-record-ii': {
    aha: 'To decide whether a letter can be added, you only need two facts about the record so far: how many As it has (0 or 1) and how many Ls it ends with (0, 1 or 2). That is six states. Count the records in each state one length at a time: P resets the Ls, L adds one, A moves a record to the "one A" states. O(n) with six counters.',
    asks: {
      read: 'Which two rules can a new letter break?',
      budget: 'n up to 10⁵. How many strings are there?',
      observe: 'For n = 2, which record fails? For "PLL", which letter can\'t come next?',
      brute: 'Listing every string: how many for n = 10⁵?',
      pattern: 'What must you know about a record to know which letters may follow?',
      watch: 'Watch six counts move one length at a time.',
    },
    read: [
      {
        phrase: 'fewer than 2 `A`s in total',
        says: 'Fewer than 2 absences in total means the state needs the number of As so far, which is only ever 0 or 1.',
      },
      { phrase: 'never has 3 or more consecutive `L`s', says: 'Track the Ls at the end: 0, 1 or 2.' },
      { phrase: 'modulo `10^9 + 7`', says: 'A count that explodes: take every sum modulo.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['all 3ⁿ strings', '3^(10⁵)', 'bad', 'impossible'], ['6 states × n', '6 × 10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Raising the 6 × 6 transition matrix to the n-th power would give O(log n), not needed here.',
    },
    observe: [
      {
        title: 'n = 2: 8 of 9',
        text: 'For n = 2 there are 3² = 9 strings, and only "AA" breaks a rule (two absences): 8 valid records.',
        sketch: { kind: 'array', rows: [{ items: ['PP', 'PA', 'PL', 'AP', 'AA', 'AL', 'LP', 'LA', 'LL'], marks: { '4': 'bad' } }], caption: '8 eligible' },
      },
      {
        title: 'What the next letter needs to know',
        text: '"PLL" ends with two Ls, so another L would make three. Whether a letter fits depends only on the As so far and the Ls at the end.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['P', 'L', 'L', '+ L?'], marks: { '1': 'cur', '2': 'cur', '3': 'bad' } }],
          caption: 'ends with LL: no more L',
        },
      },
      {
        title: 'Six states',
        text: 'Every record is in exactly one of the six (As so far, Ls at the end) states. Records in the same state can be extended in exactly the same ways.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'As', items: ['A0', 'A0', 'A0', 'A1', 'A1', 'A1'] }, { label: 'Ls at end', items: ['L0', 'L1', 'L2', 'L0', 'L1', 'L2'] }],
        },
      },
    ],
    brute: {
      idea: 'Generate all 3ⁿ strings and check both rules on each.',
      cost: 'O(3ⁿ · n)',
      waste: 'Records in the same (As, Ls at the end) state behave identically from here on; counting them one by one repeats the same work.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'count[a][l] per length: P sends every (a, l) to (a, 0); L sends (a, l) to (a, l + 1) for l < 2; A sends (0, l) to (1, 0). Sum the six counts at the end, modulo 10⁹ + 7. O(n) time, O(1) memory.',
      not: [
        { id: 'backtracking', why: 'Building every valid string is exponential.' },
        { id: 'dp-linear', why: 'One count per length can\'t tell which records may still take an A or an L; it needs the six states.' },
      ],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'n = 4', input: { mode: 'attendance', n: 4 } }, { label: 'n = 2', input: { mode: 'attendance', n: 2 } }] },
    edges: ['n = 1 → 3 (A, L, P).', 'n = 2 → 8 (all but AA).', 'n = 3 → 19.'],
  },

  'beautiful-arrangement': {
    aha: 'Fill positions 1, 2, 3, … in order. Once some numbers are placed, the rest of the job depends only on WHICH numbers are used, not their order: the next position is the size of that set + 1. So count the ways per set: 2ⁿ sets instead of n! orders.',
    asks: {
      read: 'Does the rule for a position depend on anything besides that position and its number?',
      budget: 'n ≤ 15: 15! orders. Too many?',
      observe: 'For n = 3, which orders work? After placing 1 and 2, does their order matter?',
      brute: 'Generating every permutation: what is repeated?',
      pattern: 'What is the smallest thing to remember about a partly filled arrangement?',
      watch: 'Watch the count for each set of used numbers.',
    },
    read: [
      { phrase: '`perm[i]` is divisible by `i` or `i` is divisible by `perm[i]`', says: 'A check per (position, number): nothing else matters.' },
      { phrase: 'Return the number of beautiful permutations', says: 'Counting orders of up to 15 items: count per set of used items, a bitmask.' },
    ],
    budget: {
      from: 'n ≤ 15',
      rows: [['all permutations', '15! ≈ 1.3 × 10¹²', 'bad', 'too slow'], ['sets × last number', '2¹⁵ × 15 ≈ 5 × 10⁵', 'ok', 'fast']],
      aim: 'O(2ⁿ · n)',
      note: 'Backtracking with pruning also passes for 15; the set version is a clean O(2ⁿ · n).',
    },
    observe: [
      {
        title: 'n = 3: three beautiful orders',
        text: '[1, 2, 3], [2, 1, 3] and [3, 2, 1] work. [1, 3, 2] fails: 3 at position 2, and neither divides the other.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3] }, { items: [2, 1, 3] }, { items: [3, 2, 1] }, { items: [1, 3, 2], marks: { '1': 'bad', '2': 'dim' } }],
        },
      },
      {
        title: 'Only the set matters',
        text: 'Placing 1, 2 or 2, 1 in positions 1 and 2 leaves the same job: position 3 must take 3. Two orders, one situation.',
        sketch: { kind: 'array', rows: [{ items: ['1, 2', '2, 1', '→ {1, 2}'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'The size of the set is the position',
        text: 'The set {1, 3} has 2 numbers, so they fill positions 1 and 2, and the one placed last sits at position 2. 1 fits there (2 % 1 = 0); 3 doesn\'t.',
        sketch: { kind: 'array', rows: [{ items: ['{1, 3}', 'size 2', 'last at 2: only 1'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Backtrack: place a number at each position in turn, checking the rule, and count complete arrangements.',
      cost: 'O(n!)',
      waste: 'Prefixes that used the same numbers in different orders lead to exactly the same rest; it is recomputed each time.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'ways[0] = 1; for each mask, pos = bitCount(mask), and ways[mask] = the sum of ways[mask without x] over each x in mask that fits position pos. Answer ways[full]. O(2ⁿ · n).',
      not: [
        { id: 'backtracking', why: 'Trying every order repeats the same situations; remembering the best per set of used items is this DP.' },
        { id: 'math-for-interviews', why: 'There is no closed formula; the divisibility rule has to be checked position by position.' },
      ],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'n = 3', input: { mode: 'beautiful', n: 3 } }, { label: 'n = 4', input: { mode: 'beautiful', n: 4 } }] },
    edges: ['n = 1 → 1.', 'n = 2 → 2 (both orders work).', 'n = 4 → 8.'],
  },

  'partition-to-k-equal-sum-subsets': {
    aha: 'Fill the groups one at a time, each up to target = total / k. For a set of used numbers the earlier groups are full, so the current group holds (their sum) mod target: one number per set. A set is reachable if removing some x leaves a reachable set whose group had room for x. The answer is whether the full set is reachable.',
    asks: {
      read: 'What must each group add up to, and which inputs are impossible straight away?',
      budget: 'n ≤ 16. How many sets of numbers? How many ways to assign numbers to groups?',
      observe: 'For [4, 1, 3, 2] and k = 2, what happens if 4 and 3 go together?',
      brute: 'Trying each number in each group: what is repeated?',
      pattern: 'If you fill groups one at a time, what does a set of used numbers tell you?',
      watch: 'Watch which sets can be reached, and how full the current group is.',
    },
    read: [
      { phrase: 'divided into `k` non-empty groups whose sums are all equal', says: 'Every group must hit target = total / k exactly.' },
      {
        phrase: 'If the total isn\'t divisible by `k`, or any value is larger than that target, the answer is `false` straight away',
        says: 'Cheap checks before any search.',
      },
      { phrase: 'Every value must be used exactly once', says: 'The state is the set of values used so far: a bitmask.' },
    ],
    budget: {
      from: 'n ≤ 16',
      rows: [['each value into each group', 'k¹⁶ (4¹⁶ ≈ 4 × 10⁹)', 'bad', 'too slow'], ['sets × next value', '2¹⁶ × 16 ≈ 10⁶', 'ok', 'fast']],
      aim: 'O(2ⁿ · n)',
      note: 'Backtracking with sorting and pruning is the other accepted answer.',
    },
    observe: [
      {
        title: '[4, 1, 3, 2] into 2 groups of 5',
        text: 'For [4, 3, 2, 1] with k = 2: the total 10 splits into two groups of 5, {4, 1} and {3, 2}. Every group\'s target is fixed in advance: total / k.',
        sketch: {
          kind: 'array',
          rows: [{ items: [4, 1, 3, 2], tags: { '0': [['A', 'success']], '1': [['A', 'success']], '2': [['B', 'accent']], '3': [['B', 'accent']] } }],
          caption: 'A = 5, B = 5',
        },
      },
      {
        title: 'One group at a time',
        text: 'Starting with 4, adding 3 would overflow 5. Adding 1 closes the group exactly, and the next group starts from 0.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '4 then 3', items: ['4', '+ 3 = 7'], marks: { '1': 'bad' } },
            { label: '4 then 1', items: ['4', '+ 1 = 5 → 0'], marks: { '1': 'hit' } },
          ],
        },
      },
      {
        title: 'The set decides how full the group is',
        text: 'Using {4, 1, 3} sums to 8: the first group is full (5), and the current one holds 8 mod 5 = 3, whatever the order.',
        sketch: { kind: 'array', rows: [{ items: ['4 + 1 + 3 = 8', '8 mod 5 = 3'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Backtrack: put each number into every group that still has room, and succeed when all are placed.',
      cost: 'O(kⁿ)',
      waste: 'The same set of used numbers is reached through many orders and group labels, and its situation (how full the current group is) is identical every time.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'fill[0] = 0; for each mask, fill[mask] = (fill[mask − x] + x) mod target for any x in mask with fill[mask − x] reachable and fill[mask − x] + x ≤ target. Answer: is the full set reachable? O(2ⁿ · n).',
      not: [
        {
          id: 'dp-knapsack',
          why: 'For k = 2 this is subset sum, but for more groups a table of reachable sums can\'t tell which numbers went to which group.',
        },
        {
          id: 'greedy',
          why: 'Putting each number into the first group with room fails on [1, 1, 2, 2], k = 2: the two 1s go together and no 2 fits anywhere.',
        },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[4, 1, 3, 2], k = 2', input: { mode: 'partition', nums: [4, 1, 3, 2], k: 2 } },
        { label: '[3, 3, 2], k = 2', input: { mode: 'partition', nums: [3, 3, 2], k: 2 } },
      ],
    },
    edges: [
      'Total not divisible: [1, 2, 3, 4], k = 3 → false.',
      'k = 1 → true (everything in one group).',
      '[3, 3, 2], k = 2 → false (target 4, and nothing pairs with 3).',
      '[1, 1, 2, 2], k = 2 → true (first fit fails, but {1, 2} + {1, 2} works).',
    ],
  },

  'minimum-number-of-work-sessions-to-finish-the-tasks': {
    aha: 'For a set of finished tasks, keep the best pair (sessions used, hours in the current session): fewer sessions first, then the lightest current session, since that leaves the most room. Build each set from the task done last: it fits in the current session or opens a new one.',
    asks: {
      read: 'Can a task be split across sessions? Does the order of tasks matter?',
      budget: 'n ≤ 14. How many orders? How many sets?',
      observe: 'For [2, 3, 3, 4] with 6-hour sessions, what goes wrong doing them in the given order?',
      brute: 'Trying every order: what do two orders with the same finished tasks share?',
      pattern: 'For a set of finished tasks, what two numbers describe where you stand?',
      watch: 'Watch each set get its best (sessions, hours used).',
    },
    read: [
      { phrase: 'A task must be finished within a single session', says: 'Each task fits in the current session or opens a new one.' },
      { phrase: 'you can do tasks in any order', says: 'The order is your choice: the state is the set of tasks done.' },
      { phrase: 'Return the minimum number of work sessions', says: 'Minimise sessions first; the hours left in the current session break ties.' },
    ],
    budget: {
      from: 'n ≤ 14',
      rows: [['every order', '14! ≈ 8.7 × 10¹⁰', 'bad', 'too slow'], ['sets × last task', '2¹⁴ × 14 ≈ 2.3 × 10⁵', 'ok', 'fast']],
      aim: 'O(2ⁿ · n)',
      note: 'Another route: precompute which sets fit in one session, then combine subsets in O(3ⁿ).',
    },
    observe: [
      {
        title: 'The given order wastes a session',
        text: 'In order: 2 + 3 = 5, then 3 doesn\'t fit (new session), then 4 doesn\'t fit (another): 3 sessions. Pairing {2, 4} and {3, 3} needs only 2.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'in order', items: ['2 + 3', '3', '4'], marks: { '2': 'bad' } },
            { label: 'best', items: ['2 + 4', '3 + 3'], marks: { '0': 'hit', '1': 'hit' } },
          ],
        },
      },
      {
        title: 'Two numbers per set',
        text: 'After doing {2h, 3h} in one session, all that matters is: 1 session so far, 5 hours used in it.',
        sketch: { kind: 'array', rows: [{ items: ['{2h, 3h}', '1 session', '5h used'], marks: { '1': 'hit', '2': 'hit' } }] },
      },
      {
        title: 'Fewer sessions, then a lighter one',
        text: '(1 session, 5h) beats (2 sessions, 1h): a whole session saved. With equal sessions, (2, 3h) beats (2, 4h): more room left.',
        sketch: {
          kind: 'array',
          rows: [
            { items: ['(1, 5h)', '(2, 1h)'], marks: { '0': 'hit', '1': 'dim' } },
            { items: ['(2, 3h)', '(2, 4h)'], marks: { '0': 'hit', '1': 'dim' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Try every order of the tasks, putting each into the current session if it fits, else a new one.',
      cost: 'O(n! · n)',
      waste: 'Orders that have finished the same set of tasks continue the same way; only the best (sessions, hours used) for that set matters.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'best[0] = (1, 0); best[mask] = the smallest pair over each task t in mask, built from best[mask − t] = (s, load): (s, load + t) if it fits, else (s + 1, t). Answer best[full].sessions. O(2ⁿ · n).',
      not: [
        { id: 'greedy', why: 'First fit, even longest task first, is the bin-packing rule of thumb: often good, not always the minimum.' },
        {
          id: 'backtracking',
          why: 'Assigning tasks to sessions with pruning passes for 14, but its running time is hard to predict; the set table is a steady O(2ⁿ · n).',
        },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[2, 3, 3, 4], 6h', input: { mode: 'sessions', tasks: [2, 3, 3, 4], T: 6 } },
        { label: '[1, 2, 3], 3h', input: { mode: 'sessions', tasks: [1, 2, 3], T: 3 } },
      ],
    },
    edges: ['[1, 2, 3], sessionTime 3 → 2.', 'Everything fits once: [1, 2, 3, 4], sessionTime 10 → 1.', '[3, 1, 3, 1, 1], sessionTime 8 → 2.'],
  },

  'shortest-path-visiting-all-nodes': {
    aha: 'A BFS over nodes alone fails because the walk may have to pass back through a node. What decides the rest of the walk is where you are AND which nodes you have already seen, so search over states (node, visited set). Every move costs 1, so a BFS from every (v, {v}) at once reaches the first full set at the shortest length.',
    asks: {
      read: 'May you start anywhere? May you revisit nodes?',
      budget: 'n ≤ 12. How many (node, set) states?',
      observe: 'On a star with centre 0 and leaves 1, 2, 3, how short can the walk be?',
      brute: 'Trying every order of the nodes: how many?',
      pattern: 'Standing at node 0, why isn\'t "node 0" enough to describe where you are?',
      watch: 'Watch the BFS spread over (visited set, current node).',
    },
    read: [
      { phrase: 'the shortest walk that visits every node', says: 'Shortest with every step costing 1: BFS.' },
      {
        phrase: 'You may start and end at any node, and you may revisit nodes and reuse edges',
        says: 'Start from every node at once. Revisits are allowed, so the node alone is not the state: add the visited set.',
      },
    ],
    budget: {
      from: 'n ≤ 12',
      rows: [['every order of nodes', '12! ≈ 4.8 × 10⁸', 'bad', 'too slow'], ['states (node, set)', '12 × 2¹² ≈ 5 × 10⁴', 'ok', 'tiny']],
      aim: 'O(2ⁿ · n²)',
      note: 'Each state is visited once and tries each neighbour.',
    },
    observe: [
      {
        title: 'A star needs to come back',
        text: 'Edges 0–1, 0–2, 0–3: the walk 1 → 0 → 2 → 0 → 3 uses 4 edges and passes node 0 twice. No shorter walk exists.',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 2, 0, 3], marks: { '1': 'cur', '3': 'cur' } }], caption: 'node 0 is visited twice' },
      },
      {
        title: 'Same node, different situation',
        text: 'Standing at 0 having seen {0, 1} is not the same as standing at 0 having seen {0, 1, 2}: the walks still needed are different.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'at 0', items: ['seen {0, 1}', 'seen {0, 1, 2}'], marks: { '0': 'cur', '1': 'hit' } }],
          caption: 'two different states',
        },
      },
      {
        title: 'Start everywhere',
        text: 'The walk can begin at any node, so all n starting states go into the queue at distance 0.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['(0, {0})', '(1, {1})', '(2, {2})', '(3, {3})'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Try every order of visiting the nodes, joining consecutive nodes by their shortest path.',
      cost: 'O(n! · n)',
      waste: 'Orders that have seen the same set and stand at the same node continue identically; there are only n · 2ⁿ such situations.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'BFS over states (node, mask): start from every (v, 1 << v) at distance 0, move to (u, mask | 1 << u) for each neighbour u, and stop when the mask is full. O(2ⁿ · n²).',
      not: [
        { id: 'graph-traversal', why: 'A BFS over nodes alone marks a node seen once and can never pass back through it.' },
        { id: 'shortest-paths', why: 'Dijkstra isn\'t needed: every step costs 1, so BFS already finds shortest distances.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: 'star 0–1, 0–2, 0–3', input: { mode: 'visitall', n: 4, edges: [[0, 1], [0, 2], [0, 3]] } },
        { label: '5 nodes', input: { mode: 'visitall', n: 5, edges: [[0, 1], [1, 2], [1, 4], [2, 3], [2, 4]] } },
      ],
    },
    edges: ['One node → 0.', 'A path 0–1–2 → 2 (start at an end).', 'Star 0–1, 0–2, 0–3 → 4.'],
  },

  'find-the-shortest-superstring': {
    aha: 'Writing word j right after word i saves overlap(i, j) letters. Choosing the order of the words is a travelling salesman tour where the "distance" from i to j is the letters j adds. Only the set of words written and the last one matter for what comes next: len[mask][j]. Fill it over sets, then walk back through the winning choices to build the string.',
    asks: {
      read: 'When can two words share letters?',
      budget: 'n ≤ 12 words. How many orders?',
      observe: 'For "gcta", "ctaagt", "ttca", which order is shortest?',
      brute: 'Trying every order: what do two orders with the same words so far and the same last word share?',
      pattern: 'Which classic problem picks the best order of n items with a cost between consecutive ones?',
      watch: 'Watch the best length for each (set, last word), then the walk back.',
    },
    read: [
      {
        phrase: 'Return a shortest string that contains every string in `words` as a substring',
        says: 'Every word appears in some order; minimise the total length.',
      },
      {
        phrase: 'When one word ends with the start of another, the two can share those letters',
        says: 'Putting j after i costs |j| − overlap(i, j): a distance between pairs.',
      },
      { phrase: 'No word is a substring of another', says: 'So each word starts at its own place: the answer is an order of the words.' },
    ],
    budget: {
      from: 'n ≤ 12',
      rows: [['every order', '12! ≈ 4.8 × 10⁸', 'bad', 'too slow'], ['sets × last × previous', '2¹² × 12 × 12 ≈ 6 × 10⁵', 'ok', 'fast']],
      aim: 'O(2ⁿ · n²)',
      note: 'Compute the n² overlaps first.',
    },
    observe: [
      {
        title: 'Overlaps save letters',
        text: '"gcta" ends with "cta", which starts "ctaagt": written together they make "gctaagt", 7 letters instead of 10.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'gcta', items: ['g', 'c', 't', 'a'], marks: { '1': 'hit', '2': 'hit', '3': 'hit' } },
            { label: 'ctaagt', items: ['c', 't', 'a', 'a', 'g', 't'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } },
          ],
          caption: 'overlap 3',
        },
      },
      {
        title: 'The order decides the savings',
        text: 'gcta → ctaagt → ttca adds 4 + 3 + 3 = 10 letters ("gctaagttca"). Starting with ttca saves nothing on the first join: 4 + 4 + 3 = 11.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'gcta, ctaagt, ttca', items: [4, '+3', '+3', '= 10'], marks: { '3': 'hit' } },
            { label: 'ttca, gcta, ctaagt', items: [4, '+4', '+3', '= 11'], marks: { '3': 'bad' } },
          ],
        },
      },
      {
        title: 'Only the last word matters',
        text: 'Once {gcta, ctaagt} is written ending with ctaagt, the next word only overlaps with ctaagt. The set and the last word are the whole state.',
        sketch: { kind: 'array', rows: [{ items: ['{gcta, ctaagt}', 'last: ctaagt', 'next: ttca saves 1'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try every order of the words, joining neighbours with their overlap, and keep the shortest.',
      cost: 'O(n! · n)',
      waste: 'Orders that used the same words and end with the same one continue identically; there are only 2ⁿ · n such situations.',
    },
    pattern: {
      pick: 'dp-state-machine',
      why: 'Precompute overlap[i][j]. len[{j}][j] = |w_j|; len[mask][j] = min over i in mask − j of len[mask − j][i] + |w_j| − overlap[i][j], remembering the best i. Take the best end in the full row and walk back to build the string. O(2ⁿ · n²).',
      not: [
        { id: 'greedy', why: 'Repeatedly merging the pair with the largest overlap is a good rule of thumb, but not always shortest.' },
        { id: 'string-matching', why: 'KMP can speed up computing the overlaps, but the hard part is choosing the order.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: 'gcta, ctaagt, ttca', input: { mode: 'superstring', words: ['gcta', 'ctaagt', 'ttca'] } },
        { label: 'abc, bcd, cde', input: { mode: 'superstring', words: ['abc', 'bcd', 'cde'] } },
      ],
    },
    edges: ['One word: ["abc"] → "abc".', 'No overlaps: ["alex", "loves", "leetcode"] → any order, 17 letters.', '["abc", "bcd", "cde"] → "abcde".'],
  },
};
