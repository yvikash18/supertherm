# Supertherm CMS + Deploy Console — Setup

Manage the content of every route from a passcode-protected console, with a full
change history, and trigger a Cloudflare Pages deploy from the same screen.

```
Browser (/admin)  ──POST(passcode)──►  Supabase Edge Function `admin`
                                         │  (service role, secrets stay server-side)
                                         ├─► pages / page_revisions  (read + write + history)
                                         └─► Cloudflare Pages deploy hook  (rebuild + publish)

Static build (Astro)  ──fetch(anon, build time)──►  Supabase `pages`  ──►  live site
                        (falls back to src/data/site.ts if not configured)
```

## What's in the repo

| Path | Purpose |
|------|---------|
| `supabase/migrations/0001_init.sql` | Tables: `pages`, `page_revisions`, `deployments` + RLS (public read, writes via service role only) |
| `supabase/seed.sql` | Seeds one row per route from the current site content |
| `supabase/functions/admin/index.ts` | Edge Function: passcode-gated read/save/history + deploy trigger |
| `src/data/content.ts` | Build-time loader — merges Supabase content over `site.ts`, falls back to static |
| `src/pages/admin.astro` | The console UI (`/admin`, no-index) |
| `.env.example` | Required env vars |

## One-time setup

### 1. Create a Supabase project
Grab **Project URL**, **anon key**, and **service_role key** from *Project Settings → API*.

### 2. Create the schema + seed
In the Supabase **SQL editor**, run:
1. `supabase/migrations/0001_init.sql`
2. `supabase/seed.sql`

(Or with the CLI: `supabase db push` then `psql < supabase/seed.sql`.)

### 3. Deploy the Edge Function
```bash
supabase functions deploy admin --no-verify-jwt
supabase secrets set ADMIN_PASSCODE="choose-a-strong-passcode"
supabase secrets set CF_DEPLOY_HOOK="https://api.cloudflare.com/client/v4/pages/.../deploy_hooks/..."
```
Get the **CF_DEPLOY_HOOK** from Cloudflare Pages → your project → *Settings → Builds & deployments → Deploy hooks*.

### 4. Point the site at Supabase
Create `.env` (see `.env.example`):
```
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
Set the same two vars in **Cloudflare Pages → Settings → Environment variables** so production builds pull live content.

### 5. Deploy the site to Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

## Daily use

1. Go to `https://your-site/admin`, enter the passcode.
2. Pick a route, edit its JSON content, add a **summary of what changed**, click **Save** (logged to history).
3. Click **Deploy site** → rebuilds and publishes with the latest content.
4. **Change history** under each route shows every edit (summary · time · author).

## How content flows to pages

`src/data/content.ts` fetches `pages` at build time and exposes:
- `company` — global info (merged over `site.ts`)
- `stats`, `home` — homepage bits
- `heroFor(slug, fallback)` — per-route hero (already wired into About, Products, Gallery, Branches, Clients, Contact)

To make more fields editable, add them to the route's JSON in the console and read
them via `cmsContent['<slug>']` (or extend `content.ts`). Structured data such as the
full product spec tables can be pasted into the `products` JSON and mapped in `content.ts`.

## Security notes
- The **service_role key never reaches the browser** — only the Edge Function uses it.
- The console only holds the **shared passcode** (kept in `sessionStorage`); every write is
  re-verified server-side.
- `/admin` is `noindex` and disallowed in `robots.txt`.
- A shared passcode is convenient but coarse — upgrade to Supabase Auth (per-user) if you
  need individual accounts/roles later.
