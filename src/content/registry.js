import { lazy } from 'react';

/**
 * Discovers every lesson file at build time.
 * File path convention: ./<trackId>/<courseId>/<lessonId>.mdx
 */
const modules = import.meta.glob('./**/*.mdx');

const loaders = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [
    path.replace(/^\.\//, '').replace(/\.mdx$/, ''),
    load,
  ]),
);

const cache = new Map();

export function hasContent(key) {
  return key in loaders;
}

/** Returns a stable lazy component for a lesson key, or null if none exists. */
export function getLessonComponent(key) {
  if (!hasContent(key)) return null;
  if (!cache.has(key)) cache.set(key, lazy(loaders[key]));
  return cache.get(key);
}
