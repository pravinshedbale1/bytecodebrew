import java from './java.js';
import cpp from './cpp.js';
import python from './python.js';
import javascript from './javascript.js';

/**
 * The languages a practice problem can be solved in. Each one builds a complete program from a spec,
 * the learner's code and some tests, and prints results in the same tagged format (see common.js),
 * so grading (check.js) is shared. Only Java runs the large-input performance tests for now.
 */
export const LANGS = { java, cpp, python, javascript };
export const LANG_IDS = Object.keys(LANGS);
export const DEFAULT_LANG = 'java';

export const langOf = (id) => LANGS[id] ?? LANGS[DEFAULT_LANG];
