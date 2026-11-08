'use client';
import { useEffect, useRef, useState } from 'react';
import { P, PILLARS } from '@/lib/data';
import { Goal, dayVal, fmtDate, fmtNum, fromKey, goalWeekScore, key, pillarScore, smartSentence, today, todaysPrompt, total, weekSum } from '@/lib/core';
import { Icon, Wheel, initials } from './ui';
import { firstName, useWW } from './store';
import { PillarReport, PlusLock } from './Plus';
import { FeedbackButton } from './Feedback';
import { ShareCard } from './Share';
import { FREE_CHALLENGES } from '@/lib/plus';

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
    const who = u === S.me ? 'You' : u === S.couple!.partner_id ? partnerFirst(S) : 'Earlier';
    const amt = g.unit === '$' ? '$' + Number(v).toLocaleString('en-US') : Number(v).toLocaleString('en-US') + (g.type === 'target' && g.unit !== 'done' ? ' ' + g.unit : '');
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
      <div className="card-head"><h2>💞 You & {first}</h2><button className="linkish" onClick={() => setProfileOpen(true)}>Sharing settings</button></div>
      <div className="mapstats" style={{ marginTop: 4 }}>
        <div><b>{shared}</b><span>shared goal{shared === 1 ? '' : 's'}</span></div>
        <div><b>{dreams}</b><span>couple dreams</span></div>
        <div><b>{both}</b><span>places together</span></div>
      </div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn small" onClick={() => go('adventures', { adv: 'map', who: 'us' })}>Our map</button>
        <button className="btn small" onClick={() => go('adventures', { adv: 'bucket', who: 'us' })}>Our bucket list</button>
        <button className="btn small" onClick={() => go('portfolio', { joint: true })}>Our money plan</button>
        <button className="btn small" onClick={() => setWizard({ share: true })}>+ Shared goal</button>
      </div>
    </section>
  );
}

