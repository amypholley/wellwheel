'use client';
import { useEffect, useState } from 'react';
import { StoreProvider, useWW, View } from './store';
import { Today, Goals, Progress, Journal, Gratitude , Pillars } from './screens';
import { Wizard } from './Wizard';
import { Resources } from './resources/Resources';
import { Adventures } from './adventures/Adventures';
import { Auth } from './Auth';
import { Profile } from './Profile';
import { LogoWheel } from './ui';
import { PlusSheet } from './Plus';
import { FeedbackSheet } from './Feedback';

const TABS: [View, string, string][] = [
  ['today', 'Today', '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>'],
  ['pillars', 'My pillars', '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="4.5" r="1.8"/><circle cx="12" cy="19.5" r="1.8"/><circle cx="4.5" cy="12" r="1.8"/><circle cx="19.5" cy="12" r="1.8"/><circle cx="6.7" cy="6.7" r="1.5"/><circle cx="17.3" cy="17.3" r="1.5"/><circle cx="17.3" cy="6.7" r="1.5"/><circle cx="6.7" cy="17.3" r="1.5"/>'],
  ['goals', 'Goals', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'],
  ['progress', 'Progress', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
  ['journal', 'Journal', '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11M9 8h6M9 11h4"/>'],
  ['grateful', 'Gratitude', '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'],
  ['portfolio', 'Portfolio', '<ellipse cx="9" cy="7" rx="4.5" ry="2"/><path d="M4.5 7v4c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V7"/><ellipse cx="15" cy="14" rx="4.5" ry="2"/><path d="M10.5 14v4c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-4"/>'],
  ['resources', 'Resources', '<path d="M4 19V5a1 1 0 0 1 1-1h4v16H5a1 1 0 0 1-1-1zM9 4h4v16H9zM14 5.5l3.8-1 3.7 14.5-3.8 1z"/>'],
  ['adventures', 'Adventures', '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'],
];

function Toast() {
  const { toastMsg } = useWW();
  const [show, setShow] = useState(false);
  useEffect(() => { if (!toastMsg.n) return; setShow(true); const t = setTimeout(() => setShow(false), 1800); return () => clearTimeout(t); }, [toastMsg.n]);
  return <div className={`toast ${show ? 'show' : ''}`} role="status">{toastMsg.text}</div>;
}

const tabIcon = (d: string, size = 21) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
);

// Phones: a top bar with a Menu button that slides open a list of every page (the bottom tabs are hidden on phones)
function MobileMenu() {
  const { view, setView, setProfileOpen, setFeedbackOpen } = useWW();
  const [open, setOpen] = useState(false);
  const current = TABS.find(([id]) => id === view);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    (document.querySelector('.mdrawer button[aria-current="page"]') as HTMLElement | null)?.focus();
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [open]);
  const go = (fn: () => void) => { setOpen(false); fn(); };
  return (
    <>
      <div className="mtop">
        <button className="mbtn" aria-label="Open menu" aria-expanded={open} aria-controls="mdrawer" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <span>Menu</span>
        </button>
        <span className="mtitle">{current ? current[1] : 'WellWheel'}</span>
      </div>
      {open && <div className="mscrim" onClick={() => setOpen(false)} />}
      <nav id="mdrawer" className={`mdrawer ${open ? 'open' : ''}`} aria-label="Main" aria-hidden={!open}>
        <div className="mdrawer-head">
          <div><div className="brand">The Holistic Ecosystem</div><b className="mdrawer-name">WellWheel</b></div>
          <button className="x" aria-label="Close menu" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>×</button>
        </div>
        {TABS.map(([id, label, d]) => (
          <button key={id} tabIndex={open ? 0 : -1} aria-current={view === id ? 'page' : undefined} onClick={() => go(() => setView(id))}>
            {tabIcon(d)}<span>{label}</span>
          </button>
        ))}
        <div className="mdrawer-sep" />
        <button tabIndex={open ? 0 : -1} onClick={() => go(() => setProfileOpen(true))}>
          {tabIcon('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>')}<span>Profile & account</span>
        </button>
        <button tabIndex={open ? 0 : -1} onClick={() => go(() => setFeedbackOpen(true))}>
          {tabIcon('<path d="M4 5h16v11H8l-4 4z"/>')}<span>Send feedback</span>
        </button>
      </nav>
    </>
  );
}

function Shell() {
  const { mode, view, setView, isPlus, dayKey } = useWW();
  if (mode === 'loading') return <div className="loading"><LogoWheel size={64} /></div>;
  const screen = view === 'today' ? <Today /> : view === 'pillars' ? <Pillars /> : view === 'goals' ? <Goals /> : view === 'progress' ? <Progress />
    : view === 'journal' ? <Journal /> : view === 'grateful' ? <Gratitude /> : view === 'portfolio' ? <Resources key={'portfolio' + isPlus} portfolio /> : view === 'resources' ? <Resources key={'resources' + isPlus} /> : <Adventures />;
  return (
    <>
      {mode !== 'auth' && (<>
        <MobileMenu />
        <div className="app" key={dayKey}>{screen}</div>
        <nav className="tabs" aria-label="Main"><div className="in">
          {TABS.map(([id, label, d]) => (
            <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />{label}
            </button>))}
        </div></nav>
      </>)}
      <Wizard /><Profile /><PlusSheet /><FeedbackSheet /><Auth /><Toast />
    </>
  );
}

export default function App() {
  // Invite links (?ref=username): remember who invited this person until they sign up
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && /^[a-zA-Z0-9_]{3,20}$/.test(ref)) { try { localStorage.setItem('ww-ref', ref.toLowerCase()); } catch {} }
  }, []);
  useEffect(() => { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {}); }, []);
  // Phones keep the app asleep in the background and wake the old version. When you come back,
  // check whether a newer version is live and, if so, reload once to pick it up.
  useEffect(() => {
    const mine = process.env.NEXT_PUBLIC_BUILD || '';
    if (!mine) return;
    const check = async () => {
      if (document.visibilityState !== 'visible') return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return; // never interrupt typing
      try {
        const r = await fetch('/api/version', { cache: 'no-store' });
        const { v } = await r.json();
        if (!v || v === mine) return;
        const last = Number(sessionStorage.getItem('ww-reloaded') || 0);
        if (Date.now() - last < 60000) return; // reload at most once a minute
        sessionStorage.setItem('ww-reloaded', String(Date.now()));
        location.reload();
      } catch {}
    };
    document.addEventListener('visibilitychange', check);
    window.addEventListener('pageshow', check);
    const t = setInterval(check, 10 * 60 * 1000);
    return () => { document.removeEventListener('visibilitychange', check); window.removeEventListener('pageshow', check); clearInterval(t); };
  }, []);
  return <StoreProvider><Shell /></StoreProvider>;
}
