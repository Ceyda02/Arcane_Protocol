import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { QUESTS, CHALLENGES, CREATURES_BY_ID } from '../content/index.js';
import { REGIONS } from '../content/world.js';
import { GRIMOIRE_BY_ID } from '../content/lessons/grimoire.js';
import { questStatus, unmetRequirements } from '../engine/unlockEngine.js';
import { asset } from '../components/common/assets.js';
import ChallengeRunner from '../components/challenges/ChallengeRunner.jsx';
import RealWorldPanel from '../components/bestiary/RealWorldPanel.jsx';
import CompletionScreen from '../components/game/CompletionScreen.jsx';
import { Button, Panel, EmptyState } from '../components/common/ui.jsx';
import { t } from '../i18n/index.js';
import { localizeBestiaryCreature, localizeBestiaryPage } from '../i18n/bestiary.js';
import { localizeMalwareChallenge } from '../i18n/malware.js';

const STAGES = [['beginner', 'encounter.beginner'], ['intermediate', 'encounter.intermediate'], ['boss', 'encounter.boss']];

export default function EncounterPage() {
  const { questId, creatureId } = useParams();
  const { game, dispatch } = useGame();
  const language = game.settings.language;
  const quest = questId ? QUESTS[questId] : null;
  const baseCreature = CREATURES_BY_ID[quest ? quest.creatureId : creatureId];
  const creature = baseCreature ? localizeBestiaryCreature(baseCreature, language) : null;
  const records = game.progress.challengeRecords;
  const stages = creature ? STAGES.filter(([k]) => creature.challenges[k]) : [];
  const firstOpen = stages.findIndex(([k]) => !records[creature.challenges[k]]?.passed);
  const [viewing, setViewing] = useState(null); // index of a stage chosen manually
  const [introSeen, setIntroSeen] = useState(false);

  useEffect(() => {
    if (creature && !game.progress.bestiary[creature.id]) {
      dispatch({ type: 'DISCOVER_CREATURE', id: creature.id, status: 'seen' });
    }
  }, [creature?.id, game.progress.bestiary[creature?.id]]); // eslint-disable-line react-hooks/exhaustive-deps

  const allPassed = creature && firstOpen === -1;
  useEffect(() => {
    if (quest && allPassed && !game.progress.completedQuests.includes(quest.id)) dispatch({ type: 'COMPLETE_QUEST', questId: quest.id });
  }, [allPassed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!creature) return <EmptyState title={t(language, 'encounter.notFound.title')} action={<Link to="/bestiary" className="btn btn-primary">{t(language, 'encounter.openBestiary')}</Link>}>{t(language, 'encounter.notFound.body')}</EmptyState>;

  // Access rules
  let needs = [];
  if (quest) needs = questStatus(quest, game) === 'locked' ? unmetRequirements({ quests: quest.requires, anyQuests: quest.requiresAny }, game) : [];
  else if (creature.availability !== 'field-study') needs = [t(language, 'encounter.beginFromMap')];
  else {
    const region = REGIONS.find((entry) => entry.id === creature.studyRegionId);
    needs = region ? unmetRequirements(region.unlock, game) : [t(language, 'map.genericRequirement')];
  }
  if (needs.length) {
    return <EmptyState title={t(language, 'encounter.locked.title')} action={<Link to="/map" className="btn btn-primary">{t(language, 'encounter.backToMap')}</Link>}>{t(language, 'encounter.requirements')}: {needs.join('; ')}</EmptyState>;
  }

  const idx = viewing ?? (firstOpen === -1 ? stages.length - 1 : firstOpen);
  const [key] = stages[idx];
  const challenge = CHALLENGES[creature.challenges[key]];
  const localizedChallenge = localizeMalwareChallenge(challenge, language);
  const grimoirePage = localizeBestiaryPage(GRIMOIRE_BY_ID[`beast-${creature.id}`], language);
  const reviewMode = Boolean(records[challenge.id]?.passed);
  const art = asset(creature.art);
  const started = introSeen || stages.some(([k]) => records[creature.challenges[k]]);
  const fieldDone = creature.availability === 'field-study' && allPassed;

  return (
    <div className="encounter" data-order={game.pathId ? undefined : undefined}>
      <header className="encounter-head">
        {art && <img className="creature-art creature-art-lg" src={art} alt={`${creature.name}, ${creature.title}`} />}
        <div>
          <p className="muted">{t(language, `bestiary.category.${creature.category}`)} · {creature.malwareType}</p>
          <h1>{creature.name}: {creature.title}</h1>
          <p className="lore">{creature.lore}</p>
          <p className="muted"><em>{creature.personality}</em></p>
        </div>
      </header>

      <div className="encounter-grid">
        <div className="encounter-main">
          {!started ? (
            <Panel>
              <h2>{t(language, 'encounter.scene')}</h2>
              <p>{creature.scenario}</p>
              <p className="muted">{t(language, 'encounter.sceneNote')}</p>
              <Button onClick={() => setIntroSeen(true)}>{t(language, creature.availability === 'field-study' ? 'encounter.beginStudy' : 'encounter.beginEncounter')}</Button>
            </Panel>
          ) : (
            <>
              <ol className="stage-track" aria-label={t(language, 'encounter.stages')}>
                {stages.map(([k, l], i) => {
                  const done = records[creature.challenges[k]]?.passed;
                  return (
                    <li key={k} className={`${i === idx ? 'is-current' : ''} ${done ? 'is-done' : ''}`}>
                      <button type="button" className="link-btn" disabled={!done && i !== firstOpen} onClick={() => setViewing(i)} aria-current={i === idx ? 'step' : undefined}>
                        <span aria-hidden="true">{done ? '✔' : i === firstOpen ? '◆' : '🔒'}</span> {t(language, l)}{done ? ` (${t(language, 'encounter.done')})` : i === firstOpen ? '' : ` (${t(language, 'encounter.lockedStage')})`}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <ChallengeRunner
                key={challenge.id}
                challenge={localizedChallenge}
                reviewMode={reviewMode}
                onResult={(r) => r.passed && setViewing(idx)}
                onContinue={() => setViewing(null)}
                continueLabel={idx < stages.length - 1 && !records[creature.challenges[stages[idx + 1][0]]]?.passed
                  ? `${language === 'tr' ? 'Devam:' : 'Continue:'} ${t(language, stages[idx + 1][1])}`
                  : language === 'tr' ? 'Tamam' : 'Done'}
              />
              {fieldDone && (
                <Panel>
                  <h2>{t(language, 'encounter.complete')}</h2>
                  <p>{t(language, 'encounter.studied').replace('{name}', creature.name)} <strong>{grimoirePage?.title}</strong>.</p>
                  <p className="muted">{t(language, 'encounter.introOnly')}</p>
                  <div className="create-actions"><Link className="btn btn-primary" to="/bestiary">{t(language, 'encounter.backToBestiary')}</Link></div>
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
