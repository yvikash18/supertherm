// Shape helpers shared by the build-time content loader and the /admin console.
// A "template" describes the shape of a piece of content. It is derived from the
// static defaults in site.ts, so there is no separate schema to keep in sync.

export type Template =
  | { t: 'string' | 'number' | 'boolean' }
  | { t: 'object'; fields: Record<string, Template> }
  | { t: 'list'; item: Template | null }
  | { t: 'any' };

function merge(a: Template | null, b: Template | null): Template | null {
  if (!a) return b;
  if (!b) return a;
  if (a.t !== b.t) return { t: 'any' };
  if (a.t === 'object' && b.t === 'object') {
    const fields: Record<string, Template> = { ...a.fields };
    for (const [k, v] of Object.entries(b.fields)) fields[k] = merge(fields[k] ?? null, v)!;
    return { t: 'object', fields };
  }
  if (a.t === 'list' && b.t === 'list') return { t: 'list', item: merge(a.item, b.item) };
  return a;
}

/** Describe the shape of a value. List items are merged, so optional keys are included. */
export function templateOf(v: unknown): Template {
  if (typeof v === 'string') return { t: 'string' };
  if (typeof v === 'number') return { t: 'number' };
  if (typeof v === 'boolean') return { t: 'boolean' };
  if (Array.isArray(v)) {
    let item: Template | null = null;
    for (const x of v) item = merge(item, templateOf(x));
    return { t: 'list', item };
  }
  if (v && typeof v === 'object') {
    const fields: Record<string, Template> = {};
    for (const [k, x] of Object.entries(v)) fields[k] = templateOf(x);
    return { t: 'object', fields };
  }
  return { t: 'any' };
}

export const mergeTemplates = merge;

/** A blank value of the given shape (used for "Add item" and to fill gaps). */
export function emptyOf(tpl: Template | null): any {
  if (!tpl) return '';
  switch (tpl.t) {
    case 'string': return '';
    case 'number': return 0;
    case 'boolean': return false;
    case 'list': return [];
    case 'object': return Object.fromEntries(Object.entries(tpl.fields).map(([k, f]) => [k, emptyOf(f)]));
    default: return '';
  }
}

/**
 * Coerce edited content to the shape the pages expect, so a missing or
 * mistyped field can never break the build. Unknown extra keys are kept.
 */
export function conform(v: any, tpl: Template | null): any {
  if (!tpl || tpl.t === 'any') return v;
  switch (tpl.t) {
    case 'string':
      return typeof v === 'string' ? v : v == null || typeof v === 'object' ? '' : String(v);
    case 'number': {
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    case 'boolean':
      return v === true || v === 'true';
    case 'list':
      return Array.isArray(v) ? v.map((x) => conform(x, tpl.item)) : [];
    case 'object': {
      const src = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
      const out: Record<string, any> = { ...src };
      for (const [k, f] of Object.entries(tpl.fields)) out[k] = conform(src[k], f);
      return out;
    }
  }
}
