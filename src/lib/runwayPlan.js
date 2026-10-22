/**
 * Runway: a day-by-day interview plan, built from the learner's settings and the curriculum.
 *
 * Pure functions only (no React, no stores), so the plan can be tested in Node. The page passes in the
 * catalogue (lessons and ladder problems) and the learner's progress.
 *
 * Settings: {
 *   start, end: 'YYYY-MM-DD' (end = interview day),
 *   hours: { weekday, weekend } (hours a day),
 *   restDays: [0-6] (0 = Sunday),
 *   mix: { dsa, hld, lld, behavioral } (relative weights, 0 = leave out),
 *   level: 'new' | 'some' | 'strong',
 *   company: company id from data/companies.js, or null for a general plan,
 *   pace: 'light' | 'steady' | 'push' (how full each day is packed, see PACES),
 *   capacity: { 'YYYY-MM-DD': minutes } (the learner's own hours for one day; 0 = day off),
 *   syllabus: { [group]: 'must' | 'normal' | 'later' | 'skip' } (see groupOf),
 *   patternOrder: [pattern id] (the learner's own order for DSA patterns),
 * }
 * Plan (version 2): {
 *   settings, createdAt, days: [{ date, phase, base?, tasks: [task] }], extras: [task], done: { [taskId]: true },
 *   pins: { [taskId]: date } (re-planning never moves these), notes: [{ date, text }] (what re-planning changed),
 *   adapted: { [pattern]: date } (when a weak pattern last got an extra problem), reflowedOn: date,
 * }
 * Task: { id, kind, track, title, minutes, path?, href?, ref?, sub?, pri?, grp?, why?, slot?, base?, carried?, parked? }
 *   kind: lesson | problem | mock | review | revise | warmup | guide | custom
 *   pri: 1 core, 2 recommended, 3 stretch · grp: syllabus group · why: one line on why it is planned
 *   slot: a judged problem that may be swapped for a better-fitting one on the day · base: the first time
 *   estimate (minutes follow the learner's measured speed) · carried: the day it was first planned for
 *   parked: in spare time because the learner set it aside (or its pattern is strong); re-planning leaves it there
 *
 * Version 1 plans (no pins, notes or task priorities) are read through migrate() and keep working.
 * Re-planning (reflow) runs once a day and after every change of hours or pace: done work stays where it
 * was done, pinned tasks stay on their day, and everything else is packed again from today.
 */

import { companyPlan } from '../data/companies.js';

export const TRACKS = [
  { id: 'dsa', label: 'DSA', color: 'dsa' },
  { id: 'hld', label: 'System design (HLD)', color: 'hld' },
  { id: 'lld', label: 'Low-level design', color: 'lld' },
  { id: 'behavioral', label: 'Behavioral', color: 'behavioral' },
];

export const PRESETS = [
  { id: 'coding', label: 'Coding-heavy', hint: 'New grad, SDE-1, most service and startup rounds', mix: { dsa: 65, hld: 10, lld: 10, behavioral: 15 } },
  { id: 'balanced', label: 'Balanced', hint: 'SDE-2 at product companies', mix: { dsa: 45, hld: 25, lld: 15, behavioral: 15 } },
  { id: 'design', label: 'Design-heavy', hint: 'Senior, staff and lead roles', mix: { dsa: 30, hld: 35, lld: 15, behavioral: 20 } },
];

export const PACES = [
  { id: 'light', label: 'Light', factor: 0.8, hint: 'About 80% of your hours, with room for a bad day' },
  { id: 'steady', label: 'Steady', factor: 1, hint: 'Your hours, as you set them' },
  { id: 'push', label: 'Push', factor: 1.2, hint: 'About 20% more, while you have the energy' },
];

/** Syllabus priorities for a group of lessons (a DSA pattern with its problems, or a module). */
export const PRIORITIES = [
  { id: 'must', label: 'Must' },
  { id: 'normal', label: 'Normal' },
  { id: 'later', label: 'If time' },
  { id: 'skip', label: 'Skip' },
];

export const LEVELS = [
  { id: 'new', label: 'Starting fresh', hint: 'Plan the foundations too' },
  { id: 'some', label: 'Some prep done', hint: 'Skip what you have completed' },
  { id: 'strong', label: 'Just sharpening', hint: 'Skip beginner lessons and easy problems' },
];

const PROBLEM_MINUTES = { Easy: 20, Medium: 35, Hard: 50 };
const MOCK_MINUTES = { dsa: 45, hld: 45, lld: 45, behavioral: 30, machine: 90 };
const MOCK_LABEL = { dsa: 'DSA coding mock', hld: 'System design mock', lld: 'Low-level design mock', behavioral: 'Behavioral mock', machine: 'Machine coding mock' };
// which track a mock counts towards (and is coloured as)
const MOCK_TRACK = { dsa: 'dsa', hld: 'hld', lld: 'lld', behavioral: 'behavioral', machine: 'lld' };
const mockTask = (type, company) => ({
  kind: 'mock', track: MOCK_TRACK[type], title: company ? `${MOCK_LABEL[type]} (${company.name} style)` : MOCK_LABEL[type],
  minutes: MOCK_MINUTES[type], path: `/mock?type=${type}`,
});
const REVIEW_MINUTES = 15;

// ---- dates (local, YYYY-MM-DD) ----
const parse = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const key = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
export const addDays = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export const weekday = (k) => parse(k).getDay();

export function budgetFor(settings, date) {
  if ((settings.restDays ?? []).includes(weekday(date))) return 0;
  const weekend = [0, 6].includes(weekday(date));
  return Math.round((weekend ? settings.hours.weekend : settings.hours.weekday) * 60);
}

/** The learner's hours for this day (their own override, else the weekly pattern), before the pace. */
export const hoursFor = (settings, date) => settings.capacity?.[date] ?? budgetFor(settings, date);

