-- Harden the dashboard-created automatic RLS event-trigger function.
-- Event triggers do not need API-role EXECUTE grants; keep it out of PostgREST RPC.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- The signup trigger is SECURITY DEFINER, so use an empty search_path.
-- Its table reference is already schema-qualified in migration 0001.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
