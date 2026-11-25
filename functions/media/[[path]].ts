// Cloudflare Pages Function: serves images uploaded from the console (R2 bucket MEDIA).
import { serveMedia, type Env } from '../../server/cms';

export const onRequest = (ctx: { request: Request; env: Env; params: { path?: string | string[] } }) => {
  const p = ctx.params.path;
  return serveMedia(ctx.request, ctx.env, Array.isArray(p) ? p.join('/') : p || '');
};