/** Minutes to plan on a day: the learner's hours times the pace. */
export function capacityFor(settings, date) {
  const factor = PACES.find((p) => p.id === settings.pace)?.factor ?? 1;
  return Math.round(hoursFor(settings, date) * factor);
}

/** The syllabus group of a lesson: a DSA pattern (lesson plus problems) or a module of another course. */
export function groupOf(lesson) {
  const track = lesson.trackId === 'system-design' ? (lesson.courseId === 'lld' ? 'lld' : 'hld') : lesson.trackId;
  if (lesson.trackId === 'dsa' && lesson.courseId === 'patterns') return `p:${lesson.key.split('/')[2]}`;
  return `m:${track}:${lesson.courseId}/${lesson.moduleId}`;
}

/** Everything the learner can prioritise, per track, in curriculum order: [{ id, track, title, course, lessons }]. */
export function syllabusGroups(catalogue) {
  const out = [];
  const byId = new Map();
  for (const l of catalogue.lessons) {
    if (/revision$/.test(l.courseId) || l.courseId === 'companies') continue;
    const id = groupOf(l);
    const track = id.startsWith('p:') ? 'dsa' : id.split(':')[1];
    if (!byId.has(id)) {
      const g = { id, track, title: id.startsWith('p:') ? l.title : l.moduleTitle, course: id.startsWith('p:') ? 'Patterns' : l.courseTitle ?? l.courseId, lessons: 0 };
      byId.set(id, g);
      out.push(g);
    }
    byId.get(id).lessons += 1;
  }
  return out;
}

const PRIORITY_RANK = { must: 0, normal: 1, later: 2 };

/**
 * Ordered study queues per track, from the catalogue.
 * catalogue: { lessons: [{ key, path, title, minutes, level, trackId, courseId, moduleTitle }], ladders: { lessonId: [{ slug, title, level }] }, solvable(slug) }
 * Each item gets a priority: 1 = core, 2 = normal, 3 = stretch. Trimming drops 3s, then 2s.
 */
export function buildQueues(catalogue, settings, progress) {
  const { isComplete = () => false, isSolved = () => false } = progress;
  const strong = settings.level === 'strong';
  const fresh = settings.level === 'new';
  const company = settings.company ? companyPlan(settings.company) : null;
  const focus = company?.focus ?? [];
  const syllabus = settings.syllabus ?? {};
  const own = settings.patternOrder ?? [];
  const queues = { dsa: [], hld: [], lld: [], behavioral: [] };
  // the learner's syllabus choice moves an item's priority: Must makes it core, If time makes it a stretch
  const choose = (grp, priority, why) => {
    const c = syllabus[grp];
    if (c === 'must') return { priority: 1, why: 'You marked it Must' };
    if (c === 'later') return { priority: 3, why: 'If you have time' };
    return { priority, why };
  };
  const whyOf = (priority) => ['Core', 'Recommended', 'Stretch'][priority - 1];
  // DSA pattern lessons and their problems are collected per pattern, so a company's focus patterns can go first
  const patternBlocks = [];
  let patternsAt = null;   // where the patterns course sits in the DSA queue

  for (const l of catalogue.lessons) {
    const track = l.trackId === 'system-design' ? (l.courseId === 'lld' ? 'lld' : 'hld') : l.trackId;
    if (!queues[track]) continue;
    // Company lessons are only planned for the chosen company; revision courses go in the final stretch instead.
    if (/revision$/.test(l.courseId)) continue;
    if (l.courseId === 'companies') {
      if (company?.behavioral === l.path && !isComplete(l.key)) {
        queues.behavioral.unshift({ id: `lesson:${l.key}`, kind: 'lesson', track, ref: l.key, title: l.title, sub: `${company.name} · behavioral`, minutes: Math.max(5, l.minutes ?? 15), path: l.path, priority: 1, grp: 'm:behavioral:companies', why: `How ${company.name} asks behavioral questions` });
      }
      continue;
    }
    const grp = groupOf(l);
    if (syllabus[grp] === 'skip') continue;
    if (strong && l.level === 'Beginner' && !syllabus[grp]) continue;
    const done = isComplete(l.key);
    if (!done) {
      let priority = l.level === 'Advanced' ? 3 : l.level === 'Beginner' && !fresh ? 2 : 1;
      if (/advanced|business/.test(l.moduleId ?? '') || /case-studies-advanced/.test(l.moduleId ?? '')) priority = 3;
      // when sharpening, DSA time goes to problems before re-reading pattern lessons
      if (strong && track === 'dsa') priority = Math.max(priority, 2);
      // sharpening = skim what you already know: half the reading time
      const minutes = Math.max(5, Math.round((l.minutes ?? 15) * (strong ? 0.5 : 1)));
      const c = choose(grp, priority, whyOf(priority));
      queues[track].push({ id: `lesson:${l.key}`, kind: 'lesson', track, ref: l.key, title: l.title, sub: strong ? `Skim · ${l.moduleTitle}` : l.moduleTitle, minutes, path: l.path, ...c, grp });
    }
    // Pattern lessons are followed by their problem ladder.
    const pattern = l.trackId === 'dsa' && l.courseId === 'patterns' ? l.key.split('/')[2] : null;
    const ladder = pattern ? catalogue.ladders[pattern] ?? [] : [];
    if (pattern) {
      // the lesson itself was just pushed onto queues.dsa: move it into this pattern's block
      const block = { pattern, items: queues.dsa.at(-1)?.ref === l.key ? [queues.dsa.pop()] : [] };
      patternsAt ??= queues.dsa.length;
      const inFocus = focus.includes(pattern);
      const lesson = block.items[0];
      if (company && lesson && !syllabus[grp]) {
        lesson.priority = inFocus ? 1 : Math.max(2, lesson.priority);
        lesson.why = inFocus ? `${company.name} focus pattern` : whyOf(lesson.priority);
      }
      patternBlocks.push(block);
    }
    const inFocus = pattern && focus.includes(pattern);
    let n = 0;
    for (const p of ladder) {
      if (strong && p.level === 'Easy') continue;
      n += 1;
      if (isSolved(p.slug)) continue;
      // a company's focus patterns get more problems planned; other patterns fewer
      let priority = !company ? (n <= 2 ? 1 : n <= 4 ? 2 : 3) : inFocus ? (n <= 4 ? 1 : n <= 6 ? 2 : 3) : (n <= 2 ? 2 : 3);
      if (p.level === 'Hard') priority = Math.min(3, priority + 1);
      if (syllabus[grp] === 'must') priority = n <= 4 ? 1 : 2;
      const why = syllabus[grp] ? choose(grp, priority, '').why : inFocus && priority === 1 ? `${company.name} focus pattern` : whyOf(priority);
      const solvable = catalogue.solvable(p.slug);
      patternBlocks.at(-1).items.push({
        id: `problem:${p.slug}`, kind: 'problem', track: 'dsa', ref: p.slug, title: p.title, sub: `${p.level} · ${l.title}`,
        minutes: PROBLEM_MINUTES[p.level] ?? 35,
        ...(solvable ? { path: `/solve/${p.slug}`, slot: true } : { href: `https://leetcode.com/problems/${p.slug}/` }),
        priority: syllabus[grp] === 'later' ? 3 : priority, grp, why,
      });
    }
  }
  // Must patterns first and If-time patterns last; within that the learner's own order, then the company's
  // focus patterns (in the company's order), then the rest in curriculum order
  const choice = (b) => PRIORITY_RANK[syllabus[`p:${b.pattern}`]] ?? 1;
  const mine = (b) => (own.includes(b.pattern) ? own.indexOf(b.pattern) : own.length);
  const rank = (b) => (focus.includes(b.pattern) ? focus.indexOf(b.pattern) : focus.length);
  const ordered = [...patternBlocks].sort((a, b) => choice(a) - choice(b) || mine(a) - mine(b) || rank(a) - rank(b));
  // the blocks go back where the patterns course is, between the foundations and the playbook
  queues.dsa.splice(patternsAt ?? queues.dsa.length, 0, ...ordered.flatMap((b) => b.items));
  // other tracks: Must modules first, If-time modules last, curriculum order otherwise (the sort is stable)
  const itemRank = (t) => PRIORITY_RANK[syllabus[t.grp]] ?? 1;
  for (const t of ['hld', 'lld', 'behavioral']) queues[t].sort((a, b) => itemRank(a) - itemRank(b));
  return queues;
}

