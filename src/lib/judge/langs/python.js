import { lit, fill, extrasOf, linesIn, mapLines } from './common.js';

/**
 * Python 3 harness: LeetCode's usual imports and TreeNode/ListNode, the learner's class, then one
 * function per test, all run on a thread with a large stack so deep recursion behaves like LeetCode.
 */

const HINTS = {
  int: 'int', long: 'int', double: 'float', boolean: 'bool', char: 'str', String: 'str', Integer: 'int', void: 'None',
  'int[]': 'List[int]', 'long[]': 'List[int]', 'double[]': 'List[float]', 'char[]': 'List[str]', 'String[]': 'List[str]',
  'int[][]': 'List[List[int]]', 'char[][]': 'List[List[str]]', 'String[][]': 'List[List[str]]',
  'List<Integer>': 'List[int]', 'List<String>': 'List[str]', 'List<List<Integer>>': 'List[List[int]]',
  'List<List<String>>': 'List[List[str]]', 'List<Boolean>': 'List[bool]', 'List<Double>': 'List[float]',
  TreeNode: 'Optional[TreeNode]', ListNode: 'Optional[ListNode]', 'ListNode[]': 'List[Optional[ListNode]]', Node: "Optional['Node']",
  'Iterator<Integer>': null, 'List<NestedInteger>': "[NestedInteger]", MountainArray: "'MountainArray'",
};

function hint(t) {
  if (!(t in HINTS)) throw new Error(`Unsupported type for Python: ${t}`);
  return HINTS[t];
}

/** Python expression turning parsed JSON `v` into the argument's value. */
const CONV = {
  TreeNode: (v) => `_bcb_tree(${v})`,
  ListNode: (v) => `_bcb_list(${v})`,
  'ListNode[]': (v) => `[_bcb_list(x) for x in ${v}]`,
  'Iterator<Integer>': (v) => `Iterator(${v})`,
  'List<NestedInteger>': (v) => `_bcb_nested(${v})`,
  double: (v) => `float(${v})`,
};
const conv = (t, v) => (CONV[t] ? CONV[t](v) : v);

const params = (ps) => ps.map(([t, n]) => (hint(t) ? `, ${n}: ${hint(t)}` : `, ${n}`)).join('');
const ret = (t) => (hint(t) ? ` -> ${hint(t)}` : '');

const PRELUDE = String.raw`import sys, json, math, heapq, bisect, random, string, re, threading, traceback, collections, itertools, functools, operator
from typing import *
from collections import *
from heapq import *
from bisect import *
from functools import *
from itertools import *
from math import inf, gcd, sqrt, isqrt, log2, ceil, floor, comb, factorial
sys.setrecursionlimit(1000000)

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def _bcb_tree(v):
    if not v or v[0] is None:
        return None
    root = TreeNode(v[0])
    q = deque([root])
    i = 1
    while q and i < len(v):
        n = q.popleft()
        if i < len(v) and v[i] is not None:
            n.left = TreeNode(v[i])
            q.append(n.left)
        i += 1
        if i < len(v) and v[i] is not None:
            n.right = TreeNode(v[i])
            q.append(n.right)
        i += 1
    return root

def _bcb_list(v):
    d = t = ListNode()
    for x in v:
        t.next = ListNode(x)
        t = t.next
    return d.next

def _bcb_find(n, v):
    while n is not None:
        if n.val == v:
            return n
        l = _bcb_find(n.left, v)
        if l is not None:
            return l
        n = n.right
    return None

def _bcb_cycle(v, pos):
    h = _bcb_list(v)
    if pos < 0 or h is None:
        return h
    t, at, i = h, None, 0
    while True:
        if i == pos:
            at = t
        if t.next is None:
            break
        t = t.next
        i += 1
    t.next = at
    return h

def _bcb_index(h, n):
    i, t = 0, h
    while t is not None and i < 100000:
        if t is n:
            return i
        t, i = t.next, i + 1
    return -1

def _bcb_f(o, out, d=0):
    if d > 64:
        out.append('"…"')
    elif o is None:
        out.append('null')
    elif isinstance(o, bool):
        out.append('true' if o else 'false')
    elif isinstance(o, int):
        out.append(str(o))
    elif isinstance(o, float):
        out.append(repr(o) if math.isfinite(o) else json.dumps('NaN' if o != o else 'Infinity' if o > 0 else '-Infinity'))
    elif isinstance(o, str):
        out.append(json.dumps(o, ensure_ascii=False))
    elif isinstance(o, TreeNode):
        vals, level = [], [o]
        while level and len(vals) < 2000000:
            nxt = []
            for n in level:
                if n is None:
                    vals.append(None)
                    continue
                vals.append(n.val)
                nxt.append(n.left)
                nxt.append(n.right)
            level = nxt if any(x is not None for x in nxt) else []
        while vals and vals[-1] is None:
            vals.pop()
        _bcb_f(vals, out, d + 1)
    elif isinstance(o, ListNode):
        vals, n = [], o
        while n is not None and len(vals) < 2000000:
            vals.append(n.val)
            n = n.next
        if n is not None:
            vals.append('…cycle')
        _bcb_f(vals, out, d + 1)
    elif isinstance(o, (list, tuple, deque, set, frozenset)) or (hasattr(o, '__iter__') and not isinstance(o, (dict, bytes))):
        out.append('[')
        for k, x in enumerate(o):
            if k:
                out.append(',')
            _bcb_f(x, out, d + 1)
        out.append(']')
    else:
        out.append(json.dumps(str(o), ensure_ascii=False))

def _bcb_out(i, r):
    out = []
    _bcb_f(r, out)
    sys.stdout.write('\n\x01BCB|%d|%s\n' % (i, ''.join(out)))
    sys.stdout.flush()

def _bcb_err(i, e):
    line = -1
    for fr in reversed(traceback.extract_tb(e.__traceback__)):
        if fr.filename == __file__ and _BCB_FIRST <= fr.lineno <= _BCB_LAST:
            line = fr.lineno
            break
    msg = ' (recursion too deep)' if isinstance(e, RecursionError) else (': ' + str(e).replace('\n', ' ')) if str(e) else ''
    sys.stdout.write('\n\x01BCB|%d|!%s%s@L%d\n' % (i, type(e).__name__, msg, line))
    sys.stdout.flush()
`;

