// Supertherm content console (browser side).
// Talks only to the site's own backend under /api (Cloudflare Pages Functions).
// The session lives in an HttpOnly cookie, so no token or secret is held here.
import { SECTIONS, UNUSED_KEYS } from '../data/cms-sections';
import { mergeTemplates, templateOf } from '../data/shape';
import { renderNode, type FormCtx } from './form';
import { BLOCK_LABELS, humanise } from './hints';

type Json = Record<string, any>;
interface PageRow { slug: string; content: Json; updated_at: string; updated_by: string; unpublished: boolean }

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const defaults: Json = JSON.parse($('#cx-defaults').textContent || '{}');

const state = {
  mode: 'live' as 'live' | 'demo',
  email: '',
  uploads: false,
  uploadLimit: 5 * 1024 * 1024,
  deployHook: false,
  loaded: false,
  slug: SECTIONS[0].slug,
  view: 'form' as 'form' | 'json',
  jsonError: false,
  /** Last saved copy from the server, by section. */
  rows: {} as Record<string, PageRow | undefined>,
  /** What is being edited, by section. */
  work: {} as Record<string, Json>,
  /** JSON of `work` as it was when loaded or last saved, to detect unsaved changes. */
  base: {} as Record<string, string>,
  lastDeploy: null as null | { status: string; created_at: string; triggered_by: string },
};

// ------------------------------------------------------------------ backend

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public data: Json = {}) {
    super(message);
  }
}

async function api(method: string, path: string, body?: unknown, raw?: { type: string; name: string; data: Blob }): Promise<Json> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(method === 'GET' ? {} : { 'X-CMS': '1' }),
        ...(raw ? { 'Content-Type': raw.type, 'X-Filename': encodeURIComponent(raw.name) } : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: raw ? raw.data : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'offline', 'Could not reach the server. Check your connection and try again.');
  }
  let data: Json | null = null;
  if ((res.headers.get('Content-Type') || '').includes('application/json')) {
    try {
      data = await res.json();
    } catch {}
  }
  // A static host (no backend deployed) answers /api with an HTML page.
  if (!data) throw new ApiError(res.status, 'no_backend', 'The console backend is not running on this site.');
  if (!res.ok) {
    const err = new ApiError(res.status, data.error || 'error', data.message || `Request failed (${res.status}).`, data);
    if (res.status === 401 && err.code === 'unauthenticated' && state.loaded) sessionEnded();
    throw err;
  }
  return data;
}

// ------------------------------------------------------------------ small UI helpers

let toastTimer = 0;
function toast(message: string, bad = false) {
  const t = $('#cx-toast');
  t.textContent = message;
  t.classList.toggle('cx-toast-bad', bad);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (t.hidden = true), bad ? 9000 : 5000);
}

