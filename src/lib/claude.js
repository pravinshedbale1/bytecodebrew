import { CLAUDE_MODEL } from '../config/services';
import { readJSON, writeJSON } from './storage';

/**
 * The AI interviewer calls the Claude API straight from the browser with the learner's own API key.
 * The key stays in this browser's localStorage only: it is never synced to the account or sent anywhere
 * except api.anthropic.com. The SDK is loaded on first use so it never weighs on normal pages.
 */
const KEY = 'bcb:anthropic-key';

export const getApiKey = () => readJSON(KEY, '') || '';
export const setApiKey = (k) => writeJSON(KEY, k.trim());
export const clearApiKey = () => writeJSON(KEY, '');

let sdk = null;
const loadSdk = () => (sdk ??= import('@anthropic-ai/sdk').then((m) => m.default));

function friendlyError(Anthropic, e) {
  if (e instanceof Anthropic.AuthenticationError) return 'That API key was rejected. Check it in the AI interviewer settings.';
  if (e instanceof Anthropic.PermissionDeniedError) return 'This API key is not allowed to use the model.';
  if (e instanceof Anthropic.RateLimitError) return 'Rate limited by the Claude API. Wait a moment and try again.';
  if (e instanceof Anthropic.APIUserAbortError) return null;
  if (e instanceof Anthropic.APIConnectionError) return 'Could not reach the Claude API. Check your connection.';
  if (e instanceof Anthropic.APIError) return `Claude API error ${e.status ?? ''}: ${e.message}`;
  return e?.message ?? 'Something went wrong.';
}

/**
 * Stream one reply. `onText(delta)` receives text as it arrives; resolves to the full text.
 * Opus 5.5 always thinks; effort controls how much (low for chat turns, medium for written feedback).
 */
export async function streamClaude({ system, messages, effort = 'low', maxTokens = 16000, onText, signal }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Add your Claude API key first.');
  const Anthropic = await loadSdk();
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const stream = client.beta.messages.stream(
      {
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
        output_config: { effort },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      },
      { signal },
    );
    stream.on('text', (t) => onText?.(t));
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('The model declined to answer that. Try rephrasing.');
    return msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  } catch (e) {
    const text = friendlyError(Anthropic, e);
    if (text == null) return null;     // aborted by the user
    throw new Error(text);
  }
}
