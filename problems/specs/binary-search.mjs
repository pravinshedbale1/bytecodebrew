export default [
  {
    slug: 'binary-search', title: 'Binary Search', level: 'Easy',
    summary: 'Return the index of target in a sorted array of distinct values, or -1, in O(log n).',
    method: 'search', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int',
    tests: [
      { in: [[-1, 0, 3, 5, 9, 12], 9], out: 4 },
      { in: [[-1, 0, 3, 5, 9, 12], 2], out: -1 },
      { in: [[5], 5] },
      { in: [[5], -5] },
      { in: [[1, 3, 5, 7, 9, 11, 13], 1] },
      { in: [[1, 3, 5, 7, 9, 11, 13], 13] },
    ],
    ref: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
}`,
  },
  {
    slug: 'search-insert-position', title: 'Search Insert Position', level: 'Easy',
    summary: 'In a sorted array of distinct values, return the index of target, or the index where it would be inserted to keep the order.',
    method: 'searchInsert', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int',
    tests: [
      { in: [[1, 3, 5, 6], 5], out: 2 },
      { in: [[1, 3, 5, 6], 2], out: 1 },
      { in: [[1, 3, 5, 6], 7], out: 4 },
      { in: [[1, 3, 5, 6], 0] },
      { in: [[1], 1] },
    ],
    ref: `class Solution {
    public int searchInsert(int[] nums, int target) {
        int lo = 0, hi = nums.length;
        while (lo < hi) { int mid = lo + (hi - lo) / 2; if (nums[mid] >= target) hi = mid; else lo = mid + 1; }
        return lo;
    }
}`,
  },
  {
    slug: 'first-bad-version', title: 'First Bad Version', level: 'Easy',
    summary: 'Versions 1..n are good up to some version, then every later one is bad. Using the provided isBadVersion(v), find the first bad version with as few calls as possible. (The tests also tell the judge which version is the first bad one.)',
    method: 'firstBadVersion', params: [['int', 'n'], ['int', 'bad']], starterParams: [['int', 'n']], returns: 'int',
    uses: ['VersionControl'], extends: 'VersionControl',
    call: 'VersionControl.BAD = BCB.I($1); Object r = s.firstBadVersion(BCB.I($0));',
    tests: [
      { in: [5, 4], out: 4 },
      { in: [1, 1], out: 1 },
      { in: [10, 1] },
      { in: [10, 10] },
      { in: [2126753390, 1702766719] },
    ],
    ref: `class Solution extends VersionControl {
    public int firstBadVersion(int n) {
        int lo = 1, hi = n;
        while (lo < hi) { int mid = lo + (hi - lo) / 2; if (isBadVersion(mid)) hi = mid; else lo = mid + 1; }
        return lo;
    }
}`,
  },
  {
    slug: 'sqrtx', title: 'Sqrt(x)', level: 'Easy',
    summary: 'Return the square root of a non-negative integer x, rounded down, without using a built-in power or sqrt function.',
    method: 'mySqrt', params: [['int', 'x']], returns: 'int',
    tests: [
      { in: [4], out: 2 },
      { in: [8], out: 2 },
      { in: [0], out: 0 },
      { in: [1] },
      { in: [2147395599] },
      { in: [2147483647] },
    ],
    ref: `class Solution {
    public int mySqrt(int x) {
        long lo = 0, hi = x;
        while (lo < hi) { long mid = (lo + hi + 1) / 2; if (mid * mid <= x) lo = mid; else hi = mid - 1; }
        return (int) lo;
    }
}`,
  },
  {
    slug: 'find-first-and-last-position-of-element-in-sorted-array', title: 'Find First and Last Position of Element in Sorted Array', level: 'Medium',
    summary: 'In a sorted array (duplicates allowed), return [first, last] index of target, or [-1, -1], in O(log n).',
    method: 'searchRange', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int[]',
    tests: [
      { in: [[5, 7, 7, 8, 8, 10], 8], out: [3, 4] },
      { in: [[5, 7, 7, 8, 8, 10], 6], out: [-1, -1] },
      { in: [[], 0], out: [-1, -1] },
      { in: [[1], 1] },
      { in: [[2, 2, 2, 2], 2] },
      { in: [[1, 2, 3], 3] },
    ],
    ref: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        int first = lower(nums, target);
        if (first == nums.length || nums[first] != target) return new int[] { -1, -1 };
        return new int[] { first, lower(nums, target + 1) - 1 };
    }
    private int lower(int[] a, int t) {
        int lo = 0, hi = a.length;
        while (lo < hi) { int mid = (lo + hi) >>> 1; if (a[mid] >= t) hi = mid; else lo = mid + 1; }
        return lo;
    }
}`,
  },
  {
    slug: 'search-a-2d-matrix', title: 'Search a 2D Matrix', level: 'Medium',
    summary: 'Each row is sorted and each row starts after the previous row ends. Return whether target is in the matrix, in O(log(m·n)).',
    method: 'searchMatrix', params: [['int[][]', 'matrix'], ['int', 'target']], returns: 'boolean',
    tests: [
      { in: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], out: true },
      { in: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], out: false },
      { in: [[[1]], 1] },
      { in: [[[1, 3]], 3] },
      { in: [[[1], [3]], 2] },
    ],
    ref: `class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = matrix.length, c = matrix[0].length, lo = 0, hi = r * c - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, v = matrix[mid / c][mid % c];
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
}`,
  },
  {
    slug: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', level: 'Medium',
    summary: 'A sorted array of distinct values was rotated some number of times. Return its minimum in O(log n).',
    method: 'findMin', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[3, 4, 5, 1, 2]], out: 1 },
      { in: [[4, 5, 6, 7, 0, 1, 2]], out: 0 },
      { in: [[11, 13, 15, 17]], out: 11 },
      { in: [[2, 1]] },
      { in: [[5]] },
    ],
    ref: `class Solution {
    public int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) { int mid = (lo + hi) >>> 1; if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid; }
        return nums[lo];
    }
}`,
  },
  {
    slug: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', level: 'Medium',
    summary: 'A sorted array of distinct values was rotated at an unknown pivot. Return the index of target or -1, in O(log n).',
    method: 'search', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int',
    tests: [
      { in: [[4, 5, 6, 7, 0, 1, 2], 0], out: 4 },
      { in: [[4, 5, 6, 7, 0, 1, 2], 3], out: -1 },
      { in: [[1], 0], out: -1 },
      { in: [[3, 1], 1] },
      { in: [[5, 1, 3], 5] },
      { in: [[6, 7, 1, 2, 3, 4, 5], 7] },
    ],
    ref: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
}`,
  },
  {
    slug: 'find-peak-element', title: 'Find Peak Element', level: 'Medium',
    summary: 'Return the index of any element strictly greater than its neighbours (treat the outside as −∞; neighbours are never equal), in O(log n). Any peak is accepted.',
    method: 'findPeakElement', params: [['int[]', 'nums']], returns: 'int', check: 'custom:peak',
    tests: [
      { in: [[1, 2, 3, 1]] },
      { in: [[1, 2, 1, 3, 5, 6, 4]] },
      { in: [[1]] },
      { in: [[2, 1]] },
      { in: [[1, 2, 3, 4, 5]] },
    ],
    ref: `class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) { int mid = (lo + hi) >>> 1; if (nums[mid] > nums[mid + 1]) hi = mid; else lo = mid + 1; }
        return lo;
    }
}`,
  },
  {
    slug: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', level: 'Hard',
    summary: 'Return the median of two sorted arrays taken together, in O(log(m + n)).',
    method: 'findMedianSortedArrays', params: [['int[]', 'nums1'], ['int[]', 'nums2']], returns: 'double',
    tests: [
      { in: [[1, 3], [2]], out: 2.0 },
      { in: [[1, 2], [3, 4]], out: 2.5 },
      { in: [[], [1]] },
      { in: [[0, 0], [0, 0]] },
      { in: [[1, 5, 9], [2, 3, 4, 10, 11]] },
    ],
    ref: `class Solution {
    public double findMedianSortedArrays(int[] a, int[] b) {
        if (a.length > b.length) return findMedianSortedArrays(b, a);
        int m = a.length, n = b.length, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = (m + n + 1) / 2 - i;
            int aL = i == 0 ? Integer.MIN_VALUE : a[i - 1], aR = i == m ? Integer.MAX_VALUE : a[i];
            int bL = j == 0 ? Integer.MIN_VALUE : b[j - 1], bR = j == n ? Integer.MAX_VALUE : b[j];
            if (aL <= bR && bL <= aR) {
                if ((m + n) % 2 == 1) return Math.max(aL, bL);
                return (Math.max(aL, bL) + (double) Math.min(aR, bR)) / 2;
            }
            if (aL > bR) hi = i - 1; else lo = i + 1;
        }
        return 0;
    }
}`,
  },
  {
    slug: 'guess-number-higher-or-lower', title: 'Guess Number Higher or Lower', level: 'Easy',
    summary: 'A number between 1 and n has been picked. The provided guess(num) returns -1 if num is too high, 1 if it is too low and 0 if it is right. Return the picked number. (The tests also tell the judge which number was picked.)',
    method: 'guessNumber', params: [['int', 'n'], ['int', 'pick']], starterParams: [['int', 'n']], returns: 'int',
    uses: ['GuessGame'], extends: 'GuessGame',
    call: 'GuessGame.PICK = BCB.I($1); Object r = s.guessNumber(BCB.I($0));',
    tests: [
      { in: [10, 6], out: 6 },
      { in: [1, 1], out: 1 },
      { in: [2, 1], out: 1 },
      { in: [2, 2] },
      { in: [2126753390, 1702766719] },
      { in: [2147483647, 2147483647] },
    ],
    ref: `class Solution extends GuessGame {
    public int guessNumber(int n) {
        int lo = 1, hi = n;
        while (true) {
            int mid = lo + (hi - lo) / 2, g = guess(mid);
            if (g == 0) return mid;
            if (g < 0) hi = mid - 1; else lo = mid + 1;
        }
    }
}`,
  },
  {
    slug: 'search-in-rotated-sorted-array-ii', title: 'Search in Rotated Sorted Array II', level: 'Medium',
    summary: 'nums was sorted (with possible duplicates) and then rotated at an unknown pivot. Return true if target is in nums.',
    method: 'search', params: [['int[]', 'nums'], ['int', 'target']], returns: 'boolean',
    tests: [
      { in: [[2, 5, 6, 0, 0, 1, 2], 0], out: true },
      { in: [[2, 5, 6, 0, 0, 1, 2], 3], out: false },
      { in: [[1, 0, 1, 1, 1], 0] },
      { in: [[1], 1] },
      { in: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 13] },
      { in: [[3, 1], 1] },
      { in: [[4, 5, 6, 7, 0, 1, 2], 8] },
      { in: [[1, 3, 1, 1, 1], 3] },
    ],
    ref: `class Solution {
    public boolean search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] == target) return true;
            if (nums[lo] == nums[mid] && nums[mid] == nums[hi]) { lo++; hi--; }
            else if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return false;
    }
}`,
  },
  {
    slug: 'find-in-mountain-array', title: 'Find in Mountain Array', level: 'Hard',
    summary: 'A mountain array strictly increases to a peak, then strictly decreases. You can read it only through MountainArray.get(index) (at most 100 calls) and length(). Return the smallest index holding target, or -1.',
    method: 'findInMountainArray', params: [['int[]', 'mountainArr'], ['int', 'target']], starterParams: [['int', 'target'], ['MountainArray', 'mountainArr']], returns: 'int',
    uses: ['MountainArray'],
    call: 'Object r = s.findInMountainArray(BCB.I($1), new BCBM(BCB.IA($0)));',
    tests: [
      { in: [[1, 2, 3, 4, 5, 3, 1], 3], out: 2 },
      { in: [[0, 1, 2, 4, 2, 1], 3], out: -1 },
      { in: [[1, 5, 2], 2] },
      { in: [[1, 5, 2], 1] },
      { in: [[3, 5, 3, 2, 0], 0] },
      { in: [[0, 5, 3, 1], 5] },
      { in: [[...Array.from({ length: 700 }, (_, i) => 2 * i + 1), ...Array.from({ length: 700 }, (_, j) => 1398 - 2 * j)], 600] },
      { in: [[...Array.from({ length: 5000 }, (_, i) => i), ...Array.from({ length: 4999 }, (_, j) => 4998 - j)], 4321] },
      { in: [[...Array.from({ length: 300 }, (_, i) => 3 * i), ...Array.from({ length: 200 }, (_, j) => 1000 - 5 * j)], 7] },
    ],
    ref: `class Solution {
    public int findInMountainArray(int target, MountainArray mountainArr) {
        int n = mountainArr.length();
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (mountainArr.get(mid) < mountainArr.get(mid + 1)) lo = mid + 1; else hi = mid;
        }
        int peak = lo;
        lo = 0; hi = peak;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, v = mountainArr.get(mid);
            if (v == target) return mid;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        lo = peak + 1; hi = n - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, v = mountainArr.get(mid);
            if (v == target) return mid;
            if (v > target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
}`,
  },
];
