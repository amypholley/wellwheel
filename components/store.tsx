'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { db, loadProfile, loadState, Profile } from '@/lib/db';
import { Goal, JournalEntry, State, blankState, seedState, today, uid } from '@/lib/core';
import { PillarId } from '@/lib/data';

export type Mode = 'loading' | 'auth' | 'guest' | 'user';
export type View = 'today' | 'goals' | 'progress' | 'journal' | 'grateful' | 'resources' | 'adventures';

function useStoreValue() {
  const [mode, setModeRaw] = useState<Mode>('loading');
  const modeRef = useRef<Mode>('loading');
  const setMode = (m: Mode) => { modeRef.current = m; setModeRaw(m); };
  const [S, setS] = useState<State>(blankState());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [view, setViewRaw] = useState<View>('today');
  const [wizard, setWizard] = useState<{ pillar?: PillarId } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState({ text: '', n: 0 });
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

  const act = {
    addGoal(g: Goal) {
      setS((s) => ({ ...s, goals: [...s.goals, g], logs: { ...s.logs, [g.id]: {} } }));
      persist(() => db.addGoals([g]));
    },
    deleteGoal(id: string) {
      setS((s) => { const logs = { ...s.logs }; delete logs[id]; return { ...s, goals: s.goals.filter((x) => x.id !== id), logs }; });
      persist(() => db.deleteGoal(id));
    },
    log(id: string, delta: number, day = today().T) {
      setS((s) => {
        const cur = (s.logs[id] || {})[day] || 0;
        return { ...s, logs: { ...s.logs, [id]: { ...(s.logs[id] || {}), [day]: Math.max(0, cur + delta) } } };
      });
      persist(() => db.log(id, day, delta));
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
        return { ...s, goals, logs, gratitude: s.gratitude.filter((x) => !x.example), journal };
      });
      persist(() => db.removeExamples());
    },
    addExamples() {
      const ex = seedState();
      setS((s) => ({
        ...s,
        goals: [...s.goals, ...ex.goals], logs: { ...s.logs, ...ex.logs },
        gratitude: [...s.gratitude, ...ex.gratitude], journal: { ...ex.journal, ...s.journal },
      }));
      persist(() => db.insertState(ex));
    },
    async rename(name: string) {
      if (!profile) return;
      setProfile({ ...profile, display_name: name });
      persist(() => db.updateProfile({ display_name: name }, profile.id));
    },
    startGuest() { setMode('guest'); setS(seedState()); setProfile(null); setViewRaw('today'); },
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
    mode, S, profile, recovery, setRecovery, loadError, view, setView, wizard, setWizard,
    profileOpen, setProfileOpen, authOpen, setAuthOpen, toastMsg, toast, act, loadUser,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useWW = () => useContext(Ctx)!;
export const firstName = (p: Profile | null) => (p && p.display_name ? p.display_name.trim().split(/\s+/)[0] : '');
