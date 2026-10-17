import { JUDGE0_URL, JUDGE0_JAVA } from '../config/services';

const toB64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const fromB64 = (s) => (s ? new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))) : '');

// Judge0's public instance is shared and free: keep runs at least a few seconds apart, site-wide.
const MIN_GAP_MS = 3000;
let lastRun = 0;

/** Milliseconds until another run is allowed. */
export const runWait = () => Math.max(0, lastRun + MIN_GAP_MS - Date.now());

/**
 * Compile and run a Java program (class Main) on Judge0.
 * Returns { status, ok, stdout, stderr, compile, time, memory }.
 */
export async function runJava(source, stdin = '') {
  const wait = runWait();
  if (wait > 0) throw new Error(`Give the runner ${Math.ceil(wait / 1000)} more second${wait > 1000 ? 's' : ''}.`);
  lastRun = Date.now();
  let res;
  try {
    res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: JUDGE0_JAVA,
        source_code: toB64(source),
        stdin: toB64(stdin),
        cpu_time_limit: 5,
        memory_limit: 256000,
      }),
    });
  } catch {
    throw new Error('Could not reach the code runner. Check your connection and try again.');
  }
  if (res.status === 429) throw new Error('The free code runner is busy. Wait a minute and run again.');
  if (!res.ok) throw new Error(`The code runner answered with ${res.status}.`);
  const r = await res.json();
  return {
    status: r.status?.description ?? 'Unknown',
    ok: r.status?.id === 3,
    stdout: fromB64(r.stdout),
    stderr: fromB64(r.stderr),
    compile: fromB64(r.compile_output),
    message: fromB64(r.message),
    time: r.time,
    memory: r.memory,
  };
}
