#!/usr/bin/env node
/**
 * Worked solutions: every approach (brute force → better → optimal) of every practice problem, in
 * Java, C++, Python and JavaScript, from problems/solutions/<lessonId>.mjs.
 *
 * Every approach in every language goes through the same harness the judge uses and must pass every
 * correctness test of its problem; an approach named Optimal must also pass the large-input
 * performance test in Java. A brute force that cannot finish a huge test (say, a linear scan up to
 * 2^31) names those tests in `timesOut`; the Solution tab says so, and it must pass all the others.
 * Only a lesson whose approaches all pass is written to src/data/solutions/<lessonId>.json (shipped,
 * loaded by the Solution tab).
 *
 *   node problems/solutions.mjs                     every lesson
 *   node problems/solutions.mjs two-pointers        one lesson
 *   node problems/solutions.mjs --only=3sum         problems whose slug contains "3sum" (nothing is written)
 *   node problems/solutions.mjs --lang=java         one language (nothing is written)
 *   node problems/solutions.mjs --check             CI: shipped data matches the sources, and every problem has solutions
 *
 * Passing runs are remembered by a hash of the program in node_modules/.cache, so a rerun only runs
 * what changed.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import cpp from '../src/lib/judge/langs/cpp.js';
import python from '../src/lib/judge/langs/python.js';
import javascript from '../src/lib/judge/langs/javascript.js';
import { buildProgram, parseOutput, perfLimitMs, cleanCompileOutput, LINE_OFFSET } from '../src/lib/judge/harness.js';
import { accept, parseJson } from '../src/lib/judge/check.js';
import { runLocal, pool } from './langs/run-local.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, 'solutions');
const dataDir = join(here, '..', 'src', 'data', 'problems');
const outDir = join(here, '..', 'src', 'data', 'solutions');
const cacheFile = join(here, '..', 'node_modules', '.cache', 'bcb-solutions.json');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const onlySlug = args.find((a) => a.startsWith('--only='))?.slice(7);
const onlyLang = args.find((a) => a.startsWith('--lang='))?.slice(7);
const lessons = args.filter((a) => !a.startsWith('--'));
const partial = Boolean(onlySlug || onlyLang);

// the Java harness as src/lib/judge/langs/java.js builds it (that module reads browser config)
const java = {
  perf: true,
  build: (spec, code, tests) => ({ source: buildProgram(spec, code, tests), lineOffset: LINE_OFFSET, userLines: Infinity }),
  compileError: (r) => (r.compile && !r.ok ? cleanCompileOutput(r.compile) : null),
  cleanStderr: (text) => text,
};
const LANGS = { java, cpp, python, javascript };
const LANG_IDS = Object.keys(LANGS);
export const LEVELS = ['Brute force', 'Better', 'Optimal'];
const meta = JSON.parse(readFileSync(join(dataDir, 'meta.json'), 'utf8'));
const specsOf = (lesson) => JSON.parse(readFileSync(join(dataDir, `${lesson}.json`), 'utf8'));
const allLessons = readdirSync(dataDir).filter((f) => f.endsWith('.json') && !['index.json', 'meta.json'].includes(f)).map((f) => f.slice(0, -5));

let failures = 0;
const fail = (msg) => { failures += 1; console.log(`✗ ${msg}`); };

/** Shape and wording rules, so every problem's Solution tab reads the same way. */
function lint(lesson, slug, sol) {
  const where = `${lesson}/${slug}`;
  if (!sol.pattern?.trim()) fail(`${where}: no pattern`);
  if (!Array.isArray(sol.approaches) || !sol.approaches.length) return fail(`${where}: no approaches`);
  let last = -1;
  sol.approaches.forEach((a, i) => {
    const at = `${where} approach ${i + 1}`;
    const lvl = LEVELS.indexOf(a.level);
    if (lvl < 0) fail(`${at}: level must be one of ${LEVELS.join(', ')}`);
    if (lvl < last) fail(`${at}: approaches go from brute force to optimal`);
    last = lvl;
    for (const k of ['name', 'idea', 'time', 'space', 'why']) if (!a[k]?.trim()) fail(`${at}: missing ${k}`);
    if (!Array.isArray(a.steps) || a.steps.length < 2) fail(`${at}: needs at least two steps`);
    for (const k of ['time', 'space']) if (a[k] && !/^O\(/.test(a[k])) fail(`${at}: ${k} should be big-O, like O(n log n)`);
    for (const id of LANG_IDS) if (!a.code?.[id]?.trim()) fail(`${at}: no ${id} code`);
    if (a.timesOut && (a.level === 'Optimal' || !a.timesOut.length || a.timesOut.some((k) => !Number.isInteger(k) && k !== 'generated'))) fail(`${at}: timesOut lists the test indices (or 'generated') a slow (non-optimal) approach cannot finish`);
  });
  if (sol.approaches.at(-1).level !== 'Optimal') fail(`${where}: the last approach must be the optimal one`);
}

const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 24);

