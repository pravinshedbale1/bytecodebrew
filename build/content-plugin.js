import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import { toHast } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';

/**
 * Two virtual modules built from every lesson's MDX source:
 *
 *  `virtual:search-index`   (small, loaded with the search dialog)
 *     { [lessonKey]: { headings: [{ id, text }], questions: [string] } }
 *
 *  `virtual:lesson-extracts` (larger, loaded only by Review and Cheat sheet pages)
 *     { [lessonKey]: { qa: [{ q, a }], practice: [{ id, task, a }], takeaways: html|null } }
 *
 * Heading ids are produced the same way rehype-slug does (github-slugger over the heading text),
 * so search results can deep-link to a section.
 */
const SEARCH = 'virtual:search-index';
const EXTRACTS = 'virtual:lesson-extracts';

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

function walkFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p));
    else if (name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function attr(node, name) {
  const a = node.attributes?.find((x) => x.name === name);
  if (!a) return null;
  if (typeof a.value === 'string') return a.value;
  const raw = a.value?.value;                    // q={"..."} or q={`...`}
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw.replace(/^[`'"]|[`'"]$/g, ''); }
}

function childrenHtml(node) {
  const hast = toHast({ type: 'root', children: node.children ?? [] });
  return toHtml(hast);
}

/** Stable short id for a practice task (same function as src/lib/hash.js). */
export function hashText(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function extract(src) {
  const tree = parser.parse(src);
  const slugger = new GithubSlugger();
  const headings = [];
  const qa = [];
  const practice = [];
  let takeaways = null;

  const visit = (node) => {
    if (node.type === 'heading') {
      const text = toString(node);
      const id = slugger.slug(text);
      if (node.depth === 2 || node.depth === 3) headings.push({ id, text });
      return;
    }
    if (node.type === 'mdxJsxFlowElement') {
      if (node.name === 'QA') {
        const q = attr(node, 'q');
        if (q) qa.push({ q, a: childrenHtml(node) });
        return;
      }
      if (node.name === 'Practice') {
        const task = attr(node, 'task');
        if (task) practice.push({ id: hashText(task), task, a: childrenHtml(node) });
        return;
      }
      if (node.name === 'Takeaways') {
        takeaways = childrenHtml(node);
        return;
      }
    }
    node.children?.forEach(visit);
  };
  visit(tree);
  return { headings, qa, practice, takeaways };
}

export function lessonContent(dir) {
  const root = resolve(dir);
  let cache = null;

  const build = (ctx) => {
    if (cache) return cache;
    const all = {};
    for (const file of walkFiles(root)) {
      ctx?.addWatchFile(file);
      const key = relative(root, file).replace(/\\/g, '/').replace(/\.mdx$/, '');
      try {
        all[key] = extract(readFileSync(file, 'utf8'));
      } catch (e) {
        ctx?.warn(`content-plugin: could not parse ${key}: ${e.message}`);
      }
    }
    cache = all;
    return all;
  };

  return {
    name: 'lesson-content',
    resolveId: (id) => (id === SEARCH || id === EXTRACTS ? '\0' + id : null),
    watchChange(id) {
      if (id.endsWith('.mdx')) cache = null;
    },
    load(id) {
      if (id === '\0' + SEARCH) {
        const all = build(this);
        const out = {};
        for (const [k, v] of Object.entries(all)) out[k] = { headings: v.headings, questions: v.qa.map((x) => x.q) };
        return `export default ${JSON.stringify(out)};`;
      }
      if (id === '\0' + EXTRACTS) {
        const all = build(this);
        const out = {};
        for (const [k, v] of Object.entries(all)) out[k] = { qa: v.qa, practice: v.practice, takeaways: v.takeaways };
        return `export default ${JSON.stringify(out)};`;
      }
      return null;
    },
  };
}
