/**
 * Picks what the learner should read next: the first readable lesson,
 * in roadmap order, that isn't complete yet.
 */
export function getNextUp(lessons, isComplete) {
  const readable = lessons.filter((l) => l.available);
  const completed = readable.filter((l) => isComplete(l.key)).length;
  const next = readable.find((l) => !isComplete(l.key)) ?? null;
  const mode = !next ? 'done' : completed === 0 ? 'start' : 'continue';
  return { next, mode, completed, total: readable.length };
}
