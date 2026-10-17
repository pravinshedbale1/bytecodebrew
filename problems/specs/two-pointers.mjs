export default [
  {
    slug: 'valid-palindrome', title: 'Valid Palindrome', level: 'Easy',
    summary: 'After lower-casing letters and dropping every character that is not a letter or digit, does the string read the same both ways?',
    method: 'isPalindrome', params: [['String', 's']], returns: 'boolean',
    tests: [
      { in: ['A man, a plan, a canal: Panama'], out: true },
      { in: ['race a car'], out: false },
      { in: [' '], out: true },
      { in: ['0P'] },
      { in: ['ab_a'] },
      { in: ['.,'] },
    ],
    ref: `class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            if (!Character.isLetterOrDigit(s.charAt(i))) i++;
            else if (!Character.isLetterOrDigit(s.charAt(j))) j--;
            else if (Character.toLowerCase(s.charAt(i++)) != Character.toLowerCase(s.charAt(j--))) return false;
        }
        return true;
    }
}`,
  },
  {
    slug: 'remove-duplicates-from-sorted-array', title: 'Remove Duplicates from Sorted Array', level: 'Easy',
    summary: 'Given a sorted array, keep one copy of each value at the front, in order, in place, and return how many unique values there are. The judge prints k and the first k elements.',
    method: 'removeDuplicates', params: [['int[]', 'nums']], returns: 'int',
    call: 'int[] a = BCB.IA($0); int k = s.removeDuplicates(a); Object r = new Object[] { k, Arrays.copyOf(a, Math.max(0, Math.min(k, a.length))) };',
    tests: [
      { in: [[1, 1, 2]], out: [2, [1, 2]] },
      { in: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], out: [5, [0, 1, 2, 3, 4]] },
      { in: [[7]] },
      { in: [[-3, -3, -3]] },
      { in: [[1, 2, 3, 4]] },
    ],
    ref: `class Solution {
    public int removeDuplicates(int[] nums) {
        int w = 0;
        for (int x : nums) if (w == 0 || nums[w - 1] != x) nums[w++] = x;
        return w;
    }
}`,
  },
  {
    slug: 'move-zeroes', title: 'Move Zeroes', level: 'Easy',
    summary: 'Move every 0 to the end of the array in place, keeping the other values in their original order. The judge prints the array after your call.',
    method: 'moveZeroes', params: [['int[]', 'nums']], returns: 'void', output: 0,
    tests: [
      { in: [[0, 1, 0, 3, 12]], out: [1, 3, 12, 0, 0] },
      { in: [[0]], out: [0] },
      { in: [[1, 2, 3]] },
      { in: [[0, 0, 1]] },
      { in: [[4, 0, -2, 0, 0, 7]] },
    ],
    ref: `class Solution {
    public void moveZeroes(int[] nums) {
        int w = 0;
        for (int x : nums) if (x != 0) nums[w++] = x;
        while (w < nums.length) nums[w++] = 0;
    }
}`,
  },
  {
    slug: 'squares-of-a-sorted-array', title: 'Squares of a Sorted Array', level: 'Easy',
    summary: 'Given a sorted array that may contain negatives, return the squares of its values in sorted order — ideally in O(n).',
    method: 'sortedSquares', params: [['int[]', 'nums']], returns: 'int[]',
    tests: [
      { in: [[-4, -1, 0, 3, 10]], out: [0, 1, 9, 16, 100] },
      { in: [[-7, -3, 2, 3, 11]], out: [4, 9, 9, 49, 121] },
      { in: [[-5]] },
      { in: [[-3, -2, -1]] },
      { in: [[0, 0, 1]] },
    ],
    ref: `class Solution {
    public int[] sortedSquares(int[] nums) {
        int n = nums.length, i = 0, j = n - 1;
        int[] out = new int[n];
        for (int w = n - 1; w >= 0; w--) {
            if (Math.abs(nums[i]) > Math.abs(nums[j])) { out[w] = nums[i] * nums[i]; i++; }
            else { out[w] = nums[j] * nums[j]; j--; }
        }
        return out;
    }
}`,
  },
  {
    slug: 'two-sum-ii-input-array-is-sorted', title: 'Two Sum II - Input Array Is Sorted', level: 'Medium',
    summary: 'In a 1-indexed sorted array, find the two positions whose values add up to target (exactly one answer exists) using O(1) extra space. Return them as [index1, index2].',
    method: 'twoSum', params: [['int[]', 'numbers'], ['int', 'target']], returns: 'int[]',
    tests: [
      { in: [[2, 7, 11, 15], 9], out: [1, 2] },
      { in: [[2, 3, 4], 6], out: [1, 3] },
      { in: [[-1, 0], -1], out: [1, 2] },
      { in: [[1, 2, 3, 4, 4, 9, 56, 90], 8] },
      { in: [[-10, -3, 0, 5, 9], 6] },
    ],
    ref: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int i = 0, j = numbers.length - 1;
        while (i < j) {
            int sum = numbers[i] + numbers[j];
            if (sum == target) return new int[] { i + 1, j + 1 };
            if (sum < target) i++; else j--;
        }
        return new int[0];
    }
}`,
  },
  {
    slug: 'container-with-most-water', title: 'Container With Most Water', level: 'Medium',
    summary: 'height[i] is a vertical line at x = i. Pick two lines that, with the x-axis, hold the most water, and return that area.',
    method: 'maxArea', params: [['int[]', 'height']], returns: 'int',
    tests: [
      { in: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], out: 49 },
      { in: [[1, 1]], out: 1 },
      { in: [[4, 3, 2, 1, 4]] },
      { in: [[1, 2, 1]] },
      { in: [[0, 0, 0, 5]] },
      { in: [[2, 3, 10, 5, 7, 8, 9]] },
    ],
    ref: `class Solution {
    public int maxArea(int[] height) {
        int i = 0, j = height.length - 1, best = 0;
        while (i < j) {
            best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
            if (height[i] < height[j]) i++; else j--;
        }
        return best;
    }
}`,
  },
  {
    slug: '3sum', title: '3Sum', level: 'Medium',
    summary: 'Return every unique triplet of values (from different positions) that sums to zero. Triplets may be in any order.',
    method: 'threeSum', params: [['int[]', 'nums']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [[-1, 0, 1, 2, -1, -4]], out: [[-1, -1, 2], [-1, 0, 1]] },
      { in: [[0, 1, 1]], out: [] },
      { in: [[0, 0, 0]], out: [[0, 0, 0]] },
      { in: [[0, 0, 0, 0]] },
      { in: [[-2, 0, 1, 1, 2]] },
      { in: [[3, -2, 1, 0, -1, 2, -3]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum < 0) l++;
                else if (sum > 0) r--;
                else {
                    out.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return out;
    }
}`,
  },
  {
    slug: 'sort-colors', title: 'Sort Colors', level: 'Medium',
    summary: 'The array holds only 0, 1 and 2. Sort it in place in one pass without a library sort. The judge prints the array after your call.',
    method: 'sortColors', params: [['int[]', 'nums']], returns: 'void', output: 0,
    tests: [
      { in: [[2, 0, 2, 1, 1, 0]], out: [0, 0, 1, 1, 2, 2] },
      { in: [[2, 0, 1]], out: [0, 1, 2] },
      { in: [[1]] },
      { in: [[2, 2, 0, 0]] },
      { in: [[1, 0, 2, 1, 0, 2, 1]] },
    ],
    ref: `class Solution {
    public void sortColors(int[] nums) {
        int lo = 0, mid = 0, hi = nums.length - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) { int t = nums[lo]; nums[lo++] = nums[mid]; nums[mid++] = t; }
            else if (nums[mid] == 2) { int t = nums[hi]; nums[hi--] = nums[mid]; nums[mid] = t; }
            else mid++;
        }
    }
}`,
  },
  {
    slug: 'trapping-rain-water', title: 'Trapping Rain Water', level: 'Hard',
    summary: 'height[i] is the height of a bar of width 1. After rain, how much water is trapped between the bars?',
    method: 'trap', params: [['int[]', 'height']], returns: 'int',
    tests: [
      { in: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], out: 6 },
      { in: [[4, 2, 0, 3, 2, 5]], out: 9 },
      { in: [[1]] },
      { in: [[3, 2, 1]] },
      { in: [[5, 0, 5]] },
      { in: [[2, 0, 2, 0, 3, 1, 4]] },
    ],
    ref: `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1, lmax = 0, rmax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) { lmax = Math.max(lmax, height[l]); water += lmax - height[l++]; }
            else { rmax = Math.max(rmax, height[r]); water += rmax - height[r--]; }
        }
        return water;
    }
}`,
  },
];
