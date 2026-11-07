// The seven worksheets that used to say "Coming soon".
// makeMore() gets the engine's helpers and returns the tools plus their click and form handlers.

const BODY_SIGNS = ['Racing heart', 'Tight chest', 'Short of breath', 'Shaky', 'Sweaty', 'Upset stomach', 'Tense muscles', 'Restless', 'Can’t focus', 'Headache', 'Dizzy', 'Can’t sleep'];
const ANX_HELP = ['Slow breathing', '5-4-3-2-1 grounding', 'Went for a walk', 'Talked to someone', 'Wrote it down', 'Cold water', 'Prayer or meditation', 'Distracted myself', 'Challenged the thought', 'Rested'];

const DBT_MODS = [
  { id: 'mind', name: 'Mindfulness', sum: 'Being present in this moment, on purpose, without judging it.', skills: [
    ['Wise mind', 'The balance between emotion mind (feelings in charge) and reasonable mind (logic in charge). Ask yourself: “What does my wise mind know?”'],
    ['Observe', 'Notice what you see, hear, feel, and think, without reacting to it or holding on to it.'],
    ['Describe', 'Put words to what you notice. “I notice a tight feeling in my chest.” Facts, not judgments.'],
    ['Participate', 'Throw yourself fully into what you’re doing right now.'],
    ['Don’t judge', 'Drop “good” and “bad.” Describe what happened instead.'],
    ['One thing at a time', 'Do one thing with your full attention.'],
    ['Do what works', 'Act in the way that gets you closer to your goals, not what feels “fair” in the moment.']] },
  { id: 'dist', name: 'Distress tolerance', sum: 'Getting through a hard moment without making it worse.', skills: [
    ['STOP', 'Stop. Take a step back. Observe what’s happening. Proceed mindfully.'],
    ['TIPP', 'Temperature (cold water on your face), Intense exercise, Paced breathing, Paired muscle relaxation. These calm your body fast.'],
    ['ACCEPTS', 'Distract with Activities, Contributing, Comparisons, a different Emotion, Pushing the situation away for now, other Thoughts, and Sensations.'],
    ['Self-soothe', 'Comfort yourself through your five senses: something to see, hear, smell, taste, and touch.'],
    ['IMPROVE the moment', 'Imagery, Meaning, Prayer, Relaxation, One thing at a time, a short Vacation, Encouragement.'],
    ['Pros and cons', 'Weigh acting on an urge against riding it out. See the pros and cons box below.'],
    ['Radical acceptance', 'Accept reality as it is, fully, even when you don’t like it. Accepting isn’t the same as approving.']] },
  { id: 'emo', name: 'Emotion regulation', sum: 'Understanding your emotions so you feel less at their mercy.', skills: [
    ['Check the facts', 'Does my emotion, and how strong it is, fit the facts of the situation?'],
    ['Opposite action', 'When an emotion doesn’t fit the facts, do the opposite of what it urges. Approach instead of avoid, be gentle instead of attack.'],
    ['Problem solving', 'When the emotion does fit the facts, work on the problem itself.'],
    ['ABC', 'Accumulate positive experiences, Build mastery (do something that makes you feel capable), Cope ahead of hard situations.'],
    ['PLEASE', 'Treat PhysicaL illness, balanced Eating, Avoid mood-altering substances, balanced Sleep, get Exercise.']] },
  { id: 'inter', name: 'Interpersonal effectiveness', sum: 'Asking for what you need and saying no, while keeping your relationships and self-respect.', skills: [
    ['DEAR MAN', 'Describe, Express, Assert, Reinforce. Stay Mindful, Appear confident, Negotiate. For getting what you need. Try the builder below.'],
    ['GIVE', 'Be Gentle, act Interested, Validate, use an Easy manner. For keeping the relationship.'],
    ['FAST', 'Be Fair, no extra Apologies, Stick to your values, be Truthful. For keeping your self-respect.']] },
];
const DBT_FEEL = ['Sad', 'Anxious', 'Angry', 'Ashamed', 'Lonely', 'Happy'];

