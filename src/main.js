import { Game } from './core/Game.js';
import { isFirebaseConfigured } from './firebase/firebaseApp.js';
import { GAME_VERSION } from './core/constants.js';

const statusEl = document.getElementById('boot-status');
const bootScreen = document.getElementById('boot-screen');
const debugPanel = document.getElementById('debug-panel');

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

async function boot() {
  try {
    setStatus('Preparing 3D engine...');
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    game.start();

    // Phase 0 only checks that Firebase *settings* exist. Login comes in Phase 1.
    setStatus(
      isFirebaseConfigured()
        ? 'Firebase settings found.'
        : 'Firebase not configured yet (see SETUP.md). The 3D foundation still works.'
    );

    debugPanel.classList.remove('hidden');
    game.onDebug((text) => {
      debugPanel.textContent = `Love World Next v${GAME_VERSION}\n${text}`;
    });

    setTimeout(() => bootScreen.classList.add('fade-out'), 900);
  } catch (err) {
    console.error('Boot failed:', err);
    setStatus(`Something went wrong: ${err.message}`);
  }
}

boot();