/** Runs one approach in one language on every test; returns a list of problems (empty = passed). */
async function judge(spec, langId, code, withPerf, skip = []) {
  const lang = LANGS[langId];
  if (skip.some((k) => k !== 'generated' && (!spec.tests[k] || spec.tests[k].perf || spec.tests[k].g))) return [`timesOut lists ${skip.join(', ')}, which are not hand-written correctness tests of this problem`];
  const tests = spec.tests.filter((t, k) => (!t.perf || (withPerf && lang.perf)) && !skip.includes(k) && !(t.g && skip.includes('generated')));
  const { source, lineOffset, userLines } = lang.build(spec, code, tests);
  const key = hash(`${langId}\n${source}\n${tests.map((t) => t.out).join('\n')}`);
  if (cache[key]) return [];
  const r = await runLocal(langId, source, { timeoutMs: 30000 });
  const compile = lang.compileError(r, { lineOffset, userLines });
  if (compile != null) return [`compile error\n${compile.split('\n').slice(0, 15).join('\n')}`];
  const { results, calibrationMs } = parseOutput(r.stdout, tests.length, lineOffset);
  const errs = [];
  tests.forEach((t, i) => {
    const res = results[i];
    if (!res) return errs.push(`test ${i}: no result (${r.status}) ${lang.cleanStderr(r.stderr ?? '', { lineOffset, userLines }).slice(-500)}`);
    if (res.error) return errs.push(`test ${i}: ${res.error}`);
    if (t.perf) {
      const limit = perfLimitMs(t.refMs, meta.calibrationMs, calibrationMs, t.perf.floorMs);
      if (res.got !== t.out) return errs.push('performance test: wrong answer');
      if (res.ms > limit) return errs.push(`performance test: ${res.ms} ms, limit ${limit} ms`);
      return null;
    }
    const got = parseJson(res.got);
    if (!got.ok) return errs.push(`test ${i}: unreadable output ${res.got}`);
    if (!accept(spec, t.in.map((x) => JSON.parse(x)), got.value, JSON.parse(t.out))) errs.push(`test ${i}: input ${t.in.join(', ')} → got ${res.got}, expected ${t.out}`);
    return null;
  });
  if (!errs.length) cache[key] = 1;
  return errs;
}

const sources = existsSync(srcDir) ? readdirSync(srcDir).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4)) : [];
const todo = (lessons.length ? lessons : sources);
mkdirSync(outDir, { recursive: true });
const missing = [];

for (const lesson of todo) {
  if (!allLessons.includes(lesson)) { fail(`${lesson}: no such lesson`); continue; }
  const file = join(srcDir, `${lesson}.mjs`);
  if (!existsSync(file)) { fail(`${lesson}: no problems/solutions/${lesson}.mjs`); continue; }
  const sols = (await import(pathToFileURL(file).href)).default;
  const specs = new Map(specsOf(lesson).map((p) => [p.slug, p]));
  for (const slug of Object.keys(sols)) if (!specs.has(slug)) fail(`${lesson}: ${slug} is not a problem of this lesson`);
  for (const slug of specs.keys()) if (!sols[slug]) missing.push(`${lesson}/${slug}`);
  const before = failures;
  for (const [slug, sol] of Object.entries(sols)) if (specs.has(slug)) lint(lesson, slug, sol);
  const shipped = Object.fromEntries([...specs.keys()].filter((s) => sols[s]).map((s) => [s, sols[s]]));
  const outFile = join(outDir, `${lesson}.json`);

  if (CHECK) {
    const committed = existsSync(outFile) ? readFileSync(outFile, 'utf8') : '';
    if (committed !== `${JSON.stringify(shipped, null, 1)}\n`) fail(`${lesson}: src/data/solutions/${lesson}.json is out of date (run node problems/solutions.mjs ${lesson})`);
    continue;
  }

  const jobs = [];
  for (const [slug, sol] of Object.entries(shipped)) {
    if (onlySlug && !slug.includes(onlySlug)) continue;
    sol.approaches.forEach((a, i) => {
      for (const langId of LANG_IDS) {
        if (onlyLang && langId !== onlyLang) continue;
        if (a.code?.[langId]) jobs.push({ slug, i, a, langId });
      }
    });
  }
  const verdicts = await pool(jobs, ({ slug, a, langId }) => judge(specs.get(slug), langId, a.code[langId], a.level === 'Optimal', a.timesOut));
  jobs.forEach((j, k) => {
    for (const e of verdicts[k]) fail(`${lesson}/${j.slug} · ${j.a.level} (${j.a.name}) · ${j.langId}: ${e}`);
  });
  writeFileSync(cacheFile, JSON.stringify(cache));
  const runs = jobs.length;
  if (failures > before) { console.log(`✗ ${lesson}: not written (${failures - before} problem${failures - before === 1 ? '' : 's'})`); continue; }
  if (!partial) writeFileSync(outFile, `${JSON.stringify(shipped, null, 1)}\n`);
  console.log(`✓ ${lesson}: ${Object.keys(shipped).length}/${specs.size} problems, ${runs} runs passed`);
}

if (CHECK && !lessons.length) {
  for (const l of allLessons) if (!sources.includes(l)) missing.push(`${l} (whole lesson)`);
  if (missing.length) fail(`problems without solutions: ${missing.join(', ')}`);
} else if (missing.length) {
  console.log(`\nStill without solutions: ${missing.length} (${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''})`);
}
console.log(failures ? `\n${failures} problem${failures === 1 ? '' : 's'}` : '\nAll good.');
process.exit(failures ? 1 : 0);
