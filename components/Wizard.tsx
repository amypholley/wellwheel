'use client';
import { useEffect, useRef, useState } from 'react';
import { P, PILLARS, PRESETS, PillarId, Preset, autoQuestion, promptIdeas } from '@/lib/data';
import { addMonths, fmtNum, key, smartSentence, today, uid } from '@/lib/core';
import { Icon } from './ui';
import { useWW } from './store';
import { FREE_CUSTOM_GOALS, FREE_PILLAR_LIMIT, pillarsInUse } from '@/lib/plus';
import { loc, t } from '@/lib/i18n';

type Draft = {
  pillar: PillarId; title: string; type: 'habit' | 'target'; count: string | number; per: 'day' | 'week'; unit: string;
  target: string | number; why: string; deadline: string; sure: number;
  amt?: boolean; step?: number; stepLabel?: string; options?: number[] | null; weight?: boolean;
  src?: string; // the ready-made goal's English name, for suggesting a question in any language
};
const UNIT_OPTS = ['$', 'lbs', 'books', 'hours', 'miles', 'days', 'done'];

function startDraft(pillar: PillarId, pr: Preset | null): Draft {
  const { TODAY } = today();
  if (!pr) return { pillar, title: '', type: 'habit', count: 1, per: 'day', unit: 'times', target: '', why: '', deadline: key(addMonths(TODAY, 3)), sure: 7 };
  return {
    amt: !!pr.amt, step: pr.step, stepLabel: pr.stepLabel, pillar, title: pr.title, type: pr.type, count: pr.count || 1, per: pr.per || 'day', unit: pr.unit,
    target: pr.type === 'target' ? (pr.options!.length === 1 ? pr.options![0] : '') : '', why: '', deadline: key(addMonths(TODAY, pr.months || 3)), sure: 7,
    options: pr.options || null, weight: !!pr.weight, src: (pr as any).src || pr.title,
  };
}
const normalize = (g: Draft) => ({ ...g, count: Math.max(1, parseInt(String(g.count)) || 1), target: Number(g.target) || 0, title: g.title || 'my goal' });

