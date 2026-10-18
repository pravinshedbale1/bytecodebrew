/**
 * "Turn my highlights into a revision sheet": one prompt with the learner's highlights and notes, grouped by
 * lesson, asking an AI assistant for the crisp, last-minute-before-the-interview version of each topic.
 * Opened in ChatGPT / Claude / Gemini through lib/aiReview's openInAssistant.
 *
 * `groups` = [{ title, where, items: [{ exact, note, color }] }], in reading order.
 */
export function buildSummaryPrompt(groups) {
  const one = groups.length === 1;
  const lines = [];
  lines.push(
    `I'm preparing for software engineering interviews. Below are the lines I highlighted (and my own notes) while studying ${one ? `the lesson "${groups[0].title}"` : `${groups.length} lessons`}. ` +
    'Turn them into my last-minute revision sheet: the cream of the knowledge, something I can read in the 15 minutes before an interview.',
  );
  lines.push('');
  lines.push('## My highlights');
  for (const g of groups) {
    lines.push('');
    lines.push(`### ${g.title}${g.where ? ` (${g.where})` : ''}`);
    for (const h of g.items) {
      lines.push(`- "${h.exact.replace(/\s+/g, ' ').trim()}"`);
      if (h.note?.trim()) lines.push(`  - My note: ${h.note.replace(/\s+/g, ' ').trim()}`);
    }
  }
  lines.push('');
  lines.push('## How to write it');
  lines.push(`For ${one ? 'the topic' : 'each topic'}:`);
  lines.push('1. **The heart of it**: one sentence that captures the core idea, the way a senior engineer would say it.');
  lines.push('2. **Must-know points**: 3 to 6 crisp bullets, each one line. Keep numbers, complexities, limits and trade-offs exact.');
  lines.push('3. **Say it in the interview**: a 2 to 3 sentence answer I could give out loud if asked about this topic.');
  lines.push('4. **Traps**: the 1 or 2 mistakes or follow-up questions interviewers use to catch people out.');
  if (!one) lines.push('Then end with **If you remember only 5 things**: the five most important points across all topics.');
  lines.push('');
  lines.push('Rules: build on my highlights and notes, and correct anything in them that is wrong. If something important is clearly missing, add it and mark it "(added)". No long explanations or filler: short bullets, bold key terms, and a memory hook or analogy where one helps it stick.');
  return lines.join('\n');
}
