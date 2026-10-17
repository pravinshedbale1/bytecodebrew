import { fetchLeetCodeProfile, ProfileError, USERNAME, CACHE_SECONDS } from './leetcode.js';
import { requirePremium, AuthError } from '../shared/auth.js';

/**
 * Cloudflare Worker: GET /leetcode?username=<name>
 *
 * Browsers cannot call LeetCode directly (no CORS), so the site goes through this Worker.
 * Protection against hammering LeetCode or the Worker:
 *  - each username is fetched from LeetCode at most once an hour (edge cache);
 *  - each IP gets at most IP_LIMIT uncached lookups an hour;
 *  - only the site's own origins may call it from a browser;
 *  - only signed-in learners with premium access (see auth.js) may call it at all.
 */
const ALLOWED_ORIGINS = [
  'https://bytecodebrew.com',
  'https://www.bytecodebrew.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const IP_LIMIT = 20;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (body, status, origin, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin), ...extra },
  });

async function overIpLimit(cache, ip) {
  const key = new Request(`https://bcb-limits.internal/ip/${encodeURIComponent(ip)}`);
  const hit = await cache.match(key);
  const used = hit ? Number(await hit.text()) || 0 : 0;
  if (used >= IP_LIMIT) return true;
  await cache.put(key, new Response(String(used + 1), { headers: { 'Cache-Control': `max-age=${CACHE_SECONDS}` } }));
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') ?? '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.pathname !== '/leetcode') return json({ error: 'Not found' }, 404, origin);
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Origin not allowed' }, 403, origin);

    try {
      await requirePremium(request.headers.get('Authorization'), { projectId: env.FIREBASE_PROJECT_ID });
    } catch (e) {
      if (e instanceof AuthError) return json({ error: e.message }, e.status, origin);
      throw e;
    }

    const username = (url.searchParams.get('username') ?? '').trim();
    if (!USERNAME.test(username)) return json({ error: 'That does not look like a LeetCode username.' }, 400, origin);

    const cache = caches.default;
    const cacheKey = new Request(`https://bcb-leetcode.internal/${username.toLowerCase()}`);
    const cached = await cache.match(cacheKey);
    if (cached) return json(await cached.json(), 200, origin, { 'X-Cache': 'HIT' });

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (await overIpLimit(cache, ip)) {
      return json({ error: 'Too many lookups from your network. Try again in an hour.' }, 429, origin);
    }

    try {
      const profile = await fetchLeetCodeProfile(username);
      ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(profile), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${CACHE_SECONDS}` },
      })));
      return json(profile, 200, origin, { 'X-Cache': 'MISS' });
    } catch (e) {
      const status = e instanceof ProfileError ? e.status : 502;
      return json({ error: e instanceof ProfileError ? e.message : 'Could not reach LeetCode.' }, status, origin);
    }
  },
};
