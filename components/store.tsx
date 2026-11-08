'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { db, loadPlus, loadProfile, loadState, Profile } from '@/lib/db';
import { PlusInfo } from '@/lib/plus';
import { Goal, JournalEntry, State, blankState, key, seedState, today, uid } from '@/lib/core';
import { PillarId } from '@/lib/data';

export type Mode = 'loading' | 'auth' | 'guest' | 'user';
export type View = 'today' | 'goals' | 'progress' | 'journal' | 'grateful' | 'portfolio' | 'resources' | 'adventures';

function useStoreValue() {
  const [mode, setModeRaw] = useState<Mode>('loading');
  const modeRef = useRef<Mode>('loading');
  const setMode = (m: Mode) => { modeRef.current = m; setModeRaw(m); };
  const [S, setS] = useState<State>(blankState());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [view, setViewRaw] = useState<View>('today');
  const [wizard, setWizard] = useState<{ pillar?: PillarId; share?: boolean; edit?: Goal } | null>(null);
  // Where to land when a shortcut opens another tab (e.g. "Our map" on Today)
  const [intent, setIntent] = useState<{ adv?: string; who?: string; tool?: string; joint?: boolean } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState({ text: '', n: 0 });
  const [plusInfo, setPlusInfo] = useState<PlusInfo>({ plus: false });
  const [plusOpen, setPlusOpen] = useState<string | null>(null); // why the upgrade sheet opened
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [guestFree, setGuestFree] = useState(false); // ?demo=free previews the app as a free account
  const loadedFor = useRef<string | null>(null);
  const queue = useRef<Promise<any>>(Promise.resolve());

  const toast = useCallback((text: string) => setToastMsg((t) => ({ text, n: t.n + 1 })), []);
  const setView = (v: View) => { setViewRaw(v); if (typeof window !== 'undefined') window.scrollTo(0, 0); };

  const loadUser = useCallback(async () => {
    setLoadError('');
    try {
      let prof = await loadProfile();
      if (!prof) throw new Error('No profile found for this account.');
      if (prof.seed_examples) {
        await db.insertState(seedState());
        await db.updateProfile({ seed_examples: false }, prof.id);
        prof = { ...prof, seed_examples: false };
      }
      const s = await loadState();
      setProfile(prof); setS(s); setMode('user'); setViewRaw('today');
      setPlusInfo(await loadPlus());
      // Back from Stripe checkout: wait for Stripe to confirm, then unlock
      if (typeof window !== 'undefined' && /plus=success/.test(window.location.search)) {
        history.replaceState(null, '', window.location.pathname);
        toast('Thank you! Unlocking Plus…');
        for (let i = 0; i < 12; i++) {
          await new Promise((r) => setTimeout(r, 2500));
          const p = await loadPlus(); setPlusInfo(p);
          if (p.plus) { toast('Welcome to WellWheel Plus!'); break; }
        }
      }
    } catch (e: any) {
      console.error(e);
      setLoadError('We couldn’t load your account. Check your connection and try again.');
      setMode('auth');
    }
  }, []);

  useEffect(() => {
    if (!supabase) { setMode('auth'); return; }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (session?.user) {
        if (loadedFor.current !== session.user.id) {
          loadedFor.current = session.user.id;
          setTimeout(() => loadUser(), 0); // never call Supabase inside this callback directly
        }
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        loadedFor.current = null;
        if (modeRef.current !== 'guest') { setMode('auth'); setS(blankState()); setProfile(null); }
      }
    });
    return () => data.subscription.unsubscribe();
  }, [loadUser]);

  // Save to Supabase one change at a time, in order. Guests don't save.
  const persist = (fn: () => Promise<any>) => {
    if (modeRef.current !== 'user') return;
    queue.current = queue.current.then(fn).catch(async (e) => {
      console.error(e);
      toast('Couldn’t save that. ' + (e?.message ? '(' + String(e.message).slice(0, 80) + ')' : 'Check your connection and try again.'));
      try { setS(await loadState()); } catch {}
    });
  };

  // Notice when a new day (or a new Sunday-to-Saturday week) starts while the app is open or in the background,
  // so daily and weekly goals roll over without having to reload
  const [dayKey, setDayKey] = useState(() => key(new Date()));
  useEffect(() => {
    const check = () => { const k = key(new Date()); setDayKey((cur) => (cur === k ? cur : k)); };
    const t = setInterval(check, 30000);
    document.addEventListener('visibilitychange', check); window.addEventListener('focus', check);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', check); window.removeEventListener('focus', check); };
  }, []);

  // When you come back to the app, pick up your partner's latest changes
  useEffect(() => {
    const onShow = async () => {
      if (document.visibilityState !== 'visible' || modeRef.current !== 'user') return;
      await queue.current;
      try { setS(await loadState()); setPlusInfo(await loadPlus()); } catch {}
    };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);

  const act = {
    addGoal(g: Goal) {
      setS((s) => ({ ...s, goals: [...s.goals, g], logs: { ...s.logs, [g.id]: {} } }));
      persist(() => db.addGoals([g]));
    },
    // Change a goal's details. Check-ins already logged stay as they are.
    updateGoal(g: Goal) {
      setS((s) => ({ ...s, goals: s.goals.map((x) => (x.id === g.id ? g : x)) }));
      persist(() => db.updateGoal(g));
    },
    deleteGoal(id: string) {
      setS((s) => { const logs = { ...s.logs }; delete logs[id]; return { ...s, goals: s.goals.filter((x) => x.id !== id), logs }; });
      persist(() => db.deleteGoal(id));
    },
    log(id: string, delta: number, day = today().T) {
      setS((s) => {
        const cur = (s.logs[id] || {})[day] || 0;
        const by = s.me ? { ...s.by, [id]: { ...(s.by[id] || {}), [s.me]: Math.max(0, ((s.by[id] || {})[s.me] || 0) + delta) } } : s.by;
        return { ...s, by, logs: { ...s.logs, [id]: { ...(s.logs[id] || {}), [day]: Math.max(0, cur + delta) } } };
      });
      persist(() => db.log(id, day, delta));
    },
    shareGoal(id: string, on: boolean) {
      const cid = on ? S.couple?.couple_id || null : null;
      setS((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, coupleId: cid } : g)) }));
      persist(() => db.shareGoal(id, cid));
    },
    saveCouple(key: string, data: any) {
      const cid = S.couple?.couple_id; if (!cid) return;
      setS((s) => ({ ...s, coupleData: { ...s.coupleData, [key]: data } }));
      persist(() => db.saveCouple(cid, key, data));
    },
    async connect(code: string) {
      await queue.current;
      const name = await db.connect(code);
      setS(await loadState()); setPlusInfo(await loadPlus());
      return name;
    },
    async redeemCode(code: string) {
      const r = await db.redeemCode(code);
      setPlusInfo(await loadPlus());
      return r;
    },
    async disconnect() {
      await queue.current;
      await db.disconnect();
      setS(await loadState()); setPlusInfo(await loadPlus());
    },
    addGratitude(text: string, replaceToday: boolean) {
      const { T } = today();
      const item = { id: uid(), date: T, text };
      setS((s) => ({ ...s, gratitude: [...(replaceToday ? s.gratitude.filter((x) => x.date !== T) : s.gratitude), item] }));
      persist(async () => { if (replaceToday) await db.deleteGratitudeOn(T); await db.addGratitude([item]); });
    },
    clearTodayGratitude() {
      const { T } = today();
      setS((s) => ({ ...s, gratitude: s.gratitude.filter((x) => x.date !== T) }));
      persist(() => db.deleteGratitudeOn(T));
    },
    saveJournal(e: JournalEntry) {
      const { T } = today();
      setS((s) => ({ ...s, journal: { ...s.journal, [T]: e } }));
      persist(() => db.saveJournal(T, e));
    },
    saveTool(tool: string, data: any) {
      setS((s) => ({ ...s, tools: { ...s.tools, [tool]: data } }));
      persist(() => db.saveTool(tool, data));
    },
    removeExamples() {
      setS((s) => {
        const goals = s.goals.filter((g) => !g.example);
        const logs = Object.fromEntries(Object.entries(s.logs).filter(([k]) => goals.some((g) => g.id === k)));
        const journal = Object.fromEntries(Object.entries(s.journal).filter(([, v]) => !v.example));
        return { ...s, goals, logs, gratitude: s.gratitude.filter((x) => !x.example), journal, tools: advNoExamples(s.tools) };
      });
      persist(() => db.removeExamples());
      if (S.tools.adv) persist(() => db.saveTool('adv', advNoExamples(S.tools).adv));
    },
    addExamples() {
      const ex = seedState();
      setS((s) => ({
        ...s,
        goals: [...s.goals, ...ex.goals], logs: { ...s.logs, ...ex.logs },
        gratitude: [...s.gratitude, ...ex.gratitude], journal: { ...ex.journal, ...s.journal },
        tools: s.tools.adv ? s.tools : { ...s.tools, adv: ex.tools.adv },
      }));
      persist(() => db.insertState(ex));
    },
    async rename(name: string) {
      if (!profile) return;
      setProfile({ ...profile, display_name: name });
      persist(() => db.updateProfile({ display_name: name }, profile.id));
    },
    startGuest() {
      const s = seedState();
      // Preview the couple features with an example partner: open the app with ?demo=couple
      if (typeof window !== 'undefined' && /demo=couple/.test(window.location.search)) {
        s.me = 'me';
        s.couple = { couple_id: 'demo', partner_id: 'partner', partner_name: 'Stephanie', partner_username: 'stephanie', since: new Date().toISOString() };
        const g = s.goals.find((x) => x.pillar === 'financial');
        if (g) { g.coupleId = 'demo'; g.ownerId = 'me'; s.by[g.id] = { me: 400, partner: 250 }; }
        s.partnerPlaces = { 'W:840': { status: 'been' }, 'W:380': { status: 'been', note: 'Our honeymoon someday!' }, 'S:48': { status: 'been' }, 'S:15': { status: 'want' } };
        s.coupleData = { bucket: { list: [{ text: 'Take a dance class together', cat: 'Just for fun', year: '', done: false, photos: [] }, { text: 'Stay in a cabin in the mountains', cat: 'Travel', year: '2027', done: false, photos: [] }] }, couples: { entries: [] } };
      }
      setGuestFree(typeof window !== 'undefined' && /demo=free/.test(window.location.search));
      setMode('guest'); setS(s); setProfile(null); setViewRaw('today');
    },
    async logout() {
      setProfileOpen(false);
      if (modeRef.current === 'guest') { setMode('auth'); setS(blankState()); return; }
      await queue.current;
      await supabase?.auth.signOut();
      setMode('auth'); setS(blankState()); setProfile(null);
    },
    async deleteAccount() {
      const { data } = await supabase!.auth.getSession();
      const res = await fetch('/api/delete-account', { method: 'POST', headers: { Authorization: 'Bearer ' + data.session?.access_token } });
      if (!res.ok) { toast('We couldn’t delete the account. Try again.'); return; }
      await supabase!.auth.signOut();
      setProfileOpen(false); setMode('auth'); setS(blankState()); setProfile(null);
      toast('Your account and data were deleted.');
    },
  };

  return {
    // Guests ("Look around") can preview everything; accounts follow their Plus status
    feedbackOpen, setFeedbackOpen,
    isPlus: mode === 'guest' ? !guestFree : plusInfo.plus, plusInfo, plusOpen, setPlusOpen,
    intent, setIntent, mode, S, profile, recovery, setRecovery, loadError, view, setView, wizard, setWizard,
    profileOpen, setProfileOpen, authOpen, setAuthOpen, toastMsg, toast, act, loadUser, dayKey,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useWW = () => useContext(Ctx)!;
// Adventures data with the example places, dreams, and hobbies taken out
function advNoExamples(tools: Record<string, any>) {
  const a = tools.adv; if (!a) return tools;
  const places = Object.fromEntries(Object.entries(a.places || {}).filter(([, v]: any) => !v.example));
  const bucket = { me: (a.bucket?.me || []).filter((x: any) => !x.example), us: (a.bucket?.us || []).filter((x: any) => !x.example) };
  return { ...tools, adv: { ...a, places, bucket, hobbies: (a.hobbies || []).filter((x: any) => !x.example) } };
}
export const firstName = (p: Profile | null) => (p && p.display_name ? p.display_name.trim().split(/\s+/)[0] : '');