const when = (isoText: string) => {
  const d = new Date(isoText);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const sectionOf = (slug: string) => SECTIONS.find((s) => s.slug === slug)!;
const isDirty = (slug: string) => JSON.stringify(state.work[slug]) !== state.base[slug];
const anyDirty = () => SECTIONS.some((s) => isDirty(s.slug));

/** Editing copy of a section: saved values, with built-in content for anything not saved yet. */
function workingCopy(slug: string, saved?: Json) {
  const out: Json = { ...(saved ? clone(saved) : {}) };
  for (const k of sectionOf(slug).keys) if (out[k] === undefined || out[k] === null) out[k] = clone(defaults[k]);
  return out;
}

// ------------------------------------------------------------------ sign-in screen

function showLogin(message = '', kind: 'error' | 'info' = 'error') {
  $('#cx-app').hidden = true;
  $('#cx-login').hidden = false;
  const m = $('#cx-login-msg');
  m.textContent = message;
  m.hidden = !message;
  m.classList.toggle('cx-msg-info', kind === 'info');
}

function setupNotice(html: string, offerPreview: boolean) {
  const box = $('#cx-setup');
  box.innerHTML = html;
  box.hidden = false;
  $('#cx-preview').hidden = !offerPreview;
  ($('#cx-login-form').querySelectorAll('input, button[type=submit]') as NodeListOf<HTMLInputElement>).forEach((i) => (i.disabled = true));
}

function sessionEnded() {
  showLogin('Your session has ended. Sign in again to carry on; your unsaved changes are still here.', 'info');
  $<HTMLInputElement>('#cx-email').value = state.email;
  $<HTMLInputElement>('#cx-password').focus();
}

async function boot() {
  try {
    const who = await api('GET', '/auth/me');
    await enter(who);
  } catch (e: any) {
    if (e.code === 'no_backend' || e.code === 'offline') {
      showLogin();
      setupNotice(
        '<strong>The console is not connected.</strong> This copy of the site is running without its backend, so signing in is not possible here. On the live site, check that the Cloudflare setup in <code>docs/CMS-SETUP.md</code> is complete.',
        true
      );
    } else if (e.code === 'not_configured' || e.code === 'not_migrated') {
      showLogin();
      setupNotice(`<strong>Setup is not finished.</strong> ${e.message}`, false);
    } else if (e.code === 'unauthenticated') {
      showLogin();
      if (e.data.has_admin === false) {
        $('#cx-setup').innerHTML =
          '<strong>No admin account exists yet.</strong> Create the first one with <code>npm run cms:admin</code> (see <code>docs/CMS-SETUP.md</code>).';
        $('#cx-setup').hidden = false;
      }
      $<HTMLInputElement>('#cx-email').focus();
    } else {
      showLogin(e.message);
    }
  }
}

$('#cx-login-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const btn = $<HTMLButtonElement>('#cx-signin');
  const email = $<HTMLInputElement>('#cx-email').value.trim();
  const password = $<HTMLInputElement>('#cx-password').value;
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  try {
    const who = await api('POST', '/auth/login', { email, password });
    $<HTMLInputElement>('#cx-password').value = '';
    const me = await api('GET', '/auth/me');
    await enter({ ...me, ...who });
  } catch (e: any) {
    showLogin(e.message);
    $<HTMLInputElement>('#cx-password').select();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});

$('#cx-preview-btn').addEventListener('click', () => {
  state.mode = 'demo';
  for (const s of SECTIONS) {
    state.work[s.slug] = workingCopy(s.slug);
    state.base[s.slug] = JSON.stringify(state.work[s.slug]);
  }
  state.loaded = true;
  $('#cx-demo').hidden = false;
  $('#cx-who').textContent = 'Preview';
  $<HTMLButtonElement>('#cx-publish').disabled = true;
  $<HTMLButtonElement>('#cx-change-pw').hidden = true;
  $('#cx-signout').textContent = 'Leave preview';
  $('#cx-login').hidden = true;
  $('#cx-app').hidden = false;
  drawNav();
  openSection(state.slug);
});

async function enter(who: Json) {
  state.email = who.email;
  state.uploads = !!who.uploads;
  if (who.upload_limit) state.uploadLimit = who.upload_limit;
  state.deployHook = !!who.deploy_hook;
  $('#cx-who').textContent = who.email;
  if (!state.loaded) {
    await loadPages();
    state.loaded = true;
  }
  $('#cx-login').hidden = true;
  $('#cx-app').hidden = false;
  drawNav();
  openSection(state.slug);
}

async function loadPages() {
  const data = await api('GET', '/admin/pages');
  state.rows = {};
  for (const p of data.pages as PageRow[]) state.rows[p.slug] = p;
  for (const s of SECTIONS) {
    state.work[s.slug] = workingCopy(s.slug, state.rows[s.slug]?.content);
    state.base[s.slug] = JSON.stringify(state.work[s.slug]);
  }
  state.lastDeploy = data.deployments?.[0] ?? null;
}

// ------------------------------------------------------------------ navigation and status

function drawNav() {
  const nav = $('#cx-nav');
  nav.replaceChildren();
  for (const s of SECTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cx-navlink';
    b.dataset.slug = s.slug;
    b.append(s.label);
    const dot = document.createElement('span');
    dot.className = 'cx-dot';
    dot.hidden = true;
    dot.title = 'Unsaved changes';
    dot.innerHTML = '<span class="cx-sr">, unsaved changes</span>';
    b.append(dot);
    b.addEventListener('click', () => openSection(s.slug));
    nav.append(b);
  }
  refreshStatus();
}

function refreshStatus() {
  document.querySelectorAll<HTMLElement>('.cx-navlink').forEach((b) => {
    const slug = b.dataset.slug!;
    b.setAttribute('aria-current', String(slug === state.slug));
    (b.querySelector('.cx-dot') as HTMLElement).hidden = !isDirty(slug);
  });
  const dirty = isDirty(state.slug);
  const demo = state.mode === 'demo';
  const s = $('#cx-save-state');
  s.textContent = state.jsonError
    ? 'The JSON is not valid yet'
    : dirty
      ? demo
        ? 'Changed (preview only, cannot be saved)'
        : 'Unsaved changes'
      : 'No unsaved changes';
  s.classList.toggle('cx-state-dirty', dirty || state.jsonError);
  $<HTMLButtonElement>('#cx-save').disabled = demo || !dirty || state.jsonError;
  $<HTMLButtonElement>('#cx-discard').disabled = !dirty && !state.jsonError;

  const waiting = !demo && SECTIONS.some((x) => state.rows[x.slug]?.unpublished);
  const p = $('#cx-pub-state');
  p.hidden = demo;
  p.textContent = waiting
    ? 'Saved changes are waiting to be published'
    : state.lastDeploy
      ? `Last published ${when(state.lastDeploy.created_at)}`
      : 'Nothing published yet: the site shows its built-in content';
  p.classList.toggle('cx-state-dirty', waiting);
}

// ------------------------------------------------------------------ editor

/**
 * Shrink a photo in the browser before upload: phone photos are far larger than
 * the site needs. Leaves small files, GIFs and anything it cannot decode alone.
 */
async function fitImage(file: File, limit: number): Promise<File> {
  const MAX_EDGE = 2000;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size <= Math.min(limit, 600_000)) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  // PNGs may have transparency (logos), so they go to WebP; photos go to JPEG
  const type = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
  for (const q of [0.86, 0.75, 0.62]) {
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, type, q));
    if (blob && (blob.size <= limit || q === 0.62)) {
      if (blob.size >= file.size && file.size <= limit) return file;
      return new File([blob], file.name.replace(/\.[^.]*$/, '') + (type === 'image/webp' ? '.webp' : '.jpg'), { type });
    }
  }
  return file;
}

