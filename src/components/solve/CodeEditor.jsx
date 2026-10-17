import { useRef } from 'react';
import styles from './CodeEditor.module.css';

/**
 * A plain, dependable Java editor: a textarea with line numbers, four-space Tab, auto-indent on
 * Enter (one level deeper after "{"), and Ctrl/⌘+Enter to run.
 */
export function CodeEditor({ value, onChange, onRun, height = 'min(60vh, 560px)', label = 'Java source code' }) {
  const gutter = useRef(null);

  const onKeyDown = (e) => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = el;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onChange(`${value.slice(0, s)}    ${value.slice(end)}`);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const indent = value.slice(lineStart, s).match(/^[ \t]*/)[0];
      const extra = value[s - 1] === '{' ? '    ' : '';
      const insert = `\n${indent}${extra}`;
      onChange(`${value.slice(0, s)}${insert}${value.slice(end)}`);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + insert.length; });
    }
  };

  const lines = value.split('\n').length;
  return (
    <div className={styles.editor} style={{ height }}>
      <pre className={styles.gutter} ref={gutter} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
      </pre>
      <textarea
        className={styles.code}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-label={label}
      />
    </div>
  );
}
