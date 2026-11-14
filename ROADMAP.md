# Roadmap

Each phase is implemented and tested before moving to the next. The first target
is a complete single-player experience; multiplayer comes later.

| Phase | Goal | Status |
| --- | --- | --- |
| 0 | Clean project foundation and choose one backend | Cleanup in progress; live build still needs verification |
| 1 | Supabase Google sign-in + permanent Player ID + cloud profile | Not started |
| 2 | First-login character creator and cloud save | Not started |
| 3 | Lobby: profile, Play, Settings, Edit Character | Not started |
| 4 | Explorable 3D island + desktop/mobile controls | Not started |
| 5 | Interactive objects, furniture and decoration | Not started |
| 6 | Save world changes and progress to Supabase | Not started |
| Later | Multiplayer architecture and online sessions | Deferred |

## Phase 0 verification checklist

- [ ] Install dependencies with `npm install`
- [ ] Start with `npm run dev`
- [ ] Confirm the 3D scene renders in a desktop browser
- [ ] Confirm the 3D scene renders on a real phone
- [ ] Run `npm run build`
- [ ] Confirm no Firebase dependency or Firebase source files remain
- [ ] Review the Supabase migrations and test them in a disposable project
- [ ] Test RLS with two separate authenticated accounts

A checkbox is only marked complete after that exact check has been performed.
