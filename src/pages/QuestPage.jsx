import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGame } from '../state/GameContext.jsx';
import { QUESTS, SCENES, LESSONS, CHALLENGES } from '../content/index.js';
import { questStatus } from '../engine/unlockEngine.js';
import { asset } from '../components/common/assets.js';
import DialogueRunner from '../components/dialogue/DialogueRunner.jsx';
import LessonView from '../components/game/LessonView.jsx';
import ChallengeRunner from '../components/challenges/ChallengeRunner.jsx';
import CompletionScreen from '../components/game/CompletionScreen.jsx';
import { Button, Panel, EmptyState } from '../components/common/ui.jsx';

function SceneBanner({ scene, index, total }) {
  return (
    <div className="scene-banner" style={scene.background ? { '--scene': `url(${asset(scene.background)})` } : undefined}>
      <p className="scene-step">Step {Math.min(index + 1, total)} of {total}</p>
      <p className="scene-objective"><strong>Objective:</strong> {scene.objective}</p>
    </div>
  );
}

function SceneView({ scene, flags, onFlags, onDone, quest, reviewMode }) {
  const { game } = useGame();
  const [endDone, setEndDone] = useState(false);
  if (scene.type === 'dialogue' || scene.type === 'ending') {
    return (
      <>
        <DialogueRunner key={scene.id} nodes={scene.nodes} flags={flags} onSetFlags={onFlags} completeLabel="Continue" onComplete={() => (scene.type === 'ending' ? setEndDone(true) : onDone())} />
        {scene.type === 'ending' && endDone && (
          <Panel><h3>What the Watch has learned</h3><div className="create-actions"><Button onClick={onDone}>Finish chapter</Button></div></Panel>
        )}
      </>
    );
  }
  if (scene.type === 'lesson') return <LessonView key={scene.id} lesson={LESSONS[scene.lessonId]} flags={flags} onContinue={onDone} />;
  if (scene.type === 'challenge') {
    const ch = CHALLENGES[scene.challengeId];
    const already = game.progress.challengeRecords[ch.id]?.passed && !reviewMode;
    return (
      <>
        {already && <Panel className="notice">You have already passed this challenge. <Button variant="ghost" onClick={onDone}>Continue</Button></Panel>}
        <ChallengeRunner key={scene.id} challenge={ch} grimoire={scene.grimoire} reviewMode={reviewMode} onContinue={onDone} continueLabel={reviewMode ? 'Back to review list' : 'Continue the story'} />
      </>
    );
  }
  return null;
}

export default function QuestPage() {
  const { questId } = useParams();
  const { game, dispatch } = useGame();
  const quest = QUESTS[questId];
  const scenes = SCENES[questId];
  const [reviewIdx, setReviewIdx] = useState(null);

  const status = quest ? questStatus(quest, game) : 'locked';
  const qs = game.progress.questState[questId] ?? { stage: 0, flags: {} };
  const finished = scenes && qs.stage >= scenes.length;

  useEffect(() => {
    if (finished && status === 'available') dispatch({ type: 'COMPLETE_QUEST', questId });
  }, [finished, status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!quest || !scenes || !quest.playable || status === 'locked') {
    return <EmptyState title="This path is sealed" action={<Link to="/map" className="btn btn-primary">Back to the map</Link>}>This quest is not available yet. Check the map for what it requires.</EmptyState>;
  }

  const summary = scenes.find((s) => s.type === 'ending')?.summary;

  if (status === 'completed' || (finished && status !== 'available')) {
    if (reviewIdx !== null) {
      const scene = scenes[reviewIdx];
      return (
        <div className="quest">
          <Button variant="ghost" onClick={() => setReviewIdx(null)}>← Review list</Button>
          <SceneView scene={scene} flags={qs.flags} onFlags={() => {}} onDone={() => setReviewIdx(null)} quest={quest} reviewMode />
        </div>
      );
    }
    return (
      <div className="quest">
        <CompletionScreen quest={quest} summary={summary} />
        <Panel>
          <h2>Review mode</h2>
          <p className="muted">Revisit lessons and practice challenges. Replays never change your XP.</p>
          <ul className="review-list">
            {scenes.map((s, i) => (s.type === 'lesson' || s.type === 'challenge') && (
              <li key={s.id}><Button variant="ghost" onClick={() => setReviewIdx(i)}>{s.type === 'lesson' ? 'Lesson' : 'Practice'}: {s.type === 'lesson' ? LESSONS[s.lessonId].title : CHALLENGES[s.challengeId].title}</Button></li>
            ))}
          </ul>
        </Panel>
      </div>
    );
  }

  if (finished) return <div className="quest"><CompletionScreen quest={quest} summary={summary} /></div>;

  const scene = scenes[qs.stage];
  return (
    <div className="quest">
      <h1 className="quest-title">{quest.title}</h1>
      <SceneBanner scene={scene} index={qs.stage} total={scenes.length} />
      <SceneView
        scene={scene}
        flags={qs.flags}
        onFlags={(f) => dispatch({ type: 'SET_FLAGS', questId, flags: f })}
        onDone={() => dispatch({ type: 'SET_QUEST_STAGE', questId, stage: qs.stage + 1 })}
        quest={quest}
      />
    </div>
  );
}
