import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Flame, Target, UserRound, Timer, Database, Download, Trash2 } from 'lucide-react';
import { exportData, deleteAllData } from '../lib/accountData';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { PremiumPage } from '../components/access/PremiumPage';
import { DailyPlan } from '../components/dashboard/DailyPlan';
import { Heatmap } from '../components/dashboard/Heatmap';
import { LeetCodeCard } from '../components/dashboard/LeetCodeCard';
import { LeetCodeImport } from '../components/dashboard/LeetCodeImport';
import { RunwayCard } from '../components/dashboard/RunwayCard';
import { WeakAreas } from '../components/dashboard/WeakAreas';
import { useActivity, streakOf, longestStreak, dayTotal } from '../hooks/useActivity';
import { useProgress } from '../hooks/useProgress';
import { useSolved } from '../hooks/useSolved';
import { useQuizResults, useMocks } from '../hooks/useLearning';
import { useProfile, updateProfile, goalsOf } from '../hooks/useProfile';
import { useAuth, signIn } from '../hooks/useAuth';
import { useDeck } from '../lib/reviewDeck';
import { overallProgress } from '../lib/progressStats';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from '../components/dashboard/Dashboard.module.css';

const SOURCES = [
  { id: 'site', label: 'ByteCodeBrew' },
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'both', label: 'Both' },
];

