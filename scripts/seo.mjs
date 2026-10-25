#!/usr/bin/env node
/**
 * Search engines and link previews. Runs after `vite build` (part of `npm run build`).
 *
 * The site is a single-page app on GitHub Pages, which serves any path it has no file for through
 * 404.html with an HTTP 404 status: people never notice, but search engines won't index a page that
 * answers 404. So every real page gets its own file (dist/<path>.html, and <path>/index.html where
 * the path is also a folder), answering 200 with:
 *   - its own <title>, description, canonical URL, Open Graph and Twitter card tags (public/og.png)
 *   - structured data (JSON-LD): the organisation and site on the home page, breadcrumbs everywhere,
 *     and an Article for each lesson
 *   - a plain-HTML version of what the page shows inside #root, for crawlers that don't run
 *     JavaScript and for the moment before the app starts; React replaces it on load (createRoot).
 *     It never says more than the page itself: an Advanced (Premium) lesson shows its summary and
 *     outline, a problem or company page its title and the Premium note.
 * and writes sitemap.xml (free, indexable pages, with the date each lesson last changed in git) and
 * robots.txt. Personal pages (dashboard, review, settings, …) answer 200 but carry noindex.
 *
 *   node scripts/seo.mjs          (after vite build; reads and writes dist/)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import { systemDesign } from '../src/curriculum/tracks/systemDesign.js';
import { dsa } from '../src/curriculum/tracks/dsa.js';
import { behavioral } from '../src/curriculum/tracks/behavioral.js';
import { COMPANIES, companyPlan } from '../src/data/companies.js';
import { site } from '../src/config/site.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const ORIGIN = 'https://bytecodebrew.com';
const IMAGE = `${ORIGIN}/og.png`;
const tracks = [systemDesign, dsa, behavioral];
const template = readFileSync(join(DIST, 'index.html'), 'utf8');

// ---- helpers

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (text, max = 300) => {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '));
  return end > max * 0.5 ? cut.slice(0, end + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
};
const plain = (md) => md.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

let lastCommit = null;
function gitDate(file) {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim();
    if (d) return d;
  } catch { /* not a git checkout */ }
  lastCommit ??= (() => { try { return execFileSync('git', ['log', '-1', '--format=%cs'], { cwd: root, encoding: 'utf8' }).trim(); } catch { return null; } })();
  return lastCommit;
}

