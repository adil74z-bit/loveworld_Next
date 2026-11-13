-- Love World Next: player profiles, character customization, saved world data.
-- Run this in Supabase Dashboard -> SQL Editor, or with the Supabase CLI.
-- NOT yet applied to any project: status is "prepared, untested".
--
-- Security model: every table has Row Level Security (RLS) turned on, and each
-- policy only lets a signed-in user touch rows that belong to their own auth.uid().
-- The frontend only ever uses the public "anon" key. The service_role key must
-- NEVER appear in frontend code or in this repository.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Permanent, human-friendly Player ID (e.g. LW-7K2M9QXA). Generated once.
-- ---------------------------------------------------------------------------
create or replace function public.generate_player_id()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  result text := 'LW-';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per account
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  player_id      text not null unique default public.generate_player_id(),
  display_name   text,
  schema_version int  not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- characters: the saved character + customization (one per player for now)
-- "customization" is flexible JSON because the options are not designed yet.
-- ---------------------------------------------------------------------------
create table if not exists public.characters (
  user_id        uuid primary key references public.profiles (user_id) on delete cascade,
  customization  jsonb not null default '{}'::jsonb,
  schema_version int   not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- worlds: saved island changes and progress.
-- owner_id is separate from the primary key's meaning so multiplayer worlds can
-- be added later without reshaping single-player data.
-- ---------------------------------------------------------------------------
create table if not exists public.worlds (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles (user_id) on delete cascade,
  placed_objects jsonb not null default '[]'::jsonb,
  progress       jsonb not null default '{}'::jsonb,
  schema_version int   not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (owner_id)
);

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_characters_touch on public.characters;
create trigger trg_characters_touch before update on public.characters
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_worlds_touch on public.worlds;
create trigger trg_worlds_touch before update on public.worlds
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Protect the permanent Player ID from being changed by the client.
-- ---------------------------------------------------------------------------
create or replace function public.lock_player_id()
returns trigger
language plpgsql
as $$
begin
  if new.player_id is distinct from old.player_id then
    raise exception 'player_id is permanent and cannot be changed';
  end if;
  if new.user_id is distinct from old.user_id then
    raise exception 'user_id cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_lock on public.profiles;
create trigger trg_profiles_lock before update on public.profiles
  for each row execute function public.lock_player_id();

-- ---------------------------------------------------------------------------
-- Auto-create a profile (and its permanent Player ID) on first sign-up.
-- security definer so it can insert even though the new user has no session yet.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.characters enable row level security;
alter table public.worlds     enable row level security;

alter table public.profiles   force row level security;
alter table public.characters force row level security;
alter table public.worlds     force row level security;

-- profiles: read and update only your own row. No insert (the trigger does it)
-- and no delete from the client.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- characters: full control of your own row only.
drop policy if exists "characters_select_own" on public.characters;
create policy "characters_select_own" on public.characters
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "characters_insert_own" on public.characters;
create policy "characters_insert_own" on public.characters
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "characters_update_own" on public.characters;
create policy "characters_update_own" on public.characters
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- worlds: full control of worlds you own.
drop policy if exists "worlds_select_own" on public.worlds;
create policy "worlds_select_own" on public.worlds
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "worlds_insert_own" on public.worlds;
create policy "worlds_insert_own" on public.worlds
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "worlds_update_own" on public.worlds;
create policy "worlds_update_own" on public.worlds
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Anonymous (not signed in) visitors get nothing.
revoke all on public.profiles, public.characters, public.worlds from anon;
grant select, update on public.profiles   to authenticated;
grant select, insert, update on public.characters to authenticated;
grant select, insert, update on public.worlds     to authenticated;
