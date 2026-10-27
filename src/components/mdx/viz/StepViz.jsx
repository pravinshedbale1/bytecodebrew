import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MousePointerClick, Shuffle, Undo2 } from 'lucide-react';
import { VizControls } from '../VizStepper';
import styles from './StepViz.module.css';

/**
 * The shell every algorithm step-through shares: header, example chips, the input, the stage, a
 * legend, counters, the explanation for the step with "the check" in real numbers, the code with the
 * running line highlighted, and "try your own". The controls (buttons and arrow keys) are docked: they
 * stay on screen at the bottom while any part of a tall visual is in view.
 *
 * A visual is a spec plus a Stage component:
 *   examples: { key: { label, input } }
 *   simulate(input) → steps: [{ kind, title, text, calc: [string], lines: [codeKey], answer?, … }]
 *   code(input) → [[codeKey, line]]       a key may cover several lines
 *   kinds: { kind: [label, tone] }        the badge in front of each step's title
 *   describe(input) → string              shown as the input ("nums = [3, 1, 2]")
 *   rule(input) → string                  one line under the input
 *   stats(step, input) → [[label, value]]
 *   legend(step, input) → [[<Key/>, text]]
 *   fields(input) → [{ name, label, placeholder, short? }]   the "try your own" inputs (omit for scripted walkthroughs)
 *   values(input) → { name: text }        prefills them
 *   parse(values, input) → { input } | { error }
 *   random(input) → input
 *   hint(input) → string                  under the form
 *   delay?(step) → ms                     autoplay pace
 *   Stage({ step, input, width, link, seq, jump })
 *     link: the later of the two steps when the learner moved by one step (to animate what changed), else null
 */

export function useWidth(ref) {
  const [w, setW] = useState(560);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** A legend swatch: <Key tone="accent">i</Key>, shape 'pill' (pointer tags) or 'box' (cells). */
export function Key({ tone = 'neutral', shape = 'pill', children }) {
  return <span className={`${styles.key} ${styles[`key_${shape}`]} ${styles[`k_${tone}`]}`}>{children}</span>;
}

function Run({ spec, steps, input }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = steps.length - 1;
  const [shown, setShown] = useState({ i: 0, link: null, jump: true, seq: 0 });
  if (shown.i !== i) {
    const adjacent = Math.abs(shown.i - i) === 1;
    setShown({ i, link: adjacent ? steps[Math.max(shown.i, i)] : null, jump: !adjacent, seq: shown.seq + 1 });
  }

  useEffect(() => {
    if (!playing) return undefined;
    if (i >= last) { setPlaying(false); return undefined; }
    const t = setTimeout(() => setI((x) => Math.min(last, x + 1)), spec.delay?.(steps[i]) ?? 2400);
    return () => clearTimeout(t);
  }, [playing, i, last, steps, spec]);

  const s = {
    i, last, playing,
    restart: () => { setPlaying(false); setI(0); },
    prev: () => { setPlaying(false); setI((x) => Math.max(0, x - 1)); },
    next: () => { setPlaying(false); setI((x) => Math.min(last, x + 1)); },
    toggle: () => { if (i >= last) setI(0); setPlaying((p) => !p); },
  };

  const stageRef = useRef(null);
  const width = useWidth(stageRef);
  const f = steps[i];
  const [kindLabel, tone] = spec.kinds[f.kind] ?? [f.kind, 'neutral'];
  const active = new Set(f.lines);
  const legend = spec.legend?.(f, input) ?? [];
  const stats = spec.stats?.(f, input) ?? [];
  const { Stage } = spec;

  const onKey = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); s.next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); s.prev(); }
  };

  return (
    <div className={styles.run} role="group" tabIndex={0} onKeyDown={onKey} aria-label="Step-through. Use the left and right arrow keys to step.">
      <div className={styles.scroller} ref={stageRef}>
        <Stage step={f} input={input} width={width} link={shown.link} seq={shown.seq} jump={shown.jump} />
      </div>

      {legend.length > 0 && (
        <ul className={styles.legend} aria-label="Legend">
          {legend.map(([key, text], k) => <li key={k}>{key} {text}</li>)}
        </ul>
      )}

      {(stats.length > 0 || f.answer) && (
        <div className={styles.stats}>
          {stats.map(([label, value]) => <span key={label} className={styles.stat}><span>{label}</span> {value}</span>)}
          {f.answer && <span className={styles.answer}>{f.answer}</span>}
        </div>
      )}

      <div className={styles.explain} aria-live="polite">
        <p className={styles.stepTitle}><span className={`${styles.kind} ${styles[`k_${tone}`]}`}>{kindLabel}</span>{f.title}</p>
        <p className={styles.text}>{f.text}</p>
        <div className={styles.check}>
          <span className={styles.colHead}>The check</span>
          {f.calc.map((line, k) => <code key={k} className={styles.line}>{line}</code>)}
        </div>
      </div>

      <div className={styles.codeBox}>
        <p className={styles.colHead}>The code</p>
        <pre className={styles.code}>
          {spec.code(input).map(([key, text], k) => (
            <span key={k} className={active.has(key) ? styles.on : undefined}>{text}</span>
          ))}
        </pre>
      </div>

      {/* sticks to the bottom of the screen while any part of the visual is in view */}
      <div className={styles.dock} data-sticky-dock>
        <VizControls s={s} count={steps.length} />
      </div>
    </div>
  );
}

