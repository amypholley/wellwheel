// Photos live in a private Supabase Storage bucket called "photos", in a folder per person.
// Guests' photos stay in the browser only.
import { supabase } from './supabase';
import { uid } from './core';

const urls = new Map<string, string>(); // photo id -> viewable link
export const photoUrl = (id: string) => urls.get(id) || '';

// folder: 'places' (travel map) and 'shared' (couple's bucket list) can be seen by a connected partner; 'mine' cannot
export async function uploadPhoto(blob: Blob, guest: boolean, folder = 'mine'): Promise<string> {
  if (guest || !supabase) { const id = 'local:' + uid(); urls.set(id, URL.createObjectURL(blob)); return id; }
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Not signed in');
  const id = `${u.user.id}/${folder}/${uid()}.jpg`;
  const { error } = await supabase.storage.from('photos').upload(id, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  urls.set(id, URL.createObjectURL(blob)); // show it right away
  return id;
}

export async function loadPhotos(ids: string[]) {
  const need = ids.filter((id) => id && !id.startsWith('local:') && !urls.has(id));
  if (!need.length || !supabase) return;
  for (let i = 0; i < need.length; i += 100) {
    const { data } = await supabase.storage.from('photos').createSignedUrls(need.slice(i, i + 100), 60 * 60 * 6);
    (data || []).forEach((d: any) => { if (d.signedUrl && d.path) urls.set(d.path, d.signedUrl); });
  }
}

export async function deletePhoto(id: string) {
  urls.delete(id);
  if (!id || id.startsWith('local:') || !supabase) return;
  await supabase.storage.from('photos').remove([id]);
}
