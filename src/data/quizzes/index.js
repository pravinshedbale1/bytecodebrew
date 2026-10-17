/**
 * Quick-check questions, one file per course: ./<trackId>/<courseId>.js
 *   export default { [lessonId]: [{ q, options: [..], answer: index, why }] }
 * Loaded on demand so lessons don't pay for questions they don't show.
 */
import { hashText } from '../../lib/hash';

const files = import.meta.glob('./*/*.js');

const cache = new Map();

/**
 * Options are written with the answer anywhere; shuffle them with a seed taken from the question text,
 * so the correct position is unbiased but stable across visits and devices.
 */
function shuffled(question) {
  let seed = parseInt(hashText(question.q), 36) || 1;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = question.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...question, options: order.map((i) => question.options[i]), answer: order.indexOf(question.answer) };
}

export function loadCourseQuizzes(trackId, courseId) {
  const path = `./${trackId}/${courseId}.js`;
  if (!files[path]) return Promise.resolve({});
  if (!cache.has(path)) {
    cache.set(path, files[path]().then((m) => Object.fromEntries(Object.entries(m.default).map(([id, qs]) => [id, qs.map(shuffled)]))));
  }
  return cache.get(path);
}

/** Stable id of a question (its text), so edits that reorder a quiz don't mix up saved answers. */
export const quizId = (question) => hashText(question.q);

export async function loadLessonQuiz(lessonKey) {
  const [trackId, courseId, lessonId] = lessonKey.split('/');
  const course = await loadCourseQuizzes(trackId, courseId);
  return course[lessonId] ?? [];
}

/** { [lessonKey]: questions } for every course. */
export async function loadAllQuizzes() {
  const out = {};
  await Promise.all(
    Object.keys(files).map(async (path) => {
      const [, trackId, courseId] = path.match(/^\.\/([^/]+)\/([^/]+)\.js$/);
      const course = await loadCourseQuizzes(trackId, courseId);
      for (const [lessonId, qs] of Object.entries(course)) out[`${trackId}/${courseId}/${lessonId}`] = qs;
    }),
  );
  return out;
}
