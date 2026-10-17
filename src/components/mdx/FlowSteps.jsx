import { useEffect, useRef, useState } from 'react';
import { Footprints, X, Lock } from 'lucide-react';
import { usePremium } from '../../hooks/useAccess';
import { PREMIUM_CONTENT } from '../../config/access';
import { PremiumNotice } from '../access/PremiumGate';
import { useStepper, VizControls } from './VizStepper';
import styles from './FlowSteps.module.css';

const nodeIdOf = (g) => /flowchart-(.+)-\d+$/.exec(g.id)?.[1];

/** The node and edge ids lit up in one step: the nodes of `path` (and `nodes`), and the edges between consecutive path nodes (and `edges`). */
function litSets(step) {
  const nodes = new Set([...(step.path ?? []), ...(step.nodes ?? [])]);
  const pairs = [...(step.edges ?? [])];
  for (let i = 1; i < (step.path ?? []).length; i++) pairs.push([step.path[i - 1], step.path[i]]);
  return { nodes, pairs };
}

function edgeMatches(dataId, pairs) {
  return pairs.some(([a, b]) => dataId.startsWith(`L_${a}_${b}_`) || dataId.startsWith(`L_${b}_${a}_`));
}

/**
 * Wraps a ```mermaid flowchart and walks through it step by step, lighting up the nodes and edges
 * involved in each step and explaining it. The diagram itself is unchanged.
 *
 *   <FlowSteps title="Redirect flow" steps={[
 *     { path: ['C', 'CDN', 'LB', 'RS'], text: 'The request reaches the redirect service.' },
 *     { path: ['RS', 'RC'], text: 'Look up the code in Redis.' },
 *   ]}>
 *   ```mermaid … ```
 *   </FlowSteps>
 */
export function FlowSteps({ steps, title = 'Walk through the flow', children }) {
  const box = useRef(null);
  const [active, setActive] = useState(false);
  const s = useStepper(steps.length);

  // Mermaid renders asynchronously (and again on theme changes), so highlights re-apply when the SVG changes.
  useSvgEffect(box, (svg) => {
    const parts = [...svg.querySelectorAll('g.node, path.flowchart-link, g.edgeLabel')];
    parts.forEach((p) => p.classList.remove('bcb-on', 'bcb-now'));
    svg.classList.toggle('bcb-flow', active);
    if (!active) return;
    const { nodes, pairs } = litSets(steps[s.i]);
    const now = steps[s.i].path?.at(-1) ?? steps[s.i].nodes?.at(-1);
    for (const g of svg.querySelectorAll('g.node')) {
      const id = nodeIdOf(g);
      if (nodes.has(id)) g.classList.add('bcb-on');
      if (id === now) g.classList.add('bcb-now');
    }
    for (const p of svg.querySelectorAll('path.flowchart-link')) {
      if (edgeMatches(p.dataset.id ?? p.id.replace(/^.*?(L_)/, 'L_'), pairs)) p.classList.add('bcb-on');
    }
    for (const g of svg.querySelectorAll('g.edgeLabel')) {
      const id = g.querySelector('[data-id]')?.dataset.id;
      if (id && edgeMatches(id, pairs)) g.classList.add('bcb-on');
    }
  }, [active, s.i, steps]);

  return (
    <StepFrame title={title} count={steps.length} active={active} setActive={setActive} s={s} box={box} text={steps[s.i].text}>
      {children}
    </StepFrame>
  );
}

/** The frame both step-throughs share: title bar with controls, the diagram, and the current step's text. */
function StepFrame({ title, count, active, setActive, s, box, text, children }) {
  const premium = usePremium();
  const locked = PREMIUM_CONTENT.diagramSteps && !premium;
  const [askedLocked, setAskedLocked] = useState(false);
  return (
    <div className={`${styles.wrap} ${active ? styles.active : ''}`}>
      <div className={styles.bar}>
        <span className={styles.title}><Footprints size={14} aria-hidden="true" /> {title}</span>
        {active ? (
          <span className={styles.right}>
            <VizControls s={s} count={count} />
            <button type="button" className={styles.close} onClick={() => { setActive(false); s.restart(); }} aria-label="Show the whole diagram">
              <X size={15} />
            </button>
          </span>
        ) : (
          <button type="button" className={styles.start} onClick={() => (locked ? setAskedLocked((v) => !v) : setActive(true))} aria-expanded={locked ? askedLocked : undefined}>
            {locked && <Lock size={12} aria-hidden="true" />} Step through it ({count} steps)
          </button>
        )}
      </div>
      {locked && askedLocked && (
        <div className={styles.lockedNote}>
          <PremiumNotice compact feature="Step-through diagrams" blurb={`Walk this diagram one step at a time (${count} steps), with the active part lit up and each step explained.`} />
        </div>
      )}
      <div ref={box}>{children}</div>
      {active && (
        <p className={styles.text} aria-live="polite">
          <span className={styles.num}>{s.i + 1}</span>
          <span>{text}</span>
        </p>
      )}
    </div>
  );
}

/** Re-runs `apply(svg)` whenever the SVG inside `box` is (re)rendered or `deps` change. */
function useSvgEffect(box, apply, deps) {
  const [svgTick, setSvgTick] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const mo = new MutationObserver(() => setSvgTick((t) => t + 1));
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [box]);
  useEffect(() => {
    const svg = box.current?.querySelector('svg');
    if (svg) apply(svg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, svgTick]);
}

/**
 * Sequence diagrams step through their messages automatically: the current message is lit, earlier
 * ones stay visible, later ones fade. `messages` comes from parseSequence(chart).
 */
export function SequenceSteps({ messages, children }) {
  const box = useRef(null);
  const [active, setActive] = useState(false);
  const s = useStepper(messages.length);

  useSvgEffect(box, (svg) => {
    const texts = [...svg.querySelectorAll('.messageText')];
    const lines = [...svg.querySelectorAll('.messageLine0, .messageLine1')];
    svg.classList.toggle('bcb-seq', active);
    [...texts, ...lines].forEach((e) => e.classList.remove('bcb-on', 'bcb-past'));
    if (!active) return;
    [texts, lines].forEach((list) => list.forEach((e, k) => {
      if (k < s.i) e.classList.add('bcb-past');
      else if (k === s.i) e.classList.add('bcb-on');
    }));
  }, [active, s.i]);

  const m = messages[s.i];
  const text = (
    <>
      {m.branch && <span className={styles.branch}>{m.branch}</span>}
      <strong>{m.from}</strong> {m.reply ? '⇠' : '→'} <strong>{m.to}</strong>: {m.label}
    </>
  );
  return (
    <StepFrame title="Step through the messages" count={messages.length} active={active} setActive={setActive} s={s} box={box} text={text}>
      {children}
    </StepFrame>
  );
}
