import { LEETCODE_API } from '../config/services';
import { getProfile, updateProfile } from '../hooks/useProfile';
import { markSolvedFrom } from '../hooks/useSolved';
import { logActivity } from '../hooks/useActivity';
import { dayKey } from './dates';
import { loadFirebase } from './firebase';

/**
 * LeetCode sync. A successful refresh is allowed once an hour per learner (the time is stored in the
 * synced profile, so it holds across devices and reloads). Failed lookups (a typo in the username)
 * don't start the hour, but attempts are spaced at least 30 seconds apart.
 */
export const REFRESH_MS = 60 * 60 * 1000;
const ATTEMPT_GAP_MS = 30 * 1000;
let lastAttempt = 0;

export const leetcodeEnabled = Boolean(LEETCODE_API);

/** Milliseconds until another refresh is allowed (0 = now). */
export function refreshWait(profile = getProfile(), now = Date.now()) {
  const synced = profile.leetcode?.syncedAt ?? 0;
  return Math.max(0, synced + REFRESH_MS - now, lastAttempt + ATTEMPT_GAP_MS - now);
}

export async function syncLeetCode(username) {
  const name = username.trim();
  const wait = refreshWait();
  if (wait > 0) throw new Error('You can refresh LeetCode data once an hour.');
  const fb = await loadFirebase();
  const user = fb?.auth.currentUser;
  if (!user) throw new Error('Sign in to sync LeetCode.');
  lastAttempt = Date.now();

  let res;
  try {
    const token = await user.getIdToken();
    res = await fetch(`${LEETCODE_API}?username=${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new Error('Could not reach the LeetCode sync service. Check your connection.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `LeetCode sync failed (${res.status}).`);

  // LeetCode only shows the last 20 accepted problems, so keep every one we have ever seen.
  const prev = getProfile().leetcode;
  const sameUser = prev?.username?.toLowerCase() === body.username.toLowerCase();
  const seen = { ...(sameUser ? prev.seen : {}) };
  for (const s of body.recent) if (!seen[s.slug]) seen[s.slug] = { title: s.title, at: s.at };

  updateProfile({ leetcode: { username: body.username, syncedAt: Date.now(), data: body, seen } });
  const added = markSolvedFrom(body.recent.map((s) => ({ slug: s.slug, at: s.at })));
  // Problems accepted today count toward today's plan, once each.
  const day = dayKey();
  const fresh = body.recent.filter((s) => dayKey(new Date(s.at)) === day && !prev?.seen?.[s.slug]).length;
  if (fresh) logActivity('problem', fresh);
  return { profile: body, added };
}

export function disconnectLeetCode() {
  // Keep syncedAt so disconnecting and reconnecting can't skip the hourly limit.
  updateProfile((p) => ({ leetcode: p.leetcode ? { syncedAt: p.leetcode.syncedAt } : null }));
}
