// Supertherm content console: backend.
// Runs as Cloudflare Pages Functions (see functions/api/[[path]].ts), so it is
// deployed with the site and served from the same origin as /admin.
//
// Bindings (wrangler.toml / Pages dashboard):
//   DB               D1 database         required
//   MEDIA            R2 bucket           optional, enables image upload
//   DEPLOY_HOOK_URL  secret              optional, Cloudflare Pages deploy hook
//
// Public:   GET  /api/content            published content, read by the site build
// Auth:     POST /api/auth/login | logout | password      GET /api/auth/me
// Admin:    GET  /api/admin/pages
//           PUT  /api/admin/pages/:slug
//           GET  /api/admin/revisions?slug=   GET /api/admin/revisions/:id
//           POST /api/admin/publish
//           POST /api/admin/upload
import { SECTION_SLUGS } from '../src/data/cms-sections';
import {
  MIN_PASSWORD_LENGTH,
  constantTimeEqual,
  derive,
  hashPassword,
  randomHex,
  sha256Hex,
  verifyPassword,
  PBKDF2_ITERATIONS,
} from './password.mjs';

export interface Env {
  DB?: any;
  MEDIA?: any;
  DEPLOY_HOOK_URL?: string;
}

const COOKIE = 'cms_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // sign in again after 7 days
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_EMAIL = 5; // per email per window, then locked until they age out
const MAX_FAILS_IP = 30; // per address per window
const MAX_CONTENT_BYTES = 900_000; // D1 rows are limited to about 1 MB
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// Without an R2 bucket, images are kept in D1, whose rows are limited to about 2 MB.
const MAX_D1_UPLOAD_BYTES = 1_500_000;

class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
      ...headers,
    },
  });

const now = () => Date.now();
const iso = () => new Date().toISOString();

function cookieHeader(value: string, maxAgeSeconds: number) {
  return `${COOKIE}=${value}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

function readCookie(req: Request) {
  const raw = req.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE) return v.join('=');
  }
  return '';
}

async function body(req: Request): Promise<Record<string, any>> {
  if (!(req.headers.get('Content-Type') || '').includes('application/json')) {
    throw new HttpError(415, 'bad_request', 'Send JSON.');
  }
  try {
    const b = await req.json();
    if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, any>;
  } catch {}
  throw new HttpError(400, 'bad_request', 'The request body is not valid JSON.');
}

/**
 * CSRF defence for every state-changing request: the session cookie is
 * SameSite=Strict, and on top of that the request must come from this origin
 * and carry a header that a cross-site form cannot set.
 */
function checkSameOrigin(req: Request) {
  const origin = req.headers.get('Origin');
  if (!origin || origin !== new URL(req.url).origin || req.headers.get('X-CMS') !== '1') {
    throw new HttpError(403, 'forbidden', 'This request did not come from the console.');
  }
}

async function sessionOf(req: Request, env: Env) {
  const token = readCookie(req);
  if (!token) return null;
  const hash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT s.token_hash, s.expires_at, a.id, a.email
       FROM sessions s JOIN admins a ON a.id = s.admin_id
      WHERE s.token_hash = ?`
  )
    .bind(hash)
    .first();
  if (!row) return null;
  if (row.expires_at <= now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
    return null;
  }
  return { id: row.id as number, email: row.email as string, tokenHash: hash };
}

async function requireAdmin(req: Request, env: Env) {
  const s = await sessionOf(req, env);
  if (!s) throw new HttpError(401, 'unauthenticated', 'Sign in to continue.');
  return s;
}

// ---------------------------------------------------------------- auth

