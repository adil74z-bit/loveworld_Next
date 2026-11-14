# Design Questions

The game should be built around your choices. No final island or character art
direction is being assumed yet.

## 1. Island map and locations

- Overall shape and scale: compact cozy island or larger open world?
- Required locations: villa/house, beach, garden, dock, forest, other?
- Where should the player spawn?
- Paths, bridges, ocean edge, hills, hidden areas?
- Do you have a reference image, sketch or game reference?

## 2. Environment and buildings

- Art style: realistic, stylized-realistic, low-poly, anime or another style?
- Fixed golden hour or a day/night cycle?
- Calm/romantic, magical, tropical or adventurous mood?
- Which buildings can the player enter?
- Do you have GLB/GLTF character, building or prop models to use?

## 3. Characters

- Separate male/female base models or one shared base?
- Realistic or stylized proportions?
- Do you already have rigged GLB/GLTF models?
- Third-person camera confirmed?
- Which animations are essential: idle, walk, run, jump, sit, wave, dance?

## 4. Character creator

- Face presets or detailed sliders?
- Hair styles and colors?
- Skin tone and body type choices?
- Outfits, shoes and accessories?
- Should players be able to edit their character later?

## 5. Gameplay and controls

- Which objects should be interactable?
- What should be saved permanently between logins?
- Desktop controls and mobile joystick/camera preferences?
- Any emotes or social actions planned for the single-player stage?

## Technical direction

- Backend: Supabase only.
- First release: single-player with a permanent account/profile.
- Multiplayer: deferred, but ownership and world data should not block it later.
