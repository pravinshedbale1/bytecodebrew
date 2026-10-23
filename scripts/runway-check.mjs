#!/usr/bin/env node
/**
 * Checks Runway's planner (src/lib/runwayPlan.js) on a small made-up curriculum: plans fit the hours,
 * re-planning never loses a task, pinned tasks and finished work stay put, days off and the pace are
 * respected, the syllabus choices shape the plan, the plan follows the Daily Coach and Climb, and
 * version 1 plans keep working. Part of `npm run check`.
 */
import {
  generatePlan, reflow, migrate, forecast, diffPlans, keepOnRebuild, moveTask, pinTask, snoozeTask, swapTask,
  removeTask, addCustomTask, setCapacity, setPace, addDailyMinutes, capacityFor, isTaskDone, addDays, syllabusGroups,
} from '../src/lib/runwayPlan.js';

let failures = 0;
const check = (ok, msg) => { if (!ok) { failures += 1; console.log(`✗ ${msg}`); } };

// ---- a small curriculum: DSA foundations and 6 patterns with ladders, plus HLD, LLD and behavioral modules
const lessons = [];
const add = (trackId, courseId, moduleId, id, level = 'Intermediate', minutes = 20) => lessons.push({
  key: `${trackId}/${courseId}/${id}`, path: `/${trackId}/${courseId}/${id}`, title: `${id} lesson`, minutes, level,
  trackId, courseId, moduleId, moduleTitle: `${moduleId} module`, courseTitle: courseId,
});
for (let i = 1; i <= 3; i += 1) add('dsa', 'start-here', 'basics', `start-${i}`, 'Beginner', 15);
const PATTERNS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
for (const p of PATTERNS) add('dsa', 'patterns', 'core', p);
for (let i = 1; i <= 8; i += 1) add('system-design', 'hld', i <= 4 ? 'fundamentals' : 'case-studies', `hld-${i}`, i === 8 ? 'Advanced' : 'Intermediate', 30);
for (let i = 1; i <= 5; i += 1) add('system-design', 'lld', 'patterns', `lld-${i}`, 'Intermediate', 25);
for (let i = 1; i <= 4; i += 1) add('behavioral', 'foundations', 'stories', `beh-${i}`, 'Beginner', 15);
const LEVELS = ['Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard'];
const ladders = Object.fromEntries(PATTERNS.map((p) => [p, LEVELS.map((level, i) => ({ slug: `j-${p}-${i}`, title: `${p} problem ${i}`, level }))]));
const catalogue = { lessons, ladders, solvable: (s) => s.startsWith('j-') };
const patternOf = (slug) => /^j-(p\d)-/.exec(slug)?.[1] ?? null;

const none = { isComplete: () => false, isSolved: () => false };
const START = '2026-11-02';   // a Monday
const settings = (over = {}) => ({
  start: START, end: addDays(START, 21), hours: { weekday: 2, weekend: 4 }, restDays: [0],
  mix: { dsa: 45, hld: 25, lld: 15, behavioral: 15 }, level: 'some', company: null, missed: 'spread', ...over,
});

const allTasks = (plan) => [...plan.days.flatMap((d) => d.tasks), ...plan.extras];
const ids = (plan) => new Set(allTasks(plan).map((t) => t.id));
const MOVABLE = new Set(['lesson', 'problem', 'custom']);
const sum = (list) => list.reduce((n, t) => n + t.minutes, 0);

/** Every study day from `from` holds at most its minutes (+10), or a single item that is bigger. */
function fits(plan, from, label) {
  for (const d of plan.days) {
    if (d.date < from || d.phase === 'interview') continue;
    const cap = capacityFor(plan.settings, d.date);
    const movable = d.tasks.filter((t) => MOVABLE.has(t.kind));
    if (cap === 0) { check(movable.length === 0 || movable.every((t) => plan.pins?.[t.id] === d.date), `${label}: ${d.date} is a day off but has tasks`); continue; }
    const extra = sum(d.tasks) - cap;
    check(extra <= 10 || movable.length <= 1 || d.phase !== 'learn', `${label}: ${d.date} has ${sum(d.tasks)} min for ${cap}`);
  }
}

