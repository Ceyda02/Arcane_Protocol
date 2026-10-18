import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown, Compass, Network, ShieldCheck } from 'lucide-react';
import { Panel, ProgressBar } from '../components/common/ui.jsx';
import { CHALLENGES, MALWARE_CREATURES } from '../content/index.js';
import { DISCIPLINES, localizeDiscipline } from '../content/disciplines.js';
import { QUEST_LIST } from '../content/quests/index.js';
import { questPath, studyPath } from '../app/paths.js';
import { t } from '../i18n/index.js';
import { localizeChapter1 } from '../i18n/chapter1.js';
import { useGame } from '../state/GameContext.jsx';
import { questStatus } from '../engine/unlockEngine.js';
import { disciplineNodeStates, recommendedDisciplineId } from '../engine/disciplineEngine.js';

function routeForChallenge(challenge, game) {
  const quest = QUEST_LIST.find((item) => item.playable && item.requiredChallenges.includes(challenge.id));
  if (quest && questStatus(quest, game) !== 'locked') return questPath(quest);
  const creature = MALWARE_CREATURES.find((item) => item.availability === 'field-study' && Object.values(item.challenges).includes(challenge.id));
  return creature && game.progress.completedQuests.includes('bells-of-the-silent-watch') ? studyPath(creature.id) : null;
}

function localizedChallengeTitle(challenge, language) {
  return challenge.id.startsWith('c1-') ? localizeChapter1(challenge, language).title : challenge.title;
}

