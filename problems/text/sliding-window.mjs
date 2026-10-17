export default {
  'maximum-average-subarray-i': {
    statement: `Among all contiguous subarrays of \`nums\` that have exactly \`k\` elements, find the one with the largest average and return that average.

Answers within \`1e-5\` of the exact value are accepted.`,
    constraints: ['n == nums.length', '1 <= n <= 1e5', '1 <= k <= n', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'All windows have the same length k, so the window with the largest sum also has the largest average.',
      'Compute the sum of the first k values, then slide: add the value entering on the right and subtract the one leaving on the left.',
      'Track the best sum while sliding and divide by k once at the end. Use a double (or long) for the division.',
    ],
  },
  'longest-substring-without-repeating-characters': {
    statement: `Given a string \`s\`, return the length of the longest substring (a contiguous run of characters) in which no character appears more than once.

Note the difference between a substring and a subsequence: in \`"pwwkew"\` the answer is 3 (\`"wke"\`), because \`"pwke"\` skips a character and is not a substring.`,
    constraints: ['0 <= s.length <= 5e4', '`s` consists of English letters, digits, symbols and spaces'],
    hints: [
      'Keep a window of characters with no repeats. What should happen when the next character is already inside the window?',
      'Grow the window on the right. When the new character is a repeat, move the left edge forward until the window is repeat-free again.',
      'Instead of stepping the left edge one by one, remember the last index of each character and jump left to (last index + 1). Never move left backwards; "abba" tests this.',
    ],
  },
  'minimum-size-subarray-sum': {
    statement: `\`nums\` contains only positive integers. Return the length of the shortest contiguous subarray whose sum is greater than or equal to \`target\`. If no subarray reaches \`target\`, return \`0\`.`,
    constraints: ['1 <= target <= 1e9', '1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e4'],
    hints: [
      'Because every value is positive, adding an element always increases the sum and removing one always decreases it. That makes a sliding window safe.',
      'Expand the window to the right until the sum reaches target, then shrink it from the left while it still does, recording the length each time.',
      'Each index enters and leaves the window at most once, so this is O(n). Start the best length at a sentinel (like n + 1) so you can return 0 when nothing qualified.',
    ],
  },
  'max-consecutive-ones-iii': {
    statement: `\`nums\` contains only \`0\`s and \`1\`s. You may flip at most \`k\` of the zeros into ones. Return the length of the longest run of consecutive ones you can end up with.`,
    constraints: ['1 <= nums.length <= 1e5', '0 <= nums[i] <= 1', '0 <= k <= 1e5'],
    hints: [
      'Rephrase it: find the longest contiguous window that contains at most k zeros.',
      'Slide a window over the array, counting the zeros inside. When the count goes above k, move the left edge until it is back to k.',
      'The answer is the largest window size seen. k can be larger than the number of zeros, in which case the whole array works.',
    ],
  },
  'longest-repeating-character-replacement': {
    statement: `\`s\` contains only uppercase English letters. You may pick any character of \`s\` and change it to any other uppercase letter, at most \`k\` times in total.

Return the length of the longest substring that can be made to consist of a single repeated letter.`,
    constraints: ['1 <= s.length <= 1e5', '`s` has only uppercase English letters', '0 <= k <= s.length'],
    hints: [
      'In a window, which characters would you change? Everything except the most frequent letter.',
      'A window is valid when (window length − count of its most frequent letter) ≤ k. Slide a window and keep a count of each letter.',
      'When the window becomes invalid, move the left edge by one. You never need to recompute the maximum count downward: the answer only grows when a larger maximum appears.',
    ],
  },
  'permutation-in-string': {
    statement: `Return \`true\` if \`s2\` contains a contiguous substring that is a rearrangement (a permutation) of \`s1\`, and \`false\` otherwise.

Both strings contain lowercase English letters only.`,
    constraints: ['1 <= s1.length, s2.length <= 1e4', '`s1` and `s2` have only lowercase English letters'],
    hints: [
      'A permutation of s1 has exactly the same letter counts as s1, and the same length.',
      'Slide a window of length s1.length over s2 and keep the letter counts of the window. Compare them with the counts of s1.',
      'Comparing two 26-entry arrays per step is fine (O(26·n)). For O(n), keep a running count of how many letters already match.',
    ],
  },
  'find-all-anagrams-in-a-string': {
    statement: `Return every index \`i\` such that the substring of \`s\` that starts at \`i\` and has length \`p.length\` is an anagram (a rearrangement) of \`p\`. Return the indices in increasing order.

Both strings contain lowercase English letters only. If \`p\` is longer than \`s\`, the answer is empty.`,
    constraints: ['1 <= s.length, p.length <= 3e4', '`s` and `p` have only lowercase English letters'],
    hints: [
      'This is "Permutation in String", but you collect every match instead of stopping at the first.',
      'Keep letter counts for p and for a window of the same length sliding over s.',
      'When the window moves, add the entering letter and remove the leaving one, then record the start index whenever the counts are equal.',
    ],
  },
  'minimum-window-substring': {
    statement: `Return the shortest contiguous substring of \`s\` that contains every character of \`t\`, including repeats (if \`t\` has two \`a\`s, the window needs at least two). If no such substring exists, return \`""\`.

For every input the shortest window is unique. Letters are case-sensitive.`,
    constraints: ['m == s.length', 'n == t.length', '1 <= m, n <= 1e5', '`s` and `t` consist of uppercase and lowercase English letters'],
    hints: [
      'Use a sliding window: expand it until it covers t, then shrink it while it still covers t.',
      'Keep a count of what t needs and a counter of how many required characters are still missing. A character only reduces "missing" when the window needed it.',
      'While missing == 0, record the window if it is the shortest so far, then remove the left character; if that makes it needed again, missing goes back up and you start expanding.',
    ],
  },
  'subarrays-with-k-different-integers': {
    statement: `A subarray is "good" if it contains exactly \`k\` different values. Count the good contiguous subarrays of \`nums\`.

For example, \`[1,2,3,1,2]\` has exactly 3 different values.`,
    constraints: ['1 <= nums.length <= 2e4', '1 <= nums[i] <= nums.length', '1 <= k <= nums.length'],
    hints: [
      '"Exactly k" is awkward for a sliding window, but "at most k" is easy. Can you get one from the other?',
      'exactly(k) = atMost(k) − atMost(k − 1).',
      'For atMost(k): slide a window, shrink it while it has more than k distinct values, and add (right − left + 1) for every right edge. That counts all valid subarrays ending at right.',
    ],
  },
};
