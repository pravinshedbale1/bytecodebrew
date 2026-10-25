#!/usr/bin/env node
/**
 * Generates the problem data the site ships (src/data/problems/*.json) from the specs here.
 *
 * For every problem: compile its reference solution (Java 17) with the same harness the site uses,
 * run it on every test, fail if it errors or disagrees with an `out` written in the spec (the
 * official examples), and store its outputs as the expected answers. Reference solutions are not shipped.
 *
 *   node problems/build.mjs            all lessons
 *   node problems/build.mjs two-pointers sliding-window
 *   node problems/build.mjs --check    CI: re-run every reference and confirm the committed data still holds
 */
import { readdirSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { mergeLesson } from './text.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir, cpus } from 'node:os';
import { buildProgram, parseOutput } from '../src/lib/judge/harness.js';
import { accept, parseJson } from '../src/lib/judge/check.js';
import { lessonContent } from '../build/content-plugin.js';
import { generate } from './fuzz/lib.mjs';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const specDir = join(here, 'specs');
const outDir = join(here, '..', 'src', 'data', 'problems');
const work = join(tmpdir(), 'bcb-problems');

const CHECK = process.argv.includes('--check');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = readdirSync(specDir).filter((f) => f.endsWith('.mjs')).filter((f) => !only.length || only.includes(f.slice(0, -4)));

// Lesson headings, to deep-link a problem to the section of its pattern lesson that works through it.
const extracts = JSON.parse(lessonContent(join(here, '..', 'src', 'content')).load.call({ addWatchFile() {}, warn() {} }, '\0virtual:search-index').slice(15, -1));
const words = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function anchorFor(lesson, title) {
  const t = words(title);
  for (const h of extracts[`dsa/patterns/${lesson}`]?.headings ?? []) {
    const head = words(h.text);
    const main = words(h.text.split(/[(—–:]/)[0]);
    if (` ${head} `.includes(` ${t} `) || main === t) return h.id;
  }
  return null;
}

// Performance tests, kept apart from the specs: { [slug]: { label, gen, call? } } (see problems/perf.mjs)
const PERF = (await import(pathToFileURL(join(here, 'perf.mjs')).href)).default;
// A reference must finish its performance test well inside the runner's 5 s CPU limit.
const REF_BUDGET_MS = CHECK ? 3000 : 600;   // CI machines are slower; timings are only recorded from local builds

// Generated hidden tests, kept apart from the specs: problems/fuzz/<lesson>.mjs (see problems/fuzz/lib.mjs)
async function loadFuzz(lesson) {
  const f = join(here, 'fuzz', `${lesson}.mjs`);
  return existsSync(f) ? (await import(pathToFileURL(f).href)).default : {};
}
const unfuzzed = [];

/**
 * Specs write test values as plain JS; the harness and the site use LeetCode-format JSON strings.
 * Order: the spec's own tests (examples first), then the generated ones, then the performance test.
 */
function normalise(spec, fuzz) {
  const j = (v) => JSON.stringify(v);
  const tests = spec.tests.map((t) => ({ in: t.in.map(j), ...(t.out !== undefined ? { out: j(t.out) } : {}) }));
  if (fuzz[spec.slug]) for (const input of generate(spec.slug, fuzz[spec.slug], spec.tests.map((t) => t.in))) tests.push({ in: input.map(j), g: 1 });
  else unfuzzed.push(spec.slug);
  if (PERF[spec.slug]) tests.push({ in: [], perf: PERF[spec.slug] });
  return { ...spec, tests };
}

async function judge(spec) {
  const dir = join(work, spec.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'Main.java'), buildProgram(spec, spec.ref, spec.tests));
  try {
    await run('javac', ['--release', '17', '-nowarn', '-encoding', 'UTF-8', '-d', dir, join(dir, 'Main.java')], { timeout: 60000 });
  } catch (e) {
    return { error: `compile failed:\n${(e.stderr || e.stdout || e.message).split('\n').slice(0, 12).join('\n')}` };
  }
  let stdout;
  try {
    ({ stdout } = await run('java', ['-Xss256m', '-cp', dir, 'Main'], { timeout: 30000, maxBuffer: 64 << 20 }));
  } catch (e) {
    return { error: `run failed: ${e.message.split('\n')[0]}` };
  }
  const { results, calibrationMs } = parseOutput(stdout, spec.tests.length);
  if (calibrationMs) calibrations.push(calibrationMs);
  const problems = [];
  const outs = results.map((r, i) => {
    const t = spec.tests[i];
    if (!r) { problems.push(`test ${i}: no result`); return null; }
    if (r.error) { problems.push(`test ${i}: ${r.error}`); return null; }
    if (t.perf) {
      if (r.ms > REF_BUDGET_MS) problems.push(`performance test: reference took ${r.ms} ms (budget ${REF_BUDGET_MS} ms)`);
      timings[spec.slug] = r.ms;
      return r.got;
    }
    const got = parseJson(r.got);
    if (!got.ok) { problems.push(`test ${i}: unparsable output ${r.got}`); return null; }
    if (t.out !== undefined) {
      const want = JSON.parse(t.out);
      const inputs = t.in.map((x) => JSON.parse(x));
      if (!accept(spec, inputs, got.value, want)) problems.push(`test ${i}: reference gave ${r.got}, spec says ${t.out}`);
    }
    return r.got;
  });
  return problems.length ? { error: problems.join('\n') } : { outs };
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }));
  return results;
}

