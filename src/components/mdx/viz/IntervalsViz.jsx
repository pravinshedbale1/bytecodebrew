import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import styles from './IntervalsViz.module.css';
import {
  INTERVALS, ROOMS, intervals, intervalsCode, meetingRooms, parseIntervals, randomIntervals, randomRooms, roomsCode,
} from './models/intervals';

/**
 * Interval step-throughs for the Intervals lesson, drawn on a timeline:
 *   <IntervalsViz examples={['merge', 'erase']} />   merge (sort by start) and remove the fewest (sort by end)
 *   <MeetingRoomsViz />                               a sweep line counting rooms in use
 * Rows slide into their new order when the list is sorted.
 */

const fmt = ([s, e]) => `[${s}, ${e}]`;
const ROW = 28;
const AXIS = 44;

function scaleFor(list, width) {
  const lo = Math.min(...list.map((x) => x[0]));
  let hi = Math.max(...list.map((x) => x[1]));
  if (hi - lo < 6) hi = lo + 6;
  const W = Math.max(300, Math.min(width, 640));
  const pad = 18;
  const unit = (W - 2 * pad) / (hi - lo);
  const x = (v) => pad + (v - lo) * unit;
  const step = hi - lo <= 12 ? 1 : hi - lo <= 24 ? 2 : 5;
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  return { W, x, ticks };
}

function Axis({ ticks, x, height }) {
  return (
    <>
      {ticks.map((v) => (
        <span key={v} className={styles.tick} style={{ left: x(v), top: 0, height }}>
          <span className={styles.tickLabel}>{v}</span>
        </span>
      ))}
    </>
  );
}

function Bar({ x, s, e, row, cls, label, top = AXIS }) {
  const w = Math.max(6, x(e) - x(s));
  return (
    <div className={`${styles.bar} ${cls}`} style={{ left: x(s), width: w, top: top + row * ROW + 5 }}>
      <span className={w > 46 ? styles.barLabel : styles.barLabelOut}>{label}</span>
    </div>
  );
}

