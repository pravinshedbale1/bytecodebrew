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
 * }
 * Plan: { settings, createdAt, days: [{ date, phase, tasks: [task] }], extras: [task], done: { [taskId]: true } }
 * Task: { id, kind, track, title, minutes, path?, href?, ref?, sub? }
 *   kind: lesson | problem | mock | review | revise | warmup | guide | custom
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

export const LEVELS = [
  { id: 'new', label: 'Starting fresh', hint: 'Plan the foundations too' },
  { id: 'some', label: 'Some prep done', hint: 'Skip what you have completed' },
  { id: 'strong', label: 'Just sharpening', hint: 'Skip beginner lessons and easy problems' },
];

const PROBLEM_MINUTES = { Easy: 20, Medium: 35, Hard: 50 };
const MOCK_MINUTES = { dsa: 45, hld: 45, lld: 45, behavioral: 30, machine: 90, ai: 60 };
const MOCK_LABEL = { dsa: 'DSA coding mock', hld: 'System design mock', lld: 'Low-level design mock', behavioral: 'Behavioral mock', machine: 'Machine coding mock', ai: 'AI-assisted coding mock' };
// which track a mock counts towards (and is coloured as)
const MOCK_TRACK = { dsa: 'dsa', hld: 'hld', lld: 'lld', behavioral: 'behavioral', machine: 'lld', ai: 'dsa' };
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
  const queues = { dsa: [], hld: [], lld: [], behavioral: [] };
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
        queues.behavioral.unshift({ id: `lesson:${l.key}`, kind: 'lesson', track, ref: l.key, title: l.title, sub: `${company.name} · behavioral`, minutes: Math.max(5, l.minutes ?? 15), path: l.path, priority: 1 });
      }
      continue;
    }
    if (strong && l.level === 'Beginner') continue;
    const done = isComplete(l.key);
    if (!done) {
      let priority = l.level === 'Advanced' ? 3 : l.level === 'Beginner' && !fresh ? 2 : 1;
      if (/advanced|business/.test(l.moduleId ?? '') || /case-studies-advanced/.test(l.moduleId ?? '')) priority = 3;
      // when sharpening, DSA time goes to problems before re-reading pattern lessons
      if (strong && track === 'dsa') priority = Math.max(priority, 2);
      // sharpening = skim what you already know: half the reading time
      const minutes = Math.max(5, Math.round((l.minutes ?? 15) * (strong ? 0.5 : 1)));
      queues[track].push({ id: `lesson:${l.key}`, kind: 'lesson', track, ref: l.key, title: l.title, sub: strong ? `Skim · ${l.moduleTitle}` : l.moduleTitle, minutes, path: l.path, priority });
    }
    // Pattern lessons are followed by their problem ladder.
    const pattern = l.trackId === 'dsa' && l.courseId === 'patterns' ? l.key.split('/')[2] : null;
    const ladder = pattern ? catalogue.ladders[pattern] ?? [] : [];
    if (pattern) {
      // the lesson itself was just pushed onto queues.dsa: move it into this pattern's block
      const block = { pattern, items: queues.dsa.at(-1)?.ref === l.key ? [queues.dsa.pop()] : [] };
      patternsAt ??= queues.dsa.length;
      const inFocus = focus.includes(pattern);
      if (company && block.items[0]) block.items[0].priority = inFocus ? 1 : Math.max(2, block.items[0].priority);
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
      patternBlocks.at(-1).items.push({
        id: `problem:${p.slug}`, kind: 'problem', track: 'dsa', ref: p.slug, title: p.title, sub: `${p.level} · ${l.title}`,
        minutes: PROBLEM_MINUTES[p.level] ?? 35,
        ...(catalogue.solvable(p.slug) ? { path: `/solve/${p.slug}` } : { href: `https://leetcode.com/problems/${p.slug}/` }),
        priority,
      });
    }
  }
  // focus patterns first (in the company's order), then the rest in curriculum order
  const rank = (b) => (focus.includes(b.pattern) ? focus.indexOf(b.pattern) : focus.length);
  const ordered = company ? [...patternBlocks].sort((a, b) => rank(a) - rank(b)) : patternBlocks;
  // the blocks go back where the patterns course is, between the foundations and the playbook
  queues.dsa.splice(patternsAt ?? queues.dsa.length, 0, ...ordered.flatMap((b) => b.items));
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
    days.push({ date, budget: budgetFor(settings, date) });
  }
  const study = days.filter((d) => d.budget > 0);
  const finalCount = study.length <= 1 ? 0 : study.length <= 5 ? 1 : Math.min(3, Math.max(1, Math.round(study.length * 0.12)));
  const finalDates = new Set(study.slice(study.length - finalCount).map((d) => d.date));
  for (const d of days) d.phase = d.budget === 0 ? 'rest' : finalDates.has(d.date) ? 'final' : 'learn';
  return days;
}

