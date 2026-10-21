const r = String.raw;

export default {
  'course-schedule': {
    pattern: 'Cycle detection in a directed graph (Kahn\'s algorithm or DFS colouring)',
    approaches: [
      {
        level: 'Brute force', name: 'Repeatedly take any course whose prerequisites are done',
        idea: 'Simulate a student: keep scanning for a course whose prerequisites are all already taken, take it, and repeat. If at some point no course can be taken but some remain, there is a cycle.',
        steps: [
          'Keep a `taken` flag per course.',
          'Repeat: scan all prerequisite pairs to find an untaken course with no untaken prerequisite; take it.',
          'Stop when all are taken (true) or a full scan finds nothing to take (false).',
        ],
        time: 'O(V·(V + E))', space: 'O(V)',
        why: 'Up to V rounds, each checking all courses against all E prerequisite pairs.',
        code: {
          java: r`class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        boolean[] taken = new boolean[numCourses];
        for (int done = 0; done < numCourses; done++) {
            boolean[] blocked = new boolean[numCourses];
            for (int[] p : prerequisites) if (!taken[p[1]]) blocked[p[0]] = true;
            int pick = -1;
            for (int c = 0; c < numCourses && pick == -1; c++) if (!taken[c] && !blocked[c]) pick = c;
            if (pick == -1) return false;
            taken[pick] = true;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<bool> taken(numCourses, false);
        for (int done = 0; done < numCourses; done++) {
            vector<bool> blocked(numCourses, false);
            for (auto& p : prerequisites) if (!taken[p[1]]) blocked[p[0]] = true;
            int pick = -1;
            for (int c = 0; c < numCourses && pick == -1; c++) if (!taken[c] && !blocked[c]) pick = c;
            if (pick == -1) return false;
            taken[pick] = true;
        }
        return true;
    }
};`,
          python: r`class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        taken = [False] * numCourses
        for _ in range(numCourses):
            blocked = {a for a, b in prerequisites if not taken[b]}
            pick = next((c for c in range(numCourses) if not taken[c] and c not in blocked), -1)
            if pick == -1:
                return False
            taken[pick] = True
        return True`,
          javascript: r`var canFinish = function(numCourses, prerequisites) {
    const taken = new Array(numCourses).fill(false);
    for (let done = 0; done < numCourses; done++) {
        const blocked = new Array(numCourses).fill(false);
        for (const [a, b] of prerequisites) if (!taken[b]) blocked[a] = true;
        let pick = -1;
        for (let c = 0; c < numCourses && pick === -1; c++) if (!taken[c] && !blocked[c]) pick = c;
        if (pick === -1) return false;
        taken[pick] = true;
    }
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Kahn\'s algorithm (BFS on in-degrees)',
        idea: 'Track how many unmet prerequisites each course has (its in-degree). Courses with 0 can be taken; taking one lowers the in-degree of the courses that depend on it. If every course is eventually taken, there is no cycle.',
        steps: [
          'Build the graph `b → a` for each pair `[a, b]` and count in-degrees.',
          'Queue every course with in-degree 0.',
          'Pop a course, count it as taken, and decrement each dependent\'s in-degree, queuing those that reach 0.',
          'Return whether the number taken equals `numCourses`.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'Each course is queued once and each edge relaxed once. Courses on a cycle never reach in-degree 0, so they are never counted.',
        code: {
          java: r`class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> next = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) next.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { next.get(p[1]).add(p[0]); indeg[p[0]]++; }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) queue.add(i);
        int taken = 0;
        while (!queue.isEmpty()) {
            int c = queue.poll();
            taken++;
            for (int d : next.get(c)) if (--indeg[d] == 0) queue.add(d);
        }
        return taken == numCourses;
    }
}`,
          cpp: r`class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> next(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) { next[p[1]].push_back(p[0]); indeg[p[0]]++; }
        queue<int> q;
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.push(i);
        int taken = 0;
        while (!q.empty()) {
            int c = q.front();
            q.pop();
            taken++;
            for (int d : next[c]) if (--indeg[d] == 0) q.push(d);
        }
        return taken == numCourses;
    }
};`,
          python: r`class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        nxt = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            nxt[b].append(a)
            indeg[a] += 1
        queue = deque(i for i in range(numCourses) if indeg[i] == 0)
        taken = 0
        while queue:
            c = queue.popleft()
            taken += 1
            for d in nxt[c]:
                indeg[d] -= 1
                if indeg[d] == 0:
                    queue.append(d)
        return taken == numCourses`,
          javascript: r`var canFinish = function(numCourses, prerequisites) {
    const next = Array.from({ length: numCourses }, () => []), indeg = new Array(numCourses).fill(0);
    for (const [a, b] of prerequisites) { next[b].push(a); indeg[a]++; }
    const queue = [];
    for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);
    for (let h = 0; h < queue.length; h++)
        for (const d of next[queue[h]]) if (--indeg[d] === 0) queue.push(d);
    return queue.length === numCourses;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS with three colours',
        idea: 'Colour courses white (unvisited), grey (on the current DFS path) and black (finished). Reaching a grey course again means following edges led back into the current path: a cycle.',
        steps: [
          'Build the graph `b → a`.',
          'DFS from every white course: mark it grey, visit each neighbour; if a neighbour is grey, return "cycle"; after all neighbours, mark it black.',
          'Return false if any DFS finds a cycle, else true.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'Each course is finished once and each edge explored once. Black courses are never re-explored. The recursion can be V deep.',
        code: {
          java: r`class Solution {
    private List<List<Integer>> next;
    private int[] color;

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        next = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) next.add(new ArrayList<>());
        for (int[] p : prerequisites) next.get(p[1]).add(p[0]);
        color = new int[numCourses]; // 0 white, 1 grey, 2 black
        for (int i = 0; i < numCourses; i++) if (color[i] == 0 && hasCycle(i)) return false;
        return true;
    }

    private boolean hasCycle(int u) {
        color[u] = 1;
        for (int v : next.get(u)) {
            if (color[v] == 1) return true;
            if (color[v] == 0 && hasCycle(v)) return true;
        }
        color[u] = 2;
        return false;
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> next;
    vector<int> color; // 0 white, 1 grey, 2 black
    bool hasCycle(int u) {
        color[u] = 1;
        for (int v : next[u]) {
            if (color[v] == 1) return true;
            if (color[v] == 0 && hasCycle(v)) return true;
        }
        color[u] = 2;
        return false;
    }
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        next.assign(numCourses, {});
        color.assign(numCourses, 0);
        for (auto& p : prerequisites) next[p[1]].push_back(p[0]);
        for (int i = 0; i < numCourses; i++) if (color[i] == 0 && hasCycle(i)) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        nxt = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            nxt[b].append(a)
        color = [0] * numCourses  # 0 white, 1 grey, 2 black
        def has_cycle(u):
            color[u] = 1
            for v in nxt[u]:
                if color[v] == 1 or (color[v] == 0 and has_cycle(v)):
                    return True
            color[u] = 2
            return False
        return not any(color[i] == 0 and has_cycle(i) for i in range(numCourses))`,
          javascript: r`var canFinish = function(numCourses, prerequisites) {
    const next = Array.from({ length: numCourses }, () => []);
    for (const [a, b] of prerequisites) next[b].push(a);
    const color = new Array(numCourses).fill(0); // 0 white, 1 grey, 2 black
    const hasCycle = (u) => {
        color[u] = 1;
        for (const v of next[u]) {
            if (color[v] === 1) return true;
            if (color[v] === 0 && hasCycle(v)) return true;
        }
        color[u] = 2;
        return false;
    };
    for (let i = 0; i < numCourses; i++) if (color[i] === 0 && hasCycle(i)) return false;
    return true;
};`,
        },
      },
    ],
  },

  'course-schedule-ii': {
    pattern: 'Topological sort (Kahn\'s BFS, or reversed DFS post-order)',
    approaches: [
      {
        level: 'Optimal', name: 'Kahn\'s algorithm: output courses as they become free',
        idea: 'Take courses with no remaining prerequisites first. The order in which Kahn\'s algorithm removes courses is a valid order; if not all courses get removed, there is a cycle.',
        steps: [
          'Build `b → a` edges and in-degrees.',
          'Queue every course with in-degree 0.',
          'Pop a course, append it to the order, and decrement its dependents\' in-degrees, queuing those that reach 0.',
          'Return the order if it has all courses, else an empty array.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'Each course and edge is handled once; the graph and queue take O(V + E).',
        code: {
          java: r`class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> next = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) next.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { next.get(p[1]).add(p[0]); indeg[p[0]]++; }
        int[] order = new int[numCourses];
        int head = 0, tail = 0;
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) order[tail++] = i;
        while (head < tail) {
            int c = order[head++];
            for (int d : next.get(c)) if (--indeg[d] == 0) order[tail++] = d;
        }
        return tail == numCourses ? order : new int[0];
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> next(numCourses);
        vector<int> indeg(numCourses, 0), order;
        for (auto& p : prerequisites) { next[p[1]].push_back(p[0]); indeg[p[0]]++; }
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) order.push_back(i);
        for (size_t h = 0; h < order.size(); h++)
            for (int d : next[order[h]]) if (--indeg[d] == 0) order.push_back(d);
        return (int) order.size() == numCourses ? order : vector<int>{};
    }
};`,
          python: r`class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        nxt = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            nxt[b].append(a)
            indeg[a] += 1
        order = [i for i in range(numCourses) if indeg[i] == 0]
        for c in order:  # order grows while we iterate: it doubles as the queue
            for d in nxt[c]:
                indeg[d] -= 1
                if indeg[d] == 0:
                    order.append(d)
        return order if len(order) == numCourses else []`,
          javascript: r`var findOrder = function(numCourses, prerequisites) {
    const next = Array.from({ length: numCourses }, () => []), indeg = new Array(numCourses).fill(0);
    for (const [a, b] of prerequisites) { next[b].push(a); indeg[a]++; }
    const order = [];
    for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) order.push(i);
    for (let h = 0; h < order.length; h++)
        for (const d of next[order[h]]) if (--indeg[d] === 0) order.push(d);
    return order.length === numCourses ? order : [];
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS post-order, reversed',
        idea: 'In a DFS, a course finishes only after every course that depends on it has finished. So the finishing order lists dependents first; reversing it gives a valid schedule. A grey (in-progress) course met again means a cycle.',
        steps: [
          'Build `b → a` edges; colour all courses white.',
          'DFS from each white course: grey on entry; on meeting grey, report a cycle; after the neighbours, mark black and append the course to `post`.',
          'If there was a cycle, return an empty array; otherwise return `post` reversed.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'Each course and edge is processed once; the recursion can be V deep.',
        code: {
          java: r`class Solution {
    private List<List<Integer>> next;
    private int[] color;
    private final List<Integer> post = new ArrayList<>();

    public int[] findOrder(int numCourses, int[][] prerequisites) {
        next = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) next.add(new ArrayList<>());
        for (int[] p : prerequisites) next.get(p[1]).add(p[0]);
        color = new int[numCourses];
        for (int i = 0; i < numCourses; i++) if (color[i] == 0 && !dfs(i)) return new int[0];
        int[] order = new int[numCourses];
        for (int i = 0; i < numCourses; i++) order[i] = post.get(numCourses - 1 - i);
        return order;
    }

    private boolean dfs(int u) {
        color[u] = 1;
        for (int v : next.get(u)) {
            if (color[v] == 1) return false;
            if (color[v] == 0 && !dfs(v)) return false;
        }
        color[u] = 2;
        post.add(u);
        return true;
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> next;
    vector<int> color, post;
    bool dfs(int u) {
        color[u] = 1;
        for (int v : next[u]) {
            if (color[v] == 1) return false;
            if (color[v] == 0 && !dfs(v)) return false;
        }
        color[u] = 2;
        post.push_back(u);
        return true;
    }
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        next.assign(numCourses, {});
        color.assign(numCourses, 0);
        for (auto& p : prerequisites) next[p[1]].push_back(p[0]);
        for (int i = 0; i < numCourses; i++) if (color[i] == 0 && !dfs(i)) return {};
        reverse(post.begin(), post.end());
        return post;
    }
};`,
          python: r`class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        nxt = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            nxt[b].append(a)
        color, post = [0] * numCourses, []
        def dfs(u):
            color[u] = 1
            for v in nxt[u]:
                if color[v] == 1 or (color[v] == 0 and not dfs(v)):
                    return False
            color[u] = 2
            post.append(u)
            return True
        for i in range(numCourses):
            if color[i] == 0 and not dfs(i):
                return []
        return post[::-1]`,
          javascript: r`var findOrder = function(numCourses, prerequisites) {
    const next = Array.from({ length: numCourses }, () => []);
    for (const [a, b] of prerequisites) next[b].push(a);
    const color = new Array(numCourses).fill(0), post = [];
    const dfs = (u) => {
        color[u] = 1;
        for (const v of next[u]) {
            if (color[v] === 1) return false;
            if (color[v] === 0 && !dfs(v)) return false;
        }
        color[u] = 2;
        post.push(u);
        return true;
    };
    for (let i = 0; i < numCourses; i++) if (color[i] === 0 && !dfs(i)) return [];
    return post.reverse();
};`,
        },
      },
    ],
  },

  'course-schedule-iv': {
    pattern: 'Transitive closure (reachability for all pairs) in a DAG',
    approaches: [
      {
        level: 'Brute force', name: 'A fresh search for every query',
        idea: '`u` is a prerequisite of `v` exactly when `v` is reachable from `u` along the edges `a → b`. Answer each query with its own BFS.',
        steps: [
          'Build the graph `a → b` for every pair `[a, b]`.',
          'For each query `[u, v]`, BFS from `u` and answer whether `v` is reached.',
        ],
        time: 'O(Q·(V + E))', space: 'O(V + E)',
        why: 'Each of the Q queries (up to 10⁴) may explore the whole graph.',
        code: {
          java: r`class Solution {
    public List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
        List<List<Integer>> next = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) next.add(new ArrayList<>());
        for (int[] p : prerequisites) next.get(p[0]).add(p[1]);
        List<Boolean> out = new ArrayList<>();
        for (int[] q : queries) {
            boolean[] seen = new boolean[numCourses];
            Deque<Integer> queue = new ArrayDeque<>();
            queue.add(q[0]);
            seen[q[0]] = true;
            while (!queue.isEmpty() && !seen[q[1]]) {
                for (int v : next.get(queue.poll())) if (!seen[v]) { seen[v] = true; queue.add(v); }
            }
            out.add(seen[q[1]]);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
        vector<vector<int>> next(numCourses);
        for (auto& p : prerequisites) next[p[0]].push_back(p[1]);
        vector<bool> out;
        for (auto& q : queries) {
            vector<bool> seen(numCourses, false);
            queue<int> bfs;
            bfs.push(q[0]);
            seen[q[0]] = true;
            while (!bfs.empty() && !seen[q[1]]) {
                int u = bfs.front();
                bfs.pop();
                for (int v : next[u]) if (!seen[v]) { seen[v] = true; bfs.push(v); }
            }
            out.push_back(seen[q[1]]);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def checkIfPrerequisite(self, numCourses: int, prerequisites: List[List[int]], queries: List[List[int]]) -> List[bool]:
        nxt = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            nxt[a].append(b)
        out = []
        for u, v in queries:
            seen, queue = {u}, deque([u])
            while queue and v not in seen:
                for w in nxt[queue.popleft()]:
                    if w not in seen:
                        seen.add(w)
                        queue.append(w)
            out.append(v in seen)
        return out`,
          javascript: r`var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
    const next = Array.from({ length: numCourses }, () => []);
    for (const [a, b] of prerequisites) next[a].push(b);
    return queries.map(([u, v]) => {
        const seen = new Array(numCourses).fill(false), queue = [u];
        seen[u] = true;
        for (let h = 0; h < queue.length && !seen[v]; h++)
            for (const w of next[queue[h]]) if (!seen[w]) { seen[w] = true; queue.push(w); }
        return seen[v];
    });
};`,
        },
      },
      {
        level: 'Optimal', name: 'Precompute all reachability with Floyd–Warshall',
        idea: 'With at most 100 courses, compute `reach[i][j]` for every pair once. `i` reaches `j` if it does directly, or via some middle course `k` that `i` reaches and that reaches `j`. Then every query is a table lookup.',
        steps: [
          'Set `reach[a][b] = true` for every prerequisite pair.',
          'For each middle course `k`, for each `i`, for each `j`: `reach[i][j] |= reach[i][k] && reach[k][j]`.',
          'Answer each query `[u, v]` with `reach[u][v]`.',
        ],
        time: 'O(V³ + Q)', space: 'O(V²)',
        why: 'V³ = 10⁶ steps once, then O(1) per query. Considering middle courses in the outer loop is what makes the triple loop correct.',
        code: {
          java: r`class Solution {
    public List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
        int n = numCourses;
        boolean[][] reach = new boolean[n][n];
        for (int[] p : prerequisites) reach[p[0]][p[1]] = true;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                if (reach[i][k])
                    for (int j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
        List<Boolean> out = new ArrayList<>();
        for (int[] q : queries) out.add(reach[q[0]][q[1]]);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
        int n = numCourses;
        vector<vector<bool>> reach(n, vector<bool>(n, false));
        for (auto& p : prerequisites) reach[p[0]][p[1]] = true;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                if (reach[i][k])
                    for (int j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
        vector<bool> out;
        for (auto& q : queries) out.push_back(reach[q[0]][q[1]]);
        return out;
    }
};`,
          python: r`class Solution:
    def checkIfPrerequisite(self, numCourses: int, prerequisites: List[List[int]], queries: List[List[int]]) -> List[bool]:
        n = numCourses
        reach = [[False] * n for _ in range(n)]
        for a, b in prerequisites:
            reach[a][b] = True
        for k in range(n):
            for i in range(n):
                if reach[i][k]:
                    row_i, row_k = reach[i], reach[k]
                    for j in range(n):
                        if row_k[j]:
                            row_i[j] = True
        return [reach[u][v] for u, v in queries]`,
          javascript: r`var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
    const n = numCourses;
    const reach = Array.from({ length: n }, () => new Array(n).fill(false));
    for (const [a, b] of prerequisites) reach[a][b] = true;
    for (let k = 0; k < n; k++)
        for (let i = 0; i < n; i++)
            if (reach[i][k])
                for (let j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
    return queries.map(([u, v]) => reach[u][v]);
};`,
        },
      },
    ],
  },

  'minimum-height-trees': {
    pattern: 'Peel leaves layer by layer (topological trimming) to find the tree\'s centre',
    approaches: [
      {
        level: 'Brute force', name: 'BFS height from every node',
        idea: 'Root the tree at each node in turn, measure the height with a BFS, and keep the nodes with the smallest height.',
        steps: [
          'Build the adjacency lists.',
          'For each node, BFS to find the number of levels below it (its height).',
          'Return all nodes whose height equals the minimum.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n BFS runs of O(n) each; for n = 2·10⁴ that is 4·10⁸ steps.',
        code: {
          java: r`class Solution {
    public List<Integer> findMinHeightTrees(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] height = new int[n];
        int best = Integer.MAX_VALUE;
        for (int root = 0; root < n; root++) {
            int[] dist = new int[n];
            Arrays.fill(dist, -1);
            dist[root] = 0;
            Deque<Integer> queue = new ArrayDeque<>();
            queue.add(root);
            int h = 0;
            while (!queue.isEmpty()) {
                int u = queue.poll();
                h = Math.max(h, dist[u]);
                for (int v : adj.get(u)) if (dist[v] == -1) { dist[v] = dist[u] + 1; queue.add(v); }
            }
            height[root] = h;
            best = Math.min(best, h);
        }
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < n; i++) if (height[i] == best) out.add(i);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
        vector<vector<int>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        vector<int> height(n);
        int best = INT_MAX;
        for (int root = 0; root < n; root++) {
            vector<int> dist(n, -1);
            dist[root] = 0;
            queue<int> q;
            q.push(root);
            int h = 0;
            while (!q.empty()) {
                int u = q.front();
                q.pop();
                h = max(h, dist[u]);
                for (int v : adj[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
            }
            height[root] = h;
            best = min(best, h);
        }
        vector<int> out;
        for (int i = 0; i < n; i++) if (height[i] == best) out.push_back(i);
        return out;
    }
};`,
          python: r`class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        def height(root):
            dist = [-1] * n
            dist[root] = 0
            queue, h = deque([root]), 0
            while queue:
                u = queue.popleft()
                h = max(h, dist[u])
                for v in adj[u]:
                    if dist[v] == -1:
                        dist[v] = dist[u] + 1
                        queue.append(v)
            return h
        heights = [height(i) for i in range(n)]
        best = min(heights)
        return [i for i in range(n) if heights[i] == best]`,
          javascript: r`var findMinHeightTrees = function(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    const height = (root) => {
        const dist = new Array(n).fill(-1), queue = [root];
        dist[root] = 0;
        let h = 0;
        for (let i = 0; i < queue.length; i++) {
            const u = queue[i];
            h = Math.max(h, dist[u]);
            for (const v of adj[u]) if (dist[v] === -1) { dist[v] = dist[u] + 1; queue.push(v); }
        }
        return h;
    };
    const heights = Array.from({ length: n }, (_, i) => height(i)), best = Math.min(...heights);
    return heights.flatMap((h, i) => (h === best ? [i] : []));
};`,
        },
      },
      {
        level: 'Optimal', name: 'Trim leaves until one or two nodes remain',
        idea: 'The best roots are the centre of the tree\'s longest path. Removing all current leaves shortens every longest path by 2 from both ends, so repeatedly peeling leaves leaves the centre: one node, or two adjacent nodes.',
        steps: [
          'If `n <= 2`, return all nodes.',
          'Compute degrees; queue every leaf (degree 1). Let `remaining = n`.',
          'While `remaining > 2`: remove the whole current layer of leaves (`remaining −= layer size`); each removal lowers its neighbour\'s degree, and neighbours that become leaves form the next layer.',
          'Return the nodes still in the queue.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each node is removed once and each edge looked at twice — the same idea as Kahn\'s algorithm, applied from the outside in.',
        code: {
          java: r`class Solution {
    public List<Integer> findMinHeightTrees(int n, int[][] edges) {
        List<Integer> layer = new ArrayList<>();
        if (n <= 2) { for (int i = 0; i < n; i++) layer.add(i); return layer; }
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] degree = new int[n];
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); degree[e[0]]++; degree[e[1]]++; }
        for (int i = 0; i < n; i++) if (degree[i] == 1) layer.add(i);
        int remaining = n;
        while (remaining > 2) {
            remaining -= layer.size();
            List<Integer> next = new ArrayList<>();
            for (int leaf : layer)
                for (int v : adj.get(leaf)) if (--degree[v] == 1) next.add(v);
            layer = next;
        }
        return layer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
        vector<int> layer;
        if (n <= 2) { for (int i = 0; i < n; i++) layer.push_back(i); return layer; }
        vector<vector<int>> adj(n);
        vector<int> degree(n, 0);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); degree[e[0]]++; degree[e[1]]++; }
        for (int i = 0; i < n; i++) if (degree[i] == 1) layer.push_back(i);
        int remaining = n;
        while (remaining > 2) {
            remaining -= layer.size();
            vector<int> next;
            for (int leaf : layer)
                for (int v : adj[leaf]) if (--degree[v] == 1) next.push_back(v);
            layer = next;
        }
        return layer;
    }
};`,
          python: r`class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        if n <= 2:
            return list(range(n))
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        degree = [len(a) for a in adj]
        layer = [i for i in range(n) if degree[i] == 1]
        remaining = n
        while remaining > 2:
            remaining -= len(layer)
            nxt = []
            for leaf in layer:
                for v in adj[leaf]:
                    degree[v] -= 1
                    if degree[v] == 1:
                        nxt.append(v)
            layer = nxt
        return layer`,
          javascript: r`var findMinHeightTrees = function(n, edges) {
    if (n <= 2) return [...Array(n).keys()];
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    const degree = adj.map((a) => a.length);
    let layer = [];
    for (let i = 0; i < n; i++) if (degree[i] === 1) layer.push(i);
    let remaining = n;
    while (remaining > 2) {
        remaining -= layer.length;
        const next = [];
        for (const leaf of layer)
            for (const v of adj[leaf]) if (--degree[v] === 1) next.push(v);
        layer = next;
    }
    return layer;
};`,
        },
      },
    ],
  },

  'find-eventual-safe-states': {
    pattern: 'Nodes that cannot reach a cycle: DFS colouring, or Kahn\'s algorithm on the reversed graph',
    approaches: [
      {
        level: 'Brute force', name: 'From every node, search for a reachable cycle',
        idea: 'A node is unsafe exactly when some path from it reaches a cycle. For each node, run a fresh DFS with grey/black colours and see whether it finds a back edge.',
        steps: [
          'For each node `s`: reset the colours and DFS from `s`.',
          'If the DFS ever reaches a grey node, `s` can reach a cycle: it is unsafe.',
          'Collect the nodes for which no cycle was found (in increasing order).',
        ],
        time: 'O(V·(V + E))', space: 'O(V)',
        why: 'Each of the V searches can explore the whole graph; nothing is reused between them.',
        code: {
          java: r`class Solution {
    public List<Integer> eventualSafeNodes(int[][] graph) {
        int n = graph.length;
        List<Integer> out = new ArrayList<>();
        for (int s = 0; s < n; s++)
            if (!reachesCycle(graph, s, new int[n])) out.add(s);
        return out;
    }

    private boolean reachesCycle(int[][] g, int u, int[] color) {
        color[u] = 1;
        for (int v : g[u]) {
            if (color[v] == 1) return true;
            if (color[v] == 0 && reachesCycle(g, v, color)) return true;
        }
        color[u] = 2;
        return false;
    }
}`,
          cpp: r`class Solution {
    bool reachesCycle(vector<vector<int>>& g, int u, vector<int>& color) {
        color[u] = 1;
        for (int v : g[u]) {
            if (color[v] == 1) return true;
            if (color[v] == 0 && reachesCycle(g, v, color)) return true;
        }
        color[u] = 2;
        return false;
    }
public:
    vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<int> out;
        for (int s = 0; s < n; s++) {
            vector<int> color(n, 0);
            if (!reachesCycle(graph, s, color)) out.push_back(s);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def eventualSafeNodes(self, graph: List[List[int]]) -> List[int]:
        n = len(graph)
        def reaches_cycle(u, color):
            color[u] = 1
            for v in graph[u]:
                if color[v] == 1 or (color[v] == 0 and reaches_cycle(v, color)):
                    return True
            color[u] = 2
            return False
        return [s for s in range(n) if not reaches_cycle(s, [0] * n)]`,
          javascript: r`var eventualSafeNodes = function(graph) {
    const n = graph.length;
    const reachesCycle = (u, color) => {
        color[u] = 1;
        for (const v of graph[u]) {
            if (color[v] === 1) return true;
            if (color[v] === 0 && reachesCycle(v, color)) return true;
        }
        color[u] = 2;
        return false;
    };
    const out = [];
    for (let s = 0; s < n; s++) if (!reachesCycle(s, new Array(n).fill(0))) out.push(s);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One DFS with colours shared by all nodes',
        idea: 'Run the colour DFS once over the whole graph and keep the colours. A node that finishes (black) cannot reach a cycle, so it is safe; a node left grey when a cycle is found stays grey and is unsafe — and anything that later reaches it is unsafe too.',
        steps: [
          'Colours: 0 unvisited, 1 visiting (or unsafe), 2 safe.',
          '`safe(u)`: if coloured, return `color[u] == 2`. Otherwise set 1; if any neighbour is not safe, return false (leaving `u` at 1).',
          'If all neighbours are safe, set `color[u] = 2` and return true.',
          'Return every `u` with `safe(u)` true, in order.',
        ],
        time: 'O(V + E)', space: 'O(V)',
        why: 'Each node is fully processed once and each edge followed once, because results are remembered in the colours.',
        code: {
          java: r`class Solution {
    private int[] color;

    public List<Integer> eventualSafeNodes(int[][] graph) {
        color = new int[graph.length];
        List<Integer> out = new ArrayList<>();
        for (int u = 0; u < graph.length; u++) if (safe(graph, u)) out.add(u);
        return out;
    }

    private boolean safe(int[][] g, int u) {
        if (color[u] != 0) return color[u] == 2;
        color[u] = 1;
        for (int v : g[u]) if (!safe(g, v)) return false;
        color[u] = 2;
        return true;
    }
}`,
          cpp: r`class Solution {
    vector<int> color;
    bool safe(vector<vector<int>>& g, int u) {
        if (color[u] != 0) return color[u] == 2;
        color[u] = 1;
        for (int v : g[u]) if (!safe(g, v)) return false;
        color[u] = 2;
        return true;
    }
public:
    vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
        color.assign(graph.size(), 0);
        vector<int> out;
        for (int u = 0; u < (int) graph.size(); u++) if (safe(graph, u)) out.push_back(u);
        return out;
    }
};`,
          python: r`class Solution:
    def eventualSafeNodes(self, graph: List[List[int]]) -> List[int]:
        color = [0] * len(graph)  # 0 unvisited, 1 visiting/unsafe, 2 safe
        def safe(u):
            if color[u]:
                return color[u] == 2
            color[u] = 1
            if any(not safe(v) for v in graph[u]):
                return False
            color[u] = 2
            return True
        return [u for u in range(len(graph)) if safe(u)]`,
          javascript: r`var eventualSafeNodes = function(graph) {
    const color = new Array(graph.length).fill(0); // 0 unvisited, 1 visiting/unsafe, 2 safe
    const safe = (u) => {
        if (color[u] !== 0) return color[u] === 2;
        color[u] = 1;
        for (const v of graph[u]) if (!safe(v)) return false;
        color[u] = 2;
        return true;
    };
    const out = [];
    for (let u = 0; u < graph.length; u++) if (safe(u)) out.push(u);
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Kahn\'s algorithm on the reversed graph',
        idea: 'Terminal nodes are safe. A node becomes safe once all of its outgoing edges lead to safe nodes. Reverse every edge and count each node\'s remaining unsafe outgoing edges; peeling from the terminals works exactly like Kahn\'s algorithm.',
        steps: [
          'For each edge `u → v`, record `u` in `reverse[v]`; `out[u]` = number of outgoing edges of `u`.',
          'Queue every node with `out == 0` (terminal).',
          'Pop `v`, mark it safe; for each `u` in `reverse[v]`, decrease `out[u]` and queue `u` when it reaches 0.',
          'Return the safe nodes in increasing order.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'Each node and edge is processed once; no recursion, so very deep graphs are no problem.',
        code: {
          java: r`class Solution {
    public List<Integer> eventualSafeNodes(int[][] graph) {
        int n = graph.length;
        List<List<Integer>> reverse = new ArrayList<>();
        for (int i = 0; i < n; i++) reverse.add(new ArrayList<>());
        int[] out = new int[n];
        Deque<Integer> queue = new ArrayDeque<>();
        for (int u = 0; u < n; u++) {
            out[u] = graph[u].length;
            for (int v : graph[u]) reverse.get(v).add(u);
            if (out[u] == 0) queue.add(u);
        }
        boolean[] safe = new boolean[n];
        while (!queue.isEmpty()) {
            int v = queue.poll();
            safe[v] = true;
            for (int u : reverse.get(v)) if (--out[u] == 0) queue.add(u);
        }
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < n; i++) if (safe[i]) result.add(i);
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<vector<int>> reverse(n);
        vector<int> out(n);
        queue<int> q;
        for (int u = 0; u < n; u++) {
            out[u] = graph[u].size();
            for (int v : graph[u]) reverse[v].push_back(u);
            if (out[u] == 0) q.push(u);
        }
        vector<bool> safe(n, false);
        while (!q.empty()) {
            int v = q.front();
            q.pop();
            safe[v] = true;
            for (int u : reverse[v]) if (--out[u] == 0) q.push(u);
        }
        vector<int> result;
        for (int i = 0; i < n; i++) if (safe[i]) result.push_back(i);
        return result;
    }
};`,
          python: r`class Solution:
    def eventualSafeNodes(self, graph: List[List[int]]) -> List[int]:
        n = len(graph)
        reverse = [[] for _ in range(n)]
        out = [len(g) for g in graph]
        for u in range(n):
            for v in graph[u]:
                reverse[v].append(u)
        queue = deque(u for u in range(n) if out[u] == 0)
        safe = [False] * n
        while queue:
            v = queue.popleft()
            safe[v] = True
            for u in reverse[v]:
                out[u] -= 1
                if out[u] == 0:
                    queue.append(u)
        return [i for i in range(n) if safe[i]]`,
          javascript: r`var eventualSafeNodes = function(graph) {
    const n = graph.length, reverse = Array.from({ length: n }, () => []), out = graph.map((g) => g.length);
    for (let u = 0; u < n; u++) for (const v of graph[u]) reverse[v].push(u);
    const queue = [];
    for (let u = 0; u < n; u++) if (out[u] === 0) queue.push(u);
    const safe = new Array(n).fill(false);
    for (let h = 0; h < queue.length; h++) {
        const v = queue[h];
        safe[v] = true;
        for (const u of reverse[v]) if (--out[u] === 0) queue.push(u);
    }
    const result = [];
    for (let i = 0; i < n; i++) if (safe[i]) result.push(i);
    return result;
};`,
        },
      },
    ],
  },

  'find-all-possible-recipes-from-given-supplies': {
    pattern: 'Kahn\'s algorithm over ingredients → recipes',
    approaches: [
      {
        level: 'Brute force', name: 'Repeatedly make any recipe whose ingredients are all available',
        idea: 'Keep a set of what you have. Scan the recipes again and again; whenever all of a recipe\'s ingredients are available, make it and add it to the set. Stop when a full scan makes nothing new.',
        steps: [
          'Put the supplies in a set `have`.',
          'Repeat: for each recipe not made yet, if all its ingredients are in `have`, add it to `have` and to the answer.',
          'Stop after a pass that makes no new recipe.',
        ],
        time: 'O(R²·I)', space: 'O(R + S)',
        why: 'Up to R passes (one new recipe per pass in the worst case), each checking every recipe\'s I ingredients.',
        code: {
          java: r`class Solution {
    public List<String> findAllRecipes(String[] recipes, List<List<String>> ingredients, String[] supplies) {
        Set<String> have = new HashSet<>(Arrays.asList(supplies));
        boolean[] made = new boolean[recipes.length];
        List<String> out = new ArrayList<>();
        boolean changed = true;
        while (changed) {
            changed = false;
            for (int i = 0; i < recipes.length; i++) {
                if (made[i] || !have.containsAll(ingredients.get(i))) continue;
                made[i] = true;
                have.add(recipes[i]);
                out.add(recipes[i]);
                changed = true;
            }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> findAllRecipes(vector<string>& recipes, vector<vector<string>>& ingredients, vector<string>& supplies) {
        unordered_set<string> have(supplies.begin(), supplies.end());
        vector<bool> made(recipes.size(), false);
        vector<string> out;
        bool changed = true;
        while (changed) {
            changed = false;
            for (size_t i = 0; i < recipes.size(); i++) {
                if (made[i]) continue;
                bool ok = true;
                for (auto& ing : ingredients[i]) if (!have.count(ing)) { ok = false; break; }
                if (!ok) continue;
                made[i] = true;
                have.insert(recipes[i]);
                out.push_back(recipes[i]);
                changed = true;
            }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def findAllRecipes(self, recipes: List[str], ingredients: List[List[str]], supplies: List[str]) -> List[str]:
        have, out = set(supplies), []
        made = [False] * len(recipes)
        changed = True
        while changed:
            changed = False
            for i, recipe in enumerate(recipes):
                if not made[i] and all(x in have for x in ingredients[i]):
                    made[i] = True
                    have.add(recipe)
                    out.append(recipe)
                    changed = True
        return out`,
          javascript: r`var findAllRecipes = function(recipes, ingredients, supplies) {
    const have = new Set(supplies), made = new Array(recipes.length).fill(false), out = [];
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < recipes.length; i++) {
            if (made[i] || !ingredients[i].every((x) => have.has(x))) continue;
            made[i] = true;
            have.add(recipes[i]);
            out.push(recipes[i]);
            changed = true;
        }
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Kahn\'s algorithm: supplies unlock recipes',
        idea: 'Each recipe waits on a count of missing ingredients (its in-degree). Start a queue with the supplies; each item taken from the queue satisfies one need of every recipe that uses it. A recipe whose count reaches 0 can be made, and becomes an item itself.',
        steps: [
          'For each recipe `i`, set `need[i] = ingredients[i].length`, and add `i` to `usedBy[ingredient]` for each ingredient.',
          'Queue all supplies.',
          'Pop an item; for each recipe in `usedBy[item]`, decrease its `need`; at 0, add the recipe to the answer and queue its name.',
          'Return the answer. Recipes in a cycle, or needing something unavailable, never reach 0.',
        ],
        time: 'O(S + R·I)', space: 'O(S + R·I)',
        why: 'Every supply and recipe is queued at most once, and every ingredient link is followed once.',
        code: {
          java: r`class Solution {
    public List<String> findAllRecipes(String[] recipes, List<List<String>> ingredients, String[] supplies) {
        Map<String, List<Integer>> usedBy = new HashMap<>();
        int[] need = new int[recipes.length];
        for (int i = 0; i < recipes.length; i++) {
            need[i] = ingredients.get(i).size();
            for (String ing : ingredients.get(i)) usedBy.computeIfAbsent(ing, k -> new ArrayList<>()).add(i);
        }
        Deque<String> queue = new ArrayDeque<>(Arrays.asList(supplies));
        List<String> out = new ArrayList<>();
        while (!queue.isEmpty()) {
            for (int i : usedBy.getOrDefault(queue.poll(), List.of())) {
                if (--need[i] == 0) { out.add(recipes[i]); queue.add(recipes[i]); }
            }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<string> findAllRecipes(vector<string>& recipes, vector<vector<string>>& ingredients, vector<string>& supplies) {
        unordered_map<string, vector<int>> usedBy;
        vector<int> need(recipes.size());
        for (size_t i = 0; i < recipes.size(); i++) {
            need[i] = ingredients[i].size();
            for (auto& ing : ingredients[i]) usedBy[ing].push_back(i);
        }
        queue<string> q;
        for (auto& s : supplies) q.push(s);
        vector<string> out;
        while (!q.empty()) {
            string item = q.front();
            q.pop();
            auto it = usedBy.find(item);
            if (it == usedBy.end()) continue;
            for (int i : it->second)
                if (--need[i] == 0) { out.push_back(recipes[i]); q.push(recipes[i]); }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def findAllRecipes(self, recipes: List[str], ingredients: List[List[str]], supplies: List[str]) -> List[str]:
        used_by = defaultdict(list)
        need = [len(ing) for ing in ingredients]
        for i, ing in enumerate(ingredients):
            for x in ing:
                used_by[x].append(i)
        queue, out = deque(supplies), []
        while queue:
            for i in used_by.get(queue.popleft(), []):
                need[i] -= 1
                if need[i] == 0:
                    out.append(recipes[i])
                    queue.append(recipes[i])
        return out`,
          javascript: r`var findAllRecipes = function(recipes, ingredients, supplies) {
    const usedBy = new Map(), need = ingredients.map((ing) => ing.length);
    ingredients.forEach((ing, i) => {
        for (const x of ing) {
            if (!usedBy.has(x)) usedBy.set(x, []);
            usedBy.get(x).push(i);
        }
    });
    const queue = [...supplies], out = [];
    for (let h = 0; h < queue.length; h++)
        for (const i of usedBy.get(queue[h]) ?? [])
            if (--need[i] === 0) { out.push(recipes[i]); queue.push(recipes[i]); }
    return out;
};`,
        },
      },
    ],
  },

  'sort-items-by-groups-respecting-dependencies': {
    pattern: 'Two-level topological sort: order the groups, then the items inside each group',
    approaches: [
      {
        level: 'Optimal', name: 'Topologically sort groups and items separately, then combine',
        idea: 'Give every ungrouped item its own new group, so every item belongs to exactly one group. A dependency between items in different groups becomes an edge between their groups; one inside a group stays an item edge. Sort the groups topologically, sort the items topologically, then output each group\'s items (in item order) in group order.',
        steps: [
          'Assign group ids `m, m + 1, …` to items with group −1.',
          'For each `before → i`: add item edge `before → i`; if their groups differ, add group edge `group[before] → group[i]`.',
          'Topologically sort items and groups with Kahn\'s algorithm; if either has a cycle, return `[]`.',
          'Bucket the sorted items by group, then concatenate the buckets in the sorted group order.',
        ],
        time: 'O(n + E)', space: 'O(n + E)',
        why: 'Two Kahn passes over at most n items/groups and E dependency edges, plus linear bucketing. Sorting items globally first keeps each group\'s items in a valid internal order.',
        code: {
          java: r`class Solution {
    public int[] sortItems(int n, int m, int[] group, List<List<Integer>> beforeItems) {
        for (int i = 0; i < n; i++) if (group[i] == -1) group[i] = m++;
        List<List<Integer>> itemNext = new ArrayList<>(), groupNext = new ArrayList<>();
        for (int i = 0; i < n; i++) itemNext.add(new ArrayList<>());
        for (int g = 0; g < m; g++) groupNext.add(new ArrayList<>());
        int[] itemIn = new int[n], groupIn = new int[m];
        for (int i = 0; i < n; i++)
            for (int b : beforeItems.get(i)) {
                itemNext.get(b).add(i);
                itemIn[i]++;
                if (group[b] != group[i]) { groupNext.get(group[b]).add(group[i]); groupIn[group[i]]++; }
            }
        List<Integer> items = topo(itemNext, itemIn), groups = topo(groupNext, groupIn);
        if (items == null || groups == null) return new int[0];
        List<List<Integer>> bucket = new ArrayList<>();
        for (int g = 0; g < m; g++) bucket.add(new ArrayList<>());
        for (int i : items) bucket.get(group[i]).add(i);
        int[] out = new int[n];
        int w = 0;
        for (int g : groups) for (int i : bucket.get(g)) out[w++] = i;
        return out;
    }

    private List<Integer> topo(List<List<Integer>> next, int[] indeg) {
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < indeg.length; i++) if (indeg[i] == 0) order.add(i);
        for (int h = 0; h < order.size(); h++)
            for (int v : next.get(order.get(h))) if (--indeg[v] == 0) order.add(v);
        return order.size() == indeg.length ? order : null;
    }
}`,
          cpp: r`class Solution {
    bool topo(vector<vector<int>>& next, vector<int>& indeg, vector<int>& order) {
        for (int i = 0; i < (int) indeg.size(); i++) if (indeg[i] == 0) order.push_back(i);
        for (size_t h = 0; h < order.size(); h++)
            for (int v : next[order[h]]) if (--indeg[v] == 0) order.push_back(v);
        return order.size() == indeg.size();
    }
public:
    vector<int> sortItems(int n, int m, vector<int>& group, vector<vector<int>>& beforeItems) {
        for (int i = 0; i < n; i++) if (group[i] == -1) group[i] = m++;
        vector<vector<int>> itemNext(n), groupNext(m);
        vector<int> itemIn(n, 0), groupIn(m, 0);
        for (int i = 0; i < n; i++)
            for (int b : beforeItems[i]) {
                itemNext[b].push_back(i);
                itemIn[i]++;
                if (group[b] != group[i]) { groupNext[group[b]].push_back(group[i]); groupIn[group[i]]++; }
            }
        vector<int> items, groups;
        if (!topo(itemNext, itemIn, items) || !topo(groupNext, groupIn, groups)) return {};
        vector<vector<int>> bucket(m);
        for (int i : items) bucket[group[i]].push_back(i);
        vector<int> out;
        for (int g : groups) for (int i : bucket[g]) out.push_back(i);
        return out;
    }
};`,
          python: r`class Solution:
    def sortItems(self, n: int, m: int, group: List[int], beforeItems: List[List[int]]) -> List[int]:
        for i in range(n):
            if group[i] == -1:
                group[i] = m
                m += 1
        item_next, group_next = [[] for _ in range(n)], [[] for _ in range(m)]
        item_in, group_in = [0] * n, [0] * m
        for i in range(n):
            for b in beforeItems[i]:
                item_next[b].append(i)
                item_in[i] += 1
                if group[b] != group[i]:
                    group_next[group[b]].append(group[i])
                    group_in[group[i]] += 1
        def topo(nxt, indeg):
            order = [i for i in range(len(indeg)) if indeg[i] == 0]
            for u in order:
                for v in nxt[u]:
                    indeg[v] -= 1
                    if indeg[v] == 0:
                        order.append(v)
            return order if len(order) == len(indeg) else None
        items, groups = topo(item_next, item_in), topo(group_next, group_in)
        if items is None or groups is None:
            return []
        bucket = [[] for _ in range(m)]
        for i in items:
            bucket[group[i]].append(i)
        return [i for g in groups for i in bucket[g]]`,
          javascript: r`var sortItems = function(n, m, group, beforeItems) {
    for (let i = 0; i < n; i++) if (group[i] === -1) group[i] = m++;
    const itemNext = Array.from({ length: n }, () => []), groupNext = Array.from({ length: m }, () => []);
    const itemIn = new Array(n).fill(0), groupIn = new Array(m).fill(0);
    for (let i = 0; i < n; i++)
        for (const b of beforeItems[i]) {
            itemNext[b].push(i);
            itemIn[i]++;
            if (group[b] !== group[i]) { groupNext[group[b]].push(group[i]); groupIn[group[i]]++; }
        }
    const topo = (next, indeg) => {
        const order = [];
        for (let i = 0; i < indeg.length; i++) if (indeg[i] === 0) order.push(i);
        for (let h = 0; h < order.length; h++)
            for (const v of next[order[h]]) if (--indeg[v] === 0) order.push(v);
        return order.length === indeg.length ? order : null;
    };
    const items = topo(itemNext, itemIn), groups = topo(groupNext, groupIn);
    if (!items || !groups) return [];
    const bucket = Array.from({ length: m }, () => []);
    for (const i of items) bucket[group[i]].push(i);
    return groups.flatMap((g) => bucket[g]);
};`,
        },
      },
    ],
  },
};
