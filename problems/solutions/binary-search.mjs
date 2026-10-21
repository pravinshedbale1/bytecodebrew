const r = String.raw;

export default {
  'binary-search': {
    pattern: 'Classic binary search on a sorted array (halve the range each step)',
    approaches: [
      {
        level: 'Brute force', name: 'Linear scan',
        idea: 'Check every element from the left until `target` is found.',
        steps: [
          'For each index `i`, if `nums[i] == target`, return `i`.',
          'Return −1 if the scan finishes.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'It may look at all n elements; it ignores that the array is sorted, and the problem asks for O(log n).',
        code: {
          java: r`class Solution {
    public int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) if (nums[i] == target) return i;
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int search(vector<int>& nums, int target) {
        for (int i = 0; i < (int) nums.size(); i++) if (nums[i] == target) return i;
        return -1;
    }
};`,
          python: r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        for i, x in enumerate(nums):
            if x == target:
                return i
        return -1`,
          javascript: r`var search = function(nums, target) {
    return nums.indexOf(target);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search',
        idea: 'Compare `target` with the middle element: if they are equal you are done; if `target` is larger it can only be in the right half, otherwise only in the left half. Each comparison halves the range.',
        steps: [
          'Set `lo = 0`, `hi = n − 1`.',
          'While `lo <= hi`: `mid = lo + (hi − lo) / 2`.',
          'If `nums[mid] == target`, return `mid`; if `nums[mid] < target`, set `lo = mid + 1`; else `hi = mid − 1`.',
          'Return −1 when the range is empty.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'The range halves every step, so at most about log₂ n + 1 steps. `lo + (hi − lo) / 2` avoids the overflow that `(lo + hi) / 2` can cause for huge ranges.',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int) nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1`,
          javascript: r`var search = function(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = lo + ((hi - lo) >> 1);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
};`,
        },
      },
    ],
  },

  'search-insert-position': {
    pattern: 'Lower bound: the first index whose value is ≥ target',
    approaches: [
      {
        level: 'Brute force', name: 'Linear scan for the first value ≥ target',
        idea: 'The answer is the first position whose value is at least `target` — that is where `target` is or would go. Scan for it.',
        steps: [
          'For each `i`, if `nums[i] >= target`, return `i`.',
          'If no value is that large, return `n` (insert at the end).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'It may scan the whole array; the problem asks for O(log n).',
        code: {
          java: r`class Solution {
    public int searchInsert(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) if (nums[i] >= target) return i;
        return nums.length;
    }
}`,
          cpp: r`class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        for (int i = 0; i < (int) nums.size(); i++) if (nums[i] >= target) return i;
        return nums.size();
    }
};`,
          python: r`class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        for i, x in enumerate(nums):
            if x >= target:
                return i
        return len(nums)`,
          javascript: r`var searchInsert = function(nums, target) {
    for (let i = 0; i < nums.length; i++) if (nums[i] >= target) return i;
    return nums.length;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search for the lower bound',
        idea: 'Search over positions `0..n` (n means "after the end"). If `nums[mid] < target` the answer is to the right of `mid`; otherwise `mid` itself could be the answer, so keep it in range.',
        steps: [
          'Set `lo = 0`, `hi = n`.',
          'While `lo < hi`: `mid = lo + (hi − lo) / 2`; if `nums[mid] < target`, `lo = mid + 1`, else `hi = mid`.',
          'Return `lo` (where `lo == hi`).',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'The half-open range `[lo, hi)` shrinks by half each step and always contains the answer, so the loop ends on it.',
        code: {
          java: r`class Solution {
    public int searchInsert(int[] nums, int target) {
        int lo = 0, hi = nums.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < target) lo = mid + 1; else hi = mid;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        return lower_bound(nums.begin(), nums.end(), target) - nums.begin();
    }
};`,
          python: r`class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid
        return lo`,
          javascript: r`var searchInsert = function(nums, target) {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
        const mid = lo + ((hi - lo) >> 1);
        if (nums[mid] < target) lo = mid + 1; else hi = mid;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'first-bad-version': {
    pattern: 'Binary search on a monotone yes/no predicate (first true)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every version from 1',
        idea: 'Call `isBadVersion(1)`, `isBadVersion(2)`, … and return the first version that is bad.',
        steps: [
          'For `v` from 1 to `n`, if `isBadVersion(v)` is true, return `v`.',
          '(A bad version is guaranteed, so the loop always returns.)',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Up to n API calls. With n near 2³¹ that is billions of calls.',
        timesOut: [4],
        code: {
          java: r`/* The isBadVersion API is defined in the parent class VersionControl:
      boolean isBadVersion(int version); */

class Solution extends VersionControl {
    public int firstBadVersion(int n) {
        for (int v = 1; v < n; v++) if (isBadVersion(v)) return v;
        return n;
    }
}`,
          cpp: r`// The API isBadVersion is defined for you.
// bool isBadVersion(int version);

class Solution {
public:
    int firstBadVersion(int n) {
        for (int v = 1; v < n; v++) if (isBadVersion(v)) return v;
        return n;
    }
};`,
          python: r`# The isBadVersion API is already defined for you.
# def isBadVersion(version: int) -> bool:

class Solution:
    def firstBadVersion(self, n: int) -> int:
        for v in range(1, n):
            if isBadVersion(v):
                return v
        return n`,
          javascript: r`var solution = function(isBadVersion) {
    return function(n) {
        for (let v = 1; v < n; v++) if (isBadVersion(v)) return v;
        return n;
    };
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search for the first bad version',
        idea: 'The versions look like good, good, …, good, bad, …, bad. If `mid` is bad, the first bad version is `mid` or earlier; if it is good, the first bad one is after `mid`.',
        steps: [
          'Set `lo = 1`, `hi = n`.',
          'While `lo < hi`: `mid = lo + (hi − lo) / 2`.',
          'If `isBadVersion(mid)`, set `hi = mid`; otherwise `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'About 31 calls for n up to 2³¹ − 1. Writing `(lo + hi) / 2` would overflow a 32-bit int here, which is the classic bug this problem tests.',
        code: {
          java: r`/* The isBadVersion API is defined in the parent class VersionControl:
      boolean isBadVersion(int version); */

class Solution extends VersionControl {
    public int firstBadVersion(int n) {
        int lo = 1, hi = n;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (isBadVersion(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
          cpp: r`// The API isBadVersion is defined for you.
// bool isBadVersion(int version);

class Solution {
public:
    int firstBadVersion(int n) {
        int lo = 1, hi = n;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (isBadVersion(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`# The isBadVersion API is already defined for you.
# def isBadVersion(version: int) -> bool:

class Solution:
    def firstBadVersion(self, n: int) -> int:
        lo, hi = 1, n
        while lo < hi:
            mid = (lo + hi) // 2
            if isBadVersion(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var solution = function(isBadVersion) {
    return function(n) {
        let lo = 1, hi = n;
        while (lo < hi) {
            const mid = lo + Math.floor((hi - lo) / 2);
            if (isBadVersion(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    };
};`,
        },
      },
    ],
  },

  'sqrtx': {
    pattern: 'Binary search on the answer (largest r with r² ≤ x)',
    approaches: [
      {
        level: 'Brute force', name: 'Count up while the square fits',
        idea: 'Try r = 1, 2, 3, … while `(r + 1)²` is still at most `x`.',
        steps: [
          'Set `r = 0`.',
          'While `(r + 1) × (r + 1) <= x` (computed in 64 bits), increase `r`.',
          'Return `r`.',
        ],
        time: 'O(√x)', space: 'O(1)',
        why: 'About √x steps — up to 46,341 for the largest input, which is acceptable but grows with x.',
        code: {
          java: r`class Solution {
    public int mySqrt(int x) {
        long r = 0;
        while ((r + 1) * (r + 1) <= x) r++;
        return (int) r;
    }
}`,
          cpp: r`class Solution {
public:
    int mySqrt(int x) {
        long long r = 0;
        while ((r + 1) * (r + 1) <= x) r++;
        return (int) r;
    }
};`,
          python: r`class Solution:
    def mySqrt(self, x: int) -> int:
        r = 0
        while (r + 1) * (r + 1) <= x:
            r += 1
        return r`,
          javascript: r`var mySqrt = function(x) {
    let r = 0;
    while ((r + 1) * (r + 1) <= x) r++;
    return r;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search on r',
        idea: 'Whether `r² <= x` is true for small r and false from some point on. Binary search for the last r where it is true.',
        steps: [
          'Set `lo = 0`, `hi = x` (for `x >= 1` the answer is at most x).',
          'While `lo < hi`: take the upper middle `mid = lo + (hi − lo + 1) / 2`.',
          'If `mid × mid <= x` (64-bit), set `lo = mid`; otherwise `hi = mid − 1`.',
          'Return `lo`.',
        ],
        time: 'O(log x)', space: 'O(1)',
        why: 'About 31 steps. The upper middle is needed because `lo = mid` would otherwise loop forever when `hi = lo + 1`.',
        code: {
          java: r`class Solution {
    public int mySqrt(int x) {
        long lo = 0, hi = x;
        while (lo < hi) {
            long mid = lo + (hi - lo + 1) / 2;
            if (mid * mid <= x) lo = mid; else hi = mid - 1;
        }
        return (int) lo;
    }
}`,
          cpp: r`class Solution {
public:
    int mySqrt(int x) {
        long long lo = 0, hi = x;
        while (lo < hi) {
            long long mid = lo + (hi - lo + 1) / 2;
            if (mid * mid <= x) lo = mid; else hi = mid - 1;
        }
        return (int) lo;
    }
};`,
          python: r`class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi = 0, x
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if mid * mid <= x:
                lo = mid
            else:
                hi = mid - 1
        return lo`,
          javascript: r`var mySqrt = function(x) {
    let lo = 0, hi = x;
    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo + 1) / 2);
        if (mid * mid <= x) lo = mid; else hi = mid - 1;
    }
    return lo;
};`,
        },
      },
      {
        level: 'Optimal', name: "Newton's method on integers",
        idea: 'Newton\'s iteration `r ← (r + x / r) / 2` converges to √x very fast. Starting from `r = x` and using integer division, the values decrease until `r² <= x`; that r is the floor of the square root.',
        steps: [
          'Set `r = x`.',
          'While `r × r > x` (64-bit), set `r = (r + x / r) / 2` with integer division.',
          'Return `r`.',
        ],
        time: 'O(log x)', space: 'O(1)',
        why: 'From a far-away start each step roughly halves r; near the root the number of correct digits doubles each step. In practice under 20 iterations for 32-bit x.',
        code: {
          java: r`class Solution {
    public int mySqrt(int x) {
        long r = x;
        while (r * r > x) r = (r + x / r) / 2;
        return (int) r;
    }
}`,
          cpp: r`class Solution {
public:
    int mySqrt(int x) {
        long long r = x;
        while (r * r > x) r = (r + x / r) / 2;
        return (int) r;
    }
};`,
          python: r`class Solution:
    def mySqrt(self, x: int) -> int:
        r = x
        while r * r > x:
            r = (r + x // r) // 2
        return r`,
          javascript: r`var mySqrt = function(x) {
    let r = x;
    while (r * r > x) r = Math.floor((r + Math.floor(x / r)) / 2);
    return r;
};`,
        },
      },
    ],
  },

  'find-first-and-last-position-of-element-in-sorted-array': {
    pattern: 'Two binary searches: lower bound (first ≥ target) and upper bound (first > target)',
    approaches: [
      {
        level: 'Brute force', name: 'Linear scan',
        idea: 'Walk the array and record the first and last index where `target` appears.',
        steps: [
          'Set `first = last = −1`.',
          'For each `i` with `nums[i] == target`: if `first == −1`, set `first = i`; always set `last = i`.',
          'Return `[first, last]`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One full pass; the problem requires O(log n).',
        code: {
          java: r`class Solution {
    public int[] searchRange(int[] nums, int target) {
        int first = -1, last = -1;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != target) continue;
            if (first == -1) first = i;
            last = i;
        }
        return new int[] { first, last };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int first = -1, last = -1;
        for (int i = 0; i < (int) nums.size(); i++) {
            if (nums[i] != target) continue;
            if (first == -1) first = i;
            last = i;
        }
        return {first, last};
    }
};`,
          python: r`class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        first = last = -1
        for i, x in enumerate(nums):
            if x == target:
                if first == -1:
                    first = i
                last = i
        return [first, last]`,
          javascript: r`var searchRange = function(nums, target) {
    return [nums.indexOf(target), nums.lastIndexOf(target)];
};`,
        },
      },
      {
        level: 'Better', name: 'Binary search once, then expand',
        idea: 'Find any position of `target` with binary search, then walk left and right while the neighbours are still `target`.',
        steps: [
          'Binary search for any index `p` with `nums[p] == target`; if none, return `[−1, −1]`.',
          'Move `l` left from `p` while `nums[l − 1] == target`, and `r` right while `nums[r + 1] == target`.',
          'Return `[l, r]`.',
        ],
        time: 'O(log n + k)', space: 'O(1)',
        why: 'k is the number of copies of `target`. If the whole array is `target`, k = n and this degrades to O(n).',
        code: {
          java: r`class Solution {
    public int[] searchRange(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1, p = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) { p = mid; break; }
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        if (p == -1) return new int[] { -1, -1 };
        int l = p, r = p;
        while (l > 0 && nums[l - 1] == target) l--;
        while (r + 1 < nums.length && nums[r + 1] == target) r++;
        return new int[] { l, r };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int lo = 0, hi = (int) nums.size() - 1, p = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) { p = mid; break; }
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        if (p == -1) return {-1, -1};
        int l = p, r = p;
        while (l > 0 && nums[l - 1] == target) l--;
        while (r + 1 < (int) nums.size() && nums[r + 1] == target) r++;
        return {l, r};
    }
};`,
          python: r`class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        lo, hi, p = 0, len(nums) - 1, -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                p = mid
                break
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        if p == -1:
            return [-1, -1]
        l = r = p
        while l > 0 and nums[l - 1] == target:
            l -= 1
        while r + 1 < len(nums) and nums[r + 1] == target:
            r += 1
        return [l, r]`,
          javascript: r`var searchRange = function(nums, target) {
    let lo = 0, hi = nums.length - 1, p = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) { p = mid; break; }
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    if (p === -1) return [-1, -1];
    let l = p, r = p;
    while (l > 0 && nums[l - 1] === target) l--;
    while (r + 1 < nums.length && nums[r + 1] === target) r++;
    return [l, r];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Lower bound and upper bound',
        idea: 'The first occurrence is the first index with value `>= target`; one past the last occurrence is the first index with value `> target`. Both are plain binary searches.',
        steps: [
          'Write `firstAtLeast(v)`: the smallest index with `nums[i] >= v` (or n).',
          '`start = firstAtLeast(target)`. If `start == n` or `nums[start] != target`, return `[−1, −1]`.',
          '`end = firstAtLeast(target + 1) − 1` (values are integers, so "> target" is "≥ target + 1").',
          'Return `[start, end]`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'Two binary searches regardless of how many copies there are. `target + 1` fits: targets are at most 10⁹.',
        code: {
          java: r`class Solution {
    public int[] searchRange(int[] nums, int target) {
        int start = firstAtLeast(nums, target);
        if (start == nums.length || nums[start] != target) return new int[] { -1, -1 };
        return new int[] { start, firstAtLeast(nums, target + 1) - 1 };
    }

    private int firstAtLeast(int[] nums, int v) {
        int lo = 0, hi = nums.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < v) lo = mid + 1; else hi = mid;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        auto lo = lower_bound(nums.begin(), nums.end(), target);
        if (lo == nums.end() || *lo != target) return {-1, -1};
        auto hi = upper_bound(nums.begin(), nums.end(), target);
        return {(int) (lo - nums.begin()), (int) (hi - nums.begin()) - 1};
    }
};`,
          python: r`class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        start = bisect_left(nums, target)
        if start == len(nums) or nums[start] != target:
            return [-1, -1]
        return [start, bisect_right(nums, target) - 1]`,
          javascript: r`var searchRange = function(nums, target) {
    const firstAtLeast = (v) => {
        let lo = 0, hi = nums.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (nums[mid] < v) lo = mid + 1; else hi = mid;
        }
        return lo;
    };
    const start = firstAtLeast(target);
    if (start === nums.length || nums[start] !== target) return [-1, -1];
    return [start, firstAtLeast(target + 1) - 1];
};`,
        },
      },
    ],
  },

  'search-a-2d-matrix': {
    pattern: 'Binary search over a matrix read as one sorted array (index → row, column)',
    approaches: [
      {
        level: 'Brute force', name: 'Check every cell',
        idea: 'Scan all m × n cells for `target`.',
        steps: [
          'For each row and each column, if the cell equals `target`, return true.',
          'Return false after the scan.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Every cell may be checked; the sorted order is ignored.',
        code: {
          java: r`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        for (int[] row : matrix)
            for (int v : row) if (v == target) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for (auto& row : matrix)
            for (int v : row) if (v == target) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        return any(target in row for row in matrix)`,
          javascript: r`var searchMatrix = function(matrix, target) {
    return matrix.some((row) => row.includes(target));
};`,
        },
      },
      {
        level: 'Better', name: 'Staircase walk from the top-right corner',
        idea: 'At the top-right cell, everything to the left is smaller and everything below is larger. If the cell is too big, drop its column; if too small, drop its row.',
        steps: [
          'Start at row 0, column n − 1.',
          'If the cell equals `target`, return true.',
          'If it is greater than `target`, move left; otherwise move down.',
          'Return false when you leave the matrix.',
        ],
        time: 'O(m + n)', space: 'O(1)',
        why: 'Each step removes a row or a column. This works even when only rows and columns are sorted separately; here the stronger ordering allows O(log(m·n)).',
        code: {
          java: r`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = 0, c = matrix[0].length - 1;
        while (r < matrix.length && c >= 0) {
            if (matrix[r][c] == target) return true;
            if (matrix[r][c] > target) c--; else r++;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int r = 0, c = (int) matrix[0].size() - 1;
        while (r < (int) matrix.size() && c >= 0) {
            if (matrix[r][c] == target) return true;
            if (matrix[r][c] > target) c--; else r++;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        r, c = 0, len(matrix[0]) - 1
        while r < len(matrix) and c >= 0:
            if matrix[r][c] == target:
                return True
            if matrix[r][c] > target:
                c -= 1
            else:
                r += 1
        return False`,
          javascript: r`var searchMatrix = function(matrix, target) {
    let r = 0, c = matrix[0].length - 1;
    while (r < matrix.length && c >= 0) {
        if (matrix[r][c] === target) return true;
        if (matrix[r][c] > target) c--; else r++;
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One binary search over m·n positions',
        idea: 'Because each row starts after the previous row ends, reading the rows one after another gives one sorted array of length m·n. Position `k` of it is cell `(k / n, k % n)`.',
        steps: [
          'Set `lo = 0`, `hi = m·n − 1`.',
          'While `lo <= hi`: `mid` is the middle; its value is `matrix[mid / n][mid % n]`.',
          'Return true on a match; otherwise move `lo` or `hi` past `mid` as in normal binary search.',
          'Return false.',
        ],
        time: 'O(log(m·n))', space: 'O(1)',
        why: 'A single binary search over m·n positions, with O(1) index arithmetic per step.',
        code: {
          java: r`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length, lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2, v = matrix[mid / n][mid % n];
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size(), lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2, v = matrix[mid / n][mid % n];
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            v = matrix[mid // n][mid % n]
            if v == target:
                return True
            if v < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False`,
          javascript: r`var searchMatrix = function(matrix, target) {
    const m = matrix.length, n = matrix[0].length;
    let lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1, v = matrix[Math.floor(mid / n)][mid % n];
        if (v === target) return true;
        if (v < target) lo = mid + 1; else hi = mid - 1;
    }
    return false;
};`,
        },
      },
    ],
  },

  'find-minimum-in-rotated-sorted-array': {
    pattern: 'Binary search comparing the middle with the right end (which half holds the drop)',
    approaches: [
      {
        level: 'Brute force', name: 'Scan for the smallest value',
        idea: 'Look at every value and keep the smallest. (Equivalently, find the one place where a value is smaller than the one before it.)',
        steps: [
          'Set `best = nums[0]`.',
          'For each value, update `best` if it is smaller.',
          'Return `best`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One full pass; the problem asks for O(log n).',
        code: {
          java: r`class Solution {
    public int findMin(int[] nums) {
        int best = nums[0];
        for (int x : nums) best = Math.min(best, x);
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int findMin(vector<int>& nums) {
        return *min_element(nums.begin(), nums.end());
    }
};`,
          python: r`class Solution:
    def findMin(self, nums: List[int]) -> int:
        return min(nums)`,
          javascript: r`var findMin = function(nums) {
    return Math.min(...nums);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search against the last element',
        idea: 'If `nums[mid] > nums[hi]`, the drop (and the minimum) lies to the right of `mid`. Otherwise the part from `mid` to `hi` is sorted, so the minimum is at `mid` or to its left.',
        steps: [
          'Set `lo = 0`, `hi = n − 1`.',
          'While `lo < hi`: `mid = lo + (hi − lo) / 2`.',
          'If `nums[mid] > nums[hi]`, set `lo = mid + 1`; else set `hi = mid`.',
          'Return `nums[lo]`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'The range halves every step. Comparing with `nums[hi]` (not `nums[lo]`) also handles an array that is not rotated at all. Distinct values make the comparison decisive.',
        code: {
          java: r`class Solution {
    public int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        return nums[lo];
    }
}`,
          cpp: r`class Solution {
public:
    int findMin(vector<int>& nums) {
        int lo = 0, hi = (int) nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        return nums[lo];
    }
};`,
          python: r`class Solution:
    def findMin(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1
            else:
                hi = mid
        return nums[lo]`,
          javascript: r`var findMin = function(nums) {
    let lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
    }
    return nums[lo];
};`,
        },
      },
    ],
  },

  'search-in-rotated-sorted-array': {
    pattern: 'Modified binary search: one half around mid is always sorted',
    approaches: [
      {
        level: 'Brute force', name: 'Linear scan',
        idea: 'Check every index for `target`.',
        steps: [
          'For each `i`, if `nums[i] == target`, return `i`.',
          'Return −1.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'It may look at every element; the problem asks for O(log n).',
        code: {
          java: r`class Solution {
    public int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) if (nums[i] == target) return i;
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int search(vector<int>& nums, int target) {
        for (int i = 0; i < (int) nums.size(); i++) if (nums[i] == target) return i;
        return -1;
    }
};`,
          python: r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        return nums.index(target) if target in nums else -1`,
          javascript: r`var search = function(nums, target) {
    return nums.indexOf(target);
};`,
        },
      },
      {
        level: 'Better', name: 'Find the rotation point, then binary search one run',
        idea: 'First find the index of the minimum (the start of the second sorted run) with binary search. Then `target` can only be in one of the two sorted runs; binary search that one.',
        steps: [
          'Find `p`, the index of the minimum, as in "Find Minimum in Rotated Sorted Array".',
          'If `target` is between `nums[p]` and `nums[n − 1]`, search `[p, n − 1]`; otherwise search `[0, p − 1]`.',
          'Run an ordinary binary search on that range.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'Two binary searches. Same complexity as the one-pass version, just a little more code.',
        code: {
          java: r`class Solution {
    public int search(int[] nums, int target) {
        int n = nums.length, lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        int p = lo;
        if (target >= nums[p] && target <= nums[n - 1]) { lo = p; hi = n - 1; }
        else { lo = 0; hi = p - 1; }
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size(), lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
        }
        int p = lo;
        if (target >= nums[p] && target <= nums[n - 1]) { lo = p; hi = n - 1; }
        else { lo = 0; hi = p - 1; }
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        n = len(nums)
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1
            else:
                hi = mid
        p = lo
        lo, hi = (p, n - 1) if nums[p] <= target <= nums[n - 1] else (0, p - 1)
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1`,
          javascript: r`var search = function(nums, target) {
    const n = nums.length;
    let lo = 0, hi = n - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] > nums[hi]) lo = mid + 1; else hi = mid;
    }
    const p = lo;
    if (target >= nums[p] && target <= nums[n - 1]) { lo = p; hi = n - 1; }
    else { lo = 0; hi = p - 1; }
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One binary search, deciding which half is sorted',
        idea: 'Around any `mid`, at least one of the halves `[lo, mid]` and `[mid, hi]` is sorted. Check whether `target` lies within the sorted half\'s range; if so search there, otherwise search the other half.',
        steps: [
          'While `lo <= hi`: compute `mid`; if `nums[mid] == target`, return `mid`.',
          'If `nums[lo] <= nums[mid]` (left half sorted): if `nums[lo] <= target < nums[mid]`, set `hi = mid − 1`, else `lo = mid + 1`.',
          'Otherwise (right half sorted): if `nums[mid] < target <= nums[hi]`, set `lo = mid + 1`, else `hi = mid − 1`.',
          'Return −1.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'Each step discards half of the range, as in plain binary search. The `<=` in `nums[lo] <= nums[mid]` matters when `lo == mid`.',
        code: {
          java: r`class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
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
          cpp: r`class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int) nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1`,
          javascript: r`var search = function(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
        }
    }
    return -1;
};`,
        },
      },
    ],
  },

  'find-peak-element': {
    pattern: 'Binary search on the slope (always climb towards the higher neighbour)',
    approaches: [
      {
        level: 'Brute force', name: 'Find the first downward step',
        idea: 'Walking from the left, the values rise until the first time they fall; the element just before that fall is a peak. If they never fall, the last element is a peak.',
        steps: [
          'For each `i` from 0 to n − 2: if `nums[i] > nums[i + 1]`, return `i`.',
          'Return `n − 1`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass. It is correct because everything before the first fall was rising, so `nums[i] > nums[i − 1]` too.',
        code: {
          java: r`class Solution {
    public int findPeakElement(int[] nums) {
        for (int i = 0; i + 1 < nums.length; i++) if (nums[i] > nums[i + 1]) return i;
        return nums.length - 1;
    }
}`,
          cpp: r`class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        for (int i = 0; i + 1 < (int) nums.size(); i++) if (nums[i] > nums[i + 1]) return i;
        return nums.size() - 1;
    }
};`,
          python: r`class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        for i in range(len(nums) - 1):
            if nums[i] > nums[i + 1]:
                return i
        return len(nums) - 1`,
          javascript: r`var findPeakElement = function(nums) {
    for (let i = 0; i + 1 < nums.length; i++) if (nums[i] > nums[i + 1]) return i;
    return nums.length - 1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search towards the rising side',
        idea: 'If `nums[mid] < nums[mid + 1]`, the values climb to the right, and since the edge counts as −∞ there must be a peak to the right. Otherwise `mid` is on a downhill (or is a peak), so a peak exists at `mid` or to its left.',
        steps: [
          'Set `lo = 0`, `hi = n − 1`.',
          'While `lo < hi`: `mid = lo + (hi − lo) / 2`.',
          'If `nums[mid] < nums[mid + 1]`, set `lo = mid + 1`; else set `hi = mid`.',
          'Return `lo`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'The range halves every step and always contains a peak. `mid + 1` is safe because `mid < hi` inside the loop.',
        code: {
          java: r`class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) lo = mid + 1; else hi = mid;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int lo = 0, hi = (int) nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) lo = mid + 1; else hi = mid;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1
            else:
                hi = mid
        return lo`,
          javascript: r`var findPeakElement = function(nums) {
    let lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1; else hi = mid;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'median-of-two-sorted-arrays': {
    pattern: 'Binary search on the partition of the shorter array',
    approaches: [
      {
        level: 'Brute force', name: 'Concatenate and sort',
        idea: 'Put all values in one array, sort it, and read the middle.',
        steps: [
          'Copy both arrays into one array of length m + n and sort it.',
          'If the length is odd, return the middle value; otherwise the average of the two middle values.',
        ],
        time: 'O((m + n) log(m + n))', space: 'O(m + n)',
        why: 'The sort dominates and ignores that both inputs are already sorted.',
        code: {
          java: r`class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] all = new int[nums1.length + nums2.length];
        System.arraycopy(nums1, 0, all, 0, nums1.length);
        System.arraycopy(nums2, 0, all, nums1.length, nums2.length);
        Arrays.sort(all);
        int t = all.length;
        return t % 2 == 1 ? all[t / 2] : (all[t / 2 - 1] + all[t / 2]) / 2.0;
    }
}`,
          cpp: r`class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> all(nums1);
        all.insert(all.end(), nums2.begin(), nums2.end());
        sort(all.begin(), all.end());
        int t = all.size();
        return t % 2 ? all[t / 2] : (all[t / 2 - 1] + all[t / 2]) / 2.0;
    }
};`,
          python: r`class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        a = sorted(nums1 + nums2)
        t = len(a)
        return float(a[t // 2]) if t % 2 else (a[t // 2 - 1] + a[t // 2]) / 2`,
          javascript: r`var findMedianSortedArrays = function(nums1, nums2) {
    const a = nums1.concat(nums2).sort((x, y) => x - y), t = a.length;
    return t % 2 ? a[t >> 1] : (a[t / 2 - 1] + a[t / 2]) / 2;
};`,
        },
      },
      {
        level: 'Better', name: 'Merge walk up to the middle',
        idea: 'Like the merge step of merge sort, take the smaller front value of the two arrays each time — but stop once the middle position is reached, remembering the last two values taken.',
        steps: [
          'Let `t = m + n`. Walk `i` over `nums1` and `j` over `nums2`, each step taking the smaller front value (or the only one left).',
          'Track the previous and current values taken; stop after taking `t / 2 + 1` values.',
          'Return the current value if `t` is odd, else the average of previous and current.',
        ],
        time: 'O(m + n)', space: 'O(1)',
        why: 'About (m + n)/2 steps and two remembered values; no merged array is built.',
        code: {
          java: r`class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length, t = m + n, i = 0, j = 0, prev = 0, cur = 0;
        for (int k = 0; k <= t / 2; k++) {
            prev = cur;
            if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
            else cur = nums2[j++];
        }
        return t % 2 == 1 ? cur : (prev + cur) / 2.0;
    }
}`,
          cpp: r`class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        int m = nums1.size(), n = nums2.size(), t = m + n, i = 0, j = 0, prev = 0, cur = 0;
        for (int k = 0; k <= t / 2; k++) {
            prev = cur;
            if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
            else cur = nums2[j++];
        }
        return t % 2 ? cur : (prev + cur) / 2.0;
    }
};`,
          python: r`class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        m, n = len(nums1), len(nums2)
        t, i, j, prev, cur = m + n, 0, 0, 0, 0
        for _ in range(t // 2 + 1):
            prev = cur
            if j >= n or (i < m and nums1[i] <= nums2[j]):
                cur = nums1[i]
                i += 1
            else:
                cur = nums2[j]
                j += 1
        return float(cur) if t % 2 else (prev + cur) / 2`,
          javascript: r`var findMedianSortedArrays = function(nums1, nums2) {
    const m = nums1.length, n = nums2.length, t = m + n;
    let i = 0, j = 0, prev = 0, cur = 0;
    for (let k = 0; k <= t >> 1; k++) {
        prev = cur;
        if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
        else cur = nums2[j++];
    }
    return t % 2 ? cur : (prev + cur) / 2;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the cut in the shorter array',
        idea: 'Cut both arrays so the left parts together hold `half = (m + n + 1) / 2` values. Taking `i` from the shorter array fixes `j = half − i` from the other. The cut is right when every left value is ≤ every right value: `A[i − 1] <= B[j]` and `B[j − 1] <= A[i]`. Binary search `i`.',
        steps: [
          'Make `A` the shorter array (length m). Search `i` in `[0, m]`, with `j = half − i`.',
          'Read the four border values, using −∞/+∞ when a side is empty.',
          'If `Aleft > Bright`, move `i` left (`hi = i − 1`); if `Bleft > Aright`, move `i` right (`lo = i + 1`).',
          'Otherwise the cut is correct: the median is `max(Aleft, Bleft)` for an odd total, or the average of that and `min(Aright, Bright)` for an even total.',
        ],
        time: 'O(log min(m, n))', space: 'O(1)',
        why: 'The binary search runs over the m + 1 possible cuts of the shorter array; each step is O(1). Searching the shorter array also guarantees `j` stays within `[0, n]`.',
        code: {
          java: r`class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.length, n = nums2.length, half = (m + n + 1) / 2, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aLeft = i > 0 ? nums1[i - 1] : Integer.MIN_VALUE, aRight = i < m ? nums1[i] : Integer.MAX_VALUE;
            int bLeft = j > 0 ? nums2[j - 1] : Integer.MIN_VALUE, bRight = j < n ? nums2[j] : Integer.MAX_VALUE;
            if (aLeft > bRight) hi = i - 1;
            else if (bLeft > aRight) lo = i + 1;
            else {
                int leftMax = Math.max(aLeft, bLeft);
                if ((m + n) % 2 == 1) return leftMax;
                return (leftMax + (double) Math.min(aRight, bRight)) / 2.0;
            }
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size(), half = (m + n + 1) / 2, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int aLeft = i > 0 ? nums1[i - 1] : INT_MIN, aRight = i < m ? nums1[i] : INT_MAX;
            int bLeft = j > 0 ? nums2[j - 1] : INT_MIN, bRight = j < n ? nums2[j] : INT_MAX;
            if (aLeft > bRight) hi = i - 1;
            else if (bLeft > aRight) lo = i + 1;
            else {
                int leftMax = max(aLeft, bLeft);
                if ((m + n) % 2) return leftMax;
                return (leftMax + (double) min(aRight, bRight)) / 2.0;
            }
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        A, B = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
        m, n = len(A), len(B)
        half, lo, hi = (m + n + 1) // 2, 0, m
        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i
            a_left = A[i - 1] if i > 0 else -inf
            a_right = A[i] if i < m else inf
            b_left = B[j - 1] if j > 0 else -inf
            b_right = B[j] if j < n else inf
            if a_left > b_right:
                hi = i - 1
            elif b_left > a_right:
                lo = i + 1
            else:
                left_max = max(a_left, b_left)
                if (m + n) % 2:
                    return float(left_max)
                return (left_max + min(a_right, b_right)) / 2
        return 0.0`,
          javascript: r`var findMedianSortedArrays = function(nums1, nums2) {
    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
    const m = nums1.length, n = nums2.length, half = (m + n + 1) >> 1;
    let lo = 0, hi = m;
    while (lo <= hi) {
        const i = (lo + hi) >> 1, j = half - i;
        const aLeft = i > 0 ? nums1[i - 1] : -Infinity, aRight = i < m ? nums1[i] : Infinity;
        const bLeft = j > 0 ? nums2[j - 1] : -Infinity, bRight = j < n ? nums2[j] : Infinity;
        if (aLeft > bRight) hi = i - 1;
        else if (bLeft > aRight) lo = i + 1;
        else {
            const leftMax = Math.max(aLeft, bLeft);
            if ((m + n) % 2) return leftMax;
            return (leftMax + Math.min(aRight, bRight)) / 2;
        }
    }
    return 0;
};`,
        },
      },
    ],
  },
};
