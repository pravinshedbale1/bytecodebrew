export default [
  {
    slug: 'longest-common-prefix', title: 'Longest Common Prefix', level: 'Easy',
    summary: 'Return the longest prefix shared by every string in the array, or "".',
    method: 'longestCommonPrefix', params: [['String[]', 'strs']], returns: 'String',
    tests: [
      { in: [['flower', 'flow', 'flight']], out: 'fl' },
      { in: [['dog', 'racecar', 'car']], out: '' },
      { in: [['a']] },
      { in: [['', 'b']] },
      { in: [['interview', 'internet', 'interval', 'internal']] },
    ],
    ref: `class Solution {
    public String longestCommonPrefix(String[] strs) {
        String p = strs[0];
        for (String s : strs) while (!s.startsWith(p)) p = p.substring(0, p.length() - 1);
        return p;
    }
}`,
  },
  {
    slug: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)', level: 'Medium',
    summary: 'Build a Trie with insert(word), search(word) (exact match) and startsWith(prefix).',
    design: { cls: 'Trie', ctor: [], methods: [['void', 'insert', [['String', 'word']]], ['boolean', 'search', [['String', 'word']]], ['boolean', 'startsWith', [['String', 'prefix']]]] },
    tests: [
      { in: [['Trie', 'insert', 'search', 'search', 'startsWith', 'insert', 'search'], [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']]], out: [null, null, true, false, true, null, true] },
      { in: [['Trie', 'search', 'startsWith', 'insert', 'startsWith', 'search'], [[], ['a'], ['a'], ['abc'], ['abcd'], ['ab']]] },
      { in: [['Trie', 'insert', 'insert', 'search', 'startsWith', 'search'], [[], ['to'], ['tea'], ['te'], ['te'], ['tea']]] },
    ],
    ref: `class Trie {
    private final Trie[] next = new Trie[26];
    private boolean end;
    public Trie() {}
    public void insert(String word) { Trie t = this; for (char c : word.toCharArray()) { if (t.next[c - 'a'] == null) t.next[c - 'a'] = new Trie(); t = t.next[c - 'a']; } t.end = true; }
    private Trie walk(String s) { Trie t = this; for (char c : s.toCharArray()) { t = t.next[c - 'a']; if (t == null) return null; } return t; }
    public boolean search(String word) { Trie t = walk(word); return t != null && t.end; }
    public boolean startsWith(String prefix) { return walk(prefix) != null; }
}`,
  },
  {
    slug: 'design-add-and-search-words-data-structure', title: 'Design Add and Search Words Data Structure', level: 'Medium',
    summary: 'WordDictionary supports addWord(word) and search(word), where "." in the search word matches any single letter.',
    design: { cls: 'WordDictionary', ctor: [], methods: [['void', 'addWord', [['String', 'word']]], ['boolean', 'search', [['String', 'word']]]] },
    tests: [
      { in: [['WordDictionary', 'addWord', 'addWord', 'addWord', 'search', 'search', 'search', 'search'], [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']]], out: [null, null, null, null, false, true, true, true] },
      { in: [['WordDictionary', 'search', 'addWord', 'search', 'search', 'search'], [[], ['.'], ['a'], ['.'], ['a.'], ['..']]] },
      { in: [['WordDictionary', 'addWord', 'addWord', 'search', 'search', 'search'], [[], ['at'], ['and'], ['a.d'], ['.t'], ['an.']]] },
    ],
    ref: `class WordDictionary {
    private final WordDictionary[] next = new WordDictionary[26];
    private boolean end;
    public WordDictionary() {}
    public void addWord(String word) { WordDictionary t = this; for (char c : word.toCharArray()) { if (t.next[c - 'a'] == null) t.next[c - 'a'] = new WordDictionary(); t = t.next[c - 'a']; } t.end = true; }
    public boolean search(String word) { return find(word, 0); }
    private boolean find(String w, int i) {
        if (i == w.length()) return end;
        char c = w.charAt(i);
        if (c != '.') return next[c - 'a'] != null && next[c - 'a'].find(w, i + 1);
        for (WordDictionary n : next) if (n != null && n.find(w, i + 1)) return true;
        return false;
    }
}`,
  },
  {
    slug: 'replace-words', title: 'Replace Words', level: 'Medium',
    summary: 'Replace every word in the sentence that starts with a dictionary root by the shortest such root, and return the sentence.',
    method: 'replaceWords', params: [['List<String>', 'dictionary'], ['String', 'sentence']], returns: 'String',
    tests: [
      { in: [['cat', 'bat', 'rat'], 'the cattle was rattled by the battery'], out: 'the cat was rat by the bat' },
      { in: [['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs'], out: 'a a b c' },
      { in: [['xyz'], 'hello world'] },
      { in: [['ab', 'a', 'abc'], 'abcd ab a'] },
    ],
    ref: `class Solution {
    public String replaceWords(List<String> dictionary, String sentence) {
        Set<String> roots = new HashSet<>(dictionary);
        StringBuilder sb = new StringBuilder();
        for (String w : sentence.split(" ")) {
            String rep = w;
            for (int i = 1; i <= w.length(); i++) if (roots.contains(w.substring(0, i))) { rep = w.substring(0, i); break; }
            if (sb.length() > 0) sb.append(' ');
            sb.append(rep);
        }
        return sb.toString();
    }
}`,
  },
  {
    slug: 'search-suggestions-system', title: 'Search Suggestions System', level: 'Medium',
    summary: 'After each character of searchWord is typed, return up to three products (lexicographically smallest first) that start with the typed prefix.',
    method: 'suggestedProducts', params: [['String[]', 'products'], ['String', 'searchWord']], returns: 'List<List<String>>',
    tests: [
      { in: [['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse'], out: [['mobile', 'moneypot', 'monitor'], ['mobile', 'moneypot', 'monitor'], ['mouse', 'mousepad'], ['mouse', 'mousepad'], ['mouse', 'mousepad']] },
      { in: [['havana'], 'havana'], out: [['havana'], ['havana'], ['havana'], ['havana'], ['havana'], ['havana']] },
      { in: [['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags'] },
      { in: [['apple'], 'xy'] },
    ],
    ref: `class Solution {
    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        Arrays.sort(products);
        List<List<String>> out = new ArrayList<>();
        String prefix = "";
        for (char c : searchWord.toCharArray()) {
            prefix += c;
            List<String> list = new ArrayList<>();
            int i = lower(products, prefix);
            for (int j = i; j < products.length && list.size() < 3 && products[j].startsWith(prefix); j++) list.add(products[j]);
            out.add(list);
        }
        return out;
    }
    private int lower(String[] a, String t) { int lo = 0, hi = a.length; while (lo < hi) { int m = (lo + hi) >>> 1; if (a[m].compareTo(t) >= 0) hi = m; else lo = m + 1; } return lo; }
}`,
  },
  {
    slug: 'maximum-xor-of-two-numbers-in-an-array', title: 'Maximum XOR of Two Numbers in an Array', level: 'Medium',
    summary: 'Return the maximum of nums[i] XOR nums[j] over all pairs (i may equal j) — in O(n) with a bitwise trie.',
    method: 'findMaximumXOR', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[3, 10, 5, 25, 2, 8]], out: 28 },
      { in: [[14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]], out: 127 },
      { in: [[0]] },
      { in: [[8, 10, 2]] },
      { in: [[2147483647, 0]] },
    ],
    ref: `class Solution {
    public int findMaximumXOR(int[] nums) {
        int[][] trie = new int[nums.length * 31 + 1][2];
        int size = 1, best = 0;
        for (int x : nums) {
            int t = 0;
            for (int b = 30; b >= 0; b--) { int bit = (x >> b) & 1; if (trie[t][bit] == 0) trie[t][bit] = size++; t = trie[t][bit]; }
            t = 0; int cur = 0;
            for (int b = 30; b >= 0; b--) {
                int want = ((x >> b) & 1) ^ 1;
                if (trie[t][want] != 0) { cur |= 1 << b; t = trie[t][want]; } else t = trie[t][want ^ 1];
            }
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
  },
  {
    slug: 'word-search-ii', title: 'Word Search II', level: 'Hard',
    summary: 'Return every word from the list that can be traced on the letter grid through horizontally or vertically adjacent cells, using each cell at most once per word. Any order.',
    method: 'findWords', params: [['char[][]', 'board'], ['String[]', 'words']], returns: 'List<String>', check: 'any-order',
    tests: [
      { in: [[['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']], ['oath', 'pea', 'eat', 'rain']], out: ['eat', 'oath'] },
      { in: [[['a', 'b'], ['c', 'd']], ['abcb']], out: [] },
      { in: [[['a']], ['a', 'aa']] },
      { in: [[['a', 'b'], ['c', 'd']], ['ab', 'cb', 'ad', 'bd', 'ac', 'ca', 'da', 'bc', 'db', 'adcb', 'dabc', 'abb', 'acb']] },
    ],
    ref: `class Solution {
    private static class Node { Node[] next = new Node[26]; String word; }
    public List<String> findWords(char[][] board, String[] words) {
        Node root = new Node();
        for (String w : words) { Node t = root; for (char c : w.toCharArray()) { if (t.next[c - 'a'] == null) t.next[c - 'a'] = new Node(); t = t.next[c - 'a']; } t.word = w; }
        List<String> out = new ArrayList<>();
        for (int i = 0; i < board.length; i++) for (int j = 0; j < board[0].length; j++) dfs(board, i, j, root, out);
        return out;
    }
    private void dfs(char[][] b, int i, int j, Node t, List<String> out) {
        if (i < 0 || j < 0 || i >= b.length || j >= b[0].length || b[i][j] == '#') return;
        char c = b[i][j];
        Node n = t.next[c - 'a'];
        if (n == null) return;
        if (n.word != null) { out.add(n.word); n.word = null; }
        b[i][j] = '#';
        dfs(b, i + 1, j, n, out); dfs(b, i - 1, j, n, out); dfs(b, i, j + 1, n, out); dfs(b, i, j - 1, n, out);
        b[i][j] = c;
    }
}`,
  },
];
