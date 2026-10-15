import { Link } from 'react-router';
import { QUESTIONS, THEME_INFO, AMAZON_LP_QUESTIONS } from '../../data/behavioralQuestions';
import styles from './QuestionList.module.css';

/**
 * The shared behavioral question bank, rendered as grouped lists.
 *   <QuestionList />                 every theme
 *   <QuestionList theme="conflict" /> one theme
 *   <QuestionList source="amazon" />  grouped by Amazon Leadership Principle
 */
export function QuestionList({ theme, source = 'themes' }) {
  if (source === 'amazon') {
    return (
      <div className={styles.list}>
        {Object.entries(AMAZON_LP_QUESTIONS).map(([lp, qs]) => (
          <section key={lp} className={styles.group}>
            <p className={styles.groupTitle}>{lp}</p>
            <ol>{qs.map((q) => <li key={q}>{q}</li>)}</ol>
          </section>
        ))}
      </div>
    );
  }
  const themes = theme ? [theme] : Object.keys(THEME_INFO);
  return (
    <div className={styles.list}>
      {themes.map((t) => {
        const qs = QUESTIONS.filter((q) => q.theme === t);
        return (
          <section key={t} className={styles.group}>
            <p className={styles.groupTitle}>
              <Link to={THEME_INFO[t].lesson}>{THEME_INFO[t].label}</Link>
              <span className={styles.count}>{qs.length}</span>
            </p>
            <ol>{qs.map((q) => <li key={q.text}>{q.text}</li>)}</ol>
          </section>
        );
      })}
    </div>
  );
}
