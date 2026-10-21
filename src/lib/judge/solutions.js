/**
 * Worked solutions (brute force → optimal, in every judge language), generated and tested by
 * problems/solutions.mjs into src/data/solutions/<lessonId>.json. Each lesson's file loads the
 * first time one of its problems opens the Solution tab.
 */
const files = import.meta.glob('../../data/solutions/*.json', { import: 'default' });
const cache = new Map();

/** { pattern, approaches: [{ level, name, idea, steps, time, space, why, code: { java, cpp, python, javascript } }] } or null */
export async function loadSolution(lesson, slug) {
  const path = `../../data/solutions/${lesson}.json`;
  if (!files[path]) return null;
  if (!cache.has(path)) cache.set(path, files[path]());
  const all = await cache.get(path);
  return all[slug] ?? null;
}
