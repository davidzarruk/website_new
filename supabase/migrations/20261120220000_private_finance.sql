-- Apply manually to the external Supabase project used by AuthContext. No browser secrets.
begin;
create table public.finance_owners (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.finance_owners enable row level security;
revoke all on public.finance_owners from public, anon, authenticated;
grant select on public.finance_owners to authenticated;
create policy finance_owner_self on public.finance_owners for select to authenticated using (user_id = (select auth.uid()));
-- Resolve a confirmed identity once. Never trust editable user_metadata or a payload email.
do $$
declare owner_id uuid;
begin
 select id into strict owner_id from auth.users where lower(email)='davidzarruk@gmail.com' and email_confirmed_at is not null;
 insert into public.finance_owners(user_id) values (owner_id);
exception when no_data_found then raise exception 'Confirmed David identity missing; provision and verify it before applying migration';
end $$;
create table public.finance_snapshots (
 user_id uuid primary key references public.finance_owners(user_id) on delete cascade,
 snapshot jsonb not null check (coalesce(jsonb_typeof(snapshot)='object' and jsonb_typeof(snapshot->'version')='number' and snapshot->'version'='1'::jsonb and not (snapshot ? 'user_id') and octet_length(snapshot::text)<=2000000, false)),
 imported_at timestamptz not null default now()
);
alter table public.finance_snapshots enable row level security;
alter table public.finance_snapshots force row level security;
revoke all on public.finance_snapshots from public, anon, authenticated;
grant select, insert(user_id,snapshot), update(user_id,snapshot) on public.finance_snapshots to authenticated;
create policy finance_read on public.finance_snapshots for select to authenticated using (user_id=(select auth.uid()) and exists(select 1 from public.finance_owners o where o.user_id=(select auth.uid())));
create policy finance_insert on public.finance_snapshots for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.finance_owners o where o.user_id=(select auth.uid())));
create policy finance_update on public.finance_snapshots for update to authenticated using (user_id=(select auth.uid()) and exists(select 1 from public.finance_owners o where o.user_id=(select auth.uid()))) with check (user_id=(select auth.uid()) and exists(select 1 from public.finance_owners o where o.user_id=(select auth.uid())));
create function public.finance_set_imported_at() returns trigger language plpgsql set search_path='' as $$ begin new.imported_at=now(); return new; end $$;
revoke all on function public.finance_set_imported_at() from public, anon, authenticated;
create trigger finance_import_time before insert or update on public.finance_snapshots for each row execute function public.finance_set_imported_at();
commit;
