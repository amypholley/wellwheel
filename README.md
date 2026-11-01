# WellWheel

A holistic wellness app from The Holistic Ecosystem, built with Next.js and Supabase.

- **Setup (plain language):** see [SETUP.md](SETUP.md)
- **Database:** `supabase/schema.sql`
- **Design spec:** the original single-file prototype

## Build phases
1. ✅ Accounts, Today, Goals, Progress, Journal, Gratitude
2. ✅ Resources (all worksheets)
3. ✅ Adventures (maps, photos, bucket lists, hobbies)
4. ✅ Couple connection and sharing
5. Plus subscription (Stripe)

## Developers
```
cp .env.example .env.local   # fill in Supabase keys
npm install
npm run dev
```

## Ideas for later
- Grocery history: save each week's grocery budget and spending, add a monthly grocery goal, and show grocery spending over time in the portfolio.
- Fuller "grow your income" resources under the Financial Wellness Planner.
