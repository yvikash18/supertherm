// Site motion. Three kinds, each used for one job:
//   1. Entrances: display type rises word by word, photos wipe open, blocks blur in.
//   2. One pinned scroll scene on the home page (the "heat pass" statement).
//   3. Responses to the pointer: machine-row photo preview, nav show/hide.
// The hero heat line and the sizing tool carry their own scripts.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Entrances ------------------------------------------------------------- */
function initEntrances() {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>('.rise, [data-in], [data-wipe], [data-bars], [data-odo]')
  );
  const show = (el: Element) => el.classList.add('is-in');

  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(show);
    return;
  }

  // Headlines marked to play on load go first, next frame, so the transition runs.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => els.filter((e) => e.dataset.rise === 'load').forEach(show))
  );

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      }),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  els.filter((e) => e.dataset.rise !== 'load').forEach((el) => io.observe(el));

  // A fast jump (anchor link, End key, flick) can carry an element from below the
  // screen to above it between observer checks. Sweep on scroll so nothing that
  // has been scrolled past is left waiting.
  let pending = els.filter((e) => e.dataset.rise !== 'load');
  let queued = false;
  const sweep = () => {
    queued = false;
    const limit = window.innerHeight * 0.92;
    pending = pending.filter((el) => {
      if (el.classList.contains('is-in')) return false;
      if (el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); return false; }
      return true;
    });
    if (!pending.length) window.removeEventListener('scroll', onScroll);
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Pinned statement: a heat front passes through the sentence as you scroll */
function initStatement() {
  const section = document.querySelector<HTMLElement>('[data-statement]');
  if (!section) return;
  const words = Array.from(section.querySelectorAll<HTMLElement>('.sw'));
  if (reduced || !words.length) return;

  section.classList.add('is-armed');
  const HOT = 3; // words inside the "coil" at any moment
  const paint = (p: number) => {
    const head = p * (words.length + HOT);
    words.forEach((w, i) => {
      w.classList.toggle('is-hot', i < head && i >= head - HOT);
      w.classList.toggle('is-lit', i < head - HOT);
    });
    section.style.setProperty('--p', p.toFixed(4));
  };
  paint(0);
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=90%',
    pin: true,
    scrub: true,
    onUpdate: (self) => paint(self.progress),
  });
}

/* Machine rows: a photo follows the pointer -------------------------------- */
function initRowPreview() {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-preview]'));
  if (!rows.length || !finePointer || reduced) return;

  const box = document.createElement('div');
  box.className = 'row-preview';
  box.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  box.appendChild(img);
  document.body.appendChild(box);
  rows.forEach((r) => (new Image().src = r.dataset.preview!)); // warm the cache

  const xTo = gsap.quickTo(box, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(box, 'y', { duration: 0.5, ease: 'power3.out' });
  rows.forEach((row) => {
    row.addEventListener('pointerenter', (e) => {
      img.src = row.dataset.preview!;
      gsap.set(box, { x: e.clientX, y: e.clientY });
      box.classList.add('is-on');
    });
    row.addEventListener('pointermove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });
    row.addEventListener('pointerleave', () => box.classList.remove('is-on'));
  });
  // Scrolling moves the row out from under a still pointer.
  window.addEventListener('scroll', () => box.classList.remove('is-on'), { passive: true });
}

/* Header: solid after the first scroll, tucks away going down, returns going up */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    document.documentElement.classList.toggle('is-past-hero', y > 320);
    const menuOpen = document.body.classList.contains('menu-open');
    if (!menuOpen) header.classList.toggle('is-hidden', y > 400 && y > last);
    last = y;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Mobile menu ------------------------------------------------------------- */
function initMenu() {
  const btn = document.querySelector<HTMLElement>('[data-nav-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!btn || !panel) return;
  const set = (open: boolean) => {
    panel.hidden = !open;
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    // The panel is dark, so the bar above it reads as if over the dark hero.
    header?.classList.toggle('menu-over', open);
    if (open) header?.classList.remove('is-hidden');
  };
  btn.addEventListener('click', () => set(panel.hidden));
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && !panel.hidden && set(false));
}

function boot() {
  initEntrances();
  initStatement();
  initRowPreview();
  initHeader();
  initMenu();
  // Web fonts change heading heights; re-measure the pinned scene once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

if (document.readyState !== 'loading') boot();
else document.addEventListener('DOMContentLoaded', boot);
