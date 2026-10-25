const r = String.raw;

export default {
  'two-sum': {
    pattern: 'Hash map of value → index (look up the complement)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every pair',
        idea: 'Check every pair of different positions and return the one whose values add up to `target`.',
        steps: [
          'For each `i`, and each `j > i`:',
          'If `nums[i] + nums[j] == target`, return `[i, j]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n − 1)/2 pairs, each checked in O(1). In C++ the sum is computed in `long long`, since two values near 10⁹ overflow an `int`.',
        code: {
          java: r`class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if ((long) nums[i] + nums[j] == target) return new int[] { i, j };
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if ((long long) nums[i] + nums[j] == target) return {i, j};
        return {};
    }
};`,
          python: r`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
          javascript: r`var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] === target) return [i, j];
    return [];
};`,
        },
      },
      {
        level: 'Better', name: 'Sort the indices, then two pointers',
        idea: 'Sorting lets two pointers find the pair in one pass, but the answer needs the original indices — so sort the indices by their values instead of the values themselves.',
        steps: [
          'Make an array of indices `0..n − 1` and sort it by `nums[index]`.',
          'Put `i` at the first and `j` at the last sorted position.',
          'If the two values sum to `target`, return their original indices; if the sum is too small move `i` right, otherwise move `j` left.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Sorting dominates at O(n log n); the two-pointer scan is O(n). The index array takes O(n) memory.',
        code: {
          java: r`class Solution {
    public int[] twoSum(int[] nums, int target) {
        Integer[] idx = new Integer[nums.length];
        for (int k = 0; k < idx.length; k++) idx[k] = k;
        Arrays.sort(idx, (a, b) -> Integer.compare(nums[a], nums[b]));
        int i = 0, j = idx.length - 1;
        while (i < j) {
            long sum = (long) nums[idx[i]] + nums[idx[j]];
            if (sum == target) return new int[] { idx[i], idx[j] };
            if (sum < target) i++; else j--;
        }
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> idx(nums.size());
        iota(idx.begin(), idx.end(), 0);
        sort(idx.begin(), idx.end(), [&](int a, int b) { return nums[a] < nums[b]; });
        int i = 0, j = (int) idx.size() - 1;
        while (i < j) {
            long long sum = (long long) nums[idx[i]] + nums[idx[j]];
            if (sum == target) return {idx[i], idx[j]};
            if (sum < target) i++; else j--;
        }
        return {};
    }
};`,
          python: r`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        idx = sorted(range(len(nums)), key=lambda k: nums[k])
        i, j = 0, len(idx) - 1
        while i < j:
            s = nums[idx[i]] + nums[idx[j]]
            if s == target:
                return [idx[i], idx[j]]
            if s < target:
                i += 1
            else:
                j -= 1
        return []`,
          javascript: r`var twoSum = function(nums, target) {
    const idx = nums.map((_, k) => k).sort((a, b) => nums[a] - nums[b]);
    let i = 0, j = idx.length - 1;
    while (i < j) {
        const sum = nums[idx[i]] + nums[idx[j]];
        if (sum === target) return [idx[i], idx[j]];
        if (sum < target) i++; else j--;
    }
    return [];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass with a hash map',
        idea: 'For each value, the partner it needs is `target − nums[i]`. Remember every value seen so far with its index; if the partner was already seen, the pair is found.',
        steps: [
          'Create an empty map from value to index.',
          'For each `i`, compute `need = target − nums[i]`.',
          'If `need` is in the map, return `[map[need], i]`.',
          'Otherwise store `nums[i] → i` and continue.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass with O(1) average map operations. Checking before inserting means an element is never paired with itself, while two equal values at different indices still match.',
        code: {
          java: r`class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[] { j, i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<long long, int> seen;
        for (int i = 0; i < (int) nums.size(); i++) {
            auto it = seen.find((long long) target - nums[i]);
            if (it != seen.end()) return {it->second, i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
          python: r`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, x in enumerate(nums):
            if target - x in seen:
                return [seen[target - x], i]
            seen[x] = i
        return []`,
          javascript: r`var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
    }
    return [];
};`,
        },
      },
    ],
  },

  'contains-duplicate': {
    pattern: 'Hash set membership (have I seen this before?)',
    approaches: [
      {
        level: 'Brute force', name: 'Compare every pair',
        idea: 'A duplicate exists if some pair of positions holds the same value.',
        steps: [
          'For each `i` and each `j > i`, if `nums[i] == nums[j]`, return true.',
          'If no pair matches, return false.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n − 1)/2 comparisons. For n = 10⁵ that is about 5 × 10⁹ — far too slow.',
        code: {
          java: r`class Solution {
    public boolean containsDuplicate(int[] nums) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if (nums[i] == nums[j]) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (nums[i] == nums[j]) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] == nums[j]:
                    return True
        return False`,
          javascript: r`var containsDuplicate = function(nums) {
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
            if (nums[i] === nums[j]) return true;
    return false;
};`,
        },
      },
      {
        level: 'Better', name: 'Sort, then compare neighbours',
        idea: 'After sorting, equal values sit next to each other, so one pass over neighbours finds any duplicate.',
        steps: [
          'Sort `nums`.',
          'For each `i` from 1, if `nums[i] == nums[i − 1]`, return true.',
          'Return false.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'The sort dominates. It needs no extra structure beyond the sort\'s own stack, but it changes the input order.',
        code: {
          java: r`class Solution {
    public boolean containsDuplicate(int[] nums) {
        Arrays.sort(nums);
        for (int i = 1; i < nums.length; i++)
            if (nums[i] == nums[i - 1]) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        for (int i = 1; i < (int) nums.size(); i++)
            if (nums[i] == nums[i - 1]) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        nums.sort()
        return any(nums[i] == nums[i - 1] for i in range(1, len(nums)))`,
          javascript: r`var containsDuplicate = function(nums) {
    nums.sort((a, b) => a - b);
    for (let i = 1; i < nums.length; i++)
        if (nums[i] === nums[i - 1]) return true;
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Hash set of values seen so far',
        idea: 'Walk the array once, remembering each value in a set. Meeting a value that is already in the set means it appears twice.',
        steps: [
          'Create an empty set.',
          'For each value: if it is in the set, return true; otherwise add it.',
          'Return false after the loop.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass with O(1) average set operations; the set may hold all n values when they are distinct.',
        code: {
          java: r`class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums)
            if (!seen.add(x)) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums)
            if (!seen.insert(x).second) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for x in nums:
            if x in seen:
                return True
            seen.add(x)
        return False`,
          javascript: r`var containsDuplicate = function(nums) {
    const seen = new Set();
    for (const x of nums) {
        if (seen.has(x)) return true;
        seen.add(x);
    }
    return false;
};`,
        },
      },
    ],
  },

  'valid-anagram': {
    pattern: 'Frequency counting (array of 26 counts as a hash map)',
    approaches: [
      {
        level: 'Brute force', name: 'Cross off each letter of s in t',
        idea: 'For every letter of `s`, find an unused copy of it in `t` and cross it off. If some letter has no copy left, or the lengths differ, they are not anagrams.',
        steps: [
          'If the lengths differ, return false.',
          'Keep a `used` flag for each position of `t`.',
          'For each letter of `s`, scan `t` for an unused position with the same letter; if none, return false; otherwise mark it used.',
          'Return true.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each of the n letters may scan all n positions of `t`. The flags take O(n).',
        code: {
          java: r`class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        boolean[] used = new boolean[t.length()];
        for (char c : s.toCharArray()) {
            int k = 0;
            while (k < t.length() && (used[k] || t.charAt(k) != c)) k++;
            if (k == t.length()) return false;
            used[k] = true;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        vector<bool> used(t.size(), false);
        for (char c : s) {
            size_t k = 0;
            while (k < t.size() && (used[k] || t[k] != c)) k++;
            if (k == t.size()) return false;
            used[k] = true;
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        used = [False] * len(t)
        for c in s:
            k = 0
            while k < len(t) and (used[k] or t[k] != c):
                k += 1
            if k == len(t):
                return False
            used[k] = True
        return True`,
          javascript: r`var isAnagram = function(s, t) {
    if (s.length !== t.length) return false;
    const used = new Array(t.length).fill(false);
    for (const c of s) {
        let k = 0;
        while (k < t.length && (used[k] || t[k] !== c)) k++;
        if (k === t.length) return false;
        used[k] = true;
    }
    return true;
};`,
        },
      },
      {
        level: 'Better', name: 'Sort both strings and compare',
        idea: 'Anagrams become the same string once their letters are sorted.',
        steps: [
          'If the lengths differ, return false.',
          'Sort the letters of both strings.',
          'Return whether the sorted strings are equal.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Two sorts of n letters; the sorted copies take O(n) memory.',
        code: {
          java: r`class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        char[] a = s.toCharArray(), b = t.toCharArray();
        Arrays.sort(a);
        Arrays.sort(b);
        return Arrays.equals(a, b);
    }
}`,
          cpp: r`class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        return s == t;
    }
};`,
          python: r`class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return sorted(s) == sorted(t)`,
          javascript: r`var isAnagram = function(s, t) {
    if (s.length !== t.length) return false;
    return s.split('').sort().join('') === t.split('').sort().join('');
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count letters up for s and down for t',
        idea: 'Keep one count per letter: add 1 for each letter of `s` and subtract 1 for each letter of `t`. They are anagrams exactly when every count ends at 0.',
        steps: [
          'If the lengths differ, return false.',
          'For each index `i`, increase `count[s[i]]` and decrease `count[t[i]]`.',
          'Return true if all 26 counts are 0.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass over both strings; the table has a fixed 26 entries. (For Unicode input, use a hash map instead — still O(n).)',
        code: {
          java: r`class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {0};
        for (size_t i = 0; i < s.size(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = [0] * 26
        for a, b in zip(s, t):
            count[ord(a) - 97] += 1
            count[ord(b) - 97] -= 1
        return all(c == 0 for c in count)`,
          javascript: r`var isAnagram = function(s, t) {
    if (s.length !== t.length) return false;
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++;
        count[t.charCodeAt(i) - 97]--;
    }
    return count.every((c) => c === 0);
};`,
        },
      },
    ],
  },

  'first-unique-character-in-a-string': {
    pattern: 'Two passes with a frequency table (count first, then scan in order)',
    approaches: [
      {
        level: 'Brute force', name: 'For each character, check the whole string',
        idea: 'A character is unique if no other position holds the same character. Check each position in order and return the first unique one.',
        steps: [
          'For each index `i`, scan all `j != i`.',
          'If no `s[j] == s[i]`, return `i`.',
          'Return −1 if every character repeats.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each of the n positions may compare against all n others.',
        code: {
          java: r`class Solution {
    public int firstUniqChar(String s) {
        int n = s.length();
        for (int i = 0; i < n; i++) {
            boolean unique = true;
            for (int j = 0; j < n && unique; j++)
                if (j != i && s.charAt(j) == s.charAt(i)) unique = false;
            if (unique) return i;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int firstUniqChar(string s) {
        int n = s.size();
        for (int i = 0; i < n; i++) {
            bool unique = true;
            for (int j = 0; j < n && unique; j++)
                if (j != i && s[j] == s[i]) unique = false;
            if (unique) return i;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def firstUniqChar(self, s: str) -> int:
        n = len(s)
        for i in range(n):
            if all(j == i or s[j] != s[i] for j in range(n)):
                return i
        return -1`,
          javascript: r`var firstUniqChar = function(s) {
    const n = s.length;
    for (let i = 0; i < n; i++) {
        let unique = true;
        for (let j = 0; j < n && unique; j++)
            if (j !== i && s[j] === s[i]) unique = false;
        if (unique) return i;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count every letter, then find the first with count 1',
        idea: 'First count how often each letter appears. Then walk the string from the start; the first letter whose count is 1 is the answer.',
        steps: [
          'Count each letter of `s` in a 26-entry table.',
          'Scan `s` from index 0; return the first `i` with `count[s[i]] == 1`.',
          'Return −1 if none.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two linear passes; the table has a fixed 26 entries.',
        code: {
          java: r`class Solution {
    public int firstUniqChar(String s) {
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) count[s.charAt(i) - 'a']++;
        for (int i = 0; i < s.length(); i++)
            if (count[s.charAt(i) - 'a'] == 1) return i;
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int firstUniqChar(string s) {
        int count[26] = {0};
        for (char c : s) count[c - 'a']++;
        for (int i = 0; i < (int) s.size(); i++)
            if (count[s[i] - 'a'] == 1) return i;
        return -1;
    }
};`,
          python: r`class Solution:
    def firstUniqChar(self, s: str) -> int:
        count = Counter(s)
        for i, c in enumerate(s):
            if count[c] == 1:
                return i
        return -1`,
          javascript: r`var firstUniqChar = function(s) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) count[s.charCodeAt(i) - 97]++;
    for (let i = 0; i < s.length; i++)
        if (count[s.charCodeAt(i) - 97] === 1) return i;
    return -1;
};`,
        },
      },
    ],
  },

  'group-anagrams': {
    pattern: 'Hash map from a canonical key (sorted letters or letter counts) to its group',
    approaches: [
      {
        level: 'Brute force', name: 'Compare each word with the first word of every group',
        idea: 'Keep a list of groups. For each word, check it against one member of every existing group with an anagram test; join the group that matches, or start a new one.',
        steps: [
          'Start with no groups.',
          'For each word, walk through the groups and test whether it is an anagram of the group\'s first word (compare letter counts).',
          'Add the word to the first matching group, or create a new group for it.',
          'Return the groups.',
        ],
        time: 'O(n²·L)', space: 'O(n·L)',
        why: 'A word may be compared with up to n groups, each comparison O(L) for words of length up to L. The output holds every word.',
        code: {
          java: r`class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        List<List<String>> groups = new ArrayList<>();
        for (String w : strs) {
            boolean placed = false;
            for (List<String> g : groups) {
                if (isAnagram(g.get(0), w)) { g.add(w); placed = true; break; }
            }
            if (!placed) groups.add(new ArrayList<>(List.of(w)));
        }
        return groups;
    }

    private boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < a.length(); i++) { count[a.charAt(i) - 'a']++; count[b.charAt(i) - 'a']--; }
        for (int c : count) if (c != 0) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
    bool isAnagram(const string& a, const string& b) {
        if (a.size() != b.size()) return false;
        int count[26] = {0};
        for (size_t i = 0; i < a.size(); i++) { count[a[i] - 'a']++; count[b[i] - 'a']--; }
        for (int c : count) if (c != 0) return false;
        return true;
    }
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        vector<vector<string>> groups;
        for (auto& w : strs) {
            bool placed = false;
            for (auto& g : groups) {
                if (isAnagram(g[0], w)) { g.push_back(w); placed = true; break; }
            }
            if (!placed) groups.push_back({w});
        }
        return groups;
    }
};`,
          python: r`class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = []
        for w in strs:
            for g in groups:
                if len(g[0]) == len(w) and Counter(g[0]) == Counter(w):
                    g.append(w)
                    break
            else:
                groups.append([w])
        return groups`,
          javascript: r`var groupAnagrams = function(strs) {
    const isAnagram = (a, b) => {
        if (a.length !== b.length) return false;
        const count = new Array(26).fill(0);
        for (let i = 0; i < a.length; i++) { count[a.charCodeAt(i) - 97]++; count[b.charCodeAt(i) - 97]--; }
        return count.every((c) => c === 0);
    };
    const groups = [];
    for (const w of strs) {
        const g = groups.find((g) => isAnagram(g[0], w));
        if (g) g.push(w); else groups.push([w]);
    }
    return groups;
};`,
        },
      },
      {
        level: 'Better', name: 'Group by the sorted word',
        idea: 'All anagrams have the same letters in sorted order, so the sorted word is a key that identifies the group. A hash map from key to list does the grouping in one pass.',
        steps: [
          'Create a map from key to list of words.',
          'For each word, sort its letters to get the key and append the word to that key\'s list.',
          'Return the map\'s lists.',
        ],
        time: 'O(n·L log L)', space: 'O(n·L)',
        why: 'Each of the n words is sorted in O(L log L). The map stores every word once plus its key.',
        code: {
          java: r`class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : strs) {
            char[] c = w.toCharArray();
            Arrays.sort(c);
            groups.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (auto& w : strs) {
            string key = w;
            sort(key.begin(), key.end());
            groups[key].push_back(w);
        }
        vector<vector<string>> out;
        for (auto& [key, g] : groups) out.push_back(g);
        return out;
    }
};`,
          python: r`class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for w in strs:
            groups["".join(sorted(w))].append(w)
        return list(groups.values())`,
          javascript: r`var groupAnagrams = function(strs) {
    const groups = new Map();
    for (const w of strs) {
        const key = w.split('').sort().join('');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(w);
    }
    return [...groups.values()];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Group by letter counts',
        idea: 'Counting the 26 letters of a word gives a key without sorting. Anagrams have identical counts, so they share a key.',
        steps: [
          'For each word, count its letters into 26 slots.',
          'Turn the counts into a key (for example the counts joined by `#`).',
          'Append the word to the map entry for that key.',
          'Return the map\'s lists.',
        ],
        time: 'O(n·L)', space: 'O(n·L)',
        why: 'Each word is counted in O(L) and its key built in O(26). The map stores every word.',
        code: {
          java: r`class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : strs) {
            int[] count = new int[26];
            for (int i = 0; i < w.length(); i++) count[w.charAt(i) - 'a']++;
            StringBuilder key = new StringBuilder();
            for (int c : count) key.append(c).append('#');
            groups.computeIfAbsent(key.toString(), k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (auto& w : strs) {
            int count[26] = {0};
            for (char c : w) count[c - 'a']++;
            string key;
            for (int c : count) key += to_string(c) + '#';
            groups[key].push_back(w);
        }
        vector<vector<string>> out;
        for (auto& [key, g] : groups) out.push_back(g);
        return out;
    }
};`,
          python: r`class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for w in strs:
            count = [0] * 26
            for c in w:
                count[ord(c) - 97] += 1
            groups[tuple(count)].append(w)
        return list(groups.values())`,
          javascript: r`var groupAnagrams = function(strs) {
    const groups = new Map();
    for (const w of strs) {
        const count = new Array(26).fill(0);
        for (let i = 0; i < w.length; i++) count[w.charCodeAt(i) - 97]++;
        const key = count.join('#');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(w);
    }
    return [...groups.values()];
};`,
        },
      },
    ],
  },

  'longest-consecutive-sequence': {
    pattern: 'Hash set, extending runs only from their first value',
    approaches: [
      {
        level: 'Brute force', name: 'From every value, count upwards with a linear search',
        idea: 'From each value `x`, look for `x + 1`, `x + 2`, … by scanning the array each time, and count how far the run goes.',
        steps: [
          'For each value `x`, set `len = 1`.',
          'While the array contains `x + len` (found by scanning the whole array), increase `len`.',
          'Keep the largest `len`; return it (0 for an empty array).',
        ],
        time: 'O(n³)', space: 'O(1)',
        why: 'n starting values, each run up to n long, and each step a linear scan of n values.',
        code: {
          java: r`class Solution {
    public int longestConsecutive(int[] nums) {
        int best = 0;
        for (int x : nums) {
            int len = 1;
            while (contains(nums, (long) x + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }

    private boolean contains(int[] nums, long v) {
        for (int y : nums) if (y == v) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        int best = 0;
        for (int x : nums) {
            int len = 1;
            while (find(nums.begin(), nums.end(), (long long) x + len) != nums.end()) len++;
            best = max(best, len);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        best = 0
        for x in nums:
            length = 1
            while x + length in nums:
                length += 1
            best = max(best, length)
        return best`,
          javascript: r`var longestConsecutive = function(nums) {
    let best = 0;
    for (const x of nums) {
        let len = 1;
        while (nums.includes(x + len)) len++;
        best = Math.max(best, len);
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Sort, then count runs',
        idea: 'After sorting, consecutive values sit next to each other. Walk the sorted array counting the current run, ignoring duplicates.',
        steps: [
          'If the array is empty, return 0. Sort it.',
          'Walk from index 1: if the value equals the previous one, skip it (a duplicate); if it is previous + 1, extend the run; otherwise start a new run of length 1.',
          'Keep the longest run and return it.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'The sort dominates; the scan is O(n). The problem asks for O(n), which this misses.',
        code: {
          java: r`class Solution {
    public int longestConsecutive(int[] nums) {
        if (nums.length == 0) return 0;
        Arrays.sort(nums);
        int best = 1, run = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == nums[i - 1]) continue;
            run = nums[i] == nums[i - 1] + 1 ? run + 1 : 1;
            best = Math.max(best, run);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        if (nums.empty()) return 0;
        sort(nums.begin(), nums.end());
        int best = 1, run = 1;
        for (size_t i = 1; i < nums.size(); i++) {
            if (nums[i] == nums[i - 1]) continue;
            run = (long long) nums[i] == (long long) nums[i - 1] + 1 ? run + 1 : 1;
            best = max(best, run);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        if not nums:
            return 0
        nums.sort()
        best = run = 1
        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1]:
                continue
            run = run + 1 if nums[i] == nums[i - 1] + 1 else 1
            best = max(best, run)
        return best`,
          javascript: r`var longestConsecutive = function(nums) {
    if (nums.length === 0) return 0;
    nums.sort((a, b) => a - b);
    let best = 1, run = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) continue;
        run = nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
        best = Math.max(best, run);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Hash set; only start counting at the beginning of a run',
        idea: 'Put every value in a set. A value `x` starts a run only if `x − 1` is not in the set; only from those starts count `x + 1, x + 2, …` with O(1) lookups.',
        steps: [
          'Add every value to a set.',
          'For each value `x` in the set: if `x − 1` is in the set, skip it (it is not a run start).',
          'Otherwise count upwards while `x + len` is in the set.',
          'Keep the longest run and return it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each value is the inside of a counted run at most once, because counting starts only at run starts — so all the counting loops together take O(n). The set holds up to n values.',
        code: {
          java: r`class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;
            int len = 1;
            while (set.contains(x + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<long long> set(nums.begin(), nums.end());
        int best = 0;
        for (long long x : set) {
            if (set.count(x - 1)) continue;
            int len = 1;
            while (set.count(x + len)) len++;
            best = max(best, len);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        values = set(nums)
        best = 0
        for x in values:
            if x - 1 in values:
                continue
            length = 1
            while x + length in values:
                length += 1
            best = max(best, length)
        return best`,
          javascript: r`var longestConsecutive = function(nums) {
    const set = new Set(nums);
    let best = 0;
    for (const x of set) {
        if (set.has(x - 1)) continue;
        let len = 1;
        while (set.has(x + len)) len++;
        best = Math.max(best, len);
    }
    return best;
};`,
        },
      },
    ],
  },

  'valid-sudoku': {
    pattern: 'Hash sets per row, column and box (seen-before checks)',
    approaches: [
      {
        level: 'Brute force', name: 'Check rows, then columns, then boxes',
        idea: 'Check each of the 27 units (9 rows, 9 columns, 9 boxes) on its own with a fresh "seen" table; a digit seen twice in a unit makes the board invalid.',
        steps: [
          'For each row, scan its 9 cells with a fresh set; a repeated digit means invalid.',
          'Do the same for each column.',
          'Do the same for each 3 × 3 box, whose cells are `(3·(b / 3) + k / 3, 3·(b % 3) + k % 3)` for `k = 0..8`.',
          'If no unit repeats a digit, return true.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'For an n × n board each cell is read three times (once per unit type). With n = 9 this is a fixed 243 reads, so constant in practice; each set holds at most n digits.',
        code: {
          java: r`class Solution {
    public boolean isValidSudoku(char[][] board) {
        for (int u = 0; u < 9; u++) {
            boolean[] row = new boolean[10], col = new boolean[10], box = new boolean[10];
            for (int k = 0; k < 9; k++) {
                if (repeat(row, board[u][k])) return false;
                if (repeat(col, board[k][u])) return false;
                if (repeat(box, board[3 * (u / 3) + k / 3][3 * (u % 3) + k % 3])) return false;
            }
        }
        return true;
    }

    private boolean repeat(boolean[] seen, char c) {
        if (c == '.') return false;
        if (seen[c - '0']) return true;
        seen[c - '0'] = true;
        return false;
    }
}`,
          cpp: r`class Solution {
    bool repeat(vector<bool>& seen, char c) {
        if (c == '.') return false;
        if (seen[c - '0']) return true;
        seen[c - '0'] = true;
        return false;
    }
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        for (int u = 0; u < 9; u++) {
            vector<bool> row(10, false), col(10, false), box(10, false);
            for (int k = 0; k < 9; k++) {
                if (repeat(row, board[u][k])) return false;
                if (repeat(col, board[k][u])) return false;
                if (repeat(box, board[3 * (u / 3) + k / 3][3 * (u % 3) + k % 3])) return false;
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        def ok(cells):
            digits = [c for c in cells if c != "."]
            return len(digits) == len(set(digits))
        for u in range(9):
            if not ok(board[u]):
                return False
            if not ok(board[k][u] for k in range(9)):
                return False
            if not ok(board[3 * (u // 3) + k // 3][3 * (u % 3) + k % 3] for k in range(9)):
                return False
        return True`,
          javascript: r`var isValidSudoku = function(board) {
    const ok = (cells) => {
        const digits = cells.filter((c) => c !== '.');
        return digits.length === new Set(digits).size;
    };
    for (let u = 0; u < 9; u++) {
        const row = [], col = [], box = [];
        for (let k = 0; k < 9; k++) {
            row.push(board[u][k]);
            col.push(board[k][u]);
            box.push(board[3 * Math.floor(u / 3) + Math.floor(k / 3)][3 * (u % 3) + k % 3]);
        }
        if (!ok(row) || !ok(col) || !ok(box)) return false;
    }
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass with a seen table for every unit',
        idea: 'Visit each cell once and check its digit against three tables at the same time: its row, its column and its box (box index `(r / 3)·3 + c / 3`).',
        steps: [
          'Keep `rows[9][10]`, `cols[9][10]` and `boxes[9][10]` flags (or bitmasks).',
          'For each filled cell `(r, c)` with digit `d`, compute `b = (r / 3)·3 + c / 3`.',
          'If `d` is already marked in `rows[r]`, `cols[c]` or `boxes[b]`, return false; otherwise mark it in all three.',
          'Return true after all cells.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'Each of the n² cells is read once with O(1) checks. The three tables have n × n flags; for n = 9 both are constant.',
        code: {
          java: r`class Solution {
    public boolean isValidSudoku(char[][] board) {
        int[] rows = new int[9], cols = new int[9], boxes = new int[9];
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int bit = 1 << (board[r][c] - '0'), b = (r / 3) * 3 + c / 3;
                if ((rows[r] & bit) != 0 || (cols[c] & bit) != 0 || (boxes[b] & bit) != 0) return false;
                rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
            }
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        int rows[9] = {0}, cols[9] = {0}, boxes[9] = {0};
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int bit = 1 << (board[r][c] - '0'), b = (r / 3) * 3 + c / 3;
                if ((rows[r] & bit) || (cols[c] & bit) || (boxes[b] & bit)) return false;
                rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                d = board[r][c]
                if d == ".":
                    continue
                b = (r // 3) * 3 + c // 3
                if d in rows[r] or d in cols[c] or d in boxes[b]:
                    return False
                rows[r].add(d)
                cols[c].add(d)
                boxes[b].add(d)
        return True`,
          javascript: r`var isValidSudoku = function(board) {
    const rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === '.') continue;
            const bit = 1 << Number(board[r][c]), b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
            if ((rows[r] & bit) || (cols[c] & bit) || (boxes[b] & bit)) return false;
            rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
        }
    }
    return true;
};`,
        },
      },
    ],
  },

  'first-missing-positive': {
    pattern: 'Index as a hash key (cyclic placement: value v belongs at index v − 1)',
    approaches: [
      {
        level: 'Brute force', name: 'Try 1, 2, 3, … and scan for each',
        idea: 'The answer is the first positive integer not in the array. Test 1, then 2, and so on, scanning the whole array for each.',
        steps: [
          'For `k = 1, 2, 3, …`:',
          'Scan the array for `k`; if it is not there, return `k`.',
          'This stops by `k = n + 1` at the latest, because n values cannot cover n + 1 numbers.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Up to n + 1 candidates, each needing a full O(n) scan.',
        code: {
          java: r`class Solution {
    public int firstMissingPositive(int[] nums) {
        for (int k = 1; ; k++) {
            boolean found = false;
            for (int x : nums) if (x == k) { found = true; break; }
            if (!found) return k;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        for (int k = 1; ; k++)
            if (find(nums.begin(), nums.end(), k) == nums.end()) return k;
    }
};`,
          python: r`class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        k = 1
        while k in nums:
            k += 1
        return k`,
          javascript: r`var firstMissingPositive = function(nums) {
    let k = 1;
    while (nums.includes(k)) k++;
    return k;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash set of the values',
        idea: 'Put every value in a set; then check 1, 2, 3, … with O(1) lookups.',
        steps: [
          'Add all values to a set.',
          'For `k` from 1 to n + 1, return the first `k` not in the set.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Building the set and checking up to n + 1 candidates are both O(n), but the set breaks the O(1) extra space requirement.',
        code: {
          java: r`class Solution {
    public int firstMissingPositive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int k = 1;
        while (set.contains(k)) k++;
        return k;
    }
}`,
          cpp: r`class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        unordered_set<int> set(nums.begin(), nums.end());
        int k = 1;
        while (set.count(k)) k++;
        return k;
    }
};`,
          python: r`class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        values = set(nums)
        k = 1
        while k in values:
            k += 1
        return k`,
          javascript: r`var firstMissingPositive = function(nums) {
    const set = new Set(nums);
    let k = 1;
    while (set.has(k)) k++;
    return k;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cyclic placement: put each value v at index v − 1',
        idea: 'Only the values 1..n can matter (the answer is at most n + 1). Use the array itself as the set: swap each such value into its home slot `v − 1`. Afterwards the first slot `i` that does not hold `i + 1` gives the answer.',
        steps: [
          'For each index `i`: while `1 <= nums[i] <= n` and `nums[nums[i] − 1] != nums[i]`, swap `nums[i]` into its home slot `nums[i] − 1`.',
          'Scan `i` from 0: the first `i` with `nums[i] != i + 1` means `i + 1` is missing — return it.',
          'If every slot is correct, return `n + 1`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Every swap puts one value into its home slot for good, so there are at most n swaps in total across all the while loops. The check `nums[nums[i] − 1] != nums[i]` stops endless swapping on duplicates. Only the input array is used.',
        code: {
          java: r`class Solution {
    public int firstMissingPositive(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                int home = nums[i] - 1, t = nums[home];
                nums[home] = nums[i];
                nums[i] = t;
            }
        }
        for (int i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;
        return n + 1;
    }
}`,
          cpp: r`class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++)
            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i])
                swap(nums[i], nums[nums[i] - 1]);
        for (int i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;
        return n + 1;
    }
};`,
          python: r`class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                home = nums[i] - 1
                nums[i], nums[home] = nums[home], nums[i]
        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1`,
          javascript: r`var firstMissingPositive = function(nums) {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
            const home = nums[i] - 1;
            [nums[i], nums[home]] = [nums[home], nums[i]];
        }
    }
    for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
    return n + 1;
};`,
        },
      },
    ],
  },
  'concatenation-of-array': {
    pattern: 'Direct array construction (index arithmetic)',
    approaches: [
      {
        level: 'Brute force', name: 'Append to a growing list twice',
        idea: 'Walk `nums` twice and append every value to a dynamic list, then convert it to an array.',
        steps: [
          'Create an empty list.',
          'Append each value of `nums`, then do the same again.',
          'Convert the list to the answer array.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Already linear. The boxing and the final copy in Java make it slower in practice than filling a fixed-size array.',
        code: {
          java: r`class Solution {
    public int[] getConcatenation(int[] nums) {
        List<Integer> list = new ArrayList<>();
        for (int round = 0; round < 2; round++) for (int x : nums) list.add(x);
        int[] ans = new int[list.size()];
        for (int i = 0; i < ans.length; i++) ans[i] = list.get(i);
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> getConcatenation(vector<int>& nums) {
        vector<int> ans;
        for (int round = 0; round < 2; round++) for (int x : nums) ans.push_back(x);
        return ans;
    }
};`,
          python: r`class Solution:
    def getConcatenation(self, nums: List[int]) -> List[int]:
        ans = []
        for _ in range(2):
            for x in nums:
                ans.append(x)
        return ans`,
          javascript: r`var getConcatenation = function(nums) {
    const ans = [];
    for (let round = 0; round < 2; round++) for (const x of nums) ans.push(x);
    return ans;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fill both halves in one pass',
        idea: 'Allocate `2n` slots and write `nums[i]` to positions `i` and `i + n`.',
        steps: [
          'Create `ans` of length `2n`.',
          'For each `i`, set `ans[i] = ans[i + n] = nums[i]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'n iterations, two writes each. The output itself is 2n values, so O(n) space is required.',
        code: {
          java: r`class Solution {
    public int[] getConcatenation(int[] nums) {
        int n = nums.length;
        int[] ans = new int[2 * n];
        for (int i = 0; i < n; i++) ans[i] = ans[i + n] = nums[i];
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> getConcatenation(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(2 * n);
        for (int i = 0; i < n; i++) ans[i] = ans[i + n] = nums[i];
        return ans;
    }
};`,
          python: r`class Solution:
    def getConcatenation(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = [0] * (2 * n)
        for i in range(n):
            ans[i] = ans[i + n] = nums[i]
        return ans`,
          javascript: r`var getConcatenation = function(nums) {
    const n = nums.length, ans = new Array(2 * n);
    for (let i = 0; i < n; i++) ans[i] = ans[i + n] = nums[i];
    return ans;
};`,
        },
      },
    ],
  },
  'majority-element': {
    pattern: 'Boyer–Moore voting (cancel out different values)',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value',
        idea: 'For each position, count how often its value appears in the whole array and return the first one above n / 2.',
        steps: [
          'For each `i`, count the `j` with `nums[j] == nums[i]`.',
          'If the count exceeds `n / 2`, return `nums[i]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n candidates times n comparisons: 2.5 × 10⁹ steps for n = 5 × 10⁴, which times out when the majority value only starts halfway through the array.',
        code: {
          java: r`class Solution {
    public int majorityElement(int[] nums) {
        int n = nums.length;
        for (int x : nums) {
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count > n / 2) return x;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int n = nums.size();
        for (int x : nums) {
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count > n / 2) return x;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        n = len(nums)
        for x in nums:
            if sum(1 for y in nums if y == x) > n // 2:
                return x
        return -1`,
          javascript: r`var majorityElement = function(nums) {
    const n = nums.length;
    for (const x of nums) {
        let count = 0;
        for (const y of nums) if (y === x) count++;
        if (count > Math.floor(n / 2)) return x;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash map of counts',
        idea: 'Count every value in a hash map and return the one whose count passes n / 2.',
        steps: [
          'For each `x`, increment `count[x]`.',
          'As soon as a count exceeds `n / 2`, return that value.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass with O(1) average map operations. The map can hold up to n / 2 distinct values. Sorting and returning `nums[n / 2]` is another O(n log n), O(1) option.',
        code: {
          java: r`class Solution {
    public int majorityElement(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) if (count.merge(x, 1, Integer::sum) > nums.length / 2) return x;
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int majorityElement(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int x : nums) if (++count[x] > (int) nums.size() / 2) return x;
        return -1;
    }
};`,
          python: r`class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = Counter()
        for x in nums:
            count[x] += 1
            if count[x] > len(nums) // 2:
                return x
        return -1`,
          javascript: r`var majorityElement = function(nums) {
    const count = new Map();
    for (const x of nums) {
        const c = (count.get(x) || 0) + 1;
        count.set(x, c);
        if (c > Math.floor(nums.length / 2)) return x;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Boyer–Moore voting',
        idea: 'Keep one candidate and a counter. Each different value cancels one vote; because the majority has more copies than everything else combined, it is the candidate left standing.',
        steps: [
          'Set `count = 0`.',
          'For each `x`: if `count == 0`, make `x` the candidate. Then add 1 if `x` equals the candidate, otherwise subtract 1.',
          'Return the candidate.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each decrement pairs one candidate copy with one different value and throws both away. The majority cannot be fully cancelled, since it has more than half the elements. The result is only guaranteed because the problem promises a majority exists; otherwise a second counting pass would be needed.',
        code: {
          java: r`class Solution {
    public int majorityElement(int[] nums) {
        int cand = 0, count = 0;
        for (int x : nums) {
            if (count == 0) cand = x;
            count += x == cand ? 1 : -1;
        }
        return cand;
    }
}`,
          cpp: r`class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int cand = 0, count = 0;
        for (int x : nums) {
            if (count == 0) cand = x;
            count += x == cand ? 1 : -1;
        }
        return cand;
    }
};`,
          python: r`class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        cand, count = 0, 0
        for x in nums:
            if count == 0:
                cand = x
            count += 1 if x == cand else -1
        return cand`,
          javascript: r`var majorityElement = function(nums) {
    let cand = 0, count = 0;
    for (const x of nums) {
        if (count === 0) cand = x;
        count += x === cand ? 1 : -1;
    }
    return cand;
};`,
        },
      },
    ],
  },
  'encode-and-decode-strings': {
    pattern: 'Length-prefix framing (no delimiter can clash)',
    approaches: [
      {
        level: 'Better', name: 'Escape the delimiter',
        idea: 'Join the strings with a separator, after escaping every separator and escape character inside them, so the decoder can tell a real separator from a literal one.',
        steps: [
          'For each string, replace `\\` with `\\\\` and `,` with `\\,`, then append `,` after it.',
          'To decode, scan characters: after a `\\`, take the next character literally; an unescaped `,` ends the current string.',
        ],
        time: 'O(L)', space: 'O(L)',
        why: 'L is the total length of all strings. It works for any content, but the escaping logic is easy to get subtly wrong, and every escaped character makes the output longer. Ending each string with a separator (instead of joining) keeps `[]` and `[""]` distinct.',
        code: {
          java: r`class Codec {
    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        for (String s : strs) {
            for (char c : s.toCharArray()) {
                if (c == '\\' || c == ',') sb.append('\\');
                sb.append(c);
            }
            sb.append(',');
        }
        return sb.toString();
    }
    public List<String> decode(String s) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '\\') cur.append(s.charAt(++i));
            else if (c == ',') { out.add(cur.toString()); cur.setLength(0); }
            else cur.append(c);
        }
        return out;
    }
}`,
          cpp: r`class Codec {
public:
    string encode(vector<string>& strs) {
        string out;
        for (const string& s : strs) {
            for (char c : s) {
                if (c == '\\' || c == ',') out += '\\';
                out += c;
            }
            out += ',';
        }
        return out;
    }
    vector<string> decode(string s) {
        vector<string> out;
        string cur;
        for (size_t i = 0; i < s.size(); i++) {
            char c = s[i];
            if (c == '\\') cur += s[++i];
            else if (c == ',') { out.push_back(cur); cur.clear(); }
            else cur += c;
        }
        return out;
    }
};`,
          python: r`class Codec:
    def encode(self, strs: List[str]) -> str:
        out = []
        for s in strs:
            out.append(s.replace('\\', '\\\\').replace(',', '\\,'))
            out.append(',')
        return ''.join(out)

    def decode(self, s: str) -> List[str]:
        out, cur, i = [], [], 0
        while i < len(s):
            c = s[i]
            if c == '\\':
                i += 1
                cur.append(s[i])
            elif c == ',':
                out.append(''.join(cur))
                cur = []
            else:
                cur.append(c)
            i += 1
        return out`,
          javascript: r`var encode = function(strs) {
    let out = "";
    for (const s of strs) out += s.replace(/[\\,]/g, (c) => "\\" + c) + ",";
    return out;
};

var decode = function(s) {
    const out = [];
    let cur = "";
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === "\\") cur += s[++i];
        else if (c === ",") { out.push(cur); cur = ""; }
        else cur += c;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Length, separator, string',
        idea: 'Write each string as its length, a `#`, and the string itself. The decoder reads the number, skips the `#`, and takes exactly that many characters, so the string\'s own characters never confuse it.',
        steps: [
          'Encode: for each string, append `len + "#" + s`.',
          'Decode: from position `i`, find the next `#` at `j`; the digits between are the length `len`.',
          'Take `s[j + 1 .. j + len]` as the next string and continue from `j + 1 + len`.',
        ],
        time: 'O(L)', space: 'O(L)',
        why: 'Each character is copied once in each direction, plus a few digits of overhead per string. The `#` found after `i` is always the length\'s own separator, because the decoder only ever looks for it at the start of a frame, never inside string content. This is how real protocols frame messages (HTTP Content-Length, length-prefixed binary formats).',
        code: {
          java: r`class Codec {
    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        for (String s : strs) sb.append(s.length()).append('#').append(s);
        return sb.toString();
    }
    public List<String> decode(String s) {
        List<String> out = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            int j = s.indexOf('#', i);
            int len = Integer.parseInt(s.substring(i, j));
            out.add(s.substring(j + 1, j + 1 + len));
            i = j + 1 + len;
        }
        return out;
    }
}`,
          cpp: r`class Codec {
public:
    string encode(vector<string>& strs) {
        string out;
        for (const string& s : strs) out += to_string(s.size()) + "#" + s;
        return out;
    }
    vector<string> decode(string s) {
        vector<string> out;
        size_t i = 0;
        while (i < s.size()) {
            size_t j = s.find('#', i);
            int len = stoi(s.substr(i, j - i));
            out.push_back(s.substr(j + 1, len));
            i = j + 1 + len;
        }
        return out;
    }
};`,
          python: r`class Codec:
    def encode(self, strs: List[str]) -> str:
        return ''.join(f'{len(s)}#{s}' for s in strs)

    def decode(self, s: str) -> List[str]:
        out, i = [], 0
        while i < len(s):
            j = s.index('#', i)
            n = int(s[i:j])
            out.append(s[j + 1:j + 1 + n])
            i = j + 1 + n
        return out`,
          javascript: r`var encode = function(strs) {
    return strs.map((s) => s.length + "#" + s).join("");
};

var decode = function(s) {
    const out = [];
    let i = 0;
    while (i < s.length) {
        const j = s.indexOf("#", i);
        const len = Number(s.slice(i, j));
        out.push(s.slice(j + 1, j + 1 + len));
        i = j + 1 + len;
    }
    return out;
};`,
        },
      },
    ],
  },
  'majority-element-ii': {
    pattern: 'Boyer–Moore voting with two candidates',
    approaches: [
      {
        level: 'Brute force', name: 'Count each distinct value',
        idea: 'For every value, count its occurrences across the whole array and keep those above n / 3, without repeats.',
        steps: [
          'For each `x` not already in the answer, count how often it appears.',
          'If the count exceeds `n / 3`, add it to the answer.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Quadratic counting, so it times out on the large test. The answer list holds at most two values, so it does not count as extra space.',
        code: {
          java: r`class Solution {
    public List<Integer> majorityElement(int[] nums) {
        List<Integer> out = new ArrayList<>();
        for (int x : nums) {
            if (out.contains(x)) continue;
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count > nums.length / 3) out.add(x);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> majorityElement(vector<int>& nums) {
        vector<int> out;
        for (int x : nums) {
            if (find(out.begin(), out.end(), x) != out.end()) continue;
            int count = 0;
            for (int y : nums) if (y == x) count++;
            if (count > (int) nums.size() / 3) out.push_back(x);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def majorityElement(self, nums: List[int]) -> List[int]:
        out = []
        for x in nums:
            if x not in out and nums.count(x) > len(nums) // 3:
                out.append(x)
        return out`,
          javascript: r`var majorityElement = function(nums) {
    const out = [];
    for (const x of nums) {
        if (out.includes(x)) continue;
        let count = 0;
        for (const y of nums) if (y === x) count++;
        if (count > Math.floor(nums.length / 3)) out.push(x);
    }
    return out;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash map of counts',
        idea: 'Count every value, then return the keys whose count is above n / 3.',
        steps: [
          'Build `count[x]` for every value.',
          'Collect each key with `count > n / 3`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear time, but the map can hold up to n distinct values. The follow-up asks for O(1) space.',
        code: {
          java: r`class Solution {
    public List<Integer> majorityElement(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        List<Integer> out = new ArrayList<>();
        for (Map.Entry<Integer, Integer> e : count.entrySet()) if (e.getValue() > nums.length / 3) out.add(e.getKey());
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> majorityElement(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<int> out;
        for (auto& [v, c] : count) if (c > (int) nums.size() / 3) out.push_back(v);
        return out;
    }
};`,
          python: r`class Solution:
    def majorityElement(self, nums: List[int]) -> List[int]:
        return [x for x, c in Counter(nums).items() if c > len(nums) // 3]`,
          javascript: r`var majorityElement = function(nums) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
    const out = [];
    for (const [v, c] of count) if (c > Math.floor(nums.length / 3)) out.push(v);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two-candidate voting + verification',
        idea: 'At most two values can pass n / 3. Keep two candidates with counters; a value matching neither cancels one vote from each. Then count the two survivors to confirm them.',
        steps: [
          'For each `x`: if it equals candidate 1 or 2, bump that counter; else if a counter is 0, make `x` that candidate with count 1; else decrement both counters.',
          'Reset both counters and count how often each candidate really appears.',
          'Return the candidates whose real count exceeds `n / 3`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each "decrement both" throws away three different values at once, so a value with more than n / 3 copies can never be cancelled completely. The second pass matters: survivors are only candidates (in `[1,2,3]` some value survives but none qualifies). Starting the candidates at different values avoids both counters tracking the same number.',
        code: {
          java: r`class Solution {
    public List<Integer> majorityElement(int[] nums) {
        int c1 = 0, c2 = 1, n1 = 0, n2 = 0;
        for (int x : nums) {
            if (x == c1) n1++;
            else if (x == c2) n2++;
            else if (n1 == 0) { c1 = x; n1 = 1; }
            else if (n2 == 0) { c2 = x; n2 = 1; }
            else { n1--; n2--; }
        }
        n1 = 0; n2 = 0;
        for (int x : nums) { if (x == c1) n1++; else if (x == c2) n2++; }
        List<Integer> out = new ArrayList<>();
        if (n1 > nums.length / 3) out.add(c1);
        if (n2 > nums.length / 3) out.add(c2);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> majorityElement(vector<int>& nums) {
        int c1 = 0, c2 = 1, n1 = 0, n2 = 0;
        for (int x : nums) {
            if (x == c1) n1++;
            else if (x == c2) n2++;
            else if (n1 == 0) { c1 = x; n1 = 1; }
            else if (n2 == 0) { c2 = x; n2 = 1; }
            else { n1--; n2--; }
        }
        n1 = n2 = 0;
        for (int x : nums) { if (x == c1) n1++; else if (x == c2) n2++; }
        vector<int> out;
        int n = nums.size();
        if (n1 > n / 3) out.push_back(c1);
        if (n2 > n / 3) out.push_back(c2);
        return out;
    }
};`,
          python: r`class Solution:
    def majorityElement(self, nums: List[int]) -> List[int]:
        c1, c2, n1, n2 = 0, 1, 0, 0
        for x in nums:
            if x == c1:
                n1 += 1
            elif x == c2:
                n2 += 1
            elif n1 == 0:
                c1, n1 = x, 1
            elif n2 == 0:
                c2, n2 = x, 1
            else:
                n1 -= 1
                n2 -= 1
        return [c for c in (c1, c2) if nums.count(c) > len(nums) // 3]`,
          javascript: r`var majorityElement = function(nums) {
    let c1 = 0, c2 = 1, n1 = 0, n2 = 0;
    for (const x of nums) {
        if (x === c1) n1++;
        else if (x === c2) n2++;
        else if (n1 === 0) { c1 = x; n1 = 1; }
        else if (n2 === 0) { c2 = x; n2 = 1; }
        else { n1--; n2--; }
    }
    n1 = 0; n2 = 0;
    for (const x of nums) { if (x === c1) n1++; else if (x === c2) n2++; }
    const out = [], limit = Math.floor(nums.length / 3);
    if (n1 > limit) out.push(c1);
    if (n2 > limit) out.push(c2);
    return out;
};`,
        },
      },
    ],
  },
  'verifying-an-alien-dictionary': {
    pattern: 'Rank lookup table + compare neighbours',
    approaches: [
      {
        level: 'Brute force', name: 'Translate to English and compare all pairs',
        idea: 'Map every word to the English letters at the same alphabet positions, then check every pair `i < j` with ordinary string comparison.',
        steps: [
          'Build `rank[c]` = position of `c` in `order`, and translate each word letter by letter into `"a" + rank`.',
          'For every `i < j`, return `false` if translated word `i` is greater than translated word `j`.',
          'Return `true`.',
        ],
        time: 'O(n² · m)', space: 'O(n · m)',
        why: 'n words of length up to m. Comparing all pairs repeats work: sortedness only needs neighbouring pairs. The translation trick is still neat, because ordinary string comparison already handles the prefix rule.',
        code: {
          java: r`class Solution {
    public boolean isAlienSorted(String[] words, String order) {
        int[] rank = new int[26];
        for (int i = 0; i < 26; i++) rank[order.charAt(i) - 'a'] = i;
        String[] t = new String[words.length];
        for (int w = 0; w < words.length; w++) {
            StringBuilder sb = new StringBuilder();
            for (char c : words[w].toCharArray()) sb.append((char) ('a' + rank[c - 'a']));
            t[w] = sb.toString();
        }
        for (int i = 0; i < t.length; i++)
            for (int j = i + 1; j < t.length; j++)
                if (t[i].compareTo(t[j]) > 0) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isAlienSorted(vector<string>& words, string order) {
        int rank[26];
        for (int i = 0; i < 26; i++) rank[order[i] - 'a'] = i;
        vector<string> t;
        for (const string& w : words) {
            string s;
            for (char c : w) s += (char) ('a' + rank[c - 'a']);
            t.push_back(s);
        }
        for (size_t i = 0; i < t.size(); i++)
            for (size_t j = i + 1; j < t.size(); j++)
                if (t[i] > t[j]) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def isAlienSorted(self, words: List[str], order: str) -> bool:
        rank = {c: i for i, c in enumerate(order)}
        t = [''.join(chr(97 + rank[c]) for c in w) for w in words]
        for i in range(len(t)):
            for j in range(i + 1, len(t)):
                if t[i] > t[j]:
                    return False
        return True`,
          javascript: r`var isAlienSorted = function(words, order) {
    const rank = {};
    for (let i = 0; i < 26; i++) rank[order[i]] = i;
    const t = words.map((w) => [...w].map((c) => String.fromCharCode(97 + rank[c])).join(""));
    for (let i = 0; i < t.length; i++)
        for (let j = i + 1; j < t.length; j++)
            if (t[i] > t[j]) return false;
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Compare neighbours with a rank table',
        idea: 'A list is sorted exactly when each word is not after the next one. Compare each neighbouring pair at its first differing letter using an O(1) rank lookup.',
        steps: [
          'Build `rank[c]` from `order`.',
          'For each neighbouring pair `a`, `b`: find the first index `k` where they differ.',
          'If there is none and `a` is longer than `b`, return `false`. If `rank[a[k]] > rank[b[k]]`, return `false`. Otherwise continue; return `true` at the end.',
        ],
        time: 'O(C)', space: 'O(1)',
        why: 'C is the total number of characters: each pair comparison stops at the first difference, so every character is looked at a constant number of times. Ordering is transitive, so neighbours suffice. The rank table has a fixed 26 entries. The prefix case ("apple" before "app") is the usual bug.',
        code: {
          java: r`class Solution {
    public boolean isAlienSorted(String[] words, String order) {
        int[] rank = new int[26];
        for (int i = 0; i < 26; i++) rank[order.charAt(i) - 'a'] = i;
        for (int w = 0; w + 1 < words.length; w++) {
            String a = words[w], b = words[w + 1];
            int k = 0;
            while (k < a.length() && k < b.length() && a.charAt(k) == b.charAt(k)) k++;
            if (k == a.length()) continue;
            if (k == b.length() || rank[a.charAt(k) - 'a'] > rank[b.charAt(k) - 'a']) return false;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isAlienSorted(vector<string>& words, string order) {
        int rank[26];
        for (int i = 0; i < 26; i++) rank[order[i] - 'a'] = i;
        for (size_t w = 0; w + 1 < words.size(); w++) {
            const string& a = words[w];
            const string& b = words[w + 1];
            size_t k = 0;
            while (k < a.size() && k < b.size() && a[k] == b[k]) k++;
            if (k == a.size()) continue;
            if (k == b.size() || rank[a[k] - 'a'] > rank[b[k] - 'a']) return false;
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isAlienSorted(self, words: List[str], order: str) -> bool:
        rank = {c: i for i, c in enumerate(order)}
        for a, b in zip(words, words[1:]):
            k = 0
            while k < len(a) and k < len(b) and a[k] == b[k]:
                k += 1
            if k == len(a):
                continue
            if k == len(b) or rank[a[k]] > rank[b[k]]:
                return False
        return True`,
          javascript: r`var isAlienSorted = function(words, order) {
    const rank = new Array(26);
    for (let i = 0; i < 26; i++) rank[order.charCodeAt(i) - 97] = i;
    for (let w = 0; w + 1 < words.length; w++) {
        const a = words[w], b = words[w + 1];
        let k = 0;
        while (k < a.length && k < b.length && a[k] === b[k]) k++;
        if (k === a.length) continue;
        if (k === b.length || rank[a.charCodeAt(k) - 97] > rank[b.charCodeAt(k) - 97]) return false;
    }
    return true;
};`,
        },
      },
    ],
  },
};
