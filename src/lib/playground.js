import { readJSON, writeJSON } from './storage';
import { wrapJava } from './javaWrap';

/** Hand-off from a lesson's code block to the Code Playground. */
const HANDOFF = 'bcb:playground-handoff';

export function openInPlayground(snippet, lessonKey) {
  writeJSON(HANDOFF, { code: wrapJava(snippet), lessonKey, at: Date.now() });
}

export function takeHandoff() {
  const h = readJSON(HANDOFF, null);
  if (!h) return null;
  writeJSON(HANDOFF, null);
  return Date.now() - h.at < 60_000 ? h : null;
}
