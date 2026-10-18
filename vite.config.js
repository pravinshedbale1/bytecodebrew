import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { dsaLadders } from './build/ladders-plugin.js';
import { lessonContent } from './build/content-plugin.js';
import { fetchLeetCodeProfile, ProfileError, CACHE_SECONDS } from './workers/leetcode/leetcode.js';
import { requirePremium, AuthError } from './workers/shared/auth.js';

const emulator = process.env.VITE_FIREBASE_EMULATOR === '1';
const authOpts = emulator
  ? { projectId: 'demo-bytecodebrew', emulator: true, firestoreBase: 'http://127.0.0.1:8080' }
  : { projectId: 'bytecodebrew-53f0c' };

/** Dev-only stand-in for the LeetCode Worker (workers/leetcode), with the same premium check and one-hour cache. */
function leetcodeDevApi() {
  const cache = new Map();
  return {
    name: 'leetcode-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/leetcode', async (req, res) => {
        const username = new URL(req.url, 'http://x').searchParams.get('username')?.trim() ?? '';
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        try {
          await requirePremium(req.headers.authorization, authOpts);
        } catch (e) {
          if (e instanceof AuthError) return send(e.status, { error: e.message });
          return send(503, { error: 'Could not check your access.' });
        }
        const hit = cache.get(username.toLowerCase());
        if (hit && Date.now() - hit.fetchedAt < CACHE_SECONDS * 1000) return send(200, hit);
        try {
          const profile = await fetchLeetCodeProfile(username);
          cache.set(username.toLowerCase(), profile);
          send(200, profile);
        } catch (e) {
          send(e instanceof ProfileError ? e.status : 502, { error: e instanceof ProfileError ? e.message : 'Could not reach LeetCode.' });
        }
      });
    },
  };
}

/**
 * Dev-only stand-in for the payments Worker (workers/payments) at /api/pay. With the emulators
 * (npm run dev:emulator) it uses a mock Razorpay with a pretend checkout page, so the whole purchase
 * flow can be tried without real money. Real Razorpay test mode: put rzp_test_ keys in
 * workers/payments/.dev.vars and run RAZORPAY_TEST=1 npm run dev:emulator.
 */
function paymentsDevApi() {
  return {
    name: 'payments-dev-api',
    apply: 'serve',
    configureServer(server) {
      let setup;
      const init = async () => {
        const { route } = await import('./workers/payments/payments.js');
        // workers/payments/.dev.vars (git-ignored) can hold Razorpay TEST keys for local testing
        const vars = {};
        try {
          const { readFileSync } = await import('node:fs');
          for (const line of readFileSync('workers/payments/.dev.vars', 'utf8').split('\n')) {
            const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
            if (m) vars[m[1]] = m[2];
          }
        } catch { /* no local keys */ }
        const pick = (k) => process.env[k] ?? vars[k];
        const keys = { RAZORPAY_KEY_ID: pick('RAZORPAY_KEY_ID'), RAZORPAY_KEY_SECRET: pick('RAZORPAY_KEY_SECRET'), RAZORPAY_WEBHOOK_SECRET: pick('RAZORPAY_WEBHOOK_SECRET') ?? 'unused-locally' };
        const local = { FIREBASE_PROJECT_ID: 'demo-bytecodebrew', FIRESTORE_EMULATOR: 'http://127.0.0.1:8080', AUTH_EMULATOR: '1' };
        // Real Razorpay test mode + local Firestore emulator: RAZORPAY_TEST=1 npm run dev:emulator
        if (emulator && process.env.RAZORPAY_TEST === '1' && keys.RAZORPAY_KEY_ID) {
          if (!keys.RAZORPAY_KEY_ID.startsWith('rzp_test_')) throw new Error('Local development only uses Razorpay TEST keys (rzp_test_…).');
          return { route, mock: null, env: { ...keys, ...local } };
        }
        if (!emulator) return { route, mock: null, env: null };
        const { startMockRazorpay } = await import('./workers/payments/mockRazorpay.js');
        const mockKeys = { keyId: 'rzp_test_mock', keySecret: 'mock_secret', webhookSecret: 'mock_whsec' };
        const mock = await startMockRazorpay(mockKeys);
        return {
          route,
          mock,
          env: { RAZORPAY_BASE: mock.base, RAZORPAY_KEY_ID: mockKeys.keyId, RAZORPAY_KEY_SECRET: mockKeys.keySecret, RAZORPAY_WEBHOOK_SECRET: mockKeys.webhookSecret, ...local },
        };
      };
      server.middlewares.use('/api/pay', async (req, res) => {
        setup ??= init();
        const { route, mock, env } = await setup;
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (!env) return send(503, { error: 'Payments in development need the emulators (npm run dev:emulator).' });
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const origin = `http://${req.headers.host}`;
        const request = new Request(`${origin}/pay${req.url}`, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
        const [status, body] = await route(request, { ...env, SITE_URL: origin });
        if (mock && status === 200 && body.razorpayOrderId) {
          body.mockCheckoutUrl = mock.checkoutUrl(body.razorpayOrderId, `${origin}/api/pay/webhook`, `${origin}/premium?order_id=${body.orderId}`);
        }
        send(status, body);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    dsaLadders('src/content/dsa/patterns'),
    lessonContent('src/content'),
    leetcodeDevApi(),
    paymentsDevApi(),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeHighlight, { plainText: ['mermaid', 'text'] }]],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({ include: /\.(mdx|js|jsx)$/ }),
  ],
});
