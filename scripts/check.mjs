#!/usr/bin/env node
/**
 * Content and data checks that run in CI before every build (no Java needed):
 *  - every lesson file belongs to the curriculum, and every lesson has key takeaways
 *  - internal links and #section anchors in lessons point at real pages and headings
 *  - <Related ids={…}> name lessons that exist in the same course
 *  - quick-check quizzes are well formed and cover every lesson
 *  - practice-problem data matches the lesson ladders, with performance metadata in place
 *
 *   npm run check
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lessonContent } from '../build/content-plugin.js';
import { dsaLadders } from '../build/ladders-plugin.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const errors = [];
const fail = (msg) => errors.push(msg);

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const load = async (p) => (await import(pathToFileURL(p).href));

// ---- curriculum
const tracks = [];
for (const f of readdirSync(join(src, 'curriculum', 'tracks'))) {
  const mod = await load(join(src, 'curriculum', 'tracks', f));
  tracks.push(...Object.values(mod).filter((v) => v && v.courses));
}
const lessons = new Map();   // key → { course modules' lesson ids }
const courses = new Map();
for (const t of tracks) for (const c of t.courses) {
  const ids = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
  courses.set(`${t.id}/${c.id}`, new Set(ids));
  for (const id of ids) lessons.set(`${t.id}/${c.id}/${id}`, true);
}

const contentDir = join(src, 'content');
const files = walk(contentDir).filter((f) => f.endsWith('.mdx')).map((f) => relative(contentDir, f).replace(/\\/g, '/').replace(/\.mdx$/, ''));
for (const key of files) if (!lessons.has(key)) fail(`content/${key}.mdx is not in the curriculum`);
const published = new Set(files);

// ---- lesson extracts (headings, takeaways)
const plugin = lessonContent(contentDir);
const ctx = { addWatchFile() {}, warn: (m) => fail(m) };
const parse = (id) => JSON.parse(plugin.load.call(ctx, `\0${id}`).slice(15, -1));
const search = parse('virtual:search-index');
const extracts = parse('virtual:lesson-extracts');
for (const key of files) if (!extracts[key]?.takeaways) fail(`${key}: no <Takeaways> box`);

// ---- links and anchors
const problemIndex = JSON.parse(readFileSync(join(src, 'data', 'problems', 'index.json'), 'utf8'));
const PAGES = new Set(['', 'dashboard', 'review', 'mock', 'playground', 'problems', 'highlights']);
function checkLink(from, href) {
  const [path, hash] = href.split('#');
  const parts = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  if (parts.length <= 1 && PAGES.has(parts[0] ?? '')) return;
  if (parts[0] === 'solve') { if (!problemIndex[parts[1]]) fail(`${from}: link to unknown problem ${href}`); return; }
  if (parts[0] === 'cheatsheet') { if (!courses.has(`${parts[1]}/${parts[2]}`)) fail(`${from}: link to unknown cheat sheet ${href}`); return; }
  if (parts.length === 1) { if (!tracks.some((t) => t.id === parts[0])) fail(`${from}: link to unknown track ${href}`); return; }
  if (parts.length === 2) { if (!courses.has(parts.join('/'))) fail(`${from}: link to unknown course ${href}`); return; }
  const key = parts.join('/');
  if (!published.has(key)) { fail(`${from}: link to missing lesson ${href}`); return; }
  if (hash && !search[key].headings.some((h) => h.id === hash)) fail(`${from}: link to missing section ${href}`);
}
for (const key of files) {
  const text = readFileSync(join(contentDir, `${key}.mdx`), 'utf8');
  for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) checkLink(key, m[1]);
  for (const m of text.matchAll(/\]\((#[^)\s]+)\)/g)) if (!search[key].headings.some((h) => `#${h.id}` === m[1])) fail(`${key}: link to missing section ${m[1]}`);
  const course = key.split('/').slice(0, 2).join('/');
  for (const m of text.matchAll(/<Related ids=\{\[([^\]]*)\]\}/g)) {
    for (const id of m[1].match(/'([^']+)'|"([^"]+)"/g) ?? []) {
      const clean = id.slice(1, -1);
      if (!courses.get(course)?.has(clean)) fail(`${key}: <Related> names unknown lesson "${clean}"`);
    }
  }
}

// ---- quizzes
const QUIZ_EXEMPT = new Set(['dsa/playbook/problem-tracker']);   // a tool page, not a lesson to test
const quizzed = new Set();
for (const track of readdirSync(join(src, 'data', 'quizzes')).filter((f) => !f.endsWith('.js'))) {
  for (const f of readdirSync(join(src, 'data', 'quizzes', track))) {
    const course = f.replace(/\.js$/, '');
    const data = (await load(join(src, 'data', 'quizzes', track, f))).default;
    for (const [id, qs] of Object.entries(data)) {
      const key = `${track}/${course}/${id}`;
      quizzed.add(key);
      if (!published.has(key)) fail(`quiz for unknown lesson ${key}`);
      if (!qs.length) fail(`${key}: empty quiz`);
      const seen = new Set();
      for (const q of qs) {
        if (seen.has(q.q)) fail(`${key}: duplicate question "${q.q}"`);
        seen.add(q.q);
        if (!Array.isArray(q.options) || q.options.length < 2 || new Set(q.options).size !== q.options.length) fail(`${key}: bad options in "${q.q}"`);
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) fail(`${key}: bad answer index in "${q.q}"`);
        if (!q.why) fail(`${key}: no explanation for "${q.q}"`);
      }
    }
  }
}
for (const key of files) if (!quizzed.has(key) && !QUIZ_EXEMPT.has(key)) fail(`${key}: no quick-check quiz`);

// ---- practice problems
const ladders = JSON.parse(dsaLadders(join(contentDir, 'dsa', 'patterns')).load.call({ addWatchFile() {} }, '\0virtual:dsa-ladders').slice(15, -1));
const ladderSlugs = new Set(Object.values(ladders).flat().map((p) => p.slug));
for (const slug of ladderSlugs) if (!problemIndex[slug]) fail(`ladder problem ${slug} has no tests (add a spec in problems/specs and run node problems/build.mjs)`);
const probDir = join(src, 'data', 'problems');
if (!existsSync(join(probDir, 'meta.json'))) fail('src/data/problems/meta.json is missing (run node problems/build.mjs)');
const shipped = new Set();
for (const f of readdirSync(probDir).filter((f) => f.endsWith('.json') && !['index.json', 'meta.json'].includes(f))) {
  for (const p of JSON.parse(readFileSync(join(probDir, f), 'utf8'))) {
    shipped.add(p.slug);
    if (problemIndex[p.slug] !== f.replace(/\.json$/, '')) fail(`${p.slug}: index.json points to the wrong lesson`);
    if (!p.summary || !p.tests?.length) fail(`${p.slug}: missing summary or tests`);
    if (!p.statement || !p.constraints?.length || !(p.hints?.length >= 2)) fail(`${p.slug}: missing statement, constraints or hints (add them in problems/text, then run node problems/text.mjs)`);
    for (const t of p.tests) if (t.perf && !t.refMs) fail(`${p.slug}: performance test without reference timing`);
  }
}
for (const slug of Object.keys(problemIndex)) if (!shipped.has(slug)) fail(`index.json lists ${slug}, but no data file has it`);

// ---- behavioral question bank links
const { THEME_INFO } = await load(join(src, 'data', 'behavioralQuestions.js'));
for (const [theme, info] of Object.entries(THEME_INFO)) checkLink(`behavioral theme ${theme}`, info.lesson);

if (errors.length) {
  console.error(`✗ ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ ${files.length} lessons, ${quizzed.size} quizzes, ${shipped.size} problems: links, anchors, quizzes and problem data all check out`);
