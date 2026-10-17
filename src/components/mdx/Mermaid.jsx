import { useEffect, useId, useMemo, useState } from 'react';
import { SequenceSteps } from './FlowSteps';
import { parseSequence } from './sequenceSteps';
import { getActiveTheme } from '../../hooks/useTheme';
import styles from './Mermaid.module.css';

let mermaidPromise;
const loadMermaid = () => (mermaidPromise ??= import('mermaid').then((m) => m.default));

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Mermaid colours are derived from the app's design tokens so diagrams match both themes. */
function themeConfig() {
  const dark = getActiveTheme() === 'dark';
  return {
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: cssVar('--font-sans'),
    themeVariables: {
      darkMode: dark,
      fontSize: '14px',
      background: cssVar('--color-surface'),
      primaryColor: cssVar('--color-surface-muted'),
      primaryBorderColor: cssVar('--color-border-strong'),
      primaryTextColor: cssVar('--color-text'),
      secondaryColor: cssVar('--color-accent-soft'),
      secondaryBorderColor: cssVar('--color-accent'),
      secondaryTextColor: cssVar('--color-text'),
      tertiaryColor: cssVar('--color-surface'),
      tertiaryBorderColor: cssVar('--color-border'),
      lineColor: cssVar('--color-text-subtle'),
      textColor: cssVar('--color-text'),
      clusterBkg: cssVar('--color-surface'),
      clusterBorder: cssVar('--color-border-strong'),
      edgeLabelBackground: cssVar('--color-surface'),
      noteBkgColor: cssVar('--color-warn-soft'),
      noteBorderColor: cssVar('--color-warn'),
      noteTextColor: cssVar('--color-text'),
      actorBkg: cssVar('--color-surface-muted'),
      actorBorder: cssVar('--color-border-strong'),
      actorTextColor: cssVar('--color-text'),
      signalColor: cssVar('--color-text-muted'),
      signalTextColor: cssVar('--color-text'),
      labelBoxBkgColor: cssVar('--color-surface-muted'),
      activationBkgColor: cssVar('--color-accent-soft'),
      activationBorderColor: cssVar('--color-accent'),
    },
    flowchart: { curve: 'basis', padding: 14, htmlLabels: true },
    sequence: { mirrorActors: false, messageAlign: 'center' },
  };
}

export function Mermaid({ chart, caption }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const onTheme = () => setThemeTick((t) => t + 1);
    window.addEventListener('bcb:themechange', onTheme);
    return () => window.removeEventListener('bcb:themechange', onTheme);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then(async (mermaid) => {
        mermaid.initialize(themeConfig());
        const { svg } = await mermaid.render(`m${id}${themeTick}`, chart.trim());
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      })
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [chart, id, themeTick]);

  // Sequence diagrams with a few messages get a step-through, one message at a time
  const messages = useMemo(() => (chart.trim().startsWith('sequenceDiagram') ? parseSequence(chart) : []), [chart]);

  const figure = (
    <figure className={styles.figure}>
      {error ? (
        <pre className={styles.fallback}>{chart}</pre>
      ) : (
        <div
          className={`${styles.diagram} ${svg ? '' : styles.loading}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
  return messages.length >= 3 && !error ? <SequenceSteps messages={messages}>{figure}</SequenceSteps> : figure;
}
