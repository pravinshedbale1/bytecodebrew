const r = String.raw;

export default {
  'find-all-numbers-disappeared-in-an-array': {
    pattern: 'Cyclic sort: value v belongs at index v − 1 (or mark index v − 1 as seen)',
    approaches: [
      {
        level: 'Brute force', name: 'Scan for each number 1..n',
        idea: 'For every k from 1 to n, scan the whole array for k; if it is not there, k is missing.',
        steps: [
          'For `k` from 1 to n: scan `nums` for `k`.',
          'If no element equals `k`, add `k` to the answer.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n candidates, each needing a full O(n) scan. With n = 10⁵ that is 10¹⁰ comparisons, far too slow.',
        code: {
          java: r`class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        List<Integer> missing = new ArrayList<>();
        for (int k = 1; k <= nums.length; k++) {
            boolean found = false;
            for (int x : nums) if (x == k) { found = true; break; }
            if (!found) missing.add(k);
        }
        return missing;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        vector<int> missing;
        int n = nums.size();
        for (int k = 1; k <= n; k++)
            if (find(nums.begin(), nums.end(), k) == nums.end()) missing.push_back(k);
        return missing;
    }
};`,
          python: r`class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        return [k for k in range(1, len(nums) + 1) if k not in nums]`,
          javascript: r`var findDisappearedNumbers = function(nums) {
    const missing = [];
    for (let k = 1; k <= nums.length; k++) if (!nums.includes(k)) missing.push(k);
    return missing;
};`,
        },
      },
      {
        level: 'Better', name: 'Seen array',
        idea: 'Mark every value in a boolean array of size n + 1, then collect the unmarked numbers.',
        steps: [
          'Create `seen` of size n + 1 and set `seen[x] = true` for every `x` in `nums`.',
          'Return every `k` from 1 to n with `seen[k]` false.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes. The seen array is the O(n) extra space the follow-up asks you to avoid; it is still the right first answer to give in an interview.',
        code: {
          java: r`class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        boolean[] seen = new boolean[nums.length + 1];
        for (int x : nums) seen[x] = true;
        List<Integer> missing = new ArrayList<>();
        for (int k = 1; k <= nums.length; k++) if (!seen[k]) missing.add(k);
        return missing;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        int n = nums.size();
        vector<bool> seen(n + 1, false);
        for (int x : nums) seen[x] = true;
        vector<int> missing;
        for (int k = 1; k <= n; k++) if (!seen[k]) missing.push_back(k);
        return missing;
    }
};`,
          python: r`class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        seen = set(nums)
        return [k for k in range(1, len(nums) + 1) if k not in seen]`,
          javascript: r`var findDisappearedNumbers = function(nums) {
    const seen = new Array(nums.length + 1).fill(false);
    for (const x of nums) seen[x] = true;
    const missing = [];
    for (let k = 1; k <= nums.length; k++) if (!seen[k]) missing.push(k);
    return missing;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cyclic sort, then read the wrong slots',
        idea: 'Value v has a home at index v − 1. Swap every value into its home; afterwards, each index i that does not hold i + 1 is a number nobody came home to.',
        steps: [
          'Set `i = 0`. While `i < n`: let `home = nums[i] − 1`. If `nums[i] != nums[home]`, swap them (and stay at `i`); otherwise `i++`.',
          'Scan: for every `i` with `nums[i] != i + 1`, add `i + 1` to the answer.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each swap puts one value in its home for good, so there are at most n − 1 swaps plus n increments. Comparing `nums[i]` with `nums[home]` (not with `i + 1`) is what stops an endless loop when the home already holds a duplicate. In Python, compute `home` first: `nums[i], nums[nums[i] - 1] = …` assigns `nums[i]` before evaluating the second index.',
        code: {
          java: r`class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) {
                int t = nums[i]; nums[i] = nums[home]; nums[home] = t;
            } else i++;
        }
        List<Integer> missing = new ArrayList<>();
        for (i = 0; i < nums.length; i++) if (nums[i] != i + 1) missing.add(i + 1);
        return missing;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) swap(nums[i], nums[home]);
            else i++;
        }
        vector<int> missing;
        for (i = 0; i < n; i++) if (nums[i] != i + 1) missing.push_back(i + 1);
        return missing;
    }
};`,
          python: r`class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        i = 0
        while i < len(nums):
            home = nums[i] - 1
            if nums[i] != nums[home]:
                nums[i], nums[home] = nums[home], nums[i]
            else:
                i += 1
        return [i + 1 for i in range(len(nums)) if nums[i] != i + 1]`,
          javascript: r`var findDisappearedNumbers = function(nums) {
    let i = 0;
    while (i < nums.length) {
        const home = nums[i] - 1;
        if (nums[i] !== nums[home]) [nums[i], nums[home]] = [nums[home], nums[i]];
        else i++;
    }
    const missing = [];
    for (let k = 0; k < nums.length; k++) if (nums[k] !== k + 1) missing.push(k + 1);
    return missing;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sign marking',
        idea: 'Use the sign of nums[v − 1] as the "seen" flag for v: make it negative. Numbers whose slot stays positive were never seen.',
        steps: [
          'For each value `v` (use `|v|`, it may already be negated): if `nums[|v| − 1] > 0`, negate it.',
          'Every index `i` whose value is still positive means `i + 1` is missing.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes and no extra memory. Unlike cyclic sort, nothing moves, so flipping the signs back afterwards restores the input exactly. It relies on every value being at least 1.',
        code: {
          java: r`class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        for (int v : nums) {
            int home = Math.abs(v) - 1;
            if (nums[home] > 0) nums[home] = -nums[home];
        }
        List<Integer> missing = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) if (nums[i] > 0) missing.add(i + 1);
        return missing;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        for (int v : nums) {
            int home = abs(v) - 1;
            if (nums[home] > 0) nums[home] = -nums[home];
        }
        vector<int> missing;
        for (int i = 0; i < (int) nums.size(); i++) if (nums[i] > 0) missing.push_back(i + 1);
        return missing;
    }
};`,
          python: r`class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        for v in nums:
            home = abs(v) - 1
            if nums[home] > 0:
                nums[home] = -nums[home]
        return [i + 1 for i, x in enumerate(nums) if x > 0]`,
          javascript: r`var findDisappearedNumbers = function(nums) {
    for (const v of nums) {
        const home = Math.abs(v) - 1;
        if (nums[home] > 0) nums[home] = -nums[home];
    }
    const missing = [];
    for (let i = 0; i < nums.length; i++) if (nums[i] > 0) missing.push(i + 1);
    return missing;
};`,
        },
      },
    ],
  },

  'set-mismatch': {
    pattern: 'Cyclic sort: the one wrong slot holds the duplicate, and its index gives the missing number',
    approaches: [
      {
        level: 'Brute force', name: 'Count each number with a scan',
        idea: 'For every v from 1 to n, count how many times it appears: twice means repeated, zero means missing.',
        steps: [
          'For `v` from 1 to n, count the elements equal to `v`.',
          'A count of 2 gives the repeated value; a count of 0 gives the missing one.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n values, each counted with a full scan.',
        code: {
          java: r`class Solution {
    public int[] findErrorNums(int[] nums) {
        int dup = 0, missing = 0;
        for (int v = 1; v <= nums.length; v++) {
            int count = 0;
            for (int x : nums) if (x == v) count++;
            if (count == 2) dup = v;
            if (count == 0) missing = v;
        }
        return new int[] { dup, missing };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findErrorNums(vector<int>& nums) {
        int n = nums.size(), dup = 0, missing = 0;
        for (int v = 1; v <= n; v++) {
            int c = count(nums.begin(), nums.end(), v);
            if (c == 2) dup = v;
            if (c == 0) missing = v;
        }
        return {dup, missing};
    }
};`,
          python: r`class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        dup = missing = 0
        for v in range(1, len(nums) + 1):
            c = nums.count(v)
            if c == 2:
                dup = v
            elif c == 0:
                missing = v
        return [dup, missing]`,
          javascript: r`var findErrorNums = function(nums) {
    let dup = 0, missing = 0;
    for (let v = 1; v <= nums.length; v++) {
        let c = 0;
        for (const x of nums) if (x === v) c++;
        if (c === 2) dup = v;
        if (c === 0) missing = v;
    }
    return [dup, missing];
};`,
        },
      },
      {
        level: 'Better', name: 'Count array',
        idea: 'Count every value in an array of size n + 1 in one pass, then read off the 2 and the 0.',
        steps: [
          'Fill `count[x]++` for every `x`.',
          'For `v` from 1 to n: `count[v] == 2` is the repeated value, `count[v] == 0` the missing one.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear and simple, at the cost of an O(n) count array.',
        code: {
          java: r`class Solution {
    public int[] findErrorNums(int[] nums) {
        int n = nums.length;
        int[] count = new int[n + 1];
        for (int x : nums) count[x]++;
        int dup = 0, missing = 0;
        for (int v = 1; v <= n; v++) {
            if (count[v] == 2) dup = v;
            if (count[v] == 0) missing = v;
        }
        return new int[] { dup, missing };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findErrorNums(vector<int>& nums) {
        int n = nums.size(), dup = 0, missing = 0;
        vector<int> count(n + 1, 0);
        for (int x : nums) count[x]++;
        for (int v = 1; v <= n; v++) {
            if (count[v] == 2) dup = v;
            if (count[v] == 0) missing = v;
        }
        return {dup, missing};
    }
};`,
          python: r`class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        n = len(nums)
        count = [0] * (n + 1)
        for x in nums:
            count[x] += 1
        return [count.index(2), count.index(0, 1)]`,
          javascript: r`var findErrorNums = function(nums) {
    const n = nums.length, count = new Array(n + 1).fill(0);
    for (const x of nums) count[x]++;
    let dup = 0, missing = 0;
    for (let v = 1; v <= n; v++) {
        if (count[v] === 2) dup = v;
        if (count[v] === 0) missing = v;
    }
    return [dup, missing];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cyclic sort, then find the wrong slot',
        idea: 'Swap every value v into index v − 1. Exactly one index ends up wrong: the value sitting there is the duplicate and the index tells you the missing number.',
        steps: [
          'Cyclic sort: while `i < n`, if `nums[i] != nums[nums[i] − 1]` swap `nums[i]` into its home, otherwise `i++`.',
          'Find the `i` with `nums[i] != i + 1` and return `[nums[i], i + 1]`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'At most n − 1 swaps plus n increments. All present values reach their homes, so the missing number\'s home is the only slot left with a wrong value, and the only value that could not go home is the spare copy.',
        code: {
          java: r`class Solution {
    public int[] findErrorNums(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) {
                int t = nums[i]; nums[i] = nums[home]; nums[home] = t;
            } else i++;
        }
        for (i = 0; i < nums.length; i++)
            if (nums[i] != i + 1) return new int[] { nums[i], i + 1 };
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findErrorNums(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) swap(nums[i], nums[home]);
            else i++;
        }
        for (i = 0; i < n; i++)
            if (nums[i] != i + 1) return {nums[i], i + 1};
        return {};
    }
};`,
          python: r`class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        i = 0
        while i < len(nums):
            home = nums[i] - 1
            if nums[i] != nums[home]:
                nums[i], nums[home] = nums[home], nums[i]
            else:
                i += 1
        for i, x in enumerate(nums):
            if x != i + 1:
                return [x, i + 1]
        return []`,
          javascript: r`var findErrorNums = function(nums) {
    let i = 0;
    while (i < nums.length) {
        const home = nums[i] - 1;
        if (nums[i] !== nums[home]) [nums[i], nums[home]] = [nums[home], nums[i]];
        else i++;
    }
    for (i = 0; i < nums.length; i++)
        if (nums[i] !== i + 1) return [nums[i], i + 1];
    return [];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two equations from sums',
        idea: 'Compared with 1..n, the array\'s sum is off by dup − missing and its sum of squares by dup² − missing² = (dup − missing)(dup + missing). Divide to get dup + missing, then solve.',
        steps: [
          '`diff` = sum of `nums` − n(n + 1)/2 = dup − missing.',
          '`squares` = sum of squares − n(n + 1)(2n + 1)/6 = dup² − missing².',
          '`total = squares / diff` = dup + missing; then dup = (total + diff)/2 and missing = (total − diff)/2.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass and the input is left untouched. `diff` is never 0 because the duplicate differs from the missing number. Sums of squares reach about 3·10¹¹ for n = 10⁴, so use 64-bit integers in Java and C++.',
        code: {
          java: r`class Solution {
    public int[] findErrorNums(int[] nums) {
        long n = nums.length;
        long diff = -n * (n + 1) / 2, squares = -n * (n + 1) * (2 * n + 1) / 6;
        for (int x : nums) { diff += x; squares += (long) x * x; }
        long total = squares / diff;
        return new int[] { (int) ((total + diff) / 2), (int) ((total - diff) / 2) };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findErrorNums(vector<int>& nums) {
        long long n = nums.size();
        long long diff = -n * (n + 1) / 2, squares = -n * (n + 1) * (2 * n + 1) / 6;
        for (int x : nums) { diff += x; squares += 1LL * x * x; }
        long long total = squares / diff;
        return {(int) ((total + diff) / 2), (int) ((total - diff) / 2)};
    }
};`,
          python: r`class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        n = len(nums)
        diff = sum(nums) - n * (n + 1) // 2
        squares = sum(x * x for x in nums) - n * (n + 1) * (2 * n + 1) // 6
        total = squares // diff
        return [(total + diff) // 2, (total - diff) // 2]`,
          javascript: r`var findErrorNums = function(nums) {
    const n = nums.length;
    let diff = -n * (n + 1) / 2, squares = -n * (n + 1) * (2 * n + 1) / 6;
    for (const x of nums) { diff += x; squares += x * x; }
    const total = squares / diff;
    return [(total + diff) / 2, (total - diff) / 2];
};`,
        },
      },
    ],
  },

  'find-missing-and-repeated-values': {
    pattern: 'The grid is one array of n² values from 1..n²: cyclic sort it in place (or use sums)',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value with a full scan',
        idea: 'For every v from 1 to n², count its occurrences in the grid.',
        steps: [
          'For `v` from 1 to n², count the cells equal to `v`.',
          'Count 2 → `a`; count 0 → `b`.',
        ],
        time: 'O(n⁴)', space: 'O(1)',
        why: 'n² values, each needing a scan of n² cells. Fine for n ≤ 50 (about 6 million steps), but it does not scale.',
        code: {
          java: r`class Solution {
    public int[] findMissingAndRepeatedValues(int[][] grid) {
        int n = grid.length, a = 0, b = 0;
        for (int v = 1; v <= n * n; v++) {
            int count = 0;
            for (int[] row : grid) for (int x : row) if (x == v) count++;
            if (count == 2) a = v;
            if (count == 0) b = v;
        }
        return new int[] { a, b };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findMissingAndRepeatedValues(vector<vector<int>>& grid) {
        int n = grid.size(), a = 0, b = 0;
        for (int v = 1; v <= n * n; v++) {
            int c = 0;
            for (auto& row : grid) c += count(row.begin(), row.end(), v);
            if (c == 2) a = v;
            if (c == 0) b = v;
        }
        return {a, b};
    }
};`,
          python: r`class Solution:
    def findMissingAndRepeatedValues(self, grid: List[List[int]]) -> List[int]:
        n = len(grid)
        a = b = 0
        for v in range(1, n * n + 1):
            c = sum(row.count(v) for row in grid)
            if c == 2:
                a = v
            elif c == 0:
                b = v
        return [a, b]`,
          javascript: r`var findMissingAndRepeatedValues = function(grid) {
    const n = grid.length;
    let a = 0, b = 0;
    for (let v = 1; v <= n * n; v++) {
        let c = 0;
        for (const row of grid) for (const x of row) if (x === v) c++;
        if (c === 2) a = v;
        if (c === 0) b = v;
    }
    return [a, b];
};`,
        },
      },
      {
        level: 'Better', name: 'Count array',
        idea: 'Count every value in an array of size n² + 1, then read off the 2 and the 0.',
        steps: [
          'For every cell value `x`, `count[x]++`.',
          'For `v` from 1 to n²: `count[v] == 2` is `a`, `count[v] == 0` is `b`.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'Each cell is read once. The count array is as big as the grid.',
        code: {
          java: r`class Solution {
    public int[] findMissingAndRepeatedValues(int[][] grid) {
        int total = grid.length * grid.length, a = 0, b = 0;
        int[] count = new int[total + 1];
        for (int[] row : grid) for (int x : row) count[x]++;
        for (int v = 1; v <= total; v++) {
            if (count[v] == 2) a = v;
            if (count[v] == 0) b = v;
        }
        return new int[] { a, b };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findMissingAndRepeatedValues(vector<vector<int>>& grid) {
        int total = grid.size() * grid.size(), a = 0, b = 0;
        vector<int> count(total + 1, 0);
        for (auto& row : grid) for (int x : row) count[x]++;
        for (int v = 1; v <= total; v++) {
            if (count[v] == 2) a = v;
            if (count[v] == 0) b = v;
        }
        return {a, b};
    }
};`,
          python: r`class Solution:
    def findMissingAndRepeatedValues(self, grid: List[List[int]]) -> List[int]:
        total = len(grid) ** 2
        count = [0] * (total + 1)
        for row in grid:
            for x in row:
                count[x] += 1
        return [count.index(2), count.index(0, 1)]`,
          javascript: r`var findMissingAndRepeatedValues = function(grid) {
    const total = grid.length * grid.length, count = new Array(total + 1).fill(0);
    for (const row of grid) for (const x of row) count[x]++;
    let a = 0, b = 0;
    for (let v = 1; v <= total; v++) {
        if (count[v] === 2) a = v;
        if (count[v] === 0) b = v;
    }
    return [a, b];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cyclic sort the grid in place',
        idea: 'Number the cells 0..n² − 1 row by row (cell k is grid[k / n][k % n]). Then it is Set Mismatch: send value v to cell v − 1, and the one wrong cell holds a while its number gives b.',
        steps: [
          'For cell `k` from 0: let `v` be its value and `home = v − 1`. If cell `home` does not already hold `v`, swap the two cells and stay at `k`; otherwise `k++`.',
          'Find the cell `k` whose value is not `k + 1`: return `[its value, k + 1]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'At most n² − 1 swaps and n² increments, with no memory beyond a few integers. The index arithmetic `k / n`, `k % n` is the only new idea; the rest is the 1D template.',
        code: {
          java: r`class Solution {
    public int[] findMissingAndRepeatedValues(int[][] grid) {
        int n = grid.length, total = n * n, k = 0;
        while (k < total) {
            int v = grid[k / n][k % n], home = v - 1;
            int there = grid[home / n][home % n];
            if (v != there) {
                grid[home / n][home % n] = v;
                grid[k / n][k % n] = there;
            } else k++;
        }
        for (k = 0; k < total; k++)
            if (grid[k / n][k % n] != k + 1) return new int[] { grid[k / n][k % n], k + 1 };
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findMissingAndRepeatedValues(vector<vector<int>>& grid) {
        int n = grid.size(), total = n * n, k = 0;
        auto cell = [&](int i) -> int& { return grid[i / n][i % n]; };
        while (k < total) {
            int home = cell(k) - 1;
            if (cell(k) != cell(home)) swap(cell(k), cell(home));
            else k++;
        }
        for (k = 0; k < total; k++)
            if (cell(k) != k + 1) return {cell(k), k + 1};
        return {};
    }
};`,
          python: r`class Solution:
    def findMissingAndRepeatedValues(self, grid: List[List[int]]) -> List[int]:
        n = len(grid)
        total, k = n * n, 0
        while k < total:
            v = grid[k // n][k % n]
            home = v - 1
            there = grid[home // n][home % n]
            if v != there:
                grid[home // n][home % n] = v
                grid[k // n][k % n] = there
            else:
                k += 1
        for k in range(total):
            if grid[k // n][k % n] != k + 1:
                return [grid[k // n][k % n], k + 1]
        return []`,
          javascript: r`var findMissingAndRepeatedValues = function(grid) {
    const n = grid.length, total = n * n;
    const get = (i) => grid[Math.floor(i / n)][i % n];
    const set = (i, v) => { grid[Math.floor(i / n)][i % n] = v; };
    let k = 0;
    while (k < total) {
        const v = get(k), home = v - 1, there = get(home);
        if (v !== there) { set(home, v); set(k, there); }
        else k++;
    }
    for (k = 0; k < total; k++) if (get(k) !== k + 1) return [get(k), k + 1];
    return [];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two equations from sums',
        idea: 'Against 1..n², the grid\'s sum is off by a − b and its sum of squares by a² − b² = (a − b)(a + b). Divide to get a + b, then solve for both.',
        steps: [
          '`diff` = (sum of cells) − N(N + 1)/2 with N = n², which equals a − b.',
          '`squares` = (sum of squared cells) − N(N + 1)(2N + 1)/6, which equals a² − b².',
          '`total = squares / diff` = a + b; return `[(total + diff) / 2, (total − diff) / 2]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'One pass over the grid and nothing is modified. With N up to 2500 the sum of squares is about 5·10⁹, beyond 32-bit range, so use long / long long.',
        code: {
          java: r`class Solution {
    public int[] findMissingAndRepeatedValues(int[][] grid) {
        long N = (long) grid.length * grid.length;
        long diff = -N * (N + 1) / 2, squares = -N * (N + 1) * (2 * N + 1) / 6;
        for (int[] row : grid) for (int x : row) { diff += x; squares += (long) x * x; }
        long total = squares / diff;
        return new int[] { (int) ((total + diff) / 2), (int) ((total - diff) / 2) };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findMissingAndRepeatedValues(vector<vector<int>>& grid) {
        long long N = 1LL * grid.size() * grid.size();
        long long diff = -N * (N + 1) / 2, squares = -N * (N + 1) * (2 * N + 1) / 6;
        for (auto& row : grid) for (int x : row) { diff += x; squares += 1LL * x * x; }
        long long total = squares / diff;
        return {(int) ((total + diff) / 2), (int) ((total - diff) / 2)};
    }
};`,
          python: r`class Solution:
    def findMissingAndRepeatedValues(self, grid: List[List[int]]) -> List[int]:
        N = len(grid) ** 2
        values = [x for row in grid for x in row]
        diff = sum(values) - N * (N + 1) // 2
        squares = sum(x * x for x in values) - N * (N + 1) * (2 * N + 1) // 6
        total = squares // diff
        return [(total + diff) // 2, (total - diff) // 2]`,
          javascript: r`var findMissingAndRepeatedValues = function(grid) {
    const N = grid.length * grid.length;
    let diff = -N * (N + 1) / 2, squares = -N * (N + 1) * (2 * N + 1) / 6;
    for (const row of grid) for (const x of row) { diff += x; squares += x * x; }
    const total = squares / diff;
    return [(total + diff) / 2, (total - diff) / 2];
};`,
        },
      },
    ],
  },

  'find-all-duplicates-in-an-array': {
    pattern: 'Cyclic sort (or sign marking): a value whose home is already taken is a duplicate',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value with a scan',
        idea: 'For every v from 1 to n, count it with a full scan; a count of 2 makes it a duplicate.',
        steps: [
          'For `v` from 1 to n, count the elements equal to `v`.',
          'If the count is 2, add `v` to the answer.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n values times a full scan each.',
        code: {
          java: r`class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        List<Integer> twice = new ArrayList<>();
        for (int v = 1; v <= nums.length; v++) {
            int count = 0;
            for (int x : nums) if (x == v) count++;
            if (count == 2) twice.add(v);
        }
        return twice;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        vector<int> twice;
        int n = nums.size();
        for (int v = 1; v <= n; v++)
            if (count(nums.begin(), nums.end(), v) == 2) twice.push_back(v);
        return twice;
    }
};`,
          python: r`class Solution:
    def findDuplicates(self, nums: List[int]) -> List[int]:
        return [v for v in range(1, len(nums) + 1) if nums.count(v) == 2]`,
          javascript: r`var findDuplicates = function(nums) {
    const twice = [];
    for (let v = 1; v <= nums.length; v++) {
        let c = 0;
        for (const x of nums) if (x === v) c++;
        if (c === 2) twice.push(v);
    }
    return twice;
};`,
        },
      },
      {
        level: 'Better', name: 'Seen array',
        idea: 'Walk once with a boolean array; a value already marked is a duplicate.',
        steps: [
          'Create `seen` of size n + 1, all false.',
          'For each `x`: if `seen[x]` is already true, add `x` to the answer; otherwise set it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass, but the seen array breaks the constant-space requirement.',
        code: {
          java: r`class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        boolean[] seen = new boolean[nums.length + 1];
        List<Integer> twice = new ArrayList<>();
        for (int x : nums) {
            if (seen[x]) twice.add(x);
            seen[x] = true;
        }
        return twice;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        vector<bool> seen(nums.size() + 1, false);
        vector<int> twice;
        for (int x : nums) {
            if (seen[x]) twice.push_back(x);
            seen[x] = true;
        }
        return twice;
    }
};`,
          python: r`class Solution:
    def findDuplicates(self, nums: List[int]) -> List[int]:
        seen, twice = set(), []
        for x in nums:
            if x in seen:
                twice.append(x)
            seen.add(x)
        return twice`,
          javascript: r`var findDuplicates = function(nums) {
    const seen = new Array(nums.length + 1).fill(false), twice = [];
    for (const x of nums) {
        if (seen[x]) twice.push(x);
        seen[x] = true;
    }
    return twice;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cyclic sort, then read the spare copies',
        idea: 'Swap every value v into index v − 1. A copy whose home is already taken stays put, so after placement every slot i that does not hold i + 1 holds a duplicate.',
        steps: [
          'Cyclic sort: while `i < n`, if `nums[i] != nums[nums[i] − 1]` swap it home, else `i++`.',
          'For every `i` with `nums[i] != i + 1`, add `nums[i]`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'At most n − 1 swaps plus n increments, and only the output list grows. Because each value appears at most twice, each duplicate has exactly one spare copy, so it is reported exactly once.',
        code: {
          java: r`class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) {
                int t = nums[i]; nums[i] = nums[home]; nums[home] = t;
            } else i++;
        }
        List<Integer> twice = new ArrayList<>();
        for (i = 0; i < nums.length; i++) if (nums[i] != i + 1) twice.add(nums[i]);
        return twice;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        int n = nums.size(), i = 0;
        while (i < n) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) swap(nums[i], nums[home]);
            else i++;
        }
        vector<int> twice;
        for (i = 0; i < n; i++) if (nums[i] != i + 1) twice.push_back(nums[i]);
        return twice;
    }
};`,
          python: r`class Solution:
    def findDuplicates(self, nums: List[int]) -> List[int]:
        i = 0
        while i < len(nums):
            home = nums[i] - 1
            if nums[i] != nums[home]:
                nums[i], nums[home] = nums[home], nums[i]
            else:
                i += 1
        return [x for i, x in enumerate(nums) if x != i + 1]`,
          javascript: r`var findDuplicates = function(nums) {
    let i = 0;
    while (i < nums.length) {
        const home = nums[i] - 1;
        if (nums[i] !== nums[home]) [nums[i], nums[home]] = [nums[home], nums[i]];
        else i++;
    }
    const twice = [];
    for (let k = 0; k < nums.length; k++) if (nums[k] !== k + 1) twice.push(nums[k]);
    return twice;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sign marking',
        idea: 'For each value v, look at slot |v| − 1. If it is already negative, |v| was seen before; otherwise negate it to record the first sighting.',
        steps: [
          'For each `v` in `nums`, take `home = |v| − 1` (the value may already have been negated).',
          'If `nums[home] < 0`, this is the second sighting: add `home + 1`. Otherwise negate `nums[home]`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'A single pass. The sign is a free bit per slot because every value is positive. Duplicates come out in the order their second copy appears.',
        code: {
          java: r`class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        List<Integer> twice = new ArrayList<>();
        for (int v : nums) {
            int home = Math.abs(v) - 1;
            if (nums[home] < 0) twice.add(home + 1);
            else nums[home] = -nums[home];
        }
        return twice;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        vector<int> twice;
        for (int v : nums) {
            int home = abs(v) - 1;
            if (nums[home] < 0) twice.push_back(home + 1);
            else nums[home] = -nums[home];
        }
        return twice;
    }
};`,
          python: r`class Solution:
    def findDuplicates(self, nums: List[int]) -> List[int]:
        twice = []
        for v in nums:
            home = abs(v) - 1
            if nums[home] < 0:
                twice.append(home + 1)
            else:
                nums[home] = -nums[home]
        return twice`,
          javascript: r`var findDuplicates = function(nums) {
    const twice = [];
    for (const v of nums) {
        const home = Math.abs(v) - 1;
        if (nums[home] < 0) twice.push(home + 1);
        else nums[home] = -nums[home];
    }
    return twice;
};`,
        },
      },
    ],
  },

  'array-nesting': {
    pattern: 'Cycles of a permutation: walk each cycle once (mark visited)',
    approaches: [
      {
        level: 'Brute force', name: 'Walk the cycle from every start',
        idea: 'Each set s[k] is the cycle through k. From every index, follow the arrows until you come back to it, counting steps.',
        steps: [
          'For each `start`: set `len = 1` and `i = nums[start]`; while `i != start`, move `i = nums[i]` and `len++`.',
          'Return the largest `len`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'In a permutation the walk always returns to its start, but if the whole array is one cycle, every one of the n starts walks all n steps.',
        code: {
          java: r`class Solution {
    public int arrayNesting(int[] nums) {
        int best = 0;
        for (int start = 0; start < nums.length; start++) {
            int len = 1;
            for (int i = nums[start]; i != start; i = nums[i]) len++;
            best = Math.max(best, len);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int arrayNesting(vector<int>& nums) {
        int best = 0;
        for (int start = 0; start < (int) nums.size(); start++) {
            int len = 1;
            for (int i = nums[start]; i != start; i = nums[i]) len++;
            best = max(best, len);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def arrayNesting(self, nums: List[int]) -> int:
        best = 0
        for start in range(len(nums)):
            length, i = 1, nums[start]
            while i != start:
                i = nums[i]
                length += 1
            best = max(best, length)
        return best`,
          javascript: r`var arrayNesting = function(nums) {
    let best = 0;
    for (let start = 0; start < nums.length; start++) {
        let len = 1;
        for (let i = nums[start]; i !== start; i = nums[i]) len++;
        best = Math.max(best, len);
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Visited array: each cycle once',
        idea: 'Every index on a cycle gives the same set, so once a cycle has been walked, skip all its indexes.',
        steps: [
          'Keep `seen`. For each `start` not yet seen, walk `i = nums[i]` marking `seen[i]` and counting, until you reach a seen index.',
          'Return the longest walk.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is marked once and never walked again, so all walks together take n steps.',
        code: {
          java: r`class Solution {
    public int arrayNesting(int[] nums) {
        boolean[] seen = new boolean[nums.length];
        int best = 0;
        for (int start = 0; start < nums.length; start++) {
            int len = 0;
            for (int i = start; !seen[i]; i = nums[i]) { seen[i] = true; len++; }
            best = Math.max(best, len);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int arrayNesting(vector<int>& nums) {
        vector<bool> seen(nums.size(), false);
        int best = 0;
        for (int start = 0; start < (int) nums.size(); start++) {
            int len = 0;
            for (int i = start; !seen[i]; i = nums[i]) { seen[i] = true; len++; }
            best = max(best, len);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def arrayNesting(self, nums: List[int]) -> int:
        seen = [False] * len(nums)
        best = 0
        for start in range(len(nums)):
            length, i = 0, start
            while not seen[i]:
                seen[i] = True
                i = nums[i]
                length += 1
            best = max(best, length)
        return best`,
          javascript: r`var arrayNesting = function(nums) {
    const seen = new Array(nums.length).fill(false);
    let best = 0;
    for (let start = 0; start < nums.length; start++) {
        let len = 0;
        for (let i = start; !seen[i]; i = nums[i]) { seen[i] = true; len++; }
        best = Math.max(best, len);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Mark visited in place',
        idea: 'Values are 0..n − 1, so overwrite a visited slot with −1 instead of keeping a separate array.',
        steps: [
          'For each `start`: walk while `nums[i] >= 0`, saving `next = nums[i]`, setting `nums[i] = −1`, moving to `next` and counting.',
          'Return the longest walk.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'The same single walk per cycle, with the array doubling as the visited marks. Save `next` before overwriting the slot.',
        code: {
          java: r`class Solution {
    public int arrayNesting(int[] nums) {
        int best = 0;
        for (int start = 0; start < nums.length; start++) {
            int len = 0;
            for (int i = start; nums[i] >= 0; len++) {
                int next = nums[i];
                nums[i] = -1;
                i = next;
            }
            best = Math.max(best, len);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int arrayNesting(vector<int>& nums) {
        int best = 0;
        for (int start = 0; start < (int) nums.size(); start++) {
            int len = 0;
            for (int i = start; nums[i] >= 0; len++) {
                int next = nums[i];
                nums[i] = -1;
                i = next;
            }
            best = max(best, len);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def arrayNesting(self, nums: List[int]) -> int:
        best = 0
        for start in range(len(nums)):
            length, i = 0, start
            while nums[i] >= 0:
                nums[i], i = -1, nums[i]
                length += 1
            best = max(best, length)
        return best`,
          javascript: r`var arrayNesting = function(nums) {
    let best = 0;
    for (let start = 0; start < nums.length; start++) {
        let len = 0;
        for (let i = start; nums[i] >= 0; len++) {
            const next = nums[i];
            nums[i] = -1;
            i = next;
        }
        best = Math.max(best, len);
    }
    return best;
};`,
        },
      },
    ],
  },

  'minimum-number-of-operations-to-sort-a-binary-tree-by-level': {
    pattern: 'BFS by level, then minimum swaps to sort each level = size − cycles (cyclic sort to sorted positions)',
    approaches: [
      {
        level: 'Brute force', name: 'BFS, then selection sort each level counting swaps',
        idea: 'Collect each level with a BFS and selection-sort it, counting the swaps that actually move something. Selection sort happens to use the minimum number of swaps.',
        steps: [
          'BFS level by level, copying each level\'s values into an array.',
          'For each position `i`, find the smallest value in `a[i..]`; if it is not already at `i`, swap it in and count one operation.',
          'Add up the counts over all levels.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each swap puts the right value at position i for good, which detaches exactly one element from its cycle: that is all an optimal swap can do, so the count is minimal. But a level can hold about n/2 nodes, and selection sort is quadratic in the level size.',
        code: {
          java: r`class Solution {
    public int minimumOperations(TreeNode root) {
        int ops = 0;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int[] a = new int[queue.size()];
            for (int k = 0; k < a.length; k++) {
                TreeNode node = queue.poll();
                a[k] = node.val;
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            for (int i = 0; i < a.length; i++) {
                int min = i;
                for (int j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j;
                if (min != i) { int t = a[i]; a[i] = a[min]; a[min] = t; ops++; }
            }
        }
        return ops;
    }
}`,
          cpp: r`class Solution {
public:
    int minimumOperations(TreeNode* root) {
        int ops = 0;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            vector<int> a;
            for (int k = q.size(); k > 0; k--) {
                TreeNode* node = q.front();
                q.pop();
                a.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            for (int i = 0; i < (int) a.size(); i++) {
                int mn = min_element(a.begin() + i, a.end()) - a.begin();
                if (mn != i) { swap(a[i], a[mn]); ops++; }
            }
        }
        return ops;
    }
};`,
          python: r`class Solution:
    def minimumOperations(self, root: Optional[TreeNode]) -> int:
        ops, level = 0, [root]
        while level:
            a = [node.val for node in level]
            for i in range(len(a)):
                m = min(range(i, len(a)), key=a.__getitem__)
                if m != i:
                    a[i], a[m] = a[m], a[i]
                    ops += 1
            level = [c for node in level for c in (node.left, node.right) if c]
        return ops`,
          javascript: r`var minimumOperations = function(root) {
    let ops = 0, level = [root];
    while (level.length) {
        const a = level.map((node) => node.val);
        for (let i = 0; i < a.length; i++) {
            let m = i;
            for (let j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
            if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; ops++; }
        }
        const next = [];
        for (const node of level) {
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
    }
    return ops;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS, then cyclic sort each level to its sorted positions',
        idea: 'A value\'s target is its index in a sorted copy of the level. Cyclic-sort each value to its target, counting swaps: that count is size − cycles, the minimum.',
        steps: [
          'BFS level by level, copying each level\'s values into `a`.',
          'Sort a copy and map each value to its index in it (its target).',
          'For each `i`: while `a[i]` is not at its target, swap it there and count one operation.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Each swap sends one value to its final position, so a level of size w needs at most w − 1 swaps, which equals w − cycles. Sorting each level dominates: O(w log w) summed over levels is O(n log n). The queue and the map hold one level at a time.',
        code: {
          java: r`class Solution {
    public int minimumOperations(TreeNode root) {
        int ops = 0;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int[] a = new int[queue.size()];
            for (int k = 0; k < a.length; k++) {
                TreeNode node = queue.poll();
                a[k] = node.val;
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            int[] sorted = a.clone();
            Arrays.sort(sorted);
            Map<Integer, Integer> target = new HashMap<>();
            for (int i = 0; i < sorted.length; i++) target.put(sorted[i], i);
            for (int i = 0; i < a.length; i++) {
                while (target.get(a[i]) != i) {
                    int j = target.get(a[i]);
                    int t = a[i]; a[i] = a[j]; a[j] = t;
                    ops++;
                }
            }
        }
        return ops;
    }
}`,
          cpp: r`class Solution {
public:
    int minimumOperations(TreeNode* root) {
        int ops = 0;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            vector<int> a;
            for (int k = q.size(); k > 0; k--) {
                TreeNode* node = q.front();
                q.pop();
                a.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            vector<int> sorted = a;
            sort(sorted.begin(), sorted.end());
            unordered_map<int, int> target;
            for (int i = 0; i < (int) sorted.size(); i++) target[sorted[i]] = i;
            for (int i = 0; i < (int) a.size(); i++)
                while (target[a[i]] != i) { swap(a[i], a[target[a[i]]]); ops++; }
        }
        return ops;
    }
};`,
          python: r`class Solution:
    def minimumOperations(self, root: Optional[TreeNode]) -> int:
        ops, level = 0, [root]
        while level:
            a = [node.val for node in level]
            target = {v: i for i, v in enumerate(sorted(a))}
            for i in range(len(a)):
                while target[a[i]] != i:
                    j = target[a[i]]
                    a[i], a[j] = a[j], a[i]
                    ops += 1
            level = [c for node in level for c in (node.left, node.right) if c]
        return ops`,
          javascript: r`var minimumOperations = function(root) {
    let ops = 0, level = [root];
    while (level.length) {
        const a = level.map((node) => node.val);
        const sorted = [...a].sort((x, y) => x - y);
        const target = new Map(sorted.map((v, i) => [v, i]));
        for (let i = 0; i < a.length; i++) {
            while (target.get(a[i]) !== i) {
                const j = target.get(a[i]);
                [a[i], a[j]] = [a[j], a[i]];
                ops++;
            }
        }
        const next = [];
        for (const node of level) {
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
    }
    return ops;
};`,
        },
      },
    ],
  },

  'couples-holding-hands': {
    pattern: 'Greedy seat-pair swaps; the answer is seat pairs − cycles (partner of x is x ^ 1)',
    approaches: [
      {
        level: 'Better', name: 'Greedy, scanning for the partner',
        idea: 'Fix the seat pairs left to right: if seat 2j + 1 does not hold the partner of the person in seat 2j, find the partner further right and swap them in.',
        steps: [
          'For `i = 0, 2, 4, …`: the partner is `row[i] ^ 1`.',
          'If `row[i + 1]` is not the partner, scan `j > i + 1` for it, swap `row[i + 1]` and `row[j]`, and count one swap.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n seat pairs, each possibly scanning the row. Each swap seats one couple for good and never breaks another, which is why the greedy is optimal (see the last approach). With at most 60 seats this is already fast.',
        code: {
          java: r`class Solution {
    public int minSwapsCouples(int[] row) {
        int swaps = 0;
        for (int i = 0; i < row.length; i += 2) {
            int partner = row[i] ^ 1;
            if (row[i + 1] == partner) continue;
            for (int j = i + 2; j < row.length; j++) {
                if (row[j] == partner) {
                    row[j] = row[i + 1];
                    row[i + 1] = partner;
                    swaps++;
                    break;
                }
            }
        }
        return swaps;
    }
}`,
          cpp: r`class Solution {
public:
    int minSwapsCouples(vector<int>& row) {
        int swaps = 0, n = row.size();
        for (int i = 0; i < n; i += 2) {
            int partner = row[i] ^ 1;
            if (row[i + 1] == partner) continue;
            int j = find(row.begin() + i + 2, row.end(), partner) - row.begin();
            swap(row[i + 1], row[j]);
            swaps++;
        }
        return swaps;
    }
};`,
          python: r`class Solution:
    def minSwapsCouples(self, row: List[int]) -> int:
        swaps = 0
        for i in range(0, len(row), 2):
            partner = row[i] ^ 1
            if row[i + 1] != partner:
                j = row.index(partner, i + 2)
                row[i + 1], row[j] = row[j], row[i + 1]
                swaps += 1
        return swaps`,
          javascript: r`var minSwapsCouples = function(row) {
    let swaps = 0;
    for (let i = 0; i < row.length; i += 2) {
        const partner = row[i] ^ 1;
        if (row[i + 1] === partner) continue;
        const j = row.indexOf(partner, i + 2);
        [row[i + 1], row[j]] = [row[j], row[i + 1]];
        swaps++;
    }
    return swaps;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Greedy with a seat index',
        idea: 'The same greedy, but keep seat[person] so the partner is found in O(1). Update both people\'s seats on every swap.',
        steps: [
          'Build `seat[row[i]] = i`.',
          'For `i = 0, 2, 4, …`: if `row[i + 1]` is not `row[i] ^ 1`, let `j = seat[partner]`; swap `row[i + 1]` and `row[j]`, update their seats, count one swap.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass with O(1) work per seat pair. Forgetting to update `seat` for the person moved out of seat i + 1 is the usual bug.',
        code: {
          java: r`class Solution {
    public int minSwapsCouples(int[] row) {
        int[] seat = new int[row.length];
        for (int i = 0; i < row.length; i++) seat[row[i]] = i;
        int swaps = 0;
        for (int i = 0; i < row.length; i += 2) {
            int partner = row[i] ^ 1;
            if (row[i + 1] == partner) continue;
            int j = seat[partner];
            row[j] = row[i + 1]; seat[row[j]] = j;
            row[i + 1] = partner; seat[partner] = i + 1;
            swaps++;
        }
        return swaps;
    }
}`,
          cpp: r`class Solution {
public:
    int minSwapsCouples(vector<int>& row) {
        int n = row.size(), swaps = 0;
        vector<int> seat(n);
        for (int i = 0; i < n; i++) seat[row[i]] = i;
        for (int i = 0; i < n; i += 2) {
            int partner = row[i] ^ 1;
            if (row[i + 1] == partner) continue;
            int j = seat[partner];
            row[j] = row[i + 1]; seat[row[j]] = j;
            row[i + 1] = partner; seat[partner] = i + 1;
            swaps++;
        }
        return swaps;
    }
};`,
          python: r`class Solution:
    def minSwapsCouples(self, row: List[int]) -> int:
        seat = [0] * len(row)
        for i, person in enumerate(row):
            seat[person] = i
        swaps = 0
        for i in range(0, len(row), 2):
            partner = row[i] ^ 1
            if row[i + 1] == partner:
                continue
            j = seat[partner]
            row[j], seat[row[i + 1]] = row[i + 1], j
            row[i + 1], seat[partner] = partner, i + 1
            swaps += 1
        return swaps`,
          javascript: r`var minSwapsCouples = function(row) {
    const seat = new Array(row.length);
    row.forEach((person, i) => { seat[person] = i; });
    let swaps = 0;
    for (let i = 0; i < row.length; i += 2) {
        const partner = row[i] ^ 1;
        if (row[i + 1] === partner) continue;
        const j = seat[partner];
        row[j] = row[i + 1]; seat[row[j]] = j;
        row[i + 1] = partner; seat[partner] = i + 1;
        swaps++;
    }
    return swaps;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count cycles with union-find',
        idea: 'Make each couple a node, and join the two couples sitting on each seat pair. A group of k couples tangled together needs k − 1 swaps, so the answer is couples − groups.',
        steps: [
          'Start with n / 2 separate couples (couple of person x is x / 2).',
          'For each seat pair (`2j`, `2j + 1`), union the couples of its two occupants; count every union that merges two groups.',
          'That count, couples − groups, is the answer.',
        ],
        time: 'O(n α(n))', space: 'O(n)',
        why: 'Each couple touches at most two seat pairs, so every group is a cycle (a seated couple is a cycle of one). The goal is one cycle per couple, and a swap can split at most one cycle into two, so at least couples − groups swaps are needed; the greedy reaches it. The number of successful unions is exactly couples − groups.',
        code: {
          java: r`class Solution {
    public int minSwapsCouples(int[] row) {
        int[] parent = new int[row.length / 2];
        for (int c = 0; c < parent.length; c++) parent[c] = c;
        int swaps = 0;
        for (int i = 0; i < row.length; i += 2) {
            int a = find(parent, row[i] / 2), b = find(parent, row[i + 1] / 2);
            if (a != b) { parent[a] = b; swaps++; }
        }
        return swaps;
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    }
public:
    int minSwapsCouples(vector<int>& row) {
        parent.assign(row.size() / 2, 0);
        iota(parent.begin(), parent.end(), 0);
        int swaps = 0;
        for (int i = 0; i < (int) row.size(); i += 2) {
            int a = find(row[i] / 2), b = find(row[i + 1] / 2);
            if (a != b) { parent[a] = b; swaps++; }
        }
        return swaps;
    }
};`,
          python: r`class Solution:
    def minSwapsCouples(self, row: List[int]) -> int:
        parent = list(range(len(row) // 2))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        swaps = 0
        for i in range(0, len(row), 2):
            a, b = find(row[i] // 2), find(row[i + 1] // 2)
            if a != b:
                parent[a] = b
                swaps += 1
        return swaps`,
          javascript: r`var minSwapsCouples = function(row) {
    const parent = Array.from({ length: row.length / 2 }, (_, c) => c);
    const find = (x) => {
        while (parent[x] !== x) x = parent[x] = parent[parent[x]];
        return x;
    };
    let swaps = 0;
    for (let i = 0; i < row.length; i += 2) {
        const a = find(row[i] >> 1), b = find(row[i + 1] >> 1);
        if (a !== b) { parent[a] = b; swaps++; }
    }
    return swaps;
};`,
        },
      },
    ],
  },
};
