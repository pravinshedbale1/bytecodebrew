import { parseOutput, perfLimitMs } from './harness';
import meta from '../../data/problems/meta.json';
import { accept, parseJson } from './check';
import { runCode } from '../judge0';
import { langOf } from './langs';

/**
 * Runs a learner's code (in `langId`: java, cpp, python or javascript) against some of a problem's
 * tests on Judge0 and grades each one. Languages without performance support skip the perf test.
 * Returns {
 *   status: 'accepted' | 'wrong' | 'slow' | 'compile' | 'error' | 'ran',
 *   compile?: string, message?: string, stdout: string, time, memory,
 *   tests: [{ input: [json], expected: json, got?: json, error?: string, pass: boolean | null }]
 * }
 * A test without `out` is a learner's own case: it is run, not graded (pass: null), and a run made
 * only of such cases ends as 'ran'.
 */
export async function runTests(spec, code, tests, langId) {
  const lang = langOf(langId);
  if (!lang.perf) tests = tests.filter((t) => !t.perf);
  const { source, lineOffset, userLines } = lang.build(spec, code, tests);
  const r = await runCode(source, { languageId: lang.judge0, compilerOptions: lang.compilerOptions });

  const compile = lang.compileError(r, { lineOffset, userLines });
  if (compile != null) return { status: 'compile', compile, stdout: '', tests: [] };

  const { results, stdout, calibrationMs } = parseOutput(r.stdout, tests.length, lineOffset);
  const fallback = /Time Limit/i.test(r.status) ? 'Time limit exceeded' : r.status === 'Accepted' ? 'No result' : r.status;
  const graded = tests.map((t, i) => {
    const res = results[i];
    const base = { input: t.in, expected: t.out, pass: false, perf: t.perf ?? null };
    if (!res) return { ...base, slow: Boolean(t.perf), error: t.perf ? 'Time limit exceeded: too slow for the large input' : fallback };
    if (res.error) return { ...base, error: res.error };
    if (t.out === undefined) return { ...base, got: res.got, pass: null };
    if (t.perf) {
      const limitMs = perfLimitMs(t.refMs, meta.calibrationMs, calibrationMs, t.perf.floorMs);
      if (res.got !== t.out) return { ...base, got: res.got, ms: res.ms, limitMs };
      if (res.ms > limitMs) return { ...base, got: res.got, ms: res.ms, limitMs, slow: true, error: `Too slow: ${res.ms} ms, the limit here is ${limitMs} ms` };
      return { ...base, got: res.got, ms: res.ms, limitMs, pass: true };
    }
    const got = parseJson(res.got);
    if (!got.ok) return { ...base, got: res.got, error: 'Could not read the output' };
    const pass = accept(spec, t.in.map((x) => JSON.parse(x)), got.value, JSON.parse(t.out));
    return { ...base, got: res.got, pass };
  });

  const graded2 = graded.filter((g) => g.pass !== null);
  const allPass = graded2.every((g) => g.pass);
  return {
    status: graded.some((g) => g.error && !g.slow) ? 'error'
      : allPass ? (graded2.length ? 'accepted' : 'ran')
      : graded2.some((g) => !g.pass && !g.slow) ? 'wrong'
      : 'slow',
    // Java's stderr is the learner's own prints (keep the start); Python and Node end with the traceback
    message: r.stderr ? stderrLines(lang.cleanStderr(r.stderr, { lineOffset, userLines }), lang.id === 'java').join('\n') : null,
    stdout,
    time: r.time,
    memory: r.memory,
    tests: graded,
  };
}

function stderrLines(text, head) {
  const lines = text.trimEnd().split('\n');
  return head ? lines.slice(0, 6) : lines.slice(-8);
}
