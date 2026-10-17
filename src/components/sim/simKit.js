/** Small, deterministic helpers shared by the simulators. */

/** 32-bit FNV-1a hash of a string, as an unsigned integer. */
export function fnv1a(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Seeded pseudo-random generator (mulberry32): the same seed always gives the same sequence. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distinct colours that read well on both themes, one per server/consumer. */
export const PALETTE = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16'];

export const pct = (x, digits = 0) => `${(x * 100).toFixed(digits)}%`;

/** Value at quantile q (0..1) of an unsorted list. */
export function quantile(values, q) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}
