import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Highlighter, StickyNote, Trash2, X } from 'lucide-react';
import { useHighlights, addHighlight, updateHighlight, removeHighlight, HIGHLIGHT_COLORS } from '../../hooks/useHighlights';
import { useAuth, signIn } from '../../hooks/useAuth';
import { textIndex, rangeToAnchor, anchorToRange, rangeContainsPoint, highlightsSupported } from '../../lib/highlights/anchor';
import styles from './HighlightLayer.module.css';

/**
 * Select text in a lesson → a small toolbar offers highlight colours and a note.
 * Click a highlight → change its colour, edit the note, or delete it.
 *
 * Highlights are painted with the CSS Custom Highlight API: they are Ranges registered in
 * CSS.highlights, so the lesson's DOM (owned by React) is never modified.
 */
const NAMES = [...HIGHLIGHT_COLORS.map((c) => `bcb-hl-${c}`), 'bcb-hl-note', 'bcb-hl-active'];

/** Keep a horizontally centred box of width w inside the viewport. */
const clampX = (x, w) => Math.min(Math.max(x, w / 2 + 12), window.innerWidth - w / 2 - 12);

function caretPoint(x, y) {
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    return p && { node: p.offsetNode, offset: p.offset };
  }
  const r = document.caretRangeFromPoint?.(x, y);
  return r && { node: r.startContainer, offset: r.startOffset };
}

