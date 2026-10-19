import { lit, fill, extrasOf, linesIn, mapLines } from './common.js';

/**
 * JavaScript (Node) harness: LeetCode-style functions (`var twoSum = function(nums, target) {…}`)
 * and prototype classes. Everything runs in a worker thread with a large stack, so deep recursion
 * behaves like LeetCode; console.log writes synchronously so output stays in order.
 * Like LeetCode, PriorityQueue / MinPriorityQueue / MaxPriorityQueue and Queue (datastructures-js) are provided.
 */

const DOC = {
  int: 'number', long: 'number', double: 'number', boolean: 'boolean', char: 'character', String: 'string', Integer: 'number', void: 'void',
  'int[]': 'number[]', 'long[]': 'number[]', 'double[]': 'number[]', 'char[]': 'character[]', 'String[]': 'string[]',
  'int[][]': 'number[][]', 'char[][]': 'character[][]', 'String[][]': 'string[][]',
  'List<Integer>': 'number[]', 'List<String>': 'string[]', 'List<List<Integer>>': 'number[][]',
  'List<List<String>>': 'string[][]', 'List<Boolean>': 'boolean[]', 'List<Double>': 'number[]',
  TreeNode: 'TreeNode', ListNode: 'ListNode', 'ListNode[]': 'ListNode[]', Node: '_Node',
  'Iterator<Integer>': 'Iterator', 'List<NestedInteger>': 'NestedInteger[]',
};

function doc(t) {
  const d = DOC[t];
  if (!d) throw new Error(`Unsupported type for JavaScript: ${t}`);
  return d;
}

const CONV = {
  TreeNode: (v) => `__bcbTree(${v})`,
  ListNode: (v) => `__bcbList(${v})`,
  'ListNode[]': (v) => `${v}.map(__bcbList)`,
  'Iterator<Integer>': (v) => `new Iterator(${v})`,
  'List<NestedInteger>': (v) => `__bcbNested(${v})`,
};
const conv = (t, v) => (CONV[t] ? CONV[t](v) : v);

/** JSDoc block for a function's parameters and return type. */
function jsdoc(ps, r, indent = '') {
  const lines = ps.map(([t, n]) => `${indent} * @param {${doc(t)}} ${n}`);
  if (r !== undefined) lines.push(`${indent} * @return {${doc(r)}}`);
  return lines.length ? `${indent}/**\n${lines.join('\n')}\n${indent} */\n` : '';
}

