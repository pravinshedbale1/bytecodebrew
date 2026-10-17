/**
 * Reads the messages of a Mermaid sequence diagram from its source, in order, with the names of
 * the participants and the alt/else/opt/loop branch each one belongs to. Used to step through
 * sequence diagrams one message at a time.
 */
const ARROW = /^\s*([^\s:+-][^:]*?)\s*(-->>|->>|-->|->|--x|-x|--\)|-\))\s*[+-]?\s*([^:]+?)\s*:\s*(.*)$/;
const BLOCK = /^\s*(alt|else|opt|loop|par|and|critical|break|rect)\b\s*(.*)$/;

export function parseSequence(chart) {
  const names = {};
  const stack = [];
  const messages = [];
  for (const raw of chart.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('%%')) continue;
    const p = /^(participant|actor)\s+(\S+)(?:\s+as\s+(.+))?$/.exec(line);
    if (p) { names[p[2]] = p[3]?.trim() ?? p[2]; continue; }
    const b = BLOCK.exec(line);
    if (b) {
      if (b[1] === 'else' || b[1] === 'and') stack.pop();
      if (b[1] !== 'rect') stack.push(b[2].trim());
      else stack.push(null);
      continue;
    }
    if (line === 'end') { stack.pop(); continue; }
    const m = ARROW.exec(line);
    if (m) {
      const from = m[1].trim();
      const to = m[3].trim();
      messages.push({
        from: names[from] ?? from,
        to: names[to] ?? to,
        label: m[4].trim().replace(/<br\s*\/?>/gi, ' '),
        reply: m[2].startsWith('--'),
        branch: stack.filter(Boolean).at(-1) ?? null,
      });
    }
  }
  return messages;
}
