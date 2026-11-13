// PHASE 5+ (not built yet): saving island changes and progress.
//
// Planned Firestore document:  worlds/{ownerUid}
// { ownerUid, placedObjects: [...], progress: {...}, updatedAt, schemaVersion: 1 }
//
// Keyed by ownerUid today (single-player). Keeping "ownerUid" as a separate
// field means a future multiplayer world can have many players without
// changing how single-player data is stored.

export async function loadWorld(_ownerUid) {
  throw new Error('Not implemented yet: planned for a later phase.');
}

export async function saveWorld(_ownerUid, _worldState) {
  throw new Error('Not implemented yet: planned for a later phase.');
}
