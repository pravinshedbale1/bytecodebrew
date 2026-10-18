import ladderData from 'virtual:dsa-ladders';
import { getCourseLessons } from '../curriculum';
import { dsa } from '../curriculum/tracks/dsa';
import { QUESTIONS } from './behavioralQuestions';
import { hasProblem } from '../lib/judge/problems';

/**
 * Mock interview formats: timed phases that mirror a real round, a prompt picker and a self-scoring rubric.
 */
const random = (list) => list[Math.floor(Math.random() * list.length)];

function caseStudies(courseId, moduleIds) {
  return getCourseLessons('system-design', courseId)
    .filter((l) => l.available && moduleIds.includes(l.moduleId))
    .map((l) => ({ title: l.title.replace(/^Design(ing)?\s+/i, ''), lesson: l }));
}

export const MOCK_TYPES = {
  dsa: {
    title: 'DSA coding',
    blurb: 'One problem from the practice ladders (medium, hard or either), 45 minutes, thinking out loud.',
    minutes: 45,
    phases: [
      { name: 'Clarify & examples', min: 5, guide: ['Restate the problem in your own words', 'Ask about input size, duplicates, negatives, empty input', 'Agree on one or two examples, including an edge case'] },
      { name: 'Brute force', min: 5, guide: ['Say the simplest correct approach out loud', 'Give its time and space complexity', 'Ask whether to optimise before you start coding'] },
      { name: 'Optimise', min: 10, guide: ['Find the repeated work in the brute force', 'Name the pattern you\'ll use (hash map, two pointers, heap…)', 'Walk the example through the new idea and state the new complexity'] },
      { name: 'Code', min: 20, guide: ['Write clean code with good names; explain as you type', 'Handle the edge cases you agreed on', 'Run the examples (Run button) before saying you\'re done'] },
      { name: 'Test & complexity', min: 5, guide: ['Dry-run one normal and one edge case by hand', 'Submit and fix anything that fails', 'State the final time and space complexity'] },
    ],
    rubric: [
      'Asked clarifying questions and confirmed examples',
      'Stated a brute force and its complexity before optimising',
      'Reached the optimal approach, or explained the gap',
      'Explained the code while writing it',
      'Code worked on the examples first time',
      'Tested edge cases out loud',
      'Stated final time and space complexity',
    ],
    levels: ['Medium', 'Hard', 'Any'],
    pick(isSolved, level = 'Medium') {
      const course = dsa.courses.find((c) => c.id === 'patterns');
      const pool = course.modules.flatMap((m) =>
        m.lessons.flatMap((l) => (ladderData[l.id] ?? []).filter((p) => level === 'Any' ? p.level !== 'Easy' : p.level === level).map((p) => ({ ...p, lesson: l }))),
      );
      // Prefer unsolved problems that have built-in tests, so the round can be judged here.
      const judged = pool.filter((p) => hasProblem(p.slug));
      const base = judged.length ? judged : pool;
      const fresh = base.filter((p) => !isSolved(p.slug));
      const p = random(fresh.length ? fresh : base);
      return {
        title: p.title,
        slug: hasProblem(p.slug) ? p.slug : undefined,
        detail: `${p.level} · LeetCode`,
        href: `https://leetcode.com/problems/${p.slug}/`,
        afterLink: { path: `/dsa/patterns/${p.lesson.id}`, label: `Pattern: ${p.lesson.title}` },
      };
    },
  },
  hld: {
    title: 'System design (HLD)',
    blurb: 'Design a real system end to end: requirements, estimates, API, architecture, deep dives.',
    minutes: 45,
    phases: [
      { name: 'Requirements', min: 5, guide: ['List the core features (3–5) and confirm what\'s out of scope', 'Ask about scale, read/write ratio, latency and consistency needs', 'Write the agreed requirements down'] },
      { name: 'Estimates', min: 5, guide: ['Turn users into requests per second (average and peak)', 'Estimate storage per year and bandwidth', 'Say what the numbers imply for the design'] },
      { name: 'API & data model', min: 8, guide: ['Define the main endpoints with inputs and outputs', 'Pick the database for each kind of data and say why', 'Sketch the key tables or documents and their keys'] },
      { name: 'High-level design', min: 12, guide: ['Draw the request path end to end: client to storage', 'Cover every core requirement with a component', 'Keep it simple first; scale it in the deep dives'] },
      { name: 'Deep dives', min: 12, guide: ['Go deep on the hardest part (hot keys, consistency, fan-out…)', 'Compare two options and pick one with a reason', 'Walk through failures: what breaks, and what then?'] },
      { name: 'Wrap-up', min: 3, guide: ['Summarise the design in a few sentences', 'Name the main trade-offs and bottlenecks', 'Say what you\'d improve with more time'] },
    ],
    rubric: [
      'Clarified functional and non-functional requirements',
      'Did back-of-the-envelope estimates and used them',
      'Defined the API and the data model',
      'Drew a coherent high-level design',
      'Went deep on the hardest one or two parts',
      'Discussed trade-offs and alternatives',
      'Covered failures, bottlenecks and monitoring',
      'Kept to time across the phases',
    ],
    pick() {
      const c = random(caseStudies('hld', ['case-studies-core', 'case-studies-advanced']));
      return { title: `Design ${c.title}`, detail: 'Case study', afterLink: { path: c.lesson.path, label: `Compare with: ${c.lesson.title}` } };
    },
  },
  lld: {
    title: 'Low-level design (LLD)',
    blurb: 'Model a system in classes: entities, responsibilities, patterns and the core code.',
    minutes: 45,
    phases: [
      { name: 'Requirements', min: 5, guide: ['List the core features (3–5) and confirm what\'s out of scope', 'Ask about scale, read/write ratio, latency and consistency needs', 'Write the agreed requirements down'] },
      { name: 'Entities & relationships', min: 8, guide: ['List the nouns: the core entities', 'Decide who owns what and how they relate', 'Spot what will vary (types, strategies, rules)'] },
      { name: 'Class design', min: 15, guide: ['Define classes and interfaces with clear responsibilities', 'Use a pattern only where it removes real pain (strategy, state, observer…)', 'Keep it extensible without over-engineering'] },
      { name: 'Core code', min: 12, guide: ['Write the main flow in code, not just boxes', 'Handle concurrency where two users can collide', 'Validate inputs and handle errors'] },
      { name: 'Extensions', min: 5, guide: ['Show how a new requirement fits your design', 'Point out which classes change and which don\'t', 'Mention testing and what you\'d mock'] },
    ],
    rubric: [
      'Clarified requirements and scope',
      'Identified the core entities and relationships',
      'Gave each class one clear responsibility',
      'Used patterns where they fit, without forcing them',
      'Wrote clean code for the core flow',
      'Handled concurrency and edge cases',
      'Showed how the design extends to new requirements',
    ],
    pick() {
      const c = random(caseStudies('lld', ['lld-case-studies-core', 'lld-case-studies-advanced', 'lld-case-studies-business']));
      return { title: `Design ${c.title}`, detail: 'Case study', afterLink: { path: c.lesson.path, label: `Compare with: ${c.lesson.title}` } };
    },
  },
  behavioral: {
    title: 'Behavioral',
    blurb: 'Four questions from different themes, about two minutes each, plus follow-ups.',
    minutes: 30,
    phases: [
      { name: 'Question 1', min: 7, guide: ['Answer with STAR: situation, task, action, result', 'Spend most of the time on what YOU did', 'End with a number or a clear outcome, and what you learned'] },
      { name: 'Question 2', min: 7, guide: ['Use a different story than for question 1', 'Be specific: names of systems, numbers, dates', 'Keep it to about two minutes, then pause for follow-ups'] },
      { name: 'Question 3', min: 7, guide: ['Pick a story that fits the theme of the question', 'Show judgement: the options you weighed', 'Own mistakes honestly if the question asks for one'] },
      { name: 'Question 4', min: 7, guide: ['Keep the structure tight even when tired', 'Link the result to the business or the team', 'Say what you would do differently now'] },
      { name: 'Your questions', min: 2, guide: ['Ask about the team\'s biggest challenge right now', 'Ask how success is measured in the first six months', 'Avoid questions about salary or leave at this stage'] },
    ],
    rubric: [
      'Opened each answer with a one-line headline',
      'Used a clear STAR structure',
      'Said “I” for my own actions',
      'Quantified the results',
      'Showed what I learned',
      'Kept answers to about two minutes',
      'Picked stories that fit the question',
    ],
    pick() {
      const themes = [...new Set(QUESTIONS.map((q) => q.theme))].sort(() => Math.random() - 0.5).slice(0, 4);
      const qs = themes.map((t) => random(QUESTIONS.filter((q) => q.theme === t)).text);
      return { title: 'Four behavioral questions', detail: 'Answer each out loud', questions: qs, afterLink: { path: '/behavioral/question-bank/behavioral-drill', label: 'Behavioral drill' } };
    },
  },
};

