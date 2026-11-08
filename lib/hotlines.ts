// Crisis and support lines shown in the Mental pillar, Coping Skills, Anxiety, and DBT.
// Numbers change from time to time: check them now and then, and point people to findahelpline.com for anywhere not listed.
export type Line = { name: string; how: string; tel?: string; sms?: string; note?: string };
export const US_LINES: Line[] = [
  { name: '988 Suicide & Crisis Lifeline', how: 'Call or text 988 · chat at 988lifeline.org', tel: '988', note: '24/7, free, confidential. Press 2 for Spanish.' },
  { name: 'Crisis Text Line', how: 'Text HOME to 741741', sms: '741741', note: '24/7 text support.' },
  { name: 'Veterans Crisis Line', how: 'Call 988, then press 1 · text 838255', tel: '988', note: 'For veterans, service members, and their families.' },
  { name: 'The Trevor Project (LGBTQ+ young people)', how: 'Call 1-866-488-7386 · text START to 678-678', tel: '18664887386' },
  { name: 'Trans Lifeline', how: 'Call 1-877-565-8860', tel: '18775658860', note: 'Peer support run by and for trans people.' },
  { name: 'SAMHSA National Helpline', how: 'Call 1-800-662-4357', tel: '18006624357', note: 'Treatment referrals for mental health and substance use. 24/7, free.' },
  { name: 'National Domestic Violence Hotline', how: 'Call 1-800-799-7233 · text START to 88788', tel: '18007997233' },
  { name: 'RAINN Sexual Assault Hotline', how: 'Call 1-800-656-4673', tel: '18006564673' },
  { name: 'National Maternal Mental Health Hotline', how: 'Call or text 1-833-852-6262', tel: '18338526262', note: 'For pregnant and new parents. 24/7.' },
  { name: 'Childhelp National Child Abuse Hotline', how: 'Call or text 1-800-422-4453', tel: '18004224453' },
  { name: 'NAMI HelpLine', how: 'Call 1-800-950-6264 · text "helpline" to 62640', tel: '18009506264', note: 'Information and support, weekdays.' },
  { name: 'Disaster Distress Helpline', how: 'Call or text 1-800-985-5990', tel: '18009855990' },
];
export const INTL_LINES: Line[] = [
  { name: 'Canada', how: 'Call or text 988 (Suicide Crisis Helpline)', tel: '988' },
  { name: 'United Kingdom & Ireland', how: 'Samaritans: call 116 123', tel: '116123' },
  { name: 'Australia', how: 'Lifeline: call 13 11 14', tel: '131114' },
  { name: 'New Zealand', how: 'Call or text 1737', tel: '1737' },
  { name: 'Mexico', how: 'Línea de la Vida: 800 911 2000', tel: '8009112000' },
  { name: 'France', how: 'Call 3114', tel: '3114' },
  { name: 'Germany', how: 'TelefonSeelsorge: 0800 111 0 111', tel: '08001110111' },
  { name: 'Spain', how: 'Call 024', tel: '024' },
  { name: 'India', how: 'Tele MANAS: 14416', tel: '14416' },
  { name: 'Philippines', how: 'NCMH Crisis Hotline: 1553', tel: '1553' },
  { name: 'South Africa', how: 'SADAG: 0800 567 567', tel: '0800567567' },
  { name: 'Anywhere else', how: 'findahelpline.com lists free, confidential lines in over 130 countries', note: 'Emergency numbers: 911 (US, Canada, Mexico), 112 (Europe and many countries), 999 (UK), 000 (Australia).' },
];
// Plain HTML version for the worksheet pages
export function hotlinesHTML(esc: (s: string) => string) {
  const li = (l: Line) => `<li><b>${esc(l.name)}</b><span>${l.tel ? `<a href="tel:${l.tel}">${esc(l.how)}</a>` : l.sms ? `<a href="sms:${l.sms}">${esc(l.how)}</a>` : /findahelpline/.test(l.how) ? `<a href="https://findahelpline.com" target="_blank" rel="noopener">${esc(l.how)}</a>` : esc(l.how)}</span>${l.note ? `<small>${esc(l.note)}</small>` : ''}</li>`;
  return `<details class="lines"><summary>📞 Crisis & support lines (US and international)</summary>
    <p class="note" style="margin:10px 0">If you or someone else is in immediate danger, call <b>911</b> (or your local emergency number).</p>
    <h3 class="h3">United States</h3><ul>${US_LINES.map(li).join('')}</ul>
    <h3 class="h3">Other countries</h3><ul>${INTL_LINES.map(li).join('')}</ul>
    <p class="hint" style="margin-bottom:0">Numbers can change. If one doesn’t work, visit findahelpline.com.</p></details>`;
}
