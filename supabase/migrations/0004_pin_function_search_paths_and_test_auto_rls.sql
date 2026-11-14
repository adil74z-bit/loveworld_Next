-- Pin search_path on trigger/helper functions to remove mutable-path warnings.
ALTER FUNCTION public.generate_player_id() SET search_path = '';
ALTER FUNCTION public.touch_updated_at() SET search_path = '';
ALTER FUNCTION public.lock_player_id() SET search_path = '';

-- Functional check: the dashboard-created DDL event trigger must still
-- automatically enable RLS on newly created public tables after hardening.
CREATE TABLE public._rls_auto_enable_smoke_test (id integer);
DO $$
BEGIN
  IF NOT (
    SELECT c.relrowsecurity
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = '_rls_auto_enable_smoke_test'
  ) THEN
    RAISE EXCEPTION 'Automatic RLS event trigger did not enable RLS';
  END IF;
END;
$$;
DROP TABLE public._rls_auto_enable_smoke_test;
