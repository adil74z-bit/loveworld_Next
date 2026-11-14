-- Tighten client permissions after 0001_player_data.sql.
-- Apply once, after the initial schema migration.
-- No client-side DELETE or direct profile identity edits are permitted.

revoke all on table public.profiles, public.characters, public.worlds from anon, authenticated;

-- Profiles: clients can read their own row (RLS) and change only display_name.
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

-- Character data: clients can create/update their own customization only.
grant select on table public.characters to authenticated;
grant insert (user_id, customization, schema_version) on table public.characters to authenticated;
grant update (customization, schema_version) on table public.characters to authenticated;

-- World data: clients can create/update their own saved world only.
grant select on table public.worlds to authenticated;
grant insert (owner_id, placed_objects, progress, schema_version) on table public.worlds to authenticated;
grant update (placed_objects, progress, schema_version) on table public.worlds to authenticated;

-- Trigger functions are not callable as general-purpose client RPCs.
revoke all on function public.generate_player_id() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.lock_player_id() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Do not automatically grant public execution to functions created later
-- by the role that applies this migration.
alter default privileges in schema public
  revoke execute on functions from public;