export function Wizard() {
  const { wizard, setWizard, act, setView, toast, S, isPlus, setPlusOpen } = useWW();
  // Free accounts: goals in up to FREE_PILLAR_LIMIT pillars, preset goals only
  const used = pillarsInUse(S.goals);
  const pillarLocked = (id: PillarId) => !isPlus && !used.includes(id) && used.length >= FREE_PILLAR_LIMIT;
  const customLocked = !isPlus && !FREE_CUSTOM_GOALS;
  const first = (S.couple?.partner_name || '').split(' ')[0];
  const [step, setStep] = useState(1);
  const [pillar, setPillar] = useState<PillarId | null>(null);
  const [g, setG] = useState<Draft | null>(null);
  const [err, setErr] = useState('');
  const [share, setShare] = useState(false);
  // Ask a question at check-in: null means "use the suggestion for this goal's name"
  const [askOn, setAskOn] = useState<boolean | null>(null);
  const [askText, setAskText] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wizard) return;
    if (wizard.pillar && pillarLocked(wizard.pillar)) { setWizard(null); setPlusOpen('pillars'); return; }
    setAskOn(null); setAskText(null);
    if (wizard.edit) { const e = wizard.edit; setPillar(e.pillar); setStep(3); setErr(''); setShare(!!e.coupleId);
      const own = (S.tools.gq || {})[e.id]; if (own !== undefined) { setAskOn(own !== ''); setAskText(own || null); }
      setG({ pillar: e.pillar, title: e.title, type: e.type, count: e.count, per: e.per, unit: e.unit, target: e.target ?? '', why: e.why || '', deadline: e.deadline, sure: e.sure || 7, amt: e.amt, step: e.step, stepLabel: e.stepLabel, options: null });
    } else { setPillar(wizard.pillar || null); setStep(wizard.pillar ? 2 : 1); setG(null); setErr(''); setShare(!!wizard.share); }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [wizard]);
  useEffect(() => { ref.current?.scrollTo(0, 0); }, [step]);
  if (!wizard) return null;

  const close = () => setWizard(null);
  const up = (f: Partial<Draft>) => setG((d) => ({ ...d!, ...f }));
  const editing = wizard.edit;
  const back = <button className="linkish" onClick={() => (step === 1 || editing ? close() : setStep(step - 1))}>{step === 1 || editing ? 'Cancel' : '← Back'}</button>;
  const steps = <div className="steps">{[1, 2, 3].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>;
  const { T } = today();
  let body: React.ReactNode;

  if (step === 1) {
    body = (<>
      <header className="top"><div><div className="brand">{t("New goal · Step 1 of 3")}</div><h1>{t("Which pillar are you working on?")}</h1></div>{back}</header>{steps}
      <div className="tiles">{PILLARS.map((p) => (
        <button key={p.id} className="tile" style={{ ['--c' as any]: p.color }} onClick={() => { if (pillarLocked(p.id)) { setWizard(null); setPlusOpen('pillars'); return; } setPillar(p.id); setStep(2); }}>
          <span className="ico"><Icon id={p.id} /></span><b>{p.name}{pillarLocked(p.id) && <span className="badge" style={{ marginLeft: 6, verticalAlign: 2 }}>{t("Plus")}</span>}</b><small>{p.desc}</small>
        </button>))}</div>
    </>);
  } else if (step === 2 && pillar) {
    const p = P[pillar];
    body = (<>
      <header className="top"><div>
        <div className="brand" style={{ color: `color-mix(in srgb,${p.color} 75%,var(--ink))`, display: 'flex', alignItems: 'center', gap: 6 }}><Icon id={p.id} size={16} />{p.name} · Step 2 of 3</div>
        <h1>{t("Pick a goal to start from")}</h1><div className="sub">{PRESETS[pillar].length} ideas. You can change anything on the next step.</div></div>{back}</header>{steps}
      <div>
        {PRESETS[pillar].map((pr, i) => (
          <button key={i} className="preset" style={{ ['--c' as any]: p.color }} onClick={() => { setG(startDraft(pillar, pr)); setStep(3); }}>
            <span><b>{pr.title}</b><small>{pr.type === 'habit'
              ? (pr.count === 1 ? (pr.per === 'day' ? t('Every day') : t('Once a week')) : t(pr.per === 'day' ? '{c} {unit} a day' : '{c} {unit} a week', { c: pr.count!.toLocaleString(loc()), unit: pr.unit }))
              : pr.options!.length > 1 ? t('Choose an amount: {list}, or your own', { list: pr.options!.map((o) => fmtNum(o, pr.unit)).join(', ') }) : t('One-time goal')}</small></span>
            <span aria-hidden="true">›</span>
          </button>))}
        <button className="preset" style={{ ['--c' as any]: p.color, borderStyle: 'dashed' }} onClick={() => { if (customLocked) { setWizard(null); setPlusOpen('custom'); return; } setG(startDraft(pillar, null)); setStep(3); }}>
          <span><b>Write my own goal{customLocked && <span className="badge" style={{ marginLeft: 6, verticalAlign: 2 }}>{t("Plus")}</span>}</b><small>{t("Start from a blank SMART goal")}</small></span><span aria-hidden="true">›</span>
        </button>
      </div>
    </>);
  } else if (g) {
    const p = P[g.pillar];
    const setType = (t: 'habit' | 'target') => {
      let unit = g.unit;
      if (t === 'target' && !UNIT_OPTS.includes(unit)) unit = '$';
      if (t === 'habit' && ['$', 'lbs', 'done'].includes(unit)) unit = 'times';
      up({ type: t, amt: false, unit, target: t === 'target' && unit === 'done' ? 1 : g.target });
    };
    const canAsk = g.type === 'habit' && !g.amt;
    const suggestion = autoQuestion(g.src || g.title);
    const askIsOn = askOn ?? !!suggestion, askQ = askText ?? t(suggestion);
    const storeAsk = (id: string) => { if (!canAsk) return; if (askOn === null && askText === null) { if (g.src && g.src !== g.title && suggestion) act.saveTool('gq', { ...(S.tools.gq || {}), [id]: suggestion }); return; } act.saveTool('gq', { ...(S.tools.gq || {}), [id]: askIsOn ? (askQ.trim() || suggestion || t('How did it go?')) : '' }); };
    const save = () => {
      const n = normalize(g);
      if (!g.title.trim()) { setErr(t("Give your goal a name in the Specific box.")); return; }
      if (n.type === 'target' && !(n.target > 0)) { setErr(t("Pick or type an amount to reach.")); return; }
      if (editing) {
        act.updateGoal({ ...editing, title: g.title.trim(), type: n.type, count: n.count, per: n.per, unit: n.unit, target: n.type === 'target' ? n.target : undefined, why: (n.why || '').trim(), deadline: n.deadline, sure: n.sure, amt: n.type === 'habit' ? !!n.amt : false });
        storeAsk(editing.id); close(); toast(t("Goal updated")); return;
      }
      const newId = uid(); storeAsk(newId);
      act.addGoal({
        id: newId, amt: !!n.amt, step: n.step, stepLabel: n.stepLabel, pillar: n.pillar, title: g.title.trim(), type: n.type,
        count: n.count, per: n.per, unit: n.unit, target: n.type === 'target' ? n.target : undefined, why: (n.why || '').trim(), deadline: n.deadline, sure: n.sure,
        coupleId: share && S.couple ? S.couple.couple_id : null,
      });
      close(); setView('today'); toast(t("Goal saved. One step at a time."));
    };
    body = (<>
      <header className="top"><div>
        <div className="brand" style={{ color: `color-mix(in srgb,${p.color} 75%,var(--ink))`, display: 'flex', alignItems: 'center', gap: 6 }}><Icon id={p.id} size={16} />{p.name} · {editing ? t('Edit goal') : t('Step 3 of 3')}</div>
        <h1>{editing ? t('Edit your goal') : t('Make it SMART')}</h1></div>{back}</header>{!editing && steps}
      {editing && <p className="hint" style={{ marginTop: 0 }}>{t("Your check-ins so far stay the same. Changes apply from now on.")}</p>}
      <div className="card">
        <div className="field" style={{ borderTop: 0, paddingTop: 0 }}>
          <label className="lbl" htmlFor="w-title"><span className="letter">S</span>{t("Specific: what exactly will you do?")}</label>
          <input type="text" id="w-title" value={g.title} maxLength={200} placeholder={t("e.g. Walk 30 minutes with no earbuds")} onChange={(e) => up({ title: e.target.value })} />
        </div>
        <div className="field"><span className="lbl"><span className="letter">M</span>{t("Measurable: how will you count it?")}</span>
          <div className="seg" role="group" aria-label={t("Goal type")}>
            <button aria-pressed={g.type === 'habit'} onClick={() => setType('habit')}>{t("Repeat a habit")}</button>
            <button aria-pressed={g.type === 'target'} onClick={() => setType('target')}>{t("Reach a number")}</button>
          </div>
          <div style={{ marginTop: 10 }}>
            {g.type === 'habit' ? (<>
              {g.amt && <div className="hint" style={{ margin: '0 0 8px' }}>You’ll log it {g.stepLabel} at a time, or type any amount.</div>}
              {g.amt && g.options && (<>
                <div className="chips" role="group" aria-label={t("Daily amount")}>{g.options.map((o) => <button key={o} className="chip" aria-pressed={Number(g.count) === o} onClick={() => up({ count: o })}>{o.toLocaleString(loc())} {g.unit}</button>)}</div>
                <div className="hint">{t("Or type your own daily amount:")}</div></>)}
              <div className="grid3" style={{ marginTop: 6 }}>
                <input type="number" min="1" inputMode="numeric" value={g.count} aria-label={t("How many")} onChange={(e) => up({ count: e.target.value })} />
                <input type="text" value={g.unit} aria-label={t("Unit, like times or walks")} onChange={(e) => up({ unit: e.target.value })} />
                <select value={g.per} aria-label={t("How often")} onChange={(e) => up({ per: e.target.value as any })}><option value="day">{t("a day")}</option><option value="week">{t("a week")}</option></select>
              </div>
            </>) : (<>
              {g.options && g.options.length > 1 && (<>
                <div className="chips" role="group" aria-label={t("Preset amounts")}>{g.options.map((o) => <button key={o} className="chip" aria-pressed={Number(g.target) === o} onClick={() => up({ target: o })}>{fmtNum(o, g.unit)}</button>)}</div>
                <div className="hint">{t("Or type your own amount:")}</div></>)}
              <div className="grid2" style={{ marginTop: 6 }}>
                <select value={UNIT_OPTS.includes(g.unit) ? g.unit : '$'} aria-label={t("Unit")} onChange={(e) => up({ unit: e.target.value, target: e.target.value === 'done' ? 1 : g.target })}>
                  {UNIT_OPTS.map((u) => <option key={u} value={u}>{u === 'done' ? 'one-time' : u}</option>)}
                </select>
                <input type="number" min="0" step="any" inputMode="decimal" value={g.unit === 'done' ? '' : g.target} placeholder={t("Amount")} aria-label={t("Target amount")} disabled={g.unit === 'done'} onChange={(e) => up({ target: e.target.value })} />
              </div>
              {g.weight && <div className="note">{t("Many people aim for about 1–2 lbs a week. For bigger goals, a doctor can help you plan a pace that works for your body.")}</div>}
            </>)}
          </div>
        </div>
        {canAsk && <div className="field">
          <label className="ck"><input type="checkbox" checked={askIsOn} onChange={(e) => { setAskOn(e.target.checked); if (e.target.checked && !askQ) setAskText('How did it go?'); }} /><span>{t("📝 Ask me a question when I check in")} <span className="sub">(answers save to my journal)</span></span></label>
          {askIsOn && <input type="text" style={{ marginTop: 8 }} aria-label={t("Question to ask at check-in")} maxLength={200} placeholder={t("e.g. What was your win today?")} value={askQ} onChange={(e) => setAskText(e.target.value)} />}
          {askIsOn && <div className="chips" role="group" aria-label={t("Prompt ideas")}>{promptIdeas(g.src || g.title, suggestion).filter((x) => t(x) !== askQ).slice(0, 5).map((x) => <button key={x} type="button" className="chip" onClick={() => setAskText(t(x))}>{t(x)}</button>)}</div>}
          {askIsOn && askOn === null && askText === null && <div className="hint" style={{ marginBottom: 0 }}>{t("Suggested from your goal’s name. Change it to anything you like.")}</div>}
        </div>}
        <div className="field">
          <label className="lbl" htmlFor="w-sure"><span className="letter">A</span>{t("Achievable: how sure are you that you can do this?")} <span style={{ color: 'var(--plum)' }}>{g.sure}/10</span></label>
          <input type="range" min="1" max="10" id="w-sure" value={g.sure} onChange={(e) => up({ sure: Number(e.target.value) })} />
          {g.sure < 6 && <div className="note">{t("Below a 6? Try a smaller version first. You can always raise it later.")}</div>}
        </div>
        <div className="field">
          <label className="lbl" htmlFor="w-why"><span className="letter">R</span>{t("Relevant: why does this matter to you?")}</label>
          <textarea id="w-why" placeholder={t("e.g. I want more energy for the people I love.")} value={g.why} onChange={(e) => up({ why: e.target.value })} />
        </div>
        <div className="field">
          <label className="lbl" htmlFor="w-date"><span className="letter">T</span>{t("Time-bound: by when?")}</label>
          <input type="date" id="w-date" value={g.deadline} min={T} onChange={(e) => up({ deadline: e.target.value || g.deadline })} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}><div className="pill" style={{ marginBottom: 6 }}>{t("Your goal")}</div><div className="summary">{smartSentence(normalize(g))}</div></div>
      {S.couple && !editing && <label className="ck sharebox"><input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} /><span>💞 Share this goal with {first} so you both can track it and add progress</span></label>}
      <p className="hint" style={{ color: '#B3443A' }}>{err}</p>
      <button className="btn primary wide" style={{ marginTop: 6 }} onClick={save}>{editing ? t('Save changes') : t('Save goal')}</button>
    </>);
  }
  return <div className="sheet" ref={ref} role="dialog" aria-modal="true" aria-label={t("New goal")}><div className="app">{body}</div></div>;
}