// ---- a new plan
const plan = generatePlan(settings(), catalogue, none);
check(plan.version === 2, 'new plans are version 2');
check(ids(plan).size === allTasks(plan).length, 'no task appears twice in a new plan');
check(allTasks(plan).filter((t) => t.kind === 'lesson' || t.kind === 'problem').every((t) => [1, 2, 3].includes(t.pri) && t.why), 'every lesson and problem has a priority and a reason');
check(allTasks(plan).filter((t) => t.kind === 'problem').every((t) => t.slot && t.grp?.startsWith('p:')), 'judged problems are slots in their pattern group');
fits(plan, START, 'new plan');
check(plan.days.at(-1).phase === 'interview', 'the plan ends on the interview day');
check(plan.days.some((d) => d.phase === 'final' && d.base === 'final'), 'final-stretch days remember they are final');

// ---- re-planning after three days with nothing done
const day3 = addDays(START, 3);
const late = reflow(plan, none, day3);
check([...ids(plan)].every((id) => ids(late).has(id)), 'skipping days loses no task');
check(late.days.filter((d) => d.date < day3).every((d) => d.tasks.every((t) => t.kind === 'review' || t.kind === 'warmup')), 'earlier days keep only their reviews');
check(late.days.some((d) => d.tasks.some((t) => t.carried === START)), 'work from the first day is marked as carried over');
check(late.notes.some((n) => /unfinished task/.test(n.text)), 're-planning notes what it moved');
check(late.reflowedOn === day3, 're-planning records the day');
fits(late, day3, 'after re-planning');
const again = reflow(late, none, day3);
check(JSON.stringify(again.days) === JSON.stringify(late.days), 're-planning twice on the same day changes nothing');

// ---- missed work piles up (the default): it joins the next study day, every other day stays as it was
{
  const pilePlan = generatePlan(settings({ missed: undefined }), catalogue, none);
  const piled = reflow(pilePlan, none, day3);
  const before = (d) => pilePlan.days.filter((x) => x.date < day3).flatMap((x) => x.tasks).filter((t) => t.kind !== 'review' && t.kind !== 'warmup');
  const missed = before().map((t) => t.id);
  const today3 = piled.days.find((d) => d.date === day3);
  check(missed.length > 0 && missed.every((id) => today3.tasks.some((t) => t.id === id)), 'piling: every unfinished task from earlier days is on the next study day');
  check(pilePlan.days.find((d) => d.date === day3).tasks.every((t) => today3.tasks.some((x) => x.id === t.id)), "piling: that day keeps its own tasks too");
  check(piled.days.filter((d) => d.date > day3).every((d) => JSON.stringify(d.tasks.map((t) => t.id)) === JSON.stringify(pilePlan.days.find((x) => x.date === d.date).tasks.map((t) => t.id))), 'piling: later days are untouched');
  check([...ids(pilePlan)].every((id) => ids(piled).has(id)), 'piling loses no task');
  const roomy = generatePlan(settings({ missed: undefined, hours: { weekday: 6, weekend: 6 }, end: addDays(START, 6) }), catalogue, none);
  const roomyAfter = reflow(removeTask(roomy, roomy.days[4].tasks.find((t) => t.kind === 'lesson').id), none, day3);
  check(roomyAfter.days.filter((d) => d.date > day3).every((d) => d.tasks.every((t) => roomy.days.some((x) => x.date === d.date && x.tasks.some((y) => y.id === t.id)))), 'piling never pulls spare-time work into later days');
  check(today3.tasks.filter((t) => missed.includes(t.id)).every((t) => t.carried && t.carried < day3), 'piled tasks say which day they came from');
  check(piled.notes.some((n) => /added to the next study day/.test(n.text)), 'piling notes what it added');
  check(JSON.stringify(reflow(piled, none, day3).days) === JSON.stringify(piled.days), 'piling twice on the same day changes nothing');
  const off = reflow(setCapacity(piled, [day3], 0), none, day3);
  const next = off.days.find((d) => d.date > day3 && capacityFor(off.settings, d.date) > 0);
  check(off.days.find((d) => d.date === day3).tasks.length === 0 && today3.tasks.every((t) => t.kind === 'review' || next.tasks.some((x) => x.id === t.id)), 'piling: a day set off passes its tasks to the next study day');
  const once = reflow(pilePlan, none, day3, { missed: 'spread' });
  fits(once, day3, 'spreading once on a piling plan');
  check(once.settings.missed === undefined, 'spreading once leaves the setting alone');
  const strongPile = reflow(pilePlan, none, START, { labelOf: (p) => (p === 'p1' ? 'Strong' : 'Not started'), patternOf });
  check(!strongPile.days.some((d) => d.tasks.some((t) => t.grp === 'p:p1' && t.kind === 'problem' && t.pri >= 2)), 'piling still drops a strong pattern\'s recommended problems');
}

