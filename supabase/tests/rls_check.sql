-- RLS self-check. Run in the Supabase SQL Editor AFTER applying 0001_player_data.sql.
-- Every row returned should show rls_enabled = true and forced = true.
select c.relname as table_name,
       c.relrowsecurity      as rls_enabled,
       c.relforcerowsecurity as forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'characters', 'worlds');

-- Policies that exist (expect select/update on profiles; select/insert/update on the others).
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Manual cross-user test (do this with two real test accounts, after login works):
--   1. Sign in as user A, save a character.
--   2. Sign in as user B, run: select * from characters;
--   3. Expected: user B sees only B's own row (or nothing), never A's.
-- This has NOT been run yet.
