# Future options (things that cost money, or need an account)

Everything on the site today runs on free tiers. This page lists what was deliberately left out
because it would cost money or needs a new account, what it would add, and roughly what it costs.
Prices are rough (October 2026); check the provider before buying.

## Already free, but needs a one-time setup

| What | Why | Steps |
| --- | --- | --- |
| **LeetCode username sync** (hourly stats and recent solves) | Browsers can't call LeetCode directly | Deploy `workers/leetcode` to Cloudflare Workers (free plan: 100,000 requests/day), then set `LEETCODE_API` in `src/config/services.js`. See [`workers/leetcode/README.md`](../workers/leetcode/README.md). The full-history import works without it. |
| **Firestore rules** for the new synced data | Quiz results, reviews, practice, mocks, profile and activity only sync once the rules allow them | `npx firebase deploy --only firestore:rules --project bytecodebrew-53f0c` |

## Paid options, in order of value

### 1. A dependable code runner

- **Today:** the Code Playground and "Solve with tests" use Judge0's free public instance (`ce.judge0.com`). It has no uptime guarantee and shared rate limits; heavy use or an outage stops code from running. The site shows a clear message when the runner is busy.
- **Options:**
  - Self-host Judge0 on a small VM (2 vCPU / 4 GB): about $10–25 a month (Hetzner, DigitalOcean, Linode).
  - Judge0's hosted plans (RapidAPI): free tier with daily limits, paid tiers from roughly $10–30 a month.
- **Switch:** set `VITE_JUDGE0_URL` at build time (`src/config/services.js`). Nothing else changes.

### 2. AI interviewer without the learner's own API key

- **Today:** learners paste their own Claude API key; it stays in their browser, and they pay for their usage.
- **Option:** a small server (for example a Cloudflare Worker, free plan) that holds the site's Anthropic key and enforces per-user limits (a few mocks a day), checking the Firebase sign-in token.
- **Cost estimate per 45-minute mock** (about 30 short turns plus written feedback):
  - Claude Opus 5.5 ($4 / $20 per million input/output tokens): roughly $0.30–0.60
  - Claude Sonnet 5.5 ($2 / $10): roughly $0.15–0.30
  - Claude Haiku 5.5 ($0.10 / $0.50): about 1–2 cents, fine for practice turns
  Prompt caching the system prompt cuts input costs further. With credits, this is the feature to switch on first.

### 3. Reminders (email or push) for due reviews and streaks

- Needs something that runs on a schedule: Firebase Cloud Functions (requires the pay-as-you-go Blaze plan, which has a free monthly allowance, so small sites usually pay nothing) or a Cloudflare Worker cron (free), plus an email provider (Resend or Brevo free tiers cover a few thousand emails a month).

### 4. More Firestore capacity

- The Spark (free) plan allows 50,000 reads and 20,000 writes a day and 1 GiB of storage. Every signed-in learner costs a few reads per page and a write per change (writes are debounced). Upgrade to Blaze only when the usage page in the Firebase console approaches the limits; cost is per operation (cents per 100,000).

## Free improvements not done yet

| Idea | Notes |
| --- | --- |
| **Fully prerendered lessons** | Done in part (`scripts/seo.mjs`): every page has its own file answering 200 with its title, description, structured data and a plain-HTML summary, plus sitemap.xml and robots.txt. Rendering each lesson's full MDX to HTML at build time (server-side rendering) would give crawlers the complete text; a larger change. |
| **Error monitoring** | Sentry's free tier (5,000 errors a month) would report crashes from real learners' browsers. Needs an account and a DSN in the config. |
| **Privacy-friendly analytics** | Cloudflare Web Analytics is free and cookie-less: which lessons are read and where people drop off. |
| **Sync code drafts** | Solutions in the solver are saved per browser only. Syncing them would use more Firestore space (fine within the free tier for most learners). |
| **Self-hosted problem statements** | Problem summaries are written in our own words with a link to LeetCode. Full statements would need original wording for all 314 problems. |