const EXTRAS = {
  TreeNode: {
    comment: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right`,
  },
  ListNode: {
    comment: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next`,
  },
  GraphNode: {
    pre: String.raw`
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def _bcb_graph(adj):
    if not adj:
        return None
    n = [None] + [Node(i) for i in range(1, len(adj) + 1)]
    for i, row in enumerate(adj, 1):
        n[i].neighbors = [n[x] for x in row]
    return n[1]

def _bcb_graph_dump(copy, original):
    if copy is None:
        return []
    orig, q = set(), deque()
    if original is not None:
        orig.add(id(original))
        q.append(original)
    while q:
        for x in q.popleft().neighbors:
            if id(x) not in orig:
                orig.add(id(x))
                q.append(x)
    seen = {copy.val: copy}
    q.append(copy)
    while q:
        c = q.popleft()
        if id(c) in orig:
            return 'copy shares nodes with the original'
        for x in c.neighbors:
            if x.val not in seen:
                seen[x.val] = x
                q.append(x)
    return [[x.val for x in seen[k].neighbors] for k in sorted(seen)]
`,
    comment: `"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""`,
  },
  NextNode: {
    pre: String.raw`
class Node:
    def __init__(self, val: int = 0, left: 'Node' = None, right: 'Node' = None, next: 'Node' = None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next

def _bcb_next_tree(v):
    if not v or v[0] is None:
        return None
    root = Node(v[0])
    q, i = deque([root]), 1
    while q and i < len(v):
        n = q.popleft()
        if i < len(v) and v[i] is not None:
            n.left = Node(v[i])
            q.append(n.left)
        i += 1
        if i < len(v) and v[i] is not None:
            n.right = Node(v[i])
            q.append(n.right)
        i += 1
    return root

def _bcb_next_dump(root):
    out, start = [], root
    while start is not None and len(out) < 2000000:
        n = start
        while n is not None and len(out) < 2000000:
            out.append(str(n.val))
            n = n.next
        out.append('#')
        nxt, n = None, start
        while n is not None and nxt is None:
            nxt = n.left if n.left is not None else n.right
            n = n.next
        start = nxt
    return out
`,
    comment: `"""
# Definition for a Node.
class Node:
    def __init__(self, val: int = 0, left: 'Node' = None, right: 'Node' = None, next: 'Node' = None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next
"""`,
  },
  NestedInteger: {
    pre: String.raw`
class NestedInteger:
    def __init__(self, value=None, items=None):
        self._v = value
        self._l = items
    def isInteger(self) -> bool:
        return self._l is None
    def getInteger(self) -> int:
        return self._v
    def getList(self) -> ['NestedInteger']:
        return self._l

def _bcb_nested(v):
    return [NestedInteger(items=_bcb_nested(x)) if isinstance(x, list) else NestedInteger(value=x) for x in v]
`,
    comment: `# """
# This is the interface that allows for creating nested lists (provided).
# """
# class NestedInteger:
#    def isInteger(self) -> bool:            # True if this holds a single integer
#    def getInteger(self) -> int:            # the integer, or None if it holds a list
#    def getList(self) -> [NestedInteger]:   # the list, or None if it holds an integer`,
  },
  Iterator: {
    pre: String.raw`
class Iterator:
    def __init__(self, nums):
        self._d = list(nums)
        self._i = 0
    def hasNext(self):
        return self._i < len(self._d)
    def next(self):
        v = self._d[self._i]
        self._i += 1
        return v
`,
    comment: `# Below is the interface for Iterator, which is already defined for you.
# class Iterator:
#     def __init__(self, nums):
#     def hasNext(self):   # True if the iteration has more elements
#     def next(self):      # the next element`,
  },
  VersionControl: {
    pre: '\n_bcb_bad = [0]\ndef isBadVersion(version: int) -> bool:\n    return version >= _bcb_bad[0]\n',
    comment: '# The isBadVersion API is already defined for you.\n# def isBadVersion(version: int) -> bool:',
  },
  SolBase: {
    pre: '\n_bcb_rng = random.Random(7)\ndef rand7():\n    return _bcb_rng.randint(1, 7)\n',
    comment: '# The rand7() API is already defined for you.\n# def rand7():\n# @return a random integer in the range 1 to 7',
  },
  GuessGame: {
    pre: '\n_bcb_pick = [0]\ndef guess(num: int) -> int:\n    return -1 if num > _bcb_pick[0] else 1 if num < _bcb_pick[0] else 0\n',
    comment: `# The guess API is already defined for you.
# @param num, your guess
# @return -1 if num is higher than the picked number
#          1 if num is lower than the picked number
#          otherwise return 0
# def guess(num: int) -> int:`,
  },
  MountainArray: {
    pre: String.raw`
class MountainArray:
    def __init__(self, a):
        self._bcb_a = a
        self._bcb_calls = 0
    def get(self, index: int) -> int:
        self._bcb_calls += 1
        if self._bcb_calls > 100:
            raise RuntimeError('more than 100 calls to MountainArray.get')
        return self._bcb_a[index]
    def length(self) -> int:
        return len(self._bcb_a)
`,
    comment: `# """
# This is MountainArray's API interface (provided).
# You should not implement it, or speculate about its implementation
# """
# class MountainArray:
#    def get(self, index: int) -> int:   # at most 100 calls in total
#    def length(self) -> int:`,
  },
  RandomNode: {
    pre: String.raw`
class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random

def _bcb_random_list(v):
    n = [Node(x[0]) for x in v]
    for i, x in enumerate(v):
        if i + 1 < len(n):
            n[i].next = n[i + 1]
        if x[1] is not None:
            n[i].random = n[x[1]]
    return n[0] if n else None

def _bcb_random_dump(copy, original):
    orig = set()
    t = original
    while t is not None:
        orig.add(id(t))
        t = t.next
    at, order, t = {}, [], copy
    while t is not None and len(order) < 100000:
        if id(t) in orig:
            return 'copy shares nodes with the original'
        at[id(t)] = len(order)
        order.append(t)
        t = t.next
    out = []
    for t in order:
        if t.random is not None and id(t.random) in orig:
            return 'copy points into the original list'
        out.append([t.val, None if t.random is None else at.get(id(t.random))])
    return out
`,
    comment: `"""
# Definition for a Node.
class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
"""`,
  },
  QuadNode: {
    pre: String.raw`
class Node:
    def __init__(self, val=False, isLeaf=False, topLeft=None, topRight=None, bottomLeft=None, bottomRight=None):
        self.val = val
        self.isLeaf = isLeaf
        self.topLeft = topLeft
        self.topRight = topRight
        self.bottomLeft = bottomLeft
        self.bottomRight = bottomRight

def _bcb_quad_dump(root):
    level, out, i = [root], [], 0
    while i < len(level) and i < 2000000:
        n = level[i]
        i += 1
        if n is None:
            out.append(None)
            continue
        out.append([1 if n.isLeaf else 0, (1 if n.val else 0) if n.isLeaf else 1])
        if n.isLeaf:
            level.extend([None] * 4)
        else:
            level.extend([n.topLeft, n.topRight, n.bottomLeft, n.bottomRight])
    while out and out[-1] is None:
        out.pop()
    return out
`,
    comment: `"""
# Definition for a QuadTree node.
class Node:
    def __init__(self, val, isLeaf, topLeft, topRight, bottomLeft, bottomRight):
        self.val = val
        self.isLeaf = isLeaf
        self.topLeft = topLeft
        self.topRight = topRight
        self.bottomLeft = bottomLeft
        self.bottomRight = bottomRight
"""`,
  },
};

