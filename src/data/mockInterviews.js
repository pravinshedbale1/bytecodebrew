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
