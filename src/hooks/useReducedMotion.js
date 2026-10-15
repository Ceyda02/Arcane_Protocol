import { useGame } from '../state/GameContext.jsx';

/** True when animation should be minimized: explicit setting wins, otherwise the OS preference. */
export function useReducedMotion() {
  const { game } = useGame();
  const pref = game.settings.reducedMotion;
  if (pref === 'on') return true;
  if (pref === 'off') return false;
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
}
