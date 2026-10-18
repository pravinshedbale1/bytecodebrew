/**
 * The AI-assisted debugging round: what it is, who runs it, how to do it well and how to practise.
 * Shown at /companies/ai-assisted-round and linked from Runway plans and company pages.
 * Research and sources: docs/company-plans-research.md (section 1). Last checked 18 October 2026.
 */

/** Where candidates meet it. `confirmed` = the company said so publicly; otherwise candidate reports. */
export const AI_ROUND_COMPANIES = [
  { id: 'amazon', name: 'Amazon', stage: 'Online assessment', confirmed: true,
    format: 'One algorithm problem (about 40 min), then about 60 min fixing bugs in an existing repository. The built-in assistant finds files and explains code but will not write the fix. Hidden tests decide the score; some candidates still get the classic two-problem test.' },
  { id: 'meta', name: 'Meta', stage: 'Onsite (one of two coding rounds)', confirmed: true,
    format: 'About 60 min in CoderPad with an AI chat, on one multi-stage problem in a multi-file codebase: fix a bug, extend it, then optimise. Using the AI is optional.' },
  { id: 'google', name: 'Google', stage: 'Pilot: code comprehension round', confirmed: true,
    format: 'Read, debug and optimise an existing codebase with Gemini. Junior to mid-level roles on selected US teams from the second half of 2026.' },
  { id: 'microsoft', name: 'Microsoft', stage: 'Some loops (AI and Copilot-related orgs)', confirmed: false,
    format: 'An AI-assisted coding round with Copilot, Claude or ChatGPT. Candidates were told not to paste the whole question into the assistant.' },
  { id: 'stripe', name: 'Stripe', stage: 'One coding round', confirmed: false,
    format: 'On HackerRank with an AI assistant since spring 2026. Interviewers ask how much you used it and why.' },
  { id: 'coinbase', name: 'Coinbase', stage: 'Onsite', confirmed: false,
    format: 'Work on an existing service with an AI assistant in the IDE: a bug fix, a design question, a timeout diagnosed from logs and a code review. Screen sharing required.' },
  { id: 'atlassian', name: 'Atlassian', stage: 'Live interview', confirmed: false,
    format: 'AI-enabled work on a code repository (2026 reports).' },
  { id: 'razorpay', name: 'Razorpay', stage: 'After machine coding and HLD', confirmed: false,
    format: 'An "agentic coding" round (a single May 2026 report).' },
];

export const SCORED = [
  ['You understand before you ask', 'You read the task, the tests and the code\'s structure first, and you can explain the bug in your own words.'],
  ['You debug with a method', 'Reproduce, form a hypothesis, isolate it, fix the root cause, not the symptom.'],
  ['You check everything the AI gives you', 'You read every line before keeping it, run the tests, and catch at least one wrong or risky suggestion.'],
  ['You think about the hidden tests', 'Boundaries, empty and invalid input, duplicates, repeated calls, ordering and concurrency, not only the visible tests.'],
  ['You leave the code better', 'Small, readable fixes with a test that proves each bug is gone.'],
  ['You explain your choices', 'You say what you asked the AI, what you accepted or rejected, and why. How much you used it matters less than this.'],
];

export const PLAYBOOK = [
  { step: 'Orient', time: '5–10 min', points: ['Read the task, the README and the test names before any code', 'Run the tests and note exactly what fails', 'Ask the assistant for a map: "Which files handle X, and how do they connect?"'] },
  { step: 'Reproduce', time: '5 min', points: ['Pick one failing test and read its assertion and error', 'Say what the code should do and what it does instead', 'If nothing fails visibly, write the smallest test that shows the bug'] },
  { step: 'Hypothesise and isolate', time: '10–15 min', points: ['Form one theory at a time and say it out loud', 'Ask targeted questions: "Where is the total computed?", "What calls this with null?"', 'Narrow it down with a print, a breakpoint or a tiny test, not by rewriting'] },
  { step: 'Fix the root cause', time: '10 min', points: ['Make the smallest change that fixes the cause', 'If the AI suggests a fix, read it line by line before applying it', 'Watch for fixes that pass the test but break something nearby'] },
  { step: 'Verify like the hidden tests', time: '10 min', points: ['Run the whole suite, not just the test you fixed', 'Add a test for the bug, then for the edges: empty, one item, duplicates, limits, repeated calls', 'Ask the assistant: "What inputs would break this fix?" and check its answers'] },
  { step: 'Explain', time: '5 min', points: ['Summarise each bug, its cause and the fix', 'Say where the AI helped and where it was wrong', 'Name what you would test or refactor next'] },
];