function Marker({ x, top, height, tone, label }) {
  return (
    <div className={`${styles.marker} ${styles[`marker_${tone}`]}`} style={{ left: x, top, height }}>
      <span className={styles.markerLabel}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------- merge and erase

function IntervalsStage({ step: f, input, width, jump }) {
  const list = input.list;
  const n = list.length;
  const { W, x, ticks } = scaleFor(list, width);
  const rowOf = new Map(f.order.map((id, k) => [id, k]));
  const lane = AXIS + n * ROW + 26;
  const height = input.mode === 'merge' ? lane + ROW + 12 : AXIS + n * ROW + 10;
  const curPos = f.cur !== null ? rowOf.get(f.cur) : null;
  let marker = null;
  if (input.mode === 'merge' && (f.kind === 'extend' || f.kind === 'inside' || f.kind === 'gap')) {
    marker = <Marker x={x(f.lastEnd)} top={AXIS - 4} height={lane + ROW - AXIS} tone="warn" label={`last end ${f.lastEnd}`} />;
  }
  if (input.mode === 'erase' && f.end !== null && f.kind !== 'done') {
    const at = f.kind === 'keep' || f.kind === 'remove' ? (f.prevEnd ?? f.end) : f.end;
    marker = <Marker x={x(at)} top={AXIS - 4} height={n * ROW + 8} tone="warn" label={`end ${at}`} />;
  }
  return (
    <div className={`${styles.stage} ${jump ? styles.jump : ''}`} style={{ width: W, height }} role="img" aria-label={`intervals ${list.map(fmt).join(', ')}`}>
      <Axis ticks={ticks} x={x} height={height} />
      {marker}
      {list.map(([s, e], id) => {
        const row = rowOf.get(id);
        const cls = [
          id === f.cur && styles.current,
          input.mode === 'merge' && curPos !== null && row < curPos && styles.past,
          input.mode === 'merge' && f.kind === 'done' && styles.past,
          input.mode === 'erase' && f.status[id] === 'kept' && styles.kept,
          input.mode === 'erase' && f.status[id] === 'removed' && styles.removed,
        ].filter(Boolean).join(' ');
        return <Bar key={id} x={x} s={s} e={e} row={row} cls={cls} label={fmt([s, e])} />;
      })}
      {input.mode === 'merge' && (
        <>
          <span className={styles.laneLabel} style={{ top: lane - 18 }}>merged</span>
          {f.merged.map((m, k) => (
            <Bar
              key={`m${k}`} x={x} s={m[0]} e={m[1]} row={0} top={lane}
              cls={`${styles.merged} ${k === f.merged.length - 1 && f.kind !== 'done' && f.kind !== 'sort' && f.kind !== 'start' ? (f.kind === 'gap' || f.kind === 'add' ? styles.mergedNew : styles.mergedGrow) : ''}`}
              label={fmt(m)}
            />
          ))}
        </>
      )}
    </div>
  );
}

const intervalsSpec = {
  title: 'Intervals on a timeline',
  examples: INTERVALS,
  simulate: intervals,
  code: (input) => intervalsCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    sort: ['Sort', 'interview'],
    add: ['First', 'accent'],
    extend: ['Overlap: extend', 'accent'],
    inside: ['Overlap: inside', 'muted'],
    gap: ['Gap: new interval', 'warn'],
    keep: ['Keep', 'success'],
    remove: ['Remove', 'danger'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `intervals = ${input.list.map(fmt).join(', ')}`,
  rule: (input) => (input.mode === 'merge' ? 'Sort by start; overlap if cur.start ≤ last.end.' : 'Sort by end; keep it if it starts at or after the last kept end.'),
  stats: (f, input) => (input.mode === 'merge' ? [['merged', f.merged.length]] : [['kept', f.kept], ['removed', Object.values(f.status).filter((v) => v === 'removed').length]]),
  legend: (f, input) => (input.mode === 'merge'
    ? [[<Key shape="box" tone="accent">cur</Key>, 'interval being placed'], [<Key shape="box" tone="warn">|</Key>, 'end of the last merged interval'], [<Key shape="box" tone="interview">merged</Key>, 'the answer so far']]
    : [[<Key shape="box" tone="accent">cur</Key>, 'interval being decided'], [<Key shape="box" tone="success">kept</Key>, 'kept'], [<Key shape="box" tone="danger">removed</Key>, 'removed'], [<Key shape="box" tone="warn">|</Key>, 'end of the last kept one']]),
  fields: () => [{ name: 'list', label: 'intervals (start-end, 0 to 30)', placeholder: 'e.g. 1-4, 2-5, 7-9' }],
  values: (input) => ({ list: input.list.map(([s, e]) => `${s}-${e}`).join(', ') }),
  parse: (values, input) => {
    const r = parseIntervals(values.list, { maxLen: 8, lo: 0, hi: 30 });
    return r.error ? r : { input: { mode: input.mode, list: r.list } };
  },
  random: (input) => randomIntervals(input),
  hint: () => 'Up to 8 intervals between 0 and 30, written start-end and separated by commas.',
  delay: (f) => (f.kind === 'sort' ? 2800 : 2400),
  Stage: IntervalsStage,
};

export function IntervalsViz(props) {
  return <StepViz spec={intervalsSpec} {...props} />;
}

// ---------------------------------------------------------------- meeting rooms

function RoomsStage({ step: f, input, width, seq, jump }) {
  const list = input.list;
  const n = list.length;
  const { W, x, ticks } = scaleFor(list, width);
  const rowOf = new Map(f.order.map((id, k) => [id, k]));
  const height = AXIS + n * ROW + 12;
  return (
    <>
      <div className={`${styles.stage} ${jump ? styles.jump : ''}`} style={{ width: W, height }} role="img" aria-label={`meetings ${list.map(fmt).join(', ')}`}>
        <Axis ticks={ticks} x={x} height={height} />
        {f.t !== null && <Marker x={x(f.t)} top={AXIS - 4} height={n * ROW + 10} tone="accent" label={`t = ${f.t}`} />}
        {list.map(([s, e], id) => {
          const st = f.status[id];
          const cls = [
            st === 'on' && styles.on,
            st === 'done' && styles.past,
            (id === f.took || id === f.freed) && styles.current,
          ].filter(Boolean).join(' ');
          return <Bar key={id} x={x} s={s} e={e} row={rowOf.get(id)} cls={cls} label={`${s}–${e}`} />;
        })}
      </div>
      <Chips
        label="starts:" seq={seq}
        chips={f.starts.map((v, k) => ({ key: `s${k}`, text: String(v), tone: k === f.s ? 'accent' : f.s !== null && k < f.s ? 'muted' : f.kind === 'done' ? 'muted' : undefined }))}
      />
      <Chips
        label="ends:" seq={seq}
        chips={f.ends.map((v, k) => ({ key: `e${k}`, text: String(v), tone: f.kind === 'free' && k === f.e - 1 ? 'warn' : k < f.e ? 'muted' : k === f.e && f.kind !== 'done' ? 'accent' : undefined, note: k === f.e && f.kind !== 'done' && f.kind !== 'start' ? 'next' : undefined }))}
      />
    </>
  );
}

const roomsSpec = {
  title: 'Meeting rooms with a sweep line',
  examples: ROOMS,
  simulate: meetingRooms,
  code: () => roomsCode,
  kinds: {
    start: ['Start', 'neutral'],
    free: ['A meeting ended', 'warn'],
    take: ['A meeting starts', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `meetings = ${input.list.map(fmt).join(', ')}`,
  rule: () => 'Half-open [start, end): an end frees its room before a start at the same time.',
  stats: (f) => [['t', f.t ?? '–'], ['rooms in use', f.rooms], ['peak', f.best]],
  legend: () => [
    [<Key shape="box" tone="accent">t</Key>, 'sweep line (current start)'],
    [<Key shape="box" tone="note">meeting</Key>, 'in a room now'],
    [<Key shape="dashed">meeting</Key>, 'finished'],
  ],
  fields: () => [{ name: 'list', label: 'meetings (start-end, 0 to 24)', placeholder: 'e.g. 0-30, 5-10, 15-20' }],
  values: (input) => ({ list: input.list.map(([s, e]) => `${s}-${e}`).join(', ') }),
  parse: (values) => {
    const r = parseIntervals(values.list, { maxLen: 7, lo: 0, hi: 24, strict: true });
    return r.error ? r : { input: { list: r.list } };
  },
  random: () => randomRooms(),
  hint: () => 'Up to 7 meetings between 0 and 24, each start before its end. Try two meetings where one ends exactly when the other starts.',
  Stage: RoomsStage,
};

export function MeetingRoomsViz(props) {
  return <StepViz spec={roomsSpec} {...props} />;
}