/**
 * Machine-coding briefs (Flipkart, Swiggy, PhonePe, Razorpay style): build a runnable, in-memory system with a
 * driver program, then handle a new requirement at the end. Each links to the LLD case study to compare with.
 */
const MACHINE_BRIEFS = [
  { lesson: 'lld-splitwise', title: 'Expense sharing app', brief: 'Users add expenses split equally, by exact amounts or by percentage. Show each user\'s balances and who owes whom.', extension: 'Add "simplify debts": settle the group with the fewest payments.' },
  { lesson: 'lld-parking-lot', title: 'Parking lot', brief: 'Multiple floors and spot sizes; park and unpark vehicles, issue tickets and charge by duration.', extension: 'Add EV spots with a charging fee and a different pricing rule for them.' },
  { lesson: 'lld-food-delivery', title: 'Food ordering', brief: 'Restaurants with menus and capacity; customers order; assign each order to a restaurant that can serve it.', extension: 'Add a pluggable restaurant-selection strategy: lowest price or highest rating.' },
  { lesson: 'lld-movie-ticket-booking', title: 'Movie ticket booking', brief: 'Cinemas, screens and shows; list available seats, hold seats for a user and confirm the booking.', extension: 'Two users try to book the same seat at once: make sure only one succeeds.' },
  { lesson: 'lld-digital-wallet', title: 'Digital wallet', brief: 'Create wallets, add money, transfer between users and show statements.', extension: 'Make transfers idempotent: retrying a request with the same id must not move money twice.' },
  { lesson: 'lld-cab-booking', title: 'Cab booking', brief: 'Riders request rides; match the nearest available driver; track trip states and fares.', extension: 'Add surge pricing when requests in an area outnumber free drivers.' },
  { lesson: 'lld-rate-limiter', title: 'Rate limiter library', brief: 'Limit requests per user with a configurable algorithm (fixed window, sliding window or token bucket).', extension: 'Support different limits per API endpoint and per user tier.' },
  { lesson: 'lld-kv-store', title: 'Key-value store with transactions', brief: 'GET, SET, DELETE, plus BEGIN, COMMIT and ROLLBACK, with nested transactions.', extension: 'Add expiry (TTL) for keys.' },
  { lesson: 'lld-job-scheduler', title: 'Job scheduler', brief: 'Schedule one-off and recurring jobs, run them on a worker pool and record results.', extension: 'Add retries with back-off and a maximum number of attempts.' },
  { lesson: 'lld-snake-and-ladder', title: 'Snake and ladder', brief: 'A configurable board, snakes, ladders and any number of players taking turns until someone wins.', extension: 'Add a rule: three sixes in a row sends the player back to the start.' },
  { lesson: 'lld-library-management', title: 'Library management', brief: 'Members borrow and return books, with limits per member and due dates.', extension: 'Add reservations: a waiting list for books that are out, with notifications.' },
  { lesson: 'lld-hotel-booking', title: 'Hotel booking', brief: 'Rooms of different types; search availability for a date range; book and cancel.', extension: 'Add a cancellation policy: free until 48 hours before, then a 50% fee.' },
];