/** Drivers for odd signatures: lines of a function body that returns the result, using `s` and $0, $1… */
const CALLS = {
  'first-bad-version': ['_bcb_bad[0] = json.loads($1)', 'return s.firstBadVersion(json.loads($0))'],
  'lowest-common-ancestor-of-a-binary-search-tree': ['t = _bcb_tree(json.loads($0))', 'c = s.lowestCommonAncestor(t, _bcb_find(t, json.loads($1)), _bcb_find(t, json.loads($2)))', 'return None if c is None else c.val'],
  'lowest-common-ancestor-of-a-binary-tree': ['t = _bcb_tree(json.loads($0))', 'c = s.lowestCommonAncestor(t, _bcb_find(t, json.loads($1)), _bcb_find(t, json.loads($2)))', 'return None if c is None else c.val'],
  'flatten-nested-list-iterator': ['it = NestedIterator(_bcb_nested(json.loads($0)))', 'out = []', 'while it.hasNext() and len(out) < 100000:', '    out.append(it.next())', 'return out'],
  'linked-list-cycle': ['return s.hasCycle(_bcb_cycle(json.loads($0), json.loads($1)))'],
  'linked-list-cycle-ii': ['h = _bcb_cycle(json.loads($0), json.loads($1))', 'c = s.detectCycle(h)', 'return -1 if c is None else _bcb_index(h, c)'],
  'clone-graph': ['o = _bcb_graph(json.loads($0))', 'return _bcb_graph_dump(s.cloneGraph(o), o)'],
  'implement-rand10-using-rand7': ['return [s.rand10() for _ in range(json.loads($0))]'],
  'populating-next-right-pointers-in-each-node': ['return _bcb_next_dump(s.connect(_bcb_next_tree(json.loads($0))))'],
  'serialize-and-deserialize-binary-tree': ['ser, deser = Codec(), Codec()', 'r = deser.deserialize(ser.serialize(_bcb_tree(json.loads($0))))', 'return [] if r is None else r'],
  'guess-number-higher-or-lower': ['_bcb_pick[0] = json.loads($1)', 'return s.guessNumber(json.loads($0))'],
  'find-in-mountain-array': ['return s.findInMountainArray(json.loads($1), MountainArray(json.loads($0)))'],
  'copy-list-with-random-pointer': ['o = _bcb_random_list(json.loads($0))', 'return _bcb_random_dump(s.copyRandomList(o), o)'],
  'construct-quad-tree': ['return _bcb_quad_dump(s.construct(json.loads($0)))'],
  'encode-and-decode-strings': ['enc, dec = Codec(), Codec()', 'return dec.decode(enc.encode(json.loads($0)))'],
  'remove-element': ['a = json.loads($0)', 'k = s.removeElement(a, json.loads($1))', 'return [k, sorted(a[:max(0, min(k, len(a)))])]'],
  'remove-duplicates-from-sorted-array': ['a = json.loads($0)', 'k = s.removeDuplicates(a)', 'return [k, a[:max(0, min(k, len(a)))]]'],
};

