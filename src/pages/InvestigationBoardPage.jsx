import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, Waypoints } from 'lucide-react';
import { Button, Panel } from '../components/common/ui.jsx';
import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';
import { evaluateInvestigation } from '../engine/investigationEngine.js';
import { useGame } from '../state/GameContext.jsx';
import { t } from '../i18n/index.js';

const BOARD = INVESTIGATION_BOARDS.watchtower;

export default function InvestigationBoardPage() {
  const { game, dispatch } = useGame();
  const language = game.settings.language;
  const [connections, setConnections] = useState([]);
  const [conclusionId, setConclusionId] = useState('');
  const [nextEvidenceId, setNextEvidenceId] = useState('');
  const [result, setResult] = useState(null);
  const missingChallenges = BOARD.requiredChallenges.filter((id) => !game.progress.challengeRecords[id]?.passed);
  const previous = game.progress.investigationRecords.watchtower;

  const updateConnections = (id, checked) => {
    setConnections((current) => checked ? [...current, id] : current.filter((value) => value !== id));
    setResult(null);
  };

  const submit = (event) => {
    event.preventDefault();
    const answer = { connections, conclusionId, nextEvidenceId };
    const evaluation = evaluateInvestigation(BOARD.id, answer, game.progress.challengeRecords);
    setResult(evaluation);
    if (evaluation.unlocked) dispatch({ type: 'SUBMIT_INVESTIGATION', boardId: BOARD.id, answer });
  };

  return (
    <div className="investigation-page">
      <h1><Waypoints size={28} aria-hidden="true" /> {t(language, 'investigation.title')}</h1>
      <p className="lead">{t(language, 'investigation.subtitle')}</p>

      {missingChallenges.length > 0 ? (
        <Panel>
          <h2>{t(language, 'investigation.sealed')}</h2>
          <p>{t(language, 'investigation.prerequisiteHelp')}</p>
          <ul>
            {missingChallenges.map((id) => (
              <li key={id}>{t(language, `investigation.prerequisite.${id}`)}</li>
            ))}
          </ul>
          <Link className="btn btn-primary" to="/quest/bells-of-the-silent-watch">
            <ScrollText size={18} aria-hidden="true" /> {t(language, 'investigation.returnToChapter')}
          </Link>
        </Panel>
      ) : (
        <>
          <Panel className="evidence-intro">
            <h2>{t(language, 'investigation.evidenceTitle')}</h2>
            <p>{t(language, 'investigation.evidenceHelp')}</p>
            <ul className="evidence-cards">
              {BOARD.clueIds.map((id) => (
                <li key={id} className="evidence-card">
                  <h3>{t(language, `investigation.clue.${id}.title`)}</h3>
                  <p>{t(language, `investigation.clue.${id}.body`)}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <form onSubmit={submit}>
            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.connectionsTitle')}</legend>
                <p className="muted">{t(language, 'investigation.connectionsHelp')}</p>
                <div className="board-options">
                  {BOARD.connectionIds.map((id) => (
                    <label key={id} className="board-option">
                      <input
                        type="checkbox"
                        checked={connections.includes(id)}
                        onChange={(event) => updateConnections(id, event.target.checked)}
                      />
                      <span>{t(language, `investigation.connection.${id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Panel>

            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.conclusionTitle')}</legend>
                <div className="board-options">
                  {BOARD.conclusionIds.map((id) => (
                    <label key={id} className="board-option">
                      <input
                        type="radio"
                        name="investigation-conclusion"
                        value={id}
                        checked={conclusionId === id}
                        onChange={() => { setConclusionId(id); setResult(null); }}
                      />
                      <span>{t(language, `investigation.conclusion.${id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Panel>

            <Panel>
              <fieldset className="board-fieldset">
                <legend>{t(language, 'investigation.nextEvidenceTitle')}</legend>
                <div className="board-options">
                  {BOARD.nextEvidenceIds.map((id) => (
                    <label key={id} className="board-option">
                      <input
                        type="radio"
                        name="investigation-next-evidence"
                        value={id}
                        checked={nextEvidenceId === id}
                        onChange={() => { setNextEvidenceId(id); setResult(null); }}
                      />
                      <span>{t(language, `investigation.nextEvidence.${id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button type="submit">{t(language, 'investigation.submit')}</Button>
            </Panel>
          </form>

          {result?.unlocked && (
            <Panel className={result.passed ? 'board-result is-passed' : 'board-result'}>
              <h2>{t(language, result.passed ? 'investigation.passed' : 'investigation.retry')}</h2>
              <p>{t(language, 'investigation.score')}: {Math.round(result.score * 100)}%</p>
              {result.checks && (
                <ul>
                  <li>{t(language, result.checks.connectionsCorrect ? 'investigation.feedback.connectionsOk' : 'investigation.feedback.connectionsTry')}</li>
                  <li>{t(language, result.checks.conclusionCorrect ? 'investigation.feedback.conclusionOk' : 'investigation.feedback.conclusionTry')}</li>
                  <li>{t(language, result.checks.nextEvidenceCorrect ? 'investigation.feedback.evidenceOk' : 'investigation.feedback.evidenceTry')}</li>
                </ul>
              )}
              <p className="muted">{t(language, 'investigation.noRepeatXp')}</p>
              {previous && <p className="muted">{t(language, 'investigation.attempts')}: {previous.attempts}</p>}
            </Panel>
          )}

          {previous?.passed && !result && (
            <Panel className="board-result is-passed">
              <h2>{t(language, 'investigation.alreadyPassed')}</h2>
              <p>{t(language, 'investigation.bestScore')}: {Math.round(previous.bestScore * 100)}%</p>
              <p className="muted">{t(language, 'investigation.attempts')}: {previous.attempts}</p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
