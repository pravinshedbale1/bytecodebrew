export default {
  'sum-of-all-odd-length-subarrays': {
    statement: `You are given an array of positive integers \`arr\`. Consider every contiguous subarray of \`arr\` whose length is odd (1, 3, 5, …). Return the sum of all the elements of all those subarrays.

Follow-up: can you do it in O(n) time and O(1) space?`,
    constraints: ['1 <= arr.length <= 100', '1 <= arr[i] <= 1000'],
    hints: [
      'With n ≤ 100, adding up every odd-length subarray directly works, especially with prefix sums. For O(n), think about one element at a time instead of one subarray at a time.',
      'Index i is in (i + 1) × (n − i) subarrays: i + 1 possible starts times n − i possible ends.',
      'A subarray [l, r] has odd length exactly when l and r have the same parity. Of the (i + 1)(n − i) subarrays containing i, ⌈(i + 1)(n − i) / 2⌉ have odd length. Add arr[i] times that.',
    ],
  },
  'number-of-zero-filled-subarrays': {
    statement: `Given an integer array \`nums\`, return how many contiguous, non-empty subarrays consist only of zeros.`,
    constraints: ['1 <= nums.length <= 1e5', '-1e9 <= nums[i] <= 1e9'],
    hints: [
      'A block of z consecutive zeros contains z × (z + 1) / 2 all-zero subarrays. Can you avoid computing blocks separately?',
      'Count each subarray at its right end. If the current run of zeros (ending at i) has length run, how many all-zero subarrays end exactly at i?',
      'Keep run = run + 1 on a zero and 0 otherwise, and add run to the answer at every index. Use a 64-bit total.',
    ],
  },
  'vowels-of-all-substrings': {
    statement: `Given a string \`word\`, return the total number of vowels (\`'a'\`, \`'e'\`, \`'i'\`, \`'o'\`, \`'u'\`) in every substring of \`word\`, added up.

A substring is a contiguous, non-empty run of characters. The answer can be larger than a 32-bit integer.`,
    constraints: ['1 <= word.length <= 1e5', 'word consists of lowercase English letters'],
    hints: [
      'There are about n² / 2 substrings, too many to list for n = 10⁵. Flip it: how many substrings contain the character at index i?',
      'A substring containing index i starts at one of 0 … i and ends at one of i … n − 1.',
      'Every vowel at index i contributes (i + 1) × (n − i). Compute it in 64-bit arithmetic.',
    ],
  },
  'total-hamming-distance': {
    statement: `The Hamming distance between two integers is the number of bit positions where their bits differ.

Given an integer array \`nums\`, return the sum of the Hamming distances between all pairs of numbers in \`nums\` (each unordered pair once).`,
    constraints: ['1 <= nums.length <= 1e4', '0 <= nums[i] <= 1e9', 'The answer fits in a 32-bit integer'],
    hints: [
      'Comparing every pair is O(n²), up to 5 × 10⁷ pairs. Bits are independent, though: look at one bit position at a time.',
      'At bit b, suppose ones numbers have a 1 and zeros have a 0. Which pairs differ at bit b?',
      'Exactly the ones × zeros mixed pairs. Add ones × (n − ones) over all 32 bit positions: O(32 · n).',
    ],
  },
  'bitwise-xor-of-all-pairings': {
    statement: `You are given two arrays \`nums1\` and \`nums2\` of non-negative integers. Imagine an array \`nums3\` that holds \`nums1[i] ^ nums2[j]\` for every pair of indices \`(i, j)\`, each pair exactly once.

Return the bitwise XOR of all the integers in \`nums3\`.`,
    constraints: ['1 <= nums1.length, nums2.length <= 1e5', '0 <= nums1[i] <= 1e9', '0 <= nums2[i] <= 1e9'],
    hints: [
      'nums3 can have 10¹⁰ elements, so don\'t build it. XOR is commutative and associative, so you only need to know how many times each original value ends up in the big XOR.',
      'Each nums1[i] is paired with every element of nums2, so it appears nums2.length times. Each nums2[j] appears nums1.length times.',
      'x ^ x = 0, so a value appearing an even number of times cancels. XOR all of nums1 if nums2.length is odd, and all of nums2 if nums1.length is odd.',
    ],
  },
  'sum-of-absolute-differences-in-a-sorted-array': {
    statement: `You are given an integer array \`nums\` sorted in non-decreasing order.

Return an array \`result\` of the same length where \`result[i]\` is the sum of \`|nums[i] − nums[j]|\` over all indices \`j\` (including \`j = i\`, which adds 0).`,
    constraints: ['2 <= nums.length <= 1e5', '1 <= nums[i] <= 1e4', 'nums is sorted in non-decreasing order'],
    hints: [
      'Computing each result[i] with its own loop is O(n²). Use the fact that the array is sorted.',
      'Every element before i is ≤ nums[i] and every element after is ≥ nums[i], so the absolute values can be dropped: the left part is nums[i] × i − (sum of the first i elements).',
      'With prefix sums p, result[i] = (nums[i] · i − p[i]) + ((p[n] − p[i + 1]) − nums[i] · (n − 1 − i)).',
    ],
  },
  'sum-of-distances': {
    statement: `You are given a 0-indexed integer array \`nums\`. Build an array \`arr\` of the same length where \`arr[i]\` is the sum of \`|i − j|\` over every index \`j ≠ i\` with \`nums[j] == nums[i]\`. If no such \`j\` exists, \`arr[i]\` is 0.

Return \`arr\`.`,
    constraints: ['1 <= nums.length <= 1e5', '0 <= nums[i] <= 1e9'],
    hints: [
      'Only indices holding the same value interact. Group the indices by value (they come out sorted if you collect them left to right).',
      'Inside one group the problem is "sum of absolute differences in a sorted array" applied to the indices.',
      'For the k-th index j of a group: (j · k − sum of the indices before it) + (sum of the indices after it − j · (size − 1 − k)). Track the running sum and use 64-bit values.',
    ],
  },
  'subarray-product-less-than-k': {
    statement: `Given an array of positive integers \`nums\` and an integer \`k\`, return the number of contiguous subarrays whose product of all elements is strictly less than \`k\`.`,
    constraints: ['1 <= nums.length <= 3e4', '1 <= nums[i] <= 1000', '0 <= k <= 1e6'],
    hints: [
      'The values are positive, so extending a subarray never lowers its product, and shrinking it never raises it.',
      'For each right end r, find the leftmost l such that the product of nums[l..r] is < k with a sliding window. Every start from l to r then works.',
      'Add r − l + 1 for each r. If k ≤ 1, no product of positive integers is < k: return 0 (and avoid an endless shrink loop).',
    ],
  },
  'count-subarrays-where-max-element-appears-at-least-k-times': {
    statement: `You are given an integer array \`nums\` and a positive integer \`k\`. Let \`m\` be the maximum element of the whole array.

Return the number of contiguous subarrays in which \`m\` appears at least \`k\` times.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e6', '1 <= k <= 1e5'],
    hints: [
      '"At least k" is monotone: if [l, r] has k copies of m, so does every [l′, r] with l′ ≤ l.',
      'Slide a window and, for each r, move l forward while the window still has at least k copies of m. Afterwards [l, r] has fewer than k copies, but [l − 1, r] had k.',
      'So every start 0 … l − 1 works for this r: add l. The total can exceed 32 bits.',
    ],
  },
  'sum-of-subarray-ranges': {
    statement: `The range of a subarray is the difference between its largest and smallest elements.

Given an integer array \`nums\`, return the sum of the ranges of all its contiguous, non-empty subarrays.

Follow-up: can you do it in O(n) time?`,
    constraints: ['1 <= nums.length <= 1000', '-1e9 <= nums[i] <= 1e9'],
    hints: [
      'With n ≤ 1000, fixing the start and extending the end while tracking the running min and max is O(n²) and fast enough.',
      'For O(n), split it: the answer is (sum of every subarray\'s maximum) − (sum of every subarray\'s minimum).',
      'Each sum is a contribution problem: a[i] is the minimum of (i − prev smaller) × (next smaller-or-equal − i) subarrays, found with a monotonic stack. Do the same for maximums.',
    ],
  },
  'minimum-fuel-cost-to-report-to-the-capital': {
    statement: `A country has \`n\` cities numbered \`0\` to \`n − 1\`, connected by \`n − 1\` bidirectional roads that form a tree (\`roads[i] = [a, b]\`). City \`0\` is the capital.

Every city except the capital sends one representative to the capital. Each city has a car with \`seats\` seats. A representative may ride in their own car or get into another one at any city they pass through. Driving a car along one road costs one litre of fuel.

Return the minimum number of litres needed for all representatives to reach the capital.`,
    constraints: ['1 <= n <= 1e5', 'roads.length == n - 1', '1 <= seats <= 1e5', 'roads forms a tree on 0 … n − 1'],
    hints: [
      'Look at one road at a time. Which representatives must cross the road between a city v and its parent (towards the capital)?',
      'Exactly the people in v\'s subtree, and they can all meet at v first and share cars. So that road costs ⌈size(v) / seats⌉ litres, no matter what happens elsewhere.',
      'One traversal from the capital computes every subtree size; add ⌈size / seats⌉ for every non-capital city. Use an iterative traversal: a path of 10⁵ cities overflows recursion.',
    ],
  },
  'sum-of-subsequence-widths': {
    statement: `The width of a sequence is the difference between its maximum and minimum elements.

Given an integer array \`nums\`, return the sum of the widths of all its non-empty subsequences. A subsequence keeps the original order but may skip elements; different index choices count as different subsequences. Return the answer modulo \`10⁹ + 7\`.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e5'],
    hints: [
      'There are 2ⁿ − 1 subsequences, far too many. The width only depends on which values are picked, not their order, so you may sort.',
      'After sorting, nums[i] is the maximum of the subsequences that pick it plus any subset of the i smaller elements: 2^i of them. It is the minimum of 2^(n − 1 − i).',
      'Add nums[i] × (2^i − 2^(n−1−i)) modulo 10⁹ + 7, with precomputed powers of two. Fix a negative running total at the end.',
    ],
  },
  'total-appeal-of-a-string': {
    statement: `The appeal of a string is the number of distinct characters it contains. For example, the appeal of \`"abbca"\` is 3 (\`'a'\`, \`'b'\` and \`'c'\`).

Given a string \`s\`, return the sum of the appeals of all its substrings.`,
    constraints: ['1 <= s.length <= 1e5', 's consists of lowercase English letters'],
    hints: [
      'A letter that appears several times in a substring adds only 1 to its appeal. Decide which copy gets the credit: the first one in the substring.',
      's[i] is the first copy of its letter in substring [l, r] exactly when l is after the previous occurrence of that letter (call it last).',
      'So s[i] adds (i − last) × (n − i). Keep last[26] (−1 when unseen) and use a 64-bit total.',
    ],
  },
  'count-unique-characters-of-all-substrings-of-a-given-string': {
    statement: `For a string \`t\`, let \`countUniqueChars(t)\` be the number of characters that appear exactly once in \`t\`. For example, \`countUniqueChars("LEETCODE") = 5\` (\`L\`, \`T\`, \`C\`, \`O\` and \`D\`).

Given a string \`s\`, return the sum of \`countUniqueChars(t)\` over every substring \`t\` of \`s\`. Substrings at different positions are counted separately, even if they are equal. The answer fits in a 32-bit integer.`,
    constraints: ['1 <= s.length <= 1e5', 's consists of uppercase English letters'],
    hints: [
      'Flip it: for each index i, in how many substrings is s[i] the only copy of its letter?',
      'The substring must start after the previous occurrence of s[i] and end before the next occurrence.',
      'With prev[i] (−1 if none) and next[i] (n if none), s[i] adds (i − prev[i]) × (next[i] − i).',
    ],
  },
  'count-subarrays-with-score-less-than-k': {
    statement: `The score of an array is the sum of its elements multiplied by its length. For example, the score of \`[1, 2, 3, 4, 5]\` is \`15 × 5 = 75\`.

Given an array of positive integers \`nums\` and an integer \`k\`, return the number of non-empty contiguous subarrays whose score is strictly less than \`k\`.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e5', '1 <= k <= 1e15'],
    hints: [
      'All values are positive, so shrinking a subarray lowers both its sum and its length: if [l, r] is valid, so is every [l′, r] with l′ ≥ l.',
      'Slide a window: add nums[r], then drop from the left while sum × (r − l + 1) ≥ k.',
      'Then every subarray ending at r and starting in [l, r] is valid: add r − l + 1. Use 64-bit arithmetic for the sum, the score and the count.',
    ],
  },
  'sum-of-total-strength-of-wizards': {
    statement: `\`strength[i]\` is the strength of the i-th wizard in a line. For any contiguous group of wizards, its total strength is (the strength of its weakest wizard) × (the sum of all strengths in the group).

Return the sum of the total strengths of all contiguous groups, modulo \`10⁹ + 7\`.`,
    constraints: ['1 <= strength.length <= 1e5', '1 <= strength[i] <= 1e9'],
    hints: [
      'Credit each group to its weakest wizard (break ties consistently). A monotonic stack gives, for each i, the range of starts and ends where strength[i] is the minimum.',
      'For those groups you need the sum of their sums. With prefix sums P, a group [l, r] sums to P[r + 1] − P[l]: each P[r + 1] appears once per possible start and each P[l] once per possible end.',
      'Runs of consecutive P values are ranges of a second prefix sum PP over P. Combine (starts) × (sum of P over the ends) − (ends) × (sum of P over the starts), all modulo 10⁹ + 7.',
    ],
  },
  'sum-of-distances-in-tree': {
    statement: `There is an undirected tree with \`n\` nodes labelled \`0\` to \`n − 1\` and \`n − 1\` edges given in \`edges\`.

Return an array \`answer\` of length \`n\` where \`answer[i]\` is the sum of the distances between node \`i\` and every other node. The distance between two nodes is the number of edges on the path between them.`,
    constraints: ['1 <= n <= 3e4', 'edges.length == n - 1', 'edges forms a tree on 0 … n − 1'],
    hints: [
      'A BFS from every node is O(n²), too slow for 3 × 10⁴. First get answer[0] cheaply: each node below an edge uses that edge once on its way to 0, so answer[0] is the sum of all subtree sizes (except the root\'s).',
      'Now move the root from a parent p to its child c. The size[c] nodes in c\'s subtree each get one step closer; the other n − size[c] nodes each get one step farther.',
      'So answer[c] = answer[p] − size[c] + (n − size[c]). Two traversals, O(n); make them iterative to stay safe on long paths.',
    ],
  },
};
