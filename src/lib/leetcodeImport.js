import ladderData from 'virtual:dsa-ladders';
import { markSolvedFrom } from '../hooks/useSolved';
import { getProfile, updateProfile } from '../hooks/useProfile';

/**
 * Import every problem the learner has ever solved on LeetCode.
 *
 * LeetCode only lists a user's accepted problems to that user, signed in, on leetcode.com
 * (/api/problems/all/ returns status "ac" per problem). So a small script runs there, in the learner's
 * own session, reads the list and opens ByteCodeBrew with the solved slugs in the URL hash. The hash
 * never reaches a server, and the script never reads or sends cookies or passwords.
 */
const HASH_KEY = 'lc-import';
const SLUG = /^[a-z0-9-]{1,120}$/;

function script(origin) {
  return `(async () => {
  if (!/(^|\\.)leetcode\\.(com|cn)$/.test(location.hostname)) { alert('Open leetcode.com (signed in) and run this there.'); return; }
  try {
    const res = await fetch('/api/problems/all/', { credentials: 'include' });
    const data = await res.json();
    if (!data.user_name) { alert('Sign in to LeetCode first, then try again.'); return; }
    const solved = data.stat_status_pairs.filter((p) => p.status === 'ac').map((p) => p.stat.question__title_slug);
    const url = '${origin}/dashboard#${HASH_KEY}=' + encodeURIComponent(JSON.stringify({ u: data.user_name, s: solved }));
    if (!window.open(url, '_blank')) location.href = url;
  } catch (e) {
    alert('Could not read your LeetCode progress: ' + e.message);
  }
})();`;
}

/** Readable script to paste into the browser console on leetcode.com. */
export const consoleScript = (origin) => script(origin);

/** The same script as a bookmarklet URL (set it with setAttribute: React refuses javascript: hrefs). */
export const bookmarkletHref = (origin) => `javascript:${encodeURIComponent(script(origin).replace(/\n\s*/g, ' '))}`;

/** { username, slugs } from the URL hash, or null. Removes the hash so a reload doesn't import again. */
export function takeImportFromHash() {
  const m = new RegExp(`#${HASH_KEY}=(.*)$`).exec(window.location.hash);
  if (!m) return null;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  try {
    const { u, s } = JSON.parse(decodeURIComponent(m[1]));
    if (typeof u !== 'string' || !Array.isArray(s)) return null;
    return { username: u.slice(0, 40), slugs: s.filter((x) => typeof x === 'string' && SLUG.test(x)) };
  } catch {
    return null;
  }
}

const ladderSlugs = () => new Set(Object.values(ladderData).flat().map((p) => p.slug));

/** Mark every imported problem that is on our ladders as solved on LeetCode; returns a summary. */
export function applyImport({ username, slugs }) {
  const ours = ladderSlugs();
  const matched = slugs.filter((s) => ours.has(s));
  const at = new Date().toISOString();
  const added = markSolvedFrom(matched.map((slug) => ({ slug, at })));
  const summary = { username, at, total: slugs.length, matched: matched.length, added };
  updateProfile({ leetcodeImport: summary });
  return summary;
}

/** The connected username differs from the imported one (worth confirming before applying). */
export function importMismatch(username) {
  const connected = getProfile().leetcode?.username;
  return Boolean(connected && connected.toLowerCase() !== username.toLowerCase());
}
