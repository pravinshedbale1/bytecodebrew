#!/usr/bin/env node
/** Checks the admin usage analytics (src/lib/analytics.js) on made-up learners. Part of `npm run check`. */
import { aggregate } from '../src/lib/analytics.js';

const now = new Date(2026, 9, 20, 12);
const day = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const users = [
  { uid: 'a', email: 'asha@x.com', name: 'Asha' },
  { uid: 'b', email: 'ravi@x.com', name: 'Ravi' },
  { uid: 'c', email: 'old@x.com', name: 'Old' },
  { uid: 'd', email: 'new@x.com', name: 'Signed up, nothing yet' },
];
const docs = {
  a: {
    activity: { [day(0)]: { lesson: 2, quiz: 5, coach: 3 }, [day(3)]: { problem: 2 }, [day(10)]: { lesson: 1 } },
    progress: { 'dsa/patterns/two-pointers': { completedAt: '2026-10-19' }, 'system-design/hld/caching': { completedAt: '2026-10-10' }, __lastVisited: 'dsa/patterns/two-pointers' },
    quiz: { 'dsa/patterns/two-pointers': { q1: { first: true }, q2: { first: false }, q3: { first: false } } },
    solved: { 'two-sum': { at: '2026-10-17', by: 'tests' }, '3sum': '2026-10-01' },
    coach: { events: [{ k: 'drill', s: 'two-sum', pat: false }, { k: 'drill', s: 'valid-anagram', pat: true }] },
    runway: { plan: { days: 30 } },
  },
  b: {
    activity: { [day(1)]: { lesson: 1, review: 4 }, [day(20)]: { mock: 1 } },
    progress: { 'dsa/patterns/two-pointers': { completedAt: '2026-10-18' } },
    quiz: { 'dsa/patterns/two-pointers': { q1: { first: true }, q2: { first: true } } },
    solved: { 'two-sum': { at: '2026-10-12', by: 'leetcode' } },
    profile: { leetcode: { username: 'ravi' } },
  },
  c: { activity: { [day(60)]: { lesson: 5 } } },
};
const patternOf = (s) => ({ 'two-sum': 'hashing', 'valid-anagram': 'hashing', '3sum': 'two-pointers' })[s];
const r = aggregate({ users, docs, premium: new Set(['asha@x.com']), patternOf, now });

let failures = 0;
const check = (ok, msg) => { if (!ok) { failures += 1; console.log(`✗ ${msg}`); } };
check(r.totals.registered === 4 && r.totals.withData === 3, 'counts registered users and users with data');
check(r.totals.active1 === 1 && r.totals.active7 === 2 && r.totals.active30 === 2, `active today / 7 / 30 days (${r.totals.active1}/${r.totals.active7}/${r.totals.active30})`);
check(r.totals.premium === 1, 'counts premium learners');
check(r.daily.length === 30 && r.daily.at(-1).users === 1, 'daily actives for 30 days, today last');
const f = Object.fromEntries(r.features.map((x) => [x.id, x]));
check(f.lesson.users30 === 2 && f.lesson.actions30 === 4, `lessons: 2 learners, 4 reads in 30 days (${f.lesson.users30}, ${f.lesson.actions30})`);
check(f.mock.users30 === 1 && f.mock.users7 === 0, 'a mock 20 days ago counts for 30 days, not 7');
check(f.coach.users7 === 1, 'Daily Coach used this week by one learner');
check(r.people[0].uid === 'a' && r.people[0].actions30 === 13, `most active learner first (${r.people[0].uid}, ${r.people[0].actions30})`);
check(r.people.find((p) => p.uid === 'c').days30 === 0, 'activity older than 30 days does not count as active');
check(r.lessons[0].key === 'dsa/patterns/two-pointers' && r.lessons[0].users === 2, 'most completed lesson');
check(r.topics[0].topic === 'dsa/patterns' && r.topics[0].learners === 2, 'topics count distinct learners');
check(r.hardest[0]?.key === 'dsa/patterns/two-pointers' && Math.abs(r.hardest[0].accuracy - 0.6) < 1e-9, 'quick-check accuracy per lesson (5 answers, 3 right first try)');
check(r.problems[0].slug === 'two-sum' && r.problems[0].users === 2, 'most solved problem');
check(r.sources.tests === 1 && r.sources.leetcode === 1 && r.sources.self === 1, 'solve sources');
check(r.setups.find((s) => s.label === 'Runway plan created').users === 1 && r.setups.find((s) => s.label === 'LeetCode connected').users === 1, 'feature set-ups');
check(r.weeks.length === 8 && r.weeks.reduce((s, w) => s + w.lesson, 0) === 4, `week matrix holds 8 weeks and the lesson reads inside them`);
const empty = aggregate({ users: [], docs: {}, now });
check(empty.people.length === 0 && empty.features.every((x) => x.users30 === 0), 'no learners: empty, no errors');
console.log(failures ? `\n${failures} problem${failures === 1 ? '' : 's'} in the analytics` : '✓ Admin analytics: totals, features, lessons, problems and the activity matrix check out');
process.exit(failures ? 1 : 0);
