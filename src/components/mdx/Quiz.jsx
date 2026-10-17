import { useEffect, useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import { useLessonKey } from '../lesson/LessonContext';
import { recordQuizAnswer, useQuizResults } from '../../hooks/useLearning';
import { loadLessonQuiz, quizId } from '../../data/quizzes';
import ui from '../common/ui.module.css';
import styles from './Quiz.module.css';

/**
 * One multiple-choice question. The choice locks on click, then the right answer and the reason show.
 * `onAnswer(correct)` fires once per attempt.
 */
export function MultipleChoice({ question, number, onAnswer, initialChoice = null }) {
  const [choice, setChoice] = useState(initialChoice);
  const answered = choice != null;

  const pick = (i) => {
    if (answered) return;
    setChoice(i);
    onAnswer?.(i === question.answer);
  };

  return (
    <div className={styles.question}>
      <p className={styles.q}>
        {number != null && <span className={styles.num}>{number}.</span>}
        {question.q}
      </p>
      <ul className={styles.options}>
        {question.options.map((opt, i) => {
          const state = !answered ? '' : i === question.answer ? styles.right : i === choice ? styles.wrong : styles.dim;
          return (
            <li key={opt}>
              <button type="button" className={`${styles.option} ${state}`} onClick={() => pick(i)} disabled={answered} aria-pressed={choice === i}>
                <span className={styles.marker} aria-hidden="true">
                  {answered && i === question.answer ? <Check size={14} strokeWidth={2.5} /> : answered && i === choice ? <X size={14} strokeWidth={2.5} /> : String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <p className={`${styles.why} ${choice === question.answer ? styles.whyRight : styles.whyWrong}`} role="status">
          <strong>{choice === question.answer ? 'Correct. ' : 'Not quite. '}</strong>
          {question.why}
        </p>
      )}
    </div>
  );
}

/**
 * A short quiz. Inside a lesson, answers are saved; a missed question joins the review deck.
 *   <Quiz questions={[{ q, options, answer, why }]} />
 */
export function Quiz({ questions, title = 'Quick check', intro }) {
  const lessonKey = useLessonKey();
  const results = useQuizResults();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState({ answered: 0, correct: 0 });

  const saved = lessonKey ? results[lessonKey] : null;
  const firstScore = saved ? Object.values(saved).filter((r) => r.first).length : 0;
  const firstCount = saved ? Object.keys(saved).length : 0;

  const answer = (i, correct) => {
    setScore((s) => ({ answered: s.answered + 1, correct: s.correct + (correct ? 1 : 0) }));
    if (lessonKey) recordQuizAnswer(lessonKey, quizId(questions[i]), correct);
  };
  const retake = () => {
    setRound((r) => r + 1);
    setScore({ answered: 0, correct: 0 });
  };
  const done = score.answered === questions.length;

  return (
    <section className={styles.quiz} aria-label={title}>
      <header className={styles.head}>
        <p className={styles.label}>{title}</p>
        <p className={styles.meta}>
          {intro ?? `${questions.length} question${questions.length === 1 ? '' : 's'} · pick an answer before you scroll on`}
          {firstCount > 0 && score.answered === 0 && <> · first try: {firstScore}/{firstCount}</>}
        </p>
      </header>
      <div key={round}>
        {questions.map((q, i) => (
          <MultipleChoice key={q.q} question={q} number={i + 1} onAnswer={(ok) => answer(i, ok)} />
        ))}
      </div>
      {done && (
        <footer className={styles.result}>
          <span>
            <strong>{score.correct}/{questions.length}</strong>
            {score.correct === questions.length
              ? ' — solid. This lesson is ready to mark complete.'
              : lessonKey
                ? ' — the ones you missed are now in your review deck.'
                : ' — reread the sections behind the ones you missed.'}
          </span>
          <button type="button" className={`${ui.btn} ${ui.small}`} onClick={retake}>
            <RotateCcw size={13} /> Retake
          </button>
        </footer>
      )}
    </section>
  );
}

/** The end-of-lesson quick check, loaded from src/data/quizzes; renders nothing if the lesson has none. */
export function LessonQuiz({ lessonKey }) {
  const [questions, setQuestions] = useState(null);
  useEffect(() => {
    let alive = true;
    setQuestions(null);
    loadLessonQuiz(lessonKey).then((qs) => alive && setQuestions(qs));
    return () => { alive = false; };
  }, [lessonKey]);
  if (!questions?.length) return null;
  return <Quiz questions={questions} title="Check your understanding" />;
}
