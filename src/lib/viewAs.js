/**
 * "View as" (admin): one browser tab shows the site as a chosen learner sees it, read-only.
 *
 * Opened from /admin with ?viewAs=<uid>&e=<email>&n=<name>; remembered for that tab only
 * (sessionStorage, deliberately not a "bcb:" key). While it is on:
 *   - the synced stores load that learner's documents into memory and never save anything
 *     (src/lib/syncedStore.js), submissions are read-only (src/lib/submissions.js)
 *   - this browser's own learning data is neither read nor written (src/lib/storage.js), so the
 *     admin's data and the learner's never mix; only display settings (theme, style) are shared
 *   - Premium and locks follow the learner's own entitlement (src/hooks/useAccess.js)
 * Firestore rules are the real guard: an admin may read a learner's learning data, only the learner
 * may write it, and the private settings (API key) are never readable. Imported first by main.jsx.
 */
const KEY = 'bcb-viewas';

function load() {
  try {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('viewAs');
    if (uid && /^[A-Za-z0-9_-]{6,128}$/.test(uid)) {
      const v = { uid, email: (params.get('e') ?? '').toLowerCase(), name: params.get('n') ?? '' };
      sessionStorage.setItem(KEY, JSON.stringify(v));
      ['viewAs', 'e', 'n'].forEach((p) => params.delete(p));
      const rest = params.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`);
      return v;
    }
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    return saved?.uid ? saved : null;
  } catch {
    return null;
  }
}

export const viewAs = typeof window === 'undefined' ? null : load();
export const isViewingAs = () => Boolean(viewAs);

/** Leave view-as mode in this tab and go back to the admin page as yourself. */
export function exitViewAs(to = '/admin') {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  window.location.assign(to);
}

/** A link that opens a new tab viewing the site as this learner. */
export const viewAsHref = ({ uid, email, name }) =>
  `/dashboard?viewAs=${encodeURIComponent(uid)}&e=${encodeURIComponent(email ?? '')}&n=${encodeURIComponent(name ?? '')}`;

/** Tell the page a change was blocked because this is a read-only view. */
export function noteReadOnly() {
  window.dispatchEvent(new Event('bcb:readonly'));
}
