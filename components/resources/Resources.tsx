'use client';
import { useEffect, useRef } from 'react';
import { useWW } from '../store';
import { mountResources } from './engine';
import { Goal, today } from '@/lib/core';

// Hosts the worksheets (drawn by engine.js) inside the React app.
export function Resources() {
  const { S, act, toast, setWizard, intent, setIntent, profile } = useWW();
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ S, act, toast });
  latest.current = { S, act, toast };

  useEffect(() => {
    const L = () => latest.current;
    const m = mountResources(ref.current!, {
      tools: L().S.tools,
      intent, couple: L().S.couple, coupleData: L().S.coupleData, myName: (profile?.display_name || 'You').split(' ')[0],
      partnerName: () => L().S.couple?.partner_name || '',
      persistCouple: (key: string, data: any) => L().act.saveCouple(key, data),
      toast: (msg: string) => L().toast(msg),
      persist: (tool: string, data: any) => L().act.saveTool(tool, data),
      addGoal: (g: Goal, initial: number) => { L().act.addGoal(g); if (initial > 0) L().act.log(g.id, initial, today().T); },
      // "I used this" counts toward a coping-skill goal, if there is one
      newGoal: (pillar: any, share?: boolean) => setWizard({ pillar, share: !!share }),
      // Money goals with their progress, for the Financial Portfolio
      financialGoals: (joint?: boolean) => L().S.goals.filter((g) => g.pillar === 'financial' && (!joint || !!g.coupleId)).map((g) => ({
        title: g.title, type: g.type, unit: g.unit, target: g.target || 0,
        total: Object.values(L().S.logs[g.id] || {}).reduce((a, b) => a + b, 0),
      })),
      logCoping: () => {
        const g = L().S.goals.find((x) => /coping/i.test(x.title));
        if (!g) return false;
        L().act.log(g.id, 1, today().T); return true;
      },
    });
    if (intent) setIntent(null);
    return () => m.destroy();
  }, []);
  return <div ref={ref} />;
}
