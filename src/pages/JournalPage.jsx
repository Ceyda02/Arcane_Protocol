import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ScrollText } from 'lucide-react';
import { Button, Panel, StatusChip } from '../components/common/ui.jsx';
import { CHALLENGES, QUESTS } from '../content/index.js';
import { questStatus } from '../engine/unlockEngine.js';
import { questPath } from '../app/paths.js';
import { t } from '../i18n/index.js';
import { useGame } from '../state/GameContext.jsx';

const FINDING_KEYS = {
  'c1-events': 'events',
  'c1-ledger': 'ledger',
  'c1-timeline': 'timeline',
  'c1-timezones': 'timezones',
  'c1-shapeshifter': 'shapeshifter',
  'worm-beginner': 'worm',
  'worm-intermediate': 'worm',
  'worm-boss': 'worm',
  'trojan-beginner': 'trojan',
  'trojan-intermediate': 'trojan',
  'trojan-boss': 'trojan',
  'ransomware-beginner': 'ransomware',
  'ransomware-intermediate': 'ransomware',
  'ransomware-boss': 'ransomware',
};

export default function JournalPage() {
  const { game } = useGame();
  const navigate = useNavigate();
  const language = game.settings.language;
  const completed = game.progress.completedQuests.map((id) => QUESTS[id]).filter(Boolean);
  const active = Object.entries(game.progress.questState)
    .filter(([id, progress]) => progress.stage > 0 && !game.progress.completedQuests.includes(id))
    .map(([id, progress]) => ({ quest: QUESTS[id], progress }))
    .filter((item) => item.quest);
  const findings = Object.entries(game.progress.challengeRecords)
    .filter(([, record]) => record.passed)
    .map(([id, record]) => ({ challenge: CHALLENGES[id], id, record }))
    .filter((item) => item.challenge);
  const reviewCount = game.progress.reviewQueue.length;

  return (
    <div className="journal-page">
      <h1><ScrollText size={28} aria-hidden="true" /> {t(language, 'journal.title')}</h1>
      <p className="lead">{t(language, 'journal.subtitle')}</p>

      <Panel>
        <h2>{t(language, 'journal.active')}</h2>
        {active.length === 0 ? <p className="muted">{t(language, 'journal.noActive')}</p> : (
          <ul className="journal-list">
            {active.map(({ quest, progress }) => (
              <li key={quest.id} className="journal-entry">
                <div>
                  <h3>{quest.title}</h3>
                  <p>{quest.summary}</p>
                  <span className="muted">{t(language, 'journal.stage')}: {progress.stage + 1}</span>
                </div>
                <Button onClick={() => navigate(questPath(quest))}>{language === 'tr' ? 'Devam et' : 'Resume'}</Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2>{t(language, 'journal.completed')}</h2>
        {completed.length === 0 ? <p className="muted">{t(language, 'journal.noCompleted')}</p> : (
          <ul className="journal-list">
            {completed.map((quest) => (
              <li key={quest.id} className="journal-entry">
                <div>
                  <h3>{quest.title}</h3>
                  <p>{quest.summary}</p>
                </div>
                <StatusChip status="completed" language={language} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2>{t(language, 'journal.evidence')}</h2>
        <p className="muted">{t(language, 'journal.evidenceHelp')}</p>
        {findings.length === 0 ? <p className="muted">{t(language, 'journal.noEvidence')}</p> : (
          <ul className="journal-list journal-findings">
            {findings.map(({ id, challenge, record }) => {
              const findingKey = FINDING_KEYS[id] ?? 'generic';
              const grimoireId = challenge.grimoire;
              return (
                <li key={id} className="journal-entry">
                  <div>
                    <h3>{challenge.title}</h3>
                    <p>{t(language, `journal.finding.${findingKey}`)}</p>
                    <span className="muted">{t(language, 'journal.attempts')}: {record.attempts}</span>
                  </div>
                  {grimoireId && game.progress.grimoire.includes(grimoireId) && (
                    <Link className="journal-book-link" to="/grimoire"><BookOpen size={16} aria-hidden="true" /> {t(language, 'grimoire.title')}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel>
        <h2>{t(language, 'journal.review')}</h2>
        {reviewCount === 0 ? <p className="muted">{t(language, 'journal.emptyReview')}</p> : (
          <>
            <p>{reviewCount} {t(language, 'journal.reviewCount')}</p>
            <Button onClick={() => navigate('/review')}>{t(language, 'journal.openReview')}</Button>
          </>
        )}
      </Panel>
    </div>
  );
}
