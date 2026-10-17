/**
 * A tiny, safe markdown renderer for AI replies: headings, bullet and numbered lists, paragraphs,
 * **bold**, *italic* and `code`. Everything is rendered as React text, never as HTML.
 */
function inline(text, keyBase) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function MiniMarkdown({ text }) {
  const blocks = [];
  let list = null;
  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };
  text.split('\n').forEach((raw, n) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/);
    const heading = line.match(/^#{1,4}\s+(.*)/);
    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        flush();
        list = { type, items: [] };
      }
      list.items.push((bullet ?? numbered)[1]);
      return;
    }
    flush();
    if (!line.trim()) return;
    if (heading) blocks.push({ type: 'h', text: heading[1] });
    else blocks.push({ type: 'p', text: line, n });
  });
  flush();

  return blocks.map((b, i) => {
    if (b.type === 'h') return <p key={i}><strong>{inline(b.text, i)}</strong></p>;
    if (b.type === 'p') return <p key={i}>{inline(b.text, i)}</p>;
    const L = b.type;
    return <L key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</L>;
  });
}
