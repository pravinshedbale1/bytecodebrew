/**
 * Admin usage analytics, computed from the learners' own synced documents (no trackers):
 * activity per day and feature, lesson completions, quick-check accuracy, solved problems,
 * Daily Coach drills and the features people set up (Runway, highlights, story bank, LeetCode).
 *
 * aggregate() is pure (scripts/analytics-check.mjs tests it); loadUsage() reads Firestore with the
 * admin's read access (firestore.rules: a collection-group read over every users/{uid}/state doc).
 */
export const FEATURES = [
  { id: 'lesson', label: 'Lessons read' },
  { id: 'quiz', label: 'Quick checks' },
  { id: 'review', label: 'Review deck' },
  { id: 'practice', label: 'Practice tasks' },
  { id: 'problem', label: 'Problems solved' },
  { id: 'coach', label: 'Daily Coach' },
  { id: 'climb', label: 'Climb (rated problems)' },
  { id: 'mock', label: 'Mock interviews' },
  { id: 'drill', label: 'Behavioral drill' },
];

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const total = (counts) => Object.values(counts ?? {}).reduce((s, n) => s + (Number(n) || 0), 0);
const timeOf = (v) => (typeof v === 'number' ? v : Date.parse(typeof v === 'string' ? v : v?.at ?? v?.completedAt ?? '') || 0);

/** Monday-start week key for a day key. */
function weekOf(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const monday = addDays(date, -((date.getDay() + 6) % 7));
  return dayKey(monday);
}

/**
 * users      [{ uid, email, name }] (from Firebase Auth via the payments Worker)
 * docs       { uid: { progress, solved, quiz, activity, coach, climb, runway, highlights, stories, profile, mocks, … } }
 * premium    Set of lower-case emails with active Premium
 * patternOf  slug → pattern id (judged problems)
 * now        a Date
 */
