import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';
import { GameProvider } from './state/GameContext.jsx';
import { loadGameAsync } from './storage/saveStorage.js';
import App from './app/App.jsx';

if (import.meta.env.PROD && ['http:', 'https:'].includes(window.location.protocol) && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Offline game installation could not be enabled.', error);
    });
  });
}

async function startGame() {
  const storage = window.arcaneProtocol?.saveStorage;
  const initialBoot = await loadGameAsync(storage);
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <GameProvider storage={storage} initialBoot={initialBoot}>
        <HashRouter>
          <App />
        </HashRouter>
      </GameProvider>
    </StrictMode>,
  );
}

startGame().catch((error) => {
  console.error('The game could not be started.', error);
  const root = document.getElementById('root');
  root.textContent = 'The game could not be started. Please restart the game.';
});
