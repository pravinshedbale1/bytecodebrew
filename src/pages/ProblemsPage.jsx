import { useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import {
  ExternalLink, Info, Download, Search, BarChart3, ListPlus, ArrowLeft, ArrowUp, ArrowDown, X, Pencil, Trash2, Check, Plus, Bookmark,
} from 'lucide-react';
import ladderData from 'virtual:dsa-ladders';
import { PremiumPage } from '../components/access/PremiumPage';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { SolvedToggle } from '../components/mdx/SolvedToggle';
import { AddToList } from '../components/solve/AddToList';
import { dsa } from '../curriculum/tracks/dsa';
import { useSolved } from '../hooks/useSolved';
import {
  useProblemLists, createList, renameList, deleteList, toggleInList, removeFromList, moveInList, MAX_NAME, MAX_LISTS,
} from '../hooks/useProblemLists';
import { hasProblem } from '../lib/judge/problems';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './ProblemsPage.module.css';

const LEVELS = ['Easy', 'Medium', 'Hard'];
const SOURCE_SHORT = { tests: 'tests passed', leetcode: 'on LeetCode', self: 'ticked' };

/** Every ladder problem, in pattern order, once each (a problem can appear in several ladders). */
function allProblems() {
  const course = dsa.courses.find((c) => c.id === 'patterns');
  const seen = new Set();
  const groups = [];
  for (const m of course.modules) {
    for (const l of m.lessons) {
      const problems = (ladderData[l.id] ?? []).filter((p) => !seen.has(p.slug) && seen.add(p.slug));
      if (problems.length) groups.push({ id: l.id, title: l.title, module: m.title, problems });
    }
  }
  return groups;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function ProblemTitle({ p, list }) {
  if (!hasProblem(p.slug)) return <span className={styles.title}>{p.title}</span>;
  return <Link to={`/solve/${p.slug}${list ? `?list=${list}` : ''}`} className={styles.title}>{p.title}</Link>;
}

function LeetCodeLink({ slug }) {
  return (
    <a className={styles.lc} href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noopener noreferrer" title="Open on LeetCode">
      LeetCode <ExternalLink size={11} aria-hidden="true" />
    </a>
  );
}

/** "New list" name field; calls onCreate(id) after creating. */
function NewListForm({ onCreate, autoFocus = false }) {
  const [name, setName] = useState('');
  const { lists } = useProblemLists();
  const full = lists.length >= MAX_LISTS;
  return (
    <form
      className={styles.newList}
      onSubmit={(e) => {
        e.preventDefault();
        const id = createList(name);
        if (id) { setName(''); onCreate?.(id); }
      }}
    >
      <input
        className={ui.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={MAX_NAME}
        placeholder={full ? `You have ${MAX_LISTS} lists, the most allowed` : 'e.g. Graphs to redo, Google week'}
        aria-label="New list name"
        disabled={full}
        autoFocus={autoFocus}
      />
      <button type="submit" className={`${ui.btn} ${ui.primary}`} disabled={!name.trim() || full}>
        <Plus size={15} aria-hidden="true" /> Create list
      </button>
    </form>
  );
}

/** Search, pattern, difficulty and status filters over the grouped problems. */
function useFilters(groups, isSolved) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [pattern, setPattern] = useState('all');
  const q = query.trim().toLowerCase();
  const shown = groups
    .filter((g) => pattern === 'all' || g.id === pattern)
    .map((g) => ({
      ...g,
      problems: g.problems.filter((p) =>
        (level === 'all' || p.level === level) &&
        (status === 'all' || (status === 'solved') === isSolved(p.slug)) &&
        (!q || p.title.toLowerCase().includes(q))),
    }))
    .filter((g) => g.problems.length);
  const count = shown.reduce((n, g) => n + g.problems.length, 0);
  const active = Boolean(query) || level !== 'all' || status !== 'all' || pattern !== 'all';
  const clear = () => { setQuery(''); setLevel('all'); setStatus('all'); setPattern('all'); };

  const controls = (
    <>
      <div className={styles.filters}>
        <div className={styles.filterTop}>
          <label className={styles.search}>
            <Search size={15} aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search problems" aria-label="Search problems by name" />
          </label>
          <select className={`${ui.select} ${styles.pattern}`} value={pattern} onChange={(e) => setPattern(e.target.value)} aria-label="Pattern">
            <option value="all">Every pattern</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel} id="f-level">Difficulty</span>
            <div className={styles.segmented} role="group" aria-labelledby="f-level">
              {['all', ...LEVELS].map((lv) => (
                <button key={lv} type="button" aria-pressed={level === lv} onClick={() => setLevel(lv)}>{lv === 'all' ? 'Any' : lv}</button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel} id="f-status">Status</span>
            <div className={styles.segmented} role="group" aria-labelledby="f-status">
              {[['all', 'All'], ['unsolved', 'Unsolved'], ['solved', 'Solved']].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.count}>
        {plural(count, 'problem')}
        {active && <button type="button" className={styles.clear} onClick={clear}>Clear filters</button>}
      </p>
    </>
  );
  return { shown, count, controls };
}

/** Every problem, grouped by pattern. In pick mode each row ticks the problem into `pickList`. */
function AllProblems({ groups, pickList }) {
  const { isSolved, solvedBy } = useSolved();
  const { shown, count, controls } = useFilters(groups, isSolved);
  const inList = new Set(pickList?.slugs ?? []);

  return (
    <>
      {controls}
      {shown.map((g) => {
        const picked = pickList ? g.problems.filter((p) => inList.has(p.slug)).length : 0;
        return (
          <section key={g.id} className={styles.group}>
            <h2 className={styles.groupTitle}>
              <Link to={`/dsa/patterns/${g.id}`}>{g.title}</Link>
              <span>{pickList ? `${picked} picked · ` : ''}{g.problems.filter((p) => isSolved(p.slug)).length}/{g.problems.length}</span>
            </h2>
            <ul className={styles.list}>
              {g.problems.map((p) => {
                const by = solvedBy(p.slug);
                if (pickList) {
                  const on = inList.has(p.slug);
                  return (
                    <li key={p.slug} className={`${styles.row} ${on ? styles.picked : ''}`}>
                      <button
                        type="button"
                        className={`${styles.pick} ${on ? styles.pickOn : ''}`}
                        aria-pressed={on}
                        aria-label={`${on ? 'Remove' : 'Add'} ${p.title} ${on ? 'from' : 'to'} ${pickList.name}`}
                        onClick={() => toggleInList(pickList.id, p.slug)}
                      >
                        {on ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <Plus size={12} aria-hidden="true" />}
                      </button>
                      <button type="button" className={`${styles.title} ${styles.titleButton}`} onClick={() => toggleInList(pickList.id, p.slug)}>{p.title}</button>
                      {isSolved(p.slug) && <span className={styles.source}>solved</span>}
                      <span className={`${styles.level} ${styles[p.level.toLowerCase()]}`}>{p.level}</span>
                    </li>
                  );
                }
                return (
                  <li key={p.slug} className={styles.row}>
                    <SolvedToggle slug={p.slug} title={p.title} />
                    <ProblemTitle p={p} />
                    {by && <span className={styles.source}>{SOURCE_SHORT[by]}</span>}
                    <span className={`${styles.level} ${styles[p.level.toLowerCase()]}`}>{p.level}</span>
                    <LeetCodeLink slug={p.slug} />
                    <AddToList slug={p.slug} title={p.title} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {count === 0 && <p className={styles.count}>Nothing matches these filters.</p>}
    </>
  );
}

/** "My lists": every list with its progress, and a way to start a new one. */
function ListsOverview({ onOpen, onPick }) {
  const { lists } = useProblemLists();
  const { isSolved } = useSolved();
  return (
    <>
      <div className={styles.listsIntro}>
        <p>Group problems your own way: a revision set, one company's favourites, the ones that beat you. Name a list, then pick problems for it.</p>
        <NewListForm onCreate={onPick} autoFocus={lists.length === 0} />
      </div>
      {lists.length === 0 ? (
        <p className={styles.emptyLists}>
          <Bookmark size={16} aria-hidden="true" /> No lists yet. You can also save a problem from its row on All problems, or from the bookmark beside its title while solving.
        </p>
      ) : (
        <ul className={styles.cards}>
          {lists.map((l) => {
            const solved = l.slugs.filter(isSolved).length;
            const pct = l.slugs.length ? Math.round((solved / l.slugs.length) * 100) : 0;
            return (
              <li key={l.id}>
                <button type="button" className={styles.card} onClick={() => onOpen(l.id)}>
                  <span className={styles.cardName}>{l.name}</span>
                  <span className={styles.cardMeta}>{plural(l.slugs.length, 'problem')} · {solved} solved</span>
                  <span className={styles.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** One list: its problems in the learner's order, with rename, reorder, remove and "add problems". */
function ListDetail({ list, bySlug, onBack, onPick }) {
  const { isSolved, solvedBy } = useSolved();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const problems = list.slugs.map((s) => bySlug.get(s)).filter(Boolean);
  const solved = problems.filter((p) => isSolved(p.slug)).length;
  const next = problems.find((p) => !isSolved(p.slug) && hasProblem(p.slug));

  return (
    <>
      <div className={styles.listHead}>
        <button type="button" className={styles.back} onClick={onBack}><ArrowLeft size={14} aria-hidden="true" /> My lists</button>
        {editing ? (
          <form
            className={styles.rename}
            onSubmit={(e) => { e.preventDefault(); renameList(list.id, name); setEditing(false); }}
          >
            <input className={ui.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_NAME} aria-label="List name" autoFocus />
            <button type="submit" className={`${ui.btn} ${ui.primary} ${ui.small}`} disabled={!name.trim()}>Save</button>
            <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => { setName(list.name); setEditing(false); }}>Cancel</button>
          </form>
        ) : (
          <h2 className={styles.listName}>
            {list.name}
            <button type="button" className={styles.iconBtn} onClick={() => { setName(list.name); setEditing(true); }} aria-label="Rename list" title="Rename">
              <Pencil size={14} aria-hidden="true" />
            </button>
          </h2>
        )}
        <p className={styles.listMeta}>{plural(problems.length, 'problem')} · {solved} solved</p>
        <div className={styles.listActions}>
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={onPick}><ListPlus size={14} aria-hidden="true" /> Add problems</button>
          {next && <Link to={`/solve/${next.slug}?list=${list.id}`} className={`${ui.btn} ${ui.small}`}>Solve next: {next.title}</Link>}
          {confirmDelete ? (
            <span className={styles.confirm}>
              Delete “{list.name}”? The problems stay; only the list goes.
              <button type="button" className={`${ui.btn} ${ui.danger} ${ui.small}`} onClick={() => { deleteList(list.id); onBack(); }}>Delete</button>
              <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setConfirmDelete(false)}>Keep</button>
            </span>
          ) : (
            <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small} ${styles.deleteBtn}`} onClick={() => setConfirmDelete(true)}><Trash2 size={14} aria-hidden="true" /> Delete list</button>
          )}
        </div>
      </div>

      {problems.length === 0 ? (
        <div className={styles.emptyList}>
          <p>This list is empty.</p>
          <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={onPick}><ListPlus size={15} aria-hidden="true" /> Pick problems</button>
        </div>
      ) : (
        <ol className={styles.list}>
          {problems.map((p, i) => {
            const by = solvedBy(p.slug);
            return (
              <li key={p.slug} className={styles.row}>
                <span className={styles.pos}>{i + 1}</span>
                <SolvedToggle slug={p.slug} title={p.title} />
                <ProblemTitle p={p} list={list.id} />
                <span className={styles.patternName}>{p.pattern}</span>
                {by && <span className={styles.source}>{SOURCE_SHORT[by]}</span>}
                <span className={`${styles.level} ${styles[p.level.toLowerCase()]}`}>{p.level}</span>
                <span className={styles.rowTools}>
                  <button type="button" className={styles.iconBtn} disabled={i === 0} onClick={() => moveInList(list.id, p.slug, -1)} aria-label={`Move ${p.title} up`} title="Move up"><ArrowUp size={14} aria-hidden="true" /></button>
                  <button type="button" className={styles.iconBtn} disabled={i === problems.length - 1} onClick={() => moveInList(list.id, p.slug, 1)} aria-label={`Move ${p.title} down`} title="Move down"><ArrowDown size={14} aria-hidden="true" /></button>
                  <button type="button" className={styles.iconBtn} onClick={() => removeFromList(list.id, p.slug)} aria-label={`Remove ${p.title} from ${list.name}`} title="Remove from list"><X size={14} aria-hidden="true" /></button>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

/** /problems — every problem (?view=all), the learner's lists (?view=lists), one list (?list=id), or picking for one (&pick=1). */
function ProblemsPageInner() {
  const groups = useMemo(allProblems, []);
  const bySlug = useMemo(() => new Map(groups.flatMap((g) => g.problems.map((p) => [p.slug, { ...p, pattern: g.title }]))), [groups]);
  const { isSolved, solvedBy } = useSolved();
  const { lists, byId } = useProblemLists();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const listId = params.get('list');
  const list = listId ? byId(listId) : null;
  const picking = Boolean(list) && params.get('pick') === '1';
  const view = list ? 'list' : params.get('view') === 'lists' || listId ? 'lists' : 'all';

  const go = (next) => setParams(next, { replace: false });
  const openList = (id) => go({ list: id });
  const pickFor = (id) => go({ list: id, pick: '1' });
  const showLists = () => go({ view: 'lists' });

  const all = groups.flatMap((g) => g.problems);
  const done = all.filter((p) => isSolved(p.slug));
  const verified = done.filter((p) => solvedBy(p.slug) !== 'self').length;

  const rail = (
    <>
      <RailCard title="Your progress" icon={<BarChart3 size={14} aria-hidden="true" />}>
        <p className={styles.big}>{done.length}<span> / {all.length}</span></p>
        <ul className={styles.levels}>
          {LEVELS.map((lv) => {
            const levelList = all.filter((p) => p.level === lv);
            return <li key={lv}><span className={styles[lv.toLowerCase()]}>{lv}</span> {levelList.filter((p) => isSolved(p.slug)).length}/{levelList.length}</li>;
          })}
        </ul>
        <p className={ui.help}>{verified} verified by tests or LeetCode.</p>
      </RailCard>
      <RailCard title="My lists" icon={<Bookmark size={14} aria-hidden="true" />}>
        {lists.length ? (
          <ul className={styles.railLists}>
            {lists.map((l) => (
              <li key={l.id}>
                <button type="button" aria-current={l.id === listId ? 'true' : undefined} onClick={() => openList(l.id)}>
                  <span>{l.name}</span>
                  <span>{l.slugs.filter(isSolved).length}/{l.slugs.length}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={ui.help} style={{ marginTop: 0 }}>Make your own sets of problems to work through.</p>
        )}
        <button type="button" className={`${ui.btn} ${ui.small}`} style={{ marginTop: 'var(--space-3)' }} onClick={showLists}>
          <Plus size={14} aria-hidden="true" /> New list
        </button>
      </RailCard>
      <RailCard title="The checkmarks" icon={<Info size={14} aria-hidden="true" />}>
        <ul className={styles.legend}>
          <li><span className={`${styles.mark} ${styles.markOn}`} /> Verified: passed all tests here, or accepted on LeetCode</li>
          <li><span className={`${styles.mark} ${styles.markSelf}`} /> Ticked by you</li>
        </ul>
      </RailCard>
      <RailCard title="Solved on LeetCode already?" icon={<Download size={14} aria-hidden="true" />}>
        <p className={ui.help} style={{ marginTop: 0 }}>Import every problem you've solved there in one click.</p>
        <Link to="/dashboard" className={`${ui.btn} ${ui.small}`} style={{ marginTop: 'var(--space-3)' }}>Import from LeetCode</Link>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Practise</p>
        <h1 className={page.title}>Problems</h1>
        <p className={page.lead}>
          Every problem from the DSA pattern ladders, in learning order. Open one to solve it here with starter code and tests;
          passing them all marks it solved. Save any of them to your own lists.
        </p>
      </header>

      {!picking && (
        <div className={styles.tabs} role="tablist" aria-label="Problems view">
          <button type="button" role="tab" aria-selected={view === 'all'} onClick={() => navigate('/problems')}>All problems</button>
          <button type="button" role="tab" aria-selected={view !== 'all'} onClick={showLists}>
            My lists{lists.length > 0 && <span className={styles.tabCount}>{lists.length}</span>}
          </button>
        </div>
      )}

      {picking && (
        <div className={styles.pickBar} role="status">
          <span>
            Picking for <strong>{list.name}</strong> · {plural(list.slugs.length, 'problem')} in the list
          </span>
          <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => openList(list.id)}>
            <Check size={14} aria-hidden="true" /> Done
          </button>
        </div>
      )}

      {picking && <AllProblems groups={groups} pickList={list} />}
      {!picking && view === 'all' && <AllProblems groups={groups} />}
      {!picking && view === 'lists' && (
        <>
          {listId && !list && <p className={styles.count}>That list no longer exists. It may have been deleted on another device.</p>}
          <ListsOverview onOpen={openList} onPick={pickFor} />
        </>
      )}
      {!picking && view === 'list' && (
        <ListDetail key={list.id} list={list} bySlug={bySlug} onBack={showLists} onPick={() => pickFor(list.id)} />
      )}
    </PageLayout>
  );
}

export function ProblemsPage() {
  return (
    <PremiumPage eyebrow="Practise" title="Problems" lead="Every problem from the DSA ladders, solvable here with starter code and tests." feature="Solving problems with tests">
      <ProblemsPageInner />
    </PremiumPage>
  );
}