export function StepViz({ spec, examples, title }) {
  const keys = examples?.length ? examples : Object.keys(spec.examples).slice(0, 1);
  const first = spec.examples[keys[0]];
  const [run, setRun] = useState({ id: 0, example: keys[0], input: first.input, own: false });
  const [values, setValues] = useState(() => spec.values?.(first.input) ?? {});
  const [error, setError] = useState('');
  const steps = useMemo(() => spec.simulate(run.input), [spec, run]);

  const start = (patch) => setRun((r) => ({ ...r, ...patch, id: r.id + 1 }));
  const pick = (key) => {
    const input = spec.examples[key].input;
    setError('');
    setValues(spec.values?.(input) ?? {});
    start({ example: key, input, own: false });
  };
  const submit = (e) => {
    e.preventDefault();
    const r = spec.parse(values, run.input);
    if (r.error) { setError(r.error); return; }
    setError('');
    start({ input: r.input, own: true });
  };
  const random = () => {
    const input = spec.random(run.input);
    setValues(spec.values(input));
    setError('');
    start({ input, own: true });
  };

  return (
    <figure className={styles.frame}>
      <figcaption className={styles.head}>
        <span className={styles.title}><MousePointerClick size={14} aria-hidden="true" /> {title ?? spec.title}</span>
        <span className={styles.hintKeys}>Step with ‹ › or the arrow keys</span>
      </figcaption>

      {keys.length > 1 && (
        <div className={styles.examples} role="radiogroup" aria-label="Example">
          {keys.map((key) => (
            <button key={key} type="button" role="radio" aria-checked={!run.own && run.example === key} className={styles.opt} onClick={() => pick(key)}>
              {spec.examples[key].label}
            </button>
          ))}
        </div>
      )}

      <p className={styles.input}>
        <span className={styles.inputLabel}>{run.own ? 'Your input' : 'Input'}</span>
        <code>{spec.describe(run.input)}</code>
        <span className={styles.rule}>{spec.rule(run.input)}</span>
      </p>

      <Run key={run.id} spec={spec} steps={steps} input={run.input} />

      {spec.fields && (
      <details className={styles.own}>
        <summary>Try your own input</summary>
        <form className={styles.form} onSubmit={submit}>
          {spec.fields(run.input).map((fd) => (
            <label key={fd.name} className={fd.short ? styles.fieldShort : styles.field}>
              <span>{fd.label}</span>
              <input
                type="text" value={values[fd.name] ?? ''} placeholder={fd.placeholder} aria-invalid={Boolean(error)}
                onChange={(e) => setValues((v) => ({ ...v, [fd.name]: e.target.value }))}
              />
            </label>
          ))}
          <div className={styles.buttons}>
            <button type="submit" className={styles.primary}>Run</button>
            <button type="button" onClick={random}><Shuffle size={14} aria-hidden="true" /> Random</button>
            {run.own && <button type="button" onClick={() => pick(run.example)}><Undo2 size={14} aria-hidden="true" /> Example</button>}
          </div>
        </form>
        <p className={error ? styles.error : styles.formHint}>{error || spec.hint(run.input)}</p>
      </details>
      )}
    </figure>
  );
}