/* ---------- Today ---------- */
function GoalRowToday({ g, logOpen, setLogOpen }: { g: Goal; logOpen: string | null; setLogOpen: (v: string | null) => void }) {
  const { S, act, toast } = useWW();
  const { T } = today();
  const p = P[g.pillar];
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState('');
  useEffect(() => { if (logOpen === g.id) inputRef.current?.focus(); }, [logOpen, g.id]);

  const plus = () => {
    const before = dayVal(S, g, T), inc = g.amt ? g.step : 1, after = before + inc;
    act.log(g.id, inc);
    if (g.amt) { if (before < g.count && after >= g.count) toast('Daily goal reached!'); return; }
    if (g.type === 'habit') {
      const n = g.per === 'week' ? weekSum(S, g) + inc : after;
      if (n === g.count) toast(g.per === 'day' ? 'Done for today. Nice work.' : 'Weekly goal reached!');
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
    act.log(g.id, v); setAmount(''); setLogOpen(null); toast('Progress logged');
  };

  let meta: string, ticks: React.ReactNode = null, ctrl: React.ReactNode, extra: React.ReactNode = null;
  const logForm = (ph: string, label: string) => (
    <form className="logrow" onSubmit={submitLog}>
      <input ref={inputRef} type="number" step="any" min="0" inputMode="decimal" placeholder={ph} aria-label={label} value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn primary small" type="submit">Add</button>
    </form>
  );
  if (g.type === 'habit' && g.amt) {
    const n = dayVal(S, g, T), pct = Math.min(100, Math.round((n / g.count) * 100));
    meta = `${n.toLocaleString('en-US')} of ${Number(g.count).toLocaleString('en-US')} ${g.unit} today${n >= g.count ? ' ✓' : ''}`;
    ticks = <div className="bar"><span style={{ width: pct + '%', background: p.color }} /></div>;
    ctrl = (
      <div className="counter">
        {n > 0 && <button className="round" onClick={minus} aria-label={`Take back ${g.stepLabel}`}>−</button>}
        <button className="btn small primary" onClick={plus}>{g.stepLabel || '+' + g.step}</button>
        <button className="btn small" onClick={() => setLogOpen(logOpen === g.id ? null : g.id)}>Other</button>
      </div>
    );
    if (logOpen === g.id) extra = logForm(g.unit === 'oz' ? 'Ounces, e.g. 16' : `How many ${g.unit}?`, 'Amount to add');
  } else if (g.type === 'habit') {
    const n = g.per === 'day' ? dayVal(S, g, T) : weekSum(S, g);
    const done = n >= g.count;
    meta = g.per === 'day' ? `${Math.min(n, g.count)} of ${g.count} today` : `${n} of ${g.count} ${g.unit} this week`;
    ticks = g.count > 12
      ? <div className="bar"><span style={{ width: Math.min(100, Math.round((n / g.count) * 100)) + '%', background: p.color }} /></div>
      : <div className="ticks" aria-hidden="true">{Array.from({ length: g.count }, (_, i) => <span key={i} className={`tick ${i < n ? 'on' : ''}`} style={i < n ? { background: p.color } : undefined} />)}</div>;
    ctrl = (
      <div className="counter">
        {dayVal(S, g, T) > 0 && <button className="round" onClick={minus} aria-label={`Undo one check-in for ${g.title}`}>−</button>}
        <button className={`round ${done ? 'done' : 'plus'}`} onClick={plus} aria-label={`Check in ${g.title}`}>{done ? '✓' : '+'}</button>
      </div>
    );
  } else {
    const t = total(S, g), pct = Math.min(100, Math.round((t / g.target) * 100));
    meta = g.unit === 'done' ? (t >= 1 ? 'Done' : 'Not done yet') : `${fmtNum(t, g.unit)} of ${fmtNum(g.target, g.unit)} · ${pct}%`;
    ticks = <div className="bar"><span style={{ width: pct + '%', background: p.color }} /></div>;
    ctrl = g.unit === 'done'
      ? <button className={`round ${t >= 1 ? 'done' : 'plus'}`} onClick={t >= 1 ? minus : plus} aria-label={`Mark ${g.title} done`}>{t >= 1 ? '✓' : '+'}</button>
      : <button className="btn small" onClick={() => setLogOpen(logOpen === g.id ? null : g.id)}>Log</button>;
    if (logOpen === g.id) extra = logForm(g.unit === '$' ? 'Amount saved, e.g. 50' : `How many ${g.unit}?`, 'Amount to log');
  }
  return (
    <div className="goal">
      <span className="stripe" style={{ background: p.color }} />
      <div>
        <div className="pill"><span className="dot" style={{ background: p.color }} />{p.name}{g.example && <span className="example">Example</span>}<SharedTag g={g} /></div>
        <div className="goal-title">{g.title}</div>
        <div className="goal-meta">{meta}</div>
        {ticks}<Contrib g={g} />
      </div>
      {ctrl}{extra}
    </div>
  );
}

function JournalTeaser() {
  const { S, setView, isPlus } = useWW();
  const { T } = today();
  const pr = todaysPrompt(S, 0, isPlus || FREE_CHALLENGES), p = P[pr.pillar], done = !!(S.journal[T] && S.journal[T].text);
  return (
    <section className="card">
      <div className="card-head"><h2>Today’s journal prompt</h2>{done && <span className="sub" style={{ color: 'var(--good)', fontWeight: 600 }}>✓ Written</span>}</div>
      <div className="pill" style={{ color: p.color }}><Icon id={p.id} size={14} />{pr.label || p.name}</div>
      <div className="rule" />
      <p className="prompt" style={{ margin: '0 0 12px' }}>{pr.text}</p>
      <button className={`btn ${done ? '' : 'primary'}`} onClick={() => setView('journal')}>{done ? 'Open my journal' : 'Write in my journal'}</button>
    </section>
  );
}

export function Today() {
  const { S, act, profile, mode, setWizard, setProfileOpen, setAuthOpen, toast } = useWW();
  const { TODAY, T } = today();
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const [grat, setGrat] = useState('');
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const todays = S.gratitude.find((x) => x.date === T);
  const name = firstName(profile);
  return (
    <>
      {mode === 'guest' && (
        <div className="guestbar"><span>You’re looking around with example data. Nothing is saved.</span><button className="btn small primary" onClick={() => setAuthOpen('signup')}>Sign up</button></div>
      )}
      <header className="top">
        <div><div className="brand">WellWheel · The Holistic Ecosystem</div><h1>{greet}{name ? ', ' + name : ''}</h1><div className="sub">{TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div></div>
        <button className="avatar" onClick={() => setProfileOpen(true)} aria-label="Profile and account">
          {profile ? initials(profile.display_name) : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>}
        </button>
      </header>
      {/* Wide screens: wheel on the left, check-ins on the right, the rest underneath. Phones: one column. */}
      <div className="today-grid">
        <section className="card tg-wheel">
          <div className="card-head"><h2>This week’s balance</h2><span className="sub">Tap a pillar to add a goal</span></div>
          <div className="wheel-wrap"><Wheel S={S} />
            <div className="legend">
              {PILLARS.map((p) => { const sc = pillarScore(S, p.id); return (
                <button key={p.id} onClick={() => setWizard({ pillar: p.id })} aria-label={sc === null ? 'Add a goal for ' + p.name : `${p.name} ${Math.round(sc * 100)} percent`}>
                  <span className="dot" style={{ background: p.color, opacity: sc === null ? 0.3 : 1 }} />{p.name}<span className="pct">{sc === null ? '+' : Math.round(sc * 100) + '%'}</span>
                </button>); })}
            </div>
          </div>
        </section>
        <div className="tg-main stack">
        <TogetherCard />
        <section className="card">
          <div className="card-head"><h2>Today’s check-ins</h2><button className="linkish" onClick={() => setWizard({})}>+ New goal</button></div>
          {S.goals.length ? S.goals.map((g) => <GoalRowToday key={g.id} g={g} logOpen={logOpen} setLogOpen={setLogOpen} />) : (
            <><p className="empty">No goals yet. Pick a pillar and start with one small goal.</p><button className="btn primary" onClick={() => setWizard({})}>Set my first goal</button></>
          )}
        </section>
        </div>
        <div className="tg-under">
        <section className="card">
          <div className="card-head"><h2>Grateful today</h2><span className="sub">{S.gratitude.length} so far</span></div>
          {todays ? (<><p className="prompt" style={{ margin: 0 }}>“{todays.text}”</p><button className="linkish" style={{ marginTop: 8 }} onClick={() => act.clearTodayGratitude()}>Change it</button></>) : (
            <form className="row" onSubmit={(e) => { e.preventDefault(); const t = grat.trim(); if (!t) return; act.addGratitude(t, true); setGrat(''); toast('Added to your gratitude list'); }}>
              <input type="text" placeholder="Today I’m grateful for…" aria-label="Today I’m grateful for" value={grat} onChange={(e) => setGrat(e.target.value)} maxLength={1000} />
              <button className="btn primary" type="submit">Save</button>
            </form>
          )}
        </section>
        <JournalTeaser />
        </div>
      </div>
    </>
  );
}

/* ---------- Goals ---------- */
export function Goals() {
  const { S, act, setWizard, toast } = useWW();
  const [del, setDel] = useState<string | null>(null);
  const first = partnerFirst(S);
  const mine = (g: Goal) => !g.ownerId || g.ownerId === S.me;
  const empty = PILLARS.filter((p) => !S.goals.some((g) => g.pillar === p.id));
  const groups = PILLARS.map((p) => {
    const gs = S.goals.filter((g) => g.pillar === p.id); if (!gs.length) return null;
    return (
      <section className="card" key={p.id}>
        <div className="card-head"><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: p.color, display: 'flex' }}><Icon id={p.id} size={20} /></span>{p.name}</h2><button className="linkish" onClick={() => setWizard({ pillar: p.id })}>+ Add</button></div>
        {gs.map((g) => (
          <div className="goal" style={{ gridTemplateColumns: '4px 1fr' }} key={g.id}>
            <span className="stripe" style={{ background: p.color }} />
            <div>
              <div className="goal-title">{g.title}{g.example && <span className="example">Example</span>}<SharedTag g={g} /></div>
              <p style={{ margin: '4px 0 6px', fontSize: 14 }}>{smartSentence(g)}</p>
              <div className="goal-meta">Confidence {g.sure || '–'}/10 · Due {fmtDate(g.deadline)}</div>
              <Contrib g={g} />
              {!mine(g) ? <p className="hint" style={{ marginBottom: 0 }}>{first} created this shared goal. You can both log progress.</p> :
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {S.couple && <button className="btn small" onClick={() => { act.shareGoal(g.id, !g.coupleId); toast(g.coupleId ? 'Stopped sharing. It’s only on your goals now.' : `Shared with ${first}. You can both log progress.`); }}>{g.coupleId ? 'Stop sharing' : `💞 Share with ${first}`}</button>}
                <button className="btn small" onClick={() => setWizard({ edit: g })}>Edit</button>
                <button className={`btn small ${del === g.id ? 'primary' : ''}`} onClick={() => { if (del === g.id) { act.deleteGoal(g.id); setDel(null); toast('Goal deleted'); } else setDel(g.id); }}>{del === g.id ? 'Tap again to delete' : 'Delete'}</button>
              </div>}
            </div>
          </div>
        ))}
      </section>
    );
  });
  return (
    <>
      <header className="top"><div><div className="brand">My goals</div><h1>Goals by pillar</h1><div className="sub">{S.goals.length} active · {9 - empty.length} of 9 pillars</div></div><button className="btn primary" onClick={() => setWizard({})}>+ New goal</button></header>
      <div className="stack">
        {S.goals.length ? groups : <p className="empty">No goals yet.</p>}
        {empty.length > 0 && (
          <section className="card"><h2>Pillars with no goal yet</h2>
            <div className="chips">{empty.map((p) => <button key={p.id} className="chip" onClick={() => setWizard({ pillar: p.id })}><span className="dot" style={{ background: p.color, marginRight: 6 }} />{p.name}</button>)}</div>
          </section>
        )}
      </div>
    </>
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
      <header className="top"><div><div className="brand">Progress</div><h1>How it’s going</h1><div className="sub">{weekStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div></div></header>
      <div className="stack">
        <section className="card"><div className="card-head"><h2>Goals this week</h2></div>
          {S.goals.length ? S.goals.map((g) => {
            const p = P[g.pillar];
            const daysLeft = g.deadline ? Math.max(0, Math.round((fromKey(g.deadline).getTime() - TODAY.getTime()) / 864e5)) : null;
            let body: React.ReactNode;
            if (g.type === 'habit') {
              body = <div className="week">{weekDays.map((d) => { const k = key(d), v = dayVal(S, g, k), f = d > TODAY; const goal = g.per === 'day' ? g.count : 1; const o = f ? 0 : Math.min(1, v / goal);
                return <div key={k}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}<div className="sq" style={o > 0 ? { background: p.color, opacity: 0.35 + 0.65 * o } : undefined} title={`${k}: ${v}`} /></div>; })}</div>;
            } else {
              const t = total(S, g), pct = Math.min(100, Math.round((t / g.target) * 100));
              body = <><div className="bar" style={{ height: 12 }}><span style={{ width: pct + '%', background: p.color }} /></div><div className="goal-meta" style={{ marginTop: 4 }}>{fmtNum(t, g.unit)} of {fmtNum(g.target, g.unit)} ({pct}%)</div></>;
            }
            return (
              <div className="goal" style={{ gridTemplateColumns: '4px 1fr' }} key={g.id}>
                <span className="stripe" style={{ background: p.color }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span className="goal-title">{g.title}</span><span className="goal-meta">{Math.round(goalWeekScore(S, g) * 100)}% this week</span></div>
                  {body}
                  {daysLeft !== null && <div className="goal-meta" style={{ marginTop: 6 }}>{daysLeft} days left</div>}
                </div>
              </div>
            );
          }) : <p className="empty">Add a goal to see progress.</p>}
        </section>
        <section className="card"><div className="card-head"><h2>Gratitude</h2></div><p style={{ margin: 0 }}>{thisMonth} line{thisMonth === 1 ? '' : 's'} this month, {S.gratitude.length} all time.</p></section>
        {isPlus ? <PillarReport /> : <PlusLock reason="report" title="Monthly pillar report" text="See which pillars got your energy this month, which ones got left out, and a suggested focus for next month. Includes every 30-day challenge and all worksheets." />}
        <section className="card"><div className="card-head"><h2>Help make WellWheel better</h2></div>
          <p className="sub" style={{ marginTop: 0 }}>Found a problem, or have an idea? We read every note.</p>
          <FeedbackButton /></section>
        {mode === 'user' && <ShareCard />}
        <section className="card"><h2>Example data</h2>
          <p className="hint">{mode === 'guest' ? 'You’re looking around. Nothing here is saved.' : 'Your goals are saved to your account and sync across your devices.'}</p>
          <div className="row" style={{ flexWrap: 'wrap', marginTop: 8 }}>
            {hasExamples && <button className="btn small" onClick={() => { act.removeExamples(); toast('Examples removed'); }}>Remove example goals</button>}
            <button className="btn small" onClick={() => { act.addExamples(); toast('Examples added'); }}>Add example goals</button>
          </div>
        </section>
      </div>
    </>
  );
}

/* ---------- Journal ---------- */
export function Journal() {
  const { S, act, toast, isPlus } = useWW();
  const { TODAY, T } = today();
  const [shift, setShift] = useState(0);
  const challengeOn = isPlus || FREE_CHALLENGES;
  const inChallenge = TODAY.getFullYear() === 2026 && TODAY.getMonth() === 10;
  const saved = S.journal[T];
  const [text, setText] = useState(saved?.text || '');
  useEffect(() => { if (saved?.text) setText((t) => t || saved.text); }, [saved?.text]);
  const pr = todaysPrompt(S, shift, challengeOn), p = P[pr.pillar];
  const past = Object.entries(S.journal).filter(([, v]) => v.text).sort((a, b) => (a[0] < b[0] ? 1 : -1));
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
    if (!text.trim()) { toast('Write something first'); return; }
    latest.current.dirty = true; flush(); toast('Journal entry saved');
  };
  return (
    <>
      <header className="top"><div><div className="brand">Journal</div><h1>Today’s prompt</h1><div className="sub">{TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div></div></header>
      <div className="stack">
        <section className="card">
          <div className="pill" style={{ color: p.color }}><Icon id={p.id} size={14} />{pr.label || p.name}</div><div className="rule" />
          <p className="prompt" style={{ margin: '0 0 12px' }}>{pr.text}</p>
          <label className="lbl" htmlFor="jtext">My entry</label>
          <textarea id="jtext" style={{ minHeight: 160 }} placeholder="Write as much or as little as you want." value={text} onChange={(e) => onType(e.target.value)} />
          <p className="hint" aria-live="polite" style={{ margin: '6px 0 0', minHeight: 18 }}>{status === 'typing' ? 'Saving…' : status === 'saved' ? '✓ Saved. It saves automatically as you write.' : 'Your entry saves automatically as you write.'}</p>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn ghost small" onClick={() => { flush(); setShift((s) => s + 1); }}>Show a different prompt</button>
            <button className="btn primary" onClick={saveEntry}>{saved ? 'Update entry' : 'Save entry'}</button>
          </div>
        </section>
        {inChallenge && !challengeOn && <PlusLock reason="challenge" title="30 Days, 9 Pillars" text="All November, Plus members get a daily challenge prompt that walks through every pillar, starting with 30 things you’re grateful for." />}
        {preNov && <section className="card"><h2>30 Days, 9 Pillars starts Nov 1</h2><p className="sub" style={{ margin: '6px 0 0' }}>All November, your daily prompt comes from the challenge, starting with your list of 30 things you’re grateful for.</p></section>}
        <section className="card"><div className="card-head"><h2>My entries</h2><span className="sub">{past.length}</span></div>
          {past.length ? past.map(([k, v]) => { const pp = P[v.pillar] || P.purpose; return (
            <div className="goal" style={{ gridTemplateColumns: '4px 1fr' }} key={k}>
              <span className="stripe" style={{ background: pp.color }} />
              <div>
                <div className="goal-meta">{k === T ? <b style={{ color: 'var(--good)' }}>Today ✓ Saved</b> : fmtDate(k, { weekday: 'short', month: 'short', day: 'numeric' })}{v.example && <span className="example">Example</span>}</div>
                <div className="sub" style={{ fontStyle: 'italic', margin: '3px 0' }}>{v.prompt}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{v.text}</div>
              </div>
            </div>); }) : <p className="empty">Your entries will show up here.</p>}
        </section>
      </div>
    </>
  );
}

/* ---------- Gratitude ---------- */
export function Gratitude() {
  const { S, act, toast } = useWW();
  const [t, setT] = useState('');
  const list = [...S.gratitude].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return (
    <>
      <header className="top"><div><div className="brand">Gratitude</div><h1>Things I’m grateful for</h1><div className="sub">One line a day adds up.</div></div></header>
      <div className="stack">
        <section className="card">
          <form className="stack" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); const v = t.trim(); if (!v) return; act.addGratitude(v, false); setT(''); toast('Added to your gratitude list'); }}>
            <label className="lbl" htmlFor="grat-new" style={{ margin: 0 }}>Add today’s line</label>
            <div className="row"><input type="text" id="grat-new" placeholder="A person, a place, something small…" value={t} onChange={(e) => setT(e.target.value)} maxLength={1000} /><button className="btn primary" type="submit">Add</button></div>
          </form>
        </section>
        <section className="card"><div className="card-head"><h2>My list</h2><span className="sub">{list.length} total</span></div>
          {list.length ? <ol className="grat-list">{list.map((x, i) => (
            <li key={x.id}><span className="n">{i + 1}</span><div>{x.text}{x.example && <span className="example">Example</span>}<div className="d">{fmtDate(x.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div></div></li>
          ))}</ol> : <p className="empty">Your list will show up here.</p>}
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
        <section className="card"><h2>Coming in the next update</h2><div className="rule" />
          <p style={{ margin: 0 }}>{r
            ? 'Money worksheets, the Sleep Journal, Meal & Grocery Planner, Coping Skills Library, CBT Thought Record, Burnout Source Worksheet, Self-Compassion and Prayer Journals, the Couples Workbook, and the Life Vision Planner.'
            : 'Your World and United States travel maps, bucket lists, and hobbies, with photos.'}</p>
        </section>
      </div>
    </>
  );
}
