# Shea's Training Portal V2 — Ready to Deploy

## What you have
- Static app (index.html, dashboard.html) wired to your Supabase project.
- SQL schema for Supabase tables, functions, and row-level security.
- CNAME configured for: training.mayofs.com

## Deploy to GitHub Pages (5 steps)
1) Create a new GitHub repo (or open your existing one).
2) Click **Add file → Upload files** and drag **all contents** of this folder (not the folder itself).
3) Commit changes.
4) Repo **Settings → Pages** → Source: `main` branch, folder: `/ (root)` → Save.
5) Wait 1–3 minutes; your site is live.

## Set up Supabase (3 steps)
1) In Supabase → **SQL Editor** → paste `sql/schema.sql` → Run.
2) **Auth → Users → Invite** your email; log in via the site.
3) **Table Editor → managers** → set your row `role` = `creator`.

## Custom domain (training.mayofs.com)
- This repo includes a `CNAME` file set to `training.mayofs.com`.
- In your domain’s DNS, create a **CNAME** record:
  - **Host/Name**: training
  - **Value/Target**: YOUR_GITHUB_USERNAME.github.io
  - TTL: default
- In the repo: Settings → Pages → Custom domain → enter `training.mayofs.com` (if not already detected).

That’s it.
