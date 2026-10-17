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
import { localizeChapter1 } from '../i18n/chapter1.js';
import { t } from '../i18n/index.js';

function SceneBanner({ scene, index, total }) {
  const { game } = useGame();
  const language = game.settings.language;
  return (
    <div className="scene-banner" style={scene.background ? { '--scene': `url(${asset(scene.background)})` } : undefined}>
      <p className="scene-step">{t(language, 'chapter.stepOf')} {Math.min(index + 1, total)} {t(language, 'chapter.of')} {total}</p>
      <p className="scene-objective"><strong>{t(language, 'chapter.objective')}:</strong> {scene.objective}</p>
    </div>
  );
}

function SceneView({ scene, flags, onFlags, onDone, quest, reviewMode }) {
  const { game } = useGame();
  const language = game.settings.language;
  const [endDone, setEndDone] = useState(false);
  if (scene.type === 'dialogue' || scene.type === 'ending') {
    return (
      <>
        <DialogueRunner key={scene.id} nodes={scene.nodes} flags={flags} onSetFlags={onFlags} completeLabel="Continue" onComplete={() => (scene.type === 'ending' ? setEndDone(true) : onDone())} />
        {scene.type === 'ending' && endDone && (
          <Panel><h3>{t(language, 'chapter.endingTitle')}</h3><div className="create-actions"><Button onClick={onDone}>{t(language, 'chapter.finish')}</Button></div></Panel>
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
        {already && <Panel className="notice">{t(language, 'challenge.alreadyPassedNotice')} <Button variant="ghost" onClick={onDone}>{t(language, 'challenge.continue')}</Button></Panel>}
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
  const language = game.settings.language;
  const scenes = localizeChapter1(SCENES[questId], language);
  const localizedQuest = localizeChapter1(quest, language);
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
          <Button variant="ghost" onClick={() => setReviewIdx(null)}>{t(language, 'chapter.backToReview')}</Button>
          <SceneView scene={scene} flags={qs.flags} onFlags={() => {}} onDone={() => setReviewIdx(null)} quest={quest} reviewMode />
        </div>
      );
    }
    return (
      <div className="quest">
        <CompletionScreen quest={quest} summary={summary} />
        <Panel>
          <h2>{t(language, 'chapter.reviewTitle')}</h2>
          <p className="muted">{t(language, 'chapter.reviewDescription')}</p>
          <ul className="review-list">
            {scenes.map((s, i) => (s.type === 'lesson' || s.type === 'challenge') && (
              <li key={s.id}><Button variant="ghost" onClick={() => setReviewIdx(i)}>{t(language, s.type === 'lesson' ? 'chapter.lesson' : 'chapter.practice')}: {localizeChapter1(s.type === 'lesson' ? LESSONS[s.lessonId].title : CHALLENGES[s.challengeId].title, language)}</Button></li>
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
      <h1 className="quest-title">{localizedQuest.title}</h1>
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
