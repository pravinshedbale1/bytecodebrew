import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { dsaLadders } from './build/ladders-plugin.js';
import { lessonContent } from './build/content-plugin.js';
import { fetchLeetCodeProfile, ProfileError, CACHE_SECONDS } from './workers/leetcode/leetcode.js';
import { requirePremium, AuthError } from './workers/leetcode/auth.js';

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

export default defineConfig({
  plugins: [
    dsaLadders('src/content/dsa/patterns'),
    lessonContent('src/content'),
    leetcodeDevApi(),
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