const formCtx = (): FormCtx => ({
  onChange: refreshStatus,
  upload:
    state.mode === 'live' && state.uploads
      ? async (picked) => {
          const file = await fitImage(picked, state.uploadLimit);
          if (file.size > state.uploadLimit) throw new Error(`That image is too large (limit ${(state.uploadLimit / 1e6).toFixed(1)} MB).`);
          const r = await api('POST', '/admin/upload', undefined, { type: file.type, name: file.name, data: file });
          return r.url as string;
        }
      : undefined,
  uploadNote: state.mode === 'demo' ? 'Upload is off in preview mode' : 'Image upload is not available',
});

function openSection(slug: string) {
  if (state.jsonError) return toast('Fix or discard the JSON before leaving this section.', true);
  state.slug = slug;
  const s = sectionOf(slug);
  $('#cx-title').textContent = s.label;
  $('#cx-blurb').textContent = s.blurb;
  const row = state.rows[slug];
  $('#cx-saved-by').textContent = row && row.updated_by !== 'seed' ? `Last saved ${when(row.updated_at)} by ${row.updated_by}` : 'Showing the built-in content. Nothing has been saved for this section yet.';
  $<HTMLInputElement>('#cx-summary').value = '';
  drawEditor();
  loadRevisions();
  refreshStatus();
  $('#cx-main').scrollIntoView({ block: 'start' });
}

function drawEditor() {
  const s = sectionOf(state.slug);
  const work = state.work[state.slug];
  const host = $('#cx-editor');
  host.replaceChildren();
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));

  if (state.view === 'json') {
    const ta = document.createElement('textarea');
    ta.className = 'input cx-input cx-mono cx-json';
    ta.spellcheck = false;
    ta.setAttribute('aria-label', `${s.label} as JSON`);
    ta.value = JSON.stringify(work, null, 2);
    const msg = document.createElement('p');
    msg.className = 'note';
    msg.setAttribute('role', 'status');
    msg.textContent = 'For advanced edits. The form view shows the same content.';
    ta.addEventListener('input', () => {
      try {
        const v = JSON.parse(ta.value);
        if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('The top level must be an object, written in { }.');
        state.work[state.slug] = v;
        state.jsonError = false;
        msg.textContent = 'Valid JSON.';
        msg.classList.remove('cx-bad');
      } catch (e: any) {
        state.jsonError = true;
        msg.textContent = `Not valid yet: ${e.message}`;
        msg.classList.add('cx-bad');
      }
      refreshStatus();
    });
    host.append(ta, msg);
    return;
  }

  const ctx = formCtx();
  for (const key of s.keys) {
    const block = document.createElement('section');
    block.className = 'cx-block';
    const tpl = mergeTemplates(templateOf(defaults[key]), templateOf(work[key]));
    // Lists carry their own heading (with a count), so only other blocks get one here.
    if (!tpl || tpl.t !== 'list') {
      const h = document.createElement('h3');
      h.className = 'h3';
      h.textContent = BLOCK_LABELS[key] || humanise(key);
      block.append(h);
    }
    if (UNUSED_KEYS.includes(key)) {
      const n = document.createElement('p');
      n.className = 'note';
      n.textContent = 'Not shown anywhere in the current site design. Kept so it is ready if a page starts using it.';
      block.append(n);
    }
    block.append(renderNode(work, key, tpl, key, BLOCK_LABELS[key] || humanise(key), ctx, true));
    host.append(block);
  }
  // Anything a power user added in the JSON view stays visible.
  for (const key of Object.keys(work)) {
    if (s.keys.includes(key)) continue;
    const block = document.createElement('section');
    block.className = 'cx-block';
    block.append(renderNode(work, key, null, key, `${humanise(key)} (extra)`, ctx));
    host.append(block);
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b) =>
  b.addEventListener('click', () => {
    if (state.jsonError) return toast('Fix or discard the JSON before switching back to the form.', true);
    state.view = b.dataset.view as 'form' | 'json';
    drawEditor();
  })
);

