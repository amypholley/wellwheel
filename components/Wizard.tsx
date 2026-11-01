'use client';
import { useEffect, useRef, useState } from 'react';
import { P, PILLARS, PRESETS, PillarId, Preset } from '@/lib/data';
import { addMonths, fmtNum, key, smartSentence, today, uid } from '@/lib/core';
import { Icon } from './ui';
import { useWW } from './store';

type Draft = {
  pillar: PillarId; title: string; type: 'habit' | 'target'; count: string | number; per: 'day' | 'week'; unit: string;
  target: string | number; why: string; deadline: string; sure: number;
  amt?: boolean; step?: number; stepLabel?: string; options?: number[] | null; weight?: boolean;
};
const UNIT_OPTS = ['$', 'lbs', 'books', 'hours', 'miles', 'days', 'done'];

function startDraft(pillar: PillarId, pr: Preset | null): Draft {
  const { TODAY } = today();
  if (!pr) return { pillar, title: '', type: 'habit', count: 1, per: 'day', unit: 'times', target: '', why: '', deadline: key(addMonths(TODAY, 3)), sure: 7 };
  return {
    amt: !!pr.amt, step: pr.step, stepLabel: pr.stepLabel, pillar, title: pr.title, type: pr.type, count: pr.count || 1, per: pr.per || 'day', unit: pr.unit,
    target: pr.type === 'target' ? (pr.options!.length === 1 ? pr.options![0] : '') : '', why: '', deadline: key(addMonths(TODAY, pr.months || 3)), sure: 7,
    options: pr.options || null, weight: !!pr.weight,
  };
}
const normalize = (g: Draft) => ({ ...g, count: Math.max(1, parseInt(String(g.count)) || 1), target: Number(g.target) || 0, title: g.title || 'my goal' });

