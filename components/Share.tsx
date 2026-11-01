'use client';
import { useEffect, useState } from 'react';
import { loadReferrals } from '@/lib/db';
import { useWW } from './store';

// "Love WellWheel? Share with a friend" card with the person's invite link
export function ShareCard() {
  const { profile, mode, toast, setAuthOpen } = useWW();
  const [stats, setStats] = useState({ joined: 0, rewarded: 0 });
  useEffect(() => { if (mode === 'user') loadReferrals().then(setStats).catch(() => {}); }, [mode]);
  const link = profile ? `${window.location.origin}/?ref=${profile.username}` : '';
  const text = 'I’ve been using WellWheel to set goals, journal, and keep my whole life in balance. Join me:';
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'WellWheel', text, url: link }); return; } catch { return; } }
    copy();
  };
  const copy = async () => { try { await navigator.clipboard.writeText(link); toast('Invite link copied'); } catch { toast(link); } };
  return (
    <section className="card together" style={{ marginTop: 14 }}>
      <h2>💜 Love WellWheel?</h2><div className="rule" />
      <p style={{ marginTop: 0 }}>Share it with a friend. When they sign up for Plus, <b>your next month is free</b>.</p>
      {profile ? (<>
        <div className="codebox"><b style={{ fontSize: 14, letterSpacing: 0, wordBreak: 'break-all' }}>{link.replace(/^https?:\/\//, '')}</b></div>
        <div className="row" style={{ marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
          <button className="btn primary small" onClick={share}>Share my link</button>
          <button className="btn small" onClick={copy}>Copy link</button>
        </div>
        {stats.joined > 0 && <p className="sub" style={{ margin: '10px 0 0' }}>{stats.joined} friend{stats.joined === 1 ? '' : 's'} joined with your link · {stats.rewarded} free month{stats.rewarded === 1 ? '' : 's'} earned</p>}
        <p className="hint">Your friend needs to create their account from your link. You get one free month for each friend who starts a paid Plus plan.</p>
      </>) : (
        <button className="btn small primary" onClick={() => setAuthOpen('signup')}>Create an account to get your link</button>
      )}
    </section>
  );
}
