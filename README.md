# Shea's Training Portal V2 — Supabase

## Setup (5 steps)
1) Create a Supabase project (free). In Settings → API, copy Project URL + anon public key.
2) In this app, set creds either:
   - Quick: open browser console →
     localStorage.setItem('SUPABASE_URL','https://YOUR_PROJECT.supabase.co')
     localStorage.setItem('SUPABASE_ANON_KEY','YOUR_PUBLIC_ANON_KEY')
   - Permanent: edit `scripts/supabase.js` placeholders.
3) In Supabase SQL Editor, paste `sql/schema.sql` and run.
4) Auth → invite your email. Log in via `index.html`. In `managers` table, set your row `role`='creator'.
5) Import your data into `firefighters`, `courses` (priority 1..6 for core), and use the app to add sessions & assignments.

### Refresher rule
If Excel shows **Refresher Required = YES** for (firefighter, course), treat initial as done. Import as enrolment with `status='completed'` and `needs_refresher=true` until refresher is attended.
If **NO**, do nothing (no refresher notices).

### Run
- Open `index.html` → login → `dashboard.html`.
- Create sessions (start/end), assign firefighters, mark completions.