/**
 * AI-assisted coding tasks (Meta, Google pilot, Microsoft, Canva, Razorpay style): one problem in stages,
 * done with an AI assistant. Scored on understanding, verification, code quality and communication.
 */
const AI_TASKS = [
  { title: 'In-memory rate limiter', brief: 'Build a rate limiter used by an API gateway.', stages: ['Implement a fixed-window limiter: allow(userId) returns true or false', 'Write tests, including the window boundary and many users', 'Switch to a sliding window without breaking the tests, and explain the trade-off'] },
  { title: 'LRU cache with expiry', brief: 'Build a cache for a slow service.', stages: ['Implement get/put with LRU eviction in O(1)', 'Add a per-key time-to-live', 'Find and fix the bug the AI is likely to introduce in eviction, with a test that proves it'] },
  { title: 'Log analyser', brief: 'You are given server log lines (timestamp, level, service, message).', stages: ['Parse the lines and count errors per service', 'Return the top 3 noisiest services in any time range', 'Make it handle a 2 GB file without loading it all into memory'] },
  { title: 'Leaderboard service', brief: 'A game needs a live leaderboard.', stages: ['Support addScore(player, points) and top(k)', 'Add rank(player) and keep every operation fast', 'Add a test suite and discuss what changes at a million players'] },
  { title: 'Bank account ledger', brief: 'Model accounts and transfers.', stages: ['Implement deposit, withdraw and transfer with balance checks', 'Make transfers safe when called from many threads at once', 'Add idempotency keys so retries never double-charge'] },
  { title: 'Autocomplete', brief: 'Suggest search completions as the user types.', stages: ['Return the top 5 completions for a prefix by popularity', 'Update popularity as searches happen', 'Handle typos in the first character, and test it'] },
  { title: 'Fix the order service', brief: 'Imagine an existing order-pricing function written quickly by someone else (have the AI generate it, with discounts, tax and coupons).', stages: ['Read it and explain what it does, without running it', 'Write tests that expose at least two bugs, then fix them', 'Refactor it so a new coupon type can be added without touching the core'] },
  { title: 'Bug hunt: inventory service (Amazon OA style)', brief: 'Have the AI generate a small inventory service (add stock, reserve, release, report) and then plant three bugs in it without telling you where. Treat it as a repository you have never seen.', stages: ['Find the files that matter and explain the flow; let the AI help you navigate, not fix', 'Write tests that fail because of each bug, then fix the bugs yourself', 'Think about the hidden tests: add tests for boundaries, invalid input and repeated calls'] },
  { title: 'Bug hunt: booking API (Amazon OA style)', brief: 'Have the AI generate a small hotel-booking module with date ranges and cancellations, with two subtle bugs (an off-by-one in date overlap and a state bug in cancellation).', stages: ['Read the code and predict where date logic can go wrong', 'Write failing tests that prove both bugs, then fix them', 'Make cancellation safe to call twice (idempotent) and test it'] },
  { title: 'File deduplication', brief: 'A folder contains millions of files; find the duplicates.', stages: ['Group files by identical content', 'Make it fast: size first, then hashes, then a byte compare', 'Explain how you checked the AI\'s code was correct'] },
];

