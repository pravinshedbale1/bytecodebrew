/**
 * Company-specific interview plans. The 50 best-paying companies for software engineers in India
 * (research and sources: docs/company-plans-research.md, section 5), each assigned one of six interview
 * styles. A style gives the Runway mix, the mocks to schedule and the DSA patterns to put first; a company
 * adds its rounds, AI policy, notes and behavioral lesson on top.
 *
 * `sourced: true` = the rounds come from 2025–26 candidate reports or company statements; otherwise they
 * are the style's typical loop ("based on similar companies"). Re-check every quarter and bump CHECKED.
 */
export const CHECKED = '2026-10-18';

/** Pattern lesson ids (src/curriculum/tracks/dsa.js → patterns course). */
const CORE = ['hashing', 'two-pointers', 'sliding-window', 'intervals', 'binary-search', 'tree-dfs', 'tree-bfs', 'graph-traversal', 'heap-patterns', 'dp-linear'];

export const STYLES = {
  bigtech: {
    label: 'Big Tech classic',
    summary: 'Two to four DSA rounds (mediums and hards), system design from mid-level, and a behavioral or values round.',
    mix: { dsa: 55, hld: 20, lld: 5, behavioral: 20 },
    mocks: ['dsa', 'hld', 'behavioral'],
    focus: [...CORE, 'topological-sort', 'shortest-paths', 'backtracking', 'dp-strings'],
    practise: ['Two mediums in 45 minutes, talking throughout', 'Clean code without an IDE', 'System design from mid-level', 'Stories for the values round'],
  },
  practical: {
    label: 'Practical code',
    summary: 'Build or extend a small class or service, debug unfamiliar code, call APIs. Less LeetCode, more real code.',
    mix: { dsa: 30, hld: 20, lld: 35, behavioral: 15 },
    mocks: ['machine', 'ai', 'hld', 'behavioral'],
    focus: ['hashing', 'design-data-structures', 'intervals', 'graph-traversal', 'heap-patterns', 'sorting-and-selection'],
    practise: ['Code that keeps working as requirements are added', 'Reading and debugging code you did not write', 'Clean classes and tests', 'Working with an AI assistant and checking its output'],
  },
  systems: {
    label: 'Systems & infrastructure',
    summary: 'DSA plus operating systems and concurrency (threads, locks, semaphores), language internals and distributed storage.',
    mix: { dsa: 45, hld: 25, lld: 15, behavioral: 15 },
    mocks: ['dsa', 'hld', 'lld'],
    focus: [...CORE, 'design-data-structures', 'bit-manipulation', 'tries'],
    practise: ['Concurrency: locks, semaphores, producer–consumer', 'Storage, replication and consistency', 'Memory, threads and processes', 'DSA mediums'],
  },
  machine: {
    label: 'Indian product (machine coding)',
    summary: 'A 90–120 minute machine-coding round (a runnable, extensible system) and its review, then DSA, system design and a hiring-manager round.',
    mix: { dsa: 35, hld: 15, lld: 35, behavioral: 15 },
    mocks: ['machine', 'dsa', 'machine', 'hld'],
    focus: [...CORE, 'design-data-structures', 'tries', 'union-find'],
    practise: ['A runnable, extensible system in 90 minutes', 'Design patterns and SOLID under time pressure', 'Extending your own code live', 'DSA mediums'],
  },
  quant: {
    label: 'Quant & HFT',
    summary: 'A hard online test (DSA, probability and CS questions), then C++, OS and networking depth and low-latency design.',
    mix: { dsa: 70, hld: 10, lld: 10, behavioral: 10 },
    mocks: ['dsa', 'dsa', 'lld'],
    focus: [...CORE, 'dp-knapsack', 'dp-grid', 'dp-strings', 'math-for-interviews', 'bit-manipulation', 'range-queries', 'string-matching'],
    practise: ['Hard DSA under a timer', 'Probability and puzzles', 'C++ and OS internals', 'Low-latency design'],
  },
  bank: {
    label: 'Banks & enterprise fintech',
    summary: 'A HackerRank test, two or three technical rounds (DSA mediums, SQL, OOP, OS, your projects) and HR. AI tools are not allowed.',
    mix: { dsa: 50, hld: 15, lld: 15, behavioral: 20 },
    mocks: ['dsa', 'lld', 'behavioral'],
    focus: CORE,
    practise: ['DSA mediums', 'SQL and database basics', 'OOP and design patterns', 'A clear walk-through of your projects'],
  },
};

