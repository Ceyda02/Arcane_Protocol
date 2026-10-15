import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/GameContext.jsx';
import { QUESTS } from '../../content/index.js';
import { GRIMOIRE_BY_ID } from '../../content/lessons/grimoire.js';
import { CREATURES_BY_ID } from '../../content/malware/creatures.js';
import { REALM_CREATURES } from '../../content/bestiary.js';
import { questRewards } from '../../engine/questEngine.js';
import { Button, Panel } from '../common/ui.jsx';
import PlayerPortrait from '../character/PlayerPortrait.jsx';

/** Chapter / encounter completion: shows what was actually earned (read from game state, not invented). */
export default function CompletionScreen({ quest, summary }) {
  const { game } = useGame();
  const nav = useNavigate();
  const rewards = questRewards(quest);
  const creature = quest.creatureId ? CREATURES_BY_ID[quest.creatureId] : null;
  const earnedXp = quest.requiredChallenges.reduce((s, id) => s + (game.progress.challengeRecords[id]?.xpAwarded ?? 0), 0) + rewards.xp;
  const pages = [...rewards.grimoire, ...(creature?.rewards?.lorePage ? [creature.rewards.lorePage, `beast-${creature.id}`] : [])];
  const beasts = [...rewards.bestiary.map((id) => REALM_CREATURES.find((c) => c.id === id)?.name), creature?.name].filter(Boolean);
  const nextQuests = Object.values(QUESTS).filter((q) => q.playable && !game.progress.completedQuests.includes(q.id) && (q.requires ?? []).every((r) => game.progress.completedQuests.includes(r)));

  return (
    <Panel className="completion" aria-labelledby="done-title">
      <PlayerPortrait size="lg" />
      <h2 id="done-title">{quest.kind === 'encounter' ? 'Threat understood' : 'Chapter complete'}: {quest.title}</h2>
      <p className="xp-note">+{earnedXp} XP earned in total</p>
      {summary && (
        <div className="summary-grid">
          <div><h3>What we know</h3><ul>{summary.known.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>What remains uncertain</h3><ul>{summary.uncertain.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Evidence needed to confirm</h3><ul>{summary.needed.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
      )}
      <h3>Unlocked</h3>
      <ul>
        {pages.map((id) => <li key={id}>Grimoire page: {GRIMOIRE_BY_ID[id]?.title}</li>)}
        {beasts.map((n) => <li key={n}>Bestiary entry: {n}</li>)}
        {nextQuests.length > 0 && <li>New quests: {nextQuests.map((q) => q.title).join(', ')}</li>}
      </ul>
      <div className="create-actions">
        <Button onClick={() => nav('/map')}>Return to the map</Button>
        <Button variant="ghost" onClick={() => nav('/grimoire')}>Open the Grimoire</Button>
        <Button variant="ghost" onClick={() => nav('/bestiary')}>View the Bestiary</Button>
      </div>
    </Panel>
  );
}
