import { route } from './payments.js';

/**
 * Cloudflare Worker for premium purchases (see payments.js). The browser calls /pay/order and
 * /pay/verify with the user's Firebase ID token; Razorpay calls /pay/webhook.
 */
const ALLOWED_ORIGINS = [
  'https://bytecodebrew.com',
  'https://www.bytecodebrew.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    // Browsers may only call from the site; Razorpay's webhook has no Origin header
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return new Response('{"error":"Origin not allowed"}', { status: 403 });
    const [status, body] = await route(request, env);
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } });
  },
};
