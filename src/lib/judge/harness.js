import { IMPORTS, BCB, EXTRAS } from './support.js';

/**
 * Builds the Java program that judges a learner's solution against a problem's tests, and reads
 * the results back. Shared by the browser (src/components/solve) and the build script that
 * generates expected outputs from reference solutions (problems/build.mjs).
 *
 * A problem spec is either a function problem:
 *   { method: 'twoSum', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int[]' }
 * or a design problem (LeetCode's "operations + arguments" format):
 *   { design: { cls: 'LRUCache', ctor: [['int', 'capacity']], methods: [['int', 'get', [['int', 'key']]], …] } }
 * Optional: `uses` (extra provided classes), `call` (custom Java for odd signatures, with $0, $1… as the
 * test inputs and `s` as a new Solution; it must set `Object r`), `output` (for void methods: the
 * index of the argument to print after the call), `starterParams` (the method's own parameters when
 * the tests carry extra inputs), `extends` (a provided base class), `starter` (custom starter code).
 */

const CONV = {
  int: 'BCB.I', long: 'BCB.L', double: 'BCB.D', boolean: 'BCB.Z', char: 'BCB.C', String: 'BCB.S',
  'int[]': 'BCB.IA', 'long[]': 'BCB.LA', 'double[]': 'BCB.DA', 'char[]': 'BCB.CA', 'String[]': 'BCB.SA',
  'int[][]': 'BCB.IAA', 'char[][]': 'BCB.CAA', 'String[][]': 'BCB.SAA',
  'List<Integer>': 'BCB.LI', 'List<String>': 'BCB.LS', 'List<List<Integer>>': 'BCB.LLI', 'List<List<String>>': 'BCB.LLS',
  TreeNode: 'BCBT.T', ListNode: 'BCBN.N', 'ListNode[]': 'BCBN.lists', 'Iterator<Integer>': 'BCB.IT',
};

/** Source lines before the learner's code (used to map line numbers back). */
export const LINE_OFFSET = 1;

const javaString = (s) =>
  `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;

function conv(type) {
  const c = CONV[type];
  if (!c) throw new Error(`Unsupported parameter type: ${type}`);
  return c;
}

/** Every provided class a spec needs, including those implied by its types. */
export function extrasFor(spec) {
  const names = new Set(spec.uses ?? []);
  const types = [
    ...(spec.params ?? []).map(([t]) => t),
    spec.returns,
    ...(spec.design ? [...spec.design.ctor.map(([t]) => t), ...spec.design.methods.flatMap(([r, , ps]) => [r, ...ps.map(([t]) => t)])] : []),
  ].filter(Boolean);
  for (const t of types) {
    if (/\bTreeNode\b/.test(t)) names.add('TreeNode');
    if (/\bListNode\b/.test(t)) names.add('ListNode');
  }
  return [...names];
}

const sig = (params) => params.map(([t, n]) => `${t} ${n}`).join(', ');

/** The code a learner starts from, LeetCode style. */
export function starterCode(spec) {
  if (spec.starter) return spec.starter;
  const comments = extrasFor(spec).map((n) => EXTRAS[n]?.comment).filter(Boolean);
  const head = comments.length ? `${comments.join('\n')}\n` : '';
  if (spec.design) {
    const { cls, ctor, methods } = spec.design;
    const parts = [`    public ${cls}(${sig(ctor)}) {\n        \n    }`];
    for (const [ret, name, ps] of methods) parts.push(`    public ${ret} ${name}(${sig(ps)}) {\n        \n    }`);
    const impl = spec.design.implements ? ` implements ${spec.design.implements}` : '';
    const ext = spec.extends ? ` extends ${spec.extends}` : '';
    return `${head}class ${cls}${ext}${impl} {\n\n${parts.join('\n\n')}\n}\n`;
  }
  const ext = spec.extends ? ` extends ${spec.extends}` : '';
  // starterParams: the method's real parameters when the tests carry extra inputs (a cycle position, the bad version…)
  return `${head}class Solution${ext} {\n    public ${spec.returns} ${spec.method}(${sig(spec.starterParams ?? spec.params)}) {\n        \n    }\n}\n`;
}

function functionBody(spec, test) {
  // design problems with a custom driver build their own objects
  const lines = spec.design ? [] : ['Solution s = new Solution();'];
  if (spec.call) {
    let body = spec.call;
    test.in.forEach((v, k) => { body = body.replaceAll(`$${k}`, javaString(v)); });
    lines.push(body);
  } else {
    const args = spec.params.map(([t], k) => {
      lines.push(`${t} a${k} = ${conv(t)}(${javaString(test.in[k])});`);
      return `a${k}`;
    });
    const call = `s.${spec.method}(${args.join(', ')})`;
    if (spec.returns === 'void') lines.push(`${call};`, `Object r = a${spec.output ?? 0};`);
    else lines.push(`Object r = ${call};`);
    // LeetCode prints an empty list or tree as [], not null
    const shown = spec.returns === 'void' ? spec.params[spec.output ?? 0][0] : spec.returns;
    if (shown === 'ListNode' || shown === 'TreeNode') lines.push('if (r == null) r = new ArrayList<>();');
  }
  return lines;
}

function designBody(spec, test) {
  const { cls, ctor, methods } = spec.design;
  const cases = [];
  const argList = (ps) => ps.map(([t], k) => `${conv(t)}(a.get(${k}))`).join(', ');
  cases.push(`case "${cls}": obj = new ${cls}(${argList(ctor)}); break;`);
  for (const [ret, name, ps] of methods) {
    cases.push(ret === 'void'
      ? `case "${name}": obj.${name}(${argList(ps)}); break;`
      : `case "${name}": r = obj.${name}(${argList(ps)}); break;`);
  }
  return [
    `List<Object> ops = BCB.LO(${javaString(test.in[0])});`,
    `List<Object> args = BCB.LO(${javaString(test.in[1])});`,
    `List<Object> results = new ArrayList<>(); ${cls} obj = null;`,
    'for (int k = 0; k < ops.size(); k++) {',
    '    String op = (String) ops.get(k); List<Object> a = (List<Object>) args.get(k); Object r = null;',
    '    switch (op) {',
    ...cases.map((c) => `        ${c}`),
    '        default: throw new IllegalArgumentException("unknown operation " + op);',
    '    }',
    '    results.add(r);',
    '}',
    'Object r = results;',
  ];
}

/**
 * A performance test: `gen` declares the inputs (a0, a1… generated in Java from a fixed seed), then
 * the call is timed and the answer compared by hash, since big inputs and outputs can't be inlined.
 */
function perfBody(spec, perf) {
  const lines = spec.design ? [] : ['Solution s = new Solution();'];
  lines.push(perf.gen, 'long __t0 = System.nanoTime();');
  if (perf.call) lines.push(perf.call);
  else {
    const args = spec.params.map((_, k) => `a${k}`).join(', ');
    if (spec.returns === 'void') lines.push(`s.${spec.method}(${args});`, `Object r = a${spec.output ?? 0};`);
    else lines.push(`Object r = s.${spec.method}(${args});`);
  }
  return lines;
}

/** The full Main.java for `code` run against `tests` (a test with `perf` is a generated performance test). */
export function buildProgram(spec, code, tests) {
  const blocks = tests.map((test, i) => {
    if (test.perf) {
      return [
        `        try {`,
        ...perfBody(spec, test.perf).map((l) => `            ${l}`),
        `            BCB.outHash(${i}, r, System.nanoTime() - __t0, ${spec.check === 'any-order' ? 1 : spec.check === 'any-order-deep' ? 2 : 0});`,
        `        } catch (Throwable t) { BCB.err(${i}, t); }`,
      ].join('\n');
    }
    const body = spec.design && !spec.call ? designBody(spec, test) : functionBody(spec, test);
    return [
      `        try {`,
      ...body.map((l) => `            ${l}`),
      `            BCB.out(${i}, r);`,
      `        } catch (Throwable t) { BCB.err(${i}, t); }`,
    ].join('\n');
  });
  const extras = extrasFor(spec).map((n) => EXTRAS[n].decl).join('\n');
  const main = `