export function aggregate({ users = [], docs = {}, premium = new Set(), patternOf = () => null, now = new Date() }) {
  const today = dayKey(now);
  const last = (n) => new Set(Array.from({ length: n }, (_, i) => dayKey(addDays(now, -i))));
  const d7 = last(7);
  const d30 = last(30);
  const byUid = new Map(users.map((u) => [u.uid, u]));
  const uids = [...new Set([...users.map((u) => u.uid), ...Object.keys(docs)])];

  // ---- activity: who did what, when
  const daily = Object.fromEntries([...d30].map((d) => [d, new Set()]));
  const weeks = [...new Set(Array.from({ length: 8 * 7 }, (_, i) => weekOf(dayKey(addDays(now, -i)))))].sort().slice(-8);
  const weekMatrix = Object.fromEntries(weeks.map((w) => [w, Object.fromEntries(FEATURES.map((f) => [f.id, 0]))]));
  const feature = Object.fromEntries(FEATURES.map((f) => [f.id, { users30: new Set(), users7: new Set(), actions30: 0 }]));
  const people = [];
  let active1 = 0;
  let active7 = 0;
  let active30 = 0;

  for (const uid of uids) {
    const d = docs[uid] ?? {};
    const activity = d.activity ?? {};
    const counts = Object.fromEntries(FEATURES.map((f) => [f.id, 0]));
    let days30 = 0;
    let lastDay = null;
    for (const [day, c] of Object.entries(activity)) {
      const t = total(c);
      if (t > 0 && (!lastDay || day > lastDay)) lastDay = day;
      if (t > 0 && d30.has(day)) {
        days30 += 1;
        daily[day].add(uid);
      }
      for (const f of FEATURES) {
        const n = Number(c?.[f.id]) || 0;
        if (!n) continue;
        if (d30.has(day)) { counts[f.id] += n; feature[f.id].users30.add(uid); feature[f.id].actions30 += n; }
        if (d7.has(day)) feature[f.id].users7.add(uid);
        const w = weekOf(day);
        if (weekMatrix[w]) weekMatrix[w][f.id] += n;
      }
    }
    if (lastDay === today) active1 += 1;
    if (lastDay && d7.has(lastDay)) active7 += 1;
    if (days30 > 0) active30 += 1;
    const u = byUid.get(uid) ?? { uid };
    const lessons = Object.entries(d.progress ?? {}).filter(([k, v]) => k !== '__lastVisited' && v && typeof v === 'object').length;
    people.push({
      uid,
      email: u.email ?? null,
      name: u.name ?? null,
      premium: Boolean(u.email && premium.has(u.email.toLowerCase())),
      counts,
      actions30: total(counts),
      days30,
      lastDay,
      lessons,
      solved: Object.keys(d.solved ?? {}).length,
    });
  }
  people.sort((a, b) => b.actions30 - a.actions30 || b.days30 - a.days30 || (b.lastDay ?? '').localeCompare(a.lastDay ?? ''));

  // ---- features people set up (ever)
  const setups = [
    { label: 'Runway plan created', test: (d) => Boolean(d.runway?.plan) },
    { label: 'Daily Coach used', test: (d) => (d.coach?.events?.length ?? 0) > 0 },
    { label: 'Climb started', test: (d) => (d.climb?.events?.length ?? 0) > 0 },
    { label: 'Highlights or notes', test: (d) => Object.keys(d.highlights ?? {}).length > 0 },
    { label: 'Story bank', test: (d) => (d.stories?.length ?? 0) > 0 },
    { label: 'LeetCode connected', test: (d) => Boolean(d.profile?.leetcode?.username) },
    { label: 'Mock interviews saved', test: (d) => (d.mocks?.length ?? 0) > 0 },
    { label: 'Review deck started', test: (d) => Object.keys(d.reviews ?? {}).length > 0 },
  ].map((s) => ({ label: s.label, users: uids.filter((uid) => s.test(docs[uid] ?? {})).length }));

  // ---- lessons and topics
  const lessonCounts = new Map();
  const quiz = new Map();
  for (const uid of uids) {
    const d = docs[uid] ?? {};
    for (const [key, v] of Object.entries(d.progress ?? {})) {
      if (key === '__lastVisited' || !v || typeof v !== 'object') continue;
      lessonCounts.set(key, (lessonCounts.get(key) ?? 0) + 1);
    }
    for (const [key, answers] of Object.entries(d.quiz ?? {})) {
      const q = quiz.get(key) ?? { right: 0, total: 0, users: new Set() };
      for (const a of Object.values(answers ?? {})) { q.total += 1; if (a?.first) q.right += 1; }
      q.users.add(uid);
      quiz.set(key, q);
    }
  }
  const lessons = [...lessonCounts].map(([key, users]) => ({ key, users })).sort((a, b) => b.users - a.users);
  const topicMap = new Map();
  for (const { key, users } of lessons) {
    const topic = key.split('/').slice(0, 2).join('/');
    const t = topicMap.get(topic) ?? { topic, completions: 0, lessons: 0 };
    t.completions += users;
    t.lessons += 1;
    topicMap.set(topic, t);
  }
  const topicLearners = new Map();
  for (const uid of uids) {
    for (const key of Object.keys(docs[uid]?.progress ?? {})) {
      if (key === '__lastVisited') continue;
      const topic = key.split('/').slice(0, 2).join('/');
      (topicLearners.get(topic) ?? topicLearners.set(topic, new Set()).get(topic)).add(uid);
    }
  }
  const topics = [...topicMap.values()].map((t) => ({ ...t, learners: topicLearners.get(t.topic)?.size ?? 0 })).sort((a, b) => b.learners - a.learners);
  const hardest = [...quiz].map(([key, q]) => ({ key, accuracy: q.total ? q.right / q.total : 0, answers: q.total, learners: q.users.size }))
    .filter((q) => q.answers >= 5).sort((a, b) => a.accuracy - b.accuracy);

  // ---- problems and patterns
  const solvedCounts = new Map();
  const sources = { tests: 0, leetcode: 0, self: 0 };
  const drills = new Map();
  for (const uid of uids) {
    const d = docs[uid] ?? {};
    for (const [slug, v] of Object.entries(d.solved ?? {})) {
      solvedCounts.set(slug, (solvedCounts.get(slug) ?? 0) + 1);
      const by = typeof v === 'string' ? 'self' : v?.by ?? 'self';
      sources[by] = (sources[by] ?? 0) + 1;
    }
    for (const e of d.coach?.events ?? []) {
      if (e.k !== 'drill') continue;
      const p = patternOf(e.s);
      if (!p) continue;
      const r = drills.get(p) ?? { pattern: p, right: 0, total: 0 };
      r.total += 1;
      if (e.pat) r.right += 1;
      drills.set(p, r);
    }
  }
  const problems = [...solvedCounts].map(([slug, users]) => ({ slug, users, pattern: patternOf(slug) })).sort((a, b) => b.users - a.users);
  const patternSolves = new Map();
  for (const p of problems) if (p.pattern) patternSolves.set(p.pattern, (patternSolves.get(p.pattern) ?? 0) + p.users);
  const patterns = [...patternSolves].map(([pattern, solves]) => ({ pattern, solves })).sort((a, b) => b.solves - a.solves);
  const confused = [...drills.values()].map((r) => ({ ...r, accuracy: r.right / r.total })).filter((r) => r.total >= 5).sort((a, b) => a.accuracy - b.accuracy);

  return {
    computedAt: now.getTime(),
    totals: { registered: users.length || uids.length, withData: Object.keys(docs).length, active1, active7, active30, premium: people.filter((p) => p.premium).length },
    daily: [...d30].sort().map((day) => ({ day, users: daily[day].size })),
    features: FEATURES.map((f) => ({ ...f, users30: feature[f.id].users30.size, users7: feature[f.id].users7.size, actions30: feature[f.id].actions30 })),
    weeks: weeks.map((w) => ({ week: w, ...weekMatrix[w] })),
    setups,
    people,
    lessons,
    topics,
    hardest,
    problems,
    patterns,
    sources,
    confused,
  };
}

/** Everything aggregate() needs, read with the admin's access. Returns { users, docs, premium, reads }. */
export async function loadUsage({ fb, listUsers }) {
  const [usersRes, stateSnap, entSnap] = await Promise.all([
    listUsers(),
    fb.fsMod.getDocs(fb.fsMod.collectionGroup(fb.db, 'state')),
    fb.fsMod.getDocs(fb.fsMod.collection(fb.db, 'entitlements')),
  ]);
  const docs = {};
  for (const d of stateSnap.docs) {
    const uid = d.ref.parent.parent?.id;
    if (!uid || d.id === 'reset') continue;
    try { (docs[uid] ??= {})[d.id] = JSON.parse(d.data().json); } catch { /* skip a malformed document */ }
  }
  const now = Date.now();
  const premium = new Set(entSnap.docs.filter((e) => {
    const v = e.data();
    const exp = v.expiresAt?.toMillis?.() ?? null;
    return v.premium === true && (exp === null || exp > now);
  }).map((e) => e.id));
  return { users: usersRes.users ?? [], docs, premium, reads: stateSnap.size + entSnap.size };
}
