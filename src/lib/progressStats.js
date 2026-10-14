import { tracks, getCourseLessons } from '../curriculum';

/** Completed vs available lessons across every course. */
export function overallProgress(isComplete) {
  const all = tracks.flatMap((t) => t.courses.flatMap((c) => getCourseLessons(t.id, c.id)));
  const ready = all.filter((l) => l.available);
  return { completed: ready.filter((l) => isComplete(l.key)).length, total: ready.length };
}
