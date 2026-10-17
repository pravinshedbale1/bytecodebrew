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
      { name: 'Clarify & examples', min: 5 },
      { name: 'Brute force', min: 5 },
      { name: 'Optimise', min: 10 },
      { name: 'Code', min: 20 },
      { name: 'Test & complexity', min: 5 },
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
      { name: 'Requirements', min: 5 },
      { name: 'Estimates', min: 5 },
      { name: 'API & data model', min: 8 },
      { name: 'High-level design', min: 12 },
      { name: 'Deep dives', min: 12 },
      { name: 'Wrap-up', min: 3 },
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
      { name: 'Requirements', min: 5 },
      { name: 'Entities & relationships', min: 8 },
      { name: 'Class design', min: 15 },
      { name: 'Core code', min: 12 },
      { name: 'Extensions', min: 5 },
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
      { name: 'Question 1', min: 7 },
      { name: 'Question 2', min: 7 },
      { name: 'Question 3', min: 7 },
      { name: 'Question 4', min: 7 },
      { name: 'Your questions', min: 2 },
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

/** Which phase a moment falls in: { index, phase, phaseLeft (s), overtime (s) }. */
export function phaseAt(phases, seconds) {
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    acc += phases[i].min * 60;
    if (seconds < acc) return { index: i, phase: phases[i], phaseLeft: acc - seconds, overtime: 0 };
  }
  return { index: phases.length - 1, phase: phases.at(-1), phaseLeft: 0, overtime: seconds - acc };
}
