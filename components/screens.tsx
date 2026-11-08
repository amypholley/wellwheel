'use client';
import { useEffect, useRef, useState } from 'react';
import { P, PILLARS, PillarId, goalQuestion, questionFor } from '@/lib/data';
import { Goal, addDays, addMonths, dayFrac, dayVal, fmtDate, fmtNum, fromKey, goalWeekScore, key, pillarScore, smartSentence, today, todaysPrompt, goalStart, sumDays, sundayOf, total, uid, weekMet, weekSum } from '@/lib/core';
import { Icon, Wheel, initials } from './ui';
import { firstName, useWW } from './store';
import { PillarReport, PlusLock } from './Plus';
import { FeedbackButton } from './Feedback';
import { ShareCard } from './Share';
import { FREE_CHALLENGES, FREE_PORTFOLIO, FREE_TOOLS } from '@/lib/plus';
import { INTL_LINES, US_LINES, Line } from '@/lib/hotlines';
import { loc, t } from '@/lib/i18n';

/* ---------- couple helpers ---------- */
const partnerFirst = (S: any) => (S.couple?.partner_name || '').split(' ')[0];
function SharedTag({ g }: { g: Goal }) {
  const { S } = useWW();
  if (!g.coupleId || !S.couple) return null;
  return <span className="shared">💞 With {partnerFirst(S)}</span>;
}
// "You $200 · Stephanie $300" on shared goals
function Contrib({ g }: { g: Goal }) {
  const { S } = useWW();
  if (!g.coupleId || !S.couple) return null;
  const by = S.by[g.id] || {};
  const parts = Object.entries(by).filter(([, v]) => v > 0).map(([u, v]) => {
    const who = u === S.me ? 'You' : u === S.couple!.partner_id ? partnerFirst(S) : t('Earlier');
    const amt = g.unit === '$' ? '$' + Number(v).toLocaleString(loc()) : Number(v).toLocaleString(loc()) + (g.type === 'target' && g.unit !== 'done' ? ' ' + g.unit : '');
    return `${who} ${amt}`;
  });
  return parts.length ? <div className="contrib">💞 {parts.join(' · ')}</div> : null;
}
function TogetherCard() {
  const { S, setWizard, setView, setIntent, setProfileOpen } = useWW();
  if (!S.couple) return null;
  const first = partnerFirst(S);
  const shared = S.goals.filter((g) => g.coupleId).length;
  const dreams = ((S.coupleData.bucket || {}).list || []).length;
  const mine = (S.tools.adv || {}).places || {}, theirs = S.partnerPlaces || {};
  const both = Object.keys(mine).filter((k) => mine[k]?.status === 'been' && theirs[k]?.status === 'been').length;
  const go = (view: any, intent: any) => { setIntent(intent); setView(view); };
  return (
    <section className="card together">
      <div className="card-head"><h2>💞 You & {first}</h2><button className="linkish" onClick={() => setProfileOpen(true)}>{t("Sharing settings")}</button></div>
      <div className="mapstats" style={{ marginTop: 4 }}>
        <div><b>{shared}</b><span>shared goal{shared === 1 ? '' : 's'}</span></div>
        <div><b>{dreams}</b><span>{t("couple dreams")}</span></div>
        <div><b>{both}</b><span>{t("places together")}</span></div>
      </div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn small" onClick={() => go('adventures', { adv: 'map', who: 'us' })}>{t("Our map")}</button>
        <button className="btn small" onClick={() => go('adventures', { adv: 'bucket', who: 'us' })}>{t("Our bucket list")}</button>
        <button className="btn small" onClick={() => go('portfolio', { joint: true })}>{t("Our money plan")}</button>
        <button className="btn small" onClick={() => setWizard({ share: true })}>{t("+ Shared goal")}</button>
      </div>
    </section>
  );
}

/* ---------- Today ---------- */
// Sunday to Saturday at a glance for a daily goal: filled = done that day, ringed = today
function WeekDots({ g, color }: { g: Goal; color: string }) {
  const { S } = useWW();
  const { TODAY, weekDays } = today();
  return (
    <div className="wdots" aria-hidden="true">
      {weekDays.map((d) => { const k = key(d), f = dayFrac(S, g, k), fut = d > TODAY, isT = d.getTime() === TODAY.getTime();
        return <span key={k} className={`wd ${isT ? 'today' : ''} ${fut ? 'fut' : ''}`}><i style={f > 0 ? { background: color, opacity: f >= 1 ? 1 : 0.45 } : undefined} />{d.toLocaleDateString(loc(), { weekday: 'narrow' })}</span>; })}
    </div>
  );
}