$('#cx-discard').addEventListener('click', () => {
  if (!confirm('Discard your unsaved changes to this section?')) return;
  state.work[state.slug] = JSON.parse(state.base[state.slug]);
  state.jsonError = false;
  drawEditor();
  refreshStatus();
});

$('#cx-reset').addEventListener('click', () => {
  if (!confirm('Load the built-in content for this section? Nothing changes on the site until you save and publish.')) return;
  state.work[state.slug] = workingCopy(state.slug);
  state.jsonError = false;
  $<HTMLInputElement>('#cx-summary').value = 'Reset to built-in content';
  drawEditor();
  refreshStatus();
  toast('Built-in content loaded. Save to keep it.');
});

async function save(overwrite = false) {
  const slug = state.slug;
  const btn = $<HTMLButtonElement>('#cx-save');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    const content = state.work[slug];
    const sent = JSON.stringify(content);
    const r = await api('PUT', `/admin/pages/${slug}`, {
      content,
      summary: $<HTMLInputElement>('#cx-summary').value,
      base_updated_at: state.rows[slug]?.updated_at,
      overwrite,
    });
    state.rows[slug] = { slug, content: JSON.parse(sent), updated_at: r.updated_at, updated_by: r.updated_by, unpublished: true };
    state.base[slug] = sent;
    $<HTMLInputElement>('#cx-summary').value = '';
    $('#cx-saved-by').textContent = `Last saved ${when(r.updated_at)} by ${r.updated_by}`;
    toast('Saved. Press Publish to put it on the live site.');
    loadRevisions();
  } catch (e: any) {
    if (e.code === 'conflict') {
      if (confirm('Someone else saved this section while you were editing. Replace their version with yours?\n\nTheir version stays in the change history.')) {
        btn.textContent = 'Save';
        return save(true);
      }
    } else if (e.code !== 'unauthenticated') {
      toast(e.message, true);
    }
  } finally {
    btn.textContent = 'Save';
    refreshStatus();
  }
}
$('#cx-savebar').addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (state.mode === 'live' && isDirty(state.slug) && !state.jsonError) save();
});

// ------------------------------------------------------------------ change history

async function loadRevisions() {
  const list = $('#cx-revisions');
  if (state.mode === 'demo') {
    list.innerHTML = '<li class="note">Change history appears here once you are signed in.</li>';
    return;
  }
  const slug = state.slug;
  list.innerHTML = '<li class="note">Loading…</li>';
  try {
    const { revisions } = await api('GET', `/admin/revisions?slug=${encodeURIComponent(slug)}`);
    if (slug !== state.slug) return;
    list.replaceChildren();
    if (!revisions.length) {
      list.innerHTML = '<li class="note">No changes saved yet.</li>';
      return;
    }
    revisions.forEach((r: Json, i: number) => {
      const li = document.createElement('li');
      li.className = 'cx-rev';
      const text = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = r.summary;
      const meta = document.createElement('span');
      meta.className = 'note';
      meta.textContent = `${when(r.created_at)} · ${r.changed_by}${i === 0 ? ' · current' : ''}`;
      text.append(title, meta);
      li.append(text);
      if (i > 0) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-line btn-sm';
        b.textContent = 'Restore';
        b.setAttribute('aria-label', `Restore the version from ${when(r.created_at)}`);
        b.addEventListener('click', () => restore(r.id, r.created_at));
        li.append(b);
      }
      list.append(li);
    });
  } catch (e: any) {
    list.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'note cx-bad';
    li.textContent = e.message;
    list.append(li);
  }
}