export function HighlightLayer({ rootRef, lessonKey }) {
  const all = useHighlights();
  const auth = useAuth();
  const { search } = useLocation();
  const mine = useMemo(() => Object.values(all).filter((h) => h.lessonKey === lessonKey), [all, lessonKey]);
  const ranges = useRef(new Map());           // highlight id → Range currently painted
  const scrolledTo = useRef(null);
  const [toolbar, setToolbar] = useState(null);   // { x, top, bottom, anchor }
  const [active, setActive] = useState(null);     // { id, x, y }
  const [noteDraft, setNoteDraft] = useState('');

  // ---- paint saved highlights, and repaint whenever the lesson's DOM changes
  useEffect(() => {
    const root = rootRef.current;
    if (!highlightsSupported || !root) return undefined;
    let frame = 0;
    const paint = () => {
      const index = textIndex(root);
      const groups = Object.fromEntries(NAMES.map((n) => [n, []]));
      const found = new Map();
      for (const h of mine) {
        const r = anchorToRange(h, index);
        if (!r) continue;
        found.set(h.id, r);
        groups[`bcb-hl-${h.color}`]?.push(r);
        if (h.note) groups['bcb-hl-note'].push(r);
        if (active?.id === h.id) groups['bcb-hl-active'].push(r);
      }
      ranges.current = found;
      for (const n of NAMES) {
        if (groups[n].length) CSS.highlights.set(n, new Highlight(...groups[n]));
        else CSS.highlights.delete(n);
      }
      // ?hl=<id> (from the "My highlights" page): scroll to it once
      const target = new URLSearchParams(search).get('hl');
      if (target && scrolledTo.current !== target && found.has(target)) {
        scrolledTo.current = target;
        const rect = found.get(target).getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 3, behavior: 'smooth' });
      }
    };
    paint();
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      NAMES.forEach((n) => CSS.highlights.delete(n));
    };
  }, [mine, rootRef, active, search]);

  // ---- show the toolbar when text inside the lesson is selected
  useEffect(() => {
    if (!highlightsSupported) return undefined;
    const check = () => setTimeout(() => {
      const root = rootRef.current;
      const sel = window.getSelection();
      if (!root || !sel || sel.isCollapsed || !sel.rangeCount) { setToolbar(null); return; }
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) { setToolbar(null); return; }
      const anchor = rangeToAnchor(range, root);
      if (!anchor) { setToolbar(null); return; }
      const rect = range.getBoundingClientRect();
      setActive(null);
      setToolbar({ x: rect.left + rect.width / 2, top: rect.top, bottom: rect.bottom, anchor });
    }, 10);
    const hide = () => setToolbar(null);
    document.addEventListener('mouseup', check);
    document.addEventListener('keyup', check);
    document.addEventListener('touchend', check);
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      document.removeEventListener('mouseup', check);
      document.removeEventListener('keyup', check);
      document.removeEventListener('touchend', check);
      window.removeEventListener('scroll', hide);
    };
  }, [rootRef]);

  // ---- clicking on painted text opens that highlight's popover
  useEffect(() => {
    const root = rootRef.current;
    if (!highlightsSupported || !root) return undefined;
    const onClick = (e) => {
      if (!window.getSelection()?.isCollapsed) return;
      if (e.target.closest('a, button, input, textarea, select, summary, figure')) return;
      const p = caretPoint(e.clientX, e.clientY);
      if (!p) return;
      for (const [id, r] of ranges.current) {
        if (rangeContainsPoint(r, p.node, p.offset)) {
          setNoteDraft(all[id]?.note ?? '');
          setActive({ id, x: e.clientX, y: e.clientY });
          return;
        }
      }
      setActive(null);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [rootRef, all]);

  // ---- close on Escape or scroll
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setActive(null); setToolbar(null); } };
    // close on scroll, except while typing a note (a phone keyboard opening also scrolls the page)
    const onScroll = () => { if (document.activeElement?.tagName !== 'TEXTAREA') setActive(null); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll); };
  }, []);

  const create = useCallback((color, withNote) => {
    if (!toolbar) return;
    const id = addHighlight(lessonKey, toolbar.anchor, color);
    window.getSelection()?.removeAllRanges();
    const at = { x: toolbar.x, y: toolbar.bottom + 8 };
    setToolbar(null);
    if (withNote) { setNoteDraft(''); setActive({ id, ...at, focusNote: true }); }
  }, [toolbar, lessonKey]);

  if (!highlightsSupported) return null;
  const current = active && all[active.id];
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  return (
    <>
      {toolbar && (
        <div
          className={styles.toolbar}
          style={touch
            ? { left: clampX(toolbar.x, 240), top: Math.min(toolbar.bottom + 12, window.innerHeight - 56) }
            : { left: clampX(toolbar.x, 240), top: Math.min(Math.max(8, toolbar.top - 48), window.innerHeight - 56) }}
          role="toolbar"
          aria-label="Highlight selection"
          onMouseDown={(e) => e.preventDefault()}   // keep the selection while clicking
        >
          <Highlighter size={15} aria-hidden="true" className={styles.lead} />
          {HIGHLIGHT_COLORS.map((c) => (
            <button key={c} type="button" className={`${styles.swatch} ${styles[c]}`} onClick={() => create(c, false)} aria-label={`Highlight ${c}`} title={`Highlight (${c})`} />
          ))}
          <span className={styles.divider} />
          <button type="button" className={styles.textButton} onClick={() => create('yellow', true)}>
            <StickyNote size={14} /> Note
          </button>
        </div>
      )}

      {current && (
        <div className={styles.popover} style={{ left: clampX(active.x, 320), top: Math.min(active.y + 14, window.innerHeight - 220) }} role="dialog" aria-label="Edit highlight">
          <div className={styles.popRow}>
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c} type="button" className={`${styles.swatch} ${styles[c]} ${current.color === c ? styles.chosen : ''}`} onClick={() => updateHighlight(current.id, { color: c })} aria-label={`Change to ${c}`} aria-pressed={current.color === c} />
            ))}
            <span className={styles.spacer} />
            <button type="button" className={styles.icon} onClick={() => { removeHighlight(current.id); setActive(null); }} aria-label="Delete highlight" title="Delete">
              <Trash2 size={15} />
            </button>
            <button type="button" className={styles.icon} onClick={() => setActive(null)} aria-label="Close">
              <X size={15} />
            </button>
          </div>
          <textarea
            className={styles.note}
            rows={3}
            placeholder="Add a note…"
            value={noteDraft}
            autoFocus={Boolean(active.focusNote)}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={() => { if (noteDraft !== (current.note ?? '')) updateHighlight(current.id, { note: noteDraft.trim() }); }}
          />
          <p className={styles.foot}>
            {auth.status === 'signed-in' && 'Synced to your account.'}
            {auth.status === 'signed-out' && (
              <>Saved on this device. <button type="button" className={styles.link} onClick={signIn}>Sign in</button> to sync.</>
            )}
            {(auth.status === 'disabled' || auth.status === 'loading') && 'Saved on this device.'}
          </p>
        </div>
      )}
    </>
  );
}
