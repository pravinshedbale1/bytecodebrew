import ladderData from 'virtual:dsa-ladders';
import index from '../../data/problems/index.json';
import cx from '../../data/coachProblems.js';
import { dsa } from '../../curriculum/tracks/dsa';
import { PATTERNS } from './patterns.js';

/**
 * Everything the coach picks from, built once: the pattern lessons in curriculum order, each one's
 * judged problems in ladder order (a problem belongs to the lesson index.json gives it), titles,
 * levels and drill answers.
 */
function build() {
  const course = dsa.courses.find((c) => c.id === 'patterns');
  const lessons = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title })));
  const order = lessons.map((l) => l.id).filter((id) => PATTERNS[id]);
  const titles = Object.fromEntries(lessons.map((l) => [l.id, l.title]));
  const modules = Object.fromEntries(lessons.map((l) => [l.id, l.module]));
  const byPattern = {};
  const problems = {};
  for (const id of order) {
    for (const p of ladderData[id] ?? []) {
      if (index[p.slug] !== id || problems[p.slug]) continue;
      problems[p.slug] = { title: p.title, level: p.level, pattern: id };
      (byPattern[id] ??= []).push(p.slug);
    }
  }
  return { order, byPattern, problems, cx, titles, modules };
}

export const catalog = build();
export const patternOf = (slug) => catalog.problems[slug]?.pattern;
export const lessonPath = (pattern) => `/dsa/patterns/${pattern}`;
