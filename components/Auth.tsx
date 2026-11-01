'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogoWheel } from './ui';
import { useWW } from './store';

// Password rules: 8+ characters, a lowercase letter, a capital letter, a number, and a symbol
const PW_RULES: [string, (p: string) => boolean][] = [
  ['8+ characters', (p) => p.length >= 8],
  ['a lowercase letter', (p) => /[a-z]/.test(p)],
  ['a capital letter', (p) => /[A-Z]/.test(p)],
  ['a number', (p) => /[0-9]/.test(p)],
  ['a symbol, like ! ? # $', (p) => /[^A-Za-z0-9]/.test(p)],
];
const pwProblem = (p: string) => { const miss = PW_RULES.filter(([, ok]) => !ok(p)).map(([l]) => l.replace(/,.*$/, '')); return miss.length ? 'Your password needs ' + (miss.length > 1 ? miss.slice(0, -1).join(', ') + ' and ' + miss[miss.length - 1] : miss[0]) + '.' : ''; };
function PwChecklist({ pw }: { pw: string }) {
  return (
    <ul className="pwrules" aria-label="Password requirements">
      {PW_RULES.map(([l, ok]) => <li key={l} className={ok(pw) ? 'ok' : ''}>{ok(pw) ? '✓' : '○'} {l}</li>)}
    </ul>
  );
}

type AuthMode = 'welcome' | 'signup' | 'login' | 'forgot' | 'checkemail' | 'newpw';

