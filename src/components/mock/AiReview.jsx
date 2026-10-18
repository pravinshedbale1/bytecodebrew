import { useMemo } from 'react';
import { MessageSquareText } from 'lucide-react';
import { buildReviewPrompt } from '../../lib/aiReview';
import { SendToAi } from '../ai/SendToAi';
import styles from './Mock.module.css';

/**
 * "Get feedback from an AI": opens ChatGPT, Claude or Gemini with a structured review prompt built from
 * the mock. Free for the learner (it uses their own assistant account) and needs no API key.
 */
export function AiReview({ type, typeId, mock }) {
  const prompt = useMemo(() => buildReviewPrompt(type, typeId, mock), [type, typeId, mock]);
  const empty = !mock.notes?.trim() && !mock.code?.trim() && !(mock.chat ?? []).some((m) => !m.hidden);

  return (
    <div className={styles.review}>
      <p className={styles.reviewHead}><MessageSquareText size={16} aria-hidden="true" /> Get feedback from an AI</p>
      <p className={styles.reviewText}>
        Sends the question, your time per phase, notes{mock.code ? ', code' : ''}{(mock.chat ?? []).length ? ', the interview transcript' : ''} and
        your self-assessment as one structured review request. It opens in your own account, so there's no API key and nothing extra to pay.
      </p>
      {empty && <p className={styles.reviewWarn}>Your notes are empty, so the review will be thin. Jot down your approach first for useful feedback.</p>}
      <SendToAi prompt={prompt} verb="Review with" />
    </div>
  );
}