async function login(req: Request, env: Env) {
  const b = await body(req);
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');
  if (!email || !password) throw new HttpError(400, 'bad_request', 'Enter your email and password.');
  if (email.length > 254 || password.length > 1024) throw new HttpError(400, 'bad_request', 'That is too long.');

  const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
  const since = now() - WINDOW_MS;
  const fails = async (scope: string, key: string) =>
    await env.DB.prepare('SELECT COUNT(*) AS n, MIN(at) AS first FROM login_attempts WHERE scope = ? AND key = ? AND at > ?')
      .bind(scope, key, since)
      .first();
  const [byEmail, byIp] = [await fails('email', email), await fails('ip', ip)];
  if (byEmail.n >= MAX_FAILS_EMAIL || byIp.n >= MAX_FAILS_IP) {
    const first = byEmail.n >= MAX_FAILS_EMAIL ? byEmail.first : byIp.first;
    const wait = Math.max(1, Math.ceil((first + WINDOW_MS - now()) / 60000));
    throw new HttpError(429, 'locked', `Too many failed attempts. Try again in ${wait} minute${wait === 1 ? '' : 's'}.`, {
      retry_after_minutes: wait,
    });
  }

  const admin = await env.DB.prepare('SELECT id, email, pw_hash, pw_salt, pw_iter FROM admins WHERE email = ?').bind(email).first();
  let ok = false;
  if (admin) {
    ok = await verifyPassword(password, admin);
  } else {
    // Do the same work for unknown emails so response time does not reveal who has an account.
    constantTimeEqual(await derive(password, '00000000000000000000000000000000', PBKDF2_ITERATIONS), '');
  }

  if (!ok) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO login_attempts (scope, key, at) VALUES (?, ?, ?)').bind('email', email, now()),
      env.DB.prepare('INSERT INTO login_attempts (scope, key, at) VALUES (?, ?, ?)').bind('ip', ip, now()),
      env.DB.prepare('DELETE FROM login_attempts WHERE at <= ?').bind(since),
    ]);
    const left = MAX_FAILS_EMAIL - (byEmail.n + 1);
    throw new HttpError(
      401,
      'invalid_credentials',
      left > 0 && left <= 2
        ? `Email or password is incorrect. ${left} attempt${left === 1 ? '' : 's'} left before a 15 minute lockout.`
        : 'Email or password is incorrect.'
    );
  }

  const token = randomHex(32);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO sessions (token_hash, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(
      await sha256Hex(token),
      admin.id,
      now(),
      now() + SESSION_MS
    ),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now()),
    env.DB.prepare("DELETE FROM login_attempts WHERE scope = 'email' AND key = ?").bind(email),
  ]);
  return json({ email: admin.email }, 200, { 'Set-Cookie': cookieHeader(token, SESSION_MS / 1000) });
}

async function logout(req: Request, env: Env) {
  const token = readCookie(req);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader('', 0) });
}

async function me(req: Request, env: Env) {
  const s = await sessionOf(req, env);
  if (s) return json({ email: s.email, uploads: true, upload_limit: env.MEDIA ? MAX_UPLOAD_BYTES : MAX_D1_UPLOAD_BYTES, deploy_hook: !!env.DEPLOY_HOOK_URL });
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM admins').first();
  return json({ error: 'unauthenticated', message: 'Sign in to continue.', has_admin: n > 0 }, 401);
}

async function changePassword(req: Request, env: Env) {
  const s = await requireAdmin(req, env);
  const b = await body(req);
  const current = String(b.current || '');
  const next = String(b.next || '');
  if (next.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, 'weak_password', `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.`);
  }
  if (next.length > 1024) throw new HttpError(400, 'bad_request', 'That is too long.');
  const admin = await env.DB.prepare('SELECT pw_hash, pw_salt, pw_iter FROM admins WHERE id = ?').bind(s.id).first();
  if (!admin || !(await verifyPassword(current, admin))) {
    throw new HttpError(400, 'invalid_credentials', 'Your current password is incorrect.');
  }
  const h = await hashPassword(next);
  await env.DB.batch([
    env.DB.prepare('UPDATE admins SET pw_hash = ?, pw_salt = ?, pw_iter = ?, updated_at = ? WHERE id = ?').bind(
      h.hash,
      h.salt,
      h.iterations,
      iso(),
      s.id
    ),
    // Sign out every other device.
    env.DB.prepare('DELETE FROM sessions WHERE admin_id = ? AND token_hash <> ?').bind(s.id, s.tokenHash),
  ]);
  return json({ ok: true });
}

// ---------------------------------------------------------------- content

const parse = (s: string | null) => {
  try {
    return s == null ? null : JSON.parse(s);
  } catch {
    return null;
  }
};

/** Public: what the site build reads. Only ever returns published snapshots. */
async function publicContent(env: Env) {
  const { results } = await env.DB.prepare('SELECT slug, content FROM published').all();
  const content: Record<string, unknown> = {};
  for (const r of results) content[r.slug] = parse(r.content) ?? {};
  return json({ content });
}