export const DO_DONT = {
  do: [
    'Give context: the file, the error, what you expected and what happened',
    'Ask for explanations and test ideas, not just code',
    'Ask it to critique your fix ("What could this break?")',
    'Keep requests small: one function or one question at a time',
    'Say out loud when you reject a suggestion, and why',
  ],
  dont: [
    'Paste the whole task and accept the answer',
    'Keep code you have not read and cannot explain',
    'Let it rewrite whole files when a one-line fix will do',
    'Chase its first guess without checking the evidence',
    'Go silent while you type prompts: the interviewer is scoring your thinking',
  ],
};

export const MISTAKES = [
  'Starting to prompt before reading the tests and the code',
  'Fixing the symptom (special-casing the failing input) instead of the cause',
  'Trusting visible tests: they pass, the hidden ones fail',
  'Letting the assistant make large changes that introduce new bugs',
  'Running out of time on one bug when there are several to find',
  'Not explaining: a silent, correct session scores worse than a narrated, nearly correct one',
];

/** Ways to practise without the interview platform. */
export const PRACTICE = [
  { title: 'An LLM-made practice repository', text: 'Use the practice-session prompt below. The LLM writes a small multi-file project with planted bugs and plays the interview assistant: it explains code but will not hand you the fix. Time yourself for 60 minutes.' },
  { title: 'A real codebase you have never seen', text: 'Clone a small open-source Java project, pick an open bug or a "good first issue", and fix it with GitHub Copilot, Cursor or Claude Code in your IDE. The unfamiliar code is the point.' },
  { title: 'Plant bugs in your own solutions', text: 'Take a problem you solved here, ask an LLM to introduce two subtle bugs without telling you where, then find them with the tests.' },
  { title: 'Review every session', text: 'Keep short notes (what you asked, what you kept, what you rejected) and use the review prompt to get feedback, like you would after a mock.' },
];

