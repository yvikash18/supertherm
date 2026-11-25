// Build-time content loader.
//
// Every export of site.ts is re-exported from here as "published CMS value if
// there is one, otherwise the static default". Pages import content from this
// file, never from site.ts directly.
//
// If PUBLIC_CMS_URL is set, published content is fetched once per build from
// `${PUBLIC_CMS_URL}/api/content` (the public, read-only endpoint of the
// Cloudflare backend in /functions). If it is not set, or the request fails or
// times out, the static defaults are used, so the build ALWAYS works.
import * as defaults from './site';
import { SECTIONS } from './cms-sections';
import { conform, templateOf } from './shape';

type Json = Record<string, any>;

const base = (import.meta.env.PUBLIC_CMS_URL || '').replace(/\/+$/, '');

let cms: Record<string, Json> = {};

if (base) {
  try {
    // Timeout so an unreachable backend never stalls the build.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${base}/api/content`, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const body = await res.json();
      if (body && typeof body.content === 'object' && body.content) {
        cms = body.content;
        console.info(`[cms] loaded ${Object.keys(cms).length} published section(s) from ${base}`);
      } else {
        console.warn('[cms] unexpected response; using static defaults');
      }
    } else {
      console.warn(`[cms] backend responded ${res.status}; using static defaults`);
    }
  } catch (e) {
    console.warn('[cms] content fetch failed; using static defaults (site works either way):', (e as Error)?.message);
  }
}

const slugOf: Record<string, string> = {};
for (const s of SECTIONS) for (const k of s.keys) slugOf[k] = s.slug;

/** Published value for a site.ts export, coerced to the default's shape; else the default itself. */
function pick<K extends keyof typeof defaults>(key: K): (typeof defaults)[K] {
  const def = defaults[key];
  const section = cms[slugOf[key as string]];
  const value = section && typeof section === 'object' ? section[key as string] : undefined;
  if (value === undefined || value === null) return def;
  if (Array.isArray(def) !== Array.isArray(value) || typeof def !== typeof value) {
    console.warn(`[cms] "${String(key)}" has the wrong shape; using the static default`);
    return def;
  }
  return conform(value, templateOf(def));
}

const c = pick('company');
/** Company info. Nested groups are merged so a missing field falls back to its default. */
export const company = {
  ...defaults.company,
  ...c,
  address: { ...defaults.company.address, ...c.address },
  social: { ...defaults.company.social, ...c.social },
};

export const nav = pick('nav');
export const stats = pick('stats');
export const products = pick('products');
export const capabilities = pick('capabilities');
export const advantages = pick('advantages');
export const divisions = pick('divisions');
export const serviceCities = pick('serviceCities');
export const process = pick('process');
const b = pick('branches');
// The branches page needs a head office: fall back rather than break the build.
export const branches = !b.length
  ? defaults.branches
  : b.some((x) => x.primary)
    ? b
    : b.map((x, i) => (i === 0 ? { ...x, primary: true } : x));
export const companyDetails = pick('companyDetails');
export const bankDetails = pick('bankDetails');
export const visionMission = pick('visionMission');
export const productFeatures = pick('productFeatures');
export const comparison = pick('comparison');
export const countries = pick('countries');
export const clientSectors = pick('clientSectors');
export const clients = pick('clients');
export const heroBanners = pick('heroBanners');
export const aboutImages = pick('aboutImages');
export const galleryImages = pick('galleryImages');
export const clientLogos = pick('clientLogos');
// Back-compat alias
export const certificates = clientLogos;
export const testimonials = pick('testimonials');
export const pageHeadings = pick('pageHeadings');

/** Heading block for an inner page. `{name}` in the text becomes the company name. */
export function heroFor(
  slug: string,
  fallback: { eyebrow?: string; title?: string; subtitle?: string } = {}
) {
  const h: { title?: string; subtitle?: string } = (pageHeadings as Json)[slug] ?? {};
  const fill = (s?: string) => (s ? s.replace(/\{name\}/g, company.name) : s);
  return {
    eyebrow: fallback.eyebrow,
    title: fill(h.title || fallback.title) ?? '',
    subtitle: fill(h.subtitle ?? fallback.subtitle),
  };
}

/** Whole published CMS map (empty object when not connected). */
export const cmsContent = cms;
