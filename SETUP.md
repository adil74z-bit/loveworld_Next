# Setup Guide

## 1. Run the project

1. Install Node.js LTS from https://nodejs.org.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite (usually http://localhost:5173).

The 3D preview can start without Supabase configuration. Account and cloud-save
features require the Supabase project to be configured.

## 2. Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**.
3. Run `supabase/migrations/0001_player_data.sql` first.
4. Run `supabase/migrations/0002_tighten_privileges.sql` second.
5. Run the checks in `supabase/tests/rls_check.sql`.
6. Under **Project Settings -> API**, copy the Project URL and public anon/publishable key.
7. Put those values in a local `.env` file using `.env.example` as the template.

Never put a service_role/secret key in a Vite `VITE_*` variable. Anything with
that prefix is included in browser-delivered code.

## 3. Google sign-in (when Phase 1 is implemented)

The app's Google login flow is not implemented yet. When it is, enable Google
under **Authentication -> Providers** in Supabase. Configure the Google OAuth
client using the callback URL displayed by Supabase, then add the app's local
and production URLs under **Authentication -> URL Configuration**.

Do not consider login ready until it has been tested with real Google accounts.
