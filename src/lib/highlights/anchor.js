/**
 * Text anchoring for highlights, independent of React's DOM.
 *
 * A highlight is stored as the exact text plus a little context before and after it
 * (like the W3C "text quote selector") and its approximate position. To show it again,
 * we search the lesson's text for the quote and pick the occurrence whose context matches best.
 *
 * Text inside interactive or generated parts (visualisers, buttons, form fields, SVG) is
 * skipped, so highlights only ever cover reading text. Opened practice answers can be highlighted.
 */
const SKIP = 'figure, button, input, textarea, select, svg, script, style, [data-no-highlight]';
const CONTEXT = 32;

/** All readable text nodes under root, with their start/end offsets in the joined text. */
export function textIndex(root) {
  const nodes = [];
  let text = '';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const el = node.parentElement;
      if (!el || el.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push({ node: n, start: text.length, end: text.length + n.nodeValue.length });
    text += n.nodeValue;
  }
  return { nodes, text };
}

/** Offset in the joined text for a DOM boundary point (container, offset). */
function pointToOffset(index, container, offset, isEnd) {
  if (container.nodeType === Node.TEXT_NODE) {
    const entry = index.nodes.find((e) => e.node === container);
    if (entry) return entry.start + Math.min(offset, entry.node.nodeValue.length);
  }
  // Element boundary, or a skipped text node: snap to the nearest indexed text.
  const probe = document.createRange();
  probe.setStart(container, offset);
  probe.collapse(true);
  if (isEnd) {
    for (let i = index.nodes.length - 1; i >= 0; i--) {
      const e = index.nodes[i];
      if (probe.comparePoint(e.node, 0) <= 0) return e.end;      // node starts before (or at) the point
    }
    return 0;
  }
  for (const e of index.nodes) {
    if (probe.comparePoint(e.node, 0) >= 0) return e.start;      // first node at or after the point
  }
  return index.text.length;
}

/** Build an anchor from a DOM Range; null if it covers no readable text. */
export function rangeToAnchor(range, root) {
  const index = textIndex(root);
  const start = pointToOffset(index, range.startContainer, range.startOffset, false);
  const end = pointToOffset(index, range.endContainer, range.endOffset, true);
  const exact = index.text.slice(start, end);
  if (end <= start || !exact.trim()) return null;
  return {
    exact,
    prefix: index.text.slice(Math.max(0, start - CONTEXT), start),
    suffix: index.text.slice(end, end + CONTEXT),
    pos: start,
  };
}

/** Length of the common suffix of a and b (prefix context grows leftwards). */
function commonSuffix(a, b) {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++;
  return n;
}

function commonPrefix(a, b) {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

/** Find the anchor's best occurrence and return a DOM Range for it, or null. */
export function anchorToRange(anchor, index) {
  const { text, nodes } = index;
  const candidates = [];
  for (let i = text.indexOf(anchor.exact); i !== -1; i = text.indexOf(anchor.exact, i + 1)) candidates.push(i);
  if (!candidates.length) return null;
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const i of candidates) {
    const before = text.slice(Math.max(0, i - CONTEXT), i);
    const after = text.slice(i + anchor.exact.length, i + anchor.exact.length + CONTEXT);
    const score = commonSuffix(before, anchor.prefix) + commonPrefix(after, anchor.suffix)
      - Math.abs(i - (anchor.pos ?? i)) / 10000;                 // tiny tie-breaker: closest to the old position
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return offsetsToRange(nodes, best, best + anchor.exact.length);
}

function offsetsToRange(nodes, start, end) {
  const s = nodes.find((e) => start >= e.start && start < e.end);
  const t = nodes.find((e) => end > e.start && end <= e.end);
  if (!s || !t) return null;
  const range = document.createRange();
  range.setStart(s.node, start - s.start);
  range.setEnd(t.node, end - t.start);
  return range;
}

/** True if the DOM point lies inside the range (used to detect clicks on a highlight). */
export function rangeContainsPoint(range, node, offset) {
  try {
    return range.comparePoint(node, offset) === 0;
  } catch {
    return false;                                              // point in another document fragment
  }
}

export const highlightsSupported = typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';
