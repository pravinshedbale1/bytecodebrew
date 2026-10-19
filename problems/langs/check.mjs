#!/usr/bin/env node
/**
 * Checks the C++, Python and JavaScript harnesses (src/lib/judge/langs) on this machine, the way
 * Judge0 would run them (clang++ or g++, python3, node):
 *
 *   1. every problem's starter code goes through each harness: C++ must compile, and Python and
 *      JavaScript must produce a result (or the learner-code error an empty body causes) for every test
 *   2. every solution in problems/langs/solutions/<slug>.<cpp|py|js> must pass all of its problem's tests
 *
 *   node problems/langs/check.mjs                 everything
 *   node problems/langs/check.mjs --solutions     only step 2
 *   node problems/langs/check.mjs linked-list     only problems (and solution files) whose name contains "linked-list"
 *   node problems/langs/check.mjs --solutions .py only the Python solutions"
 */
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir, cpus } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import cpp from '../../src/lib/judge/langs/cpp.js';
import python from '../../src/lib/judge/langs/python.js';
import javascript from '../../src/lib/judge/langs/javascript.js';
import { parseOutput } from '../../src/lib/judge/harness.js';
import { accept, parseJson } from '../../src/lib/judge/check.js';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', '..', 'src', 'data', 'problems');
const solDir = join(here, 'solutions');
const include = join(here, 'include');
const args = process.argv.slice(2);
const onlySolutions = args.includes('--solutions');
const filter = args.find((a) => !a.startsWith('--'));

const CXX = spawnSync('g++-14', ['--version']).status === 0 ? 'g++-14' : spawnSync('g++', ['--version']).stdout?.toString().includes('Free Software') ? 'g++' : 'clang++';
const LANGS = {
  cpp: { mod: cpp, ext: 'cpp', file: 'main.cpp' },
  python: { mod: python, ext: 'py', file: 'script.py' },
  javascript: { mod: javascript, ext: 'js', file: 'script.js' },
};

const allSpecs = readdirSync(dataDir)
  .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'meta.json')
  .flatMap((f) => JSON.parse(readFileSync(join(dataDir, f), 'utf8')));
const specs = allSpecs.filter((p) => !filter || p.slug.includes(filter));
const bySlug = new Map(allSpecs.map((p) => [p.slug, p]));

function exec(cmd, argv, cwd, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const child = spawn(cmd, argv, { cwd });
    let stdout = '', stderr = '', timedOut = false;
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.on('close', (code, signal) => { clearTimeout(timer); resolve({ code, signal, stdout, stderr, timedOut }); });
  });
}

/** Runs a program like Judge0 and returns the same shape as runCode in src/lib/judge0.js. */
async function runLocal(langId, source, { syntaxOnly = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'bcb-'));
  const { file } = LANGS[langId];
  writeFileSync(join(dir, file), source);
  try {
    let run;
    if (langId === 'cpp') {
      const c = await exec(CXX, ['-std=c++20', '-O2', '-w', '-I', include, ...(syntaxOnly ? ['-fsyntax-only'] : ['-o', 'main']), file], dir, 120000);
      if (c.code !== 0) return { status: 'Compilation Error', ok: false, compile: c.stderr, stdout: '', stderr: '' };
      if (syntaxOnly) return { status: 'Accepted', ok: true, stdout: '', stderr: '' };
      run = await exec('./main', [], dir);
    } else {
      run = await exec(langId === 'python' ? 'python3' : 'node', [file], dir);
    }
    const status = run.timedOut ? 'Time Limit Exceeded' : run.code === 0 ? 'Accepted' : run.signal ? `Runtime Error (${run.signal})` : 'Runtime Error (NZEC)';
    return { status, ok: status === 'Accepted', stdout: run.stdout, stderr: run.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function pool(items, fn, size = Math.max(2, cpus().length - 1)) {
  const out = [];
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
  }));
  return out;
}