// The whole program runs in a worker; the main thread only starts it (and reports a crash).
const OPEN = String.raw`const __bcbWT = require('worker_threads');
if (__bcbWT.isMainThread) {
    new __bcbWT.Worker(__filename, { resourceLimits: { stackSizeMb: 256 } }).on('error', (e) => { process.stderr.write(String((e && e.stack) || e) + '\n'); process.exitCode = 1; });
} else {
const __bcbFs = require('fs'), __bcbUtil = require('util');
console.log = (...a) => { __bcbFs.writeSync(1, __bcbUtil.format(...a) + '\n'); };
console.error = (...a) => { __bcbFs.writeSync(2, __bcbUtil.format(...a) + '\n'); };
process.stdout.write = (s) => { __bcbFs.writeSync(1, String(s)); return true; };

function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
}

class PriorityQueue {
    constructor(compare, values) {
        if (compare && typeof compare === 'object') compare = compare.compare ?? (compare.priority ? ((f) => (a, b) => f(a) - f(b))(compare.priority) : undefined);
        if (typeof compare !== 'function') throw new Error('PriorityQueue needs a compare function');
        this._cmp = compare;
        this._h = [];
        if (values) for (const v of values) this.enqueue(v);
    }
    static fromArray(values, compare) { return new this(compare, values); }
    size() { return this._h.length; }
    isEmpty() { return this._h.length === 0; }
    front() { return this._h.length ? this._h[0] : null; }
    back() { let b = null; for (const v of this._h) if (b === null || this._cmp(v, b) > 0) b = v; return b; }
    enqueue(v) {
        const h = this._h; h.push(v);
        let i = h.length - 1;
        while (i > 0) { const p = (i - 1) >> 1; if (this._cmp(h[i], h[p]) >= 0) break; [h[i], h[p]] = [h[p], h[i]]; i = p; }
        return this;
    }
    push(v) { return this.enqueue(v); }
    dequeue() {
        const h = this._h;
        if (!h.length) return null;
        const top = h[0], last = h.pop();
        if (h.length) {
            h[0] = last;
            let i = 0;
            for (;;) {
                const l = 2 * i + 1, r = l + 1; let m = i;
                if (l < h.length && this._cmp(h[l], h[m]) < 0) m = l;
                if (r < h.length && this._cmp(h[r], h[m]) < 0) m = r;
                if (m === i) break;
                [h[i], h[m]] = [h[m], h[i]]; i = m;
            }
        }
        return top;
    }
    pop() { return this.dequeue(); }
    toArray() { return [...this._h].sort(this._cmp); }
    clear() { this._h = []; }
    contains(cb) { return this._h.some(cb); }
    remove(cb) { const keep = [], out = []; for (const v of this._h) (cb(v) ? out : keep).push(v); this._h = []; keep.forEach((v) => this.enqueue(v)); return out; }
    [Symbol.iterator]() { return this.toArray()[Symbol.iterator](); }
}
const __bcbKey = (opt) => (typeof opt === 'function' ? opt : opt && typeof opt === 'object' && opt.priority ? opt.priority : (x) => x);
class MinPriorityQueue extends PriorityQueue {
    constructor(getCompareValue, values) { const f = __bcbKey(getCompareValue); super((a, b) => (f(a) < f(b) ? -1 : f(a) > f(b) ? 1 : 0), values); }
    static fromArray(values, getCompareValue) { return new MinPriorityQueue(getCompareValue, values); }
}
class MaxPriorityQueue extends PriorityQueue {
    constructor(getCompareValue, values) { const f = __bcbKey(getCompareValue); super((a, b) => (f(a) > f(b) ? -1 : f(a) < f(b) ? 1 : 0), values); }
    static fromArray(values, getCompareValue) { return new MaxPriorityQueue(getCompareValue, values); }
}
class Queue {
    constructor(values) { this._a = values ? [...values] : []; this._o = 0; }
    static fromArray(values) { return new Queue(values); }
    size() { return this._a.length - this._o; }
    isEmpty() { return this.size() === 0; }
    front() { return this.size() ? this._a[this._o] : null; }
    back() { return this.size() ? this._a[this._a.length - 1] : null; }
    enqueue(v) { this._a.push(v); return this; }
    push(v) { return this.enqueue(v); }
    dequeue() {
        if (!this.size()) return null;
        const v = this._a[this._o++];
        if (this._o * 2 >= this._a.length) { this._a = this._a.slice(this._o); this._o = 0; }
        return v;
    }
    pop() { return this.dequeue(); }
    toArray() { return this._a.slice(this._o); }
    clear() { this._a = []; this._o = 0; }
}

function __bcbTree(v) {
    if (!v.length || v[0] === null) return null;
    const root = new TreeNode(v[0]), q = [root];
    let i = 1, h = 0;
    while (h < q.length && i < v.length) {
        const n = q[h++];
        if (i < v.length && v[i] !== null) { n.left = new TreeNode(v[i]); q.push(n.left); } i++;
        if (i < v.length && v[i] !== null) { n.right = new TreeNode(v[i]); q.push(n.right); } i++;
    }
    return root;
}
function __bcbList(v) {
    const d = new ListNode(); let t = d;
    for (const x of v) { t.next = new ListNode(x); t = t.next; }
    return d.next;
}
function __bcbFind(n, v) {
    if (n == null) return null;
    if (n.val === v) return n;
    return __bcbFind(n.left, v) ?? __bcbFind(n.right, v);
}
function __bcbCycle(v, pos) {
    const h = __bcbList(v);
    if (pos < 0 || !h) return h;
    let t = h, at = null, i = 0;
    for (;;) { if (i === pos) at = t; if (!t.next) break; t = t.next; i++; }
    t.next = at;
    return h;
}
function __bcbIndex(h, n) { let i = 0; for (let t = h; t && i < 100000; t = t.next, i++) if (t === n) return i; return -1; }

function __bcbF(o, d = 0) {
    if (d > 64) return '"…"';
    if (o === null || o === undefined) return 'null';
    if (typeof o === 'boolean') return String(o);
    if (typeof o === 'number') return Number.isFinite(o) ? (Object.is(o, -0) ? '0' : String(o)) : JSON.stringify(String(o));
    if (typeof o === 'bigint') return String(o);
    if (typeof o === 'string') return JSON.stringify(o);
    if (typeof o === 'object' && 'val' in o && ('left' in o || 'right' in o) && !('next' in o)) {
        const out = []; let level = [o];
        while (level.length && out.length < 2000000) {
            const next = [];
            for (const n of level) {
                if (n == null) { out.push(null); continue; }
                out.push(n.val); next.push(n.left ?? null, n.right ?? null);
            }
            level = next.some((x) => x != null) ? next : [];
        }
        while (out.length && out[out.length - 1] === null) out.pop();
        return __bcbF(out, d + 1);
    }
    if (typeof o === 'object' && 'val' in o && 'next' in o && !Array.isArray(o)) {
        const out = []; let n = o;
        while (n && out.length < 2000000) { out.push(n.val); n = n.next; }
        if (n) out.push('…cycle');
        return __bcbF(out, d + 1);
    }
    if (Array.isArray(o) || ArrayBuffer.isView(o) || o instanceof Set || (typeof o === 'object' && typeof o[Symbol.iterator] === 'function' && !(o instanceof Map))) {
        return '[' + Array.from(o, (x) => __bcbF(x, d + 1)).join(',') + ']';
    }
    return JSON.stringify(String(o));
}
function __bcbOut(i, r) { __bcbFs.writeSync(1, '\n\u0001BCB|' + i + '|' + __bcbF(r) + '\n'); }
function __bcbErr(i, e) {
    let line = -1;
    const stack = String((e && e.stack) || '');
    for (const raw of stack.split('\n')) {
        if (!raw.includes(__filename)) continue;
        const m = /:(\d+):\d+\)?\s*$/.exec(raw);
        if (m && Number(m[1]) >= __BCB_FIRST && Number(m[1]) <= __BCB_LAST) { line = Number(m[1]); break; }
    }
    let msg;
    if (e instanceof RangeError && /call stack/i.test(e.message)) msg = 'RangeError (recursion too deep)';
    else if (e instanceof Error) msg = e.name + (e.message ? ': ' + e.message.replace(/\n/g, ' ') : '');
    else msg = 'Uncaught ' + String(e);
    __bcbFs.writeSync(1, '\n\u0001BCB|' + i + '|!' + msg + '@L' + line + '\n');
}
`;

