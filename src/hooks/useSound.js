import { useCallback } from 'react';
import { useGame } from '../state/GameContext.jsx';
import { playSound } from '../components/common/sound.js';

export function useSound() {
  const { game } = useGame();
  const s = game.settings;
  return useCallback((name) => playSound(name, s), [s]);
}
