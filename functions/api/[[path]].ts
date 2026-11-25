// Cloudflare Pages Function: every /api/* request. Logic lives in server/cms.ts.
import { handleApi, type Env } from '../../server/cms';

export const onRequest = (ctx: { request: Request; env: Env }) => handleApi(ctx.request, ctx.env);