const EXTRAS = {
  TreeNode: {
    comment: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */`,
  },
  ListNode: {
    comment: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */`,
  },
  GraphNode: {
    pre: String.raw`
function _Node(val, neighbors) {
    this.val = val === undefined ? 0 : val;
    this.neighbors = neighbors === undefined ? [] : neighbors;
}
function __bcbGraph(adj) {
    if (!adj.length) return null;
    const n = [null];
    for (let i = 1; i <= adj.length; i++) n.push(new _Node(i));
    adj.forEach((row, i) => { n[i + 1].neighbors = row.map((x) => n[x]); });
    return n[1];
}
function __bcbGraphDump(copy, original) {
    if (!copy) return [];
    const orig = new Set(), q = [];
    if (original) { orig.add(original); q.push(original); }
    for (let h = 0; h < q.length; h++) for (const x of q[h].neighbors) if (!orig.has(x)) { orig.add(x); q.push(x); }
    const seen = new Map([[copy.val, copy]]), q2 = [copy];
    for (let h = 0; h < q2.length; h++) {
        const c = q2[h];
        if (orig.has(c)) return 'copy shares nodes with the original';
        for (const x of c.neighbors) if (!seen.has(x.val)) { seen.set(x.val, x); q2.push(x); }
    }
    return [...seen.keys()].sort((a, b) => a - b).map((k) => seen.get(k).neighbors.map((x) => x.val));
}
`,
    comment: `/**
 * // Definition for a _Node.
 * function _Node(val, neighbors) {
 *    this.val = val === undefined ? 0 : val;
 *    this.neighbors = neighbors === undefined ? [] : neighbors;
 * };
 */`,
  },
  NextNode: {
    pre: String.raw`
function _Node(val, left, right, next) {
    this.val = val === undefined ? null : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
    this.next = next === undefined ? null : next;
}
function __bcbNextTree(v) {
    if (!v.length || v[0] === null) return null;
    const root = new _Node(v[0]), q = [root];
    let i = 1, h = 0;
    while (h < q.length && i < v.length) {
        const n = q[h++];
        if (i < v.length && v[i] !== null) { n.left = new _Node(v[i]); q.push(n.left); } i++;
        if (i < v.length && v[i] !== null) { n.right = new _Node(v[i]); q.push(n.right); } i++;
    }
    return root;
}
function __bcbNextDump(root) {
    const out = []; let start = root;
    while (start && out.length < 2000000) {
        for (let n = start; n && out.length < 2000000; n = n.next) out.push(String(n.val));
        out.push('#');
        let nxt = null;
        for (let n = start; n && !nxt; n = n.next) nxt = n.left || n.right;
        start = nxt;
    }
    return out;
}
`,
    comment: `/**
 * // Definition for a _Node.
 * function _Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */`,
  },
  NestedInteger: {
    pre: String.raw`
class NestedInteger {
    constructor(value, items) { this._v = value; this._l = items; }
    isInteger() { return this._l === undefined; }
    getInteger() { return this._l === undefined ? this._v : null; }
    getList() { return this._l === undefined ? null : this._l; }
}
function __bcbNested(v) { return v.map((x) => (Array.isArray(x) ? new NestedInteger(undefined, __bcbNested(x)) : new NestedInteger(x))); }
`,
    comment: `/**
 * // This is the interface that allows for creating nested lists (provided).
 * function NestedInteger() {
 *     this.isInteger = function() { ... };   // true if this holds a single integer
 *     this.getInteger = function() { ... };  // the integer, or null if it holds a list
 *     this.getList = function() { ... };     // the list, or null if it holds an integer
 * };
 */`,
  },
  Iterator: {
    pre: String.raw`
class Iterator {
    constructor(nums) { this._d = [...nums]; this._i = 0; }
    hasNext() { return this._i < this._d.length; }
    next() { return this._d[this._i++]; }
}
`,
    comment: `/**
 * // This is the Iterator's API interface (provided).
 * function Iterator() {
 *    @ return {boolean}
 *    this.hasNext = function() { ... };  // true if the iteration has more elements
 *    @ return {integer}
 *    this.next = function() { ... };     // the next element
 * };
 */`,
  },
  VersionControl: {
    pre: '\nlet __bcbBad = 0;\nfunction isBadVersion(version) { return version >= __bcbBad; }\n',
    comment: `/**
 * Definition for isBadVersion()
 *
 * @param {integer} version number
 * @return {boolean} whether the version is bad
 * isBadVersion = function(version) {
 *     ...
 * };
 */`,
  },
  SolBase: {
    pre: '\nlet __bcbSeed = 7;\nfunction rand7() { __bcbSeed = (__bcbSeed * 1103515245 + 12345) % 2147483648; return 1 + (Math.floor(__bcbSeed / 65536) % 7); }\n',
    comment: '/**\n * The rand7() API is already defined for you.\n * var rand7 = function() {}\n * @return {number} a random integer in the range 1 to 7\n */',
  },
};

