import { PillarId, PILLARS, PROMPTS, CHALLENGE } from './data';
import { lang, loc, t } from './i18n';

/* ---------- types ---------- */
export type Goal = {
  id: string; pillar: PillarId; title: string; type: 'habit' | 'target';
  count: number; per: 'day' | 'week'; unit: string;
  amt?: boolean; step?: number; stepLabel?: string;
  target?: number; why: string; deadline: string; sure: number; example?: boolean;
  created?: string; // YYYY-MM-DD the goal was made
  coupleId?: string | null; ownerId?: string; // shared with a partner when coupleId is set
};
export type Gratitude = { id: string; date: string; text: string; example?: boolean };
export type JournalEntry = { pillar: PillarId; prompt: string; label?: string; text: string; example?: boolean };
export type State = {
  goals: Goal[];
  logs: Record<string, Record<string, number>>; // goalId -> day -> amount
  gratitude: Gratitude[];
  journal: Record<string, JournalEntry>; // day -> entry
  tools: Record<string, any>; // worksheet answers, one record per worksheet
  by: Record<string, Record<string, number>>; // goalId -> userId -> total logged (who added what)
  me: string; // my user id ('' for guests)
  couple: CoupleInfo | null; // my partner, if connected
  coupleData: Record<string, any>; // things we share: bucket, couples workbook, joint money plan
  partnerPlaces: Record<string, any>; // partner's travel-map places (for the Together map)
};
export type CoupleInfo = { couple_id: string; partner_id: string; partner_name: string; partner_username: string; since: string };
export const blankState = (): State => ({ goals: [], logs: {}, gratitude: [], journal: {}, tools: {}, by: {}, me: '', couple: null, coupleData: {}, partnerPlaces: {} });
export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));

