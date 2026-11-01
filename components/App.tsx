'use client';
import { useEffect, useState } from 'react';
import { StoreProvider, useWW, View } from './store';
import { Today, Goals, Progress, Journal, Gratitude } from './screens';
import { Wizard } from './Wizard';
import { Resources } from './resources/Resources';
import { Adventures } from './adventures/Adventures';
import { Auth } from './Auth';
import { Profile } from './Profile';
import { LogoWheel } from './ui';

const TABS: [View, string, string][] = [
  ['today', 'Today', '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>'],
  ['goals', 'Goals', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'],
  ['progress', 'Progress', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
  ['journal', 'Journal', '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11M9 8h6M9 11h4"/>'],
  ['grateful', 'Gratitude', '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'],
  ['resources', 'Resources', '<path d="M4 19V5a1 1 0 0 1 1-1h4v16H5a1 1 0 0 1-1-1zM9 4h4v16H9zM14 5.5l3.8-1 3.7 14.5-3.8 1z"/>'],
  ['adventures', 'Adventures', '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'],
];

function Toast() {
  const { toastMsg } = useWW();
  const [show, setShow] = useState(false);
  useEffect(() => { if (!toastMsg.n) return; setShow(true); const t = setTimeout(() => setShow(false), 1800); return () => clearTimeout(t); }, [toastMsg.n]);
  return <div className={`toast ${show ? 'show' : ''}`} role="status">{toastMsg.text}</div>;
}

function Shell() {
  const { mode, view, setView } = useWW();
  if (mode === 'loading') return <div className="loading"><LogoWheel size={64} /></div>;
  const screen = view === 'today' ? <Today /> : view === 'goals' ? <Goals /> : view === 'progress' ? <Progress />
    : view === 'journal' ? <Journal /> : view === 'grateful' ? <Gratitude /> : view === 'resources' ? <Resources /> : <Adventures />;
  return (
    <>
      {mode !== 'auth' && (<>
        <div className="app">{screen}</div>
        <nav className="tabs" aria-label="Main"><div className="in">
          {TABS.map(([id, label, d]) => (
            <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />{label}
            </button>))}
        </div></nav>
      </>)}
      <Wizard /><Profile /><Auth /><Toast />
    </>
  );
}

export default function App() {
  useEffect(() => { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {}); }, []);
  return <StoreProvider><Shell /></StoreProvider>;
}
