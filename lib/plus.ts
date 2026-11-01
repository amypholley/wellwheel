// WellWheel Plus settings. Change what's free vs. Plus here.
import { PillarId } from './data';

// Stripe payment links (from the Stripe dashboard -> Payment Links)
export const PLUS_LINKS = {
  individual: 'https://buy.stripe.com/9B66oId4QgAc7hrg2Sao805',
  couple: 'https://buy.stripe.com/5kQdRa6Gs6ZCeJT03Uao806',
};
// Price text shown on the buttons. Fill in the couples price, e.g. '$8.99/month'.
export const PLUS_PRICE = { individual: '$5.99/month', couple: '' };

// ---------- What free accounts get ----------
export const FREE_PILLAR_LIMIT = 2;          // free: goals in up to 2 pillars
export const FREE_CUSTOM_GOALS = false;      // free: preset goals only ("Write my own goal" is Plus)
export const FREE_CHALLENGES = false;        // free: regular daily prompt; 30-day challenge prompts are Plus
export const FREE_COUPLE = false;            // free: couple connection is Plus (a couples plan covers both)
export const FREE_PORTFOLIO = false;         // free: the Portfolio tab / Financial Wellness Planner is Plus
// Worksheets anyone can use; every other worksheet is Plus
export const FREE_TOOLS = ['coping', 'selfc', 'sleep', 'prayer'];

export type PlusInfo = { plus: boolean; source?: 'me' | 'partner'; plan?: 'individual' | 'couple'; status?: string; until?: string; can_manage?: boolean; paid_by?: string };

export const PLUS_PERKS = [
  'Goals in all 9 pillars, and your own custom goals',
  'Monthly pillar report: where your energy went and what to focus on next',
  'Every 30-day challenge',
  'All interactive worksheets, including the Financial Wellness Planner and Portfolio',
  'Couple connection: shared goals, map, bucket list, and joint money plan',
];
export const pillarsInUse = (goals: { pillar: PillarId }[]) => [...new Set(goals.map((g) => g.pillar))];