async function listPages(env: Env) {
  const [pages, published, deployments] = await env.DB.batch([
    env.DB.prepare('SELECT slug, content, updated_at, updated_by FROM pages'),
    env.DB.prepare('SELECT slug, content, published_at FROM published'),
    env.DB.prepare('SELECT id, status, note, triggered_by, created_at FROM deployments ORDER BY id DESC LIMIT 5'),
  ]);
  const pub: Record<string, any> = Object.fromEntries(published.results.map((r: any) => [r.slug, r]));
  return json({
    pages: pages.results.map((r: any) => ({
      slug: r.slug,
      content: parse(r.content) ?? {},
      updated_at: r.updated_at,
      updated_by: r.updated_by,
      // True when the saved copy differs from what the live site was last built from.
      unpublished: !pub[r.slug] || pub[r.slug].content !== r.content,
    })),
    deployments: deployments.results,
  });
}

async function savePage(req: Request, env: Env, slug: string) {
  const admin = await requireAdmin(req, env);
  if (!SECTION_SLUGS.includes(slug)) throw new HttpError(404, 'not_found', 'There is no such section.');
  const b = await body(req);
  const content = b.content;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    throw new HttpError(400, 'bad_request', 'Content must be a JSON object.');
  }
  const text = JSON.stringify(content);
  if (new TextEncoder().encode(text).length > MAX_CONTENT_BYTES) {
    throw new HttpError(413, 'too_large', 'This section is too large to save. Remove some content and try again.');
  }
  const summary = String(b.summary || '').trim().slice(0, 300) || 'Content updated';

  const existing = await env.DB.prepare('SELECT content, updated_at FROM pages WHERE slug = ?').bind(slug).first();
  // Someone else saved this section since it was loaded here.
  if (existing && b.base_updated_at !== undefined && b.base_updated_at !== existing.updated_at && !b.overwrite) {
    throw new HttpError(409, 'conflict', 'Someone else saved this section while you were editing.', {
      updated_at: existing.updated_at,
    });
  }
  const at = iso();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO pages (slug, content, updated_at, updated_by) VALUES (?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
    ).bind(slug, text, at, admin.email),
    env.DB.prepare(
      'INSERT INTO revisions (slug, content_before, content_after, summary, changed_by, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(slug, existing?.content ?? null, text, summary, admin.email, at),
  ]);
  return json({ ok: true, slug, updated_at: at, updated_by: admin.email });
}

async function listRevisions(req: Request, env: Env) {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  const { results } = await env.DB.prepare(
    'SELECT id, slug, summary, changed_by, created_at FROM revisions WHERE slug = ? ORDER BY id DESC LIMIT 30'
  )
    .bind(slug)
    .all();
  return json({ revisions: results });
}

async function getRevision(env: Env, id: string) {
  const r = await env.DB.prepare('SELECT * FROM revisions WHERE id = ?').bind(Number(id)).first();
  if (!r) throw new HttpError(404, 'not_found', 'That version no longer exists.');
  return json({
    revision: { ...r, content_before: parse(r.content_before), content_after: parse(r.content_after) },
  });
}

/** Snapshot the saved content as "published", then ask Cloudflare Pages to rebuild the site. */
async function publish(req: Request, env: Env) {
  const admin = await requireAdmin(req, env);
  const b = await body(req);
  const note = String(b.note || '').trim().slice(0, 300);
  const at = iso();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM published'),
    env.DB.prepare('INSERT INTO published (slug, content, published_at, published_by) SELECT slug, content, ?, ? FROM pages').bind(
      at,
      admin.email
    ),
  ]);

  let status = 'no_hook';
  if (env.DEPLOY_HOOK_URL) {
    status = 'failed';
    try {
      const r = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
      if (r.ok) status = 'triggered';
    } catch {}
  }
  await env.DB.prepare('INSERT INTO deployments (status, note, triggered_by, created_at) VALUES (?, ?, ?, ?)')
    .bind(status, note, admin.email, at)
    .run();
  return json({ ok: status === 'triggered', status, published_at: at });
}

// ---------------------------------------------------------------- uploads

