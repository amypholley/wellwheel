import { hotlinesHTML } from '@/lib/hotlines';
// The seven worksheets that used to say "Coming soon".
// makeMore() gets the engine's helpers and returns the tools plus their click and form handlers.

const BODY_SIGNS = ['Racing heart', 'Tight chest', 'Short of breath', 'Fast breathing', 'Shaky', 'Sweaty', 'Hot or flushed', 'Cold hands', 'Upset stomach', 'Nausea', 'Tense muscles', 'Clenched jaw', 'Tight throat', 'Tingling or numbness', 'Restless', 'Can’t focus', 'Headache', 'Dizzy', 'Feeling unreal', 'Tired or drained', 'Teary', 'Can’t sleep'];
const ANX_HELP = ['Slow breathing', '5-4-3-2-1 grounding', 'Went for a walk', 'Went outside', 'Talked to someone', 'Hugged someone or a pet', 'Wrote it down', 'Journaled', 'Made a to-do list', 'Cold water', 'Took a shower or bath', 'Drank water', 'Ate something', 'Listened to music', 'Stretched or did yoga', 'Prayer or meditation', 'Counted backward', 'Watched something funny', 'Took a break from screens', 'Distracted myself', 'Challenged the thought', 'Took prescribed medicine', 'Rested'];

