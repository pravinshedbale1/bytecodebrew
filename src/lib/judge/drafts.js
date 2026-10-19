import { readJSON, writeJSON } from '../storage';
import { LANGS, DEFAULT_LANG } from './langs';

/**
 * The code a learner is writing, per problem and language, kept in this browser, and the language
 * they last picked (used for every problem until they pick another). Java drafts keep their original
 * key, so code written before other languages existed is still there.
 */
const LANG_KEY = 'bcb:lang';

export const codeKey = (slug, lang) => (lang === 'java' ? `bcb:code:${slug}` : `bcb:code:${slug}:${lang}`);

export function preferredLang() {
  const l = readJSON(LANG_KEY, DEFAULT_LANG);
  return LANGS[l] ? l : DEFAULT_LANG;
}
export const setPreferredLang = (lang) => writeJSON(LANG_KEY, lang);

export const readDraft = (slug, lang) => readJSON(codeKey(slug, lang), null);
export const writeDraft = (slug, lang, code) => writeJSON(codeKey(slug, lang), code);

/** The draft in the learner's current language (mock interview feedback reads this). */
export function currentDraft(slug) {
  const lang = preferredLang();
  return { lang, label: LANGS[lang].label, code: readDraft(slug, lang) };
}