/** Starter code with `pass` in each empty Python body (a blank body is a syntax error). */
const runnableStarter = (langId, code) => (langId !== 'python' ? code : code.split('\n').map((l, i, all) => (
  i > 0 && all[i - 1].trimEnd().endsWith(':') && l.length > 0 && !l.trim() ? `${l}pass` : l)).join('\n'));

let failures = 0;
const fail = (msg) => { failures += 1; console.log(`✗ ${msg}`); };

// ---- 1. starter code through every harness
if (!onlySolutions) {
  for (const [langId, { mod }] of Object.entries(LANGS)) {
    const jobs = specs.map((spec) => async () => {
      const tests = spec.tests.filter((t) => !t.perf);
      let built;
      try {
        built = mod.build(spec, runnableStarter(langId, mod.starter(spec)), tests);
      } catch (e) {
        return fail(`${langId} ${spec.slug}: harness throws: ${e.message}`);
      }
      const r = await runLocal(langId, built.source, { syntaxOnly: langId === 'cpp' });
      const compile = langId === 'cpp' ? mod.compileError(r, built) : mod.compileError(r, built);
      if (compile != null || (langId === 'cpp' && !r.ok)) return fail(`${langId} ${spec.slug}: starter doesn't compile\n${(compile ?? r.compile ?? '').slice(0, 1500)}`);
      if (langId === 'cpp') return null;
      const { results } = parseOutput(r.stdout, tests.length, built.lineOffset);
      const missing = results.findIndex((x) => !x);
      if (missing >= 0) return fail(`${langId} ${spec.slug}: no result for test ${missing} (${r.status})\n${r.stderr.slice(-800)}`);
      // an empty body returns None/undefined; anything else that fails points at the harness
      const odd = results.filter((x) => x.error && !/NoneType|undefined|null|not iterable|not subscriptable|unsupported operand|has no len/i.test(x.error));
      if (odd.length) console.log(`  note ${langId} ${spec.slug}: ${[...new Set(odd.map((x) => x.error))].join(' | ')}`);
      return null;
    });
    await pool(jobs, (j) => j());
    console.log(`${langId}: starter code checked for ${specs.length} problems`);
  }
}

// ---- 2. real solutions must pass every test
const solutions = existsSync(solDir) ? readdirSync(solDir).filter((f) => !filter || f.includes(filter)) : [];
await pool(solutions, async (f) => {
  const m = /^(.+)\.(cpp|py|js)$/.exec(f);
  if (!m) return;
  const [, slug, ext] = m;
  const langId = Object.keys(LANGS).find((k) => LANGS[k].ext === ext);
  const spec = bySlug.get(slug);
  if (!spec) return fail(`${f}: no problem ${slug}`);
  const tests = spec.tests.filter((t) => !t.perf);
  const { mod } = LANGS[langId];
  const built = mod.build(spec, readFileSync(join(solDir, f), 'utf8'), tests);
  const r = await runLocal(langId, built.source);
  const compile = mod.compileError(r, built);
  if (compile != null) return fail(`${f}: compile error\n${compile.slice(0, 1500)}`);
  const { results } = parseOutput(r.stdout, tests.length, built.lineOffset);
  tests.forEach((t, i) => {
    const res = results[i];
    if (!res) return fail(`${f} test ${i}: no result (${r.status}) ${mod.cleanStderr(r.stderr, built).slice(-600)}`);
    if (res.error) return fail(`${f} test ${i}: ${res.error}`);
    const got = parseJson(res.got);
    if (!got.ok) return fail(`${f} test ${i}: unreadable output ${res.got}`);
    if (!accept(spec, t.in.map((x) => JSON.parse(x)), got.value, JSON.parse(t.out))) fail(`${f} test ${i}: got ${res.got}, expected ${t.out}`);
  });
});
console.log(`solutions: ${solutions.length} checked`);

console.log(failures ? `\n${failures} problem${failures === 1 ? '' : 's'}` : '\nAll good.');
process.exit(failures ? 1 : 0);
