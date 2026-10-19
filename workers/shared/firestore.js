/**
 * Privileged Firestore access for Workers, through the REST API with a Google service account.
 * Server writes bypass the security rules, so they are used only for things users must not be able
 * to do themselves (recording payments, granting premium).
 *
 *   const db = firestore({ projectId, serviceAccount })          // production
 *   const db = firestore({ projectId, emulator: 'http://127.0.0.1:8080' })   // local emulator
 *   await db.get('plans/monthly')          → plain object or null
 *   await db.set('orders/abc', {...})      → overwrite the document
 *   await db.create('orders/abc', {...})   → fails if it already exists
 *
 * Works in Cloudflare Workers and Node 20+ (fetch and WebCrypto).
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/datastore';

const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlText = (text) => b64url(new TextEncoder().encode(text));

function pemToDer(pem) {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

const cached = new Map();   // scope -> { token, until }

/**
 * An OAuth access token for the service account (signed JWT exchanged at Google), cached per scope
 * until shortly before it expires. Firestore uses the datastore scope; other Google APIs (Firebase
 * Auth's user list) pass their own.
 */
export async function accessToken(sa, scope = SCOPE, now = Date.now()) {
  const hit = cached.get(scope);
  if (hit && now < hit.until) return hit.token;
  const iat = Math.floor(now / 1000);
  const header = b64urlText(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64urlText(JSON.stringify({ iss: sa.client_email, scope, aud: TOKEN_URL, iat, exp: iat + 3600 }));
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claims}.${b64url(sig)}` }),
  });
  if (!res.ok) throw new Error(`Service account login failed (${res.status})`);
  const { access_token: token, expires_in: ttl } = await res.json();
  cached.set(scope, { token, until: now + (ttl - 120) * 1000 });
  return token;
}

// ---- value conversion between plain JS and Firestore's typed JSON

export function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
}

export function fromValue(v) {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return new Date(v.timestampValue);
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(fromValue);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, fromValue(x)]));
  return undefined;
}

const fieldsOf = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toValue(v)]));

export function firestore({ projectId, serviceAccount, emulator }) {
  const base = `${emulator ?? 'https://firestore.googleapis.com'}/v1/projects/${projectId}/databases/(default)/documents`;
  // The emulator accepts "Bearer owner" as an administrator that bypasses the rules
  const auth = async () => ({ Authorization: `Bearer ${emulator ? 'owner' : await accessToken(serviceAccount)}` });
  const url = (path, query = '') => `${base}/${path.split('/').map(encodeURIComponent).join('/')}${query}`;

  async function call(path, init = {}, query = '') {
    const res = await fetch(url(path, query), { ...init, headers: { 'Content-Type': 'application/json', ...(await auth()), ...(init.headers ?? {}) } });
    return res;
  }

  /** One write through :commit, with a precondition; false when the precondition fails. */
  async function commitOne(path, data, { updateMask, currentDocument }) {
    const name = `projects/${projectId}/databases/(default)/documents/${path}`;
    const write = { update: { name, fields: fieldsOf(data) }, currentDocument, ...(updateMask ? { updateMask: { fieldPaths: updateMask } } : {}) };
    const res = await fetch(`${base}:commit`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await auth()) }, body: JSON.stringify({ writes: [write] }) });
    if (res.ok) return true;
    const text = await res.text();
    if (/FAILED_PRECONDITION|ALREADY_EXISTS|ABORTED/.test(text)) return false;
    throw new Error(`Firestore write ${path} failed (${res.status}): ${text}`);
  }

  return {
    async get(path) {
      return (await this.getWithMeta(path))?.data ?? null;
    },
    /** { data, updateTime } or null; updateTime enables optimistic concurrency with `update(..., { ifUpdateTime })`. */
    async getWithMeta(path) {
      const res = await call(path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Firestore get ${path} failed (${res.status})`);
      const doc = await res.json();
      return { data: fromValue({ mapValue: { fields: doc.fields ?? {} } }), updateTime: doc.updateTime };
    },
    async set(path, data) {
      const res = await call(path, { method: 'PATCH', body: JSON.stringify({ fields: fieldsOf(data) }) });
      if (!res.ok) throw new Error(`Firestore set ${path} failed (${res.status}): ${await res.text()}`);
    },
    /**
     * Merge: only the given fields change. With `ifUpdateTime`, the write happens only if the document
     * was not changed since that read; returns false when someone else changed it first.
     */
    async update(path, data, { ifUpdateTime } = {}) {
      if (ifUpdateTime) return commitOne(path, data, { updateMask: Object.keys(data), currentDocument: { updateTime: ifUpdateTime } });
      const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
      const res = await call(path, { method: 'PATCH', body: JSON.stringify({ fields: fieldsOf(data) }) }, `?${mask}`);
      if (!res.ok) throw new Error(`Firestore update ${path} failed (${res.status}): ${await res.text()}`);
      return true;
    },
    /** Create only if absent; returns false if the document already existed. */
    async create(path, data) {
      return commitOne(path, data, { currentDocument: { exists: false } });
    },
  };
}
