export default {
  'sort-array-by-increasing-frequency': {
    statement: `Sort \`nums\` so that values that occur less often come first. If two values occur equally often, put the larger value first.

Return the sorted array (each value keeps all of its copies).`,
    constraints: ['1 <= nums.length <= 100', '-100 <= nums[i] <= 100'],
    hints: [
      'First count how often each value occurs.',
      'Sort with a custom comparator: by frequency ascending, then by value descending.',
      'Java cannot sort an int[] with a comparator, so box it (Integer[] or a stream), or sort the distinct values and write each one out frequency times.',
    ],
  },
  'sort-an-array': {
    statement: `Sort \`nums\` in ascending order and return it, without using any built-in sort function.

Your algorithm must run in O(n log n) time; the large test punishes quadratic sorts.`,
    constraints: ['1 <= nums.length <= 5e4', '-5e4 <= nums[i] <= 5e4'],
    hints: [
      'Merge sort always runs in O(n log n): split the array in half, sort each half, and merge them.',
      'Quick sort is O(n log n) on average, but a fixed pivot degrades to O(n²) on sorted input or many duplicates. Pick a random pivot and use three-way partitioning.',
      'Heap sort works in place in O(n log n). With values in a small range, counting sort is O(n + range).',
    ],
  },
  'largest-number': {
    statement: `Arrange the non-negative integers in \`nums\` in an order such that, written one after another, they form the largest possible number. Return it as a string, because it may be very large.

The result has no leading zeros, except that an answer of zero is \`"0"\`.`,
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 1e9'],
    hints: [
      'Sorting by numeric value or by plain string order both fail: "3" vs "30" vs "34".',
      'Compare two numbers a and b by which concatenation is bigger: a + b or b + a (as strings).',
      'Sort with that comparator and join. If the first string is "0", every value was 0, so return "0".',
    ],
  },
  'h-index': {
    statement: `\`citations[i]\` is the number of citations of a researcher's \`i\`-th paper. The h-index is the largest \`h\` such that the researcher has at least \`h\` papers that each have at least \`h\` citations.

Return the h-index.`,
    constraints: ['1 <= citations.length <= 5000', '0 <= citations[i] <= 1000'],
    hints: [
      'Sort the citations in descending order. Then h is the number of leading papers whose citation count is at least their 1-based position.',
      'Or avoid sorting: h can be at most n, so count papers into buckets 0 … n (counts above n go into bucket n).',
      'Walk the buckets from n downward with a running total of papers; the first h where the total reaches h is the answer.',
    ],
  },
  'sort-characters-by-frequency': {
    statement: `Rearrange the characters of \`s\` so that they appear in decreasing order of frequency, with all copies of a character next to each other.

If several characters have the same frequency, they may appear in any order. Uppercase and lowercase letters are different characters.`,
    constraints: ['1 <= s.length <= 5e5', '`s` has English letters and digits only'],
    hints: [
      'Count each character first.',
      'Sort the distinct characters by count descending, or put them in a max-heap keyed by count.',
      'Bucket sort is O(n): bucket[c] holds the characters that appear c times. Walk the buckets from the highest count and repeat each character c times.',
    ],
  },
  'maximum-gap': {
    statement: `Return the largest difference between two neighbouring elements of \`nums\` after sorting it. If the array has fewer than two elements, return \`0\`.

Your algorithm must run in linear time and use linear extra space, so a comparison sort is not the intended solution.`,
    constraints: ['1 <= nums.length <= 1e5', '0 <= nums[i] <= 1e9'],
    hints: [
      'With n numbers between min and max, the largest gap is at least (max − min) / (n − 1). So the answer never lies inside a bucket of that width.',
      'Put the values into n − 1 buckets of that width, keeping only each bucket\'s minimum and maximum.',
      'The answer is the largest difference between one non-empty bucket\'s minimum and the previous non-empty bucket\'s maximum. Radix sort is another linear approach.',
    ],
  },
};
