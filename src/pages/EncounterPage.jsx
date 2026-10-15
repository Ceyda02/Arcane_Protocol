import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { QUESTS, CHALLENGES, CREATURES_BY_ID } from '../content/index.js';
import { GRIMOIRE_BY_ID } from '../content/lessons/grimoire.js';
import { questStatus, unmetRequirements } from '../engine/unlockEngine.js';
import { asset } from '../components/common/assets.js';
import ChallengeRunner from '../components/challenges/ChallengeRunner.jsx';
import RealWorldPanel from '../components/bestiary/RealWorldPanel.jsx';
import CompletionScreen from '../components/game/CompletionScreen.jsx';
import { Button, Panel, EmptyState } from '../components/common/ui.jsx';

const STAGES = [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['boss', 'Boss encounter']];

export default function EncounterPage() {
  const { questId, creatureId } = useParams();
  const { game, dispatch } = useGame();
  const quest = questId ? QUESTS[questId] : null;
  const creature = CREATURES_BY_ID[quest ? quest.creatureId : creatureId];
  const records = game.progress.challengeRecords;
  const stages = creature ? STAGES.filter(([k]) => creature.challenges[k]) : [];
  const firstOpen = stages.findIndex(([k]) => !records[creature.challenges[k]]?.passed);
  const [viewing, setViewing] = useState(null); // index of a stage chosen manually
  const [introSeen, setIntroSeen] = useState(false);

  useEffect(() => {
    if (creature && game.progress.completedQuests.includes('bells-of-the-silent-watch') && !game.progress.bestiary[creature.id]) {
      dispatch({ type: 'DISCOVER_CREATURE', id: creature.id, status: 'seen' });
    }
  }, [creature?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const allPassed = creature && firstOpen === -1;
  useEffect(() => {
    if (quest && allPassed && !game.progress.completedQuests.includes(quest.id)) dispatch({ type: 'COMPLETE_QUEST', questId: quest.id });
  }, [allPassed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!creature) return <EmptyState title="Nothing stirs here" action={<Link to="/bestiary" className="btn btn-primary">Open the Bestiary</Link>}>That creature could not be found.</EmptyState>;

  // Access rules
  let needs = [];
  if (quest) needs = questStatus(quest, game) === 'locked' ? unmetRequirements({ quests: quest.requires, anyQuests: quest.requiresAny }, game) : [];
  else if (creature.availability !== 'field-study') needs = ['Begin this creature’s encounter from the map'];
  else needs = unmetRequirements({ quests: ['bells-of-the-silent-watch'] }, game);
  if (needs.length) {
    return <EmptyState title="The way is sealed" action={<Link to="/map" className="btn btn-primary">Back to the map</Link>}>Requires: {needs.join('; ')}</EmptyState>;
  }

  const idx = viewing ?? (firstOpen === -1 ? stages.length - 1 : firstOpen);
  const [key, label] = stages[idx];
  const challenge = CHALLENGES[creature.challenges[key]];
  const reviewMode = Boolean(records[challenge.id]?.passed);
  const art = asset(creature.art);
  const started = introSeen || stages.some(([k]) => records[creature.challenges[k]]);
  const fieldDone = creature.availability === 'field-study' && allPassed;

  return (
    <div className="encounter" data-order={game.pathId ? undefined : undefined}>
      <header className="encounter-head">
        {art && <img className="creature-art creature-art-lg" src={art} alt={`${creature.name}, ${creature.title}`} />}
        <div>
          <p className="muted">{creature.category} · {creature.malwareType}</p>
          <h1>{creature.name}: {creature.title}</h1>
          <p className="lore">{creature.lore}</p>
          <p className="muted"><em>{creature.personality}</em></p>
        </div>
      </header>

      <div className="encounter-grid">
        <div className="encounter-main">
          {!started ? (
            <Panel>
              <h2>The scene</h2>
              <p>{creature.scenario}</p>
              <p className="muted">Read the Real-World Knowledge panel first if you like. It explains the real threat behind the story.</p>
              <Button onClick={() => setIntroSeen(true)}>{creature.availability === 'field-study' ? 'Begin the field study' : 'Begin the encounter'}</Button>
            </Panel>
          ) : (
            <>
              <ol className="stage-track" aria-label="Encounter stages">
                {stages.map(([k, l], i) => {
                  const done = records[creature.challenges[k]]?.passed;
                  return (
                    <li key={k} className={`${i === idx ? 'is-current' : ''} ${done ? 'is-done' : ''}`}>
                      <button type="button" className="link-btn" disabled={!done && i !== firstOpen} onClick={() => setViewing(i)} aria-current={i === idx ? 'step' : undefined}>
                        <span aria-hidden="true">{done ? '✔' : i === firstOpen ? '◆' : '🔒'}</span> {l}{done ? ' (done)' : i === firstOpen ? '' : ' (locked)'}
                      </button>
                    </li>
                  );
                })}
                {creature.availability === 'field-study' && <li className="is-planned"><span aria-hidden="true">⏳</span> Intermediate and boss encounters: planned</li>}
              </ol>
              <ChallengeRunner
                key={challenge.id}
                challenge={challenge}
                reviewMode={reviewMode}
                onResult={(r) => r.passed && setViewing(idx)}
                onContinue={() => setViewing(null)}
                continueLabel={idx < stages.length - 1 && !records[creature.challenges[stages[idx + 1][0]]]?.passed ? `On to the ${stages[idx + 1][1].toLowerCase()}` : 'Done'}
              />
              {fieldDone && (
                <Panel>
                  <h2>Field study complete</h2>
                  <p>You have studied the {creature.name}. Its Bestiary entry is open and a Grimoire page was added: <strong>{GRIMOIRE_BY_ID[`beast-${creature.id}`]?.title}</strong>.</p>
                  <p className="muted">Intermediate and boss encounters for this creature are planned for a future release.</p>
                  <div className="create-actions"><Link className="btn btn-primary" to="/bestiary">Back to the Bestiary</Link></div>
                </Panel>
              )}
              {quest && allPassed && game.progress.completedQuests.includes(quest.id) && <CompletionScreen quest={quest} />}
            </>
          )}
        </div>
        <RealWorldPanel creature={creature} />
      </div>
    </div>
  );
}
