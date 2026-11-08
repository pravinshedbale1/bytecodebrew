import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Bookmark, BookmarkCheck, Check, Plus } from 'lucide-react';
import { useProblemLists, toggleInList, createList, MAX_NAME } from '../../hooks/useProblemLists';
import styles from './AddToList.module.css';

const POP_WIDTH = 260;

/**
 * "Save to list": a small popover that ticks a problem into any of the learner's lists, or into a
 * new one. `variant="chip"` sits among the solver's chips; `variant="icon"` is a compact row button.
 */
export function AddToList({ slug, title, variant = 'icon', align = 'right' }) {
  const { lists } = useProblemLists();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [name, setName] = useState('');
  const box = useRef(null);
  const pop = useRef(null);
  const saved = lists.filter((l) => l.slugs.includes(slug));

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!box.current?.contains(e.target) && !pop.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    // fixed to the viewport (so a scrolling panel can't clip it): close when anything else scrolls
    const scroll = (e) => { if (!pop.current?.contains(e.target)) setOpen(false); };
    const resize = () => setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', resize);
    };
  }, [open]);

  const create = (e) => {
    e.preventDefault();
    if (createList(name, [slug])) setName('');
  };

  const Icon = saved.length ? BookmarkCheck : Bookmark;
  const label = saved.length ? `Saved in ${saved.length} list${saved.length === 1 ? '' : 's'}` : 'Save to list';

  return (
    <span className={styles.wrap} ref={box}>
      <button
        type="button"
        className={variant === 'chip' ? `${styles.chip} ${saved.length ? styles.on : ''}` : `${styles.icon} ${saved.length ? styles.on : ''}`}
        onClick={(e) => {
          if (open) { setOpen(false); return; }
          const r = e.currentTarget.getBoundingClientRect();
          const width = Math.min(POP_WIDTH, window.innerWidth - 16);
          const left = align === 'left' ? r.left : r.right - width;
          const below = window.innerHeight - r.bottom > 300 || r.top < 300;
          setPos({
            left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
            width,
            ...(below ? { top: r.bottom + 6 } : { bottom: window.innerHeight - r.top + 6 }),
          });
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${title}`}
        title={label}
      >
        <Icon size={variant === 'chip' ? 12 : 15} aria-hidden="true" />
        {variant === 'chip' && (saved.length ? (saved.length === 1 ? saved[0].name : `${saved.length} lists`) : 'Save to list')}
      </button>
      {open && createPortal(
        <div ref={pop} className={styles.pop} style={pos} role="dialog" aria-label={`Save ${title} to a list`}>
          <p className={styles.head}>Save to list</p>
          {lists.length > 0 ? (
            <ul className={styles.lists}>
              {lists.map((l) => {
                const on = l.slugs.includes(slug);
                return (
                  <li key={l.id}>
                    <button type="button" aria-pressed={on} className={styles.item} onClick={() => toggleInList(l.id, slug)}>
                      <span className={`${styles.box} ${on ? styles.boxOn : ''}`}>{on && <Check size={11} strokeWidth={3} aria-hidden="true" />}</span>
                      <span className={styles.name}>{l.name}</span>
                      <span className={styles.count}>{l.slugs.length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>No lists yet. Name one below and this problem goes straight in.</p>
          )}
          <form className={styles.form} onSubmit={create}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME}
              placeholder="New list name"
              aria-label="New list name"
              autoFocus={lists.length === 0}
            />
            <button type="submit" disabled={!name.trim()} aria-label="Create list"><Plus size={14} aria-hidden="true" /></button>
          </form>
          <Link to="/problems?view=lists" className={styles.manage} onClick={() => setOpen(false)}>Manage lists</Link>
        </div>,
        document.body,
      )}
    </span>
  );
}
