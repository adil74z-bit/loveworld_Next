# Love World Next

An experimental **single-player 3D island game** for desktop and mobile browsers.
This is a brand-new project. It is separate from the old Love World repository, which is not touched.

## Current status: Phase 0 (foundation only)

| Item | Status |
| --- | --- |
| Project structure (Vite + Three.js) | Written |
| Placeholder 3D scene (spinning cube) | Written |
| Firebase config + service skeletons | Written (not connected) |
| Google login | Not built yet (Phase 1) |
| Character creator | Not built yet (Phase 2) |
| Island, objects, saving the world | Not built yet |

"Written" means the files exist. See `ROADMAP.md` for what has and has not been tested.

## Folder guide

```
index.html            the page that loads the game
src/main.js           starts everything
src/core/             game engine pieces (Game, EventBus, constants)
src/firebase/         everything that talks to Firebase (cloud save)
src/styles/main.css   look and feel of the page
firestore.rules       security rules: players can only touch their own data
.env.example          template for your Firebase settings
SETUP.md              step-by-step setup for beginners
ROADMAP.md            the phases and the testing checklist
```

## Quick start

See `SETUP.md`.

## Rules this project follows

- Small phases, each tested before the next begins
- No multiplayer yet, but the code is organized so it can be added later
- Progress is saved to Firebase, never only to browser storage
- Working features are never removed when adding new ones
