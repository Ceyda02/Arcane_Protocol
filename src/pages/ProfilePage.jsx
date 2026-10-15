import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { levelProgress } from '../engine/progressionEngine.js';
import { ACHIEVEMENTS } from '../engine/progressionEngine.js';
import { SKILL_LIST } from '../content/skills.js';
import { PATHS, PATH_LIST } from '../content/paths.js';
import { ARCHETYPES, EQUIPMENT } from '../content/archetypes.js';
import { MALWARE_CREATURES } from '../content/index.js';
import { REALM_CREATURES } from '../content/bestiary.js';
import { GRIMOIRE_PAGES } from '../content/lessons/grimoire.js';
import { Button, Panel, ProgressBar } from '../components/common/ui.jsx';
import PlayerPortrait from '../components/character/PlayerPortrait.jsx';

export default function ProfilePage() {
  const { game, dispatch } = useGame();
  const nav = useNavigate();
  const { player, progress } = game;
  const lp = levelProgress(progress.xp);
  const path = game.pathId ? PATHS[game.pathId] : null;
  const maxSkill = Math.max(60, ...Object.values(progress.skillXp));

  return (
    <div className="profile">
      <Panel className="profile-card" tone="leather">
        <PlayerPortrait size="xl" />
        <div>
          <h1>{player.address ? `${player.address} ` : ''}{player.name}</h1>
          <p className="muted">{ARCHETYPES.find((a) => a.id === player.archetypeId)?.name} · {EQUIPMENT.find((e) => e.id === player.equipmentId)?.name}</p>
          <p>Level {lp.level} · {progress.xp} XP</p>
          <ProgressBar value={lp.into} max={lp.needed} label="Progress to next level" />
          <p className="muted">{lp.needed - lp.into} XP to level {lp.level + 1}</p>
          {game.streak.count > 0 && <p>🔥 {game.streak.count}-day learning streak (optional bonus, no penalty for breaks)</p>}
        </div>
      </Panel>

      <Panel>
        <h2>Your order</h2>
        <p>{path ? `${path.name}: ${path.title}` : 'No order chosen yet.'}</p>
        <div className="path-switch" role="group" aria-label="Choose an order">
          {PATH_LIST.map((p) => <Button key={p.id} variant={game.pathId === p.id ? 'primary' : 'ghost'} aria-pressed={game.pathId === p.id} onClick={() => dispatch({ type: 'SET_PATH', pathId: p.id })}>{p.name}</Button>)}
        </div>
        <p className="muted">Switching orders changes the perspective shown in Bestiary encounters. It never locks any lesson.</p>
        <Button variant="ghost" onClick={() => nav('/assessment')}>Retake the Trial of Three Runes</Button>
      </Panel>

      <Panel>
        <h2>Skill progression</h2>
        <div className="skill-bars">
          {SKILL_LIST.map((s) => (
            <div key={s.id} className="skill-row">
              <span title={s.blurb}><span aria-hidden="true">{s.rune}</span> {s.name}</span>
              <ProgressBar value={progress.skillXp[s.id]} max={maxSkill} label={`${s.name} experience`} />
              <span>{progress.skillXp[s.id]} XP</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2>Achievements ({progress.achievements.length}/{ACHIEVEMENTS.length})</h2>
        <ul className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const got = progress.achievements.includes(a.id);
            return (
              <li key={a.id} className={`ach ${got ? 'is-earned' : ''}`}>
                <strong>{got ? '🏅 ' : '🔒 '}{a.name}</strong>
                <span className="muted">{a.desc}</span>
                <span className="sr-only">{got ? 'Earned' : 'Not yet earned'}</span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel>
        <h2>Journey so far</h2>
        <ul>
          <li>Quests completed: {progress.completedQuests.length}</li>
          <li>Grimoire pages: {progress.grimoire.length} of {GRIMOIRE_PAGES.length}</li>
          <li>Malware creatures studied: {MALWARE_CREATURES.filter((c) => progress.bestiary[c.id]).length} of {MALWARE_CREATURES.length}</li>
          <li>Realm beasts met: {REALM_CREATURES.filter((c) => progress.bestiary[c.id]).length} of {REALM_CREATURES.length}</li>
        </ul>
        <p>{progress.reviewQueue.length > 0 ? `${progress.reviewQueue.length} concept(s) are waiting in your review queue.` : 'Your review queue is empty.'} <Link to="/review">Open review</Link></p>
      </Panel>
    </div>
  );
}
