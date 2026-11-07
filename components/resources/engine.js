// The Resources worksheets, carried over from the WellWheel prototype.
// mountResources() draws into one container and saves through the `api` it is given.
import { P, ICONS } from '@/lib/data';
import { key, fromKey, addMonths, pad, fmtDate as fmtD, uid } from '@/lib/core';
import {
  SPEND_CATS, INC_KEYS, SAVE_KEYS, EF_WAYS, ASSETS, LIABS, BOOKS, COPING_CATS, COPING, BURN,
  SLEEP_FACTORS, MEALS, WEEK, AISLES, TRAPS, STARTERS, LOVE, VALUES, SOON,
} from './content';
import { makeMore } from './more';

// Which saved record each worksheet uses
const STORE_KEY = { networth: 'nw', burnout: 'burn' };

export function mountResources(root, api) {
  /* ---------- environment ---------- */
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const T = key(TODAY);
  const tools = JSON.parse(JSON.stringify(api.tools || {}));
  const ui = { tool: (api.intent && api.intent.tool) || null, joint: !!(api.intent && api.intent.joint && api.couple) };
  // Shared with a partner: the Couples Workbook, and the money planner's "Our plan"
  const couple = api.couple || null;
  const jointTools = JSON.parse(JSON.stringify(api.coupleData || {}));
  const MONEY_KEYS = new Set(['monthly', 'spending', 'efund', 'debt', 'nw']);
  const rootFor = (seg) => (couple && (seg === 'couples' || (ui.tool === 'money' && ui.joint && MONEY_KEYS.has(seg))) ? jointTools : tools);
  const dirty = new Set(); let timer = null;
  const fmtDate = (k, o) => (k ? fmtD(k, o) : '');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id]}</svg>`;
  const toast = (m) => api.toast(m);
  const partnerName = () => api.partnerName ? api.partnerName() : '';

  /* ---------- saving ---------- */
  const setSaveState = (txt, cls) => { const el = root.querySelector('[data-savestate]'); if (el) { el.textContent = txt; el.className = 'savestate ' + (cls || ''); } };
  const flush = () => { clearTimeout(timer); timer = null; dirty.forEach((k) => { if (k.startsWith('c:')) { const j = k.slice(2); if (jointTools[j] !== undefined) api.persistCouple(j, jointTools[j]); } else if (tools[k] !== undefined) api.persist(k, tools[k]); }); const had = dirty.size; dirty.clear(); if (had) setSaveState('✓ All changes saved', 'ok'); };
  const curKey = () => { const k = ui.tool === 'money' ? null : ui.tool ? STORE_KEY[ui.tool] || ui.tool : null; return k && rootFor(k) === jointTools ? 'c:' + k : k; };
  const save = () => { const k = curKey(); if (k) dirty.add(k); setSaveState('Saving…'); clearTimeout(timer); timer = setTimeout(flush, 800); };

  /* ---------- form helpers ---------- */
  const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[$,]/g, '')); return isFinite(n) ? n : 0; };
  const money = (n) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: (Math.round(n * 100) % 100) ? 2 : 0, maximumFractionDigits: 2 });
  const getP = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), rootFor(path.split('.')[0]));
  const setP = (path, val) => { const ks = path.split('.'); const root = rootFor(ks[0]); dirty.add((root === jointTools ? 'c:' : '') + ks[0]); let o = root; ks.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }); o[ks[ks.length - 1]] = val; };
  const inp = (path, { type = 'text', ph = '', cls = '', rr = false, attrs = '' } = {}) => `<input type="${type}" ${type === 'number' ? 'step="any" inputmode="decimal"' : ''} class="${cls}" data-b="${esc(path)}" ${rr ? 'data-rr' : ''} value="${esc(getP(path) ?? '')}" placeholder="${esc(ph)}" aria-label="${esc(ph || path.split('.').pop())}" ${attrs}>`;
  const area = (path, ph = '', rows = 3) => `<textarea data-b="${esc(path)}" rows="${rows}" placeholder="${esc(ph)}" aria-label="${esc(ph || 'Notes')}">${esc(getP(path) ?? '')}</textarea>`;
  const chk = (path, label, rr = false) => `<label class="ck"><input type="checkbox" data-b="${esc(path)}" ${rr ? 'data-rr' : ''} ${getP(path) ? 'checked' : ''}><span>${label}</span></label>`;
  const pick = (path, opts, multi = false) => `<div class="chips" role="group">${opts.map((o) => { const v = getP(path); const on = multi ? Array.isArray(v) && v.includes(o) : v === o; return `<button type="button" class="chip" data-r="pick" data-path="${esc(path)}" data-v="${esc(o)}" ${multi ? 'data-multi' : ''} aria-pressed="${on}">${esc(o)}</button>`; }).join('')}</div>`;
  const out = (name) => `<span data-o="${name}"></span>`;
  const toolHead = (r) => { const p = P[r.pillar]; const back = api.home === r.id ? '' : `<button class="linkish" data-r="back">← ${api.home ? 'My portfolio' : 'Resources'}</button>`; return `<header class="top"><div>${back}<div class="brand" style="margin-top:${api.home === r.id ? 0 : 10}px;color:color-mix(in srgb,${p.color} 75%,var(--ink));display:flex;align-items:center;gap:6px">${icon(r.pillar, 16)}${p.name}</div><h1>${esc(r.title)}</h1><div class="sub">${esc(r.tag || r.desc)}</div></div></header>`; };
  const ik = (s) => s.replace(/[.]/g, '');

  /* ---------- 1. Intentional spending ---------- */
  function spendTotals() {
    const it = getP('spending.items') || {}; let tot = 0, rev = 0, n = 0;
    const oth = getP('spending.other') || {};
    const cats = SPEND_CATS.map(([c, items]) => {
      let ct = 0, cn = 0;
      const add = (r) => { cn++; ct += num(r.cost); if (r.need === 'No' || r.need === 'Review') rev += num(r.cost); };
      items.forEach((x) => { const r = it[ik(x)]; if (r && r.on) add(r); });
      (oth[ik(c)] || []).forEach((r) => { if (r && (r.label || num(r.cost))) add(r); });
      tot += ct; n += cn; return [cn, ct];
    });
    return { tot, rev, n, cats };
  }
  const needSel = (path, v) => `<select data-b="${esc(path)}" aria-label="Necessary?">${['Yes', 'No', 'Review'].map((o) => `<option ${(v || 'Yes') === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  /* ---------- 2. Monthly money plan ---------- */
  const DAYS7 = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // One income for the whole planner (older entries from the spending worksheet still count)
  const incomeTotal = () => INC_KEYS.reduce((a, k) => a + num(getP(`monthly.inc.${k}`)), 0) || num(getP('spending.income'));
  const actualTotal = () => Object.values(getP('spending.actual') || {}).reduce((a, v) => a + num(v), 0);
  function monthlyCalc() {
    const inc = incomeTotal();
    const pl = spendTotals().tot, ac = actualTotal();
    const bills = getP('monthly.bills') || []; const bt = bills.reduce((a, b) => a + num(b.amt), 0), bu = bills.filter((b) => !b.paid).reduce((a, b) => a + num(b.amt), 0);
    return { inc, pl, ac, bt, bu };
  }
  /* ---------- 3. Emergency fund ---------- */
  function efCalc() {
    const cur = num(getP('efund.cur')), goal = num(getP('efund.goal')), need = Math.max(0, goal - cur);
    const d = getP('efund.date'); let per = null, months = null;
    if (d && need) { const end = fromKey(d); months = Math.max(0.5, (end - TODAY) / (864e5 * 30.44)); const pc = num(getP('efund.pay')) || 2; per = need / (months * pc); }
    return { cur, goal, need, per, months };
  }
  const TOOL_EFUND = {
    render() {
      const c = efCalc(); const ms = [100, 250, 500, 750, 1000, 2500, 5000, 10000].filter((m) => !c.goal || m <= c.goal); if (c.goal && !ms.includes(c.goal)) ms.push(c.goal);
      return `<div class="stack">
    <section class="card"><h2>What is an emergency fund?</h2><div class="rule"></div><p style="margin-top:0">Money set aside for unexpected expenses, so one surprise doesn’t automatically become new debt: medical or dental bills, car or home repairs, pet emergencies, job loss or fewer hours, emergency travel.</p>
      <div class="tbl"><div class="th"><span>Emergency</span><span>Expected expense</span></div>${[['A sudden transmission repair', 'Routine oil changes'], ['An urgent vet visit', 'Annual pet vaccines'], ['A layoff or big drop in income', 'Holiday gifts'], ['A broken water heater', 'A planned vacation']].map((r) => `<div class="tr"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>
      <p class="note">If you know an expense is coming, start a separate sinking fund for it instead of using your emergency fund.</p></section>
    <section class="card"><h2>How much should I save?</h2><div class="rule"></div><p style="margin-top:0">Start with a goal that feels possible, then build from there.</p>
      <div class="chips">${[500, 1000].map((v) => `<button class="chip" data-r="set" data-path="efund.goal" data-v="${v}" aria-pressed="${c.goal === v}">${v === 500 ? 'Starter' : 'Next'}: ${money(v)}</button>`).join('')}</div>
      <div class="calc"><span>Essential monthly expenses</span><div class="money">${inp('efund.ess', { type: 'number', ph: '0' })}</div><span>×</span><select data-b="efund.mo" aria-label="Months">${[3, 4, 5, 6].map((m) => `<option ${String(getP('efund.mo') || 3) === String(m) ? 'selected' : ''} value="${m}">${m} months</option>`).join('')}</select></div>
      <div class="row" style="align-items:center;margin-top:8px;flex-wrap:wrap"><span>= ${out('ef-long')}</span><button class="btn small" data-r="efuse">Use as my goal</button></div>
      <p class="hint">A bigger cushion helps if your income changes often, you support other people, or your job is unstable.</p></section>
    <section class="card"><h2>My emergency fund plan</h2><div class="rule"></div><div class="rows">
      <div class="r2"><span>Current amount saved</span><div class="money">${inp('efund.cur', { type: 'number', ph: '0', rr: true })}</div></div>
      <div class="r2"><span>Goal amount</span><div class="money">${inp('efund.goal', { type: 'number', ph: '0', rr: true })}</div></div>
      <div class="r2 total"><span>Still needed</span><b>${out('ef-need')}</b></div>
      <div class="r2"><span>Target date</span><input type="date" data-b="efund.date" value="${esc(getP('efund.date') || '')}" aria-label="Target date"></div>
      <div class="r2"><span>Paychecks per month</span><select data-b="efund.pay" aria-label="Paychecks per month">${[['1', 'Monthly'], ['2', 'Twice a month'], ['4.33', 'Weekly']].map(([v, l]) => `<option value="${v}" ${String(getP('efund.pay') || '2') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="r2 total"><span>Save per paycheck</span><b>${out('ef-per')}</b></div>
      <div class="r2"><span>Where I’ll keep it</span>${inp('efund.where', { ph: 'e.g. High-yield savings' })}</div></div>
      <label class="lbl" style="margin-top:10px">Why this goal matters</label>${area('efund.why', 'Peace of mind, protecting my family…', 2)}
      <div class="bar" style="height:12px;margin-top:14px"><span style="width:${c.goal ? Math.min(100, (c.cur / c.goal) * 100) : 0}%;background:${P.financial.color}"></span></div>
      <div class="miles">${ms.map((m) => `<div class="mile ${c.cur >= m ? 'done' : ''}"><span class="mk">${c.cur >= m ? '✓' : ''}</span><b>${money(m)}</b>${c.cur >= m ? '<em>Reached. Celebrate it!</em>' : `<em>${money(m - c.cur)} to go</em>`}</div>`).join('')}</div>
      <button class="btn primary" style="margin-top:12px" data-r="efgoal">Add to my WellWheel goals</button></section>
    <section class="card"><h2>My SMART goal</h2><div class="rule"></div><p class="note" style="margin-top:0">Example: I will save $1,000 by August 31 by setting aside money from each paycheck and reviewing my progress every week.</p>
      ${[['s', 'Specific', 'What exactly do I want to save?'], ['m', 'Measurable', 'How will I track my progress?'], ['a', 'Achievable', 'How much can I realistically save?'], ['r', 'Relevant', 'Why does this goal matter to me?'], ['t', 'Time-bound', 'What is my deadline?']].map(([k, l, q]) => `<label class="lbl" style="margin-top:10px"><span class="letter">${l[0]}</span>${l}</label>${inp(`efund.smart.${k}`, { ph: q })}`).join('')}</section>
    <section class="card"><h2>Ways I can build it</h2><div class="rule"></div><div class="stack" style="gap:6px">${EF_WAYS.map((w, i) => chk(`efund.ways.${i}`, w)).join('')}</div></section>
    <section class="card"><h2>Possible obstacles</h2><div class="rule"></div>${['What could slow me down?', 'How can I prepare for it?', 'What will I do if I miss a savings deposit?', 'Who can support or encourage me?'].map((q, i) => `<label class="lbl" style="margin-top:8px">${q}</label>${area(`efund.obs.${i}`, '', 2)}`).join('')}</section>
    <section class="card"><h2>Reflection</h2><div class="rule"></div>${area('efund.refl', 'How do I feel about my progress?', 4)}</section></div>`;
    },
    outs() { const c = efCalc(), ess = num(getP('efund.ess')), mo = num(getP('efund.mo')) || 3; return { 'ef-long': ess ? money(ess * mo) : '$0', 'ef-need': money(c.need), 'ef-per': c.per ? money(Math.ceil(c.per)) : (c.need ? 'Pick a target date' : 'Goal reached!') }; },
  };

  /* ---------- 4. Debt payoff ---------- */
  function simDebt(debts, extra, mode) {
    let ds = debts.map((d, i) => ({ id: i, name: d.name || 'Debt', bal: num(d.bal), rate: num(d.rate) / 100 / 12, min: num(d.min) })).filter((d) => d.bal > 0);
    if (!ds.length) return null;
    const order = [...ds].sort((a, b) => (mode === 'snowball' ? a.bal - b.bal : b.rate - a.rate));
    const budget = ds.reduce((a, d) => a + d.min, 0) + extra; let month = 0, interest = 0; const paid = [];
    while (ds.some((d) => d.bal > 0.005) && month < 600) {
      month++; let avail = budget;
      ds.forEach((d) => { if (d.bal > 0) { const i = d.bal * d.rate; d.bal += i; interest += i; } });
      ds.forEach((d) => { if (d.bal > 0) { const p = Math.min(d.min, d.bal); d.bal -= p; avail -= p; } });
      for (const t of order) { const d = ds.find((x) => x.id === t.id && x.bal > 0); if (!d) continue; if (avail <= 0) break; const p = Math.min(avail, d.bal); d.bal -= p; avail -= p; }
      ds.forEach((d) => { if (d.bal <= 0.005 && !paid.find((x) => x.id === d.id)) { d.bal = 0; paid.push({ id: d.id, name: d.name, month }); } });
    }
    return { months: month, interest, order: order.map((d) => d.name), paid, stuck: month >= 600 };
  }
  const mdate = (m) => addMonths(TODAY, m).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const TOOL_DEBT = {
    render() {
      const ds = getP('debt.list') || [], log = getP('debt.log') || [];
      return `<div class="stack">
    <section class="card"><div class="card-head"><h2>My debt inventory</h2>${ds.length ? '' : '<button class="linkish" data-r="debtex">Load the example</button>'}</div><p class="sub" style="margin-top:0">List every debt so you can see the full picture.</p>
      ${ds.map((d, i) => `<div class="debt"><div class="dtop">${inp(`debt.list.${i}.name`, { ph: 'Debt / creditor' })}<button class="x" data-r="del" data-path="debt.list" data-i="${i}" aria-label="Remove debt">×</button></div>
        <div class="dgrid"><label>Balance<div class="money">${inp(`debt.list.${i}.bal`, { type: 'number', ph: '0' })}</div></label><label>Interest %${inp(`debt.list.${i}.rate`, { type: 'number', ph: '0' })}</label><label>Minimum<div class="money">${inp(`debt.list.${i}.min`, { type: 'number', ph: '0' })}</div></label><label>Due day${inp(`debt.list.${i}.due`, { ph: 'e.g. 15th' })}</label></div></div>`).join('')}
      <button class="btn small" data-r="add" data-path="debt.list">+ Add a debt</button>
      <div class="r2 total" style="margin-top:12px"><span>Total balance</span><b>${out('d-tot')}</b></div>
      <div class="r2"><span>Extra I can pay each month</span><div class="money">${inp('debt.extra', { type: 'number', ph: '0' })}</div></div></section>
    <section class="card"><h2>What do these mean?</h2><div class="rule"></div>
      <div class="defbox"><b>🏔️ Debt snowball</b><p>Pay the minimum on every debt, then put any extra money toward the debt with the <b>smallest balance</b>, no matter the interest rate. When it’s paid off, “roll” that payment into the next-smallest debt. The payment grows like a snowball rolling downhill.</p><p class="sub">Best if quick wins keep you going. May cost more interest overall.</p></div>
      <div class="defbox"><b>⛰️ Debt avalanche</b><p>Pay the minimum on every debt, then put any extra money toward the debt with the <b>highest interest rate</b>, no matter the balance. When it’s paid off, move to the next-highest rate.</p><p class="sub">Best if you want to pay the least interest. The first payoff can take longer.</p></div>
      <div class="defbox"><b>🔀 Hybrid</b><p>Knock out one or two small debts first for momentum, then switch to the highest interest rate.</p></div></section>
    <section class="card"><h2>Snowball vs. avalanche, with my numbers</h2><div class="rule"></div><div data-oh="d-cmp"></div>
      <p class="note">Neither method is automatically right for everyone. The best method is the one you understand, can afford, and will keep using.</p></section>
    <section class="card"><h2>Which strategy fits me?</h2><div class="rule"></div><div class="stack" style="gap:6px">${['Do I need quick wins to stay motivated?', 'Am I mainly focused on reducing interest?', 'Would paying off a small debt help free up monthly cash?', 'Can I stay motivated if the first payoff takes longer?', 'Would a hybrid plan fit my life better?'].map((q, i) => chk(`debt.fit.${i}`, q)).join('')}</div></section>
    <section class="card"><h2>My debt payoff plan</h2><div class="rule"></div><label class="lbl">My chosen strategy</label>${pick('debt.strategy', ['Snowball', 'Avalanche', 'Hybrid'])}
      <label class="lbl" style="margin-top:12px">Why I chose it</label>${area('debt.why', '', 2)}<label class="lbl" style="margin-top:8px">Target payoff date</label><input type="date" data-b="debt.date" value="${esc(getP('debt.date') || '')}"><label class="lbl" style="margin-top:8px">My reason for becoming debt-free</label>${area('debt.reason', '', 2)}</section>
    <section class="card"><h2>Monthly progress</h2><div class="rule"></div>
      ${log.map((r, i) => `<div class="debt"><div class="dtop">${inp(`debt.log.${i}.month`, { ph: 'Month' })}<button class="x" data-r="del" data-path="debt.log" data-i="${i}" aria-label="Remove">×</button></div><div class="dgrid"><label>Starting<div class="money">${inp(`debt.log.${i}.start`, { type: 'number', ph: '0' })}</div></label><label>Extra paid<div class="money">${inp(`debt.log.${i}.extra`, { type: 'number', ph: '0' })}</div></label><label>Ending<div class="money">${inp(`debt.log.${i}.end`, { type: 'number', ph: '0' })}</div></label><label>Win / note${inp(`debt.log.${i}.win`, { ph: 'A win this month' })}</label></div></div>`).join('')}
      <button class="btn small" data-r="add" data-path="debt.log">+ Add a month</button></section>
    <section class="card"><h2>Reduce the chance of new debt</h2><div class="rule"></div><ul class="checks"><li>Build a starter emergency fund</li><li>Plan expected expenses ahead of time</li><li>Practice intentional spending</li><li>Pause before nonessential purchases</li><li>Avoid new charges while paying off balances when possible</li><li>Review your plan after big income or life changes</li></ul>
      <label class="lbl" style="margin-top:8px">Reflection</label>${area('debt.refl', '', 3)}</section></div>`;
    },
    outs() {
      const ds = getP('debt.list') || [], ex = num(getP('debt.extra')); const tot = ds.reduce((a, d) => a + num(d.bal), 0);
      const s = simDebt(ds, ex, 'snowball'), a = simDebt(ds, ex, 'avalanche'); let h;
      if (!s) h = '<p class="empty">Add your debts above to compare the two methods.</p>';
      else if (s.stuck || a.stuck) h = '<p class="note">With these payments the balances don’t go down, because interest is growing faster than you’re paying. Try adding an extra monthly amount.</p>';
      else {
        const col = (r, lbl) => `<div class="cmp"><div class="pill" style="color:var(--plum)">${lbl}</div><div class="big2">${mdate(r.months)}</div><div class="sub">Debt-free in ${r.months} month${r.months === 1 ? '' : 's'}</div><div class="kv"><span>Total interest</span><b>${money(Math.round(r.interest))}</b></div><div class="kv"><span>First payoff</span><b>${esc(r.paid[0]?.name || '')} · ${mdate(r.paid[0]?.month || 0)}</b></div><div class="ord">${r.order.map((n, i) => `<span>${i + 1}. ${esc(n)}</span>`).join('')}</div></div>`;
        const diff = s.interest - a.interest;
        h = `<div class="cmpgrid">${col(s, 'Snowball')}${col(a, 'Avalanche')}</div><p class="hint">${Math.abs(diff) < 1 ? 'Both methods cost about the same in interest with your numbers.' : `Avalanche saves about ${money(Math.round(diff))} in interest. Snowball gets your first debt paid off ${s.paid[0].month < a.paid[0].month ? `${a.paid[0].month - s.paid[0].month} month(s) sooner` : 'at the same time or later'}.`}</p>`;
      }
      return { 'd-tot': money(tot), __html: { 'd-cmp': h } };
    },
  };

  /* ---------- 5. Net worth ---------- */
  function nwCalc() { const a = ASSETS.reduce((s, k) => s + num(getP(`nw.a.${k}`)), 0), l = LIABS.reduce((s, k) => s + num(getP(`nw.l.${k}`)), 0); return { a, l, nw: a - l }; }
  const TOOL_NW = {
    render() {
      const hist = getP('nw.hist') || [];
      return `<div class="stack">
    <section class="card"><p style="margin:0">Your net worth is everything you own (assets) minus everything you owe (liabilities). Tracking it isn’t about comparing yourself to anyone else. It helps you see your own progress over time.</p><p class="formula">Net worth = Assets − Liabilities</p></section>
    <section class="card sticky-sum"><div class="sumgrid"><div><div class="k">Assets</div><div class="v">${out('nw-a')}</div></div><div><div class="k">Liabilities</div><div class="v">${out('nw-l')}</div></div><div style="grid-column:1/-1"><div class="k">My net worth</div><div class="v xl">${out('nw-n')}</div></div></div></section>
    <section class="card"><h2>My assets</h2><div class="rule"></div><div class="rows">${ASSETS.map((k) => `<div class="r2"><span>${k}</span><div class="money">${inp(`nw.a.${k}`, { type: 'number', ph: '0' })}</div></div>`).join('')}</div></section>
    <section class="card"><h2>My liabilities</h2><div class="rule"></div><div class="rows">${LIABS.map((k) => `<div class="r2"><span>${k}</span><div class="money">${inp(`nw.l.${k}`, { type: 'number', ph: '0' })}</div></div>`).join('')}</div></section>
    <section class="card"><div class="card-head"><h2>Check-in history</h2><button class="btn small primary" data-r="nwsave">Save today’s check-in</button></div>
      ${hist.length ? `<div class="tbl"><div class="th three"><span>Date</span><span>Net worth</span><span>Change</span></div>${hist.map((h, i) => { const ch = i ? h.nw - hist[i - 1].nw : null; return `<div class="tr three"><span>${fmtDate(h.date)}</span><span>${money(h.nw)}</span><span style="color:${ch == null ? '' : ch >= 0 ? 'var(--good)' : '#C0503A'}">${ch == null ? '—' : (ch >= 0 ? '+' : '') + money(ch)}</span></div>`; }).join('')}</div>` : '<p class="empty">Save a check-in every few months to watch your progress.</p>'}</section>
    <section class="card"><h2>Goals for next check-in</h2><div class="rule"></div><div class="stack" style="gap:6px">${['Increase savings', 'Reduce debt', 'Increase retirement contributions', 'Increase investments'].map((g, i) => chk(`nw.goal.${i}`, g)).join('')}<div class="goalline">${chk('nw.goal.o', 'Other')}${inp('nw.goalo', { ph: 'My own goal' })}</div></div></section>
    <section class="card"><h2>Reflection</h2><div class="rule"></div>${['What improved since my last review?', 'What am I most proud of?', 'What is my next financial goal?'].map((q, i) => `<label class="lbl" style="margin-top:8px">${q}</label>${area(`nw.refl.${i}`, '', 2)}`).join('')}</section></div>`;
    },
    outs() { const c = nwCalc(); return { 'nw-a': money(c.a), 'nw-l': money(c.l), 'nw-n': money(c.nw) }; },
  };

  /* ---------- 6. Books ---------- */
  const TOOL_BOOKS = {
    render() {
      const st = getP('books') || {}; const cnt = (s) => Object.values(st).filter((v) => v === s).length;
      return `<div class="stack"><section class="card"><p style="margin:0">Since we all approach money differently, these are books that can help you find your own best approach. Some disagree with each other, and that’s the point: take what fits your life.</p>
      <div class="sumgrid" style="margin-top:12px"><div><div class="k">Want to read</div><div class="v">${cnt('Want')}</div></div><div><div class="k">Reading</div><div class="v">${cnt('Reading')}</div></div><div><div class="k">Finished</div><div class="v">${cnt('Read')}</div></div></div></section>
    <section class="card">${BOOKS.map(([t, a]) => { const v = st[ik(t)] || ''; return `<div class="book"><div><b>${esc(t)}</b><div class="sub">${esc(a)}</div></div><div class="seg3">${['Want', 'Reading', 'Read'].map((o) => `<button data-r="book" data-k="${esc(ik(t))}" data-v="${o}" aria-pressed="${v === o}">${o}</button>`).join('')}</div></div>`; }).join('')}</section></div>`;
    },
  };

  /* ---------- 7. Coping skills ---------- */
  const COPE_COUNT = Object.values(COPING).reduce((a, l) => a + l.length, 0);
  const TIME_LBL = { q: 'Under 2 min', s: '5–15 min', l: 'Longer' };
  function copeList() {
    const st = getP('coping') || {}, fav = st.fav || [], q = (ui.copeQ || '').toLowerCase();
    let html = '';
    COPING_CATS.forEach((c) => {
      if (ui.copeCat && ui.copeCat !== c.id) return;
      const items = COPING[c.id].filter(([nm, how, t]) => (!ui.copeTime || ui.copeTime === t) && (!ui.copeFav || fav.includes(nm)) && (!q || (nm + ' ' + how).toLowerCase().includes(q)));
      if (!items.length) return; const p = P[c.pillar];
      html += `<section class="card"><div class="card-head"><h2 style="display:flex;gap:8px;align-items:center"><span style="color:${p.color};display:flex">${icon(c.pillar, 18)}</span>${c.name}</h2><span class="sub">${items.length}</span></div>
      ${items.map(([nm, how, t]) => { const f = fav.includes(nm), u = (st.used || {})[ik(nm)] || 0; return `<div class="skill"><div class="sk-main"><b>${esc(nm)}</b><p>${esc(how)}</p><div class="sk-meta"><span class="tag">${TIME_LBL[t]}</span>${u ? `<span class="tag used">Used ${u}×</span>` : ''}</div></div><div class="sk-btns"><button class="star ${f ? 'on' : ''}" data-r="fav" data-k="${esc(nm)}" aria-pressed="${f}" aria-label="${f ? 'Remove from' : 'Add to'} favorites">${f ? '★' : '☆'}</button><button class="btn small" data-r="used" data-k="${esc(nm)}">I used this</button></div></div>`; }).join('')}</section>`;
    });
    return html || '<p class="empty">No skills match. Try a different search or filter.</p>';
  }
  const TOOL_COPING = {
    render() {
      const fav = (getP('coping.fav') || []).length;
      return `<div class="stack">
    <section class="card"><p style="margin:0">Different moments need different tools. Try a few, star the ones that help, and tap <b>I used this</b> to count it toward a coping skill goal.</p>
      <p class="note">If you’re in crisis or thinking about hurting yourself, call or text <b>988</b> (Suicide & Crisis Lifeline, US) any time, day or night.</p></section>
    <section class="card filters"><input type="search" id="cope-q" placeholder="Search ${COPE_COUNT} skills, e.g. breathing, anger, sleep" aria-label="Search coping skills" value="${esc(ui.copeQ || '')}">
      <div class="chips scroll"><button class="chip" data-r="ccat" data-v="" aria-pressed="${!ui.copeCat}">All</button>${COPING_CATS.map((c) => `<button class="chip" data-r="ccat" data-v="${c.id}" aria-pressed="${ui.copeCat === c.id}">${c.name}</button>`).join('')}</div>
      <div class="chips"><button class="chip" data-r="ctime" data-v="q" aria-pressed="${ui.copeTime === 'q'}">Under 2 min</button><button class="chip" data-r="ctime" data-v="s" aria-pressed="${ui.copeTime === 's'}">5–15 min</button><button class="chip" data-r="ctime" data-v="l" aria-pressed="${ui.copeTime === 'l'}">Longer</button><button class="chip" data-r="cfav" aria-pressed="${!!ui.copeFav}">★ Favorites (${fav})</button></div></section>
    <div id="copelist" class="stack">${copeList()}</div></div>`;
    },
  };

  /* ---------- 8. Burnout ---------- */
  function burnQ([id, q, type, opts]) {
    const path = `burn.a.${id}`;
    if (id === 'h') return `<h3 class="h3 bh">${esc(q)}</h3>`;
    let ctl;
    if (type === 'one') ctl = pick(path, opts);
    else if (type === 'many') ctl = pick(path, opts, true);
    else if (type === 'num') ctl = `<div style="max-width:140px">${inp(path, { type: 'number', ph: '0' })}</div>`;
    else if (type === 'scale') ctl = `<div class="scale">${Array.from({ length: 11 }, (_, i) => `<button type="button" data-r="pick" data-path="${path}" data-v="${i}" aria-pressed="${String(getP(path)) === String(i)}">${i}</button>`).join('')}</div><div class="scale-l"><span>None</span><span>Extreme</span></div>`;
    else ctl = area(path, '', 2);
    return `<div class="bq"><p class="bql">${esc(q)}</p>${ctl}</div>`;
  }
  const TOOL_BURN = {
    render() {
      const sec = getP('burn.sec') ?? -1, N = BURN.length;
      const dots = `<div class="steps">${Array.from({ length: N + 1 }, (_, i) => `<span class="${i <= sec ? 'on' : ''}"></span>`).join('')}</div>`;
      const nav = (prev, next, nextLbl = 'Next section') => `<div class="row" style="justify-content:space-between;margin-top:6px">${prev != null ? `<button class="btn" data-r="bsec" data-v="${prev}">← Back</button>` : '<span></span>'}<button class="btn primary" data-r="bsec" data-v="${next}">${nextLbl}</button></div>`;
      if (sec < 0) return `<div class="stack"><section class="card"><p class="prompt" style="margin-top:0">Not “What’s wrong with me?” but “What am I actually holding right now?”</p><p>This isn’t a quiz, and it won’t give you a score or a diagnosis. It lays out everything you’re responsible for right now (work, home, money, sleep, relationships, and everything running quietly in the back of your mind) so you can see where the pressure is really coming from.</p>
      <h3 class="h3">How to use it</h3><ul class="checks"><li>Answer honestly, not how you think you should answer. There’s no passing score.</li><li>Do it in one sitting if you can, but it’s fine to come back. Your answers are saved.</li><li>The last section is where it all comes together. Don’t skip it.</li></ul>
      <button class="btn primary wide" data-r="bsec" data-v="0">${Object.keys(getP('burn.a') || {}).length ? 'Continue' : 'Start the worksheet'}</button></section></div>`;
      if (sec >= N) return this.summary(dots);
      const s = BURN[sec];
      return `<div class="stack">${dots}<section class="card"><div class="pill" style="color:var(--plum)">Section ${sec + 1} of ${N}</div><h2 style="margin-top:4px">${esc(s.t)}</h2><p class="sub" style="margin:4px 0 0">${esc(s.s)}</p><div class="rule"></div>${s.q.map(burnQ).join('')}</section>${nav(sec - 1 >= -1 ? sec - 1 : null, sec + 1, sec === N - 1 ? 'Put it together →' : 'Next section')}</div>`;
    },
    summary(dots) {
      const a = getP('burn.a') || {}, n = (k) => num(a[k]);
      const committed = n('hrs') + n('comm') + n('schoolh') + n('comh');
      const facts = [[committed ? committed + ' hrs' : '—', 'committed each week (work, commute, school, other)'], [a.own ? n('own') + ' hrs' : '—', 'that are truly your own'], [a.sleep ? n('sleep') + ' hrs' : '—', 'of sleep most nights'], [a.dep ? n('dep') : '—', 'people depending on you'], [(a.changes || []).length, 'big changes this past year'], [a.vac || '—', 'since a real break']];
      const words = [['Hardest to carry', 'hardest'], ['Could be reduced or shared', 'reduce'], ['Would help most if it disappeared', 'disappear'], ['10% easier this week', 'ten'], ['Someone could help carry', 'askhelp'], ['Doesn’t need to be perfect', 'perfect'], ['Something I miss doing', 'miss']].filter(([, k]) => a[k]);
      return `<div class="stack">${dots}<section class="card"><div class="pill" style="color:var(--plum)">Putting it together</div><h2 style="margin-top:4px">What you’re carrying</h2><div class="rule"></div>
      <div class="facts">${facts.map(([v, l]) => `<div><b>${esc(String(v))}</b><span>${esc(l)}</span></div>`).join('')}</div>
      ${(a.top3 || []).length ? `<h3 class="h3">Taking the most energy</h3><div class="chips">${a.top3.map((x) => `<span class="chip static">${esc(x)}</span>`).join('')}</div>` : ''}
      ${(a.needmore || []).length ? `<h3 class="h3">What I need more of</h3><div class="chips">${a.needmore.map((x) => `<span class="chip static">${esc(x)}</span>`).join('')}</div>` : ''}
      ${words.map(([l, k]) => `<div class="said"><span>${l}</span><p>${esc(a[k])}</p></div>`).join('')}</section>
      <section class="card"><h2>Where is my burnout coming from?</h2><div class="rule"></div><p class="sub" style="margin-top:0">Look back over everything: the hours, the people who depend on you, the sleep you’re not getting, the money worry, the last time you truly rested.</p>${area('burn.a.source', 'In my own words…', 5)}
      <p class="note">This worksheet doesn’t score or diagnose you. Its only job is to help you see everything you’re carrying, all at once. Maybe the problem was never that you’re bad at self-care.</p>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px"><button class="btn" data-r="bsec" data-v="${BURN.length - 1}">← Back</button><button class="btn" data-r="opentool" data-v="coping">Open coping skills</button><button class="btn ghost" data-r="bsec" data-v="-1">Start over later</button></div></section></div>`;
    },
  };

  /* ---------- shared journal-style helpers ---------- */
  function entriesList(tool, renderOne, emptyMsg) {
    const list = (getP(tool + '.entries') || []).slice().reverse();
    return list.length ? list.map((e, ri) => { const i = list.length - 1 - ri; return `<div class="entry"><div class="card-head" style="margin-bottom:4px"><span class="goal-meta">${fmtDate(e.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span><button class="x" data-r="del" data-path="${tool}.entries" data-i="${i}" aria-label="Delete entry">×</button></div>${renderOne(e)}</div>`; }).join('') : `<p class="empty">${emptyMsg}</p>`;
  }
  const saveBtn = (tool, label = 'Save entry') => `<button class="btn primary wide" style="margin-top:12px" data-r="saveentry" data-tool="${tool}">${label}</button>`;
  const kv = (l, v) => (v ? `<div class="said"><span>${esc(l)}</span><p>${esc(v)}</p></div>` : '');

  /* ---------- Sleep journal ---------- */
  function sleepHours(b, w) { if (!b || !w) return null; const [bh, bm] = b.split(':').map(Number), [wh, wm] = w.split(':').map(Number); let m = (wh * 60 + wm) - (bh * 60 + bm); if (m <= 0) m += 1440; return m / 60; }
  const TOOL_SLEEP = {
    render() {
      const es = getP('sleep.entries') || [], last = es.slice(-7); const hrs = last.map((e) => sleepHours(e.bed, e.wake)).filter((h) => h != null); const avg = hrs.length ? hrs.reduce((a, b) => a + b, 0) / hrs.length : 0; const q = last.filter((e) => e.q).map((e) => +e.q); const aq = q.length ? q.reduce((a, b) => a + b, 0) / q.length : 0;
      const max = 10;
      return `<div class="stack">
    <section class="card"><div class="sumgrid"><div><div class="k">Average sleep (last 7)</div><div class="v">${avg ? avg.toFixed(1) + ' hrs' : '—'}</div></div><div><div class="k">Average quality</div><div class="v">${aq ? aq.toFixed(1) + ' / 5' : '—'}</div></div><div><div class="k">Nights logged</div><div class="v">${es.length}</div></div></div>
      ${last.length ? `<div class="sbars">${last.map((e) => { const h = sleepHours(e.bed, e.wake) || 0; return `<div><span style="height:${Math.min(100, (h / max) * 100)}%;background:${h >= 7 ? P.physical.color : 'var(--gold)'}" title="${h.toFixed(1)} hours"></span><em>${h.toFixed(1)}</em><small>${fromKey(e.date).toLocaleDateString('en-US', { weekday: 'narrow' })}</small></div>`; }).join('')}</div><p class="hint">Green bars are 7+ hours.</p>` : ''}</section>
    <section class="card"><h2>Log last night</h2><div class="rule"></div>
      <div class="grid2b"><label>Date (morning)<input type="date" data-b="sleep.draft.date" value="${esc(getP('sleep.draft.date') || T)}"></label><span></span>
      <label>Went to bed<input type="time" data-b="sleep.draft.bed" value="${esc(getP('sleep.draft.bed') || '')}"></label><label>Woke up<input type="time" data-b="sleep.draft.wake" value="${esc(getP('sleep.draft.wake') || '')}"></label></div>
      <p class="hint">${out('sl-h')}</p>
      <label class="lbl" style="margin-top:8px">Sleep quality</label>${pick('sleep.draft.q', ['1', '2', '3', '4', '5'])}<div class="scale-l" style="max-width:260px"><span>Restless</span><span>Great</span></div>
      <label class="lbl" style="margin-top:10px">Woke up rested?</label>${pick('sleep.draft.rested', ['Yes', 'Somewhat', 'No'])}
      <label class="lbl" style="margin-top:10px">What affected my sleep?</label>${pick('sleep.draft.f', SLEEP_FACTORS, true)}
      <label class="lbl" style="margin-top:10px">Dreams or notes</label>${area('sleep.draft.note', '', 2)}${saveBtn('sleep', 'Save this night')}</section>
    <section class="card"><h2>My wind-down routine</h2><div class="rule"></div><div class="stack" style="gap:6px">${['Same bedtime most nights', 'Screens off 30 minutes before bed', 'Dim the lights', 'Cool, dark room', 'No caffeine after noon', 'Write tomorrow’s to-do list', 'Stretch or breathe for 5 minutes', 'Read something calm'].map((x, i) => chk('sleep.routine.' + i, x)).join('')}</div></section>
    <section class="card"><h2>Past nights</h2><div class="rule"></div>${entriesList('sleep', (e) => { const h = sleepHours(e.bed, e.wake); return `<div class="sk-meta"><span class="tag">${h ? h.toFixed(1) + ' hrs' : '—'}</span>${e.q ? `<span class="tag">Quality ${e.q}/5</span>` : ''}${e.rested ? `<span class="tag">Rested: ${esc(e.rested)}</span>` : ''}${(e.f || []).map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>${e.note ? `<p style="margin:6px 0 0">${esc(e.note)}</p>` : ''}`; }, 'Your nights will show up here.')}</section></div>`;
    },
    outs() { const h = sleepHours(getP('sleep.draft.bed'), getP('sleep.draft.wake')); return { 'sl-h': h ? `That’s ${Math.floor(h)} hours ${Math.round((h % 1) * 60)} minutes of sleep time.` : 'Add bedtime and wake time to see your hours.' }; },
  };

  /* ---------- Meal & grocery ---------- */
  const TOOL_MEALS = {
    render() {
      const g = getP('meals.groc') || [], d = ui.mealDay || WEEK[(TODAY.getDay() + 6) % 7];
      const byA = AISLES.map((a) => [a, g.map((x, i) => [x, i]).filter(([x]) => x.a === a)]).filter(([, l]) => l.length);
      const left = g.filter((x) => !x.done).length;
      return `<div class="stack">
    <section class="card"><div class="card-head"><h2>This week’s meals</h2><button class="linkish" data-r="mealclear">Clear week</button></div>
      <div class="chips daytabs">${WEEK.map((w) => `<button class="chip" data-r="mealday" data-v="${w}" aria-pressed="${d === w}">${w}${MEALS.some((m) => getP(`meals.plan.${w}.${m}`)) ? ' •' : ''}</button>`).join('')}</div>
      <div class="rows" style="margin-top:10px">${MEALS.map((m) => `<div class="r2 meal"><span>${m}</span>${inp(`meals.plan.${d}.${m}`, { ph: m === 'Snacks' ? 'e.g. Apple, trail mix' : 'What’s the plan?' })}</div>`).join('')}</div>
      <label class="lbl" style="margin-top:12px">Meal ideas to try</label>${area('meals.ideas', 'Recipes, leftovers to use up, family favorites…', 2)}</section>
    <section class="card"><div class="card-head"><h2>Grocery list</h2><span class="sub">${left} to get</span></div>
      <form class="grocadd" data-r-form="groc"><input type="text" id="g-item" placeholder="Add an item" aria-label="Grocery item"><select id="g-aisle" aria-label="Section">${AISLES.map((a) => `<option ${ui.lastAisle === a ? 'selected' : ''}>${a}</option>`).join('')}</select><button class="btn primary" type="submit">Add</button></form>
      ${byA.length ? byA.map(([a, l]) => `<h3 class="h3 bh">${a}</h3>${l.map(([x, i]) => `<div class="gitem ${x.done ? 'done' : ''}"><label class="ck"><input type="checkbox" data-b="meals.groc.${i}.done" data-rr ${x.done ? 'checked' : ''}><span>${esc(x.t)}</span></label><button class="x" data-r="del" data-path="meals.groc" data-i="${i}" aria-label="Remove ${esc(x.t)}">×</button></div>`).join('')}`).join('') : '<p class="empty">Your list is empty.</p>'}
      ${g.some((x) => x.done) ? `<button class="btn small" style="margin-top:10px" data-r="grocclear">Remove checked items</button>` : ''}</section>
    <section class="card"><h2>Grocery budget</h2><div class="rule"></div><div class="rows"><div class="r2"><span>Budget this week</span><div class="money">${inp('meals.budget', { type: 'number', ph: '0' })}</div></div><div class="r2"><span>Spent so far</span><div class="money">${inp('meals.spent', { type: 'number', ph: '0' })}</div></div><div class="r2 total"><span>Left</span><b>${out('ml-left')}</b></div></div></section></div>`;
    },
    outs() { const b = num(getP('meals.budget')), s = num(getP('meals.spent')); return { 'ml-left': b ? money(b - s) : '—' }; },
  };

  /* ---------- CBT thought record ---------- */
  const TOOL_CBT = {
    render() {
      return `<div class="stack">
    <section class="card"><p style="margin:0">A thought record helps you slow down a stressful thought, check it against the facts, and find a more balanced way to see it. You’re not forcing yourself to think positive, just more accurately.</p></section>
    <section class="card"><h2>New thought record</h2><div class="rule"></div>
      <label class="lbl">1. Situation: what happened?</label>${area('cbt.draft.sit', 'Where were you, who was there, what happened?', 2)}
      <label class="lbl" style="margin-top:10px">2. Automatic thought: what went through your mind?</label>${area('cbt.draft.thought', 'e.g. “I’m going to get fired.”', 2)}
      <label class="lbl" style="margin-top:10px">3. Feelings and how strong (0–100)</label><div class="grid2b">${inp('cbt.draft.feel', { ph: 'e.g. Anxious, ashamed' })}${inp('cbt.draft.before', { type: 'number', ph: '0–100' })}</div>
      <label class="lbl" style="margin-top:10px">4. Any thinking traps?</label>${pick('cbt.draft.traps', TRAPS.map((t) => t[0]), true)}
      <details class="mini"><summary>What do these mean?</summary><dl class="defs">${TRAPS.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl></details>
      <label class="lbl" style="margin-top:10px">5. Evidence for the thought</label>${area('cbt.draft.for', 'Facts only, not feelings', 2)}
      <label class="lbl" style="margin-top:10px">6. Evidence against the thought</label>${area('cbt.draft.against', 'What would a friend point out?', 2)}
      <label class="lbl" style="margin-top:10px">7. Balanced thought</label>${area('cbt.draft.balanced', 'A fairer way to see it', 2)}
      <label class="lbl" style="margin-top:10px">8. How strong is the feeling now? (0–100)</label><div style="max-width:140px">${inp('cbt.draft.after', { type: 'number', ph: '0–100' })}</div>
      ${saveBtn('cbt', 'Save thought record')}</section>
    <section class="card"><h2>Past records</h2><div class="rule"></div>${entriesList('cbt', (e) => `${kv('Thought', e.thought)}${(e.traps || []).length ? `<div class="sk-meta" style="margin-top:6px">${e.traps.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}${kv('Balanced thought', e.balanced)}${e.before || e.after ? `<p class="goal-meta" style="margin:6px 0 0">${esc(e.feel || 'Feeling')}: ${esc(e.before || '?')} → ${esc(e.after || '?')}</p>` : ''}`, 'Your thought records will show up here.')}</section></div>`;
    },
  };

  /* ---------- Self-compassion ---------- */
  const TOOL_SELFC = {
    render() {
      return `<div class="stack">
    <section class="card"><p style="margin:0">Self-compassion means treating yourself the way you’d treat a good friend who’s struggling. It has three parts: noticing the pain, remembering you’re not alone in it, and offering yourself kindness.</p></section>
    <section class="card"><h2>Today’s entry</h2><div class="rule"></div>
      <label class="lbl">What was hard today?</label>${area('selfc.draft.hard', '', 2)}
      <label class="lbl" style="margin-top:10px">Notice it: what are you feeling, without judging it?</label>${area('selfc.draft.notice', 'e.g. I’m feeling disappointed and tired.', 2)}
      <label class="lbl" style="margin-top:10px">You’re not alone: who else might feel this way?</label>${area('selfc.draft.human', 'e.g. Anyone who works hard and still falls short sometimes.', 2)}
      <label class="lbl" style="margin-top:10px">Be kind: what would you say to a friend in this spot?</label>${area('selfc.draft.kind', '', 3)}
      <label class="lbl" style="margin-top:10px">One kind thing I’ll do for myself</label>${inp('selfc.draft.act', { ph: 'e.g. Go to bed early' })}
      ${saveBtn('selfc')}</section>
    <section class="card"><h2>Kind phrases to borrow</h2><div class="rule"></div><ul class="checks"><li>This is a hard moment, and hard moments pass.</li><li>I’m doing the best I can with what I have.</li><li>I don’t have to be perfect to be worthy.</li><li>I can be gentle with myself right now.</li><li>Mistakes mean I’m learning.</li></ul></section>
    <section class="card"><h2>Past entries</h2><div class="rule"></div>${entriesList('selfc', (e) => `${kv('What was hard', e.hard)}${kv('What I told myself', e.kind)}${kv('Kind thing for me', e.act)}`, 'Your entries will show up here.')}</section></div>`;
    },
  };

  /* ---------- Couples communication ---------- */
  const TOOL_COUPLES = {
    render() {
      const pn = partnerName() || 'my partner', si = (getP('couples.si') || 0) % STARTERS.length;
      return `<div class="stack">
    ${partnerName() ? `<section class="card"><p style="margin:0">💞 Connected with <b>${esc(pn)}</b>. You both see and add to this workbook.</p></section>` : `<section class="card"><p style="margin:0">Tip: connect with your partner from your profile (the circle at the top of Today) to share these check-ins.</p></section>`}
    <section class="card"><h2>Conversation starter</h2><div class="rule"></div><p class="prompt" style="margin:0 0 10px">${esc(STARTERS[si])}</p><button class="btn small" data-r="starter">Next question</button></section>
    <section class="card"><h2>Weekly check-in</h2><div class="rule"></div><p class="sub" style="margin-top:0">Take turns. Listen to understand, not to answer.</p>
      ${[['appr', 'One thing I appreciated about you this week'], ['working', 'What’s working well for us'], ['hard', 'What’s been hard for me'], ['request', 'One thing I’d like to ask for'], ['plans', 'Plans for the week ahead']].map(([k, l]) => `<label class="lbl" style="margin-top:8px">${l}</label>${area('couples.draft.' + k, '', 2)}`).join('')}
      ${saveBtn('couples', 'Save check-in')}</section>
    <section class="card"><h2>Say it with an “I” statement</h2><div class="rule"></div><p class="sub" style="margin-top:0">“I” statements share how you feel without blaming, so your partner can hear you instead of defending.</p>
      <div class="istmt"><span>I feel</span>${inp('couples.i.feel', { ph: 'hurt' })}<span>when</span>${inp('couples.i.when', { ph: 'plans change last minute' })}<span>because</span>${inp('couples.i.because', { ph: 'I was looking forward to our time' })}<span>I need</span>${inp('couples.i.need', { ph: 'a heads-up when things change' })}</div>
      <div class="summary" style="margin-top:10px">${out('cp-i')}</div></section>
    <section class="card"><h2>Love languages</h2><div class="rule"></div><label class="lbl">How I feel most loved</label>${pick('couples.ll.me', LOVE, true)}<label class="lbl" style="margin-top:10px">How ${esc(pn)} feels most loved</label>${pick('couples.ll.them', LOVE, true)}</section>
    <section class="card"><h2>When an argument heats up</h2><div class="rule"></div><ol class="principles"><li><b>Pause.</b> Either of you can call a 20-minute break. Say when you’ll come back.</li><li><b>Calm your body.</b> Breathe, walk, get water. Don’t rehearse your argument.</li><li><b>Come back.</b> Start softly: “I feel… about… I need…”</li><li><b>Reflect.</b> Repeat back what you heard before you respond.</li><li><b>Find one thing to agree on,</b> then one small next step.</li><li><b>Repair.</b> A sorry, a hug, or a joke helps you both reset.</li></ol></section>
    <section class="card"><h2>Past check-ins</h2><div class="rule"></div>${entriesList('couples', (e) => `${e.by ? `<div class="byline">💞 ${esc(e.by)}</div>` : ''}${kv('Appreciated', e.appr)}${kv('Working well', e.working)}${kv('Hard', e.hard)}${kv('Request', e.request)}`, 'Your check-ins will show up here.')}</section></div>`;
    },
    outs() { const g = (k) => (getP('couples.i.' + k) || '').trim(); const f = g('feel'), w = g('when'), b = g('because'), n = g('need'); return { 'cp-i': (f || w) ? `“I feel ${f || '…'} when ${w || '…'}${b ? ` because ${b}` : ''}.${n ? ` I need ${n}.` : ''}”` : 'Your sentence will appear here.' }; },
  };

  /* ---------- Prayer journal ---------- */
  const TOOL_PRAYER = {
    render() {
      const reqs = getP('prayer.reqs') || []; const ans = reqs.filter((r) => r.ans).length;
      return `<div class="stack">
    <section class="card"><div class="sumgrid"><div><div class="k">Prayer requests</div><div class="v">${reqs.length}</div></div><div><div class="k">Answered</div><div class="v" style="color:var(--good)">${ans}</div></div><div><div class="k">Journal entries</div><div class="v">${(getP('prayer.entries') || []).length}</div></div></div></section>
    <section class="card"><h2>Today’s prayer</h2><div class="rule"></div>
      <label class="lbl">Praise & thanks</label>${area('prayer.draft.praise', 'What am I thankful for today?', 2)}
      <label class="lbl" style="margin-top:10px">Confession & letting go</label>${area('prayer.draft.conf', 'What do I need to release?', 2)}
      <label class="lbl" style="margin-top:10px">Scripture or verse</label>${inp('prayer.draft.verse', { ph: 'e.g. Psalm 46:10' })}
      <label class="lbl" style="margin-top:10px">What’s on my heart</label>${area('prayer.draft.heart', '', 3)}
      ${saveBtn('prayer')}</section>
    <section class="card"><div class="card-head"><h2>Prayer requests</h2><span class="sub">${ans} answered</span></div>
      <form class="row" data-r-form="prayreq"><input type="text" id="pr-new" placeholder="For whom or what?" aria-label="New prayer request"><button class="btn primary" type="submit">Add</button></form>
      ${reqs.map((r, i) => `<div class="bk ${r.ans ? 'done' : ''}"><button class="bkchk" data-r="prayans" data-i="${i}" aria-pressed="${!!r.ans}" aria-label="Mark answered">${r.ans ? '✓' : ''}</button><div class="bkmain"><div class="bkt">${esc(r.t)}</div><div class="sk-meta"><span class="tag">Added ${fmtDate(r.d)}</span>${r.ans ? `<span class="tag used">Answered ${fmtDate(r.ans)}</span>` : ''}</div>${r.ans ? inp(`prayer.reqs.${i}.how`, { ph: 'How was it answered?' }) : ''}</div><button class="x" data-r="del" data-path="prayer.reqs" data-i="${i}" aria-label="Remove">×</button></div>`).join('')}</section>
    <section class="card"><h2>Past entries</h2><div class="rule"></div>${entriesList('prayer', (e) => `${e.verse ? `<p class="prompt" style="margin:0 0 4px;font-size:15px">${esc(e.verse)}</p>` : ''}${kv('Thankful for', e.praise)}${kv('On my heart', e.heart)}`, 'Your prayers will show up here.')}</section></div>`;
    },
  };

  /* ---------- Life vision ---------- */
  const TOOL_VISION = {
    render() {
      const vals = getP('vision.values') || [];
      return `<div class="stack">
    <section class="card"><p style="margin:0">Picture your whole life, all nine pillars, five years from now. Then work backward: a one-year milestone, and one first step you can take this month.</p></section>
    <section class="card"><h2>My core values</h2><div class="rule"></div><p class="sub" style="margin-top:0">Choose up to 5. ${vals.length}/5 chosen.</p><div class="chips">${VALUES.map((v) => `<button class="chip" data-r="val" data-v="${v}" aria-pressed="${vals.includes(v)}">${v}</button>`).join('')}</div>
      <label class="lbl" style="margin-top:12px">My personal mission statement</label>${area('vision.mission', 'e.g. I live with faith and courage, help others find their footing, and build a life of freedom for my family.', 3)}
      <label class="lbl" style="margin-top:10px">My word for the year</label>${inp('vision.word', { ph: 'e.g. Rooted' })}</section>
    ${Object.values(P).map((p) => `<details class="card fold vision" data-fold="vision.open.${p.id}" ${getP('vision.open.' + p.id) ? 'open' : ''} style="--c:${p.color}"><summary><b style="display:flex;align-items:center;gap:8px"><span style="color:${p.color};display:flex">${icon(p.id, 18)}</span>${p.name}</b><span class="sub">${getP(`vision.p.${p.id}.five`) ? '✓' : ''}</span></summary>
      <label class="lbl">In 5 years, I see…</label>${area(`vision.p.${p.id}.five`, '', 2)}
      <label class="lbl" style="margin-top:8px">One-year milestone</label>${inp(`vision.p.${p.id}.one`, { ph: 'By this time next year…' })}
      <label class="lbl" style="margin-top:8px">First step this month</label>${inp(`vision.p.${p.id}.step`, { ph: 'One small action' })}
      <button class="btn small" style="margin-top:10px" data-r="visgoal" data-v="${p.id}">Make the first step a goal</button></details>`).join('')}</div>`;
    },
  };


  /* ---------- Financial portfolio (pulls from the money worksheets and goals) ---------- */
  const hbar = (label, value, max, note = '') => `<div class="hb" title="${esc(label)}: ${money(value)}"><span class="hb-l">${esc(label)}</span><span class="hb-t"><span style="width:${max > 0 ? Math.max(1.5, Math.min(100, (value / max) * 100)) : 0}%"></span></span><span class="hb-v">${money(value)}${note}</span></div>`;
  function nwTrend(hist) {
    if (hist.length < 2) return '<p class="empty">Save at least two check-ins in the Net worth section to see your trend here.</p>';
    const W = 320, H = 130, px = 10, py = 14;
    const vals = hist.map((h) => h.nw), lo = Math.min(0, ...vals), hi = Math.max(...vals), span = hi - lo || 1;
    const x = (i) => px + (i * (W - 2 * px)) / (hist.length - 1), y = (v) => H - py - ((v - lo) / span) * (H - 2 * py);
    const pts = hist.map((h, i) => `${x(i).toFixed(1)},${y(h.nw).toFixed(1)}`).join(' ');
    const zero = lo < 0 ? `<line x1="${px}" x2="${W - px}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)" stroke-width="1"/>` : '';
    return `<svg class="nwline" viewBox="0 0 ${W} ${H}" role="img" aria-label="Net worth over time">${zero}<polyline points="${pts}" fill="none" stroke="${P.financial.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${hist.map((h, i) => `<g><circle cx="${x(i)}" cy="${y(h.nw)}" r="12" fill="transparent"><title>${fmtDate(h.date)}: ${money(h.nw)}</title></circle><circle cx="${x(i)}" cy="${y(h.nw)}" r="4" fill="${P.financial.color}" stroke="var(--surface)" stroke-width="2" pointer-events="none"/></g>`).join('')}</svg>
      <div class="nwax"><span>${fmtDate(hist[0].date, { month: 'short', year: 'numeric' })}</span><span>${fmtDate(hist[hist.length - 1].date, { month: 'short', year: 'numeric' })}</span></div>
      <details class="mini"><summary>Show as a table</summary><div class="tbl" style="margin-top:8px"><div class="th"><span>Date</span><span>Net worth</span></div>${hist.map((h) => `<div class="tr"><span>${fmtDate(h.date)}</span><span>${money(h.nw)}</span></div>`).join('')}</div></details>`;
  }
  function portfolioData() {
    const sp = spendTotals(), mc = monthlyCalc(), nw = nwCalc();
    const income = mc.inc || num(getP('spending.income'));
    const expenses = sp.tot;
    const cats = SPEND_CATS.map(([c], i) => [c, sp.cats[i][1]]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const debts = getP('debt.list') || []; const debtTot = debts.reduce((a, d) => a + num(d.bal), 0); const mins = debts.reduce((a, d) => a + num(d.min), 0);
    const sim = simDebt(debts, num(getP('debt.extra')), 'avalanche');
    const highRate = debts.filter((d) => num(d.bal) > 0).sort((a, b) => num(b.rate) - num(a.rate))[0];
    const efCur = num(getP('efund.cur')) || num(getP('monthly.ef.cur')), efGoal = num(getP('efund.goal')) || num(getP('monthly.ef.goal'));
    const hist = getP('nw.hist') || []; const hasNw = nw.a || nw.l;
    const groc = { budget: num(getP('meals.budget')), spent: num(getP('meals.spent')), line: num(((getP('spending.items') || {}).Groceries || {}).on ? getP('spending.items.Groceries.cost') : 0) };
    return { groc, sp, income, expenses, left: income - expenses, cats, debts, debtTot, mins, sim, highRate, efCur, efGoal, nw, hist, hasNw, goals: api.financialGoals ? api.financialGoals(ui.joint) : [] };
  }
  /* ---------- Financial Wellness Planner: one page, in sections ---------- */
  // Wheel colors: checked for colorblind-safe neighbors in light and dark mode (see .dn1–.dn7 in globals.css)
  const DONUT_N = 7;
  function arcPath(cx, cy, r0, r1, a0, a1) {
    const pt = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
    return `M${x0} ${y0}A${r1} ${r1} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${big} 0 ${x3} ${y3}Z`;
  }
  function donutHTML() {
    const sp = spendTotals();
    const cats = SPEND_CATS.map(([c], i) => [c, sp.cats[i][1]]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if (!cats.length) return `<div class="donut-empty"><svg viewBox="0 0 220 220" class="donut" aria-hidden="true"><circle cx="110" cy="110" r="81" fill="none" stroke="var(--line)" stroke-width="38"/></svg><p class="empty">Check off your expenses in the Monthly budget and your wheel fills in here, one color per category.</p></div>`;
    const top = cats.slice(0, DONUT_N), rest = cats.slice(DONUT_N).reduce((a, [, v]) => a + v, 0);
    const slices = top.map(([c, v], i) => [c, v, 'dn' + (i + 1)]); if (rest) slices.push(['Everything else', rest, 'dnrest']);
    const total = slices.reduce((a, [, v]) => a + v, 0); let ang = 0;
    const paths = slices.map(([c, v, cls]) => {
      const a0 = ang, a1 = ang + (v / total) * Math.PI * 2; ang = a1;
      const d = slices.length === 1 ? arcPath(110, 110, 62, 100, 0, Math.PI * 1.9999) : arcPath(110, 110, 62, 100, a0, a1);
      return `<path d="${d}" class="${cls}"><title>${esc(c)}: ${money(v)} a month (${Math.round((v / total) * 100)}%)</title></path>`;
    }).join('');
    return `<svg viewBox="0 0 220 220" class="donut" role="img" aria-label="Monthly expenses by category">${paths}
      <text x="110" y="106" text-anchor="middle" class="dn-v">${money(total)}</text><text x="110" y="126" text-anchor="middle" class="dn-k">a month</text></svg>
      <ul class="dlegend">${slices.map(([c, v, cls]) => `<li title="${esc(c)}: ${money(v)}"><span class="sw ${cls}"></span><span class="dl-n">${esc(c)}</span><b>${money(v)}</b><small>${Math.round((v / total) * 100)}%</small></li>`).join('')}</ul>`;
  }
  function tilesHTML() {
    const inc = incomeTotal(), sp = spendTotals(), ac = actualTotal(), left = inc - sp.tot;
    const cls = !inc ? '' : left >= 0 ? 'good' : 'bad';
    return `<div class="sumgrid pf-tiles">
      <div><div class="k">Monthly income</div><div class="v">${inc ? money(inc) : '—'}</div></div>
      <div><div class="k">Planned expenses</div><div class="v">${sp.tot ? money(sp.tot) : '—'}</div></div>
      <div><div class="k">Left over</div><div class="v ${cls}">${inc ? (left < 0 ? '⚠ ' : '') + money(left) : '—'}</div>${cls === 'bad' ? '<div class="hint" style="margin:0">Over budget</div>' : ''}</div>
      <div><div class="k">Actually spent</div><div class="v">${ac ? money(ac) : '—'}</div></div></div>
      ${inc || sp.tot ? `<div class="hbars" style="margin-top:12px">${hbar('Income', inc, Math.max(inc, sp.tot, ac))}${hbar('Planned', sp.tot, Math.max(inc, sp.tot, ac))}${ac ? hbar('Spent', ac, Math.max(inc, sp.tot, ac)) : ''}</div>` : ''}`;
  }
  function suggestions(d) {
    const out = []; const go = (id, lbl) => `<button class="linkish" data-r="jump" data-v="${id}">${lbl} →</button>`;
    if (!d.income) out.push(['Start with the full picture', 'Add your monthly income and expenses so everything here can add up.', go('pf-budget', 'Add my income')]);
    if (d.income && d.left < 0) out.push(['Spending is more than income', `Your expenses are ${money(-d.left)} more than your income each month. Items you marked “No” or “Review” add up to ${money(d.sp.rev)}, which is the first place to look.`, go('pf-budget', 'Review my expenses')]);
    if (d.efCur < 500) out.push(['Build a starter emergency fund', 'A first cushion of about $500 keeps one surprise from turning into new debt.', go('pf-efund', 'Emergency fund')]);
    else if (d.efGoal && d.efCur < d.efGoal) out.push(['Keep growing your emergency fund', `You’re ${money(d.efGoal - d.efCur)} from your goal.${d.left > 0 ? ` Setting aside part of the ${money(d.left)} left over each month would get you there faster.` : ''}`, go('pf-efund', 'Emergency fund')]);
    if (d.highRate && num(d.highRate.rate) >= 15) out.push(['Target high-interest debt', `${esc(d.highRate.name || 'One debt')} charges ${num(d.highRate.rate)}% interest. Paying extra toward the highest rate first (the avalanche method) saves the most interest.`, go('pf-debt', 'Debt')]);
    else if (!d.debts.length) out.push(['List any debts', 'If you have debts, add them to see your debt-free date and the order to pay them off.', go('pf-debt', 'Debt')]);
    if (d.groc.budget && d.groc.spent > d.groc.budget) out.push(['Over your grocery budget this week', `You’ve spent ${money(d.groc.spent - d.groc.budget)} more than you planned. Planning meals for the rest of the week and shopping from a list can help.`, `<button class="linkish" data-r="opentool" data-v="meals">Meal & Grocery Planner →</button>`]);
    if (!d.hasNw) out.push(['Take a net worth snapshot', 'Add what you own and owe, then save a check-in every few months to watch your progress.', go('pf-nw', 'Net worth')]);
    if (!d.goals.length) out.push(['Set a money goal', 'Pick one specific goal, like a trip fund or paying off one card, and track it on Today.', `<button class="linkish" data-r="newgoal" data-v="financial">Set a money goal →</button>`]);
    if (d.income && d.left > 0 && d.efCur >= 500 && !(d.highRate && num(d.highRate.rate) >= 15)) out.push(['Give your extra money a job', `You have about ${money(d.left)} left each month. Decide ahead of time how much goes to savings, debt, and goals.`, go('pf-plan', 'This month’s plan')]);
    return out;
  }
  function expenseFolds() {
    const it = getP('spending.items') || {}, open = getP('spending.open') || {}, oth = getP('spending.other') || {};
    return SPEND_CATS.map(([c, items], ci) => { const ck = ik(c); return `<details class="fold subfold" data-fold="spending.open.${ck}" ${open[ck] ? 'open' : ''}><summary><b>${c}</b><span class="sub">${out('sp-c' + ci)}</span></summary>
      <div class="items">${items.map((x) => { const k = ik(x), r = it[k] || {}; return `<div class="item ${r.on ? 'on' : ''}">${chk(`spending.items.${k}.on`, esc(x), true)}${r.on ? `<div class="item-in"><label>Monthly cost<div class="money">${inp(`spending.items.${k}.cost`, { type: 'number', ph: '0' })}</div></label><label>Necessary?${needSel(`spending.items.${k}.need`, r.need)}</label></div>` : ''}</div>`; }).join('')}
      ${(oth[ck] || []).map((r, i) => `<div class="item other"><div class="oth-in"><label>Other expense${inp(`spending.other.${ck}.${i}.label`, { ph: 'Name it' })}</label><label>Monthly cost<div class="money">${inp(`spending.other.${ck}.${i}.cost`, { type: 'number', ph: '0' })}</div></label><label>Necessary?${needSel(`spending.other.${ck}.${i}.need`, (r || {}).need)}</label><button class="x" data-r="del" data-path="spending.other.${ck}" data-i="${i}" aria-label="Remove">×</button></div></div>`).join('')}
      </div><div class="fold-foot"><button class="btn small" data-r="add" data-path="spending.other.${ck}">+ Add other</button><label class="actual">Actually spent this month<div class="money">${inp(`spending.actual.${ck}`, { type: 'number', ph: '0' })}</div></label></div></details>`; }).join('');
  }
  const TOOL_MONEY = {
    render() {
      if (!getP('monthly.month')) setP('monthly.month', TODAY.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      const d = portfolioData(), bills = getP('monthly.bills') || [], up = getP('monthly.up') || [], sugg = suggestions(d);
      const secH = (t, id) => `<h2 class="pf-h" id="${id}">${t}</h2>`;
      const pFirst = couple ? (couple.partner_name || '').split(' ')[0] : '';
      const jointEmpty = ui.joint && ![...MONEY_KEYS].some((k) => jointTools[k] && Object.keys(jointTools[k]).length > (k === 'monthly' ? 1 : 0));
      const modeBar = couple ? `<div class="planmode"><div class="seg" role="group" aria-label="Whose plan"><button data-r="plan" data-v="me" aria-pressed="${!ui.joint}">My plan</button><button data-r="plan" data-v="us" aria-pressed="${ui.joint}">💞 Our plan</button></div>
        <span class="sub">${ui.joint ? `Shared with ${esc(pFirst)}. You both see and edit this plan.` : `Private to you. ${esc(pFirst)} can’t see it.`}</span></div>
        ${jointEmpty ? `<section class="card together" style="margin:8px 0 14px"><h2>Start your joint plan</h2><p style="margin:6px 0 10px">Fill it in together from scratch, or copy your own plan in as a starting point. ${esc(pFirst)} will see whatever is in “Our plan.”</p><div class="row" style="flex-wrap:wrap;gap:8px"><button class="btn primary small" data-r="copyplan">Copy my plan into our plan</button><span class="sub" style="align-self:center">or just start filling it in below</span></div></section>` : ''}` : '';
      return `${modeBar}<div class="planner-wide">
  <div class="pf-top">
    <aside class="pf-left"><section class="card"><div class="card-head"><h2>Where your money goes</h2><span class="sub">each month</span></div>
      <div data-oh="pf-donut"></div><div data-oh="pf-tiles"></div></section></aside>
    <div class="pf-right stack">
      <section class="card" id="pf-budget"><div class="card-head"><h2>Monthly budget</h2><div style="max-width:170px">${inp('monthly.month', { ph: 'Month' })}</div></div>
        <h3 class="h3" style="margin-top:4px">Income</h3><p class="sub" style="margin-top:0">Take-home pay after taxes, for a typical month.</p>
        <div class="rows">${INC_KEYS.map((k) => `<div class="r2"><span>${k}</span><div class="money">${inp(`monthly.inc.${k}`, { type: 'number', ph: '0' })}</div></div>`).join('')}
        <div class="r2 total"><span>Total monthly income</span><b>${out('m-inc')}</b></div></div>
        <p class="hint">Paid every two weeks? Multiply one paycheck by 26, then divide by 12.</p>
        <h3 class="h3">Expenses</h3><p class="sub" style="margin-top:0">Check each expense that applies, add what it costs a month, and mark whether it’s necessary. At the bottom of each category, add what you actually spent this month.</p>
        <div class="subfolds">${expenseFolds()}</div>
        <div class="rows" style="margin-top:12px">
          <div class="r2 total"><span>Planned expenses</span><b>${out('sp-tot')}</b></div>
          <div class="r2"><span>Actually spent this month</span><b class="num">${out('m-ac')}</b></div>
          <div class="r2"><span>Marked “No” or “Review”</span><b class="num" style="color:var(--gold)">${out('sp-rev')}</b></div></div>
        <div class="callout">${out('m-left')}</div></section>
      <section class="card" id="pf-plan"><h2>This month’s plan</h2><div class="rule"></div>
        <h3 class="h3" style="margin-top:0">Monthly goals</h3><div class="stack" style="gap:8px">
        <div class="goalline">${chk('monthly.goals.save.on', 'Save')}<div class="money">${inp('monthly.goals.save.amt', { type: 'number', ph: 'Amount' })}</div></div>
        <div class="goalline">${chk('monthly.goals.pay.on', 'Pay off')}<div class="money">${inp('monthly.goals.pay.amt', { type: 'number', ph: 'Amount' })}</div></div>
        <div class="goalline">${chk('monthly.goals.imp.on', 'No impulse buys over')}<div class="money">${inp('monthly.goals.imp.amt', { type: 'number', ph: 'Amount' })}</div></div>
        ${chk('monthly.goals.inv.on', 'Increase investments')}
        <div class="goalline">${chk('monthly.goals.oth.on', 'Other')}${inp('monthly.goals.oth.txt', { ph: 'My own goal' })}</div></div>
        <div class="card-head" style="margin-top:16px"><h3 class="h3" style="margin:0">Bills</h3><span class="sub">${out('m-bills')}</span></div>
        ${bills.length ? bills.map((b, i) => `<div class="bill ${b.paid ? 'paid' : ''}"><label class="ck"><input type="checkbox" data-b="monthly.bills.${i}.paid" data-rr ${b.paid ? 'checked' : ''}><span class="sr">Paid</span></label>${inp(`monthly.bills.${i}.name`, { ph: 'Bill' })}<input type="date" data-b="monthly.bills.${i}.date" value="${esc(b.date || '')}" aria-label="Due date"><div class="money">${inp(`monthly.bills.${i}.amt`, { type: 'number', ph: '0' })}</div><button class="x" data-r="del" data-path="monthly.bills" data-i="${i}" aria-label="Remove bill">×</button></div>`).join('') : '<p class="empty">No bills added yet. Check them off as you pay them.</p>'}
        <button class="btn small" data-r="add" data-path="monthly.bills">+ Add a bill</button>
        <h3 class="h3">Upcoming planned expenses</h3>
        ${up.map((b, i) => `<div class="bill">${inp(`monthly.up.${i}.txt`, { ph: 'e.g. Oil change, birthday gift' })}<div class="money">${inp(`monthly.up.${i}.amt`, { type: 'number', ph: '0' })}</div><button class="x" data-r="del" data-path="monthly.up" data-i="${i}" aria-label="Remove">×</button></div>`).join('')}
        <button class="btn small" data-r="add" data-path="monthly.up">+ Add an expense</button>
        <h3 class="h3">Other savings goals</h3><div class="rows">${SAVE_KEYS.map((k) => `<div class="r2"><span>${k}</span><div class="money">${inp(`monthly.sav.${k}`, { type: 'number', ph: '0' })}</div></div>`).join('')}</div>
        <h3 class="h3">Money habits this week</h3>
        ${['Reviewed my financial plan', 'Checked my bank account'].map((h, hi) => `<div class="habit"><span>${h}</span><div class="days">${DAYS7.map((dd, i) => `<label class="day"><input type="checkbox" data-b="monthly.hab.${hi}.${i}" ${getP(`monthly.hab.${hi}.${i}`) ? 'checked' : ''}><span>${dd}</span></label>`).join('')}</div></div>`).join('')}</section>
      <details class="card fold"><summary><b>My priorities & spending check</b></summary>
        <h3 class="h3" style="margin-top:0">My top money goals this month</h3><div class="stack" style="gap:8px">${[0, 1, 2].map((i) => inp(`spending.prio.${i}`, { ph: `Top goal #${i + 1}` })).join('')}</div>
        <label class="lbl" style="margin-top:12px">My “why”</label>${area('spending.why', 'Why is managing my money important to me?')}
        <h3 class="h3">Before I spend…</h3><ul class="checks"><li>Does this align with my priorities and values?</li><li>Can I comfortably afford it?</li><li>Will I still value this next month?</li><li>Is this helping me build the life I want?</li></ul>
        <h3 class="h3">Five principles of financial wellness</h3><ol class="principles"><li><b>Spend intentionally.</b> Every dollar is a chance to support your values and goals.</li><li><b>Save consistently.</b> Small, regular amounts matter more than the size of any one deposit.</li><li><b>Plan ahead.</b> Prepare for bills, emergencies, holidays, and long-term goals so you act instead of react.</li><li><b>Manage debt wisely.</b> Use debt thoughtfully and pay it down with a plan.</li><li><b>Build the life you want.</b> Money is a tool, not the destination.</li></ol>
        <label class="lbl" style="margin-top:12px">Notes</label>${area('spending.notes', 'What did I discover? What will I cancel, lower, or keep?')}</details>
    </div>
  </div>
  ${secH('Savings & debt', 'pf-savings')}
  <div class="pf-two"><div id="pf-efund"><h3 class="pf-sub">Emergency fund</h3>${TOOL_EFUND.render()}</div><div id="pf-debt"><h3 class="pf-sub">Debt payoff</h3>${TOOL_DEBT.render()}</div></div>
  ${secH('Net worth', 'pf-nw')}
  <div class="pf-two"><div>${TOOL_NW.render()}</div><div><section class="card"><div class="card-head"><h2>Net worth over time</h2>${d.hasNw ? `<span class="sub">${money(d.nw.nw)} now</span>` : ''}</div>${nwTrend(d.hist)}</section></div></div>
  ${secH(ui.joint ? 'Our money goals' : 'Goals & groceries', 'pf-goals')}
  <div class="pf-two"><section class="card"><h2>Money goals</h2><div class="rule"></div>
      ${d.goals.length ? d.goals.map((g) => { const pct = g.target ? Math.min(100, Math.round((g.total / g.target) * 100)) : 0; return `<div class="goal" style="grid-template-columns:4px 1fr"><span class="stripe" style="background:${P.financial.color}"></span><div><div class="goal-title">${esc(g.title)}</div>${g.type === 'target' && g.unit !== 'done' ? `<div class="bar"><span style="width:${pct}%;background:${P.financial.color}"></span></div><div class="goal-meta" style="margin-top:4px">${g.unit === '$' ? money(g.total) : g.total} of ${g.unit === '$' ? money(g.target) : g.target + ' ' + esc(g.unit)} (${pct}%)</div>` : `<div class="goal-meta">${g.type === 'habit' ? `${g.total} logged so far` : g.total >= 1 ? 'Done' : 'Not done yet'}</div>`}</div></div>`; }).join('') : '<p class="empty">No money goals yet.</p>'}
      <button class="btn small" style="margin-top:8px" data-r="newgoal" data-v="financial">+ New ${ui.joint ? 'shared ' : ''}money goal</button></section>
    ${ui.joint ? '' : `<section class="card"><div class="card-head"><h2>Groceries this week</h2><span class="sub">from the Meal & Grocery Planner</span></div>
      ${d.groc.budget || d.groc.spent ? `${d.groc.budget ? `<div class="bar" style="height:12px"><span style="width:${Math.min(100, (d.groc.spent / d.groc.budget) * 100)}%;background:${d.groc.spent > d.groc.budget ? '#C0503A' : P.financial.color}"></span></div>` : ''}
        <div class="kv"><span>Spent so far</span><b>${money(d.groc.spent)}</b></div>
        ${d.groc.budget ? `<div class="kv"><span>Weekly budget</span><b>${money(d.groc.budget)}</b></div><div class="kv"><span>${d.groc.spent > d.groc.budget ? '⚠ Over budget by' : 'Left this week'}</span><b>${money(Math.abs(d.groc.budget - d.groc.spent))}</b></div>
        <div class="kv"><span>About per month</span><b>${money(Math.round(d.groc.budget * 4.33))}</b></div>
        ${d.groc.line ? `<p class="hint">Your budget has ${money(d.groc.line)} a month for groceries${Math.abs(d.groc.line - d.groc.budget * 4.33) > 25 ? `, so your weekly budget works out ${d.groc.budget * 4.33 > d.groc.line ? 'higher' : 'lower'}. You may want to match them.` : ', which matches your weekly budget.'}</p>` : ''}` : ''}`
      : `<p class="empty">Add a weekly grocery budget in the Meal & Grocery Planner to see it here.</p>`}
      <button class="btn small" style="margin-top:10px" data-r="opentool" data-v="meals">Open the Meal & Grocery Planner</button></section>`}</div>
  ${secH('Next steps', 'pf-next')}
  <div class="pf-two"><section class="card"><h2>Suggested next steps</h2><div class="rule"></div>
      ${sugg.length ? sugg.map(([t, txt, act]) => `<div class="sugg"><b>${t}</b><p>${txt}</p>${act}</div>`).join('') : '<p class="empty">You’re on track. Keep checking in each month.</p>'}
      <p class="note">These are general, educational suggestions, not personal financial advice.</p></section>
    <section class="card"><h2>Ideas for growing your income</h2><div class="rule"></div><ul class="checks">
      <li>Ask about a raise, more hours, or a higher-paying role where you are. Bring a list of your wins.</li>
      <li>Build one skill that pays more in your field: a certification, license, or course.</li>
      <li>Turn a skill or hobby into side income: baking, crafts, tutoring, pet sitting, or freelance work.</li>
      <li>Sell things you no longer use, and put the money toward a goal.</li>
      <li>Check for benefits you may be missing, like an employer retirement match.</li></ul>
      <button class="btn small" style="margin-top:10px" data-r="newgoal" data-v="financial">Set an “Earn side income” goal</button></section></div>
  <details class="card fold" style="margin-top:14px"><summary><b>Money reading list</b><span class="sub">40 books</span></summary>${TOOL_BOOKS.render()}</details>
</div>`;
    },
    outs() {
      const t = spendTotals(), c = monthlyCalc();
      const o = { ...TOOL_EFUND.outs(), ...TOOL_DEBT.outs(), ...TOOL_NW.outs() };
      const html = { ...(o.__html || {}) };
      Object.assign(o, { 'm-inc': money(c.inc), 'sp-tot': money(t.tot), 'sp-rev': money(t.rev), 'm-ac': c.ac ? money(c.ac) : '—', 'm-bills': `${money(c.bt)} total · ${money(c.bu)} unpaid` });
      t.cats.forEach(([cn, ct], i) => { const a = num(getP(`spending.actual.${ik(SPEND_CATS[i][0])}`)); o['sp-c' + i] = cn || a ? `${cn ? money(ct) + ' planned' : ''}${cn && a ? ' · ' : ''}${a ? money(a) + ' spent' : ''}` : ''; });
      const left = c.inc - c.pl; o['m-left'] = !c.inc ? 'Add your income to see how much is left to give a purpose.' : left > 0 ? `${money(left)} still needs a purpose. Consider savings or debt.` : left === 0 ? 'Every dollar has a purpose. Nice work.' : `Planned spending is ${money(-left)} more than income.`;
      html['pf-donut'] = donutHTML(); html['pf-tiles'] = tilesHTML();
      o.__html = html; return o;
    },
  };

  /* ---------- registry ---------- */
  const more = makeMore({ getP, setP, save, rerenderKeep: (...x) => rerenderKeep(...x), inp, area, chk, pick, out, esc, icon, num, fmtDate, entriesList, saveBtn, kv, T, TODAY, toast, api, uid, key, addMonths, P, ui, fromKey });
  const RES = [
    { id: 'money', pillar: 'financial', title: 'Financial Wellness Planner', desc: 'Your whole money picture on one page: budget, spending wheel, emergency fund, debt, net worth, goals, and next steps.', tag: 'Everything about your money on one page. Fill in your budget and the wheel shows where it goes.', tool: TOOL_MONEY, wide: true },
    { id: 'sleep', pillar: 'physical', title: 'Sleep Journal', desc: 'Log your nights, spot patterns, and build a wind-down routine.', tool: TOOL_SLEEP },
    { id: 'meals', pillar: 'physical', title: 'Meal & Grocery Planner', desc: 'Plan the week, build your list by aisle, and track the budget.', tool: TOOL_MEALS },
    { id: 'coping', pillar: 'mental', title: 'Coping Skills Library', desc: `${COPE_COUNT} skills you can search, filter, and save as favorites.`, tool: TOOL_COPING },
    { id: 'cbt', pillar: 'mental', title: 'CBT Thought Record', desc: 'Check a stressful thought against the facts and find a balanced one.', tool: TOOL_CBT },
    { id: 'burnout', pillar: 'emotional', title: 'Burnout Source Worksheet', desc: 'See clearly what you’re carrying and where the pressure comes from.', tag: 'A worksheet for seeing clearly what you’re carrying.', tool: TOOL_BURN },
    { id: 'selfc', pillar: 'emotional', title: 'Self-Compassion Journal', desc: 'Treat yourself like you’d treat a good friend.', tool: TOOL_SELFC },
    { id: 'couples', pillar: 'relationships', title: 'Couples Communication Workbook', desc: 'Conversation starters, weekly check-ins, and “I” statements.', tool: TOOL_COUPLES },
    { id: 'prayer', pillar: 'spiritual', title: 'Prayer Journal', desc: 'Daily prayers and a request list with answered prayers.', tool: TOOL_PRAYER },
    { id: 'vision', pillar: 'purpose', title: 'Life Vision Planner', desc: 'Values, mission, and a 5-year vision for every pillar.', tool: TOOL_VISION },
    ...more.tools,
  ];

  function renderResources() {
    if (ui.tool) {
      const r = RES.find((x) => x.id === ui.tool);
      const bar = r.noSave ? '' : `<div class="savebar"><span class="savestate ${dirty.size ? '' : 'ok'}" data-savestate>${dirty.size ? 'Saving…' : '✓ All changes saved'}</span><button class="btn primary small" data-r="savenow">Save</button></div>`;
      return toolHead(r) + r.tool.render() + bar;
    }
    const groups = [['financial', 'Money'], ['physical', 'Body'], ['mental', 'Mind & coping'], ['emotional', 'Heart & stress'], ['relationships', 'Relationships'], ['spiritual', 'Spirit'], ['intellectual', 'Learning & growth'], ['environmental', 'Home & surroundings'], ['purpose', 'Purpose & vision']];
    return `<header class="top"><div><div class="brand">Resources</div><h1>Tools & worksheets</h1><div class="sub">Interactive versions of The Holistic Ecosystem workbooks. Everything you type is saved.</div></div></header>
  <div class="stack">${groups.map(([pid, lbl]) => { const rs = RES.filter((r) => r.pillar === pid); return `<section><div class="sec-l">${lbl}</div><div class="rgrid">${rs.map((r) => { const p = P[r.pillar]; const lock = api.isLocked && api.isLocked(r.id); return `<button class="tile rtile ${r.wide ? 'wide' : ''}" style="--c:${p.color}" data-r="opentool" data-v="${r.id}"><span class="ico">${icon(r.pillar)}</span><b>${esc(r.title)}${lock ? ' <span class="badge" style="vertical-align:2px">Plus</span>' : ''}</b><small>${esc(r.desc)}</small></button>`; }).join('')}</div></section>`; }).join('')}
  ${!SOON.length ? '' : `<section><div class="sec-l">Coming soon</div><div class="chips">${SOON.map(([pid, t]) => `<span class="chip static soon" style="--c:${P[pid].color}"><span style="color:${P[pid].color};display:inline-flex;vertical-align:-3px;margin-right:4px">${icon(pid, 14)}</span>${t}</span>`).join('')}</div></section>`}</div>`;
  }
  function updateOuts() {
    if (!ui.tool) return; const r = RES.find((x) => x.id === ui.tool); if (!r.tool.outs) return;
    const o = r.tool.outs();
    Object.entries(o).forEach(([k, v]) => { if (k === '__html') return; root.querySelectorAll(`[data-o="${k}"]`).forEach((e) => (e.textContent = v)); });
    if (o.__html) Object.entries(o.__html).forEach(([k, v]) => root.querySelectorAll(`[data-oh="${k}"]`).forEach((e) => (e.innerHTML = v)));
    if (r.tool.after) r.tool.after(root);
  }
  function render() { root.innerHTML = renderResources(); updateOuts(); }
  function rerenderKeep() { const y = window.scrollY; render(); window.scrollTo(0, y); }
  const openTool = (id) => { flush(); ui.tool = id; render(); window.scrollTo(0, 0); api.onToolChange && api.onToolChange(id); };

  /* ---------- events ---------- */
  const onInput = (e) => {
    const el = e.target;
    if (el.id === 'cope-q') { ui.copeQ = el.value; const cl = root.querySelector('#copelist'); if (cl) cl.innerHTML = copeList(); return; }
    if (!el.dataset.b) return;
    setP(el.dataset.b, el.type === 'checkbox' ? el.checked : el.value); save();
    if (el.hasAttribute('data-rr') && el.type === 'checkbox') rerenderKeep(); else updateOuts();
  };
  const onChange = (e) => { const el = e.target; if (el.dataset.b && el.hasAttribute('data-rr') && el.type !== 'checkbox') rerenderKeep(); };
  const onToggle = (e) => { const d = e.target; if (d.dataset && d.dataset.fold) { setP(d.dataset.fold, d.open); save(); } };
  const refreshCope = () => { const y = window.scrollY; const cl = root.querySelector('#copelist'); if (cl) cl.innerHTML = copeList(); window.scrollTo(0, y); };
  const onClick = (e) => {
    const b = e.target.closest('[data-r]'); if (!b || !root.contains(b)) return; const a = b.dataset.r;
    if (more.click(a, b)) return;
    if (a === 'opentool') { if (api.isLocked && api.isLocked(b.dataset.v)) { api.openPlus(b.dataset.v === 'money' ? 'portfolio' : 'tool'); return; } openTool(b.dataset.v); }
    else if (a === 'jump') { const el = root.querySelector('#' + b.dataset.v); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (a === 'savenow') { const k = curKey(); if (k) dirty.add(k); flush(); setSaveState('✓ All changes saved', 'ok'); toast('Saved'); }
    else if (a === 'newgoal') api.newGoal && api.newGoal(b.dataset.v, ui.tool === 'money' && ui.joint);
    else if (a === 'plan') { flush(); ui.joint = b.dataset.v === 'us'; render(); window.scrollTo(0, 0); }
    else if (a === 'copyplan') { MONEY_KEYS.forEach((k) => { if (tools[k]) { jointTools[k] = JSON.parse(JSON.stringify(tools[k])); dirty.add('c:' + k); } }); flush(); render(); toast('Copied your plan into “Our plan.”'); }
    else if (a === 'back') openTool(api.home || null);
    else if (a === 'pick') { const p = b.dataset.path, v = b.dataset.v; if (b.hasAttribute('data-multi')) { const arr = [...(getP(p) || [])]; const i = arr.indexOf(v); i < 0 ? arr.push(v) : arr.splice(i, 1); setP(p, arr); } else setP(p, String(getP(p)) === v ? '' : v); save(); rerenderKeep(); }
    else if (a === 'set') { setP(b.dataset.path, b.dataset.v); save(); rerenderKeep(); }
    else if (a === 'add') { const arr = getP(b.dataset.path) || []; arr.push({}); setP(b.dataset.path, arr); save(); rerenderKeep(); }
    else if (a === 'del') { const arr = getP(b.dataset.path) || []; arr.splice(+b.dataset.i, 1); setP(b.dataset.path, arr); save(); rerenderKeep(); }
    else if (a === 'efuse') { const v = num(getP('efund.ess')) * (num(getP('efund.mo')) || 3); if (v) { setP('efund.goal', String(v)); save(); rerenderKeep(); toast('Goal set to ' + money(v)); } else toast('Add your essential monthly expenses first'); }
    else if (a === 'efgoal') { const c = efCalc(); if (!c.goal) { toast('Set a goal amount first'); return; } api.addGoal({ ...(ui.tool === 'money' && ui.joint && couple ? { coupleId: couple.couple_id } : {}), id: uid(), pillar: 'financial', title: ui.tool === 'money' && ui.joint ? 'Build our emergency fund' : 'Build an emergency fund', type: 'target', count: 1, per: 'day', target: c.goal, unit: '$', why: getP('efund.why') || '', deadline: getP('efund.date') || key(addMonths(TODAY, 6)), sure: 7 }, c.cur); toast('Added to your goals'); }
    else if (a === 'debtex') { setP('debt.list', [{ name: 'Store Card', bal: '500', rate: '18', min: '25' }, { name: 'Credit Card', bal: '2000', rate: '24', min: '60' }, { name: 'Personal Loan', bal: '5000', rate: '10', min: '150' }]); setP('debt.extra', '100'); save(); rerenderKeep(); }
    else if (a === 'nwsave') { const h = getP('nw.hist') || []; const nw = nwCalc().nw; const ex = h.findIndex((x) => x.date === T); ex >= 0 ? (h[ex].nw = nw) : h.push({ date: T, nw }); setP('nw.hist', h); save(); rerenderKeep(); toast('Check-in saved'); }
    else if (a === 'book') { const k = b.dataset.k; const cur = getP('books.' + k); setP('books.' + k, cur === b.dataset.v ? '' : b.dataset.v); save(); rerenderKeep(); }
    else if (a === 'ccat') { ui.copeCat = b.dataset.v; rerenderKeep(); }
    else if (a === 'ctime') { ui.copeTime = ui.copeTime === b.dataset.v ? '' : b.dataset.v; rerenderKeep(); }
    else if (a === 'cfav') { ui.copeFav = !ui.copeFav; rerenderKeep(); }
    else if (a === 'fav') { const f = getP('coping.fav') || []; const k = b.dataset.k, i = f.indexOf(k); i < 0 ? f.push(k) : f.splice(i, 1); setP('coping.fav', f); save(); refreshCope(); }
    else if (a === 'used') { const k = b.dataset.k; setP('coping.used.' + ik(k), (getP('coping.used.' + ik(k)) || 0) + 1); save(); toast(api.logCoping() ? 'Nice. Counted toward your coping skill goal.' : 'Nice work. Logged it.'); refreshCope(); }
    else if (a === 'bsec') { setP('burn.sec', +b.dataset.v); save(); render(); window.scrollTo(0, 0); }
    else if (a === 'saveentry') { const t = b.dataset.tool, d = getP(t + '.draft') || {}; const filled = Object.entries(d).some(([k, v]) => k !== 'date' && (Array.isArray(v) ? v.length : String(v || '').trim())); if (!filled) { toast('Fill in at least one field first'); return; } const list = getP(t + '.entries') || []; list.push({ ...d, date: d.date || T, ...(t === 'couples' && couple ? { by: api.myName || '' } : {}) }); setP(t + '.entries', list); setP(t + '.draft', {}); save(); rerenderKeep(); toast('Saved'); }
    else if (a === 'mealday') { ui.mealDay = b.dataset.v; rerenderKeep(); }
    else if (a === 'mealclear') { setP('meals.plan', {}); save(); rerenderKeep(); }
    else if (a === 'grocclear') { setP('meals.groc', (getP('meals.groc') || []).filter((x) => !x.done)); save(); rerenderKeep(); }
    else if (a === 'starter') { setP('couples.si', (getP('couples.si') || 0) + 1); save(); rerenderKeep(); }
    else if (a === 'prayans') { const reqs = getP('prayer.reqs'); const r = reqs[+b.dataset.i]; r.ans = r.ans ? '' : T; setP('prayer.reqs', reqs); save(); rerenderKeep(); if (r.ans) toast('Answered prayer recorded'); }
    else if (a === 'val') { const v = getP('vision.values') || []; const i = v.indexOf(b.dataset.v); if (i >= 0) v.splice(i, 1); else if (v.length < 5) v.push(b.dataset.v); else { toast('Pick up to 5. Remove one first.'); return; } setP('vision.values', v); save(); rerenderKeep(); }
    else if (a === 'visgoal') { const pid = b.dataset.v, st = (getP(`vision.p.${pid}.step`) || '').trim(); if (!st) { toast('Write a first step first'); return; } api.addGoal({ id: uid(), pillar: pid, title: st.slice(0, 200), type: 'target', count: 1, per: 'day', target: 1, unit: 'done', why: (getP(`vision.p.${pid}.five`) || '').trim(), deadline: key(addMonths(TODAY, 1)), sure: 7 }, 0); toast('Added to your goals'); }
  };
  const onSubmit = (e) => {
    const f = e.target; if (!f.dataset.rForm) return; e.preventDefault();
    if (more.submit(f.dataset.rForm, root)) return;
    if (f.dataset.rForm === 'groc') { const inpEl = root.querySelector('#g-item'); const t = inpEl.value.trim(); if (!t) return; const g = getP('meals.groc') || []; const a = root.querySelector('#g-aisle').value; ui.lastAisle = a; g.push({ t, a, done: false }); setP('meals.groc', g); save(); rerenderKeep(); root.querySelector('#g-item')?.focus(); }
    if (f.dataset.rForm === 'prayreq') { const t = root.querySelector('#pr-new').value.trim(); if (!t) return; const r = getP('prayer.reqs') || []; r.push({ t, d: T, ans: '' }); setP('prayer.reqs', r); save(); rerenderKeep(); }
  };
  const onHide = () => { if (document.visibilityState === 'hidden') flush(); };

  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  root.addEventListener('toggle', onToggle, true);
  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);
  document.addEventListener('visibilitychange', onHide);
  render();

  return {
    destroy() {
      flush();
      root.removeEventListener('input', onInput); root.removeEventListener('change', onChange);
      root.removeEventListener('toggle', onToggle, true); root.removeEventListener('click', onClick);
      root.removeEventListener('submit', onSubmit); document.removeEventListener('visibilitychange', onHide);
    },
    openTool,
  };
}