/** LeetCode's own JavaScript shape for problems where it isn't a plain function. */
const STARTERS = {
  'first-bad-version': `${EXTRAS.VersionControl.comment}

/**
 * @param {function} isBadVersion()
 * @return {function}
 */
var solution = function(isBadVersion) {
    /**
     * @param {integer} n Total versions
     * @return {integer} The first bad version
     */
    return function(n) {

    };
};
`,
  'serialize-and-deserialize-binary-tree': `${EXTRAS.TreeNode.comment}

/**
 * Encodes a tree to a single string.
 *
 * @param {TreeNode} root
 * @return {string}
 */
var serialize = function(root) {

};

/**
 * Decodes your encoded data to tree.
 *
 * @param {string} data
 * @return {TreeNode}
 */
var deserialize = function(data) {

};
`,
};

/** Drivers for odd signatures: lines of a function body that returns the result, using $0, $1… */
const CALLS = {
  'first-bad-version': ['__bcbBad = JSON.parse($1);', 'return solution(isBadVersion)(JSON.parse($0));'],
  'lowest-common-ancestor-of-a-binary-search-tree': ['const t = __bcbTree(JSON.parse($0));', 'const c = lowestCommonAncestor(t, __bcbFind(t, JSON.parse($1)), __bcbFind(t, JSON.parse($2)));', 'return c == null ? null : c.val;'],
  'lowest-common-ancestor-of-a-binary-tree': ['const t = __bcbTree(JSON.parse($0));', 'const c = lowestCommonAncestor(t, __bcbFind(t, JSON.parse($1)), __bcbFind(t, JSON.parse($2)));', 'return c == null ? null : c.val;'],
  'flatten-nested-list-iterator': ['const it = new NestedIterator(__bcbNested(JSON.parse($0)));', 'const out = [];', 'while (it.hasNext() && out.length < 100000) out.push(it.next());', 'return out;'],
  'linked-list-cycle': ['return hasCycle(__bcbCycle(JSON.parse($0), JSON.parse($1)));'],
  'linked-list-cycle-ii': ['const h = __bcbCycle(JSON.parse($0), JSON.parse($1));', 'const c = detectCycle(h);', 'return c == null ? -1 : __bcbIndex(h, c);'],
  'clone-graph': ['const o = __bcbGraph(JSON.parse($0));', 'return __bcbGraphDump(cloneGraph(o), o);'],
  'implement-rand10-using-rand7': ['const out = [];', 'for (let k = 0, n = JSON.parse($0); k < n; k++) out.push(rand10());', 'return out;'],
  'populating-next-right-pointers-in-each-node': ['return __bcbNextDump(connect(__bcbNextTree(JSON.parse($0))));'],
  'serialize-and-deserialize-binary-tree': ['const r = deserialize(serialize(__bcbTree(JSON.parse($0))));', 'return r == null ? [] : r;'],
  'remove-duplicates-from-sorted-array': ['const a = JSON.parse($0);', 'const k = removeDuplicates(a);', 'return [k, a.slice(0, Math.max(0, Math.min(k, a.length)))];'],
};