const WORKOUTS = ['Walk', 'Run', 'Strength', 'Yoga or stretch', 'Cycling', 'Swim', 'Class', 'Sports', 'HIIT', 'Other'];
const FELT = ['Energized', 'Good', 'Tired', 'Sore', 'Proud'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DATE_IDEAS = {
  'At home': ['Cook a new recipe together', 'Movie night with a blanket fort', 'Board game or card tournament', 'Indoor picnic on the living room floor', 'Make homemade pizza', 'Stargaze from the backyard', 'Do a puzzle with music on', 'Dessert taste-test', 'Plan a dream trip together', 'Make a playlist of “our songs”', 'Look through old photos', 'Spa night at home'],
  'Out and about': ['Try a new restaurant', 'Go to a live concert', 'Visit a museum', 'Go bowling', 'Mini golf', 'Take a cooking or pottery class', 'Sunset drive', 'Coffee shop and a bookstore', 'Comedy show', 'Farmers market'],
  'Free or cheap': ['Walk a new trail', 'Picnic at a park', 'Free community event', 'Watch the sunrise', 'Visit the library', 'Bike ride', 'Volunteer together', 'Window-shop and dream'],
  'Adventure': ['Day trip to a nearby town', 'Kayaking or canoeing', 'Rock climbing gym', 'Hot springs', 'Camp for a night', 'Take a dance lesson'],
  'Seasonal': ['Pick apples or berries', 'Drive to see holiday lights', 'Ice skating', 'Fair or festival', 'Beach day', 'Bonfire and s’mores'],
};

const BIBLE_PLANS = [['John', 'Gospel of John', 21], ['Mark', 'Gospel of Mark', 16], ['Psalms', 'Psalms 1–30', 30], ['Proverbs', 'Proverbs, a chapter a day', 31], ['Philippians', 'Philippians', 4], ['James', 'James', 5], ['Romans', 'Romans', 16], ['Genesis', 'Genesis', 50]];
const STUDY_QS = ['What does this passage say? Retell it in your own words.', 'What does it show me about God?', 'What does it show me about people, or about me?', 'Is there a promise to hold, a command to follow, or a warning to heed?', 'How can I live this out this week?'];

const STRENGTHS = ['Curious', 'Creative', 'Organized', 'Patient', 'Kind', 'Brave', 'Honest', 'Funny', 'Hardworking', 'Good listener', 'Leader', 'Problem solver', 'Encourager', 'Adaptable', 'Detail-oriented', 'Calm under pressure', 'Generous', 'Disciplined'];
const LEARN_TYPES = ['Book', 'Course', 'Podcast', 'Skill', 'Class', 'Videos'];

const ROOMS = [
  ['Kitchen', ['Clear and wipe the counters', 'Empty the sink and run the dishwasher', 'Wipe the stovetop and microwave', 'Toss old food from the fridge', 'Take out trash and recycling', 'Sweep and mop the floor']],
  ['Bathroom', ['Clear the counter', 'Clean the sink and mirror', 'Clean the toilet', 'Scrub the tub or shower', 'Hang fresh towels', 'Empty the trash']],
  ['Bedroom', ['Make the bed', 'Put away clothes', 'Clear the nightstand', 'Change the sheets', 'Dust surfaces', 'Vacuum the floor']],
  ['Living room', ['Put things back where they go', 'Fold blankets and fluff pillows', 'Dust surfaces and the TV', 'Vacuum or sweep', 'Clear the coffee table', 'Open the windows for fresh air']],
  ['Entry & closets', ['Put away shoes and coats', 'Sort the mail', 'Clear the drop zone', 'Donate one thing you don’t use']],
  ['Laundry', ['Wash, dry, and fold one load', 'Put it all away', 'Wipe down the machines', 'Match the socks']],
  ['Car', ['Remove the trash', 'Shake out the mats', 'Wipe the dashboard', 'Restock the essentials']],
  ['Digital', ['Clean up your phone’s home screen', 'Unsubscribe from 5 emails', 'Delete old photos and screenshots', 'Back up your phone']],
];
const DAILY_RESET = ['Make the bed', 'Dishes done or in the dishwasher', 'Wipe the kitchen counters', '10-minute pick-up', 'Quick bathroom wipe-down', 'Lay out tomorrow’s clothes'];
const TALLY = ['Keep', 'Donate', 'Toss', 'Sell'];

export function makeMore(h) {
  const { getP, setP, save, rerenderKeep, inp, area, chk, pick, out, esc, icon, num, fmtDate, entriesList, saveBtn, kv, T, TODAY, toast, api, uid, key, addMonths, P, ui, fromKey } = h;
  const scale = (path, lo, hi, l1, l2) => `<div class="scale">${Array.from({ length: hi - lo + 1 }, (_, i) => i + lo).map((i) => `<button type="button" data-r="pick" data-path="${path}" data-v="${i}" aria-pressed="${String(getP(path)) === String(i)}">${i}</button>`).join('')}</div><div class="scale-l"><span>${l1}</span><span>${l2}</span></div>`;
  const card = (title, body, extra = '') => `<section class="card"${extra}><h2>${title}</h2><div class="rule"></div>${body}</section>`;
  const lbl = (t, first) => `<label class="lbl"${first ? '' : ' style="margin-top:10px"'}>${t}</label>`;
  const sum = (items) => `<section class="card"><div class="sumgrid">${items.map(([k, v, c]) => `<div><div class="k">${k}</div><div class="v"${c ? ` style="color:${c}"` : ''}>${v}</div></div>`).join('')}</div></section>`;
  const tags = (arr) => (arr && arr.length ? `<div class="sk-meta" style="margin-top:6px">${arr.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : '');
  const goalBtn = (g, label) => `<button class="btn" style="margin-top:12px" data-r="mgoal" data-g="${esc(JSON.stringify(g))}">${label}</button>`;
  const crisis = '<p class="note">If you’re in crisis or thinking about hurting yourself, call or text <b>988</b> (Suicide & Crisis Lifeline, US) any time, day or night.</p>';
  const monday = () => { const d = new Date(TODAY); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return key(d); };
  const top = (lists, n = 3) => { const c = {}; lists.forEach((l) => (l || []).forEach((x) => (c[x] = (c[x] || 0) + 1))); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([x]) => x); };
  const avg = (xs) => { const v = xs.filter((x) => x !== '' && x != null).map(Number); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

  /* ---------- Anxiety ---------- */
  const ANXIETY = {
    render() {
      const es = getP('anxiety.entries') || [], ws = getP('anxiety.worries') || [], lad = getP('anxiety.ladder') || [];
      const b = avg(es.map((e) => e.before)), a = avg(es.map((e) => e.after));
      return `<div class="stack">
    <section class="card"><p style="margin:0">Anxiety is your body’s alarm system. It’s trying to protect you, but sometimes it goes off when there’s no real danger. This workbook helps you calm your body, notice your patterns, and slowly take back the things anxiety has been keeping you from.</p>${crisis}</section>
    ${card('Calm down right now', `<div class="stack" style="gap:10px">
      ${kv('Box breathing', 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 times.')}
      ${kv('5-4-3-2-1', 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.')}
      ${kv('Cold water', 'Splash cold water on your face or hold something cold. It slows your heart rate fast.')}
      ${kv('Name it', '“This is anxiety. It’s uncomfortable, but it isn’t dangerous, and it will pass.”')}</div>
      <button class="btn small" style="margin-top:12px" data-r="opentool" data-v="coping">More coping skills</button>`)}
    ${es.length ? sum([['Moments logged', es.length], ['Average before', b != null ? b.toFixed(1) + ' / 10' : '—'], ['Average after', a != null ? a.toFixed(1) + ' / 10' : '—', P.mental.color]]) : ''}
    ${card('Log an anxious moment', `${lbl('What was happening?', 1)}${area('anxiety.draft.sit', 'Where were you, and what was going on?', 2)}
      ${lbl('How anxious did I feel?')}${scale('anxiety.draft.before', 0, 10, 'Calm', 'Panic')}
      ${lbl('What I noticed in my body')}${pick('anxiety.draft.body', BODY_SIGNS, true)}
      ${lbl('What was I worried would happen?')}${area('anxiety.draft.worry', 'e.g. “I’ll say something wrong and they’ll think I’m stupid.”', 2)}
      ${lbl('What I did to cope')}${pick('anxiety.draft.help', ANX_HELP, true)}
      ${lbl('How anxious do I feel now?')}${scale('anxiety.draft.after', 0, 10, 'Calm', 'Panic')}
      ${saveBtn('anxiety', 'Save this moment')}`)}
    ${es.length >= 2 ? card('My patterns', `${top(es.map((e) => e.body)).length ? `${lbl('My body’s most common warning signs', 1)}${tags(top(es.map((e) => e.body)))}` : ''}${top(es.map((e) => e.help)).length ? `${lbl('What I reach for most')}${tags(top(es.map((e) => e.help)))}` : ''}<p class="hint">The more moments you log, the clearer your patterns get.</p>`) : ''}
    ${card('Worry sorter', `<p class="sub" style="margin-top:0">Write down a worry, then decide: can I do something about it, or is it out of my hands?</p>
      <form class="row" data-r-form="worry"><input type="text" id="wr-new" placeholder="What’s worrying me?" aria-label="New worry"><button class="btn primary" type="submit">Add</button></form>
      ${ws.map((w, i) => `<div class="bk" style="grid-template-columns:1fr auto"><div class="bkmain"><div class="bkt">${esc(w.t)}</div><div class="chips" style="margin-top:6px"><button class="chip" data-r="pick" data-path="anxiety.worries.${i}.c" data-v="act" aria-pressed="${w.c === 'act'}">I can act on this</button><button class="chip" data-r="pick" data-path="anxiety.worries.${i}.c" data-v="let" aria-pressed="${w.c === 'let'}">Out of my control</button></div>
        ${w.c === 'act' ? `<div style="margin-top:8px">${inp(`anxiety.worries.${i}.step`, { ph: 'One small step I’ll take, and when' })}</div>` : w.c === 'let' ? '<p class="hint" style="margin-bottom:0">You’ve named it. Now practice setting it down. When it comes back, remind yourself: “I already decided this one isn’t mine to carry.”</p>' : ''}</div>
        <button class="x" data-r="del" data-path="anxiety.worries" data-i="${i}" aria-label="Remove worry">×</button></div>`).join('')}`)}
    ${card('Worry time', `<p style="margin-top:0">Give worries a set appointment instead of letting them follow you all day. When one pops up, jot it in the worry sorter and tell yourself, “Not now. I’ll think about it at worry time.”</p>
      <div class="grid2b"><label>Time of day${inp('anxiety.wt.time', { type: 'time' })}</label><label>For how long${inp('anxiety.wt.min', { ph: 'e.g. 15 minutes' })}</label></div>`)}
    ${card('Fear ladder', `<p style="margin-top:0">Anxiety shrinks when you face things gradually. List situations you’ve been avoiding, from easiest to hardest, and rate how scary each one feels (0–10). Start at the bottom rung and stay with it until the fear drops.</p>
      ${lad.map((s, i) => `<div class="bill" style="grid-template-columns:auto 1fr 70px auto;align-items:center"><label class="ck" style="margin:0"><input type="checkbox" data-b="anxiety.ladder.${i}.done" data-rr ${s.done ? 'checked' : ''} aria-label="Done"><span></span></label>${inp(`anxiety.ladder.${i}.t`, { ph: i ? 'A little harder…' : 'e.g. Make a short phone call' })}${inp(`anxiety.ladder.${i}.f`, { type: 'number', ph: '0–10' })}<button class="x" data-r="del" data-path="anxiety.ladder" data-i="${i}" aria-label="Remove step">×</button></div>`).join('')}
      <button class="btn small" style="margin-top:8px" data-r="add" data-path="anxiety.ladder">+ Add a rung</button>`)}
    ${card('My anxiety plan', `${lbl('My early warning signs', 1)}${area('anxiety.plan.signs', 'e.g. I stop sleeping well and start snapping at people', 2)}
      ${lbl('My common triggers')}${area('anxiety.plan.trig', '', 2)}
      ${lbl('What helps me most')}${area('anxiety.plan.helps', '', 2)}
      ${lbl('People I can reach out to')}${inp('anxiety.plan.people', { ph: 'Names and numbers' })}
      ${lbl('When to get more help')}${area('anxiety.plan.more', 'e.g. If anxiety keeps me from work or sleep for two weeks, I’ll call my doctor or a counselor.', 2)}`)}
    ${card('Past moments', entriesList('anxiety', (e) => `${kv('What was happening', e.sit)}${kv('The worry', e.worry)}${tags([...(e.body || []), ...(e.help || [])])}${e.before !== undefined || e.after !== undefined ? `<p class="goal-meta" style="margin:6px 0 0">Anxiety: ${esc(e.before ?? '?')} → ${esc(e.after ?? '?')}</p>` : ''}`, 'Your logged moments will show up here.'))}</div>`;
    },
  };

  /* ---------- DBT ---------- */
  const DBT = {
    render() {
      const all = DBT_MODS.flatMap((m) => m.skills.map((s) => s[0]));
      return `<div class="stack">
    <section class="card"><p style="margin:0">DBT (Dialectical Behavior Therapy) teaches four sets of skills for handling strong emotions and relationships. This workbook is a place to learn and practice them. DBT works best alongside a trained therapist, so if you’re in DBT, bring this to your sessions.</p>${crisis}</section>
    ${card('Today’s diary card', `<p class="sub" style="margin-top:0">Rate each feeling from 0 (none) to 5 (very strong).</p>
      ${DBT_FEEL.map((f) => `<div class="r2" style="align-items:center;margin-top:6px"><span>${f}</span><div class="chips" style="margin:0">${[0, 1, 2, 3, 4, 5].map((n) => `<button class="chip" data-r="pick" data-path="dbt.draft.f.${f}" data-v="${n}" aria-pressed="${String(getP(`dbt.draft.f.${f}`)) === String(n)}">${n}</button>`).join('')}</div></div>`).join('')}
      ${lbl('Urges I noticed')}${area('dbt.draft.urges', 'e.g. Wanted to shut down, yell, isolate…', 2)}
      ${lbl('Skills I used today')}${pick('dbt.draft.skills', all, true)}
      ${lbl('What helped most')}${inp('dbt.draft.best', { ph: '' })}
      ${saveBtn('dbt', 'Save diary card')}`)}
    ${DBT_MODS.map((m) => `<details class="card fold" data-fold="dbt.open.${m.id}" ${getP('dbt.open.' + m.id) ? 'open' : ''}><summary><b>${m.name}</b><span class="sub">${m.skills.length} skills</span></summary>
      <p class="sub" style="margin-top:0">${m.sum}</p><dl class="defs">${m.skills.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>
      ${lbl('How I practiced this')}${area(`dbt.mod.${m.id}`, '', 2)}</details>`).join('')}
    ${card('DEAR MAN script', `<p class="sub" style="margin-top:0">Plan what you’ll say before a hard conversation.</p>
      ${lbl('Describe the situation (just the facts)', 1)}${inp('dbt.dm.d', { ph: 'You’ve come home late three nights this week.' })}
      ${lbl('Express how you feel')}${inp('dbt.dm.e', { ph: 'I feel worried and a little lonely' })}
      ${lbl('Assert what you want')}${inp('dbt.dm.a', { ph: 'I’d like a text if you’ll be past 7' })}
      ${lbl('Reinforce: why it’s good for them too')}${inp('dbt.dm.r', { ph: 'Then I won’t be upset when you get home' })}
      <div class="summary" style="margin-top:12px">${out('dbt-dm')}</div>
      <p class="hint">Then stay Mindful (don’t get pulled off topic), Appear confident, and be willing to Negotiate.</p>`)}
    ${card('Pros and cons', `<p class="sub" style="margin-top:0">When an urge is strong, weigh it out before you act.</p>${inp('dbt.pc.urge', { ph: 'The urge, e.g. Quit my job today' })}
      <div class="grid2b" style="margin-top:10px"><label>Pros of acting on it${area('dbt.pc.ap', '', 3)}</label><label>Cons of acting on it${area('dbt.pc.ac', '', 3)}</label><label>Pros of riding it out${area('dbt.pc.rp', '', 3)}</label><label>Cons of riding it out${area('dbt.pc.rc', '', 3)}</label></div>`)}
    ${card('Past diary cards', entriesList('dbt', (e) => { const f = Object.entries(e.f || {}).filter(([, v]) => v !== '' && +v > 0); return `${f.length ? `<p class="goal-meta" style="margin:0">${f.map(([k, v]) => `${esc(k)} ${esc(v)}`).join(' · ')}</p>` : ''}${kv('Urges', e.urges)}${tags(e.skills)}${kv('Helped most', e.best)}`; }, 'Your diary cards will show up here.'))}</div>`;
    },
    outs() { const g = (k) => (getP('dbt.dm.' + k) || '').trim(); const [d, e, a, r] = ['d', 'e', 'a', 'r'].map(g); return { 'dbt-dm': d || e || a ? [d && d.replace(/\.?$/, '.'), e && `${e}.`, a && `${a}.`, r && `${r}.`].filter(Boolean).join(' ') : 'Your script will appear here.' }; },
  };

  /* ---------- Fitness ---------- */
  const FITNESS = {
    render() {
      const es = getP('fitness.entries') || [], m = monday();
      const wk = es.filter((e) => (e.date || '') >= m && e.type !== 'Rest day');
      const mins = wk.reduce((a, e) => a + num(e.min), 0), goal = num(getP('fitness.goalmin')) || 150;
      const per = getP('fitness.perweek') || '3';
      const pbs = getP('fitness.pb') || [];
      return `<div class="stack">
    ${sum([['Minutes this week', mins], ['Workouts this week', wk.length], ['Weekly goal', goal + ' min']])}
    <section class="card" style="padding-top:14px"><div class="bar" style="height:12px;margin:0"><span style="width:${Math.min(100, (mins / goal) * 100)}%;background:${P.physical.color}"></span></div><p class="hint" style="margin-bottom:0">${mins >= goal ? 'You hit your goal this week. Nice work!' : `${goal - mins} minutes to go this week. Health guidelines suggest about 150 minutes of moderate activity a week, plus strength work twice a week.`}</p>
      <div class="r2" style="margin-top:10px"><span>My weekly minutes goal</span>${inp('fitness.goalmin', { type: 'number', ph: '150', rr: true })}</div></section>
    ${card('My week', `<div class="rows">${DAYS.map((d) => `<div class="r2 meal"><span>${d}</span>${inp(`fitness.plan.${d}`, { ph: d === 'Sun' ? 'e.g. Rest day' : 'e.g. 30-minute walk' })}</div>`).join('')}</div>`)}
    ${card('Log a workout', `<div class="grid2b"><label>Date<input type="date" data-b="fitness.draft.date" value="${esc(getP('fitness.draft.date') || T)}"></label><label>Minutes${inp('fitness.draft.min', { type: 'number', ph: '30' })}</label></div>
      ${lbl('Type')}${pick('fitness.draft.type', WORKOUTS)}
      ${lbl('How hard was it?')}${scale('fitness.draft.effort', 1, 10, 'Easy', 'All out')}
      ${lbl('Afterward I felt')}${pick('fitness.draft.felt', FELT, true)}
      ${lbl('Notes')}${area('fitness.draft.note', 'Exercises, distance, how it went…', 2)}
      ${saveBtn('fitness', 'Save workout')}`)}
    ${card('Personal bests', `${pbs.map((p, i) => `<div class="bill" style="grid-template-columns:1fr 1fr auto"> ${inp(`fitness.pb.${i}.t`, { ph: 'e.g. Mile time' })}${inp(`fitness.pb.${i}.v`, { ph: 'e.g. 9:45' })}<button class="x" data-r="del" data-path="fitness.pb" data-i="${i}" aria-label="Remove">×</button></div>`).join('')}
      <button class="btn small" style="margin-top:8px" data-r="add" data-path="fitness.pb">+ Add a personal best</button>`)}
    ${card('Make it a goal', `<p style="margin-top:0">Work out <select data-b="fitness.perweek" data-rr aria-label="Workouts per week">${['2', '3', '4', '5', '6'].map((n) => `<option ${per === n ? 'selected' : ''}>${n}</option>`).join('')}</select> times a week, and check in on Today.</p>
      ${goalBtn({ pillar: 'physical', title: `Work out ${per} times a week`, type: 'habit', count: +per, per: 'week', unit: 'workouts', months: 3 }, 'Add to my WellWheel goals')}
      <p class="hint">Check with your doctor before starting a new exercise routine, especially if you have a health condition.</p>`)}
    ${card('Past workouts', entriesList('fitness', (e) => `<div class="sk-meta">${e.type ? `<span class="tag">${esc(e.type)}</span>` : ''}${e.min ? `<span class="tag">${esc(e.min)} min</span>` : ''}${e.effort ? `<span class="tag">Effort ${esc(e.effort)}/10</span>` : ''}${(e.felt || []).map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>${e.note ? `<p style="margin:6px 0 0">${esc(e.note)}</p>` : ''}`, 'Your workouts will show up here.'))}</div>`;
    },
  };

  /* ---------- Date night ---------- */
  const DATENIGHT = {
    render() {
      const list = getP('datenight.list') || [], cat = ui.dnCat || 'At home';
      const up = list.map((x, i) => [x, i]).filter(([x]) => !x.done), done = list.map((x, i) => [x, i]).filter(([x]) => x.done);
      const bud = num(getP('datenight.budget')), planned = up.reduce((a, [x]) => a + num(x.cost), 0);
      const row = ([x, i]) => `<div class="bk ${x.done ? 'done' : ''}"><label class="ck" style="margin:0"><input type="checkbox" data-b="datenight.list.${i}.done" data-rr ${x.done ? 'checked' : ''} aria-label="We did it"><span></span></label><div class="bkmain"><div class="bkt">${esc(x.t)}</div>
        ${x.done ? `<div style="margin-top:6px">${inp(`datenight.list.${i}.mem`, { ph: 'Favorite moment from this date' })}</div>` : `<div class="grid2b" style="margin-top:6px;grid-template-columns:1fr 90px 1fr"><input type="date" data-b="datenight.list.${i}.d" value="${esc(x.d || '')}" aria-label="Date">${inp(`datenight.list.${i}.cost`, { type: 'number', ph: '$ cost' })}${inp(`datenight.list.${i}.who`, { ph: 'Who plans it?' })}</div>`}</div>
        <button class="x" data-r="del" data-path="datenight.list" data-i="${i}" aria-label="Remove">×</button></div>`;
      return `<div class="stack">
    <section class="card"><p style="margin:0">Regular time together, just the two of you, keeps a relationship strong. It doesn’t need to be fancy or expensive. It just needs to be on purpose.</p>
      <div class="row" style="margin-top:12px;flex-wrap:wrap"><button class="btn primary" data-r="dnrand">🎲 Surprise me</button>${ui.dnIdea ? `<span class="prompt" style="margin:0;font-size:17px">${esc(ui.dnIdea)}</span><button class="btn small" data-r="dnadd" data-v="${esc(ui.dnIdea)}">Add to our list</button>` : ''}</div></section>
    ${card('Idea bank', `<div class="chips scroll">${Object.keys(DATE_IDEAS).map((c) => `<button class="chip" data-r="dncat" data-v="${esc(c)}" aria-pressed="${cat === c}">${esc(c)}</button>`).join('')}</div>
      <div class="chips" style="margin-top:10px">${DATE_IDEAS[cat].map((t) => { const has = list.some((x) => x.t === t); return `<button class="chip" data-r="dnadd" data-v="${esc(t)}" aria-pressed="${has}">${has ? '✓ ' : '+ '}${esc(t)}</button>`; }).join('')}</div>
      <form class="row" style="margin-top:12px" data-r-form="dn"><input type="text" id="dn-new" placeholder="Our own idea" aria-label="Add your own date idea"><button class="btn primary" type="submit">Add</button></form>`)}
    ${card(`Coming up <span class="sub" style="font-family:var(--body);font-size:14px;font-weight:400">${up.length}</span>`, up.length ? up.map(row).join('') : '<p class="empty">Tap an idea above to add it here.</p>')}
    ${card('Date night budget', `<div class="rows"><div class="r2"><span>Monthly date budget</span><div class="money">${inp('datenight.budget', { type: 'number', ph: '0', rr: true })}</div></div><div class="r2"><span>Planned dates cost</span><b>$${planned.toLocaleString()}</b></div>${bud ? `<div class="r2 total"><span>Left</span><b style="color:${bud - planned < 0 ? 'var(--plum)' : 'var(--good)'}">$${(bud - planned).toLocaleString()}</b></div>` : ''}</div>`)}
    ${card('Make it a habit', `<p style="margin-top:0">Put date night on your Today page so it doesn’t slip.</p><div class="row" style="flex-wrap:wrap;gap:8px">
      ${goalBtn({ pillar: 'relationships', title: 'Date night every week', type: 'habit', count: 1, per: 'week', unit: 'dates', months: 3 }, 'Add a weekly date night goal')}</div>
      <button class="btn small ghost" style="margin-top:10px" data-r="opentool" data-v="couples">Conversation starters for date night →</button>`)}
    ${done.length ? card('Memories', done.map(row).join('')) : ''}</div>`;
    },
  };

  /* ---------- Bible study ---------- */
  const BIBLE = {
    render() {
      const plan = getP('bible.plan') || 'John', pl = BIBLE_PLANS.find((p) => p[0] === plan) || BIBLE_PLANS[0];
      const read = getP(`bible.read.${pl[0]}`) || [], n = pl[2], nxt = Array.from({ length: n }, (_, i) => i + 1).find((c) => !read.includes(c));
      const vs = getP('bible.verses') || [];
      return `<div class="stack">
    ${card('Reading plan', `<div class="chips">${BIBLE_PLANS.map(([id, t, c]) => `<button class="chip" data-r="set" data-path="bible.plan" data-v="${id}" aria-pressed="${plan === id}">${esc(t)}</button>`).join('')}</div>
      <div class="card-head" style="margin:14px 0 6px"><b>${esc(pl[1])}</b><span class="sub">${read.length} of ${n} chapters</span></div>
      <div class="bar" style="height:10px;margin:0 0 12px"><span style="width:${(read.length / n) * 100}%;background:${P.spiritual.color}"></span></div>
      <div class="chips">${Array.from({ length: n }, (_, i) => i + 1).map((c) => `<button class="chip" style="min-width:42px;justify-content:center" data-r="bch" data-v="${c}" aria-pressed="${read.includes(c)}" aria-label="Chapter ${c}">${c}</button>`).join('')}</div>
      <p class="hint">${nxt ? `Next up: <b>${esc(pl[0])} ${nxt}</b>. Tap a chapter when you’ve read it.` : 'You finished this plan! Pick another one above.'}</p>
      ${goalBtn({ pillar: 'spiritual', title: 'Read my Bible', type: 'habit', count: 1, per: 'day', unit: 'chapters', months: 2 }, 'Add a daily reading goal')}`)}
    ${card('Study a passage (SOAP)', `<p class="sub" style="margin-top:0">A simple way to study: Scripture, Observation, Application, Prayer.</p>
      ${lbl('Passage', 1)}${inp('bible.draft.ref', { ph: `e.g. ${pl[0]} ${nxt || 1}` })}
      ${lbl('<span class="letter">S</span>Scripture: the verse that stood out')}${area('bible.draft.s', 'Write it out word for word', 2)}
      ${lbl('<span class="letter">O</span>Observation: what does it say?')}${area('bible.draft.o', 'Who, what, when, where, why?', 2)}
      ${lbl('<span class="letter">A</span>Application: how does it apply to my life?')}${area('bible.draft.a', '', 2)}
      ${lbl('<span class="letter">P</span>Prayer')}${area('bible.draft.p', 'A short prayer in response', 2)}
      ${saveBtn('bible', 'Save study')}`)}
    ${card('Questions to ask any passage', `<ol class="principles">${STUDY_QS.map((q) => `<li>${q}</li>`).join('')}</ol>`)}
    ${card('Memory verses', `<form class="stack" style="gap:8px" data-r-form="bverse"><input type="text" id="bv-ref" placeholder="Reference, e.g. Joshua 1:9" aria-label="Verse reference"><textarea id="bv-txt" rows="2" placeholder="The verse" aria-label="Verse text"></textarea><button class="btn primary" type="submit" style="align-self:flex-start">Add verse</button></form>
      ${vs.map((v, i) => `<div class="bk ${v.m ? 'done' : ''}"><button class="bkchk" data-r="bmem" data-i="${i}" aria-pressed="${!!v.m}" aria-label="Mark memorized">${v.m ? '✓' : ''}</button><div class="bkmain"><div class="bkt">${esc(v.r)}</div>${v.t ? `<p style="margin:4px 0 0">${esc(v.t)}</p>` : ''}${v.m ? '<div class="sk-meta"><span class="tag used">Memorized</span></div>' : ''}</div><button class="x" data-r="del" data-path="bible.verses" data-i="${i}" aria-label="Remove">×</button></div>`).join('')}`)}
    ${card('Past studies', entriesList('bible', (e) => `${e.ref ? `<p class="prompt" style="margin:0 0 4px;font-size:15px">${esc(e.ref)}</p>` : ''}${kv('Scripture', e.s)}${kv('Application', e.a)}${kv('Prayer', e.p)}`, 'Your studies will show up here.'))}</div>`;
    },
  };

  /* ---------- Personal development ---------- */
  const GROWTH = {
    render() {
      const ls = getP('growth.learn') || [], cnt = (s) => ls.filter((x) => (x.s || 'Want') === s).length;
      const ms = [0, 1, 2], gt = (getP('growth.goal') || '').trim();
      return `<div class="stack">
    <section class="card"><p style="margin:0">Growth happens in small, steady steps. Know your strengths, pick one area to grow, and give it 90 focused days.</p></section>
    ${card('My strengths', `<p class="sub" style="margin-top:0">Choose the ones that sound like you. Ask a friend if you’re not sure.</p>${pick('growth.str', STRENGTHS, true)}
      ${lbl('Areas I want to grow in')}${area('growth.areas', 'e.g. Speaking up in meetings, staying consistent, managing my time', 2)}`)}
    ${card('My 90-day growth goal', `${lbl('In 90 days, I want to…', 1)}${inp('growth.goal', { ph: 'e.g. Finish an online Excel course' })}
      ${lbl('Why it matters to me')}${area('growth.why', '', 2)}
      ${lbl('Milestones')}${ms.map((i) => `<div class="bill" style="grid-template-columns:auto 1fr;align-items:center"><label class="ck" style="margin:0"><input type="checkbox" data-b="growth.ms.${i}.done" ${getP(`growth.ms.${i}.done`) ? 'checked' : ''} aria-label="Milestone done"><span></span></label>${inp(`growth.ms.${i}.t`, { ph: ['By day 30…', 'By day 60…', 'By day 90…'][i] })}</div>`).join('')}
      ${lbl('What I’ll do each week')}${area('growth.weekly', 'e.g. Two 30-minute lessons on Tuesday and Saturday mornings', 2)}
      ${gt ? goalBtn({ pillar: 'intellectual', title: gt.slice(0, 200), type: 'target', count: 1, per: 'day', target: 1, unit: 'done', months: 3, why: (getP('growth.why') || '').trim() }, 'Add to my WellWheel goals') : ''}`)}
    ${card('My learning list', `<div class="sumgrid" style="margin-bottom:12px"><div><div class="k">Want to</div><div class="v">${cnt('Want')}</div></div><div><div class="k">Doing</div><div class="v">${cnt('Doing')}</div></div><div><div class="k">Done</div><div class="v" style="color:var(--good)">${cnt('Done')}</div></div></div>
      <form class="grocadd" data-r-form="learn"><input type="text" id="ln-new" placeholder="A book, course, podcast, or skill" aria-label="Something to learn"><select id="ln-type" aria-label="Type">${LEARN_TYPES.map((t) => `<option>${t}</option>`).join('')}</select><button class="btn primary" type="submit">Add</button></form>
      ${ls.map((x, i) => `<div class="book"><div><b>${esc(x.t)}</b><div class="sub">${esc(x.type || '')}</div></div><div class="seg3">${['Want', 'Doing', 'Done'].map((o) => `<button data-r="lstat" data-i="${i}" data-v="${o}" aria-pressed="${(x.s || 'Want') === o}">${o}</button>`).join('')}<button class="x" data-r="del" data-path="growth.learn" data-i="${i}" aria-label="Remove">×</button></div></div>`).join('')}`)}
    ${card('Weekly reflection', `${lbl('My wins this week', 1)}${area('growth.draft.wins', '', 2)}${lbl('What I learned')}${area('growth.draft.learned', '', 2)}${lbl('What got in the way')}${area('growth.draft.hard', '', 2)}${lbl('My focus for next week')}${inp('growth.draft.next', { ph: '' })}${saveBtn('growth', 'Save reflection')}`)}
    ${card('Past reflections', entriesList('growth', (e) => `${kv('Wins', e.wins)}${kv('Learned', e.learned)}${kv('Next focus', e.next)}`, 'Your reflections will show up here.'))}</div>`;
    },
  };

  /* ---------- Home reset ---------- */
  const HOME = {
    render() {
      const roomDone = (r) => ROOMS[r][1].filter((_, i) => getP(`home.rooms.${r}.${i}`)).length;
      const tot = ROOMS.reduce((a, r) => a + r[1].length, 0), dn = ROOMS.reduce((a, _, r) => a + roomDone(r), 0);
      const daily = getP(`home.daily.${T}`) || {}, dd = DAILY_RESET.filter((_, i) => daily[i]).length;
      const wk = Array.from({ length: 7 }, (_, i) => { const d = new Date(TODAY); d.setDate(d.getDate() - i); return key(d); }).filter((k) => Object.values(getP(`home.daily.${k}`) || {}).some(Boolean)).length;
      return `<div class="stack">
    ${sum([['Home reset', `${dn} / ${tot}`], ['Today’s reset', `${dd} / ${DAILY_RESET.length}`], ['Reset days this week', wk]])}
    ${card('Today’s 10-minute reset', `<p class="sub" style="margin-top:0">A quick daily reset keeps the mess from piling up. This list starts fresh every day.</p><div class="stack" style="gap:6px">${DAILY_RESET.map((x, i) => chk(`home.daily.${T}.${i}`, x, true)).join('')}</div>
      ${goalBtn({ pillar: 'environmental', title: 'Do my 10-minute home reset', type: 'habit', count: 1, per: 'day', unit: 'resets', months: 2 }, 'Add as a daily goal')}`)}
    <section><div class="sec-l" style="margin:4px 0 8px">Room by room</div><div class="stack">${ROOMS.map(([name, tasks], r) => { const d = roomDone(r); return `<details class="card fold" data-fold="home.open.${r}" ${getP('home.open.' + r) ? 'open' : ''}><summary><b>${esc(name)}</b><span class="sub" ${d === tasks.length ? 'style="color:var(--good);font-weight:600"' : ''}>${d === tasks.length ? '✓ Done' : `${d} / ${tasks.length}`}</span></summary>
      <div class="stack" style="gap:6px">${tasks.map((t, i) => chk(`home.rooms.${r}.${i}`, esc(t), true)).join('')}</div>${d ? `<button class="btn small ghost" style="margin-top:10px" data-r="homeclr" data-v="${r}">Start this room over</button>` : ''}</details>`; }).join('')}</div></section>
    ${card('Declutter tally', `<p class="sub" style="margin-top:0">Going through a closet or drawer? Count as you sort.</p><div class="sumgrid">${TALLY.map((t) => `<div style="text-align:center"><div class="k">${t}</div><div class="v">${num(getP('home.tally.' + t))}</div><div class="counter" style="justify-content:center;margin-top:6px"><button class="round" data-r="tally" data-k="${t}" data-v="-1" aria-label="${t} minus one">−</button><button class="round plus" data-r="tally" data-k="${t}" data-v="1" aria-label="${t} plus one">+</button></div></div>`).join('')}</div>
      <button class="btn small ghost" style="margin-top:12px" data-r="tallyclr">Reset the counts</button>`)}
    ${card('My home', `${lbl('My home feels best when…', 1)}${area('home.best', 'e.g. The counters are clear and there’s a candle going', 2)}${lbl('One area I keep putting off')}${inp('home.putoff', { ph: 'e.g. The garage' })}${lbl('My weekly reset day')}${pick('home.day', DAYS)}`)}</div>`;
    },
  };

  const tools = [
    { id: 'anxiety', pillar: 'mental', title: 'Anxiety Management Workbook', desc: 'Calm your body, sort your worries, and face fears step by step.', tool: ANXIETY },
    { id: 'dbt', pillar: 'mental', title: 'DBT Skills Workbook', desc: 'Diary card, the four DBT skill sets, and a DEAR MAN script builder.', tool: DBT },
    { id: 'fitness', pillar: 'physical', title: 'Fitness Planner', desc: 'Plan your week, log workouts, and track minutes and personal bests.', tool: FITNESS },
    { id: 'datenight', pillar: 'relationships', title: 'Date Night Planner', desc: 'Idea bank, a “surprise me” button, a date list, budget, and memories.', tool: DATENIGHT },
    { id: 'bible', pillar: 'spiritual', title: 'Bible Study Workbook', desc: 'Reading plans, SOAP study, and memory verses.', tool: BIBLE },
    { id: 'growth', pillar: 'intellectual', title: 'Personal Development Workbook', desc: 'Your strengths, a 90-day growth goal, a learning list, and weekly reflection.', tool: GROWTH },
    { id: 'home', pillar: 'environmental', title: 'Home Reset Checklist', desc: 'A daily 10-minute reset, room-by-room checklists, and a declutter tally.', tool: HOME },
  ];

  const click = (a, b) => {
    if (a === 'mgoal') {
      const g = JSON.parse(b.dataset.g); const months = g.months || 3; delete g.months;
      api.addGoal({ why: '', sure: 7, ...g, id: uid(), deadline: key(addMonths(TODAY, months)) }, 0); toast('Added to your goals'); return true;
    }
    if (a === 'dncat') { ui.dnCat = b.dataset.v; rerenderKeep(); return true; }
    if (a === 'dnrand') { const all = Object.values(DATE_IDEAS).flat(); let t; do { t = all[Math.floor(Math.random() * all.length)]; } while (t === ui.dnIdea); ui.dnIdea = t; rerenderKeep(); return true; }
    if (a === 'dnadd') { const l = getP('datenight.list') || []; const t = b.dataset.v; const i = l.findIndex((x) => x.t === t && !x.done); if (i >= 0) { l.splice(i, 1); toast('Removed from your list'); } else { l.push({ t }); toast('Added to your list'); } if (ui.dnIdea === t) ui.dnIdea = ''; setP('datenight.list', l); save(); rerenderKeep(); return true; }
    if (a === 'bch') { const plan = getP('bible.plan') || 'John', p = `bible.read.${plan}`; const r = [...(getP(p) || [])]; const c = +b.dataset.v, i = r.indexOf(c); i < 0 ? r.push(c) : r.splice(i, 1); setP(p, r); save(); rerenderKeep(); return true; }
    if (a === 'bmem') { const v = getP('bible.verses'); const x = v[+b.dataset.i]; x.m = !x.m; setP('bible.verses', v); save(); rerenderKeep(); if (x.m) toast('Memorized!'); return true; }
    if (a === 'lstat') { setP(`growth.learn.${b.dataset.i}.s`, b.dataset.v); save(); rerenderKeep(); return true; }
    if (a === 'homeclr') { setP(`home.rooms.${b.dataset.v}`, {}); save(); rerenderKeep(); return true; }
    if (a === 'tally') { const p = 'home.tally.' + b.dataset.k; setP(p, Math.max(0, num(getP(p)) + +b.dataset.v)); save(); rerenderKeep(); return true; }
    if (a === 'tallyclr') { setP('home.tally', {}); save(); rerenderKeep(); return true; }
    return false;
  };
  const submit = (form, root) => {
    const val = (id) => { const el = root.querySelector('#' + id); return el ? el.value.trim() : ''; };
    const push = (path, item) => { const l = getP(path) || []; l.push(item); setP(path, l); save(); rerenderKeep(); };
    if (form === 'worry') { const t = val('wr-new'); if (t) push('anxiety.worries', { t, d: T }); root.querySelector('#wr-new')?.focus(); return true; }
    if (form === 'dn') { const t = val('dn-new'); if (t) push('datenight.list', { t }); return true; }
    if (form === 'bverse') { const r = val('bv-ref'), t = val('bv-txt'); if (r || t) push('bible.verses', { r: r || 'Verse', t }); return true; }
    if (form === 'learn') { const t = val('ln-new'); if (t) push('growth.learn', { t, type: val('ln-type'), s: 'Want' }); root.querySelector('#ln-new')?.focus(); return true; }
    return false;
  };
  const outs = { dbt: DBT.outs };
  return { tools, click, submit, outs };
}
