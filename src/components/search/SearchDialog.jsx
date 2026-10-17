import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, FileText, Hash, MessageCircleQuestion, LayoutDashboard, CornerDownLeft, Code2 } from 'lucide-react';
import ladderData from 'virtual:dsa-ladders';
import { tracks, getCourseLessons } from '../../curriculum';
import { hasProblem } from '../../lib/judge/problems';
import styles from './SearchDialog.module.css';

/**
 * Site search (⌘K / Ctrl+K, or "/"). Lessons and pages are searchable at once; section headings and
 * interview questions load with the first open (a small build-time index, see build/content-plugin.js).
 */
export const openSearch = () => window.dispatchEvent(new Event('bcb:search'));

const PAGES = [
  { title: 'Dashboard', sub: 'Streak, heatmap, daily plan, LeetCode', path: '/dashboard' },
  { title: 'Problems', sub: 'Every practice problem, solvable here with tests', path: '/problems' },
  { title: 'Review', sub: 'Spaced-repetition cards due today', path: '/review' },
  { title: 'Mock interview', sub: 'Timed DSA, HLD, LLD and behavioral rounds', path: '/mock' },
  { title: 'Code playground', sub: 'Run Java in the browser', path: '/playground' },
  { title: 'My highlights', sub: 'Highlights and notes', path: '/highlights' },
];

function baseEntries() {
  const out = PAGES.map((p) => ({ ...p, type: 'page' }));
  for (const t of tracks) {
    for (const c of t.courses) {
      for (const l of getCourseLessons(t.id, c.id)) {
        if (!l.available) continue;
        out.push({
          type: 'lesson',
          key: l.key,
          title: l.title,
          sub: `${c.shortTitle ?? c.title} · ${l.moduleTitle}`,
          extra: l.summary,
          path: l.path,
        });
      }
    }
  }
  const seen = new Set();
  for (const p of Object.values(ladderData).flat()) {
    if (seen.has(p.slug) || !hasProblem(p.slug)) continue;
    seen.add(p.slug);
    out.push({ type: 'problem', title: p.title, sub: `${p.level} · solve with tests`, path: `/solve/${p.slug}` });
  }
  return out;
}

function detailEntries(index, lessons) {
  const byKey = new Map(lessons.filter((e) => e.type === 'lesson').map((e) => [e.key, e]));
  const out = [];
  for (const [key, { headings, questions }] of Object.entries(index)) {
    const lesson = byKey.get(key);
    if (!lesson) continue;
    for (const h of headings) out.push({ type: 'section', title: h.text, sub: lesson.title, path: `${lesson.path}#${h.id}` });
    for (const q of questions) out.push({ type: 'question', title: q, sub: lesson.title, path: lesson.path });
  }
  return out;
}

/** Edit distance between a and b, giving up early once it exceeds max. */
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** A word in text within one typo (two for long words) of token, e.g. "consistant" → "consistent". */
function nearWord(token, text) {
  if (token.length < 4) return false;
  const max = token.length >= 8 ? 2 : 1;
  return text.split(/[^a-z0-9]+/).some((w) => w.length >= 3 && distance(token, w.slice(0, token.length + max), max) <= max);
}

/** Typo-tolerant score, used only when the exact search finds nothing. */
function fuzzyScore(entry, tokens) {
  const title = entry.title.toLowerCase();
  const rest = `${entry.sub} ${entry.extra ?? ''}`.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (title.includes(t)) s += 3;
    else if (nearWord(t, title)) s += 2;
    else if (rest.includes(t) || nearWord(t, rest)) s += 1;
    else return 0;
  }
  return s + TYPE_BONUS[entry.type];
}

const TYPE_BONUS = { page: 4, lesson: 3, problem: 2, section: 1, question: 0 };

function score(entry, tokens, phrase) {
  const title = entry.title.toLowerCase();
  const rest = `${entry.sub} ${entry.extra ?? ''}`.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (title.startsWith(t)) s += 6;
    else if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(title)) s += 4;
    else if (title.includes(t)) s += 2;
    else if (rest.includes(t)) s += 1;
    else return 0;
  }
  if (phrase.length > 2 && title.includes(phrase)) s += 5;
  return s + TYPE_BONUS[entry.type];
}

const ICONS = { page: LayoutDashboard, lesson: FileText, problem: Code2, section: Hash, question: MessageCircleQuestion };
const TYPE_LABEL = { page: 'Page', lesson: 'Lesson', problem: 'Problem', section: 'Section', question: 'Interview question' };

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [details, setDetails] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const base = useMemo(baseEntries, []);

  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('bcb:search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('bcb:search', onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (open && !details) import('virtual:search-index').then((m) => setDetails(detailEntries(m.default, base)));
  }, [open, details, base]);

  const results = useMemo(() => {
    const phrase = query.trim().toLowerCase();
    if (!phrase) return [];
    const tokens = phrase.split(/\s+/);
    const all = details ? [...base, ...details] : base;
    const rank = (fn) => all.map((e) => ({ e, s: fn(e) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 30).map((x) => x.e);
    const exact = rank((e) => score(e, tokens, phrase));
    return exact.length ? exact : rank((e) => fuzzyScore(e, tokens));
  }, [query, base, details]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (entry) => {
    setOpen(false);
    navigate(entry.path);
  };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) go(results[active]);
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Search">
        <div className={styles.inputRow}>
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, problems, sections and interview questions…"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results.length ? `search-${active}` : undefined}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        {query.trim() && (
          <ul className={styles.results} id="search-results" role="listbox" ref={listRef}>
            {results.length === 0 && <li className={styles.empty}>No matches for “{query.trim()}”.</li>}
            {results.map((r, i) => {
              const Icon = ICONS[r.type];
              return (
                <li
                  key={`${r.type}:${r.path}:${r.title}`}
                  id={`search-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  className={`${styles.result} ${i === active ? styles.active : ''}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(r)}
                >
                  <Icon size={16} className={styles.icon} aria-hidden="true" />
                  <span className={styles.text}>
                    <span className={styles.title}>{r.title}</span>
                    <span className={styles.sub}>{TYPE_LABEL[r.type]} · {r.sub}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} className={styles.enter} aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
        )}
        {!query.trim() && (
          <p className={styles.hint}>
            Try “consistent hashing”, “sliding window”, “observer” or “conflict with manager”. Use ↑ ↓ and Enter.
          </p>
        )}
      </div>
    </div>
  );
}
