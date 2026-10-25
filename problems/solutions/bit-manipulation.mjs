const r = String.raw;

export default {
  'single-number': {
    pattern: 'XOR cancellation: x ^ x = 0 and x ^ 0 = x',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value with a nested loop',
        idea: 'For each element, count how many times it appears in the array; the one that appears once is the answer.',
        steps: [
          'For each index `i`, scan the whole array counting elements equal to `nums[i]`.',
          'Return `nums[i]` when its count is 1.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n scans of length n.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        for (int x : nums) {
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count == 1) return x;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        for (int x : nums)
            if (count(nums.begin(), nums.end(), x) == 1) return x;
        return -1;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        for x in nums:
            if nums.count(x) == 1:
                return x
        return -1`,
          javascript: r`var singleNumber = function(nums) {
    for (const x of nums) {
        let count = 0;
        for (const y of nums) if (y === x) count++;
        if (count === 1) return x;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash map of counts',
        idea: 'Count every value in one pass, then return the one with count 1.',
        steps: [
          'Build a map value → count.',
          'Return the key whose count is 1.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear time, but the map breaks the O(1) extra-space requirement.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        for (Map.Entry<Integer, Integer> e : count.entrySet())
            if (e.getValue() == 1) return e.getKey();
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        for (auto& [x, c] : count)
            if (c == 1) return x;
        return -1;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        return next(x for x, c in Counter(nums).items() if c == 1)`,
          javascript: r`var singleNumber = function(nums) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
    for (const [x, c] of count) if (c === 1) return x;
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'XOR everything',
        idea: 'XOR is commutative and associative, `x ^ x = 0` and `x ^ 0 = x`. XOR-ing the whole array cancels every pair and leaves the single value.',
        steps: [
          'Start with `result = 0`.',
          'XOR every element into it and return `result`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass and one variable. Works for negative numbers too, since XOR acts bit by bit.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int x : nums) result ^= x;
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int x : nums) result ^= x;
        return result;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for x in nums:
            result ^= x
        return result`,
          javascript: r`var singleNumber = function(nums) {
    let result = 0;
    for (const x of nums) result ^= x;
    return result;
};`,
        },
      },
    ],
  },

  'number-of-1-bits': {
    pattern: 'Bit tricks: n & (n − 1) clears the lowest set bit',
    approaches: [
      {
        level: 'Brute force', name: 'Write it out in binary and count the 1s',
        idea: 'Convert the 32-bit pattern to a binary string and count the `1` characters.',
        steps: [
          'Turn the value into its unsigned 32-bit binary string.',
          'Count the `1` characters.',
        ],
        time: 'O(w)', space: 'O(w)',
        why: 'w = 32 characters are built and scanned. Negative inputs need the unsigned view: `& 0xFFFFFFFF` in Python, `>>> 0` in JavaScript.',
        code: {
          java: r`class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        for (char c : Integer.toBinaryString(n).toCharArray()) if (c == '1') count++;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int hammingWeight(int n) {
        string s = bitset<32>(n).to_string();
        return count(s.begin(), s.end(), '1');
    }
};`,
          python: r`class Solution:
    def hammingWeight(self, n: int) -> int:
        return bin(n & 0xFFFFFFFF).count('1')`,
          javascript: r`var hammingWeight = function(n) {
    return (n >>> 0).toString(2).split('').filter((c) => c === '1').length;
};`,
        },
      },
      {
        level: 'Better', name: 'Check all 32 bits',
        idea: 'Look at each bit position with a shift and a mask.',
        steps: [
          'For `i` from 0 to 31: add `(n >>> i) & 1` to the count.',
          'Return the count.',
        ],
        time: 'O(w)', space: 'O(1)',
        why: 'Exactly 32 iterations, no extra memory. The unsigned shift `>>>` keeps the sign bit from smearing across.',
        code: {
          java: r`class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        for (int i = 0; i < 32; i++) count += (n >>> i) & 1;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int hammingWeight(int n) {
        unsigned u = n;
        int count = 0;
        for (int i = 0; i < 32; i++) count += (u >> i) & 1;
        return count;
    }
};`,
          python: r`class Solution:
    def hammingWeight(self, n: int) -> int:
        return sum((n >> i) & 1 for i in range(32))`,
          javascript: r`var hammingWeight = function(n) {
    let count = 0;
    for (let i = 0; i < 32; i++) count += (n >>> i) & 1;
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Brian Kernighan: clear the lowest set bit',
        idea: '`n & (n − 1)` removes exactly the lowest 1 bit, so the loop runs once per set bit instead of once per bit position.',
        steps: [
          'While `n != 0`: `n &= n − 1` and count one.',
          'Return the count.',
        ],
        time: 'O(k)', space: 'O(1)',
        why: 'k = number of set bits (≤ 32). C++ uses `unsigned` so `n − 1` cannot overflow at INT_MIN; Python masks to 32 bits first.',
        code: {
          java: r`class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;
            count++;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int hammingWeight(int n) {
        unsigned u = n;
        int count = 0;
        while (u) {
            u &= u - 1;
            count++;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def hammingWeight(self, n: int) -> int:
        n &= 0xFFFFFFFF
        count = 0
        while n:
            n &= n - 1
            count += 1
        return count`,
          javascript: r`var hammingWeight = function(n) {
    let count = 0;
    while (n !== 0) {
        n &= n - 1;
        count++;
    }
    return count;
};`,
        },
      },
    ],
  },

  'power-of-two': {
    pattern: 'A power of two has exactly one set bit, so n & (n − 1) == 0',
    approaches: [
      {
        level: 'Brute force', name: 'Keep dividing by 2',
        idea: 'A positive power of two reaches 1 when repeatedly halved, without ever hitting an odd number above 1.',
        steps: [
          'If `n ≤ 0`, return false.',
          'While `n` is even, halve it.',
          'Return `n == 1`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'At most 31 halvings.',
        code: {
          java: r`class Solution {
    public boolean isPowerOfTwo(int n) {
        if (n <= 0) return false;
        while (n % 2 == 0) n /= 2;
        return n == 1;
    }
}`,
          cpp: r`class Solution {
public:
    bool isPowerOfTwo(int n) {
        if (n <= 0) return false;
        while (n % 2 == 0) n /= 2;
        return n == 1;
    }
};`,
          python: r`class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        if n <= 0:
            return False
        while n % 2 == 0:
            n //= 2
        return n == 1`,
          javascript: r`var isPowerOfTwo = function(n) {
    if (n <= 0) return false;
    while (n % 2 === 0) n /= 2;
    return n === 1;
};`,
        },
      },
      {
        level: 'Better', name: 'Count the set bits',
        idea: 'A positive number is a power of two exactly when it has a single 1 bit.',
        steps: [
          'If `n ≤ 0`, return false.',
          'Return `popcount(n) == 1`.',
        ],
        time: 'O(w)', space: 'O(1)',
        why: 'Bit counting looks at up to w = 32 bits (often one hardware instruction).',
        code: {
          java: r`class Solution {
    public boolean isPowerOfTwo(int n) {
        return n > 0 && Integer.bitCount(n) == 1;
    }
}`,
          cpp: r`class Solution {
public:
    bool isPowerOfTwo(int n) {
        return n > 0 && __builtin_popcount(n) == 1;
    }
};`,
          python: r`class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        return n > 0 and bin(n).count('1') == 1`,
          javascript: r`var isPowerOfTwo = function(n) {
    if (n <= 0) return false;
    let bits = 0;
    for (let x = n; x; x >>>= 1) bits += x & 1;
    return bits === 1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'n & (n − 1) == 0',
        idea: 'Subtracting 1 flips the lowest set bit and every bit below it. If that was the only set bit, `n & (n − 1)` is 0.',
        steps: [
          'Return `n > 0 && (n & (n − 1)) == 0`.',
          'The `n > 0` check rules out 0 and every negative number (including −2³¹, whose only set bit is the sign bit).',
        ],
        time: 'O(1)', space: 'O(1)',
        why: 'Two operations, no loop.',
        code: {
          java: r`class Solution {
    public boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}`,
          cpp: r`class Solution {
public:
    bool isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
};`,
          python: r`class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        return n > 0 and n & (n - 1) == 0`,
          javascript: r`var isPowerOfTwo = function(n) {
    return n > 0 && (n & (n - 1)) === 0;
};`,
        },
      },
    ],
  },

  'missing-number': {
    pattern: 'XOR (or Gauss sum) of indices against values',
    approaches: [
      {
        level: 'Brute force', name: 'Search for each candidate',
        idea: 'Try every value 0..n and scan the array to see whether it is there.',
        steps: [
          'For `v` from 0 to n: scan `nums` for `v`.',
          'Return the first `v` that is not found.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n + 1 candidates, each a linear scan.',
        code: {
          java: r`class Solution {
    public int missingNumber(int[] nums) {
        for (int v = 0; ; v++) {
            boolean found = false;
            for (int x : nums) if (x == v) { found = true; break; }
            if (!found) return v;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int missingNumber(vector<int>& nums) {
        for (int v = 0; ; v++)
            if (find(nums.begin(), nums.end(), v) == nums.end()) return v;
    }
};`,
          python: r`class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        for v in range(len(nums) + 1):
            if v not in nums:
                return v`,
          javascript: r`var missingNumber = function(nums) {
    for (let v = 0; ; v++) if (!nums.includes(v)) return v;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash set',
        idea: 'Put every value in a set, then check 0..n against it in O(1) each.',
        steps: [
          'Insert all of `nums` into a set.',
          'Return the first `v` in 0..n not in the set.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear time but O(n) extra memory.',
        code: {
          java: r`class Solution {
    public int missingNumber(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) seen.add(x);
        int v = 0;
        while (seen.contains(v)) v++;
        return v;
    }
}`,
          cpp: r`class Solution {
public:
    int missingNumber(vector<int>& nums) {
        unordered_set<int> seen(nums.begin(), nums.end());
        int v = 0;
        while (seen.count(v)) v++;
        return v;
    }
};`,
          python: r`class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        seen = set(nums)
        v = 0
        while v in seen:
            v += 1
        return v`,
          javascript: r`var missingNumber = function(nums) {
    const seen = new Set(nums);
    let v = 0;
    while (seen.has(v)) v++;
    return v;
};`,
        },
      },
      {
        level: 'Optimal', name: 'XOR indices with values',
        idea: 'XOR together every index 0..n and every value. Each present number appears twice (once as an index, once as a value) and cancels; only the missing number is left.',
        steps: [
          'Start with `result = n` (the one index that has no array slot).',
          'For each `i`, `result ^= i ^ nums[i]`.',
          'Return `result`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass, one variable. Equivalent alternative: `n(n + 1)/2 − sum(nums)`; XOR has no overflow risk in fixed-width languages.',
        code: {
          java: r`class Solution {
    public int missingNumber(int[] nums) {
        int result = nums.length;
        for (int i = 0; i < nums.length; i++) result ^= i ^ nums[i];
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int result = nums.size();
        for (int i = 0; i < (int) nums.size(); i++) result ^= i ^ nums[i];
        return result;
    }
};`,
          python: r`class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        result = len(nums)
        for i, x in enumerate(nums):
            result ^= i ^ x
        return result`,
          javascript: r`var missingNumber = function(nums) {
    let result = nums.length;
    for (let i = 0; i < nums.length; i++) result ^= i ^ nums[i];
    return result;
};`,
        },
      },
    ],
  },

  'counting-bits': {
    pattern: 'DP on bits: ans[i] = ans[i >> 1] + (i & 1)',
    approaches: [
      {
        level: 'Brute force', name: 'Count bits of each number separately',
        idea: 'For each i from 0 to n, count its 1 bits with a loop.',
        steps: [
          'For each `i`, repeatedly add `x & 1` and shift `x` right until it is 0.',
          'Store the count in `ans[i]`.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'Each number takes O(log i) shifts. Space excludes the output array.',
        code: {
          java: r`class Solution {
    public int[] countBits(int n) {
        int[] ans = new int[n + 1];
        for (int i = 0; i <= n; i++)
            for (int x = i; x != 0; x >>= 1) ans[i] += x & 1;
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> ans(n + 1, 0);
        for (int i = 0; i <= n; i++)
            for (int x = i; x; x >>= 1) ans[i] += x & 1;
        return ans;
    }
};`,
          python: r`class Solution:
    def countBits(self, n: int) -> List[int]:
        return [bin(i).count('1') for i in range(n + 1)]`,
          javascript: r`var countBits = function(n) {
    const ans = new Array(n + 1).fill(0);
    for (let i = 0; i <= n; i++)
        for (let x = i; x; x >>= 1) ans[i] += x & 1;
    return ans;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Reuse the answer for i >> 1',
        idea: '`i >> 1` is `i` without its last bit, and it is smaller, so its count is already known. Add back the last bit.',
        steps: [
          '`ans[0] = 0`.',
          'For `i` from 1 to n: `ans[i] = ans[i >> 1] + (i & 1)`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'O(1) per number. (`ans[i] = ans[i & (i − 1)] + 1` works the same way, by dropping the lowest set bit.)',
        code: {
          java: r`class Solution {
    public int[] countBits(int n) {
        int[] ans = new int[n + 1];
        for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> ans(n + 1, 0);
        for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
        return ans;
    }
};`,
          python: r`class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)
        return ans`,
          javascript: r`var countBits = function(n) {
    const ans = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    return ans;
};`,
        },
      },
    ],
  },

  'reverse-bits': {
    pattern: 'Bit shifting: pull bits off one end and push them onto the other (or swap halves with masks)',
    approaches: [
      {
        level: 'Brute force', name: 'Reverse the 32-character binary string',
        idea: 'Write the value as exactly 32 binary digits, reverse the string, and parse it back as an unsigned 32-bit number, reinterpreted as a signed int.',
        steps: [
          'Build the 32-digit binary string (padding with leading zeros).',
          'Reverse it and parse it base 2.',
          'Reinterpret as a signed 32-bit value.',
        ],
        time: 'O(w)', space: 'O(w)',
        why: 'w = 32 characters are built, reversed and parsed.',
        code: {
          java: r`class Solution {
    public int reverseBits(int n) {
        String bits = String.format("%32s", Integer.toBinaryString(n)).replace(' ', '0');
        return Integer.parseUnsignedInt(new StringBuilder(bits).reverse().toString(), 2);
    }
}`,
          cpp: r`class Solution {
public:
    int reverseBits(int n) {
        string s = bitset<32>(n).to_string();
        reverse(s.begin(), s.end());
        return (int) bitset<32>(s).to_ulong();
    }
};`,
          python: r`class Solution:
    def reverseBits(self, n: int) -> int:
        value = int(format(n & 0xFFFFFFFF, '032b')[::-1], 2)
        return value - (1 << 32) if value >= 1 << 31 else value`,
          javascript: r`var reverseBits = function(n) {
    const bits = (n >>> 0).toString(2).padStart(32, '0');
    return parseInt(bits.split('').reverse().join(''), 2) | 0;
};`,
        },
      },
      {
        level: 'Better', name: 'Move the bits one at a time',
        idea: 'Take bits off the low end of `n` and push them onto the low end of the result, shifting the result left each time. After 32 steps the first bit taken is at the top.',
        steps: [
          'Repeat 32 times: `result = (result << 1) | (n & 1)`; `n >>>= 1`.',
          'Return `result` (as a signed 32-bit value).',
        ],
        time: 'O(w)', space: 'O(1)',
        why: 'Exactly w = 32 iterations, no strings.',
        code: {
          java: r`class Solution {
    public int reverseBits(int n) {
        int result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>>= 1;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    int reverseBits(int n) {
        unsigned u = n, result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (u & 1);
            u >>= 1;
        }
        return (int) result;
    }
};`,
          python: r`class Solution:
    def reverseBits(self, n: int) -> int:
        n &= 0xFFFFFFFF
        result = 0
        for _ in range(32):
            result = (result << 1) | (n & 1)
            n >>= 1
        return result - (1 << 32) if result >= 1 << 31 else result`,
          javascript: r`var reverseBits = function(n) {
    let result = 0;
    for (let i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>>= 1;
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Swap halves with masks (divide and conquer)',
        idea: 'Reversing 32 bits = swap the two 16-bit halves, then swap the bytes inside each half, then the nibbles, then bit pairs, then single bits. Each level is one mask-and-shift for all positions at once.',
        steps: [
          'Swap 16-bit halves: `n = (n >>> 16) | (n << 16)`.',
          'Swap bytes: `((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8)`.',
          'Repeat with `0xf0f0f0f0` / `0x0f0f0f0f` (shift 4), `0xcccccccc` / `0x33333333` (shift 2), `0xaaaaaaaa` / `0x55555555` (shift 1).',
        ],
        time: 'O(log w)', space: 'O(1)',
        why: 'log₂ 32 = 5 rounds of a few operations, no loop. This is what `Integer.reverse` does internally.',
        code: {
          java: r`class Solution {
    public int reverseBits(int n) {
        n = (n >>> 16) | (n << 16);
        n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);
        n = ((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4);
        n = ((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2);
        n = ((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1);
        return n;
    }
}`,
          cpp: r`class Solution {
public:
    int reverseBits(int n) {
        uint32_t u = n;
        u = (u >> 16) | (u << 16);
        u = ((u & 0xff00ff00u) >> 8) | ((u & 0x00ff00ffu) << 8);
        u = ((u & 0xf0f0f0f0u) >> 4) | ((u & 0x0f0f0f0fu) << 4);
        u = ((u & 0xccccccccu) >> 2) | ((u & 0x33333333u) << 2);
        u = ((u & 0xaaaaaaaau) >> 1) | ((u & 0x55555555u) << 1);
        return (int) u;
    }
};`,
          python: r`class Solution:
    def reverseBits(self, n: int) -> int:
        n &= 0xFFFFFFFF
        n = ((n >> 16) | (n << 16)) & 0xFFFFFFFF
        n = ((n & 0xff00ff00) >> 8) | ((n & 0x00ff00ff) << 8)
        n = ((n & 0xf0f0f0f0) >> 4) | ((n & 0x0f0f0f0f) << 4)
        n = ((n & 0xcccccccc) >> 2) | ((n & 0x33333333) << 2)
        n = ((n & 0xaaaaaaaa) >> 1) | ((n & 0x55555555) << 1)
        return n - (1 << 32) if n >= 1 << 31 else n`,
          javascript: r`var reverseBits = function(n) {
    n = (n >>> 16) | (n << 16);
    n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);
    n = ((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4);
    n = ((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2);
    n = ((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1);
    return n;
};`,
        },
      },
    ],
  },

  'single-number-ii': {
    pattern: 'Per-bit counting modulo 3, compressed into a two-variable state machine (ones, twos)',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value with a nested loop',
        idea: 'For each element, count its occurrences; return the one that appears once.',
        steps: [
          'For each value, scan the array counting equal elements.',
          'Return it when the count is 1.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n scans of length n.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        for (int x : nums) {
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count == 1) return x;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        for (int x : nums)
            if (count(nums.begin(), nums.end(), x) == 1) return x;
        return -1;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        for x in nums:
            if nums.count(x) == 1:
                return x
        return -1`,
          javascript: r`var singleNumber = function(nums) {
    for (const x of nums) {
        let count = 0;
        for (const y of nums) if (y === x) count++;
        if (count === 1) return x;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash map of counts',
        idea: 'Count every value in one pass and return the one with count 1.',
        steps: [
          'Build a map value → count.',
          'Return the key whose count is 1.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear time, but O(n) extra memory.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        for (Map.Entry<Integer, Integer> e : count.entrySet())
            if (e.getValue() == 1) return e.getKey();
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        for (auto& [x, c] : count)
            if (c == 1) return x;
        return -1;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        return next(x for x, c in Counter(nums).items() if c == 1)`,
          javascript: r`var singleNumber = function(nums) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
    for (const [x, c] of count) if (c === 1) return x;
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Count each bit modulo 3',
        idea: 'For every bit position, the values appearing three times contribute a multiple of 3 set bits. So `count % 3` at each position is exactly the single value\'s bit.',
        steps: [
          'For each of the 32 bit positions, count how many numbers have that bit set.',
          'If `count % 3 == 1`, set that bit in the result.',
          'The sign bit is handled like any other in 32-bit arithmetic (Python converts the 32-bit pattern back to a signed value).',
        ],
        time: 'O(w·n)', space: 'O(1)',
        why: '32 passes over the array, constant memory.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int bit = 0; bit < 32; bit++) {
            int count = 0;
            for (int x : nums) count += (x >>> bit) & 1;
            if (count % 3 == 1) result |= 1 << bit;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        unsigned result = 0;
        for (int bit = 0; bit < 32; bit++) {
            int count = 0;
            for (int x : nums) count += ((unsigned) x >> bit) & 1;
            if (count % 3 == 1) result |= 1u << bit;
        }
        return (int) result;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for bit in range(32):
            if sum((x >> bit) & 1 for x in nums) % 3:
                result |= 1 << bit
        return result - (1 << 32) if result >= 1 << 31 else result`,
          javascript: r`var singleNumber = function(nums) {
    let result = 0;
    for (let bit = 0; bit < 32; bit++) {
        let count = 0;
        for (const x of nums) count += (x >>> bit) & 1;
        if (count % 3 === 1) result |= 1 << bit;
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'ones / twos state machine',
        idea: 'Track, for all 32 bits at once, whether each bit has been seen 1 time (`ones`) or 2 times (`twos`) modulo 3. A third occurrence clears both. What survives in `ones` is the single value.',
        steps: [
          'Start `ones = twos = 0`.',
          'For each `x`: `ones = (ones ^ x) & ~twos`; then `twos = (twos ^ x) & ~ones`.',
          'Return `ones`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass, two variables — the bit-count idea with each per-bit counter (0 → 1 → 2 → 0) stored across the two words.',
        code: {
          java: r`class Solution {
    public int singleNumber(int[] nums) {
        int ones = 0, twos = 0;
        for (int x : nums) {
            ones = (ones ^ x) & ~twos;
            twos = (twos ^ x) & ~ones;
        }
        return ones;
    }
}`,
          cpp: r`class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int ones = 0, twos = 0;
        for (int x : nums) {
            ones = (ones ^ x) & ~twos;
            twos = (twos ^ x) & ~ones;
        }
        return ones;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        ones = twos = 0
        for x in nums:
            ones = (ones ^ x) & ~twos
            twos = (twos ^ x) & ~ones
        return ones`,
          javascript: r`var singleNumber = function(nums) {
    let ones = 0, twos = 0;
    for (const x of nums) {
        ones = (ones ^ x) & ~twos;
        twos = (twos ^ x) & ~ones;
    }
    return ones;
};`,
        },
      },
    ],
  },

  'sum-of-two-integers': {
    pattern: 'Binary addition: XOR is the sum without carries, AND shifted left is the carry',
    approaches: [
      {
        level: 'Brute force', name: 'Ripple-carry adder, one bit at a time',
        idea: 'Do what a hardware adder does: for each of the 32 positions, the sum bit is `a ^ b ^ carry`, and the carry into the next position is set when at least two of the three are set.',
        steps: [
          'Walk a one-bit mask from bit 0 to bit 31 (stop when shifting it pushes it out).',
          'At each position: `x = a & bit`, `y = b & bit`; result gets `x ^ y ^ carry`.',
          'Next carry = `(x & y | x & carry | y & carry) << 1`.',
        ],
        time: 'O(w)', space: 'O(1)',
        why: 'Always w = 32 steps. Written without any `+` or `−` at all, including the loop.',
        code: {
          java: r`class Solution {
    public int getSum(int a, int b) {
        int result = 0, carry = 0;
        for (int bit = 1; bit != 0; bit <<= 1) {
            int x = a & bit, y = b & bit;
            result |= x ^ y ^ carry;
            carry = (x & y | x & carry | y & carry) << 1;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    int getSum(int a, int b) {
        unsigned ua = a, ub = b, result = 0, carry = 0;
        for (unsigned bit = 1; bit != 0; bit <<= 1) {
            unsigned x = ua & bit, y = ub & bit;
            result |= x ^ y ^ carry;
            carry = (x & y | x & carry | y & carry) << 1;
        }
        return (int) result;
    }
};`,
          python: r`class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK = 0xFFFFFFFF
        a, b = a & MASK, b & MASK
        result = carry = 0
        bit = 1
        while bit <= MASK:
            x, y = a & bit, b & bit
            result |= x ^ y ^ carry
            carry = (x & y | x & carry | y & carry) << 1
            bit <<= 1
        return result if result <= 0x7FFFFFFF else ~(result ^ MASK)`,
          javascript: r`var getSum = function(a, b) {
    let result = 0, carry = 0;
    for (let bit = 1; bit !== 0; bit <<= 1) {
        const x = a & bit, y = b & bit;
        result |= x ^ y ^ carry;
        carry = (x & y | x & carry | y & carry) << 1;
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'XOR + carry loop on whole words',
        idea: 'Add all bits at once: `a ^ b` is the sum ignoring carries, `(a & b) << 1` is every carry. Add those two the same way until no carry is left.',
        steps: [
          'While `b != 0`: `carry = (a & b) << 1`; `a = a ^ b`; `b = carry`.',
          'Return `a`.',
          'Python has unbounded integers, so mask to 32 bits each round and convert the final pattern back to a signed value.',
        ],
        time: 'O(w)', space: 'O(1)',
        why: 'Each round moves the lowest carry at least one position left, so at most 32 rounds — usually far fewer. C++ shifts as `unsigned` to avoid undefined behaviour on negative values.',
        code: {
          java: r`class Solution {
    public int getSum(int a, int b) {
        while (b != 0) {
            int carry = (a & b) << 1;
            a ^= b;
            b = carry;
        }
        return a;
    }
}`,
          cpp: r`class Solution {
public:
    int getSum(int a, int b) {
        unsigned ua = a, ub = b;
        while (ub != 0) {
            unsigned carry = (ua & ub) << 1;
            ua ^= ub;
            ub = carry;
        }
        return (int) ua;
    }
};`,
          python: r`class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK = 0xFFFFFFFF
        a, b = a & MASK, b & MASK
        while b:
            a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
        return a if a <= 0x7FFFFFFF else ~(a ^ MASK)`,
          javascript: r`var getSum = function(a, b) {
    while (b !== 0) {
        const carry = (a & b) << 1;
        a ^= b;
        b = carry;
    }
    return a;
};`,
        },
      },
    ],
  },

  'single-number-iii': {
    pattern: 'XOR, then split the array by one bit where the two singles differ',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value with a nested loop',
        idea: 'Count every element\'s occurrences and collect the two that appear once.',
        steps: [
          'For each value, scan the array counting equal elements.',
          'Collect values with count 1.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n scans of length n (space excludes the two-element answer).',
        code: {
          java: r`class Solution {
    public int[] singleNumber(int[] nums) {
        int[] result = new int[2];
        int found = 0;
        for (int x : nums) {
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count == 1) result[found++] = x;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        vector<int> result;
        for (int x : nums)
            if (count(nums.begin(), nums.end(), x) == 1) result.push_back(x);
        return result;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> List[int]:
        return [x for x in nums if nums.count(x) == 1]`,
          javascript: r`var singleNumber = function(nums) {
    const result = [];
    for (const x of nums) {
        let count = 0;
        for (const y of nums) if (y === x) count++;
        if (count === 1) result.push(x);
    }
    return result;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash map of counts',
        idea: 'Count values in one pass and return those with count 1.',
        steps: [
          'Build a map value → count.',
          'Return the keys with count 1.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear time, O(n) extra memory.',
        code: {
          java: r`class Solution {
    public int[] singleNumber(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        int[] result = new int[2];
        int found = 0;
        for (Map.Entry<Integer, Integer> e : count.entrySet())
            if (e.getValue() == 1) result[found++] = e.getKey();
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<int> result;
        for (auto& [x, c] : count)
            if (c == 1) result.push_back(x);
        return result;
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> List[int]:
        return [x for x, c in Counter(nums).items() if c == 1]`,
          javascript: r`var singleNumber = function(nums) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
    return [...count].filter(([, c]) => c === 1).map(([x]) => x);
};`,
        },
      },
      {
        level: 'Optimal', name: 'XOR and split on the lowest differing bit',
        idea: 'XOR of everything is `a ^ b` (pairs cancel). It is non-zero, so pick any set bit — the lowest, `x & −x`. `a` and `b` differ there, so splitting the array by that bit puts them in different groups, and each group\'s pairs still cancel.',
        steps: [
          '`x = XOR of all nums`; `low = x & −x`.',
          'XOR the numbers with that bit set into `a`; the others into `b`.',
          'Return `[a, b]`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes, three variables. When `x` is −2³¹, `−x` overflows back to −2³¹ in Java/JS and `low` is still the right bit; C++ uses `unsigned` so the negation is well defined.',
        code: {
          java: r`class Solution {
    public int[] singleNumber(int[] nums) {
        int x = 0;
        for (int v : nums) x ^= v;
        int low = x & -x, a = 0, b = 0;
        for (int v : nums) {
            if ((v & low) != 0) a ^= v;
            else b ^= v;
        }
        return new int[] { a, b };
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        unsigned x = 0;
        for (int v : nums) x ^= v;
        unsigned low = x & -x;
        int a = 0, b = 0;
        for (int v : nums) {
            if (v & low) a ^= v;
            else b ^= v;
        }
        return {a, b};
    }
};`,
          python: r`class Solution:
    def singleNumber(self, nums: List[int]) -> List[int]:
        x = 0
        for v in nums:
            x ^= v
        low = x & -x
        a = b = 0
        for v in nums:
            if v & low:
                a ^= v
            else:
                b ^= v
        return [a, b]`,
          javascript: r`var singleNumber = function(nums) {
    let x = 0;
    for (const v of nums) x ^= v;
    const low = x & -x;
    let a = 0, b = 0;
    for (const v of nums) {
        if (v & low) a ^= v;
        else b ^= v;
    }
    return [a, b];
};`,
        },
      },
    ],
  },
  'add-binary': {
    pattern: 'Digit-by-digit addition with a carry (base 2)',
    approaches: [
      {
        level: 'Brute force', name: 'Convert to integers and back',
        idea: 'Parse both strings as binary numbers, add them, and print the sum in binary.',
        steps: [
          'Convert `a` and `b` to integers (base 2).',
          'Add them and convert the sum back to a binary string.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Inputs can have 10⁴ bits, while a 64-bit integer holds 63. The long tests overflow in Java, C++ and JavaScript (Python\'s big integers survive, but that dodges the point of the exercise).',
        code: {
          java: r`class Solution {
    public String addBinary(String a, String b) {
        return Long.toBinaryString(Long.parseLong(a, 2) + Long.parseLong(b, 2));
    }
}`,
          cpp: r`class Solution {
public:
    string addBinary(string a, string b) {
        unsigned long long s = stoull(a, nullptr, 2) + stoull(b, nullptr, 2);
        if (s == 0) return "0";
        string out;
        while (s) { out += (char) ('0' + (s & 1)); s >>= 1; }
        reverse(out.begin(), out.end());
        return out;
    }
};`,
          python: r`class Solution:
    def addBinary(self, a: str, b: str) -> str:
        return bin(int(a, 2) + int(b, 2))[2:]`,
          javascript: r`var addBinary = function(a, b) {
    return (parseInt(a, 2) + parseInt(b, 2)).toString(2);
};`,
        },
        timesOut: [4, 5],
      },
      {
        level: 'Optimal', name: 'Two pointers from the right with a carry',
        idea: 'Add the strings like grade-school addition: walk both from the last bit, add the bits and the carry, write the low bit, and carry the high bit.',
        steps: [
          'Set `i`, `j` to the last indices and `carry = 0`.',
          'While `i >= 0`, `j >= 0` or `carry > 0`: `sum = carry + bit(a, i) + bit(b, j)`; append `sum % 2`; `carry = sum / 2`; move both pointers left.',
          'Reverse the appended bits and return them.',
        ],
        time: 'O(max(m, n))', space: 'O(max(m, n))',
        why: 'One pass over the longer string; the output needs at most one extra bit. Looping while the carry is non-zero handles "1" + "1" = "10" without a special case.',
        code: {
          java: r`class Solution {
    public String addBinary(String a, String b) {
        StringBuilder sb = new StringBuilder();
        int i = a.length() - 1, j = b.length() - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry > 0) {
            int s = carry;
            if (i >= 0) s += a.charAt(i--) - '0';
            if (j >= 0) s += b.charAt(j--) - '0';
            sb.append(s & 1);
            carry = s >> 1;
        }
        return sb.reverse().toString();
    }
}`,
          cpp: r`class Solution {
public:
    string addBinary(string a, string b) {
        string out;
        int i = (int) a.size() - 1, j = (int) b.size() - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry) {
            int s = carry;
            if (i >= 0) s += a[i--] - '0';
            if (j >= 0) s += b[j--] - '0';
            out += (char) ('0' + (s & 1));
            carry = s >> 1;
        }
        reverse(out.begin(), out.end());
        return out;
    }
};`,
          python: r`class Solution:
    def addBinary(self, a: str, b: str) -> str:
        out, i, j, carry = [], len(a) - 1, len(b) - 1, 0
        while i >= 0 or j >= 0 or carry:
            s = carry
            if i >= 0:
                s += int(a[i])
                i -= 1
            if j >= 0:
                s += int(b[j])
                j -= 1
            out.append(str(s & 1))
            carry = s >> 1
        return "".join(reversed(out))`,
          javascript: r`var addBinary = function(a, b) {
    const out = [];
    let i = a.length - 1, j = b.length - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        let s = carry;
        if (i >= 0) s += a.charCodeAt(i--) - 48;
        if (j >= 0) s += b.charCodeAt(j--) - 48;
        out.push(s & 1);
        carry = s >> 1;
    }
    return out.reverse().join("");
};`,
        },
      },
    ],
  },
  'bitwise-and-of-numbers-range': {
    pattern: 'Common binary prefix of left and right',
    approaches: [
      {
        level: 'Brute force', name: 'AND every number',
        idea: 'Start with `left` and AND in every number up to `right`, stopping early once the result reaches 0.',
        steps: [
          'Set `r = left`.',
          'For `k` from `left + 1` to `right` (as a 64-bit counter), set `r &= k`; break if `r == 0`.',
          'Return `r`.',
        ],
        time: 'O(right − left)', space: 'O(1)',
        why: 'The early exit helps when the range crosses a power of two, but a range like [2³⁰, 2³¹ − 1] keeps a set bit the whole way through, about 10⁹ steps, so it times out there.',
        code: {
          java: r`class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        int r = left;
        for (long k = (long) left + 1; k <= right && r != 0; k++) r &= (int) k;
        return r;
    }
}`,
          cpp: r`class Solution {
public:
    int rangeBitwiseAnd(int left, int right) {
        int r = left;
        for (long long k = (long long) left + 1; k <= right && r != 0; k++) r &= (int) k;
        return r;
    }
};`,
          python: r`class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        r = left
        k = left + 1
        while k <= right and r:
            r &= k
            k += 1
        return r`,
          javascript: r`var rangeBitwiseAnd = function(left, right) {
    let r = left;
    for (let k = left + 1; k <= right && r !== 0; k++) r &= k;
    return r >>> 0;
};`,
        },
        timesOut: [6, 7, 'generated'],
      },
      {
        level: 'Better', name: 'Clear the lowest set bit of right',
        idea: 'While `right > left`, remove right\'s lowest set bit (`right & (right − 1)`). Each removal drops a bit that must vary inside the range.',
        steps: [
          'While `left < right`, set `right = right & (right − 1)`.',
          'Return `right`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'At most 31 iterations. If right is still larger than left, the number right − 1 is in the range and differs from right in its lowest set bit, so that bit cannot survive the AND.',
        code: {
          java: r`class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        while (left < right) right &= right - 1;
        return right;
    }
}`,
          cpp: r`class Solution {
public:
    int rangeBitwiseAnd(int left, int right) {
        while (left < right) right &= right - 1;
        return right;
    }
};`,
          python: r`class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        while left < right:
            right &= right - 1
        return right`,
          javascript: r`var rangeBitwiseAnd = function(left, right) {
    while (left < right) right &= right - 1;
    return right;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Shift to the common prefix',
        idea: 'Bits below the highest position where `left` and `right` differ all take both values somewhere in the range, so they AND to 0. Only the shared prefix survives.',
        steps: [
          'Shift `left` and `right` right together, counting shifts, until they are equal.',
          'Shift the common value back left by that count.',
          'Return it.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'At most 31 shifts. Between two numbers that differ at bit k there is a number ending in 0111…1 and the next one ending in 1000…0, which together zero out every bit up to k.',
        code: {
          java: r`class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        int shift = 0;
        while (left != right) { left >>= 1; right >>= 1; shift++; }
        return left << shift;
    }
}`,
          cpp: r`class Solution {
public:
    int rangeBitwiseAnd(int left, int right) {
        int shift = 0;
        while (left != right) { left >>= 1; right >>= 1; shift++; }
        return left << shift;
    }
};`,
          python: r`class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0
        while left != right:
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift`,
          javascript: r`var rangeBitwiseAnd = function(left, right) {
    let shift = 0;
    while (left !== right) { left >>= 1; right >>= 1; shift++; }
    return (left << shift) >>> 0;
};`,
        },
      },
    ],
  },
  'minimum-array-end': {
    pattern: 'Write n − 1 into the zero bits of x',
    approaches: [
      {
        level: 'Brute force', name: 'Step to the next valid number n − 1 times',
        idea: 'Start at `x`. The next valid element is the smallest larger number that still contains all of x\'s bits: `(cur + 1) | x`. Apply that `n − 1` times.',
        steps: [
          'Set `cur = x` (64-bit).',
          'Repeat `n − 1` times: `cur = (cur + 1) | x`.',
          'Return `cur`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Adding 1 and OR-ing x back in jumps straight over every number missing one of x\'s bits, so each step is O(1). Still, n can be 10⁸, which is too slow for the largest tests.',
        code: {
          java: r`class Solution {
    public long minEnd(int n, int x) {
        long cur = x;
        for (int i = 1; i < n; i++) cur = (cur + 1) | x;
        return cur;
    }
}`,
          cpp: r`class Solution {
public:
    long long minEnd(int n, int x) {
        long long cur = x;
        for (int i = 1; i < n; i++) cur = (cur + 1) | x;
        return cur;
    }
};`,
          python: r`class Solution:
    def minEnd(self, n: int, x: int) -> int:
        cur = x
        for _ in range(n - 1):
            cur = (cur + 1) | x
        return cur`,
          javascript: r`var minEnd = function(n, x) {
    let cur = BigInt(x);
    const bx = BigInt(x);
    for (let i = 1; i < n; i++) cur = (cur + 1n) | bx;
    return Number(cur);
};`,
        },
        timesOut: [4, 5, 6, 'generated'],
      },
      {
        level: 'Optimal', name: 'Deposit the bits of n − 1',
        idea: 'Valid numbers are x with any pattern in its 0-bit positions, and they are ordered by that pattern. The (n − 1)-th one (counting from 0) puts the binary digits of n − 1 into those free positions, lowest first.',
        steps: [
          'Set `result = x` and `rest = n − 1` (64-bit).',
          'Walk bit positions upward. Skip positions where x has a 1. At each free position, copy the lowest bit of `rest` into `result`, then shift `rest` right.',
          'Stop when `rest` is 0 and return `result`.',
        ],
        time: 'O(log n + log x)', space: 'O(1)',
        why: 'At most about 60 bit positions are visited. The answer can exceed 2³¹ (for example n = x = 10⁸), so it must be computed in 64 bits; in JavaScript, plain numbers are safe up to 2⁵³ but bitwise operators work on 32 bits, so the code uses arithmetic or BigInt.',
        code: {
          java: r`class Solution {
    public long minEnd(int n, int x) {
        long result = x, rest = n - 1;
        for (long bit = 1; rest > 0; bit <<= 1) {
            if ((x & bit) != 0) continue;
            if ((rest & 1) == 1) result |= bit;
            rest >>= 1;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    long long minEnd(int n, int x) {
        long long result = x, rest = n - 1;
        for (long long bit = 1; rest > 0; bit <<= 1) {
            if (x & bit) continue;
            if (rest & 1) result |= bit;
            rest >>= 1;
        }
        return result;
    }
};`,
          python: r`class Solution:
    def minEnd(self, n: int, x: int) -> int:
        result, rest, bit = x, n - 1, 1
        while rest:
            if not x & bit:
                if rest & 1:
                    result |= bit
                rest >>= 1
            bit <<= 1
        return result`,
          javascript: r`var minEnd = function(n, x) {
    let result = BigInt(x), rest = BigInt(n - 1), bit = 1n;
    const bx = BigInt(x);
    while (rest > 0n) {
        if ((bx & bit) === 0n) {
            if (rest & 1n) result |= bit;
            rest >>= 1n;
        }
        bit <<= 1n;
    }
    return Number(result);
};`,
        },
      },
    ],
  },
};
