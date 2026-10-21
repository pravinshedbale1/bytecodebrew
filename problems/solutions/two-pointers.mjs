const r = String.raw;

export default {
  'valid-palindrome': {
    pattern: 'Two pointers moving inwards from both ends',
    approaches: [
      {
        level: 'Brute force', name: 'Clean a copy, then compare it with its reverse',
        idea: 'Build the string the question actually talks about (only letters and digits, lower-cased) and check it against its reverse.',
        steps: [
          'Walk through `s` and append every letter or digit, lower-cased, to a builder.',
          'Make a reversed copy of the cleaned string.',
          'The answer is whether the cleaned string equals its reverse.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass to clean, one to reverse and one to compare: O(n) time. The cleaned copy and its reverse take O(n) extra memory.',
        code: {
          java: r`class Solution {
    public boolean isPalindrome(String s) {
        StringBuilder clean = new StringBuilder();
        for (char c : s.toCharArray())
            if (Character.isLetterOrDigit(c)) clean.append(Character.toLowerCase(c));
        String forward = clean.toString();
        return forward.equals(clean.reverse().toString());
    }
}`,
          cpp: r`class Solution {
public:
    bool isPalindrome(string s) {
        string clean;
        for (char c : s)
            if (isalnum((unsigned char) c)) clean += (char) tolower((unsigned char) c);
        string rev(clean.rbegin(), clean.rend());
        return clean == rev;
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, s: str) -> bool:
        clean = [c.lower() for c in s if c.isalnum()]
        return clean == clean[::-1]`,
          javascript: r`var isPalindrome = function(s) {
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers that skip what does not count',
        idea: 'Compare the string from both ends at once, skipping characters that are not letters or digits, so no copy is needed.',
        steps: [
          'Put `i` at the first character and `j` at the last.',
          'While `i < j`: if `s[i]` is not a letter or digit, move `i` right; if `s[j]` is not, move `j` left.',
          'Otherwise compare the two characters lower-cased. If they differ, return false; if they match, move both pointers inwards.',
          'If the pointers meet without a mismatch, return true.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Every step moves at least one pointer towards the other, so there are at most n steps. Only two indices are stored.',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    bool isPalindrome(string s) {
        int i = 0, j = (int) s.size() - 1;
        while (i < j) {
            if (!isalnum((unsigned char) s[i])) i++;
            else if (!isalnum((unsigned char) s[j])) j--;
            else if (tolower((unsigned char) s[i++]) != tolower((unsigned char) s[j--])) return false;
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, s: str) -> bool:
        i, j = 0, len(s) - 1
        while i < j:
            if not s[i].isalnum():
                i += 1
            elif not s[j].isalnum():
                j -= 1
            elif s[i].lower() != s[j].lower():
                return False
            else:
                i += 1
                j -= 1
        return True`,
          javascript: r`var isPalindrome = function(s) {
    const ok = (c) => /[a-z0-9]/i.test(c);
    let i = 0, j = s.length - 1;
    while (i < j) {
        if (!ok(s[i])) i++;
        else if (!ok(s[j])) j--;
        else if (s[i++].toLowerCase() !== s[j--].toLowerCase()) return false;
    }
    return true;
};`,
        },
      },
    ],
  },

  'remove-duplicates-from-sorted-array': {
    pattern: 'Read and write pointers (in-place compaction)',
    approaches: [
      {
        level: 'Brute force', name: 'Collect the distinct values, then copy them back',
        idea: 'Gather each value once in a separate list (the array is sorted, so a value is new when it differs from the last one kept), then write that list over the front of the array.',
        steps: [
          'Create an empty list `unique`.',
          'For each value in `nums`, append it if `unique` is empty or its last element is different.',
          'Copy `unique` into the first positions of `nums`.',
          'Return the size of `unique`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes. The extra list can hold all n values when they are all different, so O(n) memory, which the in-place requirement rules out.',
        code: {
          java: r`class Solution {
    public int removeDuplicates(int[] nums) {
        List<Integer> unique = new ArrayList<>();
        for (int x : nums)
            if (unique.isEmpty() || unique.get(unique.size() - 1) != x) unique.add(x);
        for (int i = 0; i < unique.size(); i++) nums[i] = unique.get(i);
        return unique.size();
    }
}`,
          cpp: r`class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        vector<int> unique;
        for (int x : nums)
            if (unique.empty() || unique.back() != x) unique.push_back(x);
        for (int i = 0; i < (int) unique.size(); i++) nums[i] = unique[i];
        return unique.size();
    }
};`,
          python: r`class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        unique = []
        for x in nums:
            if not unique or unique[-1] != x:
                unique.append(x)
        nums[:len(unique)] = unique
        return len(unique)`,
          javascript: r`var removeDuplicates = function(nums) {
    const unique = [];
    for (const x of nums)
        if (unique.length === 0 || unique[unique.length - 1] !== x) unique.push(x);
    for (let i = 0; i < unique.length; i++) nums[i] = unique[i];
    return unique.length;
};`,
        },
      },
      {
        level: 'Optimal', name: 'A write pointer behind the read pointer',
        idea: 'The front of the array is the output. A write index `w` marks where the next distinct value goes; because the array is sorted, a value is new exactly when it differs from the last value written.',
        steps: [
          'Start with `w = 0`.',
          'Read every value `x` from left to right.',
          'If `w == 0` or `nums[w - 1] != x`, write `x` at `nums[w]` and increase `w`.',
          'Return `w`; the first `w` slots hold the distinct values in order.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass over the array, and `w` never passes the read position, so writes never overwrite a value that is still to be read. Only one index is stored.',
        code: {
          java: r`class Solution {
    public int removeDuplicates(int[] nums) {
        int w = 0;
        for (int x : nums)
            if (w == 0 || nums[w - 1] != x) nums[w++] = x;
        return w;
    }
}`,
          cpp: r`class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int w = 0;
        for (int x : nums)
            if (w == 0 || nums[w - 1] != x) nums[w++] = x;
        return w;
    }
};`,
          python: r`class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        w = 0
        for x in nums:
            if w == 0 or nums[w - 1] != x:
                nums[w] = x
                w += 1
        return w`,
          javascript: r`var removeDuplicates = function(nums) {
    let w = 0;
    for (const x of nums)
        if (w === 0 || nums[w - 1] !== x) nums[w++] = x;
    return w;
};`,
        },
      },
    ],
  },

  'move-zeroes': {
    pattern: 'Read and write pointers (stable partition in place)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the non-zeros into a new array',
        idea: 'Build the answer in a second array (non-zeros first, in order, then zeros) and copy it back.',
        steps: [
          'Create an array `out` of the same length, filled with zeros.',
          'Copy each non-zero value of `nums` into the next free slot of `out`.',
          'The remaining slots of `out` are already 0.',
          'Copy `out` back into `nums`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes; the second array costs O(n) memory, which the in-place requirement forbids.',
        code: {
          java: r`class Solution {
    public void moveZeroes(int[] nums) {
        int[] out = new int[nums.length];
        int k = 0;
        for (int x : nums) if (x != 0) out[k++] = x;
        System.arraycopy(out, 0, nums, 0, nums.length);
    }
}`,
          cpp: r`class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        vector<int> out(nums.size(), 0);
        int k = 0;
        for (int x : nums) if (x != 0) out[k++] = x;
        nums = out;
    }
};`,
          python: r`class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        out = [x for x in nums if x != 0]
        out += [0] * (len(nums) - len(out))
        nums[:] = out`,
          javascript: r`var moveZeroes = function(nums) {
    const out = nums.filter((x) => x !== 0);
    while (out.length < nums.length) out.push(0);
    for (let i = 0; i < nums.length; i++) nums[i] = out[i];
};`,
        },
      },
      {
        level: 'Better', name: 'Write the non-zeros forward, then fill with zeros',
        idea: 'Use the front of the same array as the output: a write index collects non-zeros in order, and everything after it becomes 0.',
        steps: [
          'Set `w = 0`.',
          'For each value `x`, if it is not 0, write it to `nums[w]` and increase `w`.',
          'Set every position from `w` to the end to 0.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes at most, no extra array. It may write zeros over positions that were already zero, which the one-pass swap below avoids.',
        code: {
          java: r`class Solution {
    public void moveZeroes(int[] nums) {
        int w = 0;
        for (int x : nums) if (x != 0) nums[w++] = x;
        while (w < nums.length) nums[w++] = 0;
    }
}`,
          cpp: r`class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int w = 0;
        for (int x : nums) if (x != 0) nums[w++] = x;
        while (w < (int) nums.size()) nums[w++] = 0;
    }
};`,
          python: r`class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        w = 0
        for x in nums:
            if x != 0:
                nums[w] = x
                w += 1
        for i in range(w, len(nums)):
            nums[i] = 0`,
          javascript: r`var moveZeroes = function(nums) {
    let w = 0;
    for (const x of nums) if (x !== 0) nums[w++] = x;
    while (w < nums.length) nums[w++] = 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass, swapping each non-zero forward',
        idea: 'Keep the invariant that `nums[0..w)` holds the non-zeros seen so far and `nums[w..i)` holds only zeros. A non-zero at `i` swaps with the first zero at `w`.',
        steps: [
          'Set `w = 0`.',
          'For `i` from 0 to n − 1: if `nums[i] != 0`, swap `nums[i]` and `nums[w]`, then increase `w`.',
          'When the loop ends, all non-zeros are at the front in their original order and the zeros are behind them.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'A single pass with constant extra memory. Each element is written at most twice, and an array with few zeros needs few real moves.',
        code: {
          java: r`class Solution {
    public void moveZeroes(int[] nums) {
        for (int i = 0, w = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                int t = nums[i]; nums[i] = nums[w]; nums[w] = t;
                w++;
            }
        }
    }
}`,
          cpp: r`class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        for (int i = 0, w = 0; i < (int) nums.size(); i++)
            if (nums[i] != 0) swap(nums[i], nums[w++]);
    }
};`,
          python: r`class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        w = 0
        for i in range(len(nums)):
            if nums[i] != 0:
                nums[i], nums[w] = nums[w], nums[i]
                w += 1`,
          javascript: r`var moveZeroes = function(nums) {
    for (let i = 0, w = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            [nums[i], nums[w]] = [nums[w], nums[i]];
            w++;
        }
    }
};`,
        },
      },
    ],
  },

  'squares-of-a-sorted-array': {
    pattern: 'Two pointers from both ends, filling the output from the back',
    approaches: [
      {
        level: 'Brute force', name: 'Square everything, then sort',
        idea: 'Squaring breaks the order (negatives become large), so square each value and sort the result.',
        steps: [
          'Create `out` with `out[i] = nums[i] * nums[i]`.',
          'Sort `out` in ascending order.',
          'Return `out`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Squaring is O(n); the sort dominates at O(n log n). The output array is O(n) (plus the sort\'s own stack).',
        code: {
          java: r`class Solution {
    public int[] sortedSquares(int[] nums) {
        int[] out = new int[nums.length];
        for (int i = 0; i < nums.length; i++) out[i] = nums[i] * nums[i];
        Arrays.sort(out);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        vector<int> out;
        for (int x : nums) out.push_back(x * x);
        sort(out.begin(), out.end());
        return out;
    }
};`,
          python: r`class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        return sorted(x * x for x in nums)`,
          javascript: r`var sortedSquares = function(nums) {
    return nums.map((x) => x * x).sort((a, b) => a - b);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers, largest square first',
        idea: 'In a sorted array the largest square is always at one of the two ends (the most negative or the most positive value). Take the bigger end each time and fill the output from the back.',
        steps: [
          'Set `i = 0`, `j = n − 1`, and fill position `w` from n − 1 down to 0.',
          'Compare `|nums[i]|` and `|nums[j]|`.',
          'Write the square of the larger one at `out[w]` and move that pointer inwards.',
          'Repeat until `w` passes 0; `out` is sorted ascending.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each step places one value, so n steps. The output array is required by the problem; besides it only three indices are used, O(1) extra.',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size(), i = 0, j = n - 1;
        vector<int> out(n);
        for (int w = n - 1; w >= 0; w--) {
            if (abs(nums[i]) > abs(nums[j])) { out[w] = nums[i] * nums[i]; i++; }
            else { out[w] = nums[j] * nums[j]; j--; }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        n = len(nums)
        i, j = 0, n - 1
        out = [0] * n
        for w in range(n - 1, -1, -1):
            if abs(nums[i]) > abs(nums[j]):
                out[w] = nums[i] * nums[i]
                i += 1
            else:
                out[w] = nums[j] * nums[j]
                j -= 1
        return out`,
          javascript: r`var sortedSquares = function(nums) {
    const n = nums.length, out = new Array(n);
    let i = 0, j = n - 1;
    for (let w = n - 1; w >= 0; w--) {
        if (Math.abs(nums[i]) > Math.abs(nums[j])) { out[w] = nums[i] * nums[i]; i++; }
        else { out[w] = nums[j] * nums[j]; j--; }
    }
    return out;
};`,
        },
      },
    ],
  },

  'two-sum-ii-input-array-is-sorted': {
    pattern: 'Two pointers on a sorted array (shrink from the side that is too big or too small)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every pair',
        idea: 'Check every pair of positions and return the first one that adds up to the target.',
        steps: [
          'For each `i` from 0 to n − 1, and each `j` from `i + 1` to n − 1:',
          'If `numbers[i] + numbers[j] == target`, return `[i + 1, j + 1]` (positions count from 1).',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'There are n(n − 1)/2 pairs. It ignores the fact that the array is sorted.',
        code: {
          java: r`class Solution {
    public int[] twoSum(int[] numbers, int target) {
        for (int i = 0; i < numbers.length; i++)
            for (int j = i + 1; j < numbers.length; j++)
                if (numbers[i] + numbers[j] == target) return new int[] { i + 1, j + 1 };
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int n = numbers.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (numbers[i] + numbers[j] == target) return {i + 1, j + 1};
        return {};
    }
};`,
          python: r`class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        n = len(numbers)
        for i in range(n):
            for j in range(i + 1, n):
                if numbers[i] + numbers[j] == target:
                    return [i + 1, j + 1]
        return []`,
          javascript: r`var twoSum = function(numbers, target) {
    for (let i = 0; i < numbers.length; i++)
        for (let j = i + 1; j < numbers.length; j++)
            if (numbers[i] + numbers[j] === target) return [i + 1, j + 1];
    return [];
};`,
        },
      },
      {
        level: 'Better', name: 'Binary search for the partner',
        idea: 'For each value, the partner it needs is `target − numbers[i]`. The array is sorted, so binary search for it to the right of `i`.',
        steps: [
          'For each `i`, let `need = target − numbers[i]`.',
          'Binary search `need` in `numbers[i + 1 .. n − 1]`.',
          'If found at `j`, return `[i + 1, j + 1]`.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'n binary searches of O(log n) each. Searching only to the right of `i` avoids using the same element twice.',
        code: {
          java: r`class Solution {
    public int[] twoSum(int[] numbers, int target) {
        for (int i = 0; i < numbers.length; i++) {
            int need = target - numbers[i], lo = i + 1, hi = numbers.length - 1;
            while (lo <= hi) {
                int mid = lo + (hi - lo) / 2;
                if (numbers[mid] == need) return new int[] { i + 1, mid + 1 };
                if (numbers[mid] < need) lo = mid + 1; else hi = mid - 1;
            }
        }
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int n = numbers.size();
        for (int i = 0; i < n; i++) {
            int need = target - numbers[i], lo = i + 1, hi = n - 1;
            while (lo <= hi) {
                int mid = lo + (hi - lo) / 2;
                if (numbers[mid] == need) return {i + 1, mid + 1};
                if (numbers[mid] < need) lo = mid + 1; else hi = mid - 1;
            }
        }
        return {};
    }
};`,
          python: r`class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        n = len(numbers)
        for i in range(n):
            need = target - numbers[i]
            j = bisect_left(numbers, need, i + 1)
            if j < n and numbers[j] == need:
                return [i + 1, j + 1]
        return []`,
          javascript: r`var twoSum = function(numbers, target) {
    for (let i = 0; i < numbers.length; i++) {
        const need = target - numbers[i];
        let lo = i + 1, hi = numbers.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (numbers[mid] === need) return [i + 1, mid + 1];
            if (numbers[mid] < need) lo = mid + 1; else hi = mid - 1;
        }
    }
    return [];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers from both ends',
        idea: 'Start with the smallest and the largest value. If their sum is too small, only a bigger left value can help; if it is too big, only a smaller right value can. Each step rules out one value for good.',
        steps: [
          'Set `i = 0` and `j = n − 1`.',
          'While `i < j`, compute `sum = numbers[i] + numbers[j]`.',
          'If `sum == target`, return `[i + 1, j + 1]`.',
          'If `sum < target`, move `i` right; otherwise move `j` left.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each step moves one pointer, so at most n − 1 steps. When `sum < target`, `numbers[i]` cannot pair with anything at or left of `j` (those are all ≤ `numbers[j]`), so dropping it is safe; the other case is symmetric.',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int i = 0, j = (int) numbers.size() - 1;
        while (i < j) {
            int sum = numbers[i] + numbers[j];
            if (sum == target) return {i + 1, j + 1};
            if (sum < target) i++; else j--;
        }
        return {};
    }
};`,
          python: r`class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        i, j = 0, len(numbers) - 1
        while i < j:
            s = numbers[i] + numbers[j]
            if s == target:
                return [i + 1, j + 1]
            if s < target:
                i += 1
            else:
                j -= 1
        return []`,
          javascript: r`var twoSum = function(numbers, target) {
    let i = 0, j = numbers.length - 1;
    while (i < j) {
        const sum = numbers[i] + numbers[j];
        if (sum === target) return [i + 1, j + 1];
        if (sum < target) i++; else j--;
    }
    return [];
};`,
        },
      },
    ],
  },

  'container-with-most-water': {
    pattern: 'Two pointers from both ends (move the shorter wall)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every pair of lines',
        idea: 'The water between lines `i` and `j` is `min(height[i], height[j]) × (j − i)`. Compute it for every pair and keep the largest.',
        steps: [
          'Set `best = 0`.',
          'For every pair `i < j`, compute `min(height[i], height[j]) * (j - i)`.',
          'Keep the maximum in `best` and return it.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n − 1)/2 pairs, each O(1). With n up to 10⁵ that is about 5 × 10⁹ operations — too slow.',
        code: {
          java: r`class Solution {
    public int maxArea(int[] height) {
        int best = 0;
        for (int i = 0; i < height.length; i++)
            for (int j = i + 1; j < height.length; j++)
                best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxArea(vector<int>& height) {
        int best = 0, n = height.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                best = max(best, min(height[i], height[j]) * (j - i));
        return best;
    }
};`,
          python: r`class Solution:
    def maxArea(self, height: List[int]) -> int:
        best = 0
        n = len(height)
        for i in range(n):
            for j in range(i + 1, n):
                best = max(best, min(height[i], height[j]) * (j - i))
        return best`,
          javascript: r`var maxArea = function(height) {
    let best = 0;
    for (let i = 0; i < height.length; i++)
        for (let j = i + 1; j < height.length; j++)
            best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers, always moving the shorter line',
        idea: 'Start with the widest container. The shorter wall limits the water; keeping it and moving the taller wall inwards can only lose width without raising the level, so the shorter wall can be discarded.',
        steps: [
          'Set `i = 0`, `j = n − 1`, `best = 0`.',
          'While `i < j`: update `best` with `min(height[i], height[j]) * (j - i)`.',
          'Move the pointer at the shorter line inwards (either one if they are equal).',
          'Return `best`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each step discards one line, so n − 1 steps. Discarding the shorter line is safe: every container still using it has smaller width and a level no higher than that line.',
        code: {
          java: r`class Solution {
    public int maxArea(int[] height) {
        int i = 0, j = height.length - 1, best = 0;
        while (i < j) {
            best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
            if (height[i] < height[j]) i++; else j--;
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxArea(vector<int>& height) {
        int i = 0, j = (int) height.size() - 1, best = 0;
        while (i < j) {
            best = max(best, min(height[i], height[j]) * (j - i));
            if (height[i] < height[j]) i++; else j--;
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxArea(self, height: List[int]) -> int:
        i, j, best = 0, len(height) - 1, 0
        while i < j:
            best = max(best, min(height[i], height[j]) * (j - i))
            if height[i] < height[j]:
                i += 1
            else:
                j -= 1
        return best`,
          javascript: r`var maxArea = function(height) {
    let i = 0, j = height.length - 1, best = 0;
    while (i < j) {
        best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
        if (height[i] < height[j]) i++; else j--;
    }
    return best;
};`,
        },
      },
    ],
  },

  '3sum': {
    pattern: 'Sort, fix one value, then two pointers on the rest (k-sum reduction)',
    approaches: [
      {
        level: 'Brute force', name: 'Three nested loops and a set of sorted triplets',
        idea: 'Try every triple of positions. Sorting the array first means each triplet comes out in ascending order, so a set removes repeats.',
        steps: [
          'Sort `nums`.',
          'For every `i < j < k`, if `nums[i] + nums[j] + nums[k] == 0`, add the triplet to a set.',
          'Return the contents of the set as a list.',
        ],
        time: 'O(n³)', space: 'O(t)',
        why: 'There are about n³/6 triples. The set holds the t distinct answers.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        Set<List<Integer>> found = new HashSet<>();
        int n = nums.length;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                for (int k = j + 1; k < n; k++)
                    if (nums[i] + nums[j] + nums[k] == 0) found.add(Arrays.asList(nums[i], nums[j], nums[k]));
        return new ArrayList<>(found);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        set<vector<int>> found;
        int n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                for (int k = j + 1; k < n; k++)
                    if (nums[i] + nums[j] + nums[k] == 0) found.insert({nums[i], nums[j], nums[k]});
        return vector<vector<int>>(found.begin(), found.end());
    }
};`,
          python: r`class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        found = set()
        for i in range(n):
            for j in range(i + 1, n):
                for k in range(j + 1, n):
                    if nums[i] + nums[j] + nums[k] == 0:
                        found.add((nums[i], nums[j], nums[k]))
        return [list(t) for t in found]`,
          javascript: r`var threeSum = function(nums) {
    nums.sort((a, b) => a - b);
    const found = new Map();
    const n = nums.length;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            for (let k = j + 1; k < n; k++)
                if (nums[i] + nums[j] + nums[k] === 0) {
                    const t = [nums[i], nums[j], nums[k]];
                    found.set(t.join(','), t);
                }
    return [...found.values()];
};`,
        },
      },
      {
        level: 'Better', name: 'Fix one value, find pairs with a hash set',
        idea: 'With `nums[i]` fixed, the other two must sum to `−nums[i]`: that is Two Sum, which a hash set solves in one pass. Sorting keeps triplets in order so a set can drop repeats.',
        steps: [
          'Sort `nums`.',
          'For each `i`, skip it if `nums[i]` equals `nums[i − 1]` (same first value, same answers).',
          'Walk `j` from `i + 1` with an empty set `seen`: if `−nums[i] − nums[j]` is in `seen`, record the triplet; then add `nums[j]` to `seen`.',
          'Store triplets in a set to drop repeats, and return them.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n choices of `i`, each with an O(n) Two Sum pass. The `seen` set holds up to n values.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        Set<List<Integer>> found = new HashSet<>();
        for (int i = 0; i < nums.length; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            Set<Integer> seen = new HashSet<>();
            for (int j = i + 1; j < nums.length; j++) {
                int need = -nums[i] - nums[j];
                if (seen.contains(need)) found.add(Arrays.asList(nums[i], need, nums[j]));
                seen.add(nums[j]);
            }
        }
        return new ArrayList<>(found);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        set<vector<int>> found;
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            unordered_set<int> seen;
            for (int j = i + 1; j < n; j++) {
                int need = -nums[i] - nums[j];
                if (seen.count(need)) found.insert({nums[i], need, nums[j]});
                seen.insert(nums[j]);
            }
        }
        return vector<vector<int>>(found.begin(), found.end());
    }
};`,
          python: r`class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        found = set()
        for i in range(len(nums)):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            seen = set()
            for j in range(i + 1, len(nums)):
                need = -nums[i] - nums[j]
                if need in seen:
                    found.add((nums[i], need, nums[j]))
                seen.add(nums[j])
        return [list(t) for t in found]`,
          javascript: r`var threeSum = function(nums) {
    nums.sort((a, b) => a - b);
    const found = new Map();
    for (let i = 0; i < nums.length; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        const seen = new Set();
        for (let j = i + 1; j < nums.length; j++) {
            const need = -nums[i] - nums[j];
            if (seen.has(need)) found.set(nums[i] + ',' + need + ',' + nums[j], [nums[i], need, nums[j]]);
            seen.add(nums[j]);
        }
    }
    return [...found.values()];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort, fix one value, two pointers for the other two',
        idea: 'After sorting, fix `nums[i]` and look for a pair summing to `−nums[i]` in the part to its right with two pointers. Skipping equal neighbours removes duplicates without any set.',
        steps: [
          'Sort `nums`. For each `i` (skipping `nums[i] == nums[i − 1]`), set `l = i + 1`, `r = n − 1`.',
          'While `l < r`, compute `sum = nums[i] + nums[l] + nums[r]`.',
          'If `sum < 0`, move `l` right; if `sum > 0`, move `r` left.',
          'If `sum == 0`, record the triplet, then move `l` past every copy of `nums[l]` and `r` past every copy of `nums[r]`, and step both inwards.',
          'Return the collected triplets.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Sorting is O(n log n); each fixed `i` runs an O(n) two-pointer scan, giving O(n²). Apart from the output and the sort\'s own space, only a few indices are used.',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> out;
        int n = nums.size();
        for (int i = 0; i + 2 < n; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum < 0) l++;
                else if (sum > 0) r--;
                else {
                    out.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        out = []
        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, n - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    out.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]:
                        l += 1
                    while l < r and nums[r] == nums[r - 1]:
                        r -= 1
                    l += 1
                    r -= 1
        return out`,
          javascript: r`var threeSum = function(nums) {
    nums.sort((a, b) => a - b);
    const out = [], n = nums.length;
    for (let i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = n - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];
            if (sum < 0) l++;
            else if (sum > 0) r--;
            else {
                out.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++; r--;
            }
        }
    }
    return out;
};`,
        },
      },
    ],
  },

  'sort-colors': {
    pattern: 'Three-way partition (Dutch national flag) with three pointers',
    approaches: [
      {
        level: 'Brute force', name: 'Use a general sort',
        idea: 'Any comparison sort puts 0s, 1s and 2s in order. It works, but the problem asks you not to use the library sort, and it ignores that there are only three values.',
        steps: [
          'Sort `nums` in place with the language\'s sort.',
          'The values are only 0, 1 and 2, so the sorted array is exactly the colours grouped in order.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'A comparison sort costs O(n log n); library sorts use O(log n) stack (or more for merge-based sorts).',
        code: {
          java: r`class Solution {
    public void sortColors(int[] nums) {
        Arrays.sort(nums);
    }
}`,
          cpp: r`class Solution {
public:
    void sortColors(vector<int>& nums) {
        sort(nums.begin(), nums.end());
    }
};`,
          python: r`class Solution:
    def sortColors(self, nums: List[int]) -> None:
        nums.sort()`,
          javascript: r`var sortColors = function(nums) {
    nums.sort((a, b) => a - b);
};`,
        },
      },
      {
        level: 'Better', name: 'Count each colour, then overwrite (two passes)',
        idea: 'With only three possible values, counting how many of each there are is enough to rebuild the array (counting sort).',
        steps: [
          'Count the 0s, 1s and 2s in one pass.',
          'Overwrite the array: `count[0]` zeros, then `count[1]` ones, then `count[2]` twos.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two linear passes and a fixed array of 3 counters. It needs two passes, while the problem asks for one.',
        code: {
          java: r`class Solution {
    public void sortColors(int[] nums) {
        int[] count = new int[3];
        for (int x : nums) count[x]++;
        int w = 0;
        for (int c = 0; c < 3; c++)
            for (int k = 0; k < count[c]; k++) nums[w++] = c;
    }
}`,
          cpp: r`class Solution {
public:
    void sortColors(vector<int>& nums) {
        int count[3] = {0, 0, 0};
        for (int x : nums) count[x]++;
        int w = 0;
        for (int c = 0; c < 3; c++)
            for (int k = 0; k < count[c]; k++) nums[w++] = c;
    }
};`,
          python: r`class Solution:
    def sortColors(self, nums: List[int]) -> None:
        count = [0, 0, 0]
        for x in nums:
            count[x] += 1
        w = 0
        for c in range(3):
            for _ in range(count[c]):
                nums[w] = c
                w += 1`,
          javascript: r`var sortColors = function(nums) {
    const count = [0, 0, 0];
    for (const x of nums) count[x]++;
    let w = 0;
    for (let c = 0; c < 3; c++)
        for (let k = 0; k < count[c]; k++) nums[w++] = c;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dutch national flag: low, mid and high pointers',
        idea: 'Keep three regions: `[0, lo)` all 0s, `[lo, mid)` all 1s, `(hi, n − 1]` all 2s, with `[mid, hi]` still unknown. Look at `nums[mid]` and grow the right region.',
        steps: [
          'Set `lo = 0`, `mid = 0`, `hi = n − 1`.',
          'While `mid <= hi`: if `nums[mid] == 0`, swap it with `nums[lo]` and move both `lo` and `mid` right.',
          'If `nums[mid] == 2`, swap it with `nums[hi]` and move `hi` left — do not move `mid`, because the value swapped in has not been looked at yet.',
          'If `nums[mid] == 1`, just move `mid` right.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Every step either moves `mid` right or `hi` left, shrinking the unknown region by one, so at most n steps in one pass.',
        code: {
          java: r`class Solution {
    public void sortColors(int[] nums) {
        int lo = 0, mid = 0, hi = nums.length - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) { int t = nums[lo]; nums[lo++] = nums[mid]; nums[mid++] = t; }
            else if (nums[mid] == 2) { int t = nums[hi]; nums[hi--] = nums[mid]; nums[mid] = t; }
            else mid++;
        }
    }
}`,
          cpp: r`class Solution {
public:
    void sortColors(vector<int>& nums) {
        int lo = 0, mid = 0, hi = (int) nums.size() - 1;
        while (mid <= hi) {
            if (nums[mid] == 0) swap(nums[lo++], nums[mid++]);
            else if (nums[mid] == 2) swap(nums[mid], nums[hi--]);
            else mid++;
        }
    }
};`,
          python: r`class Solution:
    def sortColors(self, nums: List[int]) -> None:
        lo, mid, hi = 0, 0, len(nums) - 1
        while mid <= hi:
            if nums[mid] == 0:
                nums[lo], nums[mid] = nums[mid], nums[lo]
                lo += 1
                mid += 1
            elif nums[mid] == 2:
                nums[mid], nums[hi] = nums[hi], nums[mid]
                hi -= 1
            else:
                mid += 1`,
          javascript: r`var sortColors = function(nums) {
    let lo = 0, mid = 0, hi = nums.length - 1;
    while (mid <= hi) {
        if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; lo++; mid++; }
        else if (nums[mid] === 2) { [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; hi--; }
        else mid++;
    }
};`,
        },
      },
    ],
  },

  'trapping-rain-water': {
    pattern: 'Water above a bar = min(tallest on the left, tallest on the right) − its height; two pointers make it O(1) space',
    approaches: [
      {
        level: 'Brute force', name: 'For each bar, scan left and right for the tallest walls',
        idea: 'The water above bar `i` is limited by the tallest bar on its left and the tallest on its right: `min(leftMax, rightMax) − height[i]`. Compute both by scanning, separately for every bar.',
        steps: [
          'For each `i`, scan `0..i` for `leftMax` and `i..n − 1` for `rightMax` (both include `height[i]`, so the result is never negative).',
          'Add `min(leftMax, rightMax) − height[i]` to the total.',
          'Return the total.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each of the n bars scans the whole array once. Only a few variables are kept.',
        code: {
          java: r`class Solution {
    public int trap(int[] height) {
        int n = height.length, water = 0;
        for (int i = 0; i < n; i++) {
            int leftMax = 0, rightMax = 0;
            for (int k = 0; k <= i; k++) leftMax = Math.max(leftMax, height[k]);
            for (int k = i; k < n; k++) rightMax = Math.max(rightMax, height[k]);
            water += Math.min(leftMax, rightMax) - height[i];
        }
        return water;
    }
}`,
          cpp: r`class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size(), water = 0;
        for (int i = 0; i < n; i++) {
            int leftMax = 0, rightMax = 0;
            for (int k = 0; k <= i; k++) leftMax = max(leftMax, height[k]);
            for (int k = i; k < n; k++) rightMax = max(rightMax, height[k]);
            water += min(leftMax, rightMax) - height[i];
        }
        return water;
    }
};`,
          python: r`class Solution:
    def trap(self, height: List[int]) -> int:
        n, water = len(height), 0
        for i in range(n):
            left_max = max(height[:i + 1])
            right_max = max(height[i:])
            water += min(left_max, right_max) - height[i]
        return water`,
          javascript: r`var trap = function(height) {
    const n = height.length;
    let water = 0;
    for (let i = 0; i < n; i++) {
        let leftMax = 0, rightMax = 0;
        for (let k = 0; k <= i; k++) leftMax = Math.max(leftMax, height[k]);
        for (let k = i; k < n; k++) rightMax = Math.max(rightMax, height[k]);
        water += Math.min(leftMax, rightMax) - height[i];
    }
    return water;
};`,
        },
      },
      {
        level: 'Better', name: 'Precompute the tallest bar on each side',
        idea: 'The brute force recomputes the same maxima again and again. Store them: `left[i]` is the tallest bar in `0..i`, `right[i]` the tallest in `i..n − 1`.',
        steps: [
          'Fill `left` from the left: `left[i] = max(left[i − 1], height[i])`.',
          'Fill `right` from the right: `right[i] = max(right[i + 1], height[i])`.',
          'Sum `min(left[i], right[i]) − height[i]` over all `i`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Three linear passes; the two helper arrays take O(n) memory.',
        code: {
          java: r`class Solution {
    public int trap(int[] height) {
        int n = height.length, water = 0;
        int[] left = new int[n], right = new int[n];
        for (int i = 0; i < n; i++) left[i] = Math.max(i > 0 ? left[i - 1] : 0, height[i]);
        for (int i = n - 1; i >= 0; i--) right[i] = Math.max(i < n - 1 ? right[i + 1] : 0, height[i]);
        for (int i = 0; i < n; i++) water += Math.min(left[i], right[i]) - height[i];
        return water;
    }
}`,
          cpp: r`class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size(), water = 0;
        vector<int> left(n), right(n);
        for (int i = 0; i < n; i++) left[i] = max(i > 0 ? left[i - 1] : 0, height[i]);
        for (int i = n - 1; i >= 0; i--) right[i] = max(i < n - 1 ? right[i + 1] : 0, height[i]);
        for (int i = 0; i < n; i++) water += min(left[i], right[i]) - height[i];
        return water;
    }
};`,
          python: r`class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        left, right = [0] * n, [0] * n
        for i in range(n):
            left[i] = max(left[i - 1] if i > 0 else 0, height[i])
        for i in range(n - 1, -1, -1):
            right[i] = max(right[i + 1] if i < n - 1 else 0, height[i])
        return sum(min(left[i], right[i]) - height[i] for i in range(n))`,
          javascript: r`var trap = function(height) {
    const n = height.length, left = new Array(n), right = new Array(n);
    for (let i = 0; i < n; i++) left[i] = Math.max(i > 0 ? left[i - 1] : 0, height[i]);
    for (let i = n - 1; i >= 0; i--) right[i] = Math.max(i < n - 1 ? right[i + 1] : 0, height[i]);
    let water = 0;
    for (let i = 0; i < n; i++) water += Math.min(left[i], right[i]) - height[i];
    return water;
};`,
        },
      },
      {
        level: 'Better', name: 'Monotonic stack, filling water layer by layer',
        idea: 'Keep a stack of bar indices with decreasing heights. When a taller bar arrives, the bar on top of the stack is a valley floor between the new bar and the bar below it in the stack; fill that horizontal layer.',
        steps: [
          'For each index `i`: while the stack is not empty and `height[i] > height[top]`, pop `floor = top`.',
          'If the stack is now empty, there is no left wall: stop popping.',
          'Otherwise the left wall is the new top: add `(min(height[left], height[i]) − height[floor]) × (i − left − 1)`.',
          'Push `i` and continue; return the total.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is pushed once and popped at most once, so the work is O(n) in total. The stack can hold all n indices for a falling slope.',
        code: {
          java: r`class Solution {
    public int trap(int[] height) {
        Deque<Integer> stack = new ArrayDeque<>();
        int water = 0;
        for (int i = 0; i < height.length; i++) {
            while (!stack.isEmpty() && height[i] > height[stack.peek()]) {
                int floor = stack.pop();
                if (stack.isEmpty()) break;
                int left = stack.peek();
                water += (Math.min(height[left], height[i]) - height[floor]) * (i - left - 1);
            }
            stack.push(i);
        }
        return water;
    }
}`,
          cpp: r`class Solution {
public:
    int trap(vector<int>& height) {
        vector<int> st;
        int water = 0;
        for (int i = 0; i < (int) height.size(); i++) {
            while (!st.empty() && height[i] > height[st.back()]) {
                int floor = st.back(); st.pop_back();
                if (st.empty()) break;
                int left = st.back();
                water += (min(height[left], height[i]) - height[floor]) * (i - left - 1);
            }
            st.push_back(i);
        }
        return water;
    }
};`,
          python: r`class Solution:
    def trap(self, height: List[int]) -> int:
        stack, water = [], 0
        for i, h in enumerate(height):
            while stack and h > height[stack[-1]]:
                floor = stack.pop()
                if not stack:
                    break
                left = stack[-1]
                water += (min(height[left], h) - height[floor]) * (i - left - 1)
            stack.append(i)
        return water`,
          javascript: r`var trap = function(height) {
    const stack = [];
    let water = 0;
    for (let i = 0; i < height.length; i++) {
        while (stack.length && height[i] > height[stack[stack.length - 1]]) {
            const floor = stack.pop();
            if (!stack.length) break;
            const left = stack[stack.length - 1];
            water += (Math.min(height[left], height[i]) - height[floor]) * (i - left - 1);
        }
        stack.push(i);
    }
    return water;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers with running maxima',
        idea: 'Only the smaller of the two maxima matters. If `height[l] < height[r]`, the right side already has a wall at least as tall as anything on the left so far, so the water at `l` is decided by `leftMax` alone — and the same holds mirrored.',
        steps: [
          'Set `l = 0`, `r = n − 1`, `leftMax = rightMax = 0`.',
          'While `l < r`: if `height[l] < height[r]`, update `leftMax` with `height[l]`, add `leftMax − height[l]`, and move `l` right.',
          'Otherwise update `rightMax` with `height[r]`, add `rightMax − height[r]`, and move `r` left.',
          'Return the total.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with each step moving one pointer. When `height[l] < height[r]`, the true right maximum for `l` is at least `height[r] > height[l]`, and `leftMax` is the true left maximum, so `min` is `leftMax` and the water at `l` is exact.',
        code: {
          java: r`class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) { leftMax = Math.max(leftMax, height[l]); water += leftMax - height[l++]; }
            else { rightMax = Math.max(rightMax, height[r]); water += rightMax - height[r--]; }
        }
        return water;
    }
}`,
          cpp: r`class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = (int) height.size() - 1, leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) { leftMax = max(leftMax, height[l]); water += leftMax - height[l++]; }
            else { rightMax = max(rightMax, height[r]); water += rightMax - height[r--]; }
        }
        return water;
    }
};`,
          python: r`class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        left_max = right_max = water = 0
        while l < r:
            if height[l] < height[r]:
                left_max = max(left_max, height[l])
                water += left_max - height[l]
                l += 1
            else:
                right_max = max(right_max, height[r])
                water += right_max - height[r]
                r -= 1
        return water`,
          javascript: r`var trap = function(height) {
    let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
    while (l < r) {
        if (height[l] < height[r]) { leftMax = Math.max(leftMax, height[l]); water += leftMax - height[l++]; }
        else { rightMax = Math.max(rightMax, height[r]); water += rightMax - height[r--]; }
    }
    return water;
};`,
        },
      },
    ],
  },
};