@SuppressWarnings({"unchecked", "rawtypes", "unused"})
public class Main {
    public static void main(String[] __args) throws Exception {
        // Run on a thread with a large stack, like LeetCode, so deep (but legitimate) recursion doesn't overflow.
        Thread t = new Thread(null, Main::run, "judge", 1L << 28);
        t.start();
        t.join();
        System.out.flush();
    }

    static void run() {
${tests.some((t) => t.perf) ? '        System.out.println("\\u0001BCBC|" + BCB.calibrate());\n' : ''}${blocks.join('\n')}
    }
}
`;
  return `${IMPORTS}\n${code}\n${extras}\n${BCB}\n${main}`;
}

/**
 * Splits program output into per-test results and the learner's own prints (any language: they all
 * print the same tags). `lineOffset` maps an error's line in the combined file to the learner's code.
 * Returns { results: [{ got } | { error } | undefined], stdout }.
 */
export function parseOutput(stdout, count, lineOffset = LINE_OFFSET) {
  const results = new Array(count).fill(undefined);
  const own = [];
  let calibrationMs = null;
  for (const line of (stdout ?? '').split('\n')) {
    const cal = /^\u0001BCBC\|(\d+)$/.exec(line);
    if (cal) {
      calibrationMs = Number(cal[1]);
      continue;
    }
    const timing = /^\u0001BCBT\|(\d+)\|(\d+)$/.exec(line);
    if (timing) {
      if (results[Number(timing[1])]) results[Number(timing[1])].ms = Number(timing[2]);
      continue;
    }
    const m = /^\u0001BCB\|(\d+)\|([\s\S]*)$/.exec(line);
    if (!m) {
      if (line) own.push(line);
      continue;
    }
    const i = Number(m[1]);
    if (m[2].startsWith('!')) {
      const [, msg, ln] = /^!(.*)@L(-?\d+)$/.exec(m[2]) ?? [null, m[2].slice(1), '-1'];
      const line = Number(ln) - lineOffset;
      results[i] = { error: line > 0 ? `${msg} (line ${line})` : msg };
    } else {
      results[i] = { got: m[2] };
    }
  }
  return { results, stdout: own.join('\n'), calibrationMs };
}

/** Compiler messages point into Main.java; map them back to the learner's own line numbers. */
/**
 * The time a performance test may take on the judge: ten times the reference solution (at least
 * floorMs), scaled by how fast the judge machine is compared with the machine that timed the reference.
 */
export function perfLimitMs(refMs, buildCalibrationMs, judgeCalibrationMs, floorMs = 400) {
  const ratio = buildCalibrationMs && judgeCalibrationMs ? Math.min(6, Math.max(0.5, judgeCalibrationMs / buildCalibrationMs)) : 2;
  return Math.round(Math.max(floorMs, 10 * (refMs ?? 40)) * ratio);
}

export function cleanCompileOutput(text) {
  return (text ?? '').replace(/Main\.java:(\d+)/g, (_, n) => `Line ${Number(n) - LINE_OFFSET}`);
}
