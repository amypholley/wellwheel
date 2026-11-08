// Translations. Text in the code stays in English; t('...') looks up the English text in the chosen
// language's dictionary (lib/i18n/<code>.json) and falls back to English when a line isn't translated yet.
// Placeholders like {n} are filled from the second argument: t('{n} of {c} today', { n: 1, c: 3 }).

export type Lang = { code: string; name: string; english: string; rtl?: boolean };
export const LANGS: Lang[] = [
  { code: 'en', name: 'English', english: 'English' },
  { code: 'es', name: 'Español', english: 'Spanish' },
  { code: 'fr', name: 'Français', english: 'French' },
  { code: 'de', name: 'Deutsch', english: 'German' },
  { code: 'pt', name: 'Português', english: 'Portuguese' },
  { code: 'it', name: 'Italiano', english: 'Italian' },
  { code: 'nl', name: 'Nederlands', english: 'Dutch' },
  { code: 'pl', name: 'Polski', english: 'Polish' },
  { code: 'ru', name: 'Русский', english: 'Russian' },
  { code: 'uk', name: 'Українська', english: 'Ukrainian' },
  { code: 'tr', name: 'Türkçe', english: 'Turkish' },
  { code: 'ar', name: 'العربية', english: 'Arabic', rtl: true },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi' },
  { code: 'zh', name: '简体中文', english: 'Chinese (Simplified)' },
  { code: 'ja', name: '日本語', english: 'Japanese' },
  { code: 'ko', name: '한국어', english: 'Korean' },
  { code: 'vi', name: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'id', name: 'Bahasa Indonesia', english: 'Indonesian' },
];

let cur = 'en';
let dict: Record<string, string> = {};

// Fill {name} placeholders
const fill = (s: string, v?: Record<string, any>) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? String(v[k]) : m)) : s);
export function t(s: string, v?: Record<string, any>): string {
  if (!s) return s;
  return fill(cur === 'en' ? s : dict[s] ?? s, v);
}
export const lang = () => cur;
// The locale to use for dates and numbers
export const loc = () => (cur === 'en' ? 'en-US' : cur === 'zh' ? 'zh-CN' : cur);

// For the worksheet and Adventures pages, which are drawn as plain HTML: translate one piece of on-screen text.
// Numbers are matched loosely, so "3 of 5 done" finds the entry "{0} of {1} done". Returns null when there's no translation.
let pats: [RegExp, string, string[]][] | null = null; // dictionary entries with {x}/{y} slots for names
const reEsc = (x: string) => x.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
function look(k: string): string | null {
  let r = dict[k];
  if (r !== undefined) return r;
  // numbers: "3 of 5 done" finds "{0} of {1} done"
  const nums: string[] = [];
  const kn = k.replace(/\d+(?:[.,]\d+)*/g, (m) => { nums.push(m); return '{' + (nums.length - 1) + '}'; });
  const back = (x: string) => x.replace(/\{(\d+)\}/g, (m, i) => nums[+i] ?? m);
  if (nums.length && dict[kn] !== undefined) return back(dict[kn]);
  // names: "Places in Texas" finds "Places in {x}"
  if (!pats) pats = Object.keys(dict).filter((e) => /\{[xy]\}/.test(e)).map((e) => {
    const names: string[] = [];
    const src = reEsc(e).replace(/\\?\{([xy])\\?\}/g, (m, n) => { names.push(n); return '(.+?)'; });
    return [new RegExp('^' + src + '$'), dict[e], names];
  });
  for (const [re, tr, names] of pats) {
    const m = kn.match(re); if (!m) continue;
    let out = tr;
    names.forEach((n, i) => { const v = back(m[i + 1]); out = out.replace('{' + n + '}', dict[v] ?? v); });
    return back(out);
  }
  // "+ Reading", "← Resources", "Debt →": translate the words, keep the symbol
  const sym = k.match(/^([+←→✓★•·]\s*)?(.*?)(\s*[→›]|\s*[:：])?$/);
  if (sym && (sym[1] || sym[3]) && sym[2] && dict[sym[2]] !== undefined) return (sym[1] || '') + dict[sym[2]] + (sym[3] || '');
  return null;
}
export function tdom(s: string): string | null {
  if (cur === 'en' || !s) return null;
  const k = s.trim(); if (!k || !/[A-Za-z]/.test(k)) return null;
  const r = look(k);
  return r === null || r === k ? null : s.replace(k, r);
}

const loaders: Record<string, () => Promise<any>> = {
  es: () => import('./i18n/es.json'), fr: () => import('./i18n/fr.json'), de: () => import('./i18n/de.json'),
  pt: () => import('./i18n/pt.json'), it: () => import('./i18n/it.json'), nl: () => import('./i18n/nl.json'),
  pl: () => import('./i18n/pl.json'), ru: () => import('./i18n/ru.json'), uk: () => import('./i18n/uk.json'),
  tr: () => import('./i18n/tr.json'), ar: () => import('./i18n/ar.json'), hi: () => import('./i18n/hi.json'),
  zh: () => import('./i18n/zh.json'), ja: () => import('./i18n/ja.json'), ko: () => import('./i18n/ko.json'),
  vi: () => import('./i18n/vi.json'), id: () => import('./i18n/id.json'),
};

const wloaders: Record<string, () => Promise<any>> = {
  es: () => import('./i18n/w/es.json'), fr: () => import('./i18n/w/fr.json'), de: () => import('./i18n/w/de.json'),
  pt: () => import('./i18n/w/pt.json'), it: () => import('./i18n/w/it.json'), nl: () => import('./i18n/w/nl.json'),
  pl: () => import('./i18n/w/pl.json'), ru: () => import('./i18n/w/ru.json'), uk: () => import('./i18n/w/uk.json'),
  tr: () => import('./i18n/w/tr.json'), ar: () => import('./i18n/w/ar.json'), hi: () => import('./i18n/w/hi.json'),
  zh: () => import('./i18n/w/zh.json'), ja: () => import('./i18n/w/ja.json'), ko: () => import('./i18n/w/ko.json'),
  vi: () => import('./i18n/w/vi.json'), id: () => import('./i18n/w/id.json'),
};

// Built-in content (pillar names, ready-made goals, prompts) is translated in place, keeping the English copy
const hooks: (() => void)[] = [];
export const onLangChange = (fn: () => void) => { hooks.push(fn); };

export async function setLang(code: string) {
  if (!LANGS.some((l) => l.code === code)) code = 'en';
  let d: Record<string, string> = {};
  if (code !== 'en' && loaders[code]) {
    try { const m = await loaders[code](); d = { ...((m.default || m) as Record<string, string>) }; } catch { d = {}; }
    // The worksheets' and Adventures' words live in a second file per language
    try { const w = wloaders[code] && (await wloaders[code]()); if (w) Object.assign(d, w.default || w); } catch {}
  }
  cur = code; dict = d; pats = null;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code;
    document.documentElement.dir = LANGS.find((l) => l.code === code)?.rtl ? 'rtl' : 'ltr';
  }
  try { localStorage.setItem('ww-lang', code); } catch {}
  hooks.forEach((fn) => fn());
}
// The language to start in: the one picked before, or the phone's own language if we have it
export function startLang() {
  try { const s = localStorage.getItem('ww-lang'); if (s) return s; } catch {}
  if (typeof navigator !== 'undefined') {
    for (const l of navigator.languages || [navigator.language]) { const c = (l || '').toLowerCase().split('-')[0]; if (LANGS.some((x) => x.code === c)) return c; }
  }
  return 'en';
}