// ---- finished work stays where it was done
const first = plan.days[0].tasks.find((t) => t.kind === 'lesson');
const doneProgress = { isComplete: (k) => k === first.ref, isSolved: () => false };
const kept = reflow(plan, doneProgress, day3);
check(kept.days[0].tasks.some((t) => t.id === first.id), 'a lesson done on day 1 stays on day 1');
check(isTaskDone(kept, first, doneProgress), 'and still counts as done');

// ---- pins
const target = addDays(START, 9);
const movable = plan.days[2].tasks.find((t) => t.kind === 'problem') ?? plan.days[2].tasks.find((t) => t.kind === 'lesson');
const moved = moveTask(plan, movable.id, target);
check(moved.pins[movable.id] === target, 'a moved task is pinned to its new day');
const movedAfter = reflow(moved, none, day3);
check(movedAfter.days.find((d) => d.date === target).tasks.some((t) => t.id === movable.id), 'a pinned task stays on its day through re-planning');
const pastPin = pinTask(plan, plan.days[0].tasks[0].id, true);
const pastAfter = reflow(pastPin, none, day3);
check(!pastAfter.pins[plan.days[0].tasks[0].id], 'a task pinned to a day that passed unfinished is unpinned and moves on');
const unpinned = pinTask(moved, movable.id, false);
check(!unpinned.pins[movable.id], 'unpinning works');
const snoozed = snoozeTask(plan, movable.id);
const snoozedDay = snoozed.days.find((d) => d.tasks.some((t) => t.id === movable.id)).date;
check(snoozedDay > plan.days[2].date && capacityFor(plan.settings, snoozedDay) > 0, 'snooze moves a task to the next study day');

// ---- days off and hours
const off = addDays(day3, 1);
const offPlan = reflow(setCapacity(late, [off], 0), none, day3);
const offDay = offPlan.days.find((d) => d.date === off);
check(offDay.phase === 'rest' && offDay.tasks.length === 0, 'a day set off is emptied and becomes a rest day');
check([...ids(late)].every((id) => ids(offPlan).has(id)), 'a day off loses no task');
const backOn = reflow(setCapacity(offPlan, [off], null), none, day3);
check(backOn.days.find((d) => d.date === off).phase !== 'rest', 'the day comes back when the override is cleared');
const sunday = plan.days.find((d) => d.phase === 'rest' && d.date > day3).date;
const sundayOn = reflow(setCapacity(late, [sunday], 120), none, day3);
check(sundayOn.days.find((d) => d.date === sunday).tasks.some((t) => MOVABLE.has(t.kind)), 'hours given to a rest day are used');
fits(sundayOn, day3, 'with hours on a rest day');
const mockDay = late.days.find((d) => d.date > day3 && d.tasks.some((t) => t.kind === 'mock'));
if (mockDay) {
  const mockOff = reflow(setCapacity(late, [mockDay.date], 0), none, day3);
  const mock = mockDay.tasks.find((t) => t.kind === 'mock');
  const where = mockOff.days.find((d) => d.tasks.some((t) => t.id === mock.id));
  check(where && where.date > mockDay.date, 'a mock on a day off moves to the next study day');
}

// ---- pace
const week = (p) => p.days.filter((d) => d.date >= day3 && d.date < addDays(day3, 7)).reduce((n, d) => n + sum(d.tasks.filter((t) => MOVABLE.has(t.kind))), 0);
const pushed = reflow(setPace(late, 'push'), none, day3);
const light = reflow(setPace(late, 'light'), none, day3);
check(week(pushed) > week(late) && week(light) < week(late), 'Push plans more a week than Steady, Light less');
fits(pushed, day3, 'push pace');

