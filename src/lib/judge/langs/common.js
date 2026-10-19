import { extrasFor } from '../harness.js';

/**
 * Helpers shared by the C++, Python and JavaScript harnesses. Each harness prints the same tagged
 * lines as the Java one (see support.js), so parseOutput and the checker work for every language:
 *   \u0001BCB|<test>|<json>            a result
 *   \u0001BCB|<test>|!<error>@L<line>  an exception (line in the combined file, -1 when unknown)
 * The harnesses print a newline before each tag, so a learner's print without a newline can't hide it.
 */

/** A JSON text as a string literal; valid C++, Python and JavaScript. */
export const lit = (text) => JSON.stringify(text);

/** A custom call snippet with $0, $1… replaced by the test's inputs as string literals. */
export const fill = (snippet, inputs) => snippet.replace(/\$(\d+)/g, (_, k) => lit(inputs[Number(k)]));

/** Every type a spec mentions (parameters, return, design constructor and methods). */
export function typesOf(spec) {
  return [
    ...(spec.params ?? []).map(([t]) => t),
    ...(spec.starterParams ?? []).map(([t]) => t),
    spec.returns,
    ...(spec.design ? [...spec.design.ctor.map(([t]) => t), ...spec.design.methods.flatMap(([r, , ps]) => [r, ...ps.map(([t]) => t)])] : []),
  ].filter(Boolean);
}

/** The provided classes a spec needs: the Java list (TreeNode, ListNode, GraphNode…) plus Iterator. */
export function extrasOf(spec) {
  const names = new Set(extrasFor(spec));
  if (typesOf(spec).includes('Iterator<Integer>')) names.add('Iterator');
  return names;
}

/** Lines in `text` when it ends with a newline (the line offset of whatever comes after it). */
export const linesIn = (text) => text.split('\n').length - 1;

/** Replaces `file:<line>` style references in compiler or interpreter output with the learner's own line numbers. */
export function mapLines(text, pattern, lineOffset, userLines, render) {
  return (text ?? '').replace(pattern, (...m) => {
    const n = Number(m[1]) - lineOffset;
    return render(n >= 1 && n <= userLines ? n : null, m);
  });
}
