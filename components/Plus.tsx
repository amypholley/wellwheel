'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PLUS_LINKS, PLUS_PERKS, PLUS_PRICE } from '@/lib/plus';
import { P, PILLARS, PillarId } from '@/lib/data';
import { fmtDate, key, today } from '@/lib/core';
import { Icon } from './ui';
import { useWW } from './store';
import { loc, t } from '@/lib/i18n';

const REASONS: Record<string, string> = {
  pillars: 'Free accounts can set goals in 2 pillars. Plus opens all 9.',
  custom: 'Writing your own goals is part of Plus.',
  challenge: 'The 30-day challenges are part of Plus.',
  tool: 'This worksheet is part of Plus.',
  portfolio: 'The Financial Wellness Planner and Portfolio are part of Plus.',
  couple: 'Couple connection is part of Plus. The couples plan covers both of you.',
  report: 'The monthly pillar report is part of Plus.',
};

// Send the person to the Stripe payment page with their account attached, so Plus unlocks for the right account
export async function goToCheckout(plan: 'individual' | 'couple') {
  const url = new URL(PLUS_LINKS[plan]);
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } as any };
  if (data?.user) {
    url.searchParams.set('client_reference_id', data.user.id);
    if (data.user.email) url.searchParams.set('prefilled_email', data.user.email);
  }
  window.location.href = url.toString();
}

export function PlusSheet() {
  const { plusOpen, setPlusOpen, mode, setAuthOpen, S } = useWW();
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { document.body.style.overflow = plusOpen ? 'hidden' : ''; }, [plusOpen]);
  if (!plusOpen) return null;
  const close = () => setPlusOpen(null);
  const buy = async (plan: 'individual' | 'couple') => {
    if (mode !== 'user') { close(); setAuthOpen('signup'); return; }
    setBusy(plan); await goToCheckout(plan);
  };
  return (
    <div className="sheet plus-sheet" role="dialog" aria-modal="true" aria-label={t("WellWheel Plus")}>
      <div className="app">
        <header className="top"><div><div className="brand">{t("The Holistic Ecosystem")}</div><h1>{t("WellWheel Plus")}</h1></div><button className="linkish" onClick={close}>{t("Close")}</button></header>
        {REASONS[plusOpen] && <p className="note" style={{ marginTop: 0 }}>{t(REASONS[plusOpen])}</p>}
        <section className="card" style={{ marginTop: 12 }}>
          <h2>{t("Everything in Plus")}</h2><div className="rule" />
          <ul className="checks">{PLUS_PERKS.map((x) => <li key={x}>{t(x)}</li>)}</ul>
        </section>
        <div className="plans">
          <section className="card plan-card">
            <h2>{t("Just me")}</h2><p className="sub" style={{ margin: '4px 0 12px' }}>{t("Plus for your account.")}</p>
            {PLUS_PRICE.individual && <p className="plan-price">{PLUS_PRICE.individual}</p>}
            <button className="btn primary wide" disabled={!!busy} onClick={() => buy('individual')}>{busy === 'individual' ? t('Opening checkout…') : t('Get Plus')}</button>
          </section>
          <section className="card plan-card together">
            <h2>{t("💞 Couples")}</h2><p className="sub" style={{ margin: '4px 0 12px' }}>One payment covers both of you{S.couple ? ` (you and ${S.couple.partner_name.split(' ')[0]})` : ' once you connect accounts'}.</p>
            {PLUS_PRICE.couple && <p className="plan-price">{PLUS_PRICE.couple}</p>}
            <button className="btn primary wide" disabled={!!busy} onClick={() => buy('couple')}>{busy === 'couple' ? t('Opening checkout…') : t('Get the couples plan')}</button>
          </section>
        </div>
        <p className="hint" style={{ textAlign: 'center' }}>{mode === 'user' ? t('You’ll pay securely with Stripe. Plus renews monthly until you cancel, which you can do any time from your profile.') : t('Create a free account first, then upgrade from your profile.')}</p>
        <p className="hint" style={{ textAlign: 'center', marginTop: 0 }}><a href="/terms" target="_blank" rel="noopener">{t("Terms of Service")}</a> · <a href="/privacy" target="_blank" rel="noopener">{t("Privacy Policy")}</a></p>
      </div>
    </div>
  );
}