function GoalRowToday({ g, logOpen, setLogOpen }: { g: Goal; logOpen: string | null; setLogOpen: (v: string | null) => void }) {
  const { S, act, toast } = useWW();
  const { T } = today();
  const daysMet = today().weekDays.filter((d) => dayFrac(S, g, key(d)) >= 1).length;
  const p = P[g.pillar];
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState('');
  useEffect(() => { if (logOpen === g.id) inputRef.current?.focus(); }, [logOpen, g.id]);
  // Goals that ask a question: answer it when you check in, and it's saved with the day
  const q = questionFor(S.tools, g);
  const [askOpen, setAskOpen] = useState(false);
  const [ans, setAns] = useState('');
  const notes: { d: string; t: string }[] = ((S.tools.gnotes || {})[g.id]) || [];
  const todays = notes.filter((n) => n.d === T);
  const doneNow = g.type === 'habit' && (g.per === 'day' ? dayVal(S, g, T) : weekSum(S, g)) >= g.count;
  const saveAnswer = (logIt: boolean) => {
    const txt = ans.trim();
    if (txt) { const all = { ...(S.tools.gnotes || {}) }; all[g.id] = [...notes, { d: T, t: txt.slice(0, 2000) }]; act.saveTool('gnotes', all); }
    if (logIt) plus(); else if (txt) toast(t("Saved"));
    setAns(''); setAskOpen(false);
  };

  const plus = () => {
    const before = dayVal(S, g, T), inc = g.amt ? g.step : 1, after = before + inc;
    act.log(g.id, inc);
    if (g.amt) { if (before < g.count && after >= g.count) toast("Daily goal reached!"); return; }
    if (g.type === 'habit') {
      const n = g.per === 'week' ? weekSum(S, g) + inc : after;
      if (n === g.count) toast(g.per === 'day' ? t('Done for today. Nice work.') : t('Weekly goal reached!'));
    }
  };
  const minus = () => {
    const v = dayVal(S, g, T);
    if (v > 0) { act.log(g.id, -Math.min(v, g.amt ? g.step : 1)); return; }
    if (g.type === 'target' && g.unit === 'done') { // undo a "done" logged on another day
      const d = Object.entries(S.logs[g.id] || {}).find(([, x]) => x > 0);
      if (d) act.log(g.id, -d[1], d[0]);
    }
  };
  const submitLog = (e: React.FormEvent) => {
    e.preventDefault(); const v = parseFloat(amount); if (!(v > 0)) return;
    act.log(g.id, v); setAmount(''); setLogOpen(null); toast(t("Progress logged"));
  };

  let meta: string, ticks: React.ReactNode = null, ctrl: React.ReactNode, extra: React.ReactNode = null;
  const logForm = (ph: string, label: string) => (
    <form className="logrow" onSubmit={submitLog}>
      <input ref={inputRef} type="number" step="any" min="0" inputMode="decimal" placeholder={ph} aria-label={label} value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn primary small" type="submit">{t("Add")}</button>
    </form>
  );
  if (g.type === 'habit' && g.amt) {
    const n = dayVal(S, g, T), pct = Math.min(100, Math.round((n / g.count) * 100));
    meta = t('{n} of {c} {unit} today', { n: n.toLocaleString(loc()), c: Number(g.count).toLocaleString(loc()), unit: t(g.unit) }) + (n >= g.count ? ' ✓' : '') + ' · ' + t('{d} of 7 days this week', { d: daysMet });
    ticks = <><div className="bar"><span style={{ width: pct + '%', background: p.color }} /></div><WeekDots g={g} color={p.color} /></>;
    ctrl = (
      <div className="counter">
        {n > 0 && <button className="round" onClick={minus} aria-label={t('Take back {x}', { x: t(g.stepLabel || '') })}>−</button>}
        <button className="btn small primary" onClick={plus}>{g.stepLabel || '+' + g.step}</button>
        <button className="btn small" onClick={() => setLogOpen(logOpen === g.id ? null : g.id)}>{t("Other")}</button>
      </div>
    );
    if (logOpen === g.id) extra = logForm(g.unit === 'oz' ? 'Ounces, e.g. 16' : t('How many {unit}?', { unit: t(g.unit) }), t('Amount to add'));
  } else if (g.type === 'habit') {
    const n = g.per === 'day' ? dayVal(S, g, T) : weekSum(S, g);
    const done = n >= g.count;
    meta = g.per === 'day' ? t('{n} of {c} today', { n: Math.min(n, g.count), c: g.count }) + ' · ' + t('{d} of 7 days this week', { d: daysMet }) : t('{n} of {c} {unit} this week', { n, c: g.count, unit: t(g.unit) });
    ticks = g.per === 'day' ? <WeekDots g={g} color={p.color} /> : g.count > 12
      ? <div className="bar"><span style={{ width: Math.min(100, Math.round((n / g.count) * 100)) + '%', background: p.color }} /></div>
      : <div className="ticks" aria-hidden="true">{Array.from({ length: g.count }, (_, i) => <span key={i} className={`tick ${i < n ? 'on' : ''}`} style={i < n ? { background: p.color } : undefined} />)}</div>;
    ctrl = (
      <div className="counter">
        {dayVal(S, g, T) > 0 && <button className="round" onClick={minus} aria-label={t('Undo one check-in for {x}', { x: g.title })}>−</button>}
        <button className={`round ${done ? 'done' : 'plus'}`} onClick={q ? () => setAskOpen(!askOpen) : plus} aria-label={t('Check in {x}', { x: g.title })}>{done ? '✓' : '+'}</button>
      </div>
    );
  } else {
    const tot = total(S, g), pct = Math.min(100, Math.round((tot / g.target) * 100));
    meta = g.unit === 'done' ? (tot >= 1 ? t('Done') : t('Not done yet')) : t('{a} of {b}', { a: fmtNum(tot, g.unit), b: fmtNum(g.target, g.unit) }) + ` · ${pct}%`;
    ticks = <div className="bar"><span style={{ width: pct + '%', background: p.color }} /></div>;
    ctrl = g.unit === 'done'
      ? <button className={`round ${tot >= 1 ? 'done' : 'plus'}`} onClick={tot >= 1 ? minus : plus} aria-label={t('Mark {x} done', { x: g.title })}>{tot >= 1 ? '✓' : '+'}</button>
      : <button className="btn small" onClick={() => setLogOpen(logOpen === g.id ? null : g.id)}>{t("Log")}</button>;
    if (logOpen === g.id) extra = logForm(g.unit === '$' ? 'Amount saved, e.g. 50' : t('How many {unit}?', { unit: t(g.unit) }), t('Amount to log'));
  }
  return (
    <div className="goal">
      <span className="stripe" style={{ background: p.color }} />
      <div>
        <div className="pill"><span className="dot" style={{ background: p.color }} />{p.name}{g.example && <span className="example">{t("Example")}</span>}<SharedTag g={g} /></div>
        <div className="goal-title">{g.title}</div>
        <div className="goal-meta">{meta}</div>
        {ticks}<Contrib g={g} />
        {q && todays.length === 0 && !askOpen && <button className="linkish askcue" onClick={() => setAskOpen(true)}>📝 {t(q)}</button>}
        {q && todays.length > 0 && !askOpen && <div className="gans">{todays.map((n, i) => <p key={i}>“{n.t}”</p>)}<button className="linkish" onClick={() => setAskOpen(true)}>{t("+ Add another")}</button></div>}
      </div>
      {ctrl}{extra}
      {q && askOpen && <div className="logrow askrow">
        <label className="lbl" htmlFor={'ask-' + g.id}>{t(q)}</label>
        <textarea id={'ask-' + g.id} rows={2} value={ans} autoFocus maxLength={2000} placeholder={t("Write as much or as little as you want")} onChange={(e) => setAns(e.target.value)} />
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <button className="linkish" onClick={() => (ans.trim() ? saveAnswer(!doneNow) : (doneNow ? setAskOpen(false) : (plus(), setAskOpen(false))))}>{doneNow ? t('Cancel') : t('Skip, just check in')}</button>
          <button className="btn small primary" disabled={!ans.trim()} onClick={() => saveAnswer(!doneNow)}>{doneNow ? t('Save answer') : t('Save & check in')}</button>
        </div>
      </div>}
    </div>
  );
}

function JournalTeaser() {
  const { S, setView, isPlus } = useWW();
  const { T } = today();
  const pr = todaysPrompt(S, 0, isPlus || FREE_CHALLENGES), p = P[pr.pillar], done = !!(S.journal[T] && S.journal[T].text);
  return (
    <section className="card">
      <div className="card-head"><h2>{t("Today’s journal prompt")}</h2>{done && <span className="sub" style={{ color: 'var(--good)', fontWeight: 600 }}>{t("✓ Written")}</span>}</div>
      <div className="pill" style={{ color: p.color }}><Icon id={p.id} size={14} />{pr.label || p.name}</div>
      <div className="rule" />
      <p className="prompt" style={{ margin: '0 0 12px' }}>{pr.text}</p>
      <button className={`btn ${done ? '' : 'primary'}`} onClick={() => setView('journal')}>{done ? t('Open my journal') : t('Write in my journal')}</button>
    </section>
  );
}

