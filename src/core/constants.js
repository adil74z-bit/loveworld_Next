export const GAME_VERSION = '0.1.0-phase0';

// Cloud save format version. Bump when the saved data shape changes,
// so old saves can be migrated instead of breaking.
export const SAVE_SCHEMA_VERSION = 1;

// Firestore collection names live in one place so they are easy to change.
export const COLLECTIONS = {
  players: 'players',
  worlds: 'worlds',
};
