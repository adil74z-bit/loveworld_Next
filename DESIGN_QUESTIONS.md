# Design Questions (waiting for your answers)

No map or character design has been invented or built. Please answer what you can,
and send references, sketches and 3D models whenever you like.

## 1. Island map and locations
- What is the overall shape and size? (small cozy island, big open world, several islands?)
- Which locations must exist? (house, beach, forest, lighthouse, dock, garden, cave, ...)
- Where does the player start?
- Should there be paths, bridges, water, mountains, secret places?
- Do you have a reference image, map sketch, or game it should feel like?

## 2. Environment, buildings and atmosphere
- Art style: realistic, low-poly, stylized/cartoon, anime-like?
- Time of day and weather: fixed sunset, day/night cycle, rain, snow?
- Mood: romantic, calm, magical, adventurous?
- Music and ambient sounds you want?
- Which buildings are enterable? What should the main house look like inside?
- Do you already have 3D models (GLB/GLTF, FBX, OBJ) for buildings, trees, props?

## 3. Characters: male and female
- Same body base for both, or two different models?
- Realistic, stylized, chibi, anime proportions?
- Do you have character models (GLB/GLTF/VRM), or should we pick a free source later?
- First person or third person camera?

## 4. Face, hair, body and outfits
- Face: preset faces, or sliders (eyes, nose, mouth, skin tone)?
- Hair: how many styles and colors? Facial hair options?
- Body: height/build sliders, or a few fixed body types?
- Outfits: tops, bottoms, shoes, accessories, full outfits? Hijab/cultural options?
- Any clothing you want included or excluded?

## 5. Animations and customization options
- Needed animations: idle, walk, run, jump, wave, sit, dance, others?
- Emotes or interactions (hug pose, photo pose, sit on bench)?
- Can players change their character later (Edit Character)? Any limits?
- Should customization be free, or unlocked by progress?

## 6. Technical decision I need from you
- **Which backend is the single source of truth: Supabase or Firebase?**
  Phase 0 contained Firebase stubs. This sync added a ready Supabase database design.
  Running both would be confusing, so please pick one. Nothing has been deleted.
- If Supabase: which Google sign-in setup do you prefer (Supabase Auth with Google provider is the plan)?