export function Today() {
  const { S, act, profile, mode, setWizard, setProfileOpen, setAuthOpen, toast, openPillar } = useWW();
  const { TODAY, T } = today();
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const [grat, setGrat] = useState('');
  const hr = new Date().getHours(), greet = hr < 12 ? t('Good morning') : hr < 17 ? t('Good afternoon') : t('Good evening');
  const todays = S.gratitude.find((x) => x.date === T);
  const name = firstName(profile);
  return (
    <>
      {mode === 'guest' && (
        <div className="guestbar"><span>{t("You’re looking around with example data. Nothing is saved.")}</span><button className="btn small primary" onClick={() => setAuthOpen('signup')}>{t("Sign up")}</button></div>
      )}
      <header className="top">
        <div><div className="brand">{t("WellWheel · The Holistic Ecosystem")}</div><h1>{greet}{name ? ', ' + name : ''}</h1><div className="sub">{TODAY.toLocaleDateString(loc(), { weekday: 'long', month: 'long', day: 'numeric' })}</div></div>
        <button className="avatar" onClick={() => setProfileOpen(true)} aria-label={t("Profile and account")}>
          {profile ? initials(profile.display_name) : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>}
        </button>
      </header>
      {/* Wide screens: wheel on the left, check-ins on the right, the rest underneath. Phones: one column. */}
      <div className="today-grid">
        <section className="card tg-wheel">
          <div className="card-head"><h2>{t("This week’s balance")}</h2><span className="sub">{t("Tap a pillar to open it")}</span></div>
          <div className="wheel-wrap"><Wheel S={S} />
            <div className="legend">
              {PILLARS.map((p) => { const sc = pillarScore(S, p.id); return (
                <button key={p.id} onClick={() => openPillar(p.id)} aria-label={sc === null ? `Open ${p.name}` : `Open ${p.name}, ${Math.round(sc * 100)} percent`}>
                  <span className="dot" style={{ background: p.color, opacity: sc === null ? 0.3 : 1 }} />{p.name}<span className="pct">{sc === null ? '+' : Math.round(sc * 100) + '%'}</span>
                </button>); })}
            </div>
          </div>
        </section>
        <div className="tg-main stack">
        <TogetherCard />
        <section className="card">
          <div className="card-head"><h2>{t("Today’s check-ins")}</h2><button className="linkish" onClick={() => setWizard({})}>{t("+ New goal")}</button></div>
          {S.goals.length ? S.goals.map((g) => <GoalRowToday key={g.id} g={g} logOpen={logOpen} setLogOpen={setLogOpen} />) : (
            <><p className="empty">{t("No goals yet. Pick a pillar and start with one small goal.")}</p><button className="btn primary" onClick={() => setWizard({})}>{t("Set my first goal")}</button></>
          )}
        </section>
        </div>
        <div className="tg-under">
        <section className="card">
          <div className="card-head"><h2>{t("Grateful today")}</h2><span className="sub">{S.gratitude.length} so far</span></div>
          {todays ? (<><p className="prompt" style={{ margin: 0 }}>“{todays.text}”</p><button className="linkish" style={{ marginTop: 8 }} onClick={() => act.clearTodayGratitude()}>{t("Change it")}</button></>) : (
            <form className="row" onSubmit={(e) => { e.preventDefault(); const gv = grat.trim(); if (!gv) return; act.addGratitude(gv, true); setGrat(''); toast(t("Added to your gratitude list")); }}>
              <input type="text" placeholder={t("Today I’m grateful for…")} aria-label={t("Today I’m grateful for")} value={grat} onChange={(e) => setGrat(e.target.value)} maxLength={1000} />
              <button className="btn primary" type="submit">{t("Save")}</button>
            </form>
          )}
        </section>
        <JournalTeaser />
        </div>
      </div>
    </>
  );
}

