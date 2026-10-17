import { useState } from 'react';
import { Link } from 'react-router';
import { tracks } from '../../curriculum';
import { useProgress } from '../../hooks/useProgress';
import { useProfile, updateProfile } from '../../hooks/useProfile';
import { countdownPlan } from '../../lib/studyPlan';
import { today, parseDay } from '../../lib/dates';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

const fmt = (key) => parseDay(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** Set an interview date and focus tracks; get the pace needed and a week-by-week reading plan. */
export function Countdown() {
  const profile = useProfile();
  const { isComplete, completedAt } = useProgress();
  const [showAll, setShowAll] = useState(false);
  const focus = profile.focusTracks ?? [];
  const plan = countdownPlan(profile, isComplete, completedAt);

  const toggleTrack = (id) =>
    updateProfile((p) => {
      const cur = p.focusTracks ?? [];
      return { focusTracks: cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id] };
    });

  return (
    <div>
      <div className={styles.cdControls}>
        <div>
          <label className={ui.label} htmlFor="interview-date">Interview date</label>
          <input
            id="interview-date"
            type="date"
            className={`${ui.input} ${styles.dateInput}`}
            min={today()}
            value={profile.interviewDate ?? ''}
            onChange={(e) => updateProfile({ interviewDate: e.target.value || null })}
          />
        </div>
        <div>
          <span className={ui.label}>Focus on</span>
          <div className={ui.chips}>
            {tracks.map((t) => (
              <button key={t.id} type="button" className={ui.chip} aria-pressed={focus.includes(t.id)} onClick={() => toggleTrack(t.id)}>
                {t.title}
              </button>
            ))}
          </div>
          <p className={ui.help}>{focus.length ? 'Only the selected tracks are planned.' : 'No selection plans every track.'}</p>
        </div>
      </div>

      {plan && (
        <div className={styles.cdPlan}>
          {plan.daysLeft < 0 ? (
            <p>That date has passed. Pick your next interview date to plan again.</p>
          ) : (
            <>
              <div className={ui.stats}>
                <div className={ui.stat}>
                  <span className={ui.statValue}>{plan.daysLeft}</span>
                  <span className={ui.statLabel}>days to go</span>
                </div>
                <div className={ui.stat}>
                  <span className={ui.statValue}>{plan.remaining}</span>
                  <span className={ui.statLabel}>of {plan.total} lessons left</span>
                </div>
                <div className={ui.stat}>
                  <span className={ui.statValue}>{plan.remaining ? plan.perDay.toFixed(1) : '—'}</span>
                  <span className={ui.statLabel}>lessons a day needed</span>
                </div>
                <div className={ui.stat}>
                  <span className={`${ui.statValue} ${plan.onTrack ? styles.good : styles.behind}`}>{plan.onTrack ? 'On track' : 'Behind'}</span>
                  <span className={ui.statLabel}>{plan.doneThisWeek} done in the last 7 days</span>
                </div>
              </div>
              {plan.remaining > 0 && (
                <>
                  <p className={ui.help}>The last 3 days are left free for review cards and mock interviews.</p>
                  <ol className={styles.weeks}>
                    {plan.weeks.slice(0, showAll ? undefined : 1).map((w, i) => (
                      <li key={w.start}>
                        <p className={styles.weekHead}>
                          Week {i + 1} <span>from {fmt(w.start)} · {w.lessons.length} lessons</span>
                        </p>
                        <ul className={styles.weekLessons}>
                          {w.lessons.map((l) => (
                            <li key={l.key}>
                              <Link to={l.path}>{l.title}</Link>
                              <span>{l.courseTitle}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                  {plan.weeks.length > 1 && (
                    <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => setShowAll((s) => !s)}>
                      {showAll ? 'Show fewer weeks' : `Show all ${plan.weeks.length} weeks`}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
