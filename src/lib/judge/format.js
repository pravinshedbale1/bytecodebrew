/**
 * "Format code" in the solver, in the learner's browser (no server): Prettier for Java (with
 * prettier-plugin-java) and JavaScript, clang-format (WebAssembly) for C++, Ruff's formatter
 * (WebAssembly) for Python. Each formatter loads the first time its language is formatted.
 * The style matches the starter code: 4-space indents, lines up to 100 characters.
 */
const WIDTH = 100;
const CPP_STYLE = `{BasedOnStyle: Google, IndentWidth: 4, AccessModifierOffset: -4, ColumnLimit: ${WIDTH}, AllowShortFunctionsOnASingleLine: Empty, AllowShortIfStatementsOnASingleLine: Never, AllowShortLoopsOnASingleLine: false, DerivePointerAlignment: false}`;

const loaders = {
  java: async () => {
    const [{ format }, java] = await Promise.all([import('prettier/standalone'), import('prettier-plugin-java')]);
    return (code) => format(code, { parser: 'java', plugins: [java.default ?? java], tabWidth: 4, printWidth: WIDTH });
  },
  javascript: async () => {
    const [{ format }, babel, estree] = await Promise.all([import('prettier/standalone'), import('prettier/plugins/babel'), import('prettier/plugins/estree')]);
    return (code) => format(code, { parser: 'babel', plugins: [babel, estree], tabWidth: 4, printWidth: WIDTH });
  },
  cpp: async () => {
    const m = await import('@wasm-fmt/clang-format/vite');
    await m.default();
    return (code) => m.format(code, 'main.cpp', CPP_STYLE);
  },
  python: async () => {
    const m = await import('@wasm-fmt/ruff_fmt/vite');
    await m.default();
    return (code) => m.format(code, 'main.py', { indent_width: 4, line_width: WIDTH });
  },
};

const ready = {};

/** The first line of a formatter's complaint, which is usually where the code doesn't parse. */
function reason(e) {
  const text = String(e?.message ?? e ?? '').replace(/\u001b\[[0-9;]*m/g, '');
  const line = e?.loc?.start?.line;
  const first = text.split('\n').find((l) => l.trim()) ?? 'the code could not be read';
  return line && !/line \d|\(\d+:\d+\)/i.test(first) ? `${first} (line ${line})` : first;
}

/** Format `code` in `lang` (java, cpp, python, javascript). Throws an Error with a readable message. */
export async function formatCode(code, lang) {
  if (!loaders[lang]) throw new Error(`Formatting isn't available for ${lang}.`);
  ready[lang] ??= loaders[lang]().catch((e) => { delete ready[lang]; throw e; });
  let fmt;
  try {
    fmt = await ready[lang];
  } catch {
    throw new Error('Could not load the formatter. Check your connection and try again.');
  }
  try {
    // one newline at the end, whatever the formatter left
    return `${(await fmt(code)).replace(/\s+$/, '')}\n`;
  } catch (e) {
    throw new Error(`Couldn't format: ${reason(e)}. Fix that first, then format again.`);
  }
}
