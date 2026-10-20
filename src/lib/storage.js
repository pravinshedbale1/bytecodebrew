import { isViewingAs, noteReadOnly } from './viewAs';

/**
 * localStorage wrapper that never throws (private mode, blocked storage).
 *
 * In an admin "view as" tab (src/lib/viewAs.js) this browser's learning data is off limits: reads of
 * "bcb:" keys return the fallback and writes are dropped, so the learner being viewed and the admin's
 * own data never mix. Display settings (theme, style, layout, code language) still apply.
 */
const SHARED_IN_VIEW_AS = ['bcb:theme', 'bcb:look', 'bcb:lang'];
const isolated = (key) => isViewingAs() && key.startsWith('bcb:') && !SHARED_IN_VIEW_AS.includes(key) && !key.startsWith('bcb:split:');

export function readJSON(key, fallback) {
  if (isolated(key)) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  if (isolated(key)) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — progress just won't persist */
  }
}

export { noteReadOnly };
