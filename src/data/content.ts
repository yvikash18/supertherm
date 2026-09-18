// Build-time CMS content loader.
// If PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY are set, page content is
// pulled from Supabase at build time and merged over the static defaults in
// site.ts. If not configured (or the fetch fails), the site falls back to the
// static defaults — so the build ALWAYS works, connected or not.
import { company as defaultCompany, stats as defaultStats } from './site';

type Json = Record<string, any>;

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let cms: Record<string, Json> = {};

if (url && key) {
  try {
    // Timeout so a paused/unreachable Supabase project never stalls the build.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${url}/rest/v1/pages?select=slug,content`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const rows: Array<{ slug: string; content: Json }> = await res.json();
      cms = Object.fromEntries(rows.map((r) => [r.slug, r.content ?? {}]));
      console.info(`[cms] loaded ${rows.length} page(s) from Supabase`);
    } else {
      console.warn(`[cms] Supabase responded ${res.status}; using static defaults`);
    }
  } catch (e) {
    console.warn('[cms] content fetch failed; using static defaults (site works either way):', (e as Error)?.message);
  }
}

const g = cms.global ?? {};

/** Company / global info, DB values merged over static defaults. */
export const company = {
  ...defaultCompany,
  ...g,
  address: { ...defaultCompany.address, ...(g.address ?? {}) },
  social: { ...defaultCompany.social, ...(g.social ?? {}) },
};

/** Homepage stat counters (DB overrides static). */
export const stats = cms.home?.stats ?? defaultStats;

/** Raw homepage content bag (heroTitleLine1, heroLead, …). */
export const home = cms.home ?? {};

/** Hero block for a route, DB values overriding the provided fallback. */
export function heroFor(
  slug: string,
  fallback: { eyebrow?: string; title: string; subtitle?: string }
) {
  const c = cms[slug] ?? {};
  return {
    eyebrow: c.eyebrow ?? fallback.eyebrow,
    title: c.title ?? fallback.title,
    subtitle: c.subtitle ?? fallback.subtitle,
  };
}

/** Whole CMS map (empty object when not connected). */
export const cmsContent = cms;