// ---- syllabus
const shaped = generatePlan(settings({ syllabus: { 'p:p2': 'skip', 'p:p5': 'must' } }), catalogue, none);
check(!allTasks(shaped).some((t) => t.grp === 'p:p2'), 'a skipped pattern is left out entirely');
const firstDate = (p, grp) => p.days.find((d) => d.tasks.some((t) => t.grp === grp))?.date ?? '9999';
check(firstDate(shaped, 'p:p5') <= firstDate(shaped, 'p:p1'), 'a Must pattern comes before the others');
check(allTasks(shaped).filter((t) => t.grp === 'p:p5' && t.kind === 'lesson').every((t) => t.pri === 1), 'a Must pattern is core');
const later = generatePlan(settings({ syllabus: { 'p:p1': 'later' } }), catalogue, none);
check(allTasks(later).filter((t) => t.grp === 'p:p1').every((t) => t.pri === 3), 'an If-time pattern is a stretch');
const ordered = generatePlan(settings({ patternOrder: ['p6', 'p4'] }), catalogue, none);
check(firstDate(ordered, 'p:p6') <= firstDate(ordered, 'p:p4') && firstDate(ordered, 'p:p4') <= firstDate(ordered, 'p:p1'), "the learner's pattern order is followed");
const groups = syllabusGroups(catalogue);
check(groups.filter((g) => g.id.startsWith('p:')).length === 6 && groups.some((g) => g.id === 'm:hld:hld/fundamentals'), 'the syllabus lists patterns and modules');

// ---- following the Daily Coach and Climb
const strong = reflow(plan, none, START, { labelOf: (p) => (p === 'p1' ? 'Strong' : 'Not started'), patternOf });
check(!strong.days.some((d) => d.tasks.some((t) => t.grp === 'p:p1' && t.kind === 'problem' && t.pri >= 2)), 'a strong pattern loses its recommended problems');
check(strong.extras.some((t) => t.grp === 'p:p1' && /strong/.test(t.why)), 'they go to spare time with a reason');
check([...ids(plan)].every((id) => ids(strong).has(id)), 'nothing is lost when a pattern is strong');
const tight = generatePlan(settings({ end: addDays(START, 8) }), catalogue, none);
const weakPattern = PATTERNS.find((p) => tight.extras.some((t) => t.grp === `p:${p}` && t.kind === 'problem') && tight.days.some((d) => d.tasks.some((t) => t.grp === `p:${p}`)));
if (weakPattern) {
  const ctx = { labelOf: (p) => (p === weakPattern ? 'Weak' : 'Not started'), attempted: (p) => p === weakPattern, patternOf };
  const weak = reflow(tight, none, START, ctx);
  const count = (p) => p.days.flatMap((d) => d.tasks).filter((t) => t.grp === `p:${weakPattern}`).length;
  check(count(weak) === count(tight) + 1 || weak.extras.length < tight.extras.length, 'a weak pattern gets one more problem');
  check(weak.adapted[weakPattern] === START, 'and the day is remembered');
  const twice = reflow(weak, none, START, ctx);
  check(count(twice) <= count(weak), 'only once a week');
} else check(false, 'test setup: no pattern with planned and spare problems');
const slow = reflow(plan, none, START, { speed: 1.5 });
const p1 = slow.days.flatMap((d) => d.tasks).find((t) => t.kind === 'problem');
check(p1.base && p1.minutes === Math.max(10, Math.round((p1.base * 1.5) / 5) * 5), 'problem estimates follow the measured speed');
const today = START;
const settled = reflow(generatePlan(settings({ mix: { dsa: 100, hld: 0, lld: 0, behavioral: 0 }, level: 'strong' }), catalogue, none), none, today);
const slotTask = settled.days.find((d) => d.date === today).tasks.find((t) => t.kind === 'problem');
const spare = plan.extras.find((t) => t.kind === 'problem') ?? { id: 'problem:j-extra', ref: 'j-extra' };
const picked = reflow(settled, none, today, { pick: (t, planned) => (t.id === slotTask.id && !planned.has(spare.ref) ? { id: spare.id, ref: spare.ref, title: 'picked', minutes: 35 } : null) });
check(picked.days.find((d) => d.date === today).tasks.some((t) => t.id === spare.id), "today's problem slot can be filled with a better fit");
check(!picked.extras.some((t) => t.id === spare.id), 'the picked problem leaves spare time');
check(picked.extras.some((t) => t.id === slotTask.id) || picked.days.some((d) => d.tasks.some((t) => t.id === slotTask.id)), 'the problem it replaced is kept');