export function Wizard() {
  const { wizard, setWizard, act, setView, toast, S } = useWW();
  const first = (S.couple?.partner_name || '').split(' ')[0];
  const [step, setStep] = useState(1);
  const [pillar, setPillar] = useState<PillarId | null>(null);
  const [g, setG] = useState<Draft | null>(null);
  const [err, setErr] = useState('');
  const [share, setShare] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wizard) return;
    setPillar(wizard.pillar || null); setStep(wizard.pillar ? 2 : 1); setG(null); setErr(''); setShare(!!wizard.share);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [wizard]);
  useEffect(() => { ref.current?.scrollTo(0, 0); }, [step]);
  if (!wizard) return null;

  const close = () => setWizard(null);
  const up = (f: Partial<Draft>) => setG((d) => ({ ...d!, ...f }));
  const back = <button className="linkish" onClick={() => (step === 1 ? close() : setStep(step - 1))}>{step === 1 ? 'Cancel' : '← Back'}</button>;
  const steps = <div className="steps">{[1, 2, 3].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>;
  const { T } = today();
  let body: React.ReactNode;

  if (step === 1) {
    body = (<>
      <header className="top"><div><div className="brand">New goal · Step 1 of 3</div><h1>Which pillar are you working on?</h1></div>{back}</header>{steps}
      <div className="tiles">{PILLARS.map((p) => (
        <button key={p.id} className="tile" style={{ ['--c' as any]: p.color }} onClick={() => { setPillar(p.id); setStep(2); }}>
          <span className="ico"><Icon id={p.id} /></span><b>{p.name}</b><small>{p.desc}</small>
        </button>))}</div>
    </>);
  } else if (step === 2 && pillar) {
    const p = P[pillar];
    body = (<>
      <header className="top"><div>
        <div className="brand" style={{ color: `color-mix(in srgb,${p.color} 75%,var(--ink))`, display: 'flex', alignItems: 'center', gap: 6 }}><Icon id={p.id} size={16} />{p.name} · Step 2 of 3</div>
        <h1>Pick a goal to start from</h1><div className="sub">{PRESETS[pillar].length} ideas. You can change anything on the next step.</div></div>{back}</header>{steps}
      <div>
        {PRESETS[pillar].map((pr, i) => (
          <button key={i} className="preset" style={{ ['--c' as any]: p.color }} onClick={() => { setG(startDraft(pillar, pr)); setStep(3); }}>
            <span><b>{pr.title}</b><small>{pr.type === 'habit'
              ? (pr.count === 1 ? (pr.per === 'day' ? 'Every day' : 'Once a week') : `${pr.count!.toLocaleString('en-US')} ${pr.unit} a ${pr.per}`)
              : pr.options!.length > 1 ? `Choose an amount: ${pr.options!.map((o) => fmtNum(o, pr.unit)).join(', ')}, or your own` : 'One-time goal'}</small></span>
            <span aria-hidden="true">›</span>
          </button>))}
        <button className="preset" style={{ ['--c' as any]: p.color, borderStyle: 'dashed' }} onClick={() => { setG(startDraft(pillar, null)); setStep(3); }}>
          <span><b>Write my own goal</b><small>Start from a blank SMART goal</small></span><span aria-hidden="true">›</span>
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
    const save = () => {
      const n = normalize(g);
      if (!g.title.trim()) { setErr('Give your goal a name in the Specific box.'); return; }
      if (n.type === 'target' && !(n.target > 0)) { setErr('Pick or type an amount to reach.'); return; }
      act.addGoal({
        id: uid(), amt: !!n.amt, step: n.step, stepLabel: n.stepLabel, pillar: n.pillar, title: g.title.trim(), type: n.type,
        count: n.count, per: n.per, unit: n.unit, target: n.type === 'target' ? n.target : undefined, why: (n.why || '').trim(), deadline: n.deadline, sure: n.sure,
        coupleId: share && S.couple ? S.couple.couple_id : null,
      });
      close(); setView('today'); toast('Goal saved. One step at a time.');
    };
    body = (<>
      <header className="top"><div>
        <div className="brand" style={{ color: `color-mix(in srgb,${p.color} 75%,var(--ink))`, display: 'flex', alignItems: 'center', gap: 6 }}><Icon id={p.id} size={16} />{p.name} · Step 3 of 3</div>
        <h1>Make it SMART</h1></div>{back}</header>{steps}
      <div className="card">
        <div className="field" style={{ borderTop: 0, paddingTop: 0 }}>
          <label className="lbl" htmlFor="w-title"><span className="letter">S</span>Specific: what exactly will you do?</label>
          <input type="text" id="w-title" value={g.title} maxLength={200} placeholder="e.g. Walk 30 minutes with no earbuds" onChange={(e) => up({ title: e.target.value })} />
        </div>
        <div className="field"><span className="lbl"><span className="letter">M</span>Measurable: how will you count it?</span>
          <div className="seg" role="group" aria-label="Goal type">
            <button aria-pressed={g.type === 'habit'} onClick={() => setType('habit')}>Repeat a habit</button>
            <button aria-pressed={g.type === 'target'} onClick={() => setType('target')}>Reach a number</button>
          </div>
          <div style={{ marginTop: 10 }}>
            {g.type === 'habit' ? (<>
              {g.amt && <div className="hint" style={{ margin: '0 0 8px' }}>You’ll log it {g.stepLabel} at a time, or type any amount.</div>}
              {g.amt && g.options && (<>
                <div className="chips" role="group" aria-label="Daily amount">{g.options.map((o) => <button key={o} className="chip" aria-pressed={Number(g.count) === o} onClick={() => up({ count: o })}>{o.toLocaleString('en-US')} {g.unit}</button>)}</div>
                <div className="hint">Or type your own daily amount:</div></>)}
              <div className="grid3" style={{ marginTop: 6 }}>
                <input type="number" min="1" inputMode="numeric" value={g.count} aria-label="How many" onChange={(e) => up({ count: e.target.value })} />
                <input type="text" value={g.unit} aria-label="Unit, like times or walks" onChange={(e) => up({ unit: e.target.value })} />
                <select value={g.per} aria-label="How often" onChange={(e) => up({ per: e.target.value as any })}><option value="day">a day</option><option value="week">a week</option></select>
              </div>
            </>) : (<>
              {g.options && g.options.length > 1 && (<>
                <div className="chips" role="group" aria-label="Preset amounts">{g.options.map((o) => <button key={o} className="chip" aria-pressed={Number(g.target) === o} onClick={() => up({ target: o })}>{fmtNum(o, g.unit)}</button>)}</div>
                <div className="hint">Or type your own amount:</div></>)}
              <div className="grid2" style={{ marginTop: 6 }}>
                <select value={UNIT_OPTS.includes(g.unit) ? g.unit : '$'} aria-label="Unit" onChange={(e) => up({ unit: e.target.value, target: e.target.value === 'done' ? 1 : g.target })}>
                  {UNIT_OPTS.map((u) => <option key={u} value={u}>{u === 'done' ? 'one-time' : u}</option>)}
                </select>
                <input type="number" min="0" step="any" inputMode="decimal" value={g.unit === 'done' ? '' : g.target} placeholder="Amount" aria-label="Target amount" disabled={g.unit === 'done'} onChange={(e) => up({ target: e.target.value })} />
              </div>
              {g.weight && <div className="note">Many people aim for about 1–2 lbs a week. For bigger goals, a doctor can help you plan a pace that works for your body.</div>}
            </>)}
          </div>
        </div>
        <div className="field">
          <label className="lbl" htmlFor="w-sure"><span className="letter">A</span>Achievable: how sure are you that you can do this? <span style={{ color: 'var(--plum)' }}>{g.sure}/10</span></label>
          <input type="range" min="1" max="10" id="w-sure" value={g.sure} onChange={(e) => up({ sure: Number(e.target.value) })} />
          {g.sure < 6 && <div className="note">Below a 6? Try a smaller version first. You can always raise it later.</div>}
        </div>
        <div className="field">
          <label className="lbl" htmlFor="w-why"><span className="letter">R</span>Relevant: why does this matter to you?</label>
          <textarea id="w-why" placeholder="e.g. I want more energy for the people I love." value={g.why} onChange={(e) => up({ why: e.target.value })} />
        </div>
        <div className="field">
          <label className="lbl" htmlFor="w-date"><span className="letter">T</span>Time-bound: by when?</label>
          <input type="date" id="w-date" value={g.deadline} min={T} onChange={(e) => up({ deadline: e.target.value || g.deadline })} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}><div className="pill" style={{ marginBottom: 6 }}>Your goal</div><div className="summary">{smartSentence(normalize(g))}</div></div>
      {S.couple && <label className="ck sharebox"><input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} /><span>💞 Share this goal with {first} so you both can track it and add progress</span></label>}
      <p className="hint" style={{ color: '#B3443A' }}>{err}</p>
      <button className="btn primary wide" style={{ marginTop: 6 }} onClick={save}>Save goal</button>
    </>);
  }
  return <div className="sheet" ref={ref} role="dialog" aria-modal="true" aria-label="New goal"><div className="app">{body}</div></div>;
}
