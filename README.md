# Bytecode Brew

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
| `<Practice task="Exercise">approach</Practice>` | Design exercise; the suggested approach stays hidden until opened |
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

## Accounts, sync and highlights (Firebase)

Readers can **highlight text and add notes** in any lesson (select text → pick a colour), and **sign in with Google** to sync everything across devices: lesson progress, solved problems, story bank, drill history and highlights. Signed out, everything still works and is saved in the browser.

How it works:

- `src/lib/syncedStore.js`: every saved store lives in `localStorage` and, when signed in, in Firestore at `users/{uid}/state/{name}` as `{ json, updatedAt }`. The first sync after sign-in **merges** device and account data; later changes from other devices are applied live.
- `src/components/highlights/`: highlights use the CSS Custom Highlight API (`CSS.highlights`), so lesson DOM is never modified. Each highlight is stored as its text plus surrounding context (`src/lib/highlights/anchor.js`) and re-located on load.
- `firestore.rules`: each user can read and write only their own `users/{uid}/state/*` documents, with a size limit and a fixed list of document names. Everything else is denied.
- Firebase is loaded lazily after the first paint. With an empty `apiKey` in `src/config/firebase.js`, accounts are switched off and the sign-in button is hidden.

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
