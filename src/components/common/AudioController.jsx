import { useEffect, useRef } from 'react';
import { Music2, VolumeX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useGame } from '../../state/GameContext.jsx';
import { playSound, setMusicScene, unlockAudio, updateAudioSettings } from './sound.js';
import { t } from '../../i18n/index.js';

function musicScene(pathname) {
  if (pathname === '/intro') return 'mainTheme';
  return 'mainTheme';
}

export default function AudioController() {
  const { game, dispatch } = useGame();
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
  }, [game.settings.muted, game.settings.musicMuted, game.settings.volume, game.settings.musicVolume]);

  useEffect(() => {
    setMusicScene(musicScene(pathname), game.settings);
  }, [pathname, game.settings.muted, game.settings.musicMuted, game.settings.musicVolume]);

  const musicMuted = game.settings.muted || game.settings.musicMuted;
  const toggleMusic = () => {
    if (game.settings.muted) {
      unlockAudio({ ...game.settings, muted: false, musicMuted: false });
      dispatch({ type: 'UPDATE_SETTINGS', settings: { muted: false, musicMuted: false } });
      return;
    }
    const nextMusicMuted = !game.settings.musicMuted;
    if (!nextMusicMuted) unlockAudio({ ...game.settings, muted: false, musicMuted: false });
    dispatch({ type: 'UPDATE_SETTINGS', settings: { musicMuted: nextMusicMuted } });
  };

  return (
    <button
      className="music-toggle"
      type="button"
      onClick={toggleMusic}
      aria-label={t(game.settings.language, musicMuted ? 'audio.unmuteMusic' : 'audio.muteMusic')}
      aria-pressed={!musicMuted}
      title={t(game.settings.language, musicMuted ? 'audio.unmuteMusic' : 'audio.muteMusic')}
    >
      {musicMuted ? <VolumeX aria-hidden="true" /> : <Music2 aria-hidden="true" />}
    </button>
  );
}