const B = (id) => `/behavioral/companies/${id}`;

/**
 * ai: 'expected' | 'allowed' (some rounds) | 'pilot' | 'forbidden' | 'unknown'; the first three add an
 * AI-assisted mock to the plan.
 * focus / mix / mocks: optional overrides of the style's.
 */
export const COMPANIES = [
  // Big Tech
  { id: 'google', name: 'Google', group: 'Big Tech', style: 'bigtech', sourced: true, ai: 'pilot',
    rounds: ['Phone screen: one coding problem', '3–4 coding rounds, at least one often in person', 'Googleyness & Leadership, now with a technical discussion of your past work', 'System design from L5'],
    notes: 'No IDE or autocomplete in classic rounds, and deep follow-ups. A pilot from late 2026 adds a "code comprehension" round: read, debug and optimise existing code with Gemini (junior to mid-level, selected US teams).',
    focus: ['graph-traversal', 'shortest-paths', 'topological-sort', 'dp-linear', 'dp-strings', 'intervals', 'heap-patterns', 'tree-dfs', 'binary-search-on-answer', 'tries'],
    behavioral: B('google') },
  { id: 'meta', name: 'Meta', group: 'Big Tech', style: 'bigtech', sourced: true, ai: 'allowed',
    rounds: ['Screen: two problems in about 45 minutes', 'Two coding rounds; one can be AI-enabled (about 60 minutes with an AI assistant)', 'Product or system design (E5+)', 'Behavioral'],
    notes: 'Speed matters: two mediums per 45 minutes, explained clearly. The AI-enabled round is one multi-stage problem in a multi-file codebase (fix, extend, optimise), scored on problem solving, code quality and verification.',
    mix: { dsa: 60, hld: 15, lld: 5, behavioral: 20 },
    focus: ['hashing', 'two-pointers', 'sliding-window', 'intervals', 'binary-search', 'tree-dfs', 'tree-bfs', 'graph-traversal', 'heap-patterns', 'stack-patterns', 'prefix-sums'],
    behavioral: B('meta') },
  { id: 'amazon', name: 'Amazon', group: 'Big Tech', style: 'bigtech', sourced: true, ai: 'forbidden',
    rounds: ['Online assessment: two coding problems, a work simulation and a work-style survey', '4–5 round loop, one with a Bar Raiser', 'Leadership Principles questions in every round', 'LLD/object-oriented design for SDE-1/2; system design for SDE-2+'],
    notes: 'Prepare two stories for each Leadership Principle. Generative AI is not allowed in live rounds unless the interviewer says so. Some 2026 loops reportedly ask when you did or didn\'t use AI tools at work.',
    mix: { dsa: 40, hld: 10, lld: 20, behavioral: 30 },
    focus: ['hashing', 'tree-dfs', 'tree-bfs', 'graph-traversal', 'heap-patterns', 'design-data-structures', 'intervals', 'sliding-window', 'topological-sort'],
    mocks: ['dsa', 'behavioral', 'lld', 'hld'],
    behavioral: B('amazon') },
  { id: 'microsoft', name: 'Microsoft', group: 'Big Tech', style: 'bigtech', sourced: true, ai: 'allowed',
    rounds: ['Recruiter and online/phone screen', '4–5 rounds: coding, design (LLD or HLD) and behavioral', 'Some 2026 teams add an AI-assisted coding round'],
    notes: 'Loops vary a lot by team. Expect a mix of DSA and design in the same day, and a growth-mindset behavioral thread.',
    mix: { dsa: 55, hld: 15, lld: 15, behavioral: 15 },
    focus: ['two-pointers', 'linked-list-manipulation', 'tree-dfs', 'tree-bfs', 'graph-traversal', 'dp-linear', 'hashing', 'stack-patterns', 'design-data-structures'],
    behavioral: B('microsoft') },
  { id: 'apple', name: 'Apple', group: 'Big Tech', style: 'bigtech', ai: 'unknown',
    rounds: ['Team-run loop: 4–6 interviews', 'Coding plus team-specific design and domain questions'],
    notes: 'Each team runs its own loop, so domain depth for that team matters as much as DSA.', behavioral: B('more-companies') },
  { id: 'linkedin', name: 'LinkedIn', group: 'Big Tech', style: 'bigtech', ai: 'unknown',
    rounds: ['Phone screen: coding', 'Onsite: 2 coding, system design, and a behavioral/"host manager" round'],
    notes: 'Part of Microsoft; one of the highest payers in India at senior and staff level.' },
  { id: 'nvidia', name: 'Nvidia', group: 'Big Tech', style: 'systems', ai: 'unknown',
    rounds: ['Technical screens with the team', 'Coding, C/C++ and systems depth for the team\'s area'],
    notes: 'Expect language and systems depth (memory, concurrency, sometimes GPU or driver work) alongside DSA.' },
  { id: 'adobe', name: 'Adobe', group: 'Big Tech', style: 'bigtech', ai: 'unknown',
    rounds: ['Online test', '3–4 technical rounds: DSA, CS fundamentals, design', 'Hiring manager'],
    notes: 'CS fundamentals and DSA mediums; design for experienced roles.', behavioral: B('global-companies-in-india') },
  { id: 'salesforce', name: 'Salesforce', group: 'Big Tech', style: 'bigtech', ai: 'unknown',
    rounds: ['Online test or screen', 'DSA, system design and a values (Trust) round'],
    notes: 'Strong staff-level pay in India; values matter in the behavioral round.', behavioral: B('global-companies-in-india') },

  // Infrastructure and SaaS
  { id: 'broadcom', name: 'Broadcom (VMware)', group: 'Infra & SaaS', style: 'systems', ai: 'unknown',
    rounds: ['Technical screens', 'DSA plus C/C++, OS, virtualisation or storage depth'],
    notes: 'The top payer in India on Levels.fyi; systems knowledge counts as much as DSA.' },
  { id: 'databricks', name: 'Databricks', group: 'Infra & SaaS', style: 'systems', sourced: true, ai: 'unknown',
    rounds: ['Recruiter screen', '1–2 coding screens', 'Onsite: coding, system design (data lakes, query engines, streaming, storage), behavioral'],
    notes: 'Rounds run 45–90 minutes and weigh design, code structure, debugging and learning a new domain.',
    mix: { dsa: 40, hld: 30, lld: 15, behavioral: 15 } },
  { id: 'rubrik', name: 'Rubrik', group: 'Infra & SaaS', style: 'systems', sourced: true, ai: 'unknown',
    rounds: ['Recruiter screen', 'Coding screen including concurrency (mutex, semaphore)', 'Onsite: DSA, system design, behavioral'],
    notes: 'Concurrency questions appear early; be ready to write thread-safe code.' },
  { id: 'atlassian', name: 'Atlassian', group: 'Infra & SaaS', style: 'practical', sourced: true, ai: 'unknown',
    rounds: ['Karat technical screen (a redo is usually allowed)', 'Coding', 'Code design: a practical build such as a popularity tracker or a router class', 'System design (e.g. Jira notifications, collaborative editing)', 'Values interview', 'Manager'],
    notes: 'The values interview is explicit and scored, so learn Atlassian\'s five values.', behavioral: B('more-companies') },
  { id: 'rippling', name: 'Rippling', group: 'Infra & SaaS', style: 'practical', sourced: true, ai: 'allowed',
    rounds: ['Practical coding: complete a class, then handle one added requirement after another (AI help reported as allowed)', 'LLD screen, e.g. group and aggregate records by any key with filters', 'DSA (graphs, maps), system design, behavioral'],
    notes: 'Write code that extends cleanly; each follow-up builds on your first answer. Reported pass rates are low.' },
  { id: 'oracle', name: 'Oracle (OCI)', group: 'Infra & SaaS', style: 'bigtech', sourced: true, ai: 'unknown',
    rounds: ['Online coding assessment', 'Technical rounds: DSA, a project deep-dive, behavioral', 'Freshers: OS, SQL and networking questions too'],
    notes: 'OCI backend roles lean on DSA and your past projects.' },
  { id: 'nutanix', name: 'Nutanix', group: 'Infra & SaaS', style: 'systems', ai: 'unknown', rounds: [], notes: 'Hyper-converged infrastructure: storage and distributed systems depth.' },
  { id: 'cohesity', name: 'Cohesity', group: 'Infra & SaaS', style: 'systems', ai: 'unknown', rounds: [], notes: 'Data management and backup: storage, file systems and distributed systems.' },
  { id: 'confluent', name: 'Confluent', group: 'Infra & SaaS', style: 'systems', ai: 'unknown', rounds: [], notes: 'Kafka and streaming: logs, partitions, replication and consumer groups.' },
  { id: 'mongodb', name: 'MongoDB', group: 'Infra & SaaS', style: 'systems', ai: 'unknown', rounds: [], notes: 'Databases: storage engines, indexing, replication and sharding.' },
  { id: 'intuit', name: 'Intuit', group: 'Infra & SaaS', style: 'bigtech', ai: 'unknown', rounds: [], notes: 'Some loops include a take-home or "craft demo" you present, then DSA and design.' },
  { id: 'qualcomm', name: 'Qualcomm', group: 'Infra & SaaS', style: 'systems', ai: 'unknown', rounds: [], notes: 'C/C++, OS and embedded systems depth.' },
  { id: 'docusign', name: 'DocuSign', group: 'Infra & SaaS', style: 'bigtech', ai: 'unknown', rounds: [], notes: 'DSA, system design and behavioral.' },
  { id: 'crowdstrike', name: 'CrowdStrike', group: 'Infra & SaaS', style: 'systems', ai: 'unknown', rounds: [], notes: 'Security and systems depth alongside DSA.' },
  { id: 'postman', name: 'Postman', group: 'Infra & SaaS', style: 'practical', ai: 'unknown', rounds: [], notes: 'Product engineering: practical coding and API design.' },

  // Global consumer
  { id: 'uber', name: 'Uber', group: 'Global consumer', style: 'bigtech', sourced: true, ai: 'unknown',
    rounds: ['CodeSignal online assessment: 4 problems in 70–90 minutes', 'DSA', 'LLD', 'System design', 'Collaboration/leadership'],
    notes: 'The recruiter shapes the loop towards backend, frontend or systems. Quote scale numbers from your work.',
    mix: { dsa: 45, hld: 20, lld: 20, behavioral: 15 },
    focus: ['graph-traversal', 'shortest-paths', 'heap-patterns', 'design-data-structures', 'hashing', 'intervals', 'sliding-window', 'binary-search'],
    behavioral: B('more-companies') },
  { id: 'airbnb', name: 'Airbnb', group: 'Global consumer', style: 'bigtech', ai: 'unknown', rounds: [], notes: 'Clean, working code is valued; a core-values round is part of the loop.' },
  { id: 'booking', name: 'Booking.com', group: 'Global consumer', style: 'bigtech', ai: 'unknown', rounds: [], notes: 'Practical coding, system design and behavioral.' },
  { id: 'expedia', name: 'Expedia Group', group: 'Global consumer', style: 'bigtech', ai: 'unknown', rounds: [], notes: 'DSA, system design and behavioral.' },
  { id: 'walmart', name: 'Walmart Global Tech', group: 'Global consumer', style: 'bigtech', sourced: true, ai: 'unknown',
    rounds: ['DSA: two mediums', 'System design', 'Hiring manager: resume deep-dive'],
    notes: 'A US-level bar from the Bengaluru and Chennai centres.' },
  { id: 'roku', name: 'Roku', group: 'Global consumer', style: 'systems', ai: 'unknown', rounds: [], notes: 'Streaming and embedded systems; top entry-level pay on Levels.fyi India.' },

  // Fintech and banks
  { id: 'stripe', name: 'Stripe', group: 'Fintech & banks', style: 'practical', sourced: true, ai: 'unknown',
    rounds: ['Coding phone screen', 'Coding (practical)', 'Bug squash: find and fix failing tests in an unfamiliar codebase', 'Integration: call an HTTP API and parse JSON', 'System design', 'Manager'],
    notes: 'Very little LeetCode; real code, debugging and APIs instead.', behavioral: B('more-companies') },
  { id: 'coinbase', name: 'Coinbase', group: 'Fintech & banks', style: 'practical', ai: 'unknown', rounds: [], notes: 'Practical coding and system design; crypto and payments domain.' },
  { id: 'visa', name: 'Visa', group: 'Fintech & banks', style: 'bank', ai: 'unknown', rounds: [], notes: 'DSA, system design and behavioral; payments domain.' },
  { id: 'jpmorgan', name: 'JPMorgan Chase', group: 'Fintech & banks', style: 'bank', ai: 'forbidden', rounds: [], notes: 'HackerRank test, DSA mediums, SQL, OOP and behavioral.', behavioral: B('global-companies-in-india') },
  { id: 'goldman', name: 'Goldman Sachs', group: 'Fintech & banks', style: 'bank', sourced: true, ai: 'forbidden',
    rounds: ['Aptitude/HackerRank test', '2 technical rounds', 'HR'],
    notes: 'Classic DSA and CS fundamentals; AI tools are not allowed.', behavioral: B('global-companies-in-india') },

  // Quant and HFT
  { id: 'tower', name: 'Tower Research Capital', group: 'Quant & HFT', style: 'quant', sourced: true, ai: 'forbidden',
    rounds: ['HackerRank test, 90–135 minutes: medium-hard coding plus OS, networking and DBMS questions', '1–2 phone screens (the problem may change mid-way)', '4–6 round super day: algorithms, LLD, HLD and language internals'],
    notes: 'Each trading team sets its own priorities; C++ depth helps.' },
  { id: 'graviton', name: 'Graviton Research Capital', group: 'Quant & HFT', style: 'quant', ai: 'forbidden', rounds: [], notes: 'Coding test, then software and quant interviews; heavily campus-based.' },
  { id: 'quadeye', name: 'Quadeye', group: 'Quant & HFT', style: 'quant', sourced: true, ai: 'forbidden', rounds: ['Coding test', 'Shortlist', '3 interviews'], notes: 'Hard DSA and problem solving.' },
  { id: 'deshaw', name: 'D. E. Shaw', group: 'Quant & HFT', style: 'quant', sourced: true, ai: 'forbidden',
    rounds: ['Online test: three DSA mediums plus maths/probability and CS multiple choice', 'Technical rounds: DSA, SQL, DBMS, OS, design, your projects', 'HR'],
    notes: 'Interviews happen in batches, so the timeline can be slow.',
    mix: { dsa: 60, hld: 10, lld: 15, behavioral: 15 } },
  { id: 'millennium', name: 'Millennium', group: 'Quant & HFT', style: 'quant', ai: 'forbidden', rounds: [], notes: 'Hard DSA and C++/Python depth; high entry-level pay.' },

  // Indian product companies
  { id: 'flipkart', name: 'Flipkart', group: 'Indian product', style: 'machine', sourced: true, ai: 'unknown',
    rounds: ['Online assessment: 2 DSA problems (90–120 minutes)', 'Machine coding: about 90 minutes to build a runnable, in-memory system (e.g. Buy Now Pay Later, food ordering), then a review where you extend it', 'LLD/HLD (HLD for SDE-2+)', 'Hiring manager'],
    notes: 'No database: in-memory, extensible, with a driver program you can demo. Spend the first 10–15 minutes on requirements and design.',
    behavioral: B('indian-product-companies') },
  { id: 'phonepe', name: 'PhonePe', group: 'Indian product', style: 'machine', sourced: true, ai: 'unknown',
    rounds: ['Machine coding/LLD first (90 minutes live, or a 24-hour take-home) with a 30–60 minute review', 'DSA', 'HLD', 'Hiring manager'],
    notes: 'Working code with a proper low-level design; be ready to defend design choices.', behavioral: B('indian-product-companies') },
  { id: 'razorpay', name: 'Razorpay', group: 'Indian product', style: 'machine', sourced: true, ai: 'allowed',
    rounds: ['HackerRank test', 'Machine coding (60–90 minutes, working code)', 'HLD', 'Agentic/AI coding round (reported 2026)', 'Behavioral'],
    notes: 'Working code over polish. Payments domain: idempotency, ledgers and retries.',
    mix: { dsa: 25, hld: 25, lld: 35, behavioral: 15 }, behavioral: B('indian-product-companies') },
  { id: 'swiggy', name: 'Swiggy', group: 'Indian product', style: 'machine', sourced: true, ai: 'unknown',
    rounds: ['Machine coding/LLD: 90–120 minutes, runnable code (e.g. parking lot, expense sharing)', 'DSA', 'HLD', 'Hiring manager'],
    notes: 'The machine-coding round is the one that decides most outcomes.', behavioral: B('indian-product-companies') },
  { id: 'zomato', name: 'Zomato (Eternal)', group: 'Indian product', style: 'machine', ai: 'unknown', rounds: [], notes: 'Machine coding/LLD, DSA and HLD.', behavioral: B('indian-product-companies') },
  { id: 'meesho', name: 'Meesho', group: 'Indian product', style: 'machine', sourced: true, ai: 'unknown',
    rounds: ['SDE-2: DSA, then a 120-minute machine coding round (e.g. an inventory service)', 'SDE-3: design-first (HLD/LLD), little or no DSA', 'Hiring manager'],
    notes: 'The format changes a lot with level.' },
  { id: 'cred', name: 'CRED', group: 'Indian product', style: 'machine', ai: 'unknown', rounds: [], notes: 'Machine coding, design and a culture round.' },
  { id: 'groww', name: 'Groww', group: 'Indian product', style: 'machine', ai: 'unknown', rounds: [], notes: 'Machine coding (about 90 minutes), LLD and DSA.' },
  { id: 'zepto', name: 'Zepto', group: 'Indian product', style: 'machine', sourced: true, ai: 'unknown',
    rounds: ['DSA', 'LLD with database schema design (e.g. ticket booking)', 'Hiring manager', 'HR'],
    notes: 'Schema design comes up in the LLD round, so know your tables, keys and indexes.' },
  { id: 'hotstar', name: 'JioHotstar', group: 'Indian product', style: 'machine', ai: 'unknown', rounds: [], notes: 'Streaming at huge scale: system design and DSA.' },
];