const sum = (items) => items.reduce((s, t) => s + t.minutes, 0);

/** Drop stretch items, then normal ones, until the queue fits `budget` minutes. Returns { kept, dropped }. */
function trim(queue, budget) {
  let kept = queue;
  const dropped = [];
  for (const level of [3, 2]) {
    if (sum(kept) <= budget) break;
    // drop this level from the end backwards, only as much as needed
    let over = sum(kept) - budget;
    const next = [...kept];
    for (let i = next.length - 1; i >= 0 && over > 0; i -= 1) {
      if (next[i].priority === level) { over -= next[i].minutes; dropped.unshift(next[i]); next.splice(i, 1); }
    }
    kept = next;
  }
  // still too long: cut the tail
  while (kept.length && sum(kept) > budget) dropped.unshift(kept.pop());
  return { kept, dropped };
}

/** The study days and how their minutes are split between the main stretch and the final stretch. */
export function calendar(settings) {
  const total = Math.max(1, daysBetween(settings.start, settings.end));
  const days = [];
  for (let i = 0; i < total; i += 1) {
    const date = addDays(settings.start, i);
    days.push({ date, budget: capacityFor(settings, date) });
  }
  const study = days.filter((d) => d.budget > 0);
  const finalCount = study.length <= 1 ? 0 : study.length <= 5 ? 1 : Math.min(3, Math.max(1, Math.round(study.length * 0.12)));
  const finalDates = new Set(study.slice(study.length - finalCount).map((d) => d.date));
  for (const d of days) d.phase = d.budget === 0 ? 'rest' : finalDates.has(d.date) ? 'final' : 'learn';
  return days;
}

const activeTracks = (mix) => TRACKS.map((t) => t.id).filter((id) => (mix[id] ?? 0) > 0);

