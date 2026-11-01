'use client';
import { useEffect, useRef } from 'react';
import { useWW } from '../store';
import { mountResources } from './engine';
import { Goal, today } from '@/lib/core';

// Hosts the worksheets (drawn by engine.js) inside the React app.
export function Resources() {
  const { S, act, toast } = useWW();
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ S, act, toast });
  latest.current = { S, act, toast };

  useEffect(() => {
    const L = () => latest.current;
    const m = mountResources(ref.current!, {
      tools: L().S.tools,
      toast: (msg: string) => L().toast(msg),
      persist: (tool: string, data: any) => L().act.saveTool(tool, data),
      addGoal: (g: Goal, initial: number) => { L().act.addGoal(g); if (initial > 0) L().act.log(g.id, initial, today().T); },
      // "I used this" counts toward a coping-skill goal, if there is one
      logCoping: () => {
        const g = L().S.goals.find((x) => /coping/i.test(x.title));
        if (!g) return false;
        L().act.log(g.id, 1, today().T); return true;
      },
    });
    return () => m.destroy();
  }, []);
  return <div ref={ref} />;
}
