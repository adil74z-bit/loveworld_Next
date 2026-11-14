import { Game } from './core/Game.js';
import { isSupabaseConfigured } from './supabase/supabaseClient.js';
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
    game.start();

    setStatus(
      isSupabaseConfigured()
        ? 'Supabase settings found. Account features are being prepared.'
        : '3D preview is ready. Add your Supabase public settings to enable accounts.'
    );

    if (debugPanel) {
      debugPanel.classList.remove('hidden');
      game.onDebug((text) => {
        debugPanel.textContent = `Love World Next v${GAME_VERSION}\n${text}`;
      });
    }

    window.setTimeout(() => bootScreen?.classList.add('fade-out'), 900);
  } catch (err) {
    console.error('Boot failed:', err);
    setStatus(`Something went wrong: ${err.message}`);
  }
}

boot();