MOCK_TYPES.machine = {
  title: 'Machine coding',
  blurb: 'Build a runnable, extensible system in 90 minutes, then handle a new requirement. The Flipkart, Swiggy and PhonePe round.',
  minutes: 90,
  phases: [
    { name: 'Requirements', min: 10, guide: ['Read the brief and list the must-have features', 'Ask what is out of scope; agree on in-memory storage', 'Decide the commands your driver program will demo'] },
    { name: 'Design', min: 15, guide: ['Sketch entities, services and repositories', 'Use interfaces where behaviour will vary (pricing, strategies)', 'Keep it small: no framework, no database'] },
    { name: 'Build', min: 45, guide: ['Get one flow working end to end first, then add the rest', 'Validate inputs and handle errors with clear messages', 'Keep classes small; commit to names that read well'] },
    { name: 'New requirement', min: 15, guide: ['Add the extension (shown at the end of the brief)', 'Change as few existing classes as possible', 'Say which part of your design made it easy or hard'] },
    { name: 'Demo & review', min: 5, guide: ['Run the driver program through the main scenarios', 'Point out what you would test and improve next', 'Explain one design trade-off you made'] },
  ],
  rubric: [
    'Clarified requirements and agreed the scope',
    'The code runs, with a driver program that demos the flows',
    'Clear separation of models, services and storage',
    'Used interfaces or patterns where behaviour varies',
    'Handled invalid input and edge cases',
    'Added the new requirement without rewriting the design',
    'Code is readable: names, small methods, no duplication',
  ],
  pick() {
    const lessons = Object.fromEntries(getCourseLessons('system-design', 'lld').map((l) => [l.id, l]));
    const b = random(MACHINE_BRIEFS);
    const l = lessons[b.lesson];
    return {
      title: b.title,
      detail: 'Machine coding · 90 min',
      summary: b.brief,
      // revealed when the "New requirement" phase starts, as in a real round
      extension: b.extension,
      ...(l?.available ? { afterLink: { path: l.path, label: `Compare with: ${l.title}` } } : {}),
    };
  },
};