/* ---------- dates ---------- */
export const pad = (n: number) => String(n).padStart(2, '0');
export const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
export function today() {
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const dow = TODAY.getDay(); // weeks run Sunday to Saturday
  const weekStart = addDays(TODAY, -dow);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return { TODAY, T: key(TODAY), weekStart, weekDays };
}
export const fmtDate = (k: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  k ? fromKey(k).toLocaleDateString(loc(), opts) : '';
export const fmtNum = (n: number, unit: string) =>
  unit === '$' ? '$' + Number(n).toLocaleString(loc()) : Number(n).toLocaleString(loc()) + (unit === 'done' ? '' : ' ' + unit);

/* ---------- goal math ---------- */
export const dayVal = (S: State, g: Goal, k: string) => (S.logs[g.id] || {})[k] || 0;
export const total = (S: State, g: Goal) => Object.values(S.logs[g.id] || {}).reduce((a, b) => a + b, 0);
export const weekSum = (S: State, g: Goal) => today().weekDays.reduce((a, d) => a + dayVal(S, g, key(d)), 0);
export function goalWeekScore(S: State, g: Goal) {
  const { TODAY, weekDays } = today();
  if (g.type === 'target') return Math.min(1, total(S, g) / (g.target || 1));
  if (g.per === 'week') return Math.min(1, weekSum(S, g) / g.count);
  const elapsed = weekDays.filter((d) => d <= TODAY);
  const s = elapsed.reduce((a, d) => a + Math.min(g.count, dayVal(S, g, key(d))), 0);
  return s / (g.count * elapsed.length);
}
export function pillarScore(S: State, pid: PillarId): number | null {
  const gs = S.goals.filter((g) => g.pillar === pid);
  if (!gs.length) return null;
  return gs.reduce((a, g) => a + goalWeekScore(S, g), 0) / gs.length;
}
export function smartSentence(g: Partial<Goal>) {
  const by = g.deadline ? t(' by {date}', { date: fmtDate(g.deadline) }) : '';
  const raw = g.title || t('my goal');
  const title = lang() === 'en' ? raw.toLowerCase() : raw;
  let s: string;
  if (g.type === 'habit') {
    const c = Number(g.count).toLocaleString(loc());
    const freq = g.per === 'day' ? (g.count === 1 ? t('every day') : t('{c} {unit} a day', { c, unit: t(g.unit || '') })) : t('{c} {unit} a week', { c, unit: t(g.unit || '') });
    s = t('I will {title} {freq}, starting today and keeping it up{by}', { title, freq, by });
  } else {
    s = g.unit === 'done' ? t('I will {title}{by}', { title, by }) : t('I will {title}: {amount}{by}', { title, amount: fmtNum(g.target || 0, g.unit || ''), by });
  }
  const why = g.why ? g.why.replace(/\.$/, '').replace(/^./, (c) => (lang() !== 'en' || /^I\b/.test(g.why || '') ? c : c.toLowerCase())) : '';
  return s + (why ? t(', because {why}', { why }) : '') + '.';
}

/* ---------- journal prompt ---------- */
// challenge: false hides the 30-day challenge prompts (a Plus feature) and uses the regular daily prompts
export function todaysPrompt(S: State, shift: number, challenge = true): { pillar: PillarId; text: string; label: string } {
  const { TODAY, T } = today();
  const saved = S.journal[T];
  if (saved && !shift) return { pillar: saved.pillar, text: saved.prompt, label: saved.label || '' };
  const y = TODAY.getFullYear(), m = TODAY.getMonth();
  if (challenge && y === 2026 && m === 10 && !shift) {
    const d = Math.min(30, TODAY.getDate());
    const [pl, txt] = CHALLENGE[d - 1];
    const pid = (PILLARS.find((p) => pl.startsWith(p.name)) || { id: 'purpose' as PillarId }).id;
    return { pillar: pid, text: txt, label: t('30 Days, 9 Pillars · Day {d}', { d }) };
  }
  const dayNum = Math.floor(TODAY.getTime() / 864e5);
  const [pid, txt] = PROMPTS[(dayNum + shift) % PROMPTS.length];
  return { pillar: pid, text: txt, label: '' };
}

/* ---------- example data (same as the prototype) ---------- */
export function seedState(): State {
  const { TODAY, T } = today();
  const id = () => uid();
  const [g1, g2, g3, g4] = [id(), id(), id(), id()];
  const goals: Goal[] = [
    { id: g1, pillar: 'physical', title: 'Drink water', type: 'habit', count: 100, per: 'day', unit: 'oz', amt: true, step: 8, stepLabel: '+1 cup', why: 'I feel better and have more energy on the road.', deadline: key(addMonths(TODAY, 3)), sure: 8, example: true },
    { id: g2, pillar: 'mental', title: 'Practice a coping skill', type: 'habit', count: 3, per: 'day', unit: 'times', why: 'So stress doesn’t run my day.', deadline: key(addMonths(TODAY, 2)), sure: 7, example: true },
    { id: g3, pillar: 'financial', title: 'Build an emergency fund', type: 'target', count: 1, per: 'day', target: 2000, unit: '$', why: 'Peace of mind if something goes wrong.', deadline: key(addMonths(TODAY, 6)), sure: 7, example: true },
    { id: g4, pillar: 'relationships', title: 'Reach out to a friend', type: 'habit', count: 2, per: 'week', unit: 'messages', why: 'I want to be a friend who shows up.', deadline: key(addMonths(TODAY, 3)), sure: 9, example: true },
  ];
  const logs: State['logs'] = { [g1]: {}, [g2]: {}, [g3]: {}, [g4]: {} };
  for (let i = 1; i <= 6; i++) { const k = key(addDays(TODAY, -i)); logs[g1][k] = [96, 104, 64, 112, 88, 100][i - 1]; logs[g2][k] = i % 2 ? 3 : 2; }
  logs[g2][T] = 1; logs[g1][T] = 24;
  logs[g3][key(addDays(TODAY, -20))] = 400; logs[g3][key(addDays(TODAY, -6))] = 250;
  logs[g4][key(addDays(TODAY, -1))] = 1;
  const gratitude: Gratitude[] = [
    { id: id(), date: key(addDays(TODAY, -2)), text: 'A warm blanket and a quiet morning.', example: true },
    { id: id(), date: key(addDays(TODAY, -1)), text: 'My dogs greeting me like I’d been gone a year.', example: true },
  ];
  const yk = key(addDays(TODAY, -1));
  const journal: State['journal'] = { [yk]: { pillar: 'relationships', prompt: 'Who made your day a little better? Did they know it?', text: 'Stephanie, for packing me a lunch without being asked. I told her tonight.', example: true } };
  const ex = (status: string) => ({ status, photos: [] as string[], example: true });
  const adv = {
    places: { 'W:840': ex('been'), 'W:124': ex('want'), 'W:372': ex('want'), 'S:48': ex('been'), 'S:47': ex('been'), 'S:12': ex('been'), 'S:08': ex('been'), 'S:06': ex('want') },
    bucket: {
      me: [{ text: 'See the Northern Lights', cat: 'Travel', year: '2028', done: false, photos: [], example: true }, { text: 'Visit all 50 states', cat: 'Travel', year: '', done: false, photos: [], example: true }],
      us: [{ text: 'Take a dance class together', cat: 'Just for fun', year: '', done: false, photos: [], example: true }],
    },
    partner: '', hobbies: [{ name: 'Baking', goal: 'Bake bread from scratch', note: '', photos: [], sessions: {}, example: true }],
  };
  return { ...blankState(), goals, logs, gratitude, journal, tools: { adv } };
}

/* ---------- goal history by week, month, year (weeks run Sunday to Saturday) ---------- */
// How much of a day's goal was done, 0 to 1. Weekly goals count any check-in that day as done.
export const dayFrac = (S: State, g: Goal, k: string) => { const v = dayVal(S, g, k); return g.per === 'day' ? Math.min(1, v / (g.count || 1)) : v > 0 ? 1 : 0; };
export const sundayOf = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -d.getDay());
export const sumDays = (S: State, g: Goal, from: Date, to: Date) => { let t = 0; for (let d = new Date(from); d <= to; d = addDays(d, 1)) t += dayVal(S, g, key(d)); return t; };
export const weekMet = (S: State, g: Goal, sun: Date) => sumDays(S, g, sun, addDays(sun, 6)) >= g.count;
// The first day a goal could count: when it was made, or its first check-in if that's earlier
export const goalStart = (S: State, g: Goal) => { const ks = Object.keys(S.logs[g.id] || {}).filter((k) => (S.logs[g.id] || {})[k] > 0).sort(); const c = [g.created, ks[0]].filter(Boolean).sort()[0]; return c ? fromKey(c as string) : today().TODAY; };