export default function SkillTreePage() {
  const { game } = useGame();
  const language = game.settings.language;
  const progress = game.progress;
  const recommendedId = recommendedDisciplineId(game.assessment);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState(recommendedId);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const selectedDiscipline = DISCIPLINES.find((discipline) => discipline.id === selectedDisciplineId) ?? DISCIPLINES[0];
  const states = disciplineNodeStates(selectedDiscipline, progress.challengeRecords);
  const masteredCount = Object.values(states).filter((state) => state === 'mastered').length;

  return (
    <div className="skill-tree-page">
      <h1><Network size={28} aria-hidden="true" /> {t(language, 'skillTree.title')}</h1>
      <p className="lead">{t(language, 'skillTree.disciplinesSubtitle')}</p>

      <Panel className="skill-tree-recommendation">
        <h2><Compass size={20} aria-hidden="true" /> {t(language, 'skillTree.recommended')}</h2>
        <p>{t(language, 'skillTree.recommendationNote')}</p>
        <p className="skill-recommended-path">
          <ShieldCheck size={18} aria-hidden="true" />
          <strong>{localizeDiscipline(DISCIPLINES.find((discipline) => discipline.id === recommendedId)?.title, language)}</strong>
        </p>
        <p className="muted">{t(language, 'skillTree.exploreAnyPath')}</p>
      </Panel>

      <nav className="discipline-tabs" aria-label={t(language, 'skillTree.disciplineNavigation')}>
        {DISCIPLINES.map((discipline) => (
          <button
            type="button"
            key={discipline.id}
            className={`discipline-tab discipline-${discipline.motif}${discipline.id === recommendedId ? ' is-recommended' : ''}`}
            aria-pressed={selectedDisciplineId === discipline.id}
            onClick={() => {
              setSelectedDisciplineId(discipline.id);
              setSelectedNodeId(null);
            }}
          >
            <span aria-hidden="true">{discipline.rune}</span>
            <span>{localizeDiscipline(discipline.title, language)}</span>
            {discipline.id === recommendedId && <small>{t(language, 'skillTree.suggested')}</small>}
          </button>
        ))}
      </nav>

      <section className={`discipline-chart discipline-${selectedDiscipline.motif}`} aria-labelledby="discipline-heading">
        <div className="discipline-heading">
          <div>
            <p className="discipline-kicker">{localizeDiscipline(selectedDiscipline.subtitle, language)}</p>
            <h2 id="discipline-heading">{localizeDiscipline(selectedDiscipline.title, language)}</h2>
          </div>
          <p className="muted">{masteredCount} / {selectedDiscipline.nodes.length} {t(language, 'skillTree.masteredCount')}</p>
        </div>
        <ol className="discipline-nodes">
          {selectedDiscipline.nodes.map((node, index) => {
            const state = states[node.id];
            const expanded = selectedNodeId === node.id;
            const challengeList = node.challengeIds.map((id) => CHALLENGES[id]).filter(Boolean);
            const prerequisiteNames = node.prerequisites
              .map((id) => selectedDiscipline.nodes.find((item) => item.id === id))
              .filter(Boolean)
              .map((item) => localizeDiscipline(item.title, language));
            return (
              <li key={node.id} className={`discipline-node state-${state}`}>
                <button
                  type="button"
                  className="discipline-node-toggle"
                  aria-expanded={expanded}
                  aria-controls={`discipline-detail-${node.id}`}
                  onClick={() => setSelectedNodeId((current) => current === node.id ? null : node.id)}
                >
                  <span className="discipline-node-rune" aria-hidden="true">{state === 'unknown' ? '✧' : node.rune}</span>
                  <span className="discipline-node-main">
                    <span className="discipline-node-title">{localizeDiscipline(node.title, language)}</span>
                    <span className={`discipline-state state-${state}`}>
                      <span aria-hidden="true">{state === 'mastered' ? '✓' : state === 'available' ? '◆' : state === 'discovered' ? '◇' : '·'}</span>
                      {t(language, `skillTree.state.${state}`)}
                    </span>
                  </span>
                  <ChevronDown className={expanded ? 'is-expanded' : ''} size={20} aria-hidden="true" />
                </button>
                <div id={`discipline-detail-${node.id}`} className="discipline-node-detail" hidden={!expanded}>
                  <p>{localizeDiscipline(node.description, language)}</p>
                  <p><strong>{t(language, 'skillTree.technical')}:</strong> {localizeDiscipline(node.technical, language)}</p>
                  <p><strong>{t(language, 'skillTree.requirements')}:</strong> {prerequisiteNames.length ? prerequisiteNames.join(' → ') : t(language, 'skillTree.noPrerequisites')}</p>
                  <p><strong>{t(language, 'skillTree.completionCriteria')}:</strong> {localizeDiscipline(node.criteria, language)}</p>
                  {challengeList.length > 0 && (
                    <ul className="discipline-challenges">
                      {challengeList.map((challenge) => {
                        const record = progress.challengeRecords[challenge.id];
                        const href = routeForChallenge(challenge, game);
                        return (
                          <li key={challenge.id}>
                            <span>{localizedChallengeTitle(challenge, language)}</span>
                            <span className="muted">{record?.passed ? t(language, 'skillTree.passed') : t(language, 'skillTree.notStarted')}</span>
                            {!record?.passed && href && <Link to={href}>{t(language, 'skillTree.openChapter')} <ArrowRight size={14} aria-hidden="true" /></Link>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="discipline-resource-links">
                    {node.questId && (
                      <Link className="btn btn-ghost" to={questPath(QUEST_LIST.find((quest) => quest.id === node.questId))}>
                        {t(language, 'skillTree.openQuest')}
                      </Link>
                    )}
                    {node.grimoire.some((id) => progress.grimoire.includes(id)) && (
                      <Link className="btn btn-ghost" to="/grimoire">
                        <BookOpen size={16} aria-hidden="true" /> {t(language, 'skillTree.openGrimoire')}
                      </Link>
                    )}
                  </div>
                </div>
                {index < selectedDiscipline.nodes.length - 1 && <span className="discipline-connector" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
        <ProgressBar
          value={masteredCount}
          max={selectedDiscipline.nodes.length}
          label={`${localizeDiscipline(selectedDiscipline.title, language)}: ${masteredCount} / ${selectedDiscipline.nodes.length} ${t(language, 'skillTree.masteredCount')}`}
        />
      </section>

      <p className="muted skill-tree-measurement">{t(language, 'skillTree.measurementNote')}</p>
      <p className="muted skill-tree-disclaimer">{t(language, 'skillTree.disclaimer')}</p>
      <Link className="btn btn-ghost" to="/profile">{t(language, 'skillTree.back')}</Link>
    </div>
  );
}
