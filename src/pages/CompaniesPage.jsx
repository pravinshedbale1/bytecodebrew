import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Building2, Search, PlaneTakeoff, Timer, MessageSquare, Bot, Check, Info } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { PremiumPage } from '../components/access/PremiumPage';
import { NotFoundPage } from './NotFoundPage';
import { getCourseLessons } from '../curriculum';
import { COMPANIES, GROUPS, STYLES, AI_LABEL, CHECKED, companyPlan } from '../data/companies';
import { MOCK_TYPES } from '../data/mockInterviews';
import { parseDay } from '../lib/dates';
import page from './Page.module.css';
import styles from './CompaniesPage.module.css';

const checkedOn = parseDay(CHECKED).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const LIST_LEAD = 'The rounds, the AI rules and what to practise for the 50 best-paying companies for software engineers in India, and a Runway plan shaped like each one.';

/** /companies (Premium): how the 50 best-paying companies in India interview, grouped and searchable. */
export function CompaniesPage() {
  return (
    <PremiumPage eyebrow="Companies" title="How top companies interview" lead={LIST_LEAD} feature="Company interview guides">
      <CompaniesList />
    </PremiumPage>
  );
}

function CompaniesList() {
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const shown = COMPANIES.filter((c) => (group === 'all' || c.group === group) && c.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <PageLayout>
      <header className={page.header}>
        <p className={page.eyebrow}>Companies</p>
        <h1 className={page.title}>How top companies interview</h1>
        <p className={page.lead}>{LIST_LEAD}</p>
      </header>

      <Link to="/companies/ai-assisted-round" className={styles.aiBanner}>
        <Bot size={20} aria-hidden="true" />
        <span>
          <strong>New in 2026: the AI-assisted debugging round</strong>
          <span>Amazon, Meta, Google and others now hand you a codebase and an AI assistant. How it works and how to practise.</span>
        </span>
        <span className={styles.aiBannerGo}>Read the guide →</span>
      </Link>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={15} aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" aria-label="Search companies" />
        </label>
        <div className={styles.groups} role="group" aria-label="Company type">
          {['all', ...GROUPS].map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>{g === 'all' ? 'All' : g}</button>
          ))}
        </div>
      </div>

      <ul className={styles.grid}>
        {shown.map((c) => (
          <li key={c.id}>
            <Link to={`/companies/${c.id}`} className={styles.card}>
              <span className={styles.cardTop}>
                <span className={styles.logo} aria-hidden="true">{c.name[0]}</span>
                <span className={styles.cardName}>{c.name}</span>
              </span>
              <span className={styles.cardStyle}>{STYLES[c.style].label}</span>
              <span className={styles.cardMeta}>
                <span className={`${styles.ai} ${styles[`ai_${c.ai}`]}`}>{AI_LABEL[c.ai]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length && <p className={styles.empty}>No company matches “{q}”.</p>}

      <section className={styles.stylesSection}>
        <h2 className={styles.h2}>Six interview styles</h2>
        <p className={styles.sectionLead}>Most companies interview in one of these six ways. Knowing the style tells you where to spend your time.</p>
        <div className={styles.styleGrid}>
          {Object.entries(STYLES).map(([id, s]) => (
            <div key={id} className={styles.styleCard}>
              <h3>{s.label}</h3>
              <p>{s.summary}</p>
              <p className={styles.styleCount}>{COMPANIES.filter((c) => c.style === id).length} companies</p>
            </div>
          ))}
        </div>
      </section>

      <p className={styles.fine}>
        <Info size={13} aria-hidden="true" /> Built from public candidate reports, company statements and Levels.fyi pay data, last checked {checkedOn}.
        Interview formats change and differ by team and level, so confirm the rounds with your recruiter.
      </p>
    </PageLayout>
  );
}

/** /companies/:companyId (Premium): one company's rounds, what to practise and a plan. */
export function CompanyPage() {
  const { companyId } = useParams();
  const c = companyPlan(companyId);
  if (!c) return <NotFoundPage />;
  return (
    <PremiumPage eyebrow={`Companies · ${c.group}`} title={`How ${c.name} interviews`} lead={c.summary} feature={`The ${c.name} interview guide`}>
      <CompanyDetail c={c} />
    </PremiumPage>
  );
}

function CompanyDetail({ c }) {
  const patterns = useMemo(() => Object.fromEntries(getCourseLessons('dsa', 'patterns').map((l) => [l.id, l])), []);
  const mocks = [...new Set(c.mocks)];
  return (
    <PageLayout contentWidth="900px">
      <header className={page.header}>
        <p className={page.eyebrow}><Link to="/companies">Companies</Link> · {c.group}</p>
        <h1 className={page.title}>How {c.name} interviews</h1>
        <p className={page.lead}>{c.summary}</p>
        <div className={styles.facts}>
          <span><Building2 size={14} aria-hidden="true" /> {c.styleLabel}</span>
          <span className={`${styles.ai} ${styles[`ai_${c.ai}`]}`}><Bot size={14} aria-hidden="true" /> {AI_LABEL[c.ai]}</span>
          <span>{c.sourced ? `From 2025–26 reports · checked ${checkedOn}` : 'Based on similar companies'}</span>
        </div>
      </header>

      <div className={styles.detail}>
        <div className={styles.main}>
          {c.notes && (
            <section className={`${styles.block} ${styles.tips}`}>
              <h2 className={styles.h3}>Good to know</h2>
              <p>{c.notes}</p>
            </section>
          )}

          {c.aiNote && (
            <section className={styles.block}>
              <h2 className={styles.h3}><Bot size={16} aria-hidden="true" className={styles.h3Icon} /> AI in the interview</h2>
              <p className={styles.aiText}>{c.aiNote}</p>
              {c.aiRound && (
                <p className={styles.aiText}>
                  How to prepare: <Link to="/companies/ai-assisted-round">the AI-assisted debugging round guide</Link>, with a playbook
                  and ready-made LLM prompts for practice sessions.
                </p>
              )}
            </section>
          )}

          <section className={styles.block}>
            <h2 className={styles.h3}>The rounds</h2>
            {c.rounds ? (
              <ol className={styles.rounds}>
                {c.rounds.map((r, i) => <li key={r}><span>{i + 1}</span>{r}</li>)}
              </ol>
            ) : (
              <>
                <p className={styles.note}>We haven't verified {c.name}'s current loop yet. Companies like it usually run this format:</p>
                <p className={styles.styleSummary}>{c.summary}</p>
              </>
            )}
          </section>

          <section className={styles.block}>
            <h2 className={styles.h3}>What to practise</h2>
            <ul className={styles.practise}>
              {c.practise.map((p) => <li key={p}><Check size={15} aria-hidden="true" /> {p}</li>)}
            </ul>
          </section>

          <section className={styles.block}>
            <h2 className={styles.h3}>DSA patterns to put first</h2>
            <div className={styles.chips}>
              {c.focus.filter((id) => patterns[id]?.available).map((id) => (
                <Link key={id} to={patterns[id].path} className={styles.chip}>{patterns[id].title}</Link>
              ))}
            </div>
          </section>

          <section className={styles.block}>
            <h2 className={styles.h3}>Mock rounds to run</h2>
            <div className={styles.mocks}>
              {mocks.map((m) => (
                <Link key={m} to={`/mock?type=${m}`} className={styles.mock}>
                  <Timer size={16} aria-hidden="true" />
                  <span><strong>{MOCK_TYPES[m].title}</strong><span>{MOCK_TYPES[m].minutes} min</span></span>
                </Link>
              ))}
              {c.behavioral && (
                <Link to={c.behavioral} className={styles.mock}>
                  <MessageSquare size={16} aria-hidden="true" />
                  <span><strong>{c.name}'s behavioral round</strong><span>Lesson</span></span>
                </Link>
              )}
            </div>
          </section>
        </div>

        <aside className={styles.cta}>
          <PlaneTakeoff size={22} aria-hidden="true" />
          <h2>Plan your runway for {c.name}</h2>
          <p>A day-by-day plan with {c.name}'s focus patterns first, its mock rounds and the right mix of DSA, design and behavioral, fitted to your days and hours.</p>
          <Link to={`/runway?company=${c.id}`} className={styles.ctaBtn}>Plan for {c.name}</Link>
        </aside>
      </div>

      <p className={styles.fine}>
        <Info size={13} aria-hidden="true" /> Formats change and differ by team, level and country. Use this as a guide and confirm the rounds with your recruiter.
      </p>
    </PageLayout>
  );
}
