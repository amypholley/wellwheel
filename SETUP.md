# WellWheel: setup guide (Phase 1)

You'll set up three free services. Plan on about 30 minutes.

- **GitHub** stores the code.
- **Supabase** handles accounts, the database, and (later) photos.
- **Vercel** puts the app on the internet at a web address you can open on your phone.

---

## Step 1: Put the code on GitHub

1. Go to https://github.com and sign up or log in.
2. Click the **+** in the top-right corner, then **New repository**.
3. Name it `wellwheel`. Choose **Private**. Leave everything else as it is and click **Create repository**.
4. Tell Claude the repository name (for example `yourname/wellwheel`). Claude will upload the code for you.

## Step 2: Create the Supabase project

1. Go to https://supabase.com, click **Start your project**, and sign in with GitHub.
2. Click **New project**.
   - **Name:** `wellwheel`
   - **Database password:** click **Generate a password** and save it somewhere safe, like a password manager. The app doesn't need it, but you'll want it if you ever need support.
   - **Region:** pick the one closest to you.
   - Click **Create new project** and wait about 2 minutes.
3. **Create the tables.** In the left sidebar, click **SQL Editor**, then **+ New query**. Open the file `supabase/schema.sql` from this project, copy all of it, paste it into the editor, and click **Run**. You should see "Success. No rows returned."
4. **Copy your keys.** Click **Project Settings** (the gear at the bottom left).
   - Under **Data API** (or **API**), copy the **Project URL**. It looks like `https://abcd1234.supabase.co`.
   - Under **API Keys**, copy the **anon / public** key (it may be called the **publishable** key).
   - On the same page, copy the **service_role** key (it may be called the **secret** key; click **Reveal** first). **Keep this one secret.** Don't email it or post it anywhere.

## Step 3: Put the app online with Vercel

1. Go to https://vercel.com and click **Sign up**, then **Continue with GitHub**.
2. Click **Add New…**, then **Project**. Find `wellwheel` and click **Import**. If you don't see it, click **Adjust GitHub App Permissions** and give Vercel access to that repository.
3. Open **Environment Variables** and add these three, one at a time (paste the name on the left and the value on the right):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role / secret key |

4. Click **Deploy** and wait about a minute. When you see the confetti, click the preview to open the app. Copy its web address (something like `https://wellwheel-abc.vercel.app`).

## Step 4: Tell Supabase your app's web address

This is what makes password-reset and confirmation emails link back to your app.

1. In Supabase, click **Authentication** in the left sidebar, then **URL Configuration**.
2. Set **Site URL** to your Vercel address, for example `https://wellwheel-abc.vercel.app`.
3. Under **Redirect URLs**, click **Add URL** and enter your address with `/**` on the end, for example `https://wellwheel-abc.vercel.app/**`. Click **Save**.

## Step 5: Test it

1. Open your Vercel address on your phone.
2. Tap **Create an account**. Use a real email address.
3. Check your email and tap the confirmation link. You'll land in the app, signed in.
4. Try the Phase 1 checklist below.

**Add it to your home screen**
- **iPhone (Safari):** tap the Share button (the square with an arrow), then **Add to Home Screen**.
- **Android (Chrome):** tap the **⋮** menu, then **Add to Home screen** (or **Install app**).

### Phase 1 test checklist
- [ ] Create an account. Log out, then log back in with your **username**, then again with your **email**.
- [ ] Tap **Forgot your password?**, use the email link, and set a new password.
- [ ] Create a goal with the 3-step wizard. Try **+1 cup** on water and **Log** on a dollar goal.
- [ ] Write a journal entry and add a gratitude line.
- [ ] Open the app on a second device (or a computer), log in, and check that everything is there.
- [ ] Profile (the circle at the top right of Today): change your display name and check that your couple code shows.
- [ ] Optional: create a throwaway account and use **Delete account** to make sure everything is removed.

---

### Good to know
- **Email limits:** Supabase's free built-in email only sends a few emails per hour. That's fine for testing. Before you launch to real users, set up your own email sender under Supabase → **Authentication** → **Emails** → **SMTP Settings** (Resend, Postmark, or similar). Claude can walk you through this.
- **Don't want email confirmation while testing?** Go to Supabase → **Authentication** → **Sign In / Providers** → **Email**, turn off **Confirm email**, and save. Turn it back on before launch.
- **Updates:** every time new code is pushed to GitHub, Vercel republishes the app automatically.
- **Security:** each person can only read and change their own data. The database itself enforces this, and it was tested before handoff.