export const GROUPS = ['Big Tech', 'Infra & SaaS', 'Global consumer', 'Fintech & banks', 'Quant & HFT', 'Indian product'];

export const AI_LABEL = {
  expected: 'AI tools expected',
  allowed: 'AI allowed in some rounds',
  pilot: 'AI-assisted round in pilot',
  forbidden: 'No AI tools',
  unknown: 'Assume no AI tools',
};

export const getCompany = (id) => COMPANIES.find((c) => c.id === id) ?? null;

/** Companies with AI-assisted rounds get an AI-assisted mock second in the rotation, so even short plans include one. */
function withAiMock(mocks, ai) {
  if (!['expected', 'allowed', 'pilot'].includes(ai) || mocks.includes('ai')) return mocks;
  return [mocks[0], 'ai', ...mocks.slice(1)];
}

/** A company with its style's defaults filled in. */
export function companyPlan(id) {
  const c = getCompany(id);
  if (!c) return null;
  const s = STYLES[c.style];
  return {
    ...c,
    styleLabel: s.label,
    summary: s.summary,
    mix: c.mix ?? s.mix,
    mocks: withAiMock(c.mocks ?? s.mocks, c.ai),
    focus: c.focus ?? s.focus,
    practise: s.practise,
    rounds: c.rounds?.length ? c.rounds : null,
  };
}