function DashboardInner() {
  const activity = useActivity();
  const { isComplete } = useProgress();
  const { solved } = useSolved();
  const quizResults = useQuizResults();
  const { mocks } = useMocks();
  const profile = useProfile();
  const { status, user } = useAuth();
  const deck = useDeck();
  const [source, setSource] = useState('site');

  const lcCalendar = profile.leetcode?.username ? profile.leetcode.data?.calendar ?? {} : null;
  useEffect(() => {
    if (!lcCalendar && source !== 'site') setSource('site');
  }, [lcCalendar, source]);

  const siteDays = useMemo(() => Object.fromEntries(Object.entries(activity).map(([d, c]) => [d, dayTotal(c)])), [activity]);
  const heat = useMemo(() => {
    if (source === 'leetcode') return lcCalendar ?? {};
    if (source === 'both') {
      const out = { ...siteDays };
      for (const [d, n] of Object.entries(lcCalendar ?? {})) out[d] = (out[d] ?? 0) + n;
      return out;
    }
    return siteDays;
  }, [source, siteDays, lcCalendar]);

  const overall = overallProgress(isComplete);
  const answers = Object.values(quizResults).flatMap((l) => Object.values(l));
  const accuracy = answers.length ? Math.round((answers.filter((a) => a.first).length / answers.length) * 100) : null;
  const streak = streakOf(activity);
  const firstName = user?.name?.split(' ')[0];

  const rail = (
    <>
      <RailCard title="Profile" icon={<UserRound size={14} aria-hidden="true" />}>
        {status === 'signed-in' ? (
          <div className={styles.who}>
            {user.photo && <img src={user.photo} alt="" referrerPolicy="no-referrer" />}
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        ) : (
          <p className={ui.help}>
            Your dashboard is saved in this browser.{' '}
            {status === 'signed-out' && (
              <>
                <button type="button" className={styles.linkButton} onClick={signIn}>Sign in with Google</button> to sync it across devices.
              </>
            )}
          </p>
        )}
      </RailCard>
      <RailCard title="Daily goals" icon={<Target size={14} aria-hidden="true" />}>
        <GoalsForm goals={goalsOf(profile)} />
      </RailCard>
      <YourDataCard />
      <RailCard title="Mock interviews" icon={<Timer size={14} aria-hidden="true" />}>
        <p className={ui.help} style={{ marginTop: 0 }}>
          {mocks.length ? `${mocks.length} done · last on ${new Date(mocks[0].at).toLocaleDateString()}` : 'None yet.'}
        </p>
        <Link to="/mock" className={`${ui.btn} ${ui.small}`} style={{ marginTop: 'var(--space-3)' }}>Start a mock</Link>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Dashboard</p>
        <h1 className={page.title}>{firstName ? `Hi, ${firstName}.` : 'Your study dashboard'}</h1>
        <p className={page.lead}>Today’s plan, your streak, what to revisit and how your LeetCode practice is going.</p>
      </header>

      <section className={ui.panel}>
        <div className={ui.stats}>
          <div className={ui.stat}>
            <span className={`${ui.statValue} ${styles.streak}`}><Flame size={20} aria-hidden="true" />{streak}</span>
            <span className={ui.statLabel}>day streak · best {longestStreak(activity)}</span>
          </div>
          <div className={ui.stat}>
            <span className={ui.statValue}>{overall.completed}<span className={styles.of}>/{overall.total}</span></span>
            <span className={ui.statLabel}>lessons complete</span>
          </div>
          <div className={ui.stat}>
            <span className={ui.statValue}>{Object.keys(solved).length}</span>
            <span className={ui.statLabel}>problems solved</span>
          </div>
          <div className={ui.stat}>
            <span className={ui.statValue}>{deck ? deck.due.length : '–'}</span>
            <span className={ui.statLabel}>cards due · {deck ? deck.mastered : '–'} mastered</span>
          </div>
          <div className={ui.stat}>
            <span className={ui.statValue}>{accuracy == null ? '–' : `${accuracy}%`}</span>
            <span className={ui.statLabel}>quick checks right first try</span>
          </div>
        </div>
      </section>

      <RunwayCard />

      <div className={styles.columns}>
        <section className={ui.panel}>
          <h2 className={ui.panelTitle}>Today</h2>
          <p className={ui.panelLead}>A small, complete day of practice. Ticks fill in as you go.</p>
          <DailyPlan />
        </section>

        <section className={ui.panel}>
          <h2 className={ui.panelTitle}>Revisit these</h2>
          <p className={ui.panelLead}>Lessons where your answers suggest another pass will pay off.</p>
          <WeakAreas quizzes={deck?.sources.quizzes} />
        </section>
      </div>

      <section className={ui.panel}>
        <div className={styles.panelHeadRow}>
          <div>
            <h2 className={ui.panelTitle}>Activity</h2>
            <p className={ui.panelLead}>Every lesson, quiz, review, practice task, problem and mock counts.</p>
          </div>
          {lcCalendar && (
            <div className={ui.chips} role="group" aria-label="Activity source">
              {SOURCES.map((s) => (
                <button key={s.id} type="button" className={ui.chip} aria-pressed={source === s.id} onClick={() => setSource(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Heatmap data={heat} unit={source === 'leetcode' ? 'submission' : 'activity'} />
      </section>

      <section className={ui.panel}>
        <h2 className={ui.panelTitle}>LeetCode</h2>
        <p className={ui.panelLead}>Connect your username for your stats and calendar, then import every problem you've solved.</p>
        <LeetCodeCard />
        <LeetCodeImport />
      </section>

    </PageLayout>
  );
}

function GoalsForm({ goals }) {
  const fields = [
    { id: 'lessons', label: 'Lessons a day', max: 10 },
    { id: 'problems', label: 'Problems a day', max: 20 },
    { id: 'reviews', label: 'Review cards a day', max: 200 },
  ];
  const set = (id, v) => updateProfile((p) => ({ goals: { ...(p.goals ?? {}), [id]: Math.max(1, Math.min(Number(v) || 1, 200)) } }));
  return (
    <div className={styles.goals}>
      {fields.map((f) => (
        <label key={f.id} className={styles.goal}>
          <span>{f.label}</span>
          <input type="number" min={1} max={f.max} className={ui.input} value={goals[f.id]} onChange={(e) => set(f.id, e.target.value)} />
        </label>
      ))}
    </div>
  );
}

/** Download or erase everything — available to every signed-in or local user, premium or not. */
function YourDataCard() {
  const { status } = useAuth();
  return (
    <RailCard title="Your data" icon={<Database size={14} aria-hidden="true" />}>
      <p className={ui.help} style={{ marginTop: 0 }}>
        Everything you've done here, as one file — or erase it{status === 'signed-in' ? ' from this browser and your account' : ''}.
      </p>
      <div className={ui.row} style={{ marginTop: 'var(--space-3)' }}>
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={exportData}><Download size={13} /> Download</button>
        <button
          type="button"
          className={`${ui.btn} ${ui.ghost} ${ui.small}`}
          onClick={async () => {
            const ok = window.prompt('This erases your progress, solved problems, reviews, quiz results, mocks, stories and highlights' + (status === 'signed-in' ? ' here and in your account' : '') + '. Type DELETE to confirm.');
            if (ok !== 'DELETE') return;
            await deleteAllData();
            window.location.assign('/');
          }}
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </RailCard>
  );
}

export function DashboardPage() {
  return (
    <PremiumPage
      eyebrow="Dashboard"
      title="Your study dashboard"
      lead="Today's plan, your streak, your Runway, weak areas and LeetCode sync."
      feature="The dashboard"
      rail={<YourDataCard />}
    >
      <DashboardInner />
    </PremiumPage>
  );
}
