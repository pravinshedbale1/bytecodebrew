# ByteCodeBrew

An in-depth study centre for software engineering interviews (System Design, DSA, and more).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## How content is organised

```
Track (System Design) → Course (HLD) → Module (Storing Data) → Lesson (Replication)
URL:  /system-design/hld/replication
```

- **Structure and order** live in `src/curriculum/tracks/*.js`. The order of modules and lessons there is the order learners see.
- **Lesson content** lives in `src/content/<trackId>/<courseId>/<lessonId>.mdx`.
- A lesson listed in the curriculum **without** an MDX file is shown as *Planned* automatically. Creating the file publishes it — no other changes needed.

### Adding a lesson

1. Add an entry to the right module in `src/curriculum/tracks/…`:
   ```js
   { id: 'unique-id-generation', title: 'Unique ID Generation', summary: '…', minutes: 12, level: 'Intermediate' }
   ```
2. Create `src/content/system-design/hld/unique-id-generation.mdx`.

### Adding a track or course

Add it to `src/curriculum/tracks/` (see `behavioral.js` for the shape) and register the track in `src/curriculum/index.js`. Navigation, roadmap, progress and breadcrumbs update automatically.

## Writing lessons (MDX)

Standard Markdown (including GFM tables) plus these components, available without imports:

