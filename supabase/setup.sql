-- Supertherm CMS — full setup. Paste into Supabase SQL editor and Run.
-- (schema + seed combined)

-- Supertherm CMS schema
-- One row per route in `pages`, full change history in `page_revisions`,
-- deploy audit trail in `deployments`.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- pages: editable content per route (JSON blob)
-- ------------------------------------------------------------------
create table if not exists public.pages (
  slug        text primary key,               -- 'global' | 'home' | 'about' | 'products' | ...
  label       text not null default '',        -- human label shown in the console
  content     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- ------------------------------------------------------------------
-- page_revisions: full "what changed" history (before -> after)
-- ------------------------------------------------------------------
create table if not exists public.page_revisions (
  id             bigint generated always as identity primary key,
  slug           text not null references public.pages(slug) on delete cascade,
  content_before jsonb,
  content_after  jsonb,
  summary        text not null default '',
  changed_by     text not null default 'admin',
  created_at     timestamptz not null default now()
);
create index if not exists page_revisions_slug_idx on public.page_revisions (slug, created_at desc);

-- ------------------------------------------------------------------
-- deployments: audit log of deploy-hook triggers from the console
-- ------------------------------------------------------------------
create table if not exists public.deployments (
  id           bigint generated always as identity primary key,
  status       text not null default 'triggered',  -- triggered | failed
  triggered_by text not null default 'admin',
  note         text not null default '',
  created_at   timestamptz not null default now()
);

-- Keep pages.updated_at fresh
create or replace function public.touch_pages_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_pages_touch on public.pages;
create trigger trg_pages_touch before update on public.pages
  for each row execute function public.touch_pages_updated_at();

-- ------------------------------------------------------------------
-- Row Level Security
--   * Public (anon) can READ pages  -> the static build fetches content.
--   * Nobody can write via anon/PostgREST. All writes go through the
--     `admin` Edge Function using the service-role key (bypasses RLS),
--     after verifying the shared passcode server-side.
-- ------------------------------------------------------------------
alter table public.pages          enable row level security;
alter table public.page_revisions enable row level security;
alter table public.deployments    enable row level security;

drop policy if exists "pages public read" on public.pages;
create policy "pages public read" on public.pages
  for select using (true);

-- Revisions readable by anon so the console can show history with the anon key.
drop policy if exists "revisions public read" on public.page_revisions;
create policy "revisions public read" on public.page_revisions
  for select using (true);

drop policy if exists "deployments public read" on public.deployments;
create policy "deployments public read" on public.deployments
  for select using (true);

-- No insert/update/delete policies => denied for anon. Writes = service role only.

-- ============ SEED ============
-- Seed the CMS with the current site content (run after 0001_init.sql).
-- Each route is one row in `pages`; `content` is the editable JSON for that route.
-- Deeper structured data (e.g. full product spec tables) can be pasted into the
-- JSON via the admin console later.

insert into public.pages (slug, label, content) values
('global', 'Global (company & contact)', '{
  "name": "Supertherm Corporations",
  "tagline": "Excellence in Induction Technology",
  "intro": "World-class manufacturer of induction heating equipment — hardening, forging, melting and high-frequency welding systems engineered for the modern foundry.",
  "phone": "+91 99900 98477",
  "support": "+91 70829 10292",
  "email": "rameshyadav72@gmail.com",
  "address": { "line1": "Plot No. 708, MIE, Part A", "line2": "Bahadurgarh, Haryana 124507", "country": "India" },
  "social": {
    "linkedin": "https://www.linkedin.com/company/supertherm-corporations-bahadhurgarh/",
    "youtube": "https://youtube.com/channel/UCdn_1NjWcb1Pb01WV25j7fA",
    "facebook": "https://facebook.com/",
    "twitter": "https://twitter.com/"
  }
}'::jsonb),

('home', 'Home page', '{
  "heroTitleLine1": "Precision heat,",
  "heroTitleLine2": "forged into power.",
  "heroLead": "Supertherm Corporations engineers world-class induction systems — hardening, forging, melting and high-frequency welding — built for the modern foundry and shop floor.",
  "stats": [
    { "value": 30, "suffix": "+", "label": "Years of engineering", "sub": "Serving industry since 1994" },
    { "value": 550, "suffix": "+", "label": "Hardening & melting units", "sub": "Installed and running" },
    { "value": 1000, "suffix": "+", "label": "Machines delivered", "sub": "Across Asian markets" },
    { "value": 9, "suffix": "", "label": "Countries served", "sub": "And expanding" }
  ]
}'::jsonb),

('about', 'About page', '{
  "eyebrow": "About us",
  "title": "Three decades of induction expertise",
  "subtitle": "Since 1994, Supertherm Corporations has designed and built induction systems that heat, harden, melt and weld metal for manufacturers across Asia and the Gulf."
}'::jsonb),

('products', 'Products page', '{
  "eyebrow": "Our products",
  "title": "Induction systems for every process",
  "subtitle": "Four core product lines — Forge Master forging, Supertherm Scan hardening, medium-frequency melting furnaces and CFI high-frequency welders. Each engineered to your part, tonnage and cycle-time, and built in-house."
}'::jsonb),

('gallery', 'Gallery page', '{
  "eyebrow": "Gallery",
  "title": "Machines on the floor",
  "subtitle": "Real installations and equipment from Supertherm projects across India and abroad. Filter by process, tap any photo to enlarge."
}'::jsonb),

('branches', 'Branches page', '{
  "eyebrow": "Branches",
  "title": "Close to your factory floor",
  "subtitle": "A head office and works in Haryana, backed by regional offices nationwide and a service reach that spans nine countries."
}'::jsonb),

('clients', 'Clients page', '{
  "eyebrow": "Clients",
  "title": "Trusted where heat means business",
  "subtitle": "From automotive forging giants to independent foundries, manufacturers rely on Supertherm induction systems to run shift after shift."
}'::jsonb),

('contact', 'Contact page', '{
  "eyebrow": "Contact",
  "title": "Let''s engineer your heat",
  "subtitle": "Tell us about your part and process — our engineers will get back with the right induction solution."
}'::jsonb)

on conflict (slug) do update
  set content = excluded.content,
      label = excluded.label;
