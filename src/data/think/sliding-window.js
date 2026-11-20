/** Practice thinking walkthroughs: sliding-window (format: src/data/think/index.js). */
export default {
  'longest-substring-without-repeating-characters': {
    read: [
      { phrase: 'the longest substring', says: 'We optimise over ranges of the string: the best range.' },
      { phrase: 'a contiguous run of characters', says: 'Contiguous ranges: a sliding window is the first candidate.' },
      { phrase: 'no character appears more than once', says: 'The rule for a valid window: every letter count is at most 1. Something must track the counts.' },
    ],
    budget: { from: 's.length ≤ 5 × 10⁴', n: 5e4, aim: 'O(n)', note: 'All substrings is O(n²) = 2.5 × 10⁹ before even checking them: too slow.' },
    observe: [
      {
        title: 'A repeat spoils every bigger window too',
        text: '"abca" contains two a\'s, so every window containing "abca" is invalid as well. Growing a bad window never fixes it; only moving the left end can.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], marks: { 0: 'bad', 3: 'bad' }, bands: [{ from: 0, to: 3, tone: 'danger', label: 'two a\'s' }] }] },
      },
      {
        title: 'The left end only ever moves right',
        text: 'If [l, r] is the longest valid window ending at r, the best window ending at r + 1 cannot start before l. So both ends move forward only: about 2n moves in total.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], bands: [{ from: 1, to: 3, tone: 'success', label: 'valid' }], tags: { 1: [['l', 'interview']], 3: [['r', 'accent']] } }], caption: 'drop the first a, and "bca" is valid again' },
      },
      {
        title: 'The window\'s state is a count per letter',
        text: 'To know if adding s[r] breaks the rule, keep how many times each letter is in the window. Adding and removing a letter are both O(1).',
        sketch: { kind: 'array', rows: [{ label: 'counts in "bca"', items: ['a:1', 'b:1', 'c:1'], marks: { 0: 'kept', 1: 'kept', 2: 'kept' } }] },
      },
    ],
    brute: { idea: 'Check every substring: for each start, extend while the letters stay unique (a set), and keep the longest.', cost: 'O(n²)', waste: 'When the start moves by one, it re-checks letters it already knew were unique.' },
    pattern: {
      pick: 'sliding-window',
      why: 'Contiguous ranges, a validity rule that only gets worse as the window grows, and window state (counts) that updates in O(1) when one letter enters or leaves.',
      not: [
        { id: 'two-pointers', why: 'Classic two pointers walk towards each other on sorted data; here both ends move in the same direction, which is what a sliding window is.' },
        { id: 'hashing', why: 'A hash map (or array of counts) is the window\'s state, but on its own it doesn\'t say which range to look at.' },
        { id: 'dp-strings', why: 'String DP compares positions in one or two strings; this asks about one contiguous range, which the window handles in O(n).' },
      ],
    },
    watch: { viz: 'WindowCountsViz', inputs: [{ label: '"abcabcbb"', input: { mode: 'unique', s: 'abcabcbb' } }, { label: '"pwwkew"', input: { mode: 'unique', s: 'pwwkew' } }] },
    edges: ['The empty string → 0.', 'All the same letter: "bbbb" → 1.', 'Spaces and symbols count as characters too.'],
  },
};