// ---- lesson content from the MDX source

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
const attr = (node, name) => {
  const a = node.attributes?.find((x) => x.name === name);
  if (!a) return null;
  if (typeof a.value === 'string') return a.value;
  const raw = a.value?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw.replace(/^[`'"]|[`'"]$/g, ''); }
};

function lessonOutline(file) {
  const tree = parser.parse(readFileSync(file, 'utf8'));
  const top = tree.children.filter((n) => n.type !== 'mdxjsEsm');
  const intro = [];
  const sections = [];
  let current = null;
  for (const n of top) {
    if (n.type === 'heading' && n.depth === 2) {
      current = { title: toString(n), text: null };
      sections.push(current);
    } else if (n.type === 'paragraph') {
      const text = clip(toString(n), 320);
      if (!text) continue;
      if (!current && intro.length < 2) intro.push(text);
      else if (current && !current.text) current.text = text;
    }
  }
  const questions = [];
  const takeaways = [];
  const visit = (n) => {
    if (n.type === 'mdxJsxFlowElement' && n.name === 'QA') {
      const q = attr(n, 'q');
      if (q) questions.push(clip(plain(q), 200));
    }
    if (n.type === 'mdxJsxFlowElement' && n.name === 'Takeaways') {
      const walk = (m) => { if (m.type === 'listItem') takeaways.push(clip(toString(m), 260)); else m.children?.forEach(walk); };
      walk(n);
      return;
    }
    n.children?.forEach(visit);
  };
  visit(tree);
  return { intro, sections, questions: questions.slice(0, 12), takeaways };
}

// ---- pages

const pages = [];
/**
 * path, title, description, html (inside #root), crumbs [[label, path]], index (in the sitemap),
 * noindex, lastmod, article (lesson metadata for JSON-LD).
 */
const add = (p) => pages.push(p);

const crumbsHtml = (crumbs) => `<nav aria-label="Breadcrumb"><a href="/">${esc(site.name)}</a>${crumbs.map(([label, path]) => ` › <a href="${path}">${esc(label)}</a>`).join('')}</nav>`;
const linkList = (items) => `<ul>${items.map(([href, label, note]) => `<li><a href="${href}">${esc(label)}</a>${note ? `: ${esc(note)}` : ''}</li>`).join('')}</ul>`;

const available = (t, c, l) => existsSync(join(root, 'src/content', t.id, c.id, `${l.id}.mdx`));
const coursesOf = (t) => t.courses.filter((c) => c.modules.some((m) => m.lessons.some((l) => available(t, c, l))));

// home
add({
  path: '/',
  title: `${site.name}: Interview preparation, in depth`,
  description: 'Free, in-depth interview preparation: system design (HLD and LLD), DSA patterns in Java with 390 problems you can solve with tests, and behavioral interviews.',
  index: true,
  html: `<h1>${esc(site.name)}: interview preparation, in depth</h1><p>${esc(site.tagline)}</p>${tracks.map((t) => `<h2><a href="/${t.id}">${esc(t.title)}</a></h2><p>${esc(t.description)}</p>${linkList(coursesOf(t).map((c) => [`/${t.id}/${c.id}`, c.title, c.description]))}`).join('')}`,
  home: true,
});

for (const t of tracks) {
  const courses = coursesOf(t);
  add({
    path: `/${t.id}`, title: `${t.title} interview preparation · ${site.name}`, description: clip(t.description, 160), index: true,
    crumbs: [[t.title, `/${t.id}`]],
    html: `<h1>${esc(t.title)}</h1><p>${esc(t.description)}</p>${linkList(courses.map((c) => [`/${t.id}/${c.id}`, c.title, c.description]))}`,
  });
  for (const c of courses) {
    const lessons = c.modules.flatMap((m) => m.lessons.filter((l) => available(t, c, l)).map((l) => ({ ...l, module: m })));
    add({
      path: `/${t.id}/${c.id}`, title: `${c.title} · ${t.title} · ${site.name}`, description: clip(c.description, 160), index: true,
      crumbs: [[t.title, `/${t.id}`], [c.title, `/${t.id}/${c.id}`]],
      html: `<h1>${esc(c.title)}</h1><p>${esc(c.description)}</p>${c.outcomes?.length ? `<h2>What you will learn</h2><ul>${c.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}${c.modules.map((m) => {
        const ls = m.lessons.filter((l) => available(t, c, l));
        return ls.length ? `<h2>${esc(m.title)}</h2>${m.description ? `<p>${esc(m.description)}</p>` : ''}${linkList(ls.map((l) => [`/${t.id}/${c.id}/${l.id}`, l.title, l.summary]))}` : '';
      }).join('')}<p><a href="/cheatsheet/${t.id}/${c.id}">${esc(c.title)} cheat sheet</a></p>`,
    });
    add({
      path: `/cheatsheet/${t.id}/${c.id}`, title: `${c.title} cheat sheet · ${site.name}`, description: clip(`Every ${c.title} lesson's key takeaways on one printable page. ${c.description}`, 160), index: true,
      crumbs: [[t.title, `/${t.id}`], [c.title, `/${t.id}/${c.id}`], ['Cheat sheet', `/cheatsheet/${t.id}/${c.id}`]],
      html: `<h1>${esc(c.title)} cheat sheet</h1>${linkList(lessons.map((l) => [`/${t.id}/${c.id}/${l.id}`, l.title, l.summary]))}`,
    });
    lessons.forEach((l, i) => {
      const file = join(root, 'src/content', t.id, c.id, `${l.id}.mdx`);
      const o = lessonOutline(file);
      const locked = l.level === 'Advanced';          // Premium: free readers see the outline (src/config/access.js)
      const prev = lessons[i - 1];
      const next = lessons[i + 1];
      const body = locked
        ? `<p>${esc(l.summary)}</p><p>This is an Advanced lesson, part of Premium. What it covers:</p><ul>${o.sections.map((s) => `<li>${esc(s.title)}</li>`).join('')}</ul>`
        : `<p><strong>${esc(l.summary)}</strong></p>${o.intro.map((p) => `<p>${esc(p)}</p>`).join('')}${o.sections.map((s) => {
          // the lesson's own interview-questions section lists the questions; otherwise they get one at the end
          const qs = /interview questions/i.test(s.title) && o.questions.length ? `<ul>${o.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>` : '';
          return `<h2>${esc(s.title)}</h2>${s.text ? `<p>${esc(s.text)}</p>` : ''}${qs}`;
        }).join('')}${o.questions.length && !o.sections.some((s) => /interview questions/i.test(s.title)) ? `<h2>Interview questions</h2><ul>${o.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}${o.takeaways.length ? `<h2>Key takeaways</h2><ul>${o.takeaways.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}`;
      add({
        path: `/${t.id}/${c.id}/${l.id}`,
        title: `${l.title} · ${c.shortTitle ?? c.title} · ${site.name}`,
        description: clip(l.summary, 160),
        index: true,
        lastmod: gitDate(file),
        crumbs: [[t.title, `/${t.id}`], [c.title, `/${t.id}/${c.id}`], [l.title, `/${t.id}/${c.id}/${l.id}`]],
        article: { headline: l.title, section: `${c.title}: ${l.module.title}`, minutes: l.minutes, level: l.level },
        html: `<h1>${esc(l.title)}</h1><p>${esc(l.level)} · ${esc(l.minutes)} min read · ${esc(c.title)}, ${esc(l.module.title)}</p>${body}<p>${prev ? `<a href="/${t.id}/${c.id}/${prev.id}">Previous: ${esc(prev.title)}</a>` : ''}${prev && next ? ' · ' : ''}${next ? `<a href="/${t.id}/${c.id}/${next.id}">Next: ${esc(next.title)}</a>` : ''}</p>`,
      });
    });
  }
}

// problems: Premium pages, so only what a signed-out visitor sees (title, level, pattern, the Premium note)
const lessonTitles = Object.fromEntries(dsa.courses.find((c) => c.id === 'patterns').modules.flatMap((m) => m.lessons.map((l) => [l.id, l.title])));
for (const file of readdirSync(join(root, 'src/data/problems')).filter((f) => f.endsWith('.json') && !['index.json', 'meta.json'].includes(f))) {
  for (const p of JSON.parse(readFileSync(join(root, 'src/data/problems', file), 'utf8'))) {
    const pattern = lessonTitles[p.lesson] ?? p.lesson;
    add({
      path: `/solve/${p.slug}`,
      title: `${p.title} (${p.level}) · ${pattern} · ${site.name}`,
      description: clip(`${p.title}, a ${p.level.toLowerCase()} ${pattern} problem: solve it with tests in Java, C++, Python or JavaScript, with hints and worked solutions from brute force to optimal.`, 160),
      crumbs: [['Problems', '/problems'], [p.title, `/solve/${p.slug}`]],
      html: `<h1>${esc(p.title)}</h1><p>${esc(p.level)} · ${esc(pattern)}</p><p>Solve with tests in Java, C++, Python or JavaScript, with hints and a worked solution for every approach. Solving problems with tests is part of Premium.</p><p><a href="/dsa/patterns/${p.lesson}">Learn the ${esc(pattern)} pattern</a> · <a href="/premium">Premium</a></p>`,
    });
  }
}

// company guides: Premium as well
for (const c of COMPANIES) {
  const plan = companyPlan(c.id);
  add({
    path: `/companies/${c.id}`,
    title: `How ${c.name} interviews software engineers · ${site.name}`,
    description: clip(`${c.name} interview process for software engineers in India: ${plan.styleLabel.toLowerCase()} rounds, what to practise and how AI tools are treated.`, 160),
    crumbs: [['Companies', '/companies'], [c.name, `/companies/${c.id}`]],
    html: `<h1>How ${esc(c.name)} interviews</h1><p>${esc(plan.styleLabel)}. ${esc(plan.summary)}</p><p>The full guide (rounds, what to practise, the AI policy and a study plan in ${esc(c.name)}'s style) is part of Premium.</p>`,
  });
}

// fixed pages
const FIXED = [
  ['/premium', 'Premium', 'Everything in ByteCodeBrew: advanced lessons, simulations, 390 problems with tests, mock interviews, the Daily Coach, Runway study plans and Climb ratings.', true],
  ['/contact', 'Contact us', `Questions about ${site.name}, Premium or your account: how to reach us.`, true],
  ['/terms', 'Terms & Conditions', `The terms for using ${site.name}.`, true],
  ['/privacy', 'Privacy Policy', `What ${site.name} stores about you and why.`, true],
  ['/refund-policy', 'Refund & Cancellation', `${site.name}'s refund and cancellation policy.`, true],
  ['/delivery-policy', 'Delivery Policy', `How ${site.name} Premium is delivered.`, true],
  ['/problems', 'Problems', '390 interview problems by pattern, with tests in Java, C++, Python and JavaScript, hints and worked solutions.', false],
  ['/companies', 'Companies', 'How the best-paying tech companies in India interview software engineers.', false],
  ['/companies/ai-assisted-round', 'The AI-assisted debugging round', 'What the AI-assisted coding round looks like and how to practise it.', false],
  ['/mock', 'Mock interview', 'Timed DSA, system design, LLD and behavioral mock interviews.', false],
  ['/runway', 'Runway', 'A day-by-day interview plan that re-plans itself around what you did.', false],
  ['/climb', 'Climb', 'Rated problem solving: problems picked at your level, against the clock.', false],
  ['/playground', 'Code playground', 'Run Java in the browser.', false],
  // personal pages: no point in search results
  ['/today', 'Today', 'Your day: plan and Daily Coach.', false, true],
  ['/dashboard', 'Dashboard', 'Your streak, progress and LeetCode sync.', false, true],
  ['/review', 'Review', 'Your spaced-repetition review deck.', false, true],
  ['/highlights', 'My highlights', 'Your highlights and notes.', false, true],
  ['/settings', 'Settings', 'Your settings.', false, true],
];
for (const [path, label, description, index, noindex] of FIXED) {
  add({ path, title: `${label} · ${site.name}`, description, index, noindex, crumbs: [[label, path]], html: `<h1>${esc(label)}</h1><p>${esc(description)}</p>` });
}

// ---- write

const STYLE = '<style>.seo-static{max-width:760px;margin:0 auto;padding:32px 20px 64px;font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1d2a29}.seo-static a{color:#1f6f6b}.seo-static nav{font-size:14px;margin-bottom:16px}.seo-static p{margin:0 0 12px}.seo-static h1{margin:0 0 8px;line-height:1.2}.seo-static h2{margin:28px 0 8px;line-height:1.3}.seo-static ul{margin:0 0 12px;padding-left:22px}@media (prefers-color-scheme:dark){.seo-static{color:#e4ecea}.seo-static a{color:#7fd1c9}}</style>';

function jsonLd(p) {
  const org = { '@type': 'Organization', '@id': `${ORIGIN}/#org`, name: site.name, url: `${ORIGIN}/`, logo: `${ORIGIN}/favicon.svg`, sameAs: site.social.map((s) => s.url) };
  const graph = [];
  if (p.home) graph.push(org, { '@type': 'WebSite', '@id': `${ORIGIN}/#site`, name: site.name, url: `${ORIGIN}/`, description: p.description, publisher: { '@id': `${ORIGIN}/#org` }, inLanguage: 'en' });
  if (p.crumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [['Home', '/'], ...p.crumbs].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${ORIGIN}${path}` })),
    });
  }
  if (p.article) {
    graph.push({
      '@type': 'Article', headline: p.article.headline, description: p.description, articleSection: p.article.section,
      ...(p.lastmod ? { dateModified: p.lastmod } : {}), timeRequired: `PT${p.article.minutes}M`, educationalLevel: p.article.level,
      isAccessibleForFree: p.article.level !== 'Advanced', image: IMAGE, inLanguage: 'en',
      mainEntityOfPage: `${ORIGIN}${p.path}`, author: { '@id': `${ORIGIN}/#org` }, publisher: { '@id': `${ORIGIN}/#org` },
    });
    if (!graph.some((g) => g['@type'] === 'Organization')) graph.push(org);
  }
  return graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>` : '';
}

function render(p) {
  const url = `${ORIGIN}${p.path === '/' ? '/' : p.path}`;
  const head = [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    p.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:type" content="${p.article ? 'article' : 'website'}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${IMAGE}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="bcb-route" content="${esc(p.path)}" />`,
    jsonLd(p),
    STYLE,
  ].filter(Boolean).join('\n    ');
  let html = template
    .replace(/<title>[^<]*<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace(/<meta property="og:[a-z:]+"[^>]*>\s*/g, '');
  if (!html.includes('</head>') || !html.includes('<div id="root"></div>')) throw new Error('dist/index.html is not the expected template');
  html = html.replace('</head>', `  ${head}\n  </head>`);
  const body = `<div class="seo-static">${p.crumbs ? crumbsHtml(p.crumbs) : ''}<main>${p.html}</main></div>`;
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const write = (rel, text) => {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
};

// 404.html: the bare app (unknown paths, planned lessons), kept out of search results
const notFound = template
  .replace(/<meta property="og:url"[^>]*>\s*/, '')
  .replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>');
writeFileSync(join(DIST, '404.html'), notFound);

const paths = new Set(pages.map((p) => p.path));
const seen = new Set();
for (const p of pages) {
  if (seen.has(p.path)) throw new Error(`two pages for ${p.path}`);
  seen.add(p.path);
  const html = render(p);
  if (p.path === '/') { write('index.html', html); continue; }
  const rel = p.path.slice(1);
  write(`${rel}.html`, html);
  // a path that is also a folder (/dsa, /dsa/patterns, /companies): GitHub Pages may answer /dsa with
  // a redirect to /dsa/, so that has a file too
  if ([...paths].some((q) => q.startsWith(`${p.path}/`))) write(`${rel}/index.html`, html);
}

const indexed = pages.filter((p) => p.index && !p.noindex);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map((p) => `  <url><loc>${ORIGIN}${p.path === '/' ? '/' : p.path}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin
Disallow: /settings
Disallow: /dashboard
Disallow: /today
Disallow: /review
Disallow: /highlights

Sitemap: ${ORIGIN}/sitemap.xml
`);
if (!existsSync(join(DIST, 'og.png'))) copyFileSync(join(root, 'public/og.png'), join(DIST, 'og.png'));

const count = (pred) => pages.filter(pred).length;
console.log(`✓ SEO: ${pages.length} pages (${count((p) => p.article)} lessons, ${count((p) => p.path.startsWith('/solve/'))} problems, ${count((p) => /^\/companies\/(?!ai-)/.test(p.path))} companies), ${indexed.length} in sitemap.xml, robots.txt`);
