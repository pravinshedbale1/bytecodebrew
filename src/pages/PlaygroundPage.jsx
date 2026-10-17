import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Play, RotateCcw, Info, Keyboard } from 'lucide-react';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { runJava } from '../lib/judge0';
import { CodeEditor } from '../components/solve/CodeEditor';
import { takeHandoff } from '../lib/playground';
import { readJSON, writeJSON } from '../lib/storage';
import { getLessonContext } from '../curriculum';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './PlaygroundPage.module.css';

const STORAGE = 'bcb:playground';
const STARTER = `import java.util.*;

public class Main {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[] { j, i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[] { 2, 7, 11, 15 }, 9)));   // [0, 1]
    }
}
`;

export function PlaygroundPage() {
  const [code, setCode] = useState(() => readJSON(STORAGE, null)?.code ?? STARTER);
  const [stdin, setStdin] = useState(() => readJSON(STORAGE, null)?.stdin ?? '');
  const [from, setFrom] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const h = takeHandoff();
    if (h) {
      setCode(h.code);
      setFrom(h.lessonKey);
      setResult(null);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => writeJSON(STORAGE, { code, stdin }), 300);
    return () => clearTimeout(t);
  }, [code, stdin]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      setResult(await runJava(code, stdin));
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const lesson = from ? (() => { const [t, c, l] = from.split('/'); return getLessonContext(t, c, l)?.lesson; })() : null;

  const rail = (
    <>
      <RailCard title="How it works" icon={<Info size={14} aria-hidden="true" />}>
        <ul className={styles.notes}>
          <li>Java 17. The program must have <code>public class Main</code> with a <code>main</code> method.</li>
          <li>Code runs on Judge0’s free public runner, not in your browser: don’t paste secrets.</li>
          <li>Your code is kept in this browser between visits.</li>
          <li>“Open in playground” on a Java block in a DSA lesson brings it here, wrapped in a Main class. Snippets that use code from elsewhere in the lesson may need it pasted in too.</li>
        </ul>
      </RailCard>
      <RailCard title="Shortcuts" icon={<Keyboard size={14} aria-hidden="true" />}>
        <ul className={styles.notes}>
          <li><kbd>Ctrl/⌘ Enter</kbd> run</li>
          <li><kbd>Tab</kbd> indent four spaces</li>
        </ul>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Practise</p>
        <h1 className={page.title}>Code playground</h1>
        <p className={page.lead}>
          A scratchpad for free-form Java: change a lesson's code, break it, print things. To solve a problem with
          tests that check your answer, pick one on the <Link to="/problems">Problems</Link> page.
          {lesson && <> Opened from <Link to={lesson.path}>{lesson.title}</Link>.</>}
        </p>
      </header>

      <div className={styles.editorWrap}>
        <div className={styles.toolbar}>
          <span className={styles.file}>Main.java</span>
          <div className={ui.row}>
            <button type="button" className={`${ui.btn} ${ui.small} ${ui.ghost}`} onClick={() => { setCode(STARTER); setFrom(null); setResult(null); }}>
              <RotateCcw size={13} /> Reset
            </button>
            <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={run} disabled={running}>
              <Play size={13} /> {running ? 'Running…' : 'Run'}
            </button>
          </div>
        </div>
        <CodeEditor value={code} onChange={setCode} onRun={run} />
      </div>

      <div className={styles.io}>
        <div>
          <label className={ui.label} htmlFor="stdin">Input (stdin)</label>
          <textarea id="stdin" className={`${ui.textarea} ${styles.mono}`} value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="Optional input for Scanner / BufferedReader" />
        </div>
        <div>
          <p className={ui.label}>
            Output
            {result && (
              <span className={`${styles.status} ${result.ok ? styles.ok : styles.bad}`}>
                {result.status}{result.time ? ` · ${result.time}s` : ''}{result.memory ? ` · ${Math.round(result.memory / 1024)} MB` : ''}
              </span>
            )}
          </p>
          <pre className={styles.output} aria-live="polite">
            {error ? <span className={styles.err}>{error}</span>
              : running ? 'Compiling and running…'
              : !result ? 'Press Run to see the output.'
              : <>
                  {result.compile && <span className={styles.err}>{result.compile}</span>}
                  {result.stdout}
                  {result.stderr && <span className={styles.err}>{result.stderr}</span>}
                  {result.message && !result.compile && <span className={styles.err}>{result.message}</span>}
                  {!result.compile && !result.stdout && !result.stderr && '(no output)'}
                </>}
          </pre>
        </div>
      </div>
    </PageLayout>
  );
}
