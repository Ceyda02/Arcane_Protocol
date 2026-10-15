import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';
import { GameProvider } from './state/GameContext.jsx';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </GameProvider>
  </StrictMode>,
);
