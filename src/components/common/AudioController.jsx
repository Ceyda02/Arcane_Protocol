import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGame } from '../../state/GameContext.jsx';
import { playSound, setMusicScene, unlockAudio, updateAudioSettings } from './sound.js';

function musicScene(pathname) {
  if (pathname === '/intro') return 'mainTheme';
  return 'mainTheme';
}

export default function AudioController() {
  const { game } = useGame();
  const { pathname } = useLocation();
  const settingsRef = useRef(game.settings);
  const unlockedRef = useRef(false);
  settingsRef.current = game.settings;

  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      unlockAudio(settingsRef.current);
    };
    const hover = (event) => {
      if (!unlockedRef.current) return;
      const target = event.target.closest?.('button, a, [role="button"]');
      if (!target || target.contains(event.relatedTarget)) return;
      playSound('hover', settingsRef.current);
    };
    document.addEventListener('pointerdown', unlock, { capture: true });
    document.addEventListener('keydown', unlock, { capture: true });
    document.addEventListener('pointerover', hover);
    return () => {
      document.removeEventListener('pointerdown', unlock, { capture: true });
      document.removeEventListener('keydown', unlock, { capture: true });
      document.removeEventListener('pointerover', hover);
    };
  }, []);

  useEffect(() => {
    updateAudioSettings(game.settings);
  }, [game.settings.muted, game.settings.volume, game.settings.musicVolume]);

  useEffect(() => {
    setMusicScene(musicScene(pathname), game.settings);
  }, [pathname, game.settings.muted, game.settings.musicVolume]);

  return null;
}