/** Generate a plan. `keep` = { done, customByDate, pinned } from a previous plan when rebuilding. */
export function generatePlan(settings, catalogue, progress, keep = {}) {
  const days = calendar(settings);
  const tracks = activeTracks(settings.mix);
  const weights = Object.fromEntries(tracks.map((t) => [t, settings.mix[t]]));
  const totalW = tracks.reduce((s, t) => s + weights[t], 0) || 1;
  const learnDays = days.filter((d) => d.phase === 'learn');
  const company = settings.company ? companyPlan(settings.company) : null;
  // mocks rotate through the company's round types, or the chosen tracks for a general plan
  const mockTypes = company
    ? company.mocks.filter((m) => tracks.includes(MOCK_TRACK[m]))
    : tracks.filter((t) => t !== 'behavioral' || tracks.length === 1);
  const out = days.map((d) => ({ date: d.date, phase: d.phase, budget: d.budget, tasks: [] }));
  const byDate = Object.fromEntries(out.map((d) => [d.date, d]));
  let seq = 0;
  const fixed = (date, task) => { byDate[date].tasks.push({ ...task, id: `${task.kind}:${date}:${seq += 1}` }); };

  // Custom tasks the learner added survive a rebuild (when their day is still in the plan), and so do
  // tasks pinned to a day.
  for (const [date, list] of Object.entries(keep.customByDate ?? {})) if (byDate[date]) byDate[date].tasks.push(...list);
  const pins = {};
  for (const { date, task } of keep.pinned ?? []) {
    if (!byDate[date] || byDate[date].phase === 'interview') continue;
    byDate[date].tasks.push(task);
    pins[task.id] = date;
  }

  // Daily review from the third study day; a mock every 6th study day from the second week.
  learnDays.forEach((d, i) => {
    if (i >= 2 && learnDays.length >= 5) fixed(d.date, { kind: 'review', track: 'all', title: 'Review cards due today', minutes: REVIEW_MINUTES, path: '/review' });
    if (i >= 6 && (i + 1) % 6 === 0 && mockTypes.length) {
      fixed(d.date, mockTask(mockTypes[(Math.floor(i / 6) - 1) % mockTypes.length], company));
    }
  });
  // A company plan starts by reading how that company interviews.
  if (company && learnDays.length) {
    fixed(learnDays[0].date, { kind: 'guide', track: 'all', title: `How ${company.name} interviews`, sub: company.styleLabel, minutes: 10, path: `/companies/${company.id}` });
  }
  // AI-assisted debugging round: it can't be mocked here, so study the guide early and practise it with an LLM
  // (a planted-bug session from the guide's prompts) mid-plan and again near the end.
  if (company?.aiRound && learnDays.length) {
    const at = (f) => learnDays[Math.min(learnDays.length - 1, Math.floor(learnDays.length * f))].date;
    const guide = '/companies/ai-assisted-round';
    fixed(at(0.15), { kind: 'guide', track: 'dsa', title: 'Learn the AI-assisted debugging round', sub: `${company.name} · playbook and what is scored`, minutes: 30, path: guide });
    fixed(at(0.5), { kind: 'guide', track: 'dsa', title: 'AI debugging practice: planted-bug session with an LLM', sub: 'Prompt 2 in the guide · 60 min, timed', minutes: 60, path: `${guide}#prompts` });
    if (learnDays.length >= 8) fixed(at(0.8), { kind: 'guide', track: 'dsa', title: 'AI debugging practice: a second planted-bug session, then review it', sub: 'Prompts 2 and 5 in the guide', minutes: 60, path: `${guide}#prompts` });
  }

  // Final stretch: a mock a day, review, the revision sheet and story rehearsal.
  const finals = out.filter((d) => d.phase === 'final');
  finals.forEach((d, i) => {
    fixed(d.date, mockTask(mockTypes.length ? mockTypes[i % mockTypes.length] : 'behavioral', company));
    fixed(d.date, { kind: 'review', track: 'all', title: 'Review cards due today', minutes: 20, path: '/review' });
    if (i === 0) fixed(d.date, { kind: 'revise', track: 'all', title: 'Make your last-minute revision sheet from your highlights', minutes: 25, path: '/highlights' });
    if (tracks.includes('behavioral') && i === finals.length - 1) fixed(d.date, { kind: 'revise', track: 'behavioral', title: 'Rehearse your top 5 stories out loud', minutes: 30, path: '/behavioral/foundations/story-bank' });
    if (tracks.includes('behavioral') && i !== finals.length - 1 && finals.length > 1 && mockTypes[i % mockTypes.length] !== 'behavioral') fixed(d.date, mockTask('behavioral', company));
  });

  // Minutes left for new material in the main stretch, split by the mix; spare minutes flow to tracks that need them.
  const free = learnDays.reduce((s, d) => s + Math.max(0, d.budget - sum(byDate[d.date].tasks)), 0);
  const queues = buildQueues(catalogue, settings, progress);
  for (const t of tracks) queues[t] = queues[t].filter((x) => !pins[x.id]);
  const need = Object.fromEntries(tracks.map((t) => [t, sum(queues[t])]));
  const share = Object.fromEntries(tracks.map((t) => [t, (free * weights[t]) / totalW]));
  for (let pass = 0; pass < 3; pass += 1) {
    const spare = tracks.reduce((s, t) => s + Math.max(0, share[t] - need[t]), 0);
    const hungry = tracks.filter((t) => need[t] > share[t]);
    if (spare <= 0 || !hungry.length) break;
    for (const t of tracks) share[t] = Math.min(share[t], need[t]);
    const hw = hungry.reduce((s, t) => s + weights[t], 0);
    for (const t of hungry) share[t] += (spare * weights[t]) / hw;
  }
  const extras = [];
  const kept = {};
  for (const t of tracks) {
    const r = trim(queues[t], share[t]);
    kept[t] = r.kept;
    extras.push(...r.dropped);
  }

  // Interleave the tracks by minutes so every few hours mix DSA, design and behavioral, then pack the days.
  const used = Object.fromEntries(tracks.map((t) => [t, 0]));
  const merged = [];
  const idx = Object.fromEntries(tracks.map((t) => [t, 0]));
  while (tracks.some((t) => idx[t] < kept[t].length)) {
    const t = tracks.filter((x) => idx[x] < kept[x].length).sort((a, b) => used[a] / weights[a] - used[b] / weights[b])[0];
    const item = kept[t][idx[t]];
    idx[t] += 1;
    used[t] += item.minutes;
    merged.push(item);
  }
  let di = 0;
  for (const item of merged) {
    // a day takes an item if it fits, or 10 minutes over, or if the day is still empty
    while (di < learnDays.length) {
      const day = byDate[learnDays[di].date];
      const room = day.budget - sum(day.tasks);
      const empty = !day.tasks.some((x) => x.kind === 'lesson' || x.kind === 'problem');
      if (item.minutes <= room + 10 || (empty && room > 0)) break;
      di += 1;
    }
    if (di >= learnDays.length) { extras.push(item); continue; }
    const { priority, ...task } = item;
    byDate[learnDays[di].date].tasks.push({ ...task, pri: priority });
  }

  // Interview day itself: a light warm-up only.
  out.push({
    date: settings.end, phase: 'interview', budget: 30,
    tasks: [
      { id: `warmup:${settings.end}:1`, kind: 'warmup', track: 'all', title: 'Warm up: one easy problem you have solved before', minutes: 15, path: '/problems' },
      { id: `warmup:${settings.end}:2`, kind: 'revise', track: 'all', title: 'Skim your revision sheet, then stop studying', minutes: 15, path: '/highlights' },
      ...(company ? [{ id: `warmup:${settings.end}:3`, kind: 'guide', track: 'all', title: `Re-read ${company.name}'s rounds so nothing surprises you`, minutes: 5, path: `/companies/${company.id}` }] : []),
    ],
  });

  for (const d of out) sortDay(d.tasks);

  return {
    version: 2,
    settings,
    createdAt: new Date().toISOString(),
    days: out.map(({ budget, ...d }) => (d.phase === 'final' ? { ...d, base: 'final' } : d)),
    // the most useful leftovers first, capped so the synced plan stays small
    extras: extras.sort((a, b) => a.priority - b.priority).slice(0, MAX_EXTRAS).map(({ priority, ...t }) => ({ ...t, pri: priority })),
    done: keep.done ?? {},
    pins,
    notes: [],
    adapted: {},
    reflowedOn: settings.start,
  };
}

