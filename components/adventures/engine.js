// The Adventures tab (travel map, bucket lists, hobbies), carried over from the WellWheel prototype.
// mountAdventures() draws into one container and saves through the `api` it is given.
import { key, fmtDate as fmtD } from '@/lib/core';
import { addSectionSaves } from '@/lib/sectionSave';

export const ADV0 = () => ({ places: {}, bucket: { me: [], us: [] }, partner: '', hobbies: [] });
const BEEN = '#7B4FA3', WANT = '#F5C518', ONE = '#C9B3E0';
// Popular spots to suggest inside a state or country (by its name on the map)
const SPOT_IDEAS = {
  'New York': ['New York City', 'Niagara Falls', 'The Hamptons', 'Adirondacks', 'Finger Lakes', 'Lake Placid'],
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Yosemite', 'Napa Valley', 'Big Sur', 'Lake Tahoe', 'Disneyland', 'Joshua Tree', 'Palm Springs'],
  'Texas': ['Dallas', 'Houston', 'San Antonio', 'Austin', 'Fort Worth', 'El Paso', 'Galveston', 'Big Bend', 'Fredericksburg', 'South Padre Island'],
  'Florida': ['Orlando', 'Miami', 'Key West', 'Tampa', 'St. Augustine', 'Everglades', 'Destin'],
  'Nevada': ['Las Vegas', 'Lake Tahoe', 'Reno', 'Red Rock Canyon'],
  'Hawaii': ['Honolulu', 'Maui', 'Kauai', 'Big Island', 'Waikiki'],
  'Arizona': ['Grand Canyon', 'Sedona', 'Phoenix', 'Scottsdale', 'Tucson', 'Page'],
  'Colorado': ['Denver', 'Rocky Mountain National Park', 'Aspen', 'Colorado Springs', 'Vail', 'Boulder'],
  'Tennessee': ['Nashville', 'Memphis', 'Gatlinburg', 'Great Smoky Mountains', 'Chattanooga'],
  'Louisiana': ['New Orleans', 'Baton Rouge', 'Lafayette'],
  'Illinois': ['Chicago', 'Springfield', 'Starved Rock'],
  'Washington': ['Seattle', 'Mount Rainier', 'Olympic National Park', 'San Juan Islands', 'Leavenworth'],
  'Massachusetts': ['Boston', 'Cape Cod', 'Martha’s Vineyard', 'Salem', 'Nantucket'],
  'Utah': ['Zion', 'Arches', 'Bryce Canyon', 'Salt Lake City', 'Park City', 'Moab'],
  'Italy': ['Rome', 'Florence', 'Venice', 'Sicily', 'Amalfi Coast', 'Milan', 'Tuscany', 'Cinque Terre', 'Lake Como', 'Naples'],
  'France': ['Paris', 'Nice', 'Provence', 'Bordeaux', 'Lyon', 'Normandy', 'French Alps'],
  'Spain': ['Barcelona', 'Madrid', 'Seville', 'Mallorca', 'Valencia', 'Granada', 'Ibiza'],
  'United Kingdom': ['London', 'Edinburgh', 'Scottish Highlands', 'Bath', 'Cotswolds', 'Lake District'],
  'Ireland': ['Dublin', 'Cliffs of Moher', 'Galway', 'Ring of Kerry', 'Killarney'],
  'Greece': ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Corfu'],
  'Germany': ['Berlin', 'Munich', 'Neuschwanstein Castle', 'Black Forest', 'Hamburg'],
  'Mexico': ['Cancún', 'Mexico City', 'Tulum', 'Cabo San Lucas', 'Puerto Vallarta', 'Oaxaca'],
  'Canada': ['Toronto', 'Vancouver', 'Banff', 'Montreal', 'Quebec City', 'Niagara Falls'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Mount Fuji', 'Hokkaido', 'Okinawa'],
  'Australia': ['Sydney', 'Melbourne', 'Great Barrier Reef', 'Uluru', 'Gold Coast'],
  'United States of America': ['New York City', 'Grand Canyon', 'Las Vegas', 'Yellowstone', 'Hawaii', 'Washington, D.C.'],
};
const BK_CATS = ['Travel', 'Adventure', 'Learn', 'Food', 'Give back', 'Milestone', 'Just for fun'];
const BK_IDEAS = {
  me: ['See the Northern Lights', 'Visit all 50 states', 'Take a hot air balloon ride', 'Learn to swim or surf', 'Run a 5K', 'Publish a book', 'Start my own business', 'See the Grand Canyon at sunrise', 'Take a cooking class in another country', 'Go on a cruise', 'Learn a new language', 'Volunteer for a cause I love', 'Go whale watching', 'Ride in a helicopter', 'Pay off all my debt', 'Visit where my family came from', 'Sleep under the stars', 'Plant a garden', 'Go to a live taping of a show', 'Road trip Route 66'],
  us: ['Take a dance class together', 'Road trip with no plan', 'Watch the sunrise on a beach', 'Cook a meal from another country', 'Renew our vows', 'Take a couples’ photo shoot', 'Go camping together', 'Visit a new country together', 'Learn something new together', 'Build something together', 'Volunteer together', 'Write letters to open in 10 years', 'Ride a Ferris wheel at night', 'Have a picnic in the rain', 'Stay in a cabin in the mountains', 'Go to a concert together', 'Take a train trip', 'Make a scrapbook of our year', 'Host a holiday together', 'Adopt a pet together'],
};
const HOBBY_IDEAS = ['Reading', 'Baking', 'Cooking', 'Woodworking', 'Photography', 'Hiking', 'Gardening', 'Fishing', 'Painting', 'Drawing', 'Music', 'Writing', 'Crafting', 'Knitting', 'Gaming', 'Camping', 'Birdwatching', 'Puzzles', 'Dancing', 'Biking'];

export function mountAdventures(root, api) {
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const T = key(TODAY), MKEY = T.slice(0, 7);
  const { WORLD, USA, worldSize, usaSize } = api.maps;
  const A = JSON.parse(JSON.stringify(api.adv || ADV0()));
  A.places = A.places || {}; A.bucket = A.bucket || { me: [], us: [] }; A.bucket.me = A.bucket.me || []; A.bucket.us = A.bucket.us || []; A.hobbies = A.hobbies || [];
  const it = api.intent || {};
  const ui = { adv: it.adv || 'map', mapMode: 'world', place: null, bk: it.adv === 'bucket' && it.who === 'us' ? 'us' : 'me', mapWho: it.who === 'us' ? 'us' : 'me' };
  // With a partner, the couple's bucket list is the shared one; my own "us" list is kept aside unchanged
  const couple = !!api.couple;
  const personalUs = A.bucket.us;
  if (couple) A.bucket.us = JSON.parse(JSON.stringify(api.coupleBucket || []));
  const MAPS = { world: { data: WORLD, w: worldSize[0], h: worldSize[1], prefix: 'W:' }, usa: { data: USA, w: usaSize[0], h: usaSize[1], prefix: 'S:' } };
  const vb = { world: [0, 0, worldSize[0], worldSize[1]], usa: [0, 0, usaSize[0], usaSize[1]] };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (k, o) => (k ? fmtD(k, o) : '');
  const toast = (m) => api.toast(m);
  const partnerName = () => (api.partnerName ? api.partnerName() : '');
  const partnerFirst = () => (partnerName() || '').split(' ')[0];
  const pPlaces = () => (api.partnerPlaces ? api.partnerPlaces() : {}) || {};

  /* ---------- saving ---------- */
  let timer = null, dirty = false, dirtyUs = false;
  const flush = () => {
    clearTimeout(timer); timer = null;
    if (dirty) { dirty = false; const copy = JSON.parse(JSON.stringify(A)); if (couple) copy.bucket.us = personalUs; api.persist(copy); }
    if (dirtyUs) { dirtyUs = false; api.persistCouple('bucket', { list: JSON.parse(JSON.stringify(A.bucket.us)) }); }
  };
  const save = () => { if (couple && ui.adv === 'bucket' && ui.bk === 'us') dirtyUs = true; else dirty = true; clearTimeout(timer); timer = setTimeout(flush, 700); };

  /* ---------- photos (kept in Supabase Storage; the list holds their ids) ---------- */
  const url = (id) => api.photoUrl(id);
  const photoInput = (target) => `<label class="btn small addph">+ Add photos<input type="file" accept="image/*" multiple data-ph="${target}" hidden></label>`;
  const photoGrid = (ids, target) => ids && ids.length ? `<div class="phgrid">${ids.map((id, i) => `<button class="ph" data-a="lightbox" data-target="${target}" data-i="${i}">${url(id) ? `<img src="${esc(url(id))}" alt="Photo ${i + 1}" loading="lazy">` : '<span class="phload">…</span>'}</button>`).join('')}</div>` : '';
  async function addPhotos(files, list, folder) {
    let n = 0;
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      try { const blob = await shrink(f); const id = await api.uploadPhoto(blob, folder); list.push(id); n++; save(); rerenderKeep(); } catch (e) { console.error(e); toast('A photo couldn’t be added. Try again.'); }
    }
    return n;
  }

  /* ---------- map ---------- */
  const placeStatus = (id) => (A.places[id] || {}).status || '';
  function placeName(id) { const [pre, code] = id.split(':'); const src = pre === 'W' ? WORLD : USA; return (src.find((x) => String(x.id) === code) || {}).name || code; }
  function counts() { let wb = 0, ww = 0, sb = 0, sw = 0; Object.entries(A.places).forEach(([k, v]) => { if (k.startsWith('W:')) { if (v.status === 'been') wb++; if (v.status === 'want') ww++; } else { if (v.status === 'been') sb++; if (v.status === 'want') sw++; } }); return { wb, ww, sb, sw }; }
  const together = () => ui.mapWho === 'us' && !!partnerName();
  function mapClass(id) { if (!together()) return placeStatus(id); const a = placeStatus(id), b = (pPlaces()[id] || {}).status || ''; if (a === 'been' && b === 'been') return 'been'; if (a === 'been' || b === 'been') return 'been1'; if (a === 'want' || b === 'want') return 'want'; return ''; }
  function mapSVG() {
    const m = MAPS[ui.mapMode], v = vb[ui.mapMode];
    return `<svg id="map" viewBox="${v.join(' ')}" role="img" aria-label="${ui.mapMode === 'world' ? 'World map' : 'Map of the United States'}">
    ${m.data.map((f) => { const id = m.prefix + f.id, st = mapClass(id); return `<path d="${f.d}" data-place="${esc(id)}" class="land ${st} ${ui.place === id ? 'sel' : ''}"><title>${esc(f.name)}</title></path>`; }).join('')}</svg>`;
  }
  function placePanel() {
    if (!ui.place) return `<p class="sub" style="margin:10px 0 0">Tap a ${ui.mapMode === 'world' ? 'country' : 'state'} on the map, or search for it.</p>`;
    const id = ui.place, pl = A.places[id] || {}, st = pl.status || '';
    const pp = pPlaces()[id] || {};
    const who = together() ? `<div class="whobox"><div><b>You</b><span>${st === 'been' ? '✓ Been here' + (pl.date ? ' · ' + fmtDate(pl.date) : '') : st === 'want' ? '★ Want to go' : 'Not yet'}</span></div><div><b>${esc(partnerFirst())}</b><span>${pp.status === 'been' ? '✓ Been here' + (pp.date ? ' · ' + fmtDate(pp.date) : '') : pp.status === 'want' ? '★ Wants to go' : 'Not yet'}</span></div></div>${pp.note ? `<p class="sub" style="margin:6px 0 0">${esc(partnerFirst())}: “${esc(pp.note)}”</p>` : ''}${photoGrid(pp.photos, 'none')}` : '';
    return `<div class="panel"><div class="card-head"><h2>${esc(placeName(id))}</h2><button class="x" data-a="closeplace" aria-label="Close">×</button></div>${who}${together() ? '<p class="lbl" style="margin:10px 0 6px">My status</p>' : ''}
    <div class="seg" role="group" aria-label="Status"><button data-a="status" data-v="been" aria-pressed="${st === 'been'}">✓ I’ve been here</button><button data-a="status" data-v="want" aria-pressed="${st === 'want'}">★ I want to go</button></div>
    ${st === 'been' ? `<div class="grid2" style="margin-top:10px"><label class="sub" for="pdate">When I went</label><input type="date" id="pdate" data-av="date" value="${esc(pl.date || '')}"></div>` : ''}
    ${st === 'want' ? `<div class="grid2" style="margin-top:10px"><label class="sub" for="pyear">Target year</label><input type="number" id="pyear" data-av="year" placeholder="e.g. 2028" value="${esc(pl.year || '')}"></div>` : ''}
    ${st ? `<label class="lbl" style="margin-top:10px" for="pnote">${st === 'been' ? 'Memories' : 'What I want to see or do'}</label><textarea id="pnote" data-av="note" rows="2">${esc(pl.note || '')}</textarea>` : ''}
    ${st === 'been' ? `<div style="margin-top:10px">${photoGrid(pl.photos, 'place')}${photoInput('place')}</div>` : ''}
    ${spotsSection(id, pl)}
    ${st || (pl.spots || []).length ? `<div class="row" style="margin-top:14px;justify-content:space-between;align-items:center"><button class="linkish" data-a="status" data-v="">Clear this place</button><button class="btn primary" data-a="saveplace">Save</button></div>` : '<p class="hint" style="margin-bottom:0">Choose one to add it to your map.</p>'}</div>`;
  }
  // Places inside a state or country: cities, parks, landmarks, each with its own status, notes and photos
  function spotsSection(id, pl) {
    const spots = pl.spots || [], name = placeName(id), have = new Set(spots.map((x) => x.name.toLowerCase()));
    const ideas = (SPOT_IDEAS[name] || []).filter((t) => !have.has(t.toLowerCase()));
    const pp = together() ? ((pPlaces()[id] || {}).spots || []) : [];
    const row = (x, j) => { const open = ui.spot === j, c = x.status === 'been' ? BEEN : WANT; const meta = [x.status === 'been' ? '✓ Been' : '★ Want to go', x.status === 'been' && x.date ? fmtDate(x.date, { month: 'short', year: 'numeric' }) : '', x.status === 'want' && x.year ? 'by ' + x.year : '', (x.photos || []).length ? (x.photos.length + ' photo' + (x.photos.length === 1 ? '' : 's')) : ''].filter(Boolean).join(' · ');
      return `<div class="spot ${open ? 'open' : ''}" style="--c:${c}"><button class="spot-h" data-a="spopen" data-i="${j}" aria-expanded="${open}"><span class="dot" style="background:${c}"></span><span class="spot-n"><b>${esc(x.name)}</b><small>${esc(meta)}</small></span><span class="sub">${open ? '▲' : '▼'}</span></button>
      ${open ? `<div class="spot-b"><div class="seg" role="group" aria-label="Status"><button data-a="spstatus" data-i="${j}" data-v="been" aria-pressed="${x.status === 'been'}">✓ Been here</button><button data-a="spstatus" data-i="${j}" data-v="want" aria-pressed="${x.status === 'want'}">★ Want to go</button></div>
        ${x.status === 'been' ? `<div class="grid2" style="margin-top:10px"><label class="sub">When I went</label><input type="date" data-av="spdate" data-i="${j}" value="${esc(x.date || '')}"></div>` : `<div class="grid2" style="margin-top:10px"><label class="sub">Target year</label><input type="number" data-av="spyear" data-i="${j}" placeholder="e.g. 2028" value="${esc(x.year || '')}"></div>`}
        <label class="lbl" style="margin-top:10px">${x.status === 'been' ? 'Memories' : 'What I want to see or do'}</label><textarea data-av="spnote" data-i="${j}" rows="2">${esc(x.note || '')}</textarea>
        ${x.status === 'been' ? `<div style="margin-top:10px">${photoGrid(x.photos, 'sp:' + j)}${photoInput('sp:' + j)}</div>` : ''}
        <div class="row" style="margin-top:10px;justify-content:space-between"><button class="linkish" data-a="spdel" data-i="${j}">Remove</button><button class="btn small" data-a="spopen" data-i="${j}">Done</button></div></div>` : ''}</div>`; };
    return `<div class="spots"><h3 class="h3" style="margin:18px 0 2px">Places in ${esc(name)}</h3><p class="sub" style="margin:0 0 10px">Cities, parks, landmarks, anywhere you’ve been or want to go.</p>
      ${spots.map(row).join('')}
      <form class="spotadd" data-av-form="spot"><input type="text" id="sp-new" maxlength="80" placeholder="e.g. ${esc((SPOT_IDEAS[name] || ['A city or landmark'])[0])}" aria-label="Add a place in ${esc(name)}"><div class="row" style="gap:6px"><button class="btn small" type="submit" name="st" value="been">✓ Been</button><button class="btn small" type="submit" name="st" value="want">★ Want to go</button></div></form>
      ${ideas.length ? `<p class="sub" style="margin:12px 0 0;font-size:13px">Popular in ${esc(name)} (tap to add to your wish list)</p><div class="chips" style="margin-top:6px">${ideas.slice(0, 8).map((t) => `<button class="chip" data-a="spidea" data-v="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div>` : ''}
      ${pp.length ? `<p class="lbl" style="margin:14px 0 6px">${esc(partnerFirst())}’s places here</p><div class="chips">${pp.map((x) => `<span class="chip static"><span class="dot" style="background:${x.status === 'been' ? BEEN : WANT};margin-right:6px"></span>${esc(x.name)}</span>`).join('')}</div>` : ''}</div>`;
  }
  const spotsSuffix = (k) => { const n = (A.places[k].spots || []).length; return n ? ` <span class="sub" style="font-weight:500">· ${n} place${n === 1 ? '' : 's'}</span>` : ''; };
  function placeChips(status) { const ids = Object.keys(A.places).filter((k) => A.places[k].status === status && k.startsWith(MAPS[ui.mapMode].prefix)); return ids.length ? `<div class="chips">${ids.sort((a, b) => placeName(a).localeCompare(placeName(b))).map((k) => `<button class="chip" data-a="select" data-v="${esc(k)}"><span class="dot" style="background:${status === 'been' ? BEEN : WANT};margin-right:6px"></span>${esc(placeName(k))}${spotsSuffix(k)}${(A.places[k].photos || []).length ? ' 📷' : ''}</button>`).join('')}</div>` : '<p class="empty">None yet.</p>'; }
  function togetherSets() {
    const pre = MAPS[ui.mapMode].prefix, mp = A.places, pp = pPlaces(); const ids = new Set([...Object.keys(mp), ...Object.keys(pp)].filter((k) => k.startsWith(pre)));
    const both = [], one = [], want = []; ids.forEach((k) => { const a = (mp[k] || {}).status, b = (pp[k] || {}).status; if (a === 'been' && b === 'been') both.push(k); else if (a === 'been' || b === 'been') one.push([k, a === 'been' ? 'You' : partnerFirst()]); else if (a === 'want' || b === 'want') want.push([k, a === 'want' && b === 'want' ? 'Both' : a === 'want' ? 'You' : partnerFirst()]); }); return { both, one, want };
  }
  function togetherStats() { const t = togetherSets(); return `<div class="mapstats"><div><b>${t.both.length}</b><span>been together</span></div><div><b>${t.both.length + t.one.length}</b><span>between us</span></div><div><b>${t.want.length}</b><span>on our wish list</span></div></div>`; }
  function togetherChips() {
    const t = togetherSets(); const chip = (k, c, tag) => `<button class="chip" data-a="select" data-v="${esc(k)}"><span class="dot" style="background:${c};margin-right:6px"></span>${esc(placeName(k))}${tag ? ` <span class="sub" style="font-weight:500">· ${esc(tag)}</span>` : ''}</button>`;
    return `<section class="card"><h2>Places we’ve both been</h2><div class="rule"></div>${t.both.length ? `<div class="chips">${t.both.map((k) => chip(k, BEEN)).join('')}</div>` : '<p class="empty">None yet. Your first trip together will show here.</p>'}</section>
  <section class="card"><h2>Only one of us has been</h2><div class="rule"></div>${t.one.length ? `<div class="chips">${t.one.map(([k, w]) => chip(k, ONE, w)).join('')}</div>` : '<p class="empty">None yet.</p>'}</section>
  <section class="card"><h2>Our wish list</h2><div class="rule"></div>${t.want.length ? `<div class="chips">${t.want.map(([k, w]) => chip(k, WANT, w)).join('')}</div>` : '<p class="empty">Mark places you want to go. Places either of you wants show up here.</p>'}</section>`;
  }
  function renderMapTab() {
    const c = counts(), m = MAPS[ui.mapMode];
    return `<section class="card">
    <div class="seg" role="group" aria-label="Map"><button data-a="mapmode" data-v="world" aria-pressed="${ui.mapMode === 'world'}">World</button><button data-a="mapmode" data-v="usa" aria-pressed="${ui.mapMode === 'usa'}">United States</button></div>
    ${partnerName() ? `<div class="seg" role="group" aria-label="Whose map" style="margin-top:8px"><button data-a="mapwho" data-v="me" aria-pressed="${!together()}">Just me</button><button data-a="mapwho" data-v="us" aria-pressed="${together()}">💞 Together</button></div>` : ''}
    ${together() ? togetherStats() : `<div class="mapstats">${ui.mapMode === 'world' ? `<div><b>${c.wb}</b><span>countries visited</span></div><div><b>${Math.round((c.wb / WORLD.length) * 100)}%</b><span>of the world</span></div><div><b>${c.ww}</b><span>on my wish list</span></div>` : `<div><b>${c.sb}</b><span>of 50 states + DC</span></div><div><b>${Math.max(0, 51 - c.sb)}</b><span>left to visit</span></div><div><b>${c.sw}</b><span>on my wish list</span></div>`}</div>`}
    <div class="mapwrap">${mapSVG()}<div class="zoom"><button data-a="zoom" data-v="1" aria-label="Zoom in">+</button><button data-a="zoom" data-v="-1" aria-label="Zoom out">−</button><button data-a="zoom" data-v="0" aria-label="Reset map">⟲</button></div></div>
    <div class="legend2">${together() ? `<span><i style="background:${BEEN}"></i>Both of us</span><span><i style="background:${ONE}"></i>One of us</span><span><i style="background:${WANT}"></i>Wish list</span>` : `<span><i style="background:${BEEN}"></i>Been there</span><span><i style="background:${WANT}"></i>Want to go</span>`}<span class="sub">Drag to move · + to zoom</span></div>
    <input list="placelist" id="placesearch" placeholder="Search for a ${ui.mapMode === 'world' ? 'country' : 'state'}" aria-label="Search places"><datalist id="placelist">${m.data.map((f) => `<option value="${esc(f.name)}">`).join('')}</datalist>
    ${placePanel()}</section>
  ${together() ? togetherChips() : `<section class="card"><h2>Places I’ve been</h2><div class="rule"></div>${placeChips('been')}</section>
  <section class="card"><h2>Places I want to go</h2><div class="rule"></div>${placeChips('want')}</section>`}`;
  }

  /* ---------- bucket lists ---------- */
  function renderBucket() {
    const who = ui.bk, list = A.bucket[who] || []; const done = list.filter((x) => x.done).length;
    const used = new Set(list.map((x) => x.text.toLowerCase()));
    return `<section class="card"><div class="seg" role="group" aria-label="Which list"><button data-a="bk" data-v="me" aria-pressed="${who === 'me'}">My bucket list</button><button data-a="bk" data-v="us" aria-pressed="${who === 'us'}">Couple’s bucket list</button></div>
    ${who === 'us' ? (partnerName() ? `<p class="sub" style="margin:10px 0 0">💞 Shared with <b>${esc(partnerName())}</b>. You both see and edit this list.</p>` : `<div class="grid2" style="margin-top:10px"><label class="sub" for="partner">Our list with</label><input type="text" id="partner" data-av="partner" placeholder="Partner’s name" value="${esc(A.partner || '')}"></div><p class="hint">Connect with your partner from your profile (the circle at the top of Today) to share this list.</p>`) : ''}
    <div class="mapstats"><div><b>${list.length}</b><span>dreams on the list</span></div><div><b>${done}</b><span>done</span></div><div><b>${list.length ? Math.round((done / list.length) * 100) : 0}%</b><span>complete</span></div></div>
    <form class="stack" data-av-form="bucket" style="gap:8px"><input type="text" id="bk-text" maxlength="200" placeholder="${who === 'us' ? 'Something we want to do together' : 'Something I want to do in my life'}" aria-label="New bucket list item"><div class="row"><select id="bk-cat" aria-label="Category">${BK_CATS.map((c) => `<option>${c}</option>`).join('')}</select><input type="number" id="bk-year" placeholder="By year" aria-label="Target year" style="max-width:110px"><button class="btn primary" type="submit">Add</button></div></form></section>
  <section class="card"><div class="card-head"><h2>${who === 'us' ? (A.partner ? `Me & ${esc(A.partner)}` : 'Our list') : 'My list'}</h2><span class="sub">${done} of ${list.length}</span></div>
    ${list.length ? list.map((x, i) => `<div class="bk ${x.done ? 'done' : ''}"><button class="bkchk" data-a="bkdone" data-i="${i}" aria-pressed="${!!x.done}" aria-label="Mark done">${x.done ? '✓' : ''}</button><div class="bkmain"><div class="bkt">${esc(x.text)}${x.example ? '<span class="example">Example</span>' : ''}</div><div class="bkedit"><select data-av="bkcat" data-i="${i}" aria-label="Category">${BK_CATS.concat(BK_CATS.includes(x.cat) || !x.cat ? [] : [x.cat]).map((c) => `<option ${x.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><label class="bkyear">By<input type="number" inputmode="numeric" min="${TODAY.getFullYear() - 50}" max="${TODAY.getFullYear() + 80}" data-av="bkyear" data-i="${i}" placeholder="year" value="${esc(x.year || '')}" aria-label="Target year for ${esc(x.text)}"></label>${x.done && x.doneDate ? `<span class="tag used">Done ${fmtDate(x.doneDate)}</span>` : ''}</div>${x.done ? `<div style="margin-top:8px">${photoGrid(x.photos, 'bk:' + i)}${photoInput('bk:' + i)}</div>` : ''}</div><button class="x" data-a="bkdel" data-i="${i}" aria-label="Remove">×</button></div>`).join('') : '<p class="empty">Add your first dream above, or tap an idea below.</p>'}</section>
  <section class="card"><h2>Need ideas?</h2><div class="rule"></div><div class="chips">${BK_IDEAS[who].filter((t) => !used.has(t.toLowerCase())).map((t) => `<button class="chip" data-a="bkidea" data-v="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div></section>`;
  }

  /* ---------- hobbies ---------- */
  function renderHobbies() {
    const hs = A.hobbies;
    return `<section class="card"><form class="row" data-av-form="hobby"><input type="text" id="hb-name" maxlength="60" placeholder="Add a hobby, e.g. Photography" aria-label="New hobby"><button class="btn primary" type="submit">Add</button></form>
    <div class="chips" style="margin-top:10px">${HOBBY_IDEAS.filter((h) => !hs.some((x) => x.name.toLowerCase() === h.toLowerCase())).slice(0, 12).map((h) => `<button class="chip" data-a="hbidea" data-v="${h}">+ ${h}</button>`).join('')}</div></section>
  ${hs.length ? hs.map((h, i) => { const n = (h.sessions || {})[MKEY] || 0; return `<section class="card"><div class="card-head"><h2>${esc(h.name)}${h.example ? '<span class="example">Example</span>' : ''}</h2><button class="x" data-a="hbdel" data-i="${i}" aria-label="Remove hobby">×</button></div>
    <div class="hbrow"><div><b class="big2">${n}</b><span class="sub"> time${n === 1 ? '' : 's'} this month</span></div><button class="btn small primary" data-a="hbplus" data-i="${i}">+ I did this today</button></div>
    <label class="lbl" style="margin-top:10px">What I’m working toward</label><input type="text" data-av="hgoal" data-i="${i}" placeholder="e.g. Bake bread from scratch" value="${esc(h.goal || '')}">
    <label class="lbl" style="margin-top:10px">Ideas & plans</label><textarea data-av="hnote" data-i="${i}" rows="2" placeholder="Projects, places, supplies…">${esc(h.note || '')}</textarea>
    <div style="margin-top:10px">${photoGrid(h.photos, 'hb:' + i)}${photoInput('hb:' + i)}</div></section>`; }).join('') : '<section class="card"><p class="empty">Add the things you do just because you love them.</p></section>'}`;
  }

  /* ---------- tab ---------- */
  function renderAdventures() {
    const sub = ui.adv;
    return `<header class="top"><div><div class="brand">Adventures</div><h1>Fun, travel & dreams</h1><div class="sub">Where you’ve been, where you’re going, and what lights you up.</div></div></header>
  <div class="seg tabs3" role="group" aria-label="Section"><button data-a="adv" data-v="map" aria-pressed="${sub === 'map'}">Travel map</button><button data-a="adv" data-v="bucket" aria-pressed="${sub === 'bucket'}">Bucket lists</button><button data-a="adv" data-v="hobbies" aria-pressed="${sub === 'hobbies'}">Hobbies</button></div>
  <div class="stack" style="margin-top:14px">${sub === 'map' ? renderMapTab() : sub === 'bucket' ? renderBucket() : renderHobbies()}</div>
  <div class="lightbox" id="lightbox" role="dialog" aria-label="Photo"></div>`;
  }
  function render() { root.innerHTML = renderAdventures(); if (ui.adv === 'map') wireMap(); addSectionSaves(root, 'av', ['data-a', 'savenow']); }
  function rerenderKeep() { const y = window.scrollY; render(); window.scrollTo(0, y); }

  /* ---------- lightbox ---------- */
  function photoList(target) {
    if (target === 'none') return (pPlaces()[ui.place] || {}).photos || [];
    if (target === 'place') return (A.places[ui.place] || {}).photos || [];
    if (target.startsWith('sp:')) return ((A.places[ui.place] || {}).spots || [])[+target.slice(3)]?.photos || [];
    const [k, i] = target.split(':'); if (k === 'bk') return A.bucket[ui.bk][+i].photos || []; if (k === 'hb') return A.hobbies[+i].photos || [];
    return [];
  }
  function openLightbox(target, i) {
    const list = photoList(target); const lb = root.querySelector('#lightbox'); if (!list[i]) return;
    lb.innerHTML = `<div class="lb-in"><img src="${esc(url(list[i]) || '')}" alt=""><div class="row" style="justify-content:space-between"><button class="btn" data-lb="close">Close</button>${target === 'none' ? '' : '<button class="btn" data-lb="del">Delete photo</button>'}</div></div>`;
    lb.classList.add('open');
    lb.onclick = (e) => {
      const b = e.target.closest('[data-lb]');
      if (e.target === lb || (b && b.dataset.lb === 'close')) lb.classList.remove('open');
      else if (b && b.dataset.lb === 'del') { const id = list[i]; list.splice(i, 1); api.deletePhoto(id); save(); lb.classList.remove('open'); rerenderKeep(); toast('Photo deleted'); }
    };
  }

  /* ---------- map pan & zoom ---------- */
  function wireMap() {
    const svg = root.querySelector('#map'); if (!svg) return; const v = vb[ui.mapMode];
    let drag = null, moved = false;
    svg.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, v: [...v] }; moved = false; });
    svg.addEventListener('pointermove', (e) => { if (!drag) return; const r = svg.getBoundingClientRect(), s = v[2] / r.width; const dx = (e.clientX - drag.x) * s, dy = (e.clientY - drag.y) * s; if (Math.abs(dx) + Math.abs(dy) > 3) { moved = true; if (!svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId); } if (moved) { v[0] = drag.v[0] - dx; v[1] = drag.v[1] - dy; svg.setAttribute('viewBox', v.join(' ')); } });
    const end = (e) => { if (drag && !moved) { const t = document.elementFromPoint(e.clientX, e.clientY); const p = t && t.closest && t.closest('[data-place]'); if (p) { ui.spot = null; ui.place = p.dataset.place; rerenderKeep(); } } drag = null; };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', () => (drag = null));
  }
  function zoomMap(dir) { const v = vb[ui.mapMode], f = MAPS[ui.mapMode]; if (dir === 0) { v.splice(0, 4, 0, 0, f.w, f.h); } else { const k = dir > 0 ? 0.6 : 1 / 0.6; const cx = v[0] + v[2] / 2, cy = v[1] + v[3] / 2; const w = Math.min(f.w, Math.max(60, v[2] * k)), h = (w * f.h) / f.w; v.splice(0, 4, cx - w / 2, cy - h / 2, w, h); } const svg = root.querySelector('#map'); if (svg) svg.setAttribute('viewBox', v.join(' ')); }

  /* ---------- events ---------- */
  const onClick = (e) => {
    const b = e.target.closest('[data-a]'); if (!b || !root.contains(b)) return; const a = b.dataset.a;
    if (a === 'savenow') { save(); flush(); toast('Saved'); return; }
    if (a === 'adv') { ui.adv = b.dataset.v; render(); }
    else if (a === 'mapmode') { ui.mapMode = b.dataset.v; ui.place = null; rerenderKeep(); }
    else if (a === 'mapwho') { ui.mapWho = b.dataset.v; rerenderKeep(); }
    else if (a === 'select') { ui.spot = null; ui.place = b.dataset.v; render(); root.querySelector('#map')?.scrollIntoView({ block: 'start' }); }
    else if (a === 'closeplace') { ui.place = null; rerenderKeep(); }
    else if (a === 'spopen') { ui.spot = ui.spot === +b.dataset.i ? null : +b.dataset.i; rerenderKeep(); }
    else if (a === 'spstatus') { const x = A.places[ui.place].spots[+b.dataset.i]; x.status = b.dataset.v; bumpParent(b.dataset.v); save(); rerenderKeep(); }
    else if (a === 'spdel') { const l = A.places[ui.place].spots, x = l[+b.dataset.i]; (x.photos || []).forEach((id) => api.deletePhoto(id)); l.splice(+b.dataset.i, 1); ui.spot = null; save(); rerenderKeep(); }
    else if (a === 'spidea') addSpot(b.dataset.v, 'want');
    else if (a === 'saveplace') { const n = placeName(ui.place); save(); flush(); ui.place = null; rerenderKeep(); toast(`${n} saved`); }
    else if (a === 'status') {
      const id = ui.place, v = b.dataset.v;
      if (!v) { const p = A.places[id]; if (p && ((p.photos || []).length || (p.spots || []).length)) p.status = ''; else delete A.places[id]; }
      else { A.places[id] = A.places[id] || { photos: [] }; A.places[id].status = v; A.places[id].photos = A.places[id].photos || []; delete A.places[id].example; }
      save(); rerenderKeep(); if (v === 'been') toast(`${placeName(id)} added to places you’ve been`);
    }
    else if (a === 'zoom') zoomMap(+b.dataset.v);
    else if (a === 'lightbox') openLightbox(b.dataset.target, +b.dataset.i);
    else if (a === 'bk') { ui.bk = b.dataset.v; render(); }
    else if (a === 'bkdone') { const x = A.bucket[ui.bk][+b.dataset.i]; x.done = !x.done; x.doneDate = x.done ? T : ''; x.photos = x.photos || []; save(); rerenderKeep(); if (x.done) toast('Checked off! Add a photo to remember it.'); }
    else if (a === 'bkdel') { const l = A.bucket[ui.bk], x = l[+b.dataset.i]; (x.photos || []).forEach((id) => api.deletePhoto(id)); l.splice(+b.dataset.i, 1); save(); rerenderKeep(); }
    else if (a === 'bkidea') { A.bucket[ui.bk].push({ text: b.dataset.v, cat: /visit|trip|travel|road|states|country|cruise|grand canyon|lights|cabin|train/i.test(b.dataset.v) ? 'Travel' : 'Adventure', year: '', done: false, photos: [] }); save(); rerenderKeep(); toast('Added to your list'); }
    else if (a === 'hbidea') { A.hobbies.push({ name: b.dataset.v, goal: '', note: '', photos: [], sessions: {} }); save(); rerenderKeep(); }
    else if (a === 'hbdel') { const h = A.hobbies[+b.dataset.i]; (h.photos || []).forEach((id) => api.deletePhoto(id)); A.hobbies.splice(+b.dataset.i, 1); save(); rerenderKeep(); }
    else if (a === 'hbplus') { const h = A.hobbies[+b.dataset.i]; h.sessions = h.sessions || {}; h.sessions[MKEY] = (h.sessions[MKEY] || 0) + 1; save(); rerenderKeep(); }
  };
  // A place inside a state/country also marks the state/country: "been" wins, "want" only fills an empty one
  function bumpParent(st) { const p = A.places[ui.place]; if (st === 'been' && p.status !== 'been') p.status = 'been'; else if (st === 'want' && !p.status) p.status = 'want'; }
  function addSpot(name, st) {
    const id = ui.place; A.places[id] = A.places[id] || { photos: [], status: '' }; const p = A.places[id]; p.spots = p.spots || []; delete p.example;
    if (p.spots.some((x) => x.name.toLowerCase() === name.toLowerCase())) { toast('Already on your list'); return; }
    p.spots.push({ name, status: st, date: '', year: '', note: '', photos: [] }); bumpParent(st); ui.spot = p.spots.length - 1; save(); rerenderKeep(); toast(`${name} added`);
  }
  const onInput = (e) => {
    const el = e.target, k = el.dataset.av; if (!k) return;
    if (k === 'partner') A.partner = el.value;
    else if (k === 'bkyear') A.bucket[ui.bk][+el.dataset.i].year = el.value.replace(/\D/g, '').slice(0, 4);
    else if (k === 'bkcat') A.bucket[ui.bk][+el.dataset.i].cat = el.value;
    else if (k === 'hgoal') A.hobbies[+el.dataset.i].goal = el.value;
    else if (k === 'hnote') A.hobbies[+el.dataset.i].note = el.value;
    else if (k === 'spdate' || k === 'spyear' || k === 'spnote') { const x = A.places[ui.place].spots[+el.dataset.i]; x[k.slice(2)] = k === 'spyear' ? el.value.replace(/\D/g, '').slice(0, 4) : el.value; }
    else if (ui.place && A.places[ui.place]) A.places[ui.place][k] = el.value;
    save();
  };
  const onChange = async (e) => {
    const el = e.target;
    if (el.id === 'placesearch') { const m = MAPS[ui.mapMode]; const f = m.data.find((x) => x.name.toLowerCase() === el.value.trim().toLowerCase()); if (f) { ui.spot = null; ui.place = m.prefix + f.id; rerenderKeep(); } return; }
    if (el.dataset.ph) {
      const t = el.dataset.ph; let list;
      if (t === 'place') { const p = A.places[ui.place]; p.photos = p.photos || []; list = p.photos; }
      else if (t.startsWith('sp:')) { const x = A.places[ui.place].spots[+t.slice(3)]; x.photos = x.photos || []; list = x.photos; }
      else { const [k, i] = t.split(':'); const obj = k === 'bk' ? A.bucket[ui.bk][+i] : A.hobbies[+i]; obj.photos = obj.photos || []; list = obj.photos; }
      const files = [...el.files]; toast(files.length > 1 ? `Adding ${files.length} photos…` : 'Adding photo…');
      const folder = t === 'place' || t.startsWith('sp:') ? 'places' : t.startsWith('bk:') && ui.bk === 'us' ? 'shared' : 'mine';
      const n = await addPhotos(files, list, folder); if (n) toast(`${n} photo${n === 1 ? '' : 's'} added`);
    }
  };
  const onSubmit = (e) => {
    const f = e.target; if (!f.dataset.avForm) return; e.preventDefault();
    if (f.dataset.avForm === 'bucket') { const t = root.querySelector('#bk-text').value.trim(); if (!t) return; A.bucket[ui.bk].push({ text: t, cat: root.querySelector('#bk-cat').value, year: root.querySelector('#bk-year').value, done: false, photos: [] }); save(); rerenderKeep(); toast('Added to your list'); }
    if (f.dataset.avForm === 'spot') { const t = root.querySelector('#sp-new').value.trim(); if (!t) return; addSpot(t, (e.submitter && e.submitter.value) || 'want'); return; }
    if (f.dataset.avForm === 'hobby') { const t = root.querySelector('#hb-name').value.trim(); if (!t) return; A.hobbies.push({ name: t, goal: '', note: '', photos: [], sessions: {} }); save(); rerenderKeep(); }
  };
  const onHide = () => { if (document.visibilityState === 'hidden') flush(); };

  root.addEventListener('click', onClick); root.addEventListener('input', onInput); root.addEventListener('change', onChange); root.addEventListener('submit', onSubmit);
  document.addEventListener('visibilitychange', onHide);
  render();

  // Fetch viewing links for every saved photo, then redraw with them
  const allPhotos = () => [
    ...Object.values(A.places).flatMap((p) => [...(p.photos || []), ...(p.spots || []).flatMap((x) => x.photos || [])]),
    ...A.bucket.me.flatMap((x) => x.photos || []), ...A.bucket.us.flatMap((x) => x.photos || []),
    ...A.hobbies.flatMap((h) => h.photos || []),
    ...Object.values(pPlaces()).flatMap((p) => (p ? [...(p.photos || []), ...(p.spots || []).flatMap((x) => x.photos || [])] : [])),
  ];
  const ids = allPhotos(); if (ids.length) api.loadPhotos(ids).then(() => rerenderKeep()).catch(() => {});

  return {
    destroy() {
      flush();
      root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('change', onChange); root.removeEventListener('submit', onSubmit);
      document.removeEventListener('visibilitychange', onHide);
    },
  };
}

/* Make photos small before upload (max 1200px, JPEG) so they load fast and use little storage */
export function shrink(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const m = 1200, s = Math.min(1, m / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob((b) => (b ? res(b) : rej(new Error('Could not read photo'))), 'image/jpeg', 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Could not read photo')); };
    img.src = u;
  });
}
