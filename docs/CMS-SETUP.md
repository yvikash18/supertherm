# Content console: setup and use

The site has a console at `/admin` where everything in `src/data/site.ts` can be edited
through forms: company and contact details, the menu, home page figures, machines and
their specification tables, about page, offices, clients and testimonials, photos, and
page headings. People sign in with an email and password.

It runs entirely on Cloudflare, alongside the site:

```
Browser (/admin)  ── same-origin requests, HttpOnly session cookie ──►  Pages Functions (/api/*)
                                                                         ├─ D1 database: content, change history, admins, sessions
                                                                         ├─ R2 bucket: uploaded images (optional), served at /media/*
                                                                         └─ Cloudflare Pages deploy hook: rebuild the site

Site build (Astro)  ── GET {PUBLIC_CMS_URL}/api/content at build time ──►  published content
                       (falls back to src/data/site.ts if unset or unreachable)
```

Three ideas to keep in mind:

- **Save** stores your edit in the console and adds it to the change history. Nothing changes on the live site.
- **Publish** takes everything saved, marks it as the published version, and asks Cloudflare to rebuild the site. The public endpoint only ever returns published content, so unpublished edits are private.
- A section that has never been saved shows the built-in content from `site.ts`. Once a section is saved and published, the console's copy wins over `site.ts` for that section.

## What is in the repo

| Path | Purpose |
|------|---------|
| `functions/api/[[path]].ts`, `functions/media/[[path]].ts` | Cloudflare Pages Functions entry points. Deployed automatically with the site. |
| `server/cms.ts` | The backend: sign-in, sessions, content, history, publish, uploads. |
| `server/password.mjs` | Password hashing, shared by the backend and the admin script. |
| `d1/migrations/0001_init.sql` | Database tables. |
| `d1/seed.sql` | Optional starting content, generated from `site.ts` by `npm run cms:seed`. |
| `scripts/cms-admin.mjs` | Creates an admin or resets a password (`npm run cms:admin`). |
| `wrangler.toml` | Cloudflare bindings: `DB` (D1) and `MEDIA` (R2). |
| `src/pages/admin.astro`, `src/admin/` | The console page and its code. |
| `src/data/content.ts` | Build-time loader: published content if available, else `site.ts`. |
| `src/data/cms-sections.ts` | Which `site.ts` exports belong to which console section. |

## One-time setup

You need Node 20 or newer, and a Cloudflare account that owns the Pages project
`superthermcorporations`. Run the commands from the project folder.

### 1. Sign in to Cloudflare from the terminal

```bash
npm install
npx wrangler login
```

### 2. Create the database

```bash
npx wrangler d1 create supertherm-cms
```

The command prints a `database_id`. Open `wrangler.toml` and replace the placeholder
`00000000-0000-0000-0000-000000000000` with it.

### 3. Create the tables

```bash
npx wrangler d1 migrations apply supertherm-cms --remote
```

Optional: load the site's built-in content into the console as a starting point.
You can skip this. The console shows the built-in content for unsaved sections anyway,
and skipping it means later edits to `site.ts` keep showing through until a section is
saved in the console.

```bash
npm run cms:seed      # regenerates d1/seed.sql from the current site.ts
npx wrangler d1 execute supertherm-cms --remote --file=d1/seed.sql
```

### 4. Image uploads (optional)

```bash
npx wrangler r2 bucket create supertherm-media
```

R2 has to be enabled on the Cloudflare account first (dashboard, R2). If you do not want
uploads, delete the `[[r2_buckets]]` block from `wrangler.toml`. Image fields then accept a
path such as `/assets/photo.jpg` or a full web address, and the Upload button is disabled.

Uploads are limited to signed-in admins, to JPG, PNG, WebP, AVIF and GIF, and to 5 MB.
The bucket stays private; images are served by the site at `/media/...`.

### 5. Create the first admin

There is no sign-up page. Admins are created from the terminal:

```bash
npm run cms:admin -- you@example.com
```

It asks for a password (at least 10 characters, typed twice, not shown), hashes it on your
computer and writes `.cms-admin.sql`. Apply it, then delete the file:

```bash
npx wrangler d1 execute supertherm-cms --remote --file=.cms-admin.sql
rm .cms-admin.sql
```

Repeat for each person who should be able to edit. To remove someone:
`npm run cms:admin -- someone@example.com --remove`, then apply the file the same way.

### 6. Deploy hook, so Publish can rebuild the site

In the Cloudflare dashboard: Workers & Pages, the `superthermcorporations` project,
Settings, Builds, **Deploy hooks**, add a hook for the production branch and copy its URL.
Store it as a secret (it is never written into the repo or the page):

```bash
npx wrangler pages secret put DEPLOY_HOOK_URL --project-name superthermcorporations
```

Deploy hooks exist only for Pages projects that build from a connected Git repository.
If the site is published by uploading from a computer (`npm run deploy`), there is nothing
for the hook to trigger: Publish still marks the content as published, the console says no
rebuild was started, and the change appears the next time someone runs `npm run deploy`.

### 7. Tell the build where to read content

Set a build variable in the Pages project (Settings, Variables and secrets), for
production and preview:

```
PUBLIC_CMS_URL = https://www.superthermcorporations.com
```

That is the site's own address; the build calls `/api/content` on it. For builds on your
own computer, put the same line in `.env` (see `.env.example`). Without it the site builds
from `site.ts` only.

### 8. Deploy

