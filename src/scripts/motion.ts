// Client motion engine (GSAP + ScrollTrigger):
// staggered scroll reveals, animated counters, magnetic buttons, 3D tilt,
// parallax layers, hero content parallax, scroll-progress bar and back-to-top.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

/* ---------------------------------------------------------------- */
/*  Scroll reveals — reliable per-element IntersectionObserver with   */
/*  a hard safety net so content can never stay stuck invisible.      */
/* ---------------------------------------------------------------- */
function initReveals() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const show = (el: HTMLElement) => el.classList.add('is-visible');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    els.forEach(show);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  els.forEach((el) => io.observe(el));

  // Safety net: anything above the fold or missed after 1.2s is revealed,
  // and a scroll listener reveals anything already in view.
  const revealInView = () => {
    els.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) {
        show(el);
        io.unobserve(el);
      }
    });
  };
  requestAnimationFrame(revealInView);
  setTimeout(revealInView, 1200);
}

/* ---------------------------------------------------------------- */
/*  Animated counters                                                */
/* ---------------------------------------------------------------- */
function animateCounter(el: HTMLElement) {
  const target = parseFloat(el.dataset.counter || '0');
  const suffix = el.dataset.suffix || '';
  if (prefersReduced) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 1.8,
    ease: 'power2.out',
    onUpdate: () => (el.textContent = `${Math.round(obj.v)}${suffix}`),
  });
}
function initCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => animateCounter(el),
    });
  });
}

/* ---------------------------------------------------------------- */
/*  Magnetic buttons                                                 */
/* ---------------------------------------------------------------- */
function initMagnetic() {
  if (prefersReduced || coarse) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.35');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    );
  });
}

/* ---------------------------------------------------------------- */
/*  3D tilt cards                                                    */
/* ---------------------------------------------------------------- */
function initTilt() {
  if (prefersReduced || coarse) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = 8;
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotateY: px * max,
        rotateX: -py * max,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });
    el.addEventListener('mouseleave', () =>
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })
    );
  });
}

/* ---------------------------------------------------------------- */
/*  Parallax layers + hero content drift                             */
/* ---------------------------------------------------------------- */
function initParallax() {
  if (prefersReduced) return;
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const depth = parseFloat(el.dataset.parallax || '0.2');
    gsap.to(el, {
      yPercent: -depth * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const heroContent = document.querySelector<HTMLElement>('[data-hero-content]');
  if (heroContent) {
    gsap.to(heroContent, {
      yPercent: 18,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: heroContent, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* ---------------------------------------------------------------- */
/*  Header state + scroll progress + back to top                     */
/* ---------------------------------------------------------------- */
function initScrollUI() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const toTop = document.querySelector<HTMLElement>('[data-to-top]');

  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle('is-scrolled', y > 24);
    if (bar) bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    toTop?.classList.toggle('is-visible', y > 600);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  );
}

/* ---------------------------------------------------------------- */
/*  Mobile nav toggle                                                */
/* ---------------------------------------------------------------- */
function initMobileNav() {
  const btn = document.querySelector<HTMLElement>('[data-nav-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  if (!btn || !panel) return;
  const close = () => {
    panel.classList.remove('is-open');
    btn.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    btn.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}

/* ---------------------------------------------------------------- */
/*  Light / dark theme toggle                                        */
/* ---------------------------------------------------------------- */
function initTheme() {
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const light = document.documentElement.classList.toggle('light');
      try {
        localStorage.setItem('theme', light ? 'light' : 'dark');
      } catch {}
      ScrollTrigger.refresh();
    });
  });
}

/* ---------------------------------------------------------------- */
/*  Auto-translate language switch (Google Translate via cookie)     */
/* ---------------------------------------------------------------- */
function initLang() {
  const selects = document.querySelectorAll<HTMLSelectElement>('[data-lang]');
  if (!selects.length) return;

  const match = document.cookie.match(/googtrans=\/[^/]*\/([^;]+)/);
  const current = match ? decodeURIComponent(match[1]) : 'en';
  const host = location.hostname;

  const clearCookie = (attrs: string) =>
    (document.cookie = `googtrans=;${attrs};expires=Thu, 01 Jan 1970 00:00:00 GMT`);

  selects.forEach((sel) => {
    if ([...sel.options].some((o) => o.value === current)) sel.value = current;
    sel.addEventListener('change', () => {
      const lang = sel.value;
      if (lang === 'en') {
        clearCookie('path=/');
        clearCookie(`path=/;domain=${host}`);
        clearCookie(`path=/;domain=.${host}`);
      } else {
        const v = `/en/${lang}`;
        document.cookie = `googtrans=${v};path=/`;
        document.cookie = `googtrans=${v};path=/;domain=${host}`;
        document.cookie = `googtrans=${v};path=/;domain=.${host}`;
      }
      location.reload();
    });
  });
}

function boot() {
  initReveals();
  initCounters();
  initMagnetic();
  initTilt();
  initParallax();
  initScrollUI();
  initMobileNav();
  initTheme();
  initLang();
  ScrollTrigger.refresh();
}

if (document.readyState !== 'loading') boot();
else document.addEventListener('DOMContentLoaded', boot);
