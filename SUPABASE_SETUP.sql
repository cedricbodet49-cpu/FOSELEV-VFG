-- FOSELEV VFG V0.7.0 — à exécuter une seule fois dans Supabase > SQL Editor
create table if not exists public.vfg_visits (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists vfg_visits_user_id_idx on public.vfg_visits(user_id);
create index if not exists vfg_visits_updated_at_idx on public.vfg_visits(updated_at desc);

alter table public.vfg_visits enable row level security;

drop policy if exists "vfg_select_own" on public.vfg_visits;
create policy "vfg_select_own" on public.vfg_visits
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "vfg_insert_own" on public.vfg_visits;
create policy "vfg_insert_own" on public.vfg_visits
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "vfg_update_own" on public.vfg_visits;
create policy "vfg_update_own" on public.vfg_visits
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "vfg_delete_own" on public.vfg_visits;
create policy "vfg_delete_own" on public.vfg_visits
for delete to authenticated using ((select auth.uid()) = user_id);
