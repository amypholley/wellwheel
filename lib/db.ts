// Reads and writes the signed-in person's data in Supabase.
import { supabase } from './supabase';
import { Goal, Gratitude, JournalEntry, State, blankState } from './core';

export type Profile = { id: string; username: string; display_name: string; couple_code: string; seed_examples: boolean; created_at: string };

const goalToRow = (g: Goal) => ({
  id: g.id, pillar: g.pillar, title: g.title, type: g.type, count: g.count, per: g.per, unit: g.unit,
  amt: !!g.amt, step: g.step ?? null, step_label: g.stepLabel ?? null, target: g.target ?? null,
  why: g.why || '', deadline: g.deadline || null, sure: g.sure, example: !!g.example,
});
const rowToGoal = (r: any): Goal => ({
  id: r.id, pillar: r.pillar, title: r.title, type: r.type, count: Number(r.count ?? 1), per: r.per || 'day', unit: r.unit,
  amt: r.amt, step: r.step == null ? undefined : Number(r.step), stepLabel: r.step_label ?? undefined,
  target: r.target == null ? undefined : Number(r.target), why: r.why || '', deadline: r.deadline || '', sure: r.sure ?? 7, example: r.example,
});

let currentUserId = '';
function check<T extends { error: any }>(res: T): T { if (res.error) throw res.error; return res; }

export async function loadProfile(): Promise<Profile | null> {
  const { data: u } = await supabase!.auth.getUser();
  if (!u.user) return null;
  currentUserId = u.user.id;
  const { data } = check(await supabase!.from('profiles').select('*').eq('id', u.user.id).maybeSingle());
  return data as Profile;
}

export async function loadState(): Promise<State> {
  const s = blankState();
  const [goals, logs, grat, jr, tl] = await Promise.all([
    supabase!.from('goals').select('*').order('created_at'),
    supabase!.from('goal_logs').select('goal_id,day,amount'),
    supabase!.from('gratitude').select('*').order('created_at'),
    supabase!.from('journal').select('*'),
    supabase!.from('tool_data').select('tool,data'),
  ]);
  [goals, logs, grat, jr, tl].forEach(check);
  (tl.data || []).forEach((r: any) => (s.tools[r.tool] = r.data));
  s.goals = (goals.data || []).map(rowToGoal);
  s.goals.forEach((g) => (s.logs[g.id] = {}));
  (logs.data || []).forEach((r: any) => {
    const m = (s.logs[r.goal_id] = s.logs[r.goal_id] || {});
    m[r.day] = (m[r.day] || 0) + Number(r.amount);
  });
  s.gratitude = (grat.data || []).map((r: any) => ({ id: r.id, date: r.day, text: r.text, example: r.example }));
  (jr.data || []).forEach((r: any) => (s.journal[r.day] = { pillar: r.pillar, prompt: r.prompt, label: r.label, text: r.text, example: r.example }));
  return s;
}

export const db = {
  async addGoals(goals: Goal[]) { if (goals.length) check(await supabase!.from('goals').insert(goals.map(goalToRow))); },
  async deleteGoal(id: string) { check(await supabase!.from('goals').delete().eq('id', id)); },
  async log(goalId: string, day: string, delta: number) { check(await supabase!.rpc('log_goal', { p_goal: goalId, p_day: day, p_delta: delta })); },
  async setLogs(goalId: string, days: Record<string, number>) {
    const rows = Object.entries(days).map(([day, amount]) => ({ goal_id: goalId, day, amount }));
    if (rows.length) check(await supabase!.from('goal_logs').insert(rows));
  },
  async addGratitude(items: Gratitude[]) {
    if (items.length) check(await supabase!.from('gratitude').insert(items.map((g) => ({ id: g.id, day: g.date, text: g.text, example: !!g.example }))));
  },
  async deleteGratitudeOn(day: string) { check(await supabase!.from('gratitude').delete().eq('day', day)); },
  async saveJournal(day: string, e: JournalEntry) {
    check(await supabase!.from('journal').upsert({ user_id: currentUserId, day, pillar: e.pillar, prompt: e.prompt, label: e.label || '', text: e.text, example: !!e.example, updated_at: new Date().toISOString() }, { onConflict: 'user_id,day' }));
  },
  async saveTool(tool: string, data: any) {
    check(await supabase!.from('tool_data').upsert({ user_id: currentUserId, tool, data: data ?? {}, updated_at: new Date().toISOString() }, { onConflict: 'user_id,tool' }));
  },
  async removeExamples() {
    await Promise.all([
      supabase!.from('goals').delete().eq('example', true),
      supabase!.from('gratitude').delete().eq('example', true),
      supabase!.from('journal').delete().eq('example', true),
    ]).then((r) => r.forEach(check));
  },
  async insertState(s: State) {
    await db.addGoals(s.goals);
    for (const g of s.goals) await db.setLogs(g.id, s.logs[g.id] || {});
    await db.addGratitude(s.gratitude);
    // example Adventures data only if the person has none yet
    if (s.tools.adv) { const { data } = await supabase!.from('tool_data').select('tool').eq('tool', 'adv').maybeSingle(); if (!data) await db.saveTool('adv', s.tools.adv); }
    for (const [day, e] of Object.entries(s.journal)) {
      // never overwrite a real entry with an example
      const { data } = await supabase!.from('journal').select('day').eq('day', day).maybeSingle();
      if (!data) await db.saveJournal(day, e);
    }
  },
  async updateProfile(fields: Partial<Pick<Profile, 'display_name' | 'seed_examples'>>, id: string) {
    check(await supabase!.from('profiles').update(fields).eq('id', id));
  },
};