// Each skill: [id, name, what it is, when to use it, practice fields]. A field is [key, label, placeholder, kind]
// kind: 'a' big text box (default), 'i' one line, 's' 0–10 scale, 'c' checkbox, 'p:Opt1|Opt2' choices, 'm:Opt1|Opt2' several choices
const DBT_MODS = [
  { id: 'mind', name: 'Mindfulness', sum: 'Being present in this moment, on purpose, without judging it.', skills: [
    ['wise', 'Wise mind', 'The balance between emotion mind (feelings in charge) and reasonable mind (logic in charge). Wise mind is the calm, knowing place in the middle.', 'When you’re torn between what you feel and what you think.', [['emo', 'Emotion mind says…', 'What my feelings want me to do'], ['reason', 'Reasonable mind says…', 'What the facts and logic say'], ['wise', 'Wise mind knows…', 'Take a slow breath and ask: what do I know deep down?']]],
    ['observe', 'Observe', 'Notice what you see, hear, feel, and think, without reacting to it or holding on to it.', 'When you’re on autopilot or caught up in your head.', [['see', 'I saw', '', 'i'], ['hear', 'I heard', '', 'i'], ['body', 'I felt in my body', '', 'i'], ['thoughts', 'Thoughts that passed through', '', 'a']]],
    ['describe', 'Describe', 'Put words to what you notice. “I notice a tight feeling in my chest.” Facts, not judgments or guesses.', 'When feelings and stories get mixed up with what actually happened.', [['sit', 'What happened, facts only', 'What a video camera would have recorded'], ['add', 'Judgments or guesses I added', 'e.g. “She did it on purpose”'], ['feel', 'What I feel, in words', 'e.g. I notice sadness and a heavy feeling']]],
    ['participate', 'Participate', 'Throw yourself fully into what you’re doing right now, without holding back or watching yourself.', 'When you feel self-conscious or like you’re watching life from the sidelines.', [['act', 'The activity', '', 'i'], ['how', 'How fully was I in it?', '', 's'], ['pulled', 'What pulled me out of it', '']]],
    ['nonjudge', 'Don’t judge', 'Drop “good” and “bad,” “should” and “shouldn’t.” Describe what happened and how you feel instead.', 'When you’re being hard on yourself or someone else.', [['judg', 'The judgment', 'e.g. “I’m so stupid”', 'i'], ['facts', 'The facts instead', 'e.g. I forgot the appointment'], ['feel', 'How I feel about it', 'e.g. Embarrassed and frustrated']]],
    ['onething', 'One thing at a time', 'Do one thing with your full attention. When your mind wanders, gently bring it back.', 'When you feel scattered or overwhelmed by everything at once.', [['thing', 'The one thing I focused on', '', 'i'], ['dist', 'Distractions that came up', ''], ['back', 'How I brought myself back', '']]],
    ['effective', 'Do what works', 'Act in the way that gets you closer to your goals, not what feels “fair” or “right” in the moment.', 'When you want to prove a point more than get a good outcome.', [['goal', 'What I really want here', ''], ['right', 'What “being right” would look like', ''], ['works', 'What would actually work', '']]]] },
  { id: 'dist', name: 'Distress tolerance', sum: 'Getting through a hard moment without making it worse.', skills: [
    ['stop', 'STOP', 'Stop. Take a step back. Observe what’s happening. Proceed mindfully.', 'The moment you feel an urge to react.', [['s', 'Stop: I froze and didn’t act right away', '', 'c'], ['t', 'Took a step back and breathed', '', 'c'], ['o', 'Observe: what’s happening inside me and around me?', ''], ['p', 'Proceed mindfully: what I chose to do', '']]],
    ['tipp', 'TIPP', 'Change your body chemistry fast: Temperature (cold water on your face), Intense exercise, Paced breathing (breathe out longer than in), Paired muscle relaxation.', 'When emotions are so high you can’t think straight.', [['before', 'Distress before (0–10)', '', 's'], ['used', 'What I tried', 'Temperature|Intense exercise|Paced breathing|Paired muscle relaxation', 'm'], ['after', 'Distress after (0–10)', '', 's']]],
    ['accepts', 'ACCEPTS', 'Distract yourself until the wave passes: Activities, Contributing, Comparisons, a different Emotion, Pushing it away for now, other Thoughts, Sensations.', 'When you can’t fix it right now and need to get through.', [['used', 'What I used', 'Activities|Contributing|Comparisons|Different emotion|Pushing away|Other thoughts|Sensations', 'm'], ['did', 'What I did', '']]],
    ['soothe', 'Self-soothe', 'Comfort yourself through your five senses.', 'When you need comfort and kindness. Build your soothing kit ahead of time.', [['see', 'See', 'e.g. Photos, candles, the sky', 'i'], ['hear', 'Hear', 'e.g. A calm playlist', 'i'], ['smell', 'Smell', 'e.g. Lavender, coffee', 'i'], ['taste', 'Taste', 'e.g. Hot tea, peppermint', 'i'], ['touch', 'Touch', 'e.g. A soft blanket, a warm shower', 'i']]],
    ['improve', 'IMPROVE the moment', 'Imagery, Meaning, Prayer, Relaxation, One thing at a time, a short Vacation, Encouragement.', 'When you’re stuck in pain you can’t change right now.', [['used', 'What I used', 'Imagery|Meaning|Prayer|Relaxation|One thing at a time|Short vacation|Encouragement', 'm'], ['did', 'What I did', '']]],
    ['proscons', 'Pros and cons', 'Weigh acting on an urge against riding it out.', 'When an urge is strong and you’re tempted to act on it.', [['urge', 'The urge', 'e.g. Quit my job today', 'i'], ['ap', 'Pros of acting on it', ''], ['ac', 'Cons of acting on it', ''], ['rp', 'Pros of riding it out', ''], ['rc', 'Cons of riding it out', ''], ['dec', 'My wise-mind decision', '', 'i']]],
    ['accept', 'Radical acceptance', 'Accept reality as it is, fully, even when you don’t like it. Accepting isn’t the same as approving.', 'When you keep fighting something you can’t change.', [['fight', 'What I’m fighting against', ''], ['cant', 'What I can’t change about it', ''], ['accept', 'Accepting it would sound like…', 'e.g. “This happened. I don’t like it, and I can handle what comes next.”'], ['can', 'What I can still do', '']]]] },
  { id: 'emo', name: 'Emotion regulation', sum: 'Understanding your emotions so you feel less at their mercy.', skills: [
    ['facts', 'Check the facts', 'Ask whether your emotion, and how strong it is, fits the facts of the situation.', 'When a feeling seems bigger than the situation.', [['emo', 'The emotion and how strong (0–10)', 'e.g. Anger, 8', 'i'], ['event', 'What happened, facts only', ''], ['interp', 'What I’m telling myself about it', ''], ['other', 'Other ways to see it', ''], ['fits', 'Does my emotion fit the facts?', 'Yes|Partly|No', 'p']]],
    ['opposite', 'Opposite action', 'When an emotion doesn’t fit the facts, do the opposite of what it urges. Approach instead of avoid, be gentle instead of attack.', 'When an emotion pushes you toward something that won’t help.', [['emo', 'The emotion', '', 'i'], ['urge', 'What it urges me to do', '', 'i'], ['opp', 'The opposite action I’ll take', '', 'i'], ['after', 'How I felt after', '']]],
    ['problem', 'Problem solving', 'When your emotion does fit the facts, work on the problem itself.', 'When something real needs to change.', [['prob', 'The problem', ''], ['goal', 'What I want instead', ''], ['ideas', 'Ideas (list as many as I can)', ''], ['best', 'The best idea', '', 'i'], ['step', 'My first step', '', 'i']]],
    ['abc', 'ABC', 'Accumulate positive experiences, Build mastery (do something that makes you feel capable), and Cope ahead of hard situations.', 'Every day, to build a life that’s less vulnerable to painful emotions.', [['a', 'Accumulate: one pleasant thing I did today', '', 'i'], ['b', 'Build mastery: one thing that made me feel capable', '', 'i'], ['c', 'Cope ahead: a hard situation coming up and how I’ll handle it', '']]],
    ['please', 'PLEASE', 'Take care of your body so your emotions are easier to manage: treat PhysicaL illness, balanced Eating, Avoid mood-altering substances, balanced Sleep, get Exercise.', 'Every day. Low sleep, hunger, and illness make every emotion stronger.', [['pl', 'Took care of my physical health (meds, rest when sick)', '', 'c'], ['e', 'Ate balanced meals', '', 'c'], ['a', 'Avoided mood-altering substances', '', 'c'], ['s', 'Slept enough', '', 'c'], ['x', 'Moved my body', '', 'c'], ['note', 'Notes', '']]]] },
  { id: 'inter', name: 'Interpersonal effectiveness', sum: 'Asking for what you need and saying no, while keeping your relationships and self-respect.', skills: [
    ['dearman', 'DEAR MAN', 'For getting what you need: Describe, Express, Assert, Reinforce. Then stay Mindful, Appear confident, and Negotiate.', 'Before asking for something or saying no.', [['d', 'Describe the situation (just the facts)', 'You’ve come home late three nights this week.', 'i'], ['e', 'Express how you feel', 'I feel worried and a little lonely', 'i'], ['a', 'Assert what you want', 'I’d like a text if you’ll be past 7', 'i'], ['r', 'Reinforce: why it’s good for them too', 'Then I won’t be upset when you get home', 'i'], ['how', 'How it went', '']]],
    ['give', 'GIVE', 'For keeping the relationship: be Gentle, act Interested, Validate, use an Easy manner.', 'When the relationship matters as much as the request.', [['who', 'The person and the conversation', '', 'i'], ['g', 'How I’ll be gentle (no attacks, threats, or judging)', ''], ['i', 'How I’ll show interest', ''], ['v', 'What I can understand about their side', ''], ['e', 'How I’ll keep it easy (a smile, a light touch)', '']]],
    ['fast', 'FAST', 'For keeping your self-respect: be Fair, no extra Apologies, Stick to your values, be Truthful.', 'When you tend to give in or over-apologize.', [['sit', 'The situation', ''], ['f', 'Fair to me and to them', ''], ['a', 'What I won’t apologize for', ''], ['s', 'The value I’m standing on', '', 'i'], ['t', 'The truth I need to say', '']]]] },
];
const DBT_FEEL = ['Sad', 'Anxious', 'Angry', 'Ashamed', 'Lonely', 'Happy'];

