import { lazy, Suspense } from 'react';
import styles from './Sim.module.css';

/** A simulator loaded on first render, with a placeholder of a similar size so the page does not jump. */
export function lazySim(load, name) {
  const Comp = lazy(() => load().then((m) => ({ default: m[name] })));
  function LazySim(props) {
    return (
      <Suspense fallback={<div className={styles.frame} style={{ minHeight: 320 }} aria-busy="true" />}>
        <Comp {...props} />
      </Suspense>
    );
  }
  LazySim.displayName = `Lazy(${name})`;
  return LazySim;
}
