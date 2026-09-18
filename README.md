# Supertherm Corporations — Website Revamp

A modern, animated rebuild of [superthermcorporations.com](https://www.superthermcorporations.com/)
for **Supertherm Corporations**, a manufacturer of induction heating equipment.

**Design language:** dark industrial + molten-glow. Cinematic, scroll-driven motion.

## Tech stack

| Concern      | Choice |
|--------------|--------|
| Framework    | [Astro 4](https://astro.build) (static, zero-JS by default) |
| Styling      | [Tailwind CSS 3](https://tailwindcss.com) (`@astrojs/tailwind`) + scoped component CSS + CSS custom properties |
| Scroll/motion| [GSAP + ScrollTrigger](https://gsap.com) (parallax, magnetic buttons, tilt) |
| WebGL        | [Three.js](https://threejs.org) (hero ember/heat particle field) |
| Fonts        | Space Grotesk (display) + Inter (body) |

> **Why Astro 4 / Tailwind 3?** The build machine runs Node 18.19.1. Astro 5 and
> Tailwind 4 require Node ≥ 18.20.8 / 20+. Pinning to Astro 4 + Tailwind 3 keeps the
> project building on the current Node with no change to the visual output. Bump Node
> to 20 LTS later and these can be upgraded.

## Commands

```bash
npm install      # install dependencies
npm run dev      # local dev server (http://localhost:4321)
npm run build    # production build -> ./dist
npm run preview  # preview the production build
```

## Project structure

```
src/
  data/site.ts          # single source of truth: company, products, stats, branches, clients…
  layouts/Layout.astro  # <head>, SEO/OG, nav + footer, motion bootstrap
  scripts/motion.ts     # reveals, counters, magnetic buttons, 3D tilt, GSAP parallax
  components/
    EmberField.astro    # Three.js WebGL ember/heat particle hero background
    Nav.astro Footer.astro Logo.astro Icon.astro
    SectionHeading.astro StatStrip.astro ProductCard.astro
    PageHero.astro CtaBand.astro
  pages/
    index.astro about.astro products.astro gallery.astro
    branches.astro clients.astro contact.astro 404.astro
  styles/global.css     # design tokens, Tailwind layers, animation keyframes
public/
  favicon.svg
  gallery/              # (add real project photos here — see Gallery page note)
```

## Editing content

Almost all copy lives in **`src/data/site.ts`** — company details, product specs,
stats, branches, countries, clients and testimonials. Edit there and every page updates.

## To do before launch

- Replace placeholder **gallery tiles** with real project photos in `public/gallery/`.
- Swap the **client name badges** for real logos if available (`clients` array / logo wall).
- Confirm phone/email/address in `site.ts` and wire the **contact form** to a real
  endpoint (currently opens the visitor's mail client via `mailto:`).
- Add real **social links** in `site.ts` (`company.social`).
- Consider a proper OG share image at `public/og.jpg` and reference it in `Layout.astro`.

## Accessibility & performance notes

- Respects `prefers-reduced-motion` (disables WebGL, reveals show instantly).
- WebGL hero pauses when scrolled out of view; particle count scales down on mobile.
- Reveal states are guarded behind `html.js` so content is visible if JS fails.
