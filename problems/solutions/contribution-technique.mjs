const r = String.raw;

export default {
  'sum-of-all-odd-length-subarrays': {
    pattern: 'Contribution technique: index i is in (i + 1)(n − i) subarrays, about half of them odd-length',
    approaches: [
      {
        level: 'Brute force', name: 'Sum every odd-length subarray',
        idea: 'Try every start and every odd length, and add up the elements of each subarray with an inner loop.',
        steps: [
          'For every start `l` and every end `r ≥ l` with `r − l` even (odd length):',
          'add `arr[l] + … + arr[r]` to the total with a third loop.',
        ],
        time: 'O(n³)', space: 'O(1)',
        why: 'About n²/4 subarrays, each summed in O(n). Fine for n = 100, but the work per subarray is repeated over and over.',
        code: {
          java: r`class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        int n = arr.length, total = 0;
        for (int l = 0; l < n; l++)
            for (int r = l; r < n; r += 2)
                for (int k = l; k <= r; k++) total += arr[k];
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int sumOddLengthSubarrays(vector<int>& arr) {
        int n = arr.size(), total = 0;
        for (int l = 0; l < n; l++)
            for (int r = l; r < n; r += 2)
                for (int k = l; k <= r; k++) total += arr[k];
        return total;
    }
};`,
          python: r`class Solution:
    def sumOddLengthSubarrays(self, arr: List[int]) -> int:
        n = len(arr)
        return sum(sum(arr[l:r + 1]) for l in range(n) for r in range(l, n, 2))`,
          javascript: r`var sumOddLengthSubarrays = function(arr) {
    const n = arr.length;
    let total = 0;
    for (let l = 0; l < n; l++)
        for (let r = l; r < n; r += 2)
            for (let k = l; k <= r; k++) total += arr[k];
    return total;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix sums',
        idea: 'Precompute prefix sums so each subarray sum is p[r + 1] − p[l] in O(1).',
        steps: [
          'Build `p` with `p[i + 1] = p[i] + arr[i]`.',
          'For every start `l` and odd-length end `r`, add `p[r + 1] − p[l]`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each subarray is now O(1), but there are still O(n²) of them.',
        code: {
          java: r`class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        int n = arr.length, total = 0;
        int[] p = new int[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + arr[i];
        for (int l = 0; l < n; l++)
            for (int r = l; r < n; r += 2) total += p[r + 1] - p[l];
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int sumOddLengthSubarrays(vector<int>& arr) {
        int n = arr.size(), total = 0;
        vector<int> p(n + 1, 0);
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + arr[i];
        for (int l = 0; l < n; l++)
            for (int r = l; r < n; r += 2) total += p[r + 1] - p[l];
        return total;
    }
};`,
          python: r`class Solution:
    def sumOddLengthSubarrays(self, arr: List[int]) -> int:
        n = len(arr)
        p = [0] * (n + 1)
        for i, x in enumerate(arr):
            p[i + 1] = p[i] + x
        return sum(p[r + 1] - p[l] for l in range(n) for r in range(l, n, 2))`,
          javascript: r`var sumOddLengthSubarrays = function(arr) {
    const n = arr.length, p = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) p[i + 1] = p[i] + arr[i];
    let total = 0;
    for (let l = 0; l < n; l++)
        for (let r = l; r < n; r += 2) total += p[r + 1] - p[l];
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Contribution of each element',
        idea: 'arr[i] is in (i + 1)(n − i) subarrays (starts × ends); ⌈that / 2⌉ of them have odd length. Add arr[i] times that count.',
        steps: [
          'For each `i`, `all = (i + 1) × (n − i)` subarrays contain it.',
          'Odd length means start and end have the same parity, which is `(all + 1) / 2` of them.',
          'Add `arr[i] × (all + 1) / 2`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass and a little arithmetic per element: the sum is reorganised by element instead of by subarray.',
        code: {
          java: r`class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        int n = arr.length, total = 0;
        for (int i = 0; i < n; i++) {
            int all = (i + 1) * (n - i);           // subarrays containing i
            total += arr[i] * ((all + 1) / 2);     // the odd-length ones
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int sumOddLengthSubarrays(vector<int>& arr) {
        int n = arr.size(), total = 0;
        for (int i = 0; i < n; i++) {
            int all = (i + 1) * (n - i);
            total += arr[i] * ((all + 1) / 2);
        }
        return total;
    }
};`,
          python: r`class Solution:
    def sumOddLengthSubarrays(self, arr: List[int]) -> int:
        n = len(arr)
        return sum(x * (((i + 1) * (n - i) + 1) // 2) for i, x in enumerate(arr))`,
          javascript: r`var sumOddLengthSubarrays = function(arr) {
    const n = arr.length;
    let total = 0;
    for (let i = 0; i < n; i++) {
        const all = (i + 1) * (n - i);
        total += arr[i] * Math.floor((all + 1) / 2);
    }
    return total;
};`,
        },
      },
    ],
  },

  'number-of-zero-filled-subarrays': {
    pattern: 'Contribution technique: credit each all-zero subarray to its right end',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'From every start, extend to the right while the elements are zero; each step is one more all-zero subarray.',
        steps: [
          'For each start `l`: walk `r = l, l + 1, …` while `nums[r] == 0`.',
          'Count one subarray per step.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'An array of 10⁵ zeros makes every start walk to the end: about 5 × 10⁹ steps.',
        code: {
          java: r`class Solution {
    public long zeroFilledSubarray(int[] nums) {
        long count = 0;
        for (int l = 0; l < nums.length; l++)
            for (int r = l; r < nums.length && nums[r] == 0; r++) count++;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long zeroFilledSubarray(vector<int>& nums) {
        long long count = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++)
            for (int r = l; r < n && nums[r] == 0; r++) count++;
        return count;
    }
};`,
          python: r`class Solution:
    def zeroFilledSubarray(self, nums: List[int]) -> int:
        count = 0
        for l in range(len(nums)):
            r = l
            while r < len(nums) and nums[r] == 0:
                count += 1
                r += 1
        return count`,
          javascript: r`var zeroFilledSubarray = function(nums) {
    let count = 0;
    for (let l = 0; l < nums.length; l++)
        for (let r = l; r < nums.length && nums[r] === 0; r++) count++;
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Length of the current zero run',
        idea: 'If the run of zeros ending at i has length run, exactly run all-zero subarrays end at i. Add run at every index.',
        steps: [
          'Keep `run`: `run + 1` on a zero, `0` otherwise.',
          'Add `run` to the total at every index (64-bit).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Every all-zero subarray is counted once, at its right end, so one pass suffices.',
        code: {
          java: r`class Solution {
    public long zeroFilledSubarray(int[] nums) {
        long total = 0, run = 0;
        for (int x : nums) {
            run = (x == 0) ? run + 1 : 0;   // all-zero subarrays ending here
            total += run;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long zeroFilledSubarray(vector<int>& nums) {
        long long total = 0, run = 0;
        for (int x : nums) {
            run = (x == 0) ? run + 1 : 0;
            total += run;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def zeroFilledSubarray(self, nums: List[int]) -> int:
        total = run = 0
        for x in nums:
            run = run + 1 if x == 0 else 0
            total += run
        return total`,
          javascript: r`var zeroFilledSubarray = function(nums) {
    let total = 0, run = 0;
    for (const x of nums) {
        run = x === 0 ? run + 1 : 0;
        total += run;
    }
    return total;
};`,
        },
      },
    ],
  },

  'vowels-of-all-substrings': {
    pattern: 'Contribution technique: a vowel at i is in (i + 1)(n − i) substrings',
    approaches: [
      {
        level: 'Brute force', name: 'Every substring with a running count',
        idea: 'Fix the start, extend the end one character at a time while counting vowels, and add the running count for each substring.',
        steps: [
          'For each start `l`, set `vowels = 0`.',
          'For each end `r ≥ l`: add 1 if `word[r]` is a vowel, then add `vowels` to the total.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'There are about n²/2 substrings: 5 × 10⁹ for n = 10⁵.',
        code: {
          java: r`class Solution {
    public long countVowels(String word) {
        long total = 0;
        for (int l = 0; l < word.length(); l++) {
            long vowels = 0;
            for (int r = l; r < word.length(); r++) {
                if ("aeiou".indexOf(word.charAt(r)) >= 0) vowels++;
                total += vowels;
            }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long countVowels(string word) {
        long long total = 0;
        int n = word.size();
        for (int l = 0; l < n; l++) {
            long long vowels = 0;
            for (int r = l; r < n; r++) {
                if (string("aeiou").find(word[r]) != string::npos) vowels++;
                total += vowels;
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def countVowels(self, word: str) -> int:
        total = 0
        for l in range(len(word)):
            vowels = 0
            for r in range(l, len(word)):
                vowels += word[r] in 'aeiou'
                total += vowels
        return total`,
          javascript: r`var countVowels = function(word) {
    let total = 0;
    for (let l = 0; l < word.length; l++) {
        let vowels = 0;
        for (let r = l; r < word.length; r++) {
            if ('aeiou'.includes(word[r])) vowels++;
            total += vowels;
        }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Contribution of each vowel',
        idea: 'A substring containing index i starts in 0 … i and ends in i … n − 1, so a vowel at i is counted (i + 1) × (n − i) times.',
        steps: [
          'For each index `i` holding a vowel, add `(i + 1) × (n − i)`.',
          'Use 64-bit arithmetic: the product reaches 2.5 × 10⁹.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each character is looked at once, and its contribution is a product of two counts.',
        code: {
          java: r`class Solution {
    public long countVowels(String word) {
        long n = word.length(), total = 0;
        for (int i = 0; i < n; i++)
            if ("aeiou".indexOf(word.charAt(i)) >= 0) total += (i + 1) * (n - i);
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long countVowels(string word) {
        long long n = word.size(), total = 0;
        for (long long i = 0; i < n; i++)
            if (string("aeiou").find(word[i]) != string::npos) total += (i + 1) * (n - i);
        return total;
    }
};`,
          python: r`class Solution:
    def countVowels(self, word: str) -> int:
        n = len(word)
        return sum((i + 1) * (n - i) for i, c in enumerate(word) if c in 'aeiou')`,
          javascript: r`var countVowels = function(word) {
    const n = word.length;
    let total = 0;
    for (let i = 0; i < n; i++)
        if ('aeiou'.includes(word[i])) total += (i + 1) * (n - i);
    return total;
};`,
        },
      },
    ],
  },

  'total-hamming-distance': {
    pattern: 'Contribution technique per bit: bit b adds ones × zeros',
    approaches: [
      {
        level: 'Brute force', name: 'Every pair',
        idea: 'For every pair, count the set bits of a ^ b.',
        steps: [
          'For every pair `i < j`: add `bitCount(nums[i] ^ nums[j])`.',
          'Return the total.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n = 10⁴ gives 5 × 10⁷ pairs: borderline, and the per-bit view is much faster.',
        code: {
          java: r`class Solution {
    public int totalHammingDistance(int[] nums) {
        int total = 0;
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++) total += Integer.bitCount(nums[i] ^ nums[j]);
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int totalHammingDistance(vector<int>& nums) {
        int total = 0, n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) total += __builtin_popcount(nums[i] ^ nums[j]);
        return total;
    }
};`,
          python: r`class Solution:
    def totalHammingDistance(self, nums: List[int]) -> int:
        n = len(nums)
        return sum(bin(nums[i] ^ nums[j]).count('1') for i in range(n) for j in range(i + 1, n))`,
          javascript: r`var totalHammingDistance = function(nums) {
    const bits = (x) => { let c = 0; while (x) { x &= x - 1; c++; } return c; };
    let total = 0;
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++) total += bits(nums[i] ^ nums[j]);
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count ones per bit',
        idea: 'Bits are independent. At bit b, with ones numbers having a 1, exactly ones × (n − ones) pairs differ there.',
        steps: [
          'For each bit `b` from 0 to 31: count `ones`.',
          'Add `ones × (n − ones)`.',
        ],
        time: 'O(32 · n)', space: 'O(1)',
        why: 'Each pair is never looked at directly: it is counted once per bit where it differs, through the column counts.',
        code: {
          java: r`class Solution {
    public int totalHammingDistance(int[] nums) {
        int n = nums.length, total = 0;
        for (int b = 0; b < 32; b++) {
            int ones = 0;
            for (int x : nums) ones += (x >> b) & 1;
            total += ones * (n - ones);         // (1, 0) pairs differ at bit b
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int totalHammingDistance(vector<int>& nums) {
        int n = nums.size(), total = 0;
        for (int b = 0; b < 32; b++) {
            int ones = 0;
            for (int x : nums) ones += (x >> b) & 1;
            total += ones * (n - ones);
        }
        return total;
    }
};`,
          python: r`class Solution:
    def totalHammingDistance(self, nums: List[int]) -> int:
        n, total = len(nums), 0
        for b in range(32):
            ones = sum((x >> b) & 1 for x in nums)
            total += ones * (n - ones)
        return total`,
          javascript: r`var totalHammingDistance = function(nums) {
    const n = nums.length;
    let total = 0;
    for (let b = 0; b < 32; b++) {
        let ones = 0;
        for (const x of nums) ones += (x >>> b) & 1;
        total += ones * (n - ones);
    }
    return total;
};`,
        },
      },
    ],
  },

  'bitwise-xor-of-all-pairings': {
    pattern: 'Contribution technique with XOR parity: each value appears (other length) times',
    approaches: [
      {
        level: 'Brute force', name: 'XOR every pair',
        idea: 'Loop over every (i, j) and XOR nums1[i] ^ nums2[j] into the answer.',
        steps: [
          'For every `a` in `nums1` and `b` in `nums2`: `x ^= a ^ b`.',
          'Return `x`.',
        ],
        time: 'O(n · m)', space: 'O(1)',
        why: 'Up to 10¹⁰ pairs for two arrays of 10⁵.',
        code: {
          java: r`class Solution {
    public int xorAllNums(int[] nums1, int[] nums2) {
        int x = 0;
        for (int a : nums1) for (int b : nums2) x ^= a ^ b;
        return x;
    }
}`,
          cpp: r`class Solution {
public:
    int xorAllNums(vector<int>& nums1, vector<int>& nums2) {
        int x = 0;
        for (int a : nums1) for (int b : nums2) x ^= a ^ b;
        return x;
    }
};`,
          python: r`class Solution:
    def xorAllNums(self, nums1: List[int], nums2: List[int]) -> int:
        x = 0
        for a in nums1:
            for b in nums2:
                x ^= a ^ b
        return x`,
          javascript: r`var xorAllNums = function(nums1, nums2) {
    let x = 0;
    for (const a of nums1) for (const b of nums2) x ^= a ^ b;
    return x;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Only odd counts survive',
        idea: 'Each nums1 value is XOR-ed nums2.length times and each nums2 value nums1.length times; an even count cancels to 0.',
        steps: [
          'If `nums2.length` is odd, XOR every element of `nums1` into the answer.',
          'If `nums1.length` is odd, XOR every element of `nums2` into the answer.',
        ],
        time: 'O(n + m)', space: 'O(1)',
        why: 'Contribution by value: only whether a value appears an odd number of times matters for XOR.',
        code: {
          java: r`class Solution {
    public int xorAllNums(int[] nums1, int[] nums2) {
        int x = 0;
        if (nums2.length % 2 == 1) for (int a : nums1) x ^= a;   // each a appears nums2.length times
        if (nums1.length % 2 == 1) for (int b : nums2) x ^= b;   // each b appears nums1.length times
        return x;
    }
}`,
          cpp: r`class Solution {
public:
    int xorAllNums(vector<int>& nums1, vector<int>& nums2) {
        int x = 0;
        if (nums2.size() % 2 == 1) for (int a : nums1) x ^= a;
        if (nums1.size() % 2 == 1) for (int b : nums2) x ^= b;
        return x;
    }
};`,
          python: r`class Solution:
    def xorAllNums(self, nums1: List[int], nums2: List[int]) -> int:
        x = 0
        if len(nums2) % 2:
            for a in nums1:
                x ^= a
        if len(nums1) % 2:
            for b in nums2:
                x ^= b
        return x`,
          javascript: r`var xorAllNums = function(nums1, nums2) {
    let x = 0;
    if (nums2.length % 2 === 1) for (const a of nums1) x ^= a;
    if (nums1.length % 2 === 1) for (const b of nums2) x ^= b;
    return x;
};`,
        },
      },
    ],
  },

  'sum-of-absolute-differences-in-a-sorted-array': {
    pattern: 'Contribution technique with prefix sums: sorted, so |x − y| splits into a left and a right part',
    approaches: [
      {
        level: 'Brute force', name: 'Sum each row directly',
        idea: 'For every i, loop over every j and add |nums[i] − nums[j]|.',
        steps: [
          'For each `i`: `res[i] = Σ |nums[i] − nums[j]|` over all `j`.',
          'Return `res`.',
        ],
        time: 'O(n²)', space: 'O(1) extra',
        why: '10¹⁰ operations for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int[] getSumAbsoluteDifferences(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) res[i] += Math.abs(nums[i] - nums[j]);
        return res;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> getSumAbsoluteDifferences(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) res[i] += abs(nums[i] - nums[j]);
        return res;
    }
};`,
          python: r`class Solution:
    def getSumAbsoluteDifferences(self, nums: List[int]) -> List[int]:
        return [sum(abs(x - y) for y in nums) for x in nums]`,
          javascript: r`var getSumAbsoluteDifferences = function(nums) {
    return nums.map((x) => nums.reduce((s, y) => s + Math.abs(x - y), 0));
};`,
        },
      },
      {
        level: 'Optimal', name: 'Prefix sums on both sides',
        idea: 'Everything before i is ≤ nums[i] and everything after is ≥ it, so res[i] = (nums[i]·i − sum before) + (sum after − nums[i]·(n − 1 − i)).',
        steps: [
          'Build prefix sums `p` with `p[i + 1] = p[i] + nums[i]`.',
          'Left part: `nums[i] × i − p[i]`.',
          'Right part: `(p[n] − p[i + 1]) − nums[i] × (n − 1 − i)`; add both.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'The sort removes the absolute value, and prefix sums give each side\'s total in O(1).',
        code: {
          java: r`class Solution {
    public int[] getSumAbsoluteDifferences(int[] nums) {
        int n = nums.length;
        int[] p = new int[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            int left = nums[i] * i - p[i];                          // to everything before i
            int right = (p[n] - p[i + 1]) - nums[i] * (n - 1 - i);  // to everything after i
            res[i] = left + right;
        }
        return res;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> getSumAbsoluteDifferences(vector<int>& nums) {
        int n = nums.size();
        vector<int> p(n + 1, 0), res(n);
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        for (int i = 0; i < n; i++) {
            int left = nums[i] * i - p[i];
            int right = (p[n] - p[i + 1]) - nums[i] * (n - 1 - i);
            res[i] = left + right;
        }
        return res;
    }
};`,
          python: r`class Solution:
    def getSumAbsoluteDifferences(self, nums: List[int]) -> List[int]:
        n = len(nums)
        p = [0] * (n + 1)
        for i, x in enumerate(nums):
            p[i + 1] = p[i] + x
        return [(x * i - p[i]) + (p[n] - p[i + 1] - x * (n - 1 - i)) for i, x in enumerate(nums)]`,
          javascript: r`var getSumAbsoluteDifferences = function(nums) {
    const n = nums.length, p = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
    return nums.map((x, i) => (x * i - p[i]) + (p[n] - p[i + 1] - x * (n - 1 - i)));
};`,
        },
      },
    ],
  },

  'sum-of-distances': {
    pattern: 'Contribution technique with prefix sums, per group of equal values',
    approaches: [
      {
        level: 'Brute force', name: 'Compare every pair of indices',
        idea: 'For every i, scan every j with the same value and add |i − j|.',
        steps: [
          'For each `i`, loop over all `j`.',
          'If `nums[j] == nums[i]`, add `|i − j|` to `res[i]`.',
        ],
        time: 'O(n²)', space: 'O(1) extra',
        why: '10¹⁰ comparisons for n = 10⁵.',
        code: {
          java: r`class Solution {
    public long[] distance(int[] nums) {
        int n = nums.length;
        long[] res = new long[n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) if (nums[i] == nums[j]) res[i] += Math.abs(i - j);
        return res;
    }
}`,
          cpp: r`class Solution {
public:
    vector<long long> distance(vector<int>& nums) {
        int n = nums.size();
        vector<long long> res(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) if (nums[i] == nums[j]) res[i] += abs(i - j);
        return res;
    }
};`,
          python: r`class Solution:
    def distance(self, nums: List[int]) -> List[int]:
        n = len(nums)
        return [sum(abs(i - j) for j in range(n) if nums[j] == nums[i]) for i in range(n)]`,
          javascript: r`var distance = function(nums) {
    const n = nums.length, res = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) if (nums[i] === nums[j]) res[i] += Math.abs(i - j);
    return res;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Group indices, then prefix sums',
        idea: 'Collect the (sorted) indices of each value. For the k-th index j in a group: (j·k − sum before) + (sum after − j·(size − 1 − k)).',
        steps: [
          'Group indices by value with a hash map (left to right, so each list is sorted).',
          'For each group, compute its total and walk it with a running sum of the indices before.',
          'Set `res[j] = (j·k − left) + (right − j·(size − 1 − k))`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every index is handled once in its group, with O(1) work from the running sums.',
        code: {
          java: r`class Solution {
    public long[] distance(int[] nums) {
        Map<Integer, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < nums.length; i++) groups.computeIfAbsent(nums[i], k -> new ArrayList<>()).add(i);
        long[] res = new long[nums.length];
        for (List<Integer> idx : groups.values()) {
            long total = 0;
            for (int j : idx) total += j;
            long left = 0;                          // sum of the indices before position k
            for (int k = 0; k < idx.size(); k++) {
                long j = idx.get(k);
                long right = total - left - j;     // sum of the indices after position k
                res[(int) j] = (j * k - left) + (right - j * (idx.size() - 1 - k));
                left += j;
            }
        }
        return res;
    }
}`,
          cpp: r`class Solution {
public:
    vector<long long> distance(vector<int>& nums) {
        unordered_map<int, vector<int>> groups;
        for (int i = 0; i < (int) nums.size(); i++) groups[nums[i]].push_back(i);
        vector<long long> res(nums.size(), 0);
        for (auto& [v, idx] : groups) {
            long long total = 0, left = 0, m = idx.size();
            for (int j : idx) total += j;
            for (long long k = 0; k < m; k++) {
                long long j = idx[k], right = total - left - j;
                res[j] = (j * k - left) + (right - j * (m - 1 - k));
                left += j;
            }
        }
        return res;
    }
};`,
          python: r`class Solution:
    def distance(self, nums: List[int]) -> List[int]:
        groups = defaultdict(list)
        for i, v in enumerate(nums):
            groups[v].append(i)
        res = [0] * len(nums)
        for idx in groups.values():
            total, left, m = sum(idx), 0, len(idx)
            for k, j in enumerate(idx):
                right = total - left - j
                res[j] = (j * k - left) + (right - j * (m - 1 - k))
                left += j
        return res`,
          javascript: r`var distance = function(nums) {
    const groups = new Map();
    nums.forEach((v, i) => { if (!groups.has(v)) groups.set(v, []); groups.get(v).push(i); });
    const res = new Array(nums.length).fill(0);
    for (const idx of groups.values()) {
        const m = idx.length;
        let total = 0, left = 0;
        for (const j of idx) total += j;
        idx.forEach((j, k) => {
            const right = total - left - j;
            res[j] = (j * k - left) + (right - j * (m - 1 - k));
            left += j;
        });
    }
    return res;
};`,
        },
      },
    ],
  },

  'subarray-product-less-than-k': {
    pattern: 'Sliding window + contribution: right end r adds r − l + 1',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'From each start, multiply in elements to the right until the product reaches k (positive values only grow it).',
        steps: [
          'For each start `l`, set `prod = 1`.',
          'Extend `r` while `prod × nums[r] < k`, counting each step; stop as soon as it reaches `k`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'With many 1s every start walks almost to the end: about 4.5 × 10⁸ steps for 3 × 10⁴ ones.',
        code: {
          java: r`class Solution {
    public int numSubarrayProductLessThanK(int[] nums, int k) {
        int count = 0;
        for (int l = 0; l < nums.length; l++) {
            long prod = 1;
            for (int r = l; r < nums.length; r++) {
                prod *= nums[r];
                if (prod >= k) break;               // only grows from here
                count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int numSubarrayProductLessThanK(vector<int>& nums, int k) {
        int count = 0, n = nums.size();
        for (int l = 0; l < n; l++) {
            long long prod = 1;
            for (int r = l; r < n; r++) {
                prod *= nums[r];
                if (prod >= k) break;
                count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        count = 0
        for l in range(len(nums)):
            prod = 1
            for r in range(l, len(nums)):
                prod *= nums[r]
                if prod >= k:
                    break
                count += 1
        return count`,
          javascript: r`var numSubarrayProductLessThanK = function(nums, k) {
    let count = 0;
    for (let l = 0; l < nums.length; l++) {
        let prod = 1;
        for (let r = l; r < nums.length; r++) {
            prod *= nums[r];
            if (prod >= k) break;
            count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window, count at the right end',
        idea: 'Keep the window [l, r] with product < k. Every subarray ending at r and starting in [l, r] is valid: r − l + 1 of them.',
        steps: [
          'If `k ≤ 1`, return 0.',
          'For each `r`: multiply in `nums[r]`, then divide out `nums[l++]` while the product is `≥ k`.',
          'Add `r − l + 1`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each index enters and leaves the window once, and each valid subarray is credited exactly once, to its right end.',
        code: {
          java: r`class Solution {
    public int numSubarrayProductLessThanK(int[] nums, int k) {
        if (k <= 1) return 0;                       // no product of positive integers is < 1
        int count = 0, l = 0;
        long prod = 1;
        for (int r = 0; r < nums.length; r++) {
            prod *= nums[r];
            while (prod >= k) prod /= nums[l++];
            count += r - l + 1;                     // subarrays ending at r
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int numSubarrayProductLessThanK(vector<int>& nums, int k) {
        if (k <= 1) return 0;
        int count = 0, l = 0;
        long long prod = 1;
        for (int r = 0; r < (int) nums.size(); r++) {
            prod *= nums[r];
            while (prod >= k) prod /= nums[l++];
            count += r - l + 1;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
            return 0
        count = l = 0
        prod = 1
        for r, x in enumerate(nums):
            prod *= x
            while prod >= k:
                prod //= nums[l]
                l += 1
            count += r - l + 1
        return count`,
          javascript: r`var numSubarrayProductLessThanK = function(nums, k) {
    if (k <= 1) return 0;
    let count = 0, l = 0, prod = 1;
    for (let r = 0; r < nums.length; r++) {
        prod *= nums[r];
        while (prod >= k) prod /= nums[l++];
        count += r - l + 1;
    }
    return count;
};`,
        },
      },
    ],
  },

  'count-subarrays-where-max-element-appears-at-least-k-times': {
    pattern: 'Sliding window + contribution: for "at least", right end r adds l',
    approaches: [
      {
        level: 'Brute force', name: 'Count copies from every start',
        idea: 'From each start, extend to the right counting copies of the maximum; once there are k, every longer subarray also qualifies.',
        steps: [
          'Find the maximum `m`.',
          'For each start `l`, extend `r` counting copies of `m`; when the count reaches `k`, add `n − r` and stop.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'When copies of the maximum are rare, each start walks far: up to 5 × 10⁹ steps.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, int k) {
        int n = nums.length, max = Arrays.stream(nums).max().getAsInt();
        long count = 0;
        for (int l = 0; l < n; l++) {
            int seen = 0;
            for (int r = l; r < n; r++) {
                if (nums[r] == max) seen++;
                if (seen >= k) { count += n - r; break; }   // [l..r], [l..r+1], …, [l..n−1]
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, int k) {
        int n = nums.size(), mx = *max_element(nums.begin(), nums.end());
        long long count = 0;
        for (int l = 0; l < n; l++) {
            int seen = 0;
            for (int r = l; r < n; r++) {
                if (nums[r] == mx) seen++;
                if (seen >= k) { count += n - r; break; }
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        n, mx, count = len(nums), max(nums), 0
        for l in range(n):
            seen = 0
            for r in range(l, n):
                seen += nums[r] == mx
                if seen >= k:
                    count += n - r
                    break
        return count`,
          javascript: r`var countSubarrays = function(nums, k) {
    const n = nums.length, mx = Math.max(...nums);
    let count = 0;
    for (let l = 0; l < n; l++) {
        let seen = 0;
        for (let r = l; r < n; r++) {
            if (nums[r] === mx) seen++;
            if (seen >= k) { count += n - r; break; }
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window, count valid starts',
        idea: 'For each r, shrink from the left while the window still holds k copies. Then every start before l keeps at least k copies, so r contributes l.',
        steps: [
          'Find the maximum `m`; keep `seen` = copies of `m` in `[l, r]`.',
          'For each `r`: count `nums[r]`; while `seen ≥ k`, drop `nums[l++]`.',
          'Add `l`: starts `0 … l − 1` all work for this `r`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Both pointers only move forward, and each valid subarray is credited once, to its right end.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, int k) {
        int max = Arrays.stream(nums).max().getAsInt();
        long count = 0;
        int seen = 0, l = 0;
        for (int r = 0; r < nums.length; r++) {
            if (nums[r] == max) seen++;
            while (seen >= k) if (nums[l++] == max) seen--;   // shrink until it stops being valid
            count += l;                                         // starts 0 … l − 1 have ≥ k copies
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, int k) {
        int mx = *max_element(nums.begin(), nums.end()), seen = 0, l = 0;
        long long count = 0;
        for (int r = 0; r < (int) nums.size(); r++) {
            if (nums[r] == mx) seen++;
            while (seen >= k) if (nums[l++] == mx) seen--;
            count += l;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        mx, seen, l, count = max(nums), 0, 0, 0
        for x in nums:
            seen += x == mx
            while seen >= k:
                seen -= nums[l] == mx
                l += 1
            count += l
        return count`,
          javascript: r`var countSubarrays = function(nums, k) {
    const mx = Math.max(...nums);
    let seen = 0, l = 0, count = 0;
    for (let r = 0; r < nums.length; r++) {
        if (nums[r] === mx) seen++;
        while (seen >= k) if (nums[l++] === mx) seen--;
        count += l;
    }
    return count;
};`,
        },
      },
    ],
  },

  'sum-of-subarray-ranges': {
    pattern: 'Contribution technique: sum of maximums − sum of minimums, each with monotonic stacks',
    approaches: [
      {
        level: 'Brute force', name: 'Every subarray, scanned',
        idea: 'For every subarray, scan it for its minimum and maximum.',
        steps: [
          'For every `l ≤ r`: scan `nums[l..r]` for min and max.',
          'Add `max − min`.',
        ],
        time: 'O(n³)', space: 'O(1)',
        why: 'About n³/6 operations: 1.7 × 10⁸ for n = 1000.',
        code: {
          java: r`class Solution {
    public long subArrayRanges(int[] nums) {
        long total = 0;
        for (int l = 0; l < nums.length; l++)
            for (int r = l; r < nums.length; r++) {
                int mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE;
                for (int k = l; k <= r; k++) { mn = Math.min(mn, nums[k]); mx = Math.max(mx, nums[k]); }
                total += (long) mx - mn;
            }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long subArrayRanges(vector<int>& nums) {
        long long total = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++)
            for (int r = l; r < n; r++) {
                int mn = INT_MAX, mx = INT_MIN;
                for (int k = l; k <= r; k++) { mn = min(mn, nums[k]); mx = max(mx, nums[k]); }
                total += (long long) mx - mn;
            }
        return total;
    }
};`,
          python: r`class Solution:
    def subArrayRanges(self, nums: List[int]) -> int:
        n = len(nums)
        return sum(max(nums[l:r + 1]) - min(nums[l:r + 1]) for l in range(n) for r in range(l, n))`,
          javascript: r`var subArrayRanges = function(nums) {
    let total = 0;
    for (let l = 0; l < nums.length; l++)
        for (let r = l; r < nums.length; r++) {
            let mn = Infinity, mx = -Infinity;
            for (let k = l; k <= r; k++) { mn = Math.min(mn, nums[k]); mx = Math.max(mx, nums[k]); }
            total += mx - mn;
        }
    return total;
};`,
        },
      },
      {
        level: 'Better', name: 'Running min and max',
        idea: 'Fix the start and extend the end, updating the running minimum and maximum in O(1).',
        steps: [
          'For each `l`, start `mn = mx = nums[l]`.',
          'For each `r ≥ l`, update `mn` and `mx` with `nums[r]` and add `mx − mn`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Fast enough for n = 1000 (5 × 10⁵ subarrays), and what most people write first; the follow-up asks for O(n).',
        code: {
          java: r`class Solution {
    public long subArrayRanges(int[] nums) {
        long total = 0;
        for (int l = 0; l < nums.length; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < nums.length; r++) {
                mn = Math.min(mn, nums[r]);
                mx = Math.max(mx, nums[r]);
                total += (long) mx - mn;
            }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long subArrayRanges(vector<int>& nums) {
        long long total = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < n; r++) {
                mn = min(mn, nums[r]);
                mx = max(mx, nums[r]);
                total += (long long) mx - mn;
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def subArrayRanges(self, nums: List[int]) -> int:
        total = 0
        for l in range(len(nums)):
            mn = mx = nums[l]
            for r in range(l, len(nums)):
                mn, mx = min(mn, nums[r]), max(mx, nums[r])
                total += mx - mn
        return total`,
          javascript: r`var subArrayRanges = function(nums) {
    let total = 0;
    for (let l = 0; l < nums.length; l++) {
        let mn = nums[l], mx = nums[l];
        for (let r = l; r < nums.length; r++) {
            mn = Math.min(mn, nums[r]);
            mx = Math.max(mx, nums[r]);
            total += mx - mn;
        }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Contribution with monotonic stacks',
        idea: 'Range sum = Σ maximums − Σ minimums. a[i] is the minimum of (i − prev smaller) × (next smaller-or-equal − i) subarrays; likewise for maximums.',
        steps: [
          'With a monotonic stack, find for each `i` the previous strictly smaller index and the next smaller-or-equal index (the tie rule stops double counting).',
          'Sum `a[i] × (i − prev) × (next − i)` for minimums; repeat with the comparisons flipped for maximums.',
          'Return maximums − minimums.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is pushed and popped once per pass, and every subarray is credited to exactly one minimum and one maximum.',
        code: {
          java: r`class Solution {
    public long subArrayRanges(int[] nums) {
        return sumOf(nums, true) - sumOf(nums, false);
    }

    private long sumOf(int[] a, boolean max) {
        int n = a.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && (max ? a[st.peek()] <= a[i] : a[st.peek()] >= a[i])) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) a[i] * (i - prev[i]) * (next[i] - i);
        return total;
    }
}`,
          cpp: r`class Solution {
    long long sumOf(vector<int>& a, bool mx) {
        int n = a.size();
        vector<int> prev(n), next(n, n), st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && (mx ? a[st.back()] <= a[i] : a[st.back()] >= a[i])) { next[st.back()] = i; st.pop_back(); }
            prev[i] = st.empty() ? -1 : st.back();
            st.push_back(i);
        }
        long long total = 0;
        for (int i = 0; i < n; i++) total += (long long) a[i] * (i - prev[i]) * (next[i] - i);
        return total;
    }
public:
    long long subArrayRanges(vector<int>& nums) {
        return sumOf(nums, true) - sumOf(nums, false);
    }
};`,
          python: r`class Solution:
    def subArrayRanges(self, nums: List[int]) -> int:
        def sum_of(beats):
            n = len(nums)
            prev, nxt, st = [-1] * n, [n] * n, []
            for i, x in enumerate(nums):
                while st and not beats(nums[st[-1]], x):
                    nxt[st.pop()] = i
                prev[i] = st[-1] if st else -1
                st.append(i)
            return sum(nums[i] * (i - prev[i]) * (nxt[i] - i) for i in range(n))
        return sum_of(lambda a, b: a > b) - sum_of(lambda a, b: a < b)`,
          javascript: r`var subArrayRanges = function(nums) {
    const sumOf = (beats) => {
        const n = nums.length, prev = new Array(n), next = new Array(n).fill(n), st = [];
        for (let i = 0; i < n; i++) {
            while (st.length && !beats(nums[st.at(-1)], nums[i])) next[st.pop()] = i;
            prev[i] = st.length ? st.at(-1) : -1;
            st.push(i);
        }
        let total = 0;
        for (let i = 0; i < n; i++) total += nums[i] * (i - prev[i]) * (next[i] - i);
        return total;
    };
    return sumOf((a, b) => a > b) - sumOf((a, b) => a < b);
};`,
        },
      },
    ],
  },

  'minimum-fuel-cost-to-report-to-the-capital': {
    pattern: 'Contribution of each tree edge: the road above v costs ⌈size(v) / seats⌉',
    approaches: [
      {
        level: 'Brute force', name: 'Walk every representative up',
        idea: 'For every city, walk its path to the capital and add one person to each road it uses; then each road costs ⌈people / seats⌉.',
        steps: [
          'Root the tree at 0 (BFS) to get each city\'s parent.',
          'For every city `v`, walk `v → parent → … → 0`, adding 1 to `people` on each road (stored at the lower city).',
          'Add `⌈people[v] / seats⌉` for every non-capital city.',
        ],
        time: 'O(n · depth)', space: 'O(n)',
        why: 'On a path of 10⁵ cities the walks add up to about 5 × 10⁹ steps.',
        code: {
          java: r`class Solution {
    public long minimumFuelCost(int[][] roads, int seats) {
        int n = roads.length + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : roads) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n];
        Arrays.fill(parent, -2);
        parent[0] = -1;
        Deque<Integer> q = new ArrayDeque<>(List.of(0));
        while (!q.isEmpty()) { int v = q.poll(); for (int c : adj.get(v)) if (parent[c] == -2) { parent[c] = v; q.add(c); } }
        long[] people = new long[n];
        for (int v = 1; v < n; v++)
            for (int u = v; u != 0; u = parent[u]) people[u]++;     // v's representative uses the road above u
        long fuel = 0;
        for (int v = 1; v < n; v++) fuel += (people[v] + seats - 1) / seats;
        return fuel;
    }
}`,
          cpp: r`class Solution {
public:
    long long minimumFuelCost(vector<vector<int>>& roads, int seats) {
        int n = roads.size() + 1;
        vector<vector<int>> adj(n);
        for (auto& e : roads) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        vector<int> parent(n, -2);
        parent[0] = -1;
        queue<int> q;
        q.push(0);
        while (!q.empty()) { int v = q.front(); q.pop(); for (int c : adj[v]) if (parent[c] == -2) { parent[c] = v; q.push(c); } }
        vector<long long> people(n, 0);
        for (int v = 1; v < n; v++)
            for (int u = v; u != 0; u = parent[u]) people[u]++;
        long long fuel = 0;
        for (int v = 1; v < n; v++) fuel += (people[v] + seats - 1) / seats;
        return fuel;
    }
};`,
          python: r`class Solution:
    def minimumFuelCost(self, roads: List[List[int]], seats: int) -> int:
        n = len(roads) + 1
        adj = [[] for _ in range(n)]
        for a, b in roads:
            adj[a].append(b)
            adj[b].append(a)
        parent = [-2] * n
        parent[0] = -1
        q = deque([0])
        while q:
            v = q.popleft()
            for c in adj[v]:
                if parent[c] == -2:
                    parent[c] = v
                    q.append(c)
        people = [0] * n
        for v in range(1, n):
            u = v
            while u != 0:
                people[u] += 1
                u = parent[u]
        return sum((people[v] + seats - 1) // seats for v in range(1, n))`,
          javascript: r`var minimumFuelCost = function(roads, seats) {
    const n = roads.length + 1, adj = Array.from({ length: n }, () => []);
    for (const [a, b] of roads) { adj[a].push(b); adj[b].push(a); }
    const parent = new Array(n).fill(-2);
    parent[0] = -1;
    const q = [0];
    for (let h = 0; h < q.length; h++) for (const c of adj[q[h]]) if (parent[c] === -2) { parent[c] = q[h]; q.push(c); }
    const people = new Array(n).fill(0);
    for (let v = 1; v < n; v++) for (let u = v; u !== 0; u = parent[u]) people[u]++;
    let fuel = 0;
    for (let v = 1; v < n; v++) fuel += Math.ceil(people[v] / seats);
    return fuel;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Subtree sizes in one traversal',
        idea: 'The people crossing the road above v are exactly v\'s subtree, so that road costs ⌈size(v) / seats⌉. Compute every subtree size bottom-up.',
        steps: [
          'BFS from the capital to get a parent array and an order (parents before children).',
          'Walk the order backwards: `size[v] += 1`, add `⌈size[v] / seats⌉`, then push `size[v]` into its parent.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each road\'s cost depends only on its subtree size, and one bottom-up pass gives all of them; iterative so a 10⁵-city path can\'t overflow the stack.',
        code: {
          java: r`class Solution {
    public long minimumFuelCost(int[][] roads, int seats) {
        int n = roads.length + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : roads) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n], order = new int[n], size = new int[n];
        parent[0] = -1;
        int len = 0;
        order[len++] = 0;                           // BFS order: parents before children
        for (int k = 0; k < len; k++)
            for (int c : adj.get(order[k])) if (c != parent[order[k]]) { parent[c] = order[k]; order[len++] = c; }
        long fuel = 0;
        for (int k = n - 1; k > 0; k--) {           // children before parents
            int v = order[k];
            size[v] += 1;
            fuel += (size[v] + seats - 1) / seats;  // cars on the road from v to its parent
            size[parent[v]] += size[v];
        }
        return fuel;
    }
}`,
          cpp: r`class Solution {
public:
    long long minimumFuelCost(vector<vector<int>>& roads, int seats) {
        int n = roads.size() + 1;
        vector<vector<int>> adj(n);
        for (auto& e : roads) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        vector<int> parent(n, -1), order, size(n, 0);
        order.push_back(0);
        for (int k = 0; k < (int) order.size(); k++)
            for (int c : adj[order[k]]) if (c != parent[order[k]]) { parent[c] = order[k]; order.push_back(c); }
        long long fuel = 0;
        for (int k = n - 1; k > 0; k--) {
            int v = order[k];
            size[v] += 1;
            fuel += (size[v] + seats - 1) / seats;
            size[parent[v]] += size[v];
        }
        return fuel;
    }
};`,
          python: r`class Solution:
    def minimumFuelCost(self, roads: List[List[int]], seats: int) -> int:
        n = len(roads) + 1
        adj = [[] for _ in range(n)]
        for a, b in roads:
            adj[a].append(b)
            adj[b].append(a)
        parent, order, size = [-1] * n, [0], [0] * n
        for v in order:                         # BFS order: the list grows while we walk it
            for c in adj[v]:
                if c != parent[v]:
                    parent[c] = v
                    order.append(c)
        fuel = 0
        for v in reversed(order[1:]):
            size[v] += 1
            fuel += (size[v] + seats - 1) // seats
            size[parent[v]] += size[v]
        return fuel`,
          javascript: r`var minimumFuelCost = function(roads, seats) {
    const n = roads.length + 1, adj = Array.from({ length: n }, () => []);
    for (const [a, b] of roads) { adj[a].push(b); adj[b].push(a); }
    const parent = new Array(n).fill(-1), order = [0], size = new Array(n).fill(0);
    for (let k = 0; k < order.length; k++)
        for (const c of adj[order[k]]) if (c !== parent[order[k]]) { parent[c] = order[k]; order.push(c); }
    let fuel = 0;
    for (let k = n - 1; k > 0; k--) {
        const v = order[k];
        size[v] += 1;
        fuel += Math.ceil(size[v] / seats);
        size[parent[v]] += size[v];
    }
    return fuel;
};`,
        },
      },
    ],
  },

  'sum-of-subsequence-widths': {
    pattern: 'Contribution after sorting: a[i] is the max of 2^i and the min of 2^(n−1−i) subsequences',
    approaches: [
      {
        level: 'Brute force', name: 'Every subsequence',
        idea: 'Enumerate all 2ⁿ − 1 non-empty subsets with a bitmask and add max − min for each.',
        steps: [
          'For every mask from 1 to `2ⁿ − 1`, scan the chosen elements for min and max.',
          'Add `max − min` modulo 10⁹ + 7.',
        ],
        time: 'O(2ⁿ · n)', space: 'O(1)',
        why: 'Exponential: hopeless beyond n ≈ 20, while n goes up to 10⁵.',
        timesOut: ['generated'],
        code: {
          java: r`class Solution {
    public int sumSubseqWidths(int[] nums) {
        int n = nums.length;
        long total = 0;
        for (int mask = 1; mask < (1 << n); mask++) {
            int mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE;
            for (int k = 0; k < n; k++) if ((mask >> k & 1) == 1) { mn = Math.min(mn, nums[k]); mx = Math.max(mx, nums[k]); }
            total = (total + mx - mn) % 1_000_000_007;
        }
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int sumSubseqWidths(vector<int>& nums) {
        int n = nums.size();
        long long total = 0;
        for (int mask = 1; mask < (1 << n); mask++) {
            int mn = INT_MAX, mx = INT_MIN;
            for (int k = 0; k < n; k++) if (mask >> k & 1) { mn = min(mn, nums[k]); mx = max(mx, nums[k]); }
            total = (total + mx - mn) % 1000000007;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def sumSubseqWidths(self, nums: List[int]) -> int:
        n, total = len(nums), 0
        for mask in range(1, 1 << n):
            pick = [nums[k] for k in range(n) if mask >> k & 1]
            total += max(pick) - min(pick)
        return total % (10**9 + 7)`,
          javascript: r`var sumSubseqWidths = function(nums) {
    const n = nums.length;
    let total = 0;
    for (let mask = 1; mask < (1 << n); mask++) {
        let mn = Infinity, mx = -Infinity;
        for (let k = 0; k < n; k++) if (mask >> k & 1) { mn = Math.min(mn, nums[k]); mx = Math.max(mx, nums[k]); }
        total = (total + mx - mn) % 1000000007;
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort, then powers of two',
        idea: 'Width = max − min, and only the chosen values matter, so sort. Then nums[i] adds nums[i] × (2^i − 2^(n−1−i)).',
        steps: [
          'Sort `nums` and precompute `pow2[k] = 2^k mod 10⁹ + 7`.',
          'Add `nums[i] × (pow2[i] − pow2[n − 1 − i])` for every `i`, modulo 10⁹ + 7.',
          'The running total may be negative: add the modulus before the final `%`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Counting subsets by who their max and min are replaces 2ⁿ subsets with n contributions.',
        code: {
          java: r`class Solution {
    public int sumSubseqWidths(int[] nums) {
        final int MOD = 1_000_000_007;
        int n = nums.length;
        Arrays.sort(nums);
        long[] pow2 = new long[n];
        pow2[0] = 1;
        for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
        long total = 0;
        for (int i = 0; i < n; i++)
            total = (total + nums[i] * (pow2[i] - pow2[n - 1 - i])) % MOD;   // may go negative
        return (int) ((total + MOD) % MOD);
    }
}`,
          cpp: r`class Solution {
public:
    int sumSubseqWidths(vector<int>& nums) {
        const long long MOD = 1000000007;
        int n = nums.size();
        sort(nums.begin(), nums.end());
        vector<long long> pow2(n, 1);
        for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
        long long total = 0;
        for (int i = 0; i < n; i++)
            total = (total + nums[i] * (pow2[i] - pow2[n - 1 - i])) % MOD;
        return (total + MOD) % MOD;
    }
};`,
          python: r`class Solution:
    def sumSubseqWidths(self, nums: List[int]) -> int:
        MOD = 10**9 + 7
        nums.sort()
        n = len(nums)
        pow2 = [1] * n
        for i in range(1, n):
            pow2[i] = pow2[i - 1] * 2 % MOD
        return sum(x * (pow2[i] - pow2[n - 1 - i]) for i, x in enumerate(nums)) % MOD`,
          javascript: r`var sumSubseqWidths = function(nums) {
    const MOD = 1000000007, n = nums.length;
    nums.sort((a, b) => a - b);
    const pow2 = new Array(n).fill(1);
    for (let i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
    let total = 0;
    for (let i = 0; i < n; i++)
        total = (total + nums[i] * (pow2[i] - pow2[n - 1 - i])) % MOD;   // nums[i] × diff < 2⁵³
    return (total + MOD) % MOD;
};`,
        },
      },
    ],
  },

  'total-appeal-of-a-string': {
    pattern: 'Contribution technique: credit the first copy of each letter, (i − last) × (n − i)',
    approaches: [
      {
        level: 'Brute force', name: 'Every substring with a seen set',
        idea: 'Fix the start, extend the end, and track the distinct letters seen so far; add that count for every substring.',
        steps: [
          'For each start `l`, clear a 26-entry `seen` array and set `distinct = 0`.',
          'For each end `r ≥ l`: mark `s[r]` (counting it if new) and add `distinct`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About 5 × 10⁹ substrings for n = 10⁵.',
        code: {
          java: r`class Solution {
    public long appealSum(String s) {
        long total = 0;
        for (int l = 0; l < s.length(); l++) {
            boolean[] seen = new boolean[26];
            int distinct = 0;
            for (int r = l; r < s.length(); r++) {
                if (!seen[s.charAt(r) - 'a']) { seen[s.charAt(r) - 'a'] = true; distinct++; }
                total += distinct;
            }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long appealSum(string s) {
        long long total = 0;
        int n = s.size();
        for (int l = 0; l < n; l++) {
            bool seen[26] = {};
            int distinct = 0;
            for (int r = l; r < n; r++) {
                if (!seen[s[r] - 'a']) { seen[s[r] - 'a'] = true; distinct++; }
                total += distinct;
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def appealSum(self, s: str) -> int:
        total = 0
        for l in range(len(s)):
            seen = set()
            for r in range(l, len(s)):
                seen.add(s[r])
                total += len(seen)
        return total`,
          javascript: r`var appealSum = function(s) {
    let total = 0;
    for (let l = 0; l < s.length; l++) {
        const seen = new Set();
        for (let r = l; r < s.length; r++) {
            seen.add(s[r]);
            total += seen.size;
        }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Last-seen positions',
        idea: 's[i] is the first copy of its letter in a substring exactly when the substring starts after the letter\'s previous occurrence: (i − last) starts × (n − i) ends.',
        steps: [
          'Keep `last[26]`, initialised to −1.',
          'For each `i`: add `(i − last[c]) × (n − i)`, then set `last[c] = i`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Every substring\'s appeal is split among its letters\' first copies, and each copy\'s share is a product of two counts.',
        code: {
          java: r`class Solution {
    public long appealSum(String s) {
        int[] last = new int[26];
        Arrays.fill(last, -1);                      // "no copy yet" = index −1
        long n = s.length(), total = 0;
        for (int i = 0; i < n; i++) {
            int c = s.charAt(i) - 'a';
            total += (i - last[c]) * (n - i);       // starts after the previous copy, any end
            last[c] = i;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    long long appealSum(string s) {
        vector<long long> last(26, -1);
        long long n = s.size(), total = 0;
        for (long long i = 0; i < n; i++) {
            int c = s[i] - 'a';
            total += (i - last[c]) * (n - i);
            last[c] = i;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def appealSum(self, s: str) -> int:
        last = {}
        n, total = len(s), 0
        for i, c in enumerate(s):
            total += (i - last.get(c, -1)) * (n - i)
            last[c] = i
        return total`,
          javascript: r`var appealSum = function(s) {
    const last = new Array(26).fill(-1), n = s.length;
    let total = 0;
    for (let i = 0; i < n; i++) {
        const c = s.charCodeAt(i) - 97;
        total += (i - last[c]) * (n - i);
        last[c] = i;
    }
    return total;
};`,
        },
      },
    ],
  },

  'count-unique-characters-of-all-substrings-of-a-given-string': {
    pattern: 'Contribution technique: s[i] counts between its previous and next copies, (i − prev) × (next − i)',
    approaches: [
      {
        level: 'Brute force', name: 'Every substring with letter counts',
        idea: 'Fix the start and extend the end, keeping letter counts and the number of letters that appear exactly once.',
        steps: [
          'For each start `l`, clear the counts and set `unique = 0`.',
          'For each end `r`: update `count[s[r]]` (1 → unique + 1, 2 → unique − 1) and add `unique`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About 5 × 10⁹ substrings for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int uniqueLetterString(String s) {
        long total = 0;
        for (int l = 0; l < s.length(); l++) {
            int[] count = new int[26];
            int unique = 0;
            for (int r = l; r < s.length(); r++) {
                int c = ++count[s.charAt(r) - 'A'];
                if (c == 1) unique++;
                else if (c == 2) unique--;
                total += unique;
            }
        }
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int uniqueLetterString(string s) {
        long long total = 0;
        int n = s.size();
        for (int l = 0; l < n; l++) {
            int count[26] = {}, unique = 0;
            for (int r = l; r < n; r++) {
                int c = ++count[s[r] - 'A'];
                if (c == 1) unique++;
                else if (c == 2) unique--;
                total += unique;
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def uniqueLetterString(self, s: str) -> int:
        total = 0
        for l in range(len(s)):
            count = [0] * 26
            unique = 0
            for r in range(l, len(s)):
                k = ord(s[r]) - 65
                count[k] += 1
                if count[k] == 1:
                    unique += 1
                elif count[k] == 2:
                    unique -= 1
                total += unique
        return total`,
          javascript: r`var uniqueLetterString = function(s) {
    let total = 0;
    for (let l = 0; l < s.length; l++) {
        const count = new Array(26).fill(0);
        let unique = 0;
        for (let r = l; r < s.length; r++) {
            const c = ++count[s.charCodeAt(r) - 65];
            if (c === 1) unique++;
            else if (c === 2) unique--;
            total += unique;
        }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Previous and next occurrence',
        idea: 's[i] is the only copy of its letter in substrings that start after the previous copy and end before the next one: (i − prev[i]) × (next[i] − i).',
        steps: [
          'Left to right, record `prev[i]` (−1 if none); right to left, `next[i]` (n if none).',
          'Add `(i − prev[i]) × (next[i] − i)` for every `i`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each letter copy\'s contribution is a product of two distances, so no substring is ever listed.',
        code: {
          java: r`class Solution {
    public int uniqueLetterString(String s) {
        int n = s.length();
        int[] prev = new int[n], next = new int[n], seen = new int[26];
        Arrays.fill(seen, -1);
        for (int i = 0; i < n; i++) { int c = s.charAt(i) - 'A'; prev[i] = seen[c]; seen[c] = i; }
        Arrays.fill(seen, n);
        for (int i = n - 1; i >= 0; i--) { int c = s.charAt(i) - 'A'; next[i] = seen[c]; seen[c] = i; }
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) (i - prev[i]) * (next[i] - i);
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int uniqueLetterString(string s) {
        int n = s.size();
        vector<int> prev(n), next(n), seen(26, -1);
        for (int i = 0; i < n; i++) { prev[i] = seen[s[i] - 'A']; seen[s[i] - 'A'] = i; }
        fill(seen.begin(), seen.end(), n);
        for (int i = n - 1; i >= 0; i--) { next[i] = seen[s[i] - 'A']; seen[s[i] - 'A'] = i; }
        long long total = 0;
        for (int i = 0; i < n; i++) total += (long long) (i - prev[i]) * (next[i] - i);
        return total;
    }
};`,
          python: r`class Solution:
    def uniqueLetterString(self, s: str) -> int:
        n = len(s)
        prev, nxt, seen = [0] * n, [0] * n, {}
        for i, c in enumerate(s):
            prev[i] = seen.get(c, -1)
            seen[c] = i
        seen = {}
        for i in range(n - 1, -1, -1):
            nxt[i] = seen.get(s[i], n)
            seen[s[i]] = i
        return sum((i - prev[i]) * (nxt[i] - i) for i in range(n))`,
          javascript: r`var uniqueLetterString = function(s) {
    const n = s.length, prev = new Array(n), next = new Array(n);
    let seen = new Array(26).fill(-1);
    for (let i = 0; i < n; i++) { const c = s.charCodeAt(i) - 65; prev[i] = seen[c]; seen[c] = i; }
    seen = new Array(26).fill(n);
    for (let i = n - 1; i >= 0; i--) { const c = s.charCodeAt(i) - 65; next[i] = seen[c]; seen[c] = i; }
    let total = 0;
    for (let i = 0; i < n; i++) total += (i - prev[i]) * (next[i] - i);
    return total;
};`,
        },
      },
    ],
  },

  'count-subarrays-with-score-less-than-k': {
    pattern: 'Sliding window + contribution: right end r adds r − l + 1',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'From each start, extend to the right with a running sum; stop once sum × length reaches k (it only grows).',
        steps: [
          'For each start `l`, keep a running `sum`.',
          'Extend `r` while `sum × (r − l + 1) < k`, counting each step.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'With small values and a huge k, every start walks to the end: about 5 × 10⁹ steps.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, long k) {
        long count = 0;
        for (int l = 0; l < nums.length; l++) {
            long sum = 0;
            for (int r = l; r < nums.length; r++) {
                sum += nums[r];
                if (sum * (r - l + 1) >= k) break;   // only grows from here
                count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, long long k) {
        long long count = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++) {
            long long sum = 0;
            for (int r = l; r < n; r++) {
                sum += nums[r];
                if (sum * (r - l + 1) >= k) break;
                count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        count = 0
        for l in range(len(nums)):
            total = 0
            for r in range(l, len(nums)):
                total += nums[r]
                if total * (r - l + 1) >= k:
                    break
                count += 1
        return count`,
          javascript: r`var countSubarrays = function(nums, k) {
    let count = 0;
    for (let l = 0; l < nums.length; l++) {
        let sum = 0;
        for (let r = l; r < nums.length; r++) {
            sum += nums[r];
            if (sum * (r - l + 1) >= k) break;
            count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window, count at the right end',
        idea: 'Keep the longest window ending at r with score < k; every subarray ending at r inside it is valid: r − l + 1 of them.',
        steps: [
          'Add `nums[r]` to `sum`.',
          'While `sum × (r − l + 1) ≥ k`, subtract `nums[l++]`.',
          'Add `r − l + 1` (64-bit).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Positive values make validity monotone, so each pointer only moves forward and each subarray is counted once.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, long k) {
        long sum = 0, count = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            sum += nums[r];
            while (sum * (r - l + 1) >= k) sum -= nums[l++];
            count += r - l + 1;                     // subarrays ending at r
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, long long k) {
        long long sum = 0, count = 0;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            sum += nums[r];
            while (sum * (r - l + 1) >= k) sum -= nums[l++];
            count += r - l + 1;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        total = count = l = 0
        for r, x in enumerate(nums):
            total += x
            while total * (r - l + 1) >= k:
                total -= nums[l]
                l += 1
            count += r - l + 1
        return count`,
          javascript: r`var countSubarrays = function(nums, k) {
    let sum = 0, count = 0, l = 0;
    for (let r = 0; r < nums.length; r++) {
        sum += nums[r];
        while (sum * (r - l + 1) >= k) sum -= nums[l++];
        count += r - l + 1;
    }
    return count;
};`,
        },
      },
    ],
  },

  'sum-of-total-strength-of-wizards': {
    pattern: 'Contribution with a monotonic stack + prefix sums of prefix sums',
    approaches: [
      {
        level: 'Brute force', name: 'Every group with a running min and sum',
        idea: 'Fix the start and extend the end, keeping the running minimum and sum; add min × sum for each group.',
        steps: [
          'For each start `l`, set `mn = ∞` and `sum = 0`.',
          'For each end `r`: update `mn` and `sum`, add `mn × sum` modulo 10⁹ + 7.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About 5 × 10⁹ groups for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int totalStrength(int[] strength) {
        final long MOD = 1_000_000_007;
        long total = 0;
        for (int l = 0; l < strength.length; l++) {
            long mn = Long.MAX_VALUE, sum = 0;
            for (int r = l; r < strength.length; r++) {
                mn = Math.min(mn, strength[r]);
                sum = (sum + strength[r]) % MOD;
                total = (total + mn % MOD * sum) % MOD;
            }
        }
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int totalStrength(vector<int>& strength) {
        const long long MOD = 1000000007;
        long long total = 0;
        int n = strength.size();
        for (int l = 0; l < n; l++) {
            long long mn = LLONG_MAX, sum = 0;
            for (int r = l; r < n; r++) {
                mn = min(mn, (long long) strength[r]);
                sum = (sum + strength[r]) % MOD;
                total = (total + mn % MOD * sum) % MOD;
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def totalStrength(self, strength: List[int]) -> int:
        MOD = 10**9 + 7
        total = 0
        for l in range(len(strength)):
            mn, s = float('inf'), 0
            for r in range(l, len(strength)):
                mn = min(mn, strength[r])
                s += strength[r]
                total += mn * s
        return total % MOD`,
          javascript: r`var totalStrength = function(strength) {
    const MOD = 1000000007n;
    let total = 0n;
    for (let l = 0; l < strength.length; l++) {
        let mn = Infinity, sum = 0n;
        for (let r = l; r < strength.length; r++) {
            mn = Math.min(mn, strength[r]);
            sum = (sum + BigInt(strength[r])) % MOD;
            total = (total + BigInt(mn) * sum) % MOD;
        }
    }
    return Number(total);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack spans + prefix of prefix sums',
        idea: 'Credit each group to its weakest wizard (strict on the left, non-strict on the right). For i, the groups are starts prev+1 … i and ends i … next−1; their sums total (i − prev)·ΣP[i+1..next] − (next − i)·ΣP[prev+1..i].',
        steps: [
          'Monotonic stack: previous strictly smaller index `prev[i]`, next smaller-or-equal index `next[i]`.',
          'Prefix sums `P` and prefix sums of those, `PP`, all modulo 10⁹ + 7.',
          'For each `i`, combine the two `PP` ranges as above and add `strength[i] ×` the result.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'The stack gives each wizard\'s span in O(n) total, and PP turns "sum of all group sums in the span" into O(1).',
        code: {
          java: r`class Solution {
    public int totalStrength(int[] strength) {
        final long MOD = 1_000_000_007;
        int n = strength.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && strength[st.peek()] >= strength[i]) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long[] p = new long[n + 1], pp = new long[n + 2];          // pp[k] = p[0] + … + p[k − 1]
        for (int i = 0; i < n; i++) p[i + 1] = (p[i] + strength[i]) % MOD;
        for (int i = 0; i <= n; i++) pp[i + 1] = (pp[i] + p[i]) % MOD;
        long total = 0;
        for (int i = 0; i < n; i++) {
            int l = prev[i], r = next[i];
            long ends = (pp[r + 1] - pp[i + 1] + MOD) % MOD * (i - l) % MOD;     // P[i+1..r], once per start
            long starts = (pp[i + 1] - pp[l + 1] + MOD) % MOD * (r - i) % MOD;   // P[l+1..i], once per end
            total = (total + strength[i] * ((ends - starts + MOD) % MOD)) % MOD;
        }
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int totalStrength(vector<int>& strength) {
        const long long MOD = 1000000007;
        int n = strength.size();
        vector<int> prev(n), next(n, n), st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && strength[st.back()] >= strength[i]) { next[st.back()] = i; st.pop_back(); }
            prev[i] = st.empty() ? -1 : st.back();
            st.push_back(i);
        }
        vector<long long> p(n + 1, 0), pp(n + 2, 0);
        for (int i = 0; i < n; i++) p[i + 1] = (p[i] + strength[i]) % MOD;
        for (int i = 0; i <= n; i++) pp[i + 1] = (pp[i] + p[i]) % MOD;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            int l = prev[i], r = next[i];
            long long ends = (pp[r + 1] - pp[i + 1] + MOD) % MOD * (i - l) % MOD;
            long long starts = (pp[i + 1] - pp[l + 1] + MOD) % MOD * (r - i) % MOD;
            total = (total + strength[i] * ((ends - starts + MOD) % MOD)) % MOD;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def totalStrength(self, strength: List[int]) -> int:
        MOD = 10**9 + 7
        n = len(strength)
        prev, nxt, st = [-1] * n, [n] * n, []
        for i, x in enumerate(strength):
            while st and strength[st[-1]] >= x:
                nxt[st.pop()] = i
            prev[i] = st[-1] if st else -1
            st.append(i)
        p = [0] * (n + 1)
        for i, x in enumerate(strength):
            p[i + 1] = p[i] + x
        pp = [0] * (n + 2)
        for i in range(n + 1):
            pp[i + 1] = pp[i] + p[i]
        total = 0
        for i, x in enumerate(strength):
            l, r = prev[i], nxt[i]
            total += x * ((pp[r + 1] - pp[i + 1]) * (i - l) - (pp[i + 1] - pp[l + 1]) * (r - i))
        return total % MOD`,
          javascript: r`var totalStrength = function(strength) {
    const MOD = 1000000007n, n = strength.length;
    const prev = new Array(n), next = new Array(n).fill(n), st = [];
    for (let i = 0; i < n; i++) {
        while (st.length && strength[st.at(-1)] >= strength[i]) next[st.pop()] = i;
        prev[i] = st.length ? st.at(-1) : -1;
        st.push(i);
    }
    const p = new Array(n + 1).fill(0n), pp = new Array(n + 2).fill(0n);
    for (let i = 0; i < n; i++) p[i + 1] = (p[i] + BigInt(strength[i])) % MOD;
    for (let i = 0; i <= n; i++) pp[i + 1] = (pp[i] + p[i]) % MOD;
    let total = 0n;
    for (let i = 0; i < n; i++) {
        const l = prev[i], r = next[i];
        const ends = (pp[r + 1] - pp[i + 1] + MOD) % MOD * BigInt(i - l) % MOD;
        const starts = (pp[i + 1] - pp[l + 1] + MOD) % MOD * BigInt(r - i) % MOD;
        total = (total + BigInt(strength[i]) * ((ends - starts + MOD) % MOD)) % MOD;   // BigInt: 10⁹ × 10⁹ > 2⁵³
    }
    return Number(total);
};`,
        },
      },
    ],
  },

  'sum-of-distances-in-tree': {
    pattern: 'Edge contribution for the root, then rerooting',
    approaches: [
      {
        level: 'Brute force', name: 'BFS from every node',
        idea: 'Run a BFS from each node and add up the distances it finds.',
        steps: [
          'Build the adjacency list.',
          'For every node `s`, BFS and set `ans[s]` = sum of distances.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: '9 × 10⁸ steps for n = 3 × 10⁴.',
        code: {
          java: r`class Solution {
    public int[] sumOfDistancesInTree(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] ans = new int[n], dist = new int[n], q = new int[n];
        for (int s = 0; s < n; s++) {
            Arrays.fill(dist, -1);
            dist[s] = 0;
            int head = 0, tail = 0;
            q[tail++] = s;
            while (head < tail) {
                int v = q[head++];
                ans[s] += dist[v];
                for (int c : adj.get(v)) if (dist[c] < 0) { dist[c] = dist[v] + 1; q[tail++] = c; }
            }
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
        vector<vector<int>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        vector<int> ans(n, 0), dist(n), q(n);
        for (int s = 0; s < n; s++) {
            fill(dist.begin(), dist.end(), -1);
            dist[s] = 0;
            int head = 0, tail = 0;
            q[tail++] = s;
            while (head < tail) {
                int v = q[head++];
                ans[s] += dist[v];
                for (int c : adj[v]) if (dist[c] < 0) { dist[c] = dist[v] + 1; q[tail++] = c; }
            }
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def sumOfDistancesInTree(self, n: int, edges: List[List[int]]) -> List[int]:
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        ans = [0] * n
        for s in range(n):
            dist = [-1] * n
            dist[s] = 0
            q = [s]
            for v in q:
                ans[s] += dist[v]
                for c in adj[v]:
                    if dist[c] < 0:
                        dist[c] = dist[v] + 1
                        q.append(c)
        return ans`,
          javascript: r`var sumOfDistancesInTree = function(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    const ans = new Array(n).fill(0);
    for (let s = 0; s < n; s++) {
        const dist = new Array(n).fill(-1), q = [s];
        dist[s] = 0;
        for (let h = 0; h < q.length; h++) {
            const v = q[h];
            ans[s] += dist[v];
            for (const c of adj[v]) if (dist[c] < 0) { dist[c] = dist[v] + 1; q.push(c); }
        }
    }
    return ans;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Subtree sizes, then rerooting',
        idea: 'ans[0] = Σ size[v] over non-root v (each node below an edge uses it once to reach 0). Moving the root to a child c: ans[c] = ans[parent] − size[c] + (n − size[c]).',
        steps: [
          'BFS from 0 for parents and an order; walk it backwards to get subtree sizes and `ans[0]`.',
          'Walk the order forwards: `ans[v] = ans[parent[v]] − size[v] + (n − size[v])`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Edge contribution gives one answer in O(n), and each reroot step changes it in O(1); both passes are iterative, so deep trees are safe.',
        code: {
          java: r`class Solution {
    public int[] sumOfDistancesInTree(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n], order = new int[n], size = new int[n], ans = new int[n];
        parent[0] = -1;
        int len = 0;
        order[len++] = 0;
        for (int k = 0; k < len; k++)
            for (int c : adj.get(order[k])) if (c != parent[order[k]]) { parent[c] = order[k]; order[len++] = c; }
        for (int k = n - 1; k >= 0; k--) {
            int v = order[k];
            size[v] += 1;
            if (v != 0) { size[parent[v]] += size[v]; ans[0] += size[v]; }   // size[v] paths from 0 use the edge above v
        }
        for (int k = 1; k < n; k++) {
            int v = order[k];
            ans[v] = ans[parent[v]] - size[v] + (n - size[v]);              // closer to size[v], farther from the rest
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
        vector<vector<int>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        vector<int> parent(n, -1), order{0}, size(n, 0), ans(n, 0);
        for (int k = 0; k < (int) order.size(); k++)
            for (int c : adj[order[k]]) if (c != parent[order[k]]) { parent[c] = order[k]; order.push_back(c); }
        for (int k = n - 1; k >= 0; k--) {
            int v = order[k];
            size[v] += 1;
            if (v != 0) { size[parent[v]] += size[v]; ans[0] += size[v]; }
        }
        for (int k = 1; k < n; k++) {
            int v = order[k];
            ans[v] = ans[parent[v]] - size[v] + (n - size[v]);
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def sumOfDistancesInTree(self, n: int, edges: List[List[int]]) -> List[int]:
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        parent, order, size, ans = [-1] * n, [0], [0] * n, [0] * n
        for v in order:
            for c in adj[v]:
                if c != parent[v]:
                    parent[c] = v
                    order.append(c)
        for v in reversed(order):
            size[v] += 1
            if v:
                size[parent[v]] += size[v]
                ans[0] += size[v]
        for v in order[1:]:
            ans[v] = ans[parent[v]] - size[v] + (n - size[v])
        return ans`,
          javascript: r`var sumOfDistancesInTree = function(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    const parent = new Array(n).fill(-1), order = [0], size = new Array(n).fill(0), ans = new Array(n).fill(0);
    for (let k = 0; k < order.length; k++)
        for (const c of adj[order[k]]) if (c !== parent[order[k]]) { parent[c] = order[k]; order.push(c); }
    for (let k = n - 1; k >= 0; k--) {
        const v = order[k];
        size[v] += 1;
        if (v !== 0) { size[parent[v]] += size[v]; ans[0] += size[v]; }
    }
    for (let k = 1; k < n; k++) {
        const v = order[k];
        ans[v] = ans[parent[v]] - size[v] + (n - size[v]);
    }
    return ans;
};`,
        },
      },
    ],
  },
};
