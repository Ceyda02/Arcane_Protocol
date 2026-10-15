import { useGame } from '../../state/GameContext.jsx';
import { COLORS } from '../../content/archetypes.js';
import { Portrait } from '../common/ui.jsx';

export function playerColor(player) {
  return COLORS.find((c) => c.id === player?.color)?.hex ?? '#6c5aa0';
}

export default function PlayerPortrait({ size = 'md' }) {
  const { game } = useGame();
  const p = game.player;
  if (!p) return null;
  return <Portrait portraitKey={p.portraitId} name={p.name} size={size} accent={playerColor(p)} />;
}