export function starter(spec) {
  const extras = extrasOf(spec);
  const comments = [...extras].map((n) => EXTRAS[n]?.comment).filter(Boolean);
  const head = comments.length ? `${comments.join('\n')}\n\n` : '';
  if (spec.design) {
    const { cls, ctor, methods } = spec.design;
    const parts = [`    def __init__(self${params(ctor)}):\n        `];
    for (const [r, name, ps] of methods) parts.push(`    def ${name}(self${params(ps)})${ret(r)}:\n        `);
    return `${head}class ${cls}:\n\n${parts.join('\n\n')}\n`;
  }
  const ps = spec.starterParams ?? spec.params;
  return `${head}class Solution:\n    def ${spec.method}(self${params(ps)})${ret(spec.returns)}:\n        `;
}

const isNode = (t) => t === 'TreeNode' || t === 'ListNode';

function functionBody(spec, test) {
  const lines = spec.design ? [] : ['s = Solution()'];
  const custom = CALLS[spec.slug];
  if (custom) return [...lines, ...custom.map((l) => fill(l, test.in))];
  if (spec.call) throw new Error(`No Python driver for ${spec.slug}`);
  spec.params.forEach(([t], k) => lines.push(`a${k} = ${conv(t, `json.loads(${lit(test.in[k])})`)}`));
  const call = `s.${spec.method}(${spec.params.map((_, k) => `a${k}`).join(', ')})`;
  if (spec.returns === 'void') return [...lines, call, `return a${spec.output ?? 0}`];
  lines.push(`r = ${call}`);
  // LeetCode prints an empty list or tree as [], not null
  if (isNode(spec.returns)) lines.push('return [] if r is None else r');
  else lines.push('return r');
  return lines;
}

