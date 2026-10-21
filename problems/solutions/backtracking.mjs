const r = String.raw;

export default {
  'subsets': {
    pattern: 'Backtracking over include/exclude choices (or bitmasks over 2ⁿ subsets)',
    approaches: [
      {
        level: 'Optimal', name: 'Backtracking: choose the next element to add',
        idea: 'Build subsets in increasing index order. Every partial subset is itself an answer; then try extending it with each later element.',
        steps: [
          '`build(start, current)`: record a copy of `current`.',
          'For each `i` from `start` to n − 1: add `nums[i]`, call `build(i + 1, current)`, then remove it (undo).',
          'Call `build(0, [])`.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n)',
        why: 'There are 2ⁿ subsets and copying each costs up to n. Besides the output, only the current subset and the recursion (depth n) are kept.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        build(nums, 0, new ArrayList<>(), out);
        return out;
    }

    private void build(int[] nums, int start, List<Integer> cur, List<List<Integer>> out) {
        out.add(new ArrayList<>(cur));
        for (int i = start; i < nums.length; i++) {
            cur.add(nums[i]);
            build(nums, i + 1, cur, out);
            cur.remove(cur.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& nums, int start, vector<int>& cur, vector<vector<int>>& out) {
        out.push_back(cur);
        for (int i = start; i < (int) nums.size(); i++) {
            cur.push_back(nums[i]);
            build(nums, i + 1, cur, out);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> out;
        vector<int> cur;
        build(nums, 0, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        out, cur = [], []
        def build(start):
            out.append(cur[:])
            for i in range(start, len(nums)):
                cur.append(nums[i])
                build(i + 1)
                cur.pop()
        build(0)
        return out`,
          javascript: r`var subsets = function(nums) {
    const out = [], cur = [];
    const build = (start) => {
        out.push([...cur]);
        for (let i = start; i < nums.length; i++) {
            cur.push(nums[i]);
            build(i + 1);
            cur.pop();
        }
    };
    build(0);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cascading: add each element to every subset so far',
        idea: 'Start with only the empty subset. For each number, every existing subset either skips it or takes it, so append a copy of each existing subset with the number added.',
        steps: [
          'Set `out = [[]]`.',
          'For each `x` in `nums`, for each subset `s` currently in `out`, append `s + [x]`.',
          'Return `out`.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(1)',
        why: 'The list doubles with each element; building each new subset costs up to n. No recursion, and nothing beyond the output is stored.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        out.add(new ArrayList<>());
        for (int x : nums) {
            int size = out.size();
            for (int i = 0; i < size; i++) {
                List<Integer> s = new ArrayList<>(out.get(i));
                s.add(x);
                out.add(s);
            }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> out{{}};
        for (int x : nums) {
            int size = out.size();
            for (int i = 0; i < size; i++) {
                vector<int> s = out[i];
                s.push_back(x);
                out.push_back(s);
            }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        out = [[]]
        for x in nums:
            out += [s + [x] for s in out]
        return out`,
          javascript: r`var subsets = function(nums) {
    let out = [[]];
    for (const x of nums) out = out.concat(out.map((s) => [...s, x]));
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bitmasks from 0 to 2ⁿ − 1',
        idea: 'Each subset matches an n-bit number: bit `i` set means `nums[i]` is included. Counting from 0 to 2ⁿ − 1 lists every subset exactly once.',
        steps: [
          'For `mask` from 0 to `2ⁿ − 1`:',
          'Collect `nums[i]` for every bit `i` set in `mask`.',
          'Add that subset to the answer.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(1)',
        why: '2ⁿ masks, each checked bit by bit. A neat trick for small n (n ≤ 30 fits an int).',
        code: {
          java: r`class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        int n = nums.length;
        List<List<Integer>> out = new ArrayList<>();
        for (int mask = 0; mask < (1 << n); mask++) {
            List<Integer> s = new ArrayList<>();
            for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) s.add(nums[i]);
            out.add(s);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> out;
        for (int mask = 0; mask < (1 << n); mask++) {
            vector<int> s;
            for (int i = 0; i < n; i++) if (mask >> i & 1) s.push_back(nums[i]);
            out.push_back(s);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        return [[nums[i] for i in range(n) if mask >> i & 1] for mask in range(1 << n)]`,
          javascript: r`var subsets = function(nums) {
    const n = nums.length, out = [];
    for (let mask = 0; mask < (1 << n); mask++) {
        const s = [];
        for (let i = 0; i < n; i++) if ((mask >> i) & 1) s.push(nums[i]);
        out.push(s);
    }
    return out;
};`,
        },
      },
    ],
  },

  'combinations': {
    pattern: 'Backtracking with a start index (choose k of n), pruning when too few numbers remain',
    approaches: [
      {
        level: 'Brute force', name: 'Generate every subset of 1..n and keep those of size k',
        idea: 'List all 2ⁿ subsets with bitmasks and keep the ones with exactly k elements.',
        steps: [
          'For each `mask` from 0 to `2ⁿ − 1` with exactly `k` bits set:',
          'Collect the numbers `i + 1` for each set bit `i`, and add the combination.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(k)',
        why: 'Every one of the 2ⁿ masks is examined even though only C(n, k) are wanted.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> out = new ArrayList<>();
        for (int mask = 0; mask < (1 << n); mask++) {
            if (Integer.bitCount(mask) != k) continue;
            List<Integer> c = new ArrayList<>();
            for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) c.add(i + 1);
            out.add(c);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> out;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (__builtin_popcount(mask) != k) continue;
            vector<int> c;
            for (int i = 0; i < n; i++) if (mask >> i & 1) c.push_back(i + 1);
            out.push_back(c);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        return [
            [i + 1 for i in range(n) if mask >> i & 1]
            for mask in range(1 << n) if bin(mask).count("1") == k
        ]`,
          javascript: r`var combine = function(n, k) {
    const out = [];
    for (let mask = 0; mask < (1 << n); mask++) {
        const c = [];
        for (let i = 0; i < n; i++) if ((mask >> i) & 1) c.push(i + 1);
        if (c.length === k) out.push(c);
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking with pruning',
        idea: 'Pick numbers in increasing order so each combination is built once. If not enough numbers remain to reach `k`, stop early.',
        steps: [
          '`build(start, current)`: if `current` has `k` numbers, record a copy and return.',
          'Let `need = k − current.size()`. Try each `i` from `start` up to `n − need + 1` (later starts cannot fill the combination).',
          'Add `i`, recurse with `i + 1`, then remove `i`.',
        ],
        time: 'O(k·C(n, k))', space: 'O(k)',
        why: 'With the pruning, every branch leads to a valid combination, and each one costs O(k) to copy. The recursion depth is k.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> out = new ArrayList<>();
        build(n, k, 1, new ArrayList<>(), out);
        return out;
    }

    private void build(int n, int k, int start, List<Integer> cur, List<List<Integer>> out) {
        if (cur.size() == k) { out.add(new ArrayList<>(cur)); return; }
        int need = k - cur.size();
        for (int i = start; i <= n - need + 1; i++) {
            cur.add(i);
            build(n, k, i + 1, cur, out);
            cur.remove(cur.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    void build(int n, int k, int start, vector<int>& cur, vector<vector<int>>& out) {
        if ((int) cur.size() == k) { out.push_back(cur); return; }
        int need = k - cur.size();
        for (int i = start; i <= n - need + 1; i++) {
            cur.push_back(i);
            build(n, k, i + 1, cur, out);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> out;
        vector<int> cur;
        build(n, k, 1, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        out, cur = [], []
        def build(start):
            if len(cur) == k:
                out.append(cur[:])
                return
            need = k - len(cur)
            for i in range(start, n - need + 2):
                cur.append(i)
                build(i + 1)
                cur.pop()
        build(1)
        return out`,
          javascript: r`var combine = function(n, k) {
    const out = [], cur = [];
    const build = (start) => {
        if (cur.length === k) { out.push([...cur]); return; }
        const need = k - cur.length;
        for (let i = start; i <= n - need + 1; i++) {
            cur.push(i);
            build(i + 1);
            cur.pop();
        }
    };
    build(1);
    return out;
};`,
        },
      },
    ],
  },

  'permutations': {
    pattern: 'Backtracking with a "used" mark (or in-place swapping)',
    approaches: [
      {
        level: 'Brute force', name: 'Every sequence of length n, keep those without repeats',
        idea: 'Generate all nⁿ sequences of positions (each slot can be any index), and keep only those that use every index exactly once.',
        steps: [
          'Generate all sequences of n indices, each from 0 to n − 1.',
          'Keep a sequence only if no index repeats; map it to values.',
        ],
        time: 'O(n·nⁿ)', space: 'O(n)',
        why: 'nⁿ sequences (46,656 for n = 6) to produce only n! = 720 permutations.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> permute(int[] nums) {
        int n = nums.length, total = 1;
        for (int i = 0; i < n; i++) total *= n;
        List<List<Integer>> out = new ArrayList<>();
        for (int code = 0; code < total; code++) {
            List<Integer> p = new ArrayList<>();
            boolean[] used = new boolean[n];
            boolean ok = true;
            for (int c = code, i = 0; i < n && ok; i++, c /= n) {
                int idx = c % n;
                if (used[idx]) ok = false;
                used[idx] = true;
                p.add(nums[idx]);
            }
            if (ok) out.add(p);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        int n = nums.size(), total = 1;
        for (int i = 0; i < n; i++) total *= n;
        vector<vector<int>> out;
        for (int code = 0; code < total; code++) {
            vector<int> p;
            vector<bool> used(n, false);
            bool ok = true;
            for (int c = code, i = 0; i < n && ok; i++, c /= n) {
                int idx = c % n;
                if (used[idx]) ok = false;
                used[idx] = true;
                p.push_back(nums[idx]);
            }
            if (ok) out.push_back(p);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        return [
            [nums[i] for i in seq]
            for seq in product(range(n), repeat=n) if len(set(seq)) == n
        ]`,
          javascript: r`var permute = function(nums) {
    const n = nums.length, total = n ** n, out = [];
    for (let code = 0; code < total; code++) {
        const p = [], used = new Array(n).fill(false);
        let ok = true;
        for (let c = code, i = 0; i < n && ok; i++, c = Math.floor(c / n)) {
            const idx = c % n;
            if (used[idx]) ok = false;
            used[idx] = true;
            p.push(nums[idx]);
        }
        if (ok) out.push(p);
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking with a used array',
        idea: 'Fill positions one by one; at each step try every value not used yet, then undo the choice before trying the next.',
        steps: [
          'If `current` has n values, record a copy.',
          'Otherwise, for each unused index `i`: mark it, append `nums[i]`, recurse, then remove it and unmark.',
        ],
        time: 'O(n·n!)', space: 'O(n)',
        why: 'There are n! permutations, each copied in O(n); every branch of the recursion ends in a permutation. Besides the output, only the current path and flags are kept.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        build(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }

    private void build(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> out) {
        if (cur.size() == nums.length) { out.add(new ArrayList<>(cur)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.add(nums[i]);
            build(nums, used, cur, out);
            cur.remove(cur.size() - 1);
            used[i] = false;
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& nums, vector<bool>& used, vector<int>& cur, vector<vector<int>>& out) {
        if (cur.size() == nums.size()) { out.push_back(cur); return; }
        for (size_t i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            build(nums, used, cur, out);
            cur.pop_back();
            used[i] = false;
        }
    }
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> out;
        vector<bool> used(nums.size(), false);
        vector<int> cur;
        build(nums, used, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        out, cur, used = [], [], [False] * len(nums)
        def build():
            if len(cur) == len(nums):
                out.append(cur[:])
                return
            for i, x in enumerate(nums):
                if not used[i]:
                    used[i] = True
                    cur.append(x)
                    build()
                    cur.pop()
                    used[i] = False
        build()
        return out`,
          javascript: r`var permute = function(nums) {
    const out = [], cur = [], used = new Array(nums.length).fill(false);
    const build = () => {
        if (cur.length === nums.length) { out.push([...cur]); return; }
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push(nums[i]);
            build();
            cur.pop();
            used[i] = false;
        }
    };
    build();
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking by swapping in place',
        idea: 'Position `k` can take any element from `k` onwards: swap it into position `k`, permute the rest, then swap back. No `used` array or extra path is needed.',
        steps: [
          '`build(k)`: if `k == n`, record a copy of the array.',
          'For each `i` from `k` to n − 1: swap `nums[k]` and `nums[i]`, call `build(k + 1)`, swap back.',
        ],
        time: 'O(n·n!)', space: 'O(n)',
        why: 'Same count of permutations and copies; the array itself holds the current permutation, so only the recursion stack is extra.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        build(nums, 0, out);
        return out;
    }

    private void build(int[] a, int k, List<List<Integer>> out) {
        if (k == a.length) {
            List<Integer> p = new ArrayList<>();
            for (int x : a) p.add(x);
            out.add(p);
            return;
        }
        for (int i = k; i < a.length; i++) {
            int t = a[k]; a[k] = a[i]; a[i] = t;
            build(a, k + 1, out);
            t = a[k]; a[k] = a[i]; a[i] = t;
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& a, int k, vector<vector<int>>& out) {
        if (k == (int) a.size()) { out.push_back(a); return; }
        for (int i = k; i < (int) a.size(); i++) {
            swap(a[k], a[i]);
            build(a, k + 1, out);
            swap(a[k], a[i]);
        }
    }
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> out;
        build(nums, 0, out);
        return out;
    }
};`,
          python: r`class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        out = []
        def build(k):
            if k == len(nums):
                out.append(nums[:])
                return
            for i in range(k, len(nums)):
                nums[k], nums[i] = nums[i], nums[k]
                build(k + 1)
                nums[k], nums[i] = nums[i], nums[k]
        build(0)
        return out`,
          javascript: r`var permute = function(nums) {
    const out = [];
    const build = (k) => {
        if (k === nums.length) { out.push([...nums]); return; }
        for (let i = k; i < nums.length; i++) {
            [nums[k], nums[i]] = [nums[i], nums[k]];
            build(k + 1);
            [nums[k], nums[i]] = [nums[i], nums[k]];
        }
    };
    build(0);
    return out;
};`,
        },
      },
    ],
  },

  'combination-sum': {
    pattern: 'Backtracking with a start index (reuse allowed: recurse with the same index)',
    approaches: [
      {
        level: 'Brute force', name: 'Try any candidate at every step, de-duplicate at the end',
        idea: 'Keep adding any candidate while the sum is below `target`. This produces the same combination in many orders (2+3+2, 3+2+2, …), so sort each found combination and keep it in a set.',
        steps: [
          '`build(remaining, current)`: if `remaining == 0`, add `sorted(current)` to a set.',
          'Otherwise, for every candidate `c <= remaining`, append it and recurse with `remaining − c`, then remove it.',
          'Return the set\'s contents.',
        ],
        time: 'O(n^(T/m)·T)', space: 'O(T/m)',
        why: 'It explores every ordering of every combination: up to n choices at each of T/m levels (T = target, m = smallest candidate). The set removes the repeats only afterwards.',
        code: {
          java: r`class Solution {
    private final Set<List<Integer>> found = new HashSet<>();

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        build(candidates, target, new ArrayList<>());
        return new ArrayList<>(found);
    }

    private void build(int[] cand, int remaining, List<Integer> cur) {
        if (remaining == 0) {
            List<Integer> c = new ArrayList<>(cur);
            Collections.sort(c);
            found.add(c);
            return;
        }
        for (int x : cand) {
            if (x > remaining) continue;
            cur.add(x);
            build(cand, remaining - x, cur);
            cur.remove(cur.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    set<vector<int>> found;
    void build(vector<int>& cand, int remaining, vector<int>& cur) {
        if (remaining == 0) {
            vector<int> c = cur;
            sort(c.begin(), c.end());
            found.insert(c);
            return;
        }
        for (int x : cand) {
            if (x > remaining) continue;
            cur.push_back(x);
            build(cand, remaining - x, cur);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<int> cur;
        build(candidates, target, cur);
        return vector<vector<int>>(found.begin(), found.end());
    }
};`,
          python: r`class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        found, cur = set(), []
        def build(remaining):
            if remaining == 0:
                found.add(tuple(sorted(cur)))
                return
            for x in candidates:
                if x <= remaining:
                    cur.append(x)
                    build(remaining - x)
                    cur.pop()
        build(target)
        return [list(c) for c in found]`,
          javascript: r`var combinationSum = function(candidates, target) {
    const found = new Map(), cur = [];
    const build = (remaining) => {
        if (remaining === 0) {
            const c = [...cur].sort((a, b) => a - b);
            found.set(c.join(','), c);
            return;
        }
        for (const x of candidates) {
            if (x > remaining) continue;
            cur.push(x);
            build(remaining - x);
            cur.pop();
        }
    };
    build(target);
    return [...found.values()];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking from a start index, sorted for early stopping',
        idea: 'Generate each combination in non-decreasing candidate order: after choosing candidate `i`, only candidates `i` and later may follow. That makes every combination appear once. Sorting first lets the loop stop as soon as a candidate exceeds what is left.',
        steps: [
          'Sort the candidates.',
          '`build(start, remaining)`: if `remaining == 0`, record a copy.',
          'For `i` from `start`: if `candidates[i] > remaining`, stop the loop; otherwise add it, recurse with `build(i, remaining − candidates[i])` (same `i`: reuse allowed), and remove it.',
        ],
        time: 'O(n^(T/m)·T/m)', space: 'O(T/m)',
        why: 'The worst case is still exponential, but each combination is produced once and dead branches are cut immediately. The recursion depth is at most T/m.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> out = new ArrayList<>();
        build(candidates, 0, target, new ArrayList<>(), out);
        return out;
    }

    private void build(int[] c, int start, int remaining, List<Integer> cur, List<List<Integer>> out) {
        if (remaining == 0) { out.add(new ArrayList<>(cur)); return; }
        for (int i = start; i < c.length && c[i] <= remaining; i++) {
            cur.add(c[i]);
            build(c, i, remaining - c[i], cur, out);
            cur.remove(cur.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& c, int start, int remaining, vector<int>& cur, vector<vector<int>>& out) {
        if (remaining == 0) { out.push_back(cur); return; }
        for (int i = start; i < (int) c.size() && c[i] <= remaining; i++) {
            cur.push_back(c[i]);
            build(c, i, remaining - c[i], cur, out);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> out;
        vector<int> cur;
        build(candidates, 0, target, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        out, cur = [], []
        def build(start, remaining):
            if remaining == 0:
                out.append(cur[:])
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                cur.append(candidates[i])
                build(i, remaining - candidates[i])
                cur.pop()
        build(0, target)
        return out`,
          javascript: r`var combinationSum = function(candidates, target) {
    candidates.sort((a, b) => a - b);
    const out = [], cur = [];
    const build = (start, remaining) => {
        if (remaining === 0) { out.push([...cur]); return; }
        for (let i = start; i < candidates.length && candidates[i] <= remaining; i++) {
            cur.push(candidates[i]);
            build(i, remaining - candidates[i]);
            cur.pop();
        }
    };
    build(0, target);
    return out;
};`,
        },
      },
    ],
  },

  'letter-combinations-of-a-phone-number': {
    pattern: 'Backtracking over a fixed number of positions, each with a few choices (Cartesian product)',
    approaches: [
      {
        level: 'Optimal', name: 'Backtracking one digit at a time',
        idea: 'Position `i` of the result can be any letter of `digits[i]`. Choose a letter, move to the next digit, and record the string when all digits are used.',
        steps: [
          'If `digits` is empty, return an empty list.',
          '`build(i, prefix)`: if `i == digits.length`, record `prefix`.',
          'Otherwise, for each letter of `digits[i]`, call `build(i + 1, prefix + letter)`.',
        ],
        time: 'O(n·4ⁿ)', space: 'O(n)',
        why: 'Up to 4 letters per digit gives up to 4ⁿ strings of length n. The recursion is n deep.',
        code: {
          java: r`class Solution {
    private static final String[] KEYS = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };

    public List<String> letterCombinations(String digits) {
        List<String> out = new ArrayList<>();
        if (!digits.isEmpty()) build(digits, 0, new StringBuilder(), out);
        return out;
    }

    private void build(String digits, int i, StringBuilder prefix, List<String> out) {
        if (i == digits.length()) { out.add(prefix.toString()); return; }
        for (char c : KEYS[digits.charAt(i) - '0'].toCharArray()) {
            prefix.append(c);
            build(digits, i + 1, prefix, out);
            prefix.deleteCharAt(prefix.length() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    vector<string> keys{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    void build(const string& digits, size_t i, string& prefix, vector<string>& out) {
        if (i == digits.size()) { out.push_back(prefix); return; }
        for (char c : keys[digits[i] - '0']) {
            prefix.push_back(c);
            build(digits, i + 1, prefix, out);
            prefix.pop_back();
        }
    }
public:
    vector<string> letterCombinations(string digits) {
        vector<string> out;
        string prefix;
        if (!digits.empty()) build(digits, 0, prefix, out);
        return out;
    }
};`,
          python: r`class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        out = []
        def build(i, prefix):
            if i == len(digits):
                out.append(prefix)
                return
            for c in keys[digits[i]]:
                build(i + 1, prefix + c)
        if digits:
            build(0, "")
        return out`,
          javascript: r`var letterCombinations = function(digits) {
    const keys = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'], out = [];
    const build = (i, prefix) => {
        if (i === digits.length) { out.push(prefix); return; }
        for (const c of keys[digits[i]]) build(i + 1, prefix + c);
    };
    if (digits.length) build(0, '');
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative: extend every partial string by each letter',
        idea: 'Start from `[""]`. For each digit, replace the list with every string in it extended by every letter of that digit.',
        steps: [
          'If `digits` is empty, return `[]`. Set `out = [""]`.',
          'For each digit, build a new list: for every `s` in `out` and every letter `c` of the digit, add `s + c`.',
          'Return `out`.',
        ],
        time: 'O(n·4ⁿ)', space: 'O(n·4ⁿ)',
        why: 'The same number of strings; the intermediate lists hold up to 4ⁿ partial strings, but there is no recursion.',
        code: {
          java: r`class Solution {
    public List<String> letterCombinations(String digits) {
        if (digits.isEmpty()) return new ArrayList<>();
        String[] keys = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };
        List<String> out = new ArrayList<>(List.of(""));
        for (char d : digits.toCharArray()) {
            List<String> next = new ArrayList<>();
            for (String s : out)
                for (char c : keys[d - '0'].toCharArray()) next.add(s + c);
            out = next;
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        vector<string> keys{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        vector<string> out{""};
        for (char d : digits) {
            vector<string> next;
            for (auto& s : out)
                for (char c : keys[d - '0']) next.push_back(s + c);
            out = next;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        out = [""]
        for d in digits:
            out = [s + c for s in out for c in keys[d]]
        return out`,
          javascript: r`var letterCombinations = function(digits) {
    if (!digits.length) return [];
    const keys = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
    let out = [''];
    for (const d of digits) out = out.flatMap((s) => [...keys[d]].map((c) => s + c));
    return out;
};`,
        },
      },
    ],
  },

  'generate-parentheses': {
    pattern: 'Backtracking with constraints (add "(" while opens remain, ")" while it stays balanced)',
    approaches: [
      {
        level: 'Brute force', name: 'Generate all 2²ⁿ strings and keep the valid ones',
        idea: 'Every position is `(` or `)`. Generate every such string of length 2n and keep those that are balanced.',
        steps: [
          'For each mask from 0 to `2²ⁿ − 1`, build the string (bit set = `(`).',
          'Check validity with a running balance that never goes negative and ends at 0.',
          'Keep the valid strings.',
        ],
        time: 'O(n·4ⁿ)', space: 'O(n)',
        why: '2²ⁿ = 4ⁿ strings, each checked in O(n) — about 65,000 for n = 8, almost all invalid.',
        code: {
          java: r`class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> out = new ArrayList<>();
        for (int mask = 0; mask < (1 << (2 * n)); mask++) {
            StringBuilder sb = new StringBuilder();
            int balance = 0;
            for (int i = 0; i < 2 * n && balance >= 0; i++) {
                boolean open = (mask >> i & 1) == 1;
                sb.append(open ? '(' : ')');
                balance += open ? 1 : -1;
            }
            if (balance == 0 && sb.length() == 2 * n) out.add(sb.toString());
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> out;
        for (int mask = 0; mask < (1 << (2 * n)); mask++) {
            string s;
            int balance = 0;
            for (int i = 0; i < 2 * n && balance >= 0; i++) {
                bool open = mask >> i & 1;
                s += open ? '(' : ')';
                balance += open ? 1 : -1;
            }
            if (balance == 0 && (int) s.size() == 2 * n) out.push_back(s);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        def valid(s):
            balance = 0
            for c in s:
                balance += 1 if c == "(" else -1
                if balance < 0:
                    return False
            return balance == 0
        return ["".join(p) for p in product("()", repeat=2 * n) if valid(p)]`,
          javascript: r`var generateParenthesis = function(n) {
    const out = [];
    for (let mask = 0; mask < (1 << (2 * n)); mask++) {
        let s = '', balance = 0;
        for (let i = 0; i < 2 * n && balance >= 0; i++) {
            const open = (mask >> i) & 1;
            s += open ? '(' : ')';
            balance += open ? 1 : -1;
        }
        if (balance === 0 && s.length === 2 * n) out.push(s);
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking that only builds valid prefixes',
        idea: 'Track how many `(` and `)` are used. An `(` can be added while fewer than n are used; a `)` only while it would not exceed the opens. Every completed string is then valid by construction.',
        steps: [
          '`build(s, open, close)`: if `s` has length 2n, record it.',
          'If `open < n`, recurse with `s + "("`.',
          'If `close < open`, recurse with `s + ")"`.',
        ],
        time: 'O(4ⁿ/√n)', space: 'O(n)',
        why: 'Only valid prefixes are explored, so the work matches the number of answers — the n-th Catalan number, which grows like 4ⁿ/(n√n) — times n to build each string. The recursion is 2n deep.',
        code: {
          java: r`class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> out = new ArrayList<>();
        build(n, new StringBuilder(), 0, 0, out);
        return out;
    }

    private void build(int n, StringBuilder s, int open, int close, List<String> out) {
        if (s.length() == 2 * n) { out.add(s.toString()); return; }
        if (open < n) { s.append('('); build(n, s, open + 1, close, out); s.deleteCharAt(s.length() - 1); }
        if (close < open) { s.append(')'); build(n, s, open, close + 1, out); s.deleteCharAt(s.length() - 1); }
    }
}`,
          cpp: r`class Solution {
    void build(int n, string& s, int open, int close, vector<string>& out) {
        if ((int) s.size() == 2 * n) { out.push_back(s); return; }
        if (open < n) { s.push_back('('); build(n, s, open + 1, close, out); s.pop_back(); }
        if (close < open) { s.push_back(')'); build(n, s, open, close + 1, out); s.pop_back(); }
    }
public:
    vector<string> generateParenthesis(int n) {
        vector<string> out;
        string s;
        build(n, s, 0, 0, out);
        return out;
    }
};`,
          python: r`class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        out = []
        def build(s, open_, close):
            if len(s) == 2 * n:
                out.append(s)
                return
            if open_ < n:
                build(s + "(", open_ + 1, close)
            if close < open_:
                build(s + ")", open_, close + 1)
        build("", 0, 0)
        return out`,
          javascript: r`var generateParenthesis = function(n) {
    const out = [];
    const build = (s, open, close) => {
        if (s.length === 2 * n) { out.push(s); return; }
        if (open < n) build(s + '(', open + 1, close);
        if (close < open) build(s + ')', open, close + 1);
    };
    build('', 0, 0);
    return out;
};`,
        },
      },
    ],
  },

  'subsets-ii': {
    pattern: 'Sort, then backtrack and skip equal values at the same depth',
    approaches: [
      {
        level: 'Brute force', name: 'All 2ⁿ subsets, de-duplicated with a set',
        idea: 'Sort the array so equal subsets look identical, generate every subset, and keep only distinct ones in a set.',
        steps: [
          'Sort `nums`.',
          'Generate all 2ⁿ subsets (e.g. with bitmasks), in sorted index order.',
          'Insert each into a set; return the set\'s contents.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n·2ⁿ)',
        why: 'Every subset is built and hashed even when it repeats; the set stores up to 2ⁿ subsets.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        int n = nums.length;
        Set<List<Integer>> found = new LinkedHashSet<>();
        for (int mask = 0; mask < (1 << n); mask++) {
            List<Integer> s = new ArrayList<>();
            for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) s.add(nums[i]);
            found.add(s);
        }
        return new ArrayList<>(found);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        set<vector<int>> found;
        for (int mask = 0; mask < (1 << n); mask++) {
            vector<int> s;
            for (int i = 0; i < n; i++) if (mask >> i & 1) s.push_back(nums[i]);
            found.insert(s);
        }
        return vector<vector<int>>(found.begin(), found.end());
    }
};`,
          python: r`class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        found = {tuple(nums[i] for i in range(n) if mask >> i & 1) for mask in range(1 << n)}
        return [list(s) for s in found]`,
          javascript: r`var subsetsWithDup = function(nums) {
    nums.sort((a, b) => a - b);
    const n = nums.length, found = new Map();
    for (let mask = 0; mask < (1 << n); mask++) {
        const s = [];
        for (let i = 0; i < n; i++) if ((mask >> i) & 1) s.push(nums[i]);
        found.set(s.join(','), s);
    }
    return [...found.values()];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking that skips duplicates at each level',
        idea: 'After sorting, equal values are adjacent. At one level of the recursion, choosing the second of two equal values would produce exactly the subsets that choosing the first already produced — so skip it.',
        steps: [
          'Sort `nums`.',
          '`build(start, current)`: record a copy of `current`.',
          'For `i` from `start`: if `i > start` and `nums[i] == nums[i − 1]`, skip; otherwise add `nums[i]`, recurse with `i + 1`, and remove it.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n)',
        why: 'In the worst case (all distinct) there are 2ⁿ subsets; duplicates are never generated, so no set is needed. Recursion depth is n.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        build(nums, 0, new ArrayList<>(), out);
        return out;
    }

    private void build(int[] nums, int start, List<Integer> cur, List<List<Integer>> out) {
        out.add(new ArrayList<>(cur));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            cur.add(nums[i]);
            build(nums, i + 1, cur, out);
            cur.remove(cur.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& nums, int start, vector<int>& cur, vector<vector<int>>& out) {
        out.push_back(cur);
        for (int i = start; i < (int) nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            cur.push_back(nums[i]);
            build(nums, i + 1, cur, out);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> out;
        vector<int> cur;
        build(nums, 0, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        out, cur = [], []
        def build(start):
            out.append(cur[:])
            for i in range(start, len(nums)):
                if i > start and nums[i] == nums[i - 1]:
                    continue
                cur.append(nums[i])
                build(i + 1)
                cur.pop()
        build(0)
        return out`,
          javascript: r`var subsetsWithDup = function(nums) {
    nums.sort((a, b) => a - b);
    const out = [], cur = [];
    const build = (start) => {
        out.push([...cur]);
        for (let i = start; i < nums.length; i++) {
            if (i > start && nums[i] === nums[i - 1]) continue;
            cur.push(nums[i]);
            build(i + 1);
            cur.pop();
        }
    };
    build(0);
    return out;
};`,
        },
      },
    ],
  },

  'combination-sum-ii': {
    pattern: 'Sort, backtrack with each index used once, skip equal values at the same depth',
    approaches: [
      {
        level: 'Brute force', name: 'Every subset of positions, keep the distinct ones that hit the target',
        idea: 'Sort, then try every include/exclude choice for each position. Record subsets summing to `target` in a set to drop repeats caused by equal values.',
        steps: [
          'Sort `candidates`.',
          'Recurse over positions: either skip `candidates[i]` or include it (if it still fits).',
          'When the remaining sum is 0, add the current combination to a set. Return the set\'s contents.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n)',
        why: 'Up to 2ⁿ include/exclude paths (cut a little by the "still fits" check). Repeated combinations are generated and only removed by the set.',
        code: {
          java: r`class Solution {
    private final Set<List<Integer>> found = new HashSet<>();

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        build(candidates, 0, target, new ArrayList<>());
        return new ArrayList<>(found);
    }

    private void build(int[] c, int i, int remaining, List<Integer> cur) {
        if (remaining == 0) { found.add(new ArrayList<>(cur)); return; }
        if (i == c.length || c[i] > remaining) return;
        cur.add(c[i]);
        build(c, i + 1, remaining - c[i], cur);
        cur.remove(cur.size() - 1);
        build(c, i + 1, remaining, cur);
    }
}`,
          cpp: r`class Solution {
    set<vector<int>> found;
    void build(vector<int>& c, size_t i, int remaining, vector<int>& cur) {
        if (remaining == 0) { found.insert(cur); return; }
        if (i == c.size() || c[i] > remaining) return;
        cur.push_back(c[i]);
        build(c, i + 1, remaining - c[i], cur);
        cur.pop_back();
        build(c, i + 1, remaining, cur);
    }
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<int> cur;
        build(candidates, 0, target, cur);
        return vector<vector<int>>(found.begin(), found.end());
    }
};`,
          python: r`class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        found, cur = set(), []
        def build(i, remaining):
            if remaining == 0:
                found.add(tuple(cur))
                return
            if i == len(candidates) or candidates[i] > remaining:
                return
            cur.append(candidates[i])
            build(i + 1, remaining - candidates[i])
            cur.pop()
            build(i + 1, remaining)
        build(0, target)
        return [list(c) for c in found]`,
          javascript: r`var combinationSum2 = function(candidates, target) {
    candidates.sort((a, b) => a - b);
    const found = new Map(), cur = [];
    const build = (i, remaining) => {
        if (remaining === 0) { found.set(cur.join(','), [...cur]); return; }
        if (i === candidates.length || candidates[i] > remaining) return;
        cur.push(candidates[i]);
        build(i + 1, remaining - candidates[i]);
        cur.pop();
        build(i + 1, remaining);
    };
    build(0, target);
    return [...found.values()];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking with the duplicate-skip rule',
        idea: 'Choose the next number from `start` onwards; each position is used once (recurse with `i + 1`). At one level, skip a value equal to the previous one, since it would only repeat combinations. Sorting also lets the loop stop once values exceed the remaining sum.',
        steps: [
          'Sort `candidates`.',
          '`build(start, remaining)`: if `remaining == 0`, record a copy.',
          'For `i` from `start`: skip if `i > start` and `c[i] == c[i − 1]`; stop if `c[i] > remaining`; otherwise add `c[i]`, recurse with `(i + 1, remaining − c[i])`, remove it.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n)',
        why: 'Still exponential in the worst case, but no combination is generated twice and the sorted break cuts every branch that cannot reach the target. Recursion depth is at most n.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> out = new ArrayList<>();
        build(candidates, 0, target, new ArrayList<>(), out);
        return out;
    }

    private void build(int[] c, int start, int remaining, List<Integer> cur, List<List<Integer>> out) {
        if (remaining == 0) { out.add(new ArrayList<>(cur)); return; }
        for (int i = start; i < c.length && c[i] <= remaining; i++) {
            if (i > start && c[i] == c[i - 1]) continue;
            cur.add(c[i]);
            build(c, i + 1, remaining - c[i], cur, out);
            cur.remove(cur.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& c, int start, int remaining, vector<int>& cur, vector<vector<int>>& out) {
        if (remaining == 0) { out.push_back(cur); return; }
        for (int i = start; i < (int) c.size() && c[i] <= remaining; i++) {
            if (i > start && c[i] == c[i - 1]) continue;
            cur.push_back(c[i]);
            build(c, i + 1, remaining - c[i], cur, out);
            cur.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> out;
        vector<int> cur;
        build(candidates, 0, target, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        out, cur = [], []
        def build(start, remaining):
            if remaining == 0:
                out.append(cur[:])
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                if i > start and candidates[i] == candidates[i - 1]:
                    continue
                cur.append(candidates[i])
                build(i + 1, remaining - candidates[i])
                cur.pop()
        build(0, target)
        return out`,
          javascript: r`var combinationSum2 = function(candidates, target) {
    candidates.sort((a, b) => a - b);
    const out = [], cur = [];
    const build = (start, remaining) => {
        if (remaining === 0) { out.push([...cur]); return; }
        for (let i = start; i < candidates.length && candidates[i] <= remaining; i++) {
            if (i > start && candidates[i] === candidates[i - 1]) continue;
            cur.push(candidates[i]);
            build(i + 1, remaining - candidates[i]);
            cur.pop();
        }
    };
    build(0, target);
    return out;
};`,
        },
      },
    ],
  },

  'permutations-ii': {
    pattern: 'Sort, backtrack with a used array, and only use the first unused copy of each value',
    approaches: [
      {
        level: 'Brute force', name: 'All permutations of positions, de-duplicated with a set',
        idea: 'Generate permutations as if all values were distinct, then keep only distinct results in a set.',
        steps: [
          'Backtrack over positions with a `used` array, building every ordering.',
          'Add each completed ordering to a set.',
          'Return the set\'s contents.',
        ],
        time: 'O(n·n!)', space: 'O(n·n!)',
        why: 'All n! orderings are built even when many are equal (for `[2,2,2]` all 6 are the same); the set may store up to n! permutations.',
        code: {
          java: r`class Solution {
    private final Set<List<Integer>> found = new HashSet<>();

    public List<List<Integer>> permuteUnique(int[] nums) {
        build(nums, new boolean[nums.length], new ArrayList<>());
        return new ArrayList<>(found);
    }

    private void build(int[] nums, boolean[] used, List<Integer> cur) {
        if (cur.size() == nums.length) { found.add(new ArrayList<>(cur)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.add(nums[i]);
            build(nums, used, cur);
            cur.remove(cur.size() - 1);
            used[i] = false;
        }
    }
}`,
          cpp: r`class Solution {
    set<vector<int>> found;
    void build(vector<int>& nums, vector<bool>& used, vector<int>& cur) {
        if (cur.size() == nums.size()) { found.insert(cur); return; }
        for (size_t i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            build(nums, used, cur);
            cur.pop_back();
            used[i] = false;
        }
    }
public:
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        vector<bool> used(nums.size(), false);
        vector<int> cur;
        build(nums, used, cur);
        return vector<vector<int>>(found.begin(), found.end());
    }
};`,
          python: r`class Solution:
    def permuteUnique(self, nums: List[int]) -> List[List[int]]:
        return [list(p) for p in set(permutations(nums))]`,
          javascript: r`var permuteUnique = function(nums) {
    const found = new Map(), cur = [], used = new Array(nums.length).fill(false);
    const build = () => {
        if (cur.length === nums.length) { found.set(cur.join(','), [...cur]); return; }
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push(nums[i]);
            build();
            cur.pop();
            used[i] = false;
        }
    };
    build();
    return [...found.values()];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking with the "first unused copy" rule',
        idea: 'Sort so equal values are adjacent. When filling a position, among equal values only the first one not yet used may be chosen: if `nums[i] == nums[i − 1]` and `nums[i − 1]` is unused, picking `nums[i]` here would just repeat what picking `nums[i − 1]` produces.',
        steps: [
          'Sort `nums`.',
          'Backtrack with `used[]`: if the path is full, record a copy.',
          'For each `i`: skip if used, or if `i > 0 && nums[i] == nums[i − 1] && !used[i − 1]`.',
          'Otherwise mark, append, recurse, undo.',
        ],
        time: 'O(n·n!)', space: 'O(n)',
        why: 'The bound is the same in the worst case (all distinct), but each distinct permutation is generated exactly once and no set is needed.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        build(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }

    private void build(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> out) {
        if (cur.size() == nums.length) { out.add(new ArrayList<>(cur)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i] || (i > 0 && nums[i] == nums[i - 1] && !used[i - 1])) continue;
            used[i] = true;
            cur.add(nums[i]);
            build(nums, used, cur, out);
            cur.remove(cur.size() - 1);
            used[i] = false;
        }
    }
}`,
          cpp: r`class Solution {
    void build(vector<int>& nums, vector<bool>& used, vector<int>& cur, vector<vector<int>>& out) {
        if (cur.size() == nums.size()) { out.push_back(cur); return; }
        for (size_t i = 0; i < nums.size(); i++) {
            if (used[i] || (i > 0 && nums[i] == nums[i - 1] && !used[i - 1])) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            build(nums, used, cur, out);
            cur.pop_back();
            used[i] = false;
        }
    }
public:
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> out;
        vector<bool> used(nums.size(), false);
        vector<int> cur;
        build(nums, used, cur, out);
        return out;
    }
};`,
          python: r`class Solution:
    def permuteUnique(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        out, cur, used = [], [], [False] * len(nums)
        def build():
            if len(cur) == len(nums):
                out.append(cur[:])
                return
            for i in range(len(nums)):
                if used[i] or (i > 0 and nums[i] == nums[i - 1] and not used[i - 1]):
                    continue
                used[i] = True
                cur.append(nums[i])
                build()
                cur.pop()
                used[i] = False
        build()
        return out`,
          javascript: r`var permuteUnique = function(nums) {
    nums.sort((a, b) => a - b);
    const out = [], cur = [], used = new Array(nums.length).fill(false);
    const build = () => {
        if (cur.length === nums.length) { out.push([...cur]); return; }
        for (let i = 0; i < nums.length; i++) {
            if (used[i] || (i > 0 && nums[i] === nums[i - 1] && !used[i - 1])) continue;
            used[i] = true;
            cur.push(nums[i]);
            build();
            cur.pop();
            used[i] = false;
        }
    };
    build();
    return out;
};`,
        },
      },
    ],
  },

  'palindrome-partitioning': {
    pattern: 'Backtracking over cut positions, with a precomputed palindrome table',
    approaches: [
      {
        level: 'Better', name: 'Backtracking, checking each piece as you go',
        idea: 'Choose the end of the first piece; if that piece is a palindrome, partition the rest the same way. Each completed path is one partition.',
        steps: [
          '`build(start, pieces)`: if `start == n`, record a copy of `pieces`.',
          'For each `end` from `start` to n − 1: if `s[start..end]` is a palindrome (two-pointer check), add it, recurse from `end + 1`, then remove it.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n)',
        why: 'There are up to 2ⁿ⁻¹ partitions; the palindrome checks add O(n) per step, repeated for the same substrings many times.',
        code: {
          java: r`class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> out = new ArrayList<>();
        build(s, 0, new ArrayList<>(), out);
        return out;
    }

    private void build(String s, int start, List<String> pieces, List<List<String>> out) {
        if (start == s.length()) { out.add(new ArrayList<>(pieces)); return; }
        for (int end = start; end < s.length(); end++) {
            if (!isPal(s, start, end)) continue;
            pieces.add(s.substring(start, end + 1));
            build(s, end + 1, pieces, out);
            pieces.remove(pieces.size() - 1);
        }
    }

    private boolean isPal(String s, int i, int j) {
        while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
    bool isPal(const string& s, int i, int j) {
        while (i < j) if (s[i++] != s[j--]) return false;
        return true;
    }
    void build(const string& s, int start, vector<string>& pieces, vector<vector<string>>& out) {
        if (start == (int) s.size()) { out.push_back(pieces); return; }
        for (int end = start; end < (int) s.size(); end++) {
            if (!isPal(s, start, end)) continue;
            pieces.push_back(s.substr(start, end - start + 1));
            build(s, end + 1, pieces, out);
            pieces.pop_back();
        }
    }
public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> out;
        vector<string> pieces;
        build(s, 0, pieces, out);
        return out;
    }
};`,
          python: r`class Solution:
    def partition(self, s: str) -> List[List[str]]:
        out, pieces = [], []
        def build(start):
            if start == len(s):
                out.append(pieces[:])
                return
            for end in range(start, len(s)):
                piece = s[start:end + 1]
                if piece == piece[::-1]:
                    pieces.append(piece)
                    build(end + 1)
                    pieces.pop()
        build(0)
        return out`,
          javascript: r`var partition = function(s) {
    const out = [], pieces = [];
    const isPal = (i, j) => {
        while (i < j) if (s[i++] !== s[j--]) return false;
        return true;
    };
    const build = (start) => {
        if (start === s.length) { out.push([...pieces]); return; }
        for (let end = start; end < s.length; end++) {
            if (!isPal(start, end)) continue;
            pieces.push(s.slice(start, end + 1));
            build(end + 1);
            pieces.pop();
        }
    };
    build(0);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking with a palindrome DP table',
        idea: 'Precompute `pal[i][j]` (is `s[i..j]` a palindrome?) once: it is true when the end characters match and the inside is a palindrome. The backtracking then checks a piece in O(1).',
        steps: [
          'Fill `pal[i][j]` for `i` from n − 1 down to 0 and `j >= i`: `s[i] == s[j] && (j − i < 2 || pal[i + 1][j − 1])`.',
          'Backtrack exactly as before, but use `pal[start][end]` for the check.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(n²)',
        why: 'The table costs O(n²) once; the backtracking is still bounded by the number of partitions (each copied in O(n)), but every palindrome test is now constant time.',
        code: {
          java: r`class Solution {
    private boolean[][] pal;

    public List<List<String>> partition(String s) {
        int n = s.length();
        pal = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++)
                pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);
        List<List<String>> out = new ArrayList<>();
        build(s, 0, new ArrayList<>(), out);
        return out;
    }

    private void build(String s, int start, List<String> pieces, List<List<String>> out) {
        if (start == s.length()) { out.add(new ArrayList<>(pieces)); return; }
        for (int end = start; end < s.length(); end++) {
            if (!pal[start][end]) continue;
            pieces.add(s.substring(start, end + 1));
            build(s, end + 1, pieces, out);
            pieces.remove(pieces.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    vector<vector<bool>> pal;
    void build(const string& s, int start, vector<string>& pieces, vector<vector<string>>& out) {
        if (start == (int) s.size()) { out.push_back(pieces); return; }
        for (int end = start; end < (int) s.size(); end++) {
            if (!pal[start][end]) continue;
            pieces.push_back(s.substr(start, end - start + 1));
            build(s, end + 1, pieces, out);
            pieces.pop_back();
        }
    }
public:
    vector<vector<string>> partition(string s) {
        int n = s.size();
        pal.assign(n, vector<bool>(n, false));
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++)
                pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
        vector<vector<string>> out;
        vector<string> pieces;
        build(s, 0, pieces, out);
        return out;
    }
};`,
          python: r`class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
        out, pieces = [], []
        def build(start):
            if start == n:
                out.append(pieces[:])
                return
            for end in range(start, n):
                if pal[start][end]:
                    pieces.append(s[start:end + 1])
                    build(end + 1)
                    pieces.pop()
        build(0)
        return out`,
          javascript: r`var partition = function(s) {
    const n = s.length, pal = Array.from({ length: n }, () => new Array(n).fill(false));
    for (let i = n - 1; i >= 0; i--)
        for (let j = i; j < n; j++)
            pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);
    const out = [], pieces = [];
    const build = (start) => {
        if (start === n) { out.push([...pieces]); return; }
        for (let end = start; end < n; end++) {
            if (!pal[start][end]) continue;
            pieces.push(s.slice(start, end + 1));
            build(end + 1);
            pieces.pop();
        }
    };
    build(0);
    return out;
};`,
        },
      },
    ],
  },

  'word-search': {
    pattern: 'Grid DFS with backtracking (mark a cell while it is on the current path)',
    approaches: [
      {
        level: 'Optimal', name: 'DFS from every cell with in-place marking',
        idea: 'Try every cell as the start. From a matching cell, mark it as used, look for the next letter in the four neighbours, and unmark it when backtracking so other paths can use it.',
        steps: [
          'For each cell, call `dfs(r, c, 0)`; return true if any succeeds.',
          '`dfs(r, c, i)`: fail if out of bounds or `board[r][c] != word[i]`; succeed if `i` is the last index.',
          'Mark the cell (e.g. `#`), try the 4 neighbours with `i + 1`, restore the cell, and return whether any neighbour succeeded.',
        ],
        time: 'O(m·n·3ᴸ)', space: 'O(L)',
        why: 'From each of the m·n starts, the path branches into at most 3 new directions per letter (it never goes straight back). The recursion depth is the word length L.',
        code: {
          java: r`class Solution {
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }

    private boolean dfs(char[][] b, String w, int r, int c, int i) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(i)) return false;
        if (i == w.length() - 1) return true;
        char saved = b[r][c];
        b[r][c] = '#';
        boolean found = dfs(b, w, r + 1, c, i + 1) || dfs(b, w, r - 1, c, i + 1)
            || dfs(b, w, r, c + 1, i + 1) || dfs(b, w, r, c - 1, i + 1);
        b[r][c] = saved;
        return found;
    }
}`,
          cpp: r`class Solution {
    bool dfs(vector<vector<char>>& b, const string& w, int r, int c, size_t i) {
        if (r < 0 || c < 0 || r >= (int) b.size() || c >= (int) b[0].size() || b[r][c] != w[i]) return false;
        if (i == w.size() - 1) return true;
        char saved = b[r][c];
        b[r][c] = '#';
        bool found = dfs(b, w, r + 1, c, i + 1) || dfs(b, w, r - 1, c, i + 1)
            || dfs(b, w, r, c + 1, i + 1) || dfs(b, w, r, c - 1, i + 1);
        b[r][c] = saved;
        return found;
    }
public:
    bool exist(vector<vector<char>>& board, string word) {
        for (int r = 0; r < (int) board.size(); r++)
            for (int c = 0; c < (int) board[0].size(); c++)
                if (dfs(board, word, r, c, 0)) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])
        def dfs(r, c, i):
            if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != word[i]:
                return False
            if i == len(word) - 1:
                return True
            saved, board[r][c] = board[r][c], "#"
            found = dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)
            board[r][c] = saved
            return found
        return any(dfs(r, c, 0) for r in range(m) for c in range(n))`,
          javascript: r`var exist = function(board, word) {
    const m = board.length, n = board[0].length;
    const dfs = (r, c, i) => {
        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== word[i]) return false;
        if (i === word.length - 1) return true;
        const saved = board[r][c];
        board[r][c] = '#';
        const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
        board[r][c] = saved;
        return found;
    };
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) if (dfs(r, c, 0)) return true;
    return false;
};`,
        },
      },
    ],
  },

  'n-queens': {
    pattern: 'Backtracking row by row with O(1) conflict checks (columns and both diagonals)',
    approaches: [
      {
        level: 'Better', name: 'Place one queen per row, checking earlier rows each time',
        idea: 'Put exactly one queen in each row. Before placing a queen at `(row, col)`, scan the queens already placed to make sure none shares its column or a diagonal.',
        steps: [
          'Keep `cols[r]` = the column of the queen in row `r`.',
          'For row `row`, try each column `c`: it is safe if for every earlier row `r`, `cols[r] != c` and `|cols[r] − c| != row − r`.',
          'If safe, place it and recurse to the next row; when all rows are filled, convert `cols` to the board strings.',
        ],
        time: 'O(n·n!)', space: 'O(n)',
        why: 'The search tree has at most n! leaves (one queen per row and column), and each placement check scans up to n earlier rows.',
        code: {
          java: r`class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> out = new ArrayList<>();
        place(n, 0, new int[n], out);
        return out;
    }

    private void place(int n, int row, int[] cols, List<List<String>> out) {
        if (row == n) { out.add(draw(cols)); return; }
        for (int c = 0; c < n; c++) {
            boolean safe = true;
            for (int r = 0; r < row && safe; r++)
                if (cols[r] == c || Math.abs(cols[r] - c) == row - r) safe = false;
            if (!safe) continue;
            cols[row] = c;
            place(n, row + 1, cols, out);
        }
    }

    private List<String> draw(int[] cols) {
        List<String> board = new ArrayList<>();
        for (int c : cols) {
            char[] line = new char[cols.length];
            Arrays.fill(line, '.');
            line[c] = 'Q';
            board.add(new String(line));
        }
        return board;
    }
}`,
          cpp: r`class Solution {
    void place(int n, int row, vector<int>& cols, vector<vector<string>>& out) {
        if (row == n) {
            vector<string> board(n, string(n, '.'));
            for (int r = 0; r < n; r++) board[r][cols[r]] = 'Q';
            out.push_back(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            bool safe = true;
            for (int r = 0; r < row && safe; r++)
                if (cols[r] == c || abs(cols[r] - c) == row - r) safe = false;
            if (!safe) continue;
            cols[row] = c;
            place(n, row + 1, cols, out);
        }
    }
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> out;
        vector<int> cols(n);
        place(n, 0, cols, out);
        return out;
    }
};`,
          python: r`class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        out, cols = [], []
        def place(row):
            if row == n:
                out.append(["." * c + "Q" + "." * (n - c - 1) for c in cols])
                return
            for c in range(n):
                if all(cols[r] != c and abs(cols[r] - c) != row - r for r in range(row)):
                    cols.append(c)
                    place(row + 1)
                    cols.pop()
        place(0)
        return out`,
          javascript: r`var solveNQueens = function(n) {
    const out = [], cols = [];
    const place = (row) => {
        if (row === n) {
            out.push(cols.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
            return;
        }
        for (let c = 0; c < n; c++) {
            let safe = true;
            for (let r = 0; r < row && safe; r++)
                if (cols[r] === c || Math.abs(cols[r] - c) === row - r) safe = false;
            if (!safe) continue;
            cols.push(c);
            place(row + 1);
            cols.pop();
        }
    };
    place(0);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Backtracking with column and diagonal sets',
        idea: 'Squares on the same "\\" diagonal share `row − col`; on the same "/" diagonal they share `row + col`. Keeping three boolean arrays (columns, `row − col + n − 1`, `row + col`) makes each safety check O(1).',
        steps: [
          'Keep `col[n]`, `diag[2n − 1]` (row − col + n − 1) and `anti[2n − 1]` (row + col).',
          'For row `row`, try each `c` whose three flags are all free; set them, place the queen, recurse, then clear them.',
          'When `row == n`, draw the board.',
        ],
        time: 'O(n!)', space: 'O(n)',
        why: 'The search is bounded by n! placements and every check is constant time; the flag arrays and recursion are O(n).',
        code: {
          java: r`class Solution {
    private boolean[] col, diag, anti;
    private int[] queens;
    private final List<List<String>> out = new ArrayList<>();

    public List<List<String>> solveNQueens(int n) {
        col = new boolean[n];
        diag = new boolean[2 * n - 1];
        anti = new boolean[2 * n - 1];
        queens = new int[n];
        place(n, 0);
        return out;
    }

    private void place(int n, int row) {
        if (row == n) {
            List<String> board = new ArrayList<>();
            for (int c : queens) {
                char[] line = new char[n];
                Arrays.fill(line, '.');
                line[c] = 'Q';
                board.add(new String(line));
            }
            out.add(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            int d = row - c + n - 1, a = row + c;
            if (col[c] || diag[d] || anti[a]) continue;
            col[c] = diag[d] = anti[a] = true;
            queens[row] = c;
            place(n, row + 1);
            col[c] = diag[d] = anti[a] = false;
        }
    }
}`,
          cpp: r`class Solution {
    vector<bool> col, diag, anti;
    vector<int> queens;
    vector<vector<string>> out;
    void place(int n, int row) {
        if (row == n) {
            vector<string> board(n, string(n, '.'));
            for (int r = 0; r < n; r++) board[r][queens[r]] = 'Q';
            out.push_back(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            int d = row - c + n - 1, a = row + c;
            if (col[c] || diag[d] || anti[a]) continue;
            col[c] = diag[d] = anti[a] = true;
            queens[row] = c;
            place(n, row + 1);
            col[c] = diag[d] = anti[a] = false;
        }
    }
public:
    vector<vector<string>> solveNQueens(int n) {
        col.assign(n, false);
        diag.assign(2 * n - 1, false);
        anti.assign(2 * n - 1, false);
        queens.assign(n, 0);
        place(n, 0);
        return out;
    }
};`,
          python: r`class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        col, diag, anti = set(), set(), set()
        queens, out = [], []
        def place(row):
            if row == n:
                out.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
                return
            for c in range(n):
                if c in col or row - c in diag or row + c in anti:
                    continue
                col.add(c)
                diag.add(row - c)
                anti.add(row + c)
                queens.append(c)
                place(row + 1)
                queens.pop()
                col.remove(c)
                diag.remove(row - c)
                anti.remove(row + c)
        place(0)
        return out`,
          javascript: r`var solveNQueens = function(n) {
    const col = new Array(n).fill(false), diag = new Array(2 * n - 1).fill(false), anti = new Array(2 * n - 1).fill(false);
    const queens = [], out = [];
    const place = (row) => {
        if (row === n) {
            out.push(queens.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
            return;
        }
        for (let c = 0; c < n; c++) {
            const d = row - c + n - 1, a = row + c;
            if (col[c] || diag[d] || anti[a]) continue;
            col[c] = diag[d] = anti[a] = true;
            queens.push(c);
            place(row + 1);
            queens.pop();
            col[c] = diag[d] = anti[a] = false;
        }
    };
    place(0);
    return out;
};`,
        },
      },
    ],
  },

  'sudoku-solver': {
    pattern: 'Backtracking with constraint bitmasks (rows, columns, boxes), choosing the most constrained cell',
    approaches: [
      {
        level: 'Better', name: 'Backtracking over empty cells, scanning for conflicts',
        idea: 'Fill empty cells in order. For each, try digits 1–9, checking the row, column and box by scanning them; move on when a digit fits and undo it if the rest cannot be completed.',
        steps: [
          'Find the next empty cell; if there is none, the board is solved.',
          'For each digit, scan its row, column and 3 × 3 box for a conflict.',
          'If it fits, place it and recurse; if the recursion fails, reset the cell to `.` and try the next digit.',
        ],
        time: 'O(9ᵐ·27)', space: 'O(m)',
        why: 'm empty cells with up to 9 choices each in the worst case, and every check scans 27 cells. Real puzzles are pruned heavily, but the bound is exponential.',
        code: {
          java: r`class Solution {
    public void solveSudoku(char[][] board) {
        solve(board);
    }

    private boolean solve(char[][] b) {
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                if (b[r][c] != '.') continue;
                for (char d = '1'; d <= '9'; d++) {
                    if (!fits(b, r, c, d)) continue;
                    b[r][c] = d;
                    if (solve(b)) return true;
                    b[r][c] = '.';
                }
                return false;
            }
        return true;
    }

    private boolean fits(char[][] b, int r, int c, char d) {
        for (int k = 0; k < 9; k++) {
            if (b[r][k] == d || b[k][c] == d) return false;
            if (b[3 * (r / 3) + k / 3][3 * (c / 3) + k % 3] == d) return false;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
    bool fits(vector<vector<char>>& b, int r, int c, char d) {
        for (int k = 0; k < 9; k++) {
            if (b[r][k] == d || b[k][c] == d) return false;
            if (b[3 * (r / 3) + k / 3][3 * (c / 3) + k % 3] == d) return false;
        }
        return true;
    }
    bool solve(vector<vector<char>>& b) {
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                if (b[r][c] != '.') continue;
                for (char d = '1'; d <= '9'; d++) {
                    if (!fits(b, r, c, d)) continue;
                    b[r][c] = d;
                    if (solve(b)) return true;
                    b[r][c] = '.';
                }
                return false;
            }
        return true;
    }
public:
    void solveSudoku(vector<vector<char>>& board) {
        solve(board);
    }
};`,
          python: r`class Solution:
    def solveSudoku(self, board: List[List[str]]) -> None:
        def fits(r, c, d):
            for k in range(9):
                if board[r][k] == d or board[k][c] == d:
                    return False
                if board[3 * (r // 3) + k // 3][3 * (c // 3) + k % 3] == d:
                    return False
            return True
        def solve():
            for r in range(9):
                for c in range(9):
                    if board[r][c] != ".":
                        continue
                    for d in "123456789":
                        if fits(r, c, d):
                            board[r][c] = d
                            if solve():
                                return True
                            board[r][c] = "."
                    return False
            return True
        solve()`,
          javascript: r`var solveSudoku = function(board) {
    const fits = (r, c, d) => {
        for (let k = 0; k < 9; k++) {
            if (board[r][k] === d || board[k][c] === d) return false;
            if (board[3 * Math.floor(r / 3) + Math.floor(k / 3)][3 * Math.floor(c / 3) + k % 3] === d) return false;
        }
        return true;
    };
    const solve = () => {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++) {
                if (board[r][c] !== '.') continue;
                for (let d = 1; d <= 9; d++) {
                    const ch = String(d);
                    if (!fits(r, c, ch)) continue;
                    board[r][c] = ch;
                    if (solve()) return true;
                    board[r][c] = '.';
                }
                return false;
            }
        return true;
    };
    solve();
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bitmasks and the most-constrained empty cell first',
        idea: 'Keep a 9-bit mask of used digits for every row, column and box, so the digits allowed in a cell are found with a few bit operations. At each step fill the empty cell with the fewest options: dead ends are found almost immediately.',
        steps: [
          'Build `rows[9]`, `cols[9]`, `boxes[9]` masks from the given digits and list the empty cells.',
          'Pick the empty cell whose allowed set `~(rows | cols | boxes) & 0x1FF` has the fewest bits; if one has none, backtrack.',
          'For each allowed digit: set the bits, write the digit, recurse; on failure clear the bits and restore `.`.',
        ],
        time: 'O(9ᵐ)', space: 'O(m)',
        why: 'Still exponential in the worst case (m empty cells), but each check is O(1) and choosing the most constrained cell keeps the search tree tiny on real puzzles. The masks are a fixed 27 integers.',
        code: {
          java: r`class Solution {
    private final int[] rows = new int[9], cols = new int[9], boxes = new int[9];
    private final List<int[]> empty = new ArrayList<>();
    private char[][] b;

    public void solveSudoku(char[][] board) {
        b = board;
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                if (b[r][c] == '.') { empty.add(new int[] { r, c }); continue; }
                int bit = 1 << (b[r][c] - '1');
                rows[r] |= bit; cols[c] |= bit; boxes[(r / 3) * 3 + c / 3] |= bit;
            }
        solve(0);
    }

    private boolean solve(int filled) {
        if (filled == empty.size()) return true;
        int best = -1, bestOptions = 0, bestCount = 10;
        for (int k = filled; k < empty.size(); k++) {
            int r = empty.get(k)[0], c = empty.get(k)[1];
            int options = ~(rows[r] | cols[c] | boxes[(r / 3) * 3 + c / 3]) & 0x1FF;
            int count = Integer.bitCount(options);
            if (count < bestCount) { best = k; bestOptions = options; bestCount = count; }
        }
        Collections.swap(empty, filled, best);
        int r = empty.get(filled)[0], c = empty.get(filled)[1], box = (r / 3) * 3 + c / 3;
        for (int options = bestOptions; options != 0; options &= options - 1) {
            int bit = options & -options;
            rows[r] |= bit; cols[c] |= bit; boxes[box] |= bit;
            b[r][c] = (char) ('1' + Integer.numberOfTrailingZeros(bit));
            if (solve(filled + 1)) return true;
            rows[r] ^= bit; cols[c] ^= bit; boxes[box] ^= bit;
        }
        b[r][c] = '.';
        Collections.swap(empty, filled, best);
        return false;
    }
}`,
          cpp: r`class Solution {
    int rows[9] = {}, cols[9] = {}, boxes[9] = {};
    vector<pair<int, int>> empty;
    bool solve(vector<vector<char>>& b, size_t filled) {
        if (filled == empty.size()) return true;
        size_t best = filled;
        int bestOptions = 0, bestCount = 10;
        for (size_t k = filled; k < empty.size(); k++) {
            auto [r, c] = empty[k];
            int options = ~(rows[r] | cols[c] | boxes[(r / 3) * 3 + c / 3]) & 0x1FF;
            int count = __builtin_popcount(options);
            if (count < bestCount) { best = k; bestOptions = options; bestCount = count; }
        }
        swap(empty[filled], empty[best]);
        auto [r, c] = empty[filled];
        int box = (r / 3) * 3 + c / 3;
        for (int options = bestOptions; options; options &= options - 1) {
            int bit = options & -options;
            rows[r] |= bit; cols[c] |= bit; boxes[box] |= bit;
            b[r][c] = '1' + __builtin_ctz(bit);
            if (solve(b, filled + 1)) return true;
            rows[r] ^= bit; cols[c] ^= bit; boxes[box] ^= bit;
        }
        b[r][c] = '.';
        swap(empty[filled], empty[best]);
        return false;
    }
public:
    void solveSudoku(vector<vector<char>>& board) {
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') { empty.push_back({r, c}); continue; }
                int bit = 1 << (board[r][c] - '1');
                rows[r] |= bit; cols[c] |= bit; boxes[(r / 3) * 3 + c / 3] |= bit;
            }
        solve(board, 0);
    }
};`,
          python: r`class Solution:
    def solveSudoku(self, board: List[List[str]]) -> None:
        rows, cols, boxes = [0] * 9, [0] * 9, [0] * 9
        empty = []
        for r in range(9):
            for c in range(9):
                if board[r][c] == ".":
                    empty.append((r, c))
                else:
                    bit = 1 << (int(board[r][c]) - 1)
                    rows[r] |= bit
                    cols[c] |= bit
                    boxes[(r // 3) * 3 + c // 3] |= bit
        def options(r, c):
            return ~(rows[r] | cols[c] | boxes[(r // 3) * 3 + c // 3]) & 0x1FF
        def solve(filled):
            if filled == len(empty):
                return True
            best = min(range(filled, len(empty)), key=lambda k: bin(options(*empty[k])).count("1"))
            empty[filled], empty[best] = empty[best], empty[filled]
            r, c = empty[filled]
            box = (r // 3) * 3 + c // 3
            opts = options(r, c)
            while opts:
                bit = opts & -opts
                opts ^= bit
                rows[r] |= bit
                cols[c] |= bit
                boxes[box] |= bit
                board[r][c] = str(bit.bit_length())
                if solve(filled + 1):
                    return True
                rows[r] ^= bit
                cols[c] ^= bit
                boxes[box] ^= bit
            board[r][c] = "."
            empty[filled], empty[best] = empty[best], empty[filled]
            return False
        solve(0)`,
          javascript: r`var solveSudoku = function(board) {
    const rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0), empty = [];
    const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === '.') { empty.push([r, c]); continue; }
            const bit = 1 << (Number(board[r][c]) - 1);
            rows[r] |= bit; cols[c] |= bit; boxes[boxOf(r, c)] |= bit;
        }
    const options = (r, c) => ~(rows[r] | cols[c] | boxes[boxOf(r, c)]) & 0x1ff;
    const bits = (x) => { let n = 0; for (; x; x &= x - 1) n++; return n; };
    const solve = (filled) => {
        if (filled === empty.length) return true;
        let best = filled, bestCount = 10;
        for (let k = filled; k < empty.length; k++) {
            const count = bits(options(...empty[k]));
            if (count < bestCount) { best = k; bestCount = count; }
        }
        [empty[filled], empty[best]] = [empty[best], empty[filled]];
        const [r, c] = empty[filled], box = boxOf(r, c);
        for (let opts = options(r, c); opts; opts &= opts - 1) {
            const bit = opts & -opts;
            rows[r] |= bit; cols[c] |= bit; boxes[box] |= bit;
            board[r][c] = String(Math.log2(bit) + 1);
            if (solve(filled + 1)) return true;
            rows[r] ^= bit; cols[c] ^= bit; boxes[box] ^= bit;
        }
        board[r][c] = '.';
        [empty[filled], empty[best]] = [empty[best], empty[filled]];
        return false;
    };
    solve(0);
};`,
        },
      },
    ],
  },
};
