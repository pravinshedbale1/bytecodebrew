/**
 * "Get it reviewed by ChatGPT / Claude / Gemini": one structured prompt with everything from a mock
 * (the question, time per phase, notes, code, transcript, self-assessment), opened in the assistant's
 * own chat. ChatGPT and Claude accept the prompt in the link; Gemini doesn't, so it is copied for the
 * learner to paste. Long prompts are always copied, because very long links get cut off.
 */

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const FOCUS = {
  dsa: 'problem understanding and clarifying questions, the brute force and the path to the optimal approach, correctness of the code (find real bugs and missed edge cases), code quality, time and space complexity, and how clearly I communicated',
  hld: 'requirements and scope, estimates, API and data model, the high-level design, depth and judgement in the deep dives (trade-offs, scaling, consistency, failure handling), and how clearly I drove the conversation',
  lld: 'requirements, the entities and their relationships, class design and responsibilities, sensible use of design patterns, extensibility, concurrency and error handling in the core code, and clarity',
  behavioral: 'structure (STAR), how specific and measurable each story is, ownership and what I personally did, judgement and self-reflection, and how well each answer fits the question asked',
};

/** The review prompt for a mock. `mock` has the same shape as a saved mock. */
export function buildReviewPrompt(type, typeId, mock) {
  const { prompt, notes = '', code = '', chat = [], phases, rubric = {}, signal, seconds = 0 } = mock;
  const lines = [];
  lines.push(`You are a senior engineer who has run hundreds of ${type.title} interviews at top tech companies. Review my mock interview below and give candid, specific feedback. Base every point on evidence from my notes, code or transcript, and say when there isn't enough evidence.`);
  lines.push('');
  lines.push('## The question');
  lines.push(`${prompt.title}${prompt.href ? ` (${prompt.href})` : ''}`);
  if (prompt.summary) lines.push(prompt.summary);
  if (prompt.questions) prompt.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  lines.push('');
  lines.push('## The round');
  lines.push(`${type.minutes}-minute ${type.title} round. I used ${mmss(seconds)}.`);
  if (phases?.length) lines.push(`Time per phase (used / planned): ${phases.map((p) => `${p.name} ${mmss(p.used)} / ${mmss(p.planned)}`).join('; ')}.`);
  lines.push('');
  lines.push('## My notes / scratchpad');
  lines.push(notes.trim() ? notes.trim() : '(I did not write notes.)');
  if (code?.trim()) {
    lines.push('');
    lines.push('## My final code (Java)');
    lines.push('```java');
    lines.push(code.trim());
    lines.push('```');
  }
  const transcript = chat.filter((m) => !m.hidden && m.content);
  if (transcript.length) {
    lines.push('');
    lines.push('## Interview transcript');
    transcript.forEach((m) => lines.push(`${m.role === 'assistant' ? 'Interviewer' : 'Me'}: ${m.content.replace(/^\[[^\]]*\]\s*/, '')}`));
  }
  const ticked = type.rubric.map((r) => `- [${rubric[r] ? 'x' : ' '}] ${r}`);
  if (Object.keys(rubric).length || signal) {
    lines.push('');
    lines.push('## My self-assessment');
    lines.push(...ticked);
    if (signal) lines.push(`My own hire signal: ${signal.replace(/-/g, ' ')}`);
  }
  lines.push('');
  lines.push('## What I want from you');
  lines.push('1. **Overall signal**: Strong no / Lean no / Lean hire / Strong hire, with one sentence why.');
  lines.push('2. **What went well**: up to 3 specific points.');
  lines.push(`3. **Gaps**: judge ${FOCUS[typeId] ?? 'each part of the round'}. Be specific and actionable.`);
  if (code?.trim()) lines.push('4. **Code review**: is it correct? Point out bugs and missed edge cases, and the optimal time and space complexity. Describe a better approach if there is one, without rewriting all the code unless I ask.');
  if (typeId === 'hld' || typeId === 'lld') lines.push('4. **What a strong answer would add**: the key components, trade-offs or classes I missed.');
  lines.push(`${code?.trim() || typeId === 'hld' || typeId === 'lld' ? '5' : '4'}. **Where my self-assessment is off**: only the items you disagree with.`);
  lines.push(`${code?.trim() || typeId === 'hld' || typeId === 'lld' ? '6' : '5'}. **Practise next**: the 3 most valuable things to work on before my next interview.`);
  lines.push('');
  lines.push('Use short headings and bullet points.');
  return lines.join('\n');
}

export const ASSISTANTS = [
  { id: 'chatgpt', name: 'ChatGPT', url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`, prefill: true },
  { id: 'claude', name: 'Claude', url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`, prefill: true },
  { id: 'gemini', name: 'Gemini', url: () => 'https://gemini.google.com/app', prefill: false },
];

// Links much longer than this risk being cut off by the browser or the assistant's servers
const MAX_URL = 7500;

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/**
 * Open the assistant with the prompt. Always copies the prompt too, so the learner can paste it if the
 * assistant does not pick it up. Returns 'prefilled' or 'paste'.
 */
export async function openInAssistant(assistant, prompt) {
  await copyText(prompt);
  const link = assistant.url(prompt);
  const prefilled = assistant.prefill && link.length <= MAX_URL;
  window.open(prefilled ? link : assistant.url(''), '_blank', 'noopener');
  return prefilled ? 'prefilled' : 'paste';
}
