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
  'sum-of-all-subset-xor-totals': {
    pattern: 'Subset enumeration (and a bit-counting shortcut)',
    approaches: [
      {
        level: 'Brute force', name: 'Enumerate subsets as bitmasks',
        idea: 'Every number from 0 to 2ⁿ − 1 describes a subset. Compute each subset\'s XOR from scratch and add it up.',
        steps: [
          'For each `mask` from 0 to `2ⁿ − 1`, XOR together the `nums[i]` whose bit `i` is set.',
          'Add that XOR to the total.',
        ],
        time: 'O(n · 2ⁿ)', space: 'O(1)',
        why: '2¹² masks times 12 bits is about 50,000 steps, which is tiny. It recomputes shared prefixes, which the recursive version avoids.',
        code: {
          java: r`class Solution {
    public int subsetXORSum(int[] nums) {
        int n = nums.length, total = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            int x = 0;
            for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) x ^= nums[i];
            total += x;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int subsetXORSum(vector<int>& nums) {
        int n = nums.size(), total = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            int x = 0;
            for (int i = 0; i < n; i++) if (mask >> i & 1) x ^= nums[i];
            total += x;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def subsetXORSum(self, nums: List[int]) -> int:
        n, total = len(nums), 0
        for mask in range(1 << n):
            x = 0
            for i in range(n):
                if mask >> i & 1:
                    x ^= nums[i]
            total += x
        return total`,
          javascript: r`var subsetXORSum = function(nums) {
    const n = nums.length;
    let total = 0;
    for (let mask = 0; mask < (1 << n); mask++) {
        let x = 0;
        for (let i = 0; i < n; i++) if ((mask >> i) & 1) x ^= nums[i];
        total += x;
    }
    return total;
};`,
        },
      },
      {
        level: 'Better', name: 'Backtracking with a running XOR',
        idea: 'Decide for each element whether to include it, carrying the XOR so far; each leaf of the recursion is one subset.',
        steps: [
          '`dfs(i, x)`: if `i == n`, return `x`.',
          'Otherwise return `dfs(i + 1, x ^ nums[i]) + dfs(i + 1, x)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Each subset costs O(1) extra because the XOR is updated incrementally. The recursion is n levels deep. This include/skip shape is the template for every subset problem.',
        code: {
          java: r`class Solution {
    public int subsetXORSum(int[] nums) { return dfs(nums, 0, 0); }
    private int dfs(int[] nums, int i, int x) {
        if (i == nums.length) return x;
        return dfs(nums, i + 1, x ^ nums[i]) + dfs(nums, i + 1, x);
    }
}`,
          cpp: r`class Solution {
    int dfs(vector<int>& nums, int i, int x) {
        if (i == (int) nums.size()) return x;
        return dfs(nums, i + 1, x ^ nums[i]) + dfs(nums, i + 1, x);
    }
public:
    int subsetXORSum(vector<int>& nums) { return dfs(nums, 0, 0); }
};`,
          python: r`class Solution:
    def subsetXORSum(self, nums: List[int]) -> int:
        def dfs(i, x):
            if i == len(nums):
                return x
            return dfs(i + 1, x ^ nums[i]) + dfs(i + 1, x)
        return dfs(0, 0)`,
          javascript: r`var subsetXORSum = function(nums) {
    const dfs = (i, x) => (i === nums.length ? x : dfs(i + 1, x ^ nums[i]) + dfs(i + 1, x));
    return dfs(0, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'OR of everything × 2ⁿ⁻¹',
        idea: 'Look at one bit at a time. If any element has that bit, then exactly half of the 2ⁿ subsets have an odd number of such elements, so the bit is set in exactly 2ⁿ⁻¹ subset XORs.',
        steps: [
          'Compute `or` = the bitwise OR of all elements.',
          'Return `or << (n − 1)`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Pair every subset with the one that toggles a fixed element having that bit: exactly one of each pair has the bit set, so half of all subsets do. Summing bit by bit gives or · 2ⁿ⁻¹. Expect the interviewer to ask you to justify the "half" claim.',
        code: {
          java: r`class Solution {
    public int subsetXORSum(int[] nums) {
        int or = 0;
        for (int x : nums) or |= x;
        return or << (nums.length - 1);
    }
}`,
          cpp: r`class Solution {
public:
    int subsetXORSum(vector<int>& nums) {
        int o = 0;
        for (int x : nums) o |= x;
        return o << (nums.size() - 1);
    }
};`,
          python: r`class Solution:
    def subsetXORSum(self, nums: List[int]) -> int:
        o = 0
        for x in nums:
            o |= x
        return o << (len(nums) - 1)`,
          javascript: r`var subsetXORSum = function(nums) {
    let o = 0;
    for (const x of nums) o |= x;
    return o << (nums.length - 1);
};`,
        },
      },
    ],
  },
  'matchsticks-to-square': {
    pattern: 'Backtracking into k buckets with pruning (or bitmask DP)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every side for every stick',
        idea: 'Assign each stick in input order to one of the four sides, never letting a side exceed the target; succeed when all sticks are placed.',
        steps: [
          'If the total is not divisible by 4, return `false`; the side is `total / 4`.',
          'Recursively place stick `i` on each side `k` whose length plus the stick fits, undoing it on return.',
          'Return `true` when every stick is placed.',
        ],
        time: 'O(4ⁿ)', space: 'O(n)',
        why: 'Without ordering or symmetry pruning, the four sides are interchangeable and the search explores the same partial squares many times over. With 15 sticks that can mean around 10⁹ branches on a "no" instance, so it times out there.',
        code: {
          java: r`class Solution {
    public boolean makesquare(int[] matchsticks) {
        long sum = 0;
        for (int m : matchsticks) sum += m;
        if (sum % 4 != 0) return false;
        return place(matchsticks, 0, new long[4], sum / 4);
    }
    private boolean place(int[] s, int i, long[] sides, long side) {
        if (i == s.length) return sides[0] == side && sides[1] == side && sides[2] == side;
        for (int k = 0; k < 4; k++) {
            if (sides[k] + s[i] > side) continue;
            sides[k] += s[i];
            if (place(s, i + 1, sides, side)) return true;
            sides[k] -= s[i];
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    bool place(vector<int>& s, int i, long long* sides, long long side) {
        if (i == (int) s.size()) return sides[0] == side && sides[1] == side && sides[2] == side;
        for (int k = 0; k < 4; k++) {
            if (sides[k] + s[i] > side) continue;
            sides[k] += s[i];
            if (place(s, i + 1, sides, side)) return true;
            sides[k] -= s[i];
        }
        return false;
    }
public:
    bool makesquare(vector<int>& matchsticks) {
        long long sum = accumulate(matchsticks.begin(), matchsticks.end(), 0LL);
        if (sum % 4 != 0) return false;
        long long sides[4] = {0, 0, 0, 0};
        return place(matchsticks, 0, sides, sum / 4);
    }
};`,
          python: r`class Solution:
    def makesquare(self, matchsticks: List[int]) -> bool:
        total = sum(matchsticks)
        if total % 4:
            return False
        side, sides = total // 4, [0] * 4
        def place(i):
            if i == len(matchsticks):
                return sides[0] == sides[1] == sides[2] == side
            for k in range(4):
                if sides[k] + matchsticks[i] <= side:
                    sides[k] += matchsticks[i]
                    if place(i + 1):
                        return True
                    sides[k] -= matchsticks[i]
            return False
        return place(0)`,
          javascript: r`var makesquare = function(matchsticks) {
    const total = matchsticks.reduce((a, b) => a + b, 0);
    if (total % 4 !== 0) return false;
    const side = total / 4, sides = [0, 0, 0, 0];
    const place = (i) => {
        if (i === matchsticks.length) return sides[0] === side && sides[1] === side && sides[2] === side;
        for (let k = 0; k < 4; k++) {
            if (sides[k] + matchsticks[i] > side) continue;
            sides[k] += matchsticks[i];
            if (place(i + 1)) return true;
            sides[k] -= matchsticks[i];
        }
        return false;
    };
    return place(0);
};`,
        },
        timesOut: [6],
      },
      {
        level: 'Better', name: 'Backtracking with sorting and symmetry pruning',
        idea: 'Place the longest sticks first so overfull sides are detected early, and never try a side with the same current length as an earlier side: that branch is identical.',
        steps: [
          'Check the total is divisible by 4 and the longest stick fits in a side.',
          'Sort sticks in descending order.',
          'Place stick `i` on side `k` only if it fits and `sides[k] != sides[k − 1]`; recurse and undo.',
        ],
        time: 'O(4ⁿ) worst case', space: 'O(n)',
        why: 'The worst case is still exponential, but the two prunings cut the search by orders of magnitude in practice, and this is the version most interviewers expect. All sums use 64-bit integers: 15 sticks of 10⁸ add up to more than 2³¹.',
        code: {
          java: r`class Solution {
    public boolean makesquare(int[] matchsticks) {
        long sum = 0;
        for (int m : matchsticks) sum += m;
        if (matchsticks.length < 4 || sum % 4 != 0) return false;
        long side = sum / 4;
        Integer[] sticks = new Integer[matchsticks.length];
        for (int i = 0; i < sticks.length; i++) sticks[i] = matchsticks[i];
        Arrays.sort(sticks, Collections.reverseOrder());
        if (sticks[0] > side) return false;
        return place(sticks, 0, new long[4], side);
    }
    private boolean place(Integer[] s, int i, long[] sides, long side) {
        if (i == s.length) return true;
        for (int k = 0; k < 4; k++) {
            if (sides[k] + s[i] > side) continue;
            if (k > 0 && sides[k] == sides[k - 1]) continue;
            sides[k] += s[i];
            if (place(s, i + 1, sides, side)) return true;
            sides[k] -= s[i];
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    bool place(vector<int>& s, int i, long long* sides, long long side) {
        if (i == (int) s.size()) return true;
        for (int k = 0; k < 4; k++) {
            if (sides[k] + s[i] > side) continue;
            if (k > 0 && sides[k] == sides[k - 1]) continue;
            sides[k] += s[i];
            if (place(s, i + 1, sides, side)) return true;
            sides[k] -= s[i];
        }
        return false;
    }
public:
    bool makesquare(vector<int>& matchsticks) {
        long long sum = accumulate(matchsticks.begin(), matchsticks.end(), 0LL);
        if (matchsticks.size() < 4 || sum % 4 != 0) return false;
        sort(matchsticks.rbegin(), matchsticks.rend());
        long long side = sum / 4;
        if (matchsticks[0] > side) return false;
        long long sides[4] = {0, 0, 0, 0};
        return place(matchsticks, 0, sides, side);
    }
};`,
          python: r`class Solution:
    def makesquare(self, matchsticks: List[int]) -> bool:
        total = sum(matchsticks)
        if len(matchsticks) < 4 or total % 4:
            return False
        side = total // 4
        sticks = sorted(matchsticks, reverse=True)
        if sticks[0] > side:
            return False
        sides = [0] * 4
        def place(i):
            if i == len(sticks):
                return True
            for k in range(4):
                if sides[k] + sticks[i] > side or (k > 0 and sides[k] == sides[k - 1]):
                    continue
                sides[k] += sticks[i]
                if place(i + 1):
                    return True
                sides[k] -= sticks[i]
            return False
        return place(0)`,
          javascript: r`var makesquare = function(matchsticks) {
    const total = matchsticks.reduce((a, b) => a + b, 0);
    if (matchsticks.length < 4 || total % 4 !== 0) return false;
    const side = total / 4;
    const sticks = [...matchsticks].sort((a, b) => b - a);
    if (sticks[0] > side) return false;
    const sides = [0, 0, 0, 0];
    const place = (i) => {
        if (i === sticks.length) return true;
        for (let k = 0; k < 4; k++) {
            if (sides[k] + sticks[i] > side) continue;
            if (k > 0 && sides[k] === sides[k - 1]) continue;
            sides[k] += sticks[i];
            if (place(i + 1)) return true;
            sides[k] -= sticks[i];
        }
        return false;
    };
    return place(0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP over subsets of used sticks',
        idea: 'For a set of used sticks (a bitmask), the only thing that matters is how full the current side is: `sum(mask) % side`. Mark which masks are reachable while always filling one side at a time.',
        steps: [
          'Let `side = total / 4` and `dp[mask]` be true if the sticks in `mask` can fill whole sides plus a partial one without overflowing.',
          'From each reachable `mask`, compute its partial fill `r = sum(mask) % side`; for each unused stick with `r + stick <= side`, mark `mask | bit` reachable.',
          'Return `dp[all sticks]`.',
        ],
        time: 'O(n · 2ⁿ)', space: 'O(2ⁿ)',
        why: '2¹⁵ masks times 15 sticks is under 500,000 steps, a guaranteed bound unlike backtracking. A mask\'s sum fixes how full the current side is, so masks never need to remember which sticks went on which earlier side.',
        code: {
          java: r`class Solution {
    public boolean makesquare(int[] matchsticks) {
        int n = matchsticks.length;
        long total = 0;
        for (int m : matchsticks) total += m;
        if (n < 4 || total % 4 != 0) return false;
        long side = total / 4;
        long[] sum = new long[1 << n];
        boolean[] dp = new boolean[1 << n];
        dp[0] = true;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (!dp[mask]) continue;
            long r = sum[mask] % side;
            for (int i = 0; i < n; i++) {
                int next = mask | (1 << i);
                if (next == mask || dp[next] || r + matchsticks[i] > side) continue;
                sum[next] = sum[mask] + matchsticks[i];
                dp[next] = true;
            }
        }
        return dp[(1 << n) - 1];
    }
}`,
          cpp: r`class Solution {
public:
    bool makesquare(vector<int>& matchsticks) {
        int n = matchsticks.size();
        long long total = accumulate(matchsticks.begin(), matchsticks.end(), 0LL);
        if (n < 4 || total % 4 != 0) return false;
        long long side = total / 4;
        vector<long long> sum(1 << n, 0);
        vector<bool> dp(1 << n, false);
        dp[0] = true;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (!dp[mask]) continue;
            long long r = sum[mask] % side;
            for (int i = 0; i < n; i++) {
                int next = mask | (1 << i);
                if (next == mask || dp[next] || r + matchsticks[i] > side) continue;
                sum[next] = sum[mask] + matchsticks[i];
                dp[next] = true;
            }
        }
        return dp[(1 << n) - 1];
    }
};`,
          python: r`class Solution:
    def makesquare(self, matchsticks: List[int]) -> bool:
        n, total = len(matchsticks), sum(matchsticks)
        if n < 4 or total % 4:
            return False
        side = total // 4
        size = 1 << n
        sums = [0] * size
        dp = [False] * size
        dp[0] = True
        for mask in range(size):
            if not dp[mask]:
                continue
            r = sums[mask] % side
            for i in range(n):
                nxt = mask | (1 << i)
                if nxt == mask or dp[nxt] or r + matchsticks[i] > side:
                    continue
                sums[nxt] = sums[mask] + matchsticks[i]
                dp[nxt] = True
        return dp[size - 1]`,
          javascript: r`var makesquare = function(matchsticks) {
    const n = matchsticks.length;
    const total = matchsticks.reduce((a, b) => a + b, 0);
    if (n < 4 || total % 4 !== 0) return false;
    const side = total / 4, size = 1 << n;
    const sum = new Float64Array(size), dp = new Uint8Array(size);
    dp[0] = 1;
    for (let mask = 0; mask < size; mask++) {
        if (!dp[mask]) continue;
        const r = sum[mask] % side;
        for (let i = 0; i < n; i++) {
            const next = mask | (1 << i);
            if (next === mask || dp[next] || r + matchsticks[i] > side) continue;
            sum[next] = sum[mask] + matchsticks[i];
            dp[next] = 1;
        }
    }
    return dp[size - 1] === 1;
};`,
        },
      },
    ],
  },
  'n-queens-ii': {
    pattern: 'Row-by-row backtracking with column and diagonal sets',
    approaches: [
      {
        level: 'Brute force', name: 'Check the board on every placement',
        idea: 'Place one queen per row; before placing, scan the earlier rows to see whether any queen attacks this square.',
        steps: [
          'Keep `col[r]`, the column of the queen in row `r`.',
          'For row `r`, try each column `c`; it is safe if no earlier row `i` has `col[i] == c` or `|col[i] − c| == r − i`.',
          'Count placements that reach row `n`.',
        ],
        time: 'O(n! · n)', space: 'O(n)',
        why: 'The safety check costs O(n) per square. For n ≤ 9 it is fast, but the sets or bitmasks below make every check O(1).',
        code: {
          java: r`class Solution {
    public int totalNQueens(int n) { return place(new int[n], 0); }
    private int place(int[] col, int r) {
        int n = col.length;
        if (r == n) return 1;
        int total = 0;
        for (int c = 0; c < n; c++) {
            boolean ok = true;
            for (int i = 0; i < r && ok; i++) if (col[i] == c || Math.abs(col[i] - c) == r - i) ok = false;
            if (!ok) continue;
            col[r] = c;
            total += place(col, r + 1);
        }
        return total;
    }
}`,
          cpp: r`class Solution {
    int place(vector<int>& col, int r) {
        int n = col.size();
        if (r == n) return 1;
        int total = 0;
        for (int c = 0; c < n; c++) {
            bool ok = true;
            for (int i = 0; i < r && ok; i++) if (col[i] == c || abs(col[i] - c) == r - i) ok = false;
            if (!ok) continue;
            col[r] = c;
            total += place(col, r + 1);
        }
        return total;
    }
public:
    int totalNQueens(int n) {
        vector<int> col(n);
        return place(col, 0);
    }
};`,
          python: r`class Solution:
    def totalNQueens(self, n: int) -> int:
        col = [0] * n
        def place(r):
            if r == n:
                return 1
            total = 0
            for c in range(n):
                if all(col[i] != c and abs(col[i] - c) != r - i for i in range(r)):
                    col[r] = c
                    total += place(r + 1)
            return total
        return place(0)`,
          javascript: r`var totalNQueens = function(n) {
    const col = new Array(n);
    const place = (r) => {
        if (r === n) return 1;
        let total = 0;
        for (let c = 0; c < n; c++) {
            let ok = true;
            for (let i = 0; i < r && ok; i++) if (col[i] === c || Math.abs(col[i] - c) === r - i) ok = false;
            if (!ok) continue;
            col[r] = c;
            total += place(r + 1);
        }
        return total;
    };
    return place(0);
};`,
        },
      },
      {
        level: 'Better', name: 'Sets of used columns and diagonals',
        idea: 'Keep three boolean arrays: used columns, used `r − c` diagonals and used `r + c` anti-diagonals. A square is safe in O(1).',
        steps: [
          'For row `r`, try each column `c` with `cols[c]`, `d1[r − c + n − 1]` and `d2[r + c]` all free.',
          'Mark the three, recurse into row `r + 1`, then unmark.',
          'Return 1 when `r == n`, and sum the counts.',
        ],
        time: 'O(n!)', space: 'O(n)',
        why: 'Each placement and check is constant time, so the cost is the size of the search tree, roughly n!. The offset `n − 1` keeps `r − c` non-negative as an index.',
        code: {
          java: r`class Solution {
    public int totalNQueens(int n) { return place(n, 0, new boolean[n], new boolean[2 * n], new boolean[2 * n]); }
    private int place(int n, int r, boolean[] cols, boolean[] d1, boolean[] d2) {
        if (r == n) return 1;
        int total = 0;
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n - 1] || d2[r + c]) continue;
            cols[c] = d1[r - c + n - 1] = d2[r + c] = true;
            total += place(n, r + 1, cols, d1, d2);
            cols[c] = d1[r - c + n - 1] = d2[r + c] = false;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
    int n;
    vector<bool> cols, d1, d2;
    int place(int r) {
        if (r == n) return 1;
        int total = 0;
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n - 1] || d2[r + c]) continue;
            cols[c] = d1[r - c + n - 1] = d2[r + c] = true;
            total += place(r + 1);
            cols[c] = d1[r - c + n - 1] = d2[r + c] = false;
        }
        return total;
    }
public:
    int totalNQueens(int n) {
        this->n = n;
        cols.assign(n, false); d1.assign(2 * n, false); d2.assign(2 * n, false);
        return place(0);
    }
};`,
          python: r`class Solution:
    def totalNQueens(self, n: int) -> int:
        cols, d1, d2 = set(), set(), set()
        def place(r):
            if r == n:
                return 1
            total = 0
            for c in range(n):
                if c in cols or r - c in d1 or r + c in d2:
                    continue
                cols.add(c); d1.add(r - c); d2.add(r + c)
                total += place(r + 1)
                cols.remove(c); d1.remove(r - c); d2.remove(r + c)
            return total
        return place(0)`,
          javascript: r`var totalNQueens = function(n) {
    const cols = new Array(n).fill(false), d1 = new Array(2 * n).fill(false), d2 = new Array(2 * n).fill(false);
    const place = (r) => {
        if (r === n) return 1;
        let total = 0;
        for (let c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n - 1] || d2[r + c]) continue;
            cols[c] = d1[r - c + n - 1] = d2[r + c] = true;
            total += place(r + 1);
            cols[c] = d1[r - c + n - 1] = d2[r + c] = false;
        }
        return total;
    };
    return place(0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bitmask backtracking',
        idea: 'Represent attacked columns and both diagonal directions as bitmasks. Shifting the diagonal masks by one per row moves the attacks down the board, and the free squares of a row are one bit expression.',
        steps: [
          '`count(row, cols, d1, d2)`: if `row == n`, return 1.',
          '`free = ~(cols | d1 | d2) & ((1 << n) − 1)`.',
          'While `free` is not 0: take the lowest bit `b = free & −free`, remove it, and add `count(row + 1, cols | b, (d1 | b) << 1, (d2 | b) >> 1)`.',
        ],
        time: 'O(n!)', space: 'O(n)',
        why: 'Same search tree as the sets version, but each step is a handful of CPU instructions and only free squares are visited, so it is many times faster in practice. Only the count is needed, so no board is ever built.',
        code: {
          java: r`class Solution {
    public int totalNQueens(int n) { return count(n, 0, 0, 0, 0); }
    private int count(int n, int row, int cols, int d1, int d2) {
        if (row == n) return 1;
        int total = 0, free = ~(cols | d1 | d2) & ((1 << n) - 1);
        while (free != 0) {
            int bit = free & -free;
            free -= bit;
            total += count(n, row + 1, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);
        }
        return total;
    }
}`,
          cpp: r`class Solution {
    int count(int n, int row, int cols, int d1, int d2) {
        if (row == n) return 1;
        int total = 0, free = ~(cols | d1 | d2) & ((1 << n) - 1);
        while (free) {
            int bit = free & -free;
            free -= bit;
            total += count(n, row + 1, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);
        }
        return total;
    }
public:
    int totalNQueens(int n) { return count(n, 0, 0, 0, 0); }
};`,
          python: r`class Solution:
    def totalNQueens(self, n: int) -> int:
        full = (1 << n) - 1
        def count(row, cols, d1, d2):
            if row == n:
                return 1
            total, free = 0, ~(cols | d1 | d2) & full
            while free:
                bit = free & -free
                free -= bit
                total += count(row + 1, cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1)
            return total
        return count(0, 0, 0, 0)`,
          javascript: r`var totalNQueens = function(n) {
    const full = (1 << n) - 1;
    const count = (row, cols, d1, d2) => {
        if (row === n) return 1;
        let total = 0, free = ~(cols | d1 | d2) & full;
        while (free) {
            const bit = free & -free;
            free -= bit;
            total += count(row + 1, cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1);
        }
        return total;
    };
    return count(0, 0, 0, 0);
};`,
        },
      },
    ],
  },
  'word-break-ii': {
    pattern: 'Backtracking over prefixes, memoised by start index',
    approaches: [
      {
        level: 'Brute force', name: 'Plain backtracking',
        idea: 'From position `i`, try every dictionary word that matches the text starting there, and recurse on the rest; when you reach the end, record the sentence.',
        steps: [
          'Put the words in a hash set.',
          '`dfs(i, path)`: if `i == n`, add `path` joined by spaces to the answer.',
          'Otherwise, for each `j > i` with `s[i..j)` in the set, push that word, call `dfs(j)`, and pop it.',
        ],
        time: 'O(2ⁿ · n)', space: 'O(n)',
        why: 'There can be up to 2ⁿ⁻¹ ways to cut a string of length n, and building each sentence costs O(n). Worse, strings like "aaa…ab" explore an exponential number of dead ends that produce no sentence at all. With n ≤ 20 it still finishes, but memoisation removes the repeated work.',
        code: {
          java: r`class Solution {
    public List<String> wordBreak(String s, List<String> wordDict) {
        List<String> out = new ArrayList<>();
        dfs(s, 0, new HashSet<>(wordDict), new ArrayList<>(), out);
        return out;
    }
    private void dfs(String s, int i, Set<String> dict, List<String> path, List<String> out) {
        if (i == s.length()) { out.add(String.join(" ", path)); return; }
        for (int j = i + 1; j <= s.length(); j++) {
            String w = s.substring(i, j);
            if (!dict.contains(w)) continue;
            path.add(w);
            dfs(s, j, dict, path, out);
            path.remove(path.size() - 1);
        }
    }
}`,
          cpp: r`class Solution {
    unordered_set<string> dict;
    vector<string> path, out;
    void dfs(const string& s, int i) {
        if (i == (int) s.size()) {
            string sentence;
            for (size_t k = 0; k < path.size(); k++) sentence += (k ? " " : "") + path[k];
            out.push_back(sentence);
            return;
        }
        for (int j = i + 1; j <= (int) s.size(); j++) {
            string w = s.substr(i, j - i);
            if (!dict.count(w)) continue;
            path.push_back(w);
            dfs(s, j);
            path.pop_back();
        }
    }
public:
    vector<string> wordBreak(string s, vector<string>& wordDict) {
        dict = unordered_set<string>(wordDict.begin(), wordDict.end());
        dfs(s, 0);
        return out;
    }
};`,
          python: r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:
        words, out, path = set(wordDict), [], []
        def dfs(i):
            if i == len(s):
                out.append(" ".join(path))
                return
            for j in range(i + 1, len(s) + 1):
                if s[i:j] in words:
                    path.append(s[i:j])
                    dfs(j)
                    path.pop()
        dfs(0)
        return out`,
          javascript: r`var wordBreak = function(s, wordDict) {
    const dict = new Set(wordDict), out = [], path = [];
    const dfs = (i) => {
        if (i === s.length) { out.push(path.join(" ")); return; }
        for (let j = i + 1; j <= s.length; j++) {
            const w = s.slice(i, j);
            if (!dict.has(w)) continue;
            path.push(w);
            dfs(j);
            path.pop();
        }
    };
    dfs(0);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Memoised sentences per start index',
        idea: 'The sentences for a suffix starting at `i` do not depend on how you got there. Compute them once per `i` and reuse them.',
        steps: [
          '`go(i)` returns every sentence for `s[i..]`; `go(n)` is a list holding the empty sentence.',
          'For each `j > i` with `s[i..j)` in the dictionary, prepend that word to each sentence of `go(j)`.',
          'Cache `go(i)` in a map and return `go(0)`.',
        ],
        time: 'O(n² + total output size)', space: 'O(n · output)',
        why: 'Each start index is solved once: O(n²) substring checks plus the cost of building the answers, which is unavoidable because they must all be returned. Dead-end suffixes cache an empty list, so "aaa…ab" collapses to polynomial work.',
        code: {
          java: r`class Solution {
    public List<String> wordBreak(String s, List<String> wordDict) {
        return go(s, 0, new HashSet<>(wordDict), new HashMap<>());
    }
    private List<String> go(String s, int i, Set<String> dict, Map<Integer, List<String>> memo) {
        if (memo.containsKey(i)) return memo.get(i);
        List<String> out = new ArrayList<>();
        if (i == s.length()) out.add("");
        for (int j = i + 1; j <= s.length(); j++) {
            String w = s.substring(i, j);
            if (!dict.contains(w)) continue;
            for (String rest : go(s, j, dict, memo)) out.add(rest.isEmpty() ? w : w + " " + rest);
        }
        memo.put(i, out);
        return out;
    }
}`,
          cpp: r`class Solution {
    unordered_set<string> dict;
    unordered_map<int, vector<string>> memo;
    const vector<string>& go(const string& s, int i) {
        auto it = memo.find(i);
        if (it != memo.end()) return it->second;
        vector<string> out;
        if (i == (int) s.size()) out.push_back("");
        for (int j = i + 1; j <= (int) s.size(); j++) {
            string w = s.substr(i, j - i);
            if (!dict.count(w)) continue;
            for (const string& rest : go(s, j)) out.push_back(rest.empty() ? w : w + " " + rest);
        }
        return memo[i] = out;
    }
public:
    vector<string> wordBreak(string s, vector<string>& wordDict) {
        dict = unordered_set<string>(wordDict.begin(), wordDict.end());
        return go(s, 0);
    }
};`,
          python: r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:
        words = set(wordDict)
        @lru_cache(maxsize=None)
        def go(i):
            if i == len(s):
                return [""]
            out = []
            for j in range(i + 1, len(s) + 1):
                w = s[i:j]
                if w in words:
                    out += [w if not rest else w + " " + rest for rest in go(j)]
            return out
        return go(0)`,
          javascript: r`var wordBreak = function(s, wordDict) {
    const dict = new Set(wordDict), memo = new Map();
    const go = (i) => {
        if (memo.has(i)) return memo.get(i);
        const out = [];
        if (i === s.length) out.push("");
        for (let j = i + 1; j <= s.length; j++) {
            const w = s.slice(i, j);
            if (!dict.has(w)) continue;
            for (const rest of go(j)) out.push(rest === "" ? w : w + " " + rest);
        }
        memo.set(i, out);
        return out;
    };
    return go(0);
};`,
        },
      },
    ],
  },
};
