# Love World Next

A brand-new browser-based 3D island game. The first release is **single-player**;
the code and data model are being kept ready for multiplayer later. This project
is separate from the old Love World repository.

## Current status

| Feature | Status |
| --- | --- |
| Vite + Three.js foundation | Present |
| Supabase client (public key only) | Present; project settings not connected |
| Database schema + row-level security | Written; migrations not yet confirmed applied to a live project |
| Google sign-in | Next development phase |
| Permanent Player ID | Database design prepared; app flow not built |
| Character creator and cloud save | Not built |
| Island, interaction and world saving | Not built |
| Multiplayer | Later; not part of the first release |

Do not treat a feature as working until it has been tested in a real browser and,
where relevant, against the real Supabase project.

## Project structure

- `index.html` - game page
- `src/main.js` - application entry point
- `src/core/` - Three.js game engine and shared constants
- `src/supabase/` - Supabase browser client
- `supabase/migrations/` - database migrations
- `supabase/tests/` - database security checks
- `src/styles/` - interface styling

## Local development

1. Install Node.js LTS.
2. In the project folder, run `npm install`.
3. Copy `.env.example` to `.env` and add the Supabase Project URL and public anon/publishable key when available.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Run `npm run build` before publishing.

The 3D preview can boot without Supabase settings. Login and cloud features cannot.

## Security rules

- Supabase is the only planned backend; Firebase has been removed.
- Only public Supabase settings may be used in browser code.
- Never expose a Supabase service_role/secret key.
- Database access must be protected by RLS and tested with separate accounts.
- Do not claim that local SQL simulations prove live-project security.