MOCK_TYPES.ai = {
  title: 'AI-assisted coding',
  blurb: 'One problem in three stages, with an AI assistant at your side. Scored on judgement and verification, not prompting. The Meta, Google-pilot and Canva round.',
  minutes: 60,
  phases: [
    { name: 'Understand', min: 5, guide: ['Restate the task and ask clarifying questions', 'Decide what you will ask the AI for, and what you will write yourself', 'Plan how you will check the result'] },
    { name: 'Build with AI', min: 20, guide: ['Give the AI small, precise requests with the context it needs', 'Read every line it returns before using it', 'Say out loud what you accept, change or reject, and why'] },
    { name: 'Verify', min: 15, guide: ['Write tests, including edge cases the AI did not think of', 'Run them; fix failures yourself or with targeted prompts', 'Check complexity and anything unsafe (concurrency, input handling)'] },
    { name: 'Extend', min: 15, guide: ['Do the last stage of the task', 'Keep the tests passing as you change the code', 'Watch for the AI quietly changing behaviour you rely on'] },
    { name: 'Explain', min: 5, guide: ['Walk through the final design and its trade-offs', 'Say where the AI helped and where it was wrong', 'Name what you would do next with more time'] },
  ],
  rubric: [
    'Understood the problem before asking the AI for code',
    'Broke the work into small, well-specified requests',
    'Read and understood all the code that was kept',
    'Caught at least one mistake in the AI\'s output',
    'Wrote tests that check behaviour and edge cases',
    'Final code is correct, readable and efficient',
    'Explained decisions clearly throughout',
  ],
  pick() {
    const t = random(AI_TASKS);
    return { title: t.title, detail: 'AI-assisted · use your own AI chat or IDE assistant', summary: t.brief, stages: t.stages };
  },
};

export const SIGNALS = [
  { id: 'strong-no', label: 'Strong no' },
  { id: 'lean-no', label: 'Lean no' },
  { id: 'lean-hire', label: 'Lean hire' },
  { id: 'strong-hire', label: 'Strong hire' },
];

/**
 * Phase progress lives on the session: phaseIndex (current phase), phaseStart (the second it began) and
 * phaseLog ([{ name, start, end }] for finished phases). A phase ends when its time runs out, or earlier
 * when the candidate moves on with "Next phase".
 */
export function withPhases(phases, s) {
  if (s.phaseIndex != null) return s;
  // sessions saved before phases could be skipped: derive the position from the clock
  const { index } = phaseAt(phases, s.seconds);
  let start = 0;
  const log = [];
  for (let i = 0; i < index; i++) { log.push({ name: phases[i].name, start, end: start + phases[i].min * 60 }); start += phases[i].min * 60; }
  return { ...s, phaseIndex: index, phaseStart: start, phaseLog: log };
}

export function nextPhase(phases, s) {
  const i = s.phaseIndex ?? 0;
  if (i >= phases.length - 1) return s;
  return { ...s, phaseIndex: i + 1, phaseStart: s.seconds, phaseLog: [...(s.phaseLog ?? []), { name: phases[i].name, start: s.phaseStart ?? 0, end: s.seconds }] };
}

export function previousPhase(s) {
  const log = s.phaseLog ?? [];
  if (!log.length) return s;
  return { ...s, phaseIndex: (s.phaseIndex ?? 1) - 1, phaseStart: log[log.length - 1].start, phaseLog: log.slice(0, -1) };
}

/** One second of the clock; moves on automatically when the current phase's time is up (except the last). */
export function tick(phases, s) {
  const next = { ...s, seconds: s.seconds + 1 };
  const i = next.phaseIndex ?? 0;
  if (i < phases.length - 1 && next.seconds - (next.phaseStart ?? 0) >= phases[i].min * 60) return nextPhase(phases, next);
  return next;
}

/** Every phase with its time used so far, for saving: [{ name, planned, used }] in seconds. */
export function phaseTimes(phases, s) {
  const log = [...(s.phaseLog ?? []), { name: phases[s.phaseIndex ?? 0].name, start: s.phaseStart ?? 0, end: s.seconds }];
  return log.map((p) => ({ name: p.name, planned: (phases.find((x) => x.name === p.name)?.min ?? 0) * 60, used: p.end - p.start }));
}

/** Which phase a moment falls in by the planned schedule: { index, phase, phaseLeft (s), overtime (s) }. */
export function phaseAt(phases, seconds) {
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    acc += phases[i].min * 60;
    if (seconds < acc) return { index: i, phase: phases[i], phaseLeft: acc - seconds, overtime: 0 };
  }
  return { index: phases.length - 1, phase: phases.at(-1), phaseLeft: 0, overtime: seconds - acc };
}
