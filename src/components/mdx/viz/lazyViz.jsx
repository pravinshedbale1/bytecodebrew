import { Suspense, lazy } from 'react';

/**
 * A DSA step-through loaded on first render, with a placeholder of about the same size so the page
 * doesn't jump. Free for everyone (like the other DSA visualisers), so there is no premium gate.
 */
export function lazyViz(load, name) {
  const Comp = lazy(() => load().then((m) => ({ default: m[name] })));
  function LazyViz(props) {
    return (
      <Suspense fallback={<div style={{ minHeight: 620, margin: '1.8em 0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }} aria-busy="true" />}>
        <Comp {...props} />
      </Suspense>
    );
  }
  LazyViz.displayName = `Lazy(${name})`;
  return LazyViz;
}