const MAX_EXTRAS = 150;
// Mocks and reviews first in each day reads oddly: the company guide first, then lessons, problems and the
// learner's own tasks in plan order (one rank, so re-planning finds them in the same order), then mocks,
// revision and review.
const ORDER = { guide: 0, warmup: 0, lesson: 1, problem: 1, custom: 1, mock: 3, revise: 4, review: 5 };
const sortDay = (tasks) => tasks.sort((a, b) => (ORDER[a.kind] ?? 2) - (ORDER[b.kind] ?? 2));

/** A version 1 plan with the version 2 fields filled in. Days, ticks, custom tasks and spare time are unchanged. */
export function migrate(plan) {
  if (!plan || plan.version >= 2) return plan;
  return {
    ...plan,
    version: 2,
    settings: { pace: 'steady', capacity: {}, syllabus: {}, patternOrder: [], ...plan.settings },
    pins: plan.pins ?? {},
    notes: plan.notes ?? [],
    adapted: plan.adapted ?? {},
    reflowedOn: plan.reflowedOn ?? null,
  };
}

/** Is a task done? Lessons and problems also count when completed anywhere on the site. */
export function isTaskDone(plan, task, progress) {
  if (plan.done?.[task.id]) return true;
  if (task.kind === 'lesson') return progress.isComplete(task.ref);
  if (task.kind === 'problem') return progress.isSolved(task.ref);
  return false;
}

/** Summary numbers for the plan as of `today`. */
export function planStats(plan, progress, today) {
  const all = plan.days.flatMap((d) => d.tasks.map((t) => ({ ...t, date: d.date })));
  const done = all.filter((t) => isTaskDone(plan, t, progress));
  // a missed daily review or warm-up can't be caught up, so it never counts as being behind
  const due = all.filter((t) => t.date < today && t.kind !== 'review' && t.kind !== 'warmup');
  const dueDone = due.filter((t) => isTaskDone(plan, t, progress));
  const overdue = due.filter((t) => !isTaskDone(plan, t, progress));
  const studyDays = plan.days.filter((d) => d.phase !== 'rest' && d.phase !== 'interview');
  const dayIndex = studyDays.filter((d) => d.date <= today).length;
  return {
    total: all.length,
    done: done.length,
    minutesTotal: sum(all),
    minutesDone: sum(done),
    overdue,
    behind: due.length - dueDone.length,
    daysLeft: daysBetween(today, plan.settings.end),
    dayIndex,
    studyDays: studyDays.length,
    lessons: all.filter((t) => t.kind === 'lesson').length,
    problems: all.filter((t) => t.kind === 'problem').length,
    mocks: all.filter((t) => t.kind === 'mock').length,
  };
}

// ---- edits (each returns a new plan) ----

const mapDays = (plan, fn) => ({ ...plan, days: plan.days.map(fn) });
const MOVABLE = new Set(['lesson', 'problem', 'custom']);
const findTask = (plan, taskId) => {
  for (const d of plan.days) {
    const t = d.tasks.find((x) => x.id === taskId);
    if (t) return { task: t, date: d.date };
  }
  return null;
};
const unpin = (pins, id) => {
  if (!pins?.[id]) return pins ?? {};
  const next = { ...pins };
  delete next[id];
  return next;
};

export function toggleDone(plan, taskId, value) {
  const done = { ...plan.done };
  if (value) done[taskId] = true; else delete done[taskId];
  return { ...plan, done };
}

/** Move a task (or a spare-time item) to a day. A task the learner moved is pinned there, so re-planning leaves it. */
export function moveTask(plan, taskId, toDate) {
  let task = null;
  const without = mapDays(plan, (d) => {
    const t = d.tasks.find((x) => x.id === taskId);
    if (t) task = t;
    return t ? { ...d, tasks: d.tasks.filter((x) => x.id !== taskId) } : d;
  });
  const fromExtras = plan.extras.find((x) => x.id === taskId);
  if (!task && fromExtras) {
    const { parked, ...rest } = fromExtras;
    task = rest;
  }
  if (!task) return plan;
  const next = mapDays(without, (d) => (d.date === toDate ? { ...d, tasks: [...d.tasks, task] } : d));
  return { ...next, extras: next.extras.filter((x) => x.id !== taskId), pins: { ...(plan.pins ?? {}), [taskId]: toDate } };
}

/** Pin a task to the day it is on (or unpin it). */
export function pinTask(plan, taskId, on) {
  const found = findTask(plan, taskId);
  if (!found) return plan;
  return { ...plan, pins: on ? { ...(plan.pins ?? {}), [taskId]: found.date } : unpin(plan.pins, taskId) };
}