/* ---------- My pillars: a personal page for each of the nine ---------- */
// The worksheets that belong to each pillar (same ids as Resources)
const PILLAR_TOOLS: Record<PillarId, [string, string][]> = {
  physical: [['sleep', 'Sleep Journal'], ['meals', 'Meal & Grocery Planner'], ['fitness', 'Fitness Planner']],
  mental: [['coping', 'Coping Skills Library'], ['cbt', 'CBT Thought Record'], ['anxiety', 'Anxiety Management Workbook'], ['dbt', 'DBT Skills Workbook']],
  emotional: [['burnout', 'Burnout Source Worksheet'], ['selfc', 'Self-Compassion Journal']],
  spiritual: [['prayer', 'Prayer Journal'], ['bible', 'Bible Study Workbook'], ['sermons', 'Sermon & Study Notes']],
  intellectual: [['growth', 'Personal Development Workbook']],
  environmental: [['env', 'Environment in Balance'], ['home', 'Home Reset Checklist']],
  financial: [['money', 'Financial Wellness Planner']],
  relationships: [['couples', 'Couples Communication Workbook'], ['datenight', 'Date Night Planner']],
  purpose: [['vision', 'Life Vision Planner']],
};
export function Pillars() {
  const { S, pillarSel, openPillar } = useWW();
  if (pillarSel) return <PillarPage pid={pillarSel} />;
  return (
    <>
      <header className="top"><div><div className="brand">{t("My pillars")}</div><h1>{t("Your whole life, nine ways")}</h1><div className="sub">{t("Tap a pillar for everything in that part of your life.")}</div></div></header>
      <div className="pgrid">
        {PILLARS.map((p) => { const sc = pillarScore(S, p.id as PillarId), n = S.goals.filter((g) => g.pillar === p.id).length;
          return <button key={p.id} className="ptile" style={{ ['--c' as any]: p.color }} onClick={() => openPillar(p.id as PillarId)}>
            <span className="ico" style={{ color: p.color }}><Icon id={p.id as PillarId} size={26} /></span><b>{p.name}</b><small>{p.desc}</small>
            <span className="pmeta">{n ? (n === 1 ? t('1 goal') : t('{n} goals', { n })) + ' · ' + (sc === null ? '—' : t('{p}% this week', { p: Math.round(sc * 100) })) : t('No goals yet')}</span></button>; })}
      </div>
    </>
  );
}
// Crisis and support lines (same list as the worksheets use)
function HelpLines() {
  const li = (l: Line) => <li key={l.name}><b>{l.name}</b><span>{l.tel ? <a href={'tel:' + l.tel}>{l.how}</a> : l.sms ? <a href={'sms:' + l.sms}>{l.how}</a> : /findahelpline/.test(l.how) ? <a href="https://findahelpline.com" target="_blank" rel="noopener">{l.how}</a> : l.how}</span>{l.note && <small>{l.note}</small>}</li>;
  return (
    <section className="card">
      <h2>{t("Need to talk to someone?")}</h2>
      <p style={{ margin: '8px 0 0' }}>{t("Call or text")} <a href="tel:988"><b>988</b></a> any time, day or night (US). In an emergency, call <b>911</b>.</p>
      <details className="lines"><summary>📞 All crisis & support lines (US and international)</summary>
        <h3 className="h3">{t("United States")}</h3><ul>{US_LINES.map(li)}</ul>
        <h3 className="h3">{t("Other countries")}</h3><ul>{INTL_LINES.map(li)}</ul>
        <p className="hint" style={{ marginBottom: 0 }}>{t("Numbers can change. If one doesn’t work, visit findahelpline.com.")}</p>
      </details>
    </section>
  );
}
function PillarPage({ pid }: { pid: PillarId }) {
  const { S, act, toast, setWizard, openPillar, setIntent, setView, isPlus, setPlusOpen } = useWW();
  const p = P[pid];
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const saved = ((S.tools.pillars || {})[pid] || {}).why || '';
  const [why, setWhy] = useState(saved);
  useEffect(() => { setWhy(saved); }, [pid]); // eslint-disable-line react-hooks/exhaustive-deps
  const saveWhy = (quiet = false) => { if (why === saved) { if (!quiet) toast(t("Saved")); return; } act.saveTool('pillars', { ...(S.tools.pillars || {}), [pid]: { ...((S.tools.pillars || {})[pid] || {}), why: why.trim() } }); if (!quiet) toast(t("Saved")); };
  const goals = S.goals.filter((g) => g.pillar === pid);
  const sc = pillarScore(S, pid);
  const vis = ((S.tools.vision || {}).p || {})[pid] || {};
  // Everything written in this pillar: prompt answers tagged to it, and answers from its goals
  const words = [
    ...Object.entries(S.journal).filter(([, v]) => v.text && v.pillar === pid).map(([d, v]) => ({ d, head: v.prompt, t: v.text })),
    ...goals.flatMap((g) => (((S.tools.gnotes || {})[g.id]) || []).map((n: { d: string; t: string }) => ({ d: n.d, head: `${g.title}: ${t(questionFor(S.tools, g) || 'Note')}`, t: n.t }))),
  ].sort((a, b) => (a.d < b.d ? 1 : -1));
  const openTool = (id: string) => {
    const locked = !isPlus && (id === 'money' ? !FREE_PORTFOLIO : !FREE_TOOLS.includes(id));
    if (locked) { setPlusOpen(id === 'money' ? 'portfolio' : 'tool'); return; }
    if (id === 'money') { setView('portfolio'); return; }
    setIntent({ tool: id }); setView('resources');
  };
  const i = PILLARS.findIndex((x) => x.id === pid), prev = PILLARS[(i + 8) % 9], next = PILLARS[(i + 1) % 9];
  return (
    <>
      <header className="top"><div>
        <button className="linkish" onClick={() => openPillar(null)}>{t("← All pillars")}</button>
        <div className="brand" style={{ marginTop: 10, color: `color-mix(in srgb,${p.color} 75%,var(--ink))`, display: 'flex', alignItems: 'center', gap: 6 }}><Icon id={pid} size={16} />{t("My pillars")}</div>
        <h1>{p.name}</h1><div className="sub">{p.desc}</div></div>
        <div className="pscore" style={{ ['--c' as any]: p.color }}><b>{sc === null ? '—' : Math.round(sc * 100) + '%'}</b><small>{t("this week")}</small></div>
      </header>
      <div className="stack">
        <section className="card" style={{ borderTop: `3px solid ${p.color}` }}>
          <h2>Why {p.name.toLowerCase()} matters to me</h2>
          <textarea style={{ marginTop: 10 }} rows={3} placeholder={`In your own words. What does a healthy ${p.name.toLowerCase()} life look like for you?`} value={why} onChange={(e) => setWhy(e.target.value)} onBlur={() => saveWhy(true)} />
          <div className="secsave"><span className="sub">{t("Saves when you click away")}</span><button className="btn small" onClick={() => saveWhy()}>{t("Save")}</button></div>
        </section>
        {(pid === 'mental' || pid === 'emotional') && <HelpLines />}
        <section className="card">
          <div className="card-head"><h2>My {p.name.toLowerCase()} goals</h2><button className="linkish" onClick={() => setWizard({ pillar: pid })}>{t("+ New goal")}</button></div>
          {goals.length ? goals.map((g) => <GoalRowToday key={g.id} g={g} logOpen={logOpen} setLogOpen={setLogOpen} />) : <><p className="empty">No {p.name.toLowerCase()} goals yet. One small goal is a great start.</p><button className="btn primary" onClick={() => setWizard({ pillar: pid })}>Set a {p.name.toLowerCase()} goal</button></>}
        </section>
        {goals.length > 0 && <GoalHistory only={pid} title={t("How it’s going")} />}
        <section className="card">
          <div className="card-head"><h2>{t("My vision")}</h2><button className="linkish" onClick={() => openTool('vision')}>{t("Open Life Vision ›")}</button></div>
          {vis.five || vis.one || vis.step ? <>{vis.five && <div className="said"><span>{t("In 5 years, I see")}</span><p>{vis.five}</p></div>}{vis.one && <div className="said"><span>{t("One-year milestone")}</span><p>{vis.one}</p></div>}{vis.step && <div className="said"><span>{t("First step this month")}</span><p>{vis.step}</p></div>}</>
            : <p className="empty" style={{ margin: 0 }}>You haven’t written a vision for {p.name.toLowerCase()} yet. The Life Vision Planner walks you through it.</p>}
        </section>
        <section className="card">
          <div className="card-head"><h2>{t("My words")}</h2><span className="sub">{words.length}</span></div>
          {words.length ? <ul className="pwords">{words.slice(0, 20).map((w, k) => <li key={k}><small>{fmtDate(w.d, { weekday: 'short', month: 'short', day: 'numeric' })} · {w.head}</small><p>{w.t}</p></li>)}</ul>
            : <p className="empty" style={{ margin: 0 }}>Journal prompts and goal answers about {p.name.toLowerCase()} will collect here.</p>}
        </section>
        <section className="card">
          <h2>Tools for {p.name.toLowerCase()}</h2><div className="rule" />
          <div className="rgrid">{PILLAR_TOOLS[pid].map(([id, ttl]) => { const locked = !isPlus && (id === 'money' ? !FREE_PORTFOLIO : !FREE_TOOLS.includes(id)); return <button key={id} className="tile rtile" style={{ ['--c' as any]: p.color, minHeight: 0 }} onClick={() => openTool(id)}><span className="ico"><Icon id={pid} size={20} /></span><b>{t(ttl)}{locked && <span className="badge" style={{ marginLeft: 6, verticalAlign: 2 }}>{t("Plus")}</span>}</b></button>; })}</div>
        </section>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="btn small" onClick={() => openPillar(prev.id as PillarId)}>‹ {prev.name}</button>
          <button className="btn small" onClick={() => openPillar(next.id as PillarId)}>{next.name} ›</button>
        </div>
      </div>
    </>
  );
}

