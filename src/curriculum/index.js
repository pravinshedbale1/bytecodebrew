import { systemDesign } from './tracks/systemDesign';
import { dsa } from './tracks/dsa';
import { csFundamentals, behavioral } from './tracks/placeholders';
import { hasContent } from '../content/registry';

/**
 * Curriculum hierarchy:  Track → Course → Module → Lesson
 * Routes:                /:trackId/:courseId/:lessonId
 */
export const tracks = [systemDesign, dsa, csFundamentals, behavioral];

export const lessonKey = (trackId, courseId, lessonId) =>
  `${trackId}/${courseId}/${lessonId}`;

export const lessonPath = (trackId, courseId, lessonId) =>
  `/${trackId}/${courseId}/${lessonId}`;

export function getTrack(trackId) {
  return tracks.find((t) => t.id === trackId) ?? null;
}

export function getCourse(trackId, courseId) {
  return getTrack(trackId)?.courses.find((c) => c.id === courseId) ?? null;
}

/** Every lesson of a course in reading order, annotated with its module and availability. */
export function getCourseLessons(trackId, courseId) {
  const course = getCourse(trackId, courseId);
  if (!course) return [];
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => {
      const key = lessonKey(trackId, courseId, lesson.id);
      return {
        ...lesson,
        key,
        path: lessonPath(trackId, courseId, lesson.id),
        moduleId: module.id,
        moduleTitle: module.title,
        available: hasContent(key),
      };
    }),
  );
}

/** Lesson plus its readable neighbours (planned lessons are skipped). */
export function getLessonContext(trackId, courseId, lessonId) {
  const all = getCourseLessons(trackId, courseId);
  const lesson = all.find((l) => l.id === lessonId);
  if (!lesson) return null;
  const readable = all.filter((l) => l.available);
  const i = readable.findIndex((l) => l.id === lessonId);
  return {
    lesson,
    prev: i > 0 ? readable[i - 1] : null,
    next: i >= 0 && i < readable.length - 1 ? readable[i + 1] : null,
    position: all.indexOf(lesson) + 1,
    total: all.length,
  };
}

export function courseStats(trackId, courseId) {
  const lessons = getCourseLessons(trackId, courseId);
  const available = lessons.filter((l) => l.available);
  return {
    total: lessons.length,
    available: available.length,
    minutes: available.reduce((sum, l) => sum + (l.minutes ?? 0), 0),
  };
}

export function trackIsActive(track) {
  return track.courses.some((c) => courseStats(track.id, c.id).available > 0);
}