/** Put a task off to the next day with study time. */
export function snoozeTask(plan, taskId) {
  const found = findTask(plan, taskId);
  if (!found) return plan;
  const next = plan.days.find((d) => d.date > found.date && d.phase !== 'interview' && capacityFor(plan.settings, d.date) > 0);
  return next ? moveTask(plan, taskId, next.date) : plan;
}

/** Take a task off the plan. Lessons and problems go to spare time, so nothing is lost. */
export function removeTask(plan, taskId) {
  let task = null;
  const next = mapDays(plan, (d) => {
    const t = d.tasks.find((x) => x.id === taskId);
    if (t) task = t;
    return t ? { ...d, tasks: d.tasks.filter((x) => x.id !== taskId) } : d;
  });
  const pins = unpin(plan.pins, taskId);
  // parked: re-planning won't bring it back on its own (the learner can still pull it in)
  if (task && (task.kind === 'lesson' || task.kind === 'problem')) return { ...next, pins, extras: [{ ...task, parked: true }, ...next.extras] };
  return { ...next, pins };
}

/**
 * Swap a problem for another one. `choose(task, planned)` returns the replacement task (or null); `planned`
 * is every problem already on the plan, so it is never picked twice. The old problem goes to spare time.
 */
export function swapTask(plan, taskId, choose) {
  const found = findTask(plan, taskId);
  if (!found || found.task.kind !== 'problem') return plan;
  const planned = new Set(plan.days.flatMap((d) => d.tasks.filter((t) => t.kind === 'problem').map((t) => t.ref)));
  const pick = choose(found.task, planned);
  if (!pick) return plan;
  const { pri, grp, why, slot, carried } = found.task;
  const task = { pri, grp, slot, carried, ...pick, why: pick.why ?? why };
  const pins = plan.pins?.[taskId] ? { ...unpin(plan.pins, taskId), [task.id]: found.date } : plan.pins ?? {};
  return {
    ...mapDays(plan, (d) => (d.date === found.date ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? task : t)) } : d)),
    pins,
    extras: [found.task, ...plan.extras.filter((x) => x.id !== task.id)].slice(0, MAX_EXTRAS),
  };
}

export function addCustomTask(plan, date, title, minutes) {
  const task = { id: `custom:${date}:${Date.now().toString(36)}`, kind: 'custom', track: 'all', title: title.trim().slice(0, 140), minutes: Math.max(5, Math.min(600, Math.round(minutes) || 30)) };
  return mapDays(plan, (d) => (d.date === date ? { ...d, tasks: [...d.tasks, task] } : d));
}

