// PHASE 1-2 (not built yet): the player's cloud profile.
//
// Planned Firestore document:  players/{uid}
// {
//   playerId:   "LW-XXXXXXXX",   // permanent unique ID, created once, never changed
//   displayName: string,
//   character:  { ...customization },
//   createdAt, updatedAt,
//   schemaVersion: 1
// }
//
// Planned functions:
//   getOrCreateProfile(user)   -> loads profile, or creates it with a new permanent Player ID
//   saveCharacter(uid, data)   -> saves character customization to the cloud
//
// Every save goes to Firebase. Browser storage is never the only copy.

export async function getOrCreateProfile(_user) {
  throw new Error('Not implemented yet: planned for Phase 1.');
}

export async function saveCharacter(_uid, _character) {
  throw new Error('Not implemented yet: planned for Phase 2.');
}