async function restore(id: number, at: string) {
  if (isDirty(state.slug) && !confirm('Restoring replaces your unsaved changes to this section. Continue?')) return;
  try {
    const { revision } = await api('GET', `/admin/revisions/${id}`);
    state.work[state.slug] = workingCopy(state.slug, revision.content_after);
    state.jsonError = false;
    $<HTMLInputElement>('#cx-summary').value = `Restored the version from ${when(at)}`;
    drawEditor();
    refreshStatus();
    toast('Version loaded into the editor. Check it, then save.');
    $('#cx-main').scrollIntoView({ block: 'start' });
  } catch (e: any) {
    toast(e.message, true);
  }
}

// ------------------------------------------------------------------ publish

const pubDialog = $<HTMLDialogElement>('#cx-pub-dialog');
$('#cx-publish').addEventListener('click', () => {
  $('#cx-pub-warn').hidden = !anyDirty();
  $('#cx-pub-hook').hidden = state.deployHook;
  $<HTMLInputElement>('#cx-pub-note').value = '';
  pubDialog.showModal();
});
$('#cx-pub-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const btn = $<HTMLButtonElement>('#cx-pub-go');
  btn.disabled = true;
  btn.textContent = 'Publishing…';
  try {
    const r = await api('POST', '/admin/publish', { note: $<HTMLInputElement>('#cx-pub-note').value });
    for (const s of SECTIONS) if (state.rows[s.slug]) state.rows[s.slug]!.unpublished = false;
    state.lastDeploy = { status: r.status, created_at: r.published_at, triggered_by: state.email };
    pubDialog.close();
    if (r.status === 'triggered') toast('Publishing started. The live site updates in a few minutes.');
    else if (r.status === 'no_hook') toast('Marked as published, but no deploy hook is set, so the site will not rebuild until its next deploy.', true);
    else toast('Marked as published, but Cloudflare did not accept the rebuild request. Try Publish again, or start a deploy from the Cloudflare dashboard.', true);
  } catch (e: any) {
    pubDialog.close();
    if (e.code !== 'unauthenticated') toast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Publish now';
    refreshStatus();
  }
});

// ------------------------------------------------------------------ account

$('#cx-signout').addEventListener('click', async () => {
  if (anyDirty() && state.mode === 'live' && !confirm('You have unsaved changes. Sign out and lose them?')) return;
  if (state.mode === 'live') {
    try {
      await api('POST', '/auth/logout');
    } catch {}
  }
  leaving = true;
  location.reload();
});

// Account menu: close after a choice, on a click elsewhere and on Escape.
const account = $<HTMLDetailsElement>('.cx-account');
account.querySelectorAll('.cx-menu button').forEach((b) => b.addEventListener('click', () => (account.open = false)));
document.addEventListener('click', (ev) => {
  if (account.open && !account.contains(ev.target as Node)) account.open = false;
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && account.open) {
    account.open = false;
    account.querySelector('summary')!.focus();
  }
});

const pwDialog = $<HTMLDialogElement>('#cx-pw-dialog');
$('#cx-change-pw').addEventListener('click', () => {
  ($('#cx-pw-form') as HTMLFormElement).reset();
  $('#cx-pw-msg').hidden = true;
  pwDialog.showModal();
});
$('#cx-pw-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const msg = $('#cx-pw-msg');
  const next = $<HTMLInputElement>('#cx-pw-next').value;
  const fail = (t: string) => {
    msg.textContent = t;
    msg.hidden = false;
  };
  if (next !== $<HTMLInputElement>('#cx-pw-again').value) return fail('The two new passwords do not match.');
  try {
    await api('POST', '/auth/password', { current: $<HTMLInputElement>('#cx-pw-current').value, next });
    pwDialog.close();
    toast('Password changed. Other devices have been signed out.');
  } catch (e: any) {
    fail(e.message);
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog')!.close()));

let leaving = false;
window.addEventListener('beforeunload', (ev) => {
  if (!leaving && state.mode === 'live' && state.loaded && anyDirty()) ev.preventDefault();
});

boot();
