import { useCallback, useRef, useState } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';

/**
 * A draggable split between two panels. Returns [percent, handleProps, containerRef]: put
 * containerRef on the element that holds both panels and spread handleProps on the divider.
 * The position is remembered in this browser under `key`.
 */
export function useSplit(key, initial, { axis = 'x', min = 20, max = 80 } = {}) {
  const [pct, setPct] = useState(() => {
    const saved = Number(readJSON(key, initial));
    return Number.isFinite(saved) ? Math.min(max, Math.max(min, saved)) : initial;
  });
  const container = useRef(null);
  const latest = useRef(pct);

  const onPointerDown = useCallback((e) => {
    const box = container.current?.getBoundingClientRect();
    if (!box) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    const move = (ev) => {
      const raw = axis === 'x' ? ((ev.clientX - box.left) / box.width) * 100 : ((ev.clientY - box.top) / box.height) * 100;
      latest.current = Math.min(max, Math.max(min, raw));
      setPct(latest.current);
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      document.body.style.userSelect = '';
      writeJSON(key, Math.round(latest.current * 10) / 10);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }, [axis, key, max, min]);

  const onKeyDown = useCallback((e) => {
    const step = { ArrowLeft: -2, ArrowUp: -2, ArrowRight: 2, ArrowDown: 2 }[e.key];
    if (!step) return;
    e.preventDefault();
    setPct((p) => {
      const next = Math.min(max, Math.max(min, p + step));
      writeJSON(key, next);
      return next;
    });
  }, [key, max, min]);

  const handle = {
    role: 'separator',
    tabIndex: 0,
    'aria-orientation': axis === 'x' ? 'vertical' : 'horizontal',
    'aria-valuenow': Math.round(pct),
    'aria-valuemin': min,
    'aria-valuemax': max,
    onPointerDown,
    onKeyDown,
  };
  return [pct, handle, container];
}
