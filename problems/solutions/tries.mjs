const r = String.raw;

export default {
  'longest-common-prefix': {
    pattern: 'Character-by-character comparison (vertical scan); a trie generalises it',
    approaches: [
      {
        level: 'Better', name: 'Horizontal scan: shrink the prefix word by word',
        idea: 'Start with the first word as the candidate prefix. For each next word, cut the candidate back until the word starts with it.',
        steps: [
          'Set `prefix = strs[0]`.',
          'For each other word, while it does not start with `prefix`, drop the last character of `prefix`.',
          'Return `prefix` (possibly empty).',
        ],
        time: 'O(S)', space: 'O(1)',
        why: 'S is the total number of characters: each comparison is bounded by the word length, and the prefix only shrinks. It still compares whole prefixes for every word even if the first word is long.',
        code: {
          java: r`class Solution {
    public String longestCommonPrefix(String[] strs) {
        String prefix = strs[0];
        for (String w : strs)
            while (!w.startsWith(prefix)) prefix = prefix.substring(0, prefix.length() - 1);
        return prefix;
    }
}`,
          cpp: r`class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        string prefix = strs[0];
        for (auto& w : strs)
            while (w.compare(0, prefix.size(), prefix) != 0) prefix.pop_back();
        return prefix;
    }
};`,
          python: r`class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        prefix = strs[0]
        for w in strs:
            while not w.startswith(prefix):
                prefix = prefix[:-1]
        return prefix`,
          javascript: r`var longestCommonPrefix = function(strs) {
    let prefix = strs[0];
    for (const w of strs)
        while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
    return prefix;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Vertical scan: compare column by column',
        idea: 'Check position 0 of every word, then position 1, and so on. Stop at the first position where some word ends or disagrees with the first word.',
        steps: [
          'For each index `i` of the first word:',
          'If any word has length `i` or a different character at `i`, return `strs[0][0..i)`.',
          'If the loop finishes, the whole first word is the prefix.',
        ],
        time: 'O(n·m)', space: 'O(1)',
        why: 'n words × (m + 1) positions, where m is the answer\'s length: it never reads past the first mismatch.',
        code: {
          java: r`class Solution {
    public String longestCommonPrefix(String[] strs) {
        String first = strs[0];
        for (int i = 0; i < first.length(); i++)
            for (String w : strs)
                if (i == w.length() || w.charAt(i) != first.charAt(i)) return first.substring(0, i);
        return first;
    }
}`,
          cpp: r`class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        const string& first = strs[0];
        for (size_t i = 0; i < first.size(); i++)
            for (auto& w : strs)
                if (i == w.size() || w[i] != first[i]) return first.substr(0, i);
        return first;
    }
};`,
          python: r`class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        first = strs[0]
        for i, c in enumerate(first):
            for w in strs:
                if i == len(w) or w[i] != c:
                    return first[:i]
        return first`,
          javascript: r`var longestCommonPrefix = function(strs) {
    const first = strs[0];
    for (let i = 0; i < first.length; i++)
        for (const w of strs)
            if (i === w.length || w[i] !== first[i]) return first.slice(0, i);
    return first;
};`,
        },
      },
    ],
  },

  'implement-trie-prefix-tree': {
    pattern: 'Trie: one node per prefix, children indexed by letter, an end-of-word flag',
    approaches: [
      {
        level: 'Brute force', name: 'A set of words, scanning it for prefixes',
        idea: 'Store every inserted word in a hash set. Exact search is a set lookup; `startsWith` checks every stored word.',
        steps: [
          '`insert`: add the word to the set.',
          '`search`: return whether the set contains it.',
          '`startsWith`: return whether any word in the set starts with the prefix.',
        ],
        time: 'O(N·L) per startsWith', space: 'O(N·L)',
        why: '`insert` and `search` cost O(L) to hash the word, but `startsWith` scans all N words. Storage is every word in full.',
        code: {
          java: r`class Trie {
    private final Set<String> words = new HashSet<>();

    public Trie() {
    }

    public void insert(String word) {
        words.add(word);
    }

    public boolean search(String word) {
        return words.contains(word);
    }

    public boolean startsWith(String prefix) {
        for (String w : words) if (w.startsWith(prefix)) return true;
        return false;
    }
}`,
          cpp: r`class Trie {
    unordered_set<string> words;
public:
    Trie() {}

    void insert(string word) {
        words.insert(word);
    }

    bool search(string word) {
        return words.count(word) > 0;
    }

    bool startsWith(string prefix) {
        for (auto& w : words) if (w.compare(0, prefix.size(), prefix) == 0) return true;
        return false;
    }
};`,
          python: r`class Trie:

    def __init__(self):
        self.words = set()

    def insert(self, word: str) -> None:
        self.words.add(word)

    def search(self, word: str) -> bool:
        return word in self.words

    def startsWith(self, prefix: str) -> bool:
        return any(w.startswith(prefix) for w in self.words)`,
          javascript: r`var Trie = function() {
    this.words = new Set();
};

Trie.prototype.insert = function(word) {
    this.words.add(word);
};

Trie.prototype.search = function(word) {
    return this.words.has(word);
};

Trie.prototype.startsWith = function(prefix) {
    for (const w of this.words) if (w.startsWith(prefix)) return true;
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Trie of 26-way nodes',
        idea: 'Each node represents a prefix and has up to 26 children, one per next letter; a flag marks nodes where a full word ends. Every operation walks one path of length L.',
        steps: [
          '`insert`: from the root, follow (creating if missing) the child for each letter; mark the last node as a word end.',
          '`search`: follow the letters; fail on a missing child; succeed only if the last node is a word end.',
          '`startsWith`: follow the letters; succeed if the walk completes.',
        ],
        time: 'O(L) per operation', space: 'O(T·26)',
        why: 'Each call touches one node per character. T is the total number of trie nodes (at most the total length of inserted words), each with 26 child slots.',
        code: {
          java: r`class Trie {
    private static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    public Trie() {
    }

    public void insert(String word) {
        Node node = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (node.next[c] == null) node.next[c] = new Node();
            node = node.next[c];
        }
        node.end = true;
    }

    public boolean search(String word) {
        Node node = walk(word);
        return node != null && node.end;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        Node node = root;
        for (int i = 0; i < s.length() && node != null; i++) node = node.next[s.charAt(i) - 'a'];
        return node;
    }
}`,
          cpp: r`class Trie {
    struct Node {
        Node* next[26] = {};
        bool end = false;
    };
    Node* root = new Node();
    Node* walk(const string& s) {
        Node* node = root;
        for (char c : s) {
            node = node->next[c - 'a'];
            if (!node) return nullptr;
        }
        return node;
    }
public:
    Trie() {}

    void insert(string word) {
        Node* node = root;
        for (char c : word) {
            if (!node->next[c - 'a']) node->next[c - 'a'] = new Node();
            node = node->next[c - 'a'];
        }
        node->end = true;
    }

    bool search(string word) {
        Node* node = walk(word);
        return node && node->end;
    }

    bool startsWith(string prefix) {
        return walk(prefix) != nullptr;
    }
};`,
          python: r`class Trie:

    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node["$"] = True  # end-of-word marker

    def _walk(self, s):
        node = self.root
        for c in s:
            if c not in node:
                return None
            node = node[c]
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and "$" in node

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None`,
          javascript: r`var Trie = function() {
    this.root = { next: {}, end: false };
};

Trie.prototype.insert = function(word) {
    let node = this.root;
    for (const c of word) {
        if (!node.next[c]) node.next[c] = { next: {}, end: false };
        node = node.next[c];
    }
    node.end = true;
};

Trie.prototype.walk = function(s) {
    let node = this.root;
    for (const c of s) {
        node = node.next[c];
        if (!node) return null;
    }
    return node;
};

Trie.prototype.search = function(word) {
    const node = this.walk(word);
    return node !== null && node.end;
};

Trie.prototype.startsWith = function(prefix) {
    return this.walk(prefix) !== null;
};`,
        },
      },
    ],
  },

  'design-add-and-search-words-data-structure': {
    pattern: 'Trie + DFS that branches on wildcards',
    approaches: [
      {
        level: 'Brute force', name: 'Compare the pattern with every stored word',
        idea: 'Keep a list of words. A pattern matches a word of the same length if every non-dot character is equal.',
        steps: [
          '`addWord`: append to the list.',
          '`search`: for each stored word of the same length, compare position by position (a `.` matches anything); return true on the first match.',
        ],
        time: 'O(N·L) per search', space: 'O(N·L)',
        why: 'Every search looks at all N words of up to L letters.',
        code: {
          java: r`class WordDictionary {
    private final List<String> words = new ArrayList<>();

    public WordDictionary() {
    }

    public void addWord(String word) {
        words.add(word);
    }

    public boolean search(String word) {
        for (String w : words) {
            if (w.length() != word.length()) continue;
            int i = 0;
            while (i < w.length() && (word.charAt(i) == '.' || word.charAt(i) == w.charAt(i))) i++;
            if (i == w.length()) return true;
        }
        return false;
    }
}`,
          cpp: r`class WordDictionary {
    vector<string> words;
public:
    WordDictionary() {}

    void addWord(string word) {
        words.push_back(word);
    }

    bool search(string word) {
        for (auto& w : words) {
            if (w.size() != word.size()) continue;
            size_t i = 0;
            while (i < w.size() && (word[i] == '.' || word[i] == w[i])) i++;
            if (i == w.size()) return true;
        }
        return false;
    }
};`,
          python: r`class WordDictionary:

    def __init__(self):
        self.words = []

    def addWord(self, word: str) -> None:
        self.words.append(word)

    def search(self, word: str) -> bool:
        return any(
            len(w) == len(word) and all(p == "." or p == c for p, c in zip(word, w))
            for w in self.words
        )`,
          javascript: r`var WordDictionary = function() {
    this.words = [];
};

WordDictionary.prototype.addWord = function(word) {
    this.words.push(word);
};

WordDictionary.prototype.search = function(word) {
    return this.words.some((w) => w.length === word.length && [...word].every((p, i) => p === '.' || p === w[i]));
};`,
        },
      },
      {
        level: 'Optimal', name: 'Trie with DFS on dots',
        idea: 'Store the words in a trie. Searching follows a single child for each letter; a `.` tries every existing child. The trie shares prefixes, so most branches die out quickly.',
        steps: [
          '`addWord`: insert into the trie and mark the end node.',
          '`search(node, i)`: if `i == word.length`, return whether `node` ends a word.',
          'If `word[i]` is a letter, continue in that child (fail if missing); if it is `.`, return true if any child succeeds.',
        ],
        time: 'O(L) add, O(26ᵈ·L) search', space: 'O(T·26)',
        why: 'With d dots (at most 2 here) a search explores up to 26ᵈ branches of length L; without dots it is a single O(L) path. T is the number of trie nodes.',
        code: {
          java: r`class WordDictionary {
    private static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    public WordDictionary() {
    }

    public void addWord(String word) {
        Node node = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (node.next[c] == null) node.next[c] = new Node();
            node = node.next[c];
        }
        node.end = true;
    }

    public boolean search(String word) {
        return dfs(root, word, 0);
    }

    private boolean dfs(Node node, String word, int i) {
        if (i == word.length()) return node.end;
        char c = word.charAt(i);
        if (c != '.') {
            Node child = node.next[c - 'a'];
            return child != null && dfs(child, word, i + 1);
        }
        for (Node child : node.next)
            if (child != null && dfs(child, word, i + 1)) return true;
        return false;
    }
}`,
          cpp: r`class WordDictionary {
    struct Node {
        Node* next[26] = {};
        bool end = false;
    };
    Node* root = new Node();
    bool dfs(Node* node, const string& word, size_t i) {
        if (i == word.size()) return node->end;
        if (word[i] != '.') {
            Node* child = node->next[word[i] - 'a'];
            return child && dfs(child, word, i + 1);
        }
        for (Node* child : node->next)
            if (child && dfs(child, word, i + 1)) return true;
        return false;
    }
public:
    WordDictionary() {}

    void addWord(string word) {
        Node* node = root;
        for (char c : word) {
            if (!node->next[c - 'a']) node->next[c - 'a'] = new Node();
            node = node->next[c - 'a'];
        }
        node->end = true;
    }

    bool search(string word) {
        return dfs(root, word, 0);
    }
};`,
          python: r`class WordDictionary:

    def __init__(self):
        self.root = {}

    def addWord(self, word: str) -> None:
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node["$"] = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            c = word[i]
            if c != ".":
                return c in node and dfs(node[c], i + 1)
            return any(dfs(child, i + 1) for key, child in node.items() if key != "$")
        return dfs(self.root, 0)`,
          javascript: r`var WordDictionary = function() {
    this.root = { next: {}, end: false };
};

WordDictionary.prototype.addWord = function(word) {
    let node = this.root;
    for (const c of word) {
        if (!node.next[c]) node.next[c] = { next: {}, end: false };
        node = node.next[c];
    }
    node.end = true;
};

WordDictionary.prototype.search = function(word) {
    const dfs = (node, i) => {
        if (i === word.length) return node.end;
        const c = word[i];
        if (c !== '.') return Boolean(node.next[c]) && dfs(node.next[c], i + 1);
        return Object.values(node.next).some((child) => dfs(child, i + 1));
    };
    return dfs(this.root, 0);
};`,
        },
      },
    ],
  },

  'replace-words': {
    pattern: 'Trie of roots; for each word, walk until the first root ends',
    approaches: [
      {
        level: 'Brute force', name: 'Try every root against every word',
        idea: 'For each word in the sentence, check every root; among the roots the word starts with, keep the shortest.',
        steps: [
          'Split the sentence into words.',
          'For each word, scan all roots and keep the shortest one the word starts with.',
          'Replace the word with it (if any) and join the words with spaces.',
        ],
        time: 'O(W·D·L)', space: 'O(n)',
        why: 'W words × D roots, each prefix check up to L characters. The split words take O(n) for a sentence of n characters.',
        code: {
          java: r`class Solution {
    public String replaceWords(List<String> dictionary, String sentence) {
        String[] words = sentence.split(" ");
        for (int i = 0; i < words.length; i++) {
            String best = words[i];
            for (String root : dictionary)
                if (words[i].startsWith(root) && root.length() < best.length()) best = root;
            words[i] = best;
        }
        return String.join(" ", words);
    }
}`,
          cpp: r`class Solution {
public:
    string replaceWords(vector<string>& dictionary, string sentence) {
        stringstream ss(sentence);
        string word, out;
        while (ss >> word) {
            string best = word;
            for (auto& root : dictionary)
                if (word.compare(0, root.size(), root) == 0 && root.size() < best.size()) best = root;
            if (!out.empty()) out += ' ';
            out += best;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def replaceWords(self, dictionary: List[str], sentence: str) -> str:
        def replace(word):
            roots = [root for root in dictionary if word.startswith(root)]
            return min(roots, key=len) if roots else word
        return " ".join(replace(w) for w in sentence.split(" "))`,
          javascript: r`var replaceWords = function(dictionary, sentence) {
    return sentence.split(' ').map((word) => {
        let best = word;
        for (const root of dictionary)
            if (word.startsWith(root) && root.length < best.length) best = root;
        return best;
    }).join(' ');
};`,
        },
      },
      {
        level: 'Better', name: 'Hash set of roots, try each prefix length',
        idea: 'Put the roots in a set. For each word, test its prefixes from shortest to longest; the first one in the set is the shortest root.',
        steps: [
          'Add all roots to a hash set.',
          'For each word, for `len = 1 .. word.length`, if `word[0..len)` is in the set, use it and stop.',
          'Join the results with spaces.',
        ],
        time: 'O(W·L²)', space: 'O(D·L + n)',
        why: 'Each word tries up to L prefixes, and building/hashing each prefix costs O(L). No dependence on the number of roots per lookup.',
        code: {
          java: r`class Solution {
    public String replaceWords(List<String> dictionary, String sentence) {
        Set<String> roots = new HashSet<>(dictionary);
        String[] words = sentence.split(" ");
        for (int i = 0; i < words.length; i++)
            for (int len = 1; len <= words[i].length(); len++)
                if (roots.contains(words[i].substring(0, len))) { words[i] = words[i].substring(0, len); break; }
        return String.join(" ", words);
    }
}`,
          cpp: r`class Solution {
public:
    string replaceWords(vector<string>& dictionary, string sentence) {
        unordered_set<string> roots(dictionary.begin(), dictionary.end());
        stringstream ss(sentence);
        string word, out;
        while (ss >> word) {
            for (size_t len = 1; len <= word.size(); len++)
                if (roots.count(word.substr(0, len))) { word = word.substr(0, len); break; }
            if (!out.empty()) out += ' ';
            out += word;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def replaceWords(self, dictionary: List[str], sentence: str) -> str:
        roots = set(dictionary)
        def replace(word):
            for length in range(1, len(word) + 1):
                if word[:length] in roots:
                    return word[:length]
            return word
        return " ".join(replace(w) for w in sentence.split(" "))`,
          javascript: r`var replaceWords = function(dictionary, sentence) {
    const roots = new Set(dictionary);
    return sentence.split(' ').map((word) => {
        for (let len = 1; len <= word.length; len++)
            if (roots.has(word.slice(0, len))) return word.slice(0, len);
        return word;
    }).join(' ');
};`,
        },
      },
      {
        level: 'Optimal', name: 'Trie of roots',
        idea: 'Insert the roots into a trie. For each word, walk the trie letter by letter; the first node that ends a root gives the shortest root. If the walk breaks off first, keep the word.',
        steps: [
          'Insert every root into a trie, marking end nodes.',
          'For each word, walk from the trie root; if a node marks a root end, replace the word with the prefix walked so far.',
          'If a letter has no child, stop and keep the word. Join with spaces.',
        ],
        time: 'O(D·L + n)', space: 'O(D·L·26)',
        why: 'Building the trie costs the total root length; each character of the sentence is looked at at most once. The trie has at most D·L nodes.',
        code: {
          java: r`class Solution {
    private static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    public String replaceWords(List<String> dictionary, String sentence) {
        Node trie = new Node();
        for (String root : dictionary) {
            Node node = trie;
            for (char c : root.toCharArray()) {
                if (node.next[c - 'a'] == null) node.next[c - 'a'] = new Node();
                node = node.next[c - 'a'];
            }
            node.end = true;
        }
        String[] words = sentence.split(" ");
        for (int i = 0; i < words.length; i++) {
            Node node = trie;
            for (int k = 0; k < words[i].length(); k++) {
                node = node.next[words[i].charAt(k) - 'a'];
                if (node == null) break;
                if (node.end) { words[i] = words[i].substring(0, k + 1); break; }
            }
        }
        return String.join(" ", words);
    }
}`,
          cpp: r`class Solution {
    struct Node {
        Node* next[26] = {};
        bool end = false;
    };
public:
    string replaceWords(vector<string>& dictionary, string sentence) {
        Node* trie = new Node();
        for (auto& root : dictionary) {
            Node* node = trie;
            for (char c : root) {
                if (!node->next[c - 'a']) node->next[c - 'a'] = new Node();
                node = node->next[c - 'a'];
            }
            node->end = true;
        }
        stringstream ss(sentence);
        string word, out;
        while (ss >> word) {
            Node* node = trie;
            for (size_t k = 0; k < word.size(); k++) {
                node = node->next[word[k] - 'a'];
                if (!node) break;
                if (node->end) { word = word.substr(0, k + 1); break; }
            }
            if (!out.empty()) out += ' ';
            out += word;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def replaceWords(self, dictionary: List[str], sentence: str) -> str:
        trie = {}
        for root in dictionary:
            node = trie
            for c in root:
                node = node.setdefault(c, {})
            node["$"] = True
        def replace(word):
            node = trie
            for k, c in enumerate(word):
                if c not in node:
                    break
                node = node[c]
                if "$" in node:
                    return word[:k + 1]
            return word
        return " ".join(replace(w) for w in sentence.split(" "))`,
          javascript: r`var replaceWords = function(dictionary, sentence) {
    const trie = {};
    for (const root of dictionary) {
        let node = trie;
        for (const c of root) node = node[c] ??= {};
        node.$ = true;
    }
    return sentence.split(' ').map((word) => {
        let node = trie;
        for (let k = 0; k < word.length; k++) {
            node = node[word[k]];
            if (!node) break;
            if (node.$) return word.slice(0, k + 1);
        }
        return word;
    }).join(' ');
};`,
        },
      },
    ],
  },

  'search-suggestions-system': {
    pattern: 'Sort + binary search on each prefix (or a trie that stores the top 3 per node)',
    approaches: [
      {
        level: 'Brute force', name: 'Filter and sort for every typed prefix',
        idea: 'After each character, collect every product with that prefix, sort them, and keep the first three.',
        steps: [
          'For each prefix `searchWord[0..i]`:',
          'Collect the products that start with it, sort them, and take up to three.',
          'Append that list to the answer.',
        ],
        time: 'O(m·n·L log n)', space: 'O(n)',
        why: 'm prefixes; each filters n products (O(L) per check) and sorts the matches. The match list can hold n products.',
        code: {
          java: r`class Solution {
    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        List<List<String>> out = new ArrayList<>();
        for (int i = 1; i <= searchWord.length(); i++) {
            String prefix = searchWord.substring(0, i);
            List<String> match = new ArrayList<>();
            for (String p : products) if (p.startsWith(prefix)) match.add(p);
            Collections.sort(match);
            out.add(match.subList(0, Math.min(3, match.size())));
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
        vector<vector<string>> out;
        for (size_t i = 1; i <= searchWord.size(); i++) {
            string prefix = searchWord.substr(0, i);
            vector<string> match;
            for (auto& p : products) if (p.compare(0, prefix.size(), prefix) == 0) match.push_back(p);
            sort(match.begin(), match.end());
            if (match.size() > 3) match.resize(3);
            out.push_back(match);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        out = []
        for i in range(1, len(searchWord) + 1):
            prefix = searchWord[:i]
            out.append(sorted(p for p in products if p.startswith(prefix))[:3])
        return out`,
          javascript: r`var suggestedProducts = function(products, searchWord) {
    const out = [];
    for (let i = 1; i <= searchWord.length; i++) {
        const prefix = searchWord.slice(0, i);
        out.push(products.filter((p) => p.startsWith(prefix)).sort().slice(0, 3));
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort once, binary search each prefix',
        idea: 'In sorted order, all products with a given prefix form one contiguous block, starting at the first product `>=` the prefix. Binary search that position and take up to three products from there that still have the prefix.',
        steps: [
          'Sort `products`.',
          'For each prefix, binary search the first index `i` with `products[i] >= prefix`.',
          'Take `products[i], products[i + 1], products[i + 2]` while they exist and start with the prefix.',
        ],
        time: 'O(n log n·L + m·L log n)', space: 'O(1)',
        why: 'One sort (string comparisons cost up to O(L)), then one binary search of O(log n) comparisons per typed character (the answer itself aside).',
        code: {
          java: r`class Solution {
    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        Arrays.sort(products);
        List<List<String>> out = new ArrayList<>();
        for (int len = 1; len <= searchWord.length(); len++) {
            String prefix = searchWord.substring(0, len);
            int lo = 0, hi = products.length;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (products[mid].compareTo(prefix) < 0) lo = mid + 1; else hi = mid;
            }
            List<String> match = new ArrayList<>();
            for (int i = lo; i < Math.min(lo + 3, products.length) && products[i].startsWith(prefix); i++) match.add(products[i]);
            out.add(match);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
        sort(products.begin(), products.end());
        vector<vector<string>> out;
        string prefix;
        for (char c : searchWord) {
            prefix += c;
            auto it = lower_bound(products.begin(), products.end(), prefix);
            vector<string> match;
            for (int k = 0; k < 3 && it != products.end() && it->compare(0, prefix.size(), prefix) == 0; k++, it++)
                match.push_back(*it);
            out.push_back(match);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        products.sort()
        out = []
        for i in range(1, len(searchWord) + 1):
            prefix = searchWord[:i]
            start = bisect_left(products, prefix)
            out.append([p for p in products[start:start + 3] if p.startswith(prefix)])
        return out`,
          javascript: r`var suggestedProducts = function(products, searchWord) {
    products.sort();
    const out = [];
    for (let len = 1; len <= searchWord.length; len++) {
        const prefix = searchWord.slice(0, len);
        let lo = 0, hi = products.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (products[mid] < prefix) lo = mid + 1; else hi = mid;
        }
        const match = [];
        for (let i = lo; i < Math.min(lo + 3, products.length) && products[i].startsWith(prefix); i++) match.push(products[i]);
        out.push(match);
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Trie keeping the first three words at each node',
        idea: 'Insert the products in sorted order into a trie, and let every node remember the first three products that pass through it. Typing then just walks down the trie, reading each node\'s list.',
        steps: [
          'Sort `products`. Insert each one; at every node on its path, append it to the node\'s list if the list has fewer than 3 entries.',
          'Walk the trie along `searchWord`; after each character, output the current node\'s list.',
          'Once a character has no child, output empty lists for the rest.',
        ],
        time: 'O(n log n·L + S)', space: 'O(S)',
        why: 'S is the total length of all products: building the trie is linear in it, and each typed character is O(1) plus copying three words. Memory is the trie itself.',
        code: {
          java: r`class Solution {
    private static class Node {
        Node[] next = new Node[26];
        List<String> top = new ArrayList<>();
    }

    public List<List<String>> suggestedProducts(String[] products, String searchWord) {
        Arrays.sort(products);
        Node root = new Node();
        for (String p : products) {
            Node node = root;
            for (char c : p.toCharArray()) {
                if (node.next[c - 'a'] == null) node.next[c - 'a'] = new Node();
                node = node.next[c - 'a'];
                if (node.top.size() < 3) node.top.add(p);
            }
        }
        List<List<String>> out = new ArrayList<>();
        Node node = root;
        for (char c : searchWord.toCharArray()) {
            node = node == null ? null : node.next[c - 'a'];
            out.add(node == null ? new ArrayList<>() : node.top);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
    struct Node {
        Node* next[26] = {};
        vector<string> top;
    };
public:
    vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
        sort(products.begin(), products.end());
        Node* root = new Node();
        for (auto& p : products) {
            Node* node = root;
            for (char c : p) {
                if (!node->next[c - 'a']) node->next[c - 'a'] = new Node();
                node = node->next[c - 'a'];
                if (node->top.size() < 3) node->top.push_back(p);
            }
        }
        vector<vector<string>> out;
        Node* node = root;
        for (char c : searchWord) {
            node = node ? node->next[c - 'a'] : nullptr;
            out.push_back(node ? node->top : vector<string>{});
        }
        return out;
    }
};`,
          python: r`class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        root = {}
        for p in sorted(products):
            node = root
            for c in p:
                node = node.setdefault(c, {"#": []})
                if len(node["#"]) < 3:
                    node["#"].append(p)
        out, node = [], root
        for c in searchWord:
            node = node.get(c) if node is not None else None
            out.append(node["#"] if node is not None else [])
        return out`,
          javascript: r`var suggestedProducts = function(products, searchWord) {
    products.sort();
    const root = { next: {}, top: [] };
    for (const p of products) {
        let node = root;
        for (const c of p) {
            node = node.next[c] ??= { next: {}, top: [] };
            if (node.top.length < 3) node.top.push(p);
        }
    }
    const out = [];
    let node = root;
    for (const c of searchWord) {
        node = node ? node.next[c] : undefined;
        out.push(node ? node.top : []);
    }
    return out;
};`,
        },
      },
    ],
  },

  'maximum-xor-of-two-numbers-in-an-array': {
    pattern: 'Binary trie of bits, greedily choosing the opposite bit from the top',
    approaches: [
      {
        level: 'Brute force', name: 'XOR every pair',
        idea: 'Compute `nums[i] ^ nums[j]` for every pair and keep the largest.',
        steps: [
          'Set `best = 0`.',
          'For every `i <= j`, update `best` with `nums[i] ^ nums[j]`.',
          'Return `best`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About n²/2 pairs: 2 × 10¹⁰ for n = 2 × 10⁵.',
        code: {
          java: r`class Solution {
    public int findMaximumXOR(int[] nums) {
        int best = 0;
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++) best = Math.max(best, nums[i] ^ nums[j]);
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int findMaximumXOR(vector<int>& nums) {
        int best = 0, n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) best = max(best, nums[i] ^ nums[j]);
        return best;
    }
};`,
          python: r`class Solution:
    def findMaximumXOR(self, nums: List[int]) -> int:
        best = 0
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                best = max(best, nums[i] ^ nums[j])
        return best`,
          javascript: r`var findMaximumXOR = function(nums) {
    let best = 0;
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++) best = Math.max(best, nums[i] ^ nums[j]);
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary trie, opposite bit first',
        idea: 'A higher bit is worth more than all lower bits together, so for each number choose, from bit 30 down, the partner bit that differs from its own whenever some stored number has it. Store the numbers in a trie keyed by bits (highest first) to make that choice in O(1) per bit.',
        steps: [
          'Insert every number into a binary trie, bit 30 first.',
          'For each number `x`, walk the trie from the top: at bit `b`, prefer the child for `1 − bit(x, b)`; if it exists, add `1 << b` to the XOR and go there, else take the other child.',
          'The best XOR over all `x` is the answer.',
        ],
        time: 'O(n·31)', space: 'O(n·31)',
        why: 'Each insert and each query walks 31 levels. The trie has at most 31 nodes per number.',
        code: {
          java: r`class Solution {
    public int findMaximumXOR(int[] nums) {
        int[][] child = new int[nums.length * 31 + 1][2];
        int count = 1;
        for (int x : nums) {
            int node = 0;
            for (int b = 30; b >= 0; b--) {
                int bit = (x >> b) & 1;
                if (child[node][bit] == 0) child[node][bit] = count++;
                node = child[node][bit];
            }
        }
        int best = 0;
        for (int x : nums) {
            int node = 0, xor = 0;
            for (int b = 30; b >= 0; b--) {
                int want = ((x >> b) & 1) ^ 1;
                if (child[node][want] != 0) { xor |= 1 << b; node = child[node][want]; }
                else node = child[node][want ^ 1];
            }
            best = Math.max(best, xor);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int findMaximumXOR(vector<int>& nums) {
        vector<array<int, 2>> child(nums.size() * 31 + 1, {0, 0});
        int count = 1;
        for (int x : nums) {
            int node = 0;
            for (int b = 30; b >= 0; b--) {
                int bit = (x >> b) & 1;
                if (!child[node][bit]) child[node][bit] = count++;
                node = child[node][bit];
            }
        }
        int best = 0;
        for (int x : nums) {
            int node = 0, xr = 0;
            for (int b = 30; b >= 0; b--) {
                int want = ((x >> b) & 1) ^ 1;
                if (child[node][want]) { xr |= 1 << b; node = child[node][want]; }
                else node = child[node][want ^ 1];
            }
            best = max(best, xr);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def findMaximumXOR(self, nums: List[int]) -> int:
        child = [[0, 0]]
        for x in nums:
            node = 0
            for b in range(30, -1, -1):
                bit = (x >> b) & 1
                if not child[node][bit]:
                    child[node][bit] = len(child)
                    child.append([0, 0])
                node = child[node][bit]
        best = 0
        for x in nums:
            node = xor = 0
            for b in range(30, -1, -1):
                want = ((x >> b) & 1) ^ 1
                if child[node][want]:
                    xor |= 1 << b
                    node = child[node][want]
                else:
                    node = child[node][want ^ 1]
            best = max(best, xor)
        return best`,
          javascript: r`var findMaximumXOR = function(nums) {
    const zero = new Int32Array(nums.length * 31 + 1), one = new Int32Array(nums.length * 31 + 1);
    const child = [zero, one];
    let count = 1;
    for (const x of nums) {
        let node = 0;
        for (let b = 30; b >= 0; b--) {
            const bit = (x >> b) & 1;
            if (!child[bit][node]) child[bit][node] = count++;
            node = child[bit][node];
        }
    }
    let best = 0;
    for (const x of nums) {
        let node = 0, xor = 0;
        for (let b = 30; b >= 0; b--) {
            const want = ((x >> b) & 1) ^ 1;
            if (child[want][node]) { xor |= 1 << b; node = child[want][node]; }
            else node = child[want ^ 1][node];
        }
        best = Math.max(best, xor);
    }
    return best;
};`,
        },
      },
    ],
  },

  'word-search-ii': {
    pattern: 'Trie of the words + DFS backtracking on the grid, pruning when no word has the current prefix',
    approaches: [
      {
        level: 'Brute force', name: 'Run Word Search separately for every word',
        idea: 'For each word, try every starting cell and do a backtracking DFS that matches the word letter by letter, marking cells as used.',
        steps: [
          'For each word, for each cell: DFS(cell, index 0).',
          'DFS: fail if out of bounds, used, or the letter differs; succeed at the last letter; otherwise mark the cell, try the 4 neighbours with the next index, and unmark.',
          'Collect the words that were found.',
        ],
        time: 'O(W·m·n·4·3ᴸ⁻¹)', space: 'O(L)',
        why: 'Every word repeats the full grid search: from each of the m·n cells, up to 4·3ᴸ⁻¹ paths of length L. With 3 × 10⁴ words that is far too slow.',
        code: {
          java: r`class Solution {
    public List<String> findWords(char[][] board, String[] words) {
        List<String> out = new ArrayList<>();
        for (String w : words) {
            boolean found = false;
            for (int r = 0; r < board.length && !found; r++)
                for (int c = 0; c < board[0].length && !found; c++)
                    found = dfs(board, w, 0, r, c);
            if (found) out.add(w);
        }
        return out;
    }

    private boolean dfs(char[][] b, String w, int i, int r, int c) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(i)) return false;
        if (i == w.length() - 1) return true;
        char saved = b[r][c];
        b[r][c] = '#';
        boolean ok = dfs(b, w, i + 1, r + 1, c) || dfs(b, w, i + 1, r - 1, c) || dfs(b, w, i + 1, r, c + 1) || dfs(b, w, i + 1, r, c - 1);
        b[r][c] = saved;
        return ok;
    }
}`,
          cpp: r`class Solution {
    bool dfs(vector<vector<char>>& b, const string& w, size_t i, int r, int c) {
        if (r < 0 || c < 0 || r >= (int) b.size() || c >= (int) b[0].size() || b[r][c] != w[i]) return false;
        if (i == w.size() - 1) return true;
        char saved = b[r][c];
        b[r][c] = '#';
        bool ok = dfs(b, w, i + 1, r + 1, c) || dfs(b, w, i + 1, r - 1, c) || dfs(b, w, i + 1, r, c + 1) || dfs(b, w, i + 1, r, c - 1);
        b[r][c] = saved;
        return ok;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        vector<string> out;
        for (auto& w : words) {
            bool found = false;
            for (int r = 0; r < (int) board.size() && !found; r++)
                for (int c = 0; c < (int) board[0].size() && !found; c++)
                    found = dfs(board, w, 0, r, c);
            if (found) out.push_back(w);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        m, n = len(board), len(board[0])
        def dfs(w, i, r, c):
            if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != w[i]:
                return False
            if i == len(w) - 1:
                return True
            saved, board[r][c] = board[r][c], "#"
            ok = dfs(w, i + 1, r + 1, c) or dfs(w, i + 1, r - 1, c) or dfs(w, i + 1, r, c + 1) or dfs(w, i + 1, r, c - 1)
            board[r][c] = saved
            return ok
        return [w for w in words if any(dfs(w, 0, r, c) for r in range(m) for c in range(n))]`,
          javascript: r`var findWords = function(board, words) {
    const m = board.length, n = board[0].length;
    const dfs = (w, i, r, c) => {
        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== w[i]) return false;
        if (i === w.length - 1) return true;
        const saved = board[r][c];
        board[r][c] = '#';
        const ok = dfs(w, i + 1, r + 1, c) || dfs(w, i + 1, r - 1, c) || dfs(w, i + 1, r, c + 1) || dfs(w, i + 1, r, c - 1);
        board[r][c] = saved;
        return ok;
    };
    return words.filter((w) => {
        for (let r = 0; r < m; r++)
            for (let c = 0; c < n; c++) if (dfs(w, 0, r, c)) return true;
        return false;
    });
};`,
        },
      },
      {
        level: 'Optimal', name: 'One grid DFS guided by a trie of all words',
        idea: 'Put all the words in a trie and search the grid once. The DFS carries the trie node for the letters walked so far; if the next letter has no child, no word continues that way, so the path is cut immediately. A node that ends a word records it; clearing that mark avoids reporting it twice.',
        steps: [
          'Insert every word into a trie; store the word itself at its end node.',
          'From every cell, DFS with the trie root: move to the child for the cell\'s letter (stop if missing).',
          'If that node holds a word, add it to the answer and clear it.',
          'Mark the cell used, explore the 4 neighbours, then restore the cell.',
        ],
        time: 'O(m·n·4·3ᴸ⁻¹)', space: 'O(S)',
        why: 'The grid is searched once for all words together, and the trie prunes every path that is not a prefix of some word. S is the total length of the words (trie size); the recursion is at most L = 10 deep.',
        code: {
          java: r`class Solution {
    private static class Node {
        Node[] next = new Node[26];
        String word;
    }

    public List<String> findWords(char[][] board, String[] words) {
        Node root = new Node();
        for (String w : words) {
            Node node = root;
            for (char c : w.toCharArray()) {
                if (node.next[c - 'a'] == null) node.next[c - 'a'] = new Node();
                node = node.next[c - 'a'];
            }
            node.word = w;
        }
        List<String> out = new ArrayList<>();
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++) dfs(board, r, c, root, out);
        return out;
    }

    private void dfs(char[][] b, int r, int c, Node parent, List<String> out) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] == '#') return;
        Node node = parent.next[b[r][c] - 'a'];
        if (node == null) return;
        if (node.word != null) { out.add(node.word); node.word = null; }
        char saved = b[r][c];
        b[r][c] = '#';
        dfs(b, r + 1, c, node, out);
        dfs(b, r - 1, c, node, out);
        dfs(b, r, c + 1, node, out);
        dfs(b, r, c - 1, node, out);
        b[r][c] = saved;
    }
}`,
          cpp: r`class Solution {
    struct Node {
        Node* next[26] = {};
        string word;
    };
    void dfs(vector<vector<char>>& b, int r, int c, Node* parent, vector<string>& out) {
        if (r < 0 || c < 0 || r >= (int) b.size() || c >= (int) b[0].size() || b[r][c] == '#') return;
        Node* node = parent->next[b[r][c] - 'a'];
        if (!node) return;
        if (!node->word.empty()) { out.push_back(node->word); node->word.clear(); }
        char saved = b[r][c];
        b[r][c] = '#';
        dfs(b, r + 1, c, node, out);
        dfs(b, r - 1, c, node, out);
        dfs(b, r, c + 1, node, out);
        dfs(b, r, c - 1, node, out);
        b[r][c] = saved;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Node* root = new Node();
        for (auto& w : words) {
            Node* node = root;
            for (char c : w) {
                if (!node->next[c - 'a']) node->next[c - 'a'] = new Node();
                node = node->next[c - 'a'];
            }
            node->word = w;
        }
        vector<string> out;
        for (int r = 0; r < (int) board.size(); r++)
            for (int c = 0; c < (int) board[0].size(); c++) dfs(board, r, c, root, out);
        return out;
    }
};`,
          python: r`class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = {}
        for w in words:
            node = root
            for c in w:
                node = node.setdefault(c, {})
            node["$"] = w
        m, n, out = len(board), len(board[0]), []
        def dfs(r, c, parent):
            if r < 0 or c < 0 or r >= m or c >= n:
                return
            ch = board[r][c]
            node = parent.get(ch)
            if node is None:
                return
            if "$" in node:
                out.append(node.pop("$"))
            board[r][c] = "#"
            dfs(r + 1, c, node)
            dfs(r - 1, c, node)
            dfs(r, c + 1, node)
            dfs(r, c - 1, node)
            board[r][c] = ch
        for r in range(m):
            for c in range(n):
                dfs(r, c, root)
        return out`,
          javascript: r`var findWords = function(board, words) {
    const root = {};
    for (const w of words) {
        let node = root;
        for (const c of w) node = node[c] ??= {};
        node.$ = w;
    }
    const m = board.length, n = board[0].length, out = [];
    const dfs = (r, c, parent) => {
        if (r < 0 || c < 0 || r >= m || c >= n) return;
        const ch = board[r][c], node = parent[ch];
        if (!node) return;
        if (node.$) { out.push(node.$); delete node.$; }
        board[r][c] = '#';
        dfs(r + 1, c, node);
        dfs(r - 1, c, node);
        dfs(r, c + 1, node);
        dfs(r, c - 1, node);
        board[r][c] = ch;
    };
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) dfs(r, c, root);
    return out;
};`,
        },
      },
    ],
  },
  'extra-characters-in-a-string': {
    pattern: 'DP over suffixes; a trie lists the words starting at each position',
    approaches: [
      {
        level: 'Brute force', name: 'Plain recursion',
        idea: 'At position `i`, either skip `s[i]` as an extra character or jump over any dictionary word that starts at `i`; take the better result.',
        steps: [
          '`f(i)` = 0 when `i == n`.',
          'Otherwise `f(i) = 1 + f(i + 1)`, and for every `j > i` with `s[i..j)` in the dictionary set, `f(i) = min(f(i), f(j))`.',
          'Return `f(0)`.',
        ],
        time: 'O(2ⁿ · n)', space: 'O(n)',
        why: 'The same suffix is solved again and again along different paths. With a long run of "a" and words "a", "aa", "aaa", the number of paths explodes, so it times out on that test.',
        code: {
          java: r`class Solution {
    public int minExtraChar(String s, String[] dictionary) {
        return f(s, 0, new HashSet<>(Arrays.asList(dictionary)));
    }
    private int f(String s, int i, Set<String> dict) {
        if (i == s.length()) return 0;
        int best = 1 + f(s, i + 1, dict);
        for (int j = i + 1; j <= s.length(); j++)
            if (dict.contains(s.substring(i, j))) best = Math.min(best, f(s, j, dict));
        return best;
    }
}`,
          cpp: r`class Solution {
    unordered_set<string> dict;
    int f(const string& s, int i) {
        if (i == (int) s.size()) return 0;
        int best = 1 + f(s, i + 1);
        for (int j = i + 1; j <= (int) s.size(); j++)
            if (dict.count(s.substr(i, j - i))) best = min(best, f(s, j));
        return best;
    }
public:
    int minExtraChar(string s, vector<string>& dictionary) {
        dict = unordered_set<string>(dictionary.begin(), dictionary.end());
        return f(s, 0);
    }
};`,
          python: r`class Solution:
    def minExtraChar(self, s: str, dictionary: List[str]) -> int:
        words = set(dictionary)
        def f(i):
            if i == len(s):
                return 0
            best = 1 + f(i + 1)
            for j in range(i + 1, len(s) + 1):
                if s[i:j] in words:
                    best = min(best, f(j))
            return best
        return f(0)`,
          javascript: r`var minExtraChar = function(s, dictionary) {
    const dict = new Set(dictionary);
    const f = (i) => {
        if (i === s.length) return 0;
        let best = 1 + f(i + 1);
        for (let j = i + 1; j <= s.length; j++)
            if (dict.has(s.slice(i, j))) best = Math.min(best, f(j));
        return best;
    };
    return f(0);
};`,
        },
        timesOut: [5],
      },
      {
        level: 'Better', name: 'Bottom-up DP with a hash set',
        idea: 'Solve each suffix once, from the end of the string backwards, checking every substring against a set of words.',
        steps: [
          '`dp[n] = 0`.',
          'For `i` from `n − 1` down to 0: `dp[i] = dp[i + 1] + 1`; for each `j > i` with `s[i..j)` in the set, `dp[i] = min(dp[i], dp[j])`.',
          'Return `dp[0]`.',
        ],
        time: 'O(n³)', space: 'O(n + D)',
        why: 'n² substrings, each built and hashed in O(n). D is the total size of the dictionary set. With n ≤ 50 this is instant; the trie removes the repeated substring building.',
        code: {
          java: r`class Solution {
    public int minExtraChar(String s, String[] dictionary) {
        Set<String> dict = new HashSet<>(Arrays.asList(dictionary));
        int n = s.length();
        int[] dp = new int[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = dp[i + 1] + 1;
            for (int j = i + 1; j <= n; j++)
                if (dict.contains(s.substring(i, j))) dp[i] = Math.min(dp[i], dp[j]);
        }
        return dp[0];
    }
}`,
          cpp: r`class Solution {
public:
    int minExtraChar(string s, vector<string>& dictionary) {
        unordered_set<string> dict(dictionary.begin(), dictionary.end());
        int n = s.size();
        vector<int> dp(n + 1, 0);
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = dp[i + 1] + 1;
            for (int j = i + 1; j <= n; j++)
                if (dict.count(s.substr(i, j - i))) dp[i] = min(dp[i], dp[j]);
        }
        return dp[0];
    }
};`,
          python: r`class Solution:
    def minExtraChar(self, s: str, dictionary: List[str]) -> int:
        words, n = set(dictionary), len(s)
        dp = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            dp[i] = dp[i + 1] + 1
            for j in range(i + 1, n + 1):
                if s[i:j] in words:
                    dp[i] = min(dp[i], dp[j])
        return dp[0]`,
          javascript: r`var minExtraChar = function(s, dictionary) {
    const dict = new Set(dictionary), n = s.length;
    const dp = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        for (let j = i + 1; j <= n; j++)
            if (dict.has(s.slice(i, j))) dp[i] = Math.min(dp[i], dp[j]);
    }
    return dp[0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP with a trie walk',
        idea: 'Put the dictionary in a trie. From each position `i`, walk the trie along `s[i], s[i + 1], …`; every word-end node you pass is a word starting at `i`, found without building substrings.',
        steps: [
          'Insert every word into a trie.',
          'For `i` from `n − 1` down to 0: `dp[i] = dp[i + 1] + 1`, then walk the trie from the root along `s[j]` for `j = i, i + 1, …`, stopping when there is no child.',
          'At each node that ends a word, set `dp[i] = min(dp[i], dp[j + 1])`. Return `dp[0]`.',
        ],
        time: 'O(n² + D)', space: 'O(n + D)',
        why: 'D is the total length of the dictionary words (the trie size). Each position walks at most n trie steps with O(1) work each, and the walk stops early as soon as no word continues, which is usually after a few characters.',
        code: {
          java: r`class Solution {
    private static class Trie { Trie[] next = new Trie[26]; boolean end; }
    public int minExtraChar(String s, String[] dictionary) {
        Trie root = new Trie();
        for (String w : dictionary) {
            Trie t = root;
            for (char c : w.toCharArray()) {
                if (t.next[c - 'a'] == null) t.next[c - 'a'] = new Trie();
                t = t.next[c - 'a'];
            }
            t.end = true;
        }
        int n = s.length();
        int[] dp = new int[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = dp[i + 1] + 1;
            Trie t = root;
            for (int j = i; j < n; j++) {
                t = t.next[s.charAt(j) - 'a'];
                if (t == null) break;
                if (t.end) dp[i] = Math.min(dp[i], dp[j + 1]);
            }
        }
        return dp[0];
    }
}`,
          cpp: r`class Solution {
    struct Trie { Trie* next[26] = {}; bool end = false; };
public:
    int minExtraChar(string s, vector<string>& dictionary) {
        Trie* root = new Trie();
        for (const string& w : dictionary) {
            Trie* t = root;
            for (char c : w) {
                if (!t->next[c - 'a']) t->next[c - 'a'] = new Trie();
                t = t->next[c - 'a'];
            }
            t->end = true;
        }
        int n = s.size();
        vector<int> dp(n + 1, 0);
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = dp[i + 1] + 1;
            Trie* t = root;
            for (int j = i; j < n; j++) {
                t = t->next[s[j] - 'a'];
                if (!t) break;
                if (t->end) dp[i] = min(dp[i], dp[j + 1]);
            }
        }
        return dp[0];
    }
};`,
          python: r`class Solution:
    def minExtraChar(self, s: str, dictionary: List[str]) -> int:
        root = {}
        for w in dictionary:
            t = root
            for c in w:
                t = t.setdefault(c, {})
            t['$'] = True
        n = len(s)
        dp = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            dp[i] = dp[i + 1] + 1
            t = root
            for j in range(i, n):
                t = t.get(s[j])
                if t is None:
                    break
                if '$' in t:
                    dp[i] = min(dp[i], dp[j + 1])
        return dp[0]`,
          javascript: r`var minExtraChar = function(s, dictionary) {
    const root = {};
    for (const w of dictionary) {
        let t = root;
        for (const c of w) t = t[c] || (t[c] = {});
        t.$ = true;
    }
    const n = s.length, dp = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        dp[i] = dp[i + 1] + 1;
        let t = root;
        for (let j = i; j < n; j++) {
            t = t[s[j]];
            if (!t) break;
            if (t.$) dp[i] = Math.min(dp[i], dp[j + 1]);
        }
    }
    return dp[0];
};`,
        },
      },
    ],
  },
};