export function Auth() {
  const { mode, act, authOpen, setAuthOpen, recovery, setRecovery, loadError, toast } = useWW();
  const [am, setAm] = useState<AuthMode>('welcome');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: '', user: '', email: '', pw: '', pw2: '', ex: false, id: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  useEffect(() => { if (authOpen) { setAm(authOpen as AuthMode); setErr(''); setOk(''); } }, [authOpen]);
  useEffect(() => { if (recovery) { setAm('newpw'); setErr(''); } }, [recovery]);
  useEffect(() => { if (loadError) setErr(loadError); }, [loadError]);

  const open = recovery || mode === 'auth' || !!authOpen;
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);
  if (mode === 'loading' || !open) return null;
  const go = (m: AuthMode) => { setAm(m); setErr(''); setOk(''); };
  const notReady = 'This copy of the app isn’t connected to Supabase yet. You can still look around.';

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    const name = f.name.trim(), user = f.user.trim().toLowerCase(), email = f.email.trim().toLowerCase();
    const msg = !name ? 'Add your name.'
      : !/^[a-z0-9_]{3,20}$/.test(user) ? 'Usernames are 3–20 letters, numbers, or underscores.'
      : !/^\S+@\S+\.\S+$/.test(email) ? 'Add a valid email. It’s used to reset your password.'
      : pwProblem(f.pw) ? pwProblem(f.pw)
      : f.pw !== f.pw2 ? 'The passwords don’t match.' : '';
    if (msg) return setErr(msg);
    if (!supabase) return setErr(notReady);
    setBusy(true); setErr('');
    try {
      const { data: avail, error: aerr } = await supabase.rpc('username_available', { u: user });
      if (aerr) throw aerr;
      if (avail === false) { setErr('That username is taken. Try another.'); return; }
      const { data, error } = await supabase.auth.signUp({
        email, password: f.pw,
        options: { data: { username: user, display_name: name, seed_examples: f.ex }, emailRedirectTo: window.location.origin },
      });
      if (error) {
        if (/already registered|already exists/i.test(error.message)) setErr('An account with that email already exists. Try logging in.');
        else if (/password/i.test(error.message)) setErr('Your password needs 8+ characters, a lowercase letter, a capital letter, a number, and a symbol.');
        else setErr('We couldn’t create the account. ' + error.message);
        return;
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) { setErr('An account with that email already exists. Try logging in.'); return; }
      if (data.session) { setAuthOpen(null); toast(`Welcome, ${name.split(' ')[0]}!`); }
      else go('checkemail');
    } catch (e: any) { setErr('Something went wrong. Check your connection and try again.'); console.error(e); }
    finally { setBusy(false); }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const id = f.id.trim();
    if (!id || !f.pw) return setErr('Enter your username (or email) and password.');
    if (!supabase) return setErr(notReady);
    setBusy(true); setErr('');
    try {
      if (id.includes('@')) {
        const { error } = await supabase.auth.signInWithPassword({ email: id.toLowerCase(), password: f.pw });
        if (error) { setErr(error.code === 'email_not_confirmed' ? 'Please confirm your email first. Check your inbox for the link we sent.' : 'That email and password don’t match.'); return; }
      } else {
        const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: id, password: f.pw }) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) { setErr(body.error || 'That username and password don’t match.'); return; }
        const { error } = await supabase.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
        if (error) throw error;
      }
      setF({ ...f, pw: '' }); setAuthOpen(null); toast('Welcome back!');
    } catch (e: any) { setErr('Something went wrong. Check your connection and try again.'); console.error(e); }
    finally { setBusy(false); }
  }

  async function forgot(e: React.FormEvent) {
    e.preventDefault();
    if (!f.id.trim()) return setErr('Enter your username or email.');
    setBusy(true); setErr('');
    const res = await fetch('/api/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: f.id.trim() }) }).catch(() => null);
    setBusy(false);
    if (!res || !res.ok) return setErr(res ? notReady : 'Check your connection and try again.');
    setOk('If that account exists, we’ve emailed a link to reset your password. It can take a minute or two. Check your spam folder too.');
  }

  async function newPw(e: React.FormEvent) {
    e.preventDefault();
    if (pwProblem(f.pw)) return setErr(pwProblem(f.pw));
    if (f.pw !== f.pw2) return setErr('The passwords don’t match.');
    setBusy(true);
    const { error } = await supabase!.auth.updateUser({ password: f.pw });
    setBusy(false);
    if (error) return setErr('We couldn’t change your password. The link may have expired. Ask for a new one.');
    setRecovery(false); setAuthOpen(null); setF({ ...f, pw: '', pw2: '' }); toast('Password updated');
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
  }

  const E = err ? <p className="autherr" role="alert">{err}</p> : null;
  const backBtn = (to: AuthMode = 'welcome') => (
    <button className="linkish" onClick={() => (mode !== 'auth' && to === 'welcome' ? setAuthOpen(null) : go(to))}>← Back</button>
  );
  let body: React.ReactNode;
  if (am === 'welcome') body = (<>
    <div className="authlogo"><LogoWheel /></div>
    <div className="brand" style={{ textAlign: 'center' }}>The Holistic Ecosystem</div>
    <h1 style={{ textAlign: 'center', fontSize: 32 }}>WellWheel</h1>
    <p className="sub" style={{ textAlign: 'center', margin: '4px 0 22px' }}>Goals, journaling, and tools for every part of your life: one self, one world.</p>
    {E}
    <button className="btn primary wide" onClick={() => go('signup')}>Create an account</button>
    <button className="btn wide" style={{ marginTop: 10 }} onClick={() => go('login')}>I have an account</button>
    <button className="linkish" style={{ margin: '16px auto 0', display: 'block' }} onClick={() => { setAuthOpen(null); act.startGuest(); }}>Look around first</button>
  </>);
  else if (am === 'signup') body = (<>
    {backBtn()}<h1 style={{ marginTop: 10 }}>Create your account</h1>
    <p className="sub" style={{ margin: '4px 0 14px' }}>Your goals, journal, and plans stay private to you.</p>
    <form className="stack" style={{ gap: 10 }} onSubmit={signup}>
      <label className="lbl" htmlFor="su-name" style={{ margin: 0 }}>Your name</label><input type="text" id="su-name" autoComplete="name" placeholder="e.g. Jamie" value={f.name} onChange={set('name')} />
      <label className="lbl" htmlFor="su-user" style={{ margin: 0 }}>Username</label><input type="text" id="su-user" autoComplete="username" autoCapitalize="none" placeholder="letters, numbers, or _" value={f.user} onChange={set('user')} />
      <label className="lbl" htmlFor="su-email" style={{ margin: 0 }}>Email</label><input type="email" id="su-email" autoComplete="email" autoCapitalize="none" placeholder="For password resets" value={f.email} onChange={set('email')} />
      <label className="lbl" htmlFor="su-pw" style={{ margin: 0 }}>Password</label><input type="password" id="su-pw" autoComplete="new-password" placeholder="8+ characters, Aa, 1, and a symbol" value={f.pw} onChange={set('pw')} />
      <PwChecklist pw={f.pw} />
      <label className="lbl" htmlFor="su-pw2" style={{ margin: 0 }}>Confirm password</label><input type="password" id="su-pw2" autoComplete="new-password" value={f.pw2} onChange={set('pw2')} />
      <label className="ck"><input type="checkbox" checked={f.ex} onChange={set('ex')} /><span>Start with example goals so I can see how it works</span></label>
      {E}
      <button className="btn primary wide" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
    </form>
    <p className="hint" style={{ textAlign: 'center' }}>Already have one? <button className="linkish" onClick={() => go('login')}>Log in</button></p>
  </>);
  else if (am === 'login') body = (<>
    {backBtn()}<h1 style={{ marginTop: 10 }}>Welcome back</h1>
    <p className="sub" style={{ margin: '4px 0 14px' }}>Log in to pick up where you left off.</p>
    <form className="stack" style={{ gap: 10 }} onSubmit={login}>
      <label className="lbl" htmlFor="li-user" style={{ margin: 0 }}>Username or email</label><input type="text" id="li-user" autoComplete="username" autoCapitalize="none" value={f.id} onChange={set('id')} />
      <label className="lbl" htmlFor="li-pw" style={{ margin: 0 }}>Password</label><input type="password" id="li-pw" autoComplete="current-password" value={f.pw} onChange={set('pw')} />
      {E}
      <button className="btn primary wide" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
    </form>
    <p className="hint" style={{ textAlign: 'center' }}><button className="linkish" onClick={() => go('forgot')}>Forgot your password?</button></p>
    <p className="hint" style={{ textAlign: 'center' }}>New here? <button className="linkish" onClick={() => go('signup')}>Create an account</button></p>
  </>);
  else if (am === 'forgot') body = (<>
    {backBtn('login')}<h1 style={{ marginTop: 10 }}>Reset your password</h1>
    <p className="sub" style={{ margin: '4px 0 14px' }}>Enter your username or email and we’ll email you a link.</p>
    <form className="stack" style={{ gap: 10 }} onSubmit={forgot}>
      <input type="text" aria-label="Username or email" autoCapitalize="none" placeholder="Username or email" value={f.id} onChange={set('id')} />
      {E}{ok && <p className="authok" role="status">{ok}</p>}
      <button className="btn primary wide" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>
  </>);
  else if (am === 'checkemail') body = (<>
    <div className="authlogo"><LogoWheel size={64} /></div>
    <h1 style={{ textAlign: 'center' }}>Check your email</h1>
    <p style={{ textAlign: 'center' }}>We sent a link to <b>{f.email}</b>. Tap it to confirm your account, and you’ll be signed in.</p>
    <p className="hint" style={{ textAlign: 'center' }}>Don’t see it? Check your spam folder.</p>
    <button className="btn wide" style={{ marginTop: 10 }} onClick={() => go('login')}>Go to log in</button>
  </>);
  else body = (<>
    <h1>Choose a new password</h1>
    <form className="stack" style={{ gap: 10, marginTop: 12 }} onSubmit={newPw}>
      <label className="lbl" htmlFor="np-1" style={{ margin: 0 }}>New password</label><input type="password" id="np-1" autoComplete="new-password" placeholder="8+ characters, Aa, 1, and a symbol" value={f.pw} onChange={set('pw')} />
      <PwChecklist pw={f.pw} />
      <label className="lbl" htmlFor="np-2" style={{ margin: 0 }}>Confirm new password</label><input type="password" id="np-2" autoComplete="new-password" value={f.pw2} onChange={set('pw2')} />
      {E}
      <button className="btn primary wide" type="submit" disabled={busy}>Save new password</button>
    </form>
  </>);

  return (
    <div className="authwrap" role="dialog" aria-modal="true" aria-label="Account">
      <div className="authcard">{body}
        {!supabase && <p className="protonote">Preview copy: not connected to Supabase yet, so only “Look around first” works.</p>}
      </div>
    </div>
  );
}