Commit `wrangler.toml` with the real `database_id` and deploy as usual (push to the
connected branch, or `npm run deploy`). Cloudflare Pages reads the D1 and R2 bindings
from `wrangler.toml` and builds the `functions/` folder with the site. Once Pages uses
`wrangler.toml`, bindings are managed in that file, not in the dashboard.

### 9. Check that it works

1. Open `https://your-site/api/content`. You should see `{"content":{}}` (or content, once published).
2. Open `https://your-site/admin` and sign in.
3. In Page headings, change a heading, add a note, press **Save**. It appears under Change history.
4. Press **Publish**. In the Cloudflare dashboard a new deployment should start.
5. When it finishes, the live page shows the new heading.
6. Change it back the same way, or use **Restore** in the change history, then Save and Publish.

If the sign-in screen says setup is not finished, it tells you which step is missing
(database not bound, tables not created, or no admin yet).

## Day-to-day use

1. Go to `/admin` and sign in. You stay signed in on that browser for 7 days.
2. Pick a section on the left. Edit the fields. Lists have Add, move up, move down and remove. Specification tables let you add and remove rows and columns.
3. Optionally say what you changed, then **Save**. A dot marks sections with unsaved changes.
4. When you are ready for the changes to go live, press **Publish**.
5. **Change history** lists every save of the section. **Restore** loads an older version into the editor; save and publish to make it live.
6. **Load built-in content** puts the section back to what is in `site.ts`.
7. The **JSON** view shows the same content as raw data, for bulk edits or pasting.
8. Change your password from the menu under your email address.

Image fields take a path (`/assets/...`), a full web address, or an upload.

## Forgotten passwords and lockouts

There is no "reset by email": Cloudflare does not send email on its own, and adding a mail
provider was left out on purpose. To reset a password, the person who looks after the site
runs the same command as for creating an admin:

```bash
npm run cms:admin -- you@example.com
npx wrangler d1 execute supertherm-cms --remote --file=.cms-admin.sql
rm .cms-admin.sql
```

This sets the new password, signs that person out everywhere, and clears any lockout.

After 5 wrong passwords for one email within 15 minutes, sign-in for that email is refused
until the attempts are 15 minutes old (30 attempts per network address, likewise).

## Testing on your own computer

No Cloudflare account is needed; Wrangler emulates D1 and R2 locally in `.wrangler/`.

```bash
npx wrangler d1 migrations apply supertherm-cms --local
npm run cms:admin -- test@example.com
npx wrangler d1 execute supertherm-cms --local --file=.cms-admin.sql && rm .cms-admin.sql
npm run cms:dev          # builds the site, then serves it with the backend on http://localhost:8788
```

Open `http://localhost:8788/admin`. To see published content in a build:
`PUBLIC_CMS_URL=http://localhost:8788 npm run build`.

Under `npm run preview` or `npm run dev` there is no backend, so `/admin` says it is not
connected and offers **Preview the editor**: the forms with the built-in content, with
saving, publishing and uploading switched off.

## Adding new content to the console

Add the new export to `src/data/site.ts`, add its name to a section in
`src/data/cms-sections.ts`, and export it from `src/data/content.ts` with `pick('name')`.
The form is generated from the shape of the data. Labels, help text and image fields can
be tuned in `src/admin/hints.ts`. `npm run cms:seed` fails if an export is not in a section.

Text written directly in the page files (for example the home page headline and section
headings) is not in `site.ts` and so is not editable from the console.

## Security notes

- Passwords are stored as PBKDF2-HMAC-SHA-256 hashes with a random salt per user and 100,000 iterations, the highest count the Cloudflare Workers runtime allows. Comparison is constant-time.
- A session is a random 256-bit token. Only its SHA-256 is stored. It is sent as a `HttpOnly; Secure; SameSite=Strict` cookie limited to `/api`, expires after 7 days, and is deleted on sign-out. Changing a password signs out other devices.
- Every request that changes anything must come from the site's own origin and carry a custom header, in addition to the SameSite cookie, to block cross-site request forgery.
- Every `/api/admin/*` request checks the session. `/api/content` is the only public data endpoint and returns published content only.
- The deploy hook URL is a Cloudflare secret, used only by the backend.
- `/admin` is `noindex`, disallowed in `robots.txt`, and served with `Cache-Control: no-store`.
- Sign-in hashing uses noticeable CPU time. On the Workers Free plan the per-request CPU limit is low; if sign-in fails with a Cloudflare 1102 error, the project needs the Workers Paid plan.

## Rebuilding on Publish through GitHub Actions

Use this when the Pages project is a direct upload (no Git connection), so Cloudflare
deploy hooks are not available. `.github/workflows/deploy.yml` builds and deploys the
site on every push to `main` and whenever the console asks.

1. Repository secrets (GitHub, Settings, Secrets and variables, Actions):
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
2. A GitHub fine-grained token limited to this repository with
   **Contents: Read and write** (that permission is what allows `repository_dispatch`).
3. Two Pages secrets so Publish can start the workflow:

```bash
npx wrangler pages secret put DEPLOY_HOOK_URL --project-name superthermcorporations
#   value: https://api.github.com/repos/<owner>/<repo>/dispatches
npx wrangler pages secret put DEPLOY_HOOK_TOKEN --project-name superthermcorporations
#   value: the GitHub token from step 2
```

4. Deploy once so the secrets take effect. Publish then starts a "Deploy site" run,
   visible under the repository's Actions tab; the change is live when it finishes.

With `DEPLOY_HOOK_TOKEN` unset, `DEPLOY_HOOK_URL` is treated as a plain Cloudflare deploy hook.

