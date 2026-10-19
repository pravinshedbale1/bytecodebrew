import { buildProgram, starterCode, cleanCompileOutput, LINE_OFFSET } from '../harness.js';
import { JUDGE0_JAVA } from '../../../config/services.js';

/** Java 17: the original harness (harness.js + support.js), the only one with performance tests so far. */
export default {
  id: 'java',
  label: 'Java',
  version: 'Java 17',
  judge0: JUDGE0_JAVA,
  perf: true,
  starter: starterCode,
  build: (spec, code, tests) => ({ source: buildProgram(spec, code, tests), lineOffset: LINE_OFFSET, userLines: Infinity }),
  compileError: (r) => (r.compile && !r.ok && /Compilation Error/i.test(r.status) ? cleanCompileOutput(r.compile) : null),
  cleanStderr: (text) => text,
  supports: () => true,
};