// Small "Plus" lock card used where a free account reaches a Plus feature
export function PlusLock({ reason, title, text }: { reason: string; title: string; text: string }) {
  const { setPlusOpen } = useWW();
  return (
    <section className="card locked">
      <div className="card-head"><h2>{title}</h2><span className="badge">{t("Plus")}</span></div>
      <p style={{ margin: '0 0 10px', color: 'var(--muted)' }}>{text}</p>
      <button className="btn primary" onClick={() => setPlusOpen(reason)}>{t("See WellWheel Plus")}</button>
    </section>
  );
}

/* ---------- Monthly pillar report (Plus) ---------- */
export function PillarReport() {
  const { S, setWizard } = useWW();
  const { TODAY, T } = today();
  const ym = T.slice(0, 7);
  const daysSoFar = TODAY.getDate();
  const monthName = TODAY.toLocaleDateString(loc(), { month: 'long' });
  const rows = PILLARS.map((p) => {
    const gs = S.goals.filter((g) => g.pillar === p.id);
    const days = new Set<string>();
    let logs = 0;
    gs.forEach((g) => Object.entries(S.logs[g.id] || {}).forEach(([d, v]) => { if (d.startsWith(ym) && v > 0) { days.add(d); logs++; } }));
    const journal = Object.entries(S.journal).filter(([d, j]) => d.startsWith(ym) && j.pillar === p.id && j.text).length;
    return { p, goals: gs.length, days: days.size, journal };
  });
  const active = rows.filter((r) => r.days > 0).sort((a, b) => b.days - a.days);
  const quiet = rows.filter((r) => r.goals > 0 && r.days === 0);
  const empty = rows.filter((r) => r.goals === 0);
  const focus: { p: typeof PILLARS[number]; why: string } | null =
    quiet[0] ? { p: quiet[0].p, why: t(quiet[0].goals === 1 ? 'You have a goal here but haven’t checked in yet this month.' : 'You have goals here but haven’t checked in yet this month.') }
    : active.length && active[active.length - 1].days < daysSoFar / 3 ? { p: active[active.length - 1].p, why: t('It got the least of your energy this month.') }
    : empty[0] ? { p: empty[0].p, why: t('You don’t have a goal here yet. One small goal is a good start.') } : null;
  const grat = S.gratitude.filter((g) => g.date.startsWith(ym)).length;
  const jr = Object.keys(S.journal).filter((d) => d.startsWith(ym) && S.journal[d].text).length;
  return (
    <section className="card">
      <div className="card-head"><h2>{monthName} pillar report</h2><span className="badge">{t("Plus")}</span></div>
      <p className="sub" style={{ marginTop: 0 }}>Days you checked in on each pillar, out of {daysSoFar} day{daysSoFar === 1 ? '' : 's'} so far this month.</p>
      <div className="hbars">
        {rows.map((r) => (
          <div className="hb" key={r.p.id} title={`${r.p.name}: ${r.days} day${r.days === 1 ? '' : 's'}`}>
            <span className="hb-l" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: r.p.color, display: 'flex' }}><Icon id={r.p.id as PillarId} size={14} /></span>{r.p.name}</span>
            <span className="hb-t"><span style={{ width: `${Math.max(r.days ? 3 : 0, Math.min(100, (r.days / daysSoFar) * 100))}%`, background: r.p.color }} /></span>
            <span className="hb-v">{r.goals ? t(r.days === 1 ? '{n} day' : '{n} days', { n: r.days }) : <span className="sub">{t("no goal")}</span>}</span>
          </div>
        ))}
      </div>
      <div className="facts" style={{ marginTop: 14 }}>
        <div><b>{active.length ? active[0].p.name : '—'}</b><span>{t("got the most energy")}</span></div>
        <div><b>{quiet.length + empty.length}</b><span>pillar{quiet.length + empty.length === 1 ? '' : 's'} left out so far</span></div>
        <div><b>{jr}</b><span>journal entr{jr === 1 ? 'y' : 'ies'}</span></div>
        <div><b>{grat}</b><span>gratitude line{grat === 1 ? '' : 's'}</span></div>
      </div>
      {focus && (
        <div className="said" style={{ marginTop: 14 }}><span>{t("Suggested focus for next month")}</span>
          <p><b style={{ color: focus.p.color }}>{focus.p.name}.</b> {focus.why}</p>
          <button className="btn small" style={{ marginTop: 8 }} onClick={() => setWizard({ pillar: focus.p.id as PillarId })}>Set a {focus.p.name.toLowerCase()} goal</button>
        </div>
      )}
    </section>
  );
}

