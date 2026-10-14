/** Splits a pathname into curriculum ids: /:trackId/:courseId/:lessonId */
export function parsePath(pathname) {
  const [trackId = null, courseId = null, lessonId = null] = pathname.split('/').filter(Boolean);
  return { trackId, courseId, lessonId };
}
