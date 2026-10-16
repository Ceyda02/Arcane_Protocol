import { Link } from 'react-router-dom';
import { Compass, Network } from 'lucide-react';
import { Panel, ProgressBar } from '../components/common/ui.jsx';
import { CHALLENGES, MALWARE_CREATURES } from '../content/index.js';
import { QUEST_LIST } from '../content/quests/index.js';
import { SKILL_LIST } from '../content/skills.js';
import { questPath, studyPath } from '../app/paths.js';
import { t } from '../i18n/index.js';
import { useGame } from '../state/GameContext.jsx';
import { questStatus } from '../engine/unlockEngine.js';

function routeForChallenge(challenge, game) {
  const quest = QUEST_LIST.find((item) => item.playable && item.requiredChallenges.includes(challenge.id));
  if (quest && questStatus(quest, game) !== 'locked') return questPath(quest);
  const creature = MALWARE_CREATURES.find((item) => item.availability === 'field-study' && Object.values(item.challenges).includes(challenge.id));
  return creature && game.progress.completedQuests.includes('bells-of-the-silent-watch') ? studyPath(creature.id) : null;
}

export default function SkillTreePage() {
  const { game } = useGame();
  const language = game.settings.language;
  const progress = game.progress;
  const skills = SKILL_LIST.map((skill) => {
    const challenges = Object.values(CHALLENGES).filter((challenge) => challenge.skill === skill.id);
    const passedCount = challenges.filter((challenge) => progress.challengeRecords[challenge.id]?.passed).length;
    const tier = passedCount === 0 ? 'unexplored' : passedCount >= 2 ? 'practiced' : 'demonstrated';
    return { skill, challenges, passedCount, tier };
  });
  const reviewNeeded = progress.reviewQueue.some((id) => CHALLENGES[id]);
  const nextChallenge = skills
    .flatMap(({ skill, challenges }) => challenges.map((challenge) => ({ skill, challenge })))
    .find(({ challenge }) => !progress.challengeRecords[challenge.id]?.passed && routeForChallenge(challenge, game));
  const leader = [...skills].filter((item) => item.passedCount > 0).sort((a, b) => b.passedCount - a.passedCount)[0];

  return (
    <div className="skill-tree-page">
      <h1><Network size={28} aria-hidden="true" /> {t(language, 'skillTree.title')}</h1>
      <p className="lead">{t(language, 'skillTree.subtitle')}</p>

      <Panel className="skill-tree-recommendation">
        <h2><Compass size={20} aria-hidden="true" /> {t(language, 'skillTree.recommended')}</h2>
        {reviewNeeded ? (
          <>
            <p>{t(language, 'skillTree.reviewRecommendation')}</p>
            <Link className="btn btn-primary" to="/review">{t(language, 'skillTree.openReview')}</Link>
          </>
        ) : nextChallenge ? (
          <>
            <p>{t(language, 'skillTree.nextRecommendation')}: {t(language, `skill.${nextChallenge.skill.id}`)} — {nextChallenge.challenge.title}</p>
            <Link className="btn btn-primary" to={routeForChallenge(nextChallenge.challenge, game)}>{t(language, 'skillTree.openChapter')}</Link>
          </>
        ) : (
          <p>{t(language, 'skillTree.noRecommendation')}</p>
        )}
        {leader && <p className="muted">{t(language, 'skillTree.evidenceSoFar')}: {t(language, `skill.${leader.skill.id}`)}</p>}
      </Panel>

      <p className="muted">{t(language, 'skillTree.measurementNote')}</p>
      <div className="skill-tree-grid">
        {skills.map(({ skill, challenges, passedCount, tier }) => (
          <Panel key={skill.id} className={`skill-node tier-${tier}`}>
            <div className="skill-node-heading">
              <span className="skill-rune" aria-hidden="true">{skill.rune}</span>
              <div>
                <h2>{t(language, `skill.${skill.id}`)}</h2>
                <span className={`skill-tier-chip tier-${tier}`}>{t(language, `skillTree.stage.${tier}`)}</span>
              </div>
            </div>
            <p>{t(language, `skillTree.tier.${tier}`)}</p>
            <ProgressBar
              value={passedCount}
              max={Math.max(1, challenges.length)}
              label={`${t(language, `skill.${skill.id}`)}: ${passedCount} ${t(language, 'skillTree.passedOf')} ${challenges.length}`}
            />
            <p className="muted">{passedCount} / {challenges.length} {t(language, 'skillTree.passedOf')}</p>
            {challenges.length === 0 ? (
              <p className="muted">{t(language, 'skillTree.noChallenges')}</p>
            ) : (
              <ul className="skill-node-challenges">
                {challenges.map((challenge) => {
                  const record = progress.challengeRecords[challenge.id];
                  const href = routeForChallenge(challenge, game);
                  return (
                    <li key={challenge.id}>
                      <span>{record?.passed ? '✓' : record?.attempts ? '↻' : '○'} {challenge.title}</span>
                      <span className="muted">{record?.passed ? t(language, 'skillTree.passed') : record?.attempts ? t(language, 'skillTree.review') : t(language, 'skillTree.notStarted')}</span>
                      {!record?.passed && href && <Link to={href}>{t(language, 'skillTree.openChapter')}</Link>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        ))}
      </div>
      <p className="muted skill-tree-disclaimer">{t(language, 'skillTree.disclaimer')}</p>
      <Link className="btn btn-ghost" to="/profile">{t(language, 'skillTree.back')}</Link>
    </div>
  );
}
