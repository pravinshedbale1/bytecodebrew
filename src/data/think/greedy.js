/** Practice thinking walkthroughs: greedy (format: src/data/think/index.js). */

export default {
  'assign-cookies': {
    free: true,
    aha: 'Sort both lists. Hand cookies out from the smallest: if the current cookie satisfies the least greedy child still waiting, give it to them; if not, it is too small for every child left, so skip it. Never spending a big cookie where a small one works keeps the big ones for the greedy children.',
    asks: {
      read: 'How many cookies can a child get, and when is a child content?',
      budget: '3 × 10⁴ children and cookies. Can you try every assignment?',
      observe: 'With greed [1, 2, 3] and cookies [3, 1, 1], who should get the 3?',
      brute: 'Trying every way to match cookies to children: how many?',
      pattern: 'Which child is easiest to satisfy, and which cookie should they get?',
      watch: 'Watch the cookies go out smallest first.',
    },
    read: [
      { phrase: 'Each child can get at most one cookie', says: 'A matching: one cookie per child, one child per cookie.' },
      {
        phrase: 'content only with a cookie of size at least `g[i]`',
        says: 'A cookie works for a child if it is at least their greed: sorting both makes "fits" easy to scan.',
      },
      {
        phrase: 'Return the maximum number of content children',
        says: 'Maximise the count, not the total size: satisfy the easiest children first.',
      },
    ],
    budget: {
      from: 'n, m ≤ 3 × 10⁴',
      rows: [['every matching', 'm! / (m − n)!', 'bad', 'impossible'], ['sort + one pass', '3 × 10⁴ · log', 'ok', 'instant']],
      aim: 'O(n log n + m log m)',
      note: 'After sorting, two pointers walk each list once.',
    },
    observe: [
      {
        title: 'Don\'t waste the big cookie',
        text: 'Greed [1, 2, 3], cookies [1, 1, 3]. Give a 1 to the child with greed 1, and the 3 to greed 2. The other 1 fits nobody else: 2 content.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'greed', items: [1, 2, 3], marks: { '0': 'hit', '1': 'hit', '2': 'dim' } },
            { label: 'cookies', items: [1, 1, 3], marks: { '0': 'hit', '1': 'dim', '2': 'hit' } },
          ],
          caption: '2 content',
        },
      },
      {
        title: 'A cookie too small now is too small for everyone left',
        text: 'The children are sorted, so if a cookie fails the least greedy child waiting, it fails all of them. Throw it away and try the next cookie.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'waiting', items: [2, 5, 7], marks: { '0': 'cur' } }, { label: 'cookie', items: [1], marks: { '0': 'bad' } }],
          caption: '1 < 2 ≤ 5 ≤ 7',
        },
      },
    ],
    brute: {
      idea: 'Try every way to give each child one of the unused cookies (or none) and keep the best count.',
      cost: 'O(m! / (m − n)!)',
      waste: 'Most assignments are obviously worse: giving a big cookie to an easy child never helps. Sorting turns the choice into a scan.',
    },
    pattern: {
      pick: 'greedy',
      why: 'Sort both. For each cookie from small to big: if it satisfies the least greedy child waiting, that child is content and the next one waits. O(n log n + m log m).',
      not: [
        { id: 'two-pointers', why: 'The scan is two pointers, but what makes it correct is the greedy choice: the smallest cookie that works.' },
        { id: 'dp-linear', why: 'No choice ever needs undoing, so there is nothing for a table to remember.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: 'greed [1, 2, 3], cookies [3, 1, 1]', input: { mode: 'cookies', g: [1, 2, 3], s: [3, 1, 1] } },
        { label: 'greed [2, 5, 3, 7], cookies [1, 4, 2, 8, 3]', input: { mode: 'cookies', g: [2, 5, 3, 7], s: [1, 4, 2, 8, 3] } },
      ],
    },
    edges: ['No cookies: greed [5], cookies [] → 0.', 'All cookies too small: [1, 2, 3], [1, 1] → 1.', 'More cookies than children: [1, 2], [1, 2, 3] → 2.'],
  },

  'best-time-to-buy-and-sell-stock': {
    aha: 'If you sell on day i, the best buy is the lowest price before it. So walk the days once, remembering the lowest price so far; on each day, selling today earns price − lowest. Keep the best of those.',
    asks: {
      read: 'How many trades, and in which order must buy and sell happen?',
      budget: '10⁵ days. Can you try every pair of days?',
      observe: 'On [7, 1, 5, 3, 6, 4], what is the best buy for a sale on day 4 (price 6)?',
      brute: 'Every (buy, sell) pair: how many?',
      pattern: 'For a fixed selling day, what is the only buy day worth considering?',
      watch: 'Watch the lowest price and the best profit update day by day.',
    },
    read: [
      { phrase: 'Choose one day to buy one share and a later day to sell it', says: 'One trade, buy before sell: pick a pair of days in order.' },
      { phrase: 'or `0` if no profitable trade exists', says: 'Start the best at 0: not trading is allowed.' },
      { phrase: 'Track the lowest price seen so far', says: 'The statement hands you the state: one number for the best buy so far.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every pair', '5 × 10⁹', 'bad', 'too slow'], ['one pass', '10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'O(1) memory: the lowest price and the best profit.',
    },
    observe: [
      {
        title: 'Sell at 6, buy at 1',
        text: 'For a sale on day 4 (price 6), the best buy is the lowest earlier price, 1: profit 5. That is the answer.',
        sketch: {
          kind: 'array',
          rows: [{ items: [7, 1, 5, 3, 6, 4], marks: { '1': 'cur', '4': 'hit' }, tags: { '1': [['min', 'accent']], '4': [['sell', 'success']] } }],
          caption: '6 − 1 = 5',
        },
      },
      {
        title: 'Only the lowest price so far matters',
        text: 'By day 3 the earlier prices are 7, 1, 5. Any sale from now on prefers the 1; the 7 and the 5 never matter again.',
        sketch: { kind: 'array', rows: [{ items: [7, 1, 5, '…'], marks: { '0': 'dim', '1': 'hit', '2': 'dim' } }], caption: 'remember one number: 1' },
      },
    ],
    brute: {
      idea: 'Try every buy day and every later sell day.',
      cost: 'O(n²)',
      waste: 'For each selling day, every buy day except the lowest earlier one is checked for nothing.',
    },
    pattern: {
      pick: 'greedy',
      why: 'One pass: best = max(best, p − lowest), then lowest = min(lowest, p). O(n) time, O(1) memory.',
      not: [
        {
          id: 'sliding-window',
          why: 'It can be seen as a window from the lowest day to today, but no window ever shrinks: one remembered minimum is all there is.',
        },
        { id: 'dp-state-machine', why: 'The hold / cash machine also works, but one trade needs only the lowest price so far.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '[7, 1, 5, 3, 6, 4]', input: { mode: 'stock', prices: [7, 1, 5, 3, 6, 4] } },
        { label: '[7, 6, 4, 3, 1]', input: { mode: 'stock', prices: [7, 6, 4, 3, 1] } },
      ],
    },
    edges: ['Always falling: [7, 6, 4, 3, 1] → 0.', 'One day: [5] → 0.', 'A new low after the best sale: [3, 8, 1, 6] → 5 (3 → 8 beats 1 → 6).'],
  },

  'jump-game': {
    aha: 'Keep one number: the furthest index you can reach so far. Walk left to right; from every index you can reach, extend that number with i + nums[i]. If you ever stand on an index beyond it, you are stuck.',
    asks: {
      read: 'Must you jump exactly nums[i], or anything up to it?',
      budget: '10⁴ indexes. Can you try every route?',
      observe: 'In [3, 2, 1, 0, 4], how far can any route get?',
      brute: 'Trying every jump length from every index: what is repeated?',
      pattern: 'If you can reach index 5, can you reach index 4?',
      watch: 'Watch the reachable band grow, or stop.',
    },
    read: [
      { phrase: 'you can jump any shorter distance too', says: 'Everything up to i + nums[i] is reachable: the reachable set is one block from 0.' },
      { phrase: 'Return `true` if you can reach the last index', says: 'Yes / no: only whether the block covers the end matters.' },
    ],
    budget: {
      from: 'n ≤ 10⁴, nums[i] ≤ 10⁵',
      rows: [
        ['every route', 'exponential', 'bad', 'impossible'],
        ['DP over indexes', 'n² = 10⁸', 'bad', 'slow'],
        ['furthest reach', '10⁴', 'ok', 'instant'],
      ],
      aim: 'O(n)',
      note: 'One number replaces the whole table.',
    },
    observe: [
      {
        title: 'Stuck on a 0',
        text: 'From 0, 1 or 2 the furthest you can reach is index 3, and from 3 (a 0) you can\'t move. Index 4 is never reached.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 1, 0, 4], marks: { '3': 'bad', '4': 'dim' } }], caption: 'every route ends at index 3' },
      },
      {
        title: 'Reachable indexes form one block',
        text: 'Because shorter jumps are allowed, reaching index k means every index before k is reachable too. So "the furthest reach" describes the whole set.',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 1, 1, 4], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }], caption: 'from 0: indexes 0..2' },
      },
    ],
    brute: {
      idea: 'Recursively try every jump length from every index.',
      cost: 'O(2ⁿ)',
      waste: 'The same index is re-explored from many routes; whether it is reachable is the only fact needed.',
    },
    pattern: {
      pick: 'greedy',
      why: 'furthest = 0; for i in 0..n−1: if i > furthest return false; furthest = max(furthest, i + nums[i]). Return true. O(n), O(1).',
      not: [
        { id: 'dp-linear', why: 'can[i] = any earlier j that reaches i is O(n²); the block shape makes one number enough.' },
        { id: 'graph-traversal', why: 'A BFS over indexes works but visits every edge; the reach can only grow, so a scan is enough.' },
      ],
    },
    watch: {
      viz: 'GreedyViz',
      inputs: [
        { label: '[2, 3, 1, 1, 4]', input: { mode: 'jump', a: [2, 3, 1, 1, 4] } },
        { label: '[3, 2, 1, 0, 4]', input: { mode: 'jump', a: [3, 2, 1, 0, 4] } },
      ],
    },
    edges: ['One index: [0] → true (already there).', '[0, 1] → false.', '[3, 2, 1, 0, 4] → false.'],
  },

  'jump-game-ii': {
    aha: 'Think in waves, like BFS: wave 0 is index 0, wave 1 is everything one jump reaches, and so on. Each wave is a block of indexes, and the next wave ends at the furthest point reachable from the current one. Walk left to right; when you reach the end of a wave, you must jump, and the next wave ends at the furthest reach seen.',
    asks: {
      read: 'Is the end always reachable? What is counted?',
      budget: '10⁴ indexes: is O(n²) acceptable? Can you do one pass?',
      observe: 'For [2, 3, 1, 1, 4], which indexes are one jump away? Two?',
      brute: 'A DP of fewest jumps to each index: what does it cost?',
      pattern: 'BFS by levels: what does each level look like here?',
      watch: 'Watch the waves of indexes, one colour per jump.',
    },
    read: [
      { phrase: 'Return the minimum number of jumps', says: 'Fewest moves with every move costing 1: BFS levels.' },
      { phrase: 'Think of the jumps in waves', says: 'Each wave is a block of indexes; its end is where the next jump is forced.' },
      {
        phrase: 'The last index is always reachable',
        says: 'The end is always reachable, so the waves never get stuck: no −1 case, just count the waves.',
      },
    ],
    budget: {
      from: 'n ≤ 10⁴',
      rows: [['DP: fewest jumps to each index', 'n · max jump', 'bad', 'up to 10⁷, fine but slower'], ['waves in one pass', '10⁴', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Three numbers: jumps, end of the current wave, furthest reach.',
    },
    observe: [
      {
        title: 'Waves of indexes',
        text: 'From index 0 (value 2), one jump reaches 1..2. From those, the furthest is 1 + 3 = 4, the end. So 2 jumps.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [2, 3, 1, 1, 4],
              tags: { '0': [['0', 'muted']], '1': [['1', 'accent']], '2': [['1', 'accent']], '3': [['2', 'success']], '4': [['2', 'success']] },
            },
          ],
          caption: 'tag = jumps needed',
        },
      },
      {
        title: 'You only jump when the wave ends',
        text: 'Inside a wave, keep looking for the furthest reach. At the wave\'s last index the next jump is forced, and the next wave ends at that furthest reach.',
        sketch: { kind: 'array', rows: [{ items: ['wave 1: 1..2', 'furthest 4', 'wave 2: 3..4'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each index, take the fewest jumps over every earlier index that can reach it.',
      cost: 'O(n²)',
      waste: 'Fewest-jumps values only change at wave boundaries; one running furthest reach captures each wave.',
    },
    pattern: {
      pick: 'greedy',
      why: 'for i in 0..n−2: furthest = max(furthest, i + nums[i]); if i == waveEnd: jumps++, waveEnd = furthest. O(n), O(1).',
      not: [
        { id: 'graph-traversal', why: 'It is a BFS, but the levels are contiguous blocks, so no queue is needed.' },
        { id: 'dp-linear', why: 'The O(n²) table works but repeats work the waves skip.' },
      ],
    },
    watch: {
      viz: 'GreedyViz',
      inputs: [
        { label: '[2, 3, 1, 1, 4]', input: { mode: 'jump2', a: [2, 3, 1, 1, 4] } },
        { label: '[2, 3, 0, 1, 4]', input: { mode: 'jump2', a: [2, 3, 0, 1, 4] } },
      ],
    },
    edges: ['One index: [0] → 0.', '[2, 3, 0, 1, 4] → 2.', 'Big first jump: [5, 1, 1, 1, 1] → 1.'],
  },

  'gas-station': {
    aha: 'Two facts make one pass enough. If total gas ≥ total cost, some start works. And if, starting at s, the tank first goes negative after station i, no station between s and i can be the start either (each would arrive at i with even less). So jump the start to i + 1 and reset the tank.',
    asks: {
      read: 'Is the route a circle? How many valid starts can there be?',
      budget: '10⁵ stations. Can you simulate from every start?',
      observe: 'For gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2], where does the tank go negative from station 0?',
      brute: 'Try each start and drive around: what is repeated?',
      pattern: 'If starting at s fails at i, what does that say about starting at s + 1?',
      watch: 'Watch the start jump forward each time the tank goes negative.',
    },
    read: [
      { phrase: 'on a circular route', says: 'Wrap around; the total decides whether any start exists.' },
      { phrase: 'You start with an empty tank at one station', says: 'The tank is a running sum of gas − cost from the start.' },
      { phrase: 'If a solution exists, it is unique', says: 'Return the one start found by the scan.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['simulate every start', 'n² = 10¹⁰', 'bad', 'too slow'], ['one pass, resetting', '10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Track the total and the current tank.',
    },
    observe: [
      {
        title: 'The net gain per station',
        text: 'gas − cost per station: −2, −2, −2, 3, 3. Their total is 0 ≥ 0: over a full loop there is enough gas overall, so some start works. (A negative total would mean no start can.)',
        sketch: { kind: 'array', rows: [{ label: 'gas − cost', items: [-2, -2, -2, 3, 3], marks: { '3': 'hit' } }], caption: 'total 0 ≥ 0' },
      },
      {
        title: 'A failed stretch rules out all its starts',
        text: 'Starting at 0 the tank is −2 after station 0. Starting at 1 or 2 is no better. The first start whose tank never goes negative is 3.',
        sketch: {
          kind: 'array',
          rows: [{ items: [-2, -2, -2, 3, 3], marks: { '0': 'bad', '1': 'bad', '2': 'bad', '3': 'cur' }, tags: { '3': [['start', 'success']] } }],
          caption: '3 → 6, then around the loop',
        },
      },
    ],
    brute: {
      idea: 'For each start, drive around the circle and check the tank never goes negative.',
      cost: 'O(n²)',
      waste: 'After a start fails at i, every start up to i is retried, though each of them must fail at i too.',
    },
    pattern: {
      pick: 'greedy',
      why: 'tank += gas[i] − cost[i]; total += the same; if tank < 0: start = i + 1, tank = 0. Answer: total ≥ 0 ? start : −1. O(n).',
      not: [
        { id: 'prefix-sums', why: 'The tank is a prefix sum; the start is just after its lowest point, which the resetting scan finds directly.' },
        { id: 'sliding-window', why: 'A window around the doubled array works but is more code for the same pass.' },
      ],
    },
    watch: {
      viz: 'GreedyViz',
      inputs: [
        { label: 'gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2]', input: { mode: 'gas', gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] } },
        { label: 'gas [2, 3, 4], cost [3, 4, 3]', input: { mode: 'gas', gas: [2, 3, 4], cost: [3, 4, 3] } },
      ],
    },
    edges: [
      'Not enough gas overall: gas [2, 3, 4], cost [3, 4, 3] → −1.',
      'One station: gas [5], cost [4] → 0.',
      'gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2] → 3.',
    ],
  },

  'partition-labels': {
    aha: 'A part that contains a letter must reach that letter\'s last occurrence. So record every letter\'s last index, then walk the string: the current part must stretch to the furthest last index of any letter in it. When you stand exactly on that point, nothing inside spills over: cut.',
    asks: {
      read: 'What does "each letter appears in at most one part" force?',
      budget: '500 letters. Is a quadratic scan fine? What does one pass need?',
      observe: 'In "eccbbbbdec", why must everything be one part?',
      brute: 'Trying every set of cut points: how many?',
      pattern: 'Once a letter is in the current part, how far must the part go?',
      watch: 'Watch the part stretch to the last occurrence of every letter inside.',
    },
    read: [
      { phrase: 'each letter appears in at most one part', says: 'A part containing a letter must reach that letter\'s last position.' },
      {
        phrase: 'Split `s` into as many parts as possible',
        says: 'As many parts as possible means cutting the moment it is allowed: as soon as every letter seen so far has had its last occurrence.',
      },
      { phrase: 'Return the sizes of the parts, in order', says: 'Record end − start + 1 at each cut.' },
    ],
    budget: {
      from: 'n ≤ 500',
      rows: [['every cut set', '2⁴⁹⁹', 'bad', 'impossible'], ['last index + one pass', '2 × 500', 'ok', 'instant']],
      aim: 'O(n)',
      note: '26 last positions.',
    },
    observe: [
      {
        title: 'The first letter decides a lot',
        text: '"e" appears at both ends of "eccbbbbdec", so the first part must reach the very end: one part of size 10.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['e', 'c', 'c', 'b', 'b', 'b', 'b', 'd', 'e', 'c'], marks: { '0': 'cur', '8': 'hit' } }],
          caption: 'last "e" at 8, last "c" at 9',
        },
      },
      {
        title: 'Stretch, then cut',
        text: 'In "ababcbacadefegde", the part starting at 0 must reach the last a (8); every letter inside ends by 8, so cut there: 9. Then "defegde" (7).',
        sketch: { kind: 'array', rows: [{ items: ['ababcbaca', 'defegde'], marks: { '0': 'hit', '1': 'hit' } }], caption: '[9, 7]' },
      },
    ],
    brute: {
      idea: 'Try every way to cut the string and check each part\'s letters don\'t appear elsewhere.',
      cost: 'O(2ⁿ · n)',
      waste: 'The cuts are forced by last occurrences; there is never a choice to search.',
    },
    pattern: {
      pick: 'greedy',
      why: 'last[c] for each letter; end = max(end, last[s[i]]); when i == end, cut a part of size end − start + 1. O(n).',
      not: [
        { id: 'intervals', why: 'Each letter spans [first, last]: merging those intervals gives the same parts, with more work.' },
        { id: 'hashing', why: 'The last-index table is the only lookup, and 26 slots replace a map.' },
      ],
    },
    watch: {
      viz: 'GreedyViz',
      inputs: [
        { label: '"ababcbacadefegde"', input: { mode: 'labels', s: 'ababcbacadefegde' } },
        { label: '"eccbbbbdec"', input: { mode: 'labels', s: 'eccbbbbdec' } },
      ],
    },
    edges: ['One letter: "a" → [1].', 'All different: "abc" → [1, 1, 1].', '"eccbbbbdec" → [10].'],
  },

  'boats-to-save-people': {
    aha: 'Sort. The heaviest person must leave in some boat, and the best partner for them is the lightest person: if even the lightest doesn\'t fit, nobody does; if they do, pairing them uses up the person who would be easiest to place anyway. Two pointers, one boat per step.',
    asks: {
      read: 'How many people per boat, and what limits a pair?',
      budget: '5 × 10⁴ people. Can you try every pairing?',
      observe: 'For [3, 5, 3, 4] with limit 5, can anyone share?',
      brute: 'Trying every way to pair people: how many?',
      pattern: 'Who is hardest to place, and who should go with them?',
      watch: 'Watch the heaviest leave each step, with the lightest when they fit.',
    },
    read: [
      { phrase: 'Each boat carries at most two people at the same time', says: 'Pairs or singles: a matching, solved by pairing extremes.' },
      {
        phrase: 'as long as their total weight is at most `limit`',
        says: 'A pair fits if the sum is ≤ limit: sorting makes the partner check one comparison.',
      },
      {
        phrase: 'Return the minimum number of boats',
        says: 'At most two per boat, so fewer boats means more pairs: the answer is n − (number of pairs).',
      },
    ],
    budget: {
      from: 'n ≤ 5 × 10⁴',
      rows: [['every pairing', 'n! / …', 'bad', 'impossible'], ['sort + two pointers', 'n log n', 'ok', 'instant']],
      aim: 'O(n log n)',
      note: 'Counting sort works too, weights ≤ 3 × 10⁴.',
    },
    observe: [
      {
        title: 'Heaviest with lightest',
        text: 'Sorted [1, 2, 2, 3], limit 3: 3 can\'t take anyone (3 + 1 > 3), so it goes alone. Then 2 + 1 fit. The last 2 goes alone: 3 boats.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 2, 2, 3],
              tags: { '0': [['boat 2', 'accent']], '1': [['boat 3', 'muted']], '2': [['boat 2', 'accent']], '3': [['boat 1', 'warn']] },
            },
          ],
          caption: '3 boats',
        },
      },
      {
        title: 'If the lightest doesn\'t fit, nobody does',
        text: 'Sorted [3, 3, 4, 5], limit 5: 5 + 3 > 5, so 5 goes alone. Then 4 + 3 > 5, and 3 + 3 > 5: everyone alone, 4 boats.',
        sketch: { kind: 'array', rows: [{ items: [3, 3, 4, 5], marks: { '0': 'cur', '3': 'bad' } }], caption: '3 + 5 > 5' },
      },
    ],
    brute: {
      idea: 'Recursively take the first person and try them alone or with each person they fit with.',
      cost: 'O(n!)',
      waste: 'Most partners are interchangeable: the lightest person can stand in for any partner of the heaviest.',
    },
    pattern: {
      pick: 'greedy',
      why: 'Sort; light = 0, heavy = n − 1; while light ≤ heavy: if p[light] + p[heavy] ≤ limit, light++; heavy--; boats++. O(n log n).',
      not: [
        {
          id: 'two-pointers',
          why: 'The loop is two pointers, but the reason it is right is the exchange argument: swapping the heaviest\'s partner for the lightest keeps both boats valid.',
        },
        { id: 'backtracking', why: 'Trying every pairing is exponential and never beats heaviest-with-lightest.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '[3, 2, 2, 1], limit 3', input: { mode: 'boats', people: [3, 2, 2, 1], limit: 3 } },
        { label: '[3, 5, 3, 4], limit 5', input: { mode: 'boats', people: [3, 5, 3, 4], limit: 5 } },
      ],
    },
    edges: ['Two who fit: [1, 2], limit 3 → 1.', 'One person: [5], limit 5 → 1.', 'Nobody pairs: [3, 5, 3, 4], limit 5 → 4.'],
  },

  'two-city-scheduling': {
    aha: 'Pretend everyone flies to B. Moving one person to A changes the bill by aCost − bCost. Exactly n must move, so move the n with the smallest (most negative) difference: sort by aCost − bCost, first half to A, second half to B.',
    asks: {
      read: 'How many people go to each city?',
      budget: '100 people. How many ways to choose who goes to A?',
      observe: 'For [[10, 20], [30, 200], [400, 50], [30, 20]], who saves the most by going to A?',
      brute: 'Choosing n of 2n people for A: how many choices?',
      pattern: 'If everyone starts in B, what does moving one person to A cost or save?',
      watch: 'Watch people sorted by their A − B difference, then split in half.',
    },
    read: [
      { phrase: 'Exactly `n` people must go to each city', says: 'A fixed split: compare people with each other, not each person alone.' },
      { phrase: 'Sort people by how much cheaper city A is than city B', says: 'The key is the difference aCost − bCost.' },
      { phrase: 'Return the minimum total cost', says: 'Sum the chosen city per person.' },
    ],
    budget: {
      from: '2n ≤ 100',
      rows: [['choose n of 2n', 'C(100, 50) ≈ 10²⁹', 'bad', 'impossible'], ['sort by difference', '100 log 100', 'ok', 'instant']],
      aim: 'O(n log n)',
      note: 'A DP over (person, A count) is O(n²) and also works.',
    },
    observe: [
      {
        title: 'Each person\'s difference',
        text: 'A − B: −10, −170, 350, 10. The second person saves 170 by going to A; the third saves 350 by going to B.',
        sketch: { kind: 'array', rows: [{ label: 'A − B', items: [-10, -170, 350, 10], marks: { '1': 'hit', '2': 'bad' } }] },
      },
      {
        title: 'Sort and split',
        text: 'Sorted: −170, −10 go to A (30 + 10), and 10, 350 go to B (20 + 50). Total 110.',
        sketch: {
          kind: 'array',
          rows: [{ items: [-170, -10, 10, 350], tags: { '0': [['A', 'accent']], '1': [['A', 'accent']], '2': [['B', 'note']], '3': [['B', 'note']] } }],
          caption: '30 + 10 + 20 + 50 = 110',
        },
      },
      {
        title: 'Cheapest city per person fails',
        text: 'For [[10, 20], [20, 40], [30, 60], [50, 40]], three people are cheaper in A, but only two may go. The fixed split is why the difference, not each person\'s cheaper city, decides.',
        sketch: { kind: 'array', rows: [{ label: 'cheaper city', items: ['A', 'A', 'A', 'B'], marks: { '2': 'bad' } }], caption: 'must be 2 and 2' },
      },
    ],
    brute: {
      idea: 'Try every way to choose which n people fly to A.',
      cost: 'O(2²ⁿ · n)',
      waste: 'Swapping a person with a bigger A-saving into A for one with a smaller saving always helps, so only the sorted split can be optimal.',
    },
    pattern: {
      pick: 'greedy',
      why: 'aCost − bCost says how much a person saves by going to A (negative) or B (positive). Sort by it; the n most A-leaning people go to A, the rest to B. Swapping any pair across the split could only cost more. O(n log n).',
      not: [
        { id: 'dp-knapsack', why: 'dp over (people seen, sent to A) is O(n²) and correct, but the exchange argument makes it unnecessary.' },
        { id: 'sorting-and-selection', why: 'Quickselect on the difference gives O(n), but sorting 100 numbers is already instant.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '[[10, 20], [30, 200], [400, 50], [30, 20]]', input: { mode: 'twocity', costs: [[10, 20], [30, 200], [400, 50], [30, 20]] } },
        { label: '6 people', input: { mode: 'twocity', costs: [[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]] } },
      ],
    },
    edges: [
      'Two people: [[10, 20], [30, 200]] → 50 (the second saves 170 in A, the first goes to B).',
      '[[10, 20], [30, 200], [400, 50], [30, 20]] → 110.',
      'Six people from LeetCode → 1859.',
    ],
  },

  'candy': {
    aha: 'Each rule is easy on its own. A left-to-right pass makes every child beat a lower-rated left neighbour (one more than them). A right-to-left pass does the same for the right neighbour, keeping the larger of the two requirements. Both rules then hold, and nobody has more than they need.',
    asks: {
      read: 'Which two rules are there, and what does "minimum" ask for?',
      budget: '2 × 10⁴ children. One or two passes?',
      observe: 'For ratings [1, 3, 4, 5, 2], what does the child rated 5 need?',
      brute: 'Raising candies until no rule is broken: how many rounds can that take?',
      pattern: 'Can you satisfy the left rule alone in one pass? The right rule?',
      watch: 'Watch the left pass, then the right pass take the max.',
    },
    read: [
      {
        phrase: 'every child gets at least one candy',
        says: 'Everyone needs at least one candy, so start every child at 1 and only raise counts where a rule demands it.',
      },
      {
        phrase: 'a child with a higher rating than a neighbour gets more candies than that neighbour',
        says: 'Two neighbours, two directions: one pass for each side.',
      },
      { phrase: 'Return the minimum total number of candies', says: 'Each child gets exactly what the stricter side demands.' },
    ],
    budget: {
      from: 'n ≤ 2 × 10⁴',
      rows: [['fix rules until stable', 'up to n² = 4 × 10⁸', 'bad', 'slow'], ['two passes', '4 × 10⁴', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'One candy array; a one-pass slope-counting version exists but is harder to explain.',
    },
    observe: [
      {
        title: 'Both neighbours make demands',
        text: 'In [1, 3, 4, 5, 2], the 5 needs more than the 4 (so ≥ 4) and more than the 2 (so ≥ 2). It gets the larger: 4.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'ratings', items: [1, 3, 4, 5, 2] }, { label: 'candies', items: [1, 2, 3, 4, 1], marks: { '3': 'hit' } }],
          caption: 'total 11',
        },
      },
      {
        title: 'One pass per direction',
        text: 'Left to right, a rising rating gets one more than its left neighbour. Right to left, a rating higher than its right neighbour gets max(current, right + 1).',
        sketch: {
          kind: 'array',
          rows: [{ label: 'after left', items: [1, 2, 3, 4, 1] }, { label: 'after right', items: [1, 2, 3, 4, 1], marks: { '3': 'hit' } }],
          caption: 'the 2 at the end only needs 1',
        },
      },
      {
        title: 'Equal ratings ask nothing',
        text: 'For [1, 2, 2], the third child is not higher than the second, so 1 is enough: 1 + 2 + 1 = 4.',
        sketch: { kind: 'array', rows: [{ label: 'ratings', items: [1, 2, 2] }, { label: 'candies', items: [1, 2, 1], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Start everyone at 1 and keep raising any child who breaks a rule until nothing changes.',
      cost: 'O(n²)',
      waste: 'A long slope is fixed one step per round; one sweep in each direction settles every slope at once.',
    },
    pattern: {
      pick: 'greedy',
      why: 'c = all 1; left pass: if r[i] > r[i−1], c[i] = c[i−1] + 1; right pass: if r[i] > r[i+1], c[i] = max(c[i], c[i+1] + 1). Sum. O(n).',
      not: [
        {
          id: 'dp-linear',
          why: 'It looks like a DP over positions, but each child depends on both sides; two one-sided passes are simpler than any table.',
        },
        { id: 'sorting-and-selection', why: 'Handing out by increasing rating also works in O(n log n); the two passes avoid the sort.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '[1, 0, 2]', input: { mode: 'candy', ratings: [1, 0, 2] } },
        { label: '[1, 3, 4, 5, 2]', input: { mode: 'candy', ratings: [1, 3, 4, 5, 2] } },
      ],
    },
    edges: ['One child: [5] → 1.', 'Equal neighbours: [1, 2, 2] → 4.', '[1, 0, 2] → 5.'],
  },

  'lemonade-change': {
    aha: 'Serve the queue in order. A $10 needs a $5 back; a $20 needs $15, either $10 + $5 or three $5s. Always prefer $10 + $5: a $5 can pay change for anyone, a $10 only for a $20, so keep the bill that is useful more often.',
    asks: {
      read: 'What change does each bill need? Do you start with any?',
      budget: '10⁵ customers. How much state do you need?',
      observe: 'For [5, 5, 10, 10, 20], where does it go wrong?',
      brute: 'Trying both ways to change every $20: how many?',
      pattern: 'When a $20 arrives and you have both options, which bills should you keep?',
      watch: 'Watch the till: $5s and $10s.',
    },
    read: [
      { phrase: 'You start with no change at all', says: 'Early customers can\'t be given change from nothing.' },
      { phrase: 'Each customer pays with a single `$5`, `$10` or `$20` bill', says: 'Only $5s and $10s are ever useful as change: two counters.' },
      { phrase: 'in the order given by `bills`', says: 'No reordering: decide on the spot.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every change choice', '2ⁿ', 'bad', 'impossible'], ['two counters', '10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'O(1) memory.',
    },
    observe: [
      {
        title: 'Two $10s use up the $5s',
        text: '[5, 5, 10, 10, 20]: after the two $10s the till holds two $10s and no $5. The $20 needs $15: neither $10 + $5 nor three $5s. False.',
        sketch: { kind: 'array', rows: [{ items: ['$5', '$5', '$10', '$10', '$20'], marks: { '4': 'bad' } }], caption: 'till: $10 × 2, $5 × 0' },
      },
      {
        title: 'Keep the $5s',
        text: 'With $5 × 3 and $10 × 1 and a $20 to change, paying $10 + $5 leaves $5 × 2, enough for two more $10s. Paying three $5s leaves none.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '$10 + $5', items: ['$5 × 2', '$10 × 0'], marks: { '0': 'hit' } },
            { label: '3 × $5', items: ['$5 × 0', '$10 × 1'], marks: { '0': 'bad' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'For every $20, try both ways of giving change and see whether any sequence of choices serves everyone.',
      cost: 'O(2ⁿ)',
      waste: 'One choice ($10 + $5) leaves a till that can do everything the other could, so the other never needs trying.',
    },
    pattern: {
      pick: 'greedy',
      why: 'Counters five and ten. $5: five++. $10: need a five. $20: ten + five if possible, else three fives, else false. O(n), O(1).',
      not: [
        { id: 'backtracking', why: 'Trying both change options for each $20 is exponential, and one option always dominates.' },
        { id: 'design-data-structures', why: 'Only two counts matter; no structure beyond two integers.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '[5, 5, 5, 10, 20]', input: { mode: 'lemonade', bills: [5, 5, 5, 10, 20] } },
        { label: '[5, 5, 10, 10, 20]', input: { mode: 'lemonade', bills: [5, 5, 10, 10, 20] } },
      ],
    },
    edges: ['First customer pays $10: [10] → false.', '[5, 5, 5, 10, 20] → true.', 'Two $20s on four $5s: [5, 5, 5, 5, 20, 20] → false.'],
  },

  'merge-triplets-to-form-target-triplet': {
    aha: 'Merging takes the larger value in each position, so values can only grow. A triplet with any value above the target can never be used: it would push that position past the target for good. Every other triplet is harmless. So keep the harmless ones and check that, between them, each target value appears exactly in its position.',
    asks: {
      read: 'What does a merge do to each position?',
      budget: '10⁵ triplets. Can you try sequences of merges?',
      observe: 'With target [2, 7, 5], why is [1, 8, 4] useless?',
      brute: 'Trying every subset of triplets to merge: how many?',
      pattern: 'If a merge can only raise values, which triplets are ever safe to include?',
      watch: 'Watch unsafe triplets get skipped and the target positions get covered.',
    },
    read: [
      { phrase: '`[max(a_i, a_j), max(b_i, b_j), max(c_i, c_j)]`', says: 'Values only go up: anything above the target is poison.' },
      { phrase: 'after any number of operations (possibly none)', says: 'Merging any set of triplets is possible; ask which set.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every subset', '2^(10⁵)', 'bad', 'impossible'], ['one filter pass', '3 × 10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Three flags.',
    },
    observe: [
      {
        title: 'Overshooting is permanent',
        text: '[1, 8, 4] has 8 > 7 in the middle. Once merged in, the middle can never come back down to 7. Skip it.',
        sketch: { kind: 'array', rows: [{ label: 'target', items: [2, 7, 5] }, { label: 'triplet', items: [1, 8, 4], marks: { '1': 'bad' } }] },
      },
      {
        title: 'The safe ones cover the target',
        text: '[2, 5, 3] gives the 2, [1, 7, 5] gives the 7 and the 5. Merged: [2, 7, 5].',
        sketch: {
          kind: 'array',
          rows: [{ items: [2, 5, 3], marks: { '0': 'hit' } }, { items: [1, 7, 5], marks: { '1': 'hit', '2': 'hit' } }],
          caption: 'max = [2, 7, 5]',
        },
      },
    ],
    brute: {
      idea: 'Try every non-empty subset of triplets and check whether its position-wise max equals the target.',
      cost: 'O(2ⁿ · n)',
      waste: 'Adding a safe triplet never hurts, so the best subset is simply "all safe triplets".',
    },
    pattern: {
      pick: 'greedy',
      why: 'For each triplet: skip it if any value exceeds the target; otherwise mark the positions where it equals the target. Answer: all three marked. O(n).',
      not: [
        { id: 'backtracking', why: 'No subset search is needed: including every safe triplet is always best.' },
        { id: 'hashing', why: 'Three flags are the whole state; nothing to look up.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: 'target [2, 7, 5]', input: { mode: 'triplets', triplets: [[2, 5, 3], [1, 8, 4], [1, 7, 5]], target: [2, 7, 5] } },
        { label: 'target [3, 2, 5]', input: { mode: 'triplets', triplets: [[3, 4, 5], [4, 5, 6]], target: [3, 2, 5] } },
      ],
    },
    edges: [
      'Every triplet overshoots: [[3, 4, 5], [4, 5, 6]], target [3, 2, 5] → false.',
      'Already there: [[1, 1, 1]], target [1, 1, 1] → true.',
      '[[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], target [5, 5, 5] → true.',
    ],
  },

  'valid-parenthesis-string': {
    aha: 'Without stars you would count open "(" and fail if it goes negative. Each * can be "(", ")" or nothing, so the open count becomes a range: the fewest and the most "(" that could be open now. "(" raises both ends, ")" lowers both, * lowers the fewest and raises the most. If the most goes negative, fail; never let the fewest go below 0. Valid if the fewest ends at 0.',
    asks: {
      read: 'What can a * be?',
      budget: '100 characters. How many ways to choose the stars?',
      observe: 'In "(*))", what must the * be?',
      brute: 'Trying all 3^stars choices: why is it hopeless for 100 characters?',
      pattern: 'Instead of one open count, what two numbers describe all the choices at once?',
      watch: 'Watch the range of possible open counts after each character.',
    },
    read: [
      {
        phrase: 'each `"*"` can be treated as a single `"("`, a single `")"`, or an empty string',
        says: 'Three options per star: track the range of open counts instead of choosing.',
      },
      {
        phrase: 'every `"("` has a matching `")"` after it',
        says: 'Every "(" must be closed later, so the open count must be able to end at exactly 0.',
      },
      { phrase: 'every `")"` has a matching `"("` before it', says: 'The open count must never go negative along the way.' },
    ],
    budget: {
      from: 'n ≤ 100',
      rows: [
        ['every star choice', '3¹⁰⁰', 'bad', 'impossible'],
        ['DP over (index, open)', '100 × 100', 'ok', 'fine'],
        ['range of open counts', '100', 'ok', 'instant'],
      ],
      aim: 'O(n)',
      note: 'Two integers.',
    },
    observe: [
      {
        title: '"(*))" needs the * as "("',
        text: '"(*))" has two ")", so it needs two "(" before them: the real one and the star. Reading the star as "(" gives "(())": valid.',
        sketch: { kind: 'array', rows: [{ items: ['(', '*', ')', ')'], marks: { '1': 'hit' } }], caption: '* = "("' },
      },
      {
        title: 'The open count is a range',
        text: 'After "(*" the open count is 0, 1 or 2 depending on the star. Track just the ends: fewest 0, most 2.',
        sketch: { kind: 'array', rows: [{ items: ['(', '*'], tags: { '0': [['1–1', 'muted']], '1': [['0–2', 'accent']] } }] },
      },
      {
        title: 'Two ways to fail',
        text: 'If even the most drops below 0, there are too many ")" for any choice of stars. If the fewest is still above 0 at the end, some "(" can never be closed.',
        sketch: {
          kind: 'array',
          rows: [{ label: '"((*"', items: ['(', '(', '*'], tags: { '2': [['1–3', 'danger']] } }],
          caption: 'fewest 1 at the end → false',
        },
      },
    ],
    brute: {
      idea: 'Try every way to read each * as "(", ")" or empty, and check each resulting string.',
      cost: 'O(3ᵏ · n)',
      waste: 'Many choices lead to the same open count at the same position; only the smallest and largest possible counts matter.',
    },
    pattern: {
      pick: 'greedy',
      why: 'lo, hi = 0. "(": lo++, hi++. ")": lo--, hi--. "*": lo--, hi++. If hi < 0 return false; lo = max(lo, 0). Answer lo == 0. O(n), O(1).',
      not: [
        { id: 'stack-patterns', why: 'Two stacks (open indexes and star indexes) also work, but the range is simpler.' },
        { id: 'dp-linear', why: 'A table over (index, open count) is O(n²) and correct; the range collapses it.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [{ label: '"(*))"', input: { mode: 'wildcard', s: '(*))' } }, { label: '"((*"', input: { mode: 'wildcard', s: '((*' } }],
    },
    edges: ['"()" → true.', 'Order matters: "*)(" → false.', 'Only a star: "*" → true (empty).'],
  },

  'hand-of-straights': {
    aha: 'Look at the smallest card left. Nothing smaller remains, so it can\'t be the middle or end of a group: it must START one, which needs the next groupSize − 1 consecutive values. Take that group and repeat. There is never a choice, so any failure is a real failure.',
    asks: {
      read: 'What makes a valid group? Must every card be used?',
      budget: '10⁴ cards. Can you try every grouping?',
      observe: 'In [1, 2, 3, 6, 2, 3, 4, 7, 8] with groups of 3, which group must contain the 1?',
      brute: 'Trying every way to split the cards into groups: how many?',
      pattern: 'What role can the smallest card possibly play in its group?',
      watch: 'Watch the smallest value start each group.',
    },
    read: [
      {
        phrase: 'each group consists of `groupSize` **consecutive** values',
        says: 'A group is v, v + 1, …, v + size − 1: fixed once its smallest value is known.',
      },
      { phrase: 'use every card exactly once', says: 'All cards in groups: the count must divide, and every card is placed.' },
    ],
    budget: {
      from: 'n ≤ 10⁴',
      rows: [['every grouping', 'exponential', 'bad', 'impossible'], ['sorted counts, smallest first', 'n log n', 'ok', 'fast']],
      aim: 'O(n log n)',
      note: 'A sorted map (TreeMap) of value → count.',
    },
    observe: [
      {
        title: 'The smallest card starts a group',
        text: '1 is the smallest, so its group is 1, 2, 3. Then the smallest left is 2: 2, 3, 4. Then 6, 7, 8.',
        sketch: { kind: 'array', rows: [{ items: ['1 2 3', '2 3 4', '6 7 8'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }], caption: '3 groups' },
      },
      {
        title: 'A gap is fatal',
        text: '[1, 2, 3, 4, 6, 7] in 3s: 1, 2, 3, then 4 must start 4, 5, 6, and there is no 5.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, '5?', 6, 7], marks: { '3': 'cur', '4': 'bad' } }], caption: 'false' },
      },
    ],
    brute: {
      idea: 'Recursively pick any card as the start of a group, remove the group, and recurse.',
      cost: 'O(n!)',
      waste: 'Only the smallest card can start the next group; every other start is a dead end or a reordering.',
    },
    pattern: {
      pick: 'greedy',
      why: 'If n % size ≠ 0, false. Count values in a sorted map; repeatedly take the smallest v with count > 0 and decrement v..v+size−1, failing on a missing value. O(n log n).',
      not: [
        { id: 'heap-patterns', why: 'A min-heap can supply the smallest card, but a sorted map handles counts more cleanly.' },
        { id: 'backtracking', why: 'Searching groupings is exponential; the smallest card leaves no choice.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '[1, 2, 3, 6, 2, 3, 4, 7, 8], size 3', input: { mode: 'straights', hand: [1, 2, 3, 6, 2, 3, 4, 7, 8], size: 3 } },
        { label: '[1, 2, 3, 4, 6, 7], size 3', input: { mode: 'straights', hand: [1, 2, 3, 4, 6, 7], size: 3 } },
      ],
    },
    edges: [
      'Count doesn\'t divide: [1, 2, 3, 4, 5], size 4 → false.',
      'Group size 1: [5], size 1 → true.',
      'Duplicates: [1, 1, 2, 2, 3, 3], size 3 → true.',
    ],
  },

  'dota2-senate': {
    aha: 'On your turn, ban the opponent who would act soonest: that is the one about to ban one of yours. Keep each party\'s turn numbers in a queue. The two fronts duel: the earlier turn acts, bans the other front, and rejoins its own queue at turn + n for the next round. The party with senators left wins.',
    asks: {
      read: 'Who acts first, and what does a ban do?',
      budget: '10⁴ senators. Can you search over every ban choice?',
      observe: 'In "RDD", whom should R ban, and does it help?',
      brute: 'Trying every ban on every turn: how big is that game tree?',
      pattern: 'Which opponent is the most dangerous to leave alive?',
      watch: 'Watch the two queues duel at the front.',
    },
    read: [
      {
        phrase: 'in each round the senators act in order from first to last',
        says: 'Turn order decides everything: model each senator by their next turn number.',
      },
      { phrase: 'who loses all rights in this and every later round', says: 'A ban removes a senator for good: pop them from their queue.' },
      { phrase: 'Every senator plays the best strategy for their party', says: 'The best ban is the next opponent to act.' },
    ],
    budget: {
      from: 'n ≤ 10⁴',
      rows: [['game-tree search', 'exponential', 'bad', 'impossible'], ['two queues', 'n duels', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Each duel removes one senator.',
    },
    observe: [
      {
        title: '"RDD": R bans one, the other bans R',
        text: 'R acts first and bans the first D. The second D then bans R. Dire wins.',
        sketch: { kind: 'array', rows: [{ items: ['R', 'D', 'D'], marks: { '0': 'bad', '1': 'bad', '2': 'hit' } }], caption: 'Dire' },
      },
      {
        title: 'Ban the next one to act',
        text: 'Banning a far-away opponent leaves a nearer one free to ban your teammate first. The nearest opponent is always the most dangerous.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['R', 'D', 'R', 'D'], marks: { '0': 'cur', '1': 'bad' }, tags: { '0': [['acts', 'accent']], '1': [['ban', 'danger']] } }],
        },
      },
      {
        title: 'Position beats numbers',
        text: '"DDRRR" has three R and two D, yet Dire wins: the Ds act first and ban Rs before they can act.',
        sketch: { kind: 'array', rows: [{ items: ['D', 'D', 'R', 'R', 'R'], marks: { '0': 'hit', '1': 'hit' } }], caption: 'Dire' },
      },
    ],
    brute: {
      idea: 'Search the game: on each turn try every possible ban and pick a winning one if any exists.',
      cost: 'O(n!)',
      waste: 'Every ban except "the next opponent to act" is never better, so the search has one move per turn.',
    },
    pattern: {
      pick: 'greedy',
      why: 'Queues of turn numbers R and D. While both are non-empty: r = R.poll(), d = D.poll(); the smaller acts and is re-added at its number + n. The non-empty queue\'s party wins. O(n).',
      not: [
        { id: 'design-data-structures', why: 'It is a queue simulation, but the reason it is correct is the greedy ban.' },
        { id: 'backtracking', why: 'Searching every ban sequence is exponential.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [{ label: '"RDD"', input: { mode: 'senate', senate: 'RDD' } }, { label: '"DRRDRDD"', input: { mode: 'senate', senate: 'DRRDRDD' } }],
    },
    edges: ['One senator: "R" → Radiant.', '"RD" → Radiant (R bans D first).', '"DDRRR" → Dire.'],
  },

  'jump-game-vii': {
    aha: 'Index i is reachable if s[i] is "0" and some reachable index lies in the window [i − maxJump, i − minJump]. Checking the whole window each time is too slow. Slide it instead: as i moves right, one index enters the window and one leaves, so keep a running count of reachable indexes inside it.',
    asks: {
      read: 'Which indexes can jump to j?',
      budget: '10⁵ characters with windows up to 10⁵ wide. Is checking each window fine?',
      observe: 'In "011010" with jumps 2..3, which indexes can reach index 3?',
      brute: 'For each index, scan its whole window: what does it cost?',
      pattern: 'How does the window for i + 1 differ from the window for i?',
      watch: 'Watch the window slide and the count of reachable indexes inside it.',
    },
    read: [
      { phrase: '`i + minJump <= j <= min(i + maxJump, s.length − 1)`', says: 'From j\'s view: some reachable i in [j − maxJump, j − minJump].' },
      {
        phrase: '`s[j] == "0"`',
        says: 'You can only land on a "0": index j is reachable only if s[j] is "0" and some reachable index can jump to it.',
      },
      { phrase: 'Return `true` if you can reach index `s.length − 1`', says: 'Fill reach[] left to right and read the last one.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['scan each window', 'n · (max − min) ≈ 10¹⁰', 'bad', 'too slow'], ['sliding count', '2 × 10⁵', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'A prefix sum of reach[] works the same way.',
    },
    observe: [
      {
        title: 'Who can jump to index 3?',
        text: 'With jumps of 2 or 3, index 3 is reached from 0 or 1. Index 0 is reachable and s[3] is "0": so 3 is reachable.',
        sketch: {
          kind: 'array',
          rows: [{ items: [0, 1, 1, 0, 1, 0], marks: { '0': 'hit', '3': 'cur' }, tags: { '0': [['from', 'success']], '3': [['j', 'accent']] } }],
          caption: 'window [0, 1]',
        },
      },
      {
        title: 'The window slides by one',
        text: 'Moving from j to j + 1, index j + 1 − minJump enters the window and j − maxJump leaves. Add or remove one from a count.',
        sketch: { kind: 'array', rows: [{ items: ['…', 'leaves', '·', '·', 'enters', '…'], marks: { '1': 'bad', '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each index, look back over its whole window for a reachable index (or BFS from 0).',
      cost: 'O(n · (maxJump − minJump))',
      waste: 'Neighbouring windows share almost everything; recounting them is the waste.',
    },
    pattern: {
      pick: 'greedy',
      why: 'reach[0] = true; for i ≥ 1: count += reach[i − minJump] (if it exists); count −= reach[i − maxJump − 1] (if it exists); reach[i] = s[i] == \'0\' && count > 0. O(n).',
      not: [
        { id: 'graph-traversal', why: 'BFS from 0 is correct, but scanning each index\'s jump range again makes it O(n²) without care.' },
        {
          id: 'prefix-sums',
          why: 'A prefix sum of reach[] answers "any reachable in the window?" too; the sliding count is the same idea with O(1) memory per step.',
        },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [
        { label: '"011010", 2..3', input: { mode: 'jump7', s: '011010', minJ: 2, maxJ: 3 } },
        { label: '"01101110", 2..3', input: { mode: 'jump7', s: '01101110', minJ: 2, maxJ: 3 } },
      ],
    },
    edges: ['Last is "1": "01", jumps 1..1 → false.', '"00", jumps 1..1 → true.', '"01101110", jumps 2..3 → false.'],
  },

  'partition-array-such-that-maximum-difference-is-k': {
    aha: 'Order inside a subsequence doesn\'t matter, so sort. The smallest value must go somewhere, and its group can hold anything up to smallest + k. Putting everything up to there in the same group is never worse. When a value is more than k above the group\'s smallest, it opens the next group.',
    asks: {
      read: 'Must a subsequence keep the original order? Does that matter here?',
      budget: '10⁵ numbers. Sorting is fine?',
      observe: 'For [3, 6, 1, 2, 5] and k = 2, which values can share a group with 1?',
      brute: 'Trying every way to split into groups: how many?',
      pattern: 'After sorting, what decides when a new group must start?',
      watch: 'Watch a new group open whenever the gap from its first value exceeds k.',
    },
    read: [
      { phrase: 'Split `nums` into one or more subsequences', says: 'Any subset can form a group: order is irrelevant, so sort.' },
      { phrase: 'the difference between its maximum and minimum is at most `k`', says: 'A group spans at most k from its smallest value.' },
      { phrase: 'Return the minimum number of subsequences needed', says: 'Pack each group as full as allowed.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every split', 'Bell(n)', 'bad', 'impossible'], ['sort + one pass', 'n log n', 'ok', 'instant']],
      aim: 'O(n log n)',
      note: 'Counting sort also works (values ≤ 10⁵).',
    },
    observe: [
      {
        title: 'Sorted, the groups are runs',
        text: 'Sorted [1, 2, 3, 5, 6], k = 2: 1, 2, 3 fit together (3 − 1 = 2); 5 − 1 > 2 opens a new group; 6 joins it.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 2, 3, 5, 6],
              tags: { '0': [['g1', 'accent']], '1': [['g1', 'accent']], '2': [['g1', 'accent']], '3': [['g2', 'warn']], '4': [['g2', 'warn']] },
            },
          ],
          caption: '2 groups',
        },
      },
      {
        title: 'Take everything that fits',
        text: 'Leaving a value that fits out of the current group can only force it into a later group with bigger values. Including it never hurts.',
        sketch: { kind: 'array', rows: [{ items: ['1', '2', '3', '| 5', '6'], marks: { '3': 'cur' } }], caption: 'cut where the gap exceeds k' },
      },
    ],
    brute: {
      idea: 'Try every way to split the numbers into groups and check each group\'s spread.',
      cost: 'O(Bell(n) · n)',
      waste: 'After sorting, the only sensible groups are consecutive runs, and the cut points are forced.',
    },
    pattern: {
      pick: 'greedy',
      why: 'Sort; groups = 1, start = nums[0]; for each x: if x − start > k, groups++, start = x. O(n log n).',
      not: [
        { id: 'sliding-window', why: 'Each group looks like a window, but it never needs to shrink: one cut per new group.' },
        { id: 'dp-linear', why: 'A DP over sorted prefixes works but every cut is forced, so there is nothing to choose.' },
      ],
    },
    watch: {
      viz: 'PartitionKViz',
      inputs: [
        { label: '[3, 6, 1, 2, 5], k = 2', input: { nums: [3, 6, 1, 2, 5], k: 2 } },
        { label: '[2, 2, 4, 5], k = 0', input: { nums: [2, 2, 4, 5], k: 0 } },
      ],
    },
    edges: ['[3, 6, 1, 2, 5], k = 2 → 2.', 'k = 0 groups equal values: [2, 2, 4, 5] → 3.', 'One number: [7], k = 3 → 1.'],
  },

  'orderly-queue': {
    aha: 'First work out what the move can reach. With k = 1 the only move is "first letter to the end": a rotation, so exactly the n rotations are reachable; try them all. With k ≥ 2 you can swap any two neighbouring letters (rotate them to the front, send the second to the end, rotate back around), and neighbour swaps can sort anything: the answer is the sorted string.',
    asks: {
      read: 'Which letters may move, and where do they go?',
      budget: '1000 letters. Can you search every reachable string?',
      observe: 'With k = 1, what strings can "cba" become? With k = 2, can "cab" become "abc"?',
      brute: 'A BFS over strings: how many strings are reachable?',
      pattern: 'Instead of searching, ask: which strings can the move reach at all?',
      watch: 'Watch the rotations for k = 1, and a sequence of moves sorting the string for k = 2.',
    },
    read: [
      {
        phrase: 'choose one of the first `k` letters of `s` and move it to the end',
        says: 'The move\'s power depends on k: k = 1 only rotates; k ≥ 2 can swap neighbours.',
      },
      { phrase: 'Return the lexicographically smallest string', says: 'Find the smallest reachable string: work out the reachable set first.' },
      { phrase: 'after any number of moves', says: 'Unlimited moves: think about what is reachable, not about a sequence.' },
    ],
    budget: {
      from: 'n ≤ 1000',
      rows: [
        ['BFS over strings', 'up to n! states', 'bad', 'impossible'],
        ['k = 1: n rotations', 'n² = 10⁶', 'ok', 'fine'],
        ['k ≥ 2: sort', 'n log n', 'ok', 'instant'],
      ],
      aim: 'O(n²) or O(n log n)',
      note: 'The case split is the whole solution.',
    },
    observe: [
      {
        title: 'k = 1 only rotates',
        text: '"cba" → "bac" → "acb" → "cba". Three rotations; the smallest is "acb".',
        sketch: { kind: 'array', rows: [{ items: ['cba', 'bac', 'acb'], marks: { '2': 'hit' } }], caption: '"acb"' },
      },
      {
        title: 'k = 2 can swap neighbours',
        text: 'To swap a neighbouring pair: rotate until the pair is at the front, move the second letter to the end, then keep rotating until the string comes back around with the two swapped.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['c', 'a', 'b'], tags: { '0': [['may move', 'muted']], '1': [['move', 'warn']] } }, { items: ['c', 'b', 'a'] }],
          caption: '"cab" → "cba"',
        },
      },
      {
        title: 'Swaps sort anything',
        text: 'Bubble sort uses only neighbour swaps, so with k ≥ 2 every order is reachable, including the sorted one: "baaca", k = 3 → "aaabc".',
        sketch: { kind: 'array', rows: [{ items: ['a', 'a', 'a', 'b', 'c'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit', '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'BFS over all strings reachable by moves, and keep the smallest.',
      cost: 'O(n! · n)',
      waste: 'For k ≥ 2 the BFS discovers every arrangement; knowing that in advance replaces the search with a sort.',
    },
    pattern: {
      pick: 'greedy',
      why: 'k == 1: the smallest of the n rotations, O(n²). k ≥ 2: sort the letters, O(n log n).',
      not: [
        { id: 'graph-traversal', why: 'A BFS over strings is the honest brute force, but the state space is factorial.' },
        { id: 'string-matching', why: 'Booth\'s algorithm finds the smallest rotation in O(n), but n ≤ 1000 makes the simple O(n²) enough.' },
      ],
    },
    watch: {
      viz: 'GreedyWalkViz',
      inputs: [{ label: '"cba", k = 1', input: { mode: 'orderly', s: 'cba', k: 1 } }, { label: '"cab", k = 2', input: { mode: 'orderly', s: 'cab', k: 2 } }],
    },
    edges: ['One letter: "a", k = 1 → "a".', '"cba", k = 1 → "acb".', '"baaca", k = 3 → "aaabc".'],
  },
};
