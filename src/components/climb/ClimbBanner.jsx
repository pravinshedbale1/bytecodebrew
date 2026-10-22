import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mountain, Flag, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useClimb, startAttempt, finishAttempt } from '../../lib/climb/store';
import { deltaOf } from '../../lib/climb/model';
import { readJSON, writeJSON } from '../../lib/storage';
import { catalog } from '../../lib/coach/catalog';
import ui from '../common/ui.module.css';
import styles from './Climb.module.css';

const MODE_KEY = 'bcb:climb-mode';
/** The learner's last choice on the Climb page: null = mix, or a pattern id. */
export const readMode = () => readJSON(MODE_KEY, null);
export const writeMode = (mode) => writeJSON(MODE_KEY, mode);

const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/** Start the next rated problem (in the learner's mode) and open it: the one-click "one more". */
export function useStartNext() {
  const navigate = useNavigate();
  const { next } = useClimb();
  return (mode = readMode()) => {
    const pick = next(mode);
    if (pick.empty) { navigate('/climb'); return; }
    startAttempt(pick);
    navigate(`/solve/${pick.slug}?climb=1`);
  };
}

/**
 * Climb in the solver: while a rated attempt on this problem is open, the clock against its time limit
 * and a way to give up; once it ends, how the rating moved and a button straight to the next problem.
 */
export function ClimbBanner({ slug }) {
  const { active, model } = useClimb();
  const startNext = useStartNext();
  const mine = active?.s === slug ? active : null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!mine) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [mine]);

  if (mine) {
    const used = now - mine.t;
    const limit = mine.lim * 60000;
    const over = used > limit;
    return (
      <div className={`${styles.banner} ${over ? styles.bannerLate : ''}`} role="status">
        <Mountain size={16} aria-hidden="true" />
        <span>
          <strong>Rated attempt · {mmss(used)}</strong> of {mine.lim} min{over ? ' (over time: still counts, for a little less)' : ''}.
          {' '}Problem rating {mine.pr}{mine.fails ? ` · ${mine.fails} failed submission${mine.fails === 1 ? '' : 's'}` : ''}{mine.hints ? ` · ${mine.hints} hint${mine.hints === 1 ? '' : 's'}` : ''}.
          {' '}Opening the Solution tab ends it as not solved.
        </span>
        <button
          type="button"
          className={`${ui.btn} ${ui.ghost} ${ui.small}`}
          onClick={() => { if (window.confirm('Give up this rated attempt? It counts as not solved; you can still solve the problem afterwards.')) finishAttempt(slug, { gave: true }); }}
        >
          <Flag size={13} aria-hidden="true" /> Give up
        </button>
      </div>
    );
  }

  // the result stays up for the session it was earned in, not every later visit
  const h = deltaOf(model, slug);
  if (!h || now - h.t > 6 * 3600000) return null;
  const up = h.d >= 0;
  const p = h.p ? model.patterns[h.p] : null;
  return (
    <div className={`${styles.banner} ${h.ok ? styles.bannerOk : ''}`} role="status">
      {up ? <TrendingUp size={16} aria-hidden="true" /> : <TrendingDown size={16} aria-hidden="true" />}
      <span>
        <strong className={up ? styles.up : styles.down}>{up ? '+' : '−'}{Math.abs(h.d)}</strong>
        {' '}· rating <strong>{h.r}</strong>
        {p && <> · {catalog.titles[h.p] ?? h.p} {p.r}</>}
        {h.ok ? (h.score >= 0.9 ? ' · clean solve' : ' · solved') : ' · not solved this time'}
        {model.run > 1 && h === model.history.at(-1) ? ` · ${model.run} clean in a row` : ''}
      </span>
      <Link to="/climb" className={`${ui.btn} ${ui.ghost} ${ui.small}`}>Climb</Link>
      <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => startNext()} disabled={Boolean(active)}>
        Next problem <ArrowRight size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
