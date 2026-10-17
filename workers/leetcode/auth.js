/**
 * Who may use the LeetCode proxy: signed-in learners with premium access.
 *
 * The site sends `Authorization: Bearer <Firebase ID token>`. We verify the token's RS256 signature
 * against Google's published keys and its claims (project, expiry, verified email), then check
 * premium: the admin email, or an `entitlements/{email}` document, read from Firestore with the
 * learner's own token (the security rules let each person read only their own).
 *
 * Works in Cloudflare Workers and Node 20+ (both have fetch and WebCrypto).
 * Keep ADMIN_EMAILS in sync with src/config/access.js and firestore.rules.
 */
export const ADMIN_EMAILS = ['bytecodebrew@gmail.com'];

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const PREMIUM_TTL_MS = 5 * 60 * 1000;

export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let keys = { at: 0, ttl: 0, byKid: new Map() };
const premiumCache = new Map();   // email -> time premium was last confirmed (only positives, so approvals apply at once)

const b64url = (s) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};
const decodePart = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));

async function publicKey(kid) {
  const now = Date.now();
  if (now - keys.at > keys.ttl || !keys.byKid.has(kid)) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new AuthError(503, 'Could not check your sign-in right now. Try again shortly.');
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('Cache-Control') ?? '')?.[1] ?? 3600);
    const { keys: list } = await res.json();
    const byKid = new Map();
    for (const jwk of list) {
      byKid.set(jwk.kid, await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']));
    }
    keys = { at: now, ttl: maxAge * 1000, byKid };
  }
  return keys.byKid.get(kid);
}

/**
 * Verify a Firebase ID token; returns its claims. `emulator: true` accepts the Auth emulator's
 * unsigned tokens (local development only, never in production).
 */
export async function verifyIdToken(token, { projectId, emulator = false, now = Date.now() }) {
  const parts = (token ?? '').split('.');
  if (parts.length !== 3) throw new AuthError(401, 'Sign in to use LeetCode sync.');
  let header;
  let claims;
  try {
    header = decodePart(parts[0]);
    claims = decodePart(parts[1]);
  } catch {
    throw new AuthError(401, 'Sign in to use LeetCode sync.');
  }
  if (!emulator) {
    if (header.alg !== 'RS256') throw new AuthError(401, 'Invalid sign-in token.');
    const key = await publicKey(header.kid);
    if (!key) throw new AuthError(401, 'Invalid sign-in token.');
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!ok) throw new AuthError(401, 'Invalid sign-in token.');
  }
  const sec = Math.floor(now / 1000);
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}`) throw new AuthError(401, 'Invalid sign-in token.');
  if (!claims.sub || typeof claims.exp !== 'number' || claims.exp <= sec || (claims.iat ?? 0) > sec + 300) {
    throw new AuthError(401, 'Your sign-in has expired. Reload the page.');
  }
  if (claims.email_verified !== true || !claims.email) throw new AuthError(403, 'Your Google account email is not verified.');
  return claims;
}

/** True when this (verified) email has premium access. `firestoreBase` overrides the host for the emulator. */
export async function hasPremium(email, token, { projectId, firestoreBase = 'https://firestore.googleapis.com', now = Date.now() }) {
  const lower = email.toLowerCase();
  if (ADMIN_EMAILS.includes(lower)) return true;
  if (now - (premiumCache.get(lower) ?? -Infinity) < PREMIUM_TTL_MS) return true;
  const url = `${firestoreBase}/v1/projects/${projectId}/databases/(default)/documents/entitlements/${encodeURIComponent(lower)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  let premium = false;
  if (res.ok) premium = (await res.json()).fields?.premium?.booleanValue === true;
  else if (res.status !== 404 && res.status !== 403) throw new AuthError(503, 'Could not check your access right now. Try again shortly.');
  if (premium) premiumCache.set(lower, now);
  else premiumCache.delete(lower);
  return premium;
}

/** Both checks, from an Authorization header. Throws AuthError; resolves to the claims. */
export async function requirePremium(authorization, opts) {
  const token = /^Bearer (.+)$/.exec(authorization ?? '')?.[1];
  const claims = await verifyIdToken(token, opts);
  if (!(await hasPremium(claims.email, token, opts))) {
    throw new AuthError(403, 'LeetCode sync is a premium feature. Email bytecodebrew@gmail.com to request access.');
  }
  return claims;
}
