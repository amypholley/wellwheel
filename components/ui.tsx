'use client';
import { ICONS, PILLARS, PillarId } from '@/lib/data';
import { State, pillarScore } from '@/lib/core';
import { t } from '@/lib/i18n';

export function Icon({ id, size = 22 }: { id: PillarId; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[id] }} />
  );
}

export function sector(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  const p = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(r2, a0), [x1, y1] = p(r2, a1), [x2, y2] = p(r1, a1), [x3, y3] = p(r1, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0},${y0}A${r2},${r2} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${r1},${r1} 0 ${large} 0 ${x3},${y3}Z`;
}

export function Wheel({ S }: { S: State }) {
  const cx = 85, cy = 85, r1 = 30, r2 = 82, step = (2 * Math.PI) / 9, gap = 0.035;
  const active = PILLARS.filter((p) => pillarScore(S, p.id) !== null).length;
  return (
    <svg viewBox="0 0 170 170" role="img" aria-label="Pillar balance this week">
      {PILLARS.map((p, i) => {
        const a0 = -Math.PI / 2 + i * step + gap, a1 = a0 + step - 2 * gap;
        const sc = pillarScore(S, p.id);
        const r = sc === null ? 0 : r1 + 6 + (r2 - r1 - 6) * Math.max(0.04, sc);
        return (
          <g key={p.id}>
            <path d={sector(cx, cy, r1, r2, a0, a1)} fill={p.color} opacity={sc === null ? 0.12 : 0.22}><title>{p.name}</title></path>
            {sc !== null && <path d={sector(cx, cy, r1, r, a0, a1)} fill={p.color}><title>{`${p.name}: ${Math.round(sc * 100)}%`}</title></path>}
          </g>
        );
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="Lora, serif" fontWeight={600} fontSize={20} fill="var(--ink)">{active}/9</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="var(--muted)">{t('pillars')}</text>
    </svg>
  );
}

export function LogoWheel({ size = 84 }: { size?: number }) {
  const st = (2 * Math.PI) / 9;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {PILLARS.map((p, i) => { const a0 = -Math.PI / 2 + i * st + 0.04, a1 = a0 + st - 0.08; return <path key={p.id} d={sector(50, 50, 20, 46, a0, a1)} fill={p.color} />; })}
      <circle cx="50" cy="50" r="14" fill="none" stroke="var(--gold)" strokeWidth="2" />
    </svg>
  );
}

export const initials = (n: string) => (n || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
