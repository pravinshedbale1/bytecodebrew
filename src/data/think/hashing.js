/** Practice thinking walkthroughs: hashing (format: src/data/think/index.js). */

export default {
  'two-sum': {
    free: true,
    aha: 'For each number x, the one partner that works is target − x. Instead of searching for it, remember every number you have passed in a map (value → index) and just ask the map.',
    asks: {
      read: 'Which words tell you that, for a given number, only one specific partner can work?',
      observe: 'With target 9, which value must sit next to 7 in the answer, and where is it?',
      brute: 'If you try every pair, how many times do you look at the number 2?',
      pattern: 'What structure answers "have I already seen the value 2, and where?" instantly?',
      watch: 'Watch the map grow under the array; notice that each step does one lookup, then one store.',
      budget: '10⁴ numbers. Every pair is about 5 × 10⁷: why would an interviewer still want better?',
    },
    read: [
      { phrase: 'two numbers', says: 'A pair. So for each number x, the question becomes: is its partner somewhere?' },
      { phrase: 'add up to `target`', says: 'The partner is not "any number": it is exactly target − x, one specific value we can look for.' },
      { phrase: 'Return the indices', says: 'We need positions, not values. Sorting would scramble them, so remember where each value was.' },
      { phrase: 'you may not use the same element twice', says: 'x must not pair with itself: only look among the numbers before x.' },
    ],
    budget: {
      from: 'nums.length ≤ 10⁴',
      n: 10000,
      aim: 'O(n)',
      note: 'Trying every pair is about 10⁸ steps: it might pass, but it is exactly what the interviewer wants you to improve.',
    },
    observe: [
      {
        title: 'The partner of each number is fixed',
        text: 'With target 9, the only partner for 7 is 9 − 7 = 2. At each position we are not searching for "something that works": we check for one known value.',
        sketch: {
          kind: 'array',
          rows: [{ items: [2, 7, 11, 15], marks: { '0': 'hit', '1': 'cur' }, tags: { '0': [['9 − 7', 'success']], '1': [['x', 'accent']] } }],
          caption: 'x = 7 needs exactly 2, which sits at index 0',
        },
      },
      {
        title: '"Have I seen this value?" is a lookup, not a scan',
        text: 'Scanning back over everything before x costs a loop each time. A map from value to index answers "is 2 here, and where?" in one step.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'map so far (value → index)', items: ['2 → 0'], marks: { '0': 'kept' } },
            { label: 'now looking at', items: [7], marks: { '0': 'cur' } },
          ],
          caption: 'one map lookup instead of a loop',
        },
      },
      {
        title: 'Check before storing',
        text: 'With [3, 2, 4] and target 6, the first 3 must not find itself. Look up the partner first, then add x to the map, so the map only holds earlier numbers.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 2, 4], marks: { '0': 'bad' }, tags: { '0': [['3 + 3?', 'danger']] } }],
          caption: 'storing 3 first would wrongly answer [0, 0]',
        },
      },
    ],
    brute: {
      idea: 'Try every pair (i, j) with i < j and check nums[i] + nums[j] == target.',
      cost: 'O(n²)',
      waste: 'For each x it walks over all earlier numbers again, looking for one specific value it could simply have remembered.',
    },
    pattern: {
      pick: 'hashing',
      why: 'We repeatedly ask "has value v appeared, and where?" A map from value to index answers that in one step, so a single pass is O(n).',
      not: [
        { id: 'two-pointers', why: 'Two pointers needs the array sorted, and sorting loses the original indices we must return.' },
        { id: 'sorting-and-selection', why: 'Sorting helps find a pair, but costs O(n log n) and still needs the indices carried along.' },
      ],
    },
    watch: {
      viz: 'TwoSumMapViz',
      inputs: [
        { label: '[2, 7, 11, 15], target 9', input: { nums: [2, 7, 11, 15], target: 9 } },
        { label: '[3, 2, 4], target 6', input: { nums: [3, 2, 4], target: 6 } },
      ],
    },
    edges: [
      'Two equal values: [3, 3], target 6 → [0, 1].',
      'Negative numbers: [−3, 4, 3, 90], target 0 → [0, 2].',
      'The answer uses the last element: [1, 5, 9], target 14 → [1, 2].',
    ],
  },

  'contains-duplicate': {
    aha: 'Walk through the array once, putting each value into a set. The first value that is already in the set is a duplicate.',
    asks: {
      observe: 'Walking [1, 2, 3, 1] from the left, at which step do you first know the answer?',
      pattern: 'You only need to know "seen it or not" for each value. Which structure answers that in one step?',
      read: 'Which phrase tells you a single repeat is enough to answer?',
      budget: '10⁵ values. What does comparing every pair cost?',
      brute: 'Comparing every pair works. What question does it keep asking about earlier values?',
      watch: 'Watch the set grow until a value is already in it.',
    },
    read: [
      { phrase: 'any value appears at least twice', says: 'The question is "have I seen this value before?", asked once per element.' },
      { phrase: 'every value is distinct', says: 'We can only answer false after checking every element; true can come early.' },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'Comparing every pair is 5 × 10⁹ comparisons. Sorting (O(n log n)) would pass; one pass with a set is simpler.',
    },
    observe: [
      {
        title: 'A duplicate shows up as "seen it already"',
        text: 'Walk left to right. The moment a value is already among the ones passed, there is a duplicate: in [1, 2, 3, 1] that happens at index 3.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], marks: { '0': 'target', '3': 'bad' }, tags: { '3': [['seen!', 'danger']] } }] },
      },
      {
        title: 'Only "seen or not" matters',
        text: 'Positions and counts don\'t matter, only membership. A hash set answers "is v in here?" in one step.',
        sketch: { kind: 'array', rows: [{ label: 'set after three values', items: ['1', '2', '3'], marks: { '0': 'kept', '1': 'kept', '2': 'kept' } }] },
      },
    ],
    brute: {
      idea: 'Compare every pair of positions and return true if any two hold the same value.',
      cost: 'O(n²)',
      waste: 'Each value is compared again with every earlier value, though "is it among them?" is one set lookup.',
    },
    pattern: {
      pick: 'hashing',
      why: 'Membership in "what I have seen so far": a hash set checks and adds in one step each, so one pass is O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting puts duplicates next to each other: correct, but O(n log n), and it changes the array.' },
        { id: 'two-pointers', why: 'There is no pair to steer towards a target; we just need to know whether a value repeats.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Index 0: add 1',
          text: 'The set is empty, so 1 is new.',
          sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], marks: { '0': 'cur' } }, { label: 'set', items: ['1'] }] },
        },
        {
          title: 'Index 1, 2: add 2 and 3',
          text: 'Neither is in the set yet.',
          sketch: {
            kind: 'array',
            rows: [{ items: [1, 2, 3, 1], marks: { '0': 'kept', '1': 'kept', '2': 'cur' } }, { label: 'set', items: ['1', '2', '3'] }],
          },
        },
        {
          title: 'Index 3: 1 is already there → true',
          text: 'The fourth value is in the set, so it appears at least twice. Stop early.',
          sketch: {
            kind: 'array',
            rows: [{ items: [1, 2, 3, 1], marks: { '0': 'target', '3': 'bad' } }, { label: 'set', items: ['1', '2', '3'], marks: { '0': 'hit' } }],
          },
        },
      ],
    },
    edges: ['A single element: [7] → false.', 'All values equal: [5, 5, 5] → true (found at index 1).', 'All distinct: [1, 2, 3, 4] → false.'],
  },

  'valid-anagram': {
    aha: 'Order doesn\'t matter, only how many of each letter. Count up for every letter of s and down for every letter of t; they are anagrams exactly when every count ends at 0.',
    asks: {
      observe: 'How many a\'s are in "anagram", and how many in "nagaram"? Does the order of the letters matter?',
      pattern: 'If only letter counts matter, what is the simplest table that can hold them?',
      read: 'Which phrase tells you the order of the letters doesn\'t matter?',
      budget: '5 × 10⁴ letters each. What does crossing letters off one by one cost?',
      brute: 'Finding and crossing off each letter in t works. What is rescanned every time?',
      watch: 'Watch one table count up for s and down for t.',
    },
    read: [
      { phrase: 'exactly the same letters, each the same number of times', says: 'Equal letter counts. That is the whole condition.' },
      { phrase: 'possibly in a different order', says: 'Positions are irrelevant: compare counts (or sorted letters), never positions.' },
      { phrase: 'lowercase English letters only', says: 'Only 26 possible letters, so an array of 26 counters works as the table.' },
    ],
    budget: { from: 's.length, t.length ≤ 5 × 10⁴', n: 50000, aim: 'O(n)', note: 'Crossing letters off one by one is O(n²), about 2.5 × 10⁹ steps.' },
    observe: [
      {
        title: 'Only the counts matter',
        text: '"anagram" and "nagaram" look different, but both have three a\'s and one each of g, m, n and r.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'counts in "anagram"', items: ['a:3', 'g:1', 'm:1', 'n:1', 'r:1'] },
            {
              label: 'counts in "nagaram"',
              items: ['a:3', 'g:1', 'm:1', 'n:1', 'r:1'],
              marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit', '4': 'hit' },
            },
          ],
        },
      },
      {
        title: 'One table: up for s, down for t',
        text: 'Add 1 for every letter of s and subtract 1 for every letter of t. If any count is not 0 at the end, some letter is unbalanced.',
        sketch: {
          kind: 'array',
          rows: [{ label: '"rat" vs "car"', items: ['a:0', 'c:−1', 'r:0', 't:+1'], marks: { '1': 'bad', '3': 'bad' } }],
          caption: 'c and t are unbalanced: not anagrams',
        },
      },
    ],
    brute: {
      idea: 'For each letter of s, find an unused copy in t and cross it off.',
      cost: 'O(n²)',
      waste: 'Every search rescans t for one letter, when a count per letter answers at once.',
    },
    pattern: {
      pick: 'hashing',
      why: 'Compare two bags of letters: count each letter in a table (26 slots), up for s and down for t, then check that every count is 0. O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting both strings and comparing them works, at O(n log n).' },
        { id: 'sliding-window', why: 'A sliding window finds anagrams of p inside a longer string; here both strings are compared whole.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Lengths match (7 and 7)',
          text: 'Different lengths would mean false straight away.',
          sketch: {
            kind: 'array',
            rows: [{ label: 's', items: ['a', 'n', 'a', 'g', 'r', 'a', 'm'] }, { label: 't', items: ['n', 'a', 'g', 'a', 'r', 'a', 'm'] }],
          },
        },
        {
          title: 'Count up for s',
          text: 'Each letter of "anagram" adds 1.',
          sketch: { kind: 'array', rows: [{ items: ['a:3', 'g:1', 'm:1', 'n:1', 'r:1'], marks: { '0': 'cur' } }] },
        },
        {
          title: 'Count down for t: all zero → true',
          text: 'Each letter of "nagaram" removes 1, and every count returns to 0.',
          sketch: {
            kind: 'array',
            rows: [{ items: ['a:0', 'g:0', 'm:0', 'n:0', 'r:0'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit', '4': 'hit' } }],
          },
        },
      ],
    },
    edges: ['Different lengths: "ab", "a" → false.', 'The same string: "abc", "abc" → true.', 'Same letters, different counts: "aab", "abb" → false.'],
  },

  'first-unique-character-in-a-string': {
    aha: 'You can\'t tell that a letter is unique the moment you meet it; later copies may come. So count every letter first, then walk the string again and stop at the first letter whose count is 1.',
    asks: {
      observe: 'In "loveleetcode", the l at index 0 looks unique at first. When do you find out it isn\'t?',
      pattern: 'Uniqueness needs the whole string; "first" needs the original order. How can two passes give you both?',
      read: 'Which phrase means you can\'t decide about a letter until you\'ve seen the whole string?',
      budget: '10⁵ letters. What does checking each position against the whole string cost?',
      brute: 'Scanning the whole string for every position works. What does it recount?',
      watch: 'Watch the counts fill in, then the second pass stop at the first count of 1.',
    },
    read: [
      {
        phrase: 'appears exactly once in the whole string',
        says: 'Uniqueness depends on the whole string, so we can only decide after seeing all of it: count first.',
      },
      { phrase: 'the first character', says: 'Among the unique letters, the earliest: a second pass in string order.' },
      { phrase: 'If every character repeats, return `-1`', says: 'The second pass may finish without finding anything.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Checking each position against the whole string is 10¹⁰ steps.' },
    observe: [
      {
        title: 'You can\'t decide on first sight',
        text: 'In "loveleetcode", the l at index 0 looks unique until another l turns up at index 4. Only after the whole string do we know which letters appear once.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['l', 'o', 'v', 'e', 'l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { '0': 'bad', '2': 'hit', '4': 'bad' } }],
          caption: 'v (index 2) is the first letter that appears once',
        },
      },
      {
        title: 'Two passes: count, then scan in order',
        text: 'The first pass fills a table of counts. The second pass reads the string from the start and stops at the first letter with count 1.',
        sketch: { kind: 'array', rows: [{ label: 'counts', items: ['l:2', 'o:2', 'v:1', 'e:4', 't:1', 'c:1', 'd:1'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each position, scan the whole string for another copy of its letter; return the first position with none.',
      cost: 'O(n²)',
      waste: 'The same letter is counted from scratch every time it is checked.',
    },
    pattern: {
      pick: 'hashing',
      why: 'A count table (26 counters) answers "how many times does c appear?" in one step, and a second pass keeps the original order. O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting groups equal letters but loses their positions, and we need the first index.' },
        { id: 'sliding-window', why: 'There is no window: uniqueness is about the whole string.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Pass 1: count every letter',
          text: '"loveleetcode": l 2, o 2, v 1, e 4, t 1, c 1, d 1. Only now do we know which letters appear once.',
          sketch: { kind: 'array', rows: [{ items: ['l', 'o', 'v', 'e', 'l', 'e', 'e', 't', 'c', 'o', 'd', 'e'] }], caption: 'l:2 o:2 v:1 e:4 t:1 c:1 d:1' },
        },
        {
          title: 'Pass 2: l and o repeat',
          text: 'Index 0 is l (count 2) and index 1 is o (count 2): both appear again later, so neither is the answer.',
          sketch: { kind: 'array', rows: [{ items: ['l', 'o', 'v', 'e', 'l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { '0': 'bad', '1': 'bad' } }] },
        },
        {
          title: 'Index 2 is v, count 1 → 2',
          text: 'The first letter, in string order, whose count is 1. Stop here: later unique letters (t, c, d) come after it.',
          sketch: {
            kind: 'array',
            rows: [{ items: ['l', 'o', 'v', 'e', 'l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { '0': 'dim', '1': 'dim', '2': 'hit' } }],
            caption: 'answer 2',
          },
        },
      ],
    },
    edges: ['Every letter repeats: "aabb" → −1.', 'A single letter: "z" → 0.', 'The only unique letter is the last: "aabbc" → 4.'],
  },

  'concatenation-of-array': {
    aha: 'The answer is the array written twice, so its size (2n) is known in advance: make an array of 2n and write each value to two places, i and i + n.',
    asks: {
      observe: 'In [1, 2, 1], which two positions of the answer receive nums[0]?',
      pattern: 'If you know exactly where each value goes, do you need to search for anything?',
      read: 'Which formula tells you exactly where each value goes?',
      budget: 'The output has 2n values. Can any solution be faster than O(n)?',
      brute: 'Appending to a growing list works. What does a known size let you skip?',
      watch: 'Watch each value get written to position i and position i + n.',
    },
    read: [
      { phrase: '`ans[i] == nums[i]` and `ans[i + n] == nums[i]`', says: 'Each value goes to two positions, i and i + n: pure index arithmetic.' },
      { phrase: '`ans` is `nums` written twice in a row', says: 'The output size, 2n, is known before we start.' },
    ],
    budget: { from: 'nums.length ≤ 1000', n: 1000, aim: 'O(n)', note: 'The output itself has 2n values, so O(n) is the best possible.' },
    observe: [
      {
        title: 'Two copies, side by side',
        text: 'Position i and position i + n hold the same value, so one loop can fill both.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 2, 1, 1, 2, 1],
              marks: { '0': 'cur', '3': 'cur' },
              bands: [{ from: 0, to: 2, tone: 'accent', label: 'first copy' }, { from: 3, to: 5, tone: 'ghost', label: 'second copy' }],
            },
          ],
        },
      },
      {
        title: 'Allocate once',
        text: 'Because the size is known, create the array of 2n slots up front and fill it; no growing list needed.',
        sketch: { kind: 'array', rows: [{ label: 'empty answer, 2n = 6 slots', items: ['·', '·', '·', '·', '·', '·'] }] },
      },
    ],
    brute: {
      idea: 'Append every value to a growing list, twice over, then convert it to an array.',
      cost: 'O(n)',
      waste: 'Already linear; it just pays for list growth and a final copy that a fixed-size array avoids.',
    },
    pattern: {
      pick: 'hashing',
      why: 'A warm-up for "index → value" thinking: an array is the simplest lookup table, and here positions are computed, never searched.',
      not: [
        { id: 'two-pointers', why: 'Nothing moves towards anything; each position is written directly.' },
        { id: 'prefix-sums', why: 'No sums or ranges are computed; every output position is copied straight from one input position.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'i = 0: write 1 at 0 and 3',
          text: 'ans[0] = ans[3] = nums[0] = 1.',
          sketch: { kind: 'array', rows: [{ items: [1, '·', '·', 1, '·', '·'], marks: { '0': 'hit', '3': 'hit' } }] },
        },
        {
          title: 'i = 1: write 2 at 1 and 4',
          text: 'ans[1] = ans[4] = 2.',
          sketch: { kind: 'array', rows: [{ items: [1, 2, '·', 1, 2, '·'], marks: { '1': 'hit', '4': 'hit' } }] },
        },
        {
          title: 'i = 2: write 1 at 2 and 5',
          text: 'Done: [1, 2, 1, 1, 2, 1].',
          sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 1, 2, 1], marks: { '2': 'hit', '5': 'hit' } }] },
        },
      ],
    },
    edges: [
      'A single value: [7] → [7, 7].',
      'Repeated values are copied as they are: [1, 1] → [1, 1, 1, 1].',
      'The order is kept, not sorted: [3, 1] → [3, 1, 3, 1].',
    ],
  },

  'majority-element': {
    aha: 'The majority outnumbers all the other values put together. So if you cancel out pairs of different values, the majority is what survives, and one candidate plus a counter does that cancelling.',
    asks: {
      observe: 'In [2, 2, 1, 1, 1, 2, 2], if every 1 "cancels" one 2, what is left?',
      pattern: 'Counting every value needs a map. What is special about a value that appears more than half the time?',
      read: 'Which phrase makes the majority stronger than all other values combined?',
      budget: '5 × 10⁴ values in O(1) extra space. What does that rule out?',
      brute: 'Counting each value with a nested loop works. What is recounted?',
      watch: 'Watch votes cancel in pairs and the candidate change when the count hits 0.',
    },
    read: [
      { phrase: 'appears more than `⌊n / 2⌋` times', says: 'The majority outnumbers all the other values combined. That is a very strong property.' },
      { phrase: 'You may assume it always exists', says: 'No need to double-check the final candidate.' },
      { phrase: 'O(n) time and O(1) extra space', says: 'A count map uses O(n) space; the follow-up wants something smarter: voting.' },
    ],
    budget: { from: 'nums.length ≤ 5 × 10⁴', n: 50000, aim: 'O(n), O(1) space', note: 'Counting each value with a nested loop is 2.5 × 10⁹ steps.' },
    observe: [
      {
        title: 'Counting works, but uses memory',
        text: 'A map of value → count finds the value above n / 2 in one pass: O(n) time, but O(n) extra space.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'counts for [2, 2, 1, 1, 1, 2, 2]', items: ['2: 4', '1: 3'], marks: { '0': 'hit' } }],
          caption: '4 > 7 / 2: the majority is 2',
        },
      },
      {
        title: 'Pair off different values',
        text: 'Cancel one 2 against one 1, again and again. Each cancellation removes at most one copy of the majority, and it has more copies than everyone else, so some copies survive.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [2, 2, 1, 1, 1, 2, 2],
              marks: { '0': 'muted', '1': 'muted', '2': 'muted', '3': 'muted', '4': 'muted', '5': 'muted', '6': 'hit' },
            },
          ],
          caption: 'three 2–1 pairs cancel; one 2 survives',
        },
      },
      {
        title: 'A candidate and a counter do the pairing',
        text: 'Same as the candidate: count + 1. Different: count − 1. When the count hits 0, the next value becomes the new candidate.',
        sketch: { kind: 'array', rows: [{ label: 'count after each value', items: [1, 2, 1, 0, 1, 0, 1], marks: { '6': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each position, count how often its value appears in the whole array.',
      cost: 'O(n²)',
      waste: 'The same value is recounted every time it appears.',
    },
    pattern: {
      pick: 'hashing',
      why: 'Counting values with a map is the first answer (O(n)). The follow-up, Boyer–Moore voting, keeps one candidate and a counter: O(n) time, O(1) space.',
      not: [
        { id: 'sorting-and-selection', why: 'After sorting, the middle element is always the majority: correct, but O(n log n).' },
        { id: 'two-pointers', why: 'There is no pair or window to steer; we are counting votes.' },
      ],
    },
    watch: {
      frames: [
        {
          title: '2, 2: candidate 2, count 2',
          text: 'The first 2 becomes the candidate; the second adds a vote.',
          sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { '0': 'kept', '1': 'cur' } }] },
        },
        {
          title: '1, 1: count back to 0',
          text: 'Each 1 cancels one vote for 2.',
          sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { '2': 'cur', '3': 'cur' } }] },
        },
        {
          title: '1: new candidate 1, count 1',
          text: 'With the count at 0, the next value takes over.',
          sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { '4': 'target' } }] },
        },
        {
          title: '2, 2: candidate 2 wins',
          text: 'The first 2 cancels the 1 (count 0); the last 2 becomes the candidate. Answer: 2.',
          sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { '6': 'hit' } }] },
        },
      ],
    },
    edges: ['A single element: [5] → 5.', 'The majority only in the second half: [1, 2, 2] → 2.', 'Negative values: [−1, −1, 3] → −1.'],
  },

  'verifying-an-alien-dictionary': {
    aha: 'Turn every letter into its position in the alien alphabet, and the words compare like ordinary dictionary words. A list is sorted exactly when every word is not after the next one, so only neighbours need checking.',
    asks: {
      observe: 'In the order "hlabc…", which comes first: h or l? So is "hello" before "leetcode"?',
      pattern: 'To check that a list is sorted, do you need to compare every pair, or only neighbours?',
      read: 'Which phrase covers the case where one word is a prefix of another?',
      budget: 'At most 100 words of 20 letters. What matters more here than speed?',
      brute: 'Checking every pair of words works. Which comparisons are enough to prove the list is sorted?',
      watch: 'Watch neighbouring words compared at their first different letter, using the alien ranks.',
    },
    read: [
      {
        phrase: '`order` lists them from first to last',
        says: 'Each letter has a rank: build letter → position once, then compare ranks in one step.',
      },
      { phrase: 'compare two words at their first differing letter', says: 'Ordinary dictionary comparison, with the new ranks.' },
      {
        phrase: 'if one word is a prefix of the other, the shorter word comes first',
        says: 'An edge case to handle: "apple" before "app" is out of order.',
      },
    ],
    budget: {
      from: 'up to 100 words of up to 20 letters',
      n: 2000,
      aim: 'O(total letters)',
      note: 'Tiny limits; the point is a clean comparison, not speed.',
    },
    observe: [
      {
        title: 'A rank table turns letters into numbers',
        text: 'With order "hlabcdefgijk…", h has rank 0 and l rank 1. Comparing two letters becomes comparing two small numbers.',
        sketch: { kind: 'array', rows: [{ label: 'rank', items: ['h:0', 'l:1', 'a:2', 'b:3', '…'], marks: { '0': 'kept', '1': 'kept' } }] },
      },
      {
        title: 'Only neighbours need checking',
        text: 'If every word is not after the next one, the whole list is in order (A ≤ B and B ≤ C give A ≤ C). So n − 1 comparisons are enough.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['word', 'world', 'row'], marks: { '0': 'cur', '1': 'cur' } }],
          caption: 'compare word/world, then world/row',
        },
      },
      {
        title: 'Watch for the prefix case',
        text: 'If all the shared letters match, the shorter word must come first: "apple" followed by "app" is out of order.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'p', 'p', 'l', 'e'], marks: { '3': 'bad', '4': 'bad' } }, { items: ['a', 'p', 'p'] }] },
      },
    ],
    brute: {
      idea: 'Translate every word into English letters by rank, then check every pair i < j with normal string comparison.',
      cost: 'O(n² · m)',
      waste: 'Comparing all pairs repeats what neighbour checks already prove, and the translation is unnecessary with a rank table.',
    },
    pattern: {
      pick: 'hashing',
      why: 'A lookup table (letter → rank) makes each letter comparison one step; then compare neighbouring words only. O(total letters).',
      not: [
        {
          id: 'sorting-and-selection',
          why: 'We don\'t need to sort anything, only to check whether it is already sorted, which is one pass over neighbours.',
        },
        { id: 'tries', why: 'A trie stores words for prefix queries; here we compare a fixed list once.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Build the rank table',
          text: 'order = "hlabcdefgijk…": h → 0, l → 1, a → 2, …. Comparing two letters is now comparing two small numbers.',
          sketch: { kind: 'array', rows: [{ label: 'rank', items: ['h 0', 'l 1', 'a 2', 'b 3', '…'] }] },
        },
        {
          title: '"hello" vs "leetcode": h < l ✓',
          text: 'They differ at the first letter: rank(h) = 0 < rank(l) = 1, so this pair is in order. The other letters don\'t matter.',
          sketch: {
            kind: 'array',
            rows: [
              { label: 'hello', items: ['h', 'e', 'l', 'l', 'o'], marks: { '0': 'hit' } },
              { label: 'leetcode', items: ['l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { '0': 'hit' } },
            ],
            caption: 'true',
          },
        },
        {
          title: 'Another order: "word" vs "world" fails',
          text: 'With order = "worldabcef…", the words first differ at index 3: d (rank 4) vs l (rank 3). d is later, so "word" should come after "world": false.',
          sketch: {
            kind: 'array',
            rows: [
              { label: 'word', items: ['w', 'o', 'r', 'd'], marks: { '3': 'bad' } },
              { label: 'world', items: ['w', 'o', 'r', 'l', 'd'], marks: { '3': 'bad' } },
            ],
            caption: 'rank(d) = 4 > rank(l) = 3 → false',
          },
        },
      ],
    },
    edges: ['A word followed by its own prefix: ["apple", "app"] → false.', 'Identical neighbours: ["a", "a"] → true.', 'A single word → true.'],
  },

  'group-anagrams': {
    aha: 'Anagrams become the same word once their letters are sorted ("eat", "tea" and "ate" all become "aet"). Use that sorted word as a key in a map, and each key collects one group.',
    asks: {
      observe: 'What do "eat", "tea" and "ate" turn into if you sort their letters? And "tan" and "nat"?',
      pattern: 'If every word in a group shares one label, what structure collects words by label?',
      read: 'Which phrase tells you what makes two words belong to the same group?',
      budget: '10⁴ words of up to 100 letters. What does comparing every pair cost?',
      brute: 'Testing each word against every group works. What would tell you its group directly?',
      watch: 'Watch each word\'s sorted letters pick its group in the map.',
    },
    read: [
      { phrase: 'Group together', says: 'Collect words that share some label: that is a map from label to the list of words with it.' },
      {
        phrase: 'the same letters with the same counts',
        says: 'Anagrams share one shared form, their sorted letters (or their 26 counts). That is the label.',
      },
      { phrase: 'Return the groups in any order', says: 'The map\'s own order is fine.' },
    ],
    budget: {
      from: 'up to 10⁴ strings of up to 100 letters',
      rows: [
        ['compare words pairwise', '10⁸ × 100 = 10¹⁰', 'bad'],
        ['sort each word as a key', '10⁴ × 100 log 100 ≈ 7 × 10⁶', 'ok'],
        ['count letters as a key', '10⁴ × 100 = 10⁶', 'ok'],
      ],
      aim: 'O(n · L)',
      note: 'Pairwise comparison is far too slow; one key per word is linear.',
    },
    observe: [
      {
        title: 'Anagrams share their sorted letters',
        text: '"eat", "tea" and "ate" all sort to "aet", and "tan" and "nat" to "ant". So the sorted word names the group.',
        sketch: {
          kind: 'array',
          rows: [
            { items: ['eat', 'tea', 'ate', 'tan', 'nat', 'bat'], marks: { '0': 'kept', '1': 'kept', '2': 'kept', '3': 'target', '4': 'target' } },
            {
              label: 'key',
              items: ['aet', 'aet', 'aet', 'ant', 'ant', 'abt'],
              marks: { '0': 'kept', '1': 'kept', '2': 'kept', '3': 'target', '4': 'target' },
            },
          ],
        },
      },
      {
        title: 'Key → list does the grouping',
        text: 'Put each word into the list for its key. One pass over the words builds every group.',
        sketch: { kind: 'array', rows: [{ label: 'map', items: ['aet → eat, tea, ate', 'ant → tan, nat', 'abt → bat'] }] },
      },
    ],
    brute: {
      idea: 'For each word, test it against one member of every existing group with an anagram check; join a match or start a new group.',
      cost: 'O(n² · L)',
      waste: 'Each word is compared with all groups, when a key would say directly which group it belongs to.',
    },
    pattern: {
      pick: 'hashing',
      why: 'Group by a shared key in a hash map: the sorted word (or the 26 letter counts) is the same exactly for anagrams. O(n · L log L), or O(n · L) with counts.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting each word only builds the key; the map does the grouping.' },
        { id: 'sliding-window', why: 'A sliding window finds anagrams inside one string; here we compare whole words.' },
      ],
    },
    watch: {
      frames: [
        {
          title: '"eat" → key "aet"',
          text: 'A new key: start the group ["eat"].',
          sketch: { kind: 'array', rows: [{ label: 'map', items: ['aet → eat'] }] },
        },
        {
          title: '"tea", "ate" → "aet" again',
          text: 'Same key: the group grows to ["eat", "tea", "ate"].',
          sketch: { kind: 'array', rows: [{ label: 'map', items: ['aet → eat, tea, ate'], marks: { '0': 'hit' } }] },
        },
        {
          title: '"tan", "nat" → "ant"; "bat" → "abt"',
          text: 'Two more groups: [["eat","tea","ate"], ["tan","nat"], ["bat"]].',
          sketch: { kind: 'array', rows: [{ label: 'map', items: ['aet → 3 words', 'ant → 2 words', 'abt → 1 word'], marks: { '1': 'hit', '2': 'hit' } }] },
        },
      ],
    },
    edges: ['The empty string: [""] → [[""]].', 'All anagrams of each other: ["ab", "ba"] → [["ab", "ba"]].', 'A single word: ["a"] → [["a"]].'],
  },

  'longest-consecutive-sequence': {
    aha: 'Put every number in a set so "is x + 1 here?" takes one step. Then only start counting from numbers that begin a run (x − 1 is missing); that way each number is visited about twice in total.',
    asks: {
      observe: 'In [100, 4, 200, 1, 3, 2], which numbers start a run (nothing one below them)?',
      pattern: 'You keep asking "is this value present?". Which structure answers that in one step?',
      read: 'Which phrase rules out sorting?',
      budget: '10⁵ values in O(n). What does counting a run from every value cost?',
      brute: 'Counting from every value by scanning the array is very slow. What makes it slow, twice over?',
      watch: 'Watch runs counted only from their first value.',
    },
    read: [
      {
        phrase: '`nums` is unsorted and may contain duplicates',
        says: 'Positions don\'t matter and duplicates must not break a run: think of the values as a set.',
      },
      { phrase: 'consecutive integers', says: 'For a value x, the next one in its run is x + 1: a "is it present?" question.' },
      {
        phrase: 'should run in O(n) time, so sorting is not the intended approach',
        says: 'Sorting would be O(n log n); we need one-step lookups instead.',
      },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'Sorting fits in time but is ruled out by the statement; counting runs from every value can be O(n²).',
    },
    observe: [
      {
        title: '"Is x + 1 here?" is a set lookup',
        text: 'Put every value in a hash set. Then extending a run from x is a few one-step lookups: x + 1, x + 2, ….',
        sketch: {
          kind: 'array',
          rows: [{ items: [100, 4, 200, 1, 3, 2], marks: { '1': 'hit', '3': 'hit', '4': 'hit', '5': 'hit' } }],
          caption: '1, 2, 3, 4 are all present: a run of 4',
        },
      },
      {
        title: 'Only count from the start of a run',
        text: 'If x − 1 is in the set, x is in the middle of a run that will be counted from its start, so skip it. Here only 100, 200 and 1 start runs.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [100, 4, 200, 1, 3, 2],
              marks: { '0': 'target', '1': 'muted', '2': 'target', '3': 'target', '4': 'muted', '5': 'muted' },
              tags: { '0': [['start', 'warn']], '2': [['start', 'warn']], '3': [['start', 'warn']] },
            },
          ],
        },
      },
    ],
    brute: {
      idea: 'From every value x, look for x + 1, x + 2, … by scanning the array each time.',
      cost: 'O(n³)',
      waste: 'Each lookup scans the whole array, and the same run is counted again from every value inside it.',
    },
    pattern: {
      pick: 'hashing',
      why: 'A hash set answers "is v present?" in one step, and counting only from run starts (x − 1 absent) keeps the total work O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sort and count runs works, but is O(n log n), which the statement rules out.' },
        { id: 'prefix-sums', why: 'No sums over ranges here; runs are about values, not positions.' },
      ],
    },
    watch: {
      viz: 'ConsecutiveSetViz',
      inputs: [
        { label: '[100, 4, 200, 1, 3, 2]', input: { nums: [100, 4, 200, 1, 3, 2] } },
        { label: 'with repeats', input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] } },
      ],
    },
    edges: ['An empty array: [] → 0.', 'Duplicates: [1, 2, 2, 3] → 3.', 'Negative values: [−1, 0, 1] → 3.'],
  },

  'valid-sudoku': {
    aha: 'Each filled cell must be the only copy of its digit in three places: its row, its column and its 3 × 3 box. Keep a "seen" set for every row, column and box, and check each cell against its three sets in one pass.',
    asks: {
      observe: 'Which box is the cell in row 4, column 5? How would you compute that from the numbers 4 and 5?',
      pattern: '"At most once" means "have I seen this digit here before?". What answers that for 27 different units?',
      read: 'Which phrase tells you this is checking, not solving?',
      budget: 'The board is always 9 × 9. So what matters: speed, or a clean single pass?',
      brute: 'Checking rows, then columns, then boxes separately works. How many passes is that?',
      watch: 'Watch each filled cell checked against its row, column and box sets.',
    },
    read: [
      { phrase: 'each row contains the digits 1–9 at most once', says: '"At most once" is a seen-before check, one per row.' },
      {
        phrase: 'each of the nine 3 × 3 boxes contains the digits 1–9 at most once',
        says: 'The same check for boxes; we need a way to name the box a cell is in.',
      },
      { phrase: 'Only check the filled cells; the board does not need to be solvable', says: 'This is checking, not solving: no search needed.' },
    ],
    budget: {
      from: 'a fixed 9 × 9 board',
      rows: [['check each cell against its row, column and box', '81 × 3 lookups', 'ok']],
      aim: 'one pass',
      note: 'The board size is fixed, so any approach is fast; aim for one clean pass.',
    },
    observe: [
      {
        title: 'Each cell belongs to three units',
        text: 'A row, a column and a box. A digit may appear only once in each of them.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
          marks: { '1,1': 'cur', '1,0': 'ring', '1,2': 'ring', '0,1': 'ring', '2,1': 'ring' },
          caption: 'a cell, its row and its column (and its box)',
        },
      },
      {
        title: 'Name the box with arithmetic',
        text: 'The box of cell (r, c) is (r / 3) · 3 + c / 3, with whole-number division: boxes 0 to 8, left to right, top to bottom.',
        sketch: {
          kind: 'grid',
          grid: [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
          marks: { '1,1': 'cur' },
          labels: { '0,0': '0', '0,1': '1', '0,2': '2', '1,0': '3', '1,1': '4', '1,2': '5', '2,0': '6', '2,1': '7', '2,2': '8' },
          caption: 'cell (4, 5) is in box (4/3)·3 + 5/3 = 4',
        },
      },
    ],
    brute: {
      idea: 'Check the 9 rows, then the 9 columns, then the 9 boxes, each with its own fresh seen-table.',
      cost: 'O(n²)',
      waste: 'Three separate sweeps of the board with fiddly box loops; one pass with all three tables does the same work once.',
    },
    pattern: {
      pick: 'hashing',
      why: '"At most once per unit" is a seen-before check: one set (or 9-bit mask) per row, column and box, filled in one pass.',
      not: [
        { id: 'backtracking', why: 'Backtracking solves a Sudoku; here we only check the filled cells.' },
        { id: 'two-pointers', why: 'No pairs to steer; each cell is checked against what was seen.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Cell (0, 0) = 5',
          text: 'Not yet seen in row 0, column 0 or box 0: record 5 in all three.',
          sketch: { kind: 'grid', grid: [[5, 3, 0], [6, 0, 0], [0, 9, 8]], marks: { '0,0': 'cur' } },
        },
        {
          title: 'Cell (0, 1) = 3',
          text: 'Not in row 0, column 1 or box 0: record it.',
          sketch: { kind: 'grid', grid: [[5, 3, 0], [6, 0, 0], [0, 9, 8]], marks: { '0,0': 'hit', '0,1': 'cur' } },
        },
        {
          title: 'Every filled cell, once → true',
          text: 'If a digit were already in one of its three sets, the answer would be false. The pass ends with no clash: the example board is valid.',
          sketch: { kind: 'grid', grid: [[5, 3, 0], [6, 0, 0], [0, 9, 8]], marks: { '0,0': 'hit', '0,1': 'hit', '1,0': 'hit', '2,1': 'hit', '2,2': 'hit' } },
        },
      ],
    },
    edges: [
      'An empty board (all dots) → true.',
      'Two 8s in the same box but different rows and columns → false.',
      'A board of only dots and one digit → true (dots are skipped, never counted as a digit).',
    ],
  },

  'encode-and-decode-strings': {
    aha: 'Instead of a separator (which might appear inside a string), write each string\'s length first: "4#neet". The reader takes exactly that many characters, so nothing inside a string can confuse it.',
    asks: {
      observe: 'If you join ["a#b"] and ["a", "b"] with "#", what does each become? Can the decoder tell them apart?',
      pattern: 'How can the decoder know where a string ends without looking for a special character?',
      read: 'Which phrase warns you that no separator character is safe?',
      budget: 'The total size is small. What is the real difficulty here?',
      brute: 'Escaping the separator inside strings works. Why is it fragile?',
      watch: 'Watch the decoder read a length, then take exactly that many characters.',
    },
    read: [
      {
        phrase: 'including whatever separator you might pick',
        says: 'Joining with a separator is ambiguous: the separator may appear inside a string.',
      },
      { phrase: 'can be empty', says: 'Empty strings must survive the round trip too.' },
      { phrase: 'you cannot keep the list in a field', says: 'The encoded string must carry all the information on its own.' },
    ],
    budget: {
      from: 'up to 99 strings of up to 199 characters',
      rows: [['one pass to encode, one to decode', 'about 2 × 10⁴ characters', 'ok']],
      aim: 'O(total length)',
      note: 'Speed is easy; the challenge is a format that can\'t be misread.',
    },
    observe: [
      {
        title: 'A plain separator is ambiguous',
        text: 'With "#" as separator, ["a#b"] and ["a", "b"] both encode to "a#b". The decoder can\'t tell them apart.',
        sketch: { kind: 'array', rows: [{ items: ['a', '#', 'b'], marks: { '1': 'bad' }, tags: { '1': [['separator or text?', 'danger']] } }] },
      },
      {
        title: 'Say the length first',
        text: 'Write each string as its length, a "#", then the string: "4#neet". The decoder reads the number and takes exactly that many characters.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['4', '#', 'n', 'e', 'e', 't', '4', '#', 'c', 'o', 'd', 'e'],
              bands: [{ from: 2, to: 5, tone: 'accent' }, { from: 8, to: 11, tone: 'accent' }],
              marks: { '0': 'target', '6': 'target' },
            },
          ],
        },
      },
    ],
    brute: {
      idea: 'Join the strings with a separator after "escaping" every separator and escape character inside them.',
      cost: 'O(L)',
      waste: 'Every character must be inspected and possibly escaped, and the decoder must undo it: easy to get subtly wrong.',
    },
    pattern: {
      pick: 'hashing',
      why: 'Write each string as its length, "#", then the characters. The decoder reads digits up to "#" and takes exactly that many characters, so no character inside a string can be mistaken for a boundary. O(total length) both ways.',
      not: [
        { id: 'sliding-window', why: 'Nothing is searched for; the decoder reads fixed-size chunks it was told about.' },
        { id: 'two-pointers', why: 'The decoder does use an index, but only to read numbers and fixed lengths.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Encode',
          text: '["neet","code","love","you"] → "4#neet4#code4#love3#you".',
          sketch: { kind: 'array', rows: [{ items: ['4#neet', '4#code', '4#love', '3#you'] }] },
        },
        {
          title: 'Decode: read 4, take "neet"',
          text: 'Read digits up to "#", then take that many characters.',
          sketch: {
            kind: 'array',
            rows: [{ items: ['4', '#', 'n', 'e', 'e', 't', '4', '#', '…'], marks: { '0': 'target', '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit' } }],
          },
        },
        {
          title: 'Repeat until the end',
          text: 'Four strings come back, exactly as they went in.',
          sketch: { kind: 'array', rows: [{ items: ['neet', 'code', 'love', 'you'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
        },
      ],
    },
    edges: ['An empty list: [] → "" → [].', 'An empty string inside: [""] → "0#" → [""].', 'Strings with "#" and digits: ["1#2"] → "3#1#2" → ["1#2"].'],
  },

  'majority-element-ii': {
    aha: 'At most two values can appear more than n / 3 times (three of them would need more than n elements). So keep two candidates, cancel triples of different values, then count the two survivors to confirm.',
    asks: {
      observe: 'Why can no array have three different values that each appear more than n / 3 times?',
      pattern: 'With at most two possible answers, how many candidates do you need to track?',
      read: 'Which phrase limits how many values can possibly qualify?',
      budget: '5 × 10⁴ values in O(1) extra space. What does that rule out?',
      brute: 'Counting every distinct value works. What is recounted?',
      watch: 'Watch two candidates collect votes, triples cancel, and a final count confirm.',
    },
    read: [
      { phrase: 'more than `⌊n / 3⌋` times', says: 'Three such values would add up to more than n elements: at most two values qualify.' },
      { phrase: 'in any order', says: 'We return a short list: zero, one or two values.' },
      { phrase: 'O(n) time and O(1) extra space', says: 'Again a count map is ruled out: voting, now with two candidates.' },
    ],
    budget: { from: 'nums.length ≤ 5 × 10⁴', n: 50000, aim: 'O(n), O(1) space', note: 'Counting each value with a nested loop is 2.5 × 10⁹ steps.' },
    observe: [
      {
        title: 'At most two answers',
        text: 'With n = 8, a qualifying value needs at least 3 copies; three such values would need 9 > 8 elements. So keep two candidates.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 1, 1, 3, 3, 2, 2, 2], bands: [{ from: 0, to: 2, tone: 'success' }, { from: 5, to: 7, tone: 'success' }] }],
          caption: '1 and 2 each appear 3 times > ⌊8 / 3⌋ = 2',
        },
      },
      {
        title: 'Cancel triples, then verify',
        text: 'A value matching neither candidate cancels one vote from each. Unlike the n / 2 version, an answer isn\'t guaranteed, so count the two survivors at the end.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 1, 1, 3, 3, 2, 2, 2], marks: { '3': 'muted', '4': 'muted' } }],
          caption: 'the 3s only cancel votes; they never win',
        },
      },
    ],
    brute: {
      idea: 'For every distinct value, count its copies across the whole array.',
      cost: 'O(n²)',
      waste: 'Values are recounted from scratch each time.',
    },
    pattern: {
      pick: 'hashing',
      why: 'Counting with a map is the first answer. The follow-up is voting with two candidates and a checking pass: O(n) time, O(1) space.',
      not: [
        { id: 'sorting-and-selection', why: 'Sort and measure runs works, at O(n log n).' },
        { id: 'heap-patterns', why: 'A top-k heap over counts is overkill: at most two values can qualify.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Vote: candidates 1 and 2',
          text: 'The 1s and 2s gather votes; the 3s arrive when both candidates are set and cancel one vote from each.',
          sketch: {
            kind: 'array',
            rows: [{ items: [1, 1, 1, 3, 3, 2, 2, 2], marks: { '0': 'kept', '1': 'kept', '2': 'kept', '3': 'muted', '4': 'muted' } }],
          },
        },
        {
          title: 'Survivors: 1 and 2',
          text: 'These are the only possible answers.',
          sketch: { kind: 'array', rows: [{ label: 'candidates', items: ['1', '2'], marks: { '0': 'target', '1': 'target' } }] },
        },
        {
          title: 'Verify by counting → [1, 2]',
          text: '1 appears 3 times and 2 appears 3 times; ⌊8 / 3⌋ = 2, so both qualify.',
          sketch: { kind: 'array', rows: [{ label: 'counts', items: ['1: 3', '2: 3'], marks: { '0': 'hit', '1': 'hit' } }] },
        },
      ],
    },
    edges: ['[3, 2, 3] → [3].', '[1, 2]: both appear once, more than ⌊2 / 3⌋ = 0 → [1, 2].', 'Nothing qualifies: [1, 2, 3] → [].'],
  },

  'first-missing-positive': {
    aha: 'The answer is always between 1 and n + 1, so only values 1 … n matter. Use the array itself as the "seen" set: put each such value v in seat v − 1, then the first seat without its own number is the answer.',
    asks: {
      observe: 'With 4 numbers in the array, can the answer ever be bigger than 5? Which values can you ignore?',
      pattern: 'You may not use a set, but you may change the array. How can index v − 1 remember "v is here"?',
      budget: '10⁵ values in O(1) extra space. What does a hash set cost, and what does trying 1, 2, 3, … cost?',
      brute: 'Trying 1, 2, 3, … with a full scan each works. How many scans can that take?',
      watch: 'Watch each value 1 … n swap into its own seat, then the first wrong seat give the answer.',
      read: 'The answer has a hidden upper bound, some values can be ignored, and the space limit bans the obvious tool. Which phrase gives each?',
    },
    read: [
      {
        phrase: 'smallest positive integer (1, 2, 3, …) that does not appear',
        says: 'With n elements, at most n of 1, 2, 3, … can be present: the answer is between 1 and n + 1.',
      },
      { phrase: 'can contain negatives, zeros and duplicates', says: 'Those can never matter: only values 1 … n can affect the answer.' },
      { phrase: 'O(n) time using O(1) extra space; you may change the array', says: 'No hash set allowed: the array itself must act as one.' },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n), O(1) space',
      note: 'Trying 1, 2, 3, … with a scan each is O(n²); a hash set is O(n) but uses O(n) space.',
    },
    observe: [
      {
        title: 'The answer is at most n + 1',
        text: 'The array has n slots, so it holds at most the numbers 1 … n. Anything outside 1 … n can be ignored.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 4, -1, 1], marks: { '2': 'muted' }, tags: { '2': [['ignore', 'muted']] } }],
          caption: 'n = 4: the answer is one of 1 … 5',
        },
      },
      {
        title: 'Seat v − 1 can remember "v is here"',
        text: 'Put each value v in 1 … n at index v − 1, by swapping. [3, 4, −1, 1] becomes [1, −1, 3, 4].',
        sketch: {
          kind: 'array',
          rows: [{ label: 'after seating', items: [1, -1, 3, 4], marks: { '0': 'hit', '1': 'bad', '2': 'hit', '3': 'hit' } }],
          caption: 'seat 1 does not hold 2, so 2 is missing',
        },
      },
    ],
    brute: {
      idea: 'Try 1, then 2, then 3, …, scanning the whole array for each.',
      cost: 'O(n²)',
      waste: 'Each candidate rescans the array; one seating pass makes every check a single look.',
    },
    pattern: {
      pick: 'hashing',
      why: 'It is a "is v present?" question answered with the array itself as the table: value v lives at index v − 1. The in-place seating is the cyclic-sort trick.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting then scanning works, but is O(n log n).' },
        { id: 'two-pointers', why: 'There are no pairs; each value has one home seat.' },
      ],
    },
    watch: { viz: 'CyclicSortViz', inputs: [{ label: '[3, 4, −1, 1]', input: { range: 'positive', arr: [3, 4, -1, 1] } }] },
    edges: ['[1] → 2.', 'All negatives: [−1, −2] → 1.', 'Duplicates: [1, 1] → 2 (the swap must not loop forever).', '1 … n all present: [1, 2, 3] → 4.'],
  },
};
