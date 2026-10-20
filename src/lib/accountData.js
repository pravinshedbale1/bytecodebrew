import { SYNCED_STORES, KEEP_KEYS, learningKeys, wipeBrowser, markResetSeen, pauseSync, resumeSync } from './syncedStore';
import { loadFirebase } from './firebase';
import { deleteRemoteSubmissions, readRemoteSubmissions } from './submissions';

/**
 * "Download my data" and "Delete my data".
 *
 * What a learner's data is (erased by Delete, everywhere):
 *   - the synced stores (STATE_DOCS: browser copy + users/{uid}/state/{name}): lesson progress, solved
 *     problems, highlights and notes, quizzes, practice, activity and streak, review deck, mocks,
 *     LeetCode profile, behavioral drill, story bank, Runway plan, Daily Coach
 *   - code submissions (users/{uid}/submissions/* + bcb:subs:*), drafts, playground code, an unfinished mock,
 *     re-solve timers and every other "bcb:" key in this browser
 * What is kept:
 *   - the Google sign-in, Premium access (entitlements/{email}) and payment receipts (orders/*):
 *     the learner paid for them, and receipts are financial records
 *   - this browser's settings: theme, code language, editor layout (KEEP_KEYS); the Claude API key
 *     unless the learner asks for it to go too
 *
 * Consistency: syncing pauses, the account gets a reset marker FIRST (so every other signed-in device
 * and tab wipes its own copy instead of uploading it back: resetGuard in syncedStore.js), then the
 * account data is deleted and swept a second time, and only then is this browser cleared. If the
 * account can't be reached, nothing in this browser is touched and the learner is told.
 */
const PRIVATE = new Set(['bcb:anthropic-key']);

/**
 * Every synced document a learner can have (users/{uid}/state/{name}); the same list as freeNames and
 * premiumNames in firestore.rules, minus the reset marker. Deleted by name so nothing survives just
 * because the store that owns it wasn't loaded in this session. scripts/check.mjs keeps the lists in step.
 */
export const STATE_DOCS = ['progress', 'solved', 'highlights', 'quiz', 'practice', 'activity', 'reviews', 'mocks', 'profile', 'drills', 'stories', 'runway', 'coach'];

/** What Delete erases and keeps, in the learner's words (shown before they confirm). */
export const ERASED = [
  'Lesson progress, highlights and notes',
  'Solved problems, code submissions and drafts',
  'Quiz answers, practice ratings and your review deck',
  'Daily Coach skill map and sessions',
  'Mock interviews, behavioral drill and story bank',
  'Runway plan, LeetCode connection, streak and activity',
];
export const KEPT = [
  'Your Google sign-in',
  'Premium access and payment receipts',
  'This browser’s settings: theme, code language and editor layout',
];

const TIMEOUT_MS = 20000;
const withTimeout = (p, ms = TIMEOUT_MS) => Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

export async function exportData() {
  const stores = Object.fromEntries(SYNCED_STORES.map((s) => [s.name, s.get()]));
  const storeKeys = new Set(SYNCED_STORES.map((s) => s.storageKey));
  const browser = {};
  for (const k of [...learningKeys(localStorage, []), ...KEEP_KEYS.filter((k) => localStorage.getItem(k) != null)]) {
    if (PRIVATE.has(k) || storeKeys.has(k)) continue;
    try { browser[k] = JSON.parse(localStorage.getItem(k)); } catch { browser[k] = localStorage.getItem(k); }
  }
  // every submission in the account, not only the ones this browser has opened
  let submissions = null;
  try {
    const fb = await loadFirebase();
    const uid = fb?.auth.currentUser?.uid;
    if (uid) submissions = await withTimeout(readRemoteSubmissions(fb, uid), 10000);
  } catch { /* offline: the browser copies under "browser" are still there */ }
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), stores, ...(submissions ? { submissions } : {}), browser }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bytecodebrew-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export class DeleteError extends Error {}

async function deleteAccountData(fb, uid) {
  await Promise.all([
    ...STATE_DOCS.map((name) => fb.fsMod.deleteDoc(fb.fsMod.doc(fb.db, 'users', uid, 'state', name))),
    deleteRemoteSubmissions(fb, uid),
  ]);
}

/**
 * Erase the learner's data here and, when signed in, in the account and on every device.
 * Resolves when done (the caller reloads the page); throws DeleteError with a message for the
 * learner if the account couldn't be reached, in which case this browser is left as it was.
 */
export async function deleteAllData({ removeApiKey = false } = {}) {
  const at = Date.now();
  const fb = await loadFirebase();
  const uid = fb?.auth.currentUser?.uid;
  pauseSync();
  if (uid) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      resumeSync();
      throw new DeleteError('You’re offline, so your account can’t be reached. Nothing was deleted; try again when you’re back online.');
    }
    const marker = fb.fsMod.doc(fb.db, 'users', uid, 'state', 'reset');
    let marked = false;
    try {
      await withTimeout(fb.fsMod.setDoc(marker, { json: JSON.stringify({ at }), updatedAt: fb.fsMod.serverTimestamp() }));
      marked = true;
      await withTimeout(deleteAccountData(fb, uid));
      // another device may have uploaded in the second before it saw the marker: sweep once more
      await new Promise((r) => setTimeout(r, 1500));
      await withTimeout(deleteAccountData(fb, uid));
    } catch (e) {
      // take the marker back (best effort), or this browser would wipe itself on its next load
      if (marked) await withTimeout(fb.fsMod.deleteDoc(marker), 5000).catch(() => {});
      resumeSync();
      throw new DeleteError(e?.message === 'timeout'
        ? 'Your account didn’t answer in time, so the deletion may be incomplete. Nothing in this browser was removed; please try again.'
        : `Your account couldn’t be updated (${e?.code ?? e?.message ?? 'unknown error'}). Nothing in this browser was removed; please try again.`);
    }
  }
  for (const s of SYNCED_STORES) s.clearLocal();
  wipeBrowser(removeApiKey ? KEEP_KEYS.filter((k) => k !== 'bcb:anthropic-key') : KEEP_KEYS);
  markResetSeen(at);            // other tabs of this browser reload; a later sign-in elsewhere sees the marker
}
