// PHASE 1 (not built yet): Google sign-in.
// The shape below is the contract the rest of the game will rely on.
//
//   signInWithGoogle()  -> opens Google popup, returns the Firebase user
//   signOutUser()       -> logs out
//   onAuthChanged(cb)   -> calls cb(user | null) whenever login state changes
//
// Nothing here is wired up yet, so nothing is claimed to work.

export async function signInWithGoogle() {
  throw new Error('Not implemented yet: planned for Phase 1.');
}

export async function signOutUser() {
  throw new Error('Not implemented yet: planned for Phase 1.');
}

export function onAuthChanged(_callback) {
  throw new Error('Not implemented yet: planned for Phase 1.');
}
