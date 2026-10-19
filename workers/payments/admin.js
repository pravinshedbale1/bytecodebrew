import { accessToken } from '../shared/firestore.js';

/**
 * Admin-only reads that the browser can't do itself.
 *
 * listUsers: every account that has ever signed in, from Firebase Authentication (the Identity
 * Toolkit API the Admin SDK's listUsers uses), so the admin sees registered people whether or not
 * they bought anything. `lastActiveAt` is when the account's session token was last refreshed: the
 * site refreshes it about hourly while open, so it means "active within roughly the last hour".
 * Needs the service account (firebase-adminsdk has the Firebase Auth admin role).
 */
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const PAGE = 1000;
const MAX_PAGES = 20;          // 20,000 accounts is plenty for one response

const ms = (v) => (v ? Number(v) || null : null);
const iso = (v) => (v ? Date.parse(v) || null : null);

export async function listUsers(env) {
  const emulator = Boolean(env.AUTH_EMULATOR);
  const base = emulator ? `${env.AUTH_EMULATOR_URL ?? 'http://127.0.0.1:9099'}/identitytoolkit.googleapis.com` : 'https://identitytoolkit.googleapis.com';
  const token = emulator ? 'owner' : await accessToken(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT ?? '{}'), SCOPE);
  const users = [];
  let pageToken = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${base}/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:batchGet?maxResults=${PAGE}${pageToken ? `&nextPageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Listing users failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    for (const u of body.users ?? []) {
      users.push({
        uid: u.localId,
        email: u.email ?? null,
        name: u.displayName ?? null,
        photo: u.photoUrl ?? null,
        verified: Boolean(u.emailVerified),
        disabled: Boolean(u.disabled),
        providers: (u.providerUserInfo ?? []).map((p) => p.providerId),
        createdAt: ms(u.createdAt),
        lastLoginAt: ms(u.lastLoginAt),
        lastActiveAt: Math.max(iso(u.lastRefreshAt) ?? 0, ms(u.lastLoginAt) ?? 0) || null,
      });
    }
    pageToken = body.nextPageToken;
    if (!pageToken) break;
  }
  users.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return { users, truncated: Boolean(pageToken) };
}
