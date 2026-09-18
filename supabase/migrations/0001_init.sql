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
