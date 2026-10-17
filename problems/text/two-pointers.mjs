export default {
  'valid-palindrome': {
    statement: `A phrase counts as a palindrome if, once you turn every uppercase letter into lowercase and throw away everything that is not a letter or a digit, it reads the same forwards and backwards.

Given a string \`s\`, return \`true\` if it is a palindrome under that rule and \`false\` otherwise. A string that has no letters or digits at all (for example \`" "\` or \`".,"\`) is empty after cleaning, and an empty string is a palindrome.`,
    constraints: ['1 <= s.length <= 2e5', 's contains printable ASCII characters only'],
    hints: [
      'You never need to build the cleaned string. Can you compare characters of the original string directly?',
      'Put one pointer at each end. Skip any character that is not a letter or digit, then compare the two characters you are left on.',
      'Compare with Character.toLowerCase on both sides, and stop as soon as the pointers meet or cross. That is O(n) time and O(1) extra space.',
    ],
  },
  'remove-duplicates-from-sorted-array': {
    statement: `\`nums\` is sorted in non-decreasing order. Rearrange it in place so that each distinct value appears exactly once at the front of the array, in the same order as before, and return \`k\`, the number of distinct values.

Only the first \`k\` positions matter; whatever is left after them is ignored. Do it without allocating another array. The judge prints \`k\` followed by the first \`k\` elements.`,
    constraints: ['1 <= nums.length <= 3e4', '-100 <= nums[i] <= 100', 'nums is sorted in non-decreasing order'],
    hints: [
      'Because the array is sorted, all copies of a value sit next to each other. How do you know a value is new?',
      'Keep a write pointer w for the next free slot of the answer. Scan with a read pointer; copy a value to nums[w] only when it differs from the last value you wrote.',
      'Compare against nums[w - 1] (the last value kept), not nums[i - 1]. Return w at the end.',
    ],
  },
  'move-zeroes': {
    statement: `Move every \`0\` in \`nums\` to the end of the array while keeping all non-zero values in their original relative order. Change the array in place; do not make a copy.

The method returns nothing. The judge prints \`nums\` after your call.`,
    constraints: ['1 <= nums.length <= 1e4', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: [
      'Think of it as "keep the non-zero values, in order, at the front".',
      'Use a write pointer: copy each non-zero value to nums[w++] as you scan.',
      'After the scan, every position from w to the end should be 0. Fill them in, or swap instead of copying so the zeros move back on their own.',
    ],
  },
  'squares-of-a-sorted-array': {
    statement: `\`nums\` is sorted in non-decreasing order and may contain negative numbers. Return a new array with the square of every value, also sorted in non-decreasing order.

Squaring then sorting works in O(n log n). The interesting solution runs in O(n).`,
    constraints: ['1 <= nums.length <= 1e4', '-1e4 <= nums[i] <= 1e4', 'nums is sorted in non-decreasing order'],
    hints: [
      'Where in the input are the largest squares? Think about large negative values.',
      'The biggest square is always at one of the two ends. Compare the absolute values at the left and right ends.',
      'Fill the result from the back: put the larger square in the last free slot and move that pointer inward.',
    ],
  },
  'two-sum-ii-input-array-is-sorted': {
    statement: `\`numbers\` is sorted in non-decreasing order and uses 1-based positions. Find two different positions whose values add up to \`target\` and return them as \`[index1, index2]\` with \`index1 < index2\`.

Exactly one pair works for every input. Use only constant extra space, so no hash map.`,
    constraints: ['2 <= numbers.length <= 3e4', '-1e5 <= numbers[i] <= 1e5', '-2e5 <= target <= 2e5', 'numbers is sorted in non-decreasing order', 'Exactly one answer exists'],
    hints: [
      'The array is sorted. If the sum of two values is too small, which value should grow?',
      'Start with one pointer at each end. If the sum is less than target, move the left pointer right; if it is greater, move the right pointer left.',
      'Each step rules out one value for good, so the scan is O(n). Remember to add 1 to both indices in the answer.',
    ],
  },
  'container-with-most-water': {
    statement: `\`height[i]\` is a vertical line standing at \`x = i\`. Choose two lines; together with the x-axis they form a container. The water it holds is the distance between the lines times the height of the shorter line.

Return the largest amount of water any pair of lines can hold. The container cannot be tilted.`,
    constraints: ['n == height.length', '2 <= n <= 1e5', '0 <= height[i] <= 1e4'],
    hints: [
      'The widest container uses the first and last line. Start there; how could a narrower one ever be bigger?',
      'A narrower container can only win if it is taller. Moving the taller line inward can never help, because the shorter line still limits the height.',
      'Keep two pointers at the ends, record the area, then move the pointer at the shorter line inward. O(n) time.',
    ],
  },
  '3sum': {
    statement: `Return every triplet \`[a, b, c]\` of values taken from three different positions of \`nums\` such that \`a + b + c == 0\`.

Each triplet of values may appear only once in the answer, even if it can be formed from different positions. The triplets, and the values inside them, may be in any order.`,
    constraints: ['3 <= nums.length <= 3000', '-1e5 <= nums[i] <= 1e5'],
    hints: [
      'Sort the array first. Fixing one value turns the rest into a problem you have seen: two values that add up to a target.',
      'For each index i, run a two-pointer search on the part after i for two values that sum to -nums[i].',
      'Avoid duplicates by skipping an i whose value equals the previous one, and after a match, moving both pointers past repeated values. O(n²) overall.',
    ],
  },
  'sort-colors': {
    statement: `\`nums\` holds only the values \`0\`, \`1\` and \`2\` (think red, white and blue). Sort it in place so all 0s come first, then the 1s, then the 2s.

Do not use a library sort. Counting the values and rewriting the array works in two passes; the classic solution needs only one pass and constant extra space. The judge prints \`nums\` after your call.`,
    constraints: ['n == nums.length', '1 <= n <= 300', '0 <= nums[i] <= 2'],
    hints: [
      'Keep three regions: 0s at the front, 2s at the back, and an unknown middle you shrink as you go.',
      'Use pointers low, mid and high. A 0 at mid swaps to low (move both forward); a 2 swaps to high (move high back); a 1 just moves mid forward.',
      'After swapping with high, do not advance mid: the value you swapped in has not been looked at yet. Stop when mid passes high.',
    ],
  },
  'trapping-rain-water': {
    statement: `\`height\` describes an elevation map: bar \`i\` has width 1 and height \`height[i]\`. After it rains, water collects in the dips between taller bars.

Return the total units of water trapped.`,
    constraints: ['n == height.length', '1 <= n <= 2e4', '0 <= height[i] <= 1e5'],
    hints: [
      'Look at one position on its own. How high can the water above it rise?',
      'Water above position i reaches min(tallest bar to its left, tallest bar to its right), minus height[i]. Prefix and suffix maximums give an O(n) solution with O(n) space.',
      'For O(1) space, use two pointers and track leftMax and rightMax. Whichever side has the smaller max is the limiting side, so you can settle that position and move inward.',
    ],
  },
};
