export default [
  {
    slug: 'maximum-average-subarray-i', title: 'Maximum Average Subarray I', level: 'Easy',
    summary: 'Find the contiguous subarray of length k with the largest average and return that average.',
    method: 'findMaxAverage', params: [['int[]', 'nums'], ['int', 'k']], returns: 'double',
    tests: [
      { in: [[1, 12, -5, -6, 50, 3], 4], out: 12.75 },
      { in: [[5], 1], out: 5.0 },
      { in: [[-1, -2, -3], 2] },
      { in: [[0, 4, 0, 3, 2], 1] },
      { in: [[3, 3, 4, 3, 0], 3] },
    ],
    ref: `class Solution {
    public double findMaxAverage(int[] nums, int k) {
        long sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        long best = sum;
        for (int i = k; i < nums.length; i++) { sum += nums[i] - nums[i - k]; best = Math.max(best, sum); }
        return (double) best / k;
    }
}`,
  },
  {
    slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', level: 'Medium',
    summary: 'Return the length of the longest substring of s in which no character repeats.',
    method: 'lengthOfLongestSubstring', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['abcabcbb'], out: 3 },
      { in: ['bbbbb'], out: 1 },
      { in: ['pwwkew'], out: 3 },
      { in: [''], out: 0 },
      { in: [' '] },
      { in: ['dvdf'] },
      { in: ['abba'] },
    ],
    ref: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int best = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            Integer prev = last.put(s.charAt(right), right);
            if (prev != null && prev >= left) left = prev + 1;
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
  },
  {
    slug: 'minimum-size-subarray-sum', title: 'Minimum Size Subarray Sum', level: 'Medium',
    summary: 'All values are positive. Return the length of the shortest contiguous subarray whose sum is at least target, or 0 if none exists.',
    method: 'minSubArrayLen', params: [['int', 'target'], ['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [7, [2, 3, 1, 2, 4, 3]], out: 2 },
      { in: [4, [1, 4, 4]], out: 1 },
      { in: [11, [1, 1, 1, 1, 1, 1, 1, 1]], out: 0 },
      { in: [15, [1, 2, 3, 4, 5]] },
      { in: [3, [1, 1]] },
    ],
    ref: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0, sum = 0, best = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) { best = Math.min(best, right - left + 1); sum -= nums[left++]; }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
  },
  {
    slug: 'max-consecutive-ones-iii', title: 'Max Consecutive Ones III', level: 'Medium',
    summary: 'In a binary array you may flip at most k zeros to ones. Return the longest run of consecutive ones you can get.',
    method: 'longestOnes', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], out: 6 },
      { in: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], out: 10 },
      { in: [[0, 0, 0], 0] },
      { in: [[0, 0, 0], 5] },
      { in: [[1, 0, 1], 1] },
    ],
    ref: `class Solution {
    public int longestOnes(int[] nums, int k) {
        int left = 0, zeros = 0, best = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > k) if (nums[left++] == 0) zeros--;
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
  },
  {
    slug: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', level: 'Medium',
    summary: 'You may change at most k characters of s (uppercase letters). Return the length of the longest substring that can be made of one repeated letter.',
    method: 'characterReplacement', params: [['String', 's'], ['int', 'k']], returns: 'int',
    tests: [
      { in: ['ABAB', 2], out: 4 },
      { in: ['AABABBA', 1], out: 4 },
      { in: ['A', 0] },
      { in: ['ABCDE', 1] },
      { in: ['AAAB', 0] },
    ],
    ref: `class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxCount = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            maxCount = Math.max(maxCount, ++count[s.charAt(right) - 'A']);
            while (right - left + 1 - maxCount > k) count[s.charAt(left++) - 'A']--;
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
  },
  {
    slug: 'permutation-in-string', title: 'Permutation in String', level: 'Medium',
    summary: 'Return true if some rearrangement of s1 appears as a contiguous substring of s2 (lowercase letters).',
    method: 'checkInclusion', params: [['String', 's1'], ['String', 's2']], returns: 'boolean',
    tests: [
      { in: ['ab', 'eidbaooo'], out: true },
      { in: ['ab', 'eidboaoo'], out: false },
      { in: ['abc', 'ab'] },
      { in: ['adc', 'dcda'] },
      { in: ['a', 'a'] },
    ],
    ref: `class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] need = new int[26], have = new int[26];
        for (char c : s1.toCharArray()) need[c - 'a']++;
        for (int i = 0; i < s2.length(); i++) {
            have[s2.charAt(i) - 'a']++;
            if (i >= s1.length()) have[s2.charAt(i - s1.length()) - 'a']--;
            if (Arrays.equals(need, have)) return true;
        }
        return false;
    }
}`,
  },
  {
    slug: 'find-all-anagrams-in-a-string', title: 'Find All Anagrams in a String', level: 'Medium',
    summary: 'Return every start index in s where a rearrangement of p begins, in increasing order.',
    method: 'findAnagrams', params: [['String', 's'], ['String', 'p']], returns: 'List<Integer>',
    tests: [
      { in: ['cbaebabacd', 'abc'], out: [0, 6] },
      { in: ['abab', 'ab'], out: [0, 1, 2] },
      { in: ['a', 'ab'] },
      { in: ['aaaa', 'aa'] },
      { in: ['xyz', 'q'] },
    ],
    ref: `class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> out = new ArrayList<>();
        if (p.length() > s.length()) return out;
        int[] need = new int[26], have = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;
        for (int i = 0; i < s.length(); i++) {
            have[s.charAt(i) - 'a']++;
            if (i >= p.length()) have[s.charAt(i - p.length()) - 'a']--;
            if (i >= p.length() - 1 && Arrays.equals(need, have)) out.add(i - p.length() + 1);
        }
        return out;
    }
}`,
  },
  {
    slug: 'minimum-window-substring', title: 'Minimum Window Substring', level: 'Hard',
    summary: 'Return the shortest substring of s that contains every character of t (with multiplicity), or "" if none. The answer is unique.',
    method: 'minWindow', params: [['String', 's'], ['String', 't']], returns: 'String',
    tests: [
      { in: ['ADOBECODEBANC', 'ABC'], out: 'BANC' },
      { in: ['a', 'a'], out: 'a' },
      { in: ['a', 'aa'], out: '' },
      { in: ['ab', 'b'] },
      { in: ['aaflslflsldkalskaaa', 'aaa'] },
    ],
    ref: `class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int missing = t.length(), left = 0, bestL = 0, bestLen = Integer.MAX_VALUE;
        for (int right = 0; right < s.length(); right++) {
            if (need[s.charAt(right)]-- > 0) missing--;
            while (missing == 0) {
                if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestL = left; }
                if (++need[s.charAt(left++)] > 0) missing++;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
    }
}`,
  },
  {
    slug: 'subarrays-with-k-different-integers', title: 'Subarrays with K Different Integers', level: 'Hard',
    summary: 'Count the contiguous subarrays that contain exactly k distinct values.',
    method: 'subarraysWithKDistinct', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[1, 2, 1, 2, 3], 2], out: 7 },
      { in: [[1, 2, 1, 3, 4], 3], out: 3 },
      { in: [[1], 1] },
      { in: [[1, 1, 1], 1] },
      { in: [[2, 1, 2, 1, 2], 2] },
    ],
    ref: `class Solution {
    public int subarraysWithKDistinct(int[] nums, int k) { return atMost(nums, k) - atMost(nums, k - 1); }
    private int atMost(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        int left = 0, total = 0;
        for (int right = 0; right < nums.length; right++) {
            count.merge(nums[right], 1, Integer::sum);
            while (count.size() > k) { if (count.merge(nums[left], -1, Integer::sum) == 0) count.remove(nums[left]); left++; }
            total += right - left + 1;
        }
        return total;
    }
}`,
  },
];
