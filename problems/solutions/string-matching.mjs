const r = String.raw;

export default {
  'find-the-index-of-the-first-occurrence-in-a-string': {
    pattern: 'String matching: naive scan → Rabin–Karp rolling hash → KMP prefix function',
    approaches: [
      {
        level: 'Brute force', name: 'Check every start position',
        idea: 'For each position in `haystack` where `needle` could fit, compare character by character.',
        steps: [
          'For `i` from 0 to `n − m`: compare `haystack[i + j]` with `needle[j]` for `j = 0..m − 1`.',
          'Return `i` on the first full match; −1 if none.',
        ],
        time: 'O(n·m)', space: 'O(1)',
        why: 'Up to n − m + 1 starts, each comparing up to m characters (e.g. "aaaa…ab" in "aaaa…a").',
        code: {
          java: r`class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        for (int i = 0; i + m <= n; i++) {
            int j = 0;
            while (j < m && haystack.charAt(i + j) == needle.charAt(j)) j++;
            if (j == m) return i;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size(), m = needle.size();
        for (int i = 0; i + m <= n; i++) {
            int j = 0;
            while (j < m && haystack[i + j] == needle[j]) j++;
            if (j == m) return i;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        for i in range(n - m + 1):
            j = 0
            while j < m and haystack[i + j] == needle[j]:
                j += 1
            if j == m:
                return i
        return -1`,
          javascript: r`var strStr = function(haystack, needle) {
    const n = haystack.length, m = needle.length;
    for (let i = 0; i + m <= n; i++) {
        let j = 0;
        while (j < m && haystack[i + j] === needle[j]) j++;
        if (j === m) return i;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Rabin–Karp rolling hash',
        idea: 'Hash the needle, then slide a window of length m over the haystack, updating its hash in O(1) per step (drop the leftmost character, add the new one). Only compare characters when the hashes match.',
        steps: [
          'Polynomial hash with base 131 modulo 10⁹ + 7; precompute `high = 131^(m−1)`.',
          'For each `i`: if the window is full, subtract `haystack[i − m]·high`; then `h = h·131 + haystack[i]`.',
          'When `h` equals the needle\'s hash, confirm with a direct comparison and return the start.',
        ],
        time: 'O(n + m)', space: 'O(1)',
        why: 'O(n + m) expected; a hash collision costs an extra O(m) check, so adversarial inputs could degrade it — which KMP avoids.',
        code: {
          java: r`class Solution {
    public int strStr(String haystack, String needle) {
        final long M = 1_000_000_007L, B = 131;
        int n = haystack.length(), m = needle.length();
        if (m > n) return -1;
        long target = 0, h = 0, high = 1;
        for (int j = 0; j < m; j++) target = (target * B + needle.charAt(j)) % M;
        for (int j = 1; j < m; j++) high = high * B % M;
        for (int i = 0; i < n; i++) {
            if (i >= m) h = ((h - haystack.charAt(i - m) * high) % M + M) % M;
            h = (h * B + haystack.charAt(i)) % M;
            if (i >= m - 1 && h == target && haystack.regionMatches(i - m + 1, needle, 0, m)) return i - m + 1;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int strStr(string haystack, string needle) {
        const long long M = 1'000'000'007, B = 131;
        int n = haystack.size(), m = needle.size();
        if (m > n) return -1;
        long long target = 0, h = 0, high = 1;
        for (char c : needle) target = (target * B + c) % M;
        for (int j = 1; j < m; j++) high = high * B % M;
        for (int i = 0; i < n; i++) {
            if (i >= m) h = ((h - haystack[i - m] * high) % M + M) % M;
            h = (h * B + haystack[i]) % M;
            if (i >= m - 1 && h == target && haystack.compare(i - m + 1, m, needle) == 0) return i - m + 1;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        M, B = 10**9 + 7, 131
        n, m = len(haystack), len(needle)
        if m > n:
            return -1
        target = h = 0
        for c in needle:
            target = (target * B + ord(c)) % M
        high = pow(B, m - 1, M)
        for i, c in enumerate(haystack):
            if i >= m:
                h = (h - ord(haystack[i - m]) * high) % M
            h = (h * B + ord(c)) % M
            if i >= m - 1 and h == target and haystack[i - m + 1:i + 1] == needle:
                return i - m + 1
        return -1`,
          javascript: r`var strStr = function(haystack, needle) {
    const M = 1000000007, B = 131, n = haystack.length, m = needle.length;
    if (m > n) return -1;
    let target = 0, h = 0, high = 1;
    for (let j = 0; j < m; j++) target = (target * B + needle.charCodeAt(j)) % M;
    for (let j = 1; j < m; j++) high = (high * B) % M;
    for (let i = 0; i < n; i++) {
        if (i >= m) h = (((h - haystack.charCodeAt(i - m) * high) % M) + M) % M;
        h = (h * B + haystack.charCodeAt(i)) % M;
        if (i >= m - 1 && h === target && haystack.startsWith(needle, i - m + 1)) return i - m + 1;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'KMP (Knuth–Morris–Pratt)',
        idea: 'Precompute, for every prefix of the needle, the length of its longest proper prefix that is also a suffix (`pi`). On a mismatch, jump to `pi[j − 1]` instead of restarting — the haystack pointer never moves back.',
        steps: [
          'Build `pi` for `needle`: for each `i`, fall back `k = pi[k − 1]` while `needle[i] != needle[k]`; extend `k` on a match.',
          'Scan `haystack` with `j` = matched length, falling back the same way on mismatches.',
          'When `j == m`, return `i − m + 1`.',
        ],
        time: 'O(n + m)', space: 'O(m)',
        why: 'Guaranteed linear: each fall-back undoes an earlier extension, so total work is bounded by n + m.',
        code: {
          java: r`class Solution {
    public int strStr(String haystack, String needle) {
        int n = haystack.length(), m = needle.length();
        int[] pi = new int[m];
        for (int i = 1, k = 0; i < m; i++) {
            while (k > 0 && needle.charAt(i) != needle.charAt(k)) k = pi[k - 1];
            if (needle.charAt(i) == needle.charAt(k)) k++;
            pi[i] = k;
        }
        for (int i = 0, j = 0; i < n; i++) {
            while (j > 0 && haystack.charAt(i) != needle.charAt(j)) j = pi[j - 1];
            if (haystack.charAt(i) == needle.charAt(j)) j++;
            if (j == m) return i - m + 1;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size(), m = needle.size();
        vector<int> pi(m, 0);
        for (int i = 1, k = 0; i < m; i++) {
            while (k > 0 && needle[i] != needle[k]) k = pi[k - 1];
            if (needle[i] == needle[k]) k++;
            pi[i] = k;
        }
        for (int i = 0, j = 0; i < n; i++) {
            while (j > 0 && haystack[i] != needle[j]) j = pi[j - 1];
            if (haystack[i] == needle[j]) j++;
            if (j == m) return i - m + 1;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        m = len(needle)
        pi, k = [0] * m, 0
        for i in range(1, m):
            while k and needle[i] != needle[k]:
                k = pi[k - 1]
            if needle[i] == needle[k]:
                k += 1
            pi[i] = k
        j = 0
        for i, c in enumerate(haystack):
            while j and c != needle[j]:
                j = pi[j - 1]
            if c == needle[j]:
                j += 1
            if j == m:
                return i - m + 1
        return -1`,
          javascript: r`var strStr = function(haystack, needle) {
    const n = haystack.length, m = needle.length, pi = new Array(m).fill(0);
    for (let i = 1, k = 0; i < m; i++) {
        while (k > 0 && needle[i] !== needle[k]) k = pi[k - 1];
        if (needle[i] === needle[k]) k++;
        pi[i] = k;
    }
    for (let i = 0, j = 0; i < n; i++) {
        while (j > 0 && haystack[i] !== needle[j]) j = pi[j - 1];
        if (haystack[i] === needle[j]) j++;
        if (j === m) return i - m + 1;
    }
    return -1;
};`,
        },
      },
    ],
  },

  'rotate-string': {
    pattern: 'Every rotation of s is a substring of s + s',
    approaches: [
      {
        level: 'Brute force', name: 'Try every rotation',
        idea: 'Build each of the n rotations of `s` and compare it with `goal`.',
        steps: [
          'If the lengths differ, return false.',
          'For each `k` from 0 to n − 1: if `s[k..] + s[..k]` equals `goal`, return true.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n rotations, each built and compared in O(n).',
        code: {
          java: r`class Solution {
    public boolean rotateString(String s, String goal) {
        if (s.length() != goal.length()) return false;
        for (int k = 0; k < s.length(); k++)
            if ((s.substring(k) + s.substring(0, k)).equals(goal)) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool rotateString(string s, string goal) {
        if (s.size() != goal.size()) return false;
        for (size_t k = 0; k < s.size(); k++)
            if (s.substr(k) + s.substr(0, k) == goal) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        return len(s) == len(goal) and any(s[k:] + s[:k] == goal for k in range(len(s)))`,
          javascript: r`var rotateString = function(s, goal) {
    if (s.length !== goal.length) return false;
    for (let k = 0; k < s.length; k++) if (s.slice(k) + s.slice(0, k) === goal) return true;
    return false;
};`,
        },
      },
      {
        level: 'Better', name: 'Search for goal inside s + s',
        idea: 'Writing `s` twice in a row contains every rotation as a length-n window. So `goal` is a rotation exactly when the lengths match and `goal` occurs in `s + s`.',
        steps: [
          'If the lengths differ, return false.',
          'Otherwise return whether `s + s` contains `goal`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'One line, but the library search is the naive O(n·m) scan in the worst case.',
        code: {
          java: r`class Solution {
    public boolean rotateString(String s, String goal) {
        return s.length() == goal.length() && (s + s).contains(goal);
    }
}`,
          cpp: r`class Solution {
public:
    bool rotateString(string s, string goal) {
        return s.size() == goal.size() && (s + s).find(goal) != string::npos;
    }
};`,
          python: r`class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        return len(s) == len(goal) and goal in s + s`,
          javascript: r`var rotateString = function(s, goal) {
    return s.length === goal.length && (s + s).includes(goal);
};`,
        },
      },
      {
        level: 'Optimal', name: 'KMP search in s + s',
        idea: 'Same observation, with a guaranteed-linear search: build the KMP prefix function of `goal` and scan `s + s` with it.',
        steps: [
          'If the lengths differ, return false.',
          'Build `pi` for `goal`.',
          'Scan `s + s`, falling back with `pi` on mismatches; return true when a full match is found.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Linear in the 3n characters involved, no matter the input.',
        code: {
          java: r`class Solution {
    public boolean rotateString(String s, String goal) {
        int n = s.length();
        if (n != goal.length()) return false;
        int[] pi = new int[n];
        for (int i = 1, k = 0; i < n; i++) {
            while (k > 0 && goal.charAt(i) != goal.charAt(k)) k = pi[k - 1];
            if (goal.charAt(i) == goal.charAt(k)) k++;
            pi[i] = k;
        }
        String t = s + s;
        for (int i = 0, j = 0; i < t.length(); i++) {
            while (j > 0 && t.charAt(i) != goal.charAt(j)) j = pi[j - 1];
            if (t.charAt(i) == goal.charAt(j)) j++;
            if (j == n) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool rotateString(string s, string goal) {
        int n = s.size();
        if (n != (int) goal.size()) return false;
        vector<int> pi(n, 0);
        for (int i = 1, k = 0; i < n; i++) {
            while (k > 0 && goal[i] != goal[k]) k = pi[k - 1];
            if (goal[i] == goal[k]) k++;
            pi[i] = k;
        }
        string t = s + s;
        for (int i = 0, j = 0; i < (int) t.size(); i++) {
            while (j > 0 && t[i] != goal[j]) j = pi[j - 1];
            if (t[i] == goal[j]) j++;
            if (j == n) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def rotateString(self, s: str, goal: str) -> bool:
        n = len(s)
        if n != len(goal):
            return False
        pi, k = [0] * n, 0
        for i in range(1, n):
            while k and goal[i] != goal[k]:
                k = pi[k - 1]
            if goal[i] == goal[k]:
                k += 1
            pi[i] = k
        j = 0
        for c in s + s:
            while j and c != goal[j]:
                j = pi[j - 1]
            if c == goal[j]:
                j += 1
            if j == n:
                return True
        return False`,
          javascript: r`var rotateString = function(s, goal) {
    const n = s.length;
    if (n !== goal.length) return false;
    const pi = new Array(n).fill(0);
    for (let i = 1, k = 0; i < n; i++) {
        while (k > 0 && goal[i] !== goal[k]) k = pi[k - 1];
        if (goal[i] === goal[k]) k++;
        pi[i] = k;
    }
    const t = s + s;
    for (let i = 0, j = 0; i < t.length; i++) {
        while (j > 0 && t[i] !== goal[j]) j = pi[j - 1];
        if (t[i] === goal[j]) j++;
        if (j === n) return true;
    }
    return false;
};`,
        },
      },
    ],
  },

  'repeated-substring-pattern': {
    pattern: 'KMP prefix function: the smallest period is n − pi[n − 1]',
    approaches: [
      {
        level: 'Brute force', name: 'Try every block length that divides n',
        idea: 'A repeating block must have a length `L` that divides n and is at most n/2. For each such `L`, check that every character equals the one `L` positions earlier.',
        steps: [
          'For `L` from 1 to n/2 with `n % L == 0`:',
          'If `s[i] == s[i − L]` for all `i ≥ L`, return true.',
          'Return false.',
        ],
        time: 'O(n·d(n))', space: 'O(1)',
        why: 'd(n) = number of divisors of n (at most 64 for n ≤ 10⁴), each checked in O(n).',
        code: {
          java: r`class Solution {
    public boolean repeatedSubstringPattern(String s) {
        int n = s.length();
        for (int len = 1; len <= n / 2; len++) {
            if (n % len != 0) continue;
            int i = len;
            while (i < n && s.charAt(i) == s.charAt(i - len)) i++;
            if (i == n) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool repeatedSubstringPattern(string s) {
        int n = s.size();
        for (int len = 1; len <= n / 2; len++) {
            if (n % len != 0) continue;
            int i = len;
            while (i < n && s[i] == s[i - len]) i++;
            if (i == n) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        n = len(s)
        return any(n % L == 0 and s[:L] * (n // L) == s for L in range(1, n // 2 + 1))`,
          javascript: r`var repeatedSubstringPattern = function(s) {
    const n = s.length;
    for (let len = 1; len <= n / 2; len++) {
        if (n % len !== 0) continue;
        let i = len;
        while (i < n && s[i] === s[i - len]) i++;
        if (i === n) return true;
    }
    return false;
};`,
        },
      },
      {
        level: 'Better', name: 'Look for s inside (s + s) without its ends',
        idea: 'If `s` is a repetition, rotating it by one block gives `s` again, so `s` occurs in `s + s` at some position other than 0 and n. Removing the first and last character of `s + s` rules those two out.',
        steps: [
          'Let `t = (s + s)` with its first and last characters removed.',
          'Return whether `t` contains `s`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Elegant, but the library substring search is O(n·m) in the worst case.',
        code: {
          java: r`class Solution {
    public boolean repeatedSubstringPattern(String s) {
        String t = s + s;
        return t.substring(1, t.length() - 1).contains(s);
    }
}`,
          cpp: r`class Solution {
public:
    bool repeatedSubstringPattern(string s) {
        string t = s + s;
        return t.substr(1, t.size() - 2).find(s) != string::npos;
    }
};`,
          python: r`class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        return s in (s + s)[1:-1]`,
          javascript: r`var repeatedSubstringPattern = function(s) {
    return (s + s).slice(1, -1).includes(s);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Period from the KMP prefix function',
        idea: '`p = pi[n − 1]` is the longest proper prefix that is also a suffix, so `n − p` is the smallest period of `s`. The string is a whole-number repetition exactly when `p > 0` and that period divides n.',
        steps: [
          'Build the prefix function `pi` of `s`.',
          'Let `p = pi[n − 1]`.',
          'Return `p > 0 && n % (n − p) == 0`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One linear pass to build `pi`.',
        code: {
          java: r`class Solution {
    public boolean repeatedSubstringPattern(String s) {
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1, k = 0; i < n; i++) {
            while (k > 0 && s.charAt(i) != s.charAt(k)) k = pi[k - 1];
            if (s.charAt(i) == s.charAt(k)) k++;
            pi[i] = k;
        }
        int p = pi[n - 1];
        return p > 0 && n % (n - p) == 0;
    }
}`,
          cpp: r`class Solution {
public:
    bool repeatedSubstringPattern(string s) {
        int n = s.size();
        vector<int> pi(n, 0);
        for (int i = 1, k = 0; i < n; i++) {
            while (k > 0 && s[i] != s[k]) k = pi[k - 1];
            if (s[i] == s[k]) k++;
            pi[i] = k;
        }
        int p = pi[n - 1];
        return p > 0 && n % (n - p) == 0;
    }
};`,
          python: r`class Solution:
    def repeatedSubstringPattern(self, s: str) -> bool:
        n = len(s)
        pi, k = [0] * n, 0
        for i in range(1, n):
            while k and s[i] != s[k]:
                k = pi[k - 1]
            if s[i] == s[k]:
                k += 1
            pi[i] = k
        p = pi[-1]
        return p > 0 and n % (n - p) == 0`,
          javascript: r`var repeatedSubstringPattern = function(s) {
    const n = s.length, pi = new Array(n).fill(0);
    for (let i = 1, k = 0; i < n; i++) {
        while (k > 0 && s[i] !== s[k]) k = pi[k - 1];
        if (s[i] === s[k]) k++;
        pi[i] = k;
    }
    const p = pi[n - 1];
    return p > 0 && n % (n - p) === 0;
};`,
        },
      },
    ],
  },

  'repeated-string-match': {
    pattern: 'Bound the repetitions (⌈|b|/|a|⌉ or one more), then string-search with KMP',
    approaches: [
      {
        level: 'Brute force', name: 'Keep appending a and searching',
        idea: 'Append `a` one copy at a time and check whether `b` appears yet. Any match fits within ⌈|b|/|a|⌉ + 1 copies (it can start anywhere inside the first copy), so stop after that.',
        steps: [
          'Let `limit = |b| / |a| + 2`.',
          'For `k` from 1 to `limit`: append `a`; if the string contains `b`, return `k`.',
          'Return −1.',
        ],
        time: 'O((m/n)·(n + m)·m)', space: 'O(n + m)',
        why: 'Up to m/n + 2 library searches, each O(length · m) in the worst case.',
        code: {
          java: r`class Solution {
    public int repeatedStringMatch(String a, String b) {
        StringBuilder sb = new StringBuilder();
        int limit = b.length() / a.length() + 2;
        for (int k = 1; k <= limit; k++) {
            sb.append(a);
            if (sb.indexOf(b) >= 0) return k;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int repeatedStringMatch(string a, string b) {
        string t;
        int limit = b.size() / a.size() + 2;
        for (int k = 1; k <= limit; k++) {
            t += a;
            if (t.find(b) != string::npos) return k;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def repeatedStringMatch(self, a: str, b: str) -> int:
        t = ''
        for k in range(1, len(b) // len(a) + 3):
            t += a
            if b in t:
                return k
        return -1`,
          javascript: r`var repeatedStringMatch = function(a, b) {
    let t = '';
    const limit = Math.floor(b.length / a.length) + 2;
    for (let k = 1; k <= limit; k++) {
        t += a;
        if (t.includes(b)) return k;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One KMP search over ⌈m/n⌉ + 1 copies',
        idea: 'Build `t` = `a` repeated `q + 1` times, where `q = ⌈|b|/|a|⌉`. Find the first occurrence of `b` in `t` with KMP; the copies needed are those covering up to the end of that occurrence.',
        steps: [
          '`q = ⌈m / n⌉`; `t = a` repeated `q + 1` times.',
          'KMP-search `b` in `t`; if not found, return −1.',
          'With first match ending at index `end` (exclusive), return `⌈end / n⌉`.',
        ],
        time: 'O(n + m)', space: 'O(n + m)',
        why: '`t` has at most m + 2n characters and KMP is linear. The first occurrence ends earliest, so it needs the fewest copies.',
        code: {
          java: r`class Solution {
    public int repeatedStringMatch(String a, String b) {
        int n = a.length(), m = b.length(), q = (m + n - 1) / n;
        String t = a.repeat(q + 1);
        int[] pi = new int[m];
        for (int i = 1, k = 0; i < m; i++) {
            while (k > 0 && b.charAt(i) != b.charAt(k)) k = pi[k - 1];
            if (b.charAt(i) == b.charAt(k)) k++;
            pi[i] = k;
        }
        for (int i = 0, j = 0; i < t.length(); i++) {
            while (j > 0 && t.charAt(i) != b.charAt(j)) j = pi[j - 1];
            if (t.charAt(i) == b.charAt(j)) j++;
            if (j == m) return (i + 1 + n - 1) / n;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int repeatedStringMatch(string a, string b) {
        int n = a.size(), m = b.size(), q = (m + n - 1) / n;
        string t;
        for (int k = 0; k <= q; k++) t += a;
        vector<int> pi(m, 0);
        for (int i = 1, k = 0; i < m; i++) {
            while (k > 0 && b[i] != b[k]) k = pi[k - 1];
            if (b[i] == b[k]) k++;
            pi[i] = k;
        }
        for (int i = 0, j = 0; i < (int) t.size(); i++) {
            while (j > 0 && t[i] != b[j]) j = pi[j - 1];
            if (t[i] == b[j]) j++;
            if (j == m) return (i + 1 + n - 1) / n;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def repeatedStringMatch(self, a: str, b: str) -> int:
        n, m = len(a), len(b)
        q = -(-m // n)
        t = a * (q + 1)
        pi, k = [0] * m, 0
        for i in range(1, m):
            while k and b[i] != b[k]:
                k = pi[k - 1]
            if b[i] == b[k]:
                k += 1
            pi[i] = k
        j = 0
        for i, c in enumerate(t):
            while j and c != b[j]:
                j = pi[j - 1]
            if c == b[j]:
                j += 1
            if j == m:
                return -(-(i + 1) // n)
        return -1`,
          javascript: r`var repeatedStringMatch = function(a, b) {
    const n = a.length, m = b.length, q = Math.ceil(m / n), t = a.repeat(q + 1);
    const pi = new Array(m).fill(0);
    for (let i = 1, k = 0; i < m; i++) {
        while (k > 0 && b[i] !== b[k]) k = pi[k - 1];
        if (b[i] === b[k]) k++;
        pi[i] = k;
    }
    for (let i = 0, j = 0; i < t.length; i++) {
        while (j > 0 && t[i] !== b[j]) j = pi[j - 1];
        if (t[i] === b[j]) j++;
        if (j === m) return Math.ceil((i + 1) / n);
    }
    return -1;
};`,
        },
      },
    ],
  },

  'repeated-dna-sequences': {
    pattern: 'Fixed-size sliding window + hashing (2 bits per letter → 20-bit rolling code)',
    approaches: [
      {
        level: 'Brute force', name: 'Compare each window with every later window',
        idea: 'For each 10-letter window, look for an identical window later in the string; collect matches in a set so each answer appears once.',
        steps: [
          'For each start `i`, compare `s[i..i+10)` with `s[j..j+10)` for every `j > i`.',
          'On a match, add the window to a result set and stop scanning for this `i`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'About n²/2 window comparisons of 10 letters each.',
        code: {
          java: r`class Solution {
    public List<String> findRepeatedDnaSequences(String s) {
        Set<String> result = new HashSet<>();
        for (int i = 0; i + 10 <= s.length(); i++)
            for (int j = i + 1; j + 10 <= s.length(); j++)
                if (s.regionMatches(i, s, j, 10)) {
                    result.add(s.substring(i, i + 10));
                    break;
                }
        return new ArrayList<>(result);
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> findRepeatedDnaSequences(string s) {
        set<string> result;
        int n = s.size();
        for (int i = 0; i + 10 <= n; i++)
            for (int j = i + 1; j + 10 <= n; j++)
                if (s.compare(i, 10, s, j, 10) == 0) {
                    result.insert(s.substr(i, 10));
                    break;
                }
        return vector<string>(result.begin(), result.end());
    }
};`,
          python: r`class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        result = set()
        for i in range(len(s) - 9):
            window = s[i:i + 10]
            if any(s[j:j + 10] == window for j in range(i + 1, len(s) - 9)):
                result.add(window)
        return list(result)`,
          javascript: r`var findRepeatedDnaSequences = function(s) {
    const result = new Set();
    for (let i = 0; i + 10 <= s.length; i++) {
        const w = s.slice(i, i + 10);
        for (let j = i + 1; j + 10 <= s.length; j++)
            if (s.startsWith(w, j)) { result.add(w); break; }
    }
    return [...result];
};`,
        },
      },
      {
        level: 'Better', name: 'Hash set of windows',
        idea: 'Slide over every 10-letter window, storing seen windows in a set. A window seen before goes into the answer set.',
        steps: [
          'For each start `i`: `w = s[i..i+10)`.',
          'If `w` is already in `seen`, add it to `repeated`; otherwise add it to `seen`.',
          'Return `repeated`.',
        ],
        time: 'O(n·L)', space: 'O(n·L)',
        why: 'L = 10: each window is copied and hashed as a 10-character string.',
        code: {
          java: r`class Solution {
    public List<String> findRepeatedDnaSequences(String s) {
        Set<String> seen = new HashSet<>(), repeated = new HashSet<>();
        for (int i = 0; i + 10 <= s.length(); i++) {
            String w = s.substring(i, i + 10);
            if (!seen.add(w)) repeated.add(w);
        }
        return new ArrayList<>(repeated);
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> findRepeatedDnaSequences(string s) {
        unordered_set<string> seen, repeated;
        for (int i = 0; i + 10 <= (int) s.size(); i++) {
            string w = s.substr(i, 10);
            if (!seen.insert(w).second) repeated.insert(w);
        }
        return vector<string>(repeated.begin(), repeated.end());
    }
};`,
          python: r`class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        seen, repeated = set(), set()
        for i in range(len(s) - 9):
            w = s[i:i + 10]
            if w in seen:
                repeated.add(w)
            seen.add(w)
        return list(repeated)`,
          javascript: r`var findRepeatedDnaSequences = function(s) {
    const seen = new Set(), repeated = new Set();
    for (let i = 0; i + 10 <= s.length; i++) {
        const w = s.slice(i, i + 10);
        if (seen.has(w)) repeated.add(w);
        else seen.add(w);
    }
    return [...repeated];
};`,
        },
      },
      {
        level: 'Optimal', name: '2-bit rolling code',
        idea: 'With only four letters, each fits in 2 bits, so a 10-letter window is a 20-bit integer. Slide it in O(1): shift left by 2, add the new letter, mask to 20 bits. Track counts per code in a 2²⁰ table.',
        steps: [
          'Map A, C, G, T to 0, 1, 2, 3.',
          'For each `i`: `code = ((code << 2) | val(s[i])) & (2²⁰ − 1)`.',
          'Once `i ≥ 9`, increment `count[code]`; when it becomes exactly 2, add `s[i − 9..i]` to the answer.',
        ],
        time: 'O(n)', space: 'O(4^L)',
        why: 'O(1) per step with no string hashing; the table has 4¹⁰ ≈ 10⁶ entries regardless of n. Adding at count 2 reports each sequence once.',
        code: {
          java: r`class Solution {
    public List<String> findRepeatedDnaSequences(String s) {
        List<String> result = new ArrayList<>();
        byte[] count = new byte[1 << 20];
        int code = 0;
        for (int i = 0; i < s.length(); i++) {
            code = ((code << 2) | "ACGT".indexOf(s.charAt(i))) & ((1 << 20) - 1);
            if (i >= 9 && count[code] < 2 && ++count[code] == 2) result.add(s.substring(i - 9, i + 1));
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> findRepeatedDnaSequences(string s) {
        vector<string> result;
        vector<unsigned char> count(1 << 20, 0);
        int val[128] = {};
        val['C'] = 1; val['G'] = 2; val['T'] = 3;
        int code = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            code = ((code << 2) | val[(int) s[i]]) & ((1 << 20) - 1);
            if (i >= 9 && count[code] < 2 && ++count[code] == 2) result.push_back(s.substr(i - 9, 10));
        }
        return result;
    }
};`,
          python: r`class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        val = {'A': 0, 'C': 1, 'G': 2, 'T': 3}
        count, result, code, mask = {}, [], 0, (1 << 20) - 1
        for i, ch in enumerate(s):
            code = ((code << 2) | val[ch]) & mask
            if i >= 9:
                count[code] = count.get(code, 0) + 1
                if count[code] == 2:
                    result.append(s[i - 9:i + 1])
        return result`,
          javascript: r`var findRepeatedDnaSequences = function(s) {
    const val = { A: 0, C: 1, G: 2, T: 3 }, count = new Uint8Array(1 << 20), result = [];
    let code = 0;
    for (let i = 0; i < s.length; i++) {
        code = ((code << 2) | val[s[i]]) & ((1 << 20) - 1);
        if (i >= 9 && count[code] < 2 && ++count[code] === 2) result.push(s.slice(i - 9, i + 1));
    }
    return result;
};`,
        },
      },
    ],
  },

  'longest-happy-prefix': {
    pattern: 'KMP prefix function: pi[n − 1] is the longest border',
    approaches: [
      {
        level: 'Brute force', name: 'Try every length, longest first',
        idea: 'For `L` from n − 1 down to 1, compare the prefix and suffix of length `L`; the first match is the answer.',
        steps: [
          'For `L` from n − 1 down to 1: if `s[0..L) == s[n−L..n)`, return that prefix.',
          'Return "".',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Up to n lengths, each compared in O(L).',
        code: {
          java: r`class Solution {
    public String longestPrefix(String s) {
        int n = s.length();
        for (int len = n - 1; len > 0; len--)
            if (s.regionMatches(0, s, n - len, len)) return s.substring(0, len);
        return "";
    }
}`,
          cpp: r`class Solution {
public:
    string longestPrefix(string s) {
        int n = s.size();
        for (int len = n - 1; len > 0; len--)
            if (s.compare(0, len, s, n - len, len) == 0) return s.substr(0, len);
        return "";
    }
};`,
          python: r`class Solution:
    def longestPrefix(self, s: str) -> str:
        n = len(s)
        for L in range(n - 1, 0, -1):
            if s[:L] == s[n - L:]:
                return s[:L]
        return ''`,
          javascript: r`var longestPrefix = function(s) {
    const n = s.length;
    for (let len = n - 1; len > 0; len--) if (s.startsWith(s.slice(n - len))) return s.slice(0, len);
    return '';
};`,
        },
      },
      {
        level: 'Better', name: 'Rolling hash of prefix and suffix',
        idea: 'Grow the prefix one character at the end and the suffix one character at the front, updating both polynomial hashes in O(1). Remember the longest length where they agree.',
        steps: [
          'Prefix hash: `hp = hp·B + s[L − 1]`. Suffix hash: `hs = s[n − L]·B^(L−1) + hs`.',
          'Use two moduli (10⁹ + 7 and 10⁹ + 9) to make collisions negligible.',
          'Track the largest `L < n` with equal hashes and return `s[0..L)`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Linear, but probabilistic: a double-hash collision is astronomically unlikely, not impossible. KMP gives the same bound deterministically.',
        code: {
          java: r`class Solution {
    public String longestPrefix(String s) {
        final long M1 = 1_000_000_007L, M2 = 1_000_000_009L, B = 131;
        int n = s.length(), best = 0;
        long p1 = 0, p2 = 0, s1 = 0, s2 = 0, w1 = 1, w2 = 1;
        for (int len = 1; len < n; len++) {
            p1 = (p1 * B + s.charAt(len - 1)) % M1;
            p2 = (p2 * B + s.charAt(len - 1)) % M2;
            s1 = (s.charAt(n - len) * w1 + s1) % M1;
            s2 = (s.charAt(n - len) * w2 + s2) % M2;
            w1 = w1 * B % M1;
            w2 = w2 * B % M2;
            if (p1 == s1 && p2 == s2) best = len;
        }
        return s.substring(0, best);
    }
}`,
          cpp: r`class Solution {
public:
    string longestPrefix(string s) {
        const long long M1 = 1'000'000'007, M2 = 1'000'000'009, B = 131;
        int n = s.size(), best = 0;
        long long p1 = 0, p2 = 0, s1 = 0, s2 = 0, w1 = 1, w2 = 1;
        for (int len = 1; len < n; len++) {
            p1 = (p1 * B + s[len - 1]) % M1;
            p2 = (p2 * B + s[len - 1]) % M2;
            s1 = (s[n - len] * w1 + s1) % M1;
            s2 = (s[n - len] * w2 + s2) % M2;
            w1 = w1 * B % M1;
            w2 = w2 * B % M2;
            if (p1 == s1 && p2 == s2) best = len;
        }
        return s.substr(0, best);
    }
};`,
          python: r`class Solution:
    def longestPrefix(self, s: str) -> str:
        M1, M2, B = 10**9 + 7, 10**9 + 9, 131
        n, best = len(s), 0
        p1 = p2 = s1 = s2 = 0
        w1 = w2 = 1
        for L in range(1, n):
            a, b = ord(s[L - 1]), ord(s[n - L])
            p1, p2 = (p1 * B + a) % M1, (p2 * B + a) % M2
            s1, s2 = (b * w1 + s1) % M1, (b * w2 + s2) % M2
            w1, w2 = w1 * B % M1, w2 * B % M2
            if p1 == s1 and p2 == s2:
                best = L
        return s[:best]`,
          javascript: r`var longestPrefix = function(s) {
    const M1 = 1000000007, M2 = 1000000009, B = 131, n = s.length;
    let best = 0, p1 = 0, p2 = 0, s1 = 0, s2 = 0, w1 = 1, w2 = 1;
    for (let len = 1; len < n; len++) {
        const a = s.charCodeAt(len - 1), b = s.charCodeAt(n - len);
        p1 = (p1 * B + a) % M1;
        p2 = (p2 * B + a) % M2;
        s1 = (b * w1 + s1) % M1;
        s2 = (b * w2 + s2) % M2;
        w1 = (w1 * B) % M1;
        w2 = (w2 * B) % M2;
        if (p1 === s1 && p2 === s2) best = len;
    }
    return s.slice(0, best);
};`,
        },
      },
      {
        level: 'Optimal', name: 'KMP prefix function',
        idea: '`pi[i]` is the length of the longest proper prefix of `s[0..i]` that is also its suffix. For the whole string that is exactly the happy prefix: `pi[n − 1]`.',
        steps: [
          'Build `pi`: for each `i`, fall back `k = pi[k − 1]` while `s[i] != s[k]`; extend `k` on a match.',
          'Return `s[0..pi[n − 1])`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Deterministic linear time: total fall-backs never exceed total extensions.',
        code: {
          java: r`class Solution {
    public String longestPrefix(String s) {
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1, k = 0; i < n; i++) {
            while (k > 0 && s.charAt(i) != s.charAt(k)) k = pi[k - 1];
            if (s.charAt(i) == s.charAt(k)) k++;
            pi[i] = k;
        }
        return s.substring(0, pi[n - 1]);
    }
}`,
          cpp: r`class Solution {
public:
    string longestPrefix(string s) {
        int n = s.size();
        vector<int> pi(n, 0);
        for (int i = 1, k = 0; i < n; i++) {
            while (k > 0 && s[i] != s[k]) k = pi[k - 1];
            if (s[i] == s[k]) k++;
            pi[i] = k;
        }
        return s.substr(0, pi[n - 1]);
    }
};`,
          python: r`class Solution:
    def longestPrefix(self, s: str) -> str:
        n = len(s)
        pi, k = [0] * n, 0
        for i in range(1, n):
            while k and s[i] != s[k]:
                k = pi[k - 1]
            if s[i] == s[k]:
                k += 1
            pi[i] = k
        return s[:pi[-1]]`,
          javascript: r`var longestPrefix = function(s) {
    const n = s.length, pi = new Array(n).fill(0);
    for (let i = 1, k = 0; i < n; i++) {
        while (k > 0 && s[i] !== s[k]) k = pi[k - 1];
        if (s[i] === s[k]) k++;
        pi[i] = k;
    }
    return s.slice(0, pi[n - 1]);
};`,
        },
      },
    ],
  },

  'shortest-palindrome': {
    pattern: 'Longest palindromic prefix via KMP on s + "#" + reverse(s)',
    approaches: [
      {
        level: 'Brute force', name: 'Find the longest palindromic prefix directly',
        idea: 'The answer keeps the longest palindromic prefix of `s` in the middle and mirrors the rest in front. Test prefixes from longest to shortest.',
        steps: [
          'For `end` from n down to 1: if `s[0..end)` is a palindrome (two pointers), stop.',
          'Return `reverse(s[end..])` + `s` (for an empty string, return "").',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Up to n prefixes, each palindrome check O(n) — e.g. "aaa…ab".',
        code: {
          java: r`class Solution {
    public String shortestPalindrome(String s) {
        int end = s.length();
        while (end > 0 && !isPalindrome(s, end)) end--;
        return new StringBuilder(s.substring(end)).reverse().toString() + s;
    }

    private boolean isPalindrome(String s, int end) {
        for (int i = 0, j = end - 1; i < j; i++, j--)
            if (s.charAt(i) != s.charAt(j)) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
    bool isPalindrome(const string& s, int end) {
        for (int i = 0, j = end - 1; i < j; i++, j--)
            if (s[i] != s[j]) return false;
        return true;
    }
public:
    string shortestPalindrome(string s) {
        int end = s.size();
        while (end > 0 && !isPalindrome(s, end)) end--;
        string front = s.substr(end);
        reverse(front.begin(), front.end());
        return front + s;
    }
};`,
          python: r`class Solution:
    def shortestPalindrome(self, s: str) -> str:
        end = len(s)
        while end > 0 and s[:end] != s[:end][::-1]:
            end -= 1
        return s[end:][::-1] + s`,
          javascript: r`var shortestPalindrome = function(s) {
    const isPalindrome = (end) => {
        for (let i = 0, j = end - 1; i < j; i++, j--) if (s[i] !== s[j]) return false;
        return true;
    };
    let end = s.length;
    while (end > 0 && !isPalindrome(end)) end--;
    return s.slice(end).split('').reverse().join('') + s;
};`,
        },
      },
      {
        level: 'Better', name: 'Forward and backward rolling hashes',
        idea: 'A prefix is a palindrome when it reads the same both ways. Maintain its hash read forwards (`h·B + c`) and backwards (`c·B^i + h`) as it grows; equal hashes mean a palindrome.',
        steps: [
          'For `i` from 0 to n − 1, update both hashes with `s[i]` (two moduli to avoid collisions).',
          'When they agree, record `end = i + 1`.',
          'Return `reverse(s[end..]) + s`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'O(1) per character; correct with overwhelming probability (double hashing), whereas KMP is exact.',
        code: {
          java: r`class Solution {
    public String shortestPalindrome(String s) {
        final long M1 = 1_000_000_007L, M2 = 1_000_000_009L, B = 131;
        long f1 = 0, f2 = 0, b1 = 0, b2 = 0, w1 = 1, w2 = 1;
        int end = 0;
        for (int i = 0; i < s.length(); i++) {
            int c = s.charAt(i);
            f1 = (f1 * B + c) % M1;
            f2 = (f2 * B + c) % M2;
            b1 = (c * w1 + b1) % M1;
            b2 = (c * w2 + b2) % M2;
            w1 = w1 * B % M1;
            w2 = w2 * B % M2;
            if (f1 == b1 && f2 == b2) end = i + 1;
        }
        return new StringBuilder(s.substring(end)).reverse().toString() + s;
    }
}`,
          cpp: r`class Solution {
public:
    string shortestPalindrome(string s) {
        const long long M1 = 1'000'000'007, M2 = 1'000'000'009, B = 131;
        long long f1 = 0, f2 = 0, b1 = 0, b2 = 0, w1 = 1, w2 = 1;
        int end = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            int c = s[i];
            f1 = (f1 * B + c) % M1;
            f2 = (f2 * B + c) % M2;
            b1 = (c * w1 + b1) % M1;
            b2 = (c * w2 + b2) % M2;
            w1 = w1 * B % M1;
            w2 = w2 * B % M2;
            if (f1 == b1 && f2 == b2) end = i + 1;
        }
        string front = s.substr(end);
        reverse(front.begin(), front.end());
        return front + s;
    }
};`,
          python: r`class Solution:
    def shortestPalindrome(self, s: str) -> str:
        M1, M2, B = 10**9 + 7, 10**9 + 9, 131
        f1 = f2 = b1 = b2 = 0
        w1 = w2 = 1
        end = 0
        for i, ch in enumerate(s):
            c = ord(ch)
            f1, f2 = (f1 * B + c) % M1, (f2 * B + c) % M2
            b1, b2 = (c * w1 + b1) % M1, (c * w2 + b2) % M2
            w1, w2 = w1 * B % M1, w2 * B % M2
            if f1 == b1 and f2 == b2:
                end = i + 1
        return s[end:][::-1] + s`,
          javascript: r`var shortestPalindrome = function(s) {
    const M1 = 1000000007, M2 = 1000000009, B = 131;
    let f1 = 0, f2 = 0, b1 = 0, b2 = 0, w1 = 1, w2 = 1, end = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        f1 = (f1 * B + c) % M1;
        f2 = (f2 * B + c) % M2;
        b1 = (c * w1 + b1) % M1;
        b2 = (c * w2 + b2) % M2;
        w1 = (w1 * B) % M1;
        w2 = (w2 * B) % M2;
        if (f1 === b1 && f2 === b2) end = i + 1;
    }
    return s.slice(end).split('').reverse().join('') + s;
};`,
        },
      },
      {
        level: 'Optimal', name: 'KMP on s + "#" + reverse(s)',
        idea: 'A palindromic prefix of `s` equals a suffix of `reverse(s)`. In `t = s + "#" + reverse(s)`, the last prefix-function value is the longest prefix of `s` that matches a suffix of `reverse(s)` — the longest palindromic prefix. The `#` stops matches running past `s`.',
        steps: [
          'Build `t = s + "#" + reverse(s)` and its prefix function `pi`.',
          '`L = pi[last]` is the longest palindromic prefix length.',
          'Return `reverse(s)[0..n − L) + s`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One deterministic linear pass over 2n + 1 characters.',
        code: {
          java: r`class Solution {
    public String shortestPalindrome(String s) {
        String rev = new StringBuilder(s).reverse().toString(), t = s + "#" + rev;
        int[] pi = new int[t.length()];
        for (int i = 1, k = 0; i < t.length(); i++) {
            while (k > 0 && t.charAt(i) != t.charAt(k)) k = pi[k - 1];
            if (t.charAt(i) == t.charAt(k)) k++;
            pi[i] = k;
        }
        return rev.substring(0, s.length() - pi[t.length() - 1]) + s;
    }
}`,
          cpp: r`class Solution {
public:
    string shortestPalindrome(string s) {
        string rev(s.rbegin(), s.rend()), t = s + "#" + rev;
        vector<int> pi(t.size(), 0);
        for (int i = 1, k = 0; i < (int) t.size(); i++) {
            while (k > 0 && t[i] != t[k]) k = pi[k - 1];
            if (t[i] == t[k]) k++;
            pi[i] = k;
        }
        return rev.substr(0, s.size() - pi.back()) + s;
    }
};`,
          python: r`class Solution:
    def shortestPalindrome(self, s: str) -> str:
        rev = s[::-1]
        t = s + '#' + rev
        pi, k = [0] * len(t), 0
        for i in range(1, len(t)):
            while k and t[i] != t[k]:
                k = pi[k - 1]
            if t[i] == t[k]:
                k += 1
            pi[i] = k
        return rev[:len(s) - pi[-1]] + s`,
          javascript: r`var shortestPalindrome = function(s) {
    const rev = s.split('').reverse().join(''), t = s + '#' + rev, pi = new Array(t.length).fill(0);
    for (let i = 1, k = 0; i < t.length; i++) {
        while (k > 0 && t[i] !== t[k]) k = pi[k - 1];
        if (t[i] === t[k]) k++;
        pi[i] = k;
    }
    return rev.slice(0, s.length - pi[t.length - 1]) + s;
};`,
        },
      },
    ],
  },

  'longest-duplicate-substring': {
    pattern: 'Binary search on the answer length + Rabin–Karp rolling hash',
    approaches: [
      {
        level: 'Brute force', name: 'Every length, longest first, with a set of substrings',
        idea: 'For each length `L` from n − 1 down to 1, put every substring of length `L` in a set; the first repeat found is a longest duplicate.',
        steps: [
          'For `L` from n − 1 down to 1: for each start, add `s[i..i+L)` to a set.',
          'If it was already there, return it.',
          'Return "" if no length repeats.',
        ],
        time: 'O(n³)', space: 'O(n²)',
        why: 'Up to n lengths × n substrings × O(L) to build and hash each.',
        code: {
          java: r`class Solution {
    public String longestDupSubstring(String s) {
        int n = s.length();
        for (int len = n - 1; len > 0; len--) {
            Set<String> seen = new HashSet<>();
            for (int i = 0; i + len <= n; i++) {
                String sub = s.substring(i, i + len);
                if (!seen.add(sub)) return sub;
            }
        }
        return "";
    }
}`,
          cpp: r`class Solution {
public:
    string longestDupSubstring(string s) {
        int n = s.size();
        for (int len = n - 1; len > 0; len--) {
            unordered_set<string> seen;
            for (int i = 0; i + len <= n; i++)
                if (!seen.insert(s.substr(i, len)).second) return s.substr(i, len);
        }
        return "";
    }
};`,
          python: r`class Solution:
    def longestDupSubstring(self, s: str) -> str:
        n = len(s)
        for L in range(n - 1, 0, -1):
            seen = set()
            for i in range(n - L + 1):
                sub = s[i:i + L]
                if sub in seen:
                    return sub
                seen.add(sub)
        return ''`,
          javascript: r`var longestDupSubstring = function(s) {
    const n = s.length;
    for (let len = n - 1; len > 0; len--) {
        const seen = new Set();
        for (let i = 0; i + len <= n; i++) {
            const sub = s.slice(i, i + len);
            if (seen.has(sub)) return sub;
            seen.add(sub);
        }
    }
    return '';
};`,
        },
      },
      {
        level: 'Better', name: 'Binary search on the length, with a set of substrings',
        idea: 'If some substring of length `L` repeats, so does one of length `L − 1` (drop its last letter). That monotonicity lets you binary-search the largest repeating `L`, testing each candidate with a set of substrings.',
        steps: [
          '`lo = 1`, `hi = n − 1`.',
          '`dup(L)`: return the start of a repeated length-`L` substring (using a set), or −1.',
          'If `dup(mid)` succeeds, record it and search longer; otherwise search shorter.',
        ],
        time: 'O(n² log n)', space: 'O(n²)',
        why: 'log n checks, each building n substrings of length up to n.',
        code: {
          java: r`class Solution {
    public String longestDupSubstring(String s) {
        int lo = 1, hi = s.length() - 1, start = -1, len = 0;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, at = dup(s, mid);
            if (at >= 0) { start = at; len = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return start < 0 ? "" : s.substring(start, start + len);
    }

    private int dup(String s, int len) {
        Set<String> seen = new HashSet<>();
        for (int i = 0; i + len <= s.length(); i++)
            if (!seen.add(s.substring(i, i + len))) return i;
        return -1;
    }
}`,
          cpp: r`class Solution {
    int dup(const string& s, int len) {
        unordered_set<string> seen;
        for (int i = 0; i + len <= (int) s.size(); i++)
            if (!seen.insert(s.substr(i, len)).second) return i;
        return -1;
    }
public:
    string longestDupSubstring(string s) {
        int lo = 1, hi = s.size() - 1, start = -1, len = 0;
        while (lo <= hi) {
            int mid = (lo + hi) / 2, at = dup(s, mid);
            if (at >= 0) { start = at; len = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return start < 0 ? "" : s.substr(start, len);
    }
};`,
          python: r`class Solution:
    def longestDupSubstring(self, s: str) -> str:
        def dup(L):
            seen = set()
            for i in range(len(s) - L + 1):
                sub = s[i:i + L]
                if sub in seen:
                    return i
                seen.add(sub)
            return -1
        lo, hi, best = 1, len(s) - 1, ''
        while lo <= hi:
            mid = (lo + hi) // 2
            at = dup(mid)
            if at >= 0:
                best, lo = s[at:at + mid], mid + 1
            else:
                hi = mid - 1
        return best`,
          javascript: r`var longestDupSubstring = function(s) {
    const dup = (len) => {
        const seen = new Set();
        for (let i = 0; i + len <= s.length; i++) {
            const sub = s.slice(i, i + len);
            if (seen.has(sub)) return i;
            seen.add(sub);
        }
        return -1;
    };
    let lo = 1, hi = s.length - 1, best = '';
    while (lo <= hi) {
        const mid = (lo + hi) >> 1, at = dup(mid);
        if (at >= 0) { best = s.slice(at, at + mid); lo = mid + 1; }
        else hi = mid - 1;
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search + Rabin–Karp',
        idea: 'Same binary search, but test a length in O(n) with a rolling hash: slide a window, update its hash in O(1), and look it up in a hash map of starts. Confirm a hash hit by comparing the actual characters.',
        steps: [
          'Binary search the length as before.',
          '`dup(L)`: hash the first window (two moduli), then roll: `h = h·B + s[i] − s[i − L]·B^L`.',
          'If the combined hash was seen before and the two substrings really match, return the current start.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'log n checks of O(n) each (character checks only on hash hits). Two moduli keep false hits negligible, and the direct check means a false hit can never produce a wrong answer.',
        code: {
          java: r`class Solution {
    private static final long M1 = 1_000_000_007L, M2 = 1_000_000_009L, B = 131;

    public String longestDupSubstring(String s) {
        int lo = 1, hi = s.length() - 1, start = -1, len = 0;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, at = dup(s, mid);
            if (at >= 0) { start = at; len = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return start < 0 ? "" : s.substring(start, start + len);
    }

    private int dup(String s, int len) {
        long h1 = 0, h2 = 0, p1 = 1, p2 = 1;
        for (int i = 0; i < len; i++) {
            h1 = (h1 * B + s.charAt(i)) % M1;
            h2 = (h2 * B + s.charAt(i)) % M2;
            p1 = p1 * B % M1;
            p2 = p2 * B % M2;
        }
        Map<Long, Integer> seen = new HashMap<>();
        seen.put(h1 * M2 + h2, 0);
        for (int i = len; i < s.length(); i++) {
            h1 = ((h1 * B + s.charAt(i) - s.charAt(i - len) * p1) % M1 + M1) % M1;
            h2 = ((h2 * B + s.charAt(i) - s.charAt(i - len) * p2) % M2 + M2) % M2;
            int start = i - len + 1;
            Integer prev = seen.putIfAbsent(h1 * M2 + h2, start);
            if (prev != null && s.regionMatches(prev, s, start, len)) return start;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
    static constexpr long long M1 = 1'000'000'007, M2 = 1'000'000'009, B = 131;
    int dup(const string& s, int len) {
        long long h1 = 0, h2 = 0, p1 = 1, p2 = 1;
        for (int i = 0; i < len; i++) {
            h1 = (h1 * B + s[i]) % M1;
            h2 = (h2 * B + s[i]) % M2;
            p1 = p1 * B % M1;
            p2 = p2 * B % M2;
        }
        unordered_map<long long, int> seen;
        seen[h1 * M2 + h2] = 0;
        for (int i = len; i < (int) s.size(); i++) {
            h1 = ((h1 * B + s[i] - s[i - len] * p1) % M1 + M1) % M1;
            h2 = ((h2 * B + s[i] - s[i - len] * p2) % M2 + M2) % M2;
            int start = i - len + 1;
            auto [it, inserted] = seen.emplace(h1 * M2 + h2, start);
            if (!inserted && s.compare(it->second, len, s, start, len) == 0) return start;
        }
        return -1;
    }
public:
    string longestDupSubstring(string s) {
        int lo = 1, hi = s.size() - 1, start = -1, len = 0;
        while (lo <= hi) {
            int mid = (lo + hi) / 2, at = dup(s, mid);
            if (at >= 0) { start = at; len = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return start < 0 ? "" : s.substr(start, len);
    }
};`,
          python: r`class Solution:
    def longestDupSubstring(self, s: str) -> str:
        M, B = (1 << 61) - 1, 131
        codes = [ord(c) for c in s]
        def dup(L):
            h = 0
            for c in codes[:L]:
                h = (h * B + c) % M
            power = pow(B, L, M)
            seen = {h: 0}
            for i in range(L, len(s)):
                h = (h * B + codes[i] - codes[i - L] * power) % M
                start = i - L + 1
                prev = seen.setdefault(h, start)
                if prev != start and s[prev:prev + L] == s[start:start + L]:
                    return start
            return -1
        lo, hi, best = 1, len(s) - 1, ''
        while lo <= hi:
            mid = (lo + hi) // 2
            at = dup(mid)
            if at >= 0:
                best, lo = s[at:at + mid], mid + 1
            else:
                hi = mid - 1
        return best`,
          javascript: r`var longestDupSubstring = function(s) {
    const M1 = 1000000007, M2 = 1000000009, B = 131;
    const dup = (len) => {
        let h1 = 0, h2 = 0, p1 = 1, p2 = 1;
        for (let i = 0; i < len; i++) {
            h1 = (h1 * B + s.charCodeAt(i)) % M1;
            h2 = (h2 * B + s.charCodeAt(i)) % M2;
            p1 = (p1 * B) % M1;
            p2 = (p2 * B) % M2;
        }
        const seen = new Map([[h1 + ',' + h2, 0]]);
        for (let i = len; i < s.length; i++) {
            const add = s.charCodeAt(i), drop = s.charCodeAt(i - len);
            h1 = (((h1 * B + add - drop * p1) % M1) + M1) % M1;
            h2 = (((h2 * B + add - drop * p2) % M2) + M2) % M2;
            const key = h1 + ',' + h2, start = i - len + 1;
            if (!seen.has(key)) seen.set(key, start);
            else if (s.substr(seen.get(key), len) === s.substr(start, len)) return start;
        }
        return -1;
    };
    let lo = 1, hi = s.length - 1, best = '';
    while (lo <= hi) {
        const mid = (lo + hi) >> 1, at = dup(mid);
        if (at >= 0) { best = s.slice(at, at + mid); lo = mid + 1; }
        else hi = mid - 1;
    }
    return best;
};`,
        },
      },
    ],
  },
};