mkdirSync(outDir, { recursive: true });
const indexPath = join(outDir, 'index.json');
// slug → lesson; when building only some lessons, keep the other entries
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : {};
for (const [k, v] of Object.entries(index)) if (typeof v !== 'string') index[k] = v.lesson;
let failed = 0;
let total = 0;
const timings = {};
const calibrations = [];

for (const file of files) {
  const lesson = file.slice(0, -4);
  const fuzz = await loadFuzz(lesson);
  const raw = (await import(pathToFileURL(join(specDir, file)).href)).default;
  for (const slug of Object.keys(fuzz)) if (!raw.some((p) => p.slug === slug)) { failed += 1; console.log(`✗ problems/fuzz/${lesson}.mjs: ${slug} is not a problem of this lesson`); }
  const specs = raw.map((spec) => normalise(spec, fuzz));
  const verdicts = await pool(specs, Math.max(2, cpus().length - 1), judge);
  const shipped = [];
  specs.forEach((spec, i) => {
    total += 1;
    const v = verdicts[i];
    if (v.error) {
      failed += 1;
      console.log(`✗ ${lesson}/${spec.slug}\n${v.error.replace(/^/gm, '    ')}`);
      return;
    }
    const { ref, ...rest } = spec;
    const anchor = anchorFor(lesson, spec.title);
    shipped.push({
      ...rest, lesson, ...(anchor ? { anchor } : {}),
      tests: spec.tests.map((t, k) => ({ in: t.in, out: v.outs[k], ...(t.g ? { g: 1 } : {}), ...(t.perf ? { perf: t.perf, refMs: Math.max(1, timings[spec.slug] ?? 1) } : {}) })),
    });
    index[spec.slug] = lesson;
  });
  if (CHECK) {
    // the committed data must agree with what the references produce now
    const committed = new Map(JSON.parse(readFileSync(join(outDir, `${lesson}.json`), 'utf8')).map((p) => [p.slug, p]));
    for (const p of shipped) {
      const c = committed.get(p.slug);
      if (!c || c.tests.length !== p.tests.length) { failed += 1; console.log(`✗ ${p.slug}: committed data is out of date (run node problems/build.mjs)`); continue; }
      p.tests.forEach((t, k) => {
        const ct = c.tests[k];
        const same = t.perf ? ct.out === t.out : JSON.stringify(ct.in) === JSON.stringify(t.in) && accept(p, t.in.map((x) => JSON.parse(x)), JSON.parse(ct.out), JSON.parse(t.out));
        if (!same) { failed += 1; console.log(`✗ ${p.slug} test ${k}: committed answer ${ct.out} no longer matches the reference (${t.out})`); }
      });
    }
    console.log(`✓ ${lesson}: ${shipped.length}/${specs.length} problems`);
    continue;
  }
  // statements, constraints and hints (problems/text) ride along; problems/text.mjs checks them
  const merged = await mergeLesson(lesson, shipped);
  for (const e of merged.errors) console.log(`✗ ${e}`);
  failed += merged.errors.length;
  writeFileSync(join(outDir, `${lesson}.json`), `[\n${merged.problems.map((p) => JSON.stringify(p)).join(',\n')}\n]\n`);
  console.log(`✓ ${lesson}: ${shipped.length}/${specs.length} problems`);
}

if (!CHECK) writeFileSync(indexPath, `${JSON.stringify(Object.fromEntries(Object.entries(index).sort()))}\n`);
// The calibration workload's time on this machine (median), to scale performance limits on the judge.
if (calibrations.length && !CHECK) {
  const sorted = [...calibrations].sort((a, b) => a - b);
  writeFileSync(join(outDir, 'meta.json'), `${JSON.stringify({ calibrationMs: sorted[Math.floor(sorted.length / 2)] })}\n`);
}
const timed = Object.entries(timings).sort((a, b) => b[1] - a[1]);
if (timed.length) console.log(`\nPerformance tests: ${timed.length}; slowest references: ${timed.slice(0, 5).map(([s, ms]) => `${s} ${ms} ms`).join(', ')}`);
if (unfuzzed.length) {
  console.log(`\n${unfuzzed.length} problems have no generated tests (problems/fuzz): ${unfuzzed.slice(0, 10).join(', ')}${unfuzzed.length > 10 ? ', …' : ''}`);
  if (CHECK && !only.length) failed += unfuzzed.length;
}
console.log(failed ? `\n${failed} of ${total} problems failed` : `\nAll ${total} problems verified`);
process.exit(failed ? 1 : 0);