/** Ready-made prompts. {LANGUAGE} and {COMPANY} are filled in on the page. */
export const PROMPTS = [
  {
    id: 'explain',
    title: 'Explain the round and plan my preparation',
    use: 'Start here if the format is new to you.',
    prompt: `You are a senior engineer who runs AI-assisted coding interviews at {COMPANY}-style companies.

Teach me how the "AI-assisted debugging round" works, in this order:
1. The format: what I receive (codebase, tests, AI assistant), typical length, and how it differs from a classic LeetCode round.
2. What interviewers score, with a concrete example of a strong and a weak candidate behaviour for each point.
3. A step-by-step approach for a 60-minute session, with timings.
4. How to use the AI assistant well: 5 good requests and 5 bad ones, with the reason for each.
5. The edge cases hidden tests usually check in debugging tasks.
6. A 7-day practice plan (about 1 hour a day) for someone who codes in {LANGUAGE}.

Be practical and concise. Use headings and short bullet points.`,
  },
  {
    id: 'practice',
    title: 'Practice session: a codebase with planted bugs',
    use: 'The closest thing to the real round. Do it timed, 60 minutes.',
    prompt: `Let's simulate an AI-assisted debugging interview. Follow these rules exactly.

Setup:
- Create a small but realistic {LANGUAGE} project of 3 to 5 files (for example an order service, an inventory system or a booking module), with a test file of 6 to 8 unit tests.
- Plant 3 bugs of different kinds: one logic error, one edge case (empty, boundary or duplicate input), and one state or concurrency bug. Some visible tests should fail; at least one bug must only be caught by a test you do NOT show me (keep it hidden).
- Do not reveal where the bugs are, and do not hint at them in comments or names.
- Show me the full code and the visible tests, then a one-paragraph task: "Make the service correct; all tests, including hidden ones, must pass."

During the session you are the interview's built-in assistant:
- You may explain code, describe what a function does, find where something is defined, and answer questions about {LANGUAGE}.
- You must NOT write the fix, name the buggy line, or say what the bug is, even if I ask directly. If I ask, reply: "I can't give the fix, but I can explain the code involved."
- Keep answers short, like an IDE assistant.

When I type "DONE":
- Check my changes against every test, including the hidden one, by reasoning through each test step by step, and tell me which would pass.
- Reveal all 3 bugs and whether I fixed the root cause or only the symptom.
- Score me 1 to 5 on: understanding before prompting, debugging method, verification, use of the assistant, code quality and communication, with one sentence of evidence for each.
- Give me the 3 most useful things to improve.

Start with the setup now.`,
  },
  {
    id: 'reading',
    title: 'Code-reading drill',
    use: 'Builds the skill of understanding unfamiliar code fast. 15 minutes.',
    prompt: `Give me a code-reading drill to get faster at understanding unfamiliar code.

1. Show me one {LANGUAGE} class of 60 to 100 lines from a realistic backend service (for example caching, retries, pagination or a state machine), without comments and with neutral names.
2. Ask me 5 questions, one at a time, and wait for my answer before the next: what it does, what a specific input returns, which edge case it mishandles, what a given line is for, and how I would test it.
3. After each answer, tell me if I am right and explain briefly.
4. At the end, give me a score out of 5 and one tip to read code faster.`,
  },
  {
    id: 'edges',
    title: 'Hidden-test thinking drill',
    use: 'Trains you to find the edge cases hidden tests check. 10 minutes.',
    prompt: `Train me to think like the hidden tests in a debugging interview.

1. Show me a short {LANGUAGE} method (15 to 30 lines) that passes its 2 visible tests but has subtle edge-case bugs. Show the method and the 2 tests only.
2. Ask me to list the inputs and situations that hidden tests would check (boundaries, empty and null input, duplicates, large values, repeated calls, ordering, concurrency) and which of them break the method.
3. Compare my list with yours: what I caught, what I missed and why it matters.
4. Then show a fixed version and the full test list a strong candidate would write.`,
  },
  {
    id: 'review',
    title: 'Review my session',
    use: 'Use after any practice session. Paste your notes or the chat.',
    prompt: `Review my practice session for an AI-assisted debugging interview like a strict interviewer.

Below are my notes: the task, what I asked the AI assistant, what I accepted or rejected, the bugs I found and how I fixed and tested them.

[PASTE YOUR NOTES OR THE CHAT HERE]

Give me:
1. An overall signal: Strong no / Lean no / Lean hire / Strong hire, with one sentence why.
2. A 1 to 5 score with evidence for: understanding before prompting, debugging method, verification of AI output, testing and edge cases, code quality, communication.
3. The moments where I relied on the AI too much or too little.
4. The 3 changes that would most improve my next session.`,
  },
];

export const REFERENCES = [
  { title: 'Amazon: How 3 AI innovations are creating a better experience for candidates', url: 'https://www.aboutamazon.com/news/workplace/artificial-intelligence-resume-jobs-hiring-amazon', kind: 'Official' },
  { title: 'Canva: Yes, you can use AI in our interviews. In fact, we insist', url: 'https://canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews', kind: 'Official' },
  { title: '404 Media: Meta is going to let job candidates use AI during coding tests', url: 'https://www.404media.co/meta-is-going-to-let-job-candidates-use-ai-during-coding-tests/', kind: 'Press' },
  { title: 'Entrepreneur: Google is testing a new interview rule (Gemini in the code comprehension round)', url: 'https://www.entrepreneur.com/business-news/google-is-testing-a-new-rule-transform-job-interviews', kind: 'Press' },
  { title: 'interviewing.io: How to use AI in Meta\'s AI-assisted coding interview, with real prompts', url: 'https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples', kind: 'Guide' },
  { title: 'PracHub: Amazon AI-assisted coding OA guide (repository bugs and hidden tests)', url: 'https://prachub.com/resources/amazon-ai-assisted-coding-oa-guide-2026-repository-bugs-ai-prompts-and-hidden-tests', kind: 'Guide' },
  { title: 'DEV: Eight companies, eight different AI coding interviews', url: 'https://dev.to/max_nyriev/eight-companies-eight-different-ai-coding-interviews-k60', kind: 'Candidate reports' },
];