const WORKOUTS = ['Walk', 'Run', 'Strength', 'Yoga or stretch', 'Cycling', 'Swim', 'Class', 'Sports', 'HIIT', 'Other'];
const FELT = ['Energized', 'Good', 'Tired', 'Sore', 'Proud'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DATE_IDEAS = {
  'At home': ['Cook a new recipe together', 'Movie night with a blanket fort', 'Board game or card tournament', 'Indoor picnic on the living room floor', 'Make homemade pizza', 'Stargaze from the backyard', 'Do a puzzle with music on', 'Dessert taste-test', 'Plan a dream trip together', 'Make a playlist of “our songs”', 'Look through old photos', 'Spa night at home'],
  'Out and about': ['Try a new restaurant', 'Go to a live concert', 'Visit a museum', 'Go bowling', 'Mini golf', 'Take a cooking or pottery class', 'Sunset drive', 'Coffee shop and a bookstore', 'Comedy show', 'Farmers market'],
  'Free or cheap': ['Walk a new trail', 'Picnic at a park', 'Free community event', 'Watch the sunrise', 'Visit the library', 'Bike ride', 'Volunteer together', 'Window-shop and dream'],
  'Adventure': ['Day trip to a nearby town', 'Kayaking or canoeing', 'Rock climbing gym', 'Hot springs', 'Camp for a night', 'Take a dance lesson'],
  'Seasonal': ['Pick apples or berries', 'Drive to see holiday lights', 'Ice skating', 'Fair or festival', 'Beach day', 'Bonfire and s’mores'],
};

// Quick picks: [id, label, chapters, book]. Picking a whole book shares progress with the same book in the full list.
const BIBLE_PLANS = [['John', 'Gospel of John', 21, 'John'], ['Mark', 'Gospel of Mark', 16, 'Mark'], ['Psalms30', 'Psalms 1–30', 30, 'Psalms'], ['Proverbs', 'Proverbs, a chapter a day', 31, 'Proverbs'], ['Philippians', 'Philippians', 4, 'Philippians'], ['James', 'James', 5, 'James'], ['Romans', 'Romans', 16, 'Romans'], ['Genesis', 'Genesis', 50, 'Genesis']];
const OT = [['Genesis', 50], ['Exodus', 40], ['Leviticus', 27], ['Numbers', 36], ['Deuteronomy', 34], ['Joshua', 24], ['Judges', 21], ['Ruth', 4], ['1 Samuel', 31], ['2 Samuel', 24], ['1 Kings', 22], ['2 Kings', 25], ['1 Chronicles', 29], ['2 Chronicles', 36], ['Ezra', 10], ['Nehemiah', 13], ['Esther', 10], ['Job', 42], ['Psalms', 150], ['Proverbs', 31], ['Ecclesiastes', 12], ['Song of Solomon', 8], ['Isaiah', 66], ['Jeremiah', 52], ['Lamentations', 5], ['Ezekiel', 48], ['Daniel', 12], ['Hosea', 14], ['Joel', 3], ['Amos', 9], ['Obadiah', 1], ['Jonah', 4], ['Micah', 7], ['Nahum', 3], ['Habakkuk', 3], ['Zephaniah', 3], ['Haggai', 2], ['Zechariah', 14], ['Malachi', 4]];
const NT = [['Matthew', 28], ['Mark', 16], ['Luke', 24], ['John', 21], ['Acts', 28], ['Romans', 16], ['1 Corinthians', 16], ['2 Corinthians', 13], ['Galatians', 6], ['Ephesians', 6], ['Philippians', 4], ['Colossians', 4], ['1 Thessalonians', 5], ['2 Thessalonians', 3], ['1 Timothy', 6], ['2 Timothy', 4], ['Titus', 3], ['Philemon', 1], ['Hebrews', 13], ['James', 5], ['1 Peter', 5], ['2 Peter', 3], ['1 John', 5], ['2 John', 1], ['3 John', 1], ['Jude', 1], ['Revelation', 22]];
const BOOKS = [...OT, ...NT];
const biblePlan = (id) => BIBLE_PLANS.find((p) => p[0] === id) || (BOOKS.find((b) => b[0] === id) ? [id, id, BOOKS.find((b) => b[0] === id)[1], id] : BIBLE_PLANS[0]);
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
const ENV_AREAS = [
  { id: 'home', short: 'Peaceful home', name: 'A peaceful home', color: '#1E9E78', q: 'How peaceful does my home feel?', intro: 'Your space shapes your mood. Small touches make a home feel calm and like yours.',
    acts: ['Let natural light in', 'Opened a window for fresh air', 'Kept one calm corner clear', 'Put something I love where I can see it', 'Used soft lighting in the evening', 'Added a pleasant smell (candle, plants, fresh air)', 'Played calming music at home'], own: 'One change that would bring more peace', ownPh: 'e.g. A lamp by my reading chair' },
  { id: 'nature', short: 'Nature', name: 'Time with nature', color: '#5BAE3C', q: 'How connected to nature do I feel?', intro: 'People are calmer and more grounded with a little nature every day, even a few minutes.',
    acts: ['Stepped outside in the sun', 'Cared for a plant or garden', 'Noticed the season changing', 'Ate a meal outside', 'Watched the sky (sunrise, sunset, stars)', 'Brought something natural inside', 'Walked somewhere green'], own: 'My favorite place in nature', ownPh: 'e.g. The lake trail near home' },
  { id: 'earth', short: 'Caring for the world', name: 'Caring for the world', color: '#2A9FD8', q: 'How well am I caring for the world around me?', intro: 'Small, steady habits add up, for the planet and your community.',
    acts: ['Used a reusable bag or bottle', 'Cut down on food waste', 'Turned off lights and unplugged things', 'Recycled or composted', 'Bought something used or local', 'Picked up litter', 'Helped someone in my community'], own: 'One habit I want to build', ownPh: 'e.g. Bring my own coffee cup' },
];

export function makeMore(h) {
  const { getP, setP, save, rerenderKeep, inp, area, chk, pick, out, esc, icon, num, fmtDate, entriesList, saveBtn, kv, T, TODAY, toast, api, uid, key, addMonths, P, ui, fromKey } = h;
  const scale = (path, lo, hi, l1, l2) => `<div class="scale" style="grid-template-columns:repeat(${hi - lo + 1},1fr)">${Array.from({ length: hi - lo + 1 }, (_, i) => i + lo).map((i) => `<button type="button" data-r="pick" data-path="${path}" data-v="${i}" aria-pressed="${String(getP(path)) === String(i)}">${i}</button>`).join('')}</div><div class="scale-l"><span>${l1}</span><span>${l2}</span></div>`;
  // Several-choice chips plus options the person added themselves (saved at customPath for next time)
  const pickOwn = (path, base, customPath, ph) => {
    const own = getP(customPath) || [], sel = getP(path) || [];
    const chip = (o, mine) => `<button type="button" class="chip" data-r="pick" data-path="${esc(path)}" data-v="${esc(o)}" data-multi aria-pressed="${sel.includes(o)}">${esc(o)}</button>${mine ? `<button type="button" class="chip-x" data-r="ownrm" data-path="${esc(customPath)}" data-v="${esc(o)}" aria-label="Remove ${esc(o)} from my options">×</button>` : ''}`;
    return `<div class="chips" role="group">${base.map((o) => chip(o, false)).join('')}${own.map((o) => `<span class="chip-own">${chip(o, true)}</span>`).join('')}</div>
      <form class="row addown" data-r-form="addown" data-list="${esc(customPath)}" data-sel="${esc(path)}"><input type="text" placeholder="${esc(ph)}" aria-label="${esc(ph)}" maxlength="60"><button class="btn small" type="submit">Add</button></form>`;
  };
  const card = (title, body, extra = '') => `<section class="card"${extra}><h2>${title}</h2><div class="rule"></div>${body}</section>`;
  const lbl = (t, first) => `<label class="lbl"${first ? '' : ' style="margin-top:10px"'}>${t}</label>`;
  const sum = (items) => `<section class="card"><div class="sumgrid">${items.map(([k, v, c]) => `<div><div class="k">${k}</div><div class="v"${c ? ` style="color:${c}"` : ''}>${v}</div></div>`).join('')}</div></section>`;
  const tags = (arr) => (arr && arr.length ? `<div class="sk-meta" style="margin-top:6px">${arr.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : '');
  const goalBtn = (g, label) => `<button class="btn" style="margin-top:12px" data-r="mgoal" data-g="${esc(JSON.stringify(g))}">${label}</button>`;
  const crisis = '<p class="note">If you’re in crisis or thinking about hurting yourself, call or text <b>988</b> (Suicide & Crisis Lifeline, US) any time, day or night.</p>' + hotlinesHTML(esc);
  // Weeks run Sunday to Saturday
  const weekStartKey = () => { const d = new Date(TODAY); d.setDate(d.getDate() - d.getDay()); return key(d); };
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
      ${lbl('What I noticed in my body')}${pickOwn('anxiety.draft.body', BODY_SIGNS, 'anxiety.own.body', 'Something else? Add your own')}
      ${lbl('What was I worried would happen?')}${area('anxiety.draft.worry', 'e.g. “I’ll say something wrong and they’ll think I’m stupid.”', 2)}
      ${lbl('What I did to cope')}${pickOwn('anxiety.draft.help', ANX_HELP, 'anxiety.own.help', 'Add your own coping skill')}
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
  const dbtField = (sk, [k, label, ph, kind = 'a']) => {
    const path = `dbt.pd.${sk}.${k}`;
    if (kind === 'c') return `<div style="margin-top:12px">${chk(path, esc(label))}</div>`;
    const head = `<label class="lbl" style="margin-top:14px">${esc(label)}</label>`;
    if (kind === 'i') return head + inp(path, { ph });
    if (kind === 's') return head + scale(path, 0, 10, 'None', 'Extreme');
    if (kind.startsWith('p:') || kind === 'p') return head + pick(path, (kind === 'p' ? ph : kind.slice(2)).split('|'));
    if (kind === 'm') return head + pick(path, ph.split('|'), true);
    return head + area(path, ph, 2);
  };
  const dbtFind = (id) => { for (const m of DBT_MODS) { const s = m.skills.find((x) => x[0] === id); if (s) return [m, s]; } return [DBT_MODS[0], DBT_MODS[0].skills[0]]; };
  const DBT = {
    render() {
      const all = DBT_MODS.flatMap((m) => m.skills.map((s) => s[1]));
      const modId = ui.dbtMod || 'mind', mod = DBT_MODS.find((m) => m.id === modId);
      const skId = ui.dbtSkill && mod.skills.some((x) => x[0] === ui.dbtSkill) ? ui.dbtSkill : mod.skills[0][0];
      const [, [id, name, what, when, fields]] = dbtFind(skId);
      const practiced = getP('dbt.practice') || [];
      return `<div class="stack dbt">
    <section class="card"><p style="margin:0">DBT (Dialectical Behavior Therapy) teaches four sets of skills for handling strong emotions and relationships. Pick a skill below to learn it and practice it. DBT works best alongside a trained therapist, so bring this to your sessions.</p>${crisis}</section>
    <section class="card"><h2>Practice a skill</h2><div class="rule"></div>
      <label class="lbl" style="margin-top:0">1. Choose a skill set</label>
      <div class="dbt-mods">${DBT_MODS.map((m) => `<button data-r="dbtmod" data-v="${m.id}" aria-pressed="${m.id === modId}"><b>${m.name}</b><small>${m.sum}</small></button>`).join('')}</div>
      <label class="lbl" style="margin-top:18px">2. Choose a skill</label>
      <div class="chips">${mod.skills.map((x) => `<button class="chip" data-r="dbtskill" data-v="${x[0]}" aria-pressed="${x[0] === skId}">${esc(x[1])}</button>`).join('')}</div>
      <div class="dbt-skill" id="dbt-skill">
        <div class="pill" style="color:${P.mental.color}">${esc(mod.name)}</div>
        <h3 class="dbt-name">${esc(name)}</h3>
        <p style="margin:6px 0 0">${esc(what)}</p>
        <p class="sub" style="margin:8px 0 0"><b>Use it:</b> ${esc(when)}</p>
        <div class="dbt-try"><b>Try it now</b>${fields.filter((f) => !(id === 'dearman' && f[0] === 'how')).map((f) => dbtField(id, f)).join('')}
        ${id === 'dearman' ? `<div class="summary" style="margin-top:14px">${out('dbt-dm')}</div><p class="hint">Then stay Mindful (don’t get pulled off topic), Appear confident, and be willing to Negotiate.</p>${dbtField(id, fields.find((f) => f[0] === 'how'))}` : ''}
        <button class="btn primary wide" style="margin-top:16px" data-r="dbtsave" data-v="${id}">Save this practice</button></div>
      </div></section>
    ${card('Today’s diary card', `<p class="sub" style="margin-top:0">Rate each feeling from 0 (none) to 5 (very strong).</p>
      ${DBT_FEEL.map((f) => `<div class="dbt-feel"><span>${f}</span>${scale(`dbt.draft.f.${f}`, 0, 5, '', '').replace(/<div class="scale-l">.*?<\/div>$/, '')}</div>`).join('')}
      ${lbl('Urges I noticed')}${area('dbt.draft.urges', 'e.g. Wanted to shut down, yell, isolate…', 2)}
      ${lbl('Skills I used today')}${pick('dbt.draft.skills', all, true)}
      ${lbl('What helped most')}${inp('dbt.draft.best', { ph: '' })}
      ${saveBtn('dbt', 'Save diary card')}`)}
    ${card('My practice log', practiced.length ? practiced.slice().reverse().map((e, ri) => { const i = practiced.length - 1 - ri; const [, sk] = dbtFind(e.skill); return `<div class="entry"><div class="card-head" style="margin-bottom:4px"><span class="goal-meta"><b style="color:var(--ink)">${esc(sk[1])}</b> · ${fmtDate(e.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span><button class="x" data-r="del" data-path="dbt.practice" data-i="${i}" aria-label="Delete">×</button></div>${sk[4].map(([k, l, , kind = 'a']) => { const v = e.a[k]; if (v === undefined || v === '' || v === false || (Array.isArray(v) && !v.length)) return ''; return kv(l, kind === 'c' ? '✓ Yes' : Array.isArray(v) ? v.join(', ') : String(v)); }).join('')}</div>`; }).join('') : '<p class="empty">Skills you practice will show up here.</p>')}
    ${card('Past diary cards', entriesList('dbt', (e) => { const f = Object.entries(e.f || {}).filter(([, v]) => v !== '' && +v > 0); return `${f.length ? `<p class="goal-meta" style="margin:0">${f.map(([k, v]) => `${esc(k)} ${esc(v)}`).join(' · ')}</p>` : ''}${kv('Urges', e.urges)}${tags(e.skills)}${kv('Helped most', e.best)}`; }, 'Your diary cards will show up here.'))}</div>`;
    },
    outs() { const g = (k) => (getP('dbt.pd.dearman.' + k) || '').trim(); const [d, e, a, r] = ['d', 'e', 'a', 'r'].map(g); return { 'dbt-dm': d || e || a ? [d && d.replace(/\.?$/, '.'), e && `${e}.`, a && `${a}.`, r && `${r}.`].filter(Boolean).join(' ') : 'Your script will appear here.' }; },
  };

  /* ---------- Fitness ---------- */
  const FITNESS = {
    render() {
      const es = getP('fitness.entries') || [], m = weekStartKey();
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
  const bibleReading = () => { const r = getP('bible.reading'); if (Array.isArray(r)) return r; const old = getP('bible.plan'); return old ? [old] : ['John']; };
  const BIBLE = {
    render() {
      const reading = bibleReading();
      const books = reading.map((id) => { const pl = biblePlan(id), read = getP(`bible.read.${pl[0]}`) || []; return { pl, read, nxt: Array.from({ length: pl[2] }, (_, i) => i + 1).find((c) => !read.includes(c)) }; });
      const cur = books.find((x) => x.nxt) || books[0];
      const vs = getP('bible.verses') || [];
      const bookCard = ({ pl, read, nxt }) => `<div class="bbook"><div class="card-head" style="margin:0 0 6px"><b>${esc(pl[1])}</b><span class="row" style="gap:4px;align-items:center"><span class="sub" ${nxt ? '' : 'style="color:var(--good);font-weight:600"'}>${nxt ? `${read.length} of ${pl[2]}` : '✓ Finished'}</span><button class="x" data-r="brm" data-v="${esc(pl[0])}" aria-label="Remove ${esc(pl[1])} from my list">×</button></span></div>
        <div class="bar" style="height:8px;margin:0 0 10px"><span style="width:${(read.length / pl[2]) * 100}%;background:${P.spiritual.color}"></span></div>
        <div class="chips">${Array.from({ length: pl[2] }, (_, i) => i + 1).map((c) => `<button class="chip" style="min-width:42px;justify-content:center" data-r="bch" data-p="${esc(pl[0])}" data-v="${c}" aria-pressed="${read.includes(c)}" aria-label="${esc(pl[3])} chapter ${c}">${c}</button>`).join('')}</div>
        ${nxt ? `<p class="hint" style="margin-bottom:0">Next up: <b>${esc(pl[3])} ${nxt}</b></p>` : ''}</div>`;
      return `<div class="stack">
    ${card('Books I’m reading', `${books.length ? `<p class="sub" style="margin-top:0">Tap a chapter when you’ve read it.</p>${books.map(bookCard).join('')}` : '<p class="empty" style="margin-top:0">Add a book below to start reading.</p>'}
      <label class="lbl" for="bb-add" style="margin-top:14px">Add a book</label>
      <select id="bb-add" data-bible-add><option value="">Choose a book…</option>${[['Old Testament', OT], ['New Testament', NT]].map(([g, l]) => `<optgroup label="${g}">${l.map(([bk, n]) => `<option value="${esc(bk)}" ${reading.includes(bk) ? 'disabled' : ''}>${esc(bk)} (${n} chapter${n === 1 ? '' : 's'})${reading.includes(bk) ? ' ✓' : ''}</option>`).join('')}</optgroup>`).join('')}</select>
      ${goalBtn({ pillar: 'spiritual', title: 'Read my Bible', type: 'habit', count: 1, per: 'day', unit: 'chapters', months: 2 }, 'Add a daily reading goal')}`)}
    ${card('Study a passage (SOAP)', `<p class="sub" style="margin-top:0">A simple way to study: Scripture, Observation, Application, Prayer.</p>
      ${lbl('Passage', 1)}${inp('bible.draft.ref', { ph: cur ? `e.g. ${cur.pl[3]} ${cur.nxt || 1}` : 'e.g. John 3' })}
      ${lbl('<span class="letter">S</span>Scripture: the verse that stood out')}${area('bible.draft.s', 'Write it out word for word', 2)}
      ${lbl('<span class="letter">O</span>Observation: what does it say?')}${area('bible.draft.o', 'Who, what, when, where, why?', 2)}
      ${lbl('<span class="letter">A</span>Application: how does it apply to my life?')}${area('bible.draft.a', '', 2)}
      ${lbl('<span class="letter">P</span>Prayer')}${area('bible.draft.p', 'A short prayer in response', 2)}
      ${saveBtn('bible', 'Save study')}`)}
    ${(() => { const sd = getP('bible.sd') || {}, ser = getP('bible.sermons') || [], ed = ui.sermEdit != null;
      return card(ed ? 'Edit notes' : 'Sermon & study notes', `<p class="sub" style="margin-top:0">For church, a Bible study group, a podcast, or your own reading. Write as much as you like.</p>
      <div class="grid2b"><label>Date<input type="date" data-b="bible.sd.d" value="${esc(sd.d || T)}"></label><label>Passage${inp('bible.sd.ref', { ph: 'e.g. Romans 8:28-39' })}</label></div>
      ${lbl('Title or topic')}${inp('bible.sd.title', { ph: 'e.g. Faith over fear' })}
      ${lbl('Speaker, church, or group')}${inp('bible.sd.who', { ph: 'e.g. Pastor Mike, Grace Church' })}
      ${lbl('Notes')}${area('bible.sd.notes', 'Main points, verses, quotes, anything that stood out…', 8)}
      ${lbl('Key takeaway')}${area('bible.sd.take', 'The one thing I want to remember', 2)}
      ${lbl('This week I will…')}${inp('bible.sd.apply', { ph: 'One way to live it out' })}
      ${lbl('Prayer')}${area('bible.sd.prayer', 'A short prayer in response', 2)}
      <div class="row" style="justify-content:space-between;margin-top:12px;flex-wrap:wrap;gap:8px">${ed ? '<button class="btn ghost small" data-r="sermcancel">Cancel</button>' : '<span></span>'}<button class="btn primary" data-r="sermsave">${ed ? 'Save changes' : 'Save notes'}</button></div>
      ${ser.length ? `<h3 class="h3" style="margin-top:20px">My notes (${ser.length})</h3>${ser.map((x, i) => [x, i]).reverse().map(([x, i]) => `<details class="card fold sermon"><summary><span><b>${esc(x.title || x.ref || 'Notes')}</b><small class="sub" style="display:block">${fmtDate(x.d, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}${x.who ? ' · ' + esc(x.who) : ''}${x.ref && x.title ? ' · ' + esc(x.ref) : ''}</small></span></summary>
        ${x.notes ? `<p style="white-space:pre-wrap;margin:0 0 8px">${esc(x.notes)}</p>` : ''}${kv('Key takeaway', x.take)}${kv('This week I will', x.apply)}${kv('Prayer', x.prayer)}
        <div class="row" style="justify-content:space-between;margin-top:10px"><button class="linkish" data-r="del" data-path="bible.sermons" data-i="${i}">Delete</button><button class="btn small" data-r="sermedit" data-i="${i}">Edit</button></div></details>`).join('')}` : ''}`); })()}
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
      const old = (getP('growth.areas') || '').trim(), areas = getP('growth.areaList') || (old ? [old] : []);
      const goals = getP('growth.goals') || [];
      const dayOf = (start) => Math.min(90, Math.max(1, Math.floor((TODAY - fromKey(start)) / 864e5) + 1));
      const goalCard = (g, i) => { const done = (g.ms || []).filter((m) => m.t && m.done).length, tot = (g.ms || []).filter((m) => m.t).length;
        return `<div class="bbook"><div class="card-head" style="margin:0 0 4px"><b style="font-size:16px">${esc(g.goal)}</b><button class="x" data-r="del" data-path="growth.goals" data-i="${i}" aria-label="Delete this goal">×</button></div>
        <p class="goal-meta" style="margin:0 0 8px">Started ${fmtDate(g.start, { month: 'short', day: 'numeric' })} · day ${dayOf(g.start)} of 90${tot ? ` · ${done} of ${tot} milestones` : ''}</p>
        <div class="bar" style="height:8px;margin:0 0 10px"><span style="width:${(dayOf(g.start) / 90) * 100}%;background:${P.intellectual.color}"></span></div>
        ${(g.ms || []).map((m, j) => (m.t ? `<div style="margin-top:6px">${chk(`growth.goals.${i}.ms.${j}.done`, `<span class="sub">${['Day 30', 'Day 60', 'Day 90'][j]}:</span> ${esc(m.t)}`, true)}</div>` : '')).join('')}
        ${kv('Why it matters', g.why)}${kv('Each week', g.weekly)}
        ${goalBtn({ pillar: 'intellectual', title: g.goal.slice(0, 200), type: 'target', count: 1, per: 'day', target: 1, unit: 'done', months: 3, why: g.why || '' }, 'Add to my WellWheel goals')}</div>`; };
      return `<div class="stack">
    <section class="card"><p style="margin:0">Growth happens in small, steady steps. Know your strengths, pick one area to grow, and give it 90 focused days.</p></section>
    ${card('My strengths', `<p class="sub" style="margin-top:0">Choose the ones that sound like you. Ask a friend if you’re not sure.</p>${pickOwn('growth.str', STRENGTHS, 'growth.ownStr', 'Add your own strength')}`)}
    ${card('Areas I want to grow in', `<form class="row" data-r-form="garea"><input type="text" id="ga-new" placeholder="e.g. Discipline, speaking up, managing my time" aria-label="An area I want to grow in" maxlength="120"><button class="btn primary" type="submit">Add</button></form>
      ${areas.length ? `<div class="chips" style="margin-top:12px">${areas.map((t, i) => `<span class="chip-own"><span class="chip static">${esc(t)}</span><button type="button" class="chip-x" data-r="garm" data-i="${i}" aria-label="Remove ${esc(t)}">×</button></span>`).join('')}</div>` : '<p class="empty" style="margin-bottom:0">Add the areas you want to work on. They’ll stay here.</p>'}`)}
    ${goals.length ? card('My growth goals', goals.map(goalCard).join('')) : ''}
    ${card(goals.length ? 'Add another 90-day goal' : 'My 90-day growth goal', `${lbl('In 90 days, I want to…', 1)}${inp('growth.gd.goal', { ph: 'e.g. Finish an online Excel course' })}
      ${lbl('Why it matters to me')}${area('growth.gd.why', '', 2)}
      ${lbl('Milestones')}${[0, 1, 2].map((i) => `<div style="margin-bottom:8px">${inp(`growth.gd.ms.${i}`, { ph: ['By day 30…', 'By day 60…', 'By day 90…'][i] })}</div>`).join('')}
      ${lbl('What I’ll do each week')}${area('growth.gd.weekly', 'e.g. Two 30-minute lessons on Tuesday and Saturday mornings', 2)}
      <button class="btn primary wide" style="margin-top:14px" data-r="gsave">Save this goal</button>`)}
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

  /* ---------- Environment in balance ---------- */
  const ENV = {
    render() {
      const wk = weekStartKey(), done = (a) => a.acts.filter((_, i) => getP(`env.wk.${wk}.${a.id}.${i}`)).length;
      const rows = ENV_AREAS.map((a) => ({ a, n: done(a) }));
      const low = rows.slice().sort((x, y) => x.n - y.n)[0], hi = Math.max(...rows.map((r) => r.n));
      const es = getP('env.entries') || [];
      return `<div class="stack">
    <section class="card"><p style="margin:0">Environmental wellness is about balance between three things: a home that feels peaceful, time with nature, and caring for the world around you. You don’t need to do it all. Aim for a little of each.</p></section>
    ${card('This week’s balance', `<div class="hbars envbars">${rows.map(({ a, n }) => `<div class="hb"><span class="hb-l">${a.short}</span><span class="hb-t"><span style="width:${Math.max(n ? 4 : 0, (n / a.acts.length) * 100)}%;background:${a.color}"></span></span><span class="hb-v">${n} of ${a.acts.length}</span></div>`).join('')}</div>
      <p class="hint" style="margin-bottom:0">${hi === 0 ? 'Check off things below as you do them this week. The list starts fresh every Sunday.' : low.n === hi ? 'Nicely balanced this week. Keep it up!' : `<b>${low.a.name}</b> could use a little attention this week. Try one small thing below.`}</p>`)}
    ${ENV_AREAS.map((a) => `<section class="card"><div class="envsec" style="--c:${a.color}"><h2>${a.name}</h2><p class="sub" style="margin:6px 0 0">${a.intro}</p>
      <label class="lbl" style="margin-top:16px">This week I…</label><div class="stack" style="gap:8px">${a.acts.map((t, i) => chk(`env.wk.${wk}.${a.id}.${i}`, esc(t), true)).join('')}</div>
      <label class="lbl" style="margin-top:16px">${a.own}</label>${inp(`env.own.${a.id}`, { ph: a.ownPh })}</div></section>`).join('')}
    ${card('Monthly check-in', `<p class="sub" style="margin-top:0">Once a month, rate how each area feels.</p>
      ${ENV_AREAS.map((a) => `<label class="lbl" style="margin-top:14px">${a.q}</label>${scale(`env.draft.${a.id}`, 0, 10, 'Not at all', 'Very')}`).join('')}
      <label class="lbl" style="margin-top:14px">What I want to change next month</label>${area('env.draft.note', '', 2)}
      ${saveBtn('env', 'Save check-in')}`)}
    ${es.length ? card('Past check-ins', entriesList('env', (e) => `<div class="sk-meta">${ENV_AREAS.map((a) => (e[a.id] !== undefined && e[a.id] !== '' ? `<span class="tag" style="color:${a.color}">${a.name}: ${esc(e[a.id])}/10</span>` : '')).join('')}</div>${kv('Next month', e.note)}`, '')) : ''}
    ${card('Make it a habit', `<p style="margin-top:0">Put a little balance on your Today page.</p><div class="row" style="flex-wrap:wrap;gap:8px">${goalBtn({ pillar: 'environmental', title: 'Spend time in nature', type: 'habit', count: 3, per: 'week', unit: 'times', months: 2 }, 'Nature 3 times a week')}${goalBtn({ pillar: 'environmental', title: 'One small eco habit a day', type: 'habit', count: 1, per: 'day', unit: 'times', months: 2 }, 'One eco habit a day')}</div>`)}</div>`;
    },
  };

  const tools = [
    { id: 'anxiety', pillar: 'mental', title: 'Anxiety Management Workbook', desc: 'Calm your body, sort your worries, and face fears step by step.', tool: ANXIETY },
    { id: 'dbt', pillar: 'mental', title: 'DBT Skills Workbook', desc: 'Diary card, the four DBT skill sets, and a DEAR MAN script builder.', tool: DBT },
    { id: 'fitness', pillar: 'physical', title: 'Fitness Planner', desc: 'Plan your week, log workouts, and track minutes and personal bests.', tool: FITNESS },
    { id: 'datenight', pillar: 'relationships', title: 'Date Night Planner', desc: 'Idea bank, a “surprise me” button, a date list, budget, and memories.', tool: DATENIGHT },
    { id: 'bible', pillar: 'spiritual', title: 'Bible Study Workbook', desc: 'Reading plans, SOAP study, and memory verses.', tool: BIBLE },
    { id: 'growth', pillar: 'intellectual', title: 'Personal Development Workbook', desc: 'Your strengths, a 90-day growth goal, a learning list, and weekly reflection.', tool: GROWTH },
    { id: 'env', pillar: 'environmental', title: 'Environment in Balance', desc: 'A peaceful home, time with nature, and caring for the world, with a weekly balance check.', tool: ENV },
    { id: 'home', pillar: 'environmental', title: 'Home Reset Checklist', desc: 'A daily 10-minute reset, room-by-room checklists, and a declutter tally.', tool: HOME },
  ];

  const click = (a, b) => {
    if (a === 'mgoal') {
      const g = JSON.parse(b.dataset.g); const months = g.months || 3; delete g.months;
      api.addGoal({ why: '', sure: 7, ...g, id: uid(), deadline: key(addMonths(TODAY, months)) }, 0); toast('Added to your goals'); return true;
    }
    if (a === 'ownrm') { setP(b.dataset.path, (getP(b.dataset.path) || []).filter((x) => x !== b.dataset.v)); save(); rerenderKeep(); return true; }
    if (a === 'garm') { const old = (getP('growth.areas') || '').trim(); const l = getP('growth.areaList') || (old ? [old] : []); l.splice(+b.dataset.i, 1); setP('growth.areaList', l); save(); rerenderKeep(); return true; }
    if (a === 'gsave') { const d = getP('growth.gd') || {}; const goal = (d.goal || '').trim(); if (!goal) { toast('Write your 90-day goal first'); return true; } const l = getP('growth.goals') || []; l.push({ goal, why: (d.why || '').trim(), weekly: (d.weekly || '').trim(), start: T, ms: [0, 1, 2].map((i) => ({ t: ((d.ms || {})[i] || '').trim(), done: false })) }); setP('growth.goals', l); setP('growth.gd', {}); save(); rerenderKeep(); toast('Goal saved'); return true; }
    if (a === 'dbtmod') { ui.dbtMod = b.dataset.v; ui.dbtSkill = ''; rerenderKeep(); return true; }
    if (a === 'dbtskill') { ui.dbtSkill = b.dataset.v; rerenderKeep(); return true; }
    if (a === 'dbtsave') { const id = b.dataset.v, d = getP(`dbt.pd.${id}`) || {}; const filled = Object.values(d).some((v) => (Array.isArray(v) ? v.length : v === true || String(v || '').trim())); if (!filled) { toast('Fill in at least one part first'); return true; } const l = getP('dbt.practice') || []; l.push({ skill: id, date: T, a: d }); setP('dbt.practice', l); setP(`dbt.pd.${id}`, {}); save(); rerenderKeep(); toast('Practice saved'); return true; }
    if (a === 'sermsave') { const d = { ...(getP('bible.sd') || {}) }; if (!['title', 'ref', 'notes', 'take', 'apply', 'prayer'].some((k) => String(d[k] || '').trim())) { toast('Write something first'); return true; } d.d = d.d || T; const l = getP('bible.sermons') || []; if (ui.sermEdit != null) l[ui.sermEdit] = d; else l.push(d); setP('bible.sermons', l); setP('bible.sd', {}); const was = ui.sermEdit != null; ui.sermEdit = null; save(); rerenderKeep(); toast(was ? 'Notes updated' : 'Notes saved'); return true; }
    if (a === 'sermedit') { ui.sermEdit = +b.dataset.i; setP('bible.sd', { ...(getP('bible.sermons') || [])[ui.sermEdit] }); save(); rerenderKeep(); document.querySelector('[data-b="bible.sd.title"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; }
    if (a === 'sermcancel') { ui.sermEdit = null; setP('bible.sd', {}); save(); rerenderKeep(); return true; }
    if (a === 'dncat') { ui.dnCat = b.dataset.v; rerenderKeep(); return true; }
    if (a === 'dnrand') { const all = Object.values(DATE_IDEAS).flat(); let t; do { t = all[Math.floor(Math.random() * all.length)]; } while (t === ui.dnIdea); ui.dnIdea = t; rerenderKeep(); return true; }
    if (a === 'dnadd') { const l = getP('datenight.list') || []; const t = b.dataset.v; const i = l.findIndex((x) => x.t === t && !x.done); if (i >= 0) { l.splice(i, 1); toast('Removed from your list'); } else { l.push({ t }); toast('Added to your list'); } if (ui.dnIdea === t) ui.dnIdea = ''; setP('datenight.list', l); save(); rerenderKeep(); return true; }
    if (a === 'bch') { const p = `bible.read.${b.dataset.p}`; const r = [...(getP(p) || [])]; const c = +b.dataset.v, i = r.indexOf(c); i < 0 ? r.push(c) : r.splice(i, 1); setP(p, r); save(); rerenderKeep(); return true; }
    if (a === 'brm') { setP('bible.reading', bibleReading().filter((x) => x !== b.dataset.v)); save(); rerenderKeep(); toast('Removed. Your progress is kept if you add it back.'); return true; }
    if (a === 'bmem') { const v = getP('bible.verses'); const x = v[+b.dataset.i]; x.m = !x.m; setP('bible.verses', v); save(); rerenderKeep(); if (x.m) toast('Memorized!'); return true; }
    if (a === 'lstat') { setP(`growth.learn.${b.dataset.i}.s`, b.dataset.v); save(); rerenderKeep(); return true; }
    if (a === 'homeclr') { setP(`home.rooms.${b.dataset.v}`, {}); save(); rerenderKeep(); return true; }
    if (a === 'tally') { const p = 'home.tally.' + b.dataset.k; setP(p, Math.max(0, num(getP(p)) + +b.dataset.v)); save(); rerenderKeep(); return true; }
    if (a === 'tallyclr') { setP('home.tally', {}); save(); rerenderKeep(); return true; }
    return false;
  };
  const submit = (form, root, f) => {
    if (form === 'addown') { const el = f.querySelector('input'), t = el.value.trim(); if (!t) return true; const own = getP(f.dataset.list) || []; if (!own.some((x) => x.toLowerCase() === t.toLowerCase())) own.push(t); setP(f.dataset.list, own); const sel = getP(f.dataset.sel) || []; if (!sel.includes(t)) sel.push(t); setP(f.dataset.sel, sel); save(); rerenderKeep(); toast('Added. It’ll be here next time too.'); return true; }
    const val = (id) => { const el = root.querySelector('#' + id); return el ? el.value.trim() : ''; };
    const push = (path, item) => { const l = getP(path) || []; l.push(item); setP(path, l); save(); rerenderKeep(); };
    if (form === 'garea') { const t = val('ga-new'); if (t) { const old = (getP('growth.areas') || '').trim(); const l = getP('growth.areaList') || (old ? [old] : []); l.push(t); setP('growth.areaList', l); save(); rerenderKeep(); root.querySelector('#ga-new')?.focus(); } return true; }
    if (form === 'worry') { const t = val('wr-new'); if (t) push('anxiety.worries', { t, d: T }); root.querySelector('#wr-new')?.focus(); return true; }
    if (form === 'dn') { const t = val('dn-new'); if (t) push('datenight.list', { t }); return true; }
    if (form === 'bverse') { const r = val('bv-ref'), t = val('bv-txt'); if (r || t) push('bible.verses', { r: r || 'Verse', t }); return true; }
    if (form === 'learn') { const t = val('ln-new'); if (t) push('growth.learn', { t, type: val('ln-type'), s: 'Want' }); root.querySelector('#ln-new')?.focus(); return true; }
    return false;
  };
  const change = (el) => {
    if (el.hasAttribute('data-bible-add') && el.value) { const r = bibleReading(); if (!r.includes(el.value)) r.push(el.value); setP('bible.reading', r); save(); rerenderKeep(); return true; }
    return false;
  };
  const outs = { dbt: DBT.outs };
  return { tools, click, submit, change, outs };
}