function designBody(spec, test) {
  const { cls, ctor, methods } = spec.design;
  const args = (ps) => ps.map(([t], k) => conv(t, `a[${k}]`)).join(', ');
  const cases = [`if op == ${lit(cls)}:`, `    obj = ${cls}(${args(ctor)})`, '    out.append(None)'];
  for (const [r, name, ps] of methods) {
    cases.push(`elif op == ${lit(name)}:`);
    if (r === 'void') cases.push(`    obj.${name}(${args(ps)})`, '    out.append(None)');
    else cases.push(`    out.append(obj.${name}(${args(ps)}))`);
  }
  return [
    `ops = json.loads(${lit(test.in[0])})`,
    `args = json.loads(${lit(test.in[1])})`,
    'out, obj = [], None',
    'for op, a in zip(ops, args):',
    ...cases.map((c) => `    ${c}`),
    '    else:',
    "        raise ValueError('unknown operation ' + op)",
    'return out',
  ];
}

export function build(spec, code, tests) {
  const pre = [...extrasOf(spec)].map((n) => EXTRAS[n]?.pre).filter(Boolean).join('');
  const prelude = `${PRELUDE}${pre}\n`;
  const lineOffset = linesIn(prelude);
  const userLines = linesIn(`${code}\n`);
  const fns = tests.map((test, i) => {
    const body = spec.design && !CALLS[spec.slug] ? designBody(spec, test) : functionBody(spec, test);
    return `def _bcb_t${i}():\n${body.map((l) => `    ${l}`).join('\n')}`;
  });
  const main = `

_BCB_FIRST, _BCB_LAST = ${lineOffset + 1}, ${lineOffset + userLines}

${fns.join('\n\n')}

def _bcb_run():
    for i, t in enumerate([${tests.map((_, i) => `_bcb_t${i}`).join(', ')}]):
        try:
            _bcb_out(i, t())
        except BaseException as e:
            _bcb_err(i, e)

threading.stack_size(256 * 1024 * 1024)
_bcb_th = threading.Thread(target=_bcb_run)
_bcb_th.start()
_bcb_th.join()
`;
  return { source: `${prelude}${code}\n${main}`, lineOffset, userLines };
}

const PY_LINE = /File "[^"]*script\.py", line (\d+)/g;

/** A syntax error stops the whole file before any test runs: show it as a compile error. */
export function compileError(r, ctx) {
  const err = r.stderr ?? '';
  if (r.stdout?.includes('\u0001BCB|') || !/^(SyntaxError|IndentationError|TabError)\b/m.test(err)) return null;
  return cleanStderr(err, ctx);
}

export function cleanStderr(text, { lineOffset, userLines }) {
  return mapLines(text, PY_LINE, lineOffset, userLines, (n) => (n ? `Line ${n}` : 'judge code'));
}

export default {
  id: 'python',
  label: 'Python',
  version: 'Python 3.13',
  judge0: 109,
  starter,
  build,
  compileError,
  cleanStderr,
  supports: (spec) => !spec.call || Boolean(CALLS[spec.slug]),
};