export function reorderTask(plan, date, taskId, delta) {
  return mapDays(plan, (d) => {
    if (d.date !== date) return d;
    const i = d.tasks.findIndex((t) => t.id === taskId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= d.tasks.length) return d;
    const tasks = [...d.tasks];
    [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
    return { ...d, tasks };
  });
}

/** Set the learner's own hours for some days (minutes; 0 = day off, null = back to the weekly pattern). */
export function setCapacity(plan, dates, minutes) {
  const capacity = { ...(plan.settings.capacity ?? {}) };
  for (const d of dates) {
    if (minutes == null || minutes === budgetFor(plan.settings, d)) delete capacity[d];
    else capacity[d] = Math.max(0, Math.min(14 * 60, Math.round(minutes)));
  }
  return { ...plan, settings: { ...plan.settings, capacity } };
}

export const setPace = (plan, pace) => ({ ...plan, settings: { ...plan.settings, pace } });

/** More (or less) time every study day: weekday and weekend hours go up by `minutes`, in quarter hours. */
export function addDailyMinutes(plan, minutes) {
  const step = Math.ceil((minutes / 60) * 4) / 4;
  const h = plan.settings.hours;
  const up = (v) => (v > 0 ? Math.min(14, v + step) : v);
  return { ...plan, settings: { ...plan.settings, hours: { weekday: up(h.weekday), weekend: up(h.weekend) } } };
}

const patternOfTask = (t, ctx) => (t.grp?.startsWith('p:') ? t.grp.slice(2) : t.kind === 'problem' ? ctx.patternOf?.(t.ref) ?? null : null);

/**
 * Re-plan from `today`. Work done stays on the day it was done and the daily reviews stay as history;
 * everything unfinished from earlier days comes forward. Pinned tasks stay on their day. Lessons,
 * problems and the learner's own tasks are packed again over today and the coming study days, up to
 * each day's minutes; mocks and other fixed tasks on a day off move to the next study day. What no
 * longer fits goes to spare time (the learner's own tasks never do: they land on the last study day).
 *
 * ctx (all optional), so the plan follows the learner:
 *   speed            measured minutes per estimated minute on problems (Climb); problem estimates follow it
 *   labelOf(p)       the Daily Coach label of a DSA pattern: 'Strong' patterns lose their stretch problems,
 *   attempted(p)     and a 'Weak' pattern the learner has attempted gets one more problem (at most weekly)
 *   patternOf(slug)  pattern of a judged problem (for version 1 tasks, which have no group)
 *   titleOf(p)       a pattern's title, for the notes
 *   pick(task, planned)  a better-fitting problem for today's not-yet-started problem slots, or null
 */
export function reflow(input, progress, today, ctx = {}) {
  const plan = migrate(input);
  const s = plan.settings;
  if (today > s.end) return { ...plan, reflowedOn: today };
  const done = (t) => isTaskDone(plan, t, progress);
  let pins = { ...(plan.pins ?? {}) };
  const notes = [];
  const late = [];

  // 1. the past
  const days = plan.days.map((d) => {
    if (d.date >= today || d.phase === 'interview') return d;
    const keep = d.tasks.filter((t) => done(t) || t.kind === 'review' || t.kind === 'warmup');
    if (keep.length === d.tasks.length) return d;
    for (const t of d.tasks) {
      if (keep.includes(t)) continue;
      pins = unpin(pins, t.id);
      late.push({ ...t, carried: t.carried ?? d.date });
    }
    return { ...d, tasks: keep };
  });
  if (late.length) notes.push(`${late.length} unfinished task${late.length === 1 ? '' : 's'} from earlier days moved into the coming days`);

  // 2. today and later: what stays put, and the queue of everything that can move
  const future = days.filter((d) => d.date >= today && d.phase !== 'interview');
  const dates = new Set(future.map((d) => d.date));
  const capOf = Object.fromEntries(future.map((d) => [d.date, capacityFor(s, d.date)]));
  const queue = [...late];
  const stay = Object.fromEntries(future.map((d) => [d.date, []]));
  const pinned = [];
  let carry = [];
  for (const d of future) {
    if (capOf[d.date] > 0) { stay[d.date].push(...carry); carry = []; }
    for (const t of d.tasks) {
      if (done(t)) stay[d.date].push(t);
      else if (pins[t.id] && dates.has(pins[t.id])) pinned.push(t);
      else if (MOVABLE.has(t.kind)) { pins = unpin(pins, t.id); queue.push(t); }
      else if (capOf[d.date] === 0) carry.push(t);
      else stay[d.date].push(t);
    }
  }
  for (const t of pinned) stay[pins[t.id]].push(t);
  queue.push(...carry);

  // 3. follow the learner
  let extras = [...plan.extras];
  if (ctx.speed && ctx.speed !== 1) {
    for (let i = 0; i < queue.length; i += 1) {
      const t = queue[i];
      if (t.kind !== 'problem') continue;
      const base = t.base ?? t.minutes;
      queue[i] = { ...t, base, minutes: Math.max(10, Math.round((base * ctx.speed) / 5) * 5) };
    }
  }
  const adapted = { ...(plan.adapted ?? {}) };
  if (ctx.labelOf) {
    const name = (p) => ctx.titleOf?.(p) ?? p;
    // strong patterns: their recommended and stretch problems make room for weaker ones
    const strong = new Map();
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      const t = queue[i];
      const p = patternOfTask(t, ctx);
      if (t.kind !== 'problem' || !p || t.carried || (t.pri ?? 2) < 2 || ctx.labelOf(p) !== 'Strong') continue;
      queue.splice(i, 1);
      extras.unshift({ ...t, why: `${name(p)} is strong`, parked: true });
      strong.set(p, (strong.get(p) ?? 0) + 1);
    }
    for (const [p, n] of strong) notes.push(`${name(p)} looks strong: ${n} problem${n === 1 ? '' : 's'} moved to spare time`);
    // weak patterns the learner has tried: one more problem, placed after that pattern's planned work
    const weekAgo = addDays(today, -7);
    const weak = [...new Set(queue.map((t) => patternOfTask(t, ctx)).filter(Boolean))]
      .filter((p) => ctx.labelOf(p) === 'Weak' && ctx.attempted?.(p) && !(adapted[p] > weekAgo))
      .slice(0, 2);
    for (const p of weak) {
      const j = extras.findIndex((t) => t.kind === 'problem' && patternOfTask(t, ctx) === p && !progress.isSolved(t.ref));
      if (j < 0) continue;
      const [{ parked, ...t }] = extras.splice(j, 1);
      let at = -1;
      queue.forEach((x, k) => { if (patternOfTask(x, ctx) === p) at = k; });
      queue.splice(at + 1, 0, { ...t, why: `Extra practice: ${name(p)} needs work` });
      adapted[p] = today;
      notes.push(`${name(p)} needs work: added ${t.title}`);
    }
  }

  // 4. pack the queue over the study days, in order (the final stretch is kept for mocks and revision)
  const sumOf = (list) => list.reduce((n, t) => n + t.minutes, 0);
  const phaseOf = (d) => {
    const base = d.base ?? (d.phase === 'final' ? 'final' : 'learn');
    return capOf[d.date] === 0 ? 'rest' : base;
  };
  const learnDays = future.filter((d) => phaseOf(d) === 'learn');
  const fits = (tasks, d, t) => sumOf(tasks) + t.minutes <= capOf[d.date] + 10;
  const filled = {};
  let qi = 0;
  for (const d of future) {
    const tasks = [...stay[d.date]];
    if (phaseOf(d) === 'learn') {
      while (qi < queue.length && (fits(tasks, d, queue[qi]) || !tasks.some((t) => MOVABLE.has(t.kind)))) tasks.push(queue[qi++]);
    }
    filled[d.date] = tasks;
  }
  const overflow = queue.slice(qi);
  const keepOn = overflow.filter((t) => t.kind !== 'lesson' && t.kind !== 'problem');
  if (keepOn.length) {
    const last = [...future].reverse().find((d) => capOf[d.date] > 0) ?? future.at(-1);
    if (last) filled[last.date].push(...keepOn);
  }

  // 5. fill the gaps packing left (a day with 25 minutes free when the next item takes 35): first with what
  // didn't fit, then with spare-time work, but only work more important than anything still left out;
  // what the learner set aside stays parked
  const wasSpare = new Set(plan.extras.map((t) => t.id));
  const placed = new Set();
  const place = (list) => {
    for (const t of list) {
      const d = learnDays.find((x) => fits(filled[x.date], x, t));
      if (!d) continue;
      filled[d.date].push(t);
      placed.add(t.id);
    }
  };
  const left = overflow.filter((t) => t.kind === 'lesson' || t.kind === 'problem');
  place(left);
  const bar = Math.min(...left.filter((t) => !placed.has(t.id)).map((t) => t.pri ?? 2));
  place(extras.filter((t) => !t.parked && (t.pri ?? 2) < bar && !isTaskDone(plan, t, progress)));
  const cameBack = [...placed].filter((id) => wasSpare.has(id)).length;
  if (cameBack) notes.push(`${cameBack} task${cameBack === 1 ? '' : 's'} from spare time fit${cameBack === 1 ? 's' : ''} in now`);
  const toSpare = overflow.filter((t) => (t.kind === 'lesson' || t.kind === 'problem') && !placed.has(t.id));
  const newlySpare = toSpare.filter((t) => !wasSpare.has(t.id));
  if (newlySpare.length) notes.push(`${newlySpare.length} task${newlySpare.length === 1 ? '' : 's'} no longer fit${newlySpare.length === 1 ? 's' : ''} before the interview and went to spare time`);
  const seen = new Set();
  extras = [...toSpare, ...extras].filter((t) => !placed.has(t.id) && !seen.has(t.id) && seen.add(t.id));
  extras = extras.map((t, i) => [t, i]).sort((a, b) => (a[0].pri ?? 2) - (b[0].pri ?? 2) || a[1] - b[1]).map(([t]) => t).slice(0, MAX_EXTRAS);

  // 6. today's problem slots: a better-fitting problem of the same pattern, when there is one
  if (ctx.pick && filled[today]) {
    const planned = new Set([...Object.values(filled).flat(), ...days.filter((d) => d.date < today).flatMap((d) => d.tasks)].filter((t) => t.kind === 'problem').map((t) => t.ref));
    const swapped = [];
    filled[today] = filled[today].map((t) => {
      if (t.kind !== 'problem' || !t.slot || pins[t.id] || done(t)) return t;
      const pick = ctx.pick(t, planned);
      if (!pick || pick.ref === t.ref) return t;
      planned.add(pick.ref);
      swapped.push(t);
      const { base, ...rest } = t;
      return { ...rest, ...pick };
    });
    if (swapped.length) {
      const ids = new Set(filled[today].map((t) => t.id));
      extras = [...swapped, ...extras.filter((t) => !ids.has(t.id))].slice(0, MAX_EXTRAS);
      notes.push(`Today's problem${swapped.length === 1 ? ' was' : 's were'} matched to your Climb rating`);
    }
  }

  const out = days.map((d) => {
    if (!filled[d.date]) return d;
    const phase = phaseOf(d);
    const base = d.base ?? (d.phase === 'final' ? 'final' : undefined);
    return { ...d, phase, ...(base ? { base } : {}), tasks: sortDay(filled[d.date]) };
  });
  return {
    ...plan,
    days: out,
    extras,
    pins,
    adapted,
    reflowedOn: today,
    notes: [...(plan.notes ?? []), ...notes.map((text) => ({ date: today, text }))].slice(-12),
  };
}