export function starter(spec) {
  if (STARTERS[spec.slug]) return STARTERS[spec.slug];
  const comments = [...extrasOf(spec)].map((n) => EXTRAS[n]?.comment).filter(Boolean);
  const head = comments.length ? `${comments.join('\n')}\n` : '';
  const names = (ps) => ps.map(([, n]) => n).join(', ');
  if (spec.design) {
    const { cls, ctor, methods } = spec.design;
    const parts = [`${jsdoc(ctor)}var ${cls} = function(${names(ctor)}) {\n    \n};`];
    for (const [r, name, ps] of methods) parts.push(`${jsdoc(ps, r)}${cls}.prototype.${name} = function(${names(ps)}) {\n    \n};`);
    return `${head}${parts.join('\n\n')}\n`;
  }
  const ps = spec.starterParams ?? spec.params;
  return `${head}${jsdoc(ps, spec.returns)}var ${spec.method} = function(${names(ps)}) {\n    \n};\n`;
}

const isNode = (t) => t === 'TreeNode' || t === 'ListNode';

function functionBody(spec, test) {
  const custom = CALLS[spec.slug];
  if (custom) return custom.map((l) => fill(l, test.in));
  if (spec.call) throw new Error(`No JavaScript driver for ${spec.slug}`);
  const lines = spec.params.map(([t], k) => `const a${k} = ${conv(t, `JSON.parse(${lit(test.in[k])})`)};`);
  const call = `${spec.method}(${spec.params.map((_, k) => `a${k}`).join(', ')})`;
  if (spec.returns === 'void') return [...lines, `${call};`, `return a${spec.output ?? 0};`];
  lines.push(`const r = ${call};`);
  // LeetCode prints an empty list or tree as [], not null
  lines.push(isNode(spec.returns) ? 'return r == null ? [] : r;' : 'return r;');
  return lines;
}

