export default [
  {
    slug: 'two-sum', title: 'Two Sum', level: 'Easy',
    summary: 'Return the indices of the two numbers that add up to target. Exactly one pair exists and you may not use the same element twice. Indices may be in either order.',
    method: 'twoSum', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int[]', check: 'any-order',
    tests: [
      { in: [[2, 7, 11, 15], 9], out: [0, 1] },
      { in: [[3, 2, 4], 6], out: [1, 2] },
      { in: [[3, 3], 6], out: [0, 1] },
      { in: [[-3, 4, 3, 90], 0] },
      { in: [[0, 4, 3, 0], 0] },
      { in: [[1, 5, 9, 13, 2], 15] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'contains-duplicate', title: 'Contains Duplicate', level: 'Easy',
    summary: 'Return true if any value appears at least twice in the array.',
    method: 'containsDuplicate', params: [['int[]', 'nums']], returns: 'boolean',
    tests: [
      { in: [[1, 2, 3, 1]], out: true },
      { in: [[1, 2, 3, 4]], out: false },
      { in: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], out: true },
      { in: [[5]] },
      { in: [[-1, 1]] },
    ],
    ref: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) if (!seen.add(x)) return true;
        return false;
    }
}`,
  },
  {
    slug: 'valid-anagram', title: 'Valid Anagram', level: 'Easy',
    summary: 'Return true if t uses exactly the same letters as s, the same number of times (lowercase English letters).',
    method: 'isAnagram', params: [['String', 's'], ['String', 't']], returns: 'boolean',
    tests: [
      { in: ['anagram', 'nagaram'], out: true },
      { in: ['rat', 'car'], out: false },
      { in: ['a', 'ab'] },
      { in: ['aacc', 'ccac'] },
      { in: ['listen', 'silent'] },
    ],
    ref: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] c = new int[26];
        for (int i = 0; i < s.length(); i++) { c[s.charAt(i) - 'a']++; c[t.charAt(i) - 'a']--; }
        for (int x : c) if (x != 0) return false;
        return true;
    }
}`,
  },
  {
    slug: 'first-unique-character-in-a-string', title: 'First Unique Character in a String', level: 'Easy',
    summary: 'Return the index of the first character that appears exactly once in s, or -1 if there is none.',
    method: 'firstUniqChar', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['leetcode'], out: 0 },
      { in: ['loveleetcode'], out: 2 },
      { in: ['aabb'], out: -1 },
      { in: ['z'] },
      { in: ['abcabd'] },
    ],
    ref: `class Solution {
    public int firstUniqChar(String s) {
        int[] c = new int[26];
        for (char ch : s.toCharArray()) c[ch - 'a']++;
        for (int i = 0; i < s.length(); i++) if (c[s.charAt(i) - 'a'] == 1) return i;
        return -1;
    }
}`,
  },
  {
    slug: 'group-anagrams', title: 'Group Anagrams', level: 'Medium',
    summary: 'Group the words that are anagrams of each other. Groups, and the words inside them, may be in any order.',
    method: 'groupAnagrams', params: [['String[]', 'strs']], returns: 'List<List<String>>', check: 'any-order-deep',
    tests: [
      { in: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], out: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
      { in: [['']], out: [['']] },
      { in: [['a']], out: [['a']] },
      { in: [['ab', 'ba', 'abc', 'cab', 'bca', 'x']] },
      { in: [['', 'b', '']] },
    ],
    ref: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] c = s.toCharArray(); Arrays.sort(c);
            groups.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(groups.values());
    }
}`,
  },
  {
    slug: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', level: 'Medium',
    summary: 'Return the length of the longest run of consecutive integers (like 1, 2, 3, 4) that can be formed from the array\'s values, in O(n).',
    method: 'longestConsecutive', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[100, 4, 200, 1, 3, 2]], out: 4 },
      { in: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], out: 9 },
      { in: [[]], out: 0 },
      { in: [[1, 2, 0, 1]] },
      { in: [[9, -1, 8, -2, 7, 0]] },
    ],
    ref: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;
            int y = x;
            while (set.contains(y + 1)) y++;
            best = Math.max(best, y - x + 1);
        }
        return best;
    }
}`,
  },
  {
    slug: 'valid-sudoku', title: 'Valid Sudoku', level: 'Medium',
    summary: 'Check whether the filled cells of a 9×9 board break any rule: no repeated digit in a row, a column or a 3×3 box. Empty cells are ".". The board need not be solvable.',
    method: 'isValidSudoku', params: [['char[][]', 'board']], returns: 'boolean',
    tests: [
      { in: [[['5', '3', '.', '.', '7', '.', '.', '.', '.'], ['6', '.', '.', '1', '9', '5', '.', '.', '.'], ['.', '9', '8', '.', '.', '.', '.', '6', '.'], ['8', '.', '.', '.', '6', '.', '.', '.', '3'], ['4', '.', '.', '8', '.', '3', '.', '.', '1'], ['7', '.', '.', '.', '2', '.', '.', '.', '6'], ['.', '6', '.', '.', '.', '.', '2', '8', '.'], ['.', '.', '.', '4', '1', '9', '.', '.', '5'], ['.', '.', '.', '.', '8', '.', '.', '7', '9']]], out: true },
      { in: [[['8', '3', '.', '.', '7', '.', '.', '.', '.'], ['6', '.', '.', '1', '9', '5', '.', '.', '.'], ['.', '9', '8', '.', '.', '.', '.', '6', '.'], ['8', '.', '.', '.', '6', '.', '.', '.', '3'], ['4', '.', '.', '8', '.', '3', '.', '.', '1'], ['7', '.', '.', '.', '2', '.', '.', '.', '6'], ['.', '6', '.', '.', '.', '.', '2', '8', '.'], ['.', '.', '.', '4', '1', '9', '.', '.', '5'], ['.', '.', '.', '.', '8', '.', '.', '7', '9']]], out: false },
      { in: [[['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.']]] },
      { in: [[['.', '.', '.', '.', '5', '.', '.', '1', '.'], ['.', '4', '.', '3', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '3', '.', '.', '1'], ['8', '.', '.', '.', '.', '.', '.', '2', '.'], ['.', '.', '2', '.', '7', '.', '.', '.', '.'], ['.', '1', '5', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '2', '.', '.', '.'], ['.', '2', '.', '9', '.', '.', '.', '.', '.'], ['.', '.', '4', '.', '.', '.', '.', '.', '.']]] },
      { in: [[['1', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '1', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '.']]] },
    ],
    ref: `class Solution {
    public boolean isValidSudoku(char[][] board) {
        Set<String> seen = new HashSet<>();
        for (int r = 0; r < 9; r++) for (int c = 0; c < 9; c++) {
            char d = board[r][c];
            if (d == '.') continue;
            if (!seen.add(d + "r" + r) || !seen.add(d + "c" + c) || !seen.add(d + "b" + r / 3 + c / 3)) return false;
        }
        return true;
    }
}`,
  },
  {
    slug: 'first-missing-positive', title: 'First Missing Positive', level: 'Hard',
    summary: 'Return the smallest positive integer that does not appear in the array, in O(n) time and O(1) extra space.',
    method: 'firstMissingPositive', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, 2, 0]], out: 3 },
      { in: [[3, 4, -1, 1]], out: 2 },
      { in: [[7, 8, 9, 11, 12]], out: 1 },
      { in: [[1]] },
      { in: [[2, 2, 1, 1]] },
      { in: [[-5, 1, 3, 2, 5, 4]] },
    ],
    ref: `class Solution {
    public int firstMissingPositive(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++)
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                int t = nums[nums[i] - 1]; nums[nums[i] - 1] = nums[i]; nums[i] = t;
            }
        for (int i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;
        return n + 1;
    }
}`,
  },
];