/* ---------- Plus section in Profile ---------- */
export function PlusStatus() {
  const { plusInfo, setPlusOpen, toast, act } = useWW();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const p = plusInfo;
  const manage = async () => {
    setBusy(true);
    try {
      const { data } = await supabase!.auth.getSession();
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { Authorization: 'Bearer ' + data.session?.access_token } });
      const body = await res.json().catch(() => ({}));
      if (body.url) { window.location.href = body.url; return; }
      toast(body.error || t('That page isn’t available right now.'));
    } catch { toast(t("Check your connection and try again.")); }
    setBusy(false);
  };
  const until = p.until ? fmtDate(key(new Date(p.until)), { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  return (
    <section className="card" style={{ marginTop: 14 }}>
      <div className="card-head"><h2>{t("WellWheel Plus")}</h2>{p.plus && <span className="badge">{t("Plus")}</span>}</div>
      {p.plus ? (<>
        <p style={{ marginTop: 0 }}>{p.status === 'comp' ? (p.until ? t('You have free Plus.') : t('You have Plus.')) : p.source === 'partner' ? t('Included with {name}’s couples plan.', { name: p.paid_by || t('your partner') }) : t(p.plan === 'couple' ? 'You’re on the couples plan, which covers your partner too.' : 'You’re on the individual plan.')}</p>
        {until && <p className="sub" style={{ marginTop: 0 }}>{p.status === 'comp' ? t('Free until {d}.', { d: until }) : p.status === 'canceled' ? t('Ends {d}.', { d: until }) : t('Renews {d}.', { d: until })}</p>}
        {p.status === 'past_due' && <p className="note">{t("Your last payment didn’t go through. Update your card to keep Plus.")}</p>}
        {p.can_manage && <button className="btn" disabled={busy} onClick={manage}>{busy ? 'Opening…' : t('Manage subscription')}</button>}
      </>) : (<>
        <p style={{ marginTop: 0, color: 'var(--muted)' }}>{t("All 9 pillars, custom goals, the monthly pillar report, every challenge, all worksheets, and couple connection.")}</p>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <button className="btn primary" onClick={() => setPlusOpen('profile')}>{t("See WellWheel Plus")}</button>
          {p.can_manage && <button className="btn" disabled={busy} onClick={manage}>{busy ? 'Opening…' : t('Billing & receipts')}</button>}
        </div>
        <form className="row" style={{ marginTop: 14 }} onSubmit={async (e) => {
          e.preventDefault(); if (!code.trim()) return; setBusy(true); setCodeErr('');
          try { await act.redeemCode(code.trim()); setCode(''); toast(t("Code applied. Welcome to WellWheel Plus!")); }
          catch (err: any) { setCodeErr(/function|schema/i.test(err?.message || '') ? t('Codes aren’t set up yet.') : err?.message || t('That code didn’t work.')); }
          setBusy(false);
        }}>
          <input type="text" placeholder={t("Have a code?")} aria-label={t("Plus code")} autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn" type="submit" disabled={busy}>{t("Apply")}</button>
        </form>
        {codeErr && <p className="autherr" role="alert" style={{ marginTop: 8 }}>{codeErr}</p>}
      </>)}
    </section>
  );
}
