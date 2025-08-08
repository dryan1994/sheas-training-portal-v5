# Shea's Training Portal — Full Build (Supabase wired)

## Deploy
1) Upload all files in this folder to your GitHub repo (root). 
2) In Supabase → SQL Editor → paste `sql/schema.sql` → Run.
3) Supabase → Auth → Users → Add user (your email + temp password, auto-confirm).
4) Visit the site and log in once.
5) Supabase → Table Editor → `managers` → set your `role` = `creator`.

If Sign In doesn't work, hard refresh the site (Ctrl+F5) and confirm your Supabase URL & anon key are correct in `scripts/supabase.js`.
