import { useState } from 'react';
import { Link } from 'react-router';
import { Bot, Check, X, Info, ExternalLink, Wand2, Clock } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SendToAi } from '../components/ai/SendToAi';
import { AI_ROUND_COMPANIES, SCORED, PLAYBOOK, DO_DONT, MISTAKES, PRACTICE, PROMPTS, REFERENCES } from '../data/aiRound';
import page from './Page.module.css';
import styles from './AiRoundPage.module.css';

const LANGUAGES = ['Java', 'Python', 'C++', 'JavaScript', 'Go'];
const fill = (prompt, language, company) => prompt.replaceAll('{LANGUAGE}', language).replaceAll('{COMPANY}', company);

/** /companies/ai-assisted-round: the AI-assisted debugging round, how to do it and how to practise it. */
export function AiRoundPage() {
  const [language, setLanguage] = useState('Java');
  const [company, setCompany] = useState('Amazon');
  return (
    <PageLayout contentWidth="900px">
      <header className={page.header}>
        <p className={page.eyebrow}><Link to="/companies">Companies</Link> · Interview guide</p>
        <h1 className={page.title}>The AI-assisted debugging round</h1>
        <p className={page.lead}>
          You get an unfamiliar codebase, failing tests and an AI assistant. Your job is to find and fix the bugs, and
          to show how you work with the AI, not how well you prompt it. Amazon, Meta and Google now run versions of it.
        </p>
      </header>

      <nav className={styles.toc} aria-label="On this page">
        {[['where', 'Where you meet it'], ['scored', 'What is scored'], ['playbook', 'Playbook'], ['assistant', 'Using the assistant'], ['practice', 'How to practise'], ['prompts', 'LLM prompts'], ['references', 'References']].map(([id, label]) => (
          <a key={id} href={`#${id}`}>{label}</a>
        ))}
      </nav>

      <section id="where" className={styles.section}>
        <h2 className={styles.h2}>Where you'll meet it</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Company</th><th>Stage</th><th>What it looks like</th></tr></thead>
            <tbody>
              {AI_ROUND_COMPANIES.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/companies/${c.id}`}>{c.name}</Link><span className={c.confirmed ? styles.confirmed : styles.reported}>{c.confirmed ? 'Confirmed' : 'Reported'}</span></td>
                  <td>{c.stage}</td>
                  <td>{c.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}><Info size={13} aria-hidden="true" /> "Confirmed" means the company has said so publicly; the rest come from candidate reports. Formats change, so read your invitation carefully: it is the real specification.</p>
      </section>

      <section id="scored" className={styles.section}>
        <h2 className={styles.h2}>What interviewers score</h2>
        <div className={styles.cards}>
          {SCORED.map(([title, text]) => (
            <div key={title} className={styles.card}>
              <h3><Check size={15} aria-hidden="true" /> {title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="playbook" className={styles.section}>
        <h2 className={styles.h2}>A playbook for a 60-minute session</h2>
        <ol className={styles.playbook}>
          {PLAYBOOK.map((p, i) => (
            <li key={p.step}>
              <span className={styles.stepNo}>{i + 1}</span>
              <div>
                <h3>{p.step} <span className={styles.time}><Clock size={12} aria-hidden="true" /> {p.time}</span></h3>
                <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="assistant" className={styles.section}>
        <h2 className={styles.h2}>Using the assistant well</h2>
        <div className={styles.doDont}>
          <div className={styles.do}>
            <h3><Check size={15} aria-hidden="true" /> Do</h3>
            <ul>{DO_DONT.do.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className={styles.dont}>
            <h3><X size={15} aria-hidden="true" /> Don't</h3>
            <ul>{DO_DONT.dont.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
        <h3 className={styles.h3}>Common mistakes</h3>
        <ul className={styles.mistakes}>{MISTAKES.map((m) => <li key={m}>{m}</li>)}</ul>
      </section>

      <section id="practice" className={styles.section}>
        <h2 className={styles.h2}>How to practise</h2>
        <p className={styles.sectionLead}>The real round runs on the company's platform with its own assistant, so it can't be recreated exactly here. These four ways get you close.</p>
        <div className={`${styles.cards} ${styles.twoUp}`}>
          {PRACTICE.map((p) => (
            <div key={p.title} className={styles.card}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        <p className={styles.related}>
          The same skills help in other rounds: <Link to="/mock?type=machine">machine coding mocks</Link>, reading unfamiliar code in
          the <Link to="/problems">problems</Link>, and <Link to="/dsa/playbook/interview-communication">solving out loud</Link>.
        </p>
      </section>

      <section id="prompts" className={styles.section}>
        <h2 className={styles.h2}>Learn it with an LLM</h2>
        <p className={styles.sectionLead}>Ready-made prompts. Each opens in ChatGPT, Claude or Gemini with the prompt filled in (Gemini: paste it).</p>
        <div className={styles.promptOptions}>
          <label>
            <span>Language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select>
          </label>
          <label>
            <span>Interview style</span>
            <select value={company} onChange={(e) => setCompany(e.target.value)}>{AI_ROUND_COMPANIES.map((c) => <option key={c.id}>{c.name}</option>)}</select>
          </label>
        </div>
        <div className={styles.prompts}>
          {PROMPTS.map((p, i) => (
            <article key={p.id} className={`${styles.prompt} ${p.id === 'practice' ? styles.promptMain : ''}`}>
              <div className={styles.promptHead}>
                <span className={styles.promptNo}>{i + 1}</span>
                <div>
                  <h3>{p.title}{p.id === 'practice' && <span className={styles.best}><Wand2 size={12} aria-hidden="true" /> Closest to the real round</span>}</h3>
                  <p>{p.use}</p>
                </div>
              </div>
              <SendToAi prompt={fill(p.prompt, language, company)} verb="Open in" compact />
            </article>
          ))}
        </div>
      </section>

      <section id="references" className={styles.section}>
        <h2 className={styles.h2}>References</h2>
        <ul className={styles.refs}>
          {REFERENCES.map((r) => (
            <li key={r.url}>
              <span className={styles.refKind}>{r.kind}</span>
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title} <ExternalLink size={12} aria-hidden="true" /></a>
            </li>
          ))}
        </ul>
        <p className={styles.note}><Bot size={13} aria-hidden="true" /> Last checked October 2026.</p>
      </section>
    </PageLayout>
  );
}
