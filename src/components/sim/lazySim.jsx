import { lazy, Suspense } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { usePremium } from '../../hooks/useAccess';
import { PREMIUM_CONTENT } from '../../config/access';
import { PremiumNotice } from '../access/PremiumGate';
import styles from './Sim.module.css';

/**
 * A simulator loaded on first render (with a placeholder so the page does not jump). For free users
 * it shows a locked card describing the simulator instead, and the simulator's code is never loaded.
 */
export function lazySim(load, name, title, blurb) {
  const Comp = lazy(() => load().then((m) => ({ default: m[name] })));
  function LazySim(props) {
    const premium = usePremium();
    if (PREMIUM_CONTENT.simulators && !premium) {
      return (
        <section className={styles.frame} aria-label={`${title} (premium)`}>
          <header className={styles.head}>
            <span className={styles.title}><SlidersHorizontal size={14} aria-hidden="true" /> {title}</span>
            <span className={styles.badge}>Interactive · Premium</span>
          </header>
          <div className={styles.body} style={{ paddingTop: 0 }}>
            <PremiumNotice compact feature="Interactive simulation" blurb={blurb} />
          </div>
        </section>
      );
    }
    return (
      <Suspense fallback={<div className={styles.frame} style={{ minHeight: 320 }} aria-busy="true" />}>
        <Comp {...props} />
      </Suspense>
    );
  }
  LazySim.displayName = `Lazy(${name})`;
  return LazySim;
}
