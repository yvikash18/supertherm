// Supabase Edge Function: `admin`
// Passcode-gated content management + Cloudflare Pages deploy trigger.
// All privileged writes happen here with the service-role key, so no secret
// ever ships to the browser. The static /admin console calls this endpoint.
//
// Required function secrets (supabase secrets set ...):
//   SUPABASE_URL              (auto-provided)
//   SUPABASE_SERVICE_ROLE_KEY (auto-provided)
//   ADMIN_PASSCODE            shared admin passcode
//   CF_DEPLOY_HOOK            Cloudflare Pages deploy hook URL
//
// Deploy:  supabase functions deploy admin --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const { passcode, action } = payload ?? {};
  if (!passcode || passcode !== Deno.env.get('ADMIN_PASSCODE')) {
    return json({ error: 'unauthorized' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    switch (action) {
      case 'list': {
        const { data, error } = await supabase.from('pages').select('*').order('slug');
        if (error) throw error;
        return json({ pages: data });
      }

      case 'save': {
        const { slug, content, summary } = payload;
        if (!slug || typeof content !== 'object') return json({ error: 'slug + content required' }, 400);

        const { data: existing } = await supabase.from('pages').select('content').eq('slug', slug).single();

        const { error: upErr } = await supabase
          .from('pages')
          .upsert({ slug, content, updated_by: 'admin' }, { onConflict: 'slug' });
        if (upErr) throw upErr;

        await supabase.from('page_revisions').insert({
          slug,
          content_before: existing?.content ?? null,
          content_after: content,
          summary: summary || 'Content updated',
          changed_by: 'admin',
        });

        return json({ ok: true, slug });
      }

      case 'revisions': {
        const { slug, limit = 20 } = payload;
        let q = supabase.from('page_revisions').select('*').order('created_at', { ascending: false }).limit(limit);
        if (slug) q = q.eq('slug', slug);
        const { data, error } = await q;
        if (error) throw error;
        return json({ revisions: data });
      }

      case 'deploy': {
        const hook = Deno.env.get('CF_DEPLOY_HOOK');
        if (!hook) return json({ error: 'CF_DEPLOY_HOOK not configured' }, 400);

        let status = 'triggered';
        try {
          const r = await fetch(hook, { method: 'POST' });
          if (!r.ok) status = 'failed';
        } catch {
          status = 'failed';
        }
        await supabase.from('deployments').insert({ status, note: payload.note || '' });
        return json({ ok: status === 'triggered', status });
      }

      default:
        return json({ error: 'unknown action' }, 400);
    }
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
