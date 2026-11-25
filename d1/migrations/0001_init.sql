-- Supertherm content console: D1 schema.
-- Apply with:  npx wrangler d1 migrations apply supertherm-cms --remote   (or --local)

-- People who may sign in to /admin. There is no public sign-up: rows are
-- created with `npm run cms:admin` (see docs/CMS-SETUP.md).
CREATE TABLE IF NOT EXISTS admins (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pw_hash    TEXT NOT NULL,            -- PBKDF2-HMAC-SHA-256, hex
  pw_salt    TEXT NOT NULL,            -- random per user, hex
  pw_iter    INTEGER NOT NULL,         -- iteration count used for pw_hash
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Sign-in sessions. Only the SHA-256 of the cookie token is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,         -- epoch ms
  expires_at INTEGER NOT NULL          -- epoch ms
);
CREATE INDEX IF NOT EXISTS sessions_admin_idx ON sessions (admin_id);

-- Failed sign-in attempts, for rate limiting and lockout.
CREATE TABLE IF NOT EXISTS login_attempts (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL,                 -- 'email' | 'ip'
  key   TEXT NOT NULL,
  at    INTEGER NOT NULL               -- epoch ms
);
CREATE INDEX IF NOT EXISTS login_attempts_idx ON login_attempts (scope, key, at);

-- Working copy of each content section (JSON). Admin-only.
CREATE TABLE IF NOT EXISTS pages (
  slug       TEXT PRIMARY KEY,         -- see src/data/cms-sections.ts
  content    TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);

-- Snapshot taken when "Publish" is pressed. This is the only content the
-- public endpoint (/api/content) and therefore the site build can read.
CREATE TABLE IF NOT EXISTS published (
  slug         TEXT PRIMARY KEY,
  content      TEXT NOT NULL,
  published_at TEXT NOT NULL,
  published_by TEXT NOT NULL DEFAULT ''
);

-- Every save, with the content before and after.
CREATE TABLE IF NOT EXISTS revisions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL,
  content_before TEXT,
  content_after  TEXT NOT NULL,
  summary        TEXT NOT NULL DEFAULT '',
  changed_by     TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS revisions_slug_idx ON revisions (slug, id DESC);

-- Every press of "Publish".
CREATE TABLE IF NOT EXISTS deployments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  status       TEXT NOT NULL,          -- triggered | failed | no_hook
  note         TEXT NOT NULL DEFAULT '',
  triggered_by TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);
