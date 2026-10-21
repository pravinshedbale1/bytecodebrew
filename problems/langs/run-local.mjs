/**
 * Runs a judge program on this machine the way Judge0 would (javac/java, clang++ or g++, python3,
 * node) and returns the same shape as runCode in src/lib/judge0.js. Shared by problems/langs/check.mjs
 * and problems/solutions.mjs.
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir, cpus } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const include = join(dirname(fileURLToPath(import.meta.url)), 'include');

export const CXX = spawnSync('g++-14', ['--version']).status === 0 ? 'g++-14' : spawnSync('g++', ['--version']).stdout?.toString().includes('Free Software') ? 'g++' : 'clang++';
const FILES = { java: 'Main.java', cpp: 'main.cpp', python: 'script.py', javascript: 'script.js' };

export function exec(cmd, argv, cwd, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const child = spawn(cmd, argv, { cwd });
    let stdout = '', stderr = '', timedOut = false;
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.on('close', (code, signal) => { clearTimeout(timer); resolve({ code, signal, stdout, stderr, timedOut }); });
  });
}

export async function runLocal(langId, source, { syntaxOnly = false, timeoutMs = 20000 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'bcb-'));
  const file = FILES[langId];
  writeFileSync(join(dir, file), source);
  try {
    let run;
    if (langId === 'cpp' || langId === 'java') {
      const c = langId === 'cpp'
        ? await exec(CXX, ['-std=c++20', '-O2', '-w', '-I', include, ...(syntaxOnly ? ['-fsyntax-only'] : ['-o', 'main']), file], dir, 120000)
        : await exec('javac', ['--release', '17', '-nowarn', '-encoding', 'UTF-8', '-d', '.', file], dir, 120000);
      if (c.code !== 0) return { status: 'Compilation Error', ok: false, compile: c.stderr || c.stdout, stdout: '', stderr: '' };
      if (syntaxOnly) return { status: 'Accepted', ok: true, stdout: '', stderr: '' };
      run = langId === 'cpp' ? await exec('./main', [], dir, timeoutMs) : await exec('java', ['-Xss256m', '-cp', '.', 'Main'], dir, timeoutMs);
    } else {
      run = await exec(langId === 'python' ? 'python3' : 'node', [file], dir, timeoutMs);
    }
    const status = run.timedOut ? 'Time Limit Exceeded' : run.code === 0 ? 'Accepted' : run.signal ? `Runtime Error (${run.signal})` : 'Runtime Error (NZEC)';
    return { status, ok: status === 'Accepted', stdout: run.stdout, stderr: run.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function pool(items, fn, size = Math.max(2, cpus().length - 1)) {
  const out = [];
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}