const activeTracks = (mix) => TRACKS.map((t) => t.id).filter((id) => (mix[id] ?? 0) > 0);

/** Generate a plan. `keep` = { done, customByDate } from a previous plan when rebuilding. */
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

  // Custom tasks the learner added survive a rebuild (when their day is still in the plan).
  for (const [date, list] of Object.entries(keep.customByDate ?? {})) if (byDate[date]) byDate[date].tasks.push(...list);

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
    byDate[learnDays[di].date].tasks.push(task);
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

  // Mocks and reviews first in each day reads oddly: put new material first, then practice, then review.
  const order = { guide: 0, lesson: 0, problem: 1, custom: 2, mock: 3, revise: 4, review: 5, warmup: 0 };
  for (const d of out) d.tasks.sort((a, b) => (order[a.kind] ?? 2) - (order[b.kind] ?? 2));

  return {
    version: 1,
    settings,
    createdAt: new Date().toISOString(),
    days: out.map(({ budget, ...d }) => d),
    // the most useful leftovers first, capped so the synced plan stays small
    extras: extras.sort((a, b) => a.priority - b.priority).slice(0, 150).map(({ priority, ...t }) => t),
    done: keep.done ?? {},
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

export function toggleDone(plan, taskId, value) {
  const done = { ...plan.done };
  if (value) done[taskId] = true; else delete done[taskId];
  return { ...plan, done };
}

export function moveTask(plan, taskId, toDate) {
  let task = null;
  const without = mapDays(plan, (d) => {
    const t = d.tasks.find((x) => x.id === taskId);
    if (t) task = t;
    return t ? { ...d, tasks: d.tasks.filter((x) => x.id !== taskId) } : d;
  });
  const fromExtras = plan.extras.find((x) => x.id === taskId);
  if (!task && fromExtras) task = fromExtras;
  if (!task) return plan;
  const next = mapDays(without, (d) => (d.date === toDate ? { ...d, tasks: [...d.tasks, task] } : d));
  return { ...next, extras: next.extras.filter((x) => x.id !== taskId) };
}

export function removeTask(plan, taskId) {
  let task = null;
  const next = mapDays(plan, (d) => {
    const t = d.tasks.find((x) => x.id === taskId);
    if (t) task = t;
    return t ? { ...d, tasks: d.tasks.filter((x) => x.id !== taskId) } : d;
  });
  // lessons and problems go back to the extras list so nothing is lost
  if (task && (task.kind === 'lesson' || task.kind === 'problem')) return { ...next, extras: [task, ...next.extras] };
  return next;
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

/**
 * Catch up: spread unfinished tasks from past days over today and the coming study days (before the final
 * stretch), filling each up to its budget and pushing later work along.
 */
export function respread(plan, progress, today) {
  const s = plan.settings;
  const late = [];
  const days = plan.days.map((d) => {
    if (d.date >= today || d.phase === 'interview') return d;
    const keep = d.tasks.filter((t) => isTaskDone(plan, t, progress) || t.kind === 'review' || t.kind === 'warmup');
    late.push(...d.tasks.filter((t) => !keep.includes(t) && t.kind !== 'review'));
    return { ...d, tasks: keep };
  });
  if (!late.length) return plan;
  const future = days.filter((d) => d.date >= today && d.phase === 'learn');
  // queue = late work, then each future day's unfinished movable work, in order
  const movable = (t) => (t.kind === 'lesson' || t.kind === 'problem' || t.kind === 'custom') && !isTaskDone(plan, t, progress);
  const queue = [...late];
  const fixedByDate = {};
  for (const d of future) {
    queue.push(...d.tasks.filter(movable));
    fixedByDate[d.date] = d.tasks.filter((t) => !movable(t));
  }
  const filled = {};
  let qi = 0;
  for (const d of future) {
    const budget = budgetFor(s, d.date);
    const tasks = [...fixedByDate[d.date]];
    while (qi < queue.length && (sum(tasks) + queue[qi].minutes <= budget + 10 || !tasks.some(movable))) tasks.push(queue[qi++]);
    filled[d.date] = tasks;
  }
  const overflow = queue.slice(qi);
  return {
    ...plan,
    days: days.map((d) => (filled[d.date] ? { ...d, tasks: filled[d.date] } : d)),
    extras: [...overflow.filter((t) => t.kind !== 'custom'), ...plan.extras],
  };
}

/** What to keep when the plan is rebuilt with new settings. */
export function keepOnRebuild(plan) {
  if (!plan) return {};
  const customByDate = {};
  for (const d of plan.days) {
    const c = d.tasks.filter((t) => t.kind === 'custom');
    if (c.length) customByDate[d.date] = c;
  }
  return { done: plan.done ?? {}, customByDate };
}