const IMAGE_TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  'image/gif': { ext: 'gif', magic: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  'image/webp': {
    ext: 'webp',
    magic: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  'image/avif': { ext: 'avif', magic: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 },
};

async function upload(req: Request, env: Env) {
  await requireAdmin(req, env);
  const type = (req.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  const kind = IMAGE_TYPES[type];
  if (!kind) throw new HttpError(415, 'bad_type', 'Upload a JPG, PNG, WebP, AVIF or GIF image.');
  if (Number(req.headers.get('Content-Length') || 0) > MAX_UPLOAD_BYTES) {
    throw new HttpError(413, 'too_large', 'Images can be up to 5 MB.');
  }
  const buf = await req.arrayBuffer();
  if (buf.byteLength > MAX_UPLOAD_BYTES) throw new HttpError(413, 'too_large', 'Images can be up to 5 MB.');
  if (!env.MEDIA && buf.byteLength > MAX_D1_UPLOAD_BYTES) throw new HttpError(413, 'too_large', 'Images can be up to 1.5 MB.');
  if (buf.byteLength < 12 || !kind.magic(new Uint8Array(buf, 0, 12))) {
    throw new HttpError(415, 'bad_type', 'That file is not a valid image of the type it claims to be.');
  }
  const base =
    decodeURIComponent(req.headers.get('X-Filename') || 'image')
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image';
  const key = `uploads/${new Date().getUTCFullYear()}/${base}-${randomHex(5)}.${kind.ext}`;
  if (env.MEDIA) await env.MEDIA.put(key, buf, { httpMetadata: { contentType: type } });
  else await env.DB.prepare('INSERT INTO media (key, type, data, size) VALUES (?, ?, ?, ?)').bind(key, type, buf, buf.byteLength).run();
  return json({ url: `/media/${key}` });
}

/** Public: serve an uploaded image from R2, or from D1 when no bucket is bound (functions/media/[[path]].ts). */
export async function serveMedia(req: Request, env: Env, key: string) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  if (!key.startsWith('uploads/')) return new Response('Not found', { status: 404 });
  const mediaHeaders = (type: string) => ({
    'Content-Type': type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'",
  });
  if (!env.MEDIA) {
    let row: any = null;
    try {
      row = await env.DB.prepare('SELECT type, data FROM media WHERE key = ?').bind(key).first();
    } catch {
      return new Response('Not found', { status: 404 }); // table not migrated yet
    }
    if (!row) return new Response('Not found', { status: 404 });
    // D1 hands a BLOB back as an ArrayBuffer or as an array of byte values, depending on the runtime
    const bytes = row.data instanceof ArrayBuffer ? new Uint8Array(row.data) : Uint8Array.from(row.data as number[]);
    return new Response(req.method === 'HEAD' ? null : bytes, { headers: mediaHeaders(row.type) });
  }
  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(req.method === 'HEAD' ? null : obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
      ETag: obj.httpEtag,
    },
  });
}

// ---------------------------------------------------------------- router

export async function handleApi(req: Request, env: Env): Promise<Response> {
  const path = new URL(req.url).pathname.replace(/\/+$/, '');
  const m = req.method;
  try {
    if (!env.DB) {
      throw new HttpError(503, 'not_configured', 'The content database is not connected. Bind a D1 database as DB (see docs/CMS-SETUP.md).');
    }
    if (m === 'GET' && path === '/api/content') return await publicContent(env);
    if (m === 'GET' && path === '/api/auth/me') return await me(req, env);

    if (m !== 'GET') checkSameOrigin(req);

    if (m === 'POST' && path === '/api/auth/login') return await login(req, env);
    if (m === 'POST' && path === '/api/auth/logout') return await logout(req, env);
    if (m === 'POST' && path === '/api/auth/password') return await changePassword(req, env);

    if (path.startsWith('/api/admin/')) {
      await requireAdmin(req, env);
      const rest = path.slice('/api/admin/'.length).split('/');
      if (m === 'GET' && rest[0] === 'pages' && rest.length === 1) return await listPages(env);
      if (m === 'PUT' && rest[0] === 'pages' && rest.length === 2) return await savePage(req, env, rest[1]);
      if (m === 'GET' && rest[0] === 'revisions' && rest.length === 1) return await listRevisions(req, env);
      if (m === 'GET' && rest[0] === 'revisions' && rest.length === 2) return await getRevision(env, rest[1]);
      if (m === 'POST' && rest[0] === 'publish' && rest.length === 1) return await publish(req, env);
      if (m === 'POST' && rest[0] === 'upload' && rest.length === 1) return await upload(req, env);
    }
    throw new HttpError(404, 'not_found', 'Not found.');
  } catch (e: any) {
    if (e instanceof HttpError) return json({ error: e.code, message: e.message, ...e.extra }, e.status);
    const msg = String(e?.message ?? e);
    if (/no such table/i.test(msg)) {
      return json({ error: 'not_migrated', message: 'The content database has no tables yet. Run the D1 migrations (see docs/CMS-SETUP.md).' }, 503);
    }
    console.error('[cms]', msg);
    return json({ error: 'server_error', message: 'Something went wrong on the server. Try again.' }, 500);
  }
}
