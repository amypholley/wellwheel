'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWW } from './store';
import { t } from '@/lib/i18n';

const KINDS: [string, string][] = [['bug', 'Something’s not working'], ['idea', 'An idea or request'], ['love', 'Something I love'], ['other', 'Something else']];

// "Send feedback" form. Saves to the private feedback table in Supabase (Table Editor -> feedback).
export function FeedbackSheet() {
  const { feedbackOpen, setFeedbackOpen, profile, view, mode, toast } = useWW();
  const [kind, setKind] = useState('');
  const [msg, setMsg] = useState('');
  const [contact, setContact] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (feedbackOpen) { setErr(''); document.body.style.overflow = 'hidden'; } else document.body.style.overflow = ''; }, [feedbackOpen]);
  if (!feedbackOpen) return null;
  const close = () => setFeedbackOpen(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kind) return setErr(t("Pick what kind of feedback this is."));
    if (!msg.trim()) return setErr(t("Write a little about it first."));
    if (!supabase) return setErr(t("Feedback isn’t connected in this preview copy."));
    setBusy(true); setErr('');
    let email: string | null = null;
    if (contact && mode === 'user') { const { data } = await supabase.auth.getUser(); email = data.user?.email || null; }
    const { error } = await supabase.from('feedback').insert({
      kind, message: msg.trim().slice(0, 4000), contact_ok: contact && !!email, email,
      username: profile?.username || null, screen: view, device: navigator.userAgent.slice(0, 400),
    });
    setBusy(false);
    if (error) return setErr(t("We couldn’t send that. Check your connection and try again."));
    setKind(''); setMsg(''); setContact(false); close(); toast(t("Thank you! Your feedback was sent."));
  };
  return (
    <div className="sheet" style={{ zIndex: 39 }} role="dialog" aria-modal="true" aria-label={t("Send feedback")}>
      <div className="app">
        <header className="top"><div><div className="brand">{t("WellWheel")}</div><h1>{t("Send feedback")}</h1><div className="sub">{t("Tell us what’s working, what isn’t, and what you’d love to see.")}</div></div><button className="linkish" onClick={close}>{t("Close")}</button></header>
        <form className="card stack" style={{ gap: 12, marginTop: 6 }} onSubmit={send}>
          <div><span className="lbl">{t("What kind of feedback?")}</span>
            <div className="chips" role="group">{KINDS.map(([k, l]) => <button type="button" key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{t(l)}</button>)}</div></div>
          <div><label className="lbl" htmlFor="fb-msg">{kind === 'bug' ? t('What happened? What were you trying to do?') : t('Tell us more')}</label>
            <textarea id="fb-msg" style={{ minHeight: 140 }} maxLength={4000} value={msg} onChange={(e) => setMsg(e.target.value)}
              placeholder={kind === 'bug' ? 'e.g. I tapped Save on my journal and my entry disappeared.' : t('Write as much or as little as you want.')} /></div>
          {mode === 'user' && <label className="ck"><input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} /><span>{t("It’s OK to email me about this")}</span></label>}
          <p className="hint" style={{ margin: 0 }}>{t("We’ll include which screen you were on and your type of device, to help fix problems. Nothing from your journal or goals is sent.")}</p>
          {err && <p className="autherr" role="alert">{err}</p>}
          <button className="btn primary wide" type="submit" disabled={busy}>{busy ? 'Sending…' : t('Send feedback')}</button>
        </form>
      </div>
    </div>
  );
}

export function FeedbackButton({ style }: { style?: React.CSSProperties }) {
  const { setFeedbackOpen } = useWW();
  return <button className="btn small" style={style} onClick={() => setFeedbackOpen(true)}>{t("💬 Send feedback")}</button>;
}
