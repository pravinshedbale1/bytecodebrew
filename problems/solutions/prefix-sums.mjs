const r = String.raw;

export default {
  'running-sum-of-1d-array': {
    pattern: 'Prefix sum (each total builds on the previous one)',
    approaches: [
      {
        level: 'Brute force', name: 'Add up the prefix for every position',
        idea: 'Element `i` of the answer is the sum of `nums[0..i]`. Compute that sum from scratch for every `i`.',
        steps: [
          'For each `i`, add `nums[0]` through `nums[i]`.',
          'Store the total at `out[i]` and return `out`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Position `i` costs i + 1 additions, so about n²/2 in total. The output array is O(n).',
        code: {
          java: r`class Solution {
    public int[] runningSum(int[] nums) {
        int[] out = new int[nums.length];
        for (int i = 0; i < nums.length; i++)
            for (int j = 0; j <= i; j++) out[i] += nums[j];
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> runningSum(vector<int>& nums) {
        vector<int> out(nums.size(), 0);
        for (size_t i = 0; i < nums.size(); i++)
            for (size_t j = 0; j <= i; j++) out[i] += nums[j];
        return out;
    }
};`,
          python: r`class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:
        return [sum(nums[:i + 1]) for i in range(len(nums))]`,
          javascript: r`var runningSum = function(nums) {
    const out = new Array(nums.length).fill(0);
    for (let i = 0; i < nums.length; i++)
        for (let j = 0; j <= i; j++) out[i] += nums[j];
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Carry the previous total forward',
        idea: 'The running sum at `i` is the running sum at `i − 1` plus `nums[i]`, so one pass is enough — and it can even be done in place.',
        steps: [
          'For `i` from 1 to n − 1, set `nums[i] += nums[i − 1]`.',
          'Return `nums`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One addition per element. Writing into the input uses no extra memory (copy first if the input must be kept).',
        code: {
          java: r`class Solution {
    public int[] runningSum(int[] nums) {
        for (int i = 1; i < nums.length; i++) nums[i] += nums[i - 1];
        return nums;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> runningSum(vector<int>& nums) {
        for (size_t i = 1; i < nums.size(); i++) nums[i] += nums[i - 1];
        return nums;
    }
};`,
          python: r`class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:
        for i in range(1, len(nums)):
            nums[i] += nums[i - 1]
        return nums`,
          javascript: r`var runningSum = function(nums) {
    for (let i = 1; i < nums.length; i++) nums[i] += nums[i - 1];
    return nums;
};`,
        },
      },
    ],
  },

  'range-sum-query-immutable': {
    pattern: 'Prefix sums: sum(left..right) = prefix[right + 1] − prefix[left]',
    approaches: [
      {
        level: 'Brute force', name: 'Loop over the range on every query',
        idea: 'Keep the array and add up `nums[left..right]` each time `sumRange` is called.',
        steps: [
          'The constructor stores `nums`.',
          '`sumRange(left, right)` adds `nums[left]` through `nums[right]` and returns the total.',
        ],
        time: 'O(n) per query', space: 'O(1)',
        why: 'Each query can cover the whole array. With q queries that is O(q·n) — up to 10⁸ here. Nothing beyond the stored array is kept.',
        code: {
          java: r`class NumArray {
    private final int[] nums;

    public NumArray(int[] nums) {
        this.nums = nums;
    }

    public int sumRange(int left, int right) {
        int sum = 0;
        for (int i = left; i <= right; i++) sum += nums[i];
        return sum;
    }
}`,
          cpp: r`class NumArray {
    vector<int> nums;
public:
    NumArray(vector<int>& nums) : nums(nums) {}

    int sumRange(int left, int right) {
        int sum = 0;
        for (int i = left; i <= right; i++) sum += nums[i];
        return sum;
    }
};`,
          python: r`class NumArray:

    def __init__(self, nums: List[int]):
        self.nums = nums

    def sumRange(self, left: int, right: int) -> int:
        return sum(self.nums[left:right + 1])`,
          javascript: r`var NumArray = function(nums) {
    this.nums = nums;
};

NumArray.prototype.sumRange = function(left, right) {
    let sum = 0;
    for (let i = left; i <= right; i++) sum += this.nums[i];
    return sum;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Precompute prefix sums once',
        idea: 'Store `prefix[i]` = sum of the first `i` values. The sum of `nums[left..right]` is the first `right + 1` values minus the first `left` values.',
        steps: [
          'In the constructor, build `prefix` of length n + 1: `prefix[0] = 0`, `prefix[i + 1] = prefix[i] + nums[i]`.',
          '`sumRange(left, right)` returns `prefix[right + 1] − prefix[left]`.',
        ],
        time: 'O(1) per query', space: 'O(n)',
        why: 'Building the prefix array is O(n) once; each query is a single subtraction. The extra length-1 slot (`prefix[0] = 0`) avoids a special case when `left` is 0.',
        code: {
          java: r`class NumArray {
    private final int[] prefix;

    public NumArray(int[] nums) {
        prefix = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    }

    public int sumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
}`,
          cpp: r`class NumArray {
    vector<int> prefix;
public:
    NumArray(vector<int>& nums) : prefix(nums.size() + 1, 0) {
        for (size_t i = 0; i < nums.size(); i++) prefix[i + 1] = prefix[i] + nums[i];
    }

    int sumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
};`,
          python: r`class NumArray:

    def __init__(self, nums: List[int]):
        self.prefix = [0]
        for x in nums:
            self.prefix.append(self.prefix[-1] + x)

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]`,
          javascript: r`var NumArray = function(nums) {
    this.prefix = [0];
    for (const x of nums) this.prefix.push(this.prefix[this.prefix.length - 1] + x);
};

NumArray.prototype.sumRange = function(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
};`,
        },
      },
    ],
  },

  'find-pivot-index': {
    pattern: 'Running prefix sum against the total (right sum = total − left − current)',
    approaches: [
      {
        level: 'Brute force', name: 'Sum both sides for every index',
        idea: 'For each index, add up everything to its left and everything to its right, and compare.',
        steps: [
          'For each `i`, compute `left = nums[0] + … + nums[i − 1]` and `right = nums[i + 1] + … + nums[n − 1]`.',
          'Return the first `i` where `left == right`.',
          'Return −1 if none.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each index sums the other n − 1 values.',
        code: {
          java: r`class Solution {
    public int pivotIndex(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            int left = 0, right = 0;
            for (int j = 0; j < i; j++) left += nums[j];
            for (int j = i + 1; j < n; j++) right += nums[j];
            if (left == right) return i;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            int left = 0, right = 0;
            for (int j = 0; j < i; j++) left += nums[j];
            for (int j = i + 1; j < n; j++) right += nums[j];
            if (left == right) return i;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        for i in range(len(nums)):
            if sum(nums[:i]) == sum(nums[i + 1:]):
                return i
        return -1`,
          javascript: r`var pivotIndex = function(nums) {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        let left = 0, right = 0;
        for (let j = 0; j < i; j++) left += nums[j];
        for (let j = i + 1; j < n; j++) right += nums[j];
        if (left === right) return i;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix sum array',
        idea: 'With `prefix[i]` = sum of the first `i` values, the left sum at `i` is `prefix[i]` and the right sum is `prefix[n] − prefix[i + 1]`.',
        steps: [
          'Build `prefix` of length n + 1.',
          'For each `i`, compare `prefix[i]` with `prefix[n] − prefix[i + 1]`; return the first match.',
          'Return −1 if none.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes; the prefix array costs O(n) memory, which the running sum below avoids.',
        code: {
          java: r`class Solution {
    public int pivotIndex(int[] nums) {
        int n = nums.length;
        int[] prefix = new int[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        for (int i = 0; i < n; i++)
            if (prefix[i] == prefix[n] - prefix[i + 1]) return i;
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int n = nums.size();
        vector<int> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        for (int i = 0; i < n; i++)
            if (prefix[i] == prefix[n] - prefix[i + 1]) return i;
        return -1;
    }
};`,
          python: r`class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        n = len(nums)
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + nums[i]
        for i in range(n):
            if prefix[i] == prefix[n] - prefix[i + 1]:
                return i
        return -1`,
          javascript: r`var pivotIndex = function(nums) {
    const n = nums.length, prefix = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
    for (let i = 0; i < n; i++)
        if (prefix[i] === prefix[n] - prefix[i + 1]) return i;
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Total sum and a running left sum',
        idea: 'Knowing the total, the right sum at `i` is `total − left − nums[i]`. Keep `left` as a running sum, so no array is needed.',
        steps: [
          'Compute `total` = sum of all values; set `left = 0`.',
          'For each `i`: if `left == total − left − nums[i]`, return `i`.',
          'Otherwise add `nums[i]` to `left` and continue; return −1 at the end.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes (one for the total, one for the scan) and two integers of state.',
        code: {
          java: r`class Solution {
    public int pivotIndex(int[] nums) {
        int total = 0, left = 0;
        for (int x : nums) total += x;
        for (int i = 0; i < nums.length; i++) {
            if (left == total - left - nums[i]) return i;
            left += nums[i];
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0), left = 0;
        for (int i = 0; i < (int) nums.size(); i++) {
            if (left == total - left - nums[i]) return i;
            left += nums[i];
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        total, left = sum(nums), 0
        for i, x in enumerate(nums):
            if left == total - left - x:
                return i
            left += x
        return -1`,
          javascript: r`var pivotIndex = function(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    let left = 0;
    for (let i = 0; i < nums.length; i++) {
        if (left === total - left - nums[i]) return i;
        left += nums[i];
    }
    return -1;
};`,
        },
      },
    ],
  },

  'subarray-sum-equals-k': {
    pattern: 'Prefix sum + hash map of prefix counts (count earlier prefixes equal to sum − k)',
    approaches: [
      {
        level: 'Brute force', name: 'Sum every subarray separately',
        idea: 'Enumerate every subarray `[i, j]`, add up its values, and count those equal to `k`.',
        steps: [
          'For every `i <= j`, add `nums[i..j]` from scratch.',
          'If the sum equals `k`, increase the count.',
          'Return the count.',
        ],
        time: 'O(n³)', space: 'O(1)',
        why: 'About n²/2 subarrays, each summed in up to n steps.',
        code: {
          java: r`class Solution {
    public int subarraySum(int[] nums, int k) {
        int n = nums.length, count = 0;
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                int sum = 0;
                for (int t = i; t <= j; t++) sum += nums[t];
                if (sum == k) count++;
            }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size(), count = 0;
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                int sum = 0;
                for (int t = i; t <= j; t++) sum += nums[t];
                if (sum == k) count++;
            }
        return count;
    }
};`,
          python: r`class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        n = len(nums)
        return sum(1 for i in range(n) for j in range(i, n) if sum(nums[i:j + 1]) == k)`,
          javascript: r`var subarraySum = function(nums, k) {
    const n = nums.length;
    let count = 0;
    for (let i = 0; i < n; i++)
        for (let j = i; j < n; j++) {
            let sum = 0;
            for (let t = i; t <= j; t++) sum += nums[t];
            if (sum === k) count++;
        }
    return count;
};`,
        },
      },
      {
        level: 'Better', name: 'Extend each start with a running sum',
        idea: 'The sum of `[i, j + 1]` is the sum of `[i, j]` plus `nums[j + 1]`, so for a fixed start keep a running total instead of re-adding.',
        steps: [
          'For each start `i`, set `sum = 0`.',
          'For `j` from `i` to n − 1, add `nums[j]`; if `sum == k`, increase the count.',
          'Return the count.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n starts, each extended in O(n). Negative values mean we cannot stop early (the sum can come back down to `k`).',
        code: {
          java: r`class Solution {
    public int subarraySum(int[] nums, int k) {
        int n = nums.length, count = 0;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum == k) count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int n = nums.size(), count = 0;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum == k) count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        n, count = len(nums), 0
        for i in range(n):
            s = 0
            for j in range(i, n):
                s += nums[j]
                if s == k:
                    count += 1
        return count`,
          javascript: r`var subarraySum = function(nums, k) {
    const n = nums.length;
    let count = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];
            if (sum === k) count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Prefix sums with a hash map of how often each appeared',
        idea: 'A subarray `(i, j]` sums to `k` exactly when `prefix[j] − prefix[i] = k`, i.e. `prefix[i] = prefix[j] − k`. While scanning, count how many earlier prefixes equal `sum − k`.',
        steps: [
          'Create a map `seen` with `seen[0] = 1` (the empty prefix before index 0).',
          'Walk the array keeping the running `sum`.',
          'Add `seen[sum − k]` (0 if absent) to the answer: each such earlier prefix starts one subarray ending here.',
          'Then increase `seen[sum]` by 1. Return the answer.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass with O(1) average map work per element; the map holds up to n + 1 distinct prefix sums. Works with negative values, unlike a sliding window.',
        code: {
          java: r`class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);
        int sum = 0, count = 0;
        for (int x : nums) {
            sum += x;
            count += seen.getOrDefault(sum - k, 0);
            seen.merge(sum, 1, Integer::sum);
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> seen{{0, 1}};
        int sum = 0, count = 0;
        for (int x : nums) {
            sum += x;
            auto it = seen.find(sum - k);
            if (it != seen.end()) count += it->second;
            seen[sum]++;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        seen = defaultdict(int)
        seen[0] = 1
        s = count = 0
        for x in nums:
            s += x
            count += seen[s - k]
            seen[s] += 1
        return count`,
          javascript: r`var subarraySum = function(nums, k) {
    const seen = new Map([[0, 1]]);
    let sum = 0, count = 0;
    for (const x of nums) {
        sum += x;
        count += seen.get(sum - k) ?? 0;
        seen.set(sum, (seen.get(sum) ?? 0) + 1);
    }
    return count;
};`,
        },
      },
    ],
  },

  'subarray-sums-divisible-by-k': {
    pattern: 'Prefix sums modulo k + counting equal remainders',
    approaches: [
      {
        level: 'Brute force', name: 'Running sum from every start',
        idea: 'Enumerate every subarray with a running sum from each start and count the sums divisible by `k`.',
        steps: [
          'For each start `i`, set `sum = 0`.',
          'For each `j >= i`, add `nums[j]`; if `sum % k == 0`, increase the count.',
          'Return the count.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n starts, each extended over up to n elements. (`sum % k == 0` is correct even for negative sums, since 0 is 0 in every language.)',
        code: {
          java: r`class Solution {
    public int subarraysDivByK(int[] nums, int k) {
        int n = nums.length, count = 0;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum % k == 0) count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int subarraysDivByK(vector<int>& nums, int k) {
        int n = nums.size(), count = 0;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum % k == 0) count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def subarraysDivByK(self, nums: List[int], k: int) -> int:
        n, count = len(nums), 0
        for i in range(n):
            s = 0
            for j in range(i, n):
                s += nums[j]
                if s % k == 0:
                    count += 1
        return count`,
          javascript: r`var subarraysDivByK = function(nums, k) {
    const n = nums.length;
    let count = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];
            if (sum % k === 0) count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count prefix sums by their remainder',
        idea: 'The sum of `(i, j]` is `prefix[j] − prefix[i]`; it is divisible by `k` exactly when both prefixes leave the same remainder mod `k`. So each new prefix pairs with every earlier prefix of the same remainder.',
        steps: [
          'Keep `count[r]` = how many prefixes so far have remainder `r`; start with `count[0] = 1` (the empty prefix).',
          'Walk the array with a running `sum`; compute `r = ((sum % k) + k) % k` so negatives give a remainder in `0..k − 1`.',
          'Add `count[r]` to the answer, then increase `count[r]`.',
          'Return the answer.',
        ],
        time: 'O(n + k)', space: 'O(k)',
        why: 'One pass plus a table of k remainders. The normalisation step matters: in Java, C++ and JavaScript `-3 % 5` is `-3`, not `2`.',
        code: {
          java: r`class Solution {
    public int subarraysDivByK(int[] nums, int k) {
        int[] count = new int[k];
        count[0] = 1;
        int sum = 0, total = 0;
        for (int x : nums) {
            sum += x;
            int r = ((sum % k) + k) % k;
            total += count[r]++;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int subarraysDivByK(vector<int>& nums, int k) {
        vector<int> count(k, 0);
        count[0] = 1;
        int sum = 0, total = 0;
        for (int x : nums) {
            sum += x;
            int r = ((sum % k) + k) % k;
            total += count[r]++;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def subarraysDivByK(self, nums: List[int], k: int) -> int:
        count = [0] * k
        count[0] = 1
        s = total = 0
        for x in nums:
            s += x
            r = s % k  # Python's % is already non-negative for k > 0
            total += count[r]
            count[r] += 1
        return total`,
          javascript: r`var subarraysDivByK = function(nums, k) {
    const count = new Array(k).fill(0);
    count[0] = 1;
    let sum = 0, total = 0;
    for (const x of nums) {
        sum += x;
        const r = ((sum % k) + k) % k;
        total += count[r]++;
    }
    return total;
};`,
        },
      },
    ],
  },

  'contiguous-array': {
    pattern: 'Prefix sum with 0 → −1, and the first index of each prefix value (longest zero-sum subarray)',
    approaches: [
      {
        level: 'Brute force', name: 'Count zeros and ones from every start',
        idea: 'For each start, extend to the right counting zeros and ones; whenever they are equal, the subarray is balanced.',
        steps: [
          'For each start `i`, set `balance = 0`.',
          'For each `j >= i`, add +1 for a 1 and −1 for a 0.',
          'When `balance == 0`, update the best with `j − i + 1`.',
          'Return the best.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n starts, each extended over up to n elements.',
        code: {
          java: r`class Solution {
    public int findMaxLength(int[] nums) {
        int n = nums.length, best = 0;
        for (int i = 0; i < n; i++) {
            int balance = 0;
            for (int j = i; j < n; j++) {
                balance += nums[j] == 1 ? 1 : -1;
                if (balance == 0) best = Math.max(best, j - i + 1);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int findMaxLength(vector<int>& nums) {
        int n = nums.size(), best = 0;
        for (int i = 0; i < n; i++) {
            int balance = 0;
            for (int j = i; j < n; j++) {
                balance += nums[j] == 1 ? 1 : -1;
                if (balance == 0) best = max(best, j - i + 1);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        n, best = len(nums), 0
        for i in range(n):
            balance = 0
            for j in range(i, n):
                balance += 1 if nums[j] == 1 else -1
                if balance == 0:
                    best = max(best, j - i + 1)
        return best`,
          javascript: r`var findMaxLength = function(nums) {
    const n = nums.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        let balance = 0;
        for (let j = i; j < n; j++) {
            balance += nums[j] === 1 ? 1 : -1;
            if (balance === 0) best = Math.max(best, j - i + 1);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'First index of every running balance',
        idea: 'With 0 counted as −1, a balanced subarray has sum 0, so it lies between two positions with the same running balance. For the longest one, pair each position with the first time its balance appeared.',
        steps: [
          'Record `first[0] = −1` (balance 0 before the array starts).',
          'Walk the array updating `balance` (+1 for 1, −1 for 0).',
          'If `balance` was seen before at index `first[balance]`, update the best with `i − first[balance]`; otherwise record `first[balance] = i`.',
          'Return the best.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass. The balance stays in `−n..n`, so an array of 2n + 1 slots (or a hash map) stores the first indices. Keeping only the first index is what makes the length maximal.',
        code: {
          java: r`class Solution {
    public int findMaxLength(int[] nums) {
        int n = nums.length, best = 0, balance = 0;
        int[] first = new int[2 * n + 1];
        Arrays.fill(first, -2);
        first[n] = -1;
        for (int i = 0; i < n; i++) {
            balance += nums[i] == 1 ? 1 : -1;
            if (first[balance + n] != -2) best = Math.max(best, i - first[balance + n]);
            else first[balance + n] = i;
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int findMaxLength(vector<int>& nums) {
        int n = nums.size(), best = 0, balance = 0;
        vector<int> first(2 * n + 1, -2);
        first[n] = -1;
        for (int i = 0; i < n; i++) {
            balance += nums[i] == 1 ? 1 : -1;
            if (first[balance + n] != -2) best = max(best, i - first[balance + n]);
            else first[balance + n] = i;
        }
        return best;
    }
};`,
          python: r`class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        first = {0: -1}
        best = balance = 0
        for i, x in enumerate(nums):
            balance += 1 if x == 1 else -1
            if balance in first:
                best = max(best, i - first[balance])
            else:
                first[balance] = i
        return best`,
          javascript: r`var findMaxLength = function(nums) {
    const first = new Map([[0, -1]]);
    let best = 0, balance = 0;
    for (let i = 0; i < nums.length; i++) {
        balance += nums[i] === 1 ? 1 : -1;
        if (first.has(balance)) best = Math.max(best, i - first.get(balance));
        else first.set(balance, i);
    }
    return best;
};`,
        },
      },
    ],
  },

  'product-of-array-except-self': {
    pattern: 'Prefix and suffix products (everything to the left × everything to the right)',
    approaches: [
      {
        level: 'Brute force', name: 'Multiply all the others for each index',
        idea: 'For each index, multiply every other element.',
        steps: [
          'For each `i`, set `p = 1`.',
          'Multiply `p` by `nums[j]` for every `j != i`.',
          'Store `p` in `answer[i]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n products of n − 1 factors each (the output array is not counted as extra space).',
        code: {
          java: r`class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        for (int i = 0; i < n; i++) {
            int p = 1;
            for (int j = 0; j < n; j++) if (j != i) p *= nums[j];
            answer[i] = p;
        }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n);
        for (int i = 0; i < n; i++) {
            int p = 1;
            for (int j = 0; j < n; j++) if (j != i) p *= nums[j];
            answer[i] = p;
        }
        return answer;
    }
};`,
          python: r`class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = []
        for i in range(n):
            p = 1
            for j in range(n):
                if j != i:
                    p *= nums[j]
            answer.append(p)
        return answer`,
          javascript: r`var productExceptSelf = function(nums) {
    const n = nums.length, answer = new Array(n);
    for (let i = 0; i < n; i++) {
        let p = 1;
        for (let j = 0; j < n; j++) if (j !== i) p *= nums[j];
        answer[i] = p;
    }
    return answer;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix and suffix product arrays',
        idea: 'The product of all except `nums[i]` is (product of everything left of `i`) × (product of everything right of `i`). Precompute both.',
        steps: [
          '`left[0] = 1`, `left[i] = left[i − 1] × nums[i − 1]`.',
          '`right[n − 1] = 1`, `right[i] = right[i + 1] × nums[i + 1]`.',
          '`answer[i] = left[i] × right[i]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Three linear passes, with two extra arrays of size n. No division, so zeros are no problem.',
        code: {
          java: r`class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] left = new int[n], right = new int[n], answer = new int[n];
        left[0] = 1;
        for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
        right[n - 1] = 1;
        for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
        for (int i = 0; i < n; i++) answer[i] = left[i] * right[i];
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> left(n, 1), right(n, 1), answer(n);
        for (int i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
        for (int i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
        for (int i = 0; i < n; i++) answer[i] = left[i] * right[i];
        return answer;
    }
};`,
          python: r`class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        left, right = [1] * n, [1] * n
        for i in range(1, n):
            left[i] = left[i - 1] * nums[i - 1]
        for i in range(n - 2, -1, -1):
            right[i] = right[i + 1] * nums[i + 1]
        return [left[i] * right[i] for i in range(n)]`,
          javascript: r`var productExceptSelf = function(nums) {
    const n = nums.length, left = new Array(n).fill(1), right = new Array(n).fill(1);
    for (let i = 1; i < n; i++) left[i] = left[i - 1] * nums[i - 1];
    for (let i = n - 2; i >= 0; i--) right[i] = right[i + 1] * nums[i + 1];
    return left.map((l, i) => l * right[i]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Prefix products in the output, suffix product on the fly',
        idea: 'Write the prefix products straight into the answer array, then sweep from the right with a single running suffix product and multiply it in.',
        steps: [
          'Fill `answer[i]` with the product of everything left of `i` (`answer[0] = 1`).',
          'Set `suffix = 1`. For `i` from n − 1 down to 0: `answer[i] *= suffix`, then `suffix *= nums[i]`.',
          'Return `answer`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes; apart from the required output array, only one integer is used.',
        code: {
          java: r`class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        answer[0] = 1;
        for (int i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= suffix;
            suffix *= nums[i];
        }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);
        for (int i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= suffix;
            suffix *= nums[i];
        }
        return answer;
    }
};`,
          python: r`class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n
        for i in range(1, n):
            answer[i] = answer[i - 1] * nums[i - 1]
        suffix = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= suffix
            suffix *= nums[i]
        return answer`,
          javascript: r`var productExceptSelf = function(nums) {
    const n = nums.length, answer = new Array(n).fill(1);
    for (let i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
    let suffix = 1;
    for (let i = n - 1; i >= 0; i--) {
        answer[i] *= suffix;
        suffix *= nums[i];
    }
    return answer;
};`,
        },
      },
    ],
  },

  'range-sum-query-2d-immutable': {
    pattern: '2D prefix sums (inclusion–exclusion over four corners)',
    approaches: [
      {
        level: 'Brute force', name: 'Add up the rectangle on every query',
        idea: 'Store the grid and loop over every cell of the requested rectangle on each call.',
        steps: [
          'The constructor stores the matrix.',
          '`sumRegion` adds every `matrix[r][c]` with `row1 <= r <= row2` and `col1 <= c <= col2`.',
        ],
        time: 'O(m·n) per query', space: 'O(1)',
        why: 'A query can cover the whole m × n grid; with 10⁴ queries on a 200 × 200 grid that is 4 × 10⁸ additions.',
        code: {
          java: r`class NumMatrix {
    private final int[][] m;

    public NumMatrix(int[][] matrix) {
        m = matrix;
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        int sum = 0;
        for (int r = row1; r <= row2; r++)
            for (int c = col1; c <= col2; c++) sum += m[r][c];
        return sum;
    }
}`,
          cpp: r`class NumMatrix {
    vector<vector<int>> m;
public:
    NumMatrix(vector<vector<int>>& matrix) : m(matrix) {}

    int sumRegion(int row1, int col1, int row2, int col2) {
        int sum = 0;
        for (int r = row1; r <= row2; r++)
            for (int c = col1; c <= col2; c++) sum += m[r][c];
        return sum;
    }
};`,
          python: r`class NumMatrix:

    def __init__(self, matrix: List[List[int]]):
        self.m = matrix

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return sum(self.m[r][c] for r in range(row1, row2 + 1) for c in range(col1, col2 + 1))`,
          javascript: r`var NumMatrix = function(matrix) {
    this.m = matrix;
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    let sum = 0;
    for (let r = row1; r <= row2; r++)
        for (let c = col1; c <= col2; c++) sum += this.m[r][c];
    return sum;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix sums for each row',
        idea: 'Build a 1D prefix sum for every row; a rectangle is then the sum of one O(1) row-range query per row.',
        steps: [
          'For each row `r`, build `rowPrefix[r][c + 1] = rowPrefix[r][c] + matrix[r][c]`.',
          '`sumRegion` adds `rowPrefix[r][col2 + 1] − rowPrefix[r][col1]` for each `r` from `row1` to `row2`.',
        ],
        time: 'O(m) per query', space: 'O(m·n)',
        why: 'Building is O(m·n) once; each query touches one entry pair per row.',
        code: {
          java: r`class NumMatrix {
    private final int[][] rowPrefix;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        rowPrefix = new int[m][n + 1];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) rowPrefix[r][c + 1] = rowPrefix[r][c] + matrix[r][c];
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        int sum = 0;
        for (int r = row1; r <= row2; r++) sum += rowPrefix[r][col2 + 1] - rowPrefix[r][col1];
        return sum;
    }
}`,
          cpp: r`class NumMatrix {
    vector<vector<int>> rowPrefix;
public:
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        rowPrefix.assign(m, vector<int>(n + 1, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) rowPrefix[r][c + 1] = rowPrefix[r][c] + matrix[r][c];
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        int sum = 0;
        for (int r = row1; r <= row2; r++) sum += rowPrefix[r][col2 + 1] - rowPrefix[r][col1];
        return sum;
    }
};`,
          python: r`class NumMatrix:

    def __init__(self, matrix: List[List[int]]):
        self.rows = []
        for row in matrix:
            p = [0]
            for x in row:
                p.append(p[-1] + x)
            self.rows.append(p)

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return sum(self.rows[r][col2 + 1] - self.rows[r][col1] for r in range(row1, row2 + 1))`,
          javascript: r`var NumMatrix = function(matrix) {
    this.rows = matrix.map((row) => {
        const p = [0];
        for (const x of row) p.push(p[p.length - 1] + x);
        return p;
    });
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    let sum = 0;
    for (let r = row1; r <= row2; r++) sum += this.rows[r][col2 + 1] - this.rows[r][col1];
    return sum;
};`,
        },
      },
      {
        level: 'Optimal', name: '2D prefix sums',
        idea: 'Let `P[r][c]` be the sum of the rectangle from `(0, 0)` to `(r − 1, c − 1)`. Any rectangle is then four lookups: the big corner minus the strip above, minus the strip to the left, plus the overlap that was subtracted twice.',
        steps: [
          'Build `P` of size (m + 1) × (n + 1): `P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] − P[r][c]`.',
          '`sumRegion` returns `P[row2 + 1][col2 + 1] − P[row1][col2 + 1] − P[row2 + 1][col1] + P[row1][col1]`.',
        ],
        time: 'O(1) per query', space: 'O(m·n)',
        why: 'Building is O(m·n) once; each query is four array reads. The extra zero row and column remove edge cases.',
        code: {
          java: r`class NumMatrix {
    private final int[][] P;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        P = new int[m + 1][n + 1];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
    }
}`,
          cpp: r`class NumMatrix {
    vector<vector<int>> P;
public:
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        P.assign(m + 1, vector<int>(n + 1, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
    }
};`,
          python: r`class NumMatrix:

    def __init__(self, matrix: List[List[int]]):
        m, n = len(matrix), len(matrix[0])
        self.P = P = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(m):
            for c in range(n):
                P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        P = self.P
        return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1]`,
          javascript: r`var NumMatrix = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const P = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    this.P = P;
};

NumMatrix.prototype.sumRegion = function(row1, col1, row2, col2) {
    const P = this.P;
    return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
};`,
        },
      },
    ],
  },

  'corporate-flight-bookings': {
    pattern: 'Difference array (range update in O(1), then one prefix sum)',
    approaches: [
      {
        level: 'Brute force', name: 'Add the seats to every flight in each booking',
        idea: 'For each booking, loop over flights `first..last` and add `seats` to each.',
        steps: [
          'Create `answer` of length n filled with 0.',
          'For each booking `[first, last, seats]`, add `seats` to `answer[first − 1 .. last − 1]`.',
          'Return `answer`.',
        ],
        time: 'O(b·n)', space: 'O(1)',
        why: 'Each of the b bookings can span all n flights: up to 4 × 10⁸ additions here. Only the output array is used.',
        code: {
          java: r`class Solution {
    public int[] corpFlightBookings(int[][] bookings, int n) {
        int[] answer = new int[n];
        for (int[] b : bookings)
            for (int f = b[0]; f <= b[1]; f++) answer[f - 1] += b[2];
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
        vector<int> answer(n, 0);
        for (auto& b : bookings)
            for (int f = b[0]; f <= b[1]; f++) answer[f - 1] += b[2];
        return answer;
    }
};`,
          python: r`class Solution:
    def corpFlightBookings(self, bookings: List[List[int]], n: int) -> List[int]:
        answer = [0] * n
        for first, last, seats in bookings:
            for f in range(first - 1, last):
                answer[f] += seats
        return answer`,
          javascript: r`var corpFlightBookings = function(bookings, n) {
    const answer = new Array(n).fill(0);
    for (const [first, last, seats] of bookings)
        for (let f = first; f <= last; f++) answer[f - 1] += seats;
    return answer;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Difference array, then prefix sum',
        idea: 'Record only where each booking starts and stops: `+seats` at the first flight and `−seats` just after the last. A prefix sum over these marks rebuilds every flight\'s total.',
        steps: [
          'Create `diff` of length n + 1 filled with 0.',
          'For each booking: `diff[first − 1] += seats` and `diff[last] −= seats`.',
          'Take the running sum of `diff[0..n − 1]`; element `i` is the total for flight `i + 1`.',
        ],
        time: 'O(n + b)', space: 'O(n)',
        why: 'Each booking costs O(1); the final prefix sum is O(n). The extra slot at index n absorbs bookings that end at the last flight.',
        code: {
          java: r`class Solution {
    public int[] corpFlightBookings(int[][] bookings, int n) {
        int[] diff = new int[n + 1];
        for (int[] b : bookings) {
            diff[b[0] - 1] += b[2];
            diff[b[1]] -= b[2];
        }
        int[] answer = new int[n];
        int running = 0;
        for (int i = 0; i < n; i++) answer[i] = running += diff[i];
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
        vector<int> diff(n + 1, 0);
        for (auto& b : bookings) {
            diff[b[0] - 1] += b[2];
            diff[b[1]] -= b[2];
        }
        vector<int> answer(n);
        int running = 0;
        for (int i = 0; i < n; i++) answer[i] = running += diff[i];
        return answer;
    }
};`,
          python: r`class Solution:
    def corpFlightBookings(self, bookings: List[List[int]], n: int) -> List[int]:
        diff = [0] * (n + 1)
        for first, last, seats in bookings:
            diff[first - 1] += seats
            diff[last] -= seats
        return list(accumulate(diff[:n]))`,
          javascript: r`var corpFlightBookings = function(bookings, n) {
    const diff = new Array(n + 1).fill(0);
    for (const [first, last, seats] of bookings) {
        diff[first - 1] += seats;
        diff[last] -= seats;
    }
    const answer = new Array(n);
    let running = 0;
    for (let i = 0; i < n; i++) answer[i] = running += diff[i];
    return answer;
};`,
        },
      },
    ],
  },

  'number-of-submatrices-that-sum-to-target': {
    pattern: 'Fix a pair of rows, collapse to 1D, then prefix sum + hash map (Subarray Sum Equals K)',
    approaches: [
      {
        level: 'Brute force', name: 'Every rectangle, summed with 2D prefix sums',
        idea: 'Enumerate all rectangles by their top-left and bottom-right corners and get each sum in O(1) from a 2D prefix-sum table.',
        steps: [
          'Build the 2D prefix table `P` (as in Range Sum Query 2D).',
          'For every `r1 <= r2` and `c1 <= c2`, compute the rectangle sum with four lookups.',
          'Count the rectangles whose sum equals `target`.',
        ],
        time: 'O(m²·n²)', space: 'O(m·n)',
        why: 'There are about m²n²/4 rectangles, each O(1). For a 100 × 100 grid that is about 2.5 × 10⁷ — fine here, but it grows fast.',
        code: {
          java: r`class Solution {
    public int numSubmatrixSumTarget(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length, count = 0;
        int[][] P = new int[m + 1][n + 1];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
        for (int r1 = 0; r1 < m; r1++)
            for (int r2 = r1; r2 < m; r2++)
                for (int c1 = 0; c1 < n; c1++)
                    for (int c2 = c1; c2 < n; c2++)
                        if (P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1] == target) count++;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int numSubmatrixSumTarget(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size(), count = 0;
        vector<vector<int>> P(m + 1, vector<int>(n + 1, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
        for (int r1 = 0; r1 < m; r1++)
            for (int r2 = r1; r2 < m; r2++)
                for (int c1 = 0; c1 < n; c1++)
                    for (int c2 = c1; c2 < n; c2++)
                        if (P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1] == target) count++;
        return count;
    }
};`,
          python: r`class Solution:
    def numSubmatrixSumTarget(self, matrix: List[List[int]], target: int) -> int:
        m, n = len(matrix), len(matrix[0])
        P = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(m):
            for c in range(n):
                P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
        count = 0
        for r1 in range(m):
            for r2 in range(r1, m):
                for c1 in range(n):
                    for c2 in range(c1, n):
                        if P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1] == target:
                            count += 1
        return count`,
          javascript: r`var numSubmatrixSumTarget = function(matrix, target) {
    const m = matrix.length, n = matrix[0].length;
    const P = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    let count = 0;
    for (let r1 = 0; r1 < m; r1++)
        for (let r2 = r1; r2 < m; r2++)
            for (let c1 = 0; c1 < n; c1++)
                for (let c2 = c1; c2 < n; c2++)
                    if (P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1] === target) count++;
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fix the top and bottom rows, then count 1D subarrays',
        idea: 'Once the top row `r1` and bottom row `r2` are fixed, each column contributes one number: its sum between those rows. Rectangles between `r1` and `r2` are then subarrays of that column-sum array, counted with prefix sums and a hash map in O(n).',
        steps: [
          'For each top row `r1`, start a column-sum array `col` of zeros.',
          'For each bottom row `r2 >= r1`, add row `r2` into `col` (so `col[c]` is the sum of column `c` from `r1` to `r2`).',
          'Count subarrays of `col` summing to `target`: running sum `s`, map `seen` with `seen[0] = 1`; add `seen[s − target]`, then increase `seen[s]`.',
          'Add up the counts over all row pairs.',
        ],
        time: 'O(m²·n)', space: 'O(n)',
        why: 'm(m + 1)/2 row pairs, each doing O(n) work (updating `col` and one hash-map pass). If the matrix has more rows than columns, fixing column pairs instead gives O(n²·m).',
        code: {
          java: r`class Solution {
    public int numSubmatrixSumTarget(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length, count = 0;
        for (int r1 = 0; r1 < m; r1++) {
            int[] col = new int[n];
            for (int r2 = r1; r2 < m; r2++) {
                for (int c = 0; c < n; c++) col[c] += matrix[r2][c];
                Map<Integer, Integer> seen = new HashMap<>();
                seen.put(0, 1);
                int s = 0;
                for (int c = 0; c < n; c++) {
                    s += col[c];
                    count += seen.getOrDefault(s - target, 0);
                    seen.merge(s, 1, Integer::sum);
                }
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int numSubmatrixSumTarget(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size(), count = 0;
        for (int r1 = 0; r1 < m; r1++) {
            vector<int> col(n, 0);
            for (int r2 = r1; r2 < m; r2++) {
                for (int c = 0; c < n; c++) col[c] += matrix[r2][c];
                unordered_map<int, int> seen{{0, 1}};
                int s = 0;
                for (int c = 0; c < n; c++) {
                    s += col[c];
                    auto it = seen.find(s - target);
                    if (it != seen.end()) count += it->second;
                    seen[s]++;
                }
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def numSubmatrixSumTarget(self, matrix: List[List[int]], target: int) -> int:
        m, n = len(matrix), len(matrix[0])
        count = 0
        for r1 in range(m):
            col = [0] * n
            for r2 in range(r1, m):
                row = matrix[r2]
                for c in range(n):
                    col[c] += row[c]
                seen = defaultdict(int)
                seen[0] = 1
                s = 0
                for v in col:
                    s += v
                    count += seen[s - target]
                    seen[s] += 1
        return count`,
          javascript: r`var numSubmatrixSumTarget = function(matrix, target) {
    const m = matrix.length, n = matrix[0].length;
    let count = 0;
    for (let r1 = 0; r1 < m; r1++) {
        const col = new Array(n).fill(0);
        for (let r2 = r1; r2 < m; r2++) {
            for (let c = 0; c < n; c++) col[c] += matrix[r2][c];
            const seen = new Map([[0, 1]]);
            let s = 0;
            for (let c = 0; c < n; c++) {
                s += col[c];
                count += seen.get(s - target) ?? 0;
                seen.set(s, (seen.get(s) ?? 0) + 1);
            }
        }
    }
    return count;
};`,
        },
      },
    ],
  },
};