// ---- swap, remove, custom tasks
const swapped = swapTask(settled, slotTask.id, () => ({ id: spare.id, ref: spare.ref, title: 'other', minutes: 35 }));
check(swapped.days.find((d) => d.date === today).tasks.some((t) => t.id === spare.id) && swapped.extras[0].id === slotTask.id, 'swap replaces a problem and keeps the old one in spare time');
check(!swapped.extras.some((t) => t.id === spare.id), 'the new problem leaves spare time');
const removed = removeTask(moved, movable.id);
check(!removed.pins[movable.id] && removed.extras[0].id === movable.id, 'removing a task unpins it and keeps it in spare time');
let custom = addCustomTask(plan, START, 'Resume review', 600);
custom = reflow(setCapacity(custom, plan.days.filter((d) => d.date >= START && d.phase !== 'interview').map((d) => d.date), 30), none, START);
check(custom.days.some((d) => d.tasks.some((t) => t.kind === 'custom')), "the learner's own task is never dropped, even when nothing fits");

// ---- forecast
const small = generatePlan(settings({ end: addDays(START, 7), hours: { weekday: 1, weekend: 1 } }), catalogue, none);
const f = forecast(small, none, START);
check(f.known && f.coverage < 1 && f.coreLeft > 0, 'a tight plan reports core work that does not fit');
const minutes = f.suggestions.find((x) => x.id === 'minutes');
check(minutes && f.suggestions.some((x) => x.id === 'date'), 'it suggests more minutes a day and a later date');
if (minutes) {
  const roomier = reflow(addDailyMinutes(small, minutes.minutes), none, START);
  check(forecast(roomier, none, START).coreLeft < f.coreLeft, 'taking the suggestion brings core work back from spare time');
  check(roomier.notes.some((n) => /from spare time/.test(n.text)), 'and says so');
  fits(roomier, START, 'with more minutes a day');
}
const parked = removeTask(plan, movable.id);
const parkedAfter = reflow(setPace(parked, 'push'), none, START);
check(parkedAfter.extras.some((t) => t.id === movable.id && t.parked), 'a task set aside stays in spare time when there is room');
const pulled = moveTask(parked, movable.id, START);
check(!pulled.days[0].tasks.find((t) => t.id === movable.id).parked, 'pulling it back in un-parks it');

// ---- rebuilds
check(!diffPlans(plan, plan, START).changed, 'a plan compared with itself has no changes');
const pinnedPlan = moveTask(plan, movable.id, target);
const rebuilt = generatePlan(settings({ hours: { weekday: 3, weekend: 5 } }), catalogue, none, keepOnRebuild(pinnedPlan));
check(rebuilt.days.find((d) => d.date === target).tasks.some((t) => t.id === movable.id) && rebuilt.pins[movable.id] === target, 'a rebuild keeps pinned tasks on their day');
check(allTasks(rebuilt).filter((t) => t.id === movable.id).length === 1, 'a pinned task is not planned twice');
check(diffPlans(plan, rebuilt, START).changed, 'a rebuild with more hours shows changes');

// ---- version 1 plans
const strip = ({ pri, grp, why, slot, base, ...t }) => t;
const v1 = {
  version: 1, settings: { start: START, end: plan.settings.end, hours: plan.settings.hours, restDays: [0], mix: plan.settings.mix, level: 'some', company: null },
  createdAt: plan.createdAt, days: plan.days.map(({ base, ...d }) => ({ ...d, tasks: d.tasks.map(strip) })), extras: plan.extras.map(strip), done: { [plan.days[0].tasks[0].id]: true },
};
const m = migrate(v1);
check(m.version === 2 && m.settings.pace === 'steady' && m.pins && m.notes && m.reflowedOn === null, 'a version 1 plan gets the new fields');
check(JSON.stringify(m.days) === JSON.stringify(v1.days) && m.done === v1.done, 'migrating leaves days and ticks alone');
check(migrate(m) === m, 'migrating a version 2 plan is a no-op');
const v1late = reflow(v1, none, day3, { labelOf: () => 'Strong', patternOf });
check([...ids(v1)].every((id) => ids(v1late).has(id)), 'a version 1 plan re-plans without losing a task');
check(v1late.days[0].tasks.some((t) => t.id === plan.days[0].tasks[0].id), 'its ticked task stays where it was ticked');
check(forecast(v1, none, START).coverage === null, 'the forecast stays quiet for plans without priorities');

console.log(failures ? `\n${failures} Runway check${failures === 1 ? '' : 's'} failed` : '✓ Runway: plans fit, re-planning keeps every task, pins, days off, pace, syllabus, coach and Climb signals, and version 1 plans');
process.exit(failures ? 1 : 0);
