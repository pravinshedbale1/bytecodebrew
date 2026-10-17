# LeetCode profile proxy

Browsers cannot call `leetcode.com/graphql` directly (it sends no CORS headers), so the dashboard's
LeetCode sync goes through this small Cloudflare Worker. It is free on Cloudflare's free plan.

- `GET /leetcode?username=<name>` returns solved counts, the yearly submission calendar and the
  20 most recent accepted problems (all LeetCode makes public).
- Each username is fetched from LeetCode at most once an hour (edge cache), each IP is limited to
  20 uncached lookups an hour, and only the site's origins may call it from a browser.
- The site itself also allows one refresh per hour per learner (`src/lib/leetcode.js`).
- **Premium only** (`auth.js`): requests need `Authorization: Bearer <Firebase ID token>`. The Worker
  verifies the token's signature against Google's public keys and its claims (`FIREBASE_PROJECT_ID`
  in `wrangler.toml`, expiry, verified email), then allows the admin email or anyone with an
  `entitlements/{email}` document (read from Firestore with the learner's own token). No secrets needed.

## Local development

Nothing to deploy: `npm run dev` serves the same code at `/api/leetcode` (see `vite.config.js`), with the
same premium check. With `npm run dev:emulator` it accepts the Auth emulator's unsigned tokens.

## Deploy

```bash
cd workers/leetcode
npx wrangler@4 login
npx wrangler@4 deploy
```

Wrangler prints the Worker URL, for example `https://bytecodebrew-leetcode.<account>.workers.dev`.
Put it in `src/config/services.js` (`LEETCODE_API`) as `<worker-url>/leetcode`, then build and deploy the site.
