import { Game } from './core/Game.js';
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
    if (!canvas) throw new Error('Game canvas was not found.');

    const game = new Game(canvas);
    game.onStatus((message, ready = false) => {
      setStatus(message);
      if (ready) window.setTimeout(() => bootScreen?.classList.add('fade-out'), 900);
    });

    if (debugPanel) {
      debugPanel.classList.remove('hidden');
      game.onDebug((text) => {
        debugPanel.textContent = `Love World Next v${GAME_VERSION}\\n${text}`;
      });
    }

    game.start();
  } catch (err) {
    console.error('Boot failed:', err);
    setStatus(`Something went wrong: ${err.message}`);
  }
}

boot();
