import { Link } from 'react-router';
import { Sunrise, ChevronRight } from 'lucide-react';
import { useCoach } from '../../lib/coach/store';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

/** The Daily Coach on the dashboard: today's session at a glance, one click to start or continue. */
export function CoachCard() {
  const { session } = useCoach();
  const drills = session?.drills.length ?? 0;
  const answered = Object.keys(session?.answers ?? {}).length;
  const resolveOpen = Boolean(session?.resolve && !session.resolveResult);
  const started = answered > 0 || Boolean(session?.resolveResult) || Boolean(session?.reviewDone);
  const finished = session && answered >= drills && !resolveOpen;
  const parts = session ? [`${answered}/${drills} drills`, session.resolve ? (session.resolveResult ? 're-solve done' : '1 re-solve') : null, session.stretch ? 'a stretch problem' : null].filter(Boolean) : [];

  return (
    <section className={`${ui.panel} ${styles.coachCard}`}>
      <Sunrise size={20} aria-hidden="true" className={styles.coachIcon} />
      <div>
        <h2 className={ui.panelTitle}>Daily Coach</h2>
        <p className={ui.panelLead}>
          {!session ? 'Today’s 20-minute session, built from your skill map.'
            : finished ? 'Today’s session is done. Your skill map is up to date.'
              : `${session.placement ? 'Your first session: 10 placement drills.' : 'Today:'} ${parts.join(' · ')}.`}
        </p>
      </div>
      <Link to="/today" className={`${ui.btn} ${finished ? '' : ui.primary}`}>
        {finished ? 'See your skill map' : started ? 'Continue' : 'Start today’s session'} <ChevronRight size={14} />
      </Link>
    </section>
  );
}