/** Catch up now (kept for older callers): the same as the daily re-plan. */
export const respread = (plan, progress, today, ctx) => reflow(plan, progress, today, ctx);

/**
 * Will the plan cover the important material by interview day? Core work that went to spare time is the
 * gap; each suggestion closes it one way: more minutes a day, a faster pace, or a later date (a rebuild).
 */
export function forecast(input, progress, today) {
  const plan = migrate(input);
  const s = plan.settings;
  const all = plan.days.flatMap((d) => d.tasks);
  const known = all.some((t) => t.pri) || plan.extras.some((t) => t.pri);
  const core = (t) => (t.kind === 'lesson' || t.kind === 'problem') && t.pri === 1;
  const plannedCore = all.filter(core).length;
  const spareCore = plan.extras.filter(core);
  const coreMinutes = sum(spareCore);
  const learnLeft = plan.days.filter((d) => d.date >= today && d.phase === 'learn');
  const suggestions = [];
  if (known && coreMinutes > 0 && learnLeft.length) {
    const perDay = Math.max(10, Math.ceil(coreMinutes / learnLeft.length / 5) * 5);
    if (perDay <= 180) suggestions.push({ id: 'minutes', minutes: perDay });
    if (s.pace !== 'push') {
      const gain = learnLeft.reduce((n, d) => n + Math.round(hoursFor(s, d.date) * 1.2) - capacityFor(s, d.date), 0);
      if (gain >= coreMinutes * 0.8) suggestions.push({ id: 'pace', pace: 'push' });
    }
    const avg = learnLeft.reduce((n, d) => n + capacityFor(s, d.date), 0) / learnLeft.length;
    const days = avg > 0 ? Math.ceil(coreMinutes / avg) : 0;
    if (days > 0 && days <= 60) suggestions.push({ id: 'date', days });
  }
  return {
    known,
    coverage: known ? (plannedCore + spareCore.length ? plannedCore / (plannedCore + spareCore.length) : 1) : null,
    coreLeft: spareCore.length,
    coreMinutes,
    spare: plan.extras.length,
    suggestions,
  };
}

/** What a rebuild would change from `today` on: tasks added to the days, taken off them, and moved. */
export function diffPlans(before, after, today) {
  const index = (plan) => {
    const m = new Map();
    for (const d of plan?.days ?? []) if (d.date >= today) for (const t of d.tasks) m.set(t.id, { date: d.date, task: t });
    return m;
  };
  const a = index(before);
  const b = index(after);
  const added = [...b.values()].filter((x) => !a.has(x.task.id)).map((x) => x.task);
  const removed = [...a.values()].filter((x) => !b.has(x.task.id)).map((x) => x.task);
  const moved = [...b.values()].filter((x) => a.has(x.task.id) && a.get(x.task.id).date !== x.date).map((x) => x.task);
  return { added, removed, moved, changed: added.length + removed.length + moved.length > 0 };
}

/** What to keep when the plan is rebuilt with new settings: ticks, the learner's own tasks and pinned tasks. */
export function keepOnRebuild(plan) {
  if (!plan) return {};
  const customByDate = {};
  const pinned = [];
  for (const d of plan.days) {
    const c = d.tasks.filter((t) => t.kind === 'custom');
    if (c.length) customByDate[d.date] = c;
    for (const t of d.tasks) if (plan.pins?.[t.id] === d.date && t.kind !== 'custom') pinned.push({ date: d.date, task: t });
  }
  return { done: plan.done ?? {}, customByDate, pinned };
}