function designBody(spec, test) {
  const { cls, ctor, methods } = spec.design;
  const args = (ps) => ps.map(([t], k) => conv(t, `a[${k}]`)).join(', ');
  const cases = [`case ${lit(cls)}: obj = new ${cls}(${args(ctor)}); out.push(null); break;`];
  for (const [r, name, ps] of methods) {
    cases.push(r === 'void'
      ? `case ${lit(name)}: obj.${name}(${args(ps)}); out.push(null); break;`
      : `case ${lit(name)}: out.push(obj.${name}(${args(ps)})); break;`);
  }
  return [
    `const ops = JSON.parse(${lit(test.in[0])}), args = JSON.parse(${lit(test.in[1])});`,
    'const out = []; let obj = null;',
    'for (let k = 0; k < ops.length; k++) {',
    '    const a = args[k];',
    '    switch (ops[k]) {',
    ...cases.map((c) => `        ${c}`),
    "        default: throw new Error('unknown operation ' + ops[k]);",
    '    }',
    '}',
    'return out;',
  ];
}

export function build(spec, code, tests) {
  const pre = [...extrasOf(spec)].map((n) => EXTRAS[n]?.pre).filter(Boolean).join('');
  const prelude = `${OPEN}${pre}\n`;
  const lineOffset = linesIn(prelude);
  const userLines = linesIn(`${code}\n`);
  const fns = tests.map((test, i) => {
    const body = spec.design && !CALLS[spec.slug] ? designBody(spec, test) : functionBody(spec, test);
    return `function __bcbT${i}() {\n${body.map((l) => `    ${l}`).join('\n')}\n}`;
  });
  const main = `
const __BCB_FIRST = ${lineOffset + 1}, __BCB_LAST = ${lineOffset + userLines};
${fns.join('\n')}
[${tests.map((_, i) => `__bcbT${i}`).join(', ')}].forEach((t, i) => {
    try { __bcbOut(i, t()); } catch (e) { __bcbErr(i, e); }
});
}
`;
  return { source: `${prelude}${code}\n${main}`, lineOffset, userLines };
}

const JS_LINE = /[\w./-]*script\.js:(\d+)/g;

/** Node reports a syntax error before anything runs: show it as a compile error. */
export function compileError(r, ctx) {
  const err = r.stderr ?? '';
  if (r.stdout?.includes('\u0001BCB|') || !/^SyntaxError\b/m.test(err)) return null;
  // keep the location, the code line and the message; drop Node's own stack and version line
  const lines = err.split('\n');
  const end = lines.findIndex((l) => /^SyntaxError\b/.test(l));
  return cleanStderr(lines.slice(0, end + 1).join('\n').trim(), ctx);
}

export function cleanStderr(text, { lineOffset, userLines }) {
  return mapLines(text, JS_LINE, lineOffset, userLines, (n) => (n ? `Line ${n}` : 'judge code'));
}

export default {
  id: 'javascript',
  label: 'JavaScript',
  version: 'Node.js 22',
  judge0: 102,
  starter,
  build,
  compileError,
  cleanStderr,
  supports: (spec) => !spec.call || Boolean(CALLS[spec.slug]),
};