| Component | Use |
| --- | --- |
| `<Callout type="note \| tip \| warning \| interview \| example" title="…">` | Highlighted asides |
| `<QA q="Question?">answer</QA>` | Collapsible interview question |
| `<Practice task="Exercise">approach</Practice>` | Design exercise: the reader writes an attempt, compares it with the approach and rates it; "Partly"/"Missed" join the review deck |
| `<Quiz questions={[{ q, options, answer, why }]} />` | Inline multiple-choice check (the end-of-lesson quick check is automatic, see below) |
| `<Takeaways>- list</Takeaways>` | Summary box at the end |
| ```` ```mermaid ```` fences | Diagrams (flowchart, sequence, state…), themed for light/dark |
| `<HashRing servers={…} keys={…} />` | Consistent-hashing ring diagram |
| `<Related ids={['caching', 'sharding']} />` | "Concepts used" links to other lessons in the same course |
| `<ArrayViz title="…" frames={[…]} />` | Step-through visual for arrays and grids (pointers, window, highlight, done, vars, aux list, note) |
| `<TreeViz title="…" tree={…} frames={[…]} />` | Step-through visual for trees, tries and recursion trees; nodes are `{ id, v, c }`, frames list ids to highlight, mark, dim or hide |
| `<GraphViz title="…" directed nodes={…} edges={…} frames={[…]} />` | Step-through visual for graphs, linked lists and hash-table chains; nodes have grid positions (x, y) and a shape (circle, box, text); frames can replace edges, bend them, and highlight nodes or edges |
| `<ProblemTracker />` | Checklist of every practice-ladder problem in the DSA pattern lessons (parsed at build time) |
| `[text](/system-design/hld/caching)` | Internal links navigate in-app; external links open in a new tab |
| `[Two Sum](https://leetcode.com/problems/two-sum/)` | A LeetCode problem link gets a "solved" checkbox, stored in the browser and shared with the Problem Tracker |

Concept lesson shape: why it matters → core mechanics with diagrams → trade-off tables → real-world examples → common mistakes → "In the interview" callout → interview questions → key takeaways → further reading (primary sources).

Case study shape: `<Related>` → clarify → requirements → capacity estimation → API → data model → high-level design → deep dives → failure modes → trade-offs → what interviewers look for (by level) → interview questions → takeaways → further reading.

LLD case study shape: `<Related>` → requirements table → class diagram → implementation (Java excerpts) → concurrency → patterns used → extensions → interview questions → `<Practice>` exercises → takeaways → further reading.

MDX gotchas: in prose, `<` and `{` start JSX — write "under 50 ms" instead of "< 50 ms", or put it in backticks. `QA q` and `Practice task` attributes can't contain double quotes.

DSA pattern lesson shape: pain point → "How to spot it" tip → idea with a step-through visual → template → worked problems → comparison table → common mistakes → practice ladder (`| # | [Title](leetcode link) | Level | What it trains |`, which the Problem Tracker reads) → interview questions → `<Practice>` → takeaways → further reading.

### DSA code is compiled and tested

Every Java snippet in the DSA track is an excerpt of a runnable file in [`dsa-java/`](dsa-java/README.md), tested against brute force on random inputs. After changing a lesson's code, update the matching file and run `./dsa-java/run-all.sh` (JDK 21+).

### LLD code is compiled and tested

Every LLD case study has a runnable reference solution in [`lld-java/`](lld-java/README.md), and the lesson's Java snippets are excerpts of it. After changing a lesson's code, update the matching file and run `./lld-java/run-all.sh` (JDK 21+; the schema lesson's SQL also runs if PostgreSQL is installed).

## Active recall and practice

- **Quick checks**: every lesson ends with 3 multiple-choice questions from `src/data/quizzes/<track>/<course>.js` (`{ [lessonId]: [{ q, options, answer, why }] }`). Write options in any order; the loader shuffles them per question with a stable seed. Missed questions join the review deck.
- **Review** (`/review`): spaced repetition (`src/lib/srs.js`, 1/3/7/16/35/90-day boxes). The deck is derived, not stored (`src/lib/reviewDeck.js`): every `<QA>` of a completed lesson, missed quiz questions, and practice tasks rated Partly/Missed. Up to 20 new cards a day.
- **Search** (⌘K / Ctrl+K / "/"): lessons, section headings and interview questions. `build/content-plugin.js` extracts headings, `<QA>`, `<Practice>` and `<Takeaways>` from the MDX at build time (`virtual:search-index`, `virtual:lesson-extracts`).
- **Dashboard** (`/dashboard`): streak and heatmap (`useActivity`), today's plan, weak areas, interview countdown with a weekly plan, daily goals, and LeetCode sync.
- **LeetCode sync**: browsers can't call LeetCode (no CORS), so it goes through `workers/leetcode` (a Cloudflare Worker; the Vite dev server serves the same code at `/api/leetcode`). One refresh an hour per learner (`src/lib/leetcode.js`) plus an hour-long cache per username and a per-IP limit in the Worker. See [`workers/leetcode/README.md`](workers/leetcode/README.md) to deploy, then set `LEETCODE_API` in `src/config/services.js`.
- **Full LeetCode import**: LeetCode only lists a user's solved problems to that user, signed in. The dashboard offers a bookmark (or a console script) that runs on leetcode.com in the learner's session, reads `/api/problems/all/` and opens `/dashboard#lc-import=…`; the hash never reaches a server (`src/lib/leetcodeImport.js`).
- **Solved sources**: each solved problem records how it was solved (`tests` passed here, `leetcode`, or `self`-ticked). Verified solves show a filled checkmark, self-ticked ones an outlined one (`src/hooks/useSolved.js`).
- **Problems** (`/problems`): every ladder problem with filters by level, status and pattern; the main entry point for solving with tests.
- **Mock interview** (`/mock`): timed DSA/HLD/LLD/behavioral rounds with phases, a scratchpad and a self-scoring rubric (`src/data/mockInterviews.js`). Optional AI interviewer and feedback use the learner's own Claude API key, kept only in their browser (`src/lib/claude.js`).
- **Solve with tests** (`/solve/<slug>`): all 314 practice-ladder problems have LeetCode-style starter code, example tests ("Run") and full tests ("Submit"); 134 of them add a generated large input that rejects brute force (time limit scaled to the judge machine's speed); passing marks the problem solved. "Solve" links appear next to ladder problems, in the Problem Tracker and in search, and the DSA mock round embeds the solver. Specs and verified reference solutions live in [`problems/`](problems/README.md).
- **Code playground** (`/playground`): free-form Java 17 on Judge0's public instance (`src/lib/judge0.js`). Java blocks in DSA lessons get a "Run" button that opens them wrapped into a `Main` class (`src/lib/javaWrap.js`).
- **Cheat sheets** (`/cheatsheet/<track>/<course>`): every lesson's takeaways on one printable page.
- **Runway** (`/runway`): a day-by-day plan to interview day (`src/lib/runwayPlan.js`, pure and tested by `scripts/runway-check.mjs`). It re-plans itself once a day (`src/hooks/useReplan.js`, after the account's copy has loaded): unfinished work comes forward, finished work and pinned tasks stay put, and the queue is packed again over each day's minutes. The learner controls the hours of any single day, the pace (Light/Steady/Push), pins, swaps and snoozes, and a syllabus of Must / Normal / If time / Skip per pattern or module plus their own DSA pattern order. Re-planning also follows the Daily Coach (strong patterns lose stretch problems, weak ones gain one) and Climb (measured speed, problems matched to the learner's rating). Version 1 plans are migrated on read; edits can be undone in the tab.
- **Climb** (`/climb`): rated problem solving (`src/lib/climb/`, tested by `scripts/climb-check.mjs`). Problems and learners have Elo-style ratings, overall and per pattern; the next problem is picked a little above the learner's rating, timed, and only a first attempt is rated. Only finished attempts are stored and ratings are worked out by replaying them, so devices merge by uniting events. Starting problem ratings come from the ladders; `/admin/analytics` fits them to real results and offers `src/data/climbRatings.json` to download and commit.

## Checks (run in CI on every push)

| Command | What it checks | Needs |
| --- | --- | --- |
| `npm run check` | Every lesson is in the curriculum and has takeaways; internal links and `#section` anchors resolve; `<Related>` ids exist; quizzes are well formed and cover every lesson; problem data matches the ladders; the Daily Coach, Runway planner and Climb ratings behave as specified; Delete my data and analytics cover every store | Node |
| `node scripts/smoke.mjs <url>` | Opens the main pages of a built site (`npx vite preview`) and fails on page or console errors | playwright-core + Chromium (`CHROME_PATH` locally) |
| `./dsa-java/run-all.sh`, `./lld-java/run-all.sh` | Lesson code, tested against brute force; the schema lesson's SQL | JDK 21+, PostgreSQL optional |
| `node problems/build.mjs --check` | Every practice problem's reference still produces the committed answers | JDK 17+ |

`.github/workflows/verify.yml` runs all of these; the deploy workflow also runs `npm run check` before building. What would cost money (a dependable code runner, an AI interviewer key, reminders) is listed in [`docs/FUTURE.md`](docs/FUTURE.md).

## Accounts, sync and highlights (Firebase)

Readers can **highlight text and add notes** in any lesson (select text → pick a colour), and **sign in with Google** to sync everything across devices: lesson progress, solved problems, story bank, drill history and highlights. Signed out, everything still works and is saved in the browser.

How it works:

- `src/lib/syncedStore.js`: every saved store lives in `localStorage` and, when signed in, in Firestore at `users/{uid}/state/{name}` as `{ json, updatedAt }`. The first sync after sign-in **merges** device and account data; later changes from other devices are applied live.
- `src/components/highlights/`: highlights use the CSS Custom Highlight API (`CSS.highlights`), so lesson DOM is never modified. Each highlight is stored as its text plus surrounding context (`src/lib/highlights/anchor.js`) and re-located on load.
- `firestore.rules`: each user can read and write only their own `users/{uid}/state/*` documents, with a size limit and a fixed list of document names (`freeNames()` / `premiumNames()`; add new synced stores there and republish the rules). Premium stores accept writes only from premium accounts. Code submissions live in `users/{uid}/submissions/{slug}` (one document per problem, same shape; writes need premium, like solving). Everything else is denied.
- Firebase is loaded lazily after the first paint. With an empty `apiKey` in `src/config/firebase.js`, accounts are switched off and the sign-in button is hidden.

## Free and premium access

What is free and what is premium is defined once in `src/config/access.js` (`FREE_FEATURES`, `PREMIUM_FEATURES`, and the `PREMIUM_CONTENT` switches) and shown on `/premium` and in every lock notice.

- **Free:** Beginner and Intermediate lessons, diagrams and the DSA visualisations, quizzes, practice exercises, progress, highlights, search, cheat sheets.
- **Premium:** Advanced lessons (free users see the outline), the interactive simulators, diagram step-throughs, problems with tests, mock interviews, review deck, dashboard and LeetCode sync, playground, behavioral drill and story bank.
- **Getting premium:** buy a plan on `/premium` (Razorpay, see [`workers/payments/README.md`](workers/payments/README.md)), or the admin approves an account on `/admin`. Either way an `entitlements/{email}` document turns it on, optionally with an `expiresAt`. `src/hooks/useAccess.js` watches it, so access switches on and off live.
- **Enforcement:** the Firestore rules refuse premium data writes from other accounts and let only the admin edit plans and entitlements; orders are written only by the payments Worker. The LeetCode and payments Workers verify the Firebase ID token. Lesson content itself is a static site, so its locks are in the interface: a determined person could still read the published JavaScript.

Local development against the emulators (no Firebase project needed; requires Java):

```bash
npm run emulators        # Auth on :9099, Firestore on :8080 (project "demo-bytecodebrew")
npm run dev:emulator     # the site, using the emulators
```

In emulator mode, `window.__bcbEmulatorSignIn('you@example.com')` signs in without the popup (for tests).

One-time production setup:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (the free Spark plan is enough).
2. **Authentication → Sign-in method → Google → Enable.** Under **Settings → Authorised domains**, add `bytecodebrew.com` (and `www.bytecodebrew.com`).
3. **Firestore Database → Create database** (production mode, a region near your users).
4. **Project settings → Your apps → Web app (`</>`)** → copy the config into `src/config/firebase.js`.
5. Publish the rules: `npx firebase deploy --only firestore:rules --project <your-project-id>` (or paste `firestore.rules` into the console's Rules tab).

## Code map

```
src/
  curriculum/        structure + helpers (lesson order, prev/next, stats)
  content/           MDX lessons + registry (auto-discovered via import.meta.glob)
  components/
    layout/          AppShell, AppSidebar, TopBar, PageLayout (main + right rail)
    navigation/      Roadmap, CourseOutline, cards
    lesson/          TableOfContents, LessonFooter
    rail/            right-rail widgets (progress, up next, modules)
    mdx/             components available inside lessons
    common/          Badge, ProgressBar, Icon, ComingSoon
  hooks/             useProgress (localStorage), useTheme, useActiveHeading
  styles/            design tokens (light/dark), global, prose typography
```

Progress and theme are stored in the browser's localStorage.
