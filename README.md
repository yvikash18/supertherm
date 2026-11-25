# Supertherm Corporations — Website Revamp

A modern, animated rebuild of [superthermcorporations.com](https://www.superthermcorporations.com/)
for **Supertherm Corporations**, a manufacturer of induction heating equipment.

**Design language (v2):** light cabinet-enamel grey and control-panel blue taken from
the machines themselves; the heat colours appear only where metal is hot. One typeface
(Archivo), used condensed and heavy for display type, normal width for text.

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | [Astro 4](https://astro.build), static output |
| Styling | Design tokens and components in `src/styles/global.css`, scoped component CSS, Tailwind 3 utilities |
| Motion | CSS transitions driven by `IntersectionObserver`; [GSAP ScrollTrigger](https://gsap.com) for the one pinned scene and the pointer-follow preview |
| Hero | Canvas 2D drawing of a billet heater (`src/components/HeatLine.astro`), no WebGL |
| Type | Archivo variable (width and weight axes) from Google Fonts |

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
  data/site.ts            # content: company, products, stats, branches, clients
  data/content.ts         # what pages import: published console content, else site.ts
  data/cms-sections.ts    # how site.ts exports are grouped into console sections
  admin/                  # /admin console: generated forms, sign-in, save, publish
  lib/heat.ts             # colour of steel at temperature, shared by hero and sizing tool
  layouts/Layout.astro    # <head>, SEO, nav, footer
  scripts/motion.ts       # entrances, pinned statement, row preview, nav
  components/
    HeatLine.astro        # hero: bars passing through an induction coil
    SizingTool.astro      # bar diameter -> frequency band and machine series
    Compare.astro         # induction against oil- and gas-fired furnaces
    Glyph.astro           # process diagrams for the four machine families
    Display.astro         # display headline with word-by-word rise
    Plate.astro Enquiry.astro PageHero.astro Nav.astro Footer.astro
  pages/                  # index, about, products, gallery, branches, clients, contact, admin, 404
  styles/global.css       # tokens, type scale, shared components, motion primitives
```

## Editing content

Almost all copy lives in **`src/data/site.ts`** — company details, product specs,
stats, branches, countries, clients and testimonials. Edit there and every page updates.

Everything in `site.ts` can also be edited without touching code, from the content
console at **`/admin`** (email and password sign-in, change history, publish button).
The console's backend runs on Cloudflare with the site: Pages Functions in `functions/`
(logic in `server/cms.ts`), a D1 database (`d1/`) and an optional R2 bucket for image
uploads. Setup and day-to-day use are in **`docs/CMS-SETUP.md`**. Once a section has been
saved and published from the console, the console's copy wins over `site.ts` for that section.

## To do before launch

- Replace placeholder **gallery tiles** with real project photos in `public/gallery/`.
- Swap the **client name badges** for real logos if available (`clients` array / logo wall).
- Confirm phone/email/address in `site.ts` and wire the **contact form** to a real
  endpoint (currently opens the visitor's mail client via `mailto:`).
- Add real **social links** in `site.ts` (`company.social`).
- Consider a proper OG share image at `public/og.jpg` and reference it in `Layout.astro`.

## Accessibility & performance notes

- `prefers-reduced-motion`: entrances show immediately, the hero draws one still frame,
  the pinned scene is not pinned.
- Motion styles are scoped to `html.js`, so content is visible if scripts fail.
- The hero canvas stops drawing when scrolled out of view.
