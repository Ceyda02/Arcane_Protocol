import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';
import { GameProvider } from './state/GameContext.jsx';
import App from './app/App.jsx';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Offline game installation could not be enabled.', error);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </GameProvider>
  </StrictMode>,
);