/* ---------- Goals ---------- */
export function Goals() {
  const { S, act, setWizard, toast, openPillar } = useWW();
  const [del, setDel] = useState<string | null>(null);
  const first = partnerFirst(S);
  const mine = (g: Goal) => !g.ownerId || g.ownerId === S.me;
  const empty = PILLARS.filter((p) => !S.goals.some((g) => g.pillar === p.id));
  const groups = PILLARS.map((p) => {
    const gs = S.goals.filter((g) => g.pillar === p.id); if (!gs.length) return null;
    return (
      <section className="card" key={p.id}>
        <div className="card-head"><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button className="linkish pillar-link" onClick={() => openPillar(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'inherit', color: 'inherit' }}><span style={{ color: p.color, display: 'flex' }}><Icon id={p.id} size={20} /></span>{p.name} <span className="sub" style={{ fontFamily: 'var(--body)', fontSize: 13 }}>›</span></button></h2><button className="linkish" onClick={() => setWizard({ pillar: p.id })}>{t("+ Add")}</button></div>
        {gs.map((g) => (
          <div className="goal" style={{ gridTemplateColumns: '4px 1fr' }} key={g.id}>
            <span className="stripe" style={{ background: p.color }} />
            <div>
              <div className="goal-title">{g.title}{g.example && <span className="example">{t("Example")}</span>}<SharedTag g={g} /></div>
              <p style={{ margin: '4px 0 6px', fontSize: 14 }}>{smartSentence(g)}</p>
              <div className="goal-meta">Confidence {g.sure || '–'}/10 · Due {fmtDate(g.deadline)}</div>
              <Contrib g={g} />
              {!mine(g) ? <p className="hint" style={{ marginBottom: 0 }}>{first} created this shared goal. You can both log progress.</p> :
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {S.couple && <button className="btn small" onClick={() => { act.shareGoal(g.id, !g.coupleId); toast(g.coupleId ? t('Stopped sharing. It’s only on your goals now.') : t('Shared with {name}. You can both log progress.', { name: first })); }}>{g.coupleId ? t('Stop sharing') : '💞 ' + t('Share with {name}', { name: first })}</button>}
                <button className="btn small" onClick={() => setWizard({ edit: g })}>{t("Edit")}</button>
                <button className={`btn small ${del === g.id ? 'primary' : ''}`} onClick={() => { if (del === g.id) { act.deleteGoal(g.id); setDel(null); toast("Goal deleted"); } else setDel(g.id); }}>{del === g.id ? t('Tap again to delete') : t('Delete')}</button>
              </div>}
            </div>
          </div>
        ))}
      </section>
    );
  });
  return (
    <>
      <header className="top"><div><div className="brand">{t("My goals")}</div><h1>{t("Goals by pillar")}</h1><div className="sub">{S.goals.length} active · {9 - empty.length} of 9 pillars</div></div><button className="btn primary" onClick={() => setWizard({})}>{t("+ New goal")}</button></header>
      <div className="stack">
        {S.goals.length ? groups : <p className="empty">{t("No goals yet.")}</p>}
        {empty.length > 0 && (
          <section className="card"><h2>{t("Pillars with no goal yet")}</h2>
            <div className="chips">{empty.map((p) => <button key={p.id} className="chip" onClick={() => setWizard({ pillar: p.id })}><span className="dot" style={{ background: p.color, marginRight: 6 }} />{p.name}</button>)}</div>
          </section>
        )}
      </div>
    </>
  );
}

