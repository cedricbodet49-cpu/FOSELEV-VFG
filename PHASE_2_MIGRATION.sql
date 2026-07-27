-- FOSELEV VFG 1.2.0 - Migration Phase 2
begin;
create extension if not exists pgcrypto;

create table if not exists public.vfg_visits (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.vfg_visits enable row level security;
drop policy if exists "vfg_visits_shared_read" on public.vfg_visits;
create policy "vfg_visits_shared_read" on public.vfg_visits for select to authenticated using (true);
drop policy if exists "vfg_visits_insert" on public.vfg_visits;
create policy "vfg_visits_insert" on public.vfg_visits for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "vfg_visits_update" on public.vfg_visits;
create policy "vfg_visits_update" on public.vfg_visits for update to authenticated using (true) with check (true);
drop policy if exists "vfg_visits_delete" on public.vfg_visits;
create policy "vfg_visits_delete" on public.vfg_visits for delete to authenticated using (true);
create index if not exists idx_vfg_visits_updated on public.vfg_visits(updated_at desc);
commit;
select 'Migration Phase 2 terminée' as resultat;
