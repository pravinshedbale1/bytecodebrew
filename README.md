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

Add it to `src/curriculum/tracks/` (see `placeholders.js`) and register the track in `src/curriculum/index.js`. Navigation, roadmap, progress and breadcrumbs update automatically.

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
| `[text](/system-design/hld/caching)` | Internal links navigate in-app; external links open in a new tab |

Concept lesson shape: why it matters → core mechanics with diagrams → trade-off tables → real-world examples → common mistakes → "In the interview" callout → interview questions → key takeaways → further reading (primary sources).

Case study shape: `<Related>` → clarify → requirements → capacity estimation → API → data model → high-level design → deep dives → failure modes → trade-offs → what interviewers look for (by level) → interview questions → takeaways → further reading.

LLD case study shape: `<Related>` → requirements table → class diagram → implementation (Java excerpts) → concurrency → patterns used → extensions → interview questions → `<Practice>` exercises → takeaways → further reading.

MDX gotchas: in prose, `<` and `{` start JSX — write "under 50 ms" instead of "< 50 ms", or put it in backticks. `QA q` and `Practice task` attributes can't contain double quotes.

### LLD code is compiled and tested

Every LLD case study has a runnable reference solution in [`lld-java/`](lld-java/README.md), and the lesson's Java snippets are excerpts of it. After changing a lesson's code, update the matching file and run `./lld-java/run-all.sh` (JDK 21+; the schema lesson's SQL also runs if PostgreSQL is installed).

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