/* ---------- Goal history: week, month, year ---------- */
type Period = 'week' | 'month' | 'year';
const MON = () => Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1).toLocaleDateString(loc(), { month: 'narrow' }));
function GoalHistory({ only, title = 'My goals' }: { only?: PillarId; title?: string } = {}) {
  const { S } = useWW();
  const goals = only ? S.goals.filter((g) => g.pillar === only) : S.goals;
  const { TODAY } = today();
  const [per, setPer] = useState<Period>('week');
  const [off, setOff] = useState(0);
  // The period being shown
  let from: Date, to: Date, label: string;
  if (per === 'week') { from = addDays(sundayOf(TODAY), 7 * off); to = addDays(from, 6); label = off === 0 ? t('This week') : `${from.toLocaleDateString(loc(), { month: 'short', day: 'numeric' })} – ${to.toLocaleDateString(loc(), { month: 'short', day: 'numeric' })}`; }
  else if (per === 'month') { from = new Date(TODAY.getFullYear(), TODAY.getMonth() + off, 1); to = new Date(from.getFullYear(), from.getMonth() + 1, 0); label = from.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }); }
  else { from = new Date(TODAY.getFullYear() + off, 0, 1); to = new Date(from.getFullYear(), 11, 31); label = String(from.getFullYear()); }
  const end = to < TODAY ? to : TODAY; // only count days that have happened
  const days: Date[] = []; for (let d = new Date(from); d <= to; d = addDays(d, 1)) days.push(d);
  const pastDays = days.filter((d) => d <= TODAY);
  // Weeks (Sunday to Saturday) that start inside this month or year and have begun
  const weeksIn = (a: Date, b: Date) => { const w: Date[] = []; for (let d = sundayOf(a) < a ? addDays(sundayOf(a), 7) : sundayOf(a); d <= b && d <= TODAY; d = addDays(d, 7)) w.push(d); return w; };
  const sq = (f: number, color: string, k: string, fut: boolean, title: string) => <div key={k} className={`sq ${fut ? 'fut' : ''}`} title={title} style={f > 0 ? { background: color, opacity: 0.35 + 0.65 * f } : undefined} />;

  const row = (g: Goal) => {
    const p = P[g.pillar];
    const st0 = goalStart(S, g); // don't count days before the goal existed
    const counted = pastDays.filter((d) => d >= st0);
    const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
    let stat = '', body: React.ReactNode = null;
    if (g.type === 'target') {
      const added = from > TODAY ? 0 : sumDays(S, g, from, end), all = total(S, g), pct = Math.min(100, Math.round((all / (g.target || 1)) * 100));
      stat = t(per === 'week' ? '{x} added this week' : per === 'month' ? '{x} added this month' : '{x} added this year', { x: fmtNum(added, g.unit) });
      body = <>
        {per === 'year' && <div className="ybars">{MON().map((m, i) => { const a = new Date(from.getFullYear(), i, 1), b = new Date(from.getFullYear(), i + 1, 0); const v = a > TODAY ? 0 : sumDays(S, g, a, b < TODAY ? b : TODAY); const mx = Math.max(1, ...MON().map((_, j) => { const x = new Date(from.getFullYear(), j, 1), y = new Date(from.getFullYear(), j + 1, 0); return x > TODAY ? 0 : sumDays(S, g, x, y < TODAY ? y : TODAY); })); return <div key={i}><span style={{ height: `${(v / mx) * 100}%`, background: p.color }} title={`${fmtNum(v, g.unit)}`} /><small>{m}</small></div>; })}</div>}
        <div className="bar" style={{ height: 10, marginTop: 8 }}><span style={{ width: pct + '%', background: p.color }} /></div>
        <div className="goal-meta" style={{ marginTop: 4 }}>Overall: {fmtNum(all, g.unit)} of {fmtNum(g.target || 0, g.unit)} ({pct}%)</div></>;
    } else if (per === 'year') {
      // One bar per month: share of days met (daily goals) or weeks met (weekly goals)
      const months = MON().map((m, i) => { const a = new Date(from.getFullYear(), i, 1), b = new Date(from.getFullYear(), i + 1, 0);
        if (a > TODAY) return { m, f: null as number | null };
        if (b < st0) return { m, f: null as number | null };
        if (g.per === 'day') { const ds: Date[] = []; for (let d = new Date(a < st0 ? st0 : a); d <= b && d <= TODAY; d = addDays(d, 1)) ds.push(d); return { m, f: ds.length ? ds.filter((d) => dayFrac(S, g, key(d)) >= 1).length / ds.length : 0 }; }
        const ws = weeksIn(a, b).filter((w) => addDays(w, 6) >= st0); return { m, f: ws.length ? ws.filter((w) => weekMet(S, g, w)).length / ws.length : 0 }; });
      const metDays = g.per === 'day' ? counted.filter((d) => dayFrac(S, g, key(d)) >= 1).length : 0;
      const ws = g.per === 'week' ? weeksIn(from, to).filter((w) => addDays(w, 6) >= st0) : [];
      stat = g.per === 'day' ? t(counted.length === 1 ? '{n} of {c} day' : '{n} of {c} days', { n: metDays, c: counted.length }) : t(ws.length === 1 ? '{n} of {c} week' : '{n} of {c} weeks', { n: ws.filter((w) => weekMet(S, g, w)).length, c: ws.length });
      body = <div className="ybars">{months.map(({ m, f }, i) => <div key={i} className={f === null ? 'fut' : ''}><span style={{ height: `${Math.max(f ? 6 : 0, (f || 0) * 100)}%`, background: p.color }} title={f === null ? '' : `${Math.round(f * 100)}%`} /><small>{m}</small></div>)}</div>;
    } else if (per === 'month' && g.per === 'week') {
      const ws = weeksIn(from, to).filter((w) => addDays(w, 6) >= st0);
      stat = t(ws.length === 1 ? '{n} of {c} week' : '{n} of {c} weeks', { n: ws.filter((w) => weekMet(S, g, w)).length, c: ws.length });
      body = <div className="wkrows">{ws.length ? ws.map((w) => { const n = sumDays(S, g, w, addDays(w, 6)); return <div key={key(w)}><small>{w.toLocaleDateString(loc(), { month: 'short', day: 'numeric' })}</small><span className="bar"><span style={{ width: `${Math.min(100, (n / g.count) * 100)}%`, background: p.color }} /></span><small>{n}/{g.count}{n >= g.count ? ' ✓' : ''}</small></div>; }) : <p className="sub" style={{ margin: 0 }}>{t("No weeks yet.")}</p>}</div>;
    } else {
      // Week, or a month of a daily goal: one square per day
      const lead = per === 'month' ? from.getDay() : 0;
      if (g.per === 'day') stat = t(counted.length === 1 ? '{n} of {c} day' : '{n} of {c} days', { n: counted.filter((d) => dayFrac(S, g, key(d)) >= 1).length, c: counted.length });
      else { const n = from > TODAY ? 0 : sumDays(S, g, from, to); stat = t('{n} of {c} {unit}', { n, c: g.count, unit: t(g.unit) }) + (n >= g.count ? ' ✓' : ''); }
      body = <>
        <div className={per === 'week' ? 'week' : 'week month'}>
          {per === 'week' ? days.map((d) => <div key={key(d)}>{d.toLocaleDateString(loc(), { weekday: 'narrow' })}{sq(d > TODAY ? 0 : dayFrac(S, g, key(d)), p.color, key(d), d > TODAY, `${fmtDate(key(d))}: ${dayVal(S, g, key(d))}`)}</div>)
            : <>{Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 1 + i).toLocaleDateString(loc(), { weekday: 'narrow' })).map((x, i) => <div key={'h' + i}>{x}</div>)}{Array.from({ length: lead }, (_, i) => <div key={'b' + i} />)}{days.map((d) => sq(d > TODAY ? 0 : dayFrac(S, g, key(d)), p.color, key(d), d > TODAY, `${fmtDate(key(d))}: ${dayVal(S, g, key(d))}`))}</>}
        </div></>;
    }
    const daysLeft = g.deadline ? Math.round((fromKey(g.deadline).getTime() - TODAY.getTime()) / 864e5) : null;
    return (
      <div className="goal" style={{ gridTemplateColumns: '4px 1fr' }} key={g.id}>
        <span className="stripe" style={{ background: p.color }} />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span className="goal-title">{g.title}</span><span className="goal-meta" style={{ whiteSpace: 'nowrap' }}>{stat}</span></div>
          <div className="goal-meta">{g.type === 'target' ? t('Reach a number') : g.per === 'day' ? (g.count > 1 ? t('{c} {unit} a day', { c: g.count, unit: t(g.unit) }) : t('Every day')) : t('{c} {unit} a week', { c: g.count, unit: t(g.unit) })}</div>
          {body}
          {(() => { const fk = key(from), tk = key(to); const ns = (((S.tools.gnotes || {})[g.id]) || []).filter((n: any) => n.d >= fk && n.d <= tk).slice().reverse();
            return ns.length ? <details className="gnotes"><summary>{questionFor(S.tools, g) ? t('Your answers') : t('Your notes')} ({ns.length})</summary><ul>{ns.map((n: any, i: number) => <li key={i}><small>{fmtDate(n.d, { weekday: 'short', month: 'short', day: 'numeric' })}</small>{n.t}</li>)}</ul></details> : null; })()}
          {daysLeft !== null && daysLeft >= 0 && <div className="goal-meta" style={{ marginTop: 6 }}>{daysLeft} day{daysLeft === 1 ? '' : 's'} left until {fmtDate(g.deadline, { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
        </div>
      </div>
    );
  };
  return (
    <section className="card">
      <div className="card-head"><h2>{t(title)}</h2></div>
      <div className="seg segp" role="group" aria-label={t("Show progress by")}>{(['week', 'month', 'year'] as Period[]).map((x) => <button key={x} aria-pressed={per === x} onClick={() => { setPer(x); setOff(0); }}>{x === 'week' ? t('Week') : x === 'month' ? t('Month') : t('Year')}</button>)}</div>
      <div className="pnav"><button className="round" aria-label={t("Earlier")} onClick={() => setOff(off - 1)}>‹</button><b>{label}</b><button className="round" aria-label={t("Later")} disabled={off >= 0} onClick={() => setOff(off + 1)}>›</button></div>
      {goals.length ? goals.map(row) : <p className="empty">{t("Add a goal to see progress.")}</p>}
    </section>
  );
}

/* ---------- Progress ---------- */
export function Progress() {
  const { S, act, toast, mode, isPlus } = useWW();
  const { TODAY, T, weekStart, weekDays } = today();
  const thisMonth = S.gratitude.filter((x) => x.date.slice(0, 7) === T.slice(0, 7)).length;
  const hasExamples = S.goals.some((g) => g.example) || S.gratitude.some((g) => g.example) || Object.values(S.journal).some((j) => j.example);
  return (
    <>
      <header className="top"><div><div className="brand">{t("Progress")}</div><h1>{t("How it’s going")}</h1><div className="sub">{t("Your goals by week, month, and year")}</div></div></header>
      <div className="stack">
        <GoalHistory />
        <section className="card"><div className="card-head"><h2>{t("Gratitude")}</h2></div><p style={{ margin: 0 }}>{thisMonth} line{thisMonth === 1 ? '' : 's'} this month, {S.gratitude.length} all time.</p></section>
        {isPlus ? <PillarReport /> : <PlusLock reason="report" title={t("Monthly pillar report")} text="See which pillars got your energy this month, which ones got left out, and a suggested focus for next month. Includes every 30-day challenge and all worksheets." />}
        <section className="card"><div className="card-head"><h2>{t("Help make WellWheel better")}</h2></div>
          <p className="sub" style={{ marginTop: 0 }}>{t("Found a problem, or have an idea? We read every note.")}</p>
          <FeedbackButton /></section>
        {mode === 'user' && <ShareCard />}
        <section className="card"><h2>{t("Example data")}</h2>
          <p className="hint">{mode === 'guest' ? t('You’re looking around. Nothing here is saved.') : t('Your goals are saved to your account and sync across your devices.')}</p>
          <div className="row" style={{ flexWrap: 'wrap', marginTop: 8 }}>
            {hasExamples && <button className="btn small" onClick={() => { act.removeExamples(); toast("Examples removed"); }}>{t("Remove example goals")}</button>}
            <button className="btn small" onClick={() => { act.addExamples(); toast("Examples added"); }}>{t("Add example goals")}</button>
          </div>
        </section>
      </div>
    </>
  );
}

/* ---------- Journal ---------- */
/* ---------- My journal: write about anything, as many entries as you like ---------- */
type FreeEntry = { id: string; d: string; title: string; text: string };
function FreeJournal({ editId, setEditId }: { editId: string | null; setEditId: (v: string | null) => void }) {
  const { S, act, toast } = useWW();
  const { TODAY, T } = today();
  const list: FreeEntry[] = S.tools.fjournal || [];
  const [cur, setCur] = useState<FreeEntry>({ id: '', d: T, title: '', text: '' });
  const [status, setStatus] = useState<'' | 'typing' | 'saved'>('');
  const latest = useRef({ cur, dirty: false, list });
  latest.current = { ...latest.current, cur, list };
  // Open an older entry for editing when asked from "My entries"
  useEffect(() => { if (!editId) return; const e = list.find((x) => x.id === editId); if (e) { setCur(e); setStatus('saved'); } }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps
  const flush = () => {
    const { cur: c, dirty, list: l } = latest.current;
    if (!dirty || !(c.text.trim() || c.title.trim())) return;
    const e = { ...c, id: c.id || uid() };
    const next = l.some((x) => x.id === e.id) ? l.map((x) => (x.id === e.id ? e : x)) : [...l, e];
    act.saveTool('fjournal', next);
    latest.current.dirty = false; if (!c.id) setCur(e); setStatus('saved');
  };
  useEffect(() => { if (!latest.current.dirty) return; const tm = setTimeout(flush, 1200); return () => clearTimeout(tm); }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); flush(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const up = (f: Partial<FreeEntry>) => { setCur((c) => ({ ...c, ...f })); latest.current.dirty = true; setStatus('typing'); };
  const startNew = () => { flush(); setCur({ id: '', d: T, title: '', text: '' }); setStatus(''); setEditId(null); };
  const save = () => { if (!cur.text.trim() && !cur.title.trim()) { toast("Write something first"); return; } latest.current.dirty = true; flush(); toast("Saved to your journal"); };
  return (
    <section className="card" id="myjournal">
      <div className="card-head"><h2>{t("My journal")}</h2></div>
      <p className="sub" style={{ marginTop: 0 }}>{t("Write about anything you like. It’s dated automatically.")}</p>
      <div className="jdate">📅 {fromKey(cur.d).toLocaleDateString(loc(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}{cur.d !== T && <span className="sub"> {t("· editing an earlier entry")}</span>}</div>
      <label className="lbl" htmlFor="fj-title">{t("Title")} <span className="sub">(optional)</span></label>
      <input type="text" id="fj-title" maxLength={120} placeholder={t("e.g. A good day at the lake")} value={cur.title} onChange={(e) => up({ title: e.target.value })} />
      <label className="lbl" htmlFor="fj-text" style={{ marginTop: 12 }}>{t("Entry")}</label>
      <textarea id="fj-text" style={{ minHeight: 220 }} placeholder={t("What’s on your mind?")} value={cur.text} onChange={(e) => up({ text: e.target.value })} />
      <p className="hint" aria-live="polite" style={{ margin: '6px 0 0', minHeight: 18 }}>{status === 'typing' ? t('Saving…') : status === 'saved' ? t('✓ Saved. It saves automatically as you write.') : t('Your entry saves automatically as you write.')}</p>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap' }}>
        {cur.id ? <button className="btn ghost small" onClick={startNew}>{t("Start a new entry")}</button> : <span />}
        <button className="btn primary" onClick={save}>{cur.id ? t('Update entry') : t('Save entry')}</button>
      </div>
    </section>
  );
}

export function Journal() {
  const { S, act, toast, isPlus } = useWW();
  const { TODAY, T } = today();
  const [shift, setShift] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const free: FreeEntry[] = S.tools.fjournal || [];
  const sermons: any[] = ((S.tools.bible || {}).sermons || []).filter((x: any) => x && x.d);
  const challengeOn = isPlus || FREE_CHALLENGES;
  const inChallenge = TODAY.getFullYear() === 2026 && TODAY.getMonth() === 10;
  const saved = S.journal[T];
  const [text, setText] = useState(saved?.text || '');
  useEffect(() => { if (saved?.text) setText((x) => x || saved.text); }, [saved?.text]);
  const pr = todaysPrompt(S, shift, challengeOn), p = P[pr.pillar];
  const past = Object.entries(S.journal).filter(([, v]) => v.text).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  // Answers written when checking in on goals (see GoalRowToday), shown with the journal by day
  const goalAnswers = S.goals.flatMap((g) => (((S.tools.gnotes || {})[g.id]) || []).map((n: { d: string; t: string }) => ({ ...n, goal: g.title, pillar: g.pillar, q: t(questionFor(S.tools, g) || 'Note') })));
  const entryDays = Array.from(new Set([...past.map(([k]) => k), ...goalAnswers.map((x) => x.d), ...free.map((x) => x.d), ...sermons.map((x) => x.d)])).sort((a, b) => (a < b ? 1 : -1));
  const preNov = TODAY < new Date(2026, 10, 1);
  // Saves automatically a moment after you stop typing, and when you leave the page.
  const [status, setStatus] = useState<'' | 'typing' | 'saved'>(saved?.text ? 'saved' : '');
  const latest = useRef({ text, pr, dirty: false });
  latest.current = { ...latest.current, text, pr };
  const flush = () => {
    const { text: t, pr: cur, dirty } = latest.current;
    if (!dirty || !t.trim()) return false;
    act.saveJournal({ pillar: cur.pillar, prompt: cur.text, label: cur.label, text: t.trim() });
    latest.current.dirty = false; setShift(0); setStatus('saved');
    return true;
  };
  useEffect(() => {
    if (!latest.current.dirty) return;
    const id = setTimeout(flush, 1200);
    return () => clearTimeout(id);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); flush(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const onType = (v: string) => { setText(v); latest.current.dirty = true; setStatus('typing'); };
  const saveEntry = () => {
    if (!text.trim()) { toast("Write something first"); return; }
    latest.current.dirty = true; flush(); toast("Journal entry saved");
  };
  return (
    <>
      <header className="top"><div><div className="brand">{t("Journal")}</div><h1>{t("Write it down")}</h1><div className="sub">{TODAY.toLocaleDateString(loc(), { weekday: 'long', month: 'long', day: 'numeric' })}</div></div></header>
      <div className="stack">
        <div className="jgrid"><div className="stack">
        <section className="card">
          <h2 style={{ marginBottom: 8 }}>{t("Today’s prompt")}</h2>
          <div className="pill" style={{ color: p.color }}><Icon id={p.id} size={14} />{pr.label || p.name}</div><div className="rule" />
          <p className="prompt" style={{ margin: '0 0 12px' }}>{pr.text}</p>
          <label className="lbl" htmlFor="jtext">{t("My entry")}</label>
          <textarea id="jtext" style={{ minHeight: 160 }} placeholder={t("Write as much or as little as you want.")} value={text} onChange={(e) => onType(e.target.value)} />
          <p className="hint" aria-live="polite" style={{ margin: '6px 0 0', minHeight: 18 }}>{status === 'typing' ? t('Saving…') : status === 'saved' ? t('✓ Saved. It saves automatically as you write.') : t('Your entry saves automatically as you write.')}</p>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn ghost small" onClick={() => { flush(); setShift((s) => s + 1); }}>{t("Show a different prompt")}</button>
            <button className="btn primary" onClick={saveEntry}>{saved ? t('Update entry') : t('Save entry')}</button>
          </div>
        </section>
        {inChallenge && !challengeOn && <PlusLock reason="challenge" title={t("30 Days, 9 Pillars")} text="All November, Plus members get a daily challenge prompt that walks through every pillar, starting with 30 things you’re grateful for." />}
        {preNov && <section className="card"><h2>{t("30 Days, 9 Pillars starts Nov 1")}</h2><p className="sub" style={{ margin: '6px 0 0' }}>{t("All November, your daily prompt comes from the challenge, starting with your list of 30 things you’re grateful for.")}</p></section>}
        </div>
        <FreeJournal editId={editId} setEditId={setEditId} /></div>
        <section className="card"><div className="card-head"><h2>{t("My entries")}</h2><span className="sub">{entryDays.length}</span></div>
          <p className="sub" style={{ marginTop: 0 }}>{t("Everything you’ve written, day by day: prompts, your own entries, and answers from your goals.")}</p>
          {entryDays.length ? entryDays.map((k) => { const v = S.journal[k]; const ans = goalAnswers.filter((x) => x.d === k); const fe = free.filter((x) => x.d === k); const sn = sermons.filter((x) => x.d === k); const pp = v?.text ? (P[v.pillar] || P.purpose) : ans.length ? P[ans[0].pillar] : sn.length && !fe.length ? P.spiritual : { color: 'var(--plum)' };
            return (
            <div className="goal" style={{ gridTemplateColumns: '4px 1fr' }} key={k}>
              <span className="stripe" style={{ background: pp.color }} />
              <div>
                <div className="goal-meta">{k === T ? <b style={{ color: 'var(--good)' }}>Today{v?.text ? ' ✓ Saved' : ''}</b> : fmtDate(k, { weekday: 'short', month: 'short', day: 'numeric' })}{v?.example && <span className="example">{t("Example")}</span>}</div>
                {v?.text && <><div className="sub" style={{ fontStyle: 'italic', margin: '3px 0' }}>{v.prompt}</div><div style={{ whiteSpace: 'pre-wrap' }}>{v.text}</div></>}
                {fe.map((x) => <div key={x.id} className={`jfree ${v?.text ? '' : 'solo'}`}><div className="card-head" style={{ margin: 0 }}><b>{x.title || t('Journal entry')}</b><span className="row" style={{ gap: 4 }}><button className="linkish" onClick={() => { setEditId(x.id); document.getElementById('myjournal')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{t("Edit")}</button><button className="x" aria-label={t("Delete entry")} onClick={() => { if (confirm('Delete this journal entry?')) { act.saveTool('fjournal', free.filter((y) => y.id !== x.id)); if (editId === x.id) setEditId(null); toast("Entry deleted"); } }}>×</button></span></div><div style={{ whiteSpace: 'pre-wrap' }}>{x.text}</div></div>)}
                {sn.map((x, i) => <div key={'s' + i} className={`jfree ${v?.text || fe.length ? '' : 'solo'}`}><b>📖 {x.title || x.ref || 'Sermon & study notes'}</b>{(x.who || (x.title && x.ref)) && <div className="sub">{[x.who, x.title ? x.ref : ''].filter(Boolean).join(' · ')}</div>}{x.notes && <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{x.notes}</div>}{x.take && <div className="said"><span>{t("Key takeaway")}</span><p>{x.take}</p></div>}</div>)}
                {ans.length > 0 && <div className={`jgoals ${v?.text || fe.length || sn.length ? "" : "solo"}`}>{ans.map((x, i) => <div key={i}><span className="pill" style={{ color: P[x.pillar].color }}><span className="dot" style={{ background: P[x.pillar].color }} />{x.goal}</span><div className="sub" style={{ fontStyle: 'italic' }}>{x.q}</div><div style={{ whiteSpace: 'pre-wrap' }}>{x.t}</div></div>)}</div>}
              </div>
            </div>); }) : <p className="empty">{t("Your entries will show up here.")}</p>}
        </section>
      </div>
    </>
  );
}

/* ---------- Gratitude ---------- */
export function Gratitude() {
  const { S, act, toast } = useWW();
  const [gt, setGt] = useState('');
  const list = [...S.gratitude].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return (
    <>
      <header className="top"><div><div className="brand">{t("Gratitude")}</div><h1>{t("Things I’m grateful for")}</h1><div className="sub">{t("One line a day adds up.")}</div></div></header>
      <div className="stack">
        <section className="card">
          <form className="stack" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); const v = gt.trim(); if (!v) return; act.addGratitude(v, false); setGt(''); toast(t("Added to your gratitude list")); }}>
            <label className="lbl" htmlFor="grat-new" style={{ margin: 0 }}>{t("Add today’s line")}</label>
            <div className="row"><input type="text" id="grat-new" placeholder={t("A person, a place, something small…")} value={gt} onChange={(e) => setGt(e.target.value)} maxLength={1000} /><button className="btn primary" type="submit">{t("Add")}</button></div>
          </form>
        </section>
        <section className="card"><div className="card-head"><h2>{t("My list")}</h2><span className="sub">{list.length} total</span></div>
          {list.length ? <ol className="grat-list">{list.map((x, i) => (
            <li key={x.id}><span className="n">{i + 1}</span><div>{x.text}{x.example && <span className="example">{t("Example")}</span>}<div className="d">{fmtDate(x.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div></div></li>
          ))}</ol> : <p className="empty">{t("Your list will show up here.")}</p>}
        </section>
      </div>
    </>
  );
}

/* ---------- Phase 2 & 3 placeholders ---------- */
export function ComingSoon({ which }: { which: 'resources' | 'adventures' }) {
  const r = which === 'resources';
  return (
    <>
      <header className="top"><div><div className="brand">{r ? 'Resources' : 'Adventures'}</div><h1>{r ? 'Tools & worksheets' : 'Fun, travel & dreams'}</h1>
        <div className="sub">{r ? 'Interactive versions of The Holistic Ecosystem workbooks.' : 'Where you’ve been, where you’re going, and what lights you up.'}</div></div></header>
      <div className="stack">
        <section className="card"><h2>{t("Coming in the next update")}</h2><div className="rule" />
          <p style={{ margin: 0 }}>{r
            ? 'Money worksheets, the Sleep Journal, Meal & Grocery Planner, Coping Skills Library, CBT Thought Record, Burnout Source Worksheet, Self-Compassion and Prayer Journals, the Couples Workbook, and the Life Vision Planner.'
            : 'Your World and United States travel maps, bucket lists, and hobbies, with photos.'}</p>
        </section>
      </div>
    </>
  );
}
