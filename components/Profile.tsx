'use client';
import { useEffect, useState } from 'react';
import { fmtDate } from '@/lib/core';
import { initials } from './ui';
import { useWW } from './store';

function Couple() {
  const { S, profile, act, toast } = useWW();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [arm, setArm] = useState(false);
  const c = S.couple;
  const first = (c?.partner_name || '').split(' ')[0];
  if (!profile) return null;
  if (c) return (
    <section className="card together" style={{ marginTop: 16 }}>
      <h2>💞 Couple connection</h2><div className="rule" />
      <p style={{ marginTop: 0 }}>You’re connected with <b>{c.partner_name}</b> (@{c.partner_username}).</p>
      <h3 className="h3">What you share</h3>
      <ul className="checks">
        <li>Goals either of you marks “Share with {first}”, with who added what</li>
        <li>The couple’s bucket list</li>
        <li>The “Together” travel map (you each mark your own places, and see both)</li>
        <li>Couples Communication Workbook check-ins</li>
        <li>“Our plan” in the Financial Wellness Planner (your own “My plan” stays private)</li>
      </ul>
      <p className="sub" style={{ margin: '10px 0 0' }}>Your journal, gratitude list, other goals, and other worksheets stay private.</p>
      <button className={`btn small ${arm ? 'primary' : ''}`} style={{ marginTop: 12 }} disabled={busy} onClick={async () => {
        if (!arm) { setArm(true); return; }
        setBusy(true);
        try { await act.disconnect(); toast('Disconnected. You each keep a copy of everything you shared.'); } catch { toast('We couldn’t disconnect. Try again.'); }
        setBusy(false); setArm(false);
      }}>{busy ? 'Disconnecting…' : arm ? `Tap again to disconnect from ${first}` : 'Disconnect'}</button>
      {arm && <p className="hint">You’ll each keep a private copy of your shared goals, bucket list, workbook check-ins, and joint money plan.</p>}
    </section>
  );
  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h2>💞 Couple connection</h2><div className="rule" />
      <p style={{ marginTop: 0 }}>Share your code with your partner, or enter theirs. Then you can share goals (like a savings goal), a travel map, a couple’s bucket list, and a joint money plan, while your journal and everything else stays private.</p>
      <div className="codebox"><span className="sub">Your couple code</span><b>{profile.couple_code}</b>
        <button className="btn small" onClick={async () => { try { await navigator.clipboard.writeText(profile.couple_code); toast('Code copied'); } catch { toast('Code: ' + profile.couple_code); } }}>Copy</button></div>
      <form className="row" style={{ marginTop: 12 }} onSubmit={async (e) => {
        e.preventDefault(); if (!code.trim()) return;
        setBusy(true); setErr('');
        try { const name = await act.connect(code.trim()); setCode(''); toast(`Connected with ${name || 'your partner'}!`); }
        catch (e: any) { setErr(/function|schema|does not exist/i.test(e?.message || '') ? 'Couple connection isn’t set up in the database yet (Phase 4 update).' : (e?.message || 'We couldn’t connect. Try again.')); }
        setBusy(false);
      }}>
        <input type="text" placeholder="Partner’s code, e.g. WW-AB12CD" autoCapitalize="characters" aria-label="Partner’s couple code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Connect'}</button>
      </form>
      {err && <p className="autherr" role="alert" style={{ marginTop: 8 }}>{err}</p>}
    </section>
  );
}

export function Profile() {
  const { profileOpen, setProfileOpen, profile, mode, act, setAuthOpen, toast } = useWW();
  const [delArm, setDelArm] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (profileOpen) { setDelArm(false); setName(profile?.display_name || ''); document.body.style.overflow = 'hidden'; }
    return () => { document.body.style.overflow = ''; };
  }, [profileOpen, profile?.display_name]);
  if (!profileOpen) return null;
  const close = () => setProfileOpen(false);

  let body: React.ReactNode;
  if (mode !== 'user' || !profile) {
    body = (<>
      <h1>You’re exploring as a guest</h1>
      <p className="sub">Create an account to keep your own goals, journal, and plans, and to connect with your partner.</p>
      <button className="btn primary wide" onClick={() => { close(); setAuthOpen('signup'); }}>Create an account</button>
      <button className="btn wide" style={{ marginTop: 10 }} onClick={() => { close(); setAuthOpen('login'); }}>Log in</button>
      <button className="linkish" style={{ margin: '16px auto 0', display: 'block' }} onClick={() => act.logout()}>Leave guest mode</button>
    </>);
  } else {
    body = (<>
      <div className="pfhead"><span className="avatar big">{initials(profile.display_name)}</span>
        <div><h1 style={{ margin: 0 }}>{profile.display_name}</h1><div className="sub">@{profile.username} · member since {fmtDate(profile.created_at.slice(0, 10), { month: 'long', year: 'numeric' })}</div></div></div>
      <Couple />
      <section className="card" style={{ marginTop: 14 }}>
        <h2>Account</h2><div className="rule" />
        <label className="lbl" htmlFor="pf-name">Display name</label>
        <div className="row"><input type="text" id="pf-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={() => { const n = name.trim(); if (!n) return; act.rename(n); toast('Name updated'); }}>Save</button></div>
        <div className="row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => act.logout()}>Log out</button>
          <button className={`btn ${delArm ? 'primary' : 'ghost'}`} disabled={busy} onClick={async () => { if (!delArm) { setDelArm(true); return; } setBusy(true); await act.deleteAccount(); setBusy(false); }}>
            {busy ? 'Deleting…' : delArm ? 'Tap again to delete everything' : 'Delete account'}</button>
        </div>
      </section>
    </>);
  }
  return (
    <div className="sheet profile" role="dialog" aria-modal="true" aria-label="Profile">
      <div className="app"><header className="top"><div><div className="brand">Profile</div></div><button className="linkish" onClick={close}>Close</button></header>{body}</div>
    </div>
  );
}
