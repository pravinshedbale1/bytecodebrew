import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, highlightSpecialChars, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting, HighlightStyle, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { java } from '@codemirror/lang-java';
import { tags as t } from '@lezer/highlight';
import styles from './CodeEditor.module.css';

/** Syntax colours from the theme tokens, so lessons and the editor match in light and dark mode. */
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.bool, t.null, t.self], color: 'var(--code-keyword)' },
  { tag: [t.string, t.character, t.regexp], color: 'var(--code-string)' },
  { tag: [t.typeName, t.className, t.namespace], color: 'var(--code-type)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: 'var(--code-function)' },
  { tag: [t.number], color: 'var(--code-number)' },
  { tag: [t.annotation, t.meta], color: 'var(--code-annotation)' },
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: 'var(--code-comment)', fontStyle: 'italic' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--color-code-bg)', color: 'var(--color-text)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6', fontVariantLigatures: 'none' },
  '.cm-content': { padding: '12px 0', caretColor: 'var(--color-accent)' },
  '.cm-cursor': { borderLeftColor: 'var(--color-accent)', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: 'var(--color-code-bg)', color: 'var(--color-text-subtle)', border: 'none', paddingLeft: '6px' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--color-text) 4%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--color-text)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent) !important',
  },
  '.cm-matchingBracket': { backgroundColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)', outline: 'none' },
  '.cm-selectionMatch': { backgroundColor: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' },
  '.cm-foldGutter span': { color: 'var(--color-text-subtle)' },
  '.cm-panels': { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  '.cm-panels input, .cm-panels button': { fontSize: '12px' },
});

// Java ships with the editor; the other grammars load the first time they're picked.
const MODES = {
  cpp: () => import('@codemirror/lang-cpp').then((m) => m.cpp()),
  python: () => import('@codemirror/lang-python').then((m) => m.python()),
  javascript: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
};
const NAMES = { java: 'Java', cpp: 'C++', python: 'Python', javascript: 'JavaScript' };

/**
 * Code editor (CodeMirror 6) for Java, C++, Python or JavaScript: syntax highlighting, bracket
 * matching and auto-closing, folding, undo history, search (Ctrl/⌘ F), four-space indent with Tab,
 * and Ctrl/⌘ Enter to run. Controlled: `value` replaces the document when it differs (e.g. Reset),
 * and `language` switches the highlighting in place.
 */
export function CodeEditor({ value, onChange, onRun, height = 'min(60vh, 560px)', language = 'java', label }) {
  const host = useRef(null);
  const view = useRef(null);
  const langSlot = useRef(new Compartment());
  const labelSlot = useRef(new Compartment());
  const handlers = useRef({ onChange, onRun });
  handlers.current = { onChange, onRun };
  const ariaLabel = label ?? `${NAMES[language] ?? 'Java'} source code`;

  useEffect(() => {
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          indentUnit.of('    '),
          EditorState.tabSize.of(4),
          bracketMatching(),
          closeBrackets(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          syntaxHighlighting(highlight),
          langSlot.current.of(language === 'java' || !MODES[language] ? java() : []),
          theme,
          keymap.of([
            { key: 'Mod-Enter', preventDefault: true, run: () => { handlers.current.onRun?.(); return true; } },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            indentWithTab,
          ]),
          labelSlot.current.of(EditorView.contentAttributes.of({ 'aria-label': ariaLabel })),
          EditorView.contentAttributes.of({ spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    return () => v.destroy();
    // the editor is created once; later `value` changes are applied below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = view.current;
    if (v && value !== v.state.doc.toString()) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: labelSlot.current.reconfigure(EditorView.contentAttributes.of({ 'aria-label': ariaLabel })) });
  }, [ariaLabel]);

  useEffect(() => {
    let alive = true;
    const apply = (ext) => { if (alive) view.current?.dispatch({ effects: langSlot.current.reconfigure(ext) }); };
    if (MODES[language]) MODES[language]().then(apply, () => apply([]));
    else apply(java());
    return () => { alive = false; };
  }, [language]);

  return <div className={styles.editor} style={{ height }} ref={host} />;
}
