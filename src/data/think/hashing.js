/** Practice thinking walkthroughs: hashing (format: src/data/think/index.js). */
export default {
  'two-sum': {
    free: true,
    read: [
      { phrase: 'two numbers', says: 'A pair. For each number x, the question becomes: is its partner somewhere?' },
      { phrase: 'add up to `target`', says: 'The partner is not just any number: it is exactly target − x. A specific value we can look for.' },
      { phrase: 'Return the indices', says: 'We need positions, not values. Sorting would scramble them, so we must remember where each value was.' },
      { phrase: 'you may not use the same element twice', says: 'x must not pair with itself: look for the partner among the numbers before x.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'O(n²) is about 10⁸ steps: it might pass, but it is the answer the interviewer expects you to improve.' },
    observe: [
      {
        title: 'The partner of each number is fixed',
        text: 'With target 9, the partner of 7 can only be 2. So at each position we are not searching for "something that works", we are checking for one known value.',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 11, 15], marks: { 1: 'cur', 0: 'hit' }, tags: { 1: [['x', 'accent']], 0: [['9 − 7', 'success']] } }], caption: 'x = 7 needs 9 − 7 = 2, which sits at index 0' },
      },
      {
        title: '"Have I seen this value?" is a lookup, not a scan',
        text: 'Scanning back over everything before x costs O(n) each time. A hash map from value to index answers "is 2 here, and where?" in O(1).',
        sketch: { kind: 'array', rows: [{ label: 'seen so far (value → index)', items: ['2 → 0'], marks: { 0: 'kept' } }, { label: 'now', items: [7], marks: { 0: 'cur' } }], caption: 'one map lookup instead of a loop' },
      },
      {
        title: 'Check before storing',
        text: 'With [3, 2, 4] and target 6, the first 3 must not find itself. Look up the partner first, then add x to the map, so the map only ever holds earlier elements.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 4], marks: { 0: 'bad' }, tags: { 0: [['3 + 3?', 'danger']] } }], caption: 'storing 3 first would wrongly answer [0, 0]' },
      },
    ],
    brute: { idea: 'Try every pair (i, j) with i < j and check nums[i] + nums[j] == target.', cost: 'O(n²)', waste: 'For each x it walks over all earlier numbers again, looking for one specific value it could have remembered.' },
    pattern: {
      pick: 'hashing',
      why: 'We repeatedly ask "has value v appeared, and where?" A map from value to index makes each question O(1), so one pass is O(n).',
      not: [
        { id: 'two-pointers', why: 'Two pointers needs the array sorted, and sorting loses the original indices we must return (you would have to sort index pairs: O(n log n)).' },
        { id: 'sorting-and-selection', why: 'Sorting helps find a pair, but costs O(n log n) and still needs the indices carried along.' },
      ],
    },
    watch: { viz: 'TwoSumMapViz', inputs: [{ label: '[2, 7, 11, 15], target 9', input: { nums: [2, 7, 11, 15], target: 9 } }, { label: '[3, 2, 4], target 6', input: { nums: [3, 2, 4], target: 6 } }] },
    edges: ['Two equal values: [3, 3], target 6 → [0, 1].', 'Negative numbers and a negative target.', 'The answer uses the last element (the map must already hold its partner).'],
  },

  'contains-duplicate': {
    read: [
      { phrase: 'any value appears at least twice', says: 'The question is "have I seen this value before?", asked once per element.' },
      { phrase: 'every value is distinct', says: 'We can only answer false after checking every element; true can come early.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Comparing every pair is 5 × 10⁹ comparisons. Sorting (O(n log n)) passes; one pass with a set is cleaner.' },
    observe: [
      {
        title: 'A duplicate shows up as "seen it already"',
        text: 'Walk left to right. The moment a value is already among the ones passed, there is a duplicate: in [1, 2, 3, 1] that happens at index 3.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], marks: { 0: 'target', 3: 'bad' }, tags: { 3: [['seen!', 'danger']] } }] },
      },
      {
        title: 'We only need yes or no, not where or how many',
        text: 'Nothing about positions or counts matters, just membership. A hash set answers "is v in here?" in O(1).',
        sketch: { kind: 'array', rows: [{ label: 'set after three values', items: ['1', '2', '3'], marks: { 0: 'kept', 1: 'kept', 2: 'kept' } }] },
      },
    ],
    brute: { idea: 'Compare every pair of positions and return true if any two hold the same value.', cost: 'O(n²)', waste: 'Each value is compared again with every earlier value, though "is it among them?" is one set lookup.' },
    pattern: {
      pick: 'hashing',
      why: 'Membership in what has been seen so far: a hash set gives O(1) per check, so one pass is O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting puts duplicates next to each other: correct, but O(n log n), and it changes the array.' },
        { id: 'two-pointers', why: 'There is no pair to steer towards a target; we just need to know whether a value repeats.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Add 1, 2 and 3', text: 'None of them is in the set yet, so each one goes in.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], marks: { 0: 'kept', 1: 'kept', 2: 'cur' } }, { label: 'set', items: ['1', '2', '3'] }] } },
        { title: '1 is already in the set: true', text: 'The fourth value is in the set, so it appears at least twice. Stop early.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], marks: { 0: 'target', 3: 'bad' } }, { label: 'set', items: ['1', '2', '3'], marks: { 0: 'hit' } }] } },
      ],
    },
    edges: ['A single element → false.', 'All values equal → true at index 1.', 'Large negative and positive values (a set handles them; a counting array would not).'],
  },

  'valid-anagram': {
    read: [
      { phrase: 'exactly the same letters, each the same number of times', says: 'Equal letter counts. That is the whole condition.' },
      { phrase: 'possibly in a different order', says: 'Order is irrelevant, so compare counts (or sorted strings), never positions.' },
      { phrase: 'lowercase English letters only', says: 'Only 26 possible keys: an int[26] works as the hash map.' },
    ],
    budget: { from: 's.length, t.length ≤ 5 × 10⁴', n: 5e4, aim: 'O(n)', note: 'Crossing letters off one by one is O(n²), about 2.5 × 10⁹.' },
    observe: [
      {
        title: 'Only the counts matter',
        text: '"anagram" and "nagaram" look different but have the same counts: three a\'s and one each of n, g, r, m.',
        sketch: { kind: 'array', rows: [{ label: 'counts in "anagram"', items: ['a:3', 'g:1', 'm:1', 'n:1', 'r:1'] }, { label: 'counts in "nagaram"', items: ['a:3', 'g:1', 'm:1', 'n:1', 'r:1'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'One table: up for s, down for t',
        text: 'Add 1 for every letter of s and subtract 1 for every letter of t. The strings are anagrams exactly when every count ends at 0.',
        sketch: { kind: 'array', rows: [{ label: 'after both strings', items: ['a:0', 'g:0', 'm:0', 'n:0', 'r:0'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Different lengths can never match',
        text: 'If the lengths differ, some count must be off: return false before counting anything.',
      },
    ],
    brute: { idea: 'For each letter of s, find an unused copy in t and cross it off.', cost: 'O(n²)', waste: 'Every search rescans t for a letter, when a count per letter would answer at once.' },
    pattern: {
      pick: 'hashing',
      why: 'Compare two multisets: count each letter with a table (26 slots), up for s and down for t, then check for zeros. O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting both strings and comparing works, at O(n log n).' },
        { id: 'sliding-window', why: 'A sliding window finds anagrams of p inside a longer string; here both strings are whole.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Count s = "anagram"', text: 'Each letter adds 1: a becomes 3, the others 1.', sketch: { kind: 'array', rows: [{ items: ['a:3', 'g:1', 'm:1', 'n:1', 'r:1'], marks: { 0: 'cur' } }] } },
        { title: 'Subtract t = "nagaram"', text: 'Each letter of t removes 1. Every count returns to 0.', sketch: { kind: 'array', rows: [{ items: ['a:0', 'g:0', 'm:0', 'n:0', 'r:0'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit', 4: 'hit' } }] } },
        { title: 'All zero: true', text: 'No letter is left over on either side, so t is an anagram of s.' },
      ],
    },
    edges: ['Different lengths → false immediately.', 'The same string → true.', 'One letter each: "a" and "b" → false.'],
  },

  'first-unique-character-in-a-string': {
    read: [
      { phrase: 'appears exactly once in the whole string', says: 'Uniqueness depends on the whole string, so we can only decide after seeing all of it: count first.' },
      { phrase: 'the first character', says: 'Among the unique characters, the earliest one: a second pass in string order.' },
      { phrase: 'If every character repeats, return `-1`', says: 'The scan may finish without finding anything.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Checking each position against the whole string is 10¹⁰.' },
    observe: [
      {
        title: 'You can\'t tell a character is unique when you first meet it',
        text: 'In "loveleetcode", the l at index 0 looks unique until index 4. Only after the whole string do we know which letters appear once.',
        sketch: { kind: 'array', rows: [{ items: ['l', 'o', 'v', 'e', 'l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { 0: 'bad', 4: 'bad', 2: 'hit' } }], caption: 'v (index 2) is the first letter with a count of 1' },
      },
      {
        title: 'Two passes: count, then scan in order',
        text: 'First count every letter. Then walk from the start and return the first index whose letter has count 1.',
      },
    ],
    brute: { idea: 'For each position, scan the whole string for another copy of its character; return the first position with none.', cost: 'O(n²)', waste: 'The same letter is counted from scratch every time it is checked.' },
    pattern: {
      pick: 'hashing',
      why: 'A frequency table (26 counters) answers "how many times does c appear?" in O(1); a second pass keeps the original order.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting groups equal letters but loses their positions, and we need the first index.' },
        { id: 'sliding-window', why: 'There is no window: uniqueness is about the whole string.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Count "leetcode"', text: 'l:1, e:3, t:1, c:1, o:1, d:1.', sketch: { kind: 'array', rows: [{ items: ['l:1', 'e:3', 't:1', 'c:1', 'o:1', 'd:1'], marks: { 1: 'bad' } }] } },
        { title: 'Scan from the start: l has count 1', text: 'The very first letter is unique, so the answer is index 0.', sketch: { kind: 'array', rows: [{ items: ['l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { 0: 'hit' }, tags: { 0: [['answer', 'success']] } }] } },
      ],
    },
    edges: ['Every letter repeats ("aabb") → −1.', 'A single character → 0.', 'The only unique letter is the last one.'],
  },

  'concatenation-of-array': {
    read: [
      { phrase: '`ans[i] == nums[i]` and `ans[i + n] == nums[i]`', says: 'Each value goes to two positions, i and i + n: plain index arithmetic.' },
      { phrase: '`ans` is `nums` written twice in a row', says: 'The output size, 2n, is known before we start.' },
    ],
    budget: { from: 'nums.length ≤ 1000', n: 1000, aim: 'O(n)', note: 'The output itself has 2n values, so O(n) is the best possible.' },
    observe: [
      {
        title: 'Two copies, side by side',
        text: 'Position i and position i + n hold the same value. One loop can write both.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 1, 2, 1], marks: { 0: 'cur', 3: 'cur' }, bands: [{ from: 0, to: 2, tone: 'accent', label: 'first copy' }, { from: 3, to: 5, tone: 'ghost', label: 'second copy' }] }] },
      },
      {
        title: 'Allocate once',
        text: 'Because the size is known, create an array of 2n and fill it; no growing list needed.',
      },
    ],
    brute: { idea: 'Append every value to a growing list, twice over, then convert it to an array.', cost: 'O(n)', waste: 'Already linear; it just pays for list growth and a final copy that a fixed-size array avoids.' },
    pattern: {
      pick: 'hashing',
      why: 'A warm-up for "index → value" thinking: the array is the simplest direct-address table, and positions are computed, not searched.',
      not: [
        { id: 'two-pointers', why: 'Nothing moves towards anything; each position is written directly.' },
        { id: 'prefix-sums', why: 'No sums or ranges are involved.' },
      ],
    },
    watch: {
      frames: [
        { title: 'i = 0: write 1 at 0 and 3', text: 'ans[0] = ans[3] = nums[0].', sketch: { kind: 'array', rows: [{ items: [1, '·', '·', 1, '·', '·'], marks: { 0: 'hit', 3: 'hit' } }] } },
        { title: 'i = 1, 2: the rest', text: 'ans[1] = ans[4] = 2, then ans[2] = ans[5] = 1: [1, 2, 1, 1, 2, 1].', sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 1, 2, 1], marks: { 1: 'hit', 2: 'hit', 4: 'hit', 5: 'hit' } }] } },
      ],
    },
    edges: ['n = 1: [x] → [x, x].', 'Repeated values are copied as they are.'],
  },

  'majority-element': {
    read: [
      { phrase: 'appears more than `⌊n / 2⌋` times', says: 'The majority outnumbers all the other values put together. That is a very strong property.' },
      { phrase: 'You may assume it always exists', says: 'No need to verify the final candidate.' },
      { phrase: 'O(n) time and O(1) extra space', says: 'A count map is O(n) space; the follow-up wants something smarter: voting.' },
    ],
    budget: { from: 'nums.length ≤ 5 × 10⁴', n: 5e4, aim: 'O(n), O(1) space', note: 'Counting each value with a nested loop is 2.5 × 10⁹.' },
    observe: [
      {
        title: 'Counting works',
        text: 'A hash map of value → count finds the value above n / 2 in one pass. That is O(n) time but O(n) space.',
      },
      {
        title: 'Pair off different values',
        text: 'Cancel a majority vote against a different value, pair by pair. Each cancellation removes at most one majority copy, and the majority has more copies than everyone else, so it is what remains.',
        sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { 2: 'muted', 3: 'muted', 4: 'muted', 0: 'muted', 1: 'muted', 5: 'hit', 6: 'hit' } }], caption: 'pairs of different values cancel; 2 survives' },
      },
      {
        title: 'One candidate and a counter do the pairing',
        text: 'Same as the candidate: count + 1. Different: count − 1. At 0, the next value becomes the candidate.',
      },
    ],
    brute: { idea: 'For each position, count how often its value appears in the whole array.', cost: 'O(n²)', waste: 'The same value is recounted every time it appears.' },
    pattern: {
      pick: 'hashing',
      why: 'Counting values is the first answer (a hash map, O(n)). The follow-up, Boyer–Moore voting, keeps one candidate and a counter: O(n) time, O(1) space.',
      not: [
        { id: 'sorting-and-selection', why: 'After sorting, the middle element is the majority: correct, but O(n log n).' },
        { id: 'two-pointers', why: 'There is no pair or window to steer; we are counting votes.' },
      ],
    },
    watch: {
      frames: [
        { title: '2, 2: candidate 2, count 2', text: 'The first 2 becomes the candidate; the second adds a vote.', sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { 0: 'kept', 1: 'cur' } }] } },
        { title: '1, 1: count back to 0', text: 'Each 1 cancels one vote for 2.', sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { 2: 'cur', 3: 'cur' } }] } },
        { title: '1: new candidate 1, count 1', text: 'With count 0, the next value takes over.', sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { 4: 'target' } }] } },
        { title: '2, 2: candidate 2 wins', text: 'The first 2 cancels the 1 (count 0), the last 2 becomes the candidate. Answer: 2.', sketch: { kind: 'array', rows: [{ items: [2, 2, 1, 1, 1, 2, 2], marks: { 6: 'hit' } }] } },
      ],
    },
    edges: ['A single element is its own majority.', 'The majority appears only in the second half.', 'Negative values.'],
  },

  'verifying-an-alien-dictionary': {
    read: [
      { phrase: '`order` lists them from first to last', says: 'Each letter has a rank: build letter → position once, then compare ranks in O(1).' },
      { phrase: 'compare two words at their first differing letter', says: 'Ordinary dictionary comparison, just with the new ranks.' },
      { phrase: 'if one word is a prefix of the other, the shorter word comes first', says: 'An edge case to handle: "apple" before "app" is out of order.' },
    ],
    budget: { from: 'up to 100 words of up to 20 letters', n: 2000, aim: 'O(total letters)', note: 'Tiny limits; the point is a clean comparison, not speed.' },
    observe: [
      {
        title: 'A rank table turns letters into numbers',
        text: 'With order "hlabcdefgijk…", h has rank 0 and l rank 1. Comparing two letters becomes comparing two small integers.',
        sketch: { kind: 'array', rows: [{ label: 'rank', items: ['h:0', 'l:1', 'a:2', 'b:3', '…'], marks: { 0: 'kept', 1: 'kept' } }] },
      },
      {
        title: 'Checking neighbours is enough',
        text: 'Order is transitive: if every word is ≤ the next one, the whole list is sorted. So only n − 1 comparisons are needed.',
      },
      {
        title: 'Watch for the prefix case',
        text: 'If all the shared letters match, the shorter word must come first. "apple", "app" is not sorted.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'p', 'p', 'l', 'e'], marks: { 3: 'bad', 4: 'bad' } }, { items: ['a', 'p', 'p'] }] },
      },
    ],
    brute: { idea: 'Translate every word into English letters by rank, then check every pair i < j with normal string comparison.', cost: 'O(n² · m)', waste: 'Comparing all pairs repeats what neighbour checks already prove, and the translation is unnecessary with a rank table.' },
    pattern: {
      pick: 'hashing',
      why: 'A lookup table (letter → rank) makes each letter comparison O(1); then compare neighbouring words only.',
      not: [
        { id: 'sorting-and-selection', why: 'We don\'t need to sort anything, only check whether it is sorted, which is one pass over neighbours.' },
        { id: 'tries', why: 'A trie stores words for prefix queries; here we compare a fixed list once.' },
      ],
    },
    watch: {
      frames: [
        { title: '"hello" vs "leetcode": h before l', text: 'They differ at the first letter. rank(h) = 0 < rank(l) = 1, so this pair is in order.', sketch: { kind: 'array', rows: [{ items: ['h', 'e', 'l', 'l', 'o'], marks: { 0: 'hit' } }, { items: ['l', 'e', 'e', 't', 'c', 'o', 'd', 'e'], marks: { 0: 'hit' } }] } },
        { title: 'No more pairs: true', text: 'Every neighbouring pair is in order, so the list is sorted.' },
      ],
    },
    edges: ['A word followed by its own prefix → false.', 'Identical neighbouring words are fine.', 'A single word → true.'],
  },

  'group-anagrams': {
    read: [
      { phrase: 'Group together', says: 'Bucket the strings by some key: a hash map from key to list.' },
      { phrase: 'the same letters with the same counts', says: 'Anagrams share a canonical form: their sorted letters, or their 26 counts. That is the key.' },
      { phrase: 'Return the groups in any order', says: 'Map iteration order is fine.' },
    ],
    budget: { from: 'up to 10⁴ strings of up to 100 letters', rows: [['compare words pairwise', '10⁸ × 100 = 10¹⁰', 'bad'], ['sort each word as a key', '10⁴ × 100 log 100 ≈ 7 × 10⁶', 'ok'], ['count letters as a key', '10⁴ × 100 = 10⁶', 'ok']], aim: 'O(n · L)', note: 'Pairwise comparison is far too slow; a key per word is linear.' },
    observe: [
      {
        title: 'Anagrams share their sorted letters',
        text: '"eat", "tea" and "ate" all sort to "aet". So "aet" names the group.',
        sketch: { kind: 'array', rows: [{ items: ['eat', 'tea', 'ate', 'tan', 'nat', 'bat'], marks: { 0: 'kept', 1: 'kept', 2: 'kept', 3: 'target', 4: 'target' } }, { label: 'key', items: ['aet', 'aet', 'aet', 'ant', 'ant', 'abt'], marks: { 0: 'kept', 1: 'kept', 2: 'kept', 3: 'target', 4: 'target' } }] },
      },
      {
        title: 'Key → list does the grouping',
        text: 'Put each word in the list for its key. One pass over the words builds every group.',
      },
      {
        title: 'Counts make an even cheaper key',
        text: 'Counting 26 letters is O(L), without the O(L log L) sort.',
      },
    ],
    brute: { idea: 'For each word, test it against one member of every existing group with an anagram check; join a match or start a new group.', cost: 'O(n² · L)', waste: 'Each word is re-compared against all groups, when a key would say directly which group it belongs to.' },
    pattern: {
      pick: 'hashing',
      why: 'Group by a canonical key in a hash map: the key (sorted letters or counts) is the same exactly for anagrams.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting each word only builds the key; the map still does the grouping.' },
        { id: 'sliding-window', why: 'A sliding window finds anagrams inside one string; here we compare whole words.' },
      ],
    },
    watch: {
      frames: [
        { title: 'eat → "aet"', text: 'New key: start a group ["eat"].' },
        { title: 'tea, ate → "aet"', text: 'Same key: the group becomes ["eat", "tea", "ate"].' },
        { title: 'tan, nat → "ant"; bat → "abt"', text: 'Two more groups. Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]].', sketch: { kind: 'array', rows: [{ label: 'groups', items: ['aet: 3', 'ant: 2', 'abt: 1'], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] } },
      ],
    },
    edges: ['The empty string "" is its own group.', 'All words are anagrams of each other.', 'A single word.'],
  },

  'longest-consecutive-sequence': {
    read: [
      { phrase: '`nums` is unsorted and may contain duplicates', says: 'Positions don\'t matter, and duplicates must not break a run: think in terms of a set of values.' },
      { phrase: 'consecutive integers', says: 'For a value x, the next one in its run is x + 1: a membership question.' },
      { phrase: 'should run in O(n) time, so sorting is not the intended approach', says: 'Sorting would be O(n log n); we need O(1) lookups instead.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Sorting fits in time but is ruled out by the statement; counting runs from every value can be O(n²).' },
    observe: [
      {
        title: '"Is x + 1 here?" is a set lookup',
        text: 'Put every value in a hash set. Then extending a run from x is a few O(1) lookups: x + 1, x + 2, …',
        sketch: { kind: 'array', rows: [{ items: [100, 4, 200, 1, 3, 2], marks: { 3: 'hit', 5: 'hit', 4: 'hit', 1: 'hit' } }], caption: '1, 2, 3, 4 are all present: a run of 4' },
      },
      {
        title: 'Only count from the start of a run',
        text: 'If x − 1 is in the set, x is in the middle of a run that will be counted from its start. Skip it. Then every value is visited at most twice in total.',
        sketch: { kind: 'array', rows: [{ items: [100, 4, 200, 1, 3, 2], marks: { 0: 'target', 2: 'target', 3: 'target', 1: 'muted', 4: 'muted', 5: 'muted' }, tags: { 0: [['start', 'warn']], 2: [['start', 'warn']], 3: [['start', 'warn']] } }] },
      },
    ],
    brute: { idea: 'From every value x, look for x + 1, x + 2, … by scanning the array each time.', cost: 'O(n³)', waste: 'Each lookup scans the whole array, and runs are re-counted from every value inside them.' },
    pattern: {
      pick: 'hashing',
      why: 'A hash set gives O(1) "is v present?", and starting only at run starts (x − 1 absent) keeps the total work O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sort and count runs works, but is O(n log n), which the statement rules out.' },
        { id: 'prefix-sums', why: 'No sums over ranges here; runs are about values, not positions.' },
      ],
    },
    watch: { viz: 'ConsecutiveSetViz', inputs: [{ label: '[100, 4, 200, 1, 3, 2]', input: { nums: [100, 4, 200, 1, 3, 2] } }, { label: 'with repeats', input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] } }] },
    edges: ['An empty array → 0.', 'Duplicates: [1, 2, 2, 3] → 3.', 'Negative values and values near the limits.'],
  },

  'valid-sudoku': {
    read: [
      { phrase: 'each row contains the digits 1–9 at most once', says: '"At most once" is a seen-before check, one per row.' },
      { phrase: 'each of the nine 3 × 3 boxes contains the digits 1–9 at most once', says: 'The same check for boxes; we need a way to name the box a cell is in.' },
      { phrase: 'Only check the filled cells; the board does not need to be solvable', says: 'This is validation, not solving: no backtracking needed.' },
    ],
    budget: { from: 'a fixed 9 × 9 board', rows: [['check each cell against its row, column and box', '81 × 3 lookups', 'ok']], aim: 'one pass', note: 'The board size is fixed, so any approach is O(1); aim for one clean pass.' },
    observe: [
      {
        title: 'Each cell belongs to three units',
        text: 'A row, a column and a box. A digit may appear only once in each of them.',
      },
      {
        title: 'Name the box with arithmetic',
        text: 'The box of cell (r, c) is (r / 3) · 3 + c / 3, using integer division: boxes 0 to 8, left to right, top to bottom.',
        sketch: { kind: 'grid', grid: [[0, 1, 2], [3, 4, 5], [6, 7, 8]], marks: { '1,1': 'cur' }, labels: { '0,0': '0', '0,1': '1', '0,2': '2', '1,0': '3', '1,1': '4', '1,2': '5', '2,0': '6', '2,1': '7', '2,2': '8' }, caption: 'cell (4, 5) is in box (4/3)·3 + 5/3 = 4' },
      },
      {
        title: '27 seen-sets, one pass',
        text: 'Keep a set (or a 9-bit mask) per row, column and box. Visit each filled cell once and check all three.',
      },
    ],
    brute: { idea: 'Check the 9 rows, then the 9 columns, then the 9 boxes, each with its own fresh seen-table.', cost: 'O(n²)', waste: 'Three separate sweeps of the board, and the box loops are fiddly; one pass with all three tables does the same work once.' },
    pattern: {
      pick: 'hashing',
      why: '"At most once per unit" is a seen-before check: one hash set (or bitmask) per row, column and box.',
      not: [
        { id: 'backtracking', why: 'Backtracking solves a Sudoku; here we only validate the filled cells.' },
        { id: 'two-pointers', why: 'No pairs to steer; each cell is checked against what was seen.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Cell (0, 0) = 5', text: 'Not yet in row 0, column 0 or box 0: record it in all three.' },
        { title: 'Cell (0, 1) = 3', text: 'Not in row 0, column 1 or box 0: record it.' },
        { title: '…every filled cell, once', text: 'If any digit is already in one of its three sets, return false. If the pass ends, the board is valid: true.' },
      ],
    },
    edges: ['An empty board (all dots) is valid.', 'A repeat only inside a box (not in any row or column).', 'Dots must be skipped, not treated as a digit.'],
  },

  'encode-and-decode-strings': {
    read: [
      { phrase: 'including whatever separator you might pick', says: 'Joining with a separator is ambiguous: the separator may appear inside a string.' },
      { phrase: 'can be empty', says: 'Empty strings must survive the round trip too.' },
      { phrase: 'you cannot keep the list in a field', says: 'The encoded string must carry all the information on its own.' },
    ],
    budget: { from: 'up to 99 strings of up to 199 characters', rows: [['one pass to encode, one to decode', 'about 2 × 10⁴ characters', 'ok']], aim: 'O(total length)', note: 'Speed is easy; the challenge is a format that can\'t be misread.' },
    observe: [
      {
        title: 'A plain separator is ambiguous',
        text: 'With "#" as separator, ["a#b"] and ["a", "b"] both encode to "a#b". The decoder can\'t tell them apart.',
        sketch: { kind: 'array', rows: [{ items: ['a', '#', 'b'], marks: { 1: 'bad' }, tags: { 1: [['separator or text?', 'danger']] } }] },
      },
      {
        title: 'Say the length first',
        text: 'Write each string as its length, a "#", then the string: "4#neet". The decoder reads the number and takes exactly that many characters, so whatever is inside never matters.',
        sketch: { kind: 'array', rows: [{ items: ['4', '#', 'n', 'e', 'e', 't', '4', '#', 'c', 'o', 'd', 'e'], bands: [{ from: 2, to: 5, tone: 'accent' }, { from: 8, to: 11, tone: 'accent' }], marks: { 0: 'target', 6: 'target' } }] },
      },
    ],
    brute: { idea: 'Join the strings with a separator after escaping every separator and escape character inside them.', cost: 'O(L)', waste: 'Every character must be inspected and possibly escaped, and the decoder must undo it; easy to get subtly wrong.' },
    pattern: {
      pick: 'hashing',
      why: 'The lesson files it here as a design warm-up; the idea is framing: a length prefix makes the format unambiguous for any content.',
      not: [
        { id: 'sliding-window', why: 'Nothing is searched for; the decoder reads fixed-size chunks it was told about.' },
        { id: 'two-pointers', why: 'The decoder does use an index, but only to read numbers and fixed lengths, not to compare two ends.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Encode', text: '["neet","code","love","you"] → "4#neet4#code4#love3#you".' },
        { title: 'Decode: read 4, take "neet"', text: 'Read digits up to "#", then take that many characters, and repeat from there.', sketch: { kind: 'array', rows: [{ items: ['4', '#', 'n', 'e', 'e', 't', '4', '#', '…'], marks: { 0: 'target', 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit' } }] } },
        { title: 'Done', text: 'Four strings back, exactly as they went in.' },
      ],
    },
    edges: ['An empty list → "" → [].', 'A list containing "" (encoded as "0#").', 'Strings containing "#" and digits.'],
  },

  'majority-element-ii': {
    read: [
      { phrase: 'more than `⌊n / 3⌋` times', says: 'Three values each above n / 3 would add up to more than n: at most two values qualify.' },
      { phrase: 'in any order', says: 'We return a small list: zero, one or two values.' },
      { phrase: 'O(n) time and O(1) extra space', says: 'Again the follow-up rules out a count map: voting, now with two candidates.' },
    ],
    budget: { from: 'nums.length ≤ 5 × 10⁴', n: 5e4, aim: 'O(n), O(1) space', note: 'Counting each value with a nested loop is 2.5 × 10⁹.' },
    observe: [
      {
        title: 'At most two answers',
        text: 'If three different values each appeared more than n / 3 times, there would be more than n elements. So keep two candidates.',
      },
      {
        title: 'Cancel triples of different values',
        text: 'A value matching neither candidate cancels one vote from each. Removing three different values never removes more than one copy of an answer.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 1, 3, 3, 2, 2, 2], marks: { 0: 'kept', 1: 'kept', 2: 'kept', 5: 'target', 6: 'target', 7: 'target' } }], caption: 'answer: [1, 2]' },
      },
      {
        title: 'Then verify',
        text: 'Unlike the n / 2 version, an answer is not guaranteed. Count the two survivors in a second pass and keep those above n / 3.',
      },
    ],
    brute: { idea: 'For every distinct value, count its occurrences in the whole array.', cost: 'O(n²)', waste: 'Values are recounted from scratch each time.' },
    pattern: {
      pick: 'hashing',
      why: 'Counting with a map is the first answer. The follow-up is Boyer–Moore with two candidates and a verification pass: O(n) time, O(1) space.',
      not: [
        { id: 'sorting-and-selection', why: 'Sort and measure runs works, at O(n log n).' },
        { id: 'heap-patterns', why: 'A top-k heap over counts is overkill: at most two values can qualify.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Vote', text: 'Candidates end as 1 and 2 (3s cancel against them).', sketch: { kind: 'array', rows: [{ items: [1, 1, 1, 3, 3, 2, 2, 2], marks: { 3: 'muted', 4: 'muted' } }] } },
        { title: 'Verify', text: '1 appears 3 times and 2 appears 3 times; ⌊8 / 3⌋ = 2, so both qualify: [1, 2].', sketch: { kind: 'array', rows: [{ label: 'counts', items: ['1: 3', '2: 3'], marks: { 0: 'hit', 1: 'hit' } }] } },
      ],
    },
    edges: ['[1, 2]: both values qualify (each appears once, more than ⌊2/3⌋ = 0).', 'No value qualifies: return [].', 'The two candidates must be different values.'],
  },

  'first-missing-positive': {
    read: [
      { phrase: 'smallest positive integer (1, 2, 3, …) that does not appear', says: 'With n elements, at most n of 1, 2, 3, … can be present: the answer is between 1 and n + 1.' },
      { phrase: 'can contain negatives, zeros and duplicates', says: 'Those can never matter: only values 1 … n can affect the answer.' },
      { phrase: 'O(n) time using O(1) extra space; you may change the array', says: 'No hash set allowed: the array itself must act as one.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n), O(1) space', note: 'Trying 1, 2, 3, … with a scan each is O(n²); a hash set is O(n) but uses O(n) space.' },
    observe: [
      {
        title: 'The answer is at most n + 1',
        text: 'The array has n slots, so it can hold at most 1 … n. Any value outside 1 … n is irrelevant.',
      },
      {
        title: 'Slot v − 1 can remember "v is here"',
        text: 'Use the array as its own hash set: put each value v in 1 … n at index v − 1, by swapping.',
        sketch: { kind: 'array', rows: [{ label: 'before', items: [3, 4, -1, 1] }, { label: 'after placing', items: [1, -1, 3, 4], marks: { 0: 'hit', 2: 'hit', 3: 'hit', 1: 'bad' } }], caption: 'index 1 does not hold 2, so 2 is missing' },
      },
      {
        title: 'The first wrong slot is the answer',
        text: 'Scan from the left: the first index i with nums[i] ≠ i + 1 gives i + 1. If all are right, the answer is n + 1.',
      },
    ],
    brute: { idea: 'Try 1, then 2, then 3, …, scanning the whole array for each.', cost: 'O(n²)', waste: 'Each candidate rescans the array; one placement pass would let every check be O(1).' },
    pattern: {
      pick: 'hashing',
      why: 'It is a membership question ("is v present?") answered with the array itself as the hash table: value v lives at index v − 1. The in-place placement is the cyclic-sort trick.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting then scanning works, but is O(n log n).' },
        { id: 'two-pointers', why: 'There are no pairs; each value has one home slot.' },
      ],
    },
    watch: {
      frames: [
        { title: '3 → index 2', text: 'Swap 3 into slot 2; -1 comes to the front.', sketch: { kind: 'array', rows: [{ items: [-1, 4, 3, 1], marks: { 2: 'hit' } }] } },
        { title: '4 → index 3, then 1 → index 0', text: 'Keep swapping until each slot holds its value or something that can\'t be placed.', sketch: { kind: 'array', rows: [{ items: [1, -1, 3, 4], marks: { 0: 'hit', 2: 'hit', 3: 'hit' } }] } },
        { title: 'Scan: index 1 holds -1', text: 'The first slot without its value is index 1, so the answer is 2.', sketch: { kind: 'array', rows: [{ items: [1, -1, 3, 4], marks: { 1: 'bad' }, tags: { 1: [['2 missing', 'danger']] } }] } },
      ],
    },
    edges: ['[1] → 2.', 'All negatives → 1.', 'Duplicates: [1, 1] must not loop forever when swapping.', '1 … n all present → n + 1.'],
  },
};
