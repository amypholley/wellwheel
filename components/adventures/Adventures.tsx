'use client';
import { useEffect, useRef, useState } from 'react';
import { useWW } from '../store';
import { mountAdventures } from './engine';
import { loadMaps } from './maps';
import { photoUrl, uploadPhoto, loadPhotos, deletePhoto } from '@/lib/photos';
import { LogoWheel } from '../ui';

// Hosts the Adventures tab (drawn by engine.js) inside the React app.
export function Adventures() {
  const { S, act, toast, mode } = useWW();
  const ref = useRef<HTMLDivElement>(null);
  const [maps, setMaps] = useState<any>(null);
  const [err, setErr] = useState(false);
  const latest = useRef({ S, act, toast, mode });
  latest.current = { S, act, toast, mode };

  useEffect(() => { loadMaps().then(setMaps).catch(() => setErr(true)); }, []);
  useEffect(() => {
    if (!maps || !ref.current) return;
    const L = () => latest.current;
    const m = mountAdventures(ref.current, {
      maps, adv: L().S.tools.adv,
      toast: (msg: string) => L().toast(msg),
      persist: (data: any) => L().act.saveTool('adv', data),
      photoUrl, loadPhotos,
      uploadPhoto: (blob: Blob) => uploadPhoto(blob, L().mode !== 'user'),
      deletePhoto: (id: string) => deletePhoto(id).catch(() => {}),
    });
    return () => m.destroy();
  }, [maps]);
  if (err) return <div className="stack" style={{ paddingTop: 40 }}><p className="empty">The maps couldn’t load. Check your connection and try again.</p></div>;
  if (!maps) return <div className="loading" style={{ minHeight: '60vh' }}><LogoWheel size={48} /></div>;
  return <div ref={ref} />;
}
