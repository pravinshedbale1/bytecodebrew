/** Small helpers shared by the step-through models (pure, Node-safe). */

export const list = (a) => `[${a.join(', ')}]`;
export const plural = (k, word, many = `${word}s`) => `${k} ${k === 1 ? word : many}`;
export const q = (c) => `'${c}'`;

export function rng(rand = Math.random) {
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const shuffle = (a) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  return { int, shuffle, pick: (a) => a[Math.floor(rand() * a.length)], bool: (p = 0.5) => rand() < p };
}

/** Parse "3, -1, 4" (brackets and unicode minus allowed) into integers within limits. */
export function parseInts(text, { min = -99, max = 99, minLen = 1, maxLen = 10, name = 'nums' } = {}) {
  const parts = String(text ?? '').replace(/[−–]/g, '-').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean);
  if (parts.length < minLen) return { error: minLen <= 1 ? `Type a few whole numbers for ${name}, separated by commas.` : `${name} needs at least ${minLen} numbers.` };
  if (parts.length > maxLen) return { error: `Use at most ${maxLen} numbers for ${name} so every cell stays readable.` };
  const arr = parts.map(Number);
  if (arr.some((x) => !Number.isInteger(x))) return { error: `${name}: whole numbers only, for example 3, 1, 2.` };
  if (arr.some((x) => x < min || x > max)) return { error: `${name}: keep values between ${min} and ${max}.` };
  return { arr };
}

/** One integer within limits. */
export function parseInt1(text, { min = -999, max = 999, name = 'target' } = {}) {
  const t = String(text ?? '').trim().replace(/[−–]/g, '-');
  if (!/^-?\d+$/.test(t)) return { error: `${name} must be a whole number.` };
  const v = Number(t);
  if (v < min || v > max) return { error: `${name} must be between ${min} and ${max}.` };
  return { v };
}
