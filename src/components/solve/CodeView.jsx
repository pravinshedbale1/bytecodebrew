import { useEffect, useState } from 'react';
import { highlightCode, tagHighlighter, tags as t } from '@lezer/highlight';
import styles from './CodeView.module.css';

// the same tag → colour mapping as the editor (CodeEditor.jsx), as classes for static markup
const classes = tagHighlighter([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.bool, t.null, t.self], class: styles.keyword },
  { tag: [t.string, t.character, t.regexp], class: styles.string },
  { tag: [t.typeName, t.className, t.namespace], class: styles.type },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], class: styles.fn },
  { tag: [t.number], class: styles.number },
  { tag: [t.annotation, t.meta], class: styles.annotation },
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], class: styles.comment },
]);

const PARSERS = {
  java: () => import('@codemirror/lang-java').then((m) => m.javaLanguage.parser),
  cpp: () => import('@codemirror/lang-cpp').then((m) => m.cppLanguage.parser),
  python: () => import('@codemirror/lang-python').then((m) => m.pythonLanguage.parser),
  javascript: () => import('@codemirror/lang-javascript').then((m) => m.javascriptLanguage.parser),
};
const parsers = {};

function highlighted(code, parser) {
  const out = [];
  let line = [];
  highlightCode(code, parser.parse(code), classes,
    (text, cls) => line.push(cls ? <span key={line.length} className={cls}>{text}</span> : text),
    () => { out.push(line); line = []; });
  out.push(line);
  return out.map((parts, i) => <span key={i} className={styles.line}>{parts}{'\n'}</span>);
}

/** Read-only, syntax-highlighted code with line numbers; plain text until the grammar loads. */
export function CodeView({ code, language }) {
  const [parser, setParser] = useState(() => parsers[language] ?? null);
  useEffect(() => {
    let alive = true;
    if (parsers[language]) setParser(parsers[language]);
    else {
      setParser(null);
      PARSERS[language]?.().then((p) => { parsers[language] = p; if (alive) setParser(p); }, () => {});
    }
    return () => { alive = false; };
  }, [language]);

  return (
    <pre className={styles.view}>
      <code>{parser ? highlighted(code, parser) : code.split('\n').map((l, i) => <span key={i} className={styles.line}>{l}{'\n'}</span>)}</code>
    </pre>
  );
}
